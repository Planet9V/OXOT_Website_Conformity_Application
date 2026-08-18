---
id: "EP_5.06"
canonical_code: "EP_5.06"
title: "Maritime & Ports: Where the CRA Stops and Marine-Equipment Law Begins"
subtitle: "The Cyber Resilience Act carves out equipment covered by the Marine Equipment Directive (2014/90/EU). It does not carve out the quay crane. Here is the scope line for marine and port automation."
slug: "ep-5.06-maritime-port-automation-shipboard-integrated-brid"
series_id: 5
episode_number: 6
series: "Critical Sector Deep Dives"
target_persona: "Shipyards, Port Terminal Operators (Rotterdam, Antwerp, Hamburg), Marine Systems Integrators."
persona_category: "EPC & Integrators"
statutes: ["Article 2(4)", "Article 2(1)", "Article 2(5)"]
statutory_domain: "Scope & Exclusions (Article 2)"
difficulty: "Executive Policy"
key_metric: "Scope boundary · Art 2(4)"
read_time: "8 min read"
duration: "14:15"
audio_url: "https://oxot.ai/audio/cra_podcast/EP_5.06.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["Cyber Resilience Act", "Regulation (EU) 2024/2847", "Marine Equipment Directive", "Directive 2014/90/EU", "port automation CRA scope", "ship-to-shore crane cybersecurity", "Article 2 exclusions"]
takeaways: ["The 2014/90/EU carve-out vs. port-crane scope", "PLC security architecture for terminal automation", "supply-chain compliance for in-scope marine kit"]
---

# Maritime & Ports: Where the CRA Stops and Marine-Equipment Law Begins
*By Jim McKenney — Digital Product Security Consultant & Industrial OT Architect*

The Cyber Resilience Act draws a line, and on a container terminal that line runs down the quayside. Water side: a ship's type-approved bridge can sit entirely outside the regulation. Land side: the ship-to-shore crane that unloads that same vessel is a product with digital elements, squarely inside it. Same terminal, same afternoon, two regimes. The seam between them is one sentence in Article 2, and most maritime buyers are on the wrong side of it in their heads.

The reflex answer in the industry is that ships live under IMO and classification-society rules, so "the CRA is someone else's problem." That reflex is half right and half a compliance gap you will own. Let me walk the boundary the way I walk it in a scoping session, box by box.

<!-- IMAGE-SLOT: ep-5.06-hero | 1200x630 | alt: "A container terminal at the quay edge: a ship-to-shore crane over a moored vessel, the water-line separating ship from shore. Factory-neutral, no legible branding." | caption: "The scope line is physical here. On-board marine equipment on one side, terminal automation on the other." -->

## Is a ship's certified bridge in CRA scope?

Often, no. If the equipment falls under the Marine Equipment Directive, the CRA steps aside for it. The regulation says so directly. Article 2(4):

> "This Regulation does not apply to equipment that falls within the scope of Directive 2014/90/EU of the European Parliament and of the Council."

Directive 2014/90/EU is the Marine Equipment Directive, the MED. It governs the navigation, radio-communication, and safety equipment placed on board EU-flagged ships, and it carries its own EU conformity regime: the "wheelmark" instead of the CE mark, its own module-based assessment, its own surveillance. When a piece of shipboard kit is approved and marked under the MED, it already sits inside a Union conformity framework. The CRA does not stack a second one on top. The carve-out is clean and it is unconditional for equipment genuinely within the MED's scope.

So a MED-approved integrated bridge, a wheelmarked radar, a type-approved AIS transponder — for those, the CRA answer is: not this regulation. That is a real exemption, written into the statute, and you should claim it where it applies.

## Why is the quay crane treated differently?

Because it is not marine equipment. The MED covers equipment *placed on board a ship*. A ship-to-shore gantry crane is bolted to the quay. A straddle carrier drives around a yard. The terminal PLCs, the Terminal Operating System, the wireless telemetry, the remote-operation shore desk — none of that is on board anything. None of it is within the scope of 2014/90/EU, so Article 2(4) never reaches it.

That kicks these products back to the default rule. Under Article 2(1), the CRA applies to any product with digital elements whose intended or foreseeable use includes a data connection to a device or network. A modern automated crane is nothing but that: a networked control system with firmware, remote links, and a maintenance channel. It is in scope, with the full manufacturer obligation set behind it — secure-by-design duties, a technical file, vulnerability handling, and a CE mark by the general application date of 11 December 2027.

