import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Library, Download, Newspaper, BookOpen, Scale, ArrowRight, Headphones, HelpCircle, GitCompare, ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { useSeo } from '@/hooks/use-seo';
import { pageSeo } from '@/lib/page-seo';
import { useLocale } from '@/providers/locale-provider';
import { revealVariants, entranceVariants } from '@/lib/motion';
import { LiveCraBlogGuidesFeed } from '@/components/sections/live-cra-blog-guides-feed';

// Localised page copy (nl-NL professional register, "u"). Machine-assisted —
// flag Dutch strings for a native reviewer before go-live. Structure mirrors the
// English source so every visible string has a Dutch equivalent.
const copy = {
  en: {
    seoTitle: 'Resources — OXOT Conformance Platform',
    seoDescription:
      'Spec sheet and sales sheet for the CRA Conformance Application, plus the CRA primer, live regulatory news, knowledge hub and official European Commission CRA FAQs.',
    headerKicker: 'RESOURCES',
    headerTitle: 'Read the law, learn, and get the collateral',
    headerDescription:
      'Start with the law itself — seven EU acts, verbatim — and an honest look at where we fit. Then the guides, the reference, and one-page collateral for the CRA Conformance Application.',
    moatKicker: 'Read the law & verify',
    moat: [
      {
        name: 'The Library — read the law',
        body: 'Seven EU acts in full text — CRA, NIS2, AI Act, Machinery, RED, GDPR, Data Act — as amended and character-verified in CI. The same corpus the platform runs on.',
      },
      {
        name: 'Compare',
        body: 'An honest, structural comparison against IT-GRC suites and firmware scanners — native, partial, or out of scope, with nothing overstated.',
      },
      {
        name: 'Trust center',
        body: 'How your evidence is secured, where it is hosted, and the auditor access model — the assurances a regulated buyer needs.',
      },
    ],
    downloadKicker: 'Download',
    collateral: [
      {
        name: 'Spec sheet',
        body: 'The platform at a glance: modules, the compliance journey, and how it maps to the CRA.',
      },
      {
        name: 'Sales sheet',
        body: 'The offer in one page: what the CRA Conformance Application does, and who it is for.',
      },
      {
        name: 'Demo access guide',
        body: 'How to sign into the live demo workspace and what to look at first — no account setup required.',
      },
    ],
    pdfNote: 'PDF · opens in a new tab',
    referenceKicker: 'Reference',
    reference: [
      { name: 'CRA Primer', body: 'A plain-language walk through the Cyber Resilience Act.' },
      { name: 'Podcast & Engineering Guides', body: '67-episode audio ecosystem and 50 technical guides with RSS syndication.' },
      { name: 'Regulatory news', body: 'A live corpus of CRA developments, refreshed daily.' },
      { name: 'Knowledge hub', body: 'Guides and analysis on getting products conformity-ready.' },
      { name: 'Official EU CRA FAQs', body: '76 authoritative questions, statutory interpretations, and implementation guidance from DG CONNECT.' },
      { name: 'Regulations', body: 'Browse every regulation and its mapped obligations.' },
    ],
    ctaTitle: 'Rather see it live?',
    ctaBody:
      'A 45-minute walkthrough covers classification, your evidence and a defensible Annex VII technical file.',
    bookDemo: 'Book a demo',
  },
  nl: {
    seoTitle: 'Bronnen — OXOT Conformance Platform',
    seoDescription:
      'Specificatieblad en verkoopblad voor de CRA Conformance-applicatie, plus de CRA-primer, live regelgevingsnieuws, kenniscentrum en officiële Europese Commissie CRA-veelgestelde vragen.',
    headerKicker: 'BRONNEN',
    headerTitle: 'Lees de wet, leer, en download het materiaal',
    headerDescription:
      'Begin bij de wet zelf — zeven EU-wetten, verbatim — en een eerlijke blik op waar wij passen. Daarna de gidsen, de naslag en het materiaal van één pagina voor de CRA Conformance-applicatie.',
    moatKicker: 'Lees de wet & verifieer',
    moat: [
      {
        name: 'De Bibliotheek — lees de wet',
        body: 'Zeven EU-wetten in volledige tekst — CRA, NIS2, AI-verordening, Machinerichtlijn, RED, AVG, Data Act — zoals gewijzigd en karakter-geverifieerd in CI. Hetzelfde corpus waarop het platform draait.',
      },
      {
        name: 'Vergelijk',
        body: 'Een eerlijke, structurele vergelijking met IT-GRC-suites en firmwarescanners — native, gedeeltelijk of buiten scope, zonder overdrijving.',
      },
      {
        name: 'Trust center',
        body: 'Hoe uw bewijs wordt beveiligd, waar het wordt gehost en het toegangsmodel voor auditors — de zekerheden die een gereguleerde koper nodig heeft.',
      },
    ],
    downloadKicker: 'Download',
    collateral: [
      {
        name: 'Specificatieblad',
        body: 'Het platform in één oogopslag: modules, het conformiteitstraject en hoe het aansluit op de CRA.',
      },
      {
        name: 'Verkoopblad',
        body: 'Het aanbod op één pagina: wat de CRA Conformance-applicatie doet en voor wie het bedoeld is.',
      },
      {
        name: 'Demotoegang-gids',
        body: 'Hoe u inlogt op de live demo-werkruimte en waar u het eerst naar kijkt — geen account nodig.',
      },
    ],
    pdfNote: 'PDF · opent in een nieuw tabblad',
    referenceKicker: 'Naslag',
    reference: [
      { name: 'CRA-primer', body: 'Een uitleg van de Cyber Resilience Act in begrijpelijke taal.' },
      { name: 'Podcast & Technische Gidsen', body: '67 audio-afleveringen en 50 technische gidsen met RSS-syndicatie.' },
      { name: 'Regelgevingsnieuws', body: 'Een live corpus van CRA-ontwikkelingen, dagelijks bijgewerkt.' },
      { name: 'Kenniscentrum', body: 'Handleidingen en analyses om producten conformiteitsklaar te maken.' },
      { name: 'Officiële EU CRA Veelgestelde Vragen', body: '76 gezaghebbende vragen, wettelijke interpretaties en richtlijnen van DG CONNECT.' },
      { name: 'Regelgeving', body: 'Blader door elke verordening en de bijbehorende verplichtingen.' },
    ],
    ctaTitle: 'Liever live zien?',
    ctaBody:
      'Een rondleiding van 45 minuten behandelt classificatie, uw bewijs en een verdedigbaar technisch dossier volgens Bijlage VII.',
    bookDemo: 'Demo aanvragen',
  },
} as const;

