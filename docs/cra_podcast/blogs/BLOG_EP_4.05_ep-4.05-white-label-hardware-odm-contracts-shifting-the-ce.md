---
id: "EP_4.05"
canonical_code: "EP_4.05"
title: "White-Label & ODM Hardware: Whose Name on the Box, Whose Technical File"
subtitle: "An Asian ODM builds hardware sold under an EU automation brand. Who is the legal manufacturer, and who must keep the technical file for at least 10 years?"
slug: "ep-4.05-white-label-hardware-odm-contracts-shifting-the-ce"
series_id: 4
episode_number: 5
series: "Tier-2 Upstream Component Supplier Survival"
target_persona: "ODM Manufacturers, Hardware Importers, Private-Label Automation Brands."
persona_category: "EPC & Integrators"
statutes: ["Article 3(13)", "Article 21", "Article 28"]
statutory_domain: "Tier-2 Embedded Systems"
difficulty: "Advanced Engineering"
key_metric: "Manufacturer status · Art 3(13)"
read_time: "7 min read"
duration: "14:15"
audio_url: "https://oxot.ai/audio/cra_podcast/EP_4.05.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["Cyber Resilience Act", "Regulation (EU) 2024/2847", "white-label hardware", "ODM contracts", "Article 3(13) manufacturer", "technical documentation retention", "CE marking"]
takeaways: ["ODM master-service-agreement terms that source the evidence you must hold", "technical-file delivery and escrow", "audit-right and vulnerability-flow provisions"]
---

# White-Label & ODM Hardware: Whose Name on the Box, Whose Technical File
*By Jim McKenney — Digital Product Security Consultant & Industrial OT Architect*

> **Executive Technical Memorandum**
> - **Statutory spine:** `Article 3(13)` (manufacturer definition) → `Article 21` (deemed manufacturer) → `Article 28` (EU Declaration of Conformity)
> - **Primary persona:** ODM manufacturers, hardware importers, private-label automation brands
> - **Curriculum track:** Tier-2 Upstream Component Supplier Survival (Track 4)
> - **The decision this post settles:** who is the *manufacturer* when the hardware is built offshore and sold under an EU logo

---

A distributor in Munich buys a finished edge gateway from a Shenzhen ODM, prints its own logo on the enclosure, writes the datasheet, and sells it across the EU as a flagship product. Under the Cyber Resilience Act, one question decides who carries the compliance weight — and it is not "who designed it" or "who soldered the chips."

It is whose name is on the box. If that name is yours, you are the manufacturer. Not a reseller, not a "brand partner," not a pass-through. The manufacturer, with the full obligation set and a technical file you have to defend to a market-surveillance authority years after the last unit shipped.

<!-- IMAGE-SLOT: ep-4.05-hero | 1200x630 | alt: "A branded industrial edge-gateway enclosure on a loading dock, factory-neutral, no visible logos or text." | caption: "The nameplate is the legal event. Everything upstream of it is procurement." -->

## The definition does all the work

Most of the confusion here dissolves the moment you read the actual definition rather than the sales narrative. Under **Article 3(13)**, a manufacturer is a person who develops or manufactures products with digital elements — *or* who has them designed, developed, or manufactured — and markets them under its own name or trademark, whether for payment or free of charge.

The second half of that sentence is the one white-label brands walk into. You never touched a soldering iron. You commissioned a design, took delivery of finished hardware, and put your trademark on the output. That is manufacturing, exactly as the regulation defines it. The full definition text lives in the [CRA wiki](/wiki/cra) if you want to read it cold.

Read it that way and the ODM contract changes character. It stops being a mechanism to hand the duty offshore — it can't do that — and becomes the mechanism by which you *source the evidence* you now have to hold.

## Whose name on the box — the fork

Two configurations show up in real deals, and they land in different places.

