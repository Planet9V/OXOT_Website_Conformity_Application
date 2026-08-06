# EU Cyber Resilience Act (CRA) – Complete Technical Reference
**Regulation (EU) 2024/2847 | Tetrel / Jim McKenney | June 2026**

***
## Executive Overview
The Cyber Resilience Act (CRA), formally Regulation (EU) 2024/2847, is the EU's first horizontal cybersecurity regulation applying mandatory, binding requirements to virtually all hardware and software products sold on the EU market. Unlike sector-specific rules (NIS2, MDR, GPSR), the CRA operates as a **product law** framework — extending the CE-marking architecture into cybersecurity — and applies from the silicon supply chain through to the end-user. It entered into force on **10 December 2024** and reaches full applicability on **11 December 2027**, with phased obligations activating earlier.[^1][^2][^3][^4]

For Tetrel's CDU/hyperscale data center work, the CRA is directly relevant: products in scope include OT devices, IoT gateways, SCADA components, smart meter gateways, network infrastructure, and any "product with digital elements" (PDE) in the critical infrastructure supply chain.[^5][^6]

***
## Part I: Introduction and Legislative Context
### What the CRA Is and Why It Was Created
The CRA addresses a market failure: manufacturers have historically had little commercial incentive to invest in cybersecurity, and buyers have had no reliable way to assess the security of connected products. The regulation imposes baseline security obligations at manufacture, not after deployment. Its core design principles are:[^3]

- **Security by design and secure by default** — products must be designed, developed, and produced with cybersecurity built in[^5][^7]
- **Lifecycle security** — obligations run for the duration of a product's support period, not just at point of sale[^8][^2]
- **Supply-chain transparency** — mandatory SBOM requirements tie product security to component-level accountability[^9][^10]
- **Harmonised single market access** — one CE marking scheme replaces a patchwork of national rules[^3][^5]
### Legislative History
| Milestone | Date |
|-----------|------|
| Commission proposal published | September 2022 |
| European Parliament approval | March 2024 |
| Council adoption | October 2024 |
| Published in EU Official Journal | 20 November 2024 |
| Entry into force | 10 December 2024 |
| Chapter IV (CABs notification) applies | 11 June 2026 |
| Reporting obligations (Art. 14) apply | 11 September 2026 |
| Full applicability | 11 December 2027 |
| Existing type-examination certs valid until | 11 June 2028 |

The Commission has already adopted two supplementary acts: Delegated Regulation (EU) 2025/1535 (motor vehicle product exclusion) and Implementing Regulation (EU) 2025/2392 (technical descriptions of important/critical product categories).[^3]

***
## Part II: Scope
### What Is Covered
The CRA applies to any **product with digital elements (PDE)** — defined as "a software or hardware product and its remote data processing solutions, including software or hardware components being placed on the market separately" — where the intended purpose or reasonably foreseeable use includes a **direct or indirect logical or physical data connection** to a device or network.[^3][^6]

In practice, this captures:
- Connected hardware: smartphones, laptops, smart home devices, industrial controllers, routers, firewalls, gateways, microprocessors, smart meters
- Software products: operating systems, applications, firmware, mobile apps, games
- Remote data processing tightly coupled to the product's function
- Components placed on the market separately (e.g., a microcontroller sold independently)[^11][^3]

The trigger test is **connectivity in intended normal use** — not theoretical capability. A factory-only debug port does not trigger CRA; an end-user-accessible USB-C interface does.[^6]
### What Is Excluded
| Excluded Category | Reason / Legal Basis |
|-------------------|----------------------|
| Non-commercial free and open-source software (FOSS) | Not "made available on the market" per Recital 18 |
| Products exclusively for national security / military | Sector carve-out |
| Products already covered by dedicated EU sector regulations (medical devices, aviation, automotive) | Lex specialis |
| Products not connected to devices or networks in normal use | Outside PDE definition |
| Products not placed on the market (internal use, prototypes at trade fairs) | Outside commercial supply |

Open-source **stewards** (legal entities that sustain FOSS for commercial activity) face a lighter obligation set under Article 24, but are not fully exempt.[^1][^3]
### Relationship to Other EU Regulation
The CRA explicitly does **not** replace NIS2 (which governs operators, not products), GDPR (personal data protection), the AI Act (AI system requirements), MDR/IVDR (medical devices), or the Radio Equipment Directive (RED). Where overlap exists, the more specific sectoral rule takes precedence for those specific obligations; CRA cybersecurity requirements fill remaining gaps.[^3][^4]

