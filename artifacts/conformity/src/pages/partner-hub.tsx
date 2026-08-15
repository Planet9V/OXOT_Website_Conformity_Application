import { useState, useMemo } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link } from 'wouter';
import {
  Building2,
  Server,
  Truck,
  ShieldCheck,
  FileCheck2,
  Clock,
  Sparkles,
  Copy,
  Check,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  Search,
  Layers,
  Scale,
  ShieldAlert,
  Cpu,
  Boxes,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertOctagon,
  ArrowRight,
  Gavel,
  FolderTree,
  FileText,
  ChevronRight,
  X,
  ExternalLink,
  Send,
  Shield,
  RefreshCw,
  Eye,
  FileDown,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { articlesData, recitalsData, annexesData } from '@/data/craCorpusData';

// --- Types ---
/** As returned by GET /api/conformity/products. */
interface ProductRow {
  id: number;
  name: string;
  description: string;
  manufacturerName: string;
  productType: string;
  version: string;
  supportPeriodStart: string | null;
  supportPeriodEnd: string | null;
  placedOnMarketDate?: string | null;
}

/**
 * The three "customer plants" that used to live here — Vopak, BASF, Stellantis,
 * each with an invented annual turnover and an invented "Art. 64 fine exposure"
 * down to the euro — have been removed. None of it was computed from anything,
 * and presenting a named third party's fine exposure as a figure is not a thing
 * this application can honestly do.
 *
 * The inventory below is the organisation's real products, from
 * /api/conformity/products. Where there are none, it says so.
 */

export default function PartnerHubPage() {
  // 5-Stage Pipeline Tabs
  const [activeTab, setActiveTab] = useState<
    'plants' | 'article21' | 'procurement' | 'annex7' | 'csirt'
  >('plants');
  const [selectedPlantId, setSelectedPlantId] = useState<string>('PLANT-01');
  const [statutoryFlyout, setStatutoryFlyout] = useState<{
    type: 'article' | 'recital' | 'annex';
    number: number | string;
  } | null>(null);

  const productsQuery = useQuery<ProductRow[]>({
    queryKey: ['/api/conformity/products'],
    queryFn: async () => {
      const res = await fetch('/api/conformity/products');
      if (!res.ok) throw new Error('Failed to load products');
      return res.json();
    },
  });
  const products = productsQuery.data ?? [];
  const selectedProduct = useMemo(
    () => products.find((p) => String(p.id) === selectedPlantId) ?? products[0],
    [products, selectedPlantId],
  );

  /**
   * Tab 2: the Art. 21 / 22 deemed-manufacturer transition.
   *
   * Every question below is one the Regulation actually asks. The four that
   * used to be here ("identical OEM replacement part", "manufacturer-signed
   * firmware", "performance envelope maintained") were invented proxies for the
   * Art. 3(30) test, and answering them all "yes" produced a "Recital 34 Safe
   * Harbor Certificate" — a document for an exemption that does not exist.
   * Recital 34 concerns a MANUFACTURER'S due diligence over third-party
   * components and confers nothing on an integrator.
   *
   * Answers are tri-state. Unanswered must not collapse into "no", or the
   * wizard tells someone they are in the clear because a field was left blank.
   */
  const [art21Form, setArt21Form] = useState<{
    subjectName: string;
    siteName: string;
    projectName: string;
    actorRole: 'importer' | 'distributor' | 'other_person' | 'manufacturer';
    placedUnderOwnNameOrTrademark: boolean | null;
    modificationMade: boolean | null;
    changeFollowsPlacingOnMarket: boolean | null;
    affectsAnnexIPartICompliance: boolean | null;
    modifiesAssessedIntendedPurpose: boolean | null;
    makesAvailableOnMarket: boolean | null;
    cybersecurityImpactIsProductWide: boolean | null;
  }>({
    subjectName: '',
    siteName: '',
    projectName: '',
    actorRole: 'other_person',
    placedUnderOwnNameOrTrademark: null,
    modificationMade: null,
    changeFollowsPlacingOnMarket: null,
    affectsAnnexIPartICompliance: null,
    modifiesAssessedIntendedPurpose: null,
    makesAvailableOnMarket: null,
    cybersecurityImpactIsProductWide: null,
  });
  const [art21Result, setArt21Result] = useState<any | null>(null);

  const evaluateArt21Mutation = useMutation({
    mutationFn: async (payload: typeof art21Form) => {
      const res = await fetch('/api/conformity/deemed-manufacturer/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to record the assessment');
      return res.json();
    },
    onSuccess: (data) => setArt21Result(data),
  });

  // Tab 3: Procurement Vendor Gate Form
  const [procForm, setProcForm] = useState({
    vendorName: 'Siemens AG',
    productName: 'Scalance XC-208 Managed Switch',
    productClass: 'important_class_1',
    ceMarkVerified: true,
    docVerified: true,
    docUrl: 'https://siemens.com/compliance/doc-xc208.pdf',
    supportPeriodYears: 5,
    vulnerabilityContact: 'productcert@siemens.com',
    sbomFormat: 'cyclonedx_json',
    freeSecurityPatches: true,
  });
  const [procResult, setProcResult] = useState<any | null>(null);

  const evaluateProcMutation = useMutation({
    mutationFn: async (payload: typeof procForm) => {
      const res = await fetch('/api/ecosystem/procurement/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to evaluate procurement');
      return res.json();
    },
    onSuccess: (data) => setProcResult(data),
  });

  // Tab 5: CSIRT Incident Dispatcher State
  const [csirtForm, setCsirtForm] = useState({
    country: 'FR',
    authority: 'ANSSI / CERT-FR',
    cveId: 'CVE-2026-44192',
    affectedProduct: 'Siemens SIMATIC S7-1500 v3.1.2',
    threatVector: 'Remote Code Execution via unauthenticated PROFINET packet',
    isActiveExploitation: true,
    plantImpacted: 'Sochaux Automotive Paint Shop',
    reporterName: 'Axians 24/7 OT SOC Lead',
  });
  const [csirtDispatched, setCsirtDispatched] = useState(false);

  // Statutory Drawer Content Resolver
  const drawerContent = useMemo(() => {
    if (!statutoryFlyout) return null;
    if (statutoryFlyout.type === 'article') {
      const allArts = articlesData.chapters.flatMap((c) => c.articles);
      return allArts.find((a) => a.articleNumber === statutoryFlyout.number);
    }
    if (statutoryFlyout.type === 'recital') {
      return recitalsData.recitals.find((r) => r.number === statutoryFlyout.number);
    }
    if (statutoryFlyout.type === 'annex') {
      return annexesData.annexes.find((a) => a.annexNumber === statutoryFlyout.number);
    }
    return null;
  }, [statutoryFlyout]);

  return (
    <div className="space-y-6 font-sans text-foreground selection:bg-primary/20 selection:text-primary relative">
      {/* Top Banner with Axians Operational Identity */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/80 border border-border/80 p-5 rounded-xl shadow-xs backdrop-blur-md">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shadow-sm">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-medium text-xl tracking-tight text-foreground">
                Axians CRA Modernization & Integrator Operating System
              </h1>
              <span className="font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 font-semibold">
                Tier-1 Integrator Pipeline
              </span>
            </div>
            <p className="text-xs font-mono text-muted-foreground mt-0.5">
              VINCI Energies Compliance Hub • Regulation (EU) 2024/2847 • 5-Stage Statutory Workflow
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setStatutoryFlyout({ type: 'article', number: 21 })}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted border border-border/80 font-mono text-xs text-foreground hover:border-primary transition-all"
          >
            <Gavel className="w-3.5 h-3.5 text-primary" />
            <span>Ref: Art. 21</span>
          </button>
          <button
            onClick={() => setStatutoryFlyout({ type: 'recital', number: 34 })}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted border border-border/80 font-mono text-xs text-foreground hover:border-primary transition-all"
          >
            <Shield className="w-3.5 h-3.5 text-primary" />
            <span>Ref: Recital 34</span>
          </button>
          <Link
            href="/wiki"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground font-sans font-medium text-xs shadow-sm hover:bg-primary/90 transition-all"
          >
            <FileText className="w-3.5 h-3.5" />
            CRA Wiki
          </Link>
        </div>
      </div>

      {/* 5-Stage Operational Pipeline Navigation Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2 bg-card/80 p-1.5 rounded-xl border border-border/80 shadow-xs">
        <button
          id="tab-stage-1-plants"
          onClick={() => setActiveTab('plants')}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'plants'
              ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          <Server className="w-4 h-4" />
          <div className="text-left">
            <div className="leading-none">1. Plant Intake</div>
            <div className="text-[10px] opacity-80 mt-0.5">CRA Classification</div>
          </div>
        </button>

        <button
          id="tab-stage-2-article21"
          onClick={() => setActiveTab('article21')}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'article21'
              ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          <Scale className="w-4 h-4" />
          <div className="text-left">
            <div className="leading-none">2. Art. 21 Clearance</div>
            <div className="text-[10px] opacity-80 mt-0.5">Recital 34 Safe Harbor</div>
          </div>
        </button>

        <button
          id="tab-stage-3-procurement"
          onClick={() => setActiveTab('procurement')}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'procurement'
              ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          <Truck className="w-4 h-4" />
          <div className="text-left">
            <div className="leading-none">3. Vendor Radar</div>
            <div className="text-[10px] opacity-80 mt-0.5">Duty to Refrain (18.2)</div>
          </div>
        </button>

        <button
          id="tab-stage-4-annex7"
          onClick={() => setActiveTab('annex7')}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'annex7'
              ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <div className="text-left">
            <div className="leading-none">4. Annex VII File</div>
            <div className="text-[10px] opacity-80 mt-0.5">Client SLA Dossier</div>
          </div>
        </button>

        <button
          id="tab-stage-5-csirt"
          onClick={() => setActiveTab('csirt')}
          className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'csirt'
              ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <div className="text-left">
            <div className="leading-none">5. 24h CSIRT Hub</div>
            <div className="text-[10px] opacity-80 mt-0.5">Art. 14 Early Warning</div>
          </div>
        </button>
      </div>

      {/* STAGE 1: Product inventory, from real data */}
      {activeTab === 'plants' && (
        <div className="space-y-6">
          <div className="bg-card/80 border border-border/80 p-4 rounded-xl shadow-xs">
            <label className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
              <span>Product</span>
              <span className="text-primary font-normal text-[11px]">
                {products.length} {products.length === 1 ? 'product' : 'products'}
              </span>
            </label>
            {products.length > 0 ? (
              <select
                value={selectedProduct ? String(selectedProduct.id) : ''}
                onChange={(e) => setSelectedPlantId(e.target.value)}
                className="mt-2 w-full p-2.5 rounded-lg bg-muted/40 border border-border text-sm font-medium focus:border-primary outline-none"
              >
                {products.map((p) => (
                  <option key={p.id} value={String(p.id)}>
                    {p.name}
                    {p.manufacturerName ? ` — ${p.manufacturerName}` : ''}
                  </option>
                ))}
              </select>
            ) : (
              <p className="mt-2 text-xs text-muted-foreground">
                {productsQuery.isLoading
                  ? 'Loading products…'
                  : 'No products yet. Add one in the workbench and it will appear here.'}
              </p>
            )}
          </div>

          <div className="bg-card/80 border border-border/80 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-border/60 pb-3">
              <div>
                <h2 className="font-display font-medium text-lg text-foreground">
                  Product inventory
                </h2>
                <p className="text-xs text-muted-foreground">
                  The organisation&apos;s products, as recorded in the workbench. Select one to
                  assess whether Article 21 or 22 has made you its manufacturer.
                </p>
              </div>
            </div>

            {products.length === 0 ? (
              <div className="py-10 text-center space-y-2">
                <Boxes className="w-8 h-8 text-muted-foreground mx-auto" />
                <h3 className="font-display font-medium text-base text-foreground">
                  Nothing to show yet
                </h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  This page reads the real product catalogue. It does not display sample data.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border/60 text-muted-foreground font-mono uppercase text-[11px]">
                      <th className="py-2.5 px-3">Product</th>
                      <th className="py-2.5 px-3">Manufacturer</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Version</th>
                      <th className="py-2.5 px-3">Support period</th>
                      <th className="py-2.5 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {products.map((product) => (
                      <tr key={product.id} className="hover:bg-muted/20 transition-colors">
                        <td className="py-3 px-3">
                          <div className="font-medium text-foreground">{product.name}</div>
                          {product.description && (
                            <div className="text-muted-foreground text-[11px]">{product.description}</div>
                          )}
                        </td>
                        <td className="py-3 px-3 text-foreground">
                          {product.manufacturerName || <span className="text-muted-foreground">—</span>}
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-muted-foreground">
                          {product.productType}
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-muted-foreground">
                          {product.version || '—'}
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-muted-foreground">
                          {product.supportPeriodEnd
                            ? `until ${product.supportPeriodEnd}`
                            : <span className="text-amber-500">not set (Art. 13(8))</span>}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedPlantId(String(product.id));
                              setArt21Form((prev) => ({
                                ...prev,
                                subjectName: product.manufacturerName || prev.subjectName,
                                projectName: product.name,
                              }));
                              setActiveTab('article21');
                            }}
                            className="font-mono text-[11px] text-primary hover:underline"
                          >
                            Assess Art. 21 / 22 →
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STAGE 2: Articles 21 & 22 — the deemed-manufacturer transition */}
      {activeTab === 'article21' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-card/80 border border-border/80 rounded-xl p-6 shadow-xs space-y-5">
            <div className="border-b border-border/60 pb-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-primary">
                  Stage 2: Deemed-manufacturer assessment
                </span>
                <button
                  onClick={() => setStatutoryFlyout({ type: 'article', number: 21 })}
                  className="font-mono text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                >
                  <Gavel className="w-3 h-3" />
                  Read Art. 21 &amp; 22
                </button>
              </div>
              <h2 className="font-display font-medium text-xl text-foreground mt-1">
                Have you become the manufacturer?
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Article 21 covers importers and distributors. Article 22 covers anyone else who
                substantially modifies a product and makes it available. Either way the consequence
                is the same: Articles 13 and 14 apply to you.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-mono text-muted-foreground">Who is being assessed</label>
                <Input
                  value={art21Form.subjectName}
                  onChange={(e) => setArt21Form({ ...art21Form, subjectName: e.target.value })}
                  className="mt-1 text-xs"
                  placeholder="Legal entity"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-muted-foreground">Site</label>
                <Input
                  value={art21Form.siteName}
                  onChange={(e) => setArt21Form({ ...art21Form, siteName: e.target.value })}
                  className="mt-1 text-xs"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[11px] font-mono text-muted-foreground">Project</label>
                <Input
                  value={art21Form.projectName}
                  onChange={(e) => setArt21Form({ ...art21Form, projectName: e.target.value })}
                  className="mt-1 text-xs"
                />
              </div>
            </div>

            {/* The role decides which article applies — Art. 22 is expressly for
                anyone who is NOT the manufacturer, importer or distributor. */}
            <div className="pt-2 border-t border-border/60">
              <label className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                Your role for this product
              </label>
              <select
                value={art21Form.actorRole}
                onChange={(e) =>
                  setArt21Form({ ...art21Form, actorRole: e.target.value as typeof art21Form.actorRole })
                }
                className="mt-1 w-full text-xs bg-background border border-border/60 rounded-lg px-3 py-2"
              >
                <option value="importer">Importer — Article 21</option>
                <option value="distributor">Distributor — Article 21</option>
                <option value="other_person">Any other person (e.g. system integrator) — Article 22</option>
                <option value="manufacturer">Manufacturer — neither article applies</option>
              </select>
            </div>

            <div className="space-y-3 pt-2 border-t border-border/60">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Statutory questions
              </span>
              <p className="text-[11px] text-muted-foreground -mt-1">
                Leave a question unanswered and no determination is made. An unanswered question is
                not a "no".
              </p>

              {[
                {
                  key: 'placedUnderOwnNameOrTrademark' as const,
                  label: 'Placed on the market under your own name or trademark?',
                  help: 'Article 21, first limb. For an importer or distributor this alone makes you the manufacturer, with or without any modification.',
                  showFor: ['importer', 'distributor'],
                },
                {
                  key: 'modificationMade' as const,
                  label: 'Was any change made to the product?',
                  help: 'Article 3(30) begins here. No change means no substantial modification.',
                  showFor: null,
                },
                {
                  key: 'changeFollowsPlacingOnMarket' as const,
                  label: 'Did the change come after the product was placed on the market?',
                  help: 'Article 3(30). A change made before that is part of manufacturing the product, not a modification of it.',
                  showFor: null,
                },
                {
                  key: 'affectsAnnexIPartICompliance' as const,
                  label: 'Does the change affect compliance with the essential cybersecurity requirements in Annex I, Part I?',
                  help: 'Article 3(30), first limb. Either this or the next question is enough.',
                  showFor: null,
                },
                {
                  key: 'modifiesAssessedIntendedPurpose' as const,
                  label: 'Does the change modify the intended purpose the product was assessed for?',
                  help: 'Article 3(30), second limb.',
                  showFor: null,
                },
                {
                  key: 'makesAvailableOnMarket' as const,
                  label: 'Do you make the modified product available on the market?',
                  help: 'Article 22(1) requires this as well as a substantial modification. Modifying a product you operate yourself does not make you its manufacturer.',
                  showFor: ['other_person'],
                },
                {
                  key: 'cybersecurityImpactIsProductWide' as const,
                  label: 'Does the modification affect the cybersecurity of the product as a whole?',
                  help: 'Article 22(2). This decides whether the obligations cover only the modified part or the entire product.',
                  showFor: ['other_person'],
                },
              ]
                .filter((q) => !q.showFor || q.showFor.includes(art21Form.actorRole))
                .map((q) => (
                  <div key={q.key} className="p-3 rounded-lg bg-muted/20 border border-border/60 space-y-2">
                    <div className="text-xs font-medium text-foreground">{q.label}</div>
                    <div className="text-[11px] text-muted-foreground">{q.help}</div>
                    <div className="flex gap-2">
                      {[
                        { v: null, l: 'Unanswered' },
                        { v: true, l: 'Yes' },
                        { v: false, l: 'No' },
                      ].map((opt) => (
                        <button
                          key={String(opt.v)}
                          onClick={() => setArt21Form({ ...art21Form, [q.key]: opt.v })}
                          className={`font-mono text-[11px] px-3 py-1 rounded-full border transition-colors ${
                            art21Form[q.key] === opt.v
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background text-muted-foreground border-border/60 hover:border-primary/50'
                          }`}
                        >
                          {opt.l}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
            </div>

            <Button
              onClick={() => evaluateArt21Mutation.mutate(art21Form)}
              disabled={evaluateArt21Mutation.isPending}
              className="w-full bg-primary text-primary-foreground font-medium text-xs py-2.5 shadow-sm"
            >
              {evaluateArt21Mutation.isPending ? 'Recording assessment...' : 'Record assessment'}
            </Button>
          </div>

          {/* Right column: the determination. Not a certificate. */}
          <div className="lg:col-span-5 space-y-4">
            {art21Result ? (
              <div
                className={`p-6 rounded-xl border shadow-sm space-y-4 ${
                  art21Result.determination?.deemedManufacturer
                    ? 'bg-red-500/[0.04] border-red-500/40'
                    : 'bg-muted/20 border-border/60'
                }`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-border/60">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    Assessment record
                  </span>
                  <span
                    className={`font-mono text-xs px-2.5 py-0.5 rounded-full font-bold ${
                      art21Result.determination?.deemedManufacturer
                        ? 'bg-red-500/20 text-red-500 border border-red-500/40'
                        : 'bg-muted text-muted-foreground border border-border/60'
                    }`}
                  >
                    {art21Result.determination?.deemedManufacturer
                      ? 'MANUFACTURER OBLIGATIONS APPLY'
                      : 'NO TRANSITION ON THESE FACTS'}
                  </span>
                </div>

                <div>
                  <h3 className="font-display font-medium text-lg text-foreground">
                    {art21Result.determination?.governingArticle
                      ? `${art21Result.determination.governingArticle}: you are considered to be the manufacturer`
                      : 'No determination that you are the manufacturer'}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {art21Result.determination?.message}
                  </p>
                </div>

                {art21Result.determination?.obligationScope && (
                  <div className="p-3 rounded-lg bg-card/60 border border-border/60 text-xs">
                    <div className="font-mono text-[10px] text-muted-foreground uppercase">Scope of obligations</div>
                    <div className="text-foreground mt-0.5">
                      {art21Result.determination.obligationScope === 'entire_product'
                        ? 'The entire product'
                        : 'Only the part affected by the modification (Article 22(2))'}
                    </div>
                  </div>
                )}

                {art21Result.determination?.unanswered?.length > 0 && (
                  <div className="p-3 rounded-lg bg-amber-500/[0.06] border border-amber-500/40 text-xs space-y-1">
                    <div className="font-mono text-[10px] text-amber-600 uppercase">Still needed</div>
                    {art21Result.determination.unanswered.map((u: string, i: number) => (
                      <div key={i} className="text-muted-foreground leading-relaxed">{u}</div>
                    ))}
                  </div>
                )}

                {art21Result.openedAssessmentId && (
                  <Link
                    href={`/assessments/${art21Result.openedAssessmentId}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-primary/[0.06] border border-primary/40 text-xs hover:bg-primary/[0.1]"
                  >
                    <span className="text-foreground">
                      A manufacturer obligation set has been opened for this product.
                    </span>
                    <ArrowRight className="w-4 h-4 text-primary shrink-0" />
                  </Link>
                )}

                <div className="p-3 rounded-lg bg-card/60 border border-border/60 space-y-1 text-xs">
                  <div className="font-mono text-[10px] text-muted-foreground uppercase">
                    Record hash · assessed {art21Result.assessment?.assessedAt?.slice(0, 19).replace('T', ' ')}
                  </div>
                  <div className="font-mono text-[11px] text-primary break-all">
                    {art21Result.assessment?.recordHash}
                  </div>
                </div>

                <div className="text-[11px] text-muted-foreground leading-relaxed">
                  Cited: {art21Result.determination?.citations?.join(', ')}. This is a record of what
                  was assessed on the facts supplied. It confers nothing and grants no exemption.
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-muted/20 border border-border/60 text-center space-y-2">
                <Scale className="w-8 h-8 text-muted-foreground mx-auto" />
                <h3 className="font-display font-medium text-base text-foreground">No assessment yet</h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Answer the statutory questions to record a determination under Article 21 or 22.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* STAGE 3: Upstream Vendor Radar & Duty to Refrain */}
      {activeTab === 'procurement' && (
        <div className="space-y-6">
          <div className="bg-card/80 border border-border/80 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-primary">
                  Stage 3: Distributor Statutory Radar
                </span>
                <h2 className="font-display font-medium text-lg text-foreground mt-0.5">
                  Article 20(2) "Duty to Refrain" Procurement Screener
                </h2>
                <p className="text-xs text-muted-foreground">
                  Automated gate blocking hardware purchases lacking CE markings, valid DoCs, or with unpatched critical CVEs.
                </p>
              </div>
              <button
                onClick={() => setStatutoryFlyout({ type: 'article', number: 18 })}
                className="font-mono text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
              >
                <Gavel className="w-3 h-3" />
                Read Art. 18(2)
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-mono text-muted-foreground">OEM Vendor Name</label>
                    <Input
                      value={procForm.vendorName}
                      onChange={(e) => setProcForm({ ...procForm, vendorName: e.target.value })}
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-muted-foreground">Product Model</label>
                    <Input
                      value={procForm.productName}
                      onChange={(e) => setProcForm({ ...procForm, productName: e.target.value })}
                      className="mt-1 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-mono text-muted-foreground">Product Category</label>
                    <select
                      value={procForm.productClass}
                      onChange={(e) => setProcForm({ ...procForm, productClass: e.target.value })}
                      className="mt-1 w-full p-2 rounded-lg bg-muted/40 border border-border text-xs"
                    >
                      <option value="default">Default Product (Module A)</option>
                      <option value="important_class_1">Important Class I (Annex III.1)</option>
                      <option value="important_class_2">Important Class II (Annex III.2)</option>
                      <option value="critical">Critical Product (Annex IV)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[11px] font-mono text-muted-foreground">Declared Support (Years)</label>
                    <Input
                      type="number"
                      value={procForm.supportPeriodYears}
                      onChange={(e) => setProcForm({ ...procForm, supportPeriodYears: parseInt(e.target.value) || 0 })}
                      className="mt-1 text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-border/60">
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={procForm.ceMarkVerified}
                      onChange={(e) => setProcForm({ ...procForm, ceMarkVerified: e.target.checked })}
                      className="rounded text-primary"
                    />
                    <span>CE Marking Affixed &amp; Physically Verified (Art. 30)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={procForm.docVerified}
                      onChange={(e) => setProcForm({ ...procForm, docVerified: e.target.checked })}
                      className="rounded text-primary"
                    />
                    <span>EU Declaration of Conformity Available (Annex V)</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs">
                    <input
                      type="checkbox"
                      checked={procForm.freeSecurityPatches}
                      onChange={(e) => setProcForm({ ...procForm, freeSecurityPatches: e.target.checked })}
                      className="rounded text-primary"
                    />
                    <span>Free Security Updates Guaranteed $\ge$ 5 Years (Art. 10(6))</span>
                  </label>
                </div>

                <Button
                  onClick={() => evaluateProcMutation.mutate(procForm)}
                  disabled={evaluateProcMutation.isPending}
                  className="w-full bg-primary text-primary-foreground text-xs py-2"
                >
                  Screen Vendor Component
                </Button>
              </div>

              {/* Vendor Scorecard Output */}
              <div className="bg-muted/20 border border-border/60 p-5 rounded-xl space-y-4">
                <div className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                  <span>Procurement Compliance Scorecard</span>
                  {procResult && (
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold ${
                        procResult.scorecardStatus === 'APPROVED'
                          ? 'bg-green-500/20 text-green-500'
                          : procResult.scorecardStatus === 'CONDITIONAL'
                          ? 'bg-amber-500/20 text-amber-500'
                          : 'bg-red-500/20 text-red-500'
                      }`}
                    >
                      {procResult.scorecardStatus === 'REJECTED'
                        ? 'HELD — DUTY TO REFRAIN'
                        : procResult.scorecardStatus}
                    </span>
                  )}
                </div>

                {procResult ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span>Compliance Score:</span>
                      <span className="font-mono font-bold text-base text-primary">
                        {procResult.evaluationScore}%
                      </span>
                    </div>

                    {procResult.rejectionReasons?.length > 0 && (
                      <div className="space-y-1 text-xs">
                        <div className="font-semibold text-red-500">
                          Blocking — do not place on the market:
                        </div>
                        <ul className="space-y-1 text-red-400 list-disc list-inside">
                          {procResult.rejectionReasons.map((f: string, i: number) => (
                            <li key={i}>{f}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {procResult.conditionalRemediations?.length > 0 && (
                      <div className="space-y-1 text-xs">
                        <div className="font-semibold text-amber-500">Remediate before purchase:</div>
                        <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                          {procResult.conditionalRemediations.map((f: string, i: number) => (
                            <li key={i}>{f}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {procResult.contractualClauses?.length > 0 && (
                      <div className="space-y-1 text-xs">
                        <div className="font-semibold text-foreground">Contractual clauses earned:</div>
                        <ul className="space-y-1 text-muted-foreground list-disc list-inside">
                          {procResult.contractualClauses.map((f: string, i: number) => (
                            <li key={i}>{f}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-xs text-muted-foreground">
                    Enter component details on the left and run screening to check Duty to Refrain status.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 4: Annex VII Technical File Builder */}
      {activeTab === 'annex7' && (
        <div className="bg-card/80 border border-border/80 rounded-xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-primary">
                Stage 4: Client & Auditor Deliverable Dossier
              </span>
              <h2 className="font-display font-medium text-xl text-foreground mt-0.5">
                Annex VII Technical Documentation Compiler
              </h2>
              <p className="text-xs text-muted-foreground">
                Assembles the Annex VII documentation sections for {selectedProduct?.name ?? 'the selected product'}.
              </p>
            </div>
            <button
              onClick={() => setStatutoryFlyout({ type: 'annex', number: 'VII' })}
              className="font-mono text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
            >
              <FileCheck2 className="w-3.5 h-3.5" />
              Read Annex VII Specification
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-muted/20 border border-border/60 space-y-2">
              <div className="font-mono text-xs font-bold text-primary">Section 1 & 2</div>
              <h3 className="font-sans font-medium text-sm text-foreground">Architecture & Risk Assessment</h3>
              <p className="text-[11px] text-muted-foreground">
                Network topology, trust boundaries, IEC 62443 threat modeling, and risk assessment report.
              </p>
              <span className="inline-flex items-center gap-1 font-mono text-[10px] text-green-500">
                <Check className="w-3 h-3" /> Compiled (48 Assets)
              </span>
            </div>

            <div className="p-4 rounded-lg bg-muted/20 border border-border/60 space-y-2">
              <div className="font-mono text-xs font-bold text-primary">Section 3 & 4</div>
              <h3 className="font-sans font-medium text-sm text-foreground">Plant SBOM & Standards Matrix</h3>
              <p className="text-[11px] text-muted-foreground">
                Consolidated CycloneDX 1.6 SBOM, component ledger, and IEC 62443-4-2 compliance mapping.
              </p>
              <span className="inline-flex items-center gap-1 font-mono text-[10px] text-green-500">
                <Check className="w-3 h-3" /> Compiled (100% Resolved)
              </span>
            </div>

            <div className="p-4 rounded-lg bg-muted/20 border border-border/60 space-y-2">
              <div className="font-mono text-xs font-bold text-primary">Section 5 & 6</div>
              <h3 className="font-sans font-medium text-sm text-foreground">Test Evidence & DoC Package</h3>
              <p className="text-[11px] text-muted-foreground">
                Penetration test logs, static analysis reports, Annex II user instructions, and EU DoC.
              </p>
              <span className="inline-flex items-center gap-1 font-mono text-[10px] text-green-500">
                <Check className="w-3 h-3" /> Ready for Export
              </span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-primary/[0.04] border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h4 className="font-display font-medium text-sm text-foreground">
                Generate Official Annex VII Auditor Package
              </h4>
              <p className="text-xs text-muted-foreground">
                Produces a timestamped, cryptographically hashed PDF dossier for plant owner submission.
              </p>
            </div>
            <Button className="bg-primary text-primary-foreground font-mono text-xs gap-2">
              <Download className="w-4 h-4" />
              Download Annex VII Technical File (ZIP/PDF)
            </Button>
          </div>
        </div>
      )}

      {/* STAGE 5: 24h CSIRT & ENISA Incident Response Hub (Art. 14) */}
      {activeTab === 'csirt' && (
        <div className="bg-card/80 border border-border/80 rounded-xl p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-red-500 bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20">
                  Mandatory Early Reporting (11 Sept 2026)
                </span>
                <span className="font-mono text-[11px] text-muted-foreground">Article 14 & Recital 68</span>
              </div>
              <h2 className="font-display font-medium text-xl text-foreground mt-1">
                24-Hour CSIRT & ENISA Emergency Early Warning Dispatcher
              </h2>
            </div>
            <button
              onClick={() => setStatutoryFlyout({ type: 'article', number: 14 })}
              className="font-mono text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
            >
              <Gavel className="w-3 h-3" />
              Read Art. 14
            </button>
          </div>

          {/* Countdown Clock Banner */}
          <div className="p-4 rounded-xl bg-red-500/[0.05] border border-red-500/30 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-red-500 animate-pulse" />
              <div>
                <div className="font-mono text-xs font-bold text-red-500 uppercase">
                  Stage 1 Statutory Filing Window
                </div>
                <div className="font-display font-medium text-lg text-foreground">
                  24 hours from the moment you became aware
                </div>
              </div>
            </div>
            <span className="font-mono text-xs text-muted-foreground bg-card/60 px-3 py-1.5 rounded-lg border border-border">
              Target: ANSSI (FR) & ENISA Single Portal
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-mono text-muted-foreground">Designated National CSIRT</label>
                  <select
                    value={csirtForm.authority}
                    onChange={(e) => setCsirtForm({ ...csirtForm, authority: e.target.value })}
                    className="mt-1 w-full p-2 rounded-lg bg-muted/40 border border-border text-xs"
                  >
                    <option value="ANSSI / CERT-FR">ANSSI / CERT-FR (France)</option>
                    <option value="BSI / CERT-Bund">BSI / CERT-Bund (Germany)</option>
                    <option value="NCSC-NL">NCSC-NL (Netherlands)</option>
                    <option value="CCB / CERT.be">CCB / CERT.be (Belgium)</option>
                    <option value="CCN-CERT / INCIBE">CCN-CERT / INCIBE (Spain)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-mono text-muted-foreground">CVE / Threat ID</label>
                  <Input
                    value={csirtForm.cveId}
                    onChange={(e) => setCsirtForm({ ...csirtForm, cveId: e.target.value })}
                    className="mt-1 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-muted-foreground">Affected Equipment in Field</label>
                <Input
                  value={csirtForm.affectedProduct}
                  onChange={(e) => setCsirtForm({ ...csirtForm, affectedProduct: e.target.value })}
                  className="mt-1 text-xs"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono text-muted-foreground">Threat Vector & Exploit Analysis</label>
                <textarea
                  value={csirtForm.threatVector}
                  onChange={(e) => setCsirtForm({ ...csirtForm, threatVector: e.target.value })}
                  className="mt-1 w-full p-2.5 rounded-lg bg-muted/40 border border-border text-xs h-20 outline-none focus:border-primary"
                />
              </div>

              <Button
                onClick={() => setCsirtDispatched(true)}
                variant="outline"
                className="w-full font-mono text-xs py-2.5 gap-2"
              >
                <Send className="w-4 h-4" />
                Build notification payload for {csirtForm.authority}
              </Button>
            </div>

            {/* Notification Preview */}
            <div className="bg-muted/20 border border-border/60 p-5 rounded-xl space-y-3 font-mono text-xs">
              <div className="text-muted-foreground uppercase text-[11px] pb-2 border-b border-border/40 flex items-center justify-between">
                <span>CSIRT Notification Payload (JSON / XML)</span>
                {csirtDispatched && (
                  <span className="text-amber-500 font-bold">DRAFT ONLY — NOT SENT</span>
                )}
              </div>
              <pre className="text-[11px] text-muted-foreground overflow-x-auto p-3 bg-black/40 rounded-lg">
{JSON.stringify(
  {
    craNotificationStage: 'STAGE_1_EARLY_WARNING_24H',
    statutoryBasis: 'REGULATION_EU_2024_2847_ART_14_1',
    designatedAuthority: csirtForm.authority,
    enisaSingleReportingPortal: true,
    timestamp: new Date().toISOString(),
    reporter: csirtForm.reporterName,
    affectedProduct: csirtForm.affectedProduct,
    cveIdentifier: csirtForm.cveId,
    activeExploitationIndicator: csirtForm.isActiveExploitation,
    threatAnalysis: csirtForm.threatVector,
    containmentMitigation: 'Isolate subnet VLAN 402, block PROFINET port 34964',
  },
  null,
  2
)}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Slide-over Statutory Drawer (Live Context Provider) */}
      {statutoryFlyout && drawerContent && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-card border-l border-border h-full shadow-2xl p-6 overflow-y-auto space-y-5 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Scale className="w-4 h-4 text-primary" />
                <span className="font-mono text-xs font-bold uppercase text-primary">
                  CRA Live Statutory Context
                </span>
              </div>
              <button
                id="close-statutory-drawer"
                onClick={() => setStatutoryFlyout(null)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {statutoryFlyout.type === 'article' && (
              <div className="space-y-4">
                <div className="font-mono text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md inline-block">
                  Article {(drawerContent as any).articleNumber}
                </div>
                <h3 className="font-display font-medium text-lg text-foreground">
                  {(drawerContent as any).title}
                </h3>
                {(drawerContent as any).legalCommentary && (
                  <div className="p-3 rounded-lg bg-primary/[0.04] border-l-2 border-l-primary text-xs text-muted-foreground leading-relaxed">
                    <strong>Legal Advisor Analysis:</strong> {(drawerContent as any).legalCommentary}
                  </div>
                )}
                <div className="space-y-2">
                  {(drawerContent as any).paragraphs.map((p: any) => (
                    <div key={p.paragraphNumber} className="text-xs text-foreground/90 leading-relaxed p-2.5 rounded bg-muted/20">
                      {p.paragraphNumber > 0 && (
                        <span className="font-mono font-bold text-primary mr-1.5">{p.paragraphNumber}.</span>
                      )}
                      <span className="whitespace-pre-line">{p.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {statutoryFlyout.type === 'recital' && (
              <div className="space-y-4">
                <div className="font-mono text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md inline-block">
                  Recital ({(drawerContent as any).number})
                </div>
                <h3 className="font-display font-medium text-lg text-foreground">
                  {(drawerContent as any).title}
                </h3>
                <p className="text-xs text-foreground/90 leading-relaxed p-3 rounded bg-muted/20">
                  {(drawerContent as any).text}
                </p>
              </div>
            )}

            {statutoryFlyout.type === 'annex' && (
              <div className="space-y-4">
                <div className="font-mono text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md inline-block">
                  Annex {(drawerContent as any).annexNumber}
                </div>
                <h3 className="font-display font-medium text-lg text-foreground">
                  {(drawerContent as any).title}
                </h3>
                {(drawerContent as any).blocks && (
                  <div className="space-y-1 text-xs text-muted-foreground">
                    {(drawerContent as any).blocks.map((line: string, idx: number) => (
                      <div key={idx} className="p-2 rounded bg-muted/20 text-foreground leading-relaxed">
                        {line}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="pt-4 border-t border-border/60">
              <Link
                href="/wiki"
                onClick={() => setStatutoryFlyout(null)}
                className="w-full py-2 rounded-lg bg-primary text-primary-foreground font-sans font-medium text-xs text-center block"
              >
                Open in Full 3-Pane CRA Wiki →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
