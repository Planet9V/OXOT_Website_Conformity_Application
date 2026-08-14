import { useState } from 'react';
import { Link } from 'wouter';
import {
  Shield,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Clock,
  ExternalLink,
  Lock,
  Boxes,
  Tag,
  Code2,
  Archive,
  ClipboardCheck,
  Building2,
  Gavel,
  ChevronRight,
  Compass,
  Flame,
  Download,
  Check,
  FileCheck2,
  QrCode,
  Radio,
  FileText,
} from 'lucide-react';
import { Button } from './ui/button';

export type PersonaId = 'INTEGRATOR' | 'MANUFACTURER' | 'STEWARD' | 'IMPORTER' | 'PLANT_CISO' | 'AUDITOR';

export interface PersonaConfig {
  id: PersonaId;
  title: string;
  badge: string;
  badgeColor: string;
  tagline: string;
  statutoryBasis: string;
  statutoryRefCode: string;
  liabilityShieldStatus: string;
  kpis: Array<{
    label: string;
    value: string | number;
    subtext: string;
    tone: string;
  }>;
  interactiveWorkstation: {
    headline: string;
    subheadline: string;
    primaryCtaLabel: string;
    primaryCtaHref: string;
    secondaryCtaLabel: string;
    secondaryCtaHref: string;
    highlights: Array<{ label: string; value: string; status: 'good' | 'warning' | 'info' }>;
  };
  steps: Array<{
    stepNumber: number;
    title: string;
    description: string;
    ctaLabel: string;
    ctaHref: string;
    isCompleted?: boolean;
  }>;
}

