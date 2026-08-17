import { Landmark } from "lucide-react";
import { EuActReader } from "@/components/eu-act-reader";
import { aiActRecitalsData, aiActArticlesData, aiActAnnexesData } from "@/data/aiActCorpusData";

/**
 * The AI Act reader (task 10.3; consolidated basis since 15.3) — Regulation
 * (EU) 2024/1689 AS AMENDED, from the EUR-Lex consolidated text. The banner
 * states the amendment basis from the corpus metadata; the component asserts
 * nothing of its own about the law.
 */
export default function AiActReaderPage() {
  return (
    <EuActReader
      kicker="REFERENCE · VERBATIM CONSOLIDATED TEXT (AS AMENDED)"
      actLabel="AI Act"
      title="AI Act"
      subtitle={`${aiActArticlesData.regulation} as amended · consolidated ${(aiActArticlesData as any).consolidationDate} · CELEX ${(aiActArticlesData as any).consolidatedCelex}. ${aiActArticlesData.totalArticles} articles, ${aiActRecitalsData.recitalsCount} recitals, ${aiActAnnexesData.annexesCount} annexes — articles and annexes from the EUR-Lex consolidated text, recitals from the original OJ publication, verified character-exact in CI.`}
      banner={
        <div className="rounded-2xl border border-border/60 bg-muted/20 px-5 py-4 text-sm text-muted-foreground flex gap-3">
          <Landmark className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p>
            <span className="font-medium text-foreground">The AI Act is a regulation</span> —
            directly applicable, one text in every Member State. This reader shows the act{" "}
            <span className="font-medium text-foreground">as amended by {(aiActArticlesData as any).amendmentTrail?.[0]?.act}</span>{" "}
            (in force {(aiActArticlesData as any).amendmentTrail?.[0]?.applicableFrom}), built from
            the EUR-Lex consolidated text — which is a documentation tool without legal effect of
            its own; the amending acts are the law. This application never renders a verdict on
            any system under it.
          </p>
        </div>
      }
      recitalsData={aiActRecitalsData}
      articlesData={aiActArticlesData}
      annexesData={aiActAnnexesData}
      defaultArticle={6}
      bodyTestId="ai-act-reader-body"
      citeAs="Regulation (EU) 2024/1689"
    />
  );
}
