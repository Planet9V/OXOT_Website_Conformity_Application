# Installation — Docker (local)

How to build and run the entire stack locally with `docker compose`. This is the supported development and testing path (the toolchain is pinned to linux-x64, so this is also the only reliable way to build the frontends off a linux host).

## Contents
- [Prerequisites](#prerequisites)
- [Quick start](#quick-start)
- [The compose services](#the-compose-services)
- [Seeds and content export](#seeds-and-content-export)
- [Verifying the stack](#verifying-the-stack)
- [Common commands](#common-commands)
- [Resetting](#resetting)

---

## Prerequisites

- **Docker** with **Compose v2** (`docker compose`, not `docker-compose`).
- Ports **8088** (web) and **5432** (Postgres, if you expose it) free.

No local Node/pnpm needed.

## Quick start

```bash
git clone <repo-url>
cd OXOT_Website_Conformity_Application
docker compose up -d          # builds images on first run, then starts everything
```

Open **http://localhost:8088**. The first run builds all apps in the `build` stage (a few minutes), then starts the database, applies the schema, seeds content, and starts the API + nginx.

## The compose services

`docker-compose.yml` (with `docker-compose.override.yml`) defines:

| Service | Role | Notes |
|---|---|---|
| **db** | Postgres 16 + pgvector (`pgvector/pgvector:pg16`) | Database `oxot`, user `oxot`, password from `POSTGRES_PASSWORD` (default `oxot`). Data persists in the `pgdata` volume. |
| **migrate** | Applies the Drizzle schema to the DB | Runs once, waits for `db` healthy, then exits. Applies additive schema changes (e.g. new columns). |
| **seed** | Seeds content into an empty DB | Runs after `migrate`, then exits. Restores the CMS snapshot when the DB is empty. |
| **content-export** | Exports live DB content → snapshot | Run on demand (`docker compose run --rm content-export`), not part of the default `up`. |
| **api** | The Express API | Built from the `api` stage; serves `/api`. Depends on `seed` completing. |
| **web** | nginx serving the three SPAs + proxying `/api` | Built from the `web` stage. **Published on `8088:80`.** |

The `build`, `api`, and `web` targets all derive from the Dockerfile's `build` stage, which runs `typecheck:libs` and builds the API (esbuild) and all three frontends (Vite) with the correct `BASE_PATH` for each.

## Seeds and content export

- **Seeding** happens automatically on an empty DB via the `seed` service. It restores `artifacts/api-server/src/content/snapshot/site-content.json`.
- **Force a reseed** onto a non-empty DB by setting `FORCE_SITE_SEED=true` for the seed step.
- **Export** the current live content back into the snapshot (after editing in the admin CMS):
  ```bash
  docker compose run --rm content-export
  ```
  Then commit the updated `site-content.json`. See [How-to](08-how-to.md#edit-cms-content-and-capture-it-as-a-durable-seed).

There are additional seed scripts in `artifacts/api-server` (`seed`, `seed:conformity`, `seed:demo`, `seed:content`, `seed:site`) for specific data sets.

## Verifying the stack

```bash
# routes serve (SPA returns 200)
for p in / /cra-check /demo /pricing /product /deployment /resources; do
  echo "$p -> $(curl -s -o /dev/null -w '%{http_code}' http://localhost:8088$p)"
done

# API is up
curl -s "http://localhost:8088/api/regulatory-news?limit=1" -o /dev/null -w "news -> %{http_code}\n"

# lead capture works end-to-end
curl -s -X POST http://localhost:8088/api/lead -H 'content-type: application/json' \
  -d '{"name":"Test","email":"t@example.com","company":"ACME","segment":"manufacturer","source":"cra_selfcheck"}' \
  -w "\nlead -> %{http_code}\n"

# database has data
docker compose exec -T db psql -U oxot -d oxot -c \
  "select count(*) from conformity_products;"
```

Then verify visually in a browser (or the Chrome plugin) against `http://localhost:8088`.

## Common commands

```bash
docker compose up -d                 # start (build if needed)
docker compose build web api         # rebuild after code changes
docker compose up -d web             # restart just the web service
docker compose logs -f api           # follow API logs
docker compose ps                    # service status
docker compose exec db psql -U oxot -d oxot   # database shell
docker compose down                  # stop (keep data)
```

## Resetting

```bash
docker compose down -v   # stop AND drop the pgdata volume (destroys local data)
docker compose up -d     # clean first boot: migrate + seed from snapshot
```

The static funnel pages don't depend on the database, so they render identically before and after a reset — a good way to confirm durability.
