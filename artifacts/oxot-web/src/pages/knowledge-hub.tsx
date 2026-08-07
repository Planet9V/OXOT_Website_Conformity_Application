import { Link } from 'wouter';
import {
  useGetAdminSession,
  getGetAdminSessionQueryKey,
  useListPages,
  getListPagesQueryKey,
} from '@workspace/api-client-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/page-header';
import {
  BookOpen,
  FileText,
  ListTree,
  Lock,
  ArrowRight,
  Grid3x3,
  Scale,
  ExternalLink,
} from 'lucide-react';
import { useSeo } from '@/hooks/use-seo';
import { useLocale } from '@/providers/locale-provider';

// Display names for regulation tracks, keyed by the conformity catalogue's
// natural regulation keys. Unknown keys fall back to the raw key so future
// tracks appear without a frontend change.
const REGULATION_LABELS: Record<string, string> = {
  cra: 'Cyber Resilience Act',
  ai_act: 'EU AI Act',
  machinery: 'Machinery Regulation',
  iec_62443: 'IEC 62443',
  nis2: 'NIS2 Directive',
  red: 'Radio Equipment Directive',
  gdpr: 'GDPR',
  cer: 'CER Directive',
};

const CROSS_CUTTING = '__cross';

// Position-indexed icons + link targets for the live catalogue cards; the
// visible copy lives in `copy.*.catalogue` at the same index (mirrors home.tsx).
const CATALOGUE_LINKS = [
  { href: '/conformity-platform/requirements', icon: ListTree },
  { href: '/conformity-platform/regulations', icon: Scale },
  { href: '/conformity-platform/matrix', icon: Grid3x3 },
];

// Localised static chrome only (nl-NL professional register, "u"). Machine-
// assisted — flag Dutch strings for a native reviewer before go-live. Regulation
// display names (REGULATION_LABELS) and all member-guide/catalogue content are
// API/DB-sourced (fetched per active locale) and deliberately left untranslated
// here — until Dutch member pages are authored, /nl visitors see this page's
// translated chrome plus the (also translated) "no guides yet" empty state.
const copy = {
  en: {
    seoTitle: 'Knowledge Hub',
    seoDescription:
      'Member reference library: regulation guidance, templates, and workbench how-tos.',
    loading: 'Loading…',
    gateTitle: 'Knowledge Hub is for members',
    gateBody:
      'Sign in to access the full regulatory reference library, artifact templates, and workbench guides for this deployment.',
    signIn: 'Sign in',
    headerKicker: 'MEMBER REFERENCE LIBRARY',
    headerTitle: 'Knowledge Hub',
    headerBody:
      'The reference library behind your conformance work: regulation guidance, artifact templates, and workbench how-tos, organized by regulation track. The live catalogue links render directly from the workbench, so requirement counts and mappings are never out of date. Member guides are grouped by the regulation they serve, with platform-wide guides at the end.',
    openWorkbench: 'Open Workbench',
    catalogueHeading: 'Live catalogue reference',
    catalogue: [
      {
        title: 'Requirement catalogue',
        description: 'Every requirement, rendered live from the workbench catalogue.',
      },
      {
        title: 'Regulations',
        description: 'The regulation tracks loaded on this deployment.',
      },
      {
        title: 'Cross-regulation matrix',
        description: 'How requirements map across regulations — evidence reuse at a glance.',
      },
    ],
    platformGuides: 'Platform guides',
    empty: 'No member guides have been published on this deployment yet.',
  },
  nl: {
    seoTitle: 'Kenniscentrum',
    seoDescription:
      'Referentiebibliotheek voor leden: begeleiding bij regelgeving, sjablonen en handleidingen voor de workbench.',
    loading: 'Laden…',
    gateTitle: 'Het Kenniscentrum is voor leden',
    gateBody:
      'Meld u aan voor toegang tot de volledige referentiebibliotheek met regelgeving, artefactsjablonen en workbench-handleidingen voor deze implementatie.',
    signIn: 'Aanmelden',
    headerKicker: 'REFERENTIEBIBLIOTHEEK VOOR LEDEN',
    headerTitle: 'Kenniscentrum',
    headerBody:
      'De referentiebibliotheek achter uw conformiteitswerk: begeleiding bij regelgeving, artefactsjablonen en workbench-handleidingen, geordend per regelgevingstraject. De links naar de live catalogus worden rechtstreeks vanuit de workbench weergegeven, zodat het aantal vereisten en de koppelingen nooit verouderd zijn. Handleidingen voor leden zijn gegroepeerd op de regelgeving die ze betreffen, met platformbrede handleidingen aan het eind.',
    openWorkbench: 'Workbench openen',
    catalogueHeading: 'Referentie live catalogus',
    catalogue: [
      {
        title: 'Vereistencatalogus',
        description: 'Elke vereiste, live weergegeven uit de workbench-catalogus.',
      },
      {
        title: 'Regelgeving',
        description: 'De regelgevingstrajecten die op deze implementatie zijn geladen.',
      },
      {
        title: 'Matrix over regelgeving heen',
        description:
          'Hoe vereisten over regelgevingen heen op elkaar aansluiten — hergebruik van bewijs in één oogopslag.',
      },
    ],
    platformGuides: 'Platformhandleidingen',
    empty: 'Er zijn nog geen handleidingen voor leden gepubliceerd op deze implementatie.',
  },
} as const;

