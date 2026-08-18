---
id: "EP_7.03"
canonical_code: "EP_7.03"
title: "Drafting the EU Declaration of Conformity: The Annex V Field List and the Language Rules"
subtitle: "The declaration is one page long and it is the document that carries your entire CRA liability. Annex V fixes eight fields; a missing standard reference or an untranslated copy can hold your product at the border. Here is the line-by-line."
slug: "ep-7.03-eu-declaration-of-conformity-annex-v-drafting"
series_id: 7
episode_number: 3
series: "Conformity Assessment, Audits & CE Marking"
target_persona: "Regulatory Affairs Specialists, Legal Counsel, Product Managers."
persona_category: "Regulatory Affairs & Compliance"
statutes: ["Article 28", "Annex V", "Annex VI"]
statutory_domain: "Conformity Assessment & CE Marking"
difficulty: "Intermediate Compliance"
key_metric: "Annex V — 8 required fields"
read_time: "8 min read"
duration: "15:40"
audio_url: "https://oxot.ai/audio/cra_podcast/EP_7.03.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["Cyber Resilience Act", "Regulation (EU) 2024/2847", "EU declaration of conformity", "Annex V", "Annex VI", "simplified declaration of conformity", "CE marking", "harmonised standards", "Regulatory Affairs", "customs border hold"]
takeaways: ["Annex V fixes eight required fields for the full EU declaration of conformity; the two that get products stopped are the harmonised-standard references (field 6) and the notified-body block (field 7, conditional on the route you chose)", "Article 28 makes the declaration a translation obligation, not just a drafting one: a copy must be available in the language(s) required by every Member State where the product is placed or made available — 27 possible markets, one document per language", "Annex VI is the short form: a URL-based simplified declaration you can ship with the product or behind a QR code, but the address must be exact and the full Annex V text must stay live for the whole retention period"]
---

# Drafting the EU Declaration of Conformity: The Annex V Field List and the Language Rules

*By Jim McKenney — Digital Product Security Consultant & Industrial OT Architect*

A shipment of networked controllers sits in a bonded warehouse at Rotterdam. The technical file is complete, the conformity assessment passed, the CE mark is on the housing. What stopped the pallet is one page: the EU declaration of conformity in the box lists the product, the manufacturer, and a clean statement of conformity, but it names no harmonised standard and no common specification. A market surveillance officer reading it cannot tell what the manufacturer measured conformity *against*. Field six is blank. Until a corrected declaration arrives, the goods do not move.

That is the declaration's real weight. It is the shortest document in your CRA compliance stack and the only one that a customs officer, a distributor, or a plaintiff's lawyer reads first. Everything else lives in the technical file and is read later, if at all: the test reports, the risk assessment, the SBOM. The declaration is the cover sheet the whole regime is built on, and Annex V tells you exactly what has to be on it. Get it wrong and the strongest technical file in the industry cannot rescue the shipment, because nobody at the border opens the technical file.

<!-- IMAGE-SLOT: ep-7.03-hero | 1200x630 | alt: "A pallet of networked industrial controllers held in a bonded customs warehouse, with a single-page EU declaration of conformity flagged and a highlighted blank field where the harmonised-standard reference should be" | caption: "One blank field on a one-page document. The technical file was complete; the declaration was not, and the declaration is what the border reads." -->

## What the declaration actually is

Under Article 28, the manufacturer draws up the EU declaration of conformity, gives it the model structure set out in Annex V, and by signing it states that the product meets the essential cybersecurity requirements. Signing is the operative act. The declaration is where the manufacturer personally assumes legal responsibility for the product's conformity; it is not a summary of the assessment, it *is* the assumption of liability. That is why the sole-responsibility statement (field 3) is not boilerplate you can soften. It means what it says.

Two things follow. The declaration must be accurate to the product actually shipped, and it must be complete against all eight Annex V fields. A declaration missing a required field is not a lesser declaration. It is a defective one, and a defective declaration undercuts the CE mark it is supposed to support.

## A filled-in declaration, annotated

Here is the full form, populated for an illustrative manufacturer. The company, addresses, and certificate numbers are invented; the field structure follows Annex V.

```
EU DECLARATION OF CONFORMITY

1. Product:        Northwind Controls PLC-7 Series Programmable Controller,
                   models 7100 / 7200 / 7400, firmware 3.x
                   (unique identifier: NC-PLC7-2027)

2. Manufacturer:   Northwind Controls GmbH,
                   Industriestrasse 14, 40213 Düsseldorf, Germany

3. This declaration of conformity is issued under the sole
   responsibility of the manufacturer.

4. Object:         The programmable controller identified above,
                   traceable by the type plate and firmware version
                   (photograph attached where appropriate).

5. The object described above is in conformity with the relevant
   Union harmonisation legislation:
     - Regulation (EU) 2024/2847 (Cyber Resilience Act)
     - Directive 2014/30/EU (EMC)          [if also applicable]

6. Conformity is declared in relation to the following harmonised
   standards / common specifications:
     - EN 18031-1:2024  (or the standard cited in the OJEU list)

7. Notified body:  [Where applicable] EthosCert Notified Body 2XXX
                   carried out [module], certificate NB-2027-04471.

8. Signed for and on behalf of Northwind Controls GmbH,
   Düsseldorf, 14 March 2027.
   A. Meyer, Head of Product Compliance.       [signature]
```

Walk it field by field, because the fields are not equally dangerous.

