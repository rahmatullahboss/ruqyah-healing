import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isRealCourseImage,
  normalizeAdminCoursePayload,
  normalizeAdminLessonPayload,
  getLessonContentErrors,
  buildCourseReadiness,
  filterPublicReadyCourses,
  groupCourseContentRows,
  readinessMessage,
} from '../src/lib/lms-admin.js';

// --- isRealCourseImage ---

test('isRealCourseImage returns true for /api/images/ paths', () => {
  assert.equal(isRealCourseImage('/api/images/courses/cover.jpg'), true);
});

test('isRealCourseImage returns true for /images/courses/ paths', () => {
  assert.equal(isRealCourseImage('/images/courses/cover.jpg'), true);
});

test('isRealCourseImage returns true for http(s) URLs', () => {
  assert.equal(isRealCourseImage('https://cdn.ruqyahhealing.com/cover.jpg'), true);
  assert.equal(isRealCourseImage('http://img.ruqyahhealing.com/course.jpg'), true);
});

test('isRealCourseImage returns false for placeholder images', () => {
  assert.equal(isRealCourseImage('default-course.jpg'), false);
  assert.equal(isRealCourseImage('placeholder.png'), false);
  assert.equal(isRealCourseImage('dummy-image.jpg'), false);
  assert.equal(isRealCourseImage('sample.jpg'), false);
  assert.equal(isRealCourseImage('example.png'), false);
});

test('isRealCourseImage returns false for empty/null', () => {
  assert.equal(isRealCourseImage(''), false);
  assert.equal(isRealCourseImage(null), false);
  assert.equal(isRealCourseImage(undefined), false);
});

// --- normalizeAdminCoursePayload ---

test('normalizeAdminCoursePayload returns ok for valid course', () => {
  const result = normalizeAdminCoursePayload({
    title: 'Test Course',
    instructor: 'Teacher',
    classCount: '10',
    hours: '5h',
    level: 'Beginner',
    category: 'রুকইয়াহ',
    language: 'বাংলা',
    desc: 'Description',
  });
  assert.equal(result.ok, true);
  assert.equal(result.errors.length, 0);
  assert.equal(result.data.title, 'Test Course');
});

test('normalizeAdminCoursePayload returns errors for missing required fields', () => {
  const result = normalizeAdminCoursePayload({});
  assert.equal(result.ok, false);
  assert.ok(result.errors.length > 0);
  assert.ok(result.errors.some((e) => e.includes('নাম'))); // title
  assert.ok(result.errors.some((e) => e.includes('ইন্সট্রাক্টর'))); // instructor
});

test('normalizeAdminCoursePayload rejects negative price', () => {
  const result = normalizeAdminCoursePayload({
    title: 'T', instructor: 'I', classCount: '1', hours: '1h',
    level: 'L', category: 'C', language: 'L', desc: 'D', price: -100,
  });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((e) => e.includes('মূল্য')));
});

test('normalizeAdminCoursePayload rejects salePrice >= price', () => {
  const result = normalizeAdminCoursePayload({
    title: 'T', instructor: 'I', classCount: '1', hours: '1h',
    level: 'L', category: 'C', language: 'L', desc: 'D',
    price: 500, salePrice: 500,
  });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((e) => e.includes('ডিসকাউন্ট')));
});

test('normalizeAdminCoursePayload accepts valid salePrice', () => {
  const result = normalizeAdminCoursePayload({
    title: 'T', instructor: 'I', classCount: '1', hours: '1h',
    level: 'L', category: 'C', language: 'L', desc: 'D',
    price: 1000, salePrice: 500,
  });
  assert.equal(result.ok, true);
  assert.equal(result.data.salePrice, 500);
});

test('normalizeAdminCoursePayload defaults status to draft', () => {
  const result = normalizeAdminCoursePayload({
    title: 'T', instructor: 'I', classCount: '1', hours: '1h',
    level: 'L', category: 'C', language: 'L', desc: 'D',
  });
  assert.equal(result.data.status, 'draft');
});

test('normalizeAdminCoursePayload rejects rating outside 0-5', () => {
  const result = normalizeAdminCoursePayload({
    title: 'T', instructor: 'I', classCount: '1', hours: '1h',
    level: 'L', category: 'C', language: 'L', desc: 'D', rating: 6,
  });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((e) => e.includes('রেটিং')));
});

// --- normalizeAdminLessonPayload ---

