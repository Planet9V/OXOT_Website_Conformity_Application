import { useListSourceDocuments } from '@workspace/api-client-react';
import { ConformityShell } from '@/components/layout/conformity-shell';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { Download, FileText, ExternalLink, BookOpen } from 'lucide-react';
import { PageHeader } from '@/components/page-header';

type SourceDoc = {
  title: string;
  filename: string;
  url: string;
  kind: string;
  description: string;
  regulationKey: string | null;
};

const GROUPS: { key: string | null; label: string; color: string }[] = [
  { key: 'cra',        label: 'Cyber Resilience Act',    color: 'text-orange-500 dark:text-orange-400' },
  { key: 'ai_act',     label: 'EU AI Act',               color: 'text-violet-500 dark:text-violet-400' },
  { key: 'machinery',  label: 'Machinery Regulation',    color: 'text-amber-500 dark:text-amber-400'   },
  { key: 'iec_62443',  label: 'IEC 62443',               color: 'text-teal-500 dark:text-teal-400'     },
  { key: 'nis2',       label: 'NIS2 Directive',          color: 'text-sky-500 dark:text-sky-400'       },
  { key: 'ts_50701',   label: 'TS 50701',                color: 'text-rose-500 dark:text-rose-400'     },
  { key: null,         label: 'General',                 color: 'text-muted-foreground'                },
];

function DocCard({ doc }: { doc: SourceDoc }) {
  return (
    <div className="rounded-xl border border-border bg-card flex flex-col hover:border-primary/50 transition-colors group">
      <div className="p-5 flex-1">
        <div className="flex justify-between items-start mb-4">
          <div className="p-2 bg-muted rounded-lg border border-border">
            <FileText className="w-5 h-5 text-muted-foreground" />
          </div>
          <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider">
            {doc.kind}
          </Badge>
        </div>
        <h3 className="text-base font-display font-bold leading-tight line-clamp-2 mb-3" title={doc.title}>
          {doc.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{doc.description}</p>
        <div className="text-xs font-mono text-muted-foreground/60 truncate" title={doc.filename}>
          {doc.filename}
        </div>
      </div>
      <div className="border-t border-border p-4">
        {/\.(md|txt)$/i.test(doc.filename) ? (
          <Link
            href={`/conformity-platform/sources/view/${encodeURIComponent(doc.filename)}`}
            className="w-full flex items-center justify-center gap-2 text-sm font-medium bg-primary/5 hover:bg-primary/10 text-primary py-2 px-4 rounded-lg transition-colors border border-primary/20 group-hover:border-primary/40"
          >
            <BookOpen className="w-4 h-4" /> Read Document
          </Link>
        ) : (
          <a
            href={doc.url}
            target="_blank"
            rel="noreferrer"
            className="w-full flex items-center justify-center gap-2 text-sm font-medium bg-primary/5 hover:bg-primary/10 text-primary py-2 px-4 rounded-lg transition-colors border border-primary/20 group-hover:border-primary/40"
          >
            {doc.url.endsWith('.pdf') ? (
              <><Download className="w-4 h-4" /> Open PDF</>
            ) : (
              <><ExternalLink className="w-4 h-4" /> Open Source</>
            )}
          </a>
        )}
      </div>
    </div>
  );
}

export default function ConformitySources() {
  const { data: sources, isLoading, isError } = useListSourceDocuments();

  if (isLoading) {
    return (
      <ConformityShell>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-56 w-full rounded-xl" />)}
        </div>
      </ConformityShell>
    );
  }

  if (isError || !sources) {
    return (
      <ConformityShell>
        <div className="text-destructive">Failed to load source documents.</div>
      </ConformityShell>
    );
  }

  const docs = sources as SourceDoc[];

  return (
    <ConformityShell>
      <div className="max-w-6xl space-y-10">
        <PageHeader
          kicker="PRIMARY LEGISLATIVE & TECHNICAL SOURCE LIBRARY"
          title="Source Library"
          icon={FileText}
          description="The underlying research, annexes and primary-source material behind the requirement catalogue, indexed by regulation. Field guides summarise each framework in plain language, while research notes and worked examples document how obligations were extracted and classified. Open any document directly in the browser, or download the PDF originals."
        />

        {GROUPS.map((group) => {
          const groupDocs = docs.filter((d) => d.regulationKey === group.key);
          if (groupDocs.length === 0) return null;
          return (
            <section key={group.label} className="space-y-4">
              <div className="flex items-center gap-3 border-b border-border pb-3">
                <h3 className={`text-sm font-bold uppercase tracking-wider ${group.color}`}>
                  {group.label}
                </h3>
                <span className="text-xs font-mono text-muted-foreground">
                  {groupDocs.length} {groupDocs.length === 1 ? 'document' : 'documents'}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {groupDocs.map((doc) => (
                  <DocCard key={doc.filename} doc={doc} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </ConformityShell>
  );
}
