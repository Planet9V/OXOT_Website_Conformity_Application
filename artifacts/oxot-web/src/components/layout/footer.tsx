import { useLocale } from '@/providers/locale-provider';
import { useGetNavigation, useGetSiteSettings, getGetNavigationQueryKey, getGetSiteSettingsQueryKey } from '@workspace/api-client-react';
import { Link } from 'wouter';
import { NewsletterSignup } from '@/components/newsletter-signup';
import { SocialFeed } from '@/components/social-feed';
import { useCookieConsentSettings } from '@/components/cookie-consent';

export function Footer() {
  const { locale } = useLocale();
  const { openSettings, cookieSettingsLabel } = useCookieConsentSettings();
  
  const { data: navItems = [] } = useGetNavigation(locale, { 
    query: { queryKey: getGetNavigationQueryKey(locale) } 
  });
  const { data: settings } = useGetSiteSettings(locale, {
    query: { queryKey: getGetSiteSettingsQueryKey(locale) }
  });

  const footerNav = navItems.filter((i) => i.placement === 'footer').sort((a, b) => a.order - b.order);

  const socialLinks = settings?.socialLinks ?? [];

  return (
    <div>
      {socialLinks.length > 0 && <SocialFeed socialLinks={socialLinks} />}
    <footer className="bg-card border-t py-12 md:py-16">
      <div className="container mx-auto px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          
          <div className="col-span-1 md:col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2 group inline-flex">
              <div className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center">
                <span className="text-white font-display font-bold text-sm leading-none">O</span>
              </div>
              <span className="font-display font-bold text-lg tracking-tight">
                {settings?.siteName || 'OXOT'}
              </span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-sm">
              {settings?.description || 'Operational eXcellence in Operational Technology.'}
            </p>
            {settings?.contactEmail && (
              <a href={`mailto:${settings.contactEmail}`} className="text-sm font-medium hover:text-primary transition-colors block">
                {settings.contactEmail}
              </a>
            )}
            <div className="pt-2">
              <h4 className="font-display font-semibold mb-2 text-sm">Newsletter</h4>
              <NewsletterSignup source="footer" />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-display font-semibold">Navigation</h4>
            <ul className="space-y-2">
              {footerNav.map((item) => (
                <li key={item.id}>
                  {item.external ? (
                    <a href={item.href} target="_blank" rel="noreferrer" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {item.label}
                    </a>
                  ) : (
                    <Link href={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {item.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="font-display font-semibold">Connect</h4>
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
              <p className="text-sm text-muted-foreground">Follow us on social media.</p>
            )}
          </div>
          
        </div>

        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            {settings?.footerText || `© ${new Date().getFullYear()} OXOT. All rights reserved.`}
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors">Terms</Link>
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
