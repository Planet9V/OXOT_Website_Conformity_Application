# Blog image manifest — batch generation brief

One file for every image the CRA companion blogs need. Generate the images
externally, then hand them back (matching the **filename** exactly) and they get
dropped into the posts at the marked slots. Captions and alt text already live
in the posts, so **do not bake any text, numbers, logos, or watermarks into the
images.**

- **Target web directory (where finished files go):** `artifacts/oxot-web/public/media/blog/`
- **In-post reference path:** `/media/blog/<filename>`
- **Status:** Series 1 (Episodes 1.01–1.06) below. Future series will be appended to this same file.

## House style (keep the whole set cohesive)

- Editorial illustration for a serious EU **industrial-cybersecurity / OT** consultancy — think a well-art-directed trade publication, not stock clip-art.
- **Palette:** muted and authoritative — deep blues, steel greys, concrete, with a single restrained accent (amber or signal-orange). Consistent across every image.
- **Heroes:** photorealistic-but-clean, calm, professional. 16:9.
- **Diagram / infographic slots:** flat, minimal, generous whitespace, 2–3 colours from the palette. Shapes and flow only — **no real data, no legible text.**
- **Avoid:** hacker-in-a-hoodie, glowing padlocks, binary rain, neon "cyber" clichés, faces, brand logos, and any embedded lettering.

## Series 1 — The Procurement & Contracting Crisis

| # | Filename | Size (px) | Type | What it should show |
|---|----------|-----------|------|---------------------|
| 1 | `ep-1.01-hero.jpg` | 1200×630 | Hero (photo-real) | A project/procurement timeline in which a **signed 2024 purchase order** on the left and **delivered industrial equipment in 2028** on the right straddle a single vertical divider marking the regulatory cut-over. The visual idea: a wide gap between *when you sign* and *when the law applies*. Serious, boardroom-adjacent. |
| 2 | `ep-1.02-hero.jpg` | 1200×630 | Hero (photo-real) | A **specification / RFP document** on a desk beside an **industrial control cabinet**, a few clauses subtly foregrounded. The idea: the RFP is the acceptance gate where requirements become contractual. |
| 3 | `ep-1.03-hero.jpg` | 1200×630 | Hero (photo-real) | An automation control panel mid-swap: a **small legacy PLC being retired** and a **larger replacement module** beside it, with engineering change-order paperwork in the foreground. The idea: the compliant replacement rarely matches the footprint or power budget of the part it retires. |
| 4 | `ep-1.03-cost-stack.png` | 1200×800 | Diagram (flat infographic) | A **stacked-bar** breakdown of redesign cost categories — engineering hours, enclosure & power, thermal/EMC re-test, FAT/SAT re-validation, technical-file/SBOM regeneration — where the *re-certification* segment is visibly the **smallest**. Abstract bars only, no numbers or labels. |
| 5 | `ep-1.04-hero.jpg` | 1200×630 | Hero (photo-real) | A **shipping container of industrial hardware at a European port**, with a subtle conformity-checkpoint framing and customs paperwork visible. The idea: the port of entry is the conformity gate, and the importer's name is on the paperwork. |
| 6 | `ep-1.04-liability-chain.png` | 1200×675 | Diagram (flat infographic) | A clean **left-to-right chain**: non-EU manufacturer → EU importer → distributor, with the **importer node emphasised** (heavier weight / accent colour) as the point where manufacturer-level obligations land when goods are rebranded or modified. Nodes and arrows only, no text. |
| 7 | `ep-1.05-hero.jpg` | 1200×630 | Hero (photo-real) | An **automation-distributor warehouse aisle**, with a subtle overlay dividing the shelves into two zones (grandfathered stock vs post-deadline stock). The idea: the line that matters runs through each pallet's placing date, not through one calendar date. |
| 8 | `ep-1.05-inline-decision.png` | 1200×675 | Diagram (flat infographic) | A simple **two-bin split**: one bin for stock placed on the market before the deadline (grandfathered), one for stock that needs a CE-marking gate after it, with a small decision fork between them. Shapes/flow only, no text. |
| 9 | `ep-1.06-hero.jpg` | 1200×630 | Hero (photo-real) | A public-procurement specification visualised as **two stacked layers** — a mandatory pass/fail floor at the bottom and a weighted scoring layer above — with a gate between them. The idea: the defensible tender is two layers, a legal floor everyone must clear and a scored layer above it. |
| 10 | `ep-1.06-scoring-matrix.png` | 1200×675 | Diagram (flat infographic) | A clean **weighted scoring-matrix** graphic: a handful of criteria rows with proportional weight bars and a short rating scale. Abstract grid and bars only — no real numbers or legible headings. |

