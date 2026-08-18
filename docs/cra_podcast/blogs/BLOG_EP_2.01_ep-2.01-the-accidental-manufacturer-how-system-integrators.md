---
id: "EP_2.01"
canonical_code: "EP_2.01"
title: "The Accidental Manufacturer: How System Integrators Trigger 'Deemed Manufacturer' Liability"
subtitle: "Five certified PLCs, a few thousand lines of custom SCADA Python, one configured edge gateway. You billed it as engineering hours. The CRA may read it as a product you manufactured — and own for a decade."
slug: "ep-2.01-the-accidental-manufacturer-how-system-integrators"
series_id: 2
episode_number: 1
series: "The System Integrator & EPC Shield"
target_persona: "Industrial System Integrators (Axians, VINCI, Spie, Actemium), Automation Engineers."
persona_category: "EPC & Integrators"
statutes: ["Article 22", "Article 3(30)", "Article 13", "Article 14"]
statutory_domain: "System Integration & Deemed-Manufacturer Liability"
difficulty: "Advanced Engineering"
key_metric: "Deemed-manufacturer exposure"
read_time: "8 min read"
duration: "14:15"
audio_url: "https://oxot.ai/audio/cra_podcast/EP_2.01.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["Cyber Resilience Act", "Regulation (EU) 2024/2847", "system integrator", "deemed manufacturer", "substantial modification", "Article 22", "custom SCADA", "edge gateway", "IEC 62443", "Industrial OT Security", "CE Marking"]
takeaways: ["The substantial-modification test applied to integration work", "Safe-harbor integration architectures that keep component CE marks valid", "Customer acceptance sign-offs that record intended purpose per component"]
---

# The Accidental Manufacturer: How System Integrators Trigger 'Deemed Manufacturer' Liability

*By Jim McKenney — Digital Product Security Consultant & Industrial OT Architect*

<!-- IMAGE-SLOT: hero | 1200x630 | alt: "An assembled automation skid: several certified controllers on a DIN rail wired to an edge gateway, an engineer's laptop showing custom control code beside it, the whole assembly framed as a single delivered unit" | caption: "Off-the-shelf parts plus your own software and configuration. Handed over as one system, it can read as one product." -->

You priced the job in engineering hours. Five certified PLCs off the shelf, a few thousand lines of custom Python driving the SCADA layer, an edge gateway configured to push telemetry north to the customer's historian. To your finance team that is a services contract. Nobody typed "manufacturer" into the purchase order.

The Cyber Resilience Act does not read purchase orders. It reads what you did to the product and where it ended up. Do enough to the components you were handed, hand the result over, and the regulation can deem *you* the manufacturer of the thing you assembled — with the technical file, the conformity assessment, and the multi-year vulnerability-handling duties that come with the title.

This isn't a stretch reading. It's a clause written for exactly your role.

## The switch you flip without touching a soldering iron

There are two doors into manufacturer status, and integration work walks past both.

The first is placing a new **product with digital elements** on the market. The CRA's definition of that term explicitly includes software placed on the market separately — not just boxes with silicon in them. The custom SCADA logic you wrote is software. When you deliver it as part of a working system in the course of a commercial activity, there is a live question about whether you have made a product available on the market in your own name. That question doesn't have a clean, settled answer for bespoke one-off integration yet, and anyone who tells you it does is selling something.

The second door is not ambiguous at all. If you carry out a **substantial modification** of a product already on the market and then make it available, you are deemed to be its manufacturer. The text names the actor precisely: a person other than the original manufacturer, the importer, or the distributor. That is the integrator, the EPC, the automation house. This is **Article 22**, and it is black-letter, not analogy.

So the whole exposure turns on one defined phrase. A **substantial modification** (Article 3(30)) is a change to a product with digital elements, *after* it was placed on the market, that either affects its compliance with the essential cybersecurity requirements or changes the intended purpose it was assessed against. That's the trigger. There's a deliberate carve-out worth memorizing: a change that only lowers cybersecurity risk without altering intended purpose — a straight security update — is expressly **not** substantial (Recital 39). Assembling certified parts and patching them is not what puts you on the hook. Changing what they *are for* is.

## Run your own job through the test

The useful exercise is to stop talking about "the project" as one undifferentiated block of work and split it into acts. Each act crosses the line, or it doesn't, on its own facts.

