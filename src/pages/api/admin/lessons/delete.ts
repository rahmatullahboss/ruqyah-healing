import type { APIRoute } from 'astro';
import { env as workerEnv } from 'cloudflare:workers';
import { createDb } from '../../../../db/client.js';
import { courseLessons, courseProgress } from '../../../../db/schema.js';
import { eq } from 'drizzle-orm';
import { updateCourseLessonStats } from '../../../../lib/lms.js';
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
    const { id } = body;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Lesson ID is required' }), { status: 400 });
    }

    const db = createDb((env as any).DATABASE_URL);

    // Get courseId before deleting
    const lesson = await db.select({ courseId: courseLessons.courseId })
      .from(courseLessons).where(eq(courseLessons.id, id));
    const courseId = lesson[0]?.courseId;

    // Delete progress records for this lesson
    await db.delete(courseProgress).where(eq(courseProgress.lessonId, id));

    // Delete the lesson
    await db.delete(courseLessons).where(eq(courseLessons.id, id));

    // Update course stats
    if (courseId) {
      await updateCourseLessonStats(db, courseId);
    }

    await logAuditEvent(db, {
      adminId: user.id,
      adminName: user.fullName,
      action: 'delete',
      entityType: 'lesson',
      entityId: id,
      details: { courseId },
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Lesson delete error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