export default function KnowledgeHubPage() {
  const { locale } = useLocale();
  const t = copy[locale];

  useSeo({
    title: t.seoTitle,
    description: t.seoDescription,
    noindex: true,
  });

  const { data: session, isLoading: sessionLoading } = useGetAdminSession({
    query: { queryKey: getGetAdminSessionQueryKey(), retry: false },
  });

  const authenticated = session?.authenticated === true;

  // The server already filters this list by the caller's visibility tier;
  // members see public + members pages, so selecting visibility === "members"
  // here yields exactly the gated Knowledge Hub shelves. Fetched by the active
  // locale so /nl visitors see Dutch member guides (falls back to the empty
  // state, translated, until Dutch member content is authored).
  const { data: pages = [] } = useListPages(locale, {
    query: { queryKey: getListPagesQueryKey(locale), enabled: authenticated },
  });

  if (sessionLoading) {
    return (
      <div className="container mx-auto px-4 md:px-8 py-24 text-center text-muted-foreground">
        {t.loading}
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div className="container mx-auto px-4 md:px-8 py-24 max-w-lg">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Lock className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
            </div>
            <CardTitle>{t.gateTitle}</CardTitle>
            <CardDescription>{t.gateBody}</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Button asChild>
              <Link href="/admin/login">{t.signIn}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const memberPages = pages.filter((p) => p.visibility === 'members');
  const groups = new Map<string, typeof memberPages>();
  for (const page of memberPages) {
    const keys = page.regulationKeys.length > 0 ? page.regulationKeys : [CROSS_CUTTING];
    for (const key of keys) {
      const list = groups.get(key) ?? [];
      list.push(page);
      groups.set(key, list);
    }
  }
  // Regulation tracks first (stable order), cross-cutting last.
  const orderedKeys = [
    ...[...groups.keys()].filter((k) => k !== CROSS_CUTTING).sort(),
    ...(groups.has(CROSS_CUTTING) ? [CROSS_CUTTING] : []),
  ];

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 md:py-16 space-y-12">
      <PageHeader
        kicker={t.headerKicker}
        title={t.headerTitle}
        icon={BookOpen}
        description={t.headerBody}
        actions={
          <Button asChild>
            <a href="/conformity/">
              {t.openWorkbench}
              <ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" />
            </a>
          </Button>
        }
      />

      {/* Live catalogue reference — rendered from the workbench, never duplicated */}
      <section aria-labelledby="catalogue-heading">
        <h2 id="catalogue-heading" className="font-display text-xl font-semibold mb-4">
          {t.catalogueHeading}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATALOGUE_LINKS.map((item, i) => (
            <Link key={item.href} href={item.href} className="group">
              <Card className="h-full transition-colors group-hover:border-primary/50">
                <CardHeader>
                  <item.icon className="h-5 w-5 text-primary mb-1" aria-hidden="true" />
                  <CardTitle className="text-base flex items-center gap-2">
                    {t.catalogue[i].title}
                    <ArrowRight
                      className="h-4 w-4 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0"
                      aria-hidden="true"
                    />
                  </CardTitle>
                  <CardDescription>{t.catalogue[i].description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Member guides grouped by regulation track */}
      {orderedKeys.map((key) => (
        <section key={key} aria-labelledby={`track-${key}`}>
          <div className="flex items-center gap-3 mb-4">
            <h2 id={`track-${key}`} className="font-display text-xl font-semibold">
              {/* Regulation display names (REGULATION_LABELS) and page titles/
                  excerpts below are API/DB-sourced — left untranslated. */}
              {key === CROSS_CUTTING
                ? t.platformGuides
                : (REGULATION_LABELS[key] ?? key.toUpperCase())}
            </h2>
            {key !== CROSS_CUTTING && <Badge variant="outline">{key}</Badge>}
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Link (not <a>): pages are now fetched by the active locale, so
                the slug already belongs to that locale — resolving it through
                the nested router keeps a Dutch visitor inside /nl. */}
            {(groups.get(key) ?? []).map((page) => (
              <Link key={page.id} href={`/${page.slug}`} className="group">
                <Card className="h-full transition-colors group-hover:border-primary/50">
                  <CardHeader>
                    {key === CROSS_CUTTING ? (
                      <BookOpen className="h-5 w-5 text-primary mb-1" aria-hidden="true" />
                    ) : (
                      <FileText className="h-5 w-5 text-primary mb-1" aria-hidden="true" />
                    )}
                    <CardTitle className="text-base flex items-center gap-2">
                      {page.title}
                      <ArrowRight
                        className="h-4 w-4 opacity-0 -translate-x-1 transition-all group-hover:opacity-100 group-hover:translate-x-0"
                        aria-hidden="true"
                      />
                    </CardTitle>
                    {page.excerpt && <CardDescription>{page.excerpt}</CardDescription>}
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ))}

      {memberPages.length === 0 && (
        <p className="text-muted-foreground">{t.empty}</p>
      )}
    </div>
  );
}
