---
id: "EP_6.04"
canonical_code: "EP_6.04"
title: "The 72-Hour Notification: What Actually Goes in the Report"
subtitle: "By hour 72 the early warning becomes a fuller filing. Here is the field-by-field breakdown of what the CRA requires, and what is just good incident-response practice you should add anyway."
slug: "ep-6.04-the-72-hour-full-notification-what-forensic-eviden"
series_id: 6
episode_number: 4
series: "Vulnerability Operations, PSIRT & 24h Clocks"
target_persona: "Lead Incident Responders, Forensic Analysts, Regulatory Compliance Officers."
persona_category: "PSIRT & Incident Responders"
statutes: ["Article 14(2)(b)", "Article 14(4)(b)", "Article 16(2)"]
statutory_domain: "Incident Reporting & PSIRT"
difficulty: "Advanced Engineering"
key_metric: "Article 14(2)(b) / 14(4)(b) notification"
read_time: "8 min read"
duration: "14:15"
audio_url: "https://oxot.ai/audio/cra_podcast/EP_6.04.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["Cyber Resilience Act", "Regulation (EU) 2024/2847", "Article 14", "72-hour notification", "PSIRT & Incident Responders", "Industrial OT Security"]
takeaways: ["What the 72-hour notification must contain vs. what is practice", "IoCs and root-cause depth are IR discipline, not statutory line items", "The sensitivity flag most teams leave blank"]
---

# The 72-Hour Notification: What Actually Goes in the Report
*By Jim McKenney — Digital Product Security Consultant & Industrial OT Architect*

At hour 24 you told the coordinating CSIRT that something in your product is being exploited in the wild. At hour 72 you owe them a fuller picture. Somewhere between those two deadlines a myth has hardened: that the 72-hour notification is the moment a regulator sits in judgment of your incident response and decides whether you were competent or grossly negligent.

It isn't. Read Article 14 and the verb is plain. You *provide general information, as available*. The 72-hour notification is a reporting checkpoint, not a competence exam, and the difference changes how you should staff and write it.

<!-- IMAGE-SLOT: ep-6.04-hero | 1200x630 | alt: "Incident responder at hour 72 filling a CRA notification form on a console, a countdown clock visible" | caption: "Hour 72 is a status update to the people who protect the installed base, not a verdict on your response." -->

This post is the field-by-field breakdown: what the CRA actually requires in the 72-hour filing, and what is simply good practice you should add because it makes the next fourteen days easier for everyone downstream.

## Two clocks, one platform, and a filing that is a delta

Article 14 runs two parallel reporting tracks. One is for an actively exploited vulnerability in your product. The other is for a severe incident affecting its security. Both escalate through the same three checkpoints: a 24-hour early warning, a 72-hour notification, and a later final report. All of it goes to the CSIRT designated as coordinator and, simultaneously, to ENISA, through the single reporting platform established under Article 16.

The 24-hour trigger is its own discipline, and if you have not built a clean way to fire it without crying wolf, that is the subject of [the 24-hour early warning episode](/blog/ep-6.01-the-24-hour-early-warning-panic-operationalizing-t). This episode picks up the clock at 72.

Here is the phrase that governs the second filing: *"unless the relevant information has already been provided."* The 72-hour notification is not a fresh report written from scratch. It is a delta on your 24-hour warning. Whatever you already sent, you do not resend. What you add is the detail that has firmed up in the two days since.

## What the statute actually asks for at 72 hours

The exact contents depend on which track you are on. Set them side by side, because the wording differs in ways that matter.

<!-- IMAGE-SLOT: ep-6.04-fields | 1200x800 | alt: "Two-column diagram comparing the required fields of the 72-hour vulnerability notification and incident notification, with the shared 'as available' qualifier and sensitivity flag highlighted" | caption: "Five fields per track. Every one of them is qualified by 'as available'." -->

| The 72-hour filing must give... | Actively exploited vulnerability — Art 14(2)(b) | Severe incident — Art 14(4)(b) |
|---|---|---|
| The thing itself | General information about the **product concerned** | General information about the **nature of the incident** |
| Your read on it | The **general nature of the exploit and of the vulnerability** | An **initial assessment** of the incident |
| What you've done | Any **corrective or mitigating measures taken** | Any **corrective or mitigating measures taken** |
| What users can do | Corrective or mitigating measures **users can take** | Corrective or mitigating measures **users can take** |
| How to handle it | **How sensitive** you consider the information to be | **How sensitive** you consider the information to be |

Five fields per track. That is the whole statutory ask at 72 hours. No CVSS vector is named. No indicator-of-compromise package is named. No affected-version matrix, no SBOM diff, no attribution. Those things are useful, and some of them are coming later, but they are not what the article puts on the 72-hour line.

