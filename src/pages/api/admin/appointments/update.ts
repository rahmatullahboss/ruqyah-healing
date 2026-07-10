import { createDb } from '../../../../db/client.js';
import { appointments } from '../../../../db/schema.js';
import { and, eq, inArray, ne, sql } from 'drizzle-orm';
import { z } from 'zod';
import { logAuditEvent } from '../../../../lib/audit.js';
import {
  APPOINTMENT_BLOCKING_STATUSES,
  getAppointmentSlotLockKey,
  isAppointmentSlotBlockingStatus,
  normalizeBangladeshPhone,
  validateAppointmentSchedule,
} from '../../../../lib/appointments.js';

export const prerender = false;

import type { APIRoute } from 'astro';

import { env as workerEnv } from 'cloudflare:workers';

const updateSchema = z.object({
  id: z.string().trim().min(1),
  status: z.enum(['pending', 'confirmed', 'completed', 'cancelled']),
  cancelReason: z.string().trim().max(1000).optional(),
  adminNotes: z.string().trim().max(5000).optional(),
  preferredDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  preferredTime: z.string().trim().max(50).optional(),
  phone: z.string().trim().transform(normalizeBangladeshPhone).refine((value) => /^01[3-9]\d{8}$/.test(value), 'Invalid phone').optional(),
  whatsapp: z.union([
    z.literal(''),
    z.string().trim().transform(normalizeBangladeshPhone).refine((value) => /^01[3-9]\d{8}$/.test(value), 'Invalid WhatsApp phone'),
  ]).optional(),
  address: z.string().trim().min(3).max(1000).optional(),
});

const SLOT_TAKEN = 'APPOINTMENT_SLOT_TAKEN';

export const POST: APIRoute = async ({ request, locals }) => {
  const env = workerEnv || process.env;

  try {
    const adminUser = locals.user;

    if (!adminUser || adminUser.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 });
    }

    const parsed = updateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: 'Invalid appointment data', details: parsed.error.issues }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const body = parsed.data;

    const db = createDb(env.DATABASE_URL);
    const [existing] = await db.select().from(appointments).where(eq(appointments.id, body.id)).limit(1);
    if (!existing) {
      return new Response(JSON.stringify({ error: 'Appointment not found' }), { status: 404 });
    }

    const updateData: Record<string, any> = { status: body.status };
    if (body.cancelReason !== undefined) updateData.cancelReason = body.cancelReason;
    if (body.adminNotes !== undefined) updateData.adminNotes = body.adminNotes;
    if (body.preferredDate !== undefined) updateData.preferredDate = body.preferredDate;
    if (body.preferredTime !== undefined) updateData.preferredTime = body.preferredTime;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.whatsapp !== undefined) updateData.whatsapp = body.whatsapp;
    if (body.address !== undefined) updateData.address = body.address;

    const targetDate = body.preferredDate ?? existing.preferredDate;
    const targetTime = body.preferredTime ?? existing.preferredTime;
    const shouldReserveSlot = isAppointmentSlotBlockingStatus(body.status)
      && (body.preferredDate !== undefined
        || body.preferredTime !== undefined
        || !isAppointmentSlotBlockingStatus(existing.status));

    if (shouldReserveSlot) {
      if (body.status === 'pending' || body.status === 'confirmed') {
        const scheduleError = validateAppointmentSchedule(targetDate, targetTime);
        if (scheduleError) {
          return new Response(JSON.stringify({ error: 'Invalid schedule', message: scheduleError }), { status: 400 });
        }
      }

      try {
        await db.transaction(async (tx: any) => {
          await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${getAppointmentSlotLockKey(targetDate, targetTime)}))`);
          const [conflict] = await tx
            .select({ id: appointments.id })
            .from(appointments)
            .where(and(
              eq(appointments.preferredDate, targetDate),
              eq(appointments.preferredTime, targetTime),
              inArray(appointments.status, APPOINTMENT_BLOCKING_STATUSES),
              ne(appointments.id, body.id),
            ))
            .limit(1);
          if (conflict) throw new Error(SLOT_TAKEN);
          await tx.update(appointments).set(updateData).where(eq(appointments.id, body.id));
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
      await db.update(appointments).set(updateData).where(eq(appointments.id, body.id));
    }

    await logAuditEvent(db, {
      adminId: adminUser.id || 'unknown',
      adminName: adminUser.fullName || 'Admin',
      action: 'update',
      entityType: 'appointment',
      entityId: body.id,
      details: { updatedFields: Object.keys(updateData), newStatus: body.status },
    });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Appointment update error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