test('normalizeAdminLessonPayload returns ok for valid video lesson', () => {
  const result = normalizeAdminLessonPayload({
    title: 'Lesson 1',
    courseId: 'course-1',
    moduleId: 'module-1',
    contentType: 'video',
    videoUrl: 'https://youtu.be/abc123',
    videoProvider: 'youtube',
  });
  assert.equal(result.ok, true);
  assert.equal(result.data.title, 'Lesson 1');
});

test('normalizeAdminLessonPayload requires title', () => {
  const result = normalizeAdminLessonPayload({
    courseId: 'c1', moduleId: 'm1',
  });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((e) => e.includes('লেসনের নাম')));
});

test('normalizeAdminLessonPayload requires videoUrl for video type', () => {
  const result = normalizeAdminLessonPayload({
    title: 'L', courseId: 'c1', moduleId: 'm1', contentType: 'video',
  });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((e) => e.includes('ভিডিও URL')));
});

test('normalizeAdminLessonPayload requires textContent for text type', () => {
  const result = normalizeAdminLessonPayload({
    title: 'L', courseId: 'c1', moduleId: 'm1', contentType: 'text',
  });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((e) => e.includes('টেক্সট')));
});

test('normalizeAdminLessonPayload requires resources for resource type', () => {
  const result = normalizeAdminLessonPayload({
    title: 'L', courseId: 'c1', moduleId: 'm1', contentType: 'resource',
  });
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((e) => e.includes('রিসোর্স')));
});

// --- getLessonContentErrors ---

test('getLessonContentErrors returns empty for valid lesson', () => {
  const errors = getLessonContentErrors({
    title: 'L', courseId: 'c1', moduleId: 'm1',
    contentType: 'text', textContent: '<p>Content</p>',
  });
  assert.deepEqual(errors, []);
});

test('getLessonContentErrors returns errors for invalid lesson', () => {
  const errors = getLessonContentErrors({});
  assert.ok(errors.length > 0);
});

// --- buildCourseReadiness ---

test('buildCourseReadiness returns publishable for complete course', () => {
  const result = buildCourseReadiness({
    course: {
      title: 'T', instructor: 'I', classCount: '1', hours: '1h',
      level: 'L', category: 'C', language: 'L', desc: 'D',
      image: '/api/images/courses/cover.jpg', status: 'published',
    },
    modules: [{ id: 'm1', courseId: 'c1' }],
    lessons: [{
      id: 'l1', courseId: 'c1', moduleId: 'm1',
      title: 'L1', contentType: 'text', textContent: '<p>Content</p>',
    }],
  });
  assert.equal(result.publishable, true);
  assert.equal(result.errors.length, 0);
});

test('buildCourseReadiness fails for missing course', () => {
  const result = buildCourseReadiness({ course: null });
  assert.equal(result.publishable, false);
  assert.ok(result.errors.length > 0);
});

test('buildCourseReadiness fails for missing modules', () => {
  const result = buildCourseReadiness({
    course: {
      title: 'T', instructor: 'I', classCount: '1', hours: '1h',
      level: 'L', category: 'C', language: 'L', desc: 'D',
      image: '/api/images/courses/cover.jpg', status: 'published',
    },
    modules: [],
    lessons: [{
      id: 'l1', courseId: 'c1', moduleId: 'm1',
      title: 'L1', contentType: 'text', textContent: '<p>Content</p>',
    }],
  });
  assert.equal(result.publishable, false);
  assert.ok(result.errors.some((e) => e.includes('মডিউল')));
});

test('buildCourseReadiness fails for missing cover image', () => {
  const result = buildCourseReadiness({
    course: {
      title: 'T', instructor: 'I', classCount: '1', hours: '1h',
      level: 'L', category: 'C', language: 'L', desc: 'D',
      image: '', status: 'published',
    },
    modules: [{ id: 'm1' }],
    lessons: [{
      id: 'l1', courseId: 'c1', moduleId: 'm1',
      title: 'L1', contentType: 'text', textContent: '<p>Content</p>',
    }],
  });
  assert.equal(result.publishable, false);
  assert.ok(result.errors.some((e) => e.includes('কভার ছবি')));
});

