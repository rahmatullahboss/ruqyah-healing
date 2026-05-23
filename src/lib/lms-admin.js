import { z } from 'zod';
import {
  ACCESS_MODE,
  COURSE_STATUS,
  VIDEO_PROVIDER,
  faqFromTextarea,
  listFromTextarea,
  normalizeR2Key,
  normalizeVideoEmbedUrl,
  resourcesFromTextarea,
  safeJsonArray,
} from './lms-access.js';

const COURSE_STATUSES = new Set(Object.values(COURSE_STATUS));
const ACCESS_MODES = new Set(Object.values(ACCESS_MODE));
const CONTENT_TYPES = new Set(['video', 'text', 'mixed', 'resource']);
const VIDEO_PROVIDERS = new Set(Object.values(VIDEO_PROVIDER));
const PLACEHOLDER_IMAGE_PATTERN = /(default|placeholder|dummy|sample|example)/i;

const stringField = z.union([z.string(), z.number(), z.boolean(), z.null(), z.undefined()]).optional();

function cleanString(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function optionalInteger(value) {
  const text = cleanString(value);
  if (!text) return null;
  const number = Number(text);
  return Number.isFinite(number) ? Math.round(number) : Number.NaN;
}

function optionalFloat(value) {
  const text = cleanString(value);
  if (!text) return null;
  const number = Number(text);
  return Number.isFinite(number) ? number : Number.NaN;
}

function booleanValue(value, defaultValue = false) {
  if (value === true || value === 'true' || value === 'on' || value === '1') return true;
  if (value === false || value === 'false' || value === 'off' || value === '0') return false;
  return defaultValue;
}

export function isRealCourseImage(value) {
  const image = cleanString(value);
  if (!image) return false;
  if (PLACEHOLDER_IMAGE_PATTERN.test(image)) return false;
  return image.startsWith('/api/images/') || image.startsWith('/images/courses/') || /^https?:\/\//i.test(image);
}

export function normalizeAdminCoursePayload(body = {}) {
  const parsed = z.record(z.string(), stringField.or(z.array(z.any()))).safeParse(body);
  if (!parsed.success) {
    return { ok: false, errors: ['কোর্স ডাটা সঠিক নয়।'] };
  }

  const errors = [];
  const price = optionalInteger(body.price);
  const salePrice = optionalInteger(body.salePrice);
  const students = optionalInteger(body.students);
  const rating = optionalFloat(body.rating);
  const status = COURSE_STATUSES.has(cleanString(body.status)) ? cleanString(body.status) : COURSE_STATUS.DRAFT;
  const accessMode = ACCESS_MODES.has(cleanString(body.accessMode)) ? cleanString(body.accessMode) : ACCESS_MODE.OPEN;

  if (!cleanString(body.title)) errors.push('কোর্সের নাম দিন।');
  if (!cleanString(body.instructor)) errors.push('ইন্সট্রাক্টরের নাম দিন।');
  if (!cleanString(body.classCount)) errors.push('ক্লাস সংখ্যা/টেক্সট দিন।');
  if (!cleanString(body.hours)) errors.push('কোর্সের সময়কাল দিন।');
  if (!cleanString(body.level)) errors.push('কোর্সের লেভেল দিন।');
  if (!cleanString(body.category)) errors.push('কোর্সের ক্যাটাগরি দিন।');
  if (!cleanString(body.language)) errors.push('কোর্সের ভাষা দিন।');
  if (!cleanString(body.desc)) errors.push('সংক্ষিপ্ত বিবরণ দিন।');

  if (Number.isNaN(price) || (price !== null && price < 0)) {
    errors.push('কোর্স মূল্য ০ বা তার বেশি হতে হবে।');
  }
  if (Number.isNaN(salePrice) || (salePrice !== null && salePrice < 0)) {
    errors.push('ডিসকাউন্ট মূল্য ০ বা তার বেশি হতে হবে।');
  }
  if (salePrice !== null && (price === null || price <= 0)) {
    errors.push('ডিসকাউন্ট দিতে হলে আগে মূল মূল্য দিন।');
  }
  if (salePrice !== null && price !== null && salePrice >= price) {
    errors.push('ডিসকাউন্ট মূল্য মূল্যের চেয়ে কম হতে হবে।');
  }
  if (rating !== null && (rating < 0 || rating > 5)) {
    errors.push('রেটিং ০ থেকে ৫ এর মধ্যে হতে হবে।');
  }
  if (students !== null && students < 0) {
    errors.push('শিক্ষার্থী সংখ্যা ০ বা তার বেশি হতে হবে।');
  }

  const desc = cleanString(body.desc);
  const data = {
    title: cleanString(body.title),
    instructor: cleanString(body.instructor),
    students: students ?? 0,
    classCount: cleanString(body.classCount),
    hours: cleanString(body.hours),
    level: cleanString(body.level),
    price,
    salePrice,
    rating: rating ?? 0,
    desc,
    shortDescription: cleanString(body.shortDescription) || desc,
    fullDescription: cleanString(body.fullDescription) || desc,
    image: cleanString(body.image),
    videoLink: cleanString(body.videoLink),
    category: cleanString(body.category),
    status,
    language: cleanString(body.language),
    outcomes: listFromTextarea(body.outcomes),
    requirements: listFromTextarea(body.requirements),
    faq: faqFromTextarea(body.faq),
    accessMode,
    certificateEnabled: booleanValue(body.certificateEnabled, true),
  };

  return errors.length > 0 ? { ok: false, errors, data } : { ok: true, errors: [], data };
}

export function normalizeAdminLessonPayload(body = {}) {
  const errors = [];
  const contentType = CONTENT_TYPES.has(cleanString(body.contentType)) ? cleanString(body.contentType) : 'video';
  const videoProvider = VIDEO_PROVIDERS.has(cleanString(body.videoProvider)) ? cleanString(body.videoProvider) : VIDEO_PROVIDER.YOUTUBE;
  const videoUrl = videoProvider === VIDEO_PROVIDER.R2 ? normalizeR2Key(body.videoUrl) : cleanString(body.videoUrl);
  const resources = resourcesFromTextarea(body.resources);
  const textContent = cleanString(body.textContent);
  const sortOrder = optionalInteger(body.sortOrder);

  if (!cleanString(body.title)) errors.push('লেসনের নাম দিন।');
  if (!cleanString(body.courseId)) errors.push('Course ID missing.');
  if (!cleanString(body.moduleId)) errors.push('Module ID missing.');

  if ((contentType === 'video' || contentType === 'mixed') && !videoUrl) {
    errors.push('ভিডিও লেসনের জন্য ভিডিও URL বা R2 key দিন।');
  }
  if (videoUrl && videoProvider !== VIDEO_PROVIDER.R2 && !normalizeVideoEmbedUrl(videoUrl, videoProvider)) {
    errors.push('ভিডিও URL নির্বাচিত প্রোভাইডারের জন্য সঠিক নয়।');
  }
  if ((contentType === 'text' || contentType === 'mixed') && !textContent) {
    errors.push('টেক্সট লেসনের জন্য লিখিত কন্টেন্ট দিন।');
  }
  if (contentType === 'resource' && resources.length === 0) {
    errors.push('রিসোর্স লেসনের জন্য কমপক্ষে ১টি রিসোর্স দিন।');
  }

  const data = {
    moduleId: cleanString(body.moduleId),
    courseId: cleanString(body.courseId),
    title: cleanString(body.title),
    description: cleanString(body.description),
    contentType,
    videoUrl,
    videoProvider,
    textContent,
    resources,
    allowResourceDownload: booleanValue(body.allowResourceDownload, false),
    duration: cleanString(body.duration),
    isFreePreview: booleanValue(body.isFreePreview, false),
  };

  if (sortOrder !== null && !Number.isNaN(sortOrder)) data.sortOrder = sortOrder;

  return errors.length > 0 ? { ok: false, errors, data } : { ok: true, errors: [], data };
}

export function getLessonContentErrors(lesson) {
  const normalized = normalizeAdminLessonPayload({
    ...lesson,
    courseId: lesson?.courseId || 'course',
    moduleId: lesson?.moduleId || 'module',
    resources: lesson?.resources || [],
  });
  return normalized.ok ? [] : normalized.errors;
}

export function buildCourseReadiness({ course, modules = [], lessons = [] }) {
  const errors = [];
  const warnings = [];
  const summary = {
    moduleCount: modules.length,
    lessonCount: lessons.length,
    previewLessonCount: lessons.filter((lesson) => lesson.isFreePreview).length,
  };

  if (!course) {
    return { publishable: false, errors: ['কোর্স পাওয়া যায়নি।'], warnings, summary };
  }

  const courseValidation = normalizeAdminCoursePayload(course);
  if (!courseValidation.ok) errors.push(...courseValidation.errors);
  if (!isRealCourseImage(course.image)) errors.push('কোর্স কভার ছবি আপলোড করুন।');
  if (modules.length === 0) errors.push('কমপক্ষে ১টি মডিউল যোগ করুন।');
  if (lessons.length === 0) errors.push('কমপক্ষে ১টি লেসন যোগ করুন।');

  for (const lesson of lessons) {
    const lessonErrors = getLessonContentErrors(lesson);
    if (lessonErrors.length > 0) {
      errors.push(`লেসন "${lesson.title || lesson.id}" সম্পূর্ণ করুন: ${lessonErrors.join(' ')}`);
    }
  }

  if (lessons.length > 0 && summary.previewLessonCount === 0) {
    warnings.push('কমপক্ষে ১টি ফ্রি প্রিভিউ লেসন দিলে public conversion ভালো হবে।');
  }

  return {
    publishable: errors.length === 0,
    errors: [...new Set(errors)],
    warnings,
    summary,
  };
}

export function filterPublicReadyCourses(rows) {
  return rows.filter((row) => {
    if (row.course?.status !== COURSE_STATUS.PUBLISHED) return false;
    return buildCourseReadiness({
      course: row.course,
      modules: row.modules || [],
      lessons: row.lessons || [],
    }).publishable;
  });
}

export function groupCourseContentRows({ courses: courseRows = [], modules = [], lessons = [] }) {
  return courseRows.map((course) => ({
    course,
    modules: modules.filter((module) => module.courseId === course.id),
    lessons: lessons.filter((lesson) => lesson.courseId === course.id),
  }));
}

export function readinessMessage(readiness) {
  if (readiness.publishable) return 'কোর্সটি publish করার জন্য প্রস্তুত।';
  return readiness.errors[0] || 'কোর্সটি publish করার আগে content সম্পূর্ণ করুন।';
}
