import { createDb } from '../../../../db/client.js';
import { createPost } from '../../../../lib/posts.js';
import { logAuditEvent } from '../../../../lib/audit.js';
import { sanitizeHtml } from '../../../../lib/markdown.js';

export const prerender = false;

import type { APIRoute } from 'astro';
import { env as workerEnv } from 'cloudflare:workers';

interface CreatePostBody {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags?: string[];
  date: string;
  content?: string;
  contentHtml?: string;
  published?: boolean;
}

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user || locals.user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 });
  }

  const env = (workerEnv || process.env) as Record<string, string>;

  try {
    const data = (await request.json()) as CreatePostBody;
    const { title, slug, excerpt, category, tags, date, published, content, contentHtml } = data;

    // Basic required metadata must always be present
    if (!title || !slug || !excerpt || !category || !date) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    // At least one content form must be provided
    if (!contentHtml && !content) {
      return new Response(JSON.stringify({ error: 'কন্টেন্ট প্রয়োজন' }), { status: 400 });
    }

    // Content size limit: 500KB (check whichever field is present)
    const contentToCheck = contentHtml ?? content ?? '';
    if (contentToCheck.length > 500_000) {
      return new Response(JSON.stringify({ error: 'কন্টেন্ট খুব বড়। সর্বোচ্চ ৫০০KB অনুমোদিত।' }), { status: 400 });
    }

    // Validate slug format
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      return new Response(JSON.stringify({ error: 'স্লাগ শুধু ছোট হাতের অক্ষর, সংখ্যা এবং হাইফেন হতে পারে' }), { status: 400 });
    }

    // Sanitize TipTap HTML before persistence
    const sanitizedHtml = contentHtml ? sanitizeHtml(contentHtml) : null;

    const db = createDb(env['DATABASE_URL']);
    await createPost(db, {
      slug,
      title,
      excerpt,
      category,
      tags: tags || [],
      date,
      // Legacy Markdown field — kept for backward compat; empty for new TipTap posts
      content: content ?? '',
      // New canonical HTML field — set for all TipTap posts
      contentHtml: sanitizedHtml,
      published: published !== false,
    });

    await logAuditEvent(db, {
      adminId: locals.user.id,
      adminName: locals.user.fullName,
      action: 'create',
      entityType: 'post',
      entityId: slug,
      details: { title, format: contentHtml ? 'html' : 'markdown' },
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error: any) {
    console.error('Create post error:', error);
    const msg = error.message?.includes('unique') ? 'এই স্লাগ আগে থেকেই আছে' : 'সেভ করতে সমস্যা হয়েছে';
    return new Response(JSON.stringify({ error: msg }), { status: 500 });
  }
};
