## Summary

AG2-integrated Legal Discovery with neon/glass UI, MCP wrappers, sockets-based interactions, and PRP docs. Adds Command Center (playbooks, binder rail, live traces), forensic chains with chain-of-custody, Knowledge Graph enhancements, Drafting workbench (RFO ready) with Seed From Theory + citations, Timeline glass UI, and Trial overlays.

## Changes
- Backend
  - Orchestrator endpoint (`POST /api/agents/orchestrate`) with `agent_trace` events
  - Forensics REST wrappers (`/api/forensics/hash|pdf_meta|image_meta|authenticity|financial`)
  - Binder enqueue (`POST /api/binder/create`) and tasks (`GET /api/tasks/{id}`)
- MCP wrappers: vector, knowledge_graph, forensics, drafting
- UI (neon/glass + motion)
  - Command Center (playbooks, binder rail, health, trace chips)
  - Forensics chain UI (log, metadata, report)
  - Knowledge Graph (pulse, trace glow, mini-map)
  - Auto Draft (Seed From Theory, citations panel with [CITE] insert)
  - Timeline (glass, hover previews, export)
  - Overview (real sparklines, deltas)
  - Upload (socket LEDs for steps + ETA)
  - Trial overlays (Objections Ctrl/Cmd+O, Trial HUD Ctrl/Cmd+T)
- PRPs: onboarding, PRD, API contract, base + execute plans

## How To Run
1. Set env (do not commit secrets):
   - PowerShell: `$env:GOOGLE_API_KEY="<YOUR_KEY>"`
   - bash/zsh: `export GOOGLE_API_KEY="<YOUR_KEY>"`
2. `docker compose up --build`
3. Open http://localhost:8080

## Validation
- Health: `/api/health` OK for postgres/neo4j/qdrant/redis
- Command Center: Playbooks run; traces stream
- Forensics: Magic chain works and logs to chain-of-custody
- Graph: Enrich, Cypher, Trace Path; node pulse + mini-map
- Drafting: Seed From Theory; [CITE] insertion
- Timeline: loads events; hover previews; export

## Notes
- LLM features require `GOOGLE_API_KEY`
- Dev defaults in `panic_at_law_disco_gen/config/settings.sample.env`