***
## Part III: Regulation Structure — 8 Chapters, 71 Articles, 8 Annexes
### Chapter Map
| Chapter | Articles | Subject |
|---------|----------|---------|
| **I – General Provisions** | 1–12 | Scope, definitions, product classification, relationship to other law |
| **II – Obligations of Economic Operators** | 13–26 | Manufacturer, importer, distributor, FOSS steward obligations |
| **III – Conformity** | 27–34 | Standards, CE marking, DoC, technical documentation, conformity assessment |
| **IV – Notification of CABs** | 35–51 | Notified body designation, requirements, operational rules |
| **V – Market Surveillance & Enforcement** | 52–60 | MSA powers, national/Union procedures, sweeps, ADCO |
| **VI – Delegated Powers** | 61–62 | Commission's delegated/implementing act authority |
| **VII – Confidentiality & Penalties** | 63–65 | Information protection, fines, representative actions |
| **VIII – Transitional & Final Provisions** | 66–71 | Amendments, transitional rules, evaluation, entry into force |
### Key Articles at a Glance
| Article | Subject | Importance |
|---------|---------|-----------|
| Art. 2 | Scope | Defines which products and situations are covered |
| Art. 3 | Definitions | "PDE", "manufacturer", "substantial modification", "support period" |
| Art. 6 | Requirements for PDEs | Gateway to Annex I essential requirements |
| Art. 7 | Important products | Defines Class I and Class II; links to Annex III |
| Art. 8 | Critical products | Commission may mandate EU cybersecurity certification; links to Annex IV |
| Art. 13 | Manufacturer obligations | Core obligation article — risk assessment, lifecycle, SBOM, support period, CE marking |
| Art. 14 | Reporting obligations | 24h/72h/14-day/30-day notification deadlines; applies from 11 Sep 2026 |
| Art. 32 | Conformity assessment | Module A / B+C / H routes; which products require third-party assessment |
| Art. 64 | Penalties | Tiered fines: €15M/2.5%, €10M/2%, €5M/1% |
| Art. 69 | Transitional provisions | Products already on market before Dec 2027 only caught by substantial modification |

***
## Part IV: Product Classification
### Three-Tier Classification Model
The CRA creates three product risk tiers:[^12][^13]

```
┌─────────────────────────────────────────────────────┐
│  CRITICAL Products (Annex IV)                       │
│  Highest risk; Commission may mandate EUCC cert     │
├─────────────────────────────────────────────────────┤
│  IMPORTANT Products (Annex III)                     │
│  Class II – Third-party assessment required         │
│  Class I  – Self-assess only if harmonised std used │
├─────────────────────────────────────────────────────┤
│  DEFAULT Products (all others)                      │
│  ~90% of products; Module A self-assessment         │
└─────────────────────────────────────────────────────┘
```

Classification is based on the product's **core functionality**, not its form factor or ancillary features.[^11][^13]

***
### Default Products
**Definition:** All PDEs not listed in Annex III (important) or Annex IV (critical).[^12][^11]

**Scale:** Estimated ~90% of all PDEs fall into this tier.

**Requirements:** All Annex I essential requirements apply identically to default products as to higher tiers. Classification only changes the **conformity assessment route**, not the substance of what must be achieved.

**Conformity Assessment:** Module A (self-assessment, no notified body involvement).[^14][^15]

**Examples:** Consumer IoT devices, most commercial software, embedded sensors, smart TVs, consumer wearables not meeting Annex III criteria.

***
### Important Products – Class I (Annex III, Part I)
**Definition:** Products whose exploitation could have "significant adverse effects" due to their function or criticality in the supply chain.[^12][^1]

**Conformity Assessment Options:**
- Module A (self-assessment) **if** harmonised standards or common specifications are applied
- Module B+C or Module H (third-party) if no harmonised standards are used
- FOSS important Class I products may self-assess if technical documentation is made public[^3]

**Annex III, Part I Product Examples:**

| Category | Examples |
|----------|---------|
| Identity & access management | IAM software/hardware, biometric readers, authentication readers |
| Browsers | Standalone and embedded browsers |
| Password managers | All password manager software/hardware |
| Anti-malware | Products that search for, remove, or quarantine malicious software |
| VPN | Products with virtual private network function |
| Network management | Network management systems |
| SIEM | Security information and event management systems |
| Boot managers | Secure boot components |
| PKI | Public key infrastructure, digital certificate issuance software |
| Network interfaces | Physical and virtual network interfaces |
| Operating systems | General-purpose OS (not already covered by higher tiers) |
| Routers / modems / switches | Internet-facing routers, modems for internet connection, switches |
| Security microprocessors | Microprocessors with security-related functionalities |
| Security microcontrollers | Microcontrollers with security-related functionalities |
| ASICs / FPGAs | With security-related functionalities |
| Smart home assistants | General purpose virtual assistants |
| Smart home security | Smart door locks, security cameras, baby monitors, alarm systems |
| Connected toys | IoT toys with social interactive or location-tracking features |
| Health wearables | Non-MDR personal health monitoring or children's wearables |

