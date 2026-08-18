---
id: "EP_7.01"
canonical_code: "EP_7.01"
title: "Self-Assessment vs. Notified Body: Which Conformity Route Your Product Actually Takes"
subtitle: "Most products with digital elements can be assessed by the manufacturer alone, at zero external cost. A minority must pass through a notified body, and one class must go further still. This is the class-by-class map that tells you which route is yours before you price a single audit."
slug: "ep-7.01-self-assessment-vs-notified-body-modules-a-b-c-h"
series_id: 7
episode_number: 1
series: "Conformity Assessment, Audits & CE Marking"
target_persona: "Compliance Directors, QA Managers, Hardware CEOs."
persona_category: "Manufacturers & Product Owners"
statutes: ["Article 32", "Annex VIII", "Annex III", "Annex IV"]
statutory_domain: "Conformity Assessment & CE Marking"
difficulty: "Advanced Engineering"
key_metric: "4 lanes, 1 default"
read_time: "8 min read"
duration: "13:40"
audio_url: "https://oxot.ai/audio/cra_podcast/EP_7.01.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["Cyber Resilience Act", "Regulation (EU) 2024/2847", "conformity assessment", "self-assessment", "notified body", "module A internal control", "module H full quality assurance", "Annex VIII", "important products Annex III", "critical products Annex IV", "CE marking"]
takeaways: ["Self-assessment (module A) is the CRA's default route for most products with digital elements, not a loophole you have to justify", "Annex III class and Annex IV listing — not your own sense of risk — decide whether a notified body is mandatory", "How module A, module B+C, and module H differ on who audits, what it costs, and which production reality each one fits"]
---

# Self-Assessment vs. Notified Body: Which Conformity Route Your Product Actually Takes

*By Jim McKenney — Digital Product Security Consultant & Industrial OT Architect*

A client forwarded me a notified-body quote last spring: €210,000 and fourteen months for a full quality-assurance audit of a networked temperature controller. The sales engineer who solicited it had read one CRA headline, "products now need third-party assessment," and gone shopping. The controller was not an important product. It was not a critical product. Under the Regulation, the manufacturer could have signed its own declaration and shipped that same quarter, at a cost of exactly zero external euros. They were about to buy a quarter-million-euro answer to a question nobody had asked.

That quote is the most expensive misreading of the CRA I have seen, and it grows from one stubborn assumption: that "conformity assessment" is a synonym for "hire an auditor." For most products with digital elements, it is not. The Regulation's baseline is that you assess your own product and stand behind the result. Knowing which route your specific product actually takes is the highest-leverage decision in your whole compliance programme, because it settles whether the budget line has a comma in it.

<!-- IMAGE-SLOT: ep-7.01-hero | 1200x630 | alt: "A hardware compliance director at a desk holding two documents side by side: a one-page signed declaration and a thick notified-body audit quote, weighing which route a networked device must take" | caption: "Same CE mark, two very different price tags. The class of the product, not the size of the fear, decides which route you owe." -->

## The default is a route, not a loophole

Article 32 hands the manufacturer of an ordinary product with digital elements a menu, and the first item on it is self-assessment: the internal control procedure, module A in Annex VIII. You evaluate the product against the essential cybersecurity requirements, compile the technical documentation, draw up and sign the EU declaration of conformity, and affix the CE mark. No external body reads a page of it unless a market-surveillance authority later asks to see the file.

People hear "self-assessment" and reach for the word *loophole*. It is the opposite. Self-assessment is the front door, the route the statute expects the majority of products to walk through. The higher-assurance routes are the carve-outs, reserved for categories the legislator judged too consequential to leave to the manufacturer's own signature. If your product sits outside those categories, the default is not a discount you have to defend to anyone. It is the law's plain baseline, and choosing it needs no one's blessing.

## Read your product off the map

Everything turns on two lists. Annex III names the *important* products and splits them into class I and class II. Annex IV names the *critical* products. Find your product on those lists before you price anything, because its position there, and nothing else, sets the route.

<!-- IMAGE-SLOT: ep-7.01-route-map | 1200x800 | alt: "A four-lane routing diagram: any product not on the annex lists flows to module A self-assessment; important class I branches on whether standards are applied in full; important class II and critical products flow to notified-body routes and certification schemes" | caption: "The conformity-route decision map. Two annex lists sort every product into one of four lanes; only class I has a conditional door back to self-assessment." -->

**Not on either list.** This is the default population, and it is the largest one. You self-assess under module A. You may voluntarily step up to a higher route if a customer contract or a certification scheme asks for it, but nothing in the Regulation forces you off the default.

**Important, class I.** Here the Regulation offers a conditional path back to self-assessment. Apply the relevant harmonised standards, common specifications, or a European cybersecurity certification scheme (at assurance level at least "substantial") *in full*, and you may still self-assess under module A. Apply them only in part, or find that no such standard yet exists for your product, and the door shuts: you move to a third-party route, either module B followed by module C, or module H. The standard is the lever. Full application keeps you on the default; anything less hands the assessment to a notified body.

**Important, class II.** No condition, no lever. A class II important product must go through module B+C, module H, or a European cybersecurity certification scheme. Third-party assessment is mandatory here regardless of which standards you apply. This is the tier where that €210,000 quote would have been the right order of magnitude, and where booking the cost into the plan early is the difference between a scheduled expense and a launch-blocking surprise.

