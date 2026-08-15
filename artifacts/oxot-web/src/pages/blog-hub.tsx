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
  ChevronLeft,
  Filter,
  Layers,
  HelpCircle,
  AlertTriangle,
  Sparkles,
  LayoutGrid,
  List,
  SlidersHorizontal,
  Bookmark,
  ArrowUpDown,
  X,
  Eye
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { remarkAlert } from 'remark-github-blockquote-alert';
import 'remark-github-blockquote-alert/alert.css';
import { PageHeader } from '@/components/page-header';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { MermaidRenderer } from '@/components/mermaid-renderer';
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
  personaCategory?: string;
  statutoryDomain?: string;
  difficulty?: string;
  keyMetric?: string;
  series: string;
  seriesId?: number;
  episodeNumber?: number;
  readTime: string;
  duration: string;
  audioUrl: string;
  summary: string;
  takeaways?: string[];
  publishedAt: string;
  keywords: string[];
  nextEpisode?: { code: string; title: string; slug: string };
}

const copy = {
  en: {
    seoTitle: 'The CRA Technical Journal & Engineering Memorandums | OXOT',
    seoDescription: 'Authoritative, in-depth technical guides, statutory cross-examinations, and compliance architectures on EU Regulation 2024/2847 and IEC 62443.',
    kicker: 'EDITORIAL TECHNICAL PUBLICATION',
    title: 'The CRA Technical Journal',
    description: 'An authoritative, peer-level technical publication delivering 67 in-depth engineering memorandums, bespoke reference architectures, and statutory analyses across industrial OT, critical infrastructure, and supply chain governance.',
    live: 'Live Corpus',
    loading: 'Loading technical guides…',
    guideSingular: 'Memorandum',
    guidePlural: 'Technical Memorandums',
    corpusSuffix: 'published in the active register',
    empty: 'No technical memorandums match your selected filter criteria.',
    searchPlaceholder: 'Search 67 technical guides, statutory articles (e.g. Article 21), roles, or keywords…',
    readGuide: 'Read Full Blog',
    previewGuide: 'Quick Preview',
    streamBriefing: 'Listen Briefing',
    statutoryRef: 'Statutory Law',
  },
  nl: {
    seoTitle: 'Het CRA Technisch Tijdschrift & Ingenieursmemoranda | OXOT',
    seoDescription: 'Gezaghebbende, diepgaande technische gidsen en conformiteitsarchitecturen over EU-verordening 2024/2847 en IEC 62443.',
    kicker: 'REDACTIONELE TECHNISCHE PUBLICATIE',
    title: 'Het CRA Technisch Tijdschrift',
    description: 'Een gezaghebbende publicatie met 67 diepgaande technische memoranda, referentie-architecturen en wettelijke analyses voor industriële OT en toeleveringsketens onder de EU Cyber Resilience Act.',
    live: 'Actief Register',
    loading: 'Gidsen laden…',
    guideSingular: 'Memorandum',
    guidePlural: 'Technische Memoranda',
    corpusSuffix: 'gepubliceerd in het actieve register',
    empty: 'Geen technische gidsen gevonden die voldoen aan uw zoekopdracht.',
    searchPlaceholder: 'Zoek in 67 technische gidsen, wetsartikelen (bijv. Artikel 21), rollen of trefwoorden…',
    readGuide: 'Lees volledige blog',
    previewGuide: 'Snelle weergave',
    streamBriefing: 'Beluister samenvatting',
    statutoryRef: 'Wettelijke referentie',
  }
} as const;

