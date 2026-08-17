import React, { useState } from 'react';
import { useListRegulations } from '@workspace/api-client-react';
import { ConformityShell } from '@/components/layout/conformity-shell';
import { PageHeader } from '@/components/page-header';
import { 
  Scale, 
  ExternalLink, 
  ArrowRight, 
  Calendar, 
  ShieldAlert, 
  ShieldCheck, 
  Layers, 
  AlertTriangle, 
  BookOpen, 
  FileText, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  Sparkles,
  Zap,
  Info
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { regBgStyle, regTextStyle } from '@/lib/reg-colors';

interface FrameworkHighlight {
  key: string;
  officialRef: string;
  statutoryScope: string;
  penaltyClause: string;
  keyArticles: string[];
  enforcementMilestones: { date: string; description: string; status: 'imminent' | 'active' | 'future' }[];
}

/**
 * Where each act's own wiki/reader lives. The CRA wiki is in THIS app; the
 * other acts' readers are the conformity app's Library (same wiki pattern),
 * so those cross the SPA boundary via a plain href. Acts without a loaded
 * corpus (IEC 62443, DORA, CER) get no button — there is no text to read.
 */
const WIKI_VIEWS: Record<string, { href: string; external: boolean }> = {
  cra: { href: '/wiki/cra', external: false },
  nis2: { href: '/conformity/library/nis2', external: true },
  ai_act: { href: '/conformity/library/ai-act', external: true },
  machinery: { href: '/conformity/library/machinery', external: true },
  red: { href: '/conformity/library/red', external: true },
  gdpr: { href: '/conformity/library/gdpr', external: true },
  data_act: { href: '/conformity/library/data-act', external: true },
};

const FRAMEWORK_METADATA: Record<string, FrameworkHighlight> = {
  cra: {
    key: 'cra',
    officialRef: 'Regulation (EU) 2024/2847',
    statutoryScope: 'All products with digital elements placed on the EU market (hardware, software, embedded OT controllers, IIoT gateways).',
    penaltyClause: 'Up to €15,000,000 or 2.5% of total worldwide annual turnover (Article 64).',
    keyArticles: [
      'Article 14: 24h Incident & Actively Exploited Vulnerability Notification',
      'Article 21: Substantial Modification & Importer Obligations',
      'Article 13: 10-Year Technical Documentation & SBOM Retention',
      'Annex I: Essential Cybersecurity Properties & Vulnerability Handling',
      'Annex III: Critical Products Class I and Class II Categorization'
    ],
    enforcementMilestones: [
      { date: 'Dec 10, 2024', description: 'Entry into force of Regulation (EU) 2024/2847', status: 'active' },
      { date: 'Jun 11, 2026', description: 'Chapter III Notified Bodies designation & accreditation', status: 'imminent' },
      { date: 'Sep 11, 2026', description: 'Article 14 mandatory 24h ENISA incident reporting takes effect', status: 'imminent' },
      { date: 'Dec 11, 2027', description: 'Full mandatory enforcement & CE marking requirement', status: 'future' }
    ],
  },
  nis2: {
    key: 'nis2',
    officialRef: 'Directive (EU) 2022/2555',
    statutoryScope: 'Essential and Important entities operating critical infrastructure (energy, transport, water, manufacturing supply chains).',
    penaltyClause: 'Up to €10,000,000 or 2% of total worldwide annual turnover (Article 34).',
    keyArticles: [
      'Article 21: Cybersecurity Risk-Management Measures',
      'Article 23: 24h Early Warning & 72h Full Incident Notification',
      'Article 20: Governance & C-Suite Personal Accountability'
    ],
    enforcementMilestones: [
      { date: 'Jan 16, 2023', description: 'Entry into force', status: 'active' },
      { date: 'Oct 17, 2024', description: 'Transposition deadline into Member State national law', status: 'active' },
      { date: 'Apr 17, 2025', description: 'National competent authorities register Essential Entities', status: 'active' }
    ],
  },
  iec_62443: {
    key: 'iec_62443',
    officialRef: 'IEC 62443 Industrial Cybersecurity Series',
    statutoryScope: 'International standard for Industrial Automation and Control Systems (IACS). Mandated under CEN/CENELEC M/606 for CRA Presumption of Conformity.',
    penaltyClause: 'Commercial disqualification in EU tenders and loss of CRA Presumption of Conformity under Article 27.',
    keyArticles: [
      'IEC 62443-4-1: Secure Product Development Lifecycle (CRA Annex I Part II)',
      'IEC 62443-4-2: Technical Security Requirements for IACS Components (Annex I Part I)',
      'IEC 62443-3-3: System Security Requirements and Security Levels (SL-1 to SL-4)',
      'IEC 62443-2-4: Security Program Requirements for IACS Service Providers'
    ],
    enforcementMilestones: [
      { date: 'Current', description: 'Global benchmark for industrial automation security', status: 'active' },
      { date: '2026-2027', description: 'CEN/CENELEC Harmonised Standard EN 40000 series release (M/606)', status: 'imminent' }
    ],
  },
  ai_act: {
    key: 'ai_act',
    officialRef: 'Regulation (EU) 2024/1689',
    statutoryScope: 'High-risk AI systems in industrial machinery, autonomous OT robotics, and critical infrastructure control loops.',
    penaltyClause: 'Up to €35,000,000 or 7% of total worldwide annual turnover for prohibited AI practices.',
    keyArticles: [
      'Article 9: Risk Management System for High-Risk AI',
      'Article 14: Human Oversight & Cyber-Physical Safety Interlocks',
      'Article 15: Accuracy, Robustness, and Cybersecurity Resilience'
    ],
    enforcementMilestones: [
      { date: 'Aug 1, 2024', description: 'Entry into force of EU AI Act', status: 'active' },
      { date: 'Feb 2, 2025', description: 'Prohibitions on unacceptable risk AI systems take effect', status: 'active' },
      { date: 'Aug 2, 2026', description: 'General Purpose AI & High-Risk obligations apply', status: 'imminent' }
    ],
  },
  machinery: {
    key: 'machinery',
    officialRef: 'Regulation (EU) 2023/1230',
    statutoryScope: 'Industrial machinery, robotics, safety components, and software performing safety functions.',
    penaltyClause: 'Withdrawal of products from the EU market and national market surveillance penalties.',
    keyArticles: [
      'Annex III Section 1.1.9: Protection against Corruption & Malicious Cyber Modification',
      'Annex III Section 1.2.1: Safety and Reliability of Control Systems'
    ],
    enforcementMilestones: [
      { date: 'Jul 19, 2023', description: 'Entry into force', status: 'active' },
      { date: 'Jan 20, 2027', description: 'Mandatory application across all EU Member States', status: 'future' }
    ],
  }
};

export default function ConformityRegulations() {
  const { data: regulations, isLoading, isError } = useListRegulations();
  const [activeTab, setActiveTab] = useState<'cards' | 'timeline' | 'purdue' | 'wiki'>('cards');

  if (isLoading) {
    return (
      <ConformityShell>
        <div className="space-y-6">
          <Skeleton className="h-12 w-96 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-72 w-full rounded-2xl" />)}
          </div>
        </div>
      </ConformityShell>
    );
  }

  if (isError || !regulations) {
    return (
      <ConformityShell>
        <div className="p-6 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          Failed to load statutory regulatory register. Please verify the API connection.
        </div>
      </ConformityShell>
    );
  }

  return (
    <ConformityShell>
      <div className="max-w-7xl mx-auto space-y-8 pb-12 font-sans">
        {/* Page Header */}
        <PageHeader
          kicker="STATUTORY LEGAL REGISTER & CONFORMITY SCOPE"
          title="Regulations & Harmonized Frameworks"
          icon={Scale}
          description="Decomposed statutory legal register linking Regulation (EU) 2024/2847 (Cyber Resilience Act), NIS2, EU AI Act, Machinery Regulation, and IEC 62443 into an executable cross-compliance engine. Explore mandatory application dates, fine structures, and direct legal text references in the CRA Wiki."
        />

        {/* View Switcher Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('cards')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'cards'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              Statutory Register ({regulations.length} Frameworks)
            </button>
            <button
              onClick={() => setActiveTab('timeline')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'timeline'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Statutory Enforcement Timelines
            </button>
            <button
              onClick={() => setActiveTab('purdue')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'purdue'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Purdue Model OT Scope
            </button>
          </div>

          <Link
            href="/wiki/cra"
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            Open Interactive CRA Wiki (71 Articles) →
          </Link>
        </div>

        {/* TAB 1: Main Framework Cards with Full Legal Details */}
        {activeTab === 'cards' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {regulations.map((reg) => {
                const meta = FRAMEWORK_METADATA[reg.key] || {
                  officialRef: reg.fullTitle,
                  statutoryScope: reg.summary,
                  penaltyClause: 'Subject to national market surveillance enforcement.',
                  keyArticles: [],
                  enforcementMilestones: []
                };

                return (
                  <div
                    key={reg.key}
                    className="rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                    style={{ borderTop: `4px solid hsl(${regBgStyle(reg.key).background?.toString().match(/hsl\((.+)\)/)?.[1] ?? '220 14% 50%'})` }}
                  >
                    <div className="p-6 flex-1 flex flex-col space-y-4">
                      {/* Header row */}
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span
                              className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-mono font-bold text-white shadow-sm"
                              style={regBgStyle(reg.key)}
                            >
                              {reg.shortName}
                            </span>
                            <span className="text-[11px] font-mono font-semibold text-muted-foreground">
                              {meta.officialRef}
                            </span>
                          </div>
                          <h3 className="text-lg font-display font-bold text-foreground leading-snug">
                            {reg.fullTitle}
                          </h3>
                        </div>
                        <Badge variant="outline" className="font-mono text-xs text-muted-foreground flex-shrink-0">
                          {reg.jurisdiction}
                        </Badge>
                      </div>

                      {/* Scope & Penalty Box */}
                      <div className="p-3.5 rounded-xl bg-muted/40 border border-border/60 text-xs space-y-2">
                        <div>
                          <span className="font-semibold text-foreground">Target Scope: </span>
                          <span className="text-muted-foreground">{meta.statutoryScope}</span>
                        </div>
                        <div>
                          <span className="font-semibold text-amber-500">Statutory Penalties: </span>
                          <span className="text-muted-foreground">{meta.penaltyClause}</span>
                        </div>
                      </div>

                      {/* Key Articles Checklist */}
                      {meta.keyArticles.length > 0 && (
                        <div className="space-y-1.5">
                          <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                            Key Statutory Articles & Directives:
                          </div>
                          <div className="space-y-1">
                            {meta.keyArticles.map((art, idx) => (
                              <div key={idx} className="flex items-start gap-2 text-xs text-muted-foreground">
                                <CheckCircle2 className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                                <span className="text-[11px]">{art}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Metrics strip */}
                      <div className="grid grid-cols-2 gap-3 text-xs bg-muted/20 p-3 rounded-xl border border-border/40">
                        <div>
                          <div className="text-muted-foreground text-[11px] mb-0.5">Statutory Status</div>
                          <div className="font-mono font-semibold text-foreground">
                            {reg.inForceDate ? `In Force (${new Date(reg.inForceDate).getFullYear()})` : 'Binding'}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground text-[11px] mb-0.5">Mapped Controls</div>
                          <div className="font-mono font-bold text-primary" style={regTextStyle(reg.key)}>
                            {reg.requirementCount} Requirements
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="p-4 bg-muted/30 border-t border-border flex flex-wrap items-center justify-between gap-3">
                      <a
                        href={reg.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs inline-flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        EUR-Lex Text <ExternalLink className="w-3 h-3" />
                      </a>

                      <div className="flex items-center gap-2">
                        {WIKI_VIEWS[reg.key] && (WIKI_VIEWS[reg.key].external ? (
                          <a
                            href={WIKI_VIEWS[reg.key].href}
                            className="px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold flex items-center gap-1 transition-colors"
                          >
                            <BookOpen className="w-3 h-3" />
                            {reg.shortName} Wiki View
                          </a>
                        ) : (
                          <Link
                            href={WIKI_VIEWS[reg.key].href}
                            className="px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary text-xs font-semibold flex items-center gap-1 transition-colors"
                          >
                            <BookOpen className="w-3 h-3" />
                            {reg.shortName} Wiki View
                          </Link>
                        ))}
                        <Link
                          href={`/conformity-platform/regulations/${reg.key}`}
                          className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold flex items-center gap-1 shadow-sm transition-colors"
                        >
                          Requirements ({reg.requirementCount}) <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: Statutory Enforcement Timeline Radar */}
        {activeTab === 'timeline' && (
          <div className="p-6 md:p-8 bg-card border border-border rounded-3xl space-y-6 shadow-sm">
            <div>
              <h3 className="text-xl font-display font-bold text-foreground mb-1">
                Statutory Enforcement Milestones & Critical Deadlines
              </h3>
              <p className="text-xs text-muted-foreground">
                Official statutory transition windows and mandatory enforcement clocks under Regulation (EU) 2024/2847 and adjacent directives.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="text-xs space-y-1">
                  <strong className="text-amber-500 font-bold">Critical 2026 Milestone (Article 14 Activation):</strong>
                  <p className="text-muted-foreground">
                    Starting <strong>September 11, 2026</strong>, any actively exploited vulnerability or severe security incident must be reported to the CSIRT and ENISA within <strong>24 hours</strong>. This precedes the 2027 CE marking deadline by 15 months.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
                <div className="p-4 rounded-2xl bg-muted/40 border border-border flex flex-col justify-between space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-muted-foreground">PAST / ENACTED</span>
                    <Badge variant="outline" className="text-[10px] text-emerald-500 border-emerald-500/30">Active</Badge>
                  </div>
                  <div className="text-base font-bold text-foreground">Dec 10, 2024</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Cyber Resilience Act (EU 2024/2847) officially enters into force.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-primary/10 border border-primary/30 flex flex-col justify-between space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-primary font-bold">18 MONTHS</span>
                    <Badge variant="outline" className="text-[10px] text-primary border-primary/30">Upcoming</Badge>
                  </div>
                  <div className="text-base font-bold text-foreground">Jun 11, 2026</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Chapter III Notified Bodies designation and accreditation rules take effect.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col justify-between space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-amber-500 font-bold">21 MONTHS</span>
                    <Badge variant="outline" className="text-[10px] text-amber-500 border-amber-500/30">Mandatory</Badge>
                  </div>
                  <div className="text-base font-bold text-foreground">Sep 11, 2026</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Article 14 24-hour mandatory ENISA vulnerability and incident reporting clock activates.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex flex-col justify-between space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-red-500 font-bold">36 MONTHS</span>
                    <Badge variant="outline" className="text-[10px] text-red-500 border-red-500/30">Strict CE Mark</Badge>
                  </div>
                  <div className="text-base font-bold text-foreground">Dec 11, 2027</div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Full CRA application. Products without Annex I & VII conformity barred from EU customs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Purdue Model OT Scope Breakdown */}
        {activeTab === 'purdue' && (
          <div className="p-6 md:p-8 bg-card border border-border rounded-3xl space-y-6 shadow-sm">
            <div>
              <h3 className="text-xl font-display font-bold text-foreground mb-1">
                Purdue Model OT Cyber Hierarchy & Regulatory Scope
              </h3>
              <p className="text-xs text-muted-foreground">
                How Regulation (EU) 2024/2847 (CRA), NIS2 Directive, and IEC 62443 partition responsibilities across industrial levels.
              </p>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-purple-400">Level 4 & 5: Enterprise IT & Cloud Analytics</div>
                  <div className="text-muted-foreground font-sans text-xs mt-0.5">ERP, Manufacturing Execution, Cloud Predictive Maintenance, Edge Gateways.</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant="outline" className="text-purple-400 border-purple-400/30">NIS2 Essential Entities</Badge>
                  <Badge variant="outline" className="text-blue-400 border-blue-400/30">CRA Gateway Assets</Badge>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-blue-400">Level 3: Site Operations & SCADA Supervisions</div>
                  <div className="text-muted-foreground font-sans text-xs mt-0.5">HMI, Historian, Engineering Workstations, Industrial Firewalls.</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant="outline" className="text-blue-400 border-blue-400/30">CRA Class I / Class II</Badge>
                  <Badge variant="outline" className="text-emerald-400 border-emerald-400/30">IEC 62443-3-3</Badge>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-amber-400">Level 1 & 2: Direct Control (PLCs, DCS, RTUs)</div>
                  <div className="text-muted-foreground font-sans text-xs mt-0.5">Programmable Controllers, Safety Instrumented Systems (SIS), Drive Regulators.</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant="outline" className="text-amber-400 border-amber-400/30">CRA Annex III Class II</Badge>
                  <Badge variant="outline" className="text-emerald-400 border-emerald-400/30">IEC 62443-4-2 SL-3</Badge>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-red-400">Level 0: Physical Process (Sensors, Actuators, Valves)</div>
                  <div className="text-muted-foreground font-sans text-xs mt-0.5">Fieldbus Transducers, Smart Relays, Servo Motors.</div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Badge variant="outline" className="text-red-400 border-red-400/30">CRA Default (Module A)</Badge>
                  <Badge variant="outline" className="text-emerald-400 border-emerald-400/30">IEC 62443-4-1</Badge>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Global Wiki Conversion Banner */}
        <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-primary/20 via-primary/10 to-card border border-primary/30 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-lg">
          <div className="space-y-1 max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-primary">
              <Sparkles className="w-4 h-4" />
              <span>THE DEFINITIVE CRA STATUTORY KNOWLEDGE BASE</span>
            </div>
            <h3 className="text-xl font-display font-bold text-foreground">
              Explore the Full 71 Articles & 7 Annexes in the Interactive CRA Wiki
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Read exact legal recitals, Article 14 24h CSIRT procedures, Article 21 substantial modification tests, and download machine-readable technical audit templates.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              href="/wiki/cra"
              className="px-5 py-3 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
              Open CRA Wiki Portal <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </ConformityShell>
  );
}
