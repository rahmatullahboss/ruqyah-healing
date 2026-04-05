import { createDb } from '../../../../db/client.js';
import { appointments } from '../../../../db/schema.js';
import { ilike, and, or, gte, lte, desc, eq } from 'drizzle-orm';

export const prerender = false;

import type { APIRoute } from 'astro';

import { env as workerEnv } from 'cloudflare:workers';

export const GET: APIRoute = async ({ url, locals }) => {
  const env = workerEnv || process.env;

  try {
    const adminUser = locals.user;

    if (!adminUser || adminUser.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const db = createDb(env.DATABASE_URL);

    const search = url.searchParams.get('q') || '';
    const statusFilter = url.searchParams.get('status') || '';
    const treatmentFilter = url.searchParams.get('treatment') || '';
    const fromDate = url.searchParams.get('from') || '';
    const toDate = url.searchParams.get('to') || '';

    const conditions: any[] = [];

    if (search) {
      conditions.push(
        or(
          ilike(appointments.fullName, `%${search}%`),
          ilike(appointments.phone, `%${search}%`)
        )
      );
    }

    if (statusFilter) {
      conditions.push(eq(appointments.status, statusFilter));
    }

    if (treatmentFilter) {
      conditions.push(ilike(appointments.treatmentTypeLabel, `%${treatmentFilter}%`));
    }

    if (fromDate) {
      conditions.push(gte(appointments.createdAt, new Date(fromDate)));
    }

    if (toDate) {
      const endDate = new Date(toDate);
      endDate.setHours(23, 59, 59, 999);
      conditions.push(lte(appointments.createdAt, endDate));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const rows = await db.select().from(appointments)
      .where(whereClause)
      .orderBy(desc(appointments.createdAt));

    // Build CSV
    const headers = ['নাম', 'ফোন', 'চিকিৎসা', 'তারিখ', 'সময়', 'স্ট্যাটাস', 'পেমেন্ট', 'তৈরি'];

    const escapeCsv = (val: string) => {
      if (!val) return '';
      // Prevent CSV formula injection
      if (/^[=+\-@\t\r]/.test(val)) {
        val = "'" + val;
      }
      if (val.includes(',') || val.includes('"') || val.includes('\n')) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    };

    const csvLines = [
      // BOM for Excel Bengali support + header row
      headers.join(','),
      ...rows.map(row =>
        [
          escapeCsv(row.fullName),
          escapeCsv(row.phone),
          escapeCsv(row.treatmentTypeLabel),
          escapeCsv(row.preferredDate),
          escapeCsv(row.preferredTime),
          escapeCsv(row.status),
          escapeCsv(row.paymentMethod),
          escapeCsv(new Date(row.createdAt).toISOString().split('T')[0]),
        ].join(',')
      ),
    ];

    const csvContent = '\uFEFF' + csvLines.join('\n');
    const today = new Date().toISOString().split('T')[0];

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="appointments-${today}.csv"`,
      },
    });

  } catch (error) {
    console.error('CSV export error:', error);
    return new Response(JSON.stringify({ error: 'Server error' }), { status: 500 });
  }
};
