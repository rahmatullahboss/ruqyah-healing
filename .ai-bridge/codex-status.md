# Codex Status — Ruqyah Healing

Updated: 2026-07-09T15:50:00+06:00

## Latest change
Moved the Raqi profile section below the homepage blog section on both Bengali and English homepages.

## Files changed this turn
- `src/pages/index.astro`
  - Raqi profile section now appears after `রুকইয়া ব্লগ` and before `হোম সার্ভিস উপলব্ধ`.
- `src/pages/en/index.astro`
  - English Raqi profile section now mirrors the same order after `Ruqyah Blog`.
- `tests/homepage-courses-section.test.mjs`
  - Added a regression test for Blog → Raqi Profile → Home Service order on both locales.

## Verification
- `node --test tests/homepage-courses-section.test.mjs tests/demo-courses.test.mjs tests/header-translate.test.mjs tests/homepage-hero.test.mjs` ✅ passed, 25/25.
- `npm run build` ✅ passed.

## Deployment
Pending deploy in current turn after commit/push.

## Notes
- Existing homepage course/demo/English translation changes were already in the working tree and were preserved.
