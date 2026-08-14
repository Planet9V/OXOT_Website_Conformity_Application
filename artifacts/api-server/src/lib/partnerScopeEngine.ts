import type { SanitizedAssetInput, StockMatchResultItem } from "@workspace/api-zod";
import type { SanitizedAssetItem, CommercialActionPlan } from "@workspace/db";

export interface ScopeAssessmentCalculation {
  totalAssetsCount: number;
  classIAssetsCount: number;
  classIiAssetsCount: number;
  grandfatheredPre2027Count: number;
  art14ExposedCount: number;
  spareStockMatchesCount: number;
  article61FineExposureEur: number;
  recommendedCapexPullForwardEur: number;
  sanitizedAssets: SanitizedAssetItem[];
  commercialActionPlan: CommercialActionPlan;
}

// Known OT / Enterprise Hardware Models and their CRA Annex III Classifications & EOL Status
const HARDWARE_CATALOG_KNOWLEDGE: Record<
  string,
  {
    category: "switch" | "firewall" | "router" | "gateway" | "plc" | "other";
    craClass: "CLASS_I" | "CLASS_II" | "DEFAULT";
    isEOS: boolean;
    eosYear?: number;
    recommendedSpareSku?: string;
    recommendedSpareModel?: string;
    dispatchHours?: number;
  }
> = {
  // Siemens Scalance Switches
  "scalance x208": { category: "switch", craClass: "CLASS_I", isEOS: true, eosYear: 2022, recommendedSpareSku: "6GK5208-0BA00-2AC2", recommendedSpareModel: "Siemens Scalance XC-208", dispatchHours: 48 },
  "scalance x204": { category: "switch", craClass: "CLASS_I", isEOS: true, eosYear: 2021, recommendedSpareSku: "6GK5204-0BA00-2AC2", recommendedSpareModel: "Siemens Scalance XC-204", dispatchHours: 48 },
  "scalance xc208": { category: "switch", craClass: "CLASS_I", isEOS: false, recommendedSpareSku: "6GK5208-0BA00-2AC2", recommendedSpareModel: "Siemens Scalance XC-208", dispatchHours: 48 },
  "scalance s615": { category: "firewall", craClass: "CLASS_II", isEOS: false, recommendedSpareSku: "6GK5615-0AA00-2AA2", recommendedSpareModel: "Siemens Scalance SC-615", dispatchHours: 48 },
  "scalance s602": { category: "firewall", craClass: "CLASS_II", isEOS: true, eosYear: 2020, recommendedSpareSku: "6GK5615-0AA00-2AA2", recommendedSpareModel: "Siemens Scalance SC-615", dispatchHours: 48 },
  
  // Cisco Industrial Ethernet
  "ie 2000": { category: "switch", craClass: "CLASS_I", isEOS: true, eosYear: 2023, recommendedSpareSku: "IE-4000-8GS4G-E", recommendedSpareModel: "Cisco Catalyst IE-4000", dispatchHours: 48 },
  "ie 3000": { category: "switch", craClass: "CLASS_I", isEOS: true, eosYear: 2019, recommendedSpareSku: "IE-4000-8GS4G-E", recommendedSpareModel: "Cisco Catalyst IE-4000", dispatchHours: 48 },
  "ie 4000": { category: "switch", craClass: "CLASS_I", isEOS: false, recommendedSpareSku: "IE-4000-8GS4G-E", recommendedSpareModel: "Cisco Catalyst IE-4000", dispatchHours: 48 },
  "isa 3000": { category: "firewall", craClass: "CLASS_II", isEOS: false, recommendedSpareSku: "ISA-3000-4C-K9", recommendedSpareModel: "Cisco Industrial Security Appliance ISA-3000", dispatchHours: 48 },
  
  // Hirschmann Rail Switches
  "rs20": { category: "switch", craClass: "CLASS_I", isEOS: true, eosYear: 2022, recommendedSpareSku: "BOBCAT-BRS20", recommendedSpareModel: "Hirschmann BOBCAT BRS20", dispatchHours: 48 },
  "rs30": { category: "switch", craClass: "CLASS_I", isEOS: true, eosYear: 2021, recommendedSpareSku: "BOBCAT-BRS30", recommendedSpareModel: "Hirschmann BOBCAT BRS30", dispatchHours: 48 },
  "eagle one": { category: "firewall", craClass: "CLASS_II", isEOS: true, eosYear: 2022, recommendedSpareSku: "EAGLE40-04", recommendedSpareModel: "Hirschmann EAGLE40 Next-Gen Firewall", dispatchHours: 48 },
  
  // Moxa EDS & EDR
  "eds-508a": { category: "switch", craClass: "CLASS_I", isEOS: true, eosYear: 2023, recommendedSpareSku: "EDS-4008-LV", recommendedSpareModel: "Moxa EDS-4008 Series", dispatchHours: 48 },
  "edr-810": { category: "firewall", craClass: "CLASS_II", isEOS: false, recommendedSpareSku: "EDR-G9010", recommendedSpareModel: "Moxa EDR-G9010 Secure Router", dispatchHours: 48 },
  
  // Siemens & Rockwell PLCs
  "s7-300": { category: "plc", craClass: "CLASS_II", isEOS: true, eosYear: 2023, recommendedSpareSku: "6ES7511-1AK02-0AB0", recommendedSpareModel: "Siemens SIMATIC S7-1500 + Scalance SC-615 Conduit", dispatchHours: 72 },
  "s7-1500": { category: "plc", craClass: "CLASS_II", isEOS: false, recommendedSpareSku: "6ES7511-1AK02-0AB0", recommendedSpareModel: "Siemens SIMATIC S7-1500", dispatchHours: 48 },
  "controllogix 5570": { category: "plc", craClass: "CLASS_II", isEOS: true, eosYear: 2024, recommendedSpareSku: "1756-L81E", recommendedSpareModel: "Allen-Bradley ControlLogix 5580", dispatchHours: 72 },
};

