import { useEffect, useState } from "react";
import { useParams, Link } from "wouter";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useListSourceDocuments } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Download, FileText } from "lucide-react";

type SourceDoc = {
  title: string;
  filename: string;
  url: string;
  kind: string;
  description: string;
  regulationKey: string | null;
};

/** Extensions the viewer renders; everything else stays a direct download. */
const RENDERABLE = /\.(md|txt)$/i;

/**
 * Styleguide-aligned reader for source-library documents: standard page
 * header (kicker · serif title · description) over a prose column rendered
 * from the raw markdown served at /conformity/sources/<filename>.
 */
export default function SourceViewer() {
  const params = useParams();
  const filename = decodeURIComponent((params.filename as string) ?? "");
  const { data: sources, isLoading: listLoading } = useListSourceDocuments();
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
        // Strip leading YAML front-matter — metadata, not document body.
        if (alive) setText(t.replace(/^---\s*\n[\s\S]*?\n---\s*\n?/, ""));
      })
      .catch(() => {
        if (alive) setFailed(true);
      });
    return () => {
      alive = false;
    };
  }, [filename]);

  const knownMissing = !listLoading && sources && !doc;
  if (!RENDERABLE.test(filename) || knownMissing) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
        <div className="text-destructive border border-destructive/20 rounded-md p-4 bg-destructive/5">
          {knownMissing ? "Document not found in the source library." : "This document type opens directly — use the card's download link."}
        </div>
        <Link href="/sources" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mt-4">
          <ArrowLeft className="w-4 h-4" /> Back to Source Library
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      <Link
        href="/sources"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Source Library
      </Link>

      <header className="mb-10 border-b border-border pb-8">
        <span className="oxot-kicker block mb-2">
          SOURCE LIBRARY{doc ? ` · ${doc.kind.toUpperCase()}` : ""}
        </span>
        <h1 className="text-3xl sm:text-4xl font-serif font-normal tracking-tight text-foreground flex items-center gap-2.5">
          <FileText className="w-6 h-6 text-primary shrink-0" /> {doc?.title ?? filename}
        </h1>
        {doc?.description && (
          <p className="text-sm text-muted-foreground mt-3 max-w-3xl leading-relaxed font-sans">
            {doc.description}
          </p>
        )}
        <div className="flex items-center gap-3 mt-4">
          <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-wider rounded-md">
            {filename}
          </Badge>
          <a
            href={`/conformity/sources/${encodeURIComponent(filename)}`}
            download
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary-ink hover:underline underline-offset-2"
          >
            <Download className="w-3.5 h-3.5" /> Download original
          </a>
        </div>
      </header>

      {failed ? (
        <div className="text-destructive border border-destructive/20 rounded-md p-4 bg-destructive/5 max-w-3xl">
          Failed to load the document.
        </div>
      ) : text === null ? (
        <div className="max-w-3xl space-y-4">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <article className="prose prose-lg dark:prose-invert max-w-3xl prose-headings:font-serif prose-headings:font-normal prose-headings:tracking-tight prose-a:text-primary-ink prose-a:font-medium prose-a:underline prose-a:underline-offset-2 prose-code:font-mono prose-th:text-left prose-img:rounded-xl">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>
        </article>
      )}
    </div>
  );
}
