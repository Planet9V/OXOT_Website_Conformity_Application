import { Link } from 'wouter';
import { Landmark, ClipboardCheck, ArrowRight } from 'lucide-react';
import { useSeo } from '@/hooks/use-seo';
import { pageSeo } from '@/lib/page-seo';
import { JsonLd } from '@/components/json-ld';
import { EuActReader } from '@/components/eu-act-reader';
import type { WikiActMeta } from './wiki-meta';

/**
 * The public statutory wiki shell (22.2) — the SEO lead magnet. Each act page
 * is the same wiki-pattern reader the product ships, over the same corpus
 * bundles (one sync script writes both apps), so the free reading room and
 * the paid system of record can never tell different stories. This file is
 * DATA-FREE: each act's page imports its own bundle so route chunks stay
 * per-act (the AI Act alone is ~700 KiB of statute).
 */

function ActCta({ slug }: { slug: string }) {
  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-12">
      <div className="rounded-2xl border border-border bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">
          Reading the law is free — running your obligations against it is the product.
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/cra-check"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <ClipboardCheck className="h-4 w-4" /> Take the 2-minute check
          </Link>
          {slug === 'nis2' && (
            <Link
              href="/operators"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground hover:border-primary hover:text-primary"
            >
              Supplier CRA management for operators <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export function WikiActShell({
  act,
  recitals,
  articles,
  annexes,
}: {
  act: WikiActMeta;
  recitals: any;
  articles: any;
  annexes: any;
}) {
  useSeo(
    pageSeo(`/wiki/${act.slug}`, {
      title: act.seoTitle,
      description: act.seoDescription,
    }),
  );
  return (
    <>
      <JsonLd
        id={`ld-legislation-${act.slug}`}
        data={{
          '@context': 'https://schema.org',
          '@type': 'Legislation',
          name: act.citeAs,
          alternateName: act.actLabel,
          legislationType: act.citeAs.startsWith('Directive') ? 'Directive' : 'Regulation',
          inLanguage: 'en',
        }}
      />
      <EuActReader
        kicker={act.kicker}
        actLabel={act.actLabel}
        title={act.title}
        subtitle={`${act.citeAs}. ${articles.totalArticles} articles, ${recitals.recitalsCount} recitals — the same CI-verified corpus the OXOT Conformance Platform runs on.`}
        banner={
          <div className="rounded-2xl border border-border/60 bg-muted/20 px-5 py-4 text-sm text-muted-foreground flex gap-3">
            <Landmark className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p>{act.banner}</p>
          </div>
        }
        recitalsData={recitals}
        articlesData={articles}
        annexesData={annexes}
        defaultArticle={act.defaultArticle}
        bodyTestId={`wiki-${act.slug}-body`}
        citeAs={act.citeAs}
      />
      <ActCta slug={act.slug} />
    </>
  );
}
