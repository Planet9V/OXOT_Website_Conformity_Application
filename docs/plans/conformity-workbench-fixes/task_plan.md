# Task Plan — Conformity workbench defects (root-cause fixes, no breakage)

## Goal
Fix three defects in the gated **CRA Conformance Application** (workbench, `artifacts/conformity`) at root cause, without breaking existing behavior, and make the **portfolio → product → assessment** flow work for every product:
1. **Portfolio "Assessment not found"** — clicking most portfolio products fails.
2. **PSIRT deep-link/refresh 404** — `/conformity/psirt` 404s on hard load.
3. **Workbench accessibility** — meta-viewport + colour-contrast (never got the fix the public site got).
(+ a cosmetic `$\rightarrow$` LaTeX artifact on the product page.)

## What is NOT wrong (evidence, so we fix the right thing)
- **Database/seeds are intact** (local): `conformity_products`=3, `conformity_assessments`=3 (1→1, 2→2, 3→3), every `/api/conformity/*` and `/api/portfolio/*` returns **200** for the authenticated demo. Nothing was wiped.
- The buggy file `product-portfolio.tsx` was **last changed in the initial/prior-session commits**, not this session's work (#22–25). This is a pre-existing wiring defect, not a DB break.

---

## Defect 1 — Portfolio buttons navigate to a bogus assessment id (ROOT CAUSE)

**Evidence:** `artifacts/conformity/src/pages/product-portfolio.tsx`
- L755: `onClick={() => setLocation(`/products/${prod.userProductId || prod.id || 1}`)}`  ("View Product Dossier & Edit")
- L765 & L848: `onClick={() => setLocation(`/assessments/${prod.userProductId || prod.id || 1}`)}`  ("Open Assessment Workspace")

`/api/portfolio/products` returns every item with **`assessmentId: null`**; the UI never uses a real assessment link. It uses the portfolio product's own id as an assessment id:
- Conformity-backed items (`userProductId` 1/2/3) → `/assessments/1,2,3` (exist) → work.
- Marketing-catalog items (`cra_portfolio_products`) → ids that map to non-existent/foreign assessments → `assessment.tsx:170` "Assessment not found or failed to load" (or the *wrong* assessment when the id coincidentally exists).

**Intended UX (per owner):** a product without an assessment should offer the **kickoff/scoping wizard**, not error.

**Root-cause fix (design):**
- **API** (`artifacts/api-server/src/routes/productPortfolio.ts`, GET `/products`): for each portfolio item, resolve and return the REAL linked conformity identifiers — `conformityProductId` and `assessmentId` (nullable) — by joining `conformity_products`/`conformity_assessments` (match on the existing link if present, else by SKU/name). Additive fields; existing consumers unaffected.
- **UI** (`product-portfolio.tsx`, the 3 onClick sites): 
  - If `assessmentId` present → "Open Assessment Workspace" → `/assessments/{assessmentId}`.
  - Else if `conformityProductId` present → "View Product Dossier" → `/products/{conformityProductId}`, and show "Start CRA assessment" → create via `POST /api/conformity/products/quick-start` (or the existing create flow) then navigate to the new assessment.
  - Else (pure catalog item, no conformity record) → primary action becomes **"Start CRA assessment"** (kickoff wizard / quick-start creates the conformity product + assessment from the catalog item), then navigate. Never `setLocation` to an unvalidated id.
- Remove the `|| prod.id || 1` fallbacks entirely (the source of the bogus navigation).

**Acceptance:** every portfolio card either opens its real assessment, opens its real dossier, or starts a new assessment via the wizard — **no "Assessment not found"** for any card. Verified by clicking all 7 cards.

---

## Defect 2 — PSIRT deep-link/refresh 404

**Evidence:** hard-loading `/conformity/psirt` → in-app 404; in-app nav to PSIRT works; `/conformity/products`, `/overview`, `/assessments/:id` hard-load fine → PSIRT-route-specific.
**Investigate then fix:** in `artifacts/conformity/src/App.tsx`, confirm the `/psirt` (and `/psirt/*`) route registration/order vs the AuthGate/shell on cold boot; fix so a hard load of `/conformity/psirt` renders the PSIRT workbench (parity with `/products`). Likely a route-matching/order or nested-route issue; verify against how `/products` is registered.
**Acceptance:** `GET`-navigating and refreshing `/conformity/psirt` renders the PSIRT workbench (no 404).

---

## Defect 3 — Workbench accessibility (port the public-site fix)

**Evidence:** axe on `/conformity/psirt` (workbench): **1 critical (meta-viewport) + 26 serious (color-contrast)**. The public site got these fixes; the workbench (`artifacts/conformity`) did not.
**Fix (mirror oxot-web):**
- `artifacts/conformity/index.html`: remove `maximum-scale=1` from the viewport meta.
- `artifacts/conformity/src/index.css` (+ components): apply the same contrast tokens — navy label on primary buttons (`--primary-foreground`), `--primary-ink` for orange text/kickers/links — keeping the bright orange for surfaces/icons.
**Acceptance:** axe on the workbench (overview, products, an assessment, psirt) → **0 serious/critical**.

## Defect 4 — Cosmetic: raw `$\rightarrow$` LaTeX on product page
`product-detail.tsx` (wizard blurb) renders literal `$\rightarrow$` instead of "→". Replace with the arrow character / proper rendering. Acceptance: arrows render.

---

## Phases (batched, low-risk first)
1. **Investigate & confirm** — read `product-portfolio.tsx` fully, `assessment.tsx` load logic, `App.tsx` route table, the portfolio API join; confirm the conformity↔portfolio link strategy. (No code changes.)
2. **Defect 1 API** — add `conformityProductId`/`assessmentId` to the portfolio response (additive).
3. **Defect 1 UI** — rewire the 3 onClick sites + create-flow; remove bogus fallbacks.
4. **Defect 2** — fix the PSIRT route.
5. **Defect 3** — workbench a11y (viewport + contrast).
6. **Defect 4** — arrow fix.
7. **Verify (Docker + Chrome + axe)** — the matrix below; rebuild web+api, retest.
8. **Ship** — commit per defect, PR, merge.

## Verification matrix (gate)
- Click **all 7** portfolio cards (Bento + Table views): each opens real assessment / real dossier / starts wizard — **zero "Assessment not found."**
- The 3 conformity products (`/conformity/products`) still open their assessments (no regression).
- `/conformity/psirt` renders on **hard load + refresh**.
- axe on workbench overview/products/assessment/psirt → **0 serious/critical**.
- No `$\rightarrow$` literals on the product page.
- API regression: `/api/conformity/*` + `/api/portfolio/*` still 200 for demo; auth still required (401 unauth).

## Decision log
| # | Decision | Why |
|---|---|---|
| E1 | Fix in the workbench SPA + portfolio API, not the DB | DB is intact; the defect is UI/API wiring |
| E2 | No-assessment products get a **create/kickoff** flow, not a dead link | Matches intended UX ("wizard prompt"); never navigate to an unvalidated id |
| E3 | Port the *same* a11y token fix from oxot-web | Consistency; proven approach |
| E4 | Additive API fields only | Don't break existing consumers |

## Open questions (confirm before/at implementation)
1. **Environment:** is the reported failure on **local** or **production**? (Local has assessments 1–3; prod may have only 1 — which would make *more* cards fail there. The fix is environment-agnostic, but confirms the blast radius.)
2. **Link strategy:** how should catalog items map to conformity products/assessments — by SKU, by name, or "create on first assessment"? (Affects the API join.)
