import { useGetMappingMatrix } from "@workspace/api-client-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { getRegColor } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export default function Mappings() {
  const { data: matrix, isLoading, isError } = useGetMappingMatrix();

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <Skeleton className="h-10 w-64 mb-8" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (isError || !matrix) {
    return <div className="p-8 text-destructive">Failed to load mapping matrix.</div>;
  }

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8 max-w-[1600px] mx-auto space-y-8">
      <div className="shrink-0 border-b border-border pb-6">
        <span className="oxot-kicker block mb-1">CROSS-REGULATORY EQUIVALENCE MATRIX</span>
        <h1 className="text-3xl sm:text-4xl font-serif font-normal tracking-tight text-foreground">Cross-Regulation Matrix</h1>
        <p className="text-sm text-muted-foreground mt-1 font-sans">The "one control, many clauses" view across themes.</p>
      </div>

      <div className="max-h-[calc(100dvh-16rem)] border border-border rounded-md bg-card overflow-auto shadow-sm">
        <Table className="relative w-full">
          <TableHeader className="bg-muted/50 sticky top-0 z-20 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-muted/50">
            <TableRow>
              <TableHead className="w-[250px] font-bold text-foreground bg-muted/80 z-30 sticky left-0 border-r border-border shadow-[1px_0_0_0_hsl(var(--border))]">
                Theme / Domain
              </TableHead>
              {matrix.regulations.map((reg) => (
                <TableHead key={reg.key} className="min-w-[200px] align-top bg-muted/50 p-4 border-r border-border last:border-r-0">
                  <div className="flex flex-col gap-2">
                    <Badge className={`${getRegColor(reg.key)} w-fit text-xs border-none rounded-md px-2`}>
                      {reg.shortName}
                    </Badge>
                    <span className="text-xs font-normal text-muted-foreground">{reg.requirementCount} Requirements</span>
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {matrix.themes.map((theme) => (
              <TableRow key={theme.key} className="hover:bg-transparent">
                <TableCell className="align-top bg-card sticky left-0 z-10 border-r border-b border-border shadow-[1px_0_0_0_hsl(var(--border))] p-4">
                  <div className="font-semibold mb-1">{theme.name}</div>
                  <div className="text-xs text-muted-foreground leading-relaxed">{theme.description}</div>
                </TableCell>
                {matrix.regulations.map((reg) => {
                  const cell = matrix.cells.find(c => c.themeKey === theme.key && c.regulationKey === reg.key);
                  const count = cell?.requirementCount || 0;
                  const refs = cell?.requirementRefs || [];

                  return (
                    <TableCell key={`${theme.key}-${reg.key}`} className="align-top border-r border-b border-border last:border-r-0 p-4 group hover:bg-muted/20 transition-colors">
                      {count > 0 ? (
                        <div className="space-y-3">
                          <Badge variant="outline" className="font-mono text-xs rounded-md bg-background">
                            {count} {count === 1 ? 'Req' : 'Reqs'}
                          </Badge>
                          <div className="flex flex-wrap gap-1.5">
                            {refs.slice(0, 10).map((ref, idx) => (
                              <span key={idx} className="text-[10px] font-mono px-1.5 py-0.5 border border-border/60 bg-muted/30 text-muted-foreground group-hover:border-border group-hover:text-foreground transition-colors cursor-default whitespace-nowrap">
                                {ref}
                              </span>
                            ))}
                            {refs.length > 10 && (
                              <span className="text-[10px] font-mono px-1 py-0.5 text-muted-foreground">+{refs.length - 10} more</span>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="h-full w-full flex items-center justify-center opacity-10">
                          <span className="block w-4 h-px bg-foreground"></span>
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
  );
}
