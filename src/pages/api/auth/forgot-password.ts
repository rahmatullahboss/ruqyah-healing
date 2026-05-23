import { createDb } from '../../../db/client.js';
import { users } from '../../../db/schema.js';
import { eq } from 'drizzle-orm';
import { Resend } from 'resend';

export const prerender = false;

import type { APIRoute } from 'astro';
import { env as workerEnv } from 'cloudflare:workers';

export const POST: APIRoute = async ({ request, url }) => {
  const env = workerEnv || process.env;
  
  if (!env.RESEND_API_KEY) {
    console.error('RESEND_API_KEY is not configured');
    return new Response(JSON.stringify({ error: 'Email service is not configured.' }), { status: 500 });
  }

  try {
    const formData = (await request.json()) as Record<string, string>;
    const { email } = formData;

    if (!email) {
      return new Response(JSON.stringify({ error: 'Missing email address' }), { status: 400 });
    }

    const db = createDb(env.DATABASE_URL);

    // Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      // Don't leak whether the email exists or not
      return new Response(JSON.stringify({ success: true, message: 'If an account with that email exists, we sent a password reset link.' }), { status: 200 });
    }

    // Google-only user — don't leak provider info, return same generic response
    if (user.authProvider === 'google' && !user.passwordHash) {
      return new Response(JSON.stringify({ success: true, message: 'If an account with that email exists, we sent a password reset link.' }), { status: 200 });
    }

    // Generate token
    const token = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    await db
      .update(users)
      .set({ 
        resetToken: token,
        resetTokenExpires: expiresAt
      })
      .where(eq(users.id, user.id));

    // Send email using Resend
    const resend = new Resend(env.RESEND_API_KEY);
    
    const resetUrl = new URL(`/reset-password?token=${token}`, url.origin).toString();

    const fromAddress = env.RESEND_FROM_EMAIL || 'Acme <onboarding@resend.dev>';

    await resend.emails.send({
      from: fromAddress,
      to: user.email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; line-height: 1.5;">
          <h2>Password Reset Request</h2>
          <p>Hello ${user.fullName},</p>
          <p>We received a request to reset the password associated with this email address.</p>
          <p>Click the button below to reset your password. This link will expire in 1 hour.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p>If you did not request this, please ignore this email.</p>
          <hr style="border: 1px solid #E5E7EB; margin: 30px 0;">
          <p style="color: #6B7280; font-size: 12px;">For your security, don't forward this email to anyone.</p>
        </div>
      `
    });

    return new Response(JSON.stringify({ success: true, message: 'If an account with that email exists, we sent a password reset link.' }), { status: 200 });

  } catch (error) {
    console.error('Password reset request error:', error);
    return new Response(JSON.stringify({ error: 'Server error processing request' }), { status: 500 });
  }
};
