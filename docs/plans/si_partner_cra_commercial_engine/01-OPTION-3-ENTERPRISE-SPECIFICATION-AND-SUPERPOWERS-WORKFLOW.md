# Option 3 Deep Dive: Enterprise Network Modernization & Spare-Parts Matchmaker Engine
## End-to-End Architectural Specification & Superpowers Execution Framework

**Document Reference**: `docs/plans/si_partner_cra_commercial_engine/01-OPTION-3-ENTERPRISE-SPECIFICATION-AND-SUPERPOWERS-WORKFLOW.md`  
**Target Regulation**: Regulation (EU) 2024/2847 (Cyber Resilience Act - CRA), OJ L 2024/2847  
**Execution Methodology**: Multi-Phase Superpowers Skill-Chained Lifecycle with Karpathy First-Principles Discipline  
**Status**: Formal Architectural Blueprint & Planning Exploration (Pre-Implementation)

---

## 1. The Superpowers Execution Framework for Option 3

To deliver an enterprise-grade, zero-hallucination platform module with extreme statutory rigor, we orchestrate the following specialized **Superpowers & Workflows**:

```
                               SUPERPOWERS ORCHESTRATION PIPELINE
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 0: STATUTORY GROUND TRUTH & STRATEGIC DOMAIN DESIGN                                        │
│ • planning-with-files       ➔ Manus-style disk memory (task_plan.md, findings.md, progress.md)   │
│ • lex & legal-advisor       ➔ 100% cited CRA statutory AST (EU Reg 2024/2847 Arts 2, 14, 21, 32) │
│ • ddd-strategic-design      ➔ Bounded Contexts & Aggregate Roots for Inventories & Spares        │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                │
                                                ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: DATA ARCHITECTURE & FIRST-PRINCIPLES BACKEND                                            │
│ • andrej-karpathy           ➔ Zero-bloat, explicit data contracts, deterministic schemas        │
│ • oxot-database & postgres  ➔ Drizzle ORM tables, pgvector embeddings, and typed migrations      │
│ • zod-validation-expert     ➔ End-to-end type safety between Express 5 and React 19 Client       │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                │
                                                ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 2: ALGORITHMIC MATCHMAKER & AI COPILOT PIPELINE                                            │
│ • backend-feature-dev       ➔ Modular API pipelines (CSV ingestion, stock matching algorithms)  │
│ • llm-structured-output     ➔ Deterministic, grounded prompt pipelines for AI sales dialogues   │
│ • @react-pdf/renderer       ➔ Pixel-perfect, co-branded executive briefing dossier generator     │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                │
                                                ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 3: ENTERPRISE FRONTEND & TUFTE DATA VISUALIZATION                                          │
│ • ui-ux-pro-max             ➔ Premium dark/light design system, glassmorphism, micro-animations │
│ • recharts-visualization    ➔ Interactive statutory risk radar & EOL vulnerability timeline     │
│ • tufte-data-viz            ➔ High-density, low-clutter hardware asset & spare swap tables      │
│ • framer-motion             ➔ Smooth layout transitions, staggered reveals, and responsive state│
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                │
                                                ▼
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 4: MULTI-AGENT VERIFICATION & SECURITY AUDITING                                            │
│ • multi-agent-brainstorming ➔ Peer-review board (Legal, OT Engineering, Security, Commercial)     │
│ • tdd-workflows-tdd-cycle   ➔ Full unit & regression test suite (BOM parser, matchmaker logic)  │
│ • security-auditor          ➔ IDOR prevention, timing-safe session guards, container non-root   │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Option 3 Architecture: The 4 Core Subsystems

```
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   OPTION 3 SYSTEM ARCHITECTURE                                  │
│                                                                                                 │
│  [Customer Asset CSV/BOM]                                      [Partner Warehouse Stock DB]     │
│             │                                                                │                  │
│             ▼                                                                ▼                  │
│  ┌───────────────────────┐                                      ┌────────────────────────────┐  │
│  │   SUBSYSTEM A:        │                                      │   SUBSYSTEM C:             │  │
│  │   Hardware Inventory  │                                      │   Algorithmic Stock        │  │
│  │   Ingestion & Parser  │                                      │   Matchmaker & ROI Calc    │  │
│  └──────────┬────────────┘                                      └────────────┬───────────────┘  │
│             │                                                                │                  │
│             ▼                                                                ▼                  │
│  ┌───────────────────────┐                                      ┌────────────────────────────┐  │
│  │   SUBSYSTEM B:        │                                      │   SUBSYSTEM D:             │  │
│  │   CRA Statutory       │═════════════════════════════════════►│   Executive Dossier &      │  │
│  │   Classification Engine│   (Class I/II, EOL, Fine Exposure)  │   Streaming AI Copilot     │  │
│  └───────────────────────┘                                      └────────────────────────────┘  │
│                                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### Subsystem A: Enterprise Hardware BOM Ingestion & Normalizer
* **Purpose**: Allows an Axians account manager or customer engineer to upload or paste messy, multi-vendor asset registers (e.g., CSV from Cisco DNA Center, Siemens TIA Portal, Nozomi, Claroty, or Excel asset spreadsheets).
* **Input Support**:
  - Columns: `Vendor`, `Model`, `Serial/Hostname`, `Firmware Version`, `Install Date`, `Zone/Subnet`, `Criticality Tier`.
  - Tolerant parser with fuzzy column matching and automatic model normalization.
