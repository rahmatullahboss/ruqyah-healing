import type { APIRoute } from 'astro';
import { createDb } from '../../../../db/client.js';
import { resources } from '../../../../db/schema.js';
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
  const r2 = env.R2_IMAGES;
  const body = await request.json() as any;

  const oldRes = await db.select().from(resources).where(eq(resources.id, body.id));
  if (oldRes.length > 0) {
    const oldUrl = oldRes[0].fileUrl;
    if (body.fileUrl !== undefined && oldUrl && oldUrl !== body.fileUrl && oldUrl.startsWith('/api/images/') && r2) {
      const key = oldUrl.replace('/api/images/', '');
      await r2.delete(key).catch(console.error);
    }
  }

  await db.update(resources).set({
    title: body.title,
    description: body.description,
    fileUrl: body.fileUrl || '',
    pages: Number(body.pages) || 0,
    fileSize: body.fileSize || '',
    category: body.category || 'গাইড',
    language: body.language || 'বাংলা',
    published: body.published !== false,
  }).where(eq(resources.id, body.id));

  await logAuditEvent(db, {
    adminId: locals.user.id,
    adminName: locals.user.fullName,
    action: 'update',
    entityType: 'resource',
    entityId: body.id,
    details: { title: body.title },
  });

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
