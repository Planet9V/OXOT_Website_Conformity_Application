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

NGINX_PORT="${PORT:-8080}"
# The API must never share nginx's port (the base image bakes PORT=8080 and
# Railway may inject the same value) — bump the internal API port on clash.
API_PORT=8080
if [ "${NGINX_PORT}" = "${API_PORT}" ]; then
  API_PORT=8081
fi
sed -e "s/__PORT__/${NGINX_PORT}/" -e "s/__API_PORT__/${API_PORT}/" \
  /etc/nginx/templates/railway.conf.template \
  > /etc/nginx/conf.d/railway.conf

echo "[railway-start] ensuring database and pgvector extension…"
(cd /app/lib/db && node -e "
const { Client } = require('pg');
const target = process.env.DATABASE_URL;
(async () => {
  // The app must own a dedicated database: pushing the schema into a
  // database shared with another application makes drizzle-kit raise
  // interactive rename prompts (fatal without a TTY) and risks destructive
  // changes to foreign tables. Create the named database if it is missing.
  const probe = new Client({ connectionString: target });
  try {
    await probe.connect();
    await probe.end();
  } catch (e) {
    if (e.code !== '3D000') throw e; // 3D000 = database does not exist
    const admin = new URL(target);
    const dbName = decodeURIComponent(admin.pathname.slice(1));
    admin.pathname = '/postgres';
    if (!/^[A-Za-z_][A-Za-z0-9_-]*\$/.test(dbName)) throw new Error('unsafe database name: ' + dbName);
    const a = new Client({ connectionString: admin.toString() });
    await a.connect();
    await a.query('CREATE DATABASE \"' + dbName + '\"');
    await a.end();
    console.log('[railway-start] created database ' + dbName);
  }
  const c = new Client({ connectionString: target });
  await c.connect();
  await c.query('CREATE EXTENSION IF NOT EXISTS vector');
  await c.end();
  console.log('[railway-start] pgvector extension present');
})().catch((e) => { console.error('[railway-start] database bootstrap failed:', e.message); process.exit(1); });
")

echo "[railway-start] pushing database schema…"
pnpm --filter @workspace/db run push-force

echo "[railway-start] running guarded seeds…"
pnpm --filter @workspace/api-server run seed:site \
  || echo "[railway-start] seed:site failed (continuing)"
pnpm --filter @workspace/api-server run seed:conformity \
  || echo "[railway-start] seed:conformity failed (continuing)"
pnpm --filter @workspace/api-server run seed:demo \
  || echo "[railway-start] seed:demo failed (continuing)"

echo "[railway-start] starting API on 127.0.0.1:${API_PORT} and nginx on :${NGINX_PORT}"
PORT="${API_PORT}" node --enable-source-maps artifacts/api-server/dist/index.mjs &
nginx -g 'daemon off;' &

# Surface whichever process exits first; ON_FAILURE restart policy takes over.
wait -n
exit $?
