import { Link, useParams } from 'wouter';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ExternalLink,
  Calendar,
  ShieldCheck,
  ClipboardList,
  ChevronRight,
  Building2,
  Route,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import {
  useGetRegulation,
  getGetRegulationQueryKey,
  useListRequirements,
  getListRequirementsQueryKey,
} from '@workspace/api-client-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useSeo } from '@/hooks/use-seo';
import { regBgStyle, regTextStyle } from '@/lib/reg-colors';
import { useLocale } from '@/providers/locale-provider';

// Static UI chrome only. The framework/regulation data itself (names, titles,
// summaries, dates, classes, routes, requirement text) is API-sourced and is
// intentionally NOT translated here. nl-NL professional register ("u");
// machine-assisted — flag Dutch strings for a native reviewer before go-live.
const copy = {
  en: {
    seoTitleSuffix: ' — OXOT Frameworks',
    notFound: 'Regulation not found',
    backToFrameworks: '← Back to frameworks',
    breadcrumb: 'Frameworks',
    officialText: 'Official text',
    viewInMatrix: 'View in matrix',
    keyDates: 'Key dates',
    productClasses: 'Product classes & entity types',
    conformityRoutes: 'Conformity routes',
    thirdPartyRequired: 'Third-party required',
    requirements: 'Requirements',
    requirementsSubtitle: 'Specific obligations drawn from the official text.',
    crossRefs: 'cross-refs',
    allFrameworks: 'All frameworks',
    viewMatrix: 'View cross-framework matrix',
    obligations: {
      product_requirement: 'Product req.',
      process: 'Process',
      documentation: 'Documentation',
      governance: 'Governance',
      reporting: 'Reporting',
    },
  },
  nl: {
    seoTitleSuffix: ' — OXOT Raamwerken',
    notFound: 'Verordening niet gevonden',
    backToFrameworks: '← Terug naar raamwerken',
    breadcrumb: 'Raamwerken',
    officialText: 'Officiële tekst',
    viewInMatrix: 'Bekijk in matrix',
    keyDates: 'Belangrijke datums',
    productClasses: 'Productklassen en entiteitstypen',
    conformityRoutes: 'Conformiteitsroutes',
    thirdPartyRequired: 'Derde partij vereist',
    requirements: 'Vereisten',
    requirementsSubtitle: 'Specifieke verplichtingen ontleend aan de officiële tekst.',
    crossRefs: 'kruisverwijzingen',
    allFrameworks: 'Alle raamwerken',
    viewMatrix: 'Bekijk de raamwerkoverstijgende matrix',
    obligations: {
      product_requirement: 'Productvereiste',
      process: 'Proces',
      documentation: 'Documentatie',
      governance: 'Governance',
      reporting: 'Rapportage',
    },
  },
} as const;

const OBLIGATION_ICONS: Record<string, React.ElementType> = {
  product_requirement: ShieldCheck,
  process: ClipboardList,
  documentation: ClipboardList,
  governance: Building2,
  reporting: AlertTriangle,
};

