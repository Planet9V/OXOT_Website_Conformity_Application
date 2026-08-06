<img src="https://r2cdn.perplexity.ai/pplx-full-logo-primary-dark%402x.png" style="height:64px;margin-right:32px"/>

# what exact work program and activtieis does a CRA Authority Body do ? about how much does it cost? for example, a robot welding cell? or a disk controller going into a datacenter rack? what are diffrenet work pgorams required to be done by the certififed body?

Based on my research, I now have comprehensive information to answer Jim's question about CRA Notified Body (NB) work programs, costs, and product classification for his specific examples. Let me compile this into a thorough answer.

## CRA Notified Body (NB): Work Programs, Activities \& Costs

A CRA Notified Body (NB) is an independent, accredited conformity assessment organization designated by a national authority to perform third-party assessments of products with digital elements before they can bear CE marking and enter the EU market. As of June 2026, the NB framework officially applies — but **zero NBs have been formally designated in NANDO** as of this writing, meaning the queue for assessments hasn't formally opened yet.[^1][^2]

***

## Product Classification First — Your Two Examples

Classification determines which work program the NB must execute. The CRA uses four tiers:[^3]


| Tier | Examples | Assessment Route |
| :-- | :-- | :-- |
| **Default** | General industrial IoT, connected sensors, most embedded controllers | Module A — self-assessment only |
| **Important Class I** | Identity mgmt, VPNs, network mgmt, firewalls (non-industrial) | Module A (with harmonized standards) OR Module B+C/H |
| **Important Class II** | **IACS for NIS2 essential entities** (PLCs, DCS, SCADA, CNC, IIoT), robot sensing/actuator controllers, industrial firewalls/IDS | **Mandatory Module B+C or H — no self-assessment** |
| **Critical (Annex IV)** | Hardware Security Modules (HSMs), smart meter gateways, smartcards | Mandatory EUCC certification |

### Robot Welding Cell (Your Example)

A robot welding cell controller falls into **Annex III Class II** per the final CRA text, which explicitly lists: *"Robot sensing and actuator components and robot controllers"* and *"IACS intended for the use by essential entities (NIS2 Annex I) such as PLCs, DCS, CNC and SCADA"*. If the welding cell connects to a network and is deployed in a facility covered by NIS2 (energy, manufacturing of critical materials, etc.), it is almost certainly **Important Class II** — mandatory third-party NB assessment required, no self-assessment escape hatch.[^4][^5]

### Disk Controller in a Datacenter Rack

A standard disk/storage controller does **not** appear in Annex III or Annex IV. Unless it is also functioning as a security-relevant device (e.g., an HSM or a cryptoprocessor), it lands in the **Default category** — Module A self-assessment is sufficient. General-purpose microprocessors are Class II, but a storage controller serving a pure I/O function is Default.[^6][^7]

***

## The Three NB Work Programs (Annex VIII Modules)

### Module A — Internal Control (No NB Involvement)

This is self-assessment, used by ~90% of products. The NB is not involved, but the manufacturer must:[^8]

- Perform a documented cybersecurity risk assessment
- Produce a full Annex VII technical file (product description, risk assessment, architecture docs, SBOM, test results)
- Implement Annex I Part I security controls and Annex I Part II vulnerability handling processes
- Sign an EU Declaration of Conformity (DoC) and affix CE marking
- Retain all records for 10 years or the support period, whichever is longer[^9]

**Your disk controller → Module A.**

***

### Module B+C — EU-Type Examination + Production Control (Primary NB Path)

This is the mandatory route for Important Class II products. The NB performs an **EU-type examination** of the design; the manufacturer then controls production internally (Module C). Here is exactly what the NB does, step-by-step:[^10][^9]

**Phase 1 — Application \& Intake**

- Manufacturer selects a single NB and submits: application form, product samples, full technical documentation (Annex VII), supporting evidence for design decisions and vulnerability handling, declaration that no other NB has been applied to
- NB confirms scope, schedules assessment, collects application fee (€2,000–5,000)[^2]

