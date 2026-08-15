# Next-session prompt

Paste the block below to open the next session. It carries the working
agreement in the prompt itself rather than only in a document, because
behavioural instructions land harder in the prompt than in a file the model is
told to read. The redundancy with `HANDOVER.md` is deliberate.

---

Continue the OXOT CRA persona programme.

Before anything else, read `docs/cra-personas/HANDOVER.md` — it is the entry
point and names the reading order, the gates, and the traps. Then read
`DESIGN_five_shapes.md` **iteration 2 first** (the final section supersedes the
33→8 plan; reading only the earlier version leads to building the wrong shell),
and `task_plan.md` Phases 6–7.

**Working agreement — governs every task, not just the first:**

1. **Read the statute before implementing.** Four plan defects were caught this
   way, including a task that specified a retention duty for Article 20, which
   has no retention paragraph. Assume the plan may be wrong about the law and
   check the corpus.
2. **Verify before claiming.** Never report a fix, a push, a passing gate, or a
   vulnerability without running the command that proves it, and show the
   output. Every failure in the previous session was a verification failure, not
   a capability failure.
3. **Gates are the definition of done:** G1 typecheck · G2 no *new* failures
   against the 31 baseline · G3 build · G4 honesty · G5 citations · G8 UI reach ·
   both corpus verifiers · G6 live against `localhost:8088` with real persisted
   data.
4. **Never raise a gate baseline to make something pass.** A baseline is a debt
   record, not a dial. Lower it when you fix something; never raise it.
5. **Rules as pure functions first.** Statute logic goes in
   `artifacts/api-server/src/lib/` with unit tests, then routes, then UI — never
   the reverse. This is what made Phases 1–5 hold up.
6. **One task, one commit, and the message records WHY.** The commit log is the
   decision history and is treated as a deliverable, not bookkeeping.
7. **Tri-state discipline.** Unanswered is never false, and must never render as
   compliant.
8. **The application never concludes conformity.** It shows what has evidence
   and what does not. Conformity is assessed by the manufacturer under Art. 32
   or by a notified body.

**Halt and ask rather than guess when:** a new honesty or citation waiver would
be needed; the corpus does not settle a legal question; the same approach has
failed twice; or `git log` shows an unexpected HEAD move.

**First task — Phase 6.3: scope work by team role.**

Done before this point (2026-08-15, see task_plan.md and the commit log):
the honesty-gate correction (G4 baseline 9 → 7, positive-control proven),
6.1 (four team roles as validated data — `TEAM_ROLES` in `@workspace/db`,
nullable `team_role`, seeded, editable, drift-guarded), and 6.2 (plaintext
`plainPassword` removed everywhere; the scrypt hash is the only credential).

6.3 closes Phase 6: scope obligations and evidence requests by role, and
expose `teamRole` on `/me` (its response schema is generated — regenerate,
don't hand-edit) so the home can branch. Phase acceptance: a user's role
determines what their home surfaces, and no password is readable in the
database (the second half already holds).

Remember the framing correction in memory: unwired surfaces such as the
partner-hub CSIRT payload builder are DONORS that Phase 7 re-homes onto the
real engines — describe them as "not yet wired", never "fake".

**Then:** Phase 7 (shell redesign — nine destinations, drives G8 to 0 orphans).
Close every phase with G7 — update `lessons.md`, then re-tune the next phase's
tasks before starting it.
