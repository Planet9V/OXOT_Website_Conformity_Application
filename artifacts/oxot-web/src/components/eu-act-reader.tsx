import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "wouter";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BookOpen, ArrowLeft, Copy, Check, Hash, FileText, Layers } from "lucide-react";

/**
 * The public marketing twin of the conformity app's shared verbatim reader
 * (22.2 — the SEO lead magnet): same wiki pattern, same corpus bundles
 * (synced by the same scripts, so the two apps cannot drift), rendered on
 * the public site with the hub back-link. Renders only what the corpus
 * carries; nothing editorial is injected into the statutory text.
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
  citeAs,
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
  /** Formal instrument name for the Cite button, e.g. "Regulation (EU) 2016/679". */
  citeAs?: string;
}) {
  type Mode = "articles" | "recitals" | "annexes";
  const [mode, setMode] = useState<Mode>("articles");
  const [query, setQuery] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<number | string>(defaultArticle);
  const [selectedRecital, setSelectedRecital] = useState<number>(1);
  const [selectedAnnex, setSelectedAnnex] = useState<string>(
    annexesData.annexes[0]?.annexNumber ?? "I",
  );
  const [copied, setCopied] = useState(false);

  // Deep links, same contract as the CRA wiki: ?tab=articles|recitals|annexes
  // &num=<number> &q=<search>. Read once on mount.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    const num = params.get("num");
    const qp = params.get("q");
    if (tab === "articles" || tab === "recitals" || tab === "annexes") setMode(tab);
    if (num) {
      if (tab === "recitals") setSelectedRecital(parseInt(num, 10) || 1);
      else if (tab === "annexes") setSelectedAnnex(num.toUpperCase());
      else setSelectedArticle(num);
    }
    if (qp) setQuery(qp);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
              String(a.articleNumber).toLowerCase() === q ||
              a.title.toLowerCase().includes(q) ||
              a.paragraphs.some((p: any) => (p.text ?? "").toLowerCase().includes(q)),
          )
        : allArticles,
    [allArticles, q],
  );
  const recitals = useMemo(
    () =>
      q
        ? recitalsData.recitals.filter(
            (r: any) =>
              String(r.number) === q ||
              (r.title ?? "").toLowerCase().includes(q) ||
              r.text.toLowerCase().includes(q),
          )
        : recitalsData.recitals,
    [recitalsData, q],
  );
  const allAnnexes = annexesData.annexes;
  const annexes = useMemo(
    () =>
      q
        ? allAnnexes.filter(
            (a: any) =>
              a.annexNumber.toLowerCase() === q || a.title.toLowerCase().includes(q),
          )
        : allAnnexes,
    [allAnnexes, q],
  );

  const article = allArticles.find((a: any) => String(a.articleNumber) === String(selectedArticle));
  const recital = recitalsData.recitals.find((r: any) => r.number === selectedRecital);
  const annex = allAnnexes.find((a: any) => a.annexNumber === selectedAnnex);

  // Corrigenda touching the item on screen, read from the corpus provenance
  // so the callout can never drift from the displayed text. OJ-pipeline acts
  // record them per article/recital; consolidated acts don't (act-level
  // disclosure lives in the banner), so this is simply empty there.
  const articleCorrigenda = useMemo(() => {
    const all = (articlesData as any).corrigenda ?? [];
    return article
      ? all.filter((c: any) => String(c.article) === String(article.articleNumber))
      : [];
  }, [articlesData, article]);
  const recitalCorrigenda = useMemo(() => {
    const all = (articlesData as any).corrigenda ?? [];
    return recital ? all.filter((c: any) => c.recital === recital.number) : [];
  }, [articlesData, recital]);

  const cite = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const CiteButton = ({ text }: { text: string }) =>
    citeAs ? (
      <button
        type="button"
        onClick={() => cite(text)}
        className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground hover:text-primary transition-colors bg-muted/40 px-2 py-1 rounded-md border border-border/60 shrink-0"
        data-testid="cite-button"
      >
        {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
        <span>{copied ? "Copied" : "Cite"}</span>
      </button>
    ) : null;

  const CorrigendaCallout = ({ items }: { items: any[] }) =>
    items.length > 0 ? (
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-[11px] space-y-1">
        {items.map((c: any, i: number) => (
          <p key={i} className="text-foreground/90 leading-relaxed">
            <span className="font-mono font-semibold text-amber-600 dark:text-amber-500">
              As corrected
            </span>{" "}
            by {c.ojRef ?? c.id}
            {c.note ? ` — ${c.note}` : ""}. Cite that corrigendum, not the original
            publication, for this wording.
          </p>
        ))}
      </div>
    ) : null;

  const tabMeta: { m: Mode; icon: any; count: number }[] = [
    { m: "articles", icon: FileText, count: allArticles.length },
    { m: "recitals", icon: BookOpen, count: recitalsData.recitals.length },
    { m: "annexes", icon: Layers, count: allAnnexes.length },
  ];
  const filteredCount =
    mode === "articles" ? articles.length : mode === "recitals" ? recitals.length : annexes.length;
  const totalCount =
    mode === "articles"
      ? allArticles.length
      : mode === "recitals"
        ? recitalsData.recitals.length
        : allAnnexes.length;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link href="/wiki" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> All acts
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
        <div className="flex items-center gap-1 bg-card/80 p-1 rounded-lg border border-border/80">
          {tabMeta.map(({ m, icon: Icon, count }) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all",
                mode === m
                  ? "bg-primary/15 text-primary font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              )}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{m}</span>
              <span
                className={cn(
                  "font-mono text-[10px] px-1.5 py-0.5 rounded-full",
                  mode === m ? "bg-primary/20" : "bg-muted text-muted-foreground",
                )}
              >
                {count}
              </span>
            </button>
          ))}
        </div>
        <Input
          className="h-8 text-xs max-w-xs"
          placeholder={`Search ${mode} by number, title or text…`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <span className="font-mono text-[11px] text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
          {filteredCount} / {totalCount}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
        <nav className="max-h-[70vh] overflow-y-auto rounded-xl border border-border/60 divide-y divide-border/40">
          {mode === "articles" &&
            articles.map((a: any, i: number) => {
              const prev = articles[i - 1];
              const label = a.chapterLabel ?? a.chapterNumber;
              const showChapter =
                label && (!prev || (prev.chapterLabel ?? prev.chapterNumber) !== label);
              return (
                <div key={a.articleNumber}>
                  {showChapter && (
                    <div className="px-3 pt-3 pb-1 text-[10px] font-mono uppercase tracking-wider text-muted-foreground bg-muted/20">
                      Chapter {label}
                      {a.chapterTitle ? ` — ${a.chapterTitle}` : ""}
                    </div>
                  )}
                  <button
                    onClick={() => setSelectedArticle(a.articleNumber)}
                    className={cn(
                      "w-full text-left px-3 py-2 text-xs hover:bg-muted/40",
                      String(selectedArticle) === String(a.articleNumber) && "bg-primary/10 text-primary",
                    )}
                  >
                    <span className="font-mono">Art. {a.articleNumber}</span> — {a.title}
                  </button>
                </div>
              );
            })}
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
              <div className="flex items-center justify-between gap-2">
                <Badge variant="outline" className="font-mono text-[10px]">
                  {actLabel} Art. {article.articleNumber} · Chapter {article.chapterLabel ?? article.chapterNumber}
                </Badge>
                <CiteButton
                  text={`${citeAs}, Article ${article.articleNumber} ("${article.title}")`}
                />
              </div>
              <h2 className="text-xl font-serif text-foreground">{article.title}</h2>
              <CorrigendaCallout items={articleCorrigenda} />
              {article.paragraphs.map((p: any, i: number) => {
                const num = p.paragraphNumber ?? 0;
                const anchorId = `art-${article.articleNumber}-${num > 0 ? num : `p${i}`}`;
                return (
                  <div
                    key={i}
                    id={anchorId}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/20 border border-transparent hover:border-border/60 transition-colors group"
                  >
                    {/* paragraphNumber 0 = unnumbered lead-in text in the OJ; no marker. */}
                    {num > 0 && (
                      <span className="font-mono text-xs font-bold text-primary bg-primary/10 w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 border border-primary/20">
                        {num}
                      </span>
                    )}
                    <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap flex-1">
                      {p.text ?? p}
                    </p>
                    <a
                      href={`#${anchorId}`}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary transition-opacity"
                      title="Anchor link to paragraph"
                    >
                      <Hash className="w-3.5 h-3.5" />
                    </a>
                  </div>
                );
              })}
            </>
          )}
          {mode === "recitals" && recital && (
            <>
              <div className="flex items-center justify-between gap-2">
                <Badge variant="outline" className="font-mono text-[10px]">{actLabel} Recital ({recital.number})</Badge>
                <CiteButton text={`${citeAs}, Recital (${recital.number})`} />
              </div>
              <CorrigendaCallout items={recitalCorrigenda} />
              <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap">{recital.text}</p>
            </>
          )}
          {mode === "annexes" && annex && (
            <>
              <div className="flex items-center justify-between gap-2">
                <Badge variant="outline" className="font-mono text-[10px]">{actLabel} Annex {annex.annexNumber}</Badge>
                <CiteButton text={`${citeAs}, Annex ${annex.annexNumber} ("${annex.title}")`} />
              </div>
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
