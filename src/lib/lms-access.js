import { and, asc, eq } from 'drizzle-orm';
import {
  courses,
  courseEnrollments,
  courseLessons,
  courseModules,
  courseProgress,
  courseQuizzes,
} from '../db/schema.js';

export const COURSE_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  UNPUBLISHED: 'unpublished',
};

export const ENROLLMENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REVOKED: 'revoked',
};

export const ACCESS_MODE = {
  OPEN: 'open',
  SEQUENTIAL: 'sequential',
};

export const VIDEO_PROVIDER = {
  YOUTUBE: 'youtube',
  GOOGLE_DRIVE: 'google_drive',
  EMBED: 'embed',
  R2: 'r2',
};

export function isAdminUser(user) {
  return user?.role === 'admin';
}

export function safeJsonArray(value, fallback = []) {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string' || value.trim() === '') return fallback;

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function listFromTextarea(value) {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  if (typeof value !== 'string') return [];
  return value
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function faqFromTextarea(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string') return [];

  return value
    .split(/\r?\n\s*\r?\n/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const [question = '', ...answerParts] = block.split(/\r?\n/);
      return {
        question: question.replace(/^Q:\s*/i, '').trim(),
        answer: answerParts.join('\n').replace(/^A:\s*/i, '').trim(),
      };
    })
    .filter((item) => item.question);
}

export function resourcesFromTextarea(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== 'string' || value.trim() === '') return [];

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // Fall back to one resource per line: title | url
  }

  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title = '', url = ''] = line.split('|').map((part) => part.trim());
      return { title, url };
    })
    .filter((item) => item.title && item.url);
}

export function getEffectiveCoursePrice(course) {
  if (!course || course.price === null || course.price === undefined) return 0;
  const price = Number(course.price) || 0;
  const salePrice = course.salePrice === null || course.salePrice === undefined ? null : Number(course.salePrice);
  if (salePrice !== null && salePrice >= 0 && salePrice < price) return salePrice;
  return price;
}

export function isEnrollmentActive(enrollment, now = new Date()) {
  if (!enrollment || enrollment.status !== ENROLLMENT_STATUS.APPROVED) return false;
  if (!enrollment.accessExpiresAt) return true;
  return new Date(enrollment.accessExpiresAt).getTime() > now.getTime();
}

export function isCoursePubliclyVisible(course) {
  return course?.status === COURSE_STATUS.PUBLISHED;
}

export function getOrderedLessons(modules, lessons) {
  const sortedModules = [...modules].sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
  const moduleIds = new Set(sortedModules.map((mod) => mod.id));
  const lessonsByModule = new Map();

  for (const lesson of lessons) {
    const list = lessonsByModule.get(lesson.moduleId) || [];
    list.push(lesson);
    lessonsByModule.set(lesson.moduleId, list);
  }

  const ordered = [];
  for (const mod of sortedModules) {
    const moduleLessons = (lessonsByModule.get(mod.id) || [])
      .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
    ordered.push(...moduleLessons);
  }

  const orphanLessons = lessons
    .filter((lesson) => !moduleIds.has(lesson.moduleId))
    .sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));

  return [...ordered, ...orphanLessons];
}

export function isLessonSequentiallyUnlocked(lessonId, orderedLessons, completedLessonIds) {
  for (const lesson of orderedLessons) {
    if (lesson.id === lessonId) return true;
    if (!completedLessonIds.has(lesson.id)) return false;
  }
  return false;
}

export function buildLessonLockState({
  lesson,
  orderedLessons,
  completedLessonIds,
  course,
  enrollment,
  user,
}) {
  const isAdmin = isAdminUser(user);
  const isPublished = isCoursePubliclyVisible(course);
  const isEnrolled = isEnrollmentActive(enrollment);
  const isPreview = Boolean(lesson?.isFreePreview);

  if (isAdmin) return { locked: false, reason: 'admin' };
  if (!isPublished) return { locked: true, reason: 'course_unpublished' };
  if (isPreview) return { locked: false, reason: 'preview' };
  if (!isEnrolled) return { locked: true, reason: 'not_enrolled' };
  if (course?.accessMode === ACCESS_MODE.SEQUENTIAL) {
    const unlocked = isLessonSequentiallyUnlocked(lesson.id, orderedLessons, completedLessonIds);
    if (!unlocked) return { locked: true, reason: 'sequence_locked' };
  }

  return { locked: false, reason: 'enrolled' };
}

