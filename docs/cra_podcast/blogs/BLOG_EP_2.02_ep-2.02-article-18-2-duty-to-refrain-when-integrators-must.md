---
id: "EP_2.02"
canonical_code: "EP_2.02"
title: "The 'Duty to Refrain': When Integrators Must Freeze Customer Deployments"
subtitle: "You find an unpatched critical flaw in an OEM switch on the commissioning bench. Energising it and handing over the keys can make you the operator who placed a non-conforming product on the market. Here is where the duty actually lives and what to do with it."
slug: "ep-2.02-article-18-2-duty-to-refrain-when-integrators-must"
series_id: 2
episode_number: 2
series: "The System Integrator & EPC Shield"
target_persona: "EPC Commissioning Leads, Field Service Engineers, Industrial Contractors."
persona_category: "EPC & Integrators"
statutes: ["Article 19(3)", "Article 20(3)", "Article 21", "Article 22", "Article 64"]
statutory_domain: "System Integration & Art 21"
difficulty: "Advanced"
key_metric: "Duty-to-Refrain Exposure"
read_time: "7 min read"
duration: "14:15"
audio_url: "https://oxot.ai/audio/cra_podcast/EP_2.02.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["Cyber Resilience Act", "Regulation (EU) 2024/2847", "duty to refrain", "system integrator CRA obligations", "distributor obligations Article 20", "importer obligations Article 19", "significant cybersecurity risk", "EPC commissioning", "Industrial OT Security"]
takeaways: ["When the freeze is a statutory duty, not a judgment call", "The two thresholds: stop vs stop-and-notify", "The stop-work notice, OEM escalation, and indemnity language that hold up"]
---

# The Duty to Refrain: When Integrators Must Freeze a Deployment

*By Jim McKenney — Digital Product Security Consultant & Industrial OT Architect*

It is Thursday afternoon on a commissioning bench. The plant goes live Friday. The last item is an OEM managed switch that ties the safety network to the DCS, and your pre-energisation scan just flagged a known, unpatched critical vulnerability in its firmware — a CVE with a public exploit and no vendor fix yet. The asset owner wants the keys tomorrow. Every instinct built over twenty years of field work says *power it up, note it in the punch list, chase the patch later.*

Under the Cyber Resilience Act, that instinct is now the wrong move — and in the wrong circumstances it is a statutory breach. Energising equipment you know is vulnerable, then handing it over as part of the delivered system, can put you on the hook as the economic operator who made a non-conforming product available on the market. The compliant move is the one that feels like a career risk: you freeze.

This post is about where that "duty to refrain" actually lives, what triggers it, and how to freeze a deployment without detonating the schedule or the client relationship.

## First, the article number the briefings keep getting wrong

You will see this duty attributed to "Article 18(2)." It isn't there. Article 18 of Regulation (EU) 2024/2847 is about authorised representatives — the EU-based proxy a non-EU manufacturer appoints. Nothing to do with commissioning a plant.

The obligation that freezes your Thursday afternoon sits in the economic-operator duties, and *which* article applies depends entirely on the role you are playing at that moment:

- If you brought that switch into the EU from a third-country supplier, you are acting as an **importer**.
- If you procured it inside the EU and are passing it down the chain to the asset owner as part of your delivered scope, you are acting as a **distributor**.
- If you reconfigured or modified it enough to change its security properties, you may have become its **manufacturer** — a different and much larger problem, covered below.

Get the role right before you argue about the duty, because the role decides which penalty tier you are exposed to.

<!-- IMAGE-SLOT: ep-2.02-hero | 1200x630 | alt: "An OEM industrial network switch on a commissioning bench, powered down, beside a laptop running a pre-energisation vulnerability scan and a stack of handover paperwork." | caption: "The moment before energising is the decision point the CRA cares about." -->

## The two thresholds: stop, versus stop-and-notify

The refrain duty is not one rule; it is two, stacked, with different triggers. This is the part most site teams get wrong, because they collapse them into a single "is it bad enough to stop?" question.

**Threshold one — non-conformity. This is the low bar, and it is a hard stop.** As a distributor, the moment you "consider or have reason to believe" the product is not in conformity with the essential requirements, you may not make it available on the market until it has been brought into conformity (Article 20(3)). The importer's version is the same shape (Article 19(3)). Note the trigger: not *proven* non-conformity, just reason to believe. A confirmed critical CVE with no fix is squarely reason to believe.

**Threshold two — significant cybersecurity risk. This is when silence also becomes a breach.** If the product presents a significant cybersecurity risk, you must, without undue delay, inform *both* the manufacturer *and* the market surveillance authorities. The stop is no longer enough on its own; the law now wants the flaw on the record with the national authority.

