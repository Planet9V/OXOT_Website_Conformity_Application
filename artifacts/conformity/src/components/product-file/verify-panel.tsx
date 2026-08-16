import { useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { ShieldCheck, ShieldAlert, CircleHelp } from "lucide-react";

/**
 * The Verify stage of the product file (7.3) — the importer/distributor
 * rendering. This is the verification shape: a short GATE, not an authoring
 * pipeline. The organisation checks what the MANUFACTURER did (CRA Arts. 19
 * and 20), and a duty-to-refrain hold is a refusal with an article, not a
 * warning.
 *
 * Tri-state throughout: every question is Yes / No / Unanswered, and
 * unanswered is never rendered as verified (L32). The verdict line comes from
 * the server's rule engine (operatorChecks lib), never computed here.
 */

type Tri = boolean | null;

interface CheckRow {
  role: string;
  assessment: {
    verification: { cleared: boolean; openItems?: string[]; message?: string };
    dutyToRefrain: { held: boolean; message?: string };
    maySupply: boolean;
  };
  [field: string]: unknown;
}

const IMPORTER_ITEMS: { field: string; label: string }[] = [
  { field: "conformityAssessmentCarriedOut", label: "The manufacturer carried out the conformity assessment" },
  { field: "technicalDocumentationDrawnUp", label: "Technical documentation is drawn up" },
  { field: "ceMarkingPresent", label: "The product bears the CE marking" },
  { field: "euDeclarationAccompanies", label: "The EU declaration of conformity accompanies the product" },
  { field: "userInformationPresent", label: "User information and instructions are present" },
  { field: "userInformationLanguageUnderstood", label: "User information is in a language easily understood" },
  { field: "manufacturerIdentificationComplied", label: "The manufacturer's identification requirements are complied with" },
  { field: "canProvideProvingDocuments", label: "Documents proving conformity can be provided on request" },
  { field: "ownContactDetailsAffixed", label: "The importer's own contact details are affixed" },
];

const DISTRIBUTOR_ITEMS: { field: string; label: string }[] = [
  { field: "ceMarkingPresent", label: "The product bears the CE marking" },
  { field: "upstreamObligationsComplied", label: "Manufacturer and importer obligations are complied with" },
  { field: "necessaryDocumentsProvided", label: "The necessary documents are provided" },
];

const REFRAIN_ITEMS: { field: string; label: string }[] = [
  { field: "believesNonConforming", label: "Reason to believe the product is not in conformity" },
  { field: "significantCybersecurityRisk", label: "The product presents a significant cybersecurity risk" },
];

function TriControl({
  value,
  onChange,
  disabled,
}: {
  value: Tri;
  onChange: (v: Tri) => void;
  disabled?: boolean;
}) {
  const opts: { v: Tri; label: string }[] = [
    { v: true, label: "Yes" },
    { v: false, label: "No" },
    { v: null, label: "Unanswered" },
  ];
  return (
    <div className="flex items-center gap-1">
      {opts.map((o) => (
        <button
          key={String(o.v)}
          type="button"
          disabled={disabled}
          onClick={() => onChange(o.v)}
          className={cn(
            "px-2 py-0.5 rounded-md text-[11px] font-mono border transition-colors",
            value === o.v
              ? o.v === true
                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-500"
                : o.v === false
                  ? "bg-destructive/15 border-destructive/40 text-destructive"
                  : "bg-muted border-border text-muted-foreground"
              : "border-border/50 text-muted-foreground/60 hover:text-foreground",
            disabled && "opacity-60 cursor-not-allowed",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function VerifyPanel({ productId, role }: { productId: number; role: "importer" | "distributor" }) {
  const qc = useQueryClient();
  const [saving, setSaving] = useState(false);

  const queryKey = [`/api/conformity/operator-checks`, productId];
  const { data, isLoading, isError } = useQuery<{ checks: CheckRow[] }>({
    queryKey,
    queryFn: async () => {
      const res = await fetch(`/api/conformity/operator-checks?productId=${productId}`);
      if (!res.ok) throw new Error(`Could not load operator checks (HTTP ${res.status})`);
      return res.json();
    },
  });

  const check = useMemo(
    () => data?.checks.find((c) => c.role === role) ?? null,
    [data, role],
  );

  const items = role === "importer" ? IMPORTER_ITEMS : DISTRIBUTOR_ITEMS;

  const save = async (field: string, value: Tri) => {
    setSaving(true);
    try {
      const body: Record<string, unknown> = {};
      for (const i of [...items, ...REFRAIN_ITEMS]) body[i.field] = check?.[i.field] ?? null;
      body.informationHeld = check?.informationHeld ?? "";
      body.notes = check?.notes ?? "";
      body[field] = value;
      const res = await fetch(`/api/conformity/products/${productId}/operator-check/${role}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      await qc.invalidateQueries({ queryKey });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not save the check");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return <Skeleton className="h-48 w-full rounded-2xl" />;
  if (isError) {
    return (
      <Card className="rounded-2xl border-destructive/40">
        <CardContent className="p-6 text-sm text-destructive">
          The operator checks could not be loaded. Nothing is assumed verified.
        </CardContent>
      </Card>
    );
  }

  const a = check?.assessment;

  return (
    <Card className="rounded-2xl border border-border shadow-sm" data-testid="verify-panel">
      <CardHeader className="border-b pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              {a?.maySupply ? (
                <ShieldCheck className="h-5 w-5 text-emerald-500" />
              ) : (
                <ShieldAlert className="h-5 w-5 text-amber-500" />
              )}
              Verify — {role === "importer" ? "importer gate (CRA Art. 19)" : "distributor gate (CRA Art. 20)"}
            </CardTitle>
            <CardDescription className="text-xs max-w-2xl">
              This organisation verifies what the manufacturer did; it authors nothing.
              Every answer is recorded as Yes, No or Unanswered — unanswered is never
              treated as verified.
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className={cn(
              "font-mono text-xs",
              a?.maySupply
                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                : "bg-amber-500/10 text-amber-500 border-amber-500/30",
            )}
          >
            {a
              ? a.maySupply
                ? "May be supplied"
                : a.dutyToRefrain.held
                  ? "HOLD — must not be supplied"
                  : "Verification incomplete"
              : "No checks recorded yet"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-5">
        {a?.dutyToRefrain.held && (
          <p className="text-sm text-destructive border border-destructive/30 bg-destructive/5 rounded-xl p-3">
            {a.dutyToRefrain.message}
          </p>
        )}

        <div className="space-y-2">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
            Verification checklist
          </h3>
          <ul className="divide-y divide-border/60">
            {items.map((i) => (
              <li key={i.field} className="py-2 flex items-center justify-between gap-4">
                <span className="text-sm text-foreground/90">{i.label}</span>
                <TriControl
                  value={(check?.[i.field] as Tri) ?? null}
                  onChange={(v) => save(i.field, v)}
                  disabled={saving}
                />
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <CircleHelp className="h-3.5 w-3.5" /> Duty to refrain
          </h3>
          <ul className="divide-y divide-border/60">
            {REFRAIN_ITEMS.map((i) => (
              <li key={i.field} className="py-2 flex items-center justify-between gap-4">
                <span className="text-sm text-foreground/90">{i.label}</span>
                <TriControl
                  value={(check?.[i.field] as Tri) ?? null}
                  onChange={(v) => save(i.field, v)}
                  disabled={saving}
                />
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
