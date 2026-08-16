import { Landmark } from "lucide-react";
import { EuActReader } from "@/components/eu-act-reader";
import {
  machineryRecitalsData,
  machineryArticlesData,
  machineryAnnexesData,
} from "@/data/machineryCorpusData";

/**
 * The Machinery Regulation reader (task 10.3) — Regulation (EU) 2023/1230
 * verbatim, from the same reproducible OJ pipeline as every other corpus.
 */
export default function MachineryReaderPage() {
  return (
    <EuActReader
      kicker="REFERENCE · VERBATIM OFFICIAL JOURNAL TEXT"
      actLabel="MR"
      title="Machinery Regulation"
      subtitle={`${machineryArticlesData.regulation} · ${machineryArticlesData.officialJournalReference} · CELEX ${machineryArticlesData.celex}. ${machineryArticlesData.totalArticles} articles, ${machineryRecitalsData.recitalsCount} recitals, ${machineryAnnexesData.annexesCount} annexes — reproduced from the Official Journal source and verified byte-for-byte in CI.`}
      banner={
        <div className="rounded-2xl border border-border/60 bg-muted/20 px-5 py-4 text-sm text-muted-foreground flex gap-3">
          <Landmark className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p>
            <span className="font-medium text-foreground">The Machinery Regulation is a regulation</span> —
            directly applicable, one text in every Member State, replacing the Machinery
            Directive on the dates the text itself sets. This reader shows the verbatim act
            and nothing else; this application never concludes whether any machinery is
            compliant with it.
          </p>
        </div>
      }
      recitalsData={machineryRecitalsData}
      articlesData={machineryArticlesData}
      annexesData={machineryAnnexesData}
      defaultArticle={10}
      bodyTestId="machinery-reader-body"
    />
  );
}
