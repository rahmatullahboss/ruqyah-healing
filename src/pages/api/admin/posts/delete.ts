import { createDb } from '../../../../db/client.js';
import { deletePost } from '../../../../lib/posts.js';
import { logAuditEvent } from '../../../../lib/audit.js';

export const prerender = false;

import type { APIRoute } from 'astro';
import { env as workerEnv } from 'cloudflare:workers';

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user || locals.user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 });
  }

  const env = workerEnv || process.env;

  try {
    const { id } = await request.json();

    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing post id' }), { status: 400 });
    }

    const db = createDb(env.DATABASE_URL);
    await deletePost(db, id);

    await logAuditEvent(db, {
      adminId: locals.user.id,
      adminName: locals.user.fullName,
      action: 'delete',
      entityType: 'post',
      entityId: id,
      details: {},
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Delete post error:', error);
    return new Response(JSON.stringify({ error: 'মুছতে সমস্যা হয়েছে' }), { status: 500 });
  }
};
