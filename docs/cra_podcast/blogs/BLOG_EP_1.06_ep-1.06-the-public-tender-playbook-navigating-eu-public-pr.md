---
id: "EP_1.06"
canonical_code: "EP_1.06"
title: "The Public Tender Playbook: Navigating EU Public Procurement Directives under CRA"
subtitle: "You can require CRA conformity in a public tender without inviting an administrative-court appeal — but only if you separate the mandatory legal floor from the criteria you actually score."
slug: "ep-1.06-the-public-tender-playbook-navigating-eu-public-pr"
series_id: 1
episode_number: 6
series: "The Procurement & Contracting Crisis"
target_persona: "Municipal Water Authorities, Public Transport Authorities, Hospital Networks."
persona_category: "Plant CISOs & Asset Owners"
statutes: ["Regulation (EU) 2024/2847 Art. 5", "Regulation (EU) 2024/2847 Art. 6", "Directive 2014/24/EU"]
statutory_domain: "Contracting & Procurement"
difficulty: "Executive Policy"
key_metric: "CRA conformity as a lawful award gate"
read_time: "8 min read"
duration: "14:15"
audio_url: "https://oxot.ai/audio/cra_podcast/EP_1.06.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["Cyber Resilience Act", "Regulation (EU) 2024/2847", "EU public procurement", "Directive 2014/24/EU", "public tender cybersecurity", "CE marking", "Annex I essential requirements", "non-discriminatory tender criteria"]
takeaways: ["A two-layer tender structure that separates the mandatory legal floor from scored award criteria", "A minimum mandatory cybersecurity criteria table you can paste into a specification", "A weighted scoring matrix for the security attributes above the legal floor", "How to handle the CE-marking timing gap before 11 December 2027"]
---

# The Public Tender Playbook: Navigating EU Public Procurement Directives under CRA

*By Jim McKenney — Digital Product Security Consultant (Industrial OT, CRA, IEC 62443)*

<!-- IMAGE-SLOT: hero | 1200x630 | alt: "A public procurement specification split into a mandatory pass/fail floor and a weighted scoring layer, with a CRA CE mark gate between them" | caption: "The defensible tender is two layers: a mandatory legal floor everyone must clear, and a scored layer above it." -->

A water authority disqualifies the low bidder because its SCADA gateway has no CRA conformity story. Three weeks later, a letter from the vendor's lawyers lands: *discriminatory technical specification, disproportionate selection criteria, we're filing with the administrative court.* The award is frozen, the project slips two quarters, and the procurement officer is now explaining to the council why the cheapest bid didn't win.

This is the trap every municipal water authority, transport operator, and hospital network walks into when they try to bolt cybersecurity onto a tender. They treat "must be CRA-compliant" as a preference they're expressing — and preferences that knock out a specific vendor are exactly what public procurement law lets that vendor challenge. The fix is not to soften the requirement. It's to stop framing mandatory law as a preference at all.

## "No CRA" is a fact about the product, not an opinion about the vendor

Start from what the Cyber Resilience Act actually says, because it removes the argument entirely. Under **Regulation (EU) 2024/2847, Article 6**, a product with digital elements may be made available on the EU market *only* if it meets the essential cybersecurity requirements in Annex I; conformity is then declared in the EU Declaration of Conformity and carried by the CE marking. From **11 December 2027**, that is not a nice-to-have — it is the condition of legal sale. A PLC, an RTU, a networked pump controller, or a hospital infusion gateway that cannot demonstrate CRA conformity is a product that, after that date, cannot lawfully be placed on the market.

And procurement is named explicitly. **Article 5(2)** says that, without prejudice to the public procurement directives, where in-scope products with digital elements are procured, Member States shall ensure that compliance with the Annex I essential requirements — *including the manufacturer's ability to handle vulnerabilities effectively* — is taken into consideration in the procurement process. The regulation anticipates that public buyers will build this in.

That reframing is the whole game. Requiring CRA conformity is not you preferring one vendor's security posture over another's. It is you requiring that the thing you buy is legal to sell. A vendor that cannot meet a mandatory legal requirement applying equally to every economic operator has no discrimination claim, because nothing about the requirement is specific to them.

