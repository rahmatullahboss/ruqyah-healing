import { createDb } from '../../../../db/client.js';
import { testimonials } from '../../../../db/schema.js';
import { eq } from 'drizzle-orm';
import type { APIRoute } from 'astro';
import { env as workerEnv } from 'cloudflare:workers';
import { logAuditEvent } from '../../../../lib/audit.js';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const env = workerEnv || process.env;
  
  try {
    const adminUser = locals.user;
    if (!adminUser || adminUser.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const body = await request.json() as Record<string, any>;
    const db = createDb((env as any).DATABASE_URL);
    const r2 = (env as any).R2_IMAGES;

    if (body.id) {
      // Update existing — delete old image from R2 if changed
      const oldRows = await db.select().from(testimonials).where(eq(testimonials.id, body.id));
      if (oldRows.length > 0) {
        const oldImg = oldRows[0].image;
        if (body.image !== undefined && oldImg && oldImg !== body.image && oldImg.startsWith('/api/images/') && r2) {
          const key = oldImg.replace('/api/images/', '');
          await r2.delete(key).catch(console.error);
        }
      }

      await db.update(testimonials).set({
        name: body.name,
        role: body.role || null,
        message: body.message,
        rating: body.rating || 5,
        orderIndex: body.orderIndex || 0,
        image: body.image || null,
        published: body.published !== false,
      }).where(eq(testimonials.id, body.id));

      await logAuditEvent(db, {
        adminId: adminUser.id,
        adminName: adminUser.fullName,
        action: 'update',
        entityType: 'testimonial',
        entityId: body.id,
        details: { name: body.name },
      });
    } else {
      // Create new
      await db.insert(testimonials).values({
        id: crypto.randomUUID(),
        name: body.name,
        role: body.role || null,
        message: body.message,
        rating: body.rating || 5,
        orderIndex: body.orderIndex || 0,
        image: body.image || null,
        published: body.published !== false,
      });

      await logAuditEvent(db, {
        adminId: adminUser.id,
        adminName: adminUser.fullName,
        action: 'create',
        entityType: 'testimonial',
        entityId: 'new',
        details: { name: body.name },
      });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Testimonial save error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};