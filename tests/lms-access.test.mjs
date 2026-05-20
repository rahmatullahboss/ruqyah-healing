import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ACCESS_MODE,
  COURSE_STATUS,
  ENROLLMENT_STATUS,
  VIDEO_PROVIDER,
  buildLessonLockState,
  getEffectiveCoursePrice,
  getOrderedLessons,
  isEnrollmentActive,
  normalizeR2Key,
  normalizeVideoEmbedUrl,
} from '../src/lib/lms-access.js';

const publishedCourse = { id: 'course-1', status: COURSE_STATUS.PUBLISHED, accessMode: ACCESS_MODE.OPEN };
const sequentialCourse = { ...publishedCourse, accessMode: ACCESS_MODE.SEQUENTIAL };
const approvedEnrollment = { status: ENROLLMENT_STATUS.APPROVED };
const pendingEnrollment = { status: ENROLLMENT_STATUS.PENDING };
const revokedEnrollment = { status: ENROLLMENT_STATUS.REVOKED };
const user = { id: 'user-1', role: 'patient' };
const admin = { id: 'admin-1', role: 'admin' };
const lessons = [
  { id: 'lesson-1', moduleId: 'module-1', sortOrder: 1, isFreePreview: false },
  { id: 'lesson-2', moduleId: 'module-1', sortOrder: 2, isFreePreview: false },
];

test('preview lesson is unlocked for public users on published courses', () => {
  const state = buildLessonLockState({
    lesson: { ...lessons[0], isFreePreview: true },
    orderedLessons: lessons,
    completedLessonIds: new Set(),
    course: publishedCourse,
    enrollment: null,
    user: null,
  });

  assert.equal(state.locked, false);
  assert.equal(state.reason, 'preview');
});

test('paid lesson is locked without approved enrollment', () => {
  const state = buildLessonLockState({
    lesson: lessons[0],
    orderedLessons: lessons,
    completedLessonIds: new Set(),
    course: publishedCourse,
    enrollment: pendingEnrollment,
    user,
  });

  assert.equal(state.locked, true);
  assert.equal(state.reason, 'not_enrolled');
});

test('approved enrollment unlocks open-mode lessons', () => {
  const state = buildLessonLockState({
    lesson: lessons[1],
    orderedLessons: lessons,
    completedLessonIds: new Set(),
    course: publishedCourse,
    enrollment: approvedEnrollment,
    user,
  });

  assert.equal(state.locked, false);
  assert.equal(state.reason, 'enrolled');
});

test('sequential mode locks later lessons until earlier lessons are complete', () => {
  const locked = buildLessonLockState({
    lesson: lessons[1],
    orderedLessons: lessons,
    completedLessonIds: new Set(),
    course: sequentialCourse,
    enrollment: approvedEnrollment,
    user,
  });
  const unlocked = buildLessonLockState({
    lesson: lessons[1],
    orderedLessons: lessons,
    completedLessonIds: new Set(['lesson-1']),
    course: sequentialCourse,
    enrollment: approvedEnrollment,
    user,
  });

  assert.equal(locked.locked, true);
  assert.equal(locked.reason, 'sequence_locked');
  assert.equal(unlocked.locked, false);
});

test('admin can access unpublished and locked lessons', () => {
  const state = buildLessonLockState({
    lesson: lessons[1],
    orderedLessons: lessons,
    completedLessonIds: new Set(),
    course: { ...sequentialCourse, status: COURSE_STATUS.DRAFT },
    enrollment: null,
    user: admin,
  });

  assert.equal(state.locked, false);
  assert.equal(state.reason, 'admin');
});

test('revoked enrollment is not active', () => {
  assert.equal(isEnrollmentActive(revokedEnrollment), false);
  assert.equal(isEnrollmentActive(approvedEnrollment), true);
});

test('expired enrollment is not active', () => {
  const enrollment = {
    status: ENROLLMENT_STATUS.APPROVED,
    accessExpiresAt: new Date('2026-01-01T00:00:00Z'),
  };

  assert.equal(isEnrollmentActive(enrollment, new Date('2026-05-18T00:00:00Z')), false);
});

test('ordered lessons follow module order before lesson order', () => {
  const modules = [
    { id: 'module-2', sortOrder: 2 },
    { id: 'module-1', sortOrder: 1 },
  ];
  const unorderedLessons = [
    { id: 'lesson-3', moduleId: 'module-2', sortOrder: 1 },
    { id: 'lesson-2', moduleId: 'module-1', sortOrder: 2 },
    { id: 'lesson-1', moduleId: 'module-1', sortOrder: 1 },
  ];

  assert.deepEqual(getOrderedLessons(modules, unorderedLessons).map((lesson) => lesson.id), [
    'lesson-1',
    'lesson-2',
    'lesson-3',
  ]);
});

test('effective course price uses lower valid sale price', () => {
  assert.equal(getEffectiveCoursePrice({ price: 5000, salePrice: 3000 }), 3000);
  assert.equal(getEffectiveCoursePrice({ price: 5000, salePrice: 7000 }), 5000);
  assert.equal(getEffectiveCoursePrice({ price: null, salePrice: null }), 0);
});

test('video URL normalization only allows expected provider URLs', () => {
  assert.equal(
    normalizeVideoEmbedUrl('https://www.youtube.com/watch?v=abc123', VIDEO_PROVIDER.YOUTUBE),
    'https://www.youtube.com/embed/abc123',
  );
  assert.equal(
    normalizeVideoEmbedUrl('https://drive.google.com/file/d/file-id/view?usp=sharing', VIDEO_PROVIDER.GOOGLE_DRIVE),
    'https://drive.google.com/file/d/file-id/preview',
  );
  assert.equal(normalizeVideoEmbedUrl('javascript:alert(1)', VIDEO_PROVIDER.EMBED), '');
});

test('R2 key normalization rejects traversal and absolute paths', () => {
  assert.equal(normalizeR2Key('/api/images/videos/lesson.mp4'), 'videos/lesson.mp4');
  assert.equal(normalizeR2Key('r2://videos/lesson.mp4'), 'videos/lesson.mp4');
  assert.equal(normalizeR2Key('../secret.mp4'), '');
  assert.equal(normalizeR2Key('/videos/lesson.mp4'), '');
});
