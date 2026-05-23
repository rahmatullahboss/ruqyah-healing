import test from 'node:test';
import assert from 'node:assert/strict';

import { checkRateLimit } from '../src/lib/rate-limit.js';

test('allows requests within the limit', () => {
  const key = 'test:allow:' + Date.now();
  const r1 = checkRateLimit(key, 3, 60000);
  assert.equal(r1.limited, false);
  assert.equal(r1.remaining, 2);

  const r2 = checkRateLimit(key, 3, 60000);
  assert.equal(r2.limited, false);
  assert.equal(r2.remaining, 1);

  const r3 = checkRateLimit(key, 3, 60000);
  assert.equal(r3.limited, false);
  assert.equal(r3.remaining, 0);
});

test('blocks requests exceeding the limit', () => {
  const key = 'test:block:' + Date.now();
  for (let i = 0; i < 5; i++) {
    checkRateLimit(key, 5, 60000);
  }

  const result = checkRateLimit(key, 5, 60000);
  assert.equal(result.limited, true);
  assert.equal(result.remaining, 0);
  assert.ok(result.resetIn > 0);
});

test('different keys are independent', () => {
  const key1 = 'test:keyA:' + Date.now();
  const key2 = 'test:keyB:' + Date.now();

  for (let i = 0; i < 5; i++) {
    checkRateLimit(key1, 5, 60000);
  }

  const r1 = checkRateLimit(key1, 5, 60000);
  assert.equal(r1.limited, true);

  const r2 = checkRateLimit(key2, 5, 60000);
  assert.equal(r2.limited, false);
  assert.equal(r2.remaining, 4);
});

test('resetIn returns positive value', () => {
  const key = 'test:resetIn:' + Date.now();
  const result = checkRateLimit(key, 10, 30000);
  assert.equal(result.resetIn, 30000);
});
