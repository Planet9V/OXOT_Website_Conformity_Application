# CRA CE Marking Pathways: Conformity Assessment Deep Reference
## Regulation (EU) 2024/2847 — Module Analysis, Notified Body Engagement, Declaration of Conformity, and Organisational Capability Blocks

> **Intended Use:** This reference is designed for product teams, compliance leads, and security architects planning CE marking campaigns under the CRA. It covers every conformity pathway, process architecture, DoC requirements, notified body engagement mechanics, and practical capability blocks organisations can adapt as programme blueprints.

***

## Part I — Architecture of the CRA Conformity System

### 1.1 Statutory Basis

The conformity assessment obligation derives from **Article 32** of Regulation (EU) 2024/2847:

> *"The manufacturer shall demonstrate conformity with the essential cybersecurity requirements by one of the following procedures: (a) internal control (based on Module A) in accordance with Annex VIII; (b) EU-type examination (based on Module B) in accordance with Annex VIII, followed by conformity to type based on internal production control (based on Module C) in accordance with Annex VIII; (c) conformity based on full quality assurance (based on Module H) in accordance with Annex VIII; or (d) where available and applicable, a European cybersecurity certification scheme pursuant to Article 27(9)."*[^1]

The modules originate from the EU **New Legislative Framework (NLF)** — Decision 768/2008/EC — and are well-established across other CE-marking regulations (Radio Equipment Directive, Medical Device Regulation, Machinery Regulation). The CRA adapts them to the cybersecurity domain.[^2]

### 1.2 CE Marking as the Market Access Gate

From **11 December 2027**, no product with digital elements may be legally placed on the EU market without a valid CE marking demonstrating CRA conformity. The CE mark is affixed **only** after:[^3]
1. The conformity assessment procedure is completed
2. The EU Declaration of Conformity is drawn up and signed
3. All technical documentation is compiled[^4]

The CE marking does not have an expiry date, but must be removed or updated if the product undergoes a substantial modification that affects compliance.[^5]

### 1.3 The Classification Gate Controls the Module

The choice of module is **not free** — it is determined by the product's risk classification under Articles 6–8:

| Product Classification | Available Modules | Self-Assessment Permitted? |
|---|---|---|
| **Default** | Module A only[^6] | Yes — always |
| **Important Class I** (Annex III, Class I) | Module A if full harmonised standard applied; else Module B+C or H[^7] | Yes, IF harmonised standard covers all requirements |
| **Important Class II** (Annex III, Class II) | Module B+C or Module H only[^7] | No — never |
| **Critical** (Annex IV) | European cybersecurity certification scheme; if none, Module B+C or H[^8] | No — never |

The single most consequential compliance decision is therefore the classification, not the technical implementation. Getting classification wrong late in the programme can invalidate the entire conformity assessment.[^9]

***

## Part II — Module A: Internal Control (Self-Assessment)

### 2.1 Legal Basis and When It Applies

Module A is set out in **Part I of Annex VIII** of the CRA. It is the "default" path: no notified body, no external audit, manufacturer-sole-responsibility declaration. It applies to:[^1]
- All Default products, regardless of how the manufacturer demonstrates compliance technically (even if they use no harmonised standard)[^6]
- Important Class I products where the manufacturer has **fully applied** a harmonised standard or relevant European cybersecurity certification scheme covering all applicable Annex I requirements[^10]

> *"Module A, laid down in Part I of Annex VIII CRA, is the most straightforward conformity assessment procedure. It is a self-assessment, carried out entirely under the manufacturer's sole responsibility. No notified body is involved."*[^1]

### 2.2 Critical Constraint: Harmonised Standard Timing for Class I

As of June 2026, **no harmonised CRA standards have been cited in the EU Official Journal**. This means that as of today, all Important Class I manufacturers are using the third-party pathway (Module B+C or H) by default — the Module A self-assessment path for Class I is temporarily blocked until OJEU citation occurs, expected approximately Q2 2027. Manufacturers of Class I products targeting a December 2027 CE marking must plan for a two-phase approach:[^11][^12]
- **Phase 1 (now–Q2 2027):** Execute Module B+C or H with a notified body, or pre-develop all evidence against the anticipated harmonised standard
- **Phase 2 (after OJEU citation):** Where the harmonised standard fully covers the product, transition to Module A self-assessment for future product versions

### 2.3 Module A Process Steps — Step-by-Step

#### Step 1 — Product Scope and Classification Verification

Before initiating Module A, confirm the product is genuinely in the Default category or that the full harmonised standard covers all applicable Annex I requirements for Class I. Maintain a documented **Classification Decision Record** (CDR) with references to specific Annex III exclusion analysis, product boundary definition, and intended-use statement.

*Capability Block: CDR Template*
```
CLASSIFICATION DECISION RECORD
Product: [Name, Model, Version(s)]
Author: [Name, Role]           Date: [YYYY-MM-DD]
---------------------------------------------------------
Section A: CRA Scope Assessment
  A1. Is this a PDE per Article 3(1)?         [Y/N + justification]
  A2. Any Article 2 exclusion applicable?     [Y/N + justification]
  A3. Remote data processing present?         [Y/N + description]

Section B: Classification Analysis
  B1. Is product listed in Annex III Class I? [Y/N + specific item]
  B2. Is product listed in Annex III Class II?[Y/N + specific item]
  B3. Is product listed in Annex IV?          [Y/N + specific item]
  B4. Classification result:                  [Default / Imp.I / Imp.II / Critical]

Section C: Module Selection
  C1. If Default: Module A confirmed          [confirm]
  C2. If Important Class I: Harmonised std?   [Std ref + OJEU date / Not available]
  C3. Module selected:                        [A / B+C / H / EUCC]

Approved by: [Signatory]        Role: [Position with legal authority]
```

#### Step 2 — Cybersecurity Risk Assessment (Article 13(2)–(3))

The risk assessment is the foundational document for Module A. It must:
- Identify the threat profile and intended operational environment
- Map each Annex I, Part I, point (2)(a)–(m) requirement to a determination of applicability
- Document how applicable requirements are implemented
- Document non-applicable requirements with *"a clear justification"* (Article 13(4))[^13]
- Cover both security properties (Part I) and vulnerability handling (Part II)

*Capability Block: Risk Assessment Structure for Module A*
```
CRA CYBERSECURITY RISK ASSESSMENT
Product: [Name, Model, Version]       Classification: [Default/Class I]
Risk Assessment Version: [x.y]        Date: [YYYY-MM-DD]
-----------------------------------------------------------------------
1. PRODUCT PROFILE
   1.1 Intended purpose and use cases
   1.2 Connectivity interfaces (wired, wireless, protocols)
   1.3 Operational environment (home/enterprise/industrial/critical)
   1.4 User types (consumer/professional/administrator)
   1.5 Expected product lifetime and support period rationale

2. THREAT LANDSCAPE
   2.1 Threat actor profile (opportunistic / targeted / IACS-specific)
   2.2 Attack vectors (network / local / physical / supply chain)
   2.3 Assets requiring protection (data, functionality, users)
   2.4 Relevant threat intelligence sources consulted

3. ANNEX I PART I REQUIREMENTS MAPPING
   For each sub-requirement (a) through (m):
   | Req | Applicable? | Justification | Implementation |
   |-----|-------------|---------------|----------------|
   |(a) No known vulns | YES | Connected product | SBOM-gated release + pre-release scan |
   |(b) Secure by default | YES | Consumer-facing | No default passwords; factory reset |
   |(c) Security updates | YES | Networked | Auto-update default with opt-out |
   |(d) Access control | YES | Multi-user API | MFA for admin; RBAC |
   |(e) Data confidentiality | YES | PII in transit | TLS 1.3; AES-256 at rest |
   |(f) Data integrity | YES | Config protected | HMAC on config; signed firmware |
   |(g) Data minimisation | YES | Telemetry collected | Scope-limited collection policy |
   |(h) Availability | YES | Network-connected | Rate limiting; DoS protections |
   |(i) Attack surface | YES | Internet-facing | Closed unnecessary ports/services |
   |(j) Incident impact | YES | Networked | Network segmentation; containment |
   |(k) Logging | YES | Enterprise use | Audit log with opt-out |
   |(l) Data deletion | YES | User data stored | Secure wipe on factory reset |
   |(m) Reduce exposure | YES | All products | SDL applied; minimal footprint |

4. ANNEX I PART II REQUIREMENTS MAPPING
   [Same table format for each of the 8 VH requirements]

5. RISK CONCLUSION
   5.1 Overall risk profile
   5.2 Residual risks and mitigations
   5.3 Support period determination and rationale
```

