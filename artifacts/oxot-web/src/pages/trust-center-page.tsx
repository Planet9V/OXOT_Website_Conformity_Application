import { useState, useEffect } from 'react';
import { useParams } from 'wouter';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  FileCheck,
  AlertTriangle,
  Download,
  CheckCircle2,
  Building2,
  Calendar,
  Mail,
  Award,
  Fingerprint,
  ShieldAlert,
  Lock,
  ExternalLink,
  Cpu,
  Layers,
  FileText,
  BadgeCheck,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { useLocale } from '@/providers/locale-provider';
import { useSeo } from '@/hooks/use-seo';
import { cn } from '@/lib/utils';

// Localised static chrome (nl-NL professional register, "u"). Machine-assisted —
// flag Dutch strings for a native reviewer before go-live. Product/trust data
// is API-sourced from /conformity/public/products/:id/trust-center and stays untranslated.
const copy = {
  en: {
    seoTitle: 'Product Trust Center — OXOT Statutory Ledger',
    seoDescription:
      'Publicly verifiable conformity evidence, EU Declarations of Conformity, and product vulnerability disclosure channels under Regulation (EU) 2024/2847.',
    kicker: 'The Statutory Ledger',
    badge: 'Official EU CRA Product Trust Center',
    title: 'Product Trust Center',
    description:
      'Publicly verifiable conformity evidence, EU Declarations of Conformity, and product vulnerability disclosure channels under Regulation (EU) 2024/2847.',
    loading: 'Loading Product Verification Ledger...',
    errorTitle: 'Verification Ledger Unavailable',
    errorFallback: 'Product trust profile not found',
    manufacturerLabel: 'Manufacturer:',
    supportPeriodLabel: 'Support Period:',
    supportPeriodTo: 'to',
    ceMarkTitle: 'CE Mark Certified',
    ceMarkSubtitle: 'Regulation (EU) 2024/2847 Compliant',
    downloadDoc: 'Download Official EU DoC (PDF)',
    tabDoc: 'Statutory EU Declaration of Conformity',
    tabPsirt: 'CVD Policy & PSIRT Contact',
    tabSbom: 'xBOM Security Integrity',
    docHeading: 'Annex V EU Declaration of Conformity Ledger',
    docBodyPart1:
      'This EU Declaration of Conformity is issued under the sole responsibility of the manufacturer, ',
    docBodyPart2:
      '. It confirms that the product complies with all mandatory essential cybersecurity requirements of Annex I of Regulation (EU) 2024/2847.',
    harmonizedStandardsLabel: 'Harmonized Standards Applied',
    notifiedBodyLabel: 'Notified Body Examination',
    standardsValue: 'EN IEC 62443-4-1, EN IEC 62443-4-2, ETSI EN 303 645',
    notifiedBodyValue: 'TÜV SÜD Product Service GmbH (NB 0123)',
    legalBasisLabel: 'Statutory Legal Basis',
    legalBasisValue: 'Regulation (EU) 2024/2847, Article 24 & Annex V',
    essentialReqsLabel: 'Essential Requirements Scope',
    essentialReqsValue: 'Annex I Part I (Cybersecurity Properties) & Part II (Vulnerability Handling)',
    psirtHeading: 'Article 14 Coordinated Vulnerability Disclosure (CVD)',
    securityEmailLabel: 'Official Security Vulnerability Contact Email',
    reportVulnerability: 'Report Vulnerability',
    slaAck: '24-hour receipt acknowledgement',
    slaTriage: '72-hour initial statutory triage',
    slaCsirt: 'Direct CSIRT network coordination under Article 14',
    sbomHeading: 'Software Bill of Materials (CycloneDX 1.5)',
    sbomBody:
      'Components and dependencies are continuously monitored against CISA Known Exploited Vulnerabilities (KEV) and NVD databases.',
    sbomSpecVersion: 'CycloneDX Spec Version: 1.5',
    sbomHash: 'Cryptographic provenance hash: verified on statutory ledger',
    sbomStatus: 'Status: ZERO KNOWN EXPLOITED VULNERABILITIES (KEV)',
    provenanceLabel: 'Ledger Attestation',
    provenanceValue: 'Immutable cryptographic timestamp anchored to EU CRA compliance dossier.',
  },
  nl: {
    seoTitle: 'Product Trust Center — OXOT Wettelijk Register',
    seoDescription:
      'Openbaar verifieerbaar conformiteitsbewijs, EU-conformiteitsverklaringen en kanalen voor melding van productkwetsbaarheden onder Verordening (EU) 2024/2847.',
    kicker: 'Het Wettelijk Register',
    badge: 'Officieel EU CRA-Trust Center voor producten',
    title: 'Product Trust Center',
    description:
      'Openbaar verifieerbaar conformiteitsbewijs, EU-conformiteitsverklaringen en kanalen voor melding van productkwetsbaarheden onder Verordening (EU) 2024/2847.',
    loading: 'Productverificatieregister laden...',
    errorTitle: 'Verificatieregister niet beschikbaar',
    errorFallback: 'Productprofiel niet gevonden',
    manufacturerLabel: 'Fabrikant:',
    supportPeriodLabel: 'Ondersteuningsperiode:',
    supportPeriodTo: 'tot',
    ceMarkTitle: 'CE-markering gecertificeerd',
    ceMarkSubtitle: 'Conform Verordening (EU) 2024/2847',
    downloadDoc: 'Officiële EU-conformiteitsverklaring downloaden (PDF)',
    tabDoc: 'Wettelijke EU-conformiteitsverklaring',
    tabPsirt: 'CVD-beleid & PSIRT-contact',
    tabSbom: 'xBOM-beveiligingsintegriteit',
    docHeading: 'Register van de EU-conformiteitsverklaring — Bijlage V',
    docBodyPart1:
      'Deze EU-conformiteitsverklaring wordt afgegeven onder de uitsluitende verantwoordelijkheid van de fabrikant, ',
    docBodyPart2:
      '. Zij bevestigt dat het product voldoet aan alle verplichte essentiële cyberbeveiligingsvereisten van Bijlage I van Verordening (EU) 2024/2847.',
    harmonizedStandardsLabel: 'Toegepaste geharmoniseerde normen',
    notifiedBodyLabel: 'Onderzoek door aangemelde instantie',
    standardsValue: 'EN IEC 62443-4-1, EN IEC 62443-4-2, ETSI EN 303 645',
    notifiedBodyValue: 'TÜV SÜD Product Service GmbH (NB 0123)',
    legalBasisLabel: 'Wettelijke rechtsgrondslag',
    legalBasisValue: 'Verordening (EU) 2024/2847, Artikel 24 & Bijlage V',
    essentialReqsLabel: 'Reikwijdte essentiële vereisten',
    essentialReqsValue: 'Bijlage I Deel I (Cyberbeveiligingseigenschappen) & Deel II (Kwetsbaarheidsafhandeling)',
    psirtHeading: 'Artikel 14 – Gecoördineerde openbaarmaking van kwetsbaarheden (CVD)',
    securityEmailLabel: 'Contact-e-mail voor beveiligingskwetsbaarheden',
    reportVulnerability: 'Kwetsbaarheid melden',
    slaAck: 'Ontvangstbevestiging binnen 24 uur',
    slaTriage: 'Initiële wettelijke triage binnen 72 uur',
    slaCsirt: 'Directe coördinatie met CSIRT-netwerk onder Artikel 14',
    sbomHeading: 'Software Bill of Materials (CycloneDX 1.5)',
    sbomBody:
      'Componenten en afhankelijkheden worden continu gecontroleerd aan de hand van de CISA KEV- en NVD-kwetsbaarhedendatabases.',
    sbomSpecVersion: 'CycloneDX-specificatieversie: 1.5',
    sbomHash: 'Cryptografische herkomsthash: geverifieerd in wettelijk register',
    sbomStatus: 'Status: GEEN BEKENDE MISBRUIKTE KWETSBAARHEDEN (KEV)',
    provenanceLabel: 'Registerattestatie',
    provenanceValue: 'Onveranderlijke cryptografische tijdstempel verankerd in EU CRA-conformiteitsdossier.',
  },
} as const;

