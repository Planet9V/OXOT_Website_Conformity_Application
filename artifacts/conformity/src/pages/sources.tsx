import { useListSourceDocuments } from "@workspace/api-client-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, ExternalLink } from "lucide-react";

type SourceDoc = {
  title: string;
  filename: string;
  url: string;
  kind: string;
  description: string;
  regulationKey: string | null;
};

// Ordered groups so regulation-indexed sources are surfaced first, general last.
const GROUPS: { key: string | null; label: string }[] = [
  { key: "cra", label: "Cyber Resilience Act" },
  { key: "ai_act", label: "EU AI Act" },
  { key: "machinery", label: "Machinery Regulation" },
  { key: "iec_62443", label: "IEC 62443" },
  { key: "nis2", label: "NIS2 Directive" },
  { key: "ts_50701", label: "TS 50701" },
  { key: null, label: "General" },
];

function DocCard({ doc }: { doc: SourceDoc }) {
  return (
    <Card className="rounded-md flex flex-col hover:border-primary/50 transition-colors">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-start mb-3">
          <div className="p-2 bg-muted rounded-md border border-border">
            <FileText className="w-5 h-5 text-muted-foreground" />
          </div>
          <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider rounded-md">
            {doc.kind}
          </Badge>
        </div>
        <CardTitle className="text-lg font-serif font-normal leading-tight line-clamp-2" title={doc.title}>
          {doc.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-4">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{doc.description}</p>
        <div className="text-xs font-mono text-muted-foreground truncate" title={doc.filename}>
          {doc.filename}
        </div>
      </CardContent>
      <CardFooter className="border-t border-border pt-4">
        <a
          href={doc.url}
          target="_blank"
          rel="noreferrer"
          className="w-full flex items-center justify-center gap-2 text-sm font-medium bg-primary/5 hover:bg-primary/10 text-primary-ink py-2 px-4 rounded-md transition-colors border border-primary/20"
        >
          {doc.url.endsWith(".pdf") ? (
            <><Download className="w-4 h-4" /> Download PDF</>
          ) : (
            <><ExternalLink className="w-4 h-4" /> Open Source</>
          )}
        </a>
      </CardFooter>
    </Card>
  );
}

export default function Sources() {
  const { data: sources, isLoading, isError } = useListSourceDocuments();

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <Skeleton className="h-10 w-48 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-48 w-full" />)}
        </div>
      </div>
    );
  }

  if (isError || !sources) {
    return <div className="p-4 sm:p-6 lg:p-8 text-destructive">Failed to load source documents.</div>;
  }

  const docs = sources as SourceDoc[];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-10">
      <div className="border-b border-border pb-6">
        <span className="oxot-kicker block mb-1">PRIMARY LEGISLATIVE &amp; TECHNICAL SOURCE LIBRARY</span>
        <h1 className="text-3xl sm:text-4xl font-serif font-normal tracking-tight text-foreground">Source Library</h1>
        <p className="text-sm text-muted-foreground mt-1 font-sans">
          Underlying regulatory research, annexes, and supporting material — indexed by regulation for reference.
        </p>
      </div>

      {GROUPS.map((group) => {
        const groupDocs = docs.filter((d) => d.regulationKey === group.key);
        if (groupDocs.length === 0) return null;
        return (
          <section key={group.label} className="space-y-4">
            <div className="flex items-baseline gap-3 border-b border-border pb-2">
              <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                {group.label}
              </h2>
              <span className="text-xs font-mono text-muted-foreground/70">
                {groupDocs.length} {groupDocs.length === 1 ? "document" : "documents"}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groupDocs.map((doc) => (
                <DocCard key={doc.filename} doc={doc} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