#### Step 3 — Implement Security Controls and Validate

Implement all applicable Annex I requirements. For Module A, the manufacturer is responsible for selecting the validation methods — test reports, static/dynamic analysis, penetration test summaries, or design analysis — and retaining evidence. There is no external verification requirement for Module A.[^9]

Recommended evidence set for Default products:
- Pre-release vulnerability scan report (tooling: Grype, Trivy, Semgrep, or equivalent)
- SBOM for each release version (CycloneDX or SPDX format)
- Penetration test summary or design-based security analysis (proportionate to product risk)
- Secure configuration review documentation
- Test cases demonstrating: authentication lockout, update mechanism integrity, factory reset function, access control enforcement

#### Step 4 — Compile Technical Documentation (Article 31, Annex VII)

Assemble the complete technical file. This is the same evidence package required regardless of module, and is the document an assessor or market surveillance authority will examine. See Part V of this report for the full Annex VII element list.

#### Step 5 — Draw Up and Sign EU Declaration of Conformity (Article 28, Annex V)

Issue the DoC using the Annex V structure (see Part VI). The DoC may not be signed before the conformity assessment is completed and evidence compiled. The DoC must be reviewed and updated if the product is substantially modified.[^5]

#### Step 6 — Affix CE Marking and Manage Production Conformity

Affix the CE mark visibly, legibly, and indelibly to the product, packaging, or — for software — accompanying documentation or download page. For Module A, the manufacturer must have internal controls to ensure that production units (subsequent releases) continue to conform to the assessed version. Where a new software version is released, an assessment of whether it constitutes a substantial modification is required.[^7][^14]

### 2.4 Module A Timing Benchmark

A well-prepared organisation with existing SBOM tooling and a security development lifecycle (SDL) should allow:

| Activity                                     | Duration                       |
| -------------------------------------------- | ------------------------------ |
| Classification decision and risk assessment  | 4–8 weeks                      |
| Security implementation and internal testing | 8–16 weeks (product-dependent) |
| Technical documentation compilation          | 4–6 weeks                      |
| DoC preparation, legal review, and signature | 1–2 weeks                      |
| **Total (new product, Module A)**            | **17–32 weeks**                |

For existing products with a mature security posture, technical documentation compilation is typically the critical-path item.

***

## Part III — Module B+C: EU-Type Examination with Notified Body

### 3.1 Legal Basis and When It Applies

Module B+C is set out in **Parts II and III of Annex VIII**. It combines:[^1]
- **Module B** — EU-type examination by a notified body of the product *type* (design and architecture)
- **Module C** — ongoing conformity to type based on the manufacturer's internal production control

Module B+C is required for:[^8][^7]
- Important Class I products where no applicable harmonised standard has been fully applied
- **All** Important Class II products
- Critical products where no mandatory EUCC certification scheme has been designated

> *"Under this procedure, the manufacturer remains responsible for implementing cybersecurity measures, testing the product and preparing the technical documentation. The notified body, however, plays a central role by assessing the technical design of the product based on documentation and samples, and by performing or commissioning the necessary tests."*[^1]

### 3.2 What a Notified Body Is and How It Is Designated

A notified body (NB) is a **conformity assessment body (CAB) designated by an EU Member State** to carry out third-party assessment under the CRA. Designation requires:[^11]
1. The CAB applies to the national authority (Notifying Authority) for designation
2. The national authority verifies the CAB meets Article 43 CRA requirements: technical competence, independence, impartiality, adequate insurance, and domain knowledge[^15]
3. Accreditation by a National Accreditation Body (NAB) under EN ISO/IEC 17065 (product certification) or EN ISO/IEC 17021 (management system certification)
4. Formal notification to the European Commission via NANDO (Notification And Database Online)
5. Listing in the NANDO database, after which the NB may receive its identification number (a 4-digit NANDO number printed alongside the CE mark)[^15]

**CRA Notified Body Availability — June 2026 Status:**

> *"On 11 June 2026, the CRA's rules on notified bodies started to apply, but none are designated yet."*[^11]

The notified body designation and accreditation process typically takes **12 to 18 months**. This means the pool of CRA-designated notified bodies will remain extremely small well into 2027. Several organisations that serve as notified bodies under the Radio Equipment Directive (RED), the Medical Device Regulation (MDR), and the Machinery Regulation have announced CRA readiness programmes, including TÜV Rheinland, TÜV SÜD, BSI Group, SGS, Bureau Veritas, and Applus+ Laboratories.[^16][^17][^7]

The practical consequence: **demand for CRA notified body services will far exceed capacity in 2026–2027**. Manufacturers requiring Module B+C or H must enter the queue immediately.[^16]

### 3.3 Module B: EU-Type Examination — Step-by-Step Process

The notified body conducts the EU-type examination (Module B) against the technical documentation and a representative product sample. The examination covers both the technical design and the vulnerability handling processes.

#### Phase 1 — Pre-Engagement and Notified Body Selection

Before submitting an application:
- Identify candidate notified bodies via NANDO database (search for CRA scope once designations appear)
- Verify the NB has technical competence in the product domain (software products, IoT, industrial control systems, embedded systems — different NBs may have different scopes)[^7]
- Request a scoping call to understand NB-specific submission requirements and timelines
- Obtain a preliminary cost and timeline estimate — costs vary significantly by NB, product complexity, and assessment scope

*Capability Block: Notified Body Evaluation Scorecard*
```
NOTIFIED BODY EVALUATION MATRIX
Evaluation Date: [YYYY-MM-DD]    Product: [Name, Class]
---------------------------------------------------------
Candidate NB: [Name]
  NANDO Number: [####]           NANDO Scope: [CRA / RED / MDR]
  Domain Expertise:
    - Software/firmware:         [High / Medium / Low / Unknown]
    - ICS/OT products:           [High / Medium / Low / Unknown]
    - Consumer IoT:              [High / Medium / Low / Unknown]
    - Industrial Class II:       [High / Medium / Low / Unknown]
  Capacity Assessment:
    - Current backlog (months):  [estimate from scoping call]
    - Earliest intake date:      [YYYY-MM]
    - Estimated assessment duration: [months]
    - Surveillance commitment:   [annual / biennial / other]
  Cost Estimate:
    - Module B examination:      [€ range]
    - Annual surveillance:       [€ range]
  Communication Quality:         [Score 1–5]
  Geographic Coverage:           [EU / Global]
  Languages:                     [list]
  Reference clients available?   [Y/N]
  ---------------------------------------------------------
  RECOMMENDATION: [Selected / Reserve / Rejected]
  Rationale: [notes]
```

#### Phase 2 — Application Submission

Submit a formal application to the chosen NB. Standard submission content:

- Completed NB application form (NB-specific format)
- Annex VII technical documentation package (see Part V) — provided as a structured PDF or document portal submission
- One or more representative product samples for physical examination (hardware products) or access credentials (software/cloud)
- Draft EU Declaration of Conformity (pre-signature version)
- Confirmation of the Annex I applicability decisions made by the manufacturer
- List of harmonised standards, common specifications, or technical specifications applied[^18]

The NB will issue an **acceptance confirmation** within typically 2–4 weeks of submission, confirming the application is complete and examination is scheduled.

#### Phase 3 — Technical Documentation Review (Module B, Phase 1)

The NB conducts a desk review of the technical documentation:

- Verifies completeness of Annex VII content
- Reviews the risk assessment and Annex I applicability decisions
- Assesses the cybersecurity architecture against Annex I Part I requirements
- Reviews the SBOM and vulnerability handling process documentation
- Reviews CVD policy, single point of contact, and Article 14 reporting capability documentation
- Reviews test plans and existing test evidence
- Issues a **Technical Documentation Review Report** identifying any gaps (non-conformities or observations)

The manufacturer must resolve all identified non-conformities before the NB proceeds. Gaps identified during review that require remediation extend the total timeline — often by 4–8 weeks per remediation cycle.[^17]

#### Phase 4 — Product Testing and Examination

For hardware products, the NB examines the submitted sample(s). For software, the NB assesses in a test environment or via documented analysis. The examination may include:

- Functional security testing of implemented controls (authentication, access control, cryptographic implementations)
- Review of update mechanism integrity (signing, rollback protection)
- Validation of secure default configuration
- Assessment of SBOM accuracy against the actual product binary
- Verification that no known exploitable vulnerabilities exist in the submitted version (live CVE check against SBOM)
- Vulnerability handling process walk-through (procedural assessment)[^19][^17]

