import { useState } from 'react';
import { useSubscribeNewsletter } from '@workspace/api-client-react';
import { useLocale } from '@/providers/locale-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Check } from 'lucide-react';

// Localised newsletter-form copy (nl-NL professional register, "u"). Machine-
// assisted — flag Dutch strings for a native reviewer before go-live.
const copy = {
  en: {
    honeypotLabel: 'Leave this field empty',
    placeholder: 'you@company.com',
    emailAria: 'Email address',
    subscribe: 'Subscribe',
    helper: 'Compliance updates on the CRA, AI Act, Machinery Regulation & NIS2. Unsubscribe anytime.',
    confirmed: 'Almost there — check your inbox to confirm your subscription.',
  },
  nl: {
    honeypotLabel: 'Laat dit veld leeg',
    placeholder: 'u@bedrijf.nl',
    emailAria: 'E-mailadres',
    subscribe: 'Aanmelden',
    helper: 'Compliance-updates over de CRA, AI Act, Machineverordening en NIS2. Altijd op te zeggen.',
    confirmed: 'Bijna klaar — controleer uw inbox om uw aanmelding te bevestigen.',
  },
} as const;

/**
 * Public newsletter signup. Starts the GDPR double opt-in flow: on submit the
 * server sends a confirmation email and we show a "check your inbox" state.
 */
export function NewsletterSignup({ source }: { source?: string }) {
  const { locale } = useLocale();
  const t = copy[locale];
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState(''); // honeypot — real users never fill this
  const [done, setDone] = useState(false);
  const subscribe = useSubscribeNewsletter();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await subscribe.mutateAsync({ data: { email: email.trim(), locale, source: source ?? 'footer', website } as any });
      setDone(true);
    } catch {
      // The endpoint returns a generic success; a thrown error means a bad email
      // or a transient failure. Keep it quiet but let the user retry.
      setDone(false);
    }
  };

  if (done) {
    return (
      <div role="status" aria-live="polite" className="flex items-start gap-2 text-sm text-muted-foreground">
        <Check className="w-4 h-4 mt-0.5 text-primary shrink-0" aria-hidden="true" />
        <span>{t.confirmed}</span>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      {/* Honeypot: hidden from real users; bots that autofill it are rejected. */}
      <div aria-hidden="true" className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
        <label htmlFor="newsletter-website">{t.honeypotLabel}</label>
        <input
          id="newsletter-website"
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
        />
      </div>
      <div className="flex gap-2">
        <Input
          type="email"
          required
          placeholder={t.placeholder}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-label={t.emailAria}
          className="max-w-xs"
        />
        <Button type="submit" disabled={subscribe.isPending}>
          <Mail className="w-4 h-4 mr-2" />
          {t.subscribe}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        {t.helper}
      </p>
    </form>
  );
}
