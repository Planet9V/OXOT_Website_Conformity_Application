import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListConformityAdvisories,
  useCreateConformityAdvisory,
  usePublishConformityAdvisory,
  useListConformityVulnReports,
  useUpdateConformityVulnReport,
  useListConformityProducts,
  getListConformityAdvisoriesQueryKey,
  getListConformityVulnReportsQueryKey,
} from "@workspace/api-client-react";
import { toast } from "sonner";
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
import { Megaphone, Bug, Plus } from "lucide-react";

/**
 * The PSIRT machinery on the Incidents surface (task 8.2) — the vulnerability
 * handling half of Annex I Part II, which the old static "PSIRT toolkit"
 * page gestured at while the REAL pipeline (CVD intake → triage → advisory →
 * publish) sat in the API with no screen.
 *
 * Two deliberate honesty properties:
 * - an advisory is created as a DRAFT and publication is a separate act —
 *   the list shows which is which, and nothing here calls a draft published;
 * - triage status comes from the API's own vocabulary; this panel never
 *   invents a state.
 */

const SEVERITIES = ["low", "medium", "high", "critical"] as const;

const TRIAGE_STATUSES = [
  "triaged",
  "confirmed",
  "rejected",
  "fix_in_progress",
  "fix_available",
  "disclosed",
] as const;

const STATUS_TONE: Record<string, string> = {
  received: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  triaged: "bg-muted text-muted-foreground",
  confirmed: "bg-amber-500/10 text-amber-500 border-amber-500/30",
  rejected: "bg-muted text-muted-foreground",
  fix_in_progress: "bg-amber-500/10 text-amber-500 border-amber-500/30",
  fix_available: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
  disclosed: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
  draft: "bg-muted text-muted-foreground",
  published: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
};

