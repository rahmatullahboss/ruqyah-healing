export const prerender = false;

import type { APIRoute } from 'astro';
import { env as workerEnv } from 'cloudflare:workers';
import { createDb } from '../../../../db/client.js';
import { siteSettings } from '../../../../db/schema.js';
import { eq } from 'drizzle-orm';
import { logAuditEvent } from '../../../../lib/audit.js';

export const POST: APIRoute = async ({ request, locals }) => {
  if (!locals.user || (locals.user as any).role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 });
  }

  const env = (workerEnv || process.env) as any;

  try {
    const body = await request.json() as Record<string, any>;
    const { dailyNeuronLimit, systemPrompt } = body;

    const db = createDb(env.DATABASE_URL);

    if (dailyNeuronLimit !== undefined) {
      const limit = Number(dailyNeuronLimit);
      if (!Number.isFinite(limit) || limit < 100) {
        return new Response(JSON.stringify({ error: 'নিউরন লিমিট কমপক্ষে ১০০ হতে হবে' }), { status: 400 });
      }
      await db.insert(siteSettings).values({
        key: 'ai_daily_neuron_limit',
        value: limit,
      }).onConflictDoUpdate({
        target: siteSettings.key,
        set: { value: limit, updatedAt: new Date() },
      });
    }

    if (systemPrompt !== undefined) {
      if (typeof systemPrompt !== 'string' || systemPrompt.length > 10000) {
        return new Response(JSON.stringify({ error: 'সিস্টেম প্রম্পট সর্বোচ্চ ১০,০০০ অক্ষর হতে পারে' }), { status: 400 });
      }
      await db.insert(siteSettings).values({
        key: 'ai_system_prompt',
        value: systemPrompt,
      }).onConflictDoUpdate({
        target: siteSettings.key,
        set: { value: systemPrompt, updatedAt: new Date() },
      });
    }

    await logAuditEvent(db, {
      adminId: (locals.user as any).id,
      adminName: (locals.user as any).fullName,
      action: 'update',
      entityType: 'settings',
      entityId: 'ai_config',
      details: {
        ...(dailyNeuronLimit !== undefined ? { dailyNeuronLimit } : {}),
        ...(systemPrompt !== undefined ? { promptLength: systemPrompt.length } : {}),
      },
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('AI config update error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
