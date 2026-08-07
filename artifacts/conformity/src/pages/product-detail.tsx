import { useParams, Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetConformityProduct,
  getGetConformityProductQueryKey,
  useCreateConformityAssessment,
  useDeleteConformityAssessment,
  useDeleteConformityProduct,
  useUpdateConformityProduct,
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/ui/form-field";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn, formatDate } from "@/lib/utils";
import { stageLabel } from "@/lib/conformity";
import { stageProgress } from "@/lib/journey";
import { ArrowLeft, Plus, Trash2, ArrowRight, ClipboardCheck, FileText, Lock, Upload, ShieldCheck, Eye, Copy, Pencil, Sparkles, Zap, CheckCircle2 } from "lucide-react";
import { ProductDocumentVaultModal } from "@/components/conformity/portfolio/product-document-vault-modal";
import { useState, useEffect } from "react";
import { toast } from "sonner";

function InfoRow({ label, value, onEdit }: { label: string; value?: string | null; onEdit?: () => void }) {
  return (
    <div className="flex flex-col gap-1 p-3 rounded-lg border border-border/60 bg-muted/20">
      <dt className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium text-foreground flex items-center justify-between gap-2">
        <span>{value || <span className="text-muted-foreground italic text-xs">Not specified</span>}</span>
        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="text-xs text-primary-ink hover:underline inline-flex items-center gap-1 opacity-70 hover:opacity-100"
          >
            <Pencil className="w-3 h-3" /> Edit
          </button>
        )}
      </dd>
    </div>
  );
}

