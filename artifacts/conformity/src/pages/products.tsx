import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListConformityProducts,
  useCreateConformityProduct,
} from "@workspace/api-client-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { formatDate } from "@/lib/utils";
import { Plus, Boxes, ArrowRight } from "lucide-react";
import { toast } from "sonner";

function CreateProductDialog() {
  const qc = useQueryClient();
  const [, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const create = useCreateConformityProduct({
    mutation: {
      onSuccess: (product) => {
        qc.invalidateQueries();
        toast.success(`Product "${product.name}" created successfully!`);
        setOpen(false);
        navigate(`/products/${product.id}`);
      },
      onError: (err: any) => toast.error(err.message || "Failed to create product"),
    },
  });

  const [form, setForm] = useState({
    name: "",
    productType: "",
    version: "",
    manufacturerName: "",
    intendedUse: "",
    description: "",
  });
  const set = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          onClick={() => setOpen(true)}
          className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs rounded-lg shadow-sm cta-lift"
        >
          <Plus className="w-4 h-4 mr-1.5" /> New product
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-md max-w-lg">
        <DialogHeader>
          <DialogTitle>Add a product</DialogTitle>
          <DialogDescription>
            Register a product with digital elements to assess against the Cyber Resilience Act.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <FormField label="Product name">
            <Input
              className="rounded-md"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Acme Gateway 3000"
            />
          </FormField>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Product type">
              <Input
                className="rounded-md"
                value={form.productType}
                onChange={(e) => set("productType", e.target.value)}
                placeholder="Hardware / Software"
              />
            </FormField>
            <FormField label="Version">
              <Input
                className="rounded-md"
                value={form.version}
                onChange={(e) => set("version", e.target.value)}
                placeholder="1.0"
              />
            </FormField>
          </div>
          <FormField label="Manufacturer">
            <Input
              className="rounded-md"
              value={form.manufacturerName}
              onChange={(e) => set("manufacturerName", e.target.value)}
            />
          </FormField>
          <FormField label="Intended use">
            <Input
              className="rounded-md"
              value={form.intendedUse}
              onChange={(e) => set("intendedUse", e.target.value)}
            />
          </FormField>
          <FormField label="Description">
            <Textarea
              className="rounded-md"
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </FormField>
        </div>
        <DialogFooter>
          <Button variant="outline" className="rounded-md" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            className="rounded-md"
            disabled={create.isPending || !form.name.trim()}
            onClick={() => create.mutate({ data: { ...form, name: form.name.trim() } })}
          >
            Create product
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Products() {
  const { data: products, isLoading, isError } = useListConformityProducts();

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="oxot-kicker block mb-1">CRA ARTICLE 10 · DIGITAL PRODUCT CONFORMITY ASSESSMENT</span>
          <h1 className="text-3xl sm:text-4xl font-serif font-normal tracking-tight text-foreground">Products</h1>
          <p className="text-sm text-muted-foreground mt-1 font-sans">
            Manage products with digital elements and run their statutory conformity assessments.
          </p>
        </div>
        <CreateProductDialog />
      </div>

      <div className="border border-border bg-card">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : isError ? (
          <div className="p-4 sm:p-6 lg:p-8 text-destructive text-center">Failed to load products.</div>
        ) : !products?.length ? (
          <div className="p-16 text-center text-muted-foreground flex flex-col items-center">
            <Boxes className="w-12 h-12 mb-4 opacity-20" />
            <p>No products yet. Add your first product to begin.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="w-32">Type</TableHead>
                <TableHead className="w-24">Version</TableHead>
                <TableHead className="w-32">Updated</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((p) => (
                <TableRow key={p.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell>
                    <Link href={`/products/${p.id}`} className="block group">
                      <div className="font-medium group-hover:text-primary transition-colors">
                        {p.name}
                      </div>
                      {p.manufacturerName && (
                        <div className="text-xs text-muted-foreground">{p.manufacturerName}</div>
                      )}
                    </Link>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {p.productType || "—"}
                  </TableCell>
                  <TableCell className="font-mono text-xs">{p.version || "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">
                    {formatDate(p.updatedAt)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Link href={`/products/${p.id}`}>
                      <ArrowRight className="w-4 h-4 text-muted-foreground hover:text-primary inline-block" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
