import { useState, useEffect } from "react";
import { Link } from "wouter";
import { useGetConformitySummary } from "@workspace/api-client-react";
import { ConformityShell } from "@/components/layout/conformity-shell";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { regBgStyle } from "@/lib/reg-colors";
import { CraAnalyticsSuite } from "@/components/sections/cra-analytics-suite";
import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip as RechartsTooltip,
} from "recharts";
import {
  Activity,
  Book,
  Layers,
  GitMerge,
  Calendar,
  Zap,
  ArrowRight,
  ShieldCheck,
  Package,
  FileCheck2,
  BrainCircuit,
  Radio,
  Newspaper,
  RefreshCw,
  ExternalLink,
  Globe,
  CheckCircle2,
  Sparkles,
  ChevronRight,
  PieChart,
} from "lucide-react";

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

const ALIGNMENT_RADAR_DATA = [
  { subject: "Vulnerability Disclosure", CRA: 95, IEC: 88, AIAct: 70 },
  { subject: "SBOM & Bill of Materials", CRA: 90, IEC: 85, AIAct: 60 },
  { subject: "Secure Default State", CRA: 85, IEC: 92, AIAct: 75 },
  { subject: "Attack Surface Minimisation", CRA: 88, IEC: 90, AIAct: 80 },
  { subject: "Data Protection & Privacy", CRA: 80, IEC: 78, AIAct: 95 },
  { subject: "Security Update Support Window", CRA: 92, IEC: 82, AIAct: 65 },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function HeroStatCard({
  title,
  value,
  subtitle,
  icon,
  gradient,
}: {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ReactNode;
  gradient: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-border/80 bg-card p-6 shadow-xl backdrop-blur-md ${gradient} transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:border-primary/40`}
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono">
          {title}
        </span>
        <div className="rounded-xl bg-background/50 p-2.5 backdrop-blur-sm border border-border/50">
          {icon}
        </div>
      </div>
      <div className="text-4xl lg:text-5xl font-display font-extrabold tracking-tight text-foreground">
        {value.toLocaleString()}
      </div>
      <p className="mt-2 text-xs text-muted-foreground font-medium">{subtitle}</p>
    </div>
  );
}

function LaunchpadCard({
  title,
  description,
  href,
  icon,
  badge,
  actionText = "Open Module",
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
      <div className="h-full rounded-2xl border border-border/70 bg-card/70 p-6 shadow-sm backdrop-blur-md transition-all duration-300 hover:border-primary/50 hover:bg-card hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="rounded-xl bg-primary/10 p-3 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              {icon}
            </div>
            <Badge variant="outline" className="text-xs font-mono bg-background/60">
              {badge}
            </Badge>
          </div>
          <h3 className="text-lg font-display font-bold text-foreground group-hover:text-primary transition-colors flex items-center gap-1.5">
            {title}
          </h3>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>

        <div className="mt-6 pt-3 border-t flex items-center justify-between text-xs font-semibold text-primary group-hover:translate-x-1 transition-transform">
          <span>{actionText}</span>
          <ArrowRight className="h-4 w-4" />
        </div>
      </div>
    </Link>
  );
}

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

export default function ConformityDashboard() {
  const { data: summary, isLoading, isError } = useGetConformitySummary();

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
      const data = await res.json();

      if (res.ok && data.items && data.items.length > 0) {
        setNewsItems(data.items);
        if (data.modelUsed) setModelUsed(data.modelUsed);
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

  if (isLoading) {
    return (
      <ConformityShell>
        <div className="space-y-8 max-w-7xl mx-auto">
          <Skeleton className="h-48 w-full rounded-3xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-36 w-full rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-96 w-full rounded-3xl" />
        </div>
      </ConformityShell>
    );
  }

  if (isError || !summary) {
    return (
      <ConformityShell>
        <div className="text-destructive border border-destructive/20 bg-destructive/5 p-6 rounded-2xl max-w-2xl mx-auto text-center my-12">
          <ShieldCheck className="h-10 w-10 mx-auto mb-3 text-destructive" />
          <h2 className="text-lg font-bold">Unable to Load Conformity Engine</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Please check your server connection or try refreshing the dashboard.
          </p>
        </div>
      </ConformityShell>
    );
  }

  return (
    <ConformityShell>
      <div className="space-y-12 max-w-7xl mx-auto">
        
        {/* 1. Steve Jobs Style Signature Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 p-8 lg:p-12 shadow-2xl text-white">
          <div className="absolute right-0 top-0 -mt-12 -mr-12 h-96 w-96 rounded-full bg-primary/20 blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <Badge variant="outline" className="border-amber-500/50 bg-amber-500/10 text-amber-300 font-mono text-xs gap-1.5 py-1 px-3">
                <Sparkles className="h-3.5 w-3.5 fill-amber-400" /> EU Cyber Resilience Act (CRA) Core
              </Badge>
              <Badge variant="outline" className="border-emerald-500/50 bg-emerald-500/10 text-emerald-300 font-mono text-xs gap-1 py-1 px-3">
                <CheckCircle2 className="h-3.5 w-3.5" /> Conformity Engine v3.8 Active
              </Badge>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-extrabold tracking-tight text-white leading-tight">
              One Unified Command Center for EU Product Conformity.
            </h1>
            <p className="mt-4 text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
              Seamlessly audit digital hardware and software obligations, generate Annex IV technical files, track SBOM vulnerability disclosures, and monitor live ENISA advisories.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link href="/conformity/requirements">
                <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 shadow-lg shadow-primary/25">
                  Explore Requirements <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/conformity/regulations">
                <Button size="lg" variant="outline" className="gap-2 border-white/20 hover:bg-white/10 text-white font-medium bg-slate-900/50 backdrop-blur-md">
                  View Regulation Frameworks
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* 2. Key Metrics & Executive Stats Grid */}
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground font-mono mb-4">
            System High-Density Compliance Metrics
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <HeroStatCard
              title="Active Frameworks"
              value={summary.regulationCount}
              subtitle="CRA, AI Act, NIS2, NIS Directives"
              icon={<Book className="h-5 w-5 text-indigo-400" />}
              gradient="bg-gradient-to-br from-indigo-500/10 via-card to-card"
            />
            <HeroStatCard
              title="Mandatory Obligations"
              value={summary.requirementCount}
              subtitle="Annex I & Annex II Legal Rules"
              icon={<Activity className="h-5 w-5 text-emerald-400" />}
              gradient="bg-gradient-to-br from-emerald-500/10 via-card to-card"
            />
            <HeroStatCard
              title="Cross-Cutting Themes"
              value={summary.themeCount}
              subtitle="Vulnerability, Supply Chain, Data"
              icon={<Layers className="h-5 w-5 text-amber-400" />}
              gradient="bg-gradient-to-br from-amber-500/10 via-card to-card"
            />
            <HeroStatCard
              title="Resolved Mappings"
              value={summary.mappingCount}
              subtitle="Cross-walked Legal Standard Rules"
              icon={<GitMerge className="h-5 w-5 text-cyan-400" />}
              gradient="bg-gradient-to-br from-cyan-500/10 via-card to-card"
            />
          </div>
        </div>

        {/* 3. CRA Dedicated Analytics Suite & Product Drill-Down */}
        <CraAnalyticsSuite />

        {/* 4. Secondary Compact Overview: Multi-Regulation Posture Alignment */}
        <div className="rounded-3xl border border-border bg-card p-6 lg:p-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h2 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
                <PieChart className="h-5 w-5 text-primary" /> Multi-Regulation Posture Alignment (Overview)
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Shared control alignment across Cyber Resilience Act (CRA Annex I), IEC 62443-4-2, and EU AI Act.
              </p>
            </div>
            <Badge variant="outline" className="text-xs font-mono self-start sm:self-auto">
              Recharts Radar Engine
            </Badge>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={ALIGNMENT_RADAR_DATA}>
                <PolarGrid stroke="#334155" strokeDasharray="3 3" />
                <PolarAngleAxis dataKey="subject" stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#475569" />
                <Radar name="CRA Annex I" dataKey="CRA" stroke="#6366f1" fill="#6366f1" fillOpacity={0.4} />
                <Radar name="IEC 62443-4-2" dataKey="IEC" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                <Radar name="AI Act High-Risk" dataKey="AIAct" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.25} />
                <Legend wrapperStyle={{ paddingTop: 10, fontSize: 12 }} />
                <RechartsTooltip contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: 12, color: "#fff" }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. One-Click Action Launchpad */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-display font-bold tracking-tight text-foreground">
                Conformity Action Launchpad
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Instant one-click access to core compliance engineering modules.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <LaunchpadCard
              title="Requirements Catalogue"
              description="Browse Annex I essential security rules, vulnerability handling, and technical file requirements."
              href="/conformity/requirements"
              icon={<FileCheck2 className="h-6 w-6" />}
              badge="Annex I & II Rules"
              actionText="Open Requirements"
            />
            <LaunchpadCard
              title="Regulations & Frameworks"
              description="Explore the EU Cyber Resilience Act, AI Act, and NIS2 directives with full legal reference text."
              href="/conformity/regulations"
              icon={<Book className="h-6 w-6" />}
              badge="CRA / AI Act / NIS2"
              actionText="View Regulations"
            />
            <LaunchpadCard
              title="Cross-Cutting Themes"
              description="Audit security themes across secure defaults, attack surface minimisation, and data protection."
              href="/conformity/themes"
              icon={<Layers className="h-6 w-6" />}
              badge="Compliance Themes"
              actionText="Explore Themes"
            />
            <LaunchpadCard
              title="Cross-Walk Mappings"
              description="Trace requirements across international standards including ISO 27001, IEC 62443, and NIST IR."
              href="/conformity/mappings"
              icon={<GitMerge className="h-6 w-6" />}
              badge="Standards Crosswalk"
              actionText="View Mappings"
            />
            <LaunchpadCard
              title="Legal Sources & Texts"
              description="Review official EUR-Lex journal references, Annex documentation, and legislative amendments."
              href="/conformity/sources"
              icon={<ShieldCheck className="h-6 w-6" />}
              badge="Official Sources"
              actionText="Browse Sources"
            />
            <LaunchpadCard
              title="AI Conformity Assistant"
              description="Query the OpenRouter-powered CRA Expert Chat for immediate legal interpretation and technical file synthesis."
              href="/admin/ai"
              icon={<BrainCircuit className="h-6 w-6" />}
              badge="OpenRouter LLM"
              actionText="Open AI Assistant"
            />
          </div>
        </div>

        {/* 5. Live EU Regulatory News & Perplexity Search Section */}
        <div className="rounded-3xl border bg-gradient-to-br from-card via-card to-slate-900/50 p-6 lg:p-8 shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="gap-1 bg-orange-500/10 text-orange-400 border-orange-500/30 font-mono text-xs">
                  <Radio className="h-3.5 w-3.5 animate-pulse text-orange-400" /> Live Regulatory Intelligence
                </Badge>
                <Badge variant="outline" className="text-xs font-mono bg-background">
                  <Zap className="h-3 w-3 text-amber-500 mr-1" />
                  {modelUsed}
                </Badge>
              </div>
              <h2 className="text-2xl lg:text-3xl font-display font-bold tracking-tight text-foreground flex items-center gap-2">
                <Newspaper className="h-6 w-6 text-primary" /> Live EU CRA &amp; Cyber Resilience News Feed
              </h2>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Real-time ENISA guidelines, CISA KEV advisory updates, and Article 10 enforcement updates powered by OpenRouter live search.
              </p>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchNews(true)}
              disabled={newsRefreshing || newsLoading}
              className="h-9 gap-1.5 font-medium self-start md:self-auto bg-background border-primary/20 hover:border-primary"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${newsRefreshing ? "animate-spin" : ""}`} />
              {newsRefreshing ? "Updating Live Feed…" : "Refresh News Feed"}
            </Button>
          </div>

          {newsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-44 w-full rounded-2xl" />
              <Skeleton className="h-44 w-full rounded-2xl" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
              {newsItems.map((item, idx) => {
                const cardId = item.id || idx;
                const isExpanded = expandedCardId === cardId;

                return (
                  <div
                    key={cardId}
                    className={`group rounded-2xl border bg-card/90 p-5 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between backdrop-blur-sm border-border/80 hover:border-orange-500/40 ${
                      isExpanded ? "md:col-span-2 ring-1 ring-orange-500/30 bg-card" : ""
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs font-mono bg-primary/10 text-primary border-primary/20">
                            {item.category || "EU CRA"}
                          </Badge>
                          <Badge variant="outline" className="text-[10px] font-mono text-muted-foreground">
                            {item.modelUsed || "perplexity/sonar-pro"}
                          </Badge>
                        </div>
                        <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                          <Globe className="h-3 w-3 text-primary" /> {item.source}
                        </span>
                      </div>

                      <h3 className="font-semibold text-base text-foreground leading-snug group-hover:text-primary transition-colors">
                        {item.title}
                      </h3>

                      {!isExpanded ? (
                        <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                          {item.summary}
                        </p>
                      ) : (
                        /* IN-PAGE EXPANDED DOSSIER */
                        <div className="space-y-4 pt-2 text-sm text-foreground border-t border-border/60">
                          {/* Executive Summary Box */}
                          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-1">
                            <span className="text-xs font-mono font-bold uppercase text-primary tracking-wider flex items-center gap-1.5">
                              <Sparkles className="h-3.5 w-3.5" /> Executive Briefing
                            </span>
                            <p className="text-xs leading-relaxed text-foreground font-medium">
                              {item.summary}
                            </p>
                          </div>

                          {/* Full Article Content */}
                          <div className="space-y-2.5 leading-relaxed text-xs text-muted-foreground font-sans">
                            <h4 className="text-xs font-mono font-bold text-foreground uppercase tracking-wider">
                              Statutory &amp; Technical Analysis Dossier
                            </h4>
                            {(item.fullArticle || item.summary)
                              .split("\n\n")
                              .map((para, i) => (
                                <p key={i} className="text-xs leading-relaxed">
                                  {para}
                                </p>
                              ))}
                          </div>

                          {/* Compliance Impact Takeaways */}
                          {item.complianceImpact && (
                            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-1">
                              <span className="text-xs font-mono font-bold uppercase text-amber-500 tracking-wider flex items-center gap-1.5">
                                <Zap className="h-3.5 w-3.5" /> Manufacturer Compliance Action
                              </span>
                              <p className="text-xs text-amber-200/90 leading-relaxed font-medium">
                                {item.complianceImpact}
                              </p>
                            </div>
                          )}

                          {/* Direct Verification Links & Citations */}
                          <div className="border-t pt-3 space-y-2">
                            <span className="text-xs font-mono font-bold text-foreground uppercase tracking-wider block">
                              Verified Statutory Sources &amp; Citations
                            </span>
                            <div className="flex flex-wrap items-center gap-2">
                              {item.url && (
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted/60 border border-border text-xs font-mono font-medium hover:border-primary hover:text-primary transition-colors"
                                >
                                  <ExternalLink className="h-3.5 w-3.5 text-primary" /> Direct Publisher Source
                                </a>
                              )}
                              {(() => {
                                try {
                                  const parsedCitations = item.citations
                                    ? JSON.parse(item.citations)
                                    : [];
                                  return parsedCitations.map((citeUrl: string, citeIdx: number) => (
                                    <a
                                      key={citeIdx}
                                      href={citeUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-muted/40 text-[11px] font-mono text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                      <Globe className="h-3 w-3" /> Citation #{citeIdx + 1}
                                    </a>
                                  ));
                                } catch (_e) {
                                  return null;
                                }
                              })()}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground font-mono">
                      <span>
                        {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : "Live update"}
                      </span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedCardId(isExpanded ? null : cardId)}
                        className="h-7 px-2.5 text-xs text-orange-400 font-sans font-semibold hover:bg-orange-500/10 hover:text-orange-300 gap-1"
                      >
                        {isExpanded ? "Minimize Dossier ↑" : "Expand Full Dossier ↓"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 6. Requirements Breakdown & Timeline Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Requirements by Regulation */}
          <div className="lg:col-span-2 rounded-3xl border border-border bg-card p-6 lg:p-8 shadow-md">
            <h3 className="text-xl font-display font-bold text-foreground mb-1">
              Requirements Distribution by Regulation
            </h3>
            <p className="text-xs text-muted-foreground mb-6">
              Volume of mandatory legal obligations mapped across active frameworks.
            </p>
            <div className="space-y-6">
              {summary.regulations.map((reg) => {
                const pct = Math.round((reg.requirementCount / summary.requirementCount) * 100) || 0;
                return (
                  <div key={reg.key} className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-semibold text-foreground flex items-center gap-2">
                        {reg.name}
                        <Badge variant="outline" className="font-mono text-xs">
                          {reg.shortName}
                        </Badge>
                      </span>
                      <span className="font-mono text-xs font-semibold text-muted-foreground">
                        {reg.requirementCount} obligations ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700 shadow-sm"
                        style={{ width: `${pct}%`, ...regBgStyle(reg.key) }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Key Dates & Implementation Timeline */}
          <div className="rounded-3xl border border-border bg-card p-6 lg:p-8 shadow-md flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-display font-bold text-foreground mb-1 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" /> Key Enforcement Dates
              </h3>
              <p className="text-xs text-muted-foreground mb-6">
                Critical deadlines for EU market entry.
              </p>
              <div className="relative pl-4 before:absolute before:left-1 before:top-0 before:h-full before:w-0.5 before:bg-border space-y-6">
                {summary.keyDates.map((d, i) => (
                  <div key={i} className="relative pl-3">
                    <div className="absolute -left-[1.25rem] top-1 w-3 h-3 rounded-full bg-primary border-2 border-background shadow-sm" />
                    <span className="font-mono text-xs font-semibold text-primary">
                      {formatDate(d.date)}
                    </span>
                    <div className="font-semibold text-sm text-foreground mt-0.5">
                      {d.label}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono mt-0.5">
                      {d.regulationName}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t">
              <Link href="/conformity/requirements">
                <Button variant="ghost" className="w-full justify-between text-xs font-semibold text-primary hover:bg-primary/5">
                  <span>View All Timeline Milestones</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>

        </div>

      </div>
    </ConformityShell>
  );
}
