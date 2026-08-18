---
id: "EP_6.02"
canonical_code: "EP_6.02"
title: "Building a Product Vulnerability-Handling Function That Meets Annex I"
subtitle: "Your corporate SOC protects your email. A product vulnerability-handling function is a different org with a different job: keeping shipped products legal to sell. Here is how an industrial OEM stands one up from nothing."
slug: "ep-6.02-building-an-annex-i-compliant-psirt-roles-playbook"
series_id: 6
episode_number: 2
series: "Vulnerability Operations, PSIRT & 24h Clocks"
target_persona: "Product Security Leads, Hardware Engineering VPs, DevSecOps."
persona_category: "Hardware & Embedded OEMs"
statutes: ["Annex I Part II", "Article 13(6)", "Article 13(8)", "Article 13(17)"]
statutory_domain: "Vulnerability handling (Annex I Part II)"
difficulty: "Advanced Engineering"
key_metric: "Annex I Part II — 8 standing duties"
read_time: "8 min read"
duration: "14:15"
audio_url: "https://oxot.ai/audio/cra_podcast/EP_6.02.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["Cyber Resilience Act", "Regulation (EU) 2024/2847", "Annex I Part II", "vulnerability handling", "PSIRT", "SBOM", "coordinated vulnerability disclosure", "product security team", "Industrial OT Security"]
takeaways: ["A one-page charter that gives the function authority to hold a shipment", "Severity scoring as a tool you choose (CVSS v4 or SSVC), never a legal requirement", "The minimum tooling stack: intake, SBOM index, tracker, advisory channel"]
---

# Building a Product Vulnerability-Handling Function That Meets Annex I
*By Jim McKenney — Digital Product Security Consultant & Industrial OT Architect*

Your corporate SOC watches your email, your VPN, and the laptops your staff carry. It is good at that. Ask it which firmware version shipped on the 4,000 drive controllers you sold into water utilities in 2023, whether any carry a vulnerable OpenSSL build, and how you would push a signed patch to the units still in service, and you get a blank stare. That is not a failure of the SOC. It is the wrong org. The SOC defends *your* network. The Cyber Resilience Act asks you to run a different function: one that defends *the products you already sold*, for as long as they are supported.

That function does not have a name in the Regulation. "PSIRT" is industry vocabulary, not a CRA term. What the CRA actually requires is a **process**: the vulnerability-handling duties in **Annex I Part II**, plus a set of manufacturer obligations that assume someone inside your company does that work every day. A PSIRT is simply how you operationalise those clauses. Build the team to serve the clauses, not the acronym, and you get something defensible. Build it the other way and you get an org chart with nothing behind it.

This is a build guide: what to charter, who owns what, how to score severity without pretending the score is a legal requirement, and the smallest tooling stack that works.

<!-- IMAGE-SLOT: ep-6.02-hero | 1600x900 | alt: "Industrial OEM product-security team at a workbench reviewing a vulnerability tracker beside a physical drive controller on the bench" | caption: "Not a SOC. The product vulnerability-handling function works against shipped hardware and its firmware, across the whole support period." -->

## Start from the clauses, because the clauses are the job description

Before you draw an org chart, read what Annex I Part II makes manufacturers *do*. There are eight duties, and every one of them is a standing responsibility, not a project that finishes:

1. **Identify and document** vulnerabilities and components, including a software bill of materials (SBOM) in a machine-readable format covering at least top-level dependencies.
2. **Remediate without delay** with security updates; where technically feasible, ship security fixes separately from feature updates.
3. **Test and review** the product's security regularly.
4. **Disclose fixed vulnerabilities** once an update ships, with enough detail for users to identify affected products and act (a narrow carve-out lets you delay publication until users can patch, where the disclosure risk outweighs the benefit).
5. **Enforce a coordinated vulnerability disclosure policy.**
6. **Facilitate reporting**, including a published contact address for your product and its third-party components.
7. **Distribute updates securely**, and automatically where applicable.
8. **Disseminate updates without delay**, free of charge for most products, with advisory messages telling users what to do.

Read as a group, these are not eight tasks. They are the operating remit of a team that has to *find* problems, *fix* them, *tell people*, and *prove it happened* — repeatedly, for years. Article 13(8) makes the time horizon explicit: vulnerabilities must be handled effectively across the whole support period you declared, not just at launch. So the first design decision is not tooling. It is accepting that this is a permanent line function with a budget, like QA.

## The charter: one page, and it must grant the authority to stop a shipment

Most product-security teams fail quietly. Not because they can't score a CVE, but because when they say "this build should not ship," someone with a revenue number overrules them, and there is nothing on paper that says they can't. A charter fixes that. Keep it to a page. It needs five things:

- **Scope.** Which product lines, which firmware trees, which support periods. Name them. A function with fuzzy scope defends nothing.
- **Trigger-to-act mandate.** The explicit authority to open an investigation on any credible report, and to *recommend or block* a release when an unresolved issue crosses a defined severity line. Write down who can override that block and how the override is recorded. An override that leaves no trace is how "we knew and shipped anyway" surfaces later, in front of a market surveillance authority.
- **The single point of contact.** Article 13(17) requires a contact that lets users reach you *directly and rapidly* to report vulnerabilities. Keep it easy to find, list it in the user information under Annex II, and let reporters pick their channel instead of forcing everyone through a form. The charter names who staffs that inbox and the acknowledgement clock they promise.
- **Upstream duty.** Article 13(6) is the obligation people forget. Find a flaw in a component you integrated, open source included, and you must report it back to whoever makes or maintains that component; if you built a fix, share the code or documentation with them. Your function is not only a consumer of advisories. It is a source of them. Put that in writing so it gets resourced.
- **Records.** Every report, decision, and disclosure is evidence. State where it lives and how long it is kept. Your future self, mid-incident, will thank you.

