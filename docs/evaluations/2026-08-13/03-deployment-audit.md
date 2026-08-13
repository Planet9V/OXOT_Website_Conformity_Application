# Deployment & Configuration Audit — 2026-08-13

Evaluation of Docker multi-stage build files (`Dockerfile`), Docker Compose orchestration (`docker-compose.yml`), Nginx reverse proxy configuration (`docker/`), and Railway cloud platform deployment (`railway.json`).

## Executive Summary

The deployment setup features multi-stage Docker containerization with Nginx static asset serving and Railway cloud deployment configuration. However, security risks exist around default container user privileges, unpinned base image tags, and content snapshot restoration behavior on routine restarts.

---

## Findings

**[High] Container Runs as Root User** — [`Dockerfile:L1-L85`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/Dockerfile#L1-L85)
- **Evidence**: `Dockerfile` lacks a `USER node` or `USER nginx` directive before the entrypoint.
- **Impact**: If an application vulnerability allows arbitrary code execution, the attacker gains root privilege inside the container.
- **Fix**: Add unprivileged user creation: `RUN useradd -m appuser && USER appuser`.

**[Medium] Database Restoration Verification** — [`docker-compose.yml:L1-L60`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/docker-compose.yml#L1-L60)
- **Evidence**: `README.md` states "populated databases are never overwritten by a routine `docker compose up`".
- **Audit Result**: ✅ **Verified**. Seed initialization scripts check `SELECT COUNT(*) FROM regulations` before running seed scripts, preserving existing assessment data.

**[Medium] Unpinned Docker Base Image Tags** — [`Dockerfile:L1`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/Dockerfile#L1)
- **Evidence**: Base image uses `FROM node:24-alpine` without specifying exact digest SHAs.
- **Impact**: Upstream base image updates could break production container builds unexpectedly.
- **Fix**: Pin exact SHA256 digest tags: `FROM node:24-alpine@sha256:...`.

---

## What's Already Solid
- Multi-stage Docker build minimizes production container footprint.
- Nginx configuration includes gzip compression and security response headers.
- Railway configuration (`railway.json`) allows seamless 1-click cloud deployments.
