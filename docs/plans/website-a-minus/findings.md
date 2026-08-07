# Findings — Public website assessment (baseline before remediation)

Source: session code review (superpowers:code-reviewer) + full Chrome walkthrough of all 7 pages and the wizard end-to-end + targeted fact-checks. Dated 2026-08-06.

## Baseline scorecard
| Category | Baseline | Target | Evidence |
|---|---|---|---|
| Functional completeness | A- | A- (hold) | 7 routes 200; wizard e2e to result + gated form; lead/PDF 200+`%PDF` |
| Content & house-rule compliance | A- | A | Zero violations found; one "queue penalty" chip to reword |
| Durability & reliability | A- | A- (hold) | Static funnel; survives rebuild; demo data present; auth hardened. Caveat: `/cra-primer` CMS dep |
| Design & UX polish | B+ | A- | On-brand + consistent; dup CTA; generic footer; mobile unverified |
| Conversion / funnel | B+ | A- | Single CTA + lead magnet; no analytics events; dup CTA; success lacks link |
| Code quality / maintainability | B- | A- | Dead files; stale name/comments |
| Accessibility | C+ | A- | Placeholder-only labels; heading skip; no axe run |
| SEO & metadata | C+ | A- | Sitemap 0 entries + omits static routes; no OG/JSON-LD |
| Performance | Not graded | (deferred) | No Lighthouse run |

## Concrete findings (file:line → action)
- **F1 — Dead code.** `artifacts/oxot-web/src/components/layout/header-panels.ts` (+ `header-panels.test.ts`) and `src/pages/home-page.tsx` are orphaned after the static-nav + static-home rewrite. → delete (Phase 1).
- **F2 — Stale naming/comments.** `penaltyNote` key/interface/usages in `src/data/cra_selfcheck_en.json` + `src/components/cra-check/self-check.tsx` (~lines 68, 431 comment, 432, 469); `next build` comment in `src/lib/segments.ts:5`. → rename `annexNote` + reword (Phase 1).
- **F3 — Sitemap empty + funnel omitted.** `GET /api/seo/sitemap.xml` returns **0 `<loc>`** entries; static funnel routes are not CMS pages so never included. Robots points to `/sitemap.xml`. → add static routes + investigate the 0-entries anomaly in `artifacts/api-server/src/routes/seo.ts` (Phase 6).
- **F4 — No OG/JSON-LD on funnel pages.** `useSeo` calls set only title+description (checked `home.tsx`, `product.tsx`). No `ogImage`, canonical, or structured data. → add (Phase 6).
- **F5 — `/cra-primer` CMS dependency.** `src/pages/resources.tsx:20` links `/cra-primer`; resolves today because a CMS page with that slug exists (`GET /api/site/en/pages/cra-primer` → 200), but it 404s on a fresh DB lacking that seed. → repoint to durable target (Phase 2). Note: `/knowledge`, `/news`, `/conformity-platform/sources`, `/conformity-platform/regulations` are real routes and fine.
- **F6 — Duplicate secondary CTA.** `src/pages/home.tsx` renders "Take the 2-minute check" twice (hero ~83-88 and closing band ~212-217). Spec: once per page max. → drop one (Phase 3).
- **F7 — Generic footer.** `src/components/layout/footer.tsx` still shows "Follow Along / social channels" — off-brand for a standalone funnel. → tidy (Phase 3).
- **F8 — a11y: labels.** Inputs in `src/pages/demo.tsx` (~121-131) and `self-check.tsx` (~537-547) use placeholder + `aria-label` only, no visible/sr-only `<label>`. → add labels (Phase 5).
- **F9 — a11y: heading order.** `self-check.tsx` result view opens with a `<p>` header (~366) then `<h3>` cards (~411+) with no `<h2>` under the page `<h1>`. → promote to `<h2>` (Phase 5).
- **F10 — Conversion: no analytics + no success link.** No analytics event on CTA clicks; `demo.tsx` success (~109-112) references the 2-min check without a link. → wire `/api/analytics/collect` + add link (Phase 4).
- **F11 — "queue penalty" wording.** `src/data/cra_selfcheck_en.json` `deltaLabels.queue` = "Notified-body queue penalty — −8 points" (seen on result screen). → "queue delay" (Phase 2).

## Verified-good (no action; protect during remediation)
- House rules pass: Annex VII everywhere for the technical file; no €15M/2.5%; dated claims; naming correct.
- Wizard clean of Next.js artifacts; `parsePrefill` works; lead/PDF fetch contract matches server routes; PDF endpoint sets `application/pdf` + attachment + no-store.
- All `results/nowActions/roleHeaders/gapClosure/gaps.items` JSON keys cover their TS enums (no undefined-key crash).
- Collateral PDFs served (`public/collateral/*.pdf` → 200); auth hardening in place; demo data present.
