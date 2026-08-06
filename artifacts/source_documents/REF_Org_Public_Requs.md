Annex II by reference, the full user-facing information requirements are integral to a complete Annex VII compliance package. Per the EUR-Lex text, Annex II requires that at minimum the product with digital elements be accompanied by:[^1][^2]

1. The name, registered trade name or registered trademark of the manufacturer, and the postal address, email address, or other digital contact, plus website where available.[^2]
2. The single point of contact where vulnerability information can be reported and received, and where the manufacturer's coordinated vulnerability disclosure policy can be found.[^1][^2]
3. Name, type, and any additional information enabling unique identification of the product.[^2]
4. The intended purpose of the product, including the security environment provided by the manufacturer, the product's essential functionalities, and information about its security properties.[^2]
5. Any known or foreseeable circumstance related to intended use or reasonably foreseeable misuse that may lead to significant cybersecurity risks.[^2]
6. Where applicable, the internet address at which the EU Declaration of Conformity can be accessed.[^2]
7. The type of technical security support offered and the end-date of the support period during which users can expect vulnerability handling and security updates.[^1][^2]
8. Detailed instructions (or a URL to them) covering: (a) necessary measures during initial commissioning and throughout the product's lifetime to ensure secure use; (b) how changes to the product can affect data security; (c) how security-relevant updates can be installed; (d) secure decommissioning, including how user data can be securely removed; (e) how the default automatic-security-update setting (mandated by Annex I Part I point 2(c)) can be turned off; (f) where the product is intended for integration into other products, the information the integrator needs to comply with Annex I and Annex VII.[^2]
9. If the manufacturer chooses to make the SBOM available to users, information on where it can be accessed.[^2]

Point 9 confirms the SBOM is **not mandatorily published to end users** under the CRA — publication is discretionary, while retention for market surveillance authorities under Annex VII Point 8 is mandatory.[^3][^2]

## 35. Practical Ten-Document Breakdown — Extended Detail

Building on the eight statutory Annex VII points, industry compliance practice decomposes the requirement into ten discrete work-product documents for program management purposes, since several statutory points (particularly Point 2) bundle multiple distinct deliverables:[^4]

| # | Document | Annex VII Reference | Detailed Content | Owner (typical) |
|---|---|---|---|---|
| 1 | Product Background Description | Point 1 | Intended purpose, product identity/model/version, hardware photos/illustrations if applicable, security environment description[^5][^4] | Product management |
| 2 | Cybersecurity Architecture and Design Documentation | Point 2(a) | System architecture diagrams, component integration and data-flow explanation, drawings/schematics for hardware[^5][^4] | Engineering/architecture |
| 3 | Vulnerability Handling Process Documentation | Point 2(b) | Full CVD policy text, vulnerability intake contact address evidence, triage/remediation workflow, secure update distribution mechanism description[^5][^4] | PSIRT/security team |
| 4 | Software Bill of Materials | Point 2(b), Point 8 | Machine-readable SBOM (CycloneDX/SPDX), maintained continuously, produced to authorities on reasoned request[^5][^4] | DevSecOps/engineering |
| 5 | Production and Monitoring Process Documentation | Point 2(c) | Secure build/release pipeline description, supply-chain integrity controls, post-market monitoring process validation[^5][^4] | Manufacturing/DevOps |
| 6 | Cybersecurity Risk Assessment | Point 3, Article 13(3)-(4) | Formal risk assessment output mapping identified risks to Annex I Part I essential requirements[^5][^6][^4] | Security/risk management |
| 7 | Support Period Determination Record | Point 4, Article 13(8) | Documented rationale for the chosen support period (minimum 5 years), factoring expected product lifetime[^5][^4] | Product/legal |
| 8 | Applied Standards and Specifications List | Point 5 | Harmonised standards, common specifications, or certification schemes applied (in full or part); alternative technical solutions where none applied[^5][^4] | Compliance/QA |
| 9 | Test Reports | Point 6 | Security test evidence against Annex I Parts I and II, covering both the product and its vulnerability-handling processes[^5][^4] | QA/security testing |
| 10 | EU Declaration of Conformity | Point 7 | Signed conformity declaration referencing applied modules/standards[^5][^4] | Legal/compliance officer |

This ten-document structure is a practitioner convenience mapping, not itself a separate statutory requirement — a market surveillance authority audits against the eight-point Annex VII text verbatim, but organizing internal workflow around ten discrete owned deliverables improves traceability and cross-functional accountability.[^4]

## 36. Post-Market Surveillance File — Contents and Structure

### 36.1 Statutory Anchor

Annex VII Point 2(c) explicitly requires "necessary information and specifications of the production **and monitoring processes** of the product with digital elements and the validation of those processes," establishing post-market monitoring as a documented, auditable component of the technical file rather than an informal internal practice. Article 31(2)'s continuous-update requirement ("continuously updated, where appropriate, at least during the support period") further means the post-market surveillance file must evolve as new vulnerabilities, incidents, and updates occur throughout the support period.[^7][^8][^5][^3]

### 36.2 Practical Post-Market Surveillance File Components

Industry compliance guidance decomposes the ongoing post-market evidence package into four core record types that should be maintained continuously alongside the static pre-market Annex VII file:[^9]

