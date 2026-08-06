import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListConformityEvaluations,
  useUpdateConformityEvaluation,
  useListConformityEvidence,
  getListConformityEvidenceQueryKey,
  useAddConformityEvidence,
  useDeleteConformityEvidence,
  useListConformityTeam,
} from "@workspace/api-client-react";
import type { ConformityEvaluation } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormField } from "@/components/ui/form-field";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  EVAL_STATUS_OPTIONS,
  RISK_OPTIONS,
  EVIDENCE_TYPE_OPTIONS,
  evalStatusClass,
  riskClass,
  evidenceTypeClass,
  labelFor,
  formatDateTime,
} from "@/lib/conformity";
import { Paperclip, Pencil, Trash2, ExternalLink, Link2, Upload, FileText, X } from "lucide-react";
import { uploadFile, validateUploadFile } from "@/lib/upload";
import { OwnerSelect } from "@/components/conformity/owner-select";

const NONE = "__none__";

function EditDialog({
  evaluation,
  open,
  onOpenChange,
}: {
  evaluation: ConformityEvaluation;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const qc = useQueryClient();
  const update = useUpdateConformityEvaluation({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries();
        onOpenChange(false);
      },
    },
  });

  const [status, setStatus] = useState(evaluation.status);
  const [risk, setRisk] = useState(evaluation.riskRating ?? NONE);
  const [owner, setOwner] = useState(evaluation.owner);
  const [dueDate, setDueDate] = useState(evaluation.dueDate ?? "");
  const [note, setNote] = useState(evaluation.implementationNote);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-md max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-mono text-base">{evaluation.requirementRefCode}</DialogTitle>
          <DialogDescription>{evaluation.title}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Status">
              {(id) => (
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id={id} className="rounded-md">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVAL_STATUS_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </FormField>
            <FormField label="Risk rating">
              {(id) => (
                <Select value={risk} onValueChange={setRisk}>
                  <SelectTrigger id={id} className="rounded-md">
                    <SelectValue placeholder="None" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>None</SelectItem>
                    {RISK_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </FormField>
            <FormField label="Owner">
              {(id) => <OwnerSelect id={id} value={owner} onChange={setOwner} />}
            </FormField>
            <FormField label="Due date">
              <Input
                type="date"
                className="rounded-md"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </FormField>
          </div>
          <FormField label="Implementation note">
            <Textarea
              className="rounded-md min-h-24"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="How this requirement is met, evidence references, residual gaps…"
            />
          </FormField>
        </div>
        <DialogFooter>
          <Button variant="outline" className="rounded-md" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="rounded-md"
            disabled={update.isPending}
            onClick={() =>
              update.mutate({
                id: evaluation.id,
                data: {
                  status,
                  riskRating: risk === NONE ? null : risk,
                  owner,
                  dueDate: dueDate || null,
                  implementationNote: note,
                },
              })
            }
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EvidenceDialog({
  assessmentId,
  evaluation,
  open,
  onOpenChange,
}: {
  assessmentId: number;
  evaluation: ConformityEvaluation;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const qc = useQueryClient();
  const { data: evidence, isLoading } = useListConformityEvidence(assessmentId, {
    query: { enabled: open, queryKey: getListConformityEvidenceQueryKey(assessmentId) },
  });
  const add = useAddConformityEvidence({ mutation: { onSuccess: () => qc.invalidateQueries() } });
  const remove = useDeleteConformityEvidence({
    mutation: { onSuccess: () => qc.invalidateQueries() },
  });

  const [title, setTitle] = useState("");
  const [evidenceType, setEvidenceType] = useState("document");
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const [file, setFile] = useState<{ objectPath: string; fileName: string } | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const items = useMemo(
    () => (evidence ?? []).filter((e) => e.requirementRefCode === evaluation.requirementRefCode),
    [evidence, evaluation.requirementRefCode],
  );

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file after removal
    if (!picked) return;
    setUploadError(null);
    // Fail loudly on unsupported / oversized files before any network round-trip.
    const rejection = validateUploadFile(picked);
    if (rejection) {
      setUploadError(rejection);
      return;
    }
    setUploading(true);
    try {
      const result = await uploadFile(picked);
      setFile({ objectPath: result.objectPath, fileName: result.fileName });
      if (!title.trim()) setTitle(result.fileName);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const resetForm = () => {
    setTitle("");
    setEvidenceType("document");
    setUrl("");
    setNote("");
    setFile(null);
    setUploadError(null);
  };

  const submit = () => {
    if (!title.trim()) return;
    add.mutate(
      {
        id: assessmentId,
        data: {
          requirementRefCode: evaluation.requirementRefCode,
          title: title.trim(),
          evidenceType,
          url: url.trim(),
          objectPath: file?.objectPath ?? "",
          fileName: file?.fileName ?? "",
          note: note.trim(),
        },
      },
      {
        onSuccess: resetForm,
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-md max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-base">Evidence</DialogTitle>
          <DialogDescription className="font-mono text-xs">
            {evaluation.requirementRefCode} — {evaluation.title}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 max-h-56 overflow-y-auto">
          {isLoading && <Skeleton className="h-16 w-full" />}
          {!isLoading && items.length === 0 && (
            <p className="text-sm text-muted-foreground">No evidence linked yet.</p>
          )}
          {items.map((e) => (
            <div key={e.id} className="flex items-start justify-between gap-3 p-3 border border-border rounded-md">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium truncate">{e.title}</span>
                  <Badge
                    variant="outline"
                    className={cn("rounded-md text-[10px] shrink-0", evidenceTypeClass(e.evidenceType))}
                  >
                    {labelFor(EVIDENCE_TYPE_OPTIONS, e.evidenceType)}
                  </Badge>
                </div>
                {e.note && <div className="text-xs text-muted-foreground">{e.note}</div>}
                <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                  {formatDateTime(e.createdAt)}
                </div>
                {e.fileHash && (
                  <div
                    className="text-[10px] text-muted-foreground font-mono mt-0.5"
                    title={`SHA-256: ${e.fileHash}`}
                  >
                    sha256:{e.fileHash.slice(0, 12)}…
                  </div>
                )}
                {e.objectPath ? (
                  <a
                    href={`/api/conformity/evidence/${e.id}/download`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs inline-flex items-center gap-1 text-primary hover:underline mt-1"
                  >
                    <FileText className="w-3 h-3" /> {e.fileName || "Download file"}
                  </a>
                ) : e.url ? (
                  <a
                    href={e.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs inline-flex items-center gap-1 text-primary hover:underline mt-1"
                  >
                    <ExternalLink className="w-3 h-3" /> Open
                  </a>
                ) : null}
              </div>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-md shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => remove.mutate({ id: e.id })}
                disabled={remove.isPending}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="space-y-2 border-t border-border pt-4">
          <Label className="text-xs uppercase tracking-wide text-muted-foreground">
            Link new evidence
          </Label>
          <FormField label="Type" labelClassName="text-xs text-muted-foreground">
            {(id) => (
              <>
                <Select value={evidenceType} onValueChange={setEvidenceType}>
                  <SelectTrigger id={id} className="rounded-md">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {EVIDENCE_TYPE_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">
                  Tag an SBOM or test report so it completes the matching documentation section.
                </p>
              </>
            )}
          </FormField>
          <Input
            className="rounded-md"
            placeholder="Title (e.g. SBOM export, pen-test report)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          {file ? (
            <div className="flex items-center justify-between gap-2 p-2 border border-border rounded-md text-sm">
              <span className="inline-flex items-center gap-2 min-w-0">
                <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="truncate">{file.fileName}</span>
              </span>
              <Button
                size="icon"
                variant="ghost"
                className="rounded-md shrink-0 h-6 w-6 text-muted-foreground hover:text-destructive"
                onClick={() => setFile(null)}
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                asChild
                variant="outline"
                className="rounded-md w-full cursor-pointer"
                disabled={uploading}
              >
                <label>
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? "Uploading…" : "Upload a file (PDF, doc, image)"}
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.webp,.json,.txt,.csv,.xml"
                    onChange={onPickFile}
                    disabled={uploading}
                  />
                </label>
              </Button>
            </div>
          )}
          {uploadError && <p className="text-xs text-destructive">{uploadError}</p>}
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-muted-foreground shrink-0" />
            <Input
              className="rounded-md"
              placeholder="https://… (or paste a link instead)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
          <Input
            className="rounded-md"
            placeholder="Note (optional)"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <Button
            className="rounded-md w-full"
            onClick={submit}
            disabled={add.isPending || uploading || !title.trim()}
          >
            <Paperclip className="w-4 h-4 mr-2" /> Attach evidence
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function GapWorklist({ assessmentId }: { assessmentId: number }) {
  const { data: evaluations, isLoading } = useListConformityEvaluations(assessmentId);
  // Owners are stored as member usernames; show display names where we can.
  const { data: team } = useListConformityTeam();
  const ownerName = (username: string) =>
    team?.find((m) => m.username === username)?.displayName ?? username;
  const [editing, setEditing] = useState<ConformityEvaluation | null>(null);
  const [evidenceFor, setEvidenceFor] = useState<ConformityEvaluation | null>(null);

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }

  if (!evaluations || evaluations.length === 0) {
    return (
      <Card className="rounded-md">
        <CardContent className="p-10 text-center text-muted-foreground">
          No requirements yet. Complete the wizard and build the requirement checklist.
        </CardContent>
      </Card>
    );
  }

  const counts = EVAL_STATUS_OPTIONS.map((o) => ({
    ...o,
    count: evaluations.filter((e) => e.status === o.value).length,
  }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {counts.map((c) => (
          <Badge
            key={c.value}
            variant="outline"
            className={cn("rounded-md font-mono", c.count > 0 && evalStatusClass(c.value))}
          >
            {c.label}: {c.count}
          </Badge>
        ))}
      </div>

      {/* Desktop / tablet: table */}
      <Card className="rounded-md hidden md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-24">Ref</TableHead>
              <TableHead>Requirement</TableHead>
              <TableHead className="w-32">Theme</TableHead>
              <TableHead className="w-28">Status</TableHead>
              <TableHead className="w-20">Risk</TableHead>
              <TableHead className="w-28">Owner</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {evaluations.map((e) => (
              <TableRow key={e.id}>
                <TableCell className="font-mono text-xs align-top">{e.requirementRefCode}</TableCell>
                <TableCell className="align-top">
                  <div className="text-sm font-medium leading-snug">{e.title}</div>
                  <div className="flex items-center gap-2 mt-1">
                    {e.obligationType && (
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        {e.obligationType}
                      </span>
                    )}
                    {e.relatedMappings.length > 0 && (
                      <span className="text-[10px] text-muted-foreground">
                        · {e.relatedMappings.length} linked control
                        {e.relatedMappings.length === 1 ? "" : "s"}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="align-top text-xs text-muted-foreground">
                  {e.themeName ?? "—"}
                </TableCell>
                <TableCell className="align-top">
                  <Badge variant="outline" className={cn("rounded-md", evalStatusClass(e.status))}>
                    {labelFor(EVAL_STATUS_OPTIONS, e.status)}
                  </Badge>
                </TableCell>
                <TableCell className="align-top">
                  {e.riskRating ? (
                    <Badge variant="outline" className={cn("rounded-md", riskClass(e.riskRating))}>
                      {labelFor(RISK_OPTIONS, e.riskRating)}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-xs">—</span>
                  )}
                </TableCell>
                <TableCell className="align-top text-xs">
                  {e.owner ? ownerName(e.owner) : "—"}
                </TableCell>
                <TableCell className="align-top text-right whitespace-nowrap">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-md relative"
                    title="Evidence"
                    onClick={() => setEvidenceFor(e)}
                  >
                    <Paperclip className="w-4 h-4" />
                    {e.evidenceCount > 0 && (
                      <span className="absolute -top-0.5 -right-0.5 bg-primary text-primary-foreground text-[9px] font-mono px-1 rounded-sm">
                        {e.evidenceCount}
                      </span>
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="rounded-md"
                    title="Update"
                    onClick={() => setEditing(e)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Mobile: stacked cards */}
      <div className="md:hidden space-y-3">
        {evaluations.map((e) => (
          <Card key={e.id} className="rounded-md">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <span className="font-mono text-xs text-muted-foreground pt-0.5">
                  {e.requirementRefCode}
                </span>
                <div className="flex flex-wrap gap-1.5 justify-end">
                  <Badge variant="outline" className={cn("rounded-md", evalStatusClass(e.status))}>
                    {labelFor(EVAL_STATUS_OPTIONS, e.status)}
                  </Badge>
                  {e.riskRating && (
                    <Badge variant="outline" className={cn("rounded-md", riskClass(e.riskRating))}>
                      {labelFor(RISK_OPTIONS, e.riskRating)}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-sm font-medium leading-snug">{e.title}</div>
              <div className="flex items-end justify-between gap-2">
                <div className="text-xs text-muted-foreground min-w-0">
                  <div className="truncate">{e.themeName ?? "—"}</div>
                  {e.owner && <div className="truncate">Owner: {ownerName(e.owner)}</div>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-md"
                    onClick={() => setEvidenceFor(e)}
                  >
                    <Paperclip className="w-3.5 h-3.5 mr-1" /> Evidence
                    {e.evidenceCount > 0 && <span className="ml-1 font-mono">({e.evidenceCount})</span>}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-md"
                    onClick={() => setEditing(e)}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {editing && (
        <EditDialog
          evaluation={editing}
          open={!!editing}
          onOpenChange={(v) => !v && setEditing(null)}
        />
      )}
      {evidenceFor && (
        <EvidenceDialog
          assessmentId={assessmentId}
          evaluation={evidenceFor}
          open={!!evidenceFor}
          onOpenChange={(v) => !v && setEvidenceFor(null)}
        />
      )}
    </div>
  );
}
