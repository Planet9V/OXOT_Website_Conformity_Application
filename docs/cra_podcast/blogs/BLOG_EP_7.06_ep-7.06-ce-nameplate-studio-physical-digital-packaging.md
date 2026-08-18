---
id: "EP_7.06"
canonical_code: "EP_7.06"
title: "CE Marking When the Board Is Smaller Than the Stamp: Physical, Digital & Packaging Rules"
subtitle: "The CE mark is treated as the trivial last step before the pallet ships. It is a set of rules with real exceptions: where the mark goes on the product, what happens when the product is too small to carry it, how software is handled, and when a notified-body number belongs beside it. This is the affixing reference for people who design the enclosure."
slug: "ep-7.06-ce-nameplate-studio-physical-digital-packaging"
series_id: 7
episode_number: 6
series: "Conformity Assessment, Audits & CE Marking"
target_persona: "Industrial Designers, Packaging Engineers, Manufacturing Operations."
persona_category: "Manufacturers & Product Owners"
statutes: ["Article 29", "Article 30", "Article 28"]
statutory_domain: "Conformity Assessment & CE Marking"
difficulty: "Advanced Engineering"
key_metric: "1 mark, 3 legal homes"
read_time: "8 min read"
duration: "12:20"
audio_url: "https://oxot.ai/audio/cra_podcast/EP_7.06.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["Cyber Resilience Act", "Regulation (EU) 2024/2847", "CE marking", "affixing the CE mark", "CE mark on packaging", "CE mark software product", "notified body identification number", "module H", "EU declaration of conformity", "product with digital elements", "CE mark size 5 mm", "Article 30"]
takeaways: ["The CE mark must be visible, legible and indelible on the product, but its height may drop below the usual 5 mm minimum as long as it stays readable", "When a product is too small or its nature doesn't warrant marking the item, the mark goes on the packaging AND on the EU declaration of conformity, not one or the other; software products use the declaration or the accompanying website", "A notified-body identification number belongs beside the CE mark only when a notified body ran a module-H assessment; a self-assessed product that shows a four-digit number is making a false claim"]
---

# CE Marking When the Board Is Smaller Than the Stamp: Physical, Digital & Packaging Rules

*By Jim McKenney — Digital Product Security Consultant & Industrial OT Architect*

The wireless vibration sensor on my desk measures twelve millimetres on a side. Lift the potting compound and the main board underneath is smaller than the nail on my little finger. The CE mark that the law expects that product to carry, at the smallest height most manufacturers have ever been permitted to print it, is five millimetres tall. Do the arithmetic: the mark would cover close to half the board. There is nowhere on the item to put it that a human eye could actually read.

This is not a rare edge case. Whole product categories now shipping with digital elements are physically smaller than a legible stamp: sensor motes, M.2 modules, bare RF boards, encapsulated nodes. The CRA anticipated exactly this problem and wrote rules for it. Yet marking is still treated in most shops as the trivial final step, the thing operations does with a label printer after the technical file is signed. Getting it wrong is one of the few CRA failures a market-surveillance officer can spot from across a warehouse, because the mark sits on the outside of the box where everyone can see it.

So this is the affixing reference. Where the mark goes on the product, what to do when the product is too small to carry it, how a software product is handled, whether a notified-body number belongs next to your mark, and what the mark means once your device also answers to other CE legislation. The conformity *route* that brought you here is [EP 7.01](/blog/ep-7.01-self-assessment-vs-notified-body-modules-a-b-c-h)'s subject; the declaration the mark rides on is [EP 7.03](/blog/ep-7.03-eu-declaration-of-conformity-annex-v-drafting)'s. This post is only about the stamp.

<!-- IMAGE-SLOT: ep-7.06-hero | 1200x630 | alt: "A tiny potted wireless sensor module beside a 5 mm CE mark and a caliper, the mark visibly larger than the board it is meant to be affixed to" | caption: "The mark is taller than the board. Whole categories of small OT hardware cannot carry a legible CE mark on the item itself, and the rules assume exactly that." -->

## Visible, legible, indelible, and allowed to be smaller than five millimetres

The CRA's starting rule is short. Affix the CE mark to the product visibly, legibly and indelibly, before the product is placed on the market. Those three adverbs are the entire physical standard. *Visible* means not hidden under a battery or sealed inside an enclosure. *Legible* means readable by the naked eye. *Indelible* means it survives the product's working life, so a mark that rubs off with a thumb or dissolves in a solvent wipe-down does not qualify.

Two of those words do most of the enforcement work. A CE mark laser-etched into the housing is indelible; one printed on a peel-and-stick label that a service technician will eventually replace is arguable at best. For an OT device that spends a decade in a hot, vibrating, solvent-cleaned cabinet, "indelible" is an engineering specification, not a printing preference. You choose the marking process at design time, next to the nameplate, not at the end of the line.

The form of the mark itself, the shape of the letters, the fact that only the manufacturer places it, that nothing misleading may sit beside it: all of it the CRA borrows wholesale from Regulation (EC) No 765/2008 [Art 29]. The CRA's own [Article 30](/wiki/cra) then adds the rules specific to products with digital elements, and the first of those is the carve-out this post is named for. General CE-marking law sets a floor: the mark is normally at least five millimetres high. The CRA lifts that floor. On account of the nature of the product, the height "may be lower than 5 mm, provided that it remains visible and legible." That one sentence lets a compact-but-not-tiny device keep the mark on its own surface. It does not rescue the twelve-millimetre sensor, because "legible" is still a hard limit. Shrink the mark below what an eye can resolve and you have failed the rule, not satisfied it.

