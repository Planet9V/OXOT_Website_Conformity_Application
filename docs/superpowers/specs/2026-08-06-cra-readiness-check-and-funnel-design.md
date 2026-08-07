# CRA Conformance Application — readiness check + sales funnel

**Date:** 2026-08-06
**Status:** approved-in-principle (handoff brief + 3 owner confirmations); ready for review
**Sources:** `Planet9V/OXOT-Website-JULY2026:docs/PLATFORM-SITE-HANDOFF.md` (the owner-authored brief) + this session's three confirmations.

## 1. Goal

Turn `artifacts/oxot-web` (the standalone CRA platform site that oxot.nl links out to) into a thin demo-and-sales-enablement funnel whose single purpose is **booking demos**, anchored by the already-built **2-minute CRA readiness check with a gated PDF**, ported from the Next.js source repo into this repo's Vite/wouter + Express stack.

Not a self-serve trial. Not a second CMS. One ask per page, and it is the same ask: **Book a demo**.

## 2. Confirmed decisions (this session)

1. **Pricing display:** every tier reads **"Request a quote."** Tier *structure* is public; numbers are not.
2. **House rules on live copy:** remove penalty language (no "€15M", no "2.5% of turnover") from the home page and the ported wizard strings; keep it factual and dated. Fix "Annex IV technical file" → **"Annex VII"** wherever it refers to the technical file. (Annex IV as the *Critical-products* annex is correct and stays.)
3. **Tiers:** **Essential / Professional / Enterprise**, metered on *products with digital elements under management*, with Article 14 statutory clocks + PSIRT deliberately starting at Professional as the upgrade trigger.

## 3. Non-negotiable house rules (from the brief)

- Technical file is **Annex VII**, never Annex IV.
- **No penalty language.** Education, not fear.
- **Date every regulatory claim** (e.g. "As of 6 August 2026, zero notified bodies are designated").
- **Naming:** the platform is the **OXOT Conformance Platform**; the offering is the **CRA Conformance Application**.
- The gate: verdict shows **on screen in full**; the **PDF download** is what contact details unlock, delivered as an **immediate browser download, never by email**.
- Don't animate dates (a count-up renders "0 December 2027" to crawlers).

## 4. The page set (seven static routes, no CMS)

| route | job | primary CTA |
|---|---|---|
| `/` | What it is, who it's for, the statutory clock | Book a demo |
| `/product` | Six modules + the eight-step compliance journey | Book a demo |
| `/cra-check` | The 2-minute assessment → gated PDF | *(the check)* → Book a demo |
| `/pricing` | Three tiers + three add-ons, structure only, Request-a-quote | Book a demo |
| `/deployment` | Single-tenant, on-prem with local AI, or secure DC | Book a demo |
| `/resources` | Spec sheet + sales sheet PDFs | Book a demo |
| `/demo` | The booking form — the one conversion point | *(the form)* |

Secondary CTA, once per page maximum: **Take the 2-minute check** → `/cra-check`.

Existing reference pages (Primer, Regulatory News, Knowledge Hub, Source Library, Regulations) are demoted to a **Resources** dropdown / footer — kept for SEO and credibility, out of the funnel.

## 5. Nav redesign

Replace the leftover OXOT-company nav (Services / Frameworks / Insights) in `header.tsx` + `header-panels.ts` with the funnel nav:

`Platform · Pricing · Deployment · Resources ▾` + a standout **2-min check** button + primary **Book a demo** CTA. (`/product` is surfaced as "Platform".) Resources ▾ dropdown: CRA Primer · Regulatory News · Knowledge Hub · Source Library · Regulations.

## 6. Porting the readiness check (Next.js → Vite/wouter + Express)

