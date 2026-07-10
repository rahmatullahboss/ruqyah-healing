import { createHash, randomBytes } from 'node:crypto';
import { createDb } from '../../../db/client.js';
import { users } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';
import { Resend } from 'resend';
import { z } from 'zod';

export const prerender = false;

import type { APIRoute } from 'astro';
import { env as workerEnv } from 'cloudflare:workers';

const requestSchema = z.object({
  email: z.string().trim().email('সঠিক ইমেইল দিন').max(254).transform((value) => value.toLowerCase()),
});
const GENERIC_MESSAGE = 'If an account with that email exists, we sent a password reset link.';

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Cache-Control': 'no-store', 'Content-Type': 'application/json' },
  });
}

function hashResetToken(token: string) {
  return createHash('sha256').update(token).digest('hex');
}

function escapeHtml(value: unknown) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function getPublicSiteOrigin(env: Record<string, string | undefined>) {
  const candidate = env.PUBLIC_SITE_URL || env.SITE_URL || 'https://ruqyahhealing.com';
  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== 'https:' && parsed.hostname !== 'localhost') throw new Error('Unsafe site URL');
    return parsed.origin;
  } catch {
    return 'https://ruqyahhealing.com';
  }
}

export const POST: APIRoute = async ({ request }) => {
  const env = workerEnv || process.env;

  if (!env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not configured');
    return json({ error: 'Email service is not configured.' }, 500);
  }

  try {
    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) {
      return json({ error: parsed.error.issues[0]?.message || 'Missing email address' }, 400);
    }

    const db = createDb(env.DATABASE_URL);
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, parsed.data.email))
      .limit(1);

    if (!user || (user.authProvider === 'google' && !user.passwordHash) || !user.email) {
      return json({ success: true, message: GENERIC_MESSAGE });
    }

    const rawToken = randomBytes(32).toString('hex');
    const tokenHash = hashResetToken(rawToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await db
      .update(users)
      .set({ resetToken: tokenHash, resetTokenExpires: expiresAt })
      .where(eq(users.id, user.id));

    const resetUrl = new URL('/reset-password', getPublicSiteOrigin(env));
    resetUrl.searchParams.set('token', rawToken);

    const resend = new Resend(env.RESEND_API_KEY);
    const fromAddress = env.RESEND_FROM_EMAIL || 'Ruqyah Healing <onboarding@resend.dev>';
    const { error: emailError } = await resend.emails.send({
      from: fromAddress,
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.5;">
          <h2>Password Reset Request</h2>
          <p>Hello ${escapeHtml(user.fullName)},</p>
          <p>We received a request to reset the password associated with this email address.</p>
          <p>Click the button below to reset your password. This link will expire in 1 hour.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${escapeHtml(resetUrl.toString())}" style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p>If you did not request this, please ignore this email.</p>
          <hr style="border: 1px solid #E5E7EB; margin: 30px 0;">
          <p style="color: #6B7280; font-size: 12px;">For your security, don't forward this email to anyone.</p>
        </div>
      `,
    });

    if (emailError) {
      await db.update(users)
        .set({ resetToken: null, resetTokenExpires: null })
        .where(eq(users.id, user.id));
      throw new Error(`Resend failed: ${emailError.message}`);
    }

    return json({ success: true, message: GENERIC_MESSAGE });
  } catch (error) {
    console.error('Password reset request error:', error);
    return json({ error: 'Server error processing request' }, 500);
  }
};
