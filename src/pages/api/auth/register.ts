import { createDb } from '../../../db/client.js';
import { users } from '../../../db/schema.js';
import { eq, or } from 'drizzle-orm';
import { hashPassword, createSession } from '../../../lib/auth.js';
import { normalizeBangladeshPhone } from '../../../lib/appointments.js';
import { z } from 'zod';

export const prerender = false;

import type { APIRoute } from 'astro';

import { env as workerEnv } from 'cloudflare:workers';

const emailSchema = z.union([
  z.literal(''),
  z.string().trim().email('সঠিক ইমেইল দিন').max(254).transform((value) => value.toLowerCase()),
]);
const phoneSchema = z.union([
  z.literal(''),
  z.string().trim().transform(normalizeBangladeshPhone).refine(
    (value) => /^01[3-9]\d{8}$/.test(value),
    'সঠিক মোবাইল নম্বর দিন (01XXXXXXXXX)',
  ),
]);

const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'নাম কমপক্ষে ২ অক্ষর হতে হবে').max(100),
  email: emailSchema.optional().default(''),
  phone: phoneSchema.optional().default(''),
  password: z.string()
    .min(8, 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষর হতে হবে')
    .max(128),
}).refine(
  (data) => data.email || data.phone,
  { message: 'ইমেইল অথবা ফোন নম্বর অবশ্যই দিতে হবে' },
);

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Cache-Control': 'no-store', 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const env = workerEnv || process.env;

  try {
    const parsed = registerSchema.safeParse(await request.json());
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'Invalid input';
      return json({ error: firstError, details: parsed.error.flatten().fieldErrors }, 400);
    }

    const { fullName, email, phone, password } = parsed.data;
    const db = createDb(env.DATABASE_URL);

    const conditions = [];
    if (email) conditions.push(eq(users.email, email));
    if (phone) conditions.push(eq(users.phone, phone));

    const existingUsers = await db.select({ id: users.id }).from(users).where(or(...conditions)).limit(1);
    if (existingUsers.length > 0) {
      return json({ error: 'এই ইমেইল বা ফোন নম্বর দিয়ে আগেই একাউন্ট আছে' }, 409);
    }

    const hashedPassword = await hashPassword(password);
    const userId = crypto.randomUUID();

    try {
      await db.insert(users).values({
        id: userId,
        fullName,
        email: email || null,
        phone: phone || null,
        passwordHash: hashedPassword,
      });
    } catch (error) {
      if ((error as any)?.code === '23505' || String((error as any)?.message || '').includes('duplicate key')) {
        return json({ error: 'এই ইমেইল বা ফোন নম্বর দিয়ে আগেই একাউন্ট আছে' }, 409);
      }
      throw error;
    }

    const token = await createSession(userId, env);
    cookies.set('auth_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return json({ success: true, redirect: '/profile' });
  } catch (error) {
    console.error('Registration error:', error);
    return json({ error: 'Server error' }, 500);
  }
};
