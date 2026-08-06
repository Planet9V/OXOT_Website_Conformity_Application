# Running locally with Docker

Docker cannot run inside the Replit workspace, so this is for your own machine:
clone/download the project, then run everything with docker compose.

## Prerequisites
- Docker Desktop (or Docker Engine + compose plugin)
- On Apple Silicon: images build for `linux/amd64` (the workspace pins x64
  binaries); Docker runs them via emulation automatically.

## Quick start

```bash
cp .env.docker.example .env    # then edit: SESSION_SECRET, ADMIN_PASSWORD
docker compose up --build
```

Then open:

| URL | App |
| --- | --- |
| http://localhost:8088/ | OXOT public site |
| http://localhost:8088/conformity/ | OXOT Conformity workbench |
| http://localhost:8088/conformity-briefing/ | Briefing slides |
| http://localhost:8088/api/... | API |

What happens on first start:
1. `db` — Postgres 16 with a persistent `pgdata` volume.
2. `migrate` — one-shot Drizzle schema push into the local database.
3. `seed` — one-shot explicit seeding: the regulatory reference layer
   (regulations, CRA requirements catalogue, product classes, routes) and the
   example CRA workspace (NovaGuard product, assessment, SBOM analysis, the
   `cra-default` CRA workflow + a running flow). Idempotent: the reference
   layer is refreshed to the canonical catalogue and the demo workspace is
   reset to its baseline; your own products/assessments are never touched.
4. `api` — the bundled API server. It additionally self-heals missing
   baseline data on boot (same behavior as production), so the CRA workflow
   can never disappear.
5. `web` — nginx serving the three static frontends and proxying `/api`,
   mirroring Replit's path routing.

Log in to the workbench with the `ADMIN_USERNAME` / `ADMIN_PASSWORD` from
your `.env`.

## Local limitations
- **File uploads (evidence attachments, BOM files stored as objects)** use
  Replit App Storage via a sidecar that only exists on Replit — uploads are
  unavailable in local Docker. Everything database-backed (assessments, flows,
  reports, BOM analysis, PSIRT, assistant) works.
- **Assistant embeddings / RAG** need `OPENROUTER_API_KEY` in `.env`
  (optional; the app degrades gracefully without it).
- **Deadline alert emails** rely on an external cron hitting
  `/api/cron/conformity-alerts` in production; locally the in-process timer
  covers it while the container runs, but email sending still needs SMTP
  credentials configured in the admin settings.

## Site content lifecycle (keeping the seed current)

Site content (CMS pages + sections, navigation, site settings) is seeded from
a versioned snapshot: `artifacts/api-server/src/content/snapshot/site-content.json`.

- **On every deploy** the `seed` service runs `seed:site`, which restores the
  snapshot **only when the database has no pages** (fresh deployment). On a
  live database it is a no-op, so admin edits are never clobbered by
  `docker compose up`.
- **After editing content in the CMS admin**, export the live database back
  into the snapshot and commit it — this is how admin edits become part of
  the seed:

  ```bash
  docker compose run --rm content-export
  git add artifacts/api-server/src/content/snapshot/site-content.json
  git commit -m "Content: export CMS edits to seed snapshot"
  ```

- **To force a database back to the snapshot** (e.g. reset a demo):

  ```bash
  docker compose run --rm -e FORCE_SITE_SEED=true seed \
    pnpm --filter @workspace/api-server run seed:site
  ```

The legacy scripts (`seed`, `seed:content`, `seed:customer-site`) remain for
bootstrapping a brand-new deployment that has no snapshot yet; once content
exists, `content-export` supersedes them as the source of truth.

## Useful commands

```bash
docker compose up -d --build      # run in background
docker compose logs -f api        # follow API logs (bootstrap/seed messages)
docker compose down               # stop (keeps database volume)
docker compose down -v            # stop AND wipe the local database
docker compose run --rm content-export   # export live CMS content to the seed snapshot
```
