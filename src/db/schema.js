import { boolean, index, integer, jsonb, pgTable, real, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  fullName: text('full_name').notNull(),
  email: text('email').unique(),
  phone: text('phone').unique(),
  passwordHash: text('password_hash'),
  googleId: text('google_id').unique(),
  authProvider: text('auth_provider').notNull().default('local'),
  role: text('role').notNull().default('patient'),
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
  content: text('content').notNull(),
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
  rating: real('rating').notNull().default(0.0),
  desc: text('desc').notNull(),
  image: text('image').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

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
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

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
