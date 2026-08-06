import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import {
  useGetAdminSession,
  getGetAdminSessionQueryKey,
  useListLeads,
  getListLeadsQueryKey,
  useGetLead,
  getGetLeadQueryKey,
  useUpdateLeadStatus,
  type UpdateLeadStatusInputStatus,
} from '@workspace/api-client-react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { toast } from '@/hooks/use-toast';
import { Users, Search, Mail, Building2, MessageSquare, Bot } from 'lucide-react';

const LEAD_STATUSES = ['new', 'contacted', 'qualified', 'won', 'lost'] as const;
type LeadStatus = (typeof LEAD_STATUSES)[number];

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: 'New',
  contacted: 'Contacted',
  qualified: 'Qualified',
  won: 'Won',
  lost: 'Lost',
};

const STATUS_BADGE_CLASSES: Record<LeadStatus, string> = {
  new: 'border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  contacted:
    'border-transparent bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  qualified:
    'border-transparent bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
  won: 'border-transparent bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
  lost: 'border-transparent bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

function StatusBadge({ status }: { status: string }) {
  const known = (LEAD_STATUSES as readonly string[]).includes(status)
    ? (status as LeadStatus)
    : null;
  if (!known) {
    return (
      <Badge variant="outline" className="capitalize">
        {status}
      </Badge>
    );
  }
  return <Badge className={STATUS_BADGE_CLASSES[known]}>{STATUS_LABELS[known]}</Badge>;
}

function formatDate(value: string): string {
  const d = new Date(value);
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleString(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
}

function LeadDetailPanel({ id }: { id: number }) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useGetLead(id, {
    query: { queryKey: getGetLeadQueryKey(id) },
  });

  const { mutate: updateStatus, isPending: statusPending } = useUpdateLeadStatus({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/admin/leads'], exact: false });
        queryClient.invalidateQueries({ queryKey: getGetLeadQueryKey(id) });
        toast({ title: 'Lead status updated' });
      },
      onError: () =>
        toast({ title: 'Could not update status', variant: 'destructive' }),
    },
  });

  if (isLoading || !data) {
    return (
      <div className="space-y-3 py-4">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6 py-2" aria-live="polite">
      <div className="space-y-2 rounded-lg border bg-muted/30 p-4">
        <div className="flex items-center gap-2 text-sm">
          <Mail className="h-4 w-4 text-muted-foreground" />
          <a href={`mailto:${data.email}`} className="text-primary hover:underline">
            {data.email}
          </a>
        </div>
        {data.company && (
          <div className="flex items-center gap-2 text-sm">
            <Building2 className="h-4 w-4 text-muted-foreground" />
            {data.company}
          </div>
        )}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="uppercase">
            {data.locale}
          </Badge>
          <StatusBadge status={data.status} />
          <span>{formatDate(data.createdAt)}</span>
        </div>
        {data.message && (
          <div className="flex items-start gap-2 pt-1 text-sm">
            <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
            <p className="whitespace-pre-wrap">{data.message}</p>
          </div>
        )}
      </div>

      <div>
        <h4 className="mb-2 text-sm font-semibold">Status</h4>
        <Select
          value={data.status}
          disabled={statusPending}
          onValueChange={(value) =>
            updateStatus({ id, data: { status: value as UpdateLeadStatusInputStatus } })
          }
        >
          <SelectTrigger className="w-full sm:w-52" aria-label="Lead status">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            {LEAD_STATUSES.map((status) => (
              <SelectItem key={status} value={status}>
                {STATUS_LABELS[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold">
          <Bot className="h-4 w-4 text-primary" />
          Conversation transcript
        </h4>
        {data.messages.length === 0 ? (
          <p className="text-sm text-muted-foreground">No chat transcript for this lead.</p>
        ) : (
          <div className="space-y-3">
            {data.messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div
                  className={
                    m.role === 'user'
                      ? 'max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tr-sm bg-primary px-3 py-2 text-sm text-primary-foreground'
                      : 'max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tl-sm bg-card px-3 py-2 text-sm shadow-sm ring-1 ring-border'
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminLeads() {
  const [, setLocation] = useLocation();
  const { data: session, isLoading: sessionLoading, error: sessionError } = useGetAdminSession({
    query: { queryKey: getGetAdminSessionQueryKey(), retry: false },
  });

  const [searchInput, setSearchInput] = useState('');
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedId, setSelectedId] = useState<number | null>(null);

  useEffect(() => {
    if (!sessionLoading && (!session?.authenticated || sessionError)) {
      setLocation('/admin/login');
    }
  }, [sessionLoading, session, sessionError, setLocation]);

  const params = useMemo(() => {
    const p: { q?: string; status?: string } = {};
    if (query) p.q = query;
    if (statusFilter !== 'all') p.status = statusFilter;
    return Object.keys(p).length ? p : undefined;
  }, [query, statusFilter]);
  const {
    data: leads,
    isLoading: leadsLoading,
  } = useListLeads(params, {
    query: {
      queryKey: getListLeadsQueryKey(params),
      enabled: Boolean(session?.authenticated),
    },
  });

  if (sessionLoading || !session?.authenticated) return null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Leads &amp; Chat</h1>
          <p className="mt-1 text-muted-foreground">
            Contacts captured by the AI assistant, with full conversation transcripts.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            setQuery(searchInput.trim());
          }}
          className="flex gap-2"
        >
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by name, email or company…"
              aria-label="Search leads"
              className="pl-9"
            />
          </div>
          <Button type="submit" variant="outline">
            Search
          </Button>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40" aria-label="Filter by status">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {LEAD_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {STATUS_LABELS[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {(query || statusFilter !== 'all') && (
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setSearchInput('');
                setQuery('');
                setStatusFilter('all');
              }}
            >
              Clear
            </Button>
          )}
        </form>

        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          {leadsLoading ? (
            <div className="space-y-3 p-6">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : !leads || leads.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mb-1 text-lg font-medium">No leads yet</h3>
              <p className="max-w-md text-muted-foreground">
                {query
                  ? 'No leads match your search.'
                  : 'Leads captured through the site assistant will appear here.'}
              </p>
            </div>
          ) : (
            <ul className="divide-y">
              {leads.map((leadItem) => (
                <li key={leadItem.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(leadItem.id)}
                    className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/50"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 font-medium text-primary">
                      {leadItem.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate font-medium">{leadItem.name}</span>
                        <Badge variant="outline" className="uppercase">
                          {leadItem.locale}
                        </Badge>
                        <StatusBadge status={leadItem.status} />
                      </div>
                      <p className="truncate text-sm text-muted-foreground">
                        {leadItem.email}
                        {leadItem.company ? ` · ${leadItem.company}` : ''}
                      </p>
                    </div>
                    <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">
                      {formatDate(leadItem.createdAt)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <Sheet open={selectedId !== null} onOpenChange={(o) => !o && setSelectedId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Lead details</SheetTitle>
            <SheetDescription>Contact information and the full chat transcript.</SheetDescription>
          </SheetHeader>
          {selectedId !== null && <LeadDetailPanel id={selectedId} />}
        </SheetContent>
      </Sheet>
    </AdminLayout>
  );
}
