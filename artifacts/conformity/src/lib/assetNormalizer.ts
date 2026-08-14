import { sanitizeRawText, type RedactionSummary } from "./sanitizeAssetBOM";

export interface NormalizedAssetItem {
  vendor: string;
  model: string;
  role: string;
  firmware?: string;
  qty: number;
  originalRawRow?: string;
}

export interface NormalizationResult {
  assets: NormalizedAssetItem[];
  sanitizationReport: {
    sanitizedText: string;
    replacedCount: number;
    redactionSummary: RedactionSummary;
  };
  sourceDetected: "NOZOMI" | "CLAROTY" | "NETBOX" | "GENERIC_CSV" | "PLAIN_TEXT";
  totalRowsProcessed: number;
}

const VENDOR_KEYWORDS: Record<string, string> = {
  siemens: "Siemens",
  scalance: "Siemens",
  hirschmann: "Hirschmann",
  belden: "Hirschmann",
  moxa: "Moxa",
  cisco: "Cisco",
  catalyst: "Cisco",
  phoenix: "Phoenix Contact",
  wago: "WAGO",
  schneider: "Schneider Electric",
  rockwell: "Rockwell Automation",
  allen: "Rockwell Automation",
  bradley: "Rockwell Automation",
  advantech: "Advantech",
  fortinet: "Fortinet",
  palo: "Palo Alto",
};

export function normalizeAndSanitizeAssetInput(rawInput: string): NormalizationResult {
  // Step 1: Execute client-side IP and PII sanitization
  const { sanitizedText, redactingSummary } = sanitizeRawText(rawInput);
  const replacedCount = redactingSummary.ipv4Redacted + redactingSummary.macRedacted;

  const lines = sanitizedText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return {
      assets: [],
      sanitizationReport: {
        sanitizedText,
        replacedCount,
        redactionSummary: redactingSummary,
      },
      sourceDetected: "PLAIN_TEXT",
      totalRowsProcessed: 0,
    };
  }

  // Detect header if CSV/TSV
  const firstLine = lines[0].toLowerCase();
  let delimiter = ",";
  if (firstLine.includes("\t")) delimiter = "\t";
  else if (firstLine.includes(";")) delimiter = ";";

  let sourceDetected: NormalizationResult["sourceDetected"] = "PLAIN_TEXT";
  if (firstLine.includes("nozomi") || firstLine.includes("asset_id") || firstLine.includes("appliance")) {
    sourceDetected = "NOZOMI";
  } else if (firstLine.includes("claroty") || firstLine.includes("purdue") || firstLine.includes("site_id")) {
    sourceDetected = "CLAROTY";
  } else if (firstLine.includes("netbox") || firstLine.includes("device_role") || firstLine.includes("rack")) {
    sourceDetected = "NETBOX";
  } else if (firstLine.includes("vendor") || firstLine.includes("model") || firstLine.includes("hardware") || firstLine.includes("ip")) {
    sourceDetected = "GENERIC_CSV";
  }

  const assets: NormalizedAssetItem[] = [];
  const startIdx = sourceDetected !== "PLAIN_TEXT" ? 1 : 0;

  for (let i = startIdx; i < lines.length; i++) {
    const line = lines[i];
    const cols = line.split(delimiter).map((c) => c.replace(/^["']|["']$/g, "").trim());

    let vendor = "Generic OT";
    let model = line;
    let role = "industrial_switch";
    let firmware: string | undefined;
    let qty = 1;

    // Detect vendor from text
    const lowerLine = line.toLowerCase();
    for (const [kw, canonicalVendor] of Object.entries(VENDOR_KEYWORDS)) {
      if (lowerLine.includes(kw)) {
        vendor = canonicalVendor;
        break;
      }
    }

    if (cols.length >= 2) {
      if (cols.length >= 3 && cols[0].length > 0 && cols[1].length > 0) {
        model = `${cols[0]} ${cols[1]}`.trim();
        if (cols[2]) firmware = cols[2];
      } else {
        model = cols.slice(0, 2).join(" ");
      }
    }

    // Role heuristic
    if (lowerLine.includes("switch") || lowerLine.includes("xc") || lowerLine.includes("rs20") || lowerLine.includes("eds")) {
      role = "industrial_switch";
    } else if (lowerLine.includes("router") || lowerLine.includes("gateway") || lowerLine.includes("ap") || lowerLine.includes("w788")) {
      role = "gateway";
    } else if (lowerLine.includes("plc") || lowerLine.includes("s7-") || lowerLine.includes("modicon")) {
      role = "plc";
    } else if (lowerLine.includes("hmi") || lowerLine.includes("panel")) {
      role = "hmi";
    }

    assets.push({
      vendor,
      model: model.substring(0, 80),
      role,
      firmware,
      qty,
      originalRawRow: line,
    });
  }

  return {
    assets,
    sanitizationReport: {
      sanitizedText,
      replacedCount,
      redactionSummary: redactingSummary,
    },
    sourceDetected,
    totalRowsProcessed: lines.length,
  };
}
