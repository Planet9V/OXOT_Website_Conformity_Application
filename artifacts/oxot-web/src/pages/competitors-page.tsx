import { Shield, Check, X, ArrowRight, Server, Lock, FileText, Cpu, AlertTriangle, Scale, Zap, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Link } from 'wouter';
import { useLocale } from '@/providers/locale-provider';

// Localised page copy (nl-NL professional register, "u"). Machine-assisted —
// flag Dutch strings for a native reviewer before go-live. Structure mirrors the
// English source so every visible string has a Dutch equivalent. Competitor
// brand/product names (Vanta, Drata, Cybellum, Finite State, OXOT Conformity)
// and regulatory names stay in English and remain inline in the JSX.
const copy = {
  en: {
    heroBadge: 'Product Security & Compliance Positioning',
    heroTitle:
      'Why Industrial OEMs & OT Leaders Choose OXOT Over Generic IT GRC or Binary Scanners',
    heroBody1: 'The EU Cyber Resilience Act (CRA) demands both deep embedded technical evidence ',
    heroEmphasis1: '(xBOMs, VEX, 24h/72h SLAs)',
    heroBody2: ' and statutory audit governance ',
    heroEmphasis2: '(Annex VII Technical Files & DoCs)',
    heroBody3: '. OXOT is the only platform built specifically to bridge both worlds.',
    exploreWorkbench: 'Explore CRA Workbench',
    viewBriefing: 'View Executive Briefing Deck',
    gapTitle: 'Understanding the Product Compliance Gap',
    gapBody:
      'Most vendors sell solutions designed for IT cloud SaaS or basic firmware binary extraction. Neither provides a complete path to CRA CE Marking.',
    grcBadge: 'IT Cloud GRC',
    grcDesc: 'Built for SaaS SOC 2 & ISO 27001',
    grcQuote: '"Great for IT policy checklists, but blind to embedded OT hardware & physical safety."',
    grcLi1: 'No IEC 62443 / OT domain awareness',
    grcLi2: 'Cannot ingest hardware/software xBOMs',
    grcLi3: 'No CRA Art 14 24h/72h ENISA SLA watch',
    grcLi4: 'No Notified Body (Module B/H) portal',
    binBadge: 'Binary Scanners',
    binDesc: 'Built for firmware scanning',
    binQuote: '"Produces endless CVE counts without statutory technical files or CE marking workflows."',
    binLi1: 'Deep binary firmware extraction',
    binLi2: 'No EU Declarations of Conformity',
    binLi3: 'No cross-regulation evidence reuse',
    binLi4: 'No Notified Body engagement workspace',
    recommended: 'Recommended',
    oxotBadge: 'All-in-One OT Platform',
    oxotDesc: 'Industrial AI & CRA Compliance Engine',
    oxotQuote: '"Single system of record connecting xBOMs, Annex VII Technical Files, and Notified Bodies."',
    oxotLi1: 'Build once, comply across CRA + AI + 62443',
    oxotLi2: 'Cryptographic SHA-256 evidence proofs',
    oxotLi3: 'Live 24h/72h ENISA CSIRT SLA watch',
    oxotLi4: 'Public Trust Center & Notified Body Portal',
    matrixTitle: 'Detailed Feature Matrix',
    colCapability: 'Compliance Capability',
    colOxot: 'OXOT Platform',
    none: 'None',
    rowCrossMap: 'Multi-Regulation Cross-Mapping',
    rowCrossMapOxot: 'Native (CRA, AI, 62443, NIS2)',
    rowCrossMapVanta: 'IT Only (SOC 2, ISO)',
    rowAnnex: 'Annex VII Technical File Generator',
    rowAnnexOxot: 'Automated Export',
    rowAnnexVanta: 'Basic Templates',
    rowArt14: 'Article 14 24h/72h SLA Timers',
    rowArt14Oxot: 'Native SLA Watch',
    rowArt14Bin: 'CVE Alerts Only',
    rowHashes: 'Tamper-Proof Cryptographic Hashes',
    rowHashesOxot: 'SHA-256 Proofs',
    rowPortal: 'Notified Body Shared Portal',
    rowPortalOxot: 'Module B/C & H Workspace',
    rowXbom: 'xBOM & VEX Exploitability Triage',
    rowXbomOxot: 'CycloneDX & SPDX Ingest',
    rowXbomBin: 'Binary Scan Ingest',
    rowXbomVanta: 'Basic Ingest',
    ctaTitle: 'Ready to Accelerate Your CRA CE Marking Campaign?',
    ctaBody:
      'Join leading industrial automation OEMs, OT component suppliers, and robotics vendors using OXOT to manage end-to-end product compliance.',
    ctaStart: 'Start Free Assessment',
    ctaBrowse: 'Browse Regulation Matrix',
  },
  nl: {
    heroBadge: 'Positionering productbeveiliging en naleving',
    heroTitle:
      'Waarom industriële OEM’s en OT-leiders kiezen voor OXOT in plaats van generieke IT-GRC of binaire scanners',
    heroBody1: 'De EU Cyber Resilience Act (CRA) vereist zowel diepgaand technisch bewijs voor embedded systemen ',
    heroEmphasis1: '(xBOM’s, VEX, 24u/72u SLA’s)',
    heroBody2: ' als wettelijk auditbeheer ',
    heroEmphasis2: '(technische documentatie volgens Bijlage VII en DoC’s)',
    heroBody3: '. OXOT is het enige platform dat specifiek is gebouwd om beide werelden te overbruggen.',
    exploreWorkbench: 'Verken de CRA-workbench',
    viewBriefing: 'Bekijk de executive briefing-deck',
    gapTitle: 'De kloof in productnaleving begrijpen',
    gapBody:
      'De meeste leveranciers verkopen oplossingen die zijn ontworpen voor IT-cloud-SaaS of eenvoudige binaire firmware-extractie. Geen van beide biedt een volledig traject naar CRA-CE-markering.',
    grcBadge: 'IT-cloud-GRC',
    grcDesc: 'Gebouwd voor SaaS SOC 2 en ISO 27001',
    grcQuote: '"Prima voor IT-beleidschecklists, maar blind voor embedded OT-hardware en fysieke veiligheid."',
    grcLi1: 'Geen kennis van het IEC 62443- / OT-domein',
    grcLi2: 'Kan geen hardware-/software-xBOM’s inlezen',
    grcLi3: 'Geen CRA-Artikel 14-bewaking van 24u/72u ENISA-SLA’s',
    grcLi4: 'Geen portaal voor aangemelde instanties (Module B/H)',
    binBadge: 'Binaire scanners',
    binDesc: 'Gebouwd voor firmwarescanning',
    binQuote: '"Produceert eindeloze CVE-aantallen zonder wettelijke technische documentatie of CE-markeringsworkflows."',
    binLi1: 'Diepgaande binaire firmware-extractie',
    binLi2: 'Geen EU-conformiteitsverklaringen',
    binLi3: 'Geen hergebruik van bewijs over meerdere verordeningen heen',
    binLi4: 'Geen samenwerkingsruimte voor aangemelde instanties',
    recommended: 'Aanbevolen',
    oxotBadge: 'All-in-one OT-platform',
    oxotDesc: 'Industriële AI- en CRA-nalevingsengine',
    oxotQuote: '"Eén centraal registratiesysteem dat xBOM’s, technische documentatie volgens Bijlage VII en aangemelde instanties met elkaar verbindt."',
    oxotLi1: 'Eenmaal opbouwen, voldoen aan CRA + AI + 62443',
    oxotLi2: 'Cryptografische SHA-256-bewijzen',
    oxotLi3: 'Live bewaking van 24u/72u ENISA-CSIRT-SLA’s',
    oxotLi4: 'Openbaar Trust Center en portaal voor aangemelde instanties',
    matrixTitle: 'Gedetailleerde functiematrix',
    colCapability: 'Nalevingsfunctie',
    colOxot: 'OXOT-platform',
    none: 'Geen',
    rowCrossMap: 'Cross-mapping over meerdere verordeningen',
    rowCrossMapOxot: 'Ingebouwd (CRA, AI, 62443, NIS2)',
    rowCrossMapVanta: 'Alleen IT (SOC 2, ISO)',
    rowAnnex: 'Generator voor technische documentatie volgens Bijlage VII',
    rowAnnexOxot: 'Geautomatiseerde export',
    rowAnnexVanta: 'Basissjablonen',
    rowArt14: 'Artikel 14 24u/72u SLA-timers',
    rowArt14Oxot: 'Ingebouwde SLA-bewaking',
    rowArt14Bin: 'Alleen CVE-meldingen',
    rowHashes: 'Manipulatiebestendige cryptografische hashes',
    rowHashesOxot: 'SHA-256-bewijzen',
    rowPortal: 'Gedeeld portaal voor aangemelde instanties',
    rowPortalOxot: 'Werkruimte voor Module B/C en H',
    rowXbom: 'xBOM- en VEX-triage op misbruikbaarheid',
    rowXbomOxot: 'CycloneDX- en SPDX-invoer',
    rowXbomBin: 'Invoer via binaire scan',
    rowXbomVanta: 'Basisinvoer',
    ctaTitle: 'Klaar om uw CRA-CE-markeringstraject te versnellen?',
    ctaBody:
      'Sluit u aan bij toonaangevende OEM’s in industriële automatisering, leveranciers van OT-componenten en robotica-aanbieders die OXOT gebruiken om productnaleving van begin tot eind te beheren.',
    ctaStart: 'Start een gratis beoordeling',
    ctaBrowse: 'Bekijk de verordeningenmatrix',
  },
} as const;

