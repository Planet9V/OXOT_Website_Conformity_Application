import { Landmark } from "lucide-react";
import { EuActReader } from "@/components/eu-act-reader";
import { redRecitalsData, redArticlesData, redAnnexesData } from "@/data/redCorpusData";

/**
 * The RED reader (task 10.3) — Directive 2014/53/EU verbatim, from the same
 * reproducible OJ pipeline as every other corpus. RED is a DIRECTIVE: the
 * banner carries the same transposition caveat the NIS2 reader does.
 */
export default function RedReaderPage() {
  return (
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
  );
}
