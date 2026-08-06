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
RUN echo "Rebuild trigger: 2026-08-05-v1016"
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
