import React, { useEffect, useState, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  Radio, 
  Clock, 
  User, 
  ExternalLink, 
  Play, 
  Pause, 
  FileText, 
  CheckCircle2, 
  Flame, 
  Zap, 
  ShieldCheck, 
  ArrowRight, 
  Share2, 
  Copy, 
  Check, 
  ChevronRight,
  Filter,
  Layers,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useSeo } from '@/hooks/use-seo';
import { useLocale } from '@/providers/locale-provider';
import { Link } from 'wouter';

interface BlogPost {
  id: string;
  slug: string;
  filename: string;
  title: string;
  subtitle?: string;
  code: string;
  statutes: string[];
  persona: string;
  series: string;
  readTime: string;
  duration: string;
  audioUrl: string;
  summary: string;
  publishedAt: string;
  keywords: string[];
}

const copy = {
  en: {
    seoTitle: 'CRA Technical Engineering Guides & Research Blogs | OXOT',
    seoDescription: 'Authoritative, in-depth technical guides, statutory cross-examinations, and compliance checklists on EU Regulation 2024/2847 and IEC 62443.',
    kicker: 'TECHNICAL ENGINEERING CORPUS',
    title: 'CRA Engineering & Compliance Guides',
    description: 'A comprehensive, searchable corpus of 50 in-depth technical guides, architectural blueprints, and statutory analyses for industrial OT manufacturers, EPC integrators, and asset owners complying with the EU Cyber Resilience Act.',
    live: 'Live Corpus',
    loading: 'Loading guides…',
    guideSingular: 'guide',
    guidePlural: 'guides',
    corpusSuffix: 'published in the corpus',
    empty: 'No engineering guides match your search criteria.',
    searchPlaceholder: 'Search articles, statutory articles (e.g. Article 21), personas, or keywords…',
    readGuide: 'Read Technical Guide',
    streamBriefing: 'Stream Briefing',
    statutoryRef: 'Statutory Reference',
  },
  nl: {
    seoTitle: 'CRA Technische Handleidingen & Blogs | OXOT',
    seoDescription: 'Gezaghebbende, diepgaande technische gidsen, juridische analyses en compliance-checklists voor EU-verordening 2024/2847 en IEC 62443.',
    kicker: 'TECHNISCH ONTWIKKELAARS- EN COMPLIANCECORPUS',
    title: 'CRA Technische & Juridische Gidsen',
    description: 'Een doorzoekbaar corpus van 50 diepgaande technische gidsen, architectuurblauwdrukken en wettelijke analyses voor industriële OT-fabrikanten, systeemintegratoren en eigenaren van installaties conform de Cyber Resilience Act.',
    live: 'Live corpus',
    loading: 'Gidsen laden…',
    guideSingular: 'gids',
    guidePlural: 'gidsen',
    corpusSuffix: 'gepubliceerd in het corpus',
    empty: 'Geen technische gidsen gevonden die voldoen aan uw zoekopdracht.',
    searchPlaceholder: 'Zoek artikelen, wetsartikelen (bijv. Artikel 21), doelgroepen of trefwoorden…',
    readGuide: 'Lees technische gids',
    streamBriefing: 'Beluister samenvatting',
    statutoryRef: 'Wettelijke referentie',
  }
} as const;