This is the part that surprises terminal operators. The most safety-critical, most autonomous, most obviously "maritime" machine on your site is, in CRA terms, an industrial product like any other on the market. Its neighborhood is water. Its legal regime is not.

## What about the grey middle — dual-use navigation gear?

This is where scoping earns its fee. Some equipment could plausibly go either way: a GNSS receiver, a network switch, a radar module sold both as shipboard kit and as shore-side infrastructure. The test is never "does it touch the sea." The test is narrow and literal: **does this specific product fall within the scope of Directive 2014/90/EU?**

If the SKU is on the MED equipment list and placed on board under MED conformity, it is carved out. If the same class of hardware is sold shore-side, or sits off the MED list, the carve-out does not apply and you are back under the CRA. Two physically identical boxes can land in different regimes depending on how and where they are placed on the market. Resolve this per SKU, against the MED list, not by category intuition.

Article 2(5) is the pressure valve for everything the named carve-outs do not cover. It lets the Commission, by delegated act, limit or exclude the CRA for products already under sectoral rules, but only where the exclusion fits the wider regulatory framework and those rules reach the same or a higher level of protection, and only once the Commission has actually made that call (Recital 28). Until a delegated act names your product, an aspiration toward "equivalent" sector coverage is not an exemption. The safe default for anything in the grey middle is: assume CRA applies unless a specific carve-out like Article 2(4) plainly catches it.

| Asset on the terminal | Governing regime | Conformity mark |
|---|---|---|
| MED-listed on-board bridge / radar / AIS | Marine Equipment Directive 2014/90/EU (CRA carved out by Art 2(4)) | Wheelmark |
| Ship-to-shore crane, straddle carrier, terminal PLC, TOS, shore desk | Cyber Resilience Act (Art 2(1)) | CE |
| Dual-use nav/network gear | Depends on placement: MED if on-board & listed, else CRA | Wheelmark **or** CE — verify per SKU |

<!-- IMAGE-SLOT: ep-5.06-scope-line | 1200x675 | alt: "Flat infographic: a vertical quayside line splitting a terminal into a water side labelled with on-board marine equipment and a land side labelled with crane and PLC automation, each side routed to a different conformity mark. Shapes and arrows only, no legible text." | caption: "Place the box before you pick the regime. Placement decides the mark." -->

> [!NOTE]
> **Not EU CRA — quarantine these.** IACS Unified Requirements E26 and E27 (cyber resilience of ships and of on-board systems) and IMO Resolution MSC.428(98) are international and classification-society rules. They attach to the vessel and its class certificate, not to placing a product on the EU single market. They neither discharge a CRA obligation nor are discharged by one. Meeting E26/E27 does not make an in-scope crane CRA-compliant, and a CE-marked crane is not thereby class-approved. Treat them as parallel tracks and do not map one onto the other as if the compliance transfers.

## So what do you build for the kit that is in scope?

Once the crane and its control stack are inside the CRA, the engineering is ordinary industrial product security, done properly.

The control architecture carries most of the weight. Segment the crane and terminal control network away from the corporate and internet zones so the remote-operation desk and the maintenance channel are not a flat path to the drives. Put authenticated, signed firmware on the terminal PLCs and the crane controllers, so an unsigned image does not boot. Instrument the remote link with real authentication and logging, because a shore desk that can move forty tonnes is exactly the surface an attacker wants.

The supply chain carries the rest. You almost never build the whole machine. A crane-control vendor, a drive manufacturer, a DP-system supplier all sit upstream of you, and their firmware is your attack surface. Whoever's name is on the product is the manufacturer that must hold the technical file and run vulnerability handling for it, so the contract with each upstream vendor has one job: guarantee you can obtain and defend that evidence. A standing SBOM per firmware release, a vulnerability-disclosure SLA that lets you meet your own reporting clock, and change notice before any silent BOM swap. None of that moves the duty off you; it makes holding it survivable. The [conformity workspace](/demo) maps each vendor deliverable to the obligation it discharges.

## The decision rule

Walk your terminal SKU by SKU and apply one test at each box:

**If it is type-approved on-board marine equipment, file it under 2014/90/EU and leave it alone. If it lives on the quay, in the yard, or on the shore desk, treat it as a CRA product and open the technical file now. When you cannot tell which, assume CRA until the MED list or a delegated act proves otherwise.**
