import type { APIRoute } from 'astro';
import { createDb } from '../../../../db/client.js';
import { siteSettings } from '../../../../db/schema.js';
import { env as workerEnv } from 'cloudflare:workers';

export const prerender = false;

export const GET: APIRoute = async ({ locals }) => {
  const user = locals.user;
  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 });
  }

  const env = (workerEnv || process.env) as any;
  const db = createDb(env.DATABASE_URL);
  const rows = await db.select().from(siteSettings);
  const settings: Record<string, any> = {};
  for (const row of rows) {
    settings[row.key] = row.value;
  }
  return new Response(JSON.stringify(settings), {
    headers: { 'Content-Type': 'application/json' },
  });
};