The charter is where you spend your political capital once, up front, so you don't have to re-fight the authority question during an actual incident.

## Roles: map capabilities to people, then right-size

You do not need a large team. You need every capability owned by a named person, even if one person owns several. The table maps the Annex I Part II duties to capabilities and shows a realistic split for a small OEM versus one large enough to specialise. Titles matter less than the fact that no row is unowned.

| Capability | Annex I Part II anchor | Small OEM (owner) | Larger OEM (owner) |
|---|---|---|---|
| Intake & single point of contact | Clause 6 · Art 13(17) | Product-security lead | Triage analyst / duty rota |
| SBOM & component inventory | Clause 1 | Build/release engineer | SBOM owner in DevSecOps |
| Triage & severity call | Clauses 2–3 | Product-security lead | PSIRT triage board |
| Fix engineering & regression | Clause 2 | Firmware team (tasked) | Sustaining-engineering pod |
| Secure update delivery | Clauses 7–8 | Release engineer | Release + update-infra team |
| Advisory drafting & disclosure | Clauses 4–5 | Product-security lead + comms | Technical writer + PSIRT |
| Upstream component reporting | Art 13(6) | Whoever found it | SBOM owner |

<!-- IMAGE-SLOT: ep-6.02-function-map | 1400x1000 | alt: "Flat infographic mapping the eight Annex I Part II vulnerability-handling duties to five function capabilities and their owning roles" | caption: "The eight duties of Annex I Part II, collapsed into the standing capabilities a product-security function has to own." -->

Two staffing realities decide whether this works. First, the triage owner needs a direct line to whoever controls the release train, because remediation "without delay" is meaningless if the fix waits three months for the next scheduled build. Second, the person who signs off on a public advisory should not be the person who wrote the vulnerable code. That is not distrust. It is the same reason auditors don't audit their own work.

## Severity scoring: a tool you pick, not a rule the CRA hands you

Teams routinely get this backwards. The CRA tells you to remediate "without delay" and to give users enough information to judge and act. It does **not** tell you to use CVSS, and it sets no numeric threshold. Any scoring framework you adopt is a decision-support tool you chose to make triage consistent and explainable. It is not the law. Never write "CRA requires CVSS 7.0" in a policy, because it doesn't.

> **Framework sidebar (not statute).** Two common choices, neither mandated by the CRA:
> **CVSS v4.0** gives a reproducible severity number and is what most researchers and customers already speak. Its weakness in OT: the base score knows nothing about whether the device sits on an isolated network or drives a physical process.
> **SSVC** (Stakeholder-Specific Vulnerability Categorization) skips the number and walks a decision tree (is it exploited, is it exposed, what is the mission impact?) to output an action: track, attend, or act now. For industrial equipment where "exploitable" depends heavily on deployment, SSVC often maps better to what you actually decide.
> Many OEMs use CVSS for the customer-facing severity label and SSVC internally to decide *how fast* they move. Pick deliberately, write down the mapping from output to action, and apply it the same way every time. Consistency is the point; the specific framework is your call.

Your scoring model feeds the trigger line in the charter. Score is an input to a decision; the decision is what the regulation cares about.

## The tooling stack: four boxes, and none of them are exotic

You can run a compliant function on modest tooling. What you cannot do is run it on nothing and reconstruct the evidence later. Four capabilities:

1. **Intake.** A monitored contact address and reporting channel behind the single point of contact. An inbox plus a ticket is enough to start. What matters is that reports are acknowledged and never lost.
2. **A component index you can query.** Your SBOMs are only useful if, when a new OpenSSL or libcurl CVE lands, you can answer "which shipped products contain the affected version?" in minutes, not weeks. Store SBOMs so they are searchable across products and firmware versions. VEX (Vulnerability Exploitability eXchange) documents let you record *"present but not exploitable, here's why,"* which saves you from patching what doesn't need it and gives customers a defensible answer.
3. **A case tracker** that carries each report from intake through triage, fix, and disclosure, with timestamps. The timeline is your proof that you acted without delay.
4. **An advisory channel.** A reliable way to publish machine-readable advisories to affected users.

Deliberately, this post stops at the boundary of your function. The 24-hour and 72-hour reporting clocks to ENISA belong to a different workflow: see [the 24-hour early-warning operations post](/blog/ep-6.01-the-24-hour-early-warning-panic-operationalizing-t). Writing advisories that inform customers without arming attackers is its own discipline, covered in [the customer-advisories episode](/blog/ep-6.05-customer-security-advisories-drafting-bulletins-wi). The researcher-facing disclosure policy is [handled here](/blog/ep-6.03-coordinated-vulnerability-disclosure-cvd-handling-). This function feeds all three; it does not replace them.

## The one number, stated once

There is a reason the boardroom eventually funds this. Non-compliance with the Annex I essential requirements and the manufacturer obligations in Articles 13 and 14 sits in the CRA's top penalty band under Article 64(2): up to €15 million or 2.5% of worldwide annual turnover. That is a ceiling a regulator reaches for after a serious, sustained failure, not an automatic invoice for a missed patch, and quoting it as one is fear dressed as compliance. The real reason to build the function is duller and more certain: without it, you cannot honestly sign the declaration of conformity, and a product you cannot lawfully declare conform is a product you cannot lawfully sell.

A vulnerability-handling function is not a compliance artefact you produce for an audit. It is the standing machinery that keeps a promise you made when you shipped: that someone is still watching this product, still able to fix it, and still able to tell you when it needs fixing. Charter it so it can act, staff it so no duty is orphaned, and score so your decisions are consistent. Do those three things and the acronym takes care of itself.
