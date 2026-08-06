import { Link } from 'wouter';
import { Tag, Check, ArrowRight, Radar, LifeBuoy, Users } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { useSeo } from '@/hooks/use-seo';

type Tier = {
  name: string;
  forWho: string;
  meter: string;
  features: string[];
  deployment: string;
  support: string;
  featured?: boolean;
};

const TIERS: Tier[] = [
  {
    name: 'Essential',
    forWho: 'One product line getting to CE marking',
    meter: 'A small portfolio of product dossiers',
    features: [
      'The eight-step compliance journey',
      'Annex I requirement tracking + evidence vault',
      'Annex VII technical file + Annex V Declaration of Conformity',
      'Full conformity assessment reports',
    ],
    deployment: 'Secure datacenter',
    support: 'Standard support',
  },
  {
    name: 'Professional',
    forWho: 'A portfolio under active conformity management',
    meter: 'An expanded portfolio of product dossiers',
    featured: true,
    features: [
      'Everything in Essential',
      'PSIRT workbench',
      'Article 14 statutory clocks + ENISA single reporting-platform filing',
      'Triage board with named owners + SLA windows',
      'Reports: full + board edition',
    ],
    deployment: 'Secure datacenter or on-premise',
    support: 'Priority support',
  },
  {
    name: 'Enterprise',
    forWho: 'Multi-site or multi-business-unit manufacturers',
    meter: 'Unlimited product dossiers',
    features: [
      'Everything in Professional',
      'SSO and custom retention beyond Article 10(7)',
      'Reports: full + board + custom',
      'On-premise with a local AI model',
    ],
    deployment: 'On-premise with local AI',
    support: 'Named engineer',
  },
];

const ADDONS = [
  {
    icon: Radar,
    name: 'Surveillance',
    body: 'Continuous vulnerability and advisory monitoring against your CBOM: CISA KEV correlation, ENISA advisories and VEX exploitability, straight into the triage queue.',
  },
  {
    icon: LifeBuoy,
    name: 'CRA Readiness Retainer',
    body: 'Standing access to OXOT engineers across the conformity year. The platform holds the evidence; the retainer keeps it moving.',
  },
  {
    icon: Users,
    name: 'CRA Readiness Consulting',
    body: 'The three-phase engagement: classification and scope, risk engineering and evidence, technical file to audit-ready.',
  },
];

export default function PricingPage() {
  useSeo({
    title: 'Pricing — OXOT Conformance Platform',
    description:
      'Three tiers metered on products with digital elements under management. Fixed scope, variable price — request a quote. Single-tenant, always.',
  });

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 md:py-16 max-w-6xl">
      <PageHeader
        kicker="PRICING"
        title="Priced on the products you actually manage"
        icon={Tag}
        description="Tiers are metered on products with digital elements under management — the honest unit for the CRA, and the one you can count. It is a single-tenant product whose cost depends on your deployment, so the scope is fixed and public; the price is a quote."
      />

      <div className="grid gap-5 lg:grid-cols-3">
        {TIERS.map((t) => (
          <div
            key={t.name}
            className={`flex flex-col rounded-2xl border bg-card p-6 ${
              t.featured ? 'border-primary shadow-e2 ring-1 ring-primary/30' : 'border-border shadow-e1'
            }`}
          >
            {t.featured && <span className="oxot-kicker mb-2">Most chosen</span>}
            <h3 className="font-display text-2xl font-normal tracking-tight text-foreground">{t.name}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t.forWho}</p>
            <div className="mt-4 border-y border-border py-4">
              <p className="text-2xl font-semibold text-foreground">Request a quote</p>
              <p className="mt-1 text-xs text-muted-foreground">{t.meter}</p>
            </div>
            <ul className="mt-4 flex-1 space-y-2.5">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {f}
                </li>
              ))}
            </ul>
            <dl className="mt-5 space-y-1.5 border-t border-border pt-4 text-xs text-muted-foreground">
              <div className="flex justify-between gap-3">
                <dt>Deployment</dt>
                <dd className="text-right font-medium text-foreground">{t.deployment}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt>Support</dt>
                <dd className="text-right font-medium text-foreground">{t.support}</dd>
              </div>
            </dl>
            <Link
              href="/demo"
              className={`cta-lift mt-5 inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
                t.featured
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'border border-border text-foreground hover:border-primary hover:text-primary'
              }`}
            >
              Book a demo <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ))}
      </div>

      <p className="mx-auto mt-5 max-w-2xl text-center text-xs text-muted-foreground">
        Deliberate: Article 14 statutory clocks and the PSIRT workbench start at Professional. The 24-hour
        reporting obligation is the sharpest reason to buy — and the natural upgrade trigger.
      </p>

      {/* Add-ons */}
      <div className="mt-16">
        <p className="oxot-kicker text-center">Add to any tier</p>
        <h2 className="mt-2 text-center font-display text-2xl font-normal tracking-tight text-foreground">
          The platform, plus people
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-muted-foreground">
          The product holds the record; the add-ons do the work. Each is available on any tier — request a quote.
        </p>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {ADDONS.map((a) => (
            <div key={a.name} className="rounded-2xl border border-border bg-card p-6 shadow-e1">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <a.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-4 font-display text-lg font-normal tracking-tight text-foreground">{a.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{a.body}</p>
              <p className="mt-4 text-xs font-medium text-primary-ink">Add to any tier · Request a quote</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16 rounded-2xl border border-border bg-card p-8 text-center">
        <h2 className="font-display text-2xl font-normal tracking-tight text-foreground">
          Which tier fits your portfolio?
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          A 45-minute walkthrough sizes it against your real product count and deployment, and shows you the
          workbench with your own classification.
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
