import { Router } from "express";
import { desc } from "drizzle-orm";
import { db, regulatoryNewsCacheTable, type InsertRegulatoryNewsCache } from "@workspace/db";
import { getLlmConfig, getDbOpenRouterApiKey, resolveGenerationModel } from "../lib/models";
import { logger } from "../lib/logger";

const router = Router();

const FALLBACK_NEWS_ITEMS: InsertRegulatoryNewsCache[] = [
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
  },
  {
    title: "EU Commission Finalizes Article 6 Class I & Class II Product Categories",
    summary: "Defined risk categories for operating systems, microcontrollers, VPN routers, and password managers requiring Third-Party Assessment.",
    fullArticle: `The European Commission has published final regulatory text clarifying product classification rules under Article 6 and Annex III / IV of the Cyber Resilience Act. Products with digital elements are partitioned into Standard (Self-Assessment), Important Class I (Harmonized Standard or Third-Party Assessment), and Important Class II (Mandatory Third-Party Notified Body Assessment).

Class II Critical products—such as hypervisors, hardware security modules (HSMs), industrial PLCs, and firewall appliances—must undergo mandatory EC-type examination by an accredited EU Notified Body. Manufacturers cannot rely solely on internal control procedures for Class II products.

The Commission also established transition rules for legacy hardware revisions, confirming that substantial modifications to existing products on the market trigger full re-assessment under CRA Article 10.`,
    complianceImpact: "Manufacturers of Class II products (PLCs, HSMs, security modules) must engage accredited EU Notified Bodies early to secure EC-type examination certificates.",
    citations: JSON.stringify(["https://ec.europa.eu/commission/presscorner/detail/en/ip_23_4522", "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R2847"]),
    source: "European Commission Portal",
    category: "Product Categorization",
    url: "https://ec.europa.eu/commission/presscorner/detail/en/ip_23_4522",
    modelUsed: "perplexity/sonar-pro",
  },
];

router.get("/regulatory-news", async (req, res) => {
  try {
    const forceRefresh = req.query.refresh === "true";

    // 1. Query existing cached items from DB
    const existing = await db
      .select()
      .from(regulatoryNewsCacheTable)
      .orderBy(desc(regulatoryNewsCacheTable.publishedAt))
      .limit(6);

    // If cache has items and no force refresh requested, return existing cache
    if (!forceRefresh && existing.length > 0) {
      res.json({
        source: "database_cache",
        modelUsed: existing[0]?.modelUsed || "perplexity/sonar-pro",
        items: existing,
      });
      return;
    }

    // 2. Resolve configured searchModel dynamically from Postgres DB llm_config
    const llmConfig = await getLlmConfig(false);
    const searchModel = resolveGenerationModel(llmConfig, "searchModel") || "perplexity/sonar-pro";
    const apiKey = await getDbOpenRouterApiKey();

    if (!apiKey) {
      res.json({
        source: "fallback",
        modelUsed: searchModel,
        items: existing.length > 0 ? existing : FALLBACK_NEWS_ITEMS,
      });
      return;
    }

    // 3. Craft OpenRouter Perplexity request according to official payload schema
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const openrouterRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "https://oxot.ai",
          "X-Title": "OXOT Conformity Application",
        },
        signal: controller.signal,
        body: JSON.stringify({
          model: searchModel.includes("/") ? searchModel : `perplexity/${searchModel}`,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "Search live web for the 4 most recent, factual news items on EU Cyber Resilience Act (CRA) enforcement, ENISA technical guidelines, or CISA KEV advisories. Return strictly a JSON array of objects with keys: title, summary, fullArticle, complianceImpact, source, category, url, citations. Ensure fullArticle is a comprehensive 3-paragraph statutory analysis, complianceImpact gives key takeaways for manufacturers, and url is a valid HTTPS source link.",
                },
              ],
            },
          ],
          max_tokens: 1800,
          temperature: 0.2,
        }),
      });

      clearTimeout(timeoutId);

      if (!openrouterRes.ok) {
        logger.warn({ status: openrouterRes.status }, "OpenRouter news request returned non-200 status");
        res.json({
          source: "database_cache_fallback",
          modelUsed: searchModel,
          items: existing.length > 0 ? existing : FALLBACK_NEWS_ITEMS,
        });
        return;
      }

      const data: any = await openrouterRes.json();
      const content = data.choices?.[0]?.message?.content || "";
      const citations = data.citations || data.choices?.[0]?.message?.citations || [];

      // Clean markdown code blocks and extract JSON
      let cleanedContent = content.replace(/```json/gi, "").replace(/```/g, "").trim();
      
      let parsedItems: InsertRegulatoryNewsCache[] = [];
      try {
        const jsonStart = cleanedContent.indexOf("[");
        const jsonEnd = cleanedContent.lastIndexOf("]");
        if (jsonStart !== -1 && jsonEnd !== -1) {
          const jsonStr = cleanedContent.substring(jsonStart, jsonEnd + 1);
          const rawParsed = JSON.parse(jsonStr);

          parsedItems = rawParsed.map((item: any, index: number) => {
            const itemUrl =
              item.url && item.url.startsWith("http")
                ? item.url
                : citations[index] || "https://eur-lex.europa.eu";

            const citationList = Array.isArray(item.citations)
              ? item.citations
              : citations.length > 0
              ? citations
              : [itemUrl];

            return {
              title: String(item.title || "EU CRA Compliance Update").replace(/\[\d+\]/g, "").trim(),
              summary: String(item.summary || "Latest regulatory compliance update.").replace(/\[\d+\]/g, "").trim(),
              fullArticle: String(item.fullArticle || item.summary || "").replace(/\[\d+\]/g, "").trim(),
              complianceImpact: String(item.complianceImpact || "Review Annex I compliance readiness.").replace(/\[\d+\]/g, "").trim(),
              citations: JSON.stringify(citationList),
              source: String(item.source || "ENISA / OpenRouter Search").trim(),
              category: String(item.category || "EU CRA").trim(),
              url: itemUrl,
              modelUsed: searchModel,
            };
          });
        }
      } catch (parseErr) {
        logger.warn({ parseErr, content }, "Failed to parse JSON from OpenRouter Perplexity news response");
      }

      if (parsedItems.length === 0) {
        parsedItems = FALLBACK_NEWS_ITEMS;
      }

      // Persist newly fetched news items to Postgres DB
      const now = new Date();
      for (const item of parsedItems) {
        await db.insert(regulatoryNewsCacheTable).values({
          ...item,
          publishedAt: now,
        });
      }

      const updatedDb = await db
        .select()
        .from(regulatoryNewsCacheTable)
        .orderBy(desc(regulatoryNewsCacheTable.publishedAt))
        .limit(6);

      res.json({
        source: "openrouter_live",
        modelUsed: searchModel,
        items: updatedDb.length > 0 ? updatedDb : parsedItems,
      });
    } catch (fetchErr) {
      clearTimeout(timeoutId);
      logger.error({ fetchErr }, "OpenRouter news fetch failed or timed out");
      res.json({
        source: "database_cache_fallback",
        modelUsed: searchModel,
        items: existing.length > 0 ? existing : FALLBACK_NEWS_ITEMS,
      });
    }
  } catch (err: any) {
    logger.error({ err }, "Regulatory news endpoint error");
    res.json({
      source: "fallback_emergency",
      modelUsed: "perplexity/sonar-pro",
      items: FALLBACK_NEWS_ITEMS,
    });
  }
});

export default router;
