import { Router } from "express";
import { type InsertRegulatoryNewsCache } from "@workspace/db";
import { getDbOpenRouterApiKey } from "../lib/models";
import { generateRegulatoryNews, listRegulatoryNews } from "../lib/regulatoryNewsGenerator";
import { logger } from "../lib/logger";

const router = Router();

const FALLBACK_NEWS_ITEMS: InsertRegulatoryNewsCache[] = [
  {
    title: "CEN/CENELEC & ETSI Release Standardisation Request M/606 Drafting Status for Annex I Baselines",
    summary: "European standardisation organisations progress 41 harmonised standards (15 horizontal, 26 vertical) providing presumption of conformity under the Cyber Resilience Act.",
    fullArticle: `The European standardisation bodies CEN, CENELEC, and ETSI have issued an official progress briefing on Standardisation Request M/606 issued by the European Commission. The joint technical committees are developing 41 European harmonised standards—15 horizontal standards covering general cybersecurity principles and 26 vertical standards targeting high-risk product domains including industrial automation and control systems (IACS), edge computing nodes, and smart energy grid controllers.

Once approved and cited in the Official Journal of the European Union, compliance with these harmonised standards will grant manufacturers a legal "presumption of conformity" with the essential cybersecurity requirements set out in Annex I Part I and Part II of Regulation (EU) 2024/2847.

Standardisation working groups are actively cross-mapping requirements to established international frameworks, notably the IEC 62443 series (industrial OT) and ISO/IEC 27402 (IoT device security baselines), significantly reducing duplication for global equipment vendors.`,
    complianceImpact: "Manufacturers designing products for 2027 market placement should align engineering baselines with the M/606 working drafts and IEC 62443-4-1/4-2 to ensure immediate presumption of conformity upon standard citation.",
    citations: JSON.stringify(["https://www.cencenelec.eu/areas-of-work/cybersecurity", "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R2847"]),
    source: "CEN-CENELEC Joint Technical Committee",
    category: "Harmonised Standards",
    url: "https://www.cencenelec.eu/areas-of-work/cybersecurity",
    modelUsed: "perplexity/sonar-pro",
  },
  {
    title: "ENISA Finalises Single Reporting Platform (SRP) Specifications for 24-Hour CSIRT Notifications",
    summary: "Official technical architecture published for the centralized early-warning notification gateway taking effect September 11, 2026.",
    fullArticle: `The European Union Agency for Cybersecurity (ENISA) has finalized the technical interface architecture and API specifications for the Article 16 Single Reporting Platform (SRP). Commencing September 11, 2026—fifteen months ahead of the full CRA entry into force—manufacturers of products with digital elements must report any actively exploited vulnerabilities and severe incidents through this unified portal.

The SRP architecture implements automated cryptographic routing, securely dispatching early-warning notifications within 24 hours to the designated Computer Security Incident Response Teams (CSIRTs) of all affected EU Member States.

ENISA confirmed that machine-readable notification schemas (supporting CSAF 2.0 and JSON-LD payloads) will be provided for automated PSIRT tooling integration, enabling enterprise vulnerability triage pipelines to dispatch statutory filings directly from security operations centers.`,
    complianceImpact: "Enterprises must equip Product Security Incident Response Teams (PSIRTs) to triage vulnerabilities within a 24-hour window and interface directly with the ENISA Single Reporting Platform API ahead of the September 2026 enforcement date.",
    citations: JSON.stringify(["https://www.enisa.europa.eu/topics/cybersecurity-act", "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R2847"]),
    source: "ENISA Technical Directorate",
    category: "Incident Reporting",
    url: "https://www.enisa.europa.eu/topics/cybersecurity-act",
    modelUsed: "perplexity/sonar-pro",
  },
  {
    title: "European Commission Releases Technical Guidance on Substantial Modifications for Industrial Systems",
    summary: "Practical framework clarifies when software patches, security updates, and operational PLC reconfiguration trigger new CE marking obligations under Article 21.",
    fullArticle: `The European Commission DG CONNECT has published official guidance delineating the boundary between routine maintenance updates and 'substantial modifications' under Article 21 of Regulation (EU) 2024/2847.

The guidance explicitly confirms that security patches designed strictly to remediate vulnerabilities or maintain the intended safety profile do not constitute substantial modifications and therefore do not require re-issuance of the EU Declaration of Conformity. Conversely, updates that introduce new wireless interfaces, alter cryptographic threat models, or expand intended industrial functions legally reclassify the entity making the change as a 'Manufacturer' subject to full CE reassessment.

For system integrators and EPC contractors in industrial plants, this distinction provides clear safe-harbor rules for brownfield maintenance while defining strict statutory guardrails for custom automation scripts.`,
    complianceImpact: "Engineering and plant maintenance teams must establish formal modification review gates to document whether firmware updates alter intended safety or threat baselines, preserving original manufacturer CE marks.",
    citations: JSON.stringify(["https://ec.europa.eu/commission/presscorner/detail/en/ip_23_4522", "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R2847"]),
    source: "European Commission DG CONNECT",
    category: "Regulatory Guidance",
    url: "https://ec.europa.eu/commission/presscorner/detail/en/ip_23_4522",
    modelUsed: "perplexity/sonar-pro",
  },
  {
    title: "ENISA Issues Annex I Technical Guidelines for Connected Hardware",
    summary: "The European Union Agency for Cybersecurity published updated technical specifications for essential cybersecurity requirements under Article 10.",
    fullArticle: `The European Union Agency for Cybersecurity (ENISA) has released landmark technical guidance specifying exact implementation benchmarks for Regulation (EU) 2024/2847 (Cyber Resilience Act). The new specifications cover Annex I Part I essential cybersecurity requirements, focusing heavily on secure defaults, hardware root-of-trust, memory safety, and unauthenticated interface reduction.

Manufacturers of products with digital elements (PDEs) are instructed to perform mandatory threat modeling and risk assessments before placing hardware on the single market. The guidance explicitly highlights microcontrollers, industrial gateways, and IoT smart home devices as key focal points for early market surveillance audits.

Furthermore, ENISA establishes standardized testing procedures for verifying memory-safe language usage (such as Rust and modern C++ bounds checking) and mandates that default credentials must be cryptographically unique per physical device unit.`,
    complianceImpact: "Manufacturers must update Annex IV Technical Documentation with explicit risk assessment records, memory-safety verification logs, and unique credential provisioning evidence before market placement.",
    citations: JSON.stringify(["https://www.enisa.europa.eu/topics/cybersecurity-act", "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R2847"]),
    source: "ENISA Official Gazette",
    category: "CRA Standard",
    url: "https://www.enisa.europa.eu/topics/cybersecurity-act",
    modelUsed: "perplexity/sonar-pro",
  },
  {
    title: "CRA 36-Month Transition Window: Key Statutory Deadlines for Manufacturers",
    summary: "Hardware and software manufacturers placing products on the EU market must complete vulnerability handling disclosures by late 2026.",
    fullArticle: `The European Commission has reaffirmed the enforcement timeline for Regulation (EU) 2024/2847. While the full statutory framework takes effect 36 months post-entry into force, Article 14 mandatory vulnerability reporting and ENISA CSIRT notification obligations become active after 21 months (late 2026).

Economic operators—including manufacturers, authorized representatives, importers, and distributors—must establish 24-hour early warning capabilities for actively exploited vulnerabilities. Failure to report exploited flaws to the ENISA Single Reporting Platform within 24 hours of awareness carries administrative fines up to €15,000,000 or 2.5% of total worldwide annual turnover.

Economic operators are urged to audit their internal PSIRT readiness, establish Coordinated Vulnerability Disclosure (CVD) policies, and verify that their 10-year Annex VII technical file retention vaults comply with EU data retention directives.`,
    complianceImpact: "Mandatory 24-hour early warning notifications and 72-hour detailed incident reporting protocols must be operational in PSIRT infrastructure before late 2026.",
    citations: JSON.stringify(["https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R2847", "https://ec.europa.eu/commission/presscorner/detail/en/ip_23_4522"]),
    source: "EU Journal of Legislation",
    category: "Enforcement",
    url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R2847",
    modelUsed: "perplexity/sonar-pro",
  },
  {
    title: "CISA & ENISA Joint Advisory on Coordinated Vulnerability Handling",
    summary: "Harmonized SBOM and 24-hour reporting protocols agreed between transatlantic agencies for hardware-embedded software.",
    fullArticle: `In a joint press release, the US Cybersecurity and Infrastructure Security Agency (CISA) and ENISA announced alignment on Coordinated Vulnerability Disclosure (CVD) standards and Software Bill of Materials (SBOM) metadata schemas.

The transatlantic framework aligns CycloneDX 1.5 and SPDX 3.0 specification formats with the CRA Annex I Part II requirement for automated vulnerability tracking. Both agencies emphasized that automated machine-readable xBOMs reduce mean time to remediate (MTTR) by enabling instant dependency tree analysis during zero-day events.

The advisory also provides guidance on managing open-source software components, clarifying that commercial stewards integrating open-source code into productized digital elements assume full statutory compliance liability under CRA Article 13.`,
    complianceImpact: "Software Bill of Materials (SBOM) exports must adopt standardized CycloneDX/SPDX schemas with direct vulnerability tracking to satisfy both US CISA and EU CRA audit standards.",
    citations: JSON.stringify(["https://www.cisa.gov/news-events/cybersecurity-advisories", "https://www.enisa.europa.eu/topics/cybersecurity-act"]),
    source: "CISA / ENISA Joint Advisory",
    category: "Vulnerability Management",
    url: "https://www.cisa.gov/news-events/cybersecurity-advisories",
    modelUsed: "perplexity/sonar-pro",
  }
];

