import { useMemo } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ClipboardCheck, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { useSeo } from '@/hooks/use-seo';
import { pageSeo } from '@/lib/page-seo';
import { CraSelfCheck, type SelfCheckCopy } from '@/components/cra-check/self-check';
import { parsePrefill } from '@/lib/cra-selfcheck';
import copyEn from '@/data/cra_selfcheck_en.json';
import copyNl from '@/data/cra_selfcheck_nl.json';
import { useLocale } from '@/providers/locale-provider';
import { entranceVariants, revealVariants } from '@/lib/motion';

const selfCheckCopy: Record<'en' | 'nl', SelfCheckCopy> = {
  en: copyEn as unknown as SelfCheckCopy,
  nl: copyNl as unknown as SelfCheckCopy,
};

// Localised page copy (nl-NL professional register, "u"). Machine-assisted —
// flag Dutch strings for a native reviewer before go-live. Structure mirrors the
// English source so every visible string has a Dutch equivalent.
const copy = {
  en: {
    seoTitle: '2-Minute CRA Readiness Check',
    seoDescription:
      'Six questions, about two minutes: an indicative CRA classification, your route to CE marking, your specific gaps and a readiness score — grounded in Regulation (EU) 2024/2847, not a vendor pitch.',
    kicker: '2-MINUTE READINESS CHECK',
    title: 'Are you CRA-ready?',
    description:
      "Six questions, about two minutes. You'll get an indicative CRA classification, your route to the CE marking, your specific gaps and a readiness score — grounded in the regulation, not a vendor pitch. Submit it for a human review and a downloadable report.",
    deeperKicker: 'Ready to go deeper?',
    finalTitle: 'See your own portfolio in the workbench',
    finalBody:
      'A 45-minute walkthrough covers classification, the evidence you already hold, and what a defensible Annex VII technical file looks like for your products.',
    bookDemo: 'Book a demo',
  },
  nl: {
    seoTitle: 'CRA-gereedheidscheck van 2 minuten',
    seoDescription:
      'Zes vragen, ongeveer twee minuten: een indicatieve CRA-classificatie, uw route naar de CE-markering, uw specifieke tekortkomingen en een gereedheidsscore — gebaseerd op Verordening (EU) 2024/2847, geen verkooppraatje.',
    kicker: 'GEREEDHEIDSCHECK VAN 2 MINUTEN',
    title: 'Bent u CRA-gereed?',
    description:
      'Zes vragen, ongeveer twee minuten. U ontvangt een indicatieve CRA-classificatie, uw route naar de CE-markering, uw specifieke tekortkomingen en een gereedheidsscore — gebaseerd op de verordening, geen verkooppraatje. Dien het in voor een beoordeling door een mens en een downloadbaar rapport.',
    deeperKicker: 'Klaar om dieper te gaan?',
    finalTitle: 'Bekijk uw eigen portfolio in de workbench',
    finalBody:
      'Een rondleiding van 45 minuten behandelt classificatie, het bewijs dat u al in huis hebt, en hoe een verdedigbaar technisch dossier volgens Bijlage VII eruitziet voor uw producten.',
    bookDemo: 'Demo aanvragen',
  },
} as const;

export default function CraCheckPage() {
  const { locale } = useLocale();
  const t = copy[locale];

  useSeo(
    pageSeo('/cra-check', {
      title: t.seoTitle,
      description: t.seoDescription,
    }),
  );

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
      <motion.div {...entranceVariants(0)}>
        <PageHeader
          kicker={t.kicker}
          title={t.title}
          icon={ClipboardCheck}
          description={t.description}
        />
      </motion.div>

      <CraSelfCheck
        locale={locale}
        copy={selfCheckCopy[locale]}
        initialAnswers={answers}
        openOnCategory={openOnCategory}
      />

      <motion.div
        className="mt-12 rounded-xl border border-border bg-card p-6 text-center"
        {...revealVariants(0)}
      >
        <p className="oxot-kicker mb-2">{t.deeperKicker}</p>
        <h2 className="font-display text-xl font-normal tracking-tight text-foreground">
          {t.finalTitle}
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          {t.finalBody}
        </p>
        <Link
          href="/demo"
          className="cta-lift mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
        >
          {t.bookDemo} <ArrowRight className="h-4 w-4" />
        </Link>
      </motion.div>
    </div>
  );
}
