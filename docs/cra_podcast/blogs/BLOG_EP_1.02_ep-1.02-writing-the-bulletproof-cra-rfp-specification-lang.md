---
id: "EP_1.02"
canonical_code: "EP_1.02"
title: "Writing the Bulletproof CRA RFP: Specification Language for Asset Owners"
subtitle: "The Cyber Resilience Act binds your supplier, not you. Your RFP is the only place you get to control what actually shows up on the loading dock in 2027."
slug: "ep-1.02-writing-the-bulletproof-cra-rfp-specification-lang"
series_id: 1
episode_number: 2
series: "The Procurement & Contracting Crisis"
target_persona: "Utility Procurement Officers, Data Center Builders, Industrial CISOs."
persona_category: "Plant CISOs & Asset Owners"
statutes: ["Article 13", "Article 14", "Annex I"]
statutory_domain: "Contracting & Procurement"
difficulty: "Practitioner"
key_metric: "Contractual CRA flow-down"
read_time: "7 min read"
duration: "14:15"
audio_url: "https://oxot.ai/audio/cra_podcast/EP_1.02.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-18"
keywords: ["CRA RFP language", "Cyber Resilience Act procurement", "SBOM requirements RFP", "Regulation (EU) 2024/2847", "secure by default OT", "security update SLA", "asset owner CRA obligations"]
takeaways: ["Five RFP clauses that flow CRA duties down to the OEM", "How to demand an SBOM you can actually verify at acceptance", "Why the 24-hour clock is a reporting duty, not a patch SLA — and how to write the patch SLA yourself"]
---

# Writing the Bulletproof CRA RFP: Specification Language for Asset Owners
*By Jim McKenney — Digital Product Security Consultant (Industrial OT, CRA, IEC 62443)*

The Cyber Resilience Act puts the legal duty on the manufacturer, not on you. That sounds like good news for a buyer until you trace where the risk lands. The OEM has to ship a conforming product — but if your specification is silent, you find the gaps at commissioning: the default admin password nobody changed, the SBOM that never arrives, the firmware that goes end-of-life two years into a fifteen-year asset. And you pay to close them, as change orders, at the supplier's price.

Here's the reframe for this episode: your RFP is the one moment where a statutory duty you can't enforce becomes a contractual deliverable you can. Three sentences in your specification force the OEM to absorb CRA compliance as a cost of the bid instead of passing it back to you as scope creep after award. And the timing is why it matters now: the CRA (Regulation (EU) 2024/2847) has been in force since December 2024, the manufacturer reporting duties start **11 September 2026**, and the core obligations — CE marking against the essential requirements — apply from **11 December 2027**, so equipment you contract for today and take delivery of in 2027 or beyond lands squarely inside the regime. This post is the language for those three sentences. (Engineering and procurement analysis, not legal advice — have counsel adapt the wording to your contract framework.)

<!-- IMAGE-SLOT: hero | 1200x630 | alt: "A procurement specification document with CRA clauses highlighted, beside an industrial control cabinet" | caption: "The RFP is the acceptance gate. Everything you don't write down becomes a change order later." -->

## Why the buyer holds the weak end of the stick

Under the CRA, the party placing the product on the EU market carries the obligations — for a packaged PLC, an RTU, a switch, a data-center PDU controller, that's the manufacturer or importer. As the asset owner operating the equipment, you're generally a *user*, not an economic operator, right up until you substantially modify the product yourself and inherit manufacturer duties (that trap is its own episode). Being the user means you can't lean on the regulation to force your supplier to do anything *for you*: it tells the manufacturer to build securely and report vulnerabilities to authorities, not to hand *you* an SBOM, hit *your* patch deadline, or notify *you* on any clock. That gap — between "the OEM has a public duty" and "the OEM owes me a deliverable" — is exactly what a good RFP closes.

Your position is stronger than it feels. An OEM that gets CRA conformity wrong faces fines up to €15,000,000 or 2.5% of worldwide annual turnover. They're already doing the work. Your clauses just make it contractually visible, verifiable, and yours to accept or reject.

## The three sentences

If you take nothing else from this episode, add these to your next specification. Each one converts a statutory duty into an acceptance condition.

1. *"At delivery, the Supplier shall provide the EU Declaration of Conformity and CE marking for the product, and shall make the supporting technical documentation available on request; non-conformity at acceptance is a rejectable defect."*
2. *"The Supplier shall deliver a machine-readable Software Bill of Materials (CycloneDX or SPDX) at acceptance and with every firmware release, and shall declare the product's security-update support period and its end-of-support date in writing."*
3. *"The Supplier shall notify the Buyer of any actively exploited vulnerability or severe incident affecting the product within 24 hours of the Supplier becoming aware, and shall deliver a remediating security update within the timeframes defined in the Patch SLA below."*

Everything that follows is how to make those three sentences bite at acceptance instead of reading like boilerplate the OEM signs and ignores.

## Clause 1 — Conformity as an acceptance gate, not a promise

A CE mark is a claim. The RFP job is to make it testable at your dock — reference Annex I directly and tie it to acceptance:

> *"The product shall conform to the essential cybersecurity requirements of Annex I of Regulation (EU) 2024/2847. The Supplier shall provide the EU Declaration of Conformity, evidence of the applied conformity assessment route, and, on request, the technical documentation. Failure to demonstrate conformity is grounds for rejection and withholding of acceptance."*

Two practitioner notes. Don't accept "will be compliant by 2027" for equipment you commission in 2026 — write a milestone that requires the DoC no later than the CRA application date or at handover, whichever is later, and hold retention against it. And because the manufacturer must keep the DoC and technical documentation available for at least 10 years (or the support period, if longer), bind your "on request" right to the contract term, not the delivery date, so it survives the life of the asset.

