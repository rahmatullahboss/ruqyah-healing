import { posts } from '../db/schema.js';
import { eq, desc, and, ne } from 'drizzle-orm';

export async function getAllPosts(db) {
  return db.select().from(posts)
    .where(eq(posts.published, true))
    .orderBy(desc(posts.date));
}

export async function getPostBySlug(db, slug) {
  const [post] = await db.select().from(posts)
    .where(and(eq(posts.slug, slug), eq(posts.published, true)))
    .limit(1);
  return post || null;
}

export async function getPostsByCategory(db, category) {
  return db.select().from(posts)
    .where(and(eq(posts.category, category), eq(posts.published, true)))
    .orderBy(desc(posts.date));
}

export async function getCategories(db) {
  const rows = await db.selectDistinct({ category: posts.category })
    .from(posts)
    .where(eq(posts.published, true));
  return rows.map(r => r.category);
}

export async function getRelatedPosts(db, category, excludeSlug, limit = 3) {
  return db.select().from(posts)
    .where(and(
      eq(posts.category, category),
      eq(posts.published, true),
      ne(posts.slug, excludeSlug)
    ))
    .orderBy(desc(posts.date))
    .limit(limit);
}

// Admin functions (include unpublished)
export async function getAllPostsAdmin(db) {
  return db.select({
    id: posts.id,
    slug: posts.slug,
    title: posts.title,
    category: posts.category,
    date: posts.date,
    published: posts.published,
    createdAt: posts.createdAt,
  }).from(posts).orderBy(desc(posts.date));
}

export async function getPostBySlugAdmin(db, slug) {
  const [post] = await db.select().from(posts)
    .where(eq(posts.slug, slug))
    .limit(1);
  return post || null;
}

export async function createPost(db, data) {
  const id = crypto.randomUUID();
  await db.insert(posts).values({ id, ...data });
  return id;
}

export async function updatePost(db, id, data) {
  await db.update(posts)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(posts.id, id));
}

export async function deletePost(db, id) {
  await db.delete(posts).where(eq(posts.id, id));
}
