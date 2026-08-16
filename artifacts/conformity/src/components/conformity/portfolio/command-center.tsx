import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useGetConformityPortfolio, useGetAdminSession } from "@workspace/api-client-react";
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
  Code2,
  Archive,
  ClipboardCheck,
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
import { PersonaCockpit } from "@/components/persona-cockpit";
import { YourWork } from "@/components/home/your-work";
import { PersonaCopilotDrawer } from "@/components/persona-copilot-drawer";
import { InteractiveFineSimulator } from "./interactive-fine-simulator";

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
    <Link href={href} className="group block">
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
    </Link>
  );
}

export function CommandCenter() {
  const { data: rawData, isLoading, isError } = useGetConformityPortfolio();
  const { data: session, isLoading: sessionLoading } = useGetAdminSession();
  const now = Date.now();

  const [newsItems, setNewsItems] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(false);
  const [newsRefreshing, setNewsRefreshing] = useState(false);
  const [modelUsed, setModelUsed] = useState<string>("perplexity/sonar-pro");
  const [expandedCardId, setExpandedCardId] = useState<string | number | null>(null);
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);




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
        // Show nothing rather than presenting canned stories as a live feed.
        setNewsItems([]);
      }
    } catch (_err) {
      setNewsItems([]);
    } finally {
      setNewsLoading(false);
      setNewsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews(false);
  }, []);

  useTour("portfolio", {
    ready: !isLoading && !!rawData && rawData.totals.assessments > 0 && !sessionLoading,
    isDemoRole: session?.role === "demo",
    isMember: session?.role === "member",
  });

  if (isLoading && !rawData) return <CommandCenterSkeleton />;
  // No silent fallback: a failed load renders an error, not a plausible dashboard.
  if (isError || !rawData) return <CommandCenterError />;
  const data = rawData;

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
              Every product assessment ranked by priority. Manage statutory CRA Article 14 clocks, assemble Annex VII technical documentation, and follow regulatory news.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start md:self-auto">
            <Link href="/requirements">
              <Button size="sm" className="gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-4 shadow-sm text-xs cta-lift">
                Explore Requirements <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </Link>
            <Link href="/regulations">
              <Button size="sm" variant="outline" className="gap-1.5 border-border text-foreground hover:bg-muted font-medium text-xs cta-lift">
                View Regulations
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* 2. The role-aware slice (7.2, D12): the member's own routed work
          first; a null team role renders an honest neutral notice instead. */}
      <YourWork />

      {/* 3. Organisation-wide cockpit, derived from the declarations. */}
      <PersonaCockpit />

      {/* 3. DYNAMIC PRIMARY OPERATIONAL WORKSTATION (PERSONA-ALIGNED) */}

              <Card className="rounded-2xl border shadow-md bg-card/90" data-tour="triage-board">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono text-xs">
                    <Flame className="h-3.5 w-3.5 text-emerald-400" /> OEM Product Line Triage &amp; Standards Presumption
                  </Badge>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {needsAction} Items Requiring Action
                  </Badge>
                </div>
                <CardTitle className="text-xl font-bold">Product Assessment, IEC 62443 Presumption &amp; CE Marking</CardTitle>
                <CardDescription className="text-xs">
                  Direct intervention board for blocked requirements, Annex I security evaluations, and CE nameplate production.
                </CardDescription>
              </div>
              <Link href="/library/statute">
                <Button size="sm" variant="outline" className="gap-1.5 font-mono text-xs">
                  Presumption of conformity (CRA Art. 27)
                </Button>
              </Link>
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

      {/* 6. Contextual Persona-Aware AI Copilot Drawer */}
      <PersonaCopilotDrawer
        isOpen={isCopilotOpen}
        onClose={() => setIsCopilotOpen(false)}
      />
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
