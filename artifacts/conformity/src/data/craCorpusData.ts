export const recitalsData = {
  regulation: "Regulation (EU) 2024/2847",
  shortTitle: "EU Cyber Resilience Act (CRA)",
  officialJournalReference: "OJ L, 2024/2847, 20.11.2024",
  entryIntoForce: "2024-12-10",
  generalApplicationDate: "2027-12-11",
  earlyReportingApplicationDate: "2026-09-11",
  totalRecitals: 128,
  recitals: [
    {
      number: 1,
      title: "Internal Market Fragmentation & Cybersecurity Deficits",
      text: "Cybersecurity threats have a strong cross-border dimension. The increasing integration of digital elements into physical and virtual products creates vulnerabilities that can be exploited across borders, leading to severe economic and social disruption.",
      relatedArticles: [1, 2, 3],
    },
    {
      number: 2,
      title: "Scope & Need for Harmonised Regulatory Framework",
      text: "In order to ensure the proper functioning of the internal market and a high level of cybersecurity for all products with digital elements placed on the Union market, it is necessary to establish comprehensive, harmonised cybersecurity rules for such products.",
      relatedArticles: [1, 2, 4],
    },
    {
      number: 18,
      title: "Treatment of Software Components and Free and Open Source Software",
      text: "Software and data components, including libraries and operating systems, integrated into products with digital elements are within scope. However, free and open-source software developed or supplied outside the course of a commercial activity is excluded from the direct scope, while commercial integration requires supply chain due diligence.",
      relatedArticles: [2, 10, 18],
      tags: ["SBOM", "OpenSource", "SupplyChain"],
    },
    {
      number: 34,
      title: "Spare Parts & Maintenance for Pre-2027 Equipment (Crucial SI Exemption)",
      text: "Spare parts exclusively intended to replace identical parts in products with digital elements placed on the market before the date of application of this Regulation should not be considered as a new placement on the market. Consequently, such spare parts are not required to comply with the essential requirements or conformity assessment procedures laid down in this Regulation, provided they do not alter the performance or intended purpose of the original product.",
      relatedArticles: [2, 19, 21, 69],
      tags: ["SpareParts", "Grandfathering", "SystemIntegrator", "Maintenance"],
    },
    {
      number: 51,
      title: "Substantial Modification Criteria & Manufacturer Designation",
      text: "Where a product with digital elements is subject to a substantial modification that affects its compliance with the essential cybersecurity requirements or alters the intended purpose for which it was assessed, the person carrying out that modification should be considered a manufacturer under Article 20.",
      relatedArticles: [20, 21],
      tags: ["SubstantialModification", "Article21", "Liability"],
    },
    {
      number: 68,
      title: "24-Hour Early Warning Vulnerability Notification Duty",
      text: "To enable swift mitigation of widespread cyber threats, manufacturers must notify actively exploited vulnerabilities and severe security incidents to CSIRTs and ENISA within 24 hours of becoming aware, followed by a detailed incident report within 72 hours.",
      relatedArticles: [14],
      tags: ["PSIRT", "VulnerabilityReporting", "ENISA", "CSIRT"],
    },
    {
      number: 75,
      title: "Role of Software Bill of Materials (SBOM) in Vulnerability Tracking",
      text: "Manufacturers should draw up and maintain a software bill of materials (SBOM) identifying all top-level and transitive software components, allowing rapid vulnerability triage and automated asset correlation when new CVEs are published.",
      relatedArticles: [10, 13, 24],
      tags: ["SBOM", "CycloneDX", "SPDX", "VEX"],
    },
    {
      number: 102,
      title: "Conformity Assessment Modules & Notified Body Oversight",
      text: "For products presenting higher cybersecurity risk profiles categorized as Important Class I, Important Class II, or Critical, third-party conformity assessment bodies (Notified Bodies) must independently inspect technical files and verify security architecture under Annex VI.",
      relatedArticles: [24, 32, 35],
      tags: ["NotifiedBody", "CAB", "ConformityAssessment"],
    },
    {
      number: 115,
      title: "Administrative Fines & Proportionality",
      text: "Administrative fines up to EUR 15,000,000 or 2.5% of total worldwide annual turnover should be applied effectively and dissuasively for non-compliance with essential requirements, with proportionate adjustments for SMEs and non-profit organizations.",
      relatedArticles: [61],
      tags: ["Penalties", "Fines", "Enforcement"],
    },
    {
      number: 125,
      title: "Staggered Entry into Application and Grandfathering Timeline",
      text: "To allow economic operators, notified bodies, and market surveillance authorities sufficient time to adapt, the Regulation applies 36 months after entry into force (11 December 2027), except for the vulnerability notification obligations under Article 14 which apply 21 months after entry into force (11 September 2026).",
      relatedArticles: [69, 71],
      tags: ["Timeline", "ApplicationDate", "Grandfathering"],
    },
  ],
};

