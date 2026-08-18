---
id: "EP_6.01"
canonical_code: "EP_6.01"
title: "The 24-Hour Early Warning: A Step-by-Step Playbook for the ENISA Notification"
subtitle: "When a vulnerability in your product is actively exploited in the wild, the CRA gives you 24 hours to fire an early warning to the coordinating CSIRT and ENISA. Here is the hour-by-hour path from confirmation to submission — and the gate that keeps the clock from starting on a false alarm."
slug: "ep-6.01-the-24-hour-early-warning-panic-operationalizing-t"
series_id: 6
episode_number: 1
series: "Vulnerability Operations, PSIRT & 24h Clocks"
target_persona: "PSIRT Leads, Incident Response Managers, Corporate CISOs."
persona_category: "Plant CISOs & Asset Owners"
statutes: ["Article 14", "Article 16", "Article 3(42)"]
statutory_domain: "Incident Reporting & PSIRT"
difficulty: "Advanced Engineering"
key_metric: "24 hours from awareness"
read_time: "8 min read"
duration: "14:15"
audio_url: "https://oxot.ai/audio/cra_podcast/EP_6.01.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["Cyber Resilience Act", "Regulation (EU) 2024/2847", "Article 14", "ENISA single reporting platform", "actively exploited vulnerability", "coordinating CSIRT", "PSIRT", "early warning notification", "24-hour reporting"]
takeaways: ["The 24h / 72h / 14-day reporting clocks and what each stage actually owes", "How to submit the early warning through the ENISA single reporting platform to the coordinating CSIRT", "A triage gate that starts the clock on confirmed exploitation, not scanner noise or a proof-of-concept"]
---

# The 24-Hour Early Warning: A Step-by-Step Playbook for the ENISA Notification

*By Jim McKenney — Digital Product Security Consultant & Industrial OT Architect*

Two words decide whether a 24-hour clock is running against your company: *actively exploited*. Not "exploitable," not "flagged by a scanner," not "a proof-of-concept dropped on a researcher's blog." The Cyber Resilience Act attaches its fastest reporting duty to one specific, evidence-backed event, and a workflow that cannot tell that event apart from ordinary vulnerability noise will fail in one of two expensive ways. It will either miss the deadline, or fire a national-level alarm over a finding that never warranted one.

This playbook walks the first 24 hours in order, from the moment of confirmation to the moment of submission. It is the opening stage of a longer reporting sequence, and the stage where most teams either build a defensible reflex or discover, mid-incident, that they never had one.

<!-- IMAGE-SLOT: hero | 1200x630 | alt: "A calm industrial security operations room at the moment a live exploit is confirmed, a wall clock reading the start of a countdown, analysts working methodically rather than in panic" | caption: "The 24-hour clock rewards a procedure, not adrenaline. Confirmation starts it; a rehearsed workflow beats it." -->

## The starting gun is a definition, not a feeling

The Regulation defines an actively exploited vulnerability as one "for which there is reliable evidence that a malicious actor has exploited it in a system without permission of the system owner" (Article 3(42)). Read that against its quieter neighbour in the same definitions list: an *exploitable* vulnerability is merely one that has the potential to be used by an adversary under practical conditions. Potential is not the trigger. Reliable evidence of real-world use is.

That distinction is the entire false-alarm defence. A CVSS 9.8 in a dependency is not, by itself, an actively exploited vulnerability. A public exploit script is not one either. What crosses the line is evidence — telemetry, an incident on a customer system, a credible report you can corroborate — that someone has actually used the flaw against a live system without permission. The 24-hour duty covers your product; the same fast clock also applies when a severe incident hits the security of your product, a parallel trigger in the same article. Both start on evidence, not anxiety.

The clock starts when your organisation *becomes aware* of that evidence, not when it finishes analysing it. "Aware" is generous to the regulator and unforgiving to you: it does not wait for a root cause, a patch, or a comfortable level of certainty. From 11 September 2026, when the reporting obligations take effect, the practical question your PSIRT has to answer fast is narrow. Do we have reliable evidence of exploitation, yes or no? Everything downstream hangs on nailing that one determination and recording exactly when you made it.

## The clock has three stages; this post owns the first

The 24-hour early warning is not the whole obligation. It is the first of three notifications that step down from "sound the alarm" to "here is the full account." Knowing the shape of all three keeps the first one honest: you report little at hour 24 precisely because two later stages exist to carry the detail.

| Stage | Deadline | What it delivers | Covered in |
|---|---|---|---|
| **Early warning** | within **24 hours** | A flare: that an actively exploited vulnerability exists, and where you know the product was made available | **This post** |
| **Fuller notification** | within **72 hours** | General information on the product, the nature of the exploit, and any mitigations taken or available | [EP 6.04](/blog/ep-6.04-the-72-hour-full-notification-what-forensic-eviden) |
| **Final report** | no later than **14 days after a fix is available** | Description, severity and impact, malicious-actor detail, and the remediation shipped | [EP 6.06](/blog/ep-6.06-the-14-day-final-closeout-root-cause-analysis-tech) |

