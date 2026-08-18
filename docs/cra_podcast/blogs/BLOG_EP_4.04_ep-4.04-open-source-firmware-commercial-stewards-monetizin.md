---
id: "EP_4.04"
canonical_code: "EP_4.04"
title: "Open Source and the CRA: When a Maintainer Becomes a \"Steward\" (and What That Actually Costs)"
subtitle: "A pure community project sits outside the regulation. A \"steward\" gets a lighter, tailored set of duties — not manufacturer duties. Here is where the line actually falls."
slug: "ep-4.04-open-source-firmware-commercial-stewards-monetizin"
series_id: 4
episode_number: 4
series: "Tier-2 Upstream Component Supplier Survival"
target_persona: "Open Source Maintainers, Free Software Foundations, Commercial FOSS Vendors (Zephyr, FreeRTOS, Linux Foundation)."
persona_category: "Procurement & Legal Counsel"
statutes: ["Article 24", "Article 3(14)", "Article 3(22)"]
statutory_domain: "Article 24 — Open-source software stewards"
difficulty: "Advanced Engineering"
key_metric: "Steward regime: Art 24 duties, not full manufacturer duties"
read_time: "8 min read"
duration: "14:15"
audio_url: "https://oxot.ai/audio/cra_podcast/EP_4.04.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-18"
keywords: ["Cyber Resilience Act", "Regulation (EU) 2024/2847", "open-source software steward", "Article 24", "free and open-source software", "making available on the market", "CE marking"]
takeaways: ["What the reduced steward duties under Article 24 actually are", "Where the commercial-activity line falls for open-source software", "Why a steward is not a manufacturer and cannot affix the CE marking"]
---

# Open Source and the CRA: When a Maintainer Becomes a "Steward" (and What That Actually Costs)
*By Jim McKenney — Digital Product Security Consultant & Industrial OT Architect*

The Cyber Resilience Act does not regulate open source. It regulates commercial activity. That one distinction settles about ninety percent of the panic I hear from maintainers — and it quietly creates a real obligation for a small group who assumed they were safe. Both halves of the community tend to get it backwards.

So let me walk the boundary the way the regulation actually draws it, in the order people ask.

<!-- IMAGE-SLOT: ep-4.04-hero | 1200x630 | alt: "A single line across an industrial floor separating a lone maintainer's workbench from a foundation's sustained-support infrastructure." | caption: "The CRA's dividing line is not 'is it open source' — it is 'is it made available on the market in the course of a commercial activity.'" -->

## Does the CRA apply to my open-source project?

For most projects: no. The obligations attach to a product "made available on the market," which the CRA defines as supply for distribution or use *in the course of a commercial activity*, whether you charge for it or give it away (Article 3(22)). A hobby project, a research release, a library you publish because you needed it and figured others might too — that is publishing, not placing a product on a market.

The recitals go out of their way to protect this. Free and open-source software that is *not monetised by its maintainers* is explicitly not a commercial activity. And the drafters closed the obvious loopholes before anyone could argue them:

- Taking donations or corporate sponsorship does not make you commercial.
- Having companies contribute code, or fund your work, does not make you commercial.
- Cutting regular, scheduled releases does not make you commercial.
- A not-for-profit that plows every euro after costs back into its mission is not, for this purpose, commercial.

Read that list against how open source actually gets funded and you will see the point: the money flowing *in* does not decide anything. What decides it is whether *you* supply a product into the market as a business. If you contribute source to a project that isn't under your responsibility, the regulation doesn't reach you at all.

## Then who is this "steward" everyone's worried about?

The steward is a genuinely new species in EU product law, and it exists to solve a specific problem: some open-source software is never "made available on the market" in the commercial sense, yet the whole economy depends on it. Think of the firmware kernels, RTOSes, and crypto libraries that vendors fold into products they *do* sell.

The CRA's answer is Article 3(14): an *open-source software steward* is a legal person — not a manufacturer — whose purpose is to systematically provide sustained support for the development of specific open-source products that are **intended for commercial activities**, and who keeps those products viable. The recitals name the archetypes plainly: certain foundations, and entities that develop and publish open-source software in a business context — including not-for-profits.