**Fields 1 and 4 look redundant and are not.** Field 1 is *identification* — the name, type, and any information that uniquely pins down which product this is (model numbers, firmware family, a part or batch identifier). Field 4 is the *object of the declaration*: the specific thing the statement covers, described so it is traceable back to a physical unit, optionally with a photograph. Field 1 tells a reader what the product is called. Field 4 lets an inspector match the paper to the box in front of them. Vague identification here is the quiet failure: "PLC-7 series" with no firmware scope leaves you unable to prove which units a given declaration governs when the range diverges.

**Field 2** is the manufacturer or its authorised representative, with a real postal address. A trading name with no legal entity behind it is a defect.

**Field 5 is the conformity statement, and it is plural.** It names the Union legislation the product conforms to. If your controller is also within scope of, say, the EMC Directive or the Radio Equipment Directive, Article 28 requires a *single* declaration covering all of those acts, listing each one with its publication reference. One product, one declaration, every applicable act named. Splitting them into separate CRA-only and EMC-only sheets is a common and avoidable error.

**Field 6 is the field that held the pallet in Rotterdam.** It lists the harmonised standards, common specifications, or cybersecurity certifications you declared conformity in relation to. This is where the presumption of conformity is claimed, and an empty field six is a declaration that asserts compliance while pointing at nothing. Which standards belong here, and why citing a listed one buys you a legal presumption, is its own subject — that is [the presumption of conformity and harmonised standards](/blog/ep-7.05-presumption-of-conformity-harmonised-standards). For the declaration, the rule is narrow: whatever you actually used, name it precisely, with its reference and year.

**Field 7 is conditional, and the condition is your assessment route.** "Where applicable, the name and number of the notified body." If you self-assessed, this field is legitimately empty and should stay empty; inventing a notified body reference is fraud. If a third party was required, its name, number, the procedure it ran, and the certificate it issued all go here. Whether a notified-body number appears on your declaration at all is decided upstream, when you pick the module — that decision belongs to [self-assessment versus the notified-body modules](/blog/ep-7.01-self-assessment-vs-notified-body-modules-a-b-c-h). Fields six and seven together are what a surveillance officer scans first, because they reveal in two lines whether you have a defensible basis for the CE mark or an assertion.

**Fields 3 and 8** are the signature block: the sole-responsibility statement, and the place, date, name, function, and signature of whoever binds the company. An unsigned declaration is not yet a declaration.

<!-- IMAGE-SLOT: ep-7.03-annotated-doc | 1200x820 | alt: "A single-page EU declaration of conformity with the eight Annex V fields numbered and callout annotations marking field 6 (harmonised standards) and field 7 (notified body, conditional) as the high-risk fields" | caption: "The eight Annex V fields, annotated. Fields 6 and 7 carry the legal weight; fields 1 and 4 carry the traceability." -->

## The declaration is a translation obligation

Here is the part regulatory teams under-scope. Article 28 does not only tell you what to write; it tells you what language to write it in. The declaration must be made available in the language or languages required by each Member State where the product is placed on the market or made available. Sell into France, Germany, Poland, and Spain and you owe a conforming declaration in each of those languages, to each of those national requirements.

That reframes the declaration from a drafting task into a version-controlled, multi-language artifact. Every field-six standard update, every added model, every new market means the translated copies move in lockstep with the master. A German original and an out-of-date French translation are not one declaration in two languages; they are one valid declaration and one liability. Treat the language set as part of the document's definition, not a downstream formatting step.

The practical trap is ownership. Drafting the declaration usually sits with regulatory affairs, but the translations often get handed to whoever handles product localisation, on a different schedule and a different tracker. When those two workstreams drift, the master says one thing and the market copies say another, and a surveillance authority reading the local-language version is reading the one that governs in that market. The declaration is only ever as current as its least-current translation.

<!-- IMAGE-SLOT: ep-7.03-language-map | 1200x675 | alt: "A master EU declaration of conformity fanning out into multiple translated copies mapped to different EU member-state markets, each tied back to the same version number" | caption: "One master, many languages. Every market where the product is placed or made available sets the language it must be available in." -->

## The short form: Annex VI and the QR-linked declaration

You do not always ship the full page. Manufacturers must provide either a copy of the full EU declaration of conformity or a *simplified* declaration with the product (Article 13(20)). The simplified form has its own model structure in Annex VI, and it is deliberately short: a single sentence naming the manufacturer and the product type and stating that it complies with Regulation (EU) 2024/2847, followed by the exact internet address where the full Annex V declaration lives.

That is the mechanism behind the QR code on the label. The code resolves to a URL; the URL serves the full declaration. It is genuinely useful (it keeps the physical package clean and lets you update the hosted copy), but it moves the risk to two places. The address must be exact and stable, because a simplified declaration pointing at a dead link is a simplified declaration pointing at nothing. And the full declaration behind it, in every required language, must stay reachable for as long as you are obliged to keep it: the market surveillance authorities can ask for it for at least ten years after the product is placed on the market, or the support period, whichever is longer. That retention window is the same clock that governs [the technical documentation archive](/blog/ep-7.04-10-year-technical-documentation-archive-annex-vii). A QR code that 404s in year six is a compliance failure with a timestamp on it.

You can see the full field list and the simplified form rendered against a real product in the [demo](/demo), and the surrounding obligations mapped in the [CRA wiki](/wiki/cra).

A complete, signed, correctly translated declaration is not the reward for conformity — it is the only proof of it that anyone reads before your product is allowed to move.
