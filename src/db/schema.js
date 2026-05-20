import { boolean, index, integer, jsonb, pgTable, real, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  fullName: text('full_name').notNull(),
  email: text('email').unique(),
  phone: text('phone').unique(),
  passwordHash: text('password_hash'),
  googleId: text('google_id').unique(),
  authProvider: text('auth_provider').notNull().default('local'),
  role: text('role').notNull().default('patient'),
  resetToken: text('reset_token'),
  resetTokenExpires: timestamp('reset_token_expires', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
export const appointments = pgTable('appointments', {
  id: text('id').primaryKey(),
  fullName: text('full_name').notNull(),
  nid: text('nid').notNull().default(''),
  age: text('age').notNull(),
  weight: text('weight').notNull().default(''),
  gender: text('gender').notNull(),
  religion: text('religion').notNull(),
  duration: text('duration').notNull(),
  previousTreatment: boolean('previous_treatment').notNull().default(false),
  previousTreatmentDetails: text('previous_treatment_details').notNull().default(''),
  serviceMode: text('service_mode').notNull(),
  sessionFormat: text('session_format').notNull(),
  treatmentTypeKey: text('treatment_type_key').notNull(),
  treatmentTypeLabel: text('treatment_type_label').notNull(),
  subServices: jsonb('sub_services').notNull().default([]),
  preferredDate: text('preferred_date').notNull(),
  preferredTime: text('preferred_time').notNull(),
  address: text('address').notNull(),
  phone: text('phone').notNull(),
  whatsapp: text('whatsapp').notNull().default(''),
  problem: text('problem').notNull(),
  paymentMethod: text('payment_method').notNull(),
  transactionId: text('transaction_id').notNull(),
  paymentTimestamp: text('payment_timestamp').notNull(),
  source: text('source').notNull().default('web'),
  status: text('status').notNull().default('pending'),
  cancelReason: text('cancel_reason').notNull().default(''),
  adminNotes: text('admin_notes').notNull().default(''),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('appointments_status_idx').on(table.status),
  index('appointments_created_at_idx').on(table.createdAt),
  index('appointments_phone_idx').on(table.phone),
]);

export const posts = pgTable('posts', {
  id: text('id').primaryKey(),
  slug: text('slug').unique().notNull(),
  title: text('title').notNull(),
  excerpt: text('excerpt').notNull(),
  category: text('category').notNull(),
  tags: jsonb('tags').notNull().default([]),
  date: text('date').notNull(),
  content: text('content').notNull().default(''),
  // Canonical HTML content for posts authored with the TipTap rich-text editor.
  // NULL means the post still uses the legacy `content` (Markdown) field.
  contentHtml: text('content_html'),
  published: boolean('published').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('posts_published_date_idx').on(table.published, table.date),
  index('posts_category_published_idx').on(table.category, table.published),
  index('posts_slug_idx').on(table.slug),
]);

export const courses = pgTable('courses', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  instructor: text('instructor').notNull(),
  students: integer('students').notNull().default(0),
  classCount: text('class_count').notNull(),
  hours: text('hours').notNull(),
  level: text('level').notNull(),
  price: integer('price'), // Nullable for free courses
  salePrice: integer('sale_price'),
  rating: real('rating').notNull().default(0.0),
  desc: text('desc').notNull(),
  shortDescription: text('short_description').notNull().default(''),
  fullDescription: text('full_description').notNull().default(''),
  image: text('image').notNull(),
  videoLink: text('video_link').notNull().default(''), // Google Drive / YouTube URL
  category: text('category').notNull().default('রুকইয়াহ শারইয়াহ'),
  status: text('status').notNull().default('draft'),
  language: text('language').notNull().default('বাংলা'),
  outcomes: jsonb('outcomes').notNull().default([]),
  requirements: jsonb('requirements').notNull().default([]),
  faq: jsonb('faq').notNull().default([]),
  accessMode: text('access_mode').notNull().default('open'), // 'open' | 'sequential'
  certificateEnabled: boolean('certificate_enabled').notNull().default(true),
  totalLessons: integer('total_lessons').notNull().default(0),
  totalDuration: text('total_duration').notNull().default(''),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const courseModules = pgTable('course_modules', {
  id: text('id').primaryKey(),
  courseId: text('course_id').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('course_modules_course_idx').on(table.courseId),
  index('course_modules_sort_idx').on(table.courseId, table.sortOrder),
]);

export const courseLessons = pgTable('course_lessons', {
  id: text('id').primaryKey(),
  moduleId: text('module_id').notNull(),
  courseId: text('course_id').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  contentType: text('content_type').notNull().default('video'), // 'video' | 'text' | 'mixed' | 'resource'
  videoUrl: text('video_url').notNull().default(''),
  videoProvider: text('video_provider').notNull().default('youtube'), // 'youtube' | 'google_drive' | 'embed' | 'r2'
  textContent: text('text_content').notNull().default(''), // HTML content
  resources: jsonb('resources').notNull().default([]),
  allowResourceDownload: boolean('allow_resource_download').notNull().default(false),
  duration: text('duration').notNull().default(''), // e.g. "12:30"
  sortOrder: integer('sort_order').notNull().default(0),
  isFreePreview: boolean('is_free_preview').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('course_lessons_module_idx').on(table.moduleId),
  index('course_lessons_course_idx').on(table.courseId),
  index('course_lessons_sort_idx').on(table.moduleId, table.sortOrder),
]);

export const courseQuizzes = pgTable('course_quizzes', {
  id: text('id').primaryKey(),
  moduleId: text('module_id'), // nullable — can be course-level
  courseId: text('course_id').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  passingScore: integer('passing_score').notNull().default(60), // percentage
  timeLimit: integer('time_limit'), // minutes, nullable = no limit
  maxAttempts: integer('max_attempts'), // nullable = unlimited
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('course_quizzes_course_idx').on(table.courseId),
  index('course_quizzes_module_idx').on(table.moduleId),
]);

export const courseQuizQuestions = pgTable('course_quiz_questions', {
  id: text('id').primaryKey(),
  quizId: text('quiz_id').notNull(),
  questionText: text('question_text').notNull(),
  questionType: text('question_type').notNull().default('multiple_choice'), // 'multiple_choice' | 'true_false'
  options: jsonb('options').notNull().default([]), // [{text: string, isCorrect: boolean}]
  explanation: text('explanation').notNull().default(''),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('course_quiz_questions_quiz_idx').on(table.quizId),
]);

export const courseProgress = pgTable('course_progress', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  courseId: text('course_id').notNull(),
  lessonId: text('lesson_id').notNull(),
  completed: boolean('completed').notNull().default(false),
  watchedSeconds: integer('watched_seconds').notNull().default(0),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('course_progress_user_idx').on(table.userId),
  index('course_progress_course_idx').on(table.courseId),
  index('course_progress_user_course_idx').on(table.userId, table.courseId),
  uniqueIndex('course_progress_user_lesson_unique').on(table.userId, table.lessonId),
]);

export const courseQuizAttempts = pgTable('course_quiz_attempts', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  quizId: text('quiz_id').notNull(),
  courseId: text('course_id').notNull(),
  score: real('score').notNull().default(0), // percentage
  totalQuestions: integer('total_questions').notNull().default(0),
  correctAnswers: integer('correct_answers').notNull().default(0),
  answers: jsonb('answers').notNull().default([]), // [{questionId, selectedOption, isCorrect}]
  passed: boolean('passed').notNull().default(false),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('course_quiz_attempts_user_idx').on(table.userId),
  index('course_quiz_attempts_quiz_idx').on(table.quizId),
  index('course_quiz_attempts_course_idx').on(table.courseId),
]);

export const courseReviews = pgTable('course_reviews', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  courseId: text('course_id').notNull(),
  rating: integer('rating').notNull(), // 1-5
  comment: text('comment').notNull().default(''),
  published: boolean('published').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('course_reviews_course_idx').on(table.courseId),
  uniqueIndex('course_reviews_user_course_unique').on(table.userId, table.courseId),
]);

