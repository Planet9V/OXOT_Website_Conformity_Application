/**
 * Seeds the conformity knowledge & cross-mapping engine: regulations, product
 * classes, conformity routes, cross-cutting themes, requirements, and the
 * cross-regulation requirement mappings that power the "one control, many
 * clauses" matrix.
 *
 * Content is grounded in the public texts of the EU Cyber Resilience Act
 * (Reg (EU) 2024/2847), the EU AI Act (Reg (EU) 2024/1689), the Machinery
 * Regulation (EU) 2023/1230, and the IEC 62443 series (4-1 / 4-2). It is a
 * curated working reference, not a substitute for the official legal texts.
 *
 * Idempotent — clears the conformity tables before inserting.
 * Run with: pnpm --filter @workspace/api-server run seed:conformity
 */
import {
  db,
  regulationsTable,
  conformityThemesTable,
  productClassesTable,
  conformityRoutesTable,
  requirementsTable,
  requirementMappingsTable,
  type InsertRegulation,
  type InsertConformityTheme,
  type InsertProductClass,
  type InsertConformityRoute,
  type InsertRequirement,
  type InsertRequirementMapping,
} from "@workspace/db";

const log = (msg: string) => process.stdout.write(`${msg}\n`);

const regulations: InsertRegulation[] = [
  {
    key: "cra",
    name: "Cyber Resilience Act",
    shortName: "CRA",
    fullTitle:
      "Regulation (EU) 2024/2847 on horizontal cybersecurity requirements for products with digital elements",
    jurisdiction: "European Union",
    summary:
      "Sets mandatory cybersecurity requirements for the design, development, production and vulnerability handling of any product with digital elements placed on the EU market. Introduces essential product requirements (Annex I Part I), vulnerability-handling requirements (Annex I Part II), CE marking, and risk-based conformity routes tied to product classes.",
    inForceDate: "2024-12-10",
    sourceUrl: "https://eur-lex.europa.eu/eli/reg/2024/2847/oj",
    keyDates: [
      { date: "2024-12-10", label: "CRA enters into force" },
      { date: "2026-06-11", label: "Notified-body rules apply" },
      { date: "2026-09-11", label: "Reporting obligations (Art 14) apply" },
      { date: "2027-12-11", label: "Full application — CE marking required" },
    ],
    sortOrder: 1,
  },
  {
    key: "ai_act",
    name: "EU Artificial Intelligence Act",
    shortName: "AI Act",
    fullTitle:
      "Regulation (EU) 2024/1689 laying down harmonised rules on artificial intelligence",
    jurisdiction: "European Union",
    summary:
      "Risk-based framework for AI systems. High-risk systems must meet requirements on risk management, data governance, technical documentation, logging, transparency, human oversight, and accuracy/robustness/cybersecurity, backed by a quality management system, conformity assessment, registration, and post-market monitoring.",
    inForceDate: "2024-08-01",
    sourceUrl: "https://eur-lex.europa.eu/eli/reg/2024/1689/oj",
    keyDates: [
      { date: "2024-08-01", label: "AI Act enters into force" },
      { date: "2025-02-02", label: "Prohibited practices (Art 5) apply" },
      { date: "2025-08-02", label: "GPAI and governance rules apply" },
      { date: "2026-08-02", label: "High-risk (Annex III) obligations apply" },
      { date: "2027-08-02", label: "High-risk (Annex I) obligations apply" },
    ],
    sortOrder: 2,
  },
  {
    key: "machinery",
    name: "Machinery Regulation",
    shortName: "Machinery",
    fullTitle:
      "Regulation (EU) 2023/1230 on machinery, repealing Directive 2006/42/EC",
    jurisdiction: "European Union",
    summary:
      "Essential health and safety requirements for machinery, now including explicit cybersecurity provisions for safety-related control systems (protection against corruption, reliability of control systems). Requires a technical file, risk assessment, EU Declaration of Conformity, and — for high-risk categories — third-party conformity assessment.",
    inForceDate: "2023-07-19",
    sourceUrl: "https://eur-lex.europa.eu/eli/reg/2023/1230/oj",
    keyDates: [
      { date: "2023-07-19", label: "Machinery Regulation enters into force" },
      { date: "2027-01-20", label: "Full application — repeals Directive 2006/42/EC" },
    ],
    sortOrder: 3,
  },
  {
    key: "iec_62443",
    name: "IEC 62443 Series",
    shortName: "IEC 62443",
    fullTitle:
      "IEC 62443 — Security for industrial automation and control systems (IACS)",
    jurisdiction: "International standard",
    summary:
      "The reference standard series for OT/ICS cybersecurity. 62443-4-1 defines a secure product development lifecycle (eight practices); 62443-4-2 defines technical component requirements across seven foundational requirements. Target Security Levels (SL 1-4) scale controls to the threat. Widely used as evidence for CRA and Machinery cybersecurity obligations.",
    inForceDate: null,
    sourceUrl: "https://www.iec.ch/blog/understanding-iec-62443",
    keyDates: [
      { date: "2013-08-01", label: "IEC 62443-3-3 published (system security requirements)" },
      { date: "2018-01-01", label: "IEC 62443-4-1 published (secure development lifecycle)" },
      { date: "2019-02-01", label: "IEC 62443-4-2 published (component requirements)" },
    ],
    sortOrder: 4,
  },
  {
    key: "nis2",
    name: "NIS2 Directive",
    shortName: "NIS2",
    fullTitle:
      "Directive (EU) 2022/2555 on measures for a high common level of cybersecurity across the Union",
    jurisdiction: "European Union",
    summary:
      "EU-wide cybersecurity directive imposing risk-management, governance and incident-reporting obligations on essential and important entities across critical sectors (energy, transport, water, health, digital infrastructure, manufacturing and more). Unlike the product-focused CRA, NIS2 governs the operator: management accountability, a defined set of technical and organisational measures (Art 21), and strict incident notification timelines (Art 23).",
    inForceDate: "2023-01-16",
    sourceUrl: "https://eur-lex.europa.eu/eli/dir/2022/2555/oj",
    keyDates: [
      { date: "2023-01-16", label: "NIS2 Directive enters into force" },
      { date: "2024-10-17", label: "Member State transposition deadline" },
      { date: "2024-10-18", label: "National measures apply" },
      { date: "2025-04-17", label: "Member States establish registers of entities" },
    ],
    sortOrder: 5,
  },
  {
    key: "red",
    name: "Radio Equipment Directive",
    shortName: "RED",
    fullTitle:
      "Directive 2014/53/EU on radio equipment, with Delegated Regulation (EU) 2022/30 activating its cybersecurity requirements",
    jurisdiction: "European Union",
    summary:
      "Governs any product that intentionally emits or receives radio waves (Wi-Fi, Bluetooth, cellular, and most connected/IoT devices). Delegated Regulation (EU) 2022/30 activates three cybersecurity essential requirements: protection of the network (Art 3(3)(d)), safeguarding of personal data and privacy (Art 3(3)(e)) and protection against fraud (Art 3(3)(f)). Conformity is shown via CE marking, and the harmonised standard series EN 18031 supports self-assessment.",
    inForceDate: "2016-06-13",
    sourceUrl: "https://eur-lex.europa.eu/eli/dir/2014/53/oj",
    keyDates: [
      { date: "2016-06-13", label: "Radio Equipment Directive applies" },
      { date: "2022-01-12", label: "Delegated Regulation (EU) 2022/30 published" },
      { date: "2025-08-01", label: "Cybersecurity requirements (Art 3(3)(d)(e)(f)) apply" },
      { date: "2027-12-11", label: "Art 3(3)(d)(e)(f) requirements END — Delegated Regulation (EU) 2022/30 repealed by 2026/339; the CRA governs from this date" },
    ],
    sortOrder: 6,
  },
  {
    key: "gdpr",
    name: "General Data Protection Regulation",
    shortName: "GDPR",
    fullTitle:
      "Regulation (EU) 2016/679 on the protection of natural persons with regard to the processing of personal data",
    jurisdiction: "European Union",
    summary:
      "The EU's data-protection regime. Beyond principles and data-subject rights, it imposes concrete engineering obligations: data protection by design and by default (Art 25), security of processing (Art 32), a data protection impact assessment for high-risk processing (Art 35), records of processing (Art 30) and personal-data breach notification within 72 hours (Arts 33-34). Compliance is demonstrated through accountability rather than CE marking.",
    inForceDate: "2018-05-25",
    sourceUrl: "https://eur-lex.europa.eu/eli/reg/2016/679/oj",
    keyDates: [
      { date: "2016-05-24", label: "GDPR enters into force" },
      { date: "2018-05-25", label: "GDPR applies" },
    ],
    sortOrder: 7,
  },
  {
    key: "cer",
    name: "Critical Entities Resilience Directive",
    shortName: "CER",
    fullTitle:
      "Directive (EU) 2022/2557 on the resilience of critical entities",
    jurisdiction: "European Union",
    summary:
      "The physical, all-hazards counterpart to NIS2. It obliges Member States to identify critical entities across eleven sectors and requires those entities to assess risks (Art 12), take technical, security and organisational resilience measures (Art 13), run background checks (Art 14) and notify significant disruptive incidents (Art 15). Where NIS2 protects network and information systems, CER protects the entity's ability to keep providing essential services.",
    inForceDate: "2023-01-16",
    sourceUrl: "https://eur-lex.europa.eu/eli/dir/2022/2557/oj",
    keyDates: [
      { date: "2023-01-16", label: "CER Directive enters into force" },
      { date: "2024-10-17", label: "Member State transposition deadline" },
      { date: "2026-07-17", label: "Member States identify critical entities" },
    ],
    sortOrder: 8,
  },
  {
    key: "dora",
    name: "Digital Operational Resilience Act",
    shortName: "DORA",
    fullTitle:
      "Regulation (EU) 2022/2554 on digital operational resilience for the financial sector",
    jurisdiction: "European Union",
    summary:
      "A lex specialis for the financial sector consolidating ICT risk into one framework. Financial entities must run an ICT risk-management framework (Arts 5-15), manage and report major ICT-related incidents (Arts 17-23), test digital operational resilience including threat-led penetration testing (Arts 24-27) and manage ICT third-party risk with mandatory contractual provisions (Arts 28-30). Critical ICT third-party providers fall under a direct EU oversight regime.",
    inForceDate: "2025-01-17",
    sourceUrl: "https://eur-lex.europa.eu/eli/reg/2022/2554/oj",
    keyDates: [
      { date: "2023-01-16", label: "DORA enters into force" },
      { date: "2025-01-17", label: "DORA applies" },
    ],
    sortOrder: 9,
  },
  {
    key: "gpsr",
    name: "General Product Safety Regulation",
    shortName: "GPSR",
    fullTitle: "Regulation (EU) 2023/988 on general product safety",
    jurisdiction: "European Union",
    summary:
      "The safety net for consumer products not covered by sector-specific EU legislation. It is notable for explicitly recognising that cybersecurity risks and evolving, connected or AI-based functionalities can affect a product's safety (Art 6). Producers must carry out an internal risk analysis and hold technical documentation (Art 9), ensure traceability (Art 12), notify accidents (Art 20) and take corrective action including recalls (Arts 35-37).",
    inForceDate: "2024-12-13",
    sourceUrl: "https://eur-lex.europa.eu/eli/reg/2023/988/oj",
    keyDates: [
      { date: "2023-06-12", label: "GPSR enters into force" },
      { date: "2024-12-13", label: "GPSR applies" },
    ],
    sortOrder: 10,
  },
  {
    key: "data_act",
    name: "Data Act",
    shortName: "Data Act",
    fullTitle:
      "Regulation (EU) 2023/2854 on harmonised rules on fair access to and use of data",
    jurisdiction: "European Union",
    summary:
      "Governs access to and sharing of the data generated by connected products (IoT) and related services. Manufacturers must design products so that data is accessible by default (Art 3), let users access and share that data with third parties (Arts 4-5), protect trade secrets and apply technical protection measures (Art 11), guard against unlawful third-country access (Art 32) and enable switching between data-processing (cloud) services with interoperability safeguards (Arts 23-31).",
    inForceDate: "2025-09-12",
    sourceUrl: "https://eur-lex.europa.eu/eli/reg/2023/2854/oj",
    keyDates: [
      { date: "2024-01-11", label: "Data Act enters into force" },
      { date: "2025-09-12", label: "Data Act applies" },
      { date: "2026-09-12", label: "Access-by-design (Art 3) applies to new connected products" },
    ],
    sortOrder: 11,
  },
];

