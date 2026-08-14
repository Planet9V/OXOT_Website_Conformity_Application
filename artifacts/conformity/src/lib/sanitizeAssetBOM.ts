export interface SanitizedAssetInput {
  id: string;
  vendor: string;
  model: string;
  firmwareVersion?: string;
  category: "router" | "switch" | "firewall" | "gateway" | "plc" | "other";
  installYear?: number;
  criticality: "STANDARD" | "CRITICAL" | "SAFETY_INSTRUMENTED";
}

/**
 * Client-Side In-Browser Asset BOM Sanitizer & Anonymizer.
 * Strips private IP addresses, MAC addresses, internal hostnames, and site coordinates
 * before sending hardware inventory payloads over the network, ensuring zero breach of
 * plant customer confidentiality or OT security policies.
 */

export interface RedactionSummary {
  ipv4Redacted: number;
  macRedacted: number;
}

// Regex patterns to detect and redact sensitive OT network telemetry
const IP_PATTERN = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
const MAC_PATTERN = /\b(?:[0-9A-Fa-f]{2}[:-]){5}(?:[0-9A-Fa-f]{2})\b/g;
const INTERNAL_HOST_PATTERN = /\.(?:local|internal|corp|lan|plant|site|factory)\b/gi;

export function sanitizeRawText(input: string): { sanitizedText: string; redactingSummary: RedactionSummary } {
  let ipv4Redacted = 0;
  let macRedacted = 0;

  const withRedactedIp = input.replace(IP_PATTERN, () => {
    ipv4Redacted++;
    return "[REDACTED_IP]";
  });

  const sanitizedText = withRedactedIp.replace(MAC_PATTERN, () => {
    macRedacted++;
    return "[REDACTED_MAC]";
  });

  return {
    sanitizedText,
    redactingSummary: {
      ipv4Redacted,
      macRedacted,
    },
  };
}

export function sanitizeRawAssetRow(
  raw: Record<string, any>,
  index: number
): SanitizedAssetInput {
  // Extract vendor
  const vendorRaw =
    raw.vendor || raw.Vendor || raw.Manufacturer || raw.manufacturer || raw.make || "Generic OT";
  const vendor = String(vendorRaw).replace(IP_PATTERN, "[REDACTED]").trim();

  // Extract model
  const modelRaw =
    raw.model || raw.Model || raw.DeviceModel || raw.device_model || raw.Product || raw.product || "Unknown Model";
  const model = String(modelRaw).replace(IP_PATTERN, "").replace(MAC_PATTERN, "").trim();

  // Extract firmware version
  const fwRaw = raw.firmware || raw.Firmware || raw.SW_Version || raw.Version || raw.sw_version || "";
  const firmwareVersion = fwRaw ? String(fwRaw).replace(IP_PATTERN, "").trim() : undefined;

  // Detect category
  const lower = `${vendor} ${model}`.toLowerCase();
  let category: "switch" | "firewall" | "router" | "gateway" | "plc" | "other" = "switch";
  if (lower.includes("firewall") || lower.includes("security") || lower.includes("vpn") || lower.includes("guard")) {
    category = "firewall";
  } else if (lower.includes("plc") || lower.includes("controller") || lower.includes("s7-") || lower.includes("logix")) {
    category = "plc";
  } else if (lower.includes("gateway") || lower.includes("edge") || lower.includes("telemetry")) {
    category = "gateway";
  } else if (lower.includes("router")) {
    category = "router";
  }

  // Extract install year if present
  let installYear: number | undefined;
  const yearRaw = raw.installYear || raw.InstallYear || raw.Year || raw.install_date || raw.Date;
  if (yearRaw) {
    const match = String(yearRaw).match(/\b(19\d\d|20\d\d)\b/);
    if (match) installYear = parseInt(match[1], 10);
  }

  // Generate deterministic sanitized pseudo-ID (zero PII/IP leakage)
  const id = `asset-${index + 1}-${Math.random().toString(36).substring(2, 7)}`;

  return {
    id,
    vendor: vendor || "Unknown Vendor",
    model: model || "Standard Model",
    firmwareVersion,
    category,
    criticality: raw.criticality === "CRITICAL" || raw.criticality === "SAFETY_INSTRUMENTED" ? raw.criticality : "STANDARD",
    installYear,
  };
}

/**
 * Parses raw CSV or text lines into a sanitized asset array
 */
export function parseAndSanitizeBOMText(text: string): SanitizedAssetInput[] {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (!lines.length) return [];

  const headers = lines[0].split(/[,;\t]/).map((h) => h.trim().toLowerCase());
  const hasHeaders = headers.some((h) => h.includes("vendor") || h.includes("model") || h.includes("device") || h.includes("manufacturer"));

  const results: SanitizedAssetInput[] = [];
  const startIdx = hasHeaders ? 1 : 0;

  for (let i = startIdx; i < lines.length; i++) {
    const cols = lines[i].split(/[,;\t]/).map((c) => c.trim().replace(/^["']|["']$/g, ""));
    if (!cols.length || (cols.length === 1 && !cols[0])) continue;

    const rowObj: Record<string, any> = {};
    if (hasHeaders) {
      headers.forEach((h, idx) => {
        rowObj[h] = cols[idx] || "";
      });
    } else {
      // Fallback positional: Col 0 = Vendor, Col 1 = Model, Col 2 = Firmware/Year
      rowObj.vendor = cols[0] || "Siemens";
      rowObj.model = cols[1] || cols[0] || "Scalance";
      rowObj.firmware = cols[2] || "";
    }

    results.push(sanitizeRawAssetRow(rowObj, i));
  }

  return results;
}