export const courseEnrollments = pgTable('course_enrollments', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  courseId: text('course_id').notNull(),
  status: text('status').notNull().default('pending'),
  source: text('source').notNull().default('manual_payment'),
  paymentMethod: text('payment_method'),
  paymentNumber: text('payment_number'),
  transactionId: text('transaction_id'),
  approvedBy: text('approved_by'),
  approvedAt: timestamp('approved_at', { withTimezone: true }),
  revokedAt: timestamp('revoked_at', { withTimezone: true }),
  accessExpiresAt: timestamp('access_expires_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  certificateUrl: text('certificate_url'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('course_enrollments_user_idx').on(table.userId),
  index('course_enrollments_course_idx').on(table.courseId),
  uniqueIndex('course_enrollments_user_course_unique').on(table.userId, table.courseId),
]);

export const courseOrders = pgTable('course_orders', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  courseId: text('course_id').notNull(),
  enrollmentId: text('enrollment_id'),
  amount: integer('amount').notNull().default(0),
  currency: text('currency').notNull().default('BDT'),
  status: text('status').notNull().default('pending'), // pending | manual_review | paid | failed | cancelled
  paymentMethod: text('payment_method').notNull().default('manual'),
  transactionId: text('transaction_id'),
  metadata: jsonb('metadata').notNull().default({}),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('course_orders_user_idx').on(table.userId),
  index('course_orders_course_idx').on(table.courseId),
  index('course_orders_enrollment_idx').on(table.enrollmentId),
  index('course_orders_status_idx').on(table.status),
]);

