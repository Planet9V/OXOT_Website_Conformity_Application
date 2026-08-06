import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListConformityIncidents,
  useCreateConformityIncident,
  useUpdateConformityIncident,
  useDeleteConformityIncident,
  useGetConformityIncidentAlertHistory,
  getConformityIncidentReportPackage,
  useListIncidentSubmissions,
  useCreateIncidentSubmission,
  useGetAdminSession,
} from "@workspace/api-client-react";
import type {
  ConformityIncident,
  ConformityIncidentAlertHistory,
  ConformityAlertStageHistory,
  IncidentSubmission,
  CreateIncidentSubmissionInput,
} from "@workspace/api-client-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  SEVERITY_OPTIONS,
  INCIDENT_STATUS_OPTIONS,
  INCIDENT_KIND_OPTIONS,
  riskClass,
  labelFor,
  formatDateTime,
  toDateTimeLocal,
} from "@/lib/conformity";
import { printIncidentReport } from "@/lib/print";
import { downloadEnisaSubmission } from "@/lib/enisa";
import {
  ShieldAlert,
  Trash2,
  Plus,
  Clock,
  CheckCircle2,
  FileDown,
  ChevronDown,
  ChevronRight,
  FileCheck2,
  History,
} from "lucide-react";
import { OwnerSelect } from "@/components/conformity/owner-select";

const POPUP_BLOCKED =
  "The report window was blocked. Allow pop-ups for this site and try again.";

function isSevere(incident: Pick<ConformityIncident, "kind">): boolean {
  return incident.kind === "severe_incident";
}

/**
 * Sanity-check a final-report anchor date against the incident's detection
 * time. Mirrors the server-side rule (400 on conflict): anchors before
 * detection or more than a year in the future are almost certainly typos and
 * would silently produce a legally wrong final-report deadline.
 */
const ANCHOR_MAX_FUTURE_MS = 365 * 24 * 60 * 60 * 1000;
function anchorDateProblem(anchorIso: string, detectedAtIso: string): string | null {
  const anchor = new Date(anchorIso).getTime();
  if (Number.isNaN(anchor)) return "Enter a valid date and time.";
  if (anchor < new Date(detectedAtIso).getTime()) {
    return "This date is before the incident was detected — check the date.";
  }
  if (anchor - Date.now() > ANCHOR_MAX_FUTURE_MS) {
    return "This date is more than a year in the future — check the year.";
  }
  return null;
}

/**
 * Sanity-check the detection time itself. Mirrors the server-side rule (400 on
 * conflict): the 24h/72h/final-report clocks all anchor on detectedAt, so a
 * mistyped year would silently set legally wrong deadlines. Any future time
 * (beyond a small clock-skew allowance) or more than five years in the past is
 * almost certainly a typo.
 */
const DETECTED_MAX_FUTURE_MS = 5 * 60 * 1000; // clock-skew allowance
const DETECTED_MAX_PAST_MS = 5 * 365 * 24 * 60 * 60 * 1000;
function detectedAtProblem(detectedAtIso: string): string | null {
  const detected = new Date(detectedAtIso).getTime();
  if (Number.isNaN(detected)) return "Enter a valid date and time.";
  const now = Date.now();
  if (detected - now > DETECTED_MAX_FUTURE_MS) {
    return "This date is in the future — check the date and year.";
  }
  if (now - detected > DETECTED_MAX_PAST_MS) {
    return "This date is more than five years in the past — check the year.";
  }
  return null;
}

/** Pull the server's human-readable message off a 400, if any. */
function serverErrorMessage(err: unknown, fallback: string): string {
  const data = (err as { data?: { error?: unknown } } | null)?.data;
  return typeof data?.error === "string" ? data.error : fallback;
}

/** Anchor explanation for the final-report clock chip, per Art 14 track. */
function finalReportAnchor(incident: ConformityIncident): {
  label: string;
  anchorNote: string;
} {
  if (isSevere(incident)) {
    return {
      label: "Final report",
      anchorNote: incident.notificationDoneAt
        ? "1 calendar month after notification"
        : "1 month after notification — conservative until the 72h notification is marked done",
    };
  }
  return {
    label: "Final report",
    anchorNote: incident.correctiveAvailableAt
      ? "14 days after fix available"
      : "14 days after fix available — conservative (detection + 14d) until the fix date is set",
  };
}

/**
 * "Reminder 3 of 5 sent, last …" / "alerts exhausted" line for a breached
 * stage, derived from delivered alert emails. Only rendered while the stage is
 * overdue and not done — once marked done the alerts stop being relevant.
 */
