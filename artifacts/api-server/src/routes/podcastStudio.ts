import { Router, type Request, type Response } from "express";
import fs from "fs";
import path from "path";

export const podcastStudioRouter = Router();

const BASE_DIR = path.resolve(__dirname, "../../../../");
const DOCS_CRA = path.join(BASE_DIR, "docs/cra_podcast");
const REGISTRY_FILE = path.join(DOCS_CRA, "episodes_registry.json");
const BLOGS_DIR = path.join(DOCS_CRA, "blogs");

interface BlogPostSummary {
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

function parseBlogFile(filename: string): { summary: BlogPostSummary; rawContent: string } | null {
  try {
    const fullPath = path.join(BLOGS_DIR, filename);
    if (!fs.existsSync(fullPath)) return null;
    const content = fs.readFileSync(fullPath, "utf-8");

    const titleMatch = content.match(/title:\s*"(.*?)"/);
    const subtitleMatch = content.match(/subtitle:\s*"(.*?)"/);
    const slugMatch = content.match(/slug:\s*"(.*?)"/);
    const codeMatch = content.match(/canonical_code:\s*"(.*?)"/);
    const seriesMatch = content.match(/series:\s*"(.*?)"/);
    const personaMatch = content.match(/target_persona:\s*"(.*?)"/);
    const readTimeMatch = content.match(/read_time:\s*"(.*?)"/);
    const audioUrlMatch = content.match(/audio_url:\s*"(.*?)"/);
    const dateMatch = content.match(/date:\s*"(.*?)"/);
    
    // Statutes array
    let statutes: string[] = [];
    const statutesMatch = content.match(/statutes:\s*(\[.*?\])/s);
    if (statutesMatch) {
      try {
        statutes = JSON.parse(statutesMatch[1]);
      } catch {
        statutes = ["Regulation (EU) 2024/2847"];
      }
    }

    // Extract summary section
    let summaryText = "";
    const summarySectionMatch = content.match(/## 1\. The Commercial Dilemma & Industrial Reality\s*\n\n(.*?)(?=\n\n---|\n\n##)/s);
    if (summarySectionMatch) {
      summaryText = summarySectionMatch[1].replace(/\*\*/g, '').replace(/`/g, '').trim();
    } else {
      summaryText = subtitleMatch ? subtitleMatch[1] : "Comprehensive technical and statutory analysis for industrial OT product manufacturers.";
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
        series: seriesMatch ? seriesMatch[1] : "Industrial Product Security",
        readTime: readTimeMatch ? readTimeMatch[1] : "8 min read",
        duration: "14:15",
        audioUrl: audioUrlMatch ? audioUrlMatch[1] : `https://oxot.ai/audio/cra_podcast/${code}.mp3`,
        summary: summaryText,
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
    if (!fs.existsSync(BLOGS_DIR)) {
      return res.json({ success: true, total: 0, items: [] });
    }
    const files = fs.readdirSync(BLOGS_DIR).filter(f => f.startsWith("BLOG_") && f.endsWith(".md"));
    const items: BlogPostSummary[] = [];

    for (const file of files) {
      const parsed = parseBlogFile(file);
      if (parsed) {
        items.push(parsed.summary);
      }
    }

    // Sort by code or date
    items.sort((a, b) => a.code.localeCompare(b.code));

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
 * Public REST API: Returns a single blog post by slug or code with full raw markdown content.
 */
podcastStudioRouter.get(["/blogs/:slug", "/podcast/blogs/:slug"], (req: Request, res: Response) => {
  try {
    const targetSlug = req.params.slug.toLowerCase();
    if (!fs.existsSync(BLOGS_DIR)) {
      return res.status(404).json({ error: "Blog corpus not found" });
    }

    const files = fs.readdirSync(BLOGS_DIR).filter(f => f.startsWith("BLOG_") && f.endsWith(".md"));
    for (const file of files) {
      const parsed = parseBlogFile(file);
      if (parsed) {
        if (parsed.summary.slug.toLowerCase() === targetSlug || 
            parsed.summary.code.toLowerCase() === targetSlug ||
            parsed.summary.filename.toLowerCase().includes(targetSlug)) {
          return res.json({
            success: true,
            post: parsed.summary,
            content: parsed.rawContent
          });
        }
      }
    }

    return res.status(404).json({ error: `Blog post not found: ${req.params.slug}` });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to retrieve blog post", detail: err.message });
  }
});

/**
 * GET /api/podcast/episodes
 * Returns all 67 episodes categorized across the 3 styles, plus metadata and RSS feed URLs.
 */
podcastStudioRouter.get("/podcast/episodes", (req: Request, res: Response) => {
  try {
    if (!fs.existsSync(REGISTRY_FILE)) {
      return res.status(404).json({ error: "Registry file not found" });
    }
    const registry = JSON.parse(fs.readFileSync(REGISTRY_FILE, "utf-8"));
    
    let blogCount = 0;
    if (fs.existsSync(BLOGS_DIR)) {
      blogCount = fs.readdirSync(BLOGS_DIR).filter(f => f.startsWith("BLOG_") && f.endsWith(".md")).length;
    }
    
    return res.json({
      success: true,
      podcast_ecosystem: registry.podcast_ecosystem || "The Cyber Resilience Act Audio Platform",
      version: registry.version || "4.0.0",
      total_episodes: (registry.episodes?.length || 0) + (registry.formats?.[1]?.total_episodes || 5) + (registry.investigative_episodes?.length || 0),
      total_blogs: blogCount,
      formats: registry.formats || [],
      standard_episodes: registry.episodes || [],
      investigative_episodes: registry.investigative_episodes || [],
      news_episodes: [
        { id: "NEWS_01", code: "NEWS_01", title: "ENISA Single Reporting Platform 24h Incident Clock Activated", duration: "02:30", category: "News Stream" },
        { id: "NEWS_02", code: "NEWS_02", title: "First Batch of Notified Body Designations Announced for Class II Products", duration: "02:45", category: "News Stream" },
        { id: "NEWS_03", code: "NEWS_03", title: "European Commission Issues Guidance on Substantial Modifications for Field Retrofits", duration: "03:10", category: "News Stream" },
        { id: "NEWS_04", code: "NEWS_04", title: "Market Surveillance Port Interception Protocols Finalized at Rotterdam and Antwerp", duration: "02:50", category: "News Stream" },
        { id: "NEWS_05", code: "NEWS_05", title: "Standardization Mandate M/606 Timeline Update: EN 40000 First Drafts Released", duration: "03:15", category: "News Stream" }
      ],
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
