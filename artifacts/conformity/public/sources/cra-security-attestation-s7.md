<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# in the NIS2 inpact the CRA class or type rating or requirements? how are they really intertwined ? what is the actual relatiopnsp between nis2 and CRA? for example the Simatic S7 PLC by Siemens - is that a Typical CRA class 1 or class 2 - can it be both or is it just one?

This is a nuanced regulatory architecture question. I have everything needed to give a precise, authoritative answer directly without creating a report artifact.

## The Core Distinction: Product Law vs. Organisational Law

NIS2 and CRA are fundamentally **different types of law that attach to different subjects** — but they are deliberately interlocked at specific points:[^1]

- **CRA** = *product law*. It follows the product wherever it is sold in the EU. It binds the **manufacturer**, regardless of company size or sector.[^1]
- **NIS2** = *organisational law*. It follows the **operating entity** (the utility, hospital, water authority, etc.) in a listed critical sector. It says nothing directly about which products manufacturers must build.[^2][^1]

The shortest test: *if you pulled your product from the EU market tomorrow, your CRA obligations stop. Your NIS2 obligations — if you have them as a company — do not, because they are attached to your organisation, not what you ship*.[^1]

***

## How NIS2 Directly Affects CRA Classification

Here is the actual mechanism — it is baked into **Annex III Part II of CRA and Implementing Regulation (EU) 2025/2392**:

> *"Industrial Automation and Control Systems (IACS) intended for use by entities identified under NIS2 Annex I — such as PLCs, DCS, CNC, and SCADA — are **Important Class II**."*[^3][^4]

The phrase **"intended for use by"** is the legal trigger. It does **not** mean "accidentally installed at" — it refers to the **manufacturer's declared intended use** in their product documentation, marketing, and technical file.[^5][^4]

So NIS2's sector list is imported directly into the CRA classification decision:


| The product is intended for… | CRA IACS Class |
| :-- | :-- |
| NIS2 Annex I essential entities (energy, water, transport, health, digital infrastructure, critical manufacturing) | **Class II** — Mandatory NB |
| General manufacturing, food \& beverage, packaging, non-NIS2 sectors | **Class I** (likely) |
| Pure IT/monitoring with no control function | **Class I** or Default depending on function |


***

## The Siemens SIMATIC S7 — Can It Be Both?

This is the critical question, and the honest answer is: **it depends on what the manufacturer declares as intended use, and the same physical hardware can carry different CRA classifications depending on the product variant or the way it is placed on the market**.

### Siemens' actual approach

Siemens has stated publicly that their current strategy is to make SIMATIC products **CRA-compliant at Security Level SL2+**, which they assess to be "a fair basis for most projects". This is a deliberate hedging strategy that effectively positions the S7 product line to meet Class II baseline requirements even where Class I would technically suffice — because Siemens knows the same hardware goes into both types of customers.[^6]

Here is how the classification actually plays out for the S7 family:


| Product | If sold for NIS2-essential entity use (energy, water, transport) | If sold for general industry (food, packaging, consumer goods) |
| :-- | :-- | :-- |
| SIMATIC S7-1500 (networked) | **Class II** — Mandatory NB | **Class I** — NB required (no harmonised standard yet) |
| SIMATIC S7-1200 (networked) | **Class II** — Mandatory NB | **Class I** — NB required |
| SIMATIC S7-400 (legacy) | **Class II** — Mandatory NB (if still placed on market post-2027) | **Class I** |
| SIMATIC PCS 7 (DCS using S7 backbone) | **Class II** — energy/chemical/pharma customers | **Class I** |
| WinCC SCADA (running on S7 infra) | **Class II** — essential entities | **Class I** |

The S7-1500 already holds IEC 62443-4-2 conformity documentation, which positions it well for both Class I self-assessment and Class II NB assessment since the technical documentation is substantially shared.[^7]

### The "Intended Use" Problem in Practice

The key practical problem is: **Siemens cannot always control where their products end up**. An S7-1500 sold through a system integrator to a bottling plant may later be resold or repurposed for a water utility control system.

Under CRA, classification is determined at the point of **placing on the market** — based on the manufacturer's intended use declaration. If Siemens declares an S7-1500 variant as "for general industrial use" and markets it without NIS2-essential sector declarations, it is placed as Class I. If the customer then uses it in a water utility, the *customer's* NIS2 obligations (under NIS2 Article 21 supply chain requirements) are implicated — but the product's CRA classification at time of market placement does not retroactively change.[^8][^1]

However, if Siemens **knowingly markets a variant for energy sector SCADA**, that product must be Class II certified before it can carry CE marking.[^4]

***

## The Dual-Obligation Scenario: When a Company Faces Both

A manufacturer like Siemens, Schneider, or ABB can simultaneously be:

1. **Under CRA** as a manufacturer of PDEs (applies to every product) — for their S7, Modicon, AC500 product lines[^1]
2. **Under NIS2** as an essential or important *entity* themselves — if their own manufacturing operations qualify them as "Manufacturers of other transport equipment" or "Manufacturers of machinery and equipment" under NIS2 Annex II, at medium/large enterprise threshold[^1]

