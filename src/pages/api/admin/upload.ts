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

  const formData = await request.formData();
  const file = formData.get('file') as File | null;
  if (!file) {
    return new Response(JSON.stringify({ error: 'No file' }), { status: 400 });
  }

  // Validate type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    return new Response(JSON.stringify({ error: 'অসমর্থিত ফাইল টাইপ' }), { status: 400 });
  }

  // Size limit: 10MB
  if (file.size > 10 * 1024 * 1024) {
    return new Response(JSON.stringify({ error: 'ফাইল খুব বড় (সর্বোচ্চ ১০MB)' }), { status: 400 });
  }

  const folder = file.type === 'application/pdf' ? 'pdfs' : 'images';
  const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const key = `${folder}/${Date.now()}-${safeName}`;

  await r2.put(key, file.stream(), {
    httpMetadata: { contentType: file.type },
  });

  return new Response(JSON.stringify({
    success: true,
    key,
    url: `/api/images/${key}`,
  }), { status: 200 });
};
