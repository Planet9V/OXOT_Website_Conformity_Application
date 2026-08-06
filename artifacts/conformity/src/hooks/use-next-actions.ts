import { useMemo } from "react";
import {
  useListConformityEvaluations,
  useListConformityIncidents,
  useListConformityArtifacts,
  useGetConformityAssessment,
} from "@workspace/api-client-react";
import {
  buildActionGroups,
  summarizeWork,
  type ActionGroup,
  type ActionItem,
  type WorkSummary,
} from "@/lib/next-actions";

export interface NextActionsState {
  groups: ActionGroup[];
  loading: boolean;
  anyError: boolean;
  /** The single highest-priority action, or null when there is nothing to do. */
  topAction: { group: ActionGroup; item: ActionItem } | null;
  totalOpen: number;
  /** True when the requirement checklist has not been built yet. */
  noEvals: boolean;
  /** Journey-oriented rollup of the same worklist (one source of truth). */
  summary: WorkSummary;
}

/**
 * Shared source of truth for the prioritised action worklist. Drives both the
 * full NextActions panel and the "next best action" nudge in the header so the
 * two can never disagree about what matters most.
 */
export function useNextActions(assessmentId: number): NextActionsState {
  const {
    data: evaluations,
    isLoading: evalLoading,
    isError: evalError,
  } = useListConformityEvaluations(assessmentId);
  const {
    data: incidents,
    isLoading: incLoading,
    isError: incError,
  } = useListConformityIncidents(assessmentId);
  const {
    data: artifacts,
    isLoading: artLoading,
    isError: artError,
  } = useListConformityArtifacts(assessmentId);
  // Route-validity advisory comes from the assessment detail (server-computed,
  // one source of truth with the wizard). react-query dedupes this with the
  // assessment page's own detail query. Advisory is additive: a detail error
  // must not blank the whole panel, so it joins `loading` but not `anyError`.
  const { data: detail, isLoading: detailLoading } = useGetConformityAssessment(assessmentId);

  const groups = useMemo(
    () =>
      buildActionGroups(
        evaluations ?? [],
        incidents ?? [],
        artifacts ?? [],
        Date.now(),
        detail?.standardsAdvisory ?? null,
      ),
    [evaluations, incidents, artifacts, detail],
  );

  const topAction = useMemo(() => {
    const g = groups[0];
    if (!g || g.items.length === 0) return null;
    return { group: g, item: g.items[0] };
  }, [groups]);

  const summary = useMemo(
    () => summarizeWork(groups, incidents ?? [], artifacts ?? []),
    [groups, incidents, artifacts],
  );

  return {
    groups,
    loading: evalLoading || incLoading || artLoading || detailLoading,
    anyError: evalError || incError || artError,
    topAction,
    totalOpen: groups.reduce((n, g) => n + g.items.length, 0),
    noEvals: (evaluations?.length ?? 0) === 0,
    summary,
  };
}
