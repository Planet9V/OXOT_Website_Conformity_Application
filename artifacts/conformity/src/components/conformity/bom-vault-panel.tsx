import { useMemo, useState } from "react";
import { Fragment } from "react";
import type { ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  useListAssessmentBoms,
  getListAssessmentBomsQueryKey,
  useGetBomCatalog,
  useIngestAssessmentBom,
  useGetBom,
  getGetBomQueryKey,
  useAnalyzeBom,
  useDeleteBom,
  useUpdateBomChecklist,
  useGetBomEngineering,
  getExportBomUrl,
  useGetAdminSession,
} from "@workspace/api-client-react";
import type {
  BomSummary,
  BomComponent,
  BomFinding,
  BomChecklistItem,
  BomDependency,
  BomEngineeringItem,
  BomEngineeringAttribute,
  BomEngineeringConnection,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormField } from "@/components/ui/form-field";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
import { formatDateTime } from "@/lib/conformity";
import { uploadFile } from "@/lib/upload";
import {
  useListBomNotifications,
  getListBomNotificationGapsQueryKey,
} from "@workspace/api-client-react";
import type { BomNotification } from "@workspace/api-client-react";
import {
  NotificationDialog,
  UpstreamNotificationsCard,
  componentIdentityKey,
  notificationStatusClass,
  notificationStatusLabel,
  type NotificationDialogTarget,
} from "@/components/conformity/upstream-notifications";
import { CreateIncidentDialog } from "@/components/conformity/incidents-panel";
import type { IncidentPrefill } from "@/components/conformity/incidents-panel";
import {
  Boxes,
  Megaphone,
  Plus,
  RefreshCw,
  Trash2,
  ShieldAlert,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Loader2,
  FileCheck2,
  Download,
  Network,
  Workflow,
} from "lucide-react";

const FORMAT_OPTIONS = [
  { value: "cyclonedx", label: "CycloneDX (JSON)" },
  { value: "spdx", label: "SPDX (JSON)" },
  { value: "dexpi", label: "DEXPI 2.0 / Proteus XML (engineering BOMs)" },
];

/**
 * Files at or below this size are read in the browser and inlined for a quick
 * ingest; anything larger is uploaded to object storage and parsed server-side
 * so the tab never freezes reading/serialising a multi-megabyte document. The
 * server refuses anything above its own 25 MB parse cap.
 */
const INLINE_MAX_BYTES = 1 * 1024 * 1024; // 1 MiB
const UPLOAD_MAX_BYTES = 25 * 1024 * 1024; // 25 MiB (matches the server cap)