export const PERSONA_CONFIGS: Record<PersonaId, PersonaConfig> = {
  INTEGRATOR: {
    id: 'INTEGRATOR',
    title: 'Industrial System Integrator & MSP',
    badge: 'Axians & VINCI Energies Mode',
    badgeColor: 'bg-amber-500/15 text-amber-500 border-amber-500/30',
    tagline: 'Track when maintenance and retrofit work crosses into substantial modification and makes you the manufacturer.',
    statutoryBasis: 'Article 22 (substantial modification) & Article 2(6) (identical spare parts)',
    statutoryRefCode: 'Art. 22 & Art. 2(6)',
    liabilityShieldStatus: 'Substantial-modification review — assessed per intervention',
    kpis: [
      { label: 'Customer OT Plants', value: '3 Active Facilities', subtext: 'Rotterdam, Antwerp, Sochaux', tone: 'text-foreground font-bold' },
      { label: 'Art. 2(6) spare-parts reviews', value: 'Sample data', subtext: 'Not yet wired to real assessments', tone: 'text-muted-foreground font-bold' },
      { label: 'Duty to Refrain Blocks', value: '2 OEM Equipment Lines', subtext: 'Held under Article 18(2)', tone: 'text-amber-500 font-bold' },
      { label: 'Client turnover in scope', value: 'Sample data', subtext: 'Liability is not assessed by this app', tone: 'text-muted-foreground font-bold' },
    ],
    interactiveWorkstation: {
      headline: 'Axians 5-Stage Operational Pipeline & Multi-Plant Safe Harbor',
      subheadline: 'Automated statutory gatekeeper protecting integrators during brownfield retrofits and customer OT maintenance.',
      primaryCtaLabel: 'Open 5-Stage Plant Pipeline',
      primaryCtaHref: '/partner-hub',
      secondaryCtaLabel: 'View Safe Harbor Certs',
      secondaryCtaHref: '/partner-hub',
      highlights: [
        { label: 'Rotterdam Terminal (Vopak)', value: 'Recital 34 Shielded', status: 'good' },
        { label: 'Antwerp Chemical Facility (BASF)', value: 'Annex III Class I Resolved', status: 'good' },
        { label: 'Sochaux Paint Shop (Stellantis)', value: 'Vendor Radar Screening', status: 'warning' },
      ],
    },
    steps: [
      {
        stepNumber: 1,
        title: 'Classify Customer Plant Inventory',
        description: 'Ingest client OT assets and resolve Annex III Class I/II regulatory categories.',
        ctaLabel: 'Open Plant Portfolio',
        ctaHref: '/partner-hub',
        isCompleted: true,
      },
      {
        stepNumber: 2,
        title: 'Execute Recital 34 Safe Harbor Clearance',
        description: 'Sign off 4-step wizard to issue SHA-256 cryptographically sealed liability certificates.',
        ctaLabel: 'Issue Safe Harbor Cert',
        ctaHref: '/partner-hub',
        isCompleted: true,
      },
      {
        stepNumber: 3,
        title: 'Screen Upstream OEM Vendor Hardware',
        description: 'Enforce Article 18(2) Duty to Refrain gate on unpatched or uncertified equipment.',
        ctaLabel: 'Check Vendor Radar',
        ctaHref: '/partner-hub',
        isCompleted: false,
      },
    ],
  },
  MANUFACTURER: {
    id: 'MANUFACTURER',
    title: 'OEM Hardware & Software Manufacturer',
    badge: 'Siemens, Cisco & OEM Mode',
    badgeColor: 'bg-emerald-500/15 text-emerald-500 border-emerald-500/30',
    tagline: 'Fast-track Annex I essential security compliance, standards presumption, and CE nameplate affixation.',
    statutoryBasis: 'Article 13, Article 28, Articles 29–30 & Annex I (essential cybersecurity requirements)',
    statutoryRefCode: 'Art. 13 & Annex I',
    liabilityShieldStatus: 'Article 13 obligations — tracked per product',
    kpis: [
      { label: 'Products in Scope', value: '4 Active Product Lines', subtext: 'Class I, Class II & Default', tone: 'text-foreground font-bold' },
      { label: 'Standards Presumption', value: '92% Presumed (Art. 34)', subtext: 'IEC 62443-4-2 & ETSI EN 303 645', tone: 'text-emerald-500 font-bold' },
      { label: 'CycloneDX 1.6 SBOMs', value: '100% Machine-Readable', subtext: '0 Known Exploitable KEVs', tone: 'text-emerald-500 font-bold' },
      { label: 'CE Nameplates Ready', value: 'Ready for Affixation', subtext: 'Vector SVG + QR Code to DoC', tone: 'text-primary font-bold' },
    ],
    interactiveWorkstation: {
      headline: 'Annex I Essential Security & Digital Product Passport Studio',
      subheadline: 'Complete technical verification workbench for commercial manufacturers placing products with digital elements on the EU market.',
      primaryCtaLabel: 'Open Standards Presumption Matrix',
      primaryCtaHref: '/standards',
      secondaryCtaLabel: 'Open CE Nameplate Studio',
      secondaryCtaHref: '/ce-studio',
      highlights: [
        { label: 'Annex I Part I Secure Properties', value: '13/13 Properties Satisfied', status: 'good' },
        { label: 'Annex I Part II Vulnerability Handling', value: 'PSIRT & CVD Active', status: 'good' },
        { label: 'Harmonised Standards Alignment', value: 'Full Presumption Achieved', status: 'good' },
      ],
    },
    steps: [
      {
        stepNumber: 1,
        title: 'Annex I Secure-by-Design Assessment',
        description: 'Complete the 24 statutory essential property questionnaires for your product line.',
        ctaLabel: 'Start Assessment',
        ctaHref: '/products',
        isCompleted: true,
      },
      {
        stepNumber: 2,
        title: 'Harmonised Standards Presumption (Art. 34)',
        description: 'Map IEC 62443-4-1/4-2 & ETSI EN 303 645 clauses to auto-credit CRA Annex I requirements.',
        ctaLabel: 'Open Standards Matrix',
        ctaHref: '/standards',
        isCompleted: true,
      },
      {
        stepNumber: 3,
        title: 'Generate Vector CE Nameplate & DoC',
        description: 'Produce DIN/ISO 7000 compliant CE rating plates with QR codes linking to Annex V DoC.',
        ctaLabel: 'Open CE Studio',
        ctaHref: '/ce-studio',
        isCompleted: false,
      },
    ],
  },
  STEWARD: {
    id: 'STEWARD',
    title: 'Open-Source Software Steward & Maintainer',
    badge: 'FOSS Foundation & Collective Mode',
    badgeColor: 'bg-purple-500/15 text-purple-500 border-purple-500/30',
    tagline: 'Document the cybersecurity policy and CVD process Article 24 requires of you, and publish OpenVEX.',
    statutoryBasis: 'Article 24 (obligations of open-source software stewards)',
    statutoryRefCode: 'Art. 24',
    liabilityShieldStatus: 'Steward regime — lighter than manufacturer, not exempt from Art. 24',
    kpis: [
      { label: 'FOSS Repositories', value: '6 Open Repositories', subtext: 'Industrial OT Protocols & Stacks', tone: 'text-foreground font-bold' },
      { label: 'Art. 24 self-declaration', value: 'Sample data', subtext: 'Self-declared; confers no exemption', tone: 'text-muted-foreground font-bold' },
      { label: 'OpenVEX Statements', value: '14 CVEs Documented', subtext: 'Non-Exploitable Upstream Flags', tone: 'text-emerald-500 font-bold' },
      { label: 'CVD / Security Policy', value: 'RFC 9116 security.txt', subtext: 'Published on Root Domain', tone: 'text-primary font-bold' },
    ],
    interactiveWorkstation: {
      headline: 'Open-Source Steward Security & OpenVEX Clearance Hub',
      subheadline: 'Protect independent maintainers and open-source foundations from commercial product liability while providing enterprise supply chain transparency.',
      primaryCtaLabel: 'Issue Article 33 Attestation',
      primaryCtaHref: '/steward',
      secondaryCtaLabel: 'Generate OASIS OpenVEX',
      secondaryCtaHref: '/steward',
      highlights: [
        { label: 'Non-commercial standing', value: 'Self-declared', status: 'info' },
        { label: 'Coordinated Vulnerability Disclosure', value: 'PSIRT Channel Verified', status: 'good' },
        { label: 'Cryptographic Release Signing', value: 'Sigstore / GPG Active', status: 'good' },
      ],
    },
    steps: [
      {
        stepNumber: 1,
        title: 'Verify CVD Policy & Security Contact',
        description: 'Publish RFC 9116 security.txt and documented Coordinated Vulnerability Disclosure policy.',
        ctaLabel: 'Configure PSIRT / CVD',
        ctaHref: '/psirt',
        isCompleted: true,
      },
      {
        stepNumber: 2,
        title: 'Issue Article 33 Voluntary Attestation',
        description: 'Generate legally recognized FOSS security attestation certificate with SHA-256 digest.',
        ctaLabel: 'Issue Art. 33 Attestation',
        ctaHref: '/steward',
        isCompleted: false,
      },
      {
        stepNumber: 3,
        title: 'Publish OASIS OpenVEX Statements',
        description: 'Document non-exploitable upstream CVEs to eliminate downstream supply chain panic.',
        ctaLabel: 'Generate OpenVEX',
        ctaHref: '/steward',
        isCompleted: false,
      },
    ],
  },
  IMPORTER: {
    id: 'IMPORTER',
    title: 'EU Importer & Industrial Distributor',
    badge: 'Arrow, Avnet & Logistics Mode',
    badgeColor: 'bg-blue-500/15 text-blue-500 border-blue-500/30',
    tagline: 'Maintain 10-year statutory technical documentation vaults and customs verification gates.',
    statutoryBasis: 'Article 19 (importers) & Article 20 (distributors)',
    statutoryRefCode: 'Arts. 19 & 20',
    liabilityShieldStatus: 'Retention of DoC and technical documentation — not yet wired',
    kpis: [
      { label: 'Deposited Dossiers', value: '3 Sealed Technical Files', subtext: 'Siemens, Fortinet, Belden', tone: 'text-foreground font-bold' },
      { label: 'Retention Horizon', value: 'Valid Through 2036+', subtext: '10-Year Article 17 Guarantee', tone: 'text-blue-400 font-bold' },
      { label: 'Customs Verification', value: '100% Cleared', subtext: 'Valid CE Mark & Annex V DoC', tone: 'text-emerald-500 font-bold' },
      { label: 'MSA Access Tokens', value: '3 Tokens Issued', subtext: 'National Authority Ready', tone: 'text-primary font-bold' },
    ],
    interactiveWorkstation: {
      headline: '10-Year Statutory Compliance Archive & Customs Verification Vault',
      subheadline: 'Immutable, timestamped evidence vault for EU importers and distributors maintaining technical dossiers at the disposal of Market Surveillance Authorities.',
      primaryCtaLabel: 'Open 10-Year Archive Ledger',
      primaryCtaHref: '/archive',
      secondaryCtaLabel: 'Run Due Diligence Screener',
      secondaryCtaHref: '/partner-hub',
      highlights: [
        { label: 'Siemens Scalance XC-208', value: 'Retention Horizon 2036', status: 'good' },
        { label: 'Fortinet FortiGate 60F', value: 'Retention Horizon 2036', status: 'good' },
        { label: 'Belden Hirschmann RS20', value: 'Retention Horizon 2036', status: 'good' },
      ],
    },
    steps: [
      {
        stepNumber: 1,
        title: 'Pre-Importation Due Diligence Gate',
        description: 'Verify OEM CE markings, EU Declarations of Conformity, and technical file accessibility.',
        ctaLabel: 'Run Vendor Radar',
        ctaHref: '/partner-hub',
        isCompleted: true,
      },
      {
        stepNumber: 2,
        title: 'Deposit Dossier into 10-Year Archive',
        description: 'Store tamper-evident cryptographic ZIP dossiers compliant with retention through 2037+.',
        ctaLabel: 'Open 10Y Archive Ledger',
        ctaHref: '/archive',
        isCompleted: true,
      },
      {
        stepNumber: 3,
        title: 'Enable Market Surveillance Access',
        description: 'Generate cryptographic audit tokens for EU RAPEX and National Market Surveillance sweeps.',
        ctaLabel: 'Manage Access Tokens',
        ctaHref: '/archive',
        isCompleted: false,
      },
    ],
  },
  PLANT_CISO: {
    id: 'PLANT_CISO',
    title: 'Downstream Plant Owner & Industrial CISO',
    badge: 'BASF, Total & Plant Owner Mode',
    badgeColor: 'bg-rose-500/15 text-rose-500 border-rose-500/30',
    tagline: 'Assess supplier and installed-base risk. Your direct duties here are NIS2; the CRA binds your vendors.',
    statutoryBasis: 'NIS2 Article 21 (supply chain). CRA Article 64 penalties fall on economic operators, not users.',
    statutoryRefCode: 'NIS2 Art. 21',
    liabilityShieldStatus: 'Supplier posture — evidence gathered, not certified',
    kpis: [
      { label: 'Fine Exposure Shielded', value: '€15,000,000 Max', subtext: 'Article 61 Liability Avoidance', tone: 'text-emerald-500 font-bold' },
      { label: '24h Threat Countdown', value: 'Sept 11, 2026 Mandate', subtext: 'Mandatory CSIRT Reporting', tone: 'text-amber-500 font-bold' },
      { label: 'Plant Digital Twins', value: '3 Plants Monitored', subtext: '1,420 OT Network Nodes', tone: 'text-foreground font-bold' },
      { label: 'Executive Briefings', value: 'Board Ready', subtext: 'One-Click PDF/CRA Readout', tone: 'text-primary font-bold' },
    ],
    interactiveWorkstation: {
      headline: 'NIS2 & CRA Executive Risk Radar & Fine Exposure Suite',
      subheadline: 'Continuous compliance posture monitoring and fine liability mitigation for industrial plant owners and corporate CISOs.',
      primaryCtaLabel: 'View Article 61 Calculator',
      primaryCtaHref: '/partner-hub',
      secondaryCtaLabel: 'Download Executive Report',
      secondaryCtaHref: '/reports',
      highlights: [
        { label: 'Corporate Turnover Liability Cap', value: '2.5% Turnover Protected', status: 'good' },
        { label: 'Active Zero-Day CSIRT Dispatcher', value: 'ANSSI / BSI Connected', status: 'good' },
        { label: 'Supply Chain SBOM Provenance', value: 'CycloneDX Verified', status: 'good' },
      ],
    },
    steps: [
      {
        stepNumber: 1,
        title: 'Calculate Article 61 Fine Exposure',
        description: 'Model potential regulatory liability based on corporate turnover and plant critical assets.',
        ctaLabel: 'View Exposure Calculator',
        ctaHref: '/partner-hub',
        isCompleted: true,
      },
      {
        stepNumber: 2,
        title: 'Monitor 24h CSIRT Early Warning Hub',
        description: 'Track active zero-day exploitation alerts ahead of the mandatory September 2026 deadline.',
        ctaLabel: 'Open 24h CSIRT Hub',
        ctaHref: '/partner-hub',
        isCompleted: false,
      },
      {
        stepNumber: 3,
        title: 'Generate Auditor-Ready Compliance Briefing',
        description: 'Assemble executive PDF reports for executive board and regulatory authorities.',
        ctaLabel: 'Download Executive Report',
        ctaHref: '/reports',
        isCompleted: false,
      },
    ],
  },
  AUDITOR: {
    id: 'AUDITOR',
    title: 'European Notified Body & Regulatory Auditor',
    badge: 'TÜV, DEKRA & BSI Auditor Mode',
    badgeColor: 'bg-zinc-500/15 text-zinc-400 border-zinc-500/30',
    tagline: 'Review Annex VII technical documentation files and issue Module H / Module B+C examination certificates.',
    statutoryBasis: 'Articles 41–51 & Annex VIII (Conformity Assessment Procedures)',
    statutoryRefCode: 'Arts. 41–51 & Annex VIII',
    liabilityShieldStatus: 'Notified body review — access token required',
    kpis: [
      { label: 'Dossiers in Review', value: '2 Pending Audit', subtext: 'Module H Full Quality Assurance', tone: 'text-foreground font-bold' },
      { label: 'SHA-256 Hashes', value: '100% Cryptographically Sealed', subtext: 'Tamper-Evident Test Evidence', tone: 'text-emerald-500 font-bold' },
      { label: 'Open Auditor RFIs', value: '1 RFI Awaiting Response', subtext: 'Cryptographic Protocol Details', tone: 'text-amber-500 font-bold' },
      { label: 'Type-Exam Certs', value: 'Module B Approval Ready', subtext: 'Annex VIII Conformity Granted', tone: 'text-primary font-bold' },
    ],
    interactiveWorkstation: {
      headline: 'Module H / B+C Notified Body Examination Workbench',
      subheadline: 'Cryptographic evidence examination, penetration test log auditing, and formal conformity certificate issuance.',
      primaryCtaLabel: 'Open Auditor Portal',
      primaryCtaHref: '/auditor-portal',
      secondaryCtaLabel: 'Inspect Technical Dossiers',
      secondaryCtaHref: '/auditor-portal',
      highlights: [
        { label: 'Annex VII Technical File Completeness', value: '6/6 Sections Submitted', status: 'good' },
        { label: 'Independent Penetration Testing Evidence', value: 'Valid Pen Test Log Attached', status: 'good' },
        { label: 'Harmonised Standards Verification', value: 'IEC 62443 Audit Confirmed', status: 'good' },
      ],
    },
    steps: [
      {
        stepNumber: 1,
        title: 'Inspect Annex VII Technical Documentation',
        description: 'Review system architecture, IEC 62443 threat modeling, and CycloneDX 1.6 SBOMs.',
        ctaLabel: 'Open Auditor Portal',
        ctaHref: '/auditor-portal',
        isCompleted: true,
      },
      {
        stepNumber: 2,
        title: 'Verify Cryptographic Evidence Hashes',
        description: 'Validate SHA-256 digital seals on test evidence and penetration testing reports.',
        ctaLabel: 'Verify Hashes',
        ctaHref: '/auditor-portal',
        isCompleted: false,
      },
      {
        stepNumber: 3,
        title: 'Issue Formal RFI or Examination Decision',
        description: 'Transmit structured audit findings or grant EU-Type Examination approval.',
        ctaLabel: 'Issue Audit Finding',
        ctaHref: '/auditor-portal',
        isCompleted: false,
      },
    ],
  },
};

