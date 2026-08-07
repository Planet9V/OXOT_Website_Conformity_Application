# Deployment — Railway

Production runs as a **single container** (Node API + nginx) built from the `railway` stage of the root `Dockerfile`. This page covers the Dockerfile stages, the Railway boot sequence, how to deploy, and the full environment-variable reference (which also applies to local Docker).

## Contents
- [The Dockerfile stages](#the-dockerfile-stages)
- [The Railway boot sequence](#the-railway-boot-sequence)
- [Deploying](#deploying)
- [Environment variables](#environment-variables)
- [Notes & gotchas](#notes--gotchas)

---

## The Dockerfile stages

The root `Dockerfile` (base `node:24-slim`, pnpm 10) is multi-stage:

| Stage | Base | Role |
|---|---|---|
| **build** | `node:24-slim` | Installs with `pnpm install --frozen-lockfile`, runs `typecheck:libs`, then builds the API (esbuild) and all three SPAs (Vite) with the right `BASE_PATH` each (`/`, `/conformity/`, `/conformity-briefing/`). Contains a manual cache-buster (`RUN echo "Rebuild trigger: …"`). |
| **api** | `node:24-slim` | `COPY --from=build /app /app`; `CMD node --enable-source-maps artifacts/api-server/dist/index.mjs`. Used by local compose. |
| **web** | `nginx:1.27-alpine` | Serves the three built SPAs + `docker/nginx.conf` (proxies `/api/` → `api:8080`). Used by local compose. |
| **railway** | `build` | **The final stage — what Railway builds.** Installs nginx, copies the three SPAs into `/usr/share/nginx/html/{oxot,conformity,conformity-briefing}`, installs `docker/nginx.railway.conf.template` and `docker/railway-start.sh`, and `CMD ["/usr/local/bin/railway-start.sh"]` — one container running **both** the Node API and nginx. |

Because `railway` is the last stage, `railway.json`'s `DOCKERFILE` builder selects it automatically, while compose pins the named `api`/`web`/`build` stages. There is no separate migrate/seed image — seeding runs as compose one-shots locally and inline in `railway-start.sh` on Railway.

## The Railway boot sequence

`railway.json`: builder `DOCKERFILE`, `healthcheckPath: /api/healthz`, `healthcheckTimeout: 300`, `restartPolicyType: ON_FAILURE` (max 10 retries).

`docker/railway-start.sh` runs, in order:

1. **Ports.** `NGINX_PORT = $PORT` (Railway-injected, usually 8080); `API_PORT = 8080`, bumped to **8081** if it would clash with nginx. Renders `nginx.railway.conf.template` (substituting the two ports) to `/etc/nginx/conf.d/railway.conf`.
2. **Database + pgvector self-provisioning.** A small inline Node script connects to `DATABASE_URL`; if the target database is missing (Postgres `3D000`), it connects to the admin `/postgres` DB and `CREATE DATABASE` (name validated against an identifier regex), then `CREATE EXTENSION IF NOT EXISTS vector`. Fatal on failure.
3. **Schema push.** `pnpm --filter @workspace/db run push-force` (idempotent Drizzle push — applies additive schema changes like the `leads.segment`/`source` columns).
4. **Guarded seeds** (best-effort; a failure never blocks boot): `seed:site`, `seed:conformity`, `seed:demo`. `seed:site` restores the content snapshot **only on an empty DB** unless `FORCE_SITE_SEED=true`.
5. **Start both processes.** `PORT=$API_PORT node … dist/index.mjs &` and `nginx -g 'daemon off;' &`, then `wait -n` — whichever exits first ends the container and Railway restarts it.

`nginx.railway.conf.template` mirrors `docker/nginx.conf` exactly except it listens on the injected `PORT` and proxies `/api/` to `127.0.0.1:<API_PORT>` (with `proxy_buffering off` / `proxy_read_timeout 300s` for SSE). Net topology: **one container**, nginx on `$PORT`, API on `127.0.0.1:8081` (or 8080).

## Deploying

Railway builds the final `railway` stage from the tracked repo and runs the boot script.

```bash
# Git-based (connected repo): push to the deployment branch / merge to main
git push          # Railway auto-builds the Dockerfile's last (railway) stage

# Or via the Railway CLI from the repo root
railway up
```

Because the image is a full rebuild from git, code and static-page changes always take effect, and the committed lockfile must be current (`--frozen-lockfile`). Set the service variables below before the first deploy. Health check: `GET /api/healthz`.

> **Durability:** the sales funnel and nav are static (compiled into the SPA bundle) and cannot revert. Schema changes apply via the boot push. CMS content only persists across a fresh deploy if it's in the committed snapshot (`seed:site`). Committed static assets (e.g. `/collateral/*.pdf`, force-added past `.gitignore`) ship in the build.

## Environment variables

The API reads these (source files noted by the audit include `adminAuth.ts`, `lib/db/src/index.ts`, `index.ts`, `llm.ts`, `embeddings.ts`, `objectStorage.ts`, `mailer.ts`, `alertsCron.ts`).

### Required

| Var | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string (must have pgvector). The DB client throws if unset. |
| `PORT` | API listen port. Railway injects it; the boot script routes the API to 8081 on clash. |
| `SESSION_SECRET` | Signs admin/session cookies. Required to create sessions; compose enforces it. |
| `ADMIN_PASSWORD` | Admin login password. Code default `admin`, but compose/production should set a real value. |

### Common optional (with defaults)

| Var | Purpose | Default |
|---|---|---|
| `NODE_ENV` | Runtime mode. | `production` (api/railway) |
| `ADMIN_USERNAME` | Admin login username. | `admin` |
| `DEMO_USERNAME` / `DEMO_PASSWORD` | Rotatable demo-account credentials. | built-in defaults |
| `DEMO_READONLY` | When `"true"`, blocks demo-role writes across conformity routes. | off |
| `COOKIE_SECURE` | Sets the `secure` flag on the session cookie. | off |
| `FORCE_SITE_SEED` | When `"true"`, `seed:site` overwrites content even on a populated DB. | off |
| `POSTGRES_PASSWORD` | Compose-only: password for the `db` container + composed `DATABASE_URL`. | `oxot` |
| `LOG_LEVEL` | pino log level. | `info` |

### AI / OpenRouter

| Var | Purpose | Default |
|---|---|---|
| `OPENROUTER_API_KEY` | LLM/embeddings key (news, reports, assistant). May also be stored in the DB (DB takes priority). | — (features error without a key) |
| `OPENROUTER_BASE_URL` | OpenAI-compatible base URL. | `https://openrouter.ai/api/v1` |
| `OPENROUTER_REASONING_MODEL` | Reasoning model id. | `deepseek/deepseek-r1` (compose) |
| `OPENROUTER_EMBEDDING_MODEL` | Embedding model id. | `qwen/qwen3-embedding-8b` |
| `OPENROUTER_IMAGE_MODEL` / `OPENROUTER_TTS_MODEL` | Image / TTS model ids. | `qwen/qwen-image-3-pro` / `qwen/qwen-audio-3.0-tts-flash` |
| `OPENAI_API_KEY` | Fallback LLM key if OpenRouter unset (else a dummy local-dev key). | — |
| `AI_INTEGRATIONS_OPENAI_BASE_URL` / `_API_KEY` | Alternate OpenAI-compatible endpoint. | — |

### Feature-gated / integration

| Var | Purpose |
|---|---|
| `CONFORMITY_ALERTS_CRON_SECRET` | Bearer token gating `POST /api/cron/conformity-alerts` (disabled if unset). |
| `PRIVATE_OBJECT_DIR` / `PUBLIC_OBJECT_SEARCH_PATHS` | Object-storage config (feature errors if used without them). |
| `PUBLIC_WEB_URL` / `PUBLIC_API_URL` / `PUBLIC_API_ORIGIN` | Canonical origins for generated links / OAuth callbacks (else request-derived). |
| `REPLIT_DOMAINS` / `REPLIT_DEV_DOMAIN` / `REPL_ID` | Legacy Replit host detection (unused off Replit). |

> **SMTP is not an env var.** Email (host/port/user/pass/from) is configured by the admin in-app and stored in `app_settings.emailConfig` — there are no `SMTP_*` environment variables. Other names seen in a broad `process.env` grep (`AWS_*`, `GCLOUD_*`, etc.) come from bundled third-party SDKs, not app config.

## Notes & gotchas

- **Lockfile discipline.** Any dependency change must include an updated, committed `pnpm-lock.yaml`, or the Railway build fails at `--frozen-lockfile`. See [Support & updates](10-support-and-updates.md#updating-dependencies).
- **Native/heavy deps** must be in the esbuild `external` list (they resolve from `node_modules` at runtime, which the `api`/`railway` stages ship). Example: `@react-pdf/renderer`.
- **First deploy on a shared Postgres** self-provisions its own database and the `vector` extension; you don't need to pre-create them.
- **Committed static assets only.** Railway builds from git, so anything not committed (e.g. a `*.pdf` left ignored by `.gitignore`) will 404 in production even if it worked locally.
- Full local equivalents and commands are in [Installation — Docker](06-installation-docker.md).