function bomSeverityClass(severity: string): string {
  switch (severity) {
    case "critical":
      return "bg-red-500/10 text-red-600 border-red-500/30";
    case "high":
      return "bg-orange-500/10 text-orange-600 border-orange-500/30";
    case "medium":
      return "bg-amber-500/10 text-amber-600 border-amber-500/30";
    case "low":
      return "bg-lime-500/10 text-lime-600 border-lime-500/30";
    case "info":
      return "bg-blue-500/10 text-blue-600 border-blue-500/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

function bomStatusClass(status: string): string {
  switch (status) {
    case "analyzed":
      return "bg-green-500/10 text-green-600 border-green-500/30";
    case "error":
      return "bg-red-500/10 text-red-600 border-red-500/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

// ---------------------------------------------------------------------------
// Ingest dialog
// ---------------------------------------------------------------------------

function IngestDialog({
  assessmentId,
  open,
  onOpenChange,
}: {
  assessmentId: number;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const qc = useQueryClient();
  const { data: catalog } = useGetBomCatalog();
  const [bomType, setBomType] = useState("sbom");
  const [format, setFormat] = useState("cyclonedx");
  const [name, setName] = useState("");
  const [fileName, setFileName] = useState("");
  const [content, setContent] = useState("");
  // Set when a large file has been uploaded to object storage; the server will
  // download and parse it instead of receiving it inline in the request body.
  const [objectPath, setObjectPath] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [fileError, setFileError] = useState("");

  function resetForm() {
    setName("");
    setFileName("");
    setContent("");
    setObjectPath("");
    setFileError("");
    setUploading(false);
    setUploadPercent(0);
  }

  const ingest = useIngestAssessmentBom({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListAssessmentBomsQueryKey(assessmentId) });
        // A fresh BOM can carry new vulnerability findings → gap set changes.
        qc.invalidateQueries({ queryKey: getListBomNotificationGapsQueryKey(assessmentId) });
        toast.success("BOM ingested and parsed.");
        onOpenChange(false);
        resetForm();
      },
      onError: (err) => toast.error(err instanceof Error ? err.message : "Could not ingest the BOM."),
    },
  });

  const catalogTypes = catalog ? Object.entries(catalog) : [];
  const activeEntry = catalog?.[bomType];

  // DEXPI engineering models are Proteus XML, not JSON — the accepted file
  // shape follows the selected format.
  const isDexpi = format === "dexpi";

  async function onFile(file: File | undefined) {
    if (!file) return;
    setFileError("");
    // Fail loudly on unsupported / oversized files before doing any work.
    const isJson =
      file.type === "application/json" || /\.json$/i.test(file.name);
    const isXml =
      file.type === "application/xml" ||
      file.type === "text/xml" ||
      /\.xml$/i.test(file.name);
    const accepted = isDexpi ? isXml : isJson;
    if (!accepted) {
      const msg = isDexpi
        ? "Unsupported file — DEXPI ingest expects a Proteus XML document."
        : "Unsupported file — only JSON CycloneDX/SPDX documents are supported.";
      setFileError(msg);
      toast.error(msg);
      return;
    }
    if (file.size > UPLOAD_MAX_BYTES) {
      const msg = `That file is ${(file.size / (1024 * 1024)).toFixed(1)} MB — the limit is ${Math.round(
        UPLOAD_MAX_BYTES / (1024 * 1024),
      )} MB.`;
      setFileError(msg);
      toast.error(msg);
      return;
    }

    setFileName(file.name);
    if (!name.trim()) setName(file.name.replace(/\.(json|xml)$/i, ""));

    // Small files: read inline in the browser (quick path). Large files: upload
    // to object storage so we never read/serialise megabytes on the main thread.
    if (file.size <= INLINE_MAX_BYTES) {
      setObjectPath("");
      try {
        setContent(await file.text());
      } catch {
        const msg = "Could not read that file. Please try again.";
        setFileError(msg);
        toast.error(msg);
      }
      return;
    }

    setContent("");
    setUploading(true);
    setUploadPercent(0);
    try {
      const result = await uploadFile(file, setUploadPercent);
      setObjectPath(result.objectPath);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "The upload failed. Please try again.";
      setObjectPath("");
      setFileName("");
      setFileError(msg);
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  }

  const hasDocument = objectPath !== "" || content.trim() !== "";
  const canSubmit =
    !ingest.isPending && !uploading && name.trim() !== "" && hasDocument;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-md max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Ingest a Bill of Materials</DialogTitle>
          <DialogDescription>
            Upload or paste a CycloneDX / SPDX document, or a DEXPI 2.0 (Proteus XML) engineering
            model. It is parsed into components on ingest; findings are computed when you analyze it.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="BOM type">
              {(id) => (
                <Select value={bomType} onValueChange={setBomType}>
                  <SelectTrigger id={id} className="rounded-md">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {catalogTypes.length > 0 ? (
                      catalogTypes.map(([key, entry]) => (
                        <SelectItem key={key} value={key}>
                          {entry.label}
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="sbom">SBOM — Software Bill of Materials</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              )}
            </FormField>
            <FormField label="Format">
              {(id) => (
                <Select value={format} onValueChange={setFormat}>
                  <SelectTrigger id={id} className="rounded-md">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FORMAT_OPTIONS.map((o) => (
                      <SelectItem key={o.value} value={o.value}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </FormField>
          </div>

          {activeEntry && (
            <p className="text-xs text-muted-foreground">{activeEntry.description}</p>
          )}

          <FormField label="Name">
            <Input
              className="rounded-md"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Firmware SBOM v2.4.0"
            />
          </FormField>

          <FormField label="Upload a file">
            {(id) => (
              <>
            <Input
              id={id}
              type="file"
              accept={isDexpi ? ".xml,application/xml,text/xml" : ".json,application/json"}
              className="rounded-md"
              disabled={uploading || ingest.isPending}
              onChange={(e) => onFile(e.target.files?.[0])}
            />
            <p className="text-[11px] text-muted-foreground">
              Large files (over {Math.round(INLINE_MAX_BYTES / (1024 * 1024))} MB) upload securely and
              are parsed on the server, up to {Math.round(UPLOAD_MAX_BYTES / (1024 * 1024))} MB.
            </p>
            {uploading && (
              <div className="space-y-1">
                <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-mono">
                  <Loader2 className="w-3 h-3 animate-spin" /> Uploading {fileName}… {uploadPercent}%
                </p>
                <Progress value={uploadPercent} className="h-1.5" />
              </div>
            )}
            {!uploading && objectPath && fileName && (
              <p className="flex items-center gap-1.5 text-[11px] text-green-600 font-mono">
                <FileCheck2 className="w-3 h-3" /> Uploaded {fileName} — will parse on ingest
              </p>
            )}
            {!uploading && !objectPath && fileName && (
              <p className="text-[11px] text-muted-foreground font-mono">Loaded {fileName}</p>
            )}
            {fileError && <p className="text-[11px] text-destructive">{fileError}</p>}
              </>
            )}
          </FormField>

          <FormField label="…or paste the document">
            <Textarea
              className="rounded-md min-h-32 font-mono text-xs"
              value={content}
              disabled={uploading || objectPath !== ""}
              onChange={(e) => {
                // Pasting overrides any staged file upload.
                if (objectPath) setObjectPath("");
                if (fileName) setFileName("");
                if (fileError) setFileError("");
                setContent(e.target.value);
              }}
              placeholder={
                objectPath
                  ? "A file is staged for upload — clear it to paste instead."
                  : isDexpi
                    ? '<?xml version="1.0"?><PlantModel> … </PlantModel>'
                    : '{ "bomFormat": "CycloneDX", "components": [ … ] }'
              }
            />
          </FormField>
        </div>
        <DialogFooter>
          <Button variant="outline" className="rounded-md" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            className="rounded-md"
            disabled={!canSubmit}
            onClick={() =>
              ingest.mutate({
                id: assessmentId,
                data: {
                  bomType,
                  format,
                  name: name.trim(),
                  ...(objectPath ? { objectPath } : { content }),
                  ...(fileName ? { fileName } : {}),
                },
              })
            }
          >
            {ingest.isPending ? "Ingesting…" : "Ingest & parse"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Checklist editor
// ---------------------------------------------------------------------------

function ChecklistEditor({
  bomId,
  checklist,
  readOnly,
}: {
  bomId: number;
  checklist: BomChecklistItem[];
  readOnly: boolean;
}) {
  const qc = useQueryClient();
  const update = useUpdateBomChecklist({
    mutation: {
      onSuccess: () => qc.invalidateQueries({ queryKey: getGetBomQueryKey(bomId) }),
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : "Could not update the checklist."),
    },
  });

  function toggle(key: string, done: boolean) {
    const next = checklist.map((item) => (item.key === key ? { ...item, done } : item));
    update.mutate({ bomId, data: { checklist: next } });
  }

  if (checklist.length === 0) {
    return <p className="text-sm text-muted-foreground">No checklist for this BOM type.</p>;
  }

  return (
    <ul className="space-y-2">
      {checklist.map((item) => (
        <li key={item.key} className="flex items-start gap-3">
          <Checkbox
            id={`chk-${bomId}-${item.key}`}
            checked={item.done}
            disabled={readOnly || update.isPending}
            onCheckedChange={(v) => toggle(item.key, v === true)}
          />
          <Label
            htmlFor={`chk-${bomId}-${item.key}`}
            className={cn(
              "text-sm font-normal leading-snug cursor-pointer",
              item.done && "text-muted-foreground line-through",
            )}
          >
            {item.label}
          </Label>
        </li>
      ))}
    </ul>
  );
}

// ---------------------------------------------------------------------------
// BOM detail
// ---------------------------------------------------------------------------

/**
 * The extra CRA-relevant component metadata parsed from the document that we
 * don't put in a dedicated column. Rendered as a compact key/value grid inside
 * the expandable row so the table stays scannable while the detail is one click
 * away. Only fields the parser actually populated are shown.
 */
function ComponentExtraDetails({ component }: { component: BomComponent }) {
  const entries: { label: string; value: ReactNode }[] = [];
  if (component.scope) entries.push({ label: "Scope", value: component.scope });
  if (component.manufacturer)
    entries.push({ label: "Manufacturer", value: component.manufacturer });
  if (component.partNumber)
    entries.push({ label: "Part number", value: component.partNumber });
  if (component.firmwareVersion)
    entries.push({ label: "Firmware", value: component.firmwareVersion });
  if (component.cpe)
    entries.push({
      label: "CPE",
      value: <span className="font-mono break-all">{component.cpe}</span>,
    });
  if (component.licenses && component.licenses.length > 0)
    entries.push({
      label: "Licenses",
      value: (
        <span className="flex flex-wrap gap-1">
          {component.licenses.map((l) => (
            <Badge key={l} variant="outline" className="rounded-md text-[10px]">
              {l}
            </Badge>
          ))}
        </span>
      ),
    });

  if (entries.length === 0) {
    return (
      <p className="text-xs text-muted-foreground py-1">
        No additional metadata parsed for this component.
      </p>
    );
  }
  return (
    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 py-1">
      {entries.map((e) => (
        <div key={e.label} className="flex gap-2 text-xs">
          <dt className="text-muted-foreground shrink-0 w-24">{e.label}</dt>
          <dd className="min-w-0 flex-1">{e.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function componentHasExtras(c: BomComponent): boolean {
  return Boolean(
    c.scope ||
      c.manufacturer ||
      c.partNumber ||
      c.firmwareVersion ||
      c.cpe ||
      (c.licenses && c.licenses.length > 0),
  );
}

function ComponentsTable({ components }: { components: BomComponent[] }) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  if (components.length === 0) {
    return <p className="text-sm text-muted-foreground p-4">No components parsed.</p>;
  }

  function toggle(id: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-8" />
            <TableHead>Component</TableHead>
            <TableHead>Version</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Supplier</TableHead>
            <TableHead className="text-right">Findings</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {components.map((c) => {
            const hasExtras = componentHasExtras(c);
            const isOpen = expanded.has(c.id);
            return (
              <Fragment key={c.id}>
                <TableRow
                  className={cn(hasExtras && "cursor-pointer")}
                  onClick={hasExtras ? () => toggle(c.id) : undefined}
                  data-testid="bom-component-row"
                >
                  <TableCell className="align-top">
                    {hasExtras ? (
                      <button
                        type="button"
                        aria-label={isOpen ? "Collapse component details" : "Expand component details"}
                        className="text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggle(c.id);
                        }}
                      >
                        {isOpen ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                      </button>
                    ) : null}
                  </TableCell>
                  <TableCell className="font-medium">
                    {c.name || "—"}
                    {c.purl && (
                      <div className="text-[10px] text-muted-foreground font-mono truncate max-w-xs">
                        {c.purl}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{c.version || "—"}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="rounded-md text-[10px]">
                      {c.componentType}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{c.supplier || "—"}</TableCell>
                  <TableCell className="text-right">
                    {c.findingCount > 0 ? (
                      <Badge variant="outline" className="rounded-md bg-amber-500/10 text-amber-600 border-amber-500/30">
                        {c.findingCount}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">0</span>
                    )}
                  </TableCell>
                </TableRow>
                {hasExtras && isOpen && (
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableCell />
                    <TableCell colSpan={5}>
                      <ComponentExtraDetails component={c} />
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}

/**
 * Compose the Art 14 pre-fill for reporting an incident straight from a
 * vulnerability finding: CVE id, affected component and the finding summary
 * seed the exploit-nature text so nothing is transcribed by hand under the
 * 24h clock. All fields stay editable in the dialog.
 */
function incidentPrefillFromFinding(
  finding: BomFinding,
  component: BomComponent,
): IncidentPrefill {
  const componentLabel = component.version
    ? `${component.name}@${component.version}`
    : component.name;
  const natureLines = [
    `Vulnerability: ${finding.identifier}${finding.title ? ` — ${finding.title}` : ""}`,
    `Affected component: ${componentLabel}${component.purl ? ` (${component.purl})` : ""}`,
  ];
  if (finding.description) natureLines.push(`Summary: ${finding.description}`);
  return {
    title: `${finding.identifier} in ${componentLabel}`,
    description: finding.title,
    severity: finding.severity,
    exploitNature: natureLines.join("\n"),
    // Structured provenance so the incident card can show which vulnerability
    // and component it came from without parsing the free-text nature field.
    sourceVulnerabilityId: finding.identifier,
    sourceComponent: componentLabel,
  };
}

function FindingsList({
  assessmentId,
  findings,
  components,
  notificationsByKey,
  onTrack,
  readOnly,
}: {
  assessmentId: number;
  findings: BomFinding[];
  components: BomComponent[];
  notificationsByKey: Map<string, BomNotification>;
  onTrack: (target: NotificationDialogTarget) => void;
  readOnly: boolean;
}) {
  if (findings.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground p-4">
        <CheckCircle2 className="w-4 h-4 text-green-600" /> No findings — run analyze to (re)check.
      </div>
    );
  }
  const componentById = new Map(components.map((c) => [c.id, c]));
  return (
    <ul className="divide-y divide-border">
      {findings.map((f) => {
        // Upstream-notification affordance only makes sense for component
        // vulnerabilities (CRA Art 13(6)). Matched by the stable identity key,
        // so a tracked record re-attaches after a re-analysis regenerates rows.
        const component =
          f.componentId !== null && f.componentId !== undefined
            ? componentById.get(f.componentId)
            : undefined;
        const isVuln = f.findingType === "vulnerability" && component && f.identifier;
        const tracked = isVuln
          ? notificationsByKey.get(`${componentIdentityKey(component)}::${f.identifier}`)
          : undefined;
        return (
          <li key={f.id} className="flex items-start gap-3 py-3" data-testid="bom-finding">
            <Badge
              variant="outline"
              className={cn("rounded-md text-[10px] shrink-0 uppercase", bomSeverityClass(f.severity))}
            >
              {f.severity}
            </Badge>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium leading-snug">
                {f.identifier && <span className="font-mono">{f.identifier} </span>}
                {f.title}
              </div>
              {f.description && (
                <p className="text-xs text-muted-foreground mt-0.5">{f.description}</p>
              )}
              <div className="text-[10px] text-muted-foreground font-mono mt-1">
                {f.findingType} · {f.source}
              </div>
            </div>
            {isVuln && (
              <div className="shrink-0 flex items-center gap-1.5">
                {!readOnly && (
                <CreateIncidentDialog
                  assessmentId={assessmentId}
                  prefill={incidentPrefillFromFinding(f, component!)}
                  trigger={
                    <Button
                      variant="ghost"
                      size="sm"
                      className="rounded-md h-7 text-xs"
                      data-testid="finding-report-incident"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 mr-1" />
                      Report incident
                    </Button>
                  }
                />
                )}
                {tracked && (
                  <Badge
                    variant="outline"
                    className={cn("rounded-md text-[10px]", notificationStatusClass(tracked.status))}
                    data-testid="finding-notification-status"
                  >
                    upstream: {notificationStatusLabel(tracked.status)}
                  </Badge>
                )}
                {!readOnly && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-md h-7 text-xs"
                  data-testid="finding-track-notification"
                  onClick={() =>
                    onTrack({
                      existing: tracked,
                      componentName: component!.name,
                      componentVersion: component!.version,
                      purl: component!.purl,
                      vulnerabilityId: f.identifier,
                      severity: f.severity,
                    })
                  }
                >
                  <Megaphone className="w-3.5 h-3.5 mr-1" />
                  {tracked ? "Update" : "Track upstream"}
                </Button>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Downloads the server-rebuilt CycloneDX 1.6 JSON as a file attachment. The
 * generated `exportBom` SDK call parses the response as JSON; for a save-to-disk
 * download we fetch the same endpoint directly and stream it to a Blob, which
 * mirrors how a browser handles the endpoint's Content-Disposition. The button
 * is hidden by the caller for DEXPI BOMs (the endpoint 400s for those).
 */
function ExportCycloneDxButton({ bomId, name }: { bomId: number; name: string }) {
  const [downloading, setDownloading] = useState(false);

  async function download() {
    setDownloading(true);
    try {
      const res = await fetch(getExportBomUrl(bomId), {
        method: "GET",
        credentials: "include",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) {
        let message = `Export failed (${res.status}).`;
        try {
          const body = (await res.json()) as { detail?: string; title?: string };
          message = body.detail || body.title || message;
        } catch {
          /* non-JSON error body — keep the status message */
        }
        throw new Error(message);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${name.replace(/[^\w.-]+/g, "-") || "bom"}.cyclonedx.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not export the BOM.");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <Button
      variant="outline"
      className="rounded-md"
      onClick={download}
      disabled={downloading}
      data-testid="bom-export-cyclonedx"
    >
      {downloading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Download className="w-4 h-4 mr-2" />
      )}
      {downloading ? "Exporting…" : "Export CycloneDX"}
    </Button>
  );
}

/**
 * The document's own dependency graph (bom-ref / SPDXID edges). Grouped by the
 * referencing component so each row reads "component -> depends on N", with the
 * concrete list revealed on expand. Refs are matched back to parsed components
 * where possible so a human-readable name shows instead of the raw ref.
 */
function DependencySection({
  dependencies,
  components,
}: {
  dependencies: BomDependency[];
  components: BomComponent[];
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const nameByRef = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of components) {
      if (c.bomRef) {
        map.set(c.bomRef, c.version ? `${c.name}@${c.version}` : c.name);
      }
    }
    return map;
  }, [components]);

  const grouped = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const dep of dependencies) {
      const list = map.get(dep.ref) ?? [];
      if (dep.dependsOnRef) list.push(dep.dependsOnRef);
      map.set(dep.ref, list);
    }
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [dependencies]);

  function label(ref: string): string {
    return nameByRef.get(ref) ?? ref;
  }

  if (dependencies.length === 0) {
    return (
      <p className="text-sm text-muted-foreground p-4">
        No dependency relationships declared in this document.
      </p>
    );
  }

  function toggle(ref: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(ref)) next.delete(ref);
      else next.add(ref);
      return next;
    });
  }

  return (
    <ul className="divide-y divide-border">
      {grouped.map(([ref, dependsOn]) => {
        const isOpen = expanded.has(ref);
        const canExpand = dependsOn.length > 0;
        return (
          <li key={ref} className="py-2" data-testid="bom-dependency-row">
            <button
              type="button"
              className={cn(
                "flex w-full items-center gap-2 text-left text-sm",
                canExpand && "cursor-pointer",
              )}
              onClick={canExpand ? () => toggle(ref) : undefined}
              disabled={!canExpand}
            >
              {canExpand ? (
                isOpen ? (
                  <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0" />
                )
              ) : (
                <span className="w-4 shrink-0" />
              )}
              <span className="font-medium truncate">{label(ref)}</span>
              <span className="text-xs text-muted-foreground shrink-0">
                depends on {dependsOn.length}
              </span>
            </button>
            {isOpen && canExpand && (
              <ul className="mt-1 ml-6 space-y-0.5">
                {dependsOn.map((dep) => (
                  <li key={dep} className="text-xs text-muted-foreground font-mono truncate">
                    → {label(dep)}
                  </li>
                ))}
              </ul>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/**
 * DEXPI engineering view: the normalized Proteus plant model. Items are shown
 * in a table with their parsed attributes revealed on expand, followed by the
 * flat connection list (nozzle/pipe topology). Rendered only for DEXPI BOMs.
 */
function EngineeringView({ bomId }: { bomId: number }) {
  const { data, isLoading, isError } = useGetBomEngineering(bomId);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const attributesByItem = useMemo(() => {
    const map = new Map<number, BomEngineeringAttribute[]>();
    for (const attr of data?.attributes ?? []) {
      const list = map.get(attr.itemId) ?? [];
      list.push(attr);
      map.set(attr.itemId, list);
    }
    return map;
  }, [data]);

  if (isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }
  if (isError || !data) {
    return (
      <p className="text-sm text-muted-foreground p-4">
        Could not load the engineering model for this BOM.
      </p>
    );
  }

  function toggle(id: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const items: BomEngineeringItem[] = data.items;
  const connections: BomEngineeringConnection[] = data.connections;

  return (
    <div className="space-y-4">
      <Card className="rounded-md">
        <CardHeader className="border-b border-border py-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Workflow className="w-4 h-4 text-primary" /> Plant items ({items.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4">No plant items parsed.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8" />
                    <TableHead>Tag</TableHead>
                    <TableHead>Item class</TableHead>
                    <TableHead>Component class</TableHead>
                    <TableHead className="text-right">Attributes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => {
                    const attrs = attributesByItem.get(item.id) ?? [];
                    const hasAttrs = attrs.length > 0;
                    const isOpen = expanded.has(item.id);
                    return (
                      <Fragment key={item.id}>
                        <TableRow
                          className={cn(hasAttrs && "cursor-pointer")}
                          onClick={hasAttrs ? () => toggle(item.id) : undefined}
                          data-testid="bom-engineering-item"
                        >
                          <TableCell className="align-top">
                            {hasAttrs ? (
                              <button
                                type="button"
                                aria-label={isOpen ? "Collapse attributes" : "Expand attributes"}
                                className="text-muted-foreground hover:text-foreground"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggle(item.id);
                                }}
                              >
                                {isOpen ? (
                                  <ChevronDown className="w-4 h-4" />
                                ) : (
                                  <ChevronRight className="w-4 h-4" />
                                )}
                              </button>
                            ) : null}
                          </TableCell>
                          <TableCell className="font-medium">
                            {item.tagName || item.componentName || item.itemRef || "—"}
                            {item.specification && (
                              <div className="text-[10px] text-muted-foreground truncate max-w-xs">
                                {item.specification}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-xs">{item.itemClass || "—"}</TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {item.componentClass || "—"}
                          </TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground">
                            {attrs.length}
                          </TableCell>
                        </TableRow>
                        {hasAttrs && isOpen && (
                          <TableRow className="bg-muted/30 hover:bg-muted/30">
                            <TableCell />
                            <TableCell colSpan={4}>
                              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 py-1">
                                {attrs.map((attr) => (
                                  <div key={attr.id} className="flex gap-2 text-xs">
                                    <dt className="text-muted-foreground shrink-0 max-w-[40%] truncate">
                                      {attr.name}
                                    </dt>
                                    <dd className="min-w-0 flex-1 font-mono">
                                      {attr.value || "—"}
                                      {attr.units ? (
                                        <span className="text-muted-foreground"> {attr.units}</span>
                                      ) : null}
                                    </dd>
                                  </div>
                                ))}
                              </dl>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-md">
        <CardHeader className="border-b border-border py-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Network className="w-4 h-4 text-primary" /> Connections ({connections.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {connections.length === 0 ? (
            <p className="text-sm text-muted-foreground p-4">No connections parsed.</p>
          ) : (
            <ul className="divide-y divide-border">
              {connections.map((conn) => (
                <li
                  key={conn.id}
                  className="flex items-center gap-2 py-2 px-4 text-xs"
                  data-testid="bom-engineering-connection"
                >
                  <span className="font-mono truncate">{conn.fromRef || "—"}</span>
                  <ChevronRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="font-mono truncate">{conn.toRef || "—"}</span>
                  {conn.connectionType && (
                    <Badge variant="outline" className="rounded-md text-[10px] ml-auto shrink-0">
                      {conn.connectionType}
                    </Badge>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function BomDetail({
  assessmentId,
  productName,
  bomId,
  onBack,
}: {
  assessmentId: number;
  productName: string;
  bomId: number;
  onBack: () => void;
}) {
  const qc = useQueryClient();
  const { data: session } = useGetAdminSession();
  const readOnly = session?.role === "demo";
  const { data, isLoading } = useGetBom(bomId);
  const { data: notifications } = useListBomNotifications(assessmentId);
  const [trackTarget, setTrackTarget] = useState<NotificationDialogTarget | null>(null);
  const analyze = useAnalyzeBom({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetBomQueryKey(bomId) });
        qc.invalidateQueries({ queryKey: getListAssessmentBomsQueryKey(assessmentId) });
        // Fresh findings change the Art 13(6) untracked-gap set.
        qc.invalidateQueries({ queryKey: getListBomNotificationGapsQueryKey(assessmentId) });
        toast.success("Analysis complete.");
      },
      onError: (err) => toast.error(err instanceof Error ? err.message : "Analysis failed."),
    },
  });
  const remove = useDeleteBom({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListAssessmentBomsQueryKey(assessmentId) });
        qc.invalidateQueries({ queryKey: getListBomNotificationGapsQueryKey(assessmentId) });
        toast.success("BOM deleted.");
        onBack();
      },
      onError: (err) => toast.error(err instanceof Error ? err.message : "Could not delete the BOM."),
    },
  });

  if (isLoading || !data) {
    return <Skeleton className="h-96 w-full" />;
  }

  const { bom, components, findings } = data;
  // Older API payloads (and test fixtures) may omit dependencies entirely.
  const dependencies = data.dependencies ?? [];
  const isDexpi = bom.format === "dexpi";
  const notificationsByKey = new Map<string, BomNotification>(
    (notifications ?? []).map((n) => [`${n.componentKey}::${n.vulnerabilityId}`, n]),
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" className="rounded-md -ml-2" onClick={onBack}>
          <ChevronLeft className="w-4 h-4 mr-1" /> All BOMs
        </Button>
        <div className="flex items-center gap-2">
          {/* Export 400s for DEXPI BOMs — only CycloneDX/SPDX rebuild cleanly. */}
          {!isDexpi && <ExportCycloneDxButton bomId={bom.id} name={bom.name} />}
          {!readOnly && (
            <>
              <Button
                variant="outline"
                className="rounded-md"
                onClick={() => analyze.mutate({ bomId })}
                disabled={analyze.isPending}
                data-testid="bom-analyze"
              >
                <RefreshCw className={cn("w-4 h-4 mr-2", analyze.isPending && "animate-spin")} />
                {analyze.isPending ? "Analyzing…" : "Analyze"}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-md text-muted-foreground hover:text-destructive"
                aria-label="Delete this BOM"
                onClick={() => remove.mutate({ bomId })}
                disabled={remove.isPending}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-lg font-semibold">{bom.name}</h3>
          <Badge variant="outline" className="rounded-md text-[10px] uppercase font-mono">
            {bom.bomType}
          </Badge>
          <Badge variant="outline" className="rounded-md text-[10px] font-mono">
            {bom.format}
          </Badge>
          <Badge variant="outline" className={cn("rounded-md text-[10px]", bomStatusClass(bom.status))}>
            {bom.status}
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {bom.componentCount} components · {bom.findingCount} findings · updated{" "}
          {formatDateTime(bom.updatedAt)}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="rounded-md lg:col-span-2">
          <CardHeader className="border-b border-border py-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500" /> Findings ({findings.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 px-4">
            <FindingsList
              assessmentId={assessmentId}
              findings={findings}
              components={components}
              notificationsByKey={notificationsByKey}
              onTrack={setTrackTarget}
              readOnly={readOnly}
            />
          </CardContent>
        </Card>

        <Card className="rounded-md">
          <CardHeader className="border-b border-border py-3">
            <CardTitle className="text-sm">Checklist</CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <ChecklistEditor bomId={bom.id} checklist={bom.checklist} readOnly={readOnly} />
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-md">
        <CardHeader className="border-b border-border py-3">
          <CardTitle className="text-sm">Components ({components.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ComponentsTable components={components} />
        </CardContent>
      </Card>

      <Card className="rounded-md">
        <CardHeader className="border-b border-border py-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Network className="w-4 h-4 text-muted-foreground" /> Dependencies ({dependencies.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 px-4">
          <DependencySection dependencies={dependencies} components={components} />
        </CardContent>
      </Card>

      {isDexpi && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Workflow className="w-4 h-4 text-primary" /> Engineering model
          </h4>
          <EngineeringView bomId={bom.id} />
        </div>
      )}

      {trackTarget && (
        <NotificationDialog
          key={`${trackTarget.existing?.id ?? "new"}-${trackTarget.vulnerabilityId}`}
          assessmentId={assessmentId}
          productName={productName}
          target={trackTarget}
          onOpenChange={(open) => {
            if (!open) setTrackTarget(null);
          }}
        />
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Panel
// ---------------------------------------------------------------------------

function BomCard({ bom, onOpen }: { bom: BomSummary; onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full text-left rounded-md border border-border bg-card p-4 transition-colors hover:border-primary/40"
      data-testid="bom-card"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <Boxes className="w-4 h-4 text-primary shrink-0" />
          <span className="font-medium truncate">{bom.name}</span>
        </div>
        <Badge variant="outline" className={cn("rounded-md text-[10px] shrink-0", bomStatusClass(bom.status))}>
          {bom.status}
        </Badge>
      </div>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground font-mono">
        <span className="uppercase">{bom.bomType}</span>
        <span>· {bom.format}</span>
        <span>· {bom.componentCount} components</span>
        <span
          className={cn(
            bom.findingCount > 0 ? "text-amber-600" : "",
          )}
        >
          · {bom.findingCount} findings
        </span>
      </div>
    </button>
  );
}

export function BomVaultPanel({
  assessmentId,
  productName,
}: {
  assessmentId: number;
  productName: string;
}) {
  const { data: boms, isLoading } = useListAssessmentBoms(assessmentId);
  const [selected, setSelected] = useState<number | null>(null);
  const [ingestOpen, setIngestOpen] = useState(false);

  const list = useMemo(() => boms ?? [], [boms]);

  if (selected !== null) {
    return (
      <BomDetail
        assessmentId={assessmentId}
        productName={productName}
        bomId={selected}
        onBack={() => setSelected(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <p className="text-sm text-muted-foreground max-w-2xl">
          The xBOM vault holds this assessment&apos;s Bills of Materials. Ingest a CycloneDX or SPDX
          document to inventory components, then analyze it to surface known vulnerabilities (OSV) and
          crypto-agility weaknesses. Keep the per-type checklist up to date as evidence of a complete
          inventory.
        </p>
        <Button className="rounded-md shrink-0" onClick={() => setIngestOpen(true)} data-testid="bom-ingest-open">
          <Plus className="w-4 h-4 mr-2" /> Ingest BOM
        </Button>
      </div>

      {isLoading && <Skeleton className="h-40 w-full" />}

      {!isLoading && list.length === 0 && (
        <Card className="rounded-md">
          <CardContent className="p-10 text-center text-muted-foreground flex flex-col items-center">
            <Boxes className="w-10 h-10 mb-3 opacity-20" />
            <p>No BOMs ingested yet.</p>
            <Button
              variant="outline"
              className="rounded-md mt-4"
              onClick={() => setIngestOpen(true)}
            >
              Ingest your first BOM
            </Button>
          </CardContent>
        </Card>
      )}

      {!isLoading && list.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {list.map((bom) => (
            <BomCard key={bom.id} bom={bom} onOpen={() => setSelected(bom.id)} />
          ))}
        </div>
      )}

      <UpstreamNotificationsCard assessmentId={assessmentId} productName={productName} />

      <IngestDialog assessmentId={assessmentId} open={ingestOpen} onOpenChange={setIngestOpen} />
    </div>
  );
}
