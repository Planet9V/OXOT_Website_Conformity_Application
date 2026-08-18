---
id: "EP_7.05"
canonical_code: "EP_7.05"
title: "Presumption of Conformity: How Harmonised Standards Turn a Subjective Audit Into a Checklist"
subtitle: "Annex I is written in outcomes, not instructions, which leaves an auditor to decide what 'appropriate security' means. A harmonised standard cited in the Official Journal does that translation once, for everyone, and flips the burden of proof. Here is how presumption works, and how to align development to the standards that will carry it before they are published."
slug: "ep-7.05-presumption-of-conformity-harmonised-standards"
series_id: 7
episode_number: 5
series: "Conformity Assessment, Audits & CE Marking"
target_persona: "Standards Engineers, Chief Architects, Regulatory Officers."
persona_category: "Manufacturers & Product Owners"
statutes: ["Article 27", "Annex I"]
statutory_domain: "Conformity Assessment & CE Marking"
difficulty: "Advanced Engineering"
key_metric: "3 routes to presumption"
read_time: "8 min read"
duration: "14:10"
audio_url: "https://oxot.ai/audio/cra_podcast/EP_7.05.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["Cyber Resilience Act", "Regulation (EU) 2024/2847", "presumption of conformity", "harmonised standards", "Official Journal of the European Union", "Annex I essential cybersecurity requirements", "common specifications", "European cybersecurity certification scheme", "IEC 62443-4-1", "IEC 62443-4-2", "CEN CENELEC JTC 13", "Article 27"]
takeaways: ["Presumption of conformity flips the burden of proof: meet a harmonised standard whose reference is published in the Official Journal, and you are presumed to meet the Annex I requirements it covers", "A harmonised standard turns Annex I's outcome language into pass/fail engineering criteria, converting an open-ended audit into a conformance checklist", "No CRA harmonised standards are cited in the OJEU yet; align to IEC 62443-4-1/-2 and the CEN/CENELEC JTC 13 work now as the best available proxy, knowing it does not grant presumption until the reference is published"]
---

# Presumption of Conformity: How Harmonised Standards Turn a Subjective Audit Into a Checklist

*By Jim McKenney — Digital Product Security Consultant & Industrial OT Architect*

There is a single line in the Cyber Resilience Act that decides whether your next conformity assessment feels like an engineering task or a judgment call, and it is not a line about testing at all. It is a reference to a harmonised standard, printed in the Official Journal of the European Union. That reference is the golden ticket. Hold one, and the question an assessor puts to you shrinks from "is this product adequately secure?" to "did you implement the clauses of the named standard, yes or no?" Miss one, and the same product gets measured against the raw language of [Annex I](/wiki/cra), where "an appropriate level of cybersecurity" means whatever the person reading your file decides it means that afternoon.

That is what Article 27 buys, and the mechanism repays a slow read precisely because most people skim past it to the word "standards." Products "which are in conformity with harmonised standards or parts thereof, the references of which have been published in the Official Journal of the European Union, shall be presumed to be in conformity with the essential cybersecurity requirements set out in Annex I covered by those standards or parts thereof." Presumption is a legal shortcut with teeth. You demonstrate that you met the standard; the law then treats you as having met the underlying requirement, and the burden flips. A market-surveillance authority that disagrees now has to rebut a presumption, not merely hold a different opinion about your engineering.

<!-- IMAGE-SLOT: ep-7.05-hero | 1200x630 | alt: "A single printed reference to a harmonised standard in the Official Journal of the European Union depicted as a golden ticket, handed to an engineer whose thick Annex I audit file collapses into a short pass/fail checklist" | caption: "The golden ticket. A harmonised standard cited in the Official Journal converts an open-ended judgment about 'appropriate security' into a checklist an engineer can pass or fail." -->

## Three doors to presumption, one objective yardstick

