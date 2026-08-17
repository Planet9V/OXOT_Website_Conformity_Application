import { Landmark } from "lucide-react";
import { EuActReader } from "@/components/eu-act-reader";
import { dataActRecitalsData, dataActArticlesData, dataActAnnexesData } from "@/data/dataActCorpusData";

/**
 * The Data Act reader (task 17.3) — Regulation (EU) 2023/2854 verbatim from
 * the authentic OJ publication with its English corrigendum applied;
 * verified character-exact in CI with a negative control.
 */
export default function DataActReaderPage() {
  return (
    <EuActReader
      kicker="REFERENCE · VERBATIM OFFICIAL JOURNAL TEXT (CORRIGENDA APPLIED)"
      actLabel="Data Act"
      title="Data Act"
      subtitle={`${(dataActArticlesData as any).regulation} · ${(dataActArticlesData as any).officialJournalReference} · CELEX ${(dataActArticlesData as any).celex}. ${(dataActArticlesData as any).totalArticles} articles, ${(dataActRecitalsData as any).recitalsCount} recitals — the authentic OJ text with the English corrigendum applied, verified character-exact in CI.`}
      banner={
        <div className="rounded-2xl border border-border/60 bg-muted/20 px-5 py-4 text-sm text-muted-foreground flex gap-3">
          <Landmark className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p>
            <span className="font-medium text-foreground">The Data Act is a regulation</span> —
            directly applicable, one text in every Member State, applying since 12 September
            2025. Chapter II binds manufacturers of connected products directly (data access
            by design). This reader shows the verbatim act and nothing else; this application
            never concludes whether any product or practice complies.
          </p>
        </div>
      }
      recitalsData={dataActRecitalsData}
      articlesData={dataActArticlesData}
      annexesData={dataActAnnexesData}
      defaultArticle={3}
      bodyTestId="data-act-reader-body"
    />
  );
}
