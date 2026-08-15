import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Building2, Scale, Info, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

/**
 * Who this organisation is, in regulatory terms.
 *
 * Two separate questions, because four of the five acts modelled here regulate
 * a "manufacturer": role alone would show an OT hardware maker the AI Act
 * duties it does not carry.
 *
 * Nothing on this page asserts conformity. Declaring a role or an act brings
 * its obligations into view; whether they are met is assessed elsewhere, and
 * ultimately by the manufacturer under Article 32 or by a notified body.
 */

interface RoleRow {
  key: string;
  label: string;
  summary: string;
  craArticle: number | null;
  isDeclared: boolean;
  effectiveFrom: string | null;
  note: string;
}

interface RegulationRow {
  key: string;
  name: string;
  shortName: string;
  isDeclared: boolean;
  note: string;
}

interface Profile {
  roles: RoleRow[];
  regulations: RegulationRow[];
}

interface Obligations {
  total: number;
  declaredRoles: string[];
  declaredRegulations: string[];
  incomplete?: string;
}

const MISSING_DECLARATION: Record<string, string> = {
  no_roles_or_regulations_declared:
    "Nothing is declared yet, so no obligations are in scope. Start below.",
  no_roles_declared:
    "You have selected the applicable acts but not what this organisation does, so no obligations are in scope yet.",
  no_regulations_declared:
    "You have described what this organisation does but not which acts apply, so no obligations are in scope yet.",
};

export default function OrgProfilePage() {
  const qc = useQueryClient();

  const profile = useQuery<Profile>({
    queryKey: ["/api/conformity/org/profile"],
    queryFn: async () => {
      const res = await fetch("/api/conformity/org/profile");
      if (!res.ok) throw new Error(`Could not load the organisation profile (HTTP ${res.status})`);
      return res.json();
    },
  });

  const obligations = useQuery<Obligations>({
    queryKey: ["/api/conformity/org/obligations"],
    queryFn: async () => {
      const res = await fetch("/api/conformity/org/obligations");
      if (!res.ok) throw new Error(`Could not load obligations (HTTP ${res.status})`);
      return res.json();
    },
  });

  const declare = useMutation({
    mutationFn: async (v: { kind: "roles" | "regulations"; key: string; isDeclared: boolean }) => {
      const res = await fetch(`/api/conformity/org/${v.kind}/${v.key}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDeclared: v.isDeclared }),
      });
      if (!res.ok) throw new Error(`Could not save (HTTP ${res.status})`);
      return res.json();
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/conformity/org/profile"] });
      qc.invalidateQueries({ queryKey: ["/api/conformity/org/obligations"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (profile.isError) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <Card className="border-destructive/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-destructive" />
              Could not load the organisation profile
            </CardTitle>
            <CardDescription>{(profile.error as Error).message}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const roles = profile.data?.roles ?? [];
  const regulations = profile.data?.regulations ?? [];

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-4 sm:p-6 lg:p-8">
      <header className="border-b border-border pb-6">
        <span className="oxot-kicker block mb-1">ORGANISATION PROFILE</span>
        <h1 className="text-3xl font-serif font-normal tracking-tight text-foreground flex items-center gap-2.5">
          <Building2 className="w-6 h-6 text-primary shrink-0" />
          What this organisation is, in regulatory terms
        </h1>
        <p className="text-sm text-muted-foreground mt-2 max-w-2xl leading-relaxed">
          Two questions decide which obligations you see: what this organisation does, and which
          acts it is subject to. Both are needed — four of the acts below regulate a
          &ldquo;manufacturer&rdquo;, so the role alone would show you duties you may not carry.
        </p>
        <p className="text-xs text-muted-foreground mt-3 flex items-start gap-1.5 max-w-2xl">
          <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
          <span>
            Declaring something here brings its obligations <strong>into view</strong>. It does not
            assert that they are met. Conformity is assessed by the manufacturer under Article 32,
            or by a notified body — never by this application.
          </span>
        </p>
      </header>

      {/* Live consequence of the two declarations */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          {obligations.isLoading ? (
            <Skeleton className="h-6 w-56" />
          ) : obligations.isError ? (
            <p className="text-sm text-destructive">{(obligations.error as Error).message}</p>
          ) : (
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <span className="font-serif text-3xl text-foreground tabular-nums">
                {obligations.data?.total ?? 0}
              </span>
              <span className="text-sm text-muted-foreground">
                obligations in scope from{" "}
                {obligations.data?.declaredRegulations.length ?? 0} act(s) and{" "}
                {obligations.data?.declaredRoles.length ?? 0} role(s)
              </span>
              {obligations.data?.incomplete && (
                <p className="w-full text-xs text-amber-600 dark:text-amber-500 mt-1">
                  {MISSING_DECLARATION[obligations.data.incomplete] ?? obligations.data.incomplete}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 1. What the organisation does */}
      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-serif text-foreground">What does this organisation do?</h2>
          <p className="text-xs text-muted-foreground">
            Select every role it holds. Organisations commonly hold several at once.
          </p>
        </div>
        {profile.isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <div className="divide-y divide-border rounded-lg border border-border">
            {roles.map((role) => (
              <label
                key={role.key}
                className="flex items-start justify-between gap-4 p-4 cursor-pointer hover:bg-muted/30"
              >
                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-sm text-foreground">{role.label}</span>
                    {role.craArticle ? (
                      <Badge variant="outline" className="font-mono text-[10px]">
                        CRA Art. {role.craArticle}
                      </Badge>
                    ) : (
                      // Being explicit here matters: the previous persona model
                      // invented CRA duties for exactly these two actors.
                      <Badge variant="secondary" className="font-mono text-[10px]">
                        no CRA obligations of its own
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{role.summary}</p>
                </div>
                <Switch
                  checked={role.isDeclared}
                  disabled={declare.isPending}
                  onCheckedChange={(checked) =>
                    declare.mutate({ kind: "roles", key: role.key, isDeclared: checked })
                  }
                  aria-label={`Declare ${role.label}`}
                />
              </label>
            ))}
          </div>
        )}
      </section>

      {/* 2. Which acts apply */}
      <section className="space-y-3">
        <div>
          <h2 className="text-lg font-serif text-foreground flex items-center gap-2">
            <Scale className="h-4 w-4 text-primary" />
            Which acts is it subject to?
          </h2>
          <p className="text-xs text-muted-foreground">
            Only the acts you select contribute obligations.
          </p>
        </div>
        {profile.isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <div className="divide-y divide-border rounded-lg border border-border">
            {regulations.map((reg) => (
              <label
                key={reg.key}
                className="flex items-center justify-between gap-4 p-4 cursor-pointer hover:bg-muted/30"
              >
                <div className="min-w-0">
                  <span className="font-medium text-sm text-foreground">{reg.shortName}</span>
                  <p className="text-xs text-muted-foreground truncate">{reg.name}</p>
                </div>
                <Switch
                  checked={reg.isDeclared}
                  disabled={declare.isPending}
                  onCheckedChange={(checked) =>
                    declare.mutate({ kind: "regulations", key: reg.key, isDeclared: checked })
                  }
                  aria-label={`Declare ${reg.shortName}`}
                />
              </label>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
