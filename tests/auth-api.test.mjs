import test from 'node:test';
import assert from 'node:assert/strict';

// These tests verify the auth API route exports and error handling.
// They use dynamic imports and mock the DB at the process.env level.
// Routes that import 'cloudflare:workers' cannot be loaded in Node,
// so those tests are skipped gracefully.

const ENV_BACKUP = { ...process.env };

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

test('auth routes: setup', () => {
  process.env.DATABASE_URL = 'postgresql://test:test@localhost/test';
  process.env.JWT_SECRET = 'test-secret-key-min-16-chars';
});

// --- Login ---

test('login: POST is exported as a function', async () => {
  const mod = await tryImport('../src/pages/api/auth/login.ts');
  if (!mod) return; // cloudflare:workers unavailable in Node
  assert.equal(typeof mod.POST, 'function');
});

test('login: returns 400 for missing credentials', async () => {
  const mod = await tryImport('../src/pages/api/auth/login.ts');
  if (!mod) return;
  const request = new Request('http://localhost/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  const response = await mod.POST({
    request,
    locals: {},
    cookies: { set: () => {}, get: () => undefined },
  });
  assert.equal(response.status, 400);
  const data = await response.json();
  assert.match(data.error, /credentials/i);
});

test('login: returns 400 for missing password', async () => {
  const mod = await tryImport('../src/pages/api/auth/login.ts');
  if (!mod) return;
  const request = new Request('http://localhost/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'user@test.com' }),
  });
  const response = await mod.POST({
    request,
    locals: {},
    cookies: { set: () => {}, get: () => undefined },
  });
  assert.equal(response.status, 400);
});

// --- Register ---

test('register: POST is exported as a function', async () => {
  const mod = await tryImport('../src/pages/api/auth/register.ts');
  if (!mod) return;
  assert.equal(typeof mod.POST, 'function');
});

test('register: returns 400 for empty body', async () => {
  const mod = await tryImport('../src/pages/api/auth/register.ts');
  if (!mod) return;
  const request = new Request('http://localhost/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  const response = await mod.POST({
    request,
    locals: {},
    cookies: { set: () => {}, get: () => undefined },
  });
  assert.equal(response.status, 400);
  const data = await response.json();
  assert.ok(data.error);
});

test('register: returns 400 for short name', async () => {
  const mod = await tryImport('../src/pages/api/auth/register.ts');
  if (!mod) return;
  const request = new Request('http://localhost/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullName: 'A', email: 'test@test.com', password: '12345678' }),
  });
  const response = await mod.POST({
    request,
    locals: {},
    cookies: { set: () => {}, get: () => undefined },
  });
  assert.equal(response.status, 400);
});

test('register: returns 400 for short password', async () => {
  const mod = await tryImport('../src/pages/api/auth/register.ts');
  if (!mod) return;
  const request = new Request('http://localhost/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullName: 'Test User', email: 'test@test.com', password: '123' }),
  });
  const response = await mod.POST({
    request,
    locals: {},
    cookies: { set: () => {}, get: () => undefined },
  });
  assert.equal(response.status, 400);
});

test('register: returns 400 for invalid email', async () => {
  const mod = await tryImport('../src/pages/api/auth/register.ts');
  if (!mod) return;
  const request = new Request('http://localhost/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullName: 'Test User', email: 'not-an-email', password: '12345678' }),
  });
  const response = await mod.POST({
    request,
    locals: {},
    cookies: { set: () => {}, get: () => undefined },
  });
  assert.equal(response.status, 400);
});

test('register: returns 400 for invalid phone format', async () => {
  const mod = await tryImport('../src/pages/api/auth/register.ts');
  if (!mod) return;
  const request = new Request('http://localhost/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullName: 'Test User', phone: '123', password: '12345678' }),
  });
  const response = await mod.POST({
    request,
    locals: {},
    cookies: { set: () => {}, get: () => undefined },
  });
  assert.equal(response.status, 400);
});

// --- Logout ---

test('logout: GET and POST are exported', async () => {
  const mod = await import('../src/pages/api/auth/logout.ts');
  assert.equal(typeof mod.GET, 'function');
  assert.equal(typeof mod.POST, 'function');
});

test('logout: POST returns success JSON', async () => {
  const { POST } = await import('../src/pages/api/auth/logout.ts');
  let deletedCookie = false;
  const response = await POST({
    cookies: {
      delete: () => { deletedCookie = true; },
      set: () => {},
      get: () => undefined,
    },
  });
  assert.equal(response.status, 200);
  const data = await response.json();
  assert.equal(data.success, true);
  assert.equal(data.redirect, '/login');
  assert.equal(deletedCookie, true);
});

