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

### L30 — A fabricated citation is easier to spot than a fabricated PREMISE
Phase 1 fixed 30 wrong article numbers. Phase 2 found something worse: a whole
feature built on a legal premise that does not exist. "Recital 34 Safe Harbor"
was not a mis-numbered citation — Recital 34 is real, and it is about a
manufacturer's due diligence over third-party components. The number resolved;
the proposition did not.
**Apply:** when a feature rests on one provision, read that provision in full and
ask what it is ABOUT, not just whether the number exists. G5 cannot catch this.

### L31 — Invented proxy questions are how a wizard launders a guess
The Art. 21 wizard asked four plausible engineering questions ("identical OEM
replacement part", "manufacturer-signed firmware", "performance envelope
maintained") and treated four yeses as a legal conclusion. None of them appears
in Art. 3(30), whose actual test is a change following placing on the market
that either affects Annex I Part I compliance or modifies the assessed intended
purpose.
**Apply:** ask the statutory question in the statute's own words. If a proxy is
genuinely needed, say it is a proxy and show the real test beside it.

### L32 — Tri-state or the blank field becomes a clearance
Every boolean in the old wizard defaulted to true. Unanswered read as
"compliant", so leaving a field alone produced a favourable determination. Every
fact input in Phase 2 is boolean|null and null is reported as unanswered.
**Apply:** in any compliance determination, unanswered is its own state and must
never collapse into the favourable value.

### L33 — The gate you widened is the one that had already failed you
claims-exemption-granted existed and did not fire on "is exempt from Article 20
Manufacturer obligations", because its pattern only knew "exemption granted" and
"legally exempt". The rule looked like coverage and was not.
**Apply:** when removing a fabricated claim, check whether the gate that should
have caught it actually matches the exact string, then widen it — and check the
widening does not force a waiver for a legitimate future statement.

### L34 — Build the registry for the branch that exists, not the three that might
W1.3 specified four registries: determinations, clocks, status derivers,
artifacts. Exactly one if/else had actually formed — `isArt14` in `orgProfile.ts`
— so exactly one registry was built. The other three would each have held a
single entry and taught the next reader that the codebase works a way it does
not.
**Apply:** a registry is justified by a branch that exists, not by a branch that
is forecast. When the plan asks for more than the code has grown into, build the
part that removes real duplication and write the omission down as a decision, in
the plan, with what would trigger it — otherwise "not built" is indistinguishable
from "forgotten".

### L35 — The citation gate reads the line, not the paragraph
The new module's comment said "the AI Act has serious-incident reporting" on one
line and "under Art. 73" on the next. Attribution is per-line, so Art. 73 was
checked against the CRA's 1..71 and flagged. The gate was right: nothing on that
line said which act it meant.
**Apply:** name the instrument on the same line as its article number. That is
also better prose — a reader scanning a comment has no more context than the
gate does.

---

## Phase 2 — Deemed manufacturer (Arts. 21 & 22) — completed 2026-08-15

**What worked:** Reading Arts. 21, 22 AND the Art. 3(30) definition before
touching code. The definition is where the whole test lives, and the old
implementation had clearly never been checked against it. Rule-as-pure-function
again paid: 17 rule tests, one fix cycle, and the integration tests then only had
to prove persistence and the transition.

**What cost time:** The frontend. The Art. 21 tab was ~200 lines of UI built
around a determination shape that no longer exists, and the partner hub carried
three fabricated customer plants wired into the same tab.

**Surprises:** The worst defect was not a wrong number — it was a feature resting
on a premise the regulation does not contain (L30). And the honesty gate rule
that should have caught the exemption claim existed but did not match it (L33).

**Re-tuning applied to Phase 3:** Art. 19 and Art. 20 have their own definitions
to read first (Art. 19 has 8 operative paragraphs, Art. 20 has 6) — read both in
full before splitting the persona, and check specifically whether the duty to
refrain differs between them, because the app currently conflates them. Expect
the same tri-state discipline (L32) for every verification question in 3.3.

**New lessons:** L30-L33.


### L36 — A defect report is a claim, and claims get verified at WRITE time
The handover named partner-hub's "TRANSMITTED TO CSIRT" as the highest-severity
live issue and the honesty gate as blind to it. Both statements had been false
for a day: commit 857e91a had already replaced the string with "DRAFT ONLY —
NOT SENT", and the gate had matched that class since the day it landed —
proven later by planting a violation and watching the gate fail. The report
was written from memory of the tree, not from the tree.
**Apply:** verify-before-claiming applies to defect REPORTS, not just fixes.
Before recording a defect in a handover, run the reproducing command against
the current tree, and record the commit hash you verified against.

### L37 — Hand-edited generated code survives until someone runs the generator
`openrouterApiKey` lived in the generated LlmConfig types and three real
consumers since b360c37 — but never in openapi.yaml. Someone had edited the
generated files directly, so the first codegen run in months silently deleted
the field; only diffing the regen output exposed it.
**Apply:** generated files are never edited by hand — the fix goes in the
spec. And when a codegen run touches files you did not expect, treat every
unexpected hunk as evidence of past hand-edits: reconcile the spec before
committing, or the next regen re-breaks it.

### L38 — Prove "no new failures" inside one environment, not across two
Local test runs show 28 files failing to collect (no DATABASE_URL) where CI
shows 31 individual failures — the counts are not comparable. The proof that
a change adds no failures is stash → run → pop → run: both sides in the same
environment, same command, minutes apart. Phase 6 used it three times; each
delta was exactly the new tests and nothing else.
**Apply:** never compare a local count against the CI baseline. Compare
pre-change and post-change in the environment you are standing in.

### L39 — A stale one-shot image resurrects the schema you just removed
The compose `migrate` one-shot bakes the schema at image-build time. Run it
after changing the schema but before rebuilding the image and it happily
re-applies the OLD schema — it would have re-added the plain_password column
minutes after the drop. Same trap for `seed`.
**Apply:** one-shot containers are code too. Rebuild them with the change,
run the parity check twice, and verify the state is stable across both runs.

### L40 — A fact may be unknown; a route must terminate
Two nullability regimes in one phase, and they are different on purpose. A
member's teamRole is a FACT: null until someone declares it, never defaulted
(tri-state, L32 — defaulting would assert what nobody said). An obligation's
defaultTeamRole is a ROUTE: total by design, falling through to the
coordinator, because a duty that appears in nobody's inbox is how a clock
gets missed — and its name says "default" so nobody reads workflow routing
as a statutory assignment.
**Apply:** classify each field as fact or route before choosing nullability.
Unknown facts stay null and render as unknown; routes always land somewhere
safe, and their names admit they are defaults.

---

## Phase 6 — Team role model — completed 2026-08-15

**What worked:** Data → routes → UI order, three times over. The stash-compare
proof (L38) made every G2 claim exact. G6 probes that exercise the full loop —
create member → log in as them → rotate password → old credential 401s — catch
what endpoint-shape checks cannot. Spec-first for /me meant orval did the type
plumbing across both client libs in one command.

**What cost time:** The session opened on a stale premise (L36) — the "first
task" was mostly already done, and the real work was correcting the record.
Codegen exposed month-old spec drift (L37) that had to be repaired mid-task.
Two self-inflicted verification wounds: piping gate output through `tail` cut
off the verdict line twice (an instance of L4 — filter the findings, never
the failure), and a `cd` persisting across shell calls sent two gates hunting
modules from the wrong directory.

**Surprises:** The highest-severity "live" issue in the handover was already
fixed. And the plaintext-password column turned out to have exactly one
consumer — an edit-dialog prefill that could only exist because of the leak.

**Re-tuning applied to Phase 7:** recorded in task_plan.md under Phase 7 —
7.2's branching inputs now exist and null teamRole must render the neutral
home (L40); the P2 evidence-request model plus its role scoping (deferred
from 6.3, with reason) is pinned to the task that builds the request flow;
every new Phase 7 endpoint consumed through the generated client goes into
openapi.yaml first (L37); partner-hub is a donor, not a deletion — stages
1–4 re-home into the product file, stage 5 into Incidents, wired to the real
engines at that point; and the steward UI moves onto the Art. 24 engine with
the older /steward route retired rather than kept alongside.

**New lessons:** L36–L40.

### L41 — A citation gate that checks existence cannot catch the wrong article
Three instances in one phase: nav labels carried proposal-era numbers
("Open-Source Steward (Art. 33)" — Art. 24 in the adopted text), the command
center linked "Standards Matrix (Art. 34)" (mutual recognition agreements, not
the presumption), and a nearly-shipped inline cite would have opened CRA
Art. 14's text under a "NIS2 Art. 23(4)(d)" label. All resolve against the
corpus; all are wrong. The gate checks that a cited article EXISTS, not that
it is the RIGHT one.
**Apply:** verify the article's TITLE against the corpus before writing any
UI label that carries a number, and never let a point-of-use affordance dress
one act's text in another act's label — no flyout is better than a lookalike.

### L42 — Clock anchors differ between acts; read each one verbatim
CRA Art. 14's final report runs from the availability of a corrective
measure. NIS2 Art. 23(4)(d)'s final report runs from THE SUBMISSION OF THE
INCIDENT NOTIFICATION — so before that submission it has no deadline at all,
and a model that set it at creation (as the CRA one correctly does for its
own anchors) would have been wrong in the dangerous direction, showing a
deadline further away than the real one could be.
**Apply:** statutory clocks are per-act, per-stage, per-anchor. Never copy a
clock structure across acts; read the anchor sentence verbatim first, and let
"not yet running" be a rendered state.

### L43 — A donor page retires only after its last real consumer is re-homed
partner-hub looked ready to delete after its claims were fixed — but it was
the ONLY caller of the deemed-manufacturer engine. Deleting it first would
have orphaned a statute-grounded, unit-tested capability the same day the
orphan gate reached zero. The grep of the donor's /api calls, done before
deletion, is what caught it.
**Apply:** before deleting any page, list its API calls and re-home every
endpoint that has no other caller. The redirect is the last step, not the
first.

### L44 — At zero, the orphan gate changes meaning: from debt record to covenant
While the baseline was 6, G8 measured burn-down. At 0 it became a different
rule: a new capability lands WITH its surface and its registry entry in the
same commit, or the build fails. Both capabilities added after zero
(evidence requests, entity incidents) shipped that way, and the gate's
comment now says so.
**Apply:** when a ratcheted baseline reaches zero, rewrite the gate's comment
from "do not raise" to the covenant the zero now enforces — the number stops
being history and starts being law.

---

## Phase 7 — Shell redesign — completed 2026-08-16

**What worked:** The donor doctrine end-to-end — every page that died gave
its organs first, and the "More (being re-homed)" menu emptied honestly
batch by batch. Engine-first order (corpus → lib+tests → routes → surface →
G6 live) held for every batch and caught the Art. 23(4)(d) anchor before any
code assumed the wrong one. The batch cadence (one destination or one loop
per commit, all gates each time, Playwright G6 with screenshots reviewed)
meant no batch ever had to be reopened.

**What cost time:** Docker rebuilds under amd64 emulation dominated wall
time (~10–15 min per batch). Two G6 scripts initially asserted the wrong
thing (raw column names vs the engine's resolved shape; exact-match against
decorated chip text) — script bugs, not code bugs, but each cost a cycle.
The nav/search collision at 1440px was invisible to every assertion and
found only in the screenshot (L4's cousin: review the pixels, not just the
counts). The login rate limiter throttled repeated test logins — correctly —
and was reset by container restart, never weakened.

**Surprises:** The versions engine had existed for days with no write-path —
the file reported a gap no user could close. The standards matrix's real
content had ALREADY been re-homed (the wizard's StandardsEditor) before the
phase began. The psirt page — the Incidents donor — made zero API calls.

**Re-tuning applied (what Phase 8 should be):** the deferrals that expired
with this phase, in value order: (1) **issue #62** — DONE 8.1; (2) **PSIRT
toolkit absorption** into Incidents — DONE 8.2; (3) a **real CE stage** — DONE 8.3; (4) the **NIS2 full-text reader** — DONE
8.4 (W2.4 transposition CONTENT remains queued: loading national measures
needs sourced verbatim texts — the Legal circuit-breaker forbids
reconstructing them from memory; the reader states the gap); (5) the 15
Dependabot findings. The More menu should be EMPTY by the end of Phase 8,
and the transitional-menu code deleted with it.

**New lessons:** L41–L44.

### L45 — A gate chained with ';' is not a gate
The 8.4 commit shipped with G5 RED: the gate commands were separated by
';' so the citation failure did not stop the `git commit` that followed in
the same shell line. The failure itself was benign (verbatim TFEU citations
in the new NIS2 bundle misattributed to the CRA), but the process hole was
not — the definition of done executed and then was ignored.
**Apply:** anything that must gate a commit is chained with `&&` (or its
exit code is checked) so red stops the line. A gate whose failure cannot
prevent the next command is advisory, and advisory gates rot.

### L46 — Re-verification catches the neighbours, not just the change
The dependency bumps broke nothing — but re-running the FULL suite on the
new lockfile exposed a latent flake that had passed by luck: a suite that
scavenged whatever assessment its siblings left behind, green or red
depending on who cleaned up. The same pattern all phase: every wide
re-verification surfaced something adjacent (parallel races in 8.1, the
scavenged fixture in 8.5).
**Apply:** treat every full-suite run as a chance to catch order- and
leftover-dependence. A fixture a test did not create is a fixture it does
not own; suites create their own data and delete it after.

### L47 — Wait on the process, not on a status heuristic
Twice in one night a "container restarted" wait matched the PREVIOUS
build's restart ("Up About a minute") while the current image was still
building — and a G6 then asserted against a stale bundle, reporting
failures that were not in the code. The completion signal that cannot lie
is the build process itself (its PID, or the harness notification), never
a status string that a neighbouring event can satisfy.
**Apply:** gate follow-on verification on the thing you started
finishing — wait for the exact process/notification — and treat "the check
failed but the code looks right" as a prompt to check WHICH build you are
testing.

---

## Phase 8 — Hardening — completed 2026-08-16

**What worked:** Reproducing CI exactly (throwaway pgvector + the ci.yml
env) turned "31 known failures" from folklore into four named diseases in
one afternoon. Range-scoped dependency overrides patched all 15 advisories
without touching unaffected majors. The corpus pipeline generalised to a
second act with one small script because the CRA pipeline was built
reproducible from the start.

**What cost time:** The stale-container wait (L47, twice). The gate chain
hole (L45). Playwright assertions against decorated text (again — L38's
cousin).

**Surprises:** The "dominated by 401s" issue description was itself stale —
only ONE suite was genuinely missing auth. The advisory publish
completeness gate refused the G6 probe and thereby exposed that the new
dialog could not author a publishable advisory at all (no product field) —
a gate catching a UI gap the same hour the UI shipped.

**Honest remainder (next phase's opening state):** the More menu is NOT
empty — product-portfolio (→ Products, the last 7.3 absorption), reports
(→ Home/product file), flows, and auditor-portal (arguably a permanent
separate track, not transitional) remain. W2.4 transposition CONTENT needs
sourced national texts (Legal circuit-breaker). Dependabot alerts close
asynchronously after GitHub re-scans the pushed lockfile. G4's 7 remaining
findings live in oxot-web marketing surfaces outside this app.

**New lessons:** L45–L47.

### L48 — A scripted edit without an assert silently no-ops
**Seen:** 2026-08-16, verifying facts for the handover rewrite. The 7.5b
batch had "updated" ci.yml's G8 baseline from 4 to 0 with a python
`str.replace` — which matched nothing, changed nothing, and reported
nothing. Local gate runs used `--baseline 0` throughout, so every check
passed while CI silently kept the looser floor for three batches. Caught
only because the handover rewrite re-verified every claim against the
tree before writing it down (L36 doing its job at a distance).
**Apply:** any scripted bulk edit must assert its effect — check
`replaced != original` (or grep the file afterwards) and fail loudly on
zero replacements. Prefer the Edit tool, which errors on a non-match,
over ad-hoc `.replace` scripts.

## Phase 9 — Absorption close-out — completed 2026-08-16

**What worked:** The survey-before-scope discipline paid for itself four
times in one day. 9.1's grep-first (L43) showed the portfolio donor's four
tabs were already served by real engines except import — so the batch built
one small honest capability instead of porting 1,700 lines of demo
scaffolding. 9.3's survey turned "move auditor-portal deliberately" into
the discovery that the track was HALF-built (a door with no key), which
became 9.3b — an end-to-end capability proven by one G6 script that walks
issue → portal → RFI → answer → revoke against the live stack. Driving two
gates to covenant floors (G8 in Phase 7, G4 here) means every future claim
regression fails the build, not a review.

**What cost time:** Almost nothing was lost to rework; the one G6 red was
the script's own fault (the trust-center hash line lives under a tab the
script never clicked). The amd64-emulated container rebuilds (~8–10 min
each, five of them) dominated wall-clock; overlapping them with CI-mirror
G2 runs kept the day moving.

**Surprises:** The handover's own summary said "all 7 honesty findings in
oxot-web marketing" — the gate said otherwise (two in the conformity SPA,
two in api-server). The gate output, not the summary, was the truth (L36
again, this time against our own document). And the worst finding of the
seven was public-facing: a provenance page showing auditors the SHA-256 of
the empty string as a "Cryptographic Provenance Hash".

**Re-tuning applied to the remainder:** 9.4 (W2.4 transposition content)
stays BLOCKED on sourced verbatim NL/DE texts — the next session should ask
for them rather than build around the gap. The named hygiene backlog, in
order: (1) the orphaned portfolio demo tables (`cra_portfolio_products`,
releases, customers, deployments) and the shared
`cra_product_documents.productId` that two registries keyed differently —
drop or re-point now that only the vault survives; (2) object-storage env
for the 2 skipped tests; (3) repo out of ~/Downloads; (4) git identity
config. No new phase is opened until the user chooses among these or names
new scope.

**New lessons:** L49–L50.

**Addendum — same day, after this retro closed.** The "9.4 stays BLOCKED"
line above was overtaken within hours: the user asked for a web search, the
authentic sources were located (the Cbw had entered into force the day
before), and W2.4 completed as 9.4a (NL, promulgated Staatsblad XML) and
9.4b (DE, consolidated gii XML — the source-strategy fork decided on
evidence with the user: the promulgation is a PDF-only Artikelgesetz and
the BSIG was already amended). A user-requested error check then produced
the full-content parity audit, which found 8 flattener-added characters in
Cbw Artt. 99–100 that every existing gate had passed; the audit became
check D2 in both transposition verifiers, negative-controlled. New lesson:
L51. Commits `b2bfb97` → `2970b4b`.

### L49 — "Reached" is not "usable": reachability gates cannot see a missing write path
**Seen:** 2026-08-16, task 9.3. The auditor portal referenced its API paths,
so any path-scan would call the capability covered — yet NOTHING in the
system could ever insert the token the portal requires, so no user could
reach it in practice. G8 checks that a screen calls the path; it cannot
check that the loop closes.
**Apply:** when surveying any credential/token/invite-gated surface, grep
for the ISSUANCE write (`insert(<accessTable>)`) — not just the validation
read. A gate on references proves wiring, never usability; the closable
loop must be proven by an end-to-end test (the 9.3b suite and G6 script are
the template).

### L50 — A retired donor's fabrications survive in its re-homed components
**Seen:** 2026-08-16, task 9.1. The donor page was deleted, but the vault
modal it spawned — already re-homed into product-detail — still pre-filled
"Marcus Vance (Security Lead)" as the provenance actor, and its server half
would hash INVENTED placeholder text as if it were the uploaded file. The
donor died; its fabrications had already emigrated.
**Apply:** retiring a donor includes sweeping the components it left behind
in shared folders for its defaults — every `|| "<plausible value>"` on an
actor, a date, or file content is a fabrication waiting to be recorded as
fact. Provenance fields refuse when absent; they never default.

### L51 — Spot probes pass while the flattener edits the law; only full parity catches it
**Seen:** 2026-08-16, the user asked for an error check on the freshly built
Cbw/BSIG corpora. All four verbatim spot probes passed, every gate was
green — and a full-content audit still found the Cbw flattener printing
amendment markers as "A." where the Staatsblad prints bare "A": eight
characters added to the law across Artt. 99–100, invisible to every
existing check because no probe crossed that code path.
**Apply:** for any verbatim-reproduction pipeline, spot probes are a smoke
test, not a proof. The proof is full-content parity — every unit's
character stream compared against its source region, whitespace-normalized
— promoted into the CI verifier (D2 in verify_cbw/bsig), with a NEGATIVE
CONTROL run once to show a single flipped character fails it. A checker
that has never been seen to fail has proven nothing (the corpus verifiers'
own positive-control doctrine, applied to text instead of paths).

### L52 — A gate piped through tail launders its exit code
**Seen:** 2026-08-16, task 10.4's commit gate. The 10.3 gate chain ran
`check_honesty.mjs 2>&1 | tail -1 && …` — in zsh a pipeline's status is the
LAST command's, so tail's 0 let the chain print ALL-STATIC-GATES-OK over a
RED honesty gate, and 10.3 shipped claiming G4 = 0 while CI would fail it.
The four real findings underneath: the new corpus bundles carry the law's
own words ("vibrations transmitted to the seat") that trip English
claim-regexes — bundles belong in the honesty SKIP exactly as they are in
the citation gate's — and a NEGATED honesty sentence ("never concludes …
is compliant with it") still matches a positive-claim regex.
**Apply:** never pipe a gate's output when its exit code is the signal —
run it bare (silence with >/dev/null, which preserves status), or set
pipefail. L45 said chain with `&&`; this adds: make sure the thing being
chained is the GATE, not a pipe wrapped around it. And corpus bundles are
excluded from EVERY content gate, not just the one that already learned it.

## Phase 10 — Portable evidence, user notification, five-act reference — completed 2026-08-16

**What worked:** The batch cadence held across four very different tasks in
one continuous run. The seam pattern (10.1) delivered a storage backend
switch with a PROVABLE no-regression property — a unit test enumerating the
exact Replit env shapes — and the suite reached zero skips for the first
time. Statute-first (10.2) turned the donor's customer-register idea into
an honest Art. 14(8) register whose derivation states its own rule on the
wire. The discovery-mode/pinned-structure pattern (10.3) made three corpora
land in one sitting with both heuristics agreeing before anything was
trusted; the parameterized builder/verifier/sync trio kept it at three thin
configs instead of nine scripts.

**What cost time:** Only real defects. Each G6 first-run failure was a
finding, not friction: the vault's EACCES (H1's class), the label
association gap, the Anlagen id breakage in the OJ's own HTML, the
strict-mode locator collisions.

