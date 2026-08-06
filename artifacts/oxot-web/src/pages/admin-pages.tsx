import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListAdminPages,
  getListAdminPagesQueryKey,
  useCreateAdminPage,
  useDeleteAdminPage,
  useGeneratePageDraft,
  useSaveAdminPageDraft,
  useListTemplates,
  getListTemplatesQueryKey,
  useCreateTemplate,
  useDeleteTemplate,
} from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Field } from "@/components/admin/field";
import { useAdminGuard } from "@/hooks/use-admin-guard";
import { SECTION_TYPES } from "@/lib/section-templates";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Plus, Sparkles, Trash2, FileStack } from "lucide-react";

type Locale = "en" | "nl";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

function formatDate(value: string): string {
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toLocaleDateString(undefined, { dateStyle: "medium" });
}

export default function AdminPages() {
  const { authenticated } = useAdminGuard();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [locale, setLocale] = useState<Locale>("en");

  const { data: pages, isLoading } = useListAdminPages(locale, {
    query: { queryKey: getListAdminPagesQueryKey(locale), enabled: authenticated },
  });

  const invalidatePages = () =>
    queryClient.invalidateQueries({ queryKey: getListAdminPagesQueryKey(locale) });

  const deletePage = useDeleteAdminPage({
    mutation: {
      onSuccess: () => {
        toast({ title: "Page deleted" });
        invalidatePages();
      },
    },
  });

  if (!authenticated) return null;

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Pages &amp; Content</h1>
          <p className="mt-1 text-muted-foreground">
            Create, edit, translate and publish the pages on your site.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <WizardDialog locale={locale} />
          <NewPageDialog locale={locale} />
        </div>
      </div>

      <div className="mb-4 flex items-center gap-2">
        {(["en", "nl"] as Locale[]).map((l) => (
          <Button
            key={l}
            size="sm"
            variant={locale === l ? "default" : "outline"}
            onClick={() => setLocale(l)}
          >
            {l.toUpperCase()}
          </Button>
        ))}
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        {isLoading ? (
          <div className="space-y-3 p-6">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-14 w-full" />
            ))}
          </div>
        ) : !pages || pages.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-1 text-lg font-medium">No {locale.toUpperCase()} pages yet</h3>
            <p className="max-w-md text-muted-foreground">
              Create a page from scratch or generate one with AI.
            </p>
          </div>
        ) : (
          <ul className="divide-y">
            {pages.map((page: any) => (
              <li key={page.id} className="flex items-center gap-4 px-5 py-4">
                <button
                  type="button"
                  onClick={() => setLocation(`/admin/pages/${page.id}`)}
                  className="min-w-0 flex-1 text-left"
                >
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{page.title}</span>
                    <Badge
                      variant={page.status === "published" ? "default" : "secondary"}
                      className="uppercase"
                    >
                      {page.status}
                    </Badge>
                    {page.hasUnpublishedChanges && (
                      <Badge variant="outline" className="text-xs">
                        Unpublished
                      </Badge>
                    )}
                  </div>
                  <p className="truncate text-sm text-muted-foreground">
                    /{page.slug} · updated {formatDate(page.updatedAt)}
                  </p>
                </button>
                <Button variant="outline" size="sm" onClick={() => setLocation(`/admin/pages/${page.id}`)}>
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => {
                    if (confirm(`Delete "${page.title}"? This cannot be undone.`)) {
                      deletePage.mutate({ id: page.id });
                    }
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <TemplatesPanel enabled={authenticated} />
    </AdminLayout>
  );
}

function NewPageDialog({ locale }: { locale: Locale }) {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");

  const create = useCreateAdminPage({
    mutation: {
      onSuccess: (page: any) => {
        queryClient.invalidateQueries({ queryKey: getListAdminPagesQueryKey(locale) });
        setOpen(false);
        setTitle("");
        setSlug("");
        setLocation(`/admin/pages/${page.id}`);
      },
      onError: () =>
        toast({
          title: "Could not create page",
          description: "That slug may already be in use for this language.",
          variant: "destructive",
        }),
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> New page
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new page</DialogTitle>
          <DialogDescription>Start with an empty {locale.toUpperCase()} page.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Field label="Title" className="space-y-1">
            <Input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!slug || slug === slugify(title)) setSlug(slugify(e.target.value));
              }}
              placeholder="e.g. CRA Compliance"
            />
          </Field>
          <Field label="Slug" className="space-y-1" hint={`The page will live at /${slug || "…"}`}>
            <Input value={slug} onChange={(e) => setSlug(slugify(e.target.value))} placeholder="cra-compliance" />
          </Field>
        </div>
        <DialogFooter>
          <Button
            onClick={() => create.mutate({ data: { slug, locale, title } })}
            disabled={!slug || !title || create.isPending}
          >
            {create.isPending ? "Creating…" : "Create page"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

const DEFAULT_BLUEPRINT = ["hero", "feature_grid", "two_column", "comparison_table", "faq", "cta"];

function WizardDialog({ locale }: { locale: Locale }) {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [topic, setTopic] = useState("");
  const [persona, setPersona] = useState("");
  const [cta, setCta] = useState("");
  const [tone, setTone] = useState("authoritative");
  const [blueprint, setBlueprint] = useState<string[]>(DEFAULT_BLUEPRINT);
  const [saveTemplate, setSaveTemplate] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [busy, setBusy] = useState(false);

  const generate = useGeneratePageDraft();
  const createPage = useCreateAdminPage();
  const saveDraft = useSaveAdminPageDraft();
  const createTemplate = useCreateTemplate();

  const toggle = (t: string) =>
    setBlueprint((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));

  const run = async () => {
    setBusy(true);
    try {
      const result: any = await generate.mutateAsync({
        data: { topic, persona: persona || undefined, cta: cta || undefined, tone, locale, sections: blueprint },
      });

      let slug = result.slug || slugify(result.title);
      let page: any;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          page = await createPage.mutateAsync({ data: { slug, locale, title: result.title } });
          break;
        } catch {
          slug = `${slug}-${Math.floor(Math.random() * 900 + 100)}`;
        }
      }
      if (!page) throw new Error("create failed");

      await saveDraft.mutateAsync({
        id: page.id,
        data: {
          title: result.title,
          seoTitle: result.seoTitle ?? null,
          seoDescription: result.seoDescription ?? null,
          sections: result.sections,
        },
      });

      if (saveTemplate && templateName.trim()) {
        await createTemplate.mutateAsync({
          data: {
            name: templateName.trim(),
            description: topic,
            config: { topic, persona, cta, tone, sections: blueprint },
          },
        });
        queryClient.invalidateQueries({ queryKey: getListTemplatesQueryKey() });
      }

      queryClient.invalidateQueries({ queryKey: getListAdminPagesQueryKey(locale) });
      setOpen(false);
      setLocation(`/admin/pages/${page.id}`);
    } catch {
      toast({ title: "Generation failed", description: "Please try again in a moment.", variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Sparkles className="mr-2 h-4 w-4" /> Create with AI
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Landing page wizard</DialogTitle>
          <DialogDescription>
            Describe the page and OXOT's AI will draft the {locale.toUpperCase()} copy and sections.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Field label="What is this page about? *" className="space-y-1">
            <Textarea
              rows={2}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. CRA readiness assessment for industrial IoT vendors"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Target persona" className="space-y-1">
              <Input value={persona} onChange={(e) => setPersona(e.target.value)} placeholder="Head of Product Security" />
            </Field>
            <Field label="Tone" className="space-y-1">
              {(id) => (
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger id={id}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["authoritative", "friendly", "technical", "concise", "reassuring"].map((t) => (
                      <SelectItem key={t} value={t}>
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </Field>
          </div>
          <Field label="Primary call to action" className="space-y-1">
            <Input value={cta} onChange={(e) => setCta(e.target.value)} placeholder="Book a CRA gap assessment" />
          </Field>
          <div className="space-y-2">
            <Label>Sections to include</Label>
            <div className="grid grid-cols-2 gap-2">
              {SECTION_TYPES.map((s) => (
                <label key={s.type} className="flex items-center gap-2 text-sm">
                  <Checkbox checked={blueprint.includes(s.type)} onCheckedChange={() => toggle(s.type)} />
                  {s.label}
                </label>
              ))}
            </div>
          </div>
          <div className="rounded-lg border bg-muted/20 p-3">
            <label className="flex items-center gap-2 text-sm font-medium">
              <Checkbox checked={saveTemplate} onCheckedChange={(v) => setSaveTemplate(Boolean(v))} />
              Save these settings as a reusable template
            </label>
            {saveTemplate && (
              <Input
                className="mt-2"
                aria-label="Template name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Template name"
              />
            )}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={run} disabled={!topic.trim() || blueprint.length === 0 || busy}>
            {busy ? "Generating…" : "Generate draft"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function TemplatesPanel({ enabled }: { enabled: boolean }) {
  const queryClient = useQueryClient();
  const { data: templates, isLoading } = useListTemplates({
    query: { queryKey: getListTemplatesQueryKey(), enabled },
  });
  const remove = useDeleteTemplate({
    mutation: {
      onSuccess: () => {
        toast({ title: "Template deleted" });
        queryClient.invalidateQueries({ queryKey: getListTemplatesQueryKey() });
      },
    },
  });

  if (isLoading || !templates || templates.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold">
        <FileStack className="h-4 w-4 text-muted-foreground" /> Saved wizard templates
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {templates.map((t: any) => (
          <div key={t.id} className="rounded-lg border bg-card p-4 shadow-sm">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-medium">{t.name}</p>
                {t.description && (
                  <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{t.description}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 text-muted-foreground hover:text-destructive"
                onClick={() => remove.mutate({ id: t.id })}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
