import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

import { demoCourses } from '../src/data/demo-courses.js';

const source = readFileSync(new URL('../src/pages/index.astro', import.meta.url), 'utf8');
const sourceEn = readFileSync(new URL('../src/pages/en/index.astro', import.meta.url), 'utf8');

function has(pattern, message) {
  assert.match(source, pattern, message);
}

test('Homepage courses section uses shared demo catalog fallback instead of old inline data', () => {
  has(/import \{ demoCourses as demoCourseCatalog \} from '\.\.\/data\/demo-courses\.js';/);
  has(/const livePreviewCourses = liveCoursesList\.slice\(0, 4\);/);
  has(/const livePreviewCourseIds = new Set\(livePreviewCourses\.map\(\(course\) => course\.id\)\);/);
  has(/const homepageDemoCourses = demoCourseCatalog\.slice\(0, 4\)/);
  has(/\.filter\(\(course\) => !livePreviewCourseIds\.has\(course\.id\)\)/);
  has(/const coursesList = \[\.\.\.livePreviewCourses, \.\.\.homepageDemoCourses\]\.slice\(0, 4\);/);
  assert.doesNotMatch(source, /const demoCourses = \[/, 'homepage should not keep a separate stale inline demo course array');
});

test('Homepage fallback catalog has enough professional courses for the section', () => {
  assert.ok(demoCourses.length >= 4, 'at least four fallback courses are needed for the homepage grid');

  for (const course of demoCourses.slice(0, 4)) {
    assert.equal(course.status, 'published');
    assert.equal(course.language, 'বাংলা');
    assert.ok(course.title.length >= 12, `${course.id} needs a meaningful title`);
    assert.ok(course.shortDescription.length >= 35, `${course.id} needs a useful card summary`);
    assert.ok(course.image.startsWith('/images/courses/'), `${course.id} should use a real course image path`);
    assert.ok(course.classCount, `${course.id} should expose class count`);
    assert.ok(course.hours, `${course.id} should expose duration`);
    assert.ok(course.level, `${course.id} should expose level`);
    assert.ok(course.category, `${course.id} should expose category`);
  }
});

test('Homepage places the Raqi profile after the course section', () => {
  const blogIndex = source.indexOf('<!-- ⑤ রুকইয়াহ ব্লগ -->');
  const packageIndex = source.indexOf('<!-- ⑥ আমাদের প্যাকেজ -->');
  const productIndex = source.indexOf('<!-- ⑦ আমাদের প্রোডাক্টসমূহ -->');
  const coursesIndex = source.indexOf('<!-- ⑧ আমাদের কোর্সসমূহ -->');
  const raqiIndex = source.indexOf('<!-- Raqi Profile Preview -->');
  const homeServiceIndex = source.indexOf('<!-- হোম সার্ভিস উপলব্ধ -->');

  assert.ok(blogIndex > -1, 'Bangla homepage should include blog section marker');
  assert.ok(packageIndex > -1, 'Bangla homepage should include package section marker');
  assert.ok(productIndex > -1, 'Bangla homepage should include product section marker');
  assert.ok(coursesIndex > -1, 'Bangla homepage should include courses section marker');
  assert.ok(raqiIndex > -1, 'Bangla homepage should include Raqi profile marker');
  assert.ok(homeServiceIndex > -1, 'Bangla homepage should include home service marker');
  assert.ok(blogIndex < packageIndex, 'Bangla blog section should come before packages');
  assert.ok(packageIndex < productIndex, 'Bangla packages should come before products');
  assert.ok(productIndex < coursesIndex, 'Bangla products should come before courses');
  assert.ok(coursesIndex < raqiIndex, 'Bangla Raqi profile should appear after the course section');
  assert.ok(raqiIndex < homeServiceIndex, 'Bangla Raqi profile should stay before home service');

  const blogIndexEn = sourceEn.indexOf('<!-- Ruqyah blog -->');
  const raqiIndexEn = sourceEn.indexOf('<!-- Raqi Profile Preview -->');
  const homeServiceIndexEn = sourceEn.indexOf('<!-- Home service available -->');

  assert.ok(blogIndexEn > -1, 'English homepage should include blog section marker');
  assert.ok(raqiIndexEn > -1, 'English homepage should include Raqi profile marker');
  assert.ok(homeServiceIndexEn > -1, 'English homepage should include home service marker');
  assert.ok(blogIndexEn < raqiIndexEn, 'English Raqi profile should appear after the blog section');
  assert.ok(raqiIndexEn < homeServiceIndexEn, 'English Raqi profile should stay before home service');
});

test('Homepage courses section renders professional card structure', () => {
  has(/<section class="section courses-preview-section reveal">/);
  has(/<span class="section-kicker">Courses<\/span>/);
  has(/<h2>আমাদের কোর্সসমূহ<\/h2>/);
  has(/structured, safe এবং practical learning path/);
  has(/class="courses-preview-grid"/);
  has(/class="course-preview-card scroll-reveal-child"/);
  has(/style=\{`--stagger-delay:\$\{i \* 70\}ms`\}/);
});

test('Homepage courses section shows trust badges above the cards', () => {
  has(/class="courses-preview-lead scroll-reveal"/);
  has(/ফ্রি প্রিভিউ/);
  has(/বাংলা লেসন/);
  has(/কুইজ ও সার্টিফিকেট/);
  has(/Safety-first guidance/);
  has(/\.courses-preview-lead span::before/);
  has(/content: '✓';/);
});

test('Homepage course cards include image, badges, metadata, stats, and CTA', () => {
  has(/<img src=\{course\.image\} alt=\{course\.title\} loading="lazy" decoding="async" \/>/);
  has(/<span class="course-card-badge">\{course\.level\}<\/span>/);
  has(/course-price-chip/);
  has(/getCoursePreviewPrice\(course\) === 'ফ্রি'/);
  has(/<span>\{course\.category\}<\/span>/);
  has(/<span>\{course\.classCount\}<\/span>/);
  has(/<h3>\{course\.title\}<\/h3>/);
  has(/<p>\{courseSummary\}<\/p>/);
  has(/class="course-mini-stats"/);
  has(/<span>\{course\.hours\}<\/span>/);
  has(/<span>\{course\.language \|\| 'বাংলা'\}<\/span>/);
  has(/বিস্তারিত দেখুন →/);
});

test('Homepage course links support both live detail pages and fallback courses page', () => {
  has(/href: '\/courses'/);
  has(/const courseHref = course\.href \|\| `\/courses\/\$\{course\.id\}`;/);
  has(/<a href=\{courseHref\}/);
  has(/<a href="\/courses" class="btn btn-outline">সকল কোর্স দেখুন<\/a>/);
});

test('Homepage courses section has responsive and interactive card styling', () => {
  has(/grid-template-columns: repeat\(4, minmax\(0, 1fr\)\);/);
  has(/@media \(max-width: 1180px\)/);
  has(/grid-template-columns: repeat\(2, minmax\(0, 1fr\)\);/);
  has(/@media \(max-width: 560px\)/);
  has(/grid-template-columns: 1fr;/);
  has(/\.course-preview-card:hover/);
  has(/transform: translateY\(-6px\);/);
  has(/\.course-preview-card:hover \.course-view-more/);
});
