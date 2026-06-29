import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isAdminUser,
  safeJsonArray,
  listFromTextarea,
  faqFromTextarea,
  resourcesFromTextarea,
  getEffectiveCoursePrice,
  isEnrollmentActive,
  isCoursePubliclyVisible,
  getOrderedLessons,
  isLessonSequentiallyUnlocked,
  getRequiredLessonsBeforeQuiz,
  buildQuizLockState,
  normalizeVideoEmbedUrl,
  normalizeR2Key,
  COURSE_STATUS,
  ENROLLMENT_STATUS,
  ACCESS_MODE,
  VIDEO_PROVIDER,
} from '../src/lib/lms-access.js';

// --- isAdminUser ---

test('isAdminUser returns true for admin role', () => {
  assert.equal(isAdminUser({ role: 'admin' }), true);
});

test('isAdminUser returns false for non-admin roles', () => {
  assert.equal(isAdminUser({ role: 'patient' }), false);
  assert.equal(isAdminUser({ role: 'user' }), false);
});

test('isAdminUser returns false for null/undefined', () => {
  assert.equal(isAdminUser(null), false);
  assert.equal(isAdminUser(undefined), false);
  assert.equal(isAdminUser({}), false);
});

// --- safeJsonArray ---

test('safeJsonArray returns array as-is', () => {
  const arr = [1, 2, 3];
  assert.deepEqual(safeJsonArray(arr), arr);
});

test('safeJsonArray parses valid JSON array string', () => {
  assert.deepEqual(safeJsonArray('[1,2,3]'), [1, 2, 3]);
  assert.deepEqual(safeJsonArray('["a","b"]'), ['a', 'b']);
});

test('safeJsonArray returns fallback for invalid JSON', () => {
  assert.deepEqual(safeJsonArray('not json'), []);
  assert.deepEqual(safeJsonArray('not json', [1]), [1]);
});

test('safeJsonArray returns fallback for non-array JSON', () => {
  assert.deepEqual(safeJsonArray('{"key":"value"}'), []);
  assert.deepEqual(safeJsonArray('"hello"'), []);
});

test('safeJsonArray returns fallback for empty/whitespace string', () => {
  assert.deepEqual(safeJsonArray(''), []);
  assert.deepEqual(safeJsonArray('   '), []);
});

test('safeJsonArray returns fallback for non-string non-array', () => {
  assert.deepEqual(safeJsonArray(123), []);
  assert.deepEqual(safeJsonArray(true), []);
});

// --- listFromTextarea ---

test('listFromTextarea splits by newline', () => {
  assert.deepEqual(listFromTextarea('a\nb\nc'), ['a', 'b', 'c']);
});

test('listFromTextarea handles CRLF', () => {
  assert.deepEqual(listFromTextarea('a\r\nb\r\nc'), ['a', 'b', 'c']);
});

test('listFromTextarea trims and filters empty lines', () => {
  assert.deepEqual(listFromTextarea('  a  \n\n  b  \n\n'), ['a', 'b']);
});

test('listFromTextarea returns array as-is (trimmed)', () => {
  assert.deepEqual(listFromTextarea([' a ', ' b ']), ['a', 'b']);
});

test('listFromTextarea returns empty array for non-string', () => {
  assert.deepEqual(listFromTextarea(null), []);
  assert.deepEqual(listFromTextarea(undefined), []);
  assert.deepEqual(listFromTextarea(123), []);
});

// --- faqFromTextarea ---

test('faqFromTextarea parses Q:/A: format', () => {
  const result = faqFromTextarea('Q: What is Ruqyah?\nA: Islamic healing.');
  assert.equal(result.length, 1);
  assert.equal(result[0].question, 'What is Ruqyah?');
  assert.equal(result[0].answer, 'Islamic healing.');
});

test('faqFromTextarea parses double-newline separated blocks', () => {
  const result = faqFromTextarea('Q: Question 1?\nA: Answer 1.\n\nQ: Question 2?\nA: Answer 2.');
  assert.equal(result.length, 2);
  assert.equal(result[0].question, 'Question 1?');
  assert.equal(result[1].question, 'Question 2?');
});

