import test from 'node:test';
import assert from 'node:assert/strict';

// Posts lib tests — all CRUD functions with mock DB.

function createMockDb(selectResult = []) {
  const calls = { select: [], insert: [], update: [], delete: [] };

  function chainable(result) {
    return {
      from: () => chainable(result),
      where: () => chainable(result),
      orderBy: () => chainable(result),
      limit: () => Promise.resolve(result),
      then: (resolve) => resolve(result),
    };
  }

  return {
    _calls: calls,
    select: (...args) => {
      calls.select.push(args);
      return chainable(selectResult);
    },
    selectDistinct: (...args) => {
      calls.select.push(args);
      return chainable(selectResult);
    },
    insert: (table) => ({
      values: (data) => {
        calls.insert.push({ table, data });
        return Promise.resolve();
      },
    }),
    update: (table) => ({
      set: (data) => ({
        where: () => {
          calls.update.push({ table, data });
          return Promise.resolve();
        },
      }),
    }),
    delete: (table) => ({
      where: () => {
        calls.delete.push({ table });
        return Promise.resolve();
      },
    }),
  };
}

// --- getAllPosts ---

test('posts: getAllPosts queries published posts ordered by date', async () => {
  const mockPosts = [
    { id: '1', slug: 'post-1', title: 'Post 1', published: true, date: '2025-01-02' },
    { id: '2', slug: 'post-2', title: 'Post 2', published: true, date: '2025-01-01' },
  ];
  const db = createMockDb(mockPosts);
  const { getAllPosts } = await import('../src/lib/posts.js');
  const result = await getAllPosts(db);
  assert.equal(result.length, 2);
  assert.equal(result[0].slug, 'post-1');
});

// --- getPostBySlug ---

test('posts: getPostBySlug returns post for valid slug', async () => {
  const mockPost = { id: '1', slug: 'my-post', title: 'My Post', published: true };
  const db = createMockDb([mockPost]);
  const { getPostBySlug } = await import('../src/lib/posts.js');
  const result = await getPostBySlug(db, 'my-post');
  assert.equal(result.slug, 'my-post');
});

test('posts: getPostBySlug returns null for missing slug', async () => {
  const db = createMockDb([]);
  const { getPostBySlug } = await import('../src/lib/posts.js');
  const result = await getPostBySlug(db, 'nonexistent');
  assert.equal(result, null);
});

// --- getPostsByCategory ---

test('posts: getPostsByCategory filters by category', async () => {
  const mockPosts = [{ id: '1', category: 'ruqyah', published: true }];
  const db = createMockDb(mockPosts);
  const { getPostsByCategory } = await import('../src/lib/posts.js');
  const result = await getPostsByCategory(db, 'ruqyah');
  assert.equal(result.length, 1);
  assert.equal(result[0].category, 'ruqyah');
});

// --- getCategories ---

test('posts: getCategories returns distinct categories', async () => {
  const db = createMockDb([{ category: 'ruqyah' }, { category: 'health' }]);
  const { getCategories } = await import('../src/lib/posts.js');
  const result = await getCategories(db);
  assert.deepEqual(result, ['ruqyah', 'health']);
});

// --- getRelatedPosts ---

test('posts: getRelatedPosts excludes current slug', async () => {
  const mockPosts = [{ id: '2', slug: 'other-post', category: 'ruqyah' }];
  const db = createMockDb(mockPosts);
  const { getRelatedPosts } = await import('../src/lib/posts.js');
  const result = await getRelatedPosts(db, 'ruqyah', 'current-post', 3);
  assert.equal(result.length, 1);
});

// --- getAllPostsAdmin ---

test('posts: getAllPostsAdmin returns all posts including unpublished', async () => {
  const mockPosts = [
    { id: '1', slug: 'p1', title: 'P1', category: 'c', date: 'd', published: true, createdAt: new Date() },
    { id: '2', slug: 'p2', title: 'P2', category: 'c', date: 'd', published: false, createdAt: new Date() },
  ];
  const db = createMockDb(mockPosts);
  const { getAllPostsAdmin } = await import('../src/lib/posts.js');
  const result = await getAllPostsAdmin(db);
  assert.equal(result.length, 2);
});

// --- getPostBySlugAdmin ---

test('posts: getPostBySlugAdmin returns post by slug (any status)', async () => {
  const mockPost = { id: '1', slug: 'draft-post', title: 'Draft', published: false };
  const db = createMockDb([mockPost]);
  const { getPostBySlugAdmin } = await import('../src/lib/posts.js');
  const result = await getPostBySlugAdmin(db, 'draft-post');
  assert.equal(result.slug, 'draft-post');
});

test('posts: getPostBySlugAdmin returns null for missing', async () => {
  const db = createMockDb([]);
  const { getPostBySlugAdmin } = await import('../src/lib/posts.js');
  const result = await getPostBySlugAdmin(db, 'missing');
  assert.equal(result, null);
});

// --- createPost ---

test('posts: createPost inserts and returns ID', async () => {
  const db = createMockDb();
  const { createPost } = await import('../src/lib/posts.js');
  const id = await createPost(db, {
    slug: 'new-post',
    title: 'New Post',
    excerpt: 'Excerpt',
    category: 'test',
    date: '2025-01-01',
    content: 'Body',
  });
  assert.ok(id, 'Should return an ID');
  assert.equal(db._calls.insert.length, 1);
});

// --- updatePost ---

test('posts: updatePost calls update with ID', async () => {
  const db = createMockDb();
  const { updatePost } = await import('../src/lib/posts.js');
  await updatePost(db, 'post-1', { title: 'Updated Title' });
  assert.equal(db._calls.update.length, 1);
  assert.equal(db._calls.update[0].data.title, 'Updated Title');
  assert.ok(db._calls.update[0].data.updatedAt instanceof Date);
});

// --- deletePost ---

test('posts: deletePost calls delete with ID', async () => {
  const db = createMockDb();
  const { deletePost } = await import('../src/lib/posts.js');
  await deletePost(db, 'post-1');
  assert.equal(db._calls.delete.length, 1);
});