// 5 Flagship Curated Articles for Hero Carousel
const FEATURED_SPOTLIGHTS = [
  {
    code: 'EP_1.01',
    title: 'The 2-Year Lag: Why 2024 Contracts Are Walking into a 2027 Regulatory Trap',
    subtitle: 'Why turnkey infrastructure contracts signed with 2-year build phases result in non-compliant 2027 handover liabilities.',
    slug: 'ep-1.01-the-2-year-lag-why-2024-contracts-are-walking-into',
    statutes: ['Article 2', 'Article 71'],
    persona: 'EPC Contractors & Project Planners',
    metric: '2027 Mandatory Cliff',
    badge: 'Flagship Procurement Analysis',
    gradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
    border: 'border-amber-500/30'
  },
  {
    code: 'EP_2.01',
    title: 'The Accidental Manufacturer: How System Integrators Trigger Article 21 Liability',
    subtitle: 'When modifying custom PLC ladder logic or integrating multi-vendor skids legally reclassifies an EPC as the primary manufacturer.',
    slug: 'ep-2.01-the-accidental-manufacturer-how-system-integrators',
    statutes: ['Article 21', 'Recital 24'],
    persona: 'Industrial Integrators (Axians/Spie)',
    metric: '€15M Reclassification Risk',
    badge: 'Critical Integrator Shield',
    gradient: 'from-cyan-500/20 via-blue-500/10 to-transparent',
    border: 'border-cyan-500/30'
  },
  {
    code: 'TC_01',
    title: 'The Edge-to-Cloud Grey Zone: When Microservices Void Local Controller CE Marks',
    subtitle: 'Shattering the myth that OTA container pushes are purely IT operations. The unvarnished truth on CE mark voidance.',
    slug: 'tc-01-the-edge-to-cloud-grey-zone-when-microservices-void-l',
    statutes: ['Article 3(2)', 'Article 21'],
    persona: 'Cloud-OT Architects & Plant CISOs',
    metric: 'CE Invalidation Trap',
    badge: 'Truth & Consequences Investigation',
    gradient: 'from-rose-500/20 via-red-500/10 to-transparent',
    border: 'border-rose-500/30'
  },
  {
    code: 'TC_04',
    title: 'The €15M Calculation: Dissecting the Math Behind Article 64 Global Turnover Penalties',
    subtitle: 'How European market surveillance authorities calculate the 2.5% global turnover fine and personal corporate officer liability.',
    slug: 'tc-04-the-15m-calculation-dissecting-the-math-behind-art',
    statutes: ['Article 61', 'Recital 78'],
    persona: 'Chief Financial Officers & General Counsel',
    metric: '2.5% Worldwide Turnover',
    badge: 'Executive Boardroom Briefing',
    gradient: 'from-purple-500/20 via-indigo-500/10 to-transparent',
    border: 'border-purple-500/30'
  },
  {
    code: 'TC_11',
    title: 'The Port Surveillance Playbook: How Customs Inspects Software Bill of Materials at Antwerp and Rotterdam',
    subtitle: 'How European customs authorities intercept non-compliant embedded hardware at major European entry ports.',
    slug: 'tc-11-the-port-surveillance-playbook-how-customs-inspect',
    statutes: ['Article 54', 'Article 57'],
    persona: 'Importers & Logistics Directors',
    metric: 'Customs Impoundment Gate',
    badge: 'Cross-Border Supply Chain',
    gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    border: 'border-emerald-500/30'
  }
];

interface TrackTab {
  id: string;
  label: string;
  count: number;
  seriesId?: number;
  codePrefix?: string;
  seriesKeywords?: string[];
}

const TRACK_TABS: TrackTab[] = [
  { id: 'ALL', label: 'All Guides', count: 67 },
  { id: '1', seriesId: 1, codePrefix: 'EP_1', seriesKeywords: ['Procurement'], label: '1. Procurement', count: 6 },
  { id: '2', seriesId: 2, codePrefix: 'EP_2', seriesKeywords: ['Integrator', 'EPC'], label: '2. Integrators', count: 7 },
  { id: '3', seriesId: 3, codePrefix: 'EP_3', seriesKeywords: ['Brownfield'], label: '3. Brownfield OT', count: 6 },
  { id: '4', seriesId: 4, codePrefix: 'EP_4', seriesKeywords: ['Tier-2', 'Component', 'Embedded'], label: '4. Embedded OEMs', count: 6 },
  { id: '5', seriesId: 5, codePrefix: 'EP_5', seriesKeywords: ['Critical Sector'], label: '5. Critical Sectors', count: 8 },
  { id: '6', seriesId: 6, codePrefix: 'EP_6', seriesKeywords: ['Vulnerability', 'PSIRT'], label: '6. PSIRT Ops', count: 6 },
  { id: '7', seriesId: 7, codePrefix: 'EP_7', seriesKeywords: ['Conformity', 'Audit'], label: '7. Conformity', count: 6 },
  { id: '8', seriesId: 8, codePrefix: 'EP_8', seriesKeywords: ['Liability', 'Penalties', '2028'], label: '8. Penalties & 2028', count: 5 },
  { id: 'TRUTH', seriesId: 9, codePrefix: 'TC_', seriesKeywords: ['Truth & Consequences'], label: 'Truth & Consequences', count: 12 },
  { id: 'NEWS', seriesId: 10, codePrefix: 'NEWS_', seriesKeywords: ['News Stream'], label: 'News Stream', count: 5 }
];