#### Phase 5 — EU-Type Examination Certificate Issuance

If the examination is successful:

> *"If the notified body concludes that the product complies with the CRA, it issues an EU-type examination certificate, valid for a defined period."*[^1]

The EU-type examination certificate contains:
- NB name and identification number
- Manufacturer name and address
- Product identification (type, model, versions examined)
- Examination result and conditions/limitations
- Validity period (typically 5 years, subject to surveillance)
- References to the standards or technical specifications applied in the examination
- Signed by the responsible NB examiner[^1]

The certificate covers the specific product *type* — the design examined. All production units (Module C) must conform to this type.

#### Phase 6 — Module C: Conformity to Type (Manufacturer Responsibility)

Module C is the manufacturer's obligation to ensure ongoing production conformity to the approved type. Under the CRA, Module C requires:

- Internal production controls that prevent manufactured units (or software releases) from deviating from the examined type
- Where a new version deviates from the examined type in a security-relevant way, the manufacturer must notify the NB to determine whether a new examination is required
- Any modification affecting the Annex I security properties or intended purpose that constitutes a substantial modification requires a new Module B examination and a new certificate[^2]

*Capability Block: Module C Production Conformity Procedure*
```
MODULE C: PRODUCTION CONFORMITY PROCEDURE

Purpose: Ensure each release conforms to the Module B examined type.
Applies to: All releases of [Product Name] post-certificate issuance.
Owner: [Product Security Lead / QMS Owner]

CHANGE CLASSIFICATION GATE (per release):
For every proposed change, assess against the examined type:

  1. Does the change affect any Annex I security property?     [Y/N]
  2. Does the change modify a component listed in the SBOM?    [Y/N]
  3. Does the change alter the product's intended purpose?     [Y/N]
  4. Does the change modify a security-relevant architecture element? [Y/N]

  If ALL answers = N: Minor change, Module C controls apply, no NB notification needed.
  If ANY answer = Y: Assess severity:
    - Security improvement only (no new risk): Document, update tech file, notify NB informally.
    - New security risk or changed intended purpose: Treat as substantial modification.
      Action: Suspend CE marking for affected versions; initiate new Module B examination.

RELEASE GATE CHECKLIST:
  □ Change Classification Gate completed and documented
  □ SBOM updated to reflect release component set
  □ CVE scan against updated SBOM — zero known exploitable vulnerabilities
  □ Test report confirming conformity to examined type
  □ Technical documentation updated (version incremented)
  □ DoC updated if product version scope changes
  □ NB notification completed (if required by classification gate)
```

### 3.4 Module B+C Timing Benchmark

| Phase | Estimated Duration |
|---|---|
| Notified body selection and scoping | 4–8 weeks |
| Application preparation and submission | 6–12 weeks |
| NB intake acceptance | 2–4 weeks |
| Technical documentation review | 4–8 weeks |
| Remediation cycle (if non-conformities identified) | 4–8 weeks per cycle |
| Product examination and testing | 4–8 weeks |
| Certificate issuance | 2–4 weeks |
| DoC preparation, review, signing | 1–2 weeks |
| **Total (well-prepared organisation)** | **4–8 months** |
| **Total (gaps requiring remediation)** | **8–14 months** |

These estimates are based on analogous experience under other EU NLF frameworks (RED, MDR) and reflect the anticipated CRA process. Given notified body capacity constraints in 2026–2027, add 2–4 months for queue wait time for most manufacturers entering the process in late 2026 or early 2027.[^20][^16]

**Critical implication:** For Important Class II products targeting 11 December 2027, the Module B+C process must be initiated by approximately **February–March 2027** at the absolute latest — ideally Q4 2026.[^20]

***

## Part IV — Module H: Full Quality Assurance

### 4.1 Legal Basis and Concept

Module H is set out in **Part IV of Annex VIII** and represents the most flexible third-party pathway for organisations with a broad product portfolio:[^21]

> *"Module H, set out in Part IV of Annex VIII, is a conformity assessment procedure in which the manufacturer implements a full quality control system that ensures that the products subject to this system comply with the essential requirements of the CRA in both the design and the production phases."*[^21]

Unlike Module B+C, which focuses on a specific product *type*, Module H assesses the manufacturer's **quality management system (QMS)** across a defined product portfolio. Individual products do not each undergo separate examination — instead, the NB verifies that the QMS is capable of consistently producing CRA-compliant products.[^22]

### 4.2 Module H vs. Module B+C: Strategic Comparison

| Dimension | Module B+C | Module H |
|---|---|---|
| Assessment focus | Individual product type design | Manufacturer's QMS across product portfolio[^21] |
| NB involvement | Per-product examination + certificate | QMS audit + ongoing surveillance visits[^17] |
| Scalability | Low — each new product type needs new examination | High — new products added to existing QMS scope via extension[^21] |
| Initial investment | Lower (single product) | Higher (QMS design, documentation, audit preparation) |
| Ongoing cost | Per-product + surveillance | Annual/biennial surveillance, product addition assessments[^17] |
| Best for | Narrow product portfolio; few new products per year | Broad portfolio; frequent new product introductions |
| ISO 9000 relevance | None | ISO 9000/9001 provides useful framework, but does NOT automatically qualify — NB assessment is still required[^21] |
| Flexibility for product updates | Requires NB notification for type changes | Updates assessed through QMS change control; NB review of changes[^21] |
| Documentation overhead | Per-product technical file | QMS documentation + per-product conformity records within QMS |

> *"Module H is built around a full quality control system covering design, development, testing, production and vulnerability handling. Instead of focusing on individual products, it provides a more versatile and flexible framework compared to module B+C."*[^2]

### 4.3 Module H QMS Structure and Content

The QMS under Module H must cover the full product lifecycle. CRA Annex VIII Part IV requires the QMS to document and control:[^21]

**Design and Development Controls:**
- Procedures for conducting cybersecurity risk assessments (Article 13(2)–(3))
- Secure development lifecycle (SDL) methodologies applied
- Methods for determining Annex I requirement applicability
- Security architecture review processes
- Criteria for selecting cryptographic algorithms and key lengths (state-of-the-art assessment)
- Methods for generating and maintaining SBOMs per release

**Testing and Verification Controls:**
- Security testing programme: penetration testing, fuzzing, static analysis, dynamic analysis
- Test coverage requirements per product risk class
- Test evidence retention standards
- Pre-release CVE scanning against SBOM — gating criteria for release

**Vulnerability Handling Controls:**
- CVD policy maintenance and publication processes
- Internal vulnerability intake, triage, and prioritisation procedures
- Patch development, testing, and release pipeline for security updates
- ENISA Single Reporting Platform (SRP) reporting procedures (24h/72h/14d cascade)
- Third-party component vulnerability upstream reporting (Article 13(6))

**Production and Release Controls:**
- Change classification gate (substantial modification assessment)
- Module C-equivalent production conformity checks
- SBOM update controls per release
- CE marking and DoC update controls triggered by product changes

**Post-Market Monitoring:**
- CVE feed monitoring against the product SBOM
- Security incident monitoring and response
- User notification procedures
- End-of-support lifecycle management

*Capability Block: Module H QMS Document Structure*
```
MODULE H QMS DOCUMENT STRUCTURE

Level 1 — Quality Manual (QM-001)
  Scope of products covered
  Legal basis and regulatory context (CRA Art. 32, Annex VIII Part IV)
  QMS architecture and interaction of processes
  Management responsibility and resources

Level 2 — Procedures (PRO-xxx)
  PRO-001: Product classification and scope assessment
  PRO-002: Cybersecurity risk assessment
  PRO-003: Secure development lifecycle (SDL)
  PRO-004: SBOM generation and management
  PRO-005: Security testing and test evidence management
  PRO-006: Vulnerability intake and triage
  PRO-007: CVD policy management
  PRO-008: Security update development and release
  PRO-009: ENISA/CSIRT reporting (Article 14)
  PRO-010: Change classification and substantial modification assessment
  PRO-011: Technical documentation compilation and maintenance
  PRO-012: Declaration of Conformity management
  PRO-013: CE marking controls
  PRO-014: Post-market monitoring and surveillance
  PRO-015: End-of-support lifecycle management
  PRO-016: Internal audit and management review
  PRO-017: NB relationship management and surveillance coordination

Level 3 — Work Instructions (WI-xxx)
  [Tool-specific procedures, e.g. SBOM generation in CycloneDX,
   Trivy scan procedure, NB submission packaging]

Level 4 — Records (REC-xxx)
  Risk assessment records, test reports, vulnerability logs,
  SBOM versions, DoC versions, NB correspondence, audit records
```

