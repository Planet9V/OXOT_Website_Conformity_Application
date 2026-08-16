import { useMemo } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useGetMyProfile } from "@workspace/api-client-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Inbox } from "lucide-react";

/**
 * The role-aware slice of Home (task 7.2, D12).
 *
 * Filters the organisation's obligations to the signed-in member's team role
 * using each obligation's `defaultTeamRole` — a workflow routing default from
 * the 6.3 registry, not a statutory assignment, which is why the header says
 * "routed to" rather than "yours by law".
 *
 * Tri-state discipline (L40): a null teamRole renders the NEUTRAL notice,
 * never a guessed scope. Admin and demo sessions are not team members and get
 * the same honest line. When nothing is declared yet, the panel repeats the
 * endpoint's own incompleteness reason instead of showing an empty list as
 * though the desk were clear.
 */

interface Obligation {
  regulationKey: string;
  refCode: string;
  title: string;
  status: string;
  defaultTeamRole: string;
  nextDueDate: string | null;
}

interface ObligationsResponse {
  total: number;
  obligations: Obligation[];
  incomplete?: string;
}

const ROLE_LABEL: Record<string, string> = {
  compliance_coordinator: "Compliance coordinator",
  engineering_lead: "Engineering lead",
  psirt: "PSIRT",
  signatory: "Signatory",
};

/** Where each role's day usually continues after triage. */
const ROLE_SHORTCUT: Record<string, { href: string; label: string }> = {
  compliance_coordinator: { href: "/organisation", label: "All obligations in Organisation" },
  engineering_lead: { href: "/products", label: "Product files in Products" },
  psirt: { href: "/incidents", label: "Clocks and intake in Incidents" },
  signatory: { href: "/signatures", label: "Signature queue in Signatures" },
};

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

/** Open work first, then nearest due date, then worst status. */
const ACTIONABLE = ["not_met", "partial", "not_started", "in_progress"];

export function YourWork() {
  const { data: me, isLoading: meLoading } = useGetMyProfile();

  const obligations = useQuery<ObligationsResponse>({
    queryKey: ["/api/conformity/org/obligations"],
    queryFn: async () => {
      const res = await fetch("/api/conformity/org/obligations");
      if (!res.ok) throw new Error(`Could not load obligations (HTTP ${res.status})`);
      return res.json();
    },
  });

  const teamRole = me?.teamRole ?? null;

  const mine = useMemo(() => {
    const all = obligations.data?.obligations ?? [];
    if (!teamRole) return [];
    return all.filter((o) => o.defaultTeamRole === teamRole);
  }, [obligations.data, teamRole]);

  const open = useMemo(
    () =>
      mine
        .filter((o) => ACTIONABLE.includes(o.status))
        .sort((a, b) => {
          const da = a.nextDueDate ?? "9999";
          const db = b.nextDueDate ?? "9999";
          if (da !== db) return da < db ? -1 : 1;
          return ACTIONABLE.indexOf(a.status) - ACTIONABLE.indexOf(b.status);
        }),
    [mine],
  );

  if (meLoading || obligations.isLoading) {
    return <Skeleton className="h-28 w-full rounded-2xl" />;
  }

  // Not a team member, or a member nobody has placed in a role: say so and
  // stop — the organisation-wide cockpit below is the whole home.
  if (!teamRole) {
    return (
      <div className="rounded-2xl border border-border/60 bg-muted/20 px-5 py-3.5 text-sm text-muted-foreground">
        {me?.role === "member"
          ? "No team role is assigned to your account yet, so Home shows the organisation-wide view. Team roles are assigned in Settings."
          : "This account is not a team member, so Home shows the organisation-wide view. Team members with a role see their own work first."}
      </div>
    );
  }

  const shortcut = ROLE_SHORTCUT[teamRole];

  return (
    <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm space-y-4" data-testid="your-work">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Inbox className="h-4 w-4 text-primary" />
          <h2 className="text-lg font-serif text-foreground">Your work</h2>
          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/30 text-[10px]">
            {ROLE_LABEL[teamRole] ?? teamRole}
          </Badge>
        </div>
        {shortcut && (
          <Link
            href={shortcut.href}
            className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1"
          >
            {shortcut.label} <ArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>

      {obligations.data?.incomplete ? (
        <p className="text-sm text-muted-foreground">
          Nothing to route yet: the organisation has not completed its declarations
          ({obligations.data.incomplete.replaceAll("_", " ")}). Declare roles and
          regulations in Organisation first.
        </p>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">
            {mine.length} obligation{mine.length === 1 ? "" : "s"} routed to your role by
            default · {open.length} open. Routing is the organisation's working default,
            not a statutory assignment.
          </p>

          {open.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nothing routed to your role is open right now.
            </p>
          ) : (
            <ul className="divide-y divide-border/60">
              {open.slice(0, 6).map((o) => (
                <li key={`${o.regulationKey}::${o.refCode}`} className="py-2 flex items-baseline justify-between gap-3">
                  <div className="min-w-0 flex items-baseline gap-2">
                    <Badge variant="outline" className="font-mono text-[10px] uppercase shrink-0">
                      {o.regulationKey}
                    </Badge>
                    <span className="font-mono text-xs text-muted-foreground shrink-0">{o.refCode}</span>
                    <span className="text-sm text-foreground truncate">{o.title}</span>
                  </div>
                  <div className="flex items-baseline gap-3 shrink-0 text-xs font-mono">
                    {o.nextDueDate && (
                      <span className="text-muted-foreground">due {o.nextDueDate.slice(0, 10)}</span>
                    )}
                    <span className={STATUS_TONE[o.status] ?? "text-muted-foreground"}>
                      {STATUS_LABEL[o.status] ?? o.status}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          )}
          {open.length > 6 && (
            <p className="text-xs text-muted-foreground">
              {open.length - 6} more open — see{" "}
              <Link href="/organisation" className="text-primary hover:underline">
                Organisation
              </Link>
              .
            </p>
          )}
        </>
      )}
    </div>
  );
}