| What you found | Distributor duty | Importer duty |
|---|---|---|
| Reason to believe it's non-conforming | Do **not** make available until fixed | Do **not** place on market until fixed |
| It also presents a **significant** cybersecurity risk | Above, **plus** inform the manufacturer **and** the market surveillance authority, without undue delay | Above, **plus** inform the manufacturer **and** the authority |
| Already delivered when you learn of it | Take corrective measures — bring into conformity, or withdraw/recall if appropriate | Same, plus notify the manufacturer of the vulnerability without undue delay |

The practical read for a commissioning lead: an unpatched critical flaw in an internet-adjacent or safety-adjacent device almost always clears both bars. You stop, and you write it down to the authority. A cosmetic non-conformity in an air-gapped device clears the first bar but probably not the second — you still can't hand it over as conforming, but the regulator does not need a letter.

## The patch trap: fixing it yourself can make you the manufacturer

Here is the move that turns a €10M problem into a €15M one. The switch has no vendor patch. A resourceful integrator writes their own mitigation — reflashes modified firmware, bolts on a filtering proxy, rewrites the device's security logic — and ships it as "hardened."

Do that, and you may have carried out a **substantial modification** — and whichever hat you were wearing, the modification can pull you into the manufacturer's chair. If you were the switch's importer or distributor, Article 21 deems you its manufacturer once you substantially modify it; if you were neither — a pure integrator reworking someone else's supplied product — Article 22 does the same. Either route hands you the full manufacturer duties — secure-by-design, the technical file, the conformity assessment, the vulnerability-handling and reporting obligations — for the part you changed, or for the whole product if your change affects its cybersecurity overall. That moves you into the top penalty tier: up to €15,000,000 or 2.5% of worldwide turnover, versus the €10,000,000 / 2% tier that attaches to the economic-operator duties you started the day with.

There is a deliberate escape hatch, and you should know its edges. A security *update* that fixes a vulnerability without otherwise changing the product's function is carved out of "substantial modification" — patching to stay secure is not supposed to promote you to manufacturer. But a patch you author on hardware the OEM won't stand behind is a long way from a vendor-signed update, and the further your "fix" drifts from restoring the original intended behaviour, the weaker that carve-out gets. On the bench, the safe reading is blunt: apply the *vendor's* fix, or freeze and escalate. Do not become the author of the firmware you are commissioning.

## Freezing without burning the schedule

The reason teams energise known-vulnerable kit is not ignorance. It is that "stop" with no process attached reads as *the integrator missed the date*, and nobody wants to own that in a handover meeting. So don't stop bare. Stop with three instruments ready, and the freeze reads as diligence instead of failure.

**1. The stop-work notice — a written record, not a hallway conversation.** It should name the device and firmware version, state the specific finding (CVE, CVSS, exploit status, absence of a vendor fix), cite the duty in one line ("as distributor under the CRA we cannot make a non-conforming product available"), and state the hold explicitly: this device is not energised into production and not accepted until remediated. Date it, and copy the asset owner's authorised representative. This document is what converts your freeze from a schedule slip into evidence that you did exactly what the regulation requires — and it is the same record you would hand a market surveillance authority if the significant-risk threshold is crossed.

**2. The OEM escalation, with a clock on it.** The freeze is the OEM's problem to clear, so make the ask precise: a fix, a validated compensating control they will stand behind in writing, or a formal position that no fix is coming. Set a response deadline tied to the go-live and state what happens if it lapses. Vague "please advise" emails let the vulnerability age quietly on your bench while the calendar keeps moving. If the device already went live before you learned of the flaw, this same escalation is where your corrective-measures duty starts.

**3. Indemnity and acceptance language that survives the argument.** Your subcontract should say, before the job starts, that acceptance of any product with digital elements is conditional on it being free of known un-remediated critical vulnerabilities at handover, that the integrator may withhold energisation and acceptance to meet its CRA operator duties without that constituting delay or breach, and that the party supplying the non-conforming component carries the cost of the resulting remediation and reprogramming. Written after the freeze, this is a fight. Written into the contract, it is the reason the freeze is uncontroversial.

## The one line to take onto the bench

The CRA did not invent a new "duty to refrain" out of nothing, and it is not hiding in Article 18. It took a rule that has always existed for anyone in a supply chain — you do not pass along a product you have reason to believe is defective — and gave it teeth, a notification obligation, and a turnover-percentage fine. For a commissioning lead, that collapses to something you can act on without a lawyer in the room: **the pre-energisation scan result is now a legal fact, and the decision to power up is now a legal act.** Treat the freeze as the default, not the exception, and build the paperwork that makes it defensible before you ever need it.

Draft the stop-work notice template this week, not the week you need it — a blank Word doc at 4pm on a Thursday is how the freeze turns back into a shortcut. See how the conformity workspace tracks a hold from pre-energisation scan to OEM response to sign-off in [the platform tour](/tour).
