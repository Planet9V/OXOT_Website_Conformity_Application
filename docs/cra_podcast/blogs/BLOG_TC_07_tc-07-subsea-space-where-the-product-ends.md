---
id: "TC_07"
canonical_code: "TC_07"
title: "Where Does the 'Product' End? The CRA in Subsea and Space Mega-Systems"
subtitle: "A bespoke subsea cable or a satellite constellation is not 'a product placed on the market.' The commercial modules inside it usually are. Here is how the Cyber Resilience Act draws the boundary through a mega-system, one line item at a time."
slug: "tc-07-subsea-space-where-the-product-ends"
series_id: 10
episode_number: 7
series: "CRA: Truth & Consequences (Investigative)"
target_persona: "Systems engineers, infrastructure architects, and regulatory strategists on subsea cable, satellite, and other engineered-to-order mega-systems."
persona_category: "Investigative"
statutes: ["Article 2", "Article 3(1)", "Article 3(2)", "Article 3(10)"]
statutory_domain: "Scope & Product Boundary (Articles 2, 3)"
difficulty: "Systems Architecture"
key_metric: "Product boundary · Art 3(1)/(2)"
read_time: "8 min read"
duration: "13:20"
audio_url: "https://oxot.ai/audio/cra_podcast/TC_07.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["Cyber Resilience Act", "Regulation (EU) 2024/2847", "product with digital elements", "CRA scope subsea cable", "satellite CRA compliance", "remote data processing Article 3", "mega-system product boundary", "Article 2 CRA scope"]
takeaways: ["The installation is not the product: scope each commercially-supplied module on its own footing", "Article 3(1)/(2) draws the product boundary through the backend, pulling in a manufacturer-run service the unit cannot function without", "No space or subsea carve-out exists in Article 2, so quarantine parallel regimes instead of assuming exemption"]
---

# Where Does the 'Product' End? The CRA in Subsea and Space Mega-Systems

*By Jim McKenney — Digital Product Security Consultant & Industrial OT Architect*

A subsea repeater sits on the ocean floor three thousand metres down, one of two hundred identical units spliced into a six-thousand-kilometre cable. A payload controller rides a satellite in low-Earth orbit, one node in a constellation of several hundred. Neither will ever be picked off a shelf. Both were engineered to a customer's specification, installed once, and will be recovered only to be scrapped. So here is the question that decides a compliance budget before anyone pours epoxy or books a launch: is that repeater a "product" the Cyber Resilience Act reaches, and if it is, where exactly does the reach stop?

The comfortable answer in the industry is that a mega-system is a project, not a product. A cable is infrastructure. A constellation is a mission. You do not CE-mark the English Channel, the reasoning goes, so you do not CE-mark the thing lying at the bottom of it. That reasoning is not wrong so much as it answers the wrong question. The CRA never asks whether your installation is a product. It asks, component by component, whether each thing supplied into that installation is one.

<!-- IMAGE-SLOT: tc-07-hero | 1200x630 | alt: "A subsea repeater unit on the seabed with a fibre trunk running to the horizon on one side, and a satellite node in orbit on the other, both shown as individual modules inside a much larger system. Factory-neutral, no legible branding." | caption: "Neither unit is sold off a shelf. Each is still supplied by a maker into a system, and that is the fact the CRA scores against." -->

## The installation is not what gets "placed on the market"

Start with the trigger. The regulation applies to products with digital elements made available on the market whose intended or foreseeable use includes a data connection to a device or network (Article 2(1)). The decisive phrase is "made available on the market," and it does not say what the "it's a project" reflex assumes.

"Made available on the market" means supply for distribution or use in the course of commercial activity. It does not mean "sold from a catalogue." A subsea repeater built to order and supplied by its maker to a cable consortium is made available on the market, even though only two hundred of that exact configuration will ever exist. Customisation does not lift a supplied product out of scope. A one-off is still a one-off that someone handed to a buyer commercially.

What is genuinely *not* "a product made available on the market" is the finished, operated installation itself. Nobody supplies a live six-thousand-kilometre cable system to a buyer as a product; the consortium builds it and runs it as infrastructure. The constellation, once flying and operated, is a service the operator delivers, not a unit it sells. So the installation-as-a-whole sits outside the product framing. But that exemption is a boundary, not a blanket. Every product with digital elements supplied commercially into the build carries its own scope, on its own footing, regardless of how large or bespoke the thing it disappears into. The system being exempt as a *product* tells you nothing about the modules inside it.

That distinction is the whole game, and it is the same per-SKU discipline that separates a ship's type-approved bridge from the quay crane bolted down beside it, which I walked through in the [maritime scope-line post](/blog/ep-5.06-maritime-port-automation-shipboard-integrated-brid). Scope is decided at the box, not at the site boundary.

## Where one product stops: the Article 3 boundary

Say the repeater is in scope. The next question is harder and it is the one most teams skip: where does *that product* end? A subsea node is not just the potted electronics on the seabed. It reports to a network-management backend. A satellite payload talks to a ground station. Is the backend part of the product, or a separate thing?

