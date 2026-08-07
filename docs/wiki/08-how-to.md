# How-to recipes

Task-oriented recipes for the things people actually do in this codebase. Each is self-contained; commands assume the repo root and a running Docker stack unless noted.

## Contents
- [Add a page to the sales funnel](#add-a-page-to-the-sales-funnel)
- [Edit CMS content and capture it as a durable seed](#edit-cms-content-and-capture-it-as-a-durable-seed)
- [Add a collateral PDF to /resources](#add-a-collateral-pdf-to-resources)
- [Change the daily regulatory-news generation](#change-the-daily-regulatory-news-generation)
- [Add a new lead-capture source](#add-a-new-lead-capture-source)
- [Rebuild after a change](#rebuild-after-a-change)
- [Inspect the database](#inspect-the-database)
- [Reset local data from scratch](#reset-local-data-from-scratch)

---

## Add a page to the sales funnel

See [Developer guide → add a funnel page](03-developer-guide.md#recipe-add-a-funnel-page-static). In short: a new `src/pages/*.tsx`, a route in `App.tsx`, optionally an entry in `FUNNEL_NAV`, then `docker compose build web`. The page is static — no CMS, durable across rebuilds.

## Edit CMS content and capture it as a durable seed

CMS pages (conformity-platform reference, `/:slug` pages, knowledge hub) live in the database. Editing them in the admin console changes the **running** DB, but that change is **not durable** until it is captured into the snapshot seed.

1. Edit content in the admin CMS (`/admin/pages`, `/admin/menus`, `/admin/settings`).
2. Export the live DB content into the snapshot the repo ships:
   ```bash
   docker compose run --rm content-export
   ```
   This writes `artifacts/api-server/src/content/snapshot/site-content.json`.
3. **Commit** the updated snapshot. Now a fresh DB (`seed:site` on empty) restores your edits.

> The snapshot only restores on an **empty** DB. To force it onto an existing DB, set `FORCE_SITE_SEED=true` for the seed step. And remember: **if content is derived from the snapshot, edit the snapshot** — editing generated rows gets overwritten on the next reseed.

For marketing/sales copy, prefer a **static page** instead (no lifecycle at all) — that's why the funnel is code.

## Add a collateral PDF to /resources

1. Drop the PDF into `artifacts/oxot-web/public/collateral/`.
2. `.gitignore` ignores `*.pdf`, so track it explicitly:
   ```bash
   git add -f artifacts/oxot-web/public/collateral/<file>.pdf
   ```
   (If it isn't committed, the local Docker build still serves it from disk, but **Railway builds from git and will 404 it**.)
3. Reference it from `artifacts/oxot-web/src/pages/resources.tsx` as `/collateral/<file>.pdf`.
4. `docker compose build web`.

## Change the daily regulatory-news generation

The regulatory-news corpus is regenerated on a schedule (default **07:00 America/Chicago**) via an in-process timer.

- **Toggle / retime / run now** from the admin AI page (`/admin/ai` → News scheduler), which calls the admin settings endpoints (`GET/PUT /api/admin/settings/regulatory-news`, `POST …/run`).
- The config is stored in `app_settings.regulatoryNewsConfig` (`enabled`, `hourLocal`, `timezone`, `lastRunAt`).
- Generation uses OpenRouter web search + title de-dup insert (`artifacts/api-server/src/lib/regulatoryNewsGenerator.ts`). Requires `OPENROUTER_API_KEY` and a search-capable model.
- The public corpus renders at `/news`; the compact 3-up strip appears on the home page.

## Add a new lead-capture source

All lead capture funnels into one table (`leads`) via `POST /api/lead`. To add a new capture surface:

1. `POST /api/lead` with `{ name, email, company, role, blocker, message, segment, source, website (honeypot), locale }`.
2. Set a distinct `source` string (e.g. `"demo"`, `"cra_selfcheck"`, `"webinar"`) so leads are attributable in `/admin/leads`.
3. The endpoint validates name/email, drops honeypot submissions silently, and rate-limits by IP + email. No new table needed.

## Rebuild after a change

```bash
# frontend change (oxot-web / conformity / briefing)
docker compose build web && docker compose up -d web

# API change
docker compose build api && docker compose up -d api

# both
docker compose build web api && docker compose up -d
```

To verify a rebuilt image actually contains your change, grep the built asset:
```bash
docker run --rm --entrypoint sh <image> -c 'grep -rl "<a string from your change>" /usr/share/nginx/html/oxot/assets/'
```

## Inspect the database

```bash
docker compose exec db psql -U oxot -d oxot            # interactive
docker compose exec -T db psql -U oxot -d oxot -c "\dt"           # list tables
docker compose exec -T db psql -U oxot -d oxot -c "select count(*) from conformity_products;"
```

The local database is `oxot` (user `oxot`, password from `POSTGRES_PASSWORD`, default `oxot`). See [Data model](05-data-model.md) for table names.

## Reset local data from scratch

```bash
docker compose down -v        # -v drops the pgdata volume (DESTROYS local data)
docker compose up -d          # migrate + seed repopulate an empty DB from the snapshot
```

Use this to reproduce a clean first-boot (and to confirm the snapshot seed is correct). Static funnel pages are unaffected either way — they don't depend on the DB.
