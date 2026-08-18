---
id: "EP_3.03"
canonical_code: "EP_3.03"
title: "Bridging the OEM Support Gap: Keeping 25-Year Assets Defensible after the CRA Clock Runs Out"
subtitle: "The CRA makes a manufacturer support a product for at least five years. A distillation column runs for twenty-five. The years in between are the operator's problem to engineer, and NIS2 says so."
slug: "ep-3.03-bridging-the-5-year-oem-gap-keeping-20-year-indust"
series_id: 3
episode_number: 3
series: "Brownfield OT, Spare Parts & Maintenance"
target_persona: "Chemical & Refinery Asset CISOs, Water Utility Operators, Power Plant Engineers."
persona_category: "Plant CISOs & Asset Owners"
statutes: ["Article 13(8)", "Article 13(9)", "Article 13(19)", "NIS2 Article 21"]
statutory_domain: "Brownfield & Legacy OT"
difficulty: "Architecture"
key_metric: "Support-period end date vs. asset design life"
read_time: "8 min read"
duration: "14:15"
audio_url: "https://oxot.ai/audio/cra_podcast/EP_3.03.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["CRA support period", "Article 13(8)", "unpatchable OT device", "NIS2 Article 21", "compensating controls", "OT micro-segmentation", "virtual patching", "IEC 62443 zones and conduits", "brownfield industrial cybersecurity"]
takeaways: ["Read the declared support-period end date at procurement and overlay it on the asset's design life", "The manufacturer's duty to patch lapses; your NIS2 duty to manage the risk does not", "Treat an out-of-support device as a zone problem: bound it, virtual-patch the conduit, and watch it"]
---

# Bridging the OEM Support Gap: Keeping 25-Year Assets Defensible after the CRA Clock Runs Out
*By Jim McKenney — Digital Product Security Consultant, Industrial OT & CRA*

A distillation column has a design life measured in decades. The controller bolted to it does not. Under the Cyber Resilience Act the manufacturer of that controller has to support it — handle its vulnerabilities, ship security updates — for a defined period, and that period can be as short as five years. So the real question is this: when the support period expires but the asset still has eighteen years of service life in front of it, whose job is the security of that device now?

It becomes yours — and not because the CRA hands it to you. The CRA is a duty on the person who makes and sells the product. When their clock stops, the obligation to keep the plant safe doesn't evaporate — it just moves to the operator, under a different law, and it has to be answered with architecture instead of patches.

<!-- IMAGE-SLOT: hero | 1200x630 | alt: "An aging refinery distillation column with a small control cabinet, set against a long asset-lifecycle line where the vendor support window is a short early segment" | caption: "The asset outlives its controller's support window by a decade or more. That overhang is where this episode lives." -->

## The support period is a floor, and it belongs to the manufacturer

Start with what the CRA actually requires, because most of the market misremembers it. Article 13(8) tells manufacturers to determine a *support period* that reflects how long the product is realistically expected to be in use — weighing reasonable user expectations, the nature of the product, and any Union law that speaks to product lifetime. Then it sets a hard minimum: the support period must be **at least five years**, unless the product is genuinely expected to be in use for less, in which case it tracks that shorter life.

The "five years" everyone quotes is a floor, not a ceiling. A manufacturer selling a controller destined for a twenty-five-year process asset is explicitly told to consider that expected in-use time when setting the period. Nothing stops them from declaring ten, fifteen, twenty years — and nothing but commercial pressure makes them. Left to default, many will anchor on the statutory minimum.

Two adjacent obligations matter for planning. Article 13(9) says any security update issued during the support period has to stay *available* for at least ten years after it ships, or the rest of the support period if that's longer — so the fixes you already have don't vanish, even though new ones stop. And Article 13(19) requires the manufacturer to state the support period's **end date**, down to at least the month and year, clearly and at the time of purchase. That last one is the lever you have at the buying table: the expiry date is not a surprise you discover in year six. It is a number you can read on day one and design around.

## Where the gap actually opens

Now do the arithmetic that no procurement spreadsheet does by default. A process controller placed on the market in 2028 with a support period set to the minimum stops receiving vulnerability handling in 2033. The distillation column it runs was engineered to operate into the 2050s. That is roughly two decades in which the device is in service, connected, and — from the manufacturer's side — done. New vulnerabilities discovered after the end date are, as a matter of the manufacturer's CRA duty, no longer theirs to fix.

The brownfield case is worse, because it never had a support period at all. Anything already installed and running today predates the regime. The CRA doesn't reach back and conjure a vendor obligation for a PLC commissioned in 2011. So the population of devices you have to worry about isn't just "things that will fall out of support" — it's "things that are already out of support, plus things that will be, on a rolling schedule you can actually plot."

Here's the trap in the framing: the CRA does not follow the device into year twelve and start issuing you, the operator, instructions about how to run it. The CRA's job ends at the product and the person who placed it on the market. What replaces it isn't nothing — it's a different instrument entirely.

## One transmitter, one timeline

