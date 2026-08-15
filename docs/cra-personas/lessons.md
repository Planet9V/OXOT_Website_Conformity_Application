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

### L13 — Read the existing schema before specifying new tables
Phase 0 originally specified `org_cra_roles` **and** `obligation_instances`.
Inspecting `lib/db/src/schema` first showed that `requirements` already carries
`refCode`, `obligationType` and an **`appliesTo` role axis**, that
`conformity_evaluations` already is the obligation instance (status, owner,
riskRating, dueDate) keyed by a natural key that survives a reference reseed,
and that `requirement_mappings` already links CRA to IEC 62443. Only the org
role layer was actually missing. Specifying the other table would have created
a second, competing source of truth for obligation state — the same defect class
as the two contradictory corpora we just removed.
**Apply:** before adding a table, grep `lib/db/src/schema` for the concept and
read the closest existing one. The good half of this codebase is better designed
than a from-scratch spec written without looking.
(Evidence: `lib/db/src/schema/{requirements,conformityEvaluations}.ts`;
`seedConformity.ts` refCodes include `4-1 SM`, `4-1 DM`, `4-2 FR1`.)

### L14 — `git stash` is not a safe way to test a baseline
Used twice this session to answer "does this error pre-exist"; both times the
pop restored incompletely and silently dropped an edit (the honesty-pass changes,
then the `schema/index.ts` export). Both recovered, but only because the loss was
noticed.
**Apply:** to decide whether a failure is yours, check whether you touched the
file (`git log -1 -- <path>`), not whether it disappears when your work does.
Never stash a dirty tree mid-task.

### L15 — Composite project references serve stale declarations
Adding a table to `lib/db/src/schema` and exporting it correctly still failed to
typecheck in api-server: `Module '@workspace/db' has no exported member`. The
package resolves through TypeScript project references, so consumers read
`lib/db/dist/*.d.ts`, not `src`. Source was right; the emitted declarations were
old.
**Apply:** after any change to `lib/db/src/schema`, run `cd lib/db && npx tsc -b`
before typechecking anything that imports it. Two of the three fix cycles on
Phase 0.3 went to this.

### L16 — Editing a seed file changes nothing until the seed is re-run
`/obligations` correctly returned zero IEC 62443 rows after IEC was declared,
because the DB still held the pre-migration `appliesTo` values. The code was
right and the data was stale — a failure mode that looks exactly like a logic
bug.
**Apply:** any change to `seedConformity.ts` needs
`docker compose run --rm --user root --entrypoint sh api -c "cd /app/artifacts/api-server && npm run seed:conformity"`.
The `--user root` matters: the container user cannot write `dist/`.
Verify against the DB (`select regulation_key, applies_to, count(*) from requirements group by 1,2`),
not against the source file.

### L17 — `docker compose up` silently re-runs the one-shot seed and can revert your data
`/obligations` returned 44 in the API test, then 30 an hour later with nothing
touched in between. Cause: `docker compose up -d web` re-ran the `seed` service
(a `depends_on` one-shot), which rewrote `requirements.applies_to` back to the
pre-migration values.
**Apply:** after any `docker compose up`, re-verify data-dependent behaviour.
Treat a number that changed without a code change as a seed re-run until proven
otherwise.

### L18 — `docker compose build api` does not rebuild `seed` or `migrate`
They build from a **different target** (`target: build`) than the api service
(`target: api`), so the seed image kept the pre-edit `seedConformity.ts` even
after `build api` succeeded. Re-seeding then faithfully restored the old data.
**Apply:** any change to a seed script needs `docker compose build seed` before
`docker compose up -d seed`. Combined with L16: edit the seed, build the seed
image, run the seed, then verify against the DB — three separate steps, none of
which the others imply.

### L19 — Count the findings, not the output lines
Reported the citation gate at "40 findings" for two sessions. The real number is
36; `grep -c` was counting output *lines* and each violation prints several. The
error only surfaced when the CI ratchet behaved differently from expectation at
the boundary.
**Apply:** have the tool print its own count and read that, rather than grepping
its rendering. Any number quoted to the user should come from the program, not
from a pipe.

### L20 — A gate that is red on day one gets ignored
Both gates fail on a codebase that predates them (13 and 36). Landing that in CI
unchanged would make every build red, and a permanently-red build teaches people
to skip it — which is exactly how the original 36 defects survived with no CI at
all.
**Apply:** ship gates with a `--baseline <n>` ratchet set to the known backlog.
New defects push the count above the baseline and fail immediately; the backlog
is burned down by lowering the number. The baseline may only ever decrease.

## Phase 0 — Role model foundation — completed 2026-08-15

**What worked:** Reading `lib/db/src/schema` before specifying tables cut the
phase to roughly a third (L13). Per-step live verification caught two defects a
typecheck-and-commit loop would have shipped: stale seeded data, and a seed
image built from a different Docker target. Fix cycles stayed inside the
3-attempt limit every time; the limit was reached once and resolved on that
cycle.

**What cost time:** Four separate batches of pre-existing breakage from the
concurrent blog/podcast workstream — `craFaqRoutes.ts`, `podcastStudio.ts`,
`podcast-studio.tsx`, then four oxot-web pages. All were blocking gate G1 for
work unrelated to them. Roughly a third of the phase went to clearing someone
else's red baseline.

**Surprises:** The obligation catalogue, the instance model **and** the
CRA↔IEC 62443 mapping table already existed and were better designed than the
plan. The good half of this codebase is genuinely good.

**Re-tuning applied to Phase 1:** tasks 1.7 and 1.8 added after research showed
the Art. 27 presumption is unavailable to everyone today; both now require
citation status to be modelled as data rather than hardcoded.

**New lessons:** L13–L20.

