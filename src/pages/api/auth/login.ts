import { createDb } from '../../../db/client.js';
import { users } from '../../../db/schema.js';
import { eq, or } from 'drizzle-orm';
import { z } from 'zod';
import { verifyPassword, createSession, hashPassword, needsPasswordRehash } from '../../../lib/auth.js';
import { normalizeBangladeshPhone } from '../../../lib/appointments.js';

export const prerender = false;

import type { APIRoute } from 'astro';

import { env as workerEnv } from 'cloudflare:workers';

const loginSchema = z.object({
  identifier: z.string().trim().min(3).max(254),
  password: z.string().min(1).max(128),
});

function getAdminEmails(env: Record<string, string | undefined>) {
  return new Set(
    (env.ADMIN_EMAILS || '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Cache-Control': 'no-store', 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const env = workerEnv || process.env;
  const adminEmails = getAdminEmails(env);

  try {
    const parsed = loginSchema.safeParse(await request.json());
    if (!parsed.success) {
      return json({ error: 'Missing or invalid credentials' }, 400);
    }

    const { password } = parsed.data;
    const rawIdentifier = parsed.data.identifier;
    const emailIdentifier = rawIdentifier.toLowerCase();
    const phoneIdentifier = normalizeBangladeshPhone(rawIdentifier);
    const db = createDb(env.DATABASE_URL);

    const [user] = await db
      .select()
      .from(users)
      .where(or(eq(users.email, emailIdentifier), eq(users.phone, phoneIdentifier)))
      .limit(1);

    if (!user || !user.passwordHash) {
      return json({ error: 'Invalid credentials' }, 401);
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return json({ error: 'Invalid credentials' }, 401);
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
      maxAge: 60 * 60 * 24 * 7,
    });

    const shouldUseAdminRedirect = user.role === 'admin'
      || (!!user.email && adminEmails.has(user.email.toLowerCase()));

    return json({ success: true, redirect: shouldUseAdminRedirect ? '/admin' : '/profile' });
  } catch (error) {
    console.error('Login error:', error);
    return json({ error: 'Server error' }, 500);
  }
};
