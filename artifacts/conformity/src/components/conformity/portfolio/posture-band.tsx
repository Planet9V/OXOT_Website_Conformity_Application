import { motion, useReducedMotion } from "framer-motion";
import type { PortfolioTotals } from "@workspace/api-client-react";
import { cn } from "@/lib/utils";
import { READINESS, READINESS_ORDER } from "./theme";
import { TermHint } from "@/components/conformity/glossary-dialog";

/**
 * A single segmented bar showing how the portfolio's assessments are distributed
 * across the workflow — blocked first (left) so problems lead the eye, ready
 * last. This is journey posture (progress), deliberately NOT answer quality.
 */
export function PostureBand({ totals }: { totals: PortfolioTotals }) {
  const reduce = useReducedMotion();
  const counts: Record<string, number> = {
    blocked: totals.blocked,
    in_progress: totals.inProgress,
    not_started: totals.notStarted,
    ready: totals.readyForReview,
  };
  const total = totals.assessments || 1;

  return (
    <div className="space-y-3">
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
        {READINESS_ORDER.map((k) => {
          const pct = (counts[k] / total) * 100;
          if (pct <= 0) return null;
          return (
            <motion.div
              key={k}
              className={cn("h-full", READINESS[k].bar)}
              initial={reduce ? { width: `${pct}%` } : { width: "0%" }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            />
          );
        })}
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        {READINESS_ORDER.map((k) => (
          <div key={k} className="flex items-center gap-2 text-sm">
            <span className={cn("h-2.5 w-2.5 rounded-full", READINESS[k].dot)} aria-hidden />
            <TermHint
              terms={k === "ready" ? ["readiness", "posture"] : ["posture"]}
              className="text-muted-foreground"
            >
              {READINESS[k].label}
            </TermHint>
            <span className="font-mono font-semibold tabular-nums">{counts[k]}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
