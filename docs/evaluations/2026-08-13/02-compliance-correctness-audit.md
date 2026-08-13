# Compliance Correctness Audit — 2026-08-13

A statutory verification of the OXOT CRA Conformity Application against Article requirements of Regulation (EU) 2024/2847 (EU Cyber Resilience Act) and associated frameworks.

## Executive Summary

The application provides accurate mapping of Annex III/IV CRA product classifications and Module A / B+C / H conformity assessment routes. However, statutory compliance gaps exist in Article 14 PSIRT 24h/72h notification clock calculations, ENISA Single Reporting Platform field exports, and requirement checklist generation gating.

---

## Statutory Findings & Evidence

### 1. Scoping Wizard Article Citations
- **Intended Behavior**: Scoping questions in step 1 of the wizard ([`artifacts/conformity/src/pages/onboarding.tsx:L100-L300`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/conformity/src/pages/onboarding.tsx#L100-L300)) cite exact CRA Articles (Article 2, Article 6, Annex III/IV).
- **Audit Result**: ✅ **Verified**. Questions match Article definitions; citations correctly map to Annex III Important Products with Digital Elements (Classes I & II) and Annex IV Critical Products.

---

### 2. Conformity Route Selection Gating (Module A / B+C / H)
- **Intended Behavior**: Under CRA Article 32, Module A (Internal Production Control) is only permitted for default products with digital elements or Class I products applying harmonized standards. Class II and Critical products require Module B+C (EU Type-Examination) or Module H (Full Quality Assurance).
- **Audit Result**: ⚠️ **Gating Vulnerability Identified** — [`artifacts/api-server/src/routes/conformityAssessments.ts:L340-L390`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/api-server/src/routes/conformityAssessments.ts#L340-L390).
  - **Evidence**: The route selection controller allows an assessor to select Module A for an Annex III Class II product even when harmonized standards are set to `false`.
  - **Impact**: Non-compliant assessment generation; permits self-assessment where third-party Notified Body assessment is mandatory by EU law.
  - **Fix**: Enforce strict server-side validation: `if (classification === 'class_ii' && !harmonizedStandardsApplied && route === 'module_a') throw new Error("Article 32 violation: Module A prohibited for Class II without harmonized standards");`.

---

### 3. PSIRT Article 14 ENISA Reporting Clocks (24h Early Warning / 72h Notification)
- **Intended Behavior**: CRA Article 14 requires manufacturers to submit an early warning notification to ENISA within **24 hours** of becoming aware of an actively exploited vulnerability, followed by a full notification within **72 hours**.
- **Audit Result**: ⚠️ **Clock Calculation Flaw** — [`artifacts/api-server/src/routes/conformityPsirt.ts:L110-L160`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/api-server/src/routes/conformityPsirt.ts#L110-L160).
  - **Evidence**: `disclosureDueAt` is computed via plain `Date.now() + offset` without considering timezone offsets (UTC vs CET/CEST) or weekend/holiday pauses (which apply to 72h notifications under EU procedural rules).
  - **Impact**: Erroneous deadline calculations can lead to missed statutory reporting windows or premature warning alerts.
  - **Fix**: Implement ISO 8601 UTC business-calendar deadline calculator for Article 14 clocks.

---

### 4. Requirement Instantiation & Checklist Generation
- **Intended Behavior**: Creating a new assessment generates a requirement checklist combining Annex I Essential Cyber Security Requirements, Annex II Technical Documentation, and selected route controls.
- **Audit Result**: ✅ **Verified** — [`artifacts/api-server/src/routes/conformity.ts:L250-L310`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/api-server/src/routes/conformity.ts#L250-L310). Requirement items correctly populate based on the statutory matrix.

---

## What's Already Solid
- Precise statutory Article citations across EN/NL regulation reference guides.
- Full alignment with ISO 29147 (Vulnerability Disclosure) and ISO 30111 (Vulnerability Handling).
- Accurate Annex I Part I & Part II essential cybersecurity requirements coverage.
