---
id: "EP_3.04"
canonical_code: "EP_3.04"
title: "Streaming Legacy PLC Telemetry to the Cloud Without Pulling the Plant Into Scope"
subtitle: "One worked integration — a pre-2027 S7-300 line to an edge broker to the cloud — and exactly where the CRA scope boundary falls."
slug: "ep-3.04-legacy-brownfield-integration-connecting-pre-2027-"
series_id: 3
episode_number: 4
series: "Brownfield OT, Spare Parts & Maintenance"
target_persona: "Cloud OT Engineers, Digital Transformation Directors, Industry 4.0 Leads."
persona_category: "Plant CISOs & Asset Owners"
statutes: ["Article 2", "Article 3", "Article 14", "Article 69", "Annex I"]
statutory_domain: "Brownfield & Legacy OT"
difficulty: "Architecture"
key_metric: "Scope boundary"
read_time: "8 min read"
duration: "14:15"
audio_url: "https://oxot.ai/audio/cra_podcast/EP_3.04.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-18"
keywords: ["Cyber Resilience Act", "Regulation (EU) 2024/2847", "legacy PLC telemetry", "edge broker", "data diode", "substantial modification", "remote data processing", "brownfield OT"]
takeaways: ["A read-only unidirectional tap does not substantially modify a grandfathered PLC", "The edge gateway you add after 11 Dec 2027 is a product with digital elements in its own right", "Cloud analytics you build yourself is not the PLC vendor's remote data processing solution"]
---

# Streaming Legacy PLC Telemetry to the Cloud Without Pulling the Plant Into Scope
*By Jim McKenney — Digital Product Security Consultant & Industrial OT Architect*

Industry 4.0 meets the Cyber Resilience Act at a very specific point: the moment you tap a twenty-year-old PLC for telemetry and pipe it to AWS or Azure. The fear I hear on every brownfield project is that touching that controller — even to read from it — drags the whole plant into CRA conformity. It does not. A pre-2027 controller is grandfathered, and a read-only telemetry tap does not reopen its conformity. What *is* in scope is the new box you bolt on to move the data. Get the boundary right and the CRA cost of a data-streaming project is small and known. Get it wrong and you either over-engineer a legacy line that never needed it, or ship a non-conforming gateway and inherit manufacturer duties you didn't budget for.

Let me walk one concrete architecture end to end and mark exactly where the line falls at each hop.

<!-- IMAGE-SLOT: ep-3.04-hero | 1600x900 | alt: "A legacy Siemens S7-300 rack in a plant cabinet with a fiber tap feeding a small edge gateway, cloud icon above" | caption: "The whole compliance question lives in one hop: the box between the old PLC and the cloud." -->

## The line we're connecting

A packaging line runs a Siemens SIMATIC S7-300 CPU with an ET200 remote I/O drop, commissioned in 2008, still on Profibus and a switched-Ethernet CP module. Whatever the vendor's roadmap for the classic S7-300 family, on this plant floor the controller is a fixed asset — it will not be re-certified, re-flashed for features, or replaced before 2030. The transformation team wants cycle-time, temperature, and fault-code telemetry in the cloud for OEE dashboards and predictive maintenance. Nobody wants to write to the PLC. They want to read it.

Here is the target path, hop by hop:

1. **S7-300 CPU** → the legacy asset. Untouched.
2. **Read-only source** → a mirror/SPAN port on the cell switch, or a passive network tap, copying Profinet/S7comm frames. No new PLC program, no new PLC service, no configuration change on the controller.
3. **Edge gateway / broker** → a small industrial Linux device that parses the mirrored traffic (or polls read-only via an OPC UA wrapper), normalizes tags, buffers, and publishes MQTT northbound. This is the new hardware you are placing on your network in 2028.
4. **Data diode** → a hardware-enforced one-way link between the OT segment and the IT/DMZ segment. Physically, light travels one direction; there is no return path for a command to take.
5. **Cloud ingest** → AWS IoT Core or Azure IoT Hub, then your analytics stack. Built and operated by you, not by Siemens.

Four boundaries, one of which matters for the CRA. Let's take them in order.

## Hop 1 — the legacy PLC: grandfathered, and it stays that way

The S7-300 was placed on the market long before the CRA applies. Article 69(2) is explicit: products with digital elements placed on the market before 11 December 2027 fall under the Regulation's requirements **only if, from that date, they are subject to a substantial modification.** No modification, no obligation. The controller keeps running under the rules that governed it when it shipped.

So the entire question for hop 1 collapses to: does adding a telemetry tap *substantially modify* the PLC? "Substantial modification" is defined in Article 3(30) — a change, following placing on the market, that either affects the product's compliance with the essential requirements in Annex I Part I, or changes the intended purpose it was assessed against. Reading frames off a mirror port does neither. You have not altered the PLC's firmware, its logic, its I/O behaviour, or what the machine is for. The recitals reinforce it: a security update that lowers risk without changing intended purpose is not a substantial modification, and neither is routine maintenance. A passive read sits even further from the line than a patch.

