# Active Context — Ruqyah Healing

Updated: 2026-07-09T15:50:00+06:00
Workspace: /Users/rahmatullahzisan/Desktop/Dev/ruqyah-healing
Branch: master

## Current task
Move the homepage Raqi profile section below the Blog section and deploy.

## Files touched this turn
- `src/pages/index.astro`
  - Moved Bengali Raqi profile section after `রুকইয়া ব্লগ`.
- `src/pages/en/index.astro`
  - Moved English Raqi profile section after `Ruqyah Blog`.
- `tests/homepage-courses-section.test.mjs`
  - Added regression coverage for the Blog → Raqi Profile → Home Service order.
- `.ai-bridge/codex-status.md`
- `.ai-bridge/implementation-diff.patch`

## Verification before deploy
- `node --test tests/homepage-courses-section.test.mjs tests/demo-courses.test.mjs tests/header-translate.test.mjs tests/homepage-hero.test.mjs` passed: 25/25.
- `npm run build` passed.

## Deployment
- Pending after commit and push.

## Notes
- Existing uncommitted homepage course/demo/English content changes were preserved and will be included in the commit/deploy.
