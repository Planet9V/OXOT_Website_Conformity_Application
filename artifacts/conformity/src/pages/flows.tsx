import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  useListConformityFlows,
  useCreateConformityFlow,
  useUpdateConformityFlow,
  useDeleteConformityFlow,
  getListConformityFlowsQueryKey,
  useGetAdminSession,
  useListRequirements,
  getListRequirementsQueryKey,
} from "@workspace/api-client-react";
import type {
  ConformityFlowSummary,
  FlowStep,
  FlowStepRequirementRef,
  Requirement,
} from "@workspace/api-client-react";
import { GeneratableArtifactType } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { SettingsNav } from "@/components/settings-nav";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import {
  GitBranch,
  Plus,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  ClipboardList,
  HelpCircle,
  Flag,
  FileText,
  Search,
  X,
  BookMarked,
  type LucideIcon,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Step type catalogue — mirrors the run-side panel (flow-runner-panel.tsx).
// ---------------------------------------------------------------------------

const STEP_TYPES = [
  { value: "activity", label: "Activity" },
  { value: "question", label: "Question" },
  { value: "checkpoint", label: "Checkpoint" },
  { value: "artifact", label: "Artifact" },
  { value: "investigation", label: "Investigation" },
] as const;

const STEP_TYPE_ICON: Record<string, LucideIcon> = {
  activity: ClipboardList,
  question: HelpCircle,
  checkpoint: Flag,
  artifact: FileText,
  investigation: Search,
};

// ---------------------------------------------------------------------------
// Artifact type catalogue — DERIVED from the single shared source of truth,
// `GeneratableArtifactType` (OpenAPI schema, generated from the server's
// conformityEngine.ts ARTIFACT_TYPES). The values are not hand-copied here, so
// the builder can never offer a type the runner won't generate. `ARTIFACT_LABELS`
// is a `Record` keyed by the enum, so adding/removing/renaming a generatable
// type server-side (and regenerating the client) forces a compile error here
// until the label map is updated — no silent drift. Authoring a step's
// artifactType from this set is what lets the run-side "Create / link artifact"
// action auto-link reliably.
// ---------------------------------------------------------------------------

const ARTIFACT_LABELS: Record<GeneratableArtifactType, string> = {
  eu_doc: "EU Declaration of Conformity",
  technical_documentation: "Technical Documentation",
  risk_assessment: "Cybersecurity Risk Assessment",
  cvd_policy: "Coordinated Vulnerability Disclosure Policy",
  sbom_reference: "Software Bill of Materials (SBOM) Reference",
  support_statement: "Support Period & Update Statement",
  user_information: "User Information & Instructions (Annex II)",
};

const ARTIFACT_TYPES = (Object.values(GeneratableArtifactType) as GeneratableArtifactType[]).map(
  (value) => ({ value, label: ARTIFACT_LABELS[value] }),
);

const CANONICAL_ARTIFACT_TYPES = new Set<string>(ARTIFACT_TYPES.map((a) => a.value));

// ---------------------------------------------------------------------------
// Draft model — an editable working copy of a flow definition.
// ---------------------------------------------------------------------------

type DraftStep = {
  id: string;
  type: string;
  title: string;
  description: string;
  /** question → comma-joined answer options */
  options: string;
  /** artifact → artifact type key */
  artifactType: string;
  /** Natural keys into the requirements catalogue attached to this step. */
  requirementRefs: FlowStepRequirementRef[];
};

type Draft = {
  key: string;
  name: string;
  description: string;
  regulationKeys: string;
  classKeys: string;
  bomTypes: string;
  steps: DraftStep[];
};

let stepSeq = 0;
function newStepId(): string {
  stepSeq += 1;
  return `step-${Date.now().toString(36)}-${stepSeq}`;
}

function emptyStep(): DraftStep {
  return {
    id: newStepId(),
    type: "activity",
    title: "",
    description: "",
    options: "",
    artifactType: "",
    requirementRefs: [],
  };
}

/** Stable identity for a requirement ref, used as a map/set key. */
function refKey(ref: FlowStepRequirementRef): string {
  return `${ref.regulationKey}::${ref.refCode}`;
}

function csvToList(v: string): string[] {
  return v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function listToCsv(v: string[] | undefined): string {
  return (v ?? []).join(", ");
}

/** Build an editable draft from an existing flow (or a blank one). */
function draftFromFlow(flow?: ConformityFlowSummary): Draft {
  if (!flow) {
    return {
      key: "",
      name: "",
      description: "",
      regulationKeys: "",
      classKeys: "",
      bomTypes: "",
      steps: [emptyStep()],
    };
  }
  return {
    key: flow.key,
    name: flow.name,
    description: flow.description ?? "",
    regulationKeys: listToCsv(flow.appliesTo?.regulationKeys),
    classKeys: listToCsv(flow.appliesTo?.classKeys),
    bomTypes: listToCsv(flow.appliesTo?.bomTypes),
    steps: flow.steps.map((s) => ({
      id: s.id,
      type: s.type,
      title: s.title,
      description: s.description ?? "",
      options: Array.isArray(s.config?.options)
        ? (s.config!.options as unknown[]).map(String).join(", ")
        : "",
      artifactType: typeof s.config?.artifactType === "string" ? (s.config!.artifactType as string) : "",
      requirementRefs: (s.requirementRefs ?? []).map((r) => ({
        regulationKey: r.regulationKey,
        refCode: r.refCode,
      })),
    })),
  };
}

/** Serialise a draft step into the wire FlowStep (only keep relevant config). */
function toFlowStep(s: DraftStep): FlowStep {
  const step: FlowStep = { id: s.id, type: s.type, title: s.title.trim() };
  const description = s.description.trim();
  if (description) step.description = description;
  if (s.requirementRefs.length > 0) {
    step.requirementRefs = s.requirementRefs.map((r) => ({
      regulationKey: r.regulationKey,
      refCode: r.refCode,
    }));
  }
  const config: Record<string, unknown> = {};
  if (s.type === "question") {
    const options = csvToList(s.options);
    if (options.length > 0) config.options = options;
  }
  if (s.type === "artifact" && s.artifactType.trim()) {
    config.artifactType = s.artifactType.trim();
  }
  if (Object.keys(config).length > 0) step.config = config;
  return step;
}

function toAppliesTo(d: Draft) {
  const appliesTo: {
    regulationKeys?: string[];
    classKeys?: string[];
    bomTypes?: string[];
  } = {};
  const reg = csvToList(d.regulationKeys);
  const cls = csvToList(d.classKeys);
  const bom = csvToList(d.bomTypes);
  if (reg.length > 0) appliesTo.regulationKeys = reg;
  if (cls.length > 0) appliesTo.classKeys = cls;
  if (bom.length > 0) appliesTo.bomTypes = bom;
  return appliesTo;
}

// ---------------------------------------------------------------------------
// Requirement picker — attach/remove requirement refs on a step. Refs are
// natural keys (regulationKey + refCode) validated server-side against the
// requirements catalogue; unknown refs are rejected on save with a 400.
// ---------------------------------------------------------------------------

/** Human label for a ref, e.g. "CRA · Annex I Part II(1)". */
function refLabel(ref: FlowStepRequirementRef, req?: Requirement): string {
  const reg = req?.regulationShortName ?? ref.regulationKey.toUpperCase();
  return `${reg} · ${ref.refCode}`;
}

function RequirementPicker({
  refs,
  onChange,
}: {
  refs: FlowStepRequirementRef[];
  onChange: (next: FlowStepRequirementRef[]) => void;
}) {
  const [q, setQ] = useState("");
  const query = q.trim();
  const { data: results, isLoading } = useListRequirements(
    { q: query || undefined },
    {
      query: {
        enabled: query.length > 0,
        queryKey: getListRequirementsQueryKey({ q: query || undefined }),
      },
    },
  );

  const attached = useMemo(() => new Set(refs.map(refKey)), [refs]);

  // Index attached refs by key so chips can show catalogue labels when the
  // requirement happens to be in the current search results.
  const byKey = useMemo(() => {
    const m = new Map<string, Requirement>();
    for (const r of results ?? []) {
      m.set(`${r.regulationKey}::${r.refCode}`, r);
    }
    return m;
  }, [results]);

  function add(req: Requirement) {
    const ref: FlowStepRequirementRef = { regulationKey: req.regulationKey, refCode: req.refCode };
    if (attached.has(refKey(ref))) return;
    onChange([...refs, ref]);
  }

  function remove(ref: FlowStepRequirementRef) {
    onChange(refs.filter((r) => refKey(r) !== refKey(ref)));
  }

  const suggestions = (results ?? []).filter((r) => !attached.has(`${r.regulationKey}::${r.refCode}`));

  return (
    <FormField label="Linked requirements" labelClassName="text-xs">
      <div className="space-y-2" data-testid="flow-step-requirements">
        {refs.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {refs.map((ref) => (
              <Badge
                key={refKey(ref)}
                variant="secondary"
                className="rounded-md font-mono text-[10px] gap-1 pr-1"
                data-testid="flow-step-requirement-chip"
              >
                <BookMarked className="w-3 h-3" />
                {refLabel(ref, byKey.get(refKey(ref)))}
                <button
                  type="button"
                  className="ml-0.5 rounded-sm hover:text-destructive"
                  aria-label={`Remove requirement ${ref.refCode}`}
                  onClick={() => remove(ref)}
                  data-testid="flow-step-requirement-remove"
                >
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            className="rounded-md h-8 text-sm pl-8"
            placeholder="Search the requirements catalogue…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            data-testid="flow-step-requirement-search"
          />
        </div>

        {query.length > 0 && (
          <div className="rounded-md border border-border bg-card max-h-48 overflow-y-auto">
            {isLoading ? (
              <p className="text-xs text-muted-foreground px-3 py-2">Searching…</p>
            ) : suggestions.length === 0 ? (
              <p className="text-xs text-muted-foreground px-3 py-2">No matching requirements.</p>
            ) : (
              <ul className="divide-y divide-border">
                {suggestions.slice(0, 20).map((req) => (
                  <li key={req.id}>
                    <button
                      type="button"
                      className="w-full text-left px-3 py-1.5 hover:bg-muted/50 transition-colors"
                      onClick={() => add(req)}
                      data-testid="flow-step-requirement-option"
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="rounded-md font-mono text-[10px]">
                          {req.regulationShortName} · {req.refCode}
                        </Badge>
                      </div>
                      <span className="block text-xs text-muted-foreground truncate mt-0.5">
                        {req.title}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </FormField>
  );
}

// ---------------------------------------------------------------------------
// Step editor row
// ---------------------------------------------------------------------------

function StepEditor({
  step,
  index,
  total,
  onChange,
  onMove,
  onRemove,
}: {
  step: DraftStep;
  index: number;
  total: number;
  onChange: (next: DraftStep) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
}) {
  const TypeIcon = STEP_TYPE_ICON[step.type] ?? ClipboardList;
  const set = <K extends keyof DraftStep>(k: K, v: DraftStep[K]) => onChange({ ...step, [k]: v });

  return (
    <div className="rounded-md border border-border bg-muted/30 p-3 space-y-3" data-testid="flow-step-editor">
      <div className="flex items-center gap-2">
        <span className="grid place-items-center w-6 h-6 rounded-full border border-border bg-card text-xs font-mono shrink-0">
          {index + 1}
        </span>
        <TypeIcon className="w-4 h-4 text-muted-foreground shrink-0" />
        <Input
          className="rounded-md h-8 text-sm flex-1"
          placeholder="Step title"
          value={step.title}
          onChange={(e) => set("title", e.target.value)}
          data-testid="flow-step-title"
        />
        <div className="flex items-center gap-1 shrink-0">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="w-7 h-7"
            disabled={index === 0}
            aria-label="Move step up"
            onClick={() => onMove(-1)}
            data-testid="flow-step-up"
          >
            <ChevronUp className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="w-7 h-7"
            disabled={index === total - 1}
            aria-label="Move step down"
            onClick={() => onMove(1)}
            data-testid="flow-step-down"
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="w-7 h-7 text-muted-foreground hover:text-destructive"
            aria-label="Remove step"
            onClick={onRemove}
            data-testid="flow-step-remove"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-[10rem_1fr]">
        <FormField label="Type" labelClassName="text-xs">
          {(id) => (
            <Select value={step.type} onValueChange={(v) => set("type", v)}>
              <SelectTrigger id={id} className="rounded-md h-8 text-xs" data-testid="flow-step-type">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STEP_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </FormField>
        <FormField label="Description" labelClassName="text-xs">
          <Textarea
            className="rounded-md min-h-9 text-sm"
            placeholder="What this step involves…"
            value={step.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </FormField>
      </div>

      {step.type === "question" && (
        <FormField label="Answer options (comma-separated)" labelClassName="text-xs">
          <Input
            className="rounded-md h-8 text-sm"
            placeholder="e.g. yes, partially, no"
            value={step.options}
            onChange={(e) => set("options", e.target.value)}
            data-testid="flow-step-options"
          />
        </FormField>
      )}

      {step.type === "artifact" && (
        <FormField label="Artifact type" labelClassName="text-xs">
          {(id) => (
            <>
              <Select value={step.artifactType} onValueChange={(v) => set("artifactType", v)}>
                <SelectTrigger id={id} className="rounded-md h-8 text-xs" data-testid="flow-step-artifact-type">
                  <SelectValue placeholder="Select an artifact type" />
                </SelectTrigger>
                <SelectContent>
                  {ARTIFACT_TYPES.map((a) => (
                    <SelectItem key={a.value} value={a.value}>
                      {a.label}
                    </SelectItem>
                  ))}
                  {/* Preserve a previously-authored non-canonical type so existing
                      steps still render and can be re-saved without data loss. */}
                  {step.artifactType.trim() && !CANONICAL_ARTIFACT_TYPES.has(step.artifactType.trim()) && (
                    <SelectItem value={step.artifactType.trim()}>
                      {step.artifactType.trim()} (not generatable)
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                Choose a type the runner can generate so the run-side “Create / link artifact” action
                auto-links.
              </p>
            </>
          )}
        </FormField>
      )}

      <RequirementPicker
        refs={step.requirementRefs}
        onChange={(next) => set("requirementRefs", next)}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Flow editor dialog (create + edit)
// ---------------------------------------------------------------------------

function FlowEditorDialog({
  flow,
  open,
  onOpenChange,
}: {
  flow?: ConformityFlowSummary;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const qc = useQueryClient();
  const isEdit = !!flow;
  const [draft, setDraft] = useState<Draft>(() => draftFromFlow(flow));

  // Re-seed the draft whenever the dialog is (re)opened for a given flow.
  const [seededFor, setSeededFor] = useState<number | "new" | null>(null);
  const seedKey = flow?.id ?? "new";
  if (open && seededFor !== seedKey) {
    setDraft(draftFromFlow(flow));
    setSeededFor(seedKey);
  }
  if (!open && seededFor !== null) {
    setSeededFor(null);
  }

  const invalidate = () =>
    qc.invalidateQueries({ queryKey: getListConformityFlowsQueryKey() });

  // Saving a flow can change drift ("updated" badge) on any open runs list,
  // so refetch every cached assessment flow-runs list too.
  const invalidateFlowRunLists = () =>
    qc.invalidateQueries({
      predicate: (q) =>
        typeof q.queryKey[0] === "string" &&
        /^\/api\/conformity\/assessments\/\d+\/flow-runs$/.test(q.queryKey[0]),
    });

  const create = useCreateConformityFlow({
    mutation: {
      onSuccess: () => {
        invalidate();
        toast.success("Flow created.");
        onOpenChange(false);
      },
      onError: (err) => toast.error(err instanceof Error ? err.message : "Could not create the flow."),
    },
  });

  const update = useUpdateConformityFlow({
    mutation: {
      onSuccess: () => {
        invalidate();
        invalidateFlowRunLists();
        toast.success("Flow saved.");
        onOpenChange(false);
      },
      onError: (err) => toast.error(err instanceof Error ? err.message : "Could not save the flow."),
    },
  });

  const setField = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((p) => ({ ...p, [k]: v }));

  const setStep = (i: number, next: DraftStep) =>
    setDraft((p) => ({ ...p, steps: p.steps.map((s, idx) => (idx === i ? next : s)) }));

  const moveStep = (i: number, dir: -1 | 1) =>
    setDraft((p) => {
      const target = i + dir;
      if (target < 0 || target >= p.steps.length) return p;
      const steps = [...p.steps];
      [steps[i], steps[target]] = [steps[target]!, steps[i]!];
      return { ...p, steps };
    });

  const removeStep = (i: number) =>
    setDraft((p) => ({ ...p, steps: p.steps.filter((_, idx) => idx !== i) }));

  const addStep = () => setDraft((p) => ({ ...p, steps: [...p.steps, emptyStep()] }));

  const pending = create.isPending || update.isPending;

  const validSteps = draft.steps.filter((s) => s.title.trim());
  const canSave =
    draft.name.trim().length > 0 &&
    (isEdit || draft.key.trim().length > 0) &&
    validSteps.length > 0 &&
    !pending;

  function save() {
    const steps = validSteps.map(toFlowStep);
    const appliesTo = toAppliesTo(draft);
    if (isEdit && flow) {
      update.mutate({
        flowId: flow.id,
        data: {
          name: draft.name.trim(),
          description: draft.description.trim(),
          appliesTo,
          steps,
        },
      });
    } else {
      create.mutate({
        data: {
          key: draft.key.trim(),
          name: draft.name.trim(),
          description: draft.description.trim(),
          appliesTo,
          steps,
        },
      });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-md max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit flow" : "New flow"}</DialogTitle>
          <DialogDescription>
            A flow is an ordered set of typed steps a team works through for an assessment. In-flight
            runs keep their recorded progress by step.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Name">
              <Input
                className="rounded-md"
                value={draft.name}
                onChange={(e) => setField("name", e.target.value)}
                placeholder="e.g. CRA default process"
                data-testid="flow-name"
              />
            </FormField>
            <FormField label="Key">
              {(id) => (
                <>
                  <Input
                    id={id}
                    className="rounded-md font-mono"
                    value={draft.key}
                    onChange={(e) => setField("key", e.target.value)}
                    placeholder="e.g. cra-default"
                    disabled={isEdit}
                    data-testid="flow-key"
                  />
                  {isEdit && (
                    <p className="text-[11px] text-muted-foreground">The key is fixed after creation.</p>
                  )}
                </>
              )}
            </FormField>
          </div>

          <FormField label="Description">
            <Textarea
              className="rounded-md"
              value={draft.description}
              onChange={(e) => setField("description", e.target.value)}
              placeholder="What this flow is for…"
            />
          </FormField>

          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wide text-muted-foreground">
              Applies to (optional, comma-separated)
            </Label>
            <div className="grid gap-3 sm:grid-cols-3">
              <FormField label="Regulation keys" labelClassName="text-xs">
                <Input
                  className="rounded-md h-8 text-sm font-mono"
                  value={draft.regulationKeys}
                  onChange={(e) => setField("regulationKeys", e.target.value)}
                  placeholder="cra, ai-act"
                />
              </FormField>
              <FormField label="Class keys" labelClassName="text-xs">
                <Input
                  className="rounded-md h-8 text-sm font-mono"
                  value={draft.classKeys}
                  onChange={(e) => setField("classKeys", e.target.value)}
                  placeholder="default, important"
                />
              </FormField>
              <FormField label="BOM types" labelClassName="text-xs">
                <Input
                  className="rounded-md h-8 text-sm font-mono"
                  value={draft.bomTypes}
                  onChange={(e) => setField("bomTypes", e.target.value)}
                  placeholder="sbom, cbom"
                />
              </FormField>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                Steps ({validSteps.length})
              </Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-md h-8"
                onClick={addStep}
                data-testid="flow-add-step"
              >
                <Plus className="w-4 h-4 mr-1" /> Add step
              </Button>
            </div>
            {draft.steps.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No steps yet. Add the first step to build the flow.
              </p>
            ) : (
              <div className="space-y-2" data-testid="flow-steps-editor">
                {draft.steps.map((step, i) => (
                  <StepEditor
                    key={step.id}
                    step={step}
                    index={i}
                    total={draft.steps.length}
                    onChange={(next) => setStep(i, next)}
                    onMove={(dir) => moveStep(i, dir)}
                    onRemove={() => removeStep(i)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" className="rounded-md" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button className="rounded-md" disabled={!canSave} onClick={save} data-testid="flow-save">
            {isEdit ? "Save flow" : "Create flow"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Flow card
// ---------------------------------------------------------------------------

function appliesToSummary(flow: ConformityFlowSummary): string {
  const parts: string[] = [];
  const reg = flow.appliesTo?.regulationKeys ?? [];
  const cls = flow.appliesTo?.classKeys ?? [];
  const bom = flow.appliesTo?.bomTypes ?? [];
  if (reg.length) parts.push(reg.join(", "));
  if (cls.length) parts.push(cls.join(", "));
  if (bom.length) parts.push(bom.join(", "));
  return parts.length ? parts.join(" · ") : "Any assessment";
}

function FlowCard({
  flow,
  readOnly,
  onEdit,
  onDeleted,
}: {
  flow: ConformityFlowSummary;
  readOnly: boolean;
  onEdit: () => void;
  onDeleted: () => void;
}) {
  const qc = useQueryClient();
  const del = useDeleteConformityFlow({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getListConformityFlowsQueryKey() });
        toast.success("Flow deleted.");
        onDeleted();
      },
      onError: (err) => toast.error(err instanceof Error ? err.message : "Could not delete the flow."),
    },
  });

  return (
    <Card className="rounded-md" data-testid="flow-card">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <GitBranch className="w-4 h-4 text-primary shrink-0" />
              <span className="font-medium truncate">{flow.name}</span>
              <Badge variant="outline" className="rounded-md font-mono text-[10px]">
                {flow.key}
              </Badge>
            </div>
            {flow.description && (
              <p className="text-xs text-muted-foreground mt-1 leading-snug">{flow.description}</p>
            )}
            <div className="mt-2 text-[11px] text-muted-foreground font-mono">
              {flow.steps.length} step{flow.steps.length === 1 ? "" : "s"} · {appliesToSummary(flow)}
            </div>
          </div>
          {!readOnly && (
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="outline"
                size="sm"
                className="rounded-md h-8"
                onClick={onEdit}
                data-testid="flow-edit"
              >
                <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="rounded-md h-8 w-8 text-muted-foreground hover:text-destructive"
                    aria-label="Delete flow"
                    data-testid="flow-delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-md">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this flow?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This permanently removes the “{flow.name}” flow definition. Existing runs already
                      started against it keep their recorded step progress. This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-md">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() => del.mutate({ flowId: flow.id })}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function Flows() {
  const { data: session } = useGetAdminSession();
  const { data: flows, isLoading, isError } = useListConformityFlows();
  const readOnly = session?.role === "demo";

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<ConformityFlowSummary | undefined>(undefined);

  const flowList = useMemo(() => flows ?? [], [flows]);

  function openCreate() {
    setEditing(undefined);
    setEditorOpen(true);
  }
  function openEdit(flow: ConformityFlowSummary) {
    setEditing(flow);
    setEditorOpen(true);
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <SettingsNav />
      <div className="flex items-start justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="oxot-kicker block mb-1">CRA ASSESSMENT PROCESS AUTHORING</span>
          <h1 className="text-3xl sm:text-4xl font-serif font-normal tracking-tight text-foreground">Flows</h1>
          <p className="text-sm text-muted-foreground mt-1 font-sans max-w-2xl">
            Author the guided, typed processes teams work through for an assessment — activities,
            questions, checkpoints, artifacts and investigations. Flows are started from a product's
            assessment workbench.
          </p>
        </div>
        {!readOnly && (
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs rounded-lg shadow-sm cta-lift shrink-0" onClick={openCreate} data-testid="flow-new">
            <Plus className="w-4 h-4 mr-1.5" /> New flow
          </Button>
        )}
      </div>

      {readOnly && (
        <p className="text-sm text-muted-foreground rounded-md border border-border bg-muted/30 px-4 py-3">
          The demo workspace is read-only. Flow definitions can be viewed but not edited here.
        </p>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className={cn("w-full", "h-24")} />
          ))}
        </div>
      ) : isError ? (
        <div className="text-destructive text-center py-10">Failed to load flows.</div>
      ) : flowList.length === 0 ? (
        <Card className="rounded-md">
          <CardContent className="p-16 text-center text-muted-foreground flex flex-col items-center">
            <GitBranch className="w-12 h-12 mb-4 opacity-20" />
            <p>No flows yet.</p>
            {!readOnly && <p className="text-xs mt-1">Create your first flow to get started.</p>}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {flowList.map((flow) => (
            <FlowCard
              key={flow.id}
              flow={flow}
              readOnly={readOnly}
              onEdit={() => openEdit(flow)}
              onDeleted={() => {
                if (editing?.id === flow.id) setEditorOpen(false);
              }}
            />
          ))}
        </div>
      )}

      {!readOnly && (
        <FlowEditorDialog flow={editing} open={editorOpen} onOpenChange={setEditorOpen} />
      )}
    </div>
  );
}
