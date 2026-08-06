import { useState, type ComponentType } from "react";
import { useGetAdminSession } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useNextActions } from "@/hooks/use-next-actions";
import type { ActionGroupKey, ActionTab } from "@/lib/next-actions";
import {
  AlertOctagon,
  Clock,
  ShieldAlert,
  ListChecks,
  FileWarning,
  CheckCircle2,
  ChevronRight,
  AlertTriangle,
  Siren,
  Signpost,
} from "lucide-react";

// Presentation for each priority group; ordering + membership live in lib/next-actions.
const GROUP_STYLE: Record<
  ActionGroupKey,
  { icon: ComponentType<{ className?: string }>; tone: string }
> = {
  blockers: { icon: AlertOctagon, tone: "bg-red-500/10 text-red-500 border-red-500/30" },
  overdue: { icon: Clock, tone: "bg-red-500/10 text-red-500 border-red-500/30" },
  route: { icon: Signpost, tone: "bg-amber-500/10 text-amber-500 border-amber-500/30" },
  risk: { icon: ShieldAlert, tone: "bg-amber-500/10 text-amber-500 border-amber-500/30" },
  duesoon: { icon: Clock, tone: "bg-amber-500/10 text-amber-500 border-amber-500/30" },
  openincidents: { icon: Siren, tone: "bg-amber-500/10 text-amber-500 border-amber-500/30" },
  progress: { icon: ListChecks, tone: "bg-secondary/10 text-secondary border-secondary/30" },
  docs: { icon: FileWarning, tone: "bg-secondary/10 text-secondary border-secondary/30" },
};

export function NextActions({
  assessmentId,
  onNavigate,
}: {
  assessmentId: number;
  onNavigate: (tab: ActionTab) => void;
}) {
  const { groups, loading, anyError, totalOpen, noEvals } = useNextActions(assessmentId);
  // "Mine" is a RENDER-ONLY filter: journey/readiness derive from the full
  // worklist (summarizeWork), so filtering here can never contradict them.
  const [mineOnly, setMineOnly] = useState(false);
  const { data: session } = useGetAdminSession();
  const me = session?.username ?? "";

  if (loading) return <Skeleton className="h-64 w-full" />;

  if (anyError) {
    return (
      <Card className="rounded-md border-destructive/30">
        <CardContent className="p-10 text-center space-y-2">
          <AlertTriangle className="w-8 h-8 text-destructive mx-auto" />
          <p className="font-medium">Couldn't load the action list.</p>
          <p className="text-muted-foreground text-sm">
            The evaluations, incidents or documents failed to load. Check the other tabs or refresh
            the page.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (noEvals) {
    return (
      <Card className="rounded-md">
        <CardContent className="p-10 text-center space-y-4">
          <p className="text-muted-foreground">
            No requirements to act on yet. Complete the scoping wizard to build the requirement
            checklist.
          </p>
          <Button className="rounded-md" onClick={() => onNavigate("wizard")}>
            Go to wizard
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (totalOpen === 0) {
    return (
      <Card className="rounded-md border-green-500/30">
        <CardContent className="p-10 text-center space-y-3">
          <CheckCircle2 className="w-10 h-10 text-green-600 mx-auto" />
          <p className="font-medium">You're all caught up.</p>
          <p className="text-muted-foreground text-sm">
            No blockers, overdue deadlines, or open gaps. Review readiness to confirm the grade.
          </p>
          <Button variant="outline" className="rounded-md" onClick={() => onNavigate("readiness")}>
            View readiness
          </Button>
        </CardContent>
      </Card>
    );
  }

  const MAX = 6;

  const visibleGroups = mineOnly
    ? groups
        .map((g) => ({ ...g, items: g.items.filter((i) => i.owner === me) }))
        .filter((g) => g.items.length > 0)
    : groups;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        <label
          htmlFor="mine-filter"
          className="text-sm text-muted-foreground cursor-pointer select-none"
        >
          Assigned to me
        </label>
        <Switch
          id="mine-filter"
          checked={mineOnly}
          onCheckedChange={setMineOnly}
          data-testid="mine-filter"
        />
      </div>
      {mineOnly && visibleGroups.length === 0 && (
        <Card className="rounded-md" data-testid="mine-empty">
          <CardContent className="p-10 text-center space-y-2">
            <p className="font-medium">Nothing is assigned to you.</p>
            <p className="text-muted-foreground text-sm">
              Turn the filter off to see the full worklist, or pick up an unassigned item.
            </p>
          </CardContent>
        </Card>
      )}
      {visibleGroups.map((g) => {
        const { icon: Icon, tone } = GROUP_STYLE[g.key];
        const shown = g.items.slice(0, MAX);
        const extra = g.items.length - shown.length;
        return (
          <Card key={g.key} className="rounded-md overflow-hidden">
            <div className="flex items-start gap-3 p-4 border-b border-border">
              <span className={cn("shrink-0 grid place-items-center w-9 h-9 rounded-md border", tone)}>
                <Icon className="w-4 h-4" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{g.label}</h3>
                  <Badge variant="outline" className="rounded-md font-mono text-[10px]">
                    {g.items.length}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{g.hint}</p>
              </div>
            </div>
            <ul className="divide-y divide-border">
              {shown.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => onNavigate(item.tab)}
                    className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium leading-snug truncate">{item.title}</div>
                      {item.detail && (
                        <div className="text-xs text-muted-foreground mt-0.5 truncate">
                          {item.detail}
                        </div>
                      )}
                    </div>
                    {item.unassignedBlocker && (
                      <Badge
                        variant="outline"
                        className="rounded-md text-[10px] shrink-0 bg-amber-500/10 text-amber-600 border-amber-500/40"
                        data-testid={`unassigned-${item.id}`}
                      >
                        Unassigned
                      </Badge>
                    )}
                    <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 group-hover:text-foreground transition-colors" />
                  </button>
                </li>
              ))}
            </ul>
            {extra > 0 && (
              <button
                type="button"
                onClick={() => onNavigate(g.tab)}
                className="w-full text-center text-xs text-muted-foreground hover:text-foreground py-2 border-t border-border transition-colors"
              >
                +{extra} more — open {g.label.toLowerCase()}
              </button>
            )}
          </Card>
        );
      })}
    </div>
  );
}