In that scenario, their *own factory's* OT systems fall under NIS2 Article 21 organisational obligations (risk management, supply chain vetting, incident reporting), while the *products they ship* fall under CRA. The compliance work overlaps significantly — the same SBOM practice, the same 24-hour incident reporting capability — but the legal obligations are distinct and reported to different authorities.[^1]

***

## The Reporting Channels Interlock

CRA and NIS2 reporting *connect* through ENISA as a routing hub:[^3]

- A **CRA manufacturer** who discovers an actively exploited vulnerability in their S7 must report to ENISA (and their national CSIRT) within 24 hours from 11 September 2026[^3]
- ENISA then forwards that notification to the **NIS2 national single points of contact** for affected member states, which alerts the essential entities operating those products[^3]

So a Siemens vulnerability disclosure flows: Siemens → ENISA → national CSIRTs → the energy utility's NIS2 supervisory authority → the utility itself. This is a designed pipeline — CRA generates the product-level intelligence, NIS2 pushes it to the operators.

***

## Summary: How to Think About the S7

The S7 is **one physical product** but can be placed on the EU market under **either Class I or Class II CRA classification depending on declared intended use**. It is not "both at once" for any single CE-marked product unit — each unit has one conformity assessment route. But across Siemens' portfolio, the same hardware family may span both classes depending on the product variant's declared scope and the markets it is sold into. Siemens' SL2+ strategy is a pragmatic response to this: build to Class II standards universally, then use the appropriate assessment route per product variant and customer segment.[^6]
<span style="display:none">[^10][^11][^12][^13][^14][^15][^16][^17][^18][^19][^20][^21][^22][^23][^24][^25][^9]</span>

<div align="center">⁂</div>

[^1]: https://scadable.com/blog/cra-vs-nis2

[^2]: https://ceur-ws.org/Vol-4171/paper_14.pdf

[^3]: https://graylog.org/post/understanding-the-cyber-resilience-act/

[^4]: https://www.securebydesignhandbook.com/blog/2025/11/28/cra-implementing-regulation-published

[^5]: https://www.linkedin.com/pulse/eu-cra-faq-summary-cyber-resilience-act-implementation-m210e

[^6]: https://assets.new.siemens.com/siemens/assets/api/uuid:5d4cd4b5-8cc4-4b06-a024-3c762d4853af/Securing-Building-Automation-with-BACnet-Secure-Connect.pdf

[^7]: https://docs.rs-online.com/d0ed/A700000014360726.pdf

[^8]: https://www.freshfields.com/en/our-thinking/blogs/technology-quotient/decoding-the-cyber-resilience-act-part-1-scope-and-impact-102m2cz

[^9]: https://www.greendatacenters.nl/uploads/1/6/1/8/16187644/bird_bird_nis2.pdf

[^10]: https://www.nis-2-directive.com/NIS_2_Directive_Article_3.html

[^11]: https://docs.tia.siemens.cloud/r/simatic_s7_1200_g2_manual_collection_enus_20/technical-specifications/general-technical-specifications

[^12]: https://www.legiscope.com/blog/nis2-essential-important-entities.html

[^13]: https://goregulus.com/cra-basics/cra-vs-nis-2-differences/

[^14]: https://nohau.eu/blogs/knowledge-center/beyond-the-checklist-which-products-fall-under-scope-of-the-eu-cyber-resilience-act-cra

[^15]: https://www.all-about-industries.com/nis-2-and-cra-impacts-on-industrial-automation-a-5f0998b4e0f55e4837ae34b8a6bb65df/

[^16]: https://www.nis-2-directive.com/

[^17]: https://zealience.com/resource-hub/cyber-resilience-act-product-categories

[^18]: https://hyperproof.io/understanding-the-relationship-between-nis2-and-the-eu-cyber-resilience-act/

[^19]: https://www.securebydesignhandbook.com/docs/standards/eu/cra-overview

[^20]: https://www.linkedin.com/posts/jeffrey-poldervaart-a179b414_nis2-is-new-european-legislation-on-cybersecurity-activity-7384098214016208896-gni3

[^21]: https://docs.tia.siemens.cloud/r/simatic_s7_1200_manual_collection_itit_20/technical-specifications/general-technical-specifications?contentId=Q2EAHhckE7kNFFFk~tAmLw

[^22]: https://www.scribd.com/document/947739685/ABS-Failsafe-24-0049126-PDA

[^23]: https://www.centerforcybersecuritypolicy.org/insights-and-research/cybersecurity-coalition-comments-on-cra-implementing-regulation-on-technical-descriptions-of-products-with-digital-elements

[^24]: https://cycode.com/blog/cyber-resilience-act/

[^25]: https://blogs.sw.siemens.com/polarion/cra-compliance-made-simple-how-polarion-helps-you-stay-ahead/

