# Master Strategy & Statutory Specification: B2B Partner & System Integrator CRA Commercial Engine

**Document Reference**: `docs/plans/si_partner_cra_commercial_engine/00-MASTER-STRATEGY-AND-STATUTORY-SPECIFICATION.md`  
**Applicable Regulation**: Regulation (EU) 2024/2847 (Cyber Resilience Act - CRA), OJ L 2024/2847  
**Architecture Context**: Single-Tenant Enterprise Platform Deployment (Dedicated Instance per Partner / Customer)  
**Target Entities**: System Integrators (SIs), Managed Service Providers (MSPs), OT/IT Network Infrastructure Providers, Industrial Maintenance Contractors, and Value-Added Resellers (e.g., *Axians / VINCI Energies, SPIE, Equans, Actemium, Computacenter, Bechtle*)  
**Status**: Formal Strategy & Statutory Specification (Updated with Grandfathering & Capex Pull-Forward Analysis)

---

## 1. Executive Summary & Core Thesis

System Integrators and Managed Service Providers maintaining industrial OT and enterprise network infrastructures face a transformative commercial window created by the **EU Cyber Resilience Act (Regulation EU 2024/2847)**:

1. **The Single-Tenant Architecture**: The platform operates as a **single-tenant system** (deployed as an isolated stack per partner or enterprise customer), providing absolute data segregation, zero cross-tenant data leakage, and full sovereign control over proprietary hardware inventory and spare-parts catalogs.
2. **The Transitional Regulatory Window (Articles 69 & 71)**:
   - **Pre-December 2027 Grandfathering (Article 69(2))**: Hardware products placed on the market *before* 11 December 2027 are generally grandfathered and exempt from CRA Annex I CE-marking requirements, **unless** they undergo a **substantial modification** (Article 21) after that date.
   - **The Article 14 Early Reporting Mandate (Article 69(3))**: **Article 14** (mandatory 24h early warning and 72h notification of actively exploited vulnerabilities and severe incidents) applies to **ALL products on the market starting 11 September 2026**, including legacy grandfathered products!
3. **The Two-Way Commercial Catalyst for SIs & Customers**:
   - **The Pre-2027 Capex Pull-Forward Play (Stockpiling & Buffer)**: Asset owners can legally stabilize their operational environments by pulling forward capital expenditures to buy proven legacy components and stockpile spare parts *before* 11 December 2027. SIs can monetize their warehouse stock immediately by supplying verified, identical spare parts.
   - **The Article 14 & NIS2 Modernization Play**: When legacy components reach End-of-Support (EOS) and unpatched zero-days emerge, asset owners face mandatory incident disclosures and NIS2 supply-chain sanctions. SIs step in with planned CRA-certified modern network redesigns (drawing from partner inventory).
4. **The OXOT Solution**: The CRA Conformity Application acts as a single-tenant **Commercial Discovery & Spare-Parts Matchmaker Engine**, translating statutory dates, grandfathering rules, and spare-parts exemptions into multi-million-euro hardware replacement and managed service contracts.

---

## 2. Multi-Advisor Board Synthesis

### 🏛️ Legal & Statutory Advisor (Regulation EU 2024/2847 Deep-Dive)
* **Article 69(2) Grandfathering Principle**: Products placed on the market prior to 11 December 2027 are exempt from Annex I Essential Requirements and conformity assessment procedures unless substantially modified.
* **Article 69(3) Vulnerability Reporting Exception**: The 24h/72h notification obligations under Article 14 take effect on **11 September 2026** for all in-scope digital products, irrespective of when they were placed on the market.
* **Article 21 Substantial Modification Boundary**: A modification is "substantial" if it changes the intended function or cybersecurity characteristics of the device. Replacing firmware with an uncertified custom OS, or adding uncertified remote telemetry, converts the modifier into the legal "Manufacturer."
* **Recital 34 & Article 2(2) Spare Parts Mechanics**: Components supplied exclusively as spare parts for the replacement of **identical components** in legacy systems do not trigger a new product placement on the market and can be purchased and installed post-December 2027 without re-certification.
* **Article 61 Fine Liability**: Administrative fines up to **€15,000,000 or 2.5% of annual global turnover** for non-compliance with reporting or essential safety obligations.

### 💼 B2B Marketing & Sales Council (Commercial Economics & Capex Acceleration)
* **Pulling Forward Capex (Pre-2027 Spend Acceleration)**:
  - *The Pitch*: "Invest now to secure pre-CRA equipment buffers and identical spare parts before supply-chain transitions and regulatory redesign costs hit the market in late 2027."
  - *The Value*: SIs liquidate or monetize existing warehouse spare stock while providing clients with guaranteed 10-year operational continuity.
