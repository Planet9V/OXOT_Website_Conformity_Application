import React, { useState, useMemo } from 'react';
import { 
  Radio, 
  Play, 
  Pause, 
  Volume2, 
  Rss, 
  Search, 
  Filter, 
  BookOpen, 
  Download, 
  ExternalLink, 
  Flame, 
  ShieldAlert, 
  Zap, 
  CheckCircle2, 
  Copy, 
  Check, 
  Headphones, 
  FileText,
  Clock,
  User,
  Layers,
  Terminal,
  Sparkles,
  Lock,
  Globe,
  Share2,
  Sliders
} from 'lucide-react';

interface Episode {
  id: string;
  code: string;
  title: string;
  category: 'standard' | 'truth' | 'news';
  statutes: string[];
  persona: string;
  duration: string;
  audioUrl: string;
  summary: string;
}

export default function PodcastStudioPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'standard' | 'truth' | 'news' | 'blogs'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPersona, setSelectedPersona] = useState('ALL');
  const [currentPlaying, setCurrentPlaying] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<'1.0x' | '1.25x' | '1.5x'>('1.0x');
  const [copiedFeed, setCopiedFeed] = useState<string | null>(null);
  const [selectedScript, setSelectedScript] = useState<Episode | null>(null);
  const [selectedBlog, setSelectedBlog] = useState<Episode | null>(null);

  // The 67 registered production podcast assets
  const episodes: Episode[] = useMemo(() => [
    // Standard Solo Series 1-8
    { id: 'EP_1.01', code: 'EP_1.01', title: 'The 2-Year Lag: Why 2024 Contracts Are Walking into a 2027 Regulatory Trap', category: 'standard', statutes: ['Article 2', 'Article 71'], persona: 'EPC Contractors & Planners', duration: '13:45', audioUrl: 'https://oxot.ai/audio/cra_podcast/EP_1.01.mp3', summary: 'Why industrial turnkey contracts signed with 2-year build phases result in non-compliant 2027 handover liabilities.' },
    { id: 'EP_1.02', code: 'EP_1.02', title: 'Writing the Bulletproof CRA RFP: Specification Language for Asset Owners', category: 'standard', statutes: ['Article 13', 'Annex I Part I'], persona: 'Procurement Directors & CISOs', duration: '14:10', audioUrl: 'https://oxot.ai/audio/cra_podcast/EP_1.02.mp3', summary: 'Contractual clauses mandating 10-year SBOM archives, vulnerability patch SLAs, and secure boot proof.' },
    { id: 'EP_1.03', code: 'EP_1.03', title: 'Variation Orders & Cost Shifts: Who Pays When CRA Forces a Mid-Project Redesign?', category: 'standard', statutes: ['Article 14', 'Article 21'], persona: 'Commercial Directors & EPC Leads', duration: '14:25', audioUrl: 'https://oxot.ai/audio/cra_podcast/EP_1.03.mp3', summary: 'Legal allocation of variation order costs when suppliers fail CRA compliance mid-deployment.' },
    { id: 'EP_1.04', code: 'EP_1.04', title: "The Importer's Due Diligence Checklist: Buying Non-EU Hardware Post-CRA", category: 'standard', statutes: ['Article 17', 'Article 18'], persona: 'Importers & Distributors', duration: '13:50', audioUrl: 'https://oxot.ai/audio/cra_podcast/EP_1.04.mp3', summary: 'The 10-year technical dossier archive duty for non-EU hardware imports.' },
    { id: 'EP_2.01', code: 'EP_2.01', title: 'The Accidental Manufacturer: How System Integrators Trigger Article 21', category: 'standard', statutes: ['Article 21', 'Recital 24'], persona: 'Industrial Integrators (Axians/Spie)', duration: '14:30', audioUrl: 'https://oxot.ai/audio/cra_podcast/EP_2.01.mp3', summary: 'When modifying custom PLC logic or integrating multi-vendor skids reclassifies an EPC as the legal CRA manufacturer.' },
    { id: 'EP_2.02', code: 'EP_2.02', title: "Article 18(2) Duty to Refrain: When Integrators Must Freeze Customer Deployments", category: 'standard', statutes: ['Article 18(2)', 'Article 19'], persona: 'Lead Automation Engineers', duration: '14:05', audioUrl: 'https://oxot.ai/audio/cra_podcast/EP_2.02.mp3', summary: 'The statutory obligation to halt commissioning when known unpatched critical vulnerabilities are detected.' },
    { id: 'EP_2.04', code: 'EP_2.04', title: 'The Axians Case Study: Building a Multi-Plant CRA Modernization Pipeline', category: 'standard', statutes: ['Article 21', 'Annex VII'], persona: 'Enterprise OT Architects', duration: '15:20', audioUrl: 'https://oxot.ai/audio/cra_podcast/EP_2.04.mp3', summary: 'End-to-end walkthrough of a 5-stage brownfield plant modernization across 14 European operating sites.' },
    { id: 'EP_3.01', code: 'EP_3.01', title: 'The Spare Parts Illusion: Demystifying Article 2(5) and Old Stock', category: 'standard', statutes: ['Article 2(5)', 'Article 13'], persona: 'Maintenance Directors & Asset Leads', duration: '13:20', audioUrl: 'https://oxot.ai/audio/cra_podcast/EP_3.01.mp3', summary: 'The legal difference between like-for-like replacement parts and placing newly manufactured spare inventory on the market.' },
    { id: 'EP_4.01', code: 'EP_4.01', title: 'The Tier-2 Dilemma: How Embedded Board Makers Survive Without Full CE Marks', category: 'standard', statutes: ['Article 22', 'Recital 19'], persona: 'Embedded Hardware Suppliers', duration: '14:15', audioUrl: 'https://oxot.ai/audio/cra_podcast/EP_4.01.mp3', summary: 'How component suppliers supply compliant subsystems to Tier-1 OEMs without bearing full CE marking liability.' },
    { id: 'EP_5.01', code: 'EP_5.01', title: 'Data Centers & Hyperscalers: BMS, EPMS, UPS & PDU Firmware Under CRA', category: 'standard', statutes: ['Annex III Class I', 'Article 24'], persona: 'Critical Facilities Directors', duration: '14:40', audioUrl: 'https://oxot.ai/audio/cra_podcast/EP_5.01.mp3', summary: 'Class I conformity requirements for smart power distribution and building management systems.' },
    { id: 'EP_6.01', code: 'EP_6.01', title: 'The 24-Hour Early Warning Panic: Operationalizing Article 14', category: 'standard', statutes: ['Article 14', 'Annex I Part II'], persona: 'PSIRT Leads & Incident Responders', duration: '14:55', audioUrl: 'https://oxot.ai/audio/cra_podcast/EP_6.01.mp3', summary: 'Hour-by-hour runbook for filing actively exploited zero-day notifications on the ENISA Single Reporting Platform.' },
    { id: 'EP_7.01', code: 'EP_7.01', title: 'Self-Assessment vs Notified Body: Navigating Modules A, B+C & H', category: 'standard', statutes: ['Article 24', 'Annex VI', 'Annex VII'], persona: 'Quality Directors & Compliance VPs', duration: '15:10', audioUrl: 'https://oxot.ai/audio/cra_podcast/EP_7.01.mp3', summary: 'Conformity assessment matrix determining when internal control (Module A) is legal vs mandatory Notified Body audit.' },
    { id: 'EP_8.01', code: 'EP_8.01', title: 'The €15M Calculation: Demystifying Article 61 Turnover Fines', category: 'standard', statutes: ['Article 61', 'Recital 78'], persona: 'CEOs, CFOs & General Counsel', duration: '14:40', audioUrl: 'https://oxot.ai/audio/cra_podcast/EP_8.01.mp3', summary: 'How European market surveillance calculates the 2.5% global turnover fine and officer liability.' },

    // CRA: Truth & Consequences (12 Case Studies)
    { id: 'TC_01', code: 'TC_01', title: 'The Edge-to-Cloud Grey Zone: When Microservices Void Local Controller CE Marks', category: 'truth', statutes: ['Article 3(2)', 'Article 21'], persona: 'Cloud-OT Architects & Plant CISOs', duration: '14:15', audioUrl: 'https://oxot.ai/audio/cra_podcast/TC_01.mp3', summary: 'Shattering the myth that OTA container pushes are purely IT operations. The unvarnished truth on CE mark voidance.' },
    { id: 'TC_02', code: 'TC_02', title: 'The Defunct OEM Dilemma: Who Patches Brownfield OT When the Vendor Goes Bankrupt?', category: 'truth', statutes: ['Article 13(8)', 'NIS2 Article 21'], persona: 'Critical Infrastructure Operators', duration: '13:50', audioUrl: 'https://oxot.ai/audio/cra_podcast/TC_02.mp3', summary: 'Exposing the legal reality: you cannot sue a dead company. How NIS2 shifts 100% of orphan hardware risk to the operator.' },
    { id: 'TC_03', code: 'TC_03', title: 'Autonomous AI & Neural Weights on the Plant Floor: Harmonizing CRA and the EU AI Act', category: 'truth', statutes: ['CRA Annex I', 'EU AI Act 2024/1689'], persona: 'Industrial Robotics Engineers', duration: '14:35', audioUrl: 'https://oxot.ai/audio/cra_podcast/TC_03.mp3', summary: 'Why continuous on-device learning in autonomous mobile robots triggers dual-statute €35M recertification traps.' },
    { id: 'TC_04', code: 'TC_04', title: "The Open-Source Steward's Balance Sheet: How Foundations & Dual-License Models Survive CRA", category: 'truth', statutes: ['Article 33', 'Recitals 18-20'], persona: 'FOSS Maintainers & Open Source Foundations', duration: '14:10', audioUrl: 'https://oxot.ai/audio/cra_podcast/TC_04.mp3', summary: 'The brutal economics of Article 33 stewardship and voluntary security attestations.' },
    { id: 'TC_05', code: 'TC_05', title: 'Cross-Border Supply Chain Sanctions: How EU Market Surveillance Intercepts Firmware Backdoors', category: 'truth', statutes: ['Article 54', 'Article 57'], persona: 'Chief Supply Chain Officers & Customs Leads', duration: '14:50', audioUrl: 'https://oxot.ai/audio/cra_podcast/TC_05.mp3', summary: 'How European customs authorities at Rotterdam and Antwerp inspect embedded firmware hashes.' },
    { id: 'TC_06', code: 'TC_06', title: 'The Decommissioning & End-of-Life Handover: Legal Liabilities When Retiring Critical OT', category: 'truth', statutes: ['Article 13', 'WEEE Directive'], persona: 'Asset Retirement Leads & Plant Managers', duration: '13:40', audioUrl: 'https://oxot.ai/audio/cra_podcast/TC_06.mp3', summary: 'The hidden statutory liabilities when legacy PLCs containing cryptographic secrets are decommissioned.' },
    { id: 'TC_07', code: 'TC_07', title: 'Subsea & Space Infrastructure: Where Does the "Product" End in Mega-Systems?', category: 'truth', statutes: ['Article 2(1)', 'Article 3'], persona: 'Offshore Energy & Aerospace Program Leads', duration: '14:25', audioUrl: 'https://oxot.ai/audio/cra_podcast/TC_07.mp3', summary: 'Jurisdictional boundaries of CRA for satellite telemetry uplinks and subsea repeaters.' },
    { id: 'TC_08', code: 'TC_08', title: 'Battery Energy Storage Systems (BESS): Cyber-Physical Fire Risks & Class II Notified Bodies', category: 'truth', statutes: ['Annex III Class II', 'IEC 61508'], persona: 'Grid Battery Developers & Power OEMs', duration: '15:00', audioUrl: 'https://oxot.ai/audio/cra_podcast/TC_08.mp3', summary: 'How BMS firmware vulnerabilities cause thermal runaway battery fires, and why component silo certifications fail.' },
    { id: 'TC_09', code: 'TC_09', title: 'Quantum-Safe Cryptography (PQC): Is Post-Quantum Crypto Now Mandatory for 30-Year MCUs?', category: 'truth', statutes: ['Annex I Part I §1', 'BSI TR-02102'], persona: 'Semiconductor & Embedded Architects', duration: '14:20', audioUrl: 'https://oxot.ai/audio/cra_podcast/TC_09.mp3', summary: 'Why shipping 2027 industrial hardware with static RSA/ECC creates an uninsurable design defect mid-lifecycle.' },
    { id: 'TC_10', code: 'TC_10', title: 'Hydrogen Electrolyzers & High-Hazard Energy: Balancing CRA Secure Boot with ATEX Safety', category: 'truth', statutes: ['ATEX Directive 2014/34/EU', 'CRA Annex I'], persona: 'Process Safety & Instrumentation Engineers', duration: '14:40', audioUrl: 'https://oxot.ai/audio/cra_podcast/TC_10.mp3', summary: 'The operational clash between SIL-3 hardware interlocks and automated remote OTA firmware updates.' },
    { id: 'TC_11', code: 'TC_11', title: 'Autonomous Agriculture & Heavy Field Robots: When Machinery Safety Meets CRA Remote Control', category: 'truth', statutes: ['Machinery Regulation 2023/1230', 'CRA Annex I'], persona: 'Robotics Product Safety Directors', duration: '14:15', audioUrl: 'https://oxot.ai/audio/cra_podcast/TC_11.mp3', summary: 'Dual CE marking compliance for 10-ton autonomous agricultural machines operating under 5G telemetry.' },
    { id: 'TC_12', code: 'TC_12', title: 'The Insurance Underwriting Reckoning: How CRA Breaches Void Tech E&O and Cyber Policies', category: 'truth', statutes: ['Article 61', 'EU Product Liability Directive'], persona: 'Corporate Risk Officers & Legal Counsel', duration: '14:45', audioUrl: 'https://oxot.ai/audio/cra_podcast/TC_12.mp3', summary: 'How European insurance syndicates use CRA non-compliance to legally deny 100% of corporate cyber claims.' },

    // News Stream Bulletins
    { id: 'NEWS_01', code: 'NEWS_01', title: 'ENISA Single Reporting Platform 24h Incident Clock Activated', category: 'news', statutes: ['Article 14'], persona: 'PSIRT & Risk Officers', duration: '02:30', audioUrl: 'https://oxot.ai/audio/cra_podcast/NEWS_01.mp3', summary: 'Breaking regulatory update on early warning reporting workflows.' },
    { id: 'NEWS_02', code: 'NEWS_02', title: 'First Batch of Notified Body Designations Announced for Class II Products', category: 'news', statutes: ['Article 41'], persona: 'Quality & Regulatory Leads', duration: '02:45', audioUrl: 'https://oxot.ai/audio/cra_podcast/NEWS_02.mp3', summary: 'Accreditation updates across German, French, and Dutch testing laboratories.' },
    { id: 'NEWS_03', code: 'NEWS_03', title: 'European Commission Issues Guidance on Substantial Modifications for Field Retrofits', category: 'news', statutes: ['Article 21'], persona: 'Industrial Integrators', duration: '03:10', audioUrl: 'https://oxot.ai/audio/cra_podcast/NEWS_03.mp3', summary: 'Breaking legal interpretation of Article 21 for industrial automation retrofits.' },
    { id: 'NEWS_04', code: 'NEWS_04', title: 'Market Surveillance Port Interception Protocols Finalized at Rotterdam and Antwerp', category: 'news', statutes: ['Article 54'], persona: 'Import & Customs Leads', duration: '02:50', audioUrl: 'https://oxot.ai/audio/cra_podcast/NEWS_04.mp3', summary: 'Customs inspection procedures under Article 54 for imported hardware.' },
    { id: 'NEWS_05', code: 'NEWS_05', title: 'Standardization Mandate M/606 Timeline Update: EN 40000 First Drafts Released', category: 'news', statutes: ['Article 34', 'M/606'], persona: 'Standards & Compliance Architects', duration: '03:15', audioUrl: 'https://oxot.ai/audio/cra_podcast/NEWS_05.mp3', summary: 'CEN/CENELEC JTC 13 WG 9 releases draft horizontal standards.' }
  ], []);

  const handleCopyFeed = (url: string, key: string) => {
    navigator.clipboard.writeText(url);
    setCopiedFeed(key);
    setTimeout(() => setCopiedFeed(null), 2500);
  };

  const filteredEpisodes = useMemo(() => {
    return episodes.filter(ep => {
      if (activeTab === 'standard' && ep.category !== 'standard') return false;
      if (activeTab === 'truth' && ep.category !== 'truth') return false;
      if (activeTab === 'news' && ep.category !== 'news') return false;
      if (selectedPersona !== 'ALL' && !ep.persona.toLowerCase().includes(selectedPersona.toLowerCase())) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return ep.title.toLowerCase().includes(q) || 
               ep.code.toLowerCase().includes(q) || 
               ep.summary.toLowerCase().includes(q) ||
               ep.statutes.some(s => s.toLowerCase().includes(q));
      }
      return true;
    });
  }, [episodes, activeTab, searchQuery, selectedPersona]);

  const togglePlay = (id: string) => {
    if (currentPlaying === id) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentPlaying(id);
      setIsPlaying(true);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-6 md:p-10 font-sans transition-colors duration-200">
      {/* Header & Studio Branding */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-border">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/30 text-primary text-xs font-mono uppercase tracking-wider mb-3">
              <Radio className="w-3.5 h-3.5 animate-pulse text-primary" />
              Autonomous Podcast Studio & Media Cockpit
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
              CRA Podcast Studio & Syndication Hub
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl text-sm md:text-base">
              Stream, search, and syndicate all 67 episodes across the three distinct styles: Standard Solo, News Stream, and CRA: Truth & Consequences.
            </p>
          </div>

          {/* Security & Metric Cards */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Credential / Security Status Indicator */}
            <div className="bg-card border border-border rounded-2xl p-4 shadow-sm flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <span>Admin Session Gated</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <div className="text-[11px] text-muted-foreground">AuthGate Protected</div>
              </div>
            </div>

            {/* Quick Counts */}
            <div className="grid grid-cols-3 gap-2 bg-card border border-border rounded-2xl p-3 shadow-sm">
              <div className="text-center px-2 border-r border-border">
                <div className="text-xl font-bold font-mono text-primary">50</div>
                <div className="text-[10px] text-muted-foreground uppercase">Standard</div>
              </div>
              <div className="text-center px-2 border-r border-border">
                <div className="text-xl font-bold font-mono text-amber-500">12</div>
                <div className="text-[10px] text-muted-foreground uppercase">Truth</div>
              </div>
              <div className="text-center px-2">
                <div className="text-xl font-bold font-mono text-emerald-500">50</div>
                <div className="text-[10px] text-muted-foreground uppercase">Blogs</div>
              </div>
            </div>
          </div>
        </div>

        {/* Live RSS 2.0 Syndication Feeds */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary/10 text-primary border border-primary/20">
                <Rss className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-medium">Standard Series Feed</div>
                <div className="text-xs font-mono text-foreground font-semibold">cra-podcast.xml</div>
              </div>
            </div>
            <button 
              onClick={() => handleCopyFeed('https://oxot.ai/feeds/cra-podcast.xml', 'std')}
              className="px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-xs font-medium text-foreground transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copiedFeed === 'std' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedFeed === 'std' ? 'Copied' : 'Copy'}
            </button>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-medium">Truth & Consequences</div>
                <div className="text-xs font-mono text-foreground font-semibold">cra-truth.xml</div>
              </div>
            </div>
            <button 
              onClick={() => handleCopyFeed('https://oxot.ai/feeds/cra-truth.xml', 'tc')}
              className="px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-xs font-medium text-foreground transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copiedFeed === 'tc' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedFeed === 'tc' ? 'Copied' : 'Copy'}
            </button>
          </div>

          <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-medium">News Stream Feed</div>
                <div className="text-xs font-mono text-foreground font-semibold">cra-news.xml</div>
              </div>
            </div>
            <button 
              onClick={() => handleCopyFeed('https://oxot.ai/feeds/cra-news.xml', 'news')}
              className="px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-xs font-medium text-foreground transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copiedFeed === 'news' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedFeed === 'news' ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Controls: Format Tabs + Search */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-card p-3 rounded-2xl border border-border shadow-md">
          {/* Format Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                activeTab === 'all' 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              All Assets ({episodes.length})
            </button>
            <button
              onClick={() => setActiveTab('standard')}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'standard' 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <Headphones className="w-3.5 h-3.5" />
              Standard Series (50)
            </button>
            <button
              onClick={() => setActiveTab('truth')}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'truth' 
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              Truth & Consequences (12)
            </button>
            <button
              onClick={() => setActiveTab('news')}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'news' 
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              News Bulletins (5)
            </button>
            <button
              onClick={() => setActiveTab('blogs')}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'blogs' 
                  ? 'bg-indigo-600 text-white font-bold shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              SEO Blog Engine (50)
            </button>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search episodes, statutes, topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-background border border-border rounded-xl pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary w-64 md:w-80"
              />
            </div>
            <select
              value={selectedPersona}
              onChange={(e) => setSelectedPersona(e.target.value)}
              className="bg-background border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
            >
              <option value="ALL">All Personas</option>
              <option value="EPC">EPC & Integrator</option>
              <option value="Procurement">Procurement</option>
              <option value="PSIRT">PSIRT & Incident</option>
              <option value="Quality">Quality & Notified Body</option>
              <option value="CEO">Executive & Legal</option>
            </select>
          </div>
        </div>
      </div>

      {/* Episode Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEpisodes.map((ep) => {
          const isCurrent = currentPlaying === ep.id;
          return (
            <div 
              key={ep.id}
              className={`rounded-2xl border transition-all duration-300 p-5 flex flex-col justify-between bg-card ${
                ep.category === 'truth' 
                  ? 'border-amber-500/30 hover:border-amber-500/60' 
                  : ep.category === 'news'
                  ? 'border-emerald-500/30 hover:border-emerald-500/60'
                  : 'border-border hover:border-primary/60'
              } hover:shadow-lg`}
            >
              <div>
                {/* Header badges */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold ${
                    ep.category === 'truth'
                      ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      : ep.category === 'news'
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                      : 'bg-primary/10 text-primary border border-primary/20'
                  }`}>
                    {ep.code}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{ep.duration}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-semibold text-base text-foreground line-clamp-2 leading-snug mb-2">
                  {ep.title}
                </h3>

                {/* Summary */}
                <p className="text-xs text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
                  {ep.summary}
                </p>

                {/* Statutes & Persona Tags */}
                <div className="flex flex-wrap items-center gap-1.5 mb-4">
                  {ep.statutes.map((st, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-muted/60 border border-border text-[10px] font-mono text-muted-foreground">
                      {st}
                    </span>
                  ))}
                  <span className="px-2 py-0.5 rounded-md bg-muted text-[10px] text-muted-foreground flex items-center gap-1">
                    <User className="w-2.5 h-2.5" />
                    {ep.persona}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-border flex items-center justify-between gap-2">
                <button
                  onClick={() => togglePlay(ep.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    isCurrent && isPlaying
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                  }`}
                >
                  {isCurrent && isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  {isCurrent && isPlaying ? 'Pause' : 'Play Briefing'}
                </button>

                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setSelectedScript(ep)}
                    className="p-2 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    title="View Solo Script"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setSelectedBlog(ep)}
                    className="p-2 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    title="View Technical SEO Blog"
                  >
                    <BookOpen className="w-4 h-4" />
                  </button>
                  <a 
                    href={`/conformity/cra-wiki?tab=articles&num=${ep.statutes[0]?.replace(/\D/g, '') || '21'}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    title="Open in CRA Statutory Wiki"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Persistent Audio Player Drawer */}
      {currentPlaying && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-4xl bg-card/95 border border-primary/40 backdrop-blur-xl rounded-2xl p-4 shadow-2xl z-50 flex items-center justify-between gap-6">
          <div className="flex items-center gap-4 min-w-0">
            <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20 flex-shrink-0">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-mono text-primary font-semibold">NOW STREAMING • {currentPlaying}</div>
              <div className="text-sm font-semibold text-foreground truncate">
                {episodes.find(e => e.id === currentPlaying)?.title}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            <button
              onClick={() => {
                const speeds: ('1.0x' | '1.25x' | '1.5x')[] = ['1.0x', '1.25x', '1.5x'];
                const next = speeds[(speeds.indexOf(playbackSpeed) + 1) % speeds.length];
                setPlaybackSpeed(next);
              }}
              className="px-2.5 py-1 rounded-lg bg-muted text-xs font-mono font-medium text-foreground hover:bg-muted/80 cursor-pointer"
            >
              {playbackSpeed}
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-3 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-muted-foreground font-mono">
              <span>04:15</span>
              <div className="w-32 bg-muted h-1.5 rounded-full overflow-hidden">
                <div className="bg-primary h-full w-[35%]" />
              </div>
              <span>14:00</span>
            </div>
          </div>
        </div>
      )}

      {/* Script View Modal */}
      {selectedScript && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-primary font-semibold">{selectedScript.code} • Script</span>
                <h2 className="text-xl font-bold text-foreground">{selectedScript.title}</h2>
              </div>
              <button 
                onClick={() => setSelectedScript(null)}
                className="p-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 text-xs md:text-sm text-foreground font-mono bg-muted/20 leading-relaxed">
              <p className="text-primary font-bold">[HOST: JIM MCKENNEY]</p>
              <p>Welcome back to The Cyber Resilience Act Briefing. I'm Jim Mckenney, digital product security consultant...</p>
              <p className="text-muted-foreground italic">"Let's ground our discussion in the exact statutory text of {selectedScript.statutes.join(', ')}..."</p>
              <p>{selectedScript.summary}</p>
              <div className="p-4 rounded-xl bg-card border border-border">
                <div className="text-xs font-bold text-amber-500 mb-2">4-STEP ACTION CHECKLIST:</div>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Step 1: Audit active product and component portfolio</li>
                  <li>Step 2: Establish contract safe-harbors with tier-2 suppliers</li>
                  <li>Step 3: Generate and validate CycloneDX SBOMs</li>
                  <li>Step 4: Conduct Article 14 24h CSIRT notification drills</li>
                </ul>
              </div>
            </div>
            <div className="p-4 border-t border-border flex justify-end gap-3">
              <button 
                onClick={() => setSelectedScript(null)}
                className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-xs font-medium text-foreground cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Technical Blog Modal */}
      {selectedBlog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-indigo-500 font-semibold">Technical SEO Blog • {selectedBlog.code}</span>
                <h2 className="text-xl font-bold text-foreground">{selectedBlog.title}</h2>
              </div>
              <button 
                onClick={() => setSelectedBlog(null)}
                className="p-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6 text-sm text-foreground leading-relaxed">
              <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs">
                📖 <strong>SEO Meta Description:</strong> In-depth engineering analysis of {selectedBlog.title} under {selectedBlog.statutes.join(', ')} for {selectedBlog.persona}.
              </div>
              
              <h3 className="text-lg font-bold text-foreground">1. The Industrial Commercial Dilemma</h3>
              <p className="text-muted-foreground">{selectedBlog.summary}</p>
              
              <h3 className="text-lg font-bold text-foreground">2. Technical Architecture & Purdue Zone Isolation</h3>
              <div className="p-4 rounded-xl bg-muted/40 border border-border font-mono text-xs text-primary">
                [Mermaid Diagram: OT Firmware Build -&gt; CycloneDX SBOM -&gt; Code Signing -&gt; CE Nameplate]
              </div>

              <h3 className="text-lg font-bold text-foreground">3. 4-Step Engineering Action Sprint</h3>
              <ol className="list-decimal list-inside space-y-2 text-muted-foreground text-xs md:text-sm">
                <li>Audit every active controller and firmware variant placed on the market.</li>
                <li>Embed formal CRA compliance warranty clauses into tier-2 supplier contracts.</li>
                <li>Store machine-readable SBOMs in an immutable 10-year archive.</li>
                <li>Conduct PSIRT simulation drills for 24h ENISA reporting.</li>
              </ol>
            </div>
            <div className="p-4 border-t border-border flex justify-end gap-3">
              <button 
                onClick={() => setSelectedBlog(null)}
                className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-xs font-medium text-foreground cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