### 4.4 Module H Notified Body Assessment Process

The NB conducts an initial QMS assessment followed by periodic surveillance:

**Initial Assessment:**
1. Submit QMS documentation package to NB
2. NB conducts documentation review (desk audit) — typically 4–6 weeks
3. NB conducts on-site audit of QMS implementation — reviews QMS implementation against CRA Annex VIII Part IV requirements, examines representative products, interviews process owners
4. NB issues assessment report with any non-conformities
5. Manufacturer addresses non-conformities (typically 4–12 weeks)
6. NB issues **Module H quality system approval certificate**
7. First products placed on market under Module H; manufacturer affixes CE marking with NB NANDO number

**Ongoing Surveillance:**
- Periodic surveillance audits by NB — typically annual or biennial[^17]
- Unannounced inspections are permitted
- Manufacturer must notify NB of planned changes to the QMS or product scope additions
- New products added to the QMS scope require an extension assessment (not a full initial assessment)[^21]

### 4.5 Module H Timing Benchmark

| Phase | Estimated Duration |
|---|---|
| QMS design and documentation | 3–6 months |
| Internal QMS audit and dry run | 4–8 weeks |
| NB application and intake | 2–4 weeks |
| NB documentation review | 4–6 weeks |
| NB on-site audit | 1–2 weeks |
| Non-conformity remediation | 4–12 weeks |
| Certificate issuance | 2–4 weeks |
| **Total (new QMS, Module H)** | **8–14 months** |
| **Adding a new product to established QMS** | **4–8 weeks** |

The initial investment in Module H is therefore higher than Module B+C for a single product, but the per-product cost for subsequent products within scope is substantially lower.[^22]

***

## Part V — The European Cybersecurity Certification Pathway (EUCC)

### 5.1 Article 27 — Presumption of Conformity via Certification

**Article 27(9)** establishes that products certified under a European cybersecurity certification scheme at assurance level **"substantial" or higher** benefit from a presumption of conformity with the CRA requirements covered by the scheme:[^23]

> *"Products with digital elements that have been certified under a European cybersecurity certification scheme pursuant to Article 52 of Regulation (EU) 2019/881 shall be presumed to be in conformity with the essential cybersecurity requirements of this Regulation in so far as those requirements are covered by the cybersecurity certificate or parts thereof."*[^23]

### 5.2 EUCC — EU Cybersecurity Certification Scheme on Common Criteria

The **EUCC (EU Cybersecurity Certification Scheme on Common Criteria)** is the primary operational certification scheme under the EU Cybersecurity Act (Regulation (EU) 2019/881). It is based on the international standard **ISO/IEC 15408 (Common Criteria)**:[^24]

- **EUCC Substantial:** Maps to Common Criteria assurance levels **EAL 1–EAL 4+** — covers most commercial products
- **EUCC High:** Maps to Common Criteria assurance levels **EAL 5–EAL 7** — required for high-assurance products such as HSMs, smart cards, and critical security modules[^25]

A valid EUCC certificate at Substantial or High assurance provides presumption of conformity with the CRA requirements covered by the scheme — meaning the manufacturer can reference the EUCC certificate in their DoC rather than demonstrating compliance through Module B+C or H.[^26]

### 5.3 EUCC vs. NLF Module Comparison

| Dimension | EUCC Certification | Module B+C | Module H |
|---|---|---|---|
| Based on | ISO/IEC 15408 (Common Criteria) + EU scheme rules[^24] | CRA Annex VIII + Annex I requirements | CRA Annex VIII + Annex I requirements |
| Conducted by | ITSEF (IT Security Evaluation Facility) + National Certification Body (NCCA)[^27] | CRA Notified Body | CRA Notified Body |
| Output document | EUCC Certificate | EU-type examination certificate | Quality system approval certificate |
| Validity | Typically 5 years, subject to maintenance[^25] | Defined period, subject to surveillance | Subject to annual/biennial surveillance |
| Scope | ICT products (broad)[^24] | Products with digital elements under CRA | Products with digital elements under CRA |
| Mutual recognition | EU-wide + some international under SOG-IS framework[^25] | EU-wide | EU-wide |
| Existing investment | YES — organisations with existing CC/EUCC certification can leverage it[^23] | No — CRA-specific process | No — CRA-specific process |
| Mandatory for Critical? | Where Commission mandates by Implementing Regulation[^8] | Where no mandatory scheme | Where no mandatory scheme |
| Timeline | 6–18 months (product complexity dependent)[^25] | 4–14 months | 8–14 months |

### 5.4 EUCC Process Overview

1. Manufacturer selects a licensed **ITSEF** (IT Security Evaluation Facility) accredited by the relevant national NCCA[^27]
2. Manufacturer and ITSEF define the **Target of Evaluation (TOE)** — product boundaries, security objectives, evaluation assurance level
3. Manufacturer develops the **Security Target (ST)** document — claims, threats, security objectives, and security functional requirements
4. ITSEF conducts evaluation against ISO/IEC 15408 and ISO/IEC 18045 (evaluation methodology)
5. ITSEF submits evaluation results to the **Certification Body (CB/NCCA)**
6. CB issues the EUCC certificate
7. Manufacturer references the EUCC certificate in the DoC; the certificate provides presumption of conformity for covered requirements[^25]

***

## Part VI — Technical Documentation: Annex VII Complete Reference

### 6.1 Legal Basis

The technical documentation is required by **Article 31** and structured by **Annex VII** of the CRA. It is the evidentiary package that supports both the conformity assessment (whether Module A, B+C, H, or EUCC) and the Declaration of Conformity. It must be maintained and updated throughout the product lifecycle.[^28][^2]

### 6.2 Annex VII — Complete Element List with Evidence Guidance

**Element 1 — General Product Description (Annex VII §1)**

Statutory requirement:
> *"a general description of the product with digital elements, including: its intended purpose; versions of software affecting compliance with essential cybersecurity requirements; where the product with digital elements is a hardware product, photographs or illustrations showing external features, marking and internal layout; user information and instructions as set out in Annex II"*[^28]

Evidence items:
- Product datasheet or specification document
- Version matrix (hardware versions × software versions covered by this technical file)
- Hardware photographs showing connectors, markings, board layout (for hardware products)
- Complete Annex II user information package (see Part VII)

**Element 2 — Design, Development, Production, and Vulnerability Handling Description (Annex VII §2)**

Statutory requirement:
> *"a description of the design, development and production of the product with digital elements and vulnerability handling processes, including: necessary information on the design and development of the product with digital elements, including, where applicable, drawings and schemes and a description of the system architecture explaining how software components build on or feed into each other and integrate into the overall processing; necessary information and specifications of the vulnerability handling processes put in place by the manufacturer, including the software bill of materials, the coordinated vulnerability disclosure policy, evidence of the provision of a contact address for the reporting of the vulnerabilities and a description of the technical solutions chosen for the secure distribution of updates; necessary information and specifications of the production and monitoring processes of the product with digital elements and the validation of those processes"*[^28]

Evidence items:
- System architecture diagram (component decomposition, trust boundaries, data flow)
- Software component dependency diagram
- SDL process documentation (threat modelling methodology, secure coding standards)
- SBOM in CycloneDX or SPDX format (covering all top-level dependencies minimum)
- CVD policy document (publicly accessible URL)
- Single point of contact (security email, `security.txt` URL)
- Update mechanism description (signing infrastructure, distribution channel security, rollback protection)
- Production / CI-CD process documentation (build integrity, reproducibility)
- Post-market monitoring process description

**Element 3 — Cybersecurity Risk Assessment (Annex VII §3)**

Statutory requirement:
> *"an assessment of the cybersecurity risks against which the product with digital elements is designed, developed, produced, delivered and maintained pursuant to Article 13, including how the essential cybersecurity requirements set out in Part I of Annex I are applicable"*[^28]

Evidence items:
- Complete risk assessment document (see Capability Block in Part II, Step 2)
- Annex I Part I applicability determination (all 13 requirements addressed; non-applicable documented with justification per Article 13(4))
- Annex I Part II applicability determination (all 8 VH requirements)
- Threat model (STRIDE, PASTA, LINDDUN, or equivalent)

**Element 4 — Support Period Determination (Annex VII §4)**

Statutory requirement:
> *"relevant information that was taken into account to determine the support period pursuant to Article 13(8) of the product with digital elements"*[^28]

