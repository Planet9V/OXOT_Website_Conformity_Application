---
id: "EP_8.01"
canonical_code: "EP_8.01"
title: "The €15 Million Line: How Article 64 Administrative Fines Are Actually Calculated"
subtitle: "The headline number is not €15 million. For any company of scale it is 2.5% of total worldwide group turnover — calculated on everything the undertaking sells everywhere, not on the revenue of the product that failed. This is how the three fine bands are built, and how to price your own exposure before an authority prices it for you."
slug: "ep-8.01-article-64-administrative-fines-calculation"
series_id: 8
episode_number: 1
series: "Executive Liability, Penalties & Future Evolution"
target_persona: "CEOs, CFOs, Board Members, General Counsel."
persona_category: "Executive & Governance"
statutes: ["Article 64", "Annex I", "Article 13", "Article 14"]
statutory_domain: "Penalties & Enforcement"
difficulty: "Board & Executive"
key_metric: "€15M or 2.5%"
read_time: "8 min read"
duration: "12:20"
audio_url: "https://oxot.ai/audio/cra_podcast/EP_8.01.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["Cyber Resilience Act", "Regulation (EU) 2024/2847", "Article 64", "administrative fines", "CRA penalties", "2.5% worldwide turnover", "15 million euro fine", "essential cybersecurity requirements", "Annex I", "market surveillance authority", "executive liability", "board risk"]
takeaways: ["The top fine band is the HIGHER of €15,000,000 or 2.5% of the undertaking's total worldwide annual turnover — the fixed figure is a floor, not a ceiling, and for a large group the percentage governs", "The turnover base is the whole group's global revenue, not the offending product line, not the EU slice — one non-compliant product can expose a fraction of the entire company", "The cap is the maximum, not the bill: Article 64(5) sets what an authority actually imposes, and company size is a mitigating argument for SMEs, not a separate penalty regime"]
---

# The €15 Million Line: How Article 64 Administrative Fines Are Actually Calculated

*By Jim McKenney — Digital Product Security Consultant & Industrial OT Architect*

A €4 billion industrial group I advised last year had one product line in trouble: a networked HVAC controller doing about €38 million a year, shipping with an essential-requirement gap it had never closed. The general counsel priced the risk the way lawyers usually do, against the product. Worst case we lose the line, he reasoned; 2.5% of thirty-eight million is under a million euros, annoying but survivable. He had the base wrong. Article 64 does not fine the product. It fines the undertaking. Two and a half percent of the group's total worldwide turnover is €100 million, not €950,000. One controller, mispriced by a factor of more than a hundred.

That is the single most expensive misreading of the CRA a board can make, and it comes from reading "€15 million" as the number to fear. The €15 million is the part that fits in a headline. The part that decides the actual exposure of a real company is the phrase sitting right next to it.

<!-- IMAGE-SLOT: ep-8.01-hero | 1200x630 | alt: "A boardroom risk register open on a table showing a single product line flagged, next to a calculator displaying 2.5 percent of total worldwide group turnover as a figure far larger than the product's own revenue" | caption: "Article 64 fines the undertaking, not the product. The number a board should fear is a percentage of the whole group's worldwide turnover." -->


## The number that moves is the turnover base

Article 64(2) sets the top-band fine as the higher of two figures: a fixed cap of €15,000,000, or 2.5% of the offender's total worldwide annual turnover for the preceding financial year. "Whichever is higher" is the whole game. For a mid-size company the fixed floor governs. For a large group the percentage governs, and it is calculated on everything the undertaking sells everywhere. Not the EU slice. Not the offending division. Not the product line that failed. The group's total global revenue.

Run it in both directions and the design becomes obvious. A €300 million company: 2.5% is €7.5 million, below the floor, so the €15 million figure applies. A €4 billion group: 2.5% is €100 million, and the floor is irrelevant. The fixed cap is there to bite the small; the percentage is there to bite the large. There is no size of company the drafters left comfortable.

<!-- IMAGE-SLOT: ep-8.01-turnover-base | 1200x675 | alt: "Side-by-side comparison: a small bar labeled non-compliant product line revenue 38 million euros next to a much larger bar labeled total worldwide group turnover 4 billion euros, with an arrow showing the 2.5% fine is calculated on the large bar not the small one" | caption: "The fine base is the whole undertaking's worldwide turnover, not the revenue of the product that triggered it. The line at risk was €38M; the 2.5% exposure was €100M." -->

For a CFO, this is the sentence that reorders the risk register. Cyber-compliance stops being a product-team cost line and becomes a percentage of enterprise revenue held hostage to the weakest product in the catalogue. You cannot ring-fence it inside one business unit, because the Regulation does not ring-fence the base.

One phrase in the text changes the base entirely: "if the offender is an undertaking." Undertaking is not the same as the legal entity that signed the declaration of conformity. It is the whole economic unit, the group as it is counted for turnover purposes, which is why the base is the parent's consolidated worldwide revenue rather than the subsidiary's local books. The other anchor is "for the preceding financial year," which fixes the base to a known, audited number already in your annual report. That combination is deliberate. It means the exposure is not speculative or hard to compute; an authority can read your published accounts, take the top line, and multiply. So can you, tonight.

## Three bands, and the conduct that lands you in each

Article 64 sorts infringements into three fine bands, each with its own cap and its own trigger conduct. Mapping real behaviour to the right band is the core of any honest exposure model.

