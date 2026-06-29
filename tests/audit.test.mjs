import test from 'node:test';
import assert from 'node:assert/strict';
import { logAuditEvent } from '../src/lib/audit.js';

function createMockDb() {
  const calls = [];
  return {
    calls,
    insert: (table) => ({
      values: (data) => {
        calls.push({ table, data });
        return Promise.resolve();
      },
    }),
  };
}

test('logAuditEvent inserts audit log with correct fields', async () => {
  const db = createMockDb();
  await logAuditEvent(db, {
    adminId: 'admin-1',
    adminName: 'Admin User',
    action: 'update',
    entityType: 'course',
    entityId: 'course-1',
    details: { field: 'title' },
  });

  assert.equal(db.calls.length, 1);
  assert.ok(db.calls[0].data.id); // UUID generated
  assert.equal(db.calls[0].data.adminId, 'admin-1');
  assert.equal(db.calls[0].data.adminName, 'Admin User');
  assert.equal(db.calls[0].data.action, 'update');
  assert.equal(db.calls[0].data.entityType, 'course');
  assert.equal(db.calls[0].data.entityId, 'course-1');
  assert.deepEqual(db.calls[0].data.details, { field: 'title' });
});

test('logAuditEvent defaults details to empty object', async () => {
  const db = createMockDb();
  await logAuditEvent(db, {
    adminId: 'admin-1',
    adminName: 'Admin',
    action: 'create',
    entityType: 'post',
    entityId: 'post-1',
  });

  assert.deepEqual(db.calls[0].data.details, {});
});

test('logAuditEvent does not throw on DB error', async () => {
  const db = {
    insert: () => ({
      values: () => Promise.reject(new Error('DB connection failed')),
    }),
  };

  // Should not throw
  await logAuditEvent(db, {
    adminId: 'admin-1',
    adminName: 'Admin',
    action: 'delete',
    entityType: 'post',
    entityId: 'post-1',
  });
});

test('logAuditEvent generates unique IDs', async () => {
  const db = createMockDb();
  await logAuditEvent(db, {
    adminId: 'a1', adminName: 'A', action: 'x', entityType: 't', entityId: 'e1',
  });
  await logAuditEvent(db, {
    adminId: 'a1', adminName: 'A', action: 'x', entityType: 't', entityId: 'e2',
  });

  assert.notEqual(db.calls[0].data.id, db.calls[1].data.id);
});
