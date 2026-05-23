import type { APIRoute } from 'astro';
import { env as workerEnv } from 'cloudflare:workers';
import { createDb } from '../../../../db/client.js';
import { courseModules } from '../../../../db/schema.js';
import { eq } from 'drizzle-orm';
import { logAuditEvent } from '../../../../lib/audit.js';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const env = workerEnv || process.env;
  const user = (locals as any).user;

  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 });
  }

  try {
    const body = await request.json() as Record<string, any>;
    const { id, title, description, sortOrder } = body;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Module ID is required' }), { status: 400 });
    }

    const db = createDb((env as any).DATABASE_URL);

    const updates: Record<string, any> = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (sortOrder !== undefined) updates.sortOrder = sortOrder;

    if (Object.keys(updates).length === 0) {
      return new Response(JSON.stringify({ error: 'No fields to update' }), { status: 400 });
    }

    await db.update(courseModules).set(updates).where(eq(courseModules.id, id));

    await logAuditEvent(db, {
      adminId: user.id,
      adminName: user.fullName,
      action: 'update',
      entityType: 'module',
      entityId: id,
      details: { title },
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Module update error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
