import { createDb } from '../../../../db/client.js';
import {
  courses,
  courseEnrollments,
  courseLessons,
  courseModules,
  courseOrders,
  coursePayments,
  courseProgress,
  courseQuizAttempts,
  courseQuizQuestions,
  courseQuizzes,
  courseReviews,
} from '../../../../db/schema.js';
import type { APIRoute } from 'astro';
import { env as workerEnv } from 'cloudflare:workers';
import { eq, inArray } from 'drizzle-orm';
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
    const r2 = (env as any).R2_IMAGES;

    const protectedRows = await db.select({ id: courseEnrollments.id })
      .from(courseEnrollments)
      .where(eq(courseEnrollments.courseId, id))
      .limit(1);
    const protectedOrders = await db.select({ id: courseOrders.id })
      .from(courseOrders)
      .where(eq(courseOrders.courseId, id))
      .limit(1);
    const protectedPayments = await db.select({ id: coursePayments.id })
      .from(coursePayments)
      .where(eq(coursePayments.courseId, id))
      .limit(1);

    if (protectedRows.length > 0 || protectedOrders.length > 0 || protectedPayments.length > 0) {
      return new Response(JSON.stringify({ error: 'This course has enrollment/payment history. Unpublish it instead of deleting.' }), { status: 409 });
    }

    // Fetch before deletion, but only remove the R2 object after DB deletion succeeds.
    const courseToDelete = await db.select().from(courses).where(eq(courses.id, id));
    const courseImg = courseToDelete[0]?.image;

    await db.transaction(async (tx: any) => {
      const quizzes = await tx.select({ id: courseQuizzes.id })
        .from(courseQuizzes)
        .where(eq(courseQuizzes.courseId, id));
      const quizIds = quizzes.map((quiz) => quiz.id);

      if (quizIds.length > 0) {
        await tx.delete(courseQuizQuestions).where(inArray(courseQuizQuestions.quizId, quizIds));
        await tx.delete(courseQuizAttempts).where(inArray(courseQuizAttempts.quizId, quizIds));
      }
      await tx.delete(courseQuizzes).where(eq(courseQuizzes.courseId, id));

      const lessons = await tx.select({ id: courseLessons.id })
        .from(courseLessons)
        .where(eq(courseLessons.courseId, id));
      const lessonIds = lessons.map((lesson) => lesson.id);
      if (lessonIds.length > 0) {
        await tx.delete(courseProgress).where(inArray(courseProgress.lessonId, lessonIds));
      }
      await tx.delete(courseLessons).where(eq(courseLessons.courseId, id));
      await tx.delete(courseModules).where(eq(courseModules.courseId, id));
      await tx.delete(courseReviews).where(eq(courseReviews.courseId, id));
      await tx.delete(courses).where(eq(courses.id, id));
    });

    if (courseImg && courseImg.startsWith('/api/images/') && r2) {
      const key = courseImg.replace('/api/images/', '');
      await r2.delete(key).catch(console.error);
    }

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
