import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  useGetSharedResponsibilityMatrix,
  usePutSharedResponsibilityMatrix,
} from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Handshake, Plus, Trash2, Save } from "lucide-react";

type Row = { area: string; supplier: string; customer: string; note: string };

// Suggested areas for a first matrix — the sharp edges of the security-IP
// hand-off (grounded in the CRA supplier-assurance material). Only offered as a
// starting template; nothing is authored until the user saves.
const TEMPLATE: Row[] = [
  { area: "Provisioning & key ownership", supplier: "Provisioning model + protected-storage guidance", customer: "Key generation, injection, certificates, device lifecycle", note: "" },
  { area: "Secure boot & debug lifecycle", supplier: "Lifecycle states, secure-boot dependencies, debug-control guidance", customer: "Boot chain, debug lockdown, recovery mechanism", note: "" },
  { area: "Cryptographic use & secure defaults", supplier: "Secure-default configs + prohibited-configuration warnings", customer: "Correct integration and configuration in the finished product", note: "" },
  { area: "Vulnerability handling", supplier: "Errata / corrected-release process + customer-notification path", customer: "Product-level vulnerability handling, DoC, CE marking", note: "" },
];

const blankRow = (): Row => ({ area: "", supplier: "", customer: "", note: "" });

/**
 * The shared-responsibility matrix panel (B2) — the component/IP-supplier shape
 * of the product file. Authored, not derived: the supplier states, per
 * responsibility area, what it provides vs. what the integrating customer
 * retains. It is a responsibility allocation, never a conformity verdict about
 * the customer's finished product.
 */
export function SharedResponsibilityPanel({ productId }: { productId: number }) {
  const qc = useQueryClient();
  const matrix = useGetSharedResponsibilityMatrix(productId);
  const [rows, setRows] = useState<Row[]>([]);
  const [dirty, setDirty] = useState(false);
  const loadedRef = useRef<number | null>(null);

  // Seed local edit state from the server once per saved version, unless the
  // user has unsaved edits (don't clobber a background refetch onto their work).
  useEffect(() => {
    if (matrix.data && !dirty && loadedRef.current !== matrix.data.version) {
      setRows(matrix.data.rows.map((r) => ({ ...r })));
      loadedRef.current = matrix.data.version;
    }
  }, [matrix.data, dirty]);

  const save = usePutSharedResponsibilityMatrix({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries();
        setDirty(false);
        toast.success("Shared-responsibility matrix saved");
      },
      onError: (e: any) =>
        toast.error(e?.response?.data?.error ?? "Could not save the matrix"),
    },
  });

  const edit = (i: number, key: keyof Row, value: string) => {
    setRows((prev) => prev.map((r, j) => (j === i ? { ...r, [key]: value } : r)));
    setDirty(true);
  };
  const addRow = () => {
    setRows((prev) => [...prev, blankRow()]);
    setDirty(true);
  };
  const removeRow = (i: number) => {
    setRows((prev) => prev.filter((_, j) => j !== i));
    setDirty(true);
  };
  const useTemplate = () => {
    setRows(TEMPLATE.map((r) => ({ ...r })));
    setDirty(true);
  };

  const version = matrix.data?.version ?? 0;

  return (
    <Card className="rounded-2xl border border-border shadow-sm" data-testid="shared-responsibility-panel">
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Handshake className="h-5 w-5 text-primary" /> Shared-responsibility matrix
        </CardTitle>
        <CardDescription className="text-xs max-w-2xl">
          The authored split of who owns what for this component: per area, what you
          (the supplier) provide vs. what the integrating customer retains. It states
          responsibility — it never declares the customer's finished product conforming.
          {version > 0 && (
            <>
              {" "}
              <Badge variant="outline" className="ml-1 font-mono text-[10px]" data-testid="matrix-version">
                v{version}
              </Badge>
            </>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        {matrix.isLoading ? (
          <Skeleton className="h-40 w-full rounded-xl" />
        ) : (
          <>
            {rows.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border/70 p-6 text-center">
                <p className="text-xs text-muted-foreground">
                  No matrix authored yet for this component.
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3 h-7 text-[11px]"
                  onClick={useTemplate}
                  data-testid="matrix-template"
                >
                  Start from the security-IP template
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-left font-mono uppercase tracking-wider text-[10px] text-muted-foreground">
                      <th className="pb-2 pr-2 font-normal">Area</th>
                      <th className="pb-2 pr-2 font-normal">The supplier provides</th>
                      <th className="pb-2 pr-2 font-normal">The customer retains</th>
                      <th className="pb-2 pr-2 font-normal">Note</th>
                      <th className="pb-2 w-8" />
                    </tr>
                  </thead>
                  <tbody className="align-top">
                    {rows.map((r, i) => (
                      <tr key={i} className="border-t border-border/50">
                        <td className="py-1.5 pr-2">
                          <Input className="h-7 text-[11px]" value={r.area} onChange={(e) => edit(i, "area", e.target.value)} placeholder="e.g. Provisioning & key ownership" />
                        </td>
                        <td className="py-1.5 pr-2">
                          <Input className="h-7 text-[11px]" value={r.supplier} onChange={(e) => edit(i, "supplier", e.target.value)} placeholder="what you provide" />
                        </td>
                        <td className="py-1.5 pr-2">
                          <Input className="h-7 text-[11px]" value={r.customer} onChange={(e) => edit(i, "customer", e.target.value)} placeholder="what they retain" />
                        </td>
                        <td className="py-1.5 pr-2">
                          <Input className="h-7 text-[11px]" value={r.note} onChange={(e) => edit(i, "note", e.target.value)} placeholder="optional" />
                        </td>
                        <td className="py-1.5">
                          <button
                            type="button"
                            className="text-destructive/70 hover:text-destructive"
                            onClick={() => removeRow(i)}
                            aria-label={`Delete row ${i + 1}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex items-center justify-between gap-2 pt-1">
              <Button size="sm" variant="outline" className="h-7 text-[11px]" onClick={addRow} data-testid="matrix-add-row">
                <Plus className="w-3 h-3 mr-1" /> Add area
              </Button>
              <Button
                size="sm"
                className="h-7 text-[11px]"
                disabled={!dirty || save.isPending}
                onClick={() => save.mutate({ id: productId, data: { rows, updatedBy: "" } })}
                data-testid="matrix-save"
              >
                <Save className="w-3 h-3 mr-1" /> {save.isPending ? "Saving…" : "Save matrix"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
