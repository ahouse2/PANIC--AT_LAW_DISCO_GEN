# Execute BASE PRP — Implementation Plan & Validation

PRP File: PRPs-agentic-codex/PRPs/feature-implementation.md

## Load PRP & Align
- Consume PRD and API contract; confirm endpoints and DTOs.
- Verify sibling repos are mounted (`../neuro-san-studio-2`, `../ag2`).

## ULTRATHINK & Plan
- Sequence work per tasks; keep endpoints minimal but contract-complete.
- Add timings in orchestrator; prefer allowlisted MCP calls.

## Execute Implementation (High-Level Checklist)
1) Orchestrator
- Add Flask blueprint `chat` with `POST /api/agents/orchestrate` calling `ag2_registry_loader.make_orchestrator()` and `GroupChat`.

2) Exhibits & Ingestion
- Implement upload + hash + Bates + extract → vector upsert → chain log.

3) Vector
- Wire count/query to `mcp_vector_database` with `case_id`.

4) Theory Graph
- Wire graph/suggest/accept/reject endpoints to `mcp_knowledge_graph` and suggestion service.

5) Drafting
- Expose `available/generate/export` endpoints bridging `mcp_drafting`. Ensure motion_type supports RFO responsive declaration.

6) Forensics
- Add append-only model/table and `GET /api/forensics/chainlog`.

7) Metrics/Health
- Implement `/api/metrics` and timed `/api/health` checks.

8) UI Shells
- Create basic pages and client hooks for each endpoint. Apply neon/glass CSS from `UI_refs`.

## Progressive Validation
- Level 1: `ruff`, `mypy`.
- Level 2: `pytest -q` (if tests exist).
- Level 3: `npm run build`, `docker compose up --build`, curls listed in PRP.
- Level 4: Draft RFO responsive declaration; check citations; export.

## Completion Verification
- All success criteria from PRP satisfied. Return timing logs and demonstrate drafting output with sources.

