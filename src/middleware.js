import { env as workerEnv } from 'cloudflare:workers';
import { verifySession } from './lib/auth.js';
import { createDb } from './db/client.js';
import { users } from './db/schema.js';
import { eq } from 'drizzle-orm';

export const onRequest = async (context, next) => {
  const env = workerEnv || process.env;

  const token = context.cookies.get('auth_token')?.value;

  if (token) {
    const userId = await verifySession(token, env);
    if (userId) {
      try {
        const db = createDb(env.DATABASE_URL);
        const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
        if (user) {
          context.locals.user = user;
        }
      } catch (err) {
        console.error('Failed to fetch user from DB in middleware', err);
      }
    }
  }

  const url = new URL(context.request.url);
  const path = url.pathname;

  // Profile routes protection
  if (path.startsWith('/profile')) {
    if (!context.locals.user) {
      return context.redirect('/login');
    }
  }

  // Admin routes protection
  if (path.startsWith('/admin')) {
    if (!context.locals.user) {
      return context.redirect('/login');
    }
    if (context.locals.user.role !== 'admin') {
      return context.redirect('/profile'); // or display a 403 Forbidden
    }
  }

  return next();
};
