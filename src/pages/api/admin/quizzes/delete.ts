import type { APIRoute } from 'astro';
import { env as workerEnv } from 'cloudflare:workers';
import { createDb } from '../../../../db/client.js';
import { courseQuizzes, courseQuizQuestions, courseQuizAttempts } from '../../../../db/schema.js';
import { eq, inArray } from 'drizzle-orm';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const env = workerEnv || process.env;
  const user = (locals as any).user;

  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 });
  }

  try {
    const body = await request.json() as Record<string, any>;
    const { id } = body;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Quiz ID is required' }), { status: 400 });
    }

    const db = createDb((env as any).DATABASE_URL);

    // Delete questions
    await db.delete(courseQuizQuestions).where(eq(courseQuizQuestions.quizId, id));

    // Delete attempts
    await db.delete(courseQuizAttempts).where(eq(courseQuizAttempts.quizId, id));

    // Delete quiz
    await db.delete(courseQuizzes).where(eq(courseQuizzes.id, id));

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Quiz delete error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
