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
5. **The application never concludes conformity.** It enumerates obligations
   from verbatim text, records who owns each, holds the evidence, and shows what
   is missing. It does **not** render a verdict on whether the user is
   compliant. This is both the safety property that bounds the damage from any
   mistake, and the legally correct position: conformity is assessed by the
   manufacturer under Art. 32 or by a notified body — a tool's opinion has no
   standing. Phrase outputs as *"these obligations have evidence, these do
   not"*, never *"you are compliant"*.
6. **IEC 62443 is the evidence framework, not a presumption.** OT is the target
   market and 62443 is its de facto security standard, so obligations map onto
   62443 processes and artifacts. But **no part of IEC 62443 is cited in the
   OJEU under the CRA**, so it confers **no Art. 27 presumption of conformity**.
   It is used under **Route 4** — direct demonstration against Annex I — where
   Annex VII expressly provides for listing "other relevant technical
   specifications applied". Every 62443 reference in the UI must carry that
   caveat. See "IEC 62443 mapping" below.

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
| G2 | Tests | `cd artifacts/api-server && npx vitest run` — **no NEW failures vs the recorded baseline**, and the phase's new tests present and passing |
| G3 | Build | `cd artifacts/conformity && npx vite build` succeeds |
| G4 | Honesty | `node scripts/check_honesty.mjs` exits 0 |
| G5 | Citations | `node scripts/check_citations.mjs` exits 0 — every cited article resolves |
| G6 | Live | `docker compose build web api && docker compose up -d`, then the phase's smoke path returns real persisted data |
| G7 | Retro | `lessons.md` updated; **next phase's tasks re-tuned** in light of it |

**G7 is the learning loop.** It is not optional and not a formality: after each
phase, write what actually happened, then edit the *next* phase's task list
before starting it. If a phase revealed a better pattern, the next phase adopts
it. If a phase hit a trap, the next phase's plan names it.

## Circuit breaker (autonomous execution)

Halt means **stop, write state to `progress.md`, and escalate** — never retry.
Burning tokens on a loop that cannot converge is itself a failure mode.

| Level | Trip condition | Action |
|---|---|---|
| Task | 3 failed attempts, or the same approach tried twice | Halt task, log, move to next task |
| Gate | Same gate red twice after a fix attempt | Halt phase |
| Phase | Phase exceeds its token ceiling | Halt, write state, stop |
| Waiver | Any *new* `honesty-ok:` or `citation-ok:` waiver is needed | **Halt** — a waiver is a human decision |
| Legal | A task needs an interpretation not settled by the corpus text | **Halt** — queue for review, do not guess |
| Repo | `git log` shows an unexpected HEAD move | Halt — concurrent writer is back |

The Waiver and Legal breakers are the important ones. They are the seam where
autonomous work would otherwise quietly invent a legal position.

## IEC 62443 mapping (OT evidence framework)

Used to structure evidence, **not** to claim conformity. Parts in scope:

| Part | What it gives us | Maps to |
|---|---|---|
| **62443-4-1** | Secure development lifecycle practices: SM, SR, SD, SI, SVV, DM, SUM, SG | Annex I **Part II** (vulnerability handling) and Art. 13(1)–(2) process duties |
| **62443-4-2** | Component requirements (CRs/REs) across FR1–FR7 | Annex I **Part I** (product properties) |
| **62443-3-3** | System security requirements and target security levels (SL-T) | System-level context where the org integrates |
| **62443-3-2** | Risk assessment, zones and conduits | Art. 13(2) cybersecurity risk assessment |
| **62443-2-1** | IACS security programme | Org-level programme evidence |

Rules for using it:
- A 62443 artifact is **evidence attached to an obligation**, never a substitute
  for the obligation. The obligation is always the CRA article/annex point.
- Mappings are **claims we make**, not law. Each carries a rationale and is
  reviewable. Never render a mapping as "satisfies" — render it as
  "offered as evidence for".
- The DM (defect management) and SUM (security update management) practices of
  62443-4-1 are the natural spine for Annex I Part II and Art. 13(8) support
  period work in Phase 1.

