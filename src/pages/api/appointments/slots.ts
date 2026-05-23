import type { APIRoute } from 'astro';
import { eq } from 'drizzle-orm';
import { createDb } from '../../../db/client.js';
import { appointments } from '../../../db/schema.js';
import { preferredTimeSlots } from '../../../data/clinic.js';
import { buildAppointmentSlotStates } from '../../../lib/appointments.js';

export const prerender = false;

async function getRuntimeEnv() {
  try {
    const workerModule = await import('cloudflare:workers');
    if (workerModule?.env) return workerModule.env;
  } catch {
    // Ignore unsupported cloudflare: protocol in plain Node tests.
  }

  return (globalThis as any).process?.env;
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json',
    },
  });
}

export const GET: APIRoute = async ({ request }) => {
  const url = new URL(request.url);
  const date = url.searchParams.get('date')?.trim() || '';

  if (!date) {
    return json({
      date: '',
      timezone: 'Asia/Dhaka',
      slots: buildAppointmentSlotStates(preferredTimeSlots, [], ''),
    });
  }

  const env = await getRuntimeEnv();
  const databaseUrl = env?.DATABASE_URL;

  if (!databaseUrl) {
    return json(
      {
        error: 'DATABASE_URL not configured',
        message: 'স্লট তথ্য লোড করা যায়নি। অনুগ্রহ করে WhatsApp-এ সময় নিশ্চিত করুন।',
      },
      500,
    );
  }

  const db = createDb(databaseUrl);
  const appointmentRows = await db
    .select({
      preferredDate: appointments.preferredDate,
      preferredTime: appointments.preferredTime,
      status: appointments.status,
    })
    .from(appointments)
    .where(eq(appointments.preferredDate, date));

  return json({
    date,
    timezone: 'Asia/Dhaka',
    slots: buildAppointmentSlotStates(preferredTimeSlots, appointmentRows, date),
  });
};