| What you actually did | Crosses the substantial-modification line? | Why |
| --- | --- | --- |
| Bolted five certified PLCs to a rail, firmware and default logic unchanged, wired per the OEM manual | No, by itself | Assembling components inside their assessed intended purpose. Each CE mark still means what it meant. |
| Wrote custom Python that re-tasks the controllers into a coordinated function the OEM never assessed | Likely yes | You changed the intended purpose of the assembled product and added software surface that no conformity assessment covers. |
| Configured the edge gateway to bridge the isolated cell to the corporate network and a cloud historian | Often yes | You materially changed the attack surface and the security posture the components were certified under. |

The pattern is clean once you see it. Screwing certified things together is assembly. Making them do something new, or exposing them to a threat model they were never assessed against, is modification. The Python and the gateway config — the parts you were proudest of, the parts that were "just engineering" — are the parts most likely to flip the switch.

## Why this is worse than you budgeted for

Here is the detail that turns an academic distinction into a board-level number. Integrators who have read the regulation tend to assume they sit in the *operator* tier — the importer-and-distributor duties, where administrative fines top out at €10 million or 2% of worldwide turnover. That is the wrong shelf.

The moment Article 22 deems you the manufacturer, it drags in the manufacturer's substantive obligations: the full design, documentation, and conformity duties of **Article 13**, and the incident and vulnerability reporting duties of **Article 14** that begin applying on 11 September 2026, ahead of the general 11 December 2027 date for CE marking. Non-compliance with those two articles and the Annex I essential requirements is the *top* penalty band — €15 million or 2.5% of worldwide turnover. You didn't step up one tier by accident. You stepped up to the ceiling.

And the fine is the least of it. The manufacturer owns the vulnerability-handling duty for the supported lifetime of the product — a coordinated disclosure channel, an SBOM you keep current, and a 24-hour clock on actively exploited flaws. That is a standing operational function, not a line you close out at handover. It is also where the money quietly goes: a first-pass CRA gap assessment for a mid-sized industrial firm already lands at €50,000–€150,000, and that is before you have stood up a single reporting channel. The OEM whose logo is on the PLC does not absorb any of this for the *composite* you built. Their conformity covers their box, assessed for their intended purpose. The system you assembled and re-tasked is yours.

<!-- IMAGE-SLOT: safe-harbor-boundary | 1200x800 | alt: "A flat schematic showing an integrator's custom software and orchestration layer sitting above a row of unmodified certified components, separated by a clear isolation boundary, with the gateway placed at the edge of that boundary" | caption: "Safe-harbor architecture: your authored layer is bounded and separately owned; the certified components below it keep their assessed intended purpose." -->

## Architect so you never cross by accident

The good news is that deemed-manufacturer status is a consequence of *design decisions*, and design decisions are yours to make. The objective is not to do less engineering. It is to keep your engineering on the assembly side of the line, and to know exactly where your own product begins.

**Keep certified components inside their assessed intended purpose.** If a PLC does what the OEM said it does, wired the way the OEM said to wire it, its CE mark travels with it and the substantial-modification test has nothing to bite on for that component. The failures are the clever re-tasks — using a controller for a function it was never assessed against. Where you must do that, you have made a decision, not a mistake; own it deliberately.

**Treat your custom software as its own product with digital elements — on purpose.** Your SCADA layer, your orchestration scripts, your gateway configuration: give that authored layer its own technical file, its own SBOM, its own vulnerability-handling process. If it is going to be a product, being its manufacturer by design is defensible. Being its manufacturer by discovery, during an incident, is not.

**Use the standards that actually exist, because the harmonized ones don't yet.** As of now, not one CRA harmonized standard has been published in the Official Journal, so there is no presumption of conformity to lean on. IEC 62443 is the spine to build against in the meantime: **62443-4-1** for your secure development process, **62443-3-3** for the system-level security of the integrated cell, and **62443-2-4** for your obligations as the service provider doing the integrating. Architecting to those today is the closest thing to an audit-proof position available before 2027.

## The one document that decides this later

Every dispute about who manufactured what gets litigated against a record that was written — or wasn't — at handover. Make the Site Acceptance Test that record.

A defensible acceptance sign-off does three specific things. It lists each certified component and states, per component, its intended purpose and that your integration did not alter it. It names the software layer you authored and stand behind as its own deliverable, with its own conformity basis. And it has the customer countersign that scope. That is not paperwork for its own sake; it is the artifact that, eighteen months from now, decides whether you assembled certified parts or manufactured a new product — before a lawyer decides it for you on worse facts.

You are not going to bill fewer hours because of the CRA. You are going to write one more page before the customer signs, and that page is the difference between an integrator and an accidental manufacturer. If you want to see the substantial-modification test traced across a real integrated system before you draft that sign-off, walk one of your own builds through it in the [CRA wiki](/wiki/cra).
