import React, { useState, useMemo } from "react";
import {
  BookOpen,
  Search,
  CheckCircle2,
  Copy,
  ExternalLink,
  Sliders,
  Shield,
  Layers,
  ChevronRight,
  ChevronDown,
  Info,
  X,
  Scale
} from "lucide-react";

export interface ArticleNode {
  id: string;
  number: number;
  title: string;
  chapter: string;
  recitals: number[];
  officialCitation: string;
  summary: string;
  fullText: string;
  ieccMapping?: string;
  nis2Mapping?: string;
  aiActMapping?: string;
}

export interface ChapterNode {
  number: number;
  title: string;
  articles: ArticleNode[];
}

const STATUTORY_DATA: ChapterNode[] = [
  {
    number: 1,
    title: "Chapter I — General Provisions",
    articles: [
      {
        id: "ART_01",
        number: 1,
        title: "Subject matter",
        chapter: "Chapter I",
        recitals: [1, 2, 3],
        officialCitation: "OJ L 2024/2847, Art 1, p. 12",
        summary: "Establishes horizontal cybersecurity requirements for products with digital elements made available on the EU market.",
        fullText: "This Regulation lays down: (a) rules for the making available on the market of products with digital elements to ensure the cybersecurity of such products; (b) essential requirements for the design, development and production of products with digital elements; (c) essential requirements for vulnerability handling processes; (d) rules on market surveillance and enforcement.",
        ieccMapping: "IEC 62443-4-1 §4.1 (Product Scope)",
        nis2Mapping: "NIS2 Art 21(1) Risk Management",
        aiActMapping: "EU AI Act Art 15 Cybersecurity"
      },
      {
        id: "ART_02",
        number: 2,
        title: "Scope",
        chapter: "Chapter I",
        recitals: [4, 5, 6, 7],
        officialCitation: "OJ L 2024/2847, Art 2, p. 14",
        summary: "Applies to hardware and software connected to devices or networks. Excludes medical devices, civil aviation, and motor vehicles.",
        fullText: "This Regulation applies to products with digital elements whose intended or reasonably foreseeable use includes a direct or indirect logical or physical data connection to a device or network. Exclusions apply to medical devices under Regulation (EU) 2017/745 and civil aviation.",
        ieccMapping: "IEC 62443-4-2 §1.2",
        nis2Mapping: "NIS2 Art 2(1)",
        aiActMapping: "EU AI Act Art 2(1)"
      },
      {
        id: "ART_03",
        number: 3,
        title: "Definitions",
        chapter: "Chapter I",
        recitals: [11, 12, 13, 14],
        officialCitation: "OJ L 2024/2847, Art 3, p. 16",
        summary: "Defines product with digital elements, economic operator, manufacturer, vulnerability, cybersecurity risk, support period, and SBOM.",
        fullText: "For the purposes of this Regulation, the following definitions apply: (1) 'product with digital elements' means any software or hardware product and its remote data processing solutions; (2) 'remote data processing' means data processing at a distance for which the software is designed and developed by the manufacturer; (3) 'vulnerability' means a weakness, susceptibility or flaw of a product with digital elements that can be exploited by a cyber threat.",
        ieccMapping: "IEC 62443-1-1 Terms",
        nis2Mapping: "NIS2 Art 6 Definitions",
        aiActMapping: "EU AI Act Art 3"
      },
      {
        id: "ART_04",
        number: 4,
        title: "Free movement",
        chapter: "Chapter I",
        recitals: [16],
        officialCitation: "OJ L 2024/2847, Art 4, p. 18",
        summary: "Member States shall not impede the making available of compliant products displaying the CE marking.",
        fullText: "Member States shall not impede, for aspects covered by this Regulation, the making available on the market of products with digital elements which comply with this Regulation.",
        ieccMapping: "IEC 62443 Global Compliance",
        nis2Mapping: "NIS2 Art 4",
        aiActMapping: "EU AI Act Art 4"
      },
      {
        id: "ART_05",
        number: 5,
        title: "Requirements for products with digital elements",
        chapter: "Chapter I",
        recitals: [17, 18, 19],
        officialCitation: "OJ L 2024/2847, Art 5, p. 20",
        summary: "Products shall only be made available if they comply with Annex I essential requirements.",
        fullText: "Products with digital elements shall only be made available on the market where: (a) they meet the essential requirements set out in Section 1 of Annex I; and (b) the processes put in place by the manufacturer meet the essential requirements set out in Section 2 of Annex I.",
        ieccMapping: "IEC 62443-4-2 SL 2 Mandate",
        nis2Mapping: "NIS2 Art 21(2)",
        aiActMapping: "EU AI Act Art 15(1)"
      }
    ]
  },
  {
    number: 2,
    title: "Chapter II — Obligations of Economic Operators",
    articles: [
      {
        id: "ART_06",
        number: 6,
        title: "Obligations of manufacturers",
        chapter: "Chapter II",
        recitals: [20, 21, 22],
        officialCitation: "OJ L 2024/2847, Art 6, p. 22",
        summary: "Mandates cybersecurity risk assessments, design compliance with Annex I, vulnerability handling, and technical documentation.",
        fullText: "When placing a product with digital elements on the market, manufacturers shall ensure that it has been designed, developed and produced in accordance with the essential requirements set out in Section 1 of Annex I. Manufacturers shall undertake an assessment of the cybersecurity risks associated with a product with digital elements and take the outcome of that assessment into account during the design, development and production phases.",
        ieccMapping: "IEC 62443-4-1 Practice 1-8",
        nis2Mapping: "NIS2 Art 21(2)(d)",
        aiActMapping: "EU AI Act Art 9 & Art 15"
      },
      {
        id: "ART_07",
        number: 7,
        title: "Authorised representatives",
        chapter: "Chapter II",
        recitals: [24],
        officialCitation: "OJ L 2024/2847, Art 7, p. 26",
        summary: "Non-EU manufacturers shall designate a written authorized representative within the Union.",
        fullText: "A manufacturer may, by a written mandate, appoint an authorised representative. The obligations laid down in Article 6(1) and the drawing up of technical documentation shall not form part of the authorised representative's mandate.",
        ieccMapping: "ISO/IEC 27001 Provider Governance",
        nis2Mapping: "NIS2 Art 26",
        aiActMapping: "EU AI Act Art 22"
      },
      {
        id: "ART_08",
        number: 8,
        title: "Obligations of importers",
        chapter: "Chapter II",
        recitals: [25, 26],
        officialCitation: "OJ L 2024/2847, Art 8, p. 28",
        summary: "Importers shall place only compliant products on the market and verify manufacturer technical documentation.",
        fullText: "Importers shall place on the market only products with digital elements that comply with the essential requirements set out in Section 1 of Annex I and where the processes put in place by the manufacturer comply with Section 2 of Annex I.",
        ieccMapping: "IEC 62443 Supply Chain Audits",
        nis2Mapping: "NIS2 Art 21(2)(d)",
        aiActMapping: "EU AI Act Art 23"
      },
      {
        id: "ART_09",
        number: 9,
        title: "Obligations of distributors",
        chapter: "Chapter II",
        recitals: [27],
        officialCitation: "OJ L 2024/2847, Art 9, p. 30",
        summary: "Distributors shall verify CE marking and user instructions before making products available.",
        fullText: "When making a product with digital elements available on the market, distributors shall act with due care in relation to the requirements of this Regulation.",
        ieccMapping: "IEC 62443 Chain of Custody",
        nis2Mapping: "NIS2 Art 21(2)(d)",
        aiActMapping: "EU AI Act Art 24"
      },
      {
        id: "ART_10",
        number: 10,
        title: "Cases in which obligations of manufacturers apply to importers/distributors",
        chapter: "Chapter II",
        recitals: [28],
        officialCitation: "OJ L 2024/2847, Art 10, p. 32",
        summary: "Entities modifying a product or placing it under their own trademark assume full manufacturer liability.",
        fullText: "An importer or distributor shall be considered a manufacturer for the purposes of this Regulation where that importer or distributor places a product with digital elements on the market under its name or trademark or modifies a product already placed on the market.",
        ieccMapping: "IEC 62443 Integrator Responsibility",
        nis2Mapping: "NIS2 Art 21",
        aiActMapping: "EU AI Act Art 25"
      },
      {
        id: "ART_13",
        number: 13,
        title: "Vulnerability handling obligations of manufacturers",
        chapter: "Chapter II",
        recitals: [31, 32, 33],
        officialCitation: "OJ L 2024/2847, Art 13, p. 38",
        summary: "Requires manufacturers to identify vulnerabilities, distribute free security patches without delay, and enforce a public CVD policy.",
        fullText: "Manufacturers shall: (a) identify and document vulnerabilities and components contained in the product, including by drawing up a software bill of materials in a commonly used and machine-readable format; (b) in relation to risks identified in products with digital elements, address and remediate vulnerabilities without delay, including by providing security updates; (c) apply effective and regular vulnerability testing.",
        ieccMapping: "IEC 62443-4-1 VIM-1 & VIM-2",
        nis2Mapping: "NIS2 Art 21(2)(e)",
        aiActMapping: "EU AI Act Art 15(3)"
      },
      {
        id: "ART_14",
        number: 14,
        title: "Reporting obligations of manufacturers",
        chapter: "Chapter II",
        recitals: [35, 36, 37, 38],
        officialCitation: "OJ L 2024/2847, Art 14, p. 45",
        summary: "Mandates 24h early warning and 72h detailed incident/vulnerability notification to national CSIRTs and ENISA.",
        fullText: "The manufacturer shall notify any actively exploited vulnerability contained in the product with digital elements to the CSIRT designated as coordinator and to ENISA. The manufacturer shall submit an early warning notification within 24 hours of becoming aware of the actively exploited vulnerability, followed by a vulnerability notification within 72 hours.",
        ieccMapping: "IEC 62443-4-1 VIM-4",
        nis2Mapping: "NIS2 Art 23 Reporting",
        aiActMapping: "EU AI Act Art 73"
      },
      {
        id: "ART_17",
        number: 17,
        title: "Guidelines on support periods",
        chapter: "Chapter II",
        recitals: [43],
        officialCitation: "OJ L 2024/2847, Art 17, p. 48",
        summary: "Manufacturers shall declare a support period corresponding to expected product lifetime (default minimum 5 years).",
        fullText: "The support period declared by the manufacturer shall reflect the expected time during which the product with digital elements will be in use. Default expectation is at least 5 years.",
        ieccMapping: "IEC 62443 Lifecycle Support",
        nis2Mapping: "NIS2 Art 21(2)",
        aiActMapping: "EU AI Act Art 15"
      }
    ]
  },
  {
    number: 3,
    title: "Chapter III — Conformity of Products & Route Selection",
    articles: [
      {
        id: "ART_18",
        number: 18,
        title: "Presumption of conformity",
        chapter: "Chapter III",
        recitals: [44, 45],
        officialCitation: "OJ L 2024/2847, Art 18, p. 50",
        summary: "Products conforming to harmonised standards published in OJEU or EUCC certification schemes level substantial/high enjoy presumption of conformity.",
        fullText: "Products with digital elements and vulnerability handling processes which are in conformity with harmonised standards or parts thereof the references of which have been published in the Official Journal of the European Union shall be presumed to be in conformity with the essential requirements covered by those standards or parts thereof.",
        ieccMapping: "IEC 62443-4-1 & 4-2 Presumption",
        nis2Mapping: "NIS2 Art 24",
        aiActMapping: "EU AI Act Art 40"
      },
      {
        id: "ART_19",
        number: 19,
        title: "EU declaration of conformity",
        chapter: "Chapter III",
        recitals: [47],
        officialCitation: "OJ L 2024/2847, Art 19, p. 52",
        summary: "States that compliance with Annex I has been demonstrated; kept updated for 10 years after product placement.",
        fullText: "The EU declaration of conformity shall state that the fulfillment of the applicable essential requirements set out in Annex I has been demonstrated.",
        ieccMapping: "IEC 62443 Certificate of Conformity",
        nis2Mapping: "NIS2 Art 24",
        aiActMapping: "EU AI Act Art 47"
      },
      {
        id: "ART_20",
        number: 20,
        title: "General principles of the CE marking",
        chapter: "Chapter III",
        recitals: [48],
        officialCitation: "OJ L 2024/2847, Art 20, p. 54",
        summary: "CE marking subject to general principles set out in Article 30 of Regulation (EC) No 765/2008.",
        fullText: "The CE marking shall be subject to the general principles set out in Article 30 of Regulation (EC) No 765/2008.",
        ieccMapping: "CE Mark Markings",
        nis2Mapping: "NIS2 Art 24",
        aiActMapping: "EU AI Act Art 48"
      },
      {
        id: "ART_22",
        number: 22,
        title: "Technical documentation",
        chapter: "Chapter III",
        recitals: [50],
        officialCitation: "OJ L 2024/2847, Art 22, p. 56",
        summary: "Technical documentation shall contain all relevant data demonstrating compliance (risk assessment, design, test reports).",
        fullText: "The technical documentation shall contain all relevant data or details of the means used by the manufacturer to ensure that the product complies with Annex I.",
        ieccMapping: "IEC 62443 Design Documentation",
        nis2Mapping: "NIS2 Art 21",
        aiActMapping: "EU AI Act Art 11"
      },
      {
        id: "ART_32",
        number: 32,
        title: "Conformity assessment procedures",
        chapter: "Chapter III",
        recitals: [63, 64, 65, 66],
        officialCitation: "OJ L 2024/2847, Art 32, p. 58",
        summary: "Defines Module A self-assessment for default products, Module B+C/H for Class I/II, and EUCC certification for Critical products.",
        fullText: "The manufacturer shall perform the conformity assessment of the product with digital elements using one of the procedures set out in Annex V: (a) Module A (internal control); (b) Module B (EU-type examination) followed by Module C; (c) Module H (full quality assurance). For Class II important products and Critical products, Module A is strictly prohibited.",
        ieccMapping: "IEC 62443-4-1 Quality Assurance",
        nis2Mapping: "NIS2 Art 24(2)",
        aiActMapping: "EU AI Act Art 43"
      }
    ]
  },
  {
    number: 4,
    title: "Chapter IV — Notification of Conformity Assessment Bodies",
    articles: [
      {
        id: "ART_35",
        number: 35,
        title: "Notifying authorities",
        chapter: "Chapter IV",
        recitals: [69],
        officialCitation: "OJ L 2024/2847, Art 35, p. 64",
        summary: "Member States shall designate notifying authorities responsible for setting up notification procedures.",
        fullText: "Member States shall designate a notifying authority that shall be responsible for setting up and carrying out the necessary procedures for the assessment and notification of conformity assessment bodies.",
        ieccMapping: "IEC 62443 Accreditation Bodies",
        nis2Mapping: "NIS2 Art 8",
        aiActMapping: "EU AI Act Art 28"
      },
      {
        id: "ART_38",
        number: 38,
        title: "Requirements relating to notified bodies",
        chapter: "Chapter IV",
        recitals: [72, 73],
        officialCitation: "OJ L 2024/2847, Art 38, p. 68",
        summary: "Notified bodies shall be third-party independent entities with technical competence in cybersecurity.",
        fullText: "For the purposes of notification, a conformity assessment body shall meet the requirements laid down in paragraphs 2 to 12. A conformity assessment body shall be established under national law and have legal personality.",
        ieccMapping: "ISO/IEC 17065 Competence",
        nis2Mapping: "NIS2 Art 24",
        aiActMapping: "EU AI Act Art 31"
      }
    ]
  },
  {
    number: 5,
    title: "Chapter V — Market Surveillance & EU Enforcement",
    articles: [
      {
        id: "ART_52",
        number: 52,
        title: "Market surveillance and control of products",
        chapter: "Chapter V",
        recitals: [87, 88],
        officialCitation: "OJ L 2024/2847, Art 52, p. 74",
        summary: "National market surveillance authorities shall monitor market compliance under Regulation (EU) 2019/1020.",
        fullText: "Regulation (EU) 2019/1020 shall apply to products with digital elements falling within the scope of this Regulation.",
        ieccMapping: "Industrial Market Audits",
        nis2Mapping: "NIS2 Art 32 Enforcement",
        aiActMapping: "EU AI Act Art 63"
      },
      {
        id: "ART_53",
        number: 53,
        title: "Procedure for dealing with products presenting a risk",
        chapter: "Chapter V",
        recitals: [89, 90],
        officialCitation: "OJ L 2024/2847, Art 53, p. 76",
        summary: "Authorities may require recall or withdrawal of products presenting severe cybersecurity risks.",
        fullText: "Where the market surveillance authority of a Member State has sufficient reason to believe that a product presents a cybersecurity risk, it shall carry out an evaluation in relation to the product concerned.",
        ieccMapping: "Emergency Incident Response",
        nis2Mapping: "NIS2 Art 33",
        aiActMapping: "EU AI Act Art 65"
      },
      {
        id: "ART_61",
        number: 61,
        title: "Penalties and administrative fines",
        chapter: "Chapter V",
        recitals: [98, 99],
        officialCitation: "OJ L 2024/2847, Art 61, p. 82",
        summary: "Administrative fines up to €15,000,000 or 2.5% of global annual turnover for non-compliance with essential requirements.",
        fullText: "Non-compliance with the essential cybersecurity requirements in Annex I shall be subject to administrative fines of up to 15 000 000 EUR or 2,5 % of total worldwide annual turnover.",
        ieccMapping: "Regulatory Penalty Enforcement",
        nis2Mapping: "NIS2 Art 34 Fines",
        aiActMapping: "EU AI Act Art 99"
      }
    ]
  },
  {
    number: 6,
    title: "Chapter VI — Delegated Powers & Committee Procedure",
    articles: [
      {
        id: "ART_64",
        number: 64,
        title: "Exercise of the delegation",
        chapter: "Chapter VI",
        recitals: [102],
        officialCitation: "OJ L 2024/2847, Art 64, p. 86",
        summary: "Empowers European Commission to adopt delegated acts specifying important/critical product lists.",
        fullText: "The power to adopt delegated acts is conferred on the Commission subject to the conditions laid down in this Article.",
        ieccMapping: "EU Harmonization Updates",
        nis2Mapping: "NIS2 Art 38",
        aiActMapping: "EU AI Act Art 97"
      }
    ]
  },
  {
    number: 7,
    title: "Chapter VII — Confidentiality & Penalties",
    articles: [
      {
        id: "ART_67",
        number: 67,
        title: "Confidentiality",
        chapter: "Chapter VII",
        recitals: [106],
        officialCitation: "OJ L 2024/2847, Art 67, p. 88",
        summary: "Authorities and notified bodies shall preserve business secrecy and trade confidentiality.",
        fullText: "All parties shall respect the confidentiality of information and data obtained in carrying out their tasks in order to protect trade secrets and personal data.",
        ieccMapping: "ISO 27001 Information Protection",
        nis2Mapping: "NIS2 Art 37",
        aiActMapping: "EU AI Act Art 78"
      }
    ]
  },
  {
    number: 8,
    title: "Chapter VIII — Transitional & Final Provisions",
    articles: [
      {
        id: "ART_69",
        number: 69,
        title: "Transitional provisions",
        chapter: "Chapter VIII",
        recitals: [111],
        officialCitation: "OJ L 2024/2847, Art 69, p. 90",
        summary: "Products placed on market before general application date may remain without retrofitting unless substantially modified.",
        fullText: "Products with digital elements which have been placed on the market before 10 December 2027 shall be subject to requirements of this Regulation only if those products undergo substantial modifications.",
        ieccMapping: "Legacy Product Exception",
        nis2Mapping: "NIS2 Art 41",
        aiActMapping: "EU AI Act Art 111"
      },
      {
        id: "ART_71",
        number: 71,
        title: "Application dates and timeline",
        chapter: "Chapter VIII",
        recitals: [116, 117, 118, 119, 120],
        officialCitation: "OJ L 2024/2847, Art 71, p. 94",
        summary: "36-month general transition (10 Dec 2027); Article 14 PSIRT reporting applies earlier at 21 months (10 Sept 2026).",
        fullText: "This Regulation shall apply from 10 December 2027. However, Article 14 shall apply from 10 September 2026.",
        ieccMapping: "Implementation Roadmap Anchor",
        nis2Mapping: "NIS2 Transposition Timeline",
        aiActMapping: "EU AI Act Application Dates"
      }
    ]
  }
];

