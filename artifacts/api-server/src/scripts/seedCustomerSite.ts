/**
 * Seeds the "limited frontend" for a per-customer conformance deployment:
 *
 *  - PUBLIC tier: a CRA primer, the conformance-process story, the
 *    artifact-to-article coverage page, and the regulations index.
 *  - MEMBERS tier: deeper CRA guidance, templates & examples, and workbench
 *    how-tos, grouped into the Knowledge Hub by regulation key.
 *
 * Regulation tags use the SAME natural keys as the conformity catalogue
 * (regulations.key: "cra", "ai_act", …) so Knowledge Hub tracks appear
 * automatically as future regulation content is tagged and published.
 *
 * All seeded pages are noindex (per-customer deployments must not compete in
 * search). The English header/footer nav is rebuilt to the limited set; the
 * Dutch nav is left untouched (the public marketing nav already covers Dutch).
 * The 3 MEMBERS-tier pages are also seeded in Dutch (locale "nl", same slugs)
 * so /nl/knowledge shows real content instead of the empty state; the PUBLIC
 * tier stays English-only here (its Dutch equivalents, if any, come from the
 * main site-content snapshot, not this script).
 *
 * Idempotent — pages are matched on (slug, locale) and fully replaced.
 * Run with: pnpm --filter @workspace/api-server run seed:customer-site
 */
import { eq, and, inArray } from "drizzle-orm";
import { db, pool, pagesTable, pageSectionsTable, navItemsTable } from "@workspace/db";

const log = (msg: string) => process.stdout.write(`${msg}\n`);

interface SeedPage {
  slug: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  excerpt: string;
  visibility: "public" | "members";
  regulationKeys: string[];
  markdown: string;
}

