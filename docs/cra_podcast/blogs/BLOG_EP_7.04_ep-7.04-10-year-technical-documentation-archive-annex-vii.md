---
id: "EP_7.04"
canonical_code: "EP_7.04"
title: "The 10-Year Technical File: What Annex VII Requires and How to Archive It"
subtitle: "A market-surveillance authority can ask for your technical documentation eight years after you shipped, and the file has to still exist, still be complete, and still be provably unaltered. This is the records job hiding inside the conformity job."
slug: "ep-7.04-10-year-technical-documentation-archive-annex-vii"
series_id: 7
episode_number: 4
series: "Conformity Assessment, Audits & CE Marking"
target_persona: "Records Managers, Quality Directors, Compliance Archivists."
persona_category: "Quality & Notified Bodies"
statutes: ["Article 31", "Annex VII", "Article 13(13)"]
statutory_domain: "Conformity Assessment & Technical Documentation"
difficulty: "Intermediate"
key_metric: "10-year retention floor (Art 13(13))"
read_time: "8 min read"
duration: "13:40"
audio_url: "https://oxot.ai/audio/cra_podcast/EP_7.04.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["Cyber Resilience Act", "Regulation (EU) 2024/2847", "Annex VII", "technical documentation", "Article 31", "records retention", "SBOM", "Quality & Notified Bodies", "Industrial OT Security"]
takeaways: ["What Annex VII actually lists, and which team owns each item", "The retention clock is 10 years or the support period, whichever is longer, and it survives every reorg", "How to archive the compliance package so it is retrievable and provably unaltered a decade later"]
---

# The 10-Year Technical File: What Annex VII Requires and How to Archive It
*By Jim McKenney — Digital Product Security Consultant & Industrial OT Architect*

It is 2036. A market-surveillance authority opens a file on a controller your company placed on the market in 2028, and asks to see the technical documentation. The product line was sold to another firm in a 2031 acquisition. The engineer who wrote the risk assessment left in 2030. The files lived in a SharePoint tenant that was decommissioned during a cloud migration in 2033, then restored from backup into a new tenant with different folder paths and different access controls. The person who receives the authority's request has never seen the product.

That is the moment the technical file is really tested. Not at first CE marking, when everyone is paying attention and the folder is fresh, but years later, when the request lands on a desk that has no institutional memory of the product and every intervening event has tried to lose your documents. The Cyber Resilience Act gives you a decade-long obligation to produce that file on demand, and the obligation does not care about your reorgs.

This is a records and infrastructure problem wearing a compliance costume. The conformity work builds the file. The archiving work is what makes it survive.

<!-- IMAGE-SLOT: ep-7.04-hero | 1200x630 | alt: "An archival storage room with a single sealed evidence box labeled with a product name and a cryptographic hash, retrieved under a desk lamp, dated years in the future" | caption: "The file is tested years after shipping, when nobody in the room remembers the product." -->

## What the file has to contain

The technical documentation obligation lives in Article 31: the file must hold everything you used to show the product and your processes meet the essential requirements, and it must "at least contain the elements set out in Annex VII." Annex VII is the actual contents list. It is not a vague call for "your paperwork." It enumerates eight things, and each one is produced by a different part of your organization, on a different cadence.

The reason so many files fail an audit is not that a company refuses to keep records. It is that the eight items are scattered across product management, engineering, the security team, the test lab, and compliance, and no one owns the assembled whole. Here is the map from each Annex VII item to where it comes from.

<!-- IMAGE-SLOT: ep-7.04-contents | 1200x800 | alt: "A flat infographic mapping the eight Annex VII contents items to the teams that produce them: product management, engineering, PSIRT, manufacturing, risk, compliance, and the test lab, all feeding one sealed technical-file archive" | caption: "Eight items, six owners, one file. The assembly is the job nobody is assigned." -->

| Annex VII item | What it is | Where it comes from |
|---|---|---|
| 1. General description | Intended purpose, the software versions that affect compliance, photos and internal layout for hardware, and the user information required by Annex II | Product management and technical writing |
| 2. Design, development, production & vulnerability handling | Architecture drawings and how components integrate; the vulnerability-handling specs including the SBOM, the coordinated-disclosure policy, the reporting contact, and how you distribute updates securely; the production and monitoring processes | Engineering, the PSIRT/security team, manufacturing |
| 3. Cybersecurity risk assessment | The documented assessment showing how the Annex I essential requirements apply to this product | Security and risk engineering |
| 4. Support-period rationale | The information you weighed to set the support period | Product management / lifecycle owner |
| 5. Standards list | The harmonised standards, common specifications, or certification schemes you applied — and where you did not apply them, a description of the solutions you used instead | Compliance and standards |
| 6. Test reports | The reports proving the product and the vulnerability-handling processes conform to Annex I | Test and QA |
| 7. EU declaration of conformity | A copy of the signed DoC | Regulatory / quality sign-off |
| 8. SBOM (on request) | The software bill of materials, furnished on a reasoned request from a market-surveillance authority | Build system / PSIRT |

A boundary note on two of the rows, so this post stays in its lane. The declaration of conformity at item 7 is a document with its own structure and its own drafting discipline, covered in [the EU Declaration of Conformity episode](/blog/ep-7.03-eu-declaration-of-conformity-annex-v-drafting); here it is simply one artifact that has to be in the box. And the depth of item 6, the test reports, depends on whether you self-assessed or went through a notified body, which is the whole subject of [the conformity-route episode](/blog/ep-7.01-self-assessment-vs-notified-body-modules-a-b-c-h). This post owns the container, not those two items.

