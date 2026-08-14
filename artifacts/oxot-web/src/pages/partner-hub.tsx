import { useState, useMemo } from 'react';
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

interface PlantAsset {
  id: string;
  name: string;
  manufacturer: string;
  model: string;
  firmware: string;
  installationDate: string;
  craCategory: 'DEFAULT' | 'IMPORTANT_CLASS_I' | 'IMPORTANT_CLASS_II' | 'CRITICAL';
  conformityRoute: 'MODULE_A_INTERNAL' | 'MODULE_H_FULL_QA' | 'MODULE_B_PLUS_C_NOTIFIED_BODY';
  dutyToRefrainStatus: 'APPROVED' | 'HELD_DUTY_TO_REFRAIN' | 'RECALLED';
  recital34SafeHarbor: boolean;
  activeCVEs: number;
}

interface PlantProject {
  id: string;
  name: string;
  clientName: string;
  clientIndustry: string;
  clientTurnoverEur: number;
  location: string;
  totalAssets: number;
  fineExposureEur: number;
  assets: PlantAsset[];
}

const mockPlants: PlantProject[] = [
  {
    id: 'PLANT-01',
    name: 'Rotterdam Petrochemical Terminal',
    clientName: 'Vopak Energy Logistics',
    clientIndustry: 'Chemical & Energy Storage',
    clientTurnoverEur: 1450000000,
    location: 'Rotterdam, Netherlands',
    totalAssets: 48,
    fineExposureEur: 36250000,
    assets: [
      {
        id: 'AST-01',
        name: 'Main SCADA Gateway',
        manufacturer: 'Hirschmann',
        model: 'RS20-0800M2M2SDAE',
        firmware: 'v09.1.04',
        installationDate: '2024-02-10',
        craCategory: 'IMPORTANT_CLASS_I',
        conformityRoute: 'MODULE_A_INTERNAL',
        dutyToRefrainStatus: 'APPROVED',
        recital34SafeHarbor: true,
        activeCVEs: 0,
      },
      {
        id: 'AST-02',
        name: 'Distillation Safety PLC',
        manufacturer: 'Siemens AG',
        model: 'SIMATIC S7-1500F',
        firmware: 'v3.1.2',
        installationDate: '2023-11-15',
        craCategory: 'IMPORTANT_CLASS_II',
        conformityRoute: 'MODULE_H_FULL_QA',
        dutyToRefrainStatus: 'APPROVED',
        recital34SafeHarbor: true,
        activeCVEs: 0,
      },
      {
        id: 'AST-03',
        name: 'Legacy Fieldbus Coupler',
        manufacturer: 'Phoenix Contact',
        model: 'FL IL 24 BK-PAC',
        firmware: 'v1.4.0 (EOS)',
        installationDate: '2021-05-20',
        craCategory: 'IMPORTANT_CLASS_I',
        conformityRoute: 'MODULE_A_INTERNAL',
        dutyToRefrainStatus: 'HELD_DUTY_TO_REFRAIN',
        recital34SafeHarbor: false,
        activeCVEs: 3,
      },
    ],
  },
  {
    id: 'PLANT-02',
    name: 'Antwerp Chemical Facility 4',
    clientName: 'BASF Antwerpen NV',
    clientIndustry: 'Specialty Chemicals',
    clientTurnoverEur: 3800000000,
    location: 'Antwerp, Belgium',
    totalAssets: 124,
    fineExposureEur: 95000000,
    assets: [
      {
        id: 'AST-05',
        name: 'Cracker DCS Controller',
        manufacturer: 'Schneider Electric',
        model: 'Modicon M580',
        firmware: 'v4.10',
        installationDate: '2024-08-01',
        craCategory: 'IMPORTANT_CLASS_II',
        conformityRoute: 'MODULE_H_FULL_QA',
        dutyToRefrainStatus: 'APPROVED',
        recital34SafeHarbor: true,
        activeCVEs: 0,
      },
    ],
  },
];

