import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { BadgeCheck, Plus } from "lucide-react";

/**
 * The Assess stage of the product file (7.3) — notified-body engagements for
 * a manufacturer's product. Lists each engagement with the SERVER's statutory
 * assessment (module, status, whether the certificate clears placing on the
 * market); this panel renders verdicts, it never computes them.
 *
 * Annex VIII II.3's single-body rule is enforced by the API (409 on a second
 * open engagement) and surfaced here verbatim rather than pre-hidden, so the
 * user learns the rule from the statute's own words.
 */

interface Engagement {
  id: number;
  module: string;
  status: string;
  notifiedBodyName: string;
  notifiedBodyNumber: string;
  notifiedBodyCountry: string;
  certificateNumber: string;
  assessment: {
    certificate: { clearedToPlaceOnMarket: boolean; message?: string };
    openItems?: string[];
  };
}

const MODULE_LABEL: Record<string, string> = {
  module_b_c: "Module B + C (EU-type examination + conformity to type)",
  module_h: "Module H (full quality assurance)",
};

const STATUS_TONE: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  lodged: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  certificate_issued: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
  refused: "bg-destructive/10 text-destructive border-destructive/30",
  withdrawn: "bg-muted text-muted-foreground",
};

export function NotifiedBodyPanel({ productId }: { productId: number }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    module: "module_b_c",
    notifiedBodyName: "",
    notifiedBodyNumber: "",
    notifiedBodyCountry: "",
  });
  const [creating, setCreating] = useState(false);

  const queryKey = ["/api/conformity/notified-body/engagements", productId];
  const { data, isLoading, isError } = useQuery<{ total: number; engagements: Engagement[] }>({
    queryKey,
    queryFn: async () => {
      const res = await fetch(`/api/conformity/notified-body/engagements?productId=${productId}`);
      if (!res.ok) throw new Error(`Could not load notified-body engagements (HTTP ${res.status})`);
      return res.json();
    },
  });

  const create = async () => {
    setCreating(true);
    try {
      const res = await fetch(`/api/conformity/notified-body/engagements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId, ...form }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || `HTTP ${res.status}`);
      toast.success("Engagement opened (draft)");
      setOpen(false);
      await qc.invalidateQueries({ queryKey });
    } catch (e) {
      // The 409 carries the Annex VIII single-body rule — show it verbatim.
      toast.error(e instanceof Error ? e.message : "Could not open the engagement");
    } finally {
      setCreating(false);
    }
  };

  if (isLoading) return <Skeleton className="h-40 w-full rounded-2xl" />;
  if (isError) {
    return (
      <Card className="rounded-2xl border-destructive/40">
        <CardContent className="p-6 text-sm text-destructive">
          Notified-body engagements could not be loaded.
        </CardContent>
      </Card>
    );
  }

  const engagements = data?.engagements ?? [];

  return (
    <Card className="rounded-2xl border border-border shadow-sm" data-testid="notified-body-panel">
      <CardHeader className="border-b pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <BadgeCheck className="h-5 w-5 text-primary" /> Assess — notified body (CRA Art. 32)
            </CardTitle>
            <CardDescription className="text-xs max-w-2xl">
              Third-party conformity assessment engagements. Whether a certificate
              clears placing on the market is the engine's determination, shown here.
            </CardDescription>
          </div>
          <Button size="sm" className="gap-1.5 text-xs" onClick={() => setOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Open engagement
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {engagements.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No notified-body engagement is recorded for this product. If its
            assessment route requires one, opening the engagement is where the
            Assess stage starts.
          </p>
        ) : (
          <ul className="space-y-3">
            {engagements.map((e) => (
              <li key={e.id} className="rounded-xl border border-border/70 p-4 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm font-medium text-foreground">
                    {e.notifiedBodyName || "Notified body not named yet"}
                    {e.notifiedBodyNumber && (
                      <span className="font-mono text-xs text-muted-foreground"> · NB {e.notifiedBodyNumber}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono text-[10px]">
                      {MODULE_LABEL[e.module] ?? e.module}
                    </Badge>
                    <Badge variant="outline" className={cn("font-mono text-[10px]", STATUS_TONE[e.status] ?? "")}>
                      {e.status.replaceAll("_", " ")}
                    </Badge>
                  </div>
                </div>
                <p
                  className={cn(
                    "text-xs",
                    e.assessment.certificate.clearedToPlaceOnMarket
                      ? "text-emerald-500"
                      : "text-muted-foreground",
                  )}
                >
                  {e.assessment.certificate.message ??
                    (e.assessment.certificate.clearedToPlaceOnMarket
                      ? "Certificate clears placing on the market."
                      : "Not cleared to place on the market.")}
                </p>
                {(e.assessment.openItems?.length ?? 0) > 0 && (
                  <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-0.5">
                    {e.assessment.openItems!.map((o) => (
                      <li key={o}>{o}</li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Open a notified-body engagement</DialogTitle>
            <DialogDescription className="text-xs">
              One application, one body: a second open engagement is refused with
              Annex VIII, Part II, point 3.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-1 text-xs">
            <div className="space-y-1">
              <Label htmlFor="nb-module">Assessment module</Label>
              <Select value={form.module} onValueChange={(v) => setForm({ ...form, module: v })}>
                <SelectTrigger id="nb-module" className="h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="module_b_c">{MODULE_LABEL.module_b_c}</SelectItem>
                  <SelectItem value="module_h">{MODULE_LABEL.module_h}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="nb-name">Notified body name</Label>
              <Input id="nb-name" className="h-8 text-xs" value={form.notifiedBodyName}
                onChange={(e) => setForm({ ...form, notifiedBodyName: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="nb-number">NB number</Label>
                <Input id="nb-number" className="h-8 text-xs font-mono" placeholder="e.g. 1234"
                  value={form.notifiedBodyNumber}
                  onChange={(e) => setForm({ ...form, notifiedBodyNumber: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="nb-country">Country</Label>
                <Input id="nb-country" className="h-8 text-xs" value={form.notifiedBodyCountry}
                  onChange={(e) => setForm({ ...form, notifiedBodyCountry: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={create} disabled={creating}>
              Open engagement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