const PERSONA_OPTIONS = [
  { id: 'ALL', label: 'All Target Personas' },
  { id: 'EPC & Integrators', label: 'EPC & System Integrators' },
  { id: 'Plant CISOs & Asset Owners', label: 'Plant CISOs & Asset Owners' },
  { id: 'Procurement & Legal Counsel', label: 'Procurement & Legal Counsel' },
  { id: 'Hardware & Embedded OEMs', label: 'Hardware & Embedded OEMs' },
  { id: 'PSIRT & Incident Responders', label: 'PSIRT & Incident Responders' },
  { id: 'Quality & Notified Bodies', label: 'Quality & Notified Bodies' },
  { id: 'Open Source Stewards', label: 'Open Source Stewards' },
  { id: 'Importers & Distributors', label: 'Importers & Distributors' }
];

const STATUTE_OPTIONS = [
  { id: 'ALL', label: 'All Statutory Articles' },
  { id: 'Article 2', label: 'Art 2 (Scope & Exclusions)' },
  { id: 'Article 10', label: 'Art 10/11 (Essential Requirements)' },
  { id: 'Article 13', label: 'Art 13 (Technical Documentation)' },
  { id: 'Article 14', label: 'Art 14 (24h Incident Notification)' },
  { id: 'Article 20', label: 'Art 18 (Duty to Refrain)' },
  { id: 'Article 21', label: 'Art 21 (Substantial Modification)' },
  { id: 'Article 24', label: 'Art 24 (Conformity Assessment Modules)' },
  { id: 'Annex I', label: 'Annex I (Security by Design)' },
  { id: 'Annex III', label: 'Annex III (Class I / II Classification)' },
  { id: 'Article 64', label: 'Art 61 (€15M Penalties)' }
];

