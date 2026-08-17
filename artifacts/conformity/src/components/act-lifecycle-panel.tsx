import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollText } from "lucide-react";

/**
 * "How current is this text" — the act's amendment trail, applied corrigenda
 * and language-only corrigenda notes, rendered on the regulation detail page
 * (19.2). Every fact is read from the act's OWN corpus bundle metadata via a
 * lazy import (the bundle chunk is shared with the act's reader, so nothing
 * statutory is restated here — L57), loaded only when the page for that act
 * is open. Acts without a corpus (reference-only, IEC) render nothing.
 */

type Lifecycle = {
  textBasis?: string;
  consolidationDate?: string;
  amendmentTrail: { act: string; applicableFrom?: string; summary?: string }[];
  corrigenda: { id: string; ojRef?: string }[];
  corrigendaNoted: { id: string; note: string }[];
};

function normalize(meta: any): Lifecycle {
  // Applied corrigenda are stored per-correction; the panel reports each
  // corrigendum instrument once, with how many corrections it carried.
  const applied: Record<string, { id: string; ojRef?: string; count: number }> = {};
  for (const c of meta.corrigenda ?? []) {
    const k = c.id ?? c.ojRef;
    if (!k) continue;
    applied[k] = { id: c.id ?? k, ojRef: c.ojRef, count: (applied[k]?.count ?? 0) + 1 };
  }
  return {
    textBasis: meta.textBasis,
    consolidationDate: meta.consolidationDate,
    amendmentTrail: meta.amendmentTrail ?? [],
    corrigenda: Object.values(applied),
    corrigendaNoted: meta.corrigendaNoted ?? [],
  };
}

/** Which bundle carries each act's metadata, and which export to read. */
const LOADERS: Record<string, () => Promise<any>> = {
  cra: () => import("@/data/craCorpusData").then((m) => m.articlesData),
  nis2: () => import("@/data/nis2CorpusData").then((m) => m.nis2ArticlesData),
  ai_act: () => import("@/data/aiActCorpusData").then((m) => m.aiActArticlesData),
  machinery: () => import("@/data/machineryCorpusData").then((m) => m.machineryArticlesData),
  red: () => import("@/data/redCorpusData").then((m) => m.redArticlesData),
  gdpr: () => import("@/data/gdprCorpusData").then((m) => m.gdprArticlesData),
  data_act: () => import("@/data/dataActCorpusData").then((m) => m.dataActArticlesData),
};

export function ActLifecyclePanel({ regKey }: { regKey: string }) {
  const [lc, setLc] = useState<Lifecycle | null>(null);
  const loader = LOADERS[regKey];

  useEffect(() => {
    let cancelled = false;
    setLc(null);
    if (!loader) return;
    loader().then((meta) => {
      if (!cancelled) setLc(normalize(meta));
    });
    return () => {
      cancelled = true;
    };
  }, [regKey, loader]);

  if (!loader || !lc) return null;
  const hasAnything =
    lc.amendmentTrail.length > 0 || lc.corrigenda.length > 0 || lc.corrigendaNoted.length > 0;

  return (
    <Card className="rounded-md bg-sidebar/50" data-testid="act-lifecycle-panel">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          Text currency <ScrollText className="w-4 h-4 text-muted-foreground" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        {lc.textBasis === "consolidated" && (
          <p className="text-muted-foreground">
            The Library text is built from the EUR-Lex{" "}
            <span className="text-foreground font-medium">
              consolidated version of {lc.consolidationDate}
            </span>{" "}
            — the act as amended, with the amending instruments below. A consolidated
            text is a documentation tool without legal effect of its own; the amending
            acts are the law.
          </p>
        )}

        {lc.amendmentTrail.length > 0 && (
          <div className="space-y-3">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Amended by
            </span>
            {lc.amendmentTrail.map((t, i) => (
              <div key={i} className="border-l-2 border-primary/40 pl-3 space-y-0.5">
                <p className="font-medium text-foreground">{t.act}</p>
                {t.applicableFrom && (
                  <p className="text-xs font-mono text-muted-foreground">
                    applicable from {t.applicableFrom}
                  </p>
                )}
                {t.summary && (
                  <p className="text-xs text-muted-foreground leading-relaxed">{t.summary}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {lc.corrigenda.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Corrigenda applied to the loaded text
            </span>
            {lc.corrigenda.map((c: any) => (
              <p key={c.id} className="text-xs text-muted-foreground">
                <span className="font-mono text-foreground">{c.id}</span>
                {c.ojRef ? ` (${c.ojRef})` : ""} — {c.count} correction
                {c.count === 1 ? "" : "s"} applied.
              </p>
            ))}
          </div>
        )}

        {lc.corrigendaNoted.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Corrigenda recorded, English text unaffected
            </span>
            {lc.corrigendaNoted.map((c) => (
              <p key={c.id} className="text-xs text-muted-foreground">
                <span className="font-mono text-foreground">{c.id}</span> — {c.note}
              </p>
            ))}
          </div>
        )}

        {!hasAnything && (
          <p className="text-muted-foreground text-xs">
            No amendments or English-text corrigenda are recorded for this act's loaded
            text.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
