// ---------------------------------------------------------------------------
// Per-route crawler meta for the HARDCODED React funnel pages (Phase 30).
//
// These routes (/product, /manufacturers, /compare, …) are code pages, not
// CMS-backed rows, so the DB-driven page-meta lookup never sees them and a
// crawler would otherwise get the generic SPA shell. This table is the single
// server-side source of per-page <title>/description/OG/JSON-LD for those
// routes, mirroring each page's client-side useSeo() copy. Keyed by SLUG (the
// locale-agnostic path without the leading slash; "" → "home").
//
// Keep the copy faithful to the page's own useSeo(pageSeo(...)) values.
// ---------------------------------------------------------------------------

export type FunnelMeta = {
  title: string;
  description: string;
  /** Optional per-page social image path; caller supplies the default. */
  ogImage?: string;
  /** Optional custom schema.org object; caller emits a WebPage default if absent. */
  jsonLd?: Record<string, unknown>;
};

type Locale = "en" | "nl";

export const FUNNEL_META: Record<Locale, Record<string, FunnelMeta>> = {
  en: {
    home: {
      title: "OXOT Conformance Platform — EU Cyber Resilience Act compliance",
      description:
        "A statutory conformity platform for the EU Cyber Resilience Act. Scope products, run conformity assessments, handle Article 14 vulnerability reporting, and produce technical documentation — with NIS2, the AI Act, RED, the Machinery Regulation, GDPR and the Data Act mapped into the same requirement catalogue.",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "OXOT",
        description:
          "A single-tenant conformity system of record for the EU Cyber Resilience Act and the surrounding cyber and product law.",
      },
    },
    product: {
      title: "The platform — OXOT Conformance Platform",
      description:
        "The shipped platform: role-aware product files, the eight-step CRA journey, incidents and statutory clocks, the verbatim statutory Library, supplier CRA management for operators, and reports — one record, every regulation.",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "OXOT Conformance Platform",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web, on-premise, virtual machine, hardware appliance",
        offers: { "@type": "Offer", availability: "https://schema.org/InStock" },
      },
    },
    manufacturers: {
      title: "For manufacturers — CRA technical documentation & EU Declaration of Conformity",
      description:
        "You place the product on the market, so you carry the Cyber Resilience Act. Assemble Annex I evidence, build the Annex VII technical file, self-assess under Module A, and issue the Annex V EU Declaration of Conformity — every duty citing its own article, none of it decided for you.",
    },
    operators: {
      title: "For operators & asset owners — supplier CRA management",
      description:
        "The CRA binds your suppliers; NIS2 Article 21(2)(d) makes supply-chain security your duty. Register your estate, record supplier evidence per device against the CRA’s own Article 13 duties, and chase gaps through a secure supplier door.",
    },
    compare: {
      title: "OXOT vs. IT GRC and firmware scanners — an honest comparison",
      description:
        "IT GRC suites prove SOC 2 and ISO 27001; firmware scanners count CVEs. Neither is a system of record for the Cyber Resilience Act across the whole value chain. Here is what OXOT is built for, and where the other categories structurally stop.",
    },
    "cra-transit": {
      title: "CRA Transit — the 60-day assisted conformity sprint | OXOT",
      description:
        "A one-time, consultant-led 60-day sprint to CRA conformity on a dedicated single-tenant platform: eight phases, the Annex VII technical file and EU Declaration of Conformity produced and exported as your artifacts, then the platform is taken down.",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Service",
        name: "CRA Transit",
        serviceType: "Assisted EU Cyber Resilience Act conformity sprint",
        provider: { "@type": "Organization", name: "OXOT" },
      },
    },
    deployment: {
      title: "Deployment — OXOT Conformance Platform",
      description:
        "Single tenant, always. Run it in the AWS European Sovereign Cloud, as a delivered hardware appliance, on Docker on your own infrastructure, or as a virtual machine — with a local island-mode AI, so your evidence never leaves your control.",
    },
    tour: {
      title: "Watch the 90-second product tour — OXOT Conformance Platform",
      description:
        "A 90-second tour of the OXOT Conformance Platform: the product dossier, the nine-act obligation engine, verbatim law, operator supplier management, single-tenant local-AI deployment, and CRA Transit.",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        name: "OXOT Conformance Platform — product tour",
        description:
          "A guided tour of the OXOT Conformance Platform across the nine acts, the verbatim law, operator supplier management and deployment.",
      },
    },
    pricing: {
      title: "Pricing — OXOT Conformance Platform",
      description:
        "Three tiers metered on products with digital elements under management. Fixed scope, variable price — request a quote. Single-tenant, always.",
    },
    resources: {
      title: "Resources — OXOT Conformance Platform",
      description:
        "Spec sheet and sales sheet for the CRA Conformance Application, plus the CRA primer, live regulatory news, knowledge hub and official European Commission CRA FAQs.",
    },
    "cra-check": {
      title: "The 2-minute CRA readiness check — OXOT",
      description:
        "A short, honest self-check for the EU Cyber Resilience Act: does it apply to your product, which obligations bite, and by when. No verdict on conformity — that judgement is not a checklist’s to make.",
    },
    wiki: {
      title: "EU cyber & product law, full text and browsable — the OXOT reading room",
      description:
        "Every EU cyber and product regulation we cover — the CRA, NIS2, the AI Act, RED, the Machinery Regulation, GDPR and the Data Act — in full, verbatim, character-exact and browsable.",
    },
    "wiki/cra": {
      title: "The Cyber Resilience Act — full verbatim text | OXOT reading room",
      description:
        "The EU Cyber Resilience Act (Regulation (EU) 2024/2847) in full: articles, annexes and recitals, character-exact and browsable, with the essential requirements and reporting duties in the law’s own words.",
    },
    "wiki/nis2": {
      title: "The NIS2 Directive — full verbatim text | OXOT reading room",
      description:
        "The NIS2 Directive (Directive (EU) 2022/2555) in full: the risk-management measures of Article 21, the reporting duties, and the scope of essential and important entities, character-exact and browsable.",
    },
    "wiki/ai-act": {
      title: "The EU AI Act — full verbatim text | OXOT reading room",
      description:
        "The EU AI Act (Regulation (EU) 2024/1689) in full: the risk-based framework, provider and deployer obligations, and the high-risk requirements, character-exact and browsable.",
    },
    "wiki/machinery": {
      title: "The Machinery Regulation — full verbatim text | OXOT reading room",
      description:
        "The Machinery Regulation (Regulation (EU) 2023/1230) in full: the essential health and safety requirements and conformity routes for machinery, character-exact and browsable.",
    },
    "wiki/red": {
      title: "The Radio Equipment Directive — full verbatim text | OXOT reading room",
      description:
        "The Radio Equipment Directive (Directive 2014/53/EU) in full, including the Article 3(3) cybersecurity essential requirements activated by the delegated regulation, character-exact and browsable.",
    },
    "wiki/gdpr": {
      title: "The GDPR — full verbatim text | OXOT reading room",
      description:
        "The General Data Protection Regulation (Regulation (EU) 2016/679) in full: the principles, controller and processor duties and data-subject rights, character-exact and browsable, with corrigenda disclosed where you read them.",
    },
    "wiki/data-act": {
      title: "The Data Act — full verbatim text | OXOT reading room",
      description:
        "The Data Act (Regulation (EU) 2023/2854) in full: access to and sharing of connected-product data and the obligations it places on data holders, character-exact and browsable.",
    },
  },
  nl: {
    home: {
      title: "OXOT Conformance Platform — naleving EU Cyber Resilience Act",
      description:
        "Een wettelijk conformiteitsplatform voor de EU Cyber Resilience Act. Baken producten af, voer conformiteitsbeoordelingen uit, handel kwetsbaarheidsmeldingen onder artikel 14 af, en stel technische documentatie op — met NIS2, de AI-verordening, RED, de Machineverordening, de AVG en de Data Act in dezelfde eisencatalogus.",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Organization",
        name: "OXOT",
        description:
          "Een single-tenant conformiteitsregistratiesysteem voor de EU Cyber Resilience Act en de omringende cyber- en productwetgeving.",
      },
    },
    product: {
      title: "Het platform — OXOT Conformance Platform",
      description:
        "Het geleverde platform: rolbewuste productdossiers, het CRA-traject van acht stappen, incidenten en wettelijke klokken, de woordelijke wettenbibliotheek, CRA-leveranciersbeheer voor exploitanten, en rapporten — één dossier, elke verordening.",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        name: "OXOT Conformance Platform",
        applicationCategory: "BusinessApplication",
        operatingSystem: "Web, on-premise, virtuele machine, hardware-appliance",
        offers: { "@type": "Offer", availability: "https://schema.org/InStock" },
      },
    },
    manufacturers: {
      title: "Voor fabrikanten — CRA technische documentatie & EU-conformiteitsverklaring",
      description:
        "U brengt het product op de markt, dus u draagt de Cyber Resilience Act. Verzamel Bijlage I-bewijs, stel het technisch dossier van Bijlage VII op, beoordeel zelf onder Module A, en geef de EU-conformiteitsverklaring van Bijlage V uit — elke plicht met eigen artikelverwijzing, niets ervan voor u beslist.",
    },
    operators: {
      title: "Voor exploitanten & asset owners — CRA-leveranciersbeheer",
      description:
        "De CRA bindt uw leveranciers; NIS2 artikel 21(2)(d) maakt de beveiliging van de toeleveringsketen uw plicht. Registreer uw installatiebestand, leg leveranciersbewijs per apparaat vast tegen de eigen artikel 13-plichten van de CRA, en vraag het ontbrekende op via een beveiligde leveranciersdeur.",
    },
    compare: {
      title: "OXOT versus IT-GRC en firmwarescanners — een eerlijke vergelijking",
      description:
        "IT-GRC-suites bewijzen SOC 2 en ISO 27001; firmwarescanners tellen CVE’s. Geen van beide is een registratiesysteem voor de Cyber Resilience Act over de hele waardeketen. Dit is waarvoor OXOT is gebouwd, en waar de andere categorieën structureel ophouden.",
    },
    "cra-transit": {
      title: "CRA Transit — de begeleide conformiteitssprint van 60 dagen | OXOT",
      description:
        "Een eenmalige, door consultants geleide sprint van 60 dagen naar CRA-conformiteit op een dedicated single-tenant platform: acht fasen, het technisch dossier van Bijlage VII en de EU-conformiteitsverklaring geproduceerd en geëxporteerd als uw artefacten, waarna het platform wordt afgebroken.",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "Service",
        name: "CRA Transit",
        serviceType: "Begeleide conformiteitssprint EU Cyber Resilience Act",
        provider: { "@type": "Organization", name: "OXOT" },
      },
    },
    deployment: {
      title: "Implementatie — OXOT Conformance Platform",
      description:
        "Altijd single tenant. Draai het in de AWS European Sovereign Cloud, als geleverde hardware-appliance, met Docker op uw eigen infrastructuur, of als virtuele machine — met een lokale island-mode-AI, zodat uw bewijs nooit uw beheer verlaat.",
    },
    tour: {
      title: "Bekijk de rondleiding van 90 seconden — OXOT Conformance Platform",
      description:
        "Een rondleiding van 90 seconden door het OXOT Conformance Platform: het productdossier, de obligatie-engine over negen wetten, woordelijke wetgeving, leveranciersbeheer voor exploitanten, single-tenant lokale-AI-implementatie, en CRA Transit.",
      jsonLd: {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        name: "OXOT Conformance Platform — productrondleiding",
        description:
          "Een geleide rondleiding door het OXOT Conformance Platform over de negen wetten, de woordelijke wetgeving, leveranciersbeheer voor exploitanten en implementatie.",
      },
    },
    pricing: {
      title: "Prijzen — OXOT Conformance Platform",
      description:
        "Drie tiers, gemeten op producten met digitale elementen die u beheert. Vaste scope, variabele prijs — vraag een offerte aan. Altijd single-tenant.",
    },
    resources: {
      title: "Bronnen — OXOT Conformance Platform",
      description:
        "Specificatieblad en verkoopblad voor de CRA Conformance-applicatie, plus de CRA-primer, live regelgevingsnieuws, kenniscentrum en officiële Europese Commissie CRA-veelgestelde vragen.",
    },
    "cra-check": {
      title: "De CRA-gereedheidscheck van 2 minuten — OXOT",
      description:
        "Een korte, eerlijke zelfcheck voor de EU Cyber Resilience Act: geldt hij voor uw product, welke verplichtingen bijten, en tegen wanneer. Geen oordeel over conformiteit — dat oordeel is niet aan een checklist.",
    },
    wiki: {
      title: "EU cyber- en productwetgeving, volledige tekst en doorzoekbaar — het OXOT-leescentrum",
      description:
        "Elke EU cyber- en productverordening die wij behandelen — de CRA, NIS2, de AI-verordening, RED, de Machineverordening, de AVG en de Data Act — volledig, woordelijk, tekengetrouw en doorzoekbaar.",
    },
    "wiki/cra": {
      title: "De Cyber Resilience Act — volledige woordelijke tekst | OXOT-leescentrum",
      description:
        "De EU Cyber Resilience Act (Verordening (EU) 2024/2847) volledig: artikelen, bijlagen en overwegingen, tekengetrouw en doorzoekbaar, met de essentiële eisen en meldingsplichten in de eigen woorden van de wet.",
    },
    "wiki/nis2": {
      title: "De NIS2-richtlijn — volledige woordelijke tekst | OXOT-leescentrum",
      description:
        "De NIS2-richtlijn (Richtlijn (EU) 2022/2555) volledig: de risicobeheersmaatregelen van artikel 21, de meldingsplichten, en de reikwijdte van essentiële en belangrijke entiteiten, tekengetrouw en doorzoekbaar.",
    },
    "wiki/ai-act": {
      title: "De EU AI-verordening — volledige woordelijke tekst | OXOT-leescentrum",
      description:
        "De EU AI-verordening (Verordening (EU) 2024/1689) volledig: het risicogebaseerde kader, de plichten van aanbieders en gebruiksverantwoordelijken, en de eisen voor hoog risico, tekengetrouw en doorzoekbaar.",
    },
    "wiki/machinery": {
      title: "De Machineverordening — volledige woordelijke tekst | OXOT-leescentrum",
      description:
        "De Machineverordening (Verordening (EU) 2023/1230) volledig: de essentiële gezondheids- en veiligheidseisen en conformiteitsroutes voor machines, tekengetrouw en doorzoekbaar.",
    },
    "wiki/red": {
      title: "De Radioapparatuurrichtlijn — volledige woordelijke tekst | OXOT-leescentrum",
      description:
        "De Radioapparatuurrichtlijn (Richtlijn 2014/53/EU) volledig, inclusief de cybersecurity-essentiële eisen van artikel 3(3) die door de gedelegeerde verordening worden geactiveerd, tekengetrouw en doorzoekbaar.",
    },
    "wiki/gdpr": {
      title: "De AVG — volledige woordelijke tekst | OXOT-leescentrum",
      description:
        "De Algemene verordening gegevensbescherming (Verordening (EU) 2016/679) volledig: de beginselen, de plichten van verwerkingsverantwoordelijken en verwerkers en de rechten van betrokkenen, tekengetrouw en doorzoekbaar, met rectificaties vermeld waar u leest.",
    },
    "wiki/data-act": {
      title: "De Data Act — volledige woordelijke tekst | OXOT-leescentrum",
      description:
        "De Data Act (Verordening (EU) 2023/2854) volledig: toegang tot en het delen van gegevens van verbonden producten en de plichten die dit oplegt aan datahouders, tekengetrouw en doorzoekbaar.",
    },
  },
};

