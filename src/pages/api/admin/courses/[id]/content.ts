import type { APIRoute } from 'astro';
import { env as workerEnv } from 'cloudflare:workers';
import { createDb } from '../../../../../db/client.js';
import { getCourseContentTree } from '../../../../../lib/lms.js';

export const prerender = false;

export const GET: APIRoute = async ({ params, locals }) => {
  const env = workerEnv || process.env;
  const user = (locals as any).user;

  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 });
  }

  try {
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: 'Course ID is required' }), { status: 400 });
    }

    const db = createDb((env as any).DATABASE_URL);
    const contentTree = await getCourseContentTree(db, id);

    return new Response(JSON.stringify({ success: true, data: contentTree }), { status: 200 });
  } catch (error) {
    console.error('Course content fetch error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
