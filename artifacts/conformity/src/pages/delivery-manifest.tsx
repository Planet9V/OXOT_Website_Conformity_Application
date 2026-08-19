import { useState, useEffect } from "react";
import { PackageCheck, Boxes } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

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
type View = { productName: string; versions: Version[] };

/**
 * The public, token-authenticated customer view of a delivery manifest (B3) —
 * the supply-side mirror of the auditor portal. Raw fetch, token from ?token=,
 * read-only: the customer sees exactly what was delivered and its change history.
 */
export default function DeliveryManifestPage() {
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
        `/api/conformity/delivery-manifest/view?token=${encodeURIComponent(accessToken)}`,
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Could not open this manifest link");
      }
      setView(await res.json());
    } catch (err: any) {
      setError(err.message || "Invalid or revoked manifest link");
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
              <PackageCheck className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-serif font-normal">Delivery manifest</CardTitle>
            <CardDescription className="text-muted-foreground font-sans">
              Supplier delivery record — token access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="oxot-kicker block">Access token</label>
              <Input
                type="text"
                placeholder="Paste the manifest link token…"
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
              {loading ? "Opening…" : "Open manifest"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 max-w-4xl mx-auto space-y-8">
      <div className="border-b border-border pb-6">
        <span className="oxot-kicker block mb-1">DELIVERY MANIFEST</span>
        <h1 className="text-3xl sm:text-4xl font-serif font-normal tracking-tight text-foreground">
          {view.productName}
        </h1>
        <p className="text-sm text-muted-foreground mt-1 font-sans">
          The supplier's record of what was delivered, per release. This states what was
          shipped and configured — it is not a declaration that the finished product conforms.
        </p>
      </div>

      {view.versions.length === 0 ? (
        <p className="text-sm text-muted-foreground">No manifest version has been published yet.</p>
      ) : (
        <div className="space-y-4">
          {view.versions.map((v, i) => (
            <Card key={v.id} className="bg-card border-border">
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle className="text-lg flex items-center gap-2 font-normal">
                    <Boxes className="w-5 h-5 text-primary" /> v{v.version} · {v.ipRelease}
                    {i === 0 && (
                      <Badge variant="outline" className="font-mono text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/30">
                        current
                      </Badge>
                    )}
                  </CardTitle>
                  <span className="text-xs text-muted-foreground font-mono">{v.createdAt.slice(0, 10)}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {v.node && (
                  <div><span className="text-muted-foreground">Technology node: </span>{v.node}</div>
                )}
                {v.options.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1">
                    <span className="text-muted-foreground">Options: </span>
                    {v.options.map((o) => (
                      <Badge key={o} variant="outline" className="font-mono text-[10px]">{o}</Badge>
                    ))}
                  </div>
                )}
                {v.configBaseline && (
                  <div><span className="text-muted-foreground">Configuration baseline: </span>{v.configBaseline}</div>
                )}
                {v.changeNote && (
                  <p className="text-muted-foreground border-l-2 border-primary/40 pl-2">{v.changeNote}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
