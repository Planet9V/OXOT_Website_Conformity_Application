import { Link } from "wouter";
import {
  useGetAdminSession,
  useListConformityProducts,
  useGetConformityProduct,
  getGetConformityProductQueryKey,
} from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { stageLabel } from "@/lib/conformity";
import { stageProgress } from "@/lib/journey";
import {
  ArrowRight,
  Book,
  Grid3x3,
  ListTree,
  ClipboardCheck,
  Sparkles,
} from "lucide-react";
import { GettingStarted } from "@/components/conformity/getting-started";

// The demo seed always creates this product; fall back to the first product so
// the page still works against a fresh/admin database.
const DEMO_PRODUCT = "NovaGuard Smart Home Hub";

const REFERENCE_LINKS = [
  { href: "/regulations", label: "Regulations", icon: Book },
  { href: "/requirements", label: "Requirements", icon: ListTree },
  { href: "/mappings", label: "Matrix", icon: Grid3x3 },
];

export default function Overview() {
  const { data: session } = useGetAdminSession();
  const { data: products, isLoading: productsLoading } = useListConformityProducts();

  const demoProduct = products?.find((p) => p.name === DEMO_PRODUCT) ?? products?.[0];
  const { data: detail, isLoading: detailLoading } = useGetConformityProduct(demoProduct?.id ?? 0, {
    query: {
      enabled: !!demoProduct,
      queryKey: getGetConformityProductQueryKey(demoProduct?.id ?? 0),
    },
  });
  const assessment = detail?.assessments?.[0];
  const isDemo = session?.role === "demo";
  const loading = productsLoading || (!!demoProduct && detailLoading);

  return (
    <div className="px-4 py-10 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-8">
      <div>
        <div className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
          {isDemo ? "Demo workspace" : "Your workspace"}
        </div>
        <h1 className="mt-2 text-3xl font-display font-bold tracking-tight">
          Welcome to the conformity cockpit
        </h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          {isDemo
            ? "This is a shared sandbox pre-loaded with a worked assessment. Open the workbench to explore scoping, gaps, evidence, artifacts and the copilot."
            : "Pick up a product assessment where you left off, or dive into the regulatory reference."}
        </p>
      </div>

      {/* Primary: the worked assessment */}
      {loading ? (
        <Skeleton className="h-44 w-full rounded-lg" />
      ) : assessment && demoProduct ? (
        <Card className="rounded-lg border-t-4 border-t-primary overflow-hidden">
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className="rounded-md bg-reg-cra text-primary-foreground font-mono text-[10px]">
                    {assessment.regulationKey.toUpperCase()}
                  </Badge>
                  <Badge variant="outline" className="rounded-md">
                    {stageLabel(assessment.currentStage)}
                  </Badge>
                  {assessment.scopeResult === "in_scope" && (
                    <Badge variant="outline" className="rounded-md text-green-600 border-green-500/40">
                      In scope
                    </Badge>
                  )}
                  {assessment.classKey && (
                    <span className="text-xs text-muted-foreground font-mono">
                      {assessment.classKey}
                    </span>
                  )}
                </div>
                <h2 className="mt-3 text-2xl font-display font-bold tracking-tight truncate">
                  {demoProduct.name}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {demoProduct.manufacturerName || "Cyber Resilience Act assessment"}
                </p>
                <div className="mt-4 flex items-center gap-3 max-w-sm">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out motion-reduce:transition-none"
                      style={{ width: `${stageProgress(assessment).pct}%` }}
                    />
                  </div>
                  <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                    {stageProgress(assessment).pct}%
                  </span>
                </div>
              </div>
              <Link href={`/assessments/${assessment.id}`} className="shrink-0">
                <Button size="lg" className="rounded-md gap-2 w-full md:w-auto" data-testid="open-workbench">
                  Open workbench <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="mt-6 flex items-start gap-2.5 rounded-md border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
              <Sparkles className="w-4 h-4 mt-0.5 text-primary shrink-0" />
              <span>
                Inside the workbench, look for the <strong className="text-foreground">Copilot</strong>{" "}
                button — it can see this assessment&apos;s live state and will tell you what to fix first.
              </span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <GettingStarted
          hasProduct={!!demoProduct}
          productId={demoProduct?.id}
          productName={demoProduct?.name}
        />
      )}

      {/* Secondary: navigation */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/products">
          <Card className="rounded-lg h-full transition-colors hover:border-primary/40">
            <CardContent className="p-5">
              <ClipboardCheck className="w-5 h-5 text-primary" />
              <div className="mt-3 font-medium">All products</div>
              <div className="text-xs text-muted-foreground mt-0.5">Run and manage assessments</div>
            </CardContent>
          </Card>
        </Link>
        {REFERENCE_LINKS.map((r) => (
          <Link key={r.href} href={r.href}>
            <Card className="rounded-lg h-full transition-colors hover:border-primary/40">
              <CardContent className="p-5">
                <r.icon className="w-5 h-5 text-muted-foreground" />
                <div className="mt-3 font-medium">{r.label}</div>
                <div className="text-xs text-muted-foreground mt-0.5">Reference library</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
