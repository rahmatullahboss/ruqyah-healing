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

    const { id } = await request.json() as { id: string };
    if (!id) {
      return new Response(JSON.stringify({ error: 'ID required' }), { status: 400 });
    }

    const db = createDb((env as any).DATABASE_URL);
    const r2 = (env as any).R2_IMAGES;

    // Fetch testimonial before deletion to get image URL
    const rows = await db.select().from(testimonials).where(eq(testimonials.id, id));
    if (rows.length > 0) {
      const img = rows[0].image;
      if (img && img.startsWith('/api/images/') && r2) {
        const key = img.replace('/api/images/', '');
        await r2.delete(key).catch(console.error);
      }
    }

    await db.delete(testimonials).where(eq(testimonials.id, id));

    await logAuditEvent(db, {
      adminId: adminUser.id,
      adminName: adminUser.fullName,
      action: 'delete',
      entityType: 'testimonial',
      entityId: id,
      details: {},
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Testimonial delete error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};