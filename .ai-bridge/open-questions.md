# Open Questions

- 2026-07-04 CodexPro audit:
  - Should this project be aligned to the newer FitBD posture by setting persistent `toolMode=full`?
  - Should `codexSessions` remain `off`, or should it be changed to `read` like the currently running HMS setup?
  - Should a root `.mcp.json` be added for local stdio MCP clients, or is the saved `~/.codexpro` HTTP/tunnel profile enough?
- _(Resolved 2026-06-25: CodexPro profile provisioned. Tunnel `ruqyah` created, DNS CNAME added for `ruqyah.online-bazar.top`, profile written at `~/.codexpro/profiles/909ca72be28dc2c943ab4abc.json`, placeholder URLs replaced in `.ai-bridge/agent-rules.md` and `active-context.md`.)_
- Whether to commit the bootstrap edits as one commit or split. Default: one commit (`chore(agent): adopt CodexPro session memory`).
