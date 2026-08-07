import { useState, useRef, useEffect } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Scale, ArrowUpRight, Clock } from 'lucide-react';
import { useGetConformitySummary, useListRegulations } from '@workspace/api-client-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useSeo } from '@/hooks/use-seo';
import { regBgStyle, regTextStyle } from '@/lib/reg-colors';
import { cn } from '@/lib/utils';
import { useLocale } from '@/providers/locale-provider';

// ─── TOC sections ──────────────────────────────────────────────────────────────
// Structural anchors only; visible labels live in copy.toc (position-aligned).
const TOC = [
  { id: 'how-pieces-fit' },
  { id: 'the-frameworks' },
  { id: 'who-answers' },
  { id: 'why-one' },
  { id: 'how-oxot-helps' },
  { id: 'all-frameworks' },
];

// ─── Role filter pills ─────────────────────────────────────────────────────────
type Role = {
  id: string;
  frameworks: string[]; // regulation keys that apply
};

// Visible role labels live in copy.roles (position-aligned with this array).
const ROLES: Role[] = [
  { id: 'operator',  frameworks: ['nis2', 'iec'] },
  { id: 'product',   frameworks: ['cra', 'ai-act', 'iec'] },
  { id: 'machinery', frameworks: ['machinery', 'cra', 'iec'] },
  { id: 'ai',        frameworks: ['ai-act', 'cra'] },
  { id: 'rail',      frameworks: ['nis2', 'iec', 'cra'] },
];

// framework → human label mapping for the role summary
const FRAMEWORK_LABELS: Record<string, string> = {
  cra:      'Cyber Resilience Act',
  nis2:     'NIS2 Directive',
  'ai-act': 'EU AI Act',
  iec:      'IEC 62443',
  machinery:'Machinery Regulation',
  red:      'Radio Equipment Directive',
  gdpr:     'GDPR',
};