**Phase 2 — Technical Documentation Review (Module B Step 4.1)**
The NB examines the full technical file against Annex I requirements:

- Product design architecture and security controls (Annex I Part I)
- Vulnerability handling processes: CVD policy, SBOM, patch process, incident reporting capability (Annex I Part II)
- Risk assessment methodology and outputs
- Standards applied (IEC 62443, EN 303 645, etc.) and any deviations[^9]

**Phase 3 — Specimen Verification (Module B Step 4.2)**

- The NB verifies that physical specimens match the technical documentation
- Identifies which elements were designed per harmonized standards vs. alternate approaches[^9]

**Phase 4 — Testing \& Examination (Module B Steps 4.3–4.5)**

- The NB carries out or commissions technical tests:
    - **If harmonized standards were applied:** NB verifies they were applied correctly
    - **If no harmonized standard exists or was not applied:** NB independently verifies that the manufacturer's chosen solutions meet the essential requirements
- NB and manufacturer agree on where examinations/tests are conducted (can be at the manufacturer's lab, a third-party lab, or the NB's own facility)[^9]
- For a robot welding cell, this could include penetration testing of network interfaces, review of secure boot and firmware update mechanisms, authentication/access control testing, and SBOM completeness review

**Phase 5 — Evaluation Report**

- NB drafts a formal evaluation report documenting all activities and findings
- Report content is confidential and released only with manufacturer's agreement[^9]

**Phase 6 — Certificate Issuance or Refusal**

- If compliant: NB issues an **EU-Type Examination Certificate** naming the manufacturer, product type, assessment conclusions, any validity conditions, and annexes covering the approved type and vulnerability handling process
- If non-compliant: NB refuses the certificate with detailed written reasons; manufacturer remediates and resubmits[^9]

**Phase 7 — Change Management (Ongoing)**

- Any modifications that could affect CRA compliance require additional NB approval and are issued as an addition to the original certificate
- NB must stay current with the state of the art and notify the manufacturer if the approved type may no longer comply[^9]

**Phase 8 — Periodic Vulnerability Handling Audits (Critical Ongoing Obligation)**

- Under Annex VIII Part II §8, the NB **must carry out periodic audits** to ensure that the manufacturer's vulnerability handling processes (Annex I Part II) remain properly implemented[^11][^9]
- The CRA does not specify a fixed audit frequency — this is agreed in the audit plan between NB and manufacturer
- These surveillance audits cover: CVD process operation, SBOM maintenance, security update distribution, incident reporting capability, and records of handled vulnerabilities

**Phase 9 — Cross-NB Reporting**

- The NB is required to report certificate issuances, refusals, and withdrawals to its national notifying authority and to other NBs across the EU (enabling mutual recognition and preventing certificate shopping)[^9]

***

### Module H — Full Quality Assurance System (Alternative for Multi-Product Manufacturers)

Module H is NB-assessed at the **QMS (Quality Management System) level** rather than per-product. It makes sense for manufacturers shipping multiple Class II products or frequent updates (e.g., a PLC vendor or robot controller manufacturer). The NB work program includes:[^2][^10][^9]

**Initial QMS Certification:**

- NB reviews the complete QMS documentation: design procedures, secure SDLC, production controls, vulnerability handling, testing methodology, configuration management, documentation controls
- NB sends an audit team with **at least one assessor experienced in the specific product field** and knowledge of applicable CRA requirements
- Site visit to manufacturer premises (mandatory)
- NB reviews sample technical documentation to verify the manufacturer can identify applicable requirements and execute required examinations
- NB issues or refuses a QMS Approval Certificate with reasoned decision

**Per-Product Design Review (within approved QMS):**

- Each new product model undergoes a lighter design review against the approved QMS — lower cost than full Module B per product

**Ongoing Surveillance:**

- NB conducts **periodic surveillance audits** of the QMS in operation
- Audits cover: quality records (design analyses, test data, calibration), production conformity evidence, personnel qualification records, vulnerability handling operation
- Manufacturer must grant NB access to design, development, production, inspection, testing, and storage sites on request[^9]

