import type { APIRoute } from 'astro';
import { z } from 'zod';
import { createDb } from '../../../../db/client.js';
import { products } from '../../../../db/schema.js';
import { env as workerEnv } from 'cloudflare:workers';
import { logAuditEvent } from '../../../../lib/audit.js';

export const prerender = false;

const productSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(2000).optional().default(''),
  price: z.coerce.number().int().min(0).optional().default(0),
  rating: z.coerce.number().min(0).max(5).optional().default(5),
  benefit: z.string().trim().max(2000).optional().default(''),
  image: z.string().max(500).optional().default(''),
  category: z.string().trim().max(100).optional().default('অন্যান্য'),
  badge: z.string().trim().max(50).nullable().optional().default(null),
  published: z.boolean().optional().default(true),
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
    const parsed = productSchema.safeParse(await request.json());
    if (!parsed.success) return json({ error: 'Validation failed', details: parsed.error.issues }, 400);

    const env = (workerEnv || process.env) as any;
    const db = createDb(env.DATABASE_URL);
    const id = crypto.randomUUID();
    await db.insert(products).values({ id, ...parsed.data });

    await logAuditEvent(db, {
      adminId: user.id,
      adminName: user.fullName,
      action: 'create',
      entityType: 'product',
      entityId: id,
      details: { name: parsed.data.name },
    });

    return json({ success: true, id });
  } catch (error) {
    console.error('Product create error:', error);
    return json({ error: 'Server error' }, 500);
  }
};