---

# Phase 0 — Role model foundation

**Why first:** every later phase otherwise re-hardcodes its own KPIs. This is
the phase that makes the other five stick.

**Current state (verified 2026-08-14):** `persona-cockpit.tsx` is 627 lines with
zero data hooks; all 24 KPIs, 18 highlights and 18 funnel steps are string
literals in `PERSONA_CONFIGS`. Persona lives in `useState` + querystring only.

### Tasks

> **Re-tuned 2026-08-14 before writing code.** The original 0.1/0.2 specified two
> tables that **already exist in better form**. Reuse, don't rebuild:
> - `requirements` — `regulationKey` + `refCode` (unique), `title`,
>   `description`, `obligationType`, and **`appliesTo` jsonb: the role axis
>   already exists**. Seeded verbatim with all of Annex I Part I (1, 2(a)–(m))
>   and Part II (1)–(8), plus Art. 13/13(5)/13(6)/13(8)/14, Annexes II/V/VII —
>   **and IEC 62443-4-1 practices (SM, SR, SD, SVV, DM, SUM, SG) and 4-2
>   foundational requirements**, which is exactly the framework we just chose.
> - `conformity_evaluations` — the obligation *instance*: status,
>   implementationNote, riskRating, **owner**, **dueDate**, keyed by
>   `(assessmentId, regulationKey, requirementRefCode)` as a natural key so
>   instances survive a reference reseed.
> - `requirement_mappings` — the "one control, many clauses" cross-regulation
>   matrix that already links CRA ↔ 62443.
>
> What is genuinely missing is only the org role layer and the cockpit wiring.

- **0.1** `org_cra_roles`: which CRA roles this organisation declares it holds,
  with effective dates and a note. Single-tenant, so one logical org — the table
  records the *roles*, not tenants. This is the only new table needed.
- **0.2** Align the role vocabulary. `appliesTo` currently uses
  `manufacturer | supplier | integrator | provider | operator`, which predates
  the grounded corpus and does not match the CRA's economic operators. Extend to
  the real set — `manufacturer`, `authorised_representative`, `importer`,
  `distributor`, `oss_steward` — and attribute the existing CRA requirements
  accordingly. Keep the legacy values working for the non-CRA regulations that
  use them (AI Act uses `provider`, Machinery uses `operator`).
- **0.3** `GET /api/conformity/roles` (declared roles) and
  `GET /api/conformity/obligations` (requirements filtered by declared roles,
  joined to their evaluation state) behind `requireAuth`.
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
- **1.1** Art. 13(8) support period. **Corrected 2026-08-15 after reading the
  text — the original criterion was legally wrong.** Art. 13(8) says the support
  period "shall be at least five years", but the very next sentence says "Where
  the product with digital elements is expected to be in use for less than five
  years, the support period shall correspond to the expected use time." So a
  12-month support period is *lawful* when expected use time is 12 months.
  Blocking it outright would flag a compliant manufacturer as non-compliant.
  Implement: a support period below five years requires a declared expected use
  time it matches, plus the determination inputs Art. 13(8) requires to be
  carried into Annex VII. Unjustified short periods are flagged; justified ones
  are accepted and evidenced.
- **1.2** Retention clocks. **Corrected — Art. 13(12) is not the retention
  provision**; it covers drawing up the technical documentation, conformity
  assessment, the DoC and CE marking. There are three distinct clocks:
  - **Art. 13(9)** — each security update stays available 10 years from *its
    issue*, or the remainder of the support period, whichever is longer.
  - **Art. 13(13)** — technical documentation + EU DoC at MSA disposal, 10 years
    from *placing on the market*, or the support period, whichever is longer.
  - **Art. 13(18)** — Annex II user information, same rule as 13(13).
  Different start dates, so they cannot share one field.
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
- A support period under five years with **no** declared expected use time is
  flagged, citing Art. 13(8). The same period **with** a matching expected use
  time is accepted. Regression test covers both directions — a rule that only
  ever says "no" is as wrong as one that only ever says "yes".
