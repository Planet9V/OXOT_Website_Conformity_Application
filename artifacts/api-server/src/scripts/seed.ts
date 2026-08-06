/**
 * Seeds the OXOT foundation content: bilingual site settings, navigation, and
 * database-driven pages (home, services, approach, about, contact) with rich,
 * varied sections. Idempotent — clears the content tables before inserting.
 *
 * Run with: pnpm --filter @workspace/api-server run seed
 */
import {
  db,
  pool,
  siteSettingsTable,
  navItemsTable,
  pagesTable,
  pageSectionsTable,
} from "@workspace/db";

const logger = {
  info: (msg: string) => process.stdout.write(`${msg}\n`),
  error: (ctx: unknown, msg: string) =>
    process.stderr.write(`${msg}: ${JSON.stringify(ctx)}\n`),
};

type Locale = "en" | "nl";
type Section = { type: string; data: Record<string, unknown> };
type PageSeed = {
  slug: string;
  title: string;
  seoTitle: string;
  seoDescription: string;
  sections: Section[];
};

const REGULATIONS = [
  "Cyber Resilience Act",
  "EU AI Act",
  "Machinery Regulation 2023/1230",
  "IEC 62443",
  "NIS2 Directive",
  "Radio Equipment Directive",
];

const settings: Record<Locale, typeof siteSettingsTable.$inferInsert> = {
  en: {
    locale: "en",
    siteName: "OXOT",
    tagline: "Operational eXcellence in Operational Technology",
    description:
      "Multi-regulation conformity automation and expert consulting for industrial, OT and AI product makers — CRA, AI Act, Machinery Regulation and IEC 62443, in one evidence system.",
    contactEmail: "hello@oxot.eu",
    footerText:
      "OXOT turns overlapping EU regulations into a single, living evidence system — so your teams ship compliant products without drowning in paperwork.",
    socialLinks: [
      { platform: "linkedin", url: "https://www.linkedin.com/company/oxot" },
      { platform: "x", url: "https://x.com/oxot" },
    ],
  },
  nl: {
    locale: "nl",
    siteName: "OXOT",
    tagline: "Operationele eXcellentie in Operationele Technologie",
    description:
      "Multi-regelgeving conformiteitsautomatisering en advies voor makers van industriële, OT- en AI-producten — CRA, AI Act, Machineverordening en IEC 62443, in één bewijssysteem.",
    contactEmail: "hallo@oxot.eu",
    footerText:
      "OXOT verandert overlappende EU-regelgeving in één levend bewijssysteem — zodat uw teams conforme producten leveren zonder te verdrinken in papierwerk.",
    socialLinks: [
      { platform: "linkedin", url: "https://www.linkedin.com/company/oxot" },
      { platform: "x", url: "https://x.com/oxot" },
    ],
  },
};

const navigation: Record<Locale, Array<typeof navItemsTable.$inferInsert>> = {
  en: [
    { locale: "en", label: "Services", href: "/services", placement: "header", sortOrder: 1, external: false },
    { locale: "en", label: "Approach", href: "/approach", placement: "header", sortOrder: 2, external: false },
    { locale: "en", label: "About", href: "/about", placement: "header", sortOrder: 3, external: false },
    { locale: "en", label: "Contact", href: "/contact", placement: "header", sortOrder: 4, external: false },
    { locale: "en", label: "Services", href: "/services", placement: "footer", sortOrder: 1, external: false },
    { locale: "en", label: "Approach", href: "/approach", placement: "footer", sortOrder: 2, external: false },
    { locale: "en", label: "About", href: "/about", placement: "footer", sortOrder: 3, external: false },
    { locale: "en", label: "Contact", href: "/contact", placement: "footer", sortOrder: 4, external: false },
  ],
  nl: [
    { locale: "nl", label: "Diensten", href: "/services", placement: "header", sortOrder: 1, external: false },
    { locale: "nl", label: "Aanpak", href: "/approach", placement: "header", sortOrder: 2, external: false },
    { locale: "nl", label: "Over ons", href: "/about", placement: "header", sortOrder: 3, external: false },
    { locale: "nl", label: "Contact", href: "/contact", placement: "header", sortOrder: 4, external: false },
    { locale: "nl", label: "Diensten", href: "/services", placement: "footer", sortOrder: 1, external: false },
    { locale: "nl", label: "Aanpak", href: "/approach", placement: "footer", sortOrder: 2, external: false },
    { locale: "nl", label: "Over ons", href: "/about", placement: "footer", sortOrder: 3, external: false },
    { locale: "nl", label: "Contact", href: "/contact", placement: "footer", sortOrder: 4, external: false },
  ],
};