test('faqFromTextarea handles multi-line answers', () => {
  const result = faqFromTextarea('Q: Question?\nLine 1 of answer\nLine 2 of answer');
  assert.equal(result.length, 1);
  assert.ok(result[0].answer.includes('Line 1'));
  assert.ok(result[0].answer.includes('Line 2'));
});

test('faqFromTextarea handles blocks without Q: prefix (first line becomes question)', () => {
  const result = faqFromTextarea('Just some text\nAnswer here');
  assert.equal(result.length, 1);
  assert.equal(result[0].question, 'Just some text');
  assert.equal(result[0].answer, 'Answer here');
});

test('faqFromTextarea returns array as-is', () => {
  const arr = [{ question: 'Q', answer: 'A' }];
  assert.deepEqual(faqFromTextarea(arr), arr);
});

test('faqFromTextarea returns empty for non-string', () => {
  assert.deepEqual(faqFromTextarea(null), []);
  assert.deepEqual(faqFromTextarea(undefined), []);
});

// --- resourcesFromTextarea ---

test('resourcesFromTextarea parses pipe-separated lines', () => {
  const result = resourcesFromTextarea('Guide | https://example.com/guide.pdf\nBook | https://example.com/book.pdf');
  assert.equal(result.length, 2);
  assert.equal(result[0].title, 'Guide');
  assert.equal(result[0].url, 'https://example.com/guide.pdf');
});

test('resourcesFromTextarea parses JSON array', () => {
  const result = resourcesFromTextarea('[{"title":"A","url":"https://a.com"}]');
  assert.equal(result.length, 1);
  assert.equal(result[0].title, 'A');
});

test('resourcesFromTextarea filters lines without both title and url', () => {
  const result = resourcesFromTextarea('OnlyTitle\n| https://no-title.com\nGood | https://good.com');
  assert.equal(result.length, 1);
  assert.equal(result[0].title, 'Good');
});

test('resourcesFromTextarea returns empty for empty/whitespace', () => {
  assert.deepEqual(resourcesFromTextarea(''), []);
  assert.deepEqual(resourcesFromTextarea('   '), []);
});

test('resourcesFromTextarea returns array as-is', () => {
  const arr = [{ title: 'T', url: 'U' }];
  assert.deepEqual(resourcesFromTextarea(arr), arr);
});

// --- getEffectiveCoursePrice ---

test('getEffectiveCoursePrice returns 0 for null/undefined price', () => {
  assert.equal(getEffectiveCoursePrice(null), 0);
  assert.equal(getEffectiveCoursePrice({}), 0);
  assert.equal(getEffectiveCoursePrice({ price: null }), 0);
});

test('getEffectiveCoursePrice returns price when no sale', () => {
  assert.equal(getEffectiveCoursePrice({ price: 1000 }), 1000);
});

test('getEffectiveCoursePrice returns salePrice when lower', () => {
  assert.equal(getEffectiveCoursePrice({ price: 1000, salePrice: 500 }), 500);
});

test('getEffectiveCoursePrice ignores salePrice >= price', () => {
  assert.equal(getEffectiveCoursePrice({ price: 1000, salePrice: 1000 }), 1000);
  assert.equal(getEffectiveCoursePrice({ price: 1000, salePrice: 1500 }), 1000);
});

test('getEffectiveCoursePrice handles 0 (free course)', () => {
  assert.equal(getEffectiveCoursePrice({ price: 0 }), 0);
});

test('getEffectiveCoursePrice handles string prices', () => {
  assert.equal(getEffectiveCoursePrice({ price: '500', salePrice: '200' }), 200);
});

// --- isEnrollmentActive ---

test('isEnrollmentActive returns true for approved without expiry', () => {
  assert.equal(isEnrollmentActive({ status: ENROLLMENT_STATUS.APPROVED }), true);
});

test('isEnrollmentActive returns true for approved with future expiry', () => {
  const future = new Date(Date.now() + 86400000).toISOString();
  assert.equal(isEnrollmentActive({ status: ENROLLMENT_STATUS.APPROVED, accessExpiresAt: future }), true);
});

