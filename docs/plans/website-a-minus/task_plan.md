# Task Plan — Public website remediation to A- (Strong 8)

## Goal
Raise the public CRA funnel website to a verified **A- minimum in 8 categories**: Functional, Content/compliance, Durability, Design/UX, Conversion, Code-quality, Accessibility, SEO. **Performance is deferred** to a measured follow-up (not committed to a grade until Lighthouse is run). All fixes are **static-code-only** — no CMS/seed reintroduced, preserving durability.

## Scope
- **In:** `artifacts/oxot-web` funnel pages, header/footer, wizard component + copy JSON; `artifacts/api-server` SEO route (sitemap). Verification + re-grade.
- **Out:** Performance tuning to A- (separate follow-up); any CMS/workbench/admin changes; new features.

## Success = the A- acceptance matrix (Phase 7 gate)
| Category | A- criteria (must all pass) |
|---|---|
| Functional | 7 routes 200; wizard e2e; `/api/lead` + `/api/selfcheck/report` → 200/`%PDF` |
| Content/compliance | grep clean for €15M / 2.5% / "penalty"; every technical-file ref = Annex VII |
| Durability | `/cra-primer` (or its replacement) resolves with **no CMS dependency**; funnel 100% static |
| Design/UX | ≤1 secondary CTA per page; funnel-appropriate footer; no overflow at 375px |
| Conversion | analytics event fires on Book-a-demo + 2-min-check; demo success links onward |
| Code-quality | no orphaned files; typecheck + Docker build green; grep clean of stale names/comments |
| Accessibility | axe: **0 serious/critical** across all 7 pages; wizard fully keyboard-operable; visible/sr-only labels |
| SEO | sitemap includes all 7 funnel routes; each funnel page has OG image + canonical; JSON-LD on `/` and `/product` validates |

## Phases

### Phase 1 — Code-quality cleanup (lowest risk) — status: complete
- Delete `artifacts/oxot-web/src/components/layout/header-panels.ts` and `header-panels.test.ts` (orphaned since the static nav rewrite).
- Delete `artifacts/oxot-web/src/pages/home-page.tsx` (orphaned CMS home; `/` uses `pages/home.tsx`).
- Rename `penaltyNote` → `annexNote` in `src/data/cra_selfcheck_en.json` + `src/components/cra-check/self-check.tsx` (interface + 3 usages + the "penalty ceiling" comment).
- Fix stale `next build` comment in `src/lib/segments.ts`.
- **Verify:** `tsc` typecheck of oxot-web has no NEW errors; Docker build green.

### Phase 2 — Content/compliance + Durability — status: complete
> D3 RESOLVED: `cra-primer` is in the content snapshot (`site-content.json`), so `seed:site` restores it on a fresh DB → the link is durable. **Kept `/cra-primer`; no repoint needed.**
- `src/data/cra_selfcheck_en.json`: `deltaLabels.queue` "Notified-body queue **penalty**" → "Notified-body queue **delay**".
- `src/pages/resources.tsx:20`: repoint CRA Primer from `/cra-primer` (CMS-dependent) to a durable target — **decision needed at build time**: either a static `/resources` primer section or a guaranteed-seeded route. Default: keep `/cra-primer` only if we add it to the durable seed; otherwise link to the static `/cra-check` explainer + `/news`. (See Decision Log D3.)
- **Verify:** repo-wide grep for `€15M|2\.5%|penalty` returns only non-user-facing/no hits; primer link resolves on a fresh DB.

### Phase 3 — Design/UX — status: complete (code); 375px visual check moved to Phase 7
- `src/pages/home.tsx`: remove the duplicate "Take the 2-minute check" secondary CTA (keep hero, drop the closing-band duplicate, or vice-versa).
- `src/components/layout/footer.tsx`: replace/trim the generic "Follow Along / social channels" footer with a funnel-appropriate footer (nav links + Book a demo + legal), or hide social if empty.
- Mobile pass at 375px on all 7 pages (Chrome device emulation) — fix any overflow/tap-target issues.
- **Verify:** one secondary CTA per page; footer on-brand; 375px screenshots show no horizontal overflow.

