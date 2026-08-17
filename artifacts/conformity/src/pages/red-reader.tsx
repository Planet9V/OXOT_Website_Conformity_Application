import { Landmark, ScrollText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { EuActReader } from "@/components/eu-act-reader";
import { redRecitalsData, redArticlesData, redAnnexesData } from "@/data/redCorpusData";
import { redDelegatedArticlesData } from "@/data/redDelegatedCorpusData";

/**
 * The Art 3(3)(d)/(e)/(f) designations (task 13.1): Delegated Regulation
 * (EU) 2022/30 verbatim — three short articles, rendered in full below the
 * Directive's reader rather than behind another navigation step. The
 * lifecycle facts (applies from, amended by, repealed by) come from the
 * corpus metadata, quoted verbatim from their committed OJ sources; this
 * component states nothing of its own about the law.
 */
function DelegatedRegulationPanel() {
  const meta = redDelegatedArticlesData;
  const articles = meta.chapters.flatMap((c) => c.articles);
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-10 space-y-4">
      <div className="border-t border-border pt-6">
        <span className="oxot-kicker block mb-1">SUPPLEMENTING ACT · VERBATIM OFFICIAL JOURNAL TEXT</span>
        <h2 className="text-2xl font-serif font-normal tracking-tight text-foreground flex items-center gap-2.5">
          <ScrollText className="w-5 h-5 text-primary shrink-0" /> {meta.regulation}
        </h2>
        <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
          Designates which radio equipment carries the Art 3(3)(d), (e) and (f) cybersecurity
          essential requirements. {meta.officialJournalReference} · CELEX {meta.celex} ·
          as amended by {meta.amendments[0].act}.
        </p>
      </div>

      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 px-5 py-4 text-sm text-muted-foreground flex gap-3">
        <Landmark className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
        <div className="space-y-1.5">
          <p>
            <span className="font-medium text-foreground">Applies from {meta.appliesFrom}</span>{" "}
            (deferred from 1 August 2024 by {meta.amendments[0].act}).
          </p>
          <p>
            <span className="font-medium text-foreground">Repealed with effect from {meta.repeal.withEffectFrom}</span>{" "}
            by {meta.repeal.act}: “{meta.repeal.articleQuote}” The repealing act's stated reason,
            verbatim: “{meta.repeal.reasonQuote}”
          </p>
        </div>
      </div>

      <div className="space-y-5" data-testid="red-delegated-articles">
        {articles.map((a) => (
          <div key={a.articleNumber} className="rounded-xl border border-border/60 p-5 space-y-3">
            <Badge variant="outline" className="font-mono text-[10px]">
              Delegated Regulation (EU) 2022/30 · Art. {a.articleNumber}
            </Badge>
            {a.paragraphs.map((p, i: number) => (
              <p key={i} className="text-sm text-foreground/85 leading-relaxed whitespace-pre-wrap">
                {p.paragraphNumber > 0 ? `${p.paragraphNumber}. ` : ""}
                {p.text}
              </p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * The RED reader (task 10.3) — Directive 2014/53/EU verbatim, from the same
 * reproducible OJ pipeline as every other corpus. RED is a DIRECTIVE: the
 * banner carries the same transposition caveat the NIS2 reader does.
 */
export default function RedReaderPage() {
  return (
    <>
    <EuActReader
      kicker="REFERENCE · VERBATIM OFFICIAL JOURNAL TEXT"
      actLabel="RED"
      title="Radio Equipment Directive"
      subtitle={`${redArticlesData.directive} · ${redArticlesData.officialJournalReference} · CELEX ${redArticlesData.celex}. ${redArticlesData.totalArticles} articles, ${redRecitalsData.recitalsCount} recitals, ${redAnnexesData.annexesCount} annexes — reproduced from the Official Journal source and verified byte-for-byte in CI.`}
      banner={
        <div className="rounded-2xl border border-border/60 bg-muted/20 px-5 py-4 text-sm text-muted-foreground flex gap-3">
          <Landmark className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p>
            <span className="font-medium text-foreground">RED is a directive.</span> The
            duties that bind an economic operator flow through each Member State's
            implementing law — no national transposition of RED is loaded in this
            application, and this reader shows only what the Directive itself says. Where a
            national measure diverges, the national measure governs.
          </p>
        </div>
      }
      recitalsData={redRecitalsData}
      articlesData={redArticlesData}
      annexesData={redAnnexesData}
      defaultArticle={3}
      bodyTestId="red-reader-body"
    />
    <DelegatedRegulationPanel />
    </>
  );
}