const pages: Record<Locale, PageSeed[]> = {
  en: [
    {
      slug: "home",
      title: "OXOT — Operational eXcellence in Operational Technology",
      seoTitle: "OXOT — Multi-regulation conformity for OT & AI products",
      seoDescription:
        "One evidence system for CRA, the AI Act, the Machinery Regulation and IEC 62443. Automation plus expert consulting for industrial, OT and AI product makers.",
      sections: [
        {
          type: "hero",
          data: {
            eyebrow: "Compliance, engineered",
            title: "Four regulations. One evidence system.",
            subtitle:
              "OXOT unifies the Cyber Resilience Act, the AI Act, the Machinery Regulation and IEC 62443 into a single, living source of conformity evidence — so your teams prove compliance instead of chasing it.",
            primaryCta: { label: "Explore the platform", href: "/services" },
            secondaryCta: { label: "See our approach", href: "/approach" },
            bullets: [
              "Overlap mapped once, reused everywhere",
              "Audit-ready evidence, always current",
              "Engineers stay in their tools",
            ],
          },
        },
        {
          type: "logo_wall",
          data: {
            title: "Built for the regulations reshaping industrial products",
            logos: REGULATIONS.map((name) => ({ name })),
          },
        },
        {
          type: "stat_band",
          data: {
            stats: [
              { value: "4-in-1", label: "regulations", sublabel: "mapped to one control set" },
              { value: "70%", label: "less duplicate work", sublabel: "across overlapping requirements" },
              { value: "Weeks", label: "not quarters", sublabel: "to an audit-ready dossier" },
              { value: "100%", label: "traceable", sublabel: "every claim linked to evidence" },
            ],
          },
        },
        {
          type: "feature_grid",
          data: {
            eyebrow: "The platform",
            title: "Everything a conformity dossier needs, in one place",
            subtitle:
              "Stop maintaining four parallel spreadsheets. OXOT models the shared reality underneath every regulation and keeps it current as your product evolves.",
            features: [
              { title: "Unified control library", description: "One requirement model spanning CRA, AI Act, Machinery and IEC 62443 — mapped, deduplicated and versioned.", icon: "Library" },
              { title: "Living evidence", description: "Link tickets, tests, SBOMs and design docs to controls. Evidence updates as your product does.", icon: "FileCheck" },
              { title: "Gap detection", description: "See exactly which obligations are covered, partial or open — per product, per regulation, in real time.", icon: "ScanSearch" },
              { title: "Audit-ready export", description: "Generate a structured technical file and declaration of conformity your notified body can actually follow.", icon: "FileOutput" },
              { title: "Risk & threat modeling", description: "Structured risk assessments aligned to IEC 62443 and the AI Act, reusable across product lines.", icon: "ShieldAlert" },
              { title: "Expert in the loop", description: "OXOT consultants review your dossier and coach your team — the platform never leaves you alone with the hard calls.", icon: "Users" },
            ],
          },
        },
        {
          type: "two_column",
          data: {
            eyebrow: "The problem",
            title: "The regulations overlap. Your tooling doesn't.",
            body:
              "CRA wants secure-by-design evidence. IEC 62443 wants the same, in its own language. The Machinery Regulation adds safety. The AI Act adds risk management. Most teams answer each one separately — and pay for the same work four times.",
            bullets: [
              "Duplicate requirements re-documented per framework",
              "Evidence that goes stale the moment code ships",
              "No single view of what is actually covered",
            ],
            cta: { label: "See how we fix it", href: "/approach" },
            reverse: false,
          },
        },
        {
          type: "two_column",
          data: {
            eyebrow: "The shift",
            title: "Prove conformity as a by-product of building",
            body:
              "OXOT maps every obligation to a shared control once, then wires those controls to the evidence your teams already produce. Compliance stops being a project and becomes a property of how you work.",
            bullets: [
              "One control satisfies many regulations",
              "Engineers contribute evidence without leaving their tools",
              "Leadership sees conformity status at a glance",
            ],
            cta: { label: "Explore services", href: "/services" },
            reverse: true,
          },
        },
        {
          type: "comparison_table",
          data: {
            eyebrow: "Why OXOT",
            title: "One system versus four silos",
            subtitle: "What changes when overlapping regulations share a single evidence backbone.",
            columns: ["Four separate efforts", "OXOT unified system"],
            rows: [
              { label: "Requirement mapping", values: ["Repeated per regulation", true] },
              { label: "Evidence freshness", values: ["Manual, drifts quickly", true] },
              { label: "Cross-regulation reuse", values: [false, true] },
              { label: "Audit preparation", values: ["Quarter-long scramble", true] },
              { label: "Expert guidance", values: ["Ad-hoc consultants", true] },
              { label: "Real-time coverage view", values: [false, true] },
            ],
          },
        },
        {
          type: "steps",
          data: {
            eyebrow: "How it works",
            title: "From scattered documents to a living dossier",
            steps: [
              { number: "01", title: "Scope", description: "We map your products to the regulations that apply and the controls they share." },
              { number: "02", title: "Connect", description: "Evidence sources — tests, SBOMs, risk assessments — are wired into the control model." },
              { number: "03", title: "Close gaps", description: "OXOT surfaces what's open; our experts help you close it efficiently." },
              { number: "04", title: "Sustain", description: "The dossier stays current automatically, ready for audit at any moment." },
            ],
          },
        },
        {
          type: "quote",
          data: {
            quote:
              "We used to treat every regulation as a separate fire drill. With OXOT the evidence writes itself once and answers all of them.",
            author: "Head of Product Security",
            role: "Industrial automation vendor",
          },
        },
        {
          type: "faq",
          data: {
            eyebrow: "Questions",
            title: "What teams ask before starting",
            items: [
              { question: "Which regulations does OXOT cover?", answer: "The Cyber Resilience Act, the EU AI Act, the Machinery Regulation (2023/1230) and IEC 62443, with adjacent frameworks like NIS2 mapped in." },
              { question: "Is this software or consulting?", answer: "Both. The platform maintains your evidence; OXOT experts review dossiers and guide your team through the hard decisions." },
              { question: "Do our engineers have to learn a new tool?", answer: "Minimally. Evidence is pulled from the systems they already use, so contribution happens in the flow of their work." },
              { question: "How quickly can we be audit-ready?", answer: "Most teams reach an audit-ready dossier in weeks rather than quarters, because overlapping work is only done once." },
            ],
          },
        },
        {
          type: "cta",
          data: {
            title: "See your conformity status in one view",
            subtitle: "Book a walkthrough and we'll map your products to the regulations that matter.",
            primaryCta: { label: "Talk to OXOT", href: "/contact" },
            secondaryCta: { label: "Explore services", href: "/services" },
          },
        },
      ],
    },
    {
      slug: "services",
      title: "Services — OXOT",
      seoTitle: "OXOT services — conformity platform & expert consulting",
      seoDescription:
        "Conformity automation, risk & threat modeling, technical file preparation and hands-on consulting across CRA, AI Act, Machinery Regulation and IEC 62443.",
      sections: [
        {
          type: "hero",
          data: {
            eyebrow: "Services",
            title: "Platform plus people, from scoping to audit",
            subtitle:
              "OXOT combines a unified conformity platform with senior consultants who know how notified bodies actually read a technical file.",
            primaryCta: { label: "Talk to us", href: "/contact" },
            secondaryCta: { label: "See our approach", href: "/approach" },
            bullets: ["Multi-regulation coverage", "Reusable across product lines", "Senior experts on call"],
          },
        },
        {
          type: "feature_grid",
          data: {
            eyebrow: "What we deliver",
            title: "A complete conformity capability",
            subtitle: "Engagements scale from a single product to an entire portfolio.",
            features: [
              { title: "Conformity platform", description: "The unified control library, evidence links and coverage dashboards at the core of everything.", icon: "LayoutDashboard" },
              { title: "Risk & threat modeling", description: "Structured assessments aligned to IEC 62443 and the AI Act's risk-management obligations.", icon: "ShieldAlert" },
              { title: "Technical file preparation", description: "Audit-ready dossiers and declarations of conformity, structured for the notified body.", icon: "FileOutput" },
              { title: "Gap assessments", description: "Where you stand today against each regulation, with a prioritized path to close.", icon: "ScanSearch" },
              { title: "Team enablement", description: "We coach your engineers so compliance becomes a habit, not a bottleneck.", icon: "GraduationCap" },
              { title: "Ongoing surveillance", description: "Keep dossiers current as products and regulations evolve.", icon: "Radar" },
            ],
          },
        },
        {
          type: "comparison_table",
          data: {
            eyebrow: "Engagement models",
            title: "Choose how deep we go",
            subtitle: "From a one-off gap assessment to a fully managed conformity function.",
            columns: ["Assess", "Build", "Sustain"],
            rows: [
              { label: "Regulation gap analysis", values: [true, true, true] },
              { label: "Unified control library", values: [false, true, true] },
              { label: "Evidence automation", values: [false, true, true] },
              { label: "Technical file delivery", values: [false, true, true] },
              { label: "Continuous surveillance", values: [false, false, true] },
              { label: "Dedicated expert", values: [false, false, true] },
            ],
          },
        },
        {
          type: "steps",
          data: {
            eyebrow: "Engagement",
            title: "A predictable path to compliance",
            steps: [
              { number: "01", title: "Discover", description: "We scope your products, markets and applicable regulations." },
              { number: "02", title: "Assess", description: "A clear picture of coverage and gaps across every framework." },
              { number: "03", title: "Implement", description: "Controls, evidence and dossiers built on the OXOT platform." },
              { number: "04", title: "Operate", description: "Ongoing surveillance keeps you audit-ready as things change." },
            ],
          },
        },
        {
          type: "cta",
          data: {
            title: "Find the right engagement for your team",
            subtitle: "Tell us what you build and we'll propose a path.",
            primaryCta: { label: "Contact OXOT", href: "/contact" },
          },
        },
      ],
    },
    {
      slug: "approach",
      title: "Approach — OXOT",
      seoTitle: "OXOT approach — one evidence system for many regulations",
      seoDescription:
        "How OXOT maps overlapping EU regulations to a shared control model and keeps conformity evidence current automatically.",
      sections: [
        {
          type: "hero",
          data: {
            eyebrow: "Approach",
            title: "Map once. Prove many times.",
            subtitle:
              "Our method treats overlapping regulations as one problem with a shared solution, not four problems solved in isolation.",
            primaryCta: { label: "See services", href: "/services" },
            secondaryCta: { label: "Talk to us", href: "/contact" },
            bullets: ["Shared control model", "Evidence-first", "Expert-reviewed"],
          },
        },
        {
          type: "two_column",
          data: {
            eyebrow: "Principle one",
            title: "A single control model beneath every regulation",
            body:
              "We express each obligation as a control, then identify where CRA, IEC 62443, the Machinery Regulation and the AI Act ask for the same thing. Satisfy the control once and it counts everywhere it applies.",
            bullets: ["Deduplicated requirements", "Versioned as regulations change", "Traceable to every source clause"],
            reverse: false,
          },
        },
        {
          type: "two_column",
          data: {
            eyebrow: "Principle two",
            title: "Evidence flows from how you already build",
            body:
              "Compliance fails when evidence is a separate chore. We connect controls to the artifacts your teams already produce — tests, SBOMs, design records — so proof accumulates as a by-product of engineering.",
            bullets: ["No parallel documentation", "Always-current status", "Engineers stay in their tools"],
            reverse: true,
          },
        },
        {
          type: "stat_band",
          data: {
            stats: [
              { value: "1", label: "control model", sublabel: "for every regulation" },
              { value: "Live", label: "coverage", sublabel: "not a point-in-time snapshot" },
              { value: "Expert", label: "reviewed", sublabel: "before every audit" },
            ],
          },
        },
        {
          type: "quote",
          data: {
            quote: "The moment we stopped documenting each regulation separately, the whole thing became manageable.",
            author: "VP Engineering",
            role: "OT device manufacturer",
          },
        },
        {
          type: "cta",
          data: {
            title: "Put the method to work",
            subtitle: "We'll show you the shared control model for your products.",
            primaryCta: { label: "Book a walkthrough", href: "/contact" },
          },
        },
      ],
    },
    {
      slug: "about",
      title: "About — OXOT",
      seoTitle: "About OXOT — operational excellence in operational technology",
      seoDescription:
        "OXOT helps industrial, OT and AI product makers turn EU regulation into engineered, evidence-based conformity.",
      sections: [
        {
          type: "hero",
          data: {
            eyebrow: "About",
            title: "Compliance people who think like engineers",
            subtitle:
              "OXOT was founded on a simple belief: conformity should be designed and measured, not improvised under deadline pressure.",
            primaryCta: { label: "Work with us", href: "/contact" },
            bullets: ["OT & industrial focus", "Regulation-deep", "Evidence-obsessed"],
          },
        },
        {
          type: "two_column",
          data: {
            eyebrow: "Why we exist",
            title: "The regulatory wave is only getting bigger",
            body:
              "The CRA, the AI Act and the new Machinery Regulation arrive together, on top of established standards like IEC 62443. OXOT exists so that makers of physical and intelligent products can meet all of it without slowing down.",
            bullets: ["Deep regulatory expertise", "Platform-backed rigor", "A partner, not a paperwork vendor"],
            reverse: false,
          },
        },
        {
          type: "stat_band",
          data: {
            stats: [
              { value: "OT-first", label: "focus", sublabel: "industrial & intelligent products" },
              { value: "4+", label: "regulations", sublabel: "under one roof" },
              { value: "EU-wide", label: "scope", sublabel: "notified-body ready" },
            ],
          },
        },
        {
          type: "cta",
          data: {
            title: "Let's make your next product compliant by design",
            subtitle: "Tell us what you're building.",
            primaryCta: { label: "Contact OXOT", href: "/contact" },
          },
        },
      ],
    },
    {
      slug: "contact",
      title: "Contact — OXOT",
      seoTitle: "Contact OXOT",
      seoDescription: "Talk to OXOT about multi-regulation conformity for your OT and AI products.",
      sections: [
        {
          type: "hero",
          data: {
            eyebrow: "Contact",
            title: "Let's map your conformity, together",
            subtitle:
              "Tell us what you build and which markets you sell into. We'll show you how CRA, the AI Act, the Machinery Regulation and IEC 62443 apply — and how OXOT handles them as one.",
            primaryCta: { label: "Ask the OXOT assistant", href: "/" },
            bullets: ["No obligation walkthrough", "Senior experts, not a call center", "Answers specific to your products"],
          },
        },
        {
          type: "two_column",
          data: {
            eyebrow: "Reach us",
            title: "A conversation beats a contact form",
            body:
              "The fastest way to understand your obligations is to talk them through. Reach out and a senior OXOT consultant will get back to you — usually within one business day.",
            bullets: ["hello@oxot.eu", "Based in the EU", "English & Dutch"],
            reverse: true,
          },
        },
        {
          type: "cta",
          data: {
            title: "Ready when you are",
            subtitle: "Start the conversation and see your regulations in one view.",
            primaryCta: { label: "Get in touch", href: "mailto:hello@oxot.eu" },
          },
        },
      ],
    },
  ],
  nl: [
    {
      slug: "home",
      title: "OXOT — Operationele eXcellentie in Operationele Technologie",
      seoTitle: "OXOT — Multi-regelgeving conformiteit voor OT- en AI-producten",
      seoDescription:
        "Eén bewijssysteem voor CRA, de AI Act, de Machineverordening en IEC 62443. Automatisering plus advies voor makers van industriële, OT- en AI-producten.",
      sections: [
        {
          type: "hero",
          data: {
            eyebrow: "Conformiteit, doordacht",
            title: "Vier regelgevingen. Eén bewijssysteem.",
            subtitle:
              "OXOT verenigt de Cyber Resilience Act, de AI Act, de Machineverordening en IEC 62443 in één levende bron van conformiteitsbewijs — zodat uw teams conformiteit aantonen in plaats van najagen.",
            primaryCta: { label: "Ontdek het platform", href: "/services" },
            secondaryCta: { label: "Bekijk onze aanpak", href: "/approach" },
            bullets: [
              "Overlap eenmaal in kaart, overal hergebruikt",
              "Auditklaar bewijs, altijd actueel",
              "Ingenieurs blijven in hun tools",
            ],
          },
        },
        {
          type: "logo_wall",
          data: {
            title: "Gebouwd voor de regelgeving die industriële producten hervormt",
            logos: REGULATIONS.map((name) => ({ name })),
          },
        },
        {
          type: "stat_band",
          data: {
            stats: [
              { value: "4-in-1", label: "regelgevingen", sublabel: "op één set controles" },
              { value: "70%", label: "minder dubbel werk", sublabel: "over overlappende eisen" },
              { value: "Weken", label: "geen kwartalen", sublabel: "tot een auditklaar dossier" },
              { value: "100%", label: "traceerbaar", sublabel: "elke claim gekoppeld aan bewijs" },
            ],
          },
        },
        {
          type: "feature_grid",
          data: {
            eyebrow: "Het platform",
            title: "Alles wat een conformiteitsdossier nodig heeft, op één plek",
            subtitle:
              "Stop met het bijhouden van vier parallelle spreadsheets. OXOT modelleert de gedeelde werkelijkheid onder elke regelgeving en houdt die actueel terwijl uw product evolueert.",
            features: [
              { title: "Uniforme controlebibliotheek", description: "Eén eisenmodel over CRA, AI Act, Machinerichtlijn en IEC 62443 — gekoppeld, ontdubbeld en geversioneerd.", icon: "Library" },
              { title: "Levend bewijs", description: "Koppel tickets, tests, SBOM's en ontwerpdocumenten aan controles. Bewijs werkt mee met uw product.", icon: "FileCheck" },
              { title: "Gatdetectie", description: "Zie precies welke verplichtingen gedekt, gedeeltelijk of open zijn — per product, per regelgeving, realtime.", icon: "ScanSearch" },
              { title: "Auditklare export", description: "Genereer een gestructureerd technisch dossier en conformiteitsverklaring die uw aangemelde instantie kan volgen.", icon: "FileOutput" },
              { title: "Risico- en dreigingsmodellering", description: "Gestructureerde risicoanalyses conform IEC 62443 en de AI Act, herbruikbaar over productlijnen.", icon: "ShieldAlert" },
              { title: "Expert in de lus", description: "OXOT-consultants beoordelen uw dossier en coachen uw team — het platform laat u nooit alleen met de moeilijke keuzes.", icon: "Users" },
            ],
          },
        },
        {
          type: "two_column",
          data: {
            eyebrow: "Het probleem",
            title: "De regelgeving overlapt. Uw tooling niet.",
            body:
              "CRA wil secure-by-design bewijs. IEC 62443 wil hetzelfde, in eigen taal. De Machineverordening voegt veiligheid toe. De AI Act voegt risicobeheer toe. De meeste teams beantwoorden elk apart — en betalen vier keer voor hetzelfde werk.",
            bullets: [
              "Dubbele eisen per raamwerk opnieuw gedocumenteerd",
              "Bewijs dat veroudert zodra code live gaat",
              "Geen enkel overzicht van wat werkelijk gedekt is",
            ],
            cta: { label: "Zie hoe wij dit oplossen", href: "/approach" },
            reverse: false,
          },
        },
        {
          type: "two_column",
          data: {
            eyebrow: "De omslag",
            title: "Toon conformiteit als bijproduct van het bouwen",
            body:
              "OXOT koppelt elke verplichting eenmalig aan een gedeelde controle en verbindt die controles met het bewijs dat uw teams al produceren. Conformiteit is geen project meer, maar een eigenschap van hoe u werkt.",
            bullets: [
              "Eén controle voldoet aan meerdere regelgevingen",
              "Ingenieurs leveren bewijs zonder hun tools te verlaten",
              "Leiding ziet de conformiteitsstatus in één oogopslag",
            ],
            cta: { label: "Ontdek diensten", href: "/services" },
            reverse: true,
          },
        },
        {
          type: "comparison_table",
          data: {
            eyebrow: "Waarom OXOT",
            title: "Eén systeem versus vier silo's",
            subtitle: "Wat verandert wanneer overlappende regelgeving één bewijsruggengraat deelt.",
            columns: ["Vier losse trajecten", "OXOT uniform systeem"],
            rows: [
              { label: "Eisen in kaart brengen", values: ["Per regelgeving herhaald", true] },
              { label: "Actualiteit van bewijs", values: ["Handmatig, verschuift snel", true] },
              { label: "Hergebruik over regelgevingen", values: [false, true] },
              { label: "Auditvoorbereiding", values: ["Kwartaal lang haasten", true] },
              { label: "Expertbegeleiding", values: ["Ad-hoc consultants", true] },
              { label: "Realtime dekkingsoverzicht", values: [false, true] },
            ],
          },
        },
        {
          type: "steps",
          data: {
            eyebrow: "Hoe het werkt",
            title: "Van verspreide documenten naar een levend dossier",
            steps: [
              { number: "01", title: "Afbakenen", description: "We koppelen uw producten aan de van toepassing zijnde regelgeving en de gedeelde controles." },
              { number: "02", title: "Verbinden", description: "Bewijsbronnen — tests, SBOM's, risicoanalyses — worden aan het controlemodel gekoppeld." },
              { number: "03", title: "Gaten dichten", description: "OXOT toont wat open staat; onze experts helpen het efficiënt te sluiten." },
              { number: "04", title: "Onderhouden", description: "Het dossier blijft automatisch actueel, klaar voor audit op elk moment." },
            ],
          },
        },
        {
          type: "quote",
          data: {
            quote:
              "Vroeger was elke regelgeving een aparte brandoefening. Met OXOT schrijft het bewijs zich eenmaal en beantwoordt het ze allemaal.",
            author: "Hoofd Productbeveiliging",
            role: "Leverancier industriële automatisering",
          },
        },
        {
          type: "faq",
          data: {
            eyebrow: "Vragen",
            title: "Wat teams vragen voordat ze starten",
            items: [
              { question: "Welke regelgeving dekt OXOT?", answer: "De Cyber Resilience Act, de EU AI Act, de Machineverordening (2023/1230) en IEC 62443, met aangrenzende raamwerken zoals NIS2 mee in kaart." },
              { question: "Is dit software of advies?", answer: "Beide. Het platform onderhoudt uw bewijs; OXOT-experts beoordelen dossiers en begeleiden uw team bij de moeilijke keuzes." },
              { question: "Moeten onze ingenieurs een nieuwe tool leren?", answer: "Minimaal. Bewijs komt uit de systemen die zij al gebruiken, dus bijdragen gebeurt in de flow van hun werk." },
              { question: "Hoe snel zijn we auditklaar?", answer: "De meeste teams bereiken een auditklaar dossier in weken in plaats van kwartalen, omdat overlappend werk maar één keer wordt gedaan." },
            ],
          },
        },
        {
          type: "cta",
          data: {
            title: "Zie uw conformiteitsstatus in één overzicht",
            subtitle: "Boek een rondleiding en we koppelen uw producten aan de relevante regelgeving.",
            primaryCta: { label: "Praat met OXOT", href: "/contact" },
            secondaryCta: { label: "Ontdek diensten", href: "/services" },
          },
        },
      ],
    },
    {
      slug: "services",
      title: "Diensten — OXOT",
      seoTitle: "OXOT diensten — conformiteitsplatform & expertadvies",
      seoDescription:
        "Conformiteitsautomatisering, risico- en dreigingsmodellering, technisch dossier en praktisch advies over CRA, AI Act, Machineverordening en IEC 62443.",
      sections: [
        {
          type: "hero",
          data: {
            eyebrow: "Diensten",
            title: "Platform én mensen, van afbakening tot audit",
            subtitle:
              "OXOT combineert een uniform conformiteitsplatform met senior consultants die weten hoe aangemelde instanties een technisch dossier werkelijk lezen.",
            primaryCta: { label: "Neem contact op", href: "/contact" },
            secondaryCta: { label: "Bekijk onze aanpak", href: "/approach" },
            bullets: ["Multi-regelgeving dekking", "Herbruikbaar over productlijnen", "Senior experts beschikbaar"],
          },
        },
        {
          type: "feature_grid",
          data: {
            eyebrow: "Wat we leveren",
            title: "Een complete conformiteitscapaciteit",
            subtitle: "Trajecten schalen van één product tot een volledige portfolio.",
            features: [
              { title: "Conformiteitsplatform", description: "De uniforme controlebibliotheek, bewijskoppelingen en dekkingsdashboards als kern van alles.", icon: "LayoutDashboard" },
              { title: "Risico- en dreigingsmodellering", description: "Gestructureerde analyses conform IEC 62443 en de risicoverplichtingen van de AI Act.", icon: "ShieldAlert" },
              { title: "Technisch dossier", description: "Auditklare dossiers en conformiteitsverklaringen, gestructureerd voor de aangemelde instantie.", icon: "FileOutput" },
              { title: "Gatanalyses", description: "Waar u vandaag staat ten opzichte van elke regelgeving, met een geprioriteerd pad om te sluiten.", icon: "ScanSearch" },
              { title: "Teamversterking", description: "We coachen uw ingenieurs zodat conformiteit een gewoonte wordt, geen knelpunt.", icon: "GraduationCap" },
              { title: "Doorlopend toezicht", description: "Houd dossiers actueel terwijl producten en regelgeving evolueren.", icon: "Radar" },
            ],
          },
        },
        {
          type: "comparison_table",
          data: {
            eyebrow: "Samenwerkingsvormen",
            title: "Kies hoe diep we gaan",
            subtitle: "Van een eenmalige gatanalyse tot een volledig beheerde conformiteitsfunctie.",
            columns: ["Beoordelen", "Bouwen", "Onderhouden"],
            rows: [
              { label: "Gatanalyse regelgeving", values: [true, true, true] },
              { label: "Uniforme controlebibliotheek", values: [false, true, true] },
              { label: "Bewijsautomatisering", values: [false, true, true] },
              { label: "Oplevering technisch dossier", values: [false, true, true] },
              { label: "Doorlopend toezicht", values: [false, false, true] },
              { label: "Toegewijde expert", values: [false, false, true] },
            ],
          },
        },
        {
          type: "steps",
          data: {
            eyebrow: "Traject",
            title: "Een voorspelbaar pad naar conformiteit",
            steps: [
              { number: "01", title: "Ontdekken", description: "We bakenen uw producten, markten en toepasselijke regelgeving af." },
              { number: "02", title: "Beoordelen", description: "Een helder beeld van dekking en gaten over elk raamwerk." },
              { number: "03", title: "Implementeren", description: "Controles, bewijs en dossiers gebouwd op het OXOT-platform." },
              { number: "04", title: "Uitvoeren", description: "Doorlopend toezicht houdt u auditklaar naarmate zaken veranderen." },
            ],
          },
        },
        {
          type: "cta",
          data: {
            title: "Vind het juiste traject voor uw team",
            subtitle: "Vertel ons wat u bouwt en we stellen een pad voor.",
            primaryCta: { label: "Contacteer OXOT", href: "/contact" },
          },
        },
      ],
    },
    {
      slug: "approach",
      title: "Aanpak — OXOT",
      seoTitle: "OXOT aanpak — één bewijssysteem voor veel regelgevingen",
      seoDescription:
        "Hoe OXOT overlappende EU-regelgeving koppelt aan een gedeeld controlemodel en conformiteitsbewijs automatisch actueel houdt.",
      sections: [
        {
          type: "hero",
          data: {
            eyebrow: "Aanpak",
            title: "Eenmaal koppelen. Meermaals aantonen.",
            subtitle:
              "Onze methode behandelt overlappende regelgeving als één probleem met een gedeelde oplossing, niet als vier problemen apart opgelost.",
            primaryCta: { label: "Bekijk diensten", href: "/services" },
            secondaryCta: { label: "Neem contact op", href: "/contact" },
            bullets: ["Gedeeld controlemodel", "Bewijs eerst", "Door experts beoordeeld"],
          },
        },
        {
          type: "two_column",
          data: {
            eyebrow: "Principe één",
            title: "Eén controlemodel onder elke regelgeving",
            body:
              "We drukken elke verplichting uit als een controle en bepalen waar CRA, IEC 62443, de Machineverordening en de AI Act hetzelfde vragen. Voldoe eenmaal aan de controle en het telt overal waar het van toepassing is.",
            bullets: ["Ontdubbelde eisen", "Geversioneerd als regelgeving verandert", "Traceerbaar naar elke bronclausule"],
            reverse: false,
          },
        },
        {
          type: "two_column",
          data: {
            eyebrow: "Principe twee",
            title: "Bewijs vloeit voort uit hoe u al bouwt",
            body:
              "Conformiteit faalt als bewijs een aparte klus is. We koppelen controles aan de artefacten die uw teams al produceren — tests, SBOM's, ontwerpdossiers — zodat bewijs zich opbouwt als bijproduct van engineering.",
            bullets: ["Geen parallelle documentatie", "Altijd actuele status", "Ingenieurs blijven in hun tools"],
            reverse: true,
          },
        },
        {
          type: "stat_band",
          data: {
            stats: [
              { value: "1", label: "controlemodel", sublabel: "voor elke regelgeving" },
              { value: "Live", label: "dekking", sublabel: "geen momentopname" },
              { value: "Expert", label: "beoordeeld", sublabel: "voor elke audit" },
            ],
          },
        },
        {
          type: "quote",
          data: {
            quote: "Zodra we stopten met elke regelgeving apart te documenteren, werd het geheel beheersbaar.",
            author: "VP Engineering",
            role: "Fabrikant van OT-apparatuur",
          },
        },
        {
          type: "cta",
          data: {
            title: "Zet de methode aan het werk",
            subtitle: "We tonen u het gedeelde controlemodel voor uw producten.",
            primaryCta: { label: "Boek een rondleiding", href: "/contact" },
          },
        },
      ],
    },
    {
      slug: "about",
      title: "Over ons — OXOT",
      seoTitle: "Over OXOT — operationele excellentie in operationele technologie",
      seoDescription:
        "OXOT helpt makers van industriële, OT- en AI-producten om EU-regelgeving om te zetten in doordachte, bewijsgebaseerde conformiteit.",
      sections: [
        {
          type: "hero",
          data: {
            eyebrow: "Over ons",
            title: "Conformiteitsmensen die denken als ingenieurs",
            subtitle:
              "OXOT is opgericht vanuit een simpel geloof: conformiteit moet ontworpen en gemeten worden, niet geïmproviseerd onder tijdsdruk.",
            primaryCta: { label: "Werk met ons", href: "/contact" },
            bullets: ["OT- & industriefocus", "Diep in regelgeving", "Bewijs-geobsedeerd"],
          },
        },
        {
          type: "two_column",
          data: {
            eyebrow: "Waarom we bestaan",
            title: "De regelgevingsgolf wordt alleen maar groter",
            body:
              "De CRA, de AI Act en de nieuwe Machineverordening komen samen, bovenop gevestigde normen als IEC 62443. OXOT bestaat zodat makers van fysieke en intelligente producten aan alles kunnen voldoen zonder vaart te verliezen.",
            bullets: ["Diepe regelgevingsexpertise", "Platformgedreven degelijkheid", "Een partner, geen papierleverancier"],
            reverse: false,
          },
        },
        {
          type: "stat_band",
          data: {
            stats: [
              { value: "OT-eerst", label: "focus", sublabel: "industriële & intelligente producten" },
              { value: "4+", label: "regelgevingen", sublabel: "onder één dak" },
              { value: "EU-breed", label: "bereik", sublabel: "klaar voor aangemelde instantie" },
            ],
          },
        },
        {
          type: "cta",
          data: {
            title: "Laten we uw volgende product conform-by-design maken",
            subtitle: "Vertel ons wat u bouwt.",
            primaryCta: { label: "Contacteer OXOT", href: "/contact" },
          },
        },
      ],
    },
    {
      slug: "contact",
      title: "Contact — OXOT",
      seoTitle: "Contacteer OXOT",
      seoDescription: "Praat met OXOT over multi-regelgeving conformiteit voor uw OT- en AI-producten.",
      sections: [
        {
          type: "hero",
          data: {
            eyebrow: "Contact",
            title: "Laten we uw conformiteit samen in kaart brengen",
            subtitle:
              "Vertel ons wat u bouwt en in welke markten u verkoopt. We tonen u hoe CRA, de AI Act, de Machineverordening en IEC 62443 van toepassing zijn — en hoe OXOT ze als één behandelt.",
            primaryCta: { label: "Vraag de OXOT-assistent", href: "/" },
            bullets: ["Vrijblijvende rondleiding", "Senior experts, geen callcenter", "Antwoorden specifiek voor uw producten"],
          },
        },
        {
          type: "two_column",
          data: {
            eyebrow: "Bereik ons",
            title: "Een gesprek verslaat een contactformulier",
            body:
              "De snelste manier om uw verplichtingen te begrijpen is erover praten. Neem contact op en een senior OXOT-consultant reageert — meestal binnen één werkdag.",
            bullets: ["hallo@oxot.eu", "Gevestigd in de EU", "Engels & Nederlands"],
            reverse: true,
          },
        },
        {
          type: "cta",
          data: {
            title: "Klaar wanneer u er klaar voor bent",
            subtitle: "Start het gesprek en zie uw regelgeving in één overzicht.",
            primaryCta: { label: "Neem contact op", href: "mailto:hallo@oxot.eu" },
          },
        },
      ],
    },
  ],
};

