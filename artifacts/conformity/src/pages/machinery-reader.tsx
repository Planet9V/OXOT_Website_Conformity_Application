import { Landmark } from "lucide-react";
import { EuActReader } from "@/components/eu-act-reader";
import {
  machineryRecitalsData,
  machineryArticlesData,
  machineryAnnexesData,
} from "@/data/machineryCorpusData";

/**
 * The Machinery Regulation reader (task 10.3; consolidated basis since 15.4)
 * — Regulation (EU) 2023/1230 AS AMENDED, from the EUR-Lex consolidated
 * text. The banner states the amendment basis from the corpus metadata.
 */
export default function MachineryReaderPage() {
  return (
    <EuActReader
      kicker="REFERENCE · VERBATIM CONSOLIDATED TEXT (AS AMENDED)"
      actLabel="MR"
      title="Machinery Regulation"
      subtitle={`${machineryArticlesData.regulation} as amended · consolidated ${(machineryArticlesData as any).consolidationDate} · CELEX ${(machineryArticlesData as any).consolidatedCelex}. ${machineryArticlesData.totalArticles} articles, ${machineryRecitalsData.recitalsCount} recitals, ${machineryAnnexesData.annexesCount} annexes — articles and annexes from the EUR-Lex consolidated text, recitals from the original OJ publication, verified character-exact in CI.`}
      banner={
        <div className="rounded-2xl border border-border/60 bg-muted/20 px-5 py-4 text-sm text-muted-foreground flex gap-3">
          <Landmark className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p>
            <span className="font-medium text-foreground">The Machinery Regulation is a regulation</span> —
            directly applicable, one text in every Member State, replacing the Machinery
            Directive on the dates the text itself sets. This reader shows the act{" "}
            <span className="font-medium text-foreground">as amended</span> (
            {((machineryArticlesData as any).amendmentTrail ?? [])
              .map((t: any) => `${t.act}, in force ${t.applicableFrom}`)
              .join("; ")}
            ), built from the EUR-Lex consolidated text — a documentation tool without legal
            effect of its own; the amending acts are the law. The corrigendum date fixes are
            incorporated. This application never concludes whether any machinery is
            compliant with it.
          </p>
        </div>
      }
      recitalsData={machineryRecitalsData}
      articlesData={machineryArticlesData}
      annexesData={machineryAnnexesData}
      defaultArticle={10}
      bodyTestId="machinery-reader-body"
      citeAs="Regulation (EU) 2023/1230"
    />
  );
}
