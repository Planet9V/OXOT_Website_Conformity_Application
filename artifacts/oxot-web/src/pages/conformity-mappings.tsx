import { useGetMappingMatrix } from '@workspace/api-client-react';
import { ConformityShell } from '@/components/layout/conformity-shell';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { regBgStyle } from '@/lib/reg-colors';

export default function ConformityMappings() {
  const { data: matrix, isLoading, isError } = useGetMappingMatrix();

  if (isLoading) {
    return (
      <ConformityShell>
        <div className="space-y-4">
          <Skeleton className="h-10 w-64 rounded-xl" />
          <Skeleton className="h-[500px] w-full rounded-xl" />
        </div>
      </ConformityShell>
    );
  }

  if (isError || !matrix) {
    return (
      <ConformityShell>
        <div className="text-destructive">Failed to load mapping matrix.</div>
      </ConformityShell>
    );
  }

  return (
    <ConformityShell>
      <div className="max-w-[1400px] space-y-8">
        <div>
          <h2 className="text-2xl font-display font-bold mb-1">Cross-Regulation Matrix</h2>
          <p className="text-muted-foreground text-sm">
            The "one control, many clauses" view across themes.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-auto shadow-sm">
          <Table className="relative w-full">
            <TableHeader className="bg-muted/50 sticky top-0 z-20 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-muted/50">
              <TableRow>
                <TableHead className="w-[240px] font-bold text-foreground bg-muted/80 z-30 sticky left-0 border-r border-border shadow-[1px_0_0_0_hsl(var(--border))]">
                  Theme / Domain
                </TableHead>
                {matrix.regulations.map((reg) => (
                  <TableHead
                    key={reg.key}
                    className="min-w-[180px] align-top bg-muted/50 p-4 border-r border-border last:border-r-0"
                  >
                    <div className="flex flex-col gap-2">
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-bold text-white w-fit"
                        style={regBgStyle(reg.key)}
                      >
                        {reg.shortName}
                      </span>
                      <span className="text-xs font-normal text-muted-foreground">
                        {reg.requirementCount} Requirements
                      </span>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {matrix.themes.map((theme) => (
                <TableRow key={theme.key} className="hover:bg-transparent">
                  <TableCell className="align-top bg-card sticky left-0 z-10 border-r border-b border-border shadow-[1px_0_0_0_hsl(var(--border))] p-4">
                    <div className="font-semibold mb-1 text-sm">{theme.name}</div>
                    <div className="text-xs text-muted-foreground leading-relaxed">{theme.description}</div>
                  </TableCell>
                  {matrix.regulations.map((reg) => {
                    const cell = matrix.cells.find(
                      (c) => c.themeKey === theme.key && c.regulationKey === reg.key,
                    );
                    const count = cell?.requirementCount ?? 0;
                    const refs  = cell?.requirementRefs  ?? [];

                    return (
                      <TableCell
                        key={`${theme.key}-${reg.key}`}
                        className="align-top border-r border-b border-border last:border-r-0 p-4 group hover:bg-muted/20 transition-colors"
                      >
                        {count > 0 ? (
                          <div className="space-y-2">
                            <Badge variant="outline" className="font-mono text-xs bg-background">
                              {count} {count === 1 ? 'Req' : 'Reqs'}
                            </Badge>
                            <div className="flex flex-wrap gap-1.5">
                              {refs.slice(0, 10).map((ref, i) => (
                                <span
                                  key={i}
                                  className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-border/60 bg-muted/30 text-muted-foreground group-hover:border-border group-hover:text-foreground transition-colors cursor-default whitespace-nowrap"
                                >
                                  {ref}
                                </span>
                              ))}
                              {refs.length > 10 && (
                                <span className="text-[10px] font-mono px-1 py-0.5 text-muted-foreground">
                                  +{refs.length - 10} more
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="h-full w-full flex items-center justify-center opacity-10">
                            <span className="block w-4 h-px bg-foreground" />
                          </div>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </ConformityShell>
  );
}
