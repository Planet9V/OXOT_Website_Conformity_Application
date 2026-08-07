# Progress log — Website A- remediation

## 2026-08-06 — Assessment + plan created
- Ran code review (superpowers:code-reviewer) of the funnel vs the design spec → verdict: substantially complete, 0 critical, house rules pass.
- Chrome walkthrough: verified all 7 pages render (home, product, pricing, deployment, resources, cra-check, demo) + ran the wizard end-to-end (9 questions, classII path) to the result screen (gauge 30/100 "At risk", classification, gaps, runway, gated review form "PDF — no email required").
- Fact-checks: sitemap returns 0 `<loc>` (funnel routes absent); no OG/JSON-LD on funnel pages; `/cra-primer` resolves via an existing CMS page (200) but is a CMS dependency.
- Produced honest baseline scorecard (see findings.md). User locked scope = **Strong 8** (Performance deferred).
- Wrote `task_plan.md`, `findings.md`, `progress.md`. Branch: `feature/website-a-minus-remediation`.

## Current status
- **Batch 1 (Phases 1–3) complete.** Next: Batch 2 = Phases 4–6 (Conversion, Accessibility, SEO).

## Batch 1 results (Phases 1–3)
- P1: deleted `header-panels.ts`(+test), `home-page.tsx`; renamed `penaltyNote`→`annexNote` (self-check.tsx + JSON); fixed `segments.ts` comment.
- P2: `deltaLabels.queue` "penalty"→"delay"; D3 resolved — `/cra-primer` durable via snapshot seed (kept).
- P3: removed duplicate home secondary CTA; footer nav → static funnel list (dropped CMS `useGetNavigation` dependency).
- Verify: oxot-web typecheck clean except the pre-existing `conformity-dashboard.tsx:675` error (unrelated). Dead files confirmed gone; no stale refs.

## Test results (to be filled during Phase 7)
| Check | Result |
|---|---|
| 7 routes 200 | (pending) |
| wizard e2e + lead/PDF | (pending) |
| grep clean (€15M/2.5%/penalty) | (pending) |
| typecheck + Docker build | (pending) |
| axe 0 serious/critical (7 pages) | (pending) |
| sitemap lists 7 funnel routes | (pending) |
| OG + canonical + JSON-LD | (pending) |
| 375px no overflow | (pending) |

## 5-Question reboot
- **Where am I?** Planning complete on `feature/website-a-minus-remediation`.
- **Where am I going?** Phases 1→8 in task_plan.md.
- **Goal?** A- verified in 8 categories (Strong 8), static-code-only.
- **Learned?** See findings.md (F1–F11).
- **Done?** Assessment + 3 planning files committed.
