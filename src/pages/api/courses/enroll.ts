import { createDb } from '../../../db/client.js';
import { courses, courseEnrollments, courseLessons, courseModules, courseOrders, coursePayments } from '../../../db/schema.js';
import type { APIRoute } from 'astro';
import { env as workerEnv } from 'cloudflare:workers';
import crypto from 'node:crypto';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { getEffectiveCoursePrice, ENROLLMENT_STATUS, isCoursePubliclyVisible } from '../../../lib/lms-access.js';
import { json } from '../../../lib/api-helpers.js';
import { buildCourseReadiness } from '../../../lib/lms-admin.js';

export const prerender = false;

const enrollmentSchema = z.object({
  courseId: z.string().min(1),
  paymentMethod: z.enum(['bkash', 'nagad', 'rocket', 'bank', 'manual']).optional(),
  paymentNumber: z.string().trim().min(3).max(32).optional(),
  transactionId: z.string().trim().min(3).max(80).optional(),
});

export const POST: APIRoute = async ({ request, locals }) => {
  const env = workerEnv || process.env;
  
  try {
    const user = locals.user;
    
    if (!user) {
      return json({ error: 'Unauthorized' }, 401);
    }

    const parsed = enrollmentSchema.safeParse(await request.json());
    if (!parsed.success) {
      return json({ error: 'Invalid enrollment request', issues: parsed.error.flatten().fieldErrors }, 400);
    }

    const { courseId, paymentMethod, paymentNumber, transactionId } = parsed.data;
    const db = createDb((env as any).DATABASE_URL);

    // Verify course exists
    const courseResult = await db.select().from(courses).where(eq(courses.id, courseId));
    if (courseResult.length === 0) {
      return json({ error: 'Course not found' }, 404);
    }

    const courseDetails = courseResult[0];
    const amount = getEffectiveCoursePrice(courseDetails);
    const isFree = amount === 0;

    // Check if already enrolled
    const existingEnrollment = await db.select()
      .from(courseEnrollments)
      .where(and(
        eq(courseEnrollments.userId, user.id),
        eq(courseEnrollments.courseId, courseId)
      ));

    if (existingEnrollment.length > 0) {
      const status = existingEnrollment[0].status;
      if (status === ENROLLMENT_STATUS.REVOKED) {
        return json({ error: 'Course access was removed. Please contact admin.' }, 403);
      }
      return json({
        success: true,
        status,
        enrollmentId: existingEnrollment[0].id,
        message: status === ENROLLMENT_STATUS.APPROVED ? 'Already enrolled' : 'Enrollment is pending review',
      });
    }

    if (!isCoursePubliclyVisible(courseDetails)) {
      return json({ error: 'এই কোর্সে এখন এনরোল করা যাচ্ছে না।' }, 403);
    }

    const [courseModuleRows, courseLessonRows] = await Promise.all([
      db.select().from(courseModules).where(eq(courseModules.courseId, courseId)),
      db.select().from(courseLessons).where(eq(courseLessons.courseId, courseId)),
    ]);
    const readiness = buildCourseReadiness({ course: courseDetails, modules: courseModuleRows, lessons: courseLessonRows });
    if (!readiness.publishable) {
      return json({ error: 'এই কোর্সে এখন এনরোল করা যাচ্ছে না।', readiness }, 403);
    }

    if (isFree) {
      const id = crypto.randomUUID();
      await db.insert(courseEnrollments).values({
        id,
        userId: user.id,
        courseId,
        status: ENROLLMENT_STATUS.APPROVED,
        source: 'free',
        approvedAt: new Date(),
      });
      return json({ success: true, status: ENROLLMENT_STATUS.APPROVED, enrollmentId: id, message: 'Enrolled successfully' });
    }

    if (!paymentMethod || !paymentNumber || !transactionId) {
      return json({ error: 'Payment details are required for this course' }, 400);
    }

    const duplicatePayment = await db
      .select()
      .from(coursePayments)
      .where(and(
        eq(coursePayments.method, paymentMethod),
        eq(coursePayments.transactionId, transactionId),
      ))
      .limit(1);

    if (duplicatePayment.length > 0) {
      if (duplicatePayment[0].userId !== user.id || duplicatePayment[0].courseId !== courseId) {
        return json({ error: 'This transaction ID is already used for another enrollment' }, 409);
      }
      return json({
        success: true,
        status: duplicatePayment[0].status,
        enrollmentId: duplicatePayment[0].enrollmentId,
        message: 'Payment is already submitted for review',
      });
    }

    const enrollmentId = crypto.randomUUID();
    const orderId = crypto.randomUUID();
    const paymentId = crypto.randomUUID();

    await db.transaction(async (tx: any) => {
      await tx.insert(courseEnrollments).values({
        id: enrollmentId,
        userId: user.id,
        courseId,
        status: ENROLLMENT_STATUS.PENDING,
        source: 'manual_payment',
        paymentMethod,
        paymentNumber,
        transactionId,
      });

      await tx.insert(courseOrders).values({
        id: orderId,
        userId: user.id,
        courseId,
        enrollmentId,
        amount,
        status: 'manual_review',
        paymentMethod,
        transactionId,
        metadata: { submittedFrom: 'course_enroll_api' },
      });

      await tx.insert(coursePayments).values({
        id: paymentId,
        orderId,
        enrollmentId,
        userId: user.id,
        courseId,
        amount,
        method: paymentMethod,
        provider: 'manual',
        transactionId,
        paymentNumber,
        status: 'pending_verification',
        rawPayload: { paymentMethod, paymentNumber, transactionId },
      });
    });

    return json({
      success: true,
      status: ENROLLMENT_STATUS.PENDING,
      enrollmentId,
      orderId,
      message: 'Payment submitted for review',
    });
  } catch (error) {
    console.error('Course enrollment error:', error);
    return json({ error: 'Server error' }, 500);
  }
};
