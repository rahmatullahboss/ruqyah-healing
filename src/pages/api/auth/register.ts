import { createDb } from '../../../db/client.js';
import { users } from '../../../db/schema.js';
import { eq, or } from 'drizzle-orm';
import { hashPassword, createSession } from '../../../lib/auth.js';

export const prerender = false;

import type { APIRoute } from 'astro';

import { env as workerEnv } from 'cloudflare:workers';

export const POST: APIRoute = async ({ request, locals, cookies }) => {
  const env = workerEnv || process.env;
  
  try {
    const formData = (await request.json()) as Record<string, string>;
    const { fullName, email, phone, password } = formData;

    if (!fullName || (!email && !phone) || !password) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const db = createDb(env.DATABASE_URL);

    // Check if user already exists
    const conditions = [];
    if (email) conditions.push(eq(users.email, email));
    if (phone) conditions.push(eq(users.phone, phone));

    const existingUsers = await db.select().from(users).where(or(...conditions));
    if (existingUsers.length > 0) {
      return new Response(JSON.stringify({ error: 'Email or phone already registered' }), { status: 400 });
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
      secure: true, // Only true in production technically, but safe to set 
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return new Response(JSON.stringify({ success: true, redirect: '/profile' }), { status: 200 });

  } catch (error) {
    console.error('Registration error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
