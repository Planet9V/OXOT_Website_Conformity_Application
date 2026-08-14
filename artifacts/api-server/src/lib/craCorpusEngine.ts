import {
  recitalsData,
  articlesData,
  annexesData,
  graphData,
} from "./craCorpusData";

export interface CraParagraph {
  paragraphNumber: number;
  text: string;
}

export interface CraArticle {
  articleNumber: number;
  title: string;
  paragraphs: CraParagraph[];
  legalCommentary?: string;
  chapterNumber?: number;
  chapterTitle?: string;
  backlinks?: {
    recitals: number[];
    annexes: string[];
    appFeatures: string[];
  };
}

export interface CraRecital {
  number: number;
  title: string;
  text: string;
  relatedArticles: number[];
  tags?: string[];
}

export interface CraAnnex {
  annexNumber: string;
  title: string;
  parts?: any[];
  requirements?: any[];
  classI?: string[];
  classII?: string[];
  products?: string[];
  mandatoryFields?: string[];
  modules?: any[];
  elements?: string[];
  crossDirectives?: string[];
}

export interface CraCorpusStructure {
  recitals: CraRecital[];
  articles: CraArticle[];
  annexes: CraAnnex[];
  chapters: Array<{
    chapterNumber: number;
    chapterTitle: string;
    articlesRange: string;
    articles: CraArticle[];
  }>;
}

let cachedCorpus: CraCorpusStructure | null = null;

export function loadCraCorpus(): CraCorpusStructure {
  if (cachedCorpus) {
    return cachedCorpus;
  }

  const flatArticles: CraArticle[] = [];
  for (const chap of articlesData.chapters) {
    for (const art of chap.articles) {
      const artNum = art.articleNumber;
      
      // Match backlinks from graph
      const backlinkRecitals: number[] = [];
      const backlinkAnnexes: string[] = [];
      const backlinkFeatures: string[] = [];

      for (const edge of graphData.edges) {
        if (edge.source === `ARTICLE_${artNum}` || edge.target === `ARTICLE_${artNum}`) {
          if (edge.target.startsWith("RECITAL_")) backlinkRecitals.push(parseInt(edge.target.replace("RECITAL_", ""), 10));
          if (edge.target.startsWith("ANNEX_")) backlinkAnnexes.push(edge.target.replace("ANNEX_", ""));
          if (edge.target.startsWith("APP_FEATURE_")) backlinkFeatures.push(edge.target);
          if (edge.source.startsWith("RECITAL_")) backlinkRecitals.push(parseInt(edge.source.replace("RECITAL_", ""), 10));
        }
      }

      flatArticles.push({
        ...art,
        chapterNumber: chap.chapterNumber,
        chapterTitle: chap.chapterTitle,
        backlinks: {
          recitals: Array.from(new Set(backlinkRecitals)),
          annexes: Array.from(new Set(backlinkAnnexes)),
          appFeatures: Array.from(new Set(backlinkFeatures)),
        },
      });
    }
  }

  cachedCorpus = {
    recitals: recitalsData.recitals,
    articles: flatArticles,
    annexes: annexesData.annexes,
    chapters: articlesData.chapters,
  };

  return cachedCorpus;
}

export function searchCraCorpus(query: string): {
  articles: CraArticle[];
  recitals: CraRecital[];
  annexes: CraAnnex[];
  query: string;
  matchCount: number;
} {
  const corpus = loadCraCorpus();
  const q = query.toLowerCase().trim();

  if (!q) {
    return {
      articles: corpus.articles.slice(0, 10),
      recitals: corpus.recitals.slice(0, 5),
      annexes: corpus.annexes,
      query: "",
      matchCount: corpus.articles.length,
    };
  }

  const matchedArticles = corpus.articles.filter((art) => {
    return (
      art.title.toLowerCase().includes(q) ||
      art.articleNumber.toString() === q ||
      art.paragraphs.some((p) => p.text.toLowerCase().includes(q)) ||
      (art.legalCommentary && art.legalCommentary.toLowerCase().includes(q))
    );
  });

  const matchedRecitals = corpus.recitals.filter((rec) => {
    return (
      rec.title.toLowerCase().includes(q) ||
      rec.number.toString() === q ||
      rec.text.toLowerCase().includes(q) ||
      (rec.tags && rec.tags.some((t) => t.toLowerCase().includes(q)))
    );
  });

  const matchedAnnexes = corpus.annexes.filter((annex) => {
    return (
      annex.title.toLowerCase().includes(q) ||
      annex.annexNumber.toLowerCase() === q ||
      (annex.classI && annex.classI.some((c) => c.toLowerCase().includes(q))) ||
      (annex.classII && annex.classII.some((c) => c.toLowerCase().includes(q))) ||
      (annex.parts && JSON.stringify(annex.parts).toLowerCase().includes(q)) ||
      (annex.requirements && JSON.stringify(annex.requirements).toLowerCase().includes(q)) ||
      (annex.elements && annex.elements.some((e) => e.toLowerCase().includes(q)))
    );
  });

  return {
    articles: matchedArticles,
    recitals: matchedRecitals,
    annexes: matchedAnnexes,
    query,
    matchCount: matchedArticles.length + matchedRecitals.length + matchedAnnexes.length,
  };
}

export function getArticleByNumber(num: number): CraArticle | undefined {
  const corpus = loadCraCorpus();
  return corpus.articles.find((a) => a.articleNumber === num);
}

export function getRecitalByNumber(num: number): CraRecital | undefined {
  const corpus = loadCraCorpus();
  return corpus.recitals.find((r) => r.number === num);
}

export function getAnnexByNumber(num: string): CraAnnex | undefined {
  const corpus = loadCraCorpus();
  return corpus.annexes.find((a) => a.annexNumber.toUpperCase() === num.toUpperCase());
}
