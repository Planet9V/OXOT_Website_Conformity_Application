---
id: "TC_11"
canonical_code: "TC_11"
title: "When Machinery Safety Meets CRA Remote Control: The Autonomous Field Robot Problem"
subtitle: "A spoofed steering command reaches a three-tonne autonomous harvester and it turns toward a field hand. Is that a machinery-safety failure or a product-cybersecurity failure? It is both, and the two regimes do not overlap by accident. The Machinery Regulation owns the safety function; the CRA owns the security posture. This is where the line actually falls, and the one place they land on the same wire."
slug: "tc-11-autonomous-agriculture-field-robots-machinery-reg"
series_id: 10
episode_number: 11
series: "CRA: Truth & Consequences (Investigative)"
target_persona: "Agri-robotics engineers, machinery-safety leads, product compliance."
persona_category: "Investigative"
statutes: ["Annex I Part I", "Machinery Regulation (EU) 2023/1230"]
statutory_domain: "CRA / Machinery Regulation Boundary & the Remote-Control Channel"
difficulty: "Advanced"
key_metric: "2 regimes, 1 control channel"
read_time: "8 min read"
duration: "13:40"
audio_url: "https://oxot.ai/audio/cra_podcast/TC_11.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["Cyber Resilience Act", "Regulation (EU) 2024/2847", "Machinery Regulation", "Regulation (EU) 2023/1230", "autonomous agricultural robot", "field robot cybersecurity", "remote control channel security", "CRA Annex I", "machinery safety function", "safety-related control system", "telematics gateway security", "CAN bus authentication", "agricultural robotics compliance", "product with digital elements", "safety cybersecurity boundary"]
takeaways: ["The Machinery Regulation and the CRA both bind a networked autonomous field robot, and they divide by concern, not by component: the Machinery Regulation owns whether a control-channel failure can produce a hazardous movement, the CRA owns whether the product is securely designed, patched, and disclosed over its support life.", "The Machinery Regulation is not CRA law, but it is not silent on cyber either: its essential health and safety requirements demand that safety functions resist corruption and malicious interference, so a spoofed command that moves the machine is a safety-function failure under that regime independently of the CRA.", "The two regimes overlap in exactly one place: the secure remote-control channel. CRA Annex I Part I requires protection from unauthorised access and integrity of commands against manipulation; the Machinery Regulation requires the safety function to survive interference. Authenticated control satisfies both concerns from one engineering effort.", "One threat analysis of the control channel and one set of test evidence can feed both conformity files, but the conclusions are drawn separately, and the CRA duties with no machinery equivalent — vulnerability handling, security updates, coordinated disclosure — do not transfer."]
---

# When Machinery Safety Meets CRA Remote Control: The Autonomous Field Robot Problem

*By Jim McKenney — Digital Product Security Consultant & Industrial OT Architect*

A cellular command reaches a three-tonne autonomous harvester mid-row and tells it to turn hard left. The command is well-formed, it arrives on the channel the machine trusts, and the machine obeys. The only problem is that the operator never sent it. Someone replayed a captured steering frame, and now a piece of heavy field equipment is swinging toward a person on the headland.

Ask two compliance teams what just failed and you will get two different answers. The machinery-safety lead says a safety function let a hazardous movement happen. The product-security lead says an unauthorised command was accepted on an unauthenticated channel. Both are right, and that is the entire difficulty. A networked autonomous field robot is governed by the Machinery Regulation and by the Cyber Resilience Act at the same moment, and the reflex to argue about which regime "really" owns the incident wastes the quarter. They both own it. They divide by concern.

<!-- IMAGE-SLOT: tc-11-hero | 1200x630 | alt: "A large autonomous field robot in a crop row with a spoofed cellular steering command reaching it, annotated to show two regulators reaching for the same machine: the Machinery Regulation labelled 'safety function' and the CRA labelled 'security posture'" | caption: "One spoofed command, two regulators. The Machinery Regulation asks whether the movement was hazardous; the CRA asks whether the product was secure. Same wire, different question." -->

## The division runs by concern, not by component

The instinct is to split the machine into parts and assign each part a regulator: give the hydraulics and the blades to machinery safety, give the modem and the software to cybersecurity. That split is wrong, because both regimes reach into the same electronics. The useful cut is by the question each law is asking.

The Machinery Regulation asks whether a failure can hurt someone. Its concern is the outcome at the end of the actuator: does a corrupted, delayed, or forged command translate into an uncommanded movement of a heavy machine near a human. The CRA asks whether the product is secure as a product: was the control channel designed so that a forged command is rejected in the first place, and is the vendor equipped to find, fix, and disclose the weakness that let the frame be replayed. One law watches the hazardous motion. The other watches the security of the thing that could cause it. Confuse which law is asking which question and you engineer for the wrong obligation.

## What the Machinery Regulation owns: the safety function

The safety case for the harvester belongs to the Machinery Regulation, and precision matters here: this regime is not silent on cyber. It has moved past the assumption that a machine's threats are all mechanical.

> [!NOTE]
> **Non-CRA regime.** The Machinery Regulation (EU) 2023/1230 replaces the old Machinery Directive and applies from January 2027. It is product-safety law, not cybersecurity law, and it is outside the CRA statutory corpus this series cites. Its essential health and safety requirements now address digital threats directly: safety-related control systems must be designed so they resist corruption, and so that a remote connection to the machinery cannot generate a hazardous situation. The specific clause numbering is descriptive here; the point that matters is the duty, not the pinpoint.

