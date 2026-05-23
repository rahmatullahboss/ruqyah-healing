import type { APIRoute } from 'astro';
import { z } from 'zod';
import { createDb } from '../../../../db/client.js';
import { notices } from '../../../../db/schema.js';
import { env as workerEnv } from 'cloudflare:workers';
import { logAuditEvent } from '../../../../lib/audit.js';

export const prerender = false;

const noticeSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(5000),
  icon: z.string().max(10).optional().default('📢'),
  badge: z.string().max(50).optional().default('নোটিশ'),
  badgeColor: z.string().max(50).optional().default('event'),
  eventDate: z.string().min(1).max(100),
  urgent: z.boolean().optional().default(false),
  published: z.boolean().optional().default(true),
});

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 });
  }

  const env = (workerEnv || process.env) as any;
  const db = createDb(env.DATABASE_URL);

  const raw = await request.json();
  const parsed = noticeSchema.safeParse(raw);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: 'Validation failed', details: parsed.error.issues }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const body = parsed.data;

  const id = crypto.randomUUID();
  await db.insert(notices).values({
    id,
    title: body.title,
    description: body.description,
    icon: body.icon,
    badge: body.badge,
    badgeColor: body.badgeColor,
    eventDate: body.eventDate,
    urgent: body.urgent,
    published: body.published,
  });

  await logAuditEvent(db, {
    adminId: locals.user.id,
    adminName: locals.user.fullName,
    action: 'create',
    entityType: 'notice',
    entityId: id,
    details: { title: body.title },
  });

  return new Response(JSON.stringify({ success: true, id }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
