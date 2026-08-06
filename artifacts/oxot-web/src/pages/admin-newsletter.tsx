import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { useQueryClient } from '@tanstack/react-query';
import {
  useListNewsletters,
  getListNewslettersQueryKey,
  useCreateNewsletter,
  useUpdateNewsletter,
  useDeleteNewsletter,
  useScheduleNewsletter,
  useUnscheduleNewsletter,
  useSendNewsletter,
  useGenerateNewsletter,
  useListNewsletterSubscribers,
  getListNewsletterSubscribersQueryKey,
  useDeleteNewsletterSubscriber,
  useGetNewsletterMailStatus,
  getGetNewsletterMailStatusQueryKey,
  useGetSocialStatus,
  getGetSocialStatusQueryKey,
  useSocialPost,
  useListSocialPosts,
  useRetrySocialPost,
  getListSocialPostsQueryKey,
  type Newsletter,
  type NewsletterSubscriber,
} from '@workspace/api-client-react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { useAdminGuard } from '@/hooks/use-admin-guard';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Mail,
  Plus,
  Pencil,
  Trash2,
  Send,
  Clock,
  Sparkles,
  AlertTriangle,
  Users,
  CheckCircle2,
  XCircle,
  Linkedin,
  Twitter,
  Share2,
} from 'lucide-react';

// --- helpers ---------------------------------------------------------------

function fmtDate(value: string | null): string {
  if (!value) return '—';
  return new Date(value).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

function statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'sent':
      return 'default';
    case 'sending':
    case 'scheduled':
      return 'secondary';
    case 'failed':
      return 'destructive';
    default:
      return 'outline';
  }
}

const EDITABLE_STATUSES = new Set(['draft', 'scheduled', 'failed']);

// --- editor dialog ---------------------------------------------------------

