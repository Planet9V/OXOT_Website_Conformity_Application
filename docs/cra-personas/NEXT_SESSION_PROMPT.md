# Next-session prompt

Paste the block below to open the next session (fresh or post-compaction). It
carries the working agreement in the prompt itself rather than only in a
document, because behavioural instructions land harder in the prompt than in a
file the model is told to read. The redundancy with `HANDOVER.md` is
deliberate. Last verified against the tree after Phase 9's G7 (2026-08-16).

---

Continue the OXOT CRA persona programme.

**Before anything else**, read `docs/cra-personas/HANDOVER.md` — the entry
point. It names the reading order (`DESIGN_five_shapes.md` **iteration 2
first**; then `task_plan.md`; then `lessons.md` L1–L50), the
nine-destination application map, every gate command including the
CI-mirror G2 recipe, and the traps. Trust it over any conversation
summary; trust the working tree over it.

**Where things stand:** Phases 0–9 are COMPLETE with G7 retros. Branch
`feat/phase-7-shell-redesign` = `main`, pushed. Every gate is at its
floor, and TWO floors are covenants: G1/G3 green · G2 = **0 test
failures** (CI-mirror: 712/0/2 skipped-with-reason) · **G4 honesty = 0 —
COVENANT** · G5 citations = 0 · **G8 UI-reach = 0 orphans — COVENANT**
(17 capabilities reached) · both corpus verifiers green · Dependabot = 0.
The nav holds exactly the nine destinations — the transitional More menu
is deleted; `/auditor-portal` is the permanent EXTERNAL notified-body
door, complete end-to-end (issue/revoke tokens + answer RFIs in the
product file). `scripts/generate_local_audio.py` may show as modified —
the user's own side-work; never stage it (explicit `git add` only, never
`git add -A`).

**Working agreement — governs every task, not just the first:**

1. **Read the statute before implementing** — from the corpus, verbatim,
   including the clock-anchor sentences (anchors differ per act: NIS2
   final report anchors on notification SUBMISSION, not awareness — L42).
2. **Verify before claiming.** Never report a fix, a push, a passing
   gate, or a vulnerability without running the command that proves it,
   and show the output. Defect reports and SUMMARY COUNTS are claims too
   — re-derive them from the gate at write time (L36; Phase 9 caught our
   own handover asserting a wrong finding location).
3. **Gates are the definition of done:** G1 typecheck · G2 = **ZERO
   failures** (CI-mirror recipe in HANDOVER.md) · G3 build · **G4 = 0 —
   covenant** · G5 = 0 · **G8 = 0 — covenant**: a new capability lands
   WITH its surface and registry entry in the same commit · both corpus
   verifiers · G6 live against `localhost:8088` with real persisted data
   and a **reviewed screenshot**. For any token/credential-gated surface,
   G6 must walk the WHOLE loop — "reached" is not "usable" (L49).
4. **Never raise a gate baseline.** Chain gate commands with `&&` (L45);
   scripted bulk edits must assert their effect (L48 — prefer the Edit
   tool, which errors on a non-match).
5. **Rules as pure functions first:** statute logic in
   `artifacts/api-server/src/lib/` with unit tests, then routes, then UI.
6. **One task, one commit, message records WHY.** Push branch AND main
   (fast-forward, never squash — the log is a deliverable).
7. **Tri-state discipline.** A FACT may be null (never defaulted); a
   ROUTE terminates somewhere safe and its name admits it is a default
   (L40). Provenance fields (actor, content, expiry) REFUSE when absent —
   a plausible default is a fabrication waiting to be recorded (L50).
8. **The application never concludes conformity** (Art. 32 / notified
   body). **Donor doctrine:** re-home real consumers before deleting
   (grep `/api` calls first — L43), redirect so bookmarks survive, and
   sweep the donor's RE-HOMED components for its fabricated defaults
   (L50).

**Halt and ask rather than guess when:** a new honesty or citation waiver
would be needed; the corpus does not settle a legal question; the same
approach has failed twice; or `git status`/`git log` shows an unexpected
change beyond the audio script.

**First task — the hygiene backlog.** W2.4 is COMPLETE: both national
transpositions are loaded verbatim with CI verifiers including D2
full-content parity (L51). Phase 9 and its remainder are all closed.
Unless the user names new scope, work the hygiene backlog in order:

1. **Portfolio schema hygiene** (recorded in 9.1): drop or re-point the
   orphaned demo tables (`cra_portfolio_products`, releases, customers,
   deployments) and fix `cra_product_documents.productId`, which the
   retired donor and the real registry keyed DIFFERENTLY (id-collision
   risk in the vault). Schema changes go through drizzle push-force and
   the one-shot images must be REBUILT before any parity run (L39).
2. Object-storage env for the 2 skipped tests.
3. Repo location (out of `~/Downloads`), branch naming, git identity.

Close any completed batch set with **G7**: update `lessons.md`, then
re-tune the next tasks before starting them.
