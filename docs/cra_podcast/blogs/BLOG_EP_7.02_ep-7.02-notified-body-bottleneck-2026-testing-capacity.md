---
id: "EP_7.02"
canonical_code: "EP_7.02"
title: "The Notified Body Bottleneck: Booking Audit Capacity Before the Crunch"
subtitle: "The audit slots that can CE-mark a higher-risk product are scarce, slow to create, and all needed inside the same window before 11 December 2027. Treat notified-body capacity as a logistics problem: get in the queue early, with a dossier that won't bounce, and arrive already tested."
slug: "ep-7.02-notified-body-bottleneck-2026-testing-capacity"
series_id: 7
episode_number: 2
series: "Conformity Assessment, Audits & CE Marking"
target_persona: "Hardware Operations VPs, Regulatory Strategy Leads, Lab Directors."
persona_category: "Quality & Notified Bodies"
statutes: ["Article 35", "Article 43", "Article 32", "Annex IV"]
statutory_domain: "Notification of conformity assessment bodies"
difficulty: "Operations & Regulatory Strategy"
key_metric: "Capacity window: 11 Jun 2026 → 11 Dec 2027"
read_time: "8 min read"
duration: "14:15"
audio_url: "https://oxot.ai/audio/cra_podcast/EP_7.02.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["Cyber Resilience Act", "Regulation (EU) 2024/2847", "notified body", "conformity assessment", "audit capacity", "CE marking", "Annex IV", "Article 35", "Industrial OT Security"]
takeaways: ["A pre-audit readiness kit that keeps your booked slot from being wasted on findings you could have closed yourself", "Why notified-body supply is inelastic: accreditation, notification, and a statutory standstill all sit between a lab and your certificate", "How internal pre-compliance testing against harmonised standards buys back scarce assessor hours"]
---

# The Notified Body Bottleneck: Booking Audit Capacity Before the Crunch
*By Jim McKenney — Digital Product Security Consultant & Industrial OT Architect*

Look at CRA conformity assessment as a supply chain and the shape of the problem is obvious. On the demand side sits a large population of manufacturers whose higher-risk products cannot be self-declared and must be signed off by a third party; industry estimates put that in-scope population in the tens of thousands of companies across the Union. On the supply side sits a small, slowly-growing set of conformity-assessment bodies that a Member State has formally designated to do CRA work. By mid-2026, industry trackers put that set at a handful of bodies per country, with several Member States yet to designate any. Demand is broad and front-loaded. Supply is narrow and slow to build. That gap is the bottleneck, and no amount of good engineering makes it disappear on its own.

Booking audit capacity is a logistics problem, so treat it like one. Understand why the supply of notified bodies cannot scale on your schedule, get into the queue early with a dossier that will not bounce, and do enough internal testing that your slot, when it finally arrives, passes the first time.

<!-- IMAGE-SLOT: ep-7.02-hero | 1600x900 | alt: "A hardware operations lead standing beside a queue of pallletised industrial products funnelling toward a single accredited test lab bay" | caption: "A capacity problem, not a paperwork problem: a broad in-scope market funnels toward a narrow set of designated bodies inside one fixed window." -->

## Why the supply of notified bodies cannot scale to meet you

A notified body is not a company that decides on its own to start auditing. Under the CRA a Member State's notifying authority may notify only a body that has satisfied the competence requirements the Regulation sets, and it must do so through the EU's shared notification information system. Article 35 puts the obligation on Member States to have enough of these bodies, and it does so in words that show the drafters saw this coming: Member States must "strive to ensure, by 11 December 2026 that there is a sufficient number of notified bodies in the Union to carry out conformity assessments, in order to avoid bottlenecks and hindrances to market entry." When the statute writes the word "bottlenecks" into a deadline, read it as a warning rather than a reassurance.

The pipeline is slow by construction. Before a body can issue you a single certificate it has to be accredited for the specific CRA modules and product categories, apply to its national authority, and then clear a standstill. Under Article 43 a body may begin operating as a notified body only once no other Member State or the Commission has objected to its notification: two weeks where the notification rests on an accreditation certificate, two months where it does not. Layer accreditation lead times on top of that standstill and a body notified in, say, spring 2026 is not clearing a real backlog of product audits until well into the year.

The window makes this bite. The provisions that let Member States notify these bodies only started applying on 11 June 2026. General application, the date by which your CE-marked product must conform to be sold, is 11 December 2027. Every in-scope certificate has to be issued inside that stretch, by a population of assessors that barely existed when it opened.

Do the arithmetic on a single product line and the squeeze is concrete. A body notified in the second half of 2026 spends its first months building assessor headcount and defining its examination procedures. A third-party module for a non-trivial product is not a one-afternoon review; it runs weeks of assessor time per product, plus your own turnaround on findings. If that body can carry only a few dozen product assessments in its first year, and it is one of a handful in its country facing an in-scope market of thousands, the earliest realistic slots fill long before the products chasing them are even built. The manufacturers who wait for the standard to stabilise before booking are queuing behind the ones who booked provisionally and adjusted.

