import type { APIRoute } from 'astro';
import { env as workerEnv } from 'cloudflare:workers';
import { createDb } from '../../../../db/client.js';
import { courseReviews, courseEnrollments } from '../../../../db/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import crypto from 'node:crypto';
import { z } from 'zod';
import { updateCourseRating } from '../../../../lib/lms.js';
import { isEnrollmentActive } from '../../../../lib/lms-access.js';

export const prerender = false;

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().max(2000).optional().default(''),
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Cache-Control': 'no-store', 'Content-Type': 'application/json' },
  });
}

export const GET: APIRoute = async ({ params }) => {
  const env = workerEnv || process.env;

  try {
    const { id: courseId } = params;
    if (!courseId) return json({ error: 'Course ID required' }, 400);

    const db = createDb((env as any).DATABASE_URL);
    const reviews = await db.select()
      .from(courseReviews)
      .where(and(eq(courseReviews.courseId, courseId), eq(courseReviews.published, true)))
      .orderBy(desc(courseReviews.createdAt));

    return json({ success: true, reviews });
  } catch (error) {
    console.error('Reviews GET error:', error);
    return json({ error: 'Server error' }, 500);
  }
};

export const POST: APIRoute = async ({ params, request, locals }) => {
  const env = workerEnv || process.env;
  const user = (locals as any).user;
  if (!user) return json({ error: 'Unauthorized' }, 401);

  try {
    const { id: courseId } = params;
    if (!courseId) return json({ error: 'Course ID required' }, 400);

    const parsed = reviewSchema.safeParse(await request.json());
    if (!parsed.success) {
      return json({ error: parsed.error.issues[0]?.message || 'Valid rating required', details: parsed.error.issues }, 400);
    }

    const db = createDb((env as any).DATABASE_URL);
    const [enrollment] = await db.select().from(courseEnrollments)
      .where(and(eq(courseEnrollments.userId, user.id), eq(courseEnrollments.courseId, courseId)))
      .limit(1);
    if (!enrollment || !isEnrollmentActive(enrollment)) {
      return json({ error: 'Active course enrollment is required to review' }, 403);
    }

    const [existing] = await db.select().from(courseReviews)
      .where(and(eq(courseReviews.userId, user.id), eq(courseReviews.courseId, courseId)))
      .limit(1);

    if (existing) {
      await db.update(courseReviews)
        .set({ rating: parsed.data.rating, comment: parsed.data.comment, published: false })
        .where(eq(courseReviews.id, existing.id));
    } else {
      await db.insert(courseReviews).values({
        id: crypto.randomUUID(),
        userId: user.id,
        courseId,
        rating: parsed.data.rating,
        comment: parsed.data.comment,
        published: false,
      });
    }

    await updateCourseRating(db, courseId);
    return json({ success: true, message: 'Review submitted for moderation' });
  } catch (error) {
    console.error('Review POST error:', error);
    return json({ error: 'Server error' }, 500);
  }
};