- Each of the three retention clocks computed from its own start date; test
  covers the "whichever is longer" branch both ways for each.
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
- **3.5** Retention — CORRECTED before execution. The plan said "the same clock
  built in 1.2" for both roles. **Article 20 contains no retention paragraph.**
  Verified against the corpus: a distributor has no retention duty under Art. 20.
    - Importer: **Art. 19(6)** — copy of the EU DoC at the disposal of market
      surveillance authorities, and technical documentation made available on
      request, for 10 years after placing on the market or the support period,
      whichever is longer. Same clock as Art. 13(13), already built.
    - Distributor: **Art. 23(2)** only — the economic-operator traceability
      clock, a FLAT ten years from each supply event with no support-period
      limb. Different rule, already built in Phase 1.3.
  Same class of error as Phase 1's "Art. 13(12) for retention": a plan
  assumption not checked against the text.

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
  delegated act — do not present it as available. Art. 25 empowers the
  Commission to establish VOLUNTARY attestation programmes; none exists.
- **4.5** **ADDED after reading Art. 24 in full.** The plan covered 24(1) and
  24(2) and missed **Art. 24(3)** entirely, which applies Art. 14 reporting to
  stewards on two conditional limbs:
    - Art. 14(1) — actively exploited vulnerabilities — applies "to the extent
      that they are involved in the development of the products".
    - Art. 14(3) and (8) — severe incidents — apply "to the extent that severe
      incidents ... affect network and information systems provided by the
      open-source software steward for the development of such products".
  Calling this phase "smallest real scope" understated it: stewards do have
  reporting duties, scoped by what they actually do.
- **4.6** Correct the definitional error in the current implementation. It asks
  for a "non-commercial open-source steward declaration", but Art. 3(14) defines
  a steward as supporting FOSS **"intended for commercial activities"**. The
  checkbox contradicts the definition of the role it claims to record.

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
| 0 — Role model | **complete** | G1-G5 pass; G6 verified live | 0.1-0.6, 0.8 done |
| 1 — Manufacturer | **complete** | G1-G7 pass; G6 verified live | 1.1-1.8; citations 30→0 |
| 2 — Deemed manufacturer | **complete** | G1-G7 pass; G6 verified live | 2.1-2.5 |
| 1B — Manufacturer deepening | **complete** | G1/G4/G5 pass; G6 pending | 1B.1-1B.5 done incl. provenance ledger |
| W1 — Multi-act engine | in_progress | — | corpus + guard done; registries open |
| W2 — NIS2 | in_progress | — | Directive corpus + verifier done |
| 3 — Importer / Distributor | **rules complete** | G1/G4/G5 pass | 3.1-3.5 done; UI + G6 open |
| 4 — Steward | **rules complete** | G1/G4/G5 pass | 4.1-4.6; UI + G6 open |
| 5 — Authorised rep | **rules complete** | G1/G4/G5 pass | 5.1-5.3 done; cockpit + G6 open |

### G2 baseline (re-tuned after Phase 1)

"0 failed tests" was unsatisfiable: 32 failures pre-date this programme and are
tracked in issue #62, deferred by decision until the persona phases are done.
A gate that can never go green is not a gate, and worse, it hides the one
failure that IS yours — during Phase 1 exactly one real regression was
introduced and it was indistinguishable from the noise.

The gate is therefore **no new failures against the baseline**, measured by
name, not by count. Counts drift with flaky shared-state suites; names do not.

    gh run view <baseline-run> --log-failed > old.txt
    gh run view <new-run>      --log-failed > new.txt
    # strip ANSI, take the text after "×", drop the trailing duration, diff sets

Baseline at the start of Phase 2: **32 failed / 523 passed / 555 total**, with
`DEMO_READONLY=true` set. Any name not in that set is a Phase 2 regression and
halts the phase.

---

# Phase 1B — Manufacturer deepening (added 2026-08-15)

Phase 1 made the manufacturer's *statutory rules* correct. It did not make the
manufacturer's *journey* complete. `DESIGN_five_shapes.md` (D1, D3) committed to
the system-of-record posture and to four areas the app did not cover at all.

