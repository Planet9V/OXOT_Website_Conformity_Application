---
id: "EP_6.05"
canonical_code: "EP_6.05"
title: "Writing a Customer Security Advisory That Informs Without Arming"
subtitle: "The CRA tells you which facts a security advisory must carry. It never tells you how to word them. That sentence-level judgement is the difference between getting operators patched and handing attackers a map."
slug: "ep-6.05-customer-security-advisories-drafting-bulletins-wi"
series_id: 6
episode_number: 5
series: "Vulnerability Operations, PSIRT & 24h Clocks"
target_persona: "Customer Success Leads, Technical Writers, Product Security Directors."
persona_category: "Product Security & Customer Success"
statutes: ["Annex I Part II", "Article 13(6)", "Article 13(17)"]
statutory_domain: "Vulnerability Handling & Disclosure"
difficulty: "Advanced Engineering"
key_metric: "Annex I Part II(4) + (8)"
read_time: "7 min read"
duration: "14:15"
audio_url: "https://oxot.ai/audio/cra_podcast/EP_6.05.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["Cyber Resilience Act", "Regulation (EU) 2024/2847", "customer security advisory", "Annex I Part II", "CSAF", "VEX", "vulnerability disclosure", "security bulletin", "Industrial OT Security", "PSIRT"]
takeaways: ["The CRA (Annex I Part II) fixes which facts an advisory must carry — affected product, impact, severity, remediation — but never the wording; informing without arming is craft, not statute", "Split every candidate line by who it accelerates: keep operator-accelerators (effect, versions, fix, mitigations), withhold attacker-accelerators (the trigger, the vulnerable parameter, working exploit detail)", "CSAF and VEX are machine-readable formats for scale, not CRA law — and a structured advisory can over-arm exactly as fast as a paragraph"]
---

# Writing a Customer Security Advisory That Informs Without Arming
*By Jim McKenney — Digital Product Security Consultant & Industrial OT Architect*

Here is the same vulnerability, written up twice. One version gets your customers patched. The other gets them attacked.

> **A.** "A heap overflow in the CoAP option parser triggers when the Uri-Path length field exceeds 0x400 bytes, letting an unauthenticated attacker overwrite the return address and execute code as root over UDP 5683."
>
> **B.** "An unauthenticated attacker on the device network can run arbitrary code on the controller's management interface. Restrict that interface to trusted hosts now, and apply firmware 4.8.2 to close the flaw."

Both are accurate. Sentence B tells an operator everything they need to act this afternoon and tells an attacker almost nothing they can build a working exploit from. Sentence A is a head start for whoever reads it fastest, and the people who read security advisories fastest are not always your customers.

That gap is the whole job of a customer security advisory, and the CRA does not close it for you.

<!-- IMAGE-SLOT: ep-6.05-hero | 1200x630 | alt: "A product-security writer at a dual-monitor workstation drafting a security advisory, one screen showing the operator-facing bulletin and the other showing a redacted internal root-cause note" | caption: "The same finding, two documents. The advisory carries what an operator can act on; the mechanism stays in the technical file." -->

## What the CRA actually makes you publish

The regulation is specific about the facts and silent about the phrasing. Once a security update is available, Annex I Part II(4) requires you to share and publicly disclose information about the fixed vulnerability: a description of it, information letting users identify the affected product, the impact, its severity, and clear, accessible information helping users remediate. Clause (8) of the same Part goes further on delivery, requiring that updates be disseminated accompanied by advisory messages that give users the relevant information, including the action to take.

Read that as a required field list, not a script. Affected product, impact, severity, remediation, action. The statute names the columns. It does not write the sentence that fills them, and nothing in the CRA tells you whether to ship sentence A or sentence B above. That choice is craft, and it is the part that decides whether the advisory protects the installed base or exposes it.

## Every advisory has two readers with opposite goals

An operator reads your bulletin to answer three questions: *Am I affected? How bad is it? What do I do right now?* An attacker reads the same bulletin to answer one: *Can I build a working exploit from this before the fleet patches?*

You cannot satisfy the first reader by withholding facts, and you cannot starve the second by staying vague, because vagueness leaves operators unable to act. The way through is not less information. It is sorting information by who it accelerates.

Take every candidate line and ask a single question: does this help a defender act faster, or an attacker move faster? Facts that help the operator scope, decide, and remediate go in. Facts whose main effect is to shorten an attacker's path from advisory to exploit stay out of the customer document, even when they are true and even when they feel like completeness.

<!-- IMAGE-SLOT: ep-6.05-two-readers | 1200x675 | alt: "A single advisory document splitting into two reader paths: an operator extracting affected version, impact, and fix to act, and an attacker extracting root cause and trigger to weaponise, with a dividing line marking what to withhold" | caption: "One document, two extractions. The draft succeeds when the operator's path is complete and the attacker's path stays broken." -->

