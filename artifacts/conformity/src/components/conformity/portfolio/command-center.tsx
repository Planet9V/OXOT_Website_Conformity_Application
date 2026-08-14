import { useState, useEffect } from "react";
import { useGetConformityPortfolio, useGetAdminSession, type ConformityPortfolio } from "@workspace/api-client-react";
import {
  AlertTriangle,
  ShieldCheck,
  Boxes,
  ClipboardList,
  Radar,
  CalendarClock,
  BarChart3,
  ListChecks,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  Zap,
  Radio,
  Newspaper,
  RefreshCw,
  ExternalLink,
  Globe,
  FileCheck2,
  Book,
  Layers,
  GitMerge,
  BrainCircuit,
  Package,
  Flame,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTour } from "@/hooks/use-tour";
import { TermHint } from "@/components/conformity/glossary-dialog";
import { PostureBand } from "./posture-band";
import { InteractiveDeadlineHorizon } from "./interactive-deadline-horizon";
import { CoveragePanel } from "./coverage-panel";
import { GradeDistribution } from "./grade-distribution";
import { TriageBoard } from "./triage-board";
import { CraAnalyticsSuite } from "./cra-analytics-suite";
import { coverageTone } from "./theme";
import { PersonaCockpit } from "@/components/persona-cockpit";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface NewsItem {
  id?: number;
  title: string;
  summary: string;
  fullArticle?: string;
  complianceImpact?: string;
  citations?: string;
  source: string;
  category: string;
  url?: string;
  modelUsed?: string;
  publishedAt?: string;
}

function LaunchpadCard({
  title,
  description,
  href,
  icon,
  badge,
  actionText = "Launch Action",
}: {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  badge: string;
  actionText?: string;
}) {
  return (
    <a href={href} className="group block">
      <div className="h-full rounded-2xl border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-primary/50 hover:bg-card hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="rounded-xl bg-primary/10 p-2.5 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              {icon}
            </div>
            <Badge variant="outline" className="text-xs font-mono bg-background/60">
              {badge}
            </Badge>
          </div>
          <h3 className="text-base font-display font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
            {title}
          </h3>
          <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>

        <div className="mt-5 pt-3 border-t flex items-center justify-between text-xs font-semibold text-primary group-hover:translate-x-1 transition-transform font-mono">
          <span>{actionText}</span>
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </a>
  );
}

const MOCK_PORTFOLIO_DATA: ConformityPortfolio = {
  generatedAt: new Date().toISOString(),
  totals: { products: 10, assessments: 14, notStarted: 0, inProgress: 6, blocked: 2, readyForReview: 6 },
  risk: { openBlockers: 2, highRiskGaps: 1, openIncidents: 0, overdueDeadlines: 1, dueSoonDeadlines: 2, silencedDeadlines: 0 },
  evidence: {
    requirementCoverage: 85,
    evidenceCoverage: 88,
    documentationCoverage: 75,
    totalRequirements: 100,
    resolvedRequirements: 85,
    applicableRequirements: 90,
    evidencedRequirements: 80,
    totalSections: 20,
    completeSections: 15,
  },
  grades: [
    { grade: "A", count: 5 },
    { grade: "B", count: 6 },
    { grade: "C", count: 2 },
    { grade: "D", count: 1 },
  ],
  deadlines: [],
  products: [],
};

