import { useState, type ReactNode } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useCreateConformityReport } from "@workspace/api-client-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { Loader2, Sparkles } from "lucide-react";

type Format = "briefing" | "full" | "readout";
type Audience = "board" | "regulator";

const FORMATS: { value: Format; label: string; hint: string }[] = [
  {
    value: "briefing",
    label: "Executive briefing",
    hint: "Tight narrative: posture, findings, risk outlook, decisions.",
  },
  {
    value: "full",
    label: "Full assessment report",
    hint: "Long-form academic register with numbered citations and annexes.",
  },
  {
    value: "readout",
    label: "Executive readout",
    hint: "Large-format summary pages built for a live read-through.",
  },
];

const AUDIENCES: { value: Audience; label: string; hint: string }[] = [
  { value: "board", label: "Board", hint: "Risk, decisions and resourcing language." },
  { value: "regulator", label: "Regulator", hint: "Obligation-by-obligation statutory register." },
];

/**
 * Report builder. The deterministic skeleton (tables, charts, citations) is
 * computed synchronously on create; AI narrative drafts in the background and
 * the workspace polls it in.
 */
export function ReportBuilderDialog({
  scope,
  assessmentId,
  trigger,
}: {
  scope: "assessment" | "portfolio";
  assessmentId?: number;
  trigger: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<Format>("briefing");
  const [audience, setAudience] = useState<Audience>("board");
  const [title, setTitle] = useState("");
  const [includeAnnexes, setIncludeAnnexes] = useState(true);
  const [includeEvidenceRegister, setIncludeEvidenceRegister] = useState(true);
  const [includeIncidentDetail, setIncludeIncidentDetail] = useState(false);
  const [, navigate] = useLocation();
  const qc = useQueryClient();

  const create = useCreateConformityReport({
    mutation: {
      onSuccess: async (res) => {
        await qc.invalidateQueries();
        setOpen(false);
        toast.success("Report generation started", {
          description: "Data tables are ready now; the narrative sections are drafting.",
        });
        navigate(`/reports/${res.report.id}`);
      },
      onError: () => toast.error("Couldn't start the report."),
    },
  });

  const submit = () => {
    create.mutate({
      data: {
        scope,
        ...(scope === "assessment" ? { assessmentId } : {}),
        reportType: format,
        audience,
        ...(title.trim() ? { title: title.trim() } : {}),
        options: {
          includeAnnexes,
          includeEvidenceRegister,
          ...(includeIncidentDetail ? { includeIncidentDetail } : {}),
        },
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {scope === "portfolio" ? "New portfolio report" : "New executive report"}
          </DialogTitle>
          <DialogDescription>
            Generated from a frozen snapshot of {scope === "portfolio" ? "the whole portfolio" : "this assessment"} —
            the report won't drift as data changes afterwards.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label>Format</Label>
            <div className="grid gap-2">
              {FORMATS.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => setFormat(f.value)}
                  data-testid={`report-format-${f.value}`}
                  className={cn(
                    "rounded-md border px-3 py-2 text-left transition-colors",
                    format === f.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
                  )}
                >
                  <div className="text-sm font-medium">{f.label}</div>
                  <div className="text-xs text-muted-foreground">{f.hint}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Audience</Label>
            <div className="grid grid-cols-2 gap-2">
              {AUDIENCES.map((a) => (
                <button
                  key={a.value}
                  type="button"
                  onClick={() => setAudience(a.value)}
                  data-testid={`report-audience-${a.value}`}
                  className={cn(
                    "rounded-md border px-3 py-2 text-left transition-colors",
                    audience === a.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/40",
                  )}
                >
                  <div className="text-sm font-medium">{a.label}</div>
                  <div className="text-xs text-muted-foreground">{a.hint}</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="report-title">Title (optional)</Label>
            <Input
              id="report-title"
              placeholder="Auto-generated from the product and format if left empty"
              value={title}
              maxLength={200}
              onChange={(e) => setTitle(e.target.value)}
              data-testid="report-title-input"
            />
          </div>

          {format === "full" ? (
            <div className="space-y-2">
              <Label>Annexes</Label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox checked={includeAnnexes} onCheckedChange={(v) => setIncludeAnnexes(v === true)} />
                Requirement matrix annex
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={includeEvidenceRegister}
                  onCheckedChange={(v) => setIncludeEvidenceRegister(v === true)}
                />
                Evidence register annex
              </label>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={includeIncidentDetail}
                  onCheckedChange={(v) => setIncludeIncidentDetail(v === true)}
                />
                Detailed incident narratives{audience === "regulator" ? " (regulator default)" : ""}
              </label>
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={create.isPending} data-testid="report-builder-create">
            {create.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            )}
            Generate report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
