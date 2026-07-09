import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import {
  courses,
  courseModules,
  courseLessons,
  courseQuizzes,
  courseQuizQuestions,
} from '../src/db/schema.js';
import { getDemoCourseContentRows } from '../src/data/demo-courses.js';

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is required to seed demo courses.');
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);
const db = drizzle(sql);

function updateSet(row) {
  const { id: _id, ...set } = row;
  return set;
}

async function upsertRows(table, rows, label) {
  for (const row of rows) {
    await db.insert(table)
      .values(row)
      .onConflictDoUpdate({
        target: table.id,
        set: updateSet(row),
      });
  }

  console.log(`✓ ${rows.length} ${label} upserted`);
}

async function run() {
  const rows = getDemoCourseContentRows();

  console.log('Seeding Ruqyah Healing demo courses...');
  await upsertRows(courses, rows.courses, 'courses');
  await upsertRows(courseModules, rows.modules, 'course modules');
  await upsertRows(courseLessons, rows.lessons, 'course lessons');
  await upsertRows(courseQuizzes, rows.quizzes, 'course quizzes');
  await upsertRows(courseQuizQuestions, rows.quizQuestions, 'quiz questions');

  console.log('Demo courses are ready for the public Courses section.');
}

run().catch((error) => {
  console.error('Error seeding demo courses:', error);
  process.exit(1);
});
