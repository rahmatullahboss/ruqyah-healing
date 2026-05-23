import { createDb } from '../../../../db/client.js';
import { courseLessons, courseModules, courses } from '../../../../db/schema.js';
import type { APIRoute } from 'astro';
import { env as workerEnv } from 'cloudflare:workers';
import { eq } from 'drizzle-orm';
import { logAuditEvent } from '../../../../lib/audit.js';
import { COURSE_STATUS } from '../../../../lib/lms-access.js';
import { buildCourseReadiness, normalizeAdminCoursePayload } from '../../../../lib/lms-admin.js';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const env = workerEnv || process.env;
  
  try {
    const adminUser = locals.user;
    
    if (!adminUser || adminUser.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const body = await request.json() as Record<string, any>;
    if (!body.id) {
      return new Response(JSON.stringify({ error: 'Course ID missing' }), { status: 400 });
    }

    const parsed = normalizeAdminCoursePayload(body);
    if (!parsed.ok) {
      return new Response(JSON.stringify({ error: parsed.errors[0], errors: parsed.errors }), { status: 400 });
    }

    const db = createDb((env as any).DATABASE_URL);
    const r2 = (env as any).R2_IMAGES;

    const oldCourseRes = await db.select().from(courses).where(eq(courses.id, body.id));
    const oldCourse = oldCourseRes[0];
    if (!oldCourse) {
      return new Response(JSON.stringify({ error: 'Course not found' }), { status: 404 });
    }

    if (parsed.data.status === COURSE_STATUS.PUBLISHED) {
      const [modules, lessons] = await Promise.all([
        db.select().from(courseModules).where(eq(courseModules.courseId, body.id)),
        db.select().from(courseLessons).where(eq(courseLessons.courseId, body.id)),
      ]);
      const readiness = buildCourseReadiness({
        course: { ...oldCourse, ...parsed.data },
        modules,
        lessons,
      });
      if (!readiness.publishable) {
        return new Response(JSON.stringify({
          error: 'কোর্স publish করার আগে content সম্পূর্ণ করুন।',
          errors: readiness.errors,
          readiness,
        }), { status: 422 });
      }
    }

    const oldImg = oldCourse.image;
    if (oldImg && oldImg !== parsed.data.image && oldImg.startsWith('/api/images/') && r2) {
      const key = oldImg.replace('/api/images/', '');
      await r2.delete(key).catch(console.error);
    }

    await db.update(courses)
      .set(parsed.data)
      .where(eq(courses.id, body.id));

    await logAuditEvent(db, {
      adminId: adminUser.id,
      adminName: adminUser.fullName,
      action: 'update',
      entityType: 'course',
      entityId: body.id,
      details: { title: parsed.data.title },
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Course update error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
