---
id: "EP_5.01"
canonical_code: "EP_5.01"
title: "Data Centres & Facility Power: What the CRA Actually Reaches"
subtitle: "Most of your power and cooling estate is a default product with digital elements that its maker self-assesses, not an Annex III important product. The class question is decided per product, and it usually bites in the network and security overlay, not the switchgear."
slug: "ep-5.01-data-centers-hyperscalers-bms-epms-ups-pdu-firmwar"
series_id: 5
episode_number: 1
series: "Critical Sector Deep Dives"
target_persona: "Data Centre Infrastructure Directors, Critical Power Engineers, Hyperscale Facility Managers."
persona_category: "Plant CISOs & Asset Owners"
statutes: ["Article 3", "Article 7", "Article 32", "Annex I", "Annex III"]
statutory_domain: "Products with digital elements — classification & conformity routes"
difficulty: "Strategy & Compliance"
key_metric: "Default self-assessment vs. Annex III important"
read_time: "8 min read"
duration: "14:15"
audio_url: "https://oxot.ai/audio/cra_podcast/EP_5.01.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["Cyber Resilience Act", "Regulation (EU) 2024/2847", "Annex III", "important products with digital elements", "conformity assessment", "Article 32", "self-assessment", "data centre facility power", "PDU controller", "UPS firmware", "BMS", "EPMS", "CE marking"]
takeaways: ["Switchgear, UPS, PDU, chiller and BMS controllers are default products with digital elements — their makers self-assess against Annex I, they are not automatically Annex III important products", "Classification is decided per product by its core function (Article 7), so it lands on the network and security overlay — management switches, firewalls, access readers, SIEM — not the power kit", "Default status is a route, not an exemption: Annex I still applies in full, including firmware update and vulnerability-handling duties"]
---

# Data Centres & Facility Power: What the CRA Actually Reaches
*By Jim McKenney — Digital Product Security Consultant & Industrial OT Architect*

A compromised PDU controller can drop a row as surely as a core-router breach can drop a fabric, so the instinct to file the whole power and cooling estate under the Cyber Resilience Act's strictest tier is understandable. It is also wrong, and the error is expensive in both directions. It buys third-party assessments the law never asked for, and it hides the handful of boxes that genuinely do carry a heavier route. The Regulation does not classify equipment by how much sleep it costs you. It classifies each product by what that product's core function is.

So before you write a single "Annex III Class II" clause into a switchgear tender, walk the estate through the actual question, one asset at a time.

<!-- IMAGE-SLOT: hero | 1200x630 | alt: "A data hall electrical and cooling gallery — modular UPS cabinets, switchgear line-ups and PDU busway — viewed as a calm, orderly critical-power estate" | caption: "The facility power estate is almost entirely default equipment under the CRA. The strict tier lives in the thin network and security layer wrapped around it." -->

## The question the law actually asks

Start with what nearly every box in the building has in common. The CRA defines a "product with digital elements" as any software or hardware product, and its remote data processing, that is placed on the market (Article 3). A PDU controller qualifies. So does a UPS with a network card, a chiller controller, an EPMS meter, a BMS field controller, a leak-detection node. There is no minimum-intelligence threshold and no OT exemption. If it has firmware and it ships, it is in scope, and the essential requirements in Annex I attach to it: secure-by-default configuration, no known exploitable vulnerabilities at ship, a way to deliver security updates, an SBOM in the technical file, coordinated vulnerability handling across its support period.

That is the floor for everything. What differs between products is only the *route* used to prove Annex I is met, and there are three of them:

1. **Default.** The maker performs its own conformity assessment through the internal control procedure and signs the EU declaration itself (Article 32). No lab, no notified body.
2. **Important.** A short list of categories whose core function is security itself, or which act as a central system function, sits in Annex III. Class I can still self-assess where harmonised standards fully cover it; Class II always requires a notified body or an approved certification scheme.
3. **Critical.** An even shorter Annex IV list that ultimately needs a European cybersecurity certificate.

The whole game is deciding which bucket a given product lands in. And the categories are drawn narrowly, by the product's own core functionality, not by the criticality of the process it happens to serve.

## Walking the power and cooling estate

Here is the estate most facility teams actually own, run through the class question:

| Asset | Named in Annex III / IV? | CRA class | Route to prove Annex I |
|---|---|---|---|
| MV/LV switchgear, protection relays, breaker controllers | No | Default | Maker self-assesses (internal control) |
| Modular UPS and static transfer switches | No | Default | Maker self-assesses |
| Rack and busway PDU controllers | No | Default | Maker self-assesses |
| Chiller, CRAC/CRAH and BMS field controllers | No | Default | Maker self-assesses |
| Environmental, leak and DCIM sensor nodes | No | Default | Maker self-assesses |
| Out-of-band management switches and routers | Annex III, Class I | Important | Self-assess only if harmonised standards fully applied; otherwise notified body |
| Segmentation firewall, IDS/IPS | Annex III, Class II | Important | Notified body or full quality assurance, always |
| Access-control and biometric door readers; PAM for jump hosts | Annex III, Class I | Important | As Class I above |
| SIEM aggregating facility and OT telemetry | Annex III, Class I | Important | As Class I above |

Read the top block first. Switchgear, UPS, PDU, cooling and monitoring controllers do not appear anywhere in Annex III or Annex IV. Their core function is to move power, move heat, or measure a condition. None of that is one of the enumerated security or central-system functions. Every one of them is a default product, and the honest answer to "who audits our UPS vendor?" is that the vendor audits itself and stands behind its own declaration.

The predictable objection is the microprocessor. "Our protection relay runs a chip with security functions, and Annex III lists microprocessors with security-related functionalities, so surely the relay is important." No. Article 7 closes that door explicitly: integrating a component that would itself be an important product does not drag the finished product into the important tier. A network-capable chip inside a UPS is integration. The UPS is still a UPS. The same logic disposes of the "it has an Ethernet port, isn't that a network interface" argument. A device with a management port is not a network-interface product; its core function is uninterruptible power.

## Where the class actually bites

Now read the bottom block, because this is the reweighting that matters. The equipment that climbs into Annex III is not the power kit. It is the network and security overlay you wrap around it.

The out-of-band management fabric is built from switches and routers, and those are named in Annex III Class I. The segmentation firewall and any IDS/IPS sitting between the OT VLANs and the enterprise are Class II, which means their makers cannot self-assess their way out. The badge and biometric readers on the data-hall doors, and the privileged-access-management tooling gating your jump hosts, are identity and access products, also Class I. The SIEM that ingests all of this telemetry is Class I as well. These are the products whose CRA paperwork you should actually be interrogating in procurement, and they are exactly the ones a power-focused spec tends to treat as afterthought infrastructure.

There is one more asset to name. If you run a hardware security module for key management, that is not merely important. A device for secure cryptoprocessing falls in Annex IV, the critical tier, and heads toward a European cybersecurity certificate once the scheme exists. Most facility estates contain nothing critical. The HSM, if you have one, is the exception to look for.

## "Default" is a route, not a let-off

The trap on the other side is to hear "self-assessment" and file the power estate as solved. It is not. Default means the *vendor* chooses its own conformity route; it does not thin out Annex I. A default UPS still has to ship without known exploitable vulnerabilities, still needs a mechanism to deliver signed firmware updates across its stated support period, and still obliges its maker to run coordinated vulnerability disclosure and to report actively exploited flaws once the reporting duties begin in September 2026. Full CE-marked application arrives on 11 December 2027, and a self-assessed declaration that cannot be backed by real Annex I evidence is as defective as a missing notified-body certificate.

For a multi-vendor estate this cuts a clean line through procurement. You are not buying one compliance posture; you are buying a mix. Ask every power and cooling vendor for the same default-tier package: the EU declaration, the technical file, an SBOM, a firmware-update and support-period commitment, and a disclosure contact. Ask the network, firewall, access-control and SIEM vendors the harder question, because their route may require a notified body and their evidence should show it. The conformity routes themselves, and how self-assessment differs from the notified-body path, are worked in detail in [self-assessment vs notified body](/blog/ep-7.01-self-assessment-vs-notified-body-navigating-module). The BMS and access-control side, where building protocols such as BACnet and Modbus blur the same lines, is the subject of [smart buildings](/blog/ep-5.02-smart-buildings-real-estate-bacnet-modbus-access-c). The Annex III category list itself lives in the [CRA wiki](/wiki/cra).

## The principle

Classification is a property of the product, not of the rack it sits in. A UPS is default because its core function is power, and a firewall is important because its core function is protection, and neither fact changes because both keep the same hall alive. Map the estate to the tiers the Regulation actually wrote, product by product, and you will spend your assessment budget where the law puts the weight instead of where your risk register feels the fear.

<!-- IMAGE-SLOT: default-core-important-shell | 1200x800 | alt: "A flat infographic: a large central block of power and cooling equipment marked as the default self-assessment tier, surrounded by a thin outer ring of network and security devices marked as the important tier, with a single small node marked critical" | caption: "The estate as the CRA sees it: a large default core of power and cooling kit, a thin important shell of network and security devices, and at most a single critical node." -->
