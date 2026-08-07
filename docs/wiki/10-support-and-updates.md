# Support & updates

Operating the platform: routine maintenance, how to update safely, and a troubleshooting catalogue of real issues this codebase has hit and how they were resolved.

## Contents
- [Routine maintenance](#routine-maintenance)
- [Updating the application](#updating-the-application)
- [Updating dependencies](#updating-dependencies)
- [Backups & data safety](#backups--data-safety)
- [Troubleshooting catalogue](#troubleshooting-catalogue)
- [Where to look when something breaks](#where-to-look-when-something-breaks)

---

## Routine maintenance

- **Logs.** The API uses `pino`. Locally: `docker compose logs -f api`. On Railway: the service logs.
- **Regulatory news.** Runs daily via an in-process scheduler. Confirm it's enabled and check `lastRunAt` under `/admin/ai`. It needs a valid `OPENROUTER_API_KEY`.
- **Sessions & auth.** Sessions are signed with `SESSION_SECRET`. Rotating it invalidates all sessions (everyone must re-sign-in).
- **Health.** `GET /api/health` (or the health router) is a cheap liveness check; the public funnel routes returning 200 and `POST /api/lead` accepting a test payload confirm the front-to-back path.

## Updating the application

The deployment is a rebuild-from-source pipeline, so "update" means "commit and rebuild".

- **Local:** commit your change, then `docker compose build web api && docker compose up -d`.
- **Railway:** push to the tracked branch / merge to `main`. Railway rebuilds the `railway` stage of the `Dockerfile` from the new commit. Because the image is a full rebuild, static pages and code changes always take effect; the boot script re-runs schema push and (empty-DB) seeding. See [Deployment — Railway](07-deployment-railway.md).

**Durability guarantee:** the sales funnel and nav are static React compiled into the bundle — they cannot revert on a DB reset or rebuild. Schema changes are applied by the boot `migrate` step. CMS content changes must be captured into the snapshot to survive (see [How-to](08-how-to.md#edit-cms-content-and-capture-it-as-a-durable-seed)).

## Updating dependencies

1. Change the version in the relevant `package.json`.
2. Regenerate the lockfile (`pnpm install`) and **commit `pnpm-lock.yaml`** — the Docker build uses `--frozen-lockfile` and fails on a stale lock.
3. If the dependency is native/heavy and bundled by esbuild breaks, add it to the `external` array in `artifacts/api-server/build.mjs` (it will be resolved from `node_modules` at runtime, which the `api`/`railway` stages ship).
4. Rebuild in Docker to validate. Check the GitHub **Dependabot** alerts periodically and bump vulnerable transitive deps.

## Backups & data safety

- The database is a standard Postgres 16 instance. Back it up with `pg_dump`:
  ```bash
  docker compose exec -T db pg_dump -U oxot oxot > backup-$(date +%F).sql
  ```
  On Railway, use the managed Postgres backup facilities.
- The local `pgdata` Docker volume persists across `docker compose down`; `docker compose down -v` **destroys** it.
- The **content snapshot** (`artifacts/api-server/src/content/snapshot/site-content.json`) is the source of truth for CMS content and is version-controlled — treat it as a backup of the site's editorial content.

## Troubleshooting catalogue

Real issues seen in this codebase and their fixes. Search here before diagnosing from scratch.

| Symptom | Cause | Fix |
|---|---|---|
| A frontend change doesn't appear after "building" | Docker layer cache / built the wrong stage | Rebuild the right service (`docker compose build web`); verify the image contains your change by grepping the built asset (see [How-to → rebuild](08-how-to.md#rebuild-after-a-change)). |
| Local `vite build` fails: `Cannot find module '@rollup/rollup-darwin-arm64'` | Workspace pins native binaries to **linux-x64** | Don't build frontends locally — build in Docker. `tsc` type-checking still works locally. |
| Docker build fails at `pnpm install --frozen-lockfile` | `package.json` changed but `pnpm-lock.yaml` wasn't updated/committed | Run `pnpm install`, commit the lockfile. |
| A committed PDF 404s on Railway but works locally | `.gitignore` ignores `*.pdf`, so it never reached git | `git add -f <file>.pdf` and commit. |
| `/api/<thing>` returns 404 | Router path double-prefixed (route declared `/api/x` on a router already mounted at `/api`) | Declare routes relative (`/x`), not `/api/x`. |
| A report or AI endpoint 500s with an OpenAI/OpenRouter key error | Static client built with a dummy key at import time | Construct the client dynamically at call time from the configured key. |
| Source-library docs 404 / 403 or a `/conformity/...` deep link 301s to the SPA wrongly | File permissions (mode 600) or an nginx `$uri/` probe redirect | Ensure files are 644; use `try_files $uri @fallback` with `absolute_redirect off`. |
| `/conformity` (no trailing slash) falls through to the public site | Missing canonical redirect | nginx `location = /conformity { return 301 /conformity/; }` (already present). |
| Railway boot fails: pgvector extension missing / schema push prompts / port clash | Fresh DB without `vector`; drizzle interactive prompt; nginx and API both on one port | Boot script runs `CREATE EXTENSION IF NOT EXISTS vector`, uses additive/nullable schema changes, and puts the API on a separate internal port from nginx. See [Deployment](07-deployment-railway.md). |
| A conformity endpoint 500s reading a settings field (`…Config`) | Settings row absent → null dereference | Use null-safe settings getters (`row?.…`). |
| CMS content reverts after a rebuild | Edited the running DB but not the snapshot; or seed regenerated it | Capture into the snapshot (`content-export`) and commit; for marketing copy, prefer a static page. |
| A date renders as "0 December 2027" to crawlers | A count-up animation on a fixed date | Don't animate dates — render them statically. |
| `/api/conformity/portfolio` returns 401 | It's auth-gated | Expected without a session — not a bug. Sign in. |

## Where to look when something breaks

1. **API logs** (`docker compose logs -f api` / Railway logs) — the JSON error envelope includes an `X-Request-Id` you can trace to a log line.
2. **nginx routing** — `docker/nginx.conf` and `docker/nginx.railway.conf.template`.
3. **Boot sequence** — `docker/railway-start.sh` (extension, schema push, seed, process start).
4. **The relevant router** — `artifacts/api-server/src/routes/` (see the [API reference](04-api-reference.md)).
5. **The database** — `docker compose exec db psql` (see the [Data model](05-data-model.md)).
6. **This wiki's troubleshooting table** above — most recurring issues are already catalogued.
