name: "BASE PRP — AG2-Integrated Legal Discovery"
description: |
  Implementation PRP using PRPs/feature-prd.md and contracts/legal-discovery-ag2-api-contract.md.
  Goal: one-pass success wiring AG2 orchestrator, MCP tools, API routes, and UI shells.

---

## Goal
Feature Goal
- Deliver orchestrated chat + ingestion + vector + theory graph + drafting (RFO responsive declaration) with immutable chain-of-custody and metrics.

Deliverable
- Modular Flask API with AG2 orchestrator route, MCP bridges to coded tools, endpoints as per API contract, and React UI shells. Background tasks via RQ. Neo4j/Qdrant integrated. Windows-friendly compose.

Success Definition
- All endpoints online and validated; MCP tool calls succeed with timings recorded.
- Vector `count` stable and deterministic; theory suggestions accept/reject flows work.
- Drafting returns structured content and exports to PDF/DOCX.
- Chain-of-custody logs for ingest/stamp/redact/export.

## Context
Paths
- App: `neuro-san-studio-2/apps/legal_discovery/`
- Tools: `neuro-san-studio-2/coded_tools/legal_discovery/`
- Registries: `neuro-san-studio-2/registries/` (`legal_discovery.hocon`, `manifest.hocon`)
- AG2/MCP bridge: `panic_at_law_disco_gen/panic_core/*`

Configs
- `.env` vars: `FLASK_SECRET`, `JWT_SECRET`, `POSTGRES_*`, `NEO4J_*`, `QDRANT_*`, `REDIS_*`, `AGENT_MANIFEST_FILE`, `OAI_CONFIG_LIST` or `GOOGLE_API_KEY`, `UPLOAD_ROOT`.
- LLM defaults: `AG2_DEFAULT_MODEL` (e.g., `gemini-2.5-flash`).

References
- PRD: `PRPs-agentic-codex/PRPs/feature-prd.md`
- API Contract: `PRPs-agentic-codex/PRPs/contracts/legal-discovery-ag2-api-contract.md`
- Agent loader: `panic_core/agents/ag2_registry_loader.py`
- MCP tools: `panic_core/mcp/*.py`

Known Patterns/Gotchas
- Normalize Qdrant collection naming per case; reuse single client instance.
- Neo4j with `MERGE` for idempotent Facts/Elements/COA links.
- Windows path normalization; avoid hard-coded separators.
- Guard MCP args; raise structured errors.

## Implementation Tasks
1. Orchestrator API
   - Add `POST /api/agents/orchestrate` route; wire to `ag2_registry_loader.make_orchestrator()` and group chat.
   - Log per-tool timings; return `{ response, tools, timings }`.

2. Exhibits & Ingestion
   - CRUD endpoints per contract; ingestion pipeline calls `mcp_document_processor.extract` then vector upsert and chain log.
   - Bates stamping via coded tool; return metadata.

3. Vector Service
   - Endpoints: `GET /api/vector/count`, `POST /api/vector/query` passing case_id.
   - Ensure deterministic collection names and payload ids `doc:chunk`.

4. Theory Graph
   - Endpoints: `GET /api/theories/graph`, `POST /api/theories/suggest`, `POST /api/theories/accept|reject`.
   - Bridge to `mcp_knowledge_graph` and suggestion service.

5. Drafting Workbench
   - Endpoints: `GET /api/drafting/available`, `POST /api/drafting/generate`, `POST /api/drafting/export`.
   - Motion type includes "Responsive Declaration to RFO (Move-Away)".

6. Forensics & Chain-of-Custody
   - Append-only table/model, `log_event()` utility, `GET /api/forensics/chainlog` with filters.

7. Metrics & Health
   - `/api/metrics` snapshot; `/api/health` with component timings.

8. UI Shells (React)
   - Chat, Exhibits, Theory Graph, Drafting, ChainLog, Metrics sections with neon/glass skin from `UI_refs/`.
   - Voice widget for chat; a11y essentials.

## Validation Gates
Level 1 — Style & Types
- In `neuro-san-studio-2/apps/legal_discovery/`: `ruff check .`, `mypy .` (when configured)

Level 2 — Unit Tests
- `pytest -q` where tests exist.

Level 3 — Integration
- Frontend: `npm ci && npm run build`
- Compose: `docker compose up --build`
- Smoke:
  - `curl localhost:5001/api/health`
  - `curl -X POST localhost:5001/api/agents/orchestrate -H "Content-Type: application/json" -d '{"message":"find facts about Exhibit A"}'`
  - `curl localhost:5001/api/vector/count`
  - `curl localhost:5001/api/theories/graph?case_id=demo`
  - `curl localhost:5001/api/drafting/available`

Level 4 — Drafting QoS
- Generate RFO responsive declaration; ensure ≥ 3 citations; export PDF; manual spot-check.

## Final Checklist
- [ ] Orchestrator endpoint returns response + timings
- [ ] Ingestion logs chain-of-custody events
- [ ] Vector count deterministic; query returns hits
- [ ] Theory suggestions usable; accept/reject updates graph
- [ ] Drafting endpoints working; RFO responsive draft exported
- [ ] Health/metrics populated; JWT on mutating routes

## Confidence Score
8.5/10 — Clear contracts and scaffolds exist; remaining work is wiring and UI polish.

