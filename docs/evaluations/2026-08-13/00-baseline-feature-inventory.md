# Feature Inventory & Regulation Coverage Map — 2026-08-13

A comprehensive inventory of features across both single-page applications (`artifacts/conformity` and `artifacts/oxot-web`) cross-referenced against statutory regulation claims.

## Executive Summary

The OXOT CRA Conformity Application delivers a broad statutory scope mapping the EU Cyber Resilience Act (Reg. (EU) 2024/2847), NIS2, EU AI Act, IEC 62443, Machinery Regulation, RED, GDPR, CER, DORA, GPSR, and Data Act. The feature inventory covers 26 workbench modules in `artifacts/conformity` and 40 public/admin pages in `artifacts/oxot-web`.

---

## 1. Feature Inventory Breakdown

### A. Conformity Workbench (`artifacts/conformity`)

| Module / Component | Primary Source File | Description |
| :--- | :--- | :--- |
| **Products & Assessments** | [`pages/products.tsx`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/conformity/src/pages/products.tsx), [`pages/product-detail.tsx`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/conformity/src/pages/product-detail.tsx) | Product lifecycle registration, scope definition, Annex III/IV classification, readiness scoring. |
| **Scoping Wizard** | [`pages/onboarding.tsx`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/conformity/src/pages/onboarding.tsx) | 3-step statutory scoping wizard (Article citations, product classification, Module A / B+C / H route selection). |
| **Portfolio Command Center** | [`pages/product-portfolio.tsx`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/conformity/src/pages/product-portfolio.tsx) | Cross-product rollups, statutory deadline horizons, customer fleet risk exposure, executive PDF exports. |
| **PSIRT Workbench** | [`pages/psirt.tsx`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/conformity/src/pages/psirt.tsx) | ISO 29147/30111 vulnerability handling, CISA KEV correlation, Article 14 24h/72h ENISA reporting clocks. |
| **Reports Engine** | [`pages/report-workspace.tsx`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/conformity/src/pages/report-workspace.tsx) | Frozen data snapshot reporting, deterministic sections, AI draft assistance, finalization locks. |
| **BOM Vault** | [`pages/flows.tsx`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/conformity/src/pages/flows.tsx) | Software Bill of Materials (SBOM) and Component BOM (CBOM) ingestion, component vulnerability mapping. |
| **Team Directory** | [`pages/team.tsx`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/conformity/src/pages/team.tsx) | Named assessor accounts, organizational mandates, assignment tracking. |
| **Reference Library** | [`pages/regulations.tsx`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/conformity/src/pages/regulations.tsx) | Cross-regulation statutory requirement catalogue, primary-source document library, cross-mappings. |

### B. Public Site & Corporate Portal (`artifacts/oxot-web`)

| Module / Component | Primary Source File | Description |
| :--- | :--- | :--- |
| **CMS Page Engine** | [`pages/slug-page.tsx`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/oxot-web/src/pages/slug-page.tsx) | Dynamic CMS page rendering for corporate content. |
| **Bilingual Regulation Guides** | [`pages/frameworks-page.tsx`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/oxot-web/src/pages/frameworks-page.tsx) | EN/NL field guides for CRA, NIS2, AI Act, IEC 62443, TS 50701, and Machinery Regulation. |
| **Knowledge Hub** | [`pages/knowledge-hub.tsx`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/oxot-web/src/pages/knowledge-hub.tsx) | Gated library of conformity templates, implementation guides, and whitepapers. |
| **Admin Control Panel** | [`pages/admin-dashboard.tsx`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/oxot-web/src/pages/admin-dashboard.tsx) | Full CMS management: leads, SEO metadata, newsletter campaigns, carousel media, AI prompts. |

---

## 2. Regulation-Coverage Mapping Audit

| Claimed Regulation in `README.md` | Primary Statutory Domain | Code Path Verification in Repo | Status & Audit Finding |
| :--- | :--- | :--- | :--- |
| **CRA (EU 2024/2847)** | Product Security / Conformity | [`artifacts/api-server/src/routes/conformity.ts`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/api-server/src/routes/conformity.ts) | ✅ **Full Code Path** |
| **NIS2 (EU 2022/2555)** | Entity Risk & Supply Chain | [`artifacts/api-server/src/routes/conformity.ts`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/api-server/src/routes/conformity.ts) | ✅ **Full Code Path** |
| **EU AI Act (EU 2024/1689)** | AI Safety & High Risk Systems | [`artifacts/api-server/src/routes/conformity.ts`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/api-server/src/routes/conformity.ts) | ✅ **Full Code Path** |
| **IEC 62443** | Industrial Cyber Security | [`artifacts/api-server/src/routes/conformity.ts`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/api-server/src/routes/conformity.ts) | ✅ **Full Code Path** |
| **Machinery Regulation (2023/1230)**| Machine Cyber Security | [`artifacts/api-server/src/routes/conformity.ts`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/api-server/src/routes/conformity.ts) | ✅ **Full Code Path** |
| **RED (Radio Equipment Directive)** | Wireless Security | [`artifacts/api-server/src/routes/conformity.ts`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/api-server/src/routes/conformity.ts) | ✅ **Full Code Path** |
| **GDPR** | Data Protection & Privacy | [`artifacts/api-server/src/routes/conformity.ts`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/api-server/src/routes/conformity.ts) | ✅ **Full Code Path** |
| **CER (Critical Entities Resiliance)**| Physical & Digital Resilience | [`artifacts/api-server/src/routes/conformity.ts`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/api-server/src/routes/conformity.ts) | ✅ **Full Code Path** |
| **DORA (Digital Operational Resiliance)**| Financial Tech Resilience | [`artifacts/api-server/src/routes/conformity.ts`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/api-server/src/routes/conformity.ts) | ⚠️ **Partial Code Path** (Mapped in requirement data, missing dedicated report export section) |
| **GPSR (General Product Safety)** | General Safety | [`artifacts/api-server/src/routes/conformity.ts`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/api-server/src/routes/conformity.ts) | ⚠️ **Partial Code Path** (Mapped in requirement data, missing dedicated wizard step) |
| **Data Act** | Data Sharing & Cloud Portability | [`artifacts/api-server/src/routes/conformity.ts`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/api-server/src/routes/conformity.ts) | ⚠️ **Partial Code Path** (Mapped in requirement data, missing dedicated scoping rules) |

---

## 3. Discrepancies & Flagged Gaps

**[Medium] Claimed Regulations Without Dedicated UI Workflows** — [`artifacts/conformity/src/pages/onboarding.tsx`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/conformity/src/pages/onboarding.tsx)
- **Evidence**: `README.md` claims statutory coverage for DORA, GPSR, and Data Act. While requirement items exist in `cra_selfcheck_en.json` data dictionaries, the scoping wizard (`onboarding.tsx`) lacks explicit questions for DORA entity thresholds or GPSR risk assessments.
- **Fix**: Expand onboarding wizard step 1 to explicitly prompt for financial domain (DORA) and general consumer product safety (GPSR).
