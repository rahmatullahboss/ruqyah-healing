import type { APIRoute } from 'astro';
import { env as workerEnv } from 'cloudflare:workers';
import { createDb } from '../../../../db/client.js';
import { courseQuizzes, courseQuizQuestions } from '../../../../db/schema.js';
import { eq } from 'drizzle-orm';
import crypto from 'node:crypto';
import { validateQuizQuestions } from '../../../../lib/api-helpers.js';
import { logAuditEvent } from '../../../../lib/audit.js';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const env = workerEnv || process.env;
  const user = (locals as any).user;

  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 });
  }

  try {
    const body = await request.json() as Record<string, any>;
    const { id, title, description, passingScore, timeLimit, maxAttempts, moduleId, questions } = body;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Quiz ID is required' }), { status: 400 });
    }

    const db = createDb((env as any).DATABASE_URL);

    // Update quiz metadata
    const updates: Record<string, any> = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (passingScore !== undefined) updates.passingScore = passingScore;
    if (timeLimit !== undefined) updates.timeLimit = timeLimit;
    if (maxAttempts !== undefined) updates.maxAttempts = maxAttempts;
    if (moduleId !== undefined) updates.moduleId = moduleId;

    if (Object.keys(updates).length > 0) {
      await db.update(courseQuizzes).set(updates).where(eq(courseQuizzes.id, id));
    }

    // Replace all questions if provided
    if (questions && Array.isArray(questions)) {
      const validationError = validateQuizQuestions(questions);
      if (validationError) {
        return new Response(JSON.stringify({ error: validationError }), { status: 400 });
      }

      // Fetch existing question IDs to preserve references in past attempts
      const existingQuestions = await db.select({ id: courseQuizQuestions.id })
        .from(courseQuizQuestions)
        .where(eq(courseQuizQuestions.quizId, id));
      const existingIds = new Set(existingQuestions.map((q) => q.id));

      // Delete existing questions
      await db.delete(courseQuizQuestions).where(eq(courseQuizQuestions.quizId, id));

      // Insert new questions, preserving existing IDs where possible
      if (questions.length > 0) {
        const questionValues = questions.map((q: any, index: number) => ({
          id: existingIds.has(q.id) ? q.id : crypto.randomUUID(),
          quizId: id,
          questionText: q.questionText,
          questionType: q.questionType || 'multiple_choice',
          options: q.options || [],
          explanation: q.explanation || '',
          sortOrder: index + 1,
        }));

        await db.insert(courseQuizQuestions).values(questionValues);
      }
    }

    await logAuditEvent(db, {
      adminId: user.id,
      adminName: user.fullName,
      action: 'update',
      entityType: 'quiz',
      entityId: id,
      details: { title, questionsUpdated: !!questions },
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Quiz update error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
