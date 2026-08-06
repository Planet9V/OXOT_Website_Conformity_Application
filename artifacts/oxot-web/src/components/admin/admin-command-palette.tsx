import * as React from 'react';
import { useLocation } from 'wouter';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  useListAdminPages,
  useListPages,
  useListLeads,
  getListAdminPagesQueryKey,
  getListPagesQueryKey,
  getListLeadsQueryKey,
} from '@workspace/api-client-react';
import { LayoutDashboard, FileText, Menu, Image as ImageIcon, Users, LineChart, BarChart3, Mail, BrainCircuit, Plug, Search, Settings, Globe } from 'lucide-react';
import { Kbd } from '@/components/ui/kbd';

const ADMIN_ROUTES = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { id: 'pages', label: 'Pages & Content', icon: FileText, href: '/admin/pages' },
  { id: 'menus', label: 'Menus', icon: Menu, href: '/admin/menus' },
  { id: 'carousel', label: 'Carousel', icon: ImageIcon, href: '/admin/carousel' },
  { id: 'leads', label: 'Leads & Chat', icon: Users, href: '/admin/leads' },
  { id: 'seo', label: 'Affiliate & SEO', icon: LineChart, href: '/admin/seo' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/admin/analytics' },
  { id: 'newsletter', label: 'Newsletter & Social', icon: Mail, href: '/admin/newsletter' },
  { id: 'ai', label: 'AI & Models', icon: BrainCircuit, href: '/admin/ai' },
  { id: 'settings', label: 'Settings', icon: Settings, href: '/admin/settings' },
  { id: 'integrations', label: 'Integrations', icon: Plug, href: '/admin/integrations' },
];

export function AdminCommandPalette() {
  const [open, setOpen] = React.useState(false);
  const [, setLocation] = useLocation();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = React.useCallback((href: string) => {
    setOpen(false);
    setLocation(href);
  }, [setLocation]);

  // Data fetching - only enabled while the palette is open
  const { data: adminPagesEn } = useListAdminPages('en', {
    query: { enabled: open, queryKey: getListAdminPagesQueryKey('en') },
  });

  const { data: adminPagesNl } = useListAdminPages('nl', {
    query: { enabled: open, queryKey: getListAdminPagesQueryKey('nl') },
  });

  const { data: publicPages } = useListPages('en', {
    query: { enabled: open, queryKey: getListPagesQueryKey('en') },
  });

  const { data: leads } = useListLeads(undefined, {
    query: { enabled: open, queryKey: getListLeadsQueryKey() },
  });

  const adminPages = [
    ...(adminPagesEn ?? []).map((page) => ({ ...page, localeTag: 'EN' })),
    ...(adminPagesNl ?? []).map((page) => ({ ...page, localeTag: 'NL' })),
  ];

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        data-testid="button-open-command-palette"
        className="flex w-full items-center gap-2 rounded-md border border-input bg-muted/50 px-3 py-1.5 text-sm text-muted-foreground shadow-sm transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-left">Search...</span>
        <Kbd>⌘K</Kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          <CommandGroup heading="Admin Screens">
            {ADMIN_ROUTES.map((route) => {
              const Icon = route.icon;
              return (
                <CommandItem
                  key={route.id}
                  value={route.label}
                  onSelect={() => handleSelect(route.href)}
                  data-testid={`cmd-route-${route.id}`}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  <span>{route.label}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>

          {adminPages.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Edit Page">
                {adminPages.map((page) => (
                  <CommandItem
                    key={`admin-page-${page.id}`}
                    value={`Edit ${page.title} ${page.localeTag}`}
                    onSelect={() => handleSelect(`/admin/pages/${page.id}`)}
                    data-testid={`cmd-admin-page-${page.id}`}
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    <span className="flex-1">{page.title}</span>
                    <span className="text-xs text-muted-foreground">{page.localeTag}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {publicPages && publicPages.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="View Public Page">
                {publicPages.map((page) => (
                  <CommandItem
                    key={`public-page-${page.slug}`}
                    value={`View ${page.title}`}
                    onSelect={() => handleSelect(`/${page.slug}`)}
                    data-testid={`cmd-public-page-${page.slug}`}
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    <span>{page.title}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {leads && leads.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Recent Leads">
                {leads.slice(0, 5).map((lead) => (
                  <CommandItem
                    key={`lead-${lead.id}`}
                    value={`Lead ${lead.name} ${lead.email}`}
                    onSelect={() => handleSelect('/admin/leads')}
                    data-testid={`cmd-lead-${lead.id}`}
                  >
                    <Users className="mr-2 h-4 w-4" />
                    <span>{lead.name} ({lead.email})</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
