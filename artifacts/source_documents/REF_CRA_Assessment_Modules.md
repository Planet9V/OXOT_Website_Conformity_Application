## 30. Conformity Assessment Modules — Extended Deep-Dive (Article 32, Annex VIII)

### 30.1 Legal Basis and the Four Available Procedures

Article 32(1) CRA establishes that the manufacturer "shall demonstrate conformity with the essential cybersecurity requirements by using any of the following procedures": (a) the internal control procedure based on Module A; (b) the EU-type examination procedure based on Module B, followed by conformity to EU-type based on internal production control (Module C); (c) a conformity assessment based on full quality assurance (Module H); or (d) where available and applicable, a European cybersecurity certification scheme pursuant to Article 27(9). All four routes are defined mechanically in Annex VIII, with Module A in Part I, Module B in Part II, Module C in Part III, and Module H in Part IV. Critically, which of these four options a manufacturer may actually choose is not free choice — Article 32(2)-(4) progressively restricts the menu as product classification tier rises.[^1][^2][^3][^4]

### 30.2 Module A — Internal Control (Self-Assessment) — Full Mechanics

Module A, set out in Part I of Annex VIII, is carried out entirely under the manufacturer's own responsibility with no notified body involvement whatsoever. The manufacturer independently verifies that the product and its vulnerability-handling processes comply with Annex I, compiles the Annex VII technical documentation, and signs the EU Declaration of Conformity on its own authority before affixing CE marking.[^5][^2][^4]

**Step-by-step Module A workflow**:[^5]

| Phase | Activities | Typical Duration |
|---|---|---|
| Design phase | Apply security-by-design principles; run the cybersecurity risk assessment; document the security architecture; apply harmonised standards where relevant[^5] | 2–4 weeks (risk assessment)[^5] |
| Documentation | Build the Annex VII technical file: product description, risk assessment results, design documentation, standards applied, test results, SBOM; prepare the EU Declaration of Conformity[^5] | 4–8 weeks[^5] |
| Production controls | Ensure production maintains conformity; document quality controls; verify each unit where applicable[^5] | Ongoing |
| Testing | Execute and record security test evidence against Annex I[^5] | 2–4 weeks[^5] |
| Finalization | Sign the EU Declaration of Conformity, affix CE marking, retain documentation ≥10 years or the support period, whichever is longer[^5] | 1–2 weeks[^5] |

Total typical Module A timeline runs 2–4 months end-to-end, and internal cost is estimated around €5,000–€20,000 depending on organizational maturity and existing documentation. Even under self-assessment, "self-assessment does not mean no file" — the six-area Annex VII file (general description, design/development/production/vulnerability-handling description, risk assessment, standards list, test reports, SBOM) is still mandatory evidence a market surveillance authority can demand.[^6][^5]

**Module A eligibility — three distinct categories**:[^2]

1. **Default products** — Module A applies by default to any product with digital elements that does not fall within Annex III (important) or Annex IV (critical) core functionality.[^7][^2]
2. **Important Class I products with a fully applied harmonised standard** — Module A remains available only if a relevant harmonised standard, common specification, or certification at assurance level at least "substantial" has been applied in full per Article 32(2). If the standard is absent, non-existent, or only partially applied, Module A is no longer permitted for that product.[^8][^1][^2]
3. **Free and open-source software under Class I or Class II** — a distinct statutory carve-out under Article 32(5) allows Module A even for otherwise-restricted Class I/II products, on condition that the technical documentation is made publicly available.[^9][^2]

### 30.3 Module B — EU-Type Examination — Full Mechanics

Module B introduces third-party assessment: a notified body examines a representative sample ("type") of the product and, if compliant, issues a certificate. Module B is assessed per product type, meaning each distinct product design requires its own examination.[^10][^8][^5]

**Step-by-step Module B workflow**:[^5]

| Stage | Activities |
|---|---|
| Application | Select a notified body; submit application with product samples, technical documentation, and the application form; pay initial fees[^5] |
| Examination | The notified body reviews documentation, tests the product sample, verifies compliance with Annex I essential cybersecurity requirements, and may request additional information or further tests[^5][^10] |
| Decision | If compliant, the notified body issues the EU-Type Examination Certificate; if deficiencies are found, the manufacturer remediates and re-submits[^5] |
| Certificate | Valid for the assessed type only, with any conditions stated on the certificate face; product modifications that may affect compliance require certificate follow-up with the notified body[^5] |

