import { createDb } from '../../../../db/client.js';
import { appointments } from '../../../../db/schema.js';
import { eq } from 'drizzle-orm';
import { logAuditEvent } from '../../../../lib/audit.js';

export const prerender = false;

import type { APIRoute } from 'astro';

import { env as workerEnv } from 'cloudflare:workers';

export const POST: APIRoute = async ({ request, locals }) => {
  const env = workerEnv || process.env;
  
  try {
    const adminUser = locals.user;
    
    // Authorization check
    if (!adminUser || adminUser.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { apptId, status } = (await request.json()) as { apptId: string, status: string };

    if (!apptId || !status || !['pending', 'confirmed', 'completed', 'cancelled', 'সম্পন্ন'].includes(status)) {
      return new Response(JSON.stringify({ error: 'Invalid input data' }), { status: 400 });
    }

    const db = createDb(env.DATABASE_URL);

    await db.update(appointments)
      .set({ status })
      .where(eq(appointments.id, apptId));

    await logAuditEvent(db, {
      adminId: adminUser.id,
      adminName: adminUser.fullName,
      action: 'status_change',
      entityType: 'appointment',
      entityId: apptId,
      details: { newStatus: status },
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    console.error('Appointment status update error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
