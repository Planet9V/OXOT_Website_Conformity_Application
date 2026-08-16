import { useMemo, useState } from "react";
import { Link } from "wouter";
import { cbwArticlesData, cbwBijlagenData } from "@/data/cbwCorpusData";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BookOpen, ArrowLeft, Landmark } from "lucide-react";

/**
 * The Cyberbeveiligingswet reader (task 9.4a / W2.4) — the Dutch NIS2
 * transposition, verbatim from the promulgated Staatsblad text
 * (Stb. 2026, 187), through the same reproducible pipeline as the CRA and
 * NIS2 corpora (built by script from the committed authentic source,
 * synced by script, verified byte-for-byte in CI).
 *
 * The text is Dutch and stays Dutch: there is no official English
 * translation, and a translation produced by this application would be
 * reconstruction — the thing the corpus discipline exists to prevent. The
 * banner says so, and says what this law IS: the text that binds entities
 * established in the Netherlands, unlike the directive it transposes.
 */

type Mode = "artikelen" | "bijlagen";

export default function CbwReaderPage() {
  const [mode, setMode] = useState<Mode>("artikelen");
  const [query, setQuery] = useState("");
  const [selectedArticle, setSelectedArticle] = useState<string>("26");
  const [selectedBijlage, setSelectedBijlage] = useState<number>(1);

  const q = query.trim().toLowerCase();

  const allArticles = useMemo(
    () => cbwArticlesData.chapters.flatMap((c: any) => c.articles),
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
  const bijlagen = cbwBijlagenData.bijlagen;

  const article = allArticles.find((a: any) => a.articleNumber === selectedArticle);
  const bijlage = bijlagen.find((b: any) => b.number === selectedBijlage);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link href="/library" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> Library
      </Link>
      <div className="border-b border-border pb-6">
        <span className="oxot-kicker block mb-1">REFERENCE · VERBATIM STAATSBLAD TEXT (NL)</span>
        <h1 className="text-3xl sm:text-4xl font-serif font-normal tracking-tight text-foreground flex items-center gap-2.5">
          <BookOpen className="w-6 h-6 text-primary shrink-0" /> Cyberbeveiligingswet
        </h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
          {cbwArticlesData.staatsbladReference} · in force {cbwArticlesData.entryIntoForce} ·
          register {cbwArticlesData.bwbId}. {cbwArticlesData.totalArticles} artikelen in{" "}
          {cbwArticlesData.chaptersCount} hoofdstukken, {cbwArticlesData.bijlagenCount} bijlagen —
          reproduced from the promulgated Staatsblad source and verified byte-for-byte in CI.
        </p>
      </div>

      {/* The transposition posture, inverted from the directive reader's. */}
      <div className="rounded-2xl border border-border/60 bg-muted/20 px-5 py-4 text-sm text-muted-foreground flex gap-3">
        <Landmark className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <p>
          <span className="font-medium text-foreground">
            This is the Dutch transposition of NIS2 ({cbwArticlesData.transposes}).
          </span>{" "}
          Unlike the directive, this is the text that binds entities established in the
          Netherlands. It is shown in Dutch, verbatim: no official English translation
          exists, and this application will not paraphrase or translate statutory text.
          Articles 99–105 amend other Dutch laws and are marked as such. For the
          directive itself, read the{" "}
          <Link href="/library/nis2" className="text-primary hover:underline">
            NIS2 reader
          </Link>
          .
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1">
          {(["artikelen", "bijlagen"] as Mode[]).map((m) => (
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
          placeholder="Zoek in de verbatim tekst…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
        <nav className="max-h-[70vh] overflow-y-auto rounded-xl border border-border/60 divide-y divide-border/40">
          {mode === "artikelen" &&
            articles.map((a: any) => (
              <button
                key={a.articleNumber}
                onClick={() => setSelectedArticle(a.articleNumber)}
                className={cn(
                  "w-full text-left px-3 py-2 text-xs hover:bg-muted/40",
                  selectedArticle === a.articleNumber && "bg-primary/10 text-primary",
                )}
              >
                <span className="font-mono">Art. {a.articleNumber}</span> {a.title}
              </button>
            ))}
          {mode === "bijlagen" &&
            bijlagen.map((b: any) => (
              <button
                key={b.number}
                onClick={() => setSelectedBijlage(b.number)}
                className={cn(
                  "w-full text-left px-3 py-2 text-xs hover:bg-muted/40",
                  selectedBijlage === b.number && "bg-primary/10 text-primary",
                )}
              >
                <span className="font-mono">{b.label}</span>
              </button>
            ))}
        </nav>

        <article className="max-h-[70vh] overflow-y-auto rounded-xl border border-border/60 p-5 space-y-3" data-testid="cbw-reader-body">
          {mode === "artikelen" && article && (
            <>
              <Badge variant="outline" className="font-mono text-[10px]">
                Cbw Art. {article.articleNumber} · Hoofdstuk {article.chapterNumber}
                {article.sectionTitle ? ` · ${article.sectionTitle}` : ""}
              </Badge>
              {article.amendsOtherLaw && (
                <Badge variant="outline" className="font-mono text-[10px] ml-1 bg-amber-500/10 text-amber-500 border-amber-500/30">
                  wijzigt andere wet
                </Badge>
              )}
              <h2 className="text-xl font-serif text-foreground">{article.title}</h2>
              {article.paragraphs.map((p: any, i: number) => (
                <p key={i} className="text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap">
                  {p.paragraphNumber != null ? `${p.paragraphNumber}. ` : ""}
                  {p.text}
                </p>
              ))}
            </>
          )}
          {mode === "bijlagen" && bijlage && (
            <>
              <Badge variant="outline" className="font-mono text-[10px]">Cbw {bijlage.label}</Badge>
              <p className="text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap font-mono text-xs">
                {bijlage.text}
              </p>
            </>
          )}
        </article>
      </div>
    </div>
  );
}
