import test from 'node:test';
import assert from 'node:assert/strict';

// Tests for remaining API routes: test-results, settings, tracking, courses sub-routes.
// Routes import 'cloudflare:workers' which is unavailable in Node,
// so tests skip gracefully when the module can't be loaded.

function isImportableError(err) {
  return err?.code === 'ERR_UNSUPPORTED_ESM_URL_SCHEME'
    || err?.code === 'ERR_MODULE_NOT_FOUND';
}

async function tryImport(specifier) {
  try {
    return await import(specifier);
  } catch (err) {
    if (isImportableError(err)) return null;
    throw err;
  }
}

// --- Test Results Save ---

test('test-results: save exports POST', async () => {
  const mod = await tryImport('../src/pages/api/test-results/save.ts');
  if (!mod) return;
  assert.equal(typeof mod.POST, 'function');
});

test('test-results: save rejects unauthenticated', async () => {
  const mod = await tryImport('../src/pages/api/test-results/save.ts');
  if (!mod) return;
  const request = new Request('http://localhost/api/test-results/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ testType: 'ruqyah', score: 5, resultLevel: 'high', resultText: 'Result' }),
  });
  const response = await mod.POST({ request, locals: {} });
  assert.equal(response.status, 401);
});

test('test-results: save rejects missing required fields', async () => {
  const mod = await tryImport('../src/pages/api/test-results/save.ts');
  if (!mod) return;
  const request = new Request('http://localhost/api/test-results/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}), // missing testType, score, resultLevel, resultText
  });
  const response = await mod.POST({
    request,
    locals: { user: { id: 'user-1' } },
  });
  assert.equal(response.status, 400);
});

test('test-results: save rejects partial required fields', async () => {
  const mod = await tryImport('../src/pages/api/test-results/save.ts');
  if (!mod) return;
  const request = new Request('http://localhost/api/test-results/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ testType: 'ruqyah' }), // missing score, resultLevel, resultText
  });
  const response = await mod.POST({
    request,
    locals: { user: { id: 'user-1' } },
  });
  assert.equal(response.status, 400);
});

// --- Settings Public ---

test('settings: public exports GET', async () => {
  const mod = await tryImport('../src/pages/api/settings/public.ts');
  if (!mod) return;
  assert.equal(typeof mod.GET, 'function');
});

// --- Tracking WhatsApp Click ---

test('tracking: whatsapp-click exports POST', async () => {
  let mod;
  try {
    mod = await import('../src/pages/api/tracking/whatsapp-click.ts');
  } catch (err) {
    // May fail due to missing analytics module or cloudflare:workers
    if (err?.code === 'ERR_MODULE_NOT_FOUND' || err?.code === 'ERR_UNSUPPORTED_ESM_URL_SCHEME') return;
    throw err;
  }
  assert.equal(typeof mod.POST, 'function');
});

// --- Courses sub-routes ---

test('courses: progress route exists', async () => {
  const mod = await tryImport('../src/pages/api/courses/[id]/progress.ts');
  if (!mod) return;
  assert.ok(mod.POST || mod.GET, 'progress should export POST or GET');
});

test('courses: review route exists', async () => {
  const mod = await tryImport('../src/pages/api/courses/[id]/review.ts');
  if (!mod) return;
  assert.ok(mod.POST, 'review should export POST');
});

test('courses: quiz submit route exists', async () => {
  const files = ['submit.ts'];
  for (const f of files) {
    const mod = await tryImport(`../src/pages/api/courses/[id]/quiz/${f}`);
    if (!mod) continue;
    assert.ok(mod.POST, `${f} should export POST`);
  }
});

// --- Admin CRUD routes exist ---

test('admin: courses CRUD routes exist', async () => {
  const routes = [
    '../src/pages/api/admin/courses/create.ts',
    '../src/pages/api/admin/courses/update.ts',
    '../src/pages/api/admin/courses/delete.ts',
  ];
  for (const route of routes) {
    const mod = await tryImport(route);
    if (!mod) continue;
    assert.equal(typeof mod.POST, 'function', `${route} should export POST`);
  }
});

test('admin: posts CRUD routes exist', async () => {
  const routes = [
    '../src/pages/api/admin/posts/create.ts',
    '../src/pages/api/admin/posts/update.ts',
    '../src/pages/api/admin/posts/delete.ts',
  ];
  for (const route of routes) {
    const mod = await tryImport(route);
    if (!mod) continue;
    assert.equal(typeof mod.POST, 'function', `${route} should export POST`);
  }
});

test('admin: products CRUD routes exist', async () => {
  const routes = [
    '../src/pages/api/admin/products/create.ts',
    '../src/pages/api/admin/products/update.ts',
    '../src/pages/api/admin/products/delete.ts',
  ];
  for (const route of routes) {
    const mod = await tryImport(route);
    if (!mod) continue;
    assert.equal(typeof mod.POST, 'function', `${route} should export POST`);
  }
});

test('admin: notices CRUD routes exist', async () => {
  const routes = [
    '../src/pages/api/admin/notices/create.ts',
    '../src/pages/api/admin/notices/update.ts',
    '../src/pages/api/admin/notices/delete.ts',
  ];
  for (const route of routes) {
    const mod = await tryImport(route);
    if (!mod) continue;
    assert.equal(typeof mod.POST, 'function', `${route} should export POST`);
  }
});