function ObligationBadge({ type }: { type: string }) {
  const { locale } = useLocale();
  const label = (copy[locale].obligations as Record<string, string>)[type] ?? type;
  const Icon = OBLIGATION_ICONS[type] ?? ClipboardList;
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

export default function FrameworkDetailPage() {
  const { locale } = useLocale();
  const t = copy[locale];
  const params = useParams<{ key: string }>();
  const key = params.key ?? '';

  const { data: reg, isLoading: regLoading } = useGetRegulation(key, {
    query: { enabled: !!key, queryKey: getGetRegulationQueryKey(key) },
  });

  const { data: reqs, isLoading: reqsLoading } = useListRequirements(
    { regulation: key },
    { query: { enabled: !!key, queryKey: getListRequirementsQueryKey({ regulation: key }) } }
  );

  useSeo(
    reg
      ? {
          title: `${reg.name}${t.seoTitleSuffix}`,
          description: reg.summary,
        }
      : null
  );

  if (regLoading) {
    return (
      <div className="pt-32 pb-24 container mx-auto px-4 md:px-8 flex flex-col gap-8">
        <Skeleton className="h-10 w-40 rounded-lg" />
        <Skeleton className="h-20 w-2/3 rounded-xl" />
        <Skeleton className="h-40 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-48 rounded-2xl" />
          <Skeleton className="h-48 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!reg) {
    return (
      <div className="pt-32 pb-24 container mx-auto px-4 md:px-8 text-center">
        <h1 className="text-3xl font-display font-bold mb-4">{t.notFound}</h1>
        <Link href="/frameworks" className="text-primary hover:underline">
          {t.backToFrameworks}
        </Link>
      </div>
    );
  }

  // Group requirements by theme
  const grouped: Record<string, typeof reqs> = {};
  const ungrouped: typeof reqs = [];
  for (const r of reqs ?? []) {
    if (r.themeKey) {
      if (!grouped[r.themeKey]) grouped[r.themeKey] = [];
      grouped[r.themeKey]!.push(r);
    } else {
      ungrouped.push(r);
    }
  }

  return (
    <div className="w-full">
      {/* ── Page header ──────────────────────────────────── */}
      <section className="relative overflow-hidden pt-32 pb-16 md:pt-40 md:pb-20">
        <div className="absolute inset-0 bg-background -z-10 pointer-events-none" />
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[600px] h-[600px] rounded-full blur-3xl opacity-30 pointer-events-none -z-10" style={regBgStyle(key, 0.12)} />

        <div className="container mx-auto px-4 md:px-8">
          {/* Breadcrumb */}
          <motion.nav
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 text-sm text-muted-foreground mb-8"
          >
            <Link href="/frameworks" className="hover:text-foreground transition-colors flex items-center gap-1">
              <ArrowLeft className="w-4 h-4" /> {t.breadcrumb}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-foreground font-medium">{reg.shortName}</span>
          </motion.nav>

          <div className="max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="flex flex-wrap items-center gap-3 mb-6"
            >
              <span
                className="inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold text-white"
                style={regBgStyle(key)}
              >
                {reg.shortName}
              </span>
              <span className="text-sm text-muted-foreground">{reg.jurisdiction}</span>
              {reg.inForceDate && (
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  {reg.inForceDate}
                </span>
              )}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="text-3xl md:text-4xl lg:text-5xl font-display font-bold tracking-tight text-foreground mb-4 leading-tight"
            >
              {reg.name}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="text-sm text-muted-foreground italic mb-6 max-w-3xl"
            >
              {reg.fullTitle}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-3xl mb-8"
            >
              {reg.summary}
            </motion.p>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="flex flex-wrap items-center gap-4"
            >
              <a
                href={reg.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
              >
                {t.officialText} <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <Link
                href="/frameworks/matrix"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {t.viewInMatrix} <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Key dates ────────────────────────────────────── */}
      {reg.keyDates.length > 0 && (
        <section className="py-12 border-t border-border/40">
          <div className="container mx-auto px-4 md:px-8">
            <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              {t.keyDates}
            </h2>
            <div className="relative pl-6 border-l-2 border-border/60 flex flex-col gap-6 max-w-2xl">
              {reg.keyDates.map((kd, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: i * 0.07 }}
                  className="relative"
                >
                  <div
                    className="absolute -left-[calc(0.5rem+1px)] top-1 w-3 h-3 rounded-full border-2 border-background"
                    style={regBgStyle(key)}
                  />
                  <time className="block text-xs font-mono text-muted-foreground mb-1 tabular-nums">
                    {kd.date}
                  </time>
                  <p className="text-sm font-medium text-foreground">{kd.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Product classes / entity types ───────────────── */}
      {reg.classes.length > 0 && (
        <section className="py-12 border-t border-border/40">
          <div className="container mx-auto px-4 md:px-8">
            <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-primary" />
              {t.productClasses}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {reg.classes.map((cls, i) => (
                <motion.div
                  key={cls.key}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: i * 0.07 }}
                  className="p-5 rounded-xl bg-card border border-border/50"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3 className="text-sm font-semibold text-foreground">{cls.name}</h3>
                    {cls.riskLevel && (
                      <span className="flex-shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {cls.riskLevel}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{cls.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Conformity routes ────────────────────────────── */}
      {reg.routes.length > 0 && (
        <section className="py-12 border-t border-border/40">
          <div className="container mx-auto px-4 md:px-8">
            <h2 className="text-xl font-display font-semibold mb-6 flex items-center gap-2">
              <Route className="w-5 h-5 text-primary" />
              {t.conformityRoutes}
            </h2>
            <div className="flex flex-col gap-3 max-w-3xl">
              {reg.routes.map((route, i) => (
                <motion.div
                  key={route.key}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: i * 0.07 }}
                  className="flex items-start gap-4 p-5 rounded-xl bg-card border border-border/50"
                >
                  <div className={`flex-shrink-0 mt-0.5 ${route.thirdPartyRequired ? 'text-amber-500' : 'text-emerald-500'}`}>
                    {route.thirdPartyRequired ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-foreground">{route.name}</h3>
                      {route.thirdPartyRequired && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                          {t.thirdPartyRequired}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{route.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Requirements ─────────────────────────────────── */}
      <section className="py-12 md:py-16 border-t border-border/40">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-start justify-between gap-4 mb-8">
            <div>
              <h2 className="text-xl font-display font-semibold flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-primary" />
                {t.requirements}
                {reqs && (
                  <span className="ml-2 text-base font-normal text-muted-foreground">
                    ({reqs.length})
                  </span>
                )}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {t.requirementsSubtitle}
              </p>
            </div>
          </div>

          {reqsLoading ? (
            <div className="flex flex-col gap-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3 max-w-4xl">
              {(reqs ?? []).map((req, i) => (
                <motion.div
                  key={req.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: Math.min(i * 0.04, 0.4) }}
                  className="group p-5 rounded-xl bg-card border border-border/50 hover:border-primary/20 hover:shadow-sm transition-all"
                >
                  <div className="flex flex-wrap items-start gap-2 mb-2">
                    <code
                      className="text-xs font-mono font-semibold px-2 py-0.5 rounded-md"
                      style={{ background: `hsl(${regBgStyle(key).background?.toString().replace('hsl(', '').replace(')', '')} / 0.12)`, ...regTextStyle(key) }}
                    >
                      {req.refCode}
                    </code>
                    <ObligationBadge type={req.obligationType} />
                    {req.themeName && (
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/8 text-primary">
                        {req.themeName}
                      </span>
                    )}
                    {req.mappingCount > 0 && (
                      <Link
                        href="/frameworks/matrix"
                        className="ml-auto text-xs text-muted-foreground hover:text-primary transition-colors"
                      >
                        {req.mappingCount} {t.crossRefs}
                      </Link>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">{req.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{req.description}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Bottom nav ───────────────────────────────────── */}
      <section className="py-12 border-t border-border/40">
        <div className="container mx-auto px-4 md:px-8 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/frameworks"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> {t.allFrameworks}
          </Link>
          <Link
            href="/frameworks/matrix"
            className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
          >
            {t.viewMatrix} <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
