import { useLocale } from '@/providers/locale-provider';
import { useGetSiteSettings, getGetSiteSettingsQueryKey } from '@workspace/api-client-react';
import { Link } from 'wouter';
import { NewsletterSignup } from '@/components/newsletter-signup';
import { SocialFeed } from '@/components/social-feed';
import { useCookieConsentSettings } from '@/components/cookie-consent';

// Newsletter signup is disabled site-wide for now (product decision, not a
// bug) — flip back to true to re-enable; the component/copy stay intact.
const SHOW_NEWSLETTER = false;

// Localised footer chrome (nl-NL professional register). Machine-assisted —
// flag Dutch strings for a native reviewer before go-live.
const copy = {
  en: {
    nav: ['Platform', 'For operators', 'CRA Transit', 'Read the law', 'Pricing', 'Deployment', 'Resources', '2-minute check', 'Book a demo'],
    homeAria: 'OXOT — home',
    tagline: 'Operational eXcellence in Operational Technology.',
    newsletter: 'Newsletter',
    navigation: 'Navigation',
    connect: 'Connect',
    followUs: 'Follow us on social media.',
    rights: 'All rights reserved.',
    privacy: 'Privacy',
    terms: 'Terms',
  },
  nl: {
    nav: ['Platform', 'Voor exploitanten', 'CRA Transit', 'Lees de wet', 'Prijzen', 'Implementatie', 'Bronnen', '2-minutencheck', 'Demo aanvragen'],
    homeAria: 'OXOT — startpagina',
    tagline: 'Operational eXcellence in Operational Technology.',
    newsletter: 'Nieuwsbrief',
    navigation: 'Navigatie',
    connect: 'Volg ons',
    followUs: 'Volg ons op social media.',
    rights: 'Alle rechten voorbehouden.',
    privacy: 'Privacy',
    terms: 'Voorwaarden',
  },
} as const;

export function Footer() {
  const { locale } = useLocale();
  const t = copy[locale];
  const { openSettings, cookieSettingsLabel } = useCookieConsentSettings();

  const { data: settings } = useGetSiteSettings(locale, {
    query: { queryKey: getGetSiteSettingsQueryKey(locale) }
  });

  // Static funnel footer nav — matches the header; no CMS dependency (durable).
  // Labels come from the locale copy above (indexed), hrefs stay code.
  const footerNav = [
    { id: 'platform', href: '/product', external: false },
    { id: 'operators', href: '/operators', external: false },
    { id: 'transit', href: '/cra-transit', external: false },
    { id: 'wiki', href: '/wiki', external: false },
    { id: 'pricing', href: '/pricing', external: false },
    { id: 'deployment', href: '/deployment', external: false },
    { id: 'resources', href: '/resources', external: false },
    { id: 'cra-check', href: '/cra-check', external: false },
    { id: 'demo', href: '/demo', external: false },
  ];

  const socialLinks = settings?.socialLinks ?? [];

  return (
    <div>
      {socialLinks.length > 0 && <SocialFeed socialLinks={socialLinks} />}
    <footer className="bg-card border-t py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          
          <div className="col-span-1 md:col-span-2 space-y-4">
            <Link
              href="/"
              aria-label={t.homeAria}
              className="inline-flex select-none font-sans text-lg font-semibold tracking-[0.3em] text-foreground no-underline"
            >
              {(settings?.siteName || 'OXOT').toUpperCase() === 'OXOT' ? (
                <span>O<span className="text-primary">X</span>OT</span>
              ) : (
                <span>{settings?.siteName}</span>
              )}
            </Link>
            <p className="text-muted-foreground text-sm max-w-sm">
              {settings?.description || t.tagline}
            </p>
            {settings?.contactEmail && (
              <a href={`mailto:${settings.contactEmail}`} className="text-sm font-medium hover:text-primary transition-colors block">
                {settings.contactEmail}
              </a>
            )}
            {SHOW_NEWSLETTER && (
              <div className="pt-2">
                <h4 className="font-display font-semibold mb-2 text-sm">{t.newsletter}</h4>
                <NewsletterSignup source="footer" />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <h4 className="font-display font-semibold">{t.navigation}</h4>
            <ul className="space-y-2">
              {footerNav.map((item, i) => (
                <li key={item.id}>
                  {item.external ? (
                    <a href={item.href} target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {t.nav[i]}
                    </a>
                  ) : (
                    <Link href={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {t.nav[i]}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-display font-semibold">{t.connect}</h4>
            {settings?.socialLinks && settings.socialLinks.length > 0 ? (
              <ul className="space-y-2">
                {settings.socialLinks.map((social) => (
                  <li key={`${social.platform}-${social.url}`}>
                    <a href={social.url} target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors capitalize">
                      {social.platform}
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">{t.followUs}</p>
            )}
          </div>
          
        </div>

        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            {settings?.footerText || `© ${new Date().getFullYear()} OXOT. ${t.rights}`}
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">{t.privacy}</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">{t.terms}</Link>
            <button
              type="button"
              onClick={openSettings}
              className="hover:text-foreground transition-colors"
            >
              {cookieSettingsLabel}
            </button>
          </div>
        </div>
      </div>
    </footer>
    </div>
  );
}
