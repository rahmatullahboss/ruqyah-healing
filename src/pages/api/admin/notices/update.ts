import type { APIRoute } from 'astro';
import { createDb } from '../../../../db/client.js';
import { notices } from '../../../../db/schema.js';
import { eq } from 'drizzle-orm';
import { env as workerEnv } from 'cloudflare:workers';
import { logAuditEvent } from '../../../../lib/audit.js';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 });
  }

  const env = (workerEnv || process.env) as any;
  const db = createDb(env.DATABASE_URL);
  const body = await request.json() as any;

  await db.update(notices).set({
    title: body.title,
    description: body.description,
    icon: body.icon,
    badge: body.badge,
    badgeColor: body.badgeColor,
    eventDate: body.eventDate,
    urgent: body.urgent || false,
    published: body.published !== false,
    updatedAt: new Date(),
  }).where(eq(notices.id, body.id));

  await logAuditEvent(db, {
    adminId: locals.user.id,
    adminName: locals.user.fullName,
    action: 'update',
    entityType: 'notice',
    entityId: body.id,
    details: { title: body.title },
  });

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
