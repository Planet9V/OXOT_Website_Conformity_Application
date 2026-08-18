---
id: "TC_04"
canonical_code: "TC_04"
title: "The Open-Source Steward's Balance Sheet: What the CRA Actually Costs a Foundation"
subtitle: "A steward's obligations are a fixed line of overhead, not a per-product bill. The expensive line is reserved for whoever sells a product — and a dual-license vendor quietly ends up on both."
slug: "tc-04-open-source-steward-balance-sheet-cra"
series_id: 10
episode_number: 4
series: "CRA: Truth & Consequences (Investigative)"
target_persona: "Open-source foundation directors, project maintainers, dual-license and paid-support vendors."
persona_category: "Investigative"
statutes: ["Article 24", "Article 3(14)", "Recital 18", "Recital 19"]
statutory_domain: "Article 24 — Open-source software stewards"
difficulty: "Advanced Engineering"
key_metric: "Steward cost is fixed org overhead; manufacturer cost scales per product"
read_time: "8 min read"
duration: "13:20"
audio_url: "https://oxot.ai/audio/cra_podcast/TC_04.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["Cyber Resilience Act", "Regulation (EU) 2024/2847", "open-source software steward", "Article 24", "dual license", "free and open-source software", "commercial activity", "foundation compliance cost"]
takeaways: ["Why the steward regime is a fixed overhead line, not a bill that multiplies per downstream product", "Where the commercial-activity line actually sits — money in versus a monetised product out", "How a dual-license or paid-support vendor lands on the manufacturer's ledger for its commercial edition, no matter who stewards the upstream code"]
---

# The Open-Source Steward's Balance Sheet: What the CRA Actually Costs a Foundation
*By Jim McKenney — Digital Product Security Consultant & Industrial OT Architect*

Ask a foundation treasurer what the Cyber Resilience Act costs, and the number usually comes off a manufacturer's spreadsheet: a conformity assessment, a technical file for every product, a notified body invoice, CE marking, a decade of guaranteed security updates. Then the treasurer looks at the foundation's real books — a few salaried maintainers, some CI runners, donated cloud credits — and concludes the regulation will close the project.

That conclusion is almost always wrong, and the reason it is wrong is an accounting reason. The CRA does not book a foundation and a product vendor onto the same ledger. It gives most foundations a short, fixed cost line and reserves the expensive line for whoever actually sells a product. The real trouble starts when one organisation sits on both lines at once and only budgets for the cheap one.

<!-- IMAGE-SLOT: tc-04-hero | 1200x630 | alt: "A two-column ledger, the left column headed 'Steward: fixed overhead' with a short list, the right headed 'Manufacturer: cost of goods, per product' with a much longer list." | caption: "The CRA does not put a foundation and a product vendor on the same ledger. It writes them different cost lines." -->

## The steward line is overhead, and it does not multiply

Start with what a steward actually is, because the definition is the whole cost model. Under Article 3(14), an open-source software steward is a legal person, distinct from a manufacturer, whose purpose is to provide sustained support for the development of specific FOSS products that are *intended for commercial activities*, and to keep those products viable. Foundations that host, govern, and steer widely embedded projects are the archetype. A weekend contributor is not.

If your organisation fits that definition, Article 24 is your bill. It is short. You stand up a documented, verifiable cybersecurity policy that drives secure development and coordinated vulnerability handling across your project's contributors. You cooperate with a market surveillance authority when it asks, and you hand over that documentation in a language it can read. You participate in vulnerability reporting only to the extent you are actually involved in the development, and in incident reporting only where a severe incident hits infrastructure you yourself run for the project. That is the list. The mechanics of each duty are worked through in the [companion piece on when a maintainer becomes a steward](/blog/ep-4.04-open-source-firmware-commercial-stewards-monetizin); the point here is what those duties do to a budget.

They behave like fixed overhead. You write the security policy once and govern it continuously. You run one coordinated-disclosure process, keep one authority contact reachable, and monitor the infrastructure you provide. None of that scales with the number of downstream companies that embed your code. Ten integrators or ten thousand, a foundation's steward cost is the same paragraph of the ledger. There is no per-product technical file, no conformity assessment, no notified body, no CE marking, and no support-period guarantee. The recitals build the steward regime as light-touch and tailor-made, and a steward that is not certifying a product against the essential requirements has nothing to attach a CE mark to (Recital 19).

That is what most foundations never hear stated plainly: the regulation priced you as overhead, not as a factory.

## Where the money actually crosses the line

The panic in most foundations comes from watching money flow *in* and assuming it converts them into a commercial operator. It does not, and Recital 18 is unusually direct about closing that door. Free and open-source software falls into scope only when it is made available on the market, meaning supplied for distribution or use in the course of a commercial activity. How the software was developed, and how the development was financed, are explicitly not counted when deciding whether the activity is commercial.

