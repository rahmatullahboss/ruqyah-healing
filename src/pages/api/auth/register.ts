import { createDb } from '../../../db/client.js';
import { users } from '../../../db/schema.js';
import { eq, or } from 'drizzle-orm';
import { hashPassword, createSession } from '../../../lib/auth.js';
import { z } from 'zod';

export const prerender = false;

import type { APIRoute } from 'astro';

import { env as workerEnv } from 'cloudflare:workers';

const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'নাম কমপক্ষে ২ অক্ষর হতে হবে').max(100),
  email: z.string().email('সঠিক ইমেইল দিন').optional().or(z.literal('')),
  phone: z.string()
    .regex(/^0\d{10}$/, 'সঠিক মোবাইল নম্বর দিন (01XXXXXXXXX)')
    .optional()
    .or(z.literal('')),
  password: z.string()
    .min(8, 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষর হতে হবে')
    .max(128),
}).refine(
  (data) => data.email || data.phone,
  { message: 'ইমেইল অথবা ফোন নম্বর অবশ্যই দিতে হবে' }
);

export const POST: APIRoute = async ({ request, locals, cookies }) => {
  const env = workerEnv || process.env;

  try {
    const formData = await request.json();
    const parsed = registerSchema.safeParse(formData);

    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || 'Invalid input';
      return new Response(JSON.stringify({ error: firstError }), { status: 400 });
    }

    const { fullName, email, phone, password } = parsed.data;

    const db = createDb(env.DATABASE_URL);

    // Check if user already exists
    const conditions = [];
    if (email) conditions.push(eq(users.email, email));
    if (phone) conditions.push(eq(users.phone, phone));

    const existingUsers = await db.select().from(users).where(or(...conditions));
    if (existingUsers.length > 0) {
      return new Response(JSON.stringify({ error: 'এই ইমেইল বা ফোন নম্বর দিয়ে আগেই একাউন্ট আছে' }), { status: 400 });
    }

    const hashedPassword = await hashPassword(password);
    const userId = crypto.randomUUID();

    await db.insert(users).values({
      id: userId,
      fullName,
      email: email || null,
      phone: phone || null,
      passwordHash: hashedPassword,
    });

    const token = await createSession(userId, env);

    cookies.set('auth_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return new Response(JSON.stringify({ success: true, redirect: '/profile' }), { status: 200 });

  } catch (error) {
    console.error('Registration error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
