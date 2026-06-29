import type { APIRoute } from 'astro';
import { env as workerEnv } from 'cloudflare:workers';
import { createDb } from '../../../../db/client.js';
import { courseProgress, courseEnrollments } from '../../../../db/schema.js';
import { eq, and } from 'drizzle-orm';
import crypto from 'node:crypto';
import { getUserCourseProgress, isCourseCompleted } from '../../../../lib/lms.js';
import { getLessonAccess } from '../../../../lib/lms-access.js';

export const prerender = false;

// GET: Get user's progress for a course
export const GET: APIRoute = async ({ params, locals }) => {
  const env = workerEnv || process.env;
  const user = (locals as any).user;

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const { id: courseId } = params;
    if (!courseId) {
      return new Response(JSON.stringify({ error: 'Course ID required' }), { status: 400 });
    }

    const db = createDb((env as any).DATABASE_URL);

    // Verify enrollment
    const enrollment = await db.select().from(courseEnrollments)
      .where(and(eq(courseEnrollments.userId, user.id), eq(courseEnrollments.courseId, courseId)));
    if (enrollment.length === 0 || enrollment[0].status !== 'approved') {
      return new Response(JSON.stringify({ error: 'Not enrolled' }), { status: 403 });
    }

    const progress = await getUserCourseProgress(db, user.id, courseId);

    // Get individual lesson progress
    const lessonProgress = await db.select()
      .from(courseProgress)
      .where(and(eq(courseProgress.userId, user.id), eq(courseProgress.courseId, courseId)));

    return new Response(JSON.stringify({
      success: true,
      progress,
      lessons: lessonProgress,
    }), { status: 200 });
  } catch (error) {
    console.error('Progress GET error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};

// POST: Mark a lesson as complete
export const POST: APIRoute = async ({ params, request, locals }) => {
  const env = workerEnv || process.env;
  const user = (locals as any).user;

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const { id: courseId } = params;
    const body = await request.json() as Record<string, any>;
    const { lessonId, watchedSeconds } = body;

    if (!courseId || !lessonId) {
      return new Response(JSON.stringify({ error: 'Course ID and Lesson ID required' }), { status: 400 });
    }

    if (watchedSeconds !== undefined && (typeof watchedSeconds !== 'number' || !Number.isInteger(watchedSeconds) || watchedSeconds < 0 || watchedSeconds > 86400)) {
      return new Response(JSON.stringify({ error: 'watchedSeconds must be an integer between 0 and 86400' }), { status: 400 });
    }

    const db = createDb((env as any).DATABASE_URL);

    // Verify enrollment
    const enrollment = await db.select().from(courseEnrollments)
      .where(and(eq(courseEnrollments.userId, user.id), eq(courseEnrollments.courseId, courseId)));
    if (enrollment.length === 0 || enrollment[0].status !== 'approved') {
      return new Response(JSON.stringify({ error: 'Not enrolled' }), { status: 403 });
    }

    const completedRows = await db.select({ lessonId: courseProgress.lessonId })
      .from(courseProgress)
      .where(and(
        eq(courseProgress.userId, user.id),
        eq(courseProgress.courseId, courseId),
        eq(courseProgress.completed, true)
      ));
    const access = await getLessonAccess(db, {
      user,
      courseId,
      lessonId,
      completedLessonIds: new Set(completedRows.map((row) => row.lessonId)),
    });
    if (!access.allowed) {
      return new Response(JSON.stringify({ error: access.reason || 'Lesson locked' }), { status: access.status || 403 });
    }

    // Upsert progress
    const existing = await db.select().from(courseProgress)
      .where(and(eq(courseProgress.userId, user.id), eq(courseProgress.lessonId, lessonId)));

    if (existing.length > 0) {
      const updates: Record<string, any> = {};
      if (watchedSeconds !== undefined) updates.watchedSeconds = watchedSeconds;
      if (!existing[0].completed && (watchedSeconds === undefined || watchedSeconds > 0)) {
        updates.completed = true;
        updates.completedAt = new Date();
      }
      if (Object.keys(updates).length > 0) {
        await db.update(courseProgress).set(updates).where(eq(courseProgress.id, existing[0].id));
      }
    } else {
      const shouldMarkCompleted = watchedSeconds === undefined || watchedSeconds > 0;
      await db.insert(courseProgress).values({
        id: crypto.randomUUID(),
        userId: user.id,
        courseId,
        lessonId,
        completed: shouldMarkCompleted,
        watchedSeconds: watchedSeconds || 0,
        completedAt: shouldMarkCompleted ? new Date() : null,
      });
    }

    // Check if course is now complete
    const completed = await isCourseCompleted(db, user.id, courseId);
    if (completed && enrollment[0].completedAt === null) {
      await db.update(courseEnrollments)
        .set({ completedAt: new Date() })
        .where(eq(courseEnrollments.id, enrollment[0].id));
    }

    const progress = await getUserCourseProgress(db, user.id, courseId);

    return new Response(JSON.stringify({
      success: true,
      progress,
      courseCompleted: completed,
    }), { status: 200 });
  } catch (error) {
    console.error('Progress POST error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
