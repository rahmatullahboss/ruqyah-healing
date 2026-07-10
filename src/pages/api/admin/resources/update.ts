import type { APIRoute } from 'astro';
import { z } from 'zod';
import { createDb } from '../../../../db/client.js';
import { resources } from '../../../../db/schema.js';
import { eq } from 'drizzle-orm';
import { env as workerEnv } from 'cloudflare:workers';
import { logAuditEvent } from '../../../../lib/audit.js';

export const prerender = false;

const resourceUpdateSchema = z.object({
  id: z.string().trim().min(1),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional(),
  fileUrl: z.string().max(500).optional(),
  pages: z.number().int().min(0).max(99999).optional(),
  fileSize: z.string().max(50).optional(),
  category: z.string().trim().max(100).optional(),
  language: z.string().trim().max(50).optional(),
  published: z.boolean().optional(),
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Cache-Control': 'no-store', 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user || user.role !== 'admin') return json({ error: 'Unauthorized' }, 403);

  try {
    const parsed = resourceUpdateSchema.safeParse(await request.json());
    if (!parsed.success) return json({ error: 'Validation failed', details: parsed.error.issues }, 400);

    const body = parsed.data;
    const env = (workerEnv || process.env) as any;
    const db = createDb(env.DATABASE_URL);
    const r2 = env.R2_IMAGES;
    const [oldResource] = await db.select().from(resources).where(eq(resources.id, body.id)).limit(1);
    if (!oldResource) return json({ error: 'Resource not found' }, 404);

    const nextFileUrl = body.fileUrl ?? oldResource.fileUrl;
    await db.update(resources).set({
      title: body.title,
      description: body.description ?? oldResource.description,
      fileUrl: nextFileUrl,
      pages: body.pages ?? oldResource.pages,
      fileSize: body.fileSize ?? oldResource.fileSize,
      category: body.category ?? oldResource.category,
      language: body.language ?? oldResource.language,
      published: body.published ?? oldResource.published,
    }).where(eq(resources.id, body.id));

    if (oldResource.fileUrl && oldResource.fileUrl !== nextFileUrl && oldResource.fileUrl.startsWith('/api/images/') && r2) {
      const key = oldResource.fileUrl.slice('/api/images/'.length);
      await r2.delete(key).catch((error: unknown) => console.error('Old resource cleanup failed:', error));
    }

    await logAuditEvent(db, {
      adminId: user.id,
      adminName: user.fullName,
      action: 'update',
      entityType: 'resource',
      entityId: body.id,
      details: { title: body.title },
    });

    return json({ success: true });
  } catch (error) {
    console.error('Resource update error:', error);
    return json({ error: 'Server error' }, 500);
  }
};
