import { Landmark } from "lucide-react";
import { EuActReader } from "@/components/eu-act-reader";
import { aiActRecitalsData, aiActArticlesData, aiActAnnexesData } from "@/data/aiActCorpusData";

/**
 * The AI Act reader (task 10.3) — Regulation (EU) 2024/1689 verbatim, from
 * the same reproducible OJ pipeline as every other corpus.
 */
export default function AiActReaderPage() {
  return (
    <EuActReader
      kicker="REFERENCE · VERBATIM OFFICIAL JOURNAL TEXT"
      actLabel="AI Act"
      title="AI Act"
      subtitle={`${aiActArticlesData.regulation} · ${aiActArticlesData.officialJournalReference} · CELEX ${aiActArticlesData.celex}. ${aiActArticlesData.totalArticles} articles, ${aiActRecitalsData.recitalsCount} recitals, ${aiActAnnexesData.annexesCount} annexes — reproduced from the Official Journal source and verified byte-for-byte in CI.`}
      banner={
        <div className="rounded-2xl border border-border/60 bg-muted/20 px-5 py-4 text-sm text-muted-foreground flex gap-3">
          <Landmark className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p>
            <span className="font-medium text-foreground">The AI Act is a regulation</span> —
            directly applicable, one text in every Member State. Its obligations phase in on
            the dates the text itself sets; this reader shows the verbatim act and nothing
            else. This application never concludes whether any system is compliant with it.
          </p>
        </div>
      }
      recitalsData={aiActRecitalsData}
      articlesData={aiActArticlesData}
      annexesData={aiActAnnexesData}
      defaultArticle={6}
      bodyTestId="ai-act-reader-body"
    />
  );
}
