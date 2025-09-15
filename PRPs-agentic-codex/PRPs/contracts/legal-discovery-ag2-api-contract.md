# API Contract — AG2 Legal Discovery Integration

Feature: using PRPs/feature-prd.md

Base URL: `/api`

## Endpoints

- POST `/api/agents/orchestrate`
  - Body: `{ trace_id?: string, case_id?: string|number, message: string, context?: object }`
  - Response: `{ response: string, tools: [{name:string, duration_ms:number}], timings: {total_ms:number} }`
  - Errors: 400 invalid input; 500 orchestrator/tool errors

- Exhibits
  - GET `/api/exhibits?case_id&search&page&size`
    - Response: `Page<Exhibit>`
  - POST `/api/exhibits`
    - Body: `multipart/form-data` file + `{ case_id: string|number, bates_start?: string }`
    - Response: `Exhibit` (201)
  - PUT `/api/exhibits/{id}` — update metadata
  - DELETE `/api/exhibits/{id}` — 204

- Binder
  - POST `/api/binder`
    - Body: `{ case_id: string|number, exhibit_ids: number[], options?: BinderOptions }`
    - Response: `{ job_id: string }`
  - GET `/api/binder/{job_id}` — `{ status: "queued"|"running"|"done"|"error", url?: string }`

- Theories
  - GET `/api/theories/graph?case_id`
    - Response: `GraphResponse` (nodes/edges with typed labels)
  - POST `/api/theories/suggest`
    - Body: `{ case_id: string|number, limit?: number }`
    - Response: `{ suggestions: TheorySuggestion[] }`
  - POST `/api/theories/accept`
    - Body: `{ suggestion_id: string, comment?: string }`
    - Response: `{ ok: true }`
  - POST `/api/theories/reject`
    - Body: `{ suggestion_id: string, reason?: string }`
    - Response: `{ ok: true }`

- Forensics
  - GET `/api/forensics/chainlog?case_id&action&from&to`
    - Response: `Page<ChainLogEvent>`

- Vector
  - GET `/api/vector/count?case_id`
    - Response: `{ count: number }`
  - POST `/api/vector/query`
    - Body: `{ case_id?: string|number, q?: string, n_results?: number, where?: object }`
    - Response: `{ documents: string[][], metadatas: object[][], ids: string[][] }`

- Drafting
  - GET `/api/drafting/available`
    - Response: `{ motions: string[] }`
  - POST `/api/drafting/generate`
    - Body: `{ motion_type: string, temperature?: number, case_id?: string|number, seed_nodes?: string[] }`
    - Response: `{ content: string, citations?: Citation[] }`
  - POST `/api/drafting/export`
    - Body: `{ content: string, fmt?: "pdf"|"docx", file_path?: string }`
    - Response: `{ path: string }`

- Metrics & Health
  - GET `/api/metrics` — Prometheus-style or JSON snapshot
  - GET `/api/health` — `{ postgres_ms, neo4j_ms, qdrant_ms, redis_ms, ok }`

## DTOs (TypeScript)
```ts
interface Exhibit {
  id: number;
  caseId: string | number;
  name: string;
  batesStart?: string;
  bytes: number;
  mime: string;
  createdAt: string; // ISO
}

interface BinderOptions {
  zip?: boolean;
  includeIndex?: boolean;
}

interface GraphResponse {
  nodes: Array<{ id: string; label: string; type: string; meta?: any }>;
  edges: Array<{ from: string; to: string; type: string; weight?: number }>;
}

interface TheorySuggestion {
  id: string;
  factText: string;
  cause: string;
  element: string;
  score: number;
}

interface ChainLogEvent {
  id: string;
  ts: string; // ISO
  actor: string; // user/service
  action: string; // INGEST|STAMP|REDACT|EXPORT|VERSION
  target: string; // file or exhibit id
  hash?: string;
  meta?: any;
}

interface Citation {
  docId: string;
  page?: number;
  quote?: string;
}

interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
```

## Error Responses
```json
{
  "timestamp": "2025-09-15T10:30:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/exhibits",
  "errors": [
    { "field": "file", "message": "File is required" }
  ],
  "trace_id": "abc123"
}
```

## Validation Rules (shared)
- Auth: Bearer JWT required for mutating endpoints.
- Content-Type: `application/json` (except file uploads).
- Pagination: `page, size, sort`.
- Sorting: `field,asc|desc`.
- Dates: ISO 8601.

## Backend Notes
- Flask blueprints: `auth`, `exhibits`, `binder`, `chat`, `theory`, `forensic`, `tasks`, `metrics`, `drafting`.
- Orchestrator delegates to MCP tools per `panic_core/agents/ag2_registry_loader.py`.
- Validate and sanitize tool args; enforce allowlist.

## Frontend Notes
- Zod schemas mirror DTOs.
- TanStack Query hooks per endpoint; optimistic updates where safe.
- Error toasts with `trace_id` when present.

