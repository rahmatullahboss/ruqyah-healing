import { sequence } from 'astro:middleware';
import { env as workerEnv } from 'cloudflare:workers';
import { verifySession } from './lib/auth.js';
import { createDb } from './db/client.js';
import { users } from './db/schema.js';
import { eq } from 'drizzle-orm';
import { checkRateLimit, getClientIp, RATE_LIMITS } from './lib/rate-limit.js';
import { validateEnv } from './lib/env.js';

function getAdminEmails(env) {
  return new Set(
    (env.ADMIN_EMAILS || '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

/**
 * Rate limiting middleware — blocks abusive requests before they hit handlers.
 */
async function rateLimit(context, next) {
  const url = new URL(context.request.url);
  const path = url.pathname;
  const method = context.request.method;

  // Only rate limit POST requests to sensitive endpoints
  if (method !== 'POST') return next();

  let config = null;
  let category = '';

  if (path.startsWith('/api/auth/')) {
    config = RATE_LIMITS.auth;
    category = 'auth';
  } else if (path === '/api/chat') {
    config = RATE_LIMITS.chat;
    category = 'chat';
  } else if (path === '/api/appointments') {
    config = RATE_LIMITS.appointment;
    category = 'appointment';
  } else if (path.startsWith('/api/admin/')) {
    config = RATE_LIMITS.admin;
    category = 'admin';
  } else if (path === '/api/courses/enroll' || /^\/api\/courses\/[^/]+\/(progress|review|quiz\/[^/]+\/submit)$/.test(path)) {
    config = RATE_LIMITS.lms;
    category = 'lms';
  }

  if (config) {
    const ip = getClientIp(context.request);
    const key = `${category}:${ip}`;
    const result = checkRateLimit(key, config.maxRequests, config.windowMs);

    if (result.limited) {
      return new Response(
        JSON.stringify({
          error: 'অনেক বেশি রিকোয়েস্ট। কিছুক্ষণ পর আবার চেষ্টা করুন।',
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(Math.ceil(result.resetIn / 1000)),
          },
        }
      );
    }
  }

  return next();
}

/**
 * Authentication middleware — loads user from JWT token.
 */
async function auth(context, next) {
  const env = workerEnv || process.env;
  const adminEmails = getAdminEmails(env);

  // Validate env on first request
  const envCheck = validateEnv(env);
  if (!envCheck.valid) {
    const url = new URL(context.request.url);
    // Only block API routes if env is invalid — static pages can still load
    if (url.pathname.startsWith('/api/')) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error. Please contact administrator.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
  }

  const token = context.cookies.get('auth_token')?.value;

  if (token) {
    try {
      const userId = await verifySession(token, env);
      if (userId) {
        const db = createDb(env.DATABASE_URL);
        const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (user) {
          const isAdminEmail = !!user.email && adminEmails.has(user.email.toLowerCase());

          if (isAdminEmail && user.role !== 'admin') {
            await db
              .update(users)
              .set({ role: 'admin' })
              .where(eq(users.id, user.id));

            user.role = 'admin';
          }

          context.locals.user = user;
        }
      }
    } catch (err) {
      console.error('Failed to fetch user from DB in middleware', err);
    }
  }

  return next();
}

/**
 * Route protection middleware — guards /profile, /admin, and /api/admin routes.
 */
async function routeGuard(context, next) {
  const url = new URL(context.request.url);
  const path = url.pathname;
  const env = workerEnv || process.env;
  const adminEmails = getAdminEmails(env);
  const isAdminUser = !!context.locals.user && (
    context.locals.user.role === 'admin'
    || (!!context.locals.user.email && adminEmails.has(context.locals.user.email.toLowerCase()))
  );

  // Profile routes protection
  if (path.startsWith('/profile')) {
    if (!context.locals.user) {
      return context.redirect('/login');
    }
  }

  // Admin page routes protection
  if (path.startsWith('/admin')) {
    if (!context.locals.user) {
      return context.redirect('/login');
    }
    if (!isAdminUser) {
      return context.redirect('/profile');
    }
  }

  // API admin routes protection
  if (path.startsWith('/api/admin/')) {
    if (!context.locals.user || !isAdminUser) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // API auth profile edit protection
  if (path === '/api/auth/edit-profile') {
    if (!context.locals.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  return next();
}

export const onRequest = sequence(rateLimit, auth, routeGuard);
