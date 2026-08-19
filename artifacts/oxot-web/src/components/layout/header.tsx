import { useTheme } from '@/providers/theme-provider';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Menu, ClipboardCheck, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { useLocale } from '@/providers/locale-provider';
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
  NavigationMenuLink,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu';

// ─── Funnel navigation (grouped, persona-first) ─────────────────────────────────
// Standalone CRA platform site: one purpose, booking demos. Hardcoded (no CMS /
// navigation table dependency). The top row is deliberately small — 2 direct
// links + 2 dropdowns — so the single "Book a demo" CTA stays dominant. Labels
// and one-line subtitles come from the per-locale copy object below (keyed, not
// positional, so groups can reorder safely).
const TOP_NAV = [
  { key: 'product', href: '/product' },
  { key: 'pricing', href: '/pricing' },
] as const;

// "Solutions" routes the real buyers + the integrator commercial hook.
const SOLUTIONS_NAV = [
  { key: 'manufacturers', href: '/manufacturers' },
  { key: 'operators', href: '/operators' },
  { key: 'integrators', href: '/partner-scope' },
  { key: 'craTransit', href: '/cra-transit' },
] as const;

// "Resources" surfaces the moat/authority assets (the verbatim-law Library first).
const RESOURCES_NAV = [
  { key: 'library', href: '/wiki' },
  { key: 'compare', href: '/compare' },
  { key: 'trust', href: '/trust' },
  { key: 'blog', href: '/blog' },
  { key: 'faq', href: '/faq' },
  { key: 'tour', href: '/tour' },
  { key: 'deployment', href: '/deployment' },
] as const;

// Localised header/nav copy (nl-NL professional register). Machine-assisted —
// flag Dutch strings for a native reviewer before go-live.
const copy = {
  en: {
    nav: {
      product: 'Product', solutions: 'Solutions', pricing: 'Pricing', resources: 'Resources',
      manufacturers: 'For manufacturers', operators: 'For operators',
      integrators: 'For integrators & partners', craTransit: 'CRA in transit',
      library: 'The Library — read the law', compare: 'Compare', trust: 'Trust center',
      blog: 'Blog', faq: 'FAQ', tour: 'Product tour', deployment: 'Deployment',
    },
    navDesc: {
      manufacturers: 'You place it on the market — own the technical file',
      operators: 'Hold your suppliers to the CRA across your estate',
      integrators: 'When integration quietly makes you the manufacturer',
      craTransit: 'One product, one 60-day assisted sprint',
      library: 'Verbatim EU law — CRA, NIS2, AI Act & more',
      compare: 'Honest and structural — where we fit and where we don’t',
      trust: 'How your evidence is secured and hosted',
      blog: 'CRA guidance written for every role',
      faq: 'Plain answers to the common CRA questions',
      tour: 'The platform in 90 seconds',
      deployment: 'Single-tenant, on-premise, local AI',
    },
    homeAria: 'OXOT Conformance Platform — home',
    lightMode: 'Switch to light mode',
    darkMode: 'Switch to dark mode',
    check: '2-min check',
    bookDemo: 'Book a demo',
    openMenu: 'Open menu',
    checkLong: '2-minute readiness check',
    theme: 'Theme',
    language: 'Language',
    switchToEn: 'Switch to English',
    switchToNl: 'Schakel naar Nederlands',
  },
  nl: {
    nav: {
      product: 'Product', solutions: 'Oplossingen', pricing: 'Prijzen', resources: 'Bronnen',
      manufacturers: 'Voor fabrikanten', operators: 'Voor exploitanten',
      integrators: 'Voor integrators & partners', craTransit: 'CRA in transit',
      library: 'De Bibliotheek — lees de wet', compare: 'Vergelijk', trust: 'Trust center',
      blog: 'Blog', faq: 'FAQ', tour: 'Producttour', deployment: 'Implementatie',
    },
    navDesc: {
      manufacturers: 'U brengt het op de markt — beheer het technisch dossier',
      operators: 'Houd leveranciers aan de CRA in uw hele park',
      integrators: 'Wanneer integratie u ongemerkt tot fabrikant maakt',
      craTransit: 'Eén product, één begeleide sprint van 60 dagen',
      library: 'Verbatim EU-wetgeving — CRA, NIS2, AI-verordening e.a.',
      compare: 'Eerlijk en structureel — waar we passen en waar niet',
      trust: 'Hoe uw bewijs wordt beveiligd en gehost',
      blog: 'CRA-richtlijnen voor elke rol',
      faq: 'Heldere antwoorden op veelgestelde CRA-vragen',
      tour: 'Het platform in 90 seconden',
      deployment: 'Single-tenant, on-premise, lokale AI',
    },
    homeAria: 'OXOT Conformance Platform — startpagina',
    lightMode: 'Schakel naar lichte modus',
    darkMode: 'Schakel naar donkere modus',
    check: '2-min. check',
    bookDemo: 'Demo aanvragen',
    openMenu: 'Menu openen',
    checkLong: 'Gereedheidscheck van 2 minuten',
    theme: 'Thema',
    language: 'Taal',
    switchToEn: 'Switch to English',
    switchToNl: 'Schakel naar Nederlands',
  },
} as const;

