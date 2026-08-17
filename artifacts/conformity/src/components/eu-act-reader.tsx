import { useMemo, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BookOpen, ArrowLeft } from "lucide-react";

/**
 * The shared verbatim reader for OJ-act corpora (task 10.3): articles by
 * chapter, recitals, annexes, plain-text search — the exact surface the
 * CRA wiki and NIS2 reader established, parameterized so the AI Act,
 * Machinery Regulation and RED readers are three thin pages instead of
 * three copies. Renders only what the corpus carries; the banner is the
 * per-act honesty framing (a directive's transposition caveat, a
 * regulation's direct applicability).
 */
export function EuActReader({
  kicker,
  actLabel,
  title,
  subtitle,
  banner,
  recitalsData,
  articlesData,
  annexesData,
  defaultArticle,
  bodyTestId,
}: {
  kicker: string;
  actLabel: string;
  title: string;
  subtitle: string;
  banner: ReactNode;
  recitalsData: any;
  articlesData: any;
  annexesData: any;
  defaultArticle: number | string;
  bodyTestId: string;
}) {
  type Mode = "articles" | "recitals" | "annexes";
  const [mode, setMode] = useState<Mode>("articles");
  const [query, setQuery] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<number | string>(defaultArticle);
  const [selectedRecital, setSelectedRecital] = useState<number>(1);
  const [selectedAnnex, setSelectedAnnex] = useState<string>(
    annexesData.annexes[0]?.annexNumber ?? "I",
  );

  const q = query.trim().toLowerCase();

  const allArticles = useMemo(
    () => articlesData.chapters.flatMap((c: any) => c.articles),
    [articlesData],
  );
  const articles = useMemo(
    () =>
      q
        ? allArticles.filter(
            (a: any) =>
              a.title.toLowerCase().includes(q) ||
              a.paragraphs.some((p: any) => (p.text ?? "").toLowerCase().includes(q)),
          )
        : allArticles,
    [allArticles, q],
  );
  const recitals = useMemo(
    () =>
      q
        ? recitalsData.recitals.filter((r: any) => r.text.toLowerCase().includes(q))
        : recitalsData.recitals,
    [recitalsData, q],
  );
  const annexes = annexesData.annexes;

  const article = allArticles.find((a: any) => String(a.articleNumber) === String(selectedArticle));
  const recital = recitalsData.recitals.find((r: any) => r.number === selectedRecital);
  const annex = annexes.find((a: any) => a.annexNumber === selectedAnnex);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link href="/library" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Library
      </Link>
      <div className="border-b border-border pb-6">
        <span className="oxot-kicker block mb-1">{kicker}</span>
        <h1 className="text-3xl sm:text-4xl font-serif font-normal tracking-tight text-foreground flex items-center gap-2.5">
          <BookOpen className="w-6 h-6 text-primary shrink-0" /> {title}
        </h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-3xl">{subtitle}</p>
      </div>

      {banner}

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1">
          {(["articles", "recitals", "annexes"] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "px-3 py-1.5 rounded-md text-xs font-medium capitalize border",
                mode === m ? "bg-primary/15 border-primary/40 text-primary" : "border-border text-muted-foreground",
              )}
            >
              {m}
            </button>
          ))}
        </div>
        <Input
          className="h-8 text-xs max-w-xs"
          placeholder="Search the verbatim text…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
        <nav className="max-h-[70vh] overflow-y-auto rounded-xl border border-border/60 divide-y divide-border/40">
          {mode === "articles" &&
            articles.map((a: any) => (
              <button
                key={a.articleNumber}
                onClick={() => setSelectedArticle(a.articleNumber)}
                className={cn(
                  "w-full text-left px-3 py-2 text-xs hover:bg-muted/40",
                  selectedArticle === a.articleNumber && "bg-primary/10 text-primary",
                )}
              >
                <span className="font-mono">Art. {a.articleNumber}</span> — {a.title}
              </button>
            ))}
          {mode === "recitals" &&
            recitals.map((r: any) => (
              <button
                key={r.number}
                onClick={() => setSelectedRecital(r.number)}
                className={cn(
                  "w-full text-left px-3 py-2 text-xs hover:bg-muted/40",
                  selectedRecital === r.number && "bg-primary/10 text-primary",
                )}
              >
                <span className="font-mono">({r.number})</span> {r.title || r.text.slice(0, 60)}
              </button>
            ))}
          {mode === "annexes" &&
            annexes.map((a: any) => (
              <button
                key={a.annexNumber}
                onClick={() => setSelectedAnnex(a.annexNumber)}
                className={cn(
                  "w-full text-left px-3 py-2 text-xs hover:bg-muted/40",
                  selectedAnnex === a.annexNumber && "bg-primary/10 text-primary",
                )}
              >
                <span className="font-mono">Annex {a.annexNumber}</span> — {a.title}
              </button>
            ))}
        </nav>

        <article className="max-h-[70vh] overflow-y-auto rounded-xl border border-border/60 p-5 space-y-3" data-testid={bodyTestId}>
          {mode === "articles" && article && (
            <>
              <Badge variant="outline" className="font-mono text-[10px]">
                {actLabel} Art. {article.articleNumber} · Chapter {article.chapterLabel ?? article.chapterNumber}
              </Badge>
              <h2 className="text-xl font-serif text-foreground">{article.title}</h2>
              {article.paragraphs.map((p: any, i: number) => (
                <p key={i} className="text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap">
                  {p.text ?? p}
                </p>
              ))}
            </>
          )}
          {mode === "recitals" && recital && (
            <>
              <Badge variant="outline" className="font-mono text-[10px]">{actLabel} Recital ({recital.number})</Badge>
              <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap">{recital.text}</p>
            </>
          )}
          {mode === "annexes" && annex && (
            <>
              <Badge variant="outline" className="font-mono text-[10px]">{actLabel} Annex {annex.annexNumber}</Badge>
              <h2 className="text-xl font-serif text-foreground">{annex.title}</h2>
              {annex.blocks.map((b: any, i: number) => (
                <p key={i} className="text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap">
                  {typeof b === "string" ? b : (b.text ?? "")}
                </p>
              ))}
            </>
          )}
        </article>
      </div>
    </div>
  );
}