Read against how open source is actually funded, that settles most of the fear:

- Corporate sponsorship and donations do not make the activity commercial.
- Companies contributing code, or paying to keep a project alive, do not make it commercial.
- Cutting regular, scheduled releases does not make it commercial.
- A not-for-profit that spends every euro after costs on its mission is, for this purpose, not commercial.

<!-- IMAGE-SLOT: tc-04-commercial-line | 1000x620 | png | alt: "A horizontal line. Below it, inbound-money signals: donations, corporate sponsorship, contributed code, regular releases. Above it, one item: a monetised product supplied under your own name." | caption: "Recital 18 draws the line at the product going out, not the money coming in. Only supply of a monetised product crosses it." -->

The line is drawn at what goes *out*, not at what comes *in*. You cross it when you supply a monetised product under your own name. And the drafters carried that logic down to components: a FOSS component supplied for integration by other manufacturers counts as "made available on the market" only where the *original* maintainer monetises it. Otherwise the market-facing duty lands on the integrator who sells the finished device, not on the upstream project. For a pure foundation, the inbound column of the balance sheet, however large, never trips the commercial threshold. Only an outbound, monetised product does.

## The dual-license trap: two hats, one company, both cost lines

Sophisticated organisations lose money at exactly this point, and precisely because they are sophisticated enough to think they have already solved it.

Take the common commercial pattern. A company open-sources a core library, sustains it, hosts its infrastructure, and steers its releases: genuine steward behaviour. It then sells an enterprise edition of the same code, offering hardened builds, a paid long-term-support subscription, and a dual-licensed distribution, all under its own trademark. The instinct is to treat the steward regime as the ceiling for the whole operation, because "we're the steward of this project."

That is the misread, and it is an expensive one. The steward status attaches to the community project. It does not travel to the commercial edition. The moment the company supplies a monetised product with digital elements under its own name, it is the manufacturer of that product, full stop, and the manufacturer's ledger opens: the Annex I essential requirements across the full lifecycle, a technical file, conformity assessment on the route its product class demands, an EU declaration of conformity, CE marking, a defined support period with security updates, and the full reporting duties with their tight clocks. The upstream licence does not shield the downstream vendor, and neither does calling the parent foundation a steward shield the subsidiary that ships the box.

<!-- IMAGE-SLOT: tc-04-two-hats | 1000x640 | png | alt: "One company entity wearing two labelled hats. One hat sits over a 'community core project' box and reads 'Steward — Art 24'. The other sits over an 'Enterprise Edition (sold)' box and reads 'Manufacturer — full duties'. An arrow marked 'does not net' is struck through between them." | caption: "The same company can wear both hats at once. The steward regime covers the community core; it does not cap the obligations on the edition you sell." -->

So the dual-license vendor does not get to pick a line. It sits on both. The community core carries the fixed steward overhead. The enterprise edition carries the per-product, per-year manufacturer cost of goods. The two do not net against each other, and the steward line cannot be used to discount the manufacturing line. Any compliance budget that shows only the steward line for a company that sells a supported build is understating the real number by an order of magnitude.

## The two cost lines, side by side

| Ledger line | Steward (Article 24) | Manufacturer (the edition you sell) |
|---|---|---|
| **What triggers it** | Sustained support for FOSS intended for commercial use | Supplying a monetised product under your own name |
| **Security policy / vuln handling** | Documented, verifiable policy; coordinated disclosure | Full lifecycle vulnerability handling per the essential requirements |
| **Technical documentation** | None per product | Technical file for each product |
| **Conformity assessment** | None | Required, route set by product class |
| **CE marking** | Not permitted | Required |
| **Support period** | No guarantee | Defined period of security updates |
| **Reporting** | Only where involved in development / hosting the affected infrastructure | Full reporting duties, tight clocks |
| **How the cost scales** | Fixed org overhead — flat across all downstream users | Per product placed on the market, recurring across its support period |

The bottom row is the one a treasurer should read first. The steward regime is a fixed cost you pay once and govern; manufacturing is a cost of goods that recurs for every SKU you sell and every year you support it.

## The role sets the ledger, not the codebase

The CRA did not set out to bankrupt foundations, and read correctly it does not. It priced sustained stewardship as overhead and priced selling a product as manufacturing, and it kept those two prices in separate columns on purpose. The organisations that get hurt are not the ones that misread the law's severity; they are the ones that book a commercial product on the steward's line because the same engineers wrote the same code. Map each legal entity to the role it actually plays, whether publisher, steward, or manufacturer, and put its costs on the matching line before an auditor does the accounting for you.
