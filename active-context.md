# Active Context — Ruqyah Healing

Updated: 2026-07-08T13:24:00+06:00
Workspace: /Users/rahmatullahzisan/Desktop/Dev/ruqyah-healing
Branch: master

## Current task
Remove duplicate course section from homepage.

## Files touched this turn
- `src/pages/index.astro`
  - Removed the older duplicate course section labeled “রুকইয়াহর কোর্সসমূহ”.
  - Kept the newer “আমাদের কোর্স সমূহ” preview section.
  - Removed unused old `.course-card`/`.course-grid` CSS for the deleted section.

## Verification
- Search confirms only `courses-preview-section` remains in `src/pages/index.astro`.
- `npm run build` passed successfully.

## Deployment
- Not deployed in this turn because the user asked to remove the section but did not explicitly request deploy.

## Notes
- There were existing unrelated uncommitted changes before this task. They remain in the working tree.
