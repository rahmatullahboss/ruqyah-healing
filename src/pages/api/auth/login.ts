import { createDb } from '../../../db/client.js';
import { users } from '../../../db/schema.js';
import { eq, or } from 'drizzle-orm';
import { verifyPassword, createSession, hashPassword, needsPasswordRehash } from '../../../lib/auth.js';

export const prerender = false;

import type { APIRoute } from 'astro';

import { env as workerEnv } from 'cloudflare:workers';

function getAdminEmails(env: Record<string, string | undefined>) {
  return new Set(
    (env.ADMIN_EMAILS || '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export const POST: APIRoute = async ({ request, locals, cookies }) => {
  const env = workerEnv || process.env;
  const adminEmails = getAdminEmails(env);

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

    // Google-only user trying password login — use generic message to prevent account enumeration
    if (!user.passwordHash) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
    }

    const isValid = await verifyPassword(password, user.passwordHash);

    if (!isValid) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), { status: 401 });
    }

    if (needsPasswordRehash(user.passwordHash)) {
      const upgradedHash = await hashPassword(password);
      await db
        .update(users)
        .set({ passwordHash: upgradedHash })
        .where(eq(users.id, user.id));
    }

    const token = await createSession(user.id, env);

    cookies.set('auth_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7 // 7 days
    });

    const shouldUseAdminRedirect = user.role === 'admin'
      || (!!user.email && adminEmails.has(user.email.toLowerCase()));

    return new Response(JSON.stringify({ success: true, redirect: shouldUseAdminRedirect ? '/admin' : '/profile' }), { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