export default function OxotPartnerHubPage() {
  const [activeTab, setActiveTab] = useState<
    'plants' | 'article21' | 'procurement' | 'annex7' | 'csirt'
  >('plants');
  const [selectedPlantId, setSelectedPlantId] = useState<string>('PLANT-01');
  const [statutoryFlyout, setStatutoryFlyout] = useState<{
    type: 'article' | 'recital' | 'annex';
    number: number | string;
  } | null>(null);

  const selectedPlant = useMemo(() => {
    return mockPlants.find((p) => p.id === selectedPlantId) || mockPlants[0];
  }, [selectedPlantId]);

  // Tab 2: Article 21 State
  const [art21Form, setArt21Form] = useState({
    siName: 'Axians Industrial Solutions (VINCI Energies)',
    clientSite: 'Rotterdam Petrochemical Terminal',
    projectName: 'OT Core Modernization Phase II',
    targetModel: 'SIMATIC S7-1500F (6ES7516-3FN02-0AB0)',
    targetSku: '6ES7516-3FN02-0AB0-OEM',
    engineerName: 'Jean-Marc Laurent, Lead OT Systems Architect',
    q1: true,
    q2: true,
    q3: true,
    q4: true,
  });
  const [art21Result, setArt21Result] = useState<any | null>(null);

  // Tab 3: Procurement State
  const [procForm, setProcForm] = useState({
    vendorName: 'Siemens AG',
    productName: 'Scalance XC-208 Managed Switch',
    productClass: 'important_class_1',
    ceMarkVerified: true,
    docVerified: true,
    supportPeriodYears: 5,
    freeSecurityPatches: true,
  });
  const [procResult, setProcResult] = useState<any | null>(null);

  // Tab 5: CSIRT State
  const [csirtDispatched, setCsirtDispatched] = useState(false);

  // Drawer Content Resolver
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
    <div className="min-h-screen bg-background font-sans text-foreground selection:bg-primary/20 selection:text-primary">
      {/* Top Header */}
      <header className="border-b border-border/80 bg-card/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-medium text-base tracking-tight text-foreground">
                  Axians CRA Modernization Operating System
                </span>
                <span className="font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 font-semibold">
                  Regulation (EU) 2024/2847
                </span>
              </div>
              <p className="text-[11px] font-mono text-muted-foreground">
                VINCI Energies Tier-1 Integrator Hub • Single Source of Truth
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md hover:bg-muted/50"
            >
              Overview
            </Link>
            <Link
              href="/wiki/cra"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground font-sans font-medium text-xs shadow-sm hover:bg-primary/90 transition-all"
            >
              <FileText className="w-3.5 h-3.5" />
              CRA Wiki Reader
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* 5-Stage Tabs */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 bg-card/80 p-1.5 rounded-xl border border-border/80 shadow-xs">
          <button
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

        {/* STAGE 1: Plants */}
        {activeTab === 'plants' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2 bg-card/80 border border-border/80 p-4 rounded-xl shadow-xs">
                <label className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Active Customer Plant Project
                </label>
                <select
                  value={selectedPlantId}
                  onChange={(e) => setSelectedPlantId(e.target.value)}
                  className="mt-2 w-full p-2.5 rounded-lg bg-muted/40 border border-border text-sm font-medium focus:border-primary outline-none"
                >
                  {mockPlants.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.clientName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-card/80 border border-border/80 p-4 rounded-xl shadow-xs space-y-1">
                <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                  Client Annual Turnover
                </div>
                <div className="font-display font-medium text-2xl text-foreground">
                  €{(selectedPlant.clientTurnoverEur / 1000000).toLocaleString()}M
                </div>
                <div className="text-[11px] text-muted-foreground font-mono">
                  {selectedPlant.clientIndustry}
                </div>
              </div>

              <div className="bg-card/80 border border-border/80 p-4 rounded-xl shadow-xs space-y-1">
                <div className="font-mono text-[11px] uppercase tracking-wider text-red-500 font-semibold flex items-center justify-between">
                  <span>Art. 61 Fine Exposure</span>
                  <button
                    onClick={() => setStatutoryFlyout({ type: 'article', number: 61 })}
                    className="hover:underline text-[10px]"
                  >
                    Art. 61
                  </button>
                </div>
                <div className="font-display font-medium text-2xl text-red-500">
                  €{(selectedPlant.fineExposureEur / 1000000).toLocaleString()}M
                </div>
                <div className="text-[10px] text-muted-foreground font-mono">
                  Max €15M or 2.5% Turnover
                </div>
              </div>
            </div>

            {/* Assets Table */}
            <div className="bg-card/80 border border-border/80 rounded-xl p-5 shadow-xs space-y-4">
              <h2 className="font-display font-medium text-lg text-foreground">
                Equipment Line Inventory & CRA Classification
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border/60 text-muted-foreground font-mono uppercase text-[11px]">
                      <th className="py-2 px-3">Asset ID / Name</th>
                      <th className="py-2 px-3">OEM / Model</th>
                      <th className="py-2 px-3">CRA Category</th>
                      <th className="py-2 px-3">Conformity Route</th>
                      <th className="py-2 px-3">Duty to Refrain</th>
                      <th className="py-2 px-3">Recital 34</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {selectedPlant.assets.map((asset) => (
                      <tr key={asset.id} className="hover:bg-muted/20">
                        <td className="py-2.5 px-3">
                          <div className="font-mono font-bold">{asset.id}</div>
                          <div className="text-muted-foreground text-[11px]">{asset.name}</div>
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-medium">{asset.manufacturer}</span> {asset.model}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/30">
                            {asset.craCategory}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 font-mono text-[11px] text-muted-foreground">
                          {asset.conformityRoute}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`font-mono text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                              asset.dutyToRefrainStatus === 'APPROVED'
                                ? 'bg-green-500/10 text-green-500'
                                : 'bg-red-500/10 text-red-500'
                            }`}
                          >
                            {asset.dutyToRefrainStatus}
                          </span>
                        </td>
                        <td className="py-2.5 px-3">
                          {asset.recital34SafeHarbor ? (
                            <span className="text-green-500 font-mono text-[10px]">✓ Exempt</span>
                          ) : (
                            <span className="text-muted-foreground font-mono text-[10px]">- Standard</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 2: Article 21 */}
        {activeTab === 'article21' && (
          <div className="bg-card/80 border border-border/80 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h2 className="font-display font-medium text-xl text-foreground">
                Article 21 & Recital 34 Safe Harbor Clearance
              </h2>
              <button
                onClick={() => setStatutoryFlyout({ type: 'article', number: 21 })}
                className="font-mono text-xs text-primary hover:underline"
              >
                View Art. 21(2)
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Verifies replacement parts maintain Integrator Exemption without triggering manufacturer liabilities.
            </p>
            <div className="p-4 rounded-lg bg-green-500/[0.05] border border-green-500/30 text-xs space-y-2">
              <div className="font-mono font-bold text-green-500">RECITAL 34 SAFE HARBOR CERTIFIED</div>
              <p className="text-muted-foreground">
                Identical spare part replacements using OEM-signed firmware on pre-Dec 2027 installations maintain distributor status under Article 19.
              </p>
            </div>
          </div>
        )}

        {/* STAGE 3: Procurement */}
        {activeTab === 'procurement' && (
          <div className="bg-card/80 border border-border/80 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h2 className="font-display font-medium text-xl text-foreground">
                Article 18(2) Duty to Refrain Radar
              </h2>
              <button
                onClick={() => setStatutoryFlyout({ type: 'article', number: 18 })}
                className="font-mono text-xs text-primary hover:underline"
              >
                View Art. 18(2)
              </button>
            </div>
            <div className="p-4 rounded-lg bg-muted/20 border border-border/60 space-y-2 text-xs">
              <div className="font-mono font-semibold text-primary">Automated Procurement Blocker Active</div>
              <p className="text-muted-foreground">
                Evaluates incoming BOM components against CE marking verification, Annex V Declarations of Conformity, and active CVE feeds.
              </p>
            </div>
          </div>
        )}

        {/* STAGE 4: Annex VII */}
        {activeTab === 'annex7' && (
          <div className="bg-card/80 border border-border/80 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h2 className="font-display font-medium text-xl text-foreground">
                Annex VII Technical Documentation Compiler
              </h2>
              <button
                onClick={() => setStatutoryFlyout({ type: 'annex', number: 'VII' })}
                className="font-mono text-xs text-primary hover:underline"
              >
                View Annex VII
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Compiles architecture diagrams, risk assessments, plant SBOM, and EU DoC into an auditor-ready file.
            </p>
          </div>
        )}

        {/* STAGE 5: CSIRT */}
        {activeTab === 'csirt' && (
          <div className="bg-card/80 border border-border/80 rounded-xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <h2 className="font-display font-medium text-xl text-foreground">
                24-Hour CSIRT & ENISA Incident Hub (Art. 14)
              </h2>
              <button
                onClick={() => setStatutoryFlyout({ type: 'article', number: 14 })}
                className="font-mono text-xs text-primary hover:underline"
              >
                View Art. 14
              </button>
            </div>
            <div className="p-4 rounded-xl bg-red-500/[0.05] border border-red-500/30 text-xs space-y-2">
              <div className="font-mono font-bold text-red-500">MANDATORY EARLY WARNING APPLICATION: 11 SEPT 2026</div>
              <p className="text-muted-foreground">
                Pre-formatted incident dispatchers for ANSSI (FR), BSI (DE), NCSC (NL), CCB (BE), and ENISA.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Statutory Drawer */}
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
              </div>
            )}

            <div className="pt-4 border-t border-border/60">
              <Link
                href="/wiki/cra"
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