Article 27 opens three doors to that presumption, not one. The first and primary door is the harmonised standard whose reference sits in the Official Journal. The second is a common specification: where the standards bodies stall or miss their deadline, the Commission can adopt implementing acts that set the technical requirements directly, and conformity with those is presumed conformity too. The third is a certificate issued under a European cybersecurity certification scheme adopted under Regulation (EU) 2019/881; where it covers the relevant requirements, presumption follows, and at assurance level "substantial" it can also discharge a third-party assessment obligation you would otherwise owe. Three routes, one destination: an objective yardstick standing in for a subjective one.

The reason that yardstick matters more than it first appears is that Annex I is written in outcomes, not instructions. It tells you to protect data confidentiality, to ship with a secure-by-default configuration, to minimise your attack surface, to handle vulnerabilities without undue delay. It does not tell you which cipher, which logging depth, or which patch cadence clears the bar. Someone has to translate those outcomes into pass/fail engineering criteria, and absent a harmonised standard that someone is an auditor exercising discretion. That is the open-ended audit the whole sector is bracing for, and it is a large part of why notified-body capacity has become such a choke point, which I worked through in [EP 7.02](/blog/ep-7.02-notified-body-bottleneck-2026-testing-capacity). A harmonised standard does the translation once, in public, for everybody at the same time. It turns "convince me this is secure" into "show me the results against clause 6."

## The catch: the shelf is bare

The real problem in 2026 is timing. The golden ticket is not printed yet. When the CRA's requirements bite at the end of 2027, the Official Journal will need a shelf of harmonised standards mapped to Annex I, and the Commission has issued the standardisation request to the European standardisation organisations to produce them. As of this writing that shelf is close to empty. The standards are in drafting, not in the Journal. So the presumption route exists in law with almost nothing to point at in practice, which hands every manufacturer the same uncomfortable choice: wait for the citations and compress the whole compliance effort into the months before the deadline, or start building now against the standards everyone expects to be named, and carry the risk that the final text shifts under you.

<!-- IMAGE-SLOT: ep-7.05-empty-shelf | 1200x800 | alt: "A timeline from 2026 to December 2027 showing an Official Journal shelf labelled 'harmonised standards for the CRA' that is nearly empty today and must be full by the general application date, with draft IEC 62443 and JTC 13 documents queued off to the side" | caption: "The presumption route is live in law but has little to cite. The harmonised-standards shelf must fill before December 2027; today it is drafts in a queue." -->

If you build now, you build against the obvious candidates. The European standardisation work runs through CEN/CENELEC's Joint Technical Committee 13, and the international reference material it draws on is the IEC 62443 series: 62443-4-1 for the secure product development lifecycle, and 62443-4-2 for the technical security requirements a component itself must meet. These are documents a competent product-security team would already have on the desk. Aligning to them today is sound engineering regardless of what the Journal eventually says, and it means that when a harmonised standard does land, you are reading a diff instead of opening a project.

> [!NOTE]
> IEC 62443-4-1, IEC 62443-4-2, and the CEN/CENELEC JTC 13 work are **not** CRA law, and none of them is a harmonised standard today. Nothing has been cited in the Official Journal of the European Union for the CRA as of this writing, so conformity with 62443 does **not** yet grant the Article 27 presumption. Treat these as the best available proxy for where the harmonised standards are heading, not as a shortcut that is already legally live. Confirm the OJEU citation before you rely on any standard for presumption.

## A working crosswalk you can build against today

To make alignment concrete rather than aspirational, here is the mapping I hand engineering teams. It is my working crosswalk between the IEC 62443 practice areas and the Annex I essential-requirement families, built as an engineering aid. It is not an official correspondence table, and the harmonised standards, when they are cited, will carry the authoritative mapping that supersedes this one. Use it to see which parts of your existing 62443 posture already speak to which CRA obligations, and where the gaps sit.

