# CodexPro Agent Rules — Ruqyah Healing

> Generated from project's AGENT.md / AGENTS.md / CLAUDE.md on 2026-06-25.
> Profile-specific fields are placeholders — `codexpro setup` fills them in.

## Stack

- Astro 6 SSR (Cloudflare Workers adapter)
- Neon Postgres via Drizzle ORM
- Vanilla CSS only — no Tailwind, no CSS modules
- JWT auth (`jose`) + PBKDF2 password hashing
- Zod validation
- Node ≥ 22.12.0

## 🛡️ Global Safety Rules

- **NEVER** run `git clean -fd` or `git reset --hard` without checking `git log` and verifying commits exist.
- **NEVER** delete untracked files or folders blindly. Always backup or stash before bulk edits.
- **NEVER** run `rm -rf`, `del /s`, `rmdir`, `format`, or any destructive filesystem command without EXPLICIT user approval.
- **NEVER** run `DROP TABLE`, `DELETE FROM`, `TRUNCATE`, or any destructive database operation.
- **NEVER** run `git push --force`, `npm publish`, `docker rm`, `terraform destroy`, or any irreversible command.
- **NEVER** pipe remote scripts to shell (`curl | bash`, `wget | sh`).
- **ALWAYS** ask before commands that modify system state, install packages, or make network requests.
- When in doubt, **show the command first** and wait for approval.

## 🏛️ Core Architecture Rules

- Follow existing project patterns — don't introduce a different style.
- **NEVER use Tailwind** — vanilla CSS only. `src/styles/global.css` is the source of truth.
- Don't generate code with `any` type — define proper TypeScript types.
- Always handle loading/error states — don't just render data.
- Don't use deprecated APIs — check library version, use current API.
- Check existing code before creating utility functions — avoid duplicates.
- Bengali-first: UI strings, error messages, and labels are in বাংলা. Do not translate to English in the UI.
- API routes live in **two** places: `src/pages/api/` (Astro, named exports `GET/POST/OPTIONS` with `prerender = false`) and `functions/api/` (Cloudflare Functions, `onRequestPost/onRequestOptions`). Both import from `src/db/client.js` and `src/lib/`.
- Cloudflare env via `import { env } from 'cloudflare:workers'` with `process.env` fallback for Node test compatibility — don't break either path.
- IDs are `text` type (UUIDs generated in application code), timestamps use `withTimezone: true`.

## 📐 Conventions

- Version your API from day 1 — use `/api/v1/`.
- Use consistent response format: `{ ok: true, ... }` for success, `{ error: string, message: string }` for errors.
- Implement soft delete for important data.
- Handle timezone correctly — store UTC, display in user's timezone.
- Mobile-first responsive layouts.
- Disable submit button during form submission.
- Always add empty states ("No items yet" with CTA).
- Always add error states with retry button.
- Prefer Array methods (`map`, `filter`, `reduce`) over manual loops.
- Enable strict mode in `tsconfig.json`.
- Don't use arbitrary CSS values when a utility class or token exists.

## ⚠️ Known Fragile Areas

- **`npm run dev` only runs Astro** — API endpoints under `/api/*` require `npm run pages:dev` (build + Wrangler Pages dev) to function. Tests must use `node --test`.
- **`functions/api/appointments.ts` is a separate Cloudflare Functions handler**, not an Astro route. It has its own CORS and response helpers — don't merge.
- **`worker-configuration.d.ts` is auto-generated** by `wrangler types` — don't edit manually.
- **`src/data/*.js` are imported at build time** by `astro.config.mjs` for sitemap generation — changes require restart.

## ⚠️ Notes

- This project has a real `.dev.vars` file with secrets. CodexPro's `BLOCKED_GLOBS` blocks `**/.dev.vars*` and `**/.env*`, so the agent will refuse to read it. If you genuinely need access, ask the user to share values via chat instead.

## 🧭 Local MCP Context

