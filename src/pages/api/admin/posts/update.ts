import { createDb } from '../../../../db/client.js';
import { updatePost } from '../../../../lib/posts.js';
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
    const data = await request.json();
    const { id, title, slug, excerpt, category, tags, date, content, published } = data;

    if (!id || !title || !slug || !excerpt || !category || !date || !content) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    // Content size limit: 500KB
    if (typeof content === 'string' && content.length > 500_000) {
      return new Response(JSON.stringify({ error: 'কন্টেন্ট খুব বড়। সর্বোচ্চ ৫০০KB অনুমোদিত।' }), { status: 400 });
    }

    // Validate slug format
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return new Response(JSON.stringify({ error: 'স্লাগ শুধু ছোট হাতের অক্ষর, সংখ্যা এবং হাইফেন হতে পারে' }), { status: 400 });
    }

    const db = createDb(env.DATABASE_URL);
    await updatePost(db, id, {
      slug,
      title,
      excerpt,
      category,
      tags: tags || [],
      date,
      content,
      published: published !== false,
    });

    await logAuditEvent(db, {
      adminId: locals.user.id,
      adminName: locals.user.fullName,
      action: 'update',
      entityType: 'post',
      entityId: id,
      details: { title, slug },
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error: any) {
    console.error('Update post error:', error);
    const msg = error.message?.includes('unique') ? 'এই স্লাগ আগে থেকেই আছে' : 'আপডেট করতে সমস্যা হয়েছে';
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
};
