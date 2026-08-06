# OXOT public home page — CRA Conformity redesign (Option A)

**Date:** 2026-08-06
**Goal:** Replace the weak, abstract public home page with a CRA-first landing page
that sells the OXOT Conformity application, creates statutory urgency, shows the
product, speaks to every CRA buyer persona, and drives a lead ("Book a walkthrough").
Content stays in the CMS; presentation reuses the existing section renderer.

## Decision

**Option A — "The Deadline Operation."** Urgency + authority, sales-led. Chosen over
Option B ("One record, every regulation") because the CRA buyer is deadline-driven and
risk-motivated *now*; A mirrors the proven sales-sheet framing, creates urgency, shows
the product, and converts to a concrete lead. Source material: the OXOT Conformity
sales sheet and product specification (artifacts/source_material/*.pdf), the CRA primer,
and the application itself.

## Scope

- Rewrite the `home` CMS page (EN; NL follows) as an ordered list of sections.
- All section types already exist and render — **except** one small, backward-compatible
  enhancement: `two_column` gains an optional `imageUrl`. When present it renders a real
  screenshot in place of the abstract "engineered graphic"; when absent, behaviour is
  unchanged. This is the only component change.
- Capture one clean workbench screenshot for the product section, store it under
  `artifacts/oxot-web/public/` and reference it by URL.
- Content is written to the DB and exported to the versioned snapshot
  (`content:export`) so it becomes the seed and survives redeploys.

## Section design (order = sort_order)

| # | type | key content |
|---|------|-------------|
| 0 | `hero` | eyebrow "CRA · Regulation (EU) 2024/2847"; title "Run CRA conformity as an operation, not a fire drill."; subtitle (sales-sheet lede); bullets ×3; primaryCta "Book a walkthrough" → /contact; secondaryCta "Open the workbench" → /conformity/ |
| 1 | `stat_band` | statutory deadline: 11 Sep 2026 (reporting enforceable), 11 Dec 2027 (full application), €15M · 2.5% (max penalty) |
| 2 | `feature_grid` | "Why teams stall" — Evidence lives everywhere / Clocks start without warning / One portfolio, many classes |
| 3 | `two_column` (imageUrl) | "One workbench holds the whole statutory record." + product screenshot; cta "Open the workbench" → /conformity/ |
| 4 | `feature_grid` | "Six modules, one statutory record" — the six modules, verbatim from the sales sheet |
| 5 | `steps` | "The eight-step compliance journey" — Scope, Classify, Route, Requirements, Evidence, Close gaps, Documentation, Ready for review |
| 6 | `logo_wall` | "Built on the regulation · interoperates with" — ENISA SRP, CSIRT nodes, CISA KEV, SBOM/HBOM/CBOM, ISO 29147/30111, VEX, Annex I/III/IV |
| 7 | `feature_grid` | "Who it's for" — Manufacturers, OEMs & sub-assemblers, Importers & distributors, System integrators, Owner/operators, Authorised representatives (each with the CRA duty they carry) |
| 8 | `quote` | CRA-reframed testimonial (Head of Product Security, industrial automation vendor) |
| 9 | `faq` | Four CRA questions: when obligations bite; is my product in scope; is my 62443/SBOM work wasted; is this legal advice |
| 10 | `cta` | "See your own portfolio in the workbench." + 45-minute walkthrough blurb; primaryCta "Book a walkthrough" → /contact |

Exact copy is fixed in the approved mockup
(`.superpowers/brainstorm/.../option-a-full.html`) and reproduced verbatim at build time.

## CTA targets

- Primary "Book a walkthrough" → `/contact` (existing CMS contact page).
- Secondary "Open the workbench" → `/conformity/` (the gated app).

## Data-shape contracts (from the section components)

- hero: `{eyebrow, title, subtitle, bullets[], primaryCta{label,href}, secondaryCta{label,href}}`
- stat_band: `{stats:[{value,label,sublabel}]}`
- feature_grid: `{eyebrow, title, features:[{icon,title,description}]}`
- two_column: `{eyebrow,title,body,cta{label,href},reverse?,imageUrl?}`  ← imageUrl new
- steps: `{eyebrow,title,steps:[{number,title,description?}]}`
- logo_wall: `{title,logos:[{name}]}`
- comparison_table: (not used in A)
- quote: `{quote,author,role}`
- faq: `{eyebrow?,title?,items:[{question,answer}]}`
- cta: `{title,subtitle,primaryCta{label,href},secondaryCta?{label,href}}`

## Testing / success criteria

- Home renders all 11 sections in order, light + dark, desktop + 375px, no console errors.
- Product screenshot loads; two_column without imageUrl elsewhere is unchanged.
- Content round-trips through `content:export` (snapshot updated).
- NL home mirrors the structure (translated copy) or is scheduled as a follow-up.

## Out of scope

- No new section component types beyond the `imageUrl` field.
- No nav/footer changes. No change to `/conformity/*`.
