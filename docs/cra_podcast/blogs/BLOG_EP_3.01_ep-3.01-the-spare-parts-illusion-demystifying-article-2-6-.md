---
id: "EP_3.01"
canonical_code: "EP_3.01"
title: "The Spare-Parts Illusion: When a Replacement Part Is (and Isn't) Exempt"
subtitle: "Plant teams treat every replacement part as outside the CRA. Article 2(6) exempts a much narrower thing — an identical component built to the same specification. Chip obsolescence quietly breaks both conditions."
slug: "ep-3.01-the-spare-parts-illusion-demystifying-article-2-6-"
series_id: 3
episode_number: 1
series: "Brownfield OT, Spare Parts & Maintenance"
target_persona: "Maintenance Managers, Reliability Engineers, Plant Operations."
persona_category: "Plant CISOs & Asset Owners"
statutes: ["Article 2(6)", "Recital 29"]
statutory_domain: "Brownfield & Legacy OT"
difficulty: "Legal Triage"
key_metric: "Article 2(6) Exposure"
read_time: "8 min read"
duration: "14:15"
audio_url: "https://oxot.ai/audio/cra_podcast/EP_3.01.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["Cyber Resilience Act", "Regulation (EU) 2024/2847", "Article 2(6) spare parts exemption", "Recital 29", "identical component same specification", "chip obsolescence", "form-fit-function replacement", "brownfield OT maintenance"]
takeaways: ["A five-row spares-classification matrix for deciding which parts are actually out of CRA scope", "Why 'same part number' stops meaning 'same specification' during chip obsolescence", "The identical-spec evidence a market-surveillance auditor will actually ask for"]
---

# The Spare-Parts Illusion: When a Replacement Part Is (and Isn't) Exempt
*By Jim McKenney — Digital Product Security Consultant & Industrial OT Architect*

Walk any maintenance shop and you will hear the same shorthand: *spares are exempt from the CRA*. The stores are legacy, the machines predate the rules, and a replacement part just puts a line back the way it was — so surely none of it is in scope. It is a comfortable belief, and it is repeated confidently enough that whole procurement policies are being written on top of it.

The belief is wrong in a specific, expensive way. The Cyber Resilience Act does carve out spare parts — but the carve-out is far narrower than "spares," and the thing that breaks it most often is the one force every reliability engineer already fights: obsolescence. Take the belief apart, condition by condition, and you can see exactly where it breaks.

<!-- IMAGE-SLOT: ep-3.01-hero | 1200x630 | alt: "A maintenance technician holds two near-identical PLC control boards side by side at an aging industrial cabinet, one board tagged with a red flag" | caption: "Same part number, same footprint — a different silicon revision. Only one of these boards is outside CRA scope." -->

## Read the exemption, not the summary

Here is what the regulation actually says. Under Article 2(6), the CRA *does not apply to* "spare parts that are made available on the market to replace **identical components** in products with digital elements and that are manufactured according to the **same specifications** as the components that they are intended to replace."

Two conditions, joined by *and*. To sit outside the regulation, a spare must (1) replace an **identical** component, and (2) be built to the **same specification** as the part it replaces. Fail either and the exemption is gone — not weakened, gone. There is no partial credit for "basically the same," no allowance for "functionally equivalent," and no mention of "restoring original functionality." That last phrase is the everyday paraphrase people reach for, and it is looser than the text. The test is not whether the machine runs the same afterwards. It is whether the part is the same.

Notice what the exemption does *and does not* reach. It takes the qualifying spare part out of scope of the whole regulation: the party who makes that genuine identical part available on the market carries no CE marking, conformity assessment, or manufacturer duties *for the part as a spare*. What it never does is bless the machine you fit it into. Article 2(6) is about the component; whether swapping a *non-identical* part changes the host equipment is a different question, governed by the substantial-modification definition in Article 3(30) — the subject of the next episode. Keep the two apart or you will argue the wrong one.

Recital 29 explains why the door exists at all: so that products "can be repaired effectively and their durability extended." It also widens the comfort slightly — the exemption is meant to cover genuine repair spares for legacy products placed on the market before the rules apply on **11 December 2027**, as well as spares that already went through a conformity assessment once and shouldn't have to repeat it. Useful. But the recital states the *purpose*; it does not relax the *two conditions*. A pre-2027 machine does not get a blanket pass — its spares still have to be identical, same-spec parts to ride the exemption.

## Why "identical" quietly expires

Here is the part the shorthand ignores. In a semiconductor supply chain, "identical" has a shelf life, and it is usually shorter than the machine's.

