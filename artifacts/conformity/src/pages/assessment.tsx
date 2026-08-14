import { useState, type ComponentType } from "react";
import { useParams, Link } from "wouter";
import {
  useGetConformityAssessment,
  getGetConformityAssessmentQueryKey,
  useGetConformityFlow,
  getGetConformityFlowQueryKey,
  useListConformityGrades,
  getListConformityGradesQueryKey,
  useGetAdminSession,
} from "@workspace/api-client-react";
import { useTour } from "@/hooks/use-tour";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { stageLabel } from "@/lib/conformity";
import { computeJourney } from "@/lib/journey";
import type { ActionTab } from "@/lib/next-actions";
import { useNextActions } from "@/hooks/use-next-actions";
import { ReadinessRing } from "@/components/conformity/readiness-ring";
import { TermHint } from "@/components/conformity/glossary-dialog";
import { JourneyStepper } from "@/components/conformity/journey-stepper";
import { GapWorklist } from "@/components/conformity/gap-worklist";
import { ArtifactsPanel } from "@/components/conformity/artifacts-panel";
import { GradePanel } from "@/components/conformity/grade-panel";
import { IncidentsPanel } from "@/components/conformity/incidents-panel";
import { BomVaultPanel } from "@/components/conformity/bom-vault-panel";
import { FlowRunnerPanel } from "@/components/conformity/flow-runner-panel";
import { ProvenancePanel } from "@/components/conformity/provenance-panel";
import { ReportsPanel } from "@/components/conformity/reports-panel";
import { NextActions } from "@/components/conformity/next-actions";
import { Wizard } from "@/components/conformity/wizard";
import { AssistantDock } from "@/components/conformity/assistant-dock";
import { ArrowLeft, ArrowRight, CheckCircle2, Compass, AlertOctagon } from "lucide-react";

