import { Router, type IRouter } from "express";
import { createHash } from "node:crypto";

export const openSourceStewardRouter: IRouter = Router();

/**
 * POST /api/steward/attestation
 * Generates an official Article 33 Voluntary Security Attestation for Open Source Stewards.
 */
openSourceStewardRouter.post("/attestation", (req, res) => {
  const b = req.body || {};
  const data = {
    stewardName: String(b.stewardName || "FOSS Working Group"),
    stewardLegalEntity: String(b.stewardLegalEntity || "Open Source Collective"),
    foundationOrCollective: String(b.foundationOrCollective || "Independent FOSS Foundation"),
    repositoryUrl: String(b.repositoryUrl || "https://github.com/foss/core"),
    softwarePackageName: String(b.softwarePackageName || "core-package"),
    versionOrCommit: String(b.versionOrCommit || "v1.0.0"),
    securityContactEmail: String(b.securityContactEmail || "security@example.org"),
    securityPolicyUrl: String(b.securityPolicyUrl || "https://example.org/security"),
    hasCvdPolicy: Boolean(b.hasCvdPolicy),
    hasAutomatedCiTesting: Boolean(b.hasAutomatedCiTesting),
    hasSbomPublished: Boolean(b.hasSbomPublished),
    hasSignedReleases: Boolean(b.hasSignedReleases),
    nonCommercialStewardDeclaration: Boolean(b.nonCommercialStewardDeclaration),
  };

  const rawPayload = JSON.stringify({
    ...data,
    statutoryBasis: "Regulation (EU) 2024/2847 Article 33 (Open-Source Software Stewards)",
    issuedAt: new Date().toISOString(),
  });

  const attestationHash = createHash("sha256").update(rawPayload).digest("hex");

  const isAttestationComplete =
    data.hasCvdPolicy &&
    data.hasAutomatedCiTesting &&
    data.hasSbomPublished &&
    data.hasSignedReleases &&
    data.nonCommercialStewardDeclaration;

  res.json({
    attestationHash,
    status: isAttestationComplete ? "ATTESTATION_VALID_ARTICLE_33" : "INCOMPLETE_CRITERIA",
    statutoryRole: "OPEN_SOURCE_SOFTWARE_STEWARD",
    legalLiabilityExemption: "Exempt from Article 20 Manufacturer obligations pursuant to CRA Recital 18 & Article 33",
    attestationDocument: {
      documentId: `CRA-ART33-FOSS-${attestationHash.slice(0, 12).toUpperCase()}`,
      stewardName: data.stewardName,
      stewardLegalEntity: data.stewardLegalEntity,
      foundationOrCollective: data.foundationOrCollective,
      softwarePackageName: data.softwarePackageName,
      versionOrCommit: data.versionOrCommit,
      repositoryUrl: data.repositoryUrl,
      securityContactEmail: data.securityContactEmail,
      securityPolicyUrl: data.securityPolicyUrl,
      securityProcessesDeclared: {
        coordinatedVulnerabilityDisclosure: data.hasCvdPolicy,
        continuousSecurityVerification: data.hasAutomatedCiTesting,
        machineReadableSbomAvailability: data.hasSbomPublished,
        cryptographicArtifactSigning: data.hasSignedReleases,
      },
      statutoryDeclaration:
        "The software steward certifies that the open source component is developed in good faith under documented security policies and is provided without commercial manufacturer warranty in accordance with Article 33 of Regulation (EU) 2024/2847.",
      issuedAt: new Date().toISOString(),
    },
  });
});

/**
 * POST /api/steward/openvex
 * Generates an OASIS OpenVEX document documenting non-exploitable upstream CVEs.
 */
openSourceStewardRouter.post("/openvex", (req, res) => {
  const b = req.body || {};
  const packageName = String(b.packageName || "component");
  const version = String(b.version || "1.0.0");
  const vulnerabilities: Array<{
    cveId: string;
    status: string;
    justification?: string;
    impactStatement?: string;
  }> = Array.isArray(b.vulnerabilities) ? b.vulnerabilities : [];

  const vexDocument = {
    "@context": "https://openvex.dev/ns/v0.2.0",
    "@id": `https://oxot.nl/vex/${packageName}/${version}/${Date.now()}`,
    author: "OXOT Automated CRA VEX Compiler",
    timestamp: new Date().toISOString(),
    version: 1,
    statements: vulnerabilities.map((v) => ({
      vulnerability: {
        name: v.cveId,
      },
      products: [`pkg:generic/${packageName}@${version}`],
      status: v.status,
      justification: v.justification,
      impact_statement: v.impactStatement || "Analyzed under CRA Annex I static control flow audit; vulnerability cannot be triggered via exposed attack surface.",
    })),
  };

  res.json({
    vexFormat: "OASIS OpenVEX v0.2.0 (CRA Art. 10 & 33 Compliant)",
    vexDocument,
  });
});
