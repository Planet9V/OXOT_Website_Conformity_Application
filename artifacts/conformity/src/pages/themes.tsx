import { useListThemes } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { getRegColor, getRegBorderColor } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function Themes() {
  const { data: themes, isLoading, isError } = useListThemes();

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="space-y-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 w-full" />)}
        </div>
      </div>
    );
  }

  if (isError || !themes) {
    return <div className="p-4 sm:p-6 lg:p-8 text-destructive">Failed to load themes.</div>;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      <div className="border-b border-border pb-6">
        <span className="oxot-kicker block mb-1">FUNCTIONAL COMPLIANCE DOMAINS</span>
        <h1 className="text-3xl sm:text-4xl font-serif font-normal tracking-tight text-foreground">Cross-cutting Themes</h1>
        <p className="text-sm text-muted-foreground mt-1 font-sans">Functional domains shared across multiple regulatory frameworks.</p>
      </div>

      <div className="space-y-6">
        {themes.map((item) => (
          <Card key={item.theme.id} className="rounded-md">
            <CardHeader className="pb-4">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <CardTitle className="text-xl font-serif font-normal mb-1">{item.theme.name}</CardTitle>
                  <CardDescription>{item.theme.description}</CardDescription>
                </div>
                <span className="shrink-0 font-mono text-xs text-muted-foreground uppercase tracking-wider pt-1.5">
                  {item.totalRequirements} reqs
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="flex h-2 w-full rounded-full overflow-hidden bg-muted">
                {item.coverage.map((cov) => {
                  const percentage = Math.round((cov.requirementCount / item.totalRequirements) * 100);
                  if (percentage === 0) return null;
                  return (
                    <div
                      key={cov.regulationKey}
                      className={`h-full ${getRegColor(cov.regulationKey)}`}
                      style={{ width: `${percentage}%` }}
                      title={`${cov.regulationShortName}: ${cov.requirementCount} requirements`}
                    />
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-1.5">
                {item.coverage
                  .filter((cov) => cov.requirementCount > 0)
                  .map((cov) => (
                    <span
                      key={cov.regulationKey}
                      className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider text-muted-foreground"
                    >
                      <span className={`h-2 w-2 rounded-full ${getRegColor(cov.regulationKey)}`} />
                      {cov.regulationShortName} — {cov.requirementCount}
                    </span>
                  ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
