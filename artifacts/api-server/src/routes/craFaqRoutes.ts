import { Router, type Request, type Response } from "express";
import fs from "fs";
import path from "path";

export const craFaqRouter = Router();

function getFaqData() {
  try {
    // Check local json file or docs/cra_sources
    const primaryPath = path.join(__dirname, "..", "data", "craFaqs.json");
    if (fs.existsSync(primaryPath)) {
      return JSON.parse(fs.readFileSync(primaryPath, "utf-8"));
    }
    const fallbackPath = path.join(process.cwd(), "docs", "cra_sources", "cra_faqs_registry.json");
    if (fs.existsSync(fallbackPath)) {
      return JSON.parse(fs.readFileSync(fallbackPath, "utf-8"));
    }
    const containerFallback = path.join("/app", "docs", "cra_sources", "cra_faqs_registry.json");
    if (fs.existsSync(containerFallback)) {
      return JSON.parse(fs.readFileSync(containerFallback, "utf-8"));
    }
  } catch (err) {
    console.error("Error reading FAQ data:", err);
  }
  return { total: 0, sections: {}, items: [] };
}

function getRawMarkdown() {
  const possiblePaths = [
    path.join(process.cwd(), "docs", "cra_sources", "CRA_EU_FAQS_official.md"),
    path.join("/app", "docs", "cra_sources", "CRA_EU_FAQS_official.md"),
    path.join(process.cwd(), "assets", "oxot-uploads", "CRA-Research", "CRA_EU_FAQS_official.md")
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      return fs.readFileSync(p, "utf-8");
    }
  }
  return "# European Commission FAQs on the Cyber Resilience Act\n\nOfficial document not found on disk.";
}

// GET /api/faqs
craFaqRouter.get("/faqs", (req: Request, res: Response) => {
  const data = getFaqData();
  const q = ((req.query.q as string) || "").toLowerCase().trim();
  const section = ((req.query.section as string) || "").trim();
  const statute = ((req.query.statute as string) || "").toLowerCase().trim();
  const persona = ((req.query.persona as string) || "").toLowerCase().trim();

  let filtered = data.items || [];

  if (section && section !== "ALL") {
    filtered = filtered.filter((item: any) => item.sectionNumber === section);
  }

  if (statute && statute !== "all") {
    filtered = filtered.filter((item: any) => 
      item.statutes?.some((s: string) => s.toLowerCase().includes(statute))
    );
  }

  if (persona && persona !== "all") {
    filtered = filtered.filter((item: any) => 
      item.targetPersonas?.some((p: string) => p.toLowerCase().includes(persona))
    );
  }

  if (q) {
    filtered = filtered.filter((item: any) => 
      item.title?.toLowerCase().includes(q) ||
      item.answer?.toLowerCase().includes(q) ||
      item.shortSummary?.toLowerCase().includes(q) ||
      item.number?.includes(q) ||
      item.statutes?.some((s: string) => s.toLowerCase().includes(q))
    );
  }

  res.json({
    total: filtered.length,
    overallTotal: data.items?.length || 0,
    sections: data.sections || {},
    items: filtered
  });
});

// GET /api/faqs/raw-markdown
craFaqRouter.get("/faqs/raw-markdown", (_req: Request, res: Response) => {
  const md = getRawMarkdown();
  res.type("text/markdown").send(md);
});

// GET /api/faqs/:id
craFaqRouter.get("/faqs/:id", (req: Request, res: Response) => {
  const data = getFaqData();
  const targetId = String(req.params.id);
  const item = (data.items || []).find((f: any) => f.id === targetId || f.number === targetId || f.id === `cra-faq-${targetId.replace(/\./g, '-')}`);

  if (!item) {
    res.status(404).json({ error: "FAQ entry not found" });
    return;
  }

  res.json(item);
});
