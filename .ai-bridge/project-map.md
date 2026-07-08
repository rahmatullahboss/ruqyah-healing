# Project Map — Ruqyah Healing

> Reference: `package.json` for scripts, `astro.config.mjs` for adapter, `src/db/schema.js` for Drizzle schema, `src/middleware.js` for request chain.

## High-level architecture

```
Browser
   ↓
Cloudflare Pages  ←  Astro SSR  ←  Cloudflare Functions (legacy)
                         ↓                 ↓
                  src/middleware.js   functions/api/
                  (rate → auth →      (e.g. appointments.ts)
                   route guard)
                         ↓
                  src/lib/*  (auth, posts, appointments, …)
                         ↓
                  src/db/client.js  →  Neon Postgres (Drizzle ORM)
                         ↑
                  src/pages/api/*  (Astro API routes)
```

## Where things live

- `src/pages/` — Astro routes and API endpoints (`*.astro`, `pages/api/*.ts`)
- `src/components/` — Reusable `.astro` components (React only where interactivity is needed)
- `src/lib/` — Domain logic (auth, posts, appointments, validations)
- `src/db/client.js` + `src/db/schema.js` — Drizzle DB client + schema
- `src/middleware.js` — Rate limit + JWT auth + route guard
- `src/data/` — Static seed data (conditions, glossary, audiences, locations)
- `src/styles/global.css` — Single vanilla-CSS stylesheet
- `functions/api/` — Legacy Cloudflare Functions (separate handler)
- `drizzle/` — Generated SQL migrations
- `migrations/` — Older/manual migrations
- `scripts/` — DB seed, build helpers, content backfill
- `tests/` — `node --test` unit + smoke tests

## Homepage map

- Main homepage: `src/pages/index.astro`
  - Data arrays near top: `services`, `packages`, `videos`, FAQ data.
  - Services section renders `services.map(...)` with `src/components/ServiceCard.astro`.
  - “আমাদের ভিডিও” section sits directly after the services section and before courses.
  - Video cards use inline YouTube embed iframes from the `videos` array.
  - Homepage-specific CSS, including `.video-grid`, `.video-card`, and `.video-embed`, lives in the same Astro file.
- `src/components/ServiceCard.astro` controls individual service card visual rendering.
- `public/images/services/` stores service SVG assets referenced by the `services` array.

## Module → routes → schema → migrations

- To be filled after first mapping pass.

## CodexPro / local MCP setup

- Upstream package: `codexpro@0.28.5` installed globally at `/Users/rahmatullahzisan/.hermes/node/bin/codexpro`; npm latest checked on 2026-07-04 is also `0.28.5`.
- Workspace profile: `~/.codexpro/profiles/d2ba8957be0e9ca622afd40f.json`.
  - root: `/Users/rahmatullahzisan/Desktop/Dev/ruqyah-healing`
  - port: `8793`
  - tunnel: `cloudflare-named`
  - hostname: `ruqyah.online-bazar.top`
  - tunnel name: `ruqyah`
  - mode: `agent`
  - bash: `full`
  - write: `workspace`
  - tool mode: default `standard`
- Runtime profile: `~/.codexpro/runtime/d2ba8957be0e9ca622afd40f.json`, endpoint `https://ruqyah.online-bazar.top/mcp`, local base `http://127.0.0.1:8793`.
- Process shape when running: `codexpro start` -> `dist/http.js` -> `cloudflared tunnel run --url http://127.0.0.1:8793 ruqyah`.
- MCP protocol smoke check on 2026-07-04:
  - local `/mcp` without token: `401`.
  - local `/mcp` with token: [REDACTED_SECRET].
  - public `/mcp` without token: `401`.
  - public `/mcp` with token: [REDACTED_SECRET].
  - `tools/list`: 15 tools, matching `toolMode=standard`.
- Local editor MCP file: `.vscode/mcp.json` contains only the BrainSync stdio server.
- There is no root `.mcp.json` for CodexPro stdio client integration.
- Compared with FitBD: FitBD uses `toolMode=full` and a repo-local `.mcp.json` / desktop config posture with `--bash full`, `--write workspace`, and `--tool-mode full`. Ruqyah currently works but is not aligned with that newer full-mode setup.
