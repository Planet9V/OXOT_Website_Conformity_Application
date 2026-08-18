---
id: "EP_6.06"
canonical_code: "EP_6.06"
title: "Closing the Loop: The Final Report, the RCA, and the Technical-File Update"
subtitle: "The crisis ends at the paperwork. After the patch ships, two duties survive it: the final report that closes your reporting obligation, and the technical-file update that has to hold up for a decade."
slug: "ep-6.06-the-14-day-final-closeout-root-cause-analysis-tech"
series_id: 6
episode_number: 6
series: "Vulnerability Operations, PSIRT & 24h Clocks"
target_persona: "Quality Directors, Chief Technology Officers, Compliance Managers."
persona_category: "Quality & Notified Bodies"
statutes: ["Article 14(2)(c)", "Article 14(4)(c)", "Article 13(3)", "Article 13(9)", "Article 13(13)", "Annex VII"]
statutory_domain: "Incident Reporting & PSIRT"
difficulty: "Advanced Engineering"
key_metric: "14-day final report (Art 14(2)(c))"
read_time: "8 min read"
duration: "14:15"
audio_url: "https://oxot.ai/audio/cra_podcast/EP_6.06.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["Cyber Resilience Act", "Regulation (EU) 2024/2847", "Article 14", "final report", "technical documentation", "SBOM", "Quality & Notified Bodies", "Industrial OT Security"]
takeaways: ["The 14-day clock starts when your fix is available, not when you became aware", "What the statutory final report must contain, and where root-cause actually lives", "Closing the technical file: the risk-assessment update, the SBOM, and the 10-year archive"]
---

# Closing the Loop: The Final Report, the RCA, and the Technical-File Update
*By Jim McKenney — Digital Product Security Consultant & Industrial OT Architect*

The patch shipped. The exploit is contained, the advisory is out, your operators are updating on their next maintenance window. It feels finished. It isn't. Two duties outlive the fix, and one of them runs a clock most teams misread from the first hour.

The crisis ends at the paperwork. Not the frantic paperwork of the 24-hour early warning, but the quiet closeout: a final report that discharges your reporting obligation, a root-cause analysis that earns its keep in the technical file, and an update to the statutory dossier that has to survive for a decade. Nobody rehearses this stage, because it happens after the adrenaline is gone and the incident bridge has been stood down.

<!-- IMAGE-SLOT: ep-6.06-hero | 1200x630 | alt: "A quiet engineering office after an incident: a closed laptop, a printed final report in a folder, and an archive box, one desk lamp on" | caption: "The closeout happens after the war room empties. It is still a statutory deadline." -->

Here is the walkthrough for closing the loop without leaving a thread hanging.

## The 14-day clock does not start when you think

By now the reporting channel knows about this vulnerability. You fired the 24-hour early warning the moment you confirmed active exploitation, a discipline covered in [the 24-hour early-warning episode](/blog/ep-6.01-the-24-hour-early-warning-panic-operationalizing-t). You followed it at 72 hours with the fuller notification, broken down field by field in [the 72-hour notification episode](/blog/ep-6.04-the-72-hour-full-notification-what-forensic-eviden). The final report is the third and last checkpoint on the same track, filed to the coordinating CSIRT and, simultaneously, to ENISA through the single reporting platform.

Read the deadline carefully, because the wording is the whole point. For an actively exploited vulnerability, the final report is due under Article 14(2)(c) "no later than 14 days after a corrective or mitigating measure is available." Not 14 days after you became aware. Not 14 days after the 72-hour filing. Fourteen days after your fix, or a viable mitigation, is actually in hand.

That distinction changes the shape of the whole response. The 24-hour and 72-hour clocks run from awareness and are brutal about it. This one is tethered to your remediation. If your fix takes six weeks to validate through an OT release process, the final-report clock has not even started at week five. The moment it does start is the moment a corrective or mitigating measure exists, and a temporary mitigation counts. Ship an interim workaround and you have started the 14 days whether you meant to or not, so the mitigation you publish and the report you owe are two ends of the same event.

One more thing the title of this episode understates: the 14-day figure is the vulnerability track. If you reported a *severe incident* rather than an exploited vulnerability, the final report follows a different rule under Article 14(4)(c): within one month of the 72-hour incident notification. Know which track you are on before you diary the date.

## What the final report has to contain

The statute is short about this, and the report inherits the same "unless the relevant information has already been provided" logic as the earlier filings. It is a closing delta, not a fresh essay. For the vulnerability track, the final report gives at least three things:

- a description of the vulnerability, including its severity and impact;
- where available, information on any malicious actor that has exploited or is exploiting it;
- details about the security update or other corrective measure made available to remedy it.

