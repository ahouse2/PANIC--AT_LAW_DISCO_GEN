# Prime Core Summary — panic_at_law_disco_gen

Project structure, purpose, key files, and configs for fast onboarding.

## Project Structure
- `README.md` — overview and dev notes for hybrid suite.
- `AGENTS.md` — guidance, scope, and progress for slices.
- `docker-compose.dev.yml` — mounts sibling repos for local dev.
- `config/`
  - `settings.sample.env` — environment variables template.
  - `llm_config.gemini.hocon` — example LLM config.
- `panic_core/` — AG2 bridge and MCP wrappers.
  - `agents/ag2_registry_loader.py` — builds Orchestrator + sub-team agents, binds MCP tools.
  - `mcp/mcp_document_processor.py` — wrap `coded_tools.legal_discovery.document_processor`.
  - `mcp/mcp_vector_database.py` — wrap `coded_tools.legal_discovery.vector_database_manager`.
  - `mcp/mcp_knowledge_graph.py` — wrap `coded_tools.legal_discovery.knowledge_graph_manager`.
  - `mcp/mcp_drafting.py` — wrap `coded_tools.legal_discovery` drafting tools.
- `PRP/`
  - `PRP_PHASE_1.md`, `PRP_PHASE_2.md` — vertical slice plans and validation gates.

## Purpose & Goals
- Integrate existing Legal Discovery app (`../neuro-san-studio-2`) with Autogen 2 (AG2) into a unified, orchestrated system.
- Provide MCP-wrapped tools (ingestion, vector, graph, drafting) usable by agents and via API routes.
- Ship vertical slices with deterministic validation and a high-polish “neon/glass” UI.

## Key Files & Roles
- `panic_core/agents/ag2_registry_loader.py`
  - Creates `orchestrator` and sub-team agents: `document_ingestion`, `legal_analysis`, `vector`.
  - Binds MCP tools via `function_map`; uses Gemini config from env.
- `panic_core/mcp/mcp_document_processor.py`
  - Contract: `mcp_document_processor.extract({ filepath }) -> { text, meta }`.
- `panic_core/mcp/mcp_vector_database.py`
  - Contracts: `add_documents`, `query`, `count` with normalized case-aware manager.
- `panic_core/mcp/mcp_knowledge_graph.py`
  - Contracts: `upsert_document`, `add_fact`, `link_fact_to_element` mapping to Neo4j.
- `panic_core/mcp/mcp_drafting.py`
  - Contracts: `available`, `generate`, `export` for motions/drafts (e.g., responsive declarations).

## Important Dependencies
- Sibling repos mounted in dev:
  - `../neuro-san-studio-2` — Flask app, coded tools, registries.
  - `../ag2` — Autogen 2 agent framework.
- Services expected in stack: Postgres, Redis/RQ, Neo4j, Qdrant.

## Configuration
- `.env` (from `config/settings.sample.env`):
  - `FLASK_SECRET`, `JWT_SECRET`, `POSTGRES_*`, `REDIS_*`, `NEO4J_*`, `QDRANT_*`.
  - `AGENT_MANIFEST_FILE` — path to AG2/registry manifest (HOCON/JSON).
  - `OAI_CONFIG_LIST` or Gemini keys for LLM config.
- LLM defaults (Gemini) via `GOOGLE_API_KEY`, `AG2_DEFAULT_MODEL`.

## Summary
- This project is the AG2 bridge and MCP wrapper hub. It leans on the sibling legal discovery codebase for actual tool logic, exposing consistent contracts for the orchestrator and API to call. Use this summary when wiring endpoints and UI against the MCP/agent contracts.