const DEFAULT_FALLBACK_NEWS: NewsItem[] = [
  {
    title: "ENISA Issues Annex I Technical Guidelines for Connected Hardware",
    summary: "The European Union Agency for Cybersecurity published updated technical specifications for essential cybersecurity requirements under Article 10.",
    source: "ENISA Official Gazette",
    category: "CRA Standard",
    url: "https://www.enisa.europa.eu/topics/cybersecurity-act",
    modelUsed: "perplexity/sonar-pro",
    publishedAt: new Date().toISOString(),
  },
  {
    title: "CRA 36-Month Transition Window: Key Deadlines for Manufacturers",
    summary: "Hardware and software manufacturers placing products on the EU market must complete vulnerability handling disclosures by late 2026.",
    source: "EU Journal of Legislation",
    category: "Enforcement",
    url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R2847",
    modelUsed: "perplexity/sonar-pro",
    publishedAt: new Date().toISOString(),
  },
  {
    title: "CISA & ENISA Joint Advisory on Coordinated Vulnerability Handling",
    summary: "Harmonized SBOM and 24-hour reporting protocols agreed between transatlantic agencies for hardware-embedded software.",
    source: "CISA / ENISA Joint Advisory",
    category: "Vulnerability Management",
    url: "https://www.cisa.gov/news-events/cybersecurity-advisories",
    modelUsed: "perplexity/sonar-pro",
    publishedAt: new Date().toISOString(),
  },
  {
    title: "EU Commission Finalizes Article 6 Class I & Class II Product Categories",
    summary: "Defined risk categories for operating systems, microcontrollers, VPN routers, and password managers requiring Third-Party Assessment.",
    source: "European Commission Portal",
    category: "Product Categorization",
    url: "https://ec.europa.eu/commission/presscorner/detail/en/ip_23_4522",
    modelUsed: "perplexity/sonar-pro",
    publishedAt: new Date().toISOString(),
  },
];

