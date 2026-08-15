import { Router, type Request, type Response } from "express";
import fs from "fs";
import path from "path";

export const podcastStudioRouter = Router();

function getDocsCraDir(): string {
  const candidates = [
    path.resolve(process.cwd(), "docs/cra_podcast"),
    path.resolve(__dirname, "../../../../docs/cra_podcast"),
    path.resolve(__dirname, "../../../docs/cra_podcast"),
    path.resolve(__dirname, "../../docs/cra_podcast"),
    path.resolve(__dirname, "../docs/cra_podcast"),
    "/app/docs/cra_podcast",
    "/Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/docs/cra_podcast"
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return path.resolve(process.cwd(), "docs/cra_podcast");
}

const getBlogsDir = () => path.join(getDocsCraDir(), "blogs");
const getRegistryFile = () => path.join(getDocsCraDir(), "episodes_registry.json");

interface BlogPostSummary {
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
  prevEpisode?: { code: string; title: string; slug: string } | null;
  nextEpisode?: { code: string; title: string; slug: string } | null;
}

function parseBlogFile(filename: string): { summary: BlogPostSummary; rawContent: string } | null {
  try {
    const fullPath = path.join(getBlogsDir(), filename);
    if (!fs.existsSync(fullPath)) return null;
    const content = fs.readFileSync(fullPath, "utf-8");

    const titleMatch = content.match(/title:\s*"(.*?)"/);
    const subtitleMatch = content.match(/subtitle:\s*"(.*?)"/);
    const slugMatch = content.match(/slug:\s*"(.*?)"/);
    const codeMatch = content.match(/canonical_code:\s*"(.*?)"/) || content.match(/id:\s*"(.*?)"/);
    const seriesMatch = content.match(/series:\s*"(.*?)"/);
    const seriesIdMatch = content.match(/series_id:\s*(\d+)/);
    const epNumMatch = content.match(/episode_number:\s*(\d+)/);
    const personaMatch = content.match(/target_persona:\s*"(.*?)"/);
    const personaCatMatch = content.match(/persona_category:\s*"(.*?)"/);
    const statutoryDomainMatch = content.match(/statutory_domain:\s*"(.*?)"/);
    const difficultyMatch = content.match(/difficulty:\s*"(.*?)"/);
    const keyMetricMatch = content.match(/key_metric:\s*"(.*?)"/);
    const readTimeMatch = content.match(/read_time:\s*"(.*?)"/);
    const audioUrlMatch = content.match(/audio_url:\s*"(.*?)"/);
    const dateMatch = content.match(/date:\s*"(.*?)"/);
    
    let statutes: string[] = [];
    const statutesMatch = content.match(/statutes:\s*(\[.*?\])/s);
    if (statutesMatch) {
      try {
        statutes = JSON.parse(statutesMatch[1]);
      } catch {
        statutes = ["Regulation (EU) 2024/2847"];
      }
    }

    let takeaways: string[] = [];
    const takeawaysMatch = content.match(/takeaways:\s*(\[.*?\])/s);
    if (takeawaysMatch) {
      try {
        takeaways = JSON.parse(takeawaysMatch[1]);
      } catch {
        takeaways = [];
      }
    }

    let summaryText = "";
    const summarySectionMatch = content.match(/## 1\. The Commercial Dilemma & Industrial Reality\s*\n\n(.*?)(?=\n\n---|\n\n##)/s) ||
                                 content.match(/## 1\. Shattering the Industry Myth\s*\n\n(.*?)(?=\n\n---|\n\n##)/s) ||
                                 content.match(/## 1\. Executive Headline & Immediate Impact\s*\n\n(.*?)(?=\n\n---|\n\n##)/s);
    if (summarySectionMatch) {
      const cleanLines = summarySectionMatch[1]
        .split('\n')
        .map(l => l.trim())
        .filter(l => l && !l.startsWith('>') && !l.startsWith('#') && !l.includes('Single-Voice') && !l.includes('Host & Presenter'))
        .join('\n')
        .trim();
      summaryText = cleanLines.replace(/\*\*/g, '').replace(/`/g, '');
    } else {
      summaryText = subtitleMatch ? subtitleMatch[1] : "Definitive technical and statutory analysis for industrial OT product manufacturers.";
    }

    const code = codeMatch ? codeMatch[1] : "CRA";
    const slug = slugMatch ? slugMatch[1] : filename.replace("BLOG_", "").replace(".md", "");

    return {
      summary: {
        id: code,
        slug: slug,
        filename: filename,
        title: titleMatch ? titleMatch[1] : filename,
        subtitle: subtitleMatch ? subtitleMatch[1] : undefined,
        code: code,
        statutes: statutes.length > 0 ? statutes : ["Regulation (EU) 2024/2847"],
        persona: personaMatch ? personaMatch[1] : "OT & Product Security Leads",
        personaCategory: personaCatMatch ? personaCatMatch[1] : "OT & Product Security Leads",
        statutoryDomain: statutoryDomainMatch ? statutoryDomainMatch[1] : "Industrial Product Security",
        difficulty: difficultyMatch ? difficultyMatch[1] : "Advanced Engineering",
        keyMetric: keyMetricMatch ? keyMetricMatch[1] : "Article 64 Fine Risk",
        series: seriesMatch ? seriesMatch[1] : "Industrial Product Security",
        seriesId: seriesIdMatch ? parseInt(seriesIdMatch[1], 10) : 1,
        episodeNumber: epNumMatch ? parseInt(epNumMatch[1], 10) : 1,
        readTime: readTimeMatch ? readTimeMatch[1] : "8 min read",
        duration: "14:15",
        audioUrl: audioUrlMatch ? audioUrlMatch[1] : `https://oxot.ai/audio/cra_podcast/${code}.mp3`,
        summary: summaryText,
        takeaways: takeaways.length > 0 ? takeaways : [
          "Mandatory cybersecurity baseline verification under EU Regulation 2024/2847.",
          "Annex VII Technical File retention with machine-readable CycloneDX SBOM.",
          "24-hour early warning incident notification on ENISA Single Reporting Platform."
        ],
        publishedAt: dateMatch ? dateMatch[1] : "2026-08-14",
        keywords: ["Cyber Resilience Act", "IEC 62443", "Industrial OT", "CE Marking"]
      },
      rawContent: content
    };
  } catch {
    return null;
  }
}

/**
 * GET /api/blogs
 * Public REST API: Returns all published technical SEO blog posts with full search metadata.
 */
podcastStudioRouter.get(["/blogs", "/podcast/blogs"], (req: Request, res: Response) => {
  try {
    const blogsDir = getBlogsDir();
    if (!fs.existsSync(blogsDir)) {
      return res.json({ success: true, total: 0, items: [] });
    }
    const files = fs.readdirSync(blogsDir).filter(f => f.startsWith("BLOG_") && f.endsWith(".md"));
    const items: BlogPostSummary[] = [];

    for (const file of files) {
      const parsed = parseBlogFile(file);
      if (parsed) {
        items.push(parsed.summary);
      }
    }

    items.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));

    // Link Previous and Next in Series
    for (let i = 0; i < items.length; i++) {
      if (i > 0) {
        items[i].prevEpisode = {
          code: items[i-1].code,
          title: items[i-1].title,
          slug: items[i-1].slug
        };
      }
      if (i < items.length - 1) {
        items[i].nextEpisode = {
          code: items[i+1].code,
          title: items[i+1].title,
          slug: items[i+1].slug
        };
      }
    }

    return res.json({
      success: true,
      total: items.length,
      corpus_name: "CRA Technical Engineering & Compliance Guides",
      last_updated: new Date().toISOString(),
      items: items
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to load blog corpus", detail: err.message });
  }
});

/**
 * GET /api/blogs/:slug
 * Public REST API: Returns a single blog post by slug or code with full raw markdown content and prev/next links.
 */
podcastStudioRouter.get(["/blogs/:slug", "/podcast/blogs/:slug"], (req: Request, res: Response) => {
  try {
    const targetSlug = String(req.params.slug).toLowerCase();
    const blogsDir = getBlogsDir();
    if (!fs.existsSync(blogsDir)) {
      return res.status(404).json({ error: "Blog corpus not found" });
    }

    const files = fs.readdirSync(blogsDir).filter(f => f.startsWith("BLOG_") && f.endsWith(".md"));
    const items: BlogPostSummary[] = [];
    const contentMap = new Map<string, string>();

    for (const file of files) {
      const parsed = parseBlogFile(file);
      if (parsed) {
        items.push(parsed.summary);
        contentMap.set(parsed.summary.slug.toLowerCase(), parsed.rawContent);
        contentMap.set(parsed.summary.code.toLowerCase(), parsed.rawContent);
      }
    }

    items.sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));

    // Link Previous and Next in Series
    for (let i = 0; i < items.length; i++) {
      if (i > 0) {
        items[i].prevEpisode = {
          code: items[i-1].code,
          title: items[i-1].title,
          slug: items[i-1].slug
        };
      }
      if (i < items.length - 1) {
        items[i].nextEpisode = {
          code: items[i+1].code,
          title: items[i+1].title,
          slug: items[i+1].slug
        };
      }
    }

    const foundIndex = items.findIndex(
      it => it.slug.toLowerCase() === targetSlug || 
            it.code.toLowerCase() === targetSlug ||
            it.filename.toLowerCase().includes(targetSlug)
    );

    if (foundIndex !== -1) {
      const matched = items[foundIndex];
      return res.json({
        success: true,
        post: matched,
        content: contentMap.get(matched.slug.toLowerCase()) || ""
      });
    }

    return res.status(404).json({ error: `Blog post not found: ${req.params.slug}` });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to retrieve blog post", detail: err.message });
  }
});

/**
 * GET /api/podcast/episodes
 * Returns all 67 episodes organized with series grouping, sequential order, duration, real summaries, and next-in-series pointers.
 */
podcastStudioRouter.get("/podcast/episodes", (req: Request, res: Response) => {
  try {
    const registryFile = getRegistryFile();
    const blogsDir = getBlogsDir();
    
    let registry = { episodes: [] as any[], podcast_ecosystem: "The Cyber Resilience Act Audio Platform", version: "4.0.0" };
    if (fs.existsSync(registryFile)) {
      registry = JSON.parse(fs.readFileSync(registryFile, "utf-8"));
    }
    
    // Load parsed blog summaries to enrich episode list with real summaries & slugs
    const blogMap = new Map<string, BlogPostSummary>();
    if (fs.existsSync(blogsDir)) {
      const files = fs.readdirSync(blogsDir).filter(f => f.startsWith("BLOG_") && f.endsWith(".md"));
      for (const file of files) {
        const parsed = parseBlogFile(file);
        if (parsed) {
          blogMap.set(parsed.summary.code, parsed.summary);
        }
      }
    }

    // Series definitions
    const seriesList = [
      { id: 1, name: "The Procurement & Contracting Crisis", codeRange: "EP_1.01 – EP_1.06", count: 6 },
      { id: 2, name: "System Integrators & Substantial Modification", codeRange: "EP_2.01 – EP_2.07", count: 7 },
      { id: 3, name: "Brownfield OT & Spare Parts Demystified", codeRange: "EP_3.01 – EP_3.06", count: 6 },
      { id: 4, name: "Tier-2 Embedded & Component Suppliers", codeRange: "EP_4.01 – EP_4.06", count: 6 },
      { id: 5, name: "Critical Sector Deep Dives", codeRange: "EP_5.01 – EP_5.08", count: 8 },
      { id: 6, name: "The Article 14 Incident & Vulnerability Playbook", codeRange: "EP_6.01 – EP_6.06", count: 6 },
      { id: 7, name: "Conformity Assessment & Notified Body Strategy", codeRange: "EP_7.01 – EP_7.06", count: 6 },
      { id: 8, name: "Enforcement, Liability & The 2028 Horizon", codeRange: "EP_8.01 – EP_8.05", count: 5 }
    ];

    const standardEpisodes = (registry.episodes || []).map((ep: any, idx: number, arr: any[]) => {
      const code = ep.canonical_code || `EP_${ep.series_id}.${String(ep.episode_number).padStart(2, '0')}`;
      const blog = blogMap.get(code);
      const nextEp = idx < arr.length - 1 ? arr[idx + 1] : null;
      return {
        id: code,
        code: code,
        seriesId: ep.series_id || 1,
        seriesName: ep.series_name || "The Procurement & Contracting Crisis",
        episodeNumber: ep.episode_number || (idx + 1),
        title: ep.title,
        category: "standard",
        statutes: ep.statutory_articles || ["Regulation (EU) 2024/2847"],
        persona: ep.target_persona || "OT & Product Security Leads",
        duration: "14:15",
        audioUrl: `https://oxot.ai/audio/cra_podcast/${code}.mp3`,
        summary: blog ? blog.summary : `Statutory and engineering analysis under ${ep.statutory_articles?.join(', ')} for ${ep.target_persona}.`,
        blogSlug: blog ? blog.slug : code.toLowerCase().replace('_', '-'),
        nextEpisode: nextEp ? {
          code: nextEp.canonical_code || `EP_${nextEp.series_id}.${String(nextEp.episode_number).padStart(2, '0')}`,
          title: nextEp.title
        } : null
      };
    });

    const truthEpisodes = [
      { id: "TC_01", code: "TC_01", episodeNumber: 1, title: "The Edge-to-Cloud Grey Zone: When Microservices Void Local Controller CE Marks", category: "truth", statutes: ["Article 3(2)", "Article 21"], persona: "Cloud-OT Architects & Plant CISOs", duration: "14:15" },
      { id: "TC_02", code: "TC_02", episodeNumber: 2, title: "The Defunct OEM Dilemma: Who Patches Brownfield OT When the Vendor Goes Bankrupt?", category: "truth", statutes: ["Article 13(8)", "NIS2 Article 21"], persona: "Critical Infrastructure Operators", duration: "13:50" },
      { id: "TC_03", code: "TC_03", episodeNumber: 3, title: "Autonomous AI & Neural Weights on the Plant Floor: Harmonizing CRA and the EU AI Act", category: "truth", statutes: ["CRA Annex I", "EU AI Act 2024/1689"], persona: "Industrial Robotics Engineers", duration: "14:35" },
      { id: "TC_04", code: "TC_04", episodeNumber: 4, title: "The €15M Calculation: Dissecting the Math Behind Article 64 Global Turnover Penalties", category: "truth", statutes: ["Article 64", "Recital 78"], persona: "Chief Financial Officers & General Counsel", duration: "14:40" },
      { id: "TC_05", code: "TC_05", episodeNumber: 5, title: "The Open Source Stewardship Illusion: Navigating Article 24 Non-Commercial Safe Harbors", category: "truth", statutes: ["Article 24", "Recital 18"], persona: "Open Source Maintainers & CTOs", duration: "13:30" },
      { id: "TC_06", code: "TC_06", episodeNumber: 6, title: "Maritime OT & Navigational Radar: The Clash Between CRA and the Marine Equipment Directive", category: "truth", statutes: ["CRA Article 2", "MED 2014/90/EU"], persona: "Marine Systems Integrators", duration: "14:10" },
      { id: "TC_07", code: "TC_07", episodeNumber: 7, title: "Smart Metering & Grid Substations: Demystifying NIS2 Essential Entities vs CRA Class II Assets", category: "truth", statutes: ["CRA Annex III Class II", "NIS2 Annex I"], persona: "Utility Security Directors", duration: "15:05" },
      { id: "TC_08", code: "TC_08", episodeNumber: 8, title: "Battery Energy Storage Systems (BESS): Cyber-Physical Fire Risks & Class II Notified Bodies", category: "truth", statutes: ["Annex III Class II", "IEC 61508"], persona: "Grid Battery Developers & Power OEMs", duration: "15:00" },
      { id: "TC_09", code: "TC_09", episodeNumber: 9, title: "The Distributor's Trap: Why Selling Unmarked Spares on European Marketplaces Is Strict Liability", category: "truth", statutes: ["Article 18", "Article 19"], persona: "Industrial Supply Distributors", duration: "13:40" },
      { id: "TC_10", code: "TC_10", episodeNumber: 10, title: "Legacy Protocol Converters: Why Modbus-to-MQTT Gateways Are the Number One CRA Target", category: "truth", statutes: ["Annex I Part I", "Article 10"], persona: "SCADA Engineers & System Integrators", duration: "14:20" },
      { id: "TC_11", code: "TC_11", episodeNumber: 11, title: "The Port Surveillance Playbook: How Customs Inspects Software Bill of Materials at Antwerp and Rotterdam", category: "truth", statutes: ["Article 54", "Article 55"], persona: "Importers & Logistics Directors", duration: "14:50" },
      { id: "TC_12", code: "TC_12", episodeNumber: 12, title: "The Insurance Underwriting Reckoning: How CRA Breaches Void Tech E&O and Cyber Policies", category: "truth", statutes: ["Article 61", "EU Product Liability Directive"], persona: "Corporate Risk Officers & Legal Counsel", duration: "14:45" }
    ].map((tc, idx, arr) => {
      const blog = blogMap.get(tc.code);
      const nextEp = idx < arr.length - 1 ? arr[idx + 1] : null;
      return {
        ...tc,
        seriesName: "CRA: Truth & Consequences",
        audioUrl: `https://oxot.ai/audio/cra_podcast/${tc.code}.mp3`,
        summary: blog ? blog.summary : `Shattering industry myths under ${tc.statutes.join(', ')} for ${tc.persona}.`,
        blogSlug: blog ? blog.slug : tc.code.toLowerCase().replace('_', '-'),
        nextEpisode: nextEp ? { code: nextEp.code, title: nextEp.title } : null
      };
    });

    const newsEpisodes = [
      { id: "NEWS_01", code: "NEWS_01", episodeNumber: 1, title: "ENISA Single Reporting Platform 24h Incident Clock Activated", category: "news", statutes: ["Article 14"], persona: "PSIRT & Risk Officers", duration: "02:30" },
      { id: "NEWS_02", code: "NEWS_02", episodeNumber: 2, title: "First Batch of Notified Body Designations Announced for Class II Products", category: "news", statutes: ["Article 41"], persona: "Quality & Regulatory Leads", duration: "02:45" },
      { id: "NEWS_03", code: "NEWS_03", episodeNumber: 3, title: "European Commission Issues Guidance on Substantial Modifications for Field Retrofits", category: "news", statutes: ["Article 21"], persona: "System Integrators", duration: "03:10" },
      { id: "NEWS_04", code: "NEWS_04", episodeNumber: 4, title: "Market Surveillance Port Interception Protocols Finalized at Rotterdam and Antwerp", category: "news", statutes: ["Article 54"], persona: "Supply Chain Directors", duration: "02:50" },
      { id: "NEWS_05", code: "NEWS_05", episodeNumber: 5, title: "Standardization Mandate M/606 Timeline Update: EN 40000 First Drafts Released", category: "news", statutes: ["Article 34", "M/606"], persona: "Standards & Compliance Architects", duration: "03:15" }
    ].map((nw, idx, arr) => {
      const blog = blogMap.get(nw.code);
      const nextEp = idx < arr.length - 1 ? arr[idx + 1] : null;
      return {
        ...nw,
        seriesName: "The CRA News Stream",
        audioUrl: `https://oxot.ai/audio/cra_podcast/${nw.code}.mp3`,
        summary: blog ? blog.summary : `Breaking regulatory update on ${nw.title}.`,
        blogSlug: blog ? blog.slug : nw.code.toLowerCase().replace('_', '-'),
        nextEpisode: nextEp ? { code: nextEp.code, title: nextEp.title } : null
      };
    });

    return res.json({
      success: true,
      podcast_ecosystem: registry.podcast_ecosystem || "The Cyber Resilience Act Audio Platform",
      version: registry.version || "4.0.0",
      total_episodes: standardEpisodes.length + truthEpisodes.length + newsEpisodes.length,
      total_blogs: blogMap.size,
      series_list: seriesList,
      formats: [
        { id: "standard", name: "The CRA Briefing (Standard Solo Series)", count: standardEpisodes.length, style: "Direct, Informative, Technical (50 Episodes in 8 Series)" },
        { id: "truth", name: "CRA: Truth & Consequences", count: truthEpisodes.length, style: "Hard-Hitting Investigative Case Studies (12 Episodes)" },
        { id: "news", name: "The CRA News Stream", count: newsEpisodes.length, style: "Fast-Paced Regulatory Bulletins (5 Episodes)" }
      ],
      episodes: {
        standard: standardEpisodes,
        truth: truthEpisodes,
        news: newsEpisodes
      },
      feeds: {
        standard_rss: "https://oxot.ai/feeds/cra-podcast.xml",
        news_rss: "https://oxot.ai/feeds/cra-news.xml",
        truth_rss: "https://oxot.ai/feeds/cra-truth.xml"
      }
    });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to load podcast episodes", detail: err.message });
  }
});
