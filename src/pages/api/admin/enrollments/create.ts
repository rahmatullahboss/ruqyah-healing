import type { APIRoute } from 'astro';
import { env as workerEnv } from 'cloudflare:workers';
import crypto from 'node:crypto';
import { and, eq } from 'drizzle-orm';
import { z } from 'zod';
import { createDb } from '../../../../db/client.js';
import { courseEnrollments, courses, users } from '../../../../db/schema.js';
import { ENROLLMENT_STATUS } from '../../../../lib/lms-access.js';

export const prerender = false;

const manualEnrollmentSchema = z.object({
  userId: z.string().min(1),
  courseId: z.string().min(1),
  note: z.string().max(300).optional(),
});

function json(payload: Record<string, any>, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = workerEnv || process.env;
  const adminUser = (locals as any).user;

  if (!adminUser || adminUser.role !== 'admin') {
    return json({ error: 'Unauthorized' }, 403);
  }

  try {
    const parsed = manualEnrollmentSchema.safeParse(await request.json());
    if (!parsed.success) {
      return json({ error: 'Invalid enrollment request', issues: parsed.error.flatten().fieldErrors }, 400);
    }

    const { userId, courseId } = parsed.data;
    const db = createDb((env as any).DATABASE_URL);

    const [student] = await db.select({ id: users.id }).from(users).where(eq(users.id, userId)).limit(1);
    if (!student) return json({ error: 'Student not found' }, 404);

    const [course] = await db.select({ id: courses.id }).from(courses).where(eq(courses.id, courseId)).limit(1);
    if (!course) return json({ error: 'Course not found' }, 404);

    const existing = await db
      .select()
      .from(courseEnrollments)
      .where(and(eq(courseEnrollments.userId, userId), eq(courseEnrollments.courseId, courseId)))
      .limit(1);

    const approvedAt = new Date();
    if (existing.length > 0) {
      await db.update(courseEnrollments)
        .set({
          status: ENROLLMENT_STATUS.APPROVED,
          source: 'manual_admin',
          approvedBy: adminUser.id,
          approvedAt,
          revokedAt: null,
        })
        .where(eq(courseEnrollments.id, existing[0].id));

      return json({ success: true, id: existing[0].id, status: ENROLLMENT_STATUS.APPROVED });
    }

    const id = crypto.randomUUID();
    await db.insert(courseEnrollments).values({
      id,
      userId,
      courseId,
      status: ENROLLMENT_STATUS.APPROVED,
      source: 'manual_admin',
      approvedBy: adminUser.id,
      approvedAt,
    });

    return json({ success: true, id, status: ENROLLMENT_STATUS.APPROVED });
  } catch (error) {
    console.error('Manual enrollment create error:', error);
    return json({ error: 'Server error' }, 500);
  }
};