Read against the spoofed-command scenario, the machinery duty is concrete. The safety function that stops or steers the harvester must not be defeatable by a manipulated command. If a replayed steering frame can produce a hazardous movement, the safety-related control system has failed on the Machinery Regulation's own terms, before the CRA is even consulted. That failure would exist even if the product carried no other digital elements at all, because the regime cares about the movement, not about the network. This is why "our telematics is just a convenience feature" is not a defence: the moment a network path can influence a safety function, that path is inside the safety case.

## What the CRA owns: the product's security posture over its life

The CRA reaches for the same machine and asks a different question, and its answer runs the length of the product's support life rather than stopping at the moment of the hazardous movement.

The robot is a product with digital elements. Its remote-control channel, its telematics gateway, and its autonomy software are the digital elements, and the CRA's essential requirements in Annex I Part I attach to them directly. Of those, two do most of the work here. The product must ensure protection from unauthorised access by appropriate control mechanisms, including authentication. And it must protect the integrity of transmitted commands, programs, and configuration against manipulation not authorised by the user. A control channel that accepts a replayed steering frame fails both, and it fails them as a matter of the product's cybersecurity design, assessed on the manufacturer's risk assessment under Article 13(2).

But the CRA's grip does not release after the design review. Its distinctive contribution is the part the Machinery Regulation does not cover: vulnerability handling across the support period under Annex I Part II, security updates that reach a machine sitting in a barn for a decade, a coordinated-disclosure route for the researcher who finds the replay weakness, and the reporting duties that fire when the vulnerability is actively exploited. None of that is a safety-function question. It is a product-security-lifecycle question, and it is the CRA's alone.

<!-- IMAGE-SLOT: tc-11-division | 1200x760 | alt: "A two-column diagram of one autonomous field robot. Left column labelled Machinery Regulation lists: hazardous movement, safety-related control system, resistance to corruption. Right column labelled CRA lists: secure-by-design control channel, authentication, integrity of commands, vulnerability handling, security updates, coordinated disclosure. A single shaded band bridging both columns is labelled 'the remote-control channel'." | caption: "Concern, not component. The Machinery Regulation owns the safety function; the CRA owns the security posture over the support life. They meet on one shaded band: the remote-control channel." -->

## Where they overlap: the secure remote-control channel

Everything above keeps the regimes apart. There is exactly one place where they land on the same wire, and it is the control channel itself.

The Machinery Regulation needs the safety function to survive malicious interference. The CRA needs the command path to reject unauthorised and manipulated messages. Those are two descriptions of the same engineering control: cryptographically authenticated commands, replay protection, and integrity checking on the link between the operator and the actuators, so that a forged or replayed steering frame is discarded before it reaches the drive-by-wire system. Build that control once and you have answered a machinery-safety concern and a product-cybersecurity concern in a single stroke. The mistake is to build it twice, once for each audit, and then spend the rest of the programme keeping the two descriptions of the same authentication scheme from contradicting each other.

## One evidence set, two conformity conclusions

Because the overlap is real, the evidence reuses, and this is where a networked machine repays deliberate engineering rather than parallel paperwork. The threat analysis of the control channel, the message-authentication design, and the test evidence showing that spoofed and replayed commands are rejected is a single body of work. It feeds the Machinery Regulation's safety-function assessment and the CRA's essential-requirements technical file from the same source.

What does not reuse is the conclusion. The machinery assessor reads that evidence to answer "can this channel produce a hazardous movement," and signs a safety judgement. The CRA technical file reads the same evidence to answer "is this an adequate cybersecurity control," and supports a different declaration. The forensic facts are shared; the two conformity conclusions are drawn and owned separately. That pattern of one evidence base feeding regimes that keep their own borders is the same discipline a palletising robot needs when it sits under three laws at once, worked through for the CRA, NIS2, and the AI Act in [EP 8.04](/blog/ep-8.04-cra-nis2-ai-act-unified-evidence-tri-directive); the two-regime version here is the simplest case of it.

There is a second trap that catches builders of these machines specifically. A base tractor is one manufacturer's product; the autonomy kit, the telematics unit, and the control software bolted onto it may make the integrator the manufacturer of a new product with digital elements, and with that the party that owes the CRA duties on the combined machine. Whoever integrates the remote-control capability tends to inherit the obligation to secure it. That deeming question, and when adding digital elements makes you the manufacturer, is the subject of [EP 2.01](/blog/ep-2.01-the-accidental-manufacturer-how-system-integrators). If you are the one wiring the modem to the drive-by-wire, assume the channel's security is yours to defend, under both regimes, until you have confirmed otherwise. You can model the combined machine against the CRA requirements in the [conformity workspace](/demo), and the essential-requirements half is grounded in [the statute](/wiki/cra).

The cleanest way to hold all of this is to stop treating physical safety and product cybersecurity as neighbouring departments and start treating them as two readings of one machine. The harvester does not know which auditor owns the modem. It knows only that a command arrived and the blades moved. Whether that command was authentic is a cybersecurity property; whether the movement it caused was safe is a safety property; and on a machine that takes commands over a network, you cannot honestly certify the second without having engineered the first.
