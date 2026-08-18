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

## Series 3 — Brownfield OT, Spare Parts & Maintenance

| # | Filename | Size (px) | Type | What it should show |
|---|----------|-----------|------|---------------------|
| 1 | `ep-3.01-hero.jpg` | 1200×630 | Hero (photo-real) | A maintenance technician at an aging industrial control cabinet holding two near-identical PLC boards side by side, one tagged with a small red flag. Shop-floor lighting. "Same footprint, different revision." |
| 2 | `ep-3.01-spec-drift.png` | 1200×675 | Diagram (flat infographic) | A stable "part number" line running straight across ~10 years while three underlying attributes (silicon revision, passive-component source, firmware branch) step-change and cross out of a shaded "identical-specification" zone. No legible text. |
| 3 | `ep-3.02-hero.jpg` | 1200×630 | Hero (photo-real) | A weathered early-2000s packaging line with a small modern cellular gateway enclosure freshly bolted to its control cabinet; the gateway is the focal point. |
| 4 | `ep-3.02-two-wirings.png` | 1200×675 | Diagram (flat infographic) | Side by side: left, a segmented one-way telemetry tap isolated behind a data diode ("maintenance"); right, a two-way gateway on the control VLAN with a path to the HMI ("substantial modification"). Shapes/arrows only, no text. |
| 5 | `ep-3.03-hero.jpg` | 1200×630 | Hero (photo-real) | An aging refinery distillation column with a small modern control cabinet at its base, against a long horizontal asset-lifecycle line where the vendor support window is only a short early segment. Muted, no text. |
| 6 | `ep-3.03-support-timeline.png` | 1200×675 | Diagram (flat infographic) | A single long horizontal bar = asset design life; a short early segment = "supported"; a long trailing segment = "unsupported / compensating controls." Shapes only, no numbers. |
| 7 | `ep-3.03-zone-isolation.png` | 1200×800 | Diagram (flat infographic) | A Purdue-model layered stack with one out-of-support device enclosed in a tightly bounded zone, a single choke point on the conduit into it, and a small monitoring tap on the boundary. Flow/enclosure only, no text. |
| 8 | `ep-3.04-hero.jpg` | 1200×630 | Hero (photo-real) | A legacy Siemens S7-300 rack in a plant cabinet with a network tap feeding a small edge-gateway box, a cloud icon above. "The compliance question lives in one hop." |
| 9 | `ep-3.04-architecture.png` | 1200×675 | Diagram (flat infographic) | A five-stage horizontal flow: legacy CPU → read-only tap → edge gateway/broker → one-way data diode → cloud ingest; a bracket highlights ONLY the edge gateway as in CRA scope, the legacy side marked "grandfathered." No legible text. |
| 10 | `ep-3.05-hero.jpg` | 1200×630 | Hero (photo-real) | A climate-controlled industrial spares warehouse: rows of boxed controller/PLC modules on steel shelving, calm and authoritative. No people or text. |
| 11 | `ep-3.05-decision.png` | 1200×675 | Diagram (flat infographic) | A horizontal timeline of warehoused stock crossing a single vertical threshold (the cutoff), with four stacked bands above representing capital / storage / degradation / warranty. No legible text or numbers. |
| 12 | `ep-3.06-hero.jpg` | 1200×630 | Hero (photo-real) | A certified explosion-proof pressure transmitter on a refinery process line at night, an engineer at a laptop reviewing a change record nearby. Muted, amber accent, no text. |
| 13 | `ep-3.06-staged-validation.png` | 1200×675 | Diagram (flat infographic) | A left-to-right staged pipeline: security advisory → offline identical bench-twin test rig → hazardous-area review/sign-off gate → controlled field deployment, with a small branch showing the security fix isolated from a bundled functionality update. Shapes/flow only, no text. |

**Counts (Series 3):** 13 images — 6 photo-real heroes (1200×630) + 7 flat-infographic diagrams.

## Series 4 — Tier-2 Upstream Component Supplier Survival

