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
  Sparkles
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
  const [copiedFeed, setCopiedFeed] = useState<string | null>(null);
  const [selectedScript, setSelectedScript] = useState<Episode | null>(null);
  const [selectedBlog, setSelectedBlog] = useState<Episode | null>(null);

  // Sample static index representing the 67 registered assets
  const episodes: Episode[] = useMemo(() => [
    // Standard Solo Series (Sample of 50)
    { id: 'EP_1.01', code: 'EP_1.01', title: 'The 2-Year Lag: Why 2024 Contracts Are Walking into a 2027 Regulatory Trap', category: 'standard', statutes: ['Article 2', 'Article 71'], persona: 'EPC Contractors & Project Planners', duration: '13:45', audioUrl: 'https://oxot.ai/audio/cra_podcast/EP_1.01.mp3', summary: 'Why industrial turnkey contracts signed in 2024 with 2-year build phases result in non-compliant 2027 handover liabilities.' },
    { id: 'EP_1.02', code: 'EP_1.02', title: 'Writing the Bulletproof CRA RFP: Specification Language for Asset Owners', category: 'standard', statutes: ['Article 13', 'Annex I Part I'], persona: 'Procurement Directors & CISOs', duration: '14:10', audioUrl: 'https://oxot.ai/audio/cra_podcast/EP_1.02.mp3', summary: 'Contractual clauses mandating 10-year SBOM archives, vulnerability patch SLAs, and secure boot proof.' },
    { id: 'EP_2.01', code: 'EP_2.01', title: 'The Accidental Manufacturer: How System Integrators Trigger Article 21', category: 'standard', statutes: ['Article 21', 'Recital 24'], persona: 'Industrial Integrators (Axians/Spie)', duration: '14:30', audioUrl: 'https://oxot.ai/audio/cra_podcast/EP_2.01.mp3', summary: 'When modifying custom PLC logic or integrating multi-vendor skids reclassifies an EPC as the legal CRA manufacturer.' },
    { id: 'EP_3.01', code: 'EP_3.01', title: 'The Spare Parts Illusion: Demystifying Article 2(5) and Old Stock', category: 'standard', statutes: ['Article 2(5)', 'Article 13'], persona: 'Maintenance Directors & Asset Leads', duration: '13:20', audioUrl: 'https://oxot.ai/audio/cra_podcast/EP_3.01.mp3', summary: 'The legal difference between like-for-like replacement parts and placing newly manufactured spare inventory on the market.' },
    { id: 'EP_6.01', code: 'EP_6.01', title: 'The 24-Hour Early Warning Panic: Operationalizing Article 14', category: 'standard', statutes: ['Article 14', 'Annex I Part II'], persona: 'PSIRT Leads & Incident Responders', duration: '14:55', audioUrl: 'https://oxot.ai/audio/cra_podcast/EP_6.01.mp3', summary: 'Hour-by-hour runbook for filing actively exploited zero-day notifications on the ENISA Single Reporting Platform.' },
    { id: 'EP_7.01', code: 'EP_7.01', title: 'Self-Assessment vs Notified Body: Navigating Modules A, B+C & H', category: 'standard', statutes: ['Article 24', 'Annex VI', 'Annex VII'], persona: 'Quality Directors & Compliance VPs', duration: '15:10', audioUrl: 'https://oxot.ai/audio/cra_podcast/EP_7.01.mp3', summary: 'Conformity assessment matrix determining when internal control (Module A) is legal vs mandatory Notified Body audit.' },
    { id: 'EP_8.01', code: 'EP_8.01', title: 'The €15M Calculation: Demystifying Article 61 Turnover Fines', category: 'standard', statutes: ['Article 61', 'Recital 78'], persona: 'CEOs, CFOs & General Counsel', duration: '14:40', audioUrl: 'https://oxot.ai/audio/cra_podcast/EP_8.01.mp3', summary: 'How European market surveillance calculates the 2.5% global turnover fine and officer liability.' },
    
    // CRA: Truth & Consequences (12 Case Studies)
    { id: 'TC_01', code: 'TC_01', title: 'The Edge-to-Cloud Grey Zone: When Microservices Void Local Controller CE Marks', category: 'truth', statutes: ['Article 3(2)', 'Article 21'], persona: 'Cloud-OT Architects & Plant CISOs', duration: '14:15', audioUrl: 'https://oxot.ai/audio/cra_podcast/TC_01.mp3', summary: 'Shattering the myth that OTA container pushes are purely IT operations. The unvarnished truth on CE mark voidance.' },
    { id: 'TC_02', code: 'TC_02', title: 'The Defunct OEM Dilemma: Who Patches Brownfield OT When the Vendor Goes Bankrupt?', category: 'truth', statutes: ['Article 13(8)', 'NIS2 Article 21'], persona: 'Critical Infrastructure Operators', duration: '13:50', audioUrl: 'https://oxot.ai/audio/cra_podcast/TC_02.mp3', summary: 'Exposing the legal reality: you cannot sue a dead company. How NIS2 shifts 100% of orphan hardware risk to the operator.' },
    { id: 'TC_03', code: 'TC_03', title: 'Autonomous AI & Neural Weights on the Plant Floor: Harmonizing CRA and the EU AI Act', category: 'truth', statutes: ['CRA Annex I', 'EU AI Act 2024/1689'], persona: 'Industrial Robotics Engineers', duration: '14:35', audioUrl: 'https://oxot.ai/audio/cra_podcast/TC_03.mp3', summary: 'Why continuous on-device learning in autonomous mobile robots triggers dual-statute €35M recertification traps.' },
    { id: 'TC_08', code: 'TC_08', title: 'Battery Energy Storage Systems (BESS): Cyber-Physical Fire Risks & Class II Notified Bodies', category: 'truth', statutes: ['Annex III Class II', 'IEC 61508'], persona: 'Grid Battery Developers & Power OEMs', duration: '15:00', audioUrl: 'https://oxot.ai/audio/cra_podcast/TC_08.mp3', summary: 'How BMS firmware vulnerabilities cause thermal runaway battery fires, and why component silo certifications fail.' },
    { id: 'TC_09', code: 'TC_09', title: 'Quantum-Safe Cryptography (PQC): Is Post-Quantum Crypto Now Mandatory for 30-Year MCUs?', category: 'truth', statutes: ['Annex I Part I §1', 'BSI TR-02102'], persona: 'Semiconductor & Embedded Architects', duration: '14:20', audioUrl: 'https://oxot.ai/audio/cra_podcast/TC_09.mp3', summary: 'Why shipping 2027 industrial hardware with static RSA/ECC creates an uninsurable design defect mid-lifecycle.' },
    { id: 'TC_12', code: 'TC_12', title: 'The Insurance Underwriting Reckoning: How CRA Breaches Void Tech E&O and Cyber Policies', category: 'truth', statutes: ['Article 61', 'EU Product Liability Directive'], persona: 'Corporate Risk Officers & Legal Counsel', duration: '14:45', audioUrl: 'https://oxot.ai/audio/cra_podcast/TC_12.mp3', summary: 'How European insurance syndicates use CRA non-compliance to legally deny 100% of corporate cyber claims.' },

    // News Stream (5 Bulletins)
    { id: 'NEWS_01', code: 'NEWS_01', title: 'ENISA Single Reporting Platform 24h Incident Clock Activated', category: 'news', statutes: ['Article 14'], persona: 'PSIRT & Risk Officers', duration: '02:30', audioUrl: 'https://oxot.ai/audio/cra_podcast/NEWS_01.mp3', summary: 'Breaking regulatory update on early warning reporting workflows.' },
    { id: 'NEWS_02', code: 'NEWS_02', title: 'First Batch of Notified Body Designations Announced for Class II Products', category: 'news', statutes: ['Article 41'], persona: 'Quality & Regulatory Leads', duration: '02:45', audioUrl: 'https://oxot.ai/audio/cra_podcast/NEWS_02.mp3', summary: 'Accreditation updates across German, French, and Dutch testing laboratories.' },
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
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      {/* Header & Studio Branding */}
      <div className="max-w-7xl mx-auto mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-700/60 text-cyan-400 text-xs font-mono uppercase tracking-wider mb-3">
              <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
              Autonomous Podcast Studio & Audio Ecosystem
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
              CRA Podcast Studio & Media Cockpit
            </h1>
            <p className="text-slate-400 mt-2 max-w-2xl text-sm md:text-base">
              Manage, stream, search, and syndicate all 67 episodes across the three distinct styles: Standard Solo, News Stream, and CRA: Truth & Consequences.
            </p>
          </div>

          {/* Quick Metrics Badge */}
          <div className="grid grid-cols-3 gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl">
            <div className="text-center px-3 border-r border-slate-800">
              <div className="text-2xl font-bold font-mono text-cyan-400">50</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider mt-0.5">Standard</div>
            </div>
            <div className="text-center px-3 border-r border-slate-800">
              <div className="text-2xl font-bold font-mono text-amber-400">12</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider mt-0.5">Truth & Cons</div>
            </div>
            <div className="text-center px-3">
              <div className="text-2xl font-bold font-mono text-emerald-400">50</div>
              <div className="text-xs text-slate-400 uppercase tracking-wider mt-0.5">SEO Blogs</div>
            </div>
          </div>
        </div>

        {/* Live RSS 2.0 Syndication Bar */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-cyan-950 text-cyan-400 border border-cyan-800">
                <Rss className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Standard Series Feed</div>
                <div className="text-xs font-mono text-slate-200">cra-podcast.xml</div>
              </div>
            </div>
            <button 
              onClick={() => handleCopyFeed('https://oxot.ai/feeds/cra-podcast.xml', 'std')}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors flex items-center gap-1.5"
            >
              {copiedFeed === 'std' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedFeed === 'std' ? 'Copied' : 'Copy'}
            </button>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-amber-950 text-amber-400 border border-amber-800">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Truth & Consequences</div>
                <div className="text-xs font-mono text-slate-200">cra-truth.xml</div>
              </div>
            </div>
            <button 
              onClick={() => handleCopyFeed('https://oxot.ai/feeds/cra-truth.xml', 'tc')}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors flex items-center gap-1.5"
            >
              {copiedFeed === 'tc' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedFeed === 'tc' ? 'Copied' : 'Copy'}
            </button>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-emerald-950 text-emerald-400 border border-emerald-800">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">News Stream Feed</div>
                <div className="text-xs font-mono text-slate-200">cra-news.xml</div>
              </div>
            </div>
            <button 
              onClick={() => handleCopyFeed('https://oxot.ai/feeds/cra-news.xml', 'news')}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 transition-colors flex items-center gap-1.5"
            >
              {copiedFeed === 'news' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedFeed === 'news' ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Controls: Format Tabs + Search */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-900/80 p-3 rounded-2xl border border-slate-800 shadow-lg">
          {/* Format Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'all' 
                  ? 'bg-slate-800 text-white shadow-sm border border-slate-700' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All Assets ({episodes.length})
            </button>
            <button
              onClick={() => setActiveTab('standard')}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
                activeTab === 'standard' 
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-800 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Headphones className="w-3.5 h-3.5" />
              Standard Series (50)
            </button>
            <button
              onClick={() => setActiveTab('truth')}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
                activeTab === 'truth' 
                  ? 'bg-amber-950 text-amber-300 border border-amber-800 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              Truth & Consequences (12)
            </button>
            <button
              onClick={() => setActiveTab('news')}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
                activeTab === 'news' 
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              News Bulletins (5)
            </button>
            <button
              onClick={() => setActiveTab('blogs')}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 ${
                activeTab === 'blogs' 
                  ? 'bg-indigo-950 text-indigo-300 border border-indigo-800 shadow-sm' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              SEO Blog Engine (50)
            </button>
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search episodes, statutes, topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-600 w-64 md:w-80"
              />
            </div>
            <select
              value={selectedPersona}
              onChange={(e) => setSelectedPersona(e.target.value)}
              className="bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-600"
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
              className={`rounded-2xl border transition-all duration-300 p-5 flex flex-col justify-between ${
                ep.category === 'truth' 
                  ? 'bg-slate-900/60 border-amber-900/40 hover:border-amber-700/60' 
                  : ep.category === 'news'
                  ? 'bg-slate-900/60 border-emerald-900/40 hover:border-emerald-700/60'
                  : 'bg-slate-900/60 border-slate-800 hover:border-cyan-800/60'
              } hover:shadow-xl hover:shadow-cyan-950/20`}
            >
              <div>
                {/* Header badges */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold ${
                    ep.category === 'truth'
                      ? 'bg-amber-950/80 text-amber-400 border border-amber-800/60'
                      : ep.category === 'news'
                      ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/60'
                      : 'bg-cyan-950/80 text-cyan-400 border border-cyan-800/60'
                  }`}>
                    {ep.code}
                  </span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{ep.duration}</span>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-semibold text-base text-slate-100 line-clamp-2 leading-snug mb-2">
                  {ep.title}
                </h3>

                {/* Summary */}
                <p className="text-xs text-slate-400 line-clamp-3 mb-4 leading-relaxed">
                  {ep.summary}
                </p>

                {/* Statutes & Persona Tags */}
                <div className="flex flex-wrap items-center gap-1.5 mb-4">
                  {ep.statutes.map((st, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] font-mono text-slate-300">
                      {st}
                    </span>
                  ))}
                  <span className="px-2 py-0.5 rounded-md bg-slate-800/60 text-[10px] text-slate-400 flex items-center gap-1">
                    <User className="w-2.5 h-2.5" />
                    {ep.persona}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                <button
                  onClick={() => togglePlay(ep.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                    isCurrent && isPlaying
                      ? 'bg-amber-500 text-slate-950 shadow-md'
                      : 'bg-cyan-600 hover:bg-cyan-500 text-white'
                  }`}
                >
                  {isCurrent && isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                  {isCurrent && isPlaying ? 'Pause' : 'Play Briefing'}
                </button>

                <div className="flex items-center gap-1">
                  <button 
                    onClick={() => setSelectedScript(ep)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="View Solo Script"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setSelectedBlog(ep)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="View Technical SEO Blog"
                  >
                    <BookOpen className="w-4 h-4" />
                  </button>
                  <a 
                    href={`/conformity/cra-wiki?tab=articles&num=${ep.statutes[0]?.replace(/\D/g, '') || '21'}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
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
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-4xl bg-slate-900/95 border border-cyan-600/40 backdrop-blur-xl rounded-2xl p-4 shadow-2xl z-50 flex items-center justify-between gap-6">
          <div className="flex items-center gap-4 min-w-0">
            <div className="p-3 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800 flex-shrink-0">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="text-[11px] font-mono text-cyan-400">NOW STREAMING • {currentPlaying}</div>
              <div className="text-sm font-semibold text-slate-100 truncate">
                {episodes.find(e => e.id === currentPlaying)?.title}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-shrink-0">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-3 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg transition-transform active:scale-95"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
            </button>
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span>04:15</span>
              <div className="w-32 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-cyan-400 h-full w-[35%]" />
              </div>
              <span>14:00</span>
            </div>
          </div>
        </div>
      )}

      {/* Script View Modal */}
      {selectedScript && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-cyan-400">{selectedScript.code} • Script</span>
                <h2 className="text-xl font-bold text-slate-100">{selectedScript.title}</h2>
              </div>
              <button 
                onClick={() => setSelectedScript(null)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4 text-xs md:text-sm text-slate-300 font-mono bg-slate-950/60 leading-relaxed">
              <p className="text-cyan-400">[HOST: JIM MCKENNEY]</p>
              <p>Welcome back to The Cyber Resilience Act Briefing. I'm Jim Mckenney, digital product security consultant...</p>
              <p className="text-slate-400 italic">"Let's ground our discussion in the exact statutory text of {selectedScript.statutes.join(', ')}..."</p>
              <p>{selectedScript.summary}</p>
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
                <div className="text-xs font-bold text-amber-400 mb-2">4-STEP ACTION CHECKLIST:</div>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  <li>Step 1: Audit active product and component portfolio</li>
                  <li>Step 2: Establish contract safe-harbors with tier-2 suppliers</li>
                  <li>Step 3: Generate and validate CycloneDX SBOMs</li>
                  <li>Step 4: Conduct Article 14 24h CSIRT notification drills</li>
                </ul>
              </div>
            </div>
            <div className="p-4 border-t border-slate-800 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedScript(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Technical Blog Modal */}
      {selectedBlog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-indigo-400">Technical SEO Blog • {selectedBlog.code}</span>
                <h2 className="text-xl font-bold text-slate-100">{selectedBlog.title}</h2>
              </div>
              <button 
                onClick={() => setSelectedBlog(null)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-300 leading-relaxed">
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/60 text-indigo-200 text-xs">
                📖 <strong>SEO Meta Description:</strong> In-depth engineering analysis of {selectedBlog.title} under {selectedBlog.statutes.join(', ')} for {selectedBlog.persona}.
              </div>
              
              <h3 className="text-lg font-bold text-white">1. The Industrial Commercial Dilemma</h3>
              <p>{selectedBlog.summary}</p>
              
              <h3 className="text-lg font-bold text-white">2. Technical Architecture & Purdue Zone Isolation</h3>
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300">
                [Mermaid Diagram: OT Firmware Build -&gt; CycloneDX SBOM -&gt; Code Signing -&gt; CE Nameplate]
              </div>

              <h3 className="text-lg font-bold text-white">3. 4-Step Engineering Action Sprint</h3>
              <ol className="list-decimal list-inside space-y-2 text-slate-300 text-xs md:text-sm">
                <li>Audit every active controller and firmware variant placed on the market.</li>
                <li>Embed formal CRA compliance warranty clauses into tier-2 supplier contracts.</li>
                <li>Store machine-readable SBOMs in an immutable 10-year archive.</li>
                <li>Conduct PSIRT simulation drills for 24h ENISA reporting.</li>
              </ol>
            </div>
            <div className="p-4 border-t border-slate-800 flex justify-end gap-3">
              <button 
                onClick={() => setSelectedBlog(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200"
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