export default function BlogHubPage() {
  const { locale } = useLocale();
  const t = copy[locale];

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState('ALL');
  const [selectedPersona, setSelectedPersona] = useState('ALL');
  const [selectedStatute, setSelectedStatute] = useState('ALL');
  const [selectedSort, setSelectedSort] = useState<'seq' | 'statute' | 'time' | 'title' | 'recent'>('seq');
  const [viewMode, setViewMode] = useState<'bento' | 'cards' | 'dense'>('bento');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  
  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);

  // Active Reader Quick-Preview Modal State
  const [activePostModal, setActivePostModal] = useState<BlogPost | null>(null);
  const [postContent, setPostContent] = useState<string | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  
  // Audio Player State
  const [activeAudio, setActiveAudio] = useState<BlogPost | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<'1.0x' | '1.25x' | '1.5x'>('1.0x');
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  // Carousel State
  const [activeSlide, setActiveSlide] = useState(0);
  const [isCarouselPaused, setIsCarouselPaused] = useState(false);

  useSeo({
    title: t.seoTitle,
    description: t.seoDescription,
    canonicalUrl: '/blog',
  });

  // Load blog corpus
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

  // Carousel Auto-Rotation (6 seconds)
  useEffect(() => {
    if (isCarouselPaused) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % FEATURED_SPOTLIGHTS.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isCarouselPaused]);

  // Open Quick Preview Modal with genuine markdown
  const openPreviewModal = (post: BlogPost) => {
    setActivePostModal(post);
    setPostContent(null);
    setModalLoading(true);
    fetch(`/api/blogs/${encodeURIComponent(post.code || post.slug)}`)
      .then((r) => r.json())
      .then((d) => {
        if (d?.content) setPostContent(d.content);
      })
      .catch(() => {})
      .finally(() => setModalLoading(false));
  };

  const handleCopyLink = (slug: string) => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/blog/${slug}`;
      navigator.clipboard.writeText(url);
      setCopiedSlug(slug);
      setTimeout(() => setCopiedSlug(null), 2000);
    }
  };

  // Dynamic counts for track tabs
  const trackTabsWithCounts = useMemo(() => {
    return TRACK_TABS.map((track) => {
      if (track.id === 'ALL') {
        return { ...track, count: posts.length || 67 };
      }
      const matchedCount = posts.filter((p) => {
        if (track.codePrefix && p.code.startsWith(track.codePrefix)) return true;
        if (track.seriesId && p.seriesId === track.seriesId) return true;
        if (p.series && track.seriesKeywords?.some((k) => p.series.toLowerCase().includes(k.toLowerCase()))) return true;
        return false;
      }).length;
      return { ...track, count: matchedCount || track.count };
    });
  }, [posts]);

  // Filter and Search Pipeline
  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesSubtitle = p.subtitle?.toLowerCase().includes(q);
        const matchesSummary = p.summary.toLowerCase().includes(q);
        const matchesCode = p.code.toLowerCase().includes(q);
        const matchesPersona = p.persona.toLowerCase().includes(q);
        const matchesStatute = p.statutes.some((s) => s.toLowerCase().includes(q));
        const matchesKeywords = p.keywords?.some((k) => k.toLowerCase().includes(q));
        if (!matchesTitle && !matchesSubtitle && !matchesSummary && !matchesCode && !matchesPersona && !matchesStatute && !matchesKeywords) {
          return false;
        }
      }

      // 2. Track Filter
      if (selectedTrack !== 'ALL') {
        const tab = TRACK_TABS.find((t) => t.id === selectedTrack);
        if (tab) {
          const matchesCodePrefix = tab.codePrefix ? p.code.startsWith(tab.codePrefix) : false;
          const matchesSeriesId = tab.seriesId ? p.seriesId === tab.seriesId : false;
          const matchesKeyword = p.series && tab.seriesKeywords?.some((k) => p.series.toLowerCase().includes(k.toLowerCase()));
          if (!matchesCodePrefix && !matchesSeriesId && !matchesKeyword) {
            return false;
          }
        } else {
          if (selectedTrack === 'TRUTH' && !p.code.startsWith('TC_')) return false;
          if (selectedTrack === 'NEWS' && !p.code.startsWith('NEWS_')) return false;
          if (selectedTrack !== 'TRUTH' && selectedTrack !== 'NEWS' && p.series !== selectedTrack && !p.code.startsWith(selectedTrack)) return false;
        }
      }

      // 3. Target Persona Filter
      if (selectedPersona !== 'ALL') {
        const cat = p.personaCategory || p.persona;
        if (!cat.toLowerCase().includes(selectedPersona.toLowerCase()) && !p.persona.toLowerCase().includes(selectedPersona.toLowerCase())) {
          return false;
        }
      }

      // 4. Statute Filter
      if (selectedStatute !== 'ALL') {
        const match = p.statutes.some((s) => s.toLowerCase().includes(selectedStatute.toLowerCase()));
        if (!match) return false;
      }

      return true;
    });
  }, [posts, searchQuery, selectedTrack, selectedPersona, selectedStatute]);

  // Sort Pipeline
  const sortedPosts = useMemo(() => {
    const arr = [...filteredPosts];
    switch (selectedSort) {
      case 'seq':
        return arr.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
      case 'statute':
        return arr.sort((a, b) => (a.statutes[0] || '').localeCompare(b.statutes[0] || ''));
      case 'time':
        return arr.sort((a, b) => parseInt(a.readTime) - parseInt(b.readTime));
      case 'title':
        return arr.sort((a, b) => a.title.localeCompare(b.title));
      case 'recent':
        return arr.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
      default:
        return arr;
    }
  }, [filteredPosts, selectedSort]);

  // Pagination Slice
  const totalPages = Math.ceil(sortedPosts.length / pageSize);
  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedPosts.slice(start, start + pageSize);
  }, [sortedPosts, currentPage, pageSize]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedTrack, selectedPersona, selectedStatute, selectedSort]);

  const activeFilterCount = (selectedPersona !== 'ALL' ? 1 : 0) + (selectedStatute !== 'ALL' ? 1 : 0);

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedTrack('ALL');
    setSelectedPersona('ALL');
    setSelectedStatute('ALL');
    setSelectedSort('seq');
  };

  return (
    <div className="min-h-screen bg-background text-foreground py-12 md:py-16 selection:bg-primary/20">
      
      {/* 1. Header Section */}
      <div className="container mx-auto px-4 md:px-8">
        <PageHeader
          kicker={t.kicker}
          title={t.title}
          icon={BookOpen}
          description={t.description}
        />
      </div>

      {/* 2. Flagship Editorial Carousel Banner */}
      <div className="container mx-auto px-4 md:px-8 mb-10">
        <div 
          className="relative overflow-hidden rounded-3xl border border-border/80 bg-card/60 backdrop-blur-md p-6 md:p-8 shadow-xl transition-all"
          onMouseEnter={() => setIsCarouselPaused(true)}
          onMouseLeave={() => setIsCarouselPaused(false)}
        >
          {/* Subtle Ambient Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-mono font-bold border border-primary/30 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" />
                  {FEATURED_SPOTLIGHTS[activeSlide].badge}
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-muted text-[11px] font-mono text-muted-foreground">
                  {FEATURED_SPOTLIGHTS[activeSlide].code}
                </span>
                {FEATURED_SPOTLIGHTS[activeSlide].statutes.map((st, idx) => (
                  <span key={idx} className="px-2 py-0.5 rounded-md bg-card border border-border text-[11px] font-mono text-muted-foreground">
                    {st}
                  </span>
                ))}
              </div>

              <h2 className="text-xl sm:text-2xl md:text-3xl font-display font-bold text-foreground leading-snug">
                {FEATURED_SPOTLIGHTS[activeSlide].title}
              </h2>

              <p className="text-sm md:text-base text-muted-foreground line-clamp-2 leading-relaxed">
                {FEATURED_SPOTLIGHTS[activeSlide].subtitle}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link href={`/blog/${FEATURED_SPOTLIGHTS[activeSlide].slug}`}>
                  <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs transition-all shadow-md active:scale-95 cursor-pointer">
                    <BookOpen className="w-4 h-4" />
                    <span>Read Full Memorandum</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </Link>

                <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                  <User className="w-3.5 h-3.5 text-primary" />
                  <span>{FEATURED_SPOTLIGHTS[activeSlide].persona}</span>
                </div>
              </div>
            </div>

            {/* Right Metric Card & Nav Controls */}
            <div className="lg:col-span-4 flex flex-col justify-between h-full bg-card/80 border border-border rounded-2xl p-5 shadow-inner">
              <div className="space-y-2">
                <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                  Statutory Exposure Metric
                </div>
                <div className="text-lg font-bold text-foreground font-mono">
                  {FEATURED_SPOTLIGHTS[activeSlide].metric}
                </div>
                <div className="text-xs text-muted-foreground">
                  Official engineering guidance & risk mitigation strategy.
                </div>
              </div>

              {/* Carousel Indicators & Controls */}
              <div className="flex items-center justify-between pt-6 mt-4 border-t border-border/60">
                <div className="flex items-center gap-1.5">
                  {FEATURED_SPOTLIGHTS.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveSlide(idx)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        activeSlide === idx ? 'w-6 bg-primary' : 'w-2 bg-muted hover:bg-muted-foreground/50'
                      }`}
                      aria-label={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setActiveSlide((prev) => (prev - 1 + FEATURED_SPOTLIGHTS.length) % FEATURED_SPOTLIGHTS.length)}
                    className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    aria-label="Previous Slide"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setActiveSlide((prev) => (prev + 1) % FEATURED_SPOTLIGHTS.length)}
                    className="p-1.5 rounded-lg bg-muted hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                    aria-label="Next Slide"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 3. Sleek, Production-Grade Search & Filter Deck */}
      <div className="container mx-auto px-4 md:px-8 mb-8 space-y-4">
        
        {/* Main Search & Tool Bar */}
        <div className="p-3 md:p-4 rounded-2xl bg-card/70 border border-border/80 backdrop-blur-md shadow-md flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Unified Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-background/80 border border-border/80 text-foreground placeholder:text-muted-foreground text-xs md:text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all font-sans"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 cursor-pointer"
                title="Clear Search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right Action Cluster */}
          <div className="flex flex-wrap items-center gap-2 justify-between md:justify-end">
            
            {/* Filter Drawer Toggle */}
            <button
              onClick={() => setIsFilterDrawerOpen(!isFilterDrawerOpen)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer ${
                isFilterDrawerOpen || activeFilterCount > 0
                  ? 'bg-primary/15 border-primary/40 text-primary'
                  : 'bg-background/80 border-border/80 text-muted-foreground hover:text-foreground hover:bg-card'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center font-bold font-mono">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-background/80 border border-border/80 px-3 py-2 rounded-xl text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-muted-foreground" />
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value as any)}
                className="bg-transparent border-none text-foreground text-xs focus:outline-none cursor-pointer font-medium"
              >
                <option value="seq" className="bg-card text-foreground">Series Sequential</option>
                <option value="recent" className="bg-card text-foreground">Newest Published</option>
                <option value="statute" className="bg-card text-foreground">Statutory Article</option>
                <option value="time" className="bg-card text-foreground">Reading Time</option>
              </select>
            </div>

            {/* View Mode Switcher (Bento Grid Default) */}
            <div className="flex items-center bg-background/80 border border-border/80 rounded-xl p-0.5">
              <button
                onClick={() => setViewMode('bento')}
                title="Bento Grid (Structured List)"
                className={`p-2 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'bento'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Bento Grid</span>
              </button>
              <button
                onClick={() => setViewMode('cards')}
                title="Bento Cards (Spacious 3D)"
                className={`p-2 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'cards'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cards</span>
              </button>
              <button
                onClick={() => setViewMode('dense')}
                title="Dense Matrix Table"
                className={`p-2 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'dense'
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Table</span>
              </button>
            </div>

          </div>
        </div>

        {/* Category Tab Strip (Series Tracks) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
          {trackTabsWithCounts.map((track) => {
            const isSelected = selectedTrack === track.id;
            return (
              <button
                key={track.id}
                onClick={() => setSelectedTrack(track.id)}
                className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'bg-card/60 border border-border/60 text-muted-foreground hover:text-foreground hover:bg-card'
                }`}
              >
                <span>{track.label}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-black/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {track.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Collapsible Filter Drawer (Personas & Statutes) */}
        {isFilterDrawerOpen && (
          <div className="p-5 rounded-2xl bg-card/90 border border-border/80 shadow-lg space-y-4 animate-in slide-in-from-top-2">
            <div className="flex items-center justify-between pb-2 border-b border-border/60">
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold">
                Advanced Precision Filters
              </span>
              <button
                onClick={resetAllFilters}
                className="text-xs text-primary hover:underline cursor-pointer font-medium"
              >
                Reset All Filters
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Persona Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-primary" />
                  Target Industry Persona
                </label>
                <select
                  value={selectedPersona}
                  onChange={(e) => setSelectedPersona(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer font-sans"
                >
                  {PERSONA_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Statute Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                  Statutory Law / Article
                </label>
                <select
                  value={selectedStatute}
                  onChange={(e) => setSelectedStatute(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-background border border-border text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer font-sans"
                >
                  {STATUTE_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Active Filter Chips Strip */}
        {(selectedPersona !== 'ALL' || selectedStatute !== 'ALL' || searchQuery || selectedTrack !== 'ALL') && (
          <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
            <span className="text-muted-foreground font-mono text-[11px]">Active Filters:</span>
            
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 text-[11px] font-mono">
                Query: "{searchQuery}"
                <button onClick={() => setSearchQuery('')} className="hover:text-foreground cursor-pointer">×</button>
              </span>
            )}

            {selectedTrack !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-card border border-border text-foreground text-[11px] font-mono">
                Track: {TRACK_TABS.find((t) => t.id === selectedTrack)?.label || selectedTrack}
                <button onClick={() => setSelectedTrack('ALL')} className="hover:text-primary cursor-pointer">×</button>
              </span>
            )}

            {selectedPersona !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[11px] font-mono">
                Role: {selectedPersona}
                <button onClick={() => setSelectedPersona('ALL')} className="hover:text-cyan-200 cursor-pointer">×</button>
              </span>
            )}

            {selectedStatute !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-mono">
                Statute: {selectedStatute}
                <button onClick={() => setSelectedStatute('ALL')} className="hover:text-amber-200 cursor-pointer">×</button>
              </span>
            )}

            <button
              onClick={resetAllFilters}
              className="text-xs text-muted-foreground hover:text-primary underline ml-2 cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        )}

      </div>

      {/* 4. Results Counter & Pagination Meta */}
      <div className="container mx-auto px-4 md:px-8 mb-6 flex items-center justify-between text-xs text-muted-foreground font-mono">
        <div>
          Showing <strong>{paginatedPosts.length}</strong> of <strong>{sortedPosts.length}</strong> technical memorandums
        </div>
        <div className="flex items-center gap-2">
          <span>Per page:</span>
          {[12, 24, 48].map((size) => (
            <button
              key={size}
              onClick={() => setPageSize(size)}
              className={`px-2 py-0.5 rounded cursor-pointer ${
                pageSize === size ? 'bg-primary text-primary-foreground font-bold' : 'hover:text-foreground'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      {/* 5. Main Content Deck */}
      <div className="container mx-auto px-4 md:px-8">
        
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-6 rounded-2xl bg-card border border-border space-y-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
              </div>
            ))}
          </div>
        ) : sortedPosts.length === 0 ? (
          <div className="py-20 text-center rounded-3xl border border-dashed border-border bg-card/30 p-8">
            <div className="w-12 h-12 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">No Matching Memorandums Found</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
              {t.empty}
            </p>
            <button
              onClick={resetAllFilters}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow hover:bg-primary/90 cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <>
            {/* View Mode 1: Bento Grid (Default structured list/cards) */}
            {viewMode === 'bento' && (
              <div className="space-y-4">
                {paginatedPosts.map((post) => (
                  <div
                    key={post.id}
                    className="group relative p-5 md:p-6 rounded-2xl bg-card/60 border border-border/70 hover:border-primary/40 backdrop-blur-sm transition-all hover:bg-card/90 hover:shadow-lg"
                  >
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                      
                      {/* Left: Metadata, Title, Excerpt */}
                      <div className="space-y-2.5 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-md bg-primary/15 text-primary text-xs font-mono font-bold border border-primary/20">
                            {post.code}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-muted text-[11px] font-mono text-muted-foreground">
                            {post.series}
                          </span>
                          {post.statutes.map((s, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-md bg-card border border-border text-[11px] font-mono text-muted-foreground">
                              {s}
                            </span>
                          ))}
                        </div>

                        <Link href={`/blog/${post.slug}`} className="block group-hover:text-primary transition-colors">
                          <h3 className="text-base md:text-lg lg:text-xl font-display font-bold text-foreground leading-snug">
                            {post.title}
                          </h3>
                        </Link>

                        <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                          {post.summary}
                        </p>

                        <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-muted-foreground font-mono">
                          <div className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-primary" />
                            <span>{post.persona}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{post.readTime}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span>{post.publishedAt}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Actions */}
                      <div className="flex items-center gap-2.5 flex-shrink-0 w-full lg:w-auto justify-end border-t lg:border-t-0 pt-3 lg:pt-0 border-border/40">
                        <button
                          onClick={() => openPreviewModal(post)}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-muted hover:bg-muted/80 text-foreground text-xs font-medium transition-colors cursor-pointer"
                          title="Quick Preview"
                        >
                          <Eye className="w-3.5 h-3.5 text-muted-foreground" />
                          <span>Preview</span>
                        </button>

                        <button
                          onClick={() => {
                            setActiveAudio(post);
                            setIsPlaying(true);
                          }}
                          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-card border border-border hover:border-primary/40 text-foreground text-xs font-medium transition-colors cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 text-primary fill-current" />
                          <span>Audio ({post.duration})</span>
                        </button>

                        <Link href={`/blog/${post.slug}`}>
                          <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-xs transition-transform active:scale-95 cursor-pointer">
                            <span>Read Full Blog</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </Link>
                      </div>

                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* View Mode 2: Bento Cards (Spacious 3D grid) */}
            {viewMode === 'cards' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {paginatedPosts.map((post) => (
                  <div
                    key={post.id}
                    className="group flex flex-col justify-between p-6 rounded-3xl bg-card/60 border border-border/80 hover:border-primary/40 backdrop-blur-sm shadow-sm hover:shadow-xl transition-all"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-primary/15 text-primary text-xs font-mono font-bold">
                          {post.code}
                        </span>
                        <span className="text-xs font-mono text-muted-foreground">
                          {post.readTime}
                        </span>
                      </div>

                      <Link href={`/blog/${post.slug}`} className="block group-hover:text-primary transition-colors">
                        <h3 className="text-lg font-display font-bold text-foreground leading-snug line-clamp-2">
                          {post.title}
                        </h3>
                      </Link>

                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                        {post.summary}
                      </p>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {post.statutes.map((s, i) => (
                          <span key={i} className="px-2 py-0.5 rounded-md bg-muted text-[10px] font-mono text-muted-foreground">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-6 mt-4 border-t border-border/60 flex items-center justify-between gap-2">
                      <button
                        onClick={() => {
                          setActiveAudio(post);
                          setIsPlaying(true);
                        }}
                        className="p-2 rounded-xl bg-muted hover:bg-muted/80 text-primary cursor-pointer"
                        title="Listen to Podcast"
                      >
                        <Play className="w-4 h-4 fill-current" />
                      </button>

                      <Link href={`/blog/${post.slug}`}>
                        <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold shadow-xs cursor-pointer">
                          <span>Read Blog</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* View Mode 3: Dense Matrix Table */}
            {viewMode === 'dense' && (
              <div className="overflow-x-auto rounded-2xl border border-border/80 bg-card/60 shadow-md">
                <table className="w-full text-left text-xs border-collapse font-sans">
                  <thead>
                    <tr className="border-b border-border/80 bg-muted/40 font-mono text-muted-foreground uppercase text-[11px]">
                      <th className="p-3.5">Code</th>
                      <th className="p-3.5">Title & Core Topic</th>
                      <th className="p-3.5">Statutes</th>
                      <th className="p-3.5">Target Persona</th>
                      <th className="p-3.5">Read Time</th>
                      <th className="p-3.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {paginatedPosts.map((post) => (
                      <tr key={post.id} className="hover:bg-muted/20 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-primary whitespace-nowrap">
                          {post.code}
                        </td>
                        <td className="p-3.5 max-w-md">
                          <Link href={`/blog/${post.slug}`} className="font-semibold text-foreground hover:text-primary block transition-colors">
                            {post.title}
                          </Link>
                          <span className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                            {post.summary}
                          </span>
                        </td>
                        <td className="p-3.5 whitespace-nowrap">
                          <div className="flex flex-wrap gap-1">
                            {post.statutes.map((s, i) => (
                              <span key={i} className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">
                                {s}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="p-3.5 text-muted-foreground whitespace-nowrap">
                          {post.persona}
                        </td>
                        <td className="p-3.5 font-mono text-muted-foreground whitespace-nowrap">
                          {post.readTime}
                        </td>
                        <td className="p-3.5 text-right whitespace-nowrap">
                          <Link href={`/blog/${post.slug}`}>
                            <button className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold cursor-pointer">
                              Read
                            </button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-8 border-t border-border/60 mt-8">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-card border border-border disabled:opacity-40 hover:bg-muted text-xs font-medium cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-1.5 text-xs font-mono">
                  <span>Page {currentPage} of {totalPages}</span>
                </div>

                <button
                  onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-card border border-border disabled:opacity-40 hover:bg-muted text-xs font-medium cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}

      </div>

      {/* 6. Persistent Audio Player Drawer */}
      {activeAudio && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[94%] max-w-4xl bg-card/95 border border-primary/40 backdrop-blur-xl rounded-2xl p-4 shadow-2xl z-50 flex items-center justify-between gap-4 animate-in slide-in-from-bottom-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-3 rounded-xl bg-primary/15 text-primary flex-shrink-0">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-mono font-bold text-primary">
                NOW PLAYING • {activeAudio.code}
              </div>
              <div className="text-sm font-semibold text-foreground truncate">
                {activeAudio.title}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
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
              className="p-3 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-transform active:scale-95 cursor-pointer"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            <Link href={`/blog/${activeAudio.slug}`}>
              <button className="px-3 py-1.5 rounded-xl bg-muted hover:bg-muted/80 text-xs font-semibold text-foreground transition-colors hidden sm:flex items-center gap-1.5 cursor-pointer">
                <BookOpen className="w-3.5 h-3.5 text-primary" />
                <span>Read Blog</span>
              </button>
            </Link>

            <button
              onClick={() => { setActiveAudio(null); setIsPlaying(false); }}
              className="p-2 rounded-xl bg-muted text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* 7. Quick Preview Modal Rendering Real Markdown */}
      {activePostModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in zoom-in-95 overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-border bg-card/80 backdrop-blur-md flex items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-primary/15 text-primary text-xs font-mono font-bold">
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

              <div className="flex items-center gap-2">
                <Link href={`/blog/${activePostModal.slug}`}>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow hover:bg-primary/90 cursor-pointer">
                    <span>Full Standalone Page</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </Link>
                <button
                  onClick={() => {
                    setActivePostModal(null);
                    setPostContent(null);
                  }}
                  className="p-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-6 text-sm text-foreground leading-relaxed font-sans">
              {modalLoading ? (
                <div className="space-y-4 py-8">
                  <Skeleton className="h-6 w-1/3" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-40 w-full" />
                </div>
              ) : postContent ? (
                <article className="prose prose-invert max-w-none prose-headings:font-display prose-headings:font-bold prose-headings:text-foreground prose-h2:text-xl prose-h2:mt-8 prose-h2:border-b prose-h2:border-border/40 prose-h2:pb-2 prose-p:text-sm prose-p:text-foreground/90 prose-a:text-primary prose-code:font-mono prose-code:text-primary prose-blockquote:border-l-4 prose-blockquote:border-primary/60 prose-blockquote:bg-card/40 prose-blockquote:p-4 prose-blockquote:rounded-r-xl">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm, remarkAlert]}
                    components={{
                      pre({ children }) {
                        const codeEl = children as React.ReactElement<{ className?: string; children?: React.ReactNode }> | undefined;
                        const className = codeEl?.props?.className ?? '';
                        const isMermaid = /language-mermaid/.test(className);
                        const codeStr = typeof codeEl?.props?.children === 'string' 
                          ? codeEl.props.children 
                          : Array.isArray(codeEl?.props?.children) 
                            ? codeEl.props.children.join('') 
                            : '';

                        if (isMermaid) {
                          return (
                            <div className="not-prose my-6">
                              <MermaidRenderer chart={codeStr.trim()} />
                            </div>
                          );
                        }
                        return <pre className="p-4 rounded-xl bg-card border border-border font-mono text-xs overflow-x-auto my-4">{children}</pre>;
                      }
                    }}
                  >
                    {postContent.replace(/^---[\s\S]*?---/, '').trim()}
                  </ReactMarkdown>
                </article>
              ) : (
                <div className="p-4 rounded-xl bg-muted/40 text-muted-foreground">
                  {activePostModal.summary}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-border bg-card/90 flex items-center justify-between gap-4">
              <button
                onClick={() => {
                  setActiveAudio(activePostModal);
                  setIsPlaying(true);
                }}
                className="flex items-center gap-2 text-xs font-semibold text-primary hover:underline cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Play Spoken Briefing ({activePostModal.duration})</span>
              </button>

              <Link href={`/blog/${activePostModal.slug}`}>
                <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow hover:bg-primary/90 cursor-pointer">
                  <span>Read Complete Memorandum</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </Link>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
