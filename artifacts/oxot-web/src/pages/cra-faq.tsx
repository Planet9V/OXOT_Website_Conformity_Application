import React, { useEffect, useState, useMemo } from 'react';
import { 
  HelpCircle, 
  Search, 
  Download, 
  ExternalLink, 
  Copy, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Filter, 
  Layers, 
  ShieldCheck, 
  FileText, 
  Clock, 
  Sparkles, 
  Building2, 
  User, 
  BookOpen, 
  AlertTriangle,
  ArrowRight,
  List,
  LayoutGrid,
  FileCode,
  SlidersHorizontal,
  X,
  Compass,
  Radio,
  FileCheck,
  ShieldAlert,
  Factory
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useSeo } from '@/hooks/use-seo';
import { useLocale } from '@/providers/locale-provider';
import { Link } from 'wouter';

interface FaqItem {
  id: string;
  number: string;
  sectionNumber: string;
  sectionTitle: string;
  title: string;
  isQuestion: boolean;
  question: string;
  answer: string;
  shortSummary: string;
  statutes: string[];
  targetPersonas: string[];
  keywords: string[];
}

const copy = {
  en: {
    seoTitle: 'Official European Commission CRA FAQs & Guidance | Regulation (EU) 2024/2847 | OXOT',
    seoDescription: 'Authoritative questions and answers published by the European Commission DG CONNECT on the EU Cyber Resilience Act (Regulation 2024/2847), scopes, timelines, and conformity.',
    kicker: 'OFFICIAL EU DG CONNECT REGULATORY GUIDANCE',
    title: 'European Commission CRA FAQs',
    subtitle: 'Technical Frequently Asked Questions and statutory interpretations on Regulation (EU) 2024/2847 (Cyber Resilience Act). Ingested directly from the official European Commission guidance publication.',
    searchPlaceholder: 'Search 76 official EU answers, statutory articles (e.g. Article 21), or topics (e.g. SBOM, legacy stock, Notified Bodies)…',
    downloadMd: 'Download Official Markdown',
    viewPdf: 'View Official Source PDF',
    resetFilters: 'Reset all filters',
  },
  nl: {
    seoTitle: 'Officiële Europese Commissie CRA Veelgestelde Vragen & Richtlijnen | OXOT',
    seoDescription: 'Gezaghebbende vragen en antwoorden van de Europese Commissie DG CONNECT over de EU Cyber Resilience Act (Verordening 2024/2847).',
    kicker: 'OFFICIËLE EU DG CONNECT RICHTLIJNEN',
    title: 'Europese Commissie CRA Veelgestelde Vragen',
    subtitle: 'Technische veelgestelde vragen en wettelijke interpretaties over Verordening (EU) 2024/2847 (Cyber Resilience Act), overgenomen van de Europese Commissie.',
    searchPlaceholder: 'Zoek in 76 officiële EU-antwoorden, wetsartikelen (bijv. Artikel 21) of onderwerpen…',
    downloadMd: 'Download officiële Markdown',
    viewPdf: 'Bekijk originele bron-PDF',
    resetFilters: 'Filters herstellen',
  }
} as const;

const SECTION_DESCRIPTIONS: { [key: string]: string } = {
  '1': 'Scope criteria, definitions of products with digital elements (PDE), data connections, and exclusions.',
  '2': 'Interplay with NIS2, EU AI Act, Machinery Regulation, Product Liability, Medical Devices, and GPSR.',
  '3': 'Classification criteria determining Default, Important (Class I / Class II), and Critical products.',
  '4': 'Essential cybersecurity requirements (Annex I), risk assessment, secure-by-default, and support periods.',
  '5': 'Mandatory 24-hour reporting of actively exploited vulnerabilities and severe incidents to ENISA and CSIRTs.',
  '6': 'Conformity assessment routes: Module A (internal control), Module B+C, Module H, and Notified Bodies.',
  '7': 'Application deadlines (11 Sep 2026 for reporting, 11 Dec 2027 for full application) and pre-existing stock rules.'
};

const SECTION_TABS = [
  { id: 'ALL', label: 'All 7 Sections', count: 76 },
  { id: '1', label: '1. Scope & Definitions', count: 9 },
  { id: '2', label: '2. Interplay with Directives', count: 18 },
  { id: '3', label: '3. Product Classification', count: 4 },
  { id: '4', label: '4. Manufacturer Obligations', count: 27 },
  { id: '5', label: '5. 24h Exploit Reporting', count: 4 },
  { id: '6', label: '6. Conformity Modules', count: 9 },
  { id: '7', label: '7. Transition & Deadlines', count: 5 },
];