export function PsirtPanel() {
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    severity: "high" as (typeof SEVERITIES)[number],
    summary: "",
    vulnerabilityId: "",
    affectedVersions: "",
    fixedVersions: "",
    productId: "",
  });
  const products = useListConformityProducts();

  const advisories = useListConformityAdvisories();
  const vulnReports = useListConformityVulnReports();

  const createAdvisory = useCreateConformityAdvisory({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListConformityAdvisoriesQueryKey() });
        toast.success("Advisory created as a draft — publishing is a separate act");
        setCreateOpen(false);
      },
      onError: (e: any) => toast.error(e?.message || "Could not create the advisory"),
    },
  });
  const publishAdvisory = usePublishConformityAdvisory({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListConformityAdvisoriesQueryKey() });
        toast.success("Advisory published to the public CVD surface");
      },
      onError: (e: any) => toast.error(e?.message || "Could not publish"),
    },
  });
  const updateReport = useUpdateConformityVulnReport({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListConformityVulnReportsQueryKey() });
        toast.success("Triage recorded");
      },
      onError: (e: any) => toast.error(e?.message || "Could not update the report"),
    },
  });

  const advisoryRows = advisories.data ?? [];
  const reportRows = vulnReports.data ?? [];

  return (
    <div className="space-y-6" data-testid="psirt-panel">
      {/* Vulnerability intake triage */}
      <div className="space-y-3 border-t border-border pt-6">
        <div>
          <h2 className="text-lg font-serif text-foreground flex items-center gap-2">
            <Bug className="h-4 w-4 text-primary" /> Vulnerability reports — CVD intake
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5 max-w-3xl">
            Reports arriving through the public coordinated-vulnerability-disclosure
            surface. Triage moves each through the pipeline's own vocabulary; a report
            becomes an incident only if it meets the CRA Art. 14 thresholds, which is a
            determination made there, not here.
          </p>
        </div>
        {vulnReports.isLoading ? (
          <Skeleton className="h-16 w-full rounded-2xl" />
        ) : reportRows.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No vulnerability reports have been received.
          </p>
        ) : (
          <ul className="space-y-2">
            {reportRows.map((r: any) => (
              <li key={r.id} className="rounded-xl border border-border/70 bg-card px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-sm text-foreground">{r.title}</span>
                  <span className="ml-2 font-mono text-[11px] text-muted-foreground">
                    {r.productName || "product unspecified"}
                    {r.reporterName ? ` · ${r.reporterName}` : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className={cn("font-mono text-[10px]", STATUS_TONE[r.status] ?? "")}>
                    {String(r.status).replaceAll("_", " ")}
                  </Badge>
                  <Select
                    value=""
                    onValueChange={(v) =>
                      updateReport.mutate({ reportId: r.id, data: { status: v as any, note: `Status moved to ${v} from the Incidents triage panel.` } })
                    }
                  >
                    <SelectTrigger className="h-7 w-36 text-[11px]">
                      <SelectValue placeholder="Move to…" />
                    </SelectTrigger>
                    <SelectContent>
                      {TRIAGE_STATUSES.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s.replaceAll("_", " ")}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Advisories */}
      <div className="space-y-3 border-t border-border pt-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-serif text-foreground flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-primary" /> Security advisories
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5 max-w-3xl">
              Drafted here, published deliberately: a published advisory appears on the
              public CVD surface. Draft and published are shown as what they are.
            </p>
          </div>
          <Button size="sm" className="gap-1.5 text-xs shrink-0" onClick={() => setCreateOpen(true)} data-testid="new-advisory">
            <Plus className="h-3.5 w-3.5" /> Draft advisory
          </Button>
        </div>
        {advisories.isLoading ? (
          <Skeleton className="h-16 w-full rounded-2xl" />
        ) : advisoryRows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No advisories exist yet.</p>
        ) : (
          <ul className="space-y-2">
            {advisoryRows.map((a: any) => (
              <li key={a.id} className="rounded-xl border border-border/70 bg-card px-4 py-3 flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="font-mono text-[11px] text-muted-foreground mr-2">{a.advisoryCode}</span>
                  <span className="text-sm text-foreground">{a.title}</span>
                  {a.vulnerabilityId && (
                    <span className="ml-2 font-mono text-[11px] text-muted-foreground">{a.vulnerabilityId}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge variant="outline" className="text-[10px] capitalize">{a.severity}</Badge>
                  <Badge variant="outline" className={cn("font-mono text-[10px]", STATUS_TONE[a.status] ?? "")}>
                    {a.status}
                  </Badge>
                  {a.status === "draft" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-[11px]"
                      disabled={publishAdvisory.isPending}
                      onClick={() => publishAdvisory.mutate({ advisoryId: a.id })}
                    >
                      Publish
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="rounded-2xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">Draft a security advisory</DialogTitle>
            <DialogDescription className="text-xs">
              Created as a draft. Publishing is a separate act with a completeness
              gate: a public advisory must name the product, summarise the issue,
              state affected versions, and give a fix or workaround — publish is
              refused otherwise (Annex I Part II CRA).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1 text-xs">
            <div className="space-y-1">
              <Label>Title *</Label>
              <Input className="h-8 text-xs" value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Product (required to publish)</Label>
              <Select value={form.productId} onValueChange={(v) => setForm({ ...form, productId: v })}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Pick the affected product" /></SelectTrigger>
                <SelectContent>
                  {(products.data ?? []).map((p: any) => (
                    <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Severity</Label>
                <Select value={form.severity} onValueChange={(v) => setForm({ ...form, severity: v as any })}>
                  <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {SEVERITIES.map((s) => (
                      <SelectItem key={s} value={s} className="capitalize">{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Vulnerability id (CVE)</Label>
                <Input className="h-8 text-xs font-mono" placeholder="CVE-2026-…" value={form.vulnerabilityId}
                  onChange={(e) => setForm({ ...form, vulnerabilityId: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Summary</Label>
              <Textarea className="text-xs h-16" value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Affected versions</Label>
                <Input className="h-8 text-xs font-mono" placeholder="<= 9.1.1" value={form.affectedVersions}
                  onChange={(e) => setForm({ ...form, affectedVersions: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Fixed versions</Label>
                <Input className="h-8 text-xs font-mono" placeholder="9.1.2" value={form.fixedVersions}
                  onChange={(e) => setForm({ ...form, fixedVersions: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button
              size="sm"
              disabled={createAdvisory.isPending || !form.title.trim()}
              onClick={() =>
                createAdvisory.mutate({
                  data: {
                    ...form,
                    productId: form.productId ? Number(form.productId) : undefined,
                  } as any,
                })
              }
            >
              Create draft
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