// Non-translatable, position-indexed: icon component + link target for the moat tier.
const MOAT_META = [
  { icon: Library, href: '/wiki' },
  { icon: GitCompare, href: '/compare' },
  { icon: ShieldCheck, href: '/trust' },
];

// Non-translatable, position-indexed: PDF download targets.
const COLLATERAL_HREFS = [
  '/collateral/OXOT-CRA-Conformance-Spec-Sheet.pdf',
  '/collateral/OXOT-CRA-Conformance-Sales-Sheet.pdf',
  '/collateral/OXOT-CRA-Demo-Access-Guide.pdf',
];

// Non-translatable, position-indexed: icon component + link target.
const REFERENCE_META = [
  { icon: BookOpen, href: '/cra-primer' },
  { icon: Headphones, href: '/podcast' },
  { icon: Newspaper, href: '/news' },
  { icon: Library, href: '/knowledge' },
  { icon: HelpCircle, href: '/faq' },
  { icon: Scale, href: '/conformity-platform/regulations' },
];

export default function ResourcesPage() {
  const { locale } = useLocale();
  const t = copy[locale];

  useSeo(
    pageSeo('/resources', {
      title: t.seoTitle,
      description: t.seoDescription,
    }),
  );

  return (
    <div className="w-full">
      <div className="container mx-auto px-4 md:px-8 pt-12 md:pt-16 pb-12 max-w-6xl">
        <PageHeader
          kicker={t.headerKicker}
          title={t.headerTitle}
          icon={Library}
          description={t.headerDescription}
        />

        {/* Read the law & verify — the moat/authority tier, surfaced first */}
        <p className="oxot-kicker">{t.moatKicker}</p>
        <div className="mt-3 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {t.moat.map((m, i) => {
            const { icon: Icon, href } = MOAT_META[i];
            return (
              <motion.div key={m.name} {...entranceVariants(i * 0.08)}>
                <Link
                  href={href}
                  className="group block h-full rounded-2xl border border-border bg-card p-6 shadow-e1 transition-colors hover:border-primary"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mt-4 font-display text-lg font-normal tracking-tight text-foreground group-hover:text-primary">
                    {m.name}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{m.body}</p>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Live latest guidance from the CRA blog corpus (full-bleed band) */}
      <LiveCraBlogGuidesFeed />

      <div className="container mx-auto px-4 md:px-8 py-12 md:py-16 max-w-6xl">
      {/* Collateral PDFs */}
      <p className="oxot-kicker">{t.downloadKicker}</p>
      <div className="mt-3 grid gap-5 sm:grid-cols-2">
        {t.collateral.map((c, i) => (
          <motion.a
            key={c.name}
            href={COLLATERAL_HREFS[i]}
            target="_blank"
            rel="noreferrer"
            className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-6 shadow-e1 transition-colors hover:border-primary"
            {...revealVariants(i)}
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Download className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-lg font-normal tracking-tight text-foreground group-hover:text-primary">
                {c.name}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.body}</p>
              <span className="mt-2 inline-block text-xs font-medium text-primary-ink">{t.pdfNote}</span>
            </div>
          </motion.a>
        ))}
      </div>

      {/* Reference */}
      <p className="oxot-kicker mt-14">{t.referenceKicker}</p>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {t.reference.map((r, i) => {
          const { icon: Icon, href } = REFERENCE_META[i];
          return (
            <motion.div key={r.name} {...revealVariants(i)}>
              <Link
                href={href}
                className="group block rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-4 font-display text-lg font-normal tracking-tight text-foreground group-hover:text-primary">
                  {r.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{r.body}</p>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-16 rounded-2xl border border-border bg-card p-8 text-center">
        <h2 className="font-display text-2xl font-normal tracking-tight text-foreground">{t.ctaTitle}</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          {t.ctaBody}
        </p>
        <Link
          href="/demo"
          className="cta-lift mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
        >
          {t.bookDemo} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      </div>
    </div>
  );
}