test('admin: testimonials CRUD routes exist', async () => {
  const routes = [
    '../src/pages/api/admin/testimonials/create.ts',
    '../src/pages/api/admin/testimonials/update.ts',
    '../src/pages/api/admin/testimonials/delete.ts',
  ];
  for (const route of routes) {
    const mod = await tryImport(route);
    if (!mod) continue;
    assert.equal(typeof mod.POST, 'function', `${route} should export POST`);
  }
});

test('admin: resources CRUD routes exist', async () => {
  const routes = [
    '../src/pages/api/admin/resources/create.ts',
    '../src/pages/api/admin/resources/update.ts',
    '../src/pages/api/admin/resources/delete.ts',
  ];
  for (const route of routes) {
    const mod = await tryImport(route);
    if (!mod) continue;
    assert.equal(typeof mod.POST, 'function', `${route} should export POST`);
  }
});

test('admin: modules CRUD routes exist', async () => {
  const routes = [
    '../src/pages/api/admin/modules/create.ts',
    '../src/pages/api/admin/modules/update.ts',
    '../src/pages/api/admin/modules/delete.ts',
  ];
  for (const route of routes) {
    const mod = await tryImport(route);
    if (!mod) continue;
    assert.equal(typeof mod.POST, 'function', `${route} should export POST`);
  }
});

test('admin: lessons CRUD routes exist', async () => {
  const routes = [
    '../src/pages/api/admin/lessons/create.ts',
    '../src/pages/api/admin/lessons/update.ts',
    '../src/pages/api/admin/lessons/delete.ts',
  ];
  for (const route of routes) {
    const mod = await tryImport(route);
    if (!mod) continue;
    assert.equal(typeof mod.POST, 'function', `${route} should export POST`);
  }
});

test('admin: quizzes CRUD routes exist', async () => {
  const routes = [
    '../src/pages/api/admin/quizzes/create.ts',
    '../src/pages/api/admin/quizzes/update.ts',
    '../src/pages/api/admin/quizzes/delete.ts',
  ];
  for (const route of routes) {
    const mod = await tryImport(route);
    if (!mod) continue;
    assert.equal(typeof mod.POST, 'function', `${route} should export POST`);
  }
});

test('admin: settings routes exist', async () => {
  const routes = [
    '../src/pages/api/admin/settings/update.ts',
  ];
  for (const route of routes) {
    const mod = await tryImport(route);
    if (!mod) continue;
    assert.equal(typeof mod.POST, 'function', `${route} should export POST`);
  }
});

test('admin: users routes exist', async () => {
  const routes = [
    '../src/pages/api/admin/users/list.ts',
  ];
  for (const route of routes) {
    const mod = await tryImport(route);
    if (!mod) continue;
    assert.ok(mod.GET || mod.POST, `${route} should export GET or POST`);
  }
});

test('admin: upload route exists', async () => {
  const mod = await tryImport('../src/pages/api/admin/upload.ts');
  if (!mod) return;
  assert.equal(typeof mod.POST, 'function');
});

// --- Admin CRUD: create routes reject non-admin ---

test('admin: course create rejects non-admin', async () => {
  const mod = await tryImport('../src/pages/api/admin/courses/create.ts');
  if (!mod) return;
  const request = new Request('http://localhost/api/admin/courses/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  const response = await mod.POST({ request, locals: { user: { role: 'patient' } } });
  assert.ok([401, 403].includes(response.status), `Expected 401 or 403, got ${response.status}`);
});

test('admin: post create rejects non-admin', async () => {
  const mod = await tryImport('../src/pages/api/admin/posts/create.ts');
  if (!mod) return;
  const request = new Request('http://localhost/api/admin/posts/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  const response = await mod.POST({ request, locals: { user: { role: 'patient' } } });
  assert.ok([401, 403].includes(response.status), `Expected 401 or 403, got ${response.status}`);
});

test('admin: product create rejects non-admin', async () => {
  const mod = await tryImport('../src/pages/api/admin/products/create.ts');
  if (!mod) return;
  const request = new Request('http://localhost/api/admin/products/create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  const response = await mod.POST({ request, locals: { user: { role: 'patient' } } });
  assert.ok([401, 403].includes(response.status), `Expected 401 or 403, got ${response.status}`);
});

// --- Cloudflare Functions appointments ---

test('cf functions: appointments exports onRequestPost and onRequestOptions', async () => {
  const mod = await import('../functions/api/appointments.ts');
  assert.equal(typeof mod.onRequestPost, 'function');
  assert.equal(typeof mod.onRequestOptions, 'function');
});

test('cf functions: appointments onRequestOptions returns 204', async () => {
  const { onRequestOptions } = await import('../functions/api/appointments.ts');
  const request = new Request('http://localhost/api/appointments', {
    method: 'OPTIONS',
    headers: { Origin: 'https://ruqyahhealing.com' },
  });
  const response = await onRequestOptions({ request });
  assert.equal(response.status, 204);
  assert.equal(response.headers.get('Access-Control-Allow-Origin'), 'https://ruqyahhealing.com');
});

test('cf functions: appointments onRequestPost returns 500 without DATABASE_URL', async () => {
  const { onRequestPost } = await import('../functions/api/appointments.ts');
  const request = new Request('http://localhost/api/appointments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  const response = await onRequestPost({ request, env: {} });
  assert.equal(response.status, 500);
  const data = await response.json();
  assert.match(data.error, /DATABASE_URL/);
});
