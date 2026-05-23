export const prerender = false;

import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request, params, locals }) => {
  const { path } = params;

  if (!path) {
    return new Response('Missing path', { status: 400 });
  }

  // Prevent path traversal attacks
  const normalized = path.replace(/\\/g, '/');
  if (normalized.includes('..') || normalized.startsWith('/') || normalized.includes('//')) {
    return new Response('Invalid path', { status: 400 });
  }

  try {
    const env = (locals as any).runtime?.env || (globalThis as any).process?.env;
    const bucket = env?.R2_IMAGES;

    if (!bucket) {
      return new Response('R2 bucket not configured', { status: 500 });
    }

    const object = await bucket.get(normalized);

    if (object === null) {
      return new Response('Image not found', { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('Cache-Control', 'public, max-age=31536000, immutable');
    headers.set('X-Content-Type-Options', 'nosniff');
    
    // The bucket returns a readable stream
    return new Response(object.body, {
      headers,
    });
  } catch (err) {
    console.error('R2 fetching error:', err);
    return new Response('Error viewing image', { status: 500 });
  }
};
