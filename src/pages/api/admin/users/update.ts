import { createDb } from '../../../../db/client.js';
import { users } from '../../../../db/schema.js';
import { eq, and, ne } from 'drizzle-orm';
import { logAuditEvent } from '../../../../lib/audit.js';

export const prerender = false;

import type { APIRoute } from 'astro';

import { env as workerEnv } from 'cloudflare:workers';

export const POST: APIRoute = async ({ request, locals }) => {
  const env = workerEnv || process.env;

  try {
    const adminUser = locals.user;

    if (!adminUser || adminUser.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { userId, fullName, email, phone } = (await request.json()) as {
      userId: string;
      fullName: string;
      email: string;
      phone: string;
    };

    if (!userId) {
      return new Response(JSON.stringify({ error: 'User ID required' }), { status: 400 });
    }

    if (!fullName || fullName.trim().length < 2) {
      return new Response(
        JSON.stringify({ error: 'নাম কমপক্ষে ২ অক্ষর হতে হবে।' }),
        { status: 400 }
      );
    }

    const db = createDb(env.DATABASE_URL);

    // Check email uniqueness (exclude current user)
    if (email && email.trim()) {
      const emailExists = await db
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.email, email.trim()), ne(users.id, userId)));
      if (emailExists.length > 0) {
        return new Response(
          JSON.stringify({ error: 'এই ইমেইল অন্য ইউজারের আছে।' }),
          { status: 400 }
        );
      }
    }

    // Check phone uniqueness (exclude current user)
    if (phone && phone.trim()) {
      const phoneExists = await db
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.phone, phone.trim()), ne(users.id, userId)));
      if (phoneExists.length > 0) {
        return new Response(
          JSON.stringify({ error: 'এই ফোন নম্বর অন্য ইউজারের আছে।' }),
          { status: 400 }
        );
      }
    }

    await db
      .update(users)
      .set({
        fullName: fullName.trim(),
        email: email?.trim() || null,
        phone: phone?.trim() || null,
      })
      .where(eq(users.id, userId));

    await logAuditEvent(db, {
      adminId: adminUser.id,
      adminName: adminUser.fullName,
      action: 'update_user_profile',
      entityType: 'user',
      entityId: userId,
      details: { fullName: fullName.trim(), email: email?.trim(), phone: phone?.trim() },
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('User update error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