export const coursePayments = pgTable('course_payments', {
  id: text('id').primaryKey(),
  orderId: text('order_id').notNull(),
  enrollmentId: text('enrollment_id'),
  userId: text('user_id').notNull(),
  courseId: text('course_id').notNull(),
  amount: integer('amount').notNull().default(0),
  currency: text('currency').notNull().default('BDT'),
  method: text('method').notNull(),
  provider: text('provider').notNull().default('manual'),
  providerPaymentId: text('provider_payment_id'),
  transactionId: text('transaction_id').notNull(),
  paymentNumber: text('payment_number'),
  status: text('status').notNull().default('pending_verification'), // pending_verification | verified | rejected
  rawPayload: jsonb('raw_payload').notNull().default({}),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('course_payments_order_idx').on(table.orderId),
  index('course_payments_user_idx').on(table.userId),
  index('course_payments_course_idx').on(table.courseId),
  uniqueIndex('course_payments_method_transaction_unique').on(table.method, table.transactionId),
]);

export const siteSettings = pgTable('site_settings', {
  key: text('key').primaryKey(),
  value: jsonb('value').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const notices = pgTable('notices', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  icon: text('icon').notNull().default('📢'),
  badge: text('badge').notNull().default('নোটিশ'),
  badgeColor: text('badge_color').notNull().default('event'),
  eventDate: text('event_date').notNull(),
  urgent: boolean('urgent').notNull().default(false),
  published: boolean('published').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const testimonials = pgTable('testimonials', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  image: text('image'),
  message: text('message').notNull(),
  rating: integer('rating').notNull().default(5),
  role: text('role'),
  orderIndex: integer('order_index').notNull().default(0),
  published: boolean('published').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('testimonials_order_idx').on(table.orderIndex),
  index('testimonials_published_idx').on(table.published),
]);

export const products = pgTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  price: integer('price').notNull(),
  rating: real('rating').notNull().default(5.0),
  benefit: text('benefit').notNull(),
  image: text('image').notNull().default(''),
  badge: text('badge'),
  category: text('category').notNull().default('অন্যান্য'),
  published: boolean('published').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const resources = pgTable('resources', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  fileUrl: text('file_url').notNull().default(''),
  pages: integer('pages').notNull().default(0),
  fileSize: text('file_size').notNull().default(''),
  category: text('category').notNull().default('গাইড'),
  language: text('language').notNull().default('বাংলা'),
  published: boolean('published').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey(),
  adminId: text('admin_id').notNull(),
  adminName: text('admin_name').notNull(),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  details: jsonb('details').notNull().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('audit_logs_created_at_idx').on(table.createdAt),
  index('audit_logs_entity_idx').on(table.entityType, table.entityId),
]);

export const aiChatLogs = pgTable('ai_chat_logs', {
  id: text('id').primaryKey(),
  sessionId: text('session_id').notNull(),
  userMessage: text('user_message').notNull(),
  aiResponse: text('ai_response').notNull(),
  model: text('model').notNull(),
  neuronsUsed: integer('neurons_used').notNull().default(0),
  clientIp: text('client_ip').notNull().default(''),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('ai_chat_logs_session_id_idx').on(table.sessionId),
  index('ai_chat_logs_created_at_idx').on(table.createdAt),
]);

export const testResults = pgTable('test_results', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  testType: text('test_type').notNull(),
  testTitle: text('test_title').notNull(),
  score: integer('score').notNull(),
  totalQuestions: integer('total_questions').notNull(),
  yesCount: integer('yes_count').notNull().default(0),
  maybeCount: integer('maybe_count').notNull().default(0),
  noCount: integer('no_count').notNull().default(0),
  resultLevel: text('result_level').notNull(),
  resultText: text('result_text').notNull(),
  answers: jsonb('answers').notNull().default([]),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('test_results_user_idx').on(table.userId),
  index('test_results_created_at_idx').on(table.createdAt),
]);
