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
  }, [selectedType, currentArticle]);

  const copyCitation = (citation: string) => {
    navigator.clipboard.writeText(citation);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-cyan-950/60 bg-[#0B1222]/90 backdrop-blur-md sticky top-0 z-30 px-6 py-4 flex flex-wrap items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-white tracking-tight">EU Cyber Resilience Act (CRA)</h1>
              <span className="px-2 py-0.5 text-xs font-mono bg-cyan-950 text-cyan-400 border border-cyan-800/60 rounded">
                Regulation (EU) 2024/2847
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Statutory Single Source of Truth • Word-for-Word Verbatim Official Journal Publication
            </p>
          </div>
        </div>

        {/* Search & Navigation Bar */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search articles, recitals, SBOM, Art. 21, fines..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#050811] border border-slate-700/80 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/partner-scope"
            className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <span>Partner Scope Cockpit</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/conformity/partner-hub"
            className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <span>Enterprise Workbench</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main 3-Pane Body */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        {/* Left Pane: Table of Contents & Navigation */}
        <aside className="col-span-12 md:col-span-3 border-r border-slate-800/80 bg-[#090E1B] p-4 flex flex-col h-[calc(100vh-73px)] overflow-y-auto">
          {/* View Mode Toggle */}
          <div className="grid grid-cols-3 p-1 bg-slate-900/90 rounded-lg border border-slate-800 mb-4 text-xs font-medium">
            <button
              onClick={() => setSelectedType("articles")}
              className={`py-1.5 rounded text-center transition-all ${
                selectedType === "articles"
                  ? "bg-cyan-500 text-slate-950 font-bold shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Articles ({filteredArticles.length})
            </button>
            <button
              onClick={() => setSelectedType("recitals")}
              className={`py-1.5 rounded text-center transition-all ${
                selectedType === "recitals"
                  ? "bg-cyan-500 text-slate-950 font-bold shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Recitals ({filteredRecitals.length})
            </button>
            <button
              onClick={() => setSelectedType("annexes")}
              className={`py-1.5 rounded text-center transition-all ${
                selectedType === "annexes"
                  ? "bg-cyan-500 text-slate-950 font-bold shadow"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Annexes ({filteredAnnexes.length})
            </button>
          </div>

          {/* List of Entries */}
          <div className="space-y-1 overflow-y-auto flex-1 pr-1">
            {selectedType === "articles" && (
              <div className="space-y-4">
                {articlesData.chapters.map((chap) => {
                  const chapArticles = filteredArticles.filter((a) => a.chapterNumber === chap.chapterNumber);
                  if (chapArticles.length === 0) return null;
                  return (
                    <div key={chap.chapterNumber} className="space-y-1">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1 flex items-center gap-1.5">
                        <FolderTree className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Chapter {chap.chapterNumber}: {chap.chapterTitle}</span>
                      </div>
                      {chapArticles.map((art) => (
                        <button
                          key={art.articleNumber}
                          onClick={() => setSelectedArticleNum(art.articleNumber)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between gap-2 ${
                            selectedArticleNum === art.articleNumber
                              ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold"
                              : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                          }`}
                        >
                          <span className="truncate">
                            <strong className="text-cyan-400 mr-1.5">Art. {art.articleNumber}</strong>
                            {art.title}
                          </span>
                          {art.articleNumber === 21 && (
                            <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded text-[10px]">
                              SI Core
                            </span>
                          )}
                          {art.articleNumber === 14 && (
                            <span className="px-1.5 py-0.2 bg-red-500/20 text-red-300 border border-red-500/40 rounded text-[10px]">
                              2026
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}

            {selectedType === "recitals" && (
              <div className="space-y-1">
                {filteredRecitals.map((rec: any) => (
                  <button
                    key={rec.number}
                    onClick={() => setSelectedRecitalNum(rec.number)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between gap-2 ${
                      selectedRecitalNum === rec.number
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold"
                        : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                    }`}
                  >
                    <span className="truncate">
                      <strong className="text-cyan-400 mr-1.5">Recital {rec.number}</strong>
                      {rec.title}
                    </span>
                    {rec.number === 34 && (
                      <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded text-[10px]">
                        Spares
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {selectedType === "annexes" && (
              <div className="space-y-1">
                {filteredAnnexes.map((annex: any) => (
                  <button
                    key={annex.annexNumber}
                    onClick={() => setSelectedAnnexNum(annex.annexNumber)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between gap-2 ${
                      selectedAnnexNum === annex.annexNumber
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold"
                        : "text-slate-300 hover:bg-slate-800/60 hover:text-white"
                    }`}
                  >
                    <span className="truncate">
                      <strong className="text-cyan-400 mr-1.5">Annex {annex.annexNumber}</strong>
                      {annex.title}
                    </span>
                    {annex.annexNumber === "I" && (
                      <span className="px-1.5 py-0.2 bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded text-[10px]">
                        Essential
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Center Pane: Verbatim Legal Text & Paragraphs */}
        <main className="col-span-12 md:col-span-6 p-8 h-[calc(100vh-73px)] overflow-y-auto bg-[#070B14]">
          {selectedType === "articles" && currentArticle && (
            <div className="max-w-2xl mx-auto space-y-6">
              {/* Breadcrumb & Chapter Title */}
              <div className="text-xs text-slate-400 flex items-center gap-2">
                <span>Regulation (EU) 2024/2847</span>
                <span>/</span>
                <span>Chapter {currentArticle.chapterNumber}: {currentArticle.chapterTitle}</span>
              </div>

              {/* Title & Citation Copy */}
              <div className="border-b border-slate-800 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                      Article {currentArticle.articleNumber}
                    </span>
                    <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
                      {currentArticle.title}
                    </h2>
                  </div>
                  <button
                    onClick={() => copyCitation(`Regulation (EU) 2024/2847, Article ${currentArticle.articleNumber}`)}
                    className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs flex items-center gap-1.5 transition-colors border border-slate-700"
                    title="Copy official statutory citation"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? "Copied" : "Cite"}</span>
                  </button>
                </div>
              </div>

              {/* Legal Advisor Commentary Card */}
              {currentArticle.legalCommentary && (
                <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-950/40 to-slate-900 border border-cyan-500/30 text-xs space-y-1.5 shadow-lg">
                  <div className="flex items-center gap-2 text-cyan-400 font-semibold">
                    <Scale className="w-4 h-4" />
                    <span>Legal Advisor Commentary & Operational Impact</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">
                    {currentArticle.legalCommentary}
                  </p>
                </div>
              )}

              {/* Verbatim Paragraphs */}
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Official Statutory Text (Verbatim)
                </div>
                {currentArticle.paragraphs.map((para: any) => (
                  <div
                    key={para.paragraphNumber}
                    id={`art-${currentArticle.articleNumber}-${para.paragraphNumber}`}
                    className="p-4 rounded-xl bg-[#0B1222] border border-slate-800/80 hover:border-slate-700 transition-colors space-y-2 group"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-mono font-semibold text-cyan-400/80">
                        § {para.paragraphNumber}
                      </span>
                      <a
                        href={`#art-${currentArticle.articleNumber}-${para.paragraphNumber}`}
                        className="opacity-0 group-hover:opacity-100 text-slate-500 hover:text-cyan-400 transition-opacity font-mono text-[11px]"
                      >
                        #art-{currentArticle.articleNumber}-{para.paragraphNumber}
                      </a>
                    </div>
                    <p className="text-sm text-slate-200 leading-relaxed font-serif">
                      {para.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {selectedType === "recitals" && currentRecital && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-xs text-slate-400">Regulation (EU) 2024/2847 / Preamble & Recitals</div>
              <div className="border-b border-slate-800 pb-4 flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono text-cyan-400 font-bold uppercase">
                    Recital ({currentRecital.number})
                  </span>
                  <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
                    {currentRecital.title}
                  </h2>
                </div>
              </div>
              <div className="p-6 rounded-xl bg-[#0B1222] border border-slate-800 space-y-3">
                <p className="text-sm text-slate-200 leading-relaxed font-serif">
                  "{currentRecital.text}"
                </p>
                {currentRecital.tags && (
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    {currentRecital.tags.map((tag: string) => (
                      <span key={tag} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-mono">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {selectedType === "annexes" && currentAnnex && (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="text-xs text-slate-400">Regulation (EU) 2024/2847 / Statutory Annexes</div>
              <div className="border-b border-slate-800 pb-4">
                <span className="text-xs font-mono text-cyan-400 font-bold uppercase">
                  Annex {currentAnnex.annexNumber}
                </span>
                <h2 className="text-2xl font-bold text-white tracking-tight mt-1">
                  {currentAnnex.title}
                </h2>
              </div>

              {currentAnnex.parts && (
                <div className="space-y-6">
                  {currentAnnex.parts.map((p: any) => (
                    <div key={p.partNumber} className="p-5 rounded-xl bg-[#0B1222] border border-slate-800 space-y-3">
                      <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                        Part {p.partNumber}: {p.partTitle}
                      </div>
                      <div className="space-y-3">
                        {p.requirements.map((req: any) => (
                          <div key={req.id} className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-xs space-y-1">
                            <div className="font-semibold text-white">{req.clause}</div>
                            <div className="text-slate-400">{req.description}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {currentAnnex.classI && (
                <div className="p-5 rounded-xl bg-[#0B1222] border border-slate-800 space-y-4">
                  <div>
                    <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                      Class I Important Products (Annex III Part I)
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                      {currentAnnex.classI.map((item: string, i: number) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">
                      Class II Important Products (Annex III Part II - Mandatory Notified Body)
                    </div>
                    <ul className="space-y-1.5 text-xs text-slate-300 list-disc list-inside">
                      {currentAnnex.classII.map((item: string, i: number) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        {/* Right Pane: Bidirectional Backlinks & Workbench Actions */}
        <aside className="col-span-12 md:col-span-3 border-l border-slate-800/80 bg-[#090E1B] p-4 flex flex-col h-[calc(100vh-73px)] overflow-y-auto space-y-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
              <Workflow className="w-3.5 h-3.5 text-cyan-400" />
              <span>Bidirectional Backlinks</span>
            </h3>

            {selectedType === "articles" && (
              <div className="space-y-4">
                {/* Related Recitals */}
                {activeBacklinks.recitals.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-[11px] font-semibold text-slate-400">Preambles & Recitals</div>
                    {activeBacklinks.recitals.map((recNum) => (
                      <button
                        key={recNum}
                        onClick={() => {
                          setSelectedType("recitals");
                          setSelectedRecitalNum(recNum);
                        }}
                        className="w-full text-left p-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-xs text-cyan-300 transition-all flex items-center justify-between group"
                      >
                        <span>Recital ({recNum})</span>
                        <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Related Annexes */}
                {activeBacklinks.annexes.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-[11px] font-semibold text-slate-400">Statutory Annexes</div>
                    {activeBacklinks.annexes.map((annexNum) => (
                      <button
                        key={annexNum}
                        onClick={() => {
                          setSelectedType("annexes");
                          setSelectedAnnexNum(annexNum);
                        }}
                        className="w-full text-left p-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-purple-500/50 text-xs text-purple-300 transition-all flex items-center justify-between group"
                      >
                        <span>Annex {annexNum}</span>
                        <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Direct Workbench Action Triggers */}
                {activeBacklinks.features.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div className="text-[11px] font-semibold text-slate-400">Execute in Application</div>
                    {activeBacklinks.features.map((feat) => {
                      if (feat === "APP_FEATURE_ARTICLE_21_WIZARD") {
                        return (
                          <Link
                            key={feat}
                            href="/conformity/partner-hub"
                            className="w-full p-2.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-semibold flex items-center justify-between transition-all"
                          >
                            <span>Launch Article 21 Wizard</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        );
                      }
                      if (feat === "APP_FEATURE_PSIRT_EARLY_WARNING") {
                        return (
                          <Link
                            key={feat}
                            href="/conformity/partner-hub"
                            className="w-full p-2.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-300 text-xs font-semibold flex items-center justify-between transition-all"
                          >
                            <span>24h CSIRT Incident Hub</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        );
                      }
                      if (feat === "APP_FEATURE_SUPPLIER_REGISTRY") {
                        return (
                          <Link
                            key={feat}
                            href="/conformity/partner-hub"
                            className="w-full p-2.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center justify-between transition-all"
                          >
                            <span>OEM Supplier Registry</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        );
                      }
                      return (
                        <Link
                          key={feat}
                          href="/conformity"
                          className="w-full p-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-between transition-all"
                        >
                          <span>Open in Conformity Suite</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {selectedType !== "articles" && (
              <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-400 space-y-2">
                <p>Select any Article to explore its bidirectional legal graph and workbench integrations.</p>
                <button
                  onClick={() => setSelectedType("articles")}
                  className="text-cyan-400 hover:underline font-semibold"
                >
                  Return to Articles →
                </button>
              </div>
            )}
          </div>

          {/* Statutory Enforcement Metadata */}
          <div className="mt-auto p-3.5 rounded-xl bg-[#0B1222] border border-slate-800 text-xs space-y-2">
            <div className="flex items-center gap-2 text-slate-300 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Statutory Authority</span>
            </div>
            <div className="text-[11px] text-slate-400 space-y-1">
              <div>• <strong>Council of the EU</strong> & <strong>European Parliament</strong></div>
              <div>• Official Journal: <strong>OJ L 2024/2847</strong></div>
              <div>• Max Penalty: <strong>€15,000,000 / 2.5%</strong></div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