## Where the mark goes when the product won't carry it

When the product cannot take the mark, or its nature does not warrant marking the item itself, the law does not waive anything. It relocates the mark. Affix it "to the packaging and to the EU declaration of conformity" accompanying the product [Art 30(1)]. Read the word *and*. Packaging alone is not enough, and the declaration alone is not enough. The mark lives in both places at once. That is the rule for the potted sensor, the bare module sold in a tray, the board too small or too featureless to stamp.

Software takes a different path, because software has no surface and no packaging. For a product with digital elements supplied as software, the mark goes on the EU declaration of conformity or on the website accompanying the software, and if you choose the website, that section has to be "easily and directly accessible" to the customer. A download page that buries the mark behind a login or three menu levels does not clear that bar.

The declaration does a lot of quiet work in both fallbacks. It is the surface the mark retreats to when nothing else will hold it, one more reason the [EU declaration of conformity](/blog/ep-7.03-eu-declaration-of-conformity-annex-v-drafting) is not a formality [Art 28]. If the declaration is wrong, the mark's legal home is wrong with it.

| The product in front of you | Where the CE mark must appear | On the declaration too? |
|---|---|---|
| Has a surface that holds a legible mark | On the product itself, visible, legible, indelible (may be under 5 mm if still legible) | No separate mark required; the DoC is on file either way |
| Too small, or its nature doesn't warrant marking the item (tiny PCB, potted sensor, bare module) | On the **packaging** | Yes. Packaging **and** the declaration, both |
| Supplied as software, no physical product | On the DoC **or** the accompanying website (easily and directly accessible) | Yes, if you take the DoC route |
| Also covered by other CE legislation (radio, EMC, machinery) | One CE mark, placed by the rules above | Single mark, single declaration, all applicable acts |

<!-- IMAGE-SLOT: ep-7.06-placement | 1200x800 | alt: "A four-branch decision diagram showing where the CE mark goes by product form: on the product if it fits, on the packaging plus declaration if too small, on the declaration or website if software, and a single mark for products under multiple CE laws" | caption: "Where does the mark go? Four product forms, four answers. The 'too small' and 'software' branches move the mark off the item and onto the declaration or the packaging, never off the product's legal record." -->

## The notified-body number belongs on almost none of these

There is a four-digit number you have seen printed beside the CE mark on some equipment. It is a notified body's identification number, and putting it where it does not belong is the single most common marking error I find. Under the CRA the CE mark is followed by a notified body's number in exactly one situation: when a notified body was involved in the conformity assessment based on full quality assurance, module H. For every product a manufacturer self-assesses, and that is most products with digital elements, no notified body is involved, so no number appears. A self-assessed product that ships with a four-digit number beside its CE mark is making a false statement about how it was assessed.

The mistake runs both directions. Some teams, wanting the mark to look thorough, borrow a number from a test lab that checked one component. Others, on a genuine module-H product, leave the number off because nobody told operations it was mandatory. Whether your product goes through self-assessment or a notified body, and if the latter, which module, is the entire subject of [EP 7.01](/blog/ep-7.01-self-assessment-vs-notified-body-modules-a-b-c-h). Settle that first, because it decides whether any number sits next to your mark at all. When one is required, the notified body affixes its number itself or instructs the manufacturer to do it.

<!-- IMAGE-SLOT: ep-7.06-nb-number | 1200x675 | alt: "Two CE marks side by side: a plain CE mark labelled 'self-assessed, module A, no number' and a CE mark followed by a four-digit notified-body number labelled 'module H, notified body involved'" | caption: "The number is earned, not decorative. It appears only when a notified body ran the module-H assessment; the self-assessed majority of products carry a bare CE mark." -->

## One mark, several laws

Most industrial products with digital elements are not *only* products with digital elements. A wireless sensor is also radio equipment. A motor drive is also machinery and an EMC concern. Several of those regimes demand their own CE mark. The CRA's rule is that you do not stack marks. Where the product is subject to other Union harmonisation legislation that also provides for CE marking, the one mark you affix means the product conforms to all of them, the CRA included. The single symbol is a claim about the whole compliance stack, not just cybersecurity. It is also why a product sitting under several acts gets one declaration covering every applicable act, not a separate declaration per law.

The consequence for whoever draws the enclosure: the CE mark you place is not "the CRA mark." No such thing exists. It is the CE mark, and by the time you affix it the product's file has to stand behind every directive and regulation the mark now speaks for. Adding CRA conformity to a device that already carried CE for radio and EMC does not add a symbol to the housing. It adds a law that the existing symbol now also certifies.

Marking gets scheduled as the last thing before the pallet leaves, a five-minute job for whoever runs the label printer. Invert that. The mark is the most compressed statement your product makes: a single glyph asserting that a technical file exists, that a declaration is signed, that every CE law the product touches has been met, and, by its size, its placement, and whether a four-digit number sits beside it, how the product was assessed. It is the entire conformity programme collapsed into something an inspector reads from across the room.

Which makes it a design input, not a shipping step. Whether the mark fits the housing, whether the product is too small and the packaging has to carry it, whether a website has to host it, whether a notified-body number is coming, these are answers you need while the enclosure is still in CAD, not after the first units are potted and sealed. Decide where the mark lives while you still have room to move it. Model that placement, alongside the route it depends on, in the [conformity workspace](/demo).
