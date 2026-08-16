import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { ScrollText, Plus } from "lucide-react";

/**
 * Mandates held — CRA Art. 18, in the Organisation register (task 7.5).
 *
 * The engine's stance, surfaced as-is: a mandate that purports to delegate
 * the non-delegable is STORED AS WRITTEN and reported as defective, never
 * rejected or silently trimmed — the attempt to delegate what Art. 18(2)
 * puts beyond any mandate is exactly what an authority would want to see.
 * Task keys come from the API's own vocabulary; this panel never invents one.
 */

interface Mandate {
  id: number;
  appointingManufacturer: string;
  representativeName: string;
  effectiveFrom: string | null;
  effectiveTo: string | null;
  tasksGranted: string[];
  copyProducible: boolean;
  assessment: { state: string; defects: string[]; message?: string };
}

interface MandatesResponse {
  total: number;
  inForce: number;
  expired: number;
  defectiveCount: number;
  mandates: Mandate[];
  mandatoryTasks: Record<string, string> | string[];
  nonDelegable: Record<string, string> | string[];
}

const STATE_TONE: Record<string, string> = {
  in_force: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
  expired: "bg-muted text-muted-foreground",
  not_yet_effective: "bg-blue-500/10 text-blue-500 border-blue-500/30",
};

function vocab(v: Record<string, string> | string[] | undefined): [string, string][] {
  if (!v) return [];
  return Array.isArray(v) ? v.map((k) => [k, k.replaceAll("_", " ")]) : Object.entries(v);
}

export function MandatesPanel() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    appointingManufacturer: "",
    representativeName: "",
    effectiveFrom: "",
    effectiveTo: "",
    tasks: [] as string[],
    writtenMandateHeld: null as boolean | null,
  });

  const queryKey = ["/api/conformity/mandates"];
  const { data, isLoading } = useQuery<MandatesResponse>({
    queryKey,
    queryFn: async () => {
      const res = await fetch("/api/conformity/mandates");
      if (!res.ok) throw new Error(`Could not load mandates (HTTP ${res.status})`);
      return res.json();
    },
  });

  const record = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/conformity/mandates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointingManufacturer: form.appointingManufacturer,
          representativeName: form.representativeName,
          effectiveFrom: form.effectiveFrom || null,
          effectiveTo: form.effectiveTo || null,
          tasksGranted: form.tasks,
          writtenMandateHeld: form.writtenMandateHeld,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
      toast.success("Mandate recorded as written");
      setOpen(false);
      await qc.invalidateQueries({ queryKey });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not record the mandate");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <Skeleton className="h-40 w-full rounded-2xl" />;

  const rows = data?.mandates ?? [];
  const tasks = vocab(data?.mandatoryTasks);

  return (
    <Card className="rounded-2xl border border-border" data-testid="mandates-panel">
      <CardHeader className="border-b pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <ScrollText className="h-5 w-5 text-primary" /> Mandates held — CRA Art. 18
            </CardTitle>
            <CardDescription className="text-xs max-w-2xl">
              Written mandates appointing this organisation as authorised representative.
              A mandate is stored AS WRITTEN: one that purports to delegate the
              non-delegable is kept and reported as defective, never trimmed.
            </CardDescription>
          </div>
          <Button size="sm" className="gap-1.5 text-xs" onClick={() => setOpen(true)} data-testid="record-mandate">
            <Plus className="h-3.5 w-3.5" /> Record mandate
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        {rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No mandates are recorded. Obligations under a mandate are strictly bounded by
            its written terms — recording the document is what makes the boundary visible.
          </p>
        ) : (
          <>
            <p className="text-xs font-mono text-muted-foreground">
              {data!.total} mandate{data!.total === 1 ? "" : "s"} · {data!.inForce} in force ·{" "}
              <span className={data!.defectiveCount ? "text-amber-500" : ""}>
                {data!.defectiveCount} defective
              </span>
            </p>
            <ul className="space-y-2">
              {rows.map((m) => (
                <li key={m.id} className="rounded-xl border border-border/70 p-3 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm text-foreground">
                      {m.appointingManufacturer || "Manufacturer not named"} →{" "}
                      {m.representativeName || "representative"}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <Badge variant="outline" className={cn("font-mono text-[10px]", STATE_TONE[m.assessment.state] ?? "")}>
                        {m.assessment.state.replaceAll("_", " ")}
                      </Badge>
                      {!m.copyProducible && (
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30 text-[10px]">
                          copy not producible — Art. 18(3)
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="font-mono text-[11px] text-muted-foreground">
                    {m.effectiveFrom ?? "start not recorded"} → {m.effectiveTo ?? "end not recorded"} ·{" "}
                    {m.tasksGranted.length} task{m.tasksGranted.length === 1 ? "" : "s"} granted
                  </p>
                  {m.assessment.defects.length > 0 && (
                    <ul className="text-xs text-amber-600 dark:text-amber-500 list-disc pl-5 space-y-0.5">
                      {m.assessment.defects.map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">Record a mandate</DialogTitle>
            <DialogDescription className="text-xs">
              Recorded as written. If the document tries to delegate something
              CRA Art. 18(2) puts beyond any mandate, that is kept and reported —
              not corrected.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Appointing manufacturer</Label>
                <Input className="h-8 text-xs" value={form.appointingManufacturer}
                  onChange={(e) => setForm({ ...form, appointingManufacturer: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Representative (this organisation)</Label>
                <Input className="h-8 text-xs" value={form.representativeName}
                  onChange={(e) => setForm({ ...form, representativeName: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Effective from</Label>
                <Input type="date" className="h-8 text-xs font-mono" value={form.effectiveFrom}
                  onChange={(e) => setForm({ ...form, effectiveFrom: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Effective to</Label>
                <Input type="date" className="h-8 text-xs font-mono" value={form.effectiveTo}
                  onChange={(e) => setForm({ ...form, effectiveTo: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Tasks granted (the Regulation's own vocabulary)</Label>
              <div className="flex flex-wrap gap-1.5">
                {tasks.map(([key, label]) => {
                  const on = form.tasks.includes(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          tasks: on ? form.tasks.filter((t) => t !== key) : [...form.tasks, key],
                        })
                      }
                      className={cn(
                        "px-2 py-1 rounded-md border text-[11px]",
                        on ? "bg-primary/15 border-primary/40 text-primary" : "border-border/60 text-muted-foreground",
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <Label className="leading-snug">A written mandate document is held</Label>
              <div className="flex gap-1">
                {([true, false, null] as const).map((v) => (
                  <button
                    key={String(v)}
                    type="button"
                    onClick={() => setForm({ ...form, writtenMandateHeld: v })}
                    className={cn(
                      "px-2 py-0.5 rounded-md text-[11px] font-mono border",
                      form.writtenMandateHeld === v
                        ? "bg-primary/15 border-primary/40 text-primary"
                        : "border-border/50 text-muted-foreground/60",
                    )}
                  >
                    {v === true ? "Yes" : v === false ? "No" : "Unanswered"}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={record} disabled={saving}>Record as written</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