test('logout: GET redirects to /login', async () => {
  const { GET } = await import('../src/pages/api/auth/logout.ts');
  let deletedCookie = false;
  const response = await GET({
    cookies: {
      delete: () => { deletedCookie = true; },
      set: () => {},
      get: () => undefined,
    },
    redirect: (path) => new Response(null, { status: 302, headers: { Location: path } }),
  });
  assert.equal(response.status, 302);
  assert.equal(response.headers.get('Location'), '/login');
  assert.equal(deletedCookie, true);
});

// --- Forgot Password ---

test('forgot-password: POST is exported', async () => {
  const mod = await tryImport('../src/pages/api/auth/forgot-password.ts');
  if (!mod) return;
  assert.equal(typeof mod.POST, 'function');
});

test('forgot-password: returns 500 when RESEND_API_KEY missing', async () => {
  const mod = await tryImport('../src/pages/api/auth/forgot-password.ts');
  if (!mod) return;
  const origKey = process.env.RESEND_API_KEY;
  delete process.env.RESEND_API_KEY;

  const request = new Request('http://localhost/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@test.com' }),
  });
  const response = await mod.POST({ request, url: new URL('http://localhost') });
  assert.equal(response.status, 500);

  if (origKey) process.env.RESEND_API_KEY = origKey;
});

test('forgot-password: returns 400 for missing email', async () => {
  const mod = await tryImport('../src/pages/api/auth/forgot-password.ts');
  if (!mod) return;
  process.env.RESEND_API_KEY = 'test-key';

  const request = new Request('http://localhost/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  const response = await mod.POST({ request, url: new URL('http://localhost') });
  assert.equal(response.status, 400);
});

// --- Reset Password ---

test('reset-password: POST is exported', async () => {
  const mod = await tryImport('../src/pages/api/auth/reset-password.ts');
  if (!mod) return;
  assert.equal(typeof mod.POST, 'function');
});

test('reset-password: returns 400 for missing token', async () => {
  const mod = await tryImport('../src/pages/api/auth/reset-password.ts');
  if (!mod) return;
  const request = new Request('http://localhost/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password: '12345678' }),
  });
  const response = await mod.POST({ request });
  assert.equal(response.status, 400);
  const data = await response.json();
  assert.match(data.error, /token/i);
});

test('reset-password: returns 400 for short password', async () => {
  const mod = await tryImport('../src/pages/api/auth/reset-password.ts');
  if (!mod) return;
  const request = new Request('http://localhost/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: 'abc123', password: '123' }),
  });
  const response = await mod.POST({ request });
  assert.equal(response.status, 400);
  const data = await response.json();
  assert.match(data.error, /8 characters/);
});

// --- Edit Profile ---

test('edit-profile: POST is exported', async () => {
  const mod = await tryImport('../src/pages/api/auth/edit-profile.ts');
  if (!mod) return;
  assert.equal(typeof mod.POST, 'function');
});

test('edit-profile: returns 401 for unauthenticated user', async () => {
  const mod = await tryImport('../src/pages/api/auth/edit-profile.ts');
  if (!mod) return;
  const request = new Request('http://localhost/api/auth/edit-profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullName: 'New Name' }),
  });
  const response = await mod.POST({ request, locals: {} });
  assert.equal(response.status, 401);
});

test('edit-profile: returns 400 for invalid data', async () => {
  const mod = await tryImport('../src/pages/api/auth/edit-profile.ts');
  if (!mod) return;
  const request = new Request('http://localhost/api/auth/edit-profile', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullName: 'A' }), // too short
  });
  const response = await mod.POST({
    request,
    locals: { user: { id: 'user-1', role: 'patient' } },
  });
  assert.equal(response.status, 400);
});

// --- Google ---

test('google: POST is exported', async () => {
  const mod = await tryImport('../src/pages/api/auth/google.ts');
  if (!mod) return;
  assert.equal(typeof mod.POST, 'function');
});

test('google: returns 500 when GOOGLE_CLIENT_ID missing', async () => {
  const mod = await tryImport('../src/pages/api/auth/google.ts');
  if (!mod) return;
  const origId = process.env.GOOGLE_CLIENT_ID;
  delete process.env.GOOGLE_CLIENT_ID;

  const request = new Request('http://localhost/api/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken: 'test' }),
  });
  const response = await mod.POST({ request, cookies: { set: () => {} } });
  assert.equal(response.status, 500);

  if (origId) process.env.GOOGLE_CLIENT_ID = origId;
});

test('google: returns 400 for missing idToken', async () => {
  const mod = await tryImport('../src/pages/api/auth/google.ts');
  if (!mod) return;
  process.env.GOOGLE_CLIENT_ID = 'test-client-id';

  const request = new Request('http://localhost/api/auth/google', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  const response = await mod.POST({ request, cookies: { set: () => {} } });
  assert.equal(response.status, 400);
});

// --- Cleanup ---
test('auth routes: cleanup', () => {
  for (const key of Object.keys(process.env)) {
    if (!(key in ENV_BACKUP)) delete process.env[key];
  }
  Object.assign(process.env, ENV_BACKUP);
});
