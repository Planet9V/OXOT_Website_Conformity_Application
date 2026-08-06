import { Component, Suspense, lazy, type ReactNode } from "react";
import { useGetConformitySummary, useGetAdminSession } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, Book, Layers, GitMerge, Radar, ArrowRight, ShieldCheck, Sparkles, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";

// The command center pulls in recharts + framer-motion; load it only for the
// authenticated admin path so public/login visitors don't pay for that bundle.
const CommandCenter = lazy(() =>
  import("@/components/conformity/portfolio/command-center").then((m) => ({
    default: m.CommandCenter,
  })),
);

/**
 * Fallback error boundary to handle dynamic import failures gracefully.
 */
class CommandCenterBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };

  static getDerivedStateFromError(): { failed: boolean } {
    return { failed: true };
  }

  componentDidCatch(error: unknown): void {
    console.error("Command center failed to load:", error);
  }

  render(): ReactNode {
    if (this.state.failed) {
      return (
        <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center h-full">
          <div className="max-w-sm space-y-3 text-center">
            <div className="text-destructive font-medium border border-destructive/20 bg-destructive/5 p-4 rounded-xl backdrop-blur-md">
              The command center failed to load.
            </div>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="text-sm font-medium text-cyan-400 hover:underline"
            >
              Reload the page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

/**
 * Main Dashboard Entry Point
 */
export default function Dashboard() {
  return (
    <CommandCenterBoundary>
      <Suspense fallback={<OverviewSkeleton />}>
        <CommandCenter />
      </Suspense>
    </CommandCenterBoundary>
  );
}

function OverviewSkeleton() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64 rounded-xl" />
        <Skeleton className="h-4 w-96 rounded-xl" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

/**
 * High-End Dark Glassmorphic Overview Component (10/10 UI Polish)
 */
function PublicOverview() {
  const { data: summary, isLoading, isError } = useGetConformitySummary();

  if (isLoading) return <OverviewSkeleton />;

  if (isError || !summary) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 flex items-center justify-center h-full">
        <div className="text-destructive font-medium border border-destructive/20 bg-destructive/5 p-4 rounded-xl backdrop-blur-md">
          Error loading regulatory reference data.
        </div>
      </div>
    );
  }

  // Statutory EU CRA & Regulatory Milestones:
  const keyMilestones = [
    {
      date: "20 Nov 2024",
      label: "EU CRA Entry into Force",
      desc: "Regulation (EU) 2024/2847 published in Official Journal.",
      ref: "CRA ART. 57",
      status: "completed",
    },
    {
      date: "21 Sep 2026",
      label: "Mandatory PSIRT 24h Early Warning Reporting",
      desc: "CSIRT & ENISA early notification obligation active.",
      ref: "CRA ART. 14",
      status: "upcoming",
      highlight: true,
    },
    {
      date: "11 Dec 2027",
      label: "Full CRA Statutory Enforcement",
      desc: "Mandatory CE marking, DoC & Annex VII Technical Files.",
      ref: "CRA ART. 10",
      status: "upcoming",
    },
    {
      date: "01 Jan 2028",
      label: "NIST Post-Quantum Cryptography Migration",
      desc: "Deprecation of legacy RSA/ECC algorithms across EU products.",
      ref: "CBOM PQC",
      status: "future",
    },
  ];

  return (
    <div className="relative p-4 sm:p-6 lg:p-8 space-y-10 max-w-7xl mx-auto text-slate-100 selection:bg-cyan-500/30">
      {/* Background Radial Glow Effect */}
      <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[500px] w-full -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950/80 to-transparent blur-3xl" />

      <SignInCta />

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/40 px-3 py-1 text-xs font-mono font-medium text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.15)] mb-3">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            STATUTORY COMPLIANCE ARCHITECTURE
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Regulatory Reference Matrix
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Unified cross-mapping engine aligning EU Cyber Resilience Act, IEC 62443, EU AI Act, and NIS2 Directive.
          </p>
        </div>
      </div>

      {/* 4 High-Density Glassmorphism Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <GlassStatCard
          title="Active Regulations"
          value={summary.regulationCount}
          subtitle="Direct EU Frameworks"
          icon={<Book className="w-5 h-5 text-cyan-400" />}
          gradient="from-cyan-500/20 to-blue-600/10 border-cyan-500/30"
        />
        <GlassStatCard
          title="Total Obligations"
          value={summary.requirementCount}
          subtitle="Mandatory Annex Clauses"
          icon={<Activity className="w-5 h-5 text-blue-400" />}
          gradient="from-blue-500/20 to-indigo-600/10 border-blue-500/30"
        />
        <GlassStatCard
          title="Cross-cutting Themes"
          value={summary.themeCount}
          subtitle="Security Domains"
          icon={<Layers className="w-5 h-5 text-indigo-400" />}
          gradient="from-indigo-500/20 to-purple-600/10 border-indigo-500/30"
        />
        <GlassStatCard
          title="Resolved Mappings"
          value={summary.mappingCount}
          subtitle="Cross-Standard Equivalence"
          icon={<GitMerge className="w-5 h-5 text-emerald-400" />}
          gradient="from-emerald-500/20 to-teal-600/10 border-emerald-500/30"
        />
      </div>

      {/* Main Grid: Requirements Breakdown + Statutory Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2-Cols: Requirements by Regulation */}
        <Card className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-800/80 bg-slate-950/40 px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-bold text-slate-100 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-cyan-400" />
                  Requirements by Regulation
                </CardTitle>
                <CardDescription className="text-slate-400 text-xs mt-0.5">
                  Volume of statutory obligations mapped per security framework.
                </CardDescription>
              </div>
              <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-1 rounded-full">
                {summary.requirementCount} Total Reqs
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            {summary.regulations.map((reg) => {
              const percentage = Math.round((reg.requirementCount / summary.requirementCount) * 100) || 0;
              return (
                <div key={reg.key} className="space-y-2 group">
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-200 group-hover:text-cyan-400 transition-colors">
                        {reg.name}
                      </span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400">
                        {reg.shortName}
                      </span>
                    </div>
                    <span className="font-mono text-xs text-slate-400">
                      <strong className="text-cyan-400 font-bold">{reg.requirementCount}</strong> reqs ({percentage}%)
                    </span>
                  </div>
                  {/* Glowing Multi-Color Progress Bar */}
                  <div className="h-3 w-full bg-slate-950/80 rounded-full overflow-hidden p-0.5 border border-slate-800">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500 shadow-[0_0_12px_rgba(34,211,238,0.5)] transition-all duration-700 ease-out"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Right Col: Statutory EU Milestones Timeline */}
        <Card className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-2xl overflow-hidden">
          <CardHeader className="border-b border-slate-800/80 bg-slate-950/40 px-6 py-5">
            <CardTitle className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              Statutory EU Milestones
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs mt-0.5">
              Enforcement timeline for EU CRA & security directives.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-6 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500/80 before:via-slate-700 before:to-transparent">
              {keyMilestones.map((m, idx) => (
                <div key={idx} className="relative flex items-start gap-4 pl-8 group">
                  {/* Timeline Dot Node */}
                  <div className={`absolute left-0 top-1 flex h-7 w-7 items-center justify-center rounded-full border shadow-md transition-transform group-hover:scale-110 ${
                    m.highlight
                      ? "border-cyan-400 bg-cyan-950 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.5)]"
                      : m.status === "completed"
                      ? "border-emerald-500 bg-emerald-950 text-emerald-400"
                      : "border-slate-700 bg-slate-900 text-slate-400"
                  }`}>
                    {m.status === "completed" ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : m.highlight ? (
                      <AlertCircle className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-slate-400" />
                    )}
                  </div>

                  {/* Timeline Content Card */}
                  <div className={`flex-1 rounded-xl border p-3.5 transition-all ${
                    m.highlight
                      ? "border-cyan-500/40 bg-cyan-950/30 shadow-[0_0_20px_rgba(34,211,238,0.1)]"
                      : "border-slate-800 bg-slate-950/40 hover:border-slate-700"
                  }`}>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-mono text-xs font-bold text-cyan-400">{m.date}</span>
                      <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                        {m.ref}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-slate-200">{m.label}</div>
                    <p className="text-xs text-slate-400 mt-1">{m.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function SignInCta() {
  return (
    <Link
      href="/products"
      className="group relative flex items-center justify-between gap-4 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/50 via-slate-900/60 to-indigo-950/50 p-5 backdrop-blur-xl shadow-[0_0_30px_rgba(34,211,238,0.08)] transition-all duration-300 hover:border-cyan-400/60 hover:shadow-[0_0_40px_rgba(34,211,238,0.2)]"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-cyan-500/40 bg-cyan-950/60 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)]">
          <Radar className="h-6 w-6 animate-spin-slow" aria-hidden />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
              Operational Command Center
            </span>
            <span className="rounded-full bg-cyan-500/20 px-2.5 py-0.5 text-[10px] font-mono font-medium text-cyan-400 border border-cyan-500/40">
              Live Triage Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Launch product assessments, track statutory 24h/72h PSIRT deadlines, and inspect 6-format xBOM evidence graphs.
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-xl bg-cyan-500/20 px-4 py-2 text-xs font-semibold text-cyan-300 border border-cyan-500/40 shadow-sm transition-transform group-hover:translate-x-1">
        Launch Cockpit <ArrowRight className="h-4 w-4" aria-hidden />
      </div>
    </Link>
  );
}

function GlassStatCard({
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
    <Card className={`rounded-2xl border bg-slate-900/60 backdrop-blur-xl shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl ${gradient}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-none">
        <CardTitle className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</CardTitle>
        <div className="p-2 rounded-xl bg-slate-950/60 border border-slate-800 shadow-inner">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-4xl font-extrabold font-mono tracking-tight text-slate-100 bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400 bg-clip-text text-transparent">
          {value}
        </div>
        <p className="text-[11px] text-slate-400 font-mono mt-1">{subtitle}</p>
      </CardContent>
    </Card>
  );
}
