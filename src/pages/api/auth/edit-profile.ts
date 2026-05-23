import { createDb } from '../../../db/client.js';
import { users } from '../../../db/schema.js';
import { eq, or, and, ne } from 'drizzle-orm';
import { z } from 'zod';

export const prerender = false;

import type { APIRoute } from 'astro';

import { env as workerEnv } from 'cloudflare:workers';

const editProfileSchema = z.object({
  fullName: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().regex(/^0\d{10}$/, 'Invalid phone number').optional().or(z.literal('')),
});

export const POST: APIRoute = async ({ request, locals }) => {
  const env = workerEnv || process.env;

  try {
    const user = locals.user;
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const body = await request.json();
    const parsed = editProfileSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }), { status: 400 });
    }
    const { fullName, email, phone } = parsed.data;

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