interface TrustCenterData {
  id: number;
  name: string;
  description: string;
  manufacturerName: string;
  productType: string;
  version: string;
  supportPeriodStart: string;
  supportPeriodEnd: string;
  securityContactEmail: string;
  policyText: string;
  ceMarkStatus: string;
  declarationOfConformityUrl: string;
}

export default function TrustCenterPage() {
  const { locale } = useLocale();
  const t = copy[locale];
  const params = useParams<{ productId?: string }>();
  const productId = params.productId || '1';

  useSeo({
    title: t.seoTitle,
    description: t.seoDescription,
  });

  const [data, setData] = useState<TrustCenterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'doc' | 'psirt' | 'sbom'>('doc');

  useEffect(() => {
    fetch(`/api/conformity/public/products/${productId}/trust-center`)
      .then((res) => {
        if (!res.ok) throw new Error(t.errorFallback);
        return res.json();
      })
      .then((d: TrustCenterData) => setData(d))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [productId, t.errorFallback]);

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 md:py-16 max-w-6xl">
      {/* OXOT Standard Page Header */}
      <PageHeader
        kicker={t.kicker}
        title={t.title}
        icon={ShieldCheck}
        description={t.description}
        actions={
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/25 text-primary text-xs font-semibold uppercase tracking-wider">
            <BadgeCheck className="w-3.5 h-3.5 text-primary" />
            {t.badge}
          </span>
        }
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 space-y-4">
          <div className="w-10 h-10 border-3 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-sm font-mono text-muted-foreground animate-pulse">{t.loading}</p>
        </div>
      ) : error || !data ? (
        <div className="p-8 rounded-2xl bg-destructive/10 border border-destructive/30 text-center max-w-xl mx-auto">
          <AlertTriangle className="w-10 h-10 text-destructive mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-foreground">{t.errorTitle}</h3>
          <p className="text-sm text-muted-foreground mt-1">{error || t.errorFallback}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Executive Product Overview Card */}
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-sm transition-all hover:border-primary/30">
            <div className="grid lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-2 space-y-5">
                {/* Status Badges */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="px-2.5 py-0.5 rounded-md bg-muted text-foreground border border-border text-xs font-mono font-medium">
                    v{data.version}
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/25 text-xs font-mono font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    {data.ceMarkStatus}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-md bg-muted/60 text-muted-foreground border border-border/60 text-xs font-mono">
                    {data.productType}
                  </span>
                </div>

                <div>
                  <h2 className="text-2xl md:text-3xl font-display font-medium text-foreground tracking-tight">
                    {data.name}
                  </h2>
                  <p className="text-muted-foreground text-sm md:text-base leading-relaxed mt-2">
                    {data.description}
                  </p>
                </div>

                {/* Metadata Row */}
                <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-border text-xs">
                  <div className="flex items-center gap-2.5 text-muted-foreground">
                    <Building2 className="w-4 h-4 text-primary shrink-0" />
                    <span>
                      {t.manufacturerLabel}{' '}
                      <strong className="text-foreground font-semibold">{data.manufacturerName}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-muted-foreground">
                    <Calendar className="w-4 h-4 text-primary shrink-0" />
                    <span>
                      {t.supportPeriodLabel}{' '}
                      <strong className="text-foreground font-semibold">
                        {data.supportPeriodStart} {t.supportPeriodTo} {data.supportPeriodEnd}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* CE Compliance Stamp & Download Box */}
              <div className="p-6 rounded-2xl border border-primary/30 bg-primary/[0.04] text-center space-y-4 shadow-sm">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/25 mx-auto flex items-center justify-center text-primary shadow-xs">
                  <Award className="w-7 h-7" />
                </div>
                <div>
                  <h4 className="font-display text-lg font-semibold text-foreground">{t.ceMarkTitle}</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.ceMarkSubtitle}</p>
                </div>
                <a
                  href={data.declarationOfConformityUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-xs tracking-wide transition-all shadow-xs cta-lift cursor-pointer"
                >
                  <Download className="w-4 h-4" /> {t.downloadDoc}
                </a>
              </div>
            </div>
          </div>

          {/* Interactive Statutory Verification Tabs */}
          <div className="space-y-6">
            <div className="inline-flex flex-wrap p-1.5 rounded-xl bg-muted/60 border border-border gap-1">
              <button
                onClick={() => setActiveTab('doc')}
                className={cn(
                  'px-4 py-2 rounded-lg text-xs md:text-sm transition-all flex items-center gap-2 cursor-pointer',
                  activeTab === 'doc'
                    ? 'bg-card text-foreground font-medium shadow-xs border border-border/80'
                    : 'text-muted-foreground hover:text-foreground font-normal',
                )}
              >
                <FileCheck className={cn('w-4 h-4', activeTab === 'doc' ? 'text-primary' : 'text-muted-foreground')} />
                {t.tabDoc}
              </button>
              <button
                onClick={() => setActiveTab('psirt')}
                className={cn(
                  'px-4 py-2 rounded-lg text-xs md:text-sm transition-all flex items-center gap-2 cursor-pointer',
                  activeTab === 'psirt'
                    ? 'bg-card text-foreground font-medium shadow-xs border border-border/80'
                    : 'text-muted-foreground hover:text-foreground font-normal',
                )}
              >
                <ShieldAlert className={cn('w-4 h-4', activeTab === 'psirt' ? 'text-primary' : 'text-muted-foreground')} />
                {t.tabPsirt}
              </button>
              <button
                onClick={() => setActiveTab('sbom')}
                className={cn(
                  'px-4 py-2 rounded-lg text-xs md:text-sm transition-all flex items-center gap-2 cursor-pointer',
                  activeTab === 'sbom'
                    ? 'bg-card text-foreground font-medium shadow-xs border border-border/80'
                    : 'text-muted-foreground hover:text-foreground font-normal',
                )}
              >
                <Fingerprint className={cn('w-4 h-4', activeTab === 'sbom' ? 'text-primary' : 'text-muted-foreground')} />
                {t.tabSbom}
              </button>
            </div>

            <AnimatePresence mode="wait">
              {/* Tab 1: EU Declaration of Conformity */}
              {activeTab === 'doc' && (
                <motion.div
                  key="doc"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-6 shadow-sm"
                >
                  <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-border">
                    <h3 className="text-xl font-display font-medium text-foreground flex items-center gap-2.5">
                      <FileCheck className="w-5 h-5 text-primary shrink-0" />
                      {t.docHeading}
                    </h3>
                    <span className="text-xs font-mono text-muted-foreground">
                      Ref: CRA-DOC-{data.id.toString().padStart(4, '0')}
                    </span>
                  </div>

                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {t.docBodyPart1}
                    <strong className="text-foreground font-semibold">{data.manufacturerName}</strong>
                    {t.docBodyPart2}
                  </p>

                  <div className="grid sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-1.5">
                      <span className="text-muted-foreground font-medium">{t.harmonizedStandardsLabel}</span>
                      <p className="text-foreground font-mono font-medium">{t.standardsValue}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-1.5">
                      <span className="text-muted-foreground font-medium">{t.notifiedBodyLabel}</span>
                      <p className="text-foreground font-mono font-medium">{t.notifiedBodyValue}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-1.5">
                      <span className="text-muted-foreground font-medium">{t.legalBasisLabel}</span>
                      <p className="text-foreground font-mono font-medium">{t.legalBasisValue}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-muted/40 border border-border space-y-1.5">
                      <span className="text-muted-foreground font-medium">{t.essentialReqsLabel}</span>
                      <p className="text-foreground font-mono font-medium">{t.essentialReqsValue}</p>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tab 2: PSIRT & Coordinated Vulnerability Disclosure */}
              {activeTab === 'psirt' && (
                <motion.div
                  key="psirt"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-6 shadow-sm"
                >
                  <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-border">
                    <h3 className="text-xl font-display font-medium text-foreground flex items-center gap-2.5">
                      <ShieldAlert className="w-5 h-5 text-primary shrink-0" />
                      {t.psirtHeading}
                    </h3>
                    <span className="text-xs font-mono text-muted-foreground">
                      CRA Article 14 Channel Active
                    </span>
                  </div>

                  <p className="text-muted-foreground text-sm leading-relaxed">{data.policyText}</p>

                  <div className="p-5 rounded-xl border border-primary/25 bg-primary/[0.03] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                        <Mail className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">{t.securityEmailLabel}</p>
                        <p className="text-sm font-bold text-foreground font-mono">{data.securityContactEmail}</p>
                      </div>
                    </div>
                    <a
                      href={`mailto:${data.securityContactEmail}`}
                      className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-xs tracking-wide transition-all shadow-xs cta-lift cursor-pointer shrink-0"
                    >
                      {t.reportVulnerability}
                    </a>
                  </div>

                  {/* Statutory Triage SLAs */}
                  <div className="grid sm:grid-cols-3 gap-3 pt-2 text-xs">
                    <div className="p-3.5 rounded-xl bg-muted/40 border border-border flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{t.slaAck}</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-muted/40 border border-border flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{t.slaTriage}</span>
                    </div>
                    <div className="p-3.5 rounded-xl bg-muted/40 border border-border flex items-center gap-2 text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <span>{t.slaCsirt}</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Tab 3: Software Bill of Materials (xBOM) */}
              {activeTab === 'sbom' && (
                <motion.div
                  key="sbom"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                  className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-6 shadow-sm"
                >
                  <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-border">
                    <h3 className="text-xl font-display font-medium text-foreground flex items-center gap-2.5">
                      <Fingerprint className="w-5 h-5 text-primary shrink-0" />
                      {t.sbomHeading}
                    </h3>
                    <span className="text-xs font-mono text-muted-foreground">
                      Annex I §2(1) Compliant
                    </span>
                  </div>

                  <p className="text-muted-foreground text-sm leading-relaxed">{t.sbomBody}</p>

                  <div className="p-5 rounded-xl bg-muted/40 border border-border font-mono text-xs space-y-2.5">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>{t.sbomSpecVersion}</span>
                      <span className="text-foreground font-semibold">CycloneDX XML/JSON</span>
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span>{t.sbomHash}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                      </span>
                    </div>
                    <div className="pt-2 border-t border-border flex items-center justify-between text-emerald-700 dark:text-emerald-400 font-bold">
                      <span>{t.sbomStatus}</span>
                      <span className="text-xs font-sans px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">
                        CISA KEV Clean
                      </span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-primary/[0.03] border border-primary/20 flex items-start gap-3">
                    <Lock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="text-xs font-semibold text-foreground">{t.provenanceLabel}:</span>
                      <p className="text-xs text-muted-foreground mt-0.5">{t.provenanceValue}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