const PAGES: SeedPage[] = [
    {
    slug: "cra-primer",
    title: "The EU Cyber Resilience Act \u2014 Comprehensive Regulatory & Engineering Primer",
    seoTitle: "EU CRA Primer | Comprehensive Guide to Regulation (EU) 2024/2847",
    seoDescription: "Authoritative technical and statutory primer on the EU Cyber Resilience Act (Regulation (EU) 2024/2847): scope, 4-tier classification, Annex I essential requirements, Article 14 clocks, and conformity assessment.",
    excerpt: "Regulation (EU) 2024/2847 establishes mandatory cybersecurity requirements as an ex-ante market-access condition for all products with digital elements placed on the EU market. This primer provides the complete statutory architecture, risk tiers, essential requirements, reporting timelines, and conformity assessment routes.",
    visibility: "public",
    regulationKeys: ["cra"],
    markdown: `## Statutory Foundation & Regulatory Architecture

The **Cyber Resilience Act (Regulation (EU) 2024/2847)** is the European Union's foundational regulation establishing horizontal cybersecurity requirements for hardware and software products. Formally adopted by the European Parliament and Council on 23 October 2024, published in the Official Journal of the European Union on 20 November 2024 (OJ L 2024/2847), and entered into force on 10 December 2024, the CRA fundamentally alters European product law.

Prior to the CRA, European cybersecurity legislation primarily addressed critical infrastructure operators (NIS/NIS2 Directive) or specific consumer radio devices (Radio Equipment Directive delegated acts). The CRA introduces an **ex-ante market-access regime**: cybersecurity is no longer a post-incident liability issue or a voluntary best practice—it is a non-negotiable legal prerequisite for placing products on the EU Single Market and affixing the **CE mark**.

> [!IMPORTANT]
> **Statutory Citation:** Regulation (EU) 2024/2847 of the European Parliament and of the Council on horizontal cybersecurity requirements for products with digital elements and amending Regulations (EU) No 168/2013 and (EU) 2019/1020 and Directive (EU) 2020/1828. Consult the full legal text in the [CRA Legal Wiki](/wiki/cra).

---

## Scope of Application: Products with Digital Elements

The CRA applies across the entire supply chain to all **Products with Digital Elements (PDEs)** placed on the EU market, irrespective of whether the manufacturer is established within the Union or in a third country (Article 2(1)).

### 1. Statutory Definitions

- **Product with Digital Elements (Article 3(1)):** Any software or hardware product and its remote data processing solutions, including software or hardware components being placed on the market separately.
- **Data Connection (Article 3(9) & Recital 12):** Any logical or physical data connection through which data can be transferred, processed, or communicated, including wireless interfaces (Wi-Fi, Bluetooth, cellular, Zigbee), wired network interfaces (Ethernet, Industrial Ethernet, CAN bus, Modbus, RS-485), and direct physical bus connections (USB, PCIe, JTAG).
- **Remote Data Processing (Article 3(2)):** Any data processing at a distance for which the software is designed and developed by the manufacturer, or under the manufacturer's control, the absence of which would prevent the PDE from performing one of its primary functions (e.g., cloud control planes, companion telemetry backends, mobile companion applications).

### 2. Statutory Exclusions & Lex Specialis Carve-Outs

The CRA explicitly excludes products governed by established sectoral safety and cybersecurity legislation (Article 2(2)–(4)):

| Product Category | Governing EU Regulation | CRA Status |
| :--- | :--- | :--- |
| **Medical Devices & IVDs** | Regulation (EU) 2017/745 (MDR) & 2017/746 (IVDR) | Excluded (Lex Specialis) |
| **Civil Aviation Systems** | Regulation (EU) 2018/1139 | Excluded (Lex Specialis) |
| **Motor Vehicles & Components** | Regulation (EU) 2019/2144 | Excluded (Lex Specialis) |
| **Defense & National Security** | Products developed exclusively for national security or military defense | Excluded (Article 2(5)) |
| **Open-Source Software** | Free and open-source software developed or supplied outside the course of a commercial activity | Excluded (Recitals 18–21) |
| **Pure Cloud SaaS** | Cloud services independent of a physical or standalone software product | Governed by NIS2 / DORA |

> [!NOTE]
> Review all 76 official European Commission scope determinations in our [Official EU CRA FAQ Directory](/faq).

---

## The 4-Tier Risk Classification Architecture

The CRA classifies products into four distinct regulatory tiers based on their cybersecurity risk profile, their intended functionality, and the systemic impact of potential exploitation (Articles 6 & 7, Annexes III & IV).

| Classification Tier | Regulatory Basis | Typical Product Types | Conformity Assessment Route |
| :--- | :--- | :--- | :--- |
| **Standard PDEs** *(~90% of Market)* | Default (Article 6(1)) | Smart sensors, connected consumer devices, office peripherals, general software tools, industrial monitoring gauges | **Module A** *(Internal Production Control / Self-Assessment)* |
| **Important Class I** | Annex III | Identity management systems, standalone web browsers, password managers, antivirus software, network interfaces, SIEM tools, microcontrollers/microprocessors | **Module A** (if harmonised standards applied) **OR Module B+C / Module H** *(Notified Body)* |
| **Important Class II** | Annex IV | Hypervisors, firewalls, tamper-resistant chips, industrial automation PLCs, SCADA gateways, secure cryptoprocessors | **Mandatory Third-Party:** **Module B+C** *(EU-Type Examination)* **OR Module H** *(Full QA)* |
| **Critical Products** | Article 7 & Annex IV (Sec 2) | Hardware security modules (HSMs), smart meter gateways, advanced critical infrastructure controllers | **Mandatory European Cybersecurity Certificate** (under ENISA EUCC scheme at Level HIGH) |

\`\`\`
┌────────────────────────────────────────────────────────────────────────┐
│                   CRA 4-TIER RISK CLASSIFICATION                       │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  CRITICAL PDEs (Art 7) ──────────────► Mandatory EUCC Certificate     │
│  (HSMs, Smart Meter Gateways)          (High Assurance Level)          │
│                                                                        │
│  IMPORTANT CLASS II (Annex IV) ──────► Mandatory Notified Body Audit  │
│  (PLCs, Firewalls, Hypervisors)        (Module B+C or Module H)        │
│                                                                        │
│  IMPORTANT CLASS I (Annex III) ──────► Harmonised Standards / Module A │
│  (ID Management, Password Mgrs, SIEM)  (Fallback to Notified Body)     │
│                                                                        │
│  STANDARD PDEs (Default, ~90%) ──────► Module A Self-Assessment        │
│  (Connected Sensors, Apps, General SW) (Internal Production Control)   │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
\`\`\`

---

## Annex I Essential Cybersecurity Requirements

All PDEs placed on the EU market must satisfy the **Essential Requirements** set out in Annex I. These requirements are divided into two mandatory pillars:

### Pillar 1: Security by Design & Lifecycle Properties (Annex I, Part I)

1. **Security by Default (Requirement 1):** Products must be delivered with a secure baseline configuration. Factory-default passwords are prohibited; unique per-device credentials or mandatory first-boot credential changes are required. Unnecessary ports, protocols, and interfaces must be disabled by default.
2. **Data Protection & Cryptography (Requirements 2 & 3):** Confidentiality and integrity of data at rest, in transit, and in processing must be protected using state-of-the-art cryptographic mechanisms.
3. **Attack Surface Minimisation (Requirement 4):** Interfaces must be restricted to essential functions, applying the principle of least privilege across all hardware and software components.
4. **Exploitation Mitigation & Memory Safety (Requirement 5):** Products must incorporate modern mitigation techniques (e.g., address space layout randomization, buffer overflow protection, structured exception handling) to limit the impact of potential vulnerabilities.
5. **Security Logging & Monitoring (Requirement 6):** Products must record relevant security events (access attempts, privilege changes, configuration modifications) with tamper-resistant audit logs.

### Pillar 2: Vulnerability Handling & Supply Chain Transparency (Annex I, Part II)

1. **Software Bill of Materials (SBOM) (Requirement 1):** Manufacturers must identify and document all components, libraries, and dependencies included in the product—including top-level and transitive dependencies—in a machine-readable format (e.g., CycloneDX or SPDX).
2. **Coordinated Vulnerability Disclosure (CVD) (Requirement 2):** Manufacturers must establish and publish a transparent vulnerability disclosure policy, including a designated contact address (e.g., \`security.txt\`) for security researchers.
3. **Due Diligence in Component Integration (Article 13(6)):** Manufacturers must conduct rigorous due diligence when integrating third-party and open-source software, verifying that components do not contain known exploitable vulnerabilities.
4. **Timely, Free Security Updates (Requirements 3 & 4):** Security patches and updates must be made available promptly and free of charge throughout the entire determined support period (Article 13(8)), and must be delivered separately from feature enhancements.

---

## Economic Operator Obligations & Article 21 Liabilities

The CRA establishes clear, differentiated legal responsibilities across all economic operators in the supply chain (Chapter II, Articles 13–24):

### 1. Manufacturers (Article 13)

- **Lifecycle Risk Assessment:** Conduct and document a comprehensive cybersecurity risk assessment before placing the product on the market (Article 13(2)).
- **Technical File Preservation:** Maintain the complete Annex VII Technical Documentation for **10 years** after the product has been placed on the market, or for the duration of the support period, whichever is longer (Article 13(4)).
- **Support Period Determination:** Explicitly determine and state the support period (minimum of 5 years unless product lifecycle is shorter) during which security updates will be provided (Article 13(8)).
- **EU Declaration of Conformity & CE Mark:** Draw up the legal Declaration of Conformity (Annex V) and affix the CE marking visibly and legibly (Article 13(15)–(16)).

### 2. Importers (Article 17) & Distributors (Article 18)

- **Verification Mandate:** Must verify that the manufacturer has completed the appropriate conformity assessment, compiled the technical file, and affixed the CE mark.
- **Duty to Refrain (Article 20(2)):** If an importer or distributor knows or has reason to believe that a product does not comply with Annex I, they **must not** place or make the product available on the market until it is brought into conformity.

### 3. Substantial Modification & System Integrators (Article 21)

> [!WARNING]
> **The Article 21 Integrator Trap:** Any natural or legal person that carries out a **substantial modification** to a PDE—such as modifying software architecture, altering security parameters, or retrofitting legacy equipment—is legally deemed the **Manufacturer** under Article 21. They assume full liability for CRA conformity, Annex VII technical documentation, and CE re-certification.
>
> Learn more in our technical memorandum: [The 2-Year Lag: Why Turnkey Contracts Face Article 21 Traps](/blog/ep-01-the-2-year-lag-why-2024-contracts-are-walking-into-a-2027-regulatory-trap).

### 4. Open-Source Software Stewards (Article 24)

Entities that provide sustained support for the development of open-source software intended for commercial activities without themselves being commercial manufacturers are classified as **Open Source Software Stewards**. They are subject to a tailored, proportionate governance framework focusing on coordinated vulnerability disclosure and security cooperation rather than full manufacturing liability.

---

## Article 14 Mandatory Incident & Exploit Reporting Clocks

Article 14 establishes strict, legally binding timelines for notifying competent authorities when security incidents or active exploits occur. Notifications are submitted via the ENISA Single Reporting Platform to both the national Computer Security Incident Response Team (CSIRT) and ENISA.

\`\`\`
┌────────────────────────────────────────────────────────────────────────┐
│               ARTICLE 14 STATUTORY REPORTING TIMELINES                 │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  [Hour 0] ── Awareness of Active Exploit or Severe Incident            │
│     │                                                                  │
│  [Hour 24] ──► EARLY WARNING NOTIFICATION (Art 14(1)(a) / 14(3)(a))     │
│     │          - Exploit indicator, suspected severity, initial scope  │
│     │                                                                  │
│  [Hour 72] ──► DETAILED INCIDENT NOTIFICATION (Art 14(1)(b) / 14(3)(b))│
│     │          - General description, risk assessment, mitigations     │
│     │                                                                  │
│  FINAL CLOSING REPORT:                                                 │
│     ├── Track A: Actively Exploited Vulnerability (Art 14(1)(c))       │
│     │   └── Within 14 DAYS after corrective patch/workaround available │
│     │                                                                  │
│     └── Track B: Severe Incident (Art 14(3)(c))                        │
│         └── Within 1 MONTH after the 72-hour notification              │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
\`\`\`

| Reporting Stage | Statutory Deadline | Required Information Content |
| :--- | :--- | :--- |
| **Early Warning** | **Within 24 Hours** of awareness | Indicates whether the vulnerability is actively exploited by malicious actors, initial assessment of severity, and whether other Member States are affected. |
| **Detailed Notification** | **Within 72 Hours** of awareness | Description of the vulnerability or incident, root-cause indicators, affected product versions, applied mitigations, and corrective measures. |
| **Final Report (Vulnerabilities)** | **Within 14 Days** of fix availability | Full vulnerability analysis, technical details of the corrective security update, and guidance for end-users. |
| **Final Report (Incidents)** | **Within 1 Month** of notification | Comprehensive incident post-mortem, severity metrics, impact scope, and long-term remediation roadmap. |

---

## Technical Dossier (Annex VII) & CE Marking Protocol

To legally affix the CE mark and access the EU Single Market, manufacturers must compile a comprehensive **Technical Documentation File** before product release (Article 28 & Annex VII).

### Required Contents of the Annex VII Technical File

1. **System Description & Architecture:** General description of the PDE, block diagrams, operational context, network interface definitions, and hardware/software execution environments.
2. **Cybersecurity Risk Assessment:** Documented risk assessment according to Article 13(2), identifying potential threats, threat actors, attack surfaces, and corresponding technical mitigations.
3. **Annex I Conformity Mapping:** Point-by-point demonstration of compliance with every applicable requirement in Annex I Part I and Part II.
4. **Machine-Readable SBOM:** Complete, structured Software Bill of Materials (CycloneDX / SPDX) with component hashes, package URLs (purl), and dependency hierarchies.
5. **Vulnerability Handling Records:** Evidence of coordinated vulnerability disclosure processes, testing logs, static/dynamic code analysis reports, and penetration test certificates.
6. **EU Declaration of Conformity (Annex V):** Signed legal instrument declaring compliance with Regulation (EU) 2024/2847 and identifying applied harmonised European standards (CEN/CENELEC).

---

## Statutory Timelines & Non-Compliance Penalties

The CRA establishes a phased implementation schedule and substantial administrative fines for non-compliance (Articles 64 & 69).

### Phased Implementation Milestones

- **10 December 2024:** Regulation (EU) 2024/2847 enters into force.
- **11 June 2026 (18 Months):** Notification of conformity assessment bodies (Notified Bodies) begins.
- **11 September 2026 (21 Months):** **Article 14 Reporting Obligations become legally enforceable.** Manufacturers must operate 24h/72h incident reporting systems.
- **11 December 2027 (36 Months):** **Full Application.** All Annex I essential requirements, conformity assessment procedures, and CE marking rules become mandatory for market entry.

### Administrative Sanctions (Article 64)

| Violation Category | Statutory Basis | Maximum Administrative Penalty |
| :--- | :--- | :--- |
| **Non-compliance with Annex I Essential Requirements** | Article 64(1) | Up to **€15,000,000** or **2.5% of total worldwide annual turnover**, whichever is higher. |
| **Non-compliance with other CRA obligations (e.g., Technical File, SBOM)** | Article 64(2) | Up to **€10,000,000** or **2.0% of total worldwide annual turnover**, whichever is higher. |
| **Supplying incorrect, incomplete, or misleading information to authorities** | Article 64(3) | Up to **€5,000,000** or **1.0% of total worldwide annual turnover**, whichever is higher. |

---

## Operationalizing CRA Conformance with OXOT

The OXOT Conformance Platform transforms complex statutory mandates into an automated, auditable, and continuous operational workflow:

- **Unified Requirement Catalogue:** Cross-maps all 70+ CRA requirements against NIS2, IEC 62443, and the EU AI Act in our [Conformity Requirements Explorer](/conformity/requirements).
- **Automated SBOM & Vulnerability Tracking:** Continuous CycloneDX SBOM ingestion, vulnerability scanning, and upstream component monitoring in the [Conformity Dashboard](/conformity).
- **Article 14 Incident Automation:** Built-in statutory countdown clocks and automated dispatch templates for CSIRT/ENISA reporting.
- **Annex VII Technical Dossier Generation:** Automated assembly of audit-ready conformity packages with end-to-end evidence citation.

### Next Steps for Engineering & Compliance Teams

1. **Assess Your Exposure:** Run the interactive [2-Minute CRA Readiness Check](/cra-check) to benchmark your product against mandatory requirements.
2. **Explore the Legal Text:** Search articles, recitals, and annexes in the [CRA Statutory Wiki](/wiki/cra).
3. **Review Official Guidance:** Consult the [76 Official European Commission FAQs](/faq).
4. **Deepen Technical Knowledge:** Read authoritative engineering blueprints in the [CRA Technical Journal](/blog).
5. **Schedule an Architecture Review:** [Book a Demo](/demo) with our technical compliance specialists.
`,
  },
  {
    slug: "conformance-process",
    title: "Our Conformance Process",
    seoTitle: "The Conformance Process | From Assessment to Evidence",
    seoDescription:
      "How this platform turns regulatory text into a working process: assess, evidence, track components, handle incidents, and report.",
    excerpt:
      "Regulation text does not tell you what to do on Monday morning. Our process does: assess, evidence, track, respond, report.",
    visibility: "public",
    regulationKeys: [],
    markdown: `## From legal text to Monday morning

A regulation tells you *what* must be true. It does not tell you *how* to get there. This platform implements a repeatable process that works for the CRA today and extends to each regulation we add:

### 1. Assess

Every requirement in the catalogue becomes a question with a graded answer. You always know two things separately: **how far you are** (journey) and **how good your evidence is** (grade).

### 2. Evidence

Answers link to evidence — documents, configurations, test results — so every claim in your conformity documentation traces back to something real.

### 3. Track components

Your product's bill of materials (SBOM) is ingested and continuously checked: known vulnerabilities, upstream notification gaps, and the component-level facts your technical documentation must contain.

### 4. Respond

When a vulnerability becomes an incident, the platform runs the regulatory clocks for you — early warning, notification, final report — with alerts before every deadline.

### 5. Report

Frozen-snapshot reports assemble the evidence into executive summaries, assessment reports, and the technical documentation package — with full citation traceability.

## Why one process for many regulations

The CRA, AI Act, NIS2 and the rest overlap heavily: risk management, documentation, incident reporting, supply-chain control. By mapping every regulation into one requirement catalogue with cross-regulation links, work you do once counts everywhere it applies. See [the regulations we address](/regulations-we-address).`,
  },
  {
    slug: "artifacts-coverage",
    title: "Artifacts & Coverage",
    seoTitle: "Conformance Artifacts | What We Produce and What It Satisfies",
    seoDescription:
      "Every artifact this platform produces, mapped to the CRA article or annex it satisfies — the page to show your auditor.",
    excerpt:
      "Conformance is proven with artifacts. This page maps each artifact the platform produces to the CRA obligation it satisfies.",
    visibility: "public",
    regulationKeys: ["cra"],
    markdown: `## Evidence, mapped to obligation

Auditors and notified bodies do not ask whether you *feel* compliant — they ask for artifacts. This platform produces each of the following, mapped to the CRA obligation it supports:

| Artifact | CRA obligation |
| --- | --- |
| **Technical documentation package** | Annex VII — the complete technical file for conformity assessment |
| **EU Declaration of Conformity** | Annex V / Article 28 — the manufacturer's legal declaration |
| **Risk assessment record** | Article 13(2)–(3) & Annex I Part I — documented cybersecurity risk assessment |
| **Software Bill of Materials (SBOM)** | Annex I Part II(1) — machine-readable component inventory |
| **Vulnerability handling records** | Annex I Part II — disclosure policy, remediation, and update history |
| **Article 14 incident reports** | Article 14 — early warning (24 h), notification (72 h), final report |
| **Support-period declaration** | Article 13(8) — the committed security-update horizon |
| **Assessment & conformity reports** | Working evidence of the ongoing conformity process |

Every artifact is generated from the live assessment workspace, so the technical file and the day-to-day work can never drift apart.

As additional regulation tracks activate on this deployment, their artifact mappings appear here alongside the CRA's.`,
  },
  {
    slug: "regulations-we-address",
    title: "Regulations We Address",
    seoTitle: "Regulation Tracks | CRA Today, More as Workflows Ship",
    seoDescription:
      "The regulation tracks this conformance platform addresses: CRA active today; AI Act, NIS2, Machinery, IEC 62443 and more as workflows ship.",
    excerpt:
      "One platform, one body of evidence, many regulations. CRA is active today; further tracks activate as their workflows ship.",
    visibility: "public",
    regulationKeys: [],
    markdown: `## One platform, expanding coverage

This deployment is built around a single unified requirement catalogue. Each regulation is a **track** on that catalogue — and because requirements are cross-mapped, evidence produced for one track counts toward every other track it satisfies.

### Active now

- **EU Cyber Resilience Act (CRA)** — full workflow: assessment, SBOM & vulnerability tracking, Article 14 incident handling, technical documentation. Start with the [CRA primer](/cra-primer).

### In the catalogue, workflows in development

- **EU AI Act** — risk-classified obligations for AI systems
- **NIS2 Directive** — organisational and network security for essential entities
- **Machinery Regulation** — safety of machinery with digital elements
- **IEC 62443** — industrial automation and control-system security
- **Radio Equipment Directive (RED)** — connected-device security baseline
- **GDPR** and **CER** — data protection and critical-entity resilience overlaps

### How a new track activates

1. The regulation's requirements are loaded into the catalogue and cross-mapped.
2. Its workflow (assessment steps, evidence types, deadlines) is enabled.
3. Its education and reference material appears in the Knowledge Hub.

No re-platforming, no second tool — the same process and the same body of information, applied to the next obligation.`,
  },
  // --- Members tier: the Knowledge Hub shelves -----------------------------
  {
    slug: "cra-article-guide",
    title: "CRA Article-by-Article Guide",
    seoTitle: "CRA Article Guide | Members",
    seoDescription: "Article-by-article guidance for meeting the Cyber Resilience Act.",
    excerpt:
      "What each CRA article and annex actually asks of you, in the order you will meet them in an assessment.",
    visibility: "members",
    regulationKeys: ["cra"],
    markdown: `## Reading the CRA the way an assessor does

### Article 13 — Obligations of manufacturers

The heart of the regulation. Key paragraphs:

- **13(1)–(3):** ship only products designed, developed and produced in line with Annex I Part I, backed by a documented risk assessment that is kept current.
- **13(5):** the risk assessment goes *into the technical documentation* — it is not an internal side-document.
- **13(6):** exercise due diligence when integrating third-party components — this is where your SBOM and upstream notification duties bite.
- **13(8):** determine and declare the support period (normally at least five years).

### Article 14 — Reporting

Two separate tracks, each with its own clock:

1. **Actively exploited vulnerability** → early warning 24 h → notification 72 h → final report **14 days after a fix is available**.
2. **Severe incident** → early warning 24 h → notification 72 h → final report **one month after the notification**.

The platform runs both clocks automatically when you open an incident.

### Annex I Part I — Essential requirements

Secure-by-default configuration, protection of confidentiality and integrity, attack-surface minimisation, resilience against denial of service, logging, and secure update capability. Each maps to one or more assessment questions in your workspace.

### Annex I Part II — Vulnerability handling

SBOM, coordinated disclosure policy, regular testing, security-update distribution without delay and free of charge.

### Annexes V–VIII — Showing conformity

The EU Declaration of Conformity (V), the conformity-assessment procedures (VIII), and the technical-documentation contents (VII) — all generated by this platform from your live workspace.

For the underlying legal text of any requirement, open the requirement in the [workbench catalogue](/knowledge/requirements).`,
  },
  {
    slug: "cra-templates",
    title: "Templates & Artifact Examples",
    seoTitle: "CRA Templates & Examples | Members",
    seoDescription: "Worked examples and templates for every CRA artifact this platform produces.",
    excerpt:
      "Every artifact the platform generates, with a worked example from the demo assessment so you know what good looks like.",
    visibility: "members",
    regulationKeys: ["cra"],
    markdown: `## What good looks like

This deployment ships with a fully-worked demo assessment. Use its outputs as reference examples for your own:

### Technical documentation package

Open the demo assessment's report workspace and export the technical documentation report. Note how every section cites evidence items — your own package should reach the same citation density.

### EU Declaration of Conformity

The DoC template is generated from the assessment once the conformity route is chosen. The demo shows a completed self-assessment (Module A) declaration.

### SBOM

The demo product includes an ingested CycloneDX SBOM. Export it from the BOM tab to see the expected format, component identities (purl), and vulnerability annotations.

### Article 14 incident reports

The demo includes a resolved incident with its full report chain — early warning, notification, and final report — showing the level of detail each stage needs.

### Risk assessment record

Each answered requirement in the demo carries a graded answer with linked evidence; together they form the documented risk assessment Article 13(5) requires in the technical file.

> **Tip:** ask the assistant "show me an example of X" — it is indexed over this material and the live workspace.`,
  },
  {
    slug: "workbench-how-to",
    title: "Workbench How-To Guides",
    seoTitle: "Workbench How-Tos | Members",
    seoDescription: "Step-by-step guides for the day-to-day conformance workflows in the workbench.",
    excerpt:
      "Step-by-step guides for the workflows you will run most: assessments, SBOM uploads, incidents, and reports.",
    visibility: "members",
    regulationKeys: [],
    markdown: `## The four workflows you will run most

### Running an assessment

1. Create a product, then start an assessment for it.
2. Work through requirements theme by theme; each answer takes a grade **and** evidence links.
3. The overview shows journey (how far) separately from grade (how good) — "done" requires both.

### Uploading and monitoring a BOM

1. In the assessment's BOM tab, upload a CycloneDX or SPDX file.
2. The pipeline ingests components and matches known vulnerabilities.
3. Watch the **Article 13(6) notification gaps** panel — upstream vulnerabilities you may need to notify about.

### Handling an incident

1. Open an incident from a vulnerability finding (or directly).
2. The Article 14 clocks start automatically — early warning, notification, final report deadlines appear with alert emails ahead of each.
3. Track status through investigating → mitigated → resolved; the final-report deadline follows the correct regulatory track for the incident type.

### Generating reports

1. In the report workspace, choose a format (executive summary, assessment report, technical documentation).
2. Reports freeze a snapshot — later workspace changes never silently alter an issued report.
3. Every AI-drafted section carries citation markers back to the frozen evidence; edit freely, citations are re-validated on save.

For anything else, ask the assistant — it knows both this material and your live workspace.`,
  },
];

