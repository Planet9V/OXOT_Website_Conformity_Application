---
id: "EP_5.03"
canonical_code: "EP_5.03"
title: "Patching the Grid: CRA Security Updates vs. Substation Stability"
subtitle: "A protective relay on a live 400kV line is not a laptop you reboot on a whim. So when the Cyber Resilience Act meets a critical security update, who is actually obligated to do what, and when?"
slug: "ep-5.03-power-grids-renewable-substation-automation-iec-61"
series_id: 5
episode_number: 3
series: "Critical Sector Deep Dives"
target_persona: "Transmission & Distribution Grid Engineers, Solar/Wind Farm Operators, Substation Automation Leads."
persona_category: "EPC & Integrators"
statutes: ["Annex I Part II", "Article 13", "Recital 39"]
statutory_domain: "Critical Sector: Energy & Grid"
difficulty: "Advanced Engineering"
key_metric: "Manufacturer availability vs operator timing"
read_time: "9 min read"
duration: "14:15"
audio_url: "https://oxot.ai/audio/cra_podcast/EP_5.03.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["Cyber Resilience Act", "Regulation (EU) 2024/2847", "protective relay security update", "substation automation", "DERMS", "Annex I Part II", "Article 13 support period", "NIS2 energy", "grid stability patching"]
takeaways: ["The CRA obliges the manufacturer to make security updates available and handle vulnerabilities; it never orders an operator to flash a live 400kV relay to a deadline", "The Annex I essential requirements attach to relays and DERMS controllers as ordinary products with digital elements; classification as an 'important' or 'critical' product is the exception, not the default, and changes the audit route, not the security-update duty", "A pure security update that lowers cyber risk without changing the product's intended purpose is not a substantial modification, so accepting it does not re-open conformity assessment (Recital 39)"]
---

# Patching the Grid: CRA Security Updates vs. Substation Stability

*By Jim McKenney — Digital Product Security Consultant & Industrial OT Architect*

A protective relay on a 400kV line has one job it will not negotiate. When it sees a fault, it trips the breaker in under a hundred milliseconds. Reboot it at the wrong moment and you either drop a line that was moving a gigawatt or, worse, you leave a real fault uncleared while the relay finishes booting. Now the vendor issues a security update and marks it critical. The Cyber Resilience Act is in the room. Two obligations written by different people, for different reasons, are suddenly pointing at the same steel cabinet.

This is the scenario grid engineers keep raising, and it is usually framed as a trap: the law says patch, physics says do not reboot, pick your liability. That framing is wrong, and it is wrong in a way that matters, because it sends operators into panic-patching that a substation cannot survive. The two duties do not collide. They sit on opposite sides of a boundary the regulation draws on purpose.

<!-- IMAGE-SLOT: ep-5.03-hero | 1200x630 | alt: "An engineer at a substation HMI beside a rack of protective-relay IEDs, a 400kV gantry visible through the window, a laptop showing a pending firmware update." | caption: "The relay clears faults in under 100 ms. The pending update on the laptop is real. Neither fact makes the other one urgent in the way it first appears." -->

## The update duty binds the manufacturer, not the substation

Start with what the CRA actually commands, and to whom. The vulnerability-handling requirements in Annex I Part II are obligations on the manufacturer of the relay, the DERMS controller, the merging unit, whoever placed the product with digital elements on the EU market. The manufacturer must identify and remediate vulnerabilities without delay, provide a mechanism to distribute updates securely, and disseminate each available security update as soon as it is ready, with an advisory message telling users what it fixes. Where it is technically feasible, security updates have to be shippable separately from feature updates, so a fix does not smuggle in new behaviour.

Read the verbs. *Provide. Distribute. Disseminate. Make available.* None of them is *install on a live line by Friday.* The CRA's clock, on the product side, is the clock for getting a validated fix into the operator's hands. It does not reach into the substation and set the maintenance window. There is no article that tells a transmission operator to energise a firmware push onto an in-service 400kV relay against a statutory deadline. That decision stays where it has always been: with the people who own the consequence of a mis-timed reboot.

The regulation even anticipates that you will not apply everything the moment it lands. The Annex I product properties require that updates can be *notified* to users and *temporarily postponed*, and that security updates be deliverable separately from functionality changes. A relay that force-installs firmware the instant it arrives, with no operator control over timing, would be the non-conformant design here, not the substation that stages the rollout.

## Who owns which obligation

The confusion comes from collapsing two actors into one. Split them and the panic drains out.

| Question | Answer | Whose duty | Where it lives |
|---|---|---|---|
| Must a vulnerability be fixed and the update made available? | Yes, without delay | Relay / DERMS **manufacturer** | CRA: Annex I Part II, Article 13(8) |
| Must the update be tested against foreseeable operating conditions before release? | Yes, across the support period | Relay / DERMS **manufacturer** | CRA: Article 13(2), 13(3) |
| Must the operator install it, and by when? | Deploy under its own risk management; timing is the operator's | Grid **operator** | Sector / NIS2, not the CRA |
| Does accepting the security update re-open CE marking? | No, if it only lowers cyber risk | Neither | CRA: Recital 39 |

