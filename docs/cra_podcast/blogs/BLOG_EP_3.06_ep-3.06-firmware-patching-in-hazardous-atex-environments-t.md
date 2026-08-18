---
id: "EP_3.06"
canonical_code: "EP_3.06"
title: "Safety vs. Security: Patching Certified Equipment in Hazardous (ATEX) Areas"
subtitle: "An emergency CRA security update lands for an explosion-proof transmitter in Zone 0. Applying it could breach the ATEX certificate that keeps the area safe. Two legal duties, one device — here is how to resolve it without picking a rule to break."
slug: "ep-3.06-firmware-patching-in-hazardous-atex-environments-t"
series_id: 3
episode_number: 6
series: "Brownfield OT, Spare Parts & Maintenance"
target_persona: "Oil & Gas Engineers, Offshore Platform Operators, Hazardous Area Specialists."
persona_category: "Plant CISOs & Asset Owners"
statutes: ["Annex I Part II", "Article 13(2)", "Article 13(3)", "Article 13(8)", "Recital 39"]
statutory_domain: "Brownfield & Legacy OT"
difficulty: "Dual-Compliance Triage"
key_metric: "Support-period vulnerability-handling duty"
read_time: "8 min read"
duration: "14:15"
audio_url: "https://oxot.ai/audio/cra_podcast/EP_3.06.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["Cyber Resilience Act", "Regulation (EU) 2024/2847", "Annex I Part II", "ATEX 2014/34/EU", "hazardous area firmware patching", "functional safety", "security updates", "Industrial OT Security"]
takeaways: ["Dual-compliance validation protocols", "Staged patching workflows", "Emergency risk assessments"]
---

# Safety vs. Security: Patching Certified Equipment in Hazardous (ATEX) Areas
*By Jim McKenney — Digital Product Security Consultant & Industrial OT Architect*

It is 03:00 on a night shift. A vendor advisory hits your inbox: an actively exploited flaw in the communications stack of a pressure transmitter you run in a Zone 0 process line. The manufacturer has a signed firmware image ready. The Cyber Resilience Act says vulnerabilities like this must be handled without delay. And the transmitter carries an ATEX certificate that, read literally, forbids you from altering the device from its certified state.

Two obligations, one instrument, and they point in opposite directions. In a refinery, an unverified firmware patch doesn't just crash a server — it can endanger a process. So the honest question isn't "should I patch?" It's "how do I discharge a security duty without invalidating the safety basis that keeps the atmosphere from igniting?"

<!-- IMAGE-SLOT: ep-3.06-hero | 1200x630 | alt: "An explosion-proof pressure transmitter on a refinery process line at night, an engineer reviewing a change record on a laptop nearby." | caption: "The decision gets made at the process line, where a firmware choice is also a safety choice." -->

## The two duties that collide

The Cyber Resilience Act (Regulation (EU) 2024/2847) puts a continuing obligation on the manufacturer of any product with digital elements: identify vulnerabilities, remediate them without delay, and distribute security updates securely for the whole support period. For industrial gear that period is long — the CRA sets a floor of five years and expects manufacturers to stretch it to match how long the product is actually in service, which for a process transmitter means well over a decade. That is the pressure pushing the patch toward your field device.

Pulling the other way is the certificate. Certified explosion-protection equipment is placed on the market against a specific approved configuration, and the conditions attached to that approval constrain what you may change in the field. That constraint is real, and it is not CRA — it lives in separate legislation and standards owned by a different authority (see the boxed note below). The collision is genuine: one regime says *update it*, the other says *don't alter it*.

The wrong resolutions are the two obvious ones. "Patch immediately, everywhere, tonight" treats a Zone 0 transmitter like a web server and can strip the very approval that makes the installation lawful. "Freeze it, never touch certified firmware" leaves a known, exploited hole open in a safety-critical asset for years. Both are defensible-sounding and both are wrong. The resolution lives between them, and — this is the part most teams miss — **the CRA itself tells you to look there.**

## What the CRA actually requires (and what it doesn't)

Read the vulnerability-handling duties in Annex I Part II closely and a myth falls apart. The text says manufacturers must "address and remediate vulnerabilities without delay, including by providing security updates," and — the operative phrase for hazardous areas — "where technically feasible, new security updates shall be provided separately from functionality updates." Nowhere does the CRA say *the operator must flash every image the moment it is signed, unvalidated, into a live installation*. It requires that a fix exist, that it be distributed securely, and that it not sit indefinitely.

More importantly, the CRA's own risk-assessment duty pulls safety *into* the security decision rather than setting it aside. Article 13(2) requires the manufacturer's cybersecurity risk assessment to account for "the health and safety of users," and Article 13(3) requires it to reflect the product's actual "conditions of use, such as the operational environment or the assets to be protected." A transmitter destined for Zone 0 has its hazardous-area context baked into the assessment the manufacturer was already obliged to perform. A security update whose validation ignores that context isn't more CRA-compliant — it's a risk assessment done badly.

