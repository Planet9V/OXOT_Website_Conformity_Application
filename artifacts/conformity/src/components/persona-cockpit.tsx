import { useMemo, useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, ArrowRight, AlertTriangle, Gavel } from "lucide-react";

/**
 * The cockpit, derived entirely from what the organisation has declared.
 *
 * This file previously held PERSONA_CONFIGS: 333 lines of string literals —
 * honesty-ok: quotes the fabricated strings this file removed; it does not make them.
 * "100% Protected", "€285,000,000", "Zero Manufacturer Liability", "VERIFIED" —
 * none of it computed from anything, and several of it citing articles that do
 * not say what it claimed. Every number below now comes from
 * /api/conformity/org/obligations, and where there is no data the cockpit says
 * so rather than showing a confident figure.
 *
 * It reports what is tracked and what is missing. It does not say whether the
 * organisation is compliant; that assessment belongs to the manufacturer under
 * Article 32 or to a notified body.
 */

export interface Obligation {
  regulationKey: string;
  refCode: string;
  title: string;
  obligationType: string;
  appliesTo: string[];
  roleTerms: string[];
  status: string;
  evaluationCount: number;
  owners: string[];
  /** Internal routing default (6.3) — which team role's inbox this lands in. */
  defaultTeamRole: string;
  nextDueDate: string | null;
}

interface ObligationsResponse {
  declaredRoles: string[];
  declaredRegulations: string[];
  /** Declared acts with no seeded requirement content — named, never silent (11.4). */
  regulationsWithoutSeededContent?: string[];
  total: number;
  obligations: Obligation[];
  incomplete?: string;
}

interface RoleRow {
  key: string;
  label: string;
  craArticle: number | null;
  isDeclared: boolean;
}

const STATUS_ORDER = ["met", "in_progress", "partial", "not_met", "not_applicable", "not_started"];

const STATUS_LABEL: Record<string, string> = {
  met: "Evidenced",
  in_progress: "In progress",
  partial: "Partial",
  not_met: "Not met",
  not_applicable: "Not applicable",
  not_started: "Not started",
};

const STATUS_TONE: Record<string, string> = {
  met: "text-emerald-600 dark:text-emerald-400",
  in_progress: "text-blue-600 dark:text-blue-400",
  partial: "text-amber-600 dark:text-amber-400",
  not_met: "text-destructive",
  not_applicable: "text-muted-foreground",
  not_started: "text-muted-foreground",
};

