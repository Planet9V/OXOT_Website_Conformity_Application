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
`task_plan.md`; then `lessons.md`), the nine-destination WORKBENCH map, the
**public marketing app (`artifacts/oxot-web`) section** (routing, the
locale/token conventions, and the four-touch checklist for adding a funnel
page + its crawler meta), all ELEVEN statutory corpora and their verifiers,
every gate command including the CI-mirror G2 recipe, and the traps. Trust
it over any conversation summary; trust the working tree over it.

**Where things stand:** Phases 0–30 are COMPLETE with G7 retros (Phase 28
skipped by choice). The recent arc was the PUBLIC WEBSITE: 20–23 the
operator shape + supplier door + its security review; 24 deployment
reconcile + the CRA Transit page; 25–27 the bilingual product tour + visual
diagrams; 29 the revenue pages (/product proof band, new /manufacturers,
honest /compare); 30 crawler dynamic rendering (per-route meta + JSON-LD
via `/api/seo/render` + an nginx crawler map — the ranking unlock). The
engine still models NINE acts (156 obligations) on ELEVEN corpora and
**never concludes conformity**. **DORA and CER are PARKED.** MAIN-ONLY,
pushed, GitHub CI green (last: `3ea4a7e`). Floors: G2 = ZERO fail / ZERO
skip (~770, CI is authority) · G4 = 0 COVENANT · G5 = 0 across EIGHT
enforced acts · G8 = 0 COVENANT (**27**) · ELEVEN corpus verifiers + the
lifecycle guard, all with negative controls.

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
   surface and registry entry in the same commit) · all eight corpus
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

**No task is in flight.** DORA/CER stay parked. Open candidates (ask
which, or take one if told to proceed):

1. **Phase 30b (optional):** full-body SSG (`renderToString`) for the
   funnel routes — JS-less body indexing + Core Web Vitals, on top of the
   Phase-30 per-route meta.
2. **Railway:** activate the crawler block in
   `docker/nginx.railway.conf.template` (annotated, not activated) and
   verify the production deploy is current.
3. **Phase 28 (deferred):** IA consolidation — merge /resources +
   /knowledge + /news, promote /trust + /security, add redirects.
4. Podcast narration date audit before regeneration (user-flagged).
5. Native-Dutch review of nl marketing strings.
6. Door hardening backlog (non-blocking): AV scan of uploads; orphan
   sweeper; wire the dormant ACL layer; admin media path validation.
7. **User-only:** move the repo out of `~/Downloads`, then re-run
   `scripts/ops/install_lifecycle_launchagent.sh`.

(The door-upload security review is DONE — Phase 23, register at
docs/security/door-upload-review-2026-08.md; signed off for GA.)

Batch cadence for everything: survey → scope one shippable batch → build →
all gates (bare) → G6 with reviewed screenshots → plan done-marker →
commit → push. Close any completed batch set with **G7**: update
`lessons.md`, then re-tune the next tasks before starting them.
