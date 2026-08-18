---
id: "EP_4.06"
canonical_code: "EP_4.06"
title: "The Component Supplier's Minimum Viable Security Kit: The 5 Documents That Pass a Tier-1 Audit"
subtitle: "The absolute minimum documentation package that turns a small hardware vendor from a supply-chain liability into a preferred Tier-1 supplier — grounded in what Annex I and Article 13 actually require."
slug: "ep-4.06-the-component-supplier-s-minimum-viable-security-k"
series_id: 4
episode_number: 6
series: "Tier-2 Upstream Component Supplier Survival"
target_persona: "Hardware Startups, Sensor Manufacturers, Industrial IoT Product Managers."
persona_category: "Hardware & Embedded OEMs"
statutes: ["Annex I Part I", "Annex I Part II", "Article 13"]
statutory_domain: "Tier-2 Embedded Systems"
difficulty: "Advanced Engineering"
key_metric: "5-document minimum kit"
read_time: "8 min read"
duration: "14:15"
audio_url: "https://oxot.ai/audio/cra_podcast/EP_4.06.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["Cyber Resilience Act", "Regulation (EU) 2024/2847", "Tier-1 supplier audit", "component supplier onboarding", "Annex I", "SBOM", "coordinated vulnerability disclosure", "support period"]
takeaways: ["Five documents carry the load in a Tier-1 vendor-security review: a risk assessment, an SBOM, secure-boot evidence, a CVD policy, and a support commitment", "The risk assessment is the keystone — it decides which Annex I Part I properties apply and justifies in writing any you switch off", "Article 13 fixes the support period at five years minimum and forces you to publish the end date at the point of sale"]
---

# The Component Supplier's Minimum Viable Security Kit: The 5 Documents That Pass a Tier-1 Audit

*By Jim McKenney — Digital Product Security Consultant & Industrial OT Architect*

A Tier-1 buyer's supplier-security questionnaire is where most small hardware vendors quietly lose the deal. Not on unit price, not on lead time — on a document they don't have and can't assemble in the ten working days the procurement team allows. The sensor is excellent. The PDF folder is empty. So the OEM routes the design win to a competitor whose engineering is no better but whose paperwork is ready.

You do not need a compliance department to clear that gate. You need five documents. Each one maps to a specific obligation the Cyber Resilience Act puts on whoever places a product with digital elements on the EU market, and each one is something a Tier-1's security team already knows how to read. Assemble them once, keep them current, and onboarding stops being an interrogation and starts being a checkbox.

<!-- IMAGE-SLOT: ep-4.06-hero | 1200x630 | alt: "A small embedded sensor board on a desk beside a slim folder of five tabbed documents, at an industrial vendor-onboarding gate." | caption: "The design is fine. The five-document folder next to it is what actually gets a small vendor through the Tier-1 door." -->

## The kit: five documents, one table

Here is the whole package before we open each drawer. Nothing here is optional theatre — every row is the direct evidence a buyer needs to satisfy *their* Annex I obligation by relying on *your* component.

| # | Document | What it proves to the buyer | CRA anchor |
|---|----------|------------------------------|------------|
| 1 | Cybersecurity risk assessment & design justification | The security properties were chosen deliberately, and any switched off are justified | Annex I Part I; Article 13 |
| 2 | Software bill of materials (SBOM) | You know what is inside your firmware, down to the dependencies | Annex I Part II(1) |
| 3 | Secure-boot & integrity evidence | The firmware that runs is the firmware you signed | Annex I Part I(2), points (d)(f)(k) |
| 4 | Coordinated vulnerability disclosure policy + contact point | There is a defined way to report a flaw and a named person who answers | Annex I Part II(5)(6) |
| 5 | Support-period & security-update commitment | Patches will exist, and for how long is in writing | Article 13; Annex I Part II(7)(8) |

<!-- IMAGE-SLOT: ep-4.06-kit | 1200x675 | alt: "Flat infographic: five tabbed document cards feeding into a single onboarding gate, each card a distinct shade from a muted blue-grey palette." | caption: "Five documents, one gate. Each card answers a question the buyer is contractually obliged to ask." -->

## 1. The risk assessment that justifies your design

This is the keystone, and most vendors skip straight past it to the technical controls. Don't. Article 13 requires the manufacturer to run a cybersecurity risk assessment and carry its outcome through design, production and maintenance. That assessment is not a formality that sits in a drawer — it is the document that *decides which controls you owe*.

Read Annex I Part I carefully and you see two tiers. Point (1) is unconditional: the product must be designed to an appropriate level of cybersecurity based on the risks. Point (2) — the familiar list of properties like secure-by-default configuration and encryption of data in transit and at rest — applies "on the basis of the cybersecurity risk assessment… and where applicable." That phrase is doing real work. Your risk assessment is what determines whether a given property in point (2) applies to your part, and how you implement it.