function AlertStatusLine({
  history,
  policy,
  testId,
}: {
  history: ConformityAlertStageHistory | undefined;
  policy: Pick<ConformityIncidentAlertHistory, "maxReminders" | "reminderIntervalHours">;
  testId?: string;
}) {
  if (!history) return null;
  const { reminderCount, remindersExhausted, lastAlertAt } = history;
  const last = `last alert ${formatDateTime(lastAlertAt)}`;
  const text = remindersExhausted
    ? reminderCount > 0
      ? `Alerts exhausted — ${reminderCount} of ${policy.maxReminders} reminders sent (${last}). Nobody will be nudged again for this stage.`
      : `Breach alerted (${last}) — reminders are off, no further nudges.`
    : reminderCount > 0
      ? `Reminder ${reminderCount} of ${policy.maxReminders} sent (${last}), next in ~${policy.reminderIntervalHours}h.`
      : `Breach alert sent (${last}) — up to ${policy.maxReminders} reminders every ${policy.reminderIntervalHours}h until marked done.`;
  return (
    <div
      className={cn(
        "text-[10px] mt-0.5",
        remindersExhausted ? "text-red-600 font-medium" : "text-muted-foreground",
      )}
      data-testid={testId ? `${testId}-alerts` : undefined}
    >
      {text}
    </div>
  );
}

function Deadline({
  label,
  anchorNote,
  dueAt,
  doneAt,
  onRecord,
  onReopen,
  disabled,
  readOnly,
  testId,
  alertHistory,
  alertPolicy,
}: {
  label: string;
  anchorNote?: string;
  dueAt: string;
  doneAt: string | null;
  /** Opens the "record submission proof" dialog — marking done is gated on proof. */
  onRecord: () => void;
  /** Clears the *DoneAt stamp (reopen). */
  onReopen: () => void;
  disabled?: boolean;
  readOnly?: boolean;
  testId?: string;
  alertHistory?: ConformityAlertStageHistory;
  alertPolicy?: Pick<ConformityIncidentAlertHistory, "maxReminders" | "reminderIntervalHours">;
}) {
  const done = !!doneAt;
  const overdue = !done && new Date(dueAt).getTime() < Date.now();
  return (
    <div
      data-testid={testId}
      className={cn(
        "flex items-center justify-between gap-2 p-2 border text-xs",
        done
          ? "border-green-500/30 bg-green-500/5"
          : overdue
            ? "border-red-500/30 bg-red-500/5"
            : "border-border",
      )}
    >
      <div className="min-w-0">
        <div className="font-medium flex items-center gap-1">
          {done ? (
            <CheckCircle2 className="w-3 h-3 text-green-600" />
          ) : (
            <Clock className={cn("w-3 h-3", overdue ? "text-red-600" : "text-muted-foreground")} />
          )}
          {label}
        </div>
        <div className="text-[10px] text-muted-foreground font-mono">
          {done ? `Done ${formatDateTime(doneAt)}` : `Due ${formatDateTime(dueAt)}`}
          {overdue && " · overdue"}
        </div>
        {anchorNote && (
          <div className="text-[10px] text-muted-foreground mt-0.5">{anchorNote}</div>
        )}
        {!done && overdue && alertPolicy && (
          <AlertStatusLine history={alertHistory} policy={alertPolicy} testId={testId} />
        )}
      </div>
      {!readOnly && (
        <Button
          size="sm"
          variant={done ? "outline" : "default"}
          className="rounded-md h-7 text-[11px] shrink-0"
          disabled={disabled}
          onClick={() => (done ? onReopen() : onRecord())}
        >
          {done ? "Reopen" : "Record submission…"}
        </Button>
      )}
    </div>
  );
}

const SUBMISSION_STAGE_LABELS: Record<CreateIncidentSubmissionInput["stage"], string> = {
  early_warning: "Early warning (24h)",
  notification: "Notification (72h)",
  final_report: "Final report",
};

/**
 * Record an Article 14 submission proof. Marking a reporting stage done is
 * gated server-side on a proof existing for that stage; recording one
 * auto-stamps the matching *DoneAt (and re-anchors the severe-track final
 * report to submission + one calendar month). Corrections are new rows.
 */
