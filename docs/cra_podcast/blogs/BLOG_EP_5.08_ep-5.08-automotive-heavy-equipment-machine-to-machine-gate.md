---
id: "EP_5.08"
canonical_code: "EP_5.08"
title: "Vehicle, Machine, or Product? Where the CRA Line Falls for AGVs and Off-Road Equipment"
subtitle: "A type-approved road vehicle is out of the CRA and under UN R155. An off-road hauler, an AGV, a harvester is not a road vehicle — so it stays in the CRA and picks up the Machinery Regulation too. This is how to place the line."
slug: "ep-5.08-automotive-heavy-equipment-machine-to-machine-gate"
series_id: 5
episode_number: 8
series: "Critical Sector Deep Dives"
target_persona: "Automotive Tier-1 Suppliers, Heavy Machinery Manufacturers (CAT, Komatsu, Volvo), Agricultural Tech Leads."
persona_category: "Plant CISOs & Asset Owners"
statutes: ["Article 2(2)(c)", "Recital 27"]
statutory_domain: "Scope & Exclusions (Article 2)"
difficulty: "Executive Policy"
key_metric: "Article 2(2)(c) exclusion"
read_time: "8 min read"
duration: "14:15"
audio_url: "https://oxot.ai/audio/cra_podcast/EP_5.08.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["Cyber Resilience Act", "Regulation (EU) 2024/2847", "Article 2(2)(c)", "UN R155", "type-approval Regulation 2019/2144", "Machinery Regulation 2023/1230", "AGV compliance", "off-road machinery"]
takeaways: ["Decide which regime governs a machine before you design its security", "Only Regulation (EU) 2019/2144 road vehicles leave the CRA; off-road machines do not", "AGVs, AMRs, harvesters and construction skids carry CRA plus the Machinery Regulation"]
---

# Vehicle, Machine, or Product? Where the CRA Line Falls for AGVs and Off-Road Equipment
*By Jim McKenney — Digital Product Security Consultant & Industrial OT Architect*

<!-- IMAGE-SLOT: ep-5.08-hero | 1600x900 | alt: "An autonomous haul truck working an open-pit site, with a public road and passenger cars visible far in the background" | caption: "Same autonomy stack, two legal universes: the hauler answers to the CRA, the car on the road behind it does not." -->

Put an autonomous haul truck on a mine bench and an autonomous delivery van on a motorway. Both perceive, plan, and drive with no one in the seat. Both run a machine-to-machine telematics gateway pushing position and health data to a fleet backend. From an engineering standpoint they are cousins. From a legal standpoint they live in different universes, and the boundary between those universes is the single most consequential decision you make before writing a line of a security case.

Guess wrong and you either build a full Cyber Resilience Act conformity file for a product that never needed one, or you ship a machine into the EU with no CE cybersecurity basis at all and discover the gap at a port inspection. So the first question is not "how do I comply." It is "which regime am I even in."

## The one clause that settles most of it

The Cyber Resilience Act, Regulation (EU) 2024/2847, does not try to govern everything with a data connection. It carves out a short, closed list of product families that other Union law already covers for cybersecurity. Road vehicles are on that list.

Article 2(2) is explicit:

> *"This Regulation does not apply to products with digital elements to which the following Union legal acts apply: (a) Regulation (EU) 2017/745; (b) Regulation (EU) 2017/746; (c) Regulation (EU) 2019/2144."*

Point (c) is the one that matters here. Regulation (EU) 2019/2144 is the EU's general vehicle safety and type-approval regime for motor vehicles and their systems. Recital 27 spells out why it earns the carve-out: 2019/2144 already imposes cybersecurity duties on vehicles, including a certified cybersecurity management system and lifecycle software-update controls, "in compliance with the applicable United Nations regulations," and it names the instrument directly: **UN Regulation No 155**. The recital concludes that products to which 2019/2144 applies "should not therefore be subject to" the CRA.

Read that as a handoff, not a gap. A type-approved road vehicle does not escape cybersecurity regulation. It is regulated somewhere else, by UN R155 and R156, through the type-approval authority instead of through CE self-declaration and market surveillance.

## UN R155 is not the CRA wearing a different badge

This is where teams get hurt, so say it plainly once. UN R155 is a UNECE regulation, administered through type-approval. The CRA is EU product law, administered through CE marking, technical documentation, and conformity assessment. They share a subject, cybersecurity of a moving connected machine, and almost nothing else. Different legal basis, different assessor, different evidence, different timelines.

You cannot take an R155 CSMS audit package and drop it into a CRA technical file, or the reverse, and call the boundary managed. If a given product is a 2019/2144 vehicle, you do R155 and you are out of the CRA for that product. If it is not, R155 is irrelevant to your EU market access and the CRA is not optional. There is no blended middle where you do a bit of each.

## The decision test

For any powered, connected machine you place on the EU market, walk these gates in order. The first "no" that stops the road-vehicle path drops you into the CRA.