* **Post-2027 Modernization Assurance**:
  - *The Pitch*: "For mission-critical network segments, migrate to certified CRA Class I/II hardware with active 10-year signed patch pipelines, backed by Axians Network-as-a-Service (NaaS)."

### ⚙️ Single-Tenant Systems & OT Architecture (Karpathy First-Principles)
* **Strict Single-Tenancy**: Isolated PostgreSQL/Drizzle database instance per partner/enterprise. No cross-customer data commingling.
* **Client-Side Data Sanitization**: Strip internal IP addresses, MAC addresses, and site names in-browser before data enters the database, ensuring zero violation of customer OT confidentiality agreements.
* **Deterministic Matching Engine**: Match legacy equipment against spare-parts stock using explicit, transparent matching rules.

---

## 3. Statutory Deep-Dive: Grandfathering, Timing & Spare Parts

```
                                  CRA STATUTORY TIMELINE & TRANSITIONAL MECHANICS
                                  
       10 Sept 2026                                      11 Dec 2027
            │                                                 │
            ▼                                                 ▼
┌───────────────────────┐                         ┌───────────────────────────────────────┐
│  ARTICLE 14 APPLIES   │                         │       GENERAL CRA ENFORCEMENT         │
│  (Mandatory 24h Early │                         │  (All new products placed on market   │
│   Warning & 72h Vuln  │                         │   must have CE Mark + Annex VII File) │
│   Reporting to CSIRT) │                         └───────────────────┬───────────────────┘
│  *Applies to ALL gear*│                                             │
└───────────┬───────────┘                                             ▼
            │                                     ┌───────────────────────────────────────┐
            │                                     │     EQUIPMENT PLACED ON MARKET        │
            │                                     │       BEFORE 11 DEC 2027              │
            │                                     │         (Article 69(2))               │
            │                                     └───────────────────┬───────────────────┘
            │                                                         │
            │                                     ┌───────────────────┴───────────────────┐
            │                                     ▼                                       ▼
            │                             Routine Maintenance                    Substantial Modification
            │                           (Identical Spare Swap)                     (Altered Function/Cyber)
            │                                     │                                       │
            │                              Recital 34: OK                          Article 21: Triggered
            │                           Grandfathered for life                    SI becomes "Manufacturer"
            ▼                                     │                               ➔ Must CE-Mark & Hold File
┌─────────────────────────────────────────────────┴───────────────────────────────────────┐
│                                   COMMERCIAL STRATEGY                                   │
│  1. PULL FORWARD CAPEX NOW: Buy legacy buffer & spare stock before Dec 2027.             │
│  2. ARTICLE 14 SHIELD: Replace EOS/unpatchable gear that cannot meet 24h incident rules. │
│  3. CONTROLLED RETROFIT: Use identical spares (Recital 34) or full certified modern HW. │
└─────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Can Spare Parts Be Purchased and Supplied After December 2027?

### The Legal Verdict:
1. **Yes, for Identical Replacements (Recital 34 & Art 2(2))**:
   - A manufacturer, distributor, or SI can continue supplying and installing spare parts after 11 December 2027, provided those parts are **identical** to the original components and intended solely to maintain or repair products placed on the market before that date.
   - *SI Business Advantage*: SIs holding extensive spare-parts stock of legacy Hirschmann, Siemens, Cisco IE, and Moxa switches can legally service client installed bases for years post-2027 without recertification.
2. **No, for Standalone New Digital Components**:
   - If a new, non-identical digital component (e.g., a newly designed smart I/O module or upgraded network card with new firmware) is placed on the market as a standalone product after 11 December 2027, it **must independently comply with the CRA** and bear a CE mark.
3. **The Modification Trap**:
   - If an SI replaces a legacy switch with a different model requiring custom firmware bridges or altered network security parameters, this constitutes a **Substantial Modification (Article 21)**. The SI must either ensure the replacement is independently CRA-certified by its manufacturer or assume full manufacturer liability.

---

## 5. The Commercial Playbook: Capturing the Capex Acceleration Window

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 THE 3-TIER COMMERCIAL PLAYBOOK                                   │
│                                                                                                  │
│  TIER 1: Pre-2027 "Legacy Continuity Buffer" (Pulling Forward Capex)                             │
│  • Target: Heavy manufacturing, utilities, and process industries with 10-15 year plant cycles.  │
│  • Action: Customer purchases bulk identical replacement units & consignment spare parts NOW.    │
│  • SI Revenue: Immediate hardware liquidation/sales + long-term warehousing/management SLA.     │
│                                                                                                  │
│  TIER 2: Article 14 & NIS2 Vulnerability Shield (Active Risk Elimination)                        │
│  • Target: Critical infrastructure & essential entities facing NIS2 supervision in 2026.        │
│  • Action: Audit installed base for EOS hardware lacking vendor patch support; replace with      │
│            CRA-ready switches/firewalls drawing from partner stock.                              │
│  • SI Revenue: Hardware refresh Capex + Network-as-a-Service (NaaS) subscription.                │
│                                                                                                  │
│  TIER 3: IEC 62443 Micro-Segmentation & Architecture Redesign                                    │
│  • Target: Legacy OT environments where PLCs cannot be replaced due to validation constraints.   │
│  • Action: Front-end legacy controllers with in-stock industrial security gateways to create     │
│            conduits and isolate unpatchable devices.                                             │
│  • SI Revenue: High-margin engineering consulting, architecture redesign, and managed firewall.  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Single-Tenant System Architecture & Technical Specifications

```
                               SINGLE-TENANT DEPLOYMENT TOPOLOGY
                               
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                             ISOLATED CUSTOMER / PARTNER INSTANCE                                 │
│                                                                                                  │
│  ┌───────────────────────┐      ┌───────────────────────────┐      ┌──────────────────────────┐  │
│  │ artifacts/oxot-web    │      │ artifacts/conformity      │      │ artifacts/api-server     │  │
│  │ (Partner Sales Scope) │      │ (Workbench & Partner Hub) │      │ (Express 5 + Drizzle)    │  │
│  └──────────┬────────────┘      └─────────────┬─────────────┘      └────────────┬─────────────┘  │
│             │                                 │                                 │                │
│             └─────────────────────────────────┼─────────────────────────────────┘                │
│                                               ▼                                                  │
│                                ┌─────────────────────────────┐                                   │
│                                │ PostgreSQL 16 + pgvector    │                                   │
│                                │ (Dedicated DB Instance)     │                                   │
│                                └─────────────────────────────┘                                   │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Core Data Models (`lib/db/src/schema/`)

