import { useGetRequirement, getGetRequirementQueryKey } from '@workspace/api-client-react';
import { useParams, Link } from 'wouter';
import { ConformityShell } from '@/components/layout/conformity-shell';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { regBgStyle } from '@/lib/reg-colors';
import { ArrowLeft, GitMerge, FileText, Share2, Tag } from 'lucide-react';

export default function ConformityRequirementDetail() {
  const params = useParams() as { id: string };
  const id = Number(params.id);

  const { data: req, isLoading, isError } = useGetRequirement(id, {
    query: { enabled: !!id, queryKey: getGetRequirementQueryKey(id) },
  });

  if (isLoading) {
    return (
      <ConformityShell>
        <div className="max-w-4xl space-y-6">
          <Skeleton className="h-8 w-32 rounded-lg" />
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </ConformityShell>
    );
  }

  if (isError || !req) {
    return (
      <ConformityShell>
        <div className="text-destructive border border-destructive/20 p-4 bg-destructive/5 rounded-xl">
          Requirement not found or failed to load.
        </div>
      </ConformityShell>
    );
  }

  return (
    <ConformityShell>
      <div className="max-w-4xl space-y-8">

        <Link
          href="/conformity-platform/requirements"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Explorer
        </Link>

        {/* Main card */}
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-md">
          {/* Coloured accent bar */}
          <div className="h-1 w-full" style={regBgStyle(req.regulationKey)} />

          <div className="bg-muted/10 border-b border-border p-6 md:p-8 space-y-4">
            <div className="flex flex-wrap gap-3 items-center">
              <Link href={`/conformity-platform/regulations/${req.regulationKey}`}>
                <span
                  className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-mono font-bold text-white cursor-pointer hover:opacity-80 transition-opacity"
                  style={regBgStyle(req.regulationKey)}
                >
                  {req.regulationShortName}
                </span>
              </Link>
              <Badge variant="outline" className="font-mono text-sm">{req.refCode}</Badge>
              {req.themeName && (
                <Badge variant="secondary" className="text-xs font-normal">
                  <Tag className="w-3 h-3 mr-1.5 inline-block opacity-70" />
                  {req.themeName}
                </Badge>
              )}
              <Badge variant="outline" className="ml-auto uppercase tracking-wider text-[10px] text-muted-foreground">
                {req.obligationType}
              </Badge>
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-bold leading-tight pt-1">
              {req.title}
            </h2>
          </div>

          <div className="p-6 md:p-8">
            <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none text-foreground/90 leading-relaxed">
              {req.description.split('\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>

            {req.appliesTo.length > 0 && (
              <div className="mt-8 pt-6 border-t border-border">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2 text-muted-foreground">
                  <FileText className="w-4 h-4" /> Applies to Product Classes
                </h4>
                <div className="flex flex-wrap gap-2">
                  {req.appliesTo.map((cls) => (
                    <Badge key={cls} variant="outline" className="font-mono text-xs bg-muted/30">{cls}</Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Cross-regulation mappings */}
        <div className="space-y-4">
          <h3 className="text-xl font-display font-bold flex items-center gap-2">
            <GitMerge className="w-5 h-5 text-muted-foreground" />
            Cross-Regulation Mappings
            <Badge variant="secondary" className="ml-2 font-mono">{req.mappingCount}</Badge>
          </h3>

          {req.mappings.length === 0 ? (
            <div className="border border-dashed border-border p-8 text-center text-muted-foreground bg-muted/10 rounded-xl">
              No established mappings to other frameworks.
            </div>
          ) : (
            <div className="grid gap-4">
              {req.mappings.map((mapping, idx) => (
                <div key={idx} className="rounded-xl border border-border bg-card hover:border-primary/50 transition-colors group overflow-hidden flex flex-col md:flex-row">
                  {/* Regulation side panel */}
                  <div className="w-full md:w-44 p-4 border-b md:border-b-0 md:border-r border-border flex flex-col justify-center bg-muted/20">
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-mono font-bold text-white self-start mb-2"
                      style={regBgStyle(mapping.regulationKey)}
                    >
                      {mapping.regulationShortName}
                    </span>
                    <span className="font-mono text-sm font-semibold">{mapping.refCode}</span>
                    <div className="mt-auto pt-3 flex items-center text-xs text-muted-foreground uppercase tracking-widest font-bold">
                      <Share2 className="w-3 h-3 mr-1.5" />
                      {mapping.relationship === 'supports' && mapping.direction === 'inbound'
                        ? 'supported by'
                        : mapping.relationship}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-4 md:p-6 flex flex-col justify-between">
                    <div>
                      <Link
                        href={`/conformity-platform/requirements/${mapping.requirementId}`}
                        className="text-sm font-semibold group-hover:text-primary transition-colors block mb-2"
                      >
                        {mapping.title}
                      </Link>
                      {mapping.note && (
                        <p className="text-sm text-muted-foreground border-l-2 border-primary/30 pl-3 py-1 bg-muted/10 rounded-r-lg">
                          Note: {mapping.note}
                        </p>
                      )}
                    </div>
                    <div className="mt-4 pt-4 border-t border-border/50">
                      <Link
                        href={`/conformity-platform/requirements/${mapping.requirementId}`}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Explore Full Requirement →
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </ConformityShell>
  );
}