1. **Is it type-approved as a road motor vehicle under Regulation (EU) 2019/2144?** That regime targets on-road categories: passenger cars, buses, goods vehicles, their trailers. If the machine is homologated under 2019/2144, it is excluded from the CRA by Article 2(2)(c), and UN R155/R156 govern its cybersecurity. Stop here.
2. **If not a 2019/2144 vehicle, does any other closed-list exclusion apply?** The Article 2(2) list is only three items long, with separately certified civil aviation carved out elsewhere in Article 2. Agricultural and forestry vehicles, and non-road mobile machinery, are type-approved under *different* frameworks that are not named in that list. A different type-approval is not the 2019/2144 exclusion. Being homologated somewhere does not remove you from the CRA.
3. **Does it have digital elements with a direct or indirect data connection?** An autonomous or telematics-equipped machine always does. That is the CRA's own scope trigger in Article 2(1).

If you clear gate 1 you are on the R155 road. If you fall through to gate 3 you are a CRA product with digital elements, and the machine almost certainly also sits under the EU Machinery Regulation. That second regime is adjacent law, so keep it in its own box.

> [!NOTE]
> **Adjacent regime — the Machinery Regulation (EU) 2023/1230.** Self-propelled and industrial machinery placed on the EU market is governed by the new Machinery Regulation, which replaces the old Machinery Directive 2006/42/EC and begins to apply from **20 January 2027**, roughly eleven months before CRA CE-marking obligations bite on **11 December 2027**. It carries its own essential health-and-safety requirements, including provisions on protection against corruption and on safety-related control software. Treat the specifics as counsel-verified: it sits *outside* the CRA statutory corpus, and its cyber-relevant clauses interact with, but do not substitute for, the CRA's Annex I requirements. The point for this post is only the boundary: an AGV or harvester answers to both, in parallel, not to UN R155.

## Running the fleet through the gates

- **Autonomous open-pit haul truck.** Never homologated for public roads; it works a private site. Gate 1 is a no. It is a CRA product with digital elements and a machine under 2023/1230. R155 does not reach it.
- **Warehouse AGV / AMR.** An industrial mobile robot is not a road vehicle under any reading. CRA plus Machinery Regulation, cleanly. The autonomy stack, the fleet controller, and the wireless conduit are all in CRA scope.
- **Self-propelled harvester or forestry machine.** Type-approved, yes, but under an agricultural-vehicle framework, not 2019/2144. Gate 1 fails, gate 2 does not rescue it: it stays a CRA product. This is the case ag-tech teams misfile most often, because "it's type-approved" feels like it should mean "it's exempt."
- **The telematics control unit as a bought-in component.** This is where the boundary bites Tier-1 suppliers hardest. The *same* gateway hardware can ship into a passenger car (its cybersecurity swept up under R155 through the vehicle's type-approval) and into a construction skid (a CRA component with its own obligations). One SKU, two regimes, decided entirely by what it gets built into.

That last point reframes the supplier's job. You are not choosing one compliance posture for a part. You are tracking, per customer and per integration, which regime the finished machine lands in, and making sure your evidence pack can feed whichever one applies.

## Harmonising across the line without erasing it

The instinct after all this is to build one telematics platform and one security case and reuse it everywhere. Do the first. Do not pretend the second collapses the boundary. Design the connectivity stack once: signed firmware, an SBOM, a coordinated disclosure channel, a hardened over-the-air update path, because good engineering is portable. Then let the *evidence* fork: R155 CSMS artefacts for the type-approved road-vehicle deliveries, a CRA Annex I technical file and EU Declaration of Conformity for the machinery deliveries. Same platform, two dossiers, two assessors. The shared substrate saves you money; the forked paperwork keeps you legal.

<!-- IMAGE-SLOT: ep-5.08-regime-map | 1400x900 | alt: "A boundary diagram splitting connected machines into road vehicles under Regulation 2019/2144 and UN R155 on one side, and off-road machinery, AGVs, AMRs and harvesters under the CRA plus Machinery Regulation 2023/1230 on the other" | caption: "The line, drawn once. Type-approval under 2019/2144 is the only gate that leaves the CRA." -->

## Where the line falls

Draw it once and keep it on the wall:

- **Left of the line, out of the CRA.** Anything type-approved as a road motor vehicle under Regulation (EU) 2019/2144: passenger cars, buses, goods vehicles, their trailers. Cybersecurity governed by **UN R155/R156**, through the type-approval authority. Article 2(2)(c) is your citation.
- **Right of the line, in the CRA.** Everything else that drives, lifts, harvests, or hauls with digital elements and a data connection and is *not* a 2019/2144 vehicle: off-road haulers, AGVs and AMRs, agricultural and forestry machines, construction skids, port and mining equipment. These carry the **CRA** and, in parallel, the **Machinery Regulation (EU) 2023/1230**.
- **On the line, the shared component.** A telematics or gateway unit takes the regime of the machine it is built into. Decide it per integration, not per part number.

One test settles it: type-approved under 2019/2144, or not. Everything downstream (R155 versus Annex I, type-approval authority versus notified body and market surveillance) follows from that single fact. Place the machine before you design the machine.
