import { Router } from "express";
import {
  loadCraCorpus,
  searchCraCorpus,
  getArticleByNumber,
  getRecitalByNumber,
  getAnnexByNumber,
} from "../lib/craCorpusEngine";

export const craWikiRouter = Router();

// GET /api/wiki/cra/chapters - Full table of contents & hierarchy
craWikiRouter.get("/chapters", (_req, res) => {
  const corpus = loadCraCorpus();
  res.json({
    regulation: "Regulation (EU) 2024/2847",
    chaptersCount: corpus.chapters.length,
    chapters: corpus.chapters,
    totalArticles: corpus.articles.length,
    totalRecitals: corpus.recitals.length,
    totalAnnexes: corpus.annexes.length,
  });
});

// GET /api/wiki/cra/articles - List of all articles with metadata
craWikiRouter.get("/articles", (_req, res) => {
  const corpus = loadCraCorpus();
  res.json({
    total: corpus.articles.length,
    articles: corpus.articles,
  });
});

// GET /api/wiki/cra/article/:num - Single article with paragraphs & backlinks
craWikiRouter.get("/article/:num", (req, res) => {
  const num = parseInt(req.params.num, 10);
  if (isNaN(num)) {
    res.status(400).json({ error: "Invalid article number" });
    return;
  }
  const article = getArticleByNumber(num);
  if (!article) {
    res.status(404).json({ error: `Article ${num} not found in CRA corpus` });
    return;
  }
  res.json(article);
});

// GET /api/wiki/cra/recitals - Full recitals list
craWikiRouter.get("/recitals", (_req, res) => {
  const corpus = loadCraCorpus();
  res.json({
    total: corpus.recitals.length,
    recitals: corpus.recitals,
  });
});

// GET /api/wiki/cra/recital/:num - Single recital
craWikiRouter.get("/recital/:num", (req, res) => {
  const num = parseInt(req.params.num, 10);
  if (isNaN(num)) {
    res.status(400).json({ error: "Invalid recital number" });
    return;
  }
  const recital = getRecitalByNumber(num);
  if (!recital) {
    res.status(404).json({ error: `Recital ${num} not found` });
    return;
  }
  res.json(recital);
});

// GET /api/wiki/cra/annexes - Full annexes list
craWikiRouter.get("/annexes", (_req, res) => {
  const corpus = loadCraCorpus();
  res.json({
    total: corpus.annexes.length,
    annexes: corpus.annexes,
  });
});

// GET /api/wiki/cra/annex/:num - Single annex
craWikiRouter.get("/annex/:num", (req, res) => {
  const annex = getAnnexByNumber(req.params.num);
  if (!annex) {
    res.status(404).json({ error: `Annex ${req.params.num} not found` });
    return;
  }
  res.json(annex);
});

// POST /api/wiki/cra/search - Full-text search
craWikiRouter.post("/search", (req, res) => {
  const query = (req.body?.query || req.query?.q || "") as string;
  const results = searchCraCorpus(query);
  res.json(results);
});
