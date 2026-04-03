import { createDb } from '../../../../db/client.js';
import { users } from '../../../../db/schema.js';
import { eq } from 'drizzle-orm';

export const prerender = false;

import type { APIRoute } from 'astro';

import { env as workerEnv } from 'cloudflare:workers';

export const POST: APIRoute = async ({ request, locals }) => {
  const env = workerEnv || process.env;
  
  try {
    const adminUser = locals.user;
    
    // Double check authentication + authorization inside route just in case
    if (!adminUser || adminUser.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const { userId, role } = (await request.json()) as { userId: string, role: string };

    if (!userId || !role || !['admin', 'patient'].includes(role)) {
      return new Response(JSON.stringify({ error: 'Invalid input' }), { status: 400 });
    }

    // Prevent removing your own admin access 
    if (adminUser.id === userId && role !== 'admin') {
      return new Response(JSON.stringify({ error: 'You cannot remove your own admin role.' }), { status: 403 });
    }

    const db = createDb(env.DATABASE_URL);

    await db.update(users)
      .set({ role })
      .where(eq(users.id, userId));

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    console.error('Role update error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
