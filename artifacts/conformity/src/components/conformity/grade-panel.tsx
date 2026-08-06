import { useQueryClient } from "@tanstack/react-query";
import {
  useListConformityGrades,
  useComputeConformityGrade,
} from "@workspace/api-client-react";
import type { ConformityGrade } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { gradeClass, formatDateTime } from "@/lib/conformity";
import { Gauge, AlertOctagon, RefreshCw } from "lucide-react";

function GradeCard({ grade }: { grade: ConformityGrade }) {
  return (
    <Card className="rounded-md">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div
            className={cn(
              "flex flex-col items-center justify-center w-full md:w-44 shrink-0 border p-6",
              gradeClass(grade.overallGrade),
            )}
          >
            <div className="text-6xl font-bold font-mono leading-none">{grade.overallGrade}</div>
            <div className="text-sm font-mono mt-2">{grade.overallScore}/100</div>
            <div className="text-[10px] uppercase tracking-widest mt-1">Readiness</div>
          </div>

          <div className="flex-1 space-y-4">
            {grade.blockerCount > 0 && (
              <div className="flex items-center gap-2 p-3 border border-red-500/30 bg-red-500/5 text-red-700 text-sm">
                <AlertOctagon className="w-4 h-4 shrink-0" />
                {grade.blockerCount} unmet mandatory requirement
                {grade.blockerCount === 1 ? "" : "s"} — grade capped until resolved.
              </div>
            )}

            <div>
              <h4 className="text-xs uppercase tracking-wide text-muted-foreground mb-3">
                Coverage by theme
              </h4>
              <div className="space-y-3">
                {grade.perTheme.length === 0 && (
                  <p className="text-sm text-muted-foreground">No scored requirements.</p>
                )}
                {grade.perTheme.map((t) => {
                  // Engine already returns score as an integer 0–100; do not rescale.
                  const pct = Math.round(t.score);
                  return (
                    <div key={t.themeKey} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-medium">{t.themeName}</span>
                        <span className="font-mono text-muted-foreground">
                          {t.met}/{t.total} · {pct}%
                        </span>
                      </div>
                      <Progress value={pct} className="h-1.5 rounded-md" />
                    </div>
                  );
                })}
              </div>
            </div>

            {grade.perArtifact.length > 0 && (
              <div>
                <h4 className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                  Document completeness
                </h4>
                <div className="flex flex-wrap gap-2">
                  {grade.perArtifact.map((a) => (
                    <Badge key={a.artifactType} variant="outline" className="rounded-md font-mono">
                      {a.artifactType}: {a.completeness}%
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="text-[10px] text-muted-foreground font-mono">
              Computed {formatDateTime(grade.computedAt)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function GradePanel({ assessmentId }: { assessmentId: number }) {
  const qc = useQueryClient();
  const { data: grades, isLoading } = useListConformityGrades(assessmentId);
  const compute = useComputeConformityGrade({
    mutation: { onSuccess: () => qc.invalidateQueries() },
  });

  const latest = grades?.[0];
  const history = grades?.slice(1) ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground max-w-2xl">
          Score the assessment: 70% requirement coverage, 30% document completeness. Any unmet
          mandatory requirement caps the grade at D.
        </p>
        <Button
          className="rounded-md shrink-0"
          onClick={() => compute.mutate({ id: assessmentId })}
          disabled={compute.isPending}
        >
          <Gauge className="w-4 h-4 mr-2" />
          {latest ? "Recompute readiness" : "Compute readiness"}
        </Button>
      </div>

      {isLoading && <Skeleton className="h-52 w-full" />}

      {!isLoading && !latest && (
        <Card className="rounded-md">
          <CardContent className="p-10 text-center text-muted-foreground">
            No readiness grade yet — compute one once you have made progress on the requirements.
          </CardContent>
        </Card>
      )}

      {latest && <GradeCard grade={latest} />}

      {history.length > 0 && (
        <Card className="rounded-md">
          <CardHeader>
            <CardTitle className="text-sm">History</CardTitle>
            <CardDescription>Previous readiness snapshots.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {history.map((g) => (
              <div
                key={g.id}
                className="flex items-center justify-between text-sm border-b border-border/60 pb-2 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={cn("rounded-md font-mono", gradeClass(g.overallGrade))}>
                    {g.overallGrade}
                  </Badge>
                  <span className="font-mono text-muted-foreground">{g.overallScore}/100</span>
                  {g.blockerCount > 0 && (
                    <span className="text-xs text-red-600">{g.blockerCount} blocker(s)</span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground font-mono">
                  {formatDateTime(g.computedAt)}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