const themes: InsertConformityTheme[] = [
  { key: "secure_by_design", name: "Secure by Design & Default", description: "Building appropriate, risk-proportionate security into a product from the outset, including secure default configuration and minimised attack surface.", sortOrder: 1 },
  { key: "risk_management", name: "Risk Management", description: "Establishing and maintaining a process to identify, assess and treat security and safety risks throughout the product lifecycle.", sortOrder: 2 },
  { key: "vulnerability_handling", name: "Vulnerability Handling", description: "Identifying, testing for, remediating and disclosing vulnerabilities, including coordinated disclosure.", sortOrder: 3 },
  { key: "secure_update", name: "Secure Update Management", description: "Providing and securely distributing security updates and patches over the product's supported lifetime.", sortOrder: 4 },
  { key: "sbom_supply_chain", name: "SBOM & Supply Chain", description: "Identifying and managing components and third-party dependencies, including a software bill of materials.", sortOrder: 5 },
  { key: "access_control", name: "Access Control", description: "Identification, authentication and authorization controls that prevent unauthorised access to the product and its functions.", sortOrder: 6 },
  { key: "data_protection", name: "Data Protection & Integrity", description: "Protecting the confidentiality and integrity of stored, transmitted and processed data, commands and configuration.", sortOrder: 7 },
  { key: "logging_monitoring", name: "Logging & Monitoring", description: "Recording security-relevant activity and enabling detection of, and response to, security events.", sortOrder: 8 },
  { key: "incident_reporting", name: "Incident Reporting", description: "Notifying authorities and users of actively exploited vulnerabilities and severe or serious incidents within mandated timeframes.", sortOrder: 9 },
  { key: "technical_documentation", name: "Technical Documentation", description: "Compiling and maintaining the technical documentation / technical file that demonstrates conformity.", sortOrder: 10 },
  { key: "conformity_declaration", name: "Conformity Declaration", description: "Drawing up the EU Declaration of Conformity and applying the appropriate marking.", sortOrder: 11 },
  { key: "human_oversight", name: "Human Oversight & Transparency", description: "Ensuring systems are transparent to and can be effectively overseen and controlled by humans.", sortOrder: 12 },
  { key: "data_governance", name: "Data Governance", description: "Governing the quality, relevance and representativeness of data used to train, validate and operate systems.", sortOrder: 13 },
  { key: "resilience", name: "Resilience & Availability", description: "Maintaining availability of essential functions and resisting denial-of-service, manipulation and other disruptions.", sortOrder: 14 },
  { key: "post_market", name: "Post-market Monitoring", description: "Actively monitoring products in the field and feeding findings back into risk management over the support period.", sortOrder: 15 },
];

const productClasses: InsertProductClass[] = [
  // CRA
  { regulationKey: "cra", key: "default", name: "Default", description: "Products with digital elements not listed in Annex III or IV. The large majority of products; conformity via self-assessment.", riskLevel: "default", defaultRouteKey: "module_a", sortOrder: 1 },
  { regulationKey: "cra", key: "important_class_i", name: "Important — Class I", description: "Annex III Class I (e.g. password managers, network management systems, VPNs, routers, boot managers). Self-assessment permitted where harmonised standards are applied.", riskLevel: "important", defaultRouteKey: "module_a", sortOrder: 2 },
  { regulationKey: "cra", key: "important_class_ii", name: "Important — Class II", description: "Annex III Class II (e.g. firewalls, intrusion detection/prevention systems, hypervisors, tamper-resistant microprocessors). Third-party assessment required.", riskLevel: "important", defaultRouteKey: "module_b_c", sortOrder: 3 },
  { regulationKey: "cra", key: "critical", name: "Critical", description: "Annex IV critical products (e.g. hardware security modules, smart meter gateways, smartcards). May require a European cybersecurity certification.", riskLevel: "critical", defaultRouteKey: "eu_certification_scheme", sortOrder: 4 },
  // AI Act
  { regulationKey: "ai_act", key: "prohibited", name: "Prohibited", description: "Art 5 prohibited practices (e.g. social scoring, untargeted facial-image scraping). Not permitted on the market.", riskLevel: "unacceptable", defaultRouteKey: null, sortOrder: 1 },
  { regulationKey: "ai_act", key: "high_risk", name: "High-risk", description: "Annex I and Annex III high-risk AI systems. Subject to the full Arts 9-15 requirements, QMS and conformity assessment.", riskLevel: "high", defaultRouteKey: "annex_vi", sortOrder: 2 },
  { regulationKey: "ai_act", key: "limited_risk", name: "Limited-risk", description: "Systems subject only to transparency obligations (Art 50), e.g. chatbots and synthetic media.", riskLevel: "limited", defaultRouteKey: null, sortOrder: 3 },
  { regulationKey: "ai_act", key: "minimal_risk", name: "Minimal-risk", description: "AI systems with no mandatory obligations; voluntary codes of conduct encouraged.", riskLevel: "minimal", defaultRouteKey: null, sortOrder: 4 },
  { regulationKey: "ai_act", key: "gpai", name: "General-purpose AI", description: "General-purpose AI models, including those with systemic risk (Arts 51-55), with dedicated transparency and risk obligations.", riskLevel: "systemic", defaultRouteKey: null, sortOrder: 5 },
  // Machinery
  { regulationKey: "machinery", key: "standard", name: "Standard machinery", description: "Machinery not listed in Annex I. Conformity via the manufacturer's internal checks.", riskLevel: "standard", defaultRouteKey: "module_a", sortOrder: 1 },
  { regulationKey: "machinery", key: "annex_i_part_a", name: "Annex I Part A (high-risk)", description: "High-risk machinery categories for which third-party involvement is mandatory even where harmonised standards are applied.", riskLevel: "high", defaultRouteKey: "module_b_c", sortOrder: 2 },
  { regulationKey: "machinery", key: "annex_i_part_b", name: "Annex I Part B", description: "Listed categories where self-assessment is possible only if harmonised standards are fully applied; otherwise third-party assessment.", riskLevel: "elevated", defaultRouteKey: "module_a", sortOrder: 3 },
  // IEC 62443 (target security levels)
  { regulationKey: "iec_62443", key: "sl1", name: "Security Level 1", description: "Protection against casual or coincidental violation.", riskLevel: "SL 1", defaultRouteKey: "self_attestation", sortOrder: 1 },
  { regulationKey: "iec_62443", key: "sl2", name: "Security Level 2", description: "Protection against intentional violation using simple means with low resources and generic skills.", riskLevel: "SL 2", defaultRouteKey: "isasecure_csa", sortOrder: 2 },
  { regulationKey: "iec_62443", key: "sl3", name: "Security Level 3", description: "Protection against intentional violation using sophisticated means with moderate resources and IACS-specific skills.", riskLevel: "SL 3", defaultRouteKey: "isasecure_csa", sortOrder: 3 },
  { regulationKey: "iec_62443", key: "sl4", name: "Security Level 4", description: "Protection against intentional violation using sophisticated means with extended resources and IACS-specific skills.", riskLevel: "SL 4", defaultRouteKey: "isasecure_ssa", sortOrder: 4 },
  // NIS2 (entity categories)
  { regulationKey: "nis2", key: "essential", name: "Essential entity", description: "Large entities in Annex I high-criticality sectors (energy, transport, banking, water, health, digital infrastructure, public administration, space). Subject to proactive (ex-ante) supervision.", riskLevel: "essential", defaultRouteKey: "ex_ante_supervision", sortOrder: 1 },
  { regulationKey: "nis2", key: "important", name: "Important entity", description: "Medium-sized entities in Annex I sectors and entities in Annex II other critical sectors (postal, waste, chemicals, food, manufacturing, digital providers, research). Subject to ex-post supervision.", riskLevel: "important", defaultRouteKey: "ex_post_supervision", sortOrder: 2 },
  { regulationKey: "nis2", key: "out_of_scope", name: "Out of scope", description: "Micro and small entities not otherwise designated, and entities outside Annex I/II sectors. No direct NIS2 obligations, though supply-chain expectations may still flow down.", riskLevel: "n/a", defaultRouteKey: null, sortOrder: 3 },
];

const conformityRoutes: InsertConformityRoute[] = [
  // CRA
  { regulationKey: "cra", key: "module_a", name: "Module A — Internal control", description: "Self-assessment by the manufacturer; permitted for default and (with harmonised standards) important Class I products.", thirdPartyRequired: false, appliesToClasses: ["default", "important_class_i"], sortOrder: 1 },
  { regulationKey: "cra", key: "module_b_c", name: "Module B+C — EU-type examination", description: "EU-type examination by a notified body (Module B) followed by conformity to type (Module C).", thirdPartyRequired: true, appliesToClasses: ["important_class_i", "important_class_ii", "critical"], sortOrder: 2 },
  { regulationKey: "cra", key: "module_h", name: "Module H — Full quality assurance", description: "Conformity based on a full quality-assurance system assessed by a notified body.", thirdPartyRequired: true, appliesToClasses: ["important_class_i", "important_class_ii", "critical"], sortOrder: 3 },
  { regulationKey: "cra", key: "eu_certification_scheme", name: "European cybersecurity certification", description: "For critical products, conformity may require a European cybersecurity certification scheme at assurance level at least 'substantial'.", thirdPartyRequired: true, appliesToClasses: ["critical"], sortOrder: 4 },
  // AI Act
  { regulationKey: "ai_act", key: "annex_vi", name: "Annex VI — Internal control", description: "Conformity assessment based on internal control, available for most high-risk systems.", thirdPartyRequired: false, appliesToClasses: ["high_risk"], sortOrder: 1 },
  { regulationKey: "ai_act", key: "annex_vii", name: "Annex VII — Notified body", description: "Assessment of the quality management system and technical documentation by a notified body.", thirdPartyRequired: true, appliesToClasses: ["high_risk"], sortOrder: 2 },
  // Machinery
  { regulationKey: "machinery", key: "module_a", name: "Module A — Internal checks", description: "Conformity based on internal checks on the manufacture of machinery.", thirdPartyRequired: false, appliesToClasses: ["standard", "annex_i_part_b"], sortOrder: 1 },
  { regulationKey: "machinery", key: "module_b_c", name: "Module B+C — EU-type examination", description: "EU-type examination by a notified body followed by conformity to type.", thirdPartyRequired: true, appliesToClasses: ["annex_i_part_a"], sortOrder: 2 },
  { regulationKey: "machinery", key: "module_h", name: "Module H — Full quality assurance", description: "Conformity based on full quality assurance assessed by a notified body.", thirdPartyRequired: true, appliesToClasses: ["annex_i_part_a"], sortOrder: 3 },
  { regulationKey: "machinery", key: "module_g", name: "Module G — Unit verification", description: "Conformity based on unit verification by a notified body.", thirdPartyRequired: true, appliesToClasses: ["annex_i_part_a"], sortOrder: 4 },
  // IEC 62443
  { regulationKey: "iec_62443", key: "self_attestation", name: "Self-attestation", description: "Vendor self-attestation of conformity against the applicable 62443 requirements.", thirdPartyRequired: false, appliesToClasses: ["sl1"], sortOrder: 1 },
  { regulationKey: "iec_62443", key: "isasecure_sdla", name: "ISASecure SDLA", description: "Certification of the secure development lifecycle process against IEC 62443-4-1.", thirdPartyRequired: true, appliesToClasses: ["sl1", "sl2", "sl3", "sl4"], sortOrder: 2 },
  { regulationKey: "iec_62443", key: "isasecure_csa", name: "ISASecure CSA", description: "Component Security Assurance certification against IEC 62443-4-1 and 4-2.", thirdPartyRequired: true, appliesToClasses: ["sl2", "sl3"], sortOrder: 3 },
  { regulationKey: "iec_62443", key: "isasecure_ssa", name: "ISASecure SSA", description: "System Security Assurance certification against IEC 62443-3-3 and the lifecycle.", thirdPartyRequired: true, appliesToClasses: ["sl3", "sl4"], sortOrder: 4 },
  // NIS2 (supervisory regimes rather than product conformity modules)
  { regulationKey: "nis2", key: "registration", name: "Registration with the competent authority", description: "Both essential and important entities must register with the competent authority / CSIRT, providing contact and sector information within the deadlines set by national law.", thirdPartyRequired: false, appliesToClasses: ["essential", "important"], sortOrder: 1 },
  { regulationKey: "nis2", key: "ex_post_supervision", name: "Ex-post supervision", description: "Important entities are supervised reactively: competent authorities act (inspections, audits, requests for evidence) where there is indication of non-compliance or following an incident.", thirdPartyRequired: false, appliesToClasses: ["important"], sortOrder: 2 },
  { regulationKey: "nis2", key: "ex_ante_supervision", name: "Ex-ante (proactive) supervision", description: "Essential entities are supervised proactively, including on-site inspections, off-site supervision, regular and targeted security audits, and security scans carried out by or on behalf of the competent authority.", thirdPartyRequired: true, appliesToClasses: ["essential"], sortOrder: 3 },
];