The notified body's Module B review specifically assesses both the product's technical design *and* its vulnerability-handling processes, not merely a point-in-time security test.[^2][^5]

### 30.4 Module C — Conformity to Type (Internal Production Control) — Full Mechanics

Module C never stands alone — it is always paired with a preceding Module B EU-type examination, and covers the manufacturing/production phase after the type has been certified. Under Module C, the manufacturer ensures every subsequent production unit conforms to the certified type through internal production controls, documents production processes, and maintains quality controls.[^10][^2][^5]

**Step-by-step Module C workflow**:[^5]

| Stage | Activities |
|---|---|
| Production controls | Ensure each unit conforms to the certified type; document production processes; maintain quality controls[^5] |
| Declaration | Reference the EU-Type Examination Certificate; sign the EU Declaration of Conformity; affix CE marking[^5][^10] |
| Ongoing obligations | Maintain conformity to the certified type; report to the notified body any changes that may affect the certified type; recertify if substantial changes occur[^5] |

Estimated combined cost for the Module B+C route is roughly €30,000–€100,000+ depending on product complexity and notified body fee structures, materially higher than Module A.[^5]

### 30.5 Module H — Full Quality Assurance — Full Mechanics

Module H, set out in Part IV of Annex VIII, is structurally different from B+C: rather than certifying one static product design, a notified body approves the manufacturer's entire cybersecurity quality management system covering design, development, production, and vulnerability handling, then performs ongoing periodic surveillance of that system. Once the QMS itself is approved, individual new or substantially modified products can generally be placed on the market without a fresh per-product assessment — only the quality system undergoes periodic re-evaluation.[^3][^11][^8][^2]

**Step-by-step Module H workflow**:[^5]

| Stage | Activities |
|---|---|
| QMS establishment | Design a quality system covering the design process, production controls, testing procedures, and documentation management, aligned with CRA Annex I Parts I and II[^5][^12] |
| Notified body assessment | Submit QMS documentation; host the notified body audit; verify CRA alignment; receive the QMS approval certificate[^5] |
| Product design (per product) | Follow the approved QMS for design; conduct a design examination; document compliance; allow notified body audits of the design process[^5] |
| Production | Follow the approved QMS for production; document conformity; accept notified body surveillance audits[^5] |
| Declaration (per product) | Sign the EU Declaration of Conformity; reference the QMS certificate; affix CE marking[^5] |
| Ongoing | Maintain the QMS; submit to periodic surveillance audits by the notified body — the CRA does not prescribe a fixed surveillance frequency or recertification cycle, so cadence is set in the audit plan agreed with the notified body[^5] |

Module H is explicitly designed to leverage existing management-system infrastructure: manufacturers with an established ISO 9001 quality management system can extend that same process-centric structure to cover CRA Annex I Parts I and II, letting the notified body audit the quality system and verify implementation on representative products rather than mandating exhaustive product-by-product testing. German BSI's Technical Guideline TR-03183-H confirms Module H is explicitly modeled on ISO 9001-style management system standards. Estimated Module H cost runs roughly €50,000+ for initial setup plus ongoing surveillance audit fees. Practitioner guidance frames Module H as advantageous specifically for manufacturers with multiple products or frequent product iterations, since it "allows manufacturers with a robust, audited quality system to manage compliance more autonomously compared to the product-by-product testing of Module B+C".[^12][^11][^13][^5]

## 31. Classification Tier → Mandatory Module Mapping (Article 32(1)-(4))

### 31.1 Statutory Text by Tier

Article 32 assigns progressively stricter procedures by tier:[^4][^1]

- **Article 32(1) — Default products**: manufacturer may freely choose any of Module A, B+C, H, or a European cybersecurity certification scheme under Article 27(9).[^1][^4]
- **Article 32(2) — Important Class I products**: if the manufacturer has not applied, or has only partially applied, harmonised standards/common specifications/certification schemes at assurance level at least "substantial," the product must be submitted to either Module B+C or Module H — Module A is foreclosed.[^4][^1]
- **Article 32(3) — Important Class II products**: regardless of standards applied, the manufacturer must use Module B+C, Module H, or (where available) a European cybersecurity certification scheme at assurance level at least "substantial" under Article 27(9) — Module A is never available.[^1][^4]
- **Article 32(4) — Critical products (Annex IV)**: must use a European cybersecurity certification scheme under Article 8(1) where one exists and its conditions are met; where Article 8(1) conditions are not met, the product falls back to the Article 32(3) procedures (Module B+C or H).[^4][^1]