| # | Filename | Size (px) | Type | What it should show |
|---|----------|-----------|------|---------------------|
| 1 | `ep-4.01-hero.jpg` | 1200×630 | Hero (photo-real) | A small embedded circuit board on a workbench dwarfed by a tall stack of supplier-onboarding compliance paperwork from a large OEM — a €40 module set against an OEM-scale audit demand. Muted steel-grey/deep-blue, single accent, no text/logos. |
| 2 | `ep-4.01-conformity-routes.png` | 1200×800 | Diagram (flat infographic) | Two lanes branching from one product node: a WIDE default lane (internal self-assessment) carrying most components, and a NARROW notified-body lane carrying only a few important/critical categories; the wide lane emphasised. Shapes/flow only, no text. |
| 3 | `ep-4.02-hero.jpg` | 1200×630 | Hero (photo-real) | A single firmware binary on the left resolving into a short, ordered stack of labelled component blocks on the right, a boundary line separating the small statutory set from a larger buyer-requested set. Muted palette, amber accent, no legible text. |
| 4 | `ep-4.02-cicd-flow.png` | 1200×675 | Diagram (flat infographic) | A left-to-right pipeline: source/build → SBOM-generation node branching to a hash-binding step and a vulnerability-scan gate → signing → archive box, with one output arrow to a buyer node. Shapes/flow only, no data or text. |
| 5 | `ep-4.03-hero.jpg` | 1200×630 | Hero (photo-real) | A component vendor's PSIRT dashboard showing a confirmed actively-exploited vulnerability on one monitor; on a second, an OEM inbox with a 24-hour countdown; a firm boundary line between the two desks. Muted, amber accent, no legible text. |
| 6 | `ep-4.03-tiered-disclosure.png` | 1200×800 | Diagram (flat infographic) | Two envelopes leaving the vendor's boundary: one OPEN (crossing to the OEM — affected versions, severity, exploit conditions, mitigations, patch timing); one SEALED (staying inside — source, exploit reproduction, internal design). Shapes only, no legible text. |
| 7 | `ep-4.04-hero.jpg` | 1200×630 | Hero (photo-real) | A single painted line across an industrial workshop floor: on one side a lone maintainer's cluttered workbench (non-commercial); on the other a foundation's ordered sustained-support infrastructure (racks, build servers, a governance table). The line is the regulatory threshold. Muted, one accent, no text/faces. |
| 8 | `ep-4.04-line.png` | 1200×675 | Diagram (flat infographic) | A horizontal spectrum split into three zones by two threshold markers: "published / not on the market" → "steward — light-touch" → "manufacturer — full duties." Shapes/flow only, no legible text or numbers. |
| 9 | `ep-4.05-hero.jpg` | 1200×630 | Hero (photo-real) | A branded industrial edge-gateway enclosure on a loading dock, factory-neutral, warm authoritative light — "the nameplate is the legal event." No visible logos, text, or people. |
| 10 | `ep-4.05-roles.png` | 1200×675 | Diagram (flat infographic) | Three supply configurations (your-logo / ODM-brand / re-badged), each mapping via arrows to a single CRA role and to the party that must hold the technical file + declaration. Shapes/flow only, no legible text/logos. |
| 11 | `ep-4.06-hero.jpg` | 1200×630 | Hero (photo-real) | A small embedded sensor/PCB on a desk beside a slim folder of five tabbed documents at an industrial vendor-onboarding gate — the design is fine; the five-document folder is what gets a small vendor through the Tier-1 door. Muted blues/steel, amber accent, no text/logos. |
| 12 | `ep-4.06-kit.png` | 1200×675 | Diagram (flat infographic) | Five tabbed document cards feeding into a single onboarding "gate," each card a distinct shade of the muted palette with one amber accent. Shapes/flow only, no legible text/numbers. |

**Counts (Series 4):** 12 images — 6 photo-real heroes (1200×630) + 6 flat-infographic diagrams.

## Series 5 — Critical Sector Deep Dives

