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
    node scripts/check_honesty.mjs   --baseline 7     # G4
    node scripts/check_citations.mjs --baseline 0     # G5
    node scripts/check_ui_reach.mjs  --baseline 6     # G8
    node scripts/verify_cra_corpus.mjs                # corpus
    node scripts/verify_nis2_corpus.mjs

G6 is live verification: rebuild the container, hit the endpoint, confirm real
persisted data comes back. G7 is the retro — update `lessons.md` and re-tune the
*next* phase before starting it.

## What is next

**Phase 6 — team role model.** Required by D12 (two equal daily users).
6.1 (four roles as data) and 6.2 (plaintext-password removal) are **done**
2026-08-15 — see task_plan.md. Next is **6.3**: scope obligations and evidence
requests by role, and expose `teamRole` on `/me` so the home can branch.

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

- **The CSIRT "transmit" claim was already fixed — an earlier version of this
  file reported it as live.** Commit `c6d3c02` introduced a button that rendered
  "TRANSMITTED TO CSIRT" from local state only; commit `857e91a` (2026-08-14)
  replaced it with "Build notification payload" and an amber
  "DRAFT ONLY — NOT SENT" badge. The honesty gate was never blind to the class:
  its `claims-statutory-filing` rule has matched "TRANSMITTED TO" since the gate
  landed (`d579e9c`), verified 2026-08-15 by positive control — a planted
  violation in the scan tree fails the gate. It reported nothing in partner-hub
  because there was nothing left to report. The button still *sends* nothing
  (partner-hub makes no incident API call), but the UI now says so; wiring real
  submission is Phase 7 work, where partner-hub is retired anyway.
- 31 G2 failures (issue #62), deferred by decision until the persona phases end.
- 6 orphaned capabilities — enumerated by `check_ui_reach.mjs`, each with a
  scheduled home in iteration 2.
- ~~`conformityMembers.plainPassword` stores plaintext passwords.~~ Fixed
  2026-08-15 (Phase 6.2): column removed and dropped; only the scrypt hash
  remains, and no route returns a password.
- **Two steward implementations exist.** `openSourceStewardRoutes.ts` (mounted
  at `/steward`) is the older one, and `open-source-steward.tsx` calls it. The
  Phase 4 Art. 24 engine (`stewardPolicy.ts`, at `/conformity/steward/:project`)
  is the statute-grounded one and **nothing calls it**. Phase 7 should move the
  UI onto the Art. 24 engine and retire the older route — not wire up a second
  surface alongside it.
- No migration history — the schema is applied by `drizzle push-force`. Schema
  as code is tracked; there is no path to migrate a database holding real data.
