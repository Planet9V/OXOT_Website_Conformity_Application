import { Link } from "wouter";
import {
  nis2RecitalsData,
  nis2ArticlesData,
  nis2AnnexesData,
} from "@/data/nis2CorpusData";
import { EuActReader } from "@/components/eu-act-reader";
import { Landmark } from "lucide-react";

/**
 * The NIS2 reader (task 8.4; migrated onto the shared EuActReader in 19.1
 * — this page WAS the shared reader's pre-parameterization twin, so the
 * migration deletes the duplicate and gains the wiki pattern: tabbed
 * counts, cite buttons, deep links, corrigenda callouts from the corpus
 * provenance).
 *
 * The transposition banner states only what the corpus proves: NIS2 is a
 * DIRECTIVE — the duties that actually bind an entity flow through each
 * Member State's implementing law (deadline in the corpus metadata). Two
 * transpositions are loaded verbatim; no other national measure is.
 */
export default function Nis2ReaderPage() {
  return (
    <EuActReader
      kicker="REFERENCE · VERBATIM OFFICIAL JOURNAL TEXT"
      actLabel="NIS2"
      title={`NIS2 — ${nis2ArticlesData.shortTitle}`}
      subtitle={`${nis2ArticlesData.directive} · ${nis2ArticlesData.officialJournalReference} · CELEX ${nis2ArticlesData.celex}. ${nis2ArticlesData.totalArticles} articles, ${nis2RecitalsData.recitalsCount} recitals, ${nis2AnnexesData.annexesCount} annexes — reproduced from the Official Journal source and verified byte-for-byte in CI.`}
      banner={
        <div className="rounded-2xl border border-border/60 bg-muted/20 px-5 py-4 text-sm text-muted-foreground flex gap-3">
          <Landmark className="h-4 w-4 text-primary shrink-0 mt-0.5" />
          <p>
            <span className="font-medium text-foreground">NIS2 is a directive.</span>{" "}
            The duties that bind an entity flow through each Member State's implementing
            law (transposition deadline {nis2ArticlesData.transpositionDeadline}, per the
            corpus metadata). Two transpositions are loaded verbatim: the Dutch{" "}
            <Link href="/library/cbw" className="text-primary hover:underline">
              Cyberbeveiligingswet
            </Link>{" "}
            (Stb. 2026, 187) and the core of the German one, the{" "}
            <Link href="/library/bsig" className="text-primary hover:underline">
              BSI-Gesetz
            </Link>{" "}
            (Artikel 1 NIS2UmsuCG, BGBl. 2025 I Nr. 301). No other Member State's
            measure is. Obligations shown elsewhere cite the Directive's own text, and
            where a national measure diverges, the national measure governs.
          </p>
        </div>
      }
      recitalsData={nis2RecitalsData}
      articlesData={nis2ArticlesData}
      annexesData={nis2AnnexesData}
      defaultArticle={21}
      bodyTestId="nis2-reader-body"
      citeAs="Directive (EU) 2022/2555"
    />
  );
}