The practical rule I give teams: **if the change is invisible from the controller's side, it is not a substantial modification.** A SPAN port and a passive tap are invisible to the S7-300 — it emits the same frames it always did, unaware anyone is listening.

## Hop 2 — where "read-only" earns its keep

This is the hop that separates a clean project from a scope disaster, and it is an architecture decision, not a legal one.

The moment your integration writes back to the PLC — a setpoint push, a remote start, a "just a small config change to enable the comms" — you are in different territory. Enabling a dormant service, opening a new port on the controller, or flashing the CP module to add a protocol can change the PLC's attack surface and its intended purpose and risk level. That is the fact pattern the substantial-modification test is built to catch. Bidirectional control is exactly the kind of change that can tip a grandfathered asset back into a fresh conformity obligation — and now you own that obligation on a device you cannot re-certify.

Unidirectional, read-only telemetry keeps you on the safe side by construction. Not by policy, not by a firewall rule someone can relax under production pressure — by physics. Which is what the data diode at hop 4 is really for.

<!-- IMAGE-SLOT: ep-3.04-architecture | 1600x1000 | alt: "Five-stage horizontal diagram: S7-300 to read-only tap to edge gateway to hardware data diode to cloud, with a labeled bracket showing only the edge gateway inside CRA scope" | caption: "The CRA scope bracket closes around one component: the edge gateway placed on the market after 11 Dec 2027." -->

## Hop 3 — the edge gateway: this is your in-scope product

Here is the honest part the brownfield-panic version misses. The legacy line is out of scope, but the gateway you add is not — and it never was going to be.

The gateway is a product with digital elements: software and hardware with a data connection, which is precisely the Article 2 scope test. It is being placed on the market after 11 December 2027, so it must conform on its own merits — Annex I essential requirements (no known exploitable vulnerabilities at release, secure-by-default configuration, protection against unauthorised access, the ability to ship security updates), a technical file, CE marking, and a defined support period.

Who carries that duty depends on how you source the box:

- **Buy a CE-marked gateway** from a vendor who has done the conformity assessment. The obligation sits with them. Your job shrinks to verification — demand the EU declaration of conformity, the SBOM, and a stated support period before it touches your network. This is the clean path, and I recommend it in almost every case.
- **Build or re-badge your own gateway** and supply it into the project, and you have made a product available on the market. You become the manufacturer for that box, with the full Annex I and technical-documentation load. Teams routinely underestimate this because "it's just a Raspberry Pi with some Python." The CRA does not care about the form factor.

Either way, the scope bracket closes around this one component. That is the whole compliance surface of the project — not the plant, not the S7-300, one gateway.

## Hop 5 — why the cloud doesn't drag the PLC back in

The last worry is the subtlest, and it turns on the definition of *remote data processing*. Under Article 3(2), a product's "remote data processing" is data processing at a distance that the manufacturer designs or provides, and **without which the product could not perform one of its functions.** The recitals give the test teeth: cloud services designed and developed outside the responsibility of a product's manufacturer do not fall within that product's scope.

Your S7-300 packages product on a factory floor with no internet connection. Its functions do not depend on your AWS account — you added that account decades later, on your own responsibility, for your own dashboards. So your cloud analytics is *not* the PLC vendor's remote data processing solution, and it does not retroactively enlarge the controller's product boundary. The cloud stack is your operational IT system, governed by your NIS2 and internal security obligations, not by the CRA duties of a controller Siemens shipped in 2008.

## The one legacy duty that does survive

One nuance, so nobody is surprised in an audit. The grandfathering covers the *essential requirements*, but Article 69(3) carves out one exception: the Article 14 reporting duties — actively exploited vulnerabilities and severe incidents — apply even to in-scope products placed on the market before 2027. That duty runs to the product's manufacturer, not to you as the operator wiring up a tap. Worth knowing the line exists; it does not change your architecture.

## What to actually do

Treat this as one procurement decision and two design rules:

**The procurement decision:** source a CE-marked edge gateway and refuse to deploy it without the EU declaration of conformity, a machine-readable SBOM, and a written support period. That single document set is your evidence that the only in-scope component in the whole design is conformant — and that you are not the manufacturer.

**Design rule one:** keep the tap read-only. Mirror port or passive tap at the source; no write path to the controller. Write it into the design record as a hard constraint, because the day someone adds a "convenient" setpoint feature is the day a grandfathered asset can become a substantial-modification problem.

**Design rule two:** enforce one-directionality in hardware. A data diode makes "read-only" a property of the wiring, not a promise in a config file. It is the cheapest insurance in the stack for keeping the legacy side out of scope.

Do that, and the S7-300 keeps running under the rules it was born under, the cloud stays your own IT problem, and your CRA exposure is a single gateway with a paper trail you can hand an auditor in five minutes.

If you're mapping your own brownfield line, start by drawing the five hops and marking the one box that gets placed on the market after 2027 — that is your entire scope. The [CRA article reference for scope and definitions](/wiki/cra) is the place to check the exact wording before you sign off the design.