<!-- IMAGE-SLOT: ep-7.05-62443-bridge | 1200x675 | alt: "A two-column bridge diagram: on the left, IEC 62443-4-2 foundational requirements FR1 to FR7 and IEC 62443-4-1 lifecycle practices; on the right, the Annex I Part I product-property families and Part II vulnerability-handling families, with arrows showing 4-2 mapping to product properties and 4-1 mapping to process obligations" | caption: "The two halves of 62443 line up with the two halves of Annex I: 62443-4-2 maps to product properties, 62443-4-1 maps to the vulnerability-handling process." -->

| IEC 62443 practice area | What it governs | Annex I essential-requirement family it speaks to |
|---|---|---|
| **62443-4-2 FR1**: Identification & authentication control | Unique identity and authentication of users, processes, and devices | Protection from unauthorised access; identity and authentication management |
| **62443-4-2 FR2**: Use control | Authorisation, least privilege, session control | Secure-by-default configuration; access control to functions and data |
| **62443-4-2 FR3**: System integrity | Integrity of firmware, data, and commands in storage and transit | Protection of the integrity of stored, transmitted, and processed data |
| **62443-4-2 FR4**: Data confidentiality | Encryption of data at rest and in transit | Confidentiality, including encryption of stored and transmitted data |
| **62443-4-2 FR5**: Restricted data flow | Segmentation, zones and conduits, interface control | Minimisation of attack surface, including external interfaces |
| **62443-4-2 FR6**: Timely response to events | Security logging, audit trail, monitoring | Recording and monitoring of security-relevant internal activity |
| **62443-4-2 FR7**: Resource availability | Resilience, DoS resistance, safe degradation | Availability of essential functions; resilience against denial-of-service |
| **62443-4-1 SR/SD**: Security requirements & secure by design | Threat modelling, requirement definition, design review | Risk-appropriate design; released without known exploitable vulnerabilities |
| **62443-4-1 SUM**: Security update management | Secure, timely delivery of updates | Provision of security updates, with automatic or opt-in and rollback where relevant |
| **62443-4-1 DM**: Management of security defects | Intake, triage, and remediation of reported vulnerabilities | Vulnerability handling (Annex I, Part II): address without delay; coordinated disclosure |
| **62443-4-1 SG**: Security guidelines | Documentation for secure deployment and use | Secure-by-default plus user-facing security guidance |

Two things fall out of the table. The product-property requirements in Annex I map cleanly onto the 62443-4-2 foundational requirements, because both are asking the same question: what must the thing technically do to resist attack. The vulnerability-handling requirements map onto 62443-4-1, because both govern how you run the process around the product across its supported life. If your organisation already certifies to 62443, you are not starting the CRA from zero. You are re-cutting evidence you largely already generate into the shape Annex I asks for, and that re-cut is available before a single citation appears in the Journal.

None of this changes which conformity route your product takes. That is fixed by the product's class, and I walked the class-by-class routing in [EP 7.01](/blog/ep-7.01-self-assessment-vs-notified-body-modules-a-b-c-h). What presumption changes is how much discretion sits inside whichever route you are on. Even on the self-assessment route, presumption is what lets your own signed declaration rest on a published standard instead of a defensible-but-arguable in-house judgment. On a notified-body route, it is what narrows the audit from an open inquiry into a conformance check. You can line your product's requirements up against the families above in the [conformity workspace](/demo).

Aligning to 62443 is not the gamble. That part is simply good practice, and you should do it whether or not the CRA existed. The gamble is the question no one can answer yet: how far will the harmonised standard, when it is finally cited, drift from the draft you built against? If it lands close, early alignment was cheap insurance. If a late revision moves a requirement, a threshold, or a test method, some of the evidence you generated has to be regenerated against the version that actually carries the presumption. You are placing a bet on a document still being written, while the deadline advances whether you bet or not. The teams that will sleep in 2027 are the ones who placed that bet deliberately, wrote down which draft they built to, and kept enough slack to re-cut their evidence the week the Journal finally prints the ticket.
