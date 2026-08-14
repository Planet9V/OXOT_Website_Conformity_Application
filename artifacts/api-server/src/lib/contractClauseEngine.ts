export interface ContractClausePackage {
  contractTitle: string;
  governingLaw: string;
  statutoryReference: string;
  clauses: Array<{
    id: string;
    title: string;
    clauseText: string;
    purpose: string;
    mandatoryFor: string[];
  }>;
}

export function generateB2BContractClauses(): ContractClausePackage {
  return {
    contractTitle: "B2B Industrial Network Modernization, SLA & Recital 34 Spare Parts Addendum",
    governingLaw: "Dutch Law / European Union Law",
    statutoryReference: "Regulation (EU) 2024/2847 (Cyber Resilience Act)",
    clauses: [
      {
        id: "CLAUSE_01_RECITAL_34_SPARE_PARTS",
        title: "1. Provision of Identical Spare Components (CRA Recital 34)",
        clauseText:
          "The System Integrator agrees to maintain and dispatch replacement components exclusively intended to replace identical parts in hardware placed on the EU market prior to 11 December 2027, pursuant to Recital 34 and Article 2(2) of Regulation (EU) 2024/2847. Such replacement components shall not constitute a new product placement on the market.",
        purpose: "Legally qualifies warehouse spare parts as exempt from CE marking post-2027.",
        mandatoryFor: ["Axians", "Actemium", "Plant Asset Owners"],
      },
      {
        id: "CLAUSE_02_INTEGRATOR_EXEMPTION",
        title: "2. Limitation of Manufacturer Liability (CRA Article 21)",
        clauseText:
          "The System Integrator provides deployment, configuration, and maintenance services as an Integrator and Distributor under Article 19. All firmware updates applied shall be original OEM-signed images. Neither party shall perform substantial modifications that alter the product's cybersecurity compliance envelope or intended purpose under Article 21.",
        purpose: "Prevents accidental transfer of €15M manufacturer liabilities to the SI.",
        mandatoryFor: ["System Integrators", "Distributors"],
      },
      {
        id: "CLAUSE_03_ARTICLE_14_COORDINATION",
        title: "3. Vulnerability Notification & Article 14 Coordination",
        clauseText:
          "In the event of an actively exploited zero-day vulnerability affecting installed network assets, the System Integrator and Client shall coordinate notification to the designated national CSIRT and ENISA within 24 hours of confirmation, in compliance with Article 14 of Regulation (EU) 2024/2847.",
        purpose: "Establishes joint CSIRT/ENISA incident escalation procedure.",
        mandatoryFor: ["Critical Infrastructure Operators", "System Integrators"],
      },
      {
        id: "CLAUSE_04_DISPATCH_SLA",
        title: "4. 48-Hour Emergency Hardware Replacement SLA",
        clauseText:
          "Upon receipt of a verified critical network failure notice, the System Integrator guarantees dispatch of pre-tested, identical replacement hardware from its sovereign warehouse reserve within forty-eight (48) hours to ensure continuous plant operational uptime.",
        purpose: "Commercial SLA backing for high-availability NaaS contracts.",
        mandatoryFor: ["Asset Owners", "Managed Service Providers"],
      },
    ],
  };
}
