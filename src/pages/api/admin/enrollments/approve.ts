import { createDb } from '../../../../db/client.js';
import { courseEnrollments, courseOrders, coursePayments } from '../../../../db/schema.js';
import type { APIRoute } from 'astro';
import { env as workerEnv } from 'cloudflare:workers';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { ENROLLMENT_STATUS } from '../../../../lib/lms-access.js';
import { json } from '../../../../lib/api-helpers.js';

export const prerender = false;

const approveSchema = z.object({ id: z.string().min(1) });

export const POST: APIRoute = async ({ request, locals }) => {
  const env = workerEnv || process.env;
  
  try {
    const user = locals.user;
    
    if (!user || user.role !== 'admin') {
      return json({ error: 'Unauthorized' }, 401);
    }

    const parsed = approveSchema.safeParse(await request.json());
    if (!parsed.success) {
      return json({ error: 'Enrollment ID missing' }, 400);
    }

    const { id } = parsed.data;
    const db = createDb((env as any).DATABASE_URL);

    // Verify enrollment
    const record = await db.select().from(courseEnrollments).where(eq(courseEnrollments.id, id));
    if (record.length === 0) {
      return json({ error: 'Enrollment not found' }, 404);
    }

    if (record[0].status === ENROLLMENT_STATUS.APPROVED) {
      return json({ success: true, status: ENROLLMENT_STATUS.APPROVED, message: 'Already approved' });
    }

    const approvedAt = new Date();
    await db.transaction(async (tx: any) => {
      await tx.update(courseEnrollments)
        .set({
          status: ENROLLMENT_STATUS.APPROVED,
          approvedBy: user.id,
          approvedAt,
          revokedAt: null,
        })
        .where(eq(courseEnrollments.id, id));

      await tx.update(courseOrders)
        .set({ status: 'paid', paidAt: approvedAt, updatedAt: approvedAt })
        .where(eq(courseOrders.enrollmentId, id));

      await tx.update(coursePayments)
        .set({ status: 'verified', verifiedAt: approvedAt })
        .where(eq(coursePayments.enrollmentId, id));
    });

    return json({ success: true, status: ENROLLMENT_STATUS.APPROVED, message: 'Approved successfully' });
  } catch (error) {
    console.error('Enrollment approve error:', error);
    return json({ error: 'Server error' }, 500);
  }
};
