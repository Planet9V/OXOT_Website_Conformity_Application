# Toolkit-Skills Codebase & Website Evaluation — Design

## Understanding Summary

- **What**: A comprehensive critique-and-grading evaluation of three parts of the
  repo — the public website (`oxot-web`), the gated conformity app, and the
  `api-server` backend — using 8 newly-installed Claude Code skills
  (react-patterns, frontend-excellence, accessibility-wcag,
  authentication-patterns, api-design-patterns, postgres-optimization,
  testing-strategies, security-hardening) plus 10 thin command-plugins as
  evaluation lenses.
- **Why**: An honest, evidence-based grading of current code/UX quality — not
  generic advice — to find real improvement opportunities across frontend,
  backend, auth, and API design.
- **Who it's for**: Prioritizing follow-up work; this also closes out Task #11
  ("Evaluate conformance app authentication using new skills") by folding it
  into the authentication dimension rather than duplicating the work.
- **Execution**: Multi-agent Workflow — parallel subagents per dimension,
  explicitly opted into given the scope (8 skills × 10 plugins × 3 apps).
- **Deliverable**: A published Artifact report (grades, findings,
  recommendations) plus a chat summary and `findings.md`/`progress.md` in the
  repo as the raw record.
- **Non-goal**: Read-only analysis. No code changes are made as part of this
  evaluation — findings become a prioritized follow-up backlog.

## Assumptions

1. Letter grades (A–F) per dimension + one weighted overall score, mirroring
   the CRA-wizard evaluation format used earlier this session.
2. The "thin" command-plugins (`lighthouse-runner`, `a11y-audit`, etc.) are
   prompt-guided manual reviews, not real tool integrations — they don't
   install `lighthouse`/`axe-core` binaries. Those dimensions get
   expert-review-style grading, not automated tool scores.
3. No fixes are implemented as part of this evaluation.

## Decision Log

| Decision | Alternatives considered | Why |
|---|---|---|
| Dimension-scoped pipeline (each dimension only touches the app(s) it applies to) | Full app × dimension matrix (~27 combos) | Avoids ~2x wasted agent calls on inapplicable combos (e.g. "database" doesn't apply to frontend) |
| Weighted overall grade | Simple average across dimensions | Security/auth/correctness matter more than stylistic polish for a compliance-focused product |
| Fold Task #11 into the auth dimension | Run Task #11 separately, later | Avoids duplicating the same authentication-code analysis twice |
| Read-only evaluation, findings-only deliverable | Auto-apply fixes found during evaluation | User wants to review and prioritize before any code changes |

## Design

### Architecture

One subagent per evaluation dimension (9 dimensions), each scoped only to the
app(s) it actually applies to, run in parallel via `pipeline()`. A single
synthesis agent reads all findings together afterward and produces the overall
report + weighted score. ~10 agents total, within this session's medium
workflow-size guideline.

| Dimension | Scope | Skill/plugins used |
|---|---|---|
| Frontend & React patterns | oxot-web + conformity | `react-patterns` |
| Accessibility | oxot-web + conformity | `accessibility-wcag`, `a11y-audit`, `color-contrast`, `screen-reader-tester` |
| Performance | oxot-web + conformity | `frontend-excellence`, `bundle-analyzer`, `css-cleaner` |
| Responsive/visual design | oxot-web + conformity | `responsive-designer`, `ui-designer` |
| Authentication & authorization | api-server + conformity (closes Task #11) | `authentication-patterns` |
| API design | api-server | `api-design-patterns` |
| Database/backend efficiency | api-server | `postgres-optimization` |
| Security | api-server + conformity | `security-hardening` (builds on this session's earlier CORS/headers findings) |
| Test coverage & strategy | all three | `testing-strategies` |

### Grading rubric

Each dimension agent assigns a letter grade (A–F) with 3–5 concrete,
file:line-cited findings — both strengths and gaps, explicitly distinguishing
"real bug/gap" from "stylistic preference." The synthesis agent computes an
overall grade (weighted toward security/auth/correctness over polish) and
produces a top-5 prioritized recommendation list ranked by impact vs. effort.

### Output

- `findings.md` / `progress.md` in the repo root — raw record, same pattern as
  this session's other multi-phase work.
- Published Artifact report — grades table, findings by dimension, prioritized
  recommendations — the shareable deliverable.
- Chat summary.