So the two duties pull against each other in the field, but they don't contradict in law. "Without delay" is not "without validation." The obligation is to have a fix and to deploy it through a controlled process that itself weighs the operational environment — which, in a hazardous area, is the whole point.

> [!NOTE]
> **Sidebar — the ATEX duty is separate law, not CRA. Confirm the specifics with your Notified Body.**
> The constraint on altering certified explosion-protection equipment comes from the **ATEX Directive 2014/34/EU** and the **IEC/EN 60079** series, not from the Cyber Resilience Act. These are outside the CRA statutory corpus and are summarised here from general engineering practice — treat them as items to verify, not as CRA-verified facts.
> - Explosion protection concepts such as flameproof enclosure (Ex d) and intrinsic safety (Ex i) are largely properties of the *hardware* — enclosure gaps, energy-limiting components — and a comms-stack firmware change often does not touch them.
> - The picture changes when firmware governs a **safety function, energy limiting, or timing** (for example a device with a functional-safety / SIL rating under IEC 61508/61511). There, a change can affect the basis of certification.
> - The EU-type examination certificate and the manufacturer's instructions define which field changes are permitted and which void the approval. **That document, and your Notified Body, are the authority — not this article.**
>
> The CRA argument in this post stands on its own: even setting ATEX entirely aside, the CRA requires a *risk-informed, validated* deployment, not a blind field flash.

## The resolution: staged validation and a documented emergency risk assessment

Treat every hazardous-area security update as a triage, not a reflex. The workflow below is what lets you honour the remediation duty and preserve the safety basis at the same time.

<!-- IMAGE-SLOT: ep-3.06-staged-validation | 1200x675 | alt: "A staged pipeline from a security advisory through an offline identical test rig and a hazardous-area review gate to controlled field deployment, with the security fix drawn as isolated from a functionality update." | caption: "Staged validation: the fix is isolated, proven on a bench twin, cleared against the certificate, then deployed." -->

**1. Isolate the fix from the feature.** Push back on any vendor image that bundles the security patch with new functionality. Annex I Part II expressly asks manufacturers to ship security updates separately from functionality updates where feasible — because a minimal, isolated change is the only kind you can realistically validate against a certificate. A bundled release turns a security decision into a re-qualification project.

**2. Classify the change before you touch the asset.** Ask the manufacturer, in writing, what the update actually modifies. Does it touch any component the certificate relies on — the safety function, energy limits, timing? If it is confined to the communications stack and leaves the protected function untouched, that is a different risk profile from a change to firmware that governs the device's safe operation. This classification is the hinge; get it in the technical file.

**3. Prove it on a bench twin, never on the live line.** Validate on an identical, de-energised unit off the process — a spare of the same certified model. Confirm the device still behaves to specification after flashing, that the update mechanism itself is secure, and that nothing in the safety-relevant behaviour has drifted. This is the "staged" in staged patching: the field installation is the *last* place the image runs, not the first.

**4. Write the emergency risk assessment down.** For an actively exploited flaw you are balancing a live cyber risk against a change-control risk, under time pressure. Document that trade-off: the vulnerability, its exploitability in your specific architecture, the compensating controls holding the line in the meantime (segmentation, monitoring, restricted access at the cell), and the validation evidence. A dated, reasoned assessment is what turns "we waited three weeks to patch" from negligence into engineering judgement.

**5. Deploy through change control, then close the loop.** Field the validated image under your normal hazardous-area change process, with the Notified Body sign-off your certificate requires, using intrinsically safe programming tooling. Record the new firmware state against the asset. The support-period duty in Article 13(8) doesn't end at deployment — it expects vulnerabilities to keep being handled across the asset's service life, so the record has to be current.

## Who owns which half

Keep the actors straight, because the duties don't sit on one desk. The **manufacturer** owns the CRA vulnerability-handling machinery: producing the fix, keeping it available across the support period, and — under Recital 39 — recognising that a pure security update which only lowers cyber risk and doesn't change the product's intended purpose is *not* a substantial modification. That carve-out matters: patching to close a hole does not, by itself, re-trigger CRA conformity assessment. The **operator** owns the field reality: the staged validation, the change control, and the hazardous-area sign-off that keeps the installation lawful. Neither can discharge the other's duty, and a contract that pretends otherwise won't survive an incident review.

If you do one thing this week, request the "what does it modify" classification for every certified firmware update already sitting in your queue. That single document — vendor-signed, filed against the asset — is what lets you move fast on the fixes that are safe to fast-track, and take the time the dangerous ones deserve. Working through your own Zone 0 asset register against this workflow? [Book a hazardous-area patching walkthrough](/demo) and bring the certificates.
