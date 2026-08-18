---
id: "TC_06"
canonical_code: "TC_06"
title: "The End-of-Life Handover: Who Owns the CRA Liabilities When You Retire Critical OT?"
subtitle: "Decommissioning feels like an off switch for compliance. It is not. The Cyber Resilience Act's clocks started the day the product was placed on the market and the day each update shipped, and unbolting the hardware does not stop them."
slug: "tc-06-decommissioning-end-of-life-handover-critical-ot"
series_id: 10
episode_number: 6
series: "CRA: Truth & Consequences (Investigative)"
target_persona: "Asset owners, decommissioning leads, and quality/compliance directors retiring long-life OT."
persona_category: "Investigative"
statutes: ["Article 13(8)", "Article 13(9)", "Annex VII"]
statutory_domain: "Decommissioning & End-of-Life"
difficulty: "Legal & Risk"
key_metric: "Retention/availability clocks that keep running after the asset is retired"
read_time: "8 min read"
duration: "13:35"
audio_url: "https://oxot.ai/audio/cra_podcast/TC_06.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["CRA decommissioning", "end-of-life OT handover", "Article 13(8) support period", "Article 13(9) security update availability", "10-year retention CRA", "asset sale documentation transfer", "retiring critical OT", "secondary market industrial equipment", "product line divestiture CRA", "orphaned OT assets"]
takeaways: ["The CRA's retention and availability duties are anchored to placing-on-market and update-issuance dates, not to whether a unit is still in service, so decommissioning cannot end them", "Security updates issued during the support period must stay available for at least 10 years after issuance, or the remainder of the support period if that is longer, whether or not any unit is still running", "A clean handover carries the documentation and the update entitlement to the buyer; a manufacturer selling a product line transfers the still-running clocks with it as a due-diligence item"]
---

# The End-of-Life Handover: Who Owns the CRA Liabilities When You Retire Critical OT?
*By Jim McKenney — Digital Product Security Consultant & Industrial OT Architect*

A process line runs its last batch on a Friday. Over the weekend the controllers are powered down, the safety PLCs come out of their cabinets, and by the end of the month the whole cell is sold as a single lot to a broker who will ship it to a plant in another country. On the closeout call someone asks the question every decommissioning raises and almost nobody answers correctly: now that the equipment is off our floor, which Cyber Resilience Act obligations did we just switch off with it?

The comfortable answer is all of them. The asset is gone, so the duties attached to it are gone. That is the story that lets a plant shred a folder, wipe a share, and close the project. It is also wrong in a specific and expensive way, because the CRA's clocks were never started by deployment, and they do not stop when you unbolt the hardware.

Every retention and availability duty in the regulation is anchored to a date in the past, not to the state of any individual unit. The support-period duty runs from when the product was placed on the market. The duty to keep a security update available runs from the day that update was issued. The duty to hold the technical file for authorities runs from placing-on-market too. None of those anchor dates moves because you decommissioned a fleet. Pulling the last unit out of service is an event on your asset register. It is not an event the statute recognises as ending anything.

<!-- IMAGE-SLOT: tc-06-hero | 1200x630 | alt: "A powered-down industrial control cabinet on a decommissioned line, an auction lot tag hanging from the door, a wall calendar in the background still turning" | caption: "The hardware goes cold on a Friday. The retention and availability clocks keep counting." -->

That one fact reorganises the end-of-life question. Instead of asking "are we still on the hook now that it is off," ask "which clocks are still running, and who is holding them."

## What the switch-off actually ends

Some duties really are keyed to the product being in service, and the support period is the clearest of them. The manufacturer sets a support period that reflects how long the product is expected to be in use, and it must be at least five years unless the product is genuinely expected to serve for less (Article 13(8)). During that window the manufacturer handles vulnerabilities. After it, that active duty lapses.

Decommissioning interacts with the support period in two directions, and both catch people out.

Retire the asset early, before the support period ends, and you have shortened nothing. The support period is a market-wide judgement the manufacturer made about the product, not a meter that runs down with your particular installation. Your units going dark does not release the manufacturer from the wider commitment, and it does not refund you an obligation you never held.

Run the asset past the end of the support period, the far more common case in OT where a controller outlives its declared support by a decade, and something quieter happens. The manufacturer's active vulnerability-handling duty has already lapsed on schedule, and you are now operating unsupported equipment with no one obligated to fix the next disclosed flaw. That is the same orphaning a bankrupt vendor creates, reached by the calendar instead of by insolvency; the [defunct-OEM analysis](/blog/tc-02-defunct-oem-dilemma-brownfield-patches) and the [five-year OEM-gap post](/blog/ep-3.03-bridging-the-5-year-oem-gap-keeping-20-year-indust) both cover how to contain it. Decommissioning is often the right answer to that exposure, not the thing that creates it.

