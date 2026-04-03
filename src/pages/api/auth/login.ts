import { createDb } from '../../../db/client.js';
import { users } from '../../../db/schema.js';
import { eq, or } from 'drizzle-orm';
import { verifyPassword, createSession } from '../../../lib/auth.js';

export const prerender = false;

import type { APIRoute } from 'astro';

import { env as workerEnv } from 'cloudflare:workers';

export const POST: APIRoute = async ({ request, locals, cookies }) => {
  const env = workerEnv || process.env;

  try {
    const formData = (await request.json()) as Record<string, string>;
    const { identifier, password } = formData; // identifier can be email or phone

    if (!identifier || !password) {
      return new Response(JSON.stringify({ error: 'Missing credentials' }), { status: 400 });
    }

    const db = createDb(env.DATABASE_URL);

    // Find user by email or phone
    const [user] = await db
      .select()
      .from(users)
      .where(or(eq(users.email, identifier), eq(users.phone, identifier)))
      .limit(1);

    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
    }

    const token = await createSession(user.id, env);

    cookies.set('auth_token', token, {
      httpOnly: true,
      secure: true,
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    return new Response(JSON.stringify({ success: true, redirect: '/profile' }), { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
