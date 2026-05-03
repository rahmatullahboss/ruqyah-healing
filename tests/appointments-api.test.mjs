import test from 'node:test';
import assert from 'node:assert/strict';

test('appointments API route exports a POST handler', async () => {
  const module = await import('../src/pages/api/appointments.ts');

  assert.equal(typeof module.POST, 'function');
  assert.equal(typeof module.OPTIONS, 'function');
});

test('appointments API route returns configuration error when database URL is missing', async () => {
  const module = await import('../src/pages/api/appointments.ts');
  const request = new Request('http://localhost:4321/api/appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });

  const response = await module.POST({ request, locals: {} });
  const payload = await response.json();

  assert.equal(response.status, 500);
  assert.equal(payload.error, 'DATABASE_URL not configured');
});
