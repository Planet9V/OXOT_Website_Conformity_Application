import { useTheme } from '@/providers/theme-provider';
import { useLocale } from '@/providers/locale-provider';
import { contentSlugForPath } from '@/providers/locale-routing';
import {
  useGetNavigation,
  useGetSiteSettings,
  useGetPage,
  useGetAdminSession,
  getGetNavigationQueryKey,
  getGetSiteSettingsQueryKey,
  getGetPageQueryKey,
  getGetAdminSessionQueryKey,
} from '@workspace/api-client-react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Menu, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

// ─── Dropdown panel definitions ────────────────────────────────────────────────
// Imported from a plain .ts module so the data can be unit-tested without
// pulling in React or any component dependencies.
import { PANELS } from './header-panels';
import type { DropItem } from './header-panels';

// ─── Panel item component ───────────────────────────────────────────────────────
function PanelItem({ item, onNavigate }: { item: DropItem; onNavigate?: () => void }) {
  if (item.isSectionLabel) {
    return (
      <div className="col-span-2 flex items-center gap-3 px-3 pt-3 pb-1">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40 whitespace-nowrap">
          {item.label}
        </span>
        <div className="flex-1 h-px bg-white/10" />
      </div>
    );
  }

  const inner = (
    <div className="group/item flex flex-col gap-0.5 rounded-lg p-3 hover:bg-white/10 transition-colors cursor-pointer">
      <span className="text-sm font-semibold text-white leading-snug group-hover/item:text-primary transition-colors">
        {item.label}
      </span>
      <span className="text-xs text-white/60 leading-relaxed">{item.description}</span>
    </div>
  );

  if (item.external) {
    return (
      <a href={item.href} target="_blank" rel="noreferrer" onClick={onNavigate}>
        {inner}
      </a>
    );
  }
  return (
    <NavigationMenuLink asChild>
      <Link href={item.href} onClick={onNavigate}>
        {inner}
      </Link>
    </NavigationMenuLink>
  );
}

// ─── Flag SVGs ──────────────────────────────────────────────────────────────────
function FlagEN({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 60 30" className={className}>
      <clipPath id="flag-t"><path d="M30,15 h30 v15 z v-15 h-30 z h-30 v-15 z v15 h30 z"/></clipPath>
      <path d="M0,0 v30 h60 v-30 z" fill="#00247d"/>
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
      <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#flag-t)" stroke="#cf142b" strokeWidth="4"/>
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
      <path d="M30,0 v30 M0,15 h60" stroke="#cf142b" strokeWidth="6"/>
    </svg>
  );
}

function FlagNL({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 9 6" className={className}>
      <path fill="#21468B" d="M0 0h9v6H0z"/>
      <path fill="#FFF" d="M0 0h9v4H0z"/>
      <path fill="#AE1C28" d="M0 0h9v2H0z"/>
    </svg>
  );
}