type Req = {
  refCode: string;
  themeKey: string | null;
  title: string;
  description: string;
  obligationType: string;
  appliesTo: string[];
};

const cra: Req[] = [
  { refCode: "Annex I(1)", themeKey: "secure_by_design", title: "Appropriate level of cybersecurity based on risk", description: "Products with digital elements shall be designed, developed and produced to ensure an appropriate level of cybersecurity based on the risks.", obligationType: "product_requirement", appliesTo: ["manufacturer"] },
  { refCode: "Annex I(2)(a)", themeKey: "vulnerability_handling", title: "No known exploitable vulnerabilities on release", description: "Products shall be made available on the market without known exploitable vulnerabilities.", obligationType: "product_requirement", appliesTo: ["manufacturer"] },
  { refCode: "Annex I(2)(b)", themeKey: "secure_by_design", title: "Secure by default configuration", description: "Products shall be made available with a secure by default configuration, including the possibility to reset the product to its original state.", obligationType: "product_requirement", appliesTo: ["manufacturer"] },
  { refCode: "Annex I(2)(c)", themeKey: "secure_update", title: "Security updates", description: "Ensure vulnerabilities can be addressed through security updates, including, where applicable, automatic updates and user notification.", obligationType: "product_requirement", appliesTo: ["manufacturer"] },
  { refCode: "Annex I(2)(d)", themeKey: "access_control", title: "Protection from unauthorised access", description: "Protect against unauthorised access by appropriate control mechanisms, including authentication, identity and access management systems.", obligationType: "product_requirement", appliesTo: ["manufacturer"] },
  { refCode: "Annex I(2)(e)", themeKey: "data_protection", title: "Confidentiality of data", description: "Protect the confidentiality of stored, transmitted or processed data, by encrypting relevant data at rest or in transit by state-of-the-art mechanisms.", obligationType: "product_requirement", appliesTo: ["manufacturer"] },
  { refCode: "Annex I(2)(f)", themeKey: "data_protection", title: "Integrity of data and configuration", description: "Protect the integrity of stored, transmitted or processed data, commands, programs and configuration against unauthorised manipulation.", obligationType: "product_requirement", appliesTo: ["manufacturer"] },
  { refCode: "Annex I(2)(g)", themeKey: "data_protection", title: "Data minimisation", description: "Process only data, personal or other, that are adequate, relevant and limited to what is necessary in relation to the intended purpose of the product (data minimisation).", obligationType: "product_requirement", appliesTo: ["manufacturer"] },
  { refCode: "Annex I(2)(h)", themeKey: "resilience", title: "Availability of essential functions", description: "Protect the availability of essential and basic functions, including resilience against and mitigation of denial-of-service attacks.", obligationType: "product_requirement", appliesTo: ["manufacturer"] },
  { refCode: "Annex I(2)(i)", themeKey: "resilience", title: "Minimise negative impact on other services", description: "Minimise the negative impact by the product itself or connected devices on the availability of services provided by other devices or networks.", obligationType: "product_requirement", appliesTo: ["manufacturer"] },
  { refCode: "Annex I(2)(j)", themeKey: "secure_by_design", title: "Limit attack surfaces", description: "Be designed, developed and produced to limit attack surfaces, including external interfaces.", obligationType: "product_requirement", appliesTo: ["manufacturer"] },
  { refCode: "Annex I(2)(k)", themeKey: "secure_by_design", title: "Exploitation mitigation techniques", description: "Be designed, developed and produced to reduce the impact of an incident using appropriate exploitation mitigation mechanisms and techniques.", obligationType: "product_requirement", appliesTo: ["manufacturer"] },
  { refCode: "Annex I(2)(l)", themeKey: "logging_monitoring", title: "Security-relevant logging", description: "Provide security-related information by recording and monitoring relevant internal activity, including access to or modification of data, services or functions.", obligationType: "product_requirement", appliesTo: ["manufacturer"] },
  { refCode: "Annex I(2)(m)", themeKey: "data_protection", title: "Secure data deletion and transfer", description: "Provide the possibility for users to securely and easily remove on a permanent basis all data and settings and, where data can be transferred to other products or systems, ensure that this is done in a secure manner.", obligationType: "product_requirement", appliesTo: ["manufacturer"] },
  { refCode: "Annex I Part II(1)", themeKey: "sbom_supply_chain", title: "Identify and document components (SBOM)", description: "Identify and document vulnerabilities and components, including by drawing up a software bill of materials in a commonly used machine-readable format.", obligationType: "process", appliesTo: ["manufacturer"] },
  { refCode: "Annex I Part II(2)", themeKey: "vulnerability_handling", title: "Address vulnerabilities without delay", description: "In relation to the risks, address and remediate vulnerabilities without delay, including by providing security updates.", obligationType: "process", appliesTo: ["manufacturer"] },
  { refCode: "Annex I Part II(3)", themeKey: "vulnerability_handling", title: "Regular security testing", description: "Apply effective and regular tests and reviews of the security of the product with digital elements.", obligationType: "process", appliesTo: ["manufacturer"] },
  { refCode: "Annex I Part II(4)", themeKey: "vulnerability_handling", title: "Public disclosure of fixed vulnerabilities", description: "Once a security update has been made available, share and publicly disclose information about fixed vulnerabilities, including a description, information allowing the affected product to be identified, the impacts and severity, and clear and accessible information helping users to remediate; in duly justified cases publication may be delayed until users have had the possibility to apply the relevant patch.", obligationType: "process", appliesTo: ["manufacturer"] },
  { refCode: "Annex I Part II(5)", themeKey: "vulnerability_handling", title: "Coordinated vulnerability disclosure", description: "Put in place and enforce a policy on coordinated vulnerability disclosure.", obligationType: "process", appliesTo: ["manufacturer"] },
  { refCode: "Annex I Part II(6)", themeKey: "vulnerability_handling", title: "Contact address for vulnerability reporting", description: "Take measures to facilitate the sharing of information about potential vulnerabilities in the product and in third-party components it contains, including by providing a contact address for the reporting of vulnerabilities discovered in the product.", obligationType: "process", appliesTo: ["manufacturer"] },
  { refCode: "Annex I Part II(7)", themeKey: "secure_update", title: "Secure distribution of updates", description: "Ensure that mechanisms to securely distribute updates are in place to disseminate patches or updates in a timely manner.", obligationType: "process", appliesTo: ["manufacturer"] },
  { refCode: "Annex I Part II(8)", themeKey: "secure_update", title: "Free and timely security patches with advisories", description: "Ensure that, where security updates are available to address identified security issues, they are disseminated without delay and, unless otherwise agreed between manufacturer and business user, free of charge, accompanied by advisory messages providing relevant information, including on potential action to be taken.", obligationType: "process", appliesTo: ["manufacturer"] },
  { refCode: "Art 13", themeKey: "risk_management", title: "Cybersecurity risk assessment", description: "Undertake an assessment of the cybersecurity risks associated with the product and take the outcome into account during planning, design, development, production, delivery and maintenance.", obligationType: "process", appliesTo: ["manufacturer"] },
  { refCode: "Art 13(5)", themeKey: "sbom_supply_chain", title: "Due diligence on third-party components", description: "Exercise due diligence when integrating components sourced from third parties, including free and open-source components, so that they do not compromise the cybersecurity of the product with digital elements.", obligationType: "process", appliesTo: ["manufacturer"] },
  { refCode: "Art 13(6)", themeKey: "vulnerability_handling", title: "Notify the maker of a vulnerable component", description: "Upon identifying a vulnerability in a component, including an open-source component, report the vulnerability to the person or entity manufacturing or maintaining the component, address and remediate it, and where a modification is developed, share the relevant code or documentation with that person or entity.", obligationType: "process", appliesTo: ["manufacturer"] },
  { refCode: "Annex II", themeKey: "technical_documentation", title: "User information and instructions", description: "Provide users with the information and instructions set out in Annex II, including the manufacturer's contact details, the single point of contact for vulnerability reporting, the intended purpose and essential functionalities, the end date of the support period, how security updates are installed, and how the product can be securely commissioned, used and decommissioned. The generated \"User Information & Instructions (Annex II)\" document in the Documents stage compiles these items as an honest completeness checklist.", obligationType: "documentation", appliesTo: ["manufacturer"] },
  { refCode: "Annex VII", themeKey: "technical_documentation", title: "Technical documentation", description: "Draw up technical documentation containing all relevant data and details of the means used to ensure conformity, kept for at least ten years.", obligationType: "documentation", appliesTo: ["manufacturer"] },
  { refCode: "Art 14", themeKey: "incident_reporting", title: "Report exploited vulnerabilities and severe incidents", description: "Notify an actively exploited vulnerability or a severe incident: an early warning within 24 hours and a notification within 72 hours to the CSIRT and ENISA.", obligationType: "reporting", appliesTo: ["manufacturer"] },
  { refCode: "Annex V", themeKey: "conformity_declaration", title: "EU Declaration of Conformity", description: "Draw up an EU declaration of conformity stating that the essential requirements have been fulfilled, and affix the CE marking.", obligationType: "documentation", appliesTo: ["manufacturer"] },
  { refCode: "Art 13(8)", themeKey: "post_market", title: "Support period and updates over lifetime", description: "Ensure that vulnerabilities are handled effectively during a defined support period reflecting the expected product lifetime.", obligationType: "process", appliesTo: ["manufacturer"] },
  { refCode: "Art 13(13)", themeKey: "post_market", title: "Keep the technical documentation and EU DoC for ten years", description: "Keep the technical documentation and the EU declaration of conformity at the disposal of the market surveillance authorities for at least 10 years after the product has been placed on the market, or for the support period, whichever is longer.", obligationType: "documentation", appliesTo: ["manufacturer"] },
  { refCode: "Art 13(18)", themeKey: "post_market", title: "Keep the Annex II user information for ten years", description: "Keep the information and instructions to the user set out in Annex II at the disposal of users and market surveillance authorities — and, where provided online, accessible and available online — for at least 10 years after the product has been placed on the market, or for the support period, whichever is longer.", obligationType: "documentation", appliesTo: ["manufacturer"] },
  /**
   * Art. 23 binds every economic operator, not only the manufacturer. Art. 3(12)
   * defines that as the manufacturer, authorised representative, importer and
   * distributor. It is deliberately not extended to open-source stewards,
   * system integrators or operators: a steward's status as an economic operator
   * is genuinely contested, an integrator acquires manufacturer duties only via
   * the Art. 22 route, and an operator is a downstream user.
   */
  { refCode: "Art 23", themeKey: "sbom_supply_chain", title: "Identify who supplied you, and who you supplied", description: "On request, provide the market surveillance authorities with the name and address of any economic operator who has supplied you with a product with digital elements and, where available, of any economic operator you have supplied. You must be able to present that information for 10 years after you were supplied and for 10 years after you supplied.", obligationType: "process", appliesTo: ["manufacturer", "authorised_representative", "importer", "distributor"] },
];