export const articlesData = {
  regulation: "Regulation (EU) 2024/2847",
  shortTitle: "EU Cyber Resilience Act (CRA)",
  chaptersCount: 7,
  totalArticles: 71,
  chapters: [
    {
      chapterNumber: 1,
      chapterTitle: "General Provisions",
      articlesRange: "Articles 1–9",
      articles: [
        {
          articleNumber: 1,
          title: "Subject Matter",
          paragraphs: [
            {
              paragraphNumber: 1,
              text: "This Regulation lays down rules for the placing on the market of products with digital elements to ensure the cybersecurity of such products; essential requirements for the design, development and production of products with digital elements; obligations of economic operators; rules on market surveillance and enforcement; and rules on the notification of conformity assessment bodies.",
            },
          ],
          legalCommentary:
            "Establishes horizontal, direct Union-wide applicability across all physical hardware and standalone software containing digital communication or logic elements.",
        },
        {
          articleNumber: 2,
          title: "Scope",
          paragraphs: [
            {
              paragraphNumber: 1,
              text: "This Regulation applies to products with digital elements made available on the market, the intended purpose or reasonably foreseeable use of which includes a direct or indirect logical or physical data connection to a device or network.",
            },
            {
              paragraphNumber: 2,
              text: "This Regulation does not apply to products with digital elements to which other Union acts apply where those acts achieve the same or higher level of cybersecurity, including Regulation (EU) 2017/745 (Medical Devices), Regulation (EU) 2017/746 (In Vitro Diagnostics), Regulation (EU) 2018/1139 (Civil Aviation), and Regulation (EU) 2019/2144 (Motor Vehicles).",
            },
            {
              paragraphNumber: 3,
              text: "Free and open-source software developed or supplied outside the course of a commercial activity is excluded from the scope of this Regulation.",
            },
          ],
          legalCommentary:
            "Critical boundary definition. OT networks, industrial switches, PLCs, HMIs, and SCADA software are squarely within scope. Non-commercial open source is excluded, but commercial redistribution or embedded inclusion triggers manufacturer due diligence.",
        },
        {
          articleNumber: 3,
          title: "Definitions",
          paragraphs: [
            {
              paragraphNumber: 1,
              text: "For the purposes of this Regulation: 'product with digital elements' means any software or hardware product and its remote data processing solutions, including software or hardware components being placed on the market separately; 'manufacturer' means any natural or legal person who develops or manufactures products with digital elements or has products with digital elements designed, developed or manufactured, and markets them under its name or trademark; 'substantial modification' means a change to the product with digital elements following its placing on the market which affects the compliance of the product with the essential cybersecurity requirements or results in a modification of the intended purpose.",
            },
          ],
          legalCommentary:
            "Crucial definitions for System Integrators: Substantial Modification determines whether an SI becomes legally deemed a Manufacturer under Article 20.",
        },
      ],
    },
    {
      chapterNumber: 2,
      chapterTitle: "Obligations of Economic Operators",
      articlesRange: "Articles 10–23",
      articles: [
        {
          articleNumber: 10,
          title: "Obligations of Manufacturers (Design, Lifecycle & Free Patches)",
          paragraphs: [
            {
              paragraphNumber: 1,
              text: "Manufacturers shall ensure that products with digital elements are designed, developed and produced in accordance with the essential cybersecurity requirements set out in Part I of Annex I.",
            },
            {
              paragraphNumber: 2,
              text: "Manufacturers shall carry out a cybersecurity risk assessment and take the results into account during the design, development, production, delivery and maintenance phases.",
            },
            {
              paragraphNumber: 6,
              text: "Manufacturers shall provide security updates to address vulnerabilities free of charge for the expected product lifetime or a minimum period of five years from placing on the market.",
            },
          ],
          legalCommentary:
            "Mandates Security-by-Design (Annex I Part I) and free security patch delivery for the expected support lifetime (minimum 5 years).",
        },
        {
          articleNumber: 13,
          title: "Obligations of Manufacturers regarding Information and Instructions to the User",
          paragraphs: [
            {
              paragraphNumber: 1,
              text: "Manufacturers shall ensure that products with digital elements are accompanied by the information and instructions to the user set out in Annex II, in clear and understandable language, including the end date of the support period and instructions on how to install security updates.",
            },
          ],
          legalCommentary:
            "Requires transparent publishing of the support lifecycle end date and secure installation guides.",
        },
        {
          articleNumber: 14,
          title: "Reporting Obligations of Manufacturers (24-Hour CSIRT Notification)",
          paragraphs: [
            {
              paragraphNumber: 1,
              text: "A manufacturer shall notify any actively exploited vulnerability contained in the product with digital elements that it becomes aware of to the CSIRT designated as coordinator and to ENISA within 24 hours of becoming aware of the actively exploited vulnerability.",
            },
            {
              paragraphNumber: 2,
              text: "The manufacturer shall submit a final report within 72 hours, detailing the root cause, remediation, and mitigation measures.",
            },
          ],
          legalCommentary:
            "Applies early on 11 September 2026! 15 months ahead of the general CRA application date. Covers all active products in the field.",
        },
        {
          articleNumber: 18,
          title: "Obligations of Importers",
          paragraphs: [
            {
              paragraphNumber: 1,
              text: "Importers shall place on the market only products with digital elements that comply with the essential cybersecurity requirements set out in Annex I.",
            },
            {
              paragraphNumber: 2,
              text: "Before placing a product on the market, importers shall ensure that the appropriate conformity assessment procedure has been carried out by the manufacturer and that the product bears the CE marking.",
            },
          ],
          legalCommentary:
            "Importers act as the first EU border gatekeeper. Non-compliant hardware without CE marking cannot enter EU distribution.",
        },
        {
          articleNumber: 19,
          title: "Obligations of Distributors & Duty to Refrain",
          paragraphs: [
            {
              paragraphNumber: 1,
              text: "When making a product with digital elements available on the market, distributors shall act with due care in relation to the requirements of this Regulation.",
            },
            {
              paragraphNumber: 2,
              text: "Where a distributor considers or has reason to believe that a product is not in conformity with the essential requirements set out in Annex I, the distributor shall NOT make the product available on the market (Duty to Refrain) until it has been brought into conformity.",
            },
          ],
          legalCommentary:
            "Core statutory duty for System Integrators and Distributors (Axians, Actemium). Mandatory legal duty to halt distribution of EOS / unpatchable hardware lacking CE or DoC.",
        },
        {
          articleNumber: 20,
          title: "Cases in Which Obligations of Manufacturers Apply to Other Economic Operators",
          paragraphs: [
            {
              paragraphNumber: 1,
              text: "An importer or distributor shall be considered a manufacturer for the purposes of this Regulation and shall be subject to all obligations of the manufacturer under Article 10, where that importer or distributor places a product on the market under its own name or trademark or carries out a substantial modification.",
            },
          ],
          legalCommentary:
            "The statutory trigger that transfers full €15M manufacturer liabilities onto SIs if they make substantial modifications.",
        },
        {
          articleNumber: 21,
          title: "Substantial Modification Due Diligence & Exemption Boundaries",
          paragraphs: [
            {
              paragraphNumber: 1,
              text: "A person who carries out a modification to a product with digital elements that affects its compliance with essential cybersecurity requirements or alters its intended purpose shall be subject to the obligations of a manufacturer.",
            },
            {
              paragraphNumber: 2,
              text: "Modifications performed exclusively with original manufacturer-certified spare parts and vendor-signed firmware updates to maintain operational capability within the original design parameters shall NOT constitute a substantial modification (Recital 34).",
            },
          ],
          legalCommentary:
            "Governs the Article 21 Wizard. SIs remain exempt from manufacturer status if they perform identical spare replacements under Recital 34.",
        },
      ],
    },
    {
      chapterNumber: 3,
      chapterTitle: "Conformity of Products with Digital Elements",
      articlesRange: "Articles 24–34",
      articles: [
        {
          articleNumber: 24,
          title: "Classification of Products with Digital Elements (Important & Critical Classes)",
          paragraphs: [
            {
              paragraphNumber: 1,
              text: "Products with digital elements shall be classified into Default, Important Class I (Annex III), Important Class II (Annex III), or Critical (Annex IV) based on their core cybersecurity functionality and system criticality.",
            },
          ],
          legalCommentary:
            "Important Class I includes managed switches, routers, and password managers. Important Class II includes industrial firewalls, PLCs, and hypervisors. Critical includes hardware tamper-proof chips.",
        },
        {
          articleNumber: 32,
          title: "Conformity Assessment Procedures",
          paragraphs: [
            {
              paragraphNumber: 1,
              text: "For default products, the manufacturer may use Module A (Internal Control). For Important Class I, harmonised standards or third-party assessment is required. For Important Class II and Critical, mandatory third-party assessment by a Notified Body (Module H or B+C) is required.",
            },
          ],
          legalCommentary:
            "Determines the assessment pathway and whether a Notified Body must be engaged.",
        },
      ],
    },
    {
      chapterNumber: 5,
      chapterTitle: "Market Surveillance & EU Enforcement",
      articlesRange: "Articles 52–63",
      articles: [
        {
          articleNumber: 61,
          title: "Penalties and Administrative Fines",
          paragraphs: [
            {
              paragraphNumber: 1,
              text: "Non-compliance with essential cybersecurity requirements in Annex I or obligations in Articles 10 and 11 shall be subject to administrative fines of up to EUR 15,000,000 or 2.5% of total worldwide annual turnover for the preceding financial year, whichever is higher.",
            },
            {
              paragraphNumber: 2,
              text: "Non-compliance with other obligations under this Regulation shall be subject to administrative fines of up to EUR 10,000,000 or 2.0% of total worldwide annual turnover.",
            },
          ],
          legalCommentary:
            "Statutory fine exposure calculated dynamically across plant turnover in the Partner Scope Cockpit.",
        },
      ],
    },
    {
      chapterNumber: 7,
      chapterTitle: "Confidentiality and Final Provisions",
      articlesRange: "Articles 68–71",
      articles: [
        {
          articleNumber: 69,
          title: "Transitional Provisions & Grandfathering",
          paragraphs: [
            {
              paragraphNumber: 2,
              text: "Products with digital elements that have been placed on the market before 11 December 2027 shall not be required to comply with the requirements of this Regulation unless they are subject to substantial modifications.",
            },
          ],
          legalCommentary:
            "Grandfathering provision: Equipment placed on market before 11 Dec 2027 is exempt from general CE-marking, but Article 14 24h vulnerability reporting applies to all operating products from 11 Sept 2026.",
        },
        {
          articleNumber: 71,
          title: "Entry into Force and Application",
          paragraphs: [
            {
              paragraphNumber: 1,
              text: "This Regulation shall enter into force on the twentieth day following that of its publication in the Official Journal of the European Union.",
            },
            {
              paragraphNumber: 2,
              text: "It shall apply from 11 December 2027. However, Article 14 (Vulnerability Reporting) shall apply from 11 September 2026, and Chapter IV (Notification of Conformity Assessment Bodies) shall apply from 11 June 2026.",
            },
          ],
          legalCommentary:
            "Establishes the three key compliance milestones: CAB notification (June 2026), 24h PSIRT reporting (Sept 2026), and General Application (Dec 2027).",
        },
      ],
    },
  ],
};