This phase existed only in the design doc and commit messages until now, which
is precisely the drift the plan is supposed to prevent.

### Tasks

- **1B.1 Notified body engagement** — **DONE** (commit c25225a).
  Art. 32(2) forces this on most important Class I products today. Art. 30(4)
  attaches the body's number to the CE marking on **Module H only**, which the
  nameplate studio had as the broader "only if assessed". Annex VIII II.3/6/7/10
  implemented; the single-body rule enforced structurally with a 409.

- **1B.2 Supplier / component due diligence (Art. 13(5), Recital 34).** — RULE DONE
  The BOM skeleton exists — `parentComponentId`, `tierLevel`, `supplier`,
  `manufacturer`, `partNumber`, `firmwareVersion`, hashes, dependency graph.
  What is missing is the **evidence layer**: per component, what CRA evidence is
  needed from that supplier, whether it has been obtained, whether it is current,
  and what was done when a component maker disappeared.
  Bidirectional per the design: collect upstream, publish downstream, and the
  Art. 21 rebrand case where the OEM holds the design evidence.

- **1B.3 Versions and variants.** — RULE DONE
  One product row is currently one of everything. A substantial modification
  applies to a *specific version*; SBOM, DoC and support period are per version;
  a vulnerability affects some versions and not others; the retention clock runs
  from when *that version* was placed on the market.

- **1B.4 Provenance (P6).** — **DONE** (rule, ledger, wiring, Annex V signature)
  The gap D1 creates. A system of record without provenance is a filing cabinet
  with no lock. Who attested, when, over exactly what bytes, and unchanged since.
  Evidence, artifacts and determinations all need it; the signature surface for
  the Annex V DoC depends on it.

- **1B.5 End of support / EOL.** — RULE DONE
  Support period ends, Annex II communication is owed, obligations change — and
  retention under 13(13)/13(18) continues for years afterwards. Nothing currently
  marks a product as past support.

### Acceptance criteria

- A component with no supplier evidence is visibly a gap against Art. 13(5), and
  the gap names what is missing rather than scoring it.
- A substantial modification recorded against version 2.1 does not silently
  change version 1.0's obligations.
- Every artifact and evidence item carries who/when/what-bytes, and a changed
  byte is detectable.
- A product past its support period reports obligations that have ENDED
  separately from those that continue (retention), rather than going quiet.

---

# Workstream W1 — Multi-act engine (added 2026-08-15)

`DESIGN_five_shapes.md` D9. Ten acts are seeded and the role vocabulary already
translates per act. Adding an act must mean registering content, never editing
the engine.

- **W1.1 Shared OJ parser** — **DONE**. `scripts/lib/eu_oj_parser.mjs`, proven
  behaviour-preserving by the CRA reproducibility gate, which caught a real
  regression during the extraction (graph edges 230 -> 181).
- **W1.2 Per-act citation guard** — **DONE**. NIS2 checked for the first time.
- **W1.3 Registries** — open. Determinations, clocks, status derivers and
  artifacts keyed by `regulationKey`. The concrete trigger is
  `orgProfile.ts:218`, where Phase 1.5 special-cased `cra::Art 14`; NIS2 Art. 23
  and AI Act Art. 73 need the same treatment and would become an if/else chain.

# Workstream W2 — NIS2 (added 2026-08-15)

`DESIGN_five_shapes.md` D8. NIS2 is a **Directive**: the corpus is authoritative
for what the Directive says and silent on what any entity must do.

- **W2.1 Directive corpus** — **DONE**. 144 recitals, 46 articles, 3 annexes,
  from the authentic OJ text.
- **W2.2 Verifier** — **DONE**. Ten checks; also exposed and fixed a vacuous
  check in the CRA verifier (B3 passed having detected nothing).
- **W2.3 NIS2 obligations via the shared primitive** — open. Blocked on W1.3.
- **W2.4 National transpositions** — deferred. NL then DE.

## Errors encountered

| Phase | Error | Attempt | Resolution |
|-------|-------|---------|------------|
| — | (none yet) | | |
