import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Book,
  Layers,
  ListTree,
  Grid3x3,
  Database,
  ClipboardCheck,
  GitBranch,
  FileText,
  LogOut,
  Menu,
  Sun,
  Moon,
  ChevronDown,
  User,
  UserCircle,
  Users,
  ShieldAlert,
  HelpCircle,
  BookOpen,
  Compass,
  Boxes,
  Search,
  Headphones,
  type LucideIcon,
} from "lucide-react";
import { useGetAdminSession, useAdminLogout } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Kbd } from "@/components/ui/kbd";
import { useTheme } from "@/providers/theme-provider";
import { cn } from "@/lib/utils";
import { GlossaryDialog } from "@/components/conformity/glossary-dialog";
import { requestTour, type TourId } from "@/lib/tour";
import { shouldAutoStartOnboarding } from "@/lib/onboarding";
import { CommandPalette, useCommandPalette } from "@/components/command-palette";
import { FloatingAiAssistant } from "./floating-ai-assistant";

type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  description?: string;
  /** True for links that leave the workbench SPA (e.g. the public site's Knowledge Hub). */
  external?: boolean;
};

// The one place operators do the work: products lead into their assessments.
const PRIMARY: NavItem = {
  href: "/products",
  label: "Products",
  icon: ClipboardCheck,
  description: "Run and manage conformity assessments",
};

// Admin-authored process flows started from an assessment workbench.
const FLOWS: NavItem = {
  href: "/flows",
  label: "Flows",
  icon: GitBranch,
  description: "Author guided assessment process flows",
};

// Executive reporting suite — portfolio rollups plus per-assessment documents.
const REPORTS: NavItem = {
  href: "/reports",
  label: "Reports",
  icon: FileText,
  description: "Executive briefings, full reports and readouts",
};

// PSIRT / coordinated vulnerability disclosure (Annex I Part II CRA).
const PSIRT: NavItem = {
  href: "/psirt",
  label: "PSIRT",
  icon: ShieldAlert,
  description: "Vulnerability intake, remediation lifecycle and advisories",
};

// Product Portfolio & Customer Operations Platform
const PRODUCT_PORTFOLIO: NavItem = {
  href: "/product-portfolio",
  label: "Portfolio",
  icon: Boxes,
  description: "CRA products, versions, CISA customer fleets & mass import",
};

// Named assessor accounts — admin-only
const TEAM: NavItem = {
  href: "/team",
  label: "Team",
  icon: Users,
  description: "Named assessor accounts and assignments",
};

// Everything used to understand the rules — the reference library.
const REFERENCE: NavItem[] = [
  { href: "/", label: "Overview", icon: LayoutDashboard, description: "Portfolio dashboard" },
  { href: "/regulations", label: "Regulations", icon: Book, description: "CRA, AI Act, Machinery, IEC 62443, NIS2" },
  { href: "/themes", label: "Themes", icon: Layers, description: "Cross-cutting requirement themes" },
  { href: "/requirements", label: "Requirements", icon: ListTree, description: "Unified requirement catalogue" },
  { href: "/mappings", label: "Matrix", icon: Grid3x3, description: "Cross-regulation mappings" },
  { href: "/sources", label: "Sources", icon: Database, description: "Underlying legal source texts" },
  { href: "/wiki", label: "Statutory Wiki", icon: BookOpen, description: "Regulation (EU) 2024/2847 corpus" },
];

// Industrial System Integrator & Plant Operations Hub
const PARTNER_HUB: NavItem = {
  href: "/partner-hub",
  label: "Plant & SI Hub",
  icon: Boxes,
  description: "Axians 5-stage pipeline, Recital 34 safe harbor & 24h CSIRT dispatcher",
};

// Specialized statutory execution engines
const CRA_OPERATIONS: NavItem[] = [
  { href: "/partner-hub", label: "Plant & SI Pipeline", icon: Boxes, description: "Axians 5-stage OT portfolio workflow" },
  { href: "/standards", label: "Standards Matrix (Art. 27)", icon: Layers, description: "IEC 62443 / ETSI EN 303 645 presumption of conformity" },
  { href: "/ce-studio", label: "CE Nameplate Studio (Arts. 22/23)", icon: Grid3x3, description: "Vector CE rating plate & digital product passport generator" },
  { href: "/steward", label: "Open-Source Steward (Art. 33)", icon: ListTree, description: "FOSS voluntary security attestations & OpenVEX statements" },
  { href: "/archive", label: "10-Year Archive Ledger (Art. 17)", icon: Database, description: "Statutory importer technical documentation vault (2037+)" },
  { href: "/wiki", label: "Full CRA Statutory Wiki", icon: Book, description: "Verbatim OJ text — 71 articles, 130 recitals & 8 annexes" },
  { href: "/podcast-studio", label: "Podcast Studio & Media Hub", icon: Headphones, description: "Manage, listen, and syndicate 67 episodes across 3 styles + RSS" },
  { href: "/auditor-portal", label: "Notified Body Auditor Portal", icon: ClipboardCheck, description: "Third-party Module H / B+C examination workbench" },
];

