import { useMemo } from 'react';
import { Link } from 'wouter';
import { ClipboardCheck, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { useSeo } from '@/hooks/use-seo';
import { CraSelfCheck, type SelfCheckCopy } from '@/components/cra-check/self-check';
import { parsePrefill } from '@/lib/cra-selfcheck';
import copyEn from '@/data/cra_selfcheck_en.json';

const copy = copyEn as unknown as SelfCheckCopy;

export default function CraCheckPage() {
  useSeo({
    title: '2-Minute CRA Readiness Check',
    description:
      'Six questions, about two minutes: an indicative CRA classification, your route to CE marking, your specific gaps and a readiness score — grounded in Regulation (EU) 2024/2847, not a vendor pitch.',
  });

  // Prefill from the home-page teaser hand-off (?position=&classAware=&sbom=).
  const { answers, openOnCategory } = useMemo(() => {
    const p = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    return parsePrefill({
      position: p.get('position') ?? undefined,
      classAware: p.get('classAware') ?? undefined,
      sbom: p.get('sbom') ?? undefined,
    });
  }, []);

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 md:py-16 max-w-2xl">
      <PageHeader
        kicker="2-MINUTE READINESS CHECK"
        title="Are you CRA-ready?"
        icon={ClipboardCheck}
        description="Six questions, about two minutes. You'll get an indicative CRA classification, your route to the CE marking, your specific gaps and a readiness score — grounded in the regulation, not a vendor pitch. Submit it for a human review and a downloadable report."
      />

      <CraSelfCheck
        locale="en"
        copy={copy}
        initialAnswers={answers}
        openOnCategory={openOnCategory}
      />

      <div className="mt-12 rounded-xl border border-border bg-card p-6 text-center">
        <p className="oxot-kicker mb-2">Ready to go deeper?</p>
        <h2 className="font-display text-xl font-normal tracking-tight text-foreground">
          See your own portfolio in the workbench
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          A 45-minute walkthrough covers classification, the evidence you already hold, and what a
          defensible Annex VII technical file looks like for your products.
        </p>
        <Link
          href="/demo"
          className="cta-lift mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
        >
          Book a demo <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
