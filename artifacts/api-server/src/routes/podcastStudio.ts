import { Router, type Request, type Response } from "express";
import fs from "fs";
import path from "path";

export const podcastStudioRouter = Router();

const BASE_DIR = path.resolve(__dirname, "../../../../");
const DOCS_CRA = path.join(BASE_DIR, "docs/cra_podcast");
const REGISTRY_FILE = path.join(DOCS_CRA, "episodes_registry.json");
const BLOGS_DIR = path.join(DOCS_CRA, "blogs");

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
    
    // Count blogs
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

/**
 * GET /api/podcast/blogs
 * Returns list of technical SEO blogs.
 */
podcastStudioRouter.get("/podcast/blogs", (req: Request, res: Response) => {
  try {
    if (!fs.existsSync(BLOGS_DIR)) {
      return res.json({ success: true, blogs: [] });
    }
    const files = fs.readdirSync(BLOGS_DIR).filter(f => f.startsWith("BLOG_") && f.endsWith(".md"));
    const blogs = files.map(f => {
      const content = fs.readFileSync(path.join(BLOGS_DIR, f), "utf-8");
      const titleMatch = content.match(/title:\s*"(.*?)"/);
      const codeMatch = content.match(/canonical_code:\s*"(.*?)"/);
      const personaMatch = content.match(/target_persona:\s*"(.*?)"/);
      return {
        filename: f,
        title: titleMatch ? titleMatch[1] : f,
        code: codeMatch ? codeMatch[1] : "CRA",
        target_persona: personaMatch ? personaMatch[1] : "OT Leads",
        read_time: "8 min read"
      };
    });
    return res.json({ success: true, total: blogs.length, blogs });
  } catch (err: any) {
    return res.status(500).json({ error: "Failed to load blogs", detail: err.message });
  }
});
