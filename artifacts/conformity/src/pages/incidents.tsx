import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useListWorkspaceIncidents } from "@workspace/api-client-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ShieldAlert, ArrowRight, Building2, Plus } from "lucide-react";
import { Cite } from "@/components/statutory-flyout";
import { PsirtPanel } from "@/components/incidents/psirt-panel";

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

      <EntityIncidentsSection />

      <PsirtPanel />
    </div>
  );
}

interface EntityIncident {
  id: number;
  title: string;
  awareAt: string;
  submittedTo: string;
  assessment: {
    stages: {
      stage: string;
      citation: string;
      dueAt: string | null;
      doneAt: string | null;
      state: string;
      message: string;
    }[];
    overdueCount: number;
  };
}

const STAGE_SHORT: Record<string, string> = {
  early_warning: "24h",
  notification: "72h",
  final_report: "final",
};

/**
 * The organisation's own significant incidents as a NIS2 entity (Art. 23) —
 * the entity half of the cross-act surface. Clock states come from the
 * nis2Reporting engine; the final report's chip reads "not running" until
 * the notification is submitted, because that is where Art. 23(4)(d)
 * anchors its month.
 */
function EntityIncidentsSection() {
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [stageFor, setStageFor] = useState<{ incident: EntityIncident; stage: string } | null>(null);
  const [form, setForm] = useState({ title: "", description: "", awareAt: "" });
  const [submittedTo, setSubmittedTo] = useState("");
  const [saving, setSaving] = useState(false);

  const queryKey = ["/api/conformity/entity-incidents"];
  const { data, isLoading } = useQuery<{ total: number; overdueCount: number; incidents: EntityIncident[] }>({
    queryKey,
    queryFn: async () => {
      const res = await fetch("/api/conformity/entity-incidents");
      if (!res.ok) throw new Error(`Could not load entity incidents (HTTP ${res.status})`);
      return res.json();
    },
  });

  const create = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/conformity/entity-incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, awareAt: form.awareAt || null }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
      toast.success("Entity incident recorded — the Art. 23 clocks are running");
      setCreateOpen(false);
      setForm({ title: "", description: "", awareAt: "" });
      await qc.invalidateQueries({ queryKey });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not record the incident");
    } finally {
      setSaving(false);
    }
  };

  const recordStage = async () => {
    if (!stageFor) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/conformity/entity-incidents/${stageFor.incident.id}/stages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: stageFor.stage, submittedTo }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
      toast.success("Submission recorded");
      setStageFor(null);
      setSubmittedTo("");
      await qc.invalidateQueries({ queryKey });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not record the submission");
    } finally {
      setSaving(false);
    }
  };

  const rows = data?.incidents ?? [];

  return (
    <div className="space-y-3" data-testid="entity-incidents">
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
        <div>
          <h2 className="text-lg font-serif text-foreground flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" /> Entity incidents — NIS2 Art. 23
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-3xl">
            The organisation's own significant incidents as an essential/important entity.
            Early warning (24h) and notification (72h) run from awareness; the one-month
            final report runs from the notification's submission. Which CSIRT or competent
            authority receives them depends on the Member State transposition — the
            recipient is recorded from what actually happened, never derived.
          </p>
        </div>
        <Button size="sm" className="gap-1.5 text-xs shrink-0" onClick={() => setCreateOpen(true)} data-testid="record-entity-incident">
          <Plus className="h-3.5 w-3.5" /> Record incident
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-24 w-full rounded-2xl" />
      ) : rows.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No entity incidents are recorded. Recording one starts its Art. 23 clocks from
          the moment of awareness.
        </p>
      ) : (
        <ul className="space-y-3">
          {rows.map((i) => (
            <li key={i.id} className="rounded-xl border border-border/70 bg-card p-4 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0 flex items-center gap-2.5">
                  <Badge variant="outline" className="font-mono text-[10px] uppercase shrink-0">nis2</Badge>
                  <span className="text-sm font-medium text-foreground truncate">{i.title}</span>
                  <span className="font-mono text-[11px] text-muted-foreground">aware {i.awareAt.slice(0, 16).replace("T", " ")}</span>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {i.assessment.stages.map((s) => (
                    <button
                      key={s.stage}
                      type="button"
                      disabled={s.state === "met"}
                      onClick={() => s.state !== "met" && s.state !== "not_yet_running" && setStageFor({ incident: i, stage: s.stage })}
                      title={s.message}
                      className={cn(
                        "inline-flex items-center rounded-md border px-1.5 py-0.5 font-mono text-[10px]",
                        s.state === "met" && "border-emerald-500/40 bg-emerald-500/10 text-emerald-500",
                        s.state === "overdue" && "border-destructive/40 bg-destructive/10 text-destructive font-bold",
                        s.state === "pending" && "border-border bg-muted/40 text-muted-foreground hover:border-primary/50",
                        s.state === "not_yet_running" && "border-border/40 bg-muted/20 text-muted-foreground/50 cursor-not-allowed",
                      )}
                    >
                      {STAGE_SHORT[s.stage]}
                      {s.state === "met" ? " ✓" : s.state === "overdue" ? " OVERDUE" : s.state === "not_yet_running" ? " —" : ""}
                    </button>
                  ))}
                </div>
              </div>
              {i.assessment.stages.find((s) => s.stage === "final_report")?.state === "not_yet_running" && (
                <p className="text-[11px] text-muted-foreground">
                  Final report not yet running — NIS2 Art. 23(4)(d) anchors its month on
                  the notification's submission.
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">Record a significant incident</DialogTitle>
            <DialogDescription className="text-xs">
              Every Art. 23(4) deadline runs from the moment the entity became aware —
              record that moment exactly.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1 text-xs">
            <div className="space-y-1">
              <Label>Title *</Label>
              <Input className="h-8 text-xs" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Aware at *</Label>
              <Input type="datetime-local" className="h-8 text-xs font-mono" value={form.awareAt}
                onChange={(e) => setForm({ ...form, awareAt: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Description</Label>
              <Textarea className="text-xs h-16" value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={create} disabled={saving || !form.title.trim() || !form.awareAt}>
              Record — clocks start
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={stageFor !== null} onOpenChange={(v) => !v && setStageFor(null)}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">
              Record the {stageFor?.stage.replaceAll("_", " ")}
            </DialogTitle>
            <DialogDescription className="text-xs">
              Records that the submission was made now. The recipient depends on the
              national transposition — say where it actually went.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-1 py-1 text-xs">
            <Label>Submitted to</Label>
            <Input className="h-8 text-xs" placeholder="e.g. NCSC-NL (CSIRT)" value={submittedTo}
              onChange={(e) => setSubmittedTo(e.target.value)} />
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setStageFor(null)}>Cancel</Button>
            <Button size="sm" onClick={recordStage} disabled={saving}>Record submission</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
