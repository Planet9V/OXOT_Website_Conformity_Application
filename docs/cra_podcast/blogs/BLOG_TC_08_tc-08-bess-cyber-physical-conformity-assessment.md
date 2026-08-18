---
id: "TC_08"
canonical_code: "TC_08"
title: "Battery Storage and the CRA: When a Cyber-Physical Fire Risk Meets Conformity Assessment"
subtitle: "A compromised battery management system can drive good cells into thermal runaway — a security bug that ends as a fire. The real question is not whether the CRA covers your BESS, but which of its parts it puts through a notified body, and where its cybersecurity duties stop and functional safety begins."
slug: "tc-08-bess-cyber-physical-conformity-assessment"
series_id: 10
episode_number: 8
series: "CRA: Truth & Consequences (Investigative)"
target_persona: "BESS Integrators, Grid & Energy Engineers, Safety and Security Leads."
persona_category: "Investigative"
statutes: ["Article 32", "Annex III", "Annex IV", "Annex I Part I"]
statutory_domain: "Conformity Assessment & CE Marking"
difficulty: "Advanced Engineering"
key_metric: "Route the components, not the container"
read_time: "8 min read"
duration: "13:20"
audio_url: "https://oxot.ai/audio/cra_podcast/TC_08.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["Cyber Resilience Act", "Regulation (EU) 2024/2847", "battery energy storage system", "BESS cybersecurity", "battery management system security", "thermal runaway", "cyber-physical safety", "Annex III Class II", "Article 32 conformity assessment", "notified body BESS", "functional safety IEC 61508"]
takeaways: ["A BESS battery management system is a default product with digital elements: it self-assesses under Article 32, and the full Annex I cybersecurity requirements still apply to it in full", "The notified-body route is triggered per component, not per container — a firewall or intrusion-detection appliance guarding the site, or a tamper-resistant microcontroller inside the BMS, is where Annex III Class II bites and third-party assessment becomes mandatory", "The CRA governs whether an attacker can command the pack into an unsafe state; whether the cells then vent is functional and fire safety under other law — but a safety case that assumes 'authorised command only' is only as true as the BMS's access control"]
---

# Battery Storage and the CRA: When a Cyber-Physical Fire Risk Meets Conformity Assessment

*By Jim McKenney — Digital Product Security Consultant & Industrial OT Architect*

A battery fire rarely starts at the battery. It starts at a login. An attacker reaches the management network of a grid-scale storage site, authenticates against a BMS that trusts anything on its own subnet, and rewrites the thermal cutoff thresholds. The pack now believes a cell climbing past its safe ceiling is running cool. The contactors that should have opened stay closed. Charge keeps flowing into a cell that is already venting, and a lithium-ion rack inside a shipping container on a substation pad goes into thermal runaway. There was no physical fault, no manufacturing defect in the cells. The chemistry did exactly what compromised software told it to do.

That is what makes a battery energy storage system different from almost everything else the Cyber Resilience Act touches. In most products a cybersecurity failure costs you data, uptime, or money. In a BESS it can cost you a fire that vents toxic gas and propagates cell to cell faster than a response crew can reach the gate. The security bug and the safety hazard are not two events. They are one event, read from two directions.

<!-- IMAGE-SLOT: tc-08-hero | 1200x630 | alt: "A containerised battery energy storage system on a substation pad, one door open to reveal racks of lithium-ion modules and a BMS controller, with a network cable running to a small firewall appliance." | caption: "The cells never fail on their own. The BMS that governs their thermal limits is a networked computer, and its login is the first thing between an attacker and a fire." -->

## The CRA regulates the door, not the fire

The essential cybersecurity requirements in Annex I Part I read like a generic IT checklist until you set them next to a battery. Protect the product from unauthorised access. Preserve the integrity of the data and commands it stores and transmits. Expose only the interfaces the function actually needs. On a networked BMS none of that is a privacy nicety. Access control is the specific mechanism that stops an outsider from issuing a thermal-limit override. Integrity protection is what stops a man in the middle from telling the pack that a hot cell is cold. What the [Regulation](/wiki/cra) writes in flat language as "protection from unauthorised access" is, on a storage site, the requirement that a stranger cannot command the pack into a state where it burns.

So the CRA's duty here is precise, and it is worth being precise back. The Act does not regulate whether the cells vent, how hot they get, or how fast runaway spreads. It regulates whether an attacker can reach the controls that decide those things. It governs the door. The fire on the other side of that door belongs to a different body of law, and I will come back to why that boundary matters more than it looks.

## The route everyone gets wrong

Ask a room of BESS integrators which conformity route the CRA puts them on and someone will answer with confidence: "storage is critical infrastructure, so the whole container is a Class II important product — book the notified body." That answer is wrong, and it is wrong in the expensive direction, because it commits budget to a third-party audit the system may never have owed.