// --- Dutch member pages: translated equivalents of the 3 Knowledge Hub
// shelves above (cra-article-guide, cra-templates, workbench-how-to), seeded
// under locale "nl" so /nl/knowledge shows real content instead of the empty
// state. Same slugs as their English counterparts (unique on slug+locale) so
// Knowledge Hub links (which fetch by the active locale) resolve identically.
// Machine-assisted professional Dutch ("u") — flag for a native reviewer
// before go-live, per docs/plans/dutch-i18n/glossary.md.
const NL_MEMBER_PAGES: SeedPage[] = [
  {
    slug: "cra-article-guide",
    title: "CRA Artikel-voor-Artikel Gids",
    seoTitle: "CRA-artikelgids | Leden",
    seoDescription: "Artikelsgewijze richtlijnen om aan de Cyber Resilience Act te voldoen.",
    excerpt:
      "Wat elk CRA-artikel en elke bijlage werkelijk van u vraagt, in de volgorde waarin u ze tegenkomt tijdens een beoordeling.",
    visibility: "members",
    regulationKeys: ["cra"],
    markdown: `## De CRA lezen zoals een beoordelaar dat doet

### Artikel 13 — Verplichtingen van fabrikanten

Het hart van de verordening. Belangrijkste leden:

- **13(1)–(3):** breng alleen producten op de markt die zijn ontworpen, ontwikkeld en geproduceerd conform Bijlage I, deel I, onderbouwd met een gedocumenteerde risicobeoordeling die actueel wordt gehouden.
- **13(5):** de risicobeoordeling maakt *deel uit van de technische documentatie* — het is geen intern nevendocument.
- **13(6):** betracht passende zorgvuldigheid bij het integreren van componenten van derden — hier komen uw SBOM en meldingsplichten richting leveranciers om de hoek kijken.
- **13(8):** bepaal en verklaar de ondersteuningsperiode (doorgaans ten minste vijf jaar).

### Artikel 14 — Melding

Twee afzonderlijke trajecten, elk met zijn eigen klok:

1. **Actief misbruikte kwetsbaarheid** → vroegtijdige waarschuwing 24 u → melding 72 u → eindverslag **14 dagen nadat een oplossing beschikbaar is**.
2. **Ernstig incident** → vroegtijdige waarschuwing 24 u → melding 72 u → eindverslag **één maand na de melding**.

Het platform start beide klokken automatisch zodra u een incident opent.

### Bijlage I, deel I — Essentiële vereisten

Standaard veilige configuratie, bescherming van vertrouwelijkheid en integriteit, beperking van het aanvalsoppervlak, weerbaarheid tegen denial-of-service, logging en de mogelijkheid tot veilig bijwerken. Elke vereiste is gekoppeld aan een of meer beoordelingsvragen in uw werkruimte.

### Bijlage I, deel II — Omgaan met kwetsbaarheden

SBOM, gecoördineerd meldingsbeleid, regelmatige tests, verspreiding van beveiligingsupdates zonder vertraging en kosteloos.

### Bijlagen V–VIII — Conformiteit aantonen

De EU-conformiteitsverklaring (V), de conformiteitsbeoordelingsprocedures (VIII) en de inhoud van de technische documentatie (VII) — allemaal gegenereerd door dit platform vanuit uw actieve werkruimte.

Voor de onderliggende wettekst van een vereiste opent u de vereiste in de [workbench-catalogus](/knowledge/requirements).`,
  },
  {
    slug: "cra-templates",
    title: "Sjablonen & Voorbeelden van Artefacten",
    seoTitle: "CRA-sjablonen & voorbeelden | Leden",
    seoDescription: "Uitgewerkte voorbeelden en sjablonen voor elk CRA-artefact dat dit platform genereert.",
    excerpt:
      "Elk artefact dat het platform genereert, met een uitgewerkt voorbeeld uit de demo-beoordeling, zodat u weet hoe goed eruitziet.",
    visibility: "members",
    regulationKeys: ["cra"],
    markdown: `## Hoe goed eruitziet

Deze implementatie wordt geleverd met een volledig uitgewerkte demobeoordeling. Gebruik de output ervan als referentievoorbeeld voor uw eigen dossier:

### Technisch documentatiepakket

Open de rapportwerkruimte van de demobeoordeling en exporteer het technische documentatierapport. Let op hoe elke sectie bewijsstukken citeert — uw eigen pakket moet dezelfde citatiedichtheid bereiken.

### EU-conformiteitsverklaring

Het sjabloon voor de conformiteitsverklaring wordt gegenereerd vanuit de beoordeling zodra de conformiteitsroute is gekozen. De demo toont een voltooide zelfbeoordelingsverklaring (Module A).

### SBOM

Het demoproduct bevat een ingelezen CycloneDX-SBOM. Exporteer deze vanuit het BOM-tabblad om het verwachte formaat, de componentidentiteiten (purl) en de kwetsbaarheidsannotaties te zien.

### Artikel 14-incidentrapporten

De demo bevat een opgelost incident met de volledige rapportketen — vroegtijdige waarschuwing, melding en eindverslag — met het detailniveau dat elke fase vereist.

### Risicobeoordelingsdossier

Elke beantwoorde vereiste in de demo heeft een beoordeelde score met gekoppeld bewijs; samen vormen zij de gedocumenteerde risicobeoordeling die Artikel 13(5) verplicht stelt in het technisch dossier.

> **Tip:** vraag de assistent "laat mij een voorbeeld van X zien" — deze is geïndexeerd over dit materiaal en de actieve werkruimte.`,
  },
  {
    slug: "workbench-how-to",
    title: "Workbench Handleidingen",
    seoTitle: "Workbench-handleidingen | Leden",
    seoDescription: "Stapsgewijze handleidingen voor de dagelijkse conformiteitswerkstromen in de workbench.",
    excerpt:
      "Stapsgewijze handleidingen voor de werkstromen die u het vaakst gebruikt: beoordelingen, SBOM-uploads, incidenten en rapporten.",
    visibility: "members",
    regulationKeys: [],
    markdown: `## De vier werkstromen die u het vaakst gebruikt

### Een beoordeling uitvoeren

1. Maak een product aan en start vervolgens een beoordeling ervoor.
2. Doorloop de vereisten thema voor thema; elk antwoord krijgt een score **en** gekoppeld bewijs.
3. Het overzicht toont voortgang (hoever u bent) apart van score (hoe goed) — "gereed" vereist beide.

### Een BOM uploaden en monitoren

1. Upload in het BOM-tabblad van de beoordeling een CycloneDX- of SPDX-bestand.
2. De pijplijn verwerkt componenten en matcht bekende kwetsbaarheden.
3. Houd het paneel **meldingshiaten Artikel 13(6)** in de gaten — kwetsbaarheden bij leveranciers waarover u mogelijk moet melden.

### Een incident afhandelen

1. Open een incident vanuit een kwetsbaarheidsbevinding (of rechtstreeks).
2. De Artikel 14-klokken starten automatisch — deadlines voor vroegtijdige waarschuwing, melding en eindverslag verschijnen met waarschuwingsmails voorafgaand aan elke deadline.
3. Volg de status via onderzoek → gemitigeerd → opgelost; de deadline voor het eindverslag volgt het juiste wettelijke traject voor het type incident.

### Rapporten genereren

1. Kies in de rapportwerkruimte een formaat (managementsamenvatting, beoordelingsrapport, technische documentatie).
2. Rapporten bevriezen een momentopname — latere wijzigingen in de werkruimte veranderen een uitgegeven rapport nooit stilzwijgend.
3. Elke door AI opgestelde sectie bevat citatiemarkeringen die terugverwijzen naar het bevroren bewijs; bewerk vrijelijk, citaten worden bij opslaan opnieuw gevalideerd.

Voor al het overige kunt u de assistent raadplegen — deze kent zowel dit materiaal als uw actieve werkruimte.`,
  },
];

