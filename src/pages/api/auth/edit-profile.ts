import { createDb } from '../../../db/client.js';
import { users } from '../../../db/schema.js';
import { eq, or, and, ne } from 'drizzle-orm';

export const prerender = false;

import type { APIRoute } from 'astro';

import { env as workerEnv } from 'cloudflare:workers';

export const POST: APIRoute = async ({ request, locals }) => {
  const env = workerEnv || process.env;
  
  try {
    const user = locals.user;
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const formData = (await request.json()) as Record<string, string>;
    const { fullName, email, phone } = formData;

    if (!fullName) {
      return new Response(JSON.stringify({ error: 'Full name is required' }), { status: 400 });
    }

    const db = createDb(env.DATABASE_URL);

    // Check if new email or phone conflicts with other users
    const conditions = [];
    if (email) conditions.push(eq(users.email, email));
    if (phone) conditions.push(eq(users.phone, phone));

    if (conditions.length > 0) {
      const existingConflict = await db.select().from(users).where(
        and(
          ne(users.id, user.id), // Not exactly the current user
          or(...conditions)
        )
      );
      
      if (existingConflict.length > 0) {
        return new Response(JSON.stringify({ error: 'Email or phone already in use by another account' }), { status: 400 });
      }
    }

    await db.update(users)
      .set({
        fullName,
        email: email || null,
        phone: phone || null,
      })
      .where(eq(users.id, user.id));

    return new Response(JSON.stringify({ success: true, redirect: '/profile' }), { status: 200 });

  } catch (error) {
    console.error('Profile edit error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