* **Deterministic Output**: Normalized JSON array conforming to `@workspace/api-zod` contract `NormalizedAssetSchema`.

---

### Subsystem B: CRA Statutory Classification & Exposure Engine
* **Statutory Ground Truth**: 100% hardcoded, deterministic rules mapping hardware models against **Regulation (EU) 2024/2847**:
  - **Annex III Part I (Class I)**: Industrial switches, edge routers, managed Wi-Fi APs, network management software.
  - **Annex III Part II (Class II)**: Industrial firewalls, VPN concentrators, IDS/IPS appliances, PLCs/PACs, safety controllers.
  - **Article 13(6) & 14 Lifecycle Gaps**: Cross-references firmware versions against known CVEs and manufacturer End-of-Life (EOL) / End-of-Support (EOS) milestone dates.
  - **Article 61 Fine Liability Calculator**:
    $$\text{Statutory Fine Liability} = \min(€15{,}000{,}000, \, 2.5\% \times \text{Global Annual Turnover})$$

---

### Subsystem C: Partner Spare-Parts Stock Matchmaker & ROI Engine
* **Purpose**: Compares vulnerable or EOL client components with the partner's verified warehouse inventory to output instant, actionable replacement pathways.
* **Matchmaker Scoring Algorithm**:
  1. **Direct Drop-In Swap (Identical Part - Recital 34)**:
     - Match criteria: Same vendor/family, zero rewiring, no software reconfiguration required.
     - Advantage: Lowest legal risk under CRA Article 21 (does not trigger substantial modification).
  2. **Modernized Next-Gen Upgrade**:
     - Match criteria: In-stock modern certified unit (e.g., swapping obsolete Hirschmann Rail Switch to in-stock Siemens Scalance XB-200 or Cisco IE-4000).
     - Calculates supply-chain lead-time savings (e.g., *"Warehouse Stock: 48h dispatch vs Factory Order: 42 weeks"*).
  3. **Compensating Security Architecture (IEC 62443)**:
     - For non-replaceable legacy PLCs: Recommends front-ending with an in-stock industrial security gateway/firewall for micro-segmentation.
* **Economic ROI Modeling**:
  - Compares: (1) Fine Exposure (€15M) + Downtime Risk vs. (2) Partner Capex/Opex Package.

---

### Subsystem D: Executive Dossier & Streaming AI Sales Copilot
* **Interactive UI Cockpit**:
  - Built with **React 19 + Framer Motion + Recharts + Tufte Data Tables**.
  - **Radar Chart**: Visualizes portfolio vulnerability across 6 axes (CRA Classification, EOL Exposure, Patch Availability, Supply-Chain Lead Time, Fine Risk, Architecture Segmentation).
  - **Tufte Replacement Table**: Clean, high-density asset-to-stock mapping with direct SKU part numbers, unit availability, and dispatch times.
* **Streaming AI Sales Copilot (OpenRouter / Claude / Qwen)**:
  - Generates bespoke, context-aware meeting talking points and objection-handling scripts:
    - *"Plant Manager Objection: 'This switch has run for 12 years without an issue, why change it now?'"*
    - *"Copilot Talking Point: 'Under CRA Article 14, unpatched vulnerabilities carry mandatory 24h notification to CSIRTs starting Sept 2026. Because this model reached EOS in 2022, the manufacturer will issue no CVE patches, placing direct regulatory liability on your operations.'*
