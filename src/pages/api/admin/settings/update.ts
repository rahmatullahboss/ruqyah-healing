import type { APIRoute } from 'astro';
import { createDb } from '../../../../db/client.js';
import { siteSettings } from '../../../../db/schema.js';
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
  const body = await request.json() as Record<string, any>;

  // body is { key: value, key: value, ... }
  for (const [key, value] of Object.entries(body)) {
    await db.insert(siteSettings)
      .values({ key, value: value as any, updatedAt: new Date() })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: { value: value as any, updatedAt: new Date() },
      });
  }

  await logAuditEvent(db, {
    adminId: locals.user.id,
    adminName: locals.user.fullName,
    action: 'update',
    entityType: 'settings',
    entityId: 'site_settings',
    details: { keys: Object.keys(body) },
  });

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
