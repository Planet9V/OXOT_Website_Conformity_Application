import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListAdminNav,
  getListAdminNavQueryKey,
  useSaveAdminNav,
} from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Field } from "@/components/admin/field";
import { useAdminGuard } from "@/hooks/use-admin-guard";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Menu, Plus, Trash2, ArrowUp, ArrowDown, Save } from "lucide-react";

type Locale = "en" | "nl";

type Placement = "header" | "footer";

interface NavRow {
  label: string;
  href: string;
  placement: Placement;
  order: number;
  external: boolean;
}

export default function AdminMenus() {
  const { authenticated } = useAdminGuard();
  const queryClient = useQueryClient();
  const [locale, setLocale] = useState<Locale>("en");
  const [items, setItems] = useState<NavRow[]>([]);
  const [loadedKey, setLoadedKey] = useState<string | null>(null);

  const { data, isLoading } = useListAdminNav(locale, {
    query: { queryKey: getListAdminNavQueryKey(locale), enabled: authenticated },
  });

  useEffect(() => {
    if (!data) return;
    const key = `${locale}:${data.length}`;
    if (loadedKey === key && items.length > 0) return;
    setItems(
      data.map((n: any) => ({
        label: n.label,
        href: n.href,
        placement: n.placement,
        order: n.order,
        external: n.external,
      })),
    );
    setLoadedKey(key);
  }, [data, locale]); // eslint-disable-line react-hooks/exhaustive-deps

  const save = useSaveAdminNav({
    mutation: {
      onSuccess: () => {
        toast({ title: "Menu saved" });
        queryClient.invalidateQueries({ queryKey: getListAdminNavQueryKey(locale) });
      },
      onError: () => toast({ title: "Could not save menu", variant: "destructive" }),
    },
  });

  const update = (i: number, patch: Partial<NavRow>) =>
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const remove = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i));
  const add = () =>
    setItems((prev) => [...prev, { label: "New link", href: "/", placement: "header", order: prev.length, external: false }]);
  const move = (i: number, dir: -1 | 1) =>
    setItems((prev) => {
      const j = i + dir;
      if (j < 0 || j >= prev.length) return prev;
      const copy = prev.slice();
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });

  const handleSave = () =>
    save.mutate({
      locale,
      data: { items: items.map((it, i) => ({ ...it, order: i })) },
    });

  if (!authenticated) return null;

  return (
    <AdminLayout>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-display font-bold tracking-tight">Menus</h1>
          <p className="mt-1 text-muted-foreground">Manage header and footer navigation links.</p>
        </div>
        <Button onClick={handleSave} disabled={save.isPending}>
          <Save className="mr-2 h-4 w-4" />
          {save.isPending ? "Saving…" : "Save menu"}
        </Button>
      </div>

      <div className="mb-4 flex items-center gap-2">
        {(["en", "nl"] as Locale[]).map((l) => (
          <Button
            key={l}
            size="sm"
            variant={locale === l ? "default" : "outline"}
            onClick={() => {
              setLocale(l);
              setLoadedKey(null);
            }}
          >
            {l.toUpperCase()}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <Skeleton className="h-72 w-full" />
      ) : (
        <div className="space-y-3">
          {items.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-xl border bg-card p-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Menu className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">No menu links yet. Add one below.</p>
            </div>
          )}

          {items.map((item, i) => (
            <div key={i} className="rounded-xl border bg-card p-4 shadow-sm">
              <div className="grid gap-3 md:grid-cols-[1fr_1fr_140px_auto] md:items-end">
                <Field label="Label" className="space-y-1" labelClassName="text-xs text-muted-foreground">
                  <Input value={item.label} onChange={(e) => update(i, { label: e.target.value })} />
                </Field>
                <Field label="Link (href)" className="space-y-1" labelClassName="text-xs text-muted-foreground">
                  <Input value={item.href} onChange={(e) => update(i, { href: e.target.value })} />
                </Field>
                <Field label="Placement" className="space-y-1" labelClassName="text-xs text-muted-foreground">
                  {(id) => (
                    <Select value={item.placement} onValueChange={(v) => update(i, { placement: v as Placement })}>
                      <SelectTrigger id={id}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="header">Header</SelectItem>
                        <SelectItem value="footer">Footer</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                </Field>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" disabled={i === 0} onClick={() => move(i, -1)}>
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={i === items.length - 1}
                    onClick={() => move(i, 1)}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => remove(i)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <label className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                <Switch checked={item.external} onCheckedChange={(v) => update(i, { external: v })} />
                Opens in a new tab (external link)
              </label>
            </div>
          ))}

          <Button variant="outline" onClick={add}>
            <Plus className="mr-2 h-4 w-4" /> Add link
          </Button>
        </div>
      )}
    </AdminLayout>
  );
}