***

## Cost Summary

These are planning-level estimates, drawn from analogy with RED (Radio Equipment Directive) and MDR (Medical Device Regulation) regimes, and early CRA consultancy pricing. **No NB has published a CRA rate card as of mid-2026**:[^2]


| Module | Cost Element | Typical Range |
| :-- | :-- | :-- |
| **Module A (Self)** | Risk assessment | €5,000–15,000 |
|  | Technical documentation | €5,000–20,000 |
|  | Testing (internal/lab) | €2,000–10,000 |
|  | SBOM tooling | €0–5,000 |
|  | **Total (internal costs)** | **€15,000–50,000** |
| **Module B+C (NB)** | NB application fee | €2,000–5,000 |
|  | NB examination fee | €15,000–50,000 |
|  | Sample preparation | €1,000–5,000 |
|  | Technical documentation | €10,000–30,000 |
|  | Travel/logistics (site visits) | €1,000–5,000 |
|  | **Total NB fees + manufacturer costs** | **€30,000–100,000+** |
| **Module H (QA)** | QMS development/upgrade | €20,000–50,000 |
|  | NB initial QMS audit | €15,000–30,000 |
|  | Annual surveillance | €5,000–15,000/yr |
|  | Per-product design review | €5,000–15,000 each |
|  | **Initial setup** | **€40,000–100,000** |
|  | **Annual ongoing** | **€10,000–30,000/yr** |

NB queue times are expected to run **4–16 weeks** per assessment once designations are published. For industrial products like IACS or robot controllers with complex firmware and network interfaces, expect the examination phase alone to run 4–8 weeks.[^2]

**Module H break-even:** If you have 4+ Important Class II products, Module H typically saves significant money — a modeling example with 5 products over 5 years shows Module H at ~€235,000 vs. Module B+C per-product at ~€500,000.[^2]

***

## Key Timelines to Watch

- **11 June 2026:** NB notification framework in effect — NBs can begin seeking designation[^12]
- **11 September 2026:** Manufacturer vulnerability \& incident reporting obligations begin (24-hr/72-hr/14-day cascade to ENISA and national CSIRTs)[^8]
- **11 December 2027:** Full CRA compliance mandatory — CE marking required for all digital products on EU market[^12]
- **Note:** As of July 2026, NANDO shows **zero designated CRA NBs** — if your robot cell or IACS product needs Module B+C, watch NANDO actively and engage early once designations publish[^2]

***

## IEC 62443 Overlap

For your OT work specifically: IEC 62443-4-1 (secure development lifecycle) and IEC 62443-4-2 (component security) are strong candidates to become CRA-relevant harmonized standards. Applying them fully for an Important Class I IACS product could preserve the Module A self-assessment route. For Class II IACS (NIS2 essential entities), however, the NB route is unavoidable regardless of which standards are applied.[^5][^7]
<span style="display:none">[^13][^14][^15][^16][^17][^18][^19][^20][^21][^22][^23][^24][^25][^26][^27][^28][^29][^30][^31][^32][^33][^34][^35][^36][^37][^38][^39][^40][^41][^42][^43][^44][^45][^46][^47]</span>

<div align="center">⁂</div>

[^1]: https://www.appluslaboratories.com/global/en/what-we-do/service-sheet/cyber-resilience-act-notified-body

[^2]: https://craevidence.com/cra-compliance/conformity-assessment

[^3]: https://digital-strategy.ec.europa.eu/en/policies/cra-conformity-assessment

[^4]: https://www.european-cyber-resilience-act.com/Cyber_Resilience_Act_Annex_3.html

[^5]: https://www.securebydesignhandbook.com/blog/2025/11/28/cra-implementing-regulation-published

[^6]: https://www.platanor.com/blog/cra-product-classification-default-important-critical

[^7]: https://sota.io/blog/cra-art6-product-classification-class-i-class-ii-annex-iii-iv-eu-compliance-2026

[^8]: https://ipc2u.com/articles/knowledge-base/industrial-cybersecurity-readiness-in-the-eu-a-practical-guide-to-the-cyber-resilience-act-iec-62443/

