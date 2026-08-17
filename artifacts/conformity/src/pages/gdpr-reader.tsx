import { Landmark } from "lucide-react";
import { EuActReader } from "@/components/eu-act-reader";
import { gdprRecitalsData, gdprArticlesData, gdprAnnexesData } from "@/data/gdprCorpusData";

/**
 * The GDPR reader (task 17.3) — Regulation (EU) 2016/679 verbatim from the
 * authentic OJ publication with its English corrigendum (R(02), 23.5.2018)
 * applied as documented must-fire corrections; verified character-exact in
 * CI with a negative control.
 */
export default function GdprReaderPage() {
  return (
    <EuActReader
      kicker="REFERENCE · VERBATIM OFFICIAL JOURNAL TEXT (CORRIGENDA APPLIED)"
      actLabel="GDPR"
      title="General Data Protection Regulation"
      subtitle={`${(gdprArticlesData as any).regulation} · ${(gdprArticlesData as any).officialJournalReference} · CELEX ${(gdprArticlesData as any).celex}. ${(gdprArticlesData as any).totalArticles} articles, ${(gdprRecitalsData as any).recitalsCount} recitals — the authentic OJ text with the English corrigendum of 23 May 2018 applied, verified character-exact in CI.`}
      banner={
        <div className="rounded-2xl border border-border/60 bg-muted/20 px-5 py-4 text-sm text-muted-foreground flex gap-3">
          <Landmark className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p>
            <span className="font-medium text-foreground">The GDPR is a regulation</span> —
            directly applicable, one text in every Member State, applying since 25 May 2018.
            This reader shows the verbatim act with its English corrigendum applied and
            nothing else. This application records obligations and evidence; it never
            concludes whether any processing complies.
          </p>
        </div>
      }
      recitalsData={gdprRecitalsData}
      articlesData={gdprArticlesData}
      annexesData={gdprAnnexesData}
      defaultArticle={32}
      bodyTestId="gdpr-reader-body"
    />
  );
}
