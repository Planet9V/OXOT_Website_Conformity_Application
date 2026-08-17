import { useGetRegulation, getGetRegulationQueryKey } from "@workspace/api-client-react";
import { useParams, Link } from "wouter";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getRegColor, formatDate } from "@/lib/utils";
import { ActLifecyclePanel } from "@/components/act-lifecycle-panel";

/** Acts with an in-app verbatim reader (Library). */
const READER_PATHS: Record<string, string> = {
  cra: "/library/statute",
  nis2: "/library/nis2",
  ai_act: "/library/ai-act",
  machinery: "/library/machinery",
  red: "/library/red",
  gdpr: "/library/gdpr",
  data_act: "/library/data-act",
};
import { ArrowLeft, ExternalLink, AlertTriangle } from "lucide-react";

export default function RegulationDetail() {
  const params = useParams();
  const key = params.key as string;
  
  const { data: reg, isLoading, isError } = useGetRegulation(key, {
    query: {
      enabled: !!key,
      queryKey: getGetRegulationQueryKey(key)
    }
  });

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <Skeleton className="h-8 w-32 mb-8" />
        <Skeleton className="h-12 w-3/4" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Skeleton className="col-span-2 h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (isError || !reg) {
    return (
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="text-destructive">Regulation not found or failed to load.</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <Link href="/regulations" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Regulations
        </Link>
        <div className="flex items-center gap-3 mb-3">
          <Badge className={`${getRegColor(reg.key)} font-mono text-sm border-none px-3 py-1 rounded-md`}>{reg.shortName}</Badge>
          <Badge variant="outline" className="font-mono rounded-md">{reg.jurisdiction}</Badge>
        </div>
        <h1 className="text-3xl font-bold tracking-tight mb-4">{reg.fullTitle}</h1>
        <div className="flex gap-4 items-center text-sm">
          <a 
            href={reg.sourceUrl} 
            target="_blank" 
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-primary hover:underline"
          >
            Official Text (EUR-Lex) <ExternalLink className="w-3 h-3" />
          </a>
          {READER_PATHS[reg.key] && (
            <>
              <span className="text-muted-foreground">&bull;</span>
              <Link
                href={READER_PATHS[reg.key]!}
                className="inline-flex items-center gap-1.5 text-primary hover:underline"
              >
                Read verbatim in the Library
              </Link>
            </>
          )}
          <span className="text-muted-foreground">&bull;</span>
          <span className="font-mono text-muted-foreground">{reg.requirementCount} extracted obligations</span>
        </div>
      </div>

      {reg.requirementCount === 0 && (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-5 py-4 text-sm text-amber-600 dark:text-amber-400">
          Reference-only: this act is listed for scope awareness and can be declared on the
          Organisation page, but its obligations are not yet modelled in this application.
          Zero here means un-modelled, not compliant.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <Card className="rounded-md border-l-4 border-l-muted">
            <CardHeader>
              <CardTitle className="text-lg">Executive Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="leading-relaxed text-foreground/90">{reg.summary}</p>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight border-b border-border pb-2">Product Classes</h2>
            {reg.classes.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No product classes are modelled for this act.
              </p>
            )}
            <div className="grid gap-4">
              {reg.classes.map(cls => (
                <Card key={cls.id} className="rounded-md shadow-none">
                  <CardContent className="p-4 flex gap-4 items-start">
                    <div className="shrink-0 pt-1">
                      <Badge variant="outline" className="font-mono w-16 justify-center bg-muted/30">{cls.key}</Badge>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{cls.name}</h3>
                        {cls.riskLevel && (
                          <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider rounded-md px-1.5">
                            {cls.riskLevel} Risk
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{cls.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold tracking-tight border-b border-border pb-2">Conformity Routes</h2>
            {reg.routes.length === 0 && (
              <p className="text-sm text-muted-foreground">
                No conformity routes are modelled for this act.
              </p>
            )}
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[120px]">Route Code</TableHead>
                  <TableHead>Procedure</TableHead>
                  <TableHead className="text-right">3rd Party Assessment</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reg.routes.map(route => (
                  <TableRow key={route.id}>
                    <TableCell className="font-mono font-medium text-xs">{route.key}</TableCell>
                    <TableCell>
                      <div className="font-medium mb-1">{route.name}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2">{route.description}</div>
                      {route.appliesToClasses.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {route.appliesToClasses.map(c => (
                            <Badge key={c} variant="outline" className="text-[10px] px-1 h-4">{c}</Badge>
                          ))}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {route.thirdPartyRequired ? (
                        <Badge variant="destructive" className="rounded-md uppercase text-[10px]">Required</Badge>
                      ) : (
                        <Badge variant="secondary" className="rounded-md uppercase text-[10px]">Self-Assessment</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="rounded-md bg-sidebar/50">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                Timeline <AlertTriangle className="w-4 h-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px before:h-full before:w-0.5 before:bg-border">
                {reg.keyDates.map((date, idx) => (
                  <div key={idx} className="relative flex gap-4 pb-6 last:pb-0">
                    <div className="w-4 h-4 rounded-full bg-background border-2 border-primary shrink-0 z-10" />
                    <div className="-mt-1.5">
                      <time className="text-xs font-mono font-bold text-primary block mb-0.5">{formatDate(date.date)}</time>
                      <span className="text-sm font-medium">{date.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 19.2 — how current the loaded text is, from the act's own corpus metadata. */}
          <ActLifecyclePanel regKey={reg.key} />
        </div>
      </div>
    </div>
  );
}
