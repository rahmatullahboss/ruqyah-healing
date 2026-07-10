import type { APIRoute } from 'astro';
import { z } from 'zod';
import { createDb } from '../../../../db/client.js';
import { notices } from '../../../../db/schema.js';
import { eq } from 'drizzle-orm';
import { env as workerEnv } from 'cloudflare:workers';
import { logAuditEvent } from '../../../../lib/audit.js';

export const prerender = false;

const noticeUpdateSchema = z.object({
  id: z.string().trim().min(1),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().min(1).max(5000),
  icon: z.string().max(10).optional().default('📢'),
  badge: z.string().max(50).optional().default('নোটিশ'),
  badgeColor: z.string().max(50).optional().default('event'),
  eventDate: z.string().min(1).max(100),
  urgent: z.boolean().optional().default(false),
  published: z.boolean().optional().default(true),
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user || user.role !== 'admin') return json({ error: 'Unauthorized' }, 403);

  try {
    const parsed = noticeUpdateSchema.safeParse(await request.json());
    if (!parsed.success) {
      return json({ error: 'Validation failed', details: parsed.error.issues }, 400);
    }
    const body = parsed.data;
    const env = (workerEnv || process.env) as any;
    const db = createDb(env.DATABASE_URL);

    const [existing] = await db.select({ id: notices.id }).from(notices).where(eq(notices.id, body.id)).limit(1);
    if (!existing) return json({ error: 'Notice not found' }, 404);

    await db.update(notices).set({
      title: body.title,
      description: body.description,
      icon: body.icon,
      badge: body.badge,
      badgeColor: body.badgeColor,
      eventDate: body.eventDate,
      urgent: body.urgent,
      published: body.published,
    }).where(eq(notices.id, body.id));

    await logAuditEvent(db, {
      adminId: user.id,
      adminName: user.fullName,
      action: 'update',
      entityType: 'notice',
      entityId: body.id,
      details: { title: body.title },
    });

    return json({ success: true });
  } catch (error) {
    console.error('Notice update error:', error);
    return json({ error: 'Server error' }, 500);
  }
};