The manufacturer's own risk assessment is the reason this holds together. Article 13(2) requires that assessment to run through the design, production and *maintenance* phases, and Article 13(3) requires it to account for the product's intended purpose and its actual conditions of use: the operational environment, the assets being protected. A relay vendor whose risk assessment ignores that its product lives on an energised line it cannot casually reboot has not done the assessment the CRA asks for. The update the operator receives is supposed to arrive already shaped by the knowledge that it will be deployed into a substation, not a data-centre rack.

## Staging a patch is the compliant path, not the evasive one

So the operator receives a validated, separately-packaged security update with an advisory. What happens next is engineering, and none of it is prohibited by the regulation.

The workable sequence in a redundant substation looks like this:

1. **Ingest and assess.** Read the advisory. Score the vulnerability against your exposure. Is the affected interface even reachable in your architecture, or is the relay's management port already behind a segmented conduit?
2. **Pre-inject offline.** Apply the firmware to a bench unit or a digital twin of the bay first, and confirm the protection functions, trip characteristics and communication behaviour survive the update. This is where a security fix that quietly shifts timing gets caught before it ever sees copper.
3. **Deploy on the standby.** In a duplicated protection scheme, patch the redundant relay during a planned window with the primary carrying protection, then fail over and repeat. The line never loses protection.
4. **Document the timing decision.** Record why the window was chosen. That record is what turns a deferred patch from an apparent violation into a defensible risk decision.

<!-- IMAGE-SLOT: ep-5.03-staged-deploy | 1200x700 | png | alt: "Flow from vendor advisory to digital-twin pre-injection to patching the standby relay to failover, with the primary relay carrying protection throughout." | caption: "Staged deployment across a duplicated protection scheme: the line never loses a relay, and the timing decision is documented, not improvised." -->

Nothing in that sequence is a loophole. Deferring installation while you validate is not the same as leaving a product unpatched, and it is exactly the behaviour the postponement and separate-packaging provisions were written to permit. The manufacturer met its duty when it shipped the fix. The operator meets its duty by deploying under a documented process. The gap between *available* and *installed* is where the engineering lives, and the CRA leaves room for it deliberately.

## A security patch is not a substantial modification

There is a second fear tangled into this, and it drives operators to refuse patches entirely. If I accept a firmware change, have I created a new product that needs its own conformity assessment and CE mark?

No. Recital 39 is explicit. A security update designed to lower a product's cybersecurity risk, which does not change the product's intended purpose, is not a substantial modification. Applying a vendor's vulnerability fix to your relay does not turn you into the manufacturer and does not re-open the CE process. That only happens if an update changes what the product is *for* or broadens its attack surface with new features, meaning a feature update, not a security patch. Accepting the fix is the low-risk move on both the cyber axis and the compliance axis. Refusing it, and running a known-exploitable relay on a transmission line, is the exposure.

## What class is a relay, actually?

One correction, because the marketing around this sector overstates it. A protective relay, a merging unit, or a DERMS controller is a *product with digital elements*, and the full weight of the Annex I essential requirements applies to it. But that does not automatically make it a "critical class" product. The CRA's critical list is short and specific: hardware security modules, smart-meter gateways, smartcards and secure elements. Its "important" list covers things like network management systems and firewalls. Most substation IEDs land in neither and are self-assessed against Annex I like any default product. A smart-meter gateway is genuinely on the critical list; the general-purpose relay next to it usually is not.

Why does the distinction matter if the security-update duty is the same either way? Because it decides your *conformity route*: whether a notified body has to be in the loop, not whether you owe the vulnerability handling. Assuming "critical, therefore notified body, therefore panic" burns budget on an audit path the product may never have needed. Check the annex against the specific function of the box before you accept anyone's classification, including your vendor's.

> [!NOTE]
> **Quarantine: the operator's deploy-by duty is not CRA law.** The obligation on a grid operator to actually patch, and to manage the risk of not patching, sits in NIS2 (Directive (EU) 2022/2555, Article 21, cybersecurity risk-management measures for essential entities in the energy sector), together with national grid and sector codes. The CRA argument above stands on its own without it: the manufacturer's availability duty and the postponement provisions are CRA-internal. IEC 61850 and its security companion IEC 62351, and IEC 62443 for the surrounding architecture, are engineering standards, not statute. Reach for them to *implement* segmented management access and secure update transport, not to satisfy a legal citation.

The relay clears the fault in under a hundred milliseconds and asks nothing of the lawyers. The update is real, the vulnerability is real, and the vendor did its job by putting a tested, separately-packaged fix in your hands. Everything the CRA required has now happened — except the one thing it never asked you to do on a live line. So the question the regulation hands back to you is not *are you allowed to wait for a maintenance window.* You are. It is the older, harder one no statute will answer: on a line you cannot reboot, how long is too long to carry a vulnerability you already know how to close?