function NewsletterDialog({
  open,
  newsletter,
  onClose,
}: {
  open: boolean;
  newsletter: Newsletter | null;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const create = useCreateNewsletter();
  const update = useUpdateNewsletter();
  const generate = useGenerateNewsletter();

  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [preheader, setPreheader] = useState('');
  const [locale, setLocale] = useState('en');
  const [content, setContent] = useState('');
  const [aiTone, setAiTone] = useState('');
  const [initialised, setInitialised] = useState(false);

  // Sync form state whenever a different newsletter is opened.
  if (open && !initialised) {
    setSubject(newsletter?.subject ?? '');
    setTopic(newsletter?.topic ?? '');
    setPreheader(newsletter?.preheader ?? '');
    setLocale(newsletter?.locale ?? 'en');
    setContent(newsletter?.contentMarkdown ?? '');
    setAiTone('');
    setInitialised(true);
  }

  const close = () => {
    setInitialised(false);
    onClose();
  };

  const onGenerate = async () => {
    if (!topic.trim()) {
      toast({ title: 'Add a topic first', description: 'Enter a topic (e.g. "AI Act") to generate a draft.', variant: 'destructive' });
      return;
    }
    try {
      const draft = await generate.mutateAsync({
        data: { topic: topic.trim(), locale, tone: aiTone.trim() || undefined },
      });
      setSubject(draft.subject);
      setPreheader(draft.preheader);
      setContent(draft.contentMarkdown);
      toast({ title: 'Draft generated', description: 'Review and edit before saving.' });
    } catch {
      toast({ title: 'Generation failed', description: 'The AI could not produce a draft. Try again.', variant: 'destructive' });
    }
  };

  const onSave = async () => {
    if (!subject.trim() || !content.trim()) {
      toast({ title: 'Subject and content are required', variant: 'destructive' });
      return;
    }
    const data = {
      subject: subject.trim(),
      preheader: preheader.trim() || null,
      contentMarkdown: content,
      topic: topic.trim() || null,
      locale,
    };
    try {
      if (newsletter) {
        await update.mutateAsync({ id: newsletter.id, data });
      } else {
        await create.mutateAsync({ data });
      }
      await qc.invalidateQueries({ queryKey: getListNewslettersQueryKey() });
      toast({ title: newsletter ? 'Newsletter updated' : 'Draft created' });
      close();
    } catch {
      toast({ title: 'Could not save', description: 'Sending or sent newsletters cannot be edited.', variant: 'destructive' });
    }
  };

  const saving = create.isPending || update.isPending;

  return (
    <Dialog open={open} onOpenChange={(o) => (!o ? close() : undefined)}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{newsletter ? 'Edit newsletter' : 'New newsletter'}</DialogTitle>
          <DialogDescription>
            Draft, generate with AI, then save. You can schedule or send it from the list.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 space-y-1.5">
              <Label htmlFor="nl-topic">Topic</Label>
              <Input id="nl-topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. AI Act, CRA, NIS2, Machinery Regulation" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="nl-locale">Language</Label>
              <Select value={locale} onValueChange={setLocale}>
                <SelectTrigger id="nl-locale"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="nl">Dutch</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border bg-muted/30 p-3 space-y-2">
            <div className="flex items-end gap-2">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="nl-tone" className="text-xs">AI tone (optional)</Label>
                <Input id="nl-tone" value={aiTone} onChange={(e) => setAiTone(e.target.value)} placeholder="e.g. authoritative, practical" />
              </div>
              <Button type="button" variant="secondary" onClick={onGenerate} disabled={generate.isPending}>
                <Sparkles className="w-4 h-4 mr-2" />
                {generate.isPending ? 'Generating…' : 'Generate draft'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Grounds the draft in OXOT's brand and your published content on the topic.</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="nl-subject">Subject</Label>
            <Input id="nl-subject" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Subject line" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nl-preheader">Preheader (inbox preview)</Label>
            <Input id="nl-preheader" value={preheader} onChange={(e) => setPreheader(e.target.value)} placeholder="One-line preview shown in the inbox" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="nl-content">Content (Markdown)</Label>
            <Textarea id="nl-content" value={content} onChange={(e) => setContent(e.target.value)} rows={14} placeholder="## Heading&#10;&#10;Body text with **markdown**…" className="font-mono text-sm" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={close}>Cancel</Button>
          <Button onClick={onSave} disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- schedule dialog -------------------------------------------------------

function ScheduleDialog({
  newsletter,
  onClose,
}: {
  newsletter: Newsletter | null;
  onClose: () => void;
}) {
  const qc = useQueryClient();
  const schedule = useScheduleNewsletter();
  const [when, setWhen] = useState('');

  const onSubmit = async () => {
    if (!newsletter || !when) return;
    const iso = new Date(when).toISOString();
    try {
      await schedule.mutateAsync({ id: newsletter.id, data: { scheduledAt: iso } });
      await qc.invalidateQueries({ queryKey: getListNewslettersQueryKey() });
      toast({ title: 'Newsletter scheduled', description: `Will send on ${fmtDate(iso)}.` });
      onClose();
    } catch {
      toast({ title: 'Could not schedule', description: 'Pick a future time for a draft newsletter.', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={Boolean(newsletter)} onOpenChange={(o) => (!o ? onClose() : undefined)}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule newsletter</DialogTitle>
          <DialogDescription>{newsletter?.subject}</DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="nl-when">Send at</Label>
          <Input id="nl-when" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={onSubmit} disabled={!when || schedule.isPending}>
            {schedule.isPending ? 'Scheduling…' : 'Schedule'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- campaigns tab ---------------------------------------------------------

function CampaignsTab() {
  const qc = useQueryClient();
  const { data: newsletters = [], isLoading } = useListNewsletters({
    query: {
      queryKey: getListNewslettersQueryKey(),
      refetchInterval: (q) => {
        const data = q.state.data as Newsletter[] | undefined;
        return data?.some((n) => n.status === 'sending') ? 3000 : false;
      },
    },
  });
  const del = useDeleteNewsletter();
  const send = useSendNewsletter();
  const unschedule = useUnscheduleNewsletter();

  const [editing, setEditing] = useState<Newsletter | null>(null);
  const [creating, setCreating] = useState(false);
  const [scheduling, setScheduling] = useState<Newsletter | null>(null);

  const refresh = () => qc.invalidateQueries({ queryKey: getListNewslettersQueryKey() });

  const onSend = async (n: Newsletter) => {
    if (!window.confirm(`Send "${n.subject}" now to all confirmed ${n.locale.toUpperCase()} subscribers?`)) return;
    try {
      await send.mutateAsync({ id: n.id });
      await refresh();
      toast({ title: 'Sending started', description: 'Delivery counts will update shortly.' });
    } catch {
      toast({ title: 'Could not send', description: 'This newsletter may already be sending or sent.', variant: 'destructive' });
    }
  };

  const onDelete = async (n: Newsletter) => {
    if (!window.confirm(`Delete "${n.subject}"? This cannot be undone.`)) return;
    try {
      await del.mutateAsync({ id: n.id });
      await refresh();
      toast({ title: 'Newsletter deleted' });
    } catch {
      toast({ title: 'Could not delete', variant: 'destructive' });
    }
  };

  const onUnschedule = async (n: Newsletter) => {
    try {
      await unschedule.mutateAsync({ id: n.id });
      await refresh();
      toast({ title: 'Schedule cancelled', description: 'Back to draft.' });
    } catch {
      toast({ title: 'Could not cancel schedule', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          New newsletter
        </Button>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Recipients</TableHead>
              <TableHead className="text-right">Opens</TableHead>
              <TableHead>When</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow><TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
            )}
            {!isLoading && newsletters.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-10">No newsletters yet. Create your first draft.</TableCell></TableRow>
            )}
            {newsletters.map((n) => {
              const editable = EDITABLE_STATUSES.has(n.status);
              return (
                <TableRow key={n.id}>
                  <TableCell>
                    <div className="font-medium">{n.subject}</div>
                    <div className="text-xs text-muted-foreground">
                      {n.topic ? `${n.topic} · ` : ''}{n.locale.toUpperCase()}
                    </div>
                  </TableCell>
                  <TableCell><Badge variant={statusVariant(n.status)} className="capitalize">{n.status}</Badge></TableCell>
                  <TableCell className="text-right tabular-nums">
                    {n.status === 'sent' || n.status === 'sending' ? `${n.sentCount}/${n.recipientCount}` : '—'}
                    {n.failedCount > 0 && <span className="text-destructive text-xs ml-1">({n.failedCount} failed)</span>}
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{n.status === 'sent' ? n.openedCount : '—'}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {n.status === 'scheduled' ? `Scheduled ${fmtDate(n.scheduledAt)}` : n.status === 'sent' ? `Sent ${fmtDate(n.sentAt)}` : fmtDate(n.createdAt)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1">
                      {editable && (
                        <Button size="icon" variant="ghost" aria-label="Edit newsletter" title="Edit" onClick={() => setEditing(n)}><Pencil className="w-4 h-4" /></Button>
                      )}
                      {editable && (
                        <Button size="icon" variant="ghost" aria-label="Send now" title="Send now" onClick={() => onSend(n)}><Send className="w-4 h-4" /></Button>
                      )}
                      {n.status === 'scheduled' ? (
                        <Button size="icon" variant="ghost" aria-label="Cancel schedule" title="Cancel schedule" onClick={() => onUnschedule(n)}><Clock className="w-4 h-4 text-amber-600" /></Button>
                      ) : editable ? (
                        <Button size="icon" variant="ghost" aria-label="Schedule newsletter" title="Schedule" onClick={() => setScheduling(n)}><Clock className="w-4 h-4" /></Button>
                      ) : null}
                      <Button size="icon" variant="ghost" aria-label="Delete newsletter" title="Delete" onClick={() => onDelete(n)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {(creating || editing) && (
        <NewsletterDialog
          open={creating || Boolean(editing)}
          newsletter={editing}
          onClose={() => { setCreating(false); setEditing(null); }}
        />
      )}
      <ScheduleDialog newsletter={scheduling} onClose={() => setScheduling(null)} />
    </div>
  );
}

// --- subscribers tab -------------------------------------------------------

function SubscribersTab() {
  const qc = useQueryClient();
  const { data: subscribers = [], isLoading } = useListNewsletterSubscribers(undefined, {
    query: { queryKey: getListNewsletterSubscribersQueryKey() },
  });
  const del = useDeleteNewsletterSubscriber();
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('all');

  const filtered = useMemo(() => {
    return subscribers.filter((s) => {
      if (status !== 'all' && s.status !== status) return false;
      if (q && !s.email.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [subscribers, q, status]);

  const counts = useMemo(() => {
    return {
      confirmed: subscribers.filter((s) => s.status === 'confirmed').length,
      pending: subscribers.filter((s) => s.status === 'pending').length,
      unsubscribed: subscribers.filter((s) => s.status === 'unsubscribed').length,
    };
  }, [subscribers]);

  const onDelete = async (s: NewsletterSubscriber) => {
    if (!window.confirm(`Delete ${s.email}? This permanently removes their record (GDPR erasure).`)) return;
    try {
      await del.mutateAsync({ id: s.id });
      await qc.invalidateQueries({ queryKey: getListNewsletterSubscribersQueryKey() });
      toast({ title: 'Subscriber deleted' });
    } catch {
      toast({ title: 'Could not delete', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border bg-card p-4">
          <div className="text-2xl font-bold tabular-nums">{counts.confirmed}</div>
          <div className="text-xs text-muted-foreground">Confirmed</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-2xl font-bold tabular-nums">{counts.pending}</div>
          <div className="text-xs text-muted-foreground">Pending</div>
        </div>
        <div className="rounded-lg border bg-card p-4">
          <div className="text-2xl font-bold tabular-nums">{counts.unsubscribed}</div>
          <div className="text-xs text-muted-foreground">Unsubscribed</div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        <Input placeholder="Search by email…" value={q} onChange={(e) => setQ(e.target.value)} className="max-w-xs" />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="unsubscribed">Unsubscribed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Language</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Confirmed</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow><TableCell colSpan={6}><Skeleton className="h-8 w-full" /></TableCell></TableRow>
            )}
            {!isLoading && filtered.length === 0 && (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-10">No subscribers found.</TableCell></TableRow>
            )}
            {filtered.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium">{s.email}</TableCell>
                <TableCell>
                  <Badge variant={s.status === 'confirmed' ? 'default' : s.status === 'pending' ? 'outline' : 'secondary'} className="capitalize">{s.status}</Badge>
                </TableCell>
                <TableCell className="uppercase text-sm">{s.locale}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{s.source ?? '—'}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{fmtDate(s.confirmedAt)}</TableCell>
                <TableCell className="text-right">
                  <Button size="icon" variant="ghost" aria-label="Delete subscriber" title="Delete" onClick={() => onDelete(s)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// --- social tab ------------------------------------------------------------

function PlatformStatusCard({
  icon,
  name,
  configured,
  description,
}: {
  icon: React.ReactNode;
  name: string;
  configured: boolean;
  description: string;
}) {
  return (
    <div className={`rounded-lg border p-4 space-y-2 ${configured ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}>
      <div className="flex items-center gap-2">
        {icon}
        <span className="font-semibold text-sm">{name}</span>
        {configured ? (
          <CheckCircle2 className="w-4 h-4 text-green-600 ml-auto" />
        ) : (
          <XCircle className="w-4 h-4 text-amber-600 ml-auto" />
        )}
      </div>
      <p className="text-xs text-muted-foreground">{description}</p>
      {!configured && (
        <p className="text-xs font-medium text-amber-800">
          Enter and enable this platform's credentials on the{' '}
          <Link href="/admin/integrations" className="underline font-semibold">Integrations</Link> page.
        </p>
      )}
    </div>
  );
}

function RecentPostsLog() {
  const qc = useQueryClient();
  const { data: posts = [], isLoading } = useListSocialPosts({
    query: { queryKey: getListSocialPostsQueryKey() },
  });
  const retry = useRetrySocialPost();

  const handleRetry = async (id: number) => {
    try {
      const outcome = await retry.mutateAsync({ id });
      await qc.invalidateQueries({ queryKey: getListSocialPostsQueryKey() });
      toast({
        title: outcome.success ? 'Retry succeeded' : 'Retry failed',
        description: outcome.success
          ? `Reposted to ${outcome.platform}.`
          : outcome.error ?? 'The post could not be sent.',
        variant: outcome.success ? undefined : 'destructive',
      });
    } catch {
      toast({ title: 'Retry failed', description: 'Could not retry the post.', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">Recent posts</h3>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => qc.invalidateQueries({ queryKey: getListSocialPostsQueryKey() })}
        >
          Refresh
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Every post — manual or auto-shared on publish — is logged here. Failures show the reason so you can act on expired tokens or quota limits.
      </p>
      {isLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : posts.length === 0 ? (
        <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
          No posts yet. Posts appear here after you publish with sharing on, or use the composer above.
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map((p) => (
            <div
              key={p.id}
              className={`flex items-start gap-2 rounded-md border p-3 text-sm ${p.success ? 'border-green-200 bg-green-50' : 'border-destructive/30 bg-destructive/5'}`}
            >
              {p.success ? (
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
              ) : (
                <XCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {p.platform === 'linkedin' ? (
                    <Linkedin className="w-3.5 h-3.5 text-[#0077B5]" />
                  ) : (
                    <Twitter className="w-3.5 h-3.5" />
                  )}
                  <span className="font-medium capitalize">{p.platform}</span>
                  <Badge variant="outline" className="capitalize text-[10px]">{p.source}</Badge>
                  <span className="text-xs text-muted-foreground ml-auto">{fmtDate(p.createdAt)}</span>
                </div>
                {p.error ? (
                  <p className="text-xs text-destructive mt-1 break-words">{p.error}</p>
                ) : (
                  p.text && <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{p.text}</p>
                )}
                {!p.success && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="mt-2 h-7 text-xs"
                    disabled={retry.isPending}
                    onClick={() => handleRetry(p.id)}
                  >
                    {retry.isPending ? 'Retrying…' : 'Retry'}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TokenStatusCard({
  icon,
  name,
  status,
  reauthHint,
}: {
  icon: React.ReactNode;
  name: string;
  status: { configured: boolean; valid?: boolean | null; expiresInDays?: number | null; expiresAt?: string | null; error?: string | null } | undefined;
  reauthHint: string;
}) {
  if (!status?.configured) {
    return (
      <div className="rounded-lg border p-4 space-y-1 border-muted bg-muted/30">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-semibold text-sm">{name}</span>
          <span className="ml-auto text-xs text-muted-foreground">Not configured</span>
        </div>
        <p className="text-xs text-muted-foreground">Add credentials above to enable posting and token checks.</p>
      </div>
    );
  }

  const days = status.expiresInDays ?? null;
  const expiringSoon = status.valid === true && days !== null && days < 7;
  const invalid = status.valid === false;
  // amber for invalid or expiring soon; green for healthy; neutral when indeterminate
  const tone = invalid || expiringSoon
    ? 'border-amber-300 bg-amber-50'
    : status.valid === true
      ? 'border-green-200 bg-green-50'
      : 'border-muted bg-muted/30';

  return (
    <div className={`rounded-lg border p-4 space-y-2 ${tone}`}>
      <div className="flex items-center gap-2">
        {icon}
        <span className="font-semibold text-sm">{name}</span>
        {invalid ? (
          <span className="ml-auto flex items-center gap-1 text-xs font-medium text-amber-700"><AlertTriangle className="w-4 h-4" /> Action needed</span>
        ) : status.valid === true ? (
          <span className="ml-auto flex items-center gap-1 text-xs font-medium text-green-700"><CheckCircle2 className="w-4 h-4" /> Valid</span>
        ) : (
          <span className="ml-auto text-xs text-muted-foreground">Unverified</span>
        )}
      </div>

      {status.valid === true && days !== null && (
        <p className={`text-xs font-medium ${expiringSoon ? 'text-amber-800' : 'text-muted-foreground'}`}>
          {days === 0 ? 'Expires today' : `Expires in ${days} day${days === 1 ? '' : 's'}`}
          {status.expiresAt ? ` · ${fmtDate(status.expiresAt)}` : ''}
        </p>
      )}
      {status.valid === true && days === null && (
        <p className="text-xs text-muted-foreground">Credentials accepted.</p>
      )}

      {(expiringSoon || invalid) && (
        <p className="text-xs text-amber-800">
          {invalid ? 'Re-authorize to resume posting. ' : 'Re-authorize soon to avoid interruption. '}
          {reauthHint}
        </p>
      )}

      {status.error && (
        <p className="text-xs text-muted-foreground">{status.error}</p>
      )}
    </div>
  );
}

function SocialTab() {
  const qc = useQueryClient();
  const { data: status, isLoading } = useGetSocialStatus(undefined, {
    query: { queryKey: getGetSocialStatusQueryKey() },
  });
  const { data: liveStatus, isLoading: liveLoading, isFetching: liveFetching, refetch: refetchLive } = useGetSocialStatus(
    { validate: true },
    { query: { queryKey: getGetSocialStatusQueryKey({ validate: true }), staleTime: 60_000 } },
  );
  const post = useSocialPost();

  const [text, setText] = useState('');
  const [platforms, setPlatforms] = useState<Set<'linkedin' | 'x'>>(new Set());
  const [results, setResults] = useState<{ platform: string; success: boolean; error: string | null }[] | null>(null);

  const linkedInConfigured = status?.linkedin?.configured ?? false;
  const xConfigured = status?.x?.configured ?? false;

  const togglePlatform = (p: 'linkedin' | 'x') => {
    setPlatforms((prev) => {
      const next = new Set(prev);
      next.has(p) ? next.delete(p) : next.add(p);
      return next;
    });
  };

  const onPost = async () => {
    if (!text.trim() || platforms.size === 0) return;
    setResults(null);
    try {
      const res = await post.mutateAsync({ data: { text: text.trim(), platforms: Array.from(platforms) } });
      setResults(res.results);
      await qc.invalidateQueries({ queryKey: getListSocialPostsQueryKey() });
      const allOk = res.results.every((r) => r.success);
      toast({
        title: allOk ? 'Posted successfully' : 'Some posts failed',
        variant: allOk ? 'default' : 'destructive',
      });
    } catch {
      toast({ title: 'Could not post', variant: 'destructive' });
    }
  };

  if (isLoading) return <Skeleton className="h-48 w-full" />;

  const anyConfigured = linkedInConfigured || xConfigured;

  return (
    <div className="space-y-6">
      {/* Status cards */}
      <div>
        <h3 className="font-semibold text-sm mb-3">Platform credentials</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <PlatformStatusCard
            icon={<Linkedin className="w-4 h-4 text-[#0077B5]" />}
            name="LinkedIn"
            configured={linkedInConfigured}
            description="Posts as your organization page. Author URN format: urn:li:organization:12345"
          />
          <PlatformStatusCard
            icon={<Twitter className="w-4 h-4" />}
            name="X (Twitter)"
            configured={xConfigured}
            description="Posts via OAuth 1.0a. Requires an X developer app with read+write permissions. Note: posting requires the X Basic ($100/mo) or higher plan."
          />
        </div>
      </div>

      {/* Token status — live validation */}
      {(linkedInConfigured || xConfigured) && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Token status</h3>
            <Button size="sm" variant="ghost" onClick={() => refetchLive()} disabled={liveFetching}>
              {liveFetching ? 'Checking…' : 'Re-check'}
            </Button>
          </div>
          {liveLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" aria-live="polite" aria-busy={liveFetching}>
              {linkedInConfigured && (
                <TokenStatusCard
                  icon={<Linkedin className="w-4 h-4 text-[#0077B5]" />}
                  name="LinkedIn"
                  status={liveStatus?.linkedin}
                  reauthHint="Generate a fresh LINKEDIN_ACCESS_TOKEN and update the secret."
                />
              )}
              {xConfigured && (
                <TokenStatusCard
                  icon={<Twitter className="w-4 h-4" />}
                  name="X (Twitter)"
                  status={liveStatus?.x}
                  reauthHint="Regenerate the X access token/secret and update the secrets."
                />
              )}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            LinkedIn tokens expire ~60 days after they're issued. Re-check periodically so posts don't stop silently.
          </p>
        </div>
      )}

      {/* Auto-share info */}
      <div className="rounded-lg border bg-muted/30 p-4 text-sm space-y-1">
        <p className="font-medium flex items-center gap-2"><Share2 className="w-4 h-4" /> Auto-share on publish</p>
        <p className="text-muted-foreground text-xs">
          When you publish a page from the CMS editor, the Publish button opens a dialog where you can optionally post an announcement to any configured platform — LinkedIn, X, or both.
          The post text defaults to the page title; you can customise it before publishing.
        </p>
      </div>

      {/* Manual composer */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm">Compose a post</h3>
        {!anyConfigured ? (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            Add credentials for at least one platform above to enable posting.
          </div>
        ) : (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="social-text">Post text</Label>
              <Textarea
                id="social-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                maxLength={3000}
                placeholder="What would you like to share?"
              />
              <p className="text-xs text-muted-foreground text-right">{text.length}/3000</p>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">Post to:</span>
              {linkedInConfigured && (
                <label className="flex items-center gap-1.5 cursor-pointer select-none text-sm">
                  <input
                    type="checkbox"
                    checked={platforms.has('linkedin')}
                    onChange={() => togglePlatform('linkedin')}
                    className="rounded"
                  />
                  <Linkedin className="w-4 h-4 text-[#0077B5]" />
                  LinkedIn
                </label>
              )}
              {xConfigured && (
                <label className="flex items-center gap-1.5 cursor-pointer select-none text-sm">
                  <input
                    type="checkbox"
                    checked={platforms.has('x')}
                    onChange={() => togglePlatform('x')}
                    className="rounded"
                  />
                  <Twitter className="w-4 h-4" />
                  X
                </label>
              )}
            </div>

            <Button
              onClick={onPost}
              disabled={!text.trim() || platforms.size === 0 || post.isPending}
            >
              <Send className="w-4 h-4 mr-2" />
              {post.isPending ? 'Posting…' : 'Post now'}
            </Button>

            {results && (
              <div className="space-y-2 pt-1">
                {results.map((r) => (
                  <div
                    key={r.platform}
                    className={`flex items-start gap-2 rounded-md border p-3 text-sm ${r.success ? 'border-green-200 bg-green-50' : 'border-destructive/30 bg-destructive/5'}`}
                  >
                    {r.success ? (
                      <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                    )}
                    <div>
                      <span className="font-medium capitalize">{r.platform}</span>
                      {r.error && <p className="text-xs text-muted-foreground mt-0.5">{r.error}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Recent posts log */}
      <RecentPostsLog />
    </div>
  );
}

// --- page ------------------------------------------------------------------

export default function AdminNewsletter() {
  useAdminGuard();
  const mailStatus = useGetNewsletterMailStatus({
    query: { queryKey: getGetNewsletterMailStatusQueryKey() },
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Mail className="w-6 h-6 text-primary" />
          <div>
            <h1 className="font-display font-bold text-2xl">Newsletter & Social</h1>
            <p className="text-sm text-muted-foreground">Create, schedule and send compliance updates — and share them on social media.</p>
          </div>
        </div>

        {mailStatus.data && !mailStatus.data.configured && (
          <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4 text-amber-900">
            <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />
            <div className="text-sm">
              <div className="font-semibold">Email sending isn't connected yet</div>
              <p>You can create, edit and schedule newsletters now. To actually deliver confirmation emails and campaigns, connect the Resend email provider. Until then, sends are recorded but not delivered.</p>
            </div>
          </div>
        )}

        <Tabs defaultValue="campaigns">
          <TabsList>
            <TabsTrigger value="campaigns"><Mail className="w-4 h-4 mr-2" />Campaigns</TabsTrigger>
            <TabsTrigger value="subscribers"><Users className="w-4 h-4 mr-2" />Subscribers</TabsTrigger>
            <TabsTrigger value="social"><Share2 className="w-4 h-4 mr-2" />Social</TabsTrigger>
          </TabsList>
          <TabsContent value="campaigns" className="mt-4"><CampaignsTab /></TabsContent>
          <TabsContent value="subscribers" className="mt-4"><SubscribersTab /></TabsContent>
          <TabsContent value="social" className="mt-4"><SocialTab /></TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