/**
 * AI Act — Regulation (EU) 2024/1689. The original 12 rows predate the corpus
 * (Phase 0); 11.2 verified every row against docs/ai_act_statutory_corpus and
 * extended the set with the provider chapter (Arts 16(b)–22), the
 * importer/distributor duties (Arts 23–24), the deployer duties (Art 26 — the
 * operator role; Art 3(4) 'deployer'), registration (Art 49) and transparency
 * (Art 50). GPAI obligations (Arts 53/55) are deliberately NOT seeded: no
 * deployment of this system has declared a GPAI-provider scope, and rows
 * without a bearer would be speculative — add them when a customer's
 * declaration needs them.
 */
const aiAct: Req[] = [
  { refCode: "Art 9", themeKey: "risk_management", title: "Risk management system", description: "Establish, implement, document and maintain a risk management system running throughout the entire lifecycle of the high-risk AI system.", obligationType: "process", appliesTo: ["manufacturer"] },
  { refCode: "Art 10", themeKey: "data_governance", title: "Data and data governance", description: "Training, validation and testing data sets shall be subject to data governance and management practices appropriate to the intended purpose.", obligationType: "process", appliesTo: ["manufacturer"] },
  { refCode: "Art 11", themeKey: "technical_documentation", title: "Technical documentation (Annex IV)", description: "Draw up technical documentation before the system is placed on the market and keep it up to date, demonstrating conformity as set out in Annex IV.", obligationType: "documentation", appliesTo: ["manufacturer"] },
  { refCode: "Art 12", themeKey: "logging_monitoring", title: "Record-keeping", description: "High-risk AI systems shall technically allow for the automatic recording of events (logs) over the lifetime of the system, enabling the recording of events relevant for identifying risk situations, post-market monitoring and monitoring of operation.", obligationType: "product_requirement", appliesTo: ["manufacturer"] },
  { refCode: "Art 13", themeKey: "human_oversight", title: "Transparency and information to deployers", description: "Design and develop systems so that operation is sufficiently transparent to enable deployers to interpret output and use it appropriately; provide instructions for use.", obligationType: "documentation", appliesTo: ["manufacturer"] },
  { refCode: "Art 14", themeKey: "human_oversight", title: "Human oversight", description: "Design and develop high-risk AI systems so that they can be effectively overseen by natural persons during the period in which they are in use.", obligationType: "product_requirement", appliesTo: ["manufacturer"] },
  { refCode: "Art 15", themeKey: "resilience", title: "Accuracy, robustness and cybersecurity", description: "Design and develop systems to achieve appropriate levels of accuracy, robustness and cybersecurity, performing consistently throughout their lifecycle.", obligationType: "product_requirement", appliesTo: ["manufacturer"] },
  { refCode: "Art 15(5)", themeKey: "resilience", title: "Resilience against manipulation", description: "High-risk AI systems shall be resilient against attempts by unauthorised third parties to alter their use, outputs or performance by exploiting system vulnerabilities; technical solutions shall address AI-specific vulnerabilities including, where appropriate, measures against data poisoning, model poisoning, adversarial examples and confidentiality attacks.", obligationType: "product_requirement", appliesTo: ["manufacturer"] },
  { refCode: "Art 16(b)", themeKey: null, title: "Provider name and contact address", description: "Indicate on the high-risk AI system or, where that is not possible, on its packaging or accompanying documentation, the provider's name, registered trade name or trade mark and the address at which the provider can be contacted.", obligationType: "product_requirement", appliesTo: ["manufacturer"] },
  { refCode: "Art 17", themeKey: "risk_management", title: "Quality management system", description: "Providers shall put in place a quality management system that ensures compliance with the Regulation, documented in a systematic and orderly manner.", obligationType: "governance", appliesTo: ["manufacturer"] },
  { refCode: "Art 18", themeKey: "post_market", title: "Documentation keeping for ten years", description: "For 10 years after the high-risk AI system has been placed on the market or put into service, keep at the disposal of the national competent authorities the technical documentation, the quality-management-system documentation, notified-body change approvals and decisions where applicable, and the EU declaration of conformity.", obligationType: "documentation", appliesTo: ["manufacturer"] },
  { refCode: "Art 19", themeKey: "logging_monitoring", title: "Keep the automatically generated logs", description: "Keep the logs automatically generated by high-risk AI systems, to the extent they are under the provider's control, for a period appropriate to the intended purpose and of at least six months, unless Union or national law — in particular on personal-data protection — provides otherwise.", obligationType: "process", appliesTo: ["manufacturer"] },
  { refCode: "Art 20", themeKey: "post_market", title: "Corrective actions and duty of information", description: "Where a high-risk AI system placed on the market or put into service is or may be non-conforming, immediately take the necessary corrective actions to bring it into conformity, withdraw, disable or recall it, and inform the distributors and, where applicable, the deployers, authorised representative and importers; where the system presents a risk, immediately investigate the causes and inform the market surveillance authorities and any certifying notified body.", obligationType: "process", appliesTo: ["manufacturer"] },
  { refCode: "Art 21", themeKey: null, title: "Cooperation with competent authorities", description: "Upon a reasoned request, provide a competent authority with all the information and documentation necessary to demonstrate conformity with the Section 2 requirements, in a language it can easily understand, and give access to the automatically generated logs to the extent they are under the provider's control.", obligationType: "process", appliesTo: ["manufacturer"] },
  { refCode: "Art 22", themeKey: null, title: "Authorised representative for third-country providers", description: "Providers established in third countries shall, prior to making high-risk AI systems available on the Union market, appoint by written mandate an authorised representative established in the Union, empowered to verify the DoC and technical documentation, keep documentation at the authorities' disposal and cooperate with them; the representative shall terminate the mandate — informing the market surveillance authority — where it considers the provider is acting contrary to its obligations.", obligationType: "governance", appliesTo: ["manufacturer", "authorised_representative"] },
  { refCode: "Art 23", themeKey: null, title: "Importer verification before placing on the market", description: "Before placing a high-risk AI system on the market, verify that the conformity assessment was carried out, the technical documentation drawn up, the system bears the CE marking with its EU declaration of conformity and instructions, and an authorised representative is appointed where required; do not place a non-conforming or falsified system on the market; indicate importer contact details; keep a copy of the certificate, instructions and DoC for 10 years; provide information to and cooperate with the authorities.", obligationType: "process", appliesTo: ["importer"] },
  { refCode: "Art 24", themeKey: null, title: "Distributor verification before making available", description: "Before making a high-risk AI system available, verify that it bears the CE marking, is accompanied by a copy of the EU declaration of conformity and instructions for use, and that provider and importer complied with their marking and contact-information duties; do not make a non-conforming system available, ensure storage and transport do not jeopardise compliance, take or trigger corrective actions, and provide information to and cooperate with the authorities.", obligationType: "process", appliesTo: ["distributor"] },
  { refCode: "Art 26", themeKey: "human_oversight", title: "Deployer duties for high-risk AI systems", description: "Use high-risk AI systems in accordance with their instructions for use; assign human oversight to natural persons with the necessary competence, training, authority and support; ensure input data under the deployer's control is relevant and sufficiently representative; monitor operation and inform the provider or distributor and the market surveillance authority of risks and serious incidents; keep the automatically generated logs under the deployer's control for at least six months; inform workers' representatives and affected workers before use at the workplace; cooperate with the competent authorities.", obligationType: "process", appliesTo: ["operator"] },
  { refCode: "Art 47", themeKey: "conformity_declaration", title: "EU declaration of conformity", description: "Draw up a written, machine-readable, physical or electronically signed EU declaration of conformity for each high-risk AI system, keep it at the disposal of the national competent authorities for 10 years after placing on the market or putting into service, keep it up to date, and draw up a single declaration where other Union harmonisation legislation also requires one.", obligationType: "documentation", appliesTo: ["manufacturer"] },
  { refCode: "Art 49", themeKey: null, title: "Registration in the EU database", description: "Before placing on the market or putting into service a high-risk AI system listed in Annex III (except point 2 systems, registered at national level), the provider or its authorised representative shall register themselves and the system in the EU database; deployers that are public authorities or Union bodies shall likewise register themselves and the use of the system.", obligationType: "process", appliesTo: ["manufacturer", "operator"] },
  { refCode: "Art 50", themeKey: "human_oversight", title: "Transparency to natural persons", description: "Providers shall ensure AI systems intended to interact directly with natural persons inform those persons they are interacting with an AI system, and that synthetic audio, image, video or text outputs are marked machine-readably as artificially generated or manipulated; deployers of emotion-recognition or biometric-categorisation systems shall inform the persons exposed, and deployers of deep-fake content shall disclose that it was artificially generated or manipulated.", obligationType: "process", appliesTo: ["manufacturer", "operator"] },
  { refCode: "Art 72", themeKey: "post_market", title: "Post-market monitoring", description: "Establish and document a post-market monitoring system that actively collects and reviews experience gained from the use of high-risk AI systems.", obligationType: "process", appliesTo: ["manufacturer"] },
  { refCode: "Art 73", themeKey: "incident_reporting", title: "Reporting of serious incidents", description: "Report any serious incident to the market surveillance authorities of the Member States where it occurred, immediately after establishing a causal link (or its reasonable likelihood) and in any event not later than 15 days after awareness; not later than 2 days for a widespread infringement or a serious incident as defined in Art 3(49)(b); not later than 10 days in the event of the death of a person. An incomplete initial report may precede the complete one; the provider shall then investigate, perform a risk assessment and take corrective action.", obligationType: "reporting", appliesTo: ["manufacturer"] },
];

/**
 * Machinery Regulation (EU) 2023/1230. The original 8 rows predate the corpus;
 * 11.3 verified them against docs/machinery_statutory_corpus (+ the committed
 * OJ source for Annex III section numbering, which the flattened annex blocks
 * do not carry) and found THREE MISNUMBERED rows: the software-protection and
 * intervention-evidence duties live in section 1.1.9, not 1.2.1(a)/(b), and
 * the modification-restraint duty is 1.2.1(d); the real 1.2.1(a)-(c) say
 * something else. The DoC row cited Annex II — the indicative list of SAFETY
 * COMPONENTS — where the statute puts the DoC in Art 21 / Annex V Part A, and
 * "technical file" is 2006/42/EC language: 2023/1230 says technical
 * documentation (Annex IV Part A). The partly-completed-machinery chain
 * (Arts 11/14/16, Annex XI) is deliberately not seeded — no deployment models
 * that product category yet; add it with a bearer, not before.
 */
