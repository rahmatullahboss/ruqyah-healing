# Active Context — Ruqyah Healing

Updated: 2026-07-09T11:05:00+06:00
Workspace: /Users/rahmatullahzisan/Desktop/Dev/ruqyah-healing
Branch: master

## Current task
Add and strengthen test cases for the header Translate option.

## Files touched this turn
- `tests/header-translate.test.mjs`
  - Strengthened the translate dropdown test suite from 5 to 6 test groups.
  - Added explicit coverage that Bangla and English use internal locale alternates.
  - Added coverage that the current internal locale can be highlighted with `option.code === pageLocale`.
  - Added coverage that Urdu and Arabic options expose RTL direction handling through `dir={option.dir}`.
- `active-context.md`

## Verification
- `node --test tests/header-translate.test.mjs` passed: 6/6 tests.
- `npm run build` passed successfully.

## Deployment
- Not deployed in this turn because the user did not request deployment.

## Notes
- The translate feature itself is still local and uncommitted on `master`.