<!-- IMAGE-SLOT: ep-6.06-loop | 1200x800 | alt: "A flat diagram of three closeout artifacts: final report to the CSIRT/ENISA channel, RCA feeding a technical file, and a 10-year archive box, joined by a single loop arrow" | caption: "Three artifacts close the loop: the report to the channel, the analysis, and the dossier update behind it." -->

Notice what is and is not on that list. "Where available" still qualifies the actor information, so attribution you never nailed down is not a missing line item. And the word most people expect to see here, *root cause*, is not in the vulnerability track at all. It lives in the incident track: Article 14(4)(c) asks for "the type of threat or root cause that is likely to have triggered the incident." So if you are closing an exploited-vulnerability report, the statute wants your description, the actor detail you have, and a clear account of the fix. It does not demand a formal five-whys write-up on the 14-day filing.

Which raises the obvious question: then why do the analysis at all?

## The RCA the statute names once, and you need twice

You write the root-cause analysis because two different readers depend on it, and only one of them is the CSIRT.

The first reader is the reporting channel, on the incident track, where root cause is an explicit line. The second reader is future-you, and every market-surveillance authority who may ask to see your technical documentation years from now. A vulnerability that reached exploitation in a shipped product is evidence about your development process, not just about one build. The RCA is where you convert that evidence into a change: the missing input validation becomes a coding-standard fix, the unreachable-in-theory code path that turned out reachable becomes a test case, the third-party component nobody was tracking becomes an SBOM-monitoring gap you close.

That is the bridge from the incident to the dossier. The final report closes your obligation to the outside world. The RCA is what makes the *next* update to your own technical file honest.

## Updating the technical file is the part with teeth

Filing the final report closes the reporting loop. It does not close the conformity loop. The Cyber Resilience Act treats your technical documentation as a living record, and a vulnerability that got through is exactly the event that is supposed to move it.

Two updates matter most. First, the cybersecurity risk assessment. Article 13(3) requires it to be documented and kept updated across the support period, and Annex VII puts that assessment inside the technical documentation itself. An incident that materialised a risk you rated low, or a threat you did not model, is a direct instruction to revise it. Second, the software bill of materials. If the flaw lived in a dependency, your SBOM and your vulnerability-handling records have to reflect the new version, the advisory, and the monitoring you added so the same class of bug surfaces earlier next time.

None of this carries a countdown clock the way the report does. It carries something slower and heavier: the expectation that if an authority opens your dossier, the story it tells matches the incident that actually happened. A technical file frozen at the date of first CE marking, with no trace of an exploitation event everyone else can see in your public advisory, is its own kind of finding.

## The archive clocks that outlive the incident

Closeout is where the archive obligations finally bite, and there are a pair of them. They are easy to blur together because both mention ten years and the support period, but they govern different things.

| Obligation | What it covers | The floor |
|---|---|---|
| Documentation retention (Art 13(13)) | The technical documentation and EU declaration of conformity, kept at the disposal of market-surveillance authorities | 10 years after the product was placed on the market, or the support period, whichever is longer |
| Update availability (Art 13(9)) | Each security update you issued, kept downloadable so users can still apply it | 10 years after the update was issued, or the remainder of the support period, whichever is longer |

The first is a filing-cabinet duty: keep the evidence, including the version you just revised, retrievable. The second is a distribution duty: the hotfix you shipped during this incident has to stay fetchable long after the incident is forgotten, because an operator commissioning a cold spare in year eight still needs it. Support periods for industrial products run at least five years and routinely far longer, so for most OT vendors "whichever is longer" is the operative phrase in both rows.

A closing caution on tone. The final report ends your obligation to notify. It is not, by default, the opening of an adversarial ENISA proceeding, and treating it as one leads teams to over-lawyer a filing the statute wrote plainly. You are closing a report, not defending a case. Write it accordingly, then archive the evidence that proves you did.

## The closeout checklist

When the fix is out and the war room is quiet, run this before you call the incident closed:

1. **Confirm the track.** Exploited vulnerability, or severe incident? That sets your deadline: 14 days after the corrective or mitigating measure is available, or one month after the 72-hour incident notification.
2. **File the final report as a delta.** Description with severity and impact; actor information where you have it; details of the corrective measure. Do not resend what earlier filings already carried.
3. **Complete the RCA even when the track does not name it.** Root cause, contributing factors, and the specific process change each one triggers.
4. **Revise the risk assessment.** Update the documented assessment inside the technical file to reflect the risk this incident proved real.
5. **Regenerate the SBOM and vulnerability records.** New component versions, the advisory reference, and the monitoring you added.
6. **Set both archive clocks.** Documentation and DoC retained for 10 years or the support period; the security update kept downloadable for 10 years or the remainder of the support period. Whichever is longer, in both cases.

Six lines. The first five close this incident. The sixth is what a market-surveillance authority will be able to read about it a decade from now.
