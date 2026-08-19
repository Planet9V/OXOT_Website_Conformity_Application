import { useGetAssurancePackage } from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { printHtmlDocument } from "@/lib/print";
import { cn } from "@/lib/utils";
import { ClipboardCheck, CheckCircle2, Circle, Printer } from "lucide-react";

/**
 * The supplier assurance package panel (B1) — the capstone of the component/IP-
 * supplier shape. It composes the shared-responsibility matrix (B2), the delivery
 * manifest (B3), and the product's CVD policy / support-period statement / SBOM
 * into one view with a completeness readout, and prints the package. It reports
 * what the supplier has assembled — it never declares the customer's product
 * conforming. Customers receive the manifest itself via its own revocable link.
 */
export function AssurancePackagePanel({ productId }: { productId: number }) {
  const pkg = useGetAssurancePackage(productId);
  const d = pkg.data;

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
      </CardContent>
    </Card>
  );
}
