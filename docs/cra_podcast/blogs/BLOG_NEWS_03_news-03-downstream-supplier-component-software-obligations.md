---
id: "NEWS_03"
canonical_code: "NEWS_03"
title: "Your Customer's CRA Deadline Just Became Your Contract Term: What Component & Software Suppliers Must Deliver"
subtitle: "The manufacturer who CE-marks the finished product owns your component's security. In 2027 that duty reaches you as a purchase-order clause. Here is what the CRA actually forces down the chain, and what is only leverage."
slug: "news-03-downstream-supplier-component-software-obligations"
series_id: 9
episode_number: 3
series: "The CRA Briefing (News & Policy)"
target_persona: "Component makers, software-library and RTOS vendors, chip and SDK suppliers selling into EU product manufacturers."
persona_category: "News & Policy"
statutes: ["Article 13", "Article 13(6)", "Annex I Part II"]
statutory_domain: "Supply-Chain Flow-Down"
difficulty: "Briefing"
key_metric: "One reachable maintainer, one SBOM per release, one support horizon"
read_time: "3 min read"
duration: "2:40"
audio_url: "https://oxot.ai/audio/cra_podcast/NEWS_03.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["Cyber Resilience Act", "Regulation (EU) 2024/2847", "component supplier", "SBOM", "vulnerability disclosure SLA", "contractual flow-down", "Article 13", "Annex I Part II", "support period", "Tier-2 supplier"]
takeaways: ["Why the OEM's 2027 CRA liability lands on you as a supply-contract clause, not a regulator letter", "Which supplier deliverables the CRA actually requires versus which are pure commercial leverage", "The three things to put in a supplier security packet before your next contract renewal"]
---

# Your Customer's CRA Deadline Just Became Your Contract Term: What Component & Software Suppliers Must Deliver

*By Jim McKenney — Digital Product Security Consultant & Industrial OT Architect*

Your customer's 2027 Cyber Resilience Act deadline is not staying on your customer's side of the table. It arrives at your company as a clause in the next supply contract, and most component makers have not read it yet.

Here is the mechanism. The manufacturer who affixes the CE mark to a finished product carries the security of everything inside it, including your microcontroller, your RTOS, your library. [Article 13](/wiki/cra) makes that manufacturer exercise due diligence over the third-party components it integrates, and Annex I obliges it to keep those components patched across the product's declared support period. When the CRA applies in full on 11 December 2027, an OEM that ships a CE-marked device is answerable for an unpatched flaw in your code the same way it is answerable for its own, with exposure reaching €15 million or 2.5% of worldwide turnover. So the OEM does the only rational thing with that liability: it converts it into your contractual obligation and pushes it down the chain.

<!-- IMAGE-SLOT: news-03-flowdown | 1200x630 | alt: "A single CE-marked finished product at the top, with three obligation arrows flowing downward into a row of component-supplier boxes labelled SBOM, disclosure contact, and support horizon" | caption: "The OEM's statutory duty at the top becomes contract clauses at the bottom. The regulator writes to the manufacturer; the manufacturer writes to you." -->

## What the CRA forces down the chain, and what is only leverage

If you sell components into EU products, you are about to receive vendor security requirements that read like law. Some of them trace directly to the statute. Some are your buyer's commercial preference dressed up as a mandate. Knowing which is which tells you where you have room to negotiate.

**A component-scoped SBOM.** Annex I, Part II(1) requires the manufacturer to draw up a software bill of materials "in a commonly used and machine-readable format covering at the very least the top-level dependencies." That duty sits on the OEM, so the OEM asks you for the piece it cannot see: the bill for your component. Note what the statute does not say. It does not name CycloneDX or SPDX. Those are the two formats the industrial supply chain has standardized on, and your buyer's ingestion pipeline is built to parse one of them, but the "validated CycloneDX or no bid" line is a procurement rule, not the law. The exception matters: if you place your component on the market on its own, the CRA treats you as its manufacturer, and the SBOM becomes your own statutory duty rather than a contractual favor. That reframing is the whole survival question for embedded suppliers, and it is worked through in [the Tier-2 dilemma](/blog/ep-4.01-the-tier-2-dilemma-how-embedded-board-makers-survi). For how to emit a file a Tier-1 will accept off your existing build, see [generating an SBOM buyers accept](/blog/ep-4.02-generating-sboms-that-satisfy-tier-1-oems-cycloned).

**A monitored disclosure contact.** Article 13(6) requires a manufacturer, on finding a vulnerability in an integrated component, to report it to the person or entity maintaining that component. For your buyer to comply, someone at your company has to be reachable and able to act. That reachable-maintainer role is the real, statute-backed requirement. The 24-hour notification SLA your buyer wants attached to it is not from the CRA's text; it is a commercial term. Agree to a clock you can actually hold, and staff the inbox behind it.

**A change and end-of-life notice.** The OEM has to set a support period and handle vulnerabilities across it. It cannot honor a horizon it cannot see, so it needs to know how long you will maintain your component and when a change or discontinuation is coming. This one is flow-down by necessity. The specific number of years is negotiated, not a fixed statutory floor for components, so commit to a horizon you can fund.

## What to put in the supplier packet

Before your next contract renewal, assemble three things and hand them over as a set:

1. **An SBOM per release**, covering at least your top-level dependencies, in the format your buyer's pipeline ingests.
2. **A named, monitored security contact** with a published disclosure process and a response SLA you can meet, so an inbound vulnerability report reaches a human who can act on it.
3. **A support and EOL statement** per component, with a defined channel for notifying customers of a substantive change.

None of this requires new law-firm engagements. It requires deciding, once, what you can commit to, and writing it down before a buyer writes it for you. To see an SBOM generated, hashed, and filed into a conformity technical file against a live product, [walk through the platform demo](/demo).

The suppliers who show up to 2027 with that packet in hand will keep their design wins. The ones who treat the security clause as boilerplate will discover it is a specification the day an OEM audits against it. Read your next supply agreement the way your customer's compliance team already reads it: as a spec you have to build to, not a formality you sign under.
