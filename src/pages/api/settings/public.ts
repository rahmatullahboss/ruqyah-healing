import type { APIRoute } from 'astro';
import { createDb } from '../../../db/client.js';
import { siteSettings } from '../../../db/schema.js';
import { env as workerEnv } from 'cloudflare:workers';
import { buildPublicSiteSettings } from '../../../lib/public-site-settings.js';

export const prerender = false;

export const GET: APIRoute = async () => {
  const env = (workerEnv || process.env) as any;
  const db = createDb(env.DATABASE_URL);
  const rows = await db.select().from(siteSettings);
  const settings = {};
  for (const row of rows) {
    settings[row.key] = row.value;
  }

  return new Response(JSON.stringify({
    ...buildPublicSiteSettings(settings),
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