The CRA answers this precisely. A product with digital elements is the hardware or software product *and its remote data processing solutions* (Article 3(1)). The boundary of a single product can extend off the device and into a cloud or ground-segment service. But not automatically, and this is where accuracy matters. Remote data processing counts only when the software is designed and developed by the manufacturer, or under the manufacturer's responsibility, *and* the product could not perform one of its functions without it (Article 3(2)). Two conditions, both required.

Run a real node through that test. If the payload manufacturer supplies a processing service the payload literally cannot function without, that service is pulled inside the product boundary and inside scope with it. If the satellite operator runs its own mission-control that the payload could function without, or that a third party built, that backend falls outside the manufacturer's product boundary. Same physical downlink, two different answers, decided by who owns the software and whether the node is inert without it.

<!-- IMAGE-SLOT: tc-07-boundary | 1200x675 | alt: "Flat infographic: a single seabed or orbital node drawn with a dashed boundary that stretches to include a manufacturer-run backend service, and stops short of an operator-run control system. Two conditions labelled as gates on the boundary line. Shapes and arrows only, no legible text." | caption: "The product boundary is not the enclosure. It reaches the backend only when both Article 3(2) conditions hold: manufacturer-run, and functionally necessary." -->

## Walking the bill of materials

Put the two tests together and a mega-system stops being one intimidating scope question and becomes a list of small, answerable ones. Here is the same six-item build most subsea and space programmes actually contain, scored line by line.

| Element supplied into the system | In CRA scope? | Why |
|---|---|---|
| COTS controller or managed switch in a branching unit | Yes | Product with digital elements made available on the market (Art 2(1)); connects to a network |
| Custom-engineered repeater or payload node, supplied by its maker | Yes | Made available on the market; customisation does not remove it. Buried in the system, it still connects indirectly, as part of a larger system that is itself connectable (Art 3(10)) |
| Manufacturer-run backend the node cannot function without | Yes | Pulled inside the product boundary as remote data processing (Art 3(1) with Art 3(2)) |
| Operator's own control/mission system the node can run without | No | Fails Art 3(2): not the manufacturer's, and not functionally necessary to the node |
| The assembled, operated cable system or constellation | No | Not "a product made available on the market"; it is infrastructure the operator runs |
| Bespoke civil works, cable-lay, splicing (no digital product supplied) | No | Not a product with digital elements at all |

Nothing in that table depends on how exotic the environment is. The seabed and the vacuum change the engineering, not the legal test. A node's depth rating does not move it across the scope line; its status as a commercially supplied product with a data connection does.

Once a node lands on the "yes" side, the next decision is which conformity route it takes, and that is a genuinely separate question from scope. Whether a given SKU self-assesses or has to go through a notified body depends on its class, not its ocean depth or orbit; I map that fork in the [self-assessment versus notified-body post](/blog/ep-7.01-self-assessment-vs-notified-body-modules-a-b-c-h). Get scope right first, then route.

> [!NOTE]
> **Not a CRA carve-out — quarantine these.** Article 2's exclusions name a closed list: medical devices (Regulations 2017/745 and 2017/746), motor-vehicle type-approval (2019/2144), civil aircraft certified under EASA (2018/1139), and marine equipment (Directive 2014/90/EU). There is no space carve-out and no subsea carve-out on that list. National space-licensing regimes, ITU spectrum coordination, and submarine-cable treaties are parallel tracks: they neither discharge a CRA obligation nor are discharged by one. Do not read the aviation carve-out as covering satellites — 2018/1139 is civil aviation certification, not space. If someone tells you the constellation is exempt because it is "certified," ask certified under what, and check it against this list before you believe it.

## Reading the myth back with the facts in hand

Now the industry's comfortable answer falls apart in a specific way rather than a vague one. "It's a project, not a product" is true of the installation and false of almost everything inside it. "It's bespoke, so it's exempt" confuses customisation with non-supply; a made-to-order unit handed to a buyer is still made available on the market. "The turnkey EPC contract absorbs it" allocates commercial risk between parties but does not rewrite who placed a product on the Union market, and the manufacturer obligations attach to that product no matter what the contract says about who pays for compliance.

The failure this produces is not abstract. Customs and market-surveillance authorities inspect discrete units, not mission statements. A container of uncertified subsea nodes or payload controllers is a container of products with digital elements, and it can be held at a port on that basis while the consortium explains, unsuccessfully, that the cable as a whole is infrastructure. The [conformity workspace](/demo) exists to head that off: it maps each supplier deliverable to the specific obligation it discharges, so the evidence for every in-scope line item is assembled before the unit is potted, launched, or spliced into a system nobody will ever physically reach again. For the statutory text behind each test above, the [CRA reference](/wiki/cra) holds Articles 2 and 3 in full.

So do not scope the installation. Scope the bill of materials. For every line item a supplier hands you commercially that carries firmware or a data link, assume the CRA reaches that item, and make the supplier prove where its product ends and its backend begins before the enclosure is sealed. The mega-system is not the unit of analysis. The unit of analysis is the smallest thing anyone sold you.
