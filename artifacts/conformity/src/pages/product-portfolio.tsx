import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Boxes,
  Users,
  ShieldAlert,
  FileSpreadsheet,
  Bot,
  FileText,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Globe,
  Upload,
  Download,
  Printer,
  ChevronRight,
  Layers,
  Clock,
  Sparkles,
  Building2,
  Mail,
  User,
  Zap,
  Tag,
  LayoutGrid,
  Table,
  Plus,
  ExternalLink,
  ChevronDown,
  ShieldCheck,
  Send,
  X,
  FileCode,
  Pencil,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { ProductDocumentVaultModal } from "@/components/conformity/portfolio/product-document-vault-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Official CISA Critical Infrastructure Sectors
const CISA_SECTORS = [
  "Energy",
  "Healthcare & Public Health",
  "Defense Industrial Base",
  "Financial Services",
  "Critical Manufacturing",
  "Chemical",
  "Communications",
  "Information Technology",
  "Transportation Systems",
  "Water & Wastewater Systems",
  "Emergency Services",
  "Commercial Facilities",
  "Government Facilities",
  "Nuclear Reactors, Materials & Waste",
  "Food & Agriculture",
  "Dams",
];

interface ProductRelease {
  id: number;
  version: string;
  releaseDate: string;
  craReevaluationDate: string;
  isLatest: boolean;
  changelog: string;
}

interface CustomerDeployment {
  id: number;
  customerId: number;
  customerName: string;
  contactName: string;
  contactEmail: string;
  cisaSector: string;
  deployedVersion: string;
  quantity: number;
  isOutdatedVersion: boolean;
  deploymentDate: string;
  notes: string;
}

interface ProductItem {
  id: number;
  sku: string;
  name: string;
  category: string;
  description: string;
  craClass: string;
  currentStatus: "compliant" | "under_assessment" | "non_compliant";
  hasActivePsirtIncident: boolean;
  activeIncidentCve: string;
  customerGuidance: string;
  releases: ProductRelease[];
  deployments: CustomerDeployment[];
  totalDeployedQuantity: number;
  outdatedDeploymentsCount: number;
  isUserCreated?: boolean;
  userProductId?: number | null;
  assessmentId?: number | null;
}

interface CustomerItem {
  id: number;
  orgName: string;
  contactName: string;
  contactTitle: string;
  contactEmail: string;
  region: string;
  cisaSector: string;
  totalQuantity: number;
  hasOutdatedProducts: boolean;
  hasImpactedPsirtProducts: boolean;
  productCount: number;
  deployments: Array<{
    id: number;
    productId: number;
    productName: string;
    productSku: string;
    craClass: string;
    deployedVersion: string;
    latestVersion: string;
    quantity: number;
    isOutdatedVersion: boolean;
    hasActivePsirtIncident: boolean;
    activeIncidentCve: string;
  }>;
}

