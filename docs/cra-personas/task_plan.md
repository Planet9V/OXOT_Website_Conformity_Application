# Task Plan — CRA Persona Programme

> Planning files live here rather than the repo root because root
> `task_plan.md` / `findings.md` / `progress.md` belong to the earlier
> Framer Motion workstream (2026-08-07) and must not be clobbered.

## Goal

Make the conformity application serve **every CRA role a single deploying
organisation can hold**, so that org can manage its full obligations under
Regulation (EU) 2024/2847 and produce defensible evidence.

**One organisation. One cockpit shell. One source of truth (the grounded
corpus). Different journeys per role.**

## Non-negotiable constraints

1. **Single-tenant.** Personas are the CRA roles the deploying org holds, not
   separate customers. Do **not** add `org_id`/`tenant_id`. An org may hold
   several roles simultaneously.
2. **Two distinct axes — never conflate them.**
   - *Org CRA role* → which obligation sets are active → which cockpit renders.
   - *User role inside the org* (assessor, approver, PSIRT lead) → who is
     assigned an obligation, who evidences it, who signs it off.
3. **The honesty rule.** No UI string may assert a legal act was performed, a
   status was verified, or an exemption was granted unless code computed it
   from persisted data. Enforced by `scripts/check_honesty.mjs` at every gate.
4. **Grounded citations only.** Every article/recital/annex reference must
   resolve in `docs/cra_statutory_corpus/`. No hand-typed article numbers.

## Karpathy discipline applied to this programme

- **Think before coding.** Each phase opens by re-reading `lessons.md` and
  restating assumptions. Ambiguity is escalated, not guessed.
- **Simplicity first.** No speculative abstraction. A role's obligation set is
  data, not a class hierarchy. No framework is introduced for one use.
- **Surgical changes.** One task = one commit. Every changed line traces to a
  named task below. No drive-by refactors, no reformatting.
- **Goal-driven.** Every task has a machine-checkable acceptance criterion.
  "Looks right" is never a criterion.
- **3-strike rule.** Same failure twice → change approach. Third → stop and
  escalate to the user. Log every attempt in `progress.md`.

## Phase gate (runs between EVERY phase — no exceptions)

A phase is not complete until all seven pass. Failure anywhere → fix or
re-tune before the next phase starts.

| # | Check | Command / criterion |
|---|-------|---------------------|
| G1 | Typecheck | `npx tsc --noEmit` clean in api-server, conformity, oxot-web |
| G2 | Tests | `cd artifacts/api-server && npx vitest run` — **0 failed tests**, and phase's new tests present |
| G3 | Build | `cd artifacts/conformity && npx vite build` succeeds |
| G4 | Honesty | `node scripts/check_honesty.mjs` exits 0 |
| G5 | Citations | `node scripts/check_citations.mjs` exits 0 — every cited article resolves |
| G6 | Live | `docker compose build web api && docker compose up -d`, then the phase's smoke path returns real persisted data |
| G7 | Retro | `lessons.md` updated; **next phase's tasks re-tuned** in light of it |

**G7 is the learning loop.** It is not optional and not a formality: after each
phase, write what actually happened, then edit the *next* phase's task list
before starting it. If a phase revealed a better pattern, the next phase adopts
it. If a phase hit a trap, the next phase's plan names it.

---

# Phase 0 — Role model foundation

**Why first:** every later phase otherwise re-hardcodes its own KPIs. This is
the phase that makes the other five stick.

**Current state (verified 2026-08-14):** `persona-cockpit.tsx` is 627 lines with
zero data hooks; all 24 KPIs, 18 highlights and 18 funnel steps are string
literals in `PERSONA_CONFIGS`. Persona lives in `useState` + querystring only.

### Tasks
- **0.1** Schema: `org_cra_roles` (which roles this org declares it holds, with
  effective dates) and `obligation_instances` (obligation ↔ owner ↔ status ↔
  evidence ↔ due date), keyed to real article references.
- **0.2** Seed the obligation catalogue from the grounded corpus for the roles
  in scope, using real article + paragraph anchors. No hand-typed text.
- **0.3** `GET /api/conformity/roles` and `GET /api/conformity/obligations`
  behind `requireAuth`, returning only declared roles' obligations.
- **0.4** Role declaration UI: org states which roles it holds.
- **0.5** Rewrite `persona-cockpit.tsx` to derive every KPI from
  `/api/conformity/obligations`. Delete `PERSONA_CONFIGS` literals.
- **0.6** Empty/error states: no silent fallback to sample data. Kill
  `rawData || MOCK_PORTFOLIO_DATA` in `command-center.tsx`.
- **0.7** Build `scripts/check_honesty.mjs` and `scripts/check_citations.mjs`.
- **0.8** Add `.github/workflows/ci.yml` running G1–G5.

