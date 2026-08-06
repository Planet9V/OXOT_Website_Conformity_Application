import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  ShieldCheck,
  Compass,
  Bot,
  FileCheck2,
  ArrowRight,
  Radar,
} from "lucide-react";

import { OxotWordmark } from "@/components/ui/oxot-wordmark";

function Brand() {
  return (
    <Link href="/welcome" className="shrink-0 flex items-center">
      <OxotWordmark variant="header" />
    </Link>
  );
}

const CAPABILITIES = [
  {
    icon: ShieldCheck,
    title: "One map, five regimes",
    body: "CRA, the AI Act, the Machinery Regulation, IEC 62443 and NIS2 — unified by shared requirement themes so evidence counts once, everywhere.",
  },
  {
    icon: Compass,
    title: "A guided cockpit",
    body: "Scope, classify, pick the conformity route, then work a prioritised gap worklist. The workbench always tells you the next best action.",
  },
  {
    icon: Bot,
    title: "A workspace-aware Copilot",
    body: "An assistant that reads this assessment's live state — gaps, evidence, artifacts, grade and incident clocks — and answers in context.",
  },
  {
    icon: FileCheck2,
    title: "Auditor-ready artifacts",
    body: "Technical documentation, SBOM references and a Declaration of Conformity draft assemble themselves from the evidence you attach.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Scope & classify",
    body: "Answer a short set of guided questions. We determine whether the product is in scope and its risk class.",
  },
  {
    n: "02",
    title: "Close the gaps",
    body: "Work a prioritised requirement worklist — attach evidence, assign owners, track deadlines and blockers.",
  },
  {
    n: "03",
    title: "Prove readiness",
    body: "Generate artifacts, compute a readiness grade, and start the CRA incident clock the moment something is reported.",
  },
];

export default function Welcome() {
  return (
    <div className="min-h-[100dvh] bg-background text-foreground">
      {/* Top bar */}
      <header className="border-b border-border/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Brand />
          <div className="flex items-center gap-2">
            <Link href="/regulations">
              <Button variant="ghost" className="rounded-md hidden sm:inline-flex">
                Reference library
              </Button>
            </Link>
            <Link href="/demo">
              <Button className="rounded-md gap-2">
                Live demo <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.15] [background-image:linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]"
        />
        <div className="relative mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-3xl">
            <span className="oxot-kicker flex items-center gap-1.5 mb-2">
              <Radar className="w-3.5 h-3.5 text-primary" /> MISSION CONTROL FOR EU PRODUCT COMPLIANCE
            </span>
            <h1 className="mt-2 text-4xl sm:text-6xl font-serif font-normal tracking-tight text-foreground leading-[1.05]">
              Fly your product to
              <span className="text-primary"> auditor-ready</span>.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl leading-relaxed">
              OXOT Conformity is a single cockpit for the overlapping EU regimes your connected product
              must satisfy. Map the rules once, close the gaps with evidence, and let a workspace-aware
              copilot keep you pointed at what matters.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Link href="/demo">
                <Button size="lg" className="rounded-md gap-2 w-full sm:w-auto">
                  Launch the live demo <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
              <Link href="/regulations">
                <Button size="lg" variant="outline" className="rounded-md w-full sm:w-auto">
                  Explore the regulations
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-xs text-muted-foreground font-mono">
              No sign-up — the demo opens a fully worked CRA assessment.
            </p>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="grid gap-4 sm:grid-cols-2">
          {CAPABILITIES.map((c) => (
            <div
              key={c.title}
              className="rounded-lg border border-border bg-card p-6 transition-colors hover:border-primary/40"
            >
              <span className="grid place-items-center w-10 h-10 rounded-md bg-primary/10 text-primary">
                <c.icon className="w-5 h-5" />
              </span>
              <h3 className="mt-4 font-display font-semibold text-lg">{c.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border/60 bg-card/30">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
            The flight plan
          </div>
          <h2 className="mt-2 text-3xl font-display font-bold tracking-tight">
            From regulation to readiness, in three passes
          </h2>
          <div className="mt-10 grid gap-8 md:grid-cols-3">
            {STEPS.map((s) => (
              <div key={s.n} className="relative">
                <div className="font-mono text-4xl font-bold text-primary/30">{s.n}</div>
                <h3 className="mt-2 font-display font-semibold text-lg">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-8 sm:p-12 text-center">
            <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight">
              See it on a real assessment
            </h2>
            <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
              Step into a live CRA assessment for a smart-home product — gaps, evidence, a readiness
              grade and the copilot, all populated and ready to explore.
            </p>
            <Link href="/demo">
              <Button size="lg" className="mt-6 rounded-md gap-2">
                Enter the demo <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/60">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between text-xs text-muted-foreground">
          <span>OXOT Conformity — cross-regulation mapping workbench</span>
          <span className="flex items-center gap-2 font-mono">
            <span className="w-2 h-2 rounded-full bg-green-500" /> System online
          </span>
        </div>
      </footer>
    </div>
  );
}
