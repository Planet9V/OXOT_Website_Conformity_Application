# Findings — Toolkit-Skills Codebase & Website Evaluation (2026-08-07)

Full per-dimension JSON (all findings, strengths, evidence): see workflow journal at
`/Users/jimmcknney/.claude/projects/-Users-jimmcknney-Downloads-OXOT-Website-Conformity-Application/046b87da-0622-4684-a688-c82e95b88495/subagents/workflows/wf_d8cdc2c7-c45/journal.jsonl`
and the published Artifact report.

## Overall grade: D+ (weighted toward security/auth/correctness)

Per-dimension grades: Frontend/React B · Accessibility B- · Performance C+ ·
Responsive/Visual B · Auth/Authorization C+ · API Design B- · Database B- ·
Security C- · Testing C+

The overall grade is pulled far below the dimension average by one critical,
exploitable defect (see below) — everything else sits in a normal "solid but
real gaps" B-/C+ range.

## CRITICAL — must fix immediately

**Broken access control + plaintext password storage in team management**
(`artifacts/api-server/src/routes/adminTeam.ts`):
- `GET /team`, `GET /admin/team`, `POST /admin/team`, `PATCH /admin/team/:id`
  are gated with `requireAuth` (accepts ANY authenticated role — admin, demo,
  or member) instead of `requireAdmin`, which every other admin-surface route
  file in the codebase correctly uses.
- The API returns each member's password in **plaintext** via a
  `plain_password` column (`lib/db/src/schema/conformityMembers.ts:29-30`),
  directly contradicting that file's own doc comment two lines above it.
- The demo login (`oxotdemo` / `oxot2026$`) is **intentionally public** —
  printed on the login screen so prospects can explore the workbench
  (`adminAuth.ts:53-59`).
- **Concrete exploit path**: sign in with the public demo credentials → `GET
  /api/team` → receive every named assessor's real plaintext password. Same
  session can `POST /api/admin/team` to create an attacker-controlled account,
  or `PATCH` to reset any existing member's password or reactivate a
  deactivated account.

## HIGH — fix soon

- CORS reflects any origin with credentials enabled (`app.ts:41`,
  `cors({ origin: true, credentials: true })`) — previously flagged in an
  earlier audit this session, still unfixed.
- No rate limiting on `POST /admin/login` (`admin.ts:20`) despite a reusable
  `rateLimit` middleware already used elsewhere — unthrottled brute force
  against admin/demo/every member account.
- Admin credentials fall back to the literal `admin`/`admin` when
  `ADMIN_USERNAME`/`ADMIN_PASSWORD` are unset (`adminAuth.ts:45-50`) — fail-open
  rather than fail-closed (contrast `SESSION_SECRET`, which throws if unset).
- `oxot-web`'s `pnpm test` script is currently broken — references a test
  file that doesn't exist on disk (`package.json:8`).
- No test coverage anywhere for the CRA self-check scoring/classification
  engine (`lib/cra-selfcheck.ts` — `classify`, `scoreBreakdown`,
  `readinessScore`, `runwayMath`) despite being pure, deterministic business
  logic that drives lead segmentation/routing.
- Fonts loaded twice via two conflicting mechanisms (HTML `<link>` tags +
  separate CSS `@import` pulling a different font set) in both apps.
- No route-level code splitting in either app — every page (including
  recharts/framer-motion-heavy dashboards) is statically imported.
- Most FK columns backing high-traffic detail queries (bomId, assessmentId,
  conversationId) have no index — full seq-scans as tables grow.

## Top 5 recommendations (impact vs. effort, from synthesis)

1. **Lock down team-management endpoints, stop storing/returning plaintext
   passwords** — high impact, low effort (swap middleware to `requireAdmin`,
   drop the plaintext column/field).
2. **Restrict CORS to an explicit origin allow-list** — high impact, low
   effort.
3. **Rate-limit `/admin/login`, remove the `admin`/`admin` fallback** — high
   impact, low effort.
4. **Add missing indexes on high-traffic FK columns** — medium impact, low
   effort.
5. **Fix the broken oxot-web test script + add unit coverage for the CRA
   self-check scoring engine** — medium impact, medium effort.

## Full report

Published Artifact has the complete per-dimension findings, strengths, and
grading rubric. Raw JSON output preserved in the workflow journal path above
for future reference.