/**
 * Normalizes vendor and model strings for deterministic matching
 */
function normalizeKey(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]/g, " ").replace(/\s+/g, " ").trim();
}

/**
 * Evaluates a list of sanitized customer hardware assets against CRA Regulation (EU) 2024/2847,
 * applying Article 69 grandfathering rules, Article 14 vulnerability gaps, and spare-parts stock matching.
 */
export function evaluateNetworkScope(
  assets: SanitizedAssetInput[],
  annualTurnoverEur?: number,
  locale: "en" | "nl" = "en"
): ScopeAssessmentCalculation {
  let classICount = 0;
  let classIiCount = 0;
  let grandfatheredCount = 0;
  let art14ExposedCount = 0;
  let spareStockMatchesCount = 0;

  const sanitizedEvaluatedAssets: SanitizedAssetItem[] = assets.map((asset) => {
    const rawKey = normalizeKey(`${asset.vendor} ${asset.model}`);
    let matchedKnowledge = Object.entries(HARDWARE_CATALOG_KNOWLEDGE).find(([k]) => rawKey.includes(k))?.[1];

    if (!matchedKnowledge) {
      const isFirewall = rawKey.includes("firewall") || rawKey.includes("security") || rawKey.includes("vpn");
      const isPlc = rawKey.includes("plc") || rawKey.includes("controller") || rawKey.includes("pac");
      const isSwitch = rawKey.includes("switch") || rawKey.includes("router");

      matchedKnowledge = {
        category: isFirewall ? "firewall" : isPlc ? "plc" : isSwitch ? "switch" : asset.category,
        craClass: isFirewall || isPlc ? "CLASS_II" : isSwitch ? "CLASS_I" : "DEFAULT",
        isEOS: (asset.installYear && asset.installYear < 2018) || false,
      };
    }

    if (matchedKnowledge.craClass === "CLASS_I") classICount++;
    if (matchedKnowledge.craClass === "CLASS_II") classIiCount++;

    // Grandfathering (Article 69(2)): Assumed placed on market before 11 Dec 2027
    const isGrandfathered = true;
    grandfatheredCount++;

    // Article 14 Exposure (Article 69(3)): Applies Sept 2026. If EOS, vendor will not patch
    const isArt14Exposed = matchedKnowledge.isEOS;
    if (isArt14Exposed) art14ExposedCount++;

    const hasSpare = !!matchedKnowledge.recommendedSpareSku;
    if (hasSpare) spareStockMatchesCount++;

    let action: SanitizedAssetItem["recommendedAction"] = "RETAIN";
    if (isArt14Exposed && matchedKnowledge.category === "plc") {
      action = "IEC_62443_CONDUIT";
    } else if (isArt14Exposed && hasSpare) {
      action = "PULL_FORWARD_SPARE";
    } else if (isArt14Exposed) {
      action = "MODERNIZE_CRA_HW";
    }

    return {
      id: asset.id,
      vendor: asset.vendor,
      model: asset.model,
      firmwareVersion: asset.firmwareVersion,
      category: matchedKnowledge.category,
      craAnnexClass: matchedKnowledge.craClass,
      isGrandfatheredPre2027: isGrandfathered,
      isArt14Exposed: isArt14Exposed,
      hasSpareMatch: hasSpare,
      matchedSpareSku: matchedKnowledge.recommendedSpareSku,
      matchedSpareLeadHours: matchedKnowledge.dispatchHours || 48,
      recommendedAction: action,
    };
  });

  // Calculate Article 61 Administrative Fine Liability (up to €15M or 2.5% global turnover)
  const turnover = annualTurnoverEur || 50_000_000;
  const article61FineExposureEur = Math.min(15_000_000, turnover * 0.025);

  // Estimated Capex pull forward: ~€1,850 per critical switch/firewall replacement from stock
  const estimatedCapexPullForward = art14ExposedCount * 1_850;
  const totalModernizationCapex = (classICount + classIiCount) * 2_400;
  const annualNaasOpex = (assets.length * 45) * 12;

  const isNl = locale === "nl";

  const commercialActionPlan: CommercialActionPlan = {
    headline: isNl
      ? `CRA-Netwerkmoderniserings- en Vervangingsplan (${art14ExposedCount} componenten met direct risico)`
      : `CRA Network Modernization & Spare-Parts Action Plan (${art14ExposedCount} At-Risk Components Identified)`,
    summary: isNl
      ? `Uw geïnstalleerde basis bevat ${assets.length} netwerk- en besturingscomponenten. Hoewel apparatuur vóór 11 december 2027 is vrijgesteld van algemene CE-markering (Art 69(2)), zijn ${art14ExposedCount} apparaten wegens End-of-Support (EOS) niet in staat te voldoen aan de verplichte 24-uurs kwetsbaarheidsrapportage onder Artikel 14 vanaf 11 september 2026.`
      : `Your installed base contains ${assets.length} industrial network and OT assets. While equipment placed on the market prior to 11 December 2027 is grandfathered from general CE marking (Art 69(2)), ${art14ExposedCount} legacy components have reached End-of-Support (EOS) and cannot receive vendor patches to satisfy mandatory 24-hour vulnerability reporting under Article 14 starting 11 September 2026.`,
    totalCapexPullForwardEstimateEur: estimatedCapexPullForward,
    totalModernizationCapexEstimateEur: totalModernizationCapex,
    annualNaasOpexEstimateEur: annualNaasOpex,
    recommendedNextSteps: isNl
      ? [
          "Trek capex naar voren om identieke reserveonderdelen uit magazijnvoorraad veilig te stellen vóór 2027.",
          "Vervang niet-patchbare Class I/II switches en firewalls door gecertificeerde moderne eenheden.",
          "Implementeer IEC 62443 zone/conduit micro-segmentatie voor legacy PLC's.",
          "Sluit een NaaS/SLA beheerovereenkomst voor continue kwetsbaarheidsmonitoring.",
        ]
      : [
          "Pull forward Capex to stockpile identical replacement spares from warehouse stock before 2027 (Recital 34).",
          "Replace unpatchable Class I/II switches and firewalls with CRA-ready certified hardware.",
          "Deploy IEC 62443 zone/conduit security gateways in front of non-replaceable legacy PLCs.",
          "Establish an ongoing NaaS lifecycle and 24/7 vulnerability monitoring contract.",
        ],
    salesDialoguePrompts: {
      urgencyPrompt: isNl
        ? "Op basis van deze audit vereisen deze netwerkcomponenten actieve kwetsbaarheidsopvolging voor september 2026 onder CRA Artikel 14."
        : "Based on this audit, these network and industrial components require active vulnerability handling before September 2026 under CRA Article 14.",
      installedBasePrompt: isNl
        ? "Heeft u momenteel een compleet overzicht van welke industriële switches en firewalls in uw fabrieken geen firmware-updates meer ontvangen?"
        : "Do you currently know which industrial switches, routers, and firewalls across your operational plants no longer receive vendor security updates?",
      roadmapPrompt: isNl
        ? "Is de tijdige vervanging of modernisering van deze kwetsbare componenten al opgenomen in uw meerjareninvesteringsplan?"
        : "Is the replacement or modernization of these vulnerable components already allocated in your multi-year capital budget?",
      partnerValuePrompt: isNl
        ? "Zou het waardevol zijn om samen met Axians te bekijken hoe onze magazijnvoorraad en lifecycle management uw levertijden met 18 maanden kunnen verkorten?"
        : "Would it be useful to review your installed base with our engineering team to see where existing warehouse stock, lifecycle SLAs, or network redesign can eliminate 18-month factory supply-chain delays?",
    },
  };

  return {
    totalAssetsCount: assets.length,
    classIAssetsCount: classICount,
    classIiAssetsCount: classIiCount,
    grandfatheredPre2027Count: grandfatheredCount,
    art14ExposedCount: art14ExposedCount,
    spareStockMatchesCount: spareStockMatchesCount,
    article61FineExposureEur,
    recommendedCapexPullForwardEur: estimatedCapexPullForward,
    sanitizedAssets: sanitizedEvaluatedAssets,
    commercialActionPlan,
  };
}