> [!NOTE]
> This is procurement and engineering guidance, not legal advice. National transposition of the procurement directives varies, and your legal team owns the final wording. What follows is the structure I use to keep tenders defensible.

## Where tenders actually get challenged

The challenge risk under **Directive 2014/24/EU** does not come from the *substance* of a CRA requirement. It comes from two structural mistakes.

**Mistake one: dressing up a brand-specific spec as a technical requirement.** The directive's core principles demand equal treatment, non-discrimination, and proportionality, and require that technical specifications afford equal access without creating unjustified obstacles to competition. If your "cybersecurity" criteria happen to describe exactly one manufacturer's datasheet — a specific secure-boot chip, a proprietary attestation format — you've written a spec that fails proportionality regardless of how you label it. CRA conformity, by contrast, is standard-neutral: it points at Annex I outcomes, not one vendor's implementation.

**Mistake two: demanding proof that cannot exist yet.** We are in the transition window. Entry into force was **10 December 2024**; the manufacturer reporting obligations under **Article 14** begin **11 September 2026**; full CE-marking obligations bite on **11 December 2027**. If a tender awarded today demands an *affixed CRA CE mark on delivery* for a product line where that obligation hasn't landed, you've created a requirement no honest bidder can meet — which is itself disproportionate and challengeable. The defensible move is to require a credible conformity trajectory and contractual warranties now, and the CE mark at the point the law actually requires it.

## The two-layer structure: a mandatory floor, then a scored ceiling

Here is the structure that survives an appeal. Split every cybersecurity requirement into two layers, and never mix them.

**Layer 1 — the mandatory floor (pass/fail).** These are minimum requirements tied directly to the subject matter of the contract and anchored to mandatory law. They are not scored. A bid either clears them or it is excluded on objective grounds. Because the floor is grounded in Annex I and CE obligations that apply to all vendors, exclusion here is defensible.

**Layer 2 — the scored ceiling (award criteria).** Above the legal floor, cybersecurity quality varies between compliant products — support-period length, patch SLAs, SBOM depth. The procurement directive lets you score these as part of the most economically advantageous tender, using a published, weighted matrix. This is where a *better* security posture legitimately wins points, and because everyone who reached this layer already cleared the mandatory floor, no one can claim they were unlawfully shut out.

The disqualification the vendor's lawyers wanted to challenge now happens at Layer 1, on objective mandatory-law grounds — not at Layer 2, where a discretionary scoring decision would be the soft target.

## Artifact 1 — Minimum mandatory cybersecurity criteria (Layer 1, pass/fail)

Paste this into the technical specification. Every row is pass/fail. Phrase each as an outcome tied to Annex I, not a product feature.

| # | Mandatory requirement | Statutory anchor | Evidence at bid |
|---|---|---|---|
| M1 | Product falls in CRA scope and the bidder confirms the applicable conformity route (self-assessment vs. notified body for important/critical products) | Reg. 2024/2847 Art. 6–8 | Written scope determination + product classification |
| M2 | Product meets the Annex I Part I essential requirements (secure-by-default configuration, no known exploitable vulnerabilities at release, protection of data in transit/at rest) | Reg. 2024/2847 Art. 6, Annex I | Gap statement mapped to Annex I; harmonised-standard or EUCC references where available |
| M3 | Documented vulnerability handling process covering the declared support period, including coordinated disclosure and free security updates | Reg. 2024/2847 Art. 13, Annex I Part II | Vulnerability-handling policy + stated support-period end date |
| M4 | Machine-readable SBOM covering at least top-level dependencies, kept current for the support period | Reg. 2024/2847 Annex I Part II | Sample SBOM (CycloneDX or SPDX) for the offered version |
| M5 | Capability to meet the Art. 14 reporting regime — 24-hour early warning of an actively exploited vulnerability to the coordinating CSIRT and ENISA | Reg. 2024/2847 Art. 14 | Description of the reporting workflow and responsible function |
| M6 | CE marking and EU Declaration of Conformity present at the point the law requires it (on delivery for products placed on the market on/after 11 Dec 2027) | Reg. 2024/2847 Art. 6, 28, 30 | DoC on delivery; pre-2027, a dated conformity roadmap + contractual warranty (see M7) |
| M7 | Contractual warranty that the product will be CRA-conformant and CE-marked before the applicable obligation date, with a right to remedy or terminate on failure | Directive 2014/24/EU Art. 70 (contract performance conditions) | Signed warranty clause |

