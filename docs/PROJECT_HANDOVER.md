# Ruqyah Healing — Project Handover

Last reviewed: 2026-07-10

## 1. System overview

Ruqyah Healing is an Astro SSR application deployed on Cloudflare Workers. It includes:

- Public Bengali/English website, blog, condition pages and downloadable resources
- Consultation/appointment booking with payment reference capture
- User registration, login, Google sign-in, profile and password reset
- LMS with courses, modules, lessons, quizzes, progress, reviews, enrollment approval and certificates
- Admin panel for appointments, users, LMS content, enrollments, blog posts, notices, products, resources, testimonials, settings, audit logs and AI usage

## 2. Technology

- Astro 6 SSR
- Cloudflare Workers and Assets
- Neon PostgreSQL
- Drizzle ORM
- Cloudflare R2 for uploaded files and private course videos
- Cloudflare KV for sessions/AI budget
- Cloudflare Workers AI
- Resend for password-reset email
- Zod for request validation

## 3. Important folders

- `src/pages/` — public pages and server-rendered routes
- `src/pages/api/` — API endpoints
- `src/pages/admin/` — admin interface
- `src/lib/` — auth, LMS, booking, validation and shared logic
- `src/db/schema.js` — database schema
- `migrations/` and `drizzle/` — database migrations
- `public/` — static assets
- `tests/` — unit/regression/production tests
- `wrangler.jsonc` — Cloudflare bindings and deployment config

## 4. Required runtime configuration

Set secrets through `wrangler secret put <NAME>` and never commit them.

Required:

- `DATABASE_URL` — Neon PostgreSQL connection string
- `JWT_SECRET` — strong random secret, minimum 16 characters
- `ADMIN_EMAILS` — comma-separated admin email addresses

Required for password reset:

- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `PUBLIC_SITE_URL` — canonical HTTPS site origin, for example `https://ruqyahhealing.com`

Optional integrations:

- `GOOGLE_CLIENT_ID`
- `GA_API_SECRET`
- `META_ACCESS_TOKEN`
- `META_TEST_EVENT_CODE`
- `PUBLIC_GA_MEASUREMENT_ID`
- `PUBLIC_META_PIXEL_ID`

Cloudflare bindings expected:

- `SESSION` — KV namespace
- `AI_BUDGET` — KV namespace
- `R2_IMAGES` — R2 bucket
- `AI` — Workers AI binding
- `ASSETS` — static assets binding

## 5. Local setup

```bash
npm ci
npm run dev
```

`npm run dev` does not fully emulate Cloudflare APIs. For API and binding testing use:

```bash
npm run pages:dev
```

Local secrets belong in `.dev.vars`; this file is ignored by Git.

## 6. Verification commands

Server-independent test suite:

```bash
npm test
```

Production build:

```bash
npm run build
```

Production smoke and diagnosis route tests:

```bash
TEST_URL=https://your-production-domain.example npm run test:production
```

Dependency audit:

```bash
npm audit --omit=dev
```

## 7. Deployment

```bash
npm run deploy
```

Current Worker target:

- `https://ruqyah-healing.rahmatullahzisan.workers.dev`

The production branch in this repository is `master`.

## 8. Core operating workflows

### Appointment booking

1. Patient selects a future date and an available configured slot.
2. Server validates contact details, treatment selection, payment method and transaction reference.
3. PostgreSQL transaction locks prevent simultaneous duplicate slot booking.
4. Duplicate payment transaction references are rejected.
5. Admin confirms, completes, cancels or edits the booking from the admin panel.
6. Appointment changes are written to audit logs.

### LMS enrollment

1. User registers or logs in.
2. User enrolls in a published, ready course.
3. Free courses can be approved automatically; paid enrollment remains pending for admin verification.
4. Admin approves/revokes access and may set an access expiry date.
5. Lesson, video, progress, quiz and review endpoints verify active enrollment.
6. Completed eligible courses provide a certificate page.

### Admin access

- `/admin/*` is protected by middleware and route-level role checks.
- Admin identity is determined by database role and configured `ADMIN_EMAILS`.
- Sensitive changes such as role, appointment, enrollment and content operations are audited where implemented.

## 9. Security and reliability changes included in the handover review

- Booking payload and Bangladesh phone normalization hardened
- Past/far-future dates and unknown appointment slots rejected
- Transaction-level booking slot locks added
- Duplicate payment reference prevention added
- LMS expiry enforced across learning, progress, reviews and user course views
- Password-reset link fixed and reset tokens stored as SHA-256 hashes
- Password-reset origin no longer trusts the incoming request host
- Account email/phone normalization and duplicate-race handling added
- Admin appointment, user, notice, product and resource validation improved
- Quiz submission payload limits and timed-quiz validation added
- R2 old-file cleanup happens after successful database updates
- Video byte-range suffix handling corrected
- Unit tests separated from tests that require a running server

## 10. Operational notes and remaining non-blocking work

- Database backups are an infrastructure responsibility; configure scheduled Neon backups/retention and verify restore procedures.
- The in-memory request limiter is per Worker isolate. For strict global limits, move counters to Cloudflare KV, Durable Objects or a dedicated rate-limit service.
- Timed quizzes validate the submitted start timestamp, but a high-stakes exam system should use a server-issued signed attempt token/start record.
- `astro check` still reports legacy typing issues in some browser scripts/admin pages even though the production build and test suite pass. These should be cleaned incrementally rather than with a risky broad rewrite immediately before handover.
- Avoid running `npm audit fix --force` without a separate upgrade branch because it may introduce major-version framework changes.

## 11. Handover checklist

- Confirm production domain DNS and Cloudflare route
- Confirm all required secrets and bindings in the production environment
- Test one real registration/login/password-reset flow
- Test one paid enrollment approval and one free course flow
- Test one appointment submission, reschedule and cancellation
- Verify R2 upload/download and private video streaming
- Verify Resend sender domain and delivery
- Export/verify a Neon database backup
- Transfer access to GitHub, Cloudflare, Neon, Resend and analytics accounts
- Rotate credentials after ownership transfer
