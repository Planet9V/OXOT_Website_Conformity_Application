import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GlossaryDialog } from "@/components/conformity/glossary-dialog";
import { Check, ArrowRight, BookOpen, Compass } from "lucide-react";

type StepState = "done" | "active" | "upcoming";

interface Step {
  title: string;
  body: string;
  state: StepState;
  cta?: { label: string; href: string };
}

/**
 * The empty-workspace path: create a product → start its CRA assessment →
 * scope and work the gaps. Renders only while the workspace has no assessment;
 * the moment one exists, the live assessment card (and the workbench's own
 * next-action guidance) takes over.
 */
export function GettingStarted({
  hasProduct,
  productId,
  productName,
  variant = "full",
}: {
  hasProduct: boolean;
  productId?: number;
  productName?: string;
  variant?: "full" | "compact";
}) {
  const [glossaryOpen, setGlossaryOpen] = useState(false);

  const steps: Step[] = [
    {
      title: "Register your product",
      body: "Name, type, version and manufacturer — the identity your Annex VII technical documentation opens with.",
      state: hasProduct ? "done" : "active",
      cta: hasProduct ? undefined : { label: "Add your first product", href: "/products" },
    },
    {
      title: "Start its CRA assessment",
      body: "One click on the product page — the assessment opens straight into the scoping wizard.",
      state: hasProduct ? "active" : "upcoming",
      cta: hasProduct
        ? {
            label: productName ? `Open ${productName}` : "Open the product",
            href: productId != null ? `/products/${productId}` : "/products",
          }
        : undefined,
    },
    {
      title: "Scope, classify, close the gaps",
      body: "The wizard settles scope (Art. 2), class (Annex III) and conformity route (Art. 32), then builds your Annex I requirement worklist — from there, follow Next actions.",
      state: "upcoming",
    },
  ];

  const activeIndex = steps.findIndex((s) => s.state === "active");

  const list = (
    <ol className={cn("space-y-0", variant === "full" && "mt-6")} data-testid="getting-started-steps">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1;
        return (
          <li
            key={step.title}
            className="relative flex gap-4 pb-6 last:pb-0 group"
            data-testid={`gs-step-${i + 1}`}
            data-state={step.state}
          >
            {!isLast && (
              <span
                className={cn(
                  "absolute left-4 top-8 h-[calc(100%-2rem)] w-0.5 -translate-x-1/2 transition-all duration-500",
                  step.state === "done" 
                    ? "bg-gradient-to-b from-cyan-400 to-blue-600 shadow-[0_0_8px_rgba(34,211,238,0.5)]" 
                    : "bg-slate-800 group-hover:bg-slate-700",
                )}
                aria-hidden="true"
              />
            )}
            <span
              className={cn(
                "relative z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 text-xs font-semibold transition-all duration-300",
                step.state === "done" && "border-cyan-400 bg-cyan-950 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.4)]",
                step.state === "active" &&
                  "border-cyan-400 bg-slate-950 text-cyan-400 ring-4 ring-cyan-500/25 shadow-[0_0_15px_rgba(34,211,238,0.5)] animate-pulse",
                step.state === "upcoming" && "border-slate-800 bg-slate-900 text-slate-500",
              )}
            >
              {step.state === "done" ? <Check className="h-4 w-4 text-cyan-300" /> : i + 1}
            </span>
            <div className="min-w-0 pt-1">
              <div
                className={cn(
                  "font-semibold leading-snug tracking-tight text-slate-100",
                  step.state === "upcoming" && "text-slate-400",
                )}
              >
                {step.title}
              </div>
              <p className="mt-1 text-xs text-slate-400 leading-relaxed">{step.body}</p>
              {step.cta && step.state === "active" && (
                <Button asChild size="sm" className="mt-3 rounded-lg gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20" data-testid={`gs-step-${i + 1}-cta`}>
                  <Link href={step.cta.href}>
                    {step.cta.label} <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );

  if (variant === "compact") {
    return <div data-testid="getting-started">{list}</div>;
  }

  return (
    <Card className="rounded-lg border-t-4 border-t-primary" data-testid="getting-started">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
              <Compass className="w-3.5 h-3.5 text-primary" /> Getting started
            </div>
            <h2 className="mt-2 text-xl font-display font-bold tracking-tight">
              Three steps to a working CRA assessment
            </h2>
          </div>
          <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
            Step {activeIndex + 1} of {steps.length}
          </span>
        </div>

        {list}

        <button
          type="button"
          className="mt-6 inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          onClick={() => setGlossaryOpen(true)}
          data-testid="getting-started-glossary"
        >
          <BookOpen className="w-3.5 h-3.5" /> New to the vocabulary? Open the glossary
        </button>
        <GlossaryDialog open={glossaryOpen} onOpenChange={setGlossaryOpen} />
      </CardContent>
    </Card>
  );
}
