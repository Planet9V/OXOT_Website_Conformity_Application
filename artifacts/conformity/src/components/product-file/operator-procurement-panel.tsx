import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Link } from "wouter";
import {
  useGetProcurementCheck,
  usePutProcurementCheck,
  useListConformitySuppliers,
  useListSupplierDocuments,
  useAddSupplierDocument,
  useDeleteSupplierDocument,
  useListSupplierRequests,
  useCreateSupplierRequest,
  useWithdrawSupplierRequest,
} from "@workspace/api-client-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { uploadFile, validateUploadFile } from "@/lib/upload";
import { PackageSearch, FileCheck2, Send, Copy, Trash2, Upload } from "lucide-react";

const DOC_TYPES = [
  { value: "declaration_of_conformity", label: "EU declaration of conformity" },
  { value: "user_information", label: "Annex II information & instructions" },
  { value: "support_period_statement", label: "Support-period statement" },
  { value: "security_advisory_channel", label: "Security advisory / PSIRT channel" },
  { value: "sbom", label: "SBOM (contractual ask)" },
  { value: "other", label: "Other" },
] as const;

const DOC_TYPE_LABEL: Record<string, string> = Object.fromEntries(
  DOC_TYPES.map((d) => [d.value, d.label]),
);

/**
 * The operator's procurement panel (21.2) — the product file's shape for
 * orgRole=operator. The statutory framing is the panel's first sentence and
 * is the honest one: supply-chain security is THIS organisation's NIS2
 * Art 21(2)(d) duty; every checklist item below anchors to a CRA duty that
 * binds the SUPPLIER's manufacturer. The posture line reports what is on
 * file / reported not provided / unanswered — never a verdict.
 */

type Tri = boolean | null;

