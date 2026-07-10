import type { APIRoute } from 'astro';
import { and, eq, inArray, sql } from 'drizzle-orm';
import { ZodError } from 'zod';
import { createDb } from '../../db/client.js';
import { appointments } from '../../db/schema.js';
import {
  APPOINTMENT_BLOCKING_STATUSES,
  appointmentSubmissionSchema,
  getAppointmentSlotLockKey,
  mapAppointmentToInsert,
  validateAppointmentSchedule,
} from '../../lib/appointments.js';
import {
  getAnalyticsContext,
  sendMetaCAPIEvent,
} from '../../lib/analytics.ts';

export const prerender = false;

const ALLOWED_ORIGINS = [
  'https://ruqyahhealing.com',
  'https://ruqyah-healing.pages.dev',
  'https://ruqyah-healing.rahmatullahzisan.workers.dev',
];

const SLOT_TAKEN = 'APPOINTMENT_SLOT_TAKEN';
const TRANSACTION_USED = 'APPOINTMENT_TRANSACTION_USED';

async function getRuntimeEnv() {
  try {
    const workerModule = await import('cloudflare:workers');
    if (workerModule?.env) return workerModule.env;
  } catch {
    // Ignore unsupported cloudflare: protocol in plain Node tests.
  }

  return (globalThis as any).process?.env;
}

function getCorsOrigin(request: Request): string {
  const origin = request.headers.get('Origin') || '';
  if (ALLOWED_ORIGINS.includes(origin)) return origin;
  if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) return origin;
  return ALLOWED_ORIGINS[0];
}

function json(request: Request, payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Access-Control-Allow-Origin': getCorsOrigin(request),
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json',
      Vary: 'Origin',
    },
  });
}

function getClientIp(request: Request): string | undefined {
  return (
    request.headers.get('cf-connecting-ip') ||
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    undefined
  );
}

function runAfterResponse(locals: App.Locals | undefined, task: Promise<unknown>) {
  const waitUntil = (locals as any)?.cfContext?.waitUntil;
  if (typeof waitUntil === 'function') {
    waitUntil.call((locals as any).cfContext, task);
    return;
  }

  task.catch((error) => {
    console.error('[Appointments API] Background task failed:', error);
  });
}

export const OPTIONS: APIRoute = async ({ request }) =>
  new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': getCorsOrigin(request),
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      Vary: 'Origin',
    },
  });

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const env = await getRuntimeEnv();
    const databaseUrl = env?.DATABASE_URL;

    if (!databaseUrl) {
      return json(
        request,
        {
          error: 'DATABASE_URL not configured',
          message: 'সার্ভারে ডাটাবেজ কনফিগার করা হয়নি। অনুগ্রহ করে পরে আবার চেষ্টা করুন।',
        },
        500,
      );
    }

    const body = await request.json();
    const parsed = appointmentSubmissionSchema.parse(body);
    const scheduleError = validateAppointmentSchedule(parsed.preferredDate, parsed.preferredTime);
    if (scheduleError) {
      return json(request, { error: 'validation_error', message: scheduleError }, 400);
    }

    const db = createDb(databaseUrl);
    const insertRow = mapAppointmentToInsert(parsed, 'web');
    const slotLockKey = getAppointmentSlotLockKey(parsed.preferredDate, parsed.preferredTime);
    const paymentLockKey = `appointment-payment:${parsed.paymentMethod}:${parsed.transactionId.toLowerCase()}`;

    try {
      await db.transaction(async (tx: any) => {
        await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${slotLockKey}))`);
        await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${paymentLockKey}))`);

        const [slotConflict] = await tx
          .select({ id: appointments.id })
          .from(appointments)
          .where(and(
            eq(appointments.preferredDate, parsed.preferredDate),
            eq(appointments.preferredTime, parsed.preferredTime),
            inArray(appointments.status, APPOINTMENT_BLOCKING_STATUSES),
          ))
          .limit(1);
        if (slotConflict) throw new Error(SLOT_TAKEN);

        const [transactionConflict] = await tx
          .select({ id: appointments.id })
          .from(appointments)
          .where(and(
            eq(appointments.paymentMethod, parsed.paymentMethod),
            sql`lower(${appointments.transactionId}) = lower(${parsed.transactionId})`,
          ))
          .limit(1);
        if (transactionConflict) throw new Error(TRANSACTION_USED);

        await tx.insert(appointments).values(insertRow);
      });
    } catch (error) {
      if (error instanceof Error && error.message === SLOT_TAKEN) {
        return json(
          request,
          {
            error: 'slot_unavailable',
            message: 'এই সময়টি ইতোমধ্যে বুক হয়েছে। অনুগ্রহ করে অন্য সময় নির্বাচন করুন।',
          },
          409,
        );
      }
      if (error instanceof Error && error.message === TRANSACTION_USED) {
        return json(
          request,
          {
            error: 'transaction_already_used',
            message: 'এই Trx ID দিয়ে আগে একটি বুকিং জমা হয়েছে। ভুল হলে আমাদের সাথে যোগাযোগ করুন।',
          },
          409,
        );
      }
      throw error;
    }

    const eventId = parsed.eventId || `lead-${insertRow.id}`;
    const capiPromise = sendMetaCAPIEvent(
      'Lead',
      {
        content_category: 'ruqyah_booking',
        content_name: parsed.treatmentTypeLabel,
        currency: 'BDT',
        value: 500,
      },
      {
        ...getAnalyticsContext(request, getClientIp(request)),
        externalId: insertRow.id,
        phone: parsed.phone,
      },
      {
        eventId,
        env,
      },
    );
    runAfterResponse(locals, capiPromise);

    return json(
      request,
      {
        ok: true,
        appointmentId: insertRow.id,
        eventId,
        message: 'আপনার বুকিং তথ্য ডাটাবেজে সংরক্ষণ করা হয়েছে।',
      },
      200,
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return json(
        request,
        {
          error: 'validation_error',
          message: error.issues[0]?.message || 'ফর্মের কিছু তথ্য সঠিক নয়। অনুগ্রহ করে আবার যাচাই করুন।',
          details: error.issues,
        },
        400,
      );
    }

    console.error('[Appointments API] Failed to save appointment:', error);
    return json(
      request,
      {
        error: 'save_failed',
        message:
          'এই মুহূর্তে বুকিং ডাটাবেজে সংরক্ষণ করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন বা WhatsApp-এ যোগাযোগ করুন।',
      },
      500,
    );
  }
};
