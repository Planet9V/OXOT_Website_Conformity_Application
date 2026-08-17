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
| G2 | Tests | `cd artifacts/api-server && npx vitest run` — **ZERO failures** (baseline reached 0 in task 8.1, 2026-08-16), and the phase's new tests present and passing |
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
- **W1.3 Registries** — **DONE**, narrower than planned, deliberately.
  `lib/statusDerivers.ts` holds derivers keyed `${regulationKey}::${refCode}`;
  `orgProfile.ts` looks up instead of branching, and the `cra::Art 14` special
  case is gone. Adding NIS2 Art. 23 or AI Act Art. 73 is now a registration.

  The plan also named registries for determinations, clocks and artifacts.
  **Not built.** Those are not if/else chains today — they are modules called
  directly — so three registries holding one entry each would be architecture
  with nothing to hold. They get built when a second act needs them, and this
  line is the record of the decision rather than a forgotten item.

  Verified: 7 new tests, gates green (citations 0, honesty 9), typecheck clean,
  and G6 live on :8088 — one derived obligation (`cra Art 14 -> not_met` from
  `conformity_incident_submissions`), the other 46 falling through to their
  recorded evaluations. Identical to the pre-refactor behaviour.

# Workstream W2 — NIS2 (added 2026-08-15)

`DESIGN_five_shapes.md` D8. NIS2 is a **Directive**: the corpus is authoritative
for what the Directive says and silent on what any entity must do.

- **W2.1 Directive corpus** — **DONE**. 144 recitals, 46 articles, 3 annexes,
  from the authentic OJ text.
- **W2.2 Verifier** — **DONE**. Ten checks; also exposed and fixed a vacuous
  check in the CRA verifier (B3 passed having detected nothing).
- **W2.3 NIS2 obligations via the shared primitive** — open. No longer blocked:
  W1.3 landed, so a NIS2 Art. 23 deriver is a registration once NIS2
  obligations are seeded. Seeding them is the remaining work.
- **W2.4 National transpositions** — deferred. NL then DE.

## Errors encountered

| Phase | Error | Attempt | Resolution |
|-------|-------|---------|------------|
| — | (none yet) | | |

---

# Phase 6 — Team role model (added 2026-08-15)

Prerequisite for the shell redesign's D12 (two equal daily users). Today
`conformityMembers` carries a free-text `roleResponsibility` and the only real
roles are `admin` and `member`, so "the home differs by role" has nothing to
branch on.

- **6.1** Model the four team roles as data, not free text. — **done 2026-08-15**:
  `TEAM_ROLES` + nullable `team_role` in `conformityMembers` (null = unassigned,
  never defaulted), validated in adminTeam routes, ledgered, seeded, selectable
  and badged on the team page. Drift-guarded by `teamRoles.test.ts`.
- **6.2** Fix `conformityMembers.plainPassword` — passwords are stored in
  plaintext. This table is being touched anyway; it is not acceptable to leave.
  — **done 2026-08-15**: column removed from schema, routes, seeds and dropped
  from the database; scrypt hash is the only stored credential; verified live
  (create → login → rotate → old password 401, DTOs carry no password field).
- **6.3** Scope obligations and evidence requests by role, so an inbox can be
  role-scoped rather than showing everyone everything. — **done 2026-08-15**:
  every obligation now carries `defaultTeamRole` (theme-keyed registry in
  `lib/teamRouting.ts` — a workflow routing default, not a statutory
  assignment; unmapped themes land with the coordinator, never with nobody),
  and `/me` exposes the member's `teamRole` (spec-first via openapi.yaml +
  orval). The evidence-request half is deferred WITH REASON: the P2 request
  model does not exist yet (design doc: "no request model") — it is built in
  Phase 7, and scoping it lands there.

Acceptance: a user's role determines what their home surfaces, and no password
is readable in the database.

# Phase 7 — Shell redesign (added 2026-08-15)

Per `DESIGN_five_shapes.md` iteration 2. Nine destinations in four groups,
replacing 34 pages and 51 route registrations. Built **on** the existing 181
design tokens and 57 UI primitives — structure and surfaces are new, the visual
language is not discarded.

- **7.1** Navigation shell and routing for the nine destinations; retire the
  route aliases. — **done 2026-08-15**: four-group nav (Work / Registers /
  Reference / Admin) with the nine destinations; donor pages mounted
  (Incidents←psirt, Projects←steward, Organisation←org-profile,
  Library←wiki, Settings←team); honest placeholders for Authorities and
  Signatures that state the 7.5 gap; 12 retired paths redirect; alias sprawl
  collapsed to one canonical path per page; not-yet-re-homed surfaces held in
  an explicitly transitional "More" menu that is deleted as 7.2–7.6 land.
  Verified live by scripts/verify_shell_71_playwright.mjs (9 destinations +
  12 redirects, screenshots).
