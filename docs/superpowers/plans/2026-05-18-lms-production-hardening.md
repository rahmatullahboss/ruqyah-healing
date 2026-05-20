# LMS Production Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the existing partially built LMS into a usable production-ready core flow without rewriting the current Astro/Neon/Cloudflare architecture.

**Architecture:** Keep Astro SSR pages, JWT cookie auth, Neon/Postgres via Drizzle, and R2 uploads. Centralize LMS authorization in service helpers, make lesson access server-side, add payment/order records around manual payments, and use private Worker-gated video/resource delivery for R2-backed lessons.

**Tech Stack:** Astro 6, Cloudflare Workers adapter, Neon Postgres, Drizzle ORM, Zod, R2, Node test runner.

---

### Task 1: Central LMS Service Boundaries

**Files:**
- Create: `src/lib/lms-access.js`
- Modify: `src/lib/lms.js`
- Test: `tests/lms-access.test.mjs`

- [ ] Add pure helpers for course status, enrollment status, sequential lesson availability, safe JSON array parsing, video URL normalization, and R2 key extraction.
- [ ] Add DB-backed helpers for approved enrollment lookup, course access, lesson access, and available lesson selection.
- [ ] Add tests for preview lessons, locked lessons, approved enrollment, revoked enrollment, sequential locking, and URL normalization.
- [ ] Run: `/Users/rahmatullahzisan/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test tests/lms-access.test.mjs tests/lms.test.mjs`

### Task 2: Schema And Migration

**Files:**
- Modify: `src/db/schema.js`
- Modify: `migrations/0009_add_lms_tables.sql`

- [ ] Extend `courses` with publish status, sale price, language, richer descriptions, outcomes, requirements, FAQ, access mode, and certificate flag.
- [ ] Extend `course_lessons` with description, downloadable resources, and download permission.
- [ ] Extend `course_enrollments` with unique user/course constraint, source, approval/revocation metadata, and expiry metadata.
- [ ] Add `course_orders` and `course_payments` for idempotent manual and gateway-ready payment records.
- [ ] Keep existing tables and data compatible by using nullable columns/defaults and `IF NOT EXISTS`.

### Task 3: Protected Lesson Video Endpoint

**Files:**
- Create: `src/pages/api/courses/[id]/lessons/[lessonId]/video.ts`
- Modify: `src/pages/api/admin/upload.ts`
- Modify: `src/pages/api/images/[...path].ts`

- [ ] Add a GET endpoint that checks lesson access on the server before serving video.
- [ ] Stream R2 lesson videos through the Worker with private no-store cache headers and range support where possible.
- [ ] Redirect only sanitized YouTube/Google Drive/embed lesson URLs after access checks, documenting that true URL hiding requires R2 or Cloudflare Stream.
- [ ] Allow admin video uploads to R2 with strict type/extension/size validation.
- [ ] Add `X-Content-Type-Options: nosniff` to R2 file responses.

### Task 4: Enrollment And Payment Integrity

**Files:**
- Modify: `src/pages/api/courses/enroll.ts`
- Modify: `src/pages/api/admin/enrollments/approve.ts`
- Create: `src/pages/api/admin/enrollments/create.ts`
- Create: `src/pages/api/admin/enrollments/revoke.ts`

- [ ] Validate request payloads with Zod.
- [ ] Free courses create approved enrollment idempotently.
- [ ] Paid courses create a pending enrollment plus order/payment records and never mark paid from the frontend.
- [ ] Duplicate pending/approved enrollments return the current state instead of creating duplicates.
- [ ] Admin approval updates enrollment approval metadata and marks related manual payment/order records verified/paid.
- [ ] Admin manual enrollment can grant access without fake payment.
- [ ] Admin revoke removes access by changing status to `revoked`, not deleting history.

### Task 5: Admin LMS UX

**Files:**
- Modify: `src/pages/admin/course-edit.astro`
- Modify: `src/pages/admin/lesson-edit.astro`
- Modify: `src/pages/admin/enrollments.astro`
- Modify: `src/pages/api/admin/courses/create.ts`
- Modify: `src/pages/api/admin/courses/update.ts`
- Modify: `src/pages/api/admin/courses/delete.ts`
- Modify: `src/pages/api/admin/lessons/create.ts`
- Modify: `src/pages/api/admin/lessons/update.ts`

- [ ] Add course status, sale price, language, short/full description, outcomes, requirements, FAQ, access mode, and certificate settings.
- [ ] Add lesson description, R2 video provider/upload, resource JSON, and download permission controls.
- [ ] Add manual enrollment form and revoke action.
- [ ] Block destructive course deletion when enrollment/order/payment history exists; ask admin to unpublish instead.
- [ ] Keep existing visual style and admin navigation.

### Task 6: Student And Public UX

**Files:**
- Modify: `src/pages/courses/[id].astro`
- Modify: `src/pages/courses/[id]/learn.astro`
- Modify: `src/pages/my-courses.astro`
- Modify: `src/pages/courses/[id]/quiz/[quizId].astro`
- Modify: `src/pages/courses/[id]/certificate.astro`

- [ ] Public course details show richer metadata, outcomes, requirements, FAQ, curriculum, reviews, and free-preview states.
- [ ] Public page uses the protected lesson video endpoint for preview videos rather than rendering raw lesson URLs.
- [ ] Learning page uses server-side lesson access, shows locked/current/completed states, supports sequential mode, and renders protected video endpoint URLs.
- [ ] Progress completion remains server-authorized and completes the course/certificate only after all lessons are complete.
- [ ] Student dashboard shows approved, pending, revoked, and completed states clearly.

### Task 7: Verification

**Files:**
- Modify/add focused tests under `tests/`

- [ ] Run focused unit tests for LMS/auth/env/rate-limit.
- [ ] Run production build with bundled Node.
- [ ] Start a local Astro server if possible and smoke `/courses`, a course detail page, and protected redirects.
- [ ] Report broad pre-existing test failures separately from LMS changes.