## What keeps running after the hardware is gone

A different pair of duties survives the switch-off cleanly, and they are the ones plants most often assume they have escaped.

The first is availability. Every security update the manufacturer made available during the support period has to stay available for at least ten years after it was issued, or the remainder of the support period if that is longer (Article 13(9)). Read what that does across a decommissioning: an update the manufacturer shipped in year four of a product's life must remain fetchable into year fourteen, whether or not a single unit is still energised anywhere. This is a distribution duty owed to whoever still runs the product, and it outlives your deployment entirely. If you are the manufacturer, retiring the product line does not let you take the update server down. If you are the operator, the fix you may one day need for the units you just sold to that broker is one the maker is still obligated to keep reachable.

The second is retention. The technical documentation and the EU declaration of conformity have to stay at the disposal of market-surveillance authorities for a decade after the product was placed on the market, or the support period if that is longer. This is a filing-cabinet duty, not a keep-it-running duty, and it is emphatically not extinguished by pulling the product from service. An authority can open a file years after your last unit is scrap. The archive that answers that request, and how to build it so it survives reorgs, migrations, and a full turnover of staff, is the subject of [the ten-year technical-file post](/blog/ep-7.04-10-year-technical-documentation-archive-annex-vii), which owns the Annex VII contents list this post deliberately does not re-teach.

<!-- IMAGE-SLOT: tc-06-clocks | 1200x800 | alt: "A timeline infographic: a placing-on-market date and several update-issuance dates each start a 10-year bar; a 'decommissioned' marker sits mid-timeline and the bars continue past it, unbroken" | caption: "The clocks start at placing-on-market and at each update's issuance. The decommissioning marker does not shorten a single bar." -->

## The handover is where the liability actually moves

Decommissioning rarely means destruction. It usually means a handover: the equipment is sold, the plant changes hands, a product line is divested. The CRA duties do not evaporate at that boundary. They move, and whether they move cleanly is something you control at the deal table.

Separate the two handovers, because they carry different cargo.

When you are the asset owner selling or auctioning the equipment, you were never the CRA manufacturer, so the manufacturer's clocks are not yours to transfer. What is yours to transfer is everything the buyer needs to keep the asset supportable: the identity of the manufacturer, the declared support-period end date, the entitlement to security updates, and the configuration and documentation the next operator will need. Hand over critical OT without that package and you have not sold a supported asset. You have sold an orphan that happens to still power on.

When you are the manufacturer divesting a product line, the cargo is heavier. The availability clock under 13(9) and the ten-year retention duty are already running, and they run with the line to whoever acquires it. The acquirer inherits a duty already in motion, with years left on it, computed from dates that predate the deal. That makes the update infrastructure and the technical archive due-diligence line items rather than afterthoughts. A buyer who cannot produce the seller's file has bought the seller's exposure.

<!-- IMAGE-SLOT: tc-06-handover | 1000x600 | alt: "A sale boundary between two plants; a sealed package labelled 'manufacturer identity, support-period date, update entitlement, technical file' crosses it, while a second asset crosses with no package and is stamped 'orphaned'" | caption: "The asset the buyer can support and the orphan look identical on the truck. The difference is the package that crosses with it." -->

There is a security step that sits underneath both handovers and belongs to neither clock. Critical OT going into the secondary market carries credentials, keys, and configuration that were part of the security properties the product was placed on the market under. Wiping them before the equipment leaves your control is not a paperwork ritual. It is the difference between selling hardware and selling a working key to a network you no longer watch. The statute does not hand you a template for this. Sound end-of-life practice does.

## Which clock ends when

Here is the argument as a map from each duty to the event that actually ends it.

| Duty | Anchored to | Does the switch-off end it? |
|---|---|---|
| Handle vulnerabilities during support (13(8)) | Placing on the market; expected in-use time | No. It ends on the support-period date, not your retirement |
| Keep each security update available (13(9)) | The day the update was issued | No. Ten years from issuance, or the remainder of support, whichever is longer |
| Hold the technical file for authorities | Placing on the market | No. Ten years, or the support period, whichever is longer |
| Provide credentials and keys with the live asset | Your own control of the hardware | This one you must end deliberately, by wiping them |

Three of the four rows say the same thing: the calendar the regulation cares about started running before you decommissioned, so decommissioning cannot be the thing that stops it. [The statute reference](/wiki/cra) lays out each clock, and [the demo](/demo) shows what the surviving file looks like against a live product.

Which leaves the question a decommissioning plan almost never asks out loud, the one that belongs on the closeout agenda before the broker's truck arrives: for every product you are about to switch off, is there still a legal entity holding each of these running clocks, and if the real answer for even one of them is no, is anyone in your organisation ready to explain that to an authority who opens the file in a year you assumed the whole thing was long over?