export function getRequiredLessonsBeforeQuiz(quiz, modules = [], lessons = []) {
  if (!quiz) return [];
  const orderedLessons = getOrderedLessons(modules, lessons);
  if (!quiz.moduleId) return orderedLessons;

  const sortedModules = [...modules].sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
  const moduleOrder = new Map(sortedModules.map((mod, index) => [mod.id, index]));
  const quizModuleIndex = moduleOrder.get(quiz.moduleId);

  if (quizModuleIndex === undefined) return orderedLessons;

  return orderedLessons.filter((lesson) => {
    const lessonModuleIndex = moduleOrder.get(lesson.moduleId);
    if (lessonModuleIndex === undefined) return false;
    if (lessonModuleIndex < quizModuleIndex) return true;
    if (lessonModuleIndex > quizModuleIndex) return false;
    return Number(lesson.sortOrder || 0) < Number(quiz.sortOrder || 0);
  });
}

export function buildQuizLockState({
  quiz,
  modules = [],
  lessons = [],
  completedLessonIds = new Set(),
  course,
  enrollment,
  user,
}) {
  const isAdmin = isAdminUser(user);
  const isPublished = isCoursePubliclyVisible(course);
  const isEnrolled = isEnrollmentActive(enrollment);

  if (isAdmin) return { locked: false, reason: 'admin', requiredLessonIds: [] };
  if (!quiz) return { locked: true, reason: 'quiz_not_found', requiredLessonIds: [] };
  if (!isPublished) return { locked: true, reason: 'course_unpublished', requiredLessonIds: [] };
  if (!isEnrolled) return { locked: true, reason: 'not_enrolled', requiredLessonIds: [] };

  if (course?.accessMode === ACCESS_MODE.SEQUENTIAL) {
    const requiredLessons = getRequiredLessonsBeforeQuiz(quiz, modules, lessons);
    const requiredLessonIds = requiredLessons.map((lesson) => lesson.id);
    const missingLessonIds = requiredLessonIds.filter((lessonId) => !completedLessonIds.has(lessonId));
    if (missingLessonIds.length > 0) {
      return { locked: true, reason: 'quiz_sequence_locked', requiredLessonIds, missingLessonIds };
    }
  }

  return { locked: false, reason: 'enrolled', requiredLessonIds: [] };
}

export function normalizeVideoEmbedUrl(url, provider) {
  if (!url || provider === VIDEO_PROVIDER.R2) return '';

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');

    if (provider === VIDEO_PROVIDER.YOUTUBE) {
      if (host === 'youtu.be') {
        const id = parsed.pathname.replace(/^\//, '');
        return id ? `https://www.youtube.com/embed/${encodeURIComponent(id)}` : '';
      }
      if (host === 'youtube.com' || host === 'm.youtube.com') {
        if (parsed.pathname.startsWith('/embed/')) return parsed.toString();
        const id = parsed.searchParams.get('v');
        return id ? `https://www.youtube.com/embed/${encodeURIComponent(id)}` : '';
      }
      return '';
    }

    if (provider === VIDEO_PROVIDER.GOOGLE_DRIVE) {
      if (host !== 'drive.google.com') return '';
      const match = parsed.pathname.match(/\/file\/d\/([^/]+)/);
      return match?.[1] ? `https://drive.google.com/file/d/${encodeURIComponent(match[1])}/preview` : '';
    }

    if (provider === VIDEO_PROVIDER.EMBED) {
      return ['http:', 'https:'].includes(parsed.protocol) ? parsed.toString() : '';
    }
  } catch {
    return '';
  }

  return '';
}