// ─── Language switcher widget ───────────────────────────────────────────────────
// `unavailableLocale` is the language the CURRENT page has no translation for.
// Its flag is disabled so a reader on an English-only page can't toggle to Dutch
// and land on a Not Found page (and vice-versa).
function LanguageSwitcher({
  locale,
  setLocale,
  unavailableLocale,
}: {
  locale: string;
  setLocale: (l: string) => void;
  unavailableLocale?: string | null;
}) {
  const enUnavailable = unavailableLocale === 'en';
  const nlUnavailable = unavailableLocale === 'nl';
  return (
    <div role="group" aria-label="Language" className="flex items-center gap-1 rounded-md border border-border/60 p-0.5">
      <button
        onClick={() => setLocale('en')}
        disabled={enUnavailable}
        title={enUnavailable ? 'Not available in English' : 'English'}
        aria-pressed={locale === 'en'}
        aria-disabled={enUnavailable || undefined}
        className={`rounded p-1 transition-all ${
          locale === 'en'
            ? 'bg-muted shadow-sm'
            : enUnavailable
              ? 'opacity-30 cursor-not-allowed'
              : 'opacity-50 hover:opacity-80'
        }`}
      >
        <FlagEN className="w-6 h-auto rounded-[2px] overflow-hidden block" aria-hidden="true" />
        <span className="sr-only">English</span>
      </button>
      <button
        onClick={() => setLocale('nl')}
        disabled={nlUnavailable}
        title={nlUnavailable ? 'Niet beschikbaar in het Nederlands' : 'Nederlands'}
        aria-pressed={locale === 'nl'}
        aria-disabled={nlUnavailable || undefined}
        className={`rounded p-1 transition-all ${
          locale === 'nl'
            ? 'bg-muted shadow-sm'
            : nlUnavailable
              ? 'opacity-30 cursor-not-allowed'
              : 'opacity-50 hover:opacity-80'
        }`}
      >
        <FlagNL className="w-6 h-auto rounded-[2px] overflow-hidden block" aria-hidden="true" />
        <span className="sr-only">Nederlands</span>
      </button>
    </div>
  );
}