export function PersonaCockpit({
  initialPersona = 'INTEGRATOR',
  activePersona: controlledPersona,
  onPersonaChange,
  onOpenCopilot,
}: {
  initialPersona?: PersonaId;
  activePersona?: PersonaId;
  onPersonaChange?: (persona: PersonaId) => void;
  onOpenCopilot?: () => void;
}) {
  const [internalPersona, setInternalPersona] = useState<PersonaId>(initialPersona);
  const selectedPersona = controlledPersona ?? internalPersona;

  const handleSelect = (id: PersonaId) => {
    setInternalPersona(id);
    onPersonaChange?.(id);
  };

  const current = PERSONA_CONFIGS[selectedPersona];

  return (
    <div className="space-y-6 font-sans text-foreground">
      {/* 1. Persona Selection Ribbon */}
      <div className="bg-card/90 border border-border/80 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-primary" />
            <span className="font-mono text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Select Your Operational Persona Cockpit
            </span>
          </div>

          <div className="hidden sm:flex items-center gap-2 font-mono text-[11px] bg-muted/60 px-3 py-1 rounded-full border border-border">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            <span className="text-muted-foreground">Mandatory Art. 14 Early Warning:</span>
            <span className="text-amber-500 font-bold">11 Sept 2026</span>
          </div>
        </div>

        {/* Persona Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {(Object.keys(PERSONA_CONFIGS) as PersonaId[]).map((key) => {
            const cfg = PERSONA_CONFIGS[key];
            const isSelected = key === selectedPersona;
            return (
              <button
                key={key}
                data-persona={key}
                onClick={() => handleSelect(key)}
                className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-primary/10 border-primary text-foreground shadow-xs ring-1 ring-primary/40'
                    : 'bg-muted/30 border-border/60 text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-0 right-0 w-2.5 h-2.5 rounded-bl-md bg-primary" />
                )}
                <div className="font-sans font-bold text-xs leading-tight mb-1 truncate">{cfg.title}</div>
                <div className="font-mono text-[10px] opacity-75 truncate">{cfg.badge.split(' ')[0]}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Active Persona Role Banner & Statutory Identity */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-card to-muted/40 border border-border/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2 min-w-0">
          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="font-display font-medium text-2xl tracking-tight text-foreground">
              {current.title}
            </h2>
            <span className={`font-mono text-xs px-3 py-0.5 rounded-full border font-bold ${current.badgeColor}`}>
              {current.badge}
            </span>
          </div>
          <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">{current.tagline}</p>
          <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-mono">
            <span className="text-green-500 font-semibold flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              {current.liabilityShieldStatus}
            </span>
            <span className="text-muted-foreground">•</span>
            <span className="text-primary">{current.statutoryBasis}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {onOpenCopilot && (
            <Button
              size="sm"
              onClick={onOpenCopilot}
              data-tour="copilot-btn"
              className="gap-1.5 font-mono text-xs shadow-xs bg-primary/10 hover:bg-primary/20 text-primary border border-primary/30"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Ask Copilot
            </Button>
          )}
          <Link
            href="/wiki"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/80 border border-border hover:border-primary text-xs font-mono text-foreground shadow-xs transition-all"
          >
            <Gavel className="w-4 h-4 text-primary" />
            Statutory Ref: {current.statutoryRefCode}
          </Link>
        </div>
      </div>

      {/* 3. DYNAMICALLY MORPHED KPI METRICS (PERSONA-SPECIFIC) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {current.kpis.map((kpi, idx) => (
          <div key={idx} className="bg-card/90 border border-border/80 p-4 rounded-xl shadow-xs space-y-1">
            <div className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground truncate">
              {kpi.label}
            </div>
            <div className={`font-display text-xl ${kpi.tone}`}>{kpi.value}</div>
            <div className="text-[10px] font-mono text-muted-foreground truncate">{kpi.subtext}</div>
          </div>
        ))}
      </div>

      {/* 4. DYNAMIC INTERACTIVE WORKSTATION (PERSONA-SPECIFIC) */}
      <div className="bg-card/90 border border-border/80 rounded-2xl p-6 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="font-display font-medium text-lg text-foreground">
                {current.interactiveWorkstation.headline}
              </h3>
            </div>
            <p className="text-xs text-muted-foreground">{current.interactiveWorkstation.subheadline}</p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={current.interactiveWorkstation.primaryCtaHref}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary text-primary-foreground font-mono text-xs font-semibold shadow-xs hover:bg-primary/90 transition-all"
            >
              {current.interactiveWorkstation.primaryCtaLabel}
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href={current.interactiveWorkstation.secondaryCtaHref}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted border border-border text-foreground hover:bg-muted/80 font-mono text-xs font-medium transition-all"
            >
              {current.interactiveWorkstation.secondaryCtaLabel}
            </Link>
          </div>
        </div>

        {/* Workstation Live Highlights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {current.interactiveWorkstation.highlights.map((h, i) => (
            <div key={i} className="p-3 rounded-xl bg-muted/40 border border-border/60 flex items-center justify-between text-xs font-mono">
              <span className="text-foreground font-medium">{h.label}</span>
              <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                h.status === 'good'
                  ? 'bg-green-500/10 text-green-500 border border-green-500/20'
                  : h.status === 'warning'
                  ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                  : 'bg-primary/10 text-primary border border-primary/20'
              }`}>
                {h.value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. GUIDED 3-STEP ACTION FUNNEL */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground font-semibold">
            Guided Action Funnel ({current.title})
          </div>
          <span className="text-[11px] font-mono text-muted-foreground">
            {current.steps.filter((s) => s.isCompleted).length} of {current.steps.length} Completed
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {current.steps.map((step) => (
            <div
              key={step.stepNumber}
              className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 transition-all ${
                step.isCompleted
                  ? 'bg-card/70 border-border/70 shadow-xs'
                  : 'bg-card border-primary/40 shadow-sm'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-muted-foreground font-bold">
                    STEP {step.stepNumber}
                  </span>
                  {step.isCompleted ? (
                    <span className="font-mono text-[10px] text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> VERIFIED
                    </span>
                  ) : (
                    <span className="font-mono text-[10px] text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 font-bold">
                      ACTION REQUIRED
                    </span>
                  )}
                </div>

                <div className="font-sans font-bold text-sm text-foreground">{step.title}</div>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.description}</p>
              </div>

              <Link
                href={step.ctaHref}
                className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 hover:bg-primary text-primary hover:text-primary-foreground font-mono text-xs font-semibold border border-primary/30 transition-all"
              >
                {step.ctaLabel}
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
