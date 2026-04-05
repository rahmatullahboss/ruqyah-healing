import { neon } from '@neondatabase/serverless';
import fs from 'fs';
import path from 'path';

// Read DATABASE_URL from .dev.vars
const devVars = fs.readFileSync('.dev.vars', 'utf-8');
const dbUrl = devVars.split('\n').find(l => l.startsWith('DATABASE_URL'))?.split('=').slice(1).join('=').trim();

if (!dbUrl) {
  console.error('DATABASE_URL not found in .dev.vars');
  process.exit(1);
}

const sql = neon(dbUrl);

function parseFrontmatter(content) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) return null;

  const frontmatter = {};
  const lines = match[1].split('\n');

  for (const line of lines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;

    const key = line.slice(0, colonIdx).trim();
    let value = line.slice(colonIdx + 1).trim();

    // Remove surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    // Parse array values like ["tag1", "tag2"]
    if (value.startsWith('[')) {
      try {
        value = JSON.parse(value);
      } catch {
        value = [];
      }
    }

    frontmatter[key] = value;
  }

  return {
    data: frontmatter,
    body: match[2].trim(),
  };
}

async function main() {
  const postsDir = path.join(process.cwd(), 'src/content/posts');
  const files = fs.readdirSync(postsDir).filter(f => f.endsWith('.md'));

  console.log(`Found ${files.length} markdown files`);

  let inserted = 0;
  let skipped = 0;

  for (const file of files) {
    const slug = file.replace(/\.md$/, '');
    const content = fs.readFileSync(path.join(postsDir, file), 'utf-8');
    const parsed = parseFrontmatter(content);

    if (!parsed || !parsed.data.title) {
      console.warn(`Skipping ${file}: could not parse frontmatter`);
      skipped++;
      continue;
    }

    const { data, body } = parsed;
    const id = crypto.randomUUID();
    const tags = Array.isArray(data.tags) ? data.tags : [];

    try {
      await sql`
        INSERT INTO posts (id, slug, title, excerpt, category, tags, date, content, published)
        VALUES (
          ${id},
          ${slug},
          ${data.title},
          ${data.excerpt || ''},
          ${data.category || ''},
          ${JSON.stringify(tags)}::jsonb,
          ${data.date || ''},
          ${body},
          true
        )
        ON CONFLICT (slug) DO NOTHING
      `;
      inserted++;
      if (inserted % 20 === 0) console.log(`  Inserted ${inserted}/${files.length}...`);
    } catch (err) {
      console.error(`Failed to insert ${file}:`, err.message);
      skipped++;
    }
  }

  console.log(`\nDone! Inserted: ${inserted}, Skipped: ${skipped}`);
}

main().catch(console.error);