- **7.2** Home, role-aware. Phase 6 delivered its inputs: branch on
  `/conformity/me` `teamRole` and filter by each obligation's
  `defaultTeamRole`. A null teamRole renders the NEUTRAL home, never a
  guessed one (L40). — **done 2026-08-15**: "Your work" panel leads Home —
  role badge, open obligations routed by `defaultTeamRole` sorted by due
  date, per-role destination shortcut, and the routing-default disclaimer in
  the UI itself. Null role / admin / demo get the honest neutral notice.
  Fixed two wrong-era labels in the donor content (Annex IV→VII technical
  documentation; presumption Art. 34→27, both corpus-verified). Verified
  live by scripts/verify_home_72_playwright.mjs (jack scoped, admin neutral).
- **7.3** Products as the polymorphic subject file — renders per the product's
  role, absorbing notified body, CE, versions, end-of-support, BOM evidence.
  — **7.3a done 2026-08-15** (the polymorphic spine): products carry
  `orgRole` (nullable, spec-first, validated; null renders the declaration
  prompt, never a guess); a manufacturer file shows the Assess stage
  (notified-body engagements, Art. 32 verdicts from the engine, Annex VIII
  single-body 409 surfaced verbatim); an importer/distributor file shows the
  Verify gate (Arts. 19/20 tri-state checklist, duty-to-refrain hold as a
  refusal) and NO authoring stages. G8 orphans 6 → 4.
  — **7.3b done 2026-08-15** (versions loop closed): the versions table and
  its Phase-2 engine had NO write-path — the file reported "no versions
  recorded" as a gap no user could close. POST
  /conformity/products/:id/versions + a Record-version dialog in the
  statutory file; per-version Art. 13(13) retention now resolves from the
  version's own placing date; natural-key duplicates 409. Also established:
  applied standards were ALREADY re-homed (StandardsEditor in the wizard) —
  the standards-matrix donor page's real content lives there.
  — **7.3c done 2026-08-16** (donor retirement): the Arts. 21/22
  deemed-manufacturer determination is re-homed into the product file (shown
  for importer/distributor/system-integrator products, tri-state facts, the
  engine's persisted verdict with record hash, all-unanswered runs report
  what is unanswered). partner-hub, standards-matrix and importer-archive
  pages are DELETED with redirects (their real content lives in the product
  file, the wizard's StandardsEditor, and the statutory file's retention
  clocks; the stateless procurement calculator's statutory substance is the
  Verify gate). CE studio stays as a tool in the More menu pending a real
  CE stage.
- **7.4** Incidents, cross-act — CRA Art. 14 and NIS2 Art. 23 on one surface.
  — **7.4a done 2026-08-15**: /incidents is now the real destination — a new
  workspace-level GET /conformity/incidents (spec-first) feeds an act-badged
  triage list with the three Art. 14 clock chips per incident
  (met/pending/OVERDUE rendered from the row's own dueAt/doneAt), each row
  linking into the workbench where the staged-submission panel already
  lives. The NIS2 Art. 23 gap is stated ON the surface (entity-side incident
  model ships with the NIS2 seeding). The static psirt donor moved to
  /psirt-tools in the More menu.
  — **7.4b done 2026-08-16 (and W2.3 with it)**: the demo org now declares
  operator + nis2 (seeded, idempotent), so 12 NIS2 obligations flow through
  the same engine — D11's simultaneous-roles story is real (manufacturer AND
  operator). NIS2 entity incidents exist end-to-end: lib/nis2Reporting.ts
  (unit-tested, incl. the Art. 23(4)(d) trap — the one-month final report
  anchors on the NOTIFICATION SUBMISSION, so it has NO deadline before that
  submission and the API refuses a final report recorded first), entity-
  scoped table (an entity's incident is not a product's), staged-submission
  routes with recipient CAPTURED as text (the transposition decides it —
  W2.4 still deferred), and the cross-act Incidents surface rendering both
  acts. Partner-hub stage 5 is subsumed: the real staged submissions ARE
  the payload flow. PSIRT toolkit content absorption remains the one open
  donor item (psirt-tools in the More menu).