test('isEnrollmentActive returns false for approved with past expiry', () => {
  const past = new Date(Date.now() - 86400000).toISOString();
  assert.equal(isEnrollmentActive({ status: ENROLLMENT_STATUS.APPROVED, accessExpiresAt: past }), false);
});

test('isEnrollmentActive returns false for non-approved status', () => {
  assert.equal(isEnrollmentActive({ status: ENROLLMENT_STATUS.PENDING }), false);
  assert.equal(isEnrollmentActive({ status: ENROLLMENT_STATUS.REVOKED }), false);
});

test('isEnrollmentActive returns false for null/undefined', () => {
  assert.equal(isEnrollmentActive(null), false);
  assert.equal(isEnrollmentActive(undefined), false);
});

// --- isCoursePubliclyVisible ---

test('isCoursePubliclyVisible returns true for published', () => {
  assert.equal(isCoursePubliclyVisible({ status: COURSE_STATUS.PUBLISHED }), true);
});

test('isCoursePubliclyVisible returns false for draft/unpublished', () => {
  assert.equal(isCoursePubliclyVisible({ status: COURSE_STATUS.DRAFT }), false);
  assert.equal(isCoursePubliclyVisible({ status: COURSE_STATUS.UNPUBLISHED }), false);
});

test('isCoursePubliclyVisible returns false for null', () => {
  assert.equal(isCoursePubliclyVisible(null), false);
});

// --- getOrderedLessons ---

test('getOrderedLessons sorts by module then lesson sortOrder', () => {
  const modules = [
    { id: 'm2', sortOrder: 2 },
    { id: 'm1', sortOrder: 1 },
  ];
  const lessons = [
    { id: 'l3', moduleId: 'm1', sortOrder: 2 },
    { id: 'l1', moduleId: 'm1', sortOrder: 1 },
    { id: 'l4', moduleId: 'm2', sortOrder: 1 },
  ];
  const ordered = getOrderedLessons(modules, lessons);
  assert.deepEqual(ordered.map((l) => l.id), ['l1', 'l3', 'l4']);
});

test('getOrderedLessons appends orphan lessons at end', () => {
  const modules = [{ id: 'm1', sortOrder: 1 }];
  const lessons = [
    { id: 'l1', moduleId: 'm1', sortOrder: 1 },
    { id: 'l-orphan', moduleId: 'unknown', sortOrder: 1 },
  ];
  const ordered = getOrderedLessons(modules, lessons);
  assert.deepEqual(ordered.map((l) => l.id), ['l1', 'l-orphan']);
});

test('getOrderedLessons handles empty inputs', () => {
  assert.deepEqual(getOrderedLessons([], []), []);
});

// --- isLessonSequentiallyUnlocked ---

test('isLessonSequentiallyUnlocked returns true for first lesson', () => {
  const lessons = [{ id: 'l1' }, { id: 'l2' }];
  assert.equal(isLessonSequentiallyUnlocked('l1', lessons, new Set()), true);
});

test('isLessonSequentiallyUnlocked returns true when previous completed', () => {
  const lessons = [{ id: 'l1' }, { id: 'l2' }];
  assert.equal(isLessonSequentiallyUnlocked('l2', lessons, new Set(['l1'])), true);
});

test('isLessonSequentiallyUnlocked returns false when previous not completed', () => {
  const lessons = [{ id: 'l1' }, { id: 'l2' }];
  assert.equal(isLessonSequentiallyUnlocked('l2', lessons, new Set()), false);
});

test('isLessonSequentiallyUnlocked returns false for unknown lesson', () => {
  const lessons = [{ id: 'l1' }];
  assert.equal(isLessonSequentiallyUnlocked('l-unknown', lessons, new Set()), false);
});

// --- Quiz sequential access ---

const quizModules = [
  { id: 'm2', sortOrder: 2 },
  { id: 'm1', sortOrder: 1 },
];
const quizLessons = [
  { id: 'l2', moduleId: 'm1', sortOrder: 2 },
  { id: 'l1', moduleId: 'm1', sortOrder: 1 },
  { id: 'l3', moduleId: 'm2', sortOrder: 1 },
];

