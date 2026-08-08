import { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, Check, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { useSeo } from '@/hooks/use-seo';
import { pageSeo } from '@/lib/page-seo';
import { Button } from '@/components/ui/button';
import { useLocale } from '@/providers/locale-provider';
import { entranceVariants } from '@/lib/motion';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const field =
  'w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';

// Localised page copy (nl-NL professional register, "u"). Machine-assisted —
// flag Dutch strings for a native reviewer before go-live. Structure mirrors the
// English source so every visible string has a Dutch equivalent.
const copy = {
  en: {
    seoTitle: 'Book a demo — OXOT Conformance Platform',
    seoDescription:
      'A 45-minute walkthrough covers classification, the evidence you already hold, and what a defensible Annex VII technical file looks like for your products.',
    covers: [
      'Your classification, confirmed by an OT engineer — not a checklist',
      'The evidence you already hold, mapped to the Annex VII technical file',
      'Your route to the CE marking (Module A / B+C / H), chosen for your portfolio',
      'A realistic sequence against the 11 December 2027 deadline',
    ],
    headerKicker: 'BOOK A DEMO',
    headerTitle: 'See your own portfolio in the workbench',
    headerDescription:
      'A 45-minute walkthrough covers classification, the evidence you already hold, and what a defensible Annex VII technical file looks like for your products. Free, no obligation — you keep the read whether or not we work together.',
    coversHeading: 'What the walkthrough covers',
    scopePre: 'Prefer to scope yourself first? Take the',
    scopeLink: '2-minute readiness check',
    scopePost: 'and bring the result to the call.',
    successTitle: "We've got it.",
    successBody:
      "We'll reach out within two working days to book your 45-minute walkthrough. In the meantime, the 2-minute check gives you an indicative classification and readiness score to bring along.",
    successCta: 'Take the 2-minute check',
    errName: 'Please enter your name.',
    errEmail: 'Please enter a valid work email.',
    errRate: 'Too many submissions — please try again in a minute.',
    errGeneric: 'Something went wrong — please try again.',
    phName: 'Your name',
    phEmail: 'you@company.com',
    phCompany: 'Organisation',
    phRole: 'e.g. Head of Product Security',
    phBlocker: 'Your most pressing CRA question (optional)',
    alName: 'Name',
    alEmail: 'Work email',
    alCompany: 'Organisation',
    alRole: 'Role',
    alBlocker: 'Your most pressing CRA question',
    submitting: 'Submitting…',
    submit: 'Request my walkthrough',
    fineprint: 'Free · 45 minutes · no obligation',
  },
  nl: {
    seoTitle: 'Demo aanvragen — OXOT Conformance Platform',
    seoDescription:
      'Een rondleiding van 45 minuten behandelt classificatie, het bewijs dat u al in huis hebt, en hoe een verdedigbaar technisch dossier volgens Bijlage VII eruitziet voor uw producten.',
    covers: [
      'Uw classificatie, bevestigd door een OT-engineer — geen checklist',
      'Het bewijs dat u al in huis hebt, gekoppeld aan het technisch dossier volgens Bijlage VII',
      'Uw route naar de CE-markering (Module A / B+C / H), gekozen voor uw portfolio',
      'Een realistische planning richting de deadline van 11 december 2027',
    ],
    headerKicker: 'DEMO AANVRAGEN',
    headerTitle: 'Bekijk uw eigen portfolio in de workbench',
    headerDescription:
      'Een rondleiding van 45 minuten behandelt classificatie, het bewijs dat u al in huis hebt, en hoe een verdedigbaar technisch dossier volgens Bijlage VII eruitziet voor uw producten. Gratis en vrijblijvend — u houdt de inzichten, of we nu samenwerken of niet.',
    coversHeading: 'Wat de rondleiding behandelt',
    scopePre: 'Wilt u eerst zelf de omvang bepalen? Doe de',
    scopeLink: '2-minutencheck voor gereedheid',
    scopePost: 'en neem het resultaat mee naar het gesprek.',
    successTitle: 'We hebben het ontvangen.',
    successBody:
      'We nemen binnen twee werkdagen contact met u op om uw rondleiding van 45 minuten in te plannen. In de tussentijd geeft de 2-minutencheck u een indicatieve classificatie en gereedheidsscore om mee te nemen.',
    successCta: 'Doe de 2-minutencheck',
    errName: 'Voer uw naam in.',
    errEmail: 'Voer een geldig zakelijk e-mailadres in.',
    errRate: 'Te veel inzendingen — probeer het over een minuut opnieuw.',
    errGeneric: 'Er is iets misgegaan — probeer het opnieuw.',
    phName: 'Uw naam',
    phEmail: 'u@bedrijf.nl',
    phCompany: 'Organisatie',
    phRole: 'bijv. Hoofd Productbeveiliging',
    phBlocker: 'Uw meest urgente CRA-vraag (optioneel)',
    alName: 'Naam',
    alEmail: 'Zakelijk e-mailadres',
    alCompany: 'Organisatie',
    alRole: 'Rol',
    alBlocker: 'Uw meest urgente CRA-vraag',
    submitting: 'Bezig met verzenden…',
    submit: 'Vraag mijn rondleiding aan',
    fineprint: 'Gratis · 45 minuten · vrijblijvend',
  },
} as const;

export default function DemoPage() {
  const { locale } = useLocale();
  const t = copy[locale];

  useSeo(
    pageSeo('/demo', {
      title: t.seoTitle,
      description: t.seoDescription,
    }),
  );

  const [state, setState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [topError, setTopError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState('submitting');
    setErrors({});
    setTopError(null);
    const fd = new FormData(e.currentTarget);
    const name = String(fd.get('name') ?? '').trim();
    const email = String(fd.get('email') ?? '').trim();
    const fe: Record<string, string> = {};
    if (name.length < 2) fe.name = t.errName;
    if (!EMAIL_RE.test(email)) fe.email = t.errEmail;
    if (Object.keys(fe).length) {
      setErrors(fe);
      setState('idle');
      return;
    }
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          company: String(fd.get('company') ?? ''),
          role: String(fd.get('role') ?? ''),
          blocker: String(fd.get('blocker') ?? ''),
          message: 'Requested a 45-minute platform walkthrough.',
          source: 'demo',
          website: fd.get('website'),
          locale: 'en',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setState('success');
        return;
      }
      setTopError(res.status === 429 ? t.errRate : t.errGeneric);
      setState('error');
    } catch {
      setTopError(t.errGeneric);
      setState('error');
    }
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 md:py-16 max-w-5xl">
      <motion.div {...entranceVariants(0)}>
        <PageHeader
          kicker={t.headerKicker}
          title={t.headerTitle}
          icon={CalendarCheck}
          description={t.headerDescription}
        />
      </motion.div>

      <div className="grid gap-8 md:grid-cols-2">
        <motion.div {...entranceVariants(0.1)}>
          <p className="oxot-kicker mb-3">{t.coversHeading}</p>
          <ul className="space-y-3">
            {t.covers.map((c) => (
              <li key={c} className="flex items-start gap-2 text-sm text-foreground">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {c}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-muted-foreground">
            {t.scopePre}{' '}
            <a href="/cra-check" className="font-medium text-primary-ink hover:underline">
              {t.scopeLink}
            </a>{' '}
            {t.scopePost}
          </p>
        </motion.div>

        <motion.div className="rounded-xl border border-border bg-card p-6 shadow-sm" {...entranceVariants(0.2)}>
          {state === 'success' ? (
            <div className="flex flex-col items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Check className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-display text-xl font-normal tracking-tight text-foreground">{t.successTitle}</h2>
              <p className="text-sm text-muted-foreground">
                {t.successBody}
              </p>
              <a
                href="/cra-check"
                className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-primary-ink hover:underline"
              >
                {t.successCta} <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-3" noValidate>
              {topError && (
                <div className="rounded-lg border border-orange-500/50 bg-orange-500/10 p-3 text-sm">{topError}</div>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <input
                    name="name"
                    className={field}
                    placeholder={t.phName}
                    aria-label={t.alName}
                    aria-invalid={errors.name ? true : undefined}
                    aria-describedby={errors.name ? "demo-name-error" : undefined}
                    autoComplete="name"
                  />
                  {errors.name && (
                    <p id="demo-name-error" role="alert" className="mt-1 text-xs text-orange-600 dark:text-orange-400">
                      {errors.name}
                    </p>
                  )}
                </div>
                <div>
                  <input
                    name="email"
                    type="email"
                    className={field}
                    placeholder={t.phEmail}
                    aria-label={t.alEmail}
                    aria-invalid={errors.email ? true : undefined}
                    aria-describedby={errors.email ? "demo-email-error" : undefined}
                    autoComplete="email"
                  />
                  {errors.email && (
                    <p id="demo-email-error" role="alert" className="mt-1 text-xs text-orange-600 dark:text-orange-400">
                      {errors.email}
                    </p>
                  )}
                </div>
                <input name="company" className={field} placeholder={t.phCompany} aria-label={t.alCompany} autoComplete="organization" />
                <input name="role" className={field} placeholder={t.phRole} aria-label={t.alRole} autoComplete="organization-title" />
              </div>
              <textarea name="blocker" rows={3} className={field} placeholder={t.phBlocker} aria-label={t.alBlocker} />
              <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <input name="website" tabIndex={-1} autoComplete="off" />
              </div>
              <Button type="submit" size="lg" disabled={state === 'submitting'} className="w-full cta-lift">
                {state === 'submitting' ? t.submitting : t.submit}
                {state !== 'submitting' && <ArrowRight className="h-4 w-4" />}
              </Button>
              <p className="text-center text-xs text-muted-foreground">{t.fineprint}</p>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
