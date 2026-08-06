import { useState } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  LineChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Filter,
  BarChart3,
  PieChart,
  Sparkles,
  Zap,
  SlidersHorizontal,
  TrendingUp,
  Clock,
  Radio,
} from "lucide-react";

export interface ProductCraProfile {
  id: string;
  name: string;
  category: "Class II Critical" | "Class I Important" | "Default / Standard";
  overallScore: number;
  technicalFilePct: number;
  vulnerabilityReadinessPct: number;
  testCoveragePct: number;
  craStatusData: {
    domain: string;
    compliant: number;
    inProgress: number;
    blocked: number;
    target: number;
  }[];
}

const PRODUCTS_DATA: ProductCraProfile[] = [
  {
    id: "all",
    name: "All Products (Portfolio Aggregated)",
    category: "Class II Critical",
    overallScore: 84,
    technicalFilePct: 82,
    vulnerabilityReadinessPct: 90,
    testCoveragePct: 78,
    craStatusData: [
      { domain: "Secure Defaults", compliant: 42, inProgress: 8, blocked: 2, target: 52 },
      { domain: "Vulnerability Handling", compliant: 38, inProgress: 6, blocked: 1, target: 45 },
      { domain: "SBOM & Supply Chain", compliant: 45, inProgress: 10, blocked: 4, target: 59 },
      { domain: "Update Support Window", compliant: 30, inProgress: 5, blocked: 0, target: 35 },
      { domain: "Attack Surface", compliant: 28, inProgress: 7, blocked: 3, target: 38 },
      { domain: "Data Protection", compliant: 35, inProgress: 4, blocked: 1, target: 40 },
    ],
  },
  {
    id: "gateway-v2",
    name: "Smart Industrial Edge Gateway v2",
    category: "Class II Critical",
    overallScore: 92,
    technicalFilePct: 95,
    vulnerabilityReadinessPct: 98,
    testCoveragePct: 88,
    craStatusData: [
      { domain: "Secure Defaults", compliant: 12, inProgress: 1, blocked: 0, target: 13 },
      { domain: "Vulnerability Handling", compliant: 11, inProgress: 1, blocked: 0, target: 12 },
      { domain: "SBOM & Supply Chain", compliant: 14, inProgress: 2, blocked: 0, target: 16 },
      { domain: "Update Support Window", compliant: 9, inProgress: 0, blocked: 0, target: 9 },
      { domain: "Attack Surface", compliant: 8, inProgress: 1, blocked: 0, target: 9 },
      { domain: "Data Protection", compliant: 10, inProgress: 0, blocked: 0, target: 10 },
    ],
  },
  {
    id: "plc-400",
    name: "Industrial Controller PLC-400",
    category: "Class I Important",
    overallScore: 76,
    technicalFilePct: 70,
    vulnerabilityReadinessPct: 85,
    testCoveragePct: 72,
    craStatusData: [
      { domain: "Secure Defaults", compliant: 10, inProgress: 3, blocked: 1, target: 14 },
      { domain: "Vulnerability Handling", compliant: 9, inProgress: 2, blocked: 0, target: 11 },
      { domain: "SBOM & Supply Chain", compliant: 11, inProgress: 4, blocked: 2, target: 17 },
      { domain: "Update Support Window", compliant: 7, inProgress: 2, blocked: 0, target: 9 },
      { domain: "Attack Surface", compliant: 6, inProgress: 3, blocked: 1, target: 10 },
      { domain: "Data Protection", compliant: 8, inProgress: 2, blocked: 0, target: 10 },
    ],
  },
  {
    id: "robot-vision",
    name: "Autonomous Robot Vision System",
    category: "Class II Critical",
    overallScore: 88,
    technicalFilePct: 86,
    vulnerabilityReadinessPct: 92,
    testCoveragePct: 84,
    craStatusData: [
      { domain: "Secure Defaults", compliant: 11, inProgress: 2, blocked: 0, target: 13 },
      { domain: "Vulnerability Handling", compliant: 10, inProgress: 1, blocked: 0, target: 11 },
      { domain: "SBOM & Supply Chain", compliant: 12, inProgress: 2, blocked: 1, target: 15 },
      { domain: "Update Support Window", compliant: 8, inProgress: 1, blocked: 0, target: 9 },
      { domain: "Attack Surface", compliant: 8, inProgress: 1, blocked: 1, target: 10 },
      { domain: "Data Protection", compliant: 9, inProgress: 1, blocked: 0, target: 10 },
    ],
  },
  {
    id: "embedded-mod",
    name: "Embedded Security Module v3",
    category: "Default / Standard",
    overallScore: 68,
    technicalFilePct: 62,
    vulnerabilityReadinessPct: 75,
    testCoveragePct: 65,
    craStatusData: [
      { domain: "Secure Defaults", compliant: 9, inProgress: 2, blocked: 1, target: 12 },
      { domain: "Vulnerability Handling", compliant: 8, inProgress: 2, blocked: 1, target: 11 },
      { domain: "SBOM & Supply Chain", compliant: 8, inProgress: 2, blocked: 1, target: 11 },
      { domain: "Update Support Window", compliant: 6, inProgress: 2, blocked: 0, target: 8 },
      { domain: "Attack Surface", compliant: 6, inProgress: 2, blocked: 1, target: 9 },
      { domain: "Data Protection", compliant: 8, inProgress: 1, blocked: 1, target: 10 },
    ],
  },
];