## The field-by-field cut

Here is how the required content maps onto that split. The left column is the operator's survival kit; the right column is what belongs in your internal technical file, not the bulletin.

| Advisory field | Give the operator (accelerates defense) | Keep out of the bulletin (only accelerates attack) |
|---|---|---|
| Affected products | Exact models, firmware and version ranges, and the configuration conditions that make a unit vulnerable | Nothing to withhold — precision here only helps the defender scope exposure |
| Impact & severity | What an attacker achieves (e.g. unauthenticated code execution on the management interface) and a severity score | The exploitation primitive that produces it: the overflow, the type confusion, the injection point |
| Root cause | The class, at most (improper input validation, missing authentication) | The vulnerable function, parameter, offset, or malformed-input recipe |
| Remediation | Fixed version, how to obtain it, how to confirm it is applied | Nothing — this is the entire reason to publish |
| Interim mitigation | Compensating controls the operator can deploy before patching, described by function | A control worded so narrowly it names the exact exploited vector when a broader one protects them just as well |
| Detection | Log signatures and indicators that reveal exploitation after it happens | The input that produces those signatures |

Two rows carry most of the judgement.

**Interim mitigation is the sharpest edge**, because a mitigation sometimes points straight at the vector. "Block UDP 5683" tells an operator what to do and tells an attacker which service to hit. When a broader control works, prefer it: "restrict the device management interface to trusted management hosts" protects the operator without naming the exploited port. Give up specificity only when specificity is the only thing that actually protects them.

**Detection guidance describes the aftermath, not the cause.** A log signature that reveals exploitation is defensive gold and safe to publish. The malformed input that triggers that signature is the exploit. Publish the fingerprint, not the weapon that leaves it.

The mistake most teams actually commit runs the other way. Nervous about arming anyone, they blur the affected-products row: vague model families, no firmware range, "certain configurations may be impacted." That reflex protects no one. An attacker fingerprints your product and its version remotely in minutes and never needed your bulletin to do it. The only reader you blinded is the operator, who now cannot tell whether the unit on their plant floor is in scope. Precision about *who is affected* is the safest thing in the whole document. Save the caution for *how the attack works*, where it belongs.

## CSAF and VEX change the channel, not the discipline

> [!NOTE]
> **Machine-readable formats are good practice, not CRA law.** CSAF (the Common Security Advisory Framework) is an OASIS JSON standard for advisories; VEX and OpenVEX express whether a product is affected, not affected, or fixed so an asset owner's tooling can auto-match your advisory against their inventory. The CRA requires a machine-readable SBOM in a commonly used format and requires you to disseminate the advisory, but it names no specific advisory schema. Publishing CSAF is a scaling decision. It lets a large operator learn in seconds whether they are affected instead of reading prose across a hundred product lines. It does not soften the inform-versus-arm choice. A structured document with an exact vulnerable version range and a linked reference is a targeting query if you filled the fields carelessly. The redaction runs the same whether you ship JSON or a paragraph.

## Who you send it to, and when, are separate levers

A public web page and a machine-readable feed reach everyone at once, customers and adversaries in the same instant. The channel is its own control. The CRA requires a single point of contact so users can reach you directly (Article 13(17)); run that pipe in reverse. Push the advisory to known operators through a direct channel alongside the public post so the people actually running your equipment get their head start rather than racing the open internet for it. And when your fix addresses a flaw in a third-party component you integrate, Article 13(6) puts you on the hook to report upstream to whoever maintains that component. The advisory is not aimed only at customers.

*When* you go public relative to patch availability is a different question, and the CRA gives you a lever to defer public disclosure until operators can patch. That decision has its own home in [coordinated disclosure](/blog/ep-6.03-coordinated-vulnerability-disclosure-cvd-handling-); this post is about what the document says, not when it ships. One more boundary worth holding: a customer advisory is not a regulator filing. The [24-hour early warning](/blog/ep-6.01-the-24-hour-early-warning-panic-operationalizing-t) and the [72-hour notification](/blog/ep-6.04-the-72-hour-full-notification-what-forensic-eviden) to the coordinating CSIRT run on their own clocks and their own content rules. Do not let one document try to be all three.

## The decision rule

Pin this above whoever drafts the bulletin.

Publish every fact that helps an operator act. Withhold every fact whose main effect is to help an attacker aim. When one sentence does both, keep the version that names the effect and delete the version that names the mechanism. If a line teaches a customer how to protect themselves, it belongs in the advisory. If it teaches anyone how to attack them, it belongs in your technical file, where the regulator can read it and the internet cannot.
