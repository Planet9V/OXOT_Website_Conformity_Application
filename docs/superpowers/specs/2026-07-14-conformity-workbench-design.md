# OXOT Conformity — Workbench, xBOM Vault, Flow Engine, Demo Front Door

- **Date:** 2026-07-14
- **Status:** Approved (build all phases, autonomous)
- **Owner:** Agent build

## Vision

Turn the Conformity app from a classification + document tool into an **iterative
compliance workbench**: a single cockpit where a user drives a product to
"auditor-ready" with a workspace-aware AI guide, a unified BOM vault, admin-authored
flows, and a provenance ledger — fronted by a polished demo experience for launch.

## Phases (built in order, each verified)

- **Phase 0 — Demo Front Door:** alternate demo login (`oxotdemo`), a public explainer
  landing, an authed process overview, a seeded demo sandbox, and a first-run tour.
- **Phase 1 — Workbench + Workspace-aware Assistant:** one cockpit per assessment
  unifying stage/worklist/evidence/artifacts/BOMs/provenance + a docked assistant that
  sees the product, assessment, answers, evidence and BOMs.
- **Phase 2 — xBOM Vault + Flow Builder + Provenance:** generic typed-inventory engine
  (SBOM/CBOM/HBOM/OpsBOM/SaaSBOM/ProcessBOM) with parse → store → provenance → analyze →
  auto-embed + per-type configurable checklist; admin-authored flows with typed steps and
  tracked runs; an audit/chain-of-custody ledger.

## Architecture

- Monorepo: `artifacts/conformity` (React+Vite+wouter), `artifacts/api-server` (Express),
  shared `lib/db` (Drizzle), `lib/api-spec` (OpenAPI → Orval → `@workspace/api-zod` +
  `@workspace/api-client-react`). Contract-first: edit `openapi.yaml`, run codegen, then
  implement routes (import exact zod names) and wire the generated hooks.

### Auth & demo model
- Session token payload extends `{username, exp}` → `{username, exp, role}` where
  `role ∈ {admin, demo}`; tokens without a role decode as `admin` (back-compat).
- Demo credentials are **intentionally public** (shown on the demo login page), so they
  live as env-overridable defaults in `adminAuth.ts` (`DEMO_USERNAME`/`DEMO_PASSWORD`),
  not as protected secrets.
- `requireAdmin` = role `admin` only (integration settings, SEO, publish stay admin-only).
- New `requireAuth` = role `admin` OR `demo` — guards the conformity workbench, assistant,
  BOM and flow routes so the demo user can actually *do* things in the seeded sandbox.

### Data model additions (Phase 2)
- `conformity_boms` — assessmentId, bomType, format, name, objectPath, fileName, fileHash,
  componentCount, findingCount, status, checklist (jsonb), meta (jsonb), provenance (jsonb).
- `conformity_bom_components` — bomId, name, version, componentType, purl, supplier,
  licenses, hashes, cryptoProperties (jsonb), findingCount, raw (jsonb).
- `conformity_bom_findings` — bomId, componentId?, findingType, identifier, severity, title,
  description, source, detail (jsonb).
- `conformity_flows` — key, name, description, appliesTo (jsonb), steps (jsonb typed:
  activity | question | checkpoint | artifact | investigation), isTemplate, sortOrder.
- `conformity_flow_runs` — flowId, assessmentId, status, assignee?, stepStates (jsonb).
- `conformity_activity` — assessmentId?, entityType, entityId?, action, actor, source,
  hash?, summary, detail (jsonb) — the provenance / chain-of-custody ledger.
- `conformity_embeddings` — assessmentId, sourceType, sourceId?, title, content,
  embedding vector(1536) — workspace RAG the assistant retrieves from (auto-populated on
  BOM ingest / evidence / artifact / flow answers).

### API surface additions
- Phase 0/1: `role` added to login + session responses; `GET
  /conformity/assessments/{id}/workbench` (aggregate cockpit payload);
  `POST /conformity/assessments/{id}/assistant` (SSE, workspace-aware, requireAuth).
- Phase 2: `/conformity/assessments/{id}/boms` (list/create), `/conformity/boms/{bomId}`
  (get/delete), `/conformity/boms/{bomId}/analyze`, `/conformity/boms/{bomId}/checklist`,
  `/conformity/bom-catalog`; `/conformity/flows` (CRUD), `/conformity/assessments/{id}/flow-runs`
  (list/create), `/conformity/flow-runs/{runId}/steps/{stepId}` (patch);
  `/conformity/assessments/{id}/activity`.

### Workspace-aware assistant
- New route separate from the public marketing chat (leaves oxot-web untouched).
- Assembles context server-side: product, assessment stage/route/class, requirement
  statuses, evidence list + hashes, artifact statuses, BOM summaries + top findings, plus
  top-k workspace embeddings; injects into the system prompt; streams via SSE. History is
  passed in the request body (client-held), so no new conversation tables are needed.

### xBOM engine
- One parser dispatch by `format`: CycloneDX (SBOM components + CBOM crypto-assets), SPDX
  (packages). Others accept CycloneDX-like JSON or are checklist-only.
- Analysis: SBOM → OSV.dev batch CVE lookup by purl (best-effort, no key); CBOM →
  crypto-agility heuristics (flag MD5/SHA-1/RSA<2048/quantum-vulnerable). Findings stored.
- Auto-embed: on ingest, a compact per-BOM digest + component summaries are embedded into
  `conformity_embeddings` for the assistant. Provenance recorded (uploader, hash, parser).
- Configurable checklist: each BOM row carries a `checklist` jsonb seeded from a per-type
  default catalog (`/conformity/bom-catalog`), editable in the UI.

### Flow engine
- Admin authors flows (ordered typed steps). A run binds a flow to an assessment and tracks
  per-step state (answers, checkpoints, generated artifacts). Rendered in the workbench.
- Multi-user assignment is light (assignee text) — full per-user accounts are out of scope
  (documented follow-up).

### Provenance ledger
- Every meaningful action (evidence add, BOM ingest/parse/analyze, artifact gen, flow step
  completion) appends a `conformity_activity` row (actor from session role, hash where
  relevant). Rendered as a chain-of-custody timeline in the workbench.

## Frontend surfaces
- Public: `/welcome` (explainer landing), `/demo` (demo login, creds prefilled).
- Authed: `/overview` (process overview + portfolio), `/workbench/:assessmentId` (cockpit:
  stage rail, checklist/worklist, evidence, BOM vault, flow runner, provenance timeline,
  docked assistant). First-run tour via `driver.js`.

## Testing & verification
- Keep green: conformity e2e (43), oxot-web e2e (12), api-server vitest (84).
- Add: auth-role unit/contract tests (demo can reach workbench, cannot reach admin-config;
  anon still 401); BOM parser unit tests (CycloneDX/SPDX/CBOM); workbench aggregate + flow
  run integration tests; e2e for demo login → overview → workbench.

## Sequencing (waves)
- Wave A = Phase 0 + Phase 1 (no new tables; auth + aggregate + assistant + demo seed + FE).
- Wave B = Phase 2 (schema push + BOM/flow/provenance/embeddings + FE panels + seed flow/SBOM).

## Risks / decisions
- Demo writes share the single-tenant DB (seeded product = sandbox); acceptable for launch.
- Prod schema: Phase 2 tables must be applied to prod at publish (Replit publish diff).
- `file_hash` (from prior work) still pending prod push — folds into the same publish.