### 31.2 Consolidated Classification-to-Module Matrix

| Classification Tier | Module A Available? | Module B+C | Module H | European Cybersecurity Certification (EUCC, Art. 27(9)) | Notified Body Required? |
|---|---|---|---|---|---|
| Default | Yes — always available[^8][^7] | Optional | Optional | Optional | No[^8][^7] |
| Important Class I | Only if harmonised standard/common specification/certification at ≥"substantial" is fully applied[^2][^8] | Mandatory if standard not fully applied[^1][^10] | Mandatory alternative if standard not fully applied[^1][^10] | Available at ≥"substantial" assurance as an alternative path[^8] | Conditional — only if no qualifying standard applied[^10] |
| Important Class II | Not available, except FOSS carve-out under Art. 32(5)[^2][^9] | Mandatory option[^1][^10] | Mandatory option[^1][^10] | Available at ≥"substantial" assurance as an alternative[^1][^8] | Yes, always[^10][^7] |
| Critical (Annex IV) | No[^1] | Fallback only if no Art. 8(1) scheme available/applicable[^1][^8] | Fallback only if no Art. 8(1) scheme available/applicable[^1][^8] | Primary and preferred route (EUCC under Article 8(1))[^1][^8] | Yes, always (via notified body or certification testing lab)[^8][^7] |

### 31.3 The Free/Open-Source Software Exception

A specific statutory exception under Article 32(5) permits Module A self-assessment even for Class I or Class II important products if the product is free and open-source software and its technical documentation is made publicly available — this is a deliberate carve-out distinct from the general Article 24 open-source steward regime discussed in Section 25, and applies to the product's conformity route rather than to steward liability.[^9][^2]

### 31.4 Illustrative Product-to-Module Mapping

| Product Example | Classification | Typical Module Path |
|---|---|---|
| Smart thermostat, connected toy | Default | Module A (self-assessment)[^7] |
| Network firewall, smart home hub | Important Class I | Module B+C, or Module H if no harmonised standard fully applied[^7] |
| Industrial control system (PLC), hardware security module (HSM) | Important Class II / Critical | Module H (full quality assurance), or EUCC certification where available[^7][^8] |
| Password manager, identity/PAM software, VPN client | Important Class I | Module A if harmonised standard applied; otherwise B+C or H[^14][^8] |
| Hypervisor, container runtime, IDS/IPS | Important Class II | Module B+C or H, notified body mandatory[^14][^10] |
| Smart card, secure element, smart meter gateway | Critical | EUCC certification preferred; B+C or H as fallback[^8][^14] |

## 32. Practical Considerations for Module Selection

### 32.1 Cost and Timeline Trade-offs

Module A carries the lowest direct cost (roughly €5,000–€20,000 internal effort) and the shortest 2–4 month timeline, but shifts all liability for correctness onto the manufacturer with no external validation buffer. Module B+C carries substantially higher third-party fees (roughly €30,000–€100,000+) and requires per-product-type re-engagement with the notified body for any substantial design change. Module H carries the highest initial setup cost (€50,000+) but amortizes better for manufacturers with multiple products or frequent releases, since the QMS approval — not each product — is the unit of certification, avoiding repeated per-product notified body engagements.[^11][^5]

### 32.2 Harmonised Standards Status Constrains Real-World Choice

As of the CRA workshop and tracker guidance from mid-2026, no CRA harmonised standard has yet been published in the Official Journal, meaning the Article 27 presumption-of-conformity route referenced throughout Article 32(2)-(3) is not currently operative for any product category. Practically, this means Important Class I manufacturers currently cannot rely on the "harmonised standard fully applied" exception to retain Module A eligibility, and are effectively pushed toward Module B+C or H until standards are formally adopted.[^15][^1]

### 32.3 Substantial Modification and Certificate Continuity

