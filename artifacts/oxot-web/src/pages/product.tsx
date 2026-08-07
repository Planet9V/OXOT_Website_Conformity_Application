import { Link } from 'wouter';
import {
  Boxes,
  Compass,
  ClipboardList,
  FileCheck2,
  ShieldAlert,
  FileBarChart,
  ArrowRight,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { useSeo } from '@/hooks/use-seo';

const MODULES = [
  {
    icon: Boxes,
    name: 'Product portfolio',
    body: 'Every product with digital elements as a living dossier — one record per product, its class, route and evidence in one place.',
  },
  {
    icon: Compass,
    name: 'Classification & route',
    body: 'Default, Class I, Class II or Critical — placed correctly, with the conformity route (Module A / B+C / H) that follows from it.',
  },
  {
    icon: ClipboardList,
    name: 'Annex I requirements + evidence vault',
    body: 'The 13 product-security properties and 8 vulnerability-handling processes tracked per product, each backed by assessment-ready evidence.',
  },
  {
    icon: FileCheck2,
    name: 'Annex VII technical file + Annex V DoC',
    body: 'The technical file assembled from your own evidence, and the Declaration of Conformity generated when the record is complete.',
  },
  {
    icon: ShieldAlert,
    name: 'PSIRT & Article 14 clocks',
    body: 'A triage board with named owners and SLA windows, the 24h/72h/14d statutory clocks running live, and ENISA single-reporting-platform filing.',
  },
  {
    icon: FileBarChart,
    name: 'Conformity assessment reports',
    body: 'Full, board-edition and custom reports — the state of every product against its obligations, ready for an auditor or a board.',
  },
];

const JOURNEY = [
  ['Scope', 'Confirm the product is in scope and capture what it is.'],
  ['Classify', 'Place the product in its CRA class and derive the route.'],
  ['Assess risk', 'Build the Annex I risk assessment that drives the design.'],
  ['Gather evidence', 'SBOM, secure-development docs and CVD into the vault.'],
  ['Track requirements', 'Every Annex I property and process, evidenced.'],
  ['Assemble the file', 'The Annex VII technical file, from your own record.'],
  ['Declare conformity', 'The Annex V Declaration of Conformity and CE marking.'],
  ['Operate', 'Article 14 clocks, PSIRT triage and continuing surveillance.'],
];

export default function ProductPage() {
  useSeo({
    title: 'The platform — OXOT Conformance Platform',
    description:
      'Six modules and an eight-step compliance journey: from classification to a defensible Annex VII technical file, with statutory Article 14 clocks running live.',
  });

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 md:py-16 max-w-6xl">
      <PageHeader
        kicker="THE PLATFORM"
        title="One record, every regulation"
        icon={Boxes}
        description="The OXOT Conformance Platform runs CRA conformity as an operation: every product with digital elements as a living dossier, a guided journey per product, and the statutory clocks running where you can see them. Six modules, one record."
      />

      {/* Modules */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {MODULES.map((m) => (
          <div key={m.name} className="rounded-2xl border border-border bg-card p-6 shadow-e1">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <m.icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="mt-4 font-display text-lg font-normal tracking-tight text-foreground">{m.name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{m.body}</p>
          </div>
        ))}
      </div>

      {/* Eight-step journey */}
      <div className="mt-16">
        <p className="oxot-kicker text-center">The compliance journey</p>
        <h2 className="mt-2 text-center font-display text-3xl font-normal tracking-tight text-foreground">
          Eight steps, per product
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {JOURNEY.map(([step, body], i) => (
            <div key={step} className="rounded-xl border border-border bg-card p-5">
              <span className="font-mono text-xs text-primary">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mt-1 font-display text-base font-normal tracking-tight text-foreground">{step}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16 rounded-2xl border border-border bg-card p-8 text-center">
        <h2 className="font-display text-2xl font-normal tracking-tight text-foreground">
          See it against your own products
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          A 45-minute walkthrough shows the workbench with your classification, your evidence and your Annex VII file.
        </p>
        <Link
          href="/demo"
          className="cta-lift mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
        >
          Book a demo <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