## The file is a living record, not a frozen PDF

Article 31 says the documentation is drawn up before the product is placed on the market and then "continuously updated, where appropriate, at least during the support period." That single clause reshapes the whole archiving problem. You are not preserving one dated snapshot. You are preserving a record that legitimately changes: a revised risk assessment after an incident, a new SBOM after a dependency update, an added standard, a new software version that affects compliance.

So the archive has to answer two questions at once. What did the file say the day you shipped, and what does it say now? A store that can only show the latest state has lost the history an auditor may want. A store that only kept the original has ignored the update duty. The design has to hold versions, with dates, all retrievable.

## The retention clock, and the two it gets confused with

The keep-it duty is Article 13(13): manufacturers keep the technical documentation and the EU declaration of conformity at the disposal of market-surveillance authorities for at least 10 years after the product was placed on the market, or for the support period, whichever is longer. For industrial products the support period is rarely short, so "whichever is longer" is usually the operative phrase. A controller with a twelve-year support commitment carries a twelve-year file, not a ten-year one.

Retention gets blurred with a different clock that also mentions ten years: the duty to keep each *security update* downloadable after you issue it. That one is about distribution to users, not evidence for regulators, and it is the closeout obligation that [the incident final-report episode](/blog/ep-6.06-the-14-day-final-closeout-root-cause-analysis-tech) owns. Keep them separate in your head: one is a filing-cabinet duty for authorities, the other is a keep-it-fetchable duty for operators.

There is also a parallel duty you may inherit through your supply chain. If you import a product with digital elements into the EU, Article 19 requires you to keep a copy of the declaration of conformity available and to be able to produce the technical documentation to authorities on request, for the same ten-years-or-support-period floor. An importer who cannot reach the manufacturer's file has not discharged that duty by pointing at the manufacturer. The obligation is theirs to satisfy.

## Building an archive that survives a decade

The conformity team assembles the file. The records team has to make it survive acquisitions, cloud migrations, and a full turnover of staff. Three properties do that work.

**Retrievable by identity, not by memory.** The unit of retention is the product-plus-version, so index the archive by the thing the authority will name: the product identifier and the software versions that affect compliance. The person answering a 2036 request should be able to type a model number and get the assembled file, without knowing who built it or which former team's drive it lived on. If retrieval depends on tribal knowledge, the file is already lost; it just does not know it yet.

**Provably unaltered.** An authority is entitled to the documentation as it stood, and a file you cannot prove is intact is weak evidence. Hash every artifact when you file it, with a standard algorithm such as SHA-256, and keep a signed manifest listing each file and its hash. When you retrieve the package in year eight, you re-hash it and compare against the manifest. Matching hashes prove the copy is bit-identical to what you filed; a mismatch tells you the store corrupted a file or someone edited an artifact. Because the update duty means the file changes over time, hash each *version* and timestamp the manifest, so you can show both the original state and every revision, each provably intact. Write the archive to immutable, write-once storage so a later edit cannot quietly overwrite history.

**Custody that outlives the org chart.** A technical file is an asset that has to move cleanly through the events that normally scramble records. In an acquisition, the file transfers with the product line, and the receiving entity inherits the retention clock already running; that transfer is a due-diligence line item, not a nice-to-have. In a cloud migration, folder paths and tenants change, but the hash manifest does not: re-host the bytes anywhere and the manifest still proves provenance, which is exactly why hashing matters more than any particular storage vendor. And against staff turnover, the archive cannot depend on one engineer's laptop, one person's logins, or one team's undocumented conventions. The test is blunt: if the only people who can find and validate the file leave, can the next person still produce it on demand?

<!-- IMAGE-SLOT: ep-7.04-hash | 1000x600 | alt: "A tamper-evidence chain: dated versions of the technical file each carrying a SHA-256 hash, feeding one signed timestamped manifest, with a re-hash-and-compare check at a future retrieval date" | caption: "Hash every version into a signed manifest. Re-hashing in year eight proves the file is the one you filed." -->

## Before you file

When a product ships and the technical file is assembled, run this before you consider the record closed. It is the difference between a file that exists and a file that will still answer a request a decade out.

1. **All eight Annex VII items present and attributed.** Walk the list. For each, name the owning team and confirm the current artifact is in the box, including the DoC and the design, risk, and test material.
2. **Indexed by product and compliance-affecting version**, so the file is retrievable by the identifiers an authority will actually cite.
3. **Hashed with a signed manifest.** Every artifact carries a SHA-256 hash; the manifest is signed and timestamped so intactness is provable years later.
4. **Versioned, not overwritten.** The original and every subsequent revision are retained with dates, on write-once storage, to honor the continuous-update duty.
5. **Retention clock set to the longer figure.** Ten years from placing on the market, or the end of the support period, whichever is later — computed per product, not by a blanket policy.
6. **Custody documented for transfer.** The archive can move through an acquisition or a cloud migration with its provenance intact, and no single departure can strand it.

Six lines. The first three make the file complete and trustworthy today. The last three are the ones a market-surveillance authority will silently test in a year you are not thinking about, on a desk that has never heard of the product. Build the archive so that desk can still say yes.

Ready to see how a technical file assembles and holds together across a product's life? Walk through it in the [OXOT demo](/demo).
