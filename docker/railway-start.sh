#!/usr/bin/env bash
# Boot script for the single-container Railway deployment (`railway` stage).
#
# Order of operations:
#   1. Render nginx config onto Railway's injected $PORT (API stays internal
#      on 127.0.0.1:8080).
#   2. Push the Drizzle schema (same push-force the local compose `migrate`
#      one-shot runs; idempotent when the schema is unchanged).
#   3. Run the guarded seeds — seed:site restores the content snapshot only
#      on an empty database, and the conformity/demo seeds are idempotent —
#      best-effort so a transient seed failure never blocks boot (the API
#      also self-heals baseline data).
#   4. Start the API and nginx; exit when either dies so Railway restarts us.
set -euo pipefail

NGINX_PORT="${PORT:-80}"
sed "s/__PORT__/${NGINX_PORT}/" /etc/nginx/templates/railway.conf.template \
  > /etc/nginx/conf.d/railway.conf

echo "[railway-start] pushing database schema…"
pnpm --filter @workspace/db run push-force

echo "[railway-start] running guarded seeds…"
pnpm --filter @workspace/api-server run seed:site \
  || echo "[railway-start] seed:site failed (continuing)"
pnpm --filter @workspace/api-server run seed:conformity \
  || echo "[railway-start] seed:conformity failed (continuing)"
pnpm --filter @workspace/api-server run seed:demo \
  || echo "[railway-start] seed:demo failed (continuing)"

echo "[railway-start] starting API on 127.0.0.1:8080 and nginx on :${NGINX_PORT}"
PORT=8080 node --enable-source-maps artifacts/api-server/dist/index.mjs &
nginx -g 'daemon off;' &

# Surface whichever process exits first; ON_FAILURE restart policy takes over.
wait -n
exit $?
