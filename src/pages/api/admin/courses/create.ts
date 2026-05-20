import { createDb } from '../../../../db/client.js';
import { courses } from '../../../../db/schema.js';
import type { APIRoute } from 'astro';
import { env as workerEnv } from 'cloudflare:workers';
import crypto from 'node:crypto';
import { logAuditEvent } from '../../../../lib/audit.js';
import { faqFromTextarea, listFromTextarea } from '../../../../lib/lms-access.js';

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  const env = workerEnv || process.env;
  
  try {
    const adminUser = locals.user;
    
    if (!adminUser || adminUser.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const body = await request.json() as Record<string, any>;
    const db = createDb((env as any).DATABASE_URL);

    const price = body.price === null || body.price === '' || body.price === undefined ? null : Number(body.price);
    const salePrice = body.salePrice === null || body.salePrice === '' || body.salePrice === undefined ? null : Number(body.salePrice);

    const id = crypto.randomUUID();
    await db.insert(courses).values({
      id,
      title: body.title,
      instructor: body.instructor,
      students: body.students || 0,
      classCount: body.classCount,
      hours: body.hours,
      level: body.level,
      price,
      salePrice,
      rating: body.rating || 5.0,
      desc: body.desc,
      shortDescription: body.shortDescription || body.desc || '',
      fullDescription: body.fullDescription || body.desc || '',
      image: body.image,
      videoLink: body.videoLink || '',
      category: body.category || 'রুকইয়াহ শারইয়াহ',
      status: body.status || 'draft',
      language: body.language || 'বাংলা',
      outcomes: listFromTextarea(body.outcomes),
      requirements: listFromTextarea(body.requirements),
      faq: faqFromTextarea(body.faq),
      accessMode: body.accessMode === 'sequential' ? 'sequential' : 'open',
      certificateEnabled: body.certificateEnabled !== false && body.certificateEnabled !== 'false',
    });

    await logAuditEvent(db, {
      adminId: adminUser.id,
      adminName: adminUser.fullName,
      action: 'create',
      entityType: 'course',
      entityId: id,
      details: { title: body.title },
    });

    return new Response(JSON.stringify({ success: true, id }), { status: 200 });
  } catch (error) {
    console.error('Course create error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
