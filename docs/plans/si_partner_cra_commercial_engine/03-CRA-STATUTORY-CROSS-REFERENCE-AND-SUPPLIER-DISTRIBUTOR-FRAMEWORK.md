# Regulation (EU) 2024/2847 (Cyber Resilience Act) Statutory Cross-Reference & B2B Partner Framework

**Document Version**: 2.0 (Enterprise Statutory Reference)  
**Target Operators**: System Integrators, Value-Added Resellers (VARs), Distributors (Axians, SPIE, Equans, VINCI Energies), and Asset Owners (Industrial OT / Manufacturing / Critical Infrastructure).  
**Regulatory Baseline**: Official Journal of the European Union, Regulation (EU) 2024/2847 on horizontal cybersecurity requirements for products with digital elements.

---

## 1. Master Statutory Mapping Matrix: CRA Articles & System Integrator Impact

| CRA Article / Recital | Legal Provision & Statutory Rule | Impact on System Integrators / Resellers (Axians) | Impact on Industrial Asset Owners (Customers) | OXOT Engine Implementation |
| :--- | :--- | :--- | :--- | :--- |
| **Article 2(1) & (2)** | Scope of application: All products with digital elements whose intended use includes direct/indirect data connection. | Governs all industrial switches, firewalls, routers, PLCs, PACs, and remote I/O resold or maintained by SI. | Mandates compliance for all newly procured OT network and control assets. | Supported in `@workspace/db` asset categories and Zod contracts. |
| **Recital 34** | **Identical Spare Parts Exemption**: Components supplied exclusively as spare parts for the replacement of identical components in products placed on market before 11 Dec 2027 are exempt. | **Massive Commercial Advantage**: Allows SI to monetize existing warehouse spare parts inventory without CE re-certification. | Allows plants to secure 10-year maintenance continuity by stockpiling identical spare parts pre-2027. | Implemented in `partnerScopeEngine.ts` & `partnerSparePartsTable`. |
| **Article 13(1)–(6)** | **Obligations of Manufacturers**: Essential requirements (Annex I), SBOM generation, declared support period (min 5 years), signed security updates. | SI must verify manufacturer has fulfilled these before distributing. If manufacturer defaults, SI cannot sell. | Clients receive guaranteed CVE patch pipelines and SBOM documentation during the declared support period. | Tracked in `suppliersTable` and `supplierProductsTable`. |
| **Article 14(1)–(8)** | **Reporting Obligations**: Mandatory 24-hour early warning and 72-hour notification to CSIRTs/ENISA for actively exploited vulnerabilities or severe incidents. | **Takes effect 11 Sept 2026 (Art. 69(3))**. SI must provide 24/7 incident SLA to help clients isolate unpatched devices. | Asset owners running End-of-Support hardware cannot comply if zero-days emerge, risking direct NIS2 Article 21 fines. | Calculated in `partnerScopeEngine.ts` as primary urgency driver. |
| **Article 18** | **Obligations of Importers**: Importers must verify CE mark, DoC, technical files, and maintain records for 10 years. | Applies to SI if importing non-EU hardware directly (e.g. US/Taiwanese routers without EU subsidiary). | Protects clients from grey-market imports that lack legal EU regulatory backing. | Tracked via `isEuManufacturer` / `country` in `suppliersTable`. |
| **Article 19(1)–(4)** | **Obligations of Distributors**: Duty to verify CE mark and DoC; **Duty to Refrain (Art. 19(2))** from selling suspect gear; duty to notify authorities & customers. | **Strict Reseller Liability**: Axians must maintain a verified registry of supplier DoCs and halt distribution of non-compliant SKUs. | Clients receive legally mandated advisory notices if installed supplier hardware is recalled or non-compliant. | Fully implemented in Tab 4 of `/axians` and API `/api/partner/suppliers`. |
| **Article 20** | **Traceability of Economic Operators**: Must identify all suppliers and recipients of products for **10 years**. | SI must maintain durable audit logs of which serial numbers/batches were delivered to which plant sites. | Essential for tracing recalled components and managing product liability under EU safety law. | Supported in `networkScopeAssessmentsTable` DB persistence. |
| **Article 21** | **Substantial Modification**: Any entity that modifies a product in a way that affects its compliance is considered a **Manufacturer**! | **Critical SI Guardrail**: SI must NOT re-flash custom uncertified firmware on client switches, or SI absorbs full €15M manufacturer liabilities! | Prevents rogue configurations that void CE marks and insurance coverage. | Enforced in SI Sales Copilot Objection Handlers. |
| **Article 61** | **Administrative Fines**: Up to **€15,000,000 or 2.5% of total worldwide annual turnover** for Annex I or Article 13/14 violations. | Fines apply directly to economic operators violating distributor duties or misrepresenting compliance. | Asset owners face catastrophic corporate fines and personal executive liability under NIS2 transposition. | Deterministically computed in `fineLiabilityEur` based on turnover. |
| **Article 69(2)** | **General Grandfathering**: Products placed on the market before **11 December 2027** are grandfathered unless substantially modified. | Creates the "Pre-2027 Capex Acceleration Window" — convincing clients to upgrade or buffer stock pre-deadline. | Gives plant owners certainty that pre-2027 investments remain lawful throughout their operational lifecycle. | Modeled in Capex Pull-Forward ROI algorithms. |
| **Article 69(3)** | **Early Reporting Date**: Article 14 mandatory vulnerability reporting applies starting **11 September 2026** (15 months ahead). | The core hook for pulling forward customer conversations into 2025/2026. | Forces CISOs to eliminate EOS unpatchable equipment 15 months before the general CRA deadline. | Timeline Risk Radar and Copilot Prompt #1. |

