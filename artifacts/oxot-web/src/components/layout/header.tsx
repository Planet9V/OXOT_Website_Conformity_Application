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

// ─── Static funnel navigation ───────────────────────────────────────────────────
// This is the standalone CRA platform site: one purpose, booking demos. The nav
// is hardcoded (no CMS / navigation table dependency) — a flat set of funnel
// pages, each pointing back to the single "Book a demo" ask.
const FUNNEL_NAV: { label: string; href: string }[] = [
  { label: 'Platform', href: '/product' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Deployment', href: '/deployment' },
  { label: 'Resources', href: '/resources' },
];

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
  const { theme, setTheme } = useTheme();
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
            aria-label="OXOT Conformance Platform — home"
            className="select-none font-sans text-[15px] font-semibold tracking-[0.28em] text-foreground no-underline"
          >
            <>O<span className="text-primary">X</span>OT</>
          </Link>

          {/* Desktop nav — flat funnel links */}
          <nav className="hidden md:flex items-center gap-0.5">
            {FUNNEL_NAV.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`relative inline-flex items-center justify-center text-sm font-medium px-3 h-9 rounded-md transition-colors
                    ${active
                      ? 'text-primary-ink after:absolute after:bottom-0 after:left-2 after:right-2 after:h-0.5 after:rounded-full after:bg-primary'
                      : 'text-muted-foreground hover:text-foreground'
                    }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          <ThemeToggle theme={theme} setTheme={setTheme} />

          {/* Secondary CTA — the lead-magnet check */}
          <Button asChild variant="outline" size="sm" className="hidden md:inline-flex ml-1">
            <Link href="/cra-check">
              <ClipboardCheck className="h-4 w-4" /> 2-min check
            </Link>
          </Button>

          {/* Primary CTA — the single ask, everywhere */}
          <Button asChild size="sm" className="hidden md:inline-flex cta-lift">
            <Link href="/demo">
              Book a demo <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>

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
          <SheetHeader className="px-5 pt-6 pb-4 border-b">
            <SheetTitle className="text-left select-none font-sans text-[15px] font-semibold tracking-[0.28em] text-foreground">
              <>O<span className="text-primary">X</span>OT</>
            </SheetTitle>
          </SheetHeader>

          <nav className="flex-1 overflow-y-auto py-2">
            {FUNNEL_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={closeMobileMenu}
                aria-current={isActive(item.href) ? 'page' : undefined}
                className={`block px-5 py-3 text-sm font-medium transition-colors hover:bg-muted/50
                  ${isActive(item.href) ? 'text-primary-ink' : 'text-foreground'}`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/cra-check"
              onClick={closeMobileMenu}
              className="block px-5 py-3 text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
            >
              2-minute readiness check
            </Link>
          </nav>

          <div className="border-t px-5 py-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Theme</span>
              <ThemeToggle theme={theme} setTheme={setTheme} />
            </div>
            <Button asChild className="w-full mt-1 cta-lift">
              <Link href="/demo" onClick={closeMobileMenu}>
                Book a demo <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
