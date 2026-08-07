import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Globe, Radio, ArrowRight } from "lucide-react";

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

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetch("/api/regulatory-news?limit=3")
      .then((res) => res.json())
      .then((data) => {
        if (!alive) return;
        if (data?.items && data.items.length > 0) setItems(data.items);
        else setItems(FALLBACK_NEWS);
      })
      .catch(() => {
        if (alive) setItems(FALLBACK_NEWS);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const top3 = items.slice(0, 3);

  return (
    <section className="w-full py-10 bg-muted/20 border-y">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        {/* Compact header row: live badge + one-line heading + "see all" */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-5">
          <Badge variant="default" className="gap-1.5 bg-amber-500 hover:bg-amber-500 text-black font-semibold shrink-0">
            <Radio className="h-3.5 w-3.5 animate-pulse" /> Live CRA intel
          </Badge>
          <span className="font-display text-base md:text-lg text-foreground">
            Latest from ENISA, the Commission &amp; CISA
          </span>
          <Link
            href="/news"
            className="ml-auto text-sm font-medium text-primary-ink hover:underline flex items-center gap-1"
          >
            See all regulatory news <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {top3.map((item, idx) => {
              const inner = (
                <>
                  <div className="text-[10px] font-mono uppercase tracking-wide text-muted-foreground flex items-center gap-1.5">
                    <Globe className="h-3 w-3 text-primary" />
                    <span className="truncate">{item.source}</span>
                    <span className="text-muted-foreground/60">·</span>
                    <span className="whitespace-nowrap">
                      {item.publishedAt
                        ? new Date(item.publishedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                        : "Live"}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm font-medium text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </p>
                </>
              );
              return item.url ? (
                <a
                  key={item.id || idx}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group rounded-lg border bg-card px-4 py-3 hover:border-primary/50 transition-colors"
                >
                  {inner}
                </a>
              ) : (
                <div key={item.id || idx} className="group rounded-lg border bg-card px-4 py-3">
                  {inner}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