Take a single asset and walk it, because the abstraction hides the decision. A safety-relevant level transmitter on that column is placed on the market in 2028. The manufacturer, prompted by your procurement team, declares a support period ending in the month and year printed on the purchase documentation — say, eight years out, 2036. That's better than the floor, and you got it because you asked for it under the Article 13(19) disclosure and pushed on the Article 13(8) "expected in-use time" language.

The asset's design life still runs to 2053. So even with a good support period, you own the security of a connected, safety-relevant device for **seventeen years after its last vendor fix**. The firmware freezes. The threats against it do not. Somewhere in that window a serious vulnerability in that transmitter's protocol stack gets published, and there is no patch coming. On the day that happens, the question is not "who do I call" — the vendor's duty ended in 2036 — it's "what in my architecture already contained this before I'd heard of it." If the answer is *nothing*, you didn't have a compliance gap. You had an engineering one, and the compliance exposure was just the receipt.

<!-- IMAGE-SLOT: support-timeline | 1200x675 | alt: "A single long horizontal bar representing an asset's design life, with a short supported segment near the start and a long unsupported segment covered by compensating controls" | caption: "Support is a short early segment of a long life. The overhang is engineered, not patched." -->

## Your obligation doesn't lapse when theirs does

This is where the second law comes in — and it is not the CRA.

> [!IMPORTANT]
> **NIS2 is a separate instrument.** If you operate essential or important services — energy, water, chemicals, and the rest — Article 21 of the NIS2 Directive requires you to take appropriate, proportionate technical, operational and organisational measures to manage the risks to the network and information systems you *use to run those services*. It is explicitly an all-hazards, state-of-the-art duty, and it names supply-chain security and "security in network and information systems acquisition, development and maintenance, including vulnerability handling and disclosure" among the minimum measures. That duty is continuous. It does not read the vendor's support-period end date and switch off.

Put the two instruments side by side and the handoff is clean. The CRA obliges the manufacturer to handle the device's vulnerabilities for the support period. NIS2 obliges you to manage the risk of the systems you operate, for as long as you operate them. When the first duty expires on a device you're still running, the second one is what remains — and an unpatchable transmitter with a live, unpatched vulnerability is precisely the kind of risk Article 21 tells you to treat. The controls below are not the CRA reaching into your plant. They are how you discharge your own standing obligation once the manufacturer's has run out.

## Treating the asset you can't patch

If you can't change the device, change everything around it. Three moves, working together, turn an out-of-support device from an open exposure into a contained and monitored one.

The first is to stop treating "the network" as one thing. IEC 62443 gives you the vocabulary the CRA and NIS2 both lean toward: partition the plant into **zones** of assets with a shared security level, and allow traffic between them only through defined **conduits**. An unsupported controller doesn't belong in a flat cell where every workstation and historian can reach it. It belongs in a tightly-drawn zone at the Purdue process-control levels, with the conduit into that zone reduced to exactly the protocols and endpoints the process genuinely needs — and nothing else. A vulnerability you can't patch in the device is far less interesting to an attacker who cannot route a packet to it in the first place. This is the compensating-controls principle stated plainly: you can't raise the device's security level, so you raise the boundary's.

The second move enforces that boundary actively. Place an industrial firewall or intrusion-prevention appliance on the conduit and give it deep, protocol-aware rules — *virtual patching*. When a vulnerability in the device's Modbus or proprietary stack is published, you write a rule at the boundary that recognises and drops the specific malformed request or command sequence that triggers it. The firmware in the transmitter never changes; the exploit simply never arrives. Be honest about what this is: virtual patching mitigates the *exposure*, it does not remediate the flaw in the device. It buys you defensible time and a documented control, which under NIS2's proportionality test is exactly what "appropriate measures" is asking you to show.

The third move is to watch the zone as if you expect the first two to eventually be tested. Passive monitoring on the conduit — baseline the normal traffic, alert on the anomalies — means that if something does reach the device, you see it in hours, not after the batch is ruined. For a device with no vendor telemetry and no coming patch, visibility is the difference between an incident you contain and one you reconstruct afterward.

<!-- IMAGE-SLOT: zone-isolation | 1200x800 | alt: "A Purdue-model layered stack with an out-of-support device enclosed in a tightly bounded zone, a single firewall choke point on the conduit, and a monitoring tap" | caption: "Bound the zone, choke the conduit, watch the boundary. The device stays frozen; the exposure doesn't." -->

## What to do with this before the quarter ends

Pull the support-period end dates for your most critical connected assets — the ones already installed carry none, which is itself the finding, and new procurements carry the Article 13(19) date on the paperwork. Lay those dates against each asset's design life on one sheet. Every row where the life outruns the support is a device you will operate unpatched, and the length of that overhang tells you how hard the boundary around it has to work. That single overlay turns a vague dread about "legacy OT" into a ranked, fundable list of zones to draw first.

[Map an asset against its support horizon in the conformity workspace](/demo) and start with the column, not the spreadsheet.