| # | Filename | Size (px) | Type | What it should show |
|---|----------|-----------|------|---------------------|
| 1 | `ep-5.01-hero.jpg` | 1200×630 | Hero (photo-real) | A data-hall electrical/cooling gallery — modular UPS cabinets, switchgear line-ups, PDU busway — as a calm, orderly critical-power estate. Muted deep-blue/steel, single amber accent, no text/logos. |
| 2 | `ep-5.01-default-core-important-shell.png` | 1200×800 | Diagram (flat infographic) | A large central block (power + cooling) = the default self-assessment tier, surrounded by a thin outer ring of network/security devices = the important tier, plus one small node marked critical. Shapes/flow only, no legible text. |
| 3 | `ep-5.02-hero.jpg` | 1200×630 | Hero (photo-real) | A commercial-building mechanical/plant room with a wall-mounted building-automation controller cabinet and field cabling; calm, trade-publication feel. No text/logos/screens. |
| 4 | `ep-5.02-market-date.png` | 1200×675 | Diagram (flat infographic) | A single horizontal boundary line = the deadline; an already-installed device sits left (outside the regulated zone), a newly placed unit sits right (crossing in). Shapes/arrows only, no legible text. |
| 5 | `ep-5.03-hero.jpg` | 1200×630 | Hero (photo-real) | An engineer at a substation HMI beside a rack of protective-relay IEDs, a 400kV gantry through the window, a laptop showing a pending firmware update. The live-line-vs-pending-patch tension. No legible text. |
| 6 | `ep-5.03-staged-deploy.png` | 1200×675 | Diagram (flat infographic) | A staged security-update flow — vendor advisory → digital-twin/bench pre-injection → patch the standby relay in a planned window → failover → repeat, the primary relay carrying protection throughout. Shapes/flow only, no text. |
| 7 | `ep-5.04-hero.jpg` | 1200×630 | Hero (photo-real) | An unmanned remote water pumping station enclosure in open countryside, cellular whip antenna on the cabinet, a chemical dosing skid visible inside. Overcast, utilitarian, no people. |
| 8 | `ep-5.04-split.png` | 1200×675 | Diagram (flat infographic) | A two-panel split — left: "RTU manufacturer — CRA duty on the product"; right: "water utility — NIS2 duty on the operation" — joined by a single arrow labelled "the purchase order." Shapes only, no legible text. |
| 9 | `ep-5.05-hero.jpg` | 1200×630 | Hero (photo-real) | An ETCS on-board unit and driver-machine interface in a modern train cab, a wayside signalling cabinet visible through the windscreen. The safety-vital core and connectivity layer sharing a cab. No legible text. |
| 10 | `ep-5.05-decoupled-architecture.png` | 1200×800 | Diagram (flat infographic) | A train-control product split into an inner authorised safety-vital enclave (frozen baseline) and an outer connectivity zone (radio, crypto, gateway, OTA update) separated by an enforced one-way boundary; security updates flow only into the outer zone. Shapes only, no text. |
| 11 | `ep-5.06-hero.jpg` | 1200×630 | Hero (photo-real) | A container terminal at the quay edge: a ship-to-shore gantry crane over a moored vessel, the water-line visually separating ship from shore. Factory-neutral, no legible branding. |
| 12 | `ep-5.06-scope-line.png` | 1200×675 | Diagram (flat infographic) | A vertical quayside line splitting a terminal into a water side (on-board marine equipment → wheelmark/2014-90-EU) and a land side (crane, straddle carrier, terminal PLC → CE/CRA), each routed to its conformity mark. Shapes/arrows only, no legible text. |
| 13 | `ep-5.07-hero.jpg` | 1200×630 | Hero (photo-real) | A bioreactor process skid and control cabinet/HMI in a pharmaceutical cleanroom, a maintenance tablet showing a software update in progress. Muted blues/steel, single amber accent, no text/logos. |
| 14 | `ep-5.07-scoped-validation.png` | 1200×675 | Diagram (flat infographic) | A system diagram where the patched component is ringed/highlighted and only the directly-connected functions are marked for re-validation, the rest of the validated system untouched — "scope to the blast radius, not the whole plant." Shapes/flow only, no text. |
| 15 | `ep-5.08-hero.jpg` | 1200×630 | Hero (photo-real) | An autonomous open-pit haul truck working a mine/construction bench in daylight dust, a public road with small passenger cars in the far background — same autonomy, different legal regime. No legible text. |
| 16 | `ep-5.08-regime-map.png` | 1200×675 | Diagram (flat infographic) | A single vertical divider — LEFT (out of CRA): road vehicle / Reg 2019/2144 → UN R155/R156; RIGHT (in CRA): off-road hauler, AGV/AMR, harvester, construction skid → CRA + Machinery Reg 2023/1230; bottom straddling the line: telematics/gateway takes the regime of the machine it's built into. Shapes only, no legible text. |

**Counts (Series 5):** 16 images — 8 photo-real heroes (1200×630) + 8 flat-infographic diagrams.