Follow a single controller board through a decade of support. The OEM issues a last-time-buy notice on a microcontroller. The replacement silicon is a die-shrink of the original — same part family, same pinout, subtly different timing and a different mask revision. A capacitor goes end-of-life and the alternate-source substitute has a different ESR. The board still boots, still passes the functional test, still ships under the **same part number**. And it is no longer manufactured to the same specification as the component it replaces.

Firmware does the same thing more quietly. The "identical" spare board arrives with a newer bootloader, or a maintenance branch that patched a field issue, or a build flag flipped three revisions ago. Different specification. The label on the antistatic bag has not changed. The thing inside it has.

This is why the exemption leaks. Plant teams are matching **part numbers**, and Article 2(6) is testing **specifications**. Those two things track each other for a while and then, under obsolescence pressure, they drift apart — silently, because nobody re-reads a legal definition when they scan a barcode. A large share of what a stores system labels "spares" has crossed out of the exemption without a single alarm.

<!-- IMAGE-SLOT: ep-3.01-spec-drift | 1200x675 | alt: "Timeline diagram showing one stable part number across ten years while the underlying silicon revision, passive-component source, and firmware branch each change, crossing out of the identical-specification zone" | caption: "The part number holds steady; the specification underneath it drifts. Article 2(6) is measured against the lower line, not the top one." -->

## The spares-classification matrix

Sort your inventory against the two conditions, not against the label on the shelf. Most "spares" fall into one of these five buckets.

| The part in your hand | Inside Article 2(6)? | Why | If it's outside |
|---|---|---|---|
| Genuine OEM part, identical component, same firmware and silicon revision | **Yes** | Both conditions met — identical *and* same specification | — |
| Same OEM part number, but a newer silicon revision or alternate-source passive | **No** | Identical component, but **not** the same specification | It's a product with digital elements in its own right; expect it to carry conformity, a support period, and vulnerability handling |
| Same hardware, shipped with a newer firmware branch or bootloader | **No** | Specification changed by the software build | Treat as a CRA product; fitting it may also modify the host (Art 3(30)) |
| Form-fit-function "equivalent" from a third-party maker | **No** | Neither an identical component nor the same specification | Full CRA product; the equivalence is commercial, not statutory |
| Refurbished or re-flashed pull from another machine | **Depends — and you must prove it** | Only exempt if genuinely identical spec; provenance is usually the weak point | Without spec evidence, assume outside and document accordingly |

The pattern is blunt: only the top row is the "spare" of the folklore. Everything below it is a normal product with digital elements that happens to be shaped like a repair. And the parts most likely to slide down the table are exactly the ones obsolescence forces on you.

## The evidence an auditor will ask for

"It's an exempt spare" is a claim, and a market-surveillance authority is entitled to see it backed. The exemption is self-declared — there is no certificate that says *exempt* — so the burden of showing that both conditions are met sits with whoever relies on it. If you can't demonstrate identical-and-same-spec, you don't have an exemption; you have an assertion.

For any part you classify into that top row, the file needs to answer one question — *identical to what, and same specification how?* — with:

- The original component's specification of record: part number, hardware revision, and the firmware build that shipped in the machine as assessed.
- The incoming spare's matching data: revision, silicon/mask version where the OEM discloses it, passive-source changes, and firmware build — with the last-time-buy or substitution notices that prove nothing drifted.
- The OEM's written statement that the replacement is manufactured to the same specification, not merely "compatible" or "a suitable replacement." The marketing word for that is *equivalent*; the statutory word you need is *same*.
- A dated maintenance record tying the specific serialised part to the specific asset, so the classification is reconstructable years later.

If the OEM will only confirm functional compatibility, take that as your answer: treat the part as a full product with digital elements, and expect the support-period and vulnerability-handling duties that come with one. That is not a failure of procurement — it is the honest classification.

## Managing the drift on purpose

The obsolescence-management move is to stop deciding a part's status at the moment of failure, when a line is down and the only question is *will it fit*. Decide it at intake. Tag every spare, on receipt, as either **verified-identical** (spec evidence on file) or **treat-as-product** (anything short of that), and let the second bucket inherit the tracking any CRA product gets. When an OEM issues a last-time-buy or a revision notice, that is the signal to re-check the spec-of-record — not the day the replacement lands in a technician's hand.

Do that and two problems you already have get smaller. Non-identical parts stop masquerading as exempt in your records, which is the classification error an auditor finds fastest. And you build the running spec history that the *next* question — did fitting this part substantially modify the machine — depends on entirely.

Start with one line of your stores system this week. Add a single field to every digital spare: *identical-spec evidence — yes or no.* The parts that can't answer yes are your real Article 2(6) exposure, and they were hiding in plain sight under a part number that hasn't changed in a decade. The forty words of the exemption are worth reading against your own inventory rather than the shop-floor summary of them — the text and its recital are in the [CRA wiki](/wiki/cra).
