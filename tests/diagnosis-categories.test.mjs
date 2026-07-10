import test from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = process.env.TEST_URL || 'http://localhost:4321';

test('Ruqyah Diagnosis Categories', async (t) => {
  const categories = ['evil-eye', 'magic', 'jinn', 'waswasa', 'kids'];
  
  for (const cat of categories) {
    await t.test(`Category ${cat} loads correctly`, async () => {
      const res = await fetch(`${BASE_URL}/ruqyah-diagnosis/${cat}`);
      assert.equal(res.status, 200, `Category ${cat} returned ${res.status}`);
      const text = await res.text();
      assert.match(text, /<main/i, 'Response should contain main content');
    });
  }
});
