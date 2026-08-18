---
id: "EP_2.03"
canonical_code: "EP_2.03"
title: "Custom SCADA Scripts vs. Product Logic: Where the CRA Line Is Drawn"
subtitle: "Bespoke ladder logic and one-off Ignition/WinCC dashboards feel like software products. The CRA's scope turns on three gates — and most site-specific plant code fails at least one of them."
slug: "ep-2.03-custom-scada-scripts-vs-product-logic-where-the-cr"
series_id: 2
episode_number: 3
series: "The System Integrator & EPC Shield"
target_persona: "HMI/SCADA Developers, PLC Programmers, Automation Architects."
persona_category: "EPC & Integrators"
statutes: ["Article 2(1)", "Article 3(1)", "Article 3(13)", "Article 3(22)", "Article 3(30)", "Recital 64"]
statutory_domain: "Scope & Product Definition"
difficulty: "Advanced Engineering"
key_metric: "Making-available-on-market scope test"
read_time: "7 min read"
duration: "14:15"
audio_url: "https://oxot.ai/audio/cra_podcast/EP_2.03.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["Cyber Resilience Act", "Regulation (EU) 2024/2847", "product with digital elements", "making available on the market", "custom SCADA scripts", "bespoke software CRA scope", "ladder logic", "Ignition WinCC", "system integrator CRA", "Article 3(22)", "configuration vs programming"]
takeaways: ["When bespoke plant code is a product vs. site-specific configuration", "The three scope gates: it is a product, it is commercially supplied, it carries your trademark", "The documentation that proves which side of the line you are on"]
---

# Custom SCADA Scripts vs. Product Logic: Where the CRA Line Is Drawn

*By Jim McKenney — Digital Product Security Consultant & Industrial OT Architect*

<!-- IMAGE-SLOT: hero | 1200x630 | alt: "Split view: on the left a shrink-wrapped boxed software product with a CE mark; on the right an engineer's screen showing a one-off Ignition plant dashboard and a rung of ladder logic" | caption: "The CRA regulates products placed on the market — not every line of logic an engineer writes for a single site." -->

The question every SCADA and PLC developer asks about the Cyber Resilience Act is the wrong one. It's usually phrased as: *"Does my custom code make me a software manufacturer?"* That framing assumes the CRA cares about the act of writing code. It doesn't. The Regulation cares about **products supplied to a market** — and whether the ladder logic you wrote last Tuesday is one is a narrower question than the anxiety around it suggests.

Short version, then the fuzzy part: a bespoke script written for one plant, one purpose, one owner is almost never a *product with digital elements* placed on the market in its own right. What can still catch you is different — modifying a product already on the market. Those are two separate exposures, and conflating them is how integrators either panic over nothing or miss the thing that actually bites.

## What the CRA regulates — and what it doesn't

The CRA — Regulation (EU) 2024/2847, in force since 10 December 2024, with CE-marking and conformity obligations applying from 11 December 2027 — attaches to a *product with digital elements*: a software or hardware product, and its remote data-processing solutions, supplied to the market (Article 3(1)), whose intended or reasonably foreseeable use includes a data connection to a device or network (Article 2(1)). The trigger is not authorship. It's **making available on the market**: supplying a product for distribution or use on the Union market *in the course of a commercial activity* (Article 3(22)).

Read that phrase slowly, because it does most of the work. The CRA governs the moment a product crosses a market boundary in commerce. Engineering labour billed by the hour, site-specific configuration of a system you don't market, and a service delivered to one client — none of those is a product. The Regulation was written for things that ship: firmware, applications, connected devices. Not every artefact an engineer produces on a project.

## Three gates, and bespoke plant code usually fails one

To be *your* regulated product, custom automation logic has to clear all three gates below. Miss one and it isn't a product with digital elements you placed on the market:

**Gate 1 — Is it a product, or configuration of someone else's product?** When you draw screens in Ignition's Designer, tune loops in a WinCC project, or map tags into a vendor's runtime, the *product* is the vendor's SCADA platform — they placed it on the market and hold the manufacturer duties for it. Your application layer, bespoke ladder logic included, is site-specific configuration of that product, not a new product you manufactured.

**Gate 2 — Is it made available on the market in the course of a commercial activity?** In-house software a plant owner's own staff write for their own site never crosses the making-available threshold in Article 3(22) — there's no supply to a market, paid or free. Recital 16 confirms that principle by name for public administration entities; the same logic — no commercial supply, no manufacturer duty — applies just as well to any owner-operator running its own plant. The plant is the operator and user of that logic, not its manufacturer. (Integrators: when you hand deliverables to a paying client, the commercial-supply element is met — this gate rarely helps you, so the weight falls on Gates 1 and 3.)

**Gate 3 — Do you market it under your own name or trademark?** The manufacturer definition (Article 3(13)) turns on developing a product *and* marketing it under your name or trademark — whether for payment, monetisation, or free. Anonymous logic running inside a client's plant, delivered as part of the works, isn't marketed under your brand as a product.

What clears all three looks different from ordinary project work: a reusable driver, a licensed function-block library, a productised HMI framework sold across customers.

## The spectrum, with worked examples

