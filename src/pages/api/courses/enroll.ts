import { createDb } from '../../../db/client.js';
import { courses, courseEnrollments } from '../../../db/schema.js';
import type { APIRoute } from 'astro';
import { env as workerEnv } from 'cloudflare:workers';
import crypto from 'node:crypto';
import { and, eq } from 'drizzle-orm';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const env = workerEnv || process.env;
  
  try {
    const user = locals.user;
    
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const body = await request.json() as Record<string, any>;
    if (!body.courseId) {
      return new Response(JSON.stringify({ error: 'Course ID missing' }), { status: 400 });
    }

    const { courseId } = body;
    const db = createDb((env as any).DATABASE_URL);

    // Verify course exists
    const courseResult = await db.select().from(courses).where(eq(courses.id, courseId));
    if (courseResult.length === 0) {
      return new Response(JSON.stringify({ error: 'Course not found' }), { status: 404 });
    }

    const courseDetails = courseResult[0];
    const isFree = courseDetails.price === null || courseDetails.price === 0;

    // Check if already enrolled
    const existingEnrollment = await db.select()
      .from(courseEnrollments)
      .where(and(
        eq(courseEnrollments.userId, user.id),
        eq(courseEnrollments.courseId, courseId)
      ));

    if (existingEnrollment.length > 0) {
      return new Response(JSON.stringify({ error: 'Already enrolled' }), { status: 400 });
    }

    // Process enrollment
    const id = crypto.randomUUID();
    
    if (isFree) {
      await db.insert(courseEnrollments).values({
        id,
        userId: user.id,
        courseId,
        status: 'approved',
      });
      return new Response(JSON.stringify({ success: true, message: 'Enrolled successfully' }), { status: 200 });
    } else {
      // Paid course flow
      const { paymentMethod, paymentNumber, transactionId } = body;
      if (!paymentMethod || !paymentNumber || !transactionId) {
        return new Response(JSON.stringify({ error: 'Payment details are required for this course' }), { status: 400 });
      }

      await db.insert(courseEnrollments).values({
        id,
        userId: user.id,
        courseId,
        status: 'pending',
        paymentMethod,
        paymentNumber,
        transactionId
      });
      return new Response(JSON.stringify({ success: true, message: 'Payment submitted for review' }), { status: 200 });
    }
  } catch (error) {
    console.error('Course enrollment error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