const PERSONA_OPTIONS = [
  { id: 'ALL', label: 'All Target Roles' },
  { id: 'Hardware & Embedded OEMs', label: 'Hardware & Embedded OEMs' },
  { id: 'EPC & System Integrators', label: 'EPC & System Integrators' },
  { id: 'Plant CISOs & Asset Owners', label: 'Plant CISOs & Asset Owners' },
  { id: 'Procurement & Legal Counsel', label: 'Procurement & Legal Counsel' },
  { id: 'PSIRT & Incident Responders', label: 'PSIRT & Incident Responders' },
  { id: 'Quality & Notified Bodies', label: 'Quality & Notified Bodies' },
  { id: 'Open Source Stewards', label: 'Open Source Stewards' },
  { id: 'Importers & Distributors', label: 'Importers & Distributors' }
];

const STATUTE_OPTIONS = [
  { id: 'ALL', label: 'All Statutory Articles' },
  { id: 'Article 2', label: 'Art 2 (Scope & PDEs)' },
  { id: 'Article 3', label: 'Art 3 (Legal Definitions)' },
  { id: 'Article 10', label: 'Art 10/11 (Essential Requirements)' },
  { id: 'Article 13', label: 'Art 13 (Technical Dossier 10-Yr)' },
  { id: 'Article 14', label: 'Art 14 (24h Incident Clock)' },
  { id: 'Article 18', label: 'Art 18 (Duty to Refrain)' },
  { id: 'Article 21', label: 'Art 21 (Substantial Modification)' },
  { id: 'Article 24', label: 'Art 24 (Conformity Assessment Modules)' },
  { id: 'Annex I', label: 'Annex I (Security by Design)' },
  { id: 'Annex III', label: 'Annex III (Class I & II PDEs)' }
];

