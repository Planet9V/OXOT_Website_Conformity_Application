import { useState, useEffect } from "react";
import { ClipboardCheck, Boxes, Handshake, CheckCircle2, Circle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

type Row = { area: string; supplier: string; customer: string; note: string };
type Version = {
  id: number;
  version: number;
  ipRelease: string;
  node: string;
  options: string[];
  configBaseline: string;
  changeNote: string;
  createdAt: string;
};
type View = {
  productName: string;
  recipientName: string;
  matrix: Row[];
  versions: Version[];
  cvdPolicy: boolean;
  supportStatement: boolean;
  sbom: boolean;
  completeHave: number;
  completeTotal: number;
};

/**
 * The public, token-authenticated full assurance package (B4) — the publish-to-
 * many customer view. Raw fetch, token from ?token=, read-only: one recipient
 * sees the matrix, delivery manifest and evidence a supplier has assembled.
 */
export default function AssurancePackagePage() {
  const [token, setToken] = useState("");
  const [view, setView] = useState<View | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const t = new URLSearchParams(window.location.search).get("token");
    if (t) {
      setToken(t);
      load(t);
    }
  }, []);

  const load = async (accessToken: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(
        `/api/conformity/assurance-package/view?token=${encodeURIComponent(accessToken)}`,
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Could not open this package link");
      }
      setView(await res.json());
    } catch (err: any) {
      setError(err.message || "Invalid or revoked package link");
      setView(null);
    } finally {
      setLoading(false);
    }
  };

  if (!view) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card border-border text-card-foreground shadow-sm">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-2">
              <ClipboardCheck className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-serif font-normal">Supplier assurance package</CardTitle>
            <CardDescription className="text-muted-foreground font-sans">
              Component due-diligence evidence — token access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="oxot-kicker block">Access token</label>
              <Input
                type="text"
                placeholder="Paste the package link token…"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="bg-background border-input text-foreground font-mono text-xs"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold cta-lift shadow-sm"
              onClick={() => load(token)}
              disabled={!token.trim() || loading}
            >
              {loading ? "Opening…" : "Open package"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const evidence = [
    { label: "Coordinated vulnerability-disclosure policy", present: view.cvdPolicy },
    { label: "Support-period statement", present: view.supportStatement },
    { label: "SBOM", present: view.sbom },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground p-6 max-w-4xl mx-auto space-y-8">
      <div className="border-b border-border pb-6">
        <span className="oxot-kicker block mb-1">SUPPLIER ASSURANCE PACKAGE</span>
        <h1 className="text-3xl sm:text-4xl font-serif font-normal tracking-tight text-foreground">
          {view.productName}
        </h1>
        <p className="text-sm text-muted-foreground mt-1 font-sans">
          Prepared for <span className="text-foreground font-medium">{view.recipientName}</span>. The
          supplier's evidence for integrating this component — it is not a declaration that your
          finished product conforms; final conformity depends on the whole product (CRA Art. 13/32).
        </p>
      </div>

      {/* Shared-responsibility matrix */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 font-normal">
            <Handshake className="w-5 h-5 text-primary" /> Shared responsibility
          </CardTitle>
        </CardHeader>
        <CardContent>
          {view.matrix.length === 0 ? (
            <p className="text-sm text-muted-foreground">No matrix authored.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left font-mono uppercase tracking-wider text-[10px] text-muted-foreground">
                    <th className="pb-2 pr-3 font-normal">Area</th>
                    <th className="pb-2 pr-3 font-normal">The supplier provides</th>
                    <th className="pb-2 font-normal">You retain</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {view.matrix.map((r, i) => (
                    <tr key={i} className="border-t border-border/50">
                      <td className="py-2 pr-3 text-foreground">{r.area}</td>
                      <td className="py-2 pr-3 text-muted-foreground">{r.supplier}</td>
                      <td className="py-2 text-muted-foreground">{r.customer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delivery manifest */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 font-normal">
            <Boxes className="w-5 h-5 text-primary" /> Delivery manifest
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {view.versions.length === 0 ? (
            <p className="text-sm text-muted-foreground">No manifest version published.</p>
          ) : (
            view.versions.map((v, i) => (
              <div key={v.id} className="rounded-lg border border-border/60 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-medium text-foreground">
                    v{v.version} · {v.ipRelease}
                    {v.node && <span className="text-muted-foreground"> · {v.node}</span>}
                    {i === 0 && (
                      <Badge variant="outline" className="ml-2 font-mono text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/30">current</Badge>
                    )}
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">{v.createdAt.slice(0, 10)}</span>
                </div>
                {v.options.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {v.options.map((o) => (
                      <Badge key={o} variant="outline" className="font-mono text-[10px]">{o}</Badge>
                    ))}
                  </div>
                )}
                {v.configBaseline && <p className="mt-1 text-xs text-muted-foreground">Baseline: {v.configBaseline}</p>}
                {v.changeNote && <p className="mt-1 text-xs text-foreground/80 border-l-2 border-primary/40 pl-2">{v.changeNote}</p>}
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Evidence */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2 font-normal">
            <ClipboardCheck className="w-5 h-5 text-primary" /> Lifecycle evidence
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border/60">
            {evidence.map((e) => (
              <li key={e.label} className="py-2 flex items-center gap-2 text-sm">
                {e.present ? (
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                ) : (
                  <Circle className="h-4 w-4 text-muted-foreground/50 shrink-0" />
                )}
                <span className={e.present ? "text-foreground/90" : "text-muted-foreground"}>{e.label}</span>
                <span className="ml-auto text-xs text-muted-foreground">{e.present ? "on file" : "not provided"}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
