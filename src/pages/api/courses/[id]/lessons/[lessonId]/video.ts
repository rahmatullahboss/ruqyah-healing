import type { APIRoute } from 'astro';
import { env as workerEnv } from 'cloudflare:workers';
import { and, eq } from 'drizzle-orm';
import { createDb } from '../../../../../../db/client.js';
import { courseProgress } from '../../../../../../db/schema.js';
import {
  normalizeR2Key,
  normalizeVideoEmbedUrl,
  getLessonAccess,
  VIDEO_PROVIDER,
} from '../../../../../../lib/lms-access.js';

export const prerender = false;

function textResponse(message: string, status: number) {
  return new Response(message, {
    status,
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}

function parseRange(rangeHeader: string | null, size: number) {
  if (!rangeHeader) return null;
  const match = rangeHeader.match(/^bytes=(\d*)-(\d*)$/);
  if (!match) return null;

  let start = match[1] ? Number(match[1]) : 0;
  let end = match[2] ? Number(match[2]) : size - 1;

  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  if (start < 0 || end < 0 || start > end || start >= size) return null;
  end = Math.min(end, size - 1);

  return {
    offset: start,
    length: end - start + 1,
    end,
  };
}

export const GET: APIRoute = async ({ params, request, locals }) => {
  const env = (workerEnv || (locals as any).runtime?.env || process.env) as any;
  const user = (locals as any).user;
  const { id: courseId, lessonId } = params;

  if (!courseId || !lessonId) {
    return textResponse('Missing course or lesson id', 400);
  }

  try {
    const db = createDb(env.DATABASE_URL);
    let completedLessonIds = new Set<string>();

    if (user) {
      const progress = await db
        .select({ lessonId: courseProgress.lessonId })
        .from(courseProgress)
        .where(and(
          eq(courseProgress.userId, user.id),
          eq(courseProgress.courseId, courseId),
          eq(courseProgress.completed, true),
        ));
      completedLessonIds = new Set(progress.map((row) => row.lessonId));
    }

    const access = await getLessonAccess(db, {
      user,
      courseId,
      lessonId,
      completedLessonIds,
    });

    if (!access.allowed || !access.lesson) {
      return textResponse(access.reason || 'Forbidden', access.status || 403);
    }

    const lesson = access.lesson;
    if (!['video', 'mixed'].includes(lesson.contentType) || !lesson.videoUrl) {
      return textResponse('Lesson video not available', 404);
    }

    if (lesson.videoProvider === VIDEO_PROVIDER.R2) {
      const key = normalizeR2Key(lesson.videoUrl);
      if (!key) return textResponse('Invalid video key', 400);

      const bucket = env.R2_IMAGES;
      if (!bucket) return textResponse('Video storage is not configured', 500);

      const head = await bucket.head(key);
      if (!head) return textResponse('Video not found', 404);

      const range = parseRange(request.headers.get('Range'), head.size);
      const object = await bucket.get(key, range ? { range: { offset: range.offset, length: range.length } } : undefined);
      if (!object) return textResponse('Video not found', 404);

      const headers = new Headers();
      object.writeHttpMetadata(headers);
      headers.set('Accept-Ranges', 'bytes');
      headers.set('Cache-Control', 'private, no-store');
      headers.set('X-Content-Type-Options', 'nosniff');

      if (range) {
        headers.set('Content-Range', `bytes ${range.offset}-${range.end}/${head.size}`);
        headers.set('Content-Length', String(range.length));
      } else {
        headers.set('Content-Length', String(head.size));
      }

      return new Response(object.body, {
        status: range ? 206 : 200,
        headers,
      });
    }

    const embedUrl = normalizeVideoEmbedUrl(lesson.videoUrl, lesson.videoProvider);
    if (!embedUrl) {
      return textResponse('Invalid video URL', 400);
    }

    return Response.redirect(embedUrl, 302);
  } catch (error) {
    console.error('Protected lesson video error:', error);
    return textResponse('Server error', 500);
  }
};
