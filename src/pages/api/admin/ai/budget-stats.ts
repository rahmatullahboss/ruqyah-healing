export const prerender = false;

import type { APIRoute } from 'astro';
import { env as workerEnv } from 'cloudflare:workers';

export const GET: APIRoute = async ({ locals }) => {
  if (!locals.user || (locals.user as any).role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 });
  }

  const env = (workerEnv || process.env) as any;
  const kvBudget = env.AI_BUDGET;

  if (!kvBudget?.get) {
    return new Response(JSON.stringify({ days: [], error: 'AI_BUDGET KV not available' }), { status: 200 });
  }

  try {
    const days: Array<{ date: string; neurons: number }> = [];

    // Read last 30 days in parallel
    const promises = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().slice(0, 10);
      const key = `daily-neurons:${dateStr}`;
      promises.push(
        kvBudget.get(key).then((raw: string | null) => ({
          date: dateStr,
          neurons: raw ? (JSON.parse(raw).usedNeurons || 0) : 0,
        }))
      );
    }

    const results = await Promise.all(promises);
    days.push(...results.reverse()); // chronological order

    return new Response(JSON.stringify({ days }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Budget stats error:', error);
    return new Response(JSON.stringify({ days: [], error: 'Failed to fetch stats' }), { status: 500 });
  }
};
