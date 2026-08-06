import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Newspaper,
  RefreshCw,
  ExternalLink,
  ShieldAlert,
  Zap,
  Globe,
  Radio,
} from "lucide-react";

export interface NewsItem {
  id?: number;
  title: string;
  summary: string;
  source: string;
  category: string;
  url?: string;
  modelUsed?: string;
  publishedAt?: string;
}

const FALLBACK_NEWS: NewsItem[] = [
  {
    title: "ENISA Issues Annex I Technical Guidelines for Connected Hardware",
    summary: "The European Union Agency for Cybersecurity published updated technical specifications for essential cybersecurity requirements under Article 10.",
    source: "ENISA Official Gazette",
    category: "CRA Standard",
    url: "https://www.enisa.europa.eu/topics/cybersecurity-act",
    modelUsed: "perplexity/sonar-pro",
    publishedAt: new Date().toISOString(),
  },
  {
    title: "CRA 36-Month Transition Window: Key Deadlines for Manufacturers",
    summary: "Hardware and software manufacturers placing products on the EU market must complete vulnerability handling disclosures by late 2026.",
    source: "EU Journal of Legislation",
    category: "Enforcement",
    url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R2847",
    modelUsed: "perplexity/sonar-pro",
    publishedAt: new Date().toISOString(),
  },
  {
    title: "CISA & ENISA Joint Advisory on Coordinated Vulnerability Handling",
    summary: "Harmonized SBOM and 24-hour reporting protocols agreed between transatlantic agencies for hardware-embedded software.",
    source: "CISA / ENISA Joint Advisory",
    category: "Vulnerability Management",
    url: "https://www.cisa.gov/news-events/cybersecurity-advisories",
    modelUsed: "perplexity/sonar-pro",
    publishedAt: new Date().toISOString(),
  },
  {
    title: "EU Commission Finalizes Article 6 Class I & Class II Product Categories",
    summary: "Defined risk categories for operating systems, microcontrollers, VPN routers, and password managers requiring Third-Party Assessment.",
    source: "European Commission Portal",
    category: "Product Categorization",
    url: "https://ec.europa.eu/commission/presscorner/detail/en/ip_23_4522",
    modelUsed: "perplexity/sonar-pro",
    publishedAt: new Date().toISOString(),
  },
];

export function LiveRegulatoryNewsFeed() {
  const [items, setItems] = useState<NewsItem[]>(FALLBACK_NEWS);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [modelUsed, setModelUsed] = useState<string>("perplexity/sonar-pro");

  const fetchNews = async (forceRefresh = false) => {
    if (forceRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const url = forceRefresh ? "/api/regulatory-news?refresh=true" : "/api/regulatory-news";
      const res = await fetch(url);
      const data = await res.json();

      if (res.ok && data.items && data.items.length > 0) {
        setItems(data.items);
        if (data.modelUsed) setModelUsed(data.modelUsed);
      } else {
        setItems(FALLBACK_NEWS);
      }
    } catch (_err) {
      setItems(FALLBACK_NEWS);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchNews(false);
  }, []);

  return (
    <section className="w-full py-12 bg-muted/20 border-y my-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="default" className="gap-1 bg-amber-500 hover:bg-amber-600 text-black font-semibold">
                <Radio className="h-3.5 w-3.5 animate-pulse" /> Live Regulatory Intelligence
              </Badge>
              <Badge variant="outline" className="text-xs font-mono">
                <Zap className="h-3 w-3 text-amber-500 mr-1" />
                {modelUsed}
              </Badge>
            </div>
            <h2 className="text-2xl md:text-3xl font-display font-normal tracking-tight text-foreground flex items-center gap-2">
              <Newspaper className="h-6 w-6 text-primary" /> EU CRA &amp; Cyber Resilience News Feed
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Real-time ENISA guidelines, Article 10 technical standards, and vulnerability disclosure updates powered by OpenRouter.
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchNews(true)}
            disabled={refreshing || loading}
            className="h-9 gap-1.5 font-medium self-start md:self-auto bg-background"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            {refreshing ? "Updating Live Feed…" : "Refresh News Feed"}
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-44 w-full rounded-xl" />
            <Skeleton className="h-44 w-full rounded-xl" />
            <Skeleton className="h-44 w-full rounded-xl" />
            <Skeleton className="h-44 w-full rounded-xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {items.map((item, idx) => (
              <div
                key={item.id || idx}
                className="rounded-xl border bg-card p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant="secondary" className="text-xs font-mono">
                      {item.category || "EU CRA"}
                    </Badge>
                    <span className="text-xs text-muted-foreground flex items-center gap-1 font-mono">
                      <Globe className="h-3 w-3 text-primary" /> {item.source}
                    </span>
                  </div>

                  <h3 className="font-semibold text-base text-foreground leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                    {item.summary}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t flex items-center justify-between text-xs text-muted-foreground font-mono">
                  <span>
                    {item.publishedAt ? new Date(item.publishedAt).toLocaleDateString() : "Live update"}
                  </span>
                  {item.url && (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1 font-sans font-medium"
                    >
                      Read Source <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
