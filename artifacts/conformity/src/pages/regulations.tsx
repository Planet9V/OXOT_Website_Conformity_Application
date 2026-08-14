import { useState } from "react";
import { useListRegulations } from "@workspace/api-client-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { ExternalLink, ArrowRight, Eye, ShieldCheck, BookOpen, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

/** Long-form reference guides on the main site (wiki-style article with TOC). */
const ARTICLE_SLUGS: Record<string, string> = {
  cra: "cra",
  ai_act: "ai-act",
  machinery: "machine-act",
  iec_62443: "iec-62443",
  nis2: "nis2",
};

export default function Regulations() {
  const { data: regulations, isLoading, isError } = useListRegulations();
  const [selectedRegKey, setSelectedRegKey] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Skeleton key={i} className="h-56 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !regulations) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="text-destructive border border-destructive/20 p-6 bg-destructive/5 rounded-xl">
          Failed to load statutory regulations framework catalogue.
        </div>
      </div>
    );
  }

  const selectedReg = regulations.find((r) => r.key === selectedRegKey);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="border-b border-border pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <span className="oxot-kicker block mb-1">EU &amp; INTERNATIONAL REGULATORY FRAMEWORKS</span>
          <h1 className="text-3xl sm:text-4xl font-serif font-normal tracking-tight text-foreground">
            Regulations
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-sans">
            Harmonized cybersecurity frameworks mapped across the conformity scope.
          </p>
        </div>
        <div className="text-xs font-mono text-muted-foreground bg-muted/40 px-3 py-1.5 rounded-lg border border-border/50 self-start sm:self-auto">
          {regulations.length} Frameworks Active
        </div>
      </div>

      {/* Dynamic Responsive Grid: 1 col (Mobile) -> 2 cols (Sm) -> 3 cols (Md) -> 4 cols (Xl) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        {regulations.map((reg) => (
          <Card
            key={reg.key}
            className="group rounded-xl border border-border/80 bg-card shadow-e1 hover:shadow-e2 hover:border-primary/40 hover:-translate-y-1 transition-all duration-200 ease-brand flex flex-col justify-between overflow-hidden"
          >
            <CardHeader className="p-4 pb-2">
              <div className="flex justify-between items-center gap-2 mb-2">
                <Badge
                  variant="outline"
                  className="font-mono text-[11px] px-2 py-0.5 bg-primary/10 text-primary border-primary/20 font-semibold"
                >
                  {reg.shortName}
                </Badge>
                <Badge
                  variant="secondary"
                  className="font-mono text-[10px] px-1.5 py-0.5 text-muted-foreground bg-muted/60"
                >
                  {reg.jurisdiction}
                </Badge>
              </div>

              <CardTitle className="text-base font-serif font-normal leading-snug text-foreground line-clamp-2 min-h-[2.75rem] group-hover:text-primary transition-colors">
                {reg.fullTitle}
              </CardTitle>
            </CardHeader>

            <CardContent className="p-4 pt-0 flex-1 flex flex-col justify-between">
              <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3">
                {reg.summary}
              </p>

              {/* Compact Key Metric Spec Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs bg-muted/40 p-2.5 rounded-lg border border-border/40 font-mono">
                <div>
                  <span className="text-[10px] text-muted-foreground block uppercase tracking-wider mb-0.5">
                    In Force
                  </span>
                  <span className="font-semibold text-foreground">
                    {reg.inForceDate ? new Date(reg.inForceDate).getFullYear() : "Pending"}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground block uppercase tracking-wider mb-0.5">
                    Controls
                  </span>
                  <span className="font-semibold text-foreground">
                    {reg.requirementCount} Mapped
                  </span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="p-3 px-4 bg-muted/10 border-t border-border/50 flex items-center justify-between gap-2 text-xs">
              <button
                type="button"
                onClick={() => setSelectedRegKey(reg.key)}
                className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground font-medium transition-colors"
              >
                <Eye className="w-3.5 h-3.5" /> Quick View
              </button>

              <div className="flex items-center gap-3">
                {reg.sourceUrl && (
                  <a
                    href={reg.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                    title="Official EUR-Lex / ISO Reference Text"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
                <Link
                  href={`/regulations/${reg.key}`}
                  className="inline-flex items-center gap-1 font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Details
                </Link>
                <Link
                  href={`/requirements?regulation=${reg.key}`}
                  className="inline-flex items-center gap-1 font-medium text-primary hover:text-primary-ink transition-colors"
                >
                  Controls <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Regulation Quick Preview Modal */}
      <Dialog open={!!selectedReg} onOpenChange={(open) => !open && setSelectedRegKey(null)}>
        {selectedReg && (
          <DialogContent className="rounded-2xl max-w-2xl bg-card border-border shadow-xl p-6">
            <DialogHeader className="border-b border-border pb-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant="outline"
                  className="font-mono text-xs bg-primary/10 text-primary border-primary/20 font-semibold px-2.5 py-0.5"
                >
                  {selectedReg.shortName}
                </Badge>
                <Badge variant="secondary" className="font-mono text-xs">
                  {selectedReg.jurisdiction}
                </Badge>
              </div>
              <DialogTitle className="text-xl font-serif font-normal leading-snug">
                {selectedReg.fullTitle}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground font-mono mt-1">
                Statutory ID: {selectedReg.key.toUpperCase()} • Enforcement:{" "}
                {selectedReg.inForceDate
                  ? new Date(selectedReg.inForceDate).toLocaleDateString()
                  : "Pending Directive"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 py-4 text-sm">
              <div>
                <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                  Regulatory Overview &amp; Mandate Scope
                </h4>
                <p className="text-foreground/90 leading-relaxed font-sans">
                  {selectedReg.summary}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-muted/30 p-3.5 rounded-xl border border-border/60 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                    <ShieldCheck className="w-4 h-4 text-primary" /> Mapped Requirements
                  </div>
                  <div className="text-2xl font-serif font-semibold text-foreground">
                    {selectedReg.requirementCount} Controls
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Active in harmonized conformity engine
                  </p>
                </div>

                <div className="bg-muted/30 p-3.5 rounded-xl border border-border/60 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                    <CheckCircle2 className="w-4 h-4 text-primary" /> Statutory Status
                  </div>
                  <div className="text-2xl font-serif font-semibold text-foreground">
                    {selectedReg.inForceDate ? "In Force" : "Draft / Proposal"}
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    EU Official Journal Registration
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-4 flex flex-col sm:flex-row justify-between items-center gap-3">
              {selectedReg.sourceUrl ? (
                <a
                  href={selectedReg.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto"
                >
                  <Button variant="outline" size="sm" className="w-full sm:w-auto gap-2 text-xs rounded-lg">
                    <ExternalLink className="w-3.5 h-3.5" /> Official Directive Text (EUR-Lex)
                  </Button>
                </a>
              ) : (
                <div />
              )}

              <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                <Link
                  href={selectedReg.key === "cra" ? "/wiki" : `/regulations/${selectedReg.key}`}
                  className="w-full sm:w-auto"
                >
                  <Button variant="outline" size="sm" className="w-full sm:w-auto gap-2 text-xs rounded-lg">
                    <BookOpen className="w-3.5 h-3.5" /> Full Guide
                  </Button>
                </Link>
                <Link href={`/regulations/${selectedReg.key}`} className="w-full sm:w-auto">
                  <Button variant="secondary" size="sm" className="w-full sm:w-auto gap-2 text-xs rounded-lg">
                    View Details <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
                <Link href={`/requirements?regulation=${selectedReg.key}`} className="w-full sm:w-auto">
                  <Button size="sm" className="w-full sm:w-auto gap-2 text-xs rounded-lg cta-lift">
                    <BookOpen className="w-3.5 h-3.5" /> Explore Mapped Controls
                  </Button>
                </Link>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
