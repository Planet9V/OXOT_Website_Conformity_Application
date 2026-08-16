# Handover — start here

The single entry point for any developer or session picking up the OXOT CRA
conformity application. Everything below was verified against the working
tree on 2026-08-16 at commit `625c13a`; if a claim here ever contradicts the
working tree, **the working tree wins** and this file is wrong (that has
happened — L36 — so check before trusting).

## What this application is

A commercial system of record for an organisation's **EU Cyber Resilience
Act (Regulation (EU) 2024/2847)** and **NIS2 (Directive (EU) 2022/2555)**
obligations. One single-tenant deployment; the deploying organisation may
hold several economic-operator roles at once (manufacturer AND importer AND
operator — D11). The application enumerates obligations from verbatim
statutory text, records who owns each, holds the evidence and provenance,
and shows what is missing. **It never concludes conformity** — that
assessment belongs to the manufacturer under CRA Art. 32 or a notified
body; the app's outputs are always "these obligations have evidence, these
do not".

## Where the work is

- Branch **`feat/phase-7-shell-redesign`**, level with **`main`** at every
  batch (fast-forward pushes; never squash — commit messages are the
  decision history and a deliverable).
- Restore tag `v0.5-personas-multi-act` (immutable, on GitHub).
- The stack runs at **localhost:8088** via `docker compose` (web + api +
  pgvector db + migrate/seed one-shots). Develop against the running stack.
  Container builds are amd64-emulated and slow (~10 min) — run them in the
  background and **wait on the build process/notification, never on
  container status text** (L47).
- `scripts/generate_local_audio.py` may show as modified — that is the
  user's own side-work; never stage it (use explicit `git add`, never
  `git add -A`).

## Read these, in this order

1. **`DESIGN_five_shapes.md`** — read *iteration 2* (the last section)
   first; it supersedes the early 33→8 plan. D1–D13 are binding: system of
   record; five shapes (creation/verification/custody/stewardship/
   assurance); six primitives (P1 obligation … P6 provenance); per-product
   role (D5); act is a dimension, never a section (D10); roles are tags,
   never a switcher (D11); two equal daily users (D12).
2. **`task_plan.md`** — constraints, the IEC 62443 posture (evidence
   framework, **never** an Art. 27 presumption), the gate table, and the
   per-phase task lists with done-markers.
3. **`lessons.md`** — L1–L48 plus a retro per phase. Not optional; each
   lesson cost real time.
4. **`NEXT_SESSION_PROMPT.md`** — the pasteable opening prompt, kept
   pointing at the current first task.

## Phases — all complete through Phase 8

