import React, { useState, useEffect, useMemo } from 'react';
import { 
  Radio, 
  Play, 
  Pause, 
  Volume2, 
  Rss, 
  Search, 
  Filter, 
  BookOpen, 
  ExternalLink, 
  Flame, 
  Zap, 
  Copy, 
  Check, 
  Headphones, 
  Clock, 
  User, 
  ArrowRight, 
  Share2,
  ChevronRight,
  ListOrdered,
  Layers,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  SkipForward,
  Info
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MermaidRenderer } from '@/components/mermaid-renderer';
import { useSeo } from '@/hooks/use-seo';
import { useLocale } from '@/providers/locale-provider';
import { Link } from 'wouter';

interface EpisodeItem {
  id: string;
  code: string;
  seriesId?: number;
  seriesName?: string;
  episodeNumber: number;
  title: string;
  category: 'standard' | 'truth' | 'news';
  statutes: string[];
  persona: string;
  duration: string;
  audioUrl: string;
  summary: string;
  blogSlug: string;
  nextEpisode?: { code: string; title: string; slug?: string } | null;
}

interface SeriesMeta {
  id: number;
  name: string;
  codeRange: string;
  count: number;
}

export default function PodcastHubPage() {
  const { locale } = useLocale();
  
  const [activeFormat, setActiveFormat] = useState<'standard' | 'truth' | 'news'>('standard');
  const [selectedSeriesId, setSelectedSeriesId] = useState<number | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPersona, setSelectedPersona] = useState('ALL');
  
  const [allEpisodes, setAllEpisodes] = useState<{
    standard: EpisodeItem[];
    truth: EpisodeItem[];
    news: EpisodeItem[];
  }>({ standard: [], truth: [], news: [] });
  const [seriesList, setSeriesList] = useState<SeriesMeta[]>([]);
  const [loading, setLoading] = useState(true);

  // Persistent Player state
  const [currentPlaying, setCurrentPlaying] = useState<EpisodeItem | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copiedFeed, setCopiedFeed] = useState<string | null>(null);

  // Integrated Read Guide State
  const [activeGuideModal, setActiveGuideModal] = useState<EpisodeItem | null>(null);
  const [guideContent, setGuideContent] = useState<string | null>(null);
  const [guideLoading, setGuideLoading] = useState(false);

  useSeo({
    title: 'The Cyber Resilience Act Podcast Network | OXOT',
    description: 'Structured, sequential audio briefings, investigative case studies, and regulatory news on EU Regulation 2024/2847 and industrial OT compliance.',
    canonicalUrl: '/podcast',
  });

  useEffect(() => {
    let alive = true;
    fetch('/api/podcast/episodes')
      .then((res) => res.json())
      .then((data) => {
        if (alive && data?.episodes) {
          setAllEpisodes({
            standard: data.episodes.standard || [],
            truth: data.episodes.truth || [],
            news: data.episodes.news || [],
          });
          if (data.series_list) {
            setSeriesList(data.series_list);
          }
        }
      })
      .catch((err) => {
        console.error('Failed to load podcast episodes from API:', err);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const handleCopyFeed = (url: string, key: string) => {
    navigator.clipboard.writeText(url);
    setCopiedFeed(key);
    setTimeout(() => setCopiedFeed(null), 2500);
  };

  // Filter current format items
  const currentFormatList = useMemo(() => {
    if (activeFormat === 'standard') return allEpisodes.standard;
    if (activeFormat === 'truth') return allEpisodes.truth;
    return allEpisodes.news;
  }, [allEpisodes, activeFormat]);

  const filteredEpisodes = useMemo(() => {
    return currentFormatList.filter((ep) => {
      if (activeFormat === 'standard' && selectedSeriesId !== 'ALL' && ep.seriesId !== selectedSeriesId) {
        return false;
      }
      if (selectedPersona !== 'ALL' && !ep.persona.toLowerCase().includes(selectedPersona.toLowerCase())) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          ep.title.toLowerCase().includes(q) ||
          ep.code.toLowerCase().includes(q) ||
          ep.summary.toLowerCase().includes(q) ||
          ep.persona.toLowerCase().includes(q) ||
          ep.statutes.some((s) => s.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [currentFormatList, activeFormat, selectedSeriesId, selectedPersona, searchQuery]);

  const togglePlay = (ep: EpisodeItem) => {
    if (currentPlaying?.code === ep.code) {
      setIsPlaying(!isPlaying);
    } else {
      setCurrentPlaying(ep);
      setIsPlaying(true);
    }
  };

  const playNext = () => {
    if (!currentPlaying) return;
    const currentList = currentFormatList;
    const currentIndex = currentList.findIndex((e) => e.code === currentPlaying.code);
    if (currentIndex >= 0 && currentIndex < currentList.length - 1) {
      const nextEp = currentList[currentIndex + 1];
      setCurrentPlaying(nextEp);
      setIsPlaying(true);
    }
  };

  const openReadGuide = (ep: EpisodeItem) => {
    setActiveGuideModal(ep);
    setGuideLoading(true);
    fetch(`/api/blogs/${encodeURIComponent(ep.code || ep.blogSlug)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.content) setGuideContent(d.content);
        else setGuideContent(null);
      })
      .catch(() => setGuideContent(null))
      .finally(() => setGuideLoading(false));
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <PageHeader
          kicker="AUDIO INTELLIGENCE PLATFORM"
          title="The Cyber Resilience Act Podcast Network"
          description="Structured, sequential audio briefings, investigative myth-busting case studies, and fast-paced regulatory news bulletins on EU Regulation 2024/2847."
        />

        {/* 3 Formats Navigation Tabs */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => { setActiveFormat('standard'); setSelectedSeriesId('ALL'); }}
            className={`p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
              activeFormat === 'standard'
                ? 'bg-primary/10 border-primary text-primary shadow-md ring-1 ring-primary'
                : 'bg-card border-border hover:border-primary/40 text-foreground'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Headphones className="w-5 h-5" />
                <span className="font-bold text-sm">The CRA Briefing</span>
              </div>
              <Badge variant="outline" className="text-[11px] font-mono font-bold bg-background">
                50 Episodes (8 Series)
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Sequential, single-voice technical briefings covering the complete procurement, integration, and conformity lifecycle.
            </p>
          </button>

          <button
            onClick={() => { setActiveFormat('truth'); setSelectedSeriesId('ALL'); }}
            className={`p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
              activeFormat === 'truth'
                ? 'bg-amber-500/10 border-amber-500 text-amber-500 shadow-md ring-1 ring-amber-500'
                : 'bg-card border-border hover:border-amber-500/40 text-foreground'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                <span className="font-bold text-sm">Truth & Consequences</span>
              </div>
              <Badge variant="outline" className="text-[11px] font-mono font-bold bg-background text-amber-500 border-amber-500/30">
                12 Case Studies
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Hard-hitting investigative monologues confronting industry half-truths, orphan OT liabilities, and €15M penalties.
            </p>
          </button>

          <button
            onClick={() => { setActiveFormat('news'); setSelectedSeriesId('ALL'); }}
            className={`p-5 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
              activeFormat === 'news'
                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500 shadow-md ring-1 ring-emerald-500'
                : 'bg-card border-border hover:border-emerald-500/40 text-foreground'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-emerald-500" />
                <span className="font-bold text-sm">The CRA News Stream</span>
              </div>
              <Badge variant="outline" className="text-[11px] font-mono font-bold bg-background text-emerald-500 border-emerald-500/30">
                5 Fast Headlines
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              2-minute executive bulletins on ENISA single-reporting platform deadlines and Notified Body accreditations.
            </p>
          </button>
        </div>

        {/* Series Playlist Navigator (For Standard Series) */}
        {activeFormat === 'standard' && (
          <div className="mt-8 p-5 bg-card border border-border rounded-2xl shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                <ListOrdered className="w-4 h-4 text-primary" />
                <span>Select Series Playlist:</span>
              </div>
              <button
                onClick={() => setSelectedSeriesId('ALL')}
                className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  selectedSeriesId === 'ALL' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Show All 8 Series (50 Episodes)
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {seriesList.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSeriesId(s.id)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    selectedSeriesId === s.id
                      ? 'bg-primary/10 border-primary text-primary shadow-sm font-semibold'
                      : 'bg-muted/40 border-border hover:border-primary/40 hover:bg-muted text-foreground'
                  }`}
                >
                  <div className="flex items-center justify-between text-[11px] font-mono mb-1 text-muted-foreground">
                    <span>Series {s.id}</span>
                    <span>{s.codeRange}</span>
                  </div>
                  <div className="text-xs font-medium leading-snug line-clamp-1">{s.name}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* External RSS Syndication Badges */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 bg-muted/30 p-3 rounded-2xl border border-border">
          <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <Rss className="w-4 h-4 text-amber-500" />
            <span>Apple & Spotify RSS Feeds:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleCopyFeed('https://oxot.ai/feeds/cra-podcast.xml', 'std')}
              className="px-3 py-1.5 rounded-xl bg-card border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copiedFeed === 'std' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              Standard Series RSS
            </button>
            <button
              onClick={() => handleCopyFeed('https://oxot.ai/feeds/cra-truth.xml', 'tc')}
              className="px-3 py-1.5 rounded-xl bg-card border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copiedFeed === 'tc' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              Truth & Consequences RSS
            </button>
            <button
              onClick={() => handleCopyFeed('https://oxot.ai/feeds/cra-news.xml', 'news')}
              className="px-3 py-1.5 rounded-xl bg-card border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              {copiedFeed === 'news' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              News RSS
            </button>
          </div>
        </div>

        {/* Search & Persona Bar */}
        <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold font-mono text-primary">
              {filteredEpisodes.length} Episodes in Current Queue
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search episodes, articles, roles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-card border border-border rounded-xl pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary w-64 md:w-80 shadow-sm"
              />
            </div>
            <Link
              href="/blog"
              className="px-3.5 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              Open Blog Hub
            </Link>
          </div>
        </div>

        {/* Sequential Playlist Grid */}
        <div className="mt-6 space-y-3">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-28 w-full rounded-2xl" />
              ))}
            </div>
          ) : filteredEpisodes.length === 0 ? (
            <div className="text-center py-16 bg-card border border-dashed border-border rounded-3xl">
              <Headphones className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
              <p className="text-sm font-medium text-foreground">No episodes match your search criteria.</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedSeriesId('ALL'); }}
                className="mt-3 text-xs text-primary underline underline-offset-4 cursor-pointer"
              >
                Clear filters and reset queue
              </button>
            </div>
          ) : (
            filteredEpisodes.map((item, idx) => {
              const isCurrent = currentPlaying?.code === item.code;
              return (
                <div
                  key={item.id || item.code}
                  className={`rounded-2xl border p-5 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isCurrent
                      ? 'bg-primary/10 border-primary shadow-md'
                      : 'bg-card border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start gap-4 min-w-0">
                    <button
                      onClick={() => togglePlay(item)}
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform active:scale-95 cursor-pointer shadow-sm ${
                        isCurrent && isPlaying
                          ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                          : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                      }`}
                    >
                      {isCurrent && isPlaying ? (
                        <Pause className="w-5 h-5" />
                      ) : (
                        <Play className="w-5 h-5 fill-current ml-0.5" />
                      )}
                    </button>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="px-2 py-0.5 rounded-md bg-muted text-primary text-[11px] font-mono font-bold border border-border">
                          {item.code}
                        </span>
                        {item.seriesName && (
                          <span className="text-[11px] font-medium text-muted-foreground">
                            {item.seriesName} • #{item.episodeNumber}
                          </span>
                        )}
                        {item.statutes.map((st, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-muted/60 text-[10px] font-mono text-muted-foreground">
                            {st}
                          </span>
                        ))}
                      </div>

                      <h3 className="font-display text-base font-bold text-foreground leading-snug truncate">
                        {item.title}
                      </h3>

                      <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                        {item.summary}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-3 flex-shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-border">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{item.duration}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openReadGuide(item)}
                        className="px-3.5 py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-xs font-semibold text-foreground transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-primary" />
                        Read Guide
                      </button>

                      <Link
                        href={`/wiki/cra`}
                        className="p-2 rounded-xl bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
                        title="Statutory Legal Text"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Persistent Audio Stream Drawer with Queue Next Support */}
      {currentPlaying && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[94%] max-w-4xl bg-card/95 border border-primary/40 backdrop-blur-xl rounded-2xl p-4 shadow-2xl z-50 flex items-center justify-between gap-4 animate-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20 flex-shrink-0">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-mono font-bold text-primary">
                NOW PLAYING • {currentPlaying.code} ({currentPlaying.seriesName || currentPlaying.category})
              </div>
              <div className="text-sm font-semibold text-foreground truncate">
                {currentPlaying.title}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-3 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-transform active:scale-95 cursor-pointer"
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
            </button>

            <button
              onClick={playNext}
              className="p-2.5 rounded-xl bg-muted hover:bg-muted/80 text-foreground transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
              title="Play Next Episode in Queue"
            >
              <SkipForward className="w-4 h-4" />
              <span className="hidden sm:inline">Next</span>
            </button>

            <button
              onClick={() => setCurrentPlaying(null)}
              className="p-2 rounded-xl bg-muted text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Integrated Read Guide Modal with Real Generated Blog & Lead Funnel */}
      {activeGuideModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-6 border-b border-border flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-mono font-bold">
                    {activeGuideModal.code}
                  </span>
                  {activeGuideModal.statutes.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-muted text-[11px] font-mono text-muted-foreground">
                      {s}
                    </span>
                  ))}
                  <span className="text-xs text-muted-foreground">· 8 min read</span>
                </div>
                <h2 className="text-xl md:text-2xl font-display font-bold text-foreground leading-tight">
                  {activeGuideModal.title}
                </h2>
              </div>
              <button
                onClick={() => setActiveGuideModal(null)}
                className="p-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-6 text-sm text-foreground leading-relaxed font-sans">
              <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-foreground text-xs leading-relaxed">
                🎯 <strong>Target Role:</strong> {activeGuideModal.persona}. This technical engineering briefing breaks down statutory duties and architectural implementation under {activeGuideModal.statutes.join(', ')}.
              </div>

              <div>
                <h3 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-mono">1</span>
                  The Commercial Dilemma & Industrial Reality
                </h3>
                <div className="space-y-2.5 text-xs md:text-sm text-muted-foreground leading-relaxed">
                  {activeGuideModal.summary
                    .split('\n')
                    .map(l => l.trim())
                    .filter(Boolean)
                    .map((para, pIdx) => {
                      if (para.match(/^\d+\./)) {
                        const num = para.match(/^(\d+)\./)?.[1] || '•';
                        const text = para.replace(/^\d+\.\s*/, '');
                        return (
                          <div key={pIdx} className="p-3 rounded-xl bg-card border border-border/80 text-foreground flex items-start gap-3 shadow-xs">
                            <span className="w-5 h-5 rounded-md bg-primary/15 text-primary font-mono text-[11px] flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                              {num}
                            </span>
                            <span className="text-xs text-foreground/90 leading-relaxed font-sans">{text}</span>
                          </div>
                        );
                      }
                      return <p key={pIdx} className="text-muted-foreground leading-relaxed">{para}</p>;
                    })}
                </div>
              </div>

              <div>
                <h3 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-mono">2</span>
                  Reference Architecture & Technical Implementation
                </h3>
                <MermaidRenderer 
                  chart={
                    (guideContent && guideContent.match(/```mermaid\s*\n([\s\S]*?)\n```/)?.[1]?.trim()) ||
                    (activeGuideModal.category === 'truth'
                      ? `graph LR
    subgraph VoidedPath["The Shadow Cloud Trap"]
        A1["Brownfield Controller"] --> B1["Unsigned OTA Cloud Push"]
        B1 --> C1["Substantial Modification (Art 21)"]
        C1 --> D1["CE Declaration Legally Voided"]
    end
    
    subgraph CompliantPath["The Defensible Framework"]
        A2["Controlled Firmware Build"] --> B2["Formal Modification Review"]
        B2 --> C2["Updated Annex VII Technical File"]
        C2 --> D2["Re-issued CE Declaration of Conformity"]
    end`
                      : `graph TD
    A["Raw OT Firmware / Source Code"] --> B["Automated CI/CD Build Pipeline"]
    B --> C["CycloneDX v1.6 Machine-Readable SBOM"]
    C --> D["Cryptographic Code Signing (Hardware HSM)"]
    D --> E["Annex VII Technical Dossier Archive (10-Year)"]
    E --> F["CE Marking Declaration & Field Deployment"]`)
                  }
                />
              </div>

              <div>
                <h3 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-mono">3</span>
                  Mandatory 4-Step Engineering Checklist
                </h3>
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-card border border-border flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-xs text-foreground">Step 1: Scope & Classification Audit</strong>
                      <p className="text-[11px] text-muted-foreground">Catalog all firmware variants and verify whether internal control (Module A) or third-party audit (Annex VII) applies.</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-card border border-border flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-xs text-foreground">Step 2: Sub-tier Supplier Safe-Harbors</strong>
                      <p className="text-[11px] text-muted-foreground">Embed mandatory Article 13 & 21 warranty pass-through clauses into all tier-2 hardware contracts.</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-card border border-border flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-xs text-foreground">Step 3: Immutable 10-Year SBOM Vault</strong>
                      <p className="text-[11px] text-muted-foreground">Archive machine-readable CycloneDX SBOMs and signed hashes for market surveillance inspections.</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-card border border-border flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-xs text-foreground">Step 4: 24h CSIRT Incident Drills</strong>
                      <p className="text-[11px] text-muted-foreground">Simulate actively exploited zero-day reporting to the ENISA Single Reporting Platform within the mandatory 24-hour statutory window.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* High-Converting Lead Gen Funnel Box */}
              <div className="p-5 rounded-2xl bg-gradient-to-r from-primary/20 via-primary/10 to-card border border-primary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-foreground">Need help auditing this module for CRA compliance?</h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Schedule a 45-minute technical portfolio walkthrough with Jim McKenney.
                  </p>
                </div>
                <Link
                  href="/demo"
                  className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold flex items-center gap-1.5 flex-shrink-0 shadow-md"
                >
                  Book a Demo <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Modal Footer with Next in Series Navigation */}
            <div className="p-4 border-t border-border flex flex-wrap items-center justify-between gap-3 bg-muted/20">
              <button
                onClick={() => {
                  togglePlay(activeGuideModal);
                }}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Listen to Audio ({activeGuideModal.duration})
              </button>

              <div className="flex items-center gap-2">
                {activeGuideModal.nextEpisode && (
                  <button
                    onClick={() => {
                      const next = currentFormatList.find(e => e.code === activeGuideModal.nextEpisode?.code);
                      if (next) openReadGuide(next);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-card border border-border hover:border-primary/50 text-xs font-semibold text-foreground flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Next: {activeGuideModal.nextEpisode.code}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-primary" />
                  </button>
                )}

                <button
                  onClick={() => setActiveGuideModal(null)}
                  className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-xs font-medium text-foreground cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
