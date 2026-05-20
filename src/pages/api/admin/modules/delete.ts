import type { APIRoute } from 'astro';
import { env as workerEnv } from 'cloudflare:workers';
import { createDb } from '../../../../db/client.js';
import { courseModules, courseLessons, courseQuizzes, courseQuizQuestions, courseProgress, courseQuizAttempts } from '../../../../db/schema.js';
import { eq, inArray } from 'drizzle-orm';
import { updateCourseLessonStats } from '../../../../lib/lms.js';

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
      return new Response(JSON.stringify({ error: 'Module ID is required' }), { status: 400 });
    }

    const db = createDb((env as any).DATABASE_URL);
    const [moduleRecord] = await db.select({ courseId: courseModules.courseId })
      .from(courseModules)
      .where(eq(courseModules.id, id))
      .limit(1);

    // Get all lessons in this module
    const lessons = await db.select({ id: courseLessons.id })
      .from(courseLessons)
      .where(eq(courseLessons.moduleId, id));
    const lessonIds = lessons.map(l => l.id);

    // Get all quizzes in this module
    const quizzes = await db.select({ id: courseQuizzes.id })
      .from(courseQuizzes)
      .where(eq(courseQuizzes.moduleId, id));
    const quizIds = quizzes.map(q => q.id);

    // Delete in order: progress → quiz questions → quiz attempts → quizzes → lessons → module
    if (lessonIds.length > 0) {
      await db.delete(courseProgress).where(inArray(courseProgress.lessonId, lessonIds));
      await db.delete(courseLessons).where(eq(courseLessons.moduleId, id));
    }

    if (quizIds.length > 0) {
      await db.delete(courseQuizQuestions).where(inArray(courseQuizQuestions.quizId, quizIds));
      await db.delete(courseQuizAttempts).where(inArray(courseQuizAttempts.quizId, quizIds));
      await db.delete(courseQuizzes).where(eq(courseQuizzes.moduleId, id));
    }

    await db.delete(courseModules).where(eq(courseModules.id, id));
    if (moduleRecord?.courseId) {
      await updateCourseLessonStats(db, moduleRecord.courseId);
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Module delete error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