**Surprises, all caught by our own gates:** (1) the shared parser's roman
table stopped at VIII — the SHIPPED NIS2 corpus had its Chapter IX articles
misassigned since 8.4, exposed only when the AI Act needed chapters IX–XIII;
(2) the Machinery Regulation's OJ HTML ships BROKEN annex anchors (ANNEX IX
reuses anx_I) — trusting document ids without an independent count would
have served the wrong annex while looking successful; (3) the 10.3 gate
chain itself was unsound — a pipe laundered a red G4 into a pass (L52), and
the "failing" findings were the LAW'S OWN WORDS tripping claim-regexes,
which is why corpus bundles are excluded from every content gate.

**Re-tuning applied:** 10.3c (obligation seeding + deriver registration for
AI Act/Machinery/RED) is the named next phase when the user prioritises it —
statute-reading work with the five-act citation gate now live to hold it.
The L51 full-content-parity hardening for the five OJ corpora (CRA, NIS2,
AI Act, Machinery, RED) remains open — the transposition corpora have D2;
the OJ family still relies on pinned structure + probes. Candidate scope
alongside: portable-storage file GC, and the RED delegated-acts cyber
requirements (Art. 3(3)(d)/(e)/(f)) as the natural CRA-adjacent content.

**New lessons:** L52 (and L51 landed mid-phase from the parity audit).

