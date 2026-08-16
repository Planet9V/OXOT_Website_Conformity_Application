import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  useGetAdminSession,
  useListAuditorAccess,
  getListAuditorAccessQueryKey,
  useIssueAuditorAccess,
  useRevokeAuditorAccess,
  useListAuditorRfis,
  getListAuditorRfisQueryKey,
  useRespondAuditorRfi,
} from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
import { cn, formatDate } from "@/lib/utils";
import { KeyRound, Plus, Copy, MessageSquare } from "lucide-react";

/**
 * The organisation's side of the external auditor portal (9.3b). Issuing a
 * token is what lets a notified-body auditor open /auditor-portal at all —
 * before this panel existed the door had no key. Expiry is the issuer's
 * explicit choice, never defaulted. RFIs the auditor submits land here;
 * answering records who answered and when in the activity ledger.
 */

const SEVERITY_TONE: Record<string, string> = {
  rfi: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  non_conformity: "bg-destructive/10 text-destructive border-destructive/30",
  observation: "bg-muted text-muted-foreground",
};

export function AuditorAccessPanel({ assessments }: { assessments: Array<{ id: number }> }) {
  const qc = useQueryClient();
  const { data: session } = useGetAdminSession();
  const isAdmin = session?.role === "admin";
  const [selectedId, setSelectedId] = useState<number | null>(assessments[0]?.id ?? null);
  const assessmentId = selectedId ?? assessments[0]?.id ?? 0;

  const [issueOpen, setIssueOpen] = useState(false);
  const [issueForm, setIssueForm] = useState({
    auditorEmail: "",
    notifiedBodyName: "",
    notifiedBodyNumber: "",
    expiresInDays: "",
  });
  const [respondingId, setRespondingId] = useState<number | null>(null);
  const [responseText, setResponseText] = useState("");

  const access = useListAuditorAccess(assessmentId, {
    query: { queryKey: getListAuditorAccessQueryKey(assessmentId), enabled: assessmentId > 0 },
  });
  const rfis = useListAuditorRfis(assessmentId, {
    query: { queryKey: getListAuditorRfisQueryKey(assessmentId), enabled: assessmentId > 0 },
  });

  const issue = useIssueAuditorAccess({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries();
        toast.success("Auditor access issued — copy the portal link and send it");
        setIssueOpen(false);
        setIssueForm({ auditorEmail: "", notifiedBodyName: "", notifiedBodyNumber: "", expiresInDays: "" });
      },
      onError: (e: any) => toast.error(e.message || "Could not issue access"),
    },
  });
  const revoke = useRevokeAuditorAccess({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries();
        toast.success("Access revoked");
      },
      onError: (e: any) => toast.error(e.message || "Could not revoke"),
    },
  });
  const respond = useRespondAuditorRfi({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries();
        toast.success("Response recorded");
        setRespondingId(null);
        setResponseText("");
      },
      onError: (e: any) => toast.error(e.message || "Could not record the response"),
    },
  });

  const portalLink = (token: string) =>
    `${window.location.origin}/conformity/auditor-portal?token=${token}`;

  const copyLink = (token: string) => {
    navigator.clipboard.writeText(portalLink(token)).then(
      () => toast.success("Portal link copied"),
      () => toast.error("Could not copy — copy it from the token below"),
    );
  };

  if (assessments.length === 0) {
    return (
      <Card className="rounded-2xl border border-border shadow-sm" data-testid="auditor-access-panel">
        <CardContent className="p-6 text-sm text-muted-foreground">
          Auditor access is issued per assessment — create the product's assessment first.
        </CardContent>
      </Card>
    );
  }

  const grants = access.data?.access ?? [];
  const inbox = rfis.data?.rfis ?? [];
  const expiresDays = parseInt(issueForm.expiresInDays, 10);
  const issueValid =
    issueForm.auditorEmail.trim().length > 2 &&
    issueForm.notifiedBodyName.trim() &&
    issueForm.notifiedBodyNumber.trim() &&
    Number.isFinite(expiresDays) &&
    expiresDays >= 1 &&
    expiresDays <= 365;

  return (
    <Card className="rounded-2xl border border-border shadow-sm" data-testid="auditor-access-panel">
      <CardHeader className="border-b pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary" /> Auditor access &amp; RFIs
            </CardTitle>
            <CardDescription className="text-xs max-w-2xl">
              The external notified-body portal is opened with an expiring token issued here,
              scoped to one assessment. Questions the auditor submits arrive below.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {assessments.length > 1 && (
              <Select value={String(assessmentId)} onValueChange={(v) => setSelectedId(Number(v))}>
                <SelectTrigger className="h-8 text-xs w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {assessments.map((a) => (
                    <SelectItem key={a.id} value={String(a.id)}>
                      Assessment #{a.id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {isAdmin && (
              <Button size="sm" className="gap-1.5 text-xs" onClick={() => setIssueOpen(true)} data-testid="auditor-access-issue">
                <Plus className="h-3.5 w-3.5" /> Issue access
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-6">
        <div className="space-y-2">
          {access.isLoading ? (
            <Skeleton className="h-16 w-full rounded-xl" />
          ) : grants.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No auditor access has been issued for this assessment.
              {!isAdmin && " Issuing requires an admin session."}
            </p>
          ) : (
            <ul className="space-y-2">
              {grants.map((g) => {
                const expired = new Date(g.expiresAt).getTime() < Date.now();
                return (
                  <li key={g.id} className="rounded-xl border border-border/70 p-3 flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-foreground truncate">
                        {g.auditorEmail}
                        <span className="text-xs text-muted-foreground"> · {g.notifiedBodyName} (NB {g.notifiedBodyNumber})</span>
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        expires {formatDate(g.expiresAt)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "font-mono text-[10px]",
                          !g.isActive
                            ? "bg-muted text-muted-foreground"
                            : expired
                              ? "bg-amber-500/10 text-amber-500 border-amber-500/30"
                              : "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
                        )}
                      >
                        {!g.isActive ? "revoked" : expired ? "expired" : "active"}
                      </Badge>
                      {g.isActive && !expired && (
                        <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => copyLink(g.accessToken)}>
                          <Copy className="h-3 w-3" /> Copy link
                        </Button>
                      )}
                      {isAdmin && g.isActive && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs text-destructive"
                          disabled={revoke.isPending}
                          onClick={() => revoke.mutate({ id: g.id })}
                        >
                          Revoke
                        </Button>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium text-foreground flex items-center gap-1.5">
            <MessageSquare className="h-4 w-4 text-primary" /> Auditor questions
          </div>
          {rfis.isLoading ? (
            <Skeleton className="h-16 w-full rounded-xl" />
          ) : inbox.length === 0 ? (
            <p className="text-sm text-muted-foreground">No RFIs, non-conformities or observations submitted yet.</p>
          ) : (
            <ul className="space-y-2">
              {inbox.map((r) => (
                <li key={r.id} className="rounded-xl border border-border/70 p-3 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-xs text-muted-foreground">
                      {r.auditorEmail} · {formatDate(r.createdAt)}
                      {r.requirementRefCode && <span className="font-mono"> · {r.requirementRefCode}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={cn("font-mono text-[10px]", SEVERITY_TONE[r.severity] ?? "")}>
                        {r.severity.replaceAll("_", " ")}
                      </Badge>
                      <Badge variant="outline" className="font-mono text-[10px]">
                        {r.status}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-foreground">{r.question}</p>
                  {r.manufacturerResponse ? (
                    <p className="text-xs text-muted-foreground border-l-2 border-primary/40 pl-2">
                      Response ({r.respondedAt ? formatDate(r.respondedAt) : "recorded"}): {r.manufacturerResponse}
                    </p>
                  ) : respondingId === r.id ? (
                    <div className="space-y-2">
                      <Textarea
                        className="text-xs min-h-20"
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        placeholder="The organisation's answer, as it should appear to the auditor…"
                      />
                      <div className="flex gap-2 justify-end">
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => setRespondingId(null)}>
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          className="h-7 text-xs"
                          disabled={respond.isPending || !responseText.trim()}
                          onClick={() => respond.mutate({ id: r.id, data: { response: responseText.trim() } })}
                        >
                          Record response
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setRespondingId(r.id); setResponseText(""); }}>
                      Respond
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>

      <Dialog open={issueOpen} onOpenChange={setIssueOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Issue auditor access</DialogTitle>
            <DialogDescription className="text-xs">
              Creates an expiring token scoped to assessment #{assessmentId}. Send the portal
              link to the auditor; revoke it here at any time.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1 text-xs">
            <div className="space-y-1">
              <Label htmlFor="aa-email">Auditor email</Label>
              <Input id="aa-email" className="h-8 text-xs" value={issueForm.auditorEmail}
                onChange={(e) => setIssueForm({ ...issueForm, auditorEmail: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="aa-nb-name">Notified body</Label>
                <Input id="aa-nb-name" className="h-8 text-xs" value={issueForm.notifiedBodyName}
                  onChange={(e) => setIssueForm({ ...issueForm, notifiedBodyName: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="aa-nb-number">NB number</Label>
                <Input id="aa-nb-number" className="h-8 text-xs font-mono" placeholder="e.g. 1234"
                  value={issueForm.notifiedBodyNumber}
                  onChange={(e) => setIssueForm({ ...issueForm, notifiedBodyNumber: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="aa-days">Expires in (days, 1–365 — your choice, not a default)</Label>
              <Input id="aa-days" className="h-8 text-xs font-mono w-32" inputMode="numeric"
                value={issueForm.expiresInDays}
                onChange={(e) => setIssueForm({ ...issueForm, expiresInDays: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setIssueOpen(false)}>Cancel</Button>
            <Button
              size="sm"
              disabled={issue.isPending || !issueValid}
              data-testid="auditor-access-issue-confirm"
              onClick={() =>
                issue.mutate({
                  id: assessmentId,
                  data: {
                    auditorEmail: issueForm.auditorEmail.trim(),
                    notifiedBodyName: issueForm.notifiedBodyName.trim(),
                    notifiedBodyNumber: issueForm.notifiedBodyNumber.trim(),
                    expiresInDays: expiresDays,
                  },
                })
              }
            >
              Issue access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
