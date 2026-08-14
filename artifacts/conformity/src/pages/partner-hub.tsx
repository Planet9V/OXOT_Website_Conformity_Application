import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
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
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { parseAndSanitizeBOMText } from '../lib/sanitizeAssetBOM';

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
  const [partnerFilter, setPartnerFilter] = useState('Axians / Actemium');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const { data: supplierData, isLoading } = useQuery<{ total: number; items: SupplierItem[] }>({
    queryKey: ['/api/partner/suppliers'],
    queryFn: async () => {
      const res = await fetch('/api/partner/suppliers');
      if (!res.ok) throw new Error('Failed to fetch suppliers');
      return res.json();
    },
  });

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const filteredSuppliers = (supplierData?.items || []).filter((s) =>
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
            CRA Modernization, Spare-Parts & Distributor Compliance Hub
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Manage customer hardware scopes, warehouse stock matching (Recital 34), and Article 19 supplier verification.
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
          <p className="text-2xl font-bold font-mono text-primary mt-1">11 Dec 2027</p>
          <span className="text-[11px] text-muted-foreground">Article 69(2) Grandfathering</span>
        </div>
      </div>

      {/* Supplier Compliance Registry Table */}
      <div className="rounded-xl border border-border bg-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5 text-primary" />
            <h2 className="text-base font-semibold text-foreground">
              Supplier & OEM Compliance Registry (CRA Art. 18 & 19)
            </h2>
          </div>
          <div className="w-full sm:w-64">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vendor or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 text-xs"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/50 text-muted-foreground border-b border-border">
              <tr>
                <th className="p-3">OEM Supplier</th>
                <th className="p-3">Country / Importer</th>
                <th className="p-3">Compliance Status</th>
                <th className="p-3">EU Declaration of Conformity</th>
                <th className="p-3">Support Term</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredSuppliers.map((supp) => (
                <tr key={supp.id} className="hover:bg-muted/20">
                  <td className="p-3 font-semibold text-foreground">{supp.name}</td>
                  <td className="p-3 text-muted-foreground font-mono">{supp.country}</td>
                  <td className="p-3">
                    {supp.dutyToRefrainAlert ? (
                      <span className="rounded bg-red-500/10 text-red-600 dark:text-red-400 px-2 py-0.5 text-[10px] font-bold border border-red-500/20">
                        DUTY TO REFRAIN (HALT)
                      </span>
                    ) : (
                      <span className="rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 text-[10px] font-medium border border-emerald-500/20">
                        VERIFIED CE COMPLIANT
                      </span>
                    )}
                  </td>
                  <td className="p-3">
                    {supp.hasPublishedDoC ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                        <Check className="h-3.5 w-3.5" /> Published & On File
                      </span>
                    ) : (
                      <span className="text-red-500 font-medium">Missing / Non-Compliant</span>
                    )}
                  </td>
                  <td className="p-3 font-mono">{supp.declaredSupportYears > 0 ? `${supp.declaredSupportYears} Years` : 'None (EOS)'}</td>
                  <td className="p-3 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(`Vendor: ${supp.name}\nStatus: ${supp.complianceStatus}\nNotes: ${supp.notes}`, `supp-${supp.id}`)}
                      className="text-xs"
                    >
                      {copiedKey === `supp-${supp.id}` ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