The word "custom" hides three legally different things. Put your deliverable in the right column before you argue about conformity.

| Deliverable | What it is | CRA status |
|---|---|---|
| Tag mapping, loop tuning, alarm setpoints, screens drawn in a vendor runtime for one site | Configuration of a placed-on-market product | Outside CRA as your product; the platform vendor holds the duties |
| Bespoke ladder logic / a one-off dashboard for a single owner, delivered as project works | Site-specific engineering / a service output | Not a product *you* placed on the market — but watch substantial modification (below) |
| A reusable function-block library, protocol driver, or HMI framework you license or ship across customers | A product with digital elements you supply commercially | In scope — you are the manufacturer of that product |
| The same reusable component, but genuinely tailor-made and fitted to one business user by contract | In scope, with a narrow requirement carve-out | In scope; Recital 64 permits agreed deviations from *essential requirements*, not from the regime |

The dividing line the table draws is **reuse and supply**, not effort or cleverness. A thousand hours of intricate, single-site logic stays configuration. A tidy 200-line driver you reuse on the next ten projects and ship under your name is a product.

<!-- IMAGE-SLOT: scope-spectrum | 1200x900 | alt: "Horizontal spectrum from 'site-specific configuration' on the left to 'productised, reusable, marketed component' on the right, with the CRA scope boundary marked and the three gates labelled along it" | caption: "The scope boundary tracks reuse and commercial supply, not how hard the code was to write." -->

## Where the line is genuinely fuzzy

I won't pretend the boundary is crisp. It isn't, and anyone who tells you otherwise hasn't looked closely.

- **Configuration vs. programming has no bright statutory test.** Nowhere does the CRA say "scripting in a vendor's language is configuration but writing a standalone service is a product." The Commission is directed to issue guidance on the scope of the Regulation and the concept of substantial modification (Recital 6), and it hasn't landed yet. The reasoning above is defensible, not settled.
- **Remote data processing pulls in the cloud you thought was out.** A product's remote data-processing solution is part of the product by definition, where the product's function depends on it (Article 3(1)–(2)). If your "dashboard" is a cloud historian or gateway service without which the plant function fails, that back end can be dragged into someone's product scope. Don't assume the network stops at the firewall.
- **The reusable-template trap.** The most common way a firm crosses the line by accident: it builds a "standard" screen set, alarm framework, or code template, refines it across jobs, and starts marketing "our platform." The day that becomes a thing you supply and brand, Gate 1 and Gate 3 flip, and it's a product — retroactively, in the eyes of an auditor reading your sales deck.

## The tailor-made exception you shouldn't over-read

Recital 64 is the clause integrators reach for, and they usually reach too far. It says a manufacturer may deviate from the essential cybersecurity requirements for a **tailor-made product fitted to a particular purpose for a particular business user**, where both parties have *explicitly agreed* to a different set of contractual terms.

Read what that does and doesn't do. It's a carve-out from the *essential requirements* for a genuinely bespoke, single-user product — not an exit from the Regulation. The product is still in scope, and you still need the agreement in writing, with a named business user and named terms. If your deliverable was never a product to begin with, you don't need Recital 64 at all — citing it concedes ground you didn't have to give.

## The exposure that isn't about authorship at all

Here's the mechanism that actually reaches integrators, and it has nothing to do with whether your script is a product. If your logic **changes a product already on the market** enough to affect its compliance with the essential requirements, or to change the intended purpose it was assessed for, that's a *substantial modification* (Article 3(30)) — and the person who makes the modified product available can inherit the manufacturer's duties for it. Reflash a controller, or alter a certified device's security-relevant behaviour and hand it back over, and the question is no longer "did I write a product?" but "did I re-place someone else's product on the market in a modified state?" That's the through-line of this series — a different test, a different answer. Security patches that only reduce risk without changing the intended purpose are carved out; broadening the attack surface or changing what the product is for is not.

## The documentation that proves which side you're on

Scope is a factual question, and facts you didn't record you can't prove two years later when an auditor asks. For every non-trivial deliverable, keep three short artefacts — not a dossier, a paper trail:

1. **A one-page scope determination.** State plainly whether the deliverable is site-specific configuration, a service output, or a supplied product, and *why* — which gate it fails or clears — dated. This ends the argument before it starts.
2. **A configuration-vs-development record.** Show what runs inside the vendor platform versus any standalone, reusable component you authored and supply. The distinction is invisible in a running plant; make it visible on paper.
3. **The contract language that matches.** Project work should read as project work — engineering services, site-specific, delivered to the owner. A tailor-made product under Recital 64 needs the explicit agreement and named terms on file. Your commercial paperwork and your scope memo have to agree; a sales deck that says "our SCADA platform" while the scope memo says "configuration" is exactly the contradiction an auditor lives for.

The developers who lose sleep over the CRA assumed authorship equals liability and never wrote down why their work isn't a product. The ones who sleep have a scope memo per deliverable and a clean line between what they configured and what they built. If you want to see where that line falls on your own stack, take one live project — one PLC program, one HMI application, one gateway — and run it through the three gates and the substantial-modification test in the [interactive CRA wiki](/wiki/cra) before someone else runs it through for you.
