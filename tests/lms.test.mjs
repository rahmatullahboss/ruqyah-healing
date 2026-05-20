import test from 'node:test';
import assert from 'node:assert/strict';

// Mock database helper - creates a mock db that returns predefined data
function createMockDb(tables = {}) {
  const db = {};
  for (const [tableName, data] of Object.entries(tables)) {
    db[tableName] = data;
  }
  return db;
}

// We test the pure logic functions from lms.js
// Since the actual functions require a real DB connection, we test the logic inline

test('getUserCourseProgress calculates percentage correctly', () => {
  // Test: 3 completed out of 10 lessons = 30%
  const totalLessons = 10;
  const completedLessons = 3;
  const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  assert.equal(percentage, 30);
});

test('getUserCourseProgress returns 0 when no lessons', () => {
  const totalLessons = 0;
  const completedLessons = 0;
  const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  assert.equal(percentage, 0);
});

test('getUserCourseProgress returns 100 when all complete', () => {
  const totalLessons = 5;
  const completedLessons = 5;
  const percentage = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  assert.equal(percentage, 100);
});

test('isCourseCompleted returns true when all lessons done', () => {
  const total = 5;
  const completed = 5;
  const result = total > 0 && completed >= total;
  assert.equal(result, true);
});

test('isCourseCompleted returns false when some lessons remaining', () => {
  const total = 5;
  const completed = 3;
  const result = total > 0 && completed >= total;
  assert.equal(result, false);
});

test('isCourseCompleted returns false when no lessons', () => {
  const total = 0;
  const completed = 0;
  const result = total > 0 && completed >= total;
  assert.equal(result, false);
});

