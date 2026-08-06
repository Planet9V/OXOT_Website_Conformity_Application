import { Link } from "wouter";
import { motion, useReducedMotion } from "framer-motion";
import { BellOff, CalendarClock, ShieldCheck } from "lucide-react";
import type { PortfolioDeadline } from "@workspace/api-client-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { DAY_MS, deadlineKindLabel, regLabel, trackLabel } from "./theme";

/**
 * The signature element: a horizontal time-axis of every open CRA Article 14
 * statutory reporting clock. "Now" is centre; overdue clocks sit to the left
 * (red), upcoming to the right. One bead per open incident (its soonest pending
 * stage), so the horizon can never disagree with the risk counts. Each bead
 * routes to its assessment.
 */
const WINDOW_DAYS = 21; // clamp window each side of now
const GRIDLINES = [-14, -7, 7, 14];

function xOf(days: number): number {
  const clamped = Math.max(-WINDOW_DAYS, Math.min(WINDOW_DAYS, days));
  return 50 + (clamped / WINDOW_DAYS) * 50;
}

function beadColor(days: number): string {
  if (days < 0) return "bg-red-500";
  if (days <= 14) return "bg-amber-500";
  return "bg-sky-500";
}

function beadSize(severity: string): number {
  switch (severity) {
    case "critical":
      return 16;
    case "high":
      return 13;
    case "low":
      return 9;
    default:
      return 11;
  }
}

function formatDue(iso: string, now: number): string {
  const ms = new Date(iso).getTime() - now;
  const days = Math.max(1, Math.round(Math.abs(ms) / DAY_MS));
  const date = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" }).format(new Date(iso));
  return ms < 0 ? `${date} · ${days}d overdue` : `${date} · in ${days}d`;
}

export function DeadlineHorizon({ deadlines, now }: { deadlines: PortfolioDeadline[]; now: number }) {
  const reduce = useReducedMotion();

  if (deadlines.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
        <ShieldCheck className="h-8 w-8 text-green-500" />
        <p className="text-sm font-medium">No open statutory deadlines</p>
        <p className="max-w-sm text-xs text-muted-foreground">
          Every reporting clock is met or has no active incident. New incidents appear here the moment they're logged — this never shows a fabricated timeline.
        </p>
      </div>
    );
  }

  const overdue = deadlines.filter((d) => d.overdue).length;
  const silenced = deadlines.filter((d) => d.alertsSilenced).length;
  const soon = deadlines.filter((d) => !d.overdue && new Date(d.dueAt).getTime() - now <= 14 * DAY_MS).length;

  return (
    <div className="space-y-5" data-testid="deadline-horizon">
      <div className="relative h-32 w-full select-none">
        {/* overdue zone tint */}
        <div className="absolute inset-y-0 left-0 w-1/2 bg-red-500/[0.04]" aria-hidden />
        <div className="absolute left-2 top-0 text-[10px] font-medium uppercase tracking-wide text-red-500/70">Overdue</div>
        <div className="absolute right-2 top-0 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Upcoming</div>

        {/* gridlines */}
        {GRIDLINES.map((g) => (
          <div key={g} className="absolute inset-y-7 w-px bg-border/50" style={{ left: `${xOf(g)}%` }} aria-hidden>
            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] text-muted-foreground">
              {g < 0 ? `${-g}d ago` : `+${g}d`}
            </span>
          </div>
        ))}

        {/* centre axis */}
        <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-border" aria-hidden />

        {/* now line */}
        <div className="absolute inset-y-5 left-1/2 w-0.5 -translate-x-1/2 bg-primary" aria-hidden>
          <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-full rounded-sm bg-primary px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground">
            Now
          </span>
        </div>

        {/* beads */}
        {deadlines.map((d, i) => {
          const days = (new Date(d.dueAt).getTime() - now) / DAY_MS;
          const size = beadSize(d.severity);
          return (
            <Tooltip key={`${d.assessmentId}-${d.kind}-${i}`}>
              <TooltipTrigger asChild>
                <Link
                  href={`/assessments/${d.assessmentId}`}
                  data-testid="deadline-bead"
                  className="absolute top-1/2 z-10 grid -translate-x-1/2 -translate-y-1/2 place-items-center"
                  style={{ left: `${xOf(days)}%`, width: 24, height: 24 }}
                  aria-label={`${d.incidentTitle} — ${deadlineKindLabel(d.kind)} ${formatDue(d.dueAt, now)}${d.alertsSilenced ? " — alerting stopped" : ""}`}
                >
                  <motion.span
                    className={cn(
                      "block rounded-full ring-2",
                      d.alertsSilenced ? "ring-red-500 ring-offset-1 ring-offset-background" : "ring-background",
                      beadColor(days),
                    )}
                    style={{ width: size, height: size }}
                    initial={reduce ? false : { scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: reduce ? 0 : Math.min(i * 0.05, 0.4), type: "spring", stiffness: 420, damping: 22 }}
                    whileHover={{ scale: 1.35 }}
                  />
                </Link>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <div className="space-y-0.5">
                  <div className="font-semibold">{d.incidentTitle}</div>
                  <div className="text-xs text-muted-foreground">
                    {d.productName} · {regLabel(d.regulationKey)}
                  </div>
                  <div className="text-xs text-muted-foreground">{trackLabel(d.incidentKind)}</div>
                  <div className="text-xs">
                    {deadlineKindLabel(d.kind)} ·{" "}
                    <span className={d.overdue ? "font-medium text-red-500" : ""}>{formatDue(d.dueAt, now)}</span>
                  </div>
                  {d.alertsSilenced && (
                    <div className="flex items-center gap-1 text-xs font-medium text-red-500">
                      <BellOff className="h-3 w-3" aria-hidden /> Alerting stopped — reminders exhausted
                    </div>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-red-500" /> {overdue} overdue
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-amber-500" /> {soon} due within 14 days
        </span>
        {silenced > 0 && (
          <span
            className="flex items-center gap-1.5 font-medium text-red-500"
            data-testid="silenced-count"
            title="Overdue clocks whose reminder emails are exhausted — nobody will be nudged again"
          >
            <BellOff className="h-3.5 w-3.5" aria-hidden /> {silenced} alerting stopped
          </span>
        )}
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <CalendarClock className="h-3.5 w-3.5" /> {deadlines.length} live clock{deadlines.length === 1 ? "" : "s"}
        </span>
      </div>
    </div>
  );
}
