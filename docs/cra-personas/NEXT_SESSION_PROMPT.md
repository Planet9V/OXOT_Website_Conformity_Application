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

**First task — sharpen the honesty gate, then fix what it catches.**

The gate currently carries no information: it is inflated by two false positives
and blind to one real defect.

- `artifacts/conformity/src/pages/partner-hub.tsx:1066` renders
  "TRANSMITTED TO CSIRT" from `onClick={() => setCsirtDispatched(true)}`, and
  the file makes no incident or submission API call at all. A user could believe
  they discharged a 24-hour statutory reporting duty that never happened.
  `check_honesty.mjs` does not flag it.
- Two of the nine known findings are false positives on
  `persona-cockpit.tsx:12` — a *comment* documenting fabricated strings a
  previous session removed. Annotate it the way `presumption.ts:23` is
  annotated.

Order: widen the rule so a UI element claiming a statutory transmission with no
corresponding API call is caught → confirm it now fires on partner-hub →
fix the defect → annotate the two false positives → re-baseline downward.

This is first because Phase 7 writes nine new surfaces, and a blunt honesty gate
during that rebuild is how fabricated claims get in at scale.

**Then:** Phase 6 (team role model, plus `conformityMembers.plainPassword`,
which stores passwords in plaintext), then Phase 7. Close every phase with G7 —
update `lessons.md`, then re-tune the next phase's tasks before starting it.