Across all notified-body routes (B+C and H), a "substantial modification" to the product or its design triggers a fresh assessment obligation — for Module B+C this means resubmission to the notified body and potential certificate revision, while for Module H the modified product should be developed under the already-approved QMS but may still be subject to targeted design-examination review depending on the audit plan. Separately, EU-type examination certificates or approvals issued under other applicable EU legislation (e.g., the Radio Equipment Directive's Delegated Regulation 2022/30) remain valid until 11 June 2028 unless otherwise specified or expired earlier, providing a transitional bridge for manufacturers already holding RED-based cybersecurity certificates.[^9][^5]

### 32.4 Notified Body Landscape Timing

EU member states were required to designate their national notifying authorities by 11 June 2026, which in turn triggers the formal accreditation of individual notified bodies against CRA-specific technical competence criteria — meaning the pool of available notified bodies for Module B+C and Module H engagements is still actively expanding through 2026, and manufacturers planning for the December 2027 deadline should confirm notified body capacity and lead times well in advance given anticipated queuing as the deadline approaches.[^16][^7]

---

## References

1. [CRA Article 32. Conformity assessment procedures ...](https://streamlex.eu/articles/cra-en-art-32/) - The manufacturer shall perform a conformity assessment of the product with digital elements and the ...

2. [Step 6: Which Conformity Assessment Procedure Applies?](https://www.linkedin.com/pulse/step-6-which-conformity-assessment-procedure-applies-michael-jesse-szpkf) - Module B + C, defined in Parts II and III of Annex VIII CRA, introduces external assessment by a not...

3. [What is module H? How does it work? - CRA FAQ](https://cra.orcwg.org/faq/official/faq_6-3/) - Module H, set out in Part IV of Annex VIII, is a conformity assessment procedure in which the manufa...

4. [Cyber Resilience Act text, Article 32](https://www.european-cyber-resilience-act.com/Cyber_Resilience_Act_Article_32.html) - Conformity assessment procedures for products with digital elements. (based on module A) set out in ...

5. [CRA Conformity Assessment: Self-Assessment or Notified ...](https://craevidence.com/cra-compliance/conformity-assessment) - Module B+C combines a Notified Body type examination (B) with a production-conformity phase you run ...

6. [ANNEX VII CRA - Content of the technical documentation](https://digitalhorizon.hannessnellman.com/annexes/annex-vii-cra-content-of-the-technical-documentation/) - The technical documentation referred to in Article 31 shall contain at least the following informati...

7. [CRA Notified Body Requirements: Your Path to Certification in ...](https://goregulus.com/cra-basics/cra-notified-body-requirements/) - With the CRA entering into force on December 10, 2024, EU Member States are required to designate th...

8. [Cyber Resilience Act Product Categories: How to Classify ...](https://zealience.com/resource-hub/cyber-resilience-act-product-categories) - Article 32 of the CRA sets out the conformity assessment procedures available to each product tier. ...

9. [EU - CRA - FAQ Summary: Cyber Resilience Act ...](https://www.linkedin.com/pulse/eu-cra-faq-summary-cyber-resilience-act-implementation-m210e) - EU-type examination certificates/approvals under other legislation (e.g., RED Delegated Regulation 2...

10. [How to Classify IoT Products under the CRA](https://www.tributech.io/blog/classify-iot-products-cyber-resilience-act) - Build your CRA map: Document your product's class and link it to the right conformity assessment rou...

11. [Cyber Resilience Act: The Complete Survival Guide for ...](https://www.cclab.com/news/cyber-resilience-act-the-complete-survival-guide-for-manufacturers) - Module H allows manufacturers with a robust, audited quality system to manage compliance more autono...

12. [Implementing Module H under the Cyber Resilience Act](https://www.eurosmart.com/implementing-module-h-under-the-cyber-resilience-act/) - This Eurosmart guide explains how to use Module H – Full Quality Assurance to meet those obligations...

13. [Technical Guideline TR-03183-H](https://www.bsi.bund.de/SharedDocs/Downloads/EN/BSI/Publications/TechGuidelines/TR03183/BSI-TR-03183-H_v1_1_0.pdf?__blob=publicationFile&v=2) - Module H is a conformity assessment procedure based on full quality assurance, ly based on managemen...

14. [Cyber Resilience Act Product Categories](https://www.cybercertlabs.com/case_studies/cra-categories/) - Important Class I can be found in Annex III of the CRA, this includes; Identity management systems, ...

15. [What Are CRA Harmonised Standards? Status and Tracker](https://craevidence.com/cra-compliance/harmonised-standards-status) - No CRA harmonised standard is published in the Official Journal yet (as of 4 June 2026), so the Arti...

16. [Technical Competence Requirements for CRA Notified ...](https://www.linkedin.com/posts/excid-io_technical-competence-requirements-for-cra-activity-7469127939930988544-NmkH) - Important Class I products may also require a Notified Body when harmonised standards ... 36 CRA Not...

