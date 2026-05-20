import type { APIRoute } from 'astro';
import { env as workerEnv } from 'cloudflare:workers';
import { createDb } from '../../../../db/client.js';
import { courseQuizzes, courseQuizQuestions } from '../../../../db/schema.js';
import { eq, sql } from 'drizzle-orm';
import crypto from 'node:crypto';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const env = workerEnv || process.env;
  const user = (locals as any).user;

  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 });
  }

  try {
    const body = await request.json() as Record<string, any>;
    const { moduleId, courseId, title, description, passingScore, timeLimit, maxAttempts, questions } = body;

    if (!courseId || !title) {
      return new Response(JSON.stringify({ error: 'Course ID and title are required' }), { status: 400 });
    }

    const db = createDb((env as any).DATABASE_URL);

    // Get next sort order
    const maxSort = await db.select({ max: sql`coalesce(max(${courseQuizzes.sortOrder}), 0)` })
      .from(courseQuizzes)
      .where(eq(courseQuizzes.courseId, courseId));

    const quizId = crypto.randomUUID();
    await db.insert(courseQuizzes).values({
      id: quizId,
      moduleId: moduleId || null,
      courseId,
      title,
      description: description || '',
      passingScore: passingScore || 60,
      timeLimit: timeLimit || null,
      maxAttempts: maxAttempts || null,
      sortOrder: Number(maxSort[0]?.max || 0) + 1,
    });

    // Insert questions if provided
    if (questions && Array.isArray(questions) && questions.length > 0) {
      const questionValues = questions.map((q: any, index: number) => ({
        id: crypto.randomUUID(),
        quizId,
        questionText: q.questionText,
        questionType: q.questionType || 'multiple_choice',
        options: q.options || [],
        explanation: q.explanation || '',
        sortOrder: index + 1,
      }));

      await db.insert(courseQuizQuestions).values(questionValues);
    }

    return new Response(JSON.stringify({ success: true, id: quizId }), { status: 200 });
  } catch (error) {
    console.error('Quiz create error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
