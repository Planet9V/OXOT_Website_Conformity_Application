/**
 * Regulation colour palette for the Frameworks section.
 * Values are HSL triples (no `hsl()` wrapper) matching the OXOT CSS-variable pattern.
 * Fall back to a muted slate when the key is unknown.
 */
export const REG_HUE: Record<string, string> = {
  cra:       '28  90% 55%',   // Dutch Orange — primary
  ai_act:    '270 70% 62%',   // Violet
  machinery: '38  88% 52%',   // Amber
  iec_62443: '170 58% 42%',   // Teal
  nis2:      '208 82% 55%',   // Sky Blue
  red:       '340 75% 55%',   // Rose
  gdpr:      '245 68% 60%',   // Indigo
  cer:       '148 62% 40%',   // Emerald
  dora:      '47  95% 50%',   // Gold
  gpsr:      '355 76% 52%',   // Crimson
  data_act:  '82  68% 44%',   // Lime
};

export function regColor(key: string): string {
  return REG_HUE[key] ?? '220 14% 50%';
}

/** Returns an inline-style object suitable for coloured badges / dots. */
export function regBgStyle(key: string, opacity = 1): React.CSSProperties {
  return { background: `hsl(${regColor(key)} / ${opacity})` };
}

export function regTextStyle(key: string): React.CSSProperties {
  return { color: `hsl(${regColor(key)})` };
}