const machinery: Req[] = [
  { refCode: "Annex III 1.1.9", themeKey: "secure_by_design", title: "Protection against corruption", description: "Machinery shall be designed and constructed so that connection of another device, via any feature of the connected device or a remote device, does not lead to a hazardous situation; hardware components transmitting signal or data relevant for connection or access to safety-critical software shall be adequately protected against accidental or intentional corruption; software and data critical for compliance shall be identified and so protected; the machinery shall identify the installed software necessary for safe operation, provide that information accessibly at all times, and collect evidence of legitimate or illegitimate interventions in that hardware, software or its configuration.", obligationType: "product_requirement", appliesTo: ["manufacturer"] },
  { refCode: "Annex III 1.2.1", themeKey: "resilience", title: "Safety and reliability of control systems", description: "Control systems shall be designed and constructed to prevent hazardous situations from arising, withstanding — where appropriate to the circumstances and the risks — the intended operating stresses and intended and unintended external influences, including reasonably foreseeable malicious attempts from third parties leading to a hazardous situation; hardware faults, logic errors and reasonably foreseeable human errors shall not lead to hazardous situations.", obligationType: "product_requirement", appliesTo: ["manufacturer"] },
  { refCode: "Annex III 1.2.1(d)", themeKey: "secure_update", title: "Safety-function limits and modification restraint", description: "The limits of the safety functions shall be established as part of the manufacturer's risk assessment, and no modifications to the settings or rules generated by the machinery or by operators — including during a learning phase — are allowed where such modifications could lead to hazardous situations.", obligationType: "product_requirement", appliesTo: ["manufacturer"] },
  { refCode: "Annex III 1.2.1(f)", themeKey: "logging_monitoring", title: "Tracing log of interventions and safety-software versions", description: "The tracing log of data generated in relation to an intervention and of the versions of safety software uploaded after placing on the market or putting into service shall be enabled for five years after such upload, exclusively to demonstrate conformity with Annex III further to a reasoned request from a competent national authority.", obligationType: "product_requirement", appliesTo: ["manufacturer"] },
  { refCode: "Annex III (general)", themeKey: "risk_management", title: "Risk assessment", description: "The manufacturer shall ensure that a risk assessment is carried out to determine the essential health and safety requirements which apply, and the machinery shall then be designed and constructed taking into account its results, through the iterative process of risk assessment and risk reduction.", obligationType: "process", appliesTo: ["manufacturer"] },
  { refCode: "Annex IV", themeKey: "technical_documentation", title: "Technical documentation", description: "Draw up the technical documentation set out in Annex IV Part A before placing on the market or putting into service, demonstrating conformity with the applicable essential health and safety requirements; where relevant, the source code or programming logic included in it shall be made available to competent authorities upon reasoned request.", obligationType: "documentation", appliesTo: ["manufacturer"] },
  { refCode: "Art 21", themeKey: "conformity_declaration", title: "EU declaration of conformity", description: "Draw up the EU declaration of conformity (model in Annex V Part A) stating that fulfilment of the applicable Annex III requirements has been demonstrated, keep it continuously updated, draw up a single declaration where several Union acts require one, and affix the CE marking; by drawing it up the manufacturer assumes responsibility for compliance.", obligationType: "documentation", appliesTo: ["manufacturer"] },
  { refCode: "Art 10(3)", themeKey: "post_market", title: "Keep the technical documentation and EU DoC for ten years", description: "Keep the technical documentation and the EU declaration of conformity at the disposal of the market surveillance authorities for at least 10 years after placing on the market or putting into service.", obligationType: "documentation", appliesTo: ["manufacturer"] },
  { refCode: "Art 10(4)", themeKey: "post_market", title: "Series production remains in conformity", description: "Ensure procedures are in place so that series production remains in conformity, taking adequate account of changes in the production process, the design or characteristics of the machinery, and changes in harmonised standards, technical specifications or common specifications.", obligationType: "process", appliesTo: ["manufacturer"] },
  { refCode: "Art 10(6)", themeKey: null, title: "Manufacturer name and contact details", description: "Indicate on the machinery (or its packaging or an accompanying document) the manufacturer's name, registered trade name or trade mark, postal address and website, e-mail or other digital contact, indicating a single contact point in a language easily understood by users and market surveillance authorities.", obligationType: "product_requirement", appliesTo: ["manufacturer"] },
  { refCode: "Art 10(7)", themeKey: "technical_documentation", title: "Instructions for use and Annex III information", description: "Ensure the machinery is accompanied by the instructions for use and the information set out in Annex III, clearly describing the product model; instructions may be provided in digital format, in which case the manufacturer shall mark how to access them and provide them free of charge, and paper instructions remain available on request at the time of purchase.", obligationType: "documentation", appliesTo: ["manufacturer"] },
  { refCode: "Art 10(9)", themeKey: "post_market", title: "Corrective actions and informing authorities", description: "Where machinery placed on the market or put into service is or may be non-conforming, immediately take the corrective actions necessary to bring it into conformity, withdraw or recall it; where it presents a risk, immediately inform the competent national authorities of the Member States where it was made available, giving details of the non-compliance and corrective actions taken.", obligationType: "process", appliesTo: ["manufacturer"] },
  { refCode: "Art 10(10)", themeKey: null, title: "Provide information and cooperate with authorities", description: "Further to a reasoned request from a competent national authority, provide all information and documentation necessary to demonstrate conformity, in a language easily understood by that authority, and cooperate on any action to eliminate the risks posed by the machinery.", obligationType: "process", appliesTo: ["manufacturer"] },
  { refCode: "Art 12", themeKey: null, title: "Authorised representative's mandate", description: "A manufacturer may appoint an authorised representative by written mandate — which cannot cover the Art 10(1)/11(1) design duties or drawing up the technical documentation — empowered at least to keep the technical documentation and EU declaration of conformity at the authorities' disposal, provide information and documentation on reasoned request, and cooperate on any action to eliminate risks.", obligationType: "governance", appliesTo: ["manufacturer", "authorised_representative"] },
  { refCode: "Art 13(1)", themeKey: null, title: "Place only compliant machinery on the market", description: "Importers shall place only compliant machinery or related products on the market, first ensuring the manufacturer carried out the appropriate conformity assessment, drew up the Annex IV Part A technical documentation, affixed the CE marking, provided the required accompanying documents and met the marking and contact-information duties; where a product presents a risk, inform the manufacturer and the market surveillance authorities.", obligationType: "process", appliesTo: ["importer"] },
  { refCode: "Art 13(7)", themeKey: "post_market", title: "Corrective actions and informing authorities", description: "Where machinery placed on the market is or may be non-conforming, immediately take the corrective actions necessary to bring it into conformity, withdraw or recall it; where it presents a risk, immediately inform the competent national authorities of the Member States where it was made available.", obligationType: "process", appliesTo: ["importer"] },
  { refCode: "Art 13(8)", themeKey: "post_market", title: "Keep the EU DoC for ten years; documentation available", description: "For at least 10 years after placing on the market, keep a copy of the EU declaration of conformity at the disposal of the market surveillance authorities and ensure the Annex IV Part A technical documentation can be made available to them on request.", obligationType: "documentation", appliesTo: ["importer"] },
  { refCode: "Art 15(2)", themeKey: null, title: "Verify before making available", description: "Before making machinery or a related product available, verify that it bears the CE marking, is accompanied by the EU declaration of conformity and the instructions for use and Annex III information, and that manufacturer and importer met their marking and contact-information duties; do not make a non-conforming product available and, where it presents a risk, inform the manufacturer or importer and the market surveillance authorities.", obligationType: "process", appliesTo: ["distributor"] },
  { refCode: "Art 15(5)", themeKey: "post_market", title: "Corrective actions and informing authorities", description: "Where machinery made available on the market is or may be non-conforming, make sure the corrective actions necessary to bring it into conformity, withdraw or recall it are taken; where it presents a risk, immediately inform the competent national authorities of the Member States where it was made available.", obligationType: "process", appliesTo: ["distributor"] },
  { refCode: "Art 19", themeKey: "sbom_supply_chain", title: "Identify who supplied you, and who you supplied", description: "On request, identify to the market surveillance authorities any economic operator who has supplied you with a product within the scope of the Regulation and any economic operator to whom you have supplied one, retaining that information for at least 10 years after supplying or being supplied.", obligationType: "process", appliesTo: ["manufacturer", "authorised_representative", "importer", "distributor"] },
];

/**
 * RED — Directive 2014/53/EU, seeded from docs/red_statutory_corpus (11.1).
 *
 * Scope follows the machinery precedent: the CYBER essential requirements
 * (Art 3(3)(d)/(e)/(f), activated for the designated categories by Delegated
 * Regulation (EU) 2022/30, applicable from 1 August 2025) plus the horizontal
 * economic-operator duties. The non-cyber essential requirements (Art 3(1)
 * health/safety and EMC, Art 3(2) spectrum) are deliberately not seeded — this
 * application is a cybersecurity system of record, not a full RED register.
 *
 * Art 15 binds every economic operator: Art 2(16) defines those as the
 * manufacturer, authorised representative, importer and distributor — the same
 * four as CRA Art 23, and unlike the CRA the steward question does not arise.
 */
