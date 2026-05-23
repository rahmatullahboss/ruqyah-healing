import test from 'node:test';
import assert from 'node:assert/strict';

import { createHash } from 'node:crypto';

import { hashPassword, verifyPassword, needsPasswordRehash } from '../src/lib/auth.js';

test('hashPassword produces salt:hash format', async () => {
  const hash = await hashPassword('test-password-123');
  assert.match(hash, /^[a-f0-9]+:[a-f0-9]+$/);
  const [salt, key] = hash.split(':');
  assert.equal(salt.length, 32); // 16 bytes = 32 hex chars
  assert.equal(key.length, 64);  // 32 bytes = 64 hex chars
});

test('hashPassword generates unique salt per call', async () => {
  const hash1 = await hashPassword('same-password');
  const hash2 = await hashPassword('same-password');
  assert.notEqual(hash1, hash2);
});

test('verifyPassword returns true for correct password', async () => {
  const hash = await hashPassword('my-secure-password');
  const result = await verifyPassword('my-secure-password', hash);
  assert.equal(result, true);
});

test('verifyPassword returns false for wrong password', async () => {
  const hash = await hashPassword('my-secure-password');
  const result = await verifyPassword('wrong-password', hash);
  assert.equal(result, false);
});

test('verifyPassword returns false for null/undefined hash', async () => {
  assert.equal(await verifyPassword('test', null), false);
  assert.equal(await verifyPassword('test', undefined), false);
  assert.equal(await verifyPassword('test', ''), false);
});

test('verifyPassword returns false for malformed hash (no colon)', async () => {
  assert.equal(await verifyPassword('test', 'nocolonhere'), false);
});

test('verifyPassword returns true for legacy plaintext password', async () => {
  const result = await verifyPassword('legacy-password', 'legacy-password');
  assert.equal(result, true);
});

test('verifyPassword returns true for legacy sha256 hex password', async () => {
  const legacyHash = createHash('sha256').update('legacy-password').digest('hex');
  const result = await verifyPassword('legacy-password', legacyHash);
  assert.equal(result, true);
});

test('needsPasswordRehash returns true for legacy password formats', () => {
  const sha256Hash = createHash('sha256').update('legacy-password').digest('hex');
  assert.equal(needsPasswordRehash('legacy-password'), true);
  assert.equal(needsPasswordRehash(sha256Hash), true);
  assert.equal(needsPasswordRehash('ab'.repeat(16) + ':' + 'cd'.repeat(32)), false);
});

test('getSecretKey throws when JWT_SECRET is missing', async () => {
  // Import createSession which internally calls getSecretKey
  const { createSession } = await import('../src/lib/auth.js');
  await assert.rejects(
    () => createSession('user-123', {}),
    { message: /JWT_SECRET environment variable is required/ }
  );
});

test('getSecretKey throws when env is null/undefined', async () => {
  const { createSession } = await import('../src/lib/auth.js');
  await assert.rejects(
    () => createSession('user-123', null),
    { message: /JWT_SECRET/ }
  );
});

test('createSession + verifySession round trip', async () => {
  const { createSession, verifySession } = await import('../src/lib/auth.js');
  const env = { JWT_SECRET: 'test-secret-key-at-least-16-chars' };
  const token = await createSession('user-42', env);

  assert.equal(typeof token, 'string');
  assert.ok(token.length > 20);

  const userId = await verifySession(token, env);
  assert.equal(userId, 'user-42');
});

test('verifySession returns null for invalid token', async () => {
  const { verifySession } = await import('../src/lib/auth.js');
  const env = { JWT_SECRET: 'test-secret-key-at-least-16-chars' };
  const result = await verifySession('invalid.token.here', env);
  assert.equal(result, null);
});

test('verifySession returns null for token signed with different secret', async () => {
  const { createSession, verifySession } = await import('../src/lib/auth.js');
  const token = await createSession('user-42', { JWT_SECRET: 'secret-one-at-least-16-chars-long' });
  const result = await verifySession(token, { JWT_SECRET: 'secret-two-at-least-16-chars-long' });
  assert.equal(result, null);
});