**Critical.** The critical list is narrower still. A critical product is steered toward a European cybersecurity certification scheme; where the conditions for a mandatory scheme are not met, it falls back to the class II procedures. If your product is on that list, plan for an external scheme and treat anything lighter as the exception you have to prove.

The line the legislator drew repays a careful reading, because it is a line about consequence, not difficulty. A product is important or critical because of where it sits in other people's systems, not because it is hard to secure. That is why your own sense of how scary the threat model looks is the wrong input. A password manager and a boundary-protection appliance are on the lists because a failure in them cascades; a clever consumer gadget with a nasty attack surface may not be on them at all, and self-assesses regardless of how much it worries you.

> [!NOTE]
> The route is set by which list your product is on, not by how alarming its threat model feels. A device with a frightening CVSS profile that appears on neither list still self-assesses. Check your product against the actual Annex III and Annex IV entries before you assume a notified body is in your future; the lists are specific, and most products are not on them.

Two errors sit on either side of that line, and I have watched both cost real money. The first is the one that opened this post: reading a headline, assuming third-party assessment is universal, and buying an audit for a default-route product. The second is quieter and more dangerous. A manufacturer decides it is "obviously" a low-risk product, self-assesses, and never checks that the product is actually a class I important item for which no harmonised standard yet exists — which, until the standards catch up, forces a notified body it never budgeted for. Over-buying wastes cash. Under-reading ships a product whose CE mark cannot be defended, and that is the one market surveillance unwinds.

## What the three modules actually buy

If your product does land in a third-party tier, you still choose the module, and the modules are not interchangeable. Module B+C and module H reach the same CE mark by different roads, and self-assessment sits underneath both.

| Route | What it is | Who audits | Cost & time posture |
|---|---|---|---|
| **Module A** — internal control | Self-assessment: you test, document, and declare | No external body; you sign | Lowest. No third-party fee; the cost is internal engineering and documentation time |
| **Module B + C** — EU-type exam, then conformity to type | A notified body examines a representative sample and certifies the *type*; you then declare each unit conforms to that certified type | Notified body for the type exam; you for production conformity | Middle. A one-time type-exam fee plus your own production controls; re-examine when the design changes significantly |
| **Module H** — full quality assurance | A notified body approves and periodically audits your quality-management system across design and production | Notified body, on your QMS, on a recurring surveillance cycle | Highest ongoing. Repeat audit fees; fits high-mix or fast-iterating product lines |

Module B+C suits a stable product you certify once and then manufacture against. Module H suits a maker shipping many variants or iterating quickly, where certifying every type separately would cost more than having the whole quality system blessed and surveilled. Neither is the "better" one. They price differently against your production reality, and in both cases the notified body's invoice is only the visible part; the internal cost of preparing for either audit is usually the larger number.

A concrete pair makes the trade-off legible. Take a manufacturer with two lines. The first is a single, long-lived industrial gateway that lands in a third-party tier: it barely changes across a decade, ships in high volume, and every unit is identical to the certified type. Module B+C is the cheaper fit, because the expensive step, the type examination, happens once and then amortises across every unit produced. The second line is a family of smart-home controllers that also lands in a third-party tier but spins out four new variants a year. Certifying each variant as a fresh type under module B would mean paying the type-examination fee four times annually, forever. Here module H is cheaper in the long run: the notified body approves the quality system once and surveils it, and new variants flow through the approved system without a new type exam each time. The rule of thumb is simple. Few types, high volume, slow change favours B+C; many types, fast change favours H.

## The word "self" is doing quiet work

<!-- IMAGE-SLOT: ep-7.01-self-not-free | 1200x675 | alt: "A comparison showing that the self-assessment route removes only the notified body, while the technical documentation, the signed EU declaration of conformity, and the affixed CE mark remain identical to the third-party route" | caption: "Self-assessment subtracts the auditor, not the obligation. The technical file, the signed declaration, and the CE mark are the same on either route." -->

Choosing module A removes the notified body. It removes none of the substance. You still owe the full technical documentation, the same file a notified body would have demanded, archived and kept current across the support period. You still draft and sign the EU declaration of conformity, and your signature carries the legal weight the auditor's stamp would have carried. The mechanics of that declaration are worked through in [EP 7.03](/blog/ep-7.03-eu-declaration-of-conformity-annex-v-drafting), the archive behind it in [EP 7.04](/blog/ep-7.04-10-year-technical-documentation-archive-annex-vii), and the CE mark you affix to product and packaging at the end in [EP 7.06](/blog/ep-7.06-ce-nameplate-studio-physical-digital-packaging).

The difference between self-assessment and a notified body is who checks the work, not whether the work exists. Teams that hear "self-assess" as "skip the file" are the ones market surveillance catches first, because the file is precisely what an authority opens with. Self-assessment is cheaper on external fees and identical on obligation.

So route your product in a single pass, in this order. Find it on Annex III and Annex IV; if it is on neither, self-assess and move on. If it is class I, ask whether you can apply the standards in full: if yes, self-assess; if no, book the notified body. If it is class II or critical, assume third-party assessment and cost it into the schedule before you commit to a launch date, not after a sales engineer forwards you a quote. The route is not a judgment call you make under pressure. It is a lookup you can finish this afternoon with the two annexes open. Start with [the statute](/wiki/cra), or model your product's route directly in the [conformity workspace](/demo).