const red: Req[] = [
  /**
   * The Art 3(3)(d)/(e)/(f) categories are designated by Delegated Regulation
   * (EU) 2022/30 (as amended by 2023/2444: applies from 1 August 2025), which
   * is REPEALED with effect from 11 December 2027 by Delegated Regulation
   * (EU) 2026/339 because the CRA's Annex I includes all elements of these
   * requirements. Corpus: docs/red_delegated_2022_30 (13.1).
   */
  { refCode: "Art 3(3)(d)", themeKey: "resilience", title: "Protection of the network", description: "Radio equipment that can communicate itself over the internet, whether directly or via any other equipment ('internet-connected radio equipment' — the category designated by Delegated Regulation (EU) 2022/30, applying from 1 Aug 2025 until its repeal on 11 Dec 2027 in favour of the CRA), shall be so constructed that it does not harm the network or its functioning nor misuse network resources, thereby causing an unacceptable degradation of service.", obligationType: "product_requirement", appliesTo: ["manufacturer"] },
  { refCode: "Art 3(3)(e)", themeKey: "data_protection", title: "Safeguards for personal data and privacy", description: "Radio equipment capable of processing personal data, traffic data or location data — internet-connected equipment, equipment designed or intended exclusively for childcare, toys under Directive 2009/48/EC, and wearables, per Delegated Regulation (EU) 2022/30 — shall incorporate safeguards to ensure that the personal data and privacy of the user and of the subscriber are protected.", obligationType: "product_requirement", appliesTo: ["manufacturer"] },
  { refCode: "Art 3(3)(f)", themeKey: "access_control", title: "Protection from fraud", description: "Internet-connected radio equipment enabling the holder or user to transfer money, monetary value or virtual currency (the category designated by Delegated Regulation (EU) 2022/30) shall support certain features ensuring protection from fraud.", obligationType: "product_requirement", appliesTo: ["manufacturer"] },
  { refCode: "Art 10(1)", themeKey: null, title: "Design and manufacture per the essential requirements", description: "When placing radio equipment on the market, manufacturers shall ensure that it has been designed and manufactured in accordance with the essential requirements set out in Art 3.", obligationType: "process", appliesTo: ["manufacturer"] },
  { refCode: "Art 10(3)", themeKey: null, title: "Carry out the conformity assessment", description: "Draw up the technical documentation referred to in Art 21 and carry out the relevant conformity assessment procedure referred to in Art 17 (internal production control, EU-type examination followed by conformity to type, or full quality assurance), or have it carried out; where compliance has been demonstrated, draw up an EU declaration of conformity and affix the CE marking.", obligationType: "process", appliesTo: ["manufacturer"] },
  { refCode: "Art 10(4)", themeKey: "post_market", title: "Keep the technical documentation and EU DoC for ten years", description: "Keep the technical documentation and the EU declaration of conformity for 10 years after the radio equipment has been placed on the market.", obligationType: "documentation", appliesTo: ["manufacturer"] },
  { refCode: "Art 10(5)", themeKey: "post_market", title: "Series production remains in conformity", description: "Ensure procedures are in place for series production to remain in conformity, taking account of changes in design, characteristics and harmonised standards; where appropriate to the risks, sample-test equipment made available on the market, investigate and, if necessary, keep a register of complaints, non-conforming equipment and recalls, and keep distributors informed of such monitoring.", obligationType: "process", appliesTo: ["manufacturer"] },
  { refCode: "Art 10(6)", themeKey: null, title: "Identification element on the equipment", description: "Ensure radio equipment placed on the market bears a type, batch or serial number or other element allowing its identification or, where its size or nature does not allow it, that the information is on the packaging or in an accompanying document.", obligationType: "product_requirement", appliesTo: ["manufacturer"] },
  { refCode: "Art 10(7)", themeKey: null, title: "Manufacturer name and contact address", description: "Indicate on the radio equipment (or its packaging or an accompanying document) the manufacturer's name, registered trade name or trade mark and a single postal contact point, in a language easily understood by end-users and market surveillance authorities.", obligationType: "product_requirement", appliesTo: ["manufacturer"] },
  { refCode: "Art 10(8)", themeKey: "technical_documentation", title: "Instructions and safety information", description: "Ensure the equipment is accompanied by instructions and safety information in a language easily understood by consumers and other end-users, including where applicable a description of accessories and components (including software) that allow intended operation and, for intentionally emitting equipment, the frequency bands and maximum radio-frequency power transmitted.", obligationType: "documentation", appliesTo: ["manufacturer"] },
  { refCode: "Art 10(9)", themeKey: "conformity_declaration", title: "Copy of the EU DoC with each item", description: "Ensure each item of radio equipment is accompanied by a copy of the EU declaration of conformity or a simplified EU declaration of conformity containing the exact internet address where the full text can be obtained.", obligationType: "documentation", appliesTo: ["manufacturer"] },
  { refCode: "Art 10(10)", themeKey: null, title: "Information on restrictions of use", description: "In cases of restrictions on putting into service or requirements for authorisation of use, information on the packaging shall allow identification of the Member States or geographical area concerned, completed in the instructions accompanying the equipment.", obligationType: "documentation", appliesTo: ["manufacturer"] },
  { refCode: "Art 10(11)", themeKey: "post_market", title: "Corrective measures and informing authorities", description: "Where equipment placed on the market is or may be non-conforming, immediately take the corrective measures necessary to bring it into conformity, withdraw or recall it; where it presents a risk, immediately inform the competent national authorities of the Member States where it was made available, giving details of the non-compliance, corrective measures taken and their results.", obligationType: "process", appliesTo: ["manufacturer"] },
  { refCode: "Art 10(12)", themeKey: null, title: "Provide information and cooperate with authorities", description: "Further to a reasoned request from a competent national authority, provide all information and documentation necessary to demonstrate conformity, in a language easily understood by that authority, and cooperate on any action to eliminate the risks posed by the equipment.", obligationType: "process", appliesTo: ["manufacturer"] },
  { refCode: "Art 18", themeKey: "conformity_declaration", title: "EU declaration of conformity", description: "Draw up the EU declaration of conformity (model structure in Annex VI; simplified form in Annex VII) stating that fulfilment of the essential requirements has been demonstrated, keep it continuously updated, and draw up a single declaration where more than one Union act requires one. By drawing it up the manufacturer assumes responsibility for compliance.", obligationType: "documentation", appliesTo: ["manufacturer"] },
  { refCode: "Art 21", themeKey: "technical_documentation", title: "Technical documentation", description: "Draw up the technical documentation before the equipment is placed on the market and keep it continuously updated; it shall contain all relevant data on the means used to ensure compliance with the essential requirements and at least the elements set out in Annex V.", obligationType: "documentation", appliesTo: ["manufacturer"] },
  { refCode: "Art 12(1)", themeKey: null, title: "Place only compliant radio equipment on the market", description: "Importers shall place only compliant radio equipment on the market, first ensuring the manufacturer has carried out the appropriate conformity assessment, drawn up the technical documentation, affixed the CE marking, provided the required information and documents, and met the identification and contact requirements; where equipment is not in conformity it shall not be placed on the market, and where it presents a risk the importer shall inform the manufacturer and the market surveillance authorities.", obligationType: "process", appliesTo: ["importer"] },
  { refCode: "Art 12(7)", themeKey: "post_market", title: "Corrective measures and informing authorities", description: "Where equipment placed on the market is or may be non-conforming, immediately take the corrective measures necessary to bring it into conformity, withdraw or recall it; where it presents a risk, immediately inform the competent national authorities of the Member States where it was made available, giving details of the non-compliance and corrective measures taken.", obligationType: "process", appliesTo: ["importer"] },
  { refCode: "Art 12(8)", themeKey: "post_market", title: "Keep the EU DoC for ten years; documentation available", description: "For 10 years after the equipment has been placed on the market, keep a copy of the EU declaration of conformity at the disposal of the market surveillance authorities and ensure the technical documentation can be made available to them on request.", obligationType: "documentation", appliesTo: ["importer"] },
  { refCode: "Art 13(2)", themeKey: null, title: "Verify before making available", description: "Before making radio equipment available, verify that it bears the CE marking, is accompanied by the documents required by the Directive and by instructions and safety information in a language easily understood in the Member State concerned, and that the manufacturer and the importer have met their identification and information duties; where equipment is not in conformity do not make it available, and where it presents a risk inform the manufacturer or importer and the market surveillance authorities.", obligationType: "process", appliesTo: ["distributor"] },
  { refCode: "Art 13(4)", themeKey: "post_market", title: "Corrective measures and informing authorities", description: "Where equipment made available on the market is or may be non-conforming, make sure the corrective measures necessary to bring it into conformity, withdraw or recall it are taken; where it presents a risk, immediately inform the competent national authorities of the Member States where it was made available, giving details of the non-compliance and corrective measures taken.", obligationType: "process", appliesTo: ["distributor"] },
  { refCode: "Art 15", themeKey: "sbom_supply_chain", title: "Identify who supplied you, and who you supplied", description: "On request, identify to the market surveillance authorities any economic operator who has supplied you with radio equipment and any economic operator to whom you have supplied radio equipment, and be able to present that information for 10 years after having been supplied and 10 years after having supplied.", obligationType: "process", appliesTo: ["manufacturer", "authorised_representative", "importer", "distributor"] },
];

const iec: Req[] = [
  { refCode: "4-1 SM", themeKey: "risk_management", title: "Security management", description: "Establish a security management process governing the development lifecycle, including roles, responsibilities and a defined scope of the process.", obligationType: "process", appliesTo: ["manufacturer"] },
  { refCode: "4-1 SM-9", themeKey: "sbom_supply_chain", title: "Third-party component management", description: "Identify, assess and manage security risks of third-party and open-source components used in the product, maintaining a record of components.", obligationType: "process", appliesTo: ["manufacturer"] },
  { refCode: "4-1 SR", themeKey: "secure_by_design", title: "Specification of security requirements", description: "Document and maintain security requirements for the product, derived from its intended environment and threat model.", obligationType: "process", appliesTo: ["manufacturer"] },
  { refCode: "4-1 SD", themeKey: "secure_by_design", title: "Secure by design", description: "Apply secure design principles, including defence in depth and threat modelling, throughout product design.", obligationType: "process", appliesTo: ["manufacturer"] },
  { refCode: "4-1 SVV", themeKey: "vulnerability_handling", title: "Security verification and validation", description: "Perform security verification and validation testing, including threat mitigation, vulnerability and penetration testing, before release.", obligationType: "process", appliesTo: ["manufacturer"] },
  { refCode: "4-1 DM", themeKey: "vulnerability_handling", title: "Management of security-related issues", description: "Establish a process to receive, track, assess and remediate security-related issues (defects and vulnerabilities) in the product.", obligationType: "process", appliesTo: ["manufacturer"] },
  { refCode: "4-1 SUM", themeKey: "secure_update", title: "Security update management", description: "Establish a process to develop, test, qualify and securely deliver security updates to product users in a timely manner.", obligationType: "process", appliesTo: ["manufacturer"] },
  { refCode: "4-1 SG", themeKey: "technical_documentation", title: "Security guidelines", description: "Provide documentation (security guidelines) enabling the secure integration, configuration, operation, maintenance and decommissioning of the product.", obligationType: "documentation", appliesTo: ["manufacturer"] },
  { refCode: "4-2 FR1", themeKey: "access_control", title: "Identification and authentication control", description: "Identify and authenticate all users (humans, software processes and devices) before allowing access to the component.", obligationType: "product_requirement", appliesTo: ["manufacturer"] },
  { refCode: "4-2 FR2", themeKey: "access_control", title: "Use control", description: "Enforce assigned privileges to restrict use of the component to authorised actions (authorization).", obligationType: "product_requirement", appliesTo: ["manufacturer"] },
  { refCode: "4-2 FR3", themeKey: "data_protection", title: "System integrity", description: "Protect the integrity of the component against unauthorised manipulation, including of firmware, software and information.", obligationType: "product_requirement", appliesTo: ["manufacturer"] },
  { refCode: "4-2 FR4", themeKey: "data_protection", title: "Data confidentiality", description: "Protect the confidentiality of information at rest and in transit, including through cryptographic protection.", obligationType: "product_requirement", appliesTo: ["manufacturer"] },
  { refCode: "4-2 FR6", themeKey: "logging_monitoring", title: "Timely response to events", description: "Provide audit logging and the capability to respond to security violations by notifying the proper authority and reporting evidence.", obligationType: "product_requirement", appliesTo: ["manufacturer"] },
  { refCode: "4-2 FR7", themeKey: "resilience", title: "Resource availability", description: "Ensure availability of the component against the degradation or denial of essential services, including under denial-of-service conditions.", obligationType: "product_requirement", appliesTo: ["manufacturer"] },
  // 62443-3-3 — system security requirements (SRs), organised under the seven foundational requirements at the system/IACS level.
  { refCode: "3-3 SR 1.1", themeKey: "access_control", title: "Human user identification and authentication", description: "The control system shall identify and authenticate all human users, and enforce authentication on all interfaces, before allowing access to the system.", obligationType: "product_requirement", appliesTo: ["system_integrator"] },
  { refCode: "3-3 SR 1.2", themeKey: "access_control", title: "Software process and device identification", description: "The control system shall identify and authenticate all software processes and devices before allowing them to access the system.", obligationType: "product_requirement", appliesTo: ["system_integrator"] },
  { refCode: "3-3 SR 2.1", themeKey: "access_control", title: "Authorization enforcement", description: "The control system shall enforce authorizations assigned to all users and processes, restricting access to the minimum necessary for the assigned role (least privilege).", obligationType: "product_requirement", appliesTo: ["system_integrator"] },
  { refCode: "3-3 SR 2.5", themeKey: "access_control", title: "Session lock and termination", description: "The control system shall lock or terminate a session after a configurable period of inactivity or on demand, preventing further access until re-authentication.", obligationType: "product_requirement", appliesTo: ["system_integrator"] },
  { refCode: "3-3 SR 3.1", themeKey: "data_protection", title: "Communication integrity", description: "The control system shall protect the integrity of transmitted information, detecting unauthorised changes to communications during transmission.", obligationType: "product_requirement", appliesTo: ["system_integrator"] },
  { refCode: "3-3 SR 3.2", themeKey: "data_protection", title: "Malicious code protection", description: "The control system shall provide protection against, and detection of, malicious code at entry and exit points and on affected devices.", obligationType: "product_requirement", appliesTo: ["system_integrator"] },
  { refCode: "3-3 SR 4.1", themeKey: "data_protection", title: "Information confidentiality", description: "The control system shall protect the confidentiality of information at rest and in transit for which explicit read authorization is required, using cryptographic mechanisms where appropriate.", obligationType: "product_requirement", appliesTo: ["system_integrator"] },
  { refCode: "3-3 SR 5.1", themeKey: "secure_by_design", title: "Network segmentation", description: "The control system shall logically segment control networks from non-control networks and partition the system into zones and conduits according to the risk assessment.", obligationType: "product_requirement", appliesTo: ["system_integrator"] },
  { refCode: "3-3 SR 5.2", themeKey: "secure_by_design", title: "Zone boundary protection", description: "The control system shall monitor and control communications at zone boundaries to enforce the defined conduits, denying network traffic by default and allowing it by exception.", obligationType: "product_requirement", appliesTo: ["system_integrator"] },
  { refCode: "3-3 SR 6.1", themeKey: "logging_monitoring", title: "Audit log accessibility", description: "The control system shall provide the capability to access audit logs on a read-only basis to authorised personnel and tools.", obligationType: "product_requirement", appliesTo: ["system_integrator"] },
  { refCode: "3-3 SR 6.2", themeKey: "logging_monitoring", title: "Continuous monitoring", description: "The control system shall provide the capability to continuously monitor security-relevant events using commonly accepted tools and mechanisms.", obligationType: "product_requirement", appliesTo: ["system_integrator"] },
  { refCode: "3-3 SR 7.1", themeKey: "resilience", title: "Denial-of-service protection", description: "The control system shall maintain essential functions when operating in a degraded mode as the result of a denial-of-service event.", obligationType: "product_requirement", appliesTo: ["system_integrator"] },
  { refCode: "3-3 SR 7.2", themeKey: "resilience", title: "Resource management and recovery", description: "The control system shall limit the use of resources by security functions to prevent resource exhaustion, and support backup and recovery to a known secure state after a disruption.", obligationType: "product_requirement", appliesTo: ["system_integrator"] },
];