***
### Important Products – Class II (Annex III, Part II)
**Definition:** Products with "higher level of criticality" — failure could have "far greater systemic effects," disrupting, controlling or damaging many other products.[^12][^1]

**Conformity Assessment:** Always third-party (Module B+C or Module H) or EUCC certification. No self-assessment route except for FOSS products making their technical documentation public.[^3]

**Annex III, Part II Product Examples:**

| Category | Examples |
|----------|---------|
| Hypervisors | Hypervisors and container runtime systems supporting virtualized OS execution |
| Industrial firewalls / IDS / IPS | Firewalls, intrusion detection/prevention systems for **industrial use** |
| Tamper-resistant microprocessors | TPM-type hardened processors |
| Tamper-resistant microcontrollers | Secure element microcontrollers with tamper resistance |

> **OT/ICS Relevance (Tetrel):** Industrial firewalls and intrusion detection/prevention systems used in OT environments are explicitly Class II. Any Tetrel customer deploying OT-purpose IDS/IPS (e.g., Claroty, Dragos, Nozomi sensors as products) must be Class II assessed.[^1][^12]

***
### Critical Products (Annex IV)
**Definition:** The narrowest, highest-consequence tier. The Commission may by delegated act impose **mandatory European cybersecurity certification** at assurance level "substantial" or higher under the EUCC scheme (Article 8).[^1][^16]

**Annex IV Product List:**

| # | Category |
|---|---------|
| 1 | Hardware Devices with Security Boxes (HSMs) |
| 2 | Smart meter gateways within smart metering systems (per Directive (EU) 2019/944); other devices for advanced security purposes including secure cryptoprocessing |
| 3 | Smartcards or similar devices, including secure elements |

**Conformity Assessment:** Third-party assessment by a notified body, or mandatory EUCC certification where specified by Commission delegated act.[^16][^1]

> **Note:** As of May 2025, zero CDU products held IEC 62443-4-2 security level registry certification — a parallel gap that applies equally to CRA critical-product certification readiness.[^12]

***
## Part V: Essential Requirements (Annex I)
All three product tiers must meet the **same substantive requirements** in Annex I. Classification only affects how conformity is assessed and documented.[^13][^5]

Annex I is split into two Parts:

***
### Annex I – Part I: Security Properties of Products (13 Requirements)
Manufacturers must ensure products are **designed, developed, and produced** to meet these properties at point of placing on the market:[^7][^17]

| Req. | Requirement | Technical Detail |
|------|-------------|-----------------|
| **1** | **No known exploitable vulnerabilities at release** | Products must be delivered free of exploitable vulnerabilities; risk assessment must confirm this |
| **2(a)** | **Secure by default configuration** | Default settings must be secure; option to reset to original state must be available |
| **2(b)** | **Unauthorised access protection** | Authentication, identity and access management (IAM), access control mechanisms appropriate to environment |
| **2(c)** | **Confidentiality of data** | Protection of stored, transmitted, and processed data (personal and other) via state-of-the-art cryptography at rest and in transit |
| **2(d)** | **Integrity protection** | Protect integrity of stored/transmitted data, commands, programs, configuration; report corruptions |
| **2(e)** | **Data minimisation** | Process only data adequate, relevant, and limited to what is necessary for intended use |
| **2(f)** | **Availability and resilience** | Protect availability of essential functions; resilience against and mitigation of DoS attacks |
| **2(g)** | **Minimise negative network impact** | Design to minimise the product's own negative impact on availability of services on other devices or networks |
| **2(h)** | **Minimised attack surface** | Limit attack surfaces including external interfaces; by design and production |
| **2(i)** | **Incident impact reduction** | Exploit mitigation mechanisms and techniques to reduce impact of incidents |
| **2(j)** | **Security logging and monitoring** | Record and/or monitor relevant internal activity to detect and investigate incidents |
| **2(k)** | **Secure updates** | Update mechanism must not introduce additional vulnerabilities; updates must be authenticated and protect integrity |
| **2(l)** | **Secure factory reset / recovery** | Product must allow return to a known-good state |

> **Applicability note (Art. 13(3)):** The risk assessment determines which of requirements 2(a)–2(l) are applicable to a given product. Not all 13 apply to every product — the risk assessment drives the determination and must be documented.[^3][^7]

***
### Annex I – Part II: Vulnerability Handling Requirements (8 Requirements)
Manufacturers must comply with these requirements both **at placement on the market** and **throughout the support period**:[^8][^18]