function useNavState() {
  const [location] = useLocation();
  const productsActive =
    location.startsWith("/products") || location.startsWith("/assessments");
  const flowsActive = location.startsWith("/flows");
  const reportsActive = location.startsWith("/reports");
  const teamActive = location.startsWith("/team");
  const psirtActive = location.startsWith("/psirt");
  const portfolioActive = location.startsWith("/product-portfolio");
  const partnerActive = location.startsWith("/partner-hub");
  const isRef = (href: string) =>
    href === "/" ? location === "/" : location.startsWith(href);
  const isCraOp = (href: string) => location.startsWith(href);
  const craOperationsActive =
    CRA_OPERATIONS.some((c) => isCraOp(c.href));
  const referenceActive =
    !productsActive &&
    !flowsActive &&
    !reportsActive &&
    !teamActive &&
    !psirtActive &&
    !portfolioActive &&
    !craOperationsActive &&
    REFERENCE.some((r) => isRef(r.href));
  return {
    location,
    productsActive,
    flowsActive,
    reportsActive,
    teamActive,
    psirtActive,
    portfolioActive,
    partnerActive,
    craOperationsActive,
    referenceActive,
    isRef,
    isCraOp,
  };
}

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";
  return (
    <Button
      variant="ghost"
      size="icon"
      className="w-9 h-9"
      aria-pressed={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" aria-hidden="true" />
      <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" aria-hidden="true" />
    </Button>
  );
}

import { OxotWordmark } from "@/components/ui/oxot-wordmark";
import { SiteFooter } from "@/components/conformity/footer";

function Brand({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link href="/" onClick={onNavigate} className="shrink-0 flex items-center">
      <OxotWordmark variant="header" />
    </Link>
  );
}

function navLinkClass(active: boolean) {
  return cn(
    "relative inline-flex items-center gap-1.5 h-9 px-3 text-sm font-medium rounded-md transition-colors",
    active
      ? "text-primary-ink after:absolute after:bottom-0 after:left-3 after:right-3 after:h-0.5 after:rounded-full after:bg-primary"
      : "text-muted-foreground hover:text-foreground",
  );
}