export default function CompetitorsPage() {
  const { locale } = useLocale();
  const t = copy[locale];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-cyan-500 selection:text-slate-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24 border-b border-slate-800/80">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-900/20 via-slate-950 to-slate-950 pointer-events-none" />
        
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-6">
            <Scale className="w-3.5 h-3.5" /> {t.heroBadge}
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent mb-6 max-w-4xl">
            {t.heroTitle}
          </h1>

          <p className="text-lg md:text-xl text-slate-300 max-w-3xl leading-relaxed mb-8">
            {t.heroBody1}<span className="text-cyan-400 font-semibold">{t.heroEmphasis1}</span>{t.heroBody2}<span className="text-cyan-400 font-semibold">{t.heroEmphasis2}</span>{t.heroBody3}
          </p>

          <div className="flex flex-wrap gap-4 items-center">
            <Link href="/conformity-platform">
              <Button size="lg" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-8 shadow-lg shadow-cyan-500/20">
                {t.exploreWorkbench} <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <a href="/conformity-briefing/" target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="border-slate-700 text-slate-200 hover:bg-slate-900">
                {t.viewBriefing}
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Strategic Positioning Split: IT GRC vs Binary Scanners vs OXOT */}
      <section className="py-20 bg-slate-900/40">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold mb-4">{t.gapTitle}</h2>
            <p className="text-slate-400">
              {t.gapBody}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* IT GRC */}
            <Card className="bg-slate-900/60 border-slate-800 text-slate-200 hover:border-slate-700 transition">
              <CardHeader>
                <Badge variant="outline" className="w-fit border-amber-500/30 text-amber-400 bg-amber-950/20 mb-2">
                  {t.grcBadge}
                </Badge>
                <CardTitle className="text-xl">Vanta / Drata</CardTitle>
                <CardDescription className="text-slate-400">{t.grcDesc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-300">
                <p className="text-slate-400 italic">{t.grcQuote}</p>
                <ul className="space-y-2">
                  <li className="flex items-start text-red-400"><X className="w-4 h-4 mr-2 shrink-0 mt-0.5" /> {t.grcLi1}</li>
                  <li className="flex items-start text-red-400"><X className="w-4 h-4 mr-2 shrink-0 mt-0.5" /> {t.grcLi2}</li>
                  <li className="flex items-start text-red-400"><X className="w-4 h-4 mr-2 shrink-0 mt-0.5" /> {t.grcLi3}</li>
                  <li className="flex items-start text-red-400"><X className="w-4 h-4 mr-2 shrink-0 mt-0.5" /> {t.grcLi4}</li>
                </ul>
              </CardContent>
            </Card>

            {/* Binary Scanners */}
            <Card className="bg-slate-900/60 border-slate-800 text-slate-200 hover:border-slate-700 transition">
              <CardHeader>
                <Badge variant="outline" className="w-fit border-purple-500/30 text-purple-400 bg-purple-950/20 mb-2">
                  {t.binBadge}
                </Badge>
                <CardTitle className="text-xl">Cybellum / Finite State</CardTitle>
                <CardDescription className="text-slate-400">{t.binDesc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-300">
                <p className="text-slate-400 italic">{t.binQuote}</p>
                <ul className="space-y-2">
                  <li className="flex items-start text-emerald-400"><Check className="w-4 h-4 mr-2 shrink-0 mt-0.5 text-emerald-400" /> {t.binLi1}</li>
                  <li className="flex items-start text-red-400"><X className="w-4 h-4 mr-2 shrink-0 mt-0.5" /> {t.binLi2}</li>
                  <li className="flex items-start text-red-400"><X className="w-4 h-4 mr-2 shrink-0 mt-0.5" /> {t.binLi3}</li>
                  <li className="flex items-start text-red-400"><X className="w-4 h-4 mr-2 shrink-0 mt-0.5" /> {t.binLi4}</li>
                </ul>
              </CardContent>
            </Card>

            {/* OXOT Platform */}
            <Card className="bg-cyan-950/30 border-cyan-500/50 text-slate-100 relative overflow-hidden shadow-xl shadow-cyan-950/50">
              <div className="absolute top-0 right-0 bg-cyan-500 text-slate-950 text-[10px] font-black uppercase px-3 py-1 rounded-bl">
                {t.recommended}
              </div>
              <CardHeader>
                <Badge className="w-fit bg-cyan-500 text-slate-950 font-bold mb-2">
                  {t.oxotBadge}
                </Badge>
                <CardTitle className="text-2xl text-cyan-300">OXOT Conformity</CardTitle>
                <CardDescription className="text-slate-300">{t.oxotDesc}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-slate-200">
                <p className="text-cyan-200 font-medium">{t.oxotQuote}</p>
                <ul className="space-y-2 font-medium">
                  <li className="flex items-start text-emerald-400"><Check className="w-4 h-4 mr-2 shrink-0 mt-0.5" /> {t.oxotLi1}</li>
                  <li className="flex items-start text-emerald-400"><Check className="w-4 h-4 mr-2 shrink-0 mt-0.5" /> {t.oxotLi2}</li>
                  <li className="flex items-start text-emerald-400"><Check className="w-4 h-4 mr-2 shrink-0 mt-0.5" /> {t.oxotLi3}</li>
                  <li className="flex items-start text-emerald-400"><Check className="w-4 h-4 mr-2 shrink-0 mt-0.5" /> {t.oxotLi4}</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Comprehensive Functional Feature Matrix */}
      <section className="py-20 border-t border-slate-800/80">
        <div className="container mx-auto px-4 max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">{t.matrixTitle}</h2>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-300">
                  <th className="p-4 font-semibold">{t.colCapability}</th>
                  <th className="p-4 font-semibold text-cyan-400">{t.colOxot}</th>
                  <th className="p-4 font-semibold text-slate-400">Cybellum / Finite State</th>
                  <th className="p-4 font-semibold text-slate-400">Vanta / Drata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                <tr>
                  <td className="p-4 font-medium flex items-center gap-2">
                    <Layers className="w-4 h-4 text-cyan-400" /> {t.rowCrossMap}
                  </td>
                  <td className="p-4 text-emerald-400 font-semibold">{t.rowCrossMapOxot}</td>
                  <td className="p-4 text-slate-500">{t.none}</td>
                  <td className="p-4 text-slate-500">{t.rowCrossMapVanta}</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4 text-cyan-400" /> {t.rowAnnex}
                  </td>
                  <td className="p-4 text-emerald-400 font-semibold">{t.rowAnnexOxot}</td>
                  <td className="p-4 text-slate-500">{t.none}</td>
                  <td className="p-4 text-slate-500">{t.rowAnnexVanta}</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-cyan-400" /> {t.rowArt14}
                  </td>
                  <td className="p-4 text-emerald-400 font-semibold">{t.rowArt14Oxot}</td>
                  <td className="p-4 text-amber-400">{t.rowArt14Bin}</td>
                  <td className="p-4 text-slate-500">{t.none}</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium flex items-center gap-2">
                    <Lock className="w-4 h-4 text-cyan-400" /> {t.rowHashes}
                  </td>
                  <td className="p-4 text-emerald-400 font-semibold">{t.rowHashesOxot}</td>
                  <td className="p-4 text-slate-500">{t.none}</td>
                  <td className="p-4 text-slate-500">{t.none}</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium flex items-center gap-2">
                    <Server className="w-4 h-4 text-cyan-400" /> {t.rowPortal}
                  </td>
                  <td className="p-4 text-emerald-400 font-semibold">{t.rowPortalOxot}</td>
                  <td className="p-4 text-slate-500">{t.none}</td>
                  <td className="p-4 text-slate-500">{t.none}</td>
                </tr>
                <tr>
                  <td className="p-4 font-medium flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-cyan-400" /> {t.rowXbom}
                  </td>
                  <td className="p-4 text-emerald-400 font-semibold">{t.rowXbomOxot}</td>
                  <td className="p-4 text-emerald-400">{t.rowXbomBin}</td>
                  <td className="p-4 text-amber-400">{t.rowXbomVanta}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-16 bg-gradient-to-b from-slate-900 to-slate-950 border-t border-slate-800">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h2 className="text-3xl font-bold mb-4">{t.ctaTitle}</h2>
          <p className="text-slate-400 mb-8 max-w-2xl mx-auto">
            {t.ctaBody}
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/conformity-platform">
              <Button size="lg" className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold px-8">
                {t.ctaStart}
              </Button>
            </Link>
            <Link href="/frameworks">
              <Button size="lg" variant="outline" className="border-slate-700 text-slate-200">
                {t.ctaBrowse}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