export function normalizeR2Key(value) {
  if (!value || typeof value !== 'string') return '';
  const trimmed = value.trim();
  const withoutPrefix = trimmed.replace(/^\/api\/images\//, '').replace(/^r2:\/\//, '');
  const normalized = withoutPrefix.replace(/\\/g, '/');
  if (!normalized || normalized.includes('..') || normalized.startsWith('/') || normalized.includes('//')) return '';
  return normalized;
}

export async function getEnrollmentForUser(db, userId, courseId) {
  if (!userId || !courseId) return null;
  const [enrollment] = await db
    .select()
    .from(courseEnrollments)
    .where(and(eq(courseEnrollments.userId, userId), eq(courseEnrollments.courseId, courseId)))
    .limit(1);
  return enrollment || null;
}

export async function getCourseAccess(db, { user, courseId }) {
  const [course] = await db.select().from(courses).where(eq(courses.id, courseId)).limit(1);
  if (!course) {
    return { course: null, enrollment: null, isAdmin: false, isEnrolled: false, canView: false };
  }

  const isAdmin = isAdminUser(user);
  const enrollment = user ? await getEnrollmentForUser(db, user.id, courseId) : null;
  const isEnrolled = isEnrollmentActive(enrollment);
  const canView = isAdmin || isCoursePubliclyVisible(course) || isEnrolled;

  return { course, enrollment, isAdmin, isEnrolled, canView };
}

export async function getCourseLessonsInOrder(db, courseId) {
  const modules = await db
    .select()
    .from(courseModules)
    .where(eq(courseModules.courseId, courseId))
    .orderBy(asc(courseModules.sortOrder));

  const lessons = await db
    .select()
    .from(courseLessons)
    .where(eq(courseLessons.courseId, courseId))
    .orderBy(asc(courseLessons.sortOrder));

  return getOrderedLessons(modules, lessons);
}

export async function getLessonAccess(db, { user, courseId, lessonId, completedLessonIds = new Set() }) {
  const courseAccess = await getCourseAccess(db, { user, courseId });
  if (!courseAccess.course) {
    return { ...courseAccess, lesson: null, allowed: false, status: 404, reason: 'course_not_found' };
  }

  const [lesson] = await db
    .select()
    .from(courseLessons)
    .where(and(eq(courseLessons.id, lessonId), eq(courseLessons.courseId, courseId)))
    .limit(1);

  if (!lesson) {
    return { ...courseAccess, lesson: null, allowed: false, status: 404, reason: 'lesson_not_found' };
  }

  const orderedLessons = await getCourseLessonsInOrder(db, courseId);
  const lockState = buildLessonLockState({
    lesson,
    orderedLessons,
    completedLessonIds,
    course: courseAccess.course,
    enrollment: courseAccess.enrollment,
    user,
  });

  return {
    ...courseAccess,
    lesson,
    orderedLessons,
    lockState,
    allowed: !lockState.locked,
    status: lockState.locked ? 403 : 200,
    reason: lockState.reason,
  };
}

export async function getQuizAccess(db, { user, courseId, quizId }) {
  const courseAccess = await getCourseAccess(db, { user, courseId });
  if (!courseAccess.course) {
    return { ...courseAccess, quiz: null, allowed: false, status: 404, reason: 'course_not_found' };
  }

  const [quiz] = await db
    .select()
    .from(courseQuizzes)
    .where(and(eq(courseQuizzes.id, quizId), eq(courseQuizzes.courseId, courseId)))
    .limit(1);

  if (!quiz) {
    return { ...courseAccess, quiz: null, allowed: false, status: 404, reason: 'quiz_not_found' };
  }

  const [modules, lessons, progressRows] = await Promise.all([
    db.select().from(courseModules).where(eq(courseModules.courseId, courseId)).orderBy(asc(courseModules.sortOrder)),
    db.select().from(courseLessons).where(eq(courseLessons.courseId, courseId)).orderBy(asc(courseLessons.sortOrder)),
    user ? db.select().from(courseProgress).where(and(eq(courseProgress.userId, user.id), eq(courseProgress.courseId, courseId))) : [],
  ]);
  const completedLessonIds = new Set(progressRows.filter((row) => row.completed).map((row) => row.lessonId));
  const lockState = buildQuizLockState({
    quiz,
    modules,
    lessons,
    completedLessonIds,
    course: courseAccess.course,
    enrollment: courseAccess.enrollment,
    user,
  });

  return {
    ...courseAccess,
    quiz,
    modules,
    lessons,
    completedLessonIds,
    lockState,
    allowed: !lockState.locked,
    status: lockState.locked ? 403 : 200,
    reason: lockState.reason,
  };
}