### Acceptance criteria
- `grep -c "value: '" persona-cockpit.tsx` returns **0**.
- Cockpit for an org with **no** declared roles renders an empty state, not KPIs.
- Declaring "manufacturer" makes Art. 13/14 obligations appear; undeclaring
  removes them. Verified live, not asserted.
- `check_honesty.mjs` fails a deliberately reintroduced fake claim (test it).
- CI runs on push and is red if any gate fails.

---

# Phase 1 — Manufacturer (Arts. 13, 14, 23, 28, 31, 32 + Annexes I, II, V, VII)

**Why here:** ~60% already real, and it is the role the product is strongest at.
Completing it proves the Phase 0 model before four more roles depend on it.

**Current state:** `/products → /assessments/:id` is genuinely DB-backed. Annex I
catalogue seeded verbatim with correct sub-lettering. Byte-level SHA-256 evidence
hashing. xBOM + OSV. Upstream-maintainer notifications. Art. 14 clock is correct
including end-of-month clamping per Reg. 1182/71.

### Tasks
- **1.1** Art. 13(8) five-year support floor: validate numerically. Today a
  1-year support period on a Class II product yields a green "complete".
- **1.2** Art. 13(12) retention clock: 10 years **or** the support period,
  whichever is longer. Surface expiry; alert before it lapses.
- **1.3** Art. 23 economic-operator traceability records — currently absent.
- **1.4** Chapter V cooperation (Arts. 52–54): MSA request intake, corrective
  action, withdrawal/recall workflow — currently absent.
- **1.5** Wire the Art. 14 reporting package to `obligation_instances` so a
  filing is evidenced (drafted here, filed by the human, reference recorded).
- **1.6** Retire the manufacturer persona's remaining hardcoded highlights.
- **1.7** **Presumption of conformity must reflect reality (Art. 27).** The
  standards matrix currently returns `FULL_STATUTORY_PRESUMPTION_ARTICLE_34` —
  wrong article (real: **27**) and, more seriously, **asserting a presumption
  that does not currently exist for any product**, because no CRA harmonised
  standard has been cited in the OJEU. Art. 27(1) grants the presumption only
  for standards "the references of which have been published in the Official
  Journal". Model the citation status as data with a source and a checked-on
  date; when nothing is cited, the page must say the presumption is
  unavailable and point the user at Route 4 (direct demonstration against
  Annex I, documented per Annex VII).
- **1.8** **Conformity route selection (Art. 32).** Derive the available routes
  from citation status, not from a hardcoded table. Today Art. 32(2) means an
  important **Class I** manufacturer cannot self-assess, because the condition
  that unlocks it — applying a harmonised standard, common specification or
  recognised certification scheme — cannot currently be met. This flips the
  moment a standard is cited, so it must be computed, never baked in.

### Acceptance criteria
- Saving a 12-month support period on an Annex III Class II product **blocks**
  with a citation to Art. 13(8). Regression test.
- Retention expiry computed from real dates; test covers the
  "whichever is longer" branch both ways.
- Every Art. 13 paragraph with an operative duty maps to an obligation row, or
  is explicitly marked out-of-scope with a reason in `findings.md`.
- Manufacturer cockpit KPIs all trace to a query. Zero literals.
- With zero cited standards in the dataset, the standards matrix reports the
  presumption as **unavailable** and offers Route 4. Adding a cited standard to
  the dataset flips it to available. Regression test covers both directions —
  this is the check that stops us baking today's legal position into code.
- Route selection for an important Class I product with no applied standard
  resolves to a third-party route, citing Art. 32(2).

---

# Phase 2 — Deemed manufacturer (Arts. 21 & 22)

**The structural insight.** This is not a persona — it is a **state transition**.
Art. 21: an importer or distributor who rebrands *or* substantially modifies
becomes the manufacturer under Arts. 13 and 14. Art. 22: any *other* person who
substantially modifies and makes available becomes the manufacturer.

This is what folds the partner hub in: it stops being a standalone product and
becomes the transition detector feeding the Phase 1 workbench.

**Current state:** `/api/ecosystem/article21/assess` computes but persists
nothing. `cra_article21_audits` exists and is never written. The "certificate
hash" is taken over a hardcoded timestamp. Branding still references the
inverted Recital 34 safe-harbour thesis in places.

### Tasks
- **2.1** Persist assessments to `cra_article21_audits` with a real timestamp.
- **2.2** Correct the legal model: distinguish Art. 21 (importer/distributor)
  from Art. 22 (other person); ask the dispositive "made available on the
  market?" question, which the wizard never asks today.
- **2.3** On a positive determination, **open a manufacturer obligation set**
  for that product — the transition made real.
- **2.4** Replace remaining "safe harbour certificate" framing with an
  assessment record: inputs, determination, citation, timestamp, assessor.
- **2.5** Retire `/partner-hub` mock plants; drive from real product/asset data.

