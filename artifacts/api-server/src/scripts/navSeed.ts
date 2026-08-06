/**
 * Seed nav data — extracted into a plain module (no DB imports) so it can be
 * imported by unit tests as well as seedContent.ts.
 *
 * Rules enforced by tests:
 *   • No nav item with href containing "/conformity/" may carry placement "header"
 *     in any locale. The Conformity Platform items live inside the Services
 *     dropdown panel in header.tsx (client-side PANELS config), not as
 *     stand-alone header links.
 */

type Locale = "en" | "nl";

export interface NavSeedItem {
  locale: Locale;
  label: string;
  href: string;
  placement: string;
  sortOrder: number;
  external: boolean;
}

export const NAV: Record<Locale, NavSeedItem[]> = {
  en: [
    { locale: "en", label: "Home",       href: "/",          placement: "header", sortOrder: 0, external: false },
    { locale: "en", label: "Services",   href: "/services",  placement: "header", sortOrder: 1, external: false },
    { locale: "en", label: "Frameworks", href: "/frameworks",placement: "header", sortOrder: 2, external: false },
    { locale: "en", label: "Insights",   href: "/insights",  placement: "header", sortOrder: 3, external: false },
    { locale: "en", label: "About",      href: "/about",     placement: "header", sortOrder: 4, external: false },
    { locale: "en", label: "Contact",    href: "/contact",   placement: "header", sortOrder: 5, external: false },
    // Footer — regulations
    { locale: "en", label: "Cyber Resilience Act", href: "/cra", placement: "footer", sortOrder: 1, external: false },
    { locale: "en", label: "EU AI Act", href: "/ai-act", placement: "footer", sortOrder: 2, external: false },
    { locale: "en", label: "Machinery Regulation", href: "/machine-act", placement: "footer", sortOrder: 3, external: false },
    { locale: "en", label: "NIS2 Directive", href: "/nis2", placement: "footer", sortOrder: 4, external: false },
    { locale: "en", label: "IEC 62443", href: "/iec-62443", placement: "footer", sortOrder: 5, external: false },
    { locale: "en", label: "TS 50701", href: "/ts-50701", placement: "footer", sortOrder: 6, external: false },
    // Footer — products & focus
    { locale: "en", label: "Sentyron — CRA Conformity", href: "/sentyron", placement: "footer", sortOrder: 7, external: false },
    { locale: "en", label: "Data Center (SL-3 / SL-4)", href: "/data-center", placement: "footer", sortOrder: 8, external: false },
    // Footer — company & insights
    { locale: "en", label: "Services", href: "/services", placement: "footer", sortOrder: 9, external: false },
    { locale: "en", label: "Cyber Digital Twin", href: "/cyber-digital-twin", placement: "footer", sortOrder: 10, external: false },
    { locale: "en", label: "Fooled by Randomness", href: "/cdt-fooled-by-randomness", placement: "footer", sortOrder: 11, external: false },
    { locale: "en", label: "About", href: "/about", placement: "footer", sortOrder: 12, external: false },
    { locale: "en", label: "Conformity Platform", href: "/conformity/", placement: "footer", sortOrder: 13, external: true },
  ],
  nl: [
    { locale: "nl", label: "Home",      href: "/",          placement: "header", sortOrder: 0, external: false },
    { locale: "nl", label: "Diensten",  href: "/services",  placement: "header", sortOrder: 1, external: false },
    { locale: "nl", label: "Kaders",    href: "/frameworks",placement: "header", sortOrder: 2, external: false },
    { locale: "nl", label: "Inzichten", href: "/insights",  placement: "header", sortOrder: 3, external: false },
    { locale: "nl", label: "Over ons",  href: "/about",     placement: "header", sortOrder: 4, external: false },
    { locale: "nl", label: "Contact",   href: "/contact",   placement: "header", sortOrder: 5, external: false },
    { locale: "nl", label: "Cyber Resilience Act", href: "/cra", placement: "footer", sortOrder: 1, external: false },
    { locale: "nl", label: "EU AI Act", href: "/ai-act", placement: "footer", sortOrder: 2, external: false },
    { locale: "nl", label: "Machineverordening", href: "/machine-act", placement: "footer", sortOrder: 3, external: false },
    { locale: "nl", label: "NIS2-richtlijn", href: "/nis2", placement: "footer", sortOrder: 4, external: false },
    { locale: "nl", label: "IEC 62443", href: "/iec-62443", placement: "footer", sortOrder: 5, external: false },
    { locale: "nl", label: "TS 50701", href: "/ts-50701", placement: "footer", sortOrder: 6, external: false },
    { locale: "nl", label: "Diensten", href: "/services", placement: "footer", sortOrder: 7, external: false },
    { locale: "nl", label: "Cyber Digital Twin", href: "/cyber-digital-twin", placement: "footer", sortOrder: 8, external: false },
    { locale: "nl", label: "Fooled by Randomness", href: "/cdt-fooled-by-randomness", placement: "footer", sortOrder: 9, external: false },
    { locale: "nl", label: "Over ons", href: "/about", placement: "footer", sortOrder: 10, external: false },
    { locale: "nl", label: "Conformiteitsplatform", href: "/conformity/", placement: "footer", sortOrder: 11, external: true },
  ],
};