const sequentialCourse = { status: COURSE_STATUS.PUBLISHED, accessMode: ACCESS_MODE.SEQUENTIAL };
const approvedEnrollment = { status: ENROLLMENT_STATUS.APPROVED };
const regularUser = { id: 'u1', role: 'student' };


test('getRequiredLessonsBeforeQuiz requires earlier lessons in the same module', () => {
  const required = getRequiredLessonsBeforeQuiz({ id: 'q1', moduleId: 'm1', sortOrder: 3 }, quizModules, quizLessons);
  assert.deepEqual(required.map((lesson) => lesson.id), ['l1', 'l2']);
});


test('getRequiredLessonsBeforeQuiz requires lessons from previous modules', () => {
  const required = getRequiredLessonsBeforeQuiz({ id: 'q2', moduleId: 'm2', sortOrder: 1 }, quizModules, quizLessons);
  assert.deepEqual(required.map((lesson) => lesson.id), ['l1', 'l2']);
});


test('buildQuizLockState locks sequential quiz when required lessons are missing', () => {
  const state = buildQuizLockState({
    quiz: { id: 'q1', moduleId: 'm1', sortOrder: 3 },
    modules: quizModules,
    lessons: quizLessons,
    completedLessonIds: new Set(['l1']),
    course: sequentialCourse,
    enrollment: approvedEnrollment,
    user: regularUser,
  });
  assert.equal(state.locked, true);
  assert.equal(state.reason, 'quiz_sequence_locked');
  assert.deepEqual(state.missingLessonIds, ['l2']);
});


test('buildQuizLockState unlocks sequential quiz when required lessons are complete', () => {
  const state = buildQuizLockState({
    quiz: { id: 'q1', moduleId: 'm1', sortOrder: 3 },
    modules: quizModules,
    lessons: quizLessons,
    completedLessonIds: new Set(['l1', 'l2']),
    course: sequentialCourse,
    enrollment: approvedEnrollment,
    user: regularUser,
  });
  assert.equal(state.locked, false);
  assert.equal(state.reason, 'enrolled');
});


test('buildQuizLockState lets admins access unpublished quizzes', () => {
  const state = buildQuizLockState({
    quiz: { id: 'q1', moduleId: 'm1', sortOrder: 3 },
    course: { status: COURSE_STATUS.DRAFT, accessMode: ACCESS_MODE.SEQUENTIAL },
    user: { id: 'admin', role: 'admin' },
  });
  assert.equal(state.locked, false);
  assert.equal(state.reason, 'admin');
});

// --- normalizeVideoEmbedUrl ---

test('normalizeVideoEmbedUrl converts youtu.be short URL', () => {
  const result = normalizeVideoEmbedUrl('https://youtu.be/abc123', VIDEO_PROVIDER.YOUTUBE);
  assert.equal(result, 'https://www.youtube.com/embed/abc123');
});

test('normalizeVideoEmbedUrl converts youtube.com watch URL', () => {
  const result = normalizeVideoEmbedUrl('https://www.youtube.com/watch?v=abc123', VIDEO_PROVIDER.YOUTUBE);
  assert.equal(result, 'https://www.youtube.com/embed/abc123');
});

test('normalizeVideoEmbedUrl passes through youtube embed URL', () => {
  const url = 'https://www.youtube.com/embed/abc123';
  assert.equal(normalizeVideoEmbedUrl(url, VIDEO_PROVIDER.YOUTUBE), url);
});

test('normalizeVideoEmbedUrl converts Google Drive URL', () => {
  const result = normalizeVideoEmbedUrl('https://drive.google.com/file/d/abc123/view', VIDEO_PROVIDER.GOOGLE_DRIVE);
  assert.equal(result, 'https://drive.google.com/file/d/abc123/preview');
});

