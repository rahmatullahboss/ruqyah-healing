import type { APIRoute } from 'astro';
import { env as workerEnv } from 'cloudflare:workers';
import { createDb } from '../../../../../../db/client.js';
import { courseQuizQuestions, courseQuizAttempts } from '../../../../../../db/schema.js';
import { eq, and, desc, sql } from 'drizzle-orm';
import crypto from 'node:crypto';
import { z } from 'zod';
import { getQuizAccess } from '../../../../../../lib/lms-access.js';

export const prerender = false;

const quizSubmitSchema = z.object({
  answers: z.array(z.object({
    questionId: z.string().trim().min(1).max(100),
    selectedOption: z.number().int().min(-1).max(1000),
  })).max(500),
  startedAt: z.string().datetime({ offset: true }).optional(),
});

export const POST: APIRoute = async ({ params, request, locals }) => {
  const env = workerEnv || process.env;
  const user = (locals as any).user;

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const { id: courseId, quizId } = params;
    if (!courseId || !quizId) {
      return new Response(JSON.stringify({ error: 'Course ID and Quiz ID required' }), { status: 400 });
    }

    const parsed = quizSubmitSchema.safeParse(await request.json());
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: 'Invalid quiz submission', details: parsed.error.issues }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const { answers, startedAt } = parsed.data;

    const db = createDb((env as any).DATABASE_URL);

    const quizAccess = await getQuizAccess(db, { user, courseId, quizId });
    if (!quizAccess.allowed) {
      const status = quizAccess.status === 404 ? 404 : 403;
      const error = quizAccess.reason === 'quiz_not_found'
        ? 'Quiz not found'
        : quizAccess.reason === 'course_not_found'
          ? 'Course not found'
          : quizAccess.reason === 'quiz_sequence_locked'
            ? 'আগের লেসনগুলো সম্পন্ন করার পর কুইজ দিতে পারবেন।'
            : 'Not enrolled';
      return new Response(JSON.stringify({ error, reason: quizAccess.reason }), { status });
    }

    const quiz = quizAccess.quiz;

    if (quiz.timeLimit) {
      if (!startedAt) {
        return new Response(JSON.stringify({ error: 'কুইজ শুরুর সময় পাওয়া যায়নি।', reason: 'missing_started_at' }), { status: 400 });
      }
      const startedMs = new Date(startedAt).getTime();
      const nowMs = Date.now();
      const allowedMs = Number(quiz.timeLimit) * 60 * 1000;
      const graceMs = 30 * 1000;
      if (!Number.isFinite(startedMs) || startedMs > nowMs + graceMs || nowMs - startedMs > allowedMs + graceMs) {
        return new Response(JSON.stringify({ error: 'কুইজের সময়সীমা শেষ হয়েছে।', reason: 'time_limit_exceeded' }), { status: 400 });
      }
    }

    // Max attempts are checked again inside the save transaction with an advisory lock.
    // That prevents rapid concurrent submits from bypassing the limit.

    // Get questions
    const questions = await db.select().from(courseQuizQuestions)
      .where(eq(courseQuizQuestions.quizId, quizId));

    // Grade the quiz — deduplicate by questionId (last answer wins)
    const questionMap = new Map(questions.map(q => [q.id, q]));
    const dedupedAnswers = [...new Map(answers.map((a) => [a.questionId, a])).values()];
    if (dedupedAnswers.length > questions.length || dedupedAnswers.some((answer) => !questionMap.has(answer.questionId))) {
      return new Response(JSON.stringify({ error: 'Quiz answers contain unknown questions' }), { status: 400 });
    }
    let correctCount = 0;

    const gradedAnswers = dedupedAnswers.map((a: any) => {
      const question = questionMap.get(a.questionId);
      if (!question) return { ...a, isCorrect: false };

      const options = typeof question.options === 'string' ? JSON.parse(question.options) : question.options;
      const correctIndex = options.findIndex((o: any) => o.isCorrect);
      const isCorrect = correctIndex >= 0 && a.selectedOption === correctIndex;

      if (isCorrect) correctCount++;
      return { ...a, isCorrect };
    });

    const totalQuestions = questions.length;
    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const passed = score >= quiz.passingScore;

    // Save attempt atomically. The transaction-scoped advisory lock serializes attempts
    // for the same user+quiz so maxAttempts cannot be bypassed by concurrent submits.
    const attemptId = crypto.randomUUID();
    const completedAt = new Date();
    try {
      await db.transaction(async (tx: any) => {
        await tx.execute(sql`SELECT pg_advisory_xact_lock(hashtext(${user.id}), hashtext(${quizId}))`);

        if (quiz.maxAttempts) {
          const attempts = await tx.select({ id: courseQuizAttempts.id }).from(courseQuizAttempts)
            .where(and(eq(courseQuizAttempts.userId, user.id), eq(courseQuizAttempts.quizId, quizId)));
          if (attempts.length >= quiz.maxAttempts) {
            throw new Error('MAX_ATTEMPTS_REACHED');
          }
        }

        await tx.insert(courseQuizAttempts).values({
          id: attemptId,
          userId: user.id,
          quizId,
          courseId,
          score,
          totalQuestions,
          correctAnswers: correctCount,
          answers: gradedAnswers,
          passed,
          startedAt: startedAt ? new Date(startedAt) : completedAt,
          completedAt,
        });
      });
    } catch (error) {
      if (error instanceof Error && error.message === 'MAX_ATTEMPTS_REACHED') {
        return new Response(JSON.stringify({ error: 'Max attempts reached' }), { status: 400 });
      }
      throw error;
    }

    return new Response(JSON.stringify({
      success: true,
      attemptId,
      score,
      totalQuestions,
      correctAnswers: correctCount,
      passed,
      passingScore: quiz.passingScore,
      answers: gradedAnswers,
    }), { status: 200 });
  } catch (error) {
    console.error('Quiz submit error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};

// GET: Get quiz attempts
export const GET: APIRoute = async ({ params, locals }) => {
  const env = workerEnv || process.env;
  const user = (locals as any).user;

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const { id: courseId, quizId } = params;
    const db = createDb((env as any).DATABASE_URL);

    const quizAccess = await getQuizAccess(db, { user, courseId, quizId });
    if (!quizAccess.allowed) {
      const status = quizAccess.status === 404 ? 404 : 403;
      const error = quizAccess.reason === 'quiz_not_found'
        ? 'Quiz not found'
        : quizAccess.reason === 'course_not_found'
          ? 'Course not found'
          : quizAccess.reason === 'quiz_sequence_locked'
            ? 'আগের লেসনগুলো সম্পন্ন করার পর কুইজ দেখতে পারবেন।'
            : 'Not enrolled';
      return new Response(JSON.stringify({ error, reason: quizAccess.reason }), { status });
    }
    const quiz = quizAccess.quiz;

    const attempts = await db.select()
      .from(courseQuizAttempts)
      .where(and(
        eq(courseQuizAttempts.userId, user.id),
        eq(courseQuizAttempts.quizId, quizId)
      ))
      .orderBy(desc(courseQuizAttempts.createdAt));

    return new Response(JSON.stringify({
      success: true,
      attempts,
      maxAttempts: quiz?.maxAttempts,
      passingScore: quiz?.passingScore,
    }), { status: 200 });
  } catch (error) {
    console.error('Quiz attempts error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
