# Handover — start here

The single entry point for any developer or session picking up the OXOT CRA
conformity application. Everything below was verified against the working
tree on 2026-08-16 at commit `0ebc852` (Phase 10 closed, CI green); if a claim here ever contradicts the
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
3. **`lessons.md`** — L1–L55 plus a retro per phase. Not optional; each
   lesson cost real time.
4. **`NEXT_SESSION_PROMPT.md`** — the pasteable opening prompt, kept
   pointing at the current first task.

## Phases — all complete through Phase 13

| Phase | Delivered |
|---|---|
| 0–5 | Role/obligation model on verbatim corpora; statute-pinned rule engines in `lib/` (retention, support period, reporting clocks, deemed manufacturer, notified body, due diligence, versions, end-of-support, steward Art. 24, authorised-rep mandates Art. 18, importer/distributor verification Arts. 19/20, MSA Chapter V); provenance/attestation store; CI gates |
| 6 | Team role model: `TEAM_ROLES` as data (nullable, never defaulted — L40), plaintext `plainPassword` **removed**, role-scoped obligations (`defaultTeamRole`, a routing default never a statutory assignment) + `teamRole` on `/me` |
| 7 | The nine-destination shell (below); polymorphic product file; cross-act Incidents; Authorities/Signatures/Projects/Organisation real; Library owns all reference content; universal statutory flyout; evidence requests (P2 ask-half); NIS2 entity incidents; **G8 = 0 orphans, now a covenant**; donors partner-hub / standards-matrix / importer-archive / open-source-steward / psirt-toolkit / ce-studio **deleted** with redirects |
| 8 | G2 = **0 test failures** (issue #62 closed — dead contracts, wrong session roles, parallel DB races now sequential, 2 storage skips-with-reason); PSIRT CVD pipeline on Incidents; CE derivations in the statutory file (no `mayAffix` by construction); NIS2 verbatim reader (reproducible bundle); **all Dependabot alerts patched** (range-scoped pnpm overrides; 0 open) |
| 9 | Absorption close-out: product-portfolio absorbed into Products (honest bulk import — `POST /conformity/products/import`; quick-start and the fabricating portfolio endpoints deleted; vault kept, its invented-provenance defaults removed); reports → a Home section, flows → `/settings/flows`; the transitional **More menu DELETED** — nav is exactly the nine destinations; auditor-portal decided PERMANENT + EXTERNAL and completed end-to-end in 9.3b (admin-issued expiring tokens, org-side RFI inbox with respond); **G4 driven 7 → 0 and made a covenant** (the empty-string "provenance hash" on the public trust center among the seven). Same day, after the G7 retro: **W2.4 COMPLETED** — 9.4a Cyberbeveiligingswet (NL, promulgated Staatsblad XML, in force 2026-08-15) and 9.4b BSI-Gesetz (DE, consolidated gii XML, a disclosed departure with the verbatim amendment trail), each with a CI verifier including **D2 full-content parity** (which caught and killed 8 flattener-added characters — L51) |
| 10 | **Portable evidence storage** (backend seam: Replit sidecar vs local volume, chooser no-regression proven by unit test; suite reached ZERO SKIPS; restart-persistence proven live) · **Art. 14(8) product-user register + notification record** (tri-state impacted derivation states its rule ON THE WIRE; the app records the org's act, transmits nothing) · **AI Act / Machinery / RED corpora + readers** (authentic OJ, pinned structures, seven verifiers total, five-act citation gate — formerly-skipped AI-Act content now VALIDATES; NIS2 chapter-IX misassignment found+fixed) · **last dead chain deleted** (4 unwritten tables, unauth /api/ecosystem, fake-timestamp seal engine) · L52 (a piped gate launders its exit code) · CI green end-to-end after fixing an invalid workflow env (`runner.temp` is step-only) |
| 11 | **Obligation content ×3 acts (10.3c)** — zero engine changes (D10 held: requirements × declarations). 11.1 RED seeded from nothing (22 rows: Art 3(3)(d)/(e)/(f) cyber essential requirements, Art 10 chain, importer/distributor, Art 15 traceability) — `orgObligations.test.ts` is the endpoint's FIRST suite. 11.2 AI Act verified+extended (3 corrections incl. Art 73's real 15/2/10-day anchors; +11 rows: provider chapter, deployer Art 26 → operator role now termed 'deployer', registration, transparency; GPAI refusal documented). 11.3 Machinery: **three misnumbered Annex III addresses fixed** (duties live in 1.1.9/1.2.1(d)/1.2.1(f); DoC was cited to the SAFETY-COMPONENTS annex — now Art 21) + 12 rows (L53: verify annex section numbers against the OJ SOURCE — the flattened bundle drops them). 11.4 declared-but-unseeded acts now NAMED (`regulationsWithoutSeededContent` + cockpit amber note "Zero here means un-modelled, not compliant"); deriver refusals documented per candidate in the statusDerivers header. Suite 723/0/0. |
| 12 | **D2 full-content parity for the five OJ corpora** (`scripts/lib/oj_content_parity.mjs` — independent flatten, corrigenda must fire, negative control per corpus). Building it exposed FOUR shipped extraction losses, fixed in the shared parser (L54): nested-table truncation (NIS2 Annexes I/II had lost the whole "Type of entity" column), `oj-ti-grseq` heading loss in every annex (CRA Class I/II, Machinery Part A/B…), OJ footer / Parliament-statement leakage into last annexes, one footnote leak into an amendment quote. All five corpora rebuilt, bundles resynced ×3 apps, readers verified live. |
| 13 | **RED Delegated Regulation (EU) 2022/30** — the Art 3(3)(d)/(e)/(f) designations as an EIGHTH corpus (`docs/red_delegated_2022_30/`, THREE committed sources: base + amending 2023/2444 + repealing 2026/339). Amendments applied as must-fire from/to transformations; **repealed with effect from 2027-12-11 in favour of the CRA** — the reader panel on `/library/red` states both lifecycle dates with verbatim quotes; the three Art 3(3) seed rows name their designated categories. L55: read the EUR-Lex ALL view (amendments/repeals) BEFORE building any corpus. |

## The application map (key files)

**Nine destinations** (`artifacts/conformity/src/App.tsx` route table;
`components/layout.tsx` nav — Work / Registers / Reference / Admin):

| Destination | Page / key components | Backed by |
|---|---|---|
| Home `/` | `pages/dashboard` → `command-center.tsx` → `components/home/your-work.tsx` (role-scoped work + evidence-request inbox), `persona-cockpit.tsx` | `/conformity/org/obligations` (+ `defaultTeamRole`), `/conformity/me`, `/conformity/evidence-requests` |
| Incidents `/incidents` | `pages/incidents.tsx` (CRA product clocks + NIS2 entity incidents + `components/incidents/psirt-panel.tsx`) | `conformityAssessments.ts` incidents, `entityIncidents.ts` + `lib/nis2Reporting.ts`, `conformityPsirt.ts` |
| Authorities `/authorities` | `pages/authorities.tsx` | `msaEngagements.ts` + `lib/marketSurveillance.ts` (deadlines CAPTURED from the authority, never computed) |
| Signatures `/signatures` | `pages/signatures.tsx` (read-only ledger) | `attestations.ts` + `lib/attestationStore.ts`; Annex V signing stays in the workbench with its refusal rules |
| Products `/products(/:id)` | `pages/product-detail.tsx` + `components/product-file/*` (verify-panel, notified-body-panel, deemed-manufacturer-panel, auditor-access-panel — issue/revoke portal tokens + RFI inbox, product-users-panel — the Art. 14(8) register) + StatutoryFile (versions, CE, retention, due diligence) | `conformityAssessments.ts`, `statutoryFile.ts`, `operatorChecks.ts`, `notifiedBody.ts`, `deemedManufacturer.ts`, `lib/ceMarking.ts` — the file renders **per the product's `orgRole`** (nullable; null prompts, never guesses) |
| Projects `/projects` | `pages/projects.tsx` (Art. 24 engine — the ONLY steward implementation) | `stewardPolicy.ts` + `lib/openSourceSteward.ts` (versioned supersede-never-overwrite policies) |
| Organisation `/organisation` | `pages/org-profile.tsx` + `components/organisation/mandates-panel.tsx` | `orgProfile.ts` declarations, `mandates.ts` (stored-as-written, defects reported never trimmed) |
| Library `/library` | `pages/library.tsx` → `cra-wiki` (CRA), `nis2-reader.tsx`, `cbw-reader.tsx` (NL, Dutch), `bsig-reader.tsx` (DE, German + amendment trail), `ai-act-reader` / `machinery-reader` / `red-reader` (shared `eu-act-reader.tsx`; RED carries the directive/transposition caveat), acts/requirements/themes/mappings/sources under `/library/*` | corpora bundles; `components/statutory-flyout.tsx` = law at point of use (verbatim only, CRA-only — no lookalikes for other acts) |
| Settings `/settings` | `pages/team.tsx` (team + `teamRole` select) | `adminTeam.ts` |

**The transitional "More" menu is GONE** (9.3): every surface it held was
re-homed or, for `/auditor-portal`, decided permanent-and-external (the
token-authenticated notified-body door, routed OUTSIDE the login shell;
tokens are issued and RFIs answered in the product file's
`auditor-access-panel.tsx`). Do not reintroduce a junk-drawer menu.

**Corpora** (the source of truth), all built from a COMMITTED authentic
source by script, synced to frontend bundles by script, and proven
byte-for-byte reproducible in CI — never hand-edit a corpus or bundle:

- `docs/cra_statutory_corpus/` + `docs/nis2_statutory_corpus/` — verbatim
  OJ text from EUR-Lex (`build_*_corpus_from_eurlex.mjs`).
- `docs/{ai_act,machinery,red}_statutory_corpus/` — the Phase-10 acts, one
  parameterized builder (`build_euact_corpus_from_eurlex.mjs <act>`), pinned
  structures cross-checked by independent anchor counts; the Machinery OJ
  HTML ships BROKEN annex ids, so annexes parse by VISIBLE headings.
- `docs/cbw_statutory_corpus/` — the Dutch NIS2 transposition, from the
  promulgated Staatsblad XML, Stb. 2026, 187 (`build_cbw_corpus_from_stb.mjs`).
- `docs/red_delegated_2022_30/` — Delegated Regulation (EU) 2022/30 (the
  Art 3(3)(d)/(e)/(f) designations), base + amending + repealing sources
  committed, amendments applied must-fire, repeal (2027-12-11, CRA
  handover) as quoted metadata (`build_red_delegated_corpus.mjs`).
- `docs/bsig_statutory_corpus/` — the German transposition core (BSIG),
  from the CONSOLIDATED gesetze-im-internet XML — a disclosed departure
  (Artikelgesetz promulgation is PDF-only and already amended); the
  verbatim standangabe amendment trail is in the metadata
  (`build_bsig_corpus_from_gii.mjs`).

Each has its own verifier — `verify_{cra,nis2,cbw,bsig,red_delegated}_corpus.mjs`
plus `verify_euact_corpus.mjs <ai_act|machinery|red>` (EIGHT in all), ALL in CI; the
transposition verifiers include **D2 full-content parity**, and since
Phase 12 the FIVE OJ corpora carry it too (D5/D5N in the CRA and NIS2
verifiers, D2/D2N in the euact verifier) — every check negative-
controlled (L51/L54). Corpus bundles are excluded from EVERY content gate — they ARE
the law, and the Machinery Regulation legitimately says vibrations are
"transmitted to" the seat (L52). Verify any article number against the corpus **title** before
putting it in a label — a wrong-but-existing number passes the citation
gate (L41).

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
node scripts/check_honesty.mjs   --baseline 0               # G4 — COVENANT (0 since 9.5)
node scripts/check_citations.mjs --baseline 0               # G5 — FIVE acts (cra/nis2/ai_act/machinery/red)
node scripts/check_ui_reach.mjs  --baseline 0               # G8 — COVENANT (17 reached)
node scripts/verify_cra_corpus.mjs && node scripts/verify_nis2_corpus.mjs \
  && node scripts/verify_cbw_corpus.mjs && node scripts/verify_bsig_corpus.mjs \
  && node scripts/verify_euact_corpus.mjs ai_act \
  && node scripts/verify_euact_corpus.mjs machinery \
  && node scripts/verify_euact_corpus.mjs red
```

Run gates BARE — never through a pipe: `cmd | tail -1 && next` proceeds on
tail's exit code, not the gate's, and shipped a red G4 once (L52). Silence
with `>/dev/null`, which preserves the status.

**G2 (tests) = ZERO failures AND ZERO SKIPS** (723/723 since Phase 11 —
717 at the 10.1/10.4 floor plus the six `orgObligations.test.ts` tests),
run in the CI-mirror environment (add `OBJECT_STORAGE_BACKEND=local` and
an `OBJECT_STORAGE_DIR` tmpdir to the env below):

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
Playwright (`scripts/verify_*_playwright.mjs`, 29 repeatable scripts —
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
is why W2.4 waited until the sourced national texts were located rather
than reconstructing them — and why the DE source-strategy fork was decided
on evidence with the user, not guessed); the same approach failed twice;
or `git log`/`git status` shows an unexpected change (the audio script is
the known benign one).

## Next steps (Phase 13 closed 2026-08-16 with G7, all floors held)

**No task is in flight. The open candidates, for the user to prioritise:**

1. Small: storage file GC (deleting evidence rows does not remove stored
   files — a property inherited from the GCS backend and stated in 10.1).
2. **Obligation content for the still-unseeded acts** (GDPR, DORA, CER,
   GPSR, Data Act) if and when a customer's declaration needs them — the
   11.4 cockpit note marks that gap honestly in the meantime.
3. Small: a repeatable `verify_nis2_reader` G6 script (the Phase-12
   annex check was ad-hoc; the NIS2 reader has no script of its own).
4. **The 2027-12-11 RED→CRA handover as product-file guidance** — a
   RED-relevant product's Art 3(3) obligations end when the CRA applies
   in full (2026/339); surfacing that date per product is a natural
   future batch, noted in the Phase-13 retro.
5. **User-only, between sessions:** move the repo out of `~/Downloads`
   (quit session → move folder → `docker compose up -d` from the new
   path → reopen).

No new phase is opened until the user chooses among these or names new
scope.

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
8. **A gate piped through `tail` launders its exit code** (L52) — a zsh
   pipeline returns the LAST command's status, and one red G4 shipped that
   way. Run gates bare; `>/dev/null` preserves the status.
9. **`${{ runner.temp }}` is invalid in a workflow's job-level `env`** —
   it silently killed every CI run at file-parse time, which looks like
   red gates but is a dead workflow. Literal paths in job env.
