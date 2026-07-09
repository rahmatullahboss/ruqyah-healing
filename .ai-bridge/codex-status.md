# Codex Status — Ruqyah Healing

Updated: 2026-07-09T10:47:00+06:00

## Latest change
Checked and fixed the homepage hero regression tests by adding real public asset existence coverage.

## Files changed this turn
- `tests/homepage-hero.test.mjs`
  - Added `fs.promises.access` checks so the four hero slide images must actually exist under `public/images/`.
  - Fixed the test base URL from `../public` to `../public/`; without the trailing slash, URL resolution incorrectly escaped the public directory.
  - Focused hero test now has 5 assertions groups instead of 4.
- `src/components/Hero.astro`
  - Existing local hero readability/slider changes remain part of the working tree.
- `active-context.md`
- `.ai-bridge/codex-status.md`

## Verification
- Initial focused test run failed on the new asset-existence check because of the test path bug.
- Fixed the path bug.
- `node --test tests/homepage-hero.test.mjs` ✅ passed, 5/5 tests.
- `npm run build` ✅ passed.

## Deployment
Not deployed in this turn. Deploy only after the user explicitly requests deployment.

## Current repository status notes
The hero fix and the new regression tests are still local, uncommitted changes on `master`. Full `npm test` was not run because the repository's test script includes the existing smoke test that requires a running local/target server.