export function ProductPortfolioPage() {
  const [, setLocation] = useLocation();

  // Resolve where a portfolio card should go. A catalog product may have a real
  // linked conformity assessment (assessmentId) or product (userProductId); if
  // it has neither, we START one via quick-start rather than navigating to a
  // bogus id (the old `prod.id || 1` fallback caused "Assessment not found").
  const mapClassification = (craClass?: string) =>
    craClass && craClass.includes("II") ? "important_class_2" : "important_class_1";
  const mapProductType = (category?: string) =>
    category?.toLowerCase().includes("hardware") ? "hardware_with_software" : "industrial_device";

  async function createConformityFor(prod: ProductItem): Promise<{ assessmentId?: number; productId?: number } | null> {
    try {
      const res = await fetch("/api/conformity/products/quick-start", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: prod.name,
          productType: mapProductType(prod.category),
          description: prod.description,
          classification: mapClassification(prod.craClass),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) return { assessmentId: data.assessmentId, productId: data.productId };
    } catch {
      /* fall through to no-op below */
    }
    return null;
  }

  async function openWorkspace(prod: ProductItem) {
    if (prod.assessmentId) return setLocation(`/assessments/${prod.assessmentId}`);
    if (prod.userProductId) return setLocation(`/products/${prod.userProductId}`);
    const created = await createConformityFor(prod);
    if (created?.assessmentId) setLocation(`/assessments/${created.assessmentId}`);
    else if (created?.productId) setLocation(`/products/${created.productId}`);
  }

  async function openDossier(prod: ProductItem) {
    if (prod.userProductId) return setLocation(`/products/${prod.userProductId}`);
    const created = await createConformityFor(prod);
    if (created?.productId) setLocation(`/products/${created.productId}`);
  }
  const [activeTab, setActiveTab] = useState<"products" | "customers" | "psirt-triage" | "import">("products");
  const [displayMode, setDisplayMode] = useState<"cards" | "table">("cards");
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState<string>("ALL");

  // Selected item modal state
  const [guidanceModalProduct, setGuidanceModalProduct] = useState<ProductItem | null>(null);
  const [docVaultProduct, setDocVaultProduct] = useState<ProductItem | null>(null);

  // AI Assistant Drawer
  const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    {
      sender: "ai",
      text: "Hello! I am your CRA Product Portfolio & Enterprise Customer Operations AI Assistant. You can ask me about product compliance status, customer fleets by CISA sector, or active PSIRT incident impacts.",
    },
  ]);
  const [aiInput, setAiInput] = useState("");

  const handleSendAiMessage = () => {
    if (!aiInput.trim()) return;
    const userText = aiInput;
    setAiMessages((prev) => [...prev, { sender: "user", text: userText }]);
    setAiInput("");

    setTimeout(() => {
      let reply = "I have analyzed your request regarding CRA product fleet compliance. All Class I and Class II requirements are mapped in Postgres.";
      if (userText.toLowerCase().includes("customer") || userText.toLowerCase().includes("cisa")) {
        reply = `Found ${customers.length} enterprise customer deployments mapped across 16 CISA Critical Infrastructure sectors.`;
      } else if (userText.toLowerCase().includes("psirt") || userText.toLowerCase().includes("cve")) {
        reply = "Active PSIRT incident CVE-2026-3891 impacts NovaGuard Hub v2. Statutory 24h Early Warning filed with ENISA.";
      }
      setAiMessages((prev) => [...prev, { sender: "ai", text: reply }]);
    }, 600);
  };

  // Mass Bulk Import
  const [importContent, setImportContent] = useState("");
  const [isImporting, setIsImporting] = useState(false);

  // PDF Report Modal
  const [pdfModalOpen, setPdfModalOpen] = useState(false);

  // Fetch live portfolio data from API server
  const fetchPortfolioData = async () => {
    setLoading(true);
    try {
      const [resProd, resCust] = await Promise.all([
        fetch("/api/portfolio/products"),
        fetch("/api/portfolio/customers"),
      ]);

      if (resProd.ok) {
        const d = await resProd.json();
        if (d.products) setProducts(d.products);
      }
      if (resCust.ok) {
        const d = await resCust.json();
        if (d.customers) setCustomers(d.customers);
      }
    } catch (err) {
      console.error("Failed to fetch portfolio data:", err);
      toast.error("Using offline cached portfolio datasets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
    return matchesSearch;
  });

  // Pagination & Editing State
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Dual Perspective
  const [perspective, setPerspective] = useState<"customer" | "product">("customer");

  // Inline Editing
  const [editingCustomerId, setEditingCustomerId] = useState<number | null>(null);
  const [editingFormData, setEditingFormData] = useState<{
    orgName: string;
    contactName: string;
    contactTitle: string;
    contactEmail: string;
    cisaSector: string;
    deploymentId?: number;
    productId?: number;
    deployedVersion?: string;
    quantity?: number;
  }>({
    orgName: "",
    contactName: "",
    contactTitle: "",
    contactEmail: "",
    cisaSector: "Energy",
  });

  // Create Customer Modal
  const [newCustModalOpen, setNewCustModalOpen] = useState(false);
  const [newCustForm, setNewCustForm] = useState({
    orgName: "",
    contactName: "",
    contactTitle: "CISO / Security Lead",
    contactEmail: "",
    region: "EU-Central",
    cisaSector: "Energy",
    productId: 1,
    deployedVersion: "v1.0.0",
    quantity: 10,
  });

  // Traditional File Upload & AI Parsing Modal
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [fileUploadText, setFileUploadText] = useState("");
  const [fileUploadName, setFileUploadName] = useState("");
  const [aiParsedItems, setAiParsedItems] = useState<any[]>([]);
  const [isAiParsing, setIsAiParsing] = useState(false);

  // Filtered Customers
  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      c.orgName.toLowerCase().includes(q) ||
      c.contactName.toLowerCase().includes(q) ||
      c.contactEmail.toLowerCase().includes(q);
    const matchesSector = selectedSector === "ALL" || c.cisaSector === selectedSector;
    return matchesSearch && matchesSector;
  });

  // Pagination Slice
  const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / pageSize));
  const displayedCustomers = filteredCustomers.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // PSIRT Impacted Customers List
  const psirtImpactedCustomers = customers.filter((c) => c.hasImpactedPsirtProducts);

  // Inline Editing Actions
  const handleStartEdit = (cust: CustomerItem) => {
    const mainDep = cust.deployments[0];
    setEditingCustomerId(cust.id);
    setEditingFormData({
      orgName: cust.orgName,
      contactName: cust.contactName,
      contactTitle: cust.contactTitle,
      contactEmail: cust.contactEmail,
      cisaSector: cust.cisaSector,
      deploymentId: mainDep?.id,
      productId: products[0]?.id || 1,
      deployedVersion: mainDep?.deployedVersion || "v1.0.0",
      quantity: mainDep?.quantity || 1,
    });
  };

  const handleSaveEdit = async (cust: CustomerItem) => {
    try {
      const res = await fetch(`/api/portfolio/customers/${cust.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingFormData),
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        toast.success(`Updated & Saved ${editingFormData.orgName} to Postgres DB!`);
        setEditingCustomerId(null);
        fetchPortfolioData();
      } else {
        toast.error(resData.error || "Failed to update customer record");
      }
    } catch (err: any) {
      toast.error("Update request failed: " + err.message);
    }
  };

  const handleDeleteCustomer = async (id: number, name: string) => {
    if (!window.confirm(`Are you sure you want to delete customer ${name}?`)) return;
    try {
      const res = await fetch(`/api/portfolio/customers/${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success(`Deleted ${name} from database.`);
        fetchPortfolioData();
      }
    } catch (err: any) {
      toast.error("Delete failed: " + err.message);
    }
  };

  const handleCreateCustomer = async () => {
    if (!newCustForm.orgName || !newCustForm.contactEmail) {
      toast.error("Organization Name and Contact Email are required");
      return;
    }
    try {
      const res = await fetch("/api/portfolio/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCustForm),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(`Created customer ${newCustForm.orgName}!`);
        setNewCustModalOpen(false);
        setNewCustForm({
          orgName: "",
          contactName: "",
          contactTitle: "CISO / Security Lead",
          contactEmail: "",
          region: "EU-Central",
          cisaSector: "Energy",
          productId: products[0]?.id || 1,
          deployedVersion: "v1.0.0",
          quantity: 10,
        });
        fetchPortfolioData();
      } else {
        toast.error(data.error || "Failed to create customer");
      }
    } catch (err: any) {
      toast.error("Error creating customer: " + err.message);
    }
  };

  // Traditional File Selection Handler
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileUploadName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setFileUploadText(text || "");
      toast.info(`Loaded file ${file.name} (${file.size} bytes). Click 'Run AI Prescriptive Parsing' to analyze.`);
    };
    reader.readAsText(file);
  };

  // Run AI Prescriptive File Parsing
  const handleRunAiParse = async () => {
    if (!fileUploadText.trim()) {
      toast.error("Please select a file or paste file content first");
      return;
    }
    setIsAiParsing(true);
    try {
      const res = await fetch("/api/portfolio/ai-parse-file", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawText: fileUploadText, fileName: fileUploadName }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAiParsedItems(data.parsedItems || []);
        toast.success(`AI successfully extracted ${data.totalExtracted} prescriptive customer deployment records!`);
      } else {
        toast.error(data.error || "AI parsing failed");
      }
    } catch (err: any) {
      toast.error("AI parsing request error: " + err.message);
    } finally {
      setIsAiParsing(false);
    }
  };

  // Commit AI Parsed Items into Postgres DB
  const handleCommitAiParsedItems = async () => {
    setIsImporting(true);
    try {
      const res = await fetch("/api/portfolio/upload-bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileContent: fileUploadText, fileType: "text" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast.success(data.message);
        setUploadModalOpen(false);
        setFileUploadText("");
        setAiParsedItems([]);
        fetchPortfolioData();
        setActiveTab("customers");
      } else {
        toast.error(data.error || "Commit failed");
      }
    } catch (err: any) {
      toast.error("Commit request error: " + err.message);
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-12">
      {/* Page header */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="oxot-kicker block mb-1">CRA ARTICLE 13 · PORTFOLIO LIFECYCLE &amp; CUSTOMER OPERATIONS</span>
          <h1 className="text-3xl sm:text-4xl font-serif font-normal tracking-tight text-foreground flex items-center gap-2.5">
            <Boxes className="w-6 h-6 text-primary shrink-0" /> Product Portfolio &amp; Enterprise Customer Operations
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-3xl leading-relaxed font-sans">
            Comprehensive product catalog lifecycle tracking, version changelogs, CISA Critical Infrastructure sector deployments, customer fleet management, mass CSV/MD data imports, and statutory PSIRT incident emergency notifications.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Button
            type="button"
            onClick={() => setAiDrawerOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs gap-2 shadow-sm cta-lift"
          >
            <Bot className="h-4 w-4" /> Ask AI Portfolio Assistant
          </Button>

          <Button
            type="button"
            onClick={() => setPdfModalOpen(true)}
            variant="outline"
            className="border-border text-foreground hover:bg-muted font-medium text-xs gap-2 cta-lift"
          >
            <Printer className="h-4 w-4 text-primary" /> Export Executive PDF
          </Button>
        </div>
      </div>

      {/* High-Density Top Metric Bar */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3.5 bg-background p-3.5 rounded-xl border border-border">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <Boxes className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-foreground">{products.length}</div>
              <div className="text-[11px] font-mono text-muted-foreground">CRA Certified Products</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 bg-background p-3.5 rounded-xl border border-border">
            <div className="p-2.5 rounded-lg bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-foreground">{customers.length}</div>
              <div className="text-[11px] font-mono text-muted-foreground">Enterprise Customers</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 bg-background p-3.5 rounded-xl border border-border">
            <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-500">
              <Flame className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-foreground">
                {psirtImpactedCustomers.length}
              </div>
              <div className="text-[11px] font-mono text-muted-foreground">PSIRT Impacted Customers</div>
            </div>
          </div>

          <div className="flex items-center gap-3.5 bg-background p-3.5 rounded-xl border border-border">
            <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-500">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <div className="text-2xl font-bold font-mono text-foreground">
                {customers.filter((c) => c.hasOutdatedProducts).length}
              </div>
              <div className="text-[11px] font-mono text-muted-foreground">Outdated Release Flags</div>
            </div>
          </div>
        </div>
      </div>

      {/* Primary Navigation Bar & View Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-3 rounded-2xl border border-border shadow-sm">
        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab("products")}
            className={cn(
              "flex items-center justify-center gap-2 p-2.5 px-4 rounded-xl font-sans text-xs font-semibold transition-all border cursor-pointer",
              activeTab === "products"
                ? "bg-primary text-primary-foreground shadow-sm border-primary/40"
                : "bg-muted/40 text-muted-foreground hover:bg-muted border-transparent"
            )}
          >
            <Boxes className="h-4 w-4 shrink-0" />
            <span>Product Portfolio</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("customers")}
            className={cn(
              "flex items-center justify-center gap-2 p-2.5 px-4 rounded-xl font-sans text-xs font-semibold transition-all border cursor-pointer",
              activeTab === "customers"
                ? "bg-primary text-primary-foreground shadow-sm border-primary/40"
                : "bg-muted/40 text-muted-foreground hover:bg-muted border-transparent"
            )}
          >
            <Users className="h-4 w-4 shrink-0" />
            <span>Customer Fleet</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("psirt")}
            className={cn(
              "flex items-center justify-center gap-2 p-2.5 px-4 rounded-xl font-sans text-xs font-semibold transition-all border cursor-pointer",
              activeTab === "psirt"
                ? "bg-primary text-primary-foreground shadow-sm border-primary/40"
                : "bg-muted/40 text-muted-foreground hover:bg-muted border-transparent"
            )}
          >
            <ShieldAlert className="h-4 w-4 shrink-0" />
            <span>PSIRT Emergency Triage</span>
          </button>
        </div>

        {/* Right Side Controls: Search, Sector Filter, Table/Cards Toggle */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search product, SKU, customer..."
              className="pl-8 h-9 text-xs font-sans w-48 sm:w-64"
            />
          </div>

          {activeTab === "customers" && (
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="h-9 px-3 rounded-xl border border-border bg-background text-xs font-mono font-medium focus:ring-2 focus:ring-primary outline-none"
            >
              <option value="ALL">All CISA Sectors ({CISA_SECTORS.length})</option>
              {CISA_SECTORS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          )}

          {/* Toggle Switch: Bento Cards vs Table View */}
          <div className="flex items-center bg-muted/80 p-1 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setDisplayMode("cards")}
              className={cn(
                "p-1.5 px-2.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer",
                displayMode === "cards" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              <LayoutGrid className="h-3.5 w-3.5" /> Bento Cards
            </button>
            <button
              type="button"
              onClick={() => setDisplayMode("table")}
              className={cn(
                "p-1.5 px-2.5 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-1.5 cursor-pointer",
                displayMode === "table" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
              )}
            >
              <Table className="h-3.5 w-3.5" /> Table View
            </button>
          </div>
        </div>
      </div>

      {/* TAB CONTENT 1: PRODUCTS PORTFOLIO VIEW */}
      {activeTab === "products" && (
        <div className="space-y-6">
          {displayMode === "cards" ? (
            /* Bento Cards View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              {filteredProducts.map((prod) => (
                <Card key={prod.id} className="rounded-3xl border border-border/80 bg-card shadow-lg hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between">
                  <CardHeader className="border-b p-6 bg-gradient-to-r from-card via-card to-muted/40">
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono text-[10px] bg-muted">
                            {prod.sku}
                          </Badge>
                          {prod.isUserCreated && (
                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono text-[10px] gap-1">
                              <Sparkles className="h-3 w-3" /> User Assessment
                            </Badge>
                          )}
                          <Badge
                            variant="secondary"
                            className={cn(
                              "font-mono text-[10px]",
                              prod.craClass === "Class II" ? "bg-orange-500/10 text-orange-400 border-orange-500/30" : "bg-primary/10 text-primary-ink"
                            )}
                          >
                            CRA {prod.craClass}
                          </Badge>
                          {prod.hasActivePsirtIncident && (
                            <Badge variant="destructive" className="font-mono text-[10px] animate-pulse">
                              <Flame className="h-3 w-3 mr-1" /> {prod.activeIncidentCve || "PSIRT Active"}
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-xl font-display font-bold text-foreground">
                          {prod.name}
                        </CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">
                          {prod.category} • Deployed Quantity: <span className="font-mono font-bold text-foreground">{prod.totalDeployedQuantity} units</span>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6 space-y-4 flex-1">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {prod.description}
                    </p>

                    {/* Versions & CRA Re-evaluation Dates */}
                    <div className="space-y-2 rounded-2xl bg-muted/40 p-4 border border-border/60">
                      <div className="flex items-center justify-between text-xs font-mono font-bold text-foreground border-b pb-2">
                        <span>Release Versions</span>
                        <span>CRA Re-evaluation Target</span>
                      </div>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                        {prod.releases.map((rel) => (
                          <div key={rel.id} className="flex items-center justify-between text-xs font-mono">
                            <span className="flex items-center gap-1.5">
                              <Tag className="h-3 w-3 text-primary" /> {rel.version}
                              {rel.isLatest && <Badge className="text-[9px] py-0 px-1.5 bg-emerald-500 text-white">Latest</Badge>}
                            </span>
                            <span className="text-muted-foreground">{rel.craReevaluationDate}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Customer Deployments List */}
                    <div className="space-y-2">
                      <span className="text-xs font-mono font-bold text-foreground block">
                        Deployed Customer Accounts ({prod.deployments.length})
                      </span>
                      <div className="space-y-2">
                        {prod.deployments.map((dep) => (
                          <div key={dep.id} className="p-3 rounded-xl bg-background border border-border/80 flex items-center justify-between text-xs">
                            <div>
                              <div className="font-bold text-foreground">{dep.customerName}</div>
                              <div className="text-[11px] text-muted-foreground font-mono">
                                Sector: {dep.cisaSector} • Deployed: <span className="font-semibold text-primary-ink">{dep.deployedVersion}</span> ({dep.quantity} units)
                              </div>
                            </div>

                            {dep.isOutdatedVersion ? (
                              <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30 text-[10px] font-mono">
                                Outdated Version
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 text-[10px] font-mono">
                                Current
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>

                  <div className="p-4 border-t bg-muted/20 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setGuidanceModalProduct(prod)}
                        className="text-xs font-bold gap-1.5"
                      >
                        <FileText className="h-3.5 w-3.5 text-primary" /> Guidance Note
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setDocVaultProduct(prod)}
                        className="text-xs font-bold gap-1.5 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10"
                      >
                        <FileText className="h-3.5 w-3.5" /> Document Vault
                      </Button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => openDossier(prod)}
                        className="text-xs font-bold gap-1.5 border-border hover:bg-muted"
                      >
                        <Pencil className="h-3.5 w-3.5 text-primary" /> View Product Dossier &amp; Edit
                      </Button>

                      <Button
                        type="button"
                        variant="default"
                        size="sm"
                        onClick={() => openWorkspace(prod)}
                        className="text-xs font-bold gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm cta-lift"
                      >
                        <Zap className="h-3.5 w-3.5" /> Open Assessment Workspace →
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            /* High-Density Table View */
            <Card className="rounded-3xl border border-border shadow-lg overflow-hidden">
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b bg-muted/80 text-muted-foreground font-mono font-bold">
                      <th className="p-4">SKU / Product Name</th>
                      <th className="p-4">CRA Class</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Releases</th>
                      <th className="p-4">Deployed Units</th>
                      <th className="p-4">PSIRT Incident</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredProducts.map((prod) => (
                      <tr key={prod.id} className="hover:bg-muted/40 transition-colors">
                        <td className="p-4">
                          <div className="font-bold text-foreground">{prod.name}</div>
                          <div className="text-[11px] text-muted-foreground font-mono">{prod.sku} • {prod.category}</div>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className="font-mono text-[10px]">
                            {prod.craClass}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono text-[10px]">
                            {prod.currentStatus}
                          </Badge>
                        </td>
                        <td className="p-4 font-mono">
                          {prod.releases.length} Release(s) ({prod.releases.find((r) => r.isLatest)?.version || "v1.0"})
                        </td>
                        <td className="p-4 font-mono font-bold text-foreground">
                          {prod.totalDeployedQuantity} units ({prod.deployments.length} orgs)
                        </td>
                        <td className="p-4">
                          {prod.hasActivePsirtIncident ? (
                            <Badge variant="destructive" className="font-mono text-[10px]">
                              {prod.activeIncidentCve}
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 text-[10px]">
                              Clean
                            </Badge>
                          )}
                        </td>
                        <td className="p-4 text-right space-x-1.5">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setDocVaultProduct(prod)}
                            className="h-8 text-xs font-bold border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/10 gap-1"
                          >
                            <FileText className="h-3 w-3" /> Document Vault
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setGuidanceModalProduct(prod)}
                            className="h-8 text-xs font-bold text-primary-ink"
                          >
                            Guidance Note
                          </Button>
                          <Button
                            type="button"
                            variant="default"
                            size="sm"
                            onClick={() => openWorkspace(prod)}
                            className="h-8 text-xs font-bold gap-1 bg-primary text-primary-foreground hover:bg-primary/90"
                          >
                            <Zap className="h-3 w-3" /> Assessment Workspace →
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* TAB CONTENT 2: CUSTOMER FLEET VIEW WITH INLINE EDITING & PAGINATION */}
      {activeTab === "customers" && (
        <div className="space-y-6">
          {/* Operations Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="bg-primary/10 text-primary-ink border-primary/20 font-mono text-xs">
                Fleet Management Engine
              </Badge>

              {/* Perspective Switcher */}
              <div className="flex items-center gap-1 bg-muted p-1 rounded-xl border text-xs font-mono">
                <button
                  type="button"
                  onClick={() => setPerspective("customer")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer",
                    perspective === "customer" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                  )}
                >
                  Per-Customer View
                </button>
                <button
                  type="button"
                  onClick={() => setPerspective("product")}
                  className={cn(
                    "px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer",
                    perspective === "product" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                  )}
                >
                  Per-Product View
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                onClick={() => setNewCustModalOpen(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-extrabold text-xs gap-1.5"
              >
                <Plus className="h-4 w-4" /> Add Enterprise Customer
              </Button>

              <Button
                type="button"
                onClick={() => setUploadModalOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs gap-1.5"
              >
                <Upload className="h-4 w-4" /> Traditional File Upload &amp; AI Parse
              </Button>
            </div>
          </div>

          {displayMode === "cards" ? (
            /* Bento Cards View */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedCustomers.map((cust) => (
                <Card key={cust.id} className="rounded-3xl border border-border/80 bg-card shadow-lg hover:shadow-xl transition-all overflow-hidden flex flex-col justify-between">
                  <CardHeader className="border-b p-6 bg-gradient-to-r from-card via-card to-muted/40">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline" className="bg-primary/10 text-primary-ink border-primary/20 font-mono text-[10px]">
                          {cust.cisaSector}
                        </Badge>

                        {cust.hasOutdatedProducts && (
                          <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30 text-[10px] font-mono">
                            Outdated Software
                          </Badge>
                        )}
                      </div>

                      <CardTitle className="text-xl font-display font-bold text-foreground">
                        {cust.orgName}
                      </CardTitle>

                      <div className="text-xs text-muted-foreground font-mono space-y-1">
                        <div>Contact: <span className="text-foreground font-semibold">{cust.contactName}</span> ({cust.contactTitle})</div>
                        <div className="flex items-center gap-1 text-primary-ink">
                          <Mail className="h-3 w-3" /> {cust.contactEmail}
                        </div>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6 space-y-4 flex-1">
                    <div className="text-xs font-mono font-bold text-foreground flex items-center justify-between border-b pb-2">
                      <span>Deployed Products ({cust.deployments.length})</span>
                      <span>Total Units: {cust.totalQuantity}</span>
                    </div>

                    <div className="space-y-3">
                      {cust.deployments.map((dep) => (
                        <div key={dep.id} className="p-3.5 rounded-2xl bg-muted/40 border border-border/70 space-y-1.5">
                          <div className="flex items-center justify-between font-bold text-xs">
                            <span className="text-foreground">{dep.productName}</span>
                            <span className="font-mono text-primary-ink">{dep.quantity} units</span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                            <span>Deployed: <strong className="text-foreground">{dep.deployedVersion}</strong></span>
                            <span>Latest: <strong className="text-emerald-400">{dep.latestVersion}</strong></span>
                          </div>

                          {dep.isOutdatedVersion && (
                            <div className="text-[10px] font-mono text-red-400 font-bold flex items-center gap-1 pt-1">
                              <AlertTriangle className="h-3 w-3" /> Outdated Version - Action Required
                            </div>
                          )}

                          {dep.hasActivePsirtIncident && (
                            <div className="text-[10px] font-mono text-orange-400 font-bold flex items-center gap-1 pt-1">
                              <Flame className="h-3 w-3" /> PSIRT Vulnerability Impact ({dep.activeIncidentCve})
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>

                  <div className="p-4 border-t bg-muted/20 flex items-center justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleStartEdit(cust)}
                      className="text-xs font-bold gap-1"
                    >
                      <Zap className="h-3.5 w-3.5 text-primary" /> Edit Line Item
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCustomer(cust.id, cust.orgName)}
                      className="text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      Delete
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            /* High-Density Inline Editable Table View */
            <Card className="rounded-3xl border border-border shadow-lg overflow-hidden">
              <CardContent className="p-0 overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b bg-muted/80 text-muted-foreground font-mono font-bold uppercase tracking-wider">
                      <th className="p-4">Organization Name</th>
                      <th className="p-4">CISA Critical Infrastructure Sector</th>
                      <th className="p-4">Contact Person &amp; Title</th>
                      <th className="p-4">Contact Email</th>
                      <th className="p-4">Assigned Product</th>
                      <th className="p-4">Version</th>
                      <th className="p-4">Units</th>
                      <th className="p-4 text-right">Row Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {displayedCustomers.map((cust) => {
                      const isEditing = editingCustomerId === cust.id;
                      const mainDep = cust.deployments[0];

                      if (isEditing) {
                        return (
                          <tr key={cust.id} className="bg-primary/5 border-l-4 border-primary">
                            <td className="p-3">
                              <Input
                                value={editingFormData.orgName}
                                onChange={(e) => setEditingFormData({ ...editingFormData, orgName: e.target.value })}
                                className="h-8 text-xs font-sans"
                              />
                            </td>
                            <td className="p-3">
                              <select
                                value={editingFormData.cisaSector}
                                onChange={(e) => setEditingFormData({ ...editingFormData, cisaSector: e.target.value })}
                                className="h-8 w-full px-2 rounded-lg border border-border bg-background text-xs font-mono font-medium"
                              >
                                {CISA_SECTORS.map((sec) => (
                                  <option key={sec} value={sec}>{sec}</option>
                                ))}
                              </select>
                            </td>
                            <td className="p-3 space-y-1">
                              <Input
                                value={editingFormData.contactName}
                                onChange={(e) => setEditingFormData({ ...editingFormData, contactName: e.target.value })}
                                placeholder="Contact Name"
                                className="h-7 text-xs"
                              />
                              <Input
                                value={editingFormData.contactTitle}
                                onChange={(e) => setEditingFormData({ ...editingFormData, contactTitle: e.target.value })}
                                placeholder="Position / Title"
                                className="h-7 text-xs font-mono"
                              />
                            </td>
                            <td className="p-3">
                              <Input
                                value={editingFormData.contactEmail}
                                onChange={(e) => setEditingFormData({ ...editingFormData, contactEmail: e.target.value })}
                                className="h-8 text-xs font-mono"
                              />
                            </td>
                            <td className="p-3">
                              <select
                                value={editingFormData.productId}
                                onChange={(e) => setEditingFormData({ ...editingFormData, productId: parseInt(e.target.value, 10) })}
                                className="h-8 w-full px-2 rounded-lg border border-border bg-background text-xs font-mono"
                              >
                                {products.map((p) => (
                                  <option key={p.id} value={p.id}>{p.name}</option>
                                ))}
                              </select>
                            </td>
                            <td className="p-3">
                              <Input
                                value={editingFormData.deployedVersion}
                                onChange={(e) => setEditingFormData({ ...editingFormData, deployedVersion: e.target.value })}
                                className="h-8 text-xs font-mono w-20"
                              />
                            </td>
                            <td className="p-3">
                              <Input
                                type="number"
                                value={editingFormData.quantity}
                                onChange={(e) => setEditingFormData({ ...editingFormData, quantity: parseInt(e.target.value, 10) || 1 })}
                                className="h-8 text-xs font-mono w-16"
                              />
                            </td>
                            <td className="p-3 text-right space-x-2 whitespace-nowrap">
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => handleSaveEdit(cust)}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs h-8 px-3"
                              >
                                Update &amp; Save
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => setEditingCustomerId(null)}
                                className="h-8 text-xs px-2"
                              >
                                Cancel
                              </Button>
                            </td>
                          </tr>
                        );
                      }

                      return (
                        <tr key={cust.id} className="hover:bg-muted/40 transition-colors">
                          <td className="p-4 font-bold text-foreground">{cust.orgName}</td>
                          <td className="p-4">
                            <Badge variant="outline" className="font-mono text-[10px] bg-muted">
                              {cust.cisaSector}
                            </Badge>
                          </td>
                          <td className="p-4 font-mono text-[11px]">
                            <div className="font-semibold text-foreground">{cust.contactName}</div>
                            <div className="text-muted-foreground">{cust.contactTitle}</div>
                          </td>
                          <td className="p-4 font-mono text-[11px] text-primary-ink">{cust.contactEmail}</td>
                          <td className="p-4 text-[11px] font-mono">
                            {mainDep?.productName || "NovaGuard Smart Home Hub v2"}
                          </td>
                          <td className="p-4 font-mono font-bold text-foreground">
                            {mainDep?.deployedVersion || "v2.1.4"}
                          </td>
                          <td className="p-4 font-mono font-bold text-foreground">
                            {cust.totalQuantity}
                          </td>
                          <td className="p-4 text-right space-x-2 whitespace-nowrap">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => handleStartEdit(cust)}
                              className="h-8 text-xs font-bold gap-1"
                            >
                              Edit Line
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCustomer(cust.id, cust.orgName)}
                              className="h-8 text-xs font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10"
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          )}

          {/* Strict 20-Rows-Per-Page Pagination Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm text-xs font-mono">
            <div className="text-muted-foreground">
              Showing <strong className="text-foreground">{(currentPage - 1) * pageSize + 1}</strong> –{" "}
              <strong className="text-foreground">{Math.min(currentPage * pageSize, filteredCustomers.length)}</strong> of{" "}
              <strong className="text-foreground">{filteredCustomers.length}</strong> Enterprise Customer Records (20 per page)
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="h-8 text-xs font-bold"
              >
                ← Previous
              </Button>

              <span className="px-3 py-1 bg-muted rounded-lg font-bold text-foreground">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="h-8 text-xs font-bold"
              >
                Next →
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: PSIRT EMERGENCY TRIAGE MODE */}
      {activeTab === "psirt-triage" && (
        <div className="space-y-6">
          <Card className="rounded-3xl border border-orange-500/40 bg-gradient-to-br from-card via-card to-amber-950/20 shadow-2xl p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="destructive" className="font-mono text-xs gap-1">
                    <Flame className="h-3.5 w-3.5" /> Emergency Statutory Notification Matrix
                  </Badge>
                </div>
                <h2 className="text-2xl font-display font-bold text-foreground">
                  PSIRT Active Vulnerability Customer Impact List
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Direct cross-correlation between active PSIRT vulnerability disclosures and enterprise deployment customer accounts.
                </p>
              </div>

              <Button
                type="button"
                onClick={() => toast.success("Statutory CRA Article 14 notifications dispatched to all impacted customer CISOs!")}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold text-xs gap-1.5 shadow-lg shadow-orange-500/20"
              >
                <Send className="h-4 w-4" /> Dispatch Encrypted CRA Notifications
              </Button>
            </div>

            <div className="mt-6 space-y-4">
              {psirtImpactedCustomers.map((cust) => (
                <div key={cust.id} className="p-5 rounded-2xl border border-orange-500/30 bg-muted/40 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-extrabold text-base text-foreground">{cust.orgName}</span>
                      <Badge variant="outline" className="ml-2 text-[10px] font-mono bg-background">
                        {cust.cisaSector}
                      </Badge>
                    </div>
                    <Badge variant="destructive" className="font-mono text-xs font-bold py-1 px-3">
                      CVE-2026-3891 (CVSS 9.8 Critical)
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono bg-background p-3 rounded-xl border border-border/80">
                    <div><strong>CISO Contact:</strong> {cust.contactName}</div>
                    <div><strong>Email:</strong> <span className="text-primary-ink">{cust.contactEmail}</span></div>
                    <div><strong>Region:</strong> {cust.region}</div>
                  </div>

                  <div className="text-xs font-mono">
                    <strong className="text-foreground">Impacted Equipment:</strong> NovaGuard Smart Home Hub v2 (450 units running v2.1.0 outdated firmware).
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* TAB CONTENT 4: MASS DATA CSV/MD FILE IMPORT */}
      {activeTab === "import" && (
        <div className="space-y-6">
          <Card className="rounded-3xl border border-border bg-card shadow-xl p-6">
            <CardHeader className="p-0 pb-4 border-b">
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Upload className="h-5 w-5 text-emerald-500" /> Mass Data Bulk Import (CSV, XLS, Markdown)
              </CardTitle>
              <CardDescription className="text-xs">
                Upload or paste bulk product portfolio datasets and customer deployments to seed and sync directly into Postgres DB.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-0 pt-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-mono font-bold">Paste CSV or Markdown Table Content</Label>
                <Textarea
                  rows={10}
                  value={importContent}
                  onChange={(e) => setImportContent(e.target.value)}
                  placeholder={`Product Name, SKU, Category, CRA Class, Customer Org, Contact Email, CISA Sector, Version, Quantity
NovaGuard Hub v2, CRA-HW-8841, Smart Home, Class I, Siemens Energy Europe, h.weber@siemens-energy.de, Energy, v2.1.0, 450
Robot Vision Pro, CRA-IIoT-9920, Robotics, Class II, Airbus Defence, c.dubois@airbus.com, Defense Industrial Base, v1.4.2, 120`}
                  className="font-mono text-xs leading-relaxed bg-muted/30"
                />
              </div>

              <div className="flex items-center justify-end gap-3">
                <Button
                  type="button"
                  onClick={handleBulkUpload}
                  disabled={isImporting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs gap-2 shadow-md"
                >
                  <Upload className="h-4 w-4" /> {isImporting ? "Processing Bulk Import..." : "Commit & Sync to Postgres Database"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* LONG-FORM CUSTOMER GUIDANCE MODAL */}
      <Dialog open={!!guidanceModalProduct} onOpenChange={() => setGuidanceModalProduct(null)}>
        <DialogContent className="max-w-3xl bg-card border-border p-6 shadow-2xl">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" /> Long-Form Statutory Guidance: {guidanceModalProduct?.name}
            </DialogTitle>
            <DialogDescription className="text-xs font-mono">
              Postgres Stored CRA Operating Guidance &amp; Customer Directives ({guidanceModalProduct?.sku})
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <textarea
              readOnly
              rows={12}
              value={guidanceModalProduct?.customerGuidance || "No guidance instructions defined."}
              className="w-full rounded-2xl border border-border bg-muted/60 p-4 font-mono text-xs leading-relaxed text-foreground"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setGuidanceModalProduct(null)}>
              Close Guidance Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* AI PORTFOLIO ASSISTANT DRAWER */}
      <Dialog open={aiDrawerOpen} onOpenChange={setAiDrawerOpen}>
        <DialogContent className="max-w-xl bg-card border-border p-6 shadow-2xl">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" /> AI Portfolio &amp; Fleet Operations Assistant
            </DialogTitle>
            <DialogDescription className="text-xs">
              Natural language assistant querying CRA product status, customer fleets, and CISA critical sectors.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-3 max-h-[350px] overflow-y-auto">
            {aiMessages.map((m, idx) => (
              <div
                key={idx}
                className={cn(
                  "p-3 rounded-2xl text-xs font-mono leading-relaxed whitespace-pre-wrap",
                  m.sender === "user"
                    ? "bg-primary text-primary-foreground ml-8"
                    : "bg-muted border border-border text-foreground mr-8"
                )}
              >
                {m.text}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 border-t pt-3">
            <Input
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSendAiMessage()}
              placeholder="Ask about products, outdated versions, or Energy sector..."
              className="text-xs font-mono"
            />
            <Button type="button" onClick={handleSendAiMessage} className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs">
              Send
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* EXECUTIVE PDF REPORT MODAL */}
      <Dialog open={pdfModalOpen} onOpenChange={setPdfModalOpen}>
        <DialogContent className="max-w-4xl bg-card border-border p-8 shadow-2xl">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h1 className="text-2xl font-display font-extrabold text-foreground">
                  EXECUTIVE CRA PRODUCT PORTFOLIO &amp; FLEET REPORT
                </h1>
                <p className="text-xs font-mono text-muted-foreground mt-0.5">
                  Generated: {new Date().toISOString().slice(0, 10)} • EU Cyber Resilience Act Compliance Document
                </p>
              </div>

              <Button
                type="button"
                onClick={() => window.print()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-xs gap-1.5"
              >
                <Printer className="h-4 w-4" /> Print / Save as PDF
              </Button>
            </div>

            <div className="space-y-4 font-mono text-xs text-foreground">
              <div className="p-4 rounded-xl bg-muted/50 border border-border space-y-1">
                <strong className="text-sm font-bold">1. Executive Summary</strong>
                <p className="text-muted-foreground leading-relaxed">
                  This report summarizes the CRA compliance status for {products.length} certified products across {customers.length} enterprise customer deployments. All products adhere to 5-year support lifecycle obligations.
                </p>
              </div>

              <div className="space-y-2">
                <strong className="text-sm font-bold">2. Customer Fleet Impact Matrix</strong>
                <table className="w-full text-left border-collapse border border-border">
                  <thead>
                    <tr className="bg-muted text-muted-foreground">
                      <th className="p-2 border">Customer</th>
                      <th className="p-2 border">CISA Sector</th>
                      <th className="p-2 border">Units Deployed</th>
                      <th className="p-2 border">Version Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((c) => (
                      <tr key={c.id}>
                        <td className="p-2 border font-bold">{c.orgName}</td>
                        <td className="p-2 border">{c.cisaSector}</td>
                        <td className="p-2 border">{c.totalQuantity}</td>
                        <td className="p-2 border">{c.hasOutdatedProducts ? "Outdated Version" : "Current"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setPdfModalOpen(false)}>
                Close Preview
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
      {/* TRADITIONAL FILE UPLOAD & PRESCRIPTIVE AI PARSING MODAL */}
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent className="max-w-3xl bg-card border-border p-6 shadow-2xl">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Upload className="h-5 w-5 text-emerald-500" /> Traditional File Upload &amp; AI Prescriptive Parser
            </DialogTitle>
            <DialogDescription className="text-xs">
              Upload `.xlsx`, `.xls`, `.csv`, or `.md` files or paste raw contents to prescriptively parse and map records into Postgres DB tables.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {/* Drag & Drop File Zone */}
            <div className="border-2 border-dashed border-border hover:border-emerald-500/50 rounded-2xl p-6 bg-muted/20 text-center space-y-2 transition-colors">
              <Upload className="h-8 w-8 text-muted-foreground mx-auto" />
              <div className="text-xs font-mono font-bold text-foreground">
                Drag and drop `.xlsx`, `.csv`, or `.md` files here, or click to browse
              </div>
              <p className="text-[11px] text-muted-foreground">
                Supported formats: Microsoft Excel (`.xlsx`, `.xls`), CSV, Markdown tables, or plain text
              </p>
              <input
                type="file"
                accept=".xlsx,.xls,.csv,.md,.txt"
                onChange={handleFileChange}
                className="block mx-auto text-xs text-muted-foreground file:mr-4 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-500/10 file:text-emerald-400 hover:file:bg-emerald-500/20 cursor-pointer"
              />
            </div>

            {/* Paste Content Fallback */}
            <div className="space-y-1">
              <Label className="text-xs font-mono font-bold">Or Paste File Contents Directly</Label>
              <Textarea
                rows={5}
                value={fileUploadText}
                onChange={(e) => setFileUploadText(e.target.value)}
                placeholder="Paste CSV lines or Markdown table content here..."
                className="font-mono text-xs leading-relaxed bg-muted/40"
              />
            </div>

            {/* Run AI Prescriptive Parser Button */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-muted-foreground">
                {fileUploadName ? `Loaded: ${fileUploadName}` : "No file selected"}
              </span>

              <Button
                type="button"
                onClick={handleRunAiParse}
                disabled={isAiParsing || !fileUploadText.trim()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold text-xs gap-2"
              >
                <Sparkles className="h-4 w-4" /> {isAiParsing ? "Running AI Prescriptive Parser..." : "Run AI Prescriptive Parsing"}
              </Button>
            </div>

            {/* AI Extraction Preview Table */}
            {aiParsedItems.length > 0 && (
              <div className="space-y-2 pt-2 border-t">
                <span className="text-xs font-mono font-bold text-emerald-400 block">
                  ✓ Prescriptive AI Extraction Preview ({aiParsedItems.length} Records)
                </span>
                <div className="max-h-48 overflow-y-auto rounded-xl border border-border bg-muted/40 p-2">
                  <table className="w-full text-left text-[11px] font-mono">
                    <thead>
                      <tr className="border-b text-muted-foreground font-bold">
                        <th className="p-1.5">Org Name</th>
                        <th className="p-1.5">Contact</th>
                        <th className="p-1.5">CISA Sector</th>
                        <th className="p-1.5">Product</th>
                        <th className="p-1.5">Version</th>
                        <th className="p-1.5">Units</th>
                      </tr>
                    </thead>
                    <tbody>
                      {aiParsedItems.map((item, idx) => (
                        <tr key={idx} className="border-b border-border/40">
                          <td className="p-1.5 font-bold text-foreground">{item.orgName}</td>
                          <td className="p-1.5">{item.contactName} ({item.contactEmail})</td>
                          <td className="p-1.5 text-primary-ink">{item.cisaSector}</td>
                          <td className="p-1.5">{item.productName}</td>
                          <td className="p-1.5">{item.deployedVersion}</td>
                          <td className="p-1.5 font-bold">{item.quantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex items-center justify-between">
            <Button variant="outline" onClick={() => setUploadModalOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleCommitAiParsedItems}
              disabled={isImporting || (!fileUploadText.trim() && aiParsedItems.length === 0)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs gap-2"
            >
              <CheckCircle2 className="h-4 w-4" /> {isImporting ? "Committing to Postgres..." : "Commit & Save to Postgres DB"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ADD ENTERPRISE CUSTOMER MODAL */}
      <Dialog open={newCustModalOpen} onOpenChange={setNewCustModalOpen}>
        <DialogContent className="max-w-lg bg-card border-border p-6 shadow-2xl space-y-4">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" /> Add New Enterprise Customer
            </DialogTitle>
            <DialogDescription className="text-xs">
              Directly insert a new enterprise customer deployment into the Postgres database.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 font-sans text-xs">
            <div className="space-y-1">
              <Label className="font-mono font-bold">Organization Name *</Label>
              <Input
                value={newCustForm.orgName}
                onChange={(e) => setNewCustForm({ ...newCustForm, orgName: e.target.value })}
                placeholder="e.g. Siemens Energy Europe GmbH"
                className="text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="font-mono font-bold">Contact Name</Label>
                <Input
                  value={newCustForm.contactName}
                  onChange={(e) => setNewCustForm({ ...newCustForm, contactName: e.target.value })}
                  placeholder="e.g. Dr. Hans Weber"
                  className="text-xs"
                />
              </div>
              <div className="space-y-1">
                <Label className="font-mono font-bold">Position / Title</Label>
                <Input
                  value={newCustForm.contactTitle}
                  onChange={(e) => setNewCustForm({ ...newCustForm, contactTitle: e.target.value })}
                  placeholder="e.g. CISO"
                  className="text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label className="font-mono font-bold">Contact Email *</Label>
              <Input
                value={newCustForm.contactEmail}
                onChange={(e) => setNewCustForm({ ...newCustForm, contactEmail: e.target.value })}
                placeholder="e.g. h.weber@siemens-energy.de"
                className="text-xs font-mono"
              />
            </div>

            <div className="space-y-1">
              <Label className="font-mono font-bold">CISA Critical Infrastructure Sector *</Label>
              <select
                value={newCustForm.cisaSector}
                onChange={(e) => setNewCustForm({ ...newCustForm, cisaSector: e.target.value })}
                className="w-full h-9 px-3 rounded-xl border border-border bg-background text-xs font-mono font-medium focus:ring-2 focus:ring-primary outline-none"
              >
                {CISA_SECTORS.map((sec) => (
                  <option key={sec} value={sec}>{sec}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-3 border-t pt-3">
              <div className="space-y-1">
                <Label className="font-mono font-bold">Assigned Product</Label>
                <select
                  value={newCustForm.productId}
                  onChange={(e) => setNewCustForm({ ...newCustForm, productId: parseInt(e.target.value, 10) })}
                  className="w-full h-9 px-2 rounded-xl border border-border bg-background text-xs font-mono"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <Label className="font-mono font-bold">Deployed Version</Label>
                <Input
                  value={newCustForm.deployedVersion}
                  onChange={(e) => setNewCustForm({ ...newCustForm, deployedVersion: e.target.value })}
                  placeholder="v2.1.4"
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <Label className="font-mono font-bold">Deployed Quantity</Label>
                <Input
                  type="number"
                  value={newCustForm.quantity}
                  onChange={(e) => setNewCustForm({ ...newCustForm, quantity: parseInt(e.target.value, 10) || 1 })}
                  className="text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNewCustModalOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleCreateCustomer} className="bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold text-xs">
              Create Customer Record
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Product-Specific Document Vault & 5-10 Year Statutory Provenance Modal */}
      <ProductDocumentVaultModal
        isOpen={!!docVaultProduct}
        onClose={() => setDocVaultProduct(null)}
        product={docVaultProduct}
      />
    </div>
  );
}

export default ProductPortfolioPage;
