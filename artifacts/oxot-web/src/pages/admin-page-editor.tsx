import { useEffect, useState } from "react";
import { Link } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetAdminPage,
  getGetAdminPageQueryKey,
  useSaveAdminPageDraft,
  usePublishAdminPage,
  useTranslateAdminPage,
  useListAdminPageVersions,
  getListAdminPageVersionsQueryKey,
  useRestoreAdminPageVersion,
  getListAdminPagesQueryKey,
  useGetSocialStatus,
  getGetSocialStatusQueryKey,
  listSocialPosts,
  type SocialPostLogEntry,
} from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Field } from "@/components/admin/field";
import { SectionRenderer } from "@/components/sections/section-renderer";
import { ObjectFields } from "@/components/admin/json-fields";
import { useAdminGuard } from "@/hooks/use-admin-guard";
import { SECTION_TYPES, SECTION_LABELS, sectionTemplate } from "@/lib/section-templates";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  ArrowUp,
  ArrowDown,
  Trash2,
  Plus,
  Save,
  Send,
  Languages,
  History,
  ExternalLink,
  RotateCcw,
  Linkedin,
  Twitter,
} from "lucide-react";

interface EditorSection {
  type: string;
  order: number;
  data: Record<string, unknown>;
}

function formatDate(value: string): string {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

// --- Publish with Social Share dialog --------------------------------------

function PublishDialog({
  open,
  pageTitle,
  pageUrl,
  onClose,
  onPublish,
  isPending,
}: {
  open: boolean;
  pageTitle: string;
  pageUrl: string;
  onClose: () => void;
  onPublish: (opts: { shareLinkedIn: boolean; shareX: boolean; shareText: string }) => void;
  isPending: boolean;
}) {
  const { data: socialStatus } = useGetSocialStatus(undefined, {
    query: { queryKey: getGetSocialStatusQueryKey() },
  });

  const [shareLinkedIn, setShareLinkedIn] = useState(false);
  const [shareX, setShareX] = useState(false);
  const [shareText, setShareText] = useState("");

  const linkedInConfigured = socialStatus?.linkedin?.configured ?? false;
  const xConfigured = socialStatus?.x?.configured ?? false;
  const anySocialConfigured = linkedInConfigured || xConfigured;
  const previewText = shareText.trim() || pageTitle;

  const handleOpen = (isOpen: boolean) => {
    if (!isOpen) onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Publish page</DialogTitle>
          <DialogDescription>
            This will make your draft live. Visitors will see the new version immediately.
          </DialogDescription>
        </DialogHeader>

        {anySocialConfigured && (
          <div className="space-y-3">
            <p className="text-sm font-medium">Share to social (optional)</p>
            <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
              {linkedInConfigured && (
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={shareLinkedIn}
                    onChange={(e) => setShareLinkedIn(e.target.checked)}
                    className="rounded"
                  />
                  <Linkedin className="w-4 h-4 text-[#0077B5]" />
                  <span className="text-sm">Post to LinkedIn</span>
                </label>
              )}
              {xConfigured && (
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={shareX}
                    onChange={(e) => setShareX(e.target.checked)}
                    className="rounded"
                  />
                  <Twitter className="w-4 h-4" />
                  <span className="text-sm">Post to X</span>
                </label>
              )}
              {(shareLinkedIn || shareX) && (
                <div className="pt-1 space-y-2">
                  <Field
                    label="Post text (optional)"
                    className="space-y-1"
                    labelClassName="text-xs text-muted-foreground"
                    hint={`${shareText.length}/3000 — leave blank to use the page title`}
                  >
                    <Textarea
                      value={shareText}
                      onChange={(e) => setShareText(e.target.value)}
                      placeholder={pageTitle || "Your post text…"}
                      rows={3}
                      maxLength={3000}
                      className="text-sm resize-none"
                    />
                  </Field>

                  {/* Preview of how the post will appear in the feed. */}
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-muted-foreground">Preview</p>
                    <div className="rounded-lg border bg-background p-3 space-y-2">
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {previewText || <span className="text-muted-foreground">Your post text…</span>}
                      </p>
                      {pageUrl ? (
                        <div className="flex items-center gap-2 rounded-md border bg-muted/40 p-2">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded bg-muted text-muted-foreground">
                            <ExternalLink className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium truncate">{pageTitle || "Published page"}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{pageUrl}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-muted-foreground">
                          A link card will be attached once the site URL is available.
                        </p>
                      )}
                      <p className="text-[11px] text-muted-foreground">
                        The page link is attached so {shareLinkedIn && shareX ? "LinkedIn and X" : shareLinkedIn ? "LinkedIn" : "X"} shows a rich article card.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>Cancel</Button>
          <Button
            onClick={() => onPublish({ shareLinkedIn, shareX, shareText })}
            disabled={isPending}
          >
            <Send className="w-4 h-4 mr-2" />
            {isPending ? "Publishing…" : "Publish"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------

export default function AdminPageEditor({ id }: { id: number }) {
  const { authenticated } = useAdminGuard();
  const queryClient = useQueryClient();

  const { data, isLoading } = useGetAdminPage(id, {
    query: { queryKey: getGetAdminPageQueryKey(id), enabled: authenticated },
  });

  const [loadedId, setLoadedId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [sections, setSections] = useState<EditorSection[]>([]);
  const [versionsOpen, setVersionsOpen] = useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);

  // Sync fetched content into local editable state once per (re)load.
  useEffect(() => {
    if (!data) return;
    const key = `${data.id}:${data.updatedAt}`;
    if (loadedId === key) return;
    setTitle(data.title ?? "");
    setSeoTitle(data.seoTitle ?? "");
    setSeoDescription(data.seoDescription ?? "");
    setSections(
      (data.sections ?? []).map((s: any, i: number) => ({
        type: s.type,
        order: i,
        data: (s.data ?? {}) as Record<string, unknown>,
      })),
    );
    setLoadedId(key);
  }, [data, loadedId]);

  const invalidatePage = () => {
    queryClient.invalidateQueries({ queryKey: getGetAdminPageQueryKey(id) });
    queryClient.invalidateQueries({ queryKey: getListAdminPageVersionsQueryKey(id) });
    queryClient.invalidateQueries({ queryKey: getListAdminPagesQueryKey("en") });
    queryClient.invalidateQueries({ queryKey: getListAdminPagesQueryKey("nl") });
  };

  const saveDraft = useSaveAdminPageDraft({
    mutation: {
      onSuccess: () => {
        toast({ title: "Draft saved" });
        invalidatePage();
      },
      onError: () => toast({ title: "Could not save", variant: "destructive" }),
    },
  });

  const publish = usePublishAdminPage({
    mutation: {
      onSuccess: () => {
        toast({ title: "Page published", description: "Your changes are now live." });
        invalidatePage();
        setPublishDialogOpen(false);
      },
      onError: () => toast({ title: "Could not publish", variant: "destructive" }),
    },
  });

  const translate = useTranslateAdminPage({
    mutation: {
      onSuccess: (res: any) => {
        toast({
          title: "Translation created",
          description: `A ${res.locale?.toUpperCase() ?? "translated"} draft is ready in Pages.`,
        });
        invalidatePage();
      },
      onError: () => toast({ title: "Translation failed", variant: "destructive" }),
    },
  });

  const handleSave = () => {
    saveDraft.mutate({
      id,
      data: {
        title,
        seoTitle: seoTitle || null,
        seoDescription: seoDescription || null,
        sections: sections.map((s, i) => ({ type: s.type, order: i, data: s.data })),
      },
    });
  };

  const handlePublish = async (opts: { shareLinkedIn: boolean; shareX: boolean; shareText: string }) => {
    const platforms: string[] = [];
    if (opts.shareLinkedIn) platforms.push("linkedin");
    if (opts.shareX) platforms.push("x");
    const hasShare = platforms.length > 0;

    // Baseline the current log so we can detect only the outcomes produced by
    // this publish's fire-and-forget share.
    let baselineId = 0;
    if (hasShare) {
      try {
        const existing = await listSocialPosts();
        baselineId = existing.reduce((m, p) => Math.max(m, p.id), 0);
      } catch {
        /* if the baseline fetch fails, we still poll for recent 'publish' rows */
      }
    }

    publish.mutate(
      {
        id,
        data: hasShare
          ? {
              shareLinkedIn: opts.shareLinkedIn,
              shareX: opts.shareX,
              shareText: opts.shareText.trim() || undefined,
            }
          : undefined,
      },
      {
        onSuccess: () => {
          if (hasShare) void pollShareOutcome(platforms, baselineId);
        },
      },
    );
  };

  // Auto-share is fire-and-forget on the server, so poll the outcome log until
  // every requested platform has reported, then surface a toast. This turns a
  // silent background failure (expired token, quota) into visible feedback.
  const pollShareOutcome = async (platforms: string[], baselineId: number) => {
    const deadline = Date.now() + 30_000;
    while (Date.now() < deadline) {
      await new Promise((r) => setTimeout(r, 2500));
      let posts: SocialPostLogEntry[] = [];
      try {
        posts = await listSocialPosts();
      } catch {
        continue;
      }
      const fresh = posts.filter((p) => p.id > baselineId && p.source === "publish");
      const covered = platforms.every((pl) => fresh.some((f) => f.platform === pl));
      if (!covered) continue;

      const relevant = fresh.filter((f) => platforms.includes(f.platform));
      const failed = relevant.filter((f) => !f.success);
      if (failed.length === 0) {
        toast({
          title: "Shared to social",
          description: `Posted to ${platforms.map((p) => (p === "x" ? "X" : "LinkedIn")).join(" and ")}.`,
        });
      } else {
        toast({
          title: "Social share failed",
          description: failed
            .map((f) => `${f.platform === "x" ? "X" : "LinkedIn"}: ${f.error ?? "unknown error"}`)
            .join(" · "),
          variant: "destructive",
        });
      }
      return;
    }
    toast({
      title: "Social share still pending",
      description: "Check the Recent posts log under Newsletter & Social for the outcome.",
    });
  };

  const addSection = (type: string) => {
    setSections((prev) => [...prev, { type, order: prev.length, data: sectionTemplate(type) }]);
  };
  const removeSection = (i: number) => setSections((prev) => prev.filter((_, idx) => idx !== i));
  const moveSection = (i: number, dir: -1 | 1) => {
    setSections((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const copy = prev.slice();
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });
  };
  const updateSectionData = (i: number, next: Record<string, unknown>) => {
    setSections((prev) => prev.map((s, idx) => (idx === i ? { ...s, data: next } : s)));
  };

  if (!authenticated) return null;

  const status = data?.status ?? "draft";
  const hasUnpublished = Boolean((data as any)?.hasUnpublishedChanges);

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin/pages">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-display font-bold tracking-tight">
                {isLoading ? "Loading…" : title || data?.slug}
              </h1>
              <Badge variant={status === "published" ? "default" : "secondary"} className="uppercase">
                {status}
              </Badge>
              {data?.locale && (
                <Badge variant="outline" className="uppercase">
                  {data.locale}
                </Badge>
              )}
              {hasUnpublished && <Badge variant="outline">Unpublished changes</Badge>}
            </div>
            {data?.slug && <p className="text-sm text-muted-foreground">/{data.slug}</p>}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setVersionsOpen(true)}>
            <History className="mr-2 h-4 w-4" /> Versions
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => translate.mutate({ id })}
            disabled={translate.isPending}
          >
            <Languages className="mr-2 h-4 w-4" />
            {translate.isPending ? "Translating…" : "Translate"}
          </Button>
          <Button variant="outline" size="sm" onClick={handleSave} disabled={saveDraft.isPending}>
            <Save className="mr-2 h-4 w-4" />
            {saveDraft.isPending ? "Saving…" : "Save draft"}
          </Button>
          <Button size="sm" onClick={() => setPublishDialogOpen(true)} disabled={publish.isPending}>
            <Send className="mr-2 h-4 w-4" />
            {publish.isPending ? "Publishing…" : "Publish"}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Editor column */}
          <div className="space-y-6">
            <div className="space-y-4 rounded-xl border bg-card p-5 shadow-sm">
              <h2 className="text-sm font-semibold">Page details</h2>
              <Field label="Title" className="space-y-1" labelClassName="text-xs text-muted-foreground">
                <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Page title" />
              </Field>
              <Field label="SEO title" className="space-y-1" labelClassName="text-xs text-muted-foreground">
                <Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder="Defaults to title" />
              </Field>
              <Field label="SEO description" className="space-y-1" labelClassName="text-xs text-muted-foreground">
                <Textarea
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  placeholder="Short description for search results"
                  rows={3}
                />
              </Field>
            </div>

            {/* Sections editor */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Sections</h2>
                <Select onValueChange={addSection}>
                  <SelectTrigger className="w-40 h-8 text-xs">
                    <SelectValue placeholder="Add section" />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTION_TYPES.map((t) => (
                      <SelectItem key={t.type} value={t.type} className="text-xs">
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {sections.length === 0 && (
                <div className="rounded-xl border border-dashed bg-muted/30 p-10 text-center text-sm text-muted-foreground">
                  No sections yet. Add one using the dropdown above.
                </div>
              )}

              <Accordion type="multiple" className="space-y-2">
                {sections.map((section, i) => (
                  <AccordionItem
                    key={i}
                    value={String(i)}
                    className="rounded-xl border bg-card shadow-sm overflow-hidden"
                  >
                    <AccordionTrigger className="px-4 py-3 hover:no-underline">
                      <div className="flex items-center gap-2 text-sm font-medium">
                        <span className="text-xs text-muted-foreground tabular-nums w-5">{i + 1}.</span>
                        {SECTION_LABELS[section.type] ?? section.type}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4">
                      <div className="flex justify-end gap-1 mb-3">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => moveSection(i, -1)}
                          disabled={i === 0}
                          title="Move up"
                        >
                          <ArrowUp className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7"
                          onClick={() => moveSection(i, 1)}
                          disabled={i === sections.length - 1}
                          title="Move down"
                        >
                          <ArrowDown className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-7 w-7 text-destructive"
                          onClick={() => removeSection(i)}
                          title="Remove section"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                      <ObjectFields
                        value={section.data}
                        onChange={(next) => updateSectionData(i, next)}
                      />
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              {sections.length > 0 && (
                <Select onValueChange={addSection}>
                  <SelectTrigger className="w-full h-9 border-dashed text-xs text-muted-foreground">
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    <SelectValue placeholder="Add another section" />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTION_TYPES.map((t) => (
                      <SelectItem key={t.type} value={t.type} className="text-xs">
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Preview column */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-muted-foreground">Live preview</h2>
              {data?.slug && (
                <a
                  href={`/${data.slug === "home" ? "" : data.slug}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                >
                  Open page <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            <div className="rounded-xl border bg-background overflow-y-auto max-h-[80vh] shadow-inner">
              {sections.length === 0 ? (
                <div className="p-10 text-center text-sm text-muted-foreground">
                  Add sections to see a preview.
                </div>
              ) : (
                sections.map((section, i) => (
                  <SectionRenderer
                    key={i}
                    section={{ id: i, type: section.type, order: i, data: section.data } as any}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Version history sheet */}
      <Sheet open={versionsOpen} onOpenChange={setVersionsOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Version history</SheetTitle>
            <SheetDescription>Restore a previous version of this page.</SheetDescription>
          </SheetHeader>
          <VersionList pageId={id} onRestore={() => { invalidatePage(); setVersionsOpen(false); }} />
        </SheetContent>
      </Sheet>

      {/* Publish dialog */}
      <PublishDialog
        open={publishDialogOpen}
        pageTitle={title}
        pageUrl={
          data?.slug
            ? data.slug === "home"
              ? window.location.origin
              : `${window.location.origin}/${data.slug}`
            : ""
        }
        onClose={() => setPublishDialogOpen(false)}
        onPublish={handlePublish}
        isPending={publish.isPending}
      />
    </AdminLayout>
  );
}

// --- Version history list ---------------------------------------------------

function VersionList({ pageId, onRestore }: { pageId: number; onRestore: () => void }) {
  const qc = useQueryClient();
  const { data: versions = [], isLoading } = useListAdminPageVersions(pageId, {
    query: { queryKey: getListAdminPageVersionsQueryKey(pageId) },
  });
  const restore = useRestoreAdminPageVersion({
    mutation: {
      onSuccess: () => {
        toast({ title: "Version restored", description: "The selected version is now the active draft." });
        qc.invalidateQueries({ queryKey: getGetAdminPageQueryKey(pageId) });
        onRestore();
      },
      onError: () => toast({ title: "Could not restore version", variant: "destructive" }),
    },
  });

  if (isLoading) return <Skeleton className="h-32 w-full mt-4" />;
  if (versions.length === 0) return <p className="text-sm text-muted-foreground mt-4">No versions yet.</p>;

  return (
    <div className="mt-4 space-y-2 overflow-y-auto max-h-[calc(100vh-10rem)]">
      {versions.map((v) => (
        <div key={v.id} className="rounded-lg border bg-card p-3 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <div>
              <p className="text-sm font-medium">{v.title || `Version ${v.versionNumber}`}</p>
              <p className="text-xs text-muted-foreground">{formatDate(v.createdAt)} · {v.state}</p>
              {v.note && <p className="text-xs text-muted-foreground italic">{v.note}</p>}
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="shrink-0"
              title="Restore this version"
              onClick={() => restore.mutate({ id: pageId, versionId: v.id })}
              disabled={restore.isPending}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
