#!/usr/bin/env node
/**
 * scripts/backfill-content-html.mjs
 *
 * One-time script: converts all existing Markdown posts to HTML and writes
 * the result to the content_html column, so they load instantly in TipTap
 * without the "Markdown→HTML on open" round-trip.
 *
 * Usage:
 *   DATABASE_URL=postgres://... node scripts/backfill-content-html.mjs
 *
 * Safe to run multiple times — it only updates rows where content_html IS NULL.
 */

import { createRequire } from 'module';
import { marked } from 'marked';

const require = createRequire(import.meta.url);

// ── Inline sanitizer (mirrors src/lib/markdown.js, no import needed) ───────
function sanitizeHtml(html) {
  html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  html = html.replace(/\s+on\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  html = html.replace(/(href|src)\s*=\s*(?:"javascript:[^"]*"|'javascript:[^']*')/gi, '$1=""');
  html = html.replace(/(href|src)\s*=\s*(?:"data:[^"]*"|'data:[^']*')/gi, '$1=""');
  html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
  html = html.replace(/<\/?(?:iframe|object|embed|form|input|textarea|button|select|option)\b[^>]*>/gi, '');
  html = html.replace(/\s+style\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, '');
  html = html.replace(/<a\s+([^>]*href\s*=\s*"https?:\/\/[^"]*"[^>]*)>/gi, (match, attrs) => {
    if (!attrs.includes('rel=')) attrs += ' rel="noopener noreferrer"';
    if (!attrs.includes('target=')) attrs += ' target="_blank"';
    return `<a ${attrs}>`;
  });
  return html;
}

marked.setOptions({ gfm: true, breaks: true });
marked.use({ hooks: { postprocess: (html) => sanitizeHtml(html) } });

function renderMarkdown(content) {
  if (!content) return '';
  return marked.parse(content);
}

// ── Database connection ─────────────────────────────────────────────────────
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('❌  DATABASE_URL environment variable is required.');
  process.exit(1);
}

// Use @neondatabase/serverless for Neon Postgres (same driver as app)
const { neon } = await import('@neondatabase/serverless');
const sql = neon(databaseUrl);

// ── Backfill ────────────────────────────────────────────────────────────────
console.log('🔍  Fetching posts where content_html IS NULL...');

const posts = await sql`
  SELECT id, content
  FROM posts
  WHERE content_html IS NULL
  ORDER BY created_at DESC
`;

console.log(`📝  Found ${posts.length} post(s) to backfill.`);

if (posts.length === 0) {
  console.log('✅  Nothing to do.');
  process.exit(0);
}

let updated = 0;
let errored = 0;

for (const post of posts) {
  try {
    const html = renderMarkdown(post.content ?? '');
    await sql`
      UPDATE posts
      SET content_html = ${html}
      WHERE id = ${post.id}
    `;
    updated++;
    process.stdout.write(`  ✓ ${post.id}\n`);
  } catch (err) {
    errored++;
    console.error(`  ✗ ${post.id}: ${err.message}`);
  }
}

console.log(`\n✅  Done. Updated: ${updated}  Errors: ${errored}`);
