import { createDb } from '../../../../db/client.js';
import { appointments } from '../../../../db/schema.js';
import { and, eq, inArray, ne, sql } from 'drizzle-orm';
import { z } from 'zod';
import { logAuditEvent } from '../../../../lib/audit.js';
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
  apptId: z.string().trim().min(1),
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled', 'সম্পন্ন']),
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
      return new Response(JSON.stringify({ error: 'Invalid input data', details: parsed.error.issues }), { status: 400 });
    }

    const canonicalStatus = parsed.data.status === 'সম্পন্ন' ? 'completed' : parsed.data.status;
    const db = createDb(env.DATABASE_URL);
    const [existing] = await db.select().from(appointments).where(eq(appointments.id, parsed.data.apptId)).limit(1);
    if (!existing) {
      return new Response(JSON.stringify({ error: 'Appointment not found' }), { status: 404 });
    }

    const shouldReserveSlot = isAppointmentSlotBlockingStatus(canonicalStatus)
      && !isAppointmentSlotBlockingStatus(existing.status);

    if (shouldReserveSlot) {
      if (canonicalStatus === 'pending' || canonicalStatus === 'confirmed') {
        const scheduleError = validateAppointmentSchedule(existing.preferredDate, existing.preferredTime);
        if (scheduleError) {
          return new Response(JSON.stringify({ error: 'Invalid schedule', message: scheduleError }), { status: 400 });
        }
      }

      try {
        await db.transaction(async (tx: any) => {
          await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${getAppointmentSlotLockKey(existing.preferredDate, existing.preferredTime)}))`);
          const [conflict] = await tx
            .select({ id: appointments.id })
            .from(appointments)
            .where(and(
              eq(appointments.preferredDate, existing.preferredDate),
              eq(appointments.preferredTime, existing.preferredTime),
              inArray(appointments.status, APPOINTMENT_BLOCKING_STATUSES),
              ne(appointments.id, existing.id),
            ))
            .limit(1);
          if (conflict) throw new Error(SLOT_TAKEN);
          await tx.update(appointments).set({ status: canonicalStatus }).where(eq(appointments.id, existing.id));
        });
      } catch (error) {
        if (error instanceof Error && error.message === SLOT_TAKEN) {
          return new Response(JSON.stringify({
            error: 'slot_unavailable',
            message: 'এই সময়টি অন্য একটি বুকিংয়ে ব্যবহৃত হচ্ছে।',
          }), { status: 409, headers: { 'Content-Type': 'application/json' } });
        }
        throw error;
      }
    } else {
      await db.update(appointments)
        .set({ status: canonicalStatus })
        .where(eq(appointments.id, existing.id));
    }

    await logAuditEvent(db, {
      adminId: adminUser.id,
      adminName: adminUser.fullName,
      action: 'status_change',
      entityType: 'appointment',
      entityId: existing.id,
      details: { previousStatus: existing.status, newStatus: canonicalStatus },
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Appointment status update error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