- Workspace root: `/Users/rahmatullahzisan/Desktop/Dev/ruqyah-healing`
- CodexPro profile: `~/.codexpro/profiles/909ca72be28dc2c943ab4abc.json`
- Public MCP URL: `https://ruqyah.online-bazar.top/mcp?codexpro_token=4ec2b850089adf35897094f657dfd3044f60da09fc99d417`
- Local MCP URL: `http://127.0.0.1:8793/mcp`
- Mode: `agent`, write: `workspace`, bash: `full`, auth: **on** (token in URL)

> Daily use: `cd "/Users/rahmatullahzisan/Desktop/Dev/ruqyah-healing" && codexpro start`.

## 🔗 Handoff Notes

- Plans in `.ai-bridge/current-plan.md`, status in `codex-status.md`, decisions in `decisions.md`, open questions in `open-questions.md`.

> Don't ask the user to confirm every read/edit/bash. Apply the safety rules. Confirm only on `git push`, deploy, install, schema changes, irreversible ops.

## 🚦 Mandatory Superpowers Skills

Use the `Skill` tool to invoke these skills at the right moment. Skipping them is a protocol violation.

- **`superpowers:using-superpowers`** — invoke FIRST, before responding to any user message. Establishes how to find and use skills.
- **`superpowers:brainstorming`** — invoke BEFORE any planning, design, or non-trivial implementation. Brainstorm first, plan second, code third.
- **`superpowers:writing-plans`** — invoke when a plan is needed before implementation. Plans contain approach and steps only — NO code blocks in plans.
- **`superpowers:execute-plan`** — invoke when actually executing a written plan.
- **`superpowers:test-driven-development`** — invoke when adding tests or test-driven features.
- **`superpowers:systematic-debugging`** — invoke BEFORE attempting any bug fix. Always debug first, patch second.
- **`superpowers:verification-before-completion`** — invoke before claiming a task is done. Verify, then state completion.
- **`superpowers:requesting-code-review`** — invoke at major milestones or before merging significant work.
- **`superpowers:receiving-code-review`** — invoke when receiving review feedback; do not silently ignore review input.

> 1% rule: even a small chance a skill applies means invoke it. Skills override default behavior but user instructions are highest priority.

## 🔄 Session Memory Files (Maintain Every Turn)

These MD files are the project's persistent memory across ChatGPT sessions via CodexPro. Update them at the appropriate moment — do not let them go stale.

| File | When to update |
|---|---|
| `active-context.md` (project root) | **Every turn** while work is in progress: current task, branch, files touched this session, pending decisions, blockers, next concrete step |
| `.ai-bridge/current-plan.md` | **Before any non-trivial work.** Approach and steps only — never code blocks |
| `.ai-bridge/project-map.md` | **Whenever you explore or map the codebase.** Persistent codebase map the next session reads to skip rediscovery |
| `.ai-bridge/codex-status.md` | After each meaningful change: files touched, tests run, results, blockers, next GPT review focus |
| `.ai-bridge/decisions.md` | When an architectural decision is made and should remain stable |
| `.ai-bridge/open-questions.md` | When something is unresolved and the next session needs to pick it up |

The four files — `active-context.md`, `.ai-bridge/current-plan.md`, `.ai-bridge/project-map.md`, and this `agent-rules.md` — are the session memory. They must always reflect reality.

### `active-context.md` shape (template)

```markdown
# Active Context — <project-name>
> Updated: <ISO date>

## Current task
<one-line focus>

## Branch / worktree
<branch name>

## Files touched this session
- <path> — <what changed>
- <path> — <what changed>

## Pending decisions
- <open question or "none">

## Blockers
- <blocker or "none">

## Next concrete step
<single next action>
```

### `.ai-bridge/current-plan.md` rules

- Approach and steps only.
- No code blocks. Step descriptions reference files and APIs by name.
- Numbered steps. Each step has: goal, files to touch, verification.

### `.ai-bridge/project-map.md` rules

- High-level architecture diagram in ASCII or list.
- Module → routes → schemas → migrations map.
- "Where things live" cheat sheet for the next session.
- Update when you discover a new module or a module's responsibility shifts.