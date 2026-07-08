# Decisions

## 2026-07-04: Current CodexPro posture

- Treat the current `ruqyah-healing` CodexPro profile as functional but not fully aligned with the newer FitBD setup.
- Current effective posture is `bash=full`, `write=workspace`, `toolMode=standard`, and `codexSessions=off` on port `8793` through the `ruqyah` Cloudflare named tunnel.
- Do not assume `.vscode/mcp.json` is CodexPro; it currently configures BrainSync only.
- If the user asks for "same as FitBD" or "full authorize", update the profile to `toolMode=full` and consider adding root `.mcp.json` with the same `--bash full`, `--write workspace`, `--tool-mode full` posture, then restart/reconnect MCP clients.

## 2026-06-25: CodexPro bootstrap

- Mirror the session-memory layout used in `monitoring bot` and `B2B Hardware` (`.ai-bridge/` + root `active-context.md` + AGENTS.md blocks).
- Place CodexPro profile-specific fields (`token`, `port`, `hostname`) as placeholders in `.ai-bridge/agent-rules.md` so `codexpro setup` can fill them on first run.
- Do not touch any application code, migrations, or `wrangler.jsonc` during bootstrap.

## 2026-06-25: Tunnel + profile provisioning (revised)

- User authorized the agent to provision the Cloudflare named tunnel directly instead of asking the user to run `codexpro setup` interactively.
- Used `cloudflared tunnel create ruqyah` and `cloudflared tunnel route dns ruqyah ruqyah.online-bazar.top` to provision the DNS-backed tunnel — same pattern as the user's 6 existing tunnels (`monbot`, `b2bhw`, `compositor`, `aff`, `hmscodex2`, `scalius`).
- Profile written directly to `~/.codexpro/profiles/909ca72be28dc2c943ab4abc.json` with port 8793 (next free slot after the user's existing 8787–8792).
- Token generated with `openssl rand -hex 24` to match the user's existing 48-char hex format.
- MCP server started in background; placeholder fields in `agent-rules.md` and `active-context.md` filled with the real values.
- Bash mode was originally documented as `safe`, but current profiles/runtime show `full`; keep future audits based on current profile/runtime evidence rather than the older note.
