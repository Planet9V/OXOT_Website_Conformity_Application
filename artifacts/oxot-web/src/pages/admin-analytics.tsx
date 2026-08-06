import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useGetAnalyticsOverview,
  getGetAnalyticsOverviewQueryKey,
  useGetAnalyticsRecommendations,
  getGetAnalyticsRecommendationsQueryKey,
} from '@workspace/api-client-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { AdminLayout } from '@/components/layout/admin-layout';
import { useAdminGuard } from '@/hooks/use-admin-guard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { BarChart3, Eye, Users, MousePointerClick, Sparkles, RefreshCw } from 'lucide-react';

const RANGES = [
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
];

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Eye;
  label: string;
  value: number;
}) {
  return (
    <div className="bg-card border rounded-xl p-6 shadow-sm">
      <div className="flex items-center gap-2 text-muted-foreground text-sm">
        <Icon className="w-4 h-4" />
        {label}
      </div>
      <div className="text-3xl font-display font-bold mt-2 tabular-nums">
        {value.toLocaleString()}
      </div>
    </div>
  );
}

function RecommendationsPanel({ enabled }: { enabled: boolean }) {
  const queryClient = useQueryClient();
  const { data, isLoading, isFetching } = useGetAnalyticsRecommendations({
    query: { queryKey: getGetAnalyticsRecommendationsQueryKey(), enabled, staleTime: 5 * 60 * 1000 },
  });

  return (
    <div className="bg-card border rounded-xl p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="font-display font-bold text-lg">AI recommendations</h2>
        </div>
        <Button
          size="sm"
          variant="outline"
          disabled={isFetching}
          onClick={() =>
            queryClient.invalidateQueries({
              queryKey: getGetAnalyticsRecommendationsQueryKey(),
            })
          }
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} /> Refresh
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-40 w-full rounded-lg" />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-medium mb-2">Content ideas</p>
            {data && data.contentIdeas.length > 0 ? (
              <ul className="space-y-3">
                {data.contentIdeas.map((c, i) => (
                  <li key={i} className="text-sm">
                    <span className="font-medium">{c.title}</span>
                    <p className="text-muted-foreground">{c.rationale}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No ideas yet.</p>
            )}
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Link placement ideas</p>
            {data && data.placementIdeas.length > 0 ? (
              <ul className="space-y-3">
                {data.placementIdeas.map((p, i) => (
                  <li key={i} className="text-sm">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{p.linkName}</Badge>
                      {p.keyword && <span className="font-medium">"{p.keyword}"</span>}
                    </div>
                    <p className="text-muted-foreground">{p.suggestion}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">
                Add active affiliate links to get placement ideas.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminAnalytics() {
  const { authenticated } = useAdminGuard();
  const [days, setDays] = useState(30);
  const { data, isLoading } = useGetAnalyticsOverview(
    { days },
    { query: { queryKey: getGetAnalyticsOverviewQueryKey({ days }), enabled: authenticated } },
  );

  if (!authenticated) return null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold">Analytics</h1>
              <p className="text-sm text-muted-foreground">
                First-party traffic, engagement, and affiliate performance.
              </p>
            </div>
          </div>
          <div className="flex gap-1 bg-muted rounded-lg p-1">
            {RANGES.map((r) => (
              <button
                key={r.value}
                onClick={() => setDays(r.value)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  days === r.value ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading || !data ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard icon={Eye} label="Page views" value={data.totalViews} />
              <StatCard icon={Users} label="Unique visitors" value={data.uniqueVisitors} />
              <StatCard icon={MousePointerClick} label="Affiliate clicks" value={data.totalClicks} />
            </div>

            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <h2 className="font-display font-bold text-lg mb-4">Views over time</h2>
              {data.viewsByDay.length === 0 ? (
                <p className="text-sm text-muted-foreground py-12 text-center">
                  No visits recorded in this range yet.
                </p>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.viewsByDay}>
                      <defs>
                        <linearGradient id="views" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                      <YAxis allowDecimals={false} tick={{ fontSize: 12 }} tickLine={false} axisLine={false} width={30} />
                      <Tooltip
                        contentStyle={{
                          background: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: 8,
                          fontSize: 12,
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="views"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        fill="url(#views)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-card border rounded-xl p-6 shadow-sm">
                <h2 className="font-display font-bold text-base mb-4">Top pages</h2>
                {data.topPages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No data.</p>
                ) : (
                  <ul className="space-y-2">
                    {data.topPages.map((p) => (
                      <li key={p.path} className="flex justify-between text-sm">
                        <span className="truncate mr-2 text-muted-foreground">{p.path}</span>
                        <span className="tabular-nums font-medium">{p.views}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="bg-card border rounded-xl p-6 shadow-sm">
                <h2 className="font-display font-bold text-base mb-4">Top referrers</h2>
                {data.topReferrers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No data.</p>
                ) : (
                  <ul className="space-y-2">
                    {data.topReferrers.map((r) => (
                      <li key={r.referrer} className="flex justify-between text-sm">
                        <span className="truncate mr-2 text-muted-foreground">{r.referrer}</span>
                        <span className="tabular-nums font-medium">{r.count}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="bg-card border rounded-xl p-6 shadow-sm">
                <h2 className="font-display font-bold text-base mb-4">Devices</h2>
                {data.deviceBreakdown.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No data.</p>
                ) : (
                  <ul className="space-y-2">
                    {data.deviceBreakdown.map((d) => (
                      <li key={d.device} className="flex justify-between text-sm">
                        <span className="capitalize text-muted-foreground">{d.device}</span>
                        <span className="tabular-nums font-medium">{d.count}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="bg-card border rounded-xl p-6 shadow-sm">
              <h2 className="font-display font-bold text-lg mb-4">Affiliate link performance</h2>
              {data.linkPerformance.length === 0 ? (
                <p className="text-sm text-muted-foreground">No affiliate links yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Link</TableHead>
                      <TableHead className="text-right">Clicks (range)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.linkPerformance.map((l) => (
                      <TableRow key={l.linkId}>
                        <TableCell className="font-medium">{l.name}</TableCell>
                        <TableCell className="text-right tabular-nums">{l.clicks}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>

            <RecommendationsPanel enabled={authenticated} />
          </>
        )}
      </div>
    </AdminLayout>
  );
}
