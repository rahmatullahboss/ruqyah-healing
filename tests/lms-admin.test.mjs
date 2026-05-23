import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildCourseReadiness,
  filterPublicReadyCourses,
  isRealCourseImage,
  normalizeAdminCoursePayload,
  normalizeAdminLessonPayload,
} from '../src/lib/lms-admin.js';

const baseCourse = {
  id: 'course-1',
  title: 'Professional Hijama Training',
  instructor: 'Dr. Ahmed',
  classCount: '12 lessons',
  hours: '6 hours',
  level: 'Professional',
  desc: 'A complete real course description.',
  shortDescription: 'Learn practical hijama foundations.',
  fullDescription: 'A complete course with real lessons, resources, and guidance.',
  image: '/api/images/images/hijama-training.webp',
  status: 'published',
  language: 'English',
  category: 'Hijama',
};

const moduleRows = [{ id: 'module-1', courseId: 'course-1', title: 'Foundations', sortOrder: 1 }];
const lessonRows = [
  {
    id: 'lesson-1',
    courseId: 'course-1',
    moduleId: 'module-1',
    title: 'Introduction',
    contentType: 'video',
    videoProvider: 'r2',
    videoUrl: 'videos/intro.mp4',
    textContent: '',
    resources: [],
    isFreePreview: true,
    sortOrder: 1,
  },
];

test('real course images reject empty, default, placeholder, and sample paths', () => {
  assert.equal(isRealCourseImage(''), false);
  assert.equal(isRealCourseImage('/images/courses/default.webp'), false);
  assert.equal(isRealCourseImage('/images/courses/placeholder.webp'), false);
  assert.equal(isRealCourseImage('/sample/course.webp'), false);
  assert.equal(isRealCourseImage('/api/images/images/course-cover.webp'), true);
  assert.equal(isRealCourseImage('/images/courses/course_hijama_real.webp'), true);
});

test('course readiness rejects published courses with no real cover or no lessons', () => {
  const readiness = buildCourseReadiness({
    course: { ...baseCourse, image: '/images/courses/default.webp' },
    modules: moduleRows,
    lessons: [],
  });

  assert.equal(readiness.publishable, false);
  assert.ok(readiness.errors.includes('কোর্স কভার ছবি আপলোড করুন।'));
  assert.ok(readiness.errors.includes('কমপক্ষে ১টি লেসন যোগ করুন।'));
});

test('course readiness accepts complete real course content', () => {
  const readiness = buildCourseReadiness({
    course: baseCourse,
    modules: moduleRows,
    lessons: lessonRows,
  });

  assert.equal(readiness.publishable, true);
  assert.deepEqual(readiness.errors, []);
  assert.equal(readiness.summary.moduleCount, 1);
  assert.equal(readiness.summary.lessonCount, 1);
  assert.equal(readiness.summary.previewLessonCount, 1);
});

test('public-ready filter hides incomplete published courses', () => {
  const rows = [
    { course: baseCourse, modules: moduleRows, lessons: lessonRows },
    { course: { ...baseCourse, id: 'course-2', image: '/images/courses/default.webp' }, modules: moduleRows, lessons: lessonRows },
    { course: { ...baseCourse, id: 'course-3', status: 'draft' }, modules: moduleRows, lessons: lessonRows },
  ];

  assert.deepEqual(filterPublicReadyCourses(rows).map((row) => row.course.id), ['course-1']);
});

test('admin course payload accepts custom category and level but rejects invalid prices', () => {
  const parsed = normalizeAdminCoursePayload({
    ...baseCourse,
    category: 'Advanced Ruqyah Therapy',
    level: 'Teacher Certification',
    price: 5000,
    salePrice: 3500,
    rating: 4.7,
    outcomes: 'Outcome one\nOutcome two',
    requirements: 'Requirement one',
    faq: 'Question?\nAnswer.',
  });

  assert.equal(parsed.ok, true);
  assert.equal(parsed.data.category, 'Advanced Ruqyah Therapy');
  assert.equal(parsed.data.level, 'Teacher Certification');
  assert.deepEqual(parsed.data.outcomes, ['Outcome one', 'Outcome two']);

  const invalid = normalizeAdminCoursePayload({ ...baseCourse, price: 3000, salePrice: 3000 });
  assert.equal(invalid.ok, false);
  assert.ok(invalid.errors.includes('ডিসকাউন্ট মূল্য মূল্যের চেয়ে কম হতে হবে।'));
});

test('lesson payload requires real content for the selected lesson type', () => {
  const missingVideo = normalizeAdminLessonPayload({
    courseId: 'course-1',
    moduleId: 'module-1',
    title: 'Video lesson',
    contentType: 'video',
    videoProvider: 'r2',
    videoUrl: '',
  });
  assert.equal(missingVideo.ok, false);
  assert.ok(missingVideo.errors.includes('ভিডিও লেসনের জন্য ভিডিও URL বা R2 key দিন।'));

  const textLesson = normalizeAdminLessonPayload({
    courseId: 'course-1',
    moduleId: 'module-1',
    title: 'Reading lesson',
    contentType: 'text',
    textContent: '<p>Real lesson text</p>',
  });
  assert.equal(textLesson.ok, true);
  assert.equal(textLesson.data.contentType, 'text');
});
