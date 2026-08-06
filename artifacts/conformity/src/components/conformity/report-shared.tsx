import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ConformityReportSummary } from "@workspace/api-client-react";
import { FileText, Lock, Loader2, AlertTriangle } from "lucide-react";
import { Link } from "wouter";

export const REPORT_FORMAT_LABELS: Record<string, string> = {
  briefing: "Executive briefing",
  full: "Full report",
  readout: "Readout",
};

export const REPORT_AUDIENCE_LABELS: Record<string, string> = {
  board: "Board",
  regulator: "Regulator",
};

export function ReportStatusBadge({ status }: { status: string }) {
  if (status === "generating") {
    return (
      <Badge
        variant="outline"
        className="border-amber-500/40 text-amber-600 dark:text-amber-400 gap-1"
        data-testid="report-status-generating"
      >
        <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
        Generating
      </Badge>
    );
  }
  if (status === "final") {
    return (
      <Badge
        variant="outline"
        className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400 gap-1"
        data-testid="report-status-final"
      >
        <Lock className="h-3 w-3" aria-hidden="true" />
        Final
      </Badge>
    );
  }
  if (status === "failed") {
    return (
      <Badge variant="outline" className="border-destructive/50 text-destructive gap-1" data-testid="report-status-failed">
        <AlertTriangle className="h-3 w-3" aria-hidden="true" />
        Failed
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="border-sky-500/40 text-sky-600 dark:text-sky-400" data-testid="report-status-draft">
      Draft
    </Badge>
  );
}

/** One report in a list — used by the assessment tab and the portfolio page. */
export function ReportRow({ report, showProduct }: { report: ConformityReportSummary; showProduct?: boolean }) {
  const progress =
    report.status === "generating"
      ? `${report.sectionsReady}/${report.sectionsTotal} sections ready`
      : `${report.sectionsTotal} sections`;
  return (
    <Link href={`/reports/${report.id}`} data-testid={`report-open-${report.id}`}>
      <Card
        className={cn(
          "px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4",
          "hover:border-primary/50 transition-colors cursor-pointer",
        )}
        data-testid={`report-card-${report.id}`}
      >
        <FileText className="h-4 w-4 text-muted-foreground shrink-0 hidden sm:block" aria-hidden="true" />
        <div className="min-w-0 flex-1">
          <div className="font-medium truncate">{report.title}</div>
          <div className="text-xs text-muted-foreground mt-0.5">
            {showProduct && report.productName ? `${report.productName} · ` : ""}
            {REPORT_FORMAT_LABELS[report.reportType] ?? report.reportType} ·{" "}
            {REPORT_AUDIENCE_LABELS[report.audience] ?? report.audience} edition · {progress} · updated{" "}
            {new Date(report.updatedAt).toLocaleDateString()}
          </div>
        </div>
        <div className="shrink-0">
          <ReportStatusBadge status={report.status} />
        </div>
      </Card>
    </Link>
  );
}