The early warning is a flare, not a forensic report. At hour 24 you are not expected to know root cause, patch status, or the full blast radius. You are expected to tell the authorities that a real exploitation is happening and, where you can, which Member States' markets carry the affected product. That modest payload is deliberate. The regulator would rather hear "this is real and it is live" quickly than wait three days for you to write a polished account of something already burning.

## The triage gate: what starts the clock, and what does not

Before hour 24 becomes a countdown, one decision has to be made cleanly and logged: is this actually an actively exploited vulnerability? Build that decision as a gate with a small, fixed set of questions, so a tired analyst at 2 a.m. runs the same test a senior lead would.

<!-- IMAGE-SLOT: trigger-gate | 1200x800 | alt: "A flat infographic funnel separating routine vulnerability noise — scanner findings, proof-of-concept code, exploitable-but-unobserved flaws — from the single confirmed signal of real-world exploitation that passes through a gate and starts a clock" | caption: "Most findings are noise for reporting purposes. Only reliable evidence of real-world exploitation passes the gate and starts the 24-hour clock." -->

- **Is there evidence of use, not just capability?** Logs, forensic artefacts, a corroborated customer report of compromise. A scanner result, a CVE score, or a lab-only PoC does not clear this bar on its own.
- **Was it used without the system owner's permission?** A sanctioned pen test or a red-team exercise is exploitation with permission, and sits outside the definition.
- **Is the affected product one you placed on the EU market?** The duty runs to your product with digital elements, not to a third-party system that happens to run alongside it.
- **When did we first hold this evidence?** Timestamp it. This is your "became aware" moment, and it is the fact an auditor will ask about first.

Clearing two of these does not start the clock. Clearing all four does. Writing the gate down converts a judgement call into a repeatable test, which is what keeps you from either under-reporting a live incident or crying wolf to a national CSIRT over a backlog ticket. That gate, and the roles that operate it, is the PSIRT muscle covered in [EP 6.02](/blog/ep-6.02-building-an-annex-i-compliant-psirt-roles-playbook).

## The first 24 hours, in order

Once the gate clears, the countdown is an operational routine. Treat these as parallel workstreams under one incident commander, not a slow relay.

1. **Hour 0: declare and timestamp.** The moment the gate clears, open the incident formally and record the "became aware" time. That timestamp anchors all three deadlines; a fuzzy start time is a self-inflicted compliance wound.
2. **Hours 0–2: assign and scope roughly.** Name the incident commander, the technical lead, and the person who will file. In parallel, start the only scoping question hour 24 actually needs: on which Member States' markets was the affected product made available? You are drawing a coarse map, not a precise one.
3. **Hours 2–8: corroborate without over-investigating.** Confirm the evidence is solid enough to stand behind, and capture what mitigations, if any, already exist. Resist the pull to solve the vulnerability now. Deep forensics belong to the 72-hour and 14-day stages, and burning your 24-hour budget on root cause is how teams miss the flare.
4. **Hours 8–20: draft the early warning.** Keep it to what the stage requires: an actively exploited vulnerability exists in a named product, and the Member States where you know it was made available. Have legal and comms review the wording of a live-incident disclosure in parallel, not in series.
5. **Hours 20–24: submit, with margin.** File before the wire, not on it. Preserve the confirmation and the submission timestamp with the incident record.

The single most common self-inflicted failure here is treating the 24 hours as investigation time. It is not. It is confirmation-and-notification time. The investigation has its own, longer clocks.

## Where the notification goes, and how

You do not email a regulator or hunt for the right national inbox. The Regulation routes everything through one channel: a single reporting platform operated by ENISA (Article 16), where each Member State's CSIRT and ENISA maintain their own electronic notification end-points. You submit once, to the CSIRT designated as coordinator, and the notification is simultaneously accessible to ENISA. The early warning itself is the notification defined in Article 14(2), point (a).

Which coordinating CSIRT? The one for the Member State of your main establishment — where your decisions about your products' cybersecurity are predominantly taken. Determine that answer now, in advance, and store the account and end-point details in the incident runbook. Discovering your main establishment and provisioning platform access at hour 20 is a failure you can retire today with an afternoon of preparation.

One duty runs on its own track alongside the regulator notification: informing the affected users of your product, where appropriate in a machine-readable format. That is a separate obligation from the CSIRT filing, and it is the subject of [EP 6.05](/blog/ep-6.05-customer-security-advisories-drafting-bulletins-wi) — do not let the ENISA submission become the reason your customers hear about it last. And where the vulnerability is already inside a coordinated disclosure process, the dissemination of your notification can be handled differently by the receiving CSIRT; that interaction is worked through in [EP 6.03](/blog/ep-6.03-coordinated-vulnerability-disclosure-cvd-handling-).

Rehearse this. Run a tabletop where a synthetic "reliable evidence" signal arrives at an inconvenient hour, and time your team from gate to submission. The first rehearsal will overshoot 24 hours. The third will not, and that gap is exactly the risk this playbook exists to close.

The clock has already been chosen for you; the only thing left to decide is whether it finds a workflow waiting or a scramble.
