---
id: "NEWS_04"
canonical_code: "NEWS_04"
title: "One Incident, Two Regulators: The CRA and NIS2 Reporting Clocks Are Not the Same Clock"
subtitle: "A cyberattack on one industrial gateway can put a single company in front of two European regulators at once. The CRA clock and the NIS2 clock look identical and are not: different duty-holders, different triggers, different destinations. Filing under one does not discharge the other."
slug: "news-04-cra-nis2-dual-incident-reporting-clocks"
series_id: 9
episode_number: 4
series: "The CRA Briefing (News & Policy)"
target_persona: "Group CISOs, incident-response leads, regulatory policy leads at firms that both build and operate connected industrial kit."
persona_category: "News & Policy"
statutes: ["Article 14", "NIS2 Article 23", "Article 16"]
statutory_domain: "Incident Reporting & Regulatory Overlap"
difficulty: "News Briefing"
key_metric: "1 event, 2 filings"
read_time: "3 min read"
duration: "04:20"
audio_url: "https://oxot.ai/audio/cra_podcast/NEWS_04.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["Cyber Resilience Act", "Regulation (EU) 2024/2847", "NIS2 Directive", "Directive (EU) 2022/2555", "CRA Article 14", "NIS2 Article 23", "incident reporting", "24 hour early warning", "72 hour notification", "single reporting platform", "ENISA", "CSIRT", "dual reporting obligations", "does NIS2 satisfy CRA"]
takeaways: ["The CRA and NIS2 incident clocks share a 24h/72h rhythm but are separate legal duties: the CRA binds the product's manufacturer, NIS2 binds the entity that operates the service, and one filing never discharges the other", "The triggers differ: the CRA fires on an actively exploited vulnerability or a severe incident affecting product security, NIS2 fires on a significant incident affecting the service the entity provides", "A firm that both builds and operates connected kit can trip both duties from a single event; the answer is to align one evidence pipeline that feeds two separate reports, not to file once and hope it counts twice"]
---

# One Incident, Two Regulators: The CRA and NIS2 Reporting Clocks Are Not the Same Clock

*By Jim McKenney — Digital Product Security Consultant & Industrial OT Architect*

A question is circulating through corporate legal and security teams as the CRA's reporting duties draw closer: if we report a breach under NIS2, are we covered under the Cyber Resilience Act too? The European Commission's answer is no, and the reason is worth getting right before the first real incident forces the point. NIS2 and the CRA both run a 24-hour clock and a 72-hour clock off the same starting gun. They are still two different duties, owed by two different parties, to two different places.

Picture an industrial gateway inside a water-treatment plant, hit by an attacker exploiting a firmware flaw. That one event can start both clocks at once. The plant operator, as an essential entity, owes a report under NIS2 Article 23 because its service is significantly disrupted. The gateway's manufacturer owes a separate report under CRA Article 14 because a vulnerability in its product is being actively exploited. Same intrusion, two obligations that do not know about each other.

<!-- IMAGE-SLOT: news-04-hero | 1200x630 | alt: "A single cyberattack on an industrial gateway forking into two reporting paths: one to the plant operator's national CSIRT under NIS2 Article 23, one to the coordinating CSIRT and ENISA under CRA Article 14, each on its own 24h/72h clock" | caption: "One intrusion, two clocks. NIS2 sends the operator to its national CSIRT; the CRA sends the manufacturer to the coordinating CSIRT and ENISA. The cadence rhymes; the duties do not merge." -->

## Which clock is which

The two regimes rhyme on cadence and diverge on everything that determines who files and where. Read the duty-holder row first: that is where the "one filing covers both" idea falls apart.

| | CRA — Article 14 | NIS2 — Article 23 |
|---|---|---|
| **Duty-holder** | The **manufacturer** of the product with digital elements | The **essential or important entity** operating the service |
| **What triggers it** | An actively exploited vulnerability, or a severe incident affecting the product's security | A significant incident affecting the service the entity provides |
| **Where it goes** | The coordinating CSIRT and ENISA, via the single reporting platform (Article 16) | The entity's own national CSIRT or competent authority |
| **Cadence** | 24h early warning → 72h notification → final report | 24h early warning → 72h notification → final report within one month |

The cadences look like twins. They are not measuring the same thing. NIS2 is asking an operator to account for disruption to a service the public relies on. The CRA is asking a producer to account for a weakness in a product it placed on the market. One protects the running of critical operations; the other protects the security of the things those operations are built from.

The destinations pull apart in the same way. NIS2 keeps the operator with its own national CSIRT or competent authority, the body that already supervises it. The CRA routes the manufacturer's notification into a single reporting platform that ENISA operates under Article 16, feeding the coordinating CSIRT and ENISA together. Two reports can describe the identical intrusion and never land in the same place. And the resemblance thins further past the 72-hour mark: the final-report clocks are not even the same length, since the CRA's vulnerability track runs its final report on a different deadline from the incident track and from NIS2's one-month deadline. The full drill on the CRA's own clock, including what belongs in each submission, lives in [the 24-hour early-warning walkthrough](/blog/ep-6.01-the-24-hour-early-warning-panic-operationalizing-t).

## Why one filing does not discharge both

The trap is assuming that a single well-written report, sent to a single authority, satisfies whatever else might be watching. It does not, and the gap widens for exactly the firms most exposed: those that both build connected kit and operate with it.

If your company manufactures that gateway and also runs a regulated plant, a single attack makes you the CRA duty-holder and the NIS2 duty-holder simultaneously. Two hats, one legal person, two filings owed to two destinations on two independent triggers. Sending the operational report to your national authority under NIS2 leaves the product-side duty to the coordinating CSIRT and ENISA completely unmet, and vice versa. Neither regulator is looking at the other's inbox.

There is a third recipient the org chart tends to forget entirely: the users. The CRA obliges the manufacturer to inform the product's affected users of the exploited vulnerability and any mitigations they can apply, a communication that runs alongside the regulator filing rather than instead of it. A firm wearing both hats therefore has to move on three fronts from one event, and the triage question is not "who do we call" but "which of these duties has this specific event triggered, and on whose clock." Answer that wrong under time pressure and the missed filing is discovered later, by the regulator, from the other regulator's records.

That is the gap to design against now, while the deadline is still ahead of you rather than behind. The forensic facts underneath both reports are the same facts: what happened, when you knew, which units were affected, what you are doing about it. So build one incident pipeline that captures that evidence once and can emit both filings, addressed correctly, on their own clocks. You can model your own dual-duty position in the [conformity workspace](/demo), and the product-security half is grounded in [the statute](/wiki/cra). For the fuller picture of where the CRA, NIS2, and the AI Act overlap on a single machine, the [tri-directive evidence map](/blog/ep-8.04-cra-nis2-ai-act-unified-evidence-tri-directive) traces exactly where the evidence reuses and where the borders stay hard.

The instinct to consolidate is right; the shortcut is not. Align the pipeline so one investigation feeds two reports. Do not file once and call it covered, because the two clocks are counting for two different regulators who will each notice the silence on their own line.
