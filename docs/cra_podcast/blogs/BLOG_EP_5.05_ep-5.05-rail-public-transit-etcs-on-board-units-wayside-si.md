---
id: "EP_5.05"
canonical_code: "EP_5.05"
title: "Rail: Reconciling Multi-Year Safety Approvals with the CRA's Vulnerability Clock"
subtitle: "A signalling safety case is authorised over years. The CRA's vulnerability-handling duty runs continuously. The reconciliation is architectural, not a waiver — decouple the safety-vital logic from the security-update layer so patches land where no authorisation lives."
slug: "ep-5.05-rail-public-transit-etcs-on-board-units-wayside-si"
series_id: 5
episode_number: 5
series: "Critical Sector Deep Dives"
target_persona: "Rolling Stock Manufacturers (Alstom, Siemens Mobility, Stadler), Railway Signalling Engineers."
persona_category: "Plant CISOs & Asset Owners"
statutes: ["Annex I", "Article 13", "Article 3(30)", "Recital 39"]
statutory_domain: "Vulnerability handling & support period"
difficulty: "Architecture & Policy"
key_metric: "Support-period exposure across a 30-year fleet"
read_time: "9 min read"
duration: "14:15"
audio_url: "https://oxot.ai/audio/cra_podcast/EP_5.05.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["Cyber Resilience Act", "Regulation (EU) 2024/2847", "ETCS", "railway signalling", "EN 50129", "vulnerability handling", "support period", "Recital 39"]
takeaways: ["Decouple safety-vital train-control logic from the comms and security-update layer so most patches never touch the authorised safety case", "Recital 39 means a pure security update is not a substantial modification — it does not reopen CE conformity", "Design the update path into the safety argument up front so routine security fixes are bounded changes, not re-authorisation triggers", "Article 13's support period must reflect a 30-year fleet life, not the five-year floor"]
---

# Rail: Reconciling Multi-Year Safety Approvals with the CRA's Vulnerability Clock
*By Jim McKenney — Digital Product Security Consultant & Industrial OT Architect*

Two clocks govern a modern signalling product, and they keep different time. The safety clock is slow and deliberate: an ETCS on-board unit or a wayside interlocking is argued through EN 5012x, assessed, and authorised over a span measured in years, precisely because you do not want the logic that keeps trains apart changing under you. The other clock is the one the Cyber Resilience Act just started. From the moment a product with digital elements is on the market, its manufacturer owes a continuous vulnerability-handling duty: find flaws, fix them without delay, ship security updates across a defined support period. When a fix is ready on Tuesday and the safety authorisation assumes the software you froze eighteen months ago, those two clocks appear to collide.

The reconciliation is not a waiver, and there is no rail exemption to hide behind. It is architecture.

<!-- IMAGE-SLOT: ep-5.05-hero | 1600x900 | alt: "An ETCS on-board unit and driver-machine interface in a modern train cab, with a wayside signalling cabinet visible through the windscreen" | caption: "The safety-vital core and the connectivity layer share a cab. The CRA cares mostly about the second one." -->

## Rail is in scope, and the near-misses prove it

The first thing to settle is whether the CRA reaches rail at all, because the sector's instinct is to assume its own safety regime crowds everything else out. Read Article 2 and the pattern is unambiguous. The Regulation carves out specific neighbouring sectors by name: medical devices, in-vitro diagnostics, type-approved motor vehicles under Regulation (EU) 2019/2144, civil aviation products certified under the EASA basic regulation, and marine equipment under Directive 2014/90/EU. Aviation, automotive, and maritime each negotiated a sector exclusion. Rail did not. An ETCS on-board unit, a balise transmission module, a train-control gateway, a communications-based train-control radio. Each is a product with a logical or physical data connection, and none of them sits inside an Article 2 exclusion. They carry the full Annex I weight like any other product with digital elements.

So the question is not whether the vulnerability duty applies. It does. The question is how it coexists with a safety case that took years to build.

## Two regimes, two clocks — keep them in separate boxes

The single most expensive mistake here is treating the railway safety regime as if it were CRA law, or vice versa. They are different bodies of obligation with different owners, different assessors, and different failure consequences. Separate them cleanly before you design anything.