export default function CraFaqPage() {
  const { locale } = useLocale();
  const t = (locale && (copy as any)[locale]) || copy.en;

  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [sections, setSections] = useState<{ [key: string]: { title: string; icon?: string } }>({});
  const [loading, setLoading] = useState(true);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState('ALL');
  const [selectedPersona, setSelectedPersona] = useState('ALL');
  const [selectedStatute, setSelectedStatute] = useState('ALL');
  const [viewMode, setViewMode] = useState<'accordions' | 'dense'>('accordions');
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Accordion State: set of expanded FAQ numbers
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['1.1', '1.3', '2.4.1', '4.1.1', '5.1', '6.1', '7.1']));
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useSeo({
    title: t.seoTitle,
    description: t.seoDescription,
    canonicalUrl: '/faq',
  });

  useEffect(() => {
    let alive = true;
    fetch('/api/faqs')
      .then((r) => r.json())
      .then((data) => {
        if (alive && data?.items) {
          setFaqs(data.items);
          if (data.sections) setSections(data.sections);
        }
      })
      .catch((err) => {
        console.error('Failed to load CRA FAQs:', err);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const toggleAccordion = (num: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(num)) {
        next.delete(num);
      } else {
        next.add(num);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedItems(new Set(filteredFaqs.map((f) => f.number)));
  };

  const collapseAll = () => {
    setExpandedItems(new Set());
  };

  const copyFaqLink = (num: string) => {
    const url = `${window.location.origin}/faq#${num}`;
    navigator.clipboard.writeText(url);
    setCopiedId(num);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const downloadRawMarkdown = () => {
    window.open('/api/faqs/raw-markdown', '_blank');
  };

  // Filtering Logic
  const filteredFaqs = useMemo(() => {
    return faqs.filter((f) => {
      if (selectedSection !== 'ALL' && f.sectionNumber !== selectedSection) {
        return false;
      }

      if (selectedPersona !== 'ALL') {
        const hasPersona = f.targetPersonas?.some((p) =>
          p.toLowerCase().includes(selectedPersona.toLowerCase())
        );
        if (!hasPersona) return false;
      }

      if (selectedStatute !== 'ALL') {
        const hasStatute = f.statutes?.some((s) =>
          s.toLowerCase().includes(selectedStatute.toLowerCase())
        );
        if (!hasStatute) return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inKeywords = f.keywords?.some((k) => k.toLowerCase().includes(q));
        const inStatutes = f.statutes?.some((s) => s.toLowerCase().includes(q));
        return (
          f.number.includes(q) ||
          f.title.toLowerCase().includes(q) ||
          f.answer.toLowerCase().includes(q) ||
          f.shortSummary.toLowerCase().includes(q) ||
          inKeywords ||
          inStatutes
        );
      }

      return true;
    });
  }, [faqs, selectedSection, selectedPersona, selectedStatute, searchQuery]);

  // Group by Section for Section Headers
  const faqsBySection = useMemo(() => {
    const map: { [key: string]: FaqItem[] } = {};
    for (const f of filteredFaqs) {
      if (!map[f.sectionNumber]) map[f.sectionNumber] = [];
      map[f.sectionNumber].push(f);
    }
    return map;
  }, [filteredFaqs]);

  const activeFilterCount = (selectedPersona !== 'ALL' ? 1 : 0) + (selectedStatute !== 'ALL' ? 1 : 0);

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedSection('ALL');
    setSelectedPersona('ALL');
    setSelectedStatute('ALL');
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/20 selection:text-primary pb-24">
      
      {/* 1. Header & Official EU Context */}
      <div className="border-b border-border/80 bg-card/40 backdrop-blur-md">
        <div className="container mx-auto px-4 md:px-8 py-10 md:py-14 max-w-7xl">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-4xl">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-mono font-semibold px-3 py-1">
                  {t.kicker}
                </Badge>
                <Badge variant="outline" className="text-xs font-mono text-muted-foreground">
                  REGULATION (EU) 2024/2847 • 76 OFFICIAL ANSWERS
                </Badge>
              </div>

              <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight text-foreground leading-tight">
                {t.title}
              </h1>

              <p className="text-sm md:text-base text-muted-foreground mt-3 leading-relaxed">
                {t.subtitle}
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
              <button
                onClick={downloadRawMarkdown}
                className="px-4 py-2.5 rounded-xl bg-card hover:bg-muted text-foreground border border-border text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
              >
                <FileCode className="w-4 h-4 text-primary" />
                {t.downloadMd}
              </button>

              <a
                href="/assets/oxot-uploads/CRA-Research/CRA_EU_FAQS_official.pdf"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold flex items-center gap-2 transition-colors shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4" />
                {t.viewPdf}
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-8 py-8 max-w-7xl space-y-6">
        
        {/* 2. Sleek Unified Search & Filter Deck */}
        <div className="bg-card/70 border border-border/80 rounded-3xl p-4 md:p-5 shadow-sm space-y-4">
          
          {/* Top Controls Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background/90 border border-border/80 rounded-2xl pl-10 pr-10 py-2.5 text-xs md:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Actions: Filters Drawer, Expand/Collapse, View Switcher */}
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

              <button
                onClick={expandAll}
                className="px-3 py-2 rounded-xl bg-background border border-border text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Expand All
              </button>
              <button
                onClick={collapseAll}
                className="px-3 py-2 rounded-xl bg-background border border-border text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                Collapse All
              </button>

              {/* View Switcher */}
              <div className="flex items-center bg-background border border-border rounded-xl p-0.5 ml-1">
                <button
                  onClick={() => setViewMode('accordions')}
                  className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                    viewMode === 'accordions' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title="Accordion View"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Accordions</span>
                </button>
                <button
                  onClick={() => setViewMode('dense')}
                  className={`p-2 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                    viewMode === 'dense' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title="Dense Matrix Table"
                >
                  <List className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Table</span>
                </button>
              </div>

            </div>
          </div>

          {/* Section Segmented Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {SECTION_TABS.map((sec) => {
              const isSelected = selectedSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => setSelectedSection(sec.id)}
                  className={`flex-shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                      : 'bg-card/60 border border-border/60 text-muted-foreground hover:text-foreground hover:bg-card'
                  }`}
                >
                  <span>{sec.label}</span>
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                    isSelected ? 'bg-black/20 text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {sec.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Collapsible Precision Filter Drawer */}
          {isFilterDrawerOpen && (
            <div className="p-4 rounded-2xl bg-background/80 border border-border/80 shadow-md space-y-4 animate-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-bold">
                  Statutory & Role Filter Parameters
                </span>
                <button
                  onClick={resetAllFilters}
                  className="text-xs text-primary hover:underline cursor-pointer font-medium"
                >
                  Reset Filters
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-primary" />
                    Target Regulatory Persona
                  </label>
                  <select
                    value={selectedPersona}
                    onChange={(e) => setSelectedPersona(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-card border border-border text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer font-sans"
                  >
                    {PERSONA_OPTIONS.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                    CRA Statutory Law Article
                  </label>
                  <select
                    value={selectedStatute}
                    onChange={(e) => setSelectedStatute(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-card border border-border text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer font-sans"
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

          {/* Active Filter Chips */}
          {(selectedPersona !== 'ALL' || selectedStatute !== 'ALL' || searchQuery || selectedSection !== 'ALL') && (
            <div className="flex flex-wrap items-center gap-2 text-xs pt-1">
              <span className="text-muted-foreground font-mono text-[11px]">Active Filters:</span>
              
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20 text-[11px] font-mono">
                  Query: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="hover:text-foreground cursor-pointer">×</button>
                </span>
              )}

              {selectedSection !== 'ALL' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-card border border-border text-foreground text-[11px] font-mono">
                  Section {selectedSection}
                  <button onClick={() => setSelectedSection('ALL')} className="hover:text-primary cursor-pointer">×</button>
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

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-muted-foreground font-mono px-1">
          <div>
            Showing <strong>{filteredFaqs.length}</strong> official EU guidance answers
          </div>
        </div>

        {/* 3. Main Body Content */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-6 rounded-3xl bg-card border border-border space-y-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-16 w-full" />
              </div>
            ))}
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className="py-20 text-center rounded-3xl border border-dashed border-border bg-card/30 p-8">
            <div className="w-12 h-12 rounded-2xl bg-muted text-muted-foreground flex items-center justify-center mx-auto mb-4">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-foreground mb-2">No Matching Official Answers Found</h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto mb-6">
              Try refining your statutory article or keyword search.
            </p>
            <button
              onClick={resetAllFilters}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold shadow hover:bg-primary/90 cursor-pointer"
            >
              {t.resetFilters}
            </button>
          </div>
        ) : viewMode === 'accordions' ? (
          /* View Mode 1: Interactive Accordions by Section */
          <div className="space-y-12">
            {Object.keys(faqsBySection)
              .sort((a, b) => Number(a) - Number(b))
              .map((secNum) => {
                const sectionItems = faqsBySection[secNum];
                const secTitle = sections[secNum]?.title || `Section ${secNum}`;
                const secDesc = SECTION_DESCRIPTIONS[secNum];

                return (
                  <div key={secNum} className="space-y-4">
                    
                    {/* Section Header Banner */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-border/80 gap-2">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-primary/15 text-primary text-xs font-mono font-bold flex items-center justify-center border border-primary/20">
                          {secNum}
                        </span>
                        <div>
                          <h2 className="text-xl md:text-2xl font-display font-bold text-foreground">
                            {secTitle}
                          </h2>
                          {secDesc && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {secDesc}
                            </p>
                          )}
                        </div>
                      </div>

                      <span className="text-xs font-mono text-muted-foreground bg-muted/50 px-2.5 py-1 rounded-md self-start sm:self-auto">
                        {sectionItems.length} Questions
                      </span>
                    </div>

                    {/* Section Accordions */}
                    <div className="space-y-3.5">
                      {sectionItems.map((item) => {
                        const isExpanded = expandedItems.has(item.number);

                        return (
                          <div
                            key={item.id}
                            id={item.number}
                            className={`rounded-3xl border transition-all duration-200 overflow-hidden ${
                              isExpanded 
                                ? 'bg-card/90 border-primary/40 shadow-lg ring-1 ring-primary/20' 
                                : 'bg-card/60 border-border/70 hover:border-border hover:bg-card/80'
                            }`}
                          >
                            {/* Accordion Trigger Header */}
                            <button
                              onClick={() => toggleAccordion(item.number)}
                              className="w-full text-left p-5 md:p-6 flex items-start justify-between gap-4 cursor-pointer"
                            >
                              <div className="space-y-2.5 flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span className="px-2.5 py-0.5 rounded-lg bg-primary/15 text-primary font-mono text-xs font-bold border border-primary/25">
                                    Q {item.number}
                                  </span>
                                  {item.statutes.slice(0, 3).map((s, idx) => (
                                    <span key={idx} className="px-2 py-0.5 rounded-md bg-muted text-[11px] font-mono text-muted-foreground">
                                      {s}
                                    </span>
                                  ))}
                                  {item.targetPersonas.slice(0, 2).map((p, idx) => (
                                    <span key={idx} className="px-2 py-0.5 rounded-md bg-card border border-border text-[11px] text-muted-foreground">
                                      {p}
                                    </span>
                                  ))}
                                </div>

                                <h3 className="text-base md:text-lg font-display font-semibold text-foreground leading-snug">
                                  {item.title}
                                </h3>
                              </div>

                              <div className="p-2.5 rounded-2xl bg-muted/60 text-muted-foreground flex-shrink-0 mt-0.5 transition-transform">
                                {isExpanded ? <ChevronUp className="w-4 h-4 text-primary" /> : <ChevronDown className="w-4 h-4" />}
                              </div>
                            </button>

                            {/* Accordion Expanded Content */}
                            {isExpanded && (
                              <div className="px-5 md:px-7 pb-6 pt-3 border-t border-border/50 space-y-5 animate-in slide-in-from-top-1">
                                
                                {/* Key Executive Summary Box */}
                                {item.shortSummary && (
                                  <div className="p-4 md:p-5 rounded-2xl bg-primary/10 border border-primary/25 flex items-start gap-3.5 shadow-xs">
                                    <Sparkles className="w-4 h-4 text-primary flex-shrink-0 mt-1" />
                                    <div className="space-y-1 text-xs md:text-sm">
                                      <span className="text-primary font-mono font-bold uppercase tracking-wide text-[11px] block">
                                        Executive Takeaway
                                      </span>
                                      <p className="text-foreground/90 leading-relaxed font-sans font-medium">
                                        {item.shortSummary}
                                      </p>
                                    </div>
                                  </div>
                                )}

                                {/* Full Unabridged European Commission Answer */}
                                <div className="space-y-4 text-xs md:text-sm text-foreground/85 leading-relaxed font-sans">
                                  <div className="prose prose-invert max-w-none text-xs md:text-sm leading-relaxed prose-p:text-foreground/85 prose-p:leading-relaxed prose-li:text-foreground/85 prose-strong:text-foreground prose-strong:font-bold prose-code:font-mono prose-code:text-primary prose-code:bg-muted/50 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                      {item.answer}
                                    </ReactMarkdown>
                                  </div>
                                </div>

                                {/* Footer Action Bar */}
                                <div className="pt-4 border-t border-border/50 flex flex-wrap items-center justify-between gap-3 text-xs">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <Link
                                      href={`/conformity/cra-wiki?q=${encodeURIComponent(item.statutes[0] || 'CRA')}`}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border hover:bg-muted text-foreground transition-colors font-medium cursor-pointer"
                                    >
                                      <BookOpen className="w-3.5 h-3.5 text-primary" />
                                      <span>Read Statute in CRA Wiki</span>
                                    </Link>
                                    <Link
                                      href={`/blog?search=${encodeURIComponent(item.statutes[0] || 'CRA')}`}
                                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card border border-border hover:bg-muted text-foreground transition-colors font-medium cursor-pointer"
                                    >
                                      <FileText className="w-3.5 h-3.5 text-primary" />
                                      <span>Related Technical Guides</span>
                                    </Link>
                                  </div>

                                  <button
                                    onClick={() => copyFaqLink(item.number)}
                                    className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground cursor-pointer px-2 py-1"
                                  >
                                    {copiedId === item.number ? (
                                      <>
                                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                                        <span className="text-emerald-500 font-medium font-mono text-[11px]">Link Copied</span>
                                      </>
                                    ) : (
                                      <>
                                        <Copy className="w-3.5 h-3.5" />
                                        <span className="font-mono text-[11px]">Copy Link</span>
                                      </>
                                    )}
                                  </button>
                                </div>

                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                  </div>
                );
              })}
          </div>
        ) : (
          /* View Mode 2: Dense Table View */
          <div className="overflow-x-auto rounded-3xl border border-border bg-card/60 shadow-md">
            <table className="w-full text-left text-xs border-collapse font-sans">
              <thead>
                <tr className="border-b border-border/80 bg-muted/40 font-mono text-muted-foreground uppercase text-[11px]">
                  <th className="p-4">Number</th>
                  <th className="p-4">Question & Statutory Topic</th>
                  <th className="p-4">Section</th>
                  <th className="p-4">Statutory Citations</th>
                  <th className="p-4">Target Personas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {filteredFaqs.map((faq) => (
                  <tr key={faq.id} className="hover:bg-muted/20 transition-colors">
                    <td className="p-4 font-mono font-bold text-primary whitespace-nowrap">
                      Q {faq.number}
                    </td>
                    <td className="p-4 max-w-md">
                      <div className="font-semibold text-foreground">{faq.title}</div>
                      <div className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                        {faq.shortSummary}
                      </div>
                    </td>
                    <td className="p-4 whitespace-nowrap text-muted-foreground">
                      {faq.sectionTitle}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {faq.statutes.map((s, i) => (
                          <span key={i} className="px-1.5 py-0.5 rounded bg-muted text-[10px] font-mono">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground whitespace-nowrap">
                      {faq.targetPersonas.join(', ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}
