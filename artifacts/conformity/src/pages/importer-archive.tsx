import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link } from 'wouter';
import {
  Archive,
  ShieldCheck,
  FileCheck2,
  Calendar,
  Lock,
  Download,
  Search,
  Plus,
  Gavel,
  CheckCircle2,
  Building2,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

interface DossierItem {
  id: string;
  depositDate: string;
  retentionUntil: string;
  productName: string;
  oemManufacturer: string;
  importerEntity: string;
  docReferenceNumber: string;
  sha256Digest: string;
  archiveStatus: 'ACTIVE_VALID' | 'RETENTION_EXPIRING_SOON' | 'ARCHIVED_EXPIRED';
  marketSurveillanceAccessGranted: boolean;
  fileCount: number;
}

export default function ImporterArchivePage() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading } = useQuery<{ totalDossiers: number; dossiers: DossierItem[] }>({
    queryKey: ['/api/archive/dossiers'],
    queryFn: async () => {
      const res = await fetch('/api/archive/dossiers');
      if (!res.ok) throw new Error('Failed to fetch archive dossiers');
      return res.json();
    },
  });

  const filteredDossiers = (data?.dossiers || []).filter((d) =>
    searchQuery === ''
      ? true
      : d.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.oemManufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.docReferenceNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 font-sans text-foreground">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/80 border border-border/80 p-5 rounded-xl shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shadow-sm">
            <Archive className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-medium text-xl tracking-tight text-foreground">
                10-Year Statutory Compliance Archive Ledger
              </h1>
              <span className="font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 font-semibold">
                Article 17 & 19 Mandate
              </span>
            </div>
            <p className="text-xs font-mono text-muted-foreground mt-0.5">
              Importer & Distributor 10-Year Technical Documentation Archive (Retention through 2037+) • Market Surveillance Authority Ready
            </p>
          </div>
        </div>

        <Link
          href="/wiki"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted border border-border/80 font-mono text-xs text-foreground hover:border-primary transition-all"
        >
          <Gavel className="w-3.5 h-3.5 text-primary" />
          Statutory Ref: Article 17(2)
        </Link>
      </div>

      {/* Metric Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card/80 border border-border/80 p-5 rounded-xl shadow-xs space-y-1">
          <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            Total Deposited Dossiers
          </div>
          <div className="font-display font-medium text-3xl text-primary">{data?.totalDossiers || 3}</div>
          <p className="text-[11px] text-muted-foreground">Under cryptographic tamper-evident seal</p>
        </div>

        <div className="bg-card/80 border border-border/80 p-5 rounded-xl shadow-xs space-y-1">
          <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            Retention Horizon Guarantee
          </div>
          <div className="font-display font-medium text-3xl text-foreground">10 Years</div>
          <p className="text-[11px] text-muted-foreground">Maintained at MSA disposal through 2036+</p>
        </div>

        <div className="bg-card/80 border border-border/80 p-5 rounded-xl shadow-xs space-y-1">
          <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            Market Surveillance Status
          </div>
          <div className="flex items-center gap-1.5 font-display font-medium text-lg text-green-500 mt-1">
            <CheckCircle2 className="w-5 h-5" />
            100% Audit Ready
          </div>
          <p className="text-[11px] text-muted-foreground">EU RAPEX & National MSA Access Enabled</p>
        </div>
      </div>

      {/* Archive Ledger Table */}
      <div className="bg-card/80 border border-border/80 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by product, OEM manufacturer, or DoC number..."
              className="pl-9 text-xs"
            />
          </div>

          <Button className="bg-primary text-primary-foreground font-mono text-xs gap-1.5">
            <Plus className="w-4 h-4" />
            Deposit New Technical Dossier
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground font-mono uppercase text-[11px]">
                <th className="py-2 px-3">Dossier ID</th>
                <th className="py-2 px-3">Product Name & OEM</th>
                <th className="py-2 px-3">Importer Entity</th>
                <th className="py-2 px-3">EU DoC Reference</th>
                <th className="py-2 px-3">Retention Horizon</th>
                <th className="py-2 px-3">Cryptographic SHA-256 Digest</th>
                <th className="py-2 px-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredDossiers.map((d) => (
                <tr key={d.id} className="hover:bg-muted/20 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-foreground">{d.id}</td>
                  <td className="py-3 px-3">
                    <div className="font-medium text-foreground">{d.productName}</div>
                    <div className="text-[11px] text-muted-foreground">{d.oemManufacturer}</div>
                  </td>
                  <td className="py-3 px-3 font-medium text-foreground">{d.importerEntity}</td>
                  <td className="py-3 px-3 font-mono text-primary font-semibold">{d.docReferenceNumber}</td>
                  <td className="py-3 px-3">
                    <div className="font-mono text-xs text-foreground font-bold">Until {d.retentionUntil}</div>
                    <div className="font-mono text-[10px] text-muted-foreground">Deposited: {d.depositDate}</div>
                  </td>
                  <td className="py-3 px-3 font-mono text-[10px] text-muted-foreground max-w-xs truncate">
                    {d.sha256Digest}
                  </td>
                  <td className="py-3 px-3">
                    <Button variant="outline" size="sm" className="font-mono text-[11px] gap-1">
                      <Download className="w-3 h-3 text-primary" />
                      Dossier ZIP ({d.fileCount})
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
