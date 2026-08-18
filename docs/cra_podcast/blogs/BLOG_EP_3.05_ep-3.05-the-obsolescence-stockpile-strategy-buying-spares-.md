---
id: "EP_3.05"
canonical_code: "EP_3.05"
title: "The Obsolescence Stockpile: Smart Hedge or Uninsurable Trap?"
subtitle: "Buying ten years of legacy modules before December 2027 can lock in grandfathered status — but only if you get one date right. A worked cost-and-risk breakdown of the stockpile decision."
slug: "ep-3.05-the-obsolescence-stockpile-strategy-buying-spares-"
series_id: 3
episode_number: 5
series: "Brownfield OT, Spare Parts & Maintenance"
target_persona: "Supply Chain Managers, Inventory Controllers, Plant Finance Directors."
persona_category: "Plant CISOs & Asset Owners"
statutes: ["Article 69(2)", "Article 2(6)", "Article 3(21)"]
statutory_domain: "Brownfield & Legacy OT"
difficulty: "Capital & Legal Triage"
key_metric: "Pre-2027 delivery date"
read_time: "8 min read"
duration: "14:15"
audio_url: "https://oxot.ai/audio/cra_podcast/EP_3.05.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["Cyber Resilience Act", "Regulation (EU) 2024/2847", "Article 69", "obsolescence stockpile", "spare parts CRA", "grandfathering", "Industrial OT Security"]
takeaways: ["Model the carrying cost, degradation, and warranty erosion before you sign the PO", "Grandfathering attaches to the delivery date, not the purchase order or manufacture date", "A reform-and-rotation program is what makes a long hold defensible on both the engineering and the regulatory side"]
---

# The Obsolescence Stockpile: Smart Hedge or Uninsurable Trap?
*By Jim McKenney — Digital Product Security Consultant & Industrial OT Architect*

Your OEM has announced end-of-life for the controller platform running half your plant. The successor is a different product with a different firmware base, and it will not drop into your existing racks without re-engineering. So the procurement team floats the obvious hedge: buy ten years of spares now, before the Cyber Resilience Act's 11 December 2027 deadline, and freeze the problem.

It can be the right call. It can also be a warehouse full of capital you can't get back, wrapped around boards quietly dying on the shelf. The difference is not the purchase price. It's whether you can prove one date — and whether the parts survive the wait.

<!-- IMAGE-SLOT: ep-3.05-hero | 1600x900 | alt: "Climate-controlled industrial spares warehouse with rows of boxed controller modules on steel shelving." | caption: "A stockpile is only a hedge if the parts still work when you finally open the box." -->

## Start with the number that actually governs the decision

Everyone models the sticker price. Fewer model what the stockpile costs you to *hold*, and almost nobody prices the two risks that decide whether it pays off: hardware that degrades unpowered, and a regulatory clock that only stops if you can document delivery.

Take a concrete, illustrative case. A process line runs 40 legacy CPU and I/O modules you expect to consume over roughly a decade of maintenance. Current unit price is €6,000, so the up-front spend is **€240,000**. That's the easy figure. Here is the rest of it.

**Capital carried.** You draw the fleet down over ten years, so on average you're sitting on about half of it — call it €120,000 of dead inventory. At an 8% cost of capital, that's roughly €9,600 a year, €80,000–€100,000 over the hold before anything fails. That capital earns nothing; it's insurance against an outage you may never have.

**Storage.** Electronics that must survive a decade want climate control — stable temperature, controlled humidity, ESD-safe packaging. Budget a few thousand euros a year for the space and its conditioning. Small next to the capital line, but real and recurring.

**Degradation — the line that surprises finance.** This is where the trap lives. Two families of components age *while sitting unpowered in the box*:

- **Aluminium electrolytic capacitors.** The oxide layer on an idle electrolytic cap degrades over time. Many manufacturers recommend re-forming stored capacitors (or the boards containing them) after roughly one to two years of shelf storage before energising them at full rated voltage. Skip that, and a board pulled after eight years can fail on first power-up, or worse, fail six weeks after commissioning. Exact intervals are part-specific — check the datasheet, not folklore.
- **Backup batteries.** Lithium primary cells that hold PLC program memory or the real-time clock self-discharge in storage. A backup battery bought in 2026 and installed in 2034 may already be near end of usable life on the day it goes in. If the module ships with the cell fitted, its clock is running the whole time it sits on your shelf.

Assume, illustratively, that 10–15% of a battery-and-capacitor-heavy fleet needs re-forming or a fresh cell before it's fit to commission. On €240,000 that's €24,000–€36,000 of rework or scrap you've built in — *unless* you actively manage the stock, which turns that capital loss into a labour line instead.

**Warranty erosion.** This one isn't a number, it's a transfer. Most OEM warranties start at ship date or carry a shelf limit, so a module installed years after purchase is almost certainly out of warranty when it enters service. Every unit you stockpile, you choose to self-insure — you now own every early-life failure.

<!-- IMAGE-SLOT: ep-3.05-decision | 1400x900 | alt: "Flat infographic: a horizontal timeline of warehoused stock crossing a single vertical threshold marker, with four stacked bands above it representing capital, storage, degradation, and warranty." | caption: "Four cost-and-risk bands run the length of the hold; one threshold decides the regulatory column." -->

## What the stockpile actually buys you under the CRA

