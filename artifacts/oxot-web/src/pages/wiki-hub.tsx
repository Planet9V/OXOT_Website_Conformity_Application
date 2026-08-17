import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { BookOpen, ArrowRight, Scale, Mic, Newspaper } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { useSeo } from '@/hooks/use-seo';
import { pageSeo } from '@/lib/page-seo';
import { revealVariants } from '@/lib/motion';
import { WIKI_ACT_META } from './wiki-meta';

/**
 * The reading room (22.2) — the free front door for statutory traffic. Every
 * card is the full verbatim text, browsable, from the same CI-verified corpus
 * the product runs on. One contextual CTA per page; no gate, no signup.
 */
export default function WikiHubPage() {
  useSeo(
    pageSeo('/wiki', {
      title: 'EU cyber & product law, full text and browsable — the OXOT reading room',
      description:
        'The CRA, NIS2, AI Act, Machinery Regulation, RED, GDPR and Data Act — verbatim, as amended, with search, citations and deep links. Free, no signup, verified character-exact in CI.',
    }),
  );

  const cards = [
    {
      href: '/wiki/cra',
      label: 'CRA',
      name: 'Cyber Resilience Act',
      cite: 'Regulation (EU) 2024/2847',
      note: 'full text · corrigenda applied',
    },
    ...WIKI_ACT_META.map((a) => ({
      href: `/wiki/${a.slug}`,
      label: a.actLabel,
      name: a.title.replace(/ — .*$/, ''),
      cite: a.citeAs,
      note: a.kicker.toLowerCase(),
    })),
  ];

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 md:py-16 max-w-6xl">
      <PageHeader
        kicker="THE READING ROOM"
        title="The law, verbatim. Free."
        icon={BookOpen}
        description="Seven EU acts, full text and browsable — as amended, corrigenda applied and disclosed, verified character-exact in CI against the Official Journal. The same corpus the OXOT Conformance Platform runs on: read here for free, run your obligations against it in the product."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((c, i) => (
          <motion.div key={c.href} {...revealVariants(i)}>
            <Link
              href={c.href}
              className="group flex h-full flex-col gap-2 rounded-2xl border border-border bg-card p-5 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                  {c.label}
                </span>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <h2 className="font-display text-lg font-normal tracking-tight text-foreground">
                {c.name}
              </h2>
              <p className="text-xs text-muted-foreground">{c.cite}</p>
              <p className="mt-auto font-mono text-[11px] text-muted-foreground">{c.note}</p>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* The rest of the magnet set: analysis and audio on the same statutes. */}
      <div className="mt-12 grid gap-4 sm:grid-cols-2">
        <Link
          href="/blog"
          className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 hover:border-primary/50 transition-colors"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Newspaper className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-base text-foreground">
              Engineering & statutory guides
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              50 in-depth guides on living with these acts — RFP language, variation orders,
              the 2-year contract lag.
            </p>
          </div>
        </Link>
        <Link
          href="/podcast"
          className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 hover:border-primary/50 transition-colors"
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Mic className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-base text-foreground">The CRA podcast</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              The statutes read out loud and argued over — for the commute between plant
              visits.
            </p>
          </div>
        </Link>
      </div>

      <div className="mt-12 rounded-2xl border border-border bg-card p-6 text-center">
        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Scale className="h-5 w-5 text-primary" />
        </div>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
          Why free? Because the text is the law’s, not ours. What we sell is the system of
          record that runs your products and your suppliers against it — and never tells
          you you’re compliant when it can’t know.
        </p>
        <Link
          href="/product"
          className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          See the platform <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