The practical consequence: if a property genuinely does not apply to your component — a passive sensor with no data at rest has little to encrypt at rest — you do not silently drop it. Article 13 obliges you to record a clear justification for that exclusion in the technical documentation. A Tier-1 auditor is not looking for every box ticked. They are looking for evidence that you *reasoned* about each one. "Secure by default: enabled, factory reset supported. Data-at-rest encryption: not applicable, no persistent user data, justification attached." That reads as a vendor who understands the regulation. A blank grid reads as a vendor who found it online.

## 2. The SBOM (build it once, hand it over)

Annex I Part II(1) requires you to identify and document the components in your product by drawing up a software bill of materials in a commonly used, machine-readable format — covering, at the very least, the top-level dependencies. That "at the very least" is the floor, not the ceiling — mature buyers will push you deeper — but top-level coverage is the line you must clear to be in scope at all.

I am not going to re-teach SBOM generation here, because [EP_4.02 on generating SBOMs that satisfy Tier-1 OEMs](/wiki/cra) covers the CycloneDX and SPDX mechanics, the bare-metal firmware tooling, and how to ship a machine-readable file without leaking proprietary IP. For the kit, the point is narrower: the SBOM is a *deliverable*, not a report you describe. A buyer's ingestion pipeline expects a file it can parse, diff against a vulnerability feed, and re-check on every release. Hand over a signed CycloneDX JSON that regenerates from your build, and item 2 is done.

## 3. Secure-boot and integrity evidence

Annex I Part I(2)(f) requires the product to protect the integrity of stored and processed data, commands, programs and configuration against manipulation not authorised by the user. For an embedded component, that obligation lands squarely on the boot chain: the firmware that executes must be the firmware you signed and shipped. Point (2)(d) adds protection against unauthorised access; point (2)(k) adds reducing an incident's blast radius through exploitation-mitigation techniques.

The evidence a buyer wants is concrete and short. A description of the secure-boot implementation — where the root of trust lives, how signatures are verified, what happens on a verification failure. Confirmation that firmware images are signed and that the device rejects unsigned or downgraded images. If you use a hardware-backed key or one-time-programmable fuses, say so. This is the one item where a two-page technical note beats a policy statement, because the auditor can map your note straight onto the integrity property they are obliged to confirm before they trust your part inside their product.

## 4. Your CVD policy and a single point of contact

Annex I Part II(5) requires manufacturers to put in place and enforce a policy on coordinated vulnerability disclosure. Part II(6) requires you to provide a contact address for reporting vulnerabilities discovered in your product. Article 13 reinforces this with the obligation to designate a single point of contact that lets users reach you directly. Three obligations, one artefact: a published CVD policy with a monitored channel behind it.

The failure mode here is comic and common — a startup lists `security@` on nobody's inbox, or worse, routes disclosure to a general sales address. A Tier-1 will test it. The document itself is short: how a researcher reports a flaw, what acknowledgement window you commit to, how you handle embargo and credit, and who owns the response. The deep operational side — triage, timelines, advisory drafting — belongs to the disclosure playbook covered elsewhere in this programme; for onboarding, you need the policy to exist, the contact to be real, and someone to actually be on the other end.

## 5. The support-period and security-update commitment

The last document is the one buyers increasingly read first, because it is where vendors overpromise and underfund. Article 13 sets a hard floor: the support period must be at least five years, unless the product is genuinely expected to be in service for less, in which case it matches that shorter expected use. You determine the period, using reasonable user expectations and the nature of the product — but you cannot set it below the statutory minimum, and you must publish the end date, at least the month and year, at the time of purchase.

Two more commitments ride alongside it. Annex I Part II(7) and (8) require mechanisms to distribute updates securely and to disseminate available security updates without undue delay. And any security update you issue during the support window has to remain available afterward for ten years, or for the rest of the support period, whichever is longer. For a component supplier, the document is a plain statement: our support period for this part runs to [month/year]; updates are signed and delivered through [channel]; issued fixes stay downloadable for at least ten years. A buyer designing a machine with a fifteen-year service life is quietly checking whether your five years leaves them stranded — so a realistic, funded number here wins more trust than an optimistic one you'll quietly abandon.

## What a Tier-1 auditor is actually checking

None of this waits on the harmonised standards. As of this writing no EN standard granting a presumption of conformity has been published in the Official Journal, and the first citations are not expected until well into 2027. Component suppliers who sit on their hands until then will be assembling this kit under deadline pressure alongside everyone else. The vendors who win now are the ones mapping their evidence onto the process references buyers already use — IEC 62443-4-2 for component security properties, 62443-4-1 for the secure development lifecycle behind items 1 through 5. Frame the kit that way and a sophisticated buyer recognises it immediately.

Look back at the five documents and notice what they are not: they are not a certification, a notified-body audit, or a six-figure compliance programme. They are the minimum viable evidence that you took the regulation seriously before the buyer asked. That is the whole difference between a supplier a Tier-1 has to babysit and one they can rely on to carry part of their own Annex I obligation.

If you want to see how these five map onto the live statutory text — Annex I Part I, Part II, and the Article 13 support duties — and pressure-test your own kit against a buyer's questionnaire, walk it through the interactive CRA wiki and conformity workspace: [start with the CRA wiki](/wiki/cra), then [take the guided tour](/tour).
