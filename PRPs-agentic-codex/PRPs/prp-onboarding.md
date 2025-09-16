name: "PRP Onboarding — Legal Discovery + AG2/MCP"
description: |
  Quick-start onboarding for maintainers to understand PRP usage, repo layout,
  and the agentic + UI architecture. Keep this updated as features evolve.

---

## Overview
- App: `neuro-san-studio-2/apps/legal_discovery/`
- Tools: `neuro-san-studio-2/coded_tools/legal_discovery/`
- AG2/MCP bridge: `panic_at_law_disco_gen/panic_core/`
- Compose: `docker-compose.yml` (includes Postgres, Redis, Neo4j, Qdrant)
- PRPs: `PRPs-agentic-codex/PRPs` (PRD, API contract, base PRP, execute plan)

## Runbook
- Setup: export `GOOGLE_API_KEY` for LLM features (drafting, forensics)
- Run: `docker compose up --build`
- App URL: http://localhost:8080

## Key Panels & Flows
- Command Center
  - Playbooks: Case Analysis, Vector Smoke, Draft RFO
  - Binder Rail: enqueue and track `/api/binder/create` jobs
  - Live agent traces over Socket.IO (`agent_trace`)
- Forensics
  - Magic Authenticity Chain: `/api/forensics/hash|pdf_meta|authenticity`
  - Financial Forensics: `/api/forensics/financial`
- Knowledge Graph
  - Subnet load, Cypher runner, Enrich, Trace Path (node click → From/To)
- Auto Draft
  - Seed From Theory: pulls accepted theories → seeds draft
- Timeline
  - Hover previews, range filters, export; capture hover images
- Trial
  - Objection Overlay: Ctrl/Cmd + O; Trial HUD: Ctrl/Cmd + T

## Agentic Wiring
- Orchestrator endpoint: `POST /api/agents/orchestrate`
  - Emits `agent_trace` and `agent_response` to `/chat` namespace
- MCP wrappers: under `panic_core/mcp/*` (vector, knowledge_graph, forensics, drafting)
- AG2: `panic_core/agents/ag2_registry_loader.py` (scaffolded; fallback in place)

## API Contract
- See `PRPs-agentic-codex/PRPs/contracts/legal-discovery-ag2-api-contract.md`
- Highlights: `/api/vector/*`, `/api/theories/*`, `/api/forensics/*`, `/api/drafting/*`, `/api/tasks/*`, `/api/binder/*`

## PRP Artifacts
- PRD: `feature-prd.md`
- Base PRP: `feature-implementation.md`
- Execute: `feature-implementation-execute.md`
- Prime Core: `prime-core-panic_at_law_disco_gen.md`

## Style & Motion
- Theme: `src/neon_glass.css` (neon/glass, pulses, float, animated borders)
- UI Refs: mounted at `/static/ui_refs/*`, linked in `index.html`

## Validation
- Health: `/api/health` (Neo4j/Qdrant/Postgres/Redis)
- Agent tool smoke: `/api/agents/run_tool`
- Vector: `/api/vector/search`
- Drafting: `/api/drafting/generate` (RFO motion template) and `/export`

## Common Gotchas
- Ensure `GOOGLE_API_KEY` set for LLM-backed features (drafting/financial)
- Graph upserts rely on Neo4j availability; see `/api/health`
- Windows paths: use container paths for server-side file ops (e.g., `/usr/src/app/uploads/...`)

## Contributing
- Keep PRPs updated with new endpoints/flows
- Prefer MCP wrappers for new tools; expose via `/api/agents/run_tool` allowlist
- Emit `agent_trace` events for long operations for better UX