**Counts:** 10 images — 6 photo-real heroes (1200×630) + 4 flat-infographic diagrams (1200×800 / 1200×675).

## Series 2 — The System Integrator & EPC Shield

| # | Filename | Size (px) | Type | What it should show |
|---|----------|-----------|------|---------------------|
| 1 | `ep-2.01-hero.jpg` | 1200×630 | Hero (photo-real) | An assembled automation skid: several certified controllers on a DIN rail wired to an edge gateway, an engineer's laptop showing custom control code beside it — framed and lit as one delivered product unit. Muted deep-blue/steel, one amber accent, no text/logos. |
| 2 | `ep-2.01-safe-harbor-boundary.png` | 1200×800 | Diagram (flat infographic) | The integrator's custom software/orchestration layer above a row of unmodified certified components, separated by a clear isolation boundary, gateway at the edge. Shapes/flow only, 2–3 palette colours, no legible text. |
| 3 | `ep-2.02-hero.jpg` | 1200×630 | Hero (photo-real) | An OEM industrial managed network switch on a commissioning bench, powered down, beside a laptop running a pre-energisation vulnerability scan and handover paperwork. The moment before energising is the decision point. Muted steel-blue/concrete, amber accent, no faces/text. |
| 4 | `ep-2.03-hero.jpg` | 1200×630 | Hero (photo-real) | Split composition: a shrink-wrapped boxed software product vs an automation engineer's workstation with a one-off plant HMI and a rung of control logic mid-edit — a subtle vertical divide between "product on the market" and "site-specific engineering." No baked text or CE marks. |
| 5 | `ep-2.03-scope-spectrum.png` | 1200×900 | Diagram (flat infographic) | A horizontal spectrum from "site-specific configuration" (left) to "productised/reusable/marketed component" (right), a vertical CRA-scope boundary cutting toward the right, the reusable zone in accent colour, three gate markers along the bar. No legible text/numbers. |
| 6 | `ep-2.04-hero.jpg` | 1200×630 | Hero (photo-real) | Three industrial sites — a chemical process plant, an automotive assembly line, an energy facility — each linked to one central engineering-governance hub: one repeatable pipeline across many plants. Muted, authoritative, no text/logos. |
| 7 | `ep-2.04-scoping-boundary.png` | 1200×675 | Diagram (flat infographic) | A single retrofit module inside a dashed containment boundary within a larger plant system; the module emphasised in accent colour, the wider plant neutral — the "part affected" vs "whole product" line. Shapes/boundary only, no text. |
| 8 | `ep-2.05-hero.jpg` | 1200×630 | Hero (photo-real) | A composite process skid (pumps, VFD, bolted-on control cabinet) with a blank, unengraved nameplate as the focal point — certified parts assembled, authorship of the whole still unsigned. Muted palette, amber accent, no text. |
| 9 | `ep-2.05-component-vs-system.png` | 1200×675 | Diagram (flat infographic) | Several small non-legible component marks flowing via arrows into one larger new system mark on a skid nameplate (accent colour) — inputs to the file, not a sum. Flat shapes only, no text. |
| 10 | `ep-2.06-hero.jpg` | 1200×630 | Hero (photo-real) | A contract negotiation table: a signature page and a marked-up engineering redline side by side, a soft-focus industrial control cabinet behind, a pen on the signature line. The pen, not the nameplate, decides who owns the technical file. Calm, boardroom-adjacent. |
| 11 | `ep-2.06-liability-flow.png` | 1200×675 | Diagram (flat infographic) | A two-track flow: a heavy fixed statutory-liability line dropping onto one emphasised "deemed manufacturer" node; a thinner curved contractual-indemnity arrow routing recovery back to a "client" node. Shapes/arrows + one accent colour, no legible text. |
| 12 | `ep-2.07-hero.jpg` | 1200×630 | Hero (photo-real) | A control-panel skid on a FAT test bench, an inspector's laptop running a security scan beside the functional test rig. Muted blues/steel, amber accent, no legible text. |
| 13 | `ep-2.07-dossier.png` | 1200×675 | Diagram (flat infographic) | A layered stack: the security half of a commissioning handover dossier (signed acceptance report, SBOM, credential-rotation record, update procedure, disclosure contact), the SBOM slab accented. Flat shapes, no text. |

**Counts (Series 2):** 13 images — 7 photo-real heroes (1200×630) + 6 flat-infographic diagrams.
