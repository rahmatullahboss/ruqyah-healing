import { createDb } from '../../../../db/client.js';
import { appointments, auditLogs } from '../../../../db/schema.js';
import { inArray } from 'drizzle-orm';

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

    const { ids, status } = (await request.json()) as { ids: string[]; status: string };

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return new Response(JSON.stringify({ error: 'No appointment IDs provided' }), { status: 400 });
    }

    if (ids.length > 100) {
      return new Response(JSON.stringify({ error: 'Maximum 100 items per batch' }), { status: 400 });
    }

    if (!status || !['pending', 'confirmed', 'completed', 'cancelled'].includes(status)) {
      return new Response(JSON.stringify({ error: 'Invalid status value' }), { status: 400 });
    }

    const db = createDb(env.DATABASE_URL);

    await db.update(appointments)
      .set({ status })
      .where(inArray(appointments.id, ids));

    // Batch insert all audit logs at once (replaces N+1 loop)
    const auditEntries = ids.map(id => ({
      id: crypto.randomUUID(),
      adminId: adminUser.id || 'unknown',
      adminName: adminUser.fullName || 'Admin',
      action: `status_change_to_${status}`,
      entityType: 'appointment',
      entityId: id,
      details: { newStatus: status, bulkCount: ids.length },
    }));

    if (auditEntries.length > 0) {
      await db.insert(auditLogs).values(auditEntries);
    }

    return new Response(JSON.stringify({ success: true, count: ids.length }), { status: 200 });

  } catch (error) {
    console.error('Bulk status update error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
