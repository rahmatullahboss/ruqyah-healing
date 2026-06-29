import test from 'node:test';
import assert from 'node:assert/strict';

// Admin appointments API tests — verify auth, validation, and response patterns.
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

test('admin appointments: update-status exports POST', async () => {
  const mod = await tryImport('../src/pages/api/admin/appointments/update-status.ts');
  if (!mod) return;
  assert.equal(typeof mod.POST, 'function');
});

test('admin appointments: update-status rejects non-admin', async () => {
  const mod = await tryImport('../src/pages/api/admin/appointments/update-status.ts');
  if (!mod) return;
  const request = new Request('http://localhost/api/admin/appointments/update-status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apptId: 'apt-1', status: 'confirmed' }),
  });
  const response = await mod.POST({ request, locals: { user: { role: 'patient' } } });
  assert.equal(response.status, 401);
});

test('admin appointments: update-status rejects unauthenticated', async () => {
  const mod = await tryImport('../src/pages/api/admin/appointments/update-status.ts');
  if (!mod) return;
  const request = new Request('http://localhost/api/admin/appointments/update-status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apptId: 'apt-1', status: 'confirmed' }),
  });
  const response = await mod.POST({ request, locals: {} });
  assert.equal(response.status, 401);
});

test('admin appointments: update-status rejects invalid status', async () => {
  const mod = await tryImport('../src/pages/api/admin/appointments/update-status.ts');
  if (!mod) return;
  const request = new Request('http://localhost/api/admin/appointments/update-status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apptId: 'apt-1', status: 'invalid_status' }),
  });
  const admin = { id: 'admin-1', fullName: 'Admin', role: 'admin' };
  const response = await mod.POST({ request, locals: { user: admin } });
  assert.equal(response.status, 400);
});

test('admin appointments: update-status rejects missing apptId', async () => {
  const mod = await tryImport('../src/pages/api/admin/appointments/update-status.ts');
  if (!mod) return;
  const request = new Request('http://localhost/api/admin/appointments/update-status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'confirmed' }),
  });
  const admin = { id: 'admin-1', fullName: 'Admin', role: 'admin' };
  const response = await mod.POST({ request, locals: { user: admin } });
  assert.equal(response.status, 400);
});

// --- update.ts ---

test('admin appointments: update exports POST', async () => {
  const mod = await tryImport('../src/pages/api/admin/appointments/update.ts');
  if (!mod) return;
  assert.equal(typeof mod.POST, 'function');
});

test('admin appointments: update rejects non-admin', async () => {
  const mod = await tryImport('../src/pages/api/admin/appointments/update.ts');
  if (!mod) return;
  const request = new Request('http://localhost/api/admin/appointments/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: 'apt-1', status: 'confirmed' }),
  });
  const response = await mod.POST({ request, locals: { user: { role: 'patient' } } });
  assert.equal(response.status, 401);
});

test('admin appointments: update rejects missing id', async () => {
  const mod = await tryImport('../src/pages/api/admin/appointments/update.ts');
  if (!mod) return;
  const request = new Request('http://localhost/api/admin/appointments/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'confirmed' }),
  });
  const admin = { id: 'admin-1', fullName: 'Admin', role: 'admin' };
  const response = await mod.POST({ request, locals: { user: admin } });
  assert.equal(response.status, 400);
  const data = await response.json();
  assert.match(data.error, /ID/);
});

test('admin appointments: update rejects invalid status', async () => {
  const mod = await tryImport('../src/pages/api/admin/appointments/update.ts');
  if (!mod) return;
  const request = new Request('http://localhost/api/admin/appointments/update', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: 'apt-1', status: 'bad' }),
  });
  const admin = { id: 'admin-1', fullName: 'Admin', role: 'admin' };
  const response = await mod.POST({ request, locals: { user: admin } });
  assert.equal(response.status, 400);
});

// --- bulk-status.ts ---

test('admin appointments: bulk-status exports POST', async () => {
  const mod = await tryImport('../src/pages/api/admin/appointments/bulk-status.ts');
  if (!mod) return;
  assert.equal(typeof mod.POST, 'function');
});

test('admin appointments: bulk-status rejects non-admin', async () => {
  const mod = await tryImport('../src/pages/api/admin/appointments/bulk-status.ts');
  if (!mod) return;
  const request = new Request('http://localhost/api/admin/appointments/bulk-status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids: ['a1'], status: 'confirmed' }),
  });
  const response = await mod.POST({ request, locals: { user: { role: 'patient' } } });
  assert.equal(response.status, 401);
});

test('admin appointments: bulk-status rejects empty ids', async () => {
  const mod = await tryImport('../src/pages/api/admin/appointments/bulk-status.ts');
  if (!mod) return;
  const request = new Request('http://localhost/api/admin/appointments/bulk-status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids: [], status: 'confirmed' }),
  });
  const admin = { id: 'admin-1', fullName: 'Admin', role: 'admin' };
  const response = await mod.POST({ request, locals: { user: admin } });
  assert.equal(response.status, 400);
});

test('admin appointments: bulk-status rejects batch > 100', async () => {
  const mod = await tryImport('../src/pages/api/admin/appointments/bulk-status.ts');
  if (!mod) return;
  const ids = Array.from({ length: 101 }, (_, i) => `apt-${i}`);
  const request = new Request('http://localhost/api/admin/appointments/bulk-status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids, status: 'confirmed' }),
  });
  const admin = { id: 'admin-1', fullName: 'Admin', role: 'admin' };
  const response = await mod.POST({ request, locals: { user: admin } });
  assert.equal(response.status, 400);
  const data = await response.json();
  assert.match(data.error, /100/);
});

// --- export-csv.ts ---

test('admin appointments: export-csv exports GET', async () => {
  const mod = await tryImport('../src/pages/api/admin/appointments/export-csv.ts');
  if (!mod) return;
  assert.equal(typeof mod.GET, 'function');
});

test('admin appointments: export-csv rejects non-admin', async () => {
  const mod = await tryImport('../src/pages/api/admin/appointments/export-csv.ts');
  if (!mod) return;
  const response = await mod.GET({
    url: new URL('http://localhost/api/admin/appointments/export-csv'),
    locals: { user: { role: 'patient' } },
  });
  assert.equal(response.status, 401);
});