M6 and M7 are the pair that closes the timing gap without inventing an impossible requirement.

## Artifact 2 — Tender scoring matrix (Layer 2, award criteria)

Only bids that cleared all of Layer 1 reach this matrix. Publish the weights in the tender documents before bids open — undisclosed weighting is itself a ground for challenge.

| Award criterion | What good looks like | Weight | Scoring (0–5) |
|---|---|---|---|
| Support-period length | Committed security-update period beyond the mandatory minimum for the asset's expected service life | 25% | 0 = minimum only; 5 = covers full asset lifecycle (e.g. 10+ yrs) |
| Vulnerability response SLA | Time from actively-exploited disclosure to available patch, contractually committed | 20% | 0 = "best effort"; 5 = defined SLA with penalties |
| SBOM depth & currency | Transitive-dependency coverage, update cadence, standard format | 15% | 0 = top-level only; 5 = full transitive, auto-refreshed |
| Secure-by-design evidence | Independent conformity assessment or EUCC certificate vs. self-declaration | 15% | 0 = self-declared; 5 = notified-body / EUCC ‘substantial’+ |
| Integration & segmentation fit | Alignment with the buyer's IEC 62443 zones/conduits and OT network architecture | 15% | 0 = no OT context; 5 = documented zone/conduit design |
| Operational patchability | Ability to patch without unplanned process downtime (e.g. dual-bank / staged update) | 10% | 0 = full outage required; 5 = live/staged update path |

Weight the criteria to your risk profile — a hospital network will push M5/response-SLA higher; a water authority may weight support-period length and patchability for 20-year field assets. What matters is that the weights are objective, disclosed, and tied to the subject matter.

<!-- IMAGE-SLOT: scoring-matrix | 1200x675 | alt: "Weighted tender scoring matrix showing six cybersecurity award criteria with percentage weights and a 0-to-5 scoring scale" | caption: "Score security quality only above the mandatory floor — with weights published before bids open." -->

## The evidence you ask for — and the presumption that saves everyone time

Do not ask bidders to re-prove conformity from first principles. **Article 27** gives you a shortcut: products conforming to harmonised standards published in the Official Journal, or holding a certificate under a European cybersecurity certification scheme (EUCC) at assurance level 'substantial' or above, are *presumed* conformant with the Annex I requirements those standards cover. Accept that presumption as evidence. It lowers your evaluation burden and rewards vendors who did the certification work, without you having to audit source code.

For the mandatory floor, the document set is small and specific: the EU Declaration of Conformity, the relevant slice of technical documentation, a current SBOM, the vulnerability-handling policy with a stated support-period end date, and the Art. 14 reporting workflow. If a bidder can't produce those, that's your objective exclusion — not a matter of taste.

## Why the discipline is worth it

Non-compliance with the Annex I essential requirements and the Article 13/14 manufacturer obligations carries administrative fines of up to **€15,000,000 or 2.5% of worldwide annual turnover**, whichever is higher (Article 64(2)). Those fines land on economic operators — but a public body that awards a contract for a non-conformant product inherits the operational fallout: an asset it may not be able to lawfully operate, a mandated recall mid-deployment, and a re-tender. Whether a public authority can itself be fined is left to each Member State under Article 64(7), which is precisely why you don't want to be the test case.

Write the tender so the mandatory floor does the disqualifying and the scoring matrix does the choosing. Do that, and the disqualified vendor has nothing to appeal — because you never expressed a preference. You required legal products, then bought the best one.

Three ways to take it further, in the order that helps most. Read the underlying obligations — Articles 5, 6, 14, 27, and 64 — in the [interactive CRA statute](/wiki/cra), so your legal team is drafting against the source, not a summary. Then [take the tour](/tour) to see a conformity dossier mapped onto the two-layer structure above. And when you're ready to test it against real bids, [book a demo](/demo) and run one of your own product lines through the mandatory floor and the scoring matrix.
