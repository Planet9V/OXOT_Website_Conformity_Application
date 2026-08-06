import { useMemo } from 'react';
import { useLocation } from 'wouter';
import {
  useGetAdminSession,
  getGetAdminSessionQueryKey,
  useListAdminPages,
  getListAdminPagesQueryKey,
  useListLeads,
  getListLeadsQueryKey,
  useGetAnalyticsOverview,
  getGetAnalyticsOverviewQueryKey,
} from '@workspace/api-client-react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { useAdminGuard } from '@/hooks/use-admin-guard';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Plus, Users, Eye, Languages } from 'lucide-react';

const LOCALES = ['en', 'nl'] as const;

function formatDate(value: string): string {
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleDateString(undefined, { dateStyle: 'medium' });
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  loading,
}: {
  icon: typeof Eye;
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  loading: boolean;
}) {
  return (
    <div className="bg-card border rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <Icon className="w-4 h-4" />
        {label}
      </div>
      {loading ? (
        <Skeleton className="mt-3 h-9 w-16" />
      ) : (
        <div className="text-4xl font-display font-bold text-primary mt-2 tabular-nums">
          {value}
        </div>
      )}
      {sub && !loading && (
        <div className="mt-2 text-sm text-muted-foreground">{sub}</div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const { authenticated } = useAdminGuard();
  const [, setLocation] = useLocation();

  const { data: session } = useGetAdminSession({
    query: { queryKey: getGetAdminSessionQueryKey(), retry: false },
  });

  const pagesEn = useListAdminPages('en', {
    query: { queryKey: getListAdminPagesQueryKey('en'), enabled: authenticated },
  });
  const pagesNl = useListAdminPages('nl', {
    query: { queryKey: getListAdminPagesQueryKey('nl'), enabled: authenticated },
  });
  const leadsQuery = useListLeads(
    {},
    { query: { queryKey: getListLeadsQueryKey({}), enabled: authenticated } },
  );
  const analytics = useGetAnalyticsOverview(
    { days: 30 },
    { query: { queryKey: getGetAnalyticsOverviewQueryKey({ days: 30 }), enabled: authenticated } },
  );

  const pagesLoading = pagesEn.isLoading || pagesNl.isLoading;

  const { totalPages, published, drafts, recentPages } = useMemo(() => {
    const all = [...(pagesEn.data ?? []), ...(pagesNl.data ?? [])] as Array<{
      id: number;
      title: string;
      slug: string;
      status: string;
      locale: string;
      updatedAt: string;
    }>;
    const publishedCount = all.filter((p) => p.status === 'published').length;
    const recent = [...all]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 6);
    return {
      totalPages: all.length,
      published: publishedCount,
      drafts: all.length - publishedCount,
      recentPages: recent,
    };
  }, [pagesEn.data, pagesNl.data]);

  const { totalLeads, newLeads } = useMemo(() => {
    const rows = (leadsQuery.data ?? []) as Array<{ createdAt: string }>;
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recent = rows.filter((l) => {
      const t = new Date(l.createdAt).getTime();
      return !Number.isNaN(t) && t >= weekAgo;
    }).length;
    return { totalLeads: rows.length, newLeads: recent };
  }, [leadsQuery.data]);

  if (!authenticated) return null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {session?.username || 'admin'}.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={FileText}
            label="Total Pages"
            value={totalPages.toLocaleString()}
            loading={pagesLoading}
            sub={`${published} published · ${drafts} ${drafts === 1 ? 'draft' : 'drafts'}`}
          />
          <StatCard
            icon={Users}
            label="Leads"
            value={totalLeads.toLocaleString()}
            loading={leadsQuery.isLoading}
            sub={`${newLeads} new this week`}
          />
          <StatCard
            icon={Eye}
            label="Page views (30d)"
            value={(analytics.data?.totalViews ?? 0).toLocaleString()}
            loading={analytics.isLoading}
            sub={`${(analytics.data?.uniqueVisitors ?? 0).toLocaleString()} unique visitors`}
          />
          <StatCard
            icon={Languages}
            label="Active Locales"
            loading={false}
            value={
              <div className="flex gap-2">
                {LOCALES.map((l) => (
                  <span
                    key={l}
                    className="inline-flex items-center rounded-md bg-muted px-2 py-1 text-sm font-medium ring-1 ring-inset ring-border"
                  >
                    {l.toUpperCase()}
                  </span>
                ))}
              </div>
            }
          />
        </div>

        <div className="mt-8 border rounded-xl bg-card overflow-hidden">
          <div className="p-6 border-b flex items-center justify-between">
            <h2 className="text-xl font-display font-semibold">Recent Pages</h2>
            <Button size="sm" variant="outline" onClick={() => setLocation('/admin/pages')}>
              <Plus className="w-4 h-4 mr-2" />
              New Page
            </Button>
          </div>

          {pagesLoading ? (
            <div className="space-y-3 p-6">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : recentPages.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-1">No pages yet</h3>
              <p className="text-muted-foreground max-w-md">
                Create your first page to start building the site.
              </p>
              <Button className="mt-4" size="sm" onClick={() => setLocation('/admin/pages')}>
                <Plus className="w-4 h-4 mr-2" />
                Create a page
              </Button>
            </div>
          ) : (
            <ul className="divide-y">
              {recentPages.map((page) => (
                <li key={`${page.locale}-${page.id}`}>
                  <button
                    type="button"
                    onClick={() => setLocation(`/admin/pages/${page.id}`)}
                    className="flex w-full items-center gap-4 px-6 py-4 text-left transition-colors hover:bg-muted/50"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium">{page.title}</span>
                        <Badge
                          variant={page.status === 'published' ? 'default' : 'secondary'}
                          className="uppercase"
                        >
                          {page.status}
                        </Badge>
                        <Badge variant="outline" className="uppercase text-xs">
                          {page.locale}
                        </Badge>
                      </div>
                      <p className="truncate text-sm text-muted-foreground">
                        /{page.slug} · updated {formatDate(page.updatedAt)}
                      </p>
                    </div>
                    <span className="text-sm text-muted-foreground">Edit</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
