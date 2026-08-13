# OXOT CRA Conformity Application Evaluation — 2026-08-13

Master index for the full multi-phase SIA evaluation run executed on August 13, 2026.

## Severity Summary

| Severity | Count | Primary Impact Areas |
| :--- | :--- | :--- |
| **Critical** | **1** | Default password fallbacks & session cookie forgery risk |
| **High** | **13** | IDOR access control, CRA Article 32 route gating, Article 14 PSIRT clocks, bundle splitting |
| **Medium** | **10** | Unpinned dependency ranges, missing DB FK/vector indices, PDF main loop blocking |
| **Low** | **2** | Micro UI spacing & minor documentation typos |
| **Total** | **26** | Comprehensive across all 5 evaluation phases |

---

## Evaluation Reports Index

1. [00-baseline-architecture.md](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/docs/evaluations/2026-08-13/00-baseline-architecture.md) — Module boundary mapping, tech debt hotspots, and scaling cliff analysis across SPAs, API server, and database layers.
2. [00-baseline-feature-inventory.md](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/docs/evaluations/2026-08-13/00-baseline-feature-inventory.md) — Feature enumeration across 26 workbench pages and 40 public site screens cross-referenced with statutory regulation claims.
3. [01-security-audit.md](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/docs/evaluations/2026-08-13/01-security-audit.md) — Security posture audit covering authentication, IDOR vulnerabilities, session secret fallbacks, and rate limiting.
4. [01-dependency-supply-chain-audit.md](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/docs/evaluations/2026-08-13/01-dependency-supply-chain-audit.md) — Evaluation of pnpm workspace dependencies, duplicate version declarations, and supply chain risks.
5. [01-database-audit.md](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/docs/evaluations/2026-08-13/01-database-audit.md) — Drizzle ORM schema verification, missing foreign key indices, and pgvector HNSW index recommendations.
6. [01-frontend-accessibility-audit.md](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/docs/evaluations/2026-08-13/01-frontend-accessibility-audit.md) — WCAG 2.2 accessibility audit, unlabelled icon button fixes, keyboard focus visibility, and design system adherence.
7. [01-performance-audit.md](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/docs/evaluations/2026-08-13/01-performance-audit.md) — Frontend bundle size analysis, route-level code splitting recommendations, and synchronous PDF offloading.
8. [01-i18n-content-audit.md](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/docs/evaluations/2026-08-13/01-i18n-content-audit.md) — English/Dutch localization routing, missing hreflang tags, and content snapshot export/restore lifecycles.
9. [02-compliance-correctness-audit.md](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/docs/evaluations/2026-08-13/02-compliance-correctness-audit.md) — Statutory compliance audit against CRA Article 32 route gating, Article 14 PSIRT 24h/72h reporting clocks, and Annex III classifications.
10. [03-testing-coverage-audit.md](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/docs/evaluations/2026-08-13/03-testing-coverage-audit.md) — Vitest and Playwright test coverage mapping against feature inventory and high-risk statutory compliance paths.
11. [03-deployment-audit.md](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/docs/evaluations/2026-08-13/03-deployment-audit.md) — Docker container hardening audit, root user execution risks, Nginx security headers, and Railway deployment checks.
12. [04-SYNTHESIS-REPORT.md](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/docs/evaluations/2026-08-13/04-SYNTHESIS-REPORT.md) — Consolidated master evaluation synthesis ranking findings by severity and detailing a 5-item "fix this week" action plan.