/**
 * Normalise a raw request path into { locale, slug } the way the crawler
 * middleware does: a leading "/nl" selects Dutch; the remainder trims to a slug,
 * with "" meaning the homepage ("home").
 */
export function pathToLocaleSlug(rawPath: string): { locale: Locale; slug: string } {
  const path = (rawPath.split("?")[0] || "/").replace(/\/+$/, "") || "/";
  let locale: Locale = "en";
  let rest = path;
  if (path === "/nl" || path.startsWith("/nl/")) {
    locale = "nl";
    rest = path.slice(3) || "/";
  }
  const trimmed = rest.replace(/^\/+/, "");
  return { locale, slug: trimmed === "" ? "home" : trimmed };
}

/** Paths that are app shells / assets, never crawler content pages. */
export function isNonPagePath(rawPath: string): boolean {
  const { slug } = pathToLocaleSlug(rawPath);
  if (slug === "home") return false;
  const first = slug.split("/")[0]!;
  if (["admin", "api", "newsletter", "assets", "src", "node_modules"].includes(first)) return true;
  // Anything that looks like a file (has an extension) is a static asset.
  if (/\.[a-z0-9]+$/i.test(slug)) return true;
  return false;
}

export function funnelMetaFor(locale: Locale, slug: string): FunnelMeta | null {
  return FUNNEL_META[locale]?.[slug] ?? null;
}
