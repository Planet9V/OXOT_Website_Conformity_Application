import { Link } from 'wouter';
import { ServerCog, Building2, HardDrive, Cpu, Lock, Mail, Users, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { useSeo } from '@/hooks/use-seo';
import { pageSeo } from '@/lib/page-seo';

const OPTIONS = [
  {
    icon: Building2,
    name: 'Secure compliance datacenter',
    body: 'Single-tenant, hosted in a compliance-grade datacenter. Your instance, your data — never shared, never pooled.',
  },
  {
    icon: HardDrive,
    name: 'On-premise, your hardware',
    body: 'Deployed on your own premises with our hardware. Your evidence never leaves your control, and it stays available if your link does not.',
  },
  {
    icon: Cpu,
    name: 'On-premise with local AI',
    body: 'A custom AI model that runs island-mode — it processes and stores everything locally. No data leaves the box; the model learns your organisation over time.',
  },
];

const FEATURES = [
  { icon: Lock, label: 'Single tenant, always — no shared infrastructure' },
  { icon: Cpu, label: 'Island-mode AI: all processing and storage stays local' },
  { icon: Users, label: 'Up to 20 users, and OAuth / SSO for your identity provider' },
  { icon: Mail, label: 'Configurable email and Slack integration' },
];

export default function DeploymentPage() {
  useSeo(
    pageSeo('/deployment', {
      title: 'Deployment — OXOT Conformance Platform',
      description:
        'Single tenant, always. Run it in a secure datacenter, or on your own premises with a local AI model — your evidence never leaves your control.',
    }),
  );

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 md:py-16 max-w-6xl">
      <PageHeader
        kicker="DEPLOYMENT"
        title="Single tenant, always"
        icon={ServerCog}
        description="Run it in a secure datacenter, or on your own premises with a local AI model — your evidence never leaves your control. The platform is single-tenant by design: your conformity record is not something to pool with anyone else's."
      />

      <div className="grid gap-5 md:grid-cols-3">
        {OPTIONS.map((o) => (
          <div key={o.name} className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-e1">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <o.icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="mt-4 font-display text-lg font-normal tracking-tight text-foreground">{o.name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{o.body}</p>
          </div>
        ))}
      </div>

      {/* The island-mode moat */}
      <div className="mt-12 rounded-2xl border border-primary/30 bg-primary/5 p-8">
        <div className="grid gap-6 md:grid-cols-2 md:items-center">
          <div>
            <p className="oxot-kicker">The island-mode advantage</p>
            <h2 className="mt-2 font-display text-2xl font-normal tracking-tight text-foreground">
              A custom AI that never phones home
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              The platform ships with its own AI model configured for island mode: it reads your evidence, drafts
              your files and answers your questions entirely on the local instance. Nothing is sent to a third-party
              model, and the store stays with you. For a conformity record — the thing an auditor and a regulator
              both scrutinise — that is the only posture that holds.
            </p>
          </div>
          <ul className="space-y-3">
            {FEATURES.map((f) => (
              <li key={f.label} className="flex items-start gap-3 rounded-xl border border-border bg-card p-4">
                <f.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <span className="text-sm text-foreground">{f.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-16 rounded-2xl border border-border bg-card p-8 text-center">
        <h2 className="font-display text-2xl font-normal tracking-tight text-foreground">
          Which deployment fits your estate?
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          A 45-minute walkthrough covers hosting, the local-AI option and how it maps to your security posture.
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