| Component | Content | Regulatory Linkage |
|---|---|---|
| Post-market monitoring plan | Security monitoring strategy, threat intelligence sources used (SBOM/CVE feeds, SIEM, CVD intake), automated tooling inventory, manual review processes, alert prioritization methodology[^9] | Annex VII Point 2(c); supports Article 13's "maintained" obligation across the support period[^6] |
| Vulnerability database/register | Every discovered vulnerability logged with discovery date, internal reporting date, severity/CVSS assessment, remediation date, and record of any CSIRT/ENISA Single Reporting Platform interactions[^9] | Feeds Article 14 reporting evidence; demonstrates the vulnerability-handling process required under Annex VII Point 2(b)[^5] |
| Incident reporting documentation | Full incident timeline, exploitation evidence gathered, mitigation actions taken, copies of notices sent to authorities, and any user notifications issued[^9] | Direct evidentiary support for Article 14 Early Warning/Notification/Final Report filings[^10][^11] |
| Update and patch history | Version history, each security patch released with rationale, and validation/testing steps performed for every update before release[^9] | Demonstrates compliance with the free, undelayed security-update obligation and the secure-update-distribution requirement in Annex VII Point 2(b)[^5][^12] |

### 36.3 Analogous Regulatory Structure (Cross-Sector Comparison)

While the CRA text itself does not use the term "post-market surveillance plan" as a defined, separately-annexed document (unlike, for example, the EU Medical Device Regulation's Article 83, which mandates a formal PMS plan integrated into the manufacturer's quality management system), the functional requirement is materially similar: Annex VII Point 2(c)'s monitoring-process specification combined with Article 31(2)'s continuous-update duty together operate as the CRA's equivalent of a living post-market surveillance obligation, even though the CRA does not prescribe the same granular procedural detail found in MDR Article 83 (e.g., explicit trend-reporting duties, benefit-risk redetermination cycles). Practitioners building CRA post-market programs often reference MDR/PMS program design patterns as a structural analogy, given the more mature audit conventions in that adjacent regulatory space.[^13][^14][^15][^6]

### 36.4 Integration with the PSIRT and SBOM Programs (Cross-Reference)

The post-market surveillance file described here is not a standalone deliverable — it is the documentary output of the PSIRT process flow detailed in Section 5 and the SBOM-driven continuous monitoring pipeline detailed in Sections 8–9 of this report. Every qualifying case moving through PSIRT triage (Section 13's categorization logic) and every Article 14 filing (Section 4) should automatically generate or update an entry in the vulnerability register and incident documentation components described in Section 36.2, ensuring the technical documentation file remains "continuously updated" as Article 31(2) requires without a separate manual compliance-writing exercise.[^16][^7][^9]

---

## References

1. [Annex II User Information Requirements - CRA Glossary](https://cvdportal.com/glossary/annex-ii-user-information) - What CRA Annex II requires manufacturers to communicate to users - product identifiers, support peri...

2. [CRA - Annex II](https://streamlex.eu/annexes/cra-en-annex-ii/) - At minimum, the product with digital elements shall be accompanied by: (1) the name, registered trad...

3. [CRA Annexes I–VIII: Essential Requirements & Product Lists](https://www.cyberresilienceact.eu/annexes.html) - The technical documentation referred to in Article 31 shall contain at least the following informati...

4. [CRA technical documents are far more than mere test ...](https://www.linkedin.com/pulse/cra-technical-documents-far-more-than-mere-test-reports-sunshine-tan-ekv9c) - CRA technical documents are far more than mere test reports, What Annex VII requires is a complete s...

5. [L_202402847EN.000101.fmx.xml - EUR-Lex](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=OJ:L_202402847) - technical documentation required pursuant to Article 31 and Annex VII. a single set of technical doc...

6. [Cyber Resilience Act text, Article 13](https://www.european-cyber-resilience-act.com/Cyber_Resilience_Act_Article_13.html) - ... Article in the technical documentation required pursuant to Article 31 and Annex VII. For produc...

7. [CRA Article 31. Technical documentation](https://streamlex.eu/articles/cra-en-art-31/) - 1. The technical documentation shall contain all relevant data or details of the means used by the m...

8. [Cyber Resilience Act text, Article 31](https://www.european-cyber-resilience-act.com/Cyber_Resilience_Act_Article_31.html) - 1. The technical documentation shall contain all relevant data or details of the means used by the m...

9. [CRA Technical Documentation (Annex II & VII) - Regulus](https://goregulus.com/cra-documentation/technical-documentation/) - The documentation must include: 3.1 Product Description and Intended Use Product type, model, versio...

10. [Single Reporting Platform (SRP) - ENISA - European Union](https://www.enisa.europa.eu/topics/product-security-and-certification/single-reporting-platform-srp) - 'Actively exploited vulnerability' means a vulnerability for which there is reliable evidence that a...

11. [Cyber Resilience Act Reporting Obligations](https://www.appluslaboratories.com/global/en/news/publications/cyber-resilience-act-reporting-obligations) - Reporting obligations under Article 14 apply from 11 September 2026. Manufacturers must report activ...

12. [CRA Support Period Basics: Five-Year Floor](https://craevidence.com/cra-compliance/support-period-basics) - Five years is the floor. The CRA requires vulnerability handling for at least five years unless the ...

13. [MDR - Article 83 - Post-market surveillance system of the ...](https://www.medical-device-regulation.eu/tag/mdr-article-83-post-market-surveillance-system-of-the-manufacturer/) - The post-market surveillance system shall be suited to actively and systematically gathering, record...

14. [Section 1: Post-market surveillance](https://de-mdr-ivdr.tuvsud.com/Section-1-Post-market-surveillance.html) - Article 13: General obligations of importers … manufacturers shall plan, establish, document, implem...

15. [How to Conduct Post-Market Surveillance](https://remmed.com/post-market-surveillance-guide/) - Learn about post-market surveillance for medical devices and get a general idea of how to develop an...

16. [EU CRA Vulnerability Reporting: 24-Hour Clock Starts Sept ...](https://cycode.com/blog/eu-cra-vulnerability-reporting-requirements/) - Submit an early warning to ENISA and the relevant CSIRT within 24 hours of becoming aware of an acti...

