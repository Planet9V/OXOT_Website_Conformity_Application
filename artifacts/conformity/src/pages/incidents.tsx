import { Link } from "wouter";
import { useListWorkspaceIncidents } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ShieldAlert, ArrowRight, Wrench } from "lucide-react";
import { Cite } from "@/components/statutory-flyout";

/**
 * The Incidents destination (task 7.4) — every statutory reporting clock in
 * the workspace on one act-badged surface (D10: act is a dimension, never a
 * section). Triage lives here; the staged submissions themselves (early
 * warning → 72h notification → final report, with corrections) live in the
 * assessment workbench's incident panel, which each row links into.
 *
 * Stage verdicts are rendered from the incident's own dueAt/doneAt pairs —
 * set by the Art. 14 rules at creation — never computed here beyond
 * comparing timestamps.
 */

type Stage = { label: string; dueAt: string; doneAt: string | null };

function stageState(s: Stage, now: number): "met" | "overdue" | "pending" {
  if (s.doneAt) return "met";
  return Date.parse(s.dueAt) < now ? "overdue" : "pending";
}

function ClockChip({ stage, now }: { stage: Stage; now: number }) {
  const state = stageState(stage, now);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[10px]",
        state === "met" && "border-emerald-500/40 bg-emerald-500/10 text-emerald-500",
        state === "overdue" && "border-destructive/40 bg-destructive/10 text-destructive font-bold",
        state === "pending" && "border-border bg-muted/40 text-muted-foreground",
      )}
      title={`due ${stage.dueAt}${stage.doneAt ? `, done ${stage.doneAt}` : ""}`}
    >
      {stage.label}
      {state === "met" ? " ✓" : state === "overdue" ? " OVERDUE" : ""}
    </span>
  );
}

export default function IncidentsPage() {
  const { data, isLoading, isError } = useListWorkspaceIncidents();
  const now = Date.now();

  const rows = data?.incidents ?? [];
  const overdue = rows.filter((r) =>
    [
      { label: "", dueAt: r.incident.earlyWarningDueAt, doneAt: r.incident.earlyWarningDoneAt },
      { label: "", dueAt: r.incident.notificationDueAt, doneAt: r.incident.notificationDoneAt },
      { label: "", dueAt: r.incident.finalReportDueAt, doneAt: r.incident.finalReportDoneAt },
    ].some((s) => stageState(s, now) === "overdue"),
  ).length;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-border pb-6">
        <span className="oxot-kicker block mb-1">WORK · STATUTORY REPORTING CLOCKS</span>
        <h1 className="text-3xl sm:text-4xl font-serif font-normal tracking-tight text-foreground flex items-center gap-2.5">
          <ShieldAlert className="w-6 h-6 text-primary shrink-0" /> Incidents
        </h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
          Every incident's <Cite article={14} /> clocks — early warning (24h),
          notification (72h), final report — across all products. Submissions are
          recorded in each assessment's incident panel; this surface is where nothing
          gets missed.
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-48 w-full rounded-2xl" />
      ) : isError ? (
        <Card className="rounded-2xl border-destructive/40">
          <CardContent className="p-6 text-sm text-destructive">
            Incidents could not be loaded. Nothing is assumed on time.
          </CardContent>
        </Card>
      ) : rows.length === 0 ? (
        <Card className="rounded-2xl border border-dashed">
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            No incidents are recorded in the workspace. New incidents are opened from a
            product's assessment workbench, which starts their statutory clocks.
          </CardContent>
        </Card>
      ) : (
        <>
          <p className="text-xs font-mono text-muted-foreground">
            {rows.length} incident{rows.length === 1 ? "" : "s"} ·{" "}
            <span className={overdue ? "text-destructive font-bold" : ""}>
              {overdue} with an overdue stage
            </span>
          </p>
          <ul className="space-y-3">
            {rows.map(({ incident: i, productName, regulationKey }) => (
              <li key={i.id}>
                <Link
                  href={`/assessments/${i.assessmentId}`}
                  className="block rounded-xl border border-border/70 bg-card p-4 hover:border-primary/50 transition-colors"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0 flex items-center gap-2.5">
                      <Badge variant="outline" className="font-mono text-[10px] uppercase shrink-0">
                        {regulationKey}
                      </Badge>
                      <span className="text-sm font-medium text-foreground truncate">{i.title}</span>
                      {productName && (
                        <span className="text-xs text-muted-foreground truncate">· {productName}</span>
                      )}
                      <Badge variant="outline" className="text-[10px] capitalize shrink-0">
                        {i.severity}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <ClockChip now={now} stage={{ label: "24h", dueAt: i.earlyWarningDueAt, doneAt: i.earlyWarningDoneAt }} />
                      <ClockChip now={now} stage={{ label: "72h", dueAt: i.notificationDueAt, doneAt: i.notificationDoneAt }} />
                      <ClockChip now={now} stage={{ label: "final", dueAt: i.finalReportDueAt, doneAt: i.finalReportDoneAt }} />
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground ml-1" />
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}

      <div className="rounded-2xl border border-border/60 bg-muted/20 px-5 py-4 text-sm text-muted-foreground space-y-2">
        <p>
          <span className="font-medium text-foreground">NIS2 Art. 23 incidents are not
          modelled yet.</span>{" "}
          The directive's staged reporting (24h early warning, 72h notification, one-month
          final report to the CSIRT or competent authority) belongs on this same surface —
          that is the point of a cross-act Incidents destination — but the entity-side
          incident model ships with the NIS2 obligations seeding. Until then this page
          shows CRA product incidents only, and says so.
        </p>
        <p className="text-xs">
          <Wrench className="inline h-3 w-3 mr-1" />
          The PSIRT toolkit (advisory drafting, SBOM/KEV triage) remains available under{" "}
          <Link href="/psirt-tools" className="text-primary hover:underline">
            PSIRT toolkit
          </Link>{" "}
          while its content is re-homed here.
        </p>
      </div>
    </div>
  );
}
