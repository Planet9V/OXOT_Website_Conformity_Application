---
id: "EP_2.04"
canonical_code: "EP_2.04"
title: "The Multi-Plant Modernization Pipeline: A System Integrator's CRA Playbook"
subtitle: "A repeatable retrofit pipeline that lets an integrator run overhauls across chemical, automotive, and energy plants while keeping the deemed-manufacturer line — Article 22 — on the right side."
slug: "ep-2.04-the-axians-case-study-building-a-multi-plant-cra-m"
series_id: 2
episode_number: 4
series: "The System Integrator & EPC Shield"
target_persona: "Multi-Plant Engineering Directors, Global EPC Leadership."
persona_category: "EPC & Integrators"
statutes: ["Article 22", "Article 3(30)", "Annex VII"]
statutory_domain: "System Integration & Art 22"
difficulty: "Advanced Engineering"
key_metric: "Article 22 deemed-manufacturer scope"
read_time: "8 min read"
duration: "14:15"
audio_url: "https://oxot.ai/audio/cra_podcast/EP_2.04.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["Cyber Resilience Act", "Regulation (EU) 2024/2847", "Article 22", "substantial modification", "system integrator", "EPC", "Annex VII technical documentation", "multi-plant modernization"]
takeaways: ["A staged modernization pipeline built as a scoping discipline, not a paperwork machine", "Per-asset categorization that decides who holds the manufacturer duty before anyone touches the plant", "A standardized Annex VII dossier issued once per modification, not once per site"]
---

# The Multi-Plant Modernization Pipeline: A System Integrator's CRA Playbook
*By Jim McKenney — Industrial Product-Security Consultant (OT, CRA, IEC 62443)*

A large integrator does not run one project. It runs the same project forty times. The same PLC swap, the same SCADA re-platforming, the same edge-gateway rollout, repeated across a chemical site in Antwerp, an automotive body shop in Bratislava, a combined-heat-and-power plant outside Lyon. That repetition is the business model. Under the Cyber Resilience Act it is also the risk model: whatever compliance decision you bake into the template, you have now made in every plant at once — including the decision to become the manufacturer of a product you only meant to service.

> *The scenario below is a composite — three plants, one hypothetical European automation integrator. It's built to make the mechanics concrete, not to describe any real company's actual program.*

This is the piece that turns a modernization program from a legal exposure into a repeatable, defensible pipeline: deciding, per asset, whether a retrofit crosses the line into a **substantial modification**, and if it does, containing it so the duty lands on a bounded module instead of the whole plant.

## The line you are trying to stay on the right side of

Two articles decide who inherits manufacturer obligations after a product is already on the market, and integrators keep citing the wrong one.

**Article 21** catches importers and distributors — a party already in the product's supply chain — when they rebrand it or substantially modify it. An engineering integrator retrofitting an installed base is usually neither. The article that catches *you* is **Article 22**: a person other than the manufacturer, importer, or distributor who carries out a substantial modification and then makes the product available on the market is treated as the manufacturer.

The second half of Article 22 is the entire playbook, and it reads like a switch with two positions: your manufacturer duties attach to *the part of the product affected by the modification* — or, if the change reaches the cybersecurity of the product as a whole, they attach to *the entire product*.

Touch a bounded module and the duty is bounded to that module. Let the change ripple into the cybersecurity of the whole line, and you have just picked up manufacturer duties — technical file, conformity assessment, CE marking, vulnerability reporting — for the entire installation. The pipeline exists to keep that switch in the first position on purpose, every time, at every site.

## What actually counts as "substantial"

Article 3(30) defines it: a modification is substantial when a change made after the product is placed on the market **affects its compliance with the essential cybersecurity requirements** in Annex I, or **changes the intended purpose** the product was assessed against. Routine security patches that only fix vulnerabilities are explicitly carved out — a maintained device that gets its scheduled updates has not, by that act alone, been substantially modified.

So the trigger is not "did we do work." It is "did the work move the security envelope or the intended purpose." Re-flashing a controller with the vendor's signed firmware: no. Adding a routable remote-access path, changing the authentication model, or bolting a custom protocol bridge onto a device that was assessed as an isolated component: very likely yes. The categorization step below is where you make that call before the wrench comes out, not after the customer's auditor asks.

## The pipeline is a scoping discipline, not a paperwork machine

The mistake most integrators make is treating CRA readiness as a document-generation problem bolted onto the end of commissioning. By then the scope is already set by what the crews did. The decision worth having sits upstream of them. Build the pipeline as five gates, and make each one produce a decision, not a deliverable:

