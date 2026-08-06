#!/bin/bash
set -e
pnpm install --frozen-lockfile
pnpm --filter db push

# Seed the CRA reference layer and the public demo sandbox. Both are idempotent:
# seed:conformity clears + repopulates the reference tables; seed:demo upserts the
# demo product/assessment and resets its transactional state. seed:demo depends on
# the reference layer, so it must run after seed:conformity.
pnpm --filter @workspace/api-server run seed:conformity
pnpm --filter @workspace/api-server run seed:demo

# Backfill the stable page identity (service_key) for any pre-existing rows so
# related-service wiring keeps working after slug renames. Idempotent: only
# fills nulls, using the current slug as the initial canonical identity.
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c \
  "UPDATE pages SET service_key = slug WHERE service_key IS NULL;"