// ─── Language switcher (EN | NL segmented pill) ─────────────────────────────────
// setLocale rewrites the current path to the target-locale URL (localeHref),
// preserving the page you are on, so switching keeps you on the same content.
function LocaleToggle({ className = '' }: { className?: string }) {
  const { locale, setLocale } = useLocale();
  const t = copy[locale];
  return (
    <div
      role="group"
      aria-label={t.language}
      className={`inline-flex items-center rounded-md border border-border p-0.5 text-xs font-medium ${className}`}
    >
      <button
        type="button"
        onClick={() => setLocale('en')}
        aria-pressed={locale === 'en'}
        aria-label={t.switchToEn}
        className={`px-2 py-1 rounded-[5px] transition-colors ${locale === 'en' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLocale('nl')}
        aria-pressed={locale === 'nl'}
        aria-label={t.switchToNl}
        className={`px-2 py-1 rounded-[5px] transition-colors ${locale === 'nl' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}
      >
        NL
      </button>
    </div>
  );
}

// ─── Theme toggle widget ────────────────────────────────────────────────────────
function ThemeToggle({ theme, setTheme }: { theme: string; setTheme: (t: string) => void }) {
  const { locale } = useLocale();
  const t = copy[locale];
  const isDark = theme === 'dark';
  return (
    <Button
      variant="ghost"
      size="icon"
      className="w-9 h-9"
      aria-pressed={isDark}
      aria-label={isDark ? t.lightMode : t.darkMode}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" aria-hidden="true" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" aria-hidden="true" />
    </Button>
  );
}

// ─── Header ────────────────────────────────────────────────────────────────────
export function Header() {
  const { theme, setTheme } = useTheme();
  const { locale } = useLocale();
  const t = copy[locale];
  const [location] = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);

  const isActive = (href: string) =>
    location === href || (href !== '/' && location.startsWith(href.split('#')[0]));

  const closeMobileMenu = () => setSheetOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md transition-all duration-300">
      <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            aria-label={t.homeAria}
            className="select-none font-sans text-[15px] font-semibold tracking-[0.28em] text-foreground no-underline"
          >
            <>O<span className="text-primary">X</span>OT</>
          </Link>

          {/* Desktop nav — persona-first: 2 direct links + 2 dropdowns */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList className="gap-0.5">
              {/* Product (direct) */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                  <Link href="/product" aria-current={isActive('/product') ? 'page' : undefined}>
                    {t.nav.product}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* Solutions (dropdown) — routes the real buyers */}
              <NavigationMenuItem>
                <NavigationMenuTrigger>{t.nav.solutions}</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[360px] gap-0.5 p-2">
                    {SOLUTIONS_NAV.map((item) => (
                      <li key={item.href}>
                        <NavigationMenuLink asChild>
                          <Link
                            href={item.href}
                            className="block rounded-md px-3 py-2 no-underline transition-colors hover:bg-accent focus:bg-accent"
                          >
                            <span className="block text-sm font-medium text-foreground">{t.nav[item.key]}</span>
                            <span className="block text-xs text-muted-foreground">{t.navDesc[item.key]}</span>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Pricing (direct) */}
              <NavigationMenuItem>
                <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                  <Link href="/pricing" aria-current={isActive('/pricing') ? 'page' : undefined}>
                    {t.nav.pricing}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              {/* Resources (dropdown) — surfaces the moat/authority assets */}
              <NavigationMenuItem>
                <NavigationMenuTrigger>{t.nav.resources}</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[360px] gap-0.5 p-2">
                    {RESOURCES_NAV.map((item) => (
                      <li key={item.href}>
                        <NavigationMenuLink asChild>
                          <Link
                            href={item.href}
                            className="block rounded-md px-3 py-2 no-underline transition-colors hover:bg-accent focus:bg-accent"
                          >
                            <span className="block text-sm font-medium text-foreground">{t.nav[item.key]}</span>
                            <span className="block text-xs text-muted-foreground">{t.navDesc[item.key]}</span>
                          </Link>
                        </NavigationMenuLink>
                      </li>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <LocaleToggle className="hidden sm:inline-flex" />
          <ThemeToggle theme={theme} setTheme={setTheme} />

          {/* Secondary CTA — the lead-magnet check */}
          <Button asChild variant="outline" size="sm" className="hidden md:inline-flex ml-1">
            <Link href="/cra-check">
              <ClipboardCheck className="h-4 w-4" /> {t.check}
            </Link>
          </Button>

          {/* Primary CTA — the single ask, everywhere */}
          <Button asChild size="sm" className="hidden md:inline-flex cta-lift">
            <Link href="/demo">
              {t.bookDemo} <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>

          {/* Mobile menu trigger */}
          <Button
            variant="ghost"
            size="icon"
            className="w-9 h-9 md:hidden ml-1"
            onClick={() => setSheetOpen(true)}
            aria-label={t.openMenu}
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Mobile nav — Sheet drawer */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="flex flex-col w-[85vw] max-w-sm p-0">
          <SheetHeader className="px-5 pt-6 pb-4 border-b">
            <SheetTitle className="text-left select-none font-sans text-[15px] font-semibold tracking-[0.28em] text-foreground">
              <>O<span className="text-primary">X</span>OT</>
            </SheetTitle>
          </SheetHeader>

          <nav className="flex-1 overflow-y-auto py-2">
            {/* Top-level */}
            {TOP_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileMenu}
                aria-current={isActive(item.href) ? 'page' : undefined}
                className={`block px-5 py-3 text-sm font-medium transition-colors hover:bg-muted/50
                  ${isActive(item.href) ? 'text-primary-ink' : 'text-foreground'}`}
              >
                {t.nav[item.key]}
              </Link>
            ))}

            {/* Solutions group */}
            <div className="px-5 pt-4 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t.nav.solutions}
            </div>
            {SOLUTIONS_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileMenu}
                aria-current={isActive(item.href) ? 'page' : undefined}
                className={`block px-5 py-2.5 text-sm transition-colors hover:bg-muted/50
                  ${isActive(item.href) ? 'text-primary-ink font-medium' : 'text-foreground'}`}
              >
                {t.nav[item.key]}
              </Link>
            ))}

            {/* Resources group */}
            <div className="px-5 pt-4 pb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {t.nav.resources}
            </div>
            {RESOURCES_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileMenu}
                aria-current={isActive(item.href) ? 'page' : undefined}
                className={`block px-5 py-2.5 text-sm transition-colors hover:bg-muted/50
                  ${isActive(item.href) ? 'text-primary-ink font-medium' : 'text-foreground'}`}
              >
                {t.nav[item.key]}
              </Link>
            ))}

            {/* Secondary CTA — the lead-magnet check */}
            <Link
              href="/cra-check"
              onClick={closeMobileMenu}
              className="mt-3 block border-t px-5 py-3 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
            >
              {t.checkLong}
            </Link>
          </nav>

          <div className="border-t px-5 py-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{t.language}</span>
              <LocaleToggle />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{t.theme}</span>
              <ThemeToggle theme={theme} setTheme={setTheme} />
            </div>
            <Button asChild className="w-full mt-1 cta-lift">
              <Link href="/demo" onClick={closeMobileMenu}>
                {t.bookDemo} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
