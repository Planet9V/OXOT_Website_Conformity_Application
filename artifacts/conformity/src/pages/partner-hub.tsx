import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
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
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

interface SupplierItem {
  id: number;
  name: string;
  vendorKey: string;
  country: string;
  complianceStatus: string;
  hasPublishedDoC: boolean;
  declaredSupportYears: number;
  dutyToRefrainAlert: boolean;
  notes: string;
}

export default function PartnerHubPage() {
  const [activeTab, setActiveTab] = useState<'suppliers' | 'article21' | 'procurement' | 'clauses' | 'composite'>('suppliers');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Tab 1: Suppliers Query
  const { data: supplierData, isLoading: isSuppliersLoading } = useQuery<{ total: number; items: SupplierItem[] }>({
    queryKey: ['/api/partner/suppliers'],
    queryFn: async () => {
      const res = await fetch('/api/partner/suppliers');
      if (!res.ok) throw new Error('Failed to fetch suppliers');
      return res.json();
    },
  });

  // Tab 2: Article 21 State
  const [art21Form, setArt21Form] = useState({
    siName: 'Axians Netherlands B.V.',
    clientSite: 'Rotterdam Petrochemical Terminal',
    projectName: 'OT Core Network Modernization',
    targetModel: 'Hirschmann RS20-0800M2M2SDAE',
    targetSku: '943434-001',
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

  // Tab 3: Pre-Procurement Scorecard State
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

  // Tab 4: Clauses Query
  const { data: clausesData } = useQuery<{
    contractTitle: string;
    governingLaw: string;
    statutoryReference: string;
    clauses: Array<{ id: string; title: string; clauseText: string; purpose: string; mandatoryFor: string[] }>;
  }>({
    queryKey: ['/api/ecosystem/contracts/clauses'],
    queryFn: async () => {
      const res = await fetch('/api/ecosystem/contracts/clauses');
      if (!res.ok) throw new Error('Failed to fetch clauses');
      return res.json();
    },
  });

  // Tab 5: Composite Machine Builder State
  const [compositeForm, setCompositeForm] = useState({
    systemName: 'High-Speed Pharmaceutical Bottling Skid',
    machineType: 'skid_controller',
    manufacturerName: 'Aalberts Industrial Automation',
    systemVersion: '2.4.0',
    ieee62443ZoneSegregation: true,
    components: [
      {
        componentName: 'Main Controller PLC',
        vendor: 'Siemens',
        componentRole: 'plc',
        firmwareVersion: 'V4.2.1',
        ceMarkPresent: true,
        docAvailable: true,
        docUrl: 'https://siemens.com/doc.pdf',
        supportExpiryDate: '2032-12-31',
      },
      {
        componentName: 'Operator HMI Panel',
        vendor: 'Schneider Electric',
        componentRole: 'hmi',
        firmwareVersion: 'V3.1.0',
        ceMarkPresent: true,
        docAvailable: true,
        docUrl: 'https://se.com/doc.pdf',
        supportExpiryDate: '2030-06-30',
      },
      {
        componentName: 'Edge Gateway Module',
        vendor: 'Moxa',
        componentRole: 'gateway',
        firmwareVersion: 'V2.0.0',
        ceMarkPresent: true,
        docAvailable: true,
        docUrl: 'https://moxa.com/doc.pdf',
        supportExpiryDate: '2029-12-31',
      },
    ],
  });
  const [compositeResult, setCompositeResult] = useState<any | null>(null);

  const evaluateCompositeMutation = useMutation({
    mutationFn: async (payload: typeof compositeForm) => {
      const res = await fetch('/api/ecosystem/composite/assemble', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Failed to assemble composite system');
      return res.json();
    },
    onSuccess: (data) => setCompositeResult(data),
  });

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const filteredSuppliers = (supplierData?.items || []).filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.vendorKey.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto p-6 max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Building2 className="h-4 w-4" />
            <span>Single-Tenant B2B System Integrator & Distributor Portal</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mt-1">
            CRA Modernization, Spare-Parts & Multi-Persona Ecosystem Hub
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage customer hardware scopes, warehouse spare parts (Recital 34), Article 21 substantial modification audits, and supplier compliance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 text-xs font-semibold border border-emerald-500/20 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4" /> Single-Tenant Verified
          </span>
        </div>
      </div>

      {/* Quick Metric Cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Tracked OEM Suppliers</span>
          <p className="text-2xl font-bold font-mono text-foreground mt-1">{supplierData?.total || 5}</p>
          <span className="text-[11px] text-muted-foreground">CRA Art. 19 Verified</span>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Identical Spares on Hand</span>
          <p className="text-2xl font-bold font-mono text-foreground mt-1">1,280+</p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Recital 34 Eligible (48h)</span>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Statutory Reporting Deadline</span>
          <p className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400 mt-1">11 Sept 2026</p>
          <span className="text-[11px] text-muted-foreground">Article 14 24h Early Warning</span>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Pre-2027 General Date</span>
          <p className="text-2xl font-bold font-mono text-foreground mt-1">11 Dec 2027</p>
          <span className="text-[11px] text-muted-foreground">Full CE-Mark Mandatory</span>
        </div>
      </div>

      {/* 5-Tab Navigation Strip */}
      <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('suppliers')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'suppliers' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted/50'
          }`}
        >
          <Building2 className="h-4 w-4" />
          <span>1. OEM Supplier Registry (Art. 18/19)</span>
        </button>
        <button
          onClick={() => setActiveTab('article21')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'article21' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted/50'
          }`}
        >
          <Scale className="h-4 w-4" />
          <span>2. Article 21 Modification Wizard</span>
        </button>
        <button
          onClick={() => setActiveTab('procurement')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'procurement' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted/50'
          }`}
        >
          <ShieldAlert className="h-4 w-4" />
          <span>3. Pre-Procurement Scorecard</span>
        </button>
        <button
          onClick={() => setActiveTab('clauses')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'clauses' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted/50'
          }`}
        >
          <FileCheck2 className="h-4 w-4" />
          <span>4. Recital 34 SLA Clause Pack</span>
        </button>
        <button
          onClick={() => setActiveTab('composite')}
          className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'composite' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted/50'
          }`}
        >
          <Boxes className="h-4 w-4" />
          <span>5. Composite Machine Builder</span>
        </button>
      </div>

      {/* Tab 1: OEM Supplier Registry */}
      {activeTab === 'suppliers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vendor or country..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-xs"
              />
            </div>
            <span className="text-xs text-muted-foreground">
              Showing {filteredSuppliers.length} verified manufacturers
            </span>
          </div>

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 border-b border-border font-semibold text-muted-foreground">
                  <tr>
                    <th className="p-3">Manufacturer</th>
                    <th className="p-3">Vendor Key</th>
                    <th className="p-3">Country</th>
                    <th className="p-3">Compliance Status</th>
                    <th className="p-3">EU DoC on File</th>
                    <th className="p-3">Guaranteed Support</th>
                    <th className="p-3">Article 19 Risk</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredSuppliers.map((supp) => (
                    <tr key={supp.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-semibold text-foreground">{supp.name}</td>
                      <td className="p-3 font-mono text-muted-foreground">{supp.vendorKey}</td>
                      <td className="p-3 text-muted-foreground">{supp.country}</td>
                      <td className="p-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold border ${
                            supp.complianceStatus === 'COMPLIANT'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
                          }`}
                        >
                          {supp.complianceStatus}
                        </span>
                      </td>
                      <td className="p-3">
                        {supp.hasPublishedDoC ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-medium">✓ Published</span>
                        ) : (
                          <span className="text-red-500 font-medium">✗ Missing</span>
                        )}
                      </td>
                      <td className="p-3 font-mono">
                        {supp.declaredSupportYears > 0 ? `${supp.declaredSupportYears} Years` : 'None (EOS)'}
                      </td>
                      <td className="p-3">
                        {supp.dutyToRefrainAlert ? (
                          <span className="rounded bg-red-500/10 text-red-600 dark:text-red-400 px-2 py-0.5 text-[10px] font-bold border border-red-500/20">
                            DUTY TO REFRAIN
                          </span>
                        ) : (
                          <span className="text-muted-foreground">Clear</span>
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

      {/* Tab 2: Article 21 Substantial Modification Wizard */}
      {activeTab === 'article21' && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Scale className="h-4 w-4 text-primary" />
                Article 21 Statutory Boundary Checklist
              </h3>
              <span className="text-[11px] text-muted-foreground">Recital 34 Due Diligence</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-medium text-foreground block mb-1">System Integrator Name</label>
                <Input
                  value={art21Form.siName}
                  onChange={(e) => setArt21Form({ ...art21Form, siName: e.target.value })}
                  className="text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-medium text-foreground block mb-1">Client Site Name</label>
                  <Input
                    value={art21Form.clientSite}
                    onChange={(e) => setArt21Form({ ...art21Form, clientSite: e.target.value })}
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="font-medium text-foreground block mb-1">Project Name</label>
                  <Input
                    value={art21Form.projectName}
                    onChange={(e) => setArt21Form({ ...art21Form, projectName: e.target.value })}
                    className="text-xs"
                  />
                </div>
              </div>
              <div>
                <label className="font-medium text-foreground block mb-1">Target Hardware Model / SKU</label>
                <Input
                  value={art21Form.targetModel}
                  onChange={(e) => setArt21Form({ ...art21Form, targetModel: e.target.value })}
                  className="text-xs"
                />
              </div>

              {/* 4 Gating Checkboxes */}
              <div className="space-y-2 pt-2 border-t border-border">
                <span className="font-bold text-foreground block uppercase tracking-wider text-[11px]">
                  4 Statutory Gates (CRA Art. 21(1) & Recital 34)
                </span>

                <label className="flex items-start gap-2 p-2 rounded-lg border border-border bg-background cursor-pointer">
                  <input
                    type="checkbox"
                    checked={art21Form.q1}
                    onChange={(e) => setArt21Form({ ...art21Form, q1: e.target.checked })}
                    className="mt-0.5"
                  />
                  <div>
                    <span className="font-semibold text-foreground">1. Identical Replacement Part</span>
                    <p className="text-[11px] text-muted-foreground">
                      Replacement switch/PLC is intended to replace an identical component in hardware placed on market pre-2027.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-2 p-2 rounded-lg border border-border bg-background cursor-pointer">
                  <input
                    type="checkbox"
                    checked={art21Form.q2}
                    onChange={(e) => setArt21Form({ ...art21Form, q2: e.target.checked })}
                    className="mt-0.5"
                  />
                  <div>
                    <span className="font-semibold text-foreground">2. Original OEM Signed Firmware</span>
                    <p className="text-[11px] text-muted-foreground">
                      All updates applied are vendor-certified and cryptographically signed without reverse-engineering.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-2 p-2 rounded-lg border border-border bg-background cursor-pointer">
                  <input
                    type="checkbox"
                    checked={art21Form.q3}
                    onChange={(e) => setArt21Form({ ...art21Form, q3: e.target.checked })}
                    className="mt-0.5"
                  />
                  <div>
                    <span className="font-semibold text-foreground">3. Intended Purpose Remains Unchanged</span>
                    <p className="text-[11px] text-muted-foreground">
                      The device operates within its original intended design envelope without repurposing to higher safety zones.
                    </p>
                  </div>
                </label>

                <label className="flex items-start gap-2 p-2 rounded-lg border border-border bg-background cursor-pointer">
                  <input
                    type="checkbox"
                    checked={art21Form.q4}
                    onChange={(e) => setArt21Form({ ...art21Form, q4: e.target.checked })}
                    className="mt-0.5"
                  />
                  <div>
                    <span className="font-semibold text-foreground">4. Constant Performance & Hazard Envelope</span>
                    <p className="text-[11px] text-muted-foreground">
                      No expansion of hazardous operation, machine power rating, or network boundary traversal.
                    </p>
                  </div>
                </label>
              </div>

              <Button
                onClick={() => evaluateArt21Mutation.mutate(art21Form)}
                disabled={evaluateArt21Mutation.isPending}
                className="w-full mt-3"
              >
                {evaluateArt21Mutation.isPending ? 'Assessing Statutory Status...' : 'Evaluate Article 21 Boundary'}
              </Button>
            </div>
          </div>

          {/* Assessment Result & Cryptographic Certificate */}
          <div className="space-y-4">
            {art21Result ? (
              <div
                className={`rounded-xl border p-5 space-y-4 ${
                  art21Result.classification === 'INTEGRATOR_EXEMPT'
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : 'border-red-500/30 bg-red-500/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold border ${
                      art21Result.classification === 'INTEGRATOR_EXEMPT'
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                        : 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30'
                    }`}
                  >
                    {art21Result.classification === 'INTEGRATOR_EXEMPT'
                      ? '✓ INTEGRATOR STATUS PRESERVED'
                      : '⚠ FULL MANUFACTURER LIABILITIES TRIGGERED'}
                  </span>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    Hash: {art21Result.certificateHash.substring(0, 12)}...
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-foreground">{art21Result.targetHardwareModel}</h4>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    {art21Result.statutoryBasis}
                  </p>
                </div>

                <div className="rounded-lg border border-border bg-card p-3 text-xs space-y-2">
                  <span className="font-semibold text-foreground block">Integrator Exemption Certificate Summary</span>
                  <p className="text-muted-foreground leading-relaxed">{art21Result.recommendationText}</p>
                  <div className="pt-2 border-t border-border flex items-center justify-between font-mono text-[10px] text-muted-foreground">
                    <span>SHA-256 Seal: {art21Result.certificateHash}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleCopy(
                        `CRA ARTICLE 21 DUE DILIGENCE CERTIFICATE\nSystem Integrator: ${art21Result.systemIntegratorName}\nProject: ${art21Result.projectName}\nModel: ${art21Result.targetHardwareModel}\nClassification: ${art21Result.classification}\nStatutory Basis: ${art21Result.statutoryBasis}\nSHA-256 Seal: ${art21Result.certificateHash}`,
                        'art21cert'
                      )
                    }
                    className="text-xs flex items-center gap-1.5"
                  >
                    {copiedKey === 'art21cert' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    Copy Sealed Certificate
                  </Button>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center text-muted-foreground flex flex-col items-center justify-center space-y-2">
                <Scale className="h-8 w-8 text-muted-foreground/50" />
                <p className="text-xs">Fill the 4 statutory gates on the left to evaluate Article 21 legal liability.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Pre-Procurement Scorecard */}
      {activeTab === 'procurement' && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
              <ShieldAlert className="h-4 w-4 text-primary" />
              CRA Pre-Procurement Vendor Scorecard (Art. 18 & 19)
            </h3>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-medium text-foreground block mb-1">Vendor / OEM Name</label>
                  <Input
                    value={procForm.vendorName}
                    onChange={(e) => setProcForm({ ...procForm, vendorName: e.target.value })}
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="font-medium text-foreground block mb-1">Product Name / Model</label>
                  <Input
                    value={procForm.productName}
                    onChange={(e) => setProcForm({ ...procForm, productName: e.target.value })}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-medium text-foreground block mb-1">Product CRA Class</label>
                  <select
                    value={procForm.productClass}
                    onChange={(e) => setProcForm({ ...procForm, productClass: e.target.value })}
                    className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs"
                  >
                    <option value="default">Default / Unclassified</option>
                    <option value="important_class_1">Important Class I (Switches, Routers)</option>
                    <option value="important_class_2">Important Class II (Firewalls, PLCs)</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="font-medium text-foreground block mb-1">Support Period (Years)</label>
                  <Input
                    type="number"
                    min={1}
                    value={procForm.supportPeriodYears}
                    onChange={(e) => setProcForm({ ...procForm, supportPeriodYears: parseInt(e.target.value, 10) || 5 })}
                    className="text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-foreground block mb-1">EU Declaration of Conformity URL</label>
                <Input
                  value={procForm.docUrl}
                  onChange={(e) => setProcForm({ ...procForm, docUrl: e.target.value })}
                  placeholder="https://vendor.com/compliance/doc.pdf"
                  className="text-xs font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-medium text-foreground block mb-1">Machine-Readable SBOM</label>
                  <select
                    value={procForm.sbomFormat}
                    onChange={(e) => setProcForm({ ...procForm, sbomFormat: e.target.value })}
                    className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-xs"
                  >
                    <option value="cyclonedx_json">CycloneDX 1.6 JSON</option>
                    <option value="spdx_json">SPDX 2.3 JSON</option>
                    <option value="none">None / PDF Only</option>
                  </select>
                </div>
                <div>
                  <label className="font-medium text-foreground block mb-1">PSIRT Vulnerability Contact</label>
                  <Input
                    value={procForm.vulnerabilityContact}
                    onChange={(e) => setProcForm({ ...procForm, vulnerabilityContact: e.target.value })}
                    placeholder="psirt@vendor.com"
                    className="text-xs font-mono"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2 pt-2 border-t border-border">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={procForm.ceMarkVerified}
                    onChange={(e) => setProcForm({ ...procForm, ceMarkVerified: e.target.checked })}
                  />
                  <span className="font-medium text-foreground">Verified Physical / Digital CE Mark (CRA Art. 22)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={procForm.docVerified}
                    onChange={(e) => setProcForm({ ...procForm, docVerified: e.target.checked })}
                  />
                  <span className="font-medium text-foreground">EU Declaration of Conformity Validated (Annex V)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={procForm.freeSecurityPatches}
                    onChange={(e) => setProcForm({ ...procForm, freeSecurityPatches: e.target.checked })}
                  />
                  <span className="font-medium text-foreground">Free Security Updates Guarantee (CRA Art. 10(6))</span>
                </label>
              </div>

              <Button
                onClick={() => evaluateProcMutation.mutate(procForm)}
                disabled={evaluateProcMutation.isPending}
                className="w-full mt-3"
              >
                {evaluateProcMutation.isPending ? 'Calculating Scorecard...' : 'Run Vendor Evaluation'}
              </Button>
            </div>
          </div>

          {/* Result Scorecard */}
          <div className="space-y-4">
            {procResult ? (
              <div
                className={`rounded-xl border p-5 space-y-4 ${
                  procResult.scorecardStatus === 'APPROVED'
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : procResult.scorecardStatus === 'CONDITIONAL'
                    ? 'border-amber-500/30 bg-amber-500/5'
                    : 'border-red-500/30 bg-red-500/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold border ${
                      procResult.scorecardStatus === 'APPROVED'
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                        : procResult.scorecardStatus === 'CONDITIONAL'
                        ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
                        : 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30'
                    }`}
                  >
                    STATUS: {procResult.scorecardStatus}
                  </span>
                  <div className="text-right">
                    <span className="text-2xl font-bold font-mono text-foreground">{procResult.evaluationScore}/100</span>
                    <span className="text-[10px] text-muted-foreground block">CRA Readiness Index</span>
                  </div>
                </div>

                {/* Score Breakdown Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded bg-card border border-border flex items-center justify-between">
                    <span>CE Mark:</span>
                    <span className={procResult.criteriaScores.ceMark ? 'text-emerald-600 font-bold' : 'text-red-500 font-bold'}>
                      {procResult.criteriaScores.ceMark ? 'PASS (+25)' : 'FAIL'}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-card border border-border flex items-center justify-between">
                    <span>EU DoC:</span>
                    <span className={procResult.criteriaScores.euDoc ? 'text-emerald-600 font-bold' : 'text-red-500 font-bold'}>
                      {procResult.criteriaScores.euDoc ? 'PASS (+25)' : 'FAIL'}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-card border border-border flex items-center justify-between">
                    <span>5y Lifetime:</span>
                    <span className={procResult.criteriaScores.supportLifetime ? 'text-emerald-600 font-bold' : 'text-red-500 font-bold'}>
                      {procResult.criteriaScores.supportLifetime ? 'PASS (+20)' : 'FAIL'}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-card border border-border flex items-center justify-between">
                    <span>CycloneDX SBOM:</span>
                    <span className={procResult.criteriaScores.machineReadableSbom ? 'text-emerald-600 font-bold' : 'text-amber-600 font-bold'}>
                      {procResult.criteriaScores.machineReadableSbom ? 'PASS (+10)' : 'MISSING'}
                    </span>
                  </div>
                </div>

                {/* Rejection / Conditional items */}
                {procResult.rejectionReasons.length > 0 && (
                  <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs space-y-1">
                    <span className="font-bold text-red-600 dark:text-red-400 block">Critical Disqualifiers:</span>
                    {procResult.rejectionReasons.map((r: string, idx: number) => (
                      <p key={idx} className="text-red-700 dark:text-red-300">• {r}</p>
                    ))}
                  </div>
                )}

                {procResult.conditionalRemediations.length > 0 && (
                  <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs space-y-1">
                    <span className="font-bold text-amber-600 dark:text-amber-400 block">Conditional Action Items:</span>
                    {procResult.conditionalRemediations.map((c: string, idx: number) => (
                      <p key={idx} className="text-amber-700 dark:text-amber-300">• {c}</p>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center text-muted-foreground flex flex-col items-center justify-center space-y-2">
                <ShieldAlert className="h-8 w-8 text-muted-foreground/50" />
                <p className="text-xs">Configure vendor criteria to calculate pre-procurement statutory score.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 4: Recital 34 B2B SLA Clause Pack */}
      {activeTab === 'clauses' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 text-emerald-500" />
                {clausesData?.contractTitle || 'B2B Recital 34 Contractual SLA Clause Pack'}
              </h3>
              <p className="text-xs text-muted-foreground">
                Statutory reference: {clausesData?.statutoryReference || 'Regulation (EU) 2024/2847'}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                handleCopy(
                  (clausesData?.clauses || [])
                    .map((c) => `${c.title}\n${c.clauseText}\n(Purpose: ${c.purpose})\n`)
                    .join('\n'),
                  'allClauses'
                )
              }
              className="text-xs flex items-center gap-1.5"
            >
              {copiedKey === 'allClauses' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
              Copy All Clauses
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {(clausesData?.clauses || []).map((clause) => (
              <div key={clause.id} className="rounded-xl border border-border bg-card p-4 space-y-2 text-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">{clause.title}</span>
                    <span className="rounded bg-primary/10 text-primary px-1.5 py-0.5 text-[10px] font-mono">
                      {clause.id}
                    </span>
                  </div>
                  <p className="mt-2 text-muted-foreground font-mono leading-relaxed bg-muted/30 p-2.5 rounded border border-border">
                    {clause.clauseText}
                  </p>
                </div>
                <div className="pt-2 border-t border-border flex items-center justify-between">
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                    Purpose: {clause.purpose}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(`${clause.title}\n\n${clause.clauseText}`, clause.id)}
                    className="text-xs h-7 px-2"
                  >
                    {copiedKey === clause.id ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Composite Machine Builder */}
      {activeTab === 'composite' && (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2 border-b border-border pb-3">
              <Boxes className="h-4 w-4 text-primary" />
              CRA Article 20 Composite System Aggregator
            </h3>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-medium text-foreground block mb-1">Composite Machine Name</label>
                  <Input
                    value={compositeForm.systemName}
                    onChange={(e) => setCompositeForm({ ...compositeForm, systemName: e.target.value })}
                    className="text-xs"
                  />
                </div>
                <div>
                  <label className="font-medium text-foreground block mb-1">Machine Builder OEM</label>
                  <Input
                    value={compositeForm.manufacturerName}
                    onChange={(e) => setCompositeForm({ ...compositeForm, manufacturerName: e.target.value })}
                    className="text-xs"
                  />
                </div>
              </div>

              {/* Sub-Components List */}
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground block uppercase text-[11px]">
                    Sub-Components ({compositeForm.components.length})
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setCompositeForm({
                        ...compositeForm,
                        components: [
                          ...compositeForm.components,
                          {
                            componentName: 'New Sub-Module',
                            vendor: 'Generic',
                            componentRole: 'sensor',
                            firmwareVersion: '1.0',
                            ceMarkPresent: true,
                            docAvailable: true,
                            docUrl: '',
                            supportExpiryDate: '2030-01-01',
                          },
                        ],
                      })
                    }
                    className="text-xs h-7 px-2 flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" /> Add Component
                  </Button>
                </div>

                {compositeForm.components.map((comp, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg border border-border bg-background space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <Input
                        value={comp.componentName}
                        onChange={(e) => {
                          const updated = [...compositeForm.components];
                          updated[idx].componentName = e.target.value;
                          setCompositeForm({ ...compositeForm, components: updated });
                        }}
                        className="text-xs h-7 flex-1"
                        placeholder="Component name"
                      />
                      <Input
                        value={comp.vendor}
                        onChange={(e) => {
                          const updated = [...compositeForm.components];
                          updated[idx].vendor = e.target.value;
                          setCompositeForm({ ...compositeForm, components: updated });
                        }}
                        className="text-xs h-7 w-28"
                        placeholder="Vendor"
                      />
                      <button
                        onClick={() => {
                          const updated = compositeForm.components.filter((_, i) => i !== idx);
                          setCompositeForm({ ...compositeForm, components: updated });
                        }}
                        className="text-red-500 hover:text-red-700 p-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-1 border-t border-border/50">
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={comp.ceMarkPresent}
                          onChange={(e) => {
                            const updated = [...compositeForm.components];
                            updated[idx].ceMarkPresent = e.target.checked;
                            setCompositeForm({ ...compositeForm, components: updated });
                          }}
                        />
                        <span>CE Mark</span>
                      </label>
                      <label className="flex items-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={comp.docAvailable}
                          onChange={(e) => {
                            const updated = [...compositeForm.components];
                            updated[idx].docAvailable = e.target.checked;
                            setCompositeForm({ ...compositeForm, components: updated });
                          }}
                        />
                        <span>DoC Available</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              <Button
                onClick={() => evaluateCompositeMutation.mutate(compositeForm)}
                disabled={evaluateCompositeMutation.isPending}
                className="w-full mt-3"
              >
                {evaluateCompositeMutation.isPending ? 'Verifying Composite Machine...' : 'Evaluate Composite Compliance'}
              </Button>
            </div>
          </div>

          {/* Composite System Result */}
          <div className="space-y-4">
            {compositeResult ? (
              <div
                className={`rounded-xl border p-5 space-y-4 ${
                  compositeResult.compositeComplianceStatus === 'COMPLIANT'
                    ? 'border-emerald-500/30 bg-emerald-500/5'
                    : 'border-red-500/30 bg-red-500/5'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-bold border ${
                      compositeResult.compositeComplianceStatus === 'COMPLIANT'
                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                        : 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30'
                    }`}
                  >
                    COMPOSITE STATUS: {compositeResult.compositeComplianceStatus}
                  </span>
                  <span className="text-xs font-mono font-semibold">
                    {compositeResult.compliantComponentsCount}/{compositeResult.totalComponentsCount} Compliant
                  </span>
                </div>

                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Integration Risk Score: <strong className="text-foreground">{compositeResult.integrationRiskScore}/100</strong></p>
                  <p className="font-mono text-[10px]">Cryptographic Seal: {compositeResult.docSealedHash}</p>
                </div>

                {compositeResult.flaggedComponents.length > 0 && (
                  <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs space-y-1">
                    <span className="font-bold text-red-600 dark:text-red-400 block">Flagged Non-Compliant Modules:</span>
                    {compositeResult.flaggedComponents.map((f: any, idx: number) => (
                      <p key={idx} className="text-red-700 dark:text-red-300">
                        • {f.componentName} ({f.vendor}): {f.reason}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-border bg-card/50 p-8 text-center text-muted-foreground flex flex-col items-center justify-center space-y-2">
                <Boxes className="h-8 w-8 text-muted-foreground/50" />
                <p className="text-xs">Add composite modules to evaluate aggregate multi-DoC compliance under Article 20.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