test('buildCourseReadiness includes summary counts', () => {
  const result = buildCourseReadiness({
    course: { title: 'T', instructor: 'I', classCount: '1', hours: '1h', level: 'L', category: 'C', language: 'L', desc: 'D', image: '/api/images/c.jpg', status: 'published' },
    modules: [{ id: 'm1' }, { id: 'm2' }],
    lessons: [
      { id: 'l1', courseId: 'c1', moduleId: 'm1', title: 'L1', contentType: 'text', textContent: 'C', isFreePreview: true },
      { id: 'l2', courseId: 'c1', moduleId: 'm1', title: 'L2', contentType: 'text', textContent: 'C' },
    ],
  });
  assert.equal(result.summary.moduleCount, 2);
  assert.equal(result.summary.lessonCount, 2);
  assert.equal(result.summary.previewLessonCount, 1);
});

test('buildCourseReadiness warns when no free preview lessons', () => {
  const result = buildCourseReadiness({
    course: { title: 'T', instructor: 'I', classCount: '1', hours: '1h', level: 'L', category: 'C', language: 'L', desc: 'D', image: '/api/images/c.jpg', status: 'published' },
    modules: [{ id: 'm1' }],
    lessons: [
      { id: 'l1', courseId: 'c1', moduleId: 'm1', title: 'L1', contentType: 'text', textContent: 'C' },
    ],
  });
  assert.ok(result.warnings.some((w) => w.includes('ফ্রি প্রিভিউ')));
});

// --- filterPublicReadyCourses ---

test('filterPublicReadyCourses keeps published complete courses', () => {
  const rows = [{
    course: { id: 'c1', title: 'T', instructor: 'I', classCount: '1', hours: '1h', level: 'L', category: 'C', language: 'L', desc: 'D', image: '/api/images/c.jpg', status: 'published' },
    modules: [{ id: 'm1', courseId: 'c1' }],
    lessons: [{ id: 'l1', courseId: 'c1', moduleId: 'm1', title: 'L1', contentType: 'text', textContent: 'C' }],
  }];
  assert.equal(filterPublicReadyCourses(rows).length, 1);
});

test('filterPublicReadyCourses removes draft courses', () => {
  const rows = [{
    course: { id: 'c1', status: 'draft', title: 'T', instructor: 'I', classCount: '1', hours: '1h', level: 'L', category: 'C', language: 'L', desc: 'D', image: '/api/images/c.jpg' },
    modules: [{ id: 'm1' }],
    lessons: [{ id: 'l1', courseId: 'c1', moduleId: 'm1', title: 'L1', contentType: 'text', textContent: 'C' }],
  }];
  assert.equal(filterPublicReadyCourses(rows).length, 0);
});

test('filterPublicReadyCourses removes incomplete published courses', () => {
  const rows = [{
    course: { id: 'c1', status: 'published', title: 'T', instructor: 'I', classCount: '1', hours: '1h', level: 'L', category: 'C', language: 'L', desc: 'D', image: '' },
    modules: [],
    lessons: [],
  }];
  assert.equal(filterPublicReadyCourses(rows).length, 0);
});

// --- groupCourseContentRows ---

test('groupCourseContentRows groups modules and lessons by course', () => {
  const result = groupCourseContentRows({
    courses: [{ id: 'c1' }, { id: 'c2' }],
    modules: [
      { id: 'm1', courseId: 'c1' },
      { id: 'm2', courseId: 'c2' },
    ],
    lessons: [
      { id: 'l1', courseId: 'c1' },
      { id: 'l2', courseId: 'c1' },
      { id: 'l3', courseId: 'c2' },
    ],
  });
  assert.equal(result.length, 2);
  assert.equal(result[0].modules.length, 1);
  assert.equal(result[0].lessons.length, 2);
  assert.equal(result[1].modules.length, 1);
  assert.equal(result[1].lessons.length, 1);
});

test('groupCourseContentRows handles empty inputs', () => {
  const result = groupCourseContentRows({ courses: [], modules: [], lessons: [] });
  assert.deepEqual(result, []);
});

// --- readinessMessage ---

test('readinessMessage returns success message for publishable', () => {
  const msg = readinessMessage({ publishable: true, errors: [] });
  assert.ok(msg.includes('প্রস্তুত'));
});

test('readinessMessage returns first error for non-publishable', () => {
  const msg = readinessMessage({ publishable: false, errors: ['Error 1', 'Error 2'] });
  assert.equal(msg, 'Error 1');
});

test('readinessMessage returns default when no errors', () => {
  const msg = readinessMessage({ publishable: false, errors: [] });
  assert.ok(msg.includes('সম্পূর্ণ করুন'));
});
