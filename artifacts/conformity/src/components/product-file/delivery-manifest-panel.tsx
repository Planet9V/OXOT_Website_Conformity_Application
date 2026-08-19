import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  useGetDeliveryManifest,
  useCreateDeliveryManifestVersion,
  useIssueDeliveryManifestAccess,
  useRevokeDeliveryManifestAccess,
} from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";
import { PackageCheck, Plus, Copy, Link2, History } from "lucide-react";

const empty = { ipRelease: "", node: "", options: "", configBaseline: "", changeNote: "" };

/**
 * The versioned delivery manifest panel (B3) — the component/IP-supplier shape.
 * Author append-only manifest versions (the change history is the list) and
 * mint a single revocable customer-facing link that resolves to this manifest.
 * Authored data — it states what was delivered, never a conformity verdict.
 */
export function DeliveryManifestPanel({ productId }: { productId: number }) {
  const qc = useQueryClient();
  const manifest = useGetDeliveryManifest(productId);
  const [form, setForm] = useState(empty);
  const [adding, setAdding] = useState(false);

  const create = useCreateDeliveryManifestVersion({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries();
        setForm(empty);
        setAdding(false);
        toast.success("Delivery-manifest version recorded");
      },
      onError: (e: any) =>
        toast.error(e?.response?.data?.error ?? "Could not record the version"),
    },
  });
  const issue = useIssueDeliveryManifestAccess({
    mutation: {
      onSuccess: (data: any) => {
        qc.invalidateQueries();
        if (data?.accessToken) {
          navigator.clipboard.writeText(
            `${window.location.origin}/conformity/delivery-manifest?token=${data.accessToken}`,
          );
          toast.success("Customer link issued — copied to your clipboard");
        }
      },
      onError: (e: any) => toast.error(e?.response?.data?.error ?? "Could not issue the link"),
    },
  });
  const revoke = useRevokeDeliveryManifestAccess({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries();
        toast.success("Customer link revoked");
      },
      onError: (e: any) => toast.error(e?.response?.data?.error ?? "Could not revoke the link"),
    },
  });

  const versions = manifest.data?.versions ?? [];
  const accessToken = manifest.data?.accessToken ?? "";
  const accessActive = manifest.data?.accessActive ?? false;

  const customerLink = accessToken
    ? `${window.location.origin}/conformity/delivery-manifest?token=${accessToken}`
    : "";

  const submit = () =>
    create.mutate({
      id: productId,
      data: {
        ipRelease: form.ipRelease.trim(),
        node: form.node.trim(),
        options: form.options
          .split(",")
          .map((o) => o.trim())
          .filter(Boolean),
        configBaseline: form.configBaseline.trim(),
        changeNote: form.changeNote.trim(),
      },
    });

  return (
    <Card className="rounded-2xl border border-border shadow-sm" data-testid="delivery-manifest-panel">
      <CardHeader className="border-b pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <PackageCheck className="h-5 w-5 text-primary" /> Delivery manifest
            </CardTitle>
            <CardDescription className="text-xs max-w-2xl">
              The customer-facing record of exactly what was delivered — release, node,
              options, configuration baseline — and what changed each version. It states
              what was shipped; it never declares the customer's product conforming.
            </CardDescription>
          </div>
          <Button size="sm" className="gap-1.5 text-xs" onClick={() => setAdding((v) => !v)} data-testid="manifest-add-toggle">
            <Plus className="h-3.5 w-3.5" /> New version
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-5">
        {adding && (
          <div className="rounded-xl border border-border/70 p-4 space-y-3" data-testid="manifest-add-form">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="dm-release" className="text-xs">IP release *</Label>
                <Input id="dm-release" className="h-8 text-xs" placeholder="e.g. SE-2.4.1"
                  value={form.ipRelease} onChange={(e) => setForm({ ...form, ipRelease: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="dm-node" className="text-xs">Technology node</Label>
                <Input id="dm-node" className="h-8 text-xs" placeholder="e.g. 22nm"
                  value={form.node} onChange={(e) => setForm({ ...form, node: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="dm-options" className="text-xs">Supported options (comma-separated)</Label>
              <Input id="dm-options" className="h-8 text-xs" placeholder="secure boot, attestation, PUF"
                value={form.options} onChange={(e) => setForm({ ...form, options: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="dm-baseline" className="text-xs">Configuration baseline</Label>
              <Input id="dm-baseline" className="h-8 text-xs" placeholder="e.g. debug locked, RMA disabled"
                value={form.configBaseline} onChange={(e) => setForm({ ...form, configBaseline: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="dm-change" className="text-xs">Change note (this version's history entry)</Label>
              <Input id="dm-change" className="h-8 text-xs" placeholder="what changed since the last release"
                value={form.changeNote} onChange={(e) => setForm({ ...form, changeNote: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setAdding(false); setForm(empty); }}>
                Cancel
              </Button>
              <Button size="sm" className="h-7 text-xs" disabled={!form.ipRelease.trim() || create.isPending}
                onClick={submit} data-testid="manifest-add-save">
                {create.isPending ? "Recording…" : "Record version"}
              </Button>
            </div>
          </div>
        )}

        {/* Customer link */}
        <div className="rounded-xl border border-border/70 p-3 flex flex-wrap items-center justify-between gap-2">
          <div className="min-w-0 flex items-center gap-2">
            <Link2 className="h-4 w-4 text-primary shrink-0" />
            <span className="text-sm text-foreground">Customer link</span>
            {accessActive ? (
              <Badge variant="outline" className="font-mono text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/30">active</Badge>
            ) : (
              <Badge variant="outline" className="font-mono text-[10px] bg-muted text-muted-foreground">none</Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {accessActive && customerLink && (
              <Button size="sm" variant="outline" className="h-7 gap-1 text-xs"
                onClick={() => { navigator.clipboard.writeText(customerLink); toast.success("Customer link copied"); }}>
                <Copy className="h-3 w-3" /> Copy link
              </Button>
            )}
            <Button size="sm" variant="outline" className="h-7 text-xs" disabled={issue.isPending}
              onClick={() => issue.mutate({ id: productId })} data-testid="manifest-issue-link">
              {accessActive ? "Rotate" : "Issue link"}
            </Button>
            {accessActive && (
              <Button size="sm" variant="outline" className="h-7 text-xs text-destructive" disabled={revoke.isPending}
                onClick={() => revoke.mutate({ id: productId })}>
                Revoke
              </Button>
            )}
          </div>
        </div>

        {/* Version history */}
        <div className="space-y-2">
          <div className="text-sm font-medium text-foreground flex items-center gap-1.5">
            <History className="h-4 w-4 text-primary" /> Version history
          </div>
          {manifest.isLoading ? (
            <Skeleton className="h-16 w-full rounded-xl" />
          ) : versions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No delivery-manifest version recorded yet.</p>
          ) : (
            <ul className="space-y-2">
              {versions.map((v) => (
                <li key={v.id} className="rounded-xl border border-border/70 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-medium text-foreground">
                      v{v.version} · {v.ipRelease}
                      {v.node && <span className="text-muted-foreground"> · {v.node}</span>}
                    </span>
                    <span className="text-xs text-muted-foreground font-mono">{formatDate(v.createdAt)}</span>
                  </div>
                  {v.options.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {v.options.map((o) => (
                        <Badge key={o} variant="outline" className="font-mono text-[10px]">{o}</Badge>
                      ))}
                    </div>
                  )}
                  {v.configBaseline && (
                    <p className="mt-1 text-xs text-muted-foreground">Baseline: {v.configBaseline}</p>
                  )}
                  {v.changeNote && (
                    <p className="mt-1 text-xs text-foreground/80 border-l-2 border-primary/40 pl-2">{v.changeNote}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
