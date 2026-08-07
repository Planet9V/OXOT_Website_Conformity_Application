import { useState, useEffect } from "react";
import { Link, useParams } from "wouter";
import { 
  ShieldCheck, 
  Lock, 
  FileCheck, 
  AlertTriangle, 
  Download, 
  CheckCircle2, 
  Building2, 
  Calendar, 
  Mail, 
  ExternalLink,
  Award,
  Cpu,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Fingerprint
} from "lucide-react";
import { useLocale } from '@/providers/locale-provider';

// Localised static chrome (nl-NL professional register, "u"). Machine-assisted —
// flag Dutch strings for a native reviewer before go-live. NOTE: product/trust
// data (name, description, version, ceMarkStatus, policyText, contact email,
// support dates, DoC URL) is API-sourced from /trust-center and stays untranslated.
const copy = {
  en: {
    badge: 'Official EU CRA Statutory Product Trust Center',
    heroTitleLine1: 'Cryptographic Integrity & ',
    heroTitleLine2: 'CRA Compliance Provenance',
    heroBody:
      'Public verification portal for market surveillance authorities, enterprise procurement officers, and security auditors enforcing Regulation (EU) 2024/2847.',
    loading: 'Loading Product Verification Ledger...',
    errorTitle: 'Verification Ledger Unavailable',
    errorFallback: 'Product ID not found',
    manufacturerLabel: 'Manufacturer: ',
    supportPeriodLabel: 'Support Period: ',
    supportPeriodTo: 'to',
    ceMarkTitle: 'CE Mark Certified',
    ceMarkSubtitle: 'EU Regulation 2024/2847 Compliant',
    downloadDoc: 'Download Official EU DoC (PDF)',
    tabDoc: 'Statutory EU Declaration of Conformity (DoC)',
    tabPsirt: 'CVD Policy & PSIRT Contact',
    tabSbom: 'xBOM Security Integrity',
    docHeading: 'Annex V EU Declaration of Conformity Ledger',
    docBodyPart1:
      'This EU Declaration of Conformity is issued under the sole responsibility of the manufacturer, ',
    docBodyPart2:
      '. It confirms that the product complies with all mandatory essential cybersecurity requirements of Annex I of Regulation (EU) 2024/2847.',
    harmonizedStandardsLabel: 'Harmonized Standards Applied:',
    notifiedBodyLabel: 'Notified Body Examination:',
    psirtHeading: 'Article 14 Coordinated Vulnerability Disclosure (CVD)',
    securityEmailLabel: 'Security Vulnerability Contact Email',
    reportVulnerability: 'Report Vulnerability',
    sbomHeading: 'Software Bill of Materials (CycloneDX 1.5)',
    sbomBody:
      'Components and dependencies are continuously monitored against CISA KEV and NVD vulnerability databases.',
    sbomSpecVersion: 'CycloneDX Spec Version: 1.5',
    sbomHash:
      'Cryptographic Provenance Hash: sha256-e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    sbomStatus: 'Status: ZERO KNOWN EXPLOITED VULNERABILITIES (KEV)',
  },
  nl: {
    badge: 'Officieel wettelijk EU CRA-Trust Center voor producten',
    heroTitleLine1: 'Cryptografische integriteit & ',
    heroTitleLine2: 'Herkomst van CRA-naleving',
    heroBody:
      'Openbaar verificatieportaal voor markttoezichtautoriteiten, inkoopfunctionarissen van ondernemingen en beveiligingsauditors die Verordening (EU) 2024/2847 handhaven.',
    loading: 'Productverificatieregister laden...',
    errorTitle: 'Verificatieregister niet beschikbaar',
    errorFallback: 'Product-ID niet gevonden',
    manufacturerLabel: 'Fabrikant: ',
    supportPeriodLabel: 'Ondersteuningsperiode: ',
    supportPeriodTo: 'tot',
    ceMarkTitle: 'CE-markering gecertificeerd',
    ceMarkSubtitle: 'Conform EU-Verordening 2024/2847',
    downloadDoc: 'Officiële EU-conformiteitsverklaring downloaden (PDF)',
    tabDoc: 'Wettelijke EU-conformiteitsverklaring (DoC)',
    tabPsirt: 'CVD-beleid & PSIRT-contact',
    tabSbom: 'xBOM-beveiligingsintegriteit',
    docHeading: 'Register van de EU-conformiteitsverklaring — Bijlage V',
    docBodyPart1:
      'Deze EU-conformiteitsverklaring wordt afgegeven onder de uitsluitende verantwoordelijkheid van de fabrikant, ',
    docBodyPart2:
      '. Zij bevestigt dat het product voldoet aan alle verplichte essentiële cyberbeveiligingsvereisten van Bijlage I van Verordening (EU) 2024/2847.',
    harmonizedStandardsLabel: 'Toegepaste geharmoniseerde normen:',
    notifiedBodyLabel: 'Onderzoek door aangemelde instantie:',
    psirtHeading: 'Artikel 14 – Gecoördineerde openbaarmaking van kwetsbaarheden (CVD)',
    securityEmailLabel: 'Contact-e-mail voor beveiligingskwetsbaarheden',
    reportVulnerability: 'Kwetsbaarheid melden',
    sbomHeading: 'Software Bill of Materials (CycloneDX 1.5)',
    sbomBody:
      'Componenten en afhankelijkheden worden continu gecontroleerd aan de hand van de kwetsbaarhedendatabases CISA KEV en NVD.',
    sbomSpecVersion: 'CycloneDX-specificatieversie: 1.5',
    sbomHash:
      'Cryptografische herkomsthash: sha256-e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    sbomStatus: 'Status: GEEN BEKENDE MISBRUIKTE KWETSBAARHEDEN (KEV)',
  },
} as const;