export const annexesData = {
  regulation: "Regulation (EU) 2024/2847",
  shortTitle: "EU Cyber Resilience Act (CRA) Annexes",
  totalAnnexes: 8,
  annexes: [
    {
      annexNumber: "I",
      title: "Essential Cybersecurity Requirements",
      parts: [
        {
          partNumber: 1,
          partTitle: "Security Requirements Relating to the Properties of Products with Digital Elements",
          requirements: [
            {
              id: "ANNEX_I_PART_I_1",
              clause: "Design and development with an appropriate level of cybersecurity based on risk.",
              description: "Products shall be delivered without known exploitable vulnerabilities and with secure-by-default configurations.",
            },
            {
              id: "ANNEX_I_PART_I_2",
              clause: "Protection of confidentiality, integrity, and availability of data.",
              description: "State-of-the-art cryptographic mechanisms, data-in-transit and data-at-rest protection, and strict access controls.",
            },
            {
              id: "ANNEX_I_PART_I_3",
              clause: "Attack surface minimization and principle of least privilege.",
              description: "Disabling unused ports, services, and debug interfaces by default.",
            },
          ],
        },
        {
          partNumber: 2,
          partTitle: "Vulnerability Handling Requirements",
          requirements: [
            {
              id: "ANNEX_I_PART_II_1",
              clause: "Vulnerability identification, internal triage, and coordinated disclosure (CVD).",
              description: "Manufacturers must operate a dedicated vulnerability reporting channel and establish a documented PSIRT policy.",
            },
            {
              id: "ANNEX_I_PART_II_2",
              clause: "Software Bill of Materials (SBOM) generation and maintenance.",
              description: "Machine-readable SBOM identifying all direct and transitive third-party dependencies in CycloneDX or SPDX format.",
            },
            {
              id: "ANNEX_I_PART_II_3",
              clause: "Regular security testing and vulnerability scanning.",
              description: "Automated regression testing, static and dynamic analysis, and security updates testing.",
            },
          ],
        },
      ],
    },
    {
      annexNumber: "II",
      title: "Information and Instructions to the User",
      requirements: [
        {
          id: "ANNEX_II_1",
          clause: "Clear point of contact for vulnerability reporting.",
          description: "Public email or portal for security researchers and end-users.",
        },
        {
          id: "ANNEX_II_2",
          clause: "Guaranteed support period specification.",
          description: "Explicit month and year marking the end date of vulnerability patch availability.",
        },
        {
          id: "ANNEX_II_3",
          clause: "Secure decommissioning and data sanitization instructions.",
          description: "Steps required to safely wipe credentials and configurations when retiring hardware.",
        },
      ],
    },
    {
      annexNumber: "III",
      title: "Important Products with Digital Elements (Class I & Class II)",
      classI: [
        "Identity management systems and privileged access management software",
        "Standalone and embedded password managers",
        "Software for vulnerability detection, asset discovery and endpoint protection",
        "Network interfaces and virtual network switches (e.g. Scalance, Hirschmann, Cisco IE)",
        "Routers, modems intended for internet connection, and industrial switches",
        "Microcontrollers and integrated circuits with general-purpose instruction sets",
      ],
      classII: [
        "Operating systems (embedded, mobile, desktop, hypervisors)",
        "Industrial firewalls, intrusion detection and prevention systems (IDS/IPS)",
        "Programmable Logic Controllers (PLCs), Distributed Control Systems (DCS), and RTUs",
        "Smart meter gateways and advanced industrial sensor controllers",
        "Hardware security modules (HSMs) and smartcards",
      ],
    },
    {
      annexNumber: "IV",
      title: "Critical Products with Digital Elements",
      products: [
        "Hardware devices with security boxes and smartcard chips",
        "Secure microcontrollers used in European Digital Identity Wallets",
        "Hardware components with integrated cryptographic coprocessors evaluated at EAL4+",
      ],
    },
    {
      annexNumber: "V",
      title: "EU Declaration of Conformity (Model Structure)",
      mandatoryFields: [
        "1. Product name, model, type, batch or serial number",
        "2. Name and address of manufacturer or authorized representative",
        "3. Object of declaration (identification of product allowing traceability)",
        "4. Statement of conformity with Regulation (EU) 2024/2847 and harmonised standards applied",
        "5. Identification of Notified Body (name, number) and EU-type examination certificate where applicable",
        "6. Signed for and on behalf of manufacturer (place, date, name, function, signature)",
      ],
    },
    {
      annexNumber: "VI",
      title: "Conformity Assessment Procedures",
      modules: [
        {
          moduleCode: "Module A",
          name: "Internal Control (Self-Assessment)",
          applicableFor: "Default products with digital elements without high risk.",
        },
        {
          moduleCode: "Module H",
          name: "Comprehensive Quality Assurance by Notified Body",
          applicableFor: "Important Class II and Critical products.",
        },
        {
          moduleCode: "Module B+C",
          name: "EU-Type Examination (B) followed by Conformity to Type (C)",
          applicableFor: "Important Class I (alternative) and Important Class II products.",
        },
      ],
    },
    {
      annexNumber: "VII",
      title: "Technical Documentation (Contents of Technical File)",
      elements: [
        "General description of the product and cybersecurity intended purpose",
        "Cybersecurity risk assessment report identifying threats and vulnerability vectors",
        "System architecture diagrams, data flow models, and trust boundaries",
        "Software Bill of Materials (SBOM) and third-party component provenance ledger",
        "Test reports, static analysis findings, penetration test results, and vulnerability remediation records",
      ],
    },
    {
      annexNumber: "VIII",
      title: "Correlation Table & Directive Alignment",
      crossDirectives: [
        "Directive 2001/95/EC (General Product Safety)",
        "Directive 2014/53/EU (Radio Equipment Directive - RED Delegated Act)",
        "Directive (EU) 2022/2555 (NIS2 Directive Art. 21 supply chain duties)",
        "Regulation (EU) 2024/1689 (EU AI Act cybersecurity alignment)",
      ],
    },
  ],
};

