import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link } from 'wouter';
import {
  Layers,
  Scale,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileCheck2,
  ArrowRight,
  Gavel,
  Shield,
  Download,
  Filter,
  Check,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

interface StandardClauseMapping {
  standard: 'IEC_62443_4_2' | 'IEC_62443_4_1' | 'ETSI_EN_303_645' | 'ISO_IEC_27001';
  clauseId: string;
  clauseTitle: string;
  craAnnexIRef: string;
  craStatutoryText: string;
  presumptionLevel: 'FULL_PRESUMPTION' | 'PARTIAL_PRESUMPTION' | 'SUPPORTING_EVIDENCE';
  securityLevelTarget?: 'SL1' | 'SL2' | 'SL3' | 'SL4';
}

/**
 * Whether Art. 27 grants a presumption is decided by the server against the
 * OJEU citation register. The client renders that verdict; it never derives one
 * from clause coverage.
 */
interface PresumptionStatus {
  available: boolean;
  basis: string;
  citation: string;
  coversAnnexI: string[];
  message: string;
  evidenceOnly: { key: string; reason: string }[];
}

export default function StandardsMatrixPage() {
  const [selectedStandard, setSelectedStandard] = useState<string>('ALL');
  const [verifiedClauses, setVerifiedClauses] = useState<string[]>([
    'CR 1.1',
    'CR 1.2',
    'CR 1.5',
    'CR 2.1',
    'CR 4.1',
    'SD-1 / SM-8',
    'DM-1 / DM-4',
  ]);

  const { data, isLoading } = useQuery<{
    totalMappings: number;
    mappings: StandardClauseMapping[];
    presumption?: PresumptionStatus;
  }>({
    queryKey: ['/api/standards/matrix'],
    queryFn: async () => {
      const res = await fetch('/api/standards/matrix');
      if (!res.ok) throw new Error('Failed to fetch standards matrix');
      return res.json();
    },
  });

  const evaluateMutation = useMutation({
    mutationFn: async (clauses: string[]) => {
      const res = await fetch('/api/standards/evaluate-presumption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verifiedClauses: clauses }),
      });
      if (!res.ok) throw new Error('Failed to evaluate presumption');
      return res.json();
    },
  });

  const toggleClause = (clauseId: string) => {
    const next = verifiedClauses.includes(clauseId)
      ? verifiedClauses.filter((c) => c !== clauseId)
      : [...verifiedClauses, clauseId];
    setVerifiedClauses(next);
    evaluateMutation.mutate(next);
  };

  const filteredMappings = (data?.mappings || []).filter((m) =>
    selectedStandard === 'ALL' ? true : m.standard === selectedStandard
  );

  const presumption = data?.presumption;

  const presumptionScore = Math.round(
    ((data?.mappings || []).filter((m) => verifiedClauses.includes(m.clauseId)).length /
      Math.max(data?.mappings?.length || 1, 1)) *
      100
  );

  return (
    <div className="space-y-6 font-sans text-foreground">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card/80 border border-border/80 p-5 rounded-xl shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shadow-sm">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-medium text-xl tracking-tight text-foreground">
                Harmonised Standards Presumption of Conformity Workbench
              </h1>
              <span className="font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 font-semibold">
                Article 34 Statutory Engine
              </span>
            </div>
            <p className="text-xs font-mono text-muted-foreground mt-0.5">
              IEC 62443-4-1/4-2 • ETSI EN 303 645 • CEN/CENELEC Statutory Equivalence Mapping
            </p>
          </div>
        </div>

        <Link
          href="/wiki"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted border border-border/80 font-mono text-xs text-foreground hover:border-primary transition-all"
        >
          <Gavel className="w-3.5 h-3.5 text-primary" />
          Statutory Ref: Article 27
        </Link>
      </div>

      {/* Score Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-card/80 border border-border/80 p-5 rounded-xl shadow-xs space-y-1">
          <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            Clause Coverage
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display font-medium text-3xl text-primary">{presumptionScore}%</span>
            <span className="text-xs font-mono text-muted-foreground">
              ({verifiedClauses.length} of {data?.mappings?.length || 12} Clauses Verified)
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-primary h-full rounded-full transition-all duration-300"
              style={{ width: `${presumptionScore}%` }}
            />
          </div>
        </div>

        <div className="bg-card/80 border border-border/80 p-5 rounded-xl shadow-xs space-y-1">
          <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            Legal Presumption Status
          </div>
          {/*
            Art. 27(1) grants a presumption only where the reference to a
            harmonised standard has been published in the Official Journal. None
            has been for the CRA, so no score on this page can produce one. The
            server is the authority on this; the client never infers it from a
            percentage.
          */}
          <div className="font-display font-medium text-lg text-foreground mt-1">
            {presumption?.available ? 'Presumption applies' : 'No presumption available'}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {presumption?.message ??
              'Conformity with a standard confers a presumption only once its reference is published in the Official Journal (Art. 27(1)), a common specification is adopted (Art. 27(5)), or a European cybersecurity certificate is issued (Art. 27(8)).'}
          </p>
        </div>

        <div className="bg-card/80 border border-border/80 p-5 rounded-xl shadow-xs space-y-2">
          <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            Auditor Cross-Reference Matrix
          </div>
          <p className="text-xs text-muted-foreground">
            Export verified mapping table for inclusion in Annex VII Technical Documentation.
          </p>
          <Button variant="outline" size="sm" className="font-mono text-xs gap-1.5 w-full">
            <Download className="w-3.5 h-3.5 text-primary" />
            Export Standards Matrix (PDF/JSON)
          </Button>
        </div>
      </div>

      {/* Standards Filter & Clause Table */}
      <div className="bg-card/80 border border-border/80 rounded-xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
          <div>
            <h2 className="font-display font-medium text-lg text-foreground">
              Harmonised Standard Clauses & CRA Annex I Equivalents
            </h2>
            <p className="text-xs text-muted-foreground">
              Toggle clauses verified during development to auto-credit CRA Annex I essential requirements.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-muted-foreground" />
            <select
              value={selectedStandard}
              onChange={(e) => setSelectedStandard(e.target.value)}
              className="p-1.5 rounded-lg bg-muted/40 border border-border text-xs font-mono"
            >
              <option value="ALL">All Standards</option>
              <option value="IEC_62443_4_2">IEC 62443-4-2 (Technical Requirements)</option>
              <option value="IEC_62443_4_1">IEC 62443-4-1 (Secure Lifecycle)</option>
              <option value="ETSI_EN_303_645">ETSI EN 303 645 (Consumer IoT)</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-border/60 text-muted-foreground font-mono uppercase text-[11px]">
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3">Standard / Clause</th>
                <th className="py-2 px-3">Clause Title</th>
                <th className="py-2 px-3">CRA Annex I Reference</th>
                <th className="py-2 px-3">Statutory Equivalence</th>
                <th className="py-2 px-3">Presumption Level</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filteredMappings.map((m) => {
                const isVerified = verifiedClauses.includes(m.clauseId);
                return (
                  <tr
                    key={m.clauseId}
                    onClick={() => toggleClause(m.clauseId)}
                    className="hover:bg-muted/20 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-3">
                      <input
                        type="checkbox"
                        checked={isVerified}
                        onChange={() => {}}
                        className="rounded text-primary focus:ring-primary"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono font-bold text-foreground">{m.clauseId}</span>
                      <div className="font-mono text-[10px] text-muted-foreground">{m.standard.replace(/_/g, ' ')}</div>
                    </td>
                    <td className="py-3 px-3 font-medium text-foreground">{m.clauseTitle}</td>
                    <td className="py-3 px-3 font-mono font-semibold text-primary">{m.craAnnexIRef}</td>
                    <td className="py-3 px-3 text-muted-foreground text-[11px] max-w-xs">{m.craStatutoryText}</td>
                    <td className="py-3 px-3">
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 border border-green-500/20 font-semibold">
                        {m.presumptionLevel.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
