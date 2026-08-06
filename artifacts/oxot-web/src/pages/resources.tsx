import { Link } from 'wouter';
import { Library, Download, Newspaper, BookOpen, FileText, Scale, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { useSeo } from '@/hooks/use-seo';

const COLLATERAL = [
  {
    name: 'Spec sheet',
    body: 'The platform at a glance: modules, the compliance journey, and how it maps to the CRA.',
    href: '/collateral/OXOT-CRA-Conformance-Spec-Sheet.pdf',
  },
  {
    name: 'Sales sheet',
    body: 'The offer in one page: what the CRA Conformance Application does, and who it is for.',
    href: '/collateral/OXOT-CRA-Conformance-Sales-Sheet.pdf',
  },
];

const REFERENCE = [
  { icon: BookOpen, name: 'CRA Primer', body: 'A plain-language walk through the Cyber Resilience Act.', href: '/cra' },
  { icon: Newspaper, name: 'Regulatory news', body: 'A live corpus of CRA developments, refreshed daily.', href: '/news' },
  { icon: Library, name: 'Knowledge hub', body: 'Guides and analysis on getting products conformity-ready.', href: '/knowledge' },
  { icon: FileText, name: 'Source library', body: 'The primary legislation and technical annexes behind the requirements.', href: '/conformity-platform/sources' },
  { icon: Scale, name: 'Regulations', body: 'Browse every regulation and its mapped obligations.', href: '/conformity-platform/regulations' },
];

export default function ResourcesPage() {
  useSeo({
    title: 'Resources — OXOT Conformance Platform',
    description:
      'Spec sheet and sales sheet for the CRA Conformance Application, plus the CRA primer, live regulatory news, knowledge hub and source library.',
  });

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 md:py-16 max-w-6xl">
      <PageHeader
        kicker="RESOURCES"
        title="Collateral and reference"
        icon={Library}
        description="Download the spec and sales sheets for the CRA Conformance Application, or dig into the underlying reference: the CRA primer, a live regulatory-news corpus, the knowledge hub and the primary source library."
      />

      {/* Collateral PDFs */}
      <p className="oxot-kicker">Download</p>
      <div className="mt-3 grid gap-5 sm:grid-cols-2">
        {COLLATERAL.map((c) => (
          <a
            key={c.name}
            href={c.href}
            target="_blank"
            rel="noreferrer"
            className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-6 shadow-e1 transition-colors hover:border-primary"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Download className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-display text-lg font-normal tracking-tight text-foreground group-hover:text-primary">
                {c.name}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">{c.body}</p>
              <span className="mt-2 inline-block text-xs font-medium text-primary-ink">PDF · opens in a new tab</span>
            </div>
          </a>
        ))}
      </div>

      {/* Reference */}
      <p className="oxot-kicker mt-14">Reference</p>
      <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REFERENCE.map((r) => (
          <Link
            key={r.name}
            href={r.href}
            className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <r.icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="mt-4 font-display text-lg font-normal tracking-tight text-foreground group-hover:text-primary">
              {r.name}
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">{r.body}</p>
          </Link>
        ))}
      </div>

      <div className="mt-16 rounded-2xl border border-border bg-card p-8 text-center">
        <h2 className="font-display text-2xl font-normal tracking-tight text-foreground">Rather see it live?</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          A 45-minute walkthrough covers classification, your evidence and a defensible Annex VII technical file.
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
