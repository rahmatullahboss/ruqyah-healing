-- LMS Migration: Add course content, progress, quiz, and review tables
-- Run this against your Neon PostgreSQL database

-- 1. Add new columns to existing courses table
ALTER TABLE courses ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'রুকইয়াহ শারইয়াহ';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS sale_price INTEGER;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS short_description TEXT NOT NULL DEFAULT '';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS full_description TEXT NOT NULL DEFAULT '';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'published';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS language TEXT NOT NULL DEFAULT 'বাংলা';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS outcomes JSONB NOT NULL DEFAULT '[]';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS requirements JSONB NOT NULL DEFAULT '[]';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS faq JSONB NOT NULL DEFAULT '[]';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS access_mode TEXT NOT NULL DEFAULT 'open';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS certificate_enabled BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS total_lessons INTEGER NOT NULL DEFAULT 0;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS total_duration TEXT NOT NULL DEFAULT '';

-- 2. Add new columns to existing course_enrollments table
ALTER TABLE course_enrollments ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'manual_payment';
ALTER TABLE course_enrollments ADD COLUMN IF NOT EXISTS approved_by TEXT;
ALTER TABLE course_enrollments ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;
ALTER TABLE course_enrollments ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMPTZ;
ALTER TABLE course_enrollments ADD COLUMN IF NOT EXISTS access_expires_at TIMESTAMPTZ;
ALTER TABLE course_enrollments ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE course_enrollments ADD COLUMN IF NOT EXISTS certificate_url TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS course_enrollments_user_course_unique ON course_enrollments(user_id, course_id);

-- 3. Create course_modules table
CREATE TABLE IF NOT EXISTS course_modules (
  id TEXT PRIMARY KEY,
  course_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS course_modules_course_idx ON course_modules(course_id);
CREATE INDEX IF NOT EXISTS course_modules_sort_idx ON course_modules(course_id, sort_order);

-- 4. Create course_lessons table
CREATE TABLE IF NOT EXISTS course_lessons (
  id TEXT PRIMARY KEY,
  module_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  content_type TEXT NOT NULL DEFAULT 'video',
  video_url TEXT NOT NULL DEFAULT '',
  video_provider TEXT NOT NULL DEFAULT 'youtube',
  text_content TEXT NOT NULL DEFAULT '',
  resources JSONB NOT NULL DEFAULT '[]',
  allow_resource_download BOOLEAN NOT NULL DEFAULT false,
  duration TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_free_preview BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE course_lessons ADD COLUMN IF NOT EXISTS description TEXT NOT NULL DEFAULT '';
ALTER TABLE course_lessons ADD COLUMN IF NOT EXISTS resources JSONB NOT NULL DEFAULT '[]';
ALTER TABLE course_lessons ADD COLUMN IF NOT EXISTS allow_resource_download BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX IF NOT EXISTS course_lessons_module_idx ON course_lessons(module_id);
CREATE INDEX IF NOT EXISTS course_lessons_course_idx ON course_lessons(course_id);
CREATE INDEX IF NOT EXISTS course_lessons_sort_idx ON course_lessons(module_id, sort_order);

-- 5. Create course_quizzes table
CREATE TABLE IF NOT EXISTS course_quizzes (
  id TEXT PRIMARY KEY,
  module_id TEXT,
  course_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  passing_score INTEGER NOT NULL DEFAULT 60,
  time_limit INTEGER,
  max_attempts INTEGER,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS course_quizzes_course_idx ON course_quizzes(course_id);
CREATE INDEX IF NOT EXISTS course_quizzes_module_idx ON course_quizzes(module_id);

-- 6. Create course_quiz_questions table
CREATE TABLE IF NOT EXISTS course_quiz_questions (
  id TEXT PRIMARY KEY,
  quiz_id TEXT NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL DEFAULT 'multiple_choice',
  options JSONB NOT NULL DEFAULT '[]',
  explanation TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS course_quiz_questions_quiz_idx ON course_quiz_questions(quiz_id);

-- 7. Create course_progress table
CREATE TABLE IF NOT EXISTS course_progress (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  watched_seconds INTEGER NOT NULL DEFAULT 0,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS course_progress_user_idx ON course_progress(user_id);
CREATE INDEX IF NOT EXISTS course_progress_course_idx ON course_progress(course_id);
CREATE INDEX IF NOT EXISTS course_progress_user_course_idx ON course_progress(user_id, course_id);
CREATE UNIQUE INDEX IF NOT EXISTS course_progress_user_lesson_unique ON course_progress(user_id, lesson_id);

-- 8. Create course_quiz_attempts table
CREATE TABLE IF NOT EXISTS course_quiz_attempts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  quiz_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  score REAL NOT NULL DEFAULT 0,
  total_questions INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  answers JSONB NOT NULL DEFAULT '[]',
  passed BOOLEAN NOT NULL DEFAULT false,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS course_quiz_attempts_user_idx ON course_quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS course_quiz_attempts_quiz_idx ON course_quiz_attempts(quiz_id);
CREATE INDEX IF NOT EXISTS course_quiz_attempts_course_idx ON course_quiz_attempts(course_id);

-- 9. Create course_reviews table
CREATE TABLE IF NOT EXISTS course_reviews (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  rating INTEGER NOT NULL,
  comment TEXT NOT NULL DEFAULT '',
  published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS course_reviews_course_idx ON course_reviews(course_id);
CREATE UNIQUE INDEX IF NOT EXISTS course_reviews_user_course_unique ON course_reviews(user_id, course_id);

-- 10. Create course_orders table
CREATE TABLE IF NOT EXISTS course_orders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  enrollment_id TEXT,
  amount INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'BDT',
  status TEXT NOT NULL DEFAULT 'pending',
  payment_method TEXT NOT NULL DEFAULT 'manual',
  transaction_id TEXT,
  metadata JSONB NOT NULL DEFAULT '{}',
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS course_orders_user_idx ON course_orders(user_id);
CREATE INDEX IF NOT EXISTS course_orders_course_idx ON course_orders(course_id);
CREATE INDEX IF NOT EXISTS course_orders_enrollment_idx ON course_orders(enrollment_id);
CREATE INDEX IF NOT EXISTS course_orders_status_idx ON course_orders(status);

-- 11. Create course_payments table
CREATE TABLE IF NOT EXISTS course_payments (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL,
  enrollment_id TEXT,
  user_id TEXT NOT NULL,
  course_id TEXT NOT NULL,
  amount INTEGER NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'BDT',
  method TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'manual',
  provider_payment_id TEXT,
  transaction_id TEXT NOT NULL,
  payment_number TEXT,
  status TEXT NOT NULL DEFAULT 'pending_verification',
  raw_payload JSONB NOT NULL DEFAULT '{}',
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS course_payments_order_idx ON course_payments(order_id);
CREATE INDEX IF NOT EXISTS course_payments_user_idx ON course_payments(user_id);
CREATE INDEX IF NOT EXISTS course_payments_course_idx ON course_payments(course_id);
CREATE UNIQUE INDEX IF NOT EXISTS course_payments_method_transaction_unique
  ON course_payments(method, transaction_id)
  WHERE transaction_id IS NOT NULL AND transaction_id <> '';