## L53 — A flattened corpus can be verbatim and still lose the address

**Seen:** 11.3. The machinery annex corpus carries Annex III's text
faithfully, but the flattened blocks drop the SECTION NUMBERING — there is
no "1.1.9." heading anywhere in the bundle. The Phase-0 seed had attributed
the software-protection and intervention-evidence duties to
"Annex III 1.2.1(a)/(b)" and the update duty to "(c)"; the statute puts
them in 1.1.9, 1.2.1(d) and 1.2.1(f), and the real (a)–(c) say something
else. The DoC row cited Annex II — the indicative list of SAFETY
COMPONENTS. Every one of those wrong addresses passed every automated gate,
because a refCode is not a citation the G5 regex sees (L41's cousin: a
wrong-but-existing SECTION reference is even harder to catch than a wrong
article, because sections live below the corpus's structural pins).
**Apply:** when seeding or labelling against an ANNEX, verify the section
number against the committed OJ source (`docs/*_statutory_corpus/source/`),
not the flattened bundle — the bundle proves the words, the source proves
the address. And treat any pre-corpus seed row as unverified until read
against the statute; three acts in, every act's Phase-0 seed contained
defects (AI Act titles/deadlines, machinery addresses).

## Phase 11 — Obligation content for the AI Act, Machinery Regulation and RED — completed 2026-08-16

**What worked:** The engine needed ZERO changes — obligations =
requirements(declared regs) × declared roles held for three new acts
exactly as D10 promised, and "adding an act" was pure content work plus one
vocabulary entry (operator → 'deployer'). Statute-first per row was cheap
because the corpora are local JSON: every row's article was read verbatim
before its row was written, and that reading is what found the defects.
The orgObligations test suite (the endpoint's first) now pins the engine
equation, each act's vocabulary, and the corrected machinery addresses.

**What the reading found:** the Phase-0 seeds were a defect inventory —
three misnumbered machinery rows plus a DoC pointing at the
safety-components annex (L53); an AI Act title from the wrong draft,
a vague Art 73 with no deadlines, and an attack list the statute states
precisely. RED had NOTHING — a declarable act serving silent zero, which
became 11.4's endpoint-honesty fix: declared-but-unseeded acts are now
NAMED on the wire and in the cockpit ("Zero here means un-modelled, not
compliant" — GDPR is the live example today).

**Deriver half:** resolved as a documented refusal — no candidate has real
data to read (AI Act incidents fit neither existing incident shape; DoC
ledgers are CRA-only). The registry header now names what must exist first.

**Re-tuning applied:** the remaining open candidates are unchanged in
priority: (1) L51 D2-parity hardening for the five OJ corpora; (2) RED
Art. 3(3) delegated-acts content (Delegated Regulation (EU) 2022/30 —
needs its own authentic source, Legal circuit-breaker applies); (3)
storage file GC; (4) user-only repo move. New candidate surfaced by 11.4:
obligation content for the still-unseeded acts (GDPR/DORA/CER/GPSR/Data
Act) if and when a customer declaration needs them — the cockpit note now
marks that gap honestly, so it is a choice, not a silence.

**New lessons:** L53.

## L54 — A reproducible build reproduces its own blindness

**Seen:** 12.1. The CI reproducibility diff (builder(source) == corpus,
byte-for-byte) had been green for every OJ corpus since each was born —
while NIS2's annexes were missing their entire "Type of entity" column,
every annex had lost its Part/Class/Section subdivision headings, and two
corpora carried page-furniture (the OJ footer; the Parliament statement)
as statutory content. Reproducibility verifies the TRANSFORM is stable; it
says nothing about whether the transform kept the content. A parser that
drops an element reproduces the loss identically every build — a check
that cannot fail on the failure mode that matters.
**Apply:** for any verbatim pipeline, pair reproducibility with FULL-
CONTENT PARITY through an INDEPENDENT flattening of the same source
(D2, negative-controlled — L51), and make the independent path as dumb as
possible (strip everything, compare characters): the less it shares with
the builder, the less their blindness can overlap. The exclusions the two
paths do share (footnotes, headings-by-structure, footer) must be named
definitions, not accidents of what the extractor happens to recognise.

## Phase 12 — L51 D2 parity for the OJ family — completed 2026-08-16

**What worked:** probe-before-build. A scratch probe measured the real
divergence per act BEFORE any code changed, which turned "harden the
verifiers" into a precise defect list: nested-table truncation, grseq
heading loss, footer/statement leakage, one footnote leak — each fixed at
the shared-parser choke point, then proven by the very check that found
it. The Cbw D2 pattern (shared low-level parse, independent flatten,
normalized character equality, negative control) transferred to HTML
without redesign. The corrigendum machinery paid off: the checker applies
declared corrigenda from corpus metadata and FAILS if they stop firing.

**What the check found:** four classes of loss shipped in every OJ corpus
(L54). The NIS2 entity column is the material one — Annexes I/II define
WHO is in scope, and the corpus said only which sectors. All corpora
rebuilt from committed sources; readers re-verified live.

**Re-tuning applied:** open candidates now: (1) RED Art. 3(3) delegated
acts (Delegated Regulation (EU) 2022/30 — authentic source first);
(2) storage file GC; (3) obligation content for still-unseeded acts when
a declaration needs it; (4) user-only repo move. Also worth a small
batch: fold the ad-hoc NIS2-annex live check into a repeatable
verify_nis2_reader script (the reader had no G6 script of its own).

**New lessons:** L54.
