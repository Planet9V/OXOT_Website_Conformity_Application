# Unified CRA-First Conformance Frontend — Design Spec

**Date:** 2026-08-03
**Status:** Approved approach (Approach A: Gated CMS tiers + Knowledge Hub)
**Scope:** Integrate the OXOT public site (`artifacts/oxot-web`) and the Conformity workbench (`artifacts/conformity`) into one per-customer conformance product with a limited public frontend and a members-only Knowledge Hub. CRA is the launch focus; the design must scale to additional regulations (AI Act, NIS2, Machinery, IEC 62443, OCP SAFE, encryption regimes, …) with zero frontend code changes.

## Context & Goals

- Deployments are **single-tenant, per customer** (not shared SaaS). Each customer image ships with seeded example data.
- The public (pre-login) site is a **CRA primer**: the regulation, the conformance process OXOT has built, and the artifacts produced to support conformance.
- After login, members get a deeper education/reference layer plus the workbench.
- The CMS machinery is retained; content is re-seeded per deployment. Newsletter/social/analytics stay available but default off.
- **Hard constraint:** the frontend never hard-codes a regulation. CRA prominence comes from seeding and ordering, not code.

## 1. Content Model

Two new fields on CMS pages:

| Field | Values | Purpose |
|---|---|---|
| `visibility` | `public` \| `members` \| `admin` | Tiered access. Enforced **server-side** wherever pages are listed or fetched: nav, page fetch, sitemap, search, RAG index. |
| `regulationKeys[]` (optional) | Natural keys matching the workbench requirement catalogue (`cra`, `ai-act`, `nis2`, `machinery`, future `iec62443`, `ocp-safe`, …) | Tags a page to one or more regulation tracks. Untagged pages are cross-cutting (e.g. "Our process"). |

Adding a regulation = seed its requirements into the workbench catalogue + tag/publish its CMS content. No code changes.

## 2. Public Tier (limited frontend)

Seeded per deployment; filtered nav shows only:

1. **Home** — orientation, who this deployment is for, sign-in door.
2. **CRA Primer** — the regulation in plain language.
3. **Our Conformance Process** — the generic workflow story (assess → evidence → BOM → incidents → reports). Deliberately regulation-neutral.
4. **Artifacts & Coverage** — auditor-facing: each artifact mapped to the CRA annex/article it satisfies (tech docs → Annex VII, EU DoC → Annex V, vulnerability handling → Art 13, …). Data-driven from the regulations/requirements tables where possible so new regulation columns appear as tracks ship.
5. **Regulations We Address** — index of regulation tracks with status (Active: CRA · Coming: AI Act, NIS2, …). The visible expansion shelf.

Newsletter/social features remain in the codebase but are disabled in the customer seed.

## 3. Members Tier — Knowledge Hub

Hub landing page organized **by regulation track**; each track offers four shelves:

- **Primer+** — deeper article-by-article guidance (CMS pages).
- **Requirement Reference** — rendered from the live workbench catalogue (not hand-written pages), always in sync with the workbench.
- **Templates & Examples** — sample technical documentation, EU Declaration of Conformity, report examples drawn from the seeded demo assessment.
- **Workbench How-Tos** — running assessments, BOM uploads, incident handling, report generation.

Cross-regulation mapping pages sit at hub level (product differentiator). CRA track fully populated at launch; other tracks appear automatically as content is tagged and published.

## 4. Assistant Alignment

- RAG chunks inherit page `visibility`. Anonymous chat retrieves only `public` chunks; member sessions retrieve the full index.
- One index, one flag on chunks; reuses the existing publish → reindex pipeline (only published content is indexed).
- The assistant is the primary reference interface for members, grounded in the same body of information the workflows use.

## 5. Navigation Unification

- Site header: logged-in members see **"Open Workbench"**; logged-out visitors see **"Sign in"**.
- Workbench sidebar gains a **"Knowledge Hub"** link back to the site.
- The shared session cookie already spans both apps; the only auth work is exposing role/member state to the public site's nav query.

## 6. Per-Deployment Seeding

A `seed:customer-site` script:

- Seeds the public pages (Section 2) and Knowledge Hub structure with CRA content.
- Sets `noindex` site-wide (per-customer deployments must not compete in search).
- Disables newsletter/social defaults.
- Relies on the existing conformity seed for demo assessment data, sample reports, and templates.

## 7. Error Handling & Testing

- Visibility is enforced in API queries: a `members` page fetched anonymously returns **404** (not a blank render). E2E tests lock this for nav, direct page fetch, and sitemap.
- RAG visibility test: the anonymous assistant must never cite or retrieve a members-only page.
- Nav filtering tested for all three session states (anonymous / member / admin).
- Requirement Reference pages tested against the live catalogue (a seeded requirement must render; an unknown regulation key must not 500).

## Out of Scope

- Merging the two frontends into one codebase (explicitly rejected — Approach C).
- Multi-tenant concerns; every deployment is single-tenant.
- Building non-CRA regulation content (arrives later as workflows are built; this design only guarantees the frontend supports it).

## Key Decisions Log

- **Approach A** chosen over "everything in the workbench" (B, loses CMS editability) and "full merge" (C, biggest lift, little gain).
- Regulation taxonomy reuses the workbench's natural keys (`regulationKey`), not a parallel CMS-only list.
- Requirement Reference renders from the live catalogue rather than duplicated CMS pages, to prevent drift.
- "Limited frontend" is achieved by seeding, not by deleting capability.