const nis2: Req[] = [
  { refCode: "Art 20", themeKey: "risk_management", title: "Governance and management accountability", description: "The management bodies of essential and important entities shall approve the cybersecurity risk-management measures, oversee their implementation, and follow training; they can be held liable for infringements.", obligationType: "governance", appliesTo: ["operator"] },
  { refCode: "Art 21(2)(a)", themeKey: "risk_management", title: "Risk analysis and information system security policies", description: "Entities shall adopt policies on risk analysis and information system security as the foundation of an all-hazards, risk-based approach to protecting network and information systems.", obligationType: "process", appliesTo: ["operator"] },
  { refCode: "Art 21(2)(b)", themeKey: "incident_reporting", title: "Incident handling", description: "Entities shall implement incident-handling measures covering prevention, detection, analysis, containment, response and recovery.", obligationType: "process", appliesTo: ["operator"] },
  { refCode: "Art 21(2)(c)", themeKey: "resilience", title: "Business continuity and crisis management", description: "Entities shall ensure business continuity through backup management, disaster recovery, and crisis-management arrangements.", obligationType: "process", appliesTo: ["operator"] },
  { refCode: "Art 21(2)(d)", themeKey: "sbom_supply_chain", title: "Supply chain security", description: "Entities shall address security in their supply chain, including security-related aspects of the relationships between each entity and its direct suppliers or service providers.", obligationType: "process", appliesTo: ["operator"] },
  { refCode: "Art 21(2)(e)", themeKey: "vulnerability_handling", title: "Security in acquisition, development and maintenance", description: "Entities shall ensure security in the acquisition, development and maintenance of network and information systems, including vulnerability handling and disclosure.", obligationType: "process", appliesTo: ["operator"] },
  { refCode: "Art 21(2)(f)", themeKey: "risk_management", title: "Assessing effectiveness of measures", description: "Entities shall adopt policies and procedures to assess the effectiveness of the cybersecurity risk-management measures they have put in place.", obligationType: "process", appliesTo: ["operator"] },
  { refCode: "Art 21(2)(g)", themeKey: "risk_management", title: "Basic cyber hygiene and training", description: "Entities shall apply basic cyber-hygiene practices and provide cybersecurity training to staff.", obligationType: "process", appliesTo: ["operator"] },
  { refCode: "Art 21(2)(h)", themeKey: "data_protection", title: "Cryptography and encryption", description: "Entities shall adopt policies and procedures on the use of cryptography and, where appropriate, encryption.", obligationType: "product_requirement", appliesTo: ["operator"] },
  { refCode: "Art 21(2)(i)", themeKey: "access_control", title: "Access control and asset management", description: "Entities shall implement human-resources security, access-control policies and asset management appropriate to the risk.", obligationType: "process", appliesTo: ["operator"] },
  { refCode: "Art 21(2)(j)", themeKey: "access_control", title: "Multi-factor authentication and secured communications", description: "Entities shall use multi-factor or continuous authentication, secured voice/video/text communications, and secured emergency communication systems where appropriate.", obligationType: "product_requirement", appliesTo: ["operator"] },
  { refCode: "Art 23", themeKey: "incident_reporting", title: "Incident reporting obligations", description: "Entities shall notify significant incidents to the CSIRT or competent authority: an early warning within 24 hours, an incident notification within 72 hours, and a final report within one month.", obligationType: "reporting", appliesTo: ["operator"] },
];

function buildRequirements(): InsertRequirement[] {
  const out: InsertRequirement[] = [];
  const push = (regulationKey: string, list: Req[]) => {
    list.forEach((r, i) => {
      out.push({
        regulationKey,
        themeKey: r.themeKey,
        refCode: r.refCode,
        title: r.title,
        description: r.description,
        obligationType: r.obligationType,
        appliesTo: r.appliesTo,
        sortOrder: i + 1,
      });
    });
  };
  push("cra", cra);
  push("ai_act", aiAct);
  push("machinery", machinery);
  push("red", red);
  push("iec_62443", iec);
  push("nis2", nis2);
  return out;
}

