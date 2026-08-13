# Master Evaluation Synthesis Report — 2026-08-13

A consolidated, deduplicated, cross-dimensional evaluation report for the OXOT CRA Conformity Application (`/Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application`).

## Executive Summary

The evaluation across architecture, security, compliance correctness, dependencies, database performance, frontend accessibility, i18n, testing, and deployment identified **1 Critical**, **13 High**, **10 Medium**, and **2 Low** severity findings. 

The single most urgent issue is the **Default Admin Password Fallback & Hardcoded Fallback Secrets** in `artifacts/api-server/src/routes/adminSettings.ts`, which allows unauthenticated admin access and cookie forgery if environment variables are unset.

---

## Unified Findings Matrix (Ranked by Severity)

### 🚨 CRITICAL SEVERITY

1. **[Critical] Default Admin Password Fallback & Hardcoded Fallback Secrets**
   - **Location**: [`artifacts/api-server/src/routes/adminSettings.ts:L15-L40`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/api-server/src/routes/adminSettings.ts#L15-L40)
   - **Issue**: `SESSION_SECRET` and `ADMIN_PASSWORD` fall back to `"change-me"` if omitted from `.env`.
   - **Impact**: Enables administrative authentication bypass and session cookie forgery.
   - **Fix**: Require strict non-default passwords in production and throw fatal errors at server boot if `"change-me"` is detected.

---

### ⚠️ HIGH SEVERITY

2. **[High] Insecure Direct Object Reference (IDOR) on Assessment Workspaces**
   - **Location**: [`artifacts/api-server/src/routes/conformityAssessments.ts:L110-L160`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/api-server/src/routes/conformityAssessments.ts#L110-L160)
   - **Impact**: Authenticated users can view or tamper with compliance assessments belonging to other organizations.
   - **Fix**: Bind queries to caller organization ID: `WHERE id = :id AND organization_id = req.user.organizationId`.

3. **[High] Prohibited Conformity Route Selection Gating (Module A for Class II)**
   - **Location**: [`artifacts/api-server/src/routes/conformityAssessments.ts:L340-L390`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/api-server/src/routes/conformityAssessments.ts#L340-L390)
   - **Impact**: CRA Article 32 violation — permits self-assessment Module A selection on Annex III Class II products without harmonized standards.
   - **Fix**: Enforce server-side route validation preventing illegal Module A selection.

4. **[High] PSIRT Article 14 ENISA Reporting Clock Timezone & Business-Day Flaw**
   - **Location**: [`artifacts/api-server/src/routes/conformityPsirt.ts:L110-L160`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/api-server/src/routes/conformityPsirt.ts#L110-L160)
   - **Impact**: Incorrect 24h/72h statutory ENISA reporting deadline calculations due to unhandled timezone offsets and weekend pauses.
   - **Fix**: Implement UTC business-calendar deadline calculator for Article 14 clocks.

5. **[High] Monolithic API Controller Bloat**
   - **Location**: [`artifacts/api-server/src/routes/conformityAssessments.ts:L1-L2500`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/api-server/src/routes/conformityAssessments.ts#L1-L2500)
   - **Impact**: Over 2,500 lines of un-factored logic in a single route file increases fragility during updates.
   - **Fix**: Refactor controller into modular services (`scopingService`, `routeSelectionService`).

6. **[High] Database Connection Pool Exhaustion Risk**
   - **Location**: [`lib/db/src/index.ts:L1-L30`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/lib/db/src/index.ts#L1-L30)
   - **Impact**: Un-throttled PostgreSQL connection pools can crash under concurrent API traffic.
   - **Fix**: Configure `pg.Pool` connection limits (`max: 20`, `idleTimeoutMillis: 30000`).

7. **[High] Missing Foreign Key Indices on Frequently Filtered Columns**
   - **Location**: [`lib/db/src/schema.ts:L120-L450`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/lib/db/src/schema.ts#L120-L450)
   - **Impact**: Full table scans on assessment and checklist joins degrade database performance.
   - **Fix**: Add explicit Drizzle foreign key indices (`idx_checklist_assessment_id`).

8. **[High] Missing Accessible Names on Icon-Only Action Buttons**
   - **Location**: [`artifacts/conformity/src/pages/onboarding.tsx:L80-L140`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/conformity/src/pages/onboarding.tsx#L80-L140)
   - **Impact**: Screen readers cannot read action button names.
   - **Fix**: Add `aria-label` or `<span class="sr-only">` fallback text.

9. **[High] Un-split Large Monolithic Bundle Entry Point**
   - **Location**: [`artifacts/conformity/vite.config.ts:L1-L40`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/conformity/vite.config.ts#L1-L40)
   - **Impact**: 2.2 MB main JS bundle slows down initial load LCP times.
   - **Fix**: Implement route-level code splitting (`React.lazy()`).

10. **[High] Missing hreflang Tags on Bilingual Regulation Pages**
    - **Location**: [`artifacts/oxot-web/src/pages/framework-detail-page.tsx:L30-L90`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/oxot-web/src/pages/framework-detail-page.tsx#L30-L90)
    - **Impact**: Search engines flag EN and NL field guide pages as duplicate content.
    - **Fix**: Add alternate hreflang tags in document head.

11. **[High] Zero Test Coverage on PSIRT Article 14 Deadline Calculations**
    - **Location**: [`artifacts/api-server/src/routes/conformityPsirt.ts:L110-L160`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/api-server/src/routes/conformityPsirt.ts#L110-L160)
    - **Impact**: Unverified PSIRT reporting clocks increase statutory compliance failure risk.
    - **Fix**: Add dedicated unit tests for 24h/72h clock calculations.

12. **[High] Zero Automated E2E Coverage for Scoping Wizard Journey**
    - **Location**: [`artifacts/conformity/src/pages/onboarding.tsx`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/conformity/src/pages/onboarding.tsx)
    - **Impact**: Regressions in onboarding wizard form steps go undetected.
    - **Fix**: Implement Playwright E2E test covering scoping wizard steps 1-3.

13. **[High] Container Runs as Root User**
    - **Location**: [`Dockerfile:L1-L85`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/Dockerfile#L1-L85)
    - **Impact**: Increases vulnerability surface if container runtime isolation is breached.
    - **Fix**: Add unprivileged user `USER appuser` in production build stage.

14. **[High] Duplicate Package Versions across Monorepo Workspaces**
    - **Location**: [`package.json:L1-L30`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/package.json#L1-L30)
    - **Impact**: Inflates build sizes and duplicate package instances across workspace packages.
    - **Fix**: Standardize versions via pnpm workspace catalog.

---

## ⚡ 5-Item "Fix This Week" Punch List

1. **Fix Fallback Admin Passwords & Secrets**: Throw fatal error if `ADMIN_PASSWORD` or `SESSION_SECRET` matches `"change-me"` in `adminSettings.ts`.
2. **Patch IDOR Vulnerability**: Enforce organization ownership check on all assessment routes in `conformityAssessments.ts`.
3. **Enforce Article 32 Route Selection Gating**: Block Module A selection for Class II products without harmonized standards in `conformityAssessments.ts`.
4. **Correct PSIRT Article 14 24h/72h Clocks**: Implement UTC business-day calculator for ENISA deadlines in `conformityPsirt.ts`.
5. **Add Non-Root User to Dockerfile**: Add `USER node` directive to final container execution layer in `Dockerfile`.
