import { createDb } from '../db/client.js';
import {
  courses, courseModules, courseLessons, courseQuizzes,
  courseQuizQuestions, courseProgress, courseQuizAttempts,
  courseReviews, courseEnrollments
} from '../db/schema.js';
import { eq, and, asc, desc, sql } from 'drizzle-orm';

/**
 * Get full course content tree: modules → lessons → quizzes
 */
export async function getCourseContentTree(db, courseId) {
  const modules = await db.select()
    .from(courseModules)
    .where(eq(courseModules.courseId, courseId))
    .orderBy(asc(courseModules.sortOrder));

  const lessons = await db.select()
    .from(courseLessons)
    .where(eq(courseLessons.courseId, courseId))
    .orderBy(asc(courseLessons.sortOrder));

  const quizzes = await db.select()
    .from(courseQuizzes)
    .where(eq(courseQuizzes.courseId, courseId))
    .orderBy(asc(courseQuizzes.sortOrder));

  // Build tree
  return modules.map(mod => ({
    ...mod,
    lessons: lessons.filter(l => l.moduleId === mod.id),
    quizzes: quizzes.filter(q => q.moduleId === mod.id),
  }));
}

/**
 * Get course progress for a user (percentage)
 */
export async function getUserCourseProgress(db, userId, courseId) {
  const totalLessons = await db.select({ count: sql`count(*)` })
    .from(courseLessons)
    .where(eq(courseLessons.courseId, courseId));

  const completedLessons = await db.select({ count: sql`count(*)` })
    .from(courseProgress)
    .where(and(
      eq(courseProgress.userId, userId),
      eq(courseProgress.courseId, courseId),
      eq(courseProgress.completed, true)
    ));

  const total = Number(totalLessons[0]?.count || 0);
  const completed = Number(completedLessons[0]?.count || 0);

  return {
    total,
    completed,
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}

/**
 * Check if user has completed all lessons in a course
 */
export async function isCourseCompleted(db, userId, courseId) {
  const progress = await getUserCourseProgress(db, userId, courseId);
  return progress.total > 0 && progress.completed >= progress.total;
}

/**
 * Get all lessons for a course in order (flat list)
 */
export async function getCourseLessonsList(db, courseId) {
  return db.select()
    .from(courseLessons)
    .where(eq(courseLessons.courseId, courseId))
    .orderBy(asc(courseLessons.sortOrder));
}

/**
 * Update course rating based on reviews
 */
export async function updateCourseRating(db, courseId) {
  const result = await db.select({ avg: sql`avg(${courseReviews.rating})`, count: sql`count(*)` })
    .from(courseReviews)
    .where(and(
      eq(courseReviews.courseId, courseId),
      eq(courseReviews.published, true)
    ));

  const avgRating = Number(result[0]?.avg || 0);
  const reviewCount = Number(result[0]?.count || 0);

  await db.update(courses)
    .set({ rating: Math.round(avgRating * 10) / 10 })
    .where(eq(courses.id, courseId));

  return { avgRating, reviewCount };
}

/**
 * Update course total lesson count and duration
 */
export async function updateCourseLessonStats(db, courseId) {
  const lessons = await db.select()
    .from(courseLessons)
    .where(eq(courseLessons.courseId, courseId));

  const totalLessons = lessons.length;

  // Parse and sum durations
  let totalSeconds = 0;
  for (const lesson of lessons) {
    if (lesson.duration) {
      // Convert Bengali digits to English digits
      const bnDigits = ['০','১','২','৩','৪','৫','৬','৭','৮','৯'];
      let durationStr = String(lesson.duration).trim();
      for (let i = 0; i < 10; i++) {
        durationStr = durationStr.replaceAll(bnDigits[i], String(i));
      }
      
      const parts = durationStr.split(':').map(val => Number(val.trim()));
      if (parts.some(isNaN)) {
        continue;
      }
      if (parts.length === 1) {
        totalSeconds += parts[0] * 60;
      } else if (parts.length === 2) {
        totalSeconds += parts[0] * 60 + parts[1];
      } else if (parts.length === 3) {
        totalSeconds += parts[0] * 3600 + parts[1] * 60 + parts[2];
      }
    }
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const totalDuration = hours > 0 ? `${hours} ঘণ্টা ${minutes} মিনিট` : `${minutes} মিনিট`;

  await db.update(courses)
    .set({ totalLessons, totalDuration })
    .where(eq(courses.id, courseId));

  return { totalLessons, totalDuration };
}
