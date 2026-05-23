# Worker AI Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the full Astro project to a Cloudflare Worker app, serve the built site through the `ASSETS` binding, and replace Ollama with Workers AI for `/api/chat`.

**Architecture:** Switch Astro from static output to Cloudflare server output so the generated Worker can render routes and serve built assets. Keep the frontend `/api/chat` contract stable by moving the AI logic into a Worker-safe helper and wrapping Workers AI text output in OpenAI-style SSE chunks.

**Tech Stack:** Astro 6, `@astrojs/cloudflare`, Cloudflare Workers, Workers AI, Zod, Node test runner

---

### Task 1: Lock Worker and AI boundaries

**Files:**
- Modify: `astro.config.mjs`
- Modify: `wrangler.jsonc`
- Modify: `package.json`

- [ ] **Step 1: Switch Astro to server output**

```js
export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    imageService: 'cloudflare',
  }),
});
```

- [ ] **Step 2: Point Wrangler at the Astro Cloudflare Worker entrypoint**

```json
{
  "main": "./dist/server/entry.mjs",
  "assets": {
    "directory": "./dist/client",
    "binding": "ASSETS",
    "run_worker_first": ["/api/*"]
  },
  "ai": {
    "binding": "AI"
  }
}
```

- [ ] **Step 3: Remove the Ollama dependency and old Pages-only assumptions**

```json
{
  "scripts": {
    "preview": "wrangler dev",
    "deploy": "astro build && wrangler deploy"
  }
}
```

### Task 2: Add a failing regression test for chat response shaping

**Files:**
- Create: `tests/chat-worker.test.mjs`
- Create: `src/lib/ai/chat.js`

- [ ] **Step 1: Write the failing test**

```js
test('converts Workers AI text output into OpenAI-style SSE chunks', async () => {
  const response = createSseResponseFromText('আসসালামু আলাইকুম');
  const body = await response.text();

  assert.equal(response.headers.get('Content-Type'), 'text/event-stream');
  assert.match(body, /"choices":\[\{"delta":\{"content":"আসসালামু আলাইকুম"\}\}\]/);
  assert.match(body, /\[DONE\]/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/chat-worker.test.mjs`
Expected: FAIL because `createSseResponseFromText` does not exist yet.

- [ ] **Step 3: Implement the minimal helper**

```js
export function createSseResponseFromText(text) {
  const encoder = new TextEncoder();
  const payload = `data: ${JSON.stringify({ choices: [{ delta: { content: text } }] })}\n\ndata: [DONE]\n\n`;
  return new Response(encoder.encode(payload), {
    headers: { 'Content-Type': 'text/event-stream' },
  });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test tests/chat-worker.test.mjs`
Expected: PASS

### Task 3: Replace Ollama with Workers AI in the API route

**Files:**
- Create: `src/pages/api/chat.ts`
- Modify: `src/lib/ai/chat.js`
- Delete: `functions/api/chat.ts`

- [ ] **Step 1: Add request validation and Workers AI invocation**

```ts
import { env } from 'cloudflare:workers';
import { handleChatRequest } from '../../lib/ai/chat.js';

export const POST = async ({ request }) => {
  return handleChatRequest(request, env);
};
```

- [ ] **Step 2: Implement fallback model selection**

```js
const DEFAULT_MODEL = '@cf/google/gemma-4-26b-a4b-it';
const FALLBACK_MODEL = '@cf/google/gemma-3-12b-it';
```

- [ ] **Step 3: Return Bengali error responses without breaking the frontend**

```js
return new Response(JSON.stringify({
  error: 'AI সার্ভিসে সাময়িক সমস্যা হচ্ছে। কিছুক্ষণ পর আবার চেষ্টা করুন।'
}), { status: 503 });
```

### Task 4: Verify full Worker build path

**Files:**
- Modify: `package-lock.json`

- [ ] **Step 1: Install updated dependencies**

Run: `npm uninstall ollama`
Expected: lockfile updates and `ollama` removed from dependency graph.

- [ ] **Step 2: Run regression test**

Run: `node --test tests/chat-worker.test.mjs`
Expected: PASS

- [ ] **Step 3: Run project build**

Run: `npm run build`
Expected: Astro server build succeeds and produces `dist/server/entry.mjs` plus `dist/client`.

- [ ] **Step 4: Regenerate Worker types if needed**

Run: `npm run generate-types`
Expected: `worker-configuration.d.ts` reflects the `AI` binding.
