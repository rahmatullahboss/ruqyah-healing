import { createDb } from '../../../db/client.js';
import { users } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';
import { createSession } from '../../../lib/auth.js';
import { createRemoteJWKSet, jwtVerify } from 'jose';

export const prerender = false;

import type { APIRoute } from 'astro';

import { env as workerEnv } from 'cloudflare:workers';

const GOOGLE_JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/oauth2/v3/certs')
);

function getAdminEmails(env: Record<string, string | undefined>) {
  return new Set(
    (env.ADMIN_EMAILS || '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

function jsonResponse(payload: Record<string, unknown>, status: number) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const env = workerEnv || process.env;
  const GOOGLE_CLIENT_ID = env.GOOGLE_CLIENT_ID;
  const adminEmails = getAdminEmails(env);

  if (!GOOGLE_CLIENT_ID) {
    return jsonResponse({ error: 'Google login is not configured' }, 500);
  }

  if (!env.DATABASE_URL) {
    return jsonResponse({ error: 'Database is not configured for Google login' }, 500);
  }

  try {
    const { idToken } = (await request.json()) as { idToken: string };

    if (!idToken) {
      return jsonResponse({ error: 'Missing id token' }, 400);
    }

    // Verify the Google id_token using JWKS
    const { payload } = await jwtVerify(idToken, GOOGLE_JWKS, {
      audience: GOOGLE_CLIENT_ID,
      issuer: ['https://accounts.google.com', 'accounts.google.com'],
    });

    const googleId = payload.sub as string;
    const email = payload.email as string;
    const name = (payload.name as string) || 'User';
    const isAdminEmail = !!email && adminEmails.has(email.toLowerCase());

    if (!googleId || !email) {
      return jsonResponse({ error: 'Invalid token payload' }, 400);
    }

    const db = createDb(env.DATABASE_URL);

    // 1. Check if user with this Google ID already exists
    const [existingByGoogle] = await db
      .select()
      .from(users)
      .where(eq(users.googleId, googleId))
      .limit(1);

    if (existingByGoogle) {
      if (isAdminEmail && existingByGoogle.role !== 'admin') {
        await db
          .update(users)
          .set({ role: 'admin' })
          .where(eq(users.id, existingByGoogle.id));
      }

      const token = await createSession(existingByGoogle.id, env);
      cookies.set('auth_token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
      return jsonResponse({ success: true, redirect: isAdminEmail || existingByGoogle.role === 'admin' ? '/admin' : '/profile' }, 200);
    }

    // 2. Check if user with same email exists (link accounts)
    const [existingByEmail] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingByEmail) {
      // Link Google ID to existing account
      await db
        .update(users)
        .set({ googleId, ...(isAdminEmail ? { role: 'admin' } : {}) })
        .where(eq(users.id, existingByEmail.id));

      const token = await createSession(existingByEmail.id, env);
      cookies.set('auth_token', token, {
        httpOnly: true,
        secure: true,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
      });
      return jsonResponse({ success: true, redirect: isAdminEmail || existingByEmail.role === 'admin' ? '/admin' : '/profile' }, 200);
    }

    // 3. Create new user
    const userId = crypto.randomUUID();
    await db.insert(users).values({
      id: userId,
      fullName: name,
      email,
      googleId,
      authProvider: 'google',
      role: isAdminEmail ? 'admin' : 'patient',
    });

    const token = await createSession(userId, env);
    cookies.set('auth_token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return jsonResponse({ success: true, redirect: isAdminEmail ? '/admin' : '/profile' }, 200);

  } catch (error: any) {
    console.error('Google auth error:', {
      name: error?.name,
      code: error?.code,
      message: error?.message,
    });

    const isJwtError = error?.code === 'ERR_JWT_CLAIM_VALIDATION'
      || error?.code === 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED'
      || error?.name === 'JWTClaimValidationFailed'
      || error?.name === 'JWSSignatureVerificationFailed'
      || error?.name === 'JWTExpired';

    if (isJwtError) {
      return jsonResponse({ error: 'Invalid Google token' }, 401);
    }

    return jsonResponse({ error: 'Google login server error' }, 500);
  }
};
