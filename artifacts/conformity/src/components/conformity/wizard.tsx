import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useSaveConformityAnswers,
  useSelectConformityRoute,
  useInstantiateConformityRequirements,
} from "@workspace/api-client-react";
import type {
  ConformityAssessmentDetail,
  ConformityFlow,
  FlowQuestion,
} from "@workspace/api-client-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldCheck,
  ListChecks,
  AlertTriangle,
} from "lucide-react";
import { StandardsEditor } from "@/components/conformity/standards-editor";

type Props = {
  detail: ConformityAssessmentDetail;
  flow: ConformityFlow;
  onGoToGaps: () => void;
};

function findBool(detail: ConformityAssessmentDetail, key: string): boolean | undefined {
  return detail.answers.find((a) => a.questionKey === key)?.value.bool;
}

function YesNo({
  value,
  onChange,
  disabled,
}: {
  value: boolean | undefined;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex gap-2 shrink-0">
      <Button
        type="button"
        size="sm"
        variant={value === true ? "default" : "outline"}
        className="rounded-md w-16"
        disabled={disabled}
        onClick={() => onChange(true)}
      >
        Yes
      </Button>
      <Button
        type="button"
        size="sm"
        variant={value === false ? "default" : "outline"}
        className="rounded-md w-16"
        disabled={disabled}
        onClick={() => onChange(false)}
      >
        No
      </Button>
    </div>
  );
}

function QuestionRow({
  q,
  value,
  onChange,
  disabled,
}: {
  q: FlowQuestion;
  value: boolean | undefined;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-4 border-b border-border/60 last:border-0">
      <div className="space-y-1">
        <div className="text-sm font-medium leading-snug">{q.title}</div>
        {q.help && <p className="text-xs text-muted-foreground leading-relaxed">{q.help}</p>}
        <Badge variant="outline" className="font-mono text-[10px] rounded-md">
          {q.citation}
        </Badge>
      </div>
      <YesNo value={value} onChange={onChange} disabled={disabled} />
    </div>
  );
}

