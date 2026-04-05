import { auditLogs } from '../db/schema.js';

/**
 * Log an admin action to the audit_logs table.
 * Non-critical — silently catches errors to avoid breaking the main operation.
 */
export async function logAuditEvent(db, { adminId, adminName, action, entityType, entityId, details = {} }) {
  try {
    await db.insert(auditLogs).values({
      id: crypto.randomUUID(),
      adminId,
      adminName,
      action,
      entityType,
      entityId,
      details,
    });
  } catch (err) {
    console.error('[Audit] Failed to log event:', err);
  }
}
