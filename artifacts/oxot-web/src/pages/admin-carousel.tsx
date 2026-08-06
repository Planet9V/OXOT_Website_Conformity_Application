import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListCarousel,
  getListCarouselQueryKey,
  useAddCarouselImage,
  useAddCarouselPdf,
  useReorderCarousel,
  useUpdateCarouselSlide,
  useDeleteCarouselSlide,
} from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Field } from "@/components/admin/field";
import { useAdminGuard } from "@/hooks/use-admin-guard";
import { uploadFile } from "@/lib/upload";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageIcon, FileText, Trash2, ArrowUp, ArrowDown, Save, Loader2 } from "lucide-react";

export default function AdminCarousel() {
  const { authenticated } = useAdminGuard();
  const queryClient = useQueryClient();
  const imageInput = useRef<HTMLInputElement>(null);
  const pdfInput = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<"image" | "pdf" | null>(null);

  const { data: slides, isLoading } = useListCarousel({
    query: { queryKey: getListCarouselQueryKey(), enabled: authenticated },
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListCarouselQueryKey() });

  const addImage = useAddCarouselImage({ mutation: { onSuccess: invalidate } });
  const addPdf = useAddCarouselPdf({ mutation: { onSuccess: invalidate } });
  const reorder = useReorderCarousel({ mutation: { onSuccess: invalidate } });
  const del = useDeleteCarouselSlide({
    mutation: {
      onSuccess: () => {
        toast({ title: "Slide removed" });
        invalidate();
      },
    },
  });

  const handleImage = async (file: File) => {
    setUploading("image");
    try {
      const res = await uploadFile(file);
      await addImage.mutateAsync({ data: { objectPath: res.objectPath } });
      toast({ title: "Image added" });
    } catch (e) {
      toast({ title: "Upload failed", description: String((e as Error).message), variant: "destructive" });
    } finally {
      setUploading(null);
    }
  };

  const handlePdf = async (file: File) => {
    setUploading("pdf");
    try {
      const res = await uploadFile(file);
      await addPdf.mutateAsync({ data: { objectPath: res.objectPath } });
      toast({ title: "PDF added", description: "Each page became a slide." });
    } catch (e) {
      toast({ title: "Upload failed", description: String((e as Error).message), variant: "destructive" });
    } finally {
      setUploading(null);
    }
  };

  const move = (i: number, dir: -1 | 1) => {
    if (!slides) return;
    const j = i + dir;
    if (j < 0 || j >= slides.length) return;
    const ids = slides.map((s: any) => s.id);
    [ids[i], ids[j]] = [ids[j], ids[i]];
    reorder.mutate({ data: { ids } });
  };

  if (!authenticated) return null;

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Carousel</h1>
          <p className="mt-1 text-muted-foreground">
            Manage homepage slides. Upload images, or a PDF to turn each page into a slide.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            ref={imageInput}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleImage(f);
              e.target.value = "";
            }}
          />
          <input
            ref={pdfInput}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handlePdf(f);
              e.target.value = "";
            }}
          />
          <Button variant="outline" onClick={() => imageInput.current?.click()} disabled={uploading !== null}>
            {uploading === "image" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImageIcon className="mr-2 h-4 w-4" />}
            Add image
          </Button>
          <Button variant="outline" onClick={() => pdfInput.current?.click()} disabled={uploading !== null}>
            {uploading === "pdf" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
            Add PDF
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-72 w-full" />
      ) : !slides || slides.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border bg-card p-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="mb-1 text-lg font-medium">No slides yet</h3>
          <p className="max-w-md text-muted-foreground">Add an image or PDF to build your carousel.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {slides.map((slide: any, i: number) => (
            <SlideCard key={slide.id} slide={slide} index={i} count={slides.length} onMove={move} onDelete={(id) => del.mutate({ id })} />
          ))}
        </div>
      )}
    </AdminLayout>
  );
}

function SlideCard({
  slide,
  index,
  count,
  onMove,
  onDelete,
}: {
  slide: any;
  index: number;
  count: number;
  onMove: (i: number, dir: -1 | 1) => void;
  onDelete: (id: number) => void;
}) {
  const queryClient = useQueryClient();
  const [captionEn, setCaptionEn] = useState(slide.captionEn ?? "");
  const [captionNl, setCaptionNl] = useState(slide.captionNl ?? "");
  const [linkUrl, setLinkUrl] = useState(slide.linkUrl ?? "");
  const [active, setActive] = useState<boolean>(slide.active);

  useEffect(() => {
    setCaptionEn(slide.captionEn ?? "");
    setCaptionNl(slide.captionNl ?? "");
    setLinkUrl(slide.linkUrl ?? "");
    setActive(slide.active);
  }, [slide]);

  const update = useUpdateCarouselSlide({
    mutation: {
      onSuccess: () => {
        toast({ title: "Slide saved" });
        queryClient.invalidateQueries({ queryKey: getListCarouselQueryKey() });
      },
      onError: () => toast({ title: "Could not save slide", variant: "destructive" }),
    },
  });

  const save = () =>
    update.mutate({
      id: slide.id,
      data: {
        captionEn: captionEn || null,
        captionNl: captionNl || null,
        linkUrl: linkUrl || null,
        active,
      },
    });

  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-card p-4 shadow-sm md:flex-row">
      <div className="relative w-full shrink-0 overflow-hidden rounded-lg border bg-muted md:w-56">
        <img src={slide.imageUrl} alt={captionEn || "Slide"} className="h-36 w-full object-cover" />
        <div className="absolute left-2 top-2 flex gap-1">
          <Badge variant="secondary">{index + 1}</Badge>
          {slide.kind === "pdf" && (
            <Badge variant="outline" className="bg-background/80">
              PDF p{(slide.pageIndex ?? 0) + 1}
            </Badge>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Caption (EN)" className="space-y-1" labelClassName="text-xs text-muted-foreground">
            <Input value={captionEn} onChange={(e) => setCaptionEn(e.target.value)} />
          </Field>
          <Field label="Caption (NL)" className="space-y-1" labelClassName="text-xs text-muted-foreground">
            <Input value={captionNl} onChange={(e) => setCaptionNl(e.target.value)} />
          </Field>
        </div>
        <Field label="Link URL (optional)" className="space-y-1" labelClassName="text-xs text-muted-foreground">
          <Input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="/contact" />
        </Field>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <Switch checked={active} onCheckedChange={setActive} />
            {active ? "Visible on site" : "Hidden"}
          </label>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" disabled={index === 0} onClick={() => onMove(index, -1)}>
              <ArrowUp className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" disabled={index === count - 1} onClick={() => onMove(index, 1)}>
              <ArrowDown className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-destructive"
              onClick={() => {
                if (confirm("Remove this slide?")) onDelete(slide.id);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            <Button size="sm" onClick={save} disabled={update.isPending}>
              <Save className="mr-2 h-4 w-4" />
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
