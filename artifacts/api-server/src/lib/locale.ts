export type Locale = "en" | "nl";

export const SUPPORTED_LOCALES: Locale[] = ["en", "nl"];

/** Normalize an Express path param into a supported locale, or null if invalid. */
export function parseLocale(raw: string | string[] | undefined): Locale | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (value === "en" || value === "nl") {
    return value;
  }
  return null;
}

/** Normalize an Express path param into a plain string. */
export function firstParam(raw: string | string[] | undefined): string {
  return Array.isArray(raw) ? (raw[0] ?? "") : (raw ?? "");
}
