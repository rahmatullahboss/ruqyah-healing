import { createDb } from '../../../db/client.js';
import { testResults } from '../../../db/schema.js';
import type { APIRoute } from 'astro';
import { env as workerEnv } from 'cloudflare:workers';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const env = workerEnv || process.env;

  try {
    const user = locals.user;
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const body = await request.json() as Record<string, any>;

    // Validate required fields
    if (!body.testType || body.score === undefined || !body.resultLevel || !body.resultText) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400 });
    }

    const db = createDb((env as any).DATABASE_URL);

    await db.insert(testResults).values({
      id: crypto.randomUUID(),
      userId: user.id,
      testType: body.testType,
      testTitle: body.testTitle || body.testType,
      score: body.score,
      totalQuestions: body.totalQuestions || 0,
      yesCount: body.yesCount || 0,
      maybeCount: body.maybeCount || 0,
      noCount: body.noCount || 0,
      resultLevel: body.resultLevel,
      resultText: body.resultText,
      answers: body.answers || [],
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Test result save error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};