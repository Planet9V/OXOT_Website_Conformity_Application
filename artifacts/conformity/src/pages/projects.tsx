import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { FolderGit2, Plus, ArrowLeft } from "lucide-react";

/**
 * The Projects destination (task 7.5) — open-source stewardship, CRA Art. 24,
 * on the Phase 4 engine. Project-centric by design (D6/D7): a steward has no
 * CE marking, no declaration of conformity and no conformity assessment, so
 * there is no product file here — there is a POLICY with versioned history
 * (Art. 24(2) can require producing the text in force at a given time, so
 * versions supersede and never overwrite), authority cooperation clocks, and
 * the legal position stated by the engine in one place.
 *
 * This page replaced the older /steward implementation entirely — one
 * engine, one surface (the two-implementations trap in HANDOVER.md).
 */

interface ProjectSummary {
  name: string;
  currentPolicyVersion: number | null;
  aspectsCovered: number;
  totalPolicyAspects: number;
  openRequests: number;
  totalRequests: number;
}

const TRI_OPTS: { v: boolean | null; label: string }[] = [
  { v: true, label: "Yes" },
  { v: false, label: "No" },
  { v: null, label: "Unanswered" },
];

function TriPick({ value, onChange }: { value: boolean | null; onChange: (v: boolean | null) => void }) {
  return (
    <div className="flex gap-1">
      {TRI_OPTS.map((o) => (
        <button
          key={String(o.v)}
          type="button"
          onClick={() => onChange(o.v)}
          className={cn(
            "px-2 py-0.5 rounded-md text-[11px] font-mono border",
            value === o.v ? "bg-primary/15 border-primary/40 text-primary" : "border-border/50 text-muted-foreground/60",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function ProjectDetail({ name, onBack }: { name: string; onBack: () => void }) {
  const qc = useQueryClient();
  const [policyOpen, setPolicyOpen] = useState(false);
  const [requestOpen, setRequestOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [policyForm, setPolicyForm] = useState({
    policyText: "",
    policyUrl: "",
    stewardLegalEntity: "",
    repositoryUrl: "",
    aspects: [] as string[],
    supportsCommercial: null as boolean | null,
    involvedInDevelopment: null as boolean | null,
  });
  const [requestForm, setRequestForm] = useState({ authorityName: "", memberState: "", receivedAt: "" });

  const queryKey = [`/api/conformity/steward/${name}`];
  const { data, isLoading } = useQuery<any>({
    queryKey,
    queryFn: async () => {
      const res = await fetch(`/api/conformity/steward/${encodeURIComponent(name)}`);
      if (!res.ok) throw new Error(`Could not load the project (HTTP ${res.status})`);
      return res.json();
    },
  });

  const savePolicy = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/conformity/steward/${encodeURIComponent(name)}/policy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          policyText: policyForm.policyText,
          policyUrl: policyForm.policyUrl,
          stewardLegalEntity: policyForm.stewardLegalEntity,
          repositoryUrl: policyForm.repositoryUrl,
          aspectsCovered: policyForm.aspects,
          supportsSoftwareIntendedForCommercialActivities: policyForm.supportsCommercial,
          involvedInDevelopment: policyForm.involvedInDevelopment,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
      toast.success(`Policy version ${body.version ?? ""} recorded`);
      setPolicyOpen(false);
      await qc.invalidateQueries({ queryKey });
      await qc.invalidateQueries({ queryKey: ["/api/conformity/steward"] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not record the policy");
    } finally {
      setSaving(false);
    }
  };

  const saveRequest = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/conformity/steward/${encodeURIComponent(name)}/requests`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...requestForm, receivedAt: requestForm.receivedAt || null }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
      toast.success("Authority request recorded");
      setRequestOpen(false);
      await qc.invalidateQueries({ queryKey });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not record the request");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading || !data) return <Skeleton className="h-64 w-full rounded-2xl" />;

  const aspects: Record<string, string> = data.policyAspects ?? {};
  const current = data.policy?.current;

  return (
    <div className="space-y-5" data-testid="project-detail">
      <button onClick={onBack} className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-4 h-4" /> All projects
      </button>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-serif text-foreground">{name}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="text-xs" onClick={() => setRequestOpen(true)}>
            Record authority request
          </Button>
          <Button size="sm" className="text-xs" onClick={() => setPolicyOpen(true)} data-testid="new-policy-version">
            <Plus className="w-3.5 h-3.5 mr-1" /> New policy version
          </Button>
        </div>
      </div>

      {/* The law, from the engine — one place, no drift. */}
      <Card className="rounded-2xl border border-border/60 bg-muted/20">
        <CardContent className="p-4 text-xs text-muted-foreground leading-relaxed space-y-2">
          {(["obligations", "fines", "attestation"] as const).map((k) => {
            const lp = data.legalPosition?.[k];
            return lp ? (
              <p key={k}>
                <span className="font-mono text-[10px] text-primary mr-1.5">{lp.citation}</span>
                {lp.statement}
              </p>
            ) : null;
          })}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-border">
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
              Cybersecurity policy — CRA Art. 24(1)
            </h3>
            {current ? (
              <Badge variant="outline" className="font-mono text-[10px]">
                version {current.version} in force
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30 text-[10px]">
                No policy documented
              </Badge>
            )}
          </div>
          {current?.policyText && (
            <p className="text-xs text-foreground/85 whitespace-pre-wrap line-clamp-6">{current.policyText}</p>
          )}
          {(data.policy?.assessment?.gaps ?? []).length > 0 && (
            <ul className="text-xs text-amber-600 dark:text-amber-500 list-disc pl-5 space-y-0.5">
              {data.policy.assessment.gaps.map((g: string) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          )}
          {(data.policy?.history ?? []).length > 1 && (
            <p className="text-[11px] text-muted-foreground font-mono">
              {data.policy.history.length} versions — superseded versions are kept: Art. 24(2)
              asks which text was in force at the time.
            </p>
          )}
        </CardContent>
      </Card>

      <Card className="rounded-2xl border border-border">
        <CardContent className="p-5 space-y-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
            Authority cooperation — CRA Art. 24(2)
          </h3>
          {(data.cooperation?.requests ?? []).length === 0 ? (
            <p className="text-xs text-muted-foreground">No reasoned requests received.</p>
          ) : (
            <ul className="space-y-2">
              {data.cooperation.requests.map((r: any) => (
                <li key={r.id} className="text-xs flex flex-wrap items-baseline justify-between gap-2 border-b border-border/40 pb-2">
                  <span className="text-foreground">
                    {r.authorityName || "Authority"} {r.memberState ? `(${r.memberState})` : ""} —
                    received {r.receivedAt?.slice(0, 10)}
                  </span>
                  {r.documentationProvidedAt ? (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/30 text-[10px]">
                      provided {r.documentationProvidedAt.slice(0, 10)}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/30 text-[10px]">
                      open
                    </Badge>
                  )}
                </li>
              ))}
            </ul>
          )}
          {data.cooperation?.assessment?.message && (
            <p className="text-xs text-muted-foreground">{data.cooperation.assessment.message}</p>
          )}
        </CardContent>
      </Card>

      {/* New policy version dialog */}
      <Dialog open={policyOpen} onOpenChange={setPolicyOpen}>
        <DialogContent className="rounded-2xl max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">New policy version</DialogTitle>
            <DialogDescription className="text-xs">
              Versions supersede, never overwrite — CRA Art. 24(2) can require producing
              the text that was in force at a given time.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1 text-xs">
            <div className="space-y-1">
              <Label>Policy text *</Label>
              <Textarea className="text-xs h-24" value={policyForm.policyText}
                onChange={(e) => setPolicyForm({ ...policyForm, policyText: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Steward legal entity</Label>
                <Input className="h-8 text-xs" value={policyForm.stewardLegalEntity}
                  onChange={(e) => setPolicyForm({ ...policyForm, stewardLegalEntity: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Repository URL</Label>
                <Input className="h-8 text-xs font-mono" value={policyForm.repositoryUrl}
                  onChange={(e) => setPolicyForm({ ...policyForm, repositoryUrl: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Aspects the policy covers</Label>
              <div className="flex flex-wrap gap-1.5">
                {Object.entries(aspects).map(([key, label]) => {
                  const on = policyForm.aspects.includes(key);
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() =>
                        setPolicyForm({
                          ...policyForm,
                          aspects: on ? policyForm.aspects.filter((a) => a !== key) : [...policyForm.aspects, key],
                        })
                      }
                      className={cn(
                        "px-2 py-1 rounded-md border text-[11px]",
                        on ? "bg-primary/15 border-primary/40 text-primary" : "border-border/60 text-muted-foreground",
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <Label className="leading-snug">Supports software intended for commercial activities (Art. 3(14))</Label>
              <TriPick value={policyForm.supportsCommercial} onChange={(v) => setPolicyForm({ ...policyForm, supportsCommercial: v })} />
            </div>
            <div className="flex items-center justify-between gap-3">
              <Label className="leading-snug">Steward is involved in the development itself</Label>
              <TriPick value={policyForm.involvedInDevelopment} onChange={(v) => setPolicyForm({ ...policyForm, involvedInDevelopment: v })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setPolicyOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={savePolicy} disabled={saving || !policyForm.policyText.trim()}>
              Record version
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Record request dialog */}
      <Dialog open={requestOpen} onOpenChange={setRequestOpen}>
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">Record a reasoned request</DialogTitle>
            <DialogDescription className="text-xs">
              The cooperation clock (CRA Art. 24(2)) runs from the day the authority's
              reasoned request was received.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Authority</Label>
                <Input className="h-8 text-xs" value={requestForm.authorityName}
                  onChange={(e) => setRequestForm({ ...requestForm, authorityName: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Member State</Label>
                <Input className="h-8 text-xs" value={requestForm.memberState}
                  onChange={(e) => setRequestForm({ ...requestForm, memberState: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Received at</Label>
              <Input type="date" className="h-8 text-xs font-mono" value={requestForm.receivedAt}
                onChange={(e) => setRequestForm({ ...requestForm, receivedAt: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setRequestOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={saveRequest} disabled={saving}>Record</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function ProjectsPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const [newOpen, setNewOpen] = useState(false);
  const [newName, setNewName] = useState("");

  const { data, isLoading } = useQuery<{ total: number; projects: ProjectSummary[] }>({
    queryKey: ["/api/conformity/steward"],
    queryFn: async () => {
      const res = await fetch("/api/conformity/steward");
      if (!res.ok) throw new Error(`Could not load projects (HTTP ${res.status})`);
      return res.json();
    },
  });

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="oxot-kicker block mb-1">REGISTERS · OPEN-SOURCE STEWARDSHIP</span>
          <h1 className="text-3xl sm:text-4xl font-serif font-normal tracking-tight text-foreground flex items-center gap-2.5">
            <FolderGit2 className="w-6 h-6 text-primary shrink-0" /> Projects
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
            CRA Art. 24 stewardship — projects, not products: a versioned cybersecurity
            policy, authority cooperation clocks, and the steward's legal position. No CE
            marking, no declaration of conformity, no conformity assessment.
          </p>
        </div>
        {!selected && (
          <Button size="sm" className="gap-1.5 text-xs shrink-0" onClick={() => setNewOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> New project
          </Button>
        )}
      </div>

      {selected ? (
        <ProjectDetail name={selected} onBack={() => setSelected(null)} />
      ) : isLoading ? (
        <Skeleton className="h-48 w-full rounded-2xl" />
      ) : (data?.projects ?? []).length === 0 ? (
        <Card className="rounded-2xl border border-dashed">
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            No stewardship projects are recorded. A project exists once its first policy
            version or authority request is recorded.
          </CardContent>
        </Card>
      ) : (
        <ul className="space-y-2" data-testid="projects-register">
          {data!.projects.map((p) => (
            <li key={p.name}>
              <button
                onClick={() => setSelected(p.name)}
                className="w-full text-left rounded-xl border border-border/70 bg-card px-4 py-3 hover:border-primary/50 transition-colors flex flex-wrap items-center justify-between gap-3"
              >
                <span className="text-sm font-medium text-foreground">{p.name}</span>
                <span className="flex items-center gap-2 font-mono text-[11px] text-muted-foreground">
                  {p.currentPolicyVersion ? `policy v${p.currentPolicyVersion}` : "no policy"} ·{" "}
                  {p.aspectsCovered}/{p.totalPolicyAspects} aspects ·{" "}
                  <span className={p.openRequests ? "text-amber-500" : ""}>
                    {p.openRequests} open request{p.openRequests === 1 ? "" : "s"}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={newOpen} onOpenChange={setNewOpen}>
        <DialogContent className="rounded-2xl max-w-sm">
          <DialogHeader>
            <DialogTitle className="font-serif text-lg">New project</DialogTitle>
            <DialogDescription className="text-xs">
              Name the project, then record its first policy version — that is what
              brings it into the register.
            </DialogDescription>
          </DialogHeader>
          <Input className="h-8 text-xs" placeholder="e.g. openplc-runtime" value={newName}
            onChange={(e) => setNewName(e.target.value)} />
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setNewOpen(false)}>Cancel</Button>
            <Button
              size="sm"
              disabled={!newName.trim()}
              onClick={() => {
                setSelected(newName.trim());
                setNewOpen(false);
                setNewName("");
              }}
            >
              Open project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