function CraOperationsMenu({
  active,
  isCraOp,
}: {
  active: boolean;
  isCraOp: (href: string) => boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={navLinkClass(active)} data-testid="nav-cra-operations">
          CRA Operations
          <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-80">
        <DropdownMenuLabel className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
          Regulation (EU) 2024/2847 Engines
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {CRA_OPERATIONS.map((item) => {
          const body = (
            <>
              <item.icon className="w-4 h-4 mt-0.5 text-primary shrink-0" />
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium leading-none text-foreground">{item.label}</span>
                <span className="text-xs text-muted-foreground leading-snug">
                  {item.description}
                </span>
              </div>
            </>
          );
          return (
            <DropdownMenuItem key={item.href} asChild>
              {item.external ? (
                <a href={item.href} className="flex items-start gap-3 cursor-pointer">
                  {body}
                </a>
              ) : (
                <Link
                  href={item.href}
                  className="flex items-start gap-3 cursor-pointer"
                  data-active={isCraOp(item.href) || undefined}
                >
                  {body}
                </Link>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function ReferenceMenu({
  active,
  isRef,
}: {
  active: boolean;
  isRef: (href: string) => boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={navLinkClass(active)} data-testid="nav-reference">
          Reference
          <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72">
        {REFERENCE.map((item) => {
          const body = (
            <>
              <item.icon className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium leading-none">{item.label}</span>
                <span className="text-xs text-muted-foreground leading-snug">
                  {item.description}
                </span>
              </div>
            </>
          );
          return (
            <DropdownMenuItem key={item.href} asChild>
              {item.external ? (
                // Full-page navigation out of the workbench SPA.
                <a href={item.href} className="flex items-start gap-3 cursor-pointer">
                  {body}
                </a>
              ) : (
                <Link
                  href={item.href}
                  className="flex items-start gap-3 cursor-pointer"
                  data-active={isRef(item.href) || undefined}
                >
                  {body}
                </Link>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Help entry point: the glossary everywhere, plus "Take the tour" on pages
 * that have one (assessment workbench; command center for any signed-in
 * session). Tours are never forced on the demo role, but manual replay from
 * here always works.
 */
function HelpMenu() {
  const [location] = useLocation();
  const { data: session } = useGetAdminSession();
  const [glossaryOpen, setGlossaryOpen] = useState(false);

  const tourId: TourId | null = location.startsWith("/assessments/")
    ? "workbench"
    : location === "/" && session?.authenticated
      ? "portfolio"
      : null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="w-9 h-9"
            aria-label="Help"
            data-testid="help-menu"
          >
            <HelpCircle className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuItem onClick={() => setGlossaryOpen(true)} data-testid="help-glossary">
            <BookOpen className="w-4 h-4 mr-2" /> Glossary
          </DropdownMenuItem>
          {tourId && (
            <DropdownMenuItem onClick={() => requestTour(tourId)} data-testid="help-tour">
              <Compass className="w-4 h-4 mr-2" /> Take the tour
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
      <GlossaryDialog open={glossaryOpen} onOpenChange={setGlossaryOpen} />
    </>
  );
}

function SessionMenu() {
  const qc = useQueryClient();
  const { data: session } = useGetAdminSession();
  const logout = useAdminLogout({ mutation: { onSuccess: () => qc.invalidateQueries() } });
  if (!session?.authenticated) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="w-9 h-9" aria-label="Account menu">
          <User className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="font-normal">
          <div className="text-xs text-muted-foreground">Signed in as</div>
          <div className="text-sm font-medium truncate" data-testid="session-display-name">
            {session.displayName || session.username}
          </div>
          <div className="font-mono text-xs text-muted-foreground truncate">{session.username}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile" className="cursor-pointer" data-testid="menu-profile">
            <UserCircle className="w-4 h-4 mr-2" /> Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => logout.mutate()} disabled={logout.isPending}>
          <LogOut className="w-4 h-4 mr-2" /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MobileSession({ onNavigate }: { onNavigate: () => void }) {
  const qc = useQueryClient();
  const { data: session } = useGetAdminSession();
  const logout = useAdminLogout({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries();
        onNavigate();
      },
    },
  });
  if (!session?.authenticated) return null;
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wide text-muted-foreground">Signed in</div>
        <div className="text-sm font-medium truncate">{session.displayName || session.username}</div>
        <div className="font-mono text-xs text-muted-foreground truncate">{session.username}</div>
      </div>
      <div className="flex flex-col items-end gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href="/profile" onClick={onNavigate} data-testid="mobile-menu-profile">
            <UserCircle className="w-4 h-4 mr-2" /> Profile
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => logout.mutate()}
          disabled={logout.isPending}
        >
          <LogOut className="w-4 h-4 mr-2" /> Sign out
        </Button>
      </div>
    </div>
  );
}

function mobileItemClass(active: boolean) {
  return cn(
    "flex items-center gap-3 px-5 py-3 text-sm font-medium transition-colors",
    active ? "text-primary-ink bg-primary/5" : "text-foreground hover:bg-muted/50",
  );
}

export function Header() {
  const {
    productsActive,
    flowsActive,
    reportsActive,
    teamActive,
    psirtActive,
    portfolioActive,
    partnerActive,
    craOperationsActive,
    referenceActive,
    isRef,
    isCraOp,
  } = useNavState();
  const { data: session } = useGetAdminSession();
  const isAdmin = session?.role === "admin";
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const { open: paletteOpen, setOpen: setPaletteOpen } = useCommandPalette();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-6 min-w-0">
          <Brand />
          <nav className="hidden md:flex items-center gap-1" aria-label="Primary">
            <Link href={PRODUCT_PORTFOLIO.href} className={navLinkClass(portfolioActive)} data-testid="nav-portfolio">
              {PRODUCT_PORTFOLIO.label}
            </Link>
            <Link href={PRIMARY.href} className={navLinkClass(productsActive)} data-testid="nav-products">
              {PRIMARY.label}
            </Link>
            <Link href={PARTNER_HUB.href} className={navLinkClass(partnerActive)} data-testid="nav-partner-hub">
              {PARTNER_HUB.label}
            </Link>
            <CraOperationsMenu active={craOperationsActive} isCraOp={isCraOp} />
            <Link href={PSIRT.href} className={navLinkClass(psirtActive)} data-testid="nav-psirt">
              {PSIRT.label}
            </Link>
            <Link href={REPORTS.href} className={navLinkClass(reportsActive)} data-testid="nav-reports">
              {REPORTS.label}
            </Link>
            {isAdmin && (
              <Link href={TEAM.href} className={navLinkClass(teamActive)} data-testid="nav-team">
                {TEAM.label}
              </Link>
            )}
            <ReferenceMenu active={referenceActive} isRef={isRef} />
          </nav>
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex h-9 px-3 gap-2 text-sm text-muted-foreground"
            onClick={() => setPaletteOpen(true)}
            data-testid="command-palette-trigger"
          >
            <Search className="h-4 w-4" />
            <span className="hidden lg:inline">Search</span>
            <Kbd className="hidden lg:inline-flex">⌘K</Kbd>
          </Button>
          <HelpMenu />
          <ThemeToggle />
          <SessionMenu />
          <Button
            variant="ghost"
            size="icon"
            className="w-9 h-9 md:hidden"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />

      {/* Mobile drawer */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="flex flex-col w-[85vw] max-w-sm p-0">
          <SheetHeader className="px-5 pt-6 pb-4 border-b border-border">
            <SheetTitle className="text-left">
              <Brand onNavigate={close} />
            </SheetTitle>
          </SheetHeader>

          <nav className="flex-1 overflow-y-auto py-2" aria-label="Mobile">
            <Link
              href={PRODUCT_PORTFOLIO.href}
              onClick={close}
              className={mobileItemClass(portfolioActive)}
            >
              <PRODUCT_PORTFOLIO.icon className="w-4 h-4 shrink-0" />
              {PRODUCT_PORTFOLIO.label}
            </Link>
            <Link
              href={PRIMARY.href}
              onClick={close}
              className={mobileItemClass(productsActive)}
            >
              <PRIMARY.icon className="w-4 h-4 shrink-0" />
              {PRIMARY.label}
            </Link>
            <Link
              href={PARTNER_HUB.href}
              onClick={close}
              className={mobileItemClass(partnerActive)}
            >
              <PARTNER_HUB.icon className="w-4 h-4 shrink-0" />
              {PARTNER_HUB.label}
            </Link>
            <div className="px-5 pt-3 pb-1 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
              CRA Statutory Operations
            </div>
            {CRA_OPERATIONS.map((c) => (
              <Link
                key={c.href}
                href={c.href}
                onClick={close}
                className={mobileItemClass(isCraOp(c.href))}
              >
                <c.icon className="w-4 h-4 shrink-0 text-primary" />
                {c.label}
              </Link>
            ))}
            <div className="px-5 pt-3 pb-1 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
              Core Monitoring & Reports
            </div>
            <Link
              href={PSIRT.href}
              onClick={close}
              className={mobileItemClass(psirtActive)}
            >
              <PSIRT.icon className="w-4 h-4 shrink-0" />
              {PSIRT.label}
            </Link>
            <Link
              href={REPORTS.href}
              onClick={close}
              className={mobileItemClass(reportsActive)}
            >
              <REPORTS.icon className="w-4 h-4 shrink-0" />
              {REPORTS.label}
            </Link>
            {isAdmin && (
              <Link
                href={TEAM.href}
                onClick={close}
                className={mobileItemClass(teamActive)}
              >
                <TEAM.icon className="w-4 h-4 shrink-0" />
                {TEAM.label}
              </Link>
            )}

            <div className="px-5 pt-4 pb-1 flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                Reference
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {REFERENCE.map((item) =>
              item.external ? (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={close}
                  className={mobileItemClass(false)}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={close}
                  className={mobileItemClass(!productsActive && isRef(item.href))}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <div className="border-t border-border px-5 py-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">Theme</span>
              <ThemeToggle />
            </div>
            <MobileSession onNavigate={close} />
            <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <span className="w-2 h-2 rounded-full bg-green-500" /> System online
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}

function Footer() {
  return <SiteFooter />;
}

/**
 * First-login onboarding nudge: named assessors who have not completed setup
 * are routed to /onboarding. Never for admin/demo, never under automation
 * (same rule as tour auto-start), and never in a loop — skipping marks the
 * browser session. Session fixtures without needsOnboarding never trigger it.
 */
function OnboardingRedirect() {
  const { data: session } = useGetAdminSession();
  const [location, setLocation] = useLocation();
  useEffect(() => {
    if (location !== "/onboarding" && shouldAutoStartOnboarding(session)) {
      setLocation("/onboarding");
    }
  }, [session, location, setLocation]);
  return null;
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] w-full max-w-[100vw] overflow-x-hidden flex-col bg-background text-foreground relative">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        Skip to content
      </a>
      <OnboardingRedirect />
      <Header />
      <main id="main-content" className="flex-1">{children}</main>
      <Footer />
      <FloatingAiAssistant />
    </div>
  );
}
