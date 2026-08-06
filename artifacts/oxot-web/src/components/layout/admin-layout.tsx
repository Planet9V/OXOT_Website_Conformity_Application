import { useAdminLogout } from '@workspace/api-client-react';
import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  FileText, 
  Menu, 
  Image as ImageIcon, 
  Users, 
  LineChart, 
  BarChart3,
  Mail, 
  BrainCircuit, 
  Plug,
  LogOut 
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { AdminCommandPalette } from '@/components/admin/admin-command-palette';

const SIDEBAR_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { id: 'pages', label: 'Pages & Content', icon: FileText, href: '/admin/pages' },
  { id: 'menus', label: 'Menus', icon: Menu, href: '/admin/menus' },
  { id: 'carousel', label: 'Carousel', icon: ImageIcon, href: '/admin/carousel' },
  { id: 'leads', label: 'Leads & Chat', icon: Users, href: '/admin/leads' },
  { id: 'seo', label: 'Affiliate & SEO', icon: LineChart, href: '/admin/seo' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, href: '/admin/analytics' },
  { id: 'newsletter', label: 'Newsletter & Social', icon: Mail, href: '/admin/newsletter' },
  { id: 'ai', label: 'AI & Models', icon: BrainCircuit, href: '/admin/ai' },
  { id: 'integrations', label: 'Integrations', icon: Plug, href: '/admin/integrations' },
];

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  
  const logoutMutation = useAdminLogout({
    mutation: {
      onSuccess: () => {
        queryClient.clear();
        setLocation('/admin/login');
      }
    }
  });

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded-sm flex items-center justify-center">
              <span className="text-white font-display font-bold text-sm leading-none">O</span>
            </div>
            <span className="font-display font-bold text-lg tracking-tight">
              Admin
            </span>
          </div>
        </div>
        
        <div className="flex-1 py-6 px-3 overflow-y-auto space-y-1">
          <div className="mb-6 px-2">
            <AdminCommandPalette />
          </div>
          {SIDEBAR_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link key={item.id} href={item.href}>
                <div className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}>
                  <Icon className="w-4 h-4" />
                  {item.label}
                </div>
              </Link>
            );
          })}
        </div>

        <div className="p-4 border-t">
          <Button 
            variant="outline" 
            className="w-full justify-start text-muted-foreground" 
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="h-16 border-b bg-card flex items-center px-4 md:hidden justify-between">
          <span className="font-display font-bold text-lg">OXOT Admin</span>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => logoutMutation.mutate()}
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-muted/20">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
