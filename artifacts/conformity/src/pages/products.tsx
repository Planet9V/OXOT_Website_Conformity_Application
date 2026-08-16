import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useListConformityProducts,
  useCreateConformityProduct,
  useImportConformityProducts,
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
import { Plus, Boxes, Package, ArrowRight, Upload } from "lucide-react";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Bulk import (re-homed from the retired product-portfolio donor).
// The parse is deliberately literal: a header row names the columns, a cell
// that is absent stays absent ("—" in the preview, empty in the registry),
// and a row without a name is shown as rejected — nothing is ever invented
// to fill a gap. Import creates products only; no assessment and no
// classification, since the Art. 32 assessment is an explicit act per product.
// ---------------------------------------------------------------------------

const IMPORT_HEADERS: Record<string, keyof ImportRow> = {
  name: "name",
  product: "name",
  "product name": "name",
  description: "description",
  manufacturer: "manufacturerName",
  "manufacturer name": "manufacturerName",
  type: "productType",
  "product type": "productType",
  version: "version",
  "intended use": "intendedUse",
  intendeduse: "intendedUse",
};

type ImportRow = {
  name?: string;
  description?: string;
  manufacturerName?: string;
  productType?: string;
  version?: string;
  intendedUse?: string;
};

function splitLine(line: string): string[] {
  if (line.startsWith("|") && line.endsWith("|")) {
    return line.slice(1, -1).split("|").map((c) => c.trim());
  }
  const sep = line.includes("\t") ? "\t" : line.includes(";") ? ";" : ",";
  return line.split(sep).map((c) => c.trim().replace(/^"(.*)"$/, "$1"));
}

function parseImportText(text: string): { rows: ImportRow[]; ignoredColumns: string[]; error?: string } {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l && !/^\|?[\s|:-]+\|?$/.test(l)); // drop markdown separator rows
  if (!lines.length) return { rows: [], ignoredColumns: [] };

  const headerCells = splitLine(lines[0]!).map((h) => h.toLowerCase());
  const mapping = headerCells.map((h) => IMPORT_HEADERS[h]);
  if (!mapping.includes("name")) {
    return {
      rows: [],
      ignoredColumns: [],
      error: 'The first row must be a header row containing a "name" column.',
    };
  }
  const ignoredColumns = headerCells.filter((_, i) => !mapping[i]);

  const rows = lines.slice(1).map((line) => {
    const cells = splitLine(line);
    const row: ImportRow = {};
    mapping.forEach((field, i) => {
      const value = cells[i]?.trim();
      if (field && value) row[field] = value;
    });
    return row;
  });
  return { rows, ignoredColumns };
}

function ImportProductsDialog() {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const importProducts = useImportConformityProducts({
    mutation: {
      onSuccess: (result) => {
        qc.invalidateQueries();
        toast.success(
          `${result.created.length} product${result.created.length === 1 ? "" : "s"} imported` +
            (result.rejected.length ? `; ${result.rejected.length} rejected` : ""),
        );
        setOpen(false);
        setText("");
      },
      onError: (err: any) => toast.error(err.message || "Import failed"),
    },
  });

  const { rows, ignoredColumns, error } = parseImportText(text);
  const ready = rows.filter((r) => r.name?.trim());
  const nameless = rows.length - ready.length;

  const onFile = (file: File | undefined) => {
    if (!file) return;
    file.text().then(setText, () => toast.error("Could not read the file"));
  };

  const FIELDS: Array<{ key: keyof ImportRow; label: string }> = [
    { key: "name", label: "Name" },
    { key: "productType", label: "Type" },
    { key: "version", label: "Version" },
    { key: "manufacturerName", label: "Manufacturer" },
    { key: "intendedUse", label: "Intended use" },
    { key: "description", label: "Description" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={() => setOpen(true)} className="text-xs rounded-lg">
          <Upload className="w-4 h-4 mr-1.5" /> Import
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-md max-w-3xl">
        <DialogHeader>
          <DialogTitle>Import products</DialogTitle>
          <DialogDescription>
            Paste CSV, TSV, semicolon-separated or markdown-table rows (or choose a file). The
            first row must be a header naming the columns; a &quot;name&quot; column is required.
            Absent cells stay absent — nothing is filled in for you. Imported products carry no
            assessment: the conformity assessment is started per product, explicitly.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <input
            type="file"
            accept=".csv,.tsv,.txt,.md"
            className="text-xs"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
          <Textarea
            className="rounded-md font-mono text-xs min-h-32"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={"name,type,version,manufacturer\nAcme Gateway 3000,Hardware,1.0,Acme GmbH"}
          />
          {error ? (
            <p className="text-xs text-destructive">{error}</p>
          ) : rows.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                {ready.length} row{ready.length === 1 ? "" : "s"} ready
                {nameless > 0 && `; ${nameless} without a name (will be rejected)`}
                {ignoredColumns.length > 0 && `; ignored columns: ${ignoredColumns.join(", ")}`}
              </p>
              <div className="border border-border rounded-md max-h-56 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {FIELDS.map((f) => (
                        <TableHead key={f.key} className="text-xs">
                          {f.label}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row, i) => (
                      <TableRow key={i} className={row.name?.trim() ? "" : "opacity-50"}>
                        {FIELDS.map((f) => (
                          <TableCell key={f.key} className="text-xs">
                            {row[f.key] || "—"}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : null}
        </div>
        <DialogFooter>
          <Button variant="outline" className="rounded-md" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            className="rounded-md"
            disabled={importProducts.isPending || ready.length === 0}
            onClick={() => importProducts.mutate({ data: { rows } })}
          >
            Import {ready.length > 0 ? `${ready.length} product${ready.length === 1 ? "" : "s"}` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

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
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="oxot-kicker block mb-1">CRA ARTICLE 32 · DIGITAL PRODUCT CONFORMITY ASSESSMENT</span>
          <h1 className="text-3xl sm:text-4xl font-serif font-normal tracking-tight text-foreground flex items-center gap-2.5">
            <Package className="w-6 h-6 text-primary shrink-0" /> Products
          </h1>
          <p className="text-sm text-muted-foreground mt-1 font-sans">
            Manage products with digital elements and run their statutory conformity assessments.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <ImportProductsDialog />
          <CreateProductDialog />
        </div>
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
                      <div className="font-medium group-hover:text-primary-ink transition-colors">
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
