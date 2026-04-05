import fs from 'node:fs/promises';
import path from 'node:path';
import { execSync } from 'node:child_process';
import sharp from 'sharp';
import matter from 'gray-matter';

const POSTS_DIR = path.join(process.cwd(), 'src/content/posts');
const TMP_DIR = path.join(process.cwd(), '.tmp');

async function ensureDir(dir) {
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (err) {}
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  await ensureDir(TMP_DIR);
  const files = await fs.readdir(POSTS_DIR);
  const mdFiles = files.filter(f => f.endsWith('.md'));

  console.log(`Found ${mdFiles.length} markdown files.`);

  // Only take 5 files at a time or we can do all of them because it will take a while
  // The user told us to generate them all.
  for (const [index, file] of mdFiles.entries()) {
    const filePath = path.join(POSTS_DIR, file);
    const content = await fs.readFile(filePath, 'utf-8');
    const parsed = matter(content);

    // Skip if it already has an image
    if (parsed.data.image) {
      console.log(`[${index + 1}/${mdFiles.length}] Skipping ${file} - image already exists.`);
      continue;
    }

    console.log(`[${index + 1}/${mdFiles.length}] Processing ${file}...`);
    const title = parsed.data.title || file.replace('.md', '');
    const fileName = file.replace('.md', '');
    const tmpFilePath = path.join(TMP_DIR, `${fileName}.webp`);

    try {
      // 1. Generate image from pollinations.ai (generates instantly, no API key needed)
      const encodedPrompt = encodeURIComponent(`Islamic spiritual ruqyah healing, minimalist clean design, elegant: ${title}`);
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=800&height=420&nologo=true`;
      
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // 2. Compress to WebP using sharp
      const webpBuffer = await sharp(buffer)
        .resize(800, 420, { fit: 'cover' })
        .webp({ quality: 80 })
        .toBuffer();

      await fs.writeFile(tmpFilePath, webpBuffer);

      // 3. Upload to Cloudflare R2
      const r2Key = `blog-images/${fileName}.webp`;
      console.log(`Uploading to R2: ${r2Key}...`);
      
      // We use wrangler CLI to upload directly
      execSync(`npx wrangler r2 object put ruqyah-healing-images/${r2Key} --file="${tmpFilePath}"`, { stdio: 'inherit' });

      // 4. Update the Markdown file
      parsed.data.image = `/api/images/${r2Key}`;
      const updatedContent = matter.stringify(parsed.content, parsed.data);
      await fs.writeFile(filePath, updatedContent, 'utf-8');

      // Clean up tmp file
      await fs.unlink(tmpFilePath);
      console.log(`✅ Finished ${file}`);

      // Sleep a bit to avoid hitting rate limits
      await sleep(1500);

    } catch (err) {
      console.error(`❌ Error processing ${file}:`, err.message);
    }
  }

  console.log('✅ All done!');
}

run();
