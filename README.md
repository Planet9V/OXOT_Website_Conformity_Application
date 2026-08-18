# OXOT CRA Conformity Application

[![EU Cyber Resilience Act](https://img.shields.io/badge/EU%20Regulation-2024%2F2847-blue.svg)](https://eur-lex.europa.eu/eli/reg/2024/2847/oj)
[![License](https://img.shields.io/badge/License-Proprietary-orange.svg)]()

A statutory conformity platform for the **EU Cyber Resilience Act (Regulation (EU) 2024/2847)**, built and maintained by **OXOT** (J. McKenney). It gives manufacturers, authorized representatives, and assessors a single working environment to scope products, run conformity assessments, handle vulnerabilities under Article 14, and produce the technical documentation the Regulation requires — with NIS2, IEC 62443, the EU AI Act, and the Machinery Regulation mapped into the same requirement catalogue.

## What the application does

**Conformity workbench** (`/conformity/`)

- **Products & assessments** — register products with digital elements and run each one through the statutory journey: scope determination, product classification (Annex III/IV), conformity route selection (Module A / B+C / H), requirement instantiation, evidence, and readiness grading.
- **Scoping wizard** — a guided three-step wizard (scoping questions with Article references, product classification, route selection with Article 32 standards recording) that builds the requirement checklist for a new assessment.
- **Portfolio command center** — cross-product compliance rollups: grades, open blockers, statutory deadline horizon, customer fleet exposure, and executive PDF export.
- **PSIRT workbench** — vulnerability intake and handling aligned to ISO 29147/30111, supplier and CISA KEV correlation against product CBOMs, and the Article 14 reporting workflow with 24h/72h clocks and ENISA Single Reporting Platform submission forms.
- **Reports** — executive briefings, full reports, and readouts generated from frozen data snapshots; deterministic sections computed from live assessment records, narrative sections drafted per report with per-section regeneration, finalization locks the document.
- **BOM vault** — SBOM/CBOM ingestion, component findings, license and dependency views per assessment.
- **Team directory** — named assessor accounts with organizational mandates, sign-in, and work assignment.
- **Reference library** — the cross-regulation requirement catalogue across NINE modelled acts (CRA, NIS2, AI Act, Machinery, RED, GDPR, Data Act, GPSR — plus the RED delegated regulation, and the NL Cbw / DE BSIG transpositions), built from ELEVEN verbatim, CI-verified, lifecycle-guarded statutory corpora; theme coverage views, cross-regulation mappings, and the primary-source document library. (CER and DORA are PARKED — shown reference-only, not modelled.)

**Public marketing site** (`/`) — a separate Vite/React/wouter SPA (`artifacts/oxot-web`)

- Bilingual (EN/NL) funnel: the platform overview (`/product`), the two ICP persona pages (`/manufacturers`, `/operators`), the consultant-led `/cra-transit` 60-day sprint, `/deployment` (four single-tenant modes + local island-mode AI), an honest `/compare`, a self-playing product `/tour`, `/pricing`, the `/trust` centre, and the 2-minute `/cra-check`.
- A public **reading room** (`/wiki`, `/wiki/:act`) — full verbatim statutory text for the nine acts, the same `EuActReader` the workbench uses.
- A CMS-backed page/blog/knowledge system under `/admin`, and **crawler dynamic rendering** (nginx proxies search/social bots to `/api/seo/render` for per-page title/description/OG/JSON-LD — the SPA stays client-rendered for humans).

## Tech stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Wouter, TanStack Query
- **API**: Node.js 24, Express 5, Drizzle ORM, PostgreSQL (pgvector)
- **Testing**: Vitest, Playwright
- **Deployment**: multi-stage Docker with nginx; Railway configuration included

## Quick start (Docker)

```bash
git clone git@github.com:Planet9V/OXOT_Website_Conformity_Application.git
cd OXOT_Website_Conformity_Application
printf 'SESSION_SECRET=change-me\nADMIN_PASSWORD=change-me\n' > .env
docker compose up -d --build
```

- Public site: `http://localhost:8088/`
- Conformity workbench: `http://localhost:8088/conformity/`
- API: `http://localhost:8088/api/`

The stack migrates the schema, seeds the regulation catalogue and demo workspace, and restores site content from the versioned snapshot on first boot. See `DOCKER.md` for the full deployment guide and the content export/restore lifecycle.

## For developers — start here

The canonical, claim-by-claim developer entry point is
**`docs/cra-personas/HANDOVER.md`** (and `NEXT_SESSION_PROMPT.md` for a
pasteable session opener). It carries the two-app map (this public site +
the `/conformity` workbench), the statutory-corpus system, the full gate
suite (G1 typecheck · G2 zero-skip tests · G3 build · G4 honesty=0 · G5
citations=0 · G6 live · G8 UI-reach), the spec-first API pipeline
(`openapi.yaml` → orval → generated client), and the method/traps. **The
working tree wins** over any doc; verify before trusting.

## Content lifecycle

Site content (CMS pages, navigation, settings) round-trips between the database and a versioned snapshot committed to the repository:

```bash
docker compose run --rm content-export   # export live content back into the seed snapshot
```

Fresh deployments restore the snapshot automatically; populated databases are never overwritten by a routine `docker compose up`.

## Tests

```bash
cd artifacts/api-server && npx vitest run
```

## Project structure

```
artifacts/
├── conformity/          # Conformity workbench (React SPA)
├── api-server/          # Express API, seeds, and content lifecycle scripts
├── oxot-web/            # Public corporate site (React SPA)
└── conformity-briefing/ # Briefing slides
lib/
├── api-client-react/    # Generated React Query client
├── api-zod/             # Shared request/response schemas
└── db/                  # Drizzle ORM schema
docker/                  # nginx configuration
```

## License

Copyright © 2026 OXOT. All rights reserved.
