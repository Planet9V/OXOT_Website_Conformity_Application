import React, { useState, useMemo } from "react";
import { Link } from "wouter";
import {
  BookOpen,
  Search,
  ExternalLink,
  ShieldCheck,
  Scale,
  FileCode,
  FileCheck2,
  Cpu,
  Layers,
  ArrowRight,
  Sparkles,
  Copy,
  Check,
  AlertTriangle,
  FolderTree,
  FileText,
  Workflow,
  ChevronRight,
  Hash,
  Compass,
  Bookmark,
  Gavel,
} from "lucide-react";
import {
  recitalsData,
  articlesData,
  annexesData,
  graphData,
} from "@/data/craCorpusData";

export default function CraWikiPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<"articles" | "recitals" | "annexes">("articles");
  const [selectedArticleNum, setSelectedArticleNum] = useState<number>(21);
  const [selectedRecitalNum, setSelectedRecitalNum] = useState<number>(34);
  const [selectedAnnexNum, setSelectedAnnexNum] = useState<string>("I");
  const [copiedLink, setCopiedLink] = useState(false);

  // Flatten all articles
  const allArticles = useMemo(() => {
    const list: any[] = [];
    for (const chap of articlesData.chapters) {
      for (const art of chap.articles) {
        list.push({
          ...art,
          chapterNumber: chap.chapterNumber,
          chapterTitle: chap.chapterTitle,
        });
      }
    }
    return list;
  }, []);

  // Filtered lists
  const filteredArticles = useMemo(() => {
    if (!searchQuery.trim()) return allArticles;
    const q = searchQuery.toLowerCase();
    return allArticles.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.articleNumber.toString() === q ||
        a.paragraphs.some((p: any) => p.text.toLowerCase().includes(q)) ||
        (a.legalCommentary && a.legalCommentary.toLowerCase().includes(q))
    );
  }, [allArticles, searchQuery]);

  const filteredRecitals = useMemo(() => {
    if (!searchQuery.trim()) return recitalsData.recitals;
    const q = searchQuery.toLowerCase();
    return recitalsData.recitals.filter(
      (r: any) =>
        r.title.toLowerCase().includes(q) ||
        r.number.toString() === q ||
        r.text.toLowerCase().includes(q) ||
        (r.tags && r.tags.some((t: string) => t.toLowerCase().includes(q)))
    );
  }, [searchQuery]);

  const filteredAnnexes = useMemo(() => {
    if (!searchQuery.trim()) return annexesData.annexes;
    const q = searchQuery.toLowerCase();
    return annexesData.annexes.filter(
      (a: any) =>
        a.title.toLowerCase().includes(q) ||
        a.annexNumber.toLowerCase() === q ||
        (a.classI && a.classI.some((c: string) => c.toLowerCase().includes(q))) ||
        (a.classII && a.classII.some((c: string) => c.toLowerCase().includes(q)))
    );
  }, [searchQuery]);

  // Current active item
  const currentArticle = useMemo(() => {
    return allArticles.find((a) => a.articleNumber === selectedArticleNum) || allArticles[0];
  }, [allArticles, selectedArticleNum]);

  const currentRecital = useMemo(() => {
    return recitalsData.recitals.find((r: any) => r.number === selectedRecitalNum) || recitalsData.recitals[0];
  }, [selectedRecitalNum]);

  const currentAnnex = useMemo(() => {
    return annexesData.annexes.find((a: any) => a.annexNumber === selectedAnnexNum) || annexesData.annexes[0];
  }, [selectedAnnexNum]);

  // Bidirectional backlinks for current article
  const activeBacklinks = useMemo(() => {
    if (selectedType !== "articles") return { recitals: [], annexes: [], features: [] };
    const edges = graphData.edges;
    const artKey = `ARTICLE_${currentArticle.articleNumber}`;
    const recitals: number[] = [];
    const annexes: string[] = [];
    const features: string[] = [];

    for (const edge of edges) {
      if (edge.source === artKey || edge.target === artKey) {
        if (edge.target.startsWith("RECITAL_")) recitals.push(parseInt(edge.target.replace("RECITAL_", ""), 10));
        if (edge.target.startsWith("ANNEX_")) annexes.push(edge.target.replace("ANNEX_", ""));
        if (edge.target.startsWith("APP_FEATURE_")) features.push(edge.target);
        if (edge.source.startsWith("RECITAL_")) recitals.push(parseInt(edge.source.replace("RECITAL_", ""), 10));
      }
    }

    return {
      recitals: Array.from(new Set(recitals)),
      annexes: Array.from(new Set(annexes)),
      features: Array.from(new Set(features)),
    };
  }, [currentArticle, selectedType]);

  const copyCitation = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background font-sans text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* Top Banner with Official Citation Badge */}
      <header className="border-b border-border/80 bg-card/60 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shadow-sm">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-display font-medium text-base tracking-tight text-foreground">
                  EU Cyber Resilience Act
                </span>
                <span className="font-mono text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full bg-primary/15 text-primary border border-primary/30 font-semibold">
                  Regulation (EU) 2024/2847
                </span>
              </div>
              <p className="text-[11px] font-mono text-muted-foreground">
                Official Journal Publication • OJ L, 2024/2847 • CELEX 32024R2847
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="font-mono text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-md hover:bg-muted/50"
            >
              Back to Overview
            </Link>
            <Link
              href="/partner-hub"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-primary-foreground font-sans font-medium text-xs shadow-sm hover:bg-primary/90 transition-all"
            >
              <Workflow className="w-3.5 h-3.5" />
              Launch Conformity Hub
            </Link>
          </div>
        </div>
      </header>

      {/* Subheader Search and Category Selector */}
      <div className="border-b border-border/60 bg-muted/20 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Navigation Mode Tabs */}
          <div className="flex items-center gap-1 bg-card/80 p-1 rounded-lg border border-border/80 shadow-xs">
            <button
              onClick={() => setSelectedType("articles")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                selectedType === "articles"
                  ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Articles</span>
              <span className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedType === "articles" ? "bg-black/20 text-white" : "bg-muted text-muted-foreground"
              }`}>
                {articlesData.totalArticles}
              </span>
            </button>

            <button
              onClick={() => setSelectedType("recitals")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                selectedType === "recitals"
                  ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Recitals</span>
              <span className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedType === "recitals" ? "bg-black/20 text-white" : "bg-muted text-muted-foreground"
              }`}>
                {recitalsData.totalRecitals}
              </span>
            </button>

            <button
              onClick={() => setSelectedType("annexes")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-medium transition-all ${
                selectedType === "annexes"
                  ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Annexes</span>
              <span className={`font-mono text-[10px] px-1.5 py-0.2 rounded-full ${
                selectedType === "annexes" ? "bg-black/20 text-white" : "bg-muted text-muted-foreground"
              }`}>
                {annexesData.totalAnnexes}
              </span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={`Search ${selectedType} by keyword, article number, or topic...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg bg-card/80 border border-border/80 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/70"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-muted-foreground hover:text-foreground"
              >
                CLEAR
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main 3-Pane Reader Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT PANE: Directory & Chapter Navigator (3 cols) */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="bg-card/70 border border-border/80 rounded-xl p-4 shadow-xs backdrop-blur-md">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/60">
              <span className="font-mono text-xs tracking-wider uppercase text-muted-foreground font-semibold flex items-center gap-1.5">
                <FolderTree className="w-3.5 h-3.5 text-primary" />
                Statutory Index
              </span>
              <span className="font-mono text-[11px] text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                {selectedType === "articles" && `${filteredArticles.length} / ${articlesData.totalArticles}`}
                {selectedType === "recitals" && `${filteredRecitals.length} / ${recitalsData.totalRecitals}`}
                {selectedType === "annexes" && `${filteredAnnexes.length} / ${annexesData.totalAnnexes}`}
              </span>
            </div>

            <div className="space-y-1 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
              {selectedType === "articles" && (
                <div className="space-y-4">
                  {articlesData.chapters.map((chap) => {
                    const chapterArts = filteredArticles.filter((a) => a.chapterNumber === chap.chapterNumber);
                    if (chapterArts.length === 0) return null;

                    return (
                      <div key={chap.chapterNumber} className="space-y-1">
                        <div className="px-2 py-1 text-[11px] font-mono text-muted-foreground uppercase tracking-wider font-medium flex items-center justify-between bg-muted/30 rounded-md">
                          <span>Chapter {chap.chapterNumber}</span>
                          <span className="text-[10px] text-muted-foreground/70">{chap.articlesRange}</span>
                        </div>
                        {chapterArts.map((art) => {
                          const isActive = currentArticle.articleNumber === art.articleNumber;
                          return (
                            <button
                              key={art.articleNumber}
                              onClick={() => setSelectedArticleNum(art.articleNumber)}
                              className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-all flex items-start justify-between gap-2 ${
                                isActive
                                  ? "bg-primary/15 text-primary border-l-2 border-primary font-medium"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                              }`}
                            >
                              <span className="truncate">
                                <span className="font-mono font-semibold mr-1.5">Art. {art.articleNumber}</span>
                                {art.title}
                              </span>
                              {isActive && <ChevronRight className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              )}

              {selectedType === "recitals" && (
                <div className="space-y-1">
                  {filteredRecitals.map((rec: any) => {
                    const isActive = currentRecital.number === rec.number;
                    return (
                      <button
                        key={rec.number}
                        onClick={() => setSelectedRecitalNum(rec.number)}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs transition-all flex items-start justify-between gap-2 ${
                          isActive
                            ? "bg-primary/15 text-primary border-l-2 border-primary font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                        }`}
                      >
                        <span className="truncate">
                          <span className="font-mono font-semibold mr-1.5">({rec.number})</span>
                          {rec.title}
                        </span>
                        {isActive && <ChevronRight className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {selectedType === "annexes" && (
                <div className="space-y-1">
                  {filteredAnnexes.map((ann: any) => {
                    const isActive = currentAnnex.annexNumber === ann.annexNumber;
                    return (
                      <button
                        key={ann.annexNumber}
                        onClick={() => setSelectedAnnexNum(ann.annexNumber)}
                        className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-all flex items-start justify-between gap-2 ${
                          isActive
                            ? "bg-primary/15 text-primary border-l-2 border-primary font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                        }`}
                      >
                        <span className="truncate">
                          <span className="font-mono font-semibold mr-1.5">Annex {ann.annexNumber}</span>
                          {ann.title}
                        </span>
                        {isActive && <ChevronRight className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* CENTER PANE: Verbatim Statutory Content (6 cols) */}
        <main className="lg:col-span-6 space-y-6">
          {selectedType === "articles" && (
            <article className="bg-card/80 border border-border/80 rounded-xl p-6 shadow-sm backdrop-blur-md space-y-6">
              {/* Article Header */}
              <div className="border-b border-border/60 pb-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-md border border-primary/20">
                      Article {currentArticle.articleNumber}
                    </span>
                    <span className="font-mono text-[11px] text-muted-foreground">
                      Chapter {currentArticle.chapterNumber}: {currentArticle.chapterTitle}
                    </span>
                  </div>
                  <button
                    onClick={() =>
                      copyCitation(
                        `Regulation (EU) 2024/2847, Article ${currentArticle.articleNumber} ("${currentArticle.title}")`
                      )
                    }
                    className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground hover:text-primary transition-colors bg-muted/40 px-2 py-1 rounded-md border border-border/60"
                  >
                    {copiedLink ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedLink ? "Copied" : "Cite"}</span>
                  </button>
                </div>
                <h1 className="font-display font-medium text-2xl tracking-tight text-foreground">
                  {currentArticle.title}
                </h1>
              </div>

              {/* Legal Advisor Callout Card */}
              {currentArticle.legalCommentary && (
                <div className="p-4 rounded-lg bg-primary/[0.04] border-l-4 border-l-primary border border-y-primary/20 border-r-primary/20 space-y-2">
                  <div className="flex items-center gap-2">
                    <Gavel className="w-4 h-4 text-primary" />
                    <span className="font-mono text-xs font-semibold tracking-wider uppercase text-primary">
                      Legal Advisor Statutory Assessment
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {currentArticle.legalCommentary}
                  </p>
                </div>
              )}

              {/* Verbatim Paragraphs */}
              <div className="space-y-4 pt-2">
                <div className="font-mono text-[11px] tracking-wider uppercase text-muted-foreground font-semibold flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5 text-primary" />
                  Official Statutory Text (Verbatim)
                </div>
                {currentArticle.paragraphs.map((para: any) => (
                  <div
                    key={para.paragraphNumber}
                    id={`art-${currentArticle.articleNumber}-${para.paragraphNumber}`}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/20 border border-transparent hover:border-border/60 transition-colors group"
                  >
                    <span className="font-mono text-xs font-bold text-primary bg-primary/10 w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 border border-primary/20">
                      {para.paragraphNumber}
                    </span>
                    <p className="text-sm text-foreground/90 leading-relaxed font-sans flex-1">
                      {para.text}
                    </p>
                    <a
                      href={`#art-${currentArticle.articleNumber}-${para.paragraphNumber}`}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-primary transition-opacity"
                      title="Anchor link to paragraph"
                    >
                      <Hash className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ))}
              </div>
            </article>
          )}

          {selectedType === "recitals" && (
            <article className="bg-card/80 border border-border/80 rounded-xl p-6 shadow-sm backdrop-blur-md space-y-6">
              <div className="border-b border-border/60 pb-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-md border border-primary/20">
                    Recital ({currentRecital.number})
                  </span>
                  <button
                    onClick={() =>
                      copyCitation(`Regulation (EU) 2024/2847, Recital (${currentRecital.number})`)
                    }
                    className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground hover:text-primary transition-colors bg-muted/40 px-2 py-1 rounded-md border border-border/60"
                  >
                    {copiedLink ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedLink ? "Copied" : "Cite"}</span>
                  </button>
                </div>
                <h1 className="font-display font-medium text-2xl tracking-tight text-foreground">
                  {currentRecital.title}
                </h1>
                {currentRecital.tags && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {currentRecital.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-secondary/15 text-secondary-foreground border border-secondary/30"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="p-4 rounded-lg bg-muted/20 border border-border/60 space-y-3">
                <div className="font-mono text-[11px] tracking-wider uppercase text-muted-foreground font-semibold flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5 text-primary" />
                  Preamble Statutory Intent
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed font-sans">
                  {currentRecital.text}
                </p>
              </div>

              {currentRecital.relatedArticles && currentRecital.relatedArticles.length > 0 && (
                <div className="space-y-2 pt-2">
                  <span className="font-mono text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Related Statutory Articles
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {currentRecital.relatedArticles.map((artNum: number) => (
                      <button
                        key={artNum}
                        onClick={() => {
                          setSelectedType("articles");
                          setSelectedArticleNum(artNum);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-card border border-border hover:border-primary text-xs font-mono text-foreground hover:text-primary transition-all"
                      >
                        <FileText className="w-3 h-3 text-primary" />
                        <span>Article {artNum}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </article>
          )}

          {selectedType === "annexes" && (
            <article className="bg-card/80 border border-border/80 rounded-xl p-6 shadow-sm backdrop-blur-md space-y-6">
              <div className="border-b border-border/60 pb-4 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-0.5 rounded-md border border-primary/20">
                    Annex {currentAnnex.annexNumber}
                  </span>
                  <button
                    onClick={() =>
                      copyCitation(
                        `Regulation (EU) 2024/2847, Annex ${currentAnnex.annexNumber} ("${currentAnnex.title}")`
                      )
                    }
                    className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground hover:text-primary transition-colors bg-muted/40 px-2 py-1 rounded-md border border-border/60"
                  >
                    {copiedLink ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedLink ? "Copied" : "Cite"}</span>
                  </button>
                </div>
                <h1 className="font-display font-medium text-2xl tracking-tight text-foreground">
                  {currentAnnex.title}
                </h1>
              </div>

              {/* Verbatim annex text from the Official Journal. Rendering the corpus's
                  ordered text lines means every annex shows content — the previous
                  shape-specific branches left five of eight annexes blank. */}
              <div className="space-y-2">
                {currentAnnex.blocks.map((line: string, idx: number) => {
                  const point = /^(\(?[a-z0-9]{1,4}\)|\d{1,2}\.)\s+(.*)$/i.exec(line);
                  const isHeading = !point && line === line.toUpperCase() && line.length < 90;
                  if (isHeading) {
                    return (
                      <h3 key={idx} className="font-sans font-semibold text-sm text-foreground pt-4 first:pt-0">
                        {line}
                      </h3>
                    );
                  }
                  return (
                    <div key={idx} className="flex items-start gap-2 text-xs leading-relaxed text-foreground/90">
                      {point && <span className="font-mono text-primary font-bold shrink-0">{point[1]}</span>}
                      <span>{point ? point[2] : line}</span>
                    </div>
                  );
                })}
              </div>

            </article>
          )}
        </main>

        {/* RIGHT PANE: Bidirectional Backlinks & Execution Actions (3 cols) */}
        <aside className="lg:col-span-3 space-y-4">
          <div className="bg-card/70 border border-border/80 rounded-xl p-4 shadow-xs backdrop-blur-md space-y-4">
            <div className="pb-3 border-b border-border/60 flex items-center justify-between">
              <span className="font-mono text-xs tracking-wider uppercase text-muted-foreground font-semibold flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-primary" />
                Cross-References
              </span>
              <span className="font-mono text-[10px] text-muted-foreground">Graph Linked</span>
            </div>

            {/* Backlink Recitals */}
            {activeBacklinks.recitals.length > 0 && (
              <div className="space-y-2">
                <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                  Associated Recitals
                </span>
                <div className="space-y-1.5">
                  {activeBacklinks.recitals.map((recNum) => {
                    const r = recitalsData.recitals.find((item: any) => item.number === recNum);
                    if (!r) return null;
                    return (
                      <button
                        key={recNum}
                        onClick={() => {
                          setSelectedType("recitals");
                          setSelectedRecitalNum(recNum);
                        }}
                        className="w-full text-left p-2.5 rounded-lg bg-muted/30 hover:bg-muted/60 border border-border/60 hover:border-primary transition-all text-xs space-y-1"
                      >
                        <div className="font-mono font-semibold text-primary flex items-center justify-between">
                          <span>Recital ({r.number})</span>
                          <ChevronRight className="w-3 h-3" />
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-2">{r.title}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Backlink Annexes */}
            {activeBacklinks.annexes.length > 0 && (
              <div className="space-y-2">
                <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
                  Associated Annexes
                </span>
                <div className="space-y-1.5">
                  {activeBacklinks.annexes.map((annNum) => {
                    const a = annexesData.annexes.find((item: any) => item.annexNumber === annNum);
                    if (!a) return null;
                    return (
                      <button
                        key={annNum}
                        onClick={() => {
                          setSelectedType("annexes");
                          setSelectedAnnexNum(annNum);
                        }}
                        className="w-full text-left p-2.5 rounded-lg bg-muted/30 hover:bg-muted/60 border border-border/60 hover:border-primary transition-all text-xs space-y-1"
                      >
                        <div className="font-mono font-semibold text-primary flex items-center justify-between">
                          <span>Annex {a.annexNumber}</span>
                          <ChevronRight className="w-3 h-3" />
                        </div>
                        <p className="text-[11px] text-muted-foreground line-clamp-2">{a.title}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* App Action Triggers */}
            <div className="space-y-2 pt-2 border-t border-border/60">
              <span className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground font-medium flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-primary" />
                Live Workbench Actions
              </span>
              <div className="space-y-2">
                {currentArticle.articleNumber === 21 && (
                  <Link
                    href="/partner-hub"
                    className="w-full p-3 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/40 transition-all text-xs block space-y-1 text-left"
                  >
                    <div className="font-medium text-primary flex items-center justify-between">
                      <span>Article 21 Wizard</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Evaluate SI modifications against Recital 34 spare parts boundaries.
                    </p>
                  </Link>
                )}

                {currentArticle.articleNumber === 14 && (
                  <Link
                    href="/psirt"
                    className="w-full p-3 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/40 transition-all text-xs block space-y-1 text-left"
                  >
                    <div className="font-medium text-primary flex items-center justify-between">
                      <span>24h CSIRT Incident Hub</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Early reporting workflow applying on 11 Sept 2026.
                    </p>
                  </Link>
                )}

                {(currentArticle.articleNumber === 18 || currentArticle.articleNumber === 19) && (
                  <Link
                    href="/partner-hub"
                    className="w-full p-3 rounded-lg bg-primary/10 hover:bg-primary/20 border border-primary/40 transition-all text-xs block space-y-1 text-left"
                  >
                    <div className="font-medium text-primary flex items-center justify-between">
                      <span>Supplier Due Diligence</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Enforce Duty to Refrain and distributor CE verification.
                    </p>
                  </Link>
                )}

                <Link
                  href="/partner-hub"
                  className="w-full p-2.5 rounded-lg bg-muted/40 hover:bg-muted/80 border border-border/80 transition-all text-xs block text-center font-medium text-muted-foreground hover:text-foreground"
                >
                  Explore Compliance Cockpit
                </Link>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
