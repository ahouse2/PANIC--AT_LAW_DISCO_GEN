PANIC—AT_LAW_DISCO_GEN

Badass, neon/glass Legal Discovery suite integrating the existing codebase with AG2/MCP wrappers, live sockets, and an engaging UI. This release repo is trimmed to only what’s needed to run and iterate quickly, with PRPs included for repeatability.

Repo Layout
- App: `neuro-san-studio-2/apps/legal_discovery`
- Tools: `neuro-san-studio-2/coded_tools/legal_discovery`
- Registries: `neuro-san-studio-2/registries`
- AG2/MCP bridge: `panic_at_law_disco_gen/panic_core`
- Config: `panic_at_law_disco_gen/config`
- Compose: `docker-compose.yml`
- PRPs: `PRPs-agentic-codex/PRPs` (PRD, contracts, base PRP, onboarding)
- UI References: `UI_refs/` (mounted into app for styling inspiration)

Quick Start
1) Prerequisites
   - Docker Desktop (or Docker Engine + Compose plugin)
   - Git

2) Clone and checkout the feature branch
   - `git clone https://github.com/ahouse2/PANIC--AT_LAW_DISCO_GEN.git`
   - `cd PANIC--AT_LAW_DISCO_GEN`
   - `git checkout feat/ag2-integration-prp`

3) Set environment (shell session only; do not commit secrets)
   - PowerShell (Windows):
     - `$env:GOOGLE_API_KEY="<your_gemini_api_key>"`
   - bash/zsh (macOS/Linux):
     - `export GOOGLE_API_KEY="<your_gemini_api_key>"`
   - Optional overrides:
     - `DATABASE_URL`, `REDIS_URL`, `NEO4J_URI/USER/PASSWORD`, `QDRANT_HOST/PORT`

4) Build and run
   - `docker compose up --build`
   - App: http://localhost:8080

Services (via Compose)
- legal_discovery: Flask API + prebuilt React UI (gunicorn + eventlet)
- postgres:16-alpine (default trust auth)
- neo4j:5.x (default NEO4J_AUTH=none in dev)
- qdrant/qdrant
- redis:7-alpine

Key Features (UI)
- Command Center (Playbooks + Traces)
  - Playbooks: Case Analysis, Vector Smoke, Draft RFO
  - Binder Rail: enqueue `/api/binder/create` and track via `/api/tasks/{job_id}`
  - Live agent trace chips over Socket.IO (`/chat` namespace)
- Forensics (Chain of custody)
  - Magic Authenticity Chain: hash ? PDF meta ? authenticity (logs to chain)
  - Financial Forensics (uses Gemini when key set)
- Knowledge Graph
  - Subnet load, Cypher runner, Enrich graph, Trace Path
  - Node pulse on click; mini-map auto-updates
- Auto Draft
  - Seed From Theory (uses accepted theories)
  - Citations panel with click-to-open and [CITE] insert at cursor
- Timeline
  - Hover previews (thumbnails/excerpts), date filters, export
- Trial
  - Objection Overlay: Ctrl/Cmd + O
  - Trial HUD (timer): Ctrl/Cmd + T

Endpoints (selected)
- Agents
  - POST `/api/agents/orchestrate` ? emits `agent_trace` + returns `{response, tools, timings}`
  - POST `/api/agents/run_tool?tool=...` (allowlisted MCP wrappers)
- Forensics
  - POST `/api/forensics/hash|pdf_meta|image_meta|authenticity|financial`
- Vector
  - GET `/api/vector/search?q=...&case_id=...&n_results=...`
  - GET `/api/vector/count?case_id=...`
- Theories
  - GET `/api/theories/suggest`
  - POST `/api/theories/accept|reject|comment`
- Drafting
  - GET `/api/drafting/available`
  - POST `/api/drafting/generate`
  - POST `/api/drafting/export`
- Binder / Tasks
  - POST `/api/binder/create`
  - GET `/api/tasks/{job_id}`
- Health & Metrics
  - GET `/api/health`
  - GET `/api/metrics`

Environment Notes
- Set `GOOGLE_API_KEY` to enable:
  - Agent LLM orchestration (Gemini)
  - Drafting (RFO responsive declaration, etc.)
  - Financial forensics (LLM analysis)
- dev defaults (see `panic_at_law_disco_gen/config/settings.sample.env`)
  - `DATABASE_URL=postgresql+psycopg2://postgres@postgres:5432/legal_discovery`
  - `NEO4J_URI=bolt://neo4j:7687` (auth disabled)
  - `QDRANT_HOST=qdrant`, `QDRANT_PORT=6333`

Troubleshooting
- Health: inside container ? `curl -sS http://localhost:5001/api/health`
- Missing frontend static manifest: ensure build completed (`compose up --build` will build UI)
- Vector/Graph empty: ingest sample docs or run Playbooks from Command Center
- Socket issues: gunicorn uses eventlet worker; ensure Compose network is healthy

Developer Tips
- Live edit: UI and server files are mounted; rebuild not always needed for UI changes (Vite build is part of image but static is baked; for tweaks, re-run compose build).
- Agent traces: watch browser console for `agent_trace` payloads.
- UI theme: `src/neon_glass.css`; add `.glass`, `.glow-pulse`, `.animated-border`, `.trace-chip` helpers.
- Socket namespaces: `/chat`, `/present`, `/ws/upload` (depending on feature).

PRPs
- Start here: `PRPs-agentic-codex/PRPs/prp-onboarding.md`
- Planning PRD: `PRPs-agentic-codex/PRPs/feature-prd.md`
- API contract: `PRPs-agentic-codex/PRPs/contracts/legal-discovery-ag2-api-contract.md`
- Base PRP: `PRPs-agentic-codex/PRPs/feature-implementation.md`
- Execute plan: `PRPs-agentic-codex/PRPs/feature-implementation-execute.md`

License / Security
- Do not commit secrets; use env variables
- This repo is structured for local/dev use; apply proper auth/HTTPS in production
