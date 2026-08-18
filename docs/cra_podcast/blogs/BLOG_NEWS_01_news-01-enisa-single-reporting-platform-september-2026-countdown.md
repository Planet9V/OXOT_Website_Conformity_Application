---
id: "NEWS_01"
canonical_code: "NEWS_01"
title: "The ENISA Single Reporting Platform Is Real, and the Clock Is Public"
subtitle: "ENISA's Article 16 reporting platform is being stood up ahead of 11 September 2026 — the day the CRA's vulnerability and incident reporting duties start to bite, fifteen months before CE marking. Here is what is now in place and what the countdown actually asks of you."
slug: "news-01-enisa-single-reporting-platform-september-2026-countdown"
series_id: 9
episode_number: 1
series: "The CRA Briefing (News & Policy)"
target_persona: "Compliance Leads, Product Security Managers, Engineering Directors."
persona_category: "News & Policy"
statutes: ["Article 16", "Article 14(2)(a)", "Article 13(17)"]
statutory_domain: "Incident Reporting & Platform Readiness"
difficulty: "Executive Briefing"
key_metric: "11 September 2026"
read_time: "3 min read"
duration: "02:30"
audio_url: "https://oxot.ai/audio/cra_podcast/NEWS_01.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["Cyber Resilience Act", "Regulation (EU) 2024/2847", "ENISA single reporting platform", "Article 16", "Article 14 reporting", "11 September 2026", "actively exploited vulnerability", "coordinating CSIRT", "24-hour early warning"]
takeaways: ["The Article 16 single reporting platform is being stood up ahead of 11 September 2026, when CRA reporting duties begin — fifteen months before CE marking", "The first duty to bite is the 24-hour early warning for an actively exploited vulnerability, filed simultaneously to your coordinating CSIRT and ENISA via the platform", "Provision platform access, identify your coordinating CSIRT, and rehearse the gate now, not during a live incident"]
---

# The ENISA Single Reporting Platform Is Real, and the Clock Is Public

*By Jim McKenney — Digital Product Security Consultant & Industrial OT Architect*

The part of the Cyber Resilience Act that most manufacturers were filing under "2027 problem" now has a fixed date and a working address. ENISA has confirmed that the single reporting platform required under Article 16 will be operational ahead of 11 September 2026, the day the Regulation's vulnerability and incident reporting duties start to apply. That is fifteen months before the CE-marking obligations everyone circled for 11 December 2027. The reporting clock arrives first, and this time it arrives with somewhere to send the report.

<!-- IMAGE-SLOT: news-01-hero | 1200x630 | alt: "A public countdown display in a European regulatory setting showing the date 11 September 2026, with an ENISA reporting-platform submission screen alongside it" | caption: "11 September 2026 is written into the Regulation, and the platform to enforce it is being stood up on schedule." -->

## What the platform actually is

The platform is a single electronic front door. Article 16 puts ENISA in charge of building and running it, with each Member State's coordinating CSIRT and ENISA holding their own notification end-points behind it. You submit once, and that submission reaches both the CSIRT that coordinates for your market and ENISA simultaneously — ENISA is a co-recipient of the notification, not a downstream relay. The same provision also lets the receiving CSIRT hold back wider dissemination in narrow, sensitivity-based circumstances, so a notification tied to an unpatched flaw is not broadcast further than it should be while a fix is still in flight.

The practical change is that there is no longer a question of who to email. There is a platform, and from 11 September 2026 the law expects you to be able to reach it. The full reporting chain, and how it sits inside the wider CRA obligations, is mapped in the [CRA reference](/wiki/cra).

## The first duty to bite

The duty that lands first is the fastest one. Under Article 14(2)(a), once you become aware of an actively exploited vulnerability in your product, you have 24 hours to send an early warning through that platform. "Actively exploited" is not a severity judgement; Article 3(42) ties it to reliable evidence that someone has used the flaw against a live system without permission. A scanner hit or a proof-of-concept does not start the clock. Confirmed real-world exploitation does.

That is the entirety of what the news changes: the countdown is public, and the infrastructure to comply with it is real. The hour-by-hour mechanics of that first day, and the 72-hour and 14-day stages that follow, are already worked through in the deep-dive on the [24-hour early warning](/blog/ep-6.01-the-24-hour-early-warning-panic-operationalizing-t) and the [72-hour notification](/blog/ep-6.04-the-72-hour-full-notification-what-forensic-eviden). This briefing does not re-teach them. It tells you the date is no longer theoretical.

Reading 2027 as the year to start building your reporting process is the expensive misread. If a zero-day in your firmware or your cloud backend is exploited in the autumn of 2026, the 24-hour duty applies to that event, on the platform that exists then. A team that goes looking for its reporting path at hour 20 of a live incident has already lost the incident.

## What to have ready before 11 September 2026

<!-- IMAGE-SLOT: news-01-readiness | 1200x800 | alt: "A flat readiness checklist infographic showing five preparation items — coordinating CSIRT identified, platform access provisioned, single point of contact wired, early-warning template drafted, tabletop rehearsed — against a September 2026 deadline marker" | caption: "None of these takes an afternoon per item. All of them take longer than the 24 hours you will not have during a live incident." -->

- **Know your coordinating CSIRT.** It is the one for the Member State of your main establishment, where your product-security decisions are predominantly taken. Determine it now and store the account and end-point details in the incident runbook, not mid-incident.
- **Provision platform access in advance.** An account you first create during a live exploitation is a self-inflicted deadline miss.
- **Wire up your single point of contact.** Article 13(17) requires a designated channel through which users can reach you directly to report vulnerabilities. That intake feeds the same reporting process, so it needs to exist before the reports do.
- **Draft the early-warning template.** The stage asks for little: that an actively exploited vulnerability exists in a named product, and, where you know it, the Member States where the product was made available.
- **Rehearse the gate.** Run one tabletop where a "reliable evidence" signal arrives at 2 a.m., and time your team from confirmation to submission. The first run will overshoot 24 hours. The point is to find that out now.

If you want the reporting duty mapped against your own product portfolio before any of this is live, that is what the [conformity walkthrough](/demo) is for.

11 September 2026 will not slip the way a standard's publication date can; it is written into the Regulation, and the platform behind it is being provisioned on that schedule. Name your coordinating CSIRT, provision your access, and run the drill while the deadline is still counted in months.