export function PersonaCockpit() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const profile = useQuery<{ roles: RoleRow[] }>({
    queryKey: ["/api/conformity/org/profile"],
    queryFn: async () => {
      const res = await fetch("/api/conformity/org/profile");
      if (!res.ok) throw new Error(`Could not load the organisation profile (HTTP ${res.status})`);
      return res.json();
    },
  });

  const obligations = useQuery<ObligationsResponse>({
    queryKey: ["/api/conformity/org/obligations"],
    queryFn: async () => {
      const res = await fetch("/api/conformity/org/obligations");
      if (!res.ok) throw new Error(`Could not load obligations (HTTP ${res.status})`);
      return res.json();
    },
  });

  const declaredRoles = useMemo(
    () => (profile.data?.roles ?? []).filter((r) => r.isDeclared),
    [profile.data],
  );

  const activeRole = selectedRole ?? declaredRoles[0]?.key ?? null;

  const forRole = useMemo(() => {
    const all = obligations.data?.obligations ?? [];
    if (!activeRole) return [];
    return all.filter((o) => o.appliesTo.includes(activeRole));
  }, [obligations.data, activeRole]);

  const byStatus = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const o of forRole) counts[o.status] = (counts[o.status] ?? 0) + 1;
    return counts;
  }, [forRole]);

  const byRegulation = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const o of forRole) counts[o.regulationKey] = (counts[o.regulationKey] ?? 0) + 1;
    return Object.entries(counts).sort((a, b) => b[1] - a[1]);
  }, [forRole]);

  if (profile.isError || obligations.isError) {
    const err = (profile.error ?? obligations.error) as Error;
    return (
      <div className="rounded-2xl border border-destructive/40 bg-card p-6 space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          Could not load the cockpit
        </div>
        <p className="text-xs text-muted-foreground">{err?.message}</p>
      </div>
    );
  }

  if (profile.isLoading || obligations.isLoading) {
    return <Skeleton className="h-56 w-full rounded-2xl" />;
  }

  // Nothing declared: say so and point at the fix, rather than rendering zeros
  // as though they were a clean bill of health.
  if (!declaredRoles.length || !obligations.data?.declaredRegulations.length) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 text-center space-y-3">
        <Building2 className="h-8 w-8 text-muted-foreground mx-auto" />
        <h2 className="font-serif text-xl text-foreground">Tell us what this organisation is</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Nothing is in scope yet. The cockpit shows the obligations that follow from what this
          organisation does and which acts it is subject to.
        </p>
        <Link
          href="/org-profile"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          Set the organisation profile <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Declared roles only. An undeclared role is not a tab. */}
      <div className="flex flex-wrap items-center gap-2">
        {declaredRoles.map((role) => {
          const isActive = role.key === activeRole;
          const count = (obligations.data?.obligations ?? []).filter((o) =>
            o.appliesTo.includes(role.key),
          ).length;
          return (
            <button
              key={role.key}
              data-persona={role.key}
              onClick={() => setSelectedRole(role.key)}
              className={`rounded-xl border px-3.5 py-2 text-left transition-colors ${
                isActive
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border bg-muted/30 text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="text-sm font-medium">{role.label}</div>
              <div className="font-mono text-[11px] tabular-nums opacity-80">
                {count} obligation{count === 1 ? "" : "s"}
                {role.craArticle ? ` · CRA Art. ${role.craArticle}` : ""}
              </div>
            </button>
          );
        })}
        <Link
          href="/org-profile"
          className="ml-auto text-xs text-muted-foreground hover:text-primary hover:underline"
        >
          Change declarations
        </Link>
      </div>

      {/* Status breakdown — counts, not verdicts. */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-serif text-lg text-foreground">
            {declaredRoles.find((r) => r.key === activeRole)?.label ?? "Obligations"}
          </h2>
          <span className="text-xs text-muted-foreground">
            {forRole.length} obligation{forRole.length === 1 ? "" : "s"} tracked
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {STATUS_ORDER.map((s) => (
            <div key={s} className="rounded-xl bg-muted/40 p-3">
              <div className={`font-serif text-2xl tabular-nums ${STATUS_TONE[s]}`}>
                {byStatus[s] ?? 0}
              </div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{STATUS_LABEL[s]}</div>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-muted-foreground border-t border-border pt-3">
          Counts of what is tracked and evidenced — not a statement that this organisation is
          compliant. Conformity is assessed under Article 32 by the manufacturer, or by a notified
          body.
        </p>
      </div>

      {/* Which acts these obligations come from. */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <h3 className="text-sm font-medium text-foreground flex items-center gap-1.5">
          <Gavel className="h-3.5 w-3.5 text-primary" />
          Where these obligations come from
        </h3>
        <div className="flex flex-wrap gap-2">
          {byRegulation.map(([reg, n]) => (
            <Badge key={reg} variant="outline" className="font-mono text-[11px]">
              {reg} · {n}
            </Badge>
          ))}
        </div>
        {/* The regulator's own word for this role, so the language matches the act. */}
        {forRole.length > 0 && (
          <p className="text-[11px] text-muted-foreground">
            Referred to as {[...new Set(forRole.flatMap((o) => o.roleTerms))].join(", ")} in these
            acts.
          </p>
        )}
        {/* A declared act with no seeded content is named, never silently absent (11.4). */}
        {(obligations.data?.regulationsWithoutSeededContent?.length ?? 0) > 0 && (
          <p className="text-[11px] text-amber-600 dark:text-amber-400">
            Declared but carrying no obligation content in this application yet:{" "}
            {obligations.data!.regulationsWithoutSeededContent!.join(", ")}. Zero here means
            un-modelled, not compliant.
          </p>
        )}
      </div>
    </div>
  );
}
