-- Align LMS database defaults/indexes with current Drizzle schema and production behavior.
-- Safe to run after 0009_add_lms_tables.sql.

-- New/admin-created courses should default to draft, not published.
ALTER TABLE courses ALTER COLUMN status SET DEFAULT 'draft';

-- Keep the payments transaction uniqueness rule partial, matching the original migration
-- and avoiding accidental conflicts for blank transaction IDs during manual/admin flows.
DROP INDEX IF EXISTS course_payments_method_transaction_unique;
CREATE UNIQUE INDEX IF NOT EXISTS course_payments_method_transaction_unique
  ON course_payments(method, transaction_id)
  WHERE transaction_id IS NOT NULL AND transaction_id <> '';