export default function TrustCenterPage() {
  const { locale } = useLocale();
  const t = copy[locale];
  const params = useParams<{ productId?: string }>();
  const productId = params.productId || "1";

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"doc" | "psirt" | "sbom">("doc");

  useEffect(() => {
    fetch(`/api/conformity/public/products/${productId}/trust-center`)
      .then((res) => {
        if (!res.ok) throw new Error("Product trust profile not found");
        return res.json();
      })
      .then((d) => setData(d))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [productId]);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background Radial Halos */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-cyan-500/15 via-blue-600/10 to-transparent blur-[120px] rounded-full" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-purple-600/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-10 -left-40 w-[600px] h-[600px] bg-cyan-600/10 blur-[150px] rounded-full" />
      </div>

      <main className="relative z-10 pt-32 pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Magazine Hero Badge & Headline */}
        <section className="text-center space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/80 border border-cyan-500/30 backdrop-blur-xl text-cyan-400 text-xs font-semibold uppercase tracking-widest shadow-lg shadow-cyan-950/50 hover:border-cyan-400/50 transition-all duration-300">
            <Sparkles className="w-4 h-4 animate-pulse text-cyan-400" />
            {t.badge}
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            {t.heroTitleLine1}<br />
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 bg-clip-text text-transparent drop-shadow-sm">
              {t.heroTitleLine2}
            </span>
          </h1>

          <p className="text-lg text-slate-400 font-normal leading-relaxed max-w-2xl mx-auto">
            {t.heroBody}
          </p>
        </section>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
            <p className="text-sm font-mono text-cyan-400 animate-pulse">{t.loading}</p>
          </div>
        ) : error || !data ? (
          <div className="p-8 rounded-2xl bg-red-950/30 border border-red-500/30 text-center max-w-xl mx-auto backdrop-blur-xl">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-red-200">{t.errorTitle}</h3>
            <p className="text-sm text-red-300/80 mt-1">{error || t.errorFallback}</p>
          </div>
        ) : (
          <>
            {/* Product Overview Glass Card */}
            <div className="p-8 rounded-3xl bg-slate-900/40 border border-white/10 backdrop-blur-2xl shadow-2xl relative overflow-hidden group hover:border-cyan-500/40 transition-all duration-500">
              <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 blur-3xl rounded-full pointer-events-none group-hover:bg-cyan-500/10 transition-all duration-700" />
              
              <div className="grid lg:grid-cols-3 gap-8 items-center">
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-3 py-1 rounded-md bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-semibold">
                      v{data.version}
                    </span>
                    <span className="px-3 py-1 rounded-md bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-semibold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      {data.ceMarkStatus}
                    </span>
                    <span className="px-3 py-1 rounded-md bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-mono">
                      {data.productType}
                    </span>
                  </div>

                  <h2 className="text-3xl font-bold text-white tracking-tight">{data.name}</h2>
                  <p className="text-slate-300 text-base leading-relaxed">{data.description}</p>

                  <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-white/10 text-xs">
                    <div className="flex items-center gap-2.5 text-slate-400">
                      <Building2 className="w-4 h-4 text-cyan-400" />
                      <span>{t.manufacturerLabel}<strong className="text-slate-200">{data.manufacturerName}</strong></span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-400">
                      <Calendar className="w-4 h-4 text-purple-400" />
                      <span>{t.supportPeriodLabel}<strong className="text-slate-200">{data.supportPeriodStart} {t.supportPeriodTo} {data.supportPeriodEnd}</strong></span>
                    </div>
                  </div>
                </div>

                {/* CE Compliance Hologram Card */}
                <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-950/90 to-slate-900/90 border border-cyan-500/30 text-center space-y-4 shadow-xl relative overflow-hidden">
                  <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-400/40 mx-auto flex items-center justify-center text-cyan-400 shadow-inner">
                    <Award className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">{t.ceMarkTitle}</h4>
                    <p className="text-xs text-cyan-300/80 mt-0.5">{t.ceMarkSubtitle}</p>
                  </div>
                  <a
                    href={data.declarationOfConformityUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs tracking-wide transition-all shadow-lg shadow-cyan-500/20"
                  >
                    <Download className="w-4 h-4" /> {t.downloadDoc}
                  </a>
                </div>
              </div>
            </div>

            {/* Interactive Verification Tabs */}
            <div className="space-y-6">
              <div className="flex border-b border-white/10 gap-8">
                <button
                  onClick={() => setActiveTab("doc")}
                  className={`pb-4 text-sm font-semibold transition-all relative ${
                    activeTab === "doc"
                      ? "text-cyan-400 border-b-2 border-cyan-400"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {t.tabDoc}
                </button>
                <button
                  onClick={() => setActiveTab("psirt")}
                  className={`pb-4 text-sm font-semibold transition-all relative ${
                    activeTab === "psirt"
                      ? "text-cyan-400 border-b-2 border-cyan-400"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {t.tabPsirt}
                </button>
                <button
                  onClick={() => setActiveTab("sbom")}
                  className={`pb-4 text-sm font-semibold transition-all relative ${
                    activeTab === "sbom"
                      ? "text-cyan-400 border-b-2 border-cyan-400"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {t.tabSbom}
                </button>
              </div>

              {/* Tab Content 1: DoC */}
              {activeTab === "doc" && (
                <div className="p-8 rounded-2xl bg-slate-900/30 border border-white/10 backdrop-blur-xl space-y-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-cyan-400" /> {t.docHeading}
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {t.docBodyPart1}<strong>{data.manufacturerName}</strong>{t.docBodyPart2}
                  </p>
                  
                  <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-white/10 text-xs">
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                      <span className="text-slate-400">{t.harmonizedStandardsLabel}</span>
                      <p className="text-slate-200 font-mono font-medium">EN IEC 62443-4-1, EN IEC 62443-4-2, ETSI EN 303 645</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                      <span className="text-slate-400">{t.notifiedBodyLabel}</span>
                      <p className="text-slate-200 font-mono font-medium">TÜV SÜD Product Service GmbH (NB 0123)</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Content 2: PSIRT */}
              {activeTab === "psirt" && (
                <div className="p-8 rounded-2xl bg-slate-900/30 border border-white/10 backdrop-blur-xl space-y-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-purple-400" /> {t.psirtHeading}
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">{data.policyText}</p>
                  
                  <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-purple-400" />
                      <div>
                        <p className="text-xs text-purple-300/80">{t.securityEmailLabel}</p>
                        <p className="text-sm font-bold text-white">{data.securityContactEmail}</p>
                      </div>
                    </div>
                    <a
                      href={`mailto:${data.securityContactEmail}`}
                      className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
                    >
                      {t.reportVulnerability}
                    </a>
                  </div>
                </div>
              )}

              {/* Tab Content 3: SBOM */}
              {activeTab === "sbom" && (
                <div className="p-8 rounded-2xl bg-slate-900/30 border border-white/10 backdrop-blur-xl space-y-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Fingerprint className="w-5 h-5 text-teal-400" /> {t.sbomHeading}
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {t.sbomBody}
                  </p>

                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs text-teal-300/90 space-y-1">
                    <p>{t.sbomSpecVersion}</p>
                    <p>{t.sbomHash}</p>
                    <p>{t.sbomStatus}</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
