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
  ArrowRight,
  Share2
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { useSeo } from '@/hooks/use-seo';
import { useLocale } from '@/providers/locale-provider';
import { Link } from 'wouter';

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
  blogSlug: string;
}

export default function PodcastAndBlogsPage() {
  const { locale } = useLocale();
  const [activeTab, setActiveTab] = useState<'all' | 'blogs' | 'standard' | 'truth' | 'news'>('blogs');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPersona, setSelectedPersona] = useState('ALL');
  const [currentPlaying, setCurrentPlaying] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copiedFeed, setCopiedFeed] = useState<string | null>(null);
  const [selectedBlog, setSelectedBlog] = useState<Episode | null>(null);

  useSeo({
    title: 'The Cyber Resilience Act Podcast & Technical Blog Hub | OXOT',
    description: 'Authoritative single-voice podcast briefings, hard-hitting investigative case studies, and long-form engineering guides on EU Regulation 2024/2847 and IEC 62443.',
    canonicalUrl: '/podcast',
  });

  const episodes: Episode[] = useMemo(() => [
    // Standard Solo Series
    { id: 'EP_1.01', code: 'EP_1.01', title: 'The 2-Year Lag: Why 2024 Contracts Are Walking into a 2027 Regulatory Trap', category: 'standard', statutes: ['Article 2', 'Article 71'], persona: 'EPC Contractors & Planners', duration: '13:45', audioUrl: 'https://oxot.ai/audio/cra_podcast/EP_1.01.mp3', blogSlug: 'the-2-year-lag-why-2024-contracts-are-walking-into-a-2027-re', summary: 'Why industrial turnkey contracts signed with 2-year build phases result in non-compliant 2027 handover liabilities.' },
    { id: 'EP_1.02', code: 'EP_1.02', title: 'Writing the Bulletproof CRA RFP: Specification Language for Asset Owners', category: 'standard', statutes: ['Article 13', 'Annex I Part I'], persona: 'Procurement Directors & CISOs', duration: '14:10', audioUrl: 'https://oxot.ai/audio/cra_podcast/EP_1.02.mp3', blogSlug: 'writing-the-bulletproof-cra-rfp-specification-language-for-a', summary: 'Contractual clauses mandating 10-year SBOM archives, vulnerability patch SLAs, and secure boot proof.' },
    { id: 'EP_2.01', code: 'EP_2.01', title: 'The Accidental Manufacturer: How System Integrators Trigger Article 21', category: 'standard', statutes: ['Article 21', 'Recital 24'], persona: 'Industrial Integrators (Axians/Spie)', duration: '14:30', audioUrl: 'https://oxot.ai/audio/cra_podcast/EP_2.01.mp3', blogSlug: 'the-accidental-manufacturer-how-system-integrators-trigger-a', summary: 'When modifying custom PLC logic or integrating multi-vendor skids reclassifies an EPC as the legal CRA manufacturer.' },
    { id: 'EP_2.04', code: 'EP_2.04', title: 'The Axians Case Study: Building a Multi-Plant CRA Modernization Pipeline', category: 'standard', statutes: ['Article 21', 'Annex VII'], persona: 'Enterprise OT Architects', duration: '15:20', audioUrl: 'https://oxot.ai/audio/cra_podcast/EP_2.04.mp3', blogSlug: 'the-axians-case-study-building-a-multi-plant-cra-modernizati', summary: 'End-to-end walkthrough of a 5-stage brownfield plant modernization across 14 European operating sites.' },
    { id: 'EP_3.01', code: 'EP_3.01', title: 'The Spare Parts Illusion: Demystifying Article 2(5) and Old Stock', category: 'standard', statutes: ['Article 2(5)', 'Article 13'], persona: 'Maintenance Directors & Asset Leads', duration: '13:20', audioUrl: 'https://oxot.ai/audio/cra_podcast/EP_3.01.mp3', blogSlug: 'the-spare-parts-illusion-demystifying-article-26--recital-29', summary: 'The legal difference between like-for-like replacement parts and placing newly manufactured spare inventory on the market.' },
    { id: 'EP_6.01', code: 'EP_6.01', title: 'The 24-Hour Early Warning Panic: Operationalizing Article 14', category: 'standard', statutes: ['Article 14', 'Annex I Part II'], persona: 'PSIRT Leads & Incident Responders', duration: '14:55', audioUrl: 'https://oxot.ai/audio/cra_podcast/EP_6.01.mp3', blogSlug: 'the-24-hour-early-warning-panic-operationalizing-the-enisa-s', summary: 'Hour-by-hour runbook for filing actively exploited zero-day notifications on the ENISA Single Reporting Platform.' },
    { id: 'EP_7.01', code: 'EP_7.01', title: 'Self-Assessment vs Notified Body: Navigating Modules A, B+C & H', category: 'standard', statutes: ['Article 24', 'Annex VI', 'Annex VII'], persona: 'Quality Directors & Compliance VPs', duration: '15:10', audioUrl: 'https://oxot.ai/audio/cra_podcast/EP_7.01.mp3', blogSlug: 'self-assessment-vs-notified-body-navigating-modules-a-bc-and', summary: 'Conformity assessment matrix determining when internal control (Module A) is legal vs mandatory Notified Body audit.' },
    { id: 'EP_8.01', code: 'EP_8.01', title: 'The €15M Calculation: Demystifying Article 61 Turnover Fines', category: 'standard', statutes: ['Article 61', 'Recital 78'], persona: 'CEOs, CFOs & General Counsel', duration: '14:40', audioUrl: 'https://oxot.ai/audio/cra_podcast/EP_8.01.mp3', blogSlug: 'the-15000000-calculation-demystifying-article-61-administrat', summary: 'How European market surveillance calculates the 2.5% global turnover fine and officer liability.' },

    // Truth & Consequences
    { id: 'TC_01', code: 'TC_01', title: 'The Edge-to-Cloud Grey Zone: When Microservices Void Local Controller CE Marks', category: 'truth', statutes: ['Article 3(2)', 'Article 21'], persona: 'Cloud-OT Architects & Plant CISOs', duration: '14:15', audioUrl: 'https://oxot.ai/audio/cra_podcast/TC_01.mp3', blogSlug: 'tc-01-the-edge-to-cloud-grey-zone', summary: 'Shattering the myth that OTA container pushes are purely IT operations. The unvarnished truth on CE mark voidance.' },
    { id: 'TC_02', code: 'TC_02', title: 'The Defunct OEM Dilemma: Who Patches Brownfield OT When the Vendor Goes Bankrupt?', category: 'truth', statutes: ['Article 13(8)', 'NIS2 Article 21'], persona: 'Critical Infrastructure Operators', duration: '13:50', audioUrl: 'https://oxot.ai/audio/cra_podcast/TC_02.mp3', blogSlug: 'tc-02-the-defunct-oem-dilemma', summary: 'Exposing the legal reality: you cannot sue a dead company. How NIS2 shifts 100% of orphan hardware risk to the operator.' },
    { id: 'TC_03', code: 'TC_03', title: 'Autonomous AI & Neural Weights on the Plant Floor: Harmonizing CRA and the EU AI Act', category: 'truth', statutes: ['CRA Annex I', 'EU AI Act 2024/1689'], persona: 'Industrial Robotics Engineers', duration: '14:35', audioUrl: 'https://oxot.ai/audio/cra_podcast/TC_03.mp3', blogSlug: 'tc-03-autonomous-ai-and-neural-weights', summary: 'Why continuous on-device learning in autonomous mobile robots triggers dual-statute €35M recertification traps.' },
    { id: 'TC_08', code: 'TC_08', title: 'Battery Energy Storage Systems (BESS): Cyber-Physical Fire Risks & Class II Notified Bodies', category: 'truth', statutes: ['Annex III Class II', 'IEC 61508'], persona: 'Grid Battery Developers & Power OEMs', duration: '15:00', audioUrl: 'https://oxot.ai/audio/cra_podcast/TC_08.mp3', blogSlug: 'tc-08-battery-energy-storage-systems', summary: 'How BMS firmware vulnerabilities cause thermal runaway battery fires, and why component silo certifications fail.' },
    { id: 'TC_12', code: 'TC_12', title: 'The Insurance Underwriting Reckoning: How CRA Breaches Void Tech E&O and Cyber Policies', category: 'truth', statutes: ['Article 61', 'EU Product Liability Directive'], persona: 'Corporate Risk Officers & Legal Counsel', duration: '14:45', audioUrl: 'https://oxot.ai/audio/cra_podcast/TC_12.mp3', blogSlug: 'tc-12-the-insurance-underwriting-reckoning', summary: 'How European insurance syndicates use CRA non-compliance to legally deny 100% of corporate cyber claims.' },

    // News Bulletins
    { id: 'NEWS_01', code: 'NEWS_01', title: 'ENISA Single Reporting Platform 24h Incident Clock Activated', category: 'news', statutes: ['Article 14'], persona: 'PSIRT & Risk Officers', duration: '02:30', audioUrl: 'https://oxot.ai/audio/cra_podcast/NEWS_01.mp3', blogSlug: 'news-01-enisa-single-reporting-platform', summary: 'Breaking regulatory update on early warning reporting workflows.' },
    { id: 'NEWS_02', code: 'NEWS_02', title: 'First Batch of Notified Body Designations Announced for Class II Products', category: 'news', statutes: ['Article 41'], persona: 'Quality & Regulatory Leads', duration: '02:45', audioUrl: 'https://oxot.ai/audio/cra_podcast/NEWS_02.mp3', blogSlug: 'news-02-first-batch-notified-bodies', summary: 'Accreditation updates across German, French, and Dutch testing laboratories.' },
    { id: 'NEWS_05', code: 'NEWS_05', title: 'Standardization Mandate M/606 Timeline Update: EN 40000 First Drafts Released', category: 'news', statutes: ['Article 34', 'M/606'], persona: 'Standards & Compliance Architects', duration: '03:15', audioUrl: 'https://oxot.ai/audio/cra_podcast/NEWS_05.mp3', blogSlug: 'news-05-mandate-m606-timeline-update', summary: 'CEN/CENELEC JTC 13 WG 9 releases draft horizontal standards.' }
  ], []);

  const handleCopyFeed = (url: string, key: string) => {
    navigator.clipboard.writeText(url);
    setCopiedFeed(key);
    setTimeout(() => setCopiedFeed(null), 2500);
  };

  const filteredItems = useMemo(() => {
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
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <PageHeader
          kicker="KNOWLEDGE & MEDIA HUB"
          title="The Cyber Resilience Act Podcast & Engineering Guides"
          description="Direct, no-FUD regulatory briefings, hard-hitting case studies, and long-form technical guides on EU Regulation 2024/2847 and industrial OT compliance."
        />

        {/* External Syndication Badges */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                <Rss className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-medium">Standard Podcast Feed</div>
                <div className="text-xs font-mono font-semibold text-foreground">cra-podcast.xml</div>
              </div>
            </div>
            <button 
              onClick={() => handleCopyFeed('https://oxot.ai/feeds/cra-podcast.xml', 'std')}
              className="px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-xs font-medium text-foreground transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copiedFeed === 'std' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedFeed === 'std' ? 'Copied' : 'Copy RSS'}
            </button>
          </div>

          <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Flame className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-medium">Truth & Consequences</div>
                <div className="text-xs font-mono font-semibold text-foreground">cra-truth.xml</div>
              </div>
            </div>
            <button 
              onClick={() => handleCopyFeed('https://oxot.ai/feeds/cra-truth.xml', 'tc')}
              className="px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-xs font-medium text-foreground transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copiedFeed === 'tc' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedFeed === 'tc' ? 'Copied' : 'Copy RSS'}
            </button>
          </div>

          <div className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground font-medium">News Bulletins</div>
                <div className="text-xs font-mono font-semibold text-foreground">cra-news.xml</div>
              </div>
            </div>
            <button 
              onClick={() => handleCopyFeed('https://oxot.ai/feeds/cra-news.xml', 'news')}
              className="px-3 py-1.5 rounded-lg bg-muted hover:bg-muted/80 text-xs font-medium text-foreground transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copiedFeed === 'news' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              {copiedFeed === 'news' ? 'Copied' : 'Copy RSS'}
            </button>
          </div>
        </div>

        {/* Filter Bar & Search */}
        <div className="mt-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-card p-3 rounded-2xl border border-border shadow-sm">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setActiveTab('blogs')}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'blogs' 
                  ? 'bg-primary text-primary-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Technical Guides ({episodes.length})
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
              Standard Series
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
              Truth & Consequences
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
              News Bulletins
            </button>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search topics, articles, personas..."
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
              <option value="EPC">EPC & Integrators</option>
              <option value="Procurement">Procurement</option>
              <option value="PSIRT">PSIRT & Responders</option>
              <option value="Quality">Quality & Testing</option>
              <option value="CEO">Executives & Legal</option>
            </select>
          </div>
        </div>

        {/* Content Cards Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
            const isCurrent = currentPlaying === item.id;
            return (
              <div 
                key={item.id}
                className="rounded-2xl border border-border bg-card p-6 flex flex-col justify-between hover:border-primary/60 hover:shadow-lg transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold ${
                      item.category === 'truth'
                        ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        : item.category === 'news'
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                        : 'bg-primary/10 text-primary border border-primary/20'
                    }`}>
                      {item.code}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{item.duration}</span>
                    </div>
                  </div>

                  <h3 className="font-bold text-base text-foreground leading-snug mb-2 line-clamp-2">
                    {item.title}
                  </h3>

                  <p className="text-xs text-muted-foreground line-clamp-3 mb-4 leading-relaxed">
                    {item.summary}
                  </p>

                  <div className="flex flex-wrap items-center gap-1.5 mb-4">
                    {item.statutes.map((st, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-muted/60 border border-border text-[10px] font-mono text-muted-foreground">
                        {st}
                      </span>
                    ))}
                    <span className="px-2 py-0.5 rounded-md bg-muted text-[10px] text-muted-foreground flex items-center gap-1">
                      <User className="w-2.5 h-2.5" />
                      {item.persona}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border flex items-center justify-between gap-2">
                  <button
                    onClick={() => togglePlay(item.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                      isCurrent && isPlaying
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                    }`}
                  >
                    {isCurrent && isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    {isCurrent && isPlaying ? 'Pause' : 'Stream Audio'}
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedBlog(item)}
                      className="px-3 py-2 rounded-xl bg-muted hover:bg-muted/80 text-xs font-medium text-foreground transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      Read Guide
                    </button>
                    <Link
                      href={`/wiki/cra`}
                      className="p-2 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
                      title="Open Statutory Wiki"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Persistent Audio Stream Drawer */}
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
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-3 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
            </button>
          </div>
        </div>
      )}

      {/* Full Technical Guide Reading Modal */}
      {selectedBlog && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl max-w-4xl w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-primary font-semibold">Technical Guide • {selectedBlog.code}</span>
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
              <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-foreground text-xs">
                📖 <strong>Executive Summary:</strong> Definitive engineering and compliance breakdown of {selectedBlog.title} under {selectedBlog.statutes.join(', ')} for {selectedBlog.persona}.
              </div>
              
              <h3 className="text-lg font-bold text-foreground">1. The Industrial Commercial Dilemma</h3>
              <p className="text-muted-foreground">{selectedBlog.summary}</p>
              
              <h3 className="text-lg font-bold text-foreground">2. Reference Architecture & CI/CD SBOM Pipeline</h3>
              <div className="p-4 rounded-xl bg-muted/40 border border-border font-mono text-xs text-primary">
                [Mermaid Diagram: OT Firmware Build -&gt; CycloneDX SBOM -&gt; Code Signing -&gt; CE Nameplate]
              </div>

              <h3 className="text-lg font-bold text-foreground">3. 4-Step Action Checklist</h3>
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
