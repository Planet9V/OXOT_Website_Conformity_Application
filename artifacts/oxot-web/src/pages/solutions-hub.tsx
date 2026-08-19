import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Layers, Factory, ShieldCheck, Wrench, Cpu, Rocket, ClipboardCheck, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { useSeo } from '@/hooks/use-seo';
import { pageSeo } from '@/lib/page-seo';
import { useLocale } from '@/providers/locale-provider';
import { entranceVariants } from '@/lib/motion';

// Localised page copy (nl-NL professional register, "u"). Machine-assisted —
// flag Dutch strings for a native reviewer before go-live. Structure mirrors the
// English source so every visible string has a Dutch equivalent.
const copy = {
  en: {
    seoTitle: 'Solutions — OXOT Conformance Platform',
    seoDescription:
      'Your CRA duty depends on what you do with the product. Find your path — manufacturer, operator, integrator, or a single product in transit.',
    headerKicker: 'SOLUTIONS',
    headerTitle: 'Your CRA duty depends on what you do',
    headerDescription:
      'The Cyber Resilience Act treats a manufacturer, an operator, and an integrator as three different problems. Find the one that is yours — and the path built for it.',
    forkKicker: 'Find your path',
    solutions: [
      {
        name: 'For manufacturers',
        body: 'You place the product on the market, so you carry the CRA in full — the Annex I essential requirements, the technical file, the Declaration of Conformity, and the CE mark.',
        cue: 'Explore the manufacturer path',
      },
      {
        name: 'For operators & asset owners',
        body: 'You have no CRA obligation of your own. But NIS2 Article 21(2)(d) makes your suppliers’ security your duty — so you hold the devices across your estate to the CRA.',
        cue: 'Explore the operator path',
      },
      {
        name: 'For integrators & partners',
        body: 'Modify, rebrand, or substantially change a product and Article 22 can make you its manufacturer. Know exactly where that line sits before you cross it.',
        cue: 'Check your deemed-manufacturer risk',
      },
      {
        name: 'For component & IP suppliers',
        body: 'You supply the security IP or the component, not the finished product — but your customers’ CRA due diligence runs on your evidence. Answer it once, with a versioned assurance package.',
        cue: 'Explore the supplier path',
      },
      {
        name: 'CRA in transit',
        body: 'One product, one consultant-led 60-day sprint to a defensible self-assessed conformity file — for teams who need to move now.',
        cue: 'See the 60-day sprint',
      },
    ],
    notSureKicker: 'Not sure yet?',
    notSureTitle: 'Find out in two minutes',
    notSureBody:
      'Answer a short set of questions and get your CRA role, your route to CE marking, and a readiness score — no account, instant PDF.',
    notSureCta: 'Take the 2-minute check',
    ctaTitle: 'Rather see it live?',
    ctaBody:
      'A 45-minute walkthrough covers classification, your evidence, and a defensible Annex VII technical file.',
    bookDemo: 'Book a demo',
  },
  nl: {
    seoTitle: 'Oplossingen — OXOT Conformance Platform',
    seoDescription:
      'Uw CRA-plicht hangt af van wat u met het product doet. Vind uw pad — fabrikant, exploitant, integrator, of één product in transit.',
    headerKicker: 'OPLOSSINGEN',
    headerTitle: 'Uw CRA-plicht hangt af van wat u doet',
    headerDescription:
      'De Cyber Resilience Act behandelt een fabrikant, een exploitant en een integrator als drie verschillende vraagstukken. Vind het vraagstuk dat van u is — en het pad dat daarvoor is gebouwd.',
    forkKicker: 'Vind uw pad',
    solutions: [
      {
        name: 'Voor fabrikanten',
        body: 'U brengt het product op de markt en draagt dus de volledige CRA — de essentiële eisen van Bijlage I, het technisch dossier, de conformiteitsverklaring en de CE-markering.',
        cue: 'Bekijk het fabrikantenpad',
      },
      {
        name: 'Voor exploitanten & asseteigenaren',
        body: 'U heeft zelf geen CRA-verplichting. Maar NIS2 Artikel 21(2)(d) maakt de beveiliging van uw leveranciers uw plicht — dus houdt u de apparaten in uw park aan de CRA.',
        cue: 'Bekijk het exploitantenpad',
      },
      {
        name: 'Voor integrators & partners',
        body: 'Wijzig, herlabel of verander een product substantieel en Artikel 22 kan u tot fabrikant maken. Weet precies waar die grens ligt voordat u die overschrijdt.',
        cue: 'Controleer uw deemed-manufacturer-risico',
      },
      {
        name: 'Voor component- & IP-leveranciers',
        body: 'U levert de beveiligings-IP of het component, niet het eindproduct — maar de CRA-due diligence van uw klanten draait op uw bewijs. Beantwoord die één keer, met een versiegebonden assurancepakket.',
        cue: 'Bekijk het leverancierspad',
      },
      {
        name: 'CRA in transit',
        body: 'Eén product, één begeleide sprint van 60 dagen naar een verdedigbaar zelf-beoordeeld conformiteitsdossier — voor teams die nu moeten handelen.',
        cue: 'Bekijk de sprint van 60 dagen',
      },
    ],
    notSureKicker: 'Nog niet zeker?',
    notSureTitle: 'Kom er in twee minuten achter',
    notSureBody:
      'Beantwoord een korte reeks vragen en ontvang uw CRA-rol, uw route naar CE-markering en een gereedheidsscore — geen account, direct een PDF.',
    notSureCta: 'Doe de check van 2 minuten',
    ctaTitle: 'Liever live zien?',
    ctaBody:
      'Een rondleiding van 45 minuten behandelt classificatie, uw bewijs en een verdedigbaar technisch dossier volgens Bijlage VII.',
    bookDemo: 'Demo aanvragen',
  },
} as const;

