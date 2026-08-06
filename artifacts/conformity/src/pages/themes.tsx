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
          <Card key={item.theme.id} className="rounded-md overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border pb-4">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl mb-1">{item.theme.name}</CardTitle>
                  <CardDescription>{item.theme.description}</CardDescription>
                </div>
                <Badge variant="secondary" className="font-mono text-sm rounded-md">
                  {item.totalRequirements} Reqs
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex h-12 w-full relative group">
                {item.coverage.map((cov) => {
                  const percentage = Math.round((cov.requirementCount / item.totalRequirements) * 100);
                  if (percentage === 0) return null;
                  
                  return (
                    <div 
                      key={cov.regulationKey} 
                      className={`h-full ${getRegColor(cov.regulationKey)} relative transition-all duration-300 hover:opacity-90 flex items-center justify-center`}
                      style={{ width: `${percentage}%` }}
                      title={`${cov.regulationShortName}: ${cov.requirementCount} requirements`}
                    >
                      {percentage > 10 && (
                        <span className="text-xs font-bold font-mono tracking-tighter mix-blend-overlay text-white opacity-80">
                          {cov.regulationShortName} ({cov.requirementCount})
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
