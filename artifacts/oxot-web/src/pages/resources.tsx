import { Link } from 'wouter';
import { Library, Download, Newspaper, BookOpen, FileText, Scale, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { useSeo } from '@/hooks/use-seo';
import { pageSeo } from '@/lib/page-seo';
import { useLocale } from '@/providers/locale-provider';

// Localised page copy (nl-NL professional register, "u"). Machine-assisted —
// flag Dutch strings for a native reviewer before go-live. Structure mirrors the
// English source so every visible string has a Dutch equivalent.
const copy = {
  en: {
    seoTitle: 'Resources — OXOT Conformance Platform',
    seoDescription:
      'Spec sheet and sales sheet for the CRA Conformance Application, plus the CRA primer, live regulatory news, knowledge hub and source library.',
    headerKicker: 'RESOURCES',
    headerTitle: 'Collateral and reference',
    headerDescription:
      'Download the spec and sales sheets for the CRA Conformance Application, or dig into the underlying reference: the CRA primer, a live regulatory-news corpus, the knowledge hub and the primary source library.',
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
    ],
    pdfNote: 'PDF · opens in a new tab',
    referenceKicker: 'Reference',
    reference: [
      { name: 'CRA Primer', body: 'A plain-language walk through the Cyber Resilience Act.' },
      { name: 'Regulatory news', body: 'A live corpus of CRA developments, refreshed daily.' },
      { name: 'Knowledge hub', body: 'Guides and analysis on getting products conformity-ready.' },
      { name: 'Source library', body: 'The primary legislation and technical annexes behind the requirements.' },
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
      'Specificatieblad en verkoopblad voor de CRA Conformance-applicatie, plus de CRA-primer, live regelgevingsnieuws, kenniscentrum en bronbibliotheek.',
    headerKicker: 'BRONNEN',
    headerTitle: 'Materiaal en naslag',
    headerDescription:
      'Download het specificatieblad en het verkoopblad voor de CRA Conformance-applicatie, of verdiep u in de onderliggende naslag: de CRA-primer, een live corpus met regelgevingsnieuws, het kenniscentrum en de primaire bronbibliotheek.',
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
    ],
    pdfNote: 'PDF · opent in een nieuw tabblad',
    referenceKicker: 'Naslag',
    reference: [
      { name: 'CRA-primer', body: 'Een uitleg van de Cyber Resilience Act in begrijpelijke taal.' },
      { name: 'Regelgevingsnieuws', body: 'Een live corpus van CRA-ontwikkelingen, dagelijks bijgewerkt.' },
      { name: 'Kenniscentrum', body: 'Handleidingen en analyses om producten conformiteitsklaar te maken.' },
      { name: 'Bronbibliotheek', body: 'De primaire wetgeving en technische bijlagen achter de vereisten.' },
      { name: 'Regelgeving', body: 'Blader door elke verordening en de bijbehorende verplichtingen.' },
    ],
    ctaTitle: 'Liever live zien?',
    ctaBody:
      'Een rondleiding van 45 minuten behandelt classificatie, uw bewijs en een verdedigbaar technisch dossier volgens Bijlage VII.',
    bookDemo: 'Demo aanvragen',
  },
} as const;

// Non-translatable, position-indexed: PDF download targets.
const COLLATERAL_HREFS = [
  '/collateral/OXOT-CRA-Conformance-Spec-Sheet.pdf',
  '/collateral/OXOT-CRA-Conformance-Sales-Sheet.pdf',
];

// Non-translatable, position-indexed: icon component + link target.
const REFERENCE_META = [
  { icon: BookOpen, href: '/cra-primer' },
  { icon: Newspaper, href: '/news' },
  { icon: Library, href: '/knowledge' },
  { icon: FileText, href: '/conformity-platform/sources' },
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
    <div className="container mx-auto px-4 md:px-8 py-12 md:py-16 max-w-6xl">
      <PageHeader
        kicker={t.headerKicker}
        title={t.headerTitle}
        icon={Library}
        description={t.headerDescription}
      />

      {/* Collateral PDFs */}
      <p className="oxot-kicker">{t.downloadKicker}</p>
      <div className="mt-3 grid gap-5 sm:grid-cols-2">
        {t.collateral.map((c, i) => (
          <a
            key={c.name}
            href={COLLATERAL_HREFS[i]}
            target="_blank"
            rel="noreferrer"
            className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-6 shadow-e1 transition-colors hover:border-primary"
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
          </a>
        ))}
      </div>

      {/* Reference */}
      <p className="oxot-kicker mt-14">{t.referenceKicker}</p>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {t.reference.map((r, i) => {
          const { icon: Icon, href } = REFERENCE_META[i];
          return (
            <Link
              key={r.name}
              href={href}
              className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-4 font-display text-lg font-normal tracking-tight text-foreground group-hover:text-primary">
                {r.name}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{r.body}</p>
            </Link>
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
  );
}
