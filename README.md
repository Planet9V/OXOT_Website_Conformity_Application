# OXOT Cyber Resilience Act (CRA) Statutory Conformity Application

[![EU Cyber Resilience Act](https://img.shields.io/badge/EU%20Regulation-2024%2F2847-blue.svg)](https://eur-lex.europa.eu/)
[![License](https://img.shields.io/badge/License-Proprietary-orange.svg)]()
[![Build Status](https://img.shields.io/badge/Docker-Multi--Stage%20Active-emerald.svg)]()

## Executive Overview

**OXOT Conformity Application** is an enterprise-grade digital product conformity and statutory compliance platform designed specifically for the **EU Cyber Resilience Act (CRA · Regulation EU 2024/2847)**, NIS2 Article 21, and IEC 62443-4-2 standards.

The application enables manufacturers, authorized representatives, and notified bodies to run end-to-end statutory conformity assessments, maintain 5-10 year product provenance vaults, triage PSIRT vulnerability disclosures, and generate cryptographically sealed executive compliance dossiers.

---

## Key Features

- 🛡️ **CRA Statutory Assessment Engine**: 4-stage guided conformity wizard covering Scope Determination, Standards Route Selection, xBOM Vulnerability Analysis, and Declaration of Conformity.
- 📊 **Executive Portfolio Command Center**: Real-time regulatory posture rollups, CRA compliance grades, and deadline horizon countdowns.
- ⚡ **PSIRT & Vulnerability Workbench**: ISO 29147 / ISO 30111 aligned vulnerability intake, CVE/CVSS 3.1 scoring, and statutory 24h/72h SLA tracking.
- 📑 **Cryptographic Dossier Generator**: Executive report drafting, AI-assisted section regeneration, and SHA-256 digital signature sealing.
- 🔒 **Statutory Document Vault**: Product-isolated technical file repository supporting 10-year CRA Article 10 retention mandates.
- 🧪 **Automated Diagnostic Suite**: Built-in 20-test Vitest suite verifying database wiring, entity relationships, and API health.

---

## Tech Stack & Architecture

- **Frontend**: React 18, TypeScript, Tailwind CSS v4, Framer Motion, Lucide Icons, Wouter Routing, TanStack React Query.
- **Backend API**: Node.js 24, Express 5, Drizzle ORM, PostgreSQL.
- **Testing & Quality**: Vitest, Playwright E2E.
- **Deployment**: Multi-stage Docker & Nginx containerization.

---

## Quick Start (Docker Development)

1. **Clone the repository**:
   ```bash
   git clone git@github.com:planet9v/OXOT_Website_Conformity_Application.git
   cd OXOT_Website_Conformity_Application
   ```

2. **Build & Start Containers**:
   ```bash
   docker compose build --no-cache web api && docker compose up -d web api
   ```

3. **Access the Application**:
   - Web App: `http://localhost:8088/conformity/`
   - API Server: `http://localhost:8088/api/`

---

## Running System Diagnostics

Run the automated diagnostic unit test suite (20 tests covering Users, Portfolio, PSIRT, and Reports):

```bash
node .agents/skills/conformity-diagnostics/scripts/run-diagnostics.js
```

Or run Vitest directly:

```bash
cd artifacts/api-server && npx vitest run src/routes/__tests__/usersAndPermissions.test.ts src/routes/__tests__/portfolioEngine.test.ts src/routes/__tests__/psirtVulnerabilityEngine.test.ts src/routes/__tests__/statutoryReportsEngine.test.ts
```

---

## Project Structure

```
OXOT_Website_Conformity_Application/
├── artifacts/
│   ├── conformity/          # Main React Frontend Application
│   ├── api-server/          # Express API Backend & Route Handlers
│   ├── oxot-web/            # Corporate Portal & Marketing Surface
│   └── customer-site/       # Customer-facing Documentation Portal
├── lib/
│   ├── api-client-react/    # Generated React Query Hooks
│   └── db/                  # Drizzle ORM Database Schemas & Migrations
├── docker/                  # Nginx & Container Configurations
├── Dockerfile               # Production Multi-Stage Dockerfile
└── docker-compose.yml       # Orchestration configuration
```

---

## License

Copyright © 2026 OXOT Technologies. All rights reserved.
