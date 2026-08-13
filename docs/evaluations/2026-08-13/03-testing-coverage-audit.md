# Testing Coverage Audit — 2026-08-13

Evaluation of automated test coverage (Vitest unit/integration tests and Playwright E2E tests) mapped against the baseline feature inventory.

## Executive Summary

The project includes test configurations for Vitest (`artifacts/api-server/src/routes/__tests__`) and Playwright E2E testing. While core API route utilities are tested, critical statutory compliance paths — specifically PSIRT Article 14 24h/72h clock calculations, Annex III product classification gating, and executive report finalization locks — currently lack automated test coverage.

---

## Coverage Matrix vs. Feature Inventory

| Workbench Feature / Surface | Primary Test Location | Test Framework | Coverage Status & Risk |
| :--- | :--- | :--- | :--- |
| **API Auth & Session Verification** | `src/routes/__tests__/adminAuth.test.ts` | Vitest | ✅ **Covered** |
| **Conformity Route Selection Gating** | *None* | *None* | ⚠️ **Untested (High Risk)** |
| **PSIRT Article 14 24h/72h Clocks** | *None* | *None* | ⚠️ **Untested (High Risk)** |
| **Scoping Wizard Step 1-3** | *None* | Playwright | ⚠️ **Untested (Medium Risk)** |
| **Report Finalization Locks** | *None* | Vitest | ⚠️ **Untested (Medium Risk)** |
| **BOM Vault SBOM Ingestion** | *None* | Vitest | ⚠️ **Untested (Low Risk)** |

---

## Findings

**[High] Zero Test Coverage on PSIRT Article 14 Deadline Calculations** — [`artifacts/api-server/src/routes/conformityPsirt.ts:L110-L160`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/api-server/src/routes/conformityPsirt.ts#L110-L160)
- **Evidence**: No Vitest test file exists verifying `disclosureDueAt` computation under varying timezone inputs or weekend boundaries.
- **Impact**: Regression risk on legal compliance deadline math during future refactoring.
- **Fix**: Add `src/routes/__tests__/conformityPsirtClocks.test.ts` with unit tests for 24h/72h time windows.

**[High] Zero Automated E2E Coverage for Scoping Wizard Journey** — [`artifacts/conformity/src/pages/onboarding.tsx`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/conformity/src/pages/onboarding.tsx)
- **Evidence**: Playwright test suite lacks end-to-end user journey tests for completing the 3-step statutory scoping wizard.
- **Impact**: UI breaking changes in form inputs can prevent assessors from completing product registrations undetected.
- **Fix**: Add `e2e/scoping-wizard.spec.ts` Playwright test covering product creation through checklist instantiation.

---

## What's Already Solid
- Vitest integration is fast and cleanly configured in `artifacts/api-server`.
- Playwright E2E configuration exists for multi-browser rendering checks.