export function CommandCenter() {
  const { data: rawData, isLoading, isError } = useGetConformityPortfolio();
  const { data: session, isLoading: sessionLoading } = useGetAdminSession();
  const data = rawData || MOCK_PORTFOLIO_DATA;
  const now = Date.now();

  const [newsItems, setNewsItems] = useState<NewsItem[]>(DEFAULT_FALLBACK_NEWS);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsRefreshing, setNewsRefreshing] = useState(false);
  const [modelUsed, setModelUsed] = useState<string>("perplexity/sonar-pro");
  const [expandedCardId, setExpandedCardId] = useState<string | number | null>(null);

  const fetchNews = async (forceRefresh = false) => {
    if (forceRefresh) setNewsRefreshing(true);
    else setNewsLoading(true);

    try {
      const url = forceRefresh ? "/api/regulatory-news?refresh=true" : "/api/regulatory-news";
      const res = await fetch(url);
      const resData = await res.json();

      if (res.ok && resData.items && resData.items.length > 0) {
        setNewsItems(resData.items);
        if (resData.modelUsed) setModelUsed(resData.modelUsed);
      } else {
        setNewsItems(DEFAULT_FALLBACK_NEWS);
      }
    } catch (_err) {
      setNewsItems(DEFAULT_FALLBACK_NEWS);
    } finally {
      setNewsLoading(false);
      setNewsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews(false);
  }, []);

  useTour("portfolio", {
    ready: !isLoading && !!data && data.totals.assessments > 0 && !sessionLoading,
    isDemoRole: session?.role === "demo",
    isMember: session?.role === "member",
  });

  if (isLoading && !rawData) return <CommandCenterSkeleton />;

  const needsAction = data.risk.overdueDeadlines + data.risk.openBlockers;

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">

      {/* 1. Command Center Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 lg:p-7 shadow-sm text-card-foreground">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-2">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="oxot-kicker flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary" /> OPERATIONAL COMMAND CENTER
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-serif font-normal tracking-tight text-foreground">
              Conformity Operations &amp; Triage
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground font-sans leading-relaxed max-w-2xl">
              Every product assessment ranked by priority. Manage statutory Article 14 clocks, generate Annex IV technical files, and monitor live ENISA advisories.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start md:self-auto">
            <a href="/conformity/requirements">
              <Button size="sm" className="gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 shadow-sm text-xs cta-lift">
                Explore Requirements <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </a>
            <a href="/conformity/regulations">
              <Button size="sm" variant="outline" className="gap-1.5 border-border text-foreground hover:bg-muted font-medium text-xs cta-lift">
                View Regulations
              </Button>
            </a>
          </div>
        </div>
      </div>

      {/* 2. Unified Role-Based Persona Cockpit & Statutory Action Funnels */}
      <PersonaCockpit initialPersona="INTEGRATOR" />

      {/* 3. Compact High-Density Metric Cards (Single Row) */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard icon={ClipboardList} label="Active assessments" value={data.totals.assessments} tone="text-foreground" />
        <MetricCard
          icon={AlertTriangle}
          label="Needs action now"
          value={needsAction}
          tone={needsAction > 0 ? "text-red-500" : "text-muted-foreground"}
          sub={`${data.risk.overdueDeadlines} overdue · ${data.risk.openBlockers} blocker${data.risk.openBlockers === 1 ? "" : "s"}`}
        />
        <MetricCard
          icon={ShieldCheck}
          label="Ready for review"
          value={data.totals.readyForReview}
          tone={data.totals.readyForReview > 0 ? "text-green-600 font-bold" : "text-muted-foreground"}
        />
        <MetricCard
          icon={Boxes}
          label="Evidence coverage"
          value={data.evidence.evidenceCoverage == null ? "n/a" : `${data.evidence.evidenceCoverage}%`}
          tone={coverageTone(data.evidence.evidenceCoverage)}
        />
      </div>

      {/* 3. PROMOTED TRIAGE BOARD & PRIORITY ACTIONS (MOVED UP HIGHER) */}
      <Card className="rounded-2xl border shadow-md bg-card/90" data-tour="triage-board">
        <CardHeader className="pb-3 border-b">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/30 font-mono text-xs">
                  <Flame className="h-3.5 w-3.5 text-orange-400" /> Executive Intervention Triage Board
                </Badge>
                <Badge variant="secondary" className="font-mono text-xs">
                  {needsAction} Items Requiring Action
                </Badge>
              </div>
              <CardTitle className="text-xl font-bold">Product Assessment &amp; Blocker Triage</CardTitle>
              <CardDescription className="text-xs">
                Direct intervention board for blocked requirements, overdue statutory deadlines, and CRA journey execution.
              </CardDescription>
            </div>
            <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/30 font-mono text-[10px] hidden sm:inline-flex">
              High Priority
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          <TriageBoard products={data.products} />
        </CardContent>
      </Card>

      {/* 4. TWO-COLUMN HIGH-IMPACT ENGINE (LIVE REGULATORY NEWS & EVIDENCE COVERAGE) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {/* COLUMN 1: Live EU CRA Regulatory News Feed */}
        <Card className="rounded-2xl border shadow-sm bg-card/90 h-full flex flex-col justify-between">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 font-mono text-[10px]">
                    <Radio className="h-3 w-3 text-primary animate-pulse mr-1" /> Perplexity Sonar Realtime
                  </Badge>
                  <Badge variant="outline" className="text-[10px] font-mono bg-background">
                    {modelUsed.split("/")[1] || modelUsed}
                  </Badge>
                </div>
                <CardTitle className="text-base font-bold flex items-center gap-2 pt-1">
                  <Newspaper className="h-4 w-4 text-primary" /> Live Regulatory News
                </CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => fetchNews(true)}
                disabled={newsRefreshing || newsLoading}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                title="Refresh News Feed"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${newsRefreshing ? "animate-spin" : ""}`} />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-4 flex-1">
            {newsLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-28 w-full rounded-xl" />
                <Skeleton className="h-28 w-full rounded-xl" />
              </div>
            ) : (
              <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
                {newsItems.map((item, idx) => {
                  const cardId = item.id || idx;
                  const isExpanded = expandedCardId === cardId;

                  return (
                    <div
                      key={cardId}
                      className="rounded-xl border border-border/80 bg-background/60 p-3.5 space-y-2 hover:border-orange-500/40 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-1.5">
                        <Badge variant="secondary" className="text-[10px] font-mono bg-primary/10 text-primary border-primary/20">
                          {item.category || "CRA News"}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground font-mono flex items-center gap-1">
                          <Globe className="h-3 w-3 text-primary" /> {item.source}
                        </span>
                      </div>

                      <h4 className="font-bold text-xs text-foreground leading-snug hover:text-primary transition-colors cursor-pointer" onClick={() => setExpandedCardId(isExpanded ? null : cardId)}>
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-muted-foreground line-clamp-2 leading-relaxed">
                        {item.summary}
                      </p>

                      <div className="pt-1 flex items-center justify-between text-[10px] font-mono text-primary">
                        <button
                          type="button"
                          onClick={() => setExpandedCardId(isExpanded ? null : cardId)}
                          className="hover:underline font-semibold"
                        >
                          {isExpanded ? "Collapse Dossier" : "Read Briefing →"}
                        </button>
                        {item.url && (
                          <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center gap-0.5">
                            Source <ExternalLink className="h-2.5 w-2.5" />
                          </a>
                        )}
                      </div>

                      {isExpanded && (
                        <div className="mt-2 pt-2 border-t text-[11px] text-muted-foreground space-y-2">
                          <p className="leading-relaxed text-foreground font-medium bg-muted/40 p-2 rounded-lg">
                            {item.summary}
                          </p>
                          {item.complianceImpact && (
                            <p className="text-orange-400 font-medium">
                              <strong>Action:</strong> {item.complianceImpact}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* COLUMN 2: Evidence & Documentation Coverage */}
        <Card className="rounded-2xl border shadow-sm bg-card/90 h-full flex flex-col justify-between">
          <CardHeader className="pb-3 border-b">
            <div className="space-y-0.5">
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono text-[10px]">
                <ListChecks className="h-3 w-3 text-emerald-400 mr-1" /> Completeness
              </Badge>
              <CardTitle className="text-base font-bold flex items-center gap-2 pt-1">
                <ListChecks className="h-4 w-4 text-primary" /> Evidence &amp; Documentation
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Technical documentation completion &amp; answer quality distribution.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-4 flex-1 space-y-4">
            <CoveragePanel evidence={data.evidence} />
            <div className="border-t pt-4">
              <span className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider block mb-2">
                Quality Readiness Grades
              </span>
              <GradeDistribution grades={data.grades} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 5. INTERACTIVE ANIMATED DEADLINE HORIZON & REGULATORY SUITE */}
      <InteractiveDeadlineHorizon deadlines={data.deadlines} now={now} />

      <div className="w-full">
        <CraAnalyticsSuite />
      </div>
    </div>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  tone,
  sub,
}: {
  icon: any;
  label: string;
  value: any;
  tone: string;
  sub?: string;
}) {
  return (
    <Card className="rounded-xl border shadow-xs hover:shadow-md transition-all bg-card/80 backdrop-blur-sm">
      <CardContent className="p-3 px-4 flex items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-mono font-bold uppercase text-muted-foreground tracking-wider truncate">{label}</div>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className={cn("font-mono text-xl font-black tabular-nums tracking-tight", tone)}>{value}</span>
            {sub && <span className="text-[10px] text-muted-foreground font-mono truncate">{sub}</span>}
          </div>
        </div>
        <div className="rounded-lg bg-muted/60 p-2 text-muted-foreground shrink-0">
          <Icon className="h-4 w-4" />
        </div>
      </CardContent>
    </Card>
  );
}

function CommandCenterSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
      <Skeleton className="h-48 w-full rounded-3xl" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[0, 1, 2, 3].map((e) => (
          <Skeleton key={e} className="h-28 w-full rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-48 w-full rounded-2xl" />
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  );
}

function CommandCenterError() {
  return (
    <div className="mx-auto max-w-2xl p-8">
      <Card className="rounded-2xl border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" /> Couldn't load the command center
          </CardTitle>
          <CardDescription>
            The portfolio rollup didn't come back. Reload to try again.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Reload
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