function Stat({ label, value, tone }: { label: string; value: number; tone?: "danger" | "warn" }) {
  return (
    <div className="border border-border rounded-md px-4 py-2 bg-card">
      <div
        className={cn(
          "text-2xl font-bold font-mono leading-none text-foreground",
          tone === "danger" && value > 0 && "text-destructive",
          tone === "warn" && value > 0 && "text-amber-500",
        )}
      >
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

type NudgeTone = "danger" | "focus" | "ready" | "start";

function NudgeCard({
  eyebrow,
  title,
  detail,
  actionLabel,
  onAction,
  tone,
  icon: Icon,
}: {
  eyebrow?: string;
  title: string;
  detail?: string;
  actionLabel: string;
  onAction: () => void;
  tone: NudgeTone;
  icon: ComponentType<{ className?: string }>;
}) {
  const toneClass: Record<NudgeTone, string> = {
    danger: "border-destructive/30 bg-destructive/5 text-foreground",
    focus: "border-primary/30 bg-primary/5 text-foreground",
    ready: "border-green-500/30 bg-green-500/5 text-foreground",
    start: "border-secondary/30 bg-secondary/5 text-foreground",
  };
  const iconClass: Record<NudgeTone, string> = {
    danger: "bg-destructive/10 text-destructive",
    focus: "bg-primary/10 text-primary",
    ready: "bg-green-500/10 text-green-600",
    start: "bg-secondary/10 text-secondary",
  };
  return (
    <div className={cn("flex items-center gap-4 rounded-md border p-4", toneClass[tone])}>
      <span
        className={cn(
          "hidden sm:grid shrink-0 place-items-center w-10 h-10 rounded-md",
          iconClass[tone],
        )}
      >
        <Icon className="w-5 h-5" />
      </span>
      <div className="min-w-0 flex-1">
        {eyebrow && (
          <div className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {eyebrow}
          </div>
        )}
        <div className="font-medium leading-snug truncate text-foreground">{title}</div>
        {detail && <div className="text-xs text-muted-foreground mt-0.5 truncate">{detail}</div>}
      </div>
      <Button size="sm" className="rounded-md shrink-0" onClick={onAction}>
        {actionLabel}
      </Button>
    </div>
  );
}

const TAB_NAME: Record<ActionTab, string> = {
  wizard: "wizard",
  gaps: "gap assessment",
  artifacts: "documents",
  readiness: "readiness",
  incidents: "incidents",
};

export default function Assessment() {
  const params = useParams();
  const id = Number(params.id);
  const [tab, setTab] = useState("actions");

  const {
    data: detail,
    isLoading,
    isError,
  } = useGetConformityAssessment(id, {
    query: { enabled: !!id, queryKey: getGetConformityAssessmentQueryKey(id) },
  });
  const regKey = detail?.assessment.regulationKey ?? "cra";
  const { data: flow } = useGetConformityFlow(regKey, {
    query: { enabled: !!detail, queryKey: getGetConformityFlowQueryKey(regKey) },
  });
  const { data: grades } = useListConformityGrades(id, {
    query: { enabled: !!id, queryKey: getListConformityGradesQueryKey(id) },
  });
  const {
    topAction,
    noEvals,
    totalOpen,
    summary,
    loading: naLoading,
    anyError: naError,
  } = useNextActions(id);

  const { data: session, isLoading: sessionLoading } = useGetAdminSession();
  useTour("workbench", {
    ready: !isLoading && !!detail && !sessionLoading,
    isDemoRole: session?.role === "demo",
    isMember: session?.role === "member",
  });

  if (isLoading) {
    return (
      <div className="px-4 py-8 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (isError || !detail) {
    return (
      <div className="px-4 py-8 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-destructive border border-destructive/20 rounded-md p-4 bg-destructive/5">
          Assessment not found or failed to load.
        </div>
      </div>
    );
  }

  const a = detail.assessment;
  const inScope = detail.scope.result === "in_scope";
  const latestGrade = grades?.[0] ?? null;
  const journey = computeJourney(detail, latestGrade, summary);

  const artifactMeta = {
    productName: detail.product.name,
    regulationLabel: a.regulationKey.toUpperCase(),
    className: detail.className,
    routeName: detail.routeName,
    stageLabel: stageLabel(a.currentStage),
  };

  function renderNudge() {
    if (noEvals) {
      return (
        <NudgeCard
          tone="start"
          icon={Compass}
          title="Start with the scoping wizard"
          detail="Answer the scoping questions to build this assessment's requirement checklist."
          actionLabel="Open wizard"
          onAction={() => setTab("wizard")}
        />
      );
    }
    if (journey.readyForReview) {
      return (
        <NudgeCard
          tone="ready"
          icon={CheckCircle2}
          title="Ready for internal review"
          detail="Grade meets the bar with no blockers or open incidents. This is not a legal declaration of conformity."
          actionLabel="View readiness"
          onAction={() => setTab("readiness")}
        />
      );
    }
    if (topAction) {
      const urgent = topAction.group.key === "blockers" || topAction.group.key === "overdue";
      return (
        <NudgeCard
          eyebrow="Next best action"
          tone={urgent ? "danger" : "focus"}
          icon={urgent ? AlertOctagon : ArrowRight}
          title={topAction.item.title}
          detail={[topAction.group.label, topAction.item.detail].filter(Boolean).join(" · ")}
          actionLabel={`Go to ${TAB_NAME[topAction.item.tab]}`}
          onAction={() => setTab(topAction.item.tab)}
        />
      );
    }
    if (totalOpen === 0) {
      return (
        <NudgeCard
          tone="focus"
          icon={CheckCircle2}
          title="You're all caught up"
          detail="No blockers, overdue deadlines, or open gaps. Compute the readiness grade to confirm."
          actionLabel="View readiness"
          onAction={() => setTab("readiness")}
        />
      );
    }
    return null;
  }

  return (
    <div className="px-4 py-8 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6">
      <Link
        href={`/products/${detail.product.id}`}
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> {detail.product.name}
      </Link>

      <header className="space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{detail.product.name}</h1>
          <div className="flex items-center gap-2 flex-wrap mt-2">
            <Badge className="rounded-md bg-reg-cra text-primary-foreground font-mono text-[10px]">
              {a.regulationKey.toUpperCase()}
            </Badge>
            <Badge variant="outline" className="rounded-md border-border text-foreground">
              Stage: {stageLabel(a.currentStage)}
            </Badge>
            {detail.scope.answered && (
              <Badge
                variant="outline"
                className={cn(
                  "rounded-md",
                  inScope ? "text-green-600 border-green-500/40" : "text-red-600 border-red-500/40",
                )}
              >
                {inScope ? "In scope" : "Out of scope"}
              </Badge>
            )}
            {detail.className && (
              <TermHint terms={["scope"]}>
                <Badge variant="outline" className="rounded-md border-border text-foreground">
                  {detail.className}
                </Badge>
              </TermHint>
            )}
            {detail.routeName && (
              <TermHint terms={["route"]}>
                <Badge variant="outline" className="rounded-md border-border text-foreground">
                  {detail.routeName}
                </Badge>
              </TermHint>
            )}
          </div>
        </div>

        <Card className="rounded-md border-border bg-card" data-tour="journey-card">
          <CardContent className="p-5">
            <div className="grid gap-6 md:grid-cols-[auto_1fr] md:items-center">
              <div className="flex justify-center md:block">
                <ReadinessRing grade={latestGrade} />
              </div>
              <div className="space-y-4">
                {naLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-2 w-full" />
                    <Skeleton className="h-16 w-full" />
                  </div>
                ) : naError ? (
                  <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm">
                    <div className="font-medium text-foreground">Couldn't load the compliance journey.</div>
                    <div className="text-muted-foreground mt-0.5">
                      The evaluations, incidents or documents failed to load. Try the tabs below or
                      refresh the page.
                    </div>
                  </div>
                ) : (
                  <>
                    <JourneyStepper journey={journey} />
                    {renderNudge()}
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Stat label="Requirements" value={detail.counts.evaluationsTotal} />
          <Stat label="Met" value={detail.counts.evaluationsMet} />
          <Stat label="Not met" value={detail.counts.evaluationsNotMet} tone="danger" />
          <Stat label="Evidence" value={detail.counts.evidenceCount} />
          <Stat label="Open incidents" value={detail.counts.openIncidents} tone="warn" />
          <Stat label="Notify gaps" value={detail.counts.notificationGaps} tone="warn" />
        </div>
      </header>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList
          className="rounded-md w-full justify-start h-auto flex-nowrap overflow-x-auto border-border bg-muted p-1"
          data-tour="workbench-tabs"
        >
          <TabsTrigger value="actions" className="rounded-md" data-testid="tab-next-actions">
            Next actions
          </TabsTrigger>
          <TabsTrigger value="wizard" className="rounded-md" data-testid="tab-wizard">
            Wizard
          </TabsTrigger>
          <TabsTrigger value="gaps" className="rounded-md">
            Gap assessment
          </TabsTrigger>
          <TabsTrigger value="artifacts" className="rounded-md">
            Documents ({detail.counts.evidenceCount})
          </TabsTrigger>
          <TabsTrigger value="readiness" className="rounded-md">
            Readiness
          </TabsTrigger>
          <TabsTrigger value="incidents" className="rounded-md">
            Incidents ({detail.counts.openIncidents})
          </TabsTrigger>
          <TabsTrigger value="boms" className="rounded-md">
            BOM vault
          </TabsTrigger>
          <TabsTrigger value="flows" className="rounded-md">
            Flows
          </TabsTrigger>
          <TabsTrigger value="provenance" className="rounded-md">
            Provenance
          </TabsTrigger>
          <TabsTrigger value="reports" className="rounded-md">
            Reports
          </TabsTrigger>
        </TabsList>

        <TabsContent value="actions">
          <NextActions assessmentId={id} onNavigate={(t) => setTab(t)} />
        </TabsContent>

        <TabsContent value="wizard">
          {flow ? <Wizard detail={detail} flow={flow} onGoToGaps={() => setTab("gaps")} /> : null}
        </TabsContent>

        <TabsContent value="gaps">
          <GapWorklist assessmentId={id} />
        </TabsContent>

        <TabsContent value="artifacts">
          <ArtifactsPanel assessmentId={id} meta={artifactMeta} />
        </TabsContent>

        <TabsContent value="readiness">
          <GradePanel assessmentId={id} />
        </TabsContent>

        <TabsContent value="incidents">
          <IncidentsPanel assessmentId={id} />
        </TabsContent>

        <TabsContent value="boms">
          <BomVaultPanel assessmentId={id} productName={detail?.product.name || "Product"} />
        </TabsContent>

        <TabsContent value="flows">
          <FlowRunnerPanel assessmentId={id} />
        </TabsContent>

        <TabsContent value="provenance">
          <ProvenancePanel assessmentId={id} />
        </TabsContent>

        <TabsContent value="reports">
          <ReportsPanel assessmentId={id} />
        </TabsContent>
      </Tabs>

      <AssistantDock assessmentId={id} productName={detail?.product.name || "Product"} />
    </div>
  );
}
