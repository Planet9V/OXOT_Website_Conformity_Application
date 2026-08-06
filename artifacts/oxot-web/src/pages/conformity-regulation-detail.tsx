import { useGetRegulation, getGetRegulationQueryKey } from '@workspace/api-client-react';
import { useParams, Link } from 'wouter';
import { ConformityShell } from '@/components/layout/conformity-shell';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { regBgStyle, regTextStyle } from '@/lib/reg-colors';
import { ArrowLeft, ExternalLink, AlertTriangle, Calendar } from 'lucide-react';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function ConformityRegulationDetail() {
  const params = useParams() as { key: string };
  const key = params.key;

  const { data: reg, isLoading, isError } = useGetRegulation(key, {
    query: { enabled: !!key, queryKey: getGetRegulationQueryKey(key) },
  });

  if (isLoading) {
    return (
      <ConformityShell>
        <div className="space-y-6 max-w-5xl">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-12 w-3/4" />
          <div className="grid grid-cols-3 gap-6">
            <Skeleton className="col-span-2 h-64 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
        </div>
      </ConformityShell>
    );
  }

  if (isError || !reg) {
    return (
      <ConformityShell>
        <div className="text-destructive">Regulation not found or failed to load.</div>
      </ConformityShell>
    );
  }

  return (
    <ConformityShell>
      <div className="max-w-5xl space-y-8">

        {/* Back + header */}
        <div>
          <Link
            href="/conformity-platform/regulations"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Regulations
          </Link>

          <div className="flex flex-wrap items-center gap-3 mb-3">
            <span
              className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-mono font-bold text-white"
              style={regBgStyle(reg.key)}
            >
              {reg.shortName}
            </span>
            <Badge variant="outline" className="font-mono">{reg.jurisdiction}</Badge>
          </div>

          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-3">{reg.fullTitle}</h2>

          <div className="flex flex-wrap gap-4 items-center text-sm">
            <a
              href={reg.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-primary hover:underline"
            >
              Official Directive Text <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-muted-foreground">·</span>
            <span className="font-mono text-muted-foreground">{reg.requirementCount} extracted obligations</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Main content */}
          <div className="lg:col-span-2 space-y-8">

            {/* Summary */}
            <div className="rounded-xl border border-border bg-card p-6"
              style={{ borderLeft: `4px solid hsl(${regBgStyle(reg.key).background?.toString().match(/hsl\((.+)\)/)?.[1] ?? '220 14% 50%'})` }}>
              <h3 className="text-base font-display font-bold mb-3">Executive Summary</h3>
              <p className="leading-relaxed text-foreground/90 text-sm">{reg.summary}</p>
            </div>

            {/* Product classes */}
            {reg.classes.length > 0 && (
              <div>
                <h3 className="text-xl font-display font-bold border-b border-border pb-3 mb-4">Product Classes</h3>
                <div className="grid gap-3">
                  {reg.classes.map((cls) => (
                    <div key={cls.id} className="rounded-xl border border-border bg-card p-4 flex gap-4 items-start">
                      <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-md text-xs font-mono font-bold text-white mt-0.5"
                        style={regBgStyle(reg.key, 0.7)}>
                        {cls.key}
                      </span>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-sm">{cls.name}</h4>
                          {cls.riskLevel && (
                            <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider px-1.5">
                              {cls.riskLevel} Risk
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{cls.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Conformity routes */}
            {reg.routes.length > 0 && (
              <div>
                <h3 className="text-xl font-display font-bold border-b border-border pb-3 mb-4">Conformity Routes</h3>
                <div className="rounded-xl border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/40">
                        <TableHead className="w-[120px]">Route Code</TableHead>
                        <TableHead>Procedure</TableHead>
                        <TableHead className="text-right">3rd Party</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reg.routes.map((route) => (
                        <TableRow key={route.id} className="border-border">
                          <TableCell className="font-mono text-xs font-medium" style={regTextStyle(reg.key)}>
                            {route.key}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-sm mb-1">{route.name}</div>
                            <div className="text-xs text-muted-foreground line-clamp-2">{route.description}</div>
                            {route.appliesToClasses.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {route.appliesToClasses.map((c) => (
                                  <Badge key={c} variant="outline" className="text-[10px] px-1 h-4">{c}</Badge>
                                ))}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {route.thirdPartyRequired ? (
                              <Badge variant="destructive" className="uppercase text-[10px]">Required</Badge>
                            ) : (
                              <Badge variant="secondary" className="uppercase text-[10px]">Self-Assessment</Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar: Timeline */}
          <div>
            <div className="rounded-xl border border-border bg-card p-5 sticky top-40">
              <h3 className="text-base font-display font-bold mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" /> Timeline
                <AlertTriangle className="w-3.5 h-3.5 text-muted-foreground ml-auto" />
              </h3>
              <div className="relative pl-4 before:absolute before:left-1 before:top-0 before:h-full before:w-px before:bg-border">
                {reg.keyDates.map((d, i) => (
                  <div key={i} className="relative pb-5 last:pb-0">
                    <div className="absolute -left-[1.1rem] top-0.5 w-2.5 h-2.5 rounded-full bg-background border-2 border-primary" />
                    <time className="text-xs font-mono font-bold text-primary block mb-0.5">{formatDate(d.date)}</time>
                    <span className="text-sm font-medium">{d.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </ConformityShell>
  );
}