// ─── Localised page copy ─────────────────────────────────────────────────────
// nl-NL professional register ("u"). Machine-assisted — flag Dutch strings for a
// native reviewer before go-live. toc[] and roles[] are position-aligned with the
// TOC and ROLES arrays above. Framework/product names (CRA, NIS2, IEC 62443,
// Cyber Digital Twin, etc.) stay unchanged per glossary.
const copy = {
  en: {
    seoTitle: 'European Frameworks for OT Security — OXOT',
    seoDescription:
      'Navigate AI Act, CRA, NIS2, Machinery Regulation and IEC 62443 for OT. A structured reference covering every major EU cybersecurity obligation relevant to operational technology.',
    kicker: 'OT Frameworks & Regulations',
    heroTitleA: 'European Frameworks',
    heroTitleB: 'for OT Security',
    heroLede: 'Navigate AI Act, CRA, NIS2, Machinery Regulation and IEC 62443 for OT.',
    readTime: '5 min read',
    updated: 'Updated July 2026',
    regulationsMapped: 'regulations mapped',
    onThisPage: 'On this page',
    toc: [
      'How the pieces fit',
      'The frameworks',
      'Who answers to what',
      'Why it pays to treat them as one',
      'How OXOT helps',
      'Regulation cards',
    ],
    roles: [
      'I operate an essential / important service',
      'I make products with digital elements',
      'I build or integrate machinery',
      'I deploy AI in a safety / high-risk role',
      'I operate or supply railways',
    ],
    requirements: 'requirements',
    s1Title: 'How the pieces fit',
    s1p1: 'Industrial cybersecurity in Europe is no longer governed by good intentions and voluntary guidance. In the space of a few years, the EU has built an interlocking framework of laws and standards that reach directly into Operational Technology — from the operators who run critical services, to the manufacturers who build the products those services depend on, to the AI now embedded in machines.',
    s1p2: 'Understanding how these pieces fit together is the difference between a coherent security programme and a scramble of disconnected compliance projects.',
    s1p3: 'OXOT works across all of them. This page is the map — start with your role, then open any framework for the detailed, individually-cited guide.',
    roleQuestion: 'Which frameworks apply to me?',
    roleKeyLabel: 'Key frameworks for you: ',
    roleScrollHint: ' — scroll down to see the highlighted cards.',
    roleSelectHint: 'Select your role to highlight the relevant frameworks below.',
    s2Title: 'The frameworks',
    s2Intro:
      'Five major EU instruments now govern OT security, each targeting a different slice of the ecosystem:',
    fwCra: 'mandatory cybersecurity requirements for any product with digital elements placed on the EU market, effective December 2027. This is the broadest horizontal obligation: if it has a chip and connects to a network, the CRA applies.',
    fwNis2: 'extends the original NIS to a far wider set of essential and important entities, including OT operators in energy, transport, water and manufacturing above certain thresholds.',
    fwAi: 'a risk-based framework for AI systems. Safety functions in OT — predictive maintenance that stops a line, AI that controls physical actuators — often fall into the high-risk or safety-critical categories.',
    fwMachinery: 'replaces the old Machinery Directive and explicitly requires cybersecurity as a safety property for safety-related control systems.',
    fwIec: 'the reference standard for industrial automation security. Not an EU regulation, but the framework the others point to for technical substance.',
    s3Title: 'Who answers to what',
    s3Intro:
      'The EU frameworks divide obligations between two distinct groups — and most industrial organisations straddle both:',
    s3OpsStrong: 'Operators of essential services',
    s3OpsRest: 'fall primarily under NIS2. They must maintain risk management measures, report incidents within 24 hours, and ensure their supply chains (including the OT products they buy) meet adequate security standards. IEC 62443-2-1 is the typical implementation reference.',
    s3MfgStrong: 'Manufacturers and integrators',
    s3MfgRest:
      "of products with digital elements face the CRA, the Machinery Regulation, and potentially the AI Act. They must CE-mark their products against cybersecurity requirements, maintain a software bill of materials, handle vulnerabilities for the product's supported lifetime, and generate a conformity dossier a notified body can audit.",
    s4Title: 'Why it pays to treat them as one',
    s4p1: 'Each regulation was drafted by a different DG, with a different set of policy objectives — yet they share a large common core. Secure-by-design, vulnerability management, access control, logging and incident response appear across all five. Treating each compliance project independently means writing the same evidence four times over.',
    s4p2:
      "OXOT's control library maps the shared obligations once, then traces each one to its specific citations in every applicable regulation. A single piece of evidence — a network segmentation design, a penetration test, a patching process — can satisfy requirements in CRA Annex I, NIS2 Article 21, IEC 62443-3-3 SR 5.1, and the Machinery Regulation's essential health and safety requirements simultaneously.",
    s5Title: 'How OXOT helps',
    s5Intro: 'OXOT brings three capabilities to the compliance challenge:',
    s5Item1Strong: 'Unified control library.',
    s5Item1Rest: 'Every obligation across CRA, NIS2, AI Act, Machinery and IEC 62443 is modelled in a single, deduplicated requirement set — so teams work against one list, not five.',
    s5Item2Rest: 'A living model of your OT environment that maps assets, zones, conduits and trust boundaries to the specific controls that apply to each. As your environment changes, the compliance picture updates automatically.',
    s5Item3Strong: 'Audit-ready evidence.',
    s5Item3Rest: 'Link engineering artefacts — tickets, tests, SBOMs, design documents — to controls. OXOT generates structured technical files and declarations of conformity that a notified body can actually follow.',
    ctaServices: 'Explore services',
    cardsTitle: 'Mapped regulations & standards',
    cardsDesc:
      'Select a framework to explore its obligations, key dates, product classifications and conformity routes.',
    matrixLink: 'Cross-regulation matrix',
    keyDatesTitle: 'Upcoming key dates',
    keyDatesDesc: 'Implementation deadlines across all mapped regulations.',
  },
  nl: {
    seoTitle: 'Europese raamwerken voor OT-beveiliging — OXOT',
    seoDescription:
      'Vind uw weg door de AI Act, CRA, NIS2, Machinery Regulation en IEC 62443 voor OT. Een gestructureerde referentie voor elke belangrijke EU-cyberbeveiligingsverplichting die relevant is voor operationele technologie.',
    kicker: 'OT-raamwerken en -regelgeving',
    heroTitleA: 'Europese raamwerken',
    heroTitleB: 'voor OT-beveiliging',
    heroLede: 'Vind uw weg door de AI Act, CRA, NIS2, Machinery Regulation en IEC 62443 voor OT.',
    readTime: '5 min lezen',
    updated: 'Bijgewerkt juli 2026',
    regulationsMapped: 'regelgevingen in kaart gebracht',
    onThisPage: 'Op deze pagina',
    toc: [
      'Hoe de onderdelen samenhangen',
      'De raamwerken',
      'Wie waaraan moet voldoen',
      'Waarom het loont ze als één geheel te behandelen',
      'Hoe OXOT helpt',
      'Regelgevingskaarten',
    ],
    roles: [
      'Ik exploiteer een essentiële / belangrijke dienst',
      'Ik maak producten met digitale elementen',
      'Ik bouw of integreer machines',
      'Ik zet AI in voor een veiligheids- / hoogrisicorol',
      'Ik exploiteer of lever spoorwegen',
    ],
    requirements: 'vereisten',
    s1Title: 'Hoe de onderdelen samenhangen',
    s1p1: 'Industriële cyberbeveiliging in Europa wordt niet langer bepaald door goede bedoelingen en vrijblijvende richtlijnen. In enkele jaren tijd heeft de EU een samenhangend geheel van wetten en normen opgebouwd dat rechtstreeks doorwerkt in operationele technologie — van de exploitanten die kritieke diensten leveren, tot de fabrikanten die de producten bouwen waarvan die diensten afhankelijk zijn, tot de AI die nu in machines is ingebouwd.',
    s1p2: 'Begrijpen hoe deze onderdelen samenhangen, is het verschil tussen een samenhangend beveiligingsprogramma en een wirwar van losse nalevingsprojecten.',
    s1p3: 'OXOT werkt over al deze regelgevingen heen. Deze pagina is de kaart — begin met uw rol en open vervolgens een raamwerk voor de gedetailleerde gids met afzonderlijke bronvermeldingen.',
    roleQuestion: 'Welke raamwerken zijn op mij van toepassing?',
    roleKeyLabel: 'Belangrijkste raamwerken voor u: ',
    roleScrollHint: ' — scrol omlaag om de gemarkeerde kaarten te zien.',
    roleSelectHint: 'Selecteer uw rol om de relevante raamwerken hieronder te markeren.',
    s2Title: 'De raamwerken',
    s2Intro:
      'Vijf belangrijke EU-instrumenten reguleren nu de OT-beveiliging, elk gericht op een ander deel van het ecosysteem:',
    fwCra: 'verplichte cyberbeveiligingsvereisten voor elk product met digitale elementen dat op de EU-markt wordt aangeboden, van kracht vanaf december 2027. Dit is de breedste horizontale verplichting: als het een chip heeft en verbinding maakt met een netwerk, is de CRA van toepassing.',
    fwNis2: 'breidt de oorspronkelijke NIS uit naar een veel bredere groep essentiële en belangrijke entiteiten, waaronder OT-exploitanten in energie, transport, water en productie boven bepaalde drempels.',
    fwAi: 'een risicogebaseerd raamwerk voor AI-systemen. Veiligheidsfuncties in OT — voorspellend onderhoud dat een lijn stillegt, AI die fysieke actuatoren aanstuurt — vallen vaak in de categorie hoog risico of veiligheidskritiek.',
    fwMachinery: 'vervangt de oude Machinerichtlijn en vereist expliciet cyberbeveiliging als veiligheidseigenschap voor veiligheidsgerelateerde besturingssystemen.',
    fwIec: 'de referentienorm voor beveiliging van industriële automatisering. Geen EU-verordening, maar het raamwerk waarnaar de andere verwijzen voor de technische inhoud.',
    s3Title: 'Wie waaraan moet voldoen',
    s3Intro:
      'De EU-raamwerken verdelen de verplichtingen over twee afzonderlijke groepen — en de meeste industriële organisaties vallen onder beide:',
    s3OpsStrong: 'Exploitanten van essentiële diensten',
    s3OpsRest: 'vallen primair onder NIS2. Zij moeten risicobeheersmaatregelen onderhouden, incidenten binnen 24 uur melden en ervoor zorgen dat hun toeleveringsketens (inclusief de OT-producten die zij inkopen) aan toereikende beveiligingsnormen voldoen. IEC 62443-2-1 is de gebruikelijke implementatiereferentie.',
    s3MfgStrong: 'Fabrikanten en integrators',
    s3MfgRest:
      'van producten met digitale elementen krijgen te maken met de CRA, de Machinery Regulation en mogelijk de AI Act. Zij moeten hun producten voorzien van een CE-markering conform de cyberbeveiligingsvereisten, een software bill of materials bijhouden, kwetsbaarheden afhandelen gedurende de ondersteunde levensduur van het product, en een conformiteitsdossier opstellen dat een aangemelde instantie kan auditen.',
    s4Title: 'Waarom het loont ze als één geheel te behandelen',
    s4p1: 'Elke verordening is opgesteld door een ander directoraat-generaal, met een andere set beleidsdoelstellingen — en toch delen ze een grote gemeenschappelijke kern. Secure-by-design, kwetsbaarhedenbeheer, toegangsbeheer, logging en incidentrespons komen in alle vijf terug. Elk nalevingsproject afzonderlijk aanpakken betekent dat u hetzelfde bewijs vier keer opnieuw opstelt.',
    s4p2:
      'De controlebibliotheek van OXOT brengt de gedeelde verplichtingen één keer in kaart en herleidt elke verplichting vervolgens naar de specifieke bronvermeldingen in elke toepasselijke verordening. Eén enkel bewijsstuk — een ontwerp voor netwerksegmentatie, een penetratietest, een patchproces — kan tegelijk voldoen aan vereisten in CRA Bijlage I, NIS2 Artikel 21, IEC 62443-3-3 SR 5.1 en de essentiële gezondheids- en veiligheidseisen van de Machinery Regulation.',
    s5Title: 'Hoe OXOT helpt',
    s5Intro: 'OXOT biedt drie mogelijkheden voor de nalevingsuitdaging:',
    s5Item1Strong: 'Uniforme controlebibliotheek.',
    s5Item1Rest: 'Elke verplichting uit CRA, NIS2, AI Act, Machinery en IEC 62443 wordt gemodelleerd in één gededupliceerde set vereisten — zo werken teams met één lijst in plaats van vijf.',
    s5Item2Rest: 'Een levend model van uw OT-omgeving dat assets, zones, conduits en vertrouwensgrenzen koppelt aan de specifieke controls die op elk van toepassing zijn. Wanneer uw omgeving verandert, wordt het nalevingsbeeld automatisch bijgewerkt.',
    s5Item3Strong: 'Auditklaar bewijs.',
    s5Item3Rest: "Koppel engineeringartefacten — tickets, tests, SBOM's, ontwerpdocumenten — aan controls. OXOT genereert gestructureerde technische documentatie en conformiteitsverklaringen die een aangemelde instantie daadwerkelijk kan volgen.",
    ctaServices: 'Diensten verkennen',
    cardsTitle: 'In kaart gebrachte regelgeving en normen',
    cardsDesc:
      'Selecteer een raamwerk om de verplichtingen, belangrijke data, productclassificaties en conformiteitsroutes te verkennen.',
    matrixLink: 'Vergelijkingsmatrix regelgeving',
    keyDatesTitle: 'Aankomende belangrijke data',
    keyDatesDesc: 'Implementatiedeadlines voor alle in kaart gebrachte regelgeving.',
  },
} as const;