Evidence items:
- Support period rationale document
- Expected useful life analysis (market research, user surveys, product domain norms)
- Support period end-date declaration (minimum: 5 years from market placement, unless shorter justified)
- Support period communicated at point of purchase (evidence of label or webpage)

**Element 5 — Standards and Technical Specifications (Annex VII §5)**

Statutory requirement:
> *"a list of the harmonised standards applied in full or in part the references of which have been published in the Official Journal of the European Union, common specifications... and, where those harmonised standards, common specifications or European cybersecurity certification schemes have not been applied, descriptions of the solutions adopted to meet the essential cybersecurity requirements set out in Parts I and II of Annex I, including a list of other relevant technical specifications applied. In the event of partly applied harmonised standards, common specifications or European cybersecurity certification schemes, the technical documentation shall specify the parts which have been applied"*[^28]

Evidence items:
- Standards table: for each harmonised standard cited, specify standard number, title, OJEU publication date, and which Annex I requirements it covers
- Where no harmonised standard exists: requirements-to-solutions mapping table (mapping each Annex I requirement to the specific technical measure implemented, with evidence reference)
- Other relevant technical specifications (e.g., IEC 62443-4-2:2019 as non-harmonised technical reference, NIST SP 800-82, ISO/IEC 27001)
- Partially applied standards: table of which clauses applied and which excluded, with justification

**Element 6 — Test Reports (Annex VII §6)**

Statutory requirement:
> *"reports of the tests carried out to verify the conformity of the product with digital elements and of the vulnerability handling processes with the applicable essential cybersecurity requirements as set out in Parts I and II of Annex I"*[^28]

Evidence items:
- Penetration test report (summarised; must cover all relevant Annex I security properties at appropriate depth for product risk class)
- Static application security testing (SAST) report
- Dynamic application security testing (DAST) report (where applicable)
- Dependency vulnerability scan report (Trivy, Grype, or equivalent — scanned against current SBOM)
- Secure configuration review report
- Update mechanism integrity test evidence (signing verification, rollback test)
- Authentication and access control test results
- Vulnerability handling process test/dry-run evidence

**Element 7 — EU Declaration of Conformity (Annex VII §7)**

Statutory requirement: *"a copy of the EU declaration of conformity"*[^28]

Evidence items: Signed copy of the complete Annex V DoC (see Part VI below).

**Element 8 — SBOM (Annex VII §8)**

Statutory requirement:
> *"where applicable, the software bill of materials, further to a reasoned request from a market surveillance authority provided that it is necessary in order for that authority to be able to check compliance with the essential cybersecurity requirements set out in Annex I"*[^28]

Note: Element 8 is not proactively disclosed publicly by default — it is provided to market surveillance authorities on reasoned request. However, the SBOM must exist and be current as part of the technical file. In practice, for Module B+C and H, the NB will request the SBOM as part of the examination.[^17]

### 6.3 Technical File Version Control and Retention

- Version the technical file with a clear change log
- Retain for **10 years** from the date of first EU market placement **or** the support period end-date, whichever is longer[^29]
- The technical file must be available to market surveillance authorities within a reasonable period of a reasoned request — plan for retrieval within 24–48 hours
- Where products are updated, update the technical file before CE marking the new version

*Capability Block: Technical File Structure*
```
TECHNICAL FILE STRUCTURE — CRA REGULATION (EU) 2024/2847

Product: [Name]          Model: [Model]       Version: [HW/SW]
File Ref: TF-[Code]-[Year]-[Rev]    Date: [YYYY-MM-DD]
Prepared by: [Name, Role]    Reviewed by: [Name, Role]

PART 1 — PRODUCT OVERVIEW (Annex VII §1)
  1.1 Product description and intended purpose
  1.2 Version matrix (HW × SW versions in scope)
  1.3 Hardware photographs and layout diagrams
  1.4 Annex II user information (copy)

PART 2 — DESIGN AND DEVELOPMENT (Annex VII §2)
  2.1 System architecture diagram
  2.2 Software component architecture and dependency diagram
  2.3 Data flow diagrams (DFDs)
  2.4 SDL process documentation
  2.5 SBOM — [product-vX.Y.Z.cdx.json / spdx.xml]
  2.6 CVD policy (current version + URL)
  2.7 Single point of contact evidence
  2.8 Update mechanism security description
  2.9 CI/CD and build integrity documentation

PART 3 — CYBERSECURITY RISK ASSESSMENT (Annex VII §3)
  3.1 Threat model (STRIDE / PASTA / other)
  3.2 Risk assessment report [RA-version-date.pdf]
  3.3 Annex I Part I applicability matrix
  3.4 Annex I Part II applicability matrix
  3.5 Non-applicability justifications (Article 13(4))

PART 4 — SUPPORT PERIOD DOCUMENTATION (Annex VII §4)
  4.1 Support period rationale
  4.2 Expected useful life analysis
  4.3 Support period end-date declaration
  4.4 Evidence of point-of-purchase communication

PART 5 — STANDARDS AND SPECIFICATIONS (Annex VII §5)
  5.1 Harmonised standards applied table
  5.2 Requirements-to-solutions mapping (where no hEN)
  5.3 Other technical specifications referenced
  5.4 Partial application declarations

PART 6 — TEST REPORTS (Annex VII §6)
  6.1 Penetration test report [pentest-vX.Y.pdf]
  6.2 SAST/DAST results summary
  6.3 Dependency vulnerability scan report [scan-YYYY-MM-DD.pdf]
  6.4 Secure configuration review
  6.5 Update mechanism integrity test evidence
  6.6 Authentication / access control test results
  6.7 VH process dry-run evidence

PART 7 — DECLARATION OF CONFORMITY (Annex VII §7)
  7.1 Signed EU Declaration of Conformity [DoC-[code]-[date].pdf]

PART 8 — SBOM (Annex VII §8)
  8.1 SBOM file [product-vX.Y.Z.cdx.json]
  [ACCESS: Available to market surveillance authorities on request only]

APPENDICES
  A: NB EU-type examination certificate (Module B+C) or NB approval certificate (Module H)
  B: EUCC certificate (if applicable)
  C: Vulnerability log (live record, restricted access)
  D: Incident log (live record, restricted access)
  E: Document change log
```

***

## Part VII — EU Declaration of Conformity (Annex V): Complete Requirements

### 7.1 Legal Basis

The EU Declaration of Conformity (DoC) is required by **Article 28** and structured by **Annex V**. It is the manufacturer's formal legal declaration of product compliance. It is the capstone document of the conformity assessment — it cannot be signed until assessment is complete.[^5]

### 7.2 Mandatory Elements — Annex V

The following eight elements are mandatory in every CRA DoC:[^30][^5]

| # | Element | Statutory Basis | Detail |
|---|---|---|---|
| 1 | **Product name and type** | Annex V §1 | Product name, model/type designation, and sufficient additional information to uniquely identify the product — may include batch/serial number scope, HW and SW version identifiers, and a photograph where appropriate for traceability |
| 2 | **Manufacturer identification** | Annex V §2 | Full legal name and registered postal address of the manufacturer; for non-EU manufacturers, also the EU authorised representative's name and address |
| 3 | **Sole responsibility statement** | Annex V §3 | Verbatim: *"This declaration of conformity is issued under the sole responsibility of the manufacturer."* — This exact wording is legally required |
| 4 | **Object of the declaration** | Annex V §4 | Identification of the product allowing traceability; where helpful, a short description of the product's intended purpose |
| 5 | **Conformity statement** | Annex V §5 | *"The object of the declaration described above is in conformity with the relevant Union harmonisation legislation: Regulation (EU) 2024/2847 of the European Parliament and of the Council of 23 October 2024 on horizontal cybersecurity requirements for products with digital elements."* Include any other applicable EU legislation (RED, MDR, Machinery Regulation, etc.) if a combined DoC is issued |
| 6 | **Standards and specifications applied** | Annex V §6 | List of harmonised standards (with OJEU publication date), common specifications, or European cybersecurity certification schemes applied; if no harmonised standard applied, state: *"No harmonised standards applied. Conformity demonstrated through [approach description]"* |
| 7 | **Notified body reference** | Annex V §7 | Required only when a notified body was involved: NB name, NANDO number, description of conformity assessment procedure performed, EU-type examination certificate reference number (Module B+C) or quality system approval certificate reference (Module H) |
| 8 | **Signature block** | Annex V §8 | Place and date of issue; name and function of authorised signatory; handwritten or qualified electronic signature |

### 7.3 Recommended Additional Information

The following are not mandatory in Annex V but are strongly recommended by compliance practitioners and regulators:[^31][^5]