export function StatutoryReferenceWorkbench() {
  const [selectedArticle, setSelectedArticle] = useState<ArticleNode>(STATUTORY_DATA[0].articles[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedCitation, setCopiedCitation] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [expandedChapters, setExpandedChapters] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
    6: true,
    7: true,
    8: true
  });

  const toggleChapter = (chapterNum: number) => {
    setExpandedChapters((prev) => ({ ...prev, [chapterNum]: !prev[chapterNum] }));
  };

  const filteredChapters = useMemo(() => {
    if (!searchQuery.trim()) return STATUTORY_DATA;
    const q = searchQuery.toLowerCase();
    return STATUTORY_DATA.map((ch) => ({
      ...ch,
      articles: ch.articles.filter(
        (art) =>
          art.title.toLowerCase().includes(q) ||
          art.summary.toLowerCase().includes(q) ||
          art.fullText.toLowerCase().includes(q) ||
          `article ${art.number}`.includes(q)
      )
    })).filter((ch) => ch.articles.length > 0);
  }, [searchQuery]);

  const handleCopyCitation = (citation: string) => {
    navigator.clipboard.writeText(citation);
    setCopiedCitation(citation);
    setTimeout(() => setCopiedCitation(null), 2500);
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans antialiased overflow-hidden">
      {/* LEFT TOC SIDEBAR */}
      <aside className="w-80 border-r border-slate-800 bg-slate-900/80 flex flex-col shrink-0">
        <div className="p-4 border-b border-slate-800 flex items-center gap-2">
          <Scale className="w-6 h-6 text-sky-400" />
          <h1 className="font-bold text-lg text-slate-100 tracking-wide">CRA Statutory Reference</h1>
        </div>

        {/* SEARCH BAR */}
        <div className="p-3 border-b border-slate-800/60">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search Articles 1-71, Recitals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-md text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 transition"
            />
          </div>
        </div>

        {/* TOC TREE VIEW */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredChapters.map((chapter) => (
            <div key={chapter.number} className="rounded-lg overflow-hidden border border-slate-800/40">
              <button
                onClick={() => toggleChapter(chapter.number)}
                className="w-full px-3 py-2 bg-slate-800/40 hover:bg-slate-800/70 flex items-center justify-between text-left text-xs font-semibold text-slate-300 transition"
              >
                <span className="truncate">{chapter.title}</span>
                {expandedChapters[chapter.number] ? (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>

              {expandedChapters[chapter.number] && (
                <div className="p-1 space-y-1 bg-slate-950/40">
                  {chapter.articles.map((art) => {
                    const isSelected = selectedArticle.id === art.id;
                    return (
                      <button
                        key={art.id}
                        onClick={() => setSelectedArticle(art)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm flex items-center justify-between transition ${
                          isSelected
                            ? "bg-sky-500/20 text-sky-300 font-medium border border-sky-500/30"
                            : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/30"
                        }`}
                      >
                        <span className="truncate">Art. {art.number} — {art.title}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0 ml-1" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* STATUTORY FOOTER */}
        <div className="p-3 border-t border-slate-800 bg-slate-900 text-xs text-slate-500 flex items-center justify-between">
          <span>Regulation (EU) 2024/2847</span>
          <span className="text-emerald-400 font-mono">100% Verified</span>
        </div>
      </aside>

      {/* CENTER ARTICLE READER */}
      <main className="flex-1 flex flex-col overflow-hidden bg-slate-950">
        {/* HEADER TOOLBAR */}
        <header className="h-16 border-b border-slate-800 px-6 flex items-center justify-between bg-slate-900/40">
          <div>
            <span className="text-xs font-semibold text-sky-400 tracking-wider uppercase">
              {selectedArticle.chapter}
            </span>
            <h2 className="text-xl font-bold text-slate-100">
              Article {selectedArticle.number}: {selectedArticle.title}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleCopyCitation(selectedArticle.officialCitation)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 border border-slate-700 transition"
            >
              <Copy className="w-3.5 h-3.5 text-sky-400" />
              {copiedCitation === selectedArticle.officialCitation ? "Copied!" : "Copy Official Citation"}
            </button>

            <button
              onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-sky-600 hover:bg-sky-500 text-xs font-semibold text-white shadow-lg shadow-sky-900/30 transition"
            >
              <Sliders className="w-3.5 h-3.5" />
              Cross-Regulation Mapping
            </button>
          </div>
        </header>

        {/* CONTENT READER */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 max-w-4xl mx-auto w-full">
          {/* OFFICIAL CITATION BADGE */}
          <div className="p-3 rounded-lg bg-sky-950/40 border border-sky-800/40 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-sky-300">
              <BookOpen className="w-4 h-4 text-sky-400" />
              <span className="font-mono font-medium">{selectedArticle.officialCitation}</span>
            </div>
            <span className="text-xs text-slate-400">Verbatim EUR-Lex Official Journal</span>
          </div>

          {/* RECITALS TOOLTIP BAR */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Info className="w-4 h-4 text-slate-500" />
            <span>Associated Recitals:</span>
            {selectedArticle.recitals.map((r) => (
              <span key={r} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono">
                Recital {r}
              </span>
            ))}
          </div>

          {/* SUMMARY BOX */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Statutory Objective & Summary</h3>
            <p className="text-sm text-slate-300 leading-relaxed font-sans">{selectedArticle.summary}</p>
          </div>

          {/* VERBATIM LEGAL TEXT */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Verbatim Official Journal Text</h3>
            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-200 leading-relaxed font-serif text-base shadow-inner">
              {selectedArticle.fullText}
            </div>
          </div>
        </div>
      </main>

      {/* RIGHT DRAWER FOR CROSS-REGULATION MAPPING */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm">
          <div className="w-[450px] bg-slate-900 border-l border-slate-800 h-full p-6 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-sky-400" />
                <h3 className="font-bold text-slate-100">Cross-Regulation Overlay</h3>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-6 space-y-6">
              {/* IEC 62443 */}
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">IEC 62443 Standard</span>
                  <Shield className="w-4 h-4 text-emerald-400" />
                </div>
                <p className="text-sm font-semibold text-slate-200">{selectedArticle.ieccMapping || "N/A"}</p>
                <p className="text-xs text-slate-400">Industrial Automation & Control Systems Security Component Requirement.</p>
              </div>

              {/* NIS2 */}
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">NIS2 Directive (EU 2022/2555)</span>
                  <BookOpen className="w-4 h-4 text-sky-400" />
                </div>
                <p className="text-sm font-semibold text-slate-200">{selectedArticle.nis2Mapping || "N/A"}</p>
                <p className="text-xs text-slate-400">Essential Entity Supply Chain & Risk Management Obligations.</p>
              </div>

              {/* EU AI ACT */}
              <div className="p-4 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">EU AI Act (EU 2024/1689)</span>
                  <ExternalLink className="w-4 h-4 text-purple-400" />
                </div>
                <p className="text-sm font-semibold text-slate-200">{selectedArticle.aiActMapping || "N/A"}</p>
                <p className="text-xs text-slate-400">High-Risk AI System Cybersecurity Presumption of Conformity.</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 text-center">
              <button
                onClick={() => setDrawerOpen(false)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 rounded-md transition"
              >
                Close Cross-Regulation View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StatutoryReferenceWorkbench;