async function seed(): Promise<void> {
  logger.info("Seeding OXOT foundation content...");

  // Idempotent AND atomic: clear + reinsert inside a single transaction so a
  // mid-seed failure never leaves partial/empty content.
  await db.transaction(async (tx) => {
    await tx.delete(pageSectionsTable);
    await tx.delete(pagesTable);
    await tx.delete(navItemsTable);
    await tx.delete(siteSettingsTable);

    for (const locale of ["en", "nl"] as Locale[]) {
      await tx.insert(siteSettingsTable).values(settings[locale]);
      await tx.insert(navItemsTable).values(navigation[locale]);

      for (const page of pages[locale]) {
        const [inserted] = await tx
          .insert(pagesTable)
          .values({
            slug: page.slug,
            // Canonical identity for cross-page wiring; equals the slug at seed
            // time and stays fixed if the CMS slug is later edited.
            serviceKey: page.slug,
            locale,
            title: page.title,
            seoTitle: page.seoTitle,
            seoDescription: page.seoDescription,
            status: "published",
          })
          .returning();

        if (!inserted) {
          throw new Error(`Failed to insert page ${page.slug} (${locale})`);
        }

        await tx.insert(pageSectionsTable).values(
          page.sections.map((section, index) => ({
            pageId: inserted.id,
            type: section.type,
            sortOrder: index,
            data: section.data,
          })),
        );
      }
    }
  });

  logger.info("Seed complete.");
}

seed()
  .then(async () => {
    await pool.end();
    process.exit(0);
  })
  .catch(async (err) => {
    logger.error({ err }, "Seed failed");
    await pool.end();
    process.exit(1);
  });