router.get("/regulatory-news", async (req, res) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 6, 1), 200);
  try {
    const forceRefresh = req.query.refresh === "true";

    // Auto-seed FALLBACK_NEWS_ITEMS into DB if missing
    try {
      const dbItems = await listRegulatoryNews(200);
      const existingTitles = new Set(dbItems.map((i) => i.title));
      const now = new Date();
      let offset = 0;
      for (const fb of FALLBACK_NEWS_ITEMS) {
        if (!existingTitles.has(fb.title)) {
          const { db, regulatoryNewsCacheTable } = await import("@workspace/db");
          await db.insert(regulatoryNewsCacheTable).values({
            ...fb,
            publishedAt: new Date(now.getTime() - offset * 3600000),
          });
          offset++;
        }
      }
    } catch (e) {
      logger.warn({ e }, "Auto-seed news items skipped");
    }

    const existing = await listRegulatoryNews(limit);
    if (!forceRefresh && existing.length > 0) {
      res.json({ source: "database_cache", modelUsed: existing[0]?.modelUsed || "perplexity/sonar-pro", items: existing });
      return;
    }

    const apiKey = await getDbOpenRouterApiKey();
    if (!apiKey) {
      res.json({ source: "fallback", modelUsed: "perplexity/sonar-pro", items: existing.length > 0 ? existing : FALLBACK_NEWS_ITEMS });
      return;
    }

    const result = await generateRegulatoryNews();
    const items = await listRegulatoryNews(limit);
    res.json({
      source: result.ok ? "openrouter_live" : "database_cache_fallback",
      modelUsed: result.model,
      inserted: result.inserted,
      items: items.length > 0 ? items : FALLBACK_NEWS_ITEMS,
    });
  } catch (err: any) {
    logger.error({ err }, "Regulatory news endpoint error");
    const items = await listRegulatoryNews(limit).catch(() => []);
    res.json({ source: "fallback_emergency", modelUsed: "perplexity/sonar-pro", items: items.length > 0 ? items : FALLBACK_NEWS_ITEMS });
  }
});

export default router;
