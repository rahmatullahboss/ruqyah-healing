import test from 'node:test';
import assert from 'node:assert/strict';

// Allows targeting any URL via env, defaulting to local preview dev ports
const BASE_URL = process.env.TEST_URL || 'http://localhost:4321';

test('Smoke Test: System Check', async (t) => {
  console.log(`\n🔍 Running tests against: ${BASE_URL}\n`);

  // --- Public UI Routes ---
  const publicRoutes = [
    { name: 'Homepage loads correctly', path: '/' },
    { name: 'Courses page loads correctly', path: '/courses' },
    { name: 'Blog page loads correctly', path: '/blog' },
    { name: 'Appointment page loads correctly', path: '/appointment' },
    { name: 'Symptom Diagnosis page loads correctly', path: '/symptom-diagnosis' }
  ];

  for (const route of publicRoutes) {
    await t.test(route.name, async () => {
      try {
        const res = await fetch(`${BASE_URL}${route.path}`);
        assert.equal(res.status, 200, `Expected 200 OK at ${route.path} but got ${res.status}`);
        if (route.path === '/') {
          const text = await res.text();
          assert.match(text, /<html/i, 'Response should contain HTML tag');
        }
      } catch (e) {
        if (e.cause?.code === 'ECONNREFUSED') {
          assert.fail(`Connection refused. Is the server running at ${BASE_URL}? Start it via Astro CLI/Wrangler`);
        }
        throw e;
      }
    });
  }

  // --- Private / Admin UI Routes (Auth Validation) ---
  await t.test('Admin UI is protected from unauthenticated access', async () => {
    const res = await fetch(`${BASE_URL}/admin`, { redirect: 'manual' });
    // Should either redirect (3xx) to login OR return 401/403
    assert.ok(res.status >= 300 && res.status < 404, `Admin route returned unexpected status ${res.status}`);
  });

  await t.test('Profile UI is protected from unauthenticated access', async () => {
    const res = await fetch(`${BASE_URL}/profile`, { redirect: 'manual' });
    assert.ok(res.status === 302 || res.status === 401 || res.status === 403, `Profile route returned unexpected status ${res.status}`);
  });

  // --- API Endpoint Validations ---
  await t.test('Course Enrollment API validates unauthenticated users', async () => {
    const res = await fetch(`${BASE_URL}/api/courses/enroll`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ courseId: 'fake-course-id' })
    });
    const data = await res.json().catch(() => ({}));
    assert.ok([401, 403].includes(res.status), 'Unauthenticated users must receive 401 or 403');
    if (res.status === 401) {
      assert.equal(data.error, 'Unauthorized');
    }
  });

  await t.test('Enrollment Approval API validates unauthenticated admin requests', async () => {
    const res = await fetch(`${BASE_URL}/api/admin/enrollments/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: 'fake-enrollment-id' })
    });
    assert.ok([401, 403].includes(res.status), 'Unauthenticated/non-admin users must receive 401 or 403');
  });
});