export default function ProductDetail() {
  const params = useParams();
  const id = Number(params.id);
  const qc = useQueryClient();
  const [, navigate] = useLocation();

  const { data, isLoading, isError } = useGetConformityProduct(id, {
    query: { enabled: !!id, queryKey: getGetConformityProductQueryKey(id) },
  });

  const [editOpen, setEditOpen] = useState(false);
  const [docVaultOpen, setDocVaultOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    productType: "",
    version: "",
    manufacturerName: "",
    authorizedRep: "",
    intendedUse: "",
    manufacturerAddress: "",
    description: "",
  });

  useEffect(() => {
    if (data?.product) {
      setEditForm({
        name: data.product.name || "",
        productType: data.product.productType || "",
        version: data.product.version || "",
        manufacturerName: data.product.manufacturerName || "",
        authorizedRep: data.product.authorizedRep || "",
        intendedUse: data.product.intendedUse || "",
        manufacturerAddress: data.product.manufacturerAddress || "",
        description: data.product.description || "",
      });
    }
  }, [data?.product]);

  const updateProduct = useUpdateConformityProduct({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries();
        toast.success("Product details updated successfully!");
        setEditOpen(false);
      },
      onError: (err: any) => toast.error(err.message || "Failed to update product"),
    },
  });

  const createAssessment = useCreateConformityAssessment({
    mutation: {
      onSuccess: (created) => {
        qc.invalidateQueries();
        toast.success("CRA Assessment Wizard launched!");
        navigate(`/assessments/${created.assessment.id}`);
      },
    },
  });
  const deleteAssessment = useDeleteConformityAssessment({
    mutation: { onSuccess: () => qc.invalidateQueries() },
  });
  const deleteProduct = useDeleteConformityProduct({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries();
        navigate("/products");
      },
    },
  });

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (isError || !data || !data.product) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-4">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" /> Back to products
        </Link>
        <div className="text-destructive border border-destructive/20 p-6 bg-destructive/5 rounded-xl flex flex-col gap-3">
          <div className="font-serif font-semibold text-lg">Product not found or failed to load.</div>
          <p className="text-xs text-muted-foreground">
            The requested product (ID #{id}) does not exist in the database or could not be retrieved.
          </p>
          <Link href="/products" className="inline-flex">
            <Button size="sm" variant="outline" className="rounded-lg text-xs">
              Return to Product Catalog
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const product = data.product;
  const assessments = data.assessments || [];

  const handleSaveProduct = () => {
    if (!editForm.name.trim()) return;
    updateProduct.mutate({
      id,
      data: {
        ...editForm,
        name: editForm.name.trim(),
      },
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8">
      <Link
        href="/products"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors font-medium"
      >
        <ArrowLeft className="w-4 h-4" /> Back to products
      </Link>

      <Card className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <CardHeader className="border-b border-border bg-muted/20 pb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="oxot-kicker block mb-1">REGISTERED PRODUCT DOSSIER</span>
              <CardTitle className="text-3xl font-serif font-normal text-foreground">{product.name}</CardTitle>
              {product.description ? (
                <p className="text-sm text-muted-foreground mt-1 max-w-2xl font-sans">
                  {product.description}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground italic mt-1">
                  No description provided yet. Click "Edit Product Information" below to add details.
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditOpen(true)}
                className="rounded-lg text-xs font-semibold gap-1.5 border-border hover:bg-muted"
              >
                <Pencil className="w-3.5 h-3.5 text-primary" /> Edit Product Information
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-lg text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10 border-border"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="rounded-xl">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="font-serif">Delete this product?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This permanently removes “{product.name}” and all of its assessments, evaluations,
                      evidence, artifacts and incidents. This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-lg">Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() => deleteProduct.mutate({ id })}
                    >
                      Delete Product
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <dl className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <InfoRow label="Product Type" value={product.productType} onEdit={() => setEditOpen(true)} />
            <InfoRow label="Version" value={product.version} onEdit={() => setEditOpen(true)} />
            <InfoRow label="Manufacturer" value={product.manufacturerName} onEdit={() => setEditOpen(true)} />
            <InfoRow label="Authorised Rep" value={product.authorizedRep} onEdit={() => setEditOpen(true)} />
            <InfoRow label="Intended Use" value={product.intendedUse} onEdit={() => setEditOpen(true)} />
            <InfoRow label="Manufacturer Address" value={product.manufacturerAddress} onEdit={() => setEditOpen(true)} />
          </dl>
        </CardContent>
      </Card>

      {/* Prominent Hero CTA for Kickoff Wizard */}
      <Card className="rounded-2xl border-2 border-primary/40 bg-card p-6 shadow-md relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <span className="oxot-kicker flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-primary" /> CRA CONFORMITY ASSESSMENT WIZARD
            </span>
            <h3 className="text-xl font-serif font-normal text-foreground">
              {assessments.length === 0
                ? "Ready to run the statutory CRA Conformity Assessment?"
                : "Active CRA Conformity Execution Workbench"}
            </h3>
            <p className="text-xs text-muted-foreground font-sans leading-relaxed">
              Step through the guided 4-stage wizard: Scope Determination → Standards Route Selection → xBOM Vulnerability Analysis → Statutory Declaration of Conformity.
            </p>
          </div>

          <Button
            size="lg"
            disabled={createAssessment.isPending}
            onClick={() => createAssessment.mutate({ data: { productId: id, regulationKey: "cra" } })}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs rounded-xl shadow-md cta-lift shrink-0 gap-2 px-6 py-6"
          >
            <Zap className="w-4 h-4" />
            {createAssessment.isPending ? "Initializing Wizard..." : "Kickoff Conformity Wizard"}
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </Card>

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
          <h2 className="text-xl font-serif font-normal text-foreground flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-primary" />
            Assessments
            <Badge variant="secondary" className="font-mono text-xs rounded-md">
              {assessments.length}
            </Badge>
          </h2>
          <Button
            size="sm"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs rounded-lg shadow-sm cta-lift"
            disabled={createAssessment.isPending}
            onClick={() => createAssessment.mutate({ data: { productId: id, regulationKey: "cra" } })}
          >
            <Plus className="w-4 h-4 mr-1.5" /> New CRA Assessment
          </Button>
        </div>

        {assessments.length === 0 ? (
          <Card className="border border-dashed border-border p-10 text-center text-muted-foreground rounded-2xl bg-card">
            <CardContent className="p-0 flex flex-col items-center justify-center space-y-3">
              <ClipboardCheck className="w-10 h-10 text-muted-foreground/30" />
              <div className="font-medium text-foreground text-base font-serif">No assessments created for this product yet.</div>
              <p className="text-xs text-muted-foreground max-w-md">
                Click the "Kickoff Conformity Wizard" button above to register a new assessment and run the statutory CRA classification wizard.
              </p>
              <Button
                size="sm"
                className="bg-primary text-primary-foreground font-semibold text-xs rounded-lg cta-lift mt-2"
                onClick={() => createAssessment.mutate({ data: { productId: id, regulationKey: "cra" } })}
              >
                <Zap className="w-4 h-4 mr-1.5" /> Start First Assessment
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {assessments.map((a) => (
              <Card key={a.id} className="rounded-md hover:border-primary/50 transition-colors">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <Link href={`/assessments/${a.id}`} className="flex-1 min-w-0 group">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className="rounded-md bg-reg-cra text-primary-foreground font-mono text-[10px]">
                        {a.regulationKey.toUpperCase()}
                      </Badge>
                      <Badge variant="outline" className="rounded-md">
                        {stageLabel(a.currentStage)}
                      </Badge>
                      {a.scopeResult && (
                        <Badge
                          variant="outline"
                          className={cn(
                            "rounded-md",
                            a.scopeResult === "in_scope"
                              ? "text-green-600 border-green-500/40"
                              : "text-red-600 border-red-500/40",
                          )}
                        >
                          {a.scopeResult === "in_scope" ? "In scope" : "Out of scope"}
                        </Badge>
                      )}
                      {a.classKey && (
                        <span className="text-xs text-muted-foreground font-mono">{a.classKey}</span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 font-mono">
                      Updated {formatDate(a.updatedAt)}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary transition-[width] duration-700 ease-out motion-reduce:transition-none"
                          style={{ width: `${stageProgress(a).pct}%` }}
                        />
                      </div>
                      <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                        {stageProgress(a).pct}%
                      </span>
                    </div>
                  </Link>
                  <div className="flex items-center gap-1 shrink-0">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="rounded-md text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="rounded-md">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this assessment?</AlertDialogTitle>
                          <AlertDialogDescription>
                            All evaluations, evidence, artifacts, grades and incidents for this
                            assessment will be removed. This cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="rounded-md">Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => deleteAssessment.mutate({ id: a.id })}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <Link href={`/assessments/${a.id}`}>
                      <ArrowRight className="w-4 h-4 text-muted-foreground hover:text-primary" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Product-Specific Supporting Document Vault & 5-10 Year CRA Provenance Section */}
      <Card className="rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-card via-card to-emerald-500/5 shadow-xl overflow-hidden">
        <CardHeader className="border-b border-border/60 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono text-xs gap-1">
                  <FileText className="h-3.5 w-3.5" /> Product Provenance &amp; Compliance Vault
                </Badge>
                <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 font-mono text-xs gap-1">
                  <Lock className="h-3 w-3" /> CRA Art. 10(7) 10-Year Statutory Retention
                </Badge>
              </div>
              <CardTitle className="text-xl font-display font-bold text-foreground">
                Supporting Technical Documentation &amp; Evidence Files
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Product-isolated repository for specifications, vulnerability reports, installation guides, engineering architecture, and external audit certificates.
              </CardDescription>
            </div>

            <Button
              type="button"
              onClick={() => setDocVaultOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs gap-1.5 shadow-md shrink-0"
            >
              <Upload className="h-4 w-4" /> Open Document Vault &amp; Ingest Files
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="rounded-2xl border border-dashed border-emerald-500/30 bg-background/60 p-6 text-center space-y-3">
            <ShieldCheck className="h-10 w-10 text-emerald-400 mx-auto" />
            <div className="space-y-1">
              <h4 className="font-bold text-sm text-foreground">
                Product #{product.id} Statutory Document Vault Active
              </h4>
              <p className="text-xs text-muted-foreground max-w-xl mx-auto">
                All uploaded PDFs, Markdown specs, Word docs, and test certificates are tied strictly to <span className="font-bold text-foreground">{product.name}</span> with SHA-256 cryptographic provenance digests.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDocVaultOpen(true)}
              className="border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 font-bold text-xs gap-1.5"
            >
              <FileText className="h-3.5 w-3.5" /> Manage &amp; View {product.name} Files
            </Button>
          </div>
        </CardContent>
      </Card>

      <ProductDocumentVaultModal
        isOpen={docVaultOpen}
        onClose={() => setDocVaultOpen(false)}
        product={{ id, name: product.name, sku: product.version || `PROD-${id}`, craClass: product.productType }}
      />

      {/* Edit Product Information Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="rounded-2xl max-w-xl bg-card border-border shadow-xl">
          <DialogHeader className="border-b border-border pb-4">
            <span className="oxot-kicker block mb-1">CRA PRODUCT DOSSIER MAINTENANCE</span>
            <DialogTitle className="text-xl font-serif font-normal">Edit Product Information</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground font-sans">
              Enter or update statutory product details, manufacturer mandates, and intended use declarations.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <FormField label="Product Name">
              <Input
                className="rounded-lg font-sans"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="e.g. NovaGuard Smart Home Hub v2"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField label="Product Type">
                <Input
                  className="rounded-lg font-sans"
                  value={editForm.productType}
                  onChange={(e) => setEditForm({ ...editForm, productType: e.target.value })}
                  placeholder="Hardware / Software / IoT"
                />
              </FormField>

              <FormField label="Version / Release">
                <Input
                  className="rounded-lg font-mono text-xs"
                  value={editForm.version}
                  onChange={(e) => setEditForm({ ...editForm, version: e.target.value })}
                  placeholder="v2.4.0"
                />
              </FormField>
            </div>

            <FormField label="Manufacturer Name">
              <Input
                className="rounded-lg font-sans"
                value={editForm.manufacturerName}
                onChange={(e) => setEditForm({ ...editForm, manufacturerName: e.target.value })}
                placeholder="e.g. NovaGuard Technologies B.V."
              />
            </FormField>

            <FormField label="Authorised Representative (EU)">
              <Input
                className="rounded-lg font-sans"
                value={editForm.authorizedRep}
                onChange={(e) => setEditForm({ ...editForm, authorizedRep: e.target.value })}
                placeholder="e.g. NovaGuard Technologies B.V. (EU established)"
              />
            </FormField>

            <FormField label="Manufacturer Address">
              <Input
                className="rounded-lg font-sans"
                value={editForm.manufacturerAddress}
                onChange={(e) => setEditForm({ ...editForm, manufacturerAddress: e.target.value })}
                placeholder="e.g. Keizersgracht 123, Amsterdam, Netherlands"
              />
            </FormField>

            <FormField label="Intended Use Declaration">
              <Input
                className="rounded-lg font-sans"
                value={editForm.intendedUse}
                onChange={(e) => setEditForm({ ...editForm, intendedUse: e.target.value })}
                placeholder="e.g. Residential security automation for consumers"
              />
            </FormField>

            <FormField label="Full Technical Description">
              <Textarea
                rows={3}
                className="rounded-lg font-sans text-xs"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                placeholder="Technical architecture, connected interfaces, cloud backends..."
              />
            </FormField>
          </div>

          <DialogFooter className="border-t border-border pt-4">
            <Button variant="outline" className="rounded-lg text-xs" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs rounded-lg cta-lift"
              disabled={updateProduct.isPending || !editForm.name.trim()}
              onClick={handleSaveProduct}
            >
              {updateProduct.isPending ? "Saving..." : "Save Product Details"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