## Clause 2 — The SBOM you can actually verify

Here's where old procurement templates go wrong: they demand "a CycloneDX v1.6 SBOM" as if the regulation says so. It doesn't. The CRA requires an SBOM "in a commonly used and machine-readable format covering at the very least the top-level dependencies." Two consequences for your RFP.

- **Top-level dependencies is the legal floor, not your target.** Top-level only is nearly useless for a fifteen-year OT asset, where the risk lives three layers down in some transitive library. Demand full-depth resolution explicitly, so the OEM can't hide behind the statutory minimum.
- **Specify the format by capability, not by fiat.** Name CycloneDX *or* SPDX, current versions, and require that the file **parses, resolves, and diffs**. An SBOM you can't ingest into your own SCA tooling is a PDF pretending to be data.

> *"The Supplier shall deliver a Software Bill of Materials in CycloneDX or SPDX (current version) at acceptance and with each subsequent firmware or software release. The SBOM shall enumerate components to full transitive depth, include version and supplier for each component, and be machine-readable such that it validates against the named schema and can be programmatically compared release-to-release. A missing or non-parsing SBOM is an acceptance defect."*

Verification at acceptance: pipe it through your scanner, confirm it resolves against a vulnerability database, and diff it against the prior release. If the diff is empty across a firmware bump, the OEM isn't maintaining it.

## Clause 3 — Support period and the patch SLA you write yourself

This is the clause most buyers get backwards, so be precise. The CRA's 24-hour clock is a *reporting* duty — the manufacturer notifies the coordinating CSIRT and ENISA of an actively exploited vulnerability within 24 hours, a fuller notification within 72 hours, a final report within 14 days of a fix. That is an obligation to *the authorities*. It is not a promise to deliver *you* a patch on any timeline.

The CRA does give you a backbone: a support period of **at least five years** (or the expected use time, if shorter), security updates that stay available for a minimum of **10 years** after issue or the remainder of the support period, and an end-of-support date stated at time of purchase. Take that backbone and add the SLA the regulation doesn't:

> *"The Supplier shall declare the security-update support period (minimum five years from delivery) and the end-of-support date in writing at acceptance. The Supplier shall notify the Buyer of any actively exploited vulnerability affecting the product within 24 hours of becoming aware, on the same clock as its regulatory notification. The Supplier shall deliver a security update or documented mitigation within [X] days for Critical and [Y] days for High severity vulnerabilities, provided separately from functionality updates. Security updates shall remain retrievable for the greater of 10 years or the support period."*

Fill in X and Y for *your* maintenance-window reality — a plant on a six-month turnaround cadence negotiates these numbers differently than a data center. The point is that you set them, in the contract, instead of discovering the OEM's default of "next scheduled release" during an active exploit.

## Clause 4 — Secure-by-default and hardened configuration

Annex I requires a secure-by-default configuration, protection against unauthorised access, and the ability to reset to a known-good state. Translate that into things your commissioning engineer can check by hand:

> *"The product shall be delivered in a secure-by-default configuration: no default or shared credentials, unused services and ports disabled, and cryptographic protection for data in transit and at rest per Annex I. The Supplier shall provide a hardening guide and a documented factory-reset procedure. The Buyer may verify the delivered configuration at acceptance."*

If the device arrives with `admin/admin`, it fails acceptance. Write it so that sentence is contractually true.

## Clause 5 — Vulnerability and incident notification flow-down

The manufacturer must run a coordinated vulnerability disclosure policy, maintain a single point of contact, and publicly disclose fixed vulnerabilities. Flow those down as named obligations so the channel exists before you need it, not one you're hunting for mid-incident:

> *"The Supplier shall designate a single security point of contact, maintain a coordinated vulnerability disclosure policy, and provide the Buyer machine-readable advisories (e.g. CSAF/VEX where available) for vulnerabilities affecting the delivered product for the support period."*

VEX earns its place here: it lets the OEM tell you which listed CVEs actually affect your configuration, so you triage on evidence instead of scanner noise.

## How the clauses map to acceptance

Every clause works the same way — a duty the OEM already owes the regulator becomes a deliverable it owes you, with a concrete test your team runs before signing acceptance. Conformity: the DoC and CE marking are present, or the goods are rejected. SBOM: the file parses, resolves against a vulnerability database, and diffs against the prior release. Support: the end-of-support date is in writing and the patch SLA is signed. Notification: the named security contact is live before go-live. If any test fails at the dock, you have grounds to withhold acceptance — which is the whole point of putting it in the RFP.

## What not to over-specify

Two failure modes to avoid. Don't mandate a specific harmonised standard as a pass/fail gate yet — none have been published in the Official Journal, so demanding conformity to a named EN that doesn't exist creates an unbiddable requirement. Ask for conformity to Annex I and let the OEM show their route. And don't pin the SBOM to one tool's exact schema version, or you'll re-issue the RFP every release cycle. Specify the capability — parses, resolves, diffs — and let the format track the ecosystem.

> [!TIP]
> Draft these five clauses once as a reusable CRA annex to your master specification, with the SLA numbers as fill-in fields. Every RFP after that is a copy-paste plus a two-minute risk conversation, not a fresh legal exercise.

## Draft it, then pressure-test it

Pull the exact Annex I requirements and the Article 13 and 14 text in the [CRA reading room](/wiki/cra) before you finalise wording — cite the duty, not a paraphrase. Then, to watch the SBOM parsing and advisory checks these clauses demand actually run at scale, [take the platform tour](/tour).

Write the specification you wish your last supplier had been held to. The 2027 deadline is doing the hard part for you — the OEM's duty already exists. Your job is three sentences that make it yours to verify.
