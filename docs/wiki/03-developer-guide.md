# Developer guide

Everything you need to make a change confidently: prerequisites, the build system, conventions, and step-by-step recipes for the common change types.

## Contents
- [Prerequisites](#prerequisites)
- [Getting the stack running](#getting-the-stack-running)
- [The build system](#the-build-system)
- [Conventions](#conventions)
- [Verification workflow](#verification-workflow)
- [Recipe: add a funnel page (static)](#recipe-add-a-funnel-page-static)
- [Recipe: add an API endpoint](#recipe-add-an-api-endpoint)
- [Recipe: add or change a database column](#recipe-add-or-change-a-database-column)
- [Recipe: change the site navigation](#recipe-change-the-site-navigation)

---

## Prerequisites

- **Docker** (Desktop or Engine) with Compose v2 — this is the primary development environment.
- **git** and the **GitHub CLI** (`gh`) for PRs.
- A modern browser. Visual verification uses the **Chrome plugin** (or headless **Playwright**).

You do **not** need a local Node/pnpm toolchain to build or run this project. The workspace pins native binaries to **linux-x64** (see `pnpm-workspace.yaml`), so full Vite builds only work inside Docker. Develop and verify through Docker.

## Getting the stack running

```bash
docker compose up -d          # build (first time) + start db, migrate, seed, api, web
# open http://localhost:8088
docker compose logs -f api    # follow API logs
docker compose down           # stop (keeps the pgdata volume)
```

Full details, seeds and content export are in [Installation — Docker](06-installation-docker.md).

## The build system

Each app builds differently; the Dockerfile `build` stage runs them all in order.

| Target | Tool | Command | Output |
|---|---|---|---|
| `lib/db`, `lib/api-zod` | `tsc --build` | `pnpm run typecheck:libs` | `dist/` + `.d.ts` (consumed by the apps) |
| `api-server` | **esbuild** (`build.mjs`) | `pnpm --filter @workspace/api-server run build` | `dist/index.mjs` (single ESM bundle) |
| `oxot-web` | **Vite** | `BASE_PATH=/ pnpm --filter @workspace/oxot-web run build` | `dist/public/` |
| `conformity` | Vite | `BASE_PATH=/conformity/ … run build` | `dist/public/` |
| `conformity-briefing` | Vite | `BASE_PATH=/conformity-briefing/ … run build` | `dist/public/` |

Key facts:

- **esbuild does not type-check.** The api-server ships even if `tsc` would complain. Type errors in the API are caught only by the separate `typecheck` script (not run in the Docker build). Some pre-existing type errors exist and are harmless to the build.
- **esbuild externalizes heavy/native deps** (see the `external` array in `artifacts/api-server/build.mjs`) — e.g. `@react-pdf/renderer` and `react` are resolved from `node_modules` at runtime, which is why the `api`/`railway` stages ship `node_modules`.
- **Adding a runtime dependency** means editing `package.json` **and** committing the updated `pnpm-lock.yaml` — the Docker build runs `pnpm install --frozen-lockfile`, which fails if the lockfile is stale.

## Conventions

Follow [`/CLAUDE.md`](../../CLAUDE.md) (the Karpathy rules): minimum code, surgical changes, no speculative abstractions, verify before declaring done. Beyond that:

- **Styleguide.** Use the tokens and utilities in [Architecture → styleguide](01-architecture.md#the-oxot-styleguide): `oxot-kicker`, `cta-lift`, `shadow-e1/e2/e3`, `text-primary-foreground` (never `text-on-accent` — it isn't defined here), `font-display`. Wrap funnel pages in `PageHeader`.
- **Routing** is `wouter`, not React Router. Data fetching is TanStack Query via the generated hooks in `@workspace/api-client-react` (or plain `fetch` for the funnel's own `/api/lead`).
- **Durability first.** Prefer static React for sales/marketing content over CMS rows — CMS content can revert on reseed. See [Architecture → content lifecycle](01-architecture.md#content-lifecycle-cms--and-why-the-funnel-is-static).
- **Icons** come from `lucide-react`. **PDFs/static assets** go in `artifacts/oxot-web/public/…` and are served from the bundle. Note `.gitignore` ignores `*.pdf` — commit intended PDFs with `git add -f`.

## Verification workflow

Because local Vite builds don't run on non-linux hosts, verify like this:

1. **Type-check what you can** — `tsc` is platform-independent. New/changed TypeScript should type-check even when the full Vite build can't run.
2. **Build in Docker** — `docker compose build web api` runs the real linux build of every app. This is the authoritative "does it compile" gate.
3. **Run the stack** — `docker compose up -d`, then smoke-test endpoints with `curl` and confirm the DB with `docker compose exec db psql`.
4. **Verify visually** — use the **Chrome plugin** against `http://localhost:8088`, or a headless Playwright script, to confirm pages render and flows work. Verify against the **rendered DOM**, not HTML source.

## Recipe: add a funnel page (static)

1. Create `artifacts/oxot-web/src/pages/<name>.tsx`. Use `PageHeader`, styleguide tokens, and a `Book a demo` CTA to `/demo`.
2. Register the route in `artifacts/oxot-web/src/App.tsx` (inside `PublicRoutes`, before the `/:slug` catch-all): wrap it in `PublicRoute`. Because `PublicRoutes` is mounted at both `/` and (nested) `/nl`, the page is automatically reachable at `/nl/<name>` too.
3. **If the page should be localized**, follow the pattern already used by every other page: a module-level `const copy = { en: {...}, nl: {...} } as const;` holding every visible string, consumed via `const { locale } = useLocale(); const t = copy[locale];`. Approved Dutch terminology lives in `docs/plans/dutch-i18n/glossary.md` — reuse it rather than re-translating terms ad hoc. Content sourced from an API/DB is left untranslated by convention (commented as such), not force-translated.
4. If it should appear in the header/footer nav, add its `href` to `FUNNEL_NAV` in `header.tsx` (an `{href}[]` array — hrefs only) **and** its display label to `header.tsx`'s own `copy.en.nav[]` / `copy.nl.nav[]` arrays (same index), plus the matching entry in `footer.tsx`'s `copy` object if it belongs in the footer too.
5. `docker compose build web && docker compose up -d`, then check the page in the browser (both `/<name>` and `/nl/<name>` if localized).

No CMS row, no seed — the page is durable by construction.

## Recipe: add an API endpoint

1. Create or extend a router in `artifacts/api-server/src/routes/<name>.ts` (`const router = Router(); router.post("/path", handler); export default router;`).
2. Mount it in `artifacts/api-server/src/routes/index.ts` with `router.use(<name>Router)` (everything is under the global `/api` prefix; pass a sub-prefix to `router.use("/prefix", …)` if needed).
3. Add rate limiting for public endpoints via `../middlewares/rateLimit`. Validate input (inline or with an `@workspace/api-zod` schema). Honour the honeypot pattern for public forms.
4. If it reads/writes data, import `{ db, <table> }` from `@workspace/db`.
5. `docker compose build api && docker compose up -d`, then `curl` the endpoint. See the [API reference](04-api-reference.md) for the existing patterns.

## Recipe: add or change a database column

1. Edit the table in `lib/db/src/schema/<file>.ts`. **Prefer additive, nullable columns** — they apply cleanly via the boot schema push with no data migration and no interactive prompt.
2. Rebuild the libs so the API sees the new type: it happens automatically in the Docker `build` stage (`typecheck:libs`).
3. On boot, the `migrate` step (drizzle push) applies the change to the database. Verify with `docker compose exec db psql -U oxot -d oxot -c "\d <table>"`.
4. Avoid destructive changes (drops/renames) casually — drizzle push can prompt interactively and stall an automated boot.

## Recipe: change the site navigation

The public header nav is **static**: `FUNNEL_NAV` in `header.tsx` holds the `href`s (an `{href}[]` array, no labels), and the visible labels live in that same file's locale `copy.en.nav[]` / `copy.nl.nav[]` arrays, matched by index — edit both and rebuild. `footer.tsx` mirrors the same pattern independently. The workbench and admin navs are their own components. The legacy CMS-driven navigation table still exists but no longer drives the public header (see [Architecture](01-architecture.md)).