// Limited English navigation for the customer deployment.
const HEADER_NAV = [
  { label: "CRA Primer", href: "/cra-primer" },
  { label: "Our Process", href: "/conformance-process" },
  { label: "Artifacts", href: "/artifacts-coverage" },
  { label: "Regulations", href: "/regulations-we-address" },
];
const FOOTER_NAV = [
  ...HEADER_NAV,
  { label: "Conformity Workbench", href: "/conformity/", external: true },
];

async function seed() {
  for (const page of PAGES) {
    await db.transaction(async (tx) => {
      await tx
        .delete(pagesTable)
        .where(and(eq(pagesTable.slug, page.slug), eq(pagesTable.locale, "en")));

      const [row] = await tx
        .insert(pagesTable)
        .values({
          slug: page.slug,
          serviceKey: page.slug,
          locale: "en",
          title: page.title,
          seoTitle: page.seoTitle,
          seoDescription: page.seoDescription,
          noindex: true,
          visibility: page.visibility,
          regulationKeys: page.regulationKeys,
          status: "published",
        })
        .returning({ id: pagesTable.id });

      await tx.insert(pageSectionsTable).values({
        pageId: row.id,
        type: "article",
        sortOrder: 0,
        data: { title: page.title, excerpt: page.excerpt, markdown: page.markdown },
      });
    });
    log(`Seeded ${page.visibility} page: ${page.slug}`);
  }

  // Dutch equivalents of the members-tier Knowledge Hub shelves (see
  // NL_MEMBER_PAGES above). Matched on (slug, locale="nl"), same idempotent
  // replace pattern as the English loop.
  for (const page of NL_MEMBER_PAGES) {
    await db.transaction(async (tx) => {
      await tx
        .delete(pagesTable)
        .where(and(eq(pagesTable.slug, page.slug), eq(pagesTable.locale, "nl")));

      const [row] = await tx
        .insert(pagesTable)
        .values({
          slug: page.slug,
          serviceKey: page.slug,
          locale: "nl",
          title: page.title,
          seoTitle: page.seoTitle,
          seoDescription: page.seoDescription,
          noindex: true,
          visibility: page.visibility,
          regulationKeys: page.regulationKeys,
          status: "published",
        })
        .returning({ id: pagesTable.id });

      await tx.insert(pageSectionsTable).values({
        pageId: row.id,
        type: "article",
        sortOrder: 0,
        data: { title: page.title, excerpt: page.excerpt, markdown: page.markdown },
      });
    });
    log(`Seeded ${page.visibility} page (nl): ${page.slug}`);
  }

  // Mark ALL pages noindex: a per-customer deployment must not be indexed.
  await db.update(pagesTable).set({ noindex: true });
  log("Set noindex on all pages (per-customer deployment).");

  // Rebuild the limited English nav. Dutch locale is left untouched.
  await db.transaction(async (tx) => {
    await tx.delete(navItemsTable).where(eq(navItemsTable.locale, "en"));
    await tx.insert(navItemsTable).values([
      ...HEADER_NAV.map((item, i) => ({
        locale: "en",
        label: item.label,
        href: item.href,
        placement: "header",
        sortOrder: i,
        external: false,
      })),
      ...FOOTER_NAV.map((item, i) => ({
        locale: "en",
        label: item.label,
        href: item.href,
        placement: "footer",
        sortOrder: i,
        external: "external" in item ? Boolean(item.external) : false,
      })),
    ]);
  });
  log("Rebuilt limited English navigation.");

  // Sanity check: everything we just wrote is retrievable. Dutch pages share
  // slugs with their English counterparts (unique per slug+locale), so the
  // expected count is English rows + Dutch rows, not just distinct slugs.
  const allSlugs = [...PAGES.map((p) => p.slug), ...NL_MEMBER_PAGES.map((p) => p.slug)];
  const seeded = await db
    .select({ slug: pagesTable.slug, locale: pagesTable.locale, visibility: pagesTable.visibility })
    .from(pagesTable)
    .where(inArray(pagesTable.slug, allSlugs));
  const expected = PAGES.length + NL_MEMBER_PAGES.length;
  log(`Verified ${seeded.length}/${expected} seeded page rows present (en + nl).`);
}

import { reindexContent } from "../lib/rag";

seed()
  .then(async () => {
    log("Rebuilding content index embeddings...");
    const chunksCount = await reindexContent();
    log(`Customer-site seed and content reindex complete! Total indexed passages: ${chunksCount}`);
    await pool.end();
    process.exit(0);
  })
  .catch(async (err) => {
    process.stderr.write(`Customer-site seed failed: ${String(err)}\n`);
    await pool.end();
    process.exit(1);
  });
