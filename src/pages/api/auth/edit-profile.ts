import { createDb } from '../../../db/client.js';
import { users } from '../../../db/schema.js';
import { eq, or, and, ne } from 'drizzle-orm';
import { z } from 'zod';
import { normalizeBangladeshPhone } from '../../../lib/appointments.js';

export const prerender = false;

import type { APIRoute } from 'astro';

import { env as workerEnv } from 'cloudflare:workers';

const editProfileSchema = z.object({
  fullName: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.union([
    z.literal(''),
    z.string().trim().email('Invalid email').max(254).transform((value) => value.toLowerCase()),
  ]).optional().default(''),
  phone: z.union([
    z.literal(''),
    z.string().trim().transform(normalizeBangladeshPhone).refine(
      (value) => /^01[3-9]\d{8}$/.test(value),
      'Invalid phone number',
    ),
  ]).optional().default(''),
}).refine((data) => data.email || data.phone, {
  message: 'Email or phone is required',
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
    const user = locals.user;
    if (!user) return json({ error: 'Unauthorized' }, 401);

    const parsed = editProfileSchema.safeParse(await request.json());
    if (!parsed.success) {
      return json({ error: parsed.error.issues[0]?.message || 'Validation failed', details: parsed.error.flatten().fieldErrors }, 400);
    }
    const { fullName, email, phone } = parsed.data;
    const db = createDb(env.DATABASE_URL);

    const conditions = [];
    if (email) conditions.push(eq(users.email, email));
    if (phone) conditions.push(eq(users.phone, phone));

    if (conditions.length > 0) {
      const existingConflict = await db.select({ id: users.id }).from(users).where(
        and(ne(users.id, user.id), or(...conditions)),
      ).limit(1);
      if (existingConflict.length > 0) {
        return json({ error: 'Email or phone already in use by another account' }, 409);
      }
    }

    try {
      await db.update(users)
        .set({ fullName, email: email || null, phone: phone || null })
        .where(eq(users.id, user.id));
    } catch (error) {
      if ((error as any)?.code === '23505' || String((error as any)?.message || '').includes('duplicate key')) {
        return json({ error: 'Email or phone already in use by another account' }, 409);
      }
      throw error;
    }

    return json({ success: true, redirect: '/profile' });
  } catch (error) {
    console.error('Profile edit error:', error);
    return json({ error: 'Server error' }, 500);
  }
};
