# Lessons — read this FIRST at the start of every phase

This is the carry-forward file. Gate **G7** requires appending to it at the end
of each phase, then re-tuning the next phase's tasks in `task_plan.md` in light
of what is written here.

Rules for this file:
- A lesson is only worth writing if it would **change what someone does next**.
- Every lesson names the evidence (file:line, command, or commit).
- If a lesson contradicts an earlier one, supersede it explicitly — don't
  accumulate contradictions.

---

## Seeded from the 2026-08-14 audit and honesty pass

These were paid for once already. Do not relearn them.

### L1 — A convincing screen that persists nothing scores zero
Six of seven "engines" shipped as demo shells: they rendered, cited statute, and
returned computed results, but `importerArchiveRoutes`, `harmonisedStandardsRoutes`
and `openSourceStewardRoutes` contain **zero** database calls between them.
Four tables (`cra_article21_audits`, `cra_csaf_advisories`, `cra_composite_systems`,
`cra_procurement_evaluations`) were created and never written.
**Apply:** a task is not done when the screen renders. It is done when the data
survives `docker compose restart api`. Put that in the acceptance criterion.

### L2 — Making a network call is not the same as being wired
`standards-matrix.tsx:53` POSTs to `/api/standards/evaluate-presumption` and then
**discards the response**; the score shown is recomputed client-side.
**Apply:** when verifying "is it wired", trace the response to what renders it.
A fetch in the file is not evidence.

### L3 — The most dangerous bugs typecheck cleanly
`tsc --noEmit` was green across 138 files the whole time the app was telling
users their ENISA notification had been filed. Every fabricated claim was a
well-typed string.
**Apply:** type safety is not honesty. G4 exists because G1 cannot catch this.

### L4 — Fallbacks that look like data are worse than errors
`command-center.tsx:184` was `const data = rawData || MOCK_PORTFOLIO_DATA`, with
`isError` destructured and never used — so a broken API rendered a plausible,
confident, entirely fake dashboard.
**Apply:** never `||` a fallback into a data path. Render the empty or error
state. This is Phase 0 task 0.6 and applies to every phase thereafter.

### L5 — Self-referential verification proves nothing
`audit_cra_statutory_completeness.mjs` scored the corpus 100% by asserting
properties its own generator guaranteed, with thresholds set below the claim
(`articles >= 10` for a corpus claiming 71). The shipped unit test had the same
weakness and sat red for weeks.
**Apply:** a check must be able to fail. When writing one, first make it fail on
purpose, then make it pass. Phase 0 task 0.7 requires exactly this.

### L6 — Get the statute from the statute
Every invented article number traced back to one script that made them up.
Once the corpus was parsed from EUR-Lex, ~45 of 71 numbers turned out wrong,
Recital 34 turned out to mean the opposite of what the product claimed, and
Art. 64(10)(b) — a fine exemption for stewards, commercially useful — had been
invisible the whole time.
**Apply:** never hand-type an article number. Resolve it against
`docs/cra_statutory_corpus/`. G5 enforces this.

### L7 — Verify the environment before trusting a green build
The local `vite build` had been broken for an unknown period by two missing
native bindings (`lightningcss`, `@tailwindcss/oxide`). Nobody noticed because
nobody could build. Docker masked it by installing its own dependencies.
**Apply:** G3 runs the *local* build deliberately. If it breaks again, fix it
rather than routing around it via Docker.

### L8 — This repo has a concurrent writer
A separate process commits to the working branch during sessions, and at least
once ran `git add -A` and swallowed unrelated in-progress edits into its commit
(`857e91a`). It committed three more times during the same session.
**Apply:** commit early and with tight `git add` paths — never `git add -A` on a
shared branch. Do not rebase or rewrite history while it is active. Check
`git log --oneline -3` at the start of each phase to see if HEAD moved.

### L9 — Ask what the role actually owes before building for it
Whole surfaces were built for a "Plant CISO" persona that has no CRA obligations
at all, and the steward surface asserted an exemption from an article that
governs distributors. Both would have been caught by reading the role's actual
duty set first.
**Apply:** each phase opens by listing the role's operative paragraphs from the
corpus, and mapping each to covered / partial / absent, before writing code.

### L10 — Separate the two axes, always
Org CRA role (which obligations exist) is not user role (who does the work).
Conflating them is what produced six cockpits that changed labels and nothing
else.
**Apply:** when adding a field, ask which axis it belongs to. If the answer is
"both", it is two fields.

### L11 — Check whether the legal precondition is met, not just whether the rule exists
The app asserts `FULL_STATUTORY_PRESUMPTION` under the presumption-of-conformity
rule. The rule is real (Art. 27), but its precondition is not met: Art. 27(1)
grants the presumption only for harmonised standards "the references of which
have been published in the Official Journal", and **no CRA harmonised standard
has been cited yet**. So the app grants a legal benefit that currently exists
for nobody. The knock-on: Art. 32(2) means an important Class I manufacturer
cannot self-assess today, because the condition that unlocks self-assessment
cannot be met.
**Apply:** for every legal benefit the app confers, find the precondition in the
text and model it as data with a source and a checked-on date. Never hardcode
today's answer — this one flips the moment the first standard is cited.
(Evidence: Art. 27(1) and Art. 32(2) in the local corpus; `harmonisedStandardsRoutes.ts:128,173`.)

### L12 — Rank your sources, and say which tier you used
Research on standards status returned mostly vendor trackers and law-firm
guides. Those are fine for "has anything been published yet" but cannot ground
an obligation. The operative legal logic here was confirmed straight from the
local verbatim corpus instead, which made the secondary sources unnecessary for
anything load-bearing.
**Apply:** primary = the OJ text we hold, plus Commission pages. Secondary =
everything else, indicative only. State which tier a claim rests on whenever it
lands in the product or the plan.

---

## Phase retros

*(Appended at G7. Format below.)*

<!--
## Phase N — <name> — completed YYYY-MM-DD

**What worked:** …
**What cost time:** …
**Surprises:** …
**Re-tuning applied to Phase N+1:** … (name the specific task edits)
**New lessons:** Lnn — … (evidence: file:line)
-->
