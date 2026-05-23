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

    if (!adminUser || adminUser.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const body = (await request.json()) as {
      id: string;
      status: string;
      cancelReason?: string;
      adminNotes?: string;
      preferredDate?: string;
      preferredTime?: string;
      phone?: string;
      whatsapp?: string;
      address?: string;
    };

    const { id, status } = body;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Appointment ID is required' }), { status: 400 });
    }

    if (!status || !['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return new Response(JSON.stringify({ error: 'Invalid status value' }), { status: 400 });
    }

    const db = createDb(env.DATABASE_URL);

    const updateData: Record<string, any> = {
      status,
    };

    if (body.cancelReason !== undefined) updateData.cancelReason = body.cancelReason;
    if (body.adminNotes !== undefined) updateData.adminNotes = body.adminNotes;
    if (body.preferredDate !== undefined) updateData.preferredDate = body.preferredDate;
    if (body.preferredTime !== undefined) updateData.preferredTime = body.preferredTime;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.whatsapp !== undefined) updateData.whatsapp = body.whatsapp;
    if (body.address !== undefined) updateData.address = body.address;

    await db.update(appointments)
      .set(updateData)
      .where(eq(appointments.id, id));

    await logAuditEvent(db, {
      adminId: adminUser.id || 'unknown',
      adminName: adminUser.fullName || 'Admin',
      action: 'update',
      entityType: 'appointment',
      entityId: id,
      details: { updatedFields: Object.keys(updateData), newStatus: status },
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    console.error('Appointment update error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
