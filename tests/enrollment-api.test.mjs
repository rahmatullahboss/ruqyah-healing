import test from 'node:test';
import assert from 'node:assert/strict';

// Enrollment API tests — user enrollment + admin approve/revoke.
// Routes import 'cloudflare:workers' which is unavailable in Node,
// so tests skip gracefully when the module can't be loaded.

function isCloudflareDepError(err) {
  return err?.code === 'ERR_UNSUPPORTED_ESM_URL_SCHEME'
    || (err?.code === 'ERR_MODULE_NOT_FOUND' && /cloudflare:workers/.test(err?.message || ''));
}

async function tryImport(specifier) {
  try {
    return await import(specifier);
  } catch (err) {
    if (isCloudflareDepError(err)) return null;
    throw err;
  }
}

// --- User Enrollment ---

test('enrollment: enroll exports POST', async () => {
  const mod = await tryImport('../src/pages/api/courses/enroll.ts');
  if (!mod) return;
  assert.equal(typeof mod.POST, 'function');
});

test('enrollment: enroll rejects unauthenticated user', async () => {
  const mod = await tryImport('../src/pages/api/courses/enroll.ts');
  if (!mod) return;
  const request = new Request('http://localhost/api/courses/enroll', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ courseId: 'course-1' }),
  });
  const response = await mod.POST({ request, locals: {} });
  assert.equal(response.status, 401);
  const data = await response.json();
  assert.equal(data.error, 'Unauthorized');
});

test('enrollment: enroll rejects invalid body', async () => {
  const mod = await tryImport('../src/pages/api/courses/enroll.ts');
  if (!mod) return;
  const request = new Request('http://localhost/api/courses/enroll', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}), // missing courseId
  });
  const response = await mod.POST({
    request,
    locals: { user: { id: 'user-1', role: 'patient' } },
  });
  assert.equal(response.status, 400);
});

test('enrollment: enroll rejects empty courseId', async () => {
  const mod = await tryImport('../src/pages/api/courses/enroll.ts');
  if (!mod) return;
  const request = new Request('http://localhost/api/courses/enroll', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ courseId: '' }),
  });
  const response = await mod.POST({
    request,
    locals: { user: { id: 'user-1', role: 'patient' } },
  });
  assert.equal(response.status, 400);
});

// --- Admin Enrollment Approve ---

test('enrollment: approve exports POST', async () => {
  const mod = await tryImport('../src/pages/api/admin/enrollments/approve.ts');
  if (!mod) return;
  assert.equal(typeof mod.POST, 'function');
});

test('enrollment: approve rejects unauthenticated', async () => {
  const mod = await tryImport('../src/pages/api/admin/enrollments/approve.ts');
  if (!mod) return;
  const request = new Request('http://localhost/api/admin/enrollments/approve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: 'enr-1' }),
  });
  const response = await mod.POST({ request, locals: {} });
  assert.equal(response.status, 401);
});

test('enrollment: approve rejects non-admin', async () => {
  const mod = await tryImport('../src/pages/api/admin/enrollments/approve.ts');
  if (!mod) return;
  const request = new Request('http://localhost/api/admin/enrollments/approve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: 'enr-1' }),
  });
  const response = await mod.POST({
    request,
    locals: { user: { id: 'user-1', role: 'patient' } },
  });
  assert.equal(response.status, 401);
});

test('enrollment: approve rejects missing id', async () => {
  const mod = await tryImport('../src/pages/api/admin/enrollments/approve.ts');
  if (!mod) return;
  const request = new Request('http://localhost/api/admin/enrollments/approve', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  const response = await mod.POST({
    request,
    locals: { user: { id: 'admin-1', role: 'admin' } },
  });
  assert.equal(response.status, 400);
});

// --- Admin Enrollment Revoke ---

test('enrollment: revoke exports POST', async () => {
  const mod = await tryImport('../src/pages/api/admin/enrollments/revoke.ts');
  if (!mod) return;
  assert.equal(typeof mod.POST, 'function');
});

test('enrollment: revoke rejects unauthenticated', async () => {
  const mod = await tryImport('../src/pages/api/admin/enrollments/revoke.ts');
  if (!mod) return;
  const request = new Request('http://localhost/api/admin/enrollments/revoke', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: 'enr-1' }),
  });
  const response = await mod.POST({ request, locals: {} });
  assert.equal(response.status, 403); // uses 403 for unauthorized
});

test('enrollment: revoke rejects non-admin', async () => {
  const mod = await tryImport('../src/pages/api/admin/enrollments/revoke.ts');
  if (!mod) return;
  const request = new Request('http://localhost/api/admin/enrollments/revoke', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: 'enr-1' }),
  });
  const response = await mod.POST({
    request,
    locals: { user: { id: 'user-1', role: 'patient' } },
  });
  assert.equal(response.status, 403);
});

test('enrollment: revoke rejects missing id', async () => {
  const mod = await tryImport('../src/pages/api/admin/enrollments/revoke.ts');
  if (!mod) return;
  const request = new Request('http://localhost/api/admin/enrollments/revoke', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  const response = await mod.POST({
    request,
    locals: { user: { id: 'admin-1', role: 'admin' } },
  });
  assert.equal(response.status, 400);
});

// --- Admin Enrollment Create (Manual) ---

test('enrollment: admin create exports POST', async () => {
  const mod = await tryImport('../src/pages/api/admin/enrollments/create.ts');
  if (!mod) return;
  assert.equal(typeof mod.POST, 'function');
});

test('enrollment: admin create rejects non-admin', async () => {
  const mod = await tryImport('../src/pages/api/admin/enrollments/create.ts');
  if (!mod) return;
  const request = new Request('http://localhost/api/admin/enrollments/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: 'u1', courseId: 'c1' }),
  });
  const response = await mod.POST({
    request,
    locals: { user: { id: 'user-1', role: 'patient' } },
  });
  assert.equal(response.status, 403);
});

test('enrollment: admin create rejects invalid body', async () => {
  const mod = await tryImport('../src/pages/api/admin/enrollments/create.ts');
  if (!mod) return;
  const request = new Request('http://localhost/api/admin/enrollments/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  const response = await mod.POST({
    request,
    locals: { user: { id: 'admin-1', role: 'admin' } },
  });
  assert.equal(response.status, 400);
});