Now the column that justifies the whole exercise. Done correctly, a pre-2027 stockpile buys you two distinct regulatory shelters, and they are not the same thing.

The first is **grandfathering under Article 69(2)**. Products with digital elements that were *placed on the market before 11 December 2027* only fall under the CRA's requirements if, after that date, they undergo a substantial modification. Install a stockpiled module as a like-for-like replacement and you are outside the new obligations. That is real value: you are not forced into a mid-life platform migration just to keep the line legal.

The second, and stronger where it applies, is the **spare-parts exclusion in Article 2(6)**. The CRA does not apply at all to spare parts made available to replace *identical* components, manufactured to the *same specifications* as the parts they replace. A true identical spare isn't grandfathered — it's simply out of scope. (That distinction — and where "identical" quietly breaks — is the whole subject of [our episode on the spare-parts exclusion](/wiki/cra).)

Two shelters, one shared failure mode: both evaporate the moment the part stops being identical. A "spare" that is really a newer board revision with different firmware is not an identical component under that exclusion, and flashing firmware that changes how the product meets the Annex I essential requirements is a substantial modification — which drags the unit back into scope and can put *you* on the hook as the party that modified it. The stockpile only holds if what comes out of the box is the same as what your asset register already trusts.

## The crux: warehoused stock is not automatically "placed on the market"

Here is the part procurement gets wrong, and it's the difference between a defensible hedge and an expensive assumption.

"Placed on the market" has a precise CRA meaning. Article 3(21) defines it as the **first making available** of a product on the Union market, and Article 3(22) defines "making available" as **supply for distribution or use in the course of a commercial activity**. Read those together: a unit is placed on the market at the moment it is first *supplied* — not when it was manufactured, and not when you raised the purchase order.

That has two consequences that decide your case.

**If you buy for your own use,** each module is placed on the market when your supplier *delivers* it to you. Take delivery before 11 December 2027 and those specific units are grandfathered under 69(2). What protects you is documented proof of the supply date — the delivery note, the goods-received record, the transfer of the physical parts — not the date on the PO. A pre-paid order for modules still sitting in the manufacturer's warehouse on 11 December 2027 has *not* been placed on the market, and buys you nothing. Get the parts through your gate and booked into stores before the cutoff, or the hedge is paper.

**If someone is stockpiling to resell,** the exposure flips. A distributor's or manufacturer's own unsold inventory has not been placed on the market merely because it was built before 2027 — producing and warehousing your own stock is not a "making available." Those units are placed on the market only when first supplied onward, and if that first supply happens on or after 11 December 2027, they must meet the full CRA requirements at that point. A reseller cannot grandfather a warehouse by manufacture date.

Two honest caveats, because a clean guarantee here would be a lie. First, grandfathering does not switch off the actively-exploited-vulnerability reporting duty in Article 14 — the CRA preserves that even for pre-2027 products — but it sits on the manufacturer, so it reaches you only if you are also self-manufacturing or integrating. Second, grandfathering settles the product's CRA obligations, not the operational security duties you carry as an operator under NIS2 for the systems these parts run in. The stockpile buys you out of a product-conformity problem, not out of running a secure plant.

## Netting it out

| Line | Ten-year figure (illustrative) | Nature |
|---|---|---|
| Up-front spend | €240,000 | Sunk capital |
| Capital carried (~€120k avg @ 8%) | €80,000–€100,000 | Opportunity cost |
| Climate-controlled storage | ~€30,000 | Recurring |
| Degradation / re-form / rework | €24,000–€36,000 unmanaged | Avoidable with rotation |
| Warranty | — | Risk transferred to you |
| Regulatory status | Grandfathering + possible spare-parts exclusion | The payoff |

*Figures are a worked illustration to show the shape of the decision, not a benchmark. Your unit price, drawdown, and cost of capital move every line.*

So you're spending €240,000 and carrying perhaps €140,000–€170,000 of additional cost and risk over the decade to lock in supply and regulatory status. Steep in isolation. It looks different against the alternative it competes with: a mid-life migration to a CRA-compliant successor — engineering, re-validation, requalification, and downtime on a running line — which for many plants runs well past a quarter-million euros and can't be scheduled on your terms. Against *that*, the stockpile is often the cheaper and calmer path.

## When it's a hedge, and when it's a trap

**It's a smart hedge when** the platform is genuinely discontinued with no drop-in compliant successor; you take documented delivery before 11 December 2027; the parts are low-degradation or you fund a re-form-and-rotation program; and you commit to installing them as true identical spares without re-flashing.

**It's a trap when** any one of those legs is missing: the "spares" are a newer revision, so the exclusion doesn't apply and any firmware change trips substantial modification; you're relying on a purchase order rather than proof of delivery; or you're buying battery-and-capacitor-heavy boards you'll hold a decade with no maintenance plan, so a fifth of the fleet is dead before it's ever installed. A stockpile you don't maintain isn't insurance. It's a depreciating liability with a compliance story you can't defend.

The decision isn't "buy spares or don't." It's whether you can put three things in writing before the deadline: a delivery date, an identical-part attestation, and a rotation schedule. If you can produce all three, the stockpile is one of the few clean moves left in a brownfield fleet. If you can't produce even one, you're funding a warehouse of regret.

**This week:** pull the bill of materials for your top discontinued platform and flag every module carrying an electrolytic bank or a backup cell. Those are the parts that decide whether your stockpile is an asset or a write-down — price the rotation program for them before you price the parts.
