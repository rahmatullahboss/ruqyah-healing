import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (relativePath) => readFile(new URL(`../${relativePath}`, import.meta.url), 'utf8');

const [
  appointmentApi,
  forgotPasswordApi,
  resetPasswordApi,
  progressApi,
  learningPage,
  noticeUpdateApi,
  packageJson,
] = await Promise.all([
  read('src/pages/api/appointments.ts'),
  read('src/pages/api/auth/forgot-password.ts'),
  read('src/pages/api/auth/reset-password.ts'),
  read('src/pages/api/courses/[id]/progress.ts'),
  read('src/pages/courses/[id]/learn.astro'),
  read('src/pages/api/admin/notices/update.ts'),
  read('package.json'),
]);

test('booking creation uses transaction locks and rejects duplicate slot/payment submissions', () => {
  assert.match(appointmentApi, /pg_advisory_xact_lock/);
  assert.match(appointmentApi, /slot_unavailable/);
  assert.match(appointmentApi, /transaction_already_used/);
  assert.match(appointmentApi, /lower\(\$\{appointments\.transactionId\}\)/);
});

test('password reset emails use the actual one-time token without storing it in plaintext', () => {
  assert.doesNotMatch(forgotPasswordApi, /\[REDACTED_SECRET\]/);
  assert.match(forgotPasswordApi, /searchParams\.set\('token', rawToken\)/);
  assert.match(forgotPasswordApi, /createHash\('sha256'\)/);
  assert.match(resetPasswordApi, /const tokenHash = hashResetToken/);
  assert.match(resetPasswordApi, /eq\(users\.resetToken, tokenHash\)/);
});

test('LMS learning and progress routes enforce active, non-expired enrollment', () => {
  assert.match(learningPage, /isEnrollmentActive\(enrollment\[0\]\)/);
  assert.match(progressApi, /isEnrollmentActive\(enrollment\[0\]\)/);
});

test('notice update only writes columns present in the schema', () => {
  assert.doesNotMatch(noticeUpdateApi, /updatedAt/);
  assert.match(noticeUpdateApi, /noticeUpdateSchema/);
});

test('default npm test command runs server-independent tests', () => {
  const pkg = JSON.parse(packageJson);
  assert.equal(pkg.scripts.test, 'node scripts/run-unit-tests.mjs');
  assert.match(pkg.scripts['test:production'], /smoke\.test\.mjs/);
  assert.match(pkg.scripts['test:production'], /diagnosis-categories\.test\.mjs/);
});
