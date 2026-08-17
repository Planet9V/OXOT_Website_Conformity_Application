import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Link } from "wouter";
import {
  useListConformitySuppliers,
  useCreateConformitySupplier,
  useUpdateConformitySupplier,
  useDeleteConformitySupplier,
  useGetSupplierPosture,
} from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Factory, Pencil, Trash2, Plus, X, Check, ChevronDown, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

/**
 * The supplier register (21.1) — who this organisation buys products with
 * digital elements from. A business-relationship record for pivoting the
 * equipment register; it never states a legal status about a supplier.
 * The statutory framing matters and is printed: supply-chain security is
 * the ORGANISATION's NIS2 duty; the CRA binds the supplier toward the
 * market — this register records what each supplier has provided.
 */
export function SuppliersPanel() {
  const qc = useQueryClient();
  const suppliers = useListConformitySuppliers();
  const invalidate = () => qc.invalidateQueries();

  const posture = useGetSupplierPosture();
  const [adding, setAdding] = useState(false);
  const [openId, setOpenId] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: "", contact: "", website: "", notes: "" });

  const create = useCreateConformitySupplier({
    mutation: {
      onSuccess: () => {
        invalidate();
        setAdding(false);
        setForm({ name: "", contact: "", website: "", notes: "" });
        toast.success("Supplier registered");
      },
      onError: (e: any) =>
        toast.error(e?.response?.data?.error ?? "Could not register the supplier"),
    },
  });
  const update = useUpdateConformitySupplier({
    mutation: {
      onSuccess: () => {
        invalidate();
        setEditingId(null);
        toast.success("Supplier updated");
      },
      onError: (e: any) =>
        toast.error(e?.response?.data?.error ?? "Could not update the supplier"),
    },
  });
  const remove = useDeleteConformitySupplier({
    mutation: {
      onSuccess: () => {
        invalidate();
        toast.success("Supplier deleted — its products stay in the register, unlinked");
      },
      onError: (e: any) =>
        toast.error(e?.response?.data?.error ?? "Could not delete the supplier"),
    },
  });

  const rows = suppliers.data?.suppliers ?? [];

  const editForm = (
    onSave: () => void,
    onCancel: () => void,
    saving: boolean,
  ) => (
    <div className="grid gap-2 sm:grid-cols-2 p-4 bg-muted/20">
      <Input
        placeholder="Supplier name (required)"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="h-8 text-xs"
        data-testid="supplier-name-input"
      />
      <Input
        placeholder="Contact for evidence asks (person or team address)"
        value={form.contact}
        onChange={(e) => setForm({ ...form, contact: e.target.value })}
        className="h-8 text-xs"
      />
      <Input
        placeholder="Website"
        value={form.website}
        onChange={(e) => setForm({ ...form, website: e.target.value })}
        className="h-8 text-xs"
      />
      <Input
        placeholder="Notes"
        value={form.notes}
        onChange={(e) => setForm({ ...form, notes: e.target.value })}
        className="h-8 text-xs"
      />
      <div className="flex gap-2 sm:col-span-2">
        <Button
          size="sm"
          className="text-xs h-7"
          disabled={!form.name.trim() || saving}
          onClick={onSave}
          data-testid="supplier-save"
        >
          <Check className="w-3 h-3 mr-1" /> Save
        </Button>
        <Button size="sm" variant="ghost" className="text-xs h-7" onClick={onCancel}>
          <X className="w-3 h-3 mr-1" /> Cancel
        </Button>
      </div>
    </div>
  );

  return (
    <Card className="rounded-2xl border border-border shadow-sm" data-testid="suppliers-panel">
      <CardHeader className="border-b pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Factory className="h-5 w-5 text-primary" /> Suppliers
            </CardTitle>
            <CardDescription className="text-xs max-w-2xl mt-1">
              Who this organisation procures products with digital elements from.
              Supply-chain security is this organisation's own NIS2 duty (Art 21(2)(d));
              the CRA binds each supplier toward the market — this register records the
              relationship and, on each product, what the supplier has provided.
            </CardDescription>
          </div>
          {!adding && (
            <Button
              size="sm"
              className="text-xs shrink-0"
              onClick={() => {
                setForm({ name: "", contact: "", website: "", notes: "" });
                setEditingId(null);
                setAdding(true);
              }}
              data-testid="add-supplier"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add supplier
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {adding &&
          editForm(
            () => create.mutate({ data: { ...form, name: form.name.trim() } }),
            () => setAdding(false),
            create.isPending,
          )}
        {suppliers.isLoading ? (
          <div className="p-4">
            <Skeleton className="h-24 w-full" />
          </div>
        ) : rows.length === 0 && !adding ? (
          <p className="p-4 text-sm text-muted-foreground">
            No suppliers registered yet. Register the vendors you procure connected
            equipment from, then link their products in each product file.
          </p>
        ) : (
          <div className="divide-y divide-border/60">
            {rows.map((s) =>
              editingId === s.id ? (
                <div key={s.id}>
                  {editForm(
                    () => update.mutate({ id: s.id, data: { ...form, name: form.name.trim() } }),
                    () => setEditingId(null),
                    update.isPending,
                  )}
                </div>
              ) : (
                <div key={s.id}>
                  <div className="flex items-center justify-between gap-4 p-4">
                    <button
                      type="button"
                      className="min-w-0 text-left flex items-start gap-2 flex-1"
                      onClick={() => setOpenId(openId === s.id ? null : s.id)}
                      data-testid={`supplier-row-${s.id}`}
                    >
                      {openId === s.id ? (
                        <ChevronDown className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                      ) : (
                        <ChevronRight className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
                      )}
                      <span className="min-w-0">
                        <span className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm text-foreground">{s.name}</span>
                          <Badge variant="outline" className="font-mono text-[10px]">
                            {s.productCount} product{s.productCount === 1 ? "" : "s"}
                          </Badge>
                          {(() => {
                            const p = posture.data?.suppliers.find((x) => x.id === s.id);
                            return p && p.productCount > 0 ? (
                              <Badge variant="outline" className="font-mono text-[10px]">
                                {p.statutoryOnFile}/{p.statutoryTotal} statutory items on file
                              </Badge>
                            ) : null;
                          })()}
                        </span>
                        <span className="block text-xs text-muted-foreground truncate">
                          {[s.contact, s.website, s.notes].filter(Boolean).join(" · ") || "—"}
                        </span>
                      </span>
                    </button>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2"
                        onClick={() => {
                          setForm({
                            name: s.name,
                            contact: s.contact,
                            website: s.website,
                            notes: s.notes,
                          });
                          setAdding(false);
                          setEditingId(s.id);
                        }}
                        aria-label={`Edit ${s.name}`}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-destructive"
                        onClick={() => remove.mutate({ id: s.id })}
                        aria-label={`Delete ${s.name}`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* The posture drill-in (21.3): per-product facts, never verdicts. */}
                  {openId === s.id &&
                    (() => {
                      const p = posture.data?.suppliers.find((x) => x.id === s.id);
                      if (!p) return null;
                      return (
                        <div className="px-4 pb-4 pl-10 space-y-2" data-testid={`supplier-posture-${s.id}`}>
                          {p.earliestSupportEnd && (
                            <p className="text-[11px] font-mono text-muted-foreground">
                              Soonest support-period end across this supplier's products:{" "}
                              <span className="text-foreground">{formatDate(p.earliestSupportEnd)}</span>
                            </p>
                          )}
                          {p.products.length === 0 ? (
                            <p className="text-xs text-muted-foreground">
                              No products linked yet — set "Procured From" in a product's file.
                            </p>
                          ) : (
                            p.products.map((prod) => (
                              <Link
                                key={prod.id}
                                href={`/products/${prod.id}`}
                                className="flex items-center justify-between gap-3 rounded-lg border border-border/60 px-3 py-2 hover:border-primary/50"
                              >
                                <span className="text-xs text-foreground truncate">
                                  {prod.name}
                                  <span className="text-muted-foreground"> · {prod.productType}</span>
                                </span>
                                <span className="flex items-center gap-2 shrink-0 font-mono text-[10px]">
                                  <span className="text-muted-foreground">
                                    {prod.statutoryOnFile}/{prod.statutoryTotal} on file
                                  </span>
                                  {prod.notProvided > 0 && (
                                    <span className="text-amber-600 dark:text-amber-500">
                                      {prod.notProvided} not provided
                                    </span>
                                  )}
                                  {prod.unanswered > 0 && (
                                    <span className="text-muted-foreground/70">
                                      {prod.unanswered} unanswered
                                    </span>
                                  )}
                                  {prod.supportPeriodEnd && (
                                    <span className="text-muted-foreground">
                                      support ends {formatDate(prod.supportPeriodEnd)}
                                    </span>
                                  )}
                                </span>
                              </Link>
                            ))
                          )}
                        </div>
                      );
                    })()}
                </div>
              ),
            )}
          </div>
        )}
        {(posture.data?.unlinkedProductCount ?? 0) > 0 && (
          <p className="px-4 pb-4 text-[11px] text-muted-foreground" data-testid="unlinked-note">
            {posture.data!.unlinkedProductCount} operator-filed product
            {posture.data!.unlinkedProductCount === 1 ? " has" : "s have"} no supplier
            recorded — unlinked is not the same as covered.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