---

## 2. Customer & Partner Persona Pain Points & Solutions

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                          SI & ASSET OWNER PAIN POINT MATRIX                            │
├───────────────────────────────────┬────────────────────────────────────────────────────┤
│ Customer / SI Pain Point          │ OXOT Solution & Statutory Mechanism                │
├───────────────────────────────────┼────────────────────────────────────────────────────┤
│ 1. "We don't know which switches  │ In-browser sanitized BOM ingestion and automated   │
│    are unpatchable."              │ matching against EOS lifecycle databases.          │
├───────────────────────────────────┼────────────────────────────────────────────────────┤
│ 2. "OEMs take 12-18 months to     │ Regional warehouse buffer stock matching with      │
│    ship replacement hardware."    │ guaranteed 48-hour emergency dispatch.             │
├───────────────────────────────────┼────────────────────────────────────────────────────┤
│ 3. "Can we legally buy spare      │ Yes: Recital 34 explicitly exempts identical spare │
│    parts after December 2027?"    │ parts for pre-2027 gear from CE re-certification.  │
├───────────────────────────────────┼────────────────────────────────────────────────────┤
│ 4. "What if our suppliers don't   │ Article 19 Duty to Refrain tracking and automated  │
│    provide CE / DoC records?"     │ customer advisory notifications & contract clauses.│
├───────────────────────────────────┼────────────────────────────────────────────────────┤
│ 5. "How do we justify Capex to    │ Article 64 fine liability modeling (€15M / 2.5%)   │
│    our CFO before 2027?"          │ and 10-year continuity ROI business cases.         │
└───────────────────────────────────┴────────────────────────────────────────────────────┘
```

---

## 3. Long-Term Statutory Citations & Reference URLs

1. **Official EU CRA Regulation (EU) 2024/2847**:
   - URL: `https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=OJ:L_202402847`
2. **CRA Article 19 (Distributor Obligations)**:
   - URL: `https://eur-lex.europa.eu/eli/reg/2024/2847/oj/eng#d1e2178-1-1`
3. **CRA Article 69 (Transitional Provisions & Grandfathering)**:
   - URL: `https://eur-lex.europa.eu/eli/reg/2024/2847/oj/eng#d1e4438-1-1`
4. **ENISA CRA Single Reporting Platform**:
   - URL: `https://www.enisa.europa.eu/topics/cybersecurity-policy/cyber-resilience-act`
