---
id: "EP_5.02"
canonical_code: "EP_5.02"
title: "Smart Buildings: When Your BACnet Gateway Becomes a Regulated Product"
subtitle: "Building-automation integrators treat a BACnet or Modbus gateway as infrastructure, not a product. The day it is placed on the EU market after the deadline, the Cyber Resilience Act says otherwise."
slug: "ep-5.02-smart-buildings-real-estate-bacnet-modbus-access-c"
series_id: 5
episode_number: 2
series: "Critical Sector Deep Dives"
target_persona: "Smart Building Master Systems Integrators (MSI), Property Tech Directors, Facility Managers."
persona_category: "EPC & Integrators"
statutes: ["Article 3(1)", "Article 6", "Annex I", "Annex III", "Article 32"]
statutory_domain: "Scope & product class (Art 3(1))"
difficulty: "Applied Engineering"
key_metric: "In scope · Art 3(1)"
read_time: "7 min read"
duration: "14:15"
audio_url: "https://oxot.ai/audio/cra_podcast/EP_5.02.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["Cyber Resilience Act", "Regulation (EU) 2024/2847", "building automation", "BACnet", "Modbus", "access control", "Article 3(1) product with digital elements", "Annex I", "CE marking"]
takeaways: ["A building-automation gateway placed on the EU market after the deadline is a product with digital elements in scope", "Plaintext BACnet MS/TP is not the violation — failing Annex I is", "Access-control and biometric readers are Annex III Class I important products, not default class"]
---

# Smart Buildings: When Your BACnet Gateway Becomes a Regulated Product
*By Jim McKenney — Digital Product Security Consultant & Industrial OT Architect*

> **Executive Technical Memorandum**
> - **Statutory spine:** `Article 3(1)` (what counts as a product) → `Article 6` (the market-access condition) → `Annex I` (the requirements it must meet)
> - **Primary persona:** smart-building master systems integrators, proptech directors, facility managers
> - **Curriculum track:** Critical Sector Deep Dives (Track 5)
> - **The belief this post dismantles:** that building automation is infrastructure, not a regulated product

---

Ask a building-automation integrator whether the Cyber Resilience Act applies to them and you usually get a version of the same answer. That is for software companies and consumer IoT, not for us; we install infrastructure. HVAC controllers, BACnet gateways, elevator dispatch boards, badge readers. Plant, not product.

That answer is wrong, and the gap between it and the regulation is exactly where the exposure sits. A building-automation gateway is a product with digital elements the moment it is placed on the EU market. Firmware, a network stack, a configuration interface: that is the whole test. Where the box ends up bolted to a wall in a mechanical room changes nothing about its legal character.

<!-- IMAGE-SLOT: ep-5.02-hero | 1200x630 | alt: "A commercial building mechanical room with a wall-mounted automation controller cabinet and cabling, calm and professional, no visible text or logos." | caption: "The controller in the plant room is a product in the eyes of the regulation, wherever it is installed." -->

## The myth: infrastructure isn't a product

The whole objection rests on that one word, "infrastructure," and it has no standing under the CRA. **Article 3(1)** defines a product with digital elements as a software or hardware product and its remote data processing solutions, including components placed on the market separately. It says nothing about whether the thing is a gadget, a subsystem, or a wall-mounted controller feeding a chiller. If it has digital elements and it is made available on the EU market, it is in scope. The definition text is in the [CRA wiki](/wiki/cra) if you want to read it cold.

Run your building stack through that definition honestly. A BACnet/IP field controller has firmware and an IP stack: in scope. A Modbus-to-IP protocol gateway: in scope. An elevator controller with a maintenance modem: in scope. A networked access-control panel: in scope. The category "infrastructure" appears nowhere in the exemptions, because no such exemption was written.

The date that makes this concrete is 11 December 2027. From that day, under **Article 6**, a product with digital elements can be made available on the EU market only if it meets the essential requirements. So the question stops being "is my building regulated" and becomes "is this specific unit, placed after that date, a compliant product." Scope attaches to the box, not to the building around it.

## The protocol isn't the crime

Integrators tie themselves in knots at exactly this point. Millions of installed points speak plaintext BACnet MS/TP or unauthenticated Modbus, and the instinct is to read the CRA as a law that outlaws those protocols. It does not.

