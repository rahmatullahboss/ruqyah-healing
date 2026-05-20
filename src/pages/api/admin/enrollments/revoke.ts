import type { APIRoute } from 'astro';
import { env as workerEnv } from 'cloudflare:workers';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { createDb } from '../../../../db/client.js';
import { courseEnrollments } from '../../../../db/schema.js';
import { ENROLLMENT_STATUS } from '../../../../lib/lms-access.js';

export const prerender = false;

const revokeSchema = z.object({ id: z.string().min(1) });

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
    const parsed = revokeSchema.safeParse(await request.json());
    if (!parsed.success) {
      return json({ error: 'Enrollment ID missing' }, 400);
    }

    const db = createDb((env as any).DATABASE_URL);
    const [record] = await db
      .select()
      .from(courseEnrollments)
      .where(eq(courseEnrollments.id, parsed.data.id))
      .limit(1);

    if (!record) return json({ error: 'Enrollment not found' }, 404);

    await db.update(courseEnrollments)
      .set({
        status: ENROLLMENT_STATUS.REVOKED,
        revokedAt: new Date(),
      })
      .where(eq(courseEnrollments.id, parsed.data.id));

    return json({ success: true, status: ENROLLMENT_STATUS.REVOKED });
  } catch (error) {
    console.error('Enrollment revoke error:', error);
    return json({ error: 'Server error' }, 500);
  }
};