function RecordSubmissionDialog({
  incident,
  stage,
  open,
  onOpenChange,
}: {
  incident: ConformityIncident;
  stage: CreateIncidentSubmissionInput["stage"];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const qc = useQueryClient();
  const [submittedAt, setSubmittedAt] = useState(() =>
    toDateTimeLocal(new Date().toISOString()),
  );
  const [channel, setChannel] = useState("srp");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");

  const create = useCreateIncidentSubmission({
    mutation: {
      onSuccess: () => {
        // Recording a proof auto-stamps the stage's DoneAt (and re-anchors the
        // severe-track final-report deadline), so refresh the incidents list.
        qc.invalidateQueries();
        toast.success("Submission proof recorded.");
        onOpenChange(false);
      },
      onError: (err) =>
        toast.error(
          serverErrorMessage(err, "Could not record the submission. Try again."),
        ),
    },
  });

  // submittedAt must be >= detectedAt and not in the future (mirrors the server).
  const submittedProblem = (() => {
    if (!submittedAt) return "Enter the date and time the report was submitted.";
    const t = new Date(submittedAt).getTime();
    if (Number.isNaN(t)) return "Enter a valid date and time.";
    if (t < new Date(incident.detectedAt).getTime()) {
      return "Submission can't be before the incident was detected.";
    }
    if (t - Date.now() > DETECTED_MAX_FUTURE_MS) {
      return "Submission time is in the future — check the date.";
    }
    return null;
  })();

  const submit = () => {
    if (submittedProblem) return;
    create.mutate({
      id: incident.id,
      data: {
        stage,
        submittedAt: new Date(submittedAt).toISOString(),
        channel: channel.trim() || "srp",
        reference: reference.trim(),
        notes: notes.trim(),
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-md max-w-md">
        <DialogHeader>
          <DialogTitle>Record submission proof</DialogTitle>
          <DialogDescription>
            {SUBMISSION_STAGE_LABELS[stage]} — log the actual Article 14 submission to the
            CSIRT/ENISA single reporting platform. This stamps the stage done; corrections are
            recorded as new entries.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <FormField label="Submitted at">
            <Input
              type="datetime-local"
              className={cn(
                "rounded-md",
                submittedProblem && "border-red-500 focus-visible:ring-red-500",
              )}
              data-testid={`incident-submission-submitted-at-${incident.id}`}
              value={submittedAt}
              onChange={(e) => setSubmittedAt(e.target.value)}
            />
            {submittedProblem && (
              <p className="text-[11px] text-red-600">{submittedProblem}</p>
            )}
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Channel">
              <Input
                className="rounded-md"
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                placeholder="srp"
              />
            </FormField>
            <FormField label="Reference">
              <Input
                className="rounded-md"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Submission ID / ticket"
              />
            </FormField>
          </div>
          <FormField label="Notes">
            <Textarea
              className="rounded-md"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Anything worth recording about this submission"
            />
          </FormField>
        </div>
        <DialogFooter>
          <Button variant="outline" className="rounded-md" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="rounded-md"
            onClick={submit}
            disabled={create.isPending || !!submittedProblem}
            data-testid={`incident-submission-save-${incident.id}`}
          >
            Record submission
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Append-only ledger of recorded Article 14 submission proofs, newest first. */
function SubmissionsLedger({ incidentId }: { incidentId: number }) {
  const { data: submissions, isLoading } = useListIncidentSubmissions(incidentId);
  const list = submissions ?? [];
  const ordered = [...list].sort(
    (a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime(),
  );

  return (
    <div className="space-y-2" data-testid={`incident-submissions-${incidentId}`}>
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <History className="w-3 h-3" /> Submission proofs (Article 14)
      </div>
      {isLoading && <Skeleton className="h-10 w-full" />}
      {!isLoading && ordered.length === 0 && (
        <p className="text-[11px] text-muted-foreground">
          No submissions recorded yet. Record a submission on a reporting stage above to mark it
          done.
        </p>
      )}
      {!isLoading && ordered.length > 0 && (
        <ul className="divide-y divide-border border border-border">
          {ordered.map((s: IncidentSubmission) => (
            <li
              key={s.id}
              className="p-2 text-xs flex flex-wrap items-center justify-between gap-2"
              data-testid={`incident-submission-row-${s.id}`}
            >
              <div className="min-w-0">
                <div className="font-medium flex items-center gap-1.5">
                  <FileCheck2 className="w-3 h-3 text-green-600 shrink-0" />
                  {SUBMISSION_STAGE_LABELS[s.stage]}
                  {s.supersedes != null && (
                    <Badge
                      variant="outline"
                      className="rounded-md text-[10px] bg-amber-500/10 text-amber-600 border-amber-500/30"
                    >
                      correction
                    </Badge>
                  )}
                </div>
                <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                  {formatDateTime(s.submittedAt)} · {s.channel}
                  {s.reference && ` · ${s.reference}`}
                  {s.recordedBy && ` · by ${s.recordedBy.split(":").pop()}`}
                </div>
                {s.notes && (
                  <p className="text-[11px] text-muted-foreground mt-0.5">{s.notes}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Stage-scoped Article 14 report content (what the SRP notification requires). */
function ReportContentEditor({
  incident,
  onSave,
  saving,
  readOnly,
}: {
  incident: ConformityIncident;
  onSave: (data: Record<string, string | boolean>) => void;
  saving: boolean;
  readOnly?: boolean;
}) {
  const severe = isSevere(incident);
  const [memberStates, setMemberStates] = useState(incident.memberStates);
  const [exploitNature, setExploitNature] = useState(incident.exploitNature);
  const [correctiveMeasures, setCorrectiveMeasures] = useState(incident.correctiveMeasures);
  const [userMitigations, setUserMitigations] = useState(incident.userMitigations);
  const [threatActorInfo, setThreatActorInfo] = useState(incident.threatActorInfo);
  const [suspectedMalicious, setSuspectedMalicious] = useState(incident.suspectedMalicious);
  const [sensitive, setSensitive] = useState(incident.sensitive);

  return (
    <div className="space-y-3 border border-border p-3" data-testid={`incident-report-content-${incident.id}`}>
      <div className="grid sm:grid-cols-2 gap-3">
        <FormField label="EU member states affected" className="space-y-1" labelClassName="text-xs">
          <Input
            className="rounded-md h-8 text-xs"
            value={memberStates}
            placeholder="e.g. NL, DE, FR — or 'all'"
            onChange={(e) => setMemberStates(e.target.value)}
          />
        </FormField>
        <FormField label="Known threat-actor information" className="space-y-1" labelClassName="text-xs">
          <Input
            className="rounded-md h-8 text-xs"
            value={threatActorInfo}
            placeholder="Where available"
            onChange={(e) => setThreatActorInfo(e.target.value)}
          />
        </FormField>
      </div>
      <FormField
        label={
          severe
            ? "Nature of the incident (incl. severity and impact)"
            : "Nature of the exploit and the vulnerability"
        }
        className="space-y-1"
        labelClassName="text-xs"
      >
        <Textarea
          className="rounded-md text-xs min-h-16"
          value={exploitNature}
          onChange={(e) => setExploitNature(e.target.value)}
        />
      </FormField>
      <div className="grid sm:grid-cols-2 gap-3">
        <FormField label="Corrective / mitigating measures taken" className="space-y-1" labelClassName="text-xs">
          <Textarea
            className="rounded-md text-xs min-h-16"
            value={correctiveMeasures}
            onChange={(e) => setCorrectiveMeasures(e.target.value)}
          />
        </FormField>
        <FormField label="Mitigations users can apply" className="space-y-1" labelClassName="text-xs">
          <Textarea
            className="rounded-md text-xs min-h-16"
            value={userMitigations}
            onChange={(e) => setUserMitigations(e.target.value)}
          />
        </FormField>
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        {severe && (
          <label className="flex items-center gap-2 text-xs">
            <Checkbox
              checked={suspectedMalicious}
              onCheckedChange={(v) => setSuspectedMalicious(v === true)}
            />
            Suspected malicious or unlawful cause
          </label>
        )}
        <label className="flex items-center gap-2 text-xs">
          <Checkbox checked={sensitive} onCheckedChange={(v) => setSensitive(v === true)} />
          Information is highly sensitive
        </label>
        {!readOnly && (
          <Button
            size="sm"
            className="rounded-md h-7 text-[11px] ml-auto"
            disabled={saving}
            data-testid={`incident-save-content-${incident.id}`}
            onClick={() =>
              onSave({
                memberStates,
                exploitNature,
                correctiveMeasures,
                userMitigations,
                threatActorInfo,
                suspectedMalicious,
                sensitive,
              })
            }
          >
            Save report content
          </Button>
        )}
      </div>
    </div>
  );
}

function IncidentCard({
  incident,
  alertHistory,
}: {
  incident: ConformityIncident;
  alertHistory?: ConformityIncidentAlertHistory;
}) {
  const qc = useQueryClient();
  const { data: session } = useGetAdminSession();
  const readOnly = session?.role === "demo";
  const [showContent, setShowContent] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [recordStage, setRecordStage] =
    useState<CreateIncidentSubmissionInput["stage"] | null>(null);
  const [correctiveDraft, setCorrectiveDraft] = useState(() =>
    incident.correctiveAvailableAt ? toDateTimeLocal(incident.correctiveAvailableAt) : "",
  );
  const [correctiveProblem, setCorrectiveProblem] = useState<string | null>(null);
  const update = useUpdateConformityIncident({
    mutation: {
      onSuccess: () => qc.invalidateQueries(),
      onError: (err) =>
        toast.error(serverErrorMessage(err, "Could not update the incident. Try again.")),
    },
  });
  const remove = useDeleteConformityIncident({
    mutation: { onSuccess: () => qc.invalidateQueries() },
  });

  const patch = (data: Parameters<typeof update.mutate>[0]["data"]) =>
    update.mutate({ id: incident.id, data });

  const severe = isSevere(incident);
  const finalAnchor = finalReportAnchor(incident);

  const alertPolicy = alertHistory?.alertsEnabled
    ? {
        maxReminders: alertHistory.maxReminders,
        reminderIntervalHours: alertHistory.reminderIntervalHours,
      }
    : undefined;
  const stageHistory = (stage: ConformityAlertStageHistory["stage"]) =>
    alertHistory?.stages?.find((s) => s.incidentId === incident.id && s.stage === stage);

  const exportPackage = async () => {
    setExporting(true);
    try {
      const pkg = await getConformityIncidentReportPackage(incident.id);
      const ok = printIncidentReport(
        {
          productName: pkg.productName || pkg.title,
          regulationLabel: "CRA — Regulation (EU) 2024/2847, Article 14",
          stageLabel: pkg.kindLabel,
        },
        pkg,
      );
      if (!ok) toast.error(POPUP_BLOCKED);
    } catch {
      toast.error("Could not assemble the report package. Try again.");
    } finally {
      setExporting(false);
    }
  };

  const exportEnisaJson = async () => {
    setExporting(true);
    try {
      const pkg = await getConformityIncidentReportPackage(incident.id);
      downloadEnisaSubmission(pkg);
    } catch {
      toast.error("Could not assemble the ENISA submission file. Try again.");
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card className="rounded-md" data-testid={`incident-card-${incident.id}`}>
      <CardHeader className="border-b border-border">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-primary shrink-0" />
              {incident.title}
            </CardTitle>
            {incident.description && (
              <p className="text-sm text-muted-foreground mt-1">{incident.description}</p>
            )}
            <div className="text-[10px] text-muted-foreground font-mono mt-1">
              Detected {formatDateTime(incident.detectedAt)}
            </div>
            {incident.sourceVulnerabilityId && (
              <Badge
                variant="outline"
                className="rounded-md mt-2 text-[10px] font-mono max-w-full"
                data-testid={`incident-source-${incident.id}`}
                title="The BOM vulnerability finding this incident was reported from"
              >
                <span className="truncate">
                  From {incident.sourceVulnerabilityId}
                  {incident.sourceComponent ? ` · ${incident.sourceComponent}` : ""}
                </span>
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge
              variant="outline"
              className="rounded-md"
              data-testid={`incident-kind-${incident.id}`}
            >
              {labelFor(INCIDENT_KIND_OPTIONS, incident.kind)}
            </Badge>
            <Badge variant="outline" className={cn("rounded-md", riskClass(incident.severity))}>
              {labelFor(SEVERITY_OPTIONS, incident.severity)}
            </Badge>
            {!readOnly && (
              <Button
                size="icon"
                variant="ghost"
                className="rounded-md text-muted-foreground hover:text-destructive"
                onClick={() => remove.mutate({ id: incident.id })}
                disabled={remove.isPending}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div className="grid sm:grid-cols-3 gap-2">
          <Deadline
            label="Early warning (24h)"
            anchorNote="24 hours after becoming aware"
            dueAt={incident.earlyWarningDueAt}
            doneAt={incident.earlyWarningDoneAt}
            disabled={update.isPending}
            readOnly={readOnly}
            testId={`incident-early-warning-${incident.id}`}
            alertHistory={stageHistory("early_warning")}
            alertPolicy={alertPolicy}
            onRecord={() => setRecordStage("early_warning")}
            onReopen={() => patch({ earlyWarningDoneAt: null })}
          />
          <Deadline
            label="Notification (72h)"
            anchorNote={
              severe
                ? "72 hours after awareness — anchors the final report once submitted"
                : "72 hours after becoming aware"
            }
            dueAt={incident.notificationDueAt}
            doneAt={incident.notificationDoneAt}
            disabled={update.isPending}
            readOnly={readOnly}
            testId={`incident-notification-${incident.id}`}
            alertHistory={stageHistory("notification")}
            alertPolicy={alertPolicy}
            onRecord={() => setRecordStage("notification")}
            onReopen={() => patch({ notificationDoneAt: null })}
          />
          <Deadline
            label={finalAnchor.label}
            anchorNote={finalAnchor.anchorNote}
            dueAt={incident.finalReportDueAt}
            doneAt={incident.finalReportDoneAt}
            disabled={update.isPending}
            readOnly={readOnly}
            testId={`incident-final-report-${incident.id}`}
            alertHistory={stageHistory("final_report")}
            alertPolicy={alertPolicy}
            onRecord={() => setRecordStage("final_report")}
            onReopen={() => patch({ finalReportDoneAt: null })}
          />
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <FormField label="Status" className="flex items-center gap-2" labelClassName="text-xs text-muted-foreground">
            {(id) => (
              <Select value={incident.status} onValueChange={(v) => patch({ status: v })} disabled={readOnly}>
                <SelectTrigger id={id} className="rounded-md h-8 w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INCIDENT_STATUS_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </FormField>
          <FormField label="Track" className="flex items-center gap-2" labelClassName="text-xs text-muted-foreground">
            {(id) => (
              <Select value={incident.kind} onValueChange={(v) => patch({ kind: v as ConformityIncident["kind"] })} disabled={readOnly}>
                <SelectTrigger
                  id={id}
                  className="rounded-md h-8 w-64"
                  data-testid={`incident-kind-select-${incident.id}`}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INCIDENT_KIND_OPTIONS.map((o) => (
                    <SelectItem key={o.value} value={o.value}>
                      {o.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </FormField>
          <FormField label="Owner" className="flex items-center gap-2" labelClassName="text-xs text-muted-foreground">
            {(id) => (
              <div className="w-48" data-testid={`incident-owner-${incident.id}`}>
                <OwnerSelect
                  id={id}
                  value={incident.owner ?? ""}
                  onChange={(owner) => patch({ owner })}
                  testId={`incident-owner-select-${incident.id}`}
                  disabled={readOnly}
                />
              </div>
            )}
          </FormField>
        </div>
        {!severe && (
          <div className="space-y-1">
            <FormField
              label="Corrective measure available since"
              className="flex items-center gap-2"
              labelClassName="text-xs text-muted-foreground shrink-0"
            >
              {(id) => (
                <>
                  <Input
                    id={id}
                    type="datetime-local"
                    disabled={readOnly}
                    className={cn(
                      "rounded-md h-8 w-56 text-xs",
                      correctiveProblem && "border-red-500 focus-visible:ring-red-500",
                    )}
                    data-testid={`incident-corrective-available-${incident.id}`}
                    value={correctiveDraft}
                    onChange={(e) => {
                      const v = e.target.value;
                      setCorrectiveDraft(v);
                      const problem = v
                        ? anchorDateProblem(new Date(v).toISOString(), incident.detectedAt)
                        : null;
                      setCorrectiveProblem(problem);
                      if (!problem) {
                        patch({
                          correctiveAvailableAt: v ? new Date(v).toISOString() : null,
                        });
                      }
                    }}
                  />
                  <span className="text-[10px] text-muted-foreground">
                    Setting this re-anchors the final report to fix-available + 14 days.
                  </span>
                </>
              )}
            </FormField>
            {correctiveProblem && (
              <p
                className="text-[11px] text-red-600"
                data-testid={`incident-corrective-available-error-${incident.id}`}
              >
                {correctiveProblem} The final-report deadline was not changed.
              </p>
            )}
          </div>
        )}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="rounded-md h-7 text-[11px]"
            onClick={() => setShowContent((v) => !v)}
            data-testid={`incident-toggle-content-${incident.id}`}
          >
            {showContent ? (
              <ChevronDown className="w-3 h-3 mr-1" />
            ) : (
              <ChevronRight className="w-3 h-3 mr-1" />
            )}
            Article 14 report content
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="rounded-md h-7 text-[11px]"
            onClick={exportPackage}
            disabled={exporting}
            data-testid={`incident-export-${incident.id}`}
          >
            <FileDown className="w-3 h-3 mr-1" /> Export report package
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="rounded-md h-7 text-[11px]"
            onClick={exportEnisaJson}
            disabled={exporting}
            data-testid={`incident-export-enisa-${incident.id}`}
            title="Download the report package as structured JSON matching the ENISA single-reporting-platform submission stages (Art 16 CRA)"
          >
            <FileDown className="w-3 h-3 mr-1" /> ENISA JSON
          </Button>
        </div>
        {showContent && (
          <ReportContentEditor
            incident={incident}
            saving={update.isPending}
            onSave={(data) => patch(data)}
            readOnly={readOnly}
          />
        )}
        <SubmissionsLedger incidentId={incident.id} />
      </CardContent>
      {recordStage && (
        <RecordSubmissionDialog
          incident={incident}
          stage={recordStage}
          open={recordStage !== null}
          onOpenChange={(open) => {
            if (!open) setRecordStage(null);
          }}
        />
      )}
    </Card>
  );
}

/**
 * Pre-fill payload for reporting an incident from a known vulnerability
 * finding (BOM/findings context). Everything stays editable in the dialog —
 * this only seeds the initial values so nothing has to be re-typed under the
 * 24h clock.
 */
export interface IncidentPrefill {
  title?: string;
  description?: string;
  severity?: string;
  exploitNature?: string;
  /** Structured origin: the vulnerability (e.g. CVE) the incident came from. */
  sourceVulnerabilityId?: string;
  /** Structured origin: the affected component ("name@version"). */
  sourceComponent?: string;
}

const VALID_SEVERITIES = new Set(SEVERITY_OPTIONS.map((o) => o.value as string));

export function CreateIncidentDialog({
  assessmentId,
  prefill,
  trigger,
}: {
  assessmentId: number;
  prefill?: IncidentPrefill;
  trigger?: React.ReactNode;
}) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const create = useCreateConformityIncident({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries();
        setOpen(false);
      },
      onError: (err) =>
        toast.error(serverErrorMessage(err, "Could not report the incident. Try again.")),
    },
  });

  const [title, setTitle] = useState(prefill?.title ?? "");
  const [description, setDescription] = useState(prefill?.description ?? "");
  const [kind, setKind] = useState<"exploited_vulnerability" | "severe_incident">(
    "exploited_vulnerability",
  );
  const [severity, setSeverity] = useState(
    prefill?.severity && VALID_SEVERITIES.has(prefill.severity) ? prefill.severity : "high",
  );
  const [owner, setOwner] = useState("");
  const [detectedAt, setDetectedAt] = useState(() => toDateTimeLocal(new Date().toISOString()));
  const [detectedProblem, setDetectedProblem] = useState<string | null>(null);
  // When exploit-nature text is pre-filled, surface the report-content section
  // immediately so the user can see (and adjust) what was carried over.
  const [showReportContent, setShowReportContent] = useState(!!prefill?.exploitNature);
  const [memberStates, setMemberStates] = useState("");
  const [exploitNature, setExploitNature] = useState(prefill?.exploitNature ?? "");
  const [correctiveMeasures, setCorrectiveMeasures] = useState("");
  const [userMitigations, setUserMitigations] = useState("");
  const [threatActorInfo, setThreatActorInfo] = useState("");
  const [suspectedMalicious, setSuspectedMalicious] = useState(false);
  const [sensitive, setSensitive] = useState(false);

  const severe = kind === "severe_incident";

  const submit = () => {
    if (!title.trim() || !detectedAt) return;
    const problem = detectedAtProblem(new Date(detectedAt).toISOString());
    setDetectedProblem(problem);
    if (problem) return;
    create.mutate({
      id: assessmentId,
      data: {
        title: title.trim(),
        description: description.trim(),
        kind,
        severity,
        owner,
        detectedAt: new Date(detectedAt).toISOString(),
        memberStates,
        exploitNature,
        correctiveMeasures,
        userMitigations,
        threatActorInfo,
        suspectedMalicious: severe ? suspectedMalicious : false,
        sensitive,
        // Structured provenance from the originating BOM finding ("" when the
        // incident is reported manually) — shown as a chip on the card.
        sourceVulnerabilityId: prefill?.sourceVulnerabilityId ?? "",
        sourceComponent: prefill?.sourceComponent ?? "",
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button className="rounded-md shrink-0">
            <Plus className="w-4 h-4 mr-2" /> Report incident
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="rounded-md max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Report an incident</DialogTitle>
          <DialogDescription>
            Article 14 CRA — pick the reporting track; the 24h/72h clocks start at detection, the
            final report anchors per track.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <FormField label="Reporting track">
            {(id) => (
              <>
                <Select value={kind} onValueChange={(v) => setKind(v as typeof kind)}>
                  <SelectTrigger id={id} className="rounded-md" data-testid="incident-create-kind">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INCIDENT_KIND_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">
                  {kind === "severe_incident"
                    ? "Final report due 1 calendar month after the 72h notification is submitted."
                    : "Final report due 14 days after a corrective measure becomes available."}
                </p>
              </>
            )}
          </FormField>
          <FormField label="Title">
            <Input
              className="rounded-md"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Short incident title"
            />
          </FormField>
          <FormField label="Description">
            <Textarea
              className="rounded-md"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Severity">
              {(id) => (
                <Select value={severity} onValueChange={setSeverity}>
                  <SelectTrigger id={id} className="rounded-md">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SEVERITY_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </FormField>
            <FormField label="Detected at">
              <Input
                type="datetime-local"
                className={cn(
                  "rounded-md",
                  detectedProblem && "border-red-500 focus-visible:ring-red-500",
                )}
                data-testid="incident-create-detected-at"
                value={detectedAt}
                onChange={(e) => {
                  const v = e.target.value;
                  setDetectedAt(v);
                  setDetectedProblem(
                    v ? detectedAtProblem(new Date(v).toISOString()) : null,
                  );
                }}
              />
              {detectedProblem && (
                <p
                  className="text-[11px] text-red-600"
                  data-testid="incident-create-detected-at-error"
                >
                  {detectedProblem} The 24h/72h and final-report deadlines all start from this
                  time.
                </p>
              )}
            </FormField>
            <FormField label="Owner">
              {(id) => (
                <OwnerSelect id={id} value={owner} onChange={setOwner} testId="incident-create-owner" />
              )}
            </FormField>
          </div>
          <div className="space-y-3">
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="rounded-md h-7 text-[11px]"
              onClick={() => setShowReportContent((v) => !v)}
              data-testid="incident-create-toggle-content"
            >
              {showReportContent ? (
                <ChevronDown className="w-3 h-3 mr-1" />
              ) : (
                <ChevronRight className="w-3 h-3 mr-1" />
              )}
              Article 14 report content (optional)
            </Button>
            {showReportContent && (
              <div
                className="space-y-3 border border-border p-3"
                data-testid="incident-create-report-content"
              >
                <p className="text-[11px] text-muted-foreground">
                  Filling this now lets the early warning export complete immediately. You can also
                  edit it later from the incident card.
                </p>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">EU member states affected</Label>
                    <Input
                      className="rounded-md h-8 text-xs"
                      value={memberStates}
                      placeholder="e.g. NL, DE, FR — or 'all'"
                      onChange={(e) => setMemberStates(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Known threat-actor information</Label>
                    <Input
                      className="rounded-md h-8 text-xs"
                      value={threatActorInfo}
                      placeholder="Where available"
                      onChange={(e) => setThreatActorInfo(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">
                    {severe
                      ? "Nature of the incident (incl. severity and impact)"
                      : "Nature of the exploit and the vulnerability"}
                  </Label>
                  <Textarea
                    className="rounded-md text-xs min-h-16"
                    value={exploitNature}
                    onChange={(e) => setExploitNature(e.target.value)}
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs">Corrective / mitigating measures taken</Label>
                    <Textarea
                      className="rounded-md text-xs min-h-16"
                      value={correctiveMeasures}
                      onChange={(e) => setCorrectiveMeasures(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Mitigations users can apply</Label>
                    <Textarea
                      className="rounded-md text-xs min-h-16"
                      value={userMitigations}
                      onChange={(e) => setUserMitigations(e.target.value)}
                    />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                  {severe && (
                    <label className="flex items-center gap-2 text-xs">
                      <Checkbox
                        checked={suspectedMalicious}
                        onCheckedChange={(v) => setSuspectedMalicious(v === true)}
                        data-testid="incident-create-suspected-malicious"
                      />
                      Suspected malicious or unlawful cause
                    </label>
                  )}
                  <label className="flex items-center gap-2 text-xs">
                    <Checkbox
                      checked={sensitive}
                      onCheckedChange={(v) => setSensitive(v === true)}
                    />
                    Information is highly sensitive
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" className="rounded-md" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            className="rounded-md"
            onClick={submit}
            disabled={create.isPending || !title.trim() || !detectedAt || !!detectedProblem}
          >
            Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function IncidentsPanel({ assessmentId }: { assessmentId: number }) {
  const { data: session } = useGetAdminSession();
  const readOnly = session?.role === "demo";
  const { data: incidents, isLoading } = useListConformityIncidents(assessmentId);
  const { data: alertHistory } = useGetConformityIncidentAlertHistory(assessmentId);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm text-muted-foreground max-w-2xl">
          Track both Article 14 reporting tracks: early warning within 24 hours and notification
          within 72 hours of awareness. The final report is due 14 days after a corrective measure
          becomes available (actively exploited vulnerability) or one calendar month
          after the notification (severe incident).
        </p>
        {!readOnly && <CreateIncidentDialog assessmentId={assessmentId} />}
      </div>

      {isLoading && <Skeleton className="h-40 w-full" />}

      {!isLoading && (incidents?.length ?? 0) === 0 && (
        <Card className="rounded-md">
          <CardContent className="p-10 text-center text-muted-foreground">
            No incidents reported.
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {incidents?.map((incident) => (
          <IncidentCard key={incident.id} incident={incident} alertHistory={alertHistory} />
        ))}
      </div>
    </div>
  );
}