| Req. | Code (BSI TR-03183) | Requirement | Detail |
|------|---------------------|-------------|--------|
| **1** | REQ_VH1 | **Identify & document vulnerabilities (SBOM)** | Maintain an SBOM in a commonly used, machine-readable format; must cover at minimum top-level dependencies; document all known vulnerabilities per component[^9][^10] |
| **2** | REQ_VH2 | **Address & remediate vulnerabilities** | Remediate and fix exploitable vulnerabilities without delay; where technically feasible, security updates must be separate from functional updates[^18] |
| **3** | REQ_VH3 | **Regular testing** | Effective and regular security tests and reviews; minimum every 3 months or on every major change, whichever is more frequent[^18] |
| **4** | REQ_VH4 | **Publish addressed vulnerabilities** | Publicly disclose fixed vulnerabilities including description, affected product identification, impact, severity, and remediation guidance; may delay until patch is available[^18] |
| **5** | REQ_VH5 | **Coordinated Vulnerability Disclosure (CVD) policy** | Implement and enforce a CVD policy; respond to reports within 5 working days (simple acknowledgement) and 10 working days (detailed feedback)[^18] |
| **6** | REQ_VH5 | **Contact address / security.txt** | Provide a contact address for vulnerability reports; publish `security.txt` per RFC 9116 at `/.well-known/security.txt`[^18] |
| **7** | REQ_VH6 | **Secure distribution of updates** | Mechanisms to securely distribute updates (encrypted, integrity-protected); where applicable, automatic security updates[^18] |
| **8** | REQ_VH7 | **Disseminate updates without delay, free of charge** | Security updates must be free of charge (consumer default); disseminated without delay; accompanied by advisory messages informing users of the vulnerability and action required[^18] |

**Support Period Minimum:** At least 5 years, or the expected lifetime of the product if shorter. Security updates must remain available for **10 years** after release. Technical file and EU DoC must be retained for **10 years**.[^8]

**Vulnerability Reporting Deadlines (Art. 14, applies from 11 September 2026):**

| Notification | Deadline | Recipient |
|-------------|----------|-----------|
| Early warning | **24 hours** of becoming aware | ENISA + national CSIRT |
| Main notification | **72 hours** | ENISA + national CSIRT |
| Final report (actively exploited vulnerability) | **14 days** after corrective/mitigating measure available | ENISA + national CSIRT |
| Final report (severe incident) | **30 days** from 72h submission | ENISA + national CSIRT |

Reporting applies to **all PDEs on the EU market**, including legacy products placed before 11 December 2027.[^3][^19]

***
## Part VI: Technical Specifications and Conformity Assessment
### Conformity Assessment Modules (Annex VIII)
| Module | Article 32 Path | Who Performs | When Used |
|--------|----------------|--------------|-----------|
| **Module A** – Internal Control | Art. 32(1)(a) | Manufacturer (self-assessment) | Default products; Class I important products where harmonised standards applied |
| **Module B** – EU-Type Examination | Art. 32(1)(b), Part I + II Annex VIII | Notified body examines design | Class I without harmonised std; Class II; Critical |
| **Module C** – Conformity to Type (Internal Production Control) | Art. 32(1)(b), Part II Annex VIII | Manufacturer, based on Module B certificate | Always follows Module B |
| **Module H** – Full Quality Assurance | Art. 32(1)(c), Part IV Annex VIII | Notified body assesses entire QMS | Class II; Critical; manufacturers with multiple/frequent product types[^20][^14] |
| **EUCC / European Cybersecurity Certification** | Art. 32(1)(d) + Art. 27(9) | ENISA-recognised certification scheme | Where Commission has specified scheme applicability; critical products |

**Module H advantage:** Covers an entire catalogue of products under one quality management system assessment. Particularly useful for manufacturers with frequent updates or multiple product types, as it eliminates per-product type examination.[^20]
### Standards and Technical Specifications
The CRA relies on **harmonised European standards** developed by CEN/CENELEC/ETSI to provide concrete implementation guidance for the Annex I requirements. Using harmonised standards creates a **legal presumption of conformity** (Article 27).[^3][^5]

Key standardisation bodies and efforts:

| Body | Role |
|------|------|
| CEN/CENELEC JTC 13 | General horizontal cybersecurity standards (EN 18045, etc.) |
| ETSI | Telecommunications-specific standards; ETSI EN 303 645 (IoT) |
| BSI (Germany) | Technical Guidelines TR-03183 (Parts 1–3): manufacturer implementation guidance |
| ENISA | CRA Single Reporting Platform; EUCC scheme |

> **Status (June 2026):** Harmonised standards under the CRA are still being finalised by CEN/CENELEC/ETSI. The BSI TR-03183 technical guidelines provide the most concrete current implementation reference.[^5]
### CE Marking Requirements (Art. 28–30)
Before placing a PDE on the EU market, the manufacturer must:
1. Complete the applicable conformity assessment procedure
2. Draw up and sign the **EU Declaration of Conformity (DoC)**
3. Affix the **CE marking** visibly to the product
4. Provide user information per Annex II (including the support period end date, month and year)[^8][^3]

