import type { APIRoute } from 'astro';
import { env as workerEnv } from 'cloudflare:workers';
import { createDb } from '../../../../../../db/client.js';
import { courseQuizzes, courseQuizQuestions, courseQuizAttempts, courseEnrollments } from '../../../../../../db/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import crypto from 'node:crypto';

export const prerender = false;

export const POST: APIRoute = async ({ params, request, locals }) => {
  const env = workerEnv || process.env;
  const user = (locals as any).user;

  if (!user) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  try {
    const { id: courseId, quizId } = params;
    const body = await request.json() as Record<string, any>;
    const { answers } = body; // [{questionId, selectedOption}]

    if (!courseId || !quizId || !answers || !Array.isArray(answers)) {
      return new Response(JSON.stringify({ error: 'Course ID, Quiz ID and answers required' }), { status: 400 });
    }

    const db = createDb((env as any).DATABASE_URL);

    // Verify enrollment
    const enrollment = await db.select().from(courseEnrollments)
      .where(and(eq(courseEnrollments.userId, user.id), eq(courseEnrollments.courseId, courseId)));
    if (enrollment.length === 0 || enrollment[0].status !== 'approved') {
      return new Response(JSON.stringify({ error: 'Not enrolled' }), { status: 403 });
    }

    // Get quiz
    const quiz = await db.select().from(courseQuizzes)
      .where(and(eq(courseQuizzes.id, quizId), eq(courseQuizzes.courseId, courseId)));
    if (quiz.length === 0) {
      return new Response(JSON.stringify({ error: 'Quiz not found' }), { status: 404 });
    }

    // Check max attempts
    if (quiz[0].maxAttempts) {
      const attempts = await db.select().from(courseQuizAttempts)
        .where(and(eq(courseQuizAttempts.userId, user.id), eq(courseQuizAttempts.quizId, quizId)));
      if (attempts.length >= quiz[0].maxAttempts) {
        return new Response(JSON.stringify({ error: 'Max attempts reached' }), { status: 400 });
      }
    }

    // Get questions
    const questions = await db.select().from(courseQuizQuestions)
      .where(eq(courseQuizQuestions.quizId, quizId));

    // Grade the quiz — deduplicate by questionId (last answer wins)
    const questionMap = new Map(questions.map(q => [q.id, q]));
    const dedupedAnswers = [...new Map(answers.map((a: any) => [a.questionId, a])).values()];
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
    const passed = score >= quiz[0].passingScore;

    // Save attempt
    const attemptId = crypto.randomUUID();
    await db.insert(courseQuizAttempts).values({
      id: attemptId,
      userId: user.id,
      quizId,
      courseId,
      score,
      totalQuestions,
      correctAnswers: correctCount,
      answers: gradedAnswers,
      passed,
      startedAt: new Date(),
      completedAt: new Date(),
    });

    return new Response(JSON.stringify({
      success: true,
      attemptId,
      score,
      totalQuestions,
      correctAnswers: correctCount,
      passed,
      passingScore: quiz[0].passingScore,
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

    const enrollment = await db.select().from(courseEnrollments)
      .where(and(eq(courseEnrollments.userId, user.id), eq(courseEnrollments.courseId, courseId)));
    if (enrollment.length === 0 || enrollment[0].status !== 'approved') {
      return new Response(JSON.stringify({ error: 'Not enrolled' }), { status: 403 });
    }

    const quiz = await db.select().from(courseQuizzes)
      .where(and(eq(courseQuizzes.id, quizId), eq(courseQuizzes.courseId, courseId)));
    if (quiz.length === 0) {
      return new Response(JSON.stringify({ error: 'Quiz not found' }), { status: 404 });
    }

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
      maxAttempts: quiz[0]?.maxAttempts,
      passingScore: quiz[0]?.passingScore,
    }), { status: 200 });
  } catch (error) {
    console.error('Quiz attempts error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
