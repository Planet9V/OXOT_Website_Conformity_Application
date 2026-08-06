import {
  useListConformityReports,
  getListConformityReportsQueryKey,
  useGetAdminSession,
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Empty, EmptyDescription, EmptyTitle } from "@/components/ui/empty";
import { ReportBuilderDialog } from "@/components/conformity/report-builder-dialog";
import { ReportRow } from "@/components/conformity/report-shared";
import { FileText, Plus } from "lucide-react";

/**
 * Assessment workbench tab: every executive report generated for this
 * assessment, newest first, plus the builder. The list self-polls while any
 * report is still generating. Demo sessions are read-only (server enforces;
 * the UI simply hides the builder).
 */
export function ReportsPanel({ assessmentId }: { assessmentId: number }) {
  const { data: session } = useGetAdminSession();
  const readOnly = session?.role === "demo";
  const { data, isLoading, isError } = useListConformityReports(
    { scope: "assessment", assessmentId },
    {
      query: {
        queryKey: getListConformityReportsQueryKey({ scope: "assessment", assessmentId }),
        refetchInterval: (query) =>
          query.state.data?.reports.some((r) => r.status === "generating") ? 4000 : false,
      },
    },
  );
  const reports = data?.reports ?? [];

  return (
    <div className="space-y-4" data-testid="reports-panel">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Executive reports</h2>
          <p className="text-sm text-muted-foreground">
            Board- and regulator-grade documents generated from a frozen snapshot of this assessment.
          </p>
        </div>
        {!readOnly ? (
          <ReportBuilderDialog
            scope="assessment"
            assessmentId={assessmentId}
            trigger={
              <Button data-testid="report-new">
                <Plus className="h-4 w-4" aria-hidden="true" />
                New report
              </Button>
            }
          />
        ) : null}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : isError ? (
        <Empty>
          <EmptyTitle>Couldn't load reports</EmptyTitle>
          <EmptyDescription>Refresh the page to try again.</EmptyDescription>
        </Empty>
      ) : reports.length === 0 ? (
        <Empty>
          <FileText className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <EmptyTitle>No reports yet</EmptyTitle>
          <EmptyDescription>
            Generate an executive briefing, a full assessment report or a readout — data tables and charts are
            computed instantly, the narrative drafts itself in the background.
          </EmptyDescription>
        </Empty>
      ) : (
        <div className="space-y-2">
          {reports.map((r) => (
            <ReportRow key={r.id} report={r} />
          ))}
        </div>
      )}
    </div>
  );
}