***
## Part VII: Annexes — Full Descriptions and Checklists
### Annex I – Essential Cybersecurity Requirements
**Description:** The core technical standard of the CRA. Split into Part I (product security properties, 13 requirements) and Part II (vulnerability handling, 8 requirements). All PDEs in scope must meet both parts — the risk assessment determines the applicability and implementation approach for Part I requirements 2(a)–2(l).[^3][^7]

**Checklist:**
- [ ] Cybersecurity risk assessment completed and documented (Art. 13(2))
- [ ] Risk assessment covers intended purpose, foreseeable use, operational environment, assets, expected lifetime
- [ ] Product released with no known exploitable vulnerabilities (Req. 1)
- [ ] Secure-by-default configuration implemented (Req. 2a)
- [ ] Access control / authentication mechanisms in place (Req. 2b)
- [ ] Data at rest and in transit encrypted using current-state cryptography (Req. 2c)
- [ ] Data and command integrity protection implemented (Req. 2d)
- [ ] Data minimisation principle applied (Req. 2e)
- [ ] DoS resilience mechanisms for essential functions (Req. 2f)
- [ ] Product designed to minimise negative network impact (Req. 2g)
- [ ] Attack surface minimised, external interfaces limited (Req. 2h)
- [ ] Exploit mitigation techniques implemented (Req. 2i)
- [ ] Security logging and monitoring capability present (Req. 2j)
- [ ] Secure update mechanism implemented (Req. 2k)
- [ ] Secure factory reset / recovery state available (Req. 2l)
- [ ] SBOM created in machine-readable format (VH Req. 1)
- [ ] Vulnerability remediation process documented (VH Req. 2)
- [ ] Regular security testing schedule established (VH Req. 3)
- [ ] CVD policy and security.txt published (VH Req. 5/6)
- [ ] Secure update distribution mechanism implemented (VH Req. 7)
- [ ] Free security update distribution process in place (VH Req. 8)
- [ ] Support period of minimum 5 years declared

***
### Annex II – Information and Instructions to Users
**Description:** Defines the mandatory information that must accompany products on the EU market, in a language easily understood by users. This is the user-facing compliance layer.[^3]

**Required information includes:**
- Product type, batch or serial number for identification
- Manufacturer name, registered trademark, postal/email address, website
- Conditions for intended use, misuse scenarios, known risks
- The EU Declaration of Conformity (or where to find it)
- Security support period end date (month and year), displayed at point of purchase
- How to report vulnerabilities (contact address)
- Instructions for secure installation, operation, and decommissioning
- Description of cybersecurity properties relevant to users

**Checklist:**
- [ ] Product identification element (type, batch, serial)
- [ ] Manufacturer contact details (postal + digital)
- [ ] Intended use conditions documented
- [ ] Security support period end date prominently displayed
- [ ] Vulnerability reporting contact address included
- [ ] User instructions cover secure installation, operation, decommission
- [ ] EU DoC included or referenced with URL
- [ ] Language appropriate for target market(s)

***
### Annex III – Important Products with Digital Elements
**Description:** The definitive list of product categories classified as "important," split into Part I (Class I — moderate third-party risk) and Part II (Class II — higher systemic risk). Products are classified based on core functionality.[^12][^1]

Technical descriptions of these categories were adopted via Commission Implementing Regulation (EU) 2025/2392 on 28 November 2025.[^3]

**Checklist (for manufacturers of products with functionality matching Annex III):**
- [ ] Core functionality assessed against all Annex III Part I and Part II categories
- [ ] Classification as Class I or Class II determined and documented
- [ ] Conformity assessment route selected (Module A only if Class I with harmonised standards; Module B+C or H if Class II or Class I without standards)
- [ ] FOSS exception assessed if applicable (requires public technical documentation)
- [ ] Notified body identified and engaged (if required)
- [ ] Enhanced technical documentation prepared for third-party review

***
### Annex IV – Critical Products with Digital Elements
**Description:** Three specific product categories subject to the most stringent obligations, with potential for mandatory EUCC certification by Commission delegated act:[^1][^16]

1. **Hardware Devices with Security Boxes** (HSMs)
2. **Smart meter gateways** within smart metering systems (Directive (EU) 2019/944) and other devices for advanced security purposes including secure cryptoprocessing
3. **Smartcards or similar devices, including secure elements**

**Checklist:**
- [ ] Product assessed against all three Annex IV categories
- [ ] Critical classification documented
- [ ] Third-party notified body assessment initiated
- [ ] EUCC certification applicability checked (Commission delegated acts)
- [ ] Enhanced post-market monitoring plan established
- [ ] Coordination with ENISA on reporting platform registration

***
### Annex V – EU Declaration of Conformity (Full Model)
**Description:** Provides the mandatory template structure for the full EU Declaration of Conformity that manufacturers must draw up and sign before CE marking.[^3]

