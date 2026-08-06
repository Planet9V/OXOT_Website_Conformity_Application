import { useState } from "react";
import { useParams, useLocation, Link } from "wouter";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetConformityReport,
  getGetConformityReportQueryKey,
  useUpdateConformityReportSection,
  useRegenerateConformityReportSection,
  useFinalizeConformityReport,
  useDeleteConformityReport,
  useGetAdminSession,
  exportConformityReport,
  type ConformityReportSection,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
import {
  ReportStatusBadge,
  REPORT_FORMAT_LABELS,
  REPORT_AUDIENCE_LABELS,
} from "@/components/conformity/report-shared";
import { printHtmlDocument } from "@/lib/print";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowLeft,
  Download,
  Loader2,
  Lock,
  Pencil,
  RefreshCw,
  Sparkles,
  Trash2,
} from "lucide-react";

/**
 * In-app styling for server-rendered report section HTML (tables, SVG charts,
 * citation markers). Figures keep a white background in both themes: the
 * charts are drawn print-first (dark ink on paper).
 */
const REPORT_BODY_CSS = `
.report-body { font-size: 0.9rem; line-height: 1.65; color: var(--foreground); }
.report-body h4 { font-weight: 700; font-size: 1.05rem; margin: 1.25rem 0 0.5rem; color: var(--foreground); }
.report-body p { margin: 0.6rem 0; }
.report-body ul, .report-body ol { margin: 0.5rem 0 0.5rem 1.4rem; list-style: revert; padding: revert; }
.report-body li { margin: 0.3rem 0; }
.report-body table { width: 100%; border-collapse: collapse; font-size: 0.82rem; margin: 1rem 0; border: 1px solid var(--border); border-radius: 0.5rem; overflow: hidden; }
.report-body th, .report-body td { border-bottom: 1px solid var(--border); padding: 0.5rem 0.75rem; text-align: left; vertical-align: top; }
.report-body th { font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted-foreground); background: var(--muted); }
.report-body figure { margin: 1.25rem 0; background: #ffffff; border: 1px solid var(--border); border-radius: 0.75rem; padding: 1.25rem; overflow-x: auto; box-shadow: 0 4px 12px rgba(0,0,0,0.03); }
.report-body figure svg { max-width: 100%; height: auto; }
.report-body figcaption { font-size: 0.75rem; font-weight: 600; color: #475569; margin-top: 0.6rem; text-align: center; }
.report-body sup.cite { color: var(--primary); font-weight: 700; }
.report-body .kpi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.75rem; margin: 1rem 0; }
.report-body .kpi-card { border: 1px solid var(--border); border-radius: 0.75rem; padding: 1rem; background: var(--card); box-shadow: 0 2px 8px rgba(0,0,0,0.04); transition: transform 0.2s; }
.report-body .kpi-card.kpi-bad { border-left: 4px solid #dc2626; }
.report-body .kpi-card.kpi-ok { border-left: 4px solid #16a34a; }
.report-body .kpi-card.kpi-warn { border-left: 4px solid #d97706; }
.report-body .kpi-val { font-size: 1.8rem; font-weight: 800; line-height: 1.1; font-family: ui-monospace, SFMono-Regular, monospace; margin-top: 0.2rem; }
.report-body .kpi-card.kpi-bad .kpi-val { color: #dc2626; }
.report-body .kpi-card.kpi-ok .kpi-val { color: #16a34a; }
.report-body .kpi-card.kpi-warn .kpi-val { color: #d97706; }
.report-body .kpi-label { font-size: 0.68rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em; color: var(--muted-foreground); }
.report-body .kpi-sub { font-size: 0.72rem; color: var(--muted-foreground); margin-top: 0.3rem; }
.report-body .callout { border-left: 4px solid var(--primary); padding: 0.75rem 1rem; background: var(--muted); border-radius: 0.5rem; margin: 1rem 0; font-size: 0.88rem; }
`;

