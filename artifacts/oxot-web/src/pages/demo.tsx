import { useState } from 'react';
import { CalendarCheck, Check, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { useSeo } from '@/hooks/use-seo';
import { pageSeo } from '@/lib/page-seo';
import { Button } from '@/components/ui/button';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const field =
  'w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary';

const COVERS = [
  'Your classification, confirmed by an OT engineer — not a checklist',
  'The evidence you already hold, mapped to the Annex VII technical file',
  'Your route to the CE marking (Module A / B+C / H), chosen for your portfolio',
  'A realistic sequence against the 11 December 2027 deadline',
];

export default function DemoPage() {
  useSeo(
    pageSeo('/demo', {
      title: 'Book a demo — OXOT Conformance Platform',
      description:
        'A 45-minute walkthrough covers classification, the evidence you already hold, and what a defensible Annex VII technical file looks like for your products.',
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
    if (name.length < 2) fe.name = 'Please enter your name.';
    if (!EMAIL_RE.test(email)) fe.email = 'Please enter a valid work email.';
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
      setTopError(res.status === 429 ? 'Too many submissions — please try again in a minute.' : 'Something went wrong — please try again.');
      setState('error');
    } catch {
      setTopError('Something went wrong — please try again.');
      setState('error');
    }
  }

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 md:py-16 max-w-5xl">
      <PageHeader
        kicker="BOOK A DEMO"
        title="See your own portfolio in the workbench"
        icon={CalendarCheck}
        description="A 45-minute walkthrough covers classification, the evidence you already hold, and what a defensible Annex VII technical file looks like for your products. Free, no obligation — you keep the read whether or not we work together."
      />

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <p className="oxot-kicker mb-3">What the walkthrough covers</p>
          <ul className="space-y-3">
            {COVERS.map((c) => (
              <li key={c} className="flex items-start gap-2 text-sm text-foreground">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {c}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-muted-foreground">
            Prefer to scope yourself first? Take the{' '}
            <a href="/cra-check" className="font-medium text-primary-ink hover:underline">
              2-minute readiness check
            </a>{' '}
            and bring the result to the call.
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          {state === 'success' ? (
            <div className="flex flex-col items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <Check className="h-5 w-5 text-primary" />
              </div>
              <h2 className="font-display text-xl font-normal tracking-tight text-foreground">We've got it.</h2>
              <p className="text-sm text-muted-foreground">
                We'll reach out within two working days to book your 45-minute walkthrough. In the meantime, the
                2-minute check gives you an indicative classification and readiness score to bring along.
              </p>
              <a
                href="/cra-check"
                className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-primary-ink hover:underline"
              >
                Take the 2-minute check <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="space-y-3" noValidate>
              {topError && (
                <div className="rounded-lg border border-orange-500/50 bg-orange-500/10 p-3 text-sm">{topError}</div>
              )}
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <input name="name" className={field} placeholder="Your name" aria-label="Name" autoComplete="name" />
                  {errors.name && <p className="mt-1 text-xs text-orange-600 dark:text-orange-400">{errors.name}</p>}
                </div>
                <div>
                  <input name="email" type="email" className={field} placeholder="you@company.com" aria-label="Work email" autoComplete="email" />
                  {errors.email && <p className="mt-1 text-xs text-orange-600 dark:text-orange-400">{errors.email}</p>}
                </div>
                <input name="company" className={field} placeholder="Organisation" aria-label="Organisation" autoComplete="organization" />
                <input name="role" className={field} placeholder="e.g. Head of Product Security" aria-label="Role" autoComplete="organization-title" />
              </div>
              <textarea name="blocker" rows={3} className={field} placeholder="Your most pressing CRA question (optional)" aria-label="Your most pressing CRA question" />
              <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                <input name="website" tabIndex={-1} autoComplete="off" />
              </div>
              <Button type="submit" size="lg" disabled={state === 'submitting'} className="w-full cta-lift">
                {state === 'submitting' ? 'Submitting…' : 'Request my walkthrough'}
                {state !== 'submitting' && <ArrowRight className="h-4 w-4" />}
              </Button>
              <p className="text-center text-xs text-muted-foreground">Free · 45 minutes · no obligation</p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
