import { ZodError } from 'zod';
import { createDb } from '../../src/db/client.js';
import { appointments } from '../../src/db/schema.js';
import {
  appointmentSubmissionSchema,
  mapAppointmentToInsert,
} from '../../src/lib/appointments.js';

const ALLOWED_ORIGINS = [
  'https://ruqyahhealing.com',
  'https://ruqyah-healing.pages.dev',
];

function getCorsOrigin(request?: Request): string {
  const origin = request?.headers?.get?.('Origin') || '';
  if (ALLOWED_ORIGINS.includes(origin)) return origin;
  if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) return origin;
  return ALLOWED_ORIGINS[0];
}

function json(obj: unknown, status = 200, request?: Request) {
  const origin = request ? getCorsOrigin(request) : ALLOWED_ORIGINS[0];
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json',
    },
  });
}

export function onRequestOptions(context: any) {
  const origin = getCorsOrigin(context.request);
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function onRequestPost(context: any) {
  try {
    const databaseUrl = context.env?.DATABASE_URL;

    if (!databaseUrl) {
      return json(
        {
          error: 'DATABASE_URL not configured',
          message: 'সার্ভারে ডাটাবেজ কনফিগার করা হয়নি। অনুগ্রহ করে পরে আবার চেষ্টা করুন।',
        },
        500,
        context.request
      );
    }

    const body = await context.request.json();
    const parsed = appointmentSubmissionSchema.parse(body);
    const db = createDb(databaseUrl);
    const insertRow = mapAppointmentToInsert(parsed, 'web');

    await db.insert(appointments).values(insertRow);

    return json({
      ok: true,
      appointmentId: insertRow.id,
      message: 'আপনার বুকিং তথ্য ডাটাবেজে সংরক্ষণ করা হয়েছে।',
    }, 200, context.request);
  } catch (error) {
    if (error instanceof ZodError) {
      return json(
        {
          error: 'validation_error',
          message: 'ফর্মের কিছু তথ্য সঠিক নয়। অনুগ্রহ করে আবার যাচাই করুন।',
          details: error.issues,
        },
        400,
        context.request
      );
    }

    console.error('[Appointments API] Failed to save appointment:', error);
    return json(
      {
        error: 'save_failed',
        message:
          'এই মুহূর্তে বুকিং ডাটাবেজে সংরক্ষণ করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন বা WhatsApp-এ যোগাযোগ করুন।',
      },
      500,
      context.request
    );
  }
}
