import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Landmark, Plus, CheckCircle2 } from "lucide-react";

/**
 * The Authorities destination (task 7.5) — CRA Chapter V engagements with
 * market surveillance authorities. The engine's rule, surfaced as-is: the
 * Regulation sets NO fixed response period — Art. 54(1) leaves it to the
 * authority — so the deadline is CAPTURED from the authority's communication
 * and its absence is reported as a gap, never computed or defaulted.
 * Escalation exposure (Art. 54(5): prohibit, withdraw, recall) is surfaced
 * at the top, not buried in a list.
 */

interface Engagement {
  id: number;
  kind: string;
  authorityName: string;
  memberState: string;
  reference: string;
  receivedAt: string | null;
  prescribedDeadline: string | null;
  completedAt: string | null;
  scope: string | null;
  requiredMeasure: string;
  assessment: { gaps: string[]; citations: string[]; escalationExposure: boolean; message: string };
}

const KIND_LABEL: Record<string, string> = {
  data_access_request: "Data access request (CRA Art. 53)",
  corrective_action_requirement: "Corrective action requirement (CRA Art. 54)",
};

export default function AuthoritiesPage() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    kind: "data_access_request",
    authorityName: "",
    memberState: "",
    reference: "",
    receivedAt: "",
    prescribedDeadline: "",
    requiredMeasure: "",
  });

  const queryKey = ["/api/conformity/msa/engagements"];
  const { data, isLoading, isError } = useQuery<{
    total: number;
    escalationExposureCount: number;
    engagements: Engagement[];
  }>({
    queryKey,
    queryFn: async () => {
      const res = await fetch("/api/conformity/msa/engagements");
      if (!res.ok) throw new Error(`Could not load engagements (HTTP ${res.status})`);
      return res.json();
    },
  });

  const record = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/conformity/msa/engagements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          receivedAt: form.receivedAt || null,
          prescribedDeadline: form.prescribedDeadline || null,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
      toast.success("Engagement recorded");
      setOpen(false);
      await qc.invalidateQueries({ queryKey });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not record the engagement");
    } finally {
      setSaving(false);
    }
  };

  const complete = async (id: number) => {
    try {
      const res = await fetch(`/api/conformity/msa/engagements/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completedAt: new Date().toISOString() }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || `HTTP ${res.status}`);
      await qc.invalidateQueries({ queryKey });
      toast.success("Marked completed");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not update");
    }
  };

  const rows = data?.engagements ?? [];

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="oxot-kicker block mb-1">WORK · CRA CHAPTER V</span>
          <h1 className="text-3xl sm:text-4xl font-serif font-normal tracking-tight text-foreground flex items-center gap-2.5">
            <Landmark className="w-6 h-6 text-primary shrink-0" /> Authorities
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
            Market surveillance engagements: what an authority asked for, when it arrived,
            the period the authority prescribed, and what was provided. Deadlines are
            captured from the authority's communication — the Regulation sets none.
          </p>
        </div>
        <Button size="sm" className="gap-1.5 text-xs shrink-0" onClick={() => setOpen(true)} data-testid="record-engagement">
          <Plus className="h-3.5 w-3.5" /> Record engagement
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-48 w-full rounded-2xl" />
      ) : isError ? (
        <Card className="rounded-2xl border-destructive/40">
          <CardContent className="p-6 text-sm text-destructive">
            Engagements could not be loaded. Nothing is assumed answered.
          </CardContent>
        </Card>
      ) : rows.length === 0 ? (
        <Card className="rounded-2xl border border-dashed">
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            No authority engagements are recorded. When a market surveillance authority
            makes a request, record it here the day it arrives — every Chapter V period
            runs from that date.
          </CardContent>
        </Card>
      ) : (
        <>
          {(data?.escalationExposureCount ?? 0) > 0 && (
            <p className="text-sm text-destructive border border-destructive/30 bg-destructive/5 rounded-xl px-4 py-3">
              {data!.escalationExposureCount} engagement(s) past the authority's prescribed
              period — CRA Art. 54(5) exposure: the authority may prohibit, withdraw or recall.
            </p>
          )}
          <ul className="space-y-3">
            {rows.map((e) => (
              <li key={e.id} className="rounded-xl border border-border/70 bg-card p-4 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0 flex items-center gap-2.5">
                    <Badge variant="outline" className="font-mono text-[10px] shrink-0">
                      {KIND_LABEL[e.kind] ?? e.kind}
                    </Badge>
                    <span className="text-sm font-medium text-foreground truncate">
                      {e.authorityName || "Authority not named"}
                      {e.memberState ? ` · ${e.memberState}` : ""}
                    </span>
                    {e.reference && (
                      <span className="font-mono text-xs text-muted-foreground">{e.reference}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {e.completedAt ? (
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-[10px]">
                        Completed {e.completedAt.slice(0, 10)}
                      </Badge>
                    ) : (
                      <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => complete(e.id)}>
                        <CheckCircle2 className="h-3 w-3 mr-1" /> Mark completed
                      </Button>
                    )}
                  </div>
                </div>
                <p
                  className={cn(
                    "text-xs leading-relaxed",
                    e.assessment.escalationExposure ? "text-destructive" : "text-muted-foreground",
                  )}
                >
                  {e.assessment.message}
                </p>
                {e.assessment.gaps.length > 0 && (
                  <ul className="text-xs text-amber-600 dark:text-amber-500 list-disc pl-5 space-y-0.5">
                    {e.assessment.gaps.map((g) => (
                      <li key={g}>{g}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-2xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">Record an authority engagement</DialogTitle>
            <DialogDescription className="text-xs">
              The prescribed period comes from the authority's own communication
              (CRA Art. 54(1)) — leave it blank if none was given, and that absence
              will be reported as a gap.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1 text-xs">
            <div className="space-y-1">
              <Label>Kind</Label>
              <Select value={form.kind} onValueChange={(v) => setForm({ ...form, kind: v })}>
                <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="data_access_request">{KIND_LABEL.data_access_request}</SelectItem>
                  <SelectItem value="corrective_action_requirement">{KIND_LABEL.corrective_action_requirement}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Authority name</Label>
                <Input className="h-8 text-xs" value={form.authorityName}
                  onChange={(e) => setForm({ ...form, authorityName: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Member State</Label>
                <Input className="h-8 text-xs" placeholder="e.g. NL" value={form.memberState}
                  onChange={(e) => setForm({ ...form, memberState: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Received at</Label>
                <Input type="date" className="h-8 text-xs font-mono" value={form.receivedAt}
                  onChange={(e) => setForm({ ...form, receivedAt: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Prescribed deadline (from the authority)</Label>
                <Input type="date" className="h-8 text-xs font-mono" value={form.prescribedDeadline}
                  onChange={(e) => setForm({ ...form, prescribedDeadline: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Reference</Label>
              <Input className="h-8 text-xs font-mono" placeholder="Authority case reference" value={form.reference}
                onChange={(e) => setForm({ ...form, reference: e.target.value })} />
            </div>
            {form.kind === "corrective_action_requirement" && (
              <div className="space-y-1">
                <Label>Required measure</Label>
                <Textarea className="text-xs h-16" value={form.requiredMeasure}
                  onChange={(e) => setForm({ ...form, requiredMeasure: e.target.value })} />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={record} disabled={saving}>Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
