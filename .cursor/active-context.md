> **BrainSync Context Pumper** 🧠
> Dynamically loaded for active file: `.dev.vars` (Domain: **Generic Logic**)

### 📐 Generic Logic Conventions & Fixes
- **[what-changed] what-changed in .dev.vars**: + OLLAMA_MODEL=gemma4:31b-cloud
+ OLLAMA_BASE_URL=https://ollama.com/v1
- **[convention] problem-fix in .gitignore — confirmed 3x**: File updated (external): .gitignore

Content summary (78 lines):
# build output
dist/

# generated types
.astro/

# dependencies
node_modules/

# logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# environment variables
.env
.env.production
.dev.vars
.dev.vars.*

# macOS-specific files
.DS_Store

# jetbrains setting folder
.idea/

# Cloudflare / Wrangler
.wrangler/

# Screen recordings & large media
*.mov
*.mp4
*.avi
*.mkv

# IDE and agent config
.agent/
.agent-mem/
.agents/
.brainsync/
.bsync_core/
.cursor/
.vscode/
.windsurfrules
.cursorr
- **[what-changed] what-changed in wrangler.jsonc**: - 	"r2_buckets": [
+ 	"vars": {
- 		{
+ 		"ADMIN_EMAILS": "rahmatullahzisan@gmail.com,rajinsalehbd@gmail.com"
- 			"bucket_name": "ruqyah-healing-images",
+ 	},
- 			"binding": "R2_IMAGES",
+ 	"r2_buckets": [
- 			"remote": true
+ 		{
- 		}
+ 			"bucket_name": "ruqyah-healing-images",
- 	]
+ 			"binding": "R2_IMAGES",
- }
+ 			"remote": true
+ 		}
+ 	]
+ }
+ 

📌 IDE AST Context: Modified symbols likely include [$schema, name, main, compatibility_date, compatibility_flags]