* **Co-Branded Executive Briefing Dossier (PDF)**:
  - Multi-page board-ready document generated server-side with `@react-pdf/renderer`, co-branded with Axians and OXOT logos.

---

## 3. Detailed Data Models (`lib/db` & `lib/api-zod`)

```typescript
// 1. Partner Spare Parts Inventory Table Schema
export const partnerSpareParts = pgTable("partner_spare_parts", {
  id: serial("id").primaryKey(),
  partnerId: varchar("partner_id", { length: 64 }).notNull(), // 'axians', 'spie', etc.
  sku: varchar("sku", { length: 128 }).notNull(),
  vendor: varchar("vendor", { length: 128 }).notNull(),
  model: varchar("model", { length: 128 }).notNull(),
  category: varchar("category", { length: 64 }).notNull(), // 'switch', 'firewall', 'plc', 'gateway'
  craAnnexClass: varchar("cra_annex_class", { length: 32 }).notNull(), // 'CLASS_I', 'CLASS_II', 'DEFAULT'
  stockQuantity: integer("stock_quantity").notNull().default(0),
  warehouseLocation: varchar("warehouse_location", { length: 128 }).notNull(),
  dispatchLeadHours: integer("dispatch_lead_hours").notNull().default(48),
  isIdenticalSpare: boolean("is_identical_spare").default(false),
  compatibleReplacements: jsonb("compatible_replacements").$type<string[]>(), // list of target EOL models
  createdAt: timestamp("created_at").defaultNow(),
});

// 2. Customer Network Inventory Assessment Schema
export const networkScopeAssessments = pgTable("network_scope_assessments", {
  id: serial("id").primaryKey(),
  partnerId: varchar("partner_id", { length: 64 }).notNull(),
  accountManagerEmail: varchar("account_manager_email", { length: 256 }).notNull(),
  clientCompanyName: varchar("client_company_name", { length: 256 }).notNull(),
  clientAnnualTurnover: numeric("client_annual_turnover", { precision: 15, scale: 2 }),
  article61FineExposure: numeric("article_61_fine_exposure", { precision: 15, scale: 2 }),
  rawAssetCount: integer("raw_asset_count").notNull(),
  classIAssetCount: integer("class_i_asset_count").notNull(),
  classIiAssetCount: integer("class_ii_asset_count").notNull(),
  eolVulnerableCount: integer("eol_vulnerable_count").notNull(),
  stockMatchCount: integer("stock_match_count").notNull(),
  assetsJson: jsonb("assets_json").$type<NetworkAssetItem[]>(),
  recommendationsJson: jsonb("recommendations_json").$type<CommercialRecommendation[]>(),
  createdAt: timestamp("created_at").defaultNow(),
});
```

---

## 4. Superpowers Workflows to Deploy During Implementation

When proceeding to implementation, we will strictly follow this skill checklist:

| Phase | Superpower Skill | Exact Execution Mandate |
|---|---|---|
| **Phase 0** | `planning-with-files` | Initialize `task_plan.md`, `findings.md`, and `progress.md` in the project root to maintain continuous working memory. |
| **Phase 0** | `lex` / `legal-advisor` | Verify every Annex III hardware classification rule against `docs/statutory-curation/2026-08-13/00-canonical-regulation-ast.json`. |
| **Phase 1** | `oxot-database` | Create migration for `partner_spare_parts` and `network_scope_assessments` in `@workspace/db`. |
| **Phase 1** | `zod-validation-expert` | Generate full Zod validation contracts in `@workspace/api-zod`. |
| **Phase 2** | `backend-feature-dev` | Build Express 5 ingestion endpoints and the deterministic stock matchmaker in `artifacts/api-server`. |
| **Phase 3** | `ui-ux-pro-max` + `tufte-data-viz` | Build the `/partner-scope` and `/conformity/partner-hub` React 19 cockpits with high-density data tables and Framer Motion micro-interactions. |
| **Phase 4** | `multi-agent-brainstorming` | Run a structured peer review simulating CISO, Sales Lead, and OT Plant Engineer personas before merging. |
| **Phase 4** | `tdd-workflows-tdd-cycle` | Execute automated test suites validating BOM parsing, fine calculation, and stock matching accuracy. |