### Client → `artifacts/oxot-web`
| source file | destination | adaptation |
|---|---|---|
| `src/lib/cra-selfcheck.ts` | `src/lib/cra-selfcheck.ts` | verbatim (pure TS) |
| `src/lib/segments.ts` | `src/lib/segments.ts` | verbatim |
| `src/components/cra-home/runway-svg.tsx` | `src/components/cra-check/runway-svg.tsx` | drop `"use client"` |
| `src/components/cra-home/self-check.tsx` | `src/components/cra-check/self-check.tsx` | drop `"use client"`; `Locale`→local `"en"`; use oxot-web `ui/button`; stub `getSessionContext`→`{sessionId:null,anonSessionId:null}`; POST `/api/lead` (simplified payload) for the lead + `/api/selfcheck/report` for the PDF |
| `data/cra_selfcheck_en.json` | `src/data/cra_selfcheck_en.json` | **strip penalty language** from `penaltyNote` and `gapClosure.sbom.body`; retarget `gapClosure.*.href` → `/cra-check` |

A new `src/pages/cra-check.tsx` renders `<CraSelfCheck locale="en" copy={...} />` inside the public layout, reading `?position=&classAware=&sbom=` prefill via `parsePrefill`.

### Server → `artifacts/api-server`
- Add dep **`@react-pdf/renderer`** to `artifacts/api-server/package.json`.
- Port `selfcheck-report-payload.ts` (validate/clamp; `Locale`→`"en"`) and `selfcheck-report-pdf.tsx` (react-pdf Document) into `src/lib/`.
- New router `src/routes/conformitySelfcheck.ts`, mounted in `routes/index.ts`:
  - `POST /selfcheck/report` — reuse existing `middlewares/rateLimit`, `validateReportPayload`, `renderToBuffer`, return `application/pdf` (attachment, `no-store`). Honeypot → `{ok:true}`. No DB write.
  - `POST /lead` — insert one row into the existing `leads` table: `{name, email, company, message, locale:"en", segment, source}`. Honeypot (`website`) → silent `{ok:true}`. Rate-limited by IP + email.
- **Do NOT** port `rate-limit.ts` (reuse `middlewares/rateLimit`) or the Next `/api/intake` pipeline.

### Schema
Add two nullable columns to `lib/db/src/schema/leads.ts`: `segment text` and `source text`. Additive — applied by the existing boot schema-push; no data migration. Surface both in the admin-leads DTO.

## 7. Pricing page structure

Three tiers (Essential / Professional / Enterprise), all **Request a quote**, metered on products under management; feature matrix per the brief (Article 14 clocks + PSIRT + triage + SLA start at Professional; SSO/custom retention + on-prem local AI at Enterprise). Three add-on cards beneath, each *"Add to any tier — Request a quote"*: **Surveillance**, **CRA Readiness Retainer**, **CRA Readiness Consulting**.

## 8. Resources / collateral

Copy `marketing/collateral/cra-conformance-spec-sheet.html`, `cra-conformance-sales-sheet.html`, `scripts/build-collateral.mjs`, and the two generated **v1.1** PDFs into this repo; `/resources` links the PDFs. (v1.1 = the Annex-VII-corrected rebuilds.)

## 9. Verbatim copy (from the brief, used as-is)

- **Positioning:** "Run CRA conformity as an operation, not a fire drill."
- **Statutory note:** "11 December 2027 — full application. From 11 September 2026, reporting obligations are already enforceable — a 24-hour clock, for products already on the market."
- **Deployment:** "Single tenant, always. Run it in a secure datacenter, or on your own premises with a local AI model — your evidence never leaves your control."
- Home page's existing "€15M · 2.5%" deadline band and FAQ are rewritten to this factual statutory note; "Annex IV" → "Annex VII".

## 10. Verification

- `pnpm --filter @workspace/api-server build` + `pnpm --filter @workspace/oxot-web build` clean.
- `docker compose` rebuild; Playwright sweep of all seven routes post-nav-change; run the wizard end-to-end, submit the lead, download the PDF (assert `%PDF`), confirm honeypot → JSON and missing-email → 400.
- Verify against the rendered DOM, not HTML source.

## 11. Out of scope

Dutch translation of the funnel pages (English only for now); syncing prospects between this site and oxot.nl; any CMS/admin/agent port from the source repo.