| Optional Field | Rationale |
|---|---|
| Declaration number (e.g., `DoC-SSP3000-2027-001`) | Version control and cross-referencing in the technical file |
| Support period end-date (month/year) | CRA Article 13(8) requires communication at point of purchase; including in DoC aids compliance demonstration |
| Vulnerability reporting contact / CVD policy URL | Supports Article 13(17) obligations |
| Link to full technical documentation | Facilitates market surveillance authority access |
| First EU market placement date | Establishes the 10-year retention clock |

### 7.4 Complete DoC Template

```
─────────────────────────────────────────────────────────────────
                EU DECLARATION OF CONFORMITY
        Regulation (EU) 2024/2847 (Cyber Resilience Act)
─────────────────────────────────────────────────────────────────
DECLARATION NUMBER: DoC-[ProductCode]-[YYYY]-[Sequence]

1. PRODUCT IDENTIFICATION
   Product name:      [Full product name]
   Model / type:      [Model designation]
   Hardware version:  [HW-vX.Y] (if applicable)
   Software version:  [SW-vX.Y.Z] (if firmware/software)
   Batch / serial:    [Batch range or serial number format]
   Description:       [One sentence: product type, connectivity,
                       intended use environment]

2. MANUFACTURER
   Legal name:   [Registered company name]
   Address:      [Street, City, Postcode, Country]
   Website:      [https://www.company.com]
   Email:        [legal@company.com]

   [If non-EU manufacturer, add:]
   EU Authorised Representative:
   Legal name:   [EU Rep company name]
   Address:      [EU address]

3. SOLE RESPONSIBILITY
   This declaration of conformity is issued under the sole
   responsibility of the manufacturer.

4. OBJECT OF THE DECLARATION
   The product identified in Section 1 above is the object of
   this declaration.

5. CONFORMITY STATEMENT
   The object of the declaration described above is in conformity
   with the relevant Union harmonisation legislation:

   ■ Regulation (EU) 2024/2847 of the European Parliament and
     of the Council of 23 October 2024 on horizontal
     cybersecurity requirements for products with digital
     elements (Cyber Resilience Act).

   [Add other applicable regulations as applicable, e.g.:]
   □ Directive 2014/53/EU (Radio Equipment Directive — RED)
   □ Regulation (EU) 2017/745 (Medical Device Regulation — MDR)
   □ Directive 2006/42/EC (Machinery Directive)

6. HARMONISED STANDARDS AND TECHNICAL SPECIFICATIONS APPLIED
   [If harmonised CRA standard is available and applied:]
   ■ [EN XXXXX:YYYY] — [Standard title] — Published in OJEU
     [date], covering Annex I Part I/II requirements [(list)]

   [If no harmonised CRA standard available (current situation):]
   No harmonised CRA standards published in the Official Journal
   of the European Union were applied. Conformity with
   Regulation (EU) 2024/2847 Annex I has been demonstrated
   through the following technical specifications and measures:

   Other technical specifications applied:
   ■ IEC 62443-4-2:2019 — Technical security requirements for
     IACS components (applied as technical reference, not
     harmonised standard)
   ■ ISO/IEC 27001:2022 — Information security management
   ■ [Other standards as applicable]

   See Technical Documentation Ref. [TF-code-date] for the
   full Annex I requirements-to-solutions mapping.

7. CONFORMITY ASSESSMENT PROCEDURE AND NOTIFIED BODY
   [Module A — No notified body:]
   Conformity assessment procedure: Internal control
   (Module A, Annex VIII Part I of Regulation (EU) 2024/2847).
   No notified body was involved in this assessment.

   [Module B+C — Notified body involved:]
   Conformity assessment procedure: EU-type examination
   (Module B) followed by conformity to type based on internal
   production control (Module C), Annex VIII Parts II and III
   of Regulation (EU) 2024/2847.
   Notified Body: [NB Legal Name]
   NANDO Number: [####]
   EU-Type Examination Certificate No.: [Certificate Ref]
   Certificate date: [YYYY-MM-DD]
   Certificate validity: [YYYY-MM-DD]

   [Module H — Full QA:]
   Conformity assessment procedure: Conformity based on full
   quality assurance (Module H), Annex VIII Part IV of
   Regulation (EU) 2024/2847.
   Notified Body: [NB Legal Name]
   NANDO Number: [####]
   Quality System Approval Certificate No.: [Certificate Ref]

   [EUCC certification:]
   European Cybersecurity Certification:
   Scheme: EU Cybersecurity Certification Scheme on Common
   Criteria (EUCC), pursuant to Regulation (EU) 2019/881.
   Assurance Level: [Substantial / High]
   Certificate No.: [Certificate Ref]
   Issuing body: [NCCA name]
   Certificate validity: [YYYY-MM-DD]

8. ADDITIONAL INFORMATION (RECOMMENDED)
   Declaration number:   DoC-[code]-[YYYY]-[seq]
   Security support until: [Month YYYY] (minimum 5 years from
                          first EU market placement)
   First EU placement:   [YYYY-MM-DD]
   Vulnerability reports: security@company.com
   CVD Policy:           https://company.com/security
   Technical documentation: Available to competent authorities
                          upon reasoned request at address above.

─────────────────────────────────────────────────────────────────
   Signed for and on behalf of [Company Legal Name]:

   Place:  [City, Country]
   Date:   [DD Month YYYY]

   Name:      [Full Name]
   Function:  [Title, e.g. Head of Product Compliance /
               Chief Technology Officer / Director of Engineering]
   Signature: ___________________________________
               [Handwritten or qualified electronic signature]
─────────────────────────────────────────────────────────────────
```

### 7.5 DoC Management Obligations

- The DoC must be **translated** into the official language(s) of each EU Member State where the product is sold[^5]
- A **simplified DoC** (Annex VI) may be provided with the product, containing only the internet address at which the full DoC can be accessed; the full DoC must be genuinely accessible at that URL throughout the retention period[^13]
- The DoC must be **updated** when:
  - A substantial modification occurs
  - Product versions added to the scope
  - A new conformity assessment procedure is completed
  - New harmonised standards are applied
- The DoC must be retained for **10 years** from the date of market placement, or for the support period, whichever is longer[^5]
- The signed DoC must travel with the product (or be accessible via simplified DoC URL)

***

## Part VIII — The Notified Body Capacity Crisis: Practical Guidance

### 8.1 The Scale of the Problem

The notified body system under the CRA faces a structural capacity problem that manufacturers must factor into their planning:

- **Designation lag:** Accreditation and designation of a new NB typically takes 12–18 months from application[^16]
- **No designated NBs as of June 2026:** The CRA's notified body rules began applying on 11 June 2026, but as of the same date, no CRA notified bodies had been formally designated[^11]
- **Demand concentration:** Important Class I (without harmonised standard) + Important Class II + Critical products all require NB involvement — representing thousands of product types across the EU
- **Timeline concentration:** Full CRA application is 11 December 2027 — all manufacturers requiring NB assessment must complete it within approximately 18 months of the first designations appearing

> *"Accreditation and designation of new bodies typically takes 12 to 18 months, which means the pool of CRA Notified Bodies will remain small well into 2027."*[^16]

### 8.2 Practical Mitigation Strategies

**Strategy 1 — Engage Early with Candidate Bodies**

Several existing conformity assessment bodies active under RED, MDR, and other CE marking frameworks have announced CRA readiness programmes. Contact them now for:
- Scoping calls (at no cost) to assess their likely CRA scope and capability
- Preliminary submissions to identify technical documentation gaps before formal engagement
- Queue registration (informal, not binding, but establishes relationship)[^32][^7]

Organisations known to be preparing CRA notified body capacity include: Applus+ Laboratories, TÜV Rheinland, TÜV SÜD, BSI Group (UK, also operates in EU), SGS, Bureau Veritas, and NMi (Netherlands).[^7][^16]

**Strategy 2 — Complete All Technical Documentation Before Engagement**

NB fees and timelines are driven by the amount of deficiency-remediation work required. A manufacturer who submits a complete, high-quality technical file will complete assessment faster and at lower cost than one who uses the NB process to discover gaps.[^20]

**Strategy 3 — Consider EUCC if CC Certification is Already Planned**

For organisations with products that already undergo or are planned for Common Criteria evaluation, the EUCC pathway is the most efficient route to CRA presumption of conformity — the same evaluation process that generates the CC/EUCC certificate simultaneously addresses CRA conformity.[^26][^23]

**Strategy 4 — Consider Module H if Product Portfolio is Broad**