**Required DoC Elements:**
- Product identification (name, model, batch/serial number)
- Manufacturer name and full address
- Statement that the DoC is issued under the sole responsibility of the manufacturer
- Object of declaration identified sufficiently to trace to the product
- Reference to the CRA (Regulation (EU) 2024/2847) and Annex I
- Reference to any harmonised standards applied
- Reference to any common specifications applied
- Reference to any European cybersecurity certification used
- Identification of notified body (if third-party assessment used), assessment module, and certificate number
- Signed declaration by or on behalf of the manufacturer, date and place

**Checklist:**
- [ ] All required fields completed
- [ ] Standards/specifications applied cited with version/date
- [ ] Notified body number and certificate number included (if applicable)
- [ ] DoC signed by authorised person
- [ ] DoC retained for 10 years
- [ ] DoC available to market surveillance authorities on request
- [ ] Simplified DoC (Annex VI) used for Class I products if permitted

***
### Annex VI – Simplified EU Declaration of Conformity
**Description:** Abbreviated DoC format permitted for products where regulations allow a simplified declaration (primarily for space-constrained products). The simplified DoC must reference where the full DoC can be found.[^3]

**Required Simplified DoC Elements:**
- Product name and type
- Manufacturer name and address
- Statement of conformity with Regulation (EU) 2024/2847
- Website URL where full DoC can be accessed

**Checklist:**
- [ ] Check whether simplified DoC is permitted for product category
- [ ] URL to full DoC active and accessible
- [ ] Simplified DoC included in product packaging or documentation

***
### Annex VII – Technical Documentation
**Description:** Specifies the minimum content of the Technical Documentation (Technical File) that must be drawn up before placing the product on the market and kept available for market surveillance authorities.[^8][^21]

Technical Documentation must be assembled **before** market placement and maintained for **10 years after**.[^8]

**Annex VII Content Requirements:**

| Part | Content |
|------|---------|
| **Product description and intended use** | Type, model, version, intended use, operational environment, connectivity, dependencies |
| **Design and manufacturing information** | Architecture (hardware and software), module breakdown, firmware, network architecture, data flow diagrams, third-party components |
| **Cybersecurity risk assessment** | Per Article 13(2)–(3); threat identification, risk determination, Annex I applicability determination |
| **Essential requirements implementation** | Mapping of each applicable Annex I requirement to implemented technical controls |
| **SBOM** | Machine-readable SBOM covering top-level dependencies; component names, versions, suppliers, known CVEs, licences |
| **Update and patch management** | Update architecture, signing/validation, rollback prevention, lifecycle policy |
| **Vulnerability handling processes** | CVD policy, intake and triage process, remediation workflows, disclosure timelines |
| **Security testing evidence** | Penetration test summaries, SAST/DAST results, fuzzing results, third-party test reports |
| **Conformity assessment evidence** | Module A self-declaration or Module B certificate / Module H QMS certificate |
| **EU Declaration of Conformity** | Copy of completed Annex V DoC |
| **Post-market monitoring plan** (Annex VII, post-market component) | Monitoring strategy, threat intel sources, incident response documentation, vulnerability register |

**Checklist:**
- [ ] Product description and intended use — complete
- [ ] Architecture diagrams (hardware, software, network, data flow) — complete
- [ ] Cybersecurity risk assessment documented and signed
- [ ] Annex I requirements mapping matrix — complete
- [ ] SBOM generated in machine-readable format (SPDX, CycloneDX, or SWID)
- [ ] All SBOM dependencies — name, version, supplier, CVE status, licence
- [ ] Secure development lifecycle (SDL) documentation included
- [ ] Security testing evidence (pentest, SAST, DAST, fuzzing) archived
- [ ] Update mechanism architecture documented
- [ ] Vulnerability handling process documented
- [ ] CVD policy and security.txt file documented
- [ ] EU DoC (Annex V) included
- [ ] Post-market monitoring plan included
- [ ] Technical file retained for 10 years from market placement
- [ ] Designated contact for MSA data requests

***
### Annex VIII – Conformity Assessment Procedures
**Description:** Specifies the four assessment modules available under Article 32, defining the obligations of the manufacturer and notified body for each:[^20][^14]

**Part I – Module A (Internal Control / Self-Assessment):**
- Manufacturer performs all conformity assessment activities
- No notified body involvement
- Manufacturer compiles technical documentation and signs EU DoC
- Available for: Default products; Class I Important products where harmonised standards or common specifications are applied[^14]

**Part II – Module B (EU-Type Examination):**
- Manufacturer submits technical documentation and representative sample to notified body
- Notified body examines product design and issues EU-Type Examination Certificate
- Certificate valid 5 years, renewable
- Must be followed by Module C[^14]

**Part III – Module C (Conformity to EU-Type Based on Internal Production Control):**
- Follows Module B
- Manufacturer declares production conforms to approved type
- No further notified body involvement in production phase[^14]

