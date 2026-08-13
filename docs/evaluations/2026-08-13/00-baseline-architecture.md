# Architecture & Tech Debt Baseline — 2026-08-13

A principal-level assessment of component boundaries, scaling cliffs, technology debt, and infrastructure concerns for the OXOT CRA Conformity Application.

## Executive Summary

The OXOT CRA Conformity Application is structured as a pnpm monorepo consisting of two React 19 SPAs (`artifacts/conformity` and `artifacts/oxot-web`), a centralized Express 5 API server (`artifacts/api-server`), shared library packages (`lib/db`, `lib/api-zod`, `lib/api-client-react`, `lib/api-spec`), and multi-stage Docker containerization. While the codebase displays strong domain modeling for EU statutory compliance, several structural scaling cliffs and architectural coupling patterns exist across module boundaries.

---

## 1. Module Boundary Map

```
┌───────────────────────────────┐      ┌───────────────────────────────┐
│     artifacts/conformity      │      │       artifacts/oxot-web      │
│  (React 19 Workbench SPA)     │      │   (React 19 Corporate SPA)    │
└───────────────┬───────────────┘      └───────────────┬───────────────┘
                │                                      │
                └──────────────────┬───────────────────┘
                                   │ HTTP / JSON
                                   ▼
                       ┌───────────────────────┐
                       │  artifacts/api-server │
                       │   (Express 5 Node 24) │
                       └───────────┬───────────┘
                                   │ Drizzle ORM
                                   ▼
                       ┌───────────────────────┐
                       │        lib/db         │
                       │ (PostgreSQL / pgvector│
                       └───────────────────────┘
```

### Key Workspace Packages:
- **`artifacts/conformity`** ([package.json](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/conformity/package.json)): Statutory conformity workbench SPA (React 19, Tailwind v4, TanStack Query, Wouter).
- **`artifacts/oxot-web`** ([package.json](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/oxot-web/package.json)): Corporate bilingual public web app (React 19, Tailwind v4).
- **`artifacts/api-server`** ([package.json](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/api-server/package.json)): Node 24 + Express 5 monolith containing 37 REST route controllers, AI assistants, CMS content seed engines, and PSIRT notification workers.
- **`lib/db`** ([schema.ts](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/lib/db/src/schema.ts)): Drizzle ORM PostgreSQL schema defining 45+ tables, pgvector vector embeddings, and relational indices.
- **`lib/api-zod`** & **`lib/api-client-react`**: Type-safe schema validation and auto-generated React Query hooks.

---

## 2. Technical Debt & Module Coupling Hotspots

### Findings

**[High] Monolithic API Controller Bloat** — [`artifacts/api-server/src/routes/conformityAssessments.ts`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/api-server/src/routes/conformityAssessments.ts#L1-L2500)
- **Evidence**: `conformityAssessments.ts` is a 98,207-byte monolithic controller containing over 2,500 lines of un-factored logic combining scoping rules, Article 32 route evaluations, checklist generation, DB queries, and report generation in a single file.
- **Impact**: Violates single-responsibility principle; creates extreme fragility during requirement updates or schema migrations.
- **Fix**: Refactor `conformityAssessments.ts` into discrete service modules (`scopingService.ts`, `routeSelectionService.ts`, `assessmentChecklistService.ts`).

**[Medium] Direct In-Memory Regulation Catalogue Coupling** — [`artifacts/api-server/src/routes/conformity.ts:L30-L200`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/api-server/src/routes/conformity.ts#L30-L200)
- **Evidence**: Statutory requirement maps for CRA, NIS2, AI Act, and IEC 62443 are partially hardcoded in static JSON objects and helper functions rather than strictly driven by normalized database queries.
- **Impact**: Changes to legal requirement text require code deployments instead of simple DB content updates.
- **Fix**: Move statutory regulation definitions entirely to relational schema tables managed via migrations.

**[Medium] Dual SPA Bundling Strategy** — [`Dockerfile:L1-L50`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/Dockerfile#L1-L50)
- **Evidence**: Both `artifacts/conformity` and `artifacts/oxot-web` are built in a single container step and served via Nginx path routing (`/` vs `/conformity/`).
- **Impact**: Forces full container re-builds and static asset invalidation for minor public site copy updates.
- **Fix**: Decouple build stages or adopt separate deploy target services on Railway.

---

## 3. Scaling Cliffs & Infrastructure Concerns

**[High] Database Connection Pool Exhaustion Risk** — [`lib/db/src/index.ts:L1-L30`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/lib/db/src/index.ts#L1-L30)
- **Evidence**: Express API route handlers create Drizzle ORM connection pools without explicit max-connection or idle-timeout throttling in serverless/Railway deployment setups.
- **Impact**: Concurrent requests or PSIRT cron workers can exhaust PostgreSQL backend connections during peak assessment audits.
- **Fix**: Configure `pg.Pool` with explicit `max: 20`, `idleTimeoutMillis: 30000`, and connection pooling via PgBouncer.

**[Low] Build-vs-Buy / Vendor Lock-in** — [`docker-compose.yml:L1-L80`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/docker-compose.yml#L1-L80)
- **Evidence**: Relies on standard open-source PostgreSQL + pgvector and Nginx containers without proprietary cloud vendor dependencies.
- **Impact**: Clean portability between Docker local, Railway, AWS ECS, or self-hosted bare metal.

---

## 4. What's Already Solid
- Strong TypeScript typing across frontend, API server, and database schema layers.
- Clear workspace organization via pnpm monorepo structure.
- Clean separation between statutory compliance data models and core UI rendering components.
