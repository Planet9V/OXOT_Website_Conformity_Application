import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  useListAssessmentFlowRuns,
  getListAssessmentFlowRunsQueryKey,
  useListConformityFlows,
  useCreateAssessmentFlowRun,
  useGetConformityFlowRun,
  getGetConformityFlowRunQueryKey,
  useUpdateConformityFlowRunStep,
  useAdoptConformityFlowRunSteps,
  useGetAdminSession,
  useListConformityArtifacts,
  useGenerateConformityArtifacts,
  getListConformityArtifactsQueryKey,
  useListAssessmentBoms,
  getListAssessmentBomsQueryKey,
} from "@workspace/api-client-react";
import type {
  ConformityFlowRunSummary,
  ConformityFlowSummary,
  FlowStep,
  FlowStepRequirementRef,
  FlowRunStepState,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/conformity";
import {
  GitBranch,
  Play,
  ChevronLeft,
  CircleDashed,
  CircleDot,
  CheckCircle2,
  MinusCircle,
  ClipboardList,
  HelpCircle,
  Flag,
  FileText,
  Search,
  ExternalLink,
  Info,
  BookMarked,
  Boxes,
  type LucideIcon,
} from "lucide-react";

const STEP_TYPE_ICON: Record<string, LucideIcon> = {
  activity: ClipboardList,
  question: HelpCircle,
  checkpoint: Flag,
  artifact: FileText,
  investigation: Search,
};

const STEP_STATUS_OPTIONS = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
  { value: "skipped", label: "Skipped" },
] as const;

const STATUS_ICON: Record<string, LucideIcon> = {
  pending: CircleDashed,
  in_progress: CircleDot,
  done: CheckCircle2,
  skipped: MinusCircle,
};

function statusIconClass(status: string): string {
  switch (status) {
    case "done":
      return "text-green-600";
    case "in_progress":
      return "text-blue-600";
    case "skipped":
      return "text-muted-foreground";
    default:
      return "text-muted-foreground/50";
  }
}