**Part IV – Module H (Full Quality Assurance):**
- Manufacturer implements a complete quality management system covering design through production
- Notified body assesses the entire QMS (can be based on ISO 9000 series, but ISO 9000 certification alone is insufficient)
- Notified body conducts periodic audits
- Manufacturer declares conformity based on QMS
- Best for manufacturers with multiple product types or frequent updates[^20][^14]
- One notified body covers the whole QMS

**Checklist:**
- [ ] Product classification confirmed (Default / Class I / Class II / Critical)
- [ ] Harmonised standards availability checked (determines Module A eligibility for Class I)
- [ ] Conformity assessment route documented and justified
- [ ] Notified body identified and contracted (if required)
- [ ] Module A: Technical documentation complete; self-declaration signed
- [ ] Module B: Application submitted to notified body; EU-Type certificate received
- [ ] Module C: Production conformity declaration signed referencing Module B certificate
- [ ] Module H: QMS documented and submitted; notified body approval received; periodic audit schedule set
- [ ] Notified body ID number recorded in EU DoC

***
## Part VIII: Enforcement, Penalties, and Market Surveillance
### Penalty Tiers (Article 64)[^22][^19][^4]
| Violation | Maximum Fine | % of Global Annual Turnover |
|-----------|-------------|----------------------------|
| Non-compliance with essential cybersecurity requirements (Annex I) or Art. 13/14 manufacturer obligations | **€15,000,000** | **2.5%** (whichever is higher) |
| Non-compliance with other obligations (importers, distributors, conformity, CE marking, technical documentation) | **€10,000,000** | **2.0%** (whichever is higher) |
| Supplying incorrect, incomplete, or misleading information to notified bodies or market surveillance authorities | **€5,000,000** | **1.0%** (whichever is higher) |

**SME exemption:** Microenterprises and small enterprises cannot be fined for failures to meet the 24-hour early warning reporting deadline. Open-source software stewards are not subject to penalties for any CRA infringement.[^3]

**Non-monetary enforcement:** Market surveillance authorities can require product withdrawal or corrective action; products found non-compliant may be barred from the EU market.[^19]
### Market Surveillance Structure
- Each Member State designates one or more **Market Surveillance Authorities (MSAs)** under Article 52
- Cross-border coordination via **Administrative Cooperation Group (ADCO)** — Article 52
- **Joint sweeps** and coordinated control actions enabled under Article 60
- MSAs can access technical documentation, test products, and issue orders for corrective action, withdrawal, or recall[^3][^4]

***
## Part IX: Timeline Summary and Compliance Roadmap
| Date | Obligation |
|------|-----------|
| **10 Dec 2024** | CRA entered into force |
| **11 Jun 2026** | Member States must notify conformity assessment bodies (Ch. IV applies) |
| **11 Sep 2026** | Reporting obligations (Art. 14) apply — 24h/72h/14d/30d deadlines active for all PDEs on EU market including legacy |
| **11 Dec 2027** | Full CRA applicability — CE marking, DoC, conformity assessment, and all obligations mandatory for new products |
| **11 Jun 2028** | Existing EU-type examination certificates and approval decisions expire |

**Substantial modification rule:** Products placed on the market **before 11 December 2027** are exempt unless they undergo a "substantial modification" after that date (defined in Article 3(30), Recitals 38–41).[^1][^3]

**Immediate action items (pre-December 2027):**
1. Classify all products against Annex III/IV
2. Conduct cybersecurity risk assessment per Art. 13(2)
3. Establish SBOM tooling and CVD policy infrastructure
4. Register on ENISA Single Reporting Platform (for Art. 14 compliance by Sep 2026)
5. Identify notified body for Class II or Critical products
6. Begin technical documentation compilation
7. Map Annex I requirements to existing security controls and identify gaps

---

## References

