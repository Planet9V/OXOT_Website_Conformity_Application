# syntax=docker/dockerfile:1
# Multi-stage build for the OXOT monorepo.
#
# Targets:
#   build       — full workspace with dependencies + all production builds
#   api         — minimal Node runtime serving the bundled API (port 8080)
#   web         — nginx serving the three static frontends and proxying /api
#
# NOTE: pnpm-workspace.yaml pins platform binaries to linux-x64, so build with
#   docker build --platform linux/amd64 ...
# (docker compose already sets this).

FROM node:24-slim AS build
WORKDIR /app
ENV PORT=8080
RUN corepack enable && corepack prepare pnpm@10 --activate

# Install dependencies (workspace-aware).
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json tsconfig.json tsconfig.base.json ./
COPY artifacts ./artifacts
COPY lib ./lib
COPY scripts ./scripts
RUN pnpm install --frozen-lockfile

# Build shared libs (tsc --build emits dist/.d.ts consumed by the apps),
# then the API bundle and the three static frontends. BASE_PATH must match
# the nginx routing below.
# Force complete cache invalidation across all multi-stage targets
RUN echo "Rebuild trigger: 2026-08-07-motion-phase2-product-v1"
RUN pnpm run typecheck:libs \
 && pnpm --filter @workspace/api-server run build \
 && BASE_PATH=/ pnpm --filter @workspace/oxot-web run build \
 && BASE_PATH=/conformity/ pnpm --filter @workspace/conformity run build \
 && BASE_PATH=/conformity-briefing/ pnpm --filter @workspace/conformity-briefing run build

# ---------------------------------------------------------------------------
FROM node:24-slim AS api
WORKDIR /app
ENV NODE_ENV=production PORT=8080
COPY --from=build /app /app
EXPOSE 8080
CMD ["node", "--enable-source-maps", "artifacts/api-server/dist/index.mjs"]

# ---------------------------------------------------------------------------
FROM nginx:1.27-alpine AS web
RUN echo "Rebuild web stage v1000"
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/artifacts/oxot-web/dist/public /usr/share/nginx/html/oxot
COPY --from=build /app/artifacts/conformity/dist/public /usr/share/nginx/html/conformity
COPY --from=build /app/artifacts/conformity-briefing/dist/public /usr/share/nginx/html/conformity-briefing
EXPOSE 80

# ---------------------------------------------------------------------------
# railway — single-container deployment for Railway (built as the FINAL stage
# on purpose: Railway builds a Dockerfile's last stage, while local
# docker-compose pins the named stages above and never touches this one).
# nginx serves the static frontends on Railway's injected $PORT and proxies
# /api to the bundled API on 127.0.0.1:8080; docker/railway-start.sh pushes
# the schema and runs the guarded seeds before starting both.
FROM build AS railway
ENV NODE_ENV=production
RUN apt-get update \
 && apt-get install -y --no-install-recommends nginx \
 && rm -rf /var/lib/apt/lists/* \
 && rm -f /etc/nginx/sites-enabled/default
RUN mkdir -p /usr/share/nginx/html /etc/nginx/templates \
 && cp -r /app/artifacts/oxot-web/dist/public /usr/share/nginx/html/oxot \
 && cp -r /app/artifacts/conformity/dist/public /usr/share/nginx/html/conformity \
 && cp -r /app/artifacts/conformity-briefing/dist/public /usr/share/nginx/html/conformity-briefing
COPY docker/nginx.railway.conf.template /etc/nginx/templates/railway.conf.template
COPY docker/railway-start.sh /usr/local/bin/railway-start.sh
RUN chmod +x /usr/local/bin/railway-start.sh
CMD ["/usr/local/bin/railway-start.sh"]
