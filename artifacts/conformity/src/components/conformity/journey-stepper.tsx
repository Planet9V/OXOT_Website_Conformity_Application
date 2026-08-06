import { Check, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Journey, JourneyState } from "@/lib/journey";
import { TermHint } from "@/components/conformity/glossary-dialog";

function nodeClasses(state: JourneyState): string {
  switch (state) {
    case "done":
      return "bg-primary border-primary text-primary-foreground";
    case "current":
      return "bg-background border-primary text-primary ring-4 ring-primary/15";
    case "blocked":
      return "bg-red-500 border-red-500 text-white ring-4 ring-red-500/15";
    default:
      return "bg-background border-border text-muted-foreground";
  }
}

/**
 * The compliance journey: a progress bar (always visible, carries the mobile
 * view) plus a labelled node stepper on wider screens. Reflects workflow
 * position, not the readiness grade — the two are shown side by side but never
 * conflated.
 */
export function JourneyStepper({ journey }: { journey: Journey }) {
  const { stages, progressPct, currentIndex, total, blocked, readyForReview } = journey;
  const current = stages[currentIndex];

  return (
    <div className="space-y-3">
      <div>
        <div className="flex items-baseline justify-between gap-3">
          <div className="flex items-center gap-1.5 text-sm font-medium">
            <TermHint terms={["journey", "grade"]}>
              <span>Compliance journey</span>
            </TermHint>
            {readyForReview ? (
              <span className="text-green-600">· Ready for review</span>
            ) : (
              <span className="text-muted-foreground">
                · Step {Math.min(currentIndex + 1, total)} of {total}: {current?.label}
              </span>
            )}
          </div>
          <span className="font-mono text-sm tabular-nums text-muted-foreground">
            {progressPct}%
          </span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-[width] duration-1000 ease-out motion-reduce:transition-none",
              blocked ? "bg-orange-500" : readyForReview ? "bg-green-500" : "bg-primary",
            )}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <ol className="hidden items-start md:flex" aria-label="Compliance journey stages">
        {stages.map((s, i) => {
          const isLast = i === stages.length - 1;
          return (
            <li
              key={s.key}
              className="relative flex flex-1 flex-col items-center"
              aria-current={s.state === "current" || s.state === "blocked" ? "step" : undefined}
              title={s.hint}
            >
              {!isLast && (
                <span
                  className={cn(
                    "absolute left-1/2 top-4 h-0.5 w-full -translate-y-1/2",
                    s.state === "done" ? "bg-primary" : "bg-border",
                  )}
                  aria-hidden="true"
                />
              )}
              <span
                className={cn(
                  "relative z-10 grid h-8 w-8 place-items-center rounded-full border-2 text-xs font-semibold",
                  nodeClasses(s.state),
                )}
              >
                {s.state === "done" ? (
                  <Check className="h-4 w-4" />
                ) : s.state === "blocked" ? (
                  <AlertTriangle className="h-4 w-4" />
                ) : (
                  i + 1
                )}
              </span>
              <span
                className={cn(
                  "mt-2 text-center text-[11px] leading-tight",
                  s.state === "upcoming"
                    ? "text-muted-foreground"
                    : "font-medium text-foreground",
                )}
              >
                {s.label}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