1. [Exclusions and Transitional Scope under the EU Cyber Resilience Act](https://www.linkedin.com/pulse/exclusions-transitional-scope-under-eu-cyber-resilience-ian-gauci-frwce) - The Cyber Resilience Act, Regulation (EU) 2024/2847, introduces for the first time a horizontal fram...

2. [The Cyber Resilience Act: an overview - Cyberstand](https://cyberstand.eu/cyber-resilience-act-overview) - The Cyber Resilience Act (CRA) was published in the EU Official Journal on 20 November 2024 and offi...

3. [The Cyber Resilience Act - Summary of the legislative text](https://digital-strategy.ec.europa.eu/en/policies/cra-summary) - The text below summarises the main provisions of Regulation (EU) 2024/2847, in order to support the ...

4. [Cyber Resilience Act: Overview for affected companies](https://www.taylorwessing.com/en/insights-and-events/insights/2025/11/cyber-resilience-act-overview) - Under Article 64 CRA, violations can result in fines of up to EUR 15 million or 2.5 % of the company...

5. [Cyber Resilience Act - BSI](https://www.bsi.bund.de/EN/Themen/Unternehmen-und-Organisationen/Informationen-und-Empfehlungen/Cyber_Resilience_Act/cyber_resilience_act_node.html) - The Cyber Resilience Act is the first European regulation to set a minimum level of cyber security f...

6. [Beyond the Checklist: Which products fall under scope of the EU ...](https://nohau.eu/blogs/knowledge-center/beyond-the-checklist-which-products-fall-under-scope-of-the-eu-cyber-resilience-act-cra) - Critical (Annex IV) – Highest-risk PDEs, such as smart meter gateways, secure elements, or hardware ...

7. [Cyber Resilience Act text, Article 13](https://www.european-cyber-resilience-act.com/Cyber_Resilience_Act_Article_13.html) - Manufacturers shall undertake an assessment of the cybersecurity risks associated with a product wit...

8. [CRA guide for manufacturers - Cyber Resilience Act](https://www.cyberresilienceact.eu/cra-guide-for-manufacturers/) - 01Confirm scope and classification ; 02Run a cybersecurity risk assessment ; 03Meet the essential re...

9. [Mandatory SBOMs: What CRA is — and why it matters | RL Blog](https://www.reversinglabs.com/blog/mandatory-sbom-cra) - The EU's Cyber Resilience Act introduces a legal obligation for software producers to create, mainta...

10. [CRA SBOM Requirements: Complete Guide - Regulus](https://goregulus.com/cra-requirements/cra-sbom-requirements/) - SBOMs are directly tied to Annex I Section 2 of the CRA, which defines vulnerability handling rules....

11. [Does the EU Cyber Resilience Act Apply to Your Product? Functions ...](https://testofthings.com/blog/does-cra-apply-to-your-product-product-functions-boundaries-and-components) - Depending on the core functionality your product may be categorized as default, important class I, i...

12. [The 3 product categories covered by the Cyber Resilience Act](https://theembeddedkit.io/blog/product-categories-cyber-resilience-act/) - The CRA classifies products with digital components into 3 product categories: default, important, a...

13. [How to Classify IoT Products under the CRA - Tributech](https://www.tributech.io/blog/classify-iot-products-cyber-resilience-act) - All classes must meet the same 13 essential cybersecurity requirements in Annex I. Your classificati...

14. [Step 6: Which Conformity Assessment Procedure Applies? - LinkedIn](https://www.linkedin.com/pulse/step-6-which-conformity-assessment-procedure-applies-michael-jesse-szpkf) - Module H, set out in Part IV of Annex VIII CRA, is the most comprehensive conformity assessment opti...

15. [Understanding the EU Cyber Resilience Act Requirements](https://finitestate.io/blog/conformity-assessments-eu-cra-requirements) - TL;DR A CRA conformity assessment is how you prove a connected product meets the EU Cyber Resilience...

16. [CRA - Annex IV - StreamLex](https://streamlex.eu/annexes/cra-en-annex-iv/) - Annex IV. CRITICAL PRODUCTS WITH DIGITAL ELEMENTS 1. Hardware Devices with Security Boxes 2. Smart m...

17. [Cyber Resilience Act text, Annex 1 (15.9.2022)](https://www.european-cyber-resilience-act.com/Cyber_Resilience_Act_Annex_1.html) - VULNERABILITY HANDLING REQUIREMENTS. Manufacturers of the products with digital elements shall: (1) ...

18. [EU CRA: Essential Requirements Related to Vulnerability Handling](https://www.smallstepsystems.com/eu-cra-essential-requirements-related-to-vulnerability-handling/) - The eight requirements define how the manufacturer's process for vulnerability handling must look. T...

19. [Penalties for CRA Non-Compliance Explained - © Complyd 2025](https://complyd.io/en/blog/compliance-info-penalties-for-cra-non-compliance-explained/) - Max Fine, % of Global Turnover. Core cybersecurity obligations (manufacturers), €15 million, 2.5%. I...

20. [What is module H? How does it work? - CRA FAQ](https://cra.orcwg.org/faq/official/faq_6-3/) - Module H, set out in Part IV of Annex VIII, is a conformity assessment procedure in which the manufa...

21. [Cyber Resilience Act Technical Documentation Guide (Annex II & VII)](https://goregulus.com/cra-documentation/technical-documentation/) - Annex II defines the core Technical Documentation for conformity assessment. ... Part 6 — Conformity...

22. [Cyber Resilience Act text, Article 53 (15.9.2022)](https://www.european-cyber-resilience-act.com/Cyber_Resilience_Act_Article_53_15.9.2022.html) - The non-compliance with any other obligations under this Regulation shall be subject to administrati...