| Band | What triggers it | Fixed cap | Turnover cap (whichever is higher) |
|---|---|---|---|
| **Tier 1 — Art 64(2)** | Failing the Annex I essential requirements, the manufacturer's core product duties, or the incident- and vulnerability-reporting duties | €15,000,000 | **2.5%** of total worldwide annual turnover |
| **Tier 2 — Art 64(3)** | Falling short on the economic-operator duties: importer and distributor obligations, the conformity-assessment procedure, and related market-facing duties | €10,000,000 | **2%** |
| **Tier 3 — Art 64(4)** | Supplying incorrect, incomplete, or misleading information to a notified body or a market-surveillance authority | €5,000,000 | **1%** |

The top band is where the security substance lives. If a product ships without meeting the Annex I essential cybersecurity requirements, or the manufacturer never stands up the reporting path for actively exploited vulnerabilities and severe incidents, the exposure is 2.5%. The route to meeting those product requirements is the subject of [EP 7.01](/blog/ep-7.01-self-assessment-vs-notified-body-modules-a-b-c-h), and the reporting clocks that sit alongside them are worked through in [EP 6.01](/blog/ep-6.01-the-24-hour-early-warning-panic-operationalizing-t); both duties sit in the same top band, which is why a company that has budgeted carefully for conformity and ignored reporting has only half-covered its largest exposure.

The middle band, Art 64(3), catches the surrounding economic-operator duties, the obligations that fall on importers and distributors and on the conformity-assessment machinery. The bottom band, Art 64(4), is narrower and often underestimated: it fines you for lying to the referee. Give a notified body or a market-surveillance authority information that is incorrect, incomplete, or misleading in reply to a request, and that is a separate €5 million or 1% exposure on its own, independent of whatever underlying problem you were describing. And a fine does not replace a recall or a withdrawal; it sits on top of whatever corrective measures the authority also orders for the same infringement.

<!-- IMAGE-SLOT: ep-8.01-tier-ladder | 1200x800 | alt: "A three-rung ladder of CRA fine bands: bottom rung 5 million euros or 1 percent for misleading information, middle rung 10 million euros or 2 percent for economic-operator duties, top rung 15 million euros or 2.5 percent for essential requirements and reporting failures" | caption: "The three Article 64 bands. Each cap is the HIGHER of the fixed figure or the percentage of worldwide turnover; the top rung carries the product-security and reporting duties." -->

Put the €4 billion group from the top of this post against the ladder and the bands stop being abstract. Its top-band exposure is 2.5% of €4bn, or €100 million. Its middle-band exposure is 2% of the same base, €80 million. Its bottom band, for handing an authority misleading information, is 1%, €40 million. Three numbers, all governed by the percentage because the group is large enough to clear every fixed floor, and all anchored to the same worldwide turnover regardless of which product or which division generated the infringement. A company that has never modelled these has three eight-figure liabilities sitting off its risk register.

## The cap is the ceiling, not the bill

None of these figures is the fine. Each is the maximum. What an authority actually imposes is set by Article 64(5), which directs it to weigh the nature, gravity, and duration of the infringement and its consequences; whether the same or another authority has already fined the operator for something similar; and the size and market share of the company. A first, quickly-remediated gap on a low-consequence product does not draw the same number as a years-long failure on a widely-deployed one, even inside the same band.

Consider two companies in the same top band. The first finds an Annex I gap in a niche product, discloses it, remediates within weeks, and has no prior enforcement history. The second shipped a widely-deployed product with a known essential-requirement failure, left it unfixed for two years, and has already been fined once in another Member State for something similar. Both face the same €100 million ceiling on paper. They will not pay anything close to the same number, because gravity, duration, consequences, and prior history all point in opposite directions. The band sets the room; Article 64(5) decides where in the room you land. This is also why remediation speed and clean disclosure are not soft virtues but direct inputs into the fine an authority can justify.

Company size cuts both ways, and this is where a persistent myth needs killing. There is no separate "SME penalty article." Smaller operators do not get a lower ceiling; they get an argument. Art 64(5) names microenterprises, small and medium enterprises, and start-ups explicitly as a factor an authority must weigh, so a small company can argue its scale down inside the same band a large one cannot. On top of that, one narrow carve-out exists: micro and small manufacturers are not fined for missing a reporting deadline, and open-source software stewards sit outside the fine regime entirely. Everyone else pays on the same three-band scale, with size as mitigation, not exemption.

One more structural point a board should understand. These caps are harmonised across the Union, but the machinery that reaches them is national. Article 64 directs each Member State to lay down penalties that are effective, proportionate, and dissuasive, and it is a national authority or court that sets and imposes the actual figure. An authority that fines you also notifies its counterparts in the other Member States, so a penalty in one market is visible across all of them. The €100 million is an EU-wide ceiling; the hand that reaches for it is local.

Put one number in front of your board before an authority puts it in front of you. Take last year's total worldwide group turnover, multiply by 2.5%, and compare it to €15 million; the larger figure is your top-band exposure to a single product's essential-requirement or reporting failure. That number, not the revenue of the product at risk, is what belongs in the enterprise risk register. Then work backward: every product line that has not closed its Annex I gaps or stood up its reporting path is a live draw against it. Re-run the multiplication whenever group turnover moves, because the exposure grows with the company even when the products stand still, and treat the calculation as a standing board metric rather than a one-time legal memo. Model the exposure against your own group turnover in the [conformity workspace](/demo), or read the penalty regime as written in [the statute](/wiki/cra).
