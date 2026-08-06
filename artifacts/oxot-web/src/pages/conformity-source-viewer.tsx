import { useEffect, useState } from 'react';
import { useParams, Link } from 'wouter';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ConformityShell } from '@/components/layout/conformity-shell';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import { useListSourceDocuments } from '@workspace/api-client-react';

type SourceDoc = {
  title: string;
  filename: string;
  url: string;
  kind: string;
  description: string;
  regulationKey: string | null;
};

const RENDERABLE = /\.(md|txt)$/i;

export default function ConformitySourceViewer() {
  const params = useParams();
  const filename = decodeURIComponent((params.filename as string) ?? '');
  const { data: sources } = useListSourceDocuments();
  const doc = (sources as SourceDoc[] | undefined)?.find((d) => d.filename === filename);

  const [text, setText] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!filename || !RENDERABLE.test(filename)) return;
    let alive = true;
    setText(null);
    setFailed(false);
    fetch(`/conformity/sources/${encodeURIComponent(filename)}`)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.text();
      })
      .then((t) => {
        if (alive) setText(t.replace(/^---\s*\n[\s\S]*?\n---\s*\n?/, ''));
      })
      .catch(() => {
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, [filename]);

  return (
    <ConformityShell>
      <div className="max-w-4xl">
        <Link
          href="/conformity-platform/sources"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Source Library
        </Link>

        <div className="border-b border-border pb-6 mb-8">
          <span className="oxot-kicker block mb-2">
            SOURCE LIBRARY{doc ? ` · ${doc.kind.toUpperCase()}` : ''}
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-normal tracking-tight text-foreground flex items-center gap-2.5">
            <FileText className="w-7 h-7 text-primary shrink-0" /> {doc?.title ?? filename}
          </h1>
          {doc?.description && (
            <p className="mt-3 max-w-3xl text-muted-foreground">{doc.description}</p>
          )}
          <div className="flex items-center gap-3 mt-4">
            <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider">
              {filename}
            </Badge>
            <a
              href={`/conformity/sources/${encodeURIComponent(filename)}`}
              download
              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              <Download className="w-3.5 h-3.5" /> Download original
            </a>
          </div>
        </div>

        {!RENDERABLE.test(filename) ? (
          <p className="text-muted-foreground">This document type opens directly — use its download link.</p>
        ) : failed ? (
          <div className="text-destructive border border-destructive/20 rounded-lg p-4 bg-destructive/5">
            Failed to load the document.
          </div>
        ) : text === null ? (
          <div className="space-y-4">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-64 w-full" />
          </div>
        ) : (
          <article className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-display prose-headings:font-normal prose-headings:tracking-tight prose-a:text-primary prose-a:font-medium prose-a:underline prose-a:underline-offset-2 prose-code:font-mono prose-th:text-left prose-img:rounded-xl">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
          </article>
        )}
      </div>
    </ConformityShell>
  );
}
