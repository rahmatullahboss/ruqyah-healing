import test from 'node:test';
import assert from 'node:assert/strict';

import { demoCourses, getDemoCourseContentRows } from '../src/data/demo-courses.js';
import { buildCourseReadiness, groupCourseContentRows, normalizeAdminLessonPayload } from '../src/lib/lms-admin.js';
import { getEffectiveCoursePrice } from '../src/lib/lms-access.js';

function idsFor(rows) {
  return rows.map((row) => row.id);
}

function assertUniqueIds(rows, label) {
  const ids = idsFor(rows);
  assert.equal(new Set(ids).size, ids.length, `${label} IDs must be unique`);
}

test('demo course catalog has professional service-based courses', () => {
  assert.equal(demoCourses.length, 4);
  assert.deepEqual(demoCourses.map((course) => course.category), [
    'রুকইয়াহ শারইয়াহ',
    'হিজামা থেরাপি',
    'ডায়াগনোসিস ও কনসালটেশন',
    'ওয়েলনেস সাপোর্ট',
  ]);

  for (const course of demoCourses) {
    assert.equal(course.status, 'published');
    assert.equal(course.language, 'বাংলা');
    assert.ok(course.title.includes('ডেমো কোর্স'));
    assert.ok(course.shortDescription.length >= 20);
    assert.ok(course.fullDescription.length >= 80);
    assert.ok(course.image.startsWith('/images/courses/'));
    assert.ok(course.outcomes.length >= 4);
    assert.ok(course.requirements.length >= 3);
    assert.ok(course.modules.length >= 1);
    assert.ok(course.modules.some((module) => module.lessons.some((lesson) => lesson.isFreePreview)));
  }
});

test('demo courses flatten into LMS seed rows with stable IDs', () => {
  const rows = getDemoCourseContentRows();

  assert.equal(rows.courses.length, 4);
  assert.equal(rows.modules.length, 5);
  assert.equal(rows.lessons.length, 19);
  assert.equal(rows.quizzes.length, 2);
  assert.equal(rows.quizQuestions.length, 3);

  assertUniqueIds(rows.courses, 'course');
  assertUniqueIds(rows.modules, 'module');
  assertUniqueIds(rows.lessons, 'lesson');
  assertUniqueIds(rows.quizzes, 'quiz');
  assertUniqueIds(rows.quizQuestions, 'question');

  for (const lesson of rows.lessons) {
    assert.ok(rows.courses.some((course) => course.id === lesson.courseId), `lesson ${lesson.id} must reference a seeded course`);
    assert.ok(rows.modules.some((module) => module.id === lesson.moduleId), `lesson ${lesson.id} must reference a seeded module`);
  }

  for (const quiz of rows.quizzes) {
    assert.ok(rows.courses.some((course) => course.id === quiz.courseId), `quiz ${quiz.id} must reference a seeded course`);
    assert.ok(rows.modules.some((module) => module.id === quiz.moduleId), `quiz ${quiz.id} must reference a seeded module`);
  }

  for (const question of rows.quizQuestions) {
    assert.ok(rows.quizzes.some((quiz) => quiz.id === question.quizId), `question ${question.id} must reference a seeded quiz`);
    assert.ok(question.options.some((option) => option.isCorrect), `question ${question.id} needs a correct option`);
  }
});

test('demo courses are public-ready for the Courses section', () => {
  const rows = getDemoCourseContentRows();
  const groupedRows = groupCourseContentRows({
    courses: rows.courses,
    modules: rows.modules,
    lessons: rows.lessons,
  });

  for (const row of groupedRows) {
    const readiness = buildCourseReadiness(row);
    assert.equal(readiness.publishable, true, `${row.course.title}: ${readiness.errors.join(' | ')}`);
    assert.ok(readiness.summary.lessonCount >= 4);
    assert.ok(readiness.summary.previewLessonCount >= 1);
    assert.equal(row.course.totalLessons, readiness.summary.lessonCount);
  }
});

test('demo lesson content passes admin LMS validation', () => {
  const rows = getDemoCourseContentRows();

  for (const lesson of rows.lessons) {
    const parsed = normalizeAdminLessonPayload(lesson);
    assert.equal(parsed.ok, true, `${lesson.title}: ${parsed.errors.join(' | ')}`);
    assert.equal(parsed.data.contentType, 'text');
    assert.ok(parsed.data.textContent.includes('<h2>'));
  }
});

test('demo course pricing supports free and sale-price courses', () => {
  const rows = getDemoCourseContentRows();
  const freeCourses = rows.courses.filter((course) => getEffectiveCoursePrice(course) === 0);
  const paidCourses = rows.courses.filter((course) => getEffectiveCoursePrice(course) > 0);

  assert.equal(freeCourses.length, 3);
  assert.equal(paidCourses.length, 1);
  assert.equal(paidCourses[0].id, 'demo-course-acupressure-wellness-intro');
  assert.equal(getEffectiveCoursePrice(paidCourses[0]), 900);
});

test('demo course copy includes responsible safety boundaries', () => {
  const searchableCopy = demoCourses
    .map((course) => [
      course.fullDescription,
      ...course.outcomes,
      ...course.requirements,
      ...course.modules.flatMap((module) => module.lessons.map((lesson) => lesson.textContent)),
    ].join(' '))
    .join(' ');

  assert.match(searchableCopy, /শিরকমুক্ত|তাওহীদ/);
  assert.match(searchableCopy, /medical|চিকিৎসক|মানসিক স্বাস্থ্য/);
  assert.match(searchableCopy, /privacy|consent|dignity/);
});
