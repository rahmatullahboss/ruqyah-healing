# LMS Admin Production Grade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the LMS admin course builder self-service and production-safe so admins can create real courses without developer edits or dummy defaults.

**Architecture:** Keep the current Astro/Cloudflare/Drizzle LMS, add reusable admin validation/readiness helpers, enforce publish rules in APIs, and reflect readiness in admin/public UI. Draft courses can be incomplete; published public courses must have real metadata and at least one usable lesson.

**Tech Stack:** Astro 6, Cloudflare Workers, Drizzle/Postgres, Zod, Node test runner.

---

### Task 1: Test Admin Course Readiness Rules

**Files:**
- Create: `tests/lms-admin.test.mjs`
- Create: `src/lib/lms-admin.js`

- [ ] Write failing tests for publish readiness: empty image/default image is rejected, zero lessons is rejected, a complete course with a real uploaded/public image and valid lesson is publishable.
- [ ] Run `node --test tests/lms-admin.test.mjs` and confirm failure because `src/lib/lms-admin.js` does not exist.
- [ ] Implement minimal helper exports in `src/lib/lms-admin.js`.
- [ ] Re-run `node --test tests/lms-admin.test.mjs` and confirm pass.

### Task 2: Gate Course Create/Update APIs

**Files:**
- Modify: `src/pages/api/admin/courses/create.ts`
- Modify: `src/pages/api/admin/courses/update.ts`
- Test: `tests/lms-admin.test.mjs`

- [ ] Add tests for course payload normalization: custom category/level are accepted, prices are non-negative, sale price must be lower than price, and placeholder cover image is not treated as real content.
- [ ] Use the helper in create/update APIs instead of raw body writes.
- [ ] Block `status: "published"` when readiness errors exist.
- [ ] Re-run focused LMS tests.

### Task 3: Make Admin UI Real-Data-Only

**Files:**
- Modify: `src/pages/admin/course-edit.astro`
- Modify: `src/pages/admin/courses.astro`

- [ ] Remove default cover image auto-fill from new course forms.
- [ ] Let admins type any category and level using datalist suggestions instead of locked dropdowns.
- [ ] Show readiness checklist and content counts on course edit/list pages.
- [ ] Keep draft save available for incomplete courses.

### Task 4: Hide Incomplete Courses Publicly

**Files:**
- Modify: `src/lib/lms-admin.js`
- Modify: `src/pages/courses.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/pages/courses/[id].astro`

- [ ] Add helper that filters content-ready published courses.
- [ ] Public course list/homepage should not show published courses with no real lessons.
- [ ] Course detail should return 404 for non-admin/non-enrolled users when course is not public-ready.

### Task 5: Verify

**Files:**
- Test: `tests/lms-admin.test.mjs`
- Test: `tests/lms-access.test.mjs`
- Test: `tests/lms.test.mjs`

- [ ] Run `node --test tests/lms-admin.test.mjs tests/lms-access.test.mjs tests/lms.test.mjs tests/auth.test.mjs tests/env.test.mjs tests/rate-limit.test.mjs`.
- [ ] Run `git diff --check`.
- [ ] Run `node node_modules/astro/bin/astro.mjs build`.