```typescript
// 1. Partner Spare Parts & Consignment Stock Schema
export const partnerSpareParts = pgTable("partner_spare_parts", {
  id: serial("id").primaryKey(),
  partnerId: varchar("partner_id", { length: 64 }).notNull(),
  sku: varchar("sku", { length: 128 }).notNull(),
  vendor: varchar("vendor", { length: 128 }).notNull(),
  model: varchar("model", { length: 128 }).notNull(),
  category: varchar("category", { length: 64 }).notNull(), // 'switch', 'firewall', 'plc', 'gateway'
  craAnnexClass: varchar("cra_annex_class", { length: 32 }).notNull(), // 'CLASS_I', 'CLASS_II', 'DEFAULT'
  stockQuantity: integer("stock_quantity").notNull().default(0),
  warehouseLocation: varchar("warehouse_location", { length: 128 }).notNull(),
  dispatchLeadHours: integer("dispatch_lead_hours").notNull().default(48),
  isIdenticalSpare: boolean("is_identical_spare").default(true), // Recital 34 compliant
  pre2027Grandfathered: boolean("pre_2027_grandfathered").default(true),
  compatibleTargetModels: jsonb("compatible_target_models").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow(),
});

// 2. Network Scope & Commercial Capex Assessment Schema
export const networkScopeAssessments = pgTable("network_scope_assessments", {
  id: serial("id").primaryKey(),
  partnerId: varchar("partner_id", { length: 64 }).notNull(),
  accountManagerEmail: varchar("account_manager_email", { length: 256 }).notNull(),
  clientCompanyName: varchar("client_company_name", { length: 256 }).notNull(),
  clientAnnualTurnover: numeric("client_annual_turnover", { precision: 15, scale: 2 }),
  article61FineExposure: numeric("article_61_fine_exposure", { precision: 15, scale: 2 }),
  totalAssetsEvaluated: integer("total_assets_evaluated").notNull(),
  pre2027GrandfatheredCount: integer("pre_2027_grandfathered_count").notNull(),
  art14ExposedCount: integer("art_14_exposed_count").notNull(), // EOS hardware failing 24h reporting
  recommendedCapexPullForward: numeric("recommended_capex_pull_forward", { precision: 15, scale: 2 }),
  sanitizedAssetsJson: jsonb("sanitized_assets_json").$type<SanitizedAssetItem[]>(),
  commercialActionPlanJson: jsonb("commercial_action_plan_json").$type<CommercialActionPlan>(),
  createdAt: timestamp("created_at").defaultNow(),
});
```

---

## 7. Next Steps & Execution Milestones

1. **Phase 1**: Database schema migrations and typed Zod contracts in single-tenant structure.
2. **Phase 2**: Backend asset ingestion, grandfathering evaluation engine, and stock matchmaker.
3. **Phase 3**: Enterprise UI cockpit with grandfathering/Article 14 timeline visualizations and executive PDF exports.
4. **Phase 4**: Automated test suites and security verification.