**Gate result:** G1 pass (all three apps) · G2 181 passed, 0 failed · G3 pass ·
G4 pass at baseline 13 · G5 pass at baseline 36 · G6 44 obligations live from
real declarations.

### L21 — "Fetched from EUR-Lex" is provenance, not correctness. Check for corrigenda.
The corpus was built from `OJ:L_202402847`, which serves the text **as originally
published on 20 November 2024**. It does not incorporate corrigenda, and there is
no consolidated version of this regulation. Corrigendum **OJ L, 2025/90555 of
2 July 2025** corrects Article 64(10) from "paragraphs 3 to 9" to "paragraphs
2 to 9" — widening the fine exemption to cover the EUR 15M / 2,5 % tier. The
corpus therefore carried superseded text for the single provision most cited to
the user, and the claim "stewards are exempt from fines outright" was only true
under the corrected wording.
Found because the user asked what guaranteed the source was correct. It would not
have been found by any gate: G5 checks that numbers resolve, not that the text is
current.
**Apply:** for every instrument, check the ELI corrigendum path
(`/eli/reg/<year>/<num>/corrigendum/<date>/oj/eng`) before trusting the base text,
and re-check when re-fetching. Corrections are applied by
`applyCorrigenda()` in the builder as verified substitutions that **fail the
build** if the `from` text is absent, and are recorded in the corpus provenance.

### L22 — Reproducibility is testable; test it rather than assert it
Re-fetching the OJ HTML 13 hours later produced a different sha256. The delta was
two WAF session tokens in a tracking script; the legal body was byte-identical
and the rebuilt corpus was identical. Worth knowing both facts: the *file* is not
byte-stable, the *content* is.
**Apply:** verify a cached source by rebuilding from a fresh fetch and diffing the
built artefacts, not by comparing file hashes.

---

### L23 — Read the paragraph, not the article
Three of Phase 1's defects were "right article, wrong paragraph": Art. 13(4) and
13(14) cited for retention (it is 13(13)), and the plan itself citing 13(12).
Article-level checking cannot see these. The citation gate now has a
paragraph-level rule for Art. 13 retention.
**Apply:** when a duty is paragraph-specific, cite and check the paragraph.

### L24 — One phrase, three duties: check the anchor, not the wording
Arts. 13(9), 13(13) and 13(18) all read "10 years or the support period,
whichever is longer", which invites one shared field. They run from different
dates, so one product owes three different end dates. Art. 23(2) reads similarly
again but has no support-period limb at all.
**Apply:** identical wording is not an identical rule. Compare the ANCHOR and the
LIMBS before reusing a function.

### L25 — An over-broad exemption hides more than it excuses
The citation gate skipped any line mentioning another instrument. That single
escape hatch concealed 26 real errors, because a line saying "NIS2" or "IEC" was
skipped wholesale. Standards bodies were the worst offenders — IEC/ETSI/ISO
documents have clauses, never Articles, so they can never be the referent of an
"Article N" citation.
**Apply:** scope an exemption as narrowly as its justification. Attribution is
per-citation and proximity-based, not per-line.

### L26 — The dangerous errors are the ones no scanner can see
persona-copilot-drawer.tsx mapped keywords to article NUMBERS and quoted the
matched article back as the authority: fines to 61, steward to 33, importer to
17 — each a real but unrelated article. Bare numerals, invisible to any citation
scanner, and the user sees a confident answer citing the wrong law.
**Apply:** grep for the numerals too, wherever a number selects a legal text.

### L27 — Never compute a deadline the law leaves to someone else
Art. 54(1) sets the corrective-action period as "as the market surveillance
authority may prescribe". There is no number to derive. A default would have
been invented law that eventually reassures someone who is late.
**Apply:** where the law defers to an actor, the value is an INPUT. Its absence
is a gap in the record, never a reason to substitute one.

### L28 — Pin the rule in tests, pin the facts in data
"No CRA harmonised standard has been cited" is true today and will not be
forever. Tests assert against a fixture register; the live register holds dated,
sourced records. A test asserting today's fact would fail the day the Commission
publishes — reporting a correct change in the world as a broken build.
**Apply:** tests pin behaviour; dated data holds facts about the world.

### L29 — "No events" is not "compliant"
Art. 14 with no incidents recorded is not met, and not breached — it has not been
engaged. Reporting "met" would tell a reader the organisation is discharging a
duty it has never been called on to discharge.
**Apply:** an empty record needs its own status. Absence of evidence is not
evidence of compliance.

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

## Phase 1 — Manufacturer (Art. 13, 14, 23, 27, 32, Ch. V) — completed 2026-08-15

**What worked:** Reading the article verbatim from the corpus BEFORE writing the
rule caught two defects in the plan itself (1.1's "block <5 years" criterion was
legally wrong; 1.2 cited Art. 13(12) for retention). Rule-as-pure-function then
wire-then-verify-both-directions held up: 7 of 8 task rule-modules passed their
tests on the first run, and the fix cap of 3 was never reached (worst case 2).

**What cost time:** The citation gate's escape hatch. Widening it surfaced 26
hidden errors that then had to be classified and burned down — but this was the
single highest-value hour of the phase, and it ended with the gate at zero.

**Surprises:** The most dangerous defects were not the ones the gates found. The
copilot drawer's keyword-to-article map returned real but unrelated articles as
legal authority, and no citation scanner would ever have seen it. Separately, the
Art. 14 clocks were already correct and track-aware — the gap was that nothing
fed them back into obligation status.

**Re-tuning applied to Phase 2:** Before implementing any deemed-manufacturer
rule, grep for bare numerals selecting legal text (L26), and diff Art. 21 against
Art. 22 anchor-by-anchor rather than assuming the shared "substantial
modification" wording means a shared rule (L24).

**New lessons:** L23-L29.