[^9]: https://streamlex.eu/annexes/cra-en-annex-viii/

[^10]: https://www.linkedin.com/pulse/step-6-which-conformity-assessment-procedure-applies-michael-jesse-szpkf

[^11]: https://www.linkedin.com/pulse/eu-cra-faq-summary-cyber-resilience-act-implementation-m210e

[^12]: https://nmi.nl/how-ready-is-your-business-for-the-eus-cyber-resilience-act/

[^13]: https://www.cyberresilienceact.eu/cost-calculator.html

[^14]: https://www.european-cyber-resilience-act.com/Cyber_Resilience_Act_Article_29_15.9.2022.html

[^15]: https://yogosha.com/blog/cra-cyber-resilience-act-guide/

[^16]: https://zealience.com/resource-hub/cyber-resilience-act-product-categories

[^17]: https://kyberturvallisuuskeskus.fi/en/our-activities/regulation-and-supervision/cyber-resilience-act-cra/apply-become-notified-body-under-cra

[^18]: https://cetecomadvanced.com/en/certification/notified-body/

[^19]: https://cycode.com/blog/cyber-resilience-act/

[^20]: https://www.cyberresilienceact.eu/ce-marking.html

[^21]: https://european-accreditation.org/workshop-on-the-eu-cyber-resilience-act-30-march-2026/

[^22]: https://www.linkedin.com/pulse/eu-cyber-resilience-act-what-product-teams-should-do-now-leitner-ll66f

[^23]: https://www.dekra.com/en/cyberresilienceact/

[^24]: https://goregulus.com/cra-basics/cra-notified-body-requirements/

[^25]: https://industrialcyber.co/expert/cra-and-machinery-regulation/

[^26]: https://digitalcompliance.snellman.com/regulation/cyber-resilience-act-proposal/chapter-iv-notification-of-conformity-assessment-bodies-art-35-51/

[^27]: https://ib-lenhardt.com/kb/glossary/type-examination

[^28]: https://www.cyberresilienceact.eu/annexes.html

[^29]: https://www.hoganlovells.com/-/media/project/english-site/our-thinking/publication-pdfs/faqs_on_the_cra__v12_6qbciptphhzxljscvbcere4yibo_122331.pdf

[^30]: https://mbkaya.com/it-law-cra-cyber-resilience-act-regulation-2024-2847/

[^31]: https://www.infineon.com/quality/security/security-standards/eu-cra

[^32]: https://www.linkedin.com/pulse/step-4-product-classification-under-cra-michael-jesse-uu4bf

[^33]: https://www.secure4sme.eu/document/open?id=25

[^34]: https://www.theinsightpartners.com/reports/robotic-welding-cell-market

[^35]: https://consult.red/insights/eu-cra-q3-2026-update/

[^36]: https://goregulus.com/cra-basics/cra-annex-iv-critical-products-list/

[^37]: https://www.futuremarketinsights.com/reports/robotic-welding-cells-market

[^38]: https://www.securebydesignhandbook.com/docs/standards/eu/cra-overview

[^39]: https://nohau.eu/blogs/knowledge-center/beyond-the-checklist-which-products-fall-under-scope-of-the-eu-cyber-resilience-act-cra

[^40]: https://www.classnk.or.jp/hp/pdf/info_service/iacs_ur_and_ui/ur_w11_rev.10_sep_2025_cln.pdf

[^41]: https://www.cybercertlabs.com/case_studies/cra-categories/

[^42]: https://arxiv.org/html/2505.14325v2

[^43]: https://digital-strategy.ec.europa.eu/en/policies/cra-summary

[^44]: https://www.taylorwessing.com/en/insights-and-events/insights/2025/11/cyber-resilience-act-overview

[^45]: https://business.gov.nl/amendments/mandatory-cybersecurity-requirements-for-products-cra/

[^46]: https://www.txone.com/blog/cra-guide-for-manufacturers/

[^47]: https://digital-strategy.ec.europa.eu/en/policies/cyber-resilience-act

