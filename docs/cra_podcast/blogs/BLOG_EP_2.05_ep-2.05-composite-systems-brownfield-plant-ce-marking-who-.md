---
id: "EP_2.05"
canonical_code: "EP_2.05"
title: "Composite Systems & Brownfield Plant CE Marking: Who Owns the Nameplate?"
subtitle: "Bolt certified pumps, drives, and controllers onto one skid and you have made a new product with digital elements. The component CE marks do not transfer — the technical file, the declaration, and the nameplate are now yours."
slug: "ep-2.05-composite-systems-brownfield-plant-ce-marking-who-"
series_id: 2
episode_number: 5
series: "The System Integrator & EPC Shield"
target_persona: "Plant Engineering Managers, Skid Builders, OEM Machinery Integrators."
persona_category: "EPC & Integrators"
statutes: ["Article 22", "Article 28", "Article 30", "Article 31"]
statutory_domain: "System Integration & CE marking"
difficulty: "Advanced Engineering"
key_metric: "Who owns the composite technical file"
read_time: "8 min read"
duration: "14:15"
audio_url: "https://oxot.ai/audio/cra_podcast/EP_2.05.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["Cyber Resilience Act", "Regulation (EU) 2024/2847", "composite systems", "skid CE marking", "brownfield plant", "Declaration of Incorporation", "EU Declaration of Conformity", "Machinery Regulation 2023/1230", "Article 30", "system integrator", "industrial OT security"]
takeaways: ["Why component CE marks never add up to a system CE mark — and who mints the new one", "Declaration of Incorporation vs Declaration of Conformity vs the CRA's EU Declaration of Conformity, in one table", "When a brownfield retrofit becomes a substantial modification that puts your name on the nameplate"]
---

# Composite Systems & Brownfield Plant CE Marking: Who Owns the Nameplate?

*By Jim McKenney — Digital Product Security Consultant & Industrial OT Architect*

The CE nameplate on a composite skid is not a sticker. It is a signature. Whoever's name is on that control cabinet has, in the eyes of Regulation (EU) 2024/2847, authored a new product with digital elements — and authorship is the whole liability. The pumps, the drives, the controllers each arrived with their own CE marking and their own declarations. None of that authorship transfers to you. The moment you bolt those parts onto a frame, wire them into one control system, and ship the result under your logo, you have made something that did not exist before. The technical file for that something is yours to build and yours to defend for a decade.

That is the uncomfortable centre of this episode. Skid builders and EPC integrators have spent thirty years treating a box of supplier declarations as the compliance evidence for the finished assembly. Under the CRA, it isn't — and the day a market surveillance authority asks for the technical documentation of the *system*, the folder full of component certificates is not the answer to the question they asked.

<!-- IMAGE-SLOT: hero | 1200x630 | alt: "A composite process skid with pumps, a variable-frequency drive, and a control cabinet whose blank nameplate is the focal point" | caption: "The name on the cabinet is the name on the technical file. The composite is a new product, not a sum of certified parts." -->

## Three CE marks don't make a fourth

Every component you buy is already a product with digital elements in its own right, and its manufacturer has already done that product's conformity work. Good. That is their file, for their box, against their intended use.

Combining conforming parts does not produce a conforming system. The composite skid is a distinct product, and it is assessed against the Annex I essential requirements *as a whole* — the attack surface you created by networking three vendors' devices together did not exist in any of their individual assessments. So the obligations land on the integrator who places the assembly on the market:

- You draw up the technical documentation for the composite (**Article 31**).
- You demonstrate conformity and sign the EU declaration of conformity for it (**Article 28**).
- You affix the CE marking to the assembly, before it leaves for the customer (**Article 30**).

The component declarations don't disappear — they become *inputs* to your file, the evidence you rely on for the parts you didn't build. But they are inputs, not substitutes. Three CE marks in the enclosure do not mint a fourth for the enclosure. You mint it, when you sign.

<!-- IMAGE-SLOT: component-vs-system | 1200x675 | alt: "Diagram showing several component CE marks feeding into a single new system CE mark at the skid nameplate" | caption: "Component marks are inputs to the file, not the system mark. A new declaration is minted at the nameplate." -->

## Two doors into the manufacturer's chair

There are two ways your name ends up on that nameplate, and integrators walk through the second one without noticing.

The first is the ordinary door. You engineer a new integrated product and place it on the market under your own name or trademark. No special provision is needed to make you responsible — you are simply its manufacturer, with the full obligation set.

The second is the brownfield door, and it is the one that surprises people. You take a skid, a line, or a machine that is *already* on the market and you change it. **Article 22** says a party other than the original manufacturer who carries out a substantial modification and then makes the product available becomes the manufacturer — for the part affected, or for the whole product if the change touches the cybersecurity of the whole. A substantial modification (**Article 3(30)**) is a post-market change that affects compliance with the Annex I essential requirements, or that changes the intended purpose the product was assessed for.

