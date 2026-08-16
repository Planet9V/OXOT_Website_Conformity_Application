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
 * Reports on Home (re-homed from the retired /reports destination, task 9.2):
 * portfolio rollups across every product plus each per-assessment report,
 * with the portfolio builder. Per-assessment generation stays where the
 * assessment is — the workbench's Reports tab; every document opens in the
 * same /reports/:id workspace as before.
 */
export function ReportsSection() {
  const { data: session } = useGetAdminSession();
  const readOnly = session?.role === "demo";
  const { data, isLoading, isError } = useListConformityReports(undefined, {
    query: {
      queryKey: getListConformityReportsQueryKey(),
      refetchInterval: (query) =>
        query.state.data?.reports.some((r) => r.status === "generating") ? 4000 : false,
    },
  });
  const reports = data?.reports ?? [];
  const portfolioReports = reports.filter((r) => r.scope === "portfolio");
  const assessmentReports = reports.filter((r) => r.scope === "assessment");

  return (
    <section id="reports" className="space-y-6" data-testid="reports-section">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 border-b border-border pb-4">
        <div>
          <h2 className="text-2xl font-serif font-normal tracking-tight text-foreground flex items-center gap-2.5">
            <FileText className="w-5 h-5 text-primary shrink-0" /> Reports
          </h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl font-sans">
            Executive documents generated from frozen data snapshots — portfolio rollups across every
            product, and per-assessment briefings, full reports and readouts. Each stays exactly as
            generated; finalise to lock.
          </p>
        </div>
        {!readOnly ? (
          <ReportBuilderDialog
            scope="portfolio"
            trigger={
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs rounded-lg shadow-sm cta-lift shrink-0" data-testid="report-new-portfolio">
                <Plus className="h-4 w-4 mr-1.5" aria-hidden="true" />
                New portfolio report
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
      ) : (
        <>
          <div className="space-y-3">
            <h3 className="text-lg font-serif font-normal text-foreground">Portfolio rollups</h3>
            {portfolioReports.length === 0 ? (
              <Empty>
                <FileText className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
                <EmptyTitle>No portfolio reports yet</EmptyTitle>
                <EmptyDescription>
                  A portfolio report rolls every product's grade, gaps and deadlines into one executive document.
                </EmptyDescription>
              </Empty>
            ) : (
              <div className="space-y-2">
                {portfolioReports.map((r) => (
                  <ReportRow key={r.id} report={r} />
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-serif font-normal text-foreground">Assessment reports</h3>
            {assessmentReports.length === 0 ? (
              <Empty>
                <EmptyTitle>No assessment reports yet</EmptyTitle>
                <EmptyDescription>
                  Generate them from an assessment's Reports tab — they'll all be listed here too.
                </EmptyDescription>
              </Empty>
            ) : (
              <div className="space-y-2">
                {assessmentReports.map((r) => (
                  <ReportRow key={r.id} report={r} showProduct />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
}