## The two words doing all the work: "as available"

Every field above is qualified. For a vulnerability the text says the information is provided "as available"; for an incident, "where available." That qualifier is the most misread part of the whole obligation.

It means you are not required to have finished root-cause analysis by hour 72. You are not required to have enumerated every affected build, reproduced the exploit, or named the actor. If you know it, you report it. If you do not know it yet, you say so and move on. The duty is an honest account of your current state, not a complete one.

This is exactly where the "grossly negligent" myth does real damage. A team that believes hour 72 is a graded exam will sit on the filing, polishing a forensic write-up until it looks defensible, and blow the deadline chasing a standard the statute never set. The regulator did not ask for a masterpiece. It asked for a timely status update with the boxes you can honestly fill.

## What isn't required but belongs in the report anyway

So why would a mature PSIRT attach indicators of compromise and a working root-cause hypothesis at 72 hours when none of that is a line item?

Because of where the notification goes next. The coordinating CSIRT does not file your report and forget it. It forwards the notification through the platform to the other national CSIRTs where your product is sold, and it hands the relevant details to market-surveillance authorities. Structured indicators — hashes, malicious IPs, a YARA rule, the specific precondition that makes a device exploitable — are what let those downstream teams protect the installed base while you finish your fix. A good 72-hour notification is written for the responder on the other end who has to act on it, not for an auditor.

In an OT context this is not abstract. The same controller ships into a dozen plants across three Member States, and the operators there cannot pull a firmware update on a whim; they wait for a maintenance window. The indicators you attach at 72 hours are what let their national CSIRT tell them to close the management port today, weeks before your patch reaches the floor. Skip the practice fields and you have met the letter of the obligation while leaving your own customers blind.

Draw the line clearly so nobody confuses the two:

> [!NOTE]
> **Statutory (must be in the 72-hour filing, as available):** product/incident identification, general nature of the exploit or an initial assessment, mitigations you took, mitigations users can take, sensitivity marking.
>
> **Practice (add it because it helps, not because Article 14 lists it):** IoCs in a machine-readable format, a CVSS vector, the affected-version range, and a first root-cause hypothesis. The heavier forensic material — the full write-up of the flaw, its root cause, and the applied and ongoing mitigations — is what the *final report* formally requires, and that is the subject of [the 14-day closeout episode](/blog/ep-6.06-the-14-day-final-closeout-root-cause-analysis-tech).

A realistic 72-hour vulnerability notification, annotated, looks like this:

```text
PRODUCT CONCERNED        Model X controller, firmware 3.x branch, units
                         shipped into DE, FR, NL. [statutory]
NATURE OF EXPLOIT/VULN   Unauthenticated command injection on the device
                         web UI, exploited in the wild to gain root.
                         Precondition: management port reachable. [statutory]
MEASURES TAKEN           Interim signed hotfix in validation; advisory PSIRT-
                         2026-014 drafted. Full patch ETA ~10 days. [statutory]
MEASURES USERS CAN TAKE  Restrict management port to the maintenance VLAN;
                         disable remote UI until patched. [statutory]
SENSITIVITY              High — no public patch yet; do not disseminate
                         beyond CSIRTs until fix ships. [statutory]
--- attached as practice, not required by Art 14(2)(b) ---
IoCs                     3 file hashes, 2 C2 IPs, 1 YARA rule.
ROOT-CAUSE HYPOTHESIS    Missing input validation on the diag endpoint;
                         confirmation pending. Not yet final.
```

Everything above the line is the statute. Everything below it is you making the report useful. The clock only measures the part above the line.

## The field almost everyone leaves blank

The sensitivity marking is the field teams skip, and it is the one that gives you the most control over what happens next. Both 72-hour notifications ask you to indicate how sensitive you consider the information to be, and that is not a formality.

Under Article 16(2), your sensitivity marking is the justification the coordinating CSIRT uses to *delay* wider dissemination of the notification on cybersecurity grounds — for instance when the vulnerability is still under coordinated disclosure and no patch has shipped. Flag it as high, and you have a mechanism to keep an unpatched zero-day from propagating across the platform faster than your fix can. Leave it blank, and you have handed away your only say in the timing. For an OT vendor whose customers cannot patch on a Tuesday, that timing is the difference between a controlled rollout and a scramble.

## The reframe

The instinct under a 72-hour clock is to treat the deadline as a verdict and freeze until the report is airtight. The statute asks for the opposite. It wants a timely, incremental, honest account of what you know right now: the product, the nature of the flaw, the mitigations, the sensitivity, and a frank admission of the gaps you have not closed. The teams that miss the deadline are almost always the ones polishing a forensic report nobody asked for on day three.

Hour 72 is not your exam. It is the status update that keeps everyone else's from failing.