For manufacturers with five or more Important Class II products, Module H is almost certainly more economical than repeated Module B+C assessments. The one-time QMS investment pays back quickly when new products can be added to the approved QMS scope via extension assessments rather than full re-examination.[^22][^21]

**Strategy 5 — Do Not Wait for Harmonised Standards for Class I**

For Important Class I products, the temptation is to wait until harmonised standards are published (expected Q2 2027) to use Module A self-assessment. This is a high-risk strategy: if standards are delayed, or if the standard does not fully cover the product's specific requirements, the manufacturer faces the notified body backlog in the final months before December 2027.[^10][^11]

### 8.3 NB Engagement Readiness Checklist

```
NOTIFIED BODY ENGAGEMENT READINESS CHECKLIST
Product: [Name, Version]         Classification: [Important Class I/II / Critical]
Target CE Date: [YYYY-MM-DD]     Module: [B+C / H / EUCC]
---------------------------------------------------------------------------
PRE-ENGAGEMENT (Complete before first NB contact)
  □ Product classification confirmed and documented (CDR completed)
  □ Annex I applicability matrix drafted (identifies which requirements apply)
  □ Cybersecurity risk assessment at ≥ draft stage
  □ System architecture diagram available
  □ SBOM generated for current version
  □ CVD policy drafted and published (or URL prepared)
  □ Pre-release vulnerability scan conducted
  □ SDL process documented
  □ Support period determined and rationale documented
  □ Technical file structure created (even if not all evidence complete)

ENGAGEMENT INITIATION (At first NB contact)
  □ NANDO verified as covering CRA (or confirmed as preparing for designation)
  □ Scoping call completed; NB domain competence assessed
  □ Preliminary evidence review agreed (desk review before formal application)
  □ Timeline discussed; estimated certificate date confirmed vs target CE date
  □ Cost estimate obtained

APPLICATION SUBMISSION
  □ Complete Annex VII technical documentation packaged and QC'd
  □ Representative product sample or test access arranged
  □ NB application form completed
  □ Draft DoC prepared (unsigned)
  □ Application submitted; intake confirmation received

ASSESSMENT PHASE
  □ Technical documentation review report received
  □ Non-conformities logged and remediation owner assigned
  □ All non-conformities resolved; evidence of resolution submitted
  □ Product examination completed
  □ Certificate issuance confirmed

POST-CERTIFICATE
  □ EU-type examination certificate received and stored in technical file
  □ DoC signed by authorised signatory
  □ CE marking applied to product/packaging/documentation
  □ Surveillance schedule confirmed with NB
  □ Technical documentation updated with certificate reference
```

***

## Part IX — CE Marking Rules and Common Mistakes

### 9.1 CE Marking Application Requirements

**Article 30** governs CE marking. The CE mark must be:[^33][^14]
- **Visible:** Clearly visible on the product, packaging, or accompanying documentation
- **Legible:** Proportionate to the size of the product; minimum height 5mm where product size allows
- **Indelible:** Not easily removed or detached; for physical products, permanently affixed (engraved, printed, or labelled with tamper-evidence)
- **Accompanied by the NB number:** Where Module B+C or H was used, the CE mark must be followed by the NB's NANDO number (4 digits)[^21]

**For software-only products:**
- The CE mark may be included in the accompanying digital documentation, on the product download page, or in the Declaration of Conformity
- It is not required to appear in the software's user interface, though this is common practice[^34]

**Timing:** The CE mark may only be affixed **after** the conformity assessment is complete, the DoC is drawn up and signed, and all technical documentation is compiled. Premature affixation of CE marking is a violation of Article 30 and triggers Tier 2 penalties.[^5]

### 9.2 Common Mistakes to Avoid

| Mistake | Consequence | Prevention |
|---|---|---|
| Classifying as Default without checking Annex III/IV | Invalid Module A assessment; CE mark invalidated | Conduct structured classification analysis against Implementing Reg. 2025/2392[^7] |
| Signing DoC before conformity assessment complete | Legal violation under Article 28; DoC legally invalid | DoC signature is always the final step, after all evidence exists[^5] |
| Using DoC as substitute for technical documentation | Market surveillance authority will find no evidence file | Maintain separate full technical file; DoC is a summary, not the evidence[^31] |
| Not updating DoC after software update that constitutes substantial modification | CE mark becomes invalid for updated version | Implement Module C change classification gate for every release[^35] |
| Failing to translate DoC into Member State languages | Non-compliance with market access requirements | Identify all EU markets at market launch; plan translations in advance[^5] |
| Using a stale SBOM (from a different version) | Inaccurate conformity evidence; vulnerability monitoring failure | Integrate SBOM generation into every CI/CD build[^36] |
| Missing NB identification number on CE mark (Module B+C/H) | CE mark does not meet Article 30 requirements | Include NANDO number immediately after CE symbol[^21] |
| Using a simplified DoC URL that becomes dead link | Violation — simplified DoC URL must remain accessible for 10 years | Use a permanent, stable URL; include in long-term URL management policy[^13] |
| Failing to retain technical documentation for 10 years | Violation of Article 13(13); Tier 2 penalty | Implement document lifecycle management with 10-year retention policy[^29] |

***

## Part X — Master CE Marking Programme Gantt: Suggested Timeline

The following programme timeline applies to a new product targeting 11 December 2027 CE marking that requires Module B+C (Important Class II):

| Month | Activity | Owner | Output |
|---|---|---|---|
| M1 | Product classification and scope assessment | Compliance Lead | Classification Decision Record |
| M1–M2 | Cybersecurity risk assessment initiation; threat modelling | Security Architect | Draft Risk Assessment |
| M2–M3 | Annex I requirements mapping; identify gaps | Product Security | Requirements gap analysis |
| M3–M6 | Security control implementation (remediate gaps) | Engineering | Implemented controls |
| M3–M4 | SBOM tooling integration into CI/CD | DevOps / Engineering | SBOM per build |
| M4–M5 | CVD policy published; single point of contact live | Legal / Security | CVD policy URL |
| M4–M5 | Support period decision; point-of-purchase communication prepared | Product / Legal | Support period documentation |
| M5–M6 | Internal security testing (pentest, SAST/DAST, vuln scan) | Security Testing | Test reports |
| M5–M6 | Technical documentation Part 1–5 compiled | Compliance Lead | Draft Technical File |
| M6 | Notified body identified; scoping call; queue registration | Compliance Lead | NB shortlist |
| M7 | Preliminary evidence review with NB | NB + Manufacturer | Gaps identified |
| M7–M8 | Remediate NB pre-submission observations | Engineering | Remediation evidence |
| M8 | Formal application submission to NB | Compliance Lead | Application submitted |
| M8–M9 | NB technical documentation review | NB | Review report |
| M9 | Remediate NB documentation findings (if any) | Engineering/Compliance | Updated tech file |
| M9–M10 | NB product examination and testing | NB | Examination report |
| M10 | EU-type examination certificate issued | NB | Certificate |
| M10–M11 | DoC prepared, reviewed by legal, signed | Legal + Compliance + CTO/CEO | Signed DoC |
| M11 | CE marking applied to product/documentation | Product/Design | CE-marked product |
| M11–M12 | Buffer for unexpected delays | — | — |
| **M12** | **Product placed on EU market; fully CRA compliant** | Management | **CE-marked product on market** |

This timeline assumes a **well-prepared organisation** with no major technical gaps discovered. Organisations discovering significant Annex I implementation gaps in months M3–M5 should add 2–4 months for remediation. The earliest viable start for a December 2027 deadline is therefore approximately January–February 2027.

---

## References

