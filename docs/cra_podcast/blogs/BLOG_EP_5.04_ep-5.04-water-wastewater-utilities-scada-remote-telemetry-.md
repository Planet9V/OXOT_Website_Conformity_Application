---
id: "EP_5.04"
canonical_code: "EP_5.04"
title: "Water Utilities: Buying CRA-Ready RTUs for Remote Pumping Stations"
subtitle: "A municipal water utility does not hold the CRA duty on a cellular RTU — the manufacturer does. Here is the procurement checklist that turns that duty into your evidence, and discharges your own NIS2 obligation."
slug: "ep-5.04-water-wastewater-utilities-scada-remote-telemetry-"
series_id: 5
episode_number: 4
series: "Critical Sector Deep Dives"
target_persona: "Municipal Water Engineers, SCADA Supervisors, Utility Directors."
persona_category: "Plant CISOs & Asset Owners"
statutes: ["Annex I", "Article 13", "NIS2 Article 21"]
statutory_domain: "Critical Sector — Water & Wastewater"
difficulty: "Procurement & Operations"
key_metric: "8-point RTU procurement checklist"
read_time: "8 min read"
duration: "14:15"
audio_url: "https://oxot.ai/audio/cra_podcast/EP_5.04.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["Cyber Resilience Act", "Regulation (EU) 2024/2847", "cellular RTU", "SCADA telemetry", "water utility cybersecurity", "NIS2 Article 21", "support period", "SBOM", "remote pumping station"]
takeaways: ["A cellular RTU or dosing controller is a product with digital elements: the manufacturer carries the CRA duties, not the utility that buys it", "The water utility is usually a NIS2 essential entity, and NIS2 Article 21 makes supplier security your problem — the way you discharge it is your purchase order", "Make the vendor write down the support-period end date (month and year) and prove secure remote access and encrypted telemetry before you sign, not after commissioning"]
---

# Water Utilities: Buying CRA-Ready RTUs for Remote Pumping Stations

*By Jim McKenney — Digital Product Security Consultant & Industrial OT Architect*

You are specifying cellular RTUs for two dozen unmanned pumping stations, and the tender is where your cybersecurity actually gets decided. Not in the SCADA room, not at the annual penetration test. In the purchase order. The control that matters most at a remote chemical-dosing station, the one that stops a stranger reaching in over the cellular link to move a chlorine setpoint, is a property the unit either shipped with or it did not. You cannot retrofit it from the operator side once the crate is open.

The Cyber Resilience Act changes what you are allowed to demand of an RTU vendor. NIS2 changes whether demanding it is optional. Between the two, a small water utility that never writes a line of firmware gains real leverage over the manufacturers it buys from. This post is that leverage written as a checklist.

<!-- IMAGE-SLOT: ep-5.04-hero | 1200x630 | alt: "An unmanned remote water pumping station enclosure with a cellular antenna and a chemical dosing skid, in open countryside." | caption: "The most important security decision for this station was made in the purchase order, not on site." -->

## Two laws, one purchase order: who owes what

Keep these separate in your head, because conflating them is how utilities waste a procurement cycle chasing the wrong party.

A cellular RTU, a telemetry gateway, a programmable dosing controller: each is a **product with digital elements**. Under the CRA, the cybersecurity duties on that product fall on its **manufacturer**, who must design it to the essential requirements in Annex I, run a risk assessment, commit to a support period, and CE-mark it. You install the box; you are not its manufacturer, and buying it does not make those product duties yours.

What you do carry is a duty of your own, under a different instrument. Drinking-water suppliers and wastewater undertakings sit among NIS2's sectors of high criticality; above the size thresholds you are almost certainly an **essential entity**. NIS2 Article 21 then obliges you to manage cybersecurity risk across the systems you operate, and one line of that duty is supply-chain security: the products you acquire and the practices of the vendors you acquire them from.

That is the hinge: you discharge much of your NIS2 supplier-risk duty by demanding that your RTU manufacturers meet their CRA obligation. The vendor's product duty becomes your procurement evidence, and the checklist below is how you collect it.

<!-- IMAGE-SLOT: ep-5.04-split | 1000x600 | alt: "Flat two-panel diagram: left panel 'RTU manufacturer — CRA duty on the product (Annex I, Article 13)', right panel 'Water utility — NIS2 Article 21 duty on the operation', an arrow labelled 'the purchase order' joining them." | caption: "Two instruments, two duty-holders. The purchase order is the joint between them." -->

## The procurement checklist: what to demand before you sign

Put these in the tender specification and the contract, not a post-award wish list. Each demand asks for evidence the vendor must already hold to place the product on the EU market legally. If they cannot produce it, that is your answer about the vendor.

| # | Demand | Evidence to require in the tender | Why it matters at a remote station |
|---|--------|-----------------------------------|-------------------------------------|
| 1 | CRA conformity | EU Declaration of Conformity and CE marking covering the RTU, its firmware, and any paired gateway | The vendor's signed claim that Annex I is met |
| 2 | Software bill of materials | A machine-readable SBOM (CycloneDX or SPDX), reissued per firmware release | Lets you check the firmware against vulnerability feeds yourself |
| 3 | Support-period end date | The end date stated as month and year, in writing, at time of purchase | A 15-year asset must not lose patches in year six |
| 4 | Secure update mechanism | Signed firmware images, authenticated delivery, ability to postpone but not to skip signing | A patch channel is a remote-access channel; it must not become the intrusion |
| 5 | Secure remote access | Per-device credentials, no shared or default passwords, MFA on the management path where feasible | This is the control that stops remote setpoint tampering |
| 6 | Encrypted telemetry | State-of-the-art encryption of commands and readings in transit over the cellular link | Dosing commands and level readings cross a public network |
| 7 | Vulnerability handling | A published disclosure policy and a monitored contact address that reaches a real person | When a flaw in your model is reported, someone answers |
| 8 | Secure-by-default and reset | Ships hardened, with a documented factory reset to a known-good state | You inherit a locked-down unit, not an open one |

