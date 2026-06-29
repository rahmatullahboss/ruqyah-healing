import test from 'node:test';
import assert from 'node:assert/strict';
import { getClientIp, RATE_LIMITS } from '../src/lib/rate-limit.js';

// --- getClientIp ---

test('getClientIp returns CF-Connecting-IP when present', () => {
  const request = new Request('https://example.com', {
    headers: { 'CF-Connecting-IP': '203.0.113.1' },
  });
  assert.equal(getClientIp(request), '203.0.113.1');
});

test('getClientIp falls back to X-Forwarded-For first value', () => {
  const request = new Request('https://example.com', {
    headers: { 'X-Forwarded-For': '198.51.100.1, 198.51.100.2' },
  });
  assert.equal(getClientIp(request), '198.51.100.1');
});

test('getClientIp trims whitespace from X-Forwarded-For', () => {
  const request = new Request('https://example.com', {
    headers: { 'X-Forwarded-For': '  198.51.100.1  , 198.51.100.2' },
  });
  assert.equal(getClientIp(request), '198.51.100.1');
});

test('getClientIp prefers CF-Connecting-IP over X-Forwarded-For', () => {
  const request = new Request('https://example.com', {
    headers: {
      'CF-Connecting-IP': '203.0.113.1',
      'X-Forwarded-For': '198.51.100.1',
    },
  });
  assert.equal(getClientIp(request), '203.0.113.1');
});

test('getClientIp returns "unknown" when no headers present', () => {
  const request = new Request('https://example.com');
  assert.equal(getClientIp(request), 'unknown');
});

// --- RATE_LIMITS ---

test('RATE_LIMITS has auth config', () => {
  assert.equal(RATE_LIMITS.auth.maxRequests, 5);
  assert.equal(RATE_LIMITS.auth.windowMs, 15 * 60 * 1000);
});

test('RATE_LIMITS has chat config', () => {
  assert.equal(RATE_LIMITS.chat.maxRequests, 20);
  assert.equal(RATE_LIMITS.chat.windowMs, 60 * 1000);
});

test('RATE_LIMITS has appointment config', () => {
  assert.equal(RATE_LIMITS.appointment.maxRequests, 3);
  assert.equal(RATE_LIMITS.appointment.windowMs, 10 * 60 * 1000);
});

test('RATE_LIMITS has admin config', () => {
  assert.equal(RATE_LIMITS.admin.maxRequests, 30);
  assert.equal(RATE_LIMITS.admin.windowMs, 60 * 1000);
});

test('RATE_LIMITS has lms config', () => {
  assert.equal(RATE_LIMITS.lms.maxRequests, 20);
  assert.equal(RATE_LIMITS.lms.windowMs, 60 * 1000);
});

test('RATE_LIMITS has all expected keys', () => {
  assert.deepEqual(Object.keys(RATE_LIMITS).sort(), ['admin', 'appointment', 'auth', 'chat', 'lms']);
});