| Stage | Question it answers | Output that goes on file |
|-------|--------------------|--------------------------|
| 1. Asset intake | What is installed, who placed it on the market, and when? | Per-asset register: make, firmware baseline, original economic operator |
| 2. Modification triage | Does the planned work meet the substantial-modification threshold? | Substantial-modification determination, with the reasoning |
| 3. Scope containment | If it's substantial, can we bound it to a module? | Boundary definition — "part affected" vs. "whole product" |
| 4. Build & evidence | Do the changes meet Annex I, and is it captured as we go? | Annex VII technical-documentation instance |
| 5. Handover & retention | Who owns the duty after we leave, and for how long? | Contract allocation + dossier archived for the support life |

The first three gates are where the money is. A determination at Stage 2 that a retrofit is *not* substantial — documented, defensible, patch-only — keeps you out of manufacturer status entirely for that asset. A containment decision at Stage 3 keeps the duty on a single skid instead of the plant. Stages 4 and 5 only matter for the modifications that survive the first three.

## Categorize the asset before you touch it

Every asset in the installed base falls into one of a few buckets, and the bucket — not the plant it happens to sit in — decides your exposure. This is what lets one pipeline span chemical, automotive, and energy sites: the plant sectors differ, but the asset categories repeat.

| Asset category | Typical retrofit | Where the manufacturer duty sits |
|----------------|------------------|----------------------------------|
| Vendor device, patched only | Signed firmware updates, config within intended use | Original manufacturer — no substantial modification |
| Vendor device, security envelope changed | New remote-access path, auth model, or protocol bridge | **You**, under Article 22 — scoped to that device |
| Integrator-built module (skid, gateway, custom logic) | New product you assemble and place on the market | **You**, as manufacturer of that module from the start |
| Whole-line re-architecture | Change that alters the plant's overall cybersecurity posture | **You**, for the entire product — the position to avoid |

The categorization is also your negotiating map. For the first row you hold no new duty and should not accept one in the contract. For the second and third you hold a bounded, priceable duty — that is the work you are actually being paid to stand behind. The fourth row is the one to design out at Stage 3, because it converts a module-sized obligation into a plant-sized one.

<!-- IMAGE-SLOT: ep-2.04-scoping-boundary | 1200x675 | alt: "A single retrofit module drawn inside a dashed containment boundary within a larger plant system, with the boundary marking the part affected versus the whole product." | caption: "The deemed-manufacturer switch: the duty follows the boundary. Contain the modification and you owe duties for the module; let it touch the whole line's security and you owe them for the plant." -->

## The dossier is standardized once, instantiated many times

For every asset that lands in row two or three, the CRA requires technical documentation — the elements listed in **Annex VII**, drawn up before the product is made available and kept current for its support period. This is where integrators either drown or scale.

Drowning looks like a hand-built document per plant. Scaling looks like one Annex VII template with the fields your process already fills: the modification's intended purpose, the design and risk assessment against Annex I, the bill of materials as an SBOM, the vulnerability-handling and reporting arrangements, and the conformity route. Each modification becomes an *instance* of that template, not a fresh writing project. Because the underlying essential requirements map cleanly onto IEC 62443 — 4-1 for the secure development process, 4-2 for the component controls, 3-3 and 2-4 for system-level integration — an integrator already running a 62443 practice is generating most of the evidence anyway. The pipeline's job is to capture it at Stage 4 instead of reconstructing it under audit pressure later.

None of this is urgent-then-forgotten. The CRA entered into force on 10 December 2024, and its manufacturer obligations — the ones Article 22 hands you — apply from 11 December 2027. A multi-plant modernization program scoped and kickstarted now is executing under that regime by the time the retrofits land. The dossiers you standardize this year are the ones your notified body and your customer's counsel read in 2028.

## The worked case, in one paragraph

The three-plant program: at the automotive site, the crews re-flash a line of drive controllers with the vendor's signed firmware and change nothing about how they connect — Stage 2 says not substantial, no new duty, and the file records why. At the chemical site, a legacy analyzer gets a new custom gateway exposing a routable service it never had — substantial by the definition above, so Stage 3 boxes it: the gateway and analyzer become a defined module, and the integrator issues one Annex VII dossier for that module, carrying manufacturer duties for it and nothing else. At the energy site, someone proposes re-architecting the plant's remote-access backbone in a way that changes authentication for every connected asset — Stage 3 flags that this trips the "whole product" clause, and the design is re-drawn to keep the change inside a segmented zone so the duty stays bounded. Same pipeline, three outcomes, zero accidental plant-wide manufacturer status.

---

<!-- IMAGE-SLOT: ep-2.04-hero | 1200x630 | alt: "Three industrial plants — a chemical process site, an automotive assembly line, and an energy facility — connected to a single central engineering-governance hub." | caption: "One repeatable pipeline, many sites: the sectors differ, the asset categories repeat." -->

If you run modernization across more than one plant, do one thing this week: pull your active retrofit scopes and sort each asset into the four categories above. The ones in row four are your real liability, and they are almost always re-scopable into row two. Run one through the same five-gate scoping call the conformity workspace uses, and see the boundary decision on paper before a crew ever touches the plant — [take the tour](/tour).
