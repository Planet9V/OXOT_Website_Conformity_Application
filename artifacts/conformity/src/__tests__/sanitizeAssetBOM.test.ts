import { describe, it, expect } from 'vitest';
import { sanitizeRawText, parseAndSanitizeBOMText } from '../lib/sanitizeAssetBOM';

describe('Client-Side In-Browser Sanitization (sanitizeAssetBOM.ts)', () => {
  it('strips private IPv4 addresses, MAC addresses, and hostnames', () => {
    const rawInput = `Device at 192.168.1.50 with MAC 00:1A:2B:3C:4D:5E on srv-scada-line1.internal`;
    const { sanitizedText, redactingSummary } = sanitizeRawText(rawInput);

    expect(sanitizedText).not.toContain('192.168.1.50');
    expect(sanitizedText).not.toContain('00:1A:2B:3C:4D:5E');
    expect(sanitizedText).toContain('[REDACTED_IP]');
    expect(sanitizedText).toContain('[REDACTED_MAC]');
    expect(redactingSummary.ipv4Redacted).toBeGreaterThan(0);
    expect(redactingSummary.macRedacted).toBeGreaterThan(0);
  });

  it('parses CSV rows with sanitized columns correctly', () => {
    const csvContent = `Vendor,Model,Year,Qty,IP,MAC
Hirschmann,RS20-0800,2017,4,10.240.12.5,00:80:F4:11:22:33
Siemens,SCALANCE XC208,2024,2,172.16.4.10,AA:BB:CC:DD:EE:FF`;

    const result = parseAndSanitizeBOMText(csvContent);
    expect(result.assets.length).toBe(2);
    expect(result.assets[0].vendor).toBe('Hirschmann');
    expect(result.assets[0].modelNumber).toBe('RS20-0800');
    expect(result.assets[0].quantity).toBe(4);
    expect(result.redactionSummary.ipv4Redacted).toBe(2);
    expect(result.redactionSummary.macRedacted).toBe(2);
  });
});
