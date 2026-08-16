# Next-session prompt

Paste the block below to open the next session (fresh or post-compaction). It
carries the working agreement in the prompt itself rather than only in a
document, because behavioural instructions land harder in the prompt than in a
file the model is told to read. The redundancy with `HANDOVER.md` is
deliberate. Last verified against the tree at `43ad70f` (2026-08-16).

---

Continue the OXOT CRA persona programme.

**Before anything else**, read `docs/cra-personas/HANDOVER.md` — the entry
point, rewritten and verified claim-by-claim against the tree at `43ad70f`.
It names the reading order (`DESIGN_five_shapes.md` **iteration 2 first** —
the final section supersedes the 33→8 plan; then `task_plan.md`; then
`lessons.md` L1–L48), the nine-destination application map, every gate
command including the CI-mirror G2 recipe, and the traps. Trust it over any
conversation summary; trust the working tree over it.

**Where things stand:** Phases 0–8 are COMPLETE with G7 retros. Branch
`feat/phase-7-shell-redesign` = `main` = `43ad70f`, pushed. Every gate is at
its floor: G1/G3 green · G2 = **0 test failures** (CI-mirror: 702/0/2
skipped-with-reason) · G4 honesty = 7 (all in oxot-web marketing) · G5
citations = 0 · G8 UI-reach = **0 orphans as a COVENANT** · both corpus
verifiers green · Dependabot = 0 open. `scripts/generate_local_audio.py`
may show as modified — that is the user's own side-work; never stage it
(explicit `git add` only, never `git add -A`).

**Working agreement — governs every task, not just the first:**

1. **Read the statute before implementing** — from the corpus, verbatim,
   including the clock-anchor sentences (anchors differ per act: NIS2 final
   report anchors on notification SUBMISSION, not awareness — L42).
2. **Verify before claiming.** Never report a fix, a push, a passing gate,
   or a vulnerability without running the command that proves it, and show
   the output. Defect reports are claims too — verify them at write time.
3. **Gates are the definition of done:** G1 typecheck · G2 = **ZERO
   failures** (CI-mirror recipe in HANDOVER.md) · G3 build · G4 honesty
   (baseline 7) · G5 citations (0) · G8 UI reach (**0 — covenant**: a new
   capability lands WITH its surface and its registry entry in the same
   commit) · both corpus verifiers · G6 live against `localhost:8088` with
   real persisted data and a **reviewed screenshot**.
4. **Never raise a gate baseline.** Chain gate commands with `&&` so red
   stops the commit (L45); scripted bulk edits must assert their effect —
   a bare `.replace` no-ops silently (L48).
5. **Rules as pure functions first:** statute logic in
   `artifacts/api-server/src/lib/` with unit tests, then routes, then UI —
   never the reverse.
6. **One task, one commit, message records WHY.** Push branch AND main
   (fast-forward, never squash — the log is a deliverable).
7. **Tri-state discipline.** Unanswered is never false and never renders
   compliant. A FACT may be null (never defaulted); a ROUTE terminates
   somewhere safe and its name admits it is a default (L40).
8. **The application never concludes conformity** (Art. 32 / notified
   body). **Donor doctrine:** unwired surfaces are donors awaiting re-home,
   never "fake"; a donor is deleted only after its last real engine
   consumer is re-homed (grep its `/api` calls FIRST — L43), then routes
   redirect so bookmarks survive.

**Halt and ask rather than guess when:** a new honesty or citation waiver
would be needed; the corpus does not settle a legal question (W2.4 national
texts wait for sourced verbatim — never reconstruct law from memory); the
same approach has failed twice; or `git status`/`git log` shows an
unexpected change beyond the audio script.

**First task — the remaining absorptions, in order** (use /executing-plans
and /loki-mode; batch cadence: survey → scope → build → all gates → G6 →
done-marker → commit → push both):

1. **Absorb `product-portfolio` into Products** — the last 7.3 donor
   (fleet/import features). Grep its `/api` calls first, re-home every real
   consumer, then delete + redirect.
2. **Re-home `reports`** (→ Home / product file) and **`flows`**.
3. **Decide `auditor-portal`** — likely a permanent notified-body track,
   not transitional; move it deliberately, then DELETE the More menu and
   its TRANSITIONAL code in `layout.tsx`.
4. **W2.4 transposition content** — BLOCKED until sourced national texts
   are provided; the NIS2 reader banner states the gap honestly.
5. **Drive G4 7 → 0** — all findings live in `artifacts/oxot-web`
   marketing surfaces (paths listed in HANDOVER.md).

Close the phase with **G7**: update `lessons.md`, then re-tune the next
phase's tasks before starting it.