export function Wizard({ detail, flow, onGoToGaps }: Props) {
  const qc = useQueryClient();
  const id = detail.assessment.id;
  const invalidate = () => qc.invalidateQueries();

  const saveAnswers = useSaveConformityAnswers({ mutation: { onSuccess: invalidate } });
  const selectRoute = useSelectConformityRoute({ mutation: { onSuccess: invalidate } });
  const instantiate = useInstantiateConformityRequirements({ mutation: { onSuccess: invalidate } });

  const [scope, setScope] = useState<Record<string, boolean | undefined>>(() => {
    const seed: Record<string, boolean | undefined> = {};
    for (const q of flow.scoping.questions) seed[q.key] = findBool(detail, q.key);
    return seed;
  });
  const [cats, setCats] = useState<string[]>(
    () => detail.answers.find((a) => a.questionKey === "product_categories")?.value.options ?? [],
  );
  const routeKey = detail.assessment.routeKey ?? "";
  const harmonised = findBool(detail, "applies_harmonised_standards");

  const saveScoping = () => {
    const answers = flow.scoping.questions
      .filter((q) => typeof scope[q.key] === "boolean")
      .map((q) => ({ questionKey: q.key, value: { bool: scope[q.key]! } }));
    if (answers.length > 0) saveAnswers.mutate({ id, data: { answers } });
  };

  const toggleCat = (value: string, checked: boolean) => {
    setCats((prev) => (checked ? [...new Set([...prev, value])] : prev.filter((v) => v !== value)));
  };

  const saveClassification = () => {
    saveAnswers.mutate({
      id,
      data: { answers: [{ questionKey: "product_categories", value: { options: cats } }] },
    });
  };

  const saveFork = (v: boolean) => {
    saveAnswers.mutate({
      id,
      data: { answers: [{ questionKey: "applies_harmonised_standards", value: { bool: v } }] },
    });
  };

  const inScope = detail.scope.result === "in_scope";
  const scopeDecided = detail.scope.answered;
  const busy = saveAnswers.isPending || selectRoute.isPending || instantiate.isPending;
  const instantiated = detail.counts.evaluationsTotal > 0;

  return (
    <div className="space-y-6">
      {/* Step 1 — Scoping */}
      <Card className="rounded-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground text-xs font-mono font-bold">
              1
            </span>
            <CardTitle>{flow.scoping.title}</CardTitle>
          </div>
          <CardDescription>{flow.scoping.description}</CardDescription>
        </CardHeader>
        <CardContent>
          {flow.scoping.questions.map((q) => (
            <QuestionRow
              key={q.key}
              q={q}
              value={scope[q.key]}
              onChange={(v) => setScope((p) => ({ ...p, [q.key]: v }))}
              disabled={busy}
            />
          ))}

          {scopeDecided && (
            <div
              className={cn(
                "mt-4 p-4 border flex items-start gap-3",
                inScope
                  ? "border-green-500/30 bg-green-500/5 text-green-700"
                  : "border-red-500/30 bg-red-500/5 text-red-700",
              )}
            >
              {inScope ? (
                <CheckCircle2 className="w-5 h-5 mt-0.5 shrink-0" />
              ) : (
                <XCircle className="w-5 h-5 mt-0.5 shrink-0" />
              )}
              <div className="space-y-1">
                <div className="font-medium text-sm">
                  {inScope ? "In scope of the Cyber Resilience Act" : "Out of scope"}
                </div>
                {detail.scope.reasons.length > 0 && (
                  <ul className="text-xs list-disc pl-4 space-y-0.5 text-muted-foreground">
                    {detail.scope.reasons.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t border-border pt-4">
          <Button className="rounded-md" onClick={saveScoping} disabled={busy}>
            Save scoping
          </Button>
        </CardFooter>
      </Card>

      {/* Step 2 — Classification */}
      <Card className={cn("rounded-md", !inScope && "opacity-60")}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground text-xs font-mono font-bold">
              2
            </span>
            <CardTitle>{flow.classification.title}</CardTitle>
          </div>
          <CardDescription>{flow.classification.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {flow.classification.groups.map((group) => (
            <div key={group.classKey}>
              <div className="flex items-center gap-2 mb-2">
                <h4 className="text-sm font-semibold">{group.classLabel}</h4>
                <Badge variant="outline" className="font-mono text-[10px] rounded-md">
                  {group.citation}
                </Badge>
              </div>
              <div className="grid sm:grid-cols-2 gap-2">
                {group.options.map((opt) => (
                  <label
                    key={opt.value}
                    className="flex items-start gap-2 p-2 border border-border/60 hover:bg-muted/40 cursor-pointer"
                  >
                    <Checkbox
                      checked={cats.includes(opt.value)}
                      onCheckedChange={(c) => toggleCat(opt.value, c === true)}
                      disabled={busy || !inScope}
                      className="mt-0.5"
                    />
                    <span className="text-xs leading-snug">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}

          <div className="p-4 border border-border bg-muted/30 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 mt-0.5 shrink-0 text-primary" />
            <div>
              <div className="text-sm font-medium">
                Determined class: {detail.classification.classLabel}
              </div>
              <div className="text-xs text-muted-foreground font-mono">
                {detail.classification.citation}
              </div>
              {detail.classification.matched.length > 0 && (
                <div className="text-xs text-muted-foreground mt-1">
                  {detail.classification.matched.length} categor
                  {detail.classification.matched.length === 1 ? "y" : "ies"} selected — highest risk
                  wins.
                </div>
              )}
            </div>
          </div>
        </CardContent>
        <CardFooter className="border-t border-border pt-4">
          <Button
            className="rounded-md"
            onClick={saveClassification}
            disabled={busy || !inScope}
          >
            Save classification
          </Button>
        </CardFooter>
      </Card>

      {/* Step 3 — Route */}
      <Card className={cn("rounded-md", !inScope && "opacity-60")}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 bg-primary text-primary-foreground text-xs font-mono font-bold">
              3
            </span>
            <CardTitle>{flow.route.title}</CardTitle>
          </div>
          <CardDescription>{flow.route.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {detail.classification.classKey === "important_class_i" && (
            <div className="flex items-start justify-between gap-4 p-4 border border-border bg-muted/30">
              <div className="space-y-1">
                <div className="text-sm font-medium leading-snug">
                  {flow.route.forkQuestion.title}
                </div>
                {flow.route.forkQuestion.help && (
                  <p className="text-xs text-muted-foreground">{flow.route.forkQuestion.help}</p>
                )}
                <Badge variant="outline" className="font-mono text-[10px] rounded-md">
                  {flow.route.forkQuestion.citation}
                </Badge>
              </div>
              <YesNo value={harmonised} onChange={saveFork} disabled={busy || !inScope} />
            </div>
          )}

          <div className="space-y-2">
            {detail.allowedRoutes.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Complete classification to see the applicable routes.
              </p>
            )}
            {detail.allowedRoutes.map((route) => {
              const active = route.key === routeKey;
              const recommended = route.key === detail.recommendedRouteKey;
              return (
                <button
                  key={route.key}
                  type="button"
                  disabled={busy || !inScope}
                  onClick={() => selectRoute.mutate({ id, data: { routeKey: route.key } })}
                  className={cn(
                    "w-full text-left p-4 border transition-colors disabled:opacity-60",
                    active
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border hover:bg-muted/40",
                  )}
                >
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{route.name}</span>
                      {recommended && (
                        <Badge className="rounded-md text-[10px] bg-primary">Recommended</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {route.thirdPartyRequired ? (
                        <Badge variant="outline" className="rounded-md text-[10px] text-orange-600 border-orange-500/40">
                          Notified body
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="rounded-md text-[10px] text-green-600 border-green-500/40">
                          Self-assessment
                        </Badge>
                      )}
                      {active && <CheckCircle2 className="w-4 h-4 text-primary" />}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{route.description}</p>
                </button>
              );
            })}
          </div>

          {/* Art 32(2) route-validity advisory — server-computed so this alert
              and the Next Actions worklist can never disagree. */}
          {detail.standardsAdvisory && (
            <div
              data-testid="standards-advisory"
              className="flex items-start gap-3 p-4 border border-orange-500/40 bg-orange-500/10"
            >
              <AlertTriangle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
              <p className="text-xs leading-relaxed">{detail.standardsAdvisory}</p>
            </div>
          )}

          {inScope && detail.classification.classKey && (
            <StandardsEditor
              assessmentId={id}
              standards={detail.assessment.appliedStandards}
              disabled={busy}
            />
          )}
        </CardContent>
        <CardFooter className="border-t border-border pt-4 flex-wrap gap-3">
          <Button
            variant="outline"
            className="rounded-md"
            onClick={() => instantiate.mutate({ id })}
            disabled={busy || !inScope || !routeKey}
          >
            <ListChecks className="w-4 h-4 mr-2" />
            {instantiated ? "Refresh requirement checklist" : "Build requirement checklist"}
          </Button>
          {instantiated && (
            <Button className="rounded-md" onClick={onGoToGaps} disabled={busy}>
              Go to gap assessment
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
