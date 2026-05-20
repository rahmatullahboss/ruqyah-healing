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
  const allowedTypes = new Map([
    ['image/jpeg', ['jpg', 'jpeg']],
    ['image/png', ['png']],
    ['image/webp', ['webp']],
    ['image/gif', ['gif']],
    ['application/pdf', ['pdf']],
    ['video/mp4', ['mp4']],
    ['video/webm', ['webm']],
    ['video/quicktime', ['mov']],
  ]);
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  const allowedExtensions = allowedTypes.get(file.type);
  if (!allowedExtensions || !allowedExtensions.includes(extension)) {
    return new Response(JSON.stringify({ error: 'অসমর্থিত ফাইল টাইপ' }), { status: 400 });
  }

  const isVideo = file.type.startsWith('video/');
  const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
  if (file.size > maxSize) {
    return new Response(JSON.stringify({ error: isVideo ? 'ভিডিও খুব বড় (সর্বোচ্চ ১০০MB)' : 'ফাইল খুব বড় (সর্বোচ্চ ১০MB)' }), { status: 400 });
  }

  const folder = isVideo ? 'videos' : file.type === 'application/pdf' ? 'pdfs' : 'images';
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
