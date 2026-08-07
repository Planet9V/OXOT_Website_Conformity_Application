# Architecture

How the codebase is organised, the technologies in play, how a request flows from browser to database, how authentication works, and how content is managed.

## Contents
- [Monorepo layout](#monorepo-layout)
- [The four apps](#the-four-apps)
- [The three shared packages](#the-three-shared-packages)
- [Technology stack](#technology-stack)
- [Request flow](#request-flow)
- [Authentication model](#authentication-model)
- [Content lifecycle (CMS) — and why the funnel is static](#content-lifecycle-cms--and-why-the-funnel-is-static)
- [The OXOT styleguide](#the-oxot-styleguide)
- [Coding conventions](#coding-conventions)

---

## Monorepo layout

The repository is a **pnpm workspace monorepo**. Two top-level directories hold everything that ships:

```
/
├── artifacts/            # runnable apps
│   ├── oxot-web/         # public marketing site + CRA sales funnel  (Vite SPA)
│   ├── conformity/       # gated conformity WORKBENCH               (Vite SPA)
│   ├── conformity-briefing/  # briefing/slides app                 (Vite SPA)
│   └── api-server/       # Express + Drizzle API                    (esbuild bundle)
├── lib/                  # shared packages (workspace:*)
│   ├── db/               # @workspace/db      — Drizzle schema + client
│   ├── api-zod/          # @workspace/api-zod — request/response schemas
│   └── api-client-react/ # @workspace/api-client-react — generated React Query hooks
├── docker/               # nginx configs + Railway boot script
├── docs/                 # this wiki, design specs, product sheet
├── Dockerfile            # multi-stage build (build / api / web / railway)
├── docker-compose.yml    # local dev stack
├── railway.json          # Railway build config
└── pnpm-workspace.yaml   # workspace + dependency catalog
```

Workspace packages reference each other with `workspace:*` (apps → libs) and pin shared dependency versions through the **catalog** in `pnpm-workspace.yaml` (e.g. `react: 19.1.0`). The catalog also pins platform binaries to **linux-x64**, which is why full Vite builds run in Docker rather than on a developer's Mac (see [Installation](06-installation-docker.md)).

## The four apps

| App | Package | Served at | What it is |
|---|---|---|---|
| **oxot-web** | `@workspace/oxot-web` | `/` | The public site: the **CRA sales funnel** (static React) plus the **conformity-platform** reference pages and the **admin CMS**. |
| **conformity** | `@workspace/conformity` | `/conformity/` | The gated **workbench** — where the compliance work happens (products, assessments, evidence, PSIRT, reports). |
| **conformity-briefing** | `@workspace/conformity-briefing` | `/conformity-briefing/` | A slides/briefing presentation app. |
| **api-server** | `@workspace/api-server` | `/api/` | The **Express** API backing all three frontends. |

The three frontends are independent Vite builds emitting static assets; nginx serves each under its own path prefix. The API is a single Express process.

## The three shared packages

- **`lib/db` (`@workspace/db`)** — the **Drizzle ORM** schema (all `pgTable` definitions) and the database client. Both the API server and the seed scripts import tables and the `db` handle from here. Adding a column means editing a file here (see [Data model](05-data-model.md)).
- **`lib/api-zod` (`@workspace/api-zod`)** — Zod schemas for request bodies and responses, shared between the server (validation) and the generated client (types). The API's error middleware detects `ZodError` structurally.
- **`lib/api-client-react` (`@workspace/api-client-react`)** — generated **TanStack Query** hooks (e.g. `useGetNavigation`, `useListSourceDocuments`) that the frontends call.

## Technology stack

**Frontend:** TypeScript · React 19 · Vite · **wouter** (routing) · **TanStack Query** (data) · **Tailwind CSS v4** (CSS-variable tokens, no `tailwind.config.js`) · **shadcn/ui** + Radix · lucide-react (icons) · react-markdown · a locale layer for `oxot-web` (nested `/nl` wouter router + `LocaleProvider`/`useLocale()`, module-level `copy = { en, nl }` objects per page — see [Sitemap](02-sitemap.md)).

**Backend:** **Express 5** · **Drizzle ORM** · **PostgreSQL 16 + pgvector** (`pgvector/pgvector:pg16`) · **esbuild** (bundles `src/index.ts` → `dist/index.mjs`) · **pino** (logging) · **@react-pdf/renderer** (the readiness-check PDF).

**AI:** **OpenRouter** provides the LLM features — regulatory-news generation, report narratives, the conformity assistant, and embeddings (`qwen/qwen3-embedding-8b`, requested at `dimensions: 1536` to match the `vector(1536)` pgvector columns). Model IDs and the API key are configured via environment / the admin AI settings.

**Infra:** **Docker** (multi-stage) · **nginx** (static serving + API reverse proxy) · **Railway** (single-container production).

## Request flow

```
Browser
  │
  ▼
nginx  ── /api/                → Express API (127.0.0.1:8081 on Railway, api:8080 in compose)
       ── /conformity/         → conformity workbench static SPA  (try_files → index.html)
       ── /conformity-briefing/→ briefing static SPA
       ── /conformity/sources/ → source-library files (inline md/txt/pdf), else SPA fallback
       ── /                    → oxot-web static SPA
                                   │
                                   ▼
Express router (mounted at /api)  ──►  Drizzle  ──►  Postgres + pgvector
```

nginx disables `proxy_buffering` and sets a long `proxy_read_timeout` for the API so the conformity assistant can stream Server-Sent Events. See [Site map](02-sitemap.md) for the exact nginx rules and ports, and [Deployment](07-deployment-railway.md) for how the single Railway container runs nginx and Node side by side.

## Authentication model

Authentication is **home-grown signed-cookie sessions** — no external IdP by default (OAuth/SSO is an enterprise deployment option, not the baseline).

- Sessions are **httpOnly**, `SameSite=Lax`, signed and compared **timing-safe**.
- Member passwords are hashed with **scrypt**.
- Middleware guards routes: `requireAuth` (any signed-in member), `requireAdmin` (CMS admin), and the workbench's own auth gate. Public endpoints have no guard; auth-gated endpoints return **401** when unauthenticated (a 401 is the gate working, not a bug).
- Local development admin credentials are `admin` / `admin`; the production demo uses a configured admin password (`ADMIN_USERNAME` / `ADMIN_PASSWORD`).
- The workbench SPA wraps its entire shell in an `AuthGate`; the public "front door" routes (`/welcome`, `/demo`, `/security`, `/auditor-portal`) are outside the gate.

See the [API reference](04-api-reference.md) for which endpoints require which guard.

## Content lifecycle (CMS) — and why the funnel is static

Two distinct content models coexist, and knowing which is which prevents the single most common mistake in this codebase.

**1. CMS-backed content (database).** The conformity-platform reference pages, the knowledge hub, the `/:slug` pages, navigation, and site settings are stored in Postgres (`pages`, `page_sections`, etc.) and rendered by fetching from the API. This content has a lifecycle:

- `content:export` dumps the live DB pages/nav/settings → `artifacts/api-server/src/content/snapshot/site-content.json`.
- `seed:site` restores that snapshot **only on an empty database** (override with `FORCE_SITE_SEED=true`).

> ⚠️ **Trap:** editing CMS rows directly in a running DB is not durable — a reseed/rebuild can revert it. If content is derived from the snapshot, fix the **snapshot** (the source), not the row.

**2. Static content (code).** The **CRA sales funnel** (`/`, `/product`, `/pricing`, `/deployment`, `/resources`, `/cra-check`, `/demo`) and the site header nav are **plain React/TypeScript compiled into the bundle**. They have **no CMS or seed dependency** and cannot revert on a database reset or rebuild. The home page was deliberately migrated from CMS-rendered to static for exactly this durability reason. When you add a funnel page, you add code — never a CMS row. See [How-to](08-how-to.md).

## The OXOT styleguide

Design tokens live in `artifacts/oxot-web/src/index.css` (Tailwind v4 `--color-*` / raw HSL vars), themed for light and dark:

- **Navy** `#0F1F2E` (dark surfaces) · **Dutch orange** `#F07000` (`--primary`, `--primary-ink`).
- Typography: **Newsreader** (serif display) · **Instrument Sans** (body) · **IBM Plex Mono** (mono/labels), exposed as `--font-display` etc.
- Utility classes: `.oxot-kicker` (12px / 600 / 0.18em orange eyebrow), `.cta-lift` (button hover lift), elevation `shadow-e1/e2/e3`.
- Standard shadcn tokens (`bg-card`, `text-muted-foreground`, `text-primary-foreground`, `border-border`, …) resolve in both themes.

Funnel pages use `PageHeader` (kicker + title + icon + description) for a consistent page head.

## Coding conventions

The repo's standing instructions ([`/CLAUDE.md`](../../CLAUDE.md)) codify the **Karpathy behavioural framework**:

1. **Think before coding** — no silent assumptions; clarify ambiguity.
2. **Simplicity first** — the minimum code that solves the problem; no speculative abstractions.
3. **Surgical changes** — touch only what the task needs; no drive-by reformatting or refactoring.
4. **Goal-driven execution** — define how success is verified, then verify (build, tests, or a rendered-page check) before declaring done.

Verification here means **Docker + a rendered check** (the Chrome plugin or Playwright), because the linux-pinned toolchain makes local Vite builds unreliable. See [Developer guide](03-developer-guide.md).