<!-- IMAGE-SLOT: ep-7.02-capacity-window | 1400x1000 | alt: "Timeline infographic from 11 June 2026 to 11 December 2027 showing the notification standstill, accreditation lead time, and thousands of products funnelling through a few notified bodies" | caption: "The designation pipeline versus the deadline. Notification opens June 2026; every higher-risk certificate must be issued before 11 December 2027." -->

## Who is actually standing in the queue with you

Not every product needs a body, and blurring that line is how teams either panic early or miss the queue entirely. Self-assessment through the internal-control route covers the default case. A notified body enters the picture only for the higher-risk categories: important products in the more sensitive class, and the critical products the Regulation lists in Annex IV. For those, the conformity route pushes you toward third-party examination, a full quality-assurance assessment, or a European cybersecurity certification scheme where one applies. Which of your SKUs land in which bucket is the entire subject of [the modules and routing post](/blog/ep-7.01-self-assessment-vs-notified-body-modules-a-b-c-h); settle that first, because it tells you whether you are in this queue at all, and for how many product lines.

The operational consequence is blunt. The manufacturers who need a body are concentrated in exactly the categories where audits take the longest, and they are all trying to book the same scarce assessors in the same eighteen months. If you have even one product in the higher-risk classes, you are competing for that capacity. Plan as if you are early, not late.

## The pre-audit readiness kit

The single biggest cause of a wasted audit slot is arriving with a dossier that is not ready, so the assessor spends your booked engagement raising findings you could have closed yourself. Capacity is scarce. Do not burn your slot proving things you already knew were missing. Assemble this kit before you request a date, not after.

| Kit item | What the assessor expects to see | Why it gates your slot |
|---|---|---|
| Scope & module decision | A documented determination of which products are in scope and which conformity-assessment route each takes | Without it the body cannot quote you the correct module or price the engagement |
| Technical documentation | Complete, current design docs, the risk assessment, and a mapping to the essential requirements | This is the object being examined; gaps here become audit findings |
| SBOM & vulnerability-handling evidence | A machine-readable SBOM and a working vulnerability-handling process with real records | Vulnerability handling is an essential requirement; an empty process reads as non-conformance |
| Harmonised-standard mapping | Where you claim conformity via a standard, the clause-by-clause mapping to it | Cuts assessor subjectivity and audit hours (see [EP 7.05](/blog/ep-7.05-presumption-of-conformity-harmonised-standards)) |
| Test evidence | Results of your own security testing against the essential requirements | Pre-run tests turn the audit into verification instead of discovery |
| Accreditation-scope match | Written confirmation the body is designated for your exact module and product category | A body outside your scope cannot sign your certificate at any price |

Treat that last row as a hard filter. A body can be an excellent lab and still be unable to issue your certificate because its notification does not cover your module or category, and you find that out fastest by asking for the scope of its designation up front. If your product lines span categories, get onto more than one body's list. Put a real date request in writing early, too: a slot you hold and later release is far cheaper than a slot you never secured.

<!-- IMAGE-SLOT: ep-7.02-readiness-dossier | 1600x900 | alt: "An assembled CRA pre-audit dossier on a workbench: technical file, SBOM printout, standard-mapping matrix and test reports tabbed and ready for a notified body" | caption: "The readiness kit, assembled before you request a date. Every closed gap here is an audit finding that never happens." -->

## Arrive audit-ready by testing against the requirements first

The cheapest audit is the one where the assessor confirms what you already proved. Stand up an internal pre-compliance testing function whose job is to run the product against [the CRA essential requirements](/wiki/cra) before any external body sees it. The most effective way to cut both cost and subjectivity is to build against the harmonised standards as they are published: complying with a harmonised standard grants a legal presumption of conformity for the requirements it covers, which narrows what the assessor has to judge from first principles down to what the standard does not reach. That mechanism, and how to track the CEN/CENELEC work feeding it, is [its own subject](/blog/ep-7.05-presumption-of-conformity-harmonised-standards). For capacity planning the point is simpler: every requirement you can demonstrate against a recognised standard is an hour of scarce assessor time you do not have to buy.

Internal testing also de-risks the schedule. If your own test pass finds a design gap in a critical product, you would rather find it in the first quarter than have a notified body surface it three weeks into a slot you waited eight months to get. Pre-compliance testing converts audit risk into engineering work whose timing you control. You can see the same discipline end-to-end in [a live conformity walkthrough](/demo), or map your own product lines against the routing in [the interactive tour](/tour).

Book your slot now. By current designations, the bodies that can lawfully sign your certificate number in the low single digits in most countries while the entire in-scope market forms up behind them, and that queue only lengthens between today and 11 December 2027. Audit capacity is not something you procure at the end of a compliance project. It is the first thing you reserve, and it is the first thing that runs out for everyone who waited.