1. [Step 6: Which Conformity Assessment Procedure Applies? - LinkedIn](https://www.linkedin.com/pulse/step-6-which-conformity-assessment-procedure-applies-michael-jesse-szpkf) - If the notified body concludes that the product complies with the CRA, it issues an EU-type examinat...

2. [Decoding the Cyber Resilience Act – Part 2: A lifecycle approach to ...](https://www.freshfields.com/en/our-thinking/blogs/technology-quotient/decoding-the-cyber-resilience-act-part-2-a-lifecycle-approach-to-compliance-102mkdk) - Module H (full quality assurance) mandates that the manufacturer operate and maintain a documented q...

3. [Cyber Resilience Act | Shaping Europe's digital future](https://digital-strategy.ec.europa.eu/en/policies/cyber-resilience-act) - Introducing the Cyber Resilience Act: the EU's new plan to make sure all digital products are safe f...

4. [CRA Compliance Matrix: Every Obligation, with Article References](https://www.cyberresilienceact.eu/compliance-matrix.html) - Complete the conformity assessmentNEWCarry out the applicable procedure (Module A, or B+C / H / Noti...

5. [CRA EU Declaration of Conformity: Template and Elements](https://craevidence.com/cra-compliance/declaration-of-conformity) - Technical Documentation. What CRA technical documentation must contain (Annex VII section by section...

6. [Cyber Resilience Act - Conformity assessment](https://digital-strategy.ec.europa.eu/en/policies/cra-conformity-assessment) - Default category of products (e.g., memory chips, mobile apps, smart speakers, computer games): self...

7. [CRA Conformity Assessment: Self-Assessment vs Third-Party ...](https://complaro.com/blog/cra-conformity-assessment-guide) - Module A — Internal Control (Self-Assessment): The manufacturer assesses conformity internally. No e...

8. [Cyber-Resilience Act (CRA) - Secure-by-Design Handbook](https://www.securebydesignhandbook.com/docs/standards/eu/cra-overview) - Technical documentation. CRA Art. 31, Annex VII, Create & maintain technical file with risk assessme...

9. [Understanding the EU Cyber Resilience Act Requirements](https://finitestate.io/blog/conformity-assessments-eu-cra-requirements) - TL;DR A CRA conformity assessment is how you prove a connected product meets the EU Cyber Resilience...

10. [Notified Bodies Under the CRA: When You Need One and ... - Seentrix](https://seentrix.com/blog/cra-notified-bodies) - Notified body always involved. You choose between Module B+C (EU-type examination plus conformity to...

11. [On 11 June 2026, the CRA's Rules on Notified Bodies Started to ...](https://www.cyberresilienceact.eu/news/cra-notified-bodies-rules-apply-11-june-2026.html) - On 11 June 2026, the CRA's Rules on Notified Bodies Started to Apply, but None Are Designated Yet. T...

12. [CRA Harmonised Standards Guide — Type A, B and C](https://eu-cyber-laws.com/cra/standards-guide/) - CENELEC developing A11:2026 amendments for EN IEC 62443-4-1 and -4-2. Expected. First harmonised sta...

13. [Cyber Resilience Act text, Article 13](https://www.european-cyber-resilience-act.com/Cyber_Resilience_Act_Article_13.html) - Manufacturers shall ensure that products with digital elements are accompanied by the information an...

14. [CE Marking to Show CRA compliance - Qt](https://www.qt.io/cyber-resilience-act/ce-marking) - 1. Meet the essential CRA requirements. · 2. Create the required technical documentation. · 3. Under...

15. [Notified bodies - Internal Market, Industry, Entrepreneurship and SMEs](https://single-market-economy.ec.europa.eu/single-market/goods/building-blocks/notified-bodies_en) - Notified bodies. A notified body is an organisation designated by an EU country to assess the confor...

16. [The CRA Deadline Is Fixed. Assessment Capacity Isn't - NMi](https://nmi.nl/cra-assessment-capacity-lab-scarcity/) - Accreditation and designation of new bodies typically takes 12 to 18 months, which means the pool of...

17. [EU Cyber Resilience Act (CRA) Compliance - Applus+ Laboratories](https://www.appluslaboratories.com/global/en/resource-center/eu-cyber-resilience-act/cra-compliance-services) - Module H – Conformity. The notified body evaluates the system and conducts ongoing surveillance to e...

18. [CRA Conformity Assessment: Self-Assessment or Notified Body](https://craevidence.com/cra-compliance/conformity-assessment) - Module B · EU-Type exam. Notified Body selected; Application submitted; Technical documentation prov...

19. [Cyber Resilience Act—Notified Body Services - Applus+ Laboratories](https://www.appluslaboratories.com/global/en/what-we-do/service-sheet/cyber-resilience-act-notified-body) - Module B + C is the primary third-party route under the CRA for many products: Module B (EU-type exa...

20. [EU Cyber Resilience Act: What Product Teams Should Do Now](https://www.linkedin.com/pulse/eu-cyber-resilience-act-what-product-teams-should-do-now-leitner-ll66f) - Months 2-4 handle gap analysis requiring cross-functional assessment. Months 3-8 establish the vulne...

21. [What is module H? How does it work? - CRA FAQ](https://cra.orcwg.org/faq/official/faq_6-3/) - Module H, set out in Part IV of Annex VIII, is a conformity assessment procedure in which the manufa...

22. [Cyber Resilience Act: The Complete Survival Guide for Manufacturers](https://www.cclab.com/news/cyber-resilience-act-the-complete-survival-guide-for-manufacturers) - Coordination with Notified Bodies: Guiding you through Module B+C or the comprehensive Module H asse...

23. [Cyber Resilience Act implementation via EUCC and its applicable ...](https://certification.enisa.europa.eu/publications/cyber-resilience-act-implementation-eucc-and-its-applicable-technical-elements_en) - The CRA applies to all products with digital elements and categorizes them by risk level, including ...

24. [EU Cybersecurity Certification Scheme on Common Criteria (EUCC)](https://www.brightsight.com/eucc) - The EUCC scheme provides a unified framework for cybersecurity certification, ensuring that a single...

25. [[PDF] EUCC, differences with CCRA/SOGIS Common Criteria scheme.](https://www.appluslaboratories.com/en/dam/jcr:d65e3db0-9f1f-4fd0-a0f5-1266877db673/EUCC_vs_CCRA_SOGIS.pdf) - The assurance levels of EUCC scheme are 'HIGH' and 'SUBSTANTIAL' depending on the assurance levels o...

26. [Mapping EUCC to Common Criteria: A Technical Overview of ...](https://blog.qima.com/due-cybersecurity/mapping-eucc-to-common-criteria-a-technical-overview-of-assurance-levels-and-evaluation-requirements) - Products certified at EUCC Substantial or High level qualify for a presumption of conformity with th...

27. [Common Criteria (EUCC) | Dutch NCCA](https://www.dutchncca.nl/eu-cybersecurity-certification/common-criteria) - The EUCC scheme covers a wide range of security requirements, by offering two of the security assura...

28. [Annex VII Cyber Resilience Act – CONTENT OF THE TECHNICAL ...](https://enobyte.com/en/legal/cra/annex-vii/) - Annex VII. CONTENT OF THE TECHNICAL DOCUMENTATION. 1. a general description of the product with digi...

29. [[PDF] CRA Standards Unlocked - CEN-CENELEC](https://www.cencenelec.eu/media/CEN-CENELEC/Events/Webinars/2026/2026-03-18_cra_unlocked_cybersecurity_requirements_deep-dive_tc224wg17_cra.pdf) - Article 13(13) Manufacturers shall keep the technical documentation and the EU declaration of confor...

30. [CRA Annex V: EU Declaration of Conformity Template - CVD Portal](https://cvdportal.com/cra/annex-v) - CRA Annex V specifies all required fields in the EU Declaration of Conformity: product name, manufac...

31. [CRA Declaration of Conformity (DoC) Guide: How to Build ... - Regulus](https://goregulus.com/cra-documentation/cra-declaration-of-conformity/) - Learn how to draft a CRA Declaration of Conformity for the Cyber Resilience Act. Structure, mandator...

32. [On 11 June 2026, the CRA's Rules on Notified Bodies Started to ...](https://www.cyberresilienceact.eu/nl/news/cra-notified-bodies-rules-apply-11-june-2026.html) - On 11 september 2026 the 24-hour vulnerability reporting duty under Article 14 begins. Three months ...

33. [No Market Approval Without Cybersecurity: Implementing the CRA](https://www.onekey.com/resource/no-market-approval-without-cybersecurity-how-companies-can-successfully-implement-the-cra) - The EU Cyber Resilience Act (CRA) makes cybersecurity a must for CE marking. Learn how companies can...

34. [CE Marking for Software Under the CRA: Step-by-Step - Complaro](https://complaro.com/blog/cra-ce-marking-software) - Learn when CE marking is required for software under the CRA, how to complete conformity assessment,...

35. [When Is Software "Placed on the Market" Under the EU Cyber ...](https://www.cybercertlabs.com/case_studies/software-placed-on-market-eu-cyber-resilience-act/) - If an update does cross the substantial modification threshold, you'll need to comply with the CRA i...

36. [Understanding The EU CRA's SBOM & Technical Documentation ...](https://finitestate.io/blog/eu-cra-sbom-technical-documentation-guide) - CRA SBOMs must use a commonly used, machine-readable format such as SPDX, CycloneDX, or SWID, and co...

