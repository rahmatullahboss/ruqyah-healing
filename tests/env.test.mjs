import test from 'node:test';
import assert from 'node:assert/strict';

import { validateEnv } from '../src/lib/env.js';

// Note: validateEnv caches after first success, so we test error cases
// using a fresh import or by testing before any valid call.

test('validateEnv returns errors for empty env', () => {
  // We need to test the schema directly since validateEnv caches
  // Import Zod schema behavior through the function
  const result = validateEnv({});
  assert.equal(result.valid, false);
  assert.ok(result.errors.length > 0);
  assert.ok(result.errors.some(e => e.includes('DATABASE_URL')));
});

test('validateEnv returns error for missing JWT_SECRET', () => {
  const result = validateEnv({ DATABASE_URL: 'postgresql://test' });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(e => e.includes('JWT_SECRET')));
});

test('validateEnv returns error for short JWT_SECRET', () => {
  const result = validateEnv({ DATABASE_URL: 'postgresql://test', JWT_SECRET: 'short' });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some(e => e.includes('JWT_SECRET')));
});

test('validateEnv passes with valid env', () => {
  const result = validateEnv({
    DATABASE_URL: 'postgresql://test',
    JWT_SECRET: 'a-very-long-secret-key-for-jwt',
  });
  assert.equal(result.valid, true);
});