// ─── Regulation card ───────────────────────────────────────────────────────────
function RegCard({ reg, highlighted }: { reg: any; highlighted: boolean }) {
  const { locale } = useLocale();
  const t = copy[locale];
  return (
    <Link href={`/frameworks/${reg.key}`} className="group block h-full">
      <div
        className={cn(
          'h-full p-6 md:p-8 rounded-2xl border shadow-sm transition-all flex flex-col gap-5',
          highlighted
            ? 'bg-primary/10 border-primary/40 shadow-primary/10'
            : 'bg-card border-border/50 hover:shadow-md hover:border-primary/20',
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <span
            className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-white"
            style={regBgStyle(reg.key)}
          >
            {reg.shortName}
          </span>
          <span className="text-xs text-muted-foreground font-medium pt-0.5">{reg.jurisdiction}</span>
        </div>

        <div>
          <h3 className="text-lg font-display font-semibold text-foreground mb-2 group-hover:text-primary transition-colors leading-snug">
            {reg.name}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{reg.summary}</p>
        </div>

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-border/40">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Scale className="w-3.5 h-3.5" />
            <span>{reg.requirementCount} {t.requirements}</span>
          </div>
          {reg.inForceDate && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <span>{reg.inForceDate.slice(0, 4)}</span>
            </div>
          )}
          <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </div>
    </Link>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function FrameworksPage() {
  const { locale } = useLocale();
  const t = copy[locale];

  useSeo({
    title: t.seoTitle,
    description: t.seoDescription,
  });

  const { data: summary } = useGetConformitySummary();
  const { data: regulations, isLoading } = useListRegulations();

  const [activeSection, setActiveSection] = useState('how-pieces-fit');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // Scroll spy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        }
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 },
    );
    TOC.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const highlightedKeys = selectedRole
    ? ROLES.find((r) => r.id === selectedRole)?.frameworks ?? []
    : [];

  const selectedRoleData = selectedRole ? ROLES.find((r) => r.id === selectedRole) : null;

  return (
    <div className="w-full">
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-28 pb-12 md:pt-36 md:pb-16 border-b border-border/40">
        {/* subtle grid bg */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_60%,transparent_100%)] pointer-events-none -z-10 opacity-20 dark:opacity-10" />
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[600px] h-[600px] bg-primary/8 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-semibold tracking-[0.15em] uppercase text-primary mb-4"
          >
            {t.kicker}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground leading-[1.1] mb-5"
          >
            {t.heroTitleA}<br className="hidden md:block" /> {t.heroTitleB}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className="text-lg text-muted-foreground mb-6 max-w-2xl leading-relaxed"
          >
            {t.heroLede}
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-5 text-sm text-muted-foreground"
          >
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {t.readTime}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {t.updated}
            </span>
            {summary && (
              <span className="hidden sm:flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5" />
                {summary.regulationCount} {t.regulationsMapped}
              </span>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── Two-column: sticky TOC + article ─────────────────────────── */}
      <section className="container mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="flex gap-12 lg:gap-16 relative max-w-5xl">

          {/* Left: sticky TOC sidebar */}
          <aside className="hidden lg:block w-48 flex-shrink-0">
            <div className="sticky top-24">
              <p className="flex items-center gap-1.5 text-xs font-semibold tracking-[0.12em] uppercase text-muted-foreground mb-4">
                <span className="inline-block w-3 h-px bg-primary" />
                {t.onThisPage}
              </p>
              <nav className="flex flex-col gap-0.5">
                {TOC.map(({ id }, i) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    className={cn(
                      'text-sm py-1 pl-3 border-l-2 transition-colors leading-snug',
                      activeSection === id
                        ? 'border-primary text-foreground font-medium'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border',
                    )}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                  >
                    {t.toc[i]}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Right: article body */}
          <div className="flex-1 min-w-0">

            {/* ── Section 1: How the pieces fit ── */}
            <div id="how-pieces-fit" className="scroll-mt-24 mb-14">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-5">
                {t.s1Title}
              </h2>
              <div className="prose prose-sm sm:prose dark:prose-invert max-w-none">
                <p>{t.s1p1}</p>
                <p>{t.s1p2}</p>
                <p>{t.s1p3}</p>
              </div>
            </div>

            {/* ── Role filter ── */}
            <div className="mb-14 p-6 rounded-2xl border border-border/60 bg-card">
              <p className="text-xs font-semibold tracking-[0.12em] uppercase text-primary mb-4">
                {t.roleQuestion}
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {ROLES.map((role, i) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(selectedRole === role.id ? null : role.id)}
                    className={cn(
                      'text-sm px-4 py-2 rounded-full border transition-all font-medium',
                      selectedRole === role.id
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20'
                        : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground bg-background',
                    )}
                  >
                    {t.roles[i]}
                  </button>
                ))}
              </div>
              {selectedRoleData ? (
                <div className="text-sm text-foreground bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
                  <span className="font-medium">{t.roleKeyLabel}</span>
                  {selectedRoleData.frameworks.map((key, i) => (
                    <span key={key}>
                      <Link href={`/frameworks/${key}`} className="text-primary hover:underline">
                        {FRAMEWORK_LABELS[key] ?? key}
                      </Link>
                      {i < selectedRoleData.frameworks.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                  <span className="text-muted-foreground">
                    {t.roleScrollHint}
                  </span>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">{t.roleSelectHint}</p>
              )}
            </div>

            {/* ── Section 2: The frameworks ── */}
            <div id="the-frameworks" className="scroll-mt-24 mb-14">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-5">
                {t.s2Title}
              </h2>
              <div className="prose prose-sm sm:prose dark:prose-invert max-w-none">
                <p>{t.s2Intro}</p>
                <ul>
                  <li>
                    <strong>Cyber Resilience Act (CRA)</strong> — {t.fwCra}
                  </li>
                  <li>
                    <strong>NIS2 Directive</strong> — {t.fwNis2}
                  </li>
                  <li>
                    <strong>EU AI Act</strong> — {t.fwAi}
                  </li>
                  <li>
                    <strong>Machinery Regulation 2023/1230</strong> — {t.fwMachinery}
                  </li>
                  <li>
                    <strong>IEC 62443</strong> — {t.fwIec}
                  </li>
                </ul>
              </div>
            </div>

            {/* ── Section 3: Who answers to what ── */}
            <div id="who-answers" className="scroll-mt-24 mb-14">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-5">
                {t.s3Title}
              </h2>
              <div className="prose prose-sm sm:prose dark:prose-invert max-w-none">
                <p>{t.s3Intro}</p>
                <p>
                  <strong>{t.s3OpsStrong}</strong> {t.s3OpsRest}
                </p>
                <p>
                  <strong>{t.s3MfgStrong}</strong> {t.s3MfgRest}
                </p>
              </div>
            </div>

            {/* ── Section 4: Why one ── */}
            <div id="why-one" className="scroll-mt-24 mb-14">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-5">
                {t.s4Title}
              </h2>
              <div className="prose prose-sm sm:prose dark:prose-invert max-w-none">
                <p>{t.s4p1}</p>
                <p>{t.s4p2}</p>
              </div>
            </div>

            {/* ── Section 5: How OXOT helps ── */}
            <div id="how-oxot-helps" className="scroll-mt-24 mb-14">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-5">
                {t.s5Title}
              </h2>
              <div className="prose prose-sm sm:prose dark:prose-invert max-w-none">
                <p>{t.s5Intro}</p>
                <ol>
                  <li>
                    <strong>{t.s5Item1Strong}</strong> {t.s5Item1Rest}
                  </li>
                  <li>
                    <strong>Cyber Digital Twin.</strong> {t.s5Item2Rest}
                  </li>
                  <li>
                    <strong>{t.s5Item3Strong}</strong> {t.s5Item3Rest}
                  </li>
                </ol>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/services"
                  className="inline-flex items-center gap-2 h-10 px-6 rounded-full bg-primary text-primary-foreground font-medium text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                >
                  {t.ctaServices} <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/cyber-digital-twin"
                  className="inline-flex items-center gap-2 h-10 px-6 rounded-full border border-border text-foreground font-medium text-sm hover:border-primary/40 hover:text-primary transition-all"
                >
                  Cyber Digital Twin
                </Link>
              </div>
            </div>

          </div>{/* end article body */}
        </div>{/* end flex row */}
      </section>

      {/* ── Regulation cards ─────────────────────────────────────────────── */}
      <section id="all-frameworks" className="scroll-mt-20 py-16 md:py-20 border-t border-border/40 bg-background">
        <div className="container mx-auto px-4 md:px-8">
          <div className="mb-10 flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight mb-2">
                {t.cardsTitle}
              </h2>
              <p className="text-muted-foreground max-w-xl text-sm">
                {t.cardsDesc}
              </p>
            </div>
            <Link
              href="/frameworks/matrix"
              className="flex-shrink-0 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              {t.matrixLink} <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {(regulations ?? []).map((reg, i) => (
                <motion.div
                  key={reg.key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                >
                  <RegCard
                    reg={reg}
                    highlighted={highlightedKeys.includes(reg.key)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Key dates band ────────────────────────────────────────────────── */}
      {summary && summary.keyDates.length > 0 && (
        <section className="py-14 border-t border-border/40">
          <div className="container mx-auto px-4 md:px-8">
            <div className="mb-7">
              <h2 className="text-xl font-display font-bold tracking-tight mb-1">
                {t.keyDatesTitle}
              </h2>
              <p className="text-muted-foreground text-sm">{t.keyDatesDesc}</p>
            </div>
            <div className="flex flex-col gap-3 max-w-2xl">
              {summary.keyDates
                .filter((kd) => kd.date >= new Date().toISOString().slice(0, 10))
                .slice(0, 6)
                .map((kd, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border/40"
                  >
                    <div
                      className="flex-shrink-0 w-2 h-2 rounded-full mt-1.5"
                      style={regBgStyle(kd.regulationKey ?? '')}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{kd.label}</p>
                      {kd.regulationKey && (
                        <p className="text-xs text-muted-foreground mt-0.5" style={regTextStyle(kd.regulationKey)}>
                          {kd.regulationKey.replace('_', ' ').toUpperCase()}
                        </p>
                      )}
                    </div>
                    <time className="flex-shrink-0 text-xs font-mono text-muted-foreground tabular-nums">
                      {kd.date}
                    </time>
                  </motion.div>
                ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