| Phase | Delivered |
|---|---|
| 0–5 | Role/obligation model on verbatim corpora; statute-pinned rule engines in `lib/` (retention, support period, reporting clocks, deemed manufacturer, notified body, due diligence, versions, end-of-support, steward Art. 24, authorised-rep mandates Art. 18, importer/distributor verification Arts. 19/20, MSA Chapter V); provenance/attestation store; CI gates |
| 6 | Team role model: `TEAM_ROLES` as data (nullable, never defaulted — L40), plaintext `plainPassword` **removed**, role-scoped obligations (`defaultTeamRole`, a routing default never a statutory assignment) + `teamRole` on `/me` |
| 7 | The nine-destination shell (below); polymorphic product file; cross-act Incidents; Authorities/Signatures/Projects/Organisation real; Library owns all reference content; universal statutory flyout; evidence requests (P2 ask-half); NIS2 entity incidents; **G8 = 0 orphans, now a covenant**; donors partner-hub / standards-matrix / importer-archive / open-source-steward / psirt-toolkit / ce-studio **deleted** with redirects |
| 8 | G2 = **0 test failures** (issue #62 closed — dead contracts, wrong session roles, parallel DB races now sequential, 2 storage skips-with-reason); PSIRT CVD pipeline on Incidents; CE derivations in the statutory file (no `mayAffix` by construction); NIS2 verbatim reader (reproducible bundle); **all Dependabot alerts patched** (range-scoped pnpm overrides; 0 open) |

## The application map (key files)

**Nine destinations** (`artifacts/conformity/src/App.tsx` route table;
`components/layout.tsx` nav — Work / Registers / Reference / Admin):

| Destination | Page / key components | Backed by |
|---|---|---|
| Home `/` | `pages/dashboard` → `command-center.tsx` → `components/home/your-work.tsx` (role-scoped work + evidence-request inbox), `persona-cockpit.tsx` | `/conformity/org/obligations` (+ `defaultTeamRole`), `/conformity/me`, `/conformity/evidence-requests` |
| Incidents `/incidents` | `pages/incidents.tsx` (CRA product clocks + NIS2 entity incidents + `components/incidents/psirt-panel.tsx`) | `conformityAssessments.ts` incidents, `entityIncidents.ts` + `lib/nis2Reporting.ts`, `conformityPsirt.ts` |
| Authorities `/authorities` | `pages/authorities.tsx` | `msaEngagements.ts` + `lib/marketSurveillance.ts` (deadlines CAPTURED from the authority, never computed) |
| Signatures `/signatures` | `pages/signatures.tsx` (read-only ledger) | `attestations.ts` + `lib/attestationStore.ts`; Annex V signing stays in the workbench with its refusal rules |
| Products `/products(/:id)` | `pages/product-detail.tsx` + `components/product-file/*` (verify-panel, notified-body-panel, deemed-manufacturer-panel) + StatutoryFile (versions, CE, retention, due diligence) | `conformityAssessments.ts`, `statutoryFile.ts`, `operatorChecks.ts`, `notifiedBody.ts`, `deemedManufacturer.ts`, `lib/ceMarking.ts` — the file renders **per the product's `orgRole`** (nullable; null prompts, never guesses) |
| Projects `/projects` | `pages/projects.tsx` (Art. 24 engine — the ONLY steward implementation) | `stewardPolicy.ts` + `lib/openSourceSteward.ts` (versioned supersede-never-overwrite policies) |
| Organisation `/organisation` | `pages/org-profile.tsx` + `components/organisation/mandates-panel.tsx` | `orgProfile.ts` declarations, `mandates.ts` (stored-as-written, defects reported never trimmed) |
| Library `/library` | `pages/library.tsx` → `cra-wiki` (CRA verbatim), `nis2-reader.tsx` (NIS2 verbatim), acts/requirements/themes/mappings/sources under `/library/*` | corpora bundles; `components/statutory-flyout.tsx` = law at point of use (verbatim only, CRA-only — no lookalikes for other acts) |
| Settings `/settings` | `pages/team.tsx` (team + `teamRole` select) | `adminTeam.ts` |

**Transitional "More" menu** (`layout.tsx` `TRANSITIONAL`) still holds:
product-portfolio, reports, flows, auditor-portal — the open absorption
work. Delete the menu and its code when they are re-homed.

**Corpora** (the source of truth): `docs/cra_statutory_corpus/` and
`docs/nis2_statutory_corpus/` — verbatim OJ text built from EUR-Lex by
`scripts/build_*_corpus_from_eurlex.mjs`, synced to frontend bundles by
`scripts/sync_*_corpus_data.mjs`, and proven byte-for-byte reproducible in
CI. Never hand-edit a corpus or bundle. Verify any article number against
the corpus **title** before putting it in a label — a wrong-but-existing
number passes the citation gate (L41).

**Spec-first pipeline**: `lib/api-spec/openapi.yaml` → `orval`
(`cd lib/api-spec && ./node_modules/.bin/orval --config ./orval.config.ts`)
→ `lib/api-zod` + `lib/api-client-react` (generated — NEVER hand-edited;
a hand-edit survives only until the next codegen run, L37). New endpoints
consumed via the generated client go in the spec first.

**Schema**: `lib/db/src/schema/*` via drizzle `push-force` — no migration
history. One-shot `migrate`/`seed` images bake the schema at build time:
**rebuild them before any parity run** or they resurrect dropped columns
(L39).

## The gates — every one at its floor

```
# per package (tsc is hoisted to the ROOT node_modules/.bin)
cd <pkg> && <root>/node_modules/.bin/tsc --noEmit          # G1
cd artifacts/conformity && ./node_modules/.bin/vite build   # G3
node scripts/check_honesty.mjs   --baseline 7               # G4 (all 7 in oxot-web/marketing)
node scripts/check_citations.mjs --baseline 0               # G5
node scripts/check_ui_reach.mjs  --baseline 0               # G8 — COVENANT
node scripts/verify_cra_corpus.mjs && node scripts/verify_nis2_corpus.mjs
```

**G2 (tests) = ZERO failures**, run in the CI-mirror environment:

```
docker run -d --name oxot-test-db -p 127.0.0.1:5544:5432 \
  -e POSTGRES_USER=oxot -e POSTGRES_PASSWORD=oxot -e POSTGRES_DB=oxot pgvector/pgvector:pg16
docker exec oxot-test-db psql -U oxot -d oxot -c 'CREATE EXTENSION IF NOT EXISTS vector;'
cd lib/db && DATABASE_URL=postgres://oxot:oxot@127.0.0.1:5544/oxot \
  ./node_modules/.bin/drizzle-kit push --force --config ./drizzle.config.ts
cd artifacts/api-server && DATABASE_URL=... NODE_ENV=test npm run seed:conformity
DATABASE_URL=... SESSION_SECRET=<32+ chars> ADMIN_USERNAME=ci-admin \
  ADMIN_PASSWORD=... NODE_ENV=test DEMO_READONLY=true ./node_modules/.bin/vitest run
docker rm -f oxot-test-db
```

Test files run **sequentially** (`vitest.config.ts`) because they share one
database. Suites own their fixtures (create + delete; never scavenge
leftovers — L46). Tests mint signed cookies via
`routes/__tests__/helpers/testAuth.ts` — never the login route (rate
limiter: 10/15min, reset by api-container restart, never weakened).

**G6 (live)** per batch: rebuild containers, drive the surface with
Playwright (`scripts/verify_*_playwright.mjs`, 14 repeatable scripts —
pattern: login, act through the real UI, read persisted state back via the
API, screenshot, clean up probes), and **review the screenshot** — pixels
catch what assertions miss (nav collisions were found only that way).

**G7** closes every phase: update `lessons.md`, then re-tune the next
phase's tasks before starting it.

## The method (how every task runs)

1. **Read the statute before implementing** — from the corpus, verbatim,
   including the anchor sentences (clock anchors differ per act: CRA final
   report ← corrective measure; NIS2 final report ← notification
   SUBMISSION — L42).
2. **Verify before claiming** — run the command, show the output; defect
   reports are claims too and get verified at write time against the
   current tree (L36).
3. **Rules as pure functions first**: statute logic in
   `artifacts/api-server/src/lib/` with unit tests → routes → UI.
4. **One task, one commit, message records WHY.** Gate commands are chained
   with `&&` so red stops the commit (L45). Scripted bulk edits assert
   their replacements landed (a bare `.replace` no-ops silently — L48).
5. **Tri-state discipline**: a FACT may be null (never defaulted); a ROUTE
   must terminate somewhere safe and its name admits it is a default
   (L40). Unanswered never renders as compliant.
6. **Honesty in the surface itself**: where a capability does not exist,
   the page says so and says when it will; refusal rules (publish
   completeness, sign completeness, duty-to-refrain holds) refuse — they
   never warn-and-allow.
7. **Donor doctrine**: a page is deleted only after its last real engine
   consumer is re-homed (grep its `/api` calls first — L43), then routes
   redirect so bookmarks survive.
8. **Batch cadence**: survey → scope one shippable batch → build → all
   gates → G6 live with screenshots → plan done-marker → commit → push
   branch AND main (fast-forward).

**Halt and ask, never guess, when**: a new `honesty-ok:`/`citation-ok:`
waiver would be needed; the corpus does not settle a legal question (this
is why W2.4 content waits for sourced national texts); the same approach
failed twice; or `git log`/`git status` shows an unexpected change (the
audio script is the known benign one).

## Next steps, in order

1. **Absorb `product-portfolio` into Products** — the last 7.3 donor
   (fleet/import features; check its `/api` calls before deleting).
2. **Re-home `reports`** (→ Home / product file) and **`flows`**
   (admin-authored process flows — likely Settings or the workbench).
3. **Decide `auditor-portal`** — probably a permanent separate
   notified-body track, not transitional; if so move it out of "More"
   deliberately, then **delete the More menu and its code**.
4. **W2.4 transposition content** — BLOCKED on sourced verbatim national
   texts (NL, then DE). The NIS2 reader's banner states the gap; loading
   anything reconstructed from memory is forbidden by the Legal breaker.
5. **The 7 honesty findings** — all in `artifacts/oxot-web` marketing
   surfaces (`cra-analytics-suite`, `trust-center-page`,
   `floating-ai-assistant`, `conformityAssessments.ts:841`,
   `seedDemo.ts:691`); drive G4's baseline 7 → 0.
6. Optional hygiene: `main`-only development or branch rename;
   object-storage env for the 2 skipped tests; move the repo out of
   `~/Downloads`.

## Traps that actually happened (do not rediscover)

1. **Never flip `DEMO_READONLY` in ci.yml** to fix a test — that restores
   unauthenticated writes. Tests authenticate; guards stay.
2. **Never raise a gate baseline.** At zero, a baseline is a covenant, not
   a history (L44).
3. **A wrong-but-existing citation passes the gate** — three shipped
   labels cited real articles that were the wrong ones (L41). Check the
   article's title in the corpus first.
4. **Filter the findings, never the failure** — `tail`/`grep` on gate
   output has hidden both crashes and verdict lines repeatedly (L4).
5. **The stale-container wait** — "Up About a minute" may be the PREVIOUS
   build. Wait on the build PID or the task notification (L47).
6. **Corpus bundles are excluded from the citation scan** (they ARE the
   law and cite other instruments); never "fix" TFEU citations inside them.
7. Generated client files are regenerated wholesale — hand-edits are
   deleted by the next `orval` run (L37); spec first, always.