// ─── Theme toggle widget ────────────────────────────────────────────────────────
function ThemeToggle({ theme, setTheme }: { theme: string; setTheme: (t: string) => void }) {
  const isDark = theme === 'dark';
  return (
    <Button
      variant="ghost"
      size="icon"
      className="w-9 h-9"
      aria-pressed={isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" aria-hidden="true" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" aria-hidden="true" />
    </Button>
  );
}

// ─── Header ────────────────────────────────────────────────────────────────────
export function Header() {
  const { locale, setLocale } = useLocale();
  const { theme, setTheme } = useTheme();
  const [location] = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);

  const { data: navItems = [] } = useGetNavigation(locale, {
    query: { queryKey: getGetNavigationQueryKey(locale) },
  });
  const { data: settings } = useGetSiteSettings(locale, {
    query: { queryKey: getGetSiteSettingsQueryKey(locale) },
  });
  // Session-aware CTAs: members/admins get the Knowledge Hub + workbench
  // shortcuts; anonymous visitors get a sign-in door.
  const { data: session } = useGetAdminSession({
    query: { queryKey: getGetAdminSessionQueryKey(), retry: false },
  });
  const isMember = session?.authenticated === true;

  // Prevent the language toggle from stranding readers on a Not Found page.
  // CMS content pages ("/:slug") may exist in one locale only; probe the OTHER
  // locale for the current slug and disable its flag when there's no translation.
  const contentSlug = contentSlugForPath(location);
  const otherLocale = locale === 'en' ? 'nl' : 'en';
  const { error: translationError, isLoading: translationLoading } = useGetPage(
    otherLocale,
    contentSlug ?? '',
    {
      query: {
        enabled: !!contentSlug,
        retry: false,
        queryKey: getGetPageQueryKey(otherLocale, contentSlug ?? ''),
      },
    },
  );
  const unavailableLocale =
    contentSlug && !translationLoading && (translationError as { status?: number } | null)?.status === 404
      ? otherLocale
      : null;

  const headerNav = navItems
    .filter((i) => i.placement === 'header')
    .sort((a, b) => a.order - b.order);

  // Derive the contact destination from the CMS nav rather than hardcoding it.
  // Match any nav item whose href or label contains "contact" (case-insensitive).
  const contactNavItem = headerNav.find(
    (i) =>
      i.href.toLowerCase().includes('contact') ||
      i.label.toLowerCase().includes('contact'),
  );

  const isActive = (href: string) =>
    location === href || (href !== '/' && location.startsWith(href.split('#')[0]));

  const closeMobileMenu = () => {
    setSheetOpen(false);
    setMobileExpanded(null);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md transition-all duration-300">
      <div className="container mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
              <span className="text-white font-display font-bold text-lg leading-none">O</span>
            </div>
            {/* Wordmark visible at all sizes */}
            <span className="font-display font-bold text-xl tracking-tight">
              {settings?.siteName || 'OXOT'}
            </span>
          </Link>

          {/* Desktop nav — Radix NavigationMenu */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList className="gap-0">
              {headerNav.map((item) => {
                const panel = PANELS[item.href];
                const active = isActive(item.href);

                if (panel) {
                  return (
                    <NavigationMenuItem key={item.id}>
                      <NavigationMenuTrigger
                        className={`text-sm font-medium px-3 h-9 bg-transparent hover:bg-transparent focus:bg-transparent data-[state=open]:bg-transparent relative
                          ${active
                            ? 'text-primary after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:rounded-full after:bg-primary'
                            : 'text-muted-foreground hover:text-foreground'
                          }`}
                      >
                        {item.label}
                      </NavigationMenuTrigger>
                      <NavigationMenuContent>
                        {/* Dark panel — matches reference site aesthetic */}
                        <div
                          className={`p-3 rounded-xl shadow-xl border border-white/10
                            bg-[hsl(220,20%,10%)]
                            ${panel.cols === 2 ? 'w-[560px] grid grid-cols-2 gap-1' : 'w-[280px] flex flex-col gap-1'}`}
                        >
                          {panel.items.map((dropItem, idx) => (
                            <PanelItem key={idx} item={dropItem} />
                          ))}
                        </div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  );
                }

                // Plain link
                return (
                  <NavigationMenuItem key={item.id}>
                    {item.external ? (
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center text-sm font-medium px-3 h-9 rounded-md transition-colors text-muted-foreground hover:text-foreground"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <NavigationMenuLink asChild>
                        <Link
                          href={item.href}
                          aria-current={active ? 'page' : undefined}
                          className={`relative inline-flex items-center justify-center text-sm font-medium px-3 h-9 rounded-md transition-colors
                            ${active
                              ? 'text-primary after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:rounded-full after:bg-primary'
                              : 'text-muted-foreground hover:text-foreground'
                            }`}
                        >
                          {item.label}
                        </Link>
                      </NavigationMenuLink>
                    )}
                  </NavigationMenuItem>
                );
              })}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Language + theme group — always visible */}
          <div className="flex items-center gap-1">
            <LanguageSwitcher locale={locale} setLocale={setLocale} unavailableLocale={unavailableLocale} />
            <ThemeToggle theme={theme} setTheme={setTheme} />
          </div>

          {/* Session-aware CTAs — hidden on mobile */}
          {isMember ? (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex ml-1">
                <Link href="/knowledge">Knowledge Hub</Link>
              </Button>
              <Button asChild size="sm" className="hidden md:inline-flex">
                <a href="/conformity/">Open Workbench</a>
              </Button>
            </>
          ) : (
            <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex ml-1">
              <Link href="/admin/login">Sign in</Link>
            </Button>
          )}

          {/* Desktop CTA — hidden on mobile; only shown when a contact nav item exists */}
          {!isMember && contactNavItem && (
            <Button
              asChild
              size="sm"
              className="hidden md:inline-flex ml-1"
            >
              {contactNavItem.external ? (
                <a href={contactNavItem.href} target="_blank" rel="noreferrer">
                  {contactNavItem.label}
                </a>
              ) : (
                <Link href={contactNavItem.href}>{contactNavItem.label}</Link>
              )}
            </Button>
          )}

          {/* Mobile menu trigger */}
          <Button
            variant="ghost"
            size="icon"
            className="w-9 h-9 md:hidden ml-1"
            onClick={() => setSheetOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Mobile nav — Sheet drawer */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="right" className="flex flex-col w-[85vw] max-w-sm p-0">
          {/* Sheet header */}
          <SheetHeader className="px-5 pt-6 pb-4 border-b">
            <SheetTitle className="flex items-center gap-2 text-left">
              <div className="w-7 h-7 bg-primary rounded-sm flex items-center justify-center">
                <span className="text-white font-display font-bold text-base leading-none">O</span>
              </div>
              <span className="font-display font-bold text-lg tracking-tight">
                {settings?.siteName || 'OXOT'}
              </span>
            </SheetTitle>
          </SheetHeader>

          {/* Nav items */}
          <nav className="flex-1 overflow-y-auto py-2">
            {headerNav.map((item) => {
              const panel = PANELS[item.href];

              if (panel) {
                const expanded = mobileExpanded === item.href;
                const panelId = `mobile-nav-panel-${item.href.replace(/[^a-z0-9]/gi, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}`;
                return (
                  <div key={item.id}>
                    <button
                      onClick={() => setMobileExpanded(expanded ? null : item.href)}
                      aria-expanded={expanded}
                      aria-controls={panelId}
                      className="w-full flex items-center justify-between px-5 py-3 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
                    >
                      {item.label}
                      <ChevronDown
                        className={`w-4 h-4 text-muted-foreground transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
                      />
                    </button>
                    {/* Animated collapsible — grid-row trick: 0fr → 1fr, no layout jump */}
                    {/* inert removes children from tab order and AT when collapsed */}
                    <div
                      id={panelId}
                      aria-hidden={!expanded}
                      inert={!expanded || undefined}
                      className="grid overflow-hidden transition-[grid-template-rows] duration-300 ease-in-out"
                      style={{ gridTemplateRows: expanded ? '1fr' : '0fr' }}
                    >
                      <div className="min-h-0">
                        <div className="bg-muted/30 px-3 pb-2 flex flex-col gap-0.5">
                          {panel.items.map((dropItem, idx) =>
                            dropItem.isSectionLabel ? (
                              <div key={idx} className="flex items-center gap-2 px-3 pt-3 pb-1">
                                <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 whitespace-nowrap">
                                  {dropItem.label}
                                </span>
                                <div className="flex-1 h-px bg-border" />
                              </div>
                            ) : dropItem.external ? (
                              <a
                                key={idx}
                                href={dropItem.href}
                                target="_blank"
                                rel="noreferrer"
                                onClick={closeMobileMenu}
                                className="px-3 py-2.5 rounded-md hover:bg-muted transition-colors"
                              >
                                <div className="text-sm font-medium">{dropItem.label}</div>
                                <div className="text-xs text-muted-foreground mt-0.5">{dropItem.description}</div>
                              </a>
                            ) : (
                              <Link
                                key={idx}
                                href={dropItem.href}
                                onClick={closeMobileMenu}
                                className="px-3 py-2.5 rounded-md hover:bg-muted transition-colors"
                              >
                                <div className="text-sm font-medium">{dropItem.label}</div>
                                <div className="text-xs text-muted-foreground mt-0.5">{dropItem.description}</div>
                              </Link>
                            )
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }

              return item.external ? (
                <a
                  key={item.id}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  onClick={closeMobileMenu}
                  className="block px-5 py-3 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={closeMobileMenu}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  className={`block px-5 py-3 text-sm font-medium transition-colors hover:bg-muted/50
                    ${isActive(item.href) ? 'text-primary' : 'text-foreground'}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Sheet footer — language + theme + CTA */}
          <div className="border-t px-5 py-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Language</span>
              <LanguageSwitcher locale={locale} setLocale={setLocale} unavailableLocale={unavailableLocale} />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Theme</span>
              <ThemeToggle theme={theme} setTheme={setTheme} />
            </div>
            {contactNavItem && (
              <Button asChild className="w-full mt-1">
                {contactNavItem.external ? (
                  <a
                    href={contactNavItem.href}
                    target="_blank"
                    rel="noreferrer"
                    onClick={closeMobileMenu}
                  >
                    {contactNavItem.label}
                  </a>
                ) : (
                  <Link href={contactNavItem.href} onClick={closeMobileMenu}>
                    {contactNavItem.label}
                  </Link>
                )}
              </Button>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
