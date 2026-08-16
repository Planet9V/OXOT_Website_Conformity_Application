import { useMemo, useState } from "react";
import { Link } from "wouter";
import {
  nis2RecitalsData,
  nis2ArticlesData,
  nis2AnnexesData,
} from "@/data/nis2CorpusData";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BookOpen, ArrowLeft, Landmark } from "lucide-react";

/**
 * The NIS2 reader (task 8.4) — Directive (EU) 2022/2555 verbatim, from the
 * same reproducible pipeline as the CRA corpus (built from EUR-Lex, synced
 * by script, verified byte-for-byte in CI). Read linearly: articles by
 * chapter, recitals, annexes, with plain-text search.
 *
 * The transposition banner states only what the corpus proves: NIS2 is a
 * DIRECTIVE — the duties that actually bind an entity flow through each
 * Member State's implementing law (deadline in the corpus metadata). No
 * national measure is loaded in this application yet, and the banner says
 * so rather than paraphrasing national law from memory.
 */

type Mode = "articles" | "recitals" | "annexes";

export default function Nis2ReaderPage() {
  const [mode, setMode] = useState<Mode>("articles");
  const [query, setQuery] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<number>(21);
  const [selectedRecital, setSelectedRecital] = useState<number>(1);
  const [selectedAnnex, setSelectedAnnex] = useState<string>("I");

  const q = query.trim().toLowerCase();

  const allArticles = useMemo(
    () => nis2ArticlesData.chapters.flatMap((c: any) => c.articles),
    [],
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
        ? nis2RecitalsData.recitals.filter((r: any) => r.text.toLowerCase().includes(q))
        : nis2RecitalsData.recitals,
    [q],
  );
  const annexes = nis2AnnexesData.annexes;

  const article = allArticles.find((a: any) => a.articleNumber === selectedArticle);
  const recital = nis2RecitalsData.recitals.find((r: any) => r.number === selectedRecital);
  const annex = annexes.find((a: any) => a.annexNumber === selectedAnnex);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link href="/library" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Library
      </Link>
      <div className="border-b border-border pb-6">
        <span className="oxot-kicker block mb-1">REFERENCE · VERBATIM OFFICIAL JOURNAL TEXT</span>
        <h1 className="text-3xl sm:text-4xl font-serif font-normal tracking-tight text-foreground flex items-center gap-2.5">
          <BookOpen className="w-6 h-6 text-primary shrink-0" /> NIS2 — {nis2ArticlesData.shortTitle}
        </h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
          {nis2ArticlesData.directive} · {nis2ArticlesData.officialJournalReference} ·
          CELEX {nis2ArticlesData.celex}. {nis2ArticlesData.totalArticles} articles,{" "}
          {nis2RecitalsData.recitalsCount} recitals, {nis2AnnexesData.annexesCount} annexes —
          reproduced from the Official Journal source and verified byte-for-byte in CI.
        </p>
      </div>

      {/* The directive/transposition posture — corpus facts only. */}
      <div className="rounded-2xl border border-border/60 bg-muted/20 px-5 py-4 text-sm text-muted-foreground flex gap-3">
        <Landmark className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <p>
          <span className="font-medium text-foreground">NIS2 is a directive.</span>{" "}
          The duties that bind an entity flow through each Member State's implementing
          law (transposition deadline {nis2ArticlesData.transpositionDeadline}, per the
          corpus metadata). The Dutch transposition — the{" "}
          <Link href="/library/cbw" className="text-primary hover:underline">
            Cyberbeveiligingswet
          </Link>{" "}
          (Stb. 2026, 187, in force 15 August 2026) — is loaded verbatim; no other
          Member State's measure is. Obligations shown elsewhere cite the Directive's
          own text, and where a national measure diverges, the national measure
          governs.
        </p>
      </div>

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

        <article className="max-h-[70vh] overflow-y-auto rounded-xl border border-border/60 p-5 space-y-3" data-testid="nis2-reader-body">
          {mode === "articles" && article && (
            <>
              <Badge variant="outline" className="font-mono text-[10px]">
                NIS2 Art. {article.articleNumber} · Chapter {article.chapterNumber}
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
              <Badge variant="outline" className="font-mono text-[10px]">NIS2 Recital ({recital.number})</Badge>
              <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap">{recital.text}</p>
            </>
          )}
          {mode === "annexes" && annex && (
            <>
              <Badge variant="outline" className="font-mono text-[10px]">NIS2 Annex {annex.annexNumber}</Badge>
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
