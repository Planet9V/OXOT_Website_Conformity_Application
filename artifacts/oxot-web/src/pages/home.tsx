import { Link } from 'wouter';
import {
  ArrowRight,
  ClipboardCheck,
  ShieldCheck,
  Clock,
  FileStack,
  Layers,
  ServerCog,
} from 'lucide-react';
import { useSeo } from '@/hooks/use-seo';
import { pageSeo } from '@/lib/page-seo';
import { JsonLd } from '@/components/json-ld';
import { LiveRegulatoryNewsFeed } from '@/components/sections/live-regulatory-news-feed';

const STALLS = [
  {
    title: 'Evidence lives everywhere.',
    body: "Spreadsheets, tickets and engineers' laptops. Nothing is assessment-ready when the auditor asks.",
  },
  {
    title: 'Clocks start without warning.',
    body: 'Article 14 gives 24 hours for early warning and 72 for detailed notification — from awareness.',
  },
  {
    title: 'One portfolio, many classes.',
    body: 'Default, Class I and Class II each take a different route. Getting it wrong costs the CE mark.',
  },
];

const PILLARS = [
  {
    icon: FileStack,
    title: 'A guided compliance journey, per product',
    body: 'Eight steps from classification to a defensible Annex VII technical file and Annex V Declaration of Conformity — evidence assembled from what you already hold.',
  },
  {
    icon: Clock,
    title: 'Statutory Article 14 clocks, running live',
    body: 'The 24-hour early warning and 72-hour notification tracked per product, with a PSIRT triage board and ENISA single-reporting-platform filing.',
  },
  {
    icon: Layers,
    title: 'One portfolio, every class',
    body: 'Default, Class I and Class II routed correctly across your whole catalogue — blockers ranked before they cost you the CE mark.',
  },
];

const PERSONAS = [
  ['Product manufacturers', 'The full Annex VII file, the CE marking, and the reporting duties from day one.'],
  ['OEMs', 'Portfolio math against 11 Dec 2027 — where Module H is the only route that fits.'],
  ['Integrators', 'Article 22: know which side of "substantial modification" your projects sit on.'],
  ['Distributors', 'Verify CE marking and the Declaration of Conformity on every line you offer.'],
  ['Owner / operators', 'Test your suppliers now, while you can still switch.'],
];

export default function CraHomePage() {
  useSeo(
    pageSeo('/', {
      title: 'OXOT Conformance Platform — run CRA conformity as an operation',
      description:
        'Every product with digital elements in one workbench: a guided compliance journey per product, statutory Article 14 clocks running live, Annex VII technical files generated from your own evidence.',
    }),
  );

  return (
    <div className="w-full">
      <JsonLd
        id="ld-organization"
        data={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'OXOT Conformance Platform',
          description:
            'Single-tenant platform to run EU Cyber Resilience Act (CRA) conformity as an operation.',
          url: typeof window !== 'undefined' ? window.location.origin : undefined,
        }}
      />
      {/* Hero */}
      <section className="border-b border-border bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto px-4 md:px-8 py-20 md:py-28 max-w-4xl text-center">
          <p className="oxot-kicker">The CRA Conformance Application</p>
          <h1 className="mt-4 font-display text-4xl font-normal leading-[1.1] tracking-tight text-foreground md:text-6xl">
            Run CRA conformity as an operation, not a fire drill.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Every product with digital elements in one workbench: a guided compliance journey per product,
            statutory Article 14 clocks running live, Annex VII technical files generated from your own evidence,
            and blockers ranked before they cost you the CE mark.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/demo"
              className="cta-lift inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
            >
              Book a demo <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/cra-check"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <ClipboardCheck className="h-4 w-4" /> Take the 2-minute check
            </Link>
          </div>
        </div>
      </section>

      {/* Statutory clock — dated, factual, no penalty framing */}
      <section className="border-b border-border bg-card">
        <div className="container mx-auto px-4 md:px-8 py-8 max-w-4xl">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <Clock className="h-6 w-6 shrink-0 text-primary" />
            <p className="text-sm leading-relaxed text-foreground">
              <span className="font-semibold">11 December 2027 — full application.</span> From 11 September 2026,
              reporting obligations are already enforceable — a 24-hour clock, for products already on the market.
            </p>
          </div>
        </div>
      </section>

      {/* Live regulatory news — API-driven, degrades gracefully */}
      <LiveRegulatoryNewsFeed />

      {/* Why teams stall */}
      <section className="border-t border-border">
        <div className="container mx-auto px-4 md:px-8 py-16 md:py-20 max-w-6xl">
          <p className="oxot-kicker text-center">Why teams stall</p>
          <h2 className="mt-2 text-center font-display text-3xl font-normal tracking-tight text-foreground">
            The CRA is an operations problem before it is a paperwork problem
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {STALLS.map((s) => (
              <div key={s.title} className="rounded-2xl border border-border bg-card p-6 shadow-e1">
                <h3 className="font-display text-lg font-normal tracking-tight text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform pillars */}
      <section className="border-t border-border bg-card/40">
        <div className="container mx-auto px-4 md:px-8 py-16 md:py-20 max-w-6xl">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="oxot-kicker">The platform</p>
              <h2 className="mt-2 font-display text-3xl font-normal tracking-tight text-foreground">
                One record, every regulation
              </h2>
            </div>
            <Link href="/product" className="text-sm font-medium text-primary-ink hover:underline">
              Explore the six modules →
            </Link>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {PILLARS.map((p) => (
              <div key={p.title} className="rounded-2xl border border-border bg-card p-6 shadow-e1">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <p.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="mt-4 font-display text-lg font-normal tracking-tight text-foreground">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Deployment */}
      <section className="border-t border-border">
        <div className="container mx-auto px-4 md:px-8 py-16 md:py-20 max-w-4xl text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <ServerCog className="h-6 w-6 text-primary" />
          </div>
          <h2 className="mt-4 font-display text-3xl font-normal tracking-tight text-foreground">
            Single tenant, always
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Run it in a secure datacenter, or on your own premises with a local AI model — your evidence never
            leaves your control.
          </p>
          <Link href="/deployment" className="mt-5 inline-block text-sm font-medium text-primary-ink hover:underline">
            See the deployment options →
          </Link>
        </div>
      </section>

      {/* Personas */}
      <section className="border-t border-border bg-card/40">
        <div className="container mx-auto px-4 md:px-8 py-16 md:py-20 max-w-6xl">
          <p className="oxot-kicker text-center">Who it's for</p>
          <h2 className="mt-2 text-center font-display text-3xl font-normal tracking-tight text-foreground">
            Wherever you sit in the value chain
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PERSONAS.map(([who, what]) => (
              <div key={who} className="flex items-start gap-3 rounded-xl border border-border bg-card p-5">
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="font-medium text-foreground">{who}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{what}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border">
        <div className="container mx-auto px-4 md:px-8 py-16 md:py-24 max-w-3xl text-center">
          <h2 className="font-display text-3xl font-normal tracking-tight text-foreground md:text-4xl">
            See your own portfolio in the workbench
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
            A 45-minute walkthrough covers classification, the evidence you already hold, and what a defensible
            Annex VII technical file looks like for your products.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/demo"
              className="cta-lift inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
            >
              Book a demo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
