# Handover — start here

Entry point for a fresh session picking up the CRA persona programme.
Everything below is verifiable; if a claim here contradicts the working tree,
**the working tree wins** and this file is wrong.

## Where the work is

- Branch `fix/honesty-pass-remove-fabricated-statutory-claims` — the name is
  historical and no longer describes the contents. `main` is level with it.
- Restore point: tag **`v0.5-personas-multi-act`**. Immutable, on GitHub,
  survives branch deletion.
- The stack runs at **localhost:8088** via `docker compose`. Develop against the
  running stack, not an ad-hoc server.

## Read these three, in this order

1. **`DESIGN_five_shapes.md`** — read *iteration 2* first (the last section). It
   supersedes the `33 → 8` plan, which was written before NIS2, Phases 3–5 and
   W1.3 and does not survive them. Decisions D10–D13 are binding.
2. **`task_plan.md`** — Phases 6 and 7 are next. The phase-status table says what
   is complete; the gate table (G1–G7) is the definition of done.
3. **`lessons.md`** — L1–L35. Not optional reading; several are things that cost
   real time to learn.

## The gates

    npx tsc --noEmit                                  # G1, per package
    cd artifacts/api-server && npx vitest run         # G2 — see the trap below
    cd artifacts/conformity && npx vite build         # G3
    node scripts/check_honesty.mjs   --baseline 9     # G4
    node scripts/check_citations.mjs --baseline 0     # G5
    node scripts/check_ui_reach.mjs  --baseline 6     # G8
    node scripts/verify_cra_corpus.mjs                # corpus
    node scripts/verify_nis2_corpus.mjs

G6 is live verification: rebuild the container, hit the endpoint, confirm real
persisted data comes back. G7 is the retro — update `lessons.md` and re-tune the
*next* phase before starting it.

## What is next

**Phase 6 — team role model.** Required by D12 (two equal daily users). Today
only `admin`/`member` exist plus a free-text `roleResponsibility`, so "the home
differs by role" has nothing to branch on. Phase 6.2 also fixes
`conformityMembers.plainPassword`, which stores passwords in plaintext.

**Phase 7 — shell redesign.** Nine destinations in four groups, replacing 34
pages and 51 route registrations, built *on* the existing 181 design tokens and
57 UI primitives. Done means the UI reach gate goes to 0 orphans and the seven
design principles hold.

## Traps — each of these actually happened

1. **G2 has 31 known failures** (issue #62), dominated by 401s. Do **not** fix
   them by flipping `DEMO_READONLY` in `ci.yml`. That restores the state where
   unauthenticated writes succeed — the thing that looked like a vulnerability.
   The fix is making those tests authenticate.
2. **Never raise a gate baseline to make it pass.** The baseline is a debt
   record, not a dial.
3. **Read the article before implementing the task.** Four separate plan defects
   were found this way — including one that specified a retention duty for
   Article 20, which has no retention paragraph at all.
4. **Filter the findings, never the failure.** A `grep` on gate output hid a
   crash for two iterations; the gate was throwing, and the filtered view showed
   nothing.
5. **Verify before claiming.** A security vulnerability was reported that did
   not exist (the guard was present, gated on an unset env var), and a push was
   reported that had not happened (it targeted a stale branch name). Both were
   avoidable with one confirming command.
6. **Never hand-type an article number.** Every citation must resolve in
   `docs/cra_statutory_corpus/` or `docs/nis2_statutory_corpus/`. The citation
   gate attributes per line, so name the instrument on the same line as its
   article number.

## Known-bad state, so nobody rediscovers it

- **The CSIRT "transmit" button is fake, and the honesty gate does not catch
  it.** `artifacts/conformity/src/pages/partner-hub.tsx:1066` is
  `onClick={() => setCsirtDispatched(true)}` — local state only. partner-hub
  makes no incident or submission API call at all, yet the UI then renders
  "TRANSMITTED TO CSIRT". A user could believe they discharged a 24-hour
  statutory reporting duty that never happened. `check_honesty.mjs` reports 9
  findings and **none is in partner-hub**, so the gate has a real gap here.
  This is the highest-severity known issue in the tree — fix it before Phase 7
  work begins, and widen the honesty rule so it cannot recur.
- Two of the 9 honesty findings are false positives on `persona-cockpit.tsx:12`,
  a *comment* that documents the fabricated strings a previous session removed.
  Annotate it the way `presumption.ts:23` is annotated rather than leaving the
  baseline inflated.
- 31 G2 failures (issue #62), deferred by decision until the persona phases end.
- 6 orphaned capabilities — enumerated by `check_ui_reach.mjs`, each with a
  scheduled home in iteration 2.
- `conformityMembers.plainPassword` stores plaintext passwords.
- **Two steward implementations exist.** `openSourceStewardRoutes.ts` (mounted
  at `/steward`) is the older one, and `open-source-steward.tsx` calls it. The
  Phase 4 Art. 24 engine (`stewardPolicy.ts`, at `/conformity/steward/:project`)
  is the statute-grounded one and **nothing calls it**. Phase 7 should move the
  UI onto the Art. 24 engine and retire the older route — not wire up a second
  surface alongside it.
- No migration history — the schema is applied by `drizzle push-force`. Schema
  as code is tracked; there is no path to migrate a database holding real data.
