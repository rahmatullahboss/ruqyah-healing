import { createDb } from '../../../db/client.js';
import { users } from '../../../db/schema.js';
import { eq, and, gt } from 'drizzle-orm';
import { hashPassword } from '../../../lib/auth.js';

export const prerender = false;

import type { APIRoute } from 'astro';
import { env as workerEnv } from 'cloudflare:workers';

export const POST: APIRoute = async ({ request }) => {
  const env = workerEnv || process.env;

  try {
    const formData = (await request.json()) as Record<string, string>;
    const { token, password } = formData;

    if (!token || !password) {
      return new Response(JSON.stringify({ error: 'Missing token or password' }), { status: 400 });
    }

    if (password.length < 8) {
      return new Response(JSON.stringify({ error: 'Password must be at least 8 characters long' }), { status: 400 });
    }

    const db = createDb(env.DATABASE_URL);

    // Find user with valid token
    const [user] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.resetToken, token),
          gt(users.resetTokenExpires, new Date())
        )
      )
      .limit(1);

    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid or expired reset token' }), { status: 400 });
    }

    // Hash new password
    const upgradedHash = await hashPassword(password);

    // Update user's password and remove token
    await db
      .update(users)
      .set({ 
        passwordHash: upgradedHash,
        resetToken: null,
        resetTokenExpires: null
      })
      .where(eq(users.id, user.id));

    return new Response(JSON.stringify({ success: true, message: 'Password has been successfully changed.' }), { status: 200 });

  } catch (error) {
    console.error('Password reset error:', error);
    return new Response(JSON.stringify({ error: 'Server error processing request' }), { status: 500 });
  }
};
