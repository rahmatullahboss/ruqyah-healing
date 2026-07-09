# Active Context — Ruqyah Healing

Updated: 2026-07-09T10:47:00+06:00
Workspace: /Users/rahmatullahzisan/Desktop/Dev/ruqyah-healing
Branch: master

## Current task
Check and fix review follow-up for homepage hero tests.

## Files touched this turn
- `tests/homepage-hero.test.mjs`
  - Added an asset-existence regression test for the four hero background images.
  - Fixed the public asset path base from `../public` to `../public/` so URL resolution stays inside the public directory.
  - Test now verifies both source references and real files exist for all hero slide images.
- `src/components/Hero.astro`
  - Existing hero readability/slider changes remain in the working tree.
- `active-context.md`
- `.ai-bridge/codex-status.md`

## Verification
- First focused test run exposed a bad test path resolution: it looked for `/images/...` outside `public/`.
- After fixing the path, `node --test tests/homepage-hero.test.mjs` passed: 5/5 tests.
- `npm run build` passed successfully.

## Deployment
- Not deployed in this turn because the user did not request deployment.

## Notes
- Full `npm test` was not run because the existing test script includes `tests/smoke.test.mjs`, which expects a running local/target server.
