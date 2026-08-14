import { useState, useEffect } from "react";
import { Link } from "wouter";
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
import { PersonaCockpit, type PersonaId } from "@/components/persona-cockpit";
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
  const [activePersona, setActivePersona] = useState<PersonaId>("INTEGRATOR");
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);

  const normalizePersona = (p: string | null): PersonaId | null => {
    if (!p) return null;
    const upper = p.toUpperCase();
    if (upper === "CISO" || upper === "PLANT_CISO" || upper === "PLANT-CISO") return "PLANT_CISO";
    if (upper === "INTEGRATOR" || upper === "SI") return "INTEGRATOR";
    if (upper === "MANUFACTURER" || upper === "OEM") return "MANUFACTURER";
    if (upper === "STEWARD" || upper === "FOSS") return "STEWARD";
    if (upper === "IMPORTER" || upper === "DISTRIBUTOR") return "IMPORTER";
    if (upper === "AUDITOR" || upper === "NB") return "AUDITOR";
    return null;
  };

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const personaParam = normalizePersona(params.get("persona"));
    if (personaParam) {
      setActivePersona(personaParam);
    }
  }, []);

  const handlePersonaChange = (persona: PersonaId) => {
    setActivePersona(persona);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("persona", persona.toLowerCase());
      window.history.replaceState({}, "", url.toString());
    }
  };

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

      {/* 2. Unified Role-Based Persona Cockpit & Statutory Action Funnels */}
      <PersonaCockpit
        activePersona={activePersona}
        onPersonaChange={handlePersonaChange}
        onOpenCopilot={() => setIsCopilotOpen(true)}
      />

      {/* 3. DYNAMIC PRIMARY OPERATIONAL WORKSTATION (PERSONA-ALIGNED) */}
      {activePersona === "INTEGRATOR" && (
        <div className="space-y-6">
          <Card className="rounded-2xl border shadow-md bg-card/90" data-tour="triage-board">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 font-mono text-xs">
                      <ShieldCheck className="h-3.5 w-3.5 text-amber-400 mr-1" /> Axians Brownfield Multi-Plant Modernization Board
                    </Badge>
                    <Badge variant="secondary" className="font-mono text-xs">
                      3 Plants Protected
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-bold">Customer Plant Portfolio &amp; Recital 34 Safe Harbor Shield</CardTitle>
                  <CardDescription className="text-xs">
                    Automated brownfield gatekeeper ensuring plant maintenance does not trigger Article 21 substantial modification or €15M manufacturer liabilities.
                  </CardDescription>
                </div>
                <Link href="/partner-hub">
                  <Button size="sm" className="gap-1.5 font-mono text-xs">
                    Open 5-Stage Plant Hub <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-muted/40 border border-border/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-foreground">Vopak Chemical Terminal</span>
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 font-mono text-[10px]">Shield Active</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Rotterdam, NL • 420 OT Nodes • Legacy brownfield DCS/SCADA retrofitted under Recital 34 spare parts exemption.</p>
                  <div className="pt-1 font-mono text-[10px] text-primary">SHA-256: 7f8a9b2c... Sealed</div>
                </div>
                <div className="p-4 rounded-xl bg-muted/40 border border-border/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-foreground">BASF Chemical Production</span>
                    <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20 font-mono text-[10px]">Annex III Class I</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Antwerp, BE • 680 OT Nodes • Network gateway retrofitted; 24h CSIRT emergency alert router operational.</p>
                  <div className="pt-1 font-mono text-[10px] text-primary">SHA-256: 4e3d2c1b... Sealed</div>
                </div>
                <div className="p-4 rounded-xl bg-muted/40 border border-border/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-foreground">Stellantis Paint Shop</span>
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20 font-mono text-[10px]">Vendor Radar Block</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Sochaux, FR • 320 OT Nodes • Article 18(2) Duty to Refrain triggered on unpatched upstream OEM switch.</p>
                  <div className="pt-1 font-mono text-[10px] text-amber-500">Hold Order Active: PO-2026-881</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <InteractiveFineSimulator defaultTurnover={450} defaultMitigation={94} />
        </div>
      )}

      {activePersona === "MANUFACTURER" && (
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
              <div className="flex items-center gap-2">
                <Link href="/standards">
                  <Button size="sm" variant="outline" className="gap-1.5 font-mono text-xs">
                    Standards Matrix (Art. 34)
                  </Button>
                </Link>
                <Link href="/ce-studio">
                  <Button size="sm" className="gap-1.5 font-mono text-xs">
                    CE Nameplate Studio
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <TriageBoard products={data.products} />
          </CardContent>
        </Card>
      )}

      {activePersona === "STEWARD" && (
        <Card className="rounded-2xl border shadow-md bg-card/90" data-tour="triage-board">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/30 font-mono text-xs">
                    <Code2 className="h-3.5 w-3.5 text-purple-400" /> Open-Source Software Steward &amp; OpenVEX Studio
                  </Badge>
                  <Badge variant="secondary" className="font-mono text-xs">
                    Recital 18 FOSS Exemption
                  </Badge>
                </div>
                <CardTitle className="text-xl font-bold">Open-Source Repository Health &amp; Article 33 Attestations</CardTitle>
                <CardDescription className="text-xs">
                  Maintain non-commercial liability shields, issue OASIS OpenVEX vulnerability statements, and publish CVD policies.
                </CardDescription>
              </div>
              <Link href="/steward">
                <Button size="sm" className="gap-1.5 font-mono text-xs">
                  Open Steward Hub <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-muted/40 border border-border/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-foreground">OPC-UA Core Protocol (Rust)</span>
                  <Badge variant="outline" className="bg-purple-500/10 text-purple-400 border-purple-500/20 font-mono text-[10px]">Art. 33 Attested</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Industrial connectivity library • Documented security policy &amp; automated CVE disclosure pipeline.</p>
                <div className="pt-1 font-mono text-[10px] text-green-500">Recital 18 Shield: Active</div>
              </div>
              <div className="p-4 rounded-xl bg-muted/40 border border-border/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-foreground">Modbus-TCP Stack (C++)</span>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-mono text-[10px]">OpenVEX Published</Badge>
                </div>
                <p className="text-xs text-muted-foreground">PLC driver stack • 3 upstream CVEs documented as non-exploitable via OASIS OpenVEX v1.0 standard.</p>
                <div className="pt-1 font-mono text-[10px] text-primary">OpenVEX Hash: 8b7a6c...</div>
              </div>
              <div className="p-4 rounded-xl bg-muted/40 border border-border/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-foreground">CoAP IoT Sensor Hub (Go)</span>
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 font-mono text-[10px]">CVD Active</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Lightweight messaging protocol • RFC 9116 security.txt published; PGP security keys verified.</p>
                <div className="pt-1 font-mono text-[10px] text-primary">RFC 9116: Compliant</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activePersona === "IMPORTER" && (
        <Card className="rounded-2xl border shadow-md bg-card/90" data-tour="triage-board">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/30 font-mono text-xs">
                    <Archive className="h-3.5 w-3.5 text-blue-400" /> 10-Year Statutory Compliance Archive &amp; Customs Gate
                  </Badge>
                  <Badge variant="secondary" className="font-mono text-xs">
                    Article 17 Retention Mandate
                  </Badge>
                </div>
                <CardTitle className="text-xl font-bold">Importer Evidence Vault &amp; Technical Dossier Retention</CardTitle>
                <CardDescription className="text-xs">
                  Maintain sealed technical documentation files at the disposal of Market Surveillance Authorities through 2037+.
                </CardDescription>
              </div>
              <Link href="/archive">
                <Button size="sm" className="gap-1.5 font-mono text-xs">
                  Open 10Y Archive Ledger <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-muted/40 border border-border/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-foreground">Siemens Scalance XC-208</span>
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 font-mono text-[10px]">Valid to 2036-04</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Industrial Managed Switch • Annex VII technical file and Annex V DoC cryptographically sealed.</p>
                <div className="pt-1 font-mono text-[10px] text-green-500">Customs Clearance: Approved</div>
              </div>
              <div className="p-4 rounded-xl bg-muted/40 border border-border/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-foreground">Fortinet FortiGate 60F</span>
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 font-mono text-[10px]">Valid to 2036-03</Badge>
                </div>
                <p className="text-xs text-muted-foreground">OT Security Gateway • Pre-importation Article 17 due diligence verified; MSA audit token ready.</p>
                <div className="pt-1 font-mono text-[10px] text-green-500">Customs Clearance: Approved</div>
              </div>
              <div className="p-4 rounded-xl bg-muted/40 border border-border/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-foreground">Belden Hirschmann RS20</span>
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 font-mono text-[10px]">Valid to 2036-02</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Rail Switch • Complete supplier documentation bundle and CE test certificates archived.</p>
                <div className="pt-1 font-mono text-[10px] text-green-500">Customs Clearance: Approved</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {activePersona === "PLANT_CISO" && (
        <div className="space-y-6">
          <Card className="rounded-2xl border shadow-md bg-card/90" data-tour="triage-board">
            <CardHeader className="pb-3 border-b">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/30 font-mono text-xs">
                      <Radar className="h-3.5 w-3.5 text-rose-400" /> NIS2 &amp; CRA Executive Risk Radar
                    </Badge>
                    <Badge variant="secondary" className="font-mono text-xs">
                      €15M Penalty Shield
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-bold">Article 61 Fine Exposure &amp; 24h CSIRT Early Warning Hub</CardTitle>
                  <CardDescription className="text-xs">
                    Model financial liability across operational plants and maintain compliance with mandatory ENISA reporting deadlines.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Link href="/partner-hub">
                    <Button size="sm" variant="outline" className="gap-1.5 font-mono text-xs">
                      Exposure Calculator
                    </Button>
                  </Link>
                  <Link href="/reports">
                    <Button size="sm" className="gap-1.5 font-mono text-xs">
                      Executive Briefing
                    </Button>
                  </Link>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-muted/40 border border-border/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-foreground">Turnover Fine Exposure</span>
                    <Badge variant="outline" className="bg-rose-500/10 text-rose-400 border-rose-500/20 font-mono text-[10px]">Article 61</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">€15,000,000 or 2.5% global turnover statutory cap protected through continuous audit evidence.</p>
                  <div className="pt-1 font-mono text-[10px] text-green-500">Liability Shield: Active</div>
                </div>
                <div className="p-4 rounded-xl bg-muted/40 border border-border/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-foreground">Mandatory 24h CSIRT Clock</span>
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 font-mono text-[10px]">Article 14</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Active integration with ANSSI, BSI, NCSC-NL and ENISA early warning notification routing.</p>
                  <div className="pt-1 font-mono text-[10px] text-amber-500">Mandate: 11 Sept 2026</div>
                </div>
                <div className="p-4 rounded-xl bg-muted/40 border border-border/70 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-foreground">NIS2 Supply Chain Gate</span>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-mono text-[10px]">NIS2 Art. 21</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">Direct correlation between CRA product CE conformity and plant-wide NIS2 essential entity audits.</p>
                  <div className="pt-1 font-mono text-[10px] text-primary">Audit Status: Compliant</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <InteractiveFineSimulator defaultTurnover={1200} defaultMitigation={88} />
        </div>
      )}

      {activePersona === "AUDITOR" && (
        <Card className="rounded-2xl border shadow-md bg-card/90" data-tour="triage-board">
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-zinc-500/10 text-zinc-400 border-zinc-500/30 font-mono text-xs">
                    <ClipboardCheck className="h-3.5 w-3.5 text-zinc-400" /> Module H / B+C Examination Portal
                  </Badge>
                  <Badge variant="secondary" className="font-mono text-xs">
                    Notified Body Audit Mode
                  </Badge>
                </div>
                <CardTitle className="text-xl font-bold">Independent Conformity Assessment &amp; Technical File Verification</CardTitle>
                <CardDescription className="text-xs">
                  Examine Annex VII technical dossiers, verify cryptographic evidence hashes, and issue formal audit findings.
                </CardDescription>
              </div>
              <Link href="/auditor-portal">
                <Button size="sm" className="gap-1.5 font-mono text-xs">
                  Open Auditor Portal <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-muted/40 border border-border/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-foreground">Scalance XC-208 Technical File</span>
                  <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20 font-mono text-[10px]">Ready for Review</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Annex VII sections 1-6 complete • Threat modeling and independent penetration test reports attached.</p>
                <div className="pt-1 font-mono text-[10px] text-primary">SHA-256 Digest: Verified</div>
              </div>
              <div className="p-4 rounded-xl bg-muted/40 border border-border/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-foreground">FortiGate 60F Module B Dossier</span>
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 font-mono text-[10px]">1 Open RFI</Badge>
                </div>
                <p className="text-xs text-muted-foreground">EU-Type Examination in progress • Auditor inquiry issued regarding cryptographic hardware root of trust.</p>
                <div className="pt-1 font-mono text-[10px] text-amber-500">RFI Response: Pending</div>
              </div>
              <div className="p-4 rounded-xl bg-muted/40 border border-border/70 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-foreground">Belden RS20 Quality System</span>
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 font-mono text-[10px]">Module H Approved</Badge>
                </div>
                <p className="text-xs text-muted-foreground">Full Quality Assurance certification granted under Regulation (EU) 2024/2847 Annex VIII.</p>
                <div className="pt-1 font-mono text-[10px] text-green-500">Certificate: NB-2026-0881</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

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
        activePersona={activePersona}
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
