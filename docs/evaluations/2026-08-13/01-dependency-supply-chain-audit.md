# Dependency & Supply Chain Audit — 2026-08-13

Evaluation of third-party package dependencies, pnpm workspace hygiene, version pin stability, and software supply chain risk across `artifacts/*` and `lib/*`.

## Executive Summary

The monorepo utilizes pnpm workspace management with lockfile enforcement (`pnpm-lock.yaml`). Overall dependency choices are modern (React 19, Express 5, Drizzle ORM, Tailwind CSS v4). However, several workspace packages contain duplicate version definitions, unpinned minor/patch ranges, and missing SBOM verification pipelines.

---

## Findings

**[High] Duplicate Package Versions across Monorepo Workspaces** — [`package.json:L1-L30`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/package.json#L1-L30), [`artifacts/conformity/package.json:L1-L40`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/conformity/package.json#L1-L40)
- **Evidence**: `artifacts/conformity` and `artifacts/oxot-web` specify differing minor versions of `@tanstack/react-query` and `lucide-react`.
- **Impact**: Increases container image size, introduces subtle runtime state duplication bugs, and inflates client bundle JavaScript size.
- **Fix**: Consolidate dependencies using pnpm catalog or workspace protocol (`workspace:*`).

**[Medium] Unpinned Caret Ranges on Core Security Dependencies** — [`artifacts/api-server/package.json:L15-L35`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/api-server/package.json#L15-L35)
- **Evidence**: Dependencies like `helmet`, `express`, `cors`, and `jsonwebtoken` use caret ranges (`^`).
- **Impact**: Non-deterministic production builds when downstream patches introduce breaking API changes or unexpected vulnerabilities.
- **Fix**: Pin exact dependency versions or configure automated `pnpm audit` checks in CI pipelines.

---

## What's Already Solid
- pnpm monorepo structure guarantees lockfile consistency via `pnpm-lock.yaml`.
- Up-to-date modern web stack (React 19, Express 5, TypeScript 5.x).
- No deprecated legacy packages detected.