test('normalizeVideoEmbedUrl returns empty for wrong provider domain', () => {
  assert.equal(normalizeVideoEmbedUrl('https://vimeo.com/123', VIDEO_PROVIDER.YOUTUBE), '');
  assert.equal(normalizeVideoEmbedUrl('https://youtube.com/watch?v=abc', VIDEO_PROVIDER.GOOGLE_DRIVE), '');
});

test('normalizeVideoEmbedUrl returns empty for R2 provider', () => {
  assert.equal(normalizeVideoEmbedUrl('some-key', VIDEO_PROVIDER.R2), '');
});

test('normalizeVideoEmbedUrl returns empty for null/empty', () => {
  assert.equal(normalizeVideoEmbedUrl(null, VIDEO_PROVIDER.YOUTUBE), '');
  assert.equal(normalizeVideoEmbedUrl('', VIDEO_PROVIDER.YOUTUBE), '');
});

test('normalizeVideoEmbedUrl allows http/https for embed provider', () => {
  assert.equal(normalizeVideoEmbedUrl('https://example.com/embed', VIDEO_PROVIDER.EMBED), 'https://example.com/embed');
  assert.equal(normalizeVideoEmbedUrl('http://example.com/embed', VIDEO_PROVIDER.EMBED), 'http://example.com/embed');
});

test('normalizeVideoEmbedUrl rejects non-http for embed provider', () => {
  assert.equal(normalizeVideoEmbedUrl('ftp://example.com/embed', VIDEO_PROVIDER.EMBED), '');
});

// --- normalizeR2Key ---

test('normalizeR2Key strips /api/images/ prefix', () => {
  assert.equal(normalizeR2Key('/api/images/courses/cover.jpg'), 'courses/cover.jpg');
});

test('normalizeR2Key strips r2:// prefix', () => {
  assert.equal(normalizeR2Key('r2://bucket/key.jpg'), 'bucket/key.jpg');
});

test('normalizeR2Key normalizes backslashes', () => {
  assert.equal(normalizeR2Key('courses\\cover.jpg'), 'courses/cover.jpg');
});

test('normalizeR2Key rejects traversal attempts', () => {
  assert.equal(normalizeR2Key('../etc/passwd'), '');
  assert.equal(normalizeR2Key('courses/../../../etc'), '');
});

test('normalizeR2Key rejects absolute paths', () => {
  assert.equal(normalizeR2Key('/etc/passwd'), '');
});

test('normalizeR2Key rejects double slashes', () => {
  assert.equal(normalizeR2Key('courses//cover.jpg'), '');
});

test('normalizeR2Key returns empty for null/empty', () => {
  assert.equal(normalizeR2Key(null), '');
  assert.equal(normalizeR2Key(''), '');
  assert.equal(normalizeR2Key('   '), '');
});

test('normalizeR2Key handles valid key', () => {
  assert.equal(normalizeR2Key('courses/lessons/video.mp4'), 'courses/lessons/video.mp4');
});

// --- Constants ---

test('COURSE_STATUS has expected values', () => {
  assert.equal(COURSE_STATUS.DRAFT, 'draft');
  assert.equal(COURSE_STATUS.PUBLISHED, 'published');
  assert.equal(COURSE_STATUS.UNPUBLISHED, 'unpublished');
});

test('ENROLLMENT_STATUS has expected values', () => {
  assert.equal(ENROLLMENT_STATUS.PENDING, 'pending');
  assert.equal(ENROLLMENT_STATUS.APPROVED, 'approved');
  assert.equal(ENROLLMENT_STATUS.REVOKED, 'revoked');
});

test('ACCESS_MODE has expected values', () => {
  assert.equal(ACCESS_MODE.OPEN, 'open');
  assert.equal(ACCESS_MODE.SEQUENTIAL, 'sequential');
});

test('VIDEO_PROVIDER has expected values', () => {
  assert.equal(VIDEO_PROVIDER.YOUTUBE, 'youtube');
  assert.equal(VIDEO_PROVIDER.GOOGLE_DRIVE, 'google_drive');
  assert.equal(VIDEO_PROVIDER.EMBED, 'embed');
  assert.equal(VIDEO_PROVIDER.R2, 'r2');
});
