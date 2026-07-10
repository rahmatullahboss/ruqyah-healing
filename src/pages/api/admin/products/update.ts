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
  description: z.string().trim().max(2000).optional(),
  price: z.coerce.number().int().min(0).optional(),
  rating: z.coerce.number().min(0).max(5).optional(),
  benefit: z.string().trim().max(2000).optional(),
  image: z.string().max(500).optional(),
  category: z.string().trim().max(100).optional(),
  badge: z.string().trim().max(50).nullable().optional(),
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
    const parsed = productUpdateSchema.safeParse(await request.json());
    if (!parsed.success) return json({ error: 'Validation failed', details: parsed.error.issues }, 400);

    const body = parsed.data;
    const env = (workerEnv || process.env) as any;
    const db = createDb(env.DATABASE_URL);
    const r2 = env.R2_IMAGES;
    const [oldProduct] = await db.select().from(products).where(eq(products.id, body.id)).limit(1);
    if (!oldProduct) return json({ error: 'Product not found' }, 404);

    const nextImage = body.image ?? oldProduct.image;
    await db.update(products).set({
      name: body.name,
      description: body.description ?? oldProduct.description,
      price: body.price ?? oldProduct.price,
      rating: body.rating ?? oldProduct.rating,
      benefit: body.benefit ?? oldProduct.benefit,
      image: nextImage,
      badge: body.badge !== undefined ? body.badge : oldProduct.badge,
      category: body.category ?? oldProduct.category,
      published: body.published ?? oldProduct.published,
      updatedAt: new Date(),
    }).where(eq(products.id, body.id));

    if (oldProduct.image && oldProduct.image !== nextImage && oldProduct.image.startsWith('/api/images/') && r2) {
      const key = oldProduct.image.slice('/api/images/'.length);
      await r2.delete(key).catch((error: unknown) => console.error('Old product image cleanup failed:', error));
    }

    await logAuditEvent(db, {
      adminId: user.id,
      adminName: user.fullName,
      action: 'update',
      entityType: 'product',
      entityId: body.id,
      details: { name: body.name },
    });

    return json({ success: true });
  } catch (error) {
    console.error('Product update error:', error);
    return json({ error: 'Server error' }, 500);
  }
};
