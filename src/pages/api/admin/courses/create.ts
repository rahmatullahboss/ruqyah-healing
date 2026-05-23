import { createDb } from '../../../../db/client.js';
import { courses } from '../../../../db/schema.js';
import type { APIRoute } from 'astro';
import { env as workerEnv } from 'cloudflare:workers';
import crypto from 'node:crypto';
import { logAuditEvent } from '../../../../lib/audit.js';
import { buildCourseReadiness, normalizeAdminCoursePayload } from '../../../../lib/lms-admin.js';
import { COURSE_STATUS } from '../../../../lib/lms-access.js';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const env = workerEnv || process.env;
  
  try {
    const adminUser = locals.user;
    
    if (!adminUser || adminUser.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const body = await request.json() as Record<string, any>;
    const parsed = normalizeAdminCoursePayload(body);
    if (!parsed.ok) {
      return new Response(JSON.stringify({ error: parsed.errors[0], errors: parsed.errors }), { status: 400 });
    }

    if (parsed.data.status === COURSE_STATUS.PUBLISHED) {
      const readiness = buildCourseReadiness({ course: parsed.data, modules: [], lessons: [] });
      return new Response(JSON.stringify({
        error: 'কোর্স publish করার আগে content সম্পূর্ণ করুন।',
        errors: readiness.errors,
        readiness,
      }), { status: 422 });
    }

    const db = createDb((env as any).DATABASE_URL);

    const id = crypto.randomUUID();
    await db.insert(courses).values({
      id,
      ...parsed.data,
    });

    await logAuditEvent(db, {
      adminId: adminUser.id,
      adminName: adminUser.fullName,
      action: 'create',
      entityType: 'course',
      entityId: id,
      details: { title: parsed.data.title },
    });

    return new Response(JSON.stringify({ success: true, id }), { status: 200 });
  } catch (error) {
    console.error('Course create error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
