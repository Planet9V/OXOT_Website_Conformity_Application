import { createContext, useContext, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import {
  type Locale,
  isLocaleAgnosticPath,
  localeForPath,
  localeHref,
  preferredLocaleFromLanguages,
} from './locale-routing';

export type { Locale } from './locale-routing';

type LocaleContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

const STORAGE_KEY = 'oxot-locale';

/**
 * Locale is derived from the URL first (Dutch pages at "/nl/<slug>", English at
 * the default path) and localStorage second. This makes every page shareable and
 * bookmarkable: opening a "/nl" URL in a fresh browser renders it in Dutch
 * regardless of any stored preference, and search engines can crawl each
 * language variant at its own address.
 */
export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [location, navigate] = useLocation();
  const locale = localeForPath(location);
  const didInitialRedirect = useRef(false);

  // Bare-root redirect (runs once, first mount only): the only place an implicit
  // locale is applied. An explicit locale in the URL (a shared "/nl/..." or the
  // default path with any further segment) always wins, so bookmarked/shared
  // links are never touched — this branch is reached only for the bare "/".
  //
  // Precedence for "/":
  //   1. A stored preference (returning visitor who last chose Dutch) → "/nl".
  //   2. Otherwise, a first-time visitor whose browser prefers Dutch over
  //      English (Accept-Language) → "/nl", greeting them in their language.
  //   3. Otherwise stay on English (the default path).
  useEffect(() => {
    if (didInitialRedirect.current) return;
    didInitialRedirect.current = true;
    if (location !== '/') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'nl') {
        navigate('/nl', { replace: true });
        return;
      }
      // Only detect the browser language when there is no stored preference, so
      // a visitor who explicitly picked English is never overridden.
      if (stored === null && preferredLocaleFromLanguages(navigator.languages) === 'nl') {
        navigate('/nl', { replace: true });
      }
    } catch {
      /* localStorage/navigator unavailable — fall back to the URL-derived locale */
    }
    // Intentionally runs once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist the URL-derived locale so it can seed the next fresh visit.
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      /* ignore write failures (private mode, etc.) */
    }
  }, [locale]);

  const setLocale = (next: Locale) => {
    if (next === locale) return;
    // Admin lives outside the localized public subtree and is locale-agnostic.
    // Never rewrite its path into "/nl/admin/..." (which has no route).
    if (isLocaleAgnosticPath(location)) return;
    navigate(localeHref(location, next));
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};
