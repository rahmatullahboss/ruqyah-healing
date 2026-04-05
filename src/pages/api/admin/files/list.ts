export const prerender = false;
import type { APIRoute } from 'astro';
import { env as workerEnv } from 'cloudflare:workers';

export const GET: APIRoute = async ({ request, locals }) => {
  if (!locals.user || locals.user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 });
  }

  const env = workerEnv as any;
  const r2 = env.R2_IMAGES;
  if (!r2) {
    return new Response(JSON.stringify({ error: 'R2 not configured' }), { status: 500 });
  }

  try {
    const url = new URL(request.url);
    const prefix = url.searchParams.get('prefix') || '';
    const list = await r2.list({ prefix, limit: 100 });
    const files = list.objects.map((obj: any) => ({
      key: obj.key,
      size: obj.size,
      uploaded: obj.uploaded?.toISOString(),
      url: `/api/images/${obj.key}`,
    }));

    return new Response(JSON.stringify({ files }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('R2 list error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
