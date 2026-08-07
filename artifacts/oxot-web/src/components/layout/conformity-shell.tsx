/**
 * Conformity Platform shell — wraps every /conformity-platform/* page with a
 * consistent dark hero banner + horizontal sub-navigation.
 */
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ScrollText,
  Layers,
  GitMerge,
  FileSearch,
  Library,
} from 'lucide-react';

const NAV = [
  { label: 'Overview',     href: '/conformity',               icon: LayoutDashboard },
  { label: 'Regulations',  href: '/conformity/regulations',   icon: ScrollText      },
  { label: 'Requirements', href: '/conformity/requirements',  icon: FileSearch      },
  { label: 'Themes',       href: '/conformity/themes',        icon: Layers          },
  { label: 'Matrix',       href: '/conformity/matrix',        icon: GitMerge        },
  { label: 'Sources',      href: '/conformity/sources',       icon: Library         },
];

export function ConformityShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  // Exact match for overview; prefix match for children
  function isActive(href: string) {
    if (href === '/conformity' || href === '/conformity-platform') {
      return location === '/conformity' || location === '/conformity-platform';
    }
    return location.startsWith(href);
  }

  return (
    <div className="w-full max-w-[100vw] overflow-x-hidden">
      {/* ── Banner ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-28 pb-6 border-b border-border/40 bg-background">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_60%,transparent_100%)] pointer-events-none -z-10 opacity-20 dark:opacity-10" />
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[500px] h-[500px] bg-primary/8 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="container mx-auto px-4 md:px-8">
          <p className="text-xs font-semibold tracking-[0.15em] uppercase text-primary mb-2">
            Conformity Platform
          </p>
          <h1 className="oxot-h1 text-foreground leading-tight mb-1">
            EU Regulatory Intelligence
          </h1>
          <p className="text-sm text-muted-foreground max-w-xl">
            Every obligation, mapped across frameworks, cross-referenced and searchable.
          </p>
        </div>
      </section>

      {/* ── Sub-nav tabs ─────────────────────────────────────────────── */}
      <div className="sticky top-[57px] z-30 border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto px-4 md:px-8">
          <nav className="flex gap-0 overflow-x-auto">
            {NAV.map(({ label, href, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'relative flex items-center gap-2 px-4 py-3.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px',
                  isActive(href)
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border',
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* ── Page content ─────────────────────────────────────────────── */}
      <div className="container mx-auto px-4 md:px-8 py-10">
        {children}
      </div>
    </div>
  );
}
