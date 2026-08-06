import { useListAssessmentActivity } from "@workspace/api-client-react";
import type { ConformityActivityEntry } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { formatDateTime } from "@/lib/conformity";
import {
  Boxes,
  FileText,
  Paperclip,
  GitBranch,
  Megaphone,
  ShieldAlert,
  Gauge,
  ListChecks,
  User,
  Activity as ActivityIcon,
  type LucideIcon,
} from "lucide-react";

/**
 * Provenance timeline — renders the assessment's append-only activity ledger as
 * a chain-of-custody feed. Every meaningful action (evidence added, BOM
 * ingested/analyzed, artifact generated, flow step completed) shows its actor,
 * timestamp and — where relevant — the content hash tying it to an exact payload.
 */

const ENTITY_ICON: Record<string, LucideIcon> = {
  bom: Boxes,
  bom_notification: Megaphone,
  evidence: Paperclip,
  artifact: FileText,
  flow_run: GitBranch,
  incident: ShieldAlert,
  grade: Gauge,
  assessment: ActivityIcon,
  evaluation: ListChecks,
  member: User,
};

const ENTITY_LABEL: Record<string, string> = {
  bom: "BOM",
  bom_notification: "Upstream notice",
  evidence: "Evidence",
  artifact: "Document",
  flow_run: "Flow",
  incident: "Incident",
  grade: "Readiness",
  assessment: "Assessment",
  evaluation: "Requirement",
  member: "Team",
};

function actionClass(action: string): string {
  switch (action) {
    case "created":
    case "generated":
      return "bg-primary/10 text-primary border-primary/30";
    case "analyzed":
    case "parsed":
      return "bg-blue-500/10 text-blue-600 border-blue-500/30";
    case "completed":
      return "bg-green-500/10 text-green-600 border-green-500/30";
    case "deleted":
      return "bg-red-500/10 text-red-600 border-red-500/30";
    default:
      return "bg-muted text-muted-foreground border-border";
  }
}

function actorLabel(actor: string): string {
  if (!actor) return "system";
  // Actor is stored as "role:username" — show the username, keep the role subtle.
  const [role, username] = actor.split(":");
  return username || role || actor;
}

function Row({ entry, last }: { entry: ConformityActivityEntry; last: boolean }) {
  const Icon = ENTITY_ICON[entry.entityType] ?? ActivityIcon;
  return (
    <li className="relative flex gap-4 pb-6 last:pb-0">
      {/* Connector rail */}
      {!last && (
        <span className="absolute left-[15px] top-8 bottom-0 w-px bg-border" aria-hidden="true" />
      )}
      <span className="relative z-10 grid shrink-0 place-items-center w-8 h-8 rounded-full border border-border bg-card text-muted-foreground">
        <Icon className="w-4 h-4" />
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="rounded-md text-[10px] uppercase tracking-wide">
            {ENTITY_LABEL[entry.entityType] ?? entry.entityType}
          </Badge>
          <Badge variant="outline" className={cn("rounded-md text-[10px]", actionClass(entry.action))}>
            {entry.action}
          </Badge>
        </div>
        <p className="mt-1.5 text-sm text-foreground leading-snug break-words">{entry.summary}</p>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground font-mono">
          <span>{formatDateTime(entry.createdAt)}</span>
          <span>· {entry.actorDisplay || actorLabel(entry.actor)}</span>
          {entry.source && <span>· via {entry.source}</span>}
          {entry.hash && (
            <span title={entry.hash} className="truncate max-w-[10rem]">
              · sha256:{entry.hash.slice(0, 12)}
            </span>
          )}
        </div>
      </div>
    </li>
  );
}

export function ProvenancePanel({ assessmentId }: { assessmentId: number }) {
  const { data: entries, isLoading, isError } = useListAssessmentActivity(assessmentId);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground max-w-2xl">
        An append-only chain-of-custody feed of every action taken on this assessment — evidence
        attached, BOMs ingested and analyzed, documents generated and flow steps completed — with the
        actor, timestamp and content hash an auditor needs to reconstruct what happened.
      </p>

      {isLoading && <Skeleton className="h-64 w-full" />}

      {isError && (
        <Card className="rounded-md border-destructive/30">
          <CardContent className="p-6 text-sm text-destructive">
            Couldn&apos;t load the provenance ledger. Please refresh and try again.
          </CardContent>
        </Card>
      )}

      {!isLoading && !isError && (entries?.length ?? 0) === 0 && (
        <Card className="rounded-md">
          <CardContent className="p-10 text-center text-muted-foreground flex flex-col items-center">
            <ActivityIcon className="w-10 h-10 mb-3 opacity-20" />
            <p>No activity recorded yet.</p>
            <p className="text-xs mt-1">
              Actions like adding evidence or ingesting a BOM will appear here.
            </p>
          </CardContent>
        </Card>
      )}

      {!isLoading && (entries?.length ?? 0) > 0 && (
        <Card className="rounded-md">
          <CardContent className="p-6">
            <ol data-testid="provenance-feed">
              {entries!.map((entry, i) => (
                <Row key={entry.id} entry={entry} last={i === entries!.length - 1} />
              ))}
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