### Phase 4 — Conversion — status: pending
- Wire a lightweight analytics event to `/api/analytics/collect` on primary (Book a demo) and secondary (2-min check) CTA clicks (home + nav + page CTAs). Reuse the existing analytics hook if present.
- `src/pages/demo.tsx`: add a `/cra-check` link in the success state (parity with the pre-submit copy).
- **Verify:** network shows the analytics POST on click; demo success renders the link.

### Phase 5 — Accessibility — status: pending
- Add visible or `sr-only` `<label>` to every input in `src/pages/demo.tsx` and `src/components/cra-check/self-check.tsx` (keep `aria-label` too).
- Fix result-phase heading hierarchy in `self-check.tsx` (promote the first result header to `<h2>` under the page `<h1>`; keep card `<h3>`s).
- Keyboard-operate the full wizard + both forms (tab order, focus-visible, Enter/Space on option buttons).
- Colour-contrast check on muted text + orange-on-white CTAs.
- Run **axe** (via the Chrome plugin / a Playwright + axe-core script) on all 7 pages.
- **Verify:** axe 0 serious/critical on every page; wizard completable by keyboard only.

### Phase 6 — SEO — status: pending
- Sitemap: `artifacts/api-server/src/routes/seo.ts` — add the 7 static funnel routes (`/`, `/product`, `/pricing`, `/deployment`, `/resources`, `/cra-check`, `/demo`) to the generated sitemap (static list merged with CMS pages). **Also investigate why the sitemap currently returns 0 `<loc>` entries** (Finding F3) and fix if it's a real bug.
- Per-page OG + canonical: extend the `useSeo` calls in each funnel page with an OG image (reuse `public/workbench-dossier.png` or a branded card) and a canonical URL.
- JSON-LD: add `Organization` (site-wide, e.g. in `PublicLayout` or `home.tsx`) and `SoftwareApplication`/`Product` on `/product`.
- **Verify:** `curl /api/seo/sitemap.xml` lists all 7 routes; each page's `<head>` has OG + canonical; JSON-LD passes a schema validator.

### Phase 7 — Verify & re-grade (gate) — status: pending
- Docker rebuild `web` (+ `api` if seo.ts changed); bring up stack.
- Run the **A- acceptance matrix** above end-to-end (curl matrix + axe + sitemap + wizard e2e + Chrome spot-check of all 7 pages incl. 375px).
- Re-grade all 8 categories against the rubric; record in `findings.md`. Gate: **≥8 at A-** or iterate.

### Phase 8 — Ship — status: pending
- Commit per-phase (or squashed), push `feature/website-a-minus-remediation`, open PR, merge to `main`.
- Update `docs/wiki` if any documented behaviour changed (e.g. sitemap).

## Decision Log
| # | Decision | Alternatives | Why |
|---|---|---|---|
| D1 | Target = **Strong 8** (add Accessibility + SEO to the safe 6) | Safe 6; All 9 incl. Performance | Best quality-per-risk; user-selected |
| D2 | **Performance deferred** (not graded to A- now) | Include perf | Can't grade honestly without Lighthouse; needs a measure+tune cycle |
| D3 | `/cra-primer` → **durable target** over CMS-seed reliance | Seed the CMS page reliably | Consistent with "funnel is 100% static / no CMS revert" principle |
| D4 | **Static-code-only** fixes | CMS edits | Preserves the durability guarantee established earlier |
| D5 | A- = professional bar with trivial nits, **proven by a concrete check** | Subjective grading | Verifiable, honest grading |

## Errors Encountered
| Error | Attempt | Resolution |
|-------|---------|------------|
| (none yet) | | |
