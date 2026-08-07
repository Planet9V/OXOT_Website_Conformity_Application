import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Globe, Radio, ExternalLink } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { useSeo } from '@/hooks/use-seo';
import { Newspaper } from 'lucide-react';
import { useLocale } from '@/providers/locale-provider';

// Localised static page chrome only (nl-NL professional register, "u"). Machine-assisted —
// flag Dutch strings for a native reviewer before go-live. The regulatory news items
// themselves are API-sourced dynamic data and are intentionally left untranslated.
const copy = {
  en: {
    seoTitle: 'CRA Regulatory News',
    seoDescription:
      'Live EU Cyber Resilience Act regulatory intelligence — ENISA guidelines, Commission guidance and CISA advisories.',
    kicker: 'LIVE CRA REGULATORY INTELLIGENCE',
    title: 'Regulatory News',
    description:
      'A growing corpus of EU Cyber Resilience Act developments — ENISA technical guidelines, European Commission guidance, statutory deadlines and CISA / KEV advisories. Refreshed automatically from live web search; the newest items appear first.',
    live: 'Live',
    loading: 'Loading…',
    articleSingular: 'article',
    articlePlural: 'articles',
    corpusSuffix: 'in the corpus',
    empty: 'No regulatory news has been generated yet.',
    liveDate: 'Live',
    readSource: 'Read source',
  },
  nl: {
    seoTitle: 'CRA-regelgevingsnieuws',
    seoDescription:
      'Live regelgevingsinformatie over de EU Cyber Resilience Act (CRA) — ENISA-richtsnoeren, richtsnoeren van de Commissie en CISA-adviezen.',
    kicker: 'LIVE CRA-REGELGEVINGSINFORMATIE',
    title: 'Regelgevingsnieuws',
    description:
      'Een groeiend corpus van ontwikkelingen rond de EU Cyber Resilience Act — technische richtsnoeren van ENISA, richtsnoeren van de Europese Commissie, wettelijke deadlines en CISA-/KEV-adviezen. Automatisch bijgewerkt via live webzoekopdrachten; de nieuwste items verschijnen bovenaan.',
    live: 'Live',
    loading: 'Laden…',
    articleSingular: 'artikel',
    articlePlural: 'artikelen',
    corpusSuffix: 'in het corpus',
    empty: 'Er is nog geen regelgevingsnieuws gegenereerd.',
    liveDate: 'Live',
    readSource: 'Lees bron',
  },
} as const;

interface NewsItem {
  id?: number;
  title: string;
  summary: string;
  source: string;
  url?: string;
  category?: string;
  publishedAt?: string;
}

export default function RegulatoryNewsPage() {
  const { locale } = useLocale();
  const t = copy[locale];
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useSeo({
    title: t.seoTitle,
    description: t.seoDescription,
  });

  // News items below are fetched from the API and rendered as-is; the item
  // titles/summaries are dynamic data and are not translated.
  useEffect(() => {
    let alive = true;
    fetch('/api/regulatory-news?limit=100')
      .then((r) => r.json())
      .then((d) => {
        if (alive && d?.items) setItems(d.items);
      })
      .catch(() => {})
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 md:py-16 max-w-5xl">
      <PageHeader
        kicker={t.kicker}
        title={t.title}
        icon={Newspaper}
        description={t.description}
      />

      <div className="flex items-center gap-2 mb-6">
        <Badge className="gap-1.5 bg-amber-500 hover:bg-amber-500 text-black font-semibold">
          <Radio className="h-3.5 w-3.5 animate-pulse" /> {t.live}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {loading ? t.loading : `${items.length} ${items.length === 1 ? t.articleSingular : t.articlePlural} ${t.corpusSuffix}`}
        </span>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground">{t.empty}</p>
      ) : (
        <div className="space-y-4">
          {items.map((item, idx) => (
            <article
              key={item.id || idx}
              className="rounded-xl border border-border bg-card p-5 hover:border-primary/40 transition-colors"
            >
              <div className="flex items-center gap-2 text-[11px] font-mono uppercase tracking-wide text-muted-foreground mb-2">
                {item.category && (
                  <Badge variant="secondary" className="text-[10px] font-mono">
                    {item.category}
                  </Badge>
                )}
                <span className="flex items-center gap-1">
                  <Globe className="h-3 w-3 text-primary" /> {item.source}
                </span>
                <span className="text-muted-foreground/60">·</span>
                <span>
                  {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : t.liveDate}
                </span>
              </div>
              <h2 className="font-display text-xl font-normal tracking-tight text-foreground leading-snug mb-2">
                {item.title}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.summary}</p>
              {item.url && (
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  {t.readSource} <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
