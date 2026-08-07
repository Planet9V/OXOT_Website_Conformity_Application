# OXOT Conformance Platform — Documentation Wiki

The complete reference for the **OXOT CRA Conformance Application**: the public sales-and-demo funnel, the gated conformity **workbench**, the Express API, the database, and how to run, deploy, maintain and extend all of it.

> **What this product is.** A single-tenant platform that runs EU **Cyber Resilience Act (CRA)** conformity as an operation: every product with digital elements as a living dossier, a guided compliance journey per product, statutory Article 14 clocks, and Annex VII technical files generated from your own evidence. The public site is a thin funnel whose single purpose is booking demos; the workbench is where the compliance work happens.

---

## How to use this wiki

Pick your entry point:

| You are… | Start here |
|---|---|
| **New to the codebase** | [Architecture](01-architecture.md) → [Developer guide](03-developer-guide.md) → [Installation (Docker)](06-installation-docker.md) |
| **Running it locally** | [Installation (Docker)](06-installation-docker.md) |
| **Deploying to production** | [Deployment (Railway)](07-deployment-railway.md) |
| **Building a feature** | [Developer guide](03-developer-guide.md) + [How-to recipes](08-how-to.md) |
| **Integrating with the API** | [API reference](04-api-reference.md) |
| **Understanding the data** | [Data model](05-data-model.md) |
| **An end user / admin** | [User guide](09-user-guide.md) |
| **Operating / supporting it** | [Support & updates](10-support-and-updates.md) |

---

## Table of contents

1. **[Architecture](01-architecture.md)** — monorepo layout, the four apps + shared packages, tech stack, the request path through nginx, the auth model, and the content lifecycle (and why the sales funnel is deliberately *not* CMS-backed).
2. **[Site map](02-sitemap.md)** — every route across the three frontends (public funnel, conformity-platform reference, admin, workbench, briefing), plus how nginx maps top-level paths.
3. **[Developer guide](03-developer-guide.md)** — coding conventions (the Karpathy rules + the OXOT styleguide), the build system, and step-by-step recipes for adding a page, an API route, or a schema change.
4. **[API reference](04-api-reference.md)** — every HTTP endpoint by area: method, path, auth requirement, purpose.
5. **[Data model](05-data-model.md)** — every Postgres/Drizzle table, grouped by domain, with keys and relationships.
6. **[Installation — Docker](06-installation-docker.md)** — run the whole stack locally with `docker compose`, seeds, content export, and verification.
7. **[Deployment — Railway](07-deployment-railway.md)** — the single-container Railway build, its boot sequence, and the full environment-variable reference.
8. **[How-to recipes](08-how-to.md)** — common tasks: add a funnel page, edit CMS content and capture it as a seed, toggle the daily news generation, add a lead capture source, rebuild after a change.
9. **[User guide](09-user-guide.md)** — using the public site, the 2-minute readiness check, the workbench, and the admin CMS.
10. **[Support & updates](10-support-and-updates.md)** — maintenance, updating dependencies, backups, and a troubleshooting catalogue of real issues and their fixes.

---

## The 60-second orientation

- **Monorepo** managed with **pnpm workspaces**. Four runnable apps under `artifacts/` and three shared packages under `lib/`.
- **Frontends** are React 19 + Vite + `wouter` + TanStack Query + Tailwind v4 + shadcn/ui.
- **Backend** is **Express 5** + **Drizzle ORM** on **Postgres 16 + pgvector**, bundled with **esbuild**.
- **Production** is a **single container** (Node API + nginx) built from the `railway` stage of the root `Dockerfile` and deployed on **Railway**. Local dev uses `docker compose` (separate services).
- **The CRA sales funnel** (`/`, `/product`, `/pricing`, `/deployment`, `/resources`, `/cra-check`, `/demo`) is **static React** — it has no CMS or seed dependency and survives any database reset or rebuild.
- **The workbench** (`/conformity/`) is a separate gated SPA; the compliance data lives in `conformity_*` and `cra_*` tables.

---

## Related documents

- Repository standing instructions (the **Karpathy behavioural framework**): [`/CLAUDE.md`](../../CLAUDE.md)
- Design specs: [`docs/superpowers/specs/`](../superpowers/specs/) — including the CRA readiness-check + funnel design.
- Product sheet & sales enablement: [`docs/OXOT_CRA_SaaS_Product_Sheet_and_Sales_Enablement.md`](../OXOT_CRA_SaaS_Product_Sheet_and_Sales_Enablement.md)

*Keep this wiki current: when you add a route, an endpoint, a table, or an environment variable, update the matching page. Each page notes what it covers so drift is easy to spot.*
