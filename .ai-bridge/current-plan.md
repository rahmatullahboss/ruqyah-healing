# Demo course seed setup

Updated: 2026-07-09T13:20:00+06:00
Workspace: /Users/rahmatullahzisan/Desktop/Dev/ruqyah-healing
Target agent: Codex (codex)

## Plan

Task: Create professional demo courses from Ruqyah Healing service ideas and make them ready for the Courses section.

Plan:
1. Map existing LMS rules: public courses require `published` status, real image, at least one module, and at least one lesson.
2. Create a reusable demo course catalog in `src/data/demo-courses.js` with deterministic IDs, course metadata, outcomes, requirements, FAQs, modules, text lessons, and quiz content.
3. Refactor `scripts/seed-courses.mjs` so demo courses are idempotently upserted into `courses`, `course_modules`, `course_lessons`, `course_quizzes`, and `course_quiz_questions`.
4. Add focused tests to confirm each demo course is public-ready and has professional LMS structure.
5. Run focused tests plus build/test checks where practical.
6. Update session memory files with files touched, verification, and deployment status.

Constraints:
- Keep content educational and responsible: no guaranteed cure claims, no shirk/unsafe practice positioning, no medical overpromising.
- Use existing image assets under `/images/courses/`.
- Do not deploy without explicit user instruction.
