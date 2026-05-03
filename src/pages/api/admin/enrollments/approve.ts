import { createDb } from '../../../../db/client.js';
import { courseEnrollments } from '../../../../db/schema.js';
import type { APIRoute } from 'astro';
import { env as workerEnv } from 'cloudflare:workers';
import { eq } from 'drizzle-orm';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const env = workerEnv || process.env;
  
  try {
    const user = locals.user;
    
    if (!user || user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const body = await request.json() as { id: string };
    if (!body.id) {
      return new Response(JSON.stringify({ error: 'Enrollment ID missing' }), { status: 400 });
    }

    const { id } = body;
    const db = createDb((env as any).DATABASE_URL);

    // Verify enrollment
    const record = await db.select().from(courseEnrollments).where(eq(courseEnrollments.id, id));
    if (record.length === 0) {
      return new Response(JSON.stringify({ error: 'Enrollment not found' }), { status: 404 });
    }

    await db.update(courseEnrollments)
      .set({ status: 'approved' })
      .where(eq(courseEnrollments.id, id));

    return new Response(JSON.stringify({ success: true, message: 'Approved successfully' }), { status: 200 });
  } catch (error) {
    console.error('Enrollment approve error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
