import { createDb } from '../../../../db/client.js';
import { users } from '../../../../db/schema.js';
import { eq, and, ne, or } from 'drizzle-orm';
import { z } from 'zod';
import { logAuditEvent } from '../../../../lib/audit.js';
import { normalizeBangladeshPhone } from '../../../../lib/appointments.js';

export const prerender = false;

import type { APIRoute } from 'astro';
import { env as workerEnv } from 'cloudflare:workers';

const updateUserSchema = z.object({
  userId: z.string().trim().min(1),
  fullName: z.string().trim().min(2, 'নাম কমপক্ষে ২ অক্ষর হতে হবে।').max(100),
  email: z.union([
    z.literal(''),
    z.string().trim().email('সঠিক ইমেইল দিন।').max(254).transform((value) => value.toLowerCase()),
  ]).optional().default(''),
  phone: z.union([
    z.literal(''),
    z.string().trim().transform(normalizeBangladeshPhone).refine(
      (value) => /^01[3-9]\d{8}$/.test(value),
      'সঠিক ফোন নম্বর দিন।',
    ),
  ]).optional().default(''),
}).refine((data) => data.email || data.phone, {
  message: 'ইমেইল অথবা ফোন নম্বর অবশ্যই দিতে হবে।',
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Cache-Control': 'no-store', 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = workerEnv || process.env;

  try {
    const adminUser = locals.user;
    if (!adminUser || adminUser.role !== 'admin') return json({ error: 'Unauthorized' }, 403);

    const parsed = updateUserSchema.safeParse(await request.json());
    if (!parsed.success) {
      return json({ error: parsed.error.issues[0]?.message || 'Invalid user data', details: parsed.error.issues }, 400);
    }
    const { userId, fullName, email, phone } = parsed.data;
    const db = createDb(env.DATABASE_URL);

    const [target] = await db.select({ id: users.id }).from(users).where(eq(users.id, userId)).limit(1);
    if (!target) return json({ error: 'User not found' }, 404);

    const conditions = [];
    if (email) conditions.push(eq(users.email, email));
    if (phone) conditions.push(eq(users.phone, phone));
    if (conditions.length > 0) {
      const [conflict] = await db.select({ id: users.id })
        .from(users)
        .where(and(ne(users.id, userId), or(...conditions)))
        .limit(1);
      if (conflict) return json({ error: 'এই ইমেইল বা ফোন নম্বর অন্য ইউজারের আছে।' }, 409);
    }

    try {
      await db.update(users)
        .set({ fullName, email: email || null, phone: phone || null })
        .where(eq(users.id, userId));
    } catch (error) {
      if ((error as any)?.code === '23505' || String((error as any)?.message || '').includes('duplicate key')) {
        return json({ error: 'এই ইমেইল বা ফোন নম্বর অন্য ইউজারের আছে।' }, 409);
      }
      throw error;
    }

    await logAuditEvent(db, {
      adminId: adminUser.id,
      adminName: adminUser.fullName,
      action: 'update_user_profile',
      entityType: 'user',
      entityId: userId,
      details: { fullName, email, phone },
    });

    return json({ success: true });
  } catch (error) {
    console.error('User update error:', error);
    return json({ error: 'Server error' }, 500);
  }
};
