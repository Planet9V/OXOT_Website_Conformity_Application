import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Upload,
  Trash2,
  Eye,
  Download,
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  Clock,
  Layers,
  ChevronLeft,
  ChevronRight,
  Plus,
  Sparkles,
  Search,
  Filter,
  Copy,
  Lock,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface DocumentItem {
  id: number;
  productId: number;
  title: string;
  docCategory: string;
  description: string;
  fileVersion: string;
  originalFileName: string;
  mimeType: string;
  fileSizeBytes: number;
  fileContentText?: string;
  storagePath: string;
  sha256Hash: string;
  uploadedBy: string;
  createdAt: string;
}

const CATEGORY_OPTIONS = [
  "Product Specification",
  "Installation & Admin Guide",
  "Vulnerability & PenTest Report",
  "Engineering & Architecture Specs",
  "External Testing Certificate",
  "Standards Conformance Statement",
  "PSIRT Advisory & Fix Note",
  "Release Notes & Patch Log",
  "Other Compliance Evidence",
];

export function ProductDocumentVaultModal({
  isOpen,
  onClose,
  product,
}: {
  isOpen: boolean;
  onClose: () => void;
  product: { id: number; name: string; sku: string; craClass: string } | null;
}) {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDocs, setTotalDocs] = useState(0);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Upload Form State
  const [uploadDrawerOpen, setUploadDrawerOpen] = useState(false);
  const [stagedFiles, setStagedFiles] = useState<File[]>([]);
  const [titleInput, setTitleInput] = useState("");
  const [categoryInput, setCategoryInput] = useState("Product Specification");
  const [versionInput, setVersionInput] = useState("v1.0");
  const [descriptionInput, setDescriptionInput] = useState("");
  // Provenance names its actual actor — no pre-filled placeholder identity.
  const [uploaderInput, setUploaderInput] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  // Preview Drawer State
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);

  const fetchDocuments = async () => {
    if (!product) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/portfolio/products/${product.id}/documents?page=${page}&limit=20&category=${selectedCategoryFilter}`
      );
      const data = await res.json();
      if (data.success) {
        setDocuments(data.documents || []);
        setTotalPages(data.pagination?.totalPages || 1);
        setTotalDocs(data.pagination?.total || 0);
      }
    } catch (e) {
      console.error("Failed to fetch product documents:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && product) {
      fetchDocuments();
    }
  }, [isOpen, product, page, selectedCategoryFilter]);

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArr = Array.from(e.dataTransfer.files);
      setStagedFiles((prev) => [...prev, ...filesArr]);
      if (!titleInput && filesArr[0]) {
        setTitleInput(filesArr[0].name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArr = Array.from(e.target.files);
      setStagedFiles((prev) => [...prev, ...filesArr]);
      if (!titleInput && filesArr[0]) {
        setTitleInput(filesArr[0].name.replace(/\.[^/.]+$/, ""));
      }
    }
  };

  const handleUploadSubmit = async () => {
    if (!product) return;
    if (stagedFiles.length === 0) {
      toast.error("Please select at least one file to upload");
      return;
    }
    if (!uploaderInput.trim()) {
      toast.error("Enter who is uploading — provenance records the actual actor");
      return;
    }

    setIsUploading(true);
    let successCount = 0;

    for (const file of stagedFiles) {
      try {
        const textContent = await file.text();
        const payload = {
          title: titleInput || file.name,
          docCategory: categoryInput,
          description: descriptionInput,
          fileVersion: versionInput || "v1.0",
          originalFileName: file.name,
          mimeType: file.type || "application/octet-stream",
          fileContentText: textContent,
          uploadedBy: uploaderInput,
        };

        const res = await fetch(`/api/portfolio/products/${product.id}/documents`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const data = await res.json();
        if (data.success) {
          successCount++;
        }
      } catch (err) {
        console.error("File upload error:", err);
      }
    }

    setIsUploading(false);
    toast.success(`Successfully uploaded ${successCount} document(s) to Product #${product.id} Provenance Vault!`);
    setStagedFiles([]);
    setTitleInput("");
    setDescriptionInput("");
    setUploadDrawerOpen(false);
    fetchDocuments();
  };

  const handleDeleteDocument = async (docId: number, docTitle: string) => {
    if (!confirm(`Are you sure you want to delete "${docTitle}" from the 10-Year Statutory Vault?`)) return;
    try {
      const res = await fetch(`/api/portfolio/documents/${docId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success(`Deleted document #${docId}`);
        fetchDocuments();
      } else {
        toast.error(data.error || "Failed to delete document");
      }
    } catch (e) {
      toast.error("Network error deleting document");
    }
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    toast.success("Copied SHA-256 Provenance Hash to clipboard!");
  };

  const filteredDocs = documents.filter(
    (d) =>
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.originalFileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.docCategory.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl rounded-3xl border border-border bg-card p-6 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <DialogHeader className="border-b border-border/60 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-mono text-xs gap-1">
                  <FileText className="h-3.5 w-3.5" /> Product Provenance Document Vault
                </Badge>
                <Badge variant="secondary" className="font-mono text-xs">
                  SKU: {product?.sku}
                </Badge>
                <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 font-mono text-xs gap-1">
                  {/* Art. 13(13): technical documentation kept at the
                      authorities' disposal for >= 10 years after placing on
                      the market (verified against the corpus title — the old
                      "Art. 10(7)" was draft-era numbering; final Art. 10 is
                      about cyber skills. L41.) */}
                  <Lock className="h-3 w-3" /> CRA Art. 13(13) 10-Year Archive
                </Badge>
              </div>
              <DialogTitle className="text-2xl font-display font-bold text-foreground tracking-tight">
                {product?.name}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Product-isolated technical document repository backing statutory PSIRT advisories, engineering specifications, and external audit certificates.
              </DialogDescription>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={() => setUploadDrawerOpen(!uploadDrawerOpen)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs gap-1.5 shadow-md"
              >
                <Upload className="h-3.5 w-3.5" /> Multi-File Upload &amp; Ingest
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto space-y-6 pt-4 pr-1">
          {/* Multi-File Upload & Ingestion Drawer */}
          <AnimatePresence>
            {uploadDrawerOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 space-y-4 shadow-lg overflow-hidden"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-emerald-400" />
                    <h4 className="font-bold text-sm text-foreground">
                      Upload Supporting Documents to Product #{product?.id}
                    </h4>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setUploadDrawerOpen(false)}
                    className="h-6 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Cancel
                  </Button>
                </div>

                {/* Drag and Drop Zone */}
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleFileDrop}
                  className="border-2 border-dashed border-emerald-500/40 hover:border-emerald-500/80 rounded-2xl p-6 text-center bg-card/60 transition-colors cursor-pointer"
                  onClick={() => document.getElementById("file-upload-input")?.click()}
                >
                  <input
                    id="file-upload-input"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileInputChange}
                    accept=".pdf,.md,.txt,.doc,.docx,.csv,.json,.png,.jpg"
                  />
                  <Upload className="h-8 w-8 text-emerald-400 mx-auto mb-2 animate-bounce" />
                  <p className="text-xs font-bold text-foreground">
                    Drag and drop files here, or <span className="text-emerald-400 underline">browse your computer</span>
                  </p>
                  <p className="text-[11px] text-muted-foreground font-mono mt-1">
                    Supports PDFs, Markdown, TXT, Word docs, CSV, and JSON (SHA-256 provenance hashed on ingestion)
                  </p>
                </div>

                {/* Staged Files List */}
                {stagedFiles.length > 0 && (
                  <div className="space-y-1.5 bg-background/50 p-3 rounded-xl border border-border/40">
                    <span className="text-[11px] font-mono font-bold text-emerald-400 block mb-1">
                      Staged Files ({stagedFiles.length}):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {stagedFiles.map((f, idx) => (
                        <Badge key={idx} variant="secondary" className="font-mono text-[11px] gap-1 bg-emerald-500/10 text-emerald-300 border-emerald-500/30">
                          {f.name} ({formatBytes(f.size)})
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setStagedFiles((prev) => prev.filter((_, i) => i !== idx));
                            }}
                            className="text-muted-foreground hover:text-destructive ml-1"
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Document Metadata Input Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div>
                    <Label className="text-[11px] font-mono text-muted-foreground">Document Title</Label>
                    <Input
                      value={titleInput}
                      onChange={(e) => setTitleInput(e.target.value)}
                      placeholder="e.g. CyberEdge 5G PenTest Report Q3"
                      className="h-8 text-xs bg-background"
                    />
                  </div>

                  <div>
                    <Label className="text-[11px] font-mono text-muted-foreground">Document Category</Label>
                    <Select value={categoryInput} onValueChange={setCategoryInput}>
                      <SelectTrigger className="h-8 text-xs bg-background">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CATEGORY_OPTIONS.map((cat) => (
                          <SelectItem key={cat} value={cat} className="text-xs">
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-[11px] font-mono text-muted-foreground">Version Tag</Label>
                    <Input
                      value={versionInput}
                      onChange={(e) => setVersionInput(e.target.value)}
                      placeholder="v1.0"
                      className="h-8 text-xs bg-background font-mono"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <Label className="text-[11px] font-mono text-muted-foreground">Description &amp; Audit Notes</Label>
                    <Input
                      value={descriptionInput}
                      onChange={(e) => setDescriptionInput(e.target.value)}
                      placeholder="Short notes on statutory compliance purpose..."
                      className="h-8 text-xs bg-background"
                    />
                  </div>

                  <div>
                    <Label className="text-[11px] font-mono text-muted-foreground">Uploaded By</Label>
                    <Input
                      value={uploaderInput}
                      onChange={(e) => setUploaderInput(e.target.value)}
                      placeholder="User name / email"
                      className="h-8 text-xs bg-background"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <Button
                    type="button"
                    onClick={handleUploadSubmit}
                    disabled={isUploading || stagedFiles.length === 0}
                    className="h-8 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs gap-1.5 shadow"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" /> Save &amp; Commit to Provenance Vault
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filter & Search Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/40 p-3 rounded-2xl border border-border/60">
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="h-3.5 w-3.5 absolute left-3 top-2.5 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search product documents by title, filename..."
                  className="h-8 pl-8 text-xs bg-background"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <Select value={selectedCategoryFilter} onValueChange={setSelectedCategoryFilter}>
                <SelectTrigger className="h-8 text-xs w-48 bg-background">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL" className="text-xs">All Categories</SelectItem>
                  {CATEGORY_OPTIONS.map((cat) => (
                    <SelectItem key={cat} value={cat} className="text-xs">{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 20-Per-Page Paginated Provenance Table */}
          <div className="rounded-2xl border border-border bg-card shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b bg-muted/80 text-muted-foreground font-mono font-bold">
                    <th className="p-3">Document Title &amp; File</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Version</th>
                    <th className="p-3">Size</th>
                    <th className="p-3">Uploaded By &amp; Date</th>
                    <th className="p-3">SHA-256 Provenance Hash</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground font-mono">
                        Loading product documents...
                      </td>
                    </tr>
                  ) : filteredDocs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-muted-foreground font-mono">
                        No supporting documents uploaded for this product yet.
                      </td>
                    </tr>
                  ) : (
                    filteredDocs.map((doc) => (
                      <tr key={doc.id} className="hover:bg-muted/40 transition-colors">
                        <td className="p-3">
                          <div className="font-bold text-foreground">{doc.title}</div>
                          <div className="text-[11px] text-muted-foreground font-mono">{doc.originalFileName}</div>
                        </td>
                        <td className="p-3">
                          <Badge variant="outline" className="font-mono text-[10px] bg-primary/10 text-primary border-primary/20">
                            {doc.docCategory}
                          </Badge>
                        </td>
                        <td className="p-3 font-mono font-bold text-foreground">
                          {doc.fileVersion}
                        </td>
                        <td className="p-3 font-mono text-muted-foreground">
                          {formatBytes(doc.fileSizeBytes)}
                        </td>
                        <td className="p-3 font-mono text-xs">
                          <div className="text-foreground">{doc.uploadedBy}</div>
                          <div className="text-[10px] text-muted-foreground">
                            {new Date(doc.createdAt).toISOString().slice(0, 10)}
                          </div>
                        </td>
                        <td className="p-3">
                          <button
                            type="button"
                            onClick={() => handleCopyHash(doc.sha256Hash)}
                            className="flex items-center gap-1 font-mono text-[10px] bg-muted/60 hover:bg-muted px-2 py-1 rounded border border-border/40 text-muted-foreground hover:text-foreground transition-colors"
                            title="Click to copy full SHA-256 hash"
                          >
                            <ShieldCheck className="h-3 w-3 text-emerald-400 shrink-0" />
                            <span className="truncate max-w-[100px]">{doc.sha256Hash ? `${doc.sha256Hash.slice(0, 10)}...` : "SHA256"}</span>
                            <Copy className="h-2.5 w-2.5 shrink-0" />
                          </button>
                        </td>
                        <td className="p-3 text-right space-x-1.5">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setPreviewDoc(doc)}
                            className="h-7 px-2 text-xs font-bold text-primary gap-1"
                          >
                            <Eye className="h-3 w-3" /> Preview
                          </Button>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(`/api/portfolio/documents/${doc.id}/download`, "_blank")}
                            className="h-7 px-2 text-xs font-bold text-emerald-400 hover:bg-emerald-500/10 gap-1"
                          >
                            <Download className="h-3 w-3" /> Download
                          </Button>

                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteDocument(doc.id, doc.title)}
                            className="h-7 px-2 text-xs font-bold text-destructive hover:bg-destructive/10 gap-1"
                          >
                            <Trash2 className="h-3 w-3" /> Delete
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* 20-per-page Pagination Footer */}
            <div className="flex items-center justify-between p-3 border-t border-border bg-muted/30 font-mono text-xs">
              <span className="text-muted-foreground">
                Showing {filteredDocs.length} of {totalDocs} documents (Page {page} of {totalPages})
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="h-7 text-xs font-bold gap-1"
                >
                  <ChevronLeft className="h-3.5 w-3.5" /> Previous
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="h-7 text-xs font-bold gap-1"
                >
                  Next <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* File Previewer Drawer */}
        <AnimatePresence>
          {previewDoc && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-card border border-border rounded-3xl p-6 max-w-3xl w-full shadow-2xl space-y-4 max-h-[85vh] flex flex-col"
              >
                <div className="flex items-center justify-between border-b border-border pb-3">
                  <div>
                    <h3 className="font-bold text-base text-foreground flex items-center gap-2">
                      <FileCheck2 className="h-4 w-4 text-primary" /> {previewDoc.title}
                    </h3>
                    <span className="text-xs font-mono text-muted-foreground">
                      {previewDoc.originalFileName} • {previewDoc.fileVersion} • {previewDoc.docCategory}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreviewDoc(null)}
                    className="h-7 text-xs font-bold"
                  >
                    Close Preview
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto bg-background/80 p-4 rounded-2xl border border-border/50 font-mono text-xs leading-relaxed text-foreground whitespace-pre-wrap">
                  {previewDoc.fileContentText || "No plain text content available for preview."}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border font-mono text-xs">
                  <span className="text-muted-foreground">
                    SHA-256: {previewDoc.sha256Hash}
                  </span>
                  <Button
                    type="button"
                    onClick={() => setPreviewDoc(null)}
                    className="h-8 bg-primary text-primary-foreground font-bold text-xs"
                  >
                    Done
                  </Button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
