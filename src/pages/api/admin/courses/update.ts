import { createDb } from '../../../../db/client.js';
import { courses } from '../../../../db/schema.js';
import type { APIRoute } from 'astro';
import { env as workerEnv } from 'cloudflare:workers';
import { eq } from 'drizzle-orm';
import { logAuditEvent } from '../../../../lib/audit.js';

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

    const db = createDb((env as any).DATABASE_URL);
    const r2 = (env as any).R2_IMAGES;

    const oldCourseRes = await db.select().from(courses).where(eq(courses.id, body.id));
    if (oldCourseRes.length > 0) {
      const oldImg = oldCourseRes[0].image;
      if (body.image && oldImg && oldImg !== body.image && oldImg.startsWith('/api/images/') && r2) {
        const key = oldImg.replace('/api/images/', '');
        await r2.delete(key).catch(console.error);
      }
    }

    await db.update(courses)
      .set({
        title: body.title,
        instructor: body.instructor,
        students: body.students || 0,
        classCount: body.classCount,
        hours: body.hours,
        level: body.level,
        price: body.price !== null ? body.price : null,
        rating: body.rating || 5.0,
        desc: body.desc,
        image: body.image,
        videoLink: body.videoLink || ''
      })
      .where(eq(courses.id, body.id));

    await logAuditEvent(db, {
      adminId: adminUser.id,
      adminName: adminUser.fullName,
      action: 'update',
      entityType: 'course',
      entityId: body.id,
      details: { title: body.title },
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Course update error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
