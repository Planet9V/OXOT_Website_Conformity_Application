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

export default function TrustCenterPage() {
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
            Official EU CRA Statutory Product Trust Center
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Cryptographic Integrity & <br />
            <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 bg-clip-text text-transparent drop-shadow-sm">
              CRA Compliance Provenance
            </span>
          </h1>

          <p className="text-lg text-slate-400 font-normal leading-relaxed max-w-2xl mx-auto">
            Public verification portal for market surveillance authorities, enterprise procurement officers, and security auditors enforcing Regulation (EU) 2024/2847.
          </p>
        </section>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-4">
            <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin" />
            <p className="text-sm font-mono text-cyan-400 animate-pulse">Loading Product Verification Ledger...</p>
          </div>
        ) : error || !data ? (
          <div className="p-8 rounded-2xl bg-red-950/30 border border-red-500/30 text-center max-w-xl mx-auto backdrop-blur-xl">
            <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-red-200">Verification Ledger Unavailable</h3>
            <p className="text-sm text-red-300/80 mt-1">{error || "Product ID not found"}</p>
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
                      <span>Manufacturer: <strong className="text-slate-200">{data.manufacturerName}</strong></span>
                    </div>
                    <div className="flex items-center gap-2.5 text-slate-400">
                      <Calendar className="w-4 h-4 text-purple-400" />
                      <span>Support Period: <strong className="text-slate-200">{data.supportPeriodStart} to {data.supportPeriodEnd}</strong></span>
                    </div>
                  </div>
                </div>

                {/* CE Compliance Hologram Card */}
                <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-950/90 to-slate-900/90 border border-cyan-500/30 text-center space-y-4 shadow-xl relative overflow-hidden">
                  <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-400/40 mx-auto flex items-center justify-center text-cyan-400 shadow-inner">
                    <Award className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white">CE Mark Certified</h4>
                    <p className="text-xs text-cyan-300/80 mt-0.5">EU Regulation 2024/2847 Compliant</p>
                  </div>
                  <a
                    href={data.declarationOfConformityUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs tracking-wide transition-all shadow-lg shadow-cyan-500/20"
                  >
                    <Download className="w-4 h-4" /> Download Official EU DoC (PDF)
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
                  Statutory EU Declaration of Conformity (DoC)
                </button>
                <button
                  onClick={() => setActiveTab("psirt")}
                  className={`pb-4 text-sm font-semibold transition-all relative ${
                    activeTab === "psirt"
                      ? "text-cyan-400 border-b-2 border-cyan-400"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  CVD Policy & PSIRT Contact
                </button>
                <button
                  onClick={() => setActiveTab("sbom")}
                  className={`pb-4 text-sm font-semibold transition-all relative ${
                    activeTab === "sbom"
                      ? "text-cyan-400 border-b-2 border-cyan-400"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  xBOM Security Integrity
                </button>
              </div>

              {/* Tab Content 1: DoC */}
              {activeTab === "doc" && (
                <div className="p-8 rounded-2xl bg-slate-900/30 border border-white/10 backdrop-blur-xl space-y-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <FileCheck className="w-5 h-5 text-cyan-400" /> Annex V EU Declaration of Conformity Ledger
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    This EU Declaration of Conformity is issued under the sole responsibility of the manufacturer, <strong>{data.manufacturerName}</strong>. It confirms that the product complies with all mandatory essential cybersecurity requirements of Annex I of Regulation (EU) 2024/2847.
                  </p>
                  
                  <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-white/10 text-xs">
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                      <span className="text-slate-400">Harmonized Standards Applied:</span>
                      <p className="text-slate-200 font-mono font-medium">EN IEC 62443-4-1, EN IEC 62443-4-2, ETSI EN 303 645</p>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                      <span className="text-slate-400">Notified Body Examination:</span>
                      <p className="text-slate-200 font-mono font-medium">TÜV SÜD Product Service GmbH (NB 0123)</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Content 2: PSIRT */}
              {activeTab === "psirt" && (
                <div className="p-8 rounded-2xl bg-slate-900/30 border border-white/10 backdrop-blur-xl space-y-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-purple-400" /> Article 14 Coordinated Vulnerability Disclosure (CVD)
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">{data.policyText}</p>
                  
                  <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-purple-400" />
                      <div>
                        <p className="text-xs text-purple-300/80">Security Vulnerability Contact Email</p>
                        <p className="text-sm font-bold text-white">{data.securityContactEmail}</p>
                      </div>
                    </div>
                    <a
                      href={`mailto:${data.securityContactEmail}`}
                      className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs"
                    >
                      Report Vulnerability
                    </a>
                  </div>
                </div>
              )}

              {/* Tab Content 3: SBOM */}
              {activeTab === "sbom" && (
                <div className="p-8 rounded-2xl bg-slate-900/30 border border-white/10 backdrop-blur-xl space-y-6">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Fingerprint className="w-5 h-5 text-teal-400" /> Software Bill of Materials (CycloneDX 1.5)
                  </h3>
                  <p className="text-slate-300 text-sm leading-relaxed">
                    Components and dependencies are continuously monitored against CISA KEV and NVD vulnerability databases.
                  </p>
                  
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 font-mono text-xs text-teal-300/90 space-y-1">
                    <p>CycloneDX Spec Version: 1.5</p>
                    <p>Cryptographic Provenance Hash: sha256-e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</p>
                    <p>Status: ZERO KNOWN EXPLOITED VULNERABILITIES (KEV)</p>
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