export default function BlogHubPage() {
  const { locale } = useLocale();
  const t = copy[locale];

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPersona, setSelectedPersona] = useState('ALL');
  const [selectedSeries, setSelectedSeries] = useState('ALL');
  const [activePostModal, setActivePostModal] = useState<BlogPost | null>(null);
  const [activeAudio, setActiveAudio] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  useSeo({
    title: t.seoTitle,
    description: t.seoDescription,
    canonicalPath: '/blog',
  });

  useEffect(() => {
    let alive = true;
    fetch('/api/blogs')
      .then((res) => res.json())
      .then((data) => {
        if (alive && data?.items) {
          setPosts(data.items);
        }
      })
      .catch((err) => {
        console.error('Failed to load blog corpus:', err);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      if (selectedPersona !== 'ALL' && !p.persona.toLowerCase().includes(selectedPersona.toLowerCase())) {
        return false;
      }
      if (selectedSeries !== 'ALL' && !p.series.toLowerCase().includes(selectedSeries.toLowerCase())) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q) ||
          p.summary.toLowerCase().includes(q) ||
          p.persona.toLowerCase().includes(q) ||
          p.statutes.some((s) => s.toLowerCase().includes(q)) ||
          p.keywords.some((k) => k.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [posts, searchQuery, selectedPersona, selectedSeries]);

  const togglePlayAudio = (id: string) => {
    if (activeAudio === id) {
      setIsPlaying(!isPlaying);
    } else {
      setActiveAudio(id);
      setIsPlaying(true);
    }
  };

  const handleCopyLink = (slug: string) => {
    navigator.clipboard.writeText(`https://oxot.ai/blog/${slug}`);
    setCopiedSlug(slug);
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 md:py-16 max-w-6xl font-sans">
      {/* Header */}
      <PageHeader
        kicker={t.kicker}
        title={t.title}
        icon={BookOpen}
        description={t.description}
      />

      {/* Live Corpus Counter & Quick Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-6 mb-8">
        <div className="flex items-center gap-2">
          <Badge className="gap-1.5 bg-primary/10 text-primary border border-primary/20 font-semibold px-3 py-1 text-xs">
            <Radio className="h-3.5 w-3.5 animate-pulse text-primary" /> {t.live}
          </Badge>
          <span className="text-sm font-medium text-muted-foreground">
            {loading ? t.loading : `${filteredPosts.length} ${filteredPosts.length === 1 ? t.guideSingular : t.guidePlural} ${t.corpusSuffix}`}
          </span>
        </div>

        {/* Global Search Bar */}
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={t.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
          />
        </div>
      </div>

      {/* Filter Tabs Row */}
      <div className="flex flex-wrap items-center gap-2 mb-8 bg-muted/40 p-2 rounded-2xl border border-border">
        <div className="flex items-center gap-1 text-xs font-semibold text-muted-foreground px-2 py-1">
          <Filter className="w-3.5 h-3.5" /> Personas:
        </div>
        {[
          { key: 'ALL', label: 'All Roles' },
          { key: 'EPC', label: 'EPC & Integrators' },
          { key: 'Procurement', label: 'Procurement & Legal' },
          { key: 'PSIRT', label: 'PSIRT & Incident Response' },
          { key: 'Quality', label: 'Quality & Notified Bodies' },
          { key: 'CISO', label: 'Plant CISOs & Asset Owners' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedPersona(tab.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
              selectedPersona === tab.key
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/80'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Blog Cards Listing */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-36 w-full rounded-2xl" />
          ))}
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="text-center py-16 bg-card border border-dashed border-border rounded-3xl">
          <BookOpen className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium text-foreground">{t.empty}</p>
          <button
            onClick={() => { setSearchQuery(''); setSelectedPersona('ALL'); }}
            className="mt-3 text-xs text-primary underline underline-offset-4 cursor-pointer"
          >
            Clear filters and show all 50 guides
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPosts.map((post) => {
            const isThisAudioPlaying = activeAudio === post.code && isPlaying;
            return (
              <article
                key={post.id}
                className="group rounded-2xl border border-border bg-card p-6 hover:border-primary/50 hover:shadow-md transition-all duration-200"
              >
                {/* Meta Top Line */}
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-primary/10 text-primary border border-primary/20 text-xs font-mono font-bold">
                      {post.code}
                    </span>

                    {post.statutes.map((st, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-muted text-[11px] font-mono text-muted-foreground border border-border"
                      >
                        {st}
                      </span>
                    ))}

                    <span className="flex items-center gap-1 text-xs text-muted-foreground ml-1">
                      <User className="w-3 h-3 text-primary/70" />
                      <span className="font-medium text-foreground">{post.persona}</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {post.readTime}
                    </span>
                    <span className="text-border">|</span>
                    <span className="font-mono text-[11px] text-muted-foreground">{post.publishedAt}</span>
                  </div>
                </div>

                {/* Title */}
                <h2 
                  onClick={() => setActivePostModal(post)}
                  className="font-display text-lg md:text-xl font-bold tracking-tight text-foreground leading-snug mb-2 group-hover:text-primary transition-colors cursor-pointer"
                >
                  {post.title}
                </h2>

                {/* Dense Summary */}
                <p className="text-xs md:text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                  {post.summary}
                </p>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-border flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActivePostModal(post)}
                      className="px-3.5 py-1.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      {t.readGuide}
                    </button>

                    <button
                      onClick={() => togglePlayAudio(post.code)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isThisAudioPlaying
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                          : 'bg-muted hover:bg-muted/80 text-foreground'
                      }`}
                    >
                      {isThisAudioPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                      {isThisAudioPlaying ? 'Pause Audio' : t.streamBriefing}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/wiki/cra`}
                      className="px-3 py-1.5 rounded-xl bg-muted/60 hover:bg-muted text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
                    >
                      <ExternalLink className="w-3 h-3" />
                      {t.statutoryRef}
                    </Link>

                    <button
                      onClick={() => handleCopyLink(post.slug)}
                      className="p-2 rounded-xl bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      title="Copy Share Link"
                    >
                      {copiedSlug === post.slug ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Share2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Floating Audio Streamer */}
      {activeAudio && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-3xl bg-card/95 border border-primary/40 backdrop-blur-xl rounded-2xl p-4 shadow-2xl z-50 flex items-center justify-between gap-4 animate-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Radio className="w-4 h-4 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-mono font-bold text-primary">NOW STREAMING BRIEFING • {activeAudio}</div>
              <div className="text-xs font-semibold text-foreground truncate">
                {posts.find((p) => p.code === activeAudio)?.title}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2.5 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-transform active:scale-95 cursor-pointer"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
            </button>
            <button
              onClick={() => setActiveAudio(null)}
              className="p-2 rounded-xl bg-muted text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Deep In-Depth Technical Guide Reader Modal */}
      {activePostModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="p-6 border-b border-border flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-mono font-bold">
                    {activePostModal.code}
                  </span>
                  {activePostModal.statutes.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 rounded-md bg-muted text-[11px] font-mono text-muted-foreground">
                      {s}
                    </span>
                  ))}
                  <span className="text-xs text-muted-foreground">· {activePostModal.readTime}</span>
                </div>
                <h2 className="text-xl md:text-2xl font-display font-bold text-foreground leading-tight">
                  {activePostModal.title}
                </h2>
              </div>
              <button
                onClick={() => setActivePostModal(null)}
                className="p-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-6 text-sm text-foreground leading-relaxed font-sans">
              <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 text-foreground text-xs leading-relaxed">
                🎯 <strong>Target Persona & Context:</strong> Prepared specifically for {activePostModal.persona}. This technical memorandum analyzes statutory liabilities, engineering refactor workflows, and mandatory technical documentation under {activePostModal.statutes.join(', ')}.
              </div>

              <div>
                <h3 className="text-base font-bold text-foreground mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-mono">1</span>
                  The Commercial Dilemma & Industrial Reality
                </h3>
                <p className="text-muted-foreground leading-relaxed text-xs md:text-sm">
                  {activePostModal.summary}
                </p>
              </div>

              <div>
                <h3 className="text-base font-bold text-foreground mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-mono">2</span>
                  Reference Architecture & Technical Implementation
                </h3>
                <div className="p-4 rounded-xl bg-muted/60 border border-border font-mono text-xs text-primary leading-loose">
                  [CI/CD Build Pipeline] ➔ [CycloneDX v1.6 SBOM Engine] ➔ [Hardware Root of Trust Signing] ➔ [Annex VII CE Archive (10-Year)]
                </div>
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
                      <strong className="text-xs text-foreground">Step 1: Statutory Scope & Classification Audit</strong>
                      <p className="text-[11px] text-muted-foreground">Map all firmware dependencies and determine whether internal control (Module A) or third-party audit (Annex VII) applies.</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-card border border-border flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-xs text-foreground">Step 2: Sub-tier Supplier Contract Safe-Harbors</strong>
                      <p className="text-[11px] text-muted-foreground">Embed mandatory Article 13 & 21 warranty pass-through terms for all third-party industrial components.</p>
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-card border border-border flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <strong className="text-xs text-foreground">Step 3: Immutable 10-Year SBOM & Vulnerability Vault</strong>
                      <p className="text-[11px] text-muted-foreground">Publish machine-readable VEX feeds and archive cryptographic hashes for market surveillance inspections.</p>
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
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border flex items-center justify-between gap-3 bg-muted/20">
              <button
                onClick={() => togglePlayAudio(activePostModal.code)}
                className="px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                Listen to Full Episode ({activePostModal.duration})
              </button>

              <div className="flex items-center gap-2">
                <Link
                  href={`/wiki/cra`}
                  className="px-3 py-2 rounded-xl bg-muted hover:bg-muted/80 text-xs font-medium text-foreground transition-colors flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  View Official Legal Text
                </Link>
                <button
                  onClick={() => setActivePostModal(null)}
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
