import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  useGetAssurancePackage,
  useListAssuranceRecipients,
  useCreateAssuranceRecipient,
  useRevokeAssuranceRecipient,
} from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { printHtmlDocument } from "@/lib/print";
import { cn, formatDate } from "@/lib/utils";
import { ClipboardCheck, CheckCircle2, Circle, Printer, Send, Copy, Users } from "lucide-react";

/**
 * The supplier assurance package panel (B1) — the capstone of the component/IP-
 * supplier shape. It composes the shared-responsibility matrix (B2), the delivery
 * manifest (B3), and the product's CVD policy / support-period statement / SBOM
 * into one view with a completeness readout, and prints the package. It reports
 * what the supplier has assembled — it never declares the customer's product
 * conforming. Customers receive the manifest itself via its own revocable link.
 */
export function AssurancePackagePanel({ productId }: { productId: number }) {
  const qc = useQueryClient();
  const pkg = useGetAssurancePackage(productId);
  const d = pkg.data;

  const recipients = useListAssuranceRecipients(productId);
  const [recipientName, setRecipientName] = useState("");
  const packageLink = (token: string) =>
    `${window.location.origin}/conformity/assurance-package?token=${token}`;
  const createRecipient = useCreateAssuranceRecipient({
    mutation: {
      onSuccess: (row: any) => {
        qc.invalidateQueries();
        setRecipientName("");
        if (row?.accessToken) {
          navigator.clipboard.writeText(packageLink(row.accessToken));
          toast.success(`Link for ${row.recipientName} issued — copied to clipboard`);
        }
      },
      onError: (e: any) => toast.error(e?.response?.data?.error ?? "Could not issue the link"),
    },
  });
  const revokeRecipient = useRevokeAssuranceRecipient({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries();
        toast.success("Customer link revoked");
      },
      onError: (e: any) => toast.error(e?.response?.data?.error ?? "Could not revoke the link"),
    },
  });
  const grants = recipients.data?.recipients ?? [];

  const rows = d
    ? [
        {
          label: "Shared-responsibility matrix",
          present: d.matrixPresent,
          detail: d.matrixPresent ? `${d.matrixRows} area${d.matrixRows === 1 ? "" : "s"}` : "not authored",
        },
        {
          label: "Delivery manifest",
          present: d.manifestVersions > 0,
          detail: d.manifestVersions > 0 ? `v${d.manifestVersions} · ${d.manifestLatest}` : "no version recorded",
        },
        {
          label: "Coordinated vulnerability-disclosure policy",
          present: d.cvdPolicy,
          detail: d.cvdPolicy ? "on file" : "missing",
        },
        {
          label: "Support-period statement",
          present: d.supportStatement,
          detail: d.supportStatement ? "on file" : "missing",
        },
        {
          label: "SBOM",
          present: d.sbom,
          detail: d.sbom ? "on file" : "missing",
        },
      ]
    : [];

  const printPackage = () => {
    if (!d) return;
    const line = (label: string, present: boolean, detail: string) =>
      `<tr><td>${present ? "✓" : "—"}</td><td>${label}</td><td>${detail}</td></tr>`;
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Supplier assurance package — ${d.productName}</title>
      <style>body{font-family:Georgia,serif;color:#111;margin:40px;}h1{font-size:22px;}
      .kicker{text-transform:uppercase;letter-spacing:.1em;font-size:11px;color:#b45309;}
      table{border-collapse:collapse;width:100%;margin-top:16px;font-family:Arial,sans-serif;font-size:13px;}
      td,th{border:1px solid #ddd;padding:8px 10px;text-align:left;}th{background:#f5f5f5;}
      .note{margin-top:20px;font-size:12px;color:#555;}</style></head>
      <body>
        <div class="kicker">Supplier assurance package</div>
        <h1>${d.productName}</h1>
        <p style="font-size:13px;color:#333;">Completeness: ${d.completeHave}/${d.completeTotal} components present.</p>
        <table><thead><tr><th> </th><th>Component</th><th>Status</th></tr></thead>
        <tbody>
          ${line("Shared-responsibility matrix", d.matrixPresent, d.matrixPresent ? d.matrixRows + " areas" : "not authored")}
          ${line("Delivery manifest", d.manifestVersions > 0, d.manifestVersions > 0 ? "v" + d.manifestVersions + " · " + d.manifestLatest : "no version")}
          ${line("Coordinated vulnerability-disclosure policy", d.cvdPolicy, d.cvdPolicy ? "on file" : "missing")}
          ${line("Support-period statement", d.supportStatement, d.supportStatement ? "on file" : "missing")}
          ${line("SBOM", d.sbom, d.sbom ? "on file" : "missing")}
        </tbody></table>
        <p class="note">This package assembles the supplier's customer-facing evidence. It is not a declaration that the finished product conforms; final conformity depends on the whole product (CRA Art. 13/32).</p>
      </body></html>`;
    printHtmlDocument(html);
  };

  const complete = d ? d.completeHave === d.completeTotal : false;

  return (
    <Card className="rounded-2xl border border-border shadow-sm" data-testid="assurance-package-panel">
      <CardHeader className="border-b pb-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-primary" /> Supplier assurance package
            </CardTitle>
            <CardDescription className="text-xs max-w-2xl">
              The one bundle a customer needs for third-party-component due diligence — matrix,
              manifest, CVD, support period and SBOM. It reports what you have assembled; it
              never declares the customer's finished product conforming.
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {d && (
              <Badge
                variant="outline"
                className={cn(
                  "font-mono text-[10px]",
                  complete
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                    : "bg-amber-500/10 text-amber-500 border-amber-500/30",
                )}
                data-testid="package-completeness"
              >
                {d.completeHave}/{d.completeTotal} complete
              </Badge>
            )}
            <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" disabled={!d} onClick={printPackage} data-testid="package-print">
              <Printer className="h-3 w-3" /> Print package
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        {pkg.isLoading ? (
          <Skeleton className="h-40 w-full rounded-xl" />
        ) : (
          <ul className="divide-y divide-border/60">
            {rows.map((r) => (
              <li key={r.label} className="py-2.5 flex items-center justify-between gap-4">
                <span className="flex items-center gap-2 text-sm text-foreground/90">
                  {r.present ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  ) : (
                    <Circle className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                  )}
                  {r.label}
                </span>
                <span className={cn("text-xs shrink-0", r.present ? "text-muted-foreground" : "text-amber-600 dark:text-amber-500")}>
                  {r.detail}
                </span>
              </li>
            ))}
          </ul>
        )}

        {/* Publish-to-many door (B4): one revocable link per named customer. */}
        <div className="mt-5 border-t border-border/60 pt-4 space-y-3" data-testid="assurance-recipients">
          <div className="text-sm font-medium text-foreground flex items-center gap-1.5">
            <Users className="h-4 w-4 text-primary" /> Publish to customers
          </div>
          <div className="flex items-center gap-2">
            <Input
              className="h-8 text-xs"
              placeholder="Customer organisation name"
              value={recipientName}
              onChange={(e) => setRecipientName(e.target.value)}
            />
            <Button
              size="sm"
              className="h-8 shrink-0 gap-1 text-xs"
              disabled={!recipientName.trim() || createRecipient.isPending}
              onClick={() => createRecipient.mutate({ id: productId, data: { recipientName: recipientName.trim() } })}
              data-testid="recipient-issue"
            >
              <Send className="h-3 w-3" /> Issue link
            </Button>
          </div>
          {recipients.isLoading ? (
            <Skeleton className="h-12 w-full rounded-lg" />
          ) : grants.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              No customer links issued yet. Each link resolves to the full package and can be revoked.
            </p>
          ) : (
            <ul className="space-y-2">
              {grants.map((g) => (
                <li key={g.id} className="rounded-lg border border-border/60 p-2.5 flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm text-foreground">
                    {g.recipientName}
                    <span className="text-xs text-muted-foreground font-mono"> · issued {formatDate(g.createdAt)}</span>
                  </span>
                  <span className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant="outline"
                      className={cn(
                        "font-mono text-[10px]",
                        g.isActive
                          ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/30"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {g.isActive ? "active" : "revoked"}
                    </Badge>
                    {g.isActive && (
                      <>
                        <Button size="sm" variant="outline" className="h-7 gap-1 text-xs"
                          onClick={() => { navigator.clipboard.writeText(packageLink(g.accessToken)); toast.success("Package link copied"); }}>
                          <Copy className="h-3 w-3" /> Copy link
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs text-destructive"
                          disabled={revokeRecipient.isPending}
                          onClick={() => revokeRecipient.mutate({ id: g.id })}>
                          Revoke
                        </Button>
                      </>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
