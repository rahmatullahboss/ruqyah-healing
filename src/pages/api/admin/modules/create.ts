import type { APIRoute } from 'astro';
import { env as workerEnv } from 'cloudflare:workers';
import { createDb } from '../../../../db/client.js';
import { courseModules, courses } from '../../../../db/schema.js';
import { eq, sql } from 'drizzle-orm';
import crypto from 'node:crypto';
import { logAuditEvent } from '../../../../lib/audit.js';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const env = workerEnv || process.env;
  const user = (locals as any).user;

  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 });
  }

  try {
    const body = await request.json() as Record<string, any>;
    const { courseId, title, description } = body;

    if (!courseId || !title) {
      return new Response(JSON.stringify({ error: 'Course ID and title are required' }), { status: 400 });
    }

    const db = createDb((env as any).DATABASE_URL);

    // Verify course exists
    const course = await db.select().from(courses).where(eq(courses.id, courseId));
    if (course.length === 0) {
      return new Response(JSON.stringify({ error: 'Course not found' }), { status: 404 });
    }

    // Get next sort order
    const maxSort = await db.select({ max: sql`coalesce(max(${courseModules.sortOrder}), 0)` })
      .from(courseModules)
      .where(eq(courseModules.courseId, courseId));

    const id = crypto.randomUUID();
    await db.insert(courseModules).values({
      id,
      courseId,
      title,
      description: description || '',
      sortOrder: Number(maxSort[0]?.max || 0) + 1,
    });

    await logAuditEvent(db, {
      adminId: user.id,
      adminName: user.fullName,
      action: 'create',
      entityType: 'module',
      entityId: id,
      details: { title, courseId },
    });

    return new Response(JSON.stringify({ success: true, id }), { status: 200 });
  } catch (error) {
    console.error('Module create error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
