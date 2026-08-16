import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Layers,
  Grid3x3,
  Database,
  ClipboardCheck,
  GitBranch,
  FileText,
  FileSignature,
  FolderGit2,
  Building2,
  Landmark,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  Sun,
  Moon,
  ChevronDown,
  User,
  UserCircle,
  ShieldAlert,
  HelpCircle,
  BookOpen,
  Compass,
  Boxes,
  Search,
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
  /** Only rendered for admin sessions. */
  adminOnly?: boolean;
  /** Legacy path prefixes that should light this destination up while their
   * pages await re-homing (e.g. /assessments/:id belongs to Products). */
  alsoActive?: string[];
};

/**
 * The nine destinations in four groups (DESIGN_five_shapes.md iteration 2,
 * D10–D13). The groups mirror the design doc exactly: WORK is deadline-driven
 * and arrives from outside; REGISTERS is what you are responsible for;
 * REFERENCE is the law; ADMIN is the team. Acts and roles are dimensions on
 * the surfaces (badges and filters), never navigation sections.
 */
const NAV_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Work",
    items: [
      { href: "/", label: "Home", icon: LayoutDashboard, description: "What needs attention, scoped to your team role" },
      { href: "/incidents", label: "Incidents", icon: ShieldAlert, description: "Vulnerability intake and the CRA Art. 14 / NIS2 Art. 23 reporting clocks" },
      { href: "/authorities", label: "Authorities", icon: Landmark, description: "Market surveillance and competent-authority engagements" },
      { href: "/signatures", label: "Signatures", icon: FileSignature, description: "Attestations and the provenance ledger" },
    ],
  },
  {
    label: "Registers",
    items: [
      { href: "/products", label: "Products", icon: ClipboardCheck, alsoActive: ["/assessments"], description: "Product files: assessments, evidence and documentation" },
      { href: "/projects", label: "Projects", icon: FolderGit2, description: "Open-source stewardship (CRA Art. 24) — projects, not products" },
      { href: "/organisation", label: "Organisation", icon: Building2, description: "Declared roles, regulations in scope and organisation-level duties" },
    ],
  },
  {
    label: "Reference",
    items: [
      { href: "/library", label: "Library", icon: BookOpen, description: "The statutory texts — read linearly or at the point of use" },
    ],
  },
  {
    label: "Admin",
    items: [
      { href: "/settings", label: "Settings", icon: SettingsIcon, adminOnly: true, description: "Team accounts and roles" },
    ],
  },
];

/**
 * Surfaces that still exist but have not yet been re-homed into a destination
 * (task_plan.md 7.2–7.6). They stay reachable here during the transition —
 * removing reach before the replacement ships would be a regression — and this
 * menu is DELETED when the last entry moves. Do not add new surfaces here.
 */
const TRANSITIONAL: NavItem[] = [
  { href: "/partner-hub", label: "Plant & SI Pipeline", icon: Boxes, description: "Re-homes into the product file and Incidents (7.3 / 7.4)" },
  { href: "/product-portfolio", label: "Portfolio", icon: Boxes, description: "Re-homes into Products (7.3)" },
  { href: "/reports", label: "Reports", icon: FileText, description: "Re-homes into Home and the product file" },
  { href: "/flows", label: "Flows", icon: GitBranch, description: "Admin-authored assessment process flows" },
  { href: "/standards", label: "Standards Matrix", icon: Layers, description: "Re-homes into the product file (7.3)" },
  { href: "/ce-studio", label: "CE Studio", icon: Grid3x3, description: "Re-homes into the product file (7.3)" },
  { href: "/archive", label: "Importer Archive", icon: Database, description: "Re-homes into the product file (7.3)" },
  { href: "/auditor-portal", label: "Auditor Portal", icon: ClipboardCheck, description: "Separate notified-body track" },
];

function useNavState() {
  const [location] = useLocation();
  const isActive = (item: NavItem) =>
    item.href === "/"
      ? location === "/"
      : location.startsWith(item.href) ||
        (item.alsoActive ?? []).some((p) => location.startsWith(p));
  const transitionalActive = TRANSITIONAL.some((t) => location.startsWith(t.href));
  return { location, isActive, transitionalActive };
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

function TransitionalMenu({ active }: { active: boolean }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className={navLinkClass(active)} data-testid="nav-transitional">
          More
          <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-80">
        <DropdownMenuLabel className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
          Being re-homed (Phase 7)
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {TRANSITIONAL.map((item) => (
          <DropdownMenuItem key={item.href} asChild>
            <Link href={item.href} className="flex items-start gap-3 cursor-pointer">
              <item.icon className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium leading-none text-foreground">{item.label}</span>
                <span className="text-xs text-muted-foreground leading-snug">
                  {item.description}
                </span>
              </div>
            </Link>
          </DropdownMenuItem>
        ))}
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
  const { location, isActive, transitionalActive } = useNavState();
  const { data: session } = useGetAdminSession();
  const isAdmin = session?.role === "admin";
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const { open: paletteOpen, setOpen: setPaletteOpen } = useCommandPalette();

  // Groups whose every item is filtered out (Admin for non-admins) disappear
  // entirely, separator included.
  const visibleGroups = NAV_GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((i) => !i.adminOnly || isAdmin),
  })).filter((g) => g.items.length > 0);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <Brand />
          <nav className="hidden xl:flex items-center gap-0.5" aria-label="Primary">
            {visibleGroups.map((group, gi) => (
              <div key={group.label} className="flex items-center gap-0.5">
                {gi > 0 && <div className="h-4 w-px bg-border mx-1.5" aria-hidden="true" />}
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={navLinkClass(isActive(item))}
                    data-testid={`nav-${item.label.toLowerCase()}`}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}
            <div className="h-4 w-px bg-border mx-1.5" aria-hidden="true" />
            <TransitionalMenu active={transitionalActive} />
          </nav>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex h-9 px-3 gap-2 text-sm text-muted-foreground"
            onClick={() => setPaletteOpen(true)}
            data-testid="command-palette-trigger"
          >
            <Search className="h-4 w-4" />
            <span className="hidden 2xl:inline">Search</span>
            <Kbd className="hidden 2xl:inline-flex">⌘K</Kbd>
          </Button>
          <HelpMenu />
          <ThemeToggle />
          <SessionMenu />
          <Button
            variant="ghost"
            size="icon"
            className="w-9 h-9 xl:hidden"
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
            {visibleGroups.map((group) => (
              <div key={group.label}>
                <div className="px-5 pt-3 pb-1 text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
                  {group.label}
                </div>
                {group.items.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={close}
                    className={mobileItemClass(isActive(item))}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}

            <div className="px-5 pt-4 pb-1 flex items-center gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground whitespace-nowrap">
                Being re-homed (Phase 7)
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>
            {TRANSITIONAL.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={close}
                className={mobileItemClass(location.startsWith(item.href))}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {item.label}
              </Link>
            ))}
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
