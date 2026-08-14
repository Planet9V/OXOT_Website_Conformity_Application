export interface SanitizedAssetInput {
  id: string;
  vendor: string;
  model: string;
  firmwareVersion?: string;
  category: "router" | "switch" | "firewall" | "gateway" | "plc" | "other";
  installYear?: number;
  criticality: "STANDARD" | "CRITICAL" | "SAFETY_INSTRUMENTED";
}

export interface RedactionSummary {
  ipv4Redacted: number;
  macRedacted: number;
}

const IP_PATTERN = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
const MAC_PATTERN = /\b(?:[0-9A-Fa-f]{2}[:-]){5}(?:[0-9A-Fa-f]{2})\b/g;

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
