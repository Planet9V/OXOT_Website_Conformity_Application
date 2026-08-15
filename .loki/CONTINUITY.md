# CONTINUITY — pointer file

**This is not the source of truth.** The CRA persona programme is planned and
tracked in `docs/cra-personas/`, which lives with the code and is committed:

| File | Purpose |
|------|---------|
| `docs/cra-personas/task_plan.md` | Phases, tasks, acceptance criteria, gates G1–G7, circuit breaker |
| `docs/cra-personas/lessons.md`   | **Read first every phase.** Carry-forward lessons L1–L18 |
| `docs/cra-personas/findings.md`  | Verified state of the codebase and the statute |
| `docs/cra-personas/progress.md`  | Session log and error table |

Maintaining a second copy of this state under `.loki/` would create two
competing sources of truth — the defect this programme exists to remove (see
lessons L13, and the two contradictory CRA corpora that shipped before it).

## Current position
Phase 0 (role model foundation). 0.1–0.4 complete and committed. Remaining:
0.5 cockpit from real data, 0.6 kill silent fallbacks, 0.8 CI.

## Halt conditions that stay in force
Autonomy applies to implementation. Two breakers still stop the loop and ask:
- a new `honesty-ok:` or `citation-ok:` waiver is needed
- a task requires a legal interpretation not settled by the corpus text

Both exist because this is a compliance tool: a wrong obligation mapping shipped
unattended is the failure mode that harms a user.
