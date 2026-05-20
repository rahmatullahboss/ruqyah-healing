import type { APIRoute } from 'astro';
import { env as workerEnv } from 'cloudflare:workers';
import { createDb } from '../../../../db/client.js';
import { courseLessons, courseModules } from '../../../../db/schema.js';
import { eq, and, sql } from 'drizzle-orm';
import crypto from 'node:crypto';
import { updateCourseLessonStats } from '../../../../lib/lms.js';
import { resourcesFromTextarea } from '../../../../lib/lms-access.js';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const env = workerEnv || process.env;
  const user = (locals as any).user;

  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 });
  }

  try {
    const body = await request.json() as Record<string, any>;
    const {
      moduleId,
      courseId,
      title,
      description,
      contentType,
      videoUrl,
      videoProvider,
      textContent,
      resources,
      allowResourceDownload,
      duration,
      isFreePreview,
    } = body;

    if (!moduleId || !courseId || !title) {
      return new Response(JSON.stringify({ error: 'Module ID, Course ID and title are required' }), { status: 400 });
    }

    const db = createDb((env as any).DATABASE_URL);

    // Verify module exists and belongs to course
    const module = await db.select().from(courseModules)
      .where(and(eq(courseModules.id, moduleId), eq(courseModules.courseId, courseId)));
    if (module.length === 0) {
      return new Response(JSON.stringify({ error: 'Module not found' }), { status: 404 });
    }

    // Get next sort order
    const maxSort = await db.select({ max: sql`coalesce(max(${courseLessons.sortOrder}), 0)` })
      .from(courseLessons)
      .where(eq(courseLessons.moduleId, moduleId));

    const id = crypto.randomUUID();
    await db.insert(courseLessons).values({
      id,
      moduleId,
      courseId,
      title,
      description: description || '',
      contentType: contentType || 'video',
      videoUrl: videoUrl || '',
      videoProvider: videoProvider || 'youtube',
      textContent: textContent || '',
      resources: resourcesFromTextarea(resources),
      allowResourceDownload: allowResourceDownload === true || allowResourceDownload === 'true',
      duration: duration || '',
      sortOrder: Number(maxSort[0]?.max || 0) + 1,
      isFreePreview: isFreePreview === true || isFreePreview === 'true',
    });

    // Update course stats
    await updateCourseLessonStats(db, courseId);

    return new Response(JSON.stringify({ success: true, id }), { status: 200 });
  } catch (error) {
    console.error('Lesson create error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
