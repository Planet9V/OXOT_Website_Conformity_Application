# Next-session prompt

Paste the block below to open the next session (fresh or post-compaction). It
carries the working agreement in the prompt itself rather than only in a
document, because behavioural instructions land harder in the prompt than in a
file the model is told to read. The redundancy with `HANDOVER.md` is
deliberate. Last verified against the tree after Phase 11 closed (2026-08-16,
night; see `git log` for the head — every batch pushed to main gated).

---

Continue the OXOT CRA persona programme.

**Before anything else**, read `docs/cra-personas/HANDOVER.md` — the entry
point, verified claim-by-claim against the working tree. It names the
reading order (`DESIGN_five_shapes.md` **iteration 2 first**; then
`task_plan.md`; then `lessons.md` L1–L54), the nine-destination application
map, all SEVEN statutory corpora and their verifiers, every gate command
including the CI-mirror G2 recipe, and the traps. Trust it over any
conversation summary; trust the working tree over it.

**Where things stand:** Phases 0–12 are COMPLETE with G7 retros (Phase 11
= 10.3c obligation content ×3 acts; Phase 12 = D2 full-content parity for
the five OJ corpora, which exposed and fixed four shipped extraction
losses — L54: reproducibility reproduces the builder's own blindness);
the hygiene backlog (H1–H3) is done; development is MAIN-ONLY, pushed,
**GitHub CI green**. Every gate is at its
floor, two as covenants: G1/G3 green · G2 = **723 passed / 0 failed /
0 SKIPPED** (CI-mirror needs `OBJECT_STORAGE_BACKEND=local` +
`OBJECT_STORAGE_DIR=<tmpdir>` in its env) · **G4 honesty = 0 — COVENANT** ·
G5 citations = 0 across FIVE acts (cra 1..71, nis2 1..46, ai_act 1..113,
machinery 1..54, red 1..52) · **G8 UI-reach = 0 — COVENANT** (20
capabilities) · all SEVEN corpus verifiers green (CRA, NIS2, Cbw, BSIG,
AI Act, Machinery, RED), every one now carrying D2 full-content parity
WITH a negative control, plus byte-for-byte reproducibility in CI ·
Dependabot = 0. File evidence runs on the portable storage backend
(volume-backed locally; the Replit sidecar path provably unchanged).
`scripts/generate_local_audio.py` may show as modified — the user's own
side-work; never stage it (explicit `git add` only, never `git add -A`).

**Working agreement — governs every task, not just the first:**

1. **Read the statute before implementing** — from the corpus, verbatim,
   including the clock-anchor sentences (anchors differ per act AND per
   transposition — L42; the Cbw and BSIG carry their own 24h/72h clocks).
2. **Verify before claiming.** Never report a fix, a push, a passing
   gate, or a vulnerability without running the command that proves it,
   and show the output. Defect reports and SUMMARY COUNTS are claims too —
   re-derive them from the gate at write time (L36).
3. **Gates are the definition of done:** G1 typecheck · G2 = **ZERO
   failures, zero skips** · G3 build · **G4 = 0 — covenant** · G5 = 0
   five-act · **G8 = 0 — covenant** (a new capability lands WITH its
   surface and registry entry in the same commit) · all seven corpus
   verifiers · G6 live against `localhost:8088` with real persisted data
   and a **reviewed screenshot**; token/credential-gated surfaces walk the
   WHOLE loop — "reached" is not "usable" (L49).
4. **Never raise a gate baseline, and run gates BARE** — a gate piped
   through `tail` returns the pipe's exit code, not the gate's, and one
   red G4 shipped exactly that way (L52). Chain with `&&` (L45); silence
   with `>/dev/null`, which preserves status. Scripted bulk edits assert
   their effect (L48). For verbatim pipelines, spot probes are smoke
   tests — full-content parity with a negative control is proof (L51).
5. **Rules as pure functions first:** statute logic in
   `artifacts/api-server/src/lib/` with unit tests, then routes, then UI.
6. **One task, one commit, message records WHY.** Push `main`
   (fast-forward, never squash — the log is a deliverable).
7. **Tri-state discipline.** A FACT may be null (never defaulted); a
   ROUTE terminates somewhere safe and its name admits it is a default
   (L40). Provenance fields (actor, content, expiry) REFUSE when absent
   (L50). Statutory text is verbatim or absent — never paraphrased, never
   translated, never reconstructed from memory; corpus bundles are
   excluded from every content gate because they ARE the law (L52).
8. **The application never concludes conformity** (Art. 32 / notified
   body). **Donor doctrine:** re-home real consumers before deleting
   (grep `/api` calls first — L43), redirect so bookmarks survive, and
   sweep re-homed components for the donor's fabricated defaults (L50).

**Halt and ask rather than guess when:** a new honesty or citation waiver
would be needed; the corpus does not settle a legal question; the same
approach has failed twice; or `git status`/`git log` shows an unexpected
change beyond the audio script.

**No task is in flight.** The open candidates, for the user to prioritise
(ask which, or take #1 if told to proceed):

1. **RED Art. 3(3)(d)/(e)/(f) delegated-acts cyber requirements** —
   Delegated Regulation (EU) 2022/30 as its own authentic committed
   source (locate the OJ text FIRST — Legal circuit-breaker).
2. Small: storage file GC (evidence-row deletion does not remove stored
   files; inherited from the GCS backend, stated in 10.1).
3. **Obligation content for the still-unseeded acts** (GDPR, DORA, CER,
   GPSR, Data Act) when a customer declaration needs them — the 11.4
   cockpit note marks the gap honestly meanwhile.
4. Small: a repeatable `verify_nis2_reader` G6 script (the Phase-12
   annex check was ad-hoc; the NIS2 reader has no script of its own).
5. **User-only, between sessions:** move the repo out of `~/Downloads`.

Batch cadence for everything: survey → scope one shippable batch → build →
all gates (bare) → G6 with reviewed screenshots → plan done-marker →
commit → push. Close any completed batch set with **G7**: update
`lessons.md`, then re-tune the next tasks before starting them.