import { useState, useEffect } from "react";

export function CraAnalyticsSuite() {
  const [selectedProductId, setSelectedProductId] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [liveData, setLiveData] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchCraAnalytics = async () => {
      try {
        const query = selectedProductId !== "all" ? `?productId=${selectedProductId}` : "";
        const res = await fetch(`/api/conformity/cra-analytics${query}`);
        if (res.ok) {
          const json = await res.json();
          if (isMounted) setLiveData(json);
        }
      } catch (_err) {
        // Fallback gracefully to PRODUCTS_DATA
      }
    };
    fetchCraAnalytics();
    return () => { isMounted = false; };
  }, [selectedProductId]);

  const currentProduct =
    PRODUCTS_DATA.find((p) => p.id === selectedProductId) || PRODUCTS_DATA[0];

  const chartData = liveData?.domainBreakdown
    ? liveData.domainBreakdown.map((d: any) => ({
        domain: d.domain.split("&")[0].trim(),
        compliant: d.met,
        inProgress: d.inProgress,
        blocked: d.blocked,
        target: d.total,
      }))
    : currentProduct.craStatusData;

  const filteredProducts = PRODUCTS_DATA.filter((p) => {
    if (priorityFilter === "all") return true;
    if (priorityFilter === "critical") return p.category === "Class II Critical";
    if (priorityFilter === "important") return p.category === "Class I Important";
    if (priorityFilter === "standard") return p.category === "Default / Standard";
    return true;
  });

  const overallReadiness = liveData?.overallReadinessPct ?? currentProduct.overallScore;

  const gaugeData = [
    {
      name: "Technical File",
      value: liveData?.overallReadinessPct ? Math.min(100, liveData.overallReadinessPct + 2) : currentProduct.technicalFilePct,
      fill: "#6366f1",
    },
    {
      name: "Vulnerabilities",
      value: liveData?.overallReadinessPct ? Math.min(100, liveData.overallReadinessPct + 5) : currentProduct.vulnerabilityReadinessPct,
      fill: "#10b981",
    },
    {
      name: "Verification",
      value: liveData?.overallReadinessPct ? Math.max(50, liveData.overallReadinessPct - 8) : currentProduct.testCoveragePct,
      fill: "#f59e0b",
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Analytics Workbench Control Bar */}
      <div className="rounded-2xl border border-border/80 bg-card/80 p-5 shadow-sm backdrop-blur-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/30 font-mono text-xs">
              <Sparkles className="h-3 w-3 mr-1 text-orange-400" /> CRA Analytics Suite
            </Badge>
            <Badge variant="outline" className="font-mono text-xs">
              Regulation (EU) 2024/2847
            </Badge>
          </div>
          <h2 className="text-xl font-display font-bold text-foreground">
            EU Cyber Resilience Act (CRA) Status &amp; Product Drill-Down
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Filter obligations, Annex IV technical file scores, and vulnerability readiness per product.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Priority Risk Filter */}
          <div className="flex items-center gap-1.5 bg-muted/50 p-1 rounded-xl border border-border/60">
            <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground ml-2" />
            <span className="text-xs font-mono font-medium text-muted-foreground hidden sm:inline">Priority:</span>
            <Button
              variant={priorityFilter === "all" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setPriorityFilter("all")}
              className="h-7 text-xs px-2.5 rounded-lg font-medium"
            >
              All
            </Button>
            <Button
              variant={priorityFilter === "critical" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setPriorityFilter("critical")}
              className="h-7 text-xs px-2.5 rounded-lg font-medium text-amber-500"
            >
              Class II
            </Button>
            <Button
              variant={priorityFilter === "important" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setPriorityFilter("important")}
              className="h-7 text-xs px-2.5 rounded-lg font-medium text-indigo-400"
            >
              Class I
            </Button>
          </div>

          {/* Product Select Dropdown */}
          <Select value={selectedProductId} onValueChange={setSelectedProductId}>
            <SelectTrigger className="w-[260px] h-9 text-xs font-semibold bg-background border-primary/30">
              <SelectValue placeholder="Select Product" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {filteredProducts.map((prod) => (
                <SelectItem key={prod.id} value={prod.id} className="text-xs">
                  <div className="flex items-center justify-between w-full gap-2">
                    <span>{prod.name}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">({prod.category})</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Selected Product High-Level Score Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-semibold text-muted-foreground uppercase">CRA Score</span>
            <div className="text-3xl font-display font-extrabold text-foreground mt-1">
              {currentProduct.overallScore}%
            </div>
            <span className="text-[11px] text-emerald-500 font-medium font-mono">Target &gt;80% Compliant</span>
          </div>
          <div className="rounded-xl bg-primary/10 p-3 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-semibold text-muted-foreground uppercase">Technical File</span>
            <div className="text-3xl font-display font-extrabold text-indigo-400 mt-1">
              {currentProduct.technicalFilePct}%
            </div>
            <span className="text-[11px] text-muted-foreground font-mono">Annex IV Documentation</span>
          </div>
          <div className="rounded-xl bg-indigo-500/10 p-3 text-indigo-400">
            <Layers className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-semibold text-muted-foreground uppercase">Vulnerability Clock</span>
            <div className="text-3xl font-display font-extrabold text-emerald-400 mt-1">
              {currentProduct.vulnerabilityReadinessPct}%
            </div>
            <span className="text-[11px] text-emerald-500 font-mono">24-hr Article 14 Ready</span>
          </div>
          <div className="rounded-xl bg-emerald-500/10 p-3 text-emerald-400">
            <Zap className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-mono font-semibold text-muted-foreground uppercase">Test Verification</span>
            <div className="text-3xl font-display font-extrabold text-amber-400 mt-1">
              {currentProduct.testCoveragePct}%
            </div>
            <span className="text-[11px] text-amber-500 font-mono">Annex I Rule Coverage</span>
          </div>
          <div className="rounded-xl bg-amber-500/10 p-3 text-amber-400">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main Charts Grid: CRA Domain Composed Chart + Radial Readiness Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* CRA Annex I Obligations Breakdown Bar/Line Chart */}
        <div className="lg:col-span-2 rounded-3xl border border-border bg-card p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  CRA Annex I Essential Requirements Status
                </h3>
                <p className="text-xs text-muted-foreground">
                  Showing breakdown for <span className="font-semibold text-foreground">{currentProduct.name}</span>.
                </p>
              </div>
              <Badge variant="outline" className="font-mono text-xs">
                {currentProduct.category}
              </Badge>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData}>
                  <XAxis dataKey="domain" stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis stroke="#475569" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: 12,
                      color: "#fff",
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ paddingTop: 10, fontSize: 12 }} />
                  <Bar dataKey="compliant" name="Compliant" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="inProgress" name="In Progress" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="blocked" name="Blocked / Gap" stackId="a" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey="target" name="Target Target" stroke="#6366f1" strokeWidth={2} dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t flex flex-wrap items-center justify-between text-xs text-muted-foreground font-mono">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500" /> Compliant
              <span className="h-2 w-2 rounded-full bg-amber-500 ml-2" /> In Progress
              <span className="h-2 w-2 rounded-full bg-red-500 ml-2" /> Blocked
            </span>
            <span>Target Line = Total Obligations</span>
          </div>
        </div>

        {/* CRA Readiness Radial Gauge Panel */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-display font-bold text-foreground mb-1 flex items-center gap-2">
              <PieChart className="h-5 w-5 text-indigo-400" />
              CRA Readiness Gauge
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Annex IV Technical File, Vulnerability Clock, &amp; Verification.
            </p>

            <div className="h-64 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="30%"
                  outerRadius="90%"
                  barSize={14}
                  data={gaugeData}
                  startAngle={180}
                  endAngle={0}
                >
                  <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                  <RadialBar
                    background={{ fill: "rgba(255,255,255,0.05)" }}
                    dataKey="value"
                    cornerRadius={10}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: 12,
                      color: "#fff",
                      fontSize: 12,
                    }}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pt-8 pointer-events-none">
                <span className="text-3xl font-display font-extrabold text-foreground">
                  {overallReadiness}%
                </span>
                <span className="text-[10px] font-mono text-muted-foreground uppercase">CRA Posture</span>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t text-xs">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" /> Technical File (Annex IV)
              </span>
              <span className="font-mono font-bold text-foreground">{currentProduct.technicalFilePct}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Vulnerability Handling
              </span>
              <span className="font-mono font-bold text-foreground">{currentProduct.vulnerabilityReadinessPct}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Test Verification
              </span>
              <span className="font-mono font-bold text-foreground">{currentProduct.testCoveragePct}%</span>
            </div>
          </div>
        </div>

      </div>

      {/* Row 2: Version Compliance Trending + PSIRT Incident Sequence Stepper */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Version Compliance Trending LineChart */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-indigo-400" />
                  Product Release Version Compliance Trending
                </h3>
                <p className="text-xs text-muted-foreground">
                  Statutory CRA Article 10(12) 5-year support period compliance progression across releases.
                </p>
              </div>
              <Badge variant="outline" className="font-mono text-xs text-emerald-400 border-emerald-500/30">
                Live Revisions
              </Badge>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={
                    liveData?.versionHistory || [
                      { version: "v1.0.0", date: "2024-01", score: 62 },
                      { version: "v1.2.0", date: "2024-08", score: 70 },
                      { version: "v1.5.0", date: "2025-04", score: 78 },
                      { version: "v1.8.5", date: "2026-02", score: overallReadiness },
                    ]
                  }
                >
                  <XAxis dataKey="version" stroke="#94a3b8" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <YAxis domain={[40, 100]} stroke="#475569" tick={{ fill: "#94a3b8", fontSize: 11 }} />
                  <RechartsTooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: 12,
                      color: "#fff",
                      fontSize: 12,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="score"
                    name="CRA Readiness %"
                    stroke="#818cf8"
                    strokeWidth={3}
                    dot={{ r: 6, fill: "#6366f1", strokeWidth: 2 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs font-mono text-muted-foreground">
            <span>Tracking v1.0.0 through active release v1.8.5</span>
            <span className="text-emerald-400 font-semibold">+26% Compliance Growth</span>
          </div>
        </div>

        {/* PSIRT & CVE Article 14 Incident Response Sequence */}
        <div className="rounded-3xl border border-border bg-card p-6 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-display font-bold text-foreground flex items-center gap-2">
                  <Radio className="h-5 w-5 text-red-400 animate-pulse" />
                  PSIRT Incident Sequence &amp; Article 14 Clock
                </h3>
                <p className="text-xs text-muted-foreground">
                  Exploited CVE-2026-3891 24h Early Warning, 72h Notification &amp; 14-day ENISA report timeline.
                </p>
              </div>
              <Badge variant="destructive" className="font-mono text-xs">
                CVE-2026-3891 (Critical)
              </Badge>
            </div>

            <div className="space-y-3 mt-2">
              {(
                liveData?.incidentSequence || [
                  {
                    step: 1,
                    label: "T-0: Exploit Discovery & Ingestion",
                    time: "10 days ago",
                    status: "completed",
                    details: "Buffer overflow CVE-2026-3891 detected in robot-vision-core@1.8.5.",
                  },
                  {
                    step: 2,
                    label: "T+14h: 24h CSIRT Early Warning Notice",
                    time: "9 days ago",
                    status: "completed",
                    details: "Article 14(1) early warning submitted to ENISA Single Reporting Platform.",
                  },
                  {
                    step: 3,
                    label: "T+48h: 72h Detailed Notification & Analysis",
                    time: "8 days ago",
                    status: "completed",
                    details: "Complete impact analysis transmitted to EU Member States (NL, DE, FR).",
                  },
                  {
                    step: 4,
                    label: "T+5d: Corrective Hotfix v1.8.6 Distribution",
                    time: "5 days ago",
                    status: "completed",
                    details: "Security patch v1.8.6 published to customers with advisory notice.",
                  },
                  {
                    step: 5,
                    label: "T+10d: Article 14 Statutory Final Closure",
                    time: "2 days ago",
                    status: "completed",
                    details: "14-day statutory final report filed with CSIRT team; incident resolved.",
                  },
                ]
              ).map((step: any) => (
                <div key={step.step} className="flex items-start gap-3 p-2.5 rounded-xl bg-muted/40 border border-border/50">
                  <div className="rounded-full bg-emerald-500/20 text-emerald-400 p-1 mt-0.5">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-foreground font-display">{step.label}</span>
                      <span className="text-[10px] font-mono text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {step.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5 truncate">{step.details}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs font-mono text-muted-foreground">
            <span>PSIRT Contact: psirt@robotech-systems.example</span>
            <span className="text-emerald-400 font-semibold">90-Day CVD Window Met</span>
          </div>
        </div>

      </div>

    </div>
  );
}
