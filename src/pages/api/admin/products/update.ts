import type { APIRoute } from 'astro';
import { z } from 'zod';
import { createDb } from '../../../../db/client.js';
import { products } from '../../../../db/schema.js';
import { eq } from 'drizzle-orm';
import { env as workerEnv } from 'cloudflare:workers';
import { logAuditEvent } from '../../../../lib/audit.js';

export const prerender = false;

const productUpdateSchema = z.object({
  id: z.string().trim().min(1),
  name: z.string().trim().min(1).max(200),
  nameEn: z.string().trim().max(200).optional(),
  description: z.string().trim().max(2000).optional(),
  price: z.number().min(0).optional(),
  rating: z.number().min(0).max(5).optional(),
  benefit: z.string().trim().max(2000).optional(),
  image: z.string().max(500).optional(),
  category: z.string().trim().max(100).optional(),
  badge: z.string().trim().max(50).optional(),
  published: z.boolean().optional(),
});

export const POST: APIRoute = async ({ request, locals }) => {
  const user = locals.user;
  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 });
  }

  const env = (workerEnv || process.env) as any;
  const db = createDb(env.DATABASE_URL);
  const r2 = env.R2_IMAGES;

  const raw = await request.json();
  const parsed = productUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: 'Validation failed', details: parsed.error.issues }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const body = parsed.data;

  const oldProductRes = await db.select().from(products).where(eq(products.id, body.id));
  if (oldProductRes.length > 0) {
    const oldImg = oldProductRes[0].image;
    if (body.image !== undefined && oldImg && oldImg !== body.image && oldImg.startsWith('/api/images/') && r2) {
      const key = oldImg.replace('/api/images/', '');
      await r2.delete(key).catch(console.error);
    }
  }

  await db.update(products).set({
    name: body.name,
    description: body.description || '',
    price: Number(body.price) || 0,
    rating: Number(body.rating) || 5.0,
    benefit: body.benefit || '',
    image: body.image || '',
    badge: body.badge || null,
    category: body.category || '\u0985\u09a8\u09cd\u09af\u09be\u09a8\u09cd\u09af',
    published: body.published !== false,
    updatedAt: new Date(),
  }).where(eq(products.id, body.id));

  await logAuditEvent(db, {
    adminId: locals.user.id,
    adminName: locals.user.fullName,
    action: 'update',
    entityType: 'product',
    entityId: body.id,
    details: { name: body.name },
  });

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
