---
id: "NEWS_05"
canonical_code: "NEWS_05"
title: "The Golden Ticket Isn't Printed Yet: Where the CRA Harmonised Standards Actually Stand"
subtitle: "The Article 27 presumption of conformity is in force. The harmonised standards that make it usable are still being drafted under the CEN/CENELEC mandate and are not yet cited in the Official Journal. Here is what that gap means for a team planning its 2027 conformity, and what to build against while the shelf fills."
slug: "news-05-cra-harmonised-standards-m596-status"
series_id: 9
episode_number: 5
series: "The CRA Briefing (News & Policy)"
target_persona: "Standards engineers, regulatory leads, and product-security owners planning CRA conformity before December 2027."
persona_category: "News & Policy"
statutes: ["Article 27", "Annex I"]
statutory_domain: "Harmonised Standards & Presumption of Conformity"
difficulty: "News Briefing"
key_metric: "0 CRA standards in the OJEU"
read_time: "3 min read"
audio_url: "https://oxot.ai/audio/cra_podcast/NEWS_05.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["Cyber Resilience Act", "Regulation (EU) 2024/2847", "harmonised standards", "CEN CENELEC", "M/596 standardisation request", "Article 27", "presumption of conformity", "Official Journal of the European Union", "ETSI EN 303 645", "IEC 62443-4-1", "IEC 62443-4-2", "Annex I essential requirements", "CRA compliance timeline"]
takeaways: ["The Article 27 presumption route is already law, but almost nothing exists to cite: the CRA harmonised standards are still being drafted under the CEN/CENELEC mandate and none has yet been referenced in the Official Journal", "Standards bodies have signalled the harmonised texts may not be published until late in the run-up to the 11 December 2027 application date, which compresses the window to align and generate evidence against a settled standard", "Build to IEC 62443-4-1/-2 and the expected proxies now as sound engineering, record which draft you built to, and treat the first OJEU citation as your trigger to re-cut evidence, not the point at which you start"]
---

# The Golden Ticket Isn't Printed Yet: Where the CRA Harmonised Standards Actually Stand

*By Jim McKenney — Digital Product Security Consultant & Industrial OT Architect*

The legal machinery that turns a CRA conformity assessment from an argument into a checklist is already in force. The standards that machinery is supposed to run on are not. That gap is the entire status of harmonised standards in 2026, and it is the difference between a compliance plan that lands cleanly in 2027 and one that stalls waiting on a document nobody has published yet.

Here is the mechanism in one line, because it is owned in full by [the presumption-of-conformity deep dive](/blog/ep-7.05-presumption-of-conformity-harmonised-standards) and does not need re-teaching. Under Article 27, a product built in conformity with a harmonised standard whose reference has been published in the Official Journal of the European Union is presumed to meet the [Annex I](/wiki/cra) essential requirements that standard covers. That published reference is the golden ticket. It flips the burden of proof and shrinks the assessment from "is this secure enough?" to "did you implement the named clauses?"

The problem is supply. As of this writing, no CRA harmonised standard has been cited in the Official Journal. The presumption door is open; there is very little on the other side of it to walk through.

<!-- IMAGE-SLOT: news-05-hero | 1200x630 | alt: "An Article 27 door labelled 'presumption of conformity' standing open in front of a nearly empty Official Journal shelf, with draft CEN/CENELEC and IEC 62443 documents queued in a side tray waiting to be shelved before a December 2027 deadline clock" | caption: "The presumption route is in force; the shelf it points to is still nearly empty. The harmonised standards must be cited in the Official Journal before they can carry Article 27." -->

## Where M/596 actually stands

The Commission has done what the Regulation requires: it issued a formal standardisation request to the European standardisation organisations, CEN and CENELEC, to develop harmonised standards for the CRA's essential requirements. The paperwork carries the mandate reference M/596. The work is live and running through the relevant technical committee, which is adapting existing global standards into CRA-specific harmonised texts rather than writing from a blank page.

Live is not the same as published. A harmonised standard only carries the Article 27 presumption once its reference is printed in the Official Journal, and drafting, formal vote, Commission assessment, and citation all sit between the current state and that point. Standards bodies working the mandate have signalled that the finished harmonised texts may not be fully published until late in the run-up to the general application date. The CRA's requirements bite on 11 December 2027. If the citations arrive close to that line, the practical window to align a product, run the work, and generate evidence against a *settled* standard is far narrower than the calendar suggests.

That is the pressure, and it is analysis rather than forecast: the standards have to land before the deadline to be useful, and the closer they land to it, the more a whole sector is compressing the same work into the same short months.

## What to do while the shelf fills

Waiting for the citation is not a plan, because the deadline advances whether the Official Journal does or not. The teams that will be calm in 2027 are already building against the standards everyone expects to be named, and treating publication as a checkpoint rather than a starting gun.

1. **Build to the expected proxies now.** The mandate work draws on the international reference material a competent product-security team already owns. Aligning to it today is good engineering irrespective of the CRA, and it means that when a harmonised standard is cited, you are reading a diff instead of opening a project.
2. **Write down which draft you built to.** Record the specific version and date of the reference material behind your technical documentation. When the final text is published, that record is what lets you scope the re-cut precisely instead of re-auditing everything.
3. **Keep slack to regenerate evidence.** Assume some requirement, threshold, or test method shifts between the draft you used and the version that actually carries the presumption. Reserve the schedule to regenerate the affected evidence the week the citation prints.
4. **Track the Official Journal, not the press release.** The trigger that matters is the reference appearing in the OJEU. Confirm that citation before you rely on any standard for presumption; a standard in draft, or even one adopted but not yet referenced, does not grant it.

> [!NOTE]
> ETSI EN 303 645 for consumer IoT and IEC 62443-4-1/-2 for industrial devices are the standards the harmonised work is expected to build on. They are **not** CRA law, none is a CRA harmonised standard today, and conformity with them does **not** grant the Article 27 presumption. Treat them as the best available proxy for where the harmonised texts are heading, and confirm the OJEU citation before relying on any of them for presumption.

None of this changes which conformity route your product is on; that is set by its class, walked through in [the self-assessment versus notified-body breakdown](/blog/ep-7.01-self-assessment-vs-notified-body-modules-a-b-c-h). What the missing standards change is how much discretion sits inside your route while the shelf stays bare, and how ready you are to close that discretion the day it fills. You can line your product's requirements against the Annex I families in the [conformity workspace](/demo) now, without a single citation in hand.

The standard you will eventually cite is still being written. That is not a reason to wait; it is the reason to start against the draft, log exactly what you built to, and keep enough room to re-cut when the real one prints.
