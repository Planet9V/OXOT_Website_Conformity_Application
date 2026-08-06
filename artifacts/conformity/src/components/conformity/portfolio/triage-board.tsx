import { Link } from "wouter";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  BellOff,
  Clock,
  FileWarning,
  ShieldAlert,
  CheckCircle2,
  ChevronRight,
  Activity,
  type LucideIcon,
} from "lucide-react";
import type { PortfolioProduct } from "@workspace/api-client-react";
import { cn, getRegColor } from "@/lib/utils";
import { readinessMeta, gradeColor, regLabel } from "./theme";

function Chip({ icon: Icon, label, tone }: { icon: LucideIcon; label: string; tone: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium", tone)}>
      <Icon className="h-3 w-3" aria-hidden /> {label}
    </span>
  );
}

function HeadlineIcon({ p }: { p: PortfolioProduct }) {
  const cls = "h-4 w-4 shrink-0";
  if (p.overdueDeadlines > 0 || p.blockers > 0) return <ShieldAlert className={cls} aria-hidden />;
  if (p.dueSoonDeadlines > 0 || p.openIncidents > 0) return <Clock className={cls} aria-hidden />;
  if (p.readiness === "ready") return <CheckCircle2 className={cls} aria-hidden />;
  return <Activity className={cls} aria-hidden />;
}

function Row({ p, index }: { p: PortfolioProduct; index: number }) {
  const reduce = useReducedMotion();
  const meta = readinessMeta(p.readiness);
  const g = gradeColor(p.grade);

  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduce ? 0 : Math.min(index * 0.03, 0.3), duration: 0.3, ease: "easeOut" }}
    >
      <Link
        href={`/assessments/${p.assessmentId}`}
        data-testid="triage-row"
        className="group flex items-stretch overflow-hidden rounded-md border border-border bg-card transition-colors hover:border-primary/40 hover:bg-muted/30"
      >
        <span className={cn("w-1 shrink-0", meta.bar)} aria-hidden />
        <div className="flex flex-1 flex-col gap-3 p-4 sm:flex-row sm:items-center">
          {/* identity + headline */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className={cn("shrink-0 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide", getRegColor(p.regulationKey))}>
                {regLabel(p.regulationKey)}
              </span>
              <h3 className="truncate font-semibold">{p.productName}</h3>
            </div>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">{p.manufacturerName || "—"}</p>
            <p className={cn("mt-1.5 flex items-center gap-1.5 text-sm font-medium", meta.text)}>
              <HeadlineIcon p={p} /> {p.headline}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {p.overdueDeadlines > 0 && (
                <Chip icon={AlertTriangle} label={`${p.overdueDeadlines} overdue`} tone="bg-red-500/10 text-red-500" />
              )}
              {p.silencedDeadlines > 0 && (
                <span title="Overdue deadlines whose reminder emails are exhausted — nobody will be nudged again">
                  <Chip
                    icon={BellOff}
                    label={`alerting stopped on ${p.silencedDeadlines}`}
                    tone="bg-red-500/10 text-red-600"
                  />
                </span>
              )}
              {p.blockers > 0 && (
                <Chip icon={ShieldAlert} label={`${p.blockers} blocker${p.blockers === 1 ? "" : "s"}`} tone="bg-red-500/10 text-red-500" />
              )}
              {p.dueSoonDeadlines > 0 && (
                <Chip icon={Clock} label={`${p.dueSoonDeadlines} due soon`} tone="bg-amber-500/10 text-amber-600" />
              )}
              {p.openIncidents > 0 && (
                <Chip icon={Activity} label={`${p.openIncidents} incident${p.openIncidents === 1 ? "" : "s"}`} tone="bg-amber-500/10 text-amber-600" />
              )}
              {p.highRiskGaps > 0 && (
                <Chip icon={FileWarning} label={`${p.highRiskGaps} high-risk`} tone="bg-orange-500/10 text-orange-600" />
              )}
              {p.readiness === "ready" && (
                <Chip icon={CheckCircle2} label="Ready for review" tone="bg-green-500/10 text-green-600" />
              )}
            </div>
          </div>

          {/* metrics cluster */}
          <div className="flex shrink-0 items-center gap-4 sm:gap-5">
            <div className="w-28">
              <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Journey</span>
                <span className="font-mono tabular-nums">
                  {p.journeyDone}/{p.journeyTotal}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div className={cn("h-full rounded-full", meta.bar)} style={{ width: `${p.journeyPct}%` }} />
              </div>
              <div className="mt-1 truncate text-[11px] text-muted-foreground">{p.journeyStage}</div>
            </div>
            <div className="w-14 text-center">
              <div className="font-mono text-sm font-bold tabular-nums">
                {p.evidenceCoverage == null ? "n/a" : `${p.evidenceCoverage}%`}
              </div>
              <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Evidence</div>
            </div>
            <div
              className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-md border text-lg font-bold", g.chip)}
              title={p.grade ? `Grade ${p.grade}` : "Not graded"}
            >
              {p.grade ?? "—"}
            </div>
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export function TriageBoard({ products }: { products: PortfolioProduct[] }) {
  if (products.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">No assessments to triage yet.</p>;
  }
  return (
    <div className="space-y-2" data-testid="triage-board">
      {products.map((p, i) => (
        <Row key={p.assessmentId} p={p} index={i} />
      ))}
    </div>
  );
}
