import type { APIRoute } from 'astro';
import { z } from 'zod';
import { createDb } from '../../../../db/client.js';
import { resources } from '../../../../db/schema.js';
import { env as workerEnv } from 'cloudflare:workers';
import { logAuditEvent } from '../../../../lib/audit.js';

export const prerender = false;

const resourceSchema = z.object({
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional().default(''),
  fileUrl: z.string().max(500).optional().default(''),
  pages: z.number().int().min(0).max(99999).optional().default(0),
  fileSize: z.string().max(50).optional().default(''),
  category: z.string().trim().max(100).optional().default('গাইড'),
  language: z.string().trim().max(50).optional().default('বাংলা'),
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
  const parsed = resourceSchema.safeParse(raw);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: 'Validation failed', details: parsed.error.issues }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const body = parsed.data;

  const id = crypto.randomUUID();
  await db.insert(resources).values({
    id,
    title: body.title,
    description: body.description,
    fileUrl: body.fileUrl,
    pages: body.pages,
    fileSize: body.fileSize,
    category: body.category,
    language: body.language,
    published: body.published,
  });

  await logAuditEvent(db, {
    adminId: locals.user.id,
    adminName: locals.user.fullName,
    action: 'create',
    entityType: 'resource',
    entityId: id,
    details: { title: body.title },
  });

  return new Response(JSON.stringify({ success: true, id }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