- **7.5** Authorities, Signatures, Projects, Organisation — the four surfaces
  that give the six orphaned capabilities a home. Includes building the P2
  evidence-request model and applying the role scoping deferred from 6.3.
  Projects moves the steward UI onto the Art. 24 engine
  (`/conformity/steward/:project`) and retires the older `/steward` route —
  one implementation, not two side by side.
  — **7.5a done 2026-08-15**: Authorities and Signatures are real surfaces;
  their placeholders retired as promised. Authorities: Chapter V engagement
  list with the engine's Art. 53/54 assessments, record dialog (the
  prescribed period is CAPTURED from the authority's communication, never
  computed — its absence renders as a gap), Art. 54(5) escalation exposure
  surfaced at the top, mark-completed. Signatures: the P6 provenance ledger
  (GET /conformity/attestations without subject now lists the workspace,
  capped and saying so) — read-only by design; Annex V signing stays in the
  workbench with its refusal rules. G8 orphans 4 → 2 (steward policy,
  mandates — 7.5b).
  — **7.5b done 2026-08-15 — G8 IS ZERO.** Projects runs on the Art. 24
  engine: project register (new GET /conformity/steward), versioned policy
  (supersede-never-overwrite, per Art. 24(2)), cooperation clocks, and the
  engine's legal position (Art. 64(10)(b) fines exemption stated WITH its
  limits). The older steward implementation is deleted on both sides —
  openSourceStewardRoutes.ts unmounted and removed, open-source-steward.tsx
  removed — one implementation, as the plan demanded. Organisation gained
  the Art. 18 mandates panel: stored-as-written, defects reported never
  trimmed, Art. 18(3) copy-producibility surfaced. Every shipped capability
  now has a screen; the G8 baseline is 0 and stays there.
  — **7.5c done 2026-08-15**: the P2 "ask" half exists — evidence requests
  (new table + routes) validated against the reference layer (a request
  cannot cite a duty that does not exist), routed by team role or named
  member (a request must land in someone's inbox), with the 6.3 role-scoped
  inbox delivered in Home's "Your work": requests routed to your role appear
  there and close with a mandatory resolution. Closing NEVER touches the
  obligation's own status, and the UI says so. Due dates are the requester's
  choice, never presented as statutory clocks. G8 covenant honoured: the
  capability landed WITH its surface and registry entry (11 reached, 0
  orphaned).
- **7.6** Library with the universal statutory flyout; retire the nine
  reference pages. — **7.6a done 2026-08-15**: Library is one destination
  owning all reference content — a landing (statute reader, act catalogue,
  requirements, themes, matrix, sources; the NIS2 full-text reader honestly
  deferred to the NIS2 seeding) with the nine reference pages re-mounted
  UNDER /library/* and every old top-level path redirecting in, params
  preserved.
  — **7.6b done 2026-08-16**: the statutory flyout is universal —
  components/statutory-flyout.tsx (provider in the AppShell, `Cite` inline
  trigger), rendering VERBATIM articles, recitals and annexes from the
  bundled corpus and nothing else — no commentary, no paraphrase. CRA-only
  by honesty: other acts' citations get no lookalike. Wired at the point of
  use on Incidents (Art. 14), Signatures (Art. 28) and Projects (Art. 24),
  each linking onward to the Library. Partner-hub keeps its local copy only
  because the page retires in 7.3c.

Acceptance: every capability in the iteration 2 orphan table is reachable, the
seven design principles hold, and G6 verifies each surface live.

## Re-tuned 2026-08-15 (G7 closing Phase 6)

- **Donor framing (binding):** partner-hub and the persona pages are DONORS,
  not deletions. Stages 1–4 of the Axians pipeline re-home into the product
  file (7.3); stage 5 (24h CSIRT hub) re-homes into cross-act Incidents (7.4)
  and is wired to the real incident engine at that point. The statutoryFlyout
  pattern born in partner-hub goes universal (7.6).
- **Spec-first (L37):** every new Phase 7 endpoint consumed through the
  generated client is added to `lib/api-spec/openapi.yaml` and reaches the
  frontend via `orval` codegen — generated files are never hand-edited.
- **Verification cadence:** each 7.x lands with the full gate set, G2 proven
  by stash-compare in one environment (L38), one-shot images rebuilt before
  any parity run (L39), and G8's orphan baseline lowered as each capability
  gains its home — 6 → 0 across the phase.

## Sequencing note — the accepted risk

Phase 6 before Phase 7 means an extended period with nothing visible shipping,
and three personas (importer/distributor, steward, authorised representative)
stay unusable throughout. This was chosen deliberately over shipping a
compromised single home. Mitigation: 7.1 and 7.3 should land as early as
possible so the manufacturer journey stays demonstrable while the rest is built.

# Phase 9 — Absorption close-out (added 2026-08-16)

The remainder named by the Phase 8 G7: the last donors leave the TRANSITIONAL
menu, the menu itself is deleted, and G4 is driven to zero. Order is the
HANDOVER's "Next steps" order.

- **9.1 done 2026-08-16** Absorb `product-portfolio` into Products; retire the
  donor. All gates green at commit time: G2 CI-mirror 706/0/2, G8 = 15
  reached / 0 orphaned, G6 live (preview honesty, per-row rejection, absent
  fields stay absent, no assessment created, redirect verified; screenshots in
  `artifacts_verify/products_import_91/`). Survey
  (2026-08-16) found every donor tab already served by a real engine or
  scaffolding a parallel demo registry: fleet rollup → Home's command-center
  (`/conformity/portfolio`); versions → the statutory file (7.3b); PSIRT tab →
  Incidents (8.2; the donor's tab is unreachable dead code); document vault →
  product-detail. The one feature with no real-registry home is **import** —
  and the donor's version fabricates what it cannot parse (invents contact
  emails, CISA sectors, quantities) into `cra_portfolio_products` seeded with
  "CRA Class I certified" strings the conformity registry must never inherit.
  Batch: spec-first `POST /conformity/products/import` (honest bulk create:
  name required, absent facts stay null, rejects reported per row, NO
  assessment/classification created — Art. 32 assessment remains an explicit
  user act); an Import dialog on Products whose preview never invents a value;
  G8 registry entry in the same commit; delete the donor page with
  `/product-portfolio` → `/products` redirects and drop the TRANSITIONAL
  Portfolio entry; delete `POST /conformity/products/quick-start` (its only
  consumer was the donor; it silently defaulted `important_class_1`) and the
  consumer-less fabricating portfolio endpoints (fleet list, customers CRUD,
  ai-parse-file, upload-bulk, psirt-impact, demo seed) — the documents
  endpoints stay, product-detail's vault consumes them. Follow-up hygiene
  recorded, not done here: the now-unused portfolio tables
  (`cra_portfolio_products`, releases, customers, deployments) and the shared
  `cra_product_documents.productId` that two registries key differently.
- **9.2 done 2026-08-16** Re-home `reports` and `flows`. The reports LIST
  became a section on Home (`components/home/reports-section.tsx` in the
  command-center — the coordinator's surface); each document still opens in
  the unchanged `/reports/:id` workspace, and per-assessment generation stays
  in the workbench's Reports tab (already homed). Flow authoring moved to
  `/settings/flows` under a new Settings sub-navigation (Team | Assessment
  flows) — it is admin-authored configuration, which is what Settings is.
  `/reports` → `/` and `/flows` → `/settings/flows` redirects; command
  palette updated; the TRANSITIONAL menu now holds only auditor-portal.
  Gates: G2 CI-mirror 706/0/2 re-run green; G8 15/0; G6 live 8/8 with
  reviewed screenshots (`artifacts_verify/reports_flows_92/`).
- **9.3 done 2026-08-16** Decide `auditor-portal`; DELETE the More menu.
  Decision: the portal is what the design always named it — the permanent,
  EXTERNAL notified-body door (token-authenticated, routed outside the login
  shell like the public CVD page). Internal team members are not its users,
  so it does not belong in internal navigation at all. The TRANSITIONAL
  array, TransitionalMenu, its desktop and mobile mounts and the duplicate
  inner-shell routes are deleted; the nav now holds exactly the nine
  destinations. Survey found the track REAL but HALF-BUILT: token-validated
  reads of real assessment/evidence data and a working RFI write — but no
  issuance path exists anywhere (nothing ever inserts into
  `conformity_auditor_access`) and the organisation never sees submitted
  RFIs. That gap is 9.3b, not silently absorbed. Gates: G2 CI-mirror re-run
  706/0/2; G6 live 5/5 (no More menu desktop+mobile, portal renders outside
  the shell, workspace 401 without / 403 with a garbage token; screenshots
  in `artifacts_verify/shell_93/`).
- **9.3b done 2026-08-16** The notified-body door has its key. Five spec-first
  endpoints (orval codegen): list/issue (admin, expiry 1–365 days EXPLICIT —
  never defaulted) and revoke auditor access; list the org's RFI inbox;
  record a response (status → answered, respondedAt set, activity ledger row
  for every act). New `AuditorAccessPanel` in the manufacturer product file
  (issue dialog, portal-link copy, revoke, RFI inbox with inline respond).
  G8 registered both capabilities (17 reached / 0 orphaned). G2 CI-mirror
  712/0/2 including a new 6-test HTTP suite proving issue → portal opens →
  RFI → inbox → answer visible through the portal → revoke closes (403).
  G6 live 7/7 with reviewed screenshots
  (`artifacts_verify/auditor_track_93b/`).
- **9.4a done 2026-08-16** W2.4 NL: the Cyberbeveiligingswet corpus + reader.
  Unblocked the same day by locating the AUTHENTIC sources (user asked for a
  web search): the promulgation Stb. 2026, 187 (structured XML from
  zoek.officielebekendmakingen.nl — the NL analogue of the OJ) and the
  consolidated register BWBR0052872, in force 2026-08-15 (the DAY BEFORE
  this build). Pipeline mirrors CRA/NIS2: committed source →
  `build_cbw_corpus_from_stb.mjs` (hand-rolled ordered-XML parser; 16
  hoofdstukken, 111 artikelen incl. inserted 21a — numbering asserted
  contiguous; amendment articles 99–105 are `wijzig-artikel` and their
  QUOTED provisions are payload, never articles) → sync →
  `verify_cbw_corpus.mjs` (A source byte-match live, B register in-force
  probe with an honest "----" on unprovable amendment absence, C integrity +
  bundle sha, D verbatim probes incl. the Art. 27 72-uur clock, F framing:
  national_transposition, Dutch, never a translation) → CI (verifier +
  byte-for-byte reproducibility). Reader at /library/cbw: Dutch VERBATIM
  (no official translation exists; translating would be reconstruction),
  amendment badge, § section labels; the NIS2 reader's banner now states
  the NL measure is loaded and links it. G2 712/0/2; G6 live 8/8
  (`artifacts_verify/cbw_reader_94a/`).
- **9.4b done 2026-08-16** W2.4 DE: the BSI-Gesetz corpus + reader. The
  source decision was made on evidence, with the user in the loop (they
  leaned promulgation, then consolidated): the promulgation
  (BGBl. 2025 I Nr. 301) is PDF-only — unverifiable byte-for-byte — and
  decisively, the BSIG has ALREADY been amended (Art. 4 G v. 11.3.2026
  I Nr. 66, with two further changes juris records). A promulgation corpus
  would show law no longer in force as written. Built instead from the
  CONSOLIDATED gesetze-im-internet.de XML (`bsig_2025`, gii-norm DTD),
  with the departure DISCLOSED: metadata carries
  `consolidatedNotPromulgated`, `whyConsolidated`, the authentic BGBl
  fundstelle, and the VERBATIM standangabe amendment trail — including
  juris's own caveat ("textlich nachgewiesen, dokumentarisch noch nicht
  abschließend bearbeitet"). Scope = the BSIG alone (Artikel 1
  NIS2UmsuCG); the other Artikel amend other laws and are excluded,
  stated. §§ 1..66 + 2 Anlagen; gliederung (Teil/Kapitel) tracked as
  document-order markers; ordered-XML tokenizer factored into
  `scripts/lib/ordered_xml_parser.mjs` (Cbw refactor proven
  byte-identical). Verifier: live zip byte-match ignoring juris builddate
  stamps; B1 compares the amendment trail against the LIVE record — a new
  amendment the corpus lacks is a loud STALE FAIL; verbatim probes pin
  the § 32 24h/72h clocks. Reader at /library/bsig with the disclosure
  banner + trail; NIS2 reader banner now names BOTH loaded
  transpositions. G2 712/0/2; G6 live 7/7
  (`artifacts_verify/bsig_reader_94b/`). W2.4 is COMPLETE (NL + DE).
- **9.5 done 2026-08-16** G4 driven 7 → 0 and the CI baseline lowered to a
  COVENANT (ci.yml `--baseline 0`, via the Edit tool per L48). The seven:
  both cra-analytics-suite copies and the server incident timeline claimed
  analyses "transmitted to EU Member States" (now "prepared for"/"recorded
  for" — the app records, it does not transmit); the assistant's canned
  reply promised a "CRA-Compliant" advisory (now a draft that says the tool
  does not conclude conformity); seedDemo called a release "fully
  compliant" (now describes what is tracked); and the public trust center
  showed procurement/auditors a "Cryptographic Provenance Hash" that was
  the SHA-256 of the EMPTY STRING in both locales (now "not yet published
  for this product"). Not "all in oxot-web" as previously noted — the gate
  output was the truth (L36). Gates: G2 712/0/2; G6 live 3/3 proving the
  fake digest is absent from the rendered page AND every served JS bundle
  (`artifacts_verify/honesty_zero_95/`).

# Hygiene batch H1–H3 (2026-08-16, post-Phase-9)

- **H1 done 2026-08-16** Portfolio schema hygiene. The four orphaned demo
  tables (`cra_portfolio_products`, `cra_product_releases`,
  `cra_enterprise_customers`, `cra_customer_deployments`) are DELETED from
  the schema (zero source consumers; the live tables held only the
  fictional seed, and the live vault held 0 rows — nothing real lost).
  `cra_product_documents.productId` now carries a real FK →
  `conformity_products.id` (cascade), ending the two-registry keyspace
  ambiguity. The H1 G6 probe then exposed and killed two more defects:
  (1) the vault's disk write ALWAYS failed in the container (EACCES on
  /app/uploads) — and the container-local "storage" was dishonest anyway
  (rebuilt away while the row claimed it existed); the DB row (content +
  sha256) is now the sole record, disk write removed, orphan uploads
  refuse with a clean 404; (2) the vault badge cited "CRA Art. 10(7)
  10-Year Archive" — draft-era numbering (final Art. 10 is cyber SKILLS);
  corrected to Art. 13(13) after checking the corpus title (L41). Live
  stack migrated (one-shot images rebuilt first — L39); G6 6/6 incl.
  cascade-delete proof and the four tables absent from the live DB
  (`artifacts_verify/vault_fk_h1/`); G2 712/0/2 re-run after the route
  change. Observed, explicitly out of scope: the long-known unused
  `cra_composite_*`/`cra_csaf_advisories`/`cra_procurement_evaluations`
  tables remain (a separate decision).
- **H2 closed as documented-by-design 2026-08-16.** The two skipped tests
  gate on `PRIVATE_OBJECT_DIR`, but `lib/objectStorage.ts` is hard-wired
  to the REPLIT GCS sidecar (external-account credentials against
  127.0.0.1:1106): setting the env locally would un-skip them straight
  into failure. Off Replit the skips are correct and state their reason.
  Making file evidence storage portable (local/S3 backend + non-sidecar
  upload URLs) is a NAMED FEATURE a future phase may take, not hygiene.
- **H3 done 2026-08-16 (the safe parts, see below).** Repo-local git identity set
  (Jim McKenney / mckenneyengineers@gmail.com — commits no longer
  attribute to the auto-derived hostname identity). Development is
  MAIN-ONLY from here: the local checkout switches to `main` after this
  commit; `feat/phase-7-shell-redesign` remains as history (always equal
  to main; never diverged). NOT done, needs the user outside a session:
  moving the repo out of ~/Downloads (breaks the running compose project
  name, `.mcp.json` paths and session state mid-session — do it between
  sessions, then `docker compose up -d` from the new path).

# Phase 10 — Portable evidence, user notification, three new acts (added 2026-08-16)

User-ordered scope, with the standing constraints unchanged (single-tenant;
the app never concludes conformity; tri-state; verbatim-or-absent statutory
text; gates at their covenant floors; nothing may break current features or
the customer experience — every batch proves the EXISTING surfaces still work
in G6, not only the new ones).

- **10.1 done 2026-08-16** Portable evidence storage. File evidence (P3: evidence files,
  xBOM uploads) is hard-wired to the Replit GCS sidecar
  (`lib/objectStorage.ts`, 127.0.0.1:1106), so uploads cannot work in any
  non-Replit deployment and two suites skip. Introduce a storage BACKEND
  seam: `replit-gcs` (existing behaviour, selected exactly as today so the
  Replit deployment is untouched) and `local` (filesystem under a compose
  volume; authenticated direct-upload endpoint replacing the sidecar's
  presigned URL for that backend). Same client-facing contract wherever
  possible; ACL semantics preserved. Done means: the two skipped suites RUN
  against the local backend in CI-mirror (G2 becomes 714/0/0), the live
  stack uploads/downloads evidence through the real UI (G6, plus proof the
  EXISTING evidence/BOM surfaces still work), and Replit selection logic is
  provably unchanged (unit test on the backend chooser).
- **10.2 done 2026-08-16** Art. 14(8) user-notification register. Statute FIRST, verbatim:
  CRA Art. 14(8) (informing impacted users about the incident/vulnerability
  and, where relevant, corrective measures) and NIS2 Art. 23 recipients-of-
  services language; clocks/anchors read from the corpus before any code.
  The donor's one good idea rebuilt honestly: a per-product register of
  product users/deployments (real table, FK'd, tri-state facts, no invented
  defaults), a derivation joining a published PSIRT advisory to the
  impacted-user set, and a RECORD of the organisation's own notification act
  (recorded-as-done by a named actor — the app never claims it transmitted
  anything). Surfaces: product file (register) + the PSIRT/Incidents panel
  (impacted set + record-notification), spec-first endpoints, G8 entries in
  the same commit.
- **10.3a–b done 2026-08-16** Three new acts, corpus-first (the reference
  layer + safeguards): authentic OJ sources committed (CELEX 32024R1689 /
  32023R1230 / 32014L0053), ONE parameterized builder over the shared
  parser (chapter filter for the AI Act's SECTION headings; annexes parsed
  by VISIBLE headings because the Machinery OJ HTML ships BROKEN annex ids
  — ANNEX IX reuses anx_I), pinned structures cross-checked by independent
  anchor counts (AI 180/13/113/13 · MR 86/9/54/12 · RED 75/7/52/8), one
  parameterized verifier in CI (A live byte-match, honest "----" corrigenda,
  C integrity + bundle sha, D probes, F regulation/directive framing),
  byte-for-byte reproducibility, three readers on one shared component with
  per-act honesty banners (RED carries the NIS2-style transposition
  caveat). The build EXPOSED AND FIXED a shipped defect: the parser's roman
  table stopped at VIII, so the NIS2 corpus had Articles 40–46 (Chapter IX)
  misassigned to Chapter I since 8.4 — real romanToInt now; CRA rebuilt
  byte-identical, NIS2 corrected. SAFEGUARDS extended as the user asked:
  check_citations.mjs now validates ai_act 1..113, machinery 1..54, red
  1..52 — the formerly SKIPPED AI-Act blogs/podcasts/content pages now
  VALIDATE against the real corpus (and passed); concept tables start
  empty and are earned, not guessed. The OJ's own typography is preserved
  verbatim (AI Act Art. 1's stray backtick is IN the published source).
- **10.3c OPEN** Obligations seeding + deriver registration for the three
  acts (D10: act is a dimension). This is statute-reading work per
  obligation — the CRA's 92 requirements took multiple phases — and is NOT
  rushed: each act needs its obligation set read from the corpus, seeded
  with citations that pass the now-live per-act gate, and its deriver
  registered. Scope it as its own phase when the user prioritises it.
- **10.3-note (original scope text follows for the record):** Sources as
  strict as CRA/NIS2 — authentic EUR-Lex OJ texts only: AI Act
  Regulation (EU) 2024/1689 (CELEX 32024R1689), Machinery
  Regulation (EU) 2023/1230 (CELEX 32023R1230), RED Directive 2014/53/EU
  (CELEX 32014L0053, consolidated-vs-OJ decision recorded the CRA way if a
  corrigendum exists). Each: committed source → build script (existing
  `eu_oj_parser.mjs`) → sync → verifier incl. D2 full-content parity →
  reproducibility in CI → Library reader with the same honesty banners
  (regulation vs directive framing; RED is a DIRECTIVE — national
  transposition caveat like NIS2's). THEN the safeguards the user asked
  for: `check_citations.mjs` extended so AI-Act/Machinery/RED citations in
  app code, blogs, podcasts and marketing VALIDATE against their corpora —
  today five files are SKIPPED as "about the EU AI Act"; those skips become
  enforcement, any surfaced wrong citations get fixed, baseline stays 0.
  Obligations seeding + deriver registration per D10 (act is a dimension —
  no new navigation), statutory flyout stays CRA-only unless verbatim
  parity is achievable per act.
- **10.4 done 2026-08-16** The last unused tables. Decide `cra_composite_components/
  _systems`, `cra_csaf_advisories`, `cra_procurement_evaluations`: wire to
  a real consumer or drop like H1 (survey write/read paths first — L43/L49).

Sequencing note: 10.1 before 10.2 because the notification register's
evidence attachments should land on the portable store, not the sidecar.
10.3's citation-gate extension may surface latent wrong citations in
published content — that is the point; they are fixed, never waived.

## Phase 11 — 10.3c: obligation content for the AI Act, Machinery Regulation and RED (opened 2026-08-16)

User chose candidate #1. Survey findings that shape the phase (verified
against the tree at 9d0c29a):

- The engine is ALREADY act-generic: `GET /conformity/org/obligations` is
  requirements(declared regs) × declared roles; derivers hook by
  `${regulationKey}::${refCode}` (`lib/statusDerivers.ts`). D10 holds —
  nothing here adds navigation or engine branches.
- `seedConformity.ts` already carries `ai_act` (12 rows) and `machinery`
  (8 rows) requirement seeds from the Phase-0 era — written BEFORE the
  corpora existed, never verified statute-first. **`red` has ZERO
  requirement rows** while its regulations-table row exists, so an org can
  declare RED + manufacturer today and silently get nothing.
- RefCodes in the `Art N` form deliberately evade the G5 regex (`Article`/
  `Art.` only) — the gate will NOT catch a wrong refCode. Every seeded
  refCode/title is verified against the corpus article TITLE by hand
  (L41), and descriptions keep the act's name within the 60-char
  attribution window of any spelled-out "Article N".
- Incident records are CRA-shaped (`conformityIncidents`) and NIS2-shaped
  (`conformityEntityIncidents`) ONLY. Per the statusDerivers doctrine (no
  deriver for data that does not exist), no `ai_act::Art 73` deriver is
  registered until an AI-Act incident record type exists. The deriver half
  of this phase is a documented refusal unless the in-batch survey finds
  real system data (e.g. attestation rows) a deriver could honestly read.
- `termFor` already speaks each act's language (ai_act: provider; red:
  manufacturer/importer/distributor; machinery: assembler for the
  integrator). Deployer duties (AI Act Art 26) belong to the `operator`
  role if seeded — decide from the corpus, not from memory.
- Mapping endpoints are validated at seed time (`seedConformity` throws on
  unknown refCodes), so renames are caught by G2's seed step.

Tasks (one batch each; statute read from the corpus BEFORE writing a row):

- **11.1 done 2026-08-16** 22 RED requirement rows seeded statute-first
  (each article read verbatim from the corpus before its row was written):
  Art 3(3)(d)/(e)/(f) cyber essential requirements; the Art 10 manufacturer
  chain (paras 1, 3–12); Art 18 DoC; Art 21 technical documentation;
  Art 12(1)/(7)/(8) importer and Art 13(2)/(4) distributor duties; Art 15
  traceability for all four economic operators (Art 2(16) defines them —
  same four as CRA Art 23). Non-cyber Art 3(1)/(2) deliberately NOT seeded
  (machinery precedent), reasoning in the seed comment. 7 cross-act
  mappings (Art 21 ≡ CRA Annex VII, Art 18 ≡ Annex V, Art 15 ≡ Art 23,
  Art 10(4) ↔ Art 13(13), the three 3(3) reqs ↔ CRA Annex I items). NEW:
  `orgObligations.test.ts` — the obligations endpoint's first tests
  (engine equation, RED rows in RED's vocabulary, undeclared-act
  isolation; restores prior declarations, L46). Gates: G1 · G2 720/0/0 ·
  G3 · G4/G5/G8 = 0 · seven verifiers · seed validation 114 req/79 map ·
  G6 live (seed image rebuilt per L39; declare-via-real-UI, cockpit badge
  `red · 17` for the manufacturer lens, screenshots reviewed, declaration
  restored). Original scope text: RED obligation seed — from `docs/red_statutory_corpus/`, the
  manufacturer/importer/distributor obligation set (Arts 3(2)/3(3)(d)(e)(f)
  essential requirements; Chapter II operator duties; technical
  documentation; conformity assessment; EU DoC; CE marking — final list
  decided with the corpus open). Honest cross-act mappings only where the
  relationship is real (Art 3(3) ↔ CRA Annex I items). Gates + G6: declare
  red via the API, see RED obligations with RED's own role terms on Home,
  screenshot, withdraw declaration.
- **11.2 done 2026-08-16** All 12 original rows verified against the
  corpus: Art 12 title corrected to the statute's "Record-keeping";
  Art 15(5) now names the statute's own attack list (data poisoning,
  model poisoning, adversarial examples, confidentiality attacks —
  verified verbatim before shipping); Art 73 carries the real clock
  anchors (15 days / 2 days widespread / 10 days death, immediate on
  causal link — L42). ELEVEN new rows: provider chapter Art 16(b), 18,
  19, 20, 21, 22 (AR); importer Art 23; distributor Art 24; deployer
  duties Art 26 → the operator role (Art 3(4) 'deployer' verified;
  operator termFor now speaks it); registration Art 49; transparency
  Art 50. GPAI Arts 53/55 NOT seeded — refusal + reason in the seed
  comment. 3 new mappings (Art 18↔CRA Art 13(13), Art 20↔RED Art 10(11),
  Art 19↔CRA Annex I(2)(l)). Gates: G1 · G2 721/0/0 · G3 · G4/G5/G8 = 0 ·
  seed validation 125 req/82 map · G6 live (api+seed images rebuilt;
  ai_act badge under BOTH lenses, operator = nis2·12 + ai_act·3,
  screenshots reviewed, declaration restored).
- **11.3 done 2026-08-16** THREE MISNUMBERED rows found and fixed (L41 —
  the annex corpus blocks carry no section numbers, so numbering was
  verified against the committed OJ source): the software-protection and
  intervention-evidence duties live in **1.1.9** (not "1.2.1(a)/(b)");
  the modification-restraint duty is **1.2.1(d)**; the tracing-log duty
  (five years) is **1.2.1(f)**; the real 1.2.1(a)–(c) say something else.
  The DoC row cited **Annex II — the safety-components list** — corrected
  to Art 21 / Annex V Part A; "technical file" (2006/42/EC language)
  corrected to "technical documentation" (Annex IV Part A). TWELVE new
  rows: Art 10 chain (10(3)(4)(6)(7)(9)(10)), Art 12 AR mandate,
  Art 13(1)/(7)/(8) importers, Art 15(2)/(5) distributors, Art 19
  traceability (all four operators, Art 3(22) verified). Partly-completed
  chain (Arts 11/14/16) NOT seeded — refusal in the seed comment. 5
  mappings corrected + 1 added (Art 19 ≡ CRA Art 23); regression test
  pins the corrected addresses. Gates: G1 · G2 722/0/0 · G3 · G4/G5/G8 =
  0 · seed validation 137 req/83 map · G6 live (machinery · 15 badge,
  screenshot reviewed, declaration restored).
- **11.4 done 2026-08-16** Deriver decision: NO new deriver — none has
  real data to read; the statusDerivers header now documents each
  candidate (ai_act Art 73, nis2 Art 23, three DoC derivers) and names
  the record type that must exist first. Endpoint honesty: the
  obligations response gains `regulationsWithoutSeededContent` (the
  endpoint predates the spec pipeline and is consumed by raw fetch, so
  no orval step) and the cockpit renders the amber note "Zero here means
  un-modelled, not compliant" for any declared-but-unseeded act (GDPR is
  the live example). Gates: G1 · G2 723/0/0 · G3 · G4/G5/G8 = 0 · G6
  live (GDPR declared via the real switch, note rendered, screenshot
  reviewed, declaration restored).

Done-markers appended per batch below as each closes.
