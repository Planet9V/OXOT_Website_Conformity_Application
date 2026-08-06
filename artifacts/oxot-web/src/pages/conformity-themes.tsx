import { useListThemes } from '@workspace/api-client-react';
import { ConformityShell } from '@/components/layout/conformity-shell';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { regBgStyle } from '@/lib/reg-colors';

export default function ConformityThemes() {
  const { data: themes, isLoading, isError } = useListThemes();

  if (isLoading) {
    return (
      <ConformityShell>
        <div className="space-y-5">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-36 w-full rounded-xl" />)}
        </div>
      </ConformityShell>
    );
  }

  if (isError || !themes) {
    return (
      <ConformityShell>
        <div className="text-destructive">Failed to load themes.</div>
      </ConformityShell>
    );
  }

  return (
    <ConformityShell>
      <div className="max-w-4xl space-y-8">
        <div>
          <h2 className="text-2xl font-display font-bold mb-1">Cross-cutting Themes</h2>
          <p className="text-muted-foreground text-sm">
            Functional domains shared across multiple regulatory frameworks.
          </p>
        </div>

        <div className="space-y-5">
          {themes.map((item) => (
            <div key={item.theme.id} className="rounded-xl border border-border bg-card overflow-hidden">
              {/* Header */}
              <div className="bg-muted/30 border-b border-border px-6 py-4 flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-display font-bold mb-0.5">{item.theme.name}</h3>
                  <p className="text-sm text-muted-foreground">{item.theme.description}</p>
                </div>
                <Badge variant="secondary" className="font-mono text-sm shrink-0 ml-4">
                  {item.totalRequirements} Reqs
                </Badge>
              </div>

              {/* Coverage bar */}
              <div className="flex h-10 w-full">
                {item.coverage.map((cov) => {
                  const pct = Math.round((cov.requirementCount / item.totalRequirements) * 100);
                  if (pct === 0) return null;
                  return (
                    <div
                      key={cov.regulationKey}
                      className="h-full relative transition-all duration-300 hover:opacity-80 flex items-center justify-center"
                      style={{ width: `${pct}%`, ...regBgStyle(cov.regulationKey) }}
                      title={`${cov.regulationShortName}: ${cov.requirementCount} requirements`}
                    >
                      {pct > 8 && (
                        <span className="text-[11px] font-bold font-mono tracking-tighter text-white mix-blend-overlay opacity-90 select-none">
                          {cov.regulationShortName} ({cov.requirementCount})
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="px-6 py-3 flex flex-wrap gap-3">
                {item.coverage.filter(c => c.requirementCount > 0).map((cov) => (
                  <div key={cov.regulationKey} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="inline-block w-2.5 h-2.5 rounded-sm" style={regBgStyle(cov.regulationKey)} />
                    {cov.regulationShortName} · {cov.requirementCount}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ConformityShell>
  );
}