Two words carry the whole test. **Sustained** — you steer the project, host its infrastructure, govern its releases, keep it alive; a weekend of commits does not make you a steward. And **intended for commercial activities** — the software's destiny is to be integrated into products and services that other people monetise. Miss either half and you are not a steward. A foundation shepherding a widely-embedded RTOS is squarely inside the definition. A maintainer whose library happens to get used by a startup is not — the intent and the sustained-support role both have to be yours.

## Is a steward just a manufacturer with extra steps?

No — and this is the part worth getting exactly right, because the fear is that "steward" is a trapdoor into full manufacturer liability. It isn't. The recitals call the steward regime *light-touch and tailor-made*, built deliberately to fit how these organisations actually work.

<!-- IMAGE-SLOT: ep-4.04-line | 1000x620 | png | alt: "A horizontal spectrum from 'published, not on the market' through 'steward, light-touch regime' to 'manufacturer, full duties'." | caption: "One spectrum, two thresholds: publishing, sustained support for commercially-intended FOSS, and placing a monetised product on the market each sit in a different regime." -->

Here is what Article 24 actually asks of a steward:

1. **A documented, verifiable cybersecurity policy** — one that fosters secure development and effective vulnerability handling by the project's developers, encourages voluntary vulnerability reporting, and pushes information about discovered vulnerabilities out into the community. A policy. Written down. Not a full technical file per product.
2. **Cooperation with market surveillance authorities on request** — if an authority reasonably asks, you hand over that documentation in a language they can work with. There is no proactive filing, no conformity assessment, no notified body.
3. **Vulnerability reporting, but only to the extent you're actually involved** — the Article 14 reporting duties apply to a steward only insofar as it participates in the development, and the incident-reporting parts only where a severe incident hits infrastructure the steward itself provides.

That is the whole cost. Compare it to the manufacturer's world — Annex I essential requirements across the full lifecycle, a technical file, conformity assessment, CE marking, the support period, the actively-exploited-vulnerability clock. The steward carries none of that. A steward has no basis to affix the CE marking at all — it is not certifying a product against the essential requirements, so there is nothing for the mark to attest.

This is the opposite of "monetise your compliance." Being a steward is a *reduced* posture with a real but bounded cost: stand up a credible security policy, run coordinated disclosure, and be reachable when an authority calls.

## What about GitHub, package registries, and just hosting the code?

Merely hosting software on an open repository, a package manager, or a collaboration platform is not making it available on the market. A registry becomes a distributor only if it supplies software commercially — the act of hosting, by itself, carries no CRA duty. That protects the plumbing of open source, and it means the maintainer publishing to a package index has not thereby placed a product on the market.

## So when does someone actually pick up manufacturer duties?

When they build a product on top of the open source and sell it. The manufacturer definition includes anyone who markets a product under their own name or trademark — *whether for payment, monetisation, or free of charge* (Article 3(13)). The upstream project's licence, and the steward's light-touch status, do nothing to shield the downstream vendor. If you take Zephyr or FreeRTOS, harden it, and ship it inside a device you sell, you are the manufacturer of that device's digital elements. Full stop. And note the mirror-image rule for components: an open-source component supplied for integration by others counts as "made available on the market" only where the *original* maintainer monetises it — otherwise the duty lands squarely on the integrator who sells the finished product.

That is the clean mental model. Publishing is free. Sustained support for commercially-intended open source is a steward's light-touch regime. Selling a product is manufacturing. Three zones, two thresholds, and the money-and-name test tells you which side you're on.

## The named risk: the "we're just a steward" self-classification

The exposure I would flag to any commercial FOSS vendor is the *steward-status overreach* — the company that sells hardened builds, paid long-term support, and dual-licensed editions under its own brand, and then reaches for Article 24 as its ceiling of obligation. That is a misread. The moment you supply a monetised product with digital elements under your trademark, you are a manufacturer for that product, with the full Annex I set and CE marking on the line — and calling the parent foundation a "steward" does not travel down to the commercial subsidiary that ships the box. The organisations most likely to trip on this are exactly the ones sophisticated enough to think they've already solved it.

If your project sits anywhere near that line, map each legal entity to its role before an auditor does it for you. The [CRA reference in the wiki](/wiki/cra) lays out the steward duties and the manufacturer duties side by side so you can see which entity is standing where.