Every row maps onto a manufacturer obligation the vendor already carries under the CRA. You do not need to cite clause numbers in a tender; you need the artefacts, and a contract term that makes late or absent delivery a default.

## The demand that actually stops dosing tampering

Rows 5 and 6 are the ones a water engineer should refuse to compromise on: they are the difference between a nuisance and a public-health incident. A dosing controller on a cellular modem at an unstaffed station is directly reachable if its remote-access design is weak. Someone who can authenticate as the device, or ride an unencrypted session, can move a chlorine or fluoride setpoint and let the change propagate before an alarm catches it.

The essential requirements already oblige the manufacturer to block unauthorised access through proper authentication and to protect data in transit with strong encryption. Your job in procurement is to turn those into acceptance tests. Make the vendor demonstrate that the unit ships with no shared default credential, that the management interface enforces per-device authentication, and that telemetry between the RTU and your SCADA head-end is encrypted end to end. Verify it on the bench at factory acceptance, before a single unit reaches a pole in a field. A property you confirmed on the bench is a property; a property in a datasheet is a hope.

## Make them write down the end date

Row 3 looks administrative and is the one vendors most often fudge. Article 13 sets a floor most water assets will outlast: the support period must be **at least five years**, unless the product is genuinely expected to serve for less. It also forces a specific act. The manufacturer must state the support-period end date, at least the month and the year, clearly and at the time of purchase.

Use that. A pumping-station RTU is a fifteen-to-twenty-year asset. A five-year floor means a unit you commission in 2028 may stop receiving security updates in 2033 while it keeps running until 2045. That gap is not the vendor's to solve for you; it is a risk you must see at the point of sale and plan around, by negotiating a longer support term, budgeting a mid-life firmware refresh, or adding network controls of your own. You cannot plan around a date nobody made the vendor write down. Get the month and year into the contract, per model, and track it as an asset attribute, the way you already track a pump's rebuild interval.

## "It's a low-power remote device" is not an exemption

Vendors of constrained field hardware sometimes wave away security requirements as impractical on a low-power unit. The regulation anticipated that. Annex I Part I applies its property list "on the basis of the cybersecurity risk assessment and where applicable." That phrase cuts two ways, and the second way protects you.

It means a manufacturer may, for a genuinely constrained device, decide through a documented risk assessment that a specific property does not apply, or applies differently. It does not license the manufacturer to skip a property because implementing it was inconvenient. The difference is written justification. So when a vendor says their remote unit cannot do X, the right response is not to accept the limitation and not to argue the engineering. It is to ask for the risk-assessment reasoning that says X does not apply, and to judge whether that reasoning holds for a device whose whole purpose is to sit on a public cellular network and actuate a chemical pump. A vendor who reasoned about it will show you the reasoning. A vendor who cut the corner will show you a brochure.

> [!NOTE]
> **Your own duty is a separate law. Keep it in its own box.**
> Everything above is you using the CRA, a *product* regulation, as a procurement lever. Your *operator* duty lives in NIS2, Directive (EU) 2022/2555, transposed into your national law. NIS2 **Article 21** requires essential entities to take appropriate and proportionate technical, operational and organisational measures on an all-hazards basis, and its list explicitly includes supply-chain security and security in the acquisition, development and maintenance of network and information systems. Buying CRA-conformant RTUs evidences the supply-chain line of that duty. Article 21 also covers incident handling, business continuity, backups, access control and cryptography across your whole operation, and none of that transfers to a vendor. The CRA makes your suppliers accountable for the box; NIS2 keeps you accountable for the network you plug it into. A good procurement checklist does not outsource the operator duty.

## What the RTU cannot do for you

A CRA-conformant RTU is a better starting point, not a finished defence. Two controls stay on your side of the fence regardless of how good the vendor is.

The first is your remote-access architecture. Even a unit with strong per-device authentication should sit behind a segmented path from your SCADA head-end, so a compromised field modem cannot reach a chlorination PLC across a flat network. The second is fail-safe dosing design: local, non-networked limits and hard-wired interlocks that no remote setpoint can override, so even a successful setpoint attack cannot drive the chemistry past a physically safe bound. Both are process-safety engineering, and both are yours to specify whether or not the RTU is perfect.

Buy the compliant box. Then build as if you might one day get a non-compliant one anyway.

If you want to turn this into a real tender, map each of the eight demands to the exact Annex I property and Article 13 clause it rests on, so your specification cites the obligation the vendor is already under. Pull the live text for Annex I and the Article 13 support duties in the [interactive CRA wiki](/wiki/cra), then walk your draft RTU specification against the statute in the [demo workspace](/demo) — and every demand on the list becomes a clause your vendor is already bound to meet.
