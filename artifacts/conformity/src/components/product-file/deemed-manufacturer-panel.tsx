import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Scale } from "lucide-react";
import { Cite } from "@/components/statutory-flyout";

/**
 * The deemed-manufacturer determination (CRA Arts. 21/22) in the product file
 * — re-homed from partner-hub stage 2 (task 7.3c), running on the Phase 2
 * engine, which persists every determination with its facts and a record
 * hash, and OPENS the manufacturer obligation set when the answer is yes.
 *
 * Tri-state throughout: every fact is Yes / No / Unanswered, and the engine
 * reports what is unanswered rather than deciding around it. The verdict is
 * the ENGINE's; this panel renders it.
 */

type Tri = boolean | null;

const FACTS: { field: string; label: string }[] = [
  { field: "placedUnderOwnNameOrTrademark", label: "The product is placed on the market under this organisation's own name or trademark" },
  { field: "modificationMade", label: "A change was made to the product" },
  { field: "changeFollowsPlacingOnMarket", label: "The change came AFTER the product was placed on the market" },
  { field: "affectsAnnexIPartICompliance", label: "The change affects compliance with the essential requirements (Annex I Part I)" },
  { field: "modifiesAssessedIntendedPurpose", label: "The change modifies the intended purpose that was assessed" },
  { field: "cybersecurityImpactIsProductWide", label: "The modification affects the cybersecurity of the product as a whole" },
  { field: "makesAvailableOnMarket", label: "The modified product is made available on the market" },
];

function TriRow({ label, value, onChange }: { label: string; value: Tri; onChange: (v: Tri) => void }) {
  const opts: { v: Tri; label: string }[] = [
    { v: true, label: "Yes" },
    { v: false, label: "No" },
    { v: null, label: "Unanswered" },
  ];
  return (
    <li className="py-2 flex items-center justify-between gap-4">
      <span className="text-sm text-foreground/90">{label}</span>
      <div className="flex items-center gap-1 shrink-0">
        {opts.map((o) => (
          <button
            key={String(o.v)}
            type="button"
            onClick={() => onChange(o.v)}
            className={cn(
              "px-2 py-0.5 rounded-md text-[11px] font-mono border",
              value === o.v
                ? o.v === true
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-500"
                  : o.v === false
                    ? "bg-muted border-border text-foreground"
                    : "bg-muted border-border text-muted-foreground"
                : "border-border/50 text-muted-foreground/60 hover:text-foreground",
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </li>
  );
}

export function DeemedManufacturerPanel({
  productId,
  actorRole,
}: {
  productId: number;
  actorRole: "importer" | "distributor" | "other_person";
}) {
  const qc = useQueryClient();
  const [facts, setFacts] = useState<Record<string, Tri>>(
    Object.fromEntries(FACTS.map((f) => [f.field, null])),
  );
  const [running, setRunning] = useState(false);

  const historyKey = ["/api/conformity/deemed-manufacturer/assessments", productId];
  const history = useQuery<{ total: number; assessments: any[] }>({
    queryKey: historyKey,
    queryFn: async () => {
      const res = await fetch(`/api/conformity/deemed-manufacturer/assessments?productId=${productId}`);
      if (!res.ok) throw new Error(`Could not load determinations (HTTP ${res.status})`);
      return res.json();
    },
  });

  const run = async () => {
    setRunning(true);
    try {
      const res = await fetch("/api/conformity/deemed-manufacturer/assess", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, actorRole, ...facts }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
      toast.success(
        body.determination?.deemedManufacturer
          ? "Determination recorded: deemed manufacturer — the manufacturer obligation set now applies"
          : "Determination recorded",
      );
      await qc.invalidateQueries({ queryKey: historyKey });
      await qc.invalidateQueries();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not run the determination");
    } finally {
      setRunning(false);
    }
  };

  const latest = history.data?.assessments?.[0];

  return (
    <Card className="rounded-2xl border border-border shadow-sm" data-testid="deemed-manufacturer-panel">
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Scale className="h-5 w-5 text-primary" /> Deemed manufacturer — <Cite article={21} /> / <Cite article={22} />
        </CardTitle>
        <CardDescription className="text-xs max-w-2xl">
          Whether this organisation's handling of the product makes it the manufacturer in
          law. Every determination is persisted with its facts and a record hash; a
          positive determination opens the manufacturer obligation set on this product.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {latest && (
          <div
            className={cn(
              "rounded-xl border p-3 text-xs leading-relaxed",
              latest.deemedManufacturer
                ? "border-amber-500/40 bg-amber-500/5 text-amber-600 dark:text-amber-500"
                : "border-border/60 bg-muted/20 text-muted-foreground",
            )}
          >
            <span className="font-mono text-[10px] uppercase mr-2">
              Latest determination · {String(latest.assessedAt).slice(0, 10)}
            </span>
            {latest.message}
            {(latest.unanswered ?? []).length > 0 && (
              <span className="block mt-1">
                Unanswered: {(latest.unanswered as string[]).join("; ")}
              </span>
            )}
          </div>
        )}

        <ul className="divide-y divide-border/60">
          {FACTS.map((f) => (
            <TriRow
              key={f.field}
              label={f.label}
              value={facts[f.field] ?? null}
              onChange={(v) => setFacts({ ...facts, [f.field]: v })}
            />
          ))}
        </ul>

        <div className="flex items-center justify-between gap-3">
          <p className="text-[11px] text-muted-foreground">
            The engine answers from these facts and reports what is unanswered — it never
            decides around a blank.
          </p>
          <Button size="sm" className="text-xs shrink-0" onClick={run} disabled={running} data-testid="run-determination">
            Run determination
          </Button>
        </div>

        {history.isLoading ? (
          <Skeleton className="h-10 w-full rounded-xl" />
        ) : (history.data?.total ?? 0) > 1 ? (
          <p className="text-[11px] font-mono text-muted-foreground">
            {history.data!.total} determinations on record — an audit trail, not a cache.
          </p>
        ) : null}
      </CardContent>
    </Card>
  );
}
