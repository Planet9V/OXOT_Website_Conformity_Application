import { Shield, Check, X, ArrowRight, Server, Lock, FileText, Cpu, AlertTriangle, Scale, Zap, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';

export default function CompetitorsPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-cyan-500 selection:text-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24 border-b border-slate-800/80">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950 to-slate-950 pointer-events-none" />
        
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-6">
            <Scale className="w-3.5 h-3.5" /> Product Security & Compliance Positioning
          </div>
          
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent mb-6 max-w-4xl">
            Why Industrial OEMs & OT Leaders Choose OXOT Over Generic IT GRC or Binary Scanners
          </h1>
          
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl leading-relaxed mb-8">
            The EU Cyber Resilience Act (CRA) demands both deep embedded technical evidence <span className="text-cyan-400 font-semibold">(xBOMs, VEX, 24h/72h SLAs)</span> and statutory audit governance <span className="text-cyan-400 font-semibold">(Annex VII Technical Files & DoCs)</span>. OXOT is the only platform built specifically to bridge both worlds.
          </p>

          <div className="flex flex-wrap gap-4 items-center">
            <Link href="/conformity-platform">
              <Button size="lg" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-8 shadow-lg shadow-cyan-500/20">
                Explore CRA Workbench <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <a href="http://localhost:8088/conformity-briefing/" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="border-slate-700 text-slate-200 hover:bg-slate-900">
                View Executive Briefing Deck
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Strategic Positioning Split: IT GRC vs Binary Scanners vs OXOT */}
      <section className="py-20 bg-slate-900/40">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">Understanding the Product Compliance Gap</h2>
            <p className="text-slate-400">
              Most vendors sell solutions designed for IT cloud SaaS or basic firmware binary extraction. Neither provides a complete path to CRA CE Marking.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* IT GRC */}
            <Card className="bg-slate-900/60 border-slate-800 text-slate-200 hover:border-slate-700 transition">
              <CardHeader>
                <Badge variant="outline" className="w-fit border-amber-500/30 text-amber-400 bg-amber-950/20 mb-2">
                  IT Cloud GRC
                </Badge>
                <CardTitle className="text-xl">Vanta / Drata</CardTitle>
                <CardDescription className="text-slate-400">Built for SaaS SOC 2 & ISO 27001</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-300">
                <p className="text-slate-400 italic">"Great for IT policy checklists, but blind to embedded OT hardware & physical safety."</p>
                <ul className="space-y-2">
                  <li className="flex items-start text-red-400"><X className="w-4 h-4 mr-2 shrink-0 mt-0.5" /> No IEC 62443 / OT domain awareness</li>
                  <li className="flex items-start text-red-400"><X className="w-4 h-4 mr-2 shrink-0 mt-0.5" /> Cannot ingest hardware/software xBOMs</li>
                  <li className="flex items-start text-red-400"><X className="w-4 h-4 mr-2 shrink-0 mt-0.5" /> No CRA Art 14 24h/72h ENISA SLA watch</li>
                  <li className="flex items-start text-red-400"><X className="w-4 h-4 mr-2 shrink-0 mt-0.5" /> No Notified Body (Module B/H) portal</li>
                </ul>
              </CardContent>
            </Card>

            {/* Binary Scanners */}
            <Card className="bg-slate-900/60 border-slate-800 text-slate-200 hover:border-slate-700 transition">
              <CardHeader>
                <Badge variant="outline" className="w-fit border-purple-500/30 text-purple-400 bg-purple-950/20 mb-2">
                  Binary Scanners
                </Badge>
                <CardTitle className="text-xl">Cybellum / Finite State</CardTitle>
                <CardDescription className="text-slate-400">Built for firmware scanning</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-300">
                <p className="text-slate-400 italic">"Produces endless CVE counts without statutory technical files or CE marking workflows."</p>
                <ul className="space-y-2">
                  <li className="flex items-start text-emerald-400"><Check className="w-4 h-4 mr-2 shrink-0 mt-0.5 text-emerald-400" /> Deep binary firmware extraction</li>
                  <li className="flex items-start text-red-400"><X className="w-4 h-4 mr-2 shrink-0 mt-0.5" /> No EU Declarations of Conformity</li>
                  <li className="flex items-start text-red-400"><X className="w-4 h-4 mr-2 shrink-0 mt-0.5" /> No cross-regulation evidence reuse</li>
                  <li className="flex items-start text-red-400"><X className="w-4 h-4 mr-2 shrink-0 mt-0.5" /> No Notified Body engagement workspace</li>
                </ul>
              </CardContent>
            </Card>

            {/* OXOT Platform */}
            <Card className="bg-cyan-950/30 border-cyan-500/50 text-slate-100 relative overflow-hidden shadow-xl shadow-cyan-950/50">
              <div className="absolute top-0 right-0 bg-cyan-500 text-slate-950 text-[10px] font-black uppercase px-3 py-1 rounded-bl">
                Recommended
              </div>
              <CardHeader>
                <Badge className="w-fit bg-cyan-500 text-slate-950 font-bold mb-2">
                  All-in-One OT Platform
                </Badge>
                <CardTitle className="text-2xl text-cyan-300">OXOT Conformity</CardTitle>
                <CardDescription className="text-slate-300">Industrial AI & CRA Compliance Engine</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-200">
                <p className="text-cyan-200 font-medium">"Single system of record connecting xBOMs, Annex VII Technical Files, and Notified Bodies."</p>
                <ul className="space-y-2 font-medium">
                  <li className="flex items-start text-emerald-400"><Check className="w-4 h-4 mr-2 shrink-0 mt-0.5" /> Build once, comply across CRA + AI + 62443</li>
                  <li className="flex items-start text-emerald-400"><Check className="w-4 h-4 mr-2 shrink-0 mt-0.5" /> Cryptographic SHA-256 evidence proofs</li>
                  <li className="flex items-start text-emerald-400"><Check className="w-4 h-4 mr-2 shrink-0 mt-0.5" /> Live 24h/72h ENISA CSIRT SLA watch</li>
                  <li className="flex items-start text-emerald-400"><Check className="w-4 h-4 mr-2 shrink-0 mt-0.5" /> Public Trust Center & Notified Body Portal</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Comprehensive Functional Feature Matrix */}
      <section className="py-20 border-t border-slate-800/80">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">Detailed Feature Matrix</h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-300">
                  <th className="p-4 font-semibold">Compliance Capability</th>
                  <th className="p-4 font-semibold text-cyan-400">OXOT Platform</th>
                  <th className="p-4 font-semibold text-slate-400">Cybellum / Finite State</th>
                  <th className="p-4 font-semibold text-slate-400">Vanta / Drata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr>
                  <td className="p-4 font-medium flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" /> Multi-Regulation Cross-Mapping
                  </td>
                  <td className="p-4 text-emerald-400 font-semibold">Native (CRA, AI, 62443, NIS2)</td>
                  <td className="p-4 text-slate-500">None</td>
                  <td className="p-4 text-slate-500">IT Only (SOC 2, ISO)</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-400" /> Annex VII Technical File Generator
                  </td>
                  <td className="p-4 text-emerald-400 font-semibold">Automated Export</td>
                  <td className="p-4 text-slate-500">None</td>
                  <td className="p-4 text-slate-500">Basic Templates</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-cyan-400" /> Article 14 24h/72h SLA Timers
                  </td>
                  <td className="p-4 text-emerald-400 font-semibold">Native SLA Watch</td>
                  <td className="p-4 text-amber-400">CVE Alerts Only</td>
                  <td className="p-4 text-slate-500">None</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium flex items-center gap-2">
                    <Lock className="w-4 h-4 text-cyan-400" /> Tamper-Proof Cryptographic Hashes
                  </td>
                  <td className="p-4 text-emerald-400 font-semibold">SHA-256 Proofs</td>
                  <td className="p-4 text-slate-500">None</td>
                  <td className="p-4 text-slate-500">None</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium flex items-center gap-2">
                    <Server className="w-4 h-4 text-cyan-400" /> Notified Body Shared Portal
                  </td>
                  <td className="p-4 text-emerald-400 font-semibold">Module B/C & H Workspace</td>
                  <td className="p-4 text-slate-500">None</td>
                  <td className="p-4 text-slate-500">None</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-cyan-400" /> xBOM & VEX Exploitability Triage
                  </td>
                  <td className="p-4 text-emerald-400 font-semibold">CycloneDX & SPDX Ingest</td>
                  <td className="p-4 text-emerald-400">Binary Scan Ingest</td>
                  <td className="p-4 text-amber-400">Basic Ingest</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-16 bg-gradient-to-b from-slate-900 to-slate-950 border-t border-slate-800">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Accelerate Your CRA CE Marking Campaign?</h2>
          <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
            Join leading industrial automation OEMs, OT component suppliers, and robotics vendors using OXOT to manage end-to-end product compliance.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/conformity-platform">
              <Button size="lg" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-8">
                Start Free Assessment
              </Button>
            </Link>
            <Link href="/frameworks">
              <Button size="lg" variant="outline" className="border-slate-700 text-slate-200">
                Browse Regulation Matrix
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
