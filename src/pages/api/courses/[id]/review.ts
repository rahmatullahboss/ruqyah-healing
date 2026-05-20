import type { APIRoute } from 'astro';
import { env as workerEnv } from 'cloudflare:workers';
import { createDb } from '../../../../db/client.js';
import { courseReviews, courseEnrollments } from '../../../../db/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import crypto from 'node:crypto';
import { updateCourseRating } from '../../../../lib/lms.js';

export const prerender = false;

// GET: Get reviews for a course
export const GET: APIRoute = async ({ params, url }) => {
  const env = workerEnv || process.env;

  try {
    const { id: courseId } = params;
    if (!courseId) {
      return new Response(JSON.stringify({ error: 'Course ID required' }), { status: 400 });
    }

    const db = createDb((env as any).DATABASE_URL);

    const reviews = await db.select()
      .from(courseReviews)
      .where(and(eq(courseReviews.courseId, courseId), eq(courseReviews.published, true)))
      .orderBy(desc(courseReviews.createdAt));

    return new Response(JSON.stringify({ success: true, reviews }), { status: 200 });
  } catch (error) {
    console.error('Reviews GET error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};

// POST: Submit a review
export const POST: APIRoute = async ({ params, request, locals }) => {
  const env = workerEnv || process.env;
  const user = (locals as any).user;

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const { id: courseId } = params;
    const body = await request.json() as Record<string, any>;
    const { rating, comment } = body;

    if (!courseId || !rating || rating < 1 || rating > 5) {
      return new Response(JSON.stringify({ error: 'Course ID and valid rating (1-5) required' }), { status: 400 });
    }

    const db = createDb((env as any).DATABASE_URL);

    // Verify enrollment
    const enrollment = await db.select().from(courseEnrollments)
      .where(and(eq(courseEnrollments.userId, user.id), eq(courseEnrollments.courseId, courseId)));
    if (enrollment.length === 0 || enrollment[0].status !== 'approved') {
      return new Response(JSON.stringify({ error: 'Must be enrolled to review' }), { status: 403 });
    }

    // Check if already reviewed
    const existing = await db.select().from(courseReviews)
      .where(and(eq(courseReviews.userId, user.id), eq(courseReviews.courseId, courseId)));

    if (existing.length > 0) {
      // Update existing review
      await db.update(courseReviews)
        .set({ rating, comment: comment || '' })
        .where(eq(courseReviews.id, existing[0].id));
    } else {
      // Create new review
      await db.insert(courseReviews).values({
        id: crypto.randomUUID(),
        userId: user.id,
        courseId,
        rating,
        comment: comment || '',
        published: true,
      });
    }

    // Update course rating
    await updateCourseRating(db, courseId);

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Review POST error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
