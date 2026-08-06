import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  useListAffiliateLinks,
  getListAffiliateLinksQueryKey,
  useCreateAffiliateLink,
  useUpdateAffiliateLink,
  useDeleteAffiliateLink,
  useSuggestAffiliateLinks,
  useApplyAffiliateLinks,
  useListSeoPages,
  getListSeoPagesQueryKey,
  useUpdateSeoPage,
  type AffiliateLink,
  type LinkSuggestion,
  type SeoPage,
} from '@workspace/api-client-react';
import { AdminLayout } from '@/components/layout/admin-layout';
import { Field } from '@/components/admin/field';
import { useAdminGuard } from '@/hooks/use-admin-guard';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Link2, Plus, Pencil, Trash2, Sparkles, Search } from 'lucide-react';

// --- Affiliate link editor dialog ----------------------------------------

interface LinkFormState {
  name: string;
  targetUrl: string;
  description: string;
  sponsored: boolean;
  active: boolean;
  keywordsEn: string;
  keywordsNl: string;
}

function keywordsToText(link: AffiliateLink | null, locale: string): string {
  if (!link) return '';
  return link.keywords
    .filter((k) => k.locale === locale)
    .map((k) => k.keyword)
    .join(', ');
}

function LinkDialog({
  open,
  link,
  onClose,
  onSaved,
}: {
  open: boolean;
  link: AffiliateLink | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<LinkFormState>({
    name: '',
    targetUrl: '',
    description: '',
    sponsored: true,
    active: true,
    keywordsEn: '',
    keywordsNl: '',
  });

  useEffect(() => {
    if (open) {
      setForm({
        name: link?.name ?? '',
        targetUrl: link?.targetUrl ?? '',
        description: link?.description ?? '',
        sponsored: link?.sponsored ?? true,
        active: link?.active ?? true,
        keywordsEn: keywordsToText(link, 'en'),
        keywordsNl: keywordsToText(link, 'nl'),
      });
    }
  }, [open, link]);

  const create = useCreateAffiliateLink();
  const update = useUpdateAffiliateLink();
  const pending = create.isPending || update.isPending;

  const buildInput = () => {
    const parse = (raw: string, locale: 'en' | 'nl') =>
      raw
        .split(/[,\n]/)
        .map((s) => s.trim())
        .filter(Boolean)
        .map((keyword) => ({ keyword, locale, active: true }));
    return {
      name: form.name.trim(),
      targetUrl: form.targetUrl.trim(),
      description: form.description.trim() || null,
      sponsored: form.sponsored,
      active: form.active,
      keywords: [...parse(form.keywordsEn, 'en'), ...parse(form.keywordsNl, 'nl')],
    };
  };

  const submit = async () => {
    if (!form.name.trim() || !form.targetUrl.trim()) {
      toast({ title: 'Name and target URL are required', variant: 'destructive' });
      return;
    }
    try {
      if (link) {
        await update.mutateAsync({ id: link.id, data: buildInput() });
      } else {
        await create.mutateAsync({ data: buildInput() });
      }
      toast({ title: link ? 'Link updated' : 'Link created' });
      onSaved();
    } catch {
      toast({ title: 'Could not save link', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{link ? 'Edit affiliate link' : 'New affiliate link'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Field label="Name" className="space-y-2">
            <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Partner name"
            />
          </Field>
          <Field label="Target URL" className="space-y-2">
            <Input
              value={form.targetUrl}
              onChange={(e) => setForm((f) => ({ ...f, targetUrl: e.target.value }))}
              placeholder="https://partner.example.com/offer"
            />
          </Field>
          <Field label="Description" className="space-y-2">
            <Textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Internal note about this partner"
              rows={2}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Keywords (EN)" className="space-y-2">
              <Textarea
                value={form.keywordsEn}
                onChange={(e) => setForm((f) => ({ ...f, keywordsEn: e.target.value }))}
                placeholder="comma or line separated"
                rows={3}
              />
            </Field>
            <Field label="Keywords (NL)" className="space-y-2">
              <Textarea
                value={form.keywordsNl}
                onChange={(e) => setForm((f) => ({ ...f, keywordsNl: e.target.value }))}
                placeholder="komma of regel gescheiden"
                rows={3}
              />
            </Field>
          </div>
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <Switch
                id="affiliate-link-sponsored"
                checked={form.sponsored}
                onCheckedChange={(v) => setForm((f) => ({ ...f, sponsored: v }))}
              />
              <Label htmlFor="affiliate-link-sponsored">Sponsored</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="affiliate-link-active"
                checked={form.active}
                onCheckedChange={(v) => setForm((f) => ({ ...f, active: v }))}
              />
              <Label htmlFor="affiliate-link-active">Active</Label>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={pending}>
            {pending ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// --- Affiliate links tab -------------------------------------------------

function AffiliateLinksTab({ enabled }: { enabled: boolean }) {
  const queryClient = useQueryClient();
  const { data, isLoading } = useListAffiliateLinks({
    query: { queryKey: getListAffiliateLinksQueryKey(), enabled },
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AffiliateLink | null>(null);
  const del = useDeleteAffiliateLink();

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: getListAffiliateLinksQueryKey() });
    setDialogOpen(false);
  };

  const remove = async (id: number) => {
    try {
      await del.mutateAsync({ id });
      toast({ title: 'Link deleted' });
      queryClient.invalidateQueries({ queryKey: getListAffiliateLinksQueryKey() });
    } catch {
      toast({ title: 'Could not delete link', variant: 'destructive' });
    }
  };

  const links = data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Partner links and the keywords the AI can turn into tracked links.
        </p>
        <Button
          onClick={() => {
            setEditing(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4 mr-2" /> New link
        </Button>
      </div>

      {isLoading ? (
        <Skeleton className="h-48 w-full rounded-xl" />
      ) : links.length === 0 ? (
        <div className="bg-card border rounded-xl p-10 text-center text-muted-foreground">
          No affiliate links yet. Create one to start tracking partner clicks.
        </div>
      ) : (
        <div className="bg-card border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Keywords</TableHead>
                <TableHead className="text-right">Clicks</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {links.map((link) => (
                <TableRow key={link.id}>
                  <TableCell>
                    <div className="font-medium">{link.name}</div>
                    <a
                      href={link.targetUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-muted-foreground hover:text-primary truncate block max-w-[220px]"
                    >
                      {link.targetUrl}
                    </a>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[260px]">
                      {link.keywords.length === 0 ? (
                        <span className="text-xs text-muted-foreground">—</span>
                      ) : (
                        link.keywords.map((k) => (
                          <Badge key={k.id} variant="secondary" className="text-xs">
                            {k.keyword}
                            <span className="ml-1 opacity-60 uppercase">{k.locale}</span>
                          </Badge>
                        ))
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right tabular-nums">{link.clickCount}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Badge variant={link.active ? 'default' : 'outline'}>
                        {link.active ? 'Active' : 'Off'}
                      </Badge>
                      {link.sponsored && (
                        <Badge variant="outline" className="text-xs">
                          Sponsored
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1 justify-end">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => {
                          setEditing(link);
                          setDialogOpen(true);
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => remove(link.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <LinkDialog
        open={dialogOpen}
        link={editing}
        onClose={() => setDialogOpen(false)}
        onSaved={refresh}
      />
    </div>
  );
}

// --- AI link insertion tab ----------------------------------------------

function AiInsertionTab({ pages, enabled }: { pages: SeoPage[]; enabled: boolean }) {
  const [pageId, setPageId] = useState<string>('');
  const [suggestions, setSuggestions] = useState<LinkSuggestion[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const suggest = useSuggestAffiliateLinks();
  const apply = useApplyAffiliateLinks();

  const runSuggest = async () => {
    if (!pageId) return;
    try {
      const res = await suggest.mutateAsync({ data: { pageId: Number(pageId) } });
      setSuggestions(res.suggestions);
      setSelected(new Set(res.suggestions.map((_, i) => i)));
      if (res.suggestions.length === 0) {
        toast({ title: 'No natural link placements found for this page.' });
      }
    } catch {
      toast({ title: 'Could not generate suggestions', variant: 'destructive' });
    }
  };

  const runApply = async () => {
    const chosen = suggestions.filter((_, i) => selected.has(i));
    if (chosen.length === 0) return;
    try {
      await apply.mutateAsync({
        data: {
          pageId: Number(pageId),
          insertions: chosen.map((s) => ({
            sectionIndex: s.sectionIndex,
            linkId: s.linkId,
            keyword: s.keyword,
          })),
        },
      });
      toast({ title: `Inserted ${chosen.length} link(s) into the page draft.` });
      setSuggestions([]);
      setSelected(new Set());
    } catch {
      toast({ title: 'Could not apply links', variant: 'destructive' });
    }
  };

  const toggle = (i: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Let the assistant propose partner-link placements in a page's draft copy. Review, then apply
        the ones you approve — they land in the draft for you to publish.
      </p>
      <div className="flex items-end gap-3">
        <Field label="Page" className="space-y-2 flex-1 max-w-sm">
          {(id) => (
            <Select value={pageId} onValueChange={setPageId} disabled={!enabled}>
              <SelectTrigger id={id}>
                <SelectValue placeholder="Choose a page" />
              </SelectTrigger>
              <SelectContent>
                {pages.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.title} · /{p.slug} ({p.locale})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </Field>
        <Button onClick={runSuggest} disabled={!pageId || suggest.isPending}>
          <Sparkles className="w-4 h-4 mr-2" />
          {suggest.isPending ? 'Analyzing…' : 'Suggest links'}
        </Button>
      </div>

      {suggestions.length > 0 && (
        <div className="bg-card border rounded-xl divide-y">
          {suggestions.map((s, i) => (
            <label key={i} className="flex items-start gap-3 p-4 cursor-pointer">
              <input
                type="checkbox"
                checked={selected.has(i)}
                onChange={() => toggle(i)}
                className="mt-1"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary">{s.linkName}</Badge>
                  <span className="text-sm font-medium">"{s.keyword}"</span>
                  <span className="text-xs text-muted-foreground">
                    section {s.sectionIndex + 1} · {s.sectionType}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{s.snippet}</p>
              </div>
            </label>
          ))}
          <div className="p-4 flex justify-end">
            <Button onClick={runApply} disabled={apply.isPending || selected.size === 0}>
              {apply.isPending ? 'Applying…' : `Apply ${selected.size} to draft`}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- SEO metadata tab ----------------------------------------------------

interface SeoFormState {
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  canonicalUrl: string;
  metaKeywords: string;
  noindex: boolean;
  visibility: 'public' | 'members' | 'admin';
  regulationKeys: string;
}

function SeoDialog({
  page,
  onClose,
  onSaved,
}: {
  page: SeoPage | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<SeoFormState>({
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    canonicalUrl: '',
    metaKeywords: '',
    noindex: false,
    visibility: 'public',
    regulationKeys: '',
  });
  const update = useUpdateSeoPage();

  useEffect(() => {
    if (page) {
      setForm({
        ogTitle: page.ogTitle ?? '',
        ogDescription: page.ogDescription ?? '',
        ogImage: page.ogImage ?? '',
        canonicalUrl: page.canonicalUrl ?? '',
        metaKeywords: page.metaKeywords ?? '',
        noindex: page.noindex ?? false,
        visibility: page.visibility ?? 'public',
        regulationKeys: (page.regulationKeys ?? []).join(', '),
      });
    }
  }, [page]);

  const submit = async () => {
    if (!page) return;
    try {
      await update.mutateAsync({
        id: page.id,
        data: {
          ogTitle: form.ogTitle.trim() || null,
          ogDescription: form.ogDescription.trim() || null,
          ogImage: form.ogImage.trim() || null,
          canonicalUrl: form.canonicalUrl.trim() || null,
          metaKeywords: form.metaKeywords.trim() || null,
          noindex: form.noindex,
          visibility: form.visibility,
          regulationKeys: form.regulationKeys
            .split(',')
            .map((k) => k.trim())
            .filter((k) => k.length > 0),
        },
      });
      toast({ title: 'SEO metadata saved' });
      onSaved();
    } catch {
      toast({ title: 'Could not save metadata', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={!!page} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>SEO · {page?.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-lg border bg-muted/40 p-3 space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Meta title &amp; description
            </p>
            <p className="text-sm">
              {page?.seoTitle || <span className="italic opacity-60">Uses the page title</span>}
            </p>
            <p className="text-sm text-muted-foreground">
              {page?.seoDescription || <span className="italic opacity-60">No description set</span>}
            </p>
            <p className="text-xs text-muted-foreground pt-1">
              Edit these in the page editor — they are versioned with the page content.
            </p>
          </div>
          <Field label="Meta keywords" className="space-y-2">
            <Input
              value={form.metaKeywords}
              onChange={(e) => setForm((f) => ({ ...f, metaKeywords: e.target.value }))}
              placeholder="comma, separated, keywords"
            />
          </Field>
          <Field label="Canonical URL" className="space-y-2">
            <Input
              value={form.canonicalUrl}
              onChange={(e) => setForm((f) => ({ ...f, canonicalUrl: e.target.value }))}
              placeholder="https://oxot.eu/…"
            />
          </Field>
          <div className="border-t pt-4 space-y-4">
            <p className="text-sm font-medium">Social sharing (Open Graph)</p>
            <Field label="OG title" className="space-y-2">
              <Input
                value={form.ogTitle}
                onChange={(e) => setForm((f) => ({ ...f, ogTitle: e.target.value }))}
              />
            </Field>
            <Field label="OG description" className="space-y-2">
              <Textarea
                value={form.ogDescription}
                onChange={(e) => setForm((f) => ({ ...f, ogDescription: e.target.value }))}
                rows={2}
              />
            </Field>
            <Field label="OG image URL" className="space-y-2">
              <Input
                value={form.ogImage}
                onChange={(e) => setForm((f) => ({ ...f, ogImage: e.target.value }))}
                placeholder="https://…/share.png"
              />
            </Field>
          </div>
          <div className="border-t pt-4 space-y-4">
            <p className="text-sm font-medium">Access</p>
            <Field label="Visibility" className="space-y-2">
              <select
                className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                value={form.visibility}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    visibility: e.target.value as SeoFormState['visibility'],
                  }))
                }
                aria-label="Page visibility"
              >
                <option value="public">Public — anyone can view</option>
                <option value="members">Members — requires sign-in</option>
                <option value="admin">Admin — site admins only</option>
              </select>
            </Field>
            <Field label="Regulation tracks" className="space-y-2">
              <Input
                value={form.regulationKeys}
                onChange={(e) => setForm((f) => ({ ...f, regulationKeys: e.target.value }))}
                placeholder="cra, ai_act (catalogue regulation keys, comma-separated)"
              />
            </Field>
          </div>
          <div className="flex items-center gap-2 border-t pt-4">
            <Switch
              id="seo-noindex"
              checked={form.noindex}
              onCheckedChange={(v) => setForm((f) => ({ ...f, noindex: v }))}
              aria-describedby="seo-noindex-hint"
            />
            <div>
              <Label htmlFor="seo-noindex">Hide from search engines</Label>
              <p id="seo-noindex-hint" className="text-xs text-muted-foreground">
                Adds noindex,nofollow to this page.
              </p>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={update.isPending}>
            Cancel
          </Button>
          <Button onClick={submit} disabled={update.isPending}>
            {update.isPending ? 'Saving…' : 'Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SeoTab({ pages, isLoading, onSaved }: { pages: SeoPage[]; isLoading: boolean; onSaved: () => void }) {
  const [editing, setEditing] = useState<SeoPage | null>(null);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Per-page titles, meta descriptions, and social cards rendered on the public site.
      </p>
      {isLoading ? (
        <Skeleton className="h-48 w-full rounded-xl" />
      ) : (
        <div className="bg-card border rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page</TableHead>
                <TableHead>Meta title</TableHead>
                <TableHead>Indexing</TableHead>
                <TableHead className="w-16" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {pages.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="font-medium">{p.title}</div>
                    <div className="text-xs text-muted-foreground">
                      /{p.slug} · {p.locale} · {p.status}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[280px]">
                    <span className="text-sm text-muted-foreground line-clamp-1">
                      {p.seoTitle || <span className="italic opacity-60">Uses page title</span>}
                    </span>
                  </TableCell>
                  <TableCell>
                    {p.noindex ? (
                      <Badge variant="outline">noindex</Badge>
                    ) : (
                      <Badge variant="secondary">indexed</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button size="icon" variant="ghost" onClick={() => setEditing(p)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      <SeoDialog
        page={editing}
        onClose={() => setEditing(null)}
        onSaved={() => {
          setEditing(null);
          onSaved();
        }}
      />
    </div>
  );
}

// --- Page ----------------------------------------------------------------

export default function AdminSeo() {
  const { authenticated } = useAdminGuard();
  const queryClient = useQueryClient();
  const { data: pages, isLoading: pagesLoading } = useListSeoPages({
    query: { queryKey: getListSeoPagesQueryKey(), enabled: authenticated },
  });

  const seoPages = useMemo(() => pages ?? [], [pages]);

  if (!authenticated) return null;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Link2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold">Affiliate &amp; SEO</h1>
            <p className="text-sm text-muted-foreground">
              Partner links, AI-assisted placement, and per-page search metadata.
            </p>
          </div>
        </div>

        <Tabs defaultValue="links">
          <TabsList>
            <TabsTrigger value="links">
              <Link2 className="w-4 h-4 mr-2" /> Affiliate Links
            </TabsTrigger>
            <TabsTrigger value="ai">
              <Sparkles className="w-4 h-4 mr-2" /> AI Link Insertion
            </TabsTrigger>
            <TabsTrigger value="seo">
              <Search className="w-4 h-4 mr-2" /> SEO Metadata
            </TabsTrigger>
          </TabsList>
          <TabsContent value="links" className="mt-6">
            <AffiliateLinksTab enabled={authenticated} />
          </TabsContent>
          <TabsContent value="ai" className="mt-6">
            <AiInsertionTab pages={seoPages} enabled={authenticated} />
          </TabsContent>
          <TabsContent value="seo" className="mt-6">
            <SeoTab
              pages={seoPages}
              isLoading={pagesLoading}
              onSaved={() =>
                queryClient.invalidateQueries({ queryKey: getListSeoPagesQueryKey() })
              }
            />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
