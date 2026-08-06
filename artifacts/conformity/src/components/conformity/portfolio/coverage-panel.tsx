import { motion, useReducedMotion } from "framer-motion";
import type { PortfolioEvidence } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";
import { coverageBar, coverageTone } from "./theme";

/**
 * Three honest coverage measures. Each shows the real numerator/denominator so
 * a percentage can never overstate progress; when there is nothing to measure
 * yet the value is "n/a" (never a fake 0% or 100%).
 */
function Metric({
  label,
  pct,
  numer,
  denom,
  unit,
  emptyText,
  emphasize = false,
}: {
  label: string;
  pct: number | null;
  numer: number;
  denom: number;
  unit: string;
  emptyText: string;
  emphasize?: boolean;
}) {
  const reduce = useReducedMotion();
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-2">
        <span className={cn("font-medium", emphasize ? "text-sm" : "text-sm text-muted-foreground")}>{label}</span>
        <span className={cn("font-mono font-bold tabular-nums", emphasize ? "text-2xl" : "text-lg", coverageTone(pct))}>
          {pct == null ? "n/a" : `${pct}%`}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className={cn("h-full rounded-full", coverageBar(pct))}
          initial={reduce ? { width: `${pct ?? 0}%` } : { width: "0%" }}
          animate={{ width: `${pct ?? 0}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <p className="text-xs text-muted-foreground">{denom === 0 ? emptyText : `${numer} of ${denom} ${unit}`}</p>
    </div>
  );
}

export function CoveragePanel({ evidence }: { evidence: PortfolioEvidence }) {
  return (
    <div className="space-y-6">
      <Metric
        emphasize
        label="Evidence coverage"
        pct={evidence.evidenceCoverage}
        numer={evidence.evidencedRequirements}
        denom={evidence.applicableRequirements}
        unit="applicable requirements have evidence attached"
        emptyText="No applicable requirements to evidence yet"
      />
      <Metric
        label="Requirement resolution"
        pct={evidence.requirementCoverage}
        numer={evidence.resolvedRequirements}
        denom={evidence.totalRequirements}
        unit="requirements met or ruled not-applicable"
        emptyText="No requirements built yet"
      />
      <Metric
        label="Documentation"
        pct={evidence.documentationCoverage}
        numer={evidence.completeSections}
        denom={evidence.totalSections}
        unit="document sections completed"
        emptyText="No document sections drafted yet"
      />
    </div>
  );
}
