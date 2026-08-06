# Loki Mode CONTINUITY.md - Working Memory & Master Log

> **Current Phase**: Operations & Maintenance
> **Status**: Docker Production Local Stack 100% Operational (Port 8088)

---

## Active Status & Memory

- **All 5 Docker Services Running Healthy**:
  - `db`: `pgvector/pgvector:pg16` with auto-initialized `vector` extension.
  - `migrate`: Drizzle schema push completed (`exit 0`).
  - `seed`: Conformity engine + demo workspace seeded (`exit 0`).
  - `api`: Express API server listening on internal port 8080 (`status: ok`).
  - `web`: Nginx 1.27 web proxy listening on host port 8088 (`200 OK`).

- **Verified URLs**:
  - OXOT Public Site: `http://localhost:8088/`
  - Competitor Comparison: `http://localhost:8088/compare`
  - Conformity Workbench: `http://localhost:8088/conformity/`
  - Briefing Deck: `http://localhost:8088/conformity-briefing/`
  - API Health: `http://localhost:8088/api/healthz`
  - API Regulations: `http://localhost:8088/api/conformity/regulations`

- **Database Architect & RAG Optimizations**:
  - Added B-tree and `pgvector` indexes to `conformity_embeddings` (`assessment_id` and `source_type`).
  - Added SHA-256 binary hashing for audit proofs in `conformity_evidence`.
  - Added statutory 24h/72h SLA clock fields to `conformity_incidents`.

---

## Mistakes & Learnings

1. **Host Port Collisions**: Port 8081 was bound on host machine by legacy `bloodhound` container. Solved by binding `web` to port **8088:80**.
2. **Postgres Vector Extension**: `pgvector` requires `CREATE EXTENSION IF NOT EXISTS vector;` in `/docker-entrypoint-initdb.d/init-pgvector.sql`.
3. **Bundled Runtime Copies**: Multi-stage Docker build for ESM workspace requires copying `/app` workspace into stage `api` to preserve node_modules resolution.
