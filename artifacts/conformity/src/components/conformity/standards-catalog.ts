/**
 * Curated catalogue of commonly cited CRA-relevant standards, offered as
 * typeahead suggestions in the applied-standards editor. Purely a client-side
 * convenience: the API contract stays free-text, and assessors can always type
 * a reference that isn't listed here. Keeping references consistent (e.g.
 * "EN 18031-1:2024", not "EN 18031-1 2024") avoids fragmenting the standards
 * ledger and the Declaration of Conformity, which cites these verbatim.
 */
export type StandardSuggestion = {
  reference: string;
  title: string;
};

export const STANDARDS_CATALOG: StandardSuggestion[] = [
  // EN 18031 series (harmonised under the RED delegated act; CRA-relevant)
  {
    reference: "EN 18031-1:2024",
    title: "Common security requirements for radio equipment — Internet-connected radio equipment",
  },
  {
    reference: "EN 18031-2:2024",
    title:
      "Common security requirements for radio equipment — Radio equipment processing data (childcare, toys, wearables)",
  },
  {
    reference: "EN 18031-3:2024",
    title:
      "Common security requirements for radio equipment — Internet-connected radio equipment processing virtual money or monetary value",
  },
  // ETSI consumer IoT baseline
  {
    reference: "ETSI EN 303 645 V2.1.1",
    title: "Cyber Security for Consumer Internet of Things: Baseline Requirements",
  },
  {
    reference: "ETSI TS 103 701 V1.1.1",
    title: "Cyber Security for Consumer Internet of Things: Conformance Assessment of Baseline Requirements",
  },
  // IEC 62443 industrial automation & control systems security
  {
    reference: "IEC 62443-4-1:2018",
    title: "Security for industrial automation and control systems — Secure product development lifecycle requirements",
  },
  {
    reference: "IEC 62443-4-2:2019",
    title: "Security for industrial automation and control systems — Technical security requirements for IACS components",
  },
  {
    reference: "IEC 62443-3-3:2013",
    title: "Security for industrial automation and control systems — System security requirements and security levels",
  },
  // ISO/IEC horizontal security standards
  {
    reference: "ISO/IEC 27001:2022",
    title: "Information security, cybersecurity and privacy protection — Information security management systems",
  },
  {
    reference: "ISO/IEC 29147:2018",
    title: "Information technology — Security techniques — Vulnerability disclosure",
  },
  {
    reference: "ISO/IEC 30111:2019",
    title: "Information technology — Security techniques — Vulnerability handling processes",
  },
  // EU cybersecurity certification (Art 32(2) alternative to harmonised standards)
  {
    reference: "EUCC (Common Criteria) — assurance level 'substantial'",
    title: "EU cybersecurity certification scheme on Common Criteria (Regulation (EU) 2024/482)",
  },
  {
    reference: "EUCC (Common Criteria) — assurance level 'high'",
    title: "EU cybersecurity certification scheme on Common Criteria (Regulation (EU) 2024/482)",
  },
];
