import { useListRegulations } from '@workspace/api-client-react';
import { ConformityShell } from '@/components/layout/conformity-shell';
import { PageHeader } from '@/components/page-header';
import { Scale } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { regBgStyle, regTextStyle } from '@/lib/reg-colors';
import { ExternalLink, ArrowRight } from 'lucide-react';

export default function ConformityRegulations() {
  const { data: regulations, isLoading, isError } = useListRegulations();

  if (isLoading) {
    return (
      <ConformityShell>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-64 w-full rounded-xl" />)}
        </div>
      </ConformityShell>
    );
  }

  if (isError || !regulations) {
    return (
      <ConformityShell>
        <div className="text-destructive">Failed to load regulations.</div>
      </ConformityShell>
    );
  }

  return (
    <ConformityShell>
      <div className="max-w-6xl space-y-8">
        <PageHeader
          kicker="EU & INTERNATIONAL REGULATORY FRAMEWORKS"
          title="Regulations"
          icon={Scale}
          description="The regulation tracks loaded in this deployment's conformity scope, from the Cyber Resilience Act to IEC 62443. Each framework is decomposed into its statutory requirements and mapped into a single shared control catalogue. Use a card to explore a regulation's product classes, conformity routes and extracted obligations. Counts reflect the live requirement catalogue that drives the workbench."
        />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {regulations.map((reg) => (
            <div
              key={reg.key}
              className="rounded-xl border border-border bg-card flex flex-col overflow-hidden"
              style={{ borderTop: `3px solid hsl(${regBgStyle(reg.key).background?.toString().match(/hsl\((.+)\)/)?.[1] ?? '220 14% 50%'})` }}
            >
              {/* Accent top bar */}
              <div className="h-1 w-full" style={regBgStyle(reg.key)} />

              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <span
                    className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-mono font-bold text-white"
                    style={regBgStyle(reg.key)}
                  >
                    {reg.shortName}
                  </span>
                  <Badge variant="secondary" className="font-mono text-xs">{reg.jurisdiction}</Badge>
                </div>

                <h3 className="text-lg font-display font-bold text-foreground leading-tight mb-3">
                  {reg.fullTitle}
                </h3>

                <p className="text-sm text-muted-foreground mb-5 line-clamp-3 flex-1">{reg.summary}</p>

                <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-lg border border-border/50 mb-5">
                  <div>
                    <div className="text-muted-foreground text-xs mb-1">In Force</div>
                    <div className="font-mono font-medium">
                      {reg.inForceDate ? new Date(reg.inForceDate).getFullYear() : 'Pending'}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs mb-1">Requirements</div>
                    <div className="font-mono font-bold" style={regTextStyle(reg.key)}>
                      {reg.requirementCount}
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t border-border">
                  <a
                    href={reg.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Official Text <ExternalLink className="w-3 h-3" />
                  </a>
                  <Link
                    href={`/conformity-platform/regulations/${reg.key}`}
                    className="text-sm inline-flex items-center gap-1.5 font-medium hover:text-primary transition-colors"
                  >
                    View Details <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ConformityShell>
  );
}
