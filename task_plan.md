# Master Task Plan: OXOT Application Long-Term Operational Roadmap

## Executive Goal
Transform OXOT into the definitive **EU Industrial AI & Cyber Compliance Orchestrator**, providing end-to-end statutory compliance management across CRA (2024/2847), AI Act (2024/1689), Machinery Regulation (2023/1230), and IEC 62443-4-1/4-2 for industrial OEMs, hardware vendors, and Notified Bodies.

## User Review Required
> [!IMPORTANT]
> - **Enhanced Technical Implementation Plan Created**: [**`implementation_plan.md`**](file:///Users/jimmcknney/.gemini/antigravity-ide/brain/608e9a04-d21c-48f8-baa4-d35ed86ad08c/implementation_plan.md).
> - **Awaiting User Approval**: Holistic Analytics, Recharts Drill-Down Dashboards, and Annex VII ZIP Generator ready for execution upon review.

---

## Complete Multi-Phase Execution Roadmap

### Phase 1: Research & Positioning (COMPLETED)
- [x] Query competitor landscape (Cybellum, Finite State, OneKey, Vanta, Drata, ArmorCode).
- [x] Apply `/marketing-council` perspectives (Dunford positioning, Godin smallest viable audience, Ogilvy direct-response proof, Hormozi value equation).
- [x] Generate 5-Round Adversarial Multi-Agent Debate transcript (`multi_agent_adversarial_debates.md`).
- [x] Generate Competitive Landscape Matrix (`competitive_analysis_matrix.md`).

### Phase 2: Competitor Page Web Implementation (COMPLETED)
- [x] Create React page component `artifacts/oxot-web/src/pages/competitors-page.tsx`.
- [x] Register `/compare` route in `artifacts/oxot-web/src/App.tsx`.
- [x] Add "Competitor Matrix" link to site navigation header ([`header-panels.ts`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/oxot-web/src/components/layout/header-panels.ts)).
- [x] Rebuild `web` service container in Docker (`docker compose up -d --build web`).

### Phase 3: Core Application Enhancements (COMPLETED)
- [x] Connect Public ROI Calculator inputs on `oxot-web` directly into logged-in `conformity` product assessment (ICE-1: Added `POST /api/conformity/products/quick-start`).
- [x] Render interactive Recharts compliance radar in Workbench (`/conformity/`) (ICE-2: Implemented `MultiRegulationRadarChart`).
- [x] Add public product trust center route (`/conformity/public/products/:id/trust-center`) (ICE-3: Implemented `GET /api/conformity/public/products/:id/trust-center`).

---

### Phase 4: Notified Body Audit Workspace & Module B/C & H Collaboration (COMPLETED)
- [x] Build Notified Body Guest Auditor portal (`/conformity/auditor-portal`).
- [x] Implement RFI (Request For Information) and Non-Conformity finding tracking ledger.
- [x] Generate structured Annex VII Technical Documentation Export Pack for TÜV / DNV / Bureau Veritas.
- [x] Add digital signature verification for EU Declarations of Conformity (DoC).

### Phase 5: Continuous Post-Market Surveillance, 6-Type xBOM & Automated VEX Engine
- [ ] Integrate 6-Format CycloneDX 1.5/1.6 xBOM (SBOM, HBOM, CBOM, SaaSBOM, DBOM, AI-BOM).
- [ ] Implement Hierarchical Multi-Tier OEM Supply Chain Lineage Tree (Tier 1/2/3 assemblies).
- [ ] Deploy 6 Multi-Agent Evaluation Intelligence agents (Cryptographic PQC scoring, EOL chipsets).
- [ ] Integrate real-time CISA Known Exploited Vulnerabilities (KEV) & NVD feed ingestion.
- [ ] Build OpenVEX & CycloneDX VEX JSON exporter (`/api/conformity/assessments/:id/vex`).
- [ ] Build automated Article 14 ENISA Single Reporting Platform (SRP) dispatch webhook generator.
- [ ] Implement live Slack/Teams alert notifications for 24h early warning SLA timers.

### Phase 6: E2E Playwright Automation & Quality Gate Enforcement
- [ ] Write E2E Playwright test scripts covering `/`, `/compare`, `/conformity/`, and `/conformity-briefing/`.
- [ ] Conduct Lighthouse performance audits for Core Web Vitals (LCP < 1.2s, INP < 100ms).
- [ ] Integrate automated visual regression testing for dark-mode glassmorphic components.

### Phase 7: Enterprise Multi-Tenancy & Stripe Monetization Engine
- [ ] Implement multi-tenant Organization workspace isolation (`organization_id`).
- [ ] Integrate Stripe subscription billing tiers (Free Assessment, Pro OEM, Enterprise Notified Body).
- [ ] Implement SAML 2.0 / OIDC Single Sign-On for enterprise CISO authentication.

---

## Errors Encountered & Resolution Ledger
| Error | Phase | Attempt | Resolution |
| :--- | :--- | :--- | :--- |
| `pnpm not found` in host shell | Phase 2 | 1 | Used `docker compose up -d --build web` which has pnpm in container environment. |
| Sourcemap error warnings in Vite build | Phase 3 | 1 | Non-fatal rollup warnings; build completed cleanly and output valid bundle chunks. |
