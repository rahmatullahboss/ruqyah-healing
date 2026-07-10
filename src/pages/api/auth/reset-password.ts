import { createHash } from 'node:crypto';
import { createDb } from '../../../db/client.js';
import { users } from '../../../db/schema.js';
import { eq, and, gt } from 'drizzle-orm';
import { z } from 'zod';
import { hashPassword } from '../../../lib/auth.js';

export const prerender = false;

import type { APIRoute } from 'astro';
import { env as workerEnv } from 'cloudflare:workers';

const requestSchema = z.object({
  token: z.string().trim().length(64, 'Invalid reset token'),
  password: z.string().min(8, 'Password must be at least 8 characters long').max(128),
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Cache-Control': 'no-store', 'Content-Type': 'application/json' },
  });
}

function hashResetToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

export const POST: APIRoute = async ({ request }) => {
  const env = workerEnv || process.env;

  try {
    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return json({ error: parsed.error.issues[0]?.message || 'Missing token or password' }, 400);
    }

    const db = createDb(env.DATABASE_URL);
    const tokenHash = hashResetToken(parsed.data.token);
    const [user] = await db
      .select()
      .from(users)
      .where(and(eq(users.resetToken, tokenHash), gt(users.resetTokenExpires, new Date())))
      .limit(1);

    if (!user) {
      return json({ error: 'Invalid or expired reset token' }, 400);
    }

    const upgradedHash = await hashPassword(parsed.data.password);
    await db
      .update(users)
      .set({
        passwordHash: upgradedHash,
        authProvider: 'local',
        resetToken: null,
        resetTokenExpires: null,
      })
      .where(eq(users.id, user.id));

    return json({ success: true, message: 'Password has been successfully changed.' });
  } catch (error) {
    console.error('Password reset error:', error);
    return json({ error: 'Server error processing request' }, 500);
  }
};