Plaintext BACnet on a serial trunk does not, by itself, break any provision of the regulation. The CRA is not a protocol blacklist. What it sets are outcomes a new product has to deliver, laid out in **Annex I**: ship in a secure-by-default configuration, protect against unauthorised access through authentication, protect the integrity of firmware, configuration and commands against tampering, and be capable of receiving security updates across its supported life. Those are the tests. The wire protocol is one engineering means of passing or failing them, not the statute.

That reframing tells you where to spend money. Moving a serial MS/TP trunk onto an authenticated, encrypted transport is one way to satisfy the access-control and integrity outcomes on a new product. It is not a legal requirement in its own right, and swapping the protocol while leaving unsigned firmware and a shared default password in place satisfies nothing the regulation actually asks for.

> **Standards and protocols are not the law.** BACnet/SC (Secure Connect) and a baseline such as ETSI EN 303 645 are engineering tools that can help you meet Annex I. Neither is a CRA obligation, and no clause of the regulation requires either one. The harmonised standards that will eventually carry a formal presumption of conformity under the CRA are still being finalised. Treat any protocol or standard as a means to the Annex I end, never as the compliance test itself.

## One box in your stack isn't default class

Most building-automation kit sits in the CRA's default category. For a default-class product the manufacturer runs its own conformity assessment through internal control, with no notified body involved, and self-declares against Annex I under **Article 32**. That is the route for the HVAC controller, the protocol gateway, and the elevator board.

One device in your riser is treated more seriously. Annex III lists "important" products, and its Class I opens with identity and access management, naming authentication and access-control readers, biometric readers included. Your badge reader and your fingerprint reader are on that list by name. The reclassification changes the conformity route: a Class I important product can be self-assessed only where the manufacturer fully applies the relevant harmonised standards. Where it does not, or where none yet exist, that product goes through a third-party examination route instead.

| Device in the building stack | CRA class | Conformity route |
|---|---|---|
| BACnet / Modbus HVAC controller | Default | Self-assessment (internal control) |
| Protocol gateway / edge controller | Default | Self-assessment (internal control) |
| Elevator / escalator controller | Default | Self-assessment (internal control) |
| Access-control reader, biometric reader | Important, Class I (Annex III) | Self-assessment only with full harmonised-standard cover; otherwise third-party |

<!-- IMAGE-SLOT: ep-5.02-market-date.png | 1200x675 | alt: "Flat infographic: a horizontal boundary line marking the deadline, with an already-installed device on the left staying outside the regulated zone and a newly placed unit on the right crossing into it. Shapes and arrows only, no legible text." | caption: "The legal trigger is the date each unit is placed on the market, not the day it is installed." -->

The practical read: do not let a vendor wave a single self-declaration over a mixed order. The reader on the same purchase order as the HVAC controllers may sit in a stricter lane, and its conformity file has to reflect that. If you specify a hundred controllers and a dozen biometric readers together, you are buying two different assessment obligations, not one.

## What "in scope" actually asks of the box

Strip away the noise and Annex I asks a new building-automation product to do four things it has historically not done. Authenticate the parties that talk to it, rather than trusting anything sitting on the segment. Verify the integrity of its own firmware and configuration, so a swapped image or an altered setpoint is detected rather than silently accepted. Ship locked down by default, not wide open pending a commissioning engineer who never comes back to tighten it. Accept security updates through its supported life, with a working mechanism to deliver them.

For a default-class controller, proving that is a self-assessment: a documented cybersecurity risk assessment, a technical file, and a declaration the manufacturer signs and keeps. No external gate. But the evidence has to exist before the unit is placed on the market, and it has to be about that unit, not a glossy datasheet. An integrator specifying kit should be asking every controls vendor for that file now. "In scope" with no technical file behind it is a CE mark waiting to be challenged.

## The risk you're actually carrying

The exposure, stated plainly. Building-automation products have ten- and fifteen-year service lives, so the fleet you specify in 2028 is still running in 2040. The legal test is the date each unit was placed on the market, not the day it was installed or the day someone finally notices the plaintext trunk. A market-surveillance authority that finds a post-deadline gateway shipped without a defensible technical file can order it withdrawn or recalled from the market, and a controller wired into a live building's mechanical plant is not something you swap out over a weekend.

And if you, the integrator, re-flash or materially rework a unit to make it fit the job, the regulation can treat you as its manufacturer, moving the full evidence burden onto the firm that did the reworking rather than the brand on the enclosure. That is the risk to carry out of here. Not a fine on a slide, but a recall notice against a product line you have already poured into concrete across a portfolio, with your own name on the modification.