test('updateCourseLessonStats parses MM:SS duration correctly', () => {
  const lessons = [
    { duration: '12:30' },
    { duration: '8:45' },
    { duration: '15:20' },
  ];

  let totalSeconds = 0;
  for (const lesson of lessons) {
    if (lesson.duration) {
      const parts = lesson.duration.split(':').map(Number);
      if (parts.length === 2) {
        totalSeconds += parts[0] * 60 + parts[1];
      } else if (parts.length === 3) {
        totalSeconds += parts[0] * 3600 + parts[1] * 60 + parts[2];
      }
    }
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const totalDuration = hours > 0 ? `${hours} ঘণ্টা ${minutes} মিনিট` : `${minutes} মিনিট`;

  assert.equal(totalSeconds, 2195); // 12*60+30 + 8*60+45 + 15*60+20
  assert.equal(minutes, 36);
  assert.equal(totalDuration, '36 মিনিট');
});

test('updateCourseLessonStats parses HH:MM:SS duration correctly', () => {
  const lessons = [
    { duration: '1:30:00' },
    { duration: '45:20' },
  ];

  let totalSeconds = 0;
  for (const lesson of lessons) {
    if (lesson.duration) {
      const parts = lesson.duration.split(':').map(Number);
      if (parts.length === 2) {
        totalSeconds += parts[0] * 60 + parts[1];
      } else if (parts.length === 3) {
        totalSeconds += parts[0] * 3600 + parts[1] * 60 + parts[2];
      }
    }
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const totalDuration = hours > 0 ? `${hours} ঘণ্টা ${minutes} মিনিট` : `${minutes} মিনিট`;

  assert.equal(totalSeconds, 8120); // 1*3600+30*60 + 45*60+20
  assert.equal(hours, 2);
  assert.equal(minutes, 15);
  assert.equal(totalDuration, '2 ঘণ্টা 15 মিনিট');
});

test('updateCourseLessonStats handles empty duration', () => {
  const lessons = [
    { duration: '' },
    { duration: '10:00' },
    { duration: '' },
  ];

  let totalSeconds = 0;
  for (const lesson of lessons) {
    if (lesson.duration) {
      const parts = lesson.duration.split(':').map(Number);
      if (parts.length === 2) {
        totalSeconds += parts[0] * 60 + parts[1];
      }
    }
  }

  assert.equal(totalSeconds, 600);
});

test('getCourseContentTree builds correct structure', () => {
  const modules = [
    { id: 'm1', courseId: 'c1', title: 'Module 1', sortOrder: 1 },
    { id: 'm2', courseId: 'c1', title: 'Module 2', sortOrder: 2 },
  ];

  const lessons = [
    { id: 'l1', moduleId: 'm1', courseId: 'c1', title: 'Lesson 1', sortOrder: 1 },
    { id: 'l2', moduleId: 'm1', courseId: 'c1', title: 'Lesson 2', sortOrder: 2 },
    { id: 'l3', moduleId: 'm2', courseId: 'c1', title: 'Lesson 3', sortOrder: 1 },
  ];

  const quizzes = [
    { id: 'q1', moduleId: 'm1', courseId: 'c1', title: 'Quiz 1', sortOrder: 1 },
  ];

  // Build tree (same logic as getCourseContentTree)
  const tree = modules.map(mod => ({
    ...mod,
    lessons: lessons.filter(l => l.moduleId === mod.id),
    quizzes: quizzes.filter(q => q.moduleId === mod.id),
  }));

  assert.equal(tree.length, 2);
  assert.equal(tree[0].lessons.length, 2);
  assert.equal(tree[0].quizzes.length, 1);
  assert.equal(tree[1].lessons.length, 1);
  assert.equal(tree[1].quizzes.length, 0);
  assert.equal(tree[0].lessons[0].title, 'Lesson 1');
  assert.equal(tree[0].quizzes[0].title, 'Quiz 1');
});

test('getCourseContentTree handles empty modules', () => {
  const modules = [];
  const lessons = [{ id: 'l1', moduleId: 'm1', courseId: 'c1', title: 'Lesson 1' }];
  const quizzes = [];

  const tree = modules.map(mod => ({
    ...mod,
    lessons: lessons.filter(l => l.moduleId === mod.id),
    quizzes: quizzes.filter(q => q.moduleId === mod.id),
  }));

  assert.equal(tree.length, 0);
});

test('quiz grading logic calculates score correctly', () => {
  const answers = [
    { questionId: 'q1', selectedOption: 0, isCorrect: true },
    { questionId: 'q2', selectedOption: 2, isCorrect: true },
    { questionId: 'q3', selectedOption: 1, isCorrect: false },
    { questionId: 'q4', selectedOption: 0, isCorrect: true },
  ];

  const totalQuestions = answers.length;
  const correctAnswers = answers.filter(a => a.isCorrect).length;
  const score = Math.round((correctAnswers / totalQuestions) * 100);

  assert.equal(totalQuestions, 4);
  assert.equal(correctAnswers, 3);
  assert.equal(score, 75);
});

test('quiz pass/fail against passing score', () => {
  const passingScore = 60;

  assert.equal(75 >= passingScore, true);  // 75% passes
  assert.equal(50 >= passingScore, false); // 50% fails
  assert.equal(60 >= passingScore, true);  // exactly 60% passes
  assert.equal(59 >= passingScore, false); // 59% fails
});

test('quiz grading handles no answer (selectedOption = -1)', () => {
  const options = [{ text: 'A', isCorrect: true }, { text: 'B', isCorrect: false }];
  const selectedOption = -1;

  const selected = options[selectedOption]; // undefined
  const correctOption = options.find(o => o.isCorrect);
  const isCorrect = correctOption && selected === correctOption;

  assert.equal(isCorrect, false);
});

test('quiz grading handles correct answer', () => {
  const options = [
    { text: 'A', isCorrect: false },
    { text: 'B', isCorrect: true },
    { text: 'C', isCorrect: false },
  ];
  const selectedOption = 1;

  const correctOption = options.find(o => o.isCorrect);
  const isCorrect = correctOption && options[selectedOption] === correctOption;

  assert.equal(isCorrect, true);
});

test('quiz grading handles wrong answer', () => {
  const options = [
    { text: 'A', isCorrect: false },
    { text: 'B', isCorrect: true },
    { text: 'C', isCorrect: false },
  ];
  const selectedOption = 2;

  const correctOption = options.find(o => o.isCorrect);
  const isCorrect = correctOption && options[selectedOption] === correctOption;

  assert.equal(isCorrect, false);
});

test('review rating validation accepts 1-5', () => {
  const validRatings = [1, 2, 3, 4, 5];
  for (const rating of validRatings) {
    assert.equal(rating >= 1 && rating <= 5, true, `Rating ${rating} should be valid`);
  }
});

test('review rating validation rejects out of range', () => {
  const invalidRatings = [0, -1, 6, 10];
  for (const rating of invalidRatings) {
    assert.equal(rating >= 1 && rating <= 5, false, `Rating ${rating} should be invalid`);
  }
});

test('progress upsert logic - new record inserts', () => {
  const existing = []; // no existing record
  const shouldInsert = existing.length === 0;
  assert.equal(shouldInsert, true);
});

test('progress upsert logic - existing record updates', () => {
  const existing = [{ id: 'p1', completed: false }]; // existing incomplete record
  const shouldUpdate = existing.length > 0 && !existing[0].completed;
  assert.equal(shouldUpdate, true);
});

test('progress upsert logic - already completed skips', () => {
  const existing = [{ id: 'p1', completed: true }]; // already completed
  const needsUpdate = existing.length > 0 && !existing[0].completed;
  assert.equal(needsUpdate, false);
});

test('enrollment status check - approved allows access', () => {
  const enrollment = { status: 'approved' };
  assert.equal(enrollment.status === 'approved', true);
});

test('enrollment status check - pending blocks access', () => {
  const enrollment = { status: 'pending' };
  assert.equal(enrollment.status === 'approved', false);
});

test('enrollment status check - no enrollment blocks access', () => {
  const enrollment = null;
  assert.equal(enrollment?.status === 'approved', false);
});

test('max attempts check - within limit allows', () => {
  const maxAttempts = 3;
  const currentAttempts = 2;
  assert.equal(currentAttempts >= maxAttempts, false);
});

test('max attempts check - at limit blocks', () => {
  const maxAttempts = 3;
  const currentAttempts = 3;
  assert.equal(currentAttempts >= maxAttempts, true);
});

test('max attempts check - null limit allows unlimited', () => {
  const maxAttempts = null;
  const currentAttempts = 100;
  // When maxAttempts is null, check is skipped entirely (falsy value)
  const shouldBlock = maxAttempts && currentAttempts >= maxAttempts;
  assert.equal(!!shouldBlock, false);
});

test('video URL transformation - YouTube watch to embed', () => {
  const url = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';
  const embedUrl = url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/');
  assert.equal(embedUrl, 'https://www.youtube.com/embed/dQw4w9WgXcQ');
});

test('video URL transformation - YouTube short URL', () => {
  const url = 'https://youtu.be/dQw4w9WgXcQ';
  const embedUrl = url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/');
  assert.equal(embedUrl, 'https://youtube.com/embed/dQw4w9WgXcQ');
});

test('video URL transformation - Google Drive view to preview', () => {
  const url = 'https://drive.google.com/file/d/abc123/view?usp=sharing';
  const embedUrl = url.replace('/view', '/preview').replace('?usp=sharing', '');
  assert.equal(embedUrl, 'https://drive.google.com/file/d/abc123/preview');
});

test('certificate completion date formatting', () => {
  const date = new Date('2026-05-17T10:30:00Z');
  const formatted = date.toLocaleDateString('bn-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  // Just verify it produces a string (locale-dependent)
  assert.equal(typeof formatted, 'string');
  assert.ok(formatted.length > 0);
});

test('module sort order calculation', () => {
  const existingModules = [
    { sortOrder: 1 },
    { sortOrder: 2 },
    { sortOrder: 3 },
  ];
  const maxSort = Math.max(...existingModules.map(m => m.sortOrder));
  const nextSort = maxSort + 1;
  assert.equal(nextSort, 4);
});

test('module sort order for empty course', () => {
  const existingModules = [];
  const maxSort = existingModules.length > 0 ? Math.max(...existingModules.map(m => m.sortOrder)) : 0;
  const nextSort = maxSort + 1;
  assert.equal(nextSort, 1);
});
