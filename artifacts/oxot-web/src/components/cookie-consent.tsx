import { createContext, useContext, useEffect, useRef, useState } from 'react';
import { useLocale } from '@/providers/locale-provider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const STORAGE_KEY = 'oxot-cookie-consent';

type ConsentValue = 'accepted' | 'declined';

const labels: Record<'en' | 'nl', {
  heading: string;
  body: string;
  accept: string;
  decline: string;
  dialogLabel: string;
  cookieSettings: string;
}> = {
  en: {
    heading: 'Cookie notice',
    body: 'We use cookies and similar technologies to remember your preferences and measure how visitors use our site. You can accept or decline non-essential cookies.',
    accept: 'Accept all',
    decline: 'Decline',
    dialogLabel: 'Cookie consent',
    cookieSettings: 'Cookie settings',
  },
  nl: {
    heading: 'Cookiemelding',
    body: 'We gebruiken cookies en vergelijkbare technologieën om uw voorkeuren te onthouden en het bezoekersgedrag te meten. U kunt niet-essentiële cookies accepteren of weigeren.',
    accept: 'Alles accepteren',
    decline: 'Weigeren',
    dialogLabel: 'Cookietoestemming',
    cookieSettings: 'Cookie-instellingen',
  },
};

// ── Context ────────────────────────────────────────────────────────────────

interface CookieConsentContextValue {
  /** Re-opens the consent dialog so the visitor can change their choice. */
  openSettings: () => void;
  /** The label string for the "Cookie settings" link, localised. */
  cookieSettingsLabel: string;
}

const CookieConsentContext = createContext<CookieConsentContextValue>({
  openSettings: () => {},
  cookieSettingsLabel: labels.en.cookieSettings,
});

export function useCookieConsentSettings() {
  return useContext(CookieConsentContext);
}

// ── Provider + dialog ──────────────────────────────────────────────────────

export function CookieConsentProvider({ children }: { children: React.ReactNode }) {
  const { locale } = useLocale();
  const [visible, setVisible] = useState(false);
  const acceptRef = useRef<HTMLButtonElement>(null);
  const declineRef = useRef<HTMLButtonElement>(null);
  const bannerRef = useRef<HTMLDivElement>(null);

  const t = labels[locale as 'en' | 'nl'] ?? labels.en;

  // Show on first visit (no stored choice yet)
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) setVisible(true);
  }, []);

  // Move focus into the banner when it becomes visible
  useEffect(() => {
    if (!visible) return undefined;
    const id = setTimeout(() => acceptRef.current?.focus(), 50);
    return () => clearTimeout(id);
  }, [visible]);

  // Trap focus inside the banner while it is open
  useEffect(() => {
    if (!visible) return undefined;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        respond('declined');
        return;
      }
      if (e.key !== 'Tab') return;

      const focusable = [acceptRef.current, declineRef.current].filter(Boolean) as HTMLElement[];
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const active = document.activeElement;

      if (e.shiftKey) {
        if (active === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [visible]);

  function respond(value: ConsentValue) {
    localStorage.setItem(STORAGE_KEY, value);
    setVisible(false);
  }

  const contextValue: CookieConsentContextValue = {
    openSettings: () => setVisible(true),
    cookieSettingsLabel: t.cookieSettings,
  };

  return (
    <CookieConsentContext.Provider value={contextValue}>
      {children}
      {visible && (
        <div
          ref={bannerRef}
          role="dialog"
          aria-modal="true"
          aria-label={t.dialogLabel}
          className={cn(
            'fixed bottom-0 inset-x-0 z-50',
            'flex flex-col sm:flex-row items-start sm:items-center gap-4',
            'bg-background border-t border-border shadow-lg',
            'px-4 py-4 sm:px-6 sm:py-4',
          )}
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground mb-1">{t.heading}</p>
            <p className="text-sm text-muted-foreground leading-relaxed">{t.body}</p>
          </div>

          <div className="flex gap-3 shrink-0">
            <Button
              ref={declineRef}
              variant="outline"
              size="sm"
              onClick={() => respond('declined')}
            >
              {t.decline}
            </Button>
            <Button
              ref={acceptRef}
              variant="default"
              size="sm"
              onClick={() => respond('accepted')}
            >
              {t.accept}
            </Button>
          </div>
        </div>
      )}
    </CookieConsentContext.Provider>
  );
}

/**
 * @deprecated Use `CookieConsentProvider` instead (wraps children + renders the dialog).
 * Kept for backwards-compatibility during migration.
 */
export function CookieConsent() {
  return null;
}
