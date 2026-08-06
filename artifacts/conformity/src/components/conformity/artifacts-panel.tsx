import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  useListConformityArtifacts,
  useGenerateConformityArtifacts,
  useGetConformityAnnexReadiness,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/conformity";
import { printArtifacts, type PrintMeta } from "@/lib/print";
import { FileText, RefreshCw, CheckCircle2, AlertCircle, Download } from "lucide-react";
import type { ConformityArtifact } from "@workspace/api-client-react";

const POPUP_BLOCKED =
  "Couldn't open the export window. Allow pop-ups for this site, then try again.";

/**
 * Guided builders for the two statutory documents (Annex V DoC, Annex VII
 * technical documentation): a per-field completeness checklist computed by the
 * SAME server-side builders that generate the documents, with an actionable
 * hint for every missing field.
 */
function AnnexBuilders({ assessmentId }: { assessmentId: number }) {
  const { data, isLoading } = useGetConformityAnnexReadiness(assessmentId);
  if (isLoading) return <Skeleton className="h-40 w-full" />;
  // Null-guard the shape too: e2e catch-all mocks may answer `[]` for unknown
  // endpoints, and a crash here would take the whole Documents tab with it.
  if (!data?.euDoc?.items || !data?.technicalDocumentation?.items) return null;
  const docs = [data.euDoc, data.technicalDocumentation];
  return (
    <div className="grid gap-4 lg:grid-cols-2" data-testid="annex-builders">
      {docs.map((doc) => {
        const pct = doc.totalCount > 0 ? Math.round((doc.completeCount / doc.totalCount) * 100) : 0;
        return (
          <Card key={doc.annexRef} className="rounded-md">
            <CardHeader className="border-b border-border">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary shrink-0" />
                  {doc.title}
                </CardTitle>
                <Badge variant="outline" className="rounded-md font-mono text-[10px] shrink-0">
                  {doc.annexRef}
                </Badge>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <Progress value={pct} className="h-2 rounded-md" />
                <span className="text-xs font-mono text-muted-foreground whitespace-nowrap">
                  {doc.completeCount}/{doc.totalCount} fields
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              <ul className="space-y-2">
                {doc.items.map((item) => (
                  <li key={item.key} className="flex items-start gap-2 text-sm">
                    {item.complete ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0">
                      <span className={cn(!item.complete && "font-medium")}>{item.label}</span>
                      {!item.complete && item.hint && (
                        <p className="text-xs text-muted-foreground mt-0.5">{item.hint}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function ArtifactsPanel({
  assessmentId,
  meta,
}: {
  assessmentId: number;
  meta: PrintMeta;
}) {
  const qc = useQueryClient();
  const { data: artifacts, isLoading } = useListConformityArtifacts(assessmentId);
  const generate = useGenerateConformityArtifacts({
    mutation: { onSuccess: () => qc.invalidateQueries() },
  });

  const hasArtifacts = (artifacts?.length ?? 0) > 0;

  const exportPackage = () => {
    if (!printArtifacts(meta, artifacts ?? [])) toast.error(POPUP_BLOCKED);
  };
  const exportOne = (artifact: ConformityArtifact) => {
    if (!printArtifacts(meta, [artifact], { singleLabel: artifact.label })) {
      toast.error(POPUP_BLOCKED);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <p className="text-sm text-muted-foreground max-w-2xl">
          Generate the technical documentation and declaration package from the answers, evaluations
          and evidence captured so far. Sections flagged incomplete point to gaps to close before
          declaring conformity.
        </p>
        <div className="flex items-center gap-2 shrink-0">
          {hasArtifacts && (
            <Button variant="outline" className="rounded-md" onClick={exportPackage}>
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
          )}
          <Button
            className="rounded-md"
            onClick={() => generate.mutate({ id: assessmentId })}
            disabled={generate.isPending}
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", generate.isPending && "animate-spin")} />
            {hasArtifacts ? "Regenerate" : "Generate documents"}
          </Button>
        </div>
      </div>

      <AnnexBuilders assessmentId={assessmentId} />

      {isLoading && <Skeleton className="h-64 w-full" />}

      {!isLoading && !hasArtifacts && (
        <Card className="rounded-md">
          <CardContent className="p-10 text-center text-muted-foreground">
            No documents generated yet.
          </CardContent>
        </Card>
      )}

      <div className="space-y-4" aria-live="polite" aria-busy={isLoading}>
        {artifacts?.map((artifact) => (
          <Card key={artifact.id} className="rounded-md">
            <CardHeader className="border-b border-border">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="w-4 h-4 text-primary shrink-0" />
                  {artifact.label}
                </CardTitle>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="rounded-md font-mono text-[10px]">
                    v{artifact.version}
                  </Badge>
                  <div className="flex items-center gap-2 flex-1 sm:w-40 sm:flex-none">
                    <Progress value={artifact.completeness} className="h-2 rounded-md" />
                    <span className="text-xs font-mono text-muted-foreground w-9 text-right">
                      {artifact.completeness}%
                    </span>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-md shrink-0 text-muted-foreground hover:text-foreground"
                    aria-label="Export this document as PDF"
                    title="Export this document as PDF"
                    onClick={() => exportOne(artifact)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Accordion type="multiple">
                {artifact.sections.map((section) => (
                  <AccordionItem
                    key={section.key}
                    value={section.key}
                    className="border-border px-4"
                  >
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex items-center gap-2 text-left">
                        {section.complete ? (
                          <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                        )}
                        <span className="text-sm font-medium">{section.label}</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <pre className="whitespace-pre-wrap font-sans text-sm text-muted-foreground leading-relaxed pl-6">
                        {section.body}
                      </pre>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
            <div className="px-4 py-2 border-t border-border text-[10px] text-muted-foreground font-mono">
              Generated {formatDateTime(artifact.generatedAt)}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
