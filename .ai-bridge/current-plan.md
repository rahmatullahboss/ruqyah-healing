# Homepage hero test cases

Updated: 2026-07-09T04:38:22.544Z
Workspace: /Users/rahmatullahzisan/Desktop/Dev/ruqyah-healing
Target agent: Codex (codex)

## Plan

Task: Add regression tests for the homepage hero readability/slider changes.

Plan:
1. Add a focused Node test file under `tests/` that reads `src/components/Hero.astro` as source text.
2. Assert the hero has the new slider container, default `data-active-slide`, four slide image layers, and one CSS mapping per slide.
3. Assert the typewriter script updates `data-active-slide`, guards against duplicate initialization, and handles reduced motion by showing static text.
4. Assert readability/contrast tokens remain present: strong overlay, solid hero-card background, text shadows, mobile overlay, and corrected Bengali typo.
5. Run the new focused test and `npm run build`.
6. Update active context and Codex status with files touched and verification.

Constraints:
- Keep tests lightweight and compatible with the existing `node --test tests/*.test.mjs` setup.
- Do not deploy.
- Preserve unrelated working tree changes.

## Implementation contract

- Work from this plan in small, reviewable steps.
- Keep edits scoped to the requested task and existing project conventions.
- Run focused verification before handing work back.
- Update .ai-bridge/agent-status.md with files touched, checks run, results, blockers, and review notes.
- Save the final review diff to .ai-bridge/implementation-diff.patch when practical.
- Append notable execution events to .ai-bridge/execution-log.jsonl when the implementation agent supports logging.