### Acceptance criteria
- A recorded substantial modification creates manufacturer obligations, visible
  in the cockpit. Verified live end-to-end.
- Two assessments with identical inputs on different days produce **different**
  timestamps (regression test for the frozen-timestamp bug).
- No string in the app asserts an exemption was "granted"; the record states
  what was assessed and on what basis.

---

# Phase 3 — Importer (Art. 19) and Distributor (Art. 20)

Genuinely different duty sets, currently conflated into one persona.
Art. 19 has 8 operative paragraphs; Art. 20 has 6.

**Current state:** `/archive` is a module-scope JS array wiped on restart, with
two unhandled buttons and seeded digests that are the SHA-256 of the empty
string. The duty-to-refrain screener's inverted verdict is fixed but persists
nothing.

### Tasks
- **3.1** Split the persona into Importer and Distributor with their own sets.
- **3.2** Real dossier storage replacing `mockArchiveLedger`: a table, real file
  storage, hash over **file bytes** not a metadata string.
- **3.3** Art. 19(2) verification workflow: conformity assessment carried out,
  CE marking, EU DoC, technical documentation accessible.
- **3.4** Art. 19(4)/20 duty-to-refrain: persist the determination and block
  downstream actions on a held product.
- **3.5** Retention against the same clock built in 1.2.

### Acceptance criteria
- Deposited dossier survives `docker compose restart api`.
- Dossier hash changes when file bytes change and is stable when only metadata
  changes. Regression test both directions.
- A held product cannot be marked available; attempting it cites Art. 20.

---

# Phase 4 — Open-source software steward (Art. 24)

Smallest real scope. The current implementation is the most legally wrong thing
in the app: it invents an "Article 33 attestation", asserts an exemption from
"Article 20 manufacturer obligations", and never mentions that
**Art. 64(10)(b) exempts stewards from administrative fines outright.**

### Tasks
- **4.1** Art. 24(1): authorable, versioned cybersecurity policy —
  "documented in a verifiable manner" is the actual statutory wording.
- **4.2** Art. 24(2): CVD process and MSA cooperation record.
- **4.3** State the Art. 64(10)(b) fine exemption plainly in the steward cockpit.
- **4.4** Keep the Art. 25 attestation clearly marked as **not yet enacted** by
  delegated act — do not present it as available.

### Acceptance criteria
- A steward can write, version and export a cybersecurity policy that persists.
- No string claims an exemption was granted by this application.
- Steward cockpit cites Art. 24 and Art. 64(10)(b), both resolving via G5.

---

# Phase 5 — Authorised representative (Art. 18)

New role, small scope, clean commercial wedge: every non-EU manufacturer selling
into the EU needs one, and the representative holds the technical file.

### Tasks
- **5.1** Mandate record: appointing manufacturer, scope, effective dates.
- **5.2** Art. 18(2) task set the representative may perform under mandate.
- **5.3** Technical file custody + MSA request handling, reusing Phase 1 storage.
- **5.4** Representative cockpit derived from the Phase 0 model.

### Acceptance criteria
- A mandate can be recorded, scoped and expired; expiry removes the obligations.
- The representative's obligations are a strict subset of what the mandate
  grants. Regression test on scope enforcement.

---

# Separate track (not one of the five) — Notified body

A notified body is a **different customer**, not a role the deploying org holds.
Scope as delegated access, not a cockpit persona.

- Issue `conformity_auditor_access` tokens — nothing in the repo writes this
  table today, so `/auditor-portal` can never be entered.
- Fix `auditor-portal.tsx:84` (token entry destroys itself on first keystroke)
  and the unconditional "Verified SHA-256" badge on rows with no hash.

---

## Out of scope (recorded so it is not silently dropped)

- Multi-tenancy. Deliberate — see constraint 1.
- Plant CISO as a *CRA* persona. A downstream user has no obligations under this
  regulation; their duties are NIS2. Keep as a buyer, not a CRA role.
- `cra-analytics-suite.tsx` sample-data incident narrative — belongs to the
  broader mock-data cleanup, not the persona programme.
- Splitting commit `857e91a` (honesty pass buried in a podcast commit) — blocked
  while a concurrent process commits to this branch.

## Phase status

| Phase | Status | Gate | Notes |
|-------|--------|------|-------|
| 0 — Role model | not_started | — | Blocks all others |
| 1 — Manufacturer | not_started | — | Depends on 0 |
| 2 — Deemed manufacturer | not_started | — | Depends on 1 |
| 3 — Importer / Distributor | not_started | — | Depends on 0, reuses 1.2 |
| 4 — Steward | not_started | — | Depends on 0 |
| 5 — Authorised rep | not_started | — | Depends on 0, reuses 1.3 |

## Errors encountered

| Phase | Error | Attempt | Resolution |
|-------|-------|---------|------------|
| — | (none yet) | | |
