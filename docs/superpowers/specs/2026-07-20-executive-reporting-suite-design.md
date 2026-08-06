# Executive Reporting & Analysis Suite — Design

Date: 2026-07-20 · Status: Approved by user (build mode) · Product: OXOT Conformity

## Goal

Professional-grade reporting on top of the existing CRA assessment data: executive
briefings, long-form academic reports with full citations, and meeting readouts —
per assessment and across the portfolio — with configurable audience and content
options, print-safe graphics, and hybrid (deterministic + AI-drafted, human-edited)
authorship.

## Report matrix

| Dimension | Values |
|---|---|
| Scope | `assessment` (one product) · `portfolio` (all assessments) |
| Format | `briefing` (3–5 pp) · `full` (15–30+ pp, academic, references + annexes) · `readout` (8–12 headline pages) |
| Audience | `board` (plain language, decision framing) · `regulator` (formal, article-level traceability) |
| Options | include annexes · include evidence register · include incident detail |

## Authorship model (hybrid)

- **Deterministic**: all figures, KPI bands, tables, charts, citations, annexes are
  computed server-side from a **frozen data snapshot** taken at generation time
  (pattern: flow-run snapshot). Reports never drift when live data changes.
- **AI-drafted**: analytical prose sections (executive summary, findings discussion,
  risk outlook, recommendations, methodology commentary) are drafted by the existing
  LLM integration from the snapshot + numbered citation list, one section at a time,
  in the background. Status per section: `pending → ready | failed`.
- **Human-controlled**: each AI section is editable (markdown) and individually
  regenerable while the report is `draft`. `finalize` locks the report (`final`) and
  writes an activity-ledger row. Deterministic sections are never editable.

## Citations (deterministic, validated)

Per-report registry, numbered in first-use order, deduped by source key:
1. Regulation articles/annexes referenced by the snapshot's requirement refCodes —
   cited against their parent instrument (e.g. Regulation (EU) 2024/2847, OJ L 2024/2847).
2. Applied standards from the Art 32 ledger (e.g. EN 18031-1:2024).
3. Cross-mapped frameworks (IEC 62443 series, AI Act) via existing requirement mappings.
4. Internal evidence items (title, type, SHA-256 prefix, upload date) as documentary evidence.
5. Curated static bibliography (CRA OJ ref, ENISA guidance, Blue Guide 2022,
   Decision 768/2008/EC) — constants in code, no web fetching.

In-text `[n]` markers in deterministic and AI prose. The AI receives the numbered
list and may cite only from it; a post-generation pass validates markers, stripping
any `[n]` not in the registry (and flagging the section as edited-by-validator).

## Graphics

Server-side inline-SVG chart builders (pure functions, no deps, unit-tested):
readiness donut, theme-coverage bars, risk-matrix heatmap, deadline timeline,
portfolio grade distribution. Embedded in both the in-app preview and export HTML.

## Data snapshot contents

Assessment scope: product + assessment header (class/route, grade, score, readiness),
requirement evaluations grouped by theme, gaps worklist, evidence register, standards
ledger + route-validity advisory, incidents with Art 14 clocks, BOM summary
(components, findings by severity, upstream notification gaps), alert/deadline state,
recent activity extract. Portfolio scope: per-assessment posture rows + aggregates
(grade distribution, readiness stats, deadline horizon ≤90d, systemic gap themes,
incident summary).

## Persistence

`conformity_reports` (new table): id, scope, assessment_id (nullable FK, cascade),
report_type, audience, status (`generating|draft|final|failed`), title,
options jsonb, data_snapshot jsonb, citations jsonb, sections jsonb (ordered
`{key, heading, kind: deterministic|ai, status, contentMd, editedBy?, editedAt?}`),
created_by, created_at, updated_at.

## API surface (all under existing conformity auth; demo role read-only → mutations 403)

- `POST /conformity/reports` — create; builds snapshot + deterministic sections
  synchronously, kicks background AI drafting; returns report (status `generating`).
- `GET /conformity/reports?scope=&assessmentId=` — list summaries.
- `GET /conformity/reports/{id}` — full report (client polls while `generating`).
- `PATCH /conformity/reports/{id}/sections/{key}` — edit AI section (draft only).
- `POST /conformity/reports/{id}/sections/{key}/regenerate` — redraft one section.
- `POST /conformity/reports/{id}/finalize` — lock; ledger row in same tx.
- `DELETE /conformity/reports/{id}` — remove; ledger row in same tx.
- `GET /conformity/reports/{id}/export` — composed print-ready HTML `{title, html}`
  rendered server-side (charts inline); client opens it via the existing print
  pipeline (window.open + document.write → browser PDF).

Create/finalize/delete write activity-ledger rows in the same transaction.
Background section writes are single-writer (generation loop) and stop once status
leaves `generating`; edits are rejected until then, avoiding jsonb RMW races.

## UI

- Assessment page: new **Reports** tab — builder (format, audience, options),
  report list with status chips, report workspace (TOC, section cards, edit /
  regenerate per AI section, citation list, Finalize, Export PDF).
- Portfolio: new **Reports** page in main nav, same builder minus product picker.
- Generation progress via react-query polling; demo users see a seeded example
  final report, generation buttons disabled with explanation.

## Testing

- Vitest: chart SVG builders; citation registry (ordering, dedupe, marker
  validation); snapshot builder determinism; route auth contract (anon 401,
  demo 403 on mutations); lifecycle create→sections ready→edit→finalize with the
  LLM mocked at the client boundary; export HTML contains SVG + references.
- Playwright: mocked-API spec — builder → generating → draft → edit → finalize →
  export captured via window.open override (established pattern).

## Decisions / rejected alternatives

- Print-to-PDF via existing pipeline, not a server PDF engine (no heavy dependency).
- Server-generated SVG, not recharts screenshots (deterministic, print-reliable).
- Background generation + polling, not one long blocking request or SSE (robust,
  fits existing react-query patterns).
- LLM through the already-configured AI integrations proxy; no new secrets.

## Delivery stages

A. Backend: schema, snapshot/citation/chart/narrative engine, routes, OpenAPI +
   codegen, seed example report, vitest.
B. Frontend: Reports tab + portfolio page, workspace, export wiring, Playwright.
C. Verification: typecheck, full unit + e2e runs, workflow restarts, code review.