// [sourceReg, sourceRef, targetReg, targetRef, relationship, note]
const mappingTuples: [string, string, string, string, string, string][] = [
  // secure_by_design
  ["cra", "Annex I(1)", "iec_62443", "4-1 SD", "equivalent", "Both mandate designing in security proportionate to the assessed risk."],
  ["cra", "Annex I(1)", "ai_act", "Art 15", "overlaps", "The AI Act folds cybersecurity into the accuracy/robustness obligation for high-risk AI."],
  ["iec_62443", "4-1 SR", "cra", "Annex I(1)", "supports", "Documented security requirements provide evidence for the CRA secure-design obligation."],
  ["cra", "Annex I(2)(b)", "iec_62443", "4-1 SD", "overlaps", "Secure-by-default configuration is part of the 62443 secure-design practice."],
  ["machinery", "Annex III 1.1.9", "cra", "Annex I(1)", "overlaps", "Machinery protection against corruption parallels CRA secure design for safety-relevant software."],
  // vulnerability_handling
  ["cra", "Annex I Part II(2)", "iec_62443", "4-1 DM", "equivalent", "Remediation without delay aligns with 62443 management of security-related issues."],
  ["cra", "Annex I Part II(3)", "iec_62443", "4-1 SVV", "equivalent", "Regular security testing maps to 62443 verification and validation."],
  ["cra", "Annex I(2)(a)", "iec_62443", "4-1 DM", "supports", "Delivering without known exploitable vulnerabilities depends on effective defect management."],
  ["cra", "Annex I Part II(4)", "iec_62443", "4-1 DM", "overlaps", "Public disclosure of fixed vulnerabilities is part of the 62443 security-issue management practice."],
  ["cra", "Annex I Part II(6)", "iec_62443", "4-1 DM", "supports", "A published reporting contact feeds the 62443 process for receiving security-related issues."],
  ["cra", "Art 13(6)", "iec_62443", "4-1 SM-9", "overlaps", "Notifying component makers of vulnerabilities is part of managing third-party component risk."],
  // secure_update
  ["cra", "Annex I(2)(c)", "iec_62443", "4-1 SUM", "equivalent", "The CRA update capability maps to 62443 security update management."],
  ["cra", "Annex I Part II(7)", "iec_62443", "4-1 SUM", "overlaps", "Secure distribution of updates is covered by the SUM practice."],
  ["cra", "Annex I Part II(8)", "iec_62443", "4-1 SUM", "overlaps", "Free, timely patch dissemination with advisories is covered by the 62443 security update management practice."],
  ["machinery", "Annex III 1.2.1(d)", "cra", "Annex I(2)(c)", "supports", "Machinery modifications to safety settings and rules must never create hazards; the CRA requires the secure update mechanism itself."],
  ["cra", "Annex I(2)(j)", "iec_62443", "4-1 SD", "overlaps", "Limiting attack surfaces is a core secure-design activity (attack-surface reduction, defence in depth)."],
  ["cra", "Annex I(2)(k)", "iec_62443", "4-1 SD", "overlaps", "Exploitation-mitigation techniques are applied through the 62443 secure-design practice."],
  // sbom_supply_chain
  ["cra", "Annex I Part II(1)", "iec_62443", "4-1 SM-9", "equivalent", "SBOM / component identification aligns with 62443 third-party component management."],
  ["cra", "Art 13(5)", "iec_62443", "4-1 SM-9", "equivalent", "Due diligence on third-party components aligns with 62443 third-party component management."],
  ["nis2", "Art 21(2)(d)", "cra", "Art 13(5)", "overlaps", "NIS2 supply-chain security overlaps with CRA due diligence on third-party components."],
  // access_control
  ["cra", "Annex I(2)(d)", "iec_62443", "4-2 FR1", "equivalent", "The authentication requirement maps to FR1 identification and authentication control."],
  ["cra", "Annex I(2)(d)", "iec_62443", "4-2 FR2", "overlaps", "Access protection is also enforced through FR2 use control (authorization)."],
  ["machinery", "Annex III 1.1.9", "cra", "Annex I(2)(f)", "overlaps", "Protecting safety-critical software and data against accidental or intentional corruption overlaps with the CRA integrity requirement for data, programs and configuration."],
  // data_protection
  ["cra", "Annex I(2)(e)", "iec_62443", "4-2 FR4", "equivalent", "Confidentiality / encryption maps to FR4 data confidentiality."],
  ["cra", "Annex I(2)(f)", "iec_62443", "4-2 FR3", "equivalent", "Data and command integrity maps to FR3 system integrity."],
  // logging_monitoring
  ["cra", "Annex I(2)(l)", "iec_62443", "4-2 FR6", "equivalent", "Activity logging maps to FR6 timely response to events."],
  ["cra", "Annex I(2)(l)", "ai_act", "Art 12", "overlaps", "AI Act automatic record-keeping overlaps with the CRA logging requirement."],
  ["machinery", "Annex III 1.2.1(f)", "cra", "Annex I(2)(l)", "supports", "The five-year tracing log of interventions and safety-software versions supports the CRA security-relevant logging requirement."],
  // resilience
  ["cra", "Annex I(2)(h)", "iec_62443", "4-2 FR7", "equivalent", "Availability / DoS resilience maps to FR7 resource availability."],
  ["cra", "Annex I(2)(i)", "iec_62443", "4-2 FR7", "overlaps", "Limiting negative impact on other services relates to FR7 resource availability and resource-use limits."],
  ["ai_act", "Art 15", "cra", "Annex I(2)(h)", "overlaps", "AI robustness overlaps with the CRA availability and resilience requirement."],
  ["ai_act", "Art 15(5)", "iec_62443", "4-2 FR3", "overlaps", "Resilience against manipulation relates to system integrity protection."],
  ["machinery", "Annex III 1.2.1", "cra", "Annex I(2)(h)", "supports", "Control-system reliability supports CRA resilience for safety functions."],
  // risk_management
  ["cra", "Art 13", "ai_act", "Art 9", "overlaps", "Both require a documented, lifecycle-long risk management process."],
  ["ai_act", "Art 9", "iec_62443", "4-1 SM", "overlaps", "AI risk management aligns with the 62443 security management process."],
  ["machinery", "Annex III (general)", "cra", "Art 13", "overlaps", "The machinery risk assessment overlaps with the CRA cybersecurity risk assessment for digital elements."],
  // technical_documentation
  ["cra", "Annex VII", "ai_act", "Art 11", "equivalent", "Technical documentation content aligns (CRA Annex VII / AI Act Annex IV)."],
  ["cra", "Annex VII", "machinery", "Annex IV", "equivalent", "The CRA technical documentation aligns with the machinery technical documentation (Annex IV Part A)."],
  ["iec_62443", "4-1 SG", "cra", "Annex VII", "supports", "62443 security guidelines feed the CRA technical documentation."],
  ["cra", "Annex II", "iec_62443", "4-1 SG", "overlaps", "CRA user information and instructions overlap with 62443 security guidelines for secure integration, operation and decommissioning."],
  ["cra", "Annex II", "ai_act", "Art 13", "overlaps", "Both require clear user-facing information and instructions for use accompanying the product/system."],
  // conformity_declaration
  ["cra", "Annex V", "ai_act", "Art 47", "equivalent", "Both require a written EU Declaration of Conformity."],
  ["cra", "Annex V", "machinery", "Art 21", "equivalent", "The CRA DoC aligns with the machinery EU declaration of conformity (Art 21, Annex V Part A model)."],
  // incident_reporting
  ["cra", "Art 14", "ai_act", "Art 73", "overlaps", "CRA exploited-vulnerability/incident reporting overlaps with AI serious-incident reporting."],
  // post_market
  ["ai_act", "Art 72", "cra", "Art 13(8)", "overlaps", "AI post-market monitoring overlaps with CRA support-period vulnerability handling."],
  // IEC 62443-3-3 system requirements to component (4-2) and CRA
  ["iec_62443", "3-3 SR 1.1", "iec_62443", "4-2 FR1", "equivalent", "System-level human identification/authentication mirrors the FR1 component requirement."],
  ["iec_62443", "3-3 SR 1.1", "cra", "Annex I(2)(d)", "overlaps", "System authentication supports the CRA protection-from-unauthorised-access requirement."],
  ["iec_62443", "3-3 SR 2.1", "iec_62443", "4-2 FR2", "equivalent", "System authorization enforcement mirrors the FR2 use-control component requirement."],
  ["iec_62443", "3-3 SR 3.1", "iec_62443", "4-2 FR3", "overlaps", "Communication integrity at system level relates to FR3 component system integrity."],
  ["iec_62443", "3-3 SR 4.1", "iec_62443", "4-2 FR4", "equivalent", "System information confidentiality mirrors the FR4 component requirement."],
  ["iec_62443", "3-3 SR 4.1", "cra", "Annex I(2)(e)", "overlaps", "System encryption supports the CRA confidentiality-of-data requirement."],
  ["iec_62443", "3-3 SR 5.1", "cra", "Annex I(1)", "supports", "Zone/conduit segmentation is a secure-design control supporting the CRA risk-based security obligation."],
  ["iec_62443", "3-3 SR 6.1", "iec_62443", "4-2 FR6", "equivalent", "System audit-log accessibility mirrors the FR6 timely-response component requirement."],
  ["iec_62443", "3-3 SR 6.1", "cra", "Annex I(2)(l)", "overlaps", "System audit logging supports the CRA security-relevant logging requirement."],
  ["iec_62443", "3-3 SR 7.1", "iec_62443", "4-2 FR7", "equivalent", "System DoS protection mirrors the FR7 resource-availability component requirement."],
  ["iec_62443", "3-3 SR 7.1", "cra", "Annex I(2)(h)", "overlaps", "System DoS resilience supports the CRA availability-of-essential-functions requirement."],
  // NIS2 (operator obligations) to product/standard obligations
  ["nis2", "Art 20", "ai_act", "Art 17", "overlaps", "Management accountability for security aligns with the AI Act quality-management-system obligation."],
  ["nis2", "Art 20", "iec_62443", "4-1 SM", "overlaps", "NIS2 governance overlaps with the 62443 security-management process."],
  ["nis2", "Art 21(2)(a)", "cra", "Art 13", "overlaps", "NIS2 risk analysis overlaps with the CRA cybersecurity risk assessment."],
  ["nis2", "Art 21(2)(a)", "ai_act", "Art 9", "overlaps", "NIS2 risk analysis overlaps with the AI Act risk-management system."],
  ["nis2", "Art 21(2)(c)", "cra", "Annex I(2)(h)", "overlaps", "Business continuity and backup overlap with the CRA availability/resilience requirement."],
  ["nis2", "Art 21(2)(d)", "cra", "Annex I Part II(1)", "overlaps", "NIS2 supply-chain security overlaps with CRA component identification (SBOM)."],
  ["nis2", "Art 21(2)(e)", "cra", "Annex I Part II(3)", "overlaps", "Security in development/maintenance overlaps with CRA regular security testing."],
  ["nis2", "Art 21(2)(e)", "cra", "Annex I Part II(5)", "overlaps", "NIS2 vulnerability handling and disclosure overlaps with the CRA coordinated-disclosure requirement."],
  ["nis2", "Art 21(2)(e)", "iec_62443", "4-1 SVV", "supports", "62443 verification and validation supports the NIS2 secure-development obligation."],
  ["nis2", "Art 21(2)(h)", "cra", "Annex I(2)(e)", "equivalent", "NIS2 cryptography/encryption aligns with the CRA confidentiality-of-data requirement."],
  ["nis2", "Art 21(2)(h)", "iec_62443", "3-3 SR 4.1", "overlaps", "NIS2 encryption overlaps with 62443 system information confidentiality."],
  ["nis2", "Art 21(2)(i)", "cra", "Annex I(2)(d)", "overlaps", "NIS2 access control overlaps with the CRA protection-from-unauthorised-access requirement."],
  ["nis2", "Art 21(2)(i)", "iec_62443", "3-3 SR 2.1", "supports", "62443 authorization enforcement supports the NIS2 access-control obligation."],
  ["nis2", "Art 21(2)(j)", "iec_62443", "3-3 SR 1.1", "overlaps", "NIS2 multi-factor authentication overlaps with 62443 system identification and authentication."],
  ["nis2", "Art 23", "cra", "Art 14", "overlaps", "NIS2 incident reporting overlaps with CRA exploited-vulnerability/incident reporting."],
  ["nis2", "Art 23", "ai_act", "Art 73", "overlaps", "NIS2 incident reporting overlaps with AI Act serious-incident reporting."],
  // RED (Directive 2014/53/EU) cyber requirements and horizontal duties
  ["red", "Art 3(3)(d)", "cra", "Annex I(2)(i)", "overlaps", "Both protect networks and other services from harm by the product — RED against network harm and resource misuse, the CRA against impact on the availability of services of other devices or networks."],
  ["red", "Art 3(3)(e)", "cra", "Annex I(2)(e)", "overlaps", "Both require protection of personal data the product handles — RED privacy safeguards for user and subscriber, the CRA confidentiality of stored, transmitted and processed data."],
  ["red", "Art 3(3)(f)", "cra", "Annex I(2)(d)", "overlaps", "Fraud-protection features rest on the authentication and access-control mechanisms the CRA requires."],
  ["red", "Art 21", "cra", "Annex VII", "equivalent", "Both require technical documentation demonstrating conformity, drawn up before placing on the market."],
  ["red", "Art 18", "cra", "Annex V", "equivalent", "Both require a written EU Declaration of Conformity."],
  ["red", "Art 15", "cra", "Art 23", "equivalent", "The identical 10-year supplier/customer traceability duty on all four economic operators."],
  ["red", "Art 10(4)", "cra", "Art 13(13)", "overlaps", "Both require keeping the technical documentation and EU DoC for at least 10 years; the CRA extends this to the support period where longer."],
  // AI Act provider-chapter duties added in 11.2
  ["ai_act", "Art 18", "cra", "Art 13(13)", "overlaps", "Both require keeping conformity documentation, including the EU DoC, for 10 years after placing on the market."],
  ["ai_act", "Art 20", "red", "Art 10(11)", "overlaps", "Both require immediate corrective action for a non-conforming product and informing the competent authorities where it presents a risk."],
  ["ai_act", "Art 19", "cra", "Annex I(2)(l)", "overlaps", "Both concern security-relevant logs — the CRA requires the product to record them, the AI Act requires the provider to retain the automatically generated ones."],
  // Machinery economic-operator chapter added in 11.3
  ["machinery", "Art 19", "cra", "Art 23", "equivalent", "The identical 10-year supplier/customer traceability duty on all four economic operators."],
];

function buildMappings(): InsertRequirementMapping[] {
  return mappingTuples.map(([sr, sref, tr, tref, rel, note]) => ({
    sourceRegulationKey: sr,
    sourceRefCode: sref,
    targetRegulationKey: tr,
    targetRefCode: tref,
    relationship: rel,
    note,
  }));
}

export async function seedConformity(): Promise<void> {
  const requirements = buildRequirements();
  const mappings = buildMappings();

  // Validate mapping endpoints resolve to seeded requirements before writing.
  const known = new Set(requirements.map((r) => `${r.regulationKey}::${r.refCode}`));
  for (const m of mappings) {
    const s = `${m.sourceRegulationKey}::${m.sourceRefCode}`;
    const t = `${m.targetRegulationKey}::${m.targetRefCode}`;
    if (!known.has(s)) throw new Error(`Mapping source not found: ${s}`);
    if (!known.has(t)) throw new Error(`Mapping target not found: ${t}`);
  }

  // Idempotent and atomic: clear + repopulate in one transaction so a mid-run
  // failure never leaves the conformity corpus partially populated.
  await db.transaction(async (tx) => {
    // No FKs, so delete order is not significant.
    await tx.delete(requirementMappingsTable);
    await tx.delete(requirementsTable);
    await tx.delete(conformityRoutesTable);
    await tx.delete(productClassesTable);
    await tx.delete(conformityThemesTable);
    await tx.delete(regulationsTable);

    await tx.insert(regulationsTable).values(regulations);
    await tx.insert(conformityThemesTable).values(themes);
    await tx.insert(productClassesTable).values(productClasses);
    await tx.insert(conformityRoutesTable).values(conformityRoutes);
    await tx.insert(requirementsTable).values(requirements);
    await tx.insert(requirementMappingsTable).values(mappings);
  });

  log(
    `Seeded conformity engine: ${regulations.length} regulations, ${themes.length} themes, ${productClasses.length} product classes, ${conformityRoutes.length} routes, ${requirements.length} requirements, ${mappings.length} mappings.`,
  );
}