function TriButtons({
  value,
  onChange,
  disabled,
}: {
  value: Tri;
  onChange: (v: Tri) => void;
  disabled: boolean;
}) {
  const opts: { v: Tri; label: string }[] = [
    { v: true, label: "On file" },
    { v: false, label: "Not provided" },
    { v: null, label: "Unanswered" },
  ];
  return (
    <div className="flex items-center gap-1 shrink-0">
      {opts.map((o) => (
        <button
          key={String(o.v)}
          type="button"
          disabled={disabled}
          onClick={() => onChange(o.v)}
          className={cn(
            "px-2 py-0.5 rounded-md text-[11px] font-mono border",
            value === o.v
              ? o.v === true
                ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-600 dark:text-emerald-400"
                : o.v === false
                  ? "bg-amber-500/15 border-amber-500/40 text-amber-600 dark:text-amber-500"
                  : "bg-muted border-border text-muted-foreground"
              : "border-border/50 text-muted-foreground/60 hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function OperatorProcurementPanel({
  productId,
  supplierId,
}: {
  productId: number;
  supplierId: number | null;
}) {
  const qc = useQueryClient();
  const check = useGetProcurementCheck(productId);
  const suppliers = useListConformitySuppliers();
  const save = usePutProcurementCheck({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries();
        toast.success("Procurement fact recorded");
      },
      onError: (e: any) =>
        toast.error(e?.response?.data?.error ?? "Could not record the fact"),
    },
  });

  const supplier = suppliers.data?.suppliers.find((s) => s.id === supplierId) ?? null;
  const posture = check.data?.posture;
  const facts = check.data?.facts;

  const setFact = (key: string, v: Tri) => {
    save.mutate({ id: productId, data: { [key]: v } as any });
  };

  return (
    <Card className="rounded-2xl border border-border shadow-sm" data-testid="operator-procurement-panel">
      <CardHeader className="border-b pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <PackageSearch className="h-5 w-5 text-primary" /> Procurement file — supplier evidence
        </CardTitle>
        <CardDescription className="text-xs max-w-2xl">
          Supply-chain security is this organisation's own duty (NIS2 Art 21(2)(d)).
          Each item below is something the CRA obliges the SUPPLIER's manufacturer to
          provide with the product — this file records what has actually arrived.
          Recording facts never concludes anything about the supplier's conformity.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="text-muted-foreground">
            Procured from:{" "}
            {supplier ? (
              <span className="text-foreground font-medium">{supplier.name}</span>
            ) : (
              <span className="italic">
                no supplier recorded — set it in "Edit Product Information" or register one on the{" "}
                <Link href="/organisation" className="text-primary hover:underline">
                  Organisation page
                </Link>
              </span>
            )}
          </span>
          {posture && (
            <Badge variant="outline" className="font-mono text-[10px] shrink-0" data-testid="posture-counts">
              {posture.statutoryOnFile}/{posture.statutoryTotal} statutory items on file ·{" "}
              {posture.unanswered} unanswered
            </Badge>
          )}
        </div>

        {check.isLoading || !posture || !facts ? (
          <Skeleton className="h-40 w-full rounded-xl" />
        ) : (
          <ul className="divide-y divide-border/60">
            {posture.items.map((item) => (
              <li key={item.key} className="py-2 flex items-center justify-between gap-4">
                <span className="text-sm text-foreground/90">
                  {item.label}{" "}
                  <span
                    className={cn(
                      "font-mono text-[10px]",
                      item.kind === "contractual" ? "text-muted-foreground/70" : "text-muted-foreground",
                    )}
                  >
                    · {item.anchor}
                  </span>
                </span>
                <TriButtons
                  value={(facts as any)[item.key] ?? null}
                  onChange={(v) => setFact(item.key, v)}
                  disabled={save.isPending}
                />
              </li>
            ))}
          </ul>
        )}

        <p className="text-[11px] text-muted-foreground">
          "Not provided" is the supplier's reported state, worth chasing; "Unanswered"
          means nobody here has checked yet. The register never turns either into a
          conclusion.
        </p>

        <SupplierDocumentsSection productId={productId} hasSupplier={supplierId != null} />
      </CardContent>
    </Card>
  );
}

/**
 * Documents the supplier has provided (list / add by upload or link) and the
 * asks sent through the door (create / copy link / withdraw). The door takes
 * link-or-note submissions; direct upload through it waits on a security
 * review, and the copy says nothing that promises otherwise.
 */
function SupplierDocumentsSection({
  productId,
  hasSupplier,
}: {
  productId: number;
  hasSupplier: boolean;
}) {
  const qc = useQueryClient();
  const docs = useListSupplierDocuments(productId);
  const asks = useListSupplierRequests(productId);
  const fileInput = useRef<HTMLInputElement>(null);
  const [docType, setDocType] = useState<string>("declaration_of_conformity");
  const [linkUrl, setLinkUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  const addDoc = useAddSupplierDocument({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries();
        setLinkUrl("");
        toast.success("Supplier document recorded");
      },
      onError: (e: any) => toast.error(e?.response?.data?.error ?? "Could not record the document"),
    },
  });
  const deleteDoc = useDeleteSupplierDocument({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries();
        toast.success("Document removed (stored file included)");
      },
      onError: (e: any) => toast.error(e?.response?.data?.error ?? "Could not remove the document"),
    },
  });
  const createAsk = useCreateSupplierRequest({
    mutation: {
      onSuccess: (row: any) => {
        qc.invalidateQueries();
        navigator.clipboard.writeText(
          `${window.location.origin}/supplier-portal?token=${row.accessToken}`,
        );
        toast.success("Ask created — the door link is on your clipboard. Send it to the supplier.");
      },
      onError: (e: any) => toast.error(e?.response?.data?.error ?? "Could not create the ask"),
    },
  });
  const withdrawAsk = useWithdrawSupplierRequest({
    mutation: {
      onSuccess: () => {
        qc.invalidateQueries();
        toast.success("Ask withdrawn — its link no longer works");
      },
      onError: (e: any) => toast.error(e?.response?.data?.error ?? "Could not withdraw the ask"),
    },
  });

  const onPickFile = async (file: File) => {
    const invalid = validateUploadFile(file);
    if (invalid) {
      toast.error(invalid);
      return;
    }
    setUploading(true);
    try {
      const uploaded = await uploadFile(file);
      addDoc.mutate({
        id: productId,
        data: {
          docType: docType as any,
          title: file.name,
          objectPath: uploaded.objectPath,
          fileName: uploaded.fileName,
        },
      });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const openAsks = (asks.data?.requests ?? []).filter((r) => r.status === "open");

  return (
    <div className="border-t border-border/60 pt-4 space-y-3" data-testid="supplier-documents-section">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <span className="text-sm font-medium text-foreground flex items-center gap-2">
          <FileCheck2 className="w-4 h-4 text-primary" /> Supplier documents
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={docType} onValueChange={setDocType}>
            <SelectTrigger className="h-7 text-[11px] w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DOC_TYPES.map((d) => (
                <SelectItem key={d.value} value={d.value}>
                  {d.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <input
            ref={fileInput}
            type="file"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && onPickFile(e.target.files[0])}
          />
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-[11px]"
            disabled={uploading || addDoc.isPending}
            onClick={() => fileInput.current?.click()}
            data-testid="upload-supplier-doc"
          >
            <Upload className="w-3 h-3 mr-1" /> {uploading ? "Uploading…" : "Upload file"}
          </Button>
          {hasSupplier && (
            <Button
              size="sm"
              className="h-7 text-[11px]"
              disabled={createAsk.isPending}
              onClick={() => createAsk.mutate({ id: productId, data: { docType: docType as any } })}
              data-testid="ask-supplier"
            >
              <Send className="w-3 h-3 mr-1" /> Ask the supplier
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Input
          className="h-7 text-[11px]"
          placeholder="…or record a link the supplier provided (https://)"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
        />
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-[11px] shrink-0"
          disabled={!linkUrl.trim() || addDoc.isPending}
          onClick={() =>
            addDoc.mutate({
              id: productId,
              data: {
                docType: docType as any,
                title: `${DOC_TYPE_LABEL[docType]} (link)`,
                url: linkUrl.trim(),
              },
            })
          }
        >
          Record link
        </Button>
      </div>

      {docs.isLoading ? (
        <Skeleton className="h-16 w-full rounded-lg" />
      ) : (docs.data?.documents.length ?? 0) === 0 ? (
        <p className="text-xs text-muted-foreground">
          Nothing on file from the supplier yet for this product.
        </p>
      ) : (
        <ul className="divide-y divide-border/40 rounded-lg border border-border/50">
          {docs.data!.documents.map((d) => (
            <li key={d.id} className="flex items-center justify-between gap-3 px-3 py-2 text-xs">
              <span className="min-w-0 truncate">
                <span className="text-foreground">{d.title}</span>
                <span className="text-muted-foreground">
                  {" "}· {DOC_TYPE_LABEL[d.docType] ?? d.docType} ·{" "}
                  {d.submittedVia === "supplier_token" ? "via the supplier door" : "recorded internally"}
                </span>
                {d.url && (
                  <a
                    href={d.url}
                    target="_blank"
                    rel="noreferrer"
                    className="ml-2 text-primary hover:underline"
                  >
                    open link
                  </a>
                )}
              </span>
              <span className="flex items-center gap-2 shrink-0">
                {d.objectPath && (
                  <a
                    href={`/api/conformity/supplier-documents/${d.id}/download`}
                    className="text-primary hover:underline"
                    data-testid={`download-supplier-doc-${d.id}`}
                  >
                    download
                  </a>
                )}
                {d.fileHash && (
                  <span className="font-mono text-[10px] text-muted-foreground" title={d.fileHash}>
                    sha256 {d.fileHash.slice(0, 8)}…
                  </span>
                )}
                <button
                  type="button"
                  className="text-destructive/70 hover:text-destructive"
                  onClick={() => deleteDoc.mutate({ id: d.id })}
                  aria-label={`Delete ${d.title}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      {openAsks.length > 0 && (
        <div className="space-y-1">
          <span className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
            Open asks to the supplier
          </span>
          {openAsks.map((r) => (
            <div key={r.id} className="flex items-center justify-between gap-3 text-xs">
              <span className="text-muted-foreground">
                {DOC_TYPE_LABEL[r.docType] ?? r.docType} · link valid until{" "}
                {r.expiresAt.slice(0, 10)}
              </span>
              <span className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  className="text-primary hover:underline inline-flex items-center gap-1"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/supplier-portal?token=${r.accessToken}`,
                    );
                    toast.success("Door link copied");
                  }}
                >
                  <Copy className="w-3 h-3" /> copy link
                </button>
                <button
                  type="button"
                  className="text-muted-foreground hover:text-destructive"
                  onClick={() => withdrawAsk.mutate({ id: r.id })}
                >
                  withdraw
                </button>
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
