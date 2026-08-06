import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  useListBomNotifications,
  getListBomNotificationsQueryKey,
  useListBomNotificationGaps,
  getListBomNotificationGapsQueryKey,
  useCreateBomNotification,
  useUpdateBomNotification,
  useGetAdminSession,
} from "@workspace/api-client-react";
import type { BomNotification, BomNotificationGap } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { formatDateTime, toDateTimeLocal } from "@/lib/conformity";
import {
  Megaphone,
  Copy,
  Pencil,
  Mail,
  TriangleAlert,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

/**
 * CRA Art 13(6) upstream notifications — tracking whether the maintainer of a
 * third-party component was told about a vulnerability found in it.
 *
 * Records are keyed by the stable component identity (purl, else name@version)
 * + vulnerability id, NEVER by a finding row: findings are wiped and
 * regenerated on every BOM analysis, so this key is what re-attaches a tracked
 * notification to the fresh findings after a re-upload.
 *
 * Deliberately copy/mailto only — the app never auto-sends anything to a third
 * party.
 */

export const NOTIFICATION_STATUS_OPTIONS = [
  { value: "not_required", label: "Not required" },
  { value: "pending", label: "Pending" },
  { value: "notified", label: "Notified" },
  { value: "acknowledged", label: "Acknowledged" },
] as const;

export const NOTIFICATION_METHOD_OPTIONS = [
  { value: "email", label: "Email" },
  { value: "security_advisory", label: "Security advisory / security.txt" },
  { value: "issue_tracker", label: "Issue tracker" },
  { value: "other", label: "Other" },
] as const;

export function notificationStatusLabel(status: string): string {
  return NOTIFICATION_STATUS_OPTIONS.find((o) => o.value === status)?.label ?? status;
}

export function notificationStatusClass(status: string): string {
  switch (status) {
    case "notified":
      return "bg-blue-500/10 text-blue-600 border-blue-500/30";
    case "acknowledged":
      return "bg-green-500/10 text-green-600 border-green-500/30";
    case "pending":
      return "bg-amber-500/10 text-amber-600 border-amber-500/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

/**
 * A pending Art 13(6) notification is overdue once its (server-stamped, 72h by
 * default) due date has passed and the maintainer hasn't acknowledged it.
 */
export function isNotificationOverdue(n: {
  status: string;
  dueAt: string | null;
  acknowledgedAt: string | null;
}): boolean {
  if (n.status !== "pending" || !n.dueAt || n.acknowledgedAt) return false;
  return new Date(n.dueAt).getTime() < Date.now();
}

/**
 * Mirror of the server's canonical component identity: purl if present, else
 * `name@version` (or bare name). Used to match findings to tracked records.
 */
export function componentIdentityKey(c: {
  purl?: string | null;
  name?: string | null;
  version?: string | null;
}): string {
  const purl = (c.purl ?? "").trim();
  if (purl) return purl;
  const name = (c.name ?? "").trim();
  const version = (c.version ?? "").trim();
  return version ? `${name}@${version}` : name;
}

function componentLabel(n: {
  componentName: string;
  componentVersion: string;
  componentKey: string;
}): string {
  if (n.componentName) {
    return n.componentVersion ? `${n.componentName}@${n.componentVersion}` : n.componentName;
  }
  return n.componentKey;
}

/** Ready-to-send upstream notification text (copy/mailto only — never auto-sent). */
export function buildNotificationDraft(input: {
  productName: string;
  componentName: string;
  componentVersion: string;
  purl?: string;
  vulnerabilityIds: string[];
  severity?: string;
}): string {
  const component = input.componentVersion
    ? `${input.componentName}@${input.componentVersion}`
    : input.componentName;
  const vulns = input.vulnerabilityIds.filter(Boolean).join(", ");
  const lines = [
    `Subject: Vulnerability report for ${component} (${vulns})`,
    ``,
    `Hello,`,
    ``,
    `While assessing our product "${input.productName}" under the EU Cyber Resilience Act, we identified that it embeds your component ${component}` +
      (input.purl ? ` (${input.purl})` : "") +
      `, which appears to be affected by the following known vulnerability identifier(s): ${vulns}.`,
    ...(input.severity && input.severity !== "unknown"
      ? [``, `Assessed severity in our context: ${input.severity}.`]
      : []),
    ``,
    `We are sharing this with you as the maintainer of the component, in line with Article 13(6) of the Cyber Resilience Act. If this issue is already known or fixed in a later release, a pointer to the fixed version would be appreciated.`,
    ``,
    `We follow coordinated disclosure practices: we will not publish details before a fix or advisory is available, and we are happy to align timelines with you.`,
    ``,
    `Kind regards,`,
    `${input.productName} product security team`,
  ];
  return lines.join("\n");
}

/** Loose check that a recorded maintainer contact is a plain email address. */
export function looksLikeEmail(contact: string | null | undefined): boolean {
  const c = (contact ?? "").trim();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c);
}

/**
 * Split a buildNotificationDraft() result into mailto subject/body.
 * The draft's first line is `Subject: …`; everything after the following
 * blank line is the body.
 */
export function splitDraftForEmail(draft: string): { subject: string; body: string } {
  const lines = draft.split("\n");
  const subject = lines[0]?.replace(/^Subject:\s*/, "") ?? "";
  const body = lines.slice(1).join("\n").replace(/^\n+/, "");
  return { subject, body };
}

/**
 * Build a mailto: URL for the draft, or null when the encoded URL would be
 * too long for mail clients to handle reliably (caller should fall back to
 * copying the draft instead).
 */
export function buildMailtoUrl(contact: string, draft: string): string | null {
  const { subject, body } = splitDraftForEmail(draft);
  const url = `mailto:${encodeURIComponent(contact.trim())}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  // Conservative cap: many clients/browsers truncate or drop very long mailto URLs.
  if (url.length > 6000) return null;
  return url;
}

/** Open the user's mail client pre-filled; falls back to copy for over-long drafts. */
async function emailDraft(contact: string, draft: string): Promise<void> {
  const url = buildMailtoUrl(contact, draft);
  if (!url) {
    await copyDraft(draft);
    toast.info("Draft too long for a mail link — copied it instead.");
    return;
  }
  // Navigate via a transient anchor (rather than location.href) so the
  // mailto open stays observable/stubbable in tests.
  const a = document.createElement("a");
  a.href = url;
  a.click();
}

async function copyDraft(text: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Notification draft copied to the clipboard.");
  } catch {
    toast.error("Couldn't copy — your browser blocked clipboard access.");
  }
}

// ---------------------------------------------------------------------------
// Track / edit dialog
// ---------------------------------------------------------------------------

export type NotificationDialogTarget = {
  /** Existing record when editing; undefined when starting to track. */
  existing?: BomNotification;
  componentName: string;
  componentVersion: string;
  purl: string;
  vulnerabilityId: string;
  severity?: string;
};

export function NotificationDialog({
  assessmentId,
  productName,
  target,
  onOpenChange,
}: {
  assessmentId: number;
  productName: string;
  target: NotificationDialogTarget | null;
  onOpenChange: (open: boolean) => void;
}) {
  const qc = useQueryClient();
  const existing = target?.existing;
  const [status, setStatus] = useState<string>(existing?.status ?? "pending");
  const [contact, setContact] = useState(existing?.maintainerContact ?? "");
  const [method, setMethod] = useState(existing?.method ?? "email");
  const [notifiedAt, setNotifiedAt] = useState(
    existing?.notifiedAt ? existing.notifiedAt.slice(0, 10) : "",
  );
  const [dueAt, setDueAt] = useState(
    existing?.dueAt ? toDateTimeLocal(existing.dueAt) : "",
  );
  const [notes, setNotes] = useState(existing?.notes ?? "");

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: getListBomNotificationsQueryKey(assessmentId) });
    // Tracking (or re-classifying) a notification changes the untracked-gap set.
    qc.invalidateQueries({ queryKey: getListBomNotificationGapsQueryKey(assessmentId) });
  };

  const create = useCreateBomNotification({
    mutation: {
      onSuccess: () => {
        invalidate();
        toast.success("Upstream notification tracked.");
        onOpenChange(false);
      },
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : "Could not save the notification."),
    },
  });
  const update = useUpdateBomNotification({
    mutation: {
      onSuccess: () => {
        invalidate();
        toast.success("Upstream notification updated.");
        onOpenChange(false);
      },
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : "Could not save the notification."),
    },
  });

  if (!target) return null;
  const pending = create.isPending || update.isPending;
  const draft = buildNotificationDraft({
    productName,
    componentName: target.componentName,
    componentVersion: target.componentVersion,
    purl: target.purl || undefined,
    vulnerabilityIds: [target.vulnerabilityId],
    severity: target.severity,
  });

  function save() {
    const payload = {
      status: status as "not_required" | "pending" | "notified" | "acknowledged",
      maintainerContact: contact.trim(),
      method,
      notifiedAt: notifiedAt ? new Date(`${notifiedAt}T00:00:00Z`).toISOString() : null,
      notes: notes.trim(),
    };
    if (existing) {
      update.mutate({
        notificationId: existing.id,
        // dueAt is only editable when a record exists; a fresh pending record
        // gets its 72h due date stamped server-side.
        data: { ...payload, dueAt: dueAt ? new Date(dueAt).toISOString() : null },
      });
    } else {
      create.mutate({
        id: assessmentId,
        data: {
          componentName: target!.componentName,
          componentVersion: target!.componentVersion,
          purl: target!.purl,
          vulnerabilityId: target!.vulnerabilityId,
          ...payload,
        },
      });
    }
  }

  return (
    <Dialog open onOpenChange={onOpenChange}>
      <DialogContent className="rounded-md max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {existing ? "Update upstream notification" : "Track upstream notification"}
          </DialogTitle>
          <DialogDescription>
            CRA Art 13(6): record whether the maintainer of{" "}
            <span className="font-mono">
              {target.componentName}
              {target.componentVersion ? `@${target.componentVersion}` : ""}
            </span>{" "}
            was told about <span className="font-mono">{target.vulnerabilityId}</span>. Nothing is
            sent automatically — use the draft to notify them yourself.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Status">
              {(id) => (
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id={id} className="rounded-md" data-testid="notification-status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NOTIFICATION_STATUS_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </FormField>
            <FormField label="Method">
              {(id) => (
                <Select value={method} onValueChange={setMethod}>
                  <SelectTrigger id={id} className="rounded-md">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {NOTIFICATION_METHOD_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </FormField>
          </div>
          <FormField label="Maintainer / upstream contact">
            <Input
              className="rounded-md"
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="security@example.org, security.txt URL, tracker…"
              data-testid="notification-contact"
            />
          </FormField>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Date notified">
              <Input
                type="date"
                className="rounded-md"
                value={notifiedAt}
                onChange={(e) => setNotifiedAt(e.target.value)}
              />
            </FormField>
            {existing && (
              <FormField label="Due by (Art 13(6))">
                <Input
                  type="datetime-local"
                  className="rounded-md"
                  value={dueAt}
                  onChange={(e) => setDueAt(e.target.value)}
                  data-testid="notification-due-at"
                />
              </FormField>
            )}
          </div>
          <FormField label="Notes">
            <Textarea
              className="rounded-md min-h-20"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Disclosure timeline, upstream response, planned upgrade…"
            />
          </FormField>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              className="rounded-md flex-1"
              onClick={() => void copyDraft(draft)}
              data-testid="notification-copy-draft"
            >
              <Copy className="w-4 h-4 mr-2" /> Copy notification draft
            </Button>
            {looksLikeEmail(contact) && (
              <Button
                type="button"
                variant="outline"
                className="rounded-md flex-1"
                onClick={() => void emailDraft(contact, draft)}
                data-testid="notification-email-maintainer"
              >
                <Mail className="w-4 h-4 mr-2" /> Email maintainer
              </Button>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" className="rounded-md" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="rounded-md"
            disabled={pending}
            onClick={save}
            data-testid="notification-save"
          >
            {pending ? "Saving…" : existing ? "Save changes" : "Track notification"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Art 13(6) list (assessment-level)
// ---------------------------------------------------------------------------

export function UpstreamNotificationsCard({
  assessmentId,
  productName,
}: {
  assessmentId: number;
  productName: string;
}) {
  const qc = useQueryClient();
  const { data: session } = useGetAdminSession();
  const readOnly = session?.role === "demo";
  const { data: notifications, isLoading } = useListBomNotifications(assessmentId);
  const { data: gaps, isLoading: gapsLoading } = useListBomNotificationGaps(assessmentId);
  const [editing, setEditing] = useState<NotificationDialogTarget | null>(null);
  const [showGaps, setShowGaps] = useState(false);

  const acknowledge = useUpdateBomNotification({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListBomNotificationsQueryKey(assessmentId) });
        qc.invalidateQueries({ queryKey: getListBomNotificationGapsQueryKey(assessmentId) });
        toast.success("Marked as acknowledged by the maintainer.");
      },
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : "Could not update the notification."),
    },
  });

  const list = notifications ?? [];
  const gapList = gaps ?? [];

  return (
    <Card className="rounded-md" data-testid="upstream-notifications">
      <CardHeader className="border-b border-border py-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-primary" /> Upstream notifications (Art 13(6))
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground mb-3">
          Vulnerabilities found in third-party components must be reported to whoever maintains
          them. Track each notification here — drafts are copy-only, never auto-sent.
        </p>
        {!gapsLoading && (
          <div
            className={cn(
              "mb-3 rounded-md border px-3 py-2.5",
              gapList.length > 0
                ? "border-amber-500/30 bg-amber-500/10"
                : "border-green-500/30 bg-green-500/10",
            )}
            data-testid="notification-gaps"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm">
                {gapList.length > 0 ? (
                  <>
                    <TriangleAlert className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="text-amber-700 dark:text-amber-500 font-medium" data-testid="notification-gaps-count">
                      {gapList.length} vulnerability finding{gapList.length === 1 ? "" : "s"} where the
                      maintainer hasn&apos;t been notified yet
                    </span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                    <span className="text-green-700 dark:text-green-500" data-testid="notification-gaps-count">
                      Every vulnerability finding&apos;s maintainer has been notified (or marked not
                      required).
                    </span>
                  </>
                )}
              </div>
              {gapList.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-md h-7 text-xs"
                  onClick={() => setShowGaps((v) => !v)}
                  data-testid="notification-gaps-toggle"
                >
                  {showGaps ? (
                    <>
                      Hide <ChevronUp className="w-3.5 h-3.5 ml-1" />
                    </>
                  ) : (
                    <>
                      Show untracked <ChevronDown className="w-3.5 h-3.5 ml-1" />
                    </>
                  )}
                </Button>
              )}
            </div>
            {showGaps && gapList.length > 0 && (
              <ul className="mt-2 divide-y divide-amber-500/20">
                {gapList.map((g: BomNotificationGap) => (
                  <li
                    key={`${g.componentKey}::${g.vulnerabilityId}::${g.findingId}`}
                    className="py-2 flex flex-wrap items-center justify-between gap-2"
                    data-testid="notification-gap-row"
                  >
                    <div className="min-w-0 text-sm">
                      <span className="font-mono">
                        {g.componentName
                          ? g.componentVersion
                            ? `${g.componentName}@${g.componentVersion}`
                            : g.componentName
                          : g.componentKey}
                      </span>{" "}
                      <span className="font-mono text-muted-foreground">· {g.vulnerabilityId}</span>
                      <div className="text-[11px] text-muted-foreground font-mono">
                        {g.severity} · {g.bomName}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {g.trackedStatus && (
                        <Badge
                          variant="outline"
                          className={cn("rounded-md text-[10px]", notificationStatusClass(g.trackedStatus))}
                          data-testid="notification-gap-status"
                        >
                          {notificationStatusLabel(g.trackedStatus)}
                        </Badge>
                      )}
                      {!readOnly && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-md h-7 text-xs"
                        data-testid="notification-gap-track"
                        onClick={() =>
                          setEditing({
                            // Tracked-but-pending gaps open the existing record for update.
                            existing: list.find(
                              (n) =>
                                n.componentKey === g.componentKey &&
                                n.vulnerabilityId === g.vulnerabilityId,
                            ),
                            componentName: g.componentName,
                            componentVersion: g.componentVersion,
                            purl: g.purl,
                            vulnerabilityId: g.vulnerabilityId,
                            severity: g.severity,
                          })
                        }
                      >
                        <Megaphone className="w-3.5 h-3.5 mr-1" />
                        {g.trackedStatus ? "Update" : "Track"}
                      </Button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {isLoading && <Skeleton className="h-20 w-full" />}
        {!isLoading && list.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nothing tracked yet. Open a BOM finding and choose “Track upstream notification”.
          </p>
        )}
        {!isLoading && list.length > 0 && (
          <ul className="divide-y divide-border">
            {list.map((n) => (
              <li
                key={n.id}
                className="py-3 flex flex-wrap items-start justify-between gap-3"
                data-testid="upstream-notification-row"
              >
                <div className="min-w-0">
                  <div className="text-sm font-medium leading-snug">
                    <span className="font-mono">{componentLabel(n)}</span>{" "}
                    <span className="font-mono text-muted-foreground">· {n.vulnerabilityId}</span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground font-mono">
                    {n.maintainerContact && <span>{n.maintainerContact}</span>}
                    {n.notifiedAt && <span>notified {formatDateTime(n.notifiedAt)}</span>}
                    {n.acknowledgedAt && (
                      <span className="text-green-600 dark:text-green-500">
                        acknowledged {formatDateTime(n.acknowledgedAt)}
                      </span>
                    )}
                    {n.dueAt && !n.acknowledgedAt && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3" /> due {formatDateTime(n.dueAt)}
                      </span>
                    )}
                    {n.recordedBy && <span>by {n.recordedBy.split(":").pop()}</span>}
                  </div>
                  {isNotificationOverdue(n) && (
                    <Badge
                      variant="outline"
                      className="mt-1 rounded-md text-[10px] bg-red-500/10 text-red-600 border-red-500/30"
                      data-testid="notification-overdue"
                    >
                      <TriangleAlert className="w-3 h-3 mr-1" /> Overdue
                    </Badge>
                  )}
                  {n.notes && <p className="text-xs text-muted-foreground mt-1">{n.notes}</p>}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {looksLikeEmail(n.maintainerContact) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-md h-7 w-7"
                      aria-label={`Email maintainer of ${componentLabel(n)}`}
                      data-testid="notification-email-maintainer"
                      onClick={() =>
                        void emailDraft(
                          n.maintainerContact,
                          buildNotificationDraft({
                            productName,
                            componentName: n.componentName,
                            componentVersion: n.componentVersion,
                            purl: n.purl || undefined,
                            vulnerabilityIds: [n.vulnerabilityId],
                          }),
                        )
                      }
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </Button>
                  )}
                  <Badge
                    variant="outline"
                    className={cn("rounded-md text-[10px]", notificationStatusClass(n.status))}
                  >
                    {notificationStatusLabel(n.status)}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-md h-7 w-7"
                    aria-label={`Copy notification draft for ${componentLabel(n)}`}
                    onClick={() =>
                      void copyDraft(
                        buildNotificationDraft({
                          productName,
                          componentName: n.componentName,
                          componentVersion: n.componentVersion,
                          purl: n.purl || undefined,
                          vulnerabilityIds: [n.vulnerabilityId],
                        }),
                      )
                    }
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                  {!readOnly && n.status !== "acknowledged" && n.status !== "not_required" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-md h-7 text-xs"
                      data-testid="notification-acknowledge"
                      disabled={acknowledge.isPending}
                      onClick={() =>
                        acknowledge.mutate({
                          notificationId: n.id,
                          // No timestamp — the server auto-stamps acknowledgedAt.
                          data: { status: "acknowledged" },
                        })
                      }
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Acknowledge
                    </Button>
                  )}
                  {!readOnly && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-md h-7 w-7"
                      aria-label={`Edit notification for ${componentLabel(n)}`}
                      onClick={() =>
                        setEditing({
                          existing: n,
                          componentName: n.componentName,
                          componentVersion: n.componentVersion,
                          purl: n.purl,
                          vulnerabilityId: n.vulnerabilityId,
                        })
                      }
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      {editing && (
        <NotificationDialog
          key={`${editing.existing?.id ?? "new"}-${editing.vulnerabilityId}`}
          assessmentId={assessmentId}
          productName={productName}
          target={editing}
          onOpenChange={(open) => {
            if (!open) setEditing(null);
          }}
        />
      )}
    </Card>
  );
}
