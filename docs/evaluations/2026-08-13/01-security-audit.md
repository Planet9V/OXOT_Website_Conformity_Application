# Security Audit — 2026-08-13

Comprehensive security analysis covering authentication, session management, authorization controls, SQL injection risk, secrets hygiene, and API perimeter defense.

## Executive Summary

The API application implements standard security middleware (Helmet security headers, CORS origin filtering, Pino logger sanitization). However, critical vulnerabilities exist in session token verification, default admin password fallbacks, IDOR vulnerabilities in multi-tenant conformity assessment routes, and unencrypted session secret defaults.

---

## Findings

**[Critical] Default Admin Password Fallback & Hardcoded Fallback Secrets** — [`artifacts/api-server/src/routes/adminSettings.ts:L15-L40`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/api-server/src/routes/adminSettings.ts#L15-L40)
- **Evidence**: `SESSION_SECRET` and `ADMIN_PASSWORD` fall back to `"change-me"` if environment variables are omitted or empty in `.env`.
- **Impact**: Attacker can forge session cookies or gain administrative access to the conformity workbench and CMS.
- **Fix**: Fail container startup immediately if `ADMIN_PASSWORD` or `SESSION_SECRET` matches `"change-me"` or is under 32 characters in production.

**[High] Insecure Direct Object Reference (IDOR) on Assessment Workspaces** — [`artifacts/api-server/src/routes/conformityAssessments.ts:L110-L160`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/api-server/src/routes/conformityAssessments.ts#L110-L160)
- **Evidence**: Assessment GET/PATCH endpoints take `:id` path parameters without validating that the authenticated session user belongs to the target product's organization ID.
- **Impact**: Any authenticated user can read or modify assessment checklists and statutory compliance evidence belonging to other organizations.
- **Fix**: Enforce organization-scoped query boundaries: `WHERE assessment.id = :id AND organization_id = req.user.organizationId`.

**[Medium] Missing Rate Limiting on Authentication & PSIRT Intake Endpoints** — [`artifacts/api-server/src/routes/admin.ts:L20-L50`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/api-server/src/routes/admin.ts#L20-L50)
- **Evidence**: Admin login and PSIRT vulnerability intake endpoints lack `express-rate-limit` middleware protection.
- **Impact**: Susceptible to credential brute-force attacks and Denial of Service (DoS) on PSIRT submission endpoints.
- **Fix**: Apply strict IP-based and user-based rate limiters (`express-rate-limit`, 5 attempts per 15 minutes).

---

## What's Already Solid
- Helmet middleware enforces CSP defaults, HSTS, X-Content-Type-Options, and X-Frame-Options.
- Query parameters use Drizzle ORM parametrized queries preventing SQL injection across DB access layers.
- Pino HTTP logger redacts request query parameters and authorization credentials from logs.
