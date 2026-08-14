# Progress Log — CRA Persona Programme

## 2026-08-14 — Programme planned, gates built

**Context.** Follows the forensic audit and the corpus replacement (`fadd017`).
The audit found the app asserted statutory acts it never performed; the corpus
replacement grounded the statute. This programme rebuilds the personas on that
foundation.

**Written:**
- `docs/cra-personas/task_plan.md` — Phase 0 + five role phases, each with tasks,
  machine-checkable acceptance criteria, and a seven-check gate (G1–G7).
- `docs/cra-personas/findings.md` — verified state of the six shipped personas,
  the real CRA role articles, per-route persistence/auth table.
- `docs/cra-personas/lessons.md` — ten lessons seeded from this session's audit,
  to be read at the start of every phase and appended to at every G7.
- `scripts/check_honesty.mjs` — gate G4.
- `scripts/check_citations.mjs` — gate G5.

**Gate baseline established (both gates deliberately run against a dirty tree
first, per lesson L5 — a check that cannot fail proves nothing):**

| Gate | Result | Count |
|------|--------|-------|
| G4 honesty | **FAIL (exit 1)** | 12 unearned claims |
| G5 citations | **FAIL (exit 1)** | 24 contradicted citations |

Both are correct failures. Driving them to zero is Phase 0 work.

**The gates found 36 defects that manual review had missed**, including:
- `trust-center-page.tsx:62,98` — SHA-256 of the empty string presented to
  procurement as a "Cryptographic Provenance Hash", in both EN and NL.
- `conformityAssessments.ts:832` — "impact analysis transmitted to EU Member States".
- `persona-cockpit.tsx:81,117` — still citing Art. 18(2) for duty to refrain
  (real: Art. 20) after I had corrected the `statutoryBasis` fields by hand.
- `command-center.tsx:321` — Art. 21 for substantial modification (real: Art. 22).
- `command-center.tsx:183` — the `|| MOCK_PORTFOLIO_DATA` silent fallback.

That miss rate is itself the argument for the gates: hand review of the same
files, twice, in the same session, did not find these.

**Status:** plan written, gates operational and red. No phase started.
Awaiting go/no-go on Phase 0.

**Repo note:** a concurrent process committed 5 times during the preceding
session (podcast workstream), once absorbing unrelated edits via `git add -A`.
Check `git log --oneline -3` at the start of each phase (lesson L8).

## Errors encountered

| Phase | Error | Attempt | Resolution |
|-------|-------|---------|------------|
| plan | `check_honesty.mjs` walk() used `e.key ?? e.name` | 1 | Corrected to `e.name`; verified against real tree |
