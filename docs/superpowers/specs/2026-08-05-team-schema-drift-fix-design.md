# Team Page Schema-Drift Fix — Design

**Date:** 2026-08-05
**Status:** Approved

## Problem

The `/conformity/team` page failed with constant 500s on every list/create of
team members. Root cause: the live Postgres table `conformity_members` was
missing seven columns (`position`, `email`, `telephone`, `department`,
`organization`, `role_responsibility`, `plain_password`) that the committed
Drizzle schema (`lib/db/src/schema/conformityMembers.ts`) defines. Drizzle
selects every schema column, so all queries against the table failed.

The drift mechanism: the compose stack already orders `db → migrate → seed →
api`, but the `migrate` service pushes the schema **baked into its image**.
The documented quick-start rebuilds only `web` and `api`
(`docker compose build --no-cache web api`), so the `migrate` image goes
stale and pushes an outdated schema, while the `api` service hot-mounts
current source via `docker-compose.override.yml` and expects the new one.

The live DB was already patched manually with additive
`ALTER TABLE ... ADD COLUMN IF NOT EXISTS` statements matching the schema
defaults. This design covers the two durable fixes.

## Fix 1 — Migrate always pushes the current schema

Add a `migrate` entry to `docker-compose.override.yml` mounting the schema
source read-only, mirroring the existing api hot-reload pattern:

```yaml
  migrate:
    volumes:
      - ./lib/db/src:/app/lib/db/src:ro
      - ./lib/db/drizzle.config.ts:/app/lib/db/drizzle.config.ts:ro
```

The mount is narrow (`lib/db/src` + config, not all of `./lib`) so the
container's pnpm `node_modules` layout is not shadowed. `drizzle-kit push`
reads the schema TS files at runtime, so a stale image can no longer push a
stale schema. No changes to `docker-compose.yml`; the existing dependency
chain already runs migrate before the API.

## Fix 2 — Revert symptom-chasing workarounds in adminTeam.ts

`git restore artifacts/api-server/src/routes/adminTeam.ts` to HEAD, dropping
uncommitted changes that chased the wrong symptom:

- explicit next-ID calculation on insert (racy; serial sequence handles this)
- double `setval` sequence syncs after insert
- pre-insert username existence check (the unique constraint plus the
  existing `isUniqueViolation` handler already returns a clean 400)

Kept as-is (out of scope):

- new tests in `usersAndPermissions.test.ts` — they assert only the API
  contract (200, `id > 0`, login works) and pass with the restored route
- `conformityBootstrap.ts` member seeding and `seedDemo.ts` changes

## Verification

1. `docker compose up migrate` exits 0 and `\d conformity_members` still
   shows all 16 columns.
2. Restart api; `POST /api/admin/team` via curl creates a member; confirm
   the member renders on `/conformity/team` in the browser.
3. Users-and-permissions test suite passes.
