export const prerender = false;
import type { APIRoute } from 'astro';
import { env as workerEnv } from 'cloudflare:workers';

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user || locals.user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 });
  }

  const env = workerEnv as any;
  const r2 = env.R2_IMAGES;
  if (!r2) {
    return new Response(JSON.stringify({ error: 'R2 not configured' }), { status: 500 });
  }

  try {
    const { key } = (await request.json()) as { key: string };

    if (!key || typeof key !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid key' }), { status: 400 });
    }

    // Prevent path traversal
    if (key.includes('..') || key.startsWith('/')) {
      return new Response(JSON.stringify({ error: 'Invalid key' }), { status: 400 });
    }

    await r2.delete(key);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('R2 delete error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
