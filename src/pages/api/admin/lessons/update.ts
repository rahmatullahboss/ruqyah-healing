import type { APIRoute } from 'astro';
import { env as workerEnv } from 'cloudflare:workers';
import { createDb } from '../../../../db/client.js';
import { courseLessons, courseModules } from '../../../../db/schema.js';
import { and, eq } from 'drizzle-orm';
import { updateCourseLessonStats } from '../../../../lib/lms.js';
import { normalizeAdminLessonPayload } from '../../../../lib/lms-admin.js';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const env = workerEnv || process.env;
  const user = (locals as any).user;

  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 });
  }

  try {
    const body = await request.json() as Record<string, any>;
    const { id } = body;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Lesson ID is required' }), { status: 400 });
    }

    const db = createDb((env as any).DATABASE_URL);
    const [existingLesson] = await db.select().from(courseLessons).where(eq(courseLessons.id, id)).limit(1);
    if (!existingLesson) {
      return new Response(JSON.stringify({ error: 'Lesson not found' }), { status: 404 });
    }

    const parsed = normalizeAdminLessonPayload({ ...existingLesson, ...body });
    if (!parsed.ok) {
      return new Response(JSON.stringify({ error: parsed.errors[0], errors: parsed.errors }), { status: 400 });
    }

    const [moduleRecord] = await db.select({ id: courseModules.id })
      .from(courseModules)
      .where(and(eq(courseModules.id, parsed.data.moduleId), eq(courseModules.courseId, parsed.data.courseId)))
      .limit(1);
    if (!moduleRecord) {
      return new Response(JSON.stringify({ error: 'Module not found for this course' }), { status: 404 });
    }

    const updates: Record<string, any> = parsed.data;
    if (body.sortOrder !== undefined && parsed.data.sortOrder !== undefined) {
      updates.sortOrder = parsed.data.sortOrder;
    }

    await db.update(courseLessons).set(updates).where(eq(courseLessons.id, id));

    await updateCourseLessonStats(db, parsed.data.courseId);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Lesson update error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