Article 32 lays out the routes, and its first item is the default one: the internal control procedure, module A, where you assess your own product against the Annex I requirements, compile the file, and sign the declaration yourself. Third-party notified-body assessment becomes mandatory only when a product lands on a specific list, Annex III Class II or the critical list in Annex IV. The class-by-class mechanics of those lanes belong to [EP 7.01](/blog/ep-7.01-self-assessment-vs-notified-body-modules-a-b-c-h), which owns the route map; the short version for a battery is that those annexes are lists of named product categories, and "battery energy storage system" is not one of them.

Read your BMS off the annex the way a grid engineer reads a protective relay off it in [EP 5.03](/blog/ep-5.03-power-grids-renewable-substation-automation-iec-61). A battery management system whose job is cell balancing, state-of-charge estimation and thermal governance is unquestionably a product with digital elements, and the full weight of Annex I applies to it. But it is not an identity manager, a firewall, an operating system, or a tamper-resistant microcontroller. It appears on neither list, and it self-assesses under Article 32. The cybersecurity duties are heavy; the audit route is the light one.

## The annex bites per component, not per container

That does not wave the whole site through. The listing works at the level of individual products, and a real installation carries components that are named on the annexes even when the BMS is not. Route the parts, not the box.

| Part of the BESS | Where it sits on the annexes | Conformity route |
|---|---|---|
| BMS / energy management controller | On neither list — a default product with digital elements | Self-assessment, module A (Art 32(1)) |
| Site network firewall or intrusion-detection/prevention appliance | Annex III, Class II | Mandatory third-party assessment (Art 32(3)) |
| Tamper-resistant microcontroller holding keys inside the BMS | Annex III, Class II | Mandatory third-party assessment (Art 32(3)) |
| Smart-meter gateway or secure-cryptoprocessing device at the grid metering interface | Annex IV, critical | Cybersecurity certification scheme, or the Class II route where that is unavailable (Art 32(4)) |

<!-- IMAGE-SLOT: tc-08-component-routing | 1200x760 | png | alt: "A BESS block diagram with each digital component tagged by its annex position: the BMS labelled self-assess, the perimeter firewall and an embedded tamper-resistant microcontroller labelled Annex III Class II notified body, a metering gateway labelled Annex IV." | caption: "One installation, several routes. Most of the system self-assesses; the perimeter firewall and any tamper-resistant microcontroller are where a notified body earns its fee." -->

The right posture falls straight out of that table. You do not certify the container. You route each digital component in it, and most of them self-assess. The firewall or IDS/IPS appliance standing between the storage network and everything else is a Class II important product on its own, and it takes the notified-body road regardless of how ordinary the BMS behind it is. So does a tamper-resistant microcontroller, if your BMS embeds one for key storage. A team that "books the notified body for the BESS" has usually mis-scoped the assessment to the wrong noun, and the error runs both ways: it can over-buy an audit for a self-assessing controller, or it can quietly skip the one appliance that genuinely owed third-party assessment because the whole job was framed around the container. You can model each of those component routes before you price anything in the [conformity workspace](/demo).

## Where the cybersecurity law stops

Now the boundary I set aside earlier. The override that starts the fire is, at the same instant, a CRA cybersecurity non-conformity and a functional-safety failure. The Act reaches only the first of those.

> [!NOTE]
> **Quarantine: the fire itself is not CRA law.** The CRA governs cybersecurity — whether the BMS can be driven into an unsafe state by an unauthorised actor. Whether the cells then vent, how fast thermal runaway propagates, and what the enclosure, spacing and suppression must withstand belong to functional and fire safety, governed by other legislation and by engineering standards such as IEC 61508 (functional safety) and the battery-specific thermal-runaway and fire codes, with IEC 62443 shaping the surrounding secure architecture. Those are implementation references, not CRA citations. The cybersecurity argument stands without any of them: a BMS that lets an unauthenticated actor rewrite a thermal limit fails Annex I on its own terms, whatever a safety standard does or does not require.

That separation is not academic, because the two bodies of law lean on each other in one specific place. A functional-safety case for a BESS almost always contains an assumption, stated or buried, that the protective logic — the thermal cutoffs, the contactor trips, the charge limits — can only be altered by an authorised command. Functional safety treats that as a given and reasons upward from it. The CRA is the regime that decides whether the given is true. If the BMS authenticates weakly, or trusts its own network, or ships a firmware update channel an attacker can hijack, then "authorised command only" is a hope, not a control, and every safety conclusion resting on it inherits the weakness. A safety case built on fake access control is fiction with a cover sheet.

That is also why "we passed our electrical and fire testing" is not an answer to the CRA, and "we self-assessed our cybersecurity" is not an answer to the fire marshal. Each regime verifies a different face of the same cabinet, and neither one validates the other's assumption for it. The integrator who understands that stops treating the two as competing paperwork and starts treating the access control on the BMS as a safety-critical function that happens to be governed by a security law.

Certify the parts the annex actually names, self-assess the rest, and never sign a functional-safety case whose "authorised command only" premise rests on a BMS you have not made an attacker try, and fail, to command into the burn.
