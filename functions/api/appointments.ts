import { ZodError } from 'zod';
import { createDb } from '../../src/db/client.js';
import { appointments } from '../../src/db/schema.js';
import {
  appointmentSubmissionSchema,
  mapAppointmentToInsert,
} from '../../src/lib/appointments.js';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function json(obj: unknown, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

export function onRequestOptions() {
  return new Response(null, { status: 204, headers: CORS });
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
        500
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
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return json(
        {
          error: 'validation_error',
          message: 'ফর্মের কিছু তথ্য সঠিক নয়। অনুগ্রহ করে আবার যাচাই করুন।',
          details: error.issues,
        },
        400
      );
    }

    console.error('[Appointments API] Failed to save appointment:', error);
    return json(
      {
        error: 'save_failed',
        message:
          'এই মুহূর্তে বুকিং ডাটাবেজে সংরক্ষণ করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন বা WhatsApp-এ যোগাযোগ করুন।',
      },
      500
    );
  }
}
