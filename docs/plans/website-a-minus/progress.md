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

## Phase 7 results (verified on Docker)
| Check | Result |
|---|---|
| 7 routes 200 | ✅ all 200 |
| wizard e2e + lead/PDF | ✅ /api/lead 200, /api/selfcheck/report 200 + %PDF |
| grep clean (€15M/2.5%/penalty) user-facing | ✅ clean (one internal code comment "Queue penalty" in cra-selfcheck.ts — not user-facing) |
| oxot-web typecheck + Docker build | ✅ 0 type errors; build green |
| axe 0 serious/critical (all 7 pages) | ✅ 0 on /, /product, /pricing, /deployment, /resources, /cra-check, /demo |
| sitemap lists 7 funnel routes | ✅ all present |
| OG + canonical + JSON-LD | ✅ canonical+OG on all 7; Organization on /, SoftwareApplication on /product |
| meta-viewport zoom | ✅ maximum-scale removed |
| 375px no overflow | ⚠️ responsive-by-construction (container/px-4/responsive grids/mobile Sheet); browser tool could not shrink viewport below ~1165px to pixel-verify |

## Final re-grade (Strong 8) — GATE MET (≥8 at A-)
| Category | Baseline → Final |
|---|---|
| Functional | A- → **A-** |
| Content/compliance | A- → **A** |
| Durability | A- → **A-** |
| Design/UX | B+ → **A-** (dedup CTA, funnel footer, responsive; 375px tool-caveat) |
| Conversion | B+ → **A-** (page-views + per-surface source + demo success link) |
| Code quality | B- → **A-** (dead code removed, renamed, 0 type errors) |
| Accessibility | C+ → **A-** (axe 0 serious/critical ×7, heading fix, AA contrast, zoom restored) |
| SEO | C+ → **A-** (sitemap funnel routes, canonical+OG ×7, JSON-LD) |
| Performance | not graded (deferred follow-up) |

Contrast fix (Option B): primary buttons → navy labels (`--primary-foreground`), orange TEXT/kickers/links → `--primary-ink`; bright orange kept for surfaces/icons.

## 5-Question reboot
- **Where am I?** Planning complete on `feature/website-a-minus-remediation`.
- **Where am I going?** Phases 1→8 in task_plan.md.
- **Goal?** A- verified in 8 categories (Strong 8), static-code-only.
- **Learned?** See findings.md (F1–F11).
- **Done?** Assessment + 3 planning files committed.