| | Railway safety regime | Cyber Resilience Act |
|---|---|---|
| **What it governs** | Whether the train-control function is safe (won't cause a collision or derailment) | Whether the product is secure and its vulnerabilities are handled |
| **Core instruments** | EN 50126 / 50128 / 50129, the TSI, ERA authorisation, CSM-RA | Annex I essential requirements, Article 13, Article 14 reporting |
| **Cadence** | Slow, front-loaded: authorise once, hold the baseline | Continuous: handle vulnerabilities across the support period |
| **Who assesses** | Notified/assessment bodies, national safety authorities, ERA | Self-assessment or a CRA notified body, depending on class |

> [!NOTE]
> **Quarantine: the safety standards are not CRA obligations.** EN 50126 (RAMS), EN 50128 (software for railway control), and EN 50129 (safety-related electronic systems for signalling), together with the relevant TSI, the EU Agency for Railways vehicle and trackside authorisation, and the Common Safety Method for Risk Assessment (Regulation (EU) 402/2013, the CSM-RA), are a separate legal and standards stack. Nothing in this post asks a notified body to certify your safety case against the CRA, and nothing asks a railway safety assessor to sign off your SBOM. The CRA argument below stands entirely on CRA text. The safety standards appear only to show where the two regimes touch, and where good architecture keeps them apart.

## Where the collision actually happens

The mechanism is narrower than the fear suggests, so state it precisely. A security update disturbs a safety authorisation only if it changes software that lives inside the authorised safety boundary. Under EN 50129, that boundary is where the safety argument's independence claims live: the vital logic that computes braking curves, enforces movement authorities, and holds the fail-safe state. Touch that code and, yes, you may owe an impact analysis and possibly a re-assessment.

Most security-relevant code does not live there. The attack surface on a train-control system is overwhelmingly the connectivity layer: the radio stack, the key management and cryptography, the gateway that bridges the onboard world to trackside and to the operator's back office, the diagnostic and over-the-air update channels. That is where CVEs land. And that is code you can update without reaching into the vital core — if, and only if, you built the two as separable modules in the first place.

## The relief the CRA already wrote in

Before the architecture, the legal point that justifies the effort. A pure security update does not reopen your CE conformity. Recital 39 is explicit: where a security update is designed to decrease a product's cybersecurity risk and does not modify its intended purpose, it is not a substantial modification. Article 3(30) defines substantial modification narrowly, and a fix that closes a known vulnerability without adding features or broadening the attack surface falls outside it. So applying a signed patch to the comms module does not re-trigger the CRA conformity process, exactly as it does not on a protective relay. The full mechanics of that carve-out are worked through in [patching the grid](/blog/ep-5.03-power-grids-renewable-substation-automation-iec-61), and they transfer directly to rail.

Annex I goes further and effectively tells you how to build for this. Part II of the essential requirements says that, where technically feasible, security updates must be provided *separately* from functionality updates. The Regulation is not neutral about your architecture. It wants the security fix to be a discrete, shippable thing that does not drag a feature change along with it. On a signalling product, "technically feasible" is a design decision you make years earlier, at the boundary between vital and non-vital.

## The architecture: decouple, then segment

<!-- IMAGE-SLOT: ep-5.05-decoupled-architecture | 1200x900 | alt: "A flat infographic showing a train-control product split into two zones: an inner authorised safety-vital enclave (EVC, interlocking logic, SIL-4, frozen baseline) and an outer connectivity zone (radio, cryptography, key management, gateway, OTA update) separated by an enforced one-way boundary, with CRA security updates flowing only into the outer zone" | caption: "Security updates land in the connectivity zone. The authorised vital enclave never sees them, so the safety case holds." -->

Three moves turn the tension into a solved problem.

First, **partition the product by authorisation, not by function.** The vital computation (the European Vital Computer in an ETCS on-board unit, the interlocking logic wayside) sits in an enclave whose baseline is frozen and whose independence from everything around it is what the EN 50129 argument sets out to prove. The radio, the crypto, the key store, the gateway, and the update agent sit outside it. The interface between the two is narrow, defined, and itself part of the safety argument, so that a compromise or a change on the connectivity side is demonstrably incapable of driving the vital side out of its safe state.

Second, **route every CRA security update into the outer zone.** When the fix touches only connectivity code, it changes nothing inside the authorised boundary, so the safety case does not reopen and Recital 39 keeps it clear of substantial modification. You get to ship the patch without a re-authorisation, and you get to prove why.

Third, **segment the onboard network so the partition is real, not notional.** The vital train-control bus and the connectivity network are separate zones with a controlled conduit between them, so that a compromised field radio cannot reach the vital bus. This is standard IEC 62443 zone-and-conduit engineering, and it is what makes the independence claim in your safety argument survive contact with an actual attacker rather than an audit checklist.

There is a matching move on the safety side, and it belongs in its own box because it is railway law, not CRA. Under the CSM-RA, a bounded, pre-analysed change can be handled as non-significant and stay clear of full re-authorisation. If you write the security-update path into the safety case at design time, declaring the connectivity module's update mechanism as a managed, impact-assessed change, routine patches ride a lane you already cleared with the safety authority. Recital 39 keeps the patch out of CRA re-conformity; a well-drafted change-management case keeps it out of railway re-authorisation. Same architecture, two regimes, both satisfied.

## The clock the CRA sets, and the one your fleet sets

One number deserves attention before you close the file. The CRA's support period under Article 13 defaults to a minimum of five years, but that floor is not your answer. The Regulation ties the support period to how long the product is reasonably expected to be in use. A metro fleet or a mainline signalling installation is in service for thirty years or more. Your obligation to handle vulnerabilities and ship security updates should be scoped to that service life, and your contracts, spares strategy, and cryptographic agility need to assume you are maintaining a secure update capability decades after the last unit leaves the factory. Price that in at bid time, because a competitor who scoped to five years underbid a duty they still owe.

Design the split once, at the point where the safety boundary is drawn, and the two clocks stop colliding: the slow one guards the logic that keeps trains apart, and the fast one runs entirely in the layer built to be changed.
