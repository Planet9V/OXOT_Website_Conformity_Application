import { useMemo, useState } from "react";
import { Link } from "wouter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useGetMyProfile } from "@workspace/api-client-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowRight, Inbox, HandHelping, Plus } from "lucide-react";

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

interface EvidenceRequest {
  id: number;
  regulationKey: string;
  refCode: string;
  title: string;
  detail: string;
  requestedOfRole: string | null;
  requestedOfUsername: string;
  dueDate: string | null;
  status: string;
  requestedBy: string;
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

/**
 * The inbox rows plus the close dialog. Closing demands a resolution — the
 * API refuses a bare "fulfilled" — and never touches the obligation's own
 * status; the panel says so.
 */
function EvidenceInbox({
  requests,
  onChanged,
}: {
  requests: EvidenceRequest[];
  onChanged: () => void;
}) {
  const [closing, setClosing] = useState<EvidenceRequest | null>(null);
  const [outcome, setOutcome] = useState<"fulfilled" | "withdrawn">("fulfilled");
  const [resolution, setResolution] = useState("");
  const [saving, setSaving] = useState(false);

  const close = async () => {
    if (!closing) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/conformity/evidence-requests/${closing.id}/close`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outcome, resolution }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
      toast.success(`Request ${outcome}`);
      setClosing(null);
      setResolution("");
      onChanged();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not close the request");
    } finally {
      setSaving(false);
    }
  };

  if (requests.length === 0) return null;

  return (
    <div className="rounded-xl border border-primary/25 bg-primary/[0.03] p-3 space-y-2" data-testid="evidence-inbox">
      <div className="flex items-center gap-2">
        <HandHelping className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
          Evidence requested of you
        </span>
        <Badge variant="outline" className="text-[10px] font-mono">{requests.length}</Badge>
      </div>
      <ul className="divide-y divide-border/50">
        {requests.map((r) => (
          <li key={r.id} className="py-2 flex flex-wrap items-baseline justify-between gap-2">
            <div className="min-w-0">
              <span className="font-mono text-[10px] uppercase text-muted-foreground mr-2">
                {r.regulationKey} {r.refCode}
              </span>
              <span className="text-sm text-foreground">{r.title}</span>
              {r.dueDate && (
                <span className="ml-2 font-mono text-[11px] text-muted-foreground">due {r.dueDate}</span>
              )}
            </div>
            <Button variant="outline" size="sm" className="h-6 text-[11px] px-2 shrink-0" onClick={() => setClosing(r)}>
              Close
            </Button>
          </li>
        ))}
      </ul>
      <p className="text-[11px] text-muted-foreground">
        Closing a request records what was provided — it never changes the obligation's
        own status, which is evaluated where the obligation lives.
      </p>

      <Dialog open={closing !== null} onOpenChange={(v) => !v && setClosing(null)}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">Close: {closing?.title}</DialogTitle>
            <DialogDescription className="text-xs">
              Say what was provided (or why the request is withdrawn) — the record is
              what someone points at later.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1 text-xs">
            <div className="flex gap-1">
              {(["fulfilled", "withdrawn"] as const).map((o) => (
                <button
                  key={o}
                  type="button"
                  onClick={() => setOutcome(o)}
                  className={
                    outcome === o
                      ? "px-2 py-0.5 rounded-md text-[11px] font-mono border bg-primary/15 border-primary/40 text-primary"
                      : "px-2 py-0.5 rounded-md text-[11px] font-mono border border-border/50 text-muted-foreground/60"
                  }
                >
                  {o}
                </button>
              ))}
            </div>
            <Textarea
              className="text-xs h-20"
              placeholder={outcome === "fulfilled" ? "What was provided, and where it is" : "Why the request is withdrawn"}
              value={resolution}
              onChange={(e) => setResolution(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setClosing(null)}>Cancel</Button>
            <Button size="sm" onClick={close} disabled={saving || !resolution.trim()}>Close request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Ask a colleague for evidence: pick the obligation, the routing follows it. */
function RequestEvidenceDialog({
  open,
  onOpenChange,
  obligations,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  obligations: Obligation[];
  onCreated: () => void;
}) {
  const [form, setForm] = useState({ obligation: "", title: "", detail: "", role: "", dueDate: "" });
  const [saving, setSaving] = useState(false);

  const selected = obligations.find((o) => `${o.regulationKey}::${o.refCode}` === form.obligation);
  // The routing default follows the obligation (6.3); the requester can override.
  const effectiveRole = form.role || selected?.defaultTeamRole || "";

  const create = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch("/api/conformity/evidence-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          regulationKey: selected.regulationKey,
          refCode: selected.refCode,
          title: form.title,
          detail: form.detail,
          requestedOfRole: effectiveRole || null,
          dueDate: form.dueDate || null,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
      toast.success("Evidence requested");
      onOpenChange(false);
      setForm({ obligation: "", title: "", detail: "", role: "", dueDate: "" });
      onCreated();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not create the request");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-2xl max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-serif text-lg">Request evidence</DialogTitle>
          <DialogDescription className="text-xs">
            The internal due date is your choice, never a statutory clock. The request
            routes to the obligation's default team role unless you override it.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-1 text-xs">
          <div className="space-y-1">
            <Label>Obligation</Label>
            <Select value={form.obligation} onValueChange={(v) => setForm({ ...form, obligation: v })}>
              <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Pick the duty the evidence serves" /></SelectTrigger>
              <SelectContent className="max-h-64">
                {obligations.map((o) => (
                  <SelectItem key={`${o.regulationKey}::${o.refCode}`} value={`${o.regulationKey}::${o.refCode}`}>
                    {o.regulationKey.toUpperCase()} {o.refCode} — {o.title.slice(0, 60)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label>What is being asked for *</Label>
            <Input className="h-8 text-xs" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="space-y-1">
            <Label>Detail</Label>
            <Textarea className="text-xs h-16" value={form.detail}
              onChange={(e) => setForm({ ...form, detail: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Route to role {selected && !form.role ? `(default: ${selected.defaultTeamRole})` : ""}</Label>
              <Select value={effectiveRole} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Follows the obligation" /></SelectTrigger>
                <SelectContent>
                  {Object.entries(ROLE_LABEL).map(([k, label]) => (
                    <SelectItem key={k} value={k}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Internal due date</Label>
              <Input type="date" className="h-8 text-xs font-mono" value={form.dueDate}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button size="sm" onClick={create} disabled={saving || !selected || !form.title.trim()}>
            Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function YourWork() {
  const qc = useQueryClient();
  const [requestOpen, setRequestOpen] = useState(false);
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

  const requestsKey = ["/api/conformity/evidence-requests"];
  const evidenceRequests = useQuery<{ total: number; openCount: number; requests: EvidenceRequest[] }>({
    queryKey: requestsKey,
    queryFn: async () => {
      const res = await fetch("/api/conformity/evidence-requests?status=open");
      if (!res.ok) throw new Error(`Could not load evidence requests (HTTP ${res.status})`);
      return res.json();
    },
  });

  // The role-scoped inbox (6.3, delivered by 7.5c): requests routed to my
  // role or addressed to me by name.
  const myRequests = useMemo(() => {
    const all = evidenceRequests.data?.requests ?? [];
    if (!me) return [];
    return all.filter(
      (r) =>
        (teamRole && r.requestedOfRole === teamRole) ||
        (r.requestedOfUsername && r.requestedOfUsername === me.username),
    );
  }, [evidenceRequests.data, me, teamRole]);

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
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={() => setRequestOpen(true)}
            data-testid="request-evidence"
          >
            <Plus className="h-3 w-3" /> Request evidence
          </Button>
          {shortcut && (
            <Link
              href={shortcut.href}
              className="text-xs font-medium text-primary hover:underline inline-flex items-center gap-1"
            >
              {shortcut.label} <ArrowRight className="h-3 w-3" />
            </Link>
          )}
        </div>
      </div>

      <EvidenceInbox
        requests={myRequests}
        onChanged={() => qc.invalidateQueries({ queryKey: requestsKey })}
      />
      <RequestEvidenceDialog
        open={requestOpen}
        onOpenChange={setRequestOpen}
        obligations={obligations.data?.obligations ?? []}
        onCreated={() => qc.invalidateQueries({ queryKey: requestsKey })}
      />

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