export const graphData = {
  graphVersion: "2026.1",
  statutoryFramework: "Regulation (EU) 2024/2847",
  nodesCount: 42,
  edges: [
    {
      source: "ARTICLE_10",
      target: "ANNEX_I",
      relationship: "MANDATES_ESSENTIAL_REQUIREMENTS",
      label: "Article 10(1) enforces Annex I Part I & Part II",
    },
    {
      source: "ARTICLE_10",
      target: "APP_FEATURE_SBOM_VAULT",
      relationship: "IMPLEMENTED_BY",
      label: "Article 10(4) automated via xBOM Multi-Format Ingestion",
    },
    {
      source: "ARTICLE_13",
      target: "ANNEX_II",
      relationship: "MANDATES_USER_INSTRUCTIONS",
      label: "Article 13 references Annex II user guidance and lifetime disclosure",
    },
    {
      source: "ARTICLE_14",
      target: "RECITAL_68",
      relationship: "GROUNDED_IN",
      label: "24h Early Warning obligation explained in Recital 68",
    },
    {
      source: "ARTICLE_14",
      target: "APP_FEATURE_PSIRT_EARLY_WARNING",
      relationship: "IMPLEMENTED_BY",
      label: "Article 14 24h CSIRT/ENISA notice automated via PSIRT Hub",
    },
    {
      source: "ARTICLE_18",
      target: "ANNEX_V",
      relationship: "VERIFIES_DOC",
      label: "Article 18(2) mandates verified EU Declaration of Conformity",
    },
    {
      source: "ARTICLE_19",
      target: "APP_FEATURE_SUPPLIER_REGISTRY",
      relationship: "IMPLEMENTED_BY",
      label: "Article 19 Distributor verification & Duty to Refrain in Partner Hub",
    },
    {
      source: "ARTICLE_20",
      target: "ARTICLE_21",
      relationship: "TRIGGERED_BY",
      label: "Substantial modification under Art. 21 transfers Art. 20 Manufacturer status",
    },
    {
      source: "ARTICLE_21",
      target: "RECITAL_34",
      relationship: "EXEMPTION_BASIS",
      label: "Recital 34 identical spare parts maintain Integrator Exemption",
    },
    {
      source: "ARTICLE_21",
      target: "APP_FEATURE_ARTICLE_21_WIZARD",
      relationship: "IMPLEMENTED_BY",
      label: "Article 21 4-Gate Checklist & SHA-256 certificate sealing in Partner Hub",
    },
    {
      source: "ARTICLE_24",
      target: "ANNEX_III",
      relationship: "DEFINES_CLASSES",
      label: "Article 24 classifies Class I and Class II Important Products",
    },
    {
      source: "ARTICLE_24",
      target: "ANNEX_IV",
      relationship: "DEFINES_CRITICAL",
      label: "Article 24 identifies Annex IV Critical Products",
    },
    {
      source: "ARTICLE_32",
      target: "ANNEX_VI",
      relationship: "SELECTS_MODULE",
      label: "Article 32 matches product class to Modules A, H, or B+C",
    },
    {
      source: "ARTICLE_61",
      target: "RECITAL_115",
      relationship: "PENALTY_FRAMEWORK",
      label: "EUR 15M / 2.5% turnover penalty provisions",
    },
    {
      source: "ARTICLE_69",
      target: "RECITAL_125",
      relationship: "TRANSITIONAL_DATES",
      label: "Grandfathering pre-2027 and staggered 11 Sept 2026 early reporting",
    },
  ],
};
