import { createDb } from '../../../../db/client.js';
import { appointments, auditLogs } from '../../../../db/schema.js';
import { and, eq, inArray, notInArray, sql } from 'drizzle-orm';
import { z } from 'zod';
import {
  APPOINTMENT_BLOCKING_STATUSES,
  getAppointmentSlotLockKey,
  isAppointmentSlotBlockingStatus,
  validateAppointmentSchedule,
} from '../../../../lib/appointments.js';

export const prerender = false;

import type { APIRoute } from 'astro';

import { env as workerEnv } from 'cloudflare:workers';

const requestSchema = z.object({
  ids: z.array(z.string().trim().min(1)).min(1).max(100).transform((ids) => [...new Set(ids)]),
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']),
});
const SLOT_TAKEN = 'APPOINTMENT_SLOT_TAKEN';

export const POST: APIRoute = async ({ request, locals }) => {
  const env = workerEnv || process.env;

  try {
    const adminUser = locals.user;
    if (!adminUser || adminUser.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 });
    }

    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: 'Invalid bulk update request', details: parsed.error.issues }), { status: 400 });
    }
    const { ids, status } = parsed.data;
    const db = createDb(env.DATABASE_URL);
    const rows = await db.select().from(appointments).where(inArray(appointments.id, ids));
    if (rows.length !== ids.length) {
      return new Response(JSON.stringify({ error: 'One or more appointments were not found' }), { status: 404 });
    }

    const rowsToReserve = isAppointmentSlotBlockingStatus(status)
      ? rows.filter((row) => !isAppointmentSlotBlockingStatus(row.status))
      : [];

    const slotKeys = rowsToReserve.map((row) => getAppointmentSlotLockKey(row.preferredDate, row.preferredTime));
    if (new Set(slotKeys).size !== slotKeys.length) {
      return new Response(JSON.stringify({
        error: 'slot_unavailable',
        message: 'নির্বাচিত বুকিংগুলোর মধ্যে একই তারিখ ও সময় রয়েছে।',
      }), { status: 409, headers: { 'Content-Type': 'application/json' } });
    }

    if (status === 'pending' || status === 'confirmed') {
      for (const row of rowsToReserve) {
        const scheduleError = validateAppointmentSchedule(row.preferredDate, row.preferredTime);
        if (scheduleError) {
          return new Response(JSON.stringify({ error: 'Invalid schedule', message: scheduleError, appointmentId: row.id }), { status: 400 });
        }
      }
    }

    const auditEntries = ids.map((id) => ({
      id: crypto.randomUUID(),
      adminId: adminUser.id || 'unknown',
      adminName: adminUser.fullName || 'Admin',
      action: `status_change_to_${status}`,
      entityType: 'appointment',
      entityId: id,
      details: { newStatus: status, bulkCount: ids.length },
    }));

    try {
      await db.transaction(async (tx: any) => {
        for (const lockKey of [...new Set(slotKeys)].sort()) {
          await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${lockKey}))`);
        }

        for (const row of rowsToReserve) {
          const [conflict] = await tx
            .select({ id: appointments.id })
            .from(appointments)
            .where(and(
              eq(appointments.preferredDate, row.preferredDate),
              eq(appointments.preferredTime, row.preferredTime),
              inArray(appointments.status, APPOINTMENT_BLOCKING_STATUSES),
              notInArray(appointments.id, ids),
            ))
            .limit(1);
          if (conflict) throw new Error(SLOT_TAKEN);
        }

        await tx.update(appointments).set({ status }).where(inArray(appointments.id, ids));
        if (auditEntries.length > 0) await tx.insert(auditLogs).values(auditEntries);
      });
    } catch (error) {
      if (error instanceof Error && error.message === SLOT_TAKEN) {
        return new Response(JSON.stringify({
          error: 'slot_unavailable',
          message: 'এক বা একাধিক সময় অন্য বুকিংয়ে ব্যবহৃত হচ্ছে।',
        }), { status: 409, headers: { 'Content-Type': 'application/json' } });
      }
      throw error;
    }

    return new Response(JSON.stringify({ success: true, count: ids.length }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Bulk status update error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
