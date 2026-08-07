// Client-safe single source of truth for the 5 CRA intake segments.
// IMPORTANT: this module must NOT import server-only code (no @/lib/db / pg),
// so it can be imported by BOTH server code and client components (the intake
// form, the admin leads filter) without pulling Node built-ins (fs/dns/net/tls)
// into the browser bundle — which breaks `next build`.
export const SEGMENTS = ["manufacturer", "oem", "integrator", "reseller", "operator"] as const;
export type Segment = (typeof SEGMENTS)[number];

export function isSegment(v: unknown): v is Segment {
  return typeof v === "string" && (SEGMENTS as readonly string[]).includes(v);
}
