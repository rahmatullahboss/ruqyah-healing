import { createDb } from '../../../../db/client.js';
import { users } from '../../../../db/schema.js';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { logAuditEvent } from '../../../../lib/audit.js';

export const prerender = false;

import type { APIRoute } from 'astro';
import { env as workerEnv } from 'cloudflare:workers';

const requestSchema = z.object({
  userId: z.string().trim().min(1),
  role: z.enum(['admin', 'patient']),
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Cache-Control': 'no-store', 'Content-Type': 'application/json' },
  });
}

export const POST: APIRoute = async ({ request, locals }) => {
  const env = workerEnv || process.env;

  try {
    const adminUser = locals.user;
    if (!adminUser || adminUser.role !== 'admin') return json({ error: 'Unauthorized' }, 403);

    const parsed = requestSchema.safeParse(await request.json());
    if (!parsed.success) return json({ error: 'Invalid input', details: parsed.error.issues }, 400);

    const { userId, role } = parsed.data;
    if (adminUser.id === userId && role !== 'admin') {
      return json({ error: 'You cannot remove your own admin role.' }, 403);
    }

    const db = createDb(env.DATABASE_URL);
    const [targetUser] = await db.select({ id: users.id, role: users.role })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    if (!targetUser) return json({ error: 'User not found' }, 404);

    if (targetUser.role === role) return json({ success: true, role, message: 'Role unchanged' });

    await db.update(users).set({ role }).where(eq(users.id, userId));
    await logAuditEvent(db, {
      adminId: adminUser.id,
      adminName: adminUser.fullName,
      action: 'role_change',
      entityType: 'user',
      entityId: userId,
      details: { previousRole: targetUser.role, newRole: role },
    });

    return json({ success: true, role });
  } catch (error) {
    console.error('Role update error:', error);
    return json({ error: 'Server error' }, 500);
  }
};