Retrofit a network-capable controller into a fifteen-year-old skid, expose it to the plant network, and you have almost certainly crossed that line. The security posture the original equipment was assessed under no longer describes what is running on the floor. You didn't buy a new machine — but you did become the manufacturer of the one you modified.

> [!NOTE]
> Routine security patching is deliberately carved out. Shipping updates that restore or maintain security — the thing the CRA wants you to do — is not what turns you into a manufacturer. The trigger is a change to *what the product is or does*, not keeping it safe at what it already does.

## Declaration of Incorporation vs Declaration of Conformity: three instruments, two regimes

Here is where the composite-machinery world and the CRA world collide, and where I see the most expensive confusion. A skid is very often *both* machinery under the Machinery Regulation (EU) 2023/1230 **and** a product with digital elements under the CRA. Those are two separate laws with two separate declaration systems, and they do not map one-to-one.

The Machinery Regulation has an escape hatch the CRA does not: **partly completed machinery**. If you supply an assembly that cannot perform an application on its own and is meant to be built into something else, you issue a *Declaration of Incorporation*, ship assembly instructions, and you do **not** CE-mark it as machinery. The party who finishes it into working machinery issues the *Declaration of Conformity* and affixes CE. The declaration of incorporation is how a sub-supplier hands final responsibility downstream.

| Instrument | Applies to | Carries a CE mark? | Who issues it |
|---|---|---|---|
| **Declaration of Incorporation** (Machinery Reg 2023/1230) | Partly completed machinery — can't function alone, meant for incorporation | **No** — assembly instructions travel instead | Maker of the partly completed machinery |
| **EU Declaration of Conformity** (Machinery Reg 2023/1230) | Complete machinery ready to perform its application | **Yes** — machinery CE | Whoever places the complete machine on the market (often the integrator) |
| **EU Declaration of Conformity** (CRA, Article 28) | Any product with digital elements placed on the market | **Yes** — CE affixed under Article 30 | The manufacturer of the product with digital elements |

> [!WARNING]
> The Machinery Regulation is separate legislation — it is **not** part of the CRA and not covered in the CRA statutory corpus, so treat this section as general engineering guidance and confirm it with your machinery-safety and legal advisors. Here is the trap to verify against counsel: the CRA's own scope exclusions (**Article 2**) name medical devices, vehicle type-approval, aviation-certified equipment, and marine equipment — not machinery. On that reading, there is no "partly completed machinery" carve-out in the CRA, and a skid can be partly completed machinery (declaration of incorporation, no machinery CE) yet still be a product with digital elements the instant it is made available on the market, with CRA duties attaching regardless of its machinery status. Do not assume a Declaration of Incorporation discharges your cybersecurity obligations before that reading is confirmed — it answers a different question, against a different annex. (Dates worth holding, pending your own verification: the Machinery Regulation applies from 20 January 2027; the CRA's CE-marking and core product obligations from 11 December 2027.)

## The one nameplate that carries both

The good news for the integrator who accepts they own the file: you consolidate, you don't duplicate. Where a product falls under more than one Union act that each demand an EU declaration of conformity, you draw up a **single** declaration covering all of them, naming each act. And where other harmonisation legislation also requires CE marking, the one CE mark you affix signals conformity with all of it. The composite skid that is both machinery and a product with digital elements does not wear two competing nameplates — it wears one mark and carries one consolidated declaration that references both regimes.

That is the whole reason to stop pretending the supplier certificates cover you. Consolidation only works if there is a single responsible party assembling the evidence. That party is whoever signs. And you can only sign for what you can actually evidence — which means the component SBOMs, the sub-supplier declarations, and your own integration-level Annex I assessment all have to live in one file with your name on the cover.

Until the CRA harmonised standards are published in the Official Journal — none have been, as of writing — there is no presumption-of-conformity shortcut to lean on. The defensible baseline for the integration layer is IEC 62443: the 4-1 secure-development process for how you build the skid's control system, and 3-3 for the system security level you assessed it against, both mapped to Annex I. Build that mapping now; you will not get the standards handed to you before the deadline.

## What to do before your next FAT

Walk the shop floor and read your own nameplates. For every composite skid, line, or panel you have shipped or are about to ship, answer three questions on one line each: *Whose name is on the cabinet? Do we hold an integration-level technical file for the assembly — not just the component certificates? And if this is a brownfield retrofit, did our change touch the security posture the original was assessed under?* The skids where the name is yours and the file is missing are exactly the ones where you are already the manufacturer and don't yet have the paperwork to prove it — those are the units to fix before Factory Acceptance, not after a market surveillance letter.

If you want to see what an integration-level technical file actually contains before you build one from scratch, [put one of your skids through the conformity workspace](/demo) and watch which evidence it flags as missing.
