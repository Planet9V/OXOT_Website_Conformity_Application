import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Globe, Radio, ExternalLink } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { useSeo } from '@/hooks/use-seo';
import { Newspaper } from 'lucide-react';

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
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useSeo({
    title: 'CRA Regulatory News',
    description: 'Live EU Cyber Resilience Act regulatory intelligence — ENISA guidelines, Commission guidance and CISA advisories.',
  });

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
        kicker="LIVE CRA REGULATORY INTELLIGENCE"
        title="Regulatory News"
        icon={Newspaper}
        description="A growing corpus of EU Cyber Resilience Act developments — ENISA technical guidelines, European Commission guidance, statutory deadlines and CISA / KEV advisories. Refreshed automatically from live web search; the newest items appear first."
      />

      <div className="flex items-center gap-2 mb-6">
        <Badge className="gap-1.5 bg-amber-500 hover:bg-amber-500 text-black font-semibold">
          <Radio className="h-3.5 w-3.5 animate-pulse" /> Live
        </Badge>
        <span className="text-sm text-muted-foreground">
          {loading ? 'Loading…' : `${items.length} article${items.length === 1 ? '' : 's'} in the corpus`}
        </span>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground">No regulatory news has been generated yet.</p>
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
                  {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Live'}
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
                  Read source <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