function SectionStatusDot({ section }: { section: ConformityReportSection }) {
  if (section.status === "pending") {
    return <Loader2 className="h-3 w-3 animate-spin text-amber-500 shrink-0" aria-hidden="true" />;
  }
  if (section.status === "failed") {
    return <AlertTriangle className="h-3 w-3 text-destructive shrink-0" aria-hidden="true" />;
  }
  return (
    <span
      className={cn(
        "h-1.5 w-1.5 rounded-full shrink-0",
        section.kind === "ai" ? "bg-primary" : "bg-muted-foreground/50",
      )}
      aria-hidden="true"
    />
  );
}

function SectionCard({
  section,
  index,
  canMutate,
  regenerating,
  onEdit,
  onRegenerate,
}: {
  section: ConformityReportSection;
  index: number;
  canMutate: boolean;
  regenerating: boolean;
  onEdit: () => void;
  onRegenerate: () => void;
}) {
  return (
    <Card
      id={`report-section-${section.key}`}
      className="scroll-mt-24"
      data-testid={`report-section-${section.key}`}
    >
      <CardContent className="pt-5 px-5 pb-5 space-y-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-mono text-xs text-muted-foreground">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3 className="font-semibold">{section.heading}</h3>
            {section.kind === "ai" ? (
              <Badge variant="outline" className="gap-1 text-xs shrink-0">
                <Sparkles className="h-3 w-3" aria-hidden="true" />
                AI drafted
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs text-muted-foreground shrink-0">
                Computed
              </Badge>
            )}
          </div>
          {canMutate && section.kind === "ai" && section.status !== "pending" ? (
            <div className="flex gap-1 shrink-0">
              <Button size="sm" variant="ghost" onClick={onEdit} data-testid={`section-edit-${section.key}`}>
                <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onRegenerate}
                disabled={regenerating}
                data-testid={`section-regenerate-${section.key}`}
              >
                <RefreshCw className={cn("h-3.5 w-3.5", regenerating && "animate-spin")} aria-hidden="true" />
                Regenerate
              </Button>
            </div>
          ) : null}
        </div>

        {section.status === "pending" ? (
          <div className="space-y-2" data-testid={`section-pending-${section.key}`}>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-4/5" />
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
              Drafting from the frozen snapshot…
            </p>
          </div>
        ) : section.status === "failed" ? (
          <div
            className="rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2.5 text-sm space-y-2"
            data-testid={`section-failed-${section.key}`}
          >
            <p className="font-medium text-destructive">This section couldn't be drafted.</p>
            {section.note ? <p className="text-xs text-muted-foreground">{section.note}</p> : null}
            {canMutate ? (
              <Button size="sm" variant="outline" onClick={onRegenerate} disabled={regenerating}>
                <RefreshCw className={cn("h-3.5 w-3.5", regenerating && "animate-spin")} aria-hidden="true" />
                Try again
              </Button>
            ) : null}
          </div>
        ) : (
          <>
            <div className="report-body" dangerouslySetInnerHTML={{ __html: section.html }} />
            {section.note ? <p className="text-xs text-muted-foreground italic">{section.note}</p> : null}
            {section.editedBy ? (
              <p className="text-xs text-muted-foreground">
                Hand-edited by {section.editedBy.split(":").pop()}
                {section.editedAt ? ` · ${new Date(section.editedAt).toLocaleString()}` : ""}
              </p>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function ReportWorkspace() {
  const params = useParams<{ id: string }>();
  const id = Number(params.id);
  const [, navigate] = useLocation();
  const qc = useQueryClient();
  const { data: session } = useGetAdminSession();
  const isDemo = session?.role === "demo";

  const { data, isLoading, isError } = useGetConformityReport(id, {
    query: {
      queryKey: getGetConformityReportQueryKey(id),
      enabled: Number.isFinite(id) && id > 0,
      refetchInterval: (query) => {
        const r = query.state.data?.report;
        if (!r) return false;
        return r.status === "generating" || r.sections.some((s) => s.status === "pending") ? 2500 : false;
      },
    },
  });
  const report = data?.report;

  const [editing, setEditing] = useState<null | { key: string; heading: string; contentMd: string }>(null);
  const [confirmFinalize, setConfirmFinalize] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [exporting, setExporting] = useState(false);

  const update = useUpdateConformityReportSection({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries();
        setEditing(null);
        toast.success("Section saved");
      },
      onError: () => toast.error("Couldn't save the section."),
    },
  });
  const regenerate = useRegenerateConformityReportSection({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries();
        toast.success("Redrafting section", { description: "The new draft replaces this section shortly." });
      },
      onError: () => toast.error("Couldn't regenerate the section."),
    },
  });
  const finalize = useFinalizeConformityReport({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries();
        setConfirmFinalize(false);
        toast.success("Report finalised", { description: "Sections are locked; export stays available." });
      },
      onError: () => toast.error("Couldn't finalise — make sure every narrative section is ready."),
    },
  });
  const del = useDeleteConformityReport({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries();
        toast.success("Report deleted");
        navigate(report?.assessmentId ? `/assessments/${report.assessmentId}` : "/reports");
      },
      onError: () => toast.error("Couldn't delete the report."),
    },
  });

  const exportNow = async () => {
    setExporting(true);
    try {
      const { html } = await exportConformityReport(id);
      if (!printHtmlDocument(html)) {
        toast.error("Popup blocked", { description: "Allow popups for this site to export the PDF." });
      }
    } catch {
      toast.error("Export failed.");
    } finally {
      setExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="px-4 py-8 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }
  if (isError || !report) {
    return (
      <div className="px-4 py-16 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <Empty>
          <EmptyTitle>Report not found</EmptyTitle>
          <EmptyDescription>It may have been deleted.</EmptyDescription>
          <Button variant="outline" asChild className="mt-4">
            <Link href="/reports">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All reports
            </Link>
          </Button>
        </Empty>
      </div>
    );
  }

  const aiSections = report.sections.filter((s) => s.kind === "ai");
  const allAiReady = aiSections.every((s) => s.status === "ready");
  const canMutate = !isDemo && report.status === "draft";
  const generating = report.status === "generating";
  const progressPct = report.sectionsTotal
    ? Math.round((report.sectionsReady / report.sectionsTotal) * 100)
    : 0;
  const backHref = report.assessmentId ? `/assessments/${report.assessmentId}` : "/reports";

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6" data-testid="report-workspace">
      <style>{REPORT_BODY_CSS}</style>

      <div>
        <Button variant="ghost" size="sm" asChild className="-ml-2 text-muted-foreground">
          <Link href={backHref} data-testid="report-back">
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {report.assessmentId ? "Back to assessment" : "All reports"}
          </Link>
        </Button>
      </div>

      <header className="space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight" data-testid="report-title">
              {report.title}
            </h1>
            <div className="flex items-center gap-2 flex-wrap mt-2">
              <ReportStatusBadge status={report.status} />
              <Badge variant="secondary">{REPORT_FORMAT_LABELS[report.reportType] ?? report.reportType}</Badge>
              <Badge variant="secondary">
                {REPORT_AUDIENCE_LABELS[report.audience] ?? report.audience} edition
              </Badge>
              <span className="text-xs text-muted-foreground">
                {report.productName ? `${report.productName} · ` : "Portfolio · "}
                {report.citations.length} reference{report.citations.length === 1 ? "" : "s"} · generated{" "}
                {new Date(report.createdAt).toLocaleString()}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <Button variant="outline" onClick={exportNow} disabled={exporting || generating} data-testid="report-export">
              {exporting ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Download className="h-4 w-4" aria-hidden="true" />
              )}
              Export PDF
            </Button>
            {!isDemo && report.status === "draft" ? (
              <Button
                onClick={() => setConfirmFinalize(true)}
                disabled={!allAiReady}
                title={allAiReady ? undefined : "Every narrative section must be ready first"}
                data-testid="report-finalize"
              >
                <Lock className="h-4 w-4" aria-hidden="true" />
                Finalise
              </Button>
            ) : null}
            {!isDemo ? (
              <Button
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={() => setConfirmDelete(true)}
                data-testid="report-delete"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
                Delete
              </Button>
            ) : null}
          </div>
        </div>

        {generating ? (
          <Card className="border-amber-500/30 bg-amber-500/5" data-testid="report-generating-banner">
            <CardContent className="py-3 px-4 space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Loader2 className="h-4 w-4 animate-spin text-amber-500" aria-hidden="true" />
                <span className="font-medium">Drafting narrative sections…</span>
                <span className="text-muted-foreground">
                  {report.sectionsReady} of {report.sectionsTotal} sections ready
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-500 transition-all duration-700"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Data tables, charts and references are already final — they were computed from the frozen snapshot
                at generation time.
              </p>
            </CardContent>
          </Card>
        ) : null}

        {report.status === "failed" ? (
          <Card className="border-destructive/40 bg-destructive/5">
            <CardContent className="py-3 px-4 text-sm">
              <p className="font-medium text-destructive">Narrative drafting failed.</p>
              <p className="text-muted-foreground text-xs mt-1">
                The deterministic sections below are still valid. Delete this report and generate it again.
              </p>
            </CardContent>
          </Card>
        ) : null}
      </header>

      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <nav className="sticky top-24 space-y-0.5 text-sm" aria-label="Report contents">
            <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground px-2 pb-1">
              Contents
            </div>
            {report.sections.map((s, i) => (
              <button
                key={s.key}
                type="button"
                onClick={() =>
                  document
                    .getElementById(`report-section-${s.key}`)
                    ?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
                className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
              >
                <SectionStatusDot section={s} />
                <span className="truncate">
                  {i + 1}. {s.heading}
                </span>
              </button>
            ))}
          </nav>
        </aside>

        <div className="space-y-4 min-w-0">
          {report.sections.map((s, i) => (
            <SectionCard
              key={s.key}
              section={s}
              index={i}
              canMutate={canMutate}
              regenerating={regenerate.isPending}
              onEdit={() => setEditing({ key: s.key, heading: s.heading, contentMd: s.contentMd })}
              onRegenerate={() => regenerate.mutate({ id, key: s.key })}
            />
          ))}
        </div>
      </div>

      {/* Edit section */}
      <Dialog open={editing !== null} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit “{editing?.heading}”</DialogTitle>
            <DialogDescription>
              Markdown: **bold**, ## headings, - lists. Keep citation markers like [3] — they link to the numbered
              references and invalid ones are rejected at export.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={editing?.contentMd ?? ""}
            onChange={(e) => editing && setEditing({ ...editing, contentMd: e.target.value })}
            rows={16}
            className="font-mono text-sm"
            data-testid="section-edit-textarea"
          />
          <div className="text-xs text-muted-foreground text-right">
            {(editing?.contentMd ?? "").length.toLocaleString()} / 40,000
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => editing && update.mutate({ id, key: editing.key, data: { contentMd: editing.contentMd } })}
              disabled={
                update.isPending ||
                !editing ||
                editing.contentMd.trim().length === 0 ||
                editing.contentMd.length > 40000
              }
              data-testid="section-edit-save"
            >
              {update.isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              Save section
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Finalise confirm */}
      <Dialog open={confirmFinalize} onOpenChange={setConfirmFinalize}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Finalise this report?</DialogTitle>
            <DialogDescription>
              Sections lock permanently — no further edits or redrafts. The report stays exportable and keeps its
              frozen data snapshot.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmFinalize(false)}>
              Cancel
            </Button>
            <Button onClick={() => finalize.mutate({ id })} disabled={finalize.isPending} data-testid="report-finalize-confirm">
              {finalize.isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Lock className="h-4 w-4" aria-hidden="true" />}
              Finalise report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this report?</DialogTitle>
            <DialogDescription>
              “{report.title}” and its frozen snapshot will be removed. The deletion is recorded in the activity
              ledger.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={() => del.mutate({ id })} disabled={del.isPending} data-testid="report-delete-confirm">
              {del.isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Trash2 className="h-4 w-4" aria-hidden="true" />}
              Delete report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
