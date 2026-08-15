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
      {
        id: 'AST-04',
        name: 'OT Perimeter Firewall',
        manufacturer: 'Fortinet',
        model: 'FortiGate 60F Industrial',
        firmware: 'FortiOS 7.4.2',
        installationDate: '2025-01-18',
        craCategory: 'IMPORTANT_CLASS_II',
        conformityRoute: 'MODULE_H_FULL_QA',
        dutyToRefrainStatus: 'APPROVED',
        recital34SafeHarbor: false,
        activeCVEs: 0,
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
  {
    id: 'PLANT-03',
    name: 'Sochaux Automotive Paint Shop',
    clientName: 'Stellantis Group',
    clientIndustry: 'Automotive Manufacturing',
    clientTurnoverEur: 189000000000,
    location: 'Sochaux, France',
    totalAssets: 310,
    fineExposureEur: 15000000,
    assets: [
      {
        id: 'AST-06',
        name: 'Robotic Cell Safety Gateway',
        manufacturer: 'Cisco Systems',
        model: 'Catalyst IE3400 Heavy Duty',
        firmware: 'IOS-XE 17.9.3',
        installationDate: '2024-10-12',
        craCategory: 'IMPORTANT_CLASS_I',
        conformityRoute: 'MODULE_A_INTERNAL',
        dutyToRefrainStatus: 'APPROVED',
        recital34SafeHarbor: true,
        activeCVEs: 0,
      },
    ],
  },
];

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

  const evaluateArt21Mutation = useMutation({
    mutationFn: async (payload: typeof art21Form) => {
      const res = await fetch('/api/ecosystem/article21/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemIntegratorName: payload.siName,
          clientSiteName: payload.clientSite,
          projectName: payload.projectName,
          targetHardwareModel: payload.targetModel,
          targetSku: payload.targetSku,
          q1IdenticalReplacement: payload.q1,
          q2OemSignedFirmware: payload.q2,
          q3IntendedPurposeUnchanged: payload.q3,
          q4PerformanceEnvelopeConstant: payload.q4,
        }),
      });
      if (!res.ok) throw new Error('Failed to assess Article 21');
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

      {/* STAGE 1: Plant Inventory & Automated Classification Engine */}
      {activeTab === 'plants' && (
        <div className="space-y-6">
          {/* Plant Selector & Metric Ribbon */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2 bg-card/80 border border-border/80 p-4 rounded-xl shadow-xs">
              <label className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                <span>Active Customer Plant Project</span>
                <span className="text-primary font-normal text-[11px]">{mockPlants.length} Managed Plants</span>
              </label>
              <select
                value={selectedPlantId}
                onChange={(e) => setSelectedPlantId(e.target.value)}
                className="mt-2 w-full p-2.5 rounded-lg bg-muted/40 border border-border text-sm font-medium focus:border-primary outline-none"
              >
                {mockPlants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.clientName} — {p.location})
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
                <span>Art. 64 Fine Exposure</span>
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
                Max of €15M or 2.5% Turnover
              </div>
            </div>
          </div>

          {/* Plant Asset Table */}
          <div className="bg-card/80 border border-border/80 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-border/60 pb-3">
              <div>
                <h2 className="font-display font-medium text-lg text-foreground">
                  Equipment Line Inventory & CRA Statutory Classification
                </h2>
                <p className="text-xs text-muted-foreground">
                  Automated Annex III risk mapping and conformity pathway resolution for {selectedPlant.name}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="font-mono text-xs gap-1">
                  <FileSpreadsheet className="w-3.5 h-3.5 text-primary" />
                  Import CSV / Nozomi
                </Button>
                <Button size="sm" className="font-mono text-xs gap-1 bg-primary text-primary-foreground">
                  <Plus className="w-3.5 h-3.5" />
                  Add Equipment
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-border/60 text-muted-foreground font-mono uppercase text-[11px]">
                    <th className="py-2.5 px-3">Asset ID / Name</th>
                    <th className="py-2.5 px-3">OEM / Model</th>
                    <th className="py-2.5 px-3">Firmware</th>
                    <th className="py-2.5 px-3">CRA Classification</th>
                    <th className="py-2.5 px-3">Conformity Route</th>
                    <th className="py-2.5 px-3">Duty to Refrain</th>
                    <th className="py-2.5 px-3">Recital 34</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {selectedPlant.assets.map((asset) => (
                    <tr key={asset.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-mono font-bold text-foreground">{asset.id}</div>
                        <div className="text-muted-foreground text-[11px]">{asset.name}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-medium text-foreground">{asset.manufacturer}</span>
                        <div className="text-muted-foreground text-[11px]">{asset.model}</div>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-muted-foreground">
                        {asset.firmware}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`font-mono text-[10px] px-2 py-0.5 rounded-full border font-semibold ${
                            asset.craCategory === 'IMPORTANT_CLASS_II'
                              ? 'bg-orange-500/10 text-orange-500 border-orange-500/30'
                              : asset.craCategory === 'IMPORTANT_CLASS_I'
                              ? 'bg-primary/10 text-primary border-primary/30'
                              : 'bg-muted text-muted-foreground border-border'
                          }`}
                        >
                          {asset.craCategory.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-muted-foreground">
                        {asset.conformityRoute.replace(/_/g, ' ')}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`font-mono text-[10px] px-2 py-0.5 rounded-md font-semibold ${
                            asset.dutyToRefrainStatus === 'APPROVED'
                              ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                              : 'bg-red-500/10 text-red-500 border border-red-500/20'
                          }`}
                        >
                          {asset.dutyToRefrainStatus}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {asset.recital34SafeHarbor ? (
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] text-green-500">
                            <CheckCircle2 className="w-3 h-3" /> Safe Harbor
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                            <XCircle className="w-3 h-3" /> Standard
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => {
                            setArt21Form((prev) => ({
                              ...prev,
                              targetModel: `${asset.manufacturer} ${asset.model}`,
                              clientSite: selectedPlant.name,
                            }));
                            setActiveTab('article21');
                          }}
                          className="font-mono text-[11px] text-primary hover:underline"
                        >
                          Clear Art. 21 →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* STAGE 2: Article 21 & Recital 34 Safe Harbor Clearance */}
      {activeTab === 'article21' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-card/80 border border-border/80 rounded-xl p-6 shadow-xs space-y-5">
            <div className="border-b border-border/60 pb-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-primary">
                  Stage 2: Statutory Decision Wizard
                </span>
                <button
                  onClick={() => setStatutoryFlyout({ type: 'article', number: 21 })}
                  className="font-mono text-xs text-muted-foreground hover:text-primary flex items-center gap-1"
                >
                  <Gavel className="w-3 h-3" />
                  Read Art. 21(2) & Recital 34
                </button>
              </div>
              <h2 className="font-display font-medium text-xl text-foreground mt-1">
                Substantial Modification & Integrator Liability Demarcation
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Verify whether plant maintenance interventions qualify for the Recital 34 Safe Harbor or trigger Article 20 Manufacturer liabilities.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[11px] font-mono text-muted-foreground">System Integrator Entity</label>
                <Input
                  value={art21Form.siName}
                  onChange={(e) => setArt21Form({ ...art21Form, siName: e.target.value })}
                  className="mt-1 text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-muted-foreground">Target Plant / Site</label>
                <Input
                  value={art21Form.clientSite}
                  onChange={(e) => setArt21Form({ ...art21Form, clientSite: e.target.value })}
                  className="mt-1 text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-muted-foreground">Target Equipment SKU / Model</label>
                <Input
                  value={art21Form.targetModel}
                  onChange={(e) => setArt21Form({ ...art21Form, targetModel: e.target.value })}
                  className="mt-1 text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-mono text-muted-foreground">Lead Certifying Engineer</label>
                <Input
                  value={art21Form.engineerName}
                  onChange={(e) => setArt21Form({ ...art21Form, engineerName: e.target.value })}
                  className="mt-1 text-xs"
                />
              </div>
            </div>

            {/* 4 Statutory Questions */}
            <div className="space-y-3 pt-2 border-t border-border/60">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Statutory Engineering Checklist
              </span>

              <label className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/60 cursor-pointer hover:bg-muted/40">
                <input
                  type="checkbox"
                  checked={art21Form.q1}
                  onChange={(e) => setArt21Form({ ...art21Form, q1: e.target.checked })}
                  className="mt-0.5 rounded text-primary focus:ring-primary"
                />
                <div className="text-xs">
                  <div className="font-medium text-foreground">
                    1. Identical OEM Replacement Part (Recital 34)
                  </div>
                  <div className="text-muted-foreground text-[11px]">
                    The replacement unit matches the original manufacturer form, fit, and certified SKU.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/60 cursor-pointer hover:bg-muted/40">
                <input
                  type="checkbox"
                  checked={art21Form.q2}
                  onChange={(e) => setArt21Form({ ...art21Form, q2: e.target.checked })}
                  className="mt-0.5 rounded text-primary focus:ring-primary"
                />
                <div className="text-xs">
                  <div className="font-medium text-foreground">
                    2. Manufacturer-Signed Firmware Verification
                  </div>
                  <div className="text-muted-foreground text-[11px]">
                    Firmware updates are cryptographically signed by the OEM without custom unsigned code modifications.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/60 cursor-pointer hover:bg-muted/40">
                <input
                  type="checkbox"
                  checked={art21Form.q3}
                  onChange={(e) => setArt21Form({ ...art21Form, q3: e.target.checked })}
                  className="mt-0.5 rounded text-primary focus:ring-primary"
                />
                <div className="text-xs">
                  <div className="font-medium text-foreground">
                    3. Intended Purpose & Safety Boundary Constant (Art. 21(1))
                  </div>
                  <div className="text-muted-foreground text-[11px]">
                    The operational purpose, safety interlocks, and network routing boundaries remain unchanged.
                  </div>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-lg bg-muted/20 border border-border/60 cursor-pointer hover:bg-muted/40">
                <input
                  type="checkbox"
                  checked={art21Form.q4}
                  onChange={(e) => setArt21Form({ ...art21Form, q4: e.target.checked })}
                  className="mt-0.5 rounded text-primary focus:ring-primary"
                />
                <div className="text-xs">
                  <div className="font-medium text-foreground">
                    4. Performance & Threat Envelope Maintained
                  </div>
                  <div className="text-muted-foreground text-[11px]">
                    No new network protocols, wireless bridges, or cloud telemetry forwarders introduced.
                  </div>
                </div>
              </label>
            </div>

            <Button
              onClick={() => evaluateArt21Mutation.mutate(art21Form)}
              disabled={evaluateArt21Mutation.isPending}
              className="w-full bg-primary text-primary-foreground font-medium text-xs py-2.5 shadow-sm"
            >
              {evaluateArt21Mutation.isPending ? 'Evaluating Statutory Basis...' : 'Execute Article 21 Statutory Clearance'}
            </Button>
          </div>

          {/* Right Column: Clearance Certificate Output */}
          <div className="lg:col-span-5 space-y-4">
            {art21Result ? (
              <div
                className={`p-6 rounded-xl border shadow-sm space-y-4 ${
                  art21Result.classification === 'INTEGRATOR_EXEMPT'
                    ? 'bg-green-500/[0.04] border-green-500/40'
                    : 'bg-red-500/[0.04] border-red-500/40'
                }`}
              >
                <div className="flex items-center justify-between pb-3 border-b border-border/60">
                  <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
                    Statutory Determination Result
                  </span>
                  <span
                    className={`font-mono text-xs px-2.5 py-0.5 rounded-full font-bold ${
                      art21Result.classification === 'INTEGRATOR_EXEMPT'
                        ? 'bg-green-500/20 text-green-500 border border-green-500/40'
                        : 'bg-red-500/20 text-red-500 border border-red-500/40'
                    }`}
                  >
                    {art21Result.classification}
                  </span>
                </div>

                <div>
                  <h3 className="font-display font-medium text-lg text-foreground">
                    {art21Result.classification === 'INTEGRATOR_EXEMPT'
                      ? 'Recital 34 Safe Harbor Certificate Granted'
                      : 'Manufacturer Status Triggered (Art. 20)'}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {art21Result.statutoryBasis}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-card/60 border border-border/60 space-y-1 text-xs">
                  <div className="font-mono text-[10px] text-muted-foreground uppercase">Cryptographic Audit Hash:</div>
                  <div className="font-mono text-[11px] text-primary break-all">
                    {art21Result.certificateHash}
                  </div>
                </div>

                <div className="text-xs text-muted-foreground leading-relaxed">
                  <strong>Recommendation:</strong> {art21Result.recommendationText}
                </div>

                {art21Result.classification === 'INTEGRATOR_EXEMPT' && (
                  <Button variant="outline" className="w-full font-mono text-xs gap-1.5">
                    <FileDown className="w-4 h-4 text-primary" />
                    Download Signed Recital 34 Certificate (PDF)
                  </Button>
                )}
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-muted/20 border border-border/60 text-center space-y-2">
                <Scale className="w-8 h-8 text-muted-foreground mx-auto" />
                <h3 className="font-display font-medium text-base text-foreground">Awaiting Assessment Execution</h3>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                  Complete the 4 statutory questions on the left and click execute to generate a verified Recital 34 Safe Harbor Certificate.
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
                    <span>CE Marking Affixed & Physically Verified (Art. 23)</span>
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
                Assembles the 6 statutory documentation sections for {selectedPlant.name} required by European Notified Bodies.
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
