import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Link } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { RadioTower } from "lucide-react";
import { useUpdateConformityProduct } from "@workspace/api-client-react";
import { redDelegatedArticlesData } from "@/data/redDelegatedCorpusData";

/**
 * The RED→CRA cybersecurity handover, per product (task 18.2).
 *
 * The 2027-12-11 handover already lives in the RED seed's key dates and the
 * Library reader, but neither answers the question a manufacturer actually
 * has: does MY product's cyber baseline move? That turns on one scoping fact
 * — is the product radio equipment in a category designated by Delegated
 * Regulation (EU) 2022/30 — so the fact is recorded tri-state on the product
 * (null until answered, D5/L40 discipline) and the guidance renders from it.
 *
 * Every statutory date and quote below is read from the 2022/30 corpus
 * metadata at render time — nothing restated by hand (L57: honesty lives in
 * one place, the corpus).
 */

type Tri = boolean | null;

const meta = redDelegatedArticlesData as unknown as {
  appliesFrom: string;
  amendments: { act: string }[];
  repeal: { act: string; withEffectFrom: string; articleQuote: string; reasonQuote: string };
};

export function RedHandoverPanel({
  product,
}: {
  product: { id: number; name: string; redInScope?: boolean | null };
}) {
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);
  const answer: Tri = product.redInScope ?? null;

  const update = useUpdateConformityProduct({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries();
        toast.success("Answer recorded on the product file");
      },
      onError: (e: unknown) =>
        toast.error(e instanceof Error ? e.message : "Could not record the answer"),
      onSettled: () => setSaving(false),
    },
  });

  const setAnswer = (v: Tri) => {
    if (v === answer || saving) return;
    setSaving(true);
    update.mutate({ id: product.id, data: { name: product.name, redInScope: v } as any });
  };

  const opts: { v: Tri; label: string }[] = [
    { v: true, label: "Yes" },
    { v: false, label: "No" },
    { v: null, label: "Unanswered" },
  ];

  return (
    <Card className="rounded-2xl border border-border shadow-sm" data-testid="red-handover-panel">
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <RadioTower className="h-5 w-5 text-primary" /> RED→CRA cybersecurity handover
        </CardTitle>
        <CardDescription className="text-xs max-w-2xl">
          Is this product radio equipment in a category designated by Delegated Regulation
          (EU) 2022/30 — internet-connected radio equipment, equipment designed for
          children or worn on the body, or equipment processing personal, traffic or
          location data? The answer decides whether the RED Art 3(3)(d)/(e)/(f)
          cybersecurity requirements attach to this product until the CRA takes over.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm text-foreground/90">
            In a 2022/30-designated category
          </span>
          <div className="flex items-center gap-1 shrink-0">
            {opts.map((o) => (
              <button
                key={String(o.v)}
                type="button"
                disabled={saving}
                onClick={() => setAnswer(o.v)}
                data-testid={`red-scope-${String(o.v)}`}
                className={cn(
                  "px-2 py-0.5 rounded-md text-[11px] font-mono border",
                  answer === o.v
                    ? o.v === true
                      ? "bg-amber-500/15 border-amber-500/40 text-amber-500"
                      : "bg-muted border-border text-foreground"
                    : "border-border/50 text-muted-foreground/60 hover:text-foreground",
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {answer === null && (
          <p className="text-sm text-muted-foreground border border-border/60 bg-muted/20 rounded-xl px-4 py-3">
            Nobody has answered this for the product yet. The file records the answer and
            shows the handover timeline from it — it does not guess.
          </p>
        )}

        {answer === false && (
          <p className="text-sm text-muted-foreground border border-border/60 bg-muted/20 rounded-xl px-4 py-3">
            Recorded answer: not in a category designated by Delegated Regulation (EU)
            2022/30, so the RED Art 3(3)(d)/(e)/(f) cybersecurity requirements do not
            attach through that act. This records the organisation's own scoping answer —
            it is not a legal determination by this application.
          </p>
        )}

        {answer === true && (
          <div
            className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-muted-foreground space-y-2"
            data-testid="red-handover-timeline"
          >
            <p>
              <span className="font-medium text-foreground">
                Since {meta.appliesFrom}
              </span>{" "}
              — the RED Art 3(3)(d)/(e)/(f) cybersecurity essential requirements apply to
              this product's designated category (application date deferred to this date
              by {meta.amendments[0].act}).
            </p>
            <p>
              <span className="font-medium text-foreground">
                Until {meta.repeal.withEffectFrom}
              </span>{" "}
              — those RED requirements continue to govern the product's cyber baseline.
            </p>
            <p>
              <span className="font-medium text-foreground">
                From {meta.repeal.withEffectFrom}
              </span>{" "}
              — {meta.repeal.act} repeals the designation: “{meta.repeal.articleQuote}”
              Its stated reason, verbatim: “{meta.repeal.reasonQuote}” From that date the
              CRA's essential requirements — the ones this product file assesses — govern.
            </p>
            <p className="text-[11px] font-mono text-muted-foreground/80 pt-1">
              Dates and quotes read from the 2022/30 corpus metadata ·{" "}
              <Link href="/library/red" className="underline hover:text-foreground">
                read the delegated regulation verbatim
              </Link>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