function runStatusClass(status: string): string {
  switch (status) {
    case "complete":
      return "bg-green-500/10 text-green-600 border-green-500/30";
    case "active":
      return "bg-blue-500/10 text-blue-600 border-blue-500/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

function runProgress(steps: FlowStep[], stepStates: Record<string, FlowRunStepState>): number {
  if (steps.length === 0) return 0;
  const closed = steps.filter((s) => {
    const st = stepStates[s.id]?.status;
    return st === "done" || st === "skipped";
  }).length;
  return Math.round((closed / steps.length) * 100);
}

/** Authored answer options for a question step (empty when none were configured). */
function stepOptions(step: FlowStep): string[] {
  const opts = step.config?.options;
  if (!Array.isArray(opts)) return [];
  return opts.map((o) => String(o).trim()).filter(Boolean);
}

/** Authored artifact type for an artifact step (empty when none was configured). */
function stepArtifactType(step: FlowStep): string {
  const t = step.config?.artifactType;
  return typeof t === "string" ? t.trim() : "";
}

/** Requirement refs attached to a step in the run snapshot (never the live flow). */
function stepRequirementRefs(step: FlowStep): FlowStepRequirementRef[] {
  return step.requirementRefs ?? [];
}

/** Stable identity for a requirement ref. */
function refKey(ref: FlowStepRequirementRef): string {
  return `${ref.regulationKey}::${ref.refCode}`;
}

/** Human label for a ref, e.g. "CRA · Annex I Part II(1)". */
function refLabel(ref: FlowStepRequirementRef): string {
  return `${ref.regulationKey.toUpperCase()} · ${ref.refCode}`;
}

/** Small chip row rendering a step's requirement refs. */
function RequirementRefChips({ refs }: { refs: FlowStepRequirementRef[] }) {
  if (refs.length === 0) return null;
  return (
    <div
      className="flex flex-wrap items-center gap-1.5"
      data-testid="flow-step-requirement-refs"
    >
      {refs.map((ref) => (
        <Badge
          key={refKey(ref)}
          variant="secondary"
          className="rounded-md font-mono text-[10px] gap-1"
        >
          <BookMarked className="w-3 h-3" />
          {refLabel(ref)}
        </Badge>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Step row (editable)
// ---------------------------------------------------------------------------

function StepRow({
  runId,
  assessmentId,
  step,
  state,
  isLast,
  onViewArtifacts,
}: {
  runId: number;
  assessmentId: number;
  step: FlowStep;
  state: FlowRunStepState | undefined;
  isLast: boolean;
  onViewArtifacts?: () => void;
}) {
  const qc = useQueryClient();
  const status = state?.status ?? "pending";
  const isQuestion = step.type === "question";
  const isArtifact = step.type === "artifact";
  const isInvestigation = step.type === "investigation";
  const options = isQuestion ? stepOptions(step) : [];
  const hasOptions = options.length > 0;
  const artifactType = isArtifact ? stepArtifactType(step) : "";
  const requirementRefs = stepRequirementRefs(step);

  const [draft, setDraft] = useState(isQuestion ? (state?.answer ?? "") : (state?.note ?? ""));
  const [dirty, setDirty] = useState(false);
  const [linkChoice, setLinkChoice] = useState<string>("");
  const [bomChoice, setBomChoice] = useState<string>("");

  // The assessment's generated artifacts back the "create / link" action. Only
  // artifact steps need them, so skip the query for every other step type.
  const { data: artifactsData } = useListConformityArtifacts(assessmentId, {
    query: {
      enabled: isArtifact,
      queryKey: getListConformityArtifactsQueryKey(assessmentId),
    },
  });
  const artifacts = useMemo(() => artifactsData ?? [], [artifactsData]);
  const linkedArtifact = artifacts.find((a) => a.id === state?.artifactId);

  // Investigation steps gate completion server-side on a linked BOM belonging to
  // this assessment with status "analyzed". Only load the BOM list for them.
  const { data: bomsData } = useListAssessmentBoms(assessmentId, {
    query: {
      enabled: isInvestigation,
      queryKey: getListAssessmentBomsQueryKey(assessmentId),
    },
  });
  const boms = useMemo(() => bomsData ?? [], [bomsData]);
  const linkedBom = boms.find((b) => b.id === state?.bomId);
  const bomSelectValue = bomChoice || (state?.bomId ? String(state.bomId) : "");
  // Pre-select the artifact whose type matches the step's authored artifact type.
  const matchingArtifact = artifactType
    ? artifacts.find((a) => a.artifactType === artifactType)
    : undefined;
  const selectValue = linkChoice || (matchingArtifact ? String(matchingArtifact.id) : "");

  // Keep any previously-recorded free-text answer selectable even if it is no
  // longer one of the authored options, so switching a step to a fixed set of
  // choices never silently drops an answer already on record.
  const answerChoices = hasOptions && draft && !options.includes(draft)
    ? [...options, draft]
    : options;

  const update = useUpdateConformityFlowRunStep({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetConformityFlowRunQueryKey(runId) });
        setDirty(false);
      },
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : "Could not update the step."),
    },
  });

  const generate = useGenerateConformityArtifacts({
    mutation: {
      onSuccess: (created) => {
        qc.invalidateQueries({ queryKey: getListConformityArtifactsQueryKey(assessmentId) });
        // Close the loop: if the freshly generated set contains the step's
        // authored artifact type, link it straight away.
        const match = artifactType
          ? created.find((a) => a.artifactType === artifactType)
          : undefined;
        if (match) {
          linkArtifact(match.id);
        } else {
          toast.success("Documents generated. Choose the one to link to this step.");
        }
      },
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : "Could not generate documents."),
    },
  });

  function patch(
    next: Partial<{ status: string; answer: string; note: string; artifactId: number; bomId: number }>,
  ) {
    const nextStatus = (next.status ?? status) as FlowRunStepState["status"];
    // An artifact step can only be completed once its artifact is linked.
    if (nextStatus === "done" && isArtifact && !linkedArtifact && next.artifactId === undefined) {
      toast.error("Link the expected artifact before completing this step.");
      return;
    }
    // An investigation step needs a linked BOM before it can be completed; the
    // server enforces the BOM is analyzed and belongs to this assessment.
    const effectiveBomId = next.bomId ?? state?.bomId;
    if (nextStatus === "done" && isInvestigation && effectiveBomId === undefined) {
      toast.error("Link an analyzed BOM before completing this step.");
      return;
    }
    const body = {
      status: nextStatus,
      ...(isQuestion
        ? { answer: next.answer ?? draft }
        : { note: next.note ?? draft }),
      ...(next.artifactId !== undefined ? { artifactId: next.artifactId } : {}),
      ...(next.bomId !== undefined ? { bomId: next.bomId } : {}),
    };
    update.mutate({ runId, stepKey: step.id, data: body });
  }

  // Persist the artifact link and nudge a still-pending step into progress.
  function linkArtifact(id: number) {
    patch({ artifactId: id, status: status === "pending" ? "in_progress" : status });
  }

  // Persist the BOM link and nudge a still-pending step into progress.
  function linkBom(id: number) {
    patch({ bomId: id, status: status === "pending" ? "in_progress" : status });
  }

  const TypeIcon = STEP_TYPE_ICON[step.type] ?? ClipboardList;
  const StatusIcon = STATUS_ICON[status] ?? CircleDashed;

  return (
    <li className="relative flex gap-4 pb-6 last:pb-0">
      {!isLast && (
        <span className="absolute left-[15px] top-8 bottom-0 w-px bg-border" aria-hidden="true" />
      )}
      <span className="relative z-10 grid shrink-0 place-items-center w-8 h-8 rounded-full border border-border bg-card">
        <StatusIcon className={cn("w-4 h-4", statusIconClass(status))} />
      </span>
      <div className="min-w-0 flex-1 pt-0.5 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <TypeIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          <span className="font-medium text-sm">{step.title}</span>
          <Badge variant="outline" className="rounded-md text-[10px] uppercase tracking-wide">
            {step.type}
          </Badge>
        </div>
        {step.description && (
          <p className="text-xs text-muted-foreground leading-snug">{step.description}</p>
        )}

        <RequirementRefChips refs={requirementRefs} />

        {artifactType && (
          <div
            className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground"
            data-testid="flow-step-artifact-type"
          >
            <FileText className="w-3.5 h-3.5 shrink-0" />
            <span>Expected artifact:</span>
            <Badge variant="outline" className="rounded-md font-mono text-[10px]">
              {artifactType}
            </Badge>
          </div>
        )}

        {isArtifact && (
          <div className="space-y-2" data-testid="flow-step-artifact-action">
            {linkedArtifact && (
              <div
                className="flex flex-wrap items-center gap-2 text-xs"
                data-testid="flow-step-linked-artifact"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
                <span className="text-muted-foreground">Linked artifact:</span>
                <button
                  type="button"
                  onClick={onViewArtifacts}
                  className="inline-flex items-center gap-1.5 font-medium text-primary hover:underline"
                  data-testid="flow-step-artifact-link"
                >
                  {linkedArtifact.label}
                  <Badge variant="outline" className="rounded-md font-mono text-[10px]">
                    v{linkedArtifact.version}
                  </Badge>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            )}

            {artifacts.length === 0 ? (
              <Button
                size="sm"
                variant="outline"
                className="rounded-md h-8"
                disabled={generate.isPending}
                onClick={() => generate.mutate({ id: assessmentId })}
                data-testid="flow-step-create-artifact"
              >
                <FileText
                  className={cn("w-3.5 h-3.5 mr-1.5", generate.isPending && "animate-pulse")}
                />
                Create / link artifact
              </Button>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <Select value={selectValue || undefined} onValueChange={setLinkChoice}>
                  <SelectTrigger
                    className="rounded-md h-8 w-64 text-xs"
                    data-testid="flow-step-artifact-select"
                  >
                    <SelectValue placeholder="Choose an artifact…" />
                  </SelectTrigger>
                  <SelectContent>
                    {artifacts.map((a) => (
                      <SelectItem key={a.id} value={String(a.id)}>
                        {a.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-md h-8"
                  disabled={!selectValue || update.isPending}
                  onClick={() => linkArtifact(Number(selectValue))}
                  data-testid="flow-step-create-artifact"
                >
                  {linkedArtifact ? "Relink artifact" : "Create / link artifact"}
                </Button>
              </div>
            )}
          </div>
        )}

        {isInvestigation && (
          <div className="space-y-2" data-testid="flow-step-bom-action">
            {linkedBom && (
              <div
                className="flex flex-wrap items-center gap-2 text-xs"
                data-testid="flow-step-linked-bom"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-green-600 shrink-0" />
                <span className="text-muted-foreground">Linked BOM:</span>
                <span className="inline-flex items-center gap-1.5 font-medium">
                  <Boxes className="w-3.5 h-3.5" />
                  {linkedBom.name}
                  <Badge
                    variant="outline"
                    className={cn(
                      "rounded-md font-mono text-[10px]",
                      linkedBom.status === "analyzed"
                        ? "border-green-500/30 text-green-600"
                        : "text-muted-foreground",
                    )}
                  >
                    {linkedBom.status}
                  </Badge>
                </span>
              </div>
            )}

            {boms.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                This assessment has no BOMs yet. Ingest and analyze a BOM before completing this
                investigation.
              </p>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <Select value={bomSelectValue || undefined} onValueChange={setBomChoice}>
                  <SelectTrigger
                    className="rounded-md h-8 w-64 text-xs"
                    data-testid="flow-step-bom-select"
                  >
                    <SelectValue placeholder="Choose a BOM…" />
                  </SelectTrigger>
                  <SelectContent>
                    {boms.map((b) => (
                      <SelectItem key={b.id} value={String(b.id)}>
                        {b.name} · {b.status}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-md h-8"
                  disabled={!bomSelectValue || update.isPending}
                  onClick={() => linkBom(Number(bomSelectValue))}
                  data-testid="flow-step-link-bom"
                >
                  {linkedBom ? "Relink BOM" : "Link BOM"}
                </Button>
              </div>
            )}
          </div>
        )}

        {isQuestion && hasOptions ? (
          <Select
            value={draft || undefined}
            onValueChange={(v) => {
              setDraft(v);
              setDirty(false);
              patch({ answer: v });
            }}
          >
            <SelectTrigger className="rounded-md h-8 w-56 text-sm" data-testid="flow-step-answer">
              <SelectValue placeholder="Choose an answer…" />
            </SelectTrigger>
            <SelectContent>
              {answerChoices.map((o) => (
                <SelectItem key={o} value={o}>
                  {o}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <Textarea
            className="rounded-md min-h-16 text-sm"
            placeholder={isQuestion ? "Record your answer…" : "Add a note…"}
            value={draft}
            onChange={(e) => {
              setDraft(e.target.value);
              setDirty(true);
            }}
          />
        )}

        <div className="flex flex-wrap items-center gap-2">
          <Select value={status} onValueChange={(v) => patch({ status: v })}>
            <SelectTrigger className="rounded-md h-8 w-40 text-xs" data-testid="flow-step-status">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STEP_STATUS_OPTIONS.map((o) => (
                <SelectItem
                  key={o.value}
                  value={o.value}
                  disabled={
                    o.value === "done" &&
                    ((isArtifact && !linkedArtifact) || (isInvestigation && !state?.bomId))
                  }
                >
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {dirty && (
            <Button
              size="sm"
              variant="outline"
              className="rounded-md h-8"
              disabled={update.isPending}
              onClick={() => patch({})}
            >
              Save note
            </Button>
          )}
          {state?.completedAt && (
            <span className="text-[11px] text-muted-foreground font-mono">
              done {formatDateTime(state.completedAt)}
            </span>
          )}
        </div>
      </div>
    </li>
  );
}

// ---------------------------------------------------------------------------
// Requirement coverage — computed CLIENT-SIDE from the run snapshot. A
// requirement is "covered" when every snapshot step referencing it is closed
// (done or skipped). No new endpoints.
// ---------------------------------------------------------------------------

type CoverageEntry = { ref: FlowStepRequirementRef; total: number; covered: number };

function computeCoverage(
  steps: FlowStep[],
  stepStates: Record<string, FlowRunStepState>,
): CoverageEntry[] {
  const byKey = new Map<string, CoverageEntry>();
  for (const step of steps) {
    const st = stepStates[step.id]?.status;
    const closed = st === "done" || st === "skipped";
    for (const ref of stepRequirementRefs(step)) {
      const key = refKey(ref);
      const entry = byKey.get(key) ?? { ref, total: 0, covered: 0 };
      entry.total += 1;
      if (closed) entry.covered += 1;
      byKey.set(key, entry);
    }
  }
  return Array.from(byKey.values());
}

function RequirementCoverage({ entries }: { entries: CoverageEntry[] }) {
  if (entries.length === 0) return null;
  const coveredCount = entries.filter((e) => e.covered === e.total).length;
  return (
    <Card className="rounded-md" data-testid="flow-requirement-coverage">
      <CardHeader className="border-b border-border py-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <BookMarked className="w-4 h-4 text-primary" />
          Requirement coverage
          <span className="text-xs font-normal text-muted-foreground">
            {coveredCount}/{entries.length} covered
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4">
        <ul className="flex flex-wrap gap-2">
          {entries.map((e) => {
            const done = e.covered === e.total;
            return (
              <li key={refKey(e.ref)}>
                <Badge
                  variant="outline"
                  className={cn(
                    "rounded-md font-mono text-[10px] gap-1",
                    done
                      ? "border-green-500/30 bg-green-500/10 text-green-600"
                      : "text-muted-foreground",
                  )}
                  data-testid="flow-requirement-coverage-item"
                >
                  {done ? (
                    <CheckCircle2 className="w-3 h-3" />
                  ) : (
                    <CircleDashed className="w-3 h-3" />
                  )}
                  {refLabel(e.ref)}
                  <span className="opacity-70">
                    {e.covered}/{e.total}
                  </span>
                </Badge>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Run detail
// ---------------------------------------------------------------------------

function RunDetail({
  runId,
  onBack,
  onViewArtifacts,
}: {
  runId: number;
  onBack: () => void;
  onViewArtifacts?: () => void;
}) {
  const qc = useQueryClient();
  const { data, isLoading } = useGetConformityFlowRun(runId);
  const { data: session } = useGetAdminSession();
  const isAdmin = session?.role === "admin";

  const adopt = useAdoptConformityFlowRunSteps({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries({ queryKey: getGetConformityFlowRunQueryKey(runId) });
        // Adopting clears drift, so refresh the runs list to hide its "updated" badge.
        qc.invalidateQueries({
          predicate: (q) =>
            typeof q.queryKey[0] === "string" &&
            /^\/api\/conformity\/assessments\/\d+\/flow-runs$/.test(q.queryKey[0]),
        });
        toast.success("This run now follows the latest flow steps.");
      },
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : "Could not adopt the latest steps."),
    },
  });

  if (isLoading || !data) {
    return <Skeleton className="h-96 w-full" />;
  }

  const { run, steps, flowUpdated } = data;
  const progress = runProgress(steps, run.stepStates);
  const coverage = computeCoverage(steps, run.stepStates);

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" className="rounded-md -ml-2" onClick={onBack}>
        <ChevronLeft className="w-4 h-4 mr-1" /> All runs
      </Button>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <GitBranch className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">{run.flowName}</h3>
          <Badge variant="outline" className={cn("rounded-md text-[10px]", runStatusClass(run.status))}>
            {run.status}
          </Badge>
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Started {formatDateTime(run.createdAt)} · {progress}% complete
        </div>
        <Progress value={progress} className="h-1.5 mt-2 max-w-md" />
      </div>

      {flowUpdated && (
        <div
          className="flex flex-wrap items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400"
          data-testid="flow-run-drift-notice"
        >
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>
            This flow has been updated since this run started — the checklist below is the
            original snapshot.
          </span>
          {isAdmin && (
            <Button
              size="sm"
              variant="outline"
              className="rounded-md h-7 ml-auto text-xs"
              disabled={adopt.isPending}
              onClick={() => adopt.mutate({ runId })}
              data-testid="flow-run-adopt-steps"
            >
              Adopt latest steps
            </Button>
          )}
        </div>
      )}

      <RequirementCoverage entries={coverage} />

      <Card className="rounded-md">
        <CardContent className="p-6">
          <ol data-testid="flow-steps">
            {steps.map((step, i) => (
              <StepRow
                key={step.id}
                runId={runId}
                assessmentId={run.assessmentId}
                step={step}
                state={run.stepStates[step.id]}
                isLast={i === steps.length - 1}
                onViewArtifacts={onViewArtifacts}
              />
            ))}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Start-flow control
// ---------------------------------------------------------------------------

function StartFlow({
  assessmentId,
  flows,
  onStarted,
}: {
  assessmentId: number;
  flows: ConformityFlowSummary[];
  onStarted: (runId: number) => void;
}) {
  const qc = useQueryClient();
  const [flowId, setFlowId] = useState<string>("");

  const create = useCreateAssessmentFlowRun({
    mutation: {
      onSuccess: (detail) => {
        qc.invalidateQueries({ queryKey: getListAssessmentFlowRunsQueryKey(assessmentId) });
        toast.success("Flow started.");
        onStarted(detail.run.id);
      },
      onError: (err) => toast.error(err instanceof Error ? err.message : "Could not start the flow."),
    },
  });

  if (flows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No flow templates are available for this assessment yet.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={flowId} onValueChange={setFlowId}>
        <SelectTrigger className="rounded-md w-72" data-testid="flow-select">
          <SelectValue placeholder="Choose a flow to start…" />
        </SelectTrigger>
        <SelectContent>
          {flows.map((f) => (
            <SelectItem key={f.id} value={String(f.id)}>
              {f.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button
        className="rounded-md"
        disabled={!flowId || create.isPending}
        onClick={() => create.mutate({ id: assessmentId, data: { flowId: Number(flowId) } })}
        data-testid="flow-start"
      >
        <Play className="w-4 h-4 mr-2" /> Start flow
      </Button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Panel
// ---------------------------------------------------------------------------

function RunCard({ run, onOpen }: { run: ConformityFlowRunSummary; onOpen: () => void }) {
  const states = Object.values(run.stepStates);
  const total = states.length;
  const closed = states.filter((s) => s.status === "done" || s.status === "skipped").length;
  const pct = total > 0 ? Math.round((closed / total) * 100) : 0;
  return (
    <button
      type="button"
      onClick={onOpen}
      className="w-full text-left rounded-md border border-border bg-card p-4 transition-colors hover:border-primary/40"
      data-testid="flow-run-card"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <GitBranch className="w-4 h-4 text-primary shrink-0" />
          <span className="font-medium truncate">{run.flowName}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {run.flowUpdated && (
            <Badge
              variant="outline"
              className="rounded-md text-[10px] border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400"
              data-testid="flow-run-updated-badge"
            >
              updated
            </Badge>
          )}
          <Badge variant="outline" className={cn("rounded-md text-[10px]", runStatusClass(run.status))}>
            {run.status}
          </Badge>
        </div>
      </div>
      <Progress value={pct} className="h-1.5 mt-3" />
      <div className="mt-1.5 text-[11px] text-muted-foreground font-mono">
        {closed}/{total} steps · started {formatDateTime(run.createdAt)}
      </div>
    </button>
  );
}

export function FlowRunnerPanel({
  assessmentId,
  onViewArtifacts,
}: {
  assessmentId: number;
  onViewArtifacts?: () => void;
}) {
  const { data: runs, isLoading } = useListAssessmentFlowRuns(assessmentId);
  const { data: flows } = useListConformityFlows();
  const [selected, setSelected] = useState<number | null>(null);

  const runList = useMemo(() => runs ?? [], [runs]);
  const flowList = useMemo(() => flows ?? [], [flows]);

  if (selected !== null) {
    return (
      <RunDetail
        runId={selected}
        onBack={() => setSelected(null)}
        onViewArtifacts={onViewArtifacts}
      />
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground max-w-2xl">
        Flows are guided, typed processes — activities, questions, checkpoints, artifacts and
        investigations — you work through for this assessment. Start a flow, step through it, capture
        answers and notes, and its status advances to complete as each step is closed.
      </p>

      <Card className="rounded-md">
        <CardHeader className="border-b border-border py-3">
          <CardTitle className="text-sm">Start a flow</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <StartFlow assessmentId={assessmentId} flows={flowList} onStarted={setSelected} />
        </CardContent>
      </Card>

      {isLoading && <Skeleton className="h-40 w-full" />}

      {!isLoading && runList.length === 0 && (
        <Card className="rounded-md">
          <CardContent className="p-10 text-center text-muted-foreground flex flex-col items-center">
            <GitBranch className="w-10 h-10 mb-3 opacity-20" />
            <p>No flow runs yet.</p>
            <p className="text-xs mt-1">Start a flow above to begin working through it.</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && runList.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {runList.map((run) => (
            <RunCard key={run.id} run={run} onOpen={() => setSelected(run.id)} />
          ))}
        </div>
      )}
    </div>
  );
}
