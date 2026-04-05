import { createDb } from '../../../../db/client.js';
import { courses } from '../../../../db/schema.js';
import type { APIRoute } from 'astro';
import { env as workerEnv } from 'cloudflare:workers';
import { eq } from 'drizzle-orm';
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
      return new Response(JSON.stringify({ error: 'Course ID missing' }), { status: 400 });
    }

    const db = createDb((env as any).DATABASE_URL);

    await db.delete(courses).where(eq(courses.id, id));

    await logAuditEvent(db, {
      adminId: adminUser.id,
      adminName: adminUser.fullName,
      action: 'delete',
      entityType: 'course',
      entityId: id,
      details: {},
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Course delete error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
