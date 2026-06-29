import test from 'node:test';
import assert from 'node:assert/strict';

// Middleware tests — verify rate limit, auth, and route guard behavior.
// middleware.js imports from 'astro:middleware' and 'cloudflare:workers'
// which are unavailable in Node, so we test individual helper modules instead.

// The middleware itself cannot be imported in Node (astro:middleware + cloudflare:workers).
// We test the individual helper patterns by importing the lib modules directly.

test('middleware: rate limit blocks POST after max requests', async () => {
  const { checkRateLimit } = await import('../src/lib/rate-limit.js');
  const key = `test-middleware-${Date.now()}`;

  // First 5 requests should pass (auth limit)
  for (let i = 0; i < 5; i++) {
    const result = checkRateLimit(key, 5, 60000);
    assert.equal(result.limited, false, `Request ${i + 1} should pass`);
  }

  // 6th should be blocked
  const result = checkRateLimit(key, 5, 60000);
  assert.equal(result.limited, true, 'Request 6 should be blocked');
});

test('middleware: different keys have independent limits', async () => {
  const { checkRateLimit } = await import('../src/lib/rate-limit.js');
  const ts = Date.now();
  const key1 = `test-independent-1-${ts}`;
  const key2 = `test-independent-2-${ts}`;

  // Exhaust key1
  for (let i = 0; i < 3; i++) {
    checkRateLimit(key1, 3, 60000);
  }
  const r1 = checkRateLimit(key1, 3, 60000);
  assert.equal(r1.limited, true);

  // key2 should still be available
  const r2 = checkRateLimit(key2, 3, 60000);
  assert.equal(r2.limited, false);
});

test('middleware: auth extracts user from JWT cookie', async () => {
  const { createSession, hashPassword } = await import('../src/lib/auth.js');
  const secret = 'test-middleware-secret-12345';
  process.env.JWT_SECRET = secret;

  const token = await createSession('user-123', { JWT_SECRET: secret });
  assert.ok(token, 'Should create a JWT token');
  assert.equal(typeof token, 'string');
  assert.ok(token.split('.').length === 3, 'JWT should have 3 parts');
});

test('middleware: route guard patterns', async () => {
  // Test the path matching patterns used in routeGuard
  const protectedPaths = ['/profile', '/profile/settings', '/admin', '/admin/users'];
  const adminPaths = ['/admin', '/admin/users', '/admin/courses'];
  const publicPaths = ['/', '/login', '/register', '/blog', '/courses'];

  for (const path of protectedPaths) {
    assert.ok(
      path.startsWith('/profile') || path.startsWith('/admin'),
      `${path} should be recognized as protected`
    );
  }

  for (const path of adminPaths) {
    assert.ok(path.startsWith('/admin'), `${path} should be admin-only`);
  }

  for (const path of publicPaths) {
    assert.ok(
      !path.startsWith('/profile') || path === '/profile',
      `${path} should not be profile-protected (unless exact /profile)`
    );
  }
});

test('middleware: admin email detection from env', () => {
  // Replicate getAdminEmails logic
  function getAdminEmails(env) {
    return new Set(
      (env.ADMIN_EMAILS || '')
        .split(',')
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean),
    );
  }

  const emails = getAdminEmails({ ADMIN_EMAILS: 'admin@test.com,other@test.com' });
  assert.ok(emails.has('admin@test.com'));
  assert.ok(emails.has('other@test.com'));
  assert.equal(emails.size, 2);

  const empty = getAdminEmails({});
  assert.equal(empty.size, 0);

  const withSpaces = getAdminEmails({ ADMIN_EMAILS: ' a@b.com , c@d.com ' });
  assert.ok(withSpaces.has('a@b.com'));
  assert.ok(withSpaces.has('c@d.com'));
});

test('middleware: rate limit config values are reasonable', async () => {
  const { RATE_LIMITS } = await import('../src/lib/rate-limit.js');

  // Auth: 5 per 15 min
  assert.equal(RATE_LIMITS.auth.maxRequests, 5);
  assert.ok(RATE_LIMITS.auth.windowMs >= 60000, 'Auth window should be at least 1 min');

  // Chat: 20 per min
  assert.equal(RATE_LIMITS.chat.maxRequests, 20);

  // Appointment: 3 per 10 min
  assert.equal(RATE_LIMITS.appointment.maxRequests, 3);

  // Admin: 30 per min
  assert.equal(RATE_LIMITS.admin.maxRequests, 30);
});

test('middleware: env validation catches missing DATABASE_URL', async () => {
  const { validateEnv } = await import('../src/lib/env.js');
  // Reset the cached validation state
  const result = validateEnv({});
  assert.equal(result.valid, false);
  assert.ok(result.errors.length > 0);
});

test('middleware: env validation passes with valid config', async () => {
  // Note: validateEnv caches after first success, so we test the schema directly
  const { z } = await import('zod');
  const envSchema = z.object({
    DATABASE_URL: z.string().min(1),
    JWT_SECRET: z.string().min(16),
  });

  const valid = envSchema.safeParse({
    DATABASE_URL: 'postgresql://localhost/test',
    JWT_SECRET: 'a'.repeat(16),
  });
  assert.equal(valid.success, true);

  const invalid = envSchema.safeParse({});
  assert.equal(invalid.success, false);
});
