import type { APIRoute } from 'astro';
import { env as workerEnv } from 'cloudflare:workers';
import { createDb } from '../../../../db/client.js';
import { courseLessons } from '../../../../db/schema.js';
import { eq } from 'drizzle-orm';
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
      id,
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
      sortOrder,
      moduleId,
    } = body;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Lesson ID is required' }), { status: 400 });
    }

    const db = createDb((env as any).DATABASE_URL);

    const updates: Record<string, any> = {};
    if (title !== undefined) updates.title = title;
    if (description !== undefined) updates.description = description;
    if (contentType !== undefined) updates.contentType = contentType;
    if (videoUrl !== undefined) updates.videoUrl = videoUrl;
    if (videoProvider !== undefined) updates.videoProvider = videoProvider;
    if (textContent !== undefined) updates.textContent = textContent;
    if (resources !== undefined) updates.resources = resourcesFromTextarea(resources);
    if (allowResourceDownload !== undefined) updates.allowResourceDownload = allowResourceDownload === true || allowResourceDownload === 'true';
    if (duration !== undefined) updates.duration = duration;
    if (isFreePreview !== undefined) updates.isFreePreview = isFreePreview;
    if (sortOrder !== undefined) updates.sortOrder = sortOrder;
    if (moduleId !== undefined) updates.moduleId = moduleId;

    if (Object.keys(updates).length === 0) {
      return new Response(JSON.stringify({ error: 'No fields to update' }), { status: 400 });
    }

    await db.update(courseLessons).set(updates).where(eq(courseLessons.id, id));

    // Get courseId for stats update
    const lesson = await db.select({ courseId: courseLessons.courseId })
      .from(courseLessons).where(eq(courseLessons.id, id));
    if (lesson[0]) {
      await updateCourseLessonStats(db, lesson[0].courseId);
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Lesson update error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