**Your trademark on the enclosure.** You are the manufacturer under Article 3(13). The ODM is your supplier; it never places that product on the EU market under its own name, so it carries no EU operator duty for those units. Notice what this also does: it can erase the *importer* role entirely. The importer role in the CRA only exists for a product that bears the name of a company established outside the Union. Your logo removed that name, so there may be no importer in the legal sense at all — the whole weight sits on you as manufacturer.

**The ODM's brand stays on the box and you only move the units.** Now you are a distributor or importer, and a narrower duty set applies: check that the manufacturer did the conformity work, confirm the CE marking and declaration are present, keep your own contact details on the packaging. But the instant you re-badge that product under your own mark — or substantially change it — **Article 21** deems you the manufacturer anyway, subject to the full manufacturer obligations. Re-labelling is not a loophole; it is the trigger.

| Configuration | Your CRA role | Who holds the technical file + declaration |
|---|---|---|
| Your logo on the box, ODM builds to your spec | Manufacturer | **You** |
| ODM's brand on the box, you only distribute | Distributor / importer | The ODM (via an EU authorised representative) |
| ODM's product, you re-badge or materially modify it | **Deemed manufacturer (Art 21)** | **You** |

<!-- IMAGE-SLOT: ep-4.05-roles | 1200x675 | alt: "Flat infographic mapping three supply configurations to a single CRA role and to the party that must hold the technical file. Shapes and arrows only, no legible text." | caption: "The nameplate, not the factory, assigns the role." -->

## What you own and cannot sign away

Once you are the manufacturer, three things attach to you that no clause in the ODM agreement can relocate.

The **technical documentation** — the design record, the cybersecurity risk assessment, the SBOM, the test evidence. It has to exist before the product is placed on the market and be kept available for at least ten years, or the entire support period if that runs longer. The ODM can produce most of it. You have to hold it and put it in front of an authority on request. "Our factory has that on file in Guangdong" is not compliance.

The **EU Declaration of Conformity** (**Article 28**). When you draw it up, you personally assume responsibility for the product's conformity. That document has no "our supplier assured us" defence written into it — signing it *is* taking the responsibility.

The **CE marking**, affixed before the product goes on the market. The mark is your assertion, under your name, that the product meets the essential requirements. It is not the factory's stamp; it is yours.

There is a mirror case worth naming. Sometimes the ODM wants to stand as the manufacturer itself — usually to sell one design to several EU brands. Because it is established outside the Union, it then needs an EU-based **authorised representative** under a written mandate to keep the declaration and documentation available inside the market. That is a different deal structure, and you want to know which one you are signing before anyone affixes a CE mark.

## What actually goes in the ODM agreement

Because the duty can't be delegated, the master service agreement has exactly one job worth optimising: guarantee that you can *obtain and defend the evidence* the law expects a manufacturer to hold. The clauses that earn their place:

- **Technical-file delivery, with escrow.** Contract for the complete technical dossier as a named deliverable in your possession — not "available on request from the factory." Put a copy in escrow so an ODM bankruptcy or a soured relationship never strands you without the file you are legally required to hold for a decade.
- **SBOM as a standing deliverable.** A machine-readable bill of materials for every firmware release, refreshed whenever the ODM patches. Your vulnerability-handling duty runs on knowing exactly what is inside the box you branded.
- **A vulnerability-flow SLA pointing back at you.** When the ODM learns of a flaw in the design, you need it fast enough to meet your own reporting clock. Silence upstream becomes your violation downstream.
- **Audit rights.** The right to inspect the ODM's development and build process — the same evidence a notified body or a market-surveillance authority would ask *you* to produce — not merely to receive its assurances.
- **Change control.** Written notice before any design or component substitution, so a quiet BOM swap on the factory floor doesn't silently invalidate the technical file you already signed against.

None of these move the legal duty off you. They make holding it survivable. Mapping each deliverable to the specific obligation it discharges is the exercise the [conformity workspace](/demo) is built to walk through.

Whoever's name is on the box owns the file, owns the declaration, and owns the consequences — and you already printed the name.