// Non-translatable, position-indexed: icon component + link target for each path.
const SOLUTION_META = [
  { icon: Factory, href: '/manufacturers' },
  { icon: ShieldCheck, href: '/operators' },
  { icon: Wrench, href: '/partner-scope' },
  { icon: Cpu, href: '/suppliers' },
  { icon: Rocket, href: '/cra-transit' },
];

export default function SolutionsHubPage() {
  const { locale } = useLocale();
  const t = copy[locale];

  useSeo(
    pageSeo('/solutions', {
      title: t.seoTitle,
      description: t.seoDescription,
    }),
  );

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 md:py-16 max-w-6xl">
      <PageHeader
        kicker={t.headerKicker}
        title={t.headerTitle}
        icon={Layers}
        description={t.headerDescription}
      />

      {/* Obligation fork — self-select by what you do with the product */}
      <p className="oxot-kicker">{t.forkKicker}</p>
      <div className="mt-3 grid gap-5 md:grid-cols-2">
        {t.solutions.map((s, i) => {
          const { icon: Icon, href } = SOLUTION_META[i];
          return (
            <motion.div key={s.name} {...entranceVariants(i * 0.08)}>
              <Link
                href={href}
                className="group flex h-full flex-col rounded-2xl border border-border bg-card p-6 shadow-e1 transition-colors hover:border-primary"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-4 font-display text-lg font-normal tracking-tight text-foreground group-hover:text-primary">
                  {s.name}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary-ink">
                  {s.cue} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* "Not sure which you are?" — hand off to the scored 2-min check */}
      <div className="mt-12 flex flex-col gap-4 rounded-2xl border border-border bg-primary/[0.04] p-6 md:flex-row md:items-center md:justify-between md:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <ClipboardCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="oxot-kicker">{t.notSureKicker}</p>
            <h3 className="oxot-h3 mt-1 text-foreground">{t.notSureTitle}</h3>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">{t.notSureBody}</p>
          </div>
        </div>
        <Link
          href="/cra-check"
          className="cta-lift inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-primary px-5 py-2.5 text-sm font-medium text-primary-ink transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          <ClipboardCheck className="h-4 w-4" /> {t.notSureCta}
        </Link>
      </div>

      {/* Closing CTA — the single ask */}
      <div className="mt-16 rounded-2xl border border-border bg-card p-8 text-center">
        <h2 className="font-display text-2xl font-normal tracking-tight text-foreground">{t.ctaTitle}</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">{t.ctaBody}</p>
        <Link
          href="/demo"
          className="cta-lift mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
        >
          {t.bookDemo} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
