import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, ArrowRight, Clock, User, Headphones } from "lucide-react";
import { useLocale } from "@/providers/locale-provider";

const copy = {
  en: {
    badge: "Engineering Corpus",
    heading: "In-Depth CRA Engineering & Statutory Guides",
    seeAll: "Explore all 50 guides",
    readTime: "8 min read",
  },
  nl: {
    badge: "Technisch Corpus",
    heading: "Diepgaande CRA Technische & Juridische Gidsen",
    seeAll: "Ontdek alle 50 gidsen",
    readTime: "8 min leestijd",
  },
} as const;

interface BlogSummary {
  id: string;
  slug: string;
  title: string;
  code: string;
  statutes: string[];
  persona: string;
  readTime: string;
  summary: string;
  publishedAt: string;
}

const FALLBACK_BLOGS: BlogSummary[] = [
  {
    id: "EP_1.01",
    slug: "the-2-year-lag-why-2024-contracts-are-walking-into-a-2027-re",
    title: "The 2-Year Lag: Why 2024 Contracts Are Walking into a 2027 Regulatory Trap",
    code: "EP_1.01",
    statutes: ["Article 2", "Article 71"],
    persona: "EPC Contractors & Planners",
    readTime: "8 min read",
    summary: "Industrial turnkey contracts signed with 2-year build phases result in non-compliant 2027 handover liabilities.",
    publishedAt: "2026-08-14"
  },
  {
    id: "EP_2.01",
    slug: "the-accidental-manufacturer-how-system-integrators-trigger-a",
    title: "The Accidental Manufacturer: How System Integrators Trigger Article 21",
    code: "EP_2.01",
    statutes: ["Article 21", "Recital 24"],
    persona: "Industrial Integrators",
    readTime: "9 min read",
    summary: "Modifying custom PLC logic or integrating multi-vendor skids reclassifies an EPC as the legal CRA manufacturer.",
    publishedAt: "2026-08-14"
  },
  {
    id: "TC_01",
    slug: "tc-01-the-edge-to-cloud-grey-zone",
    title: "The Edge-to-Cloud Grey Zone: When Microservices Void Local Controller CE Marks",
    code: "TC_01",
    statutes: ["Article 3(2)", "Article 21"],
    persona: "Cloud-OT Architects",
    readTime: "10 min read",
    summary: "Shattering the myth that OTA container pushes are purely IT operations without CE mark implications.",
    publishedAt: "2026-08-14"
  }
];

export function LiveCraBlogGuidesFeed() {
  const { locale } = useLocale();
  const t = copy[locale];
  const [blogs, setBlogs] = useState<BlogSummary[]>(FALLBACK_BLOGS);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetch("/api/blogs")
      .then((res) => res.json())
      .then((data) => {
        if (!alive) return;
        if (data?.items && data.items.length > 0) {
          setBlogs(data.items.slice(0, 3));
        } else {
          setBlogs(FALLBACK_BLOGS);
        }
      })
      .catch(() => {
        if (alive) setBlogs(FALLBACK_BLOGS);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <section className="w-full py-12 bg-card/60 border-b border-border">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        {/* Header row */}
        <div className="flex flex-wrap items-center justify-between gap-y-2 mb-6">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="gap-1.5 bg-primary/10 text-primary border-primary/20 font-semibold px-2.5 py-1 text-xs">
              <BookOpen className="h-3.5 w-3.5" /> {t.badge}
            </Badge>
            <span className="font-display text-base md:text-lg font-bold text-foreground">
              {t.heading}
            </span>
          </div>
          <Link
            href="/blog"
            className="text-xs md:text-sm font-semibold text-primary hover:underline flex items-center gap-1.5"
          >
            {t.seeAll} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* 3 Featured Guides */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-36 w-full rounded-2xl" />
            <Skeleton className="h-36 w-full rounded-2xl" />
            <Skeleton className="h-36 w-full rounded-2xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {blogs.map((blog) => (
              <Link
                key={blog.id}
                href={`/blog`}
                className="group flex flex-col justify-between rounded-2xl border border-border bg-card p-5 hover:border-primary/50 hover:shadow-md transition-all duration-200"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-mono font-bold">
                      {blog.code}
                    </span>
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-mono">
                      <Clock className="w-3 h-3" />
                      {blog.readTime || t.readTime}
                    </div>
                  </div>

                  <h3 className="font-display text-sm md:text-base font-bold text-foreground leading-snug mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {blog.title}
                  </h3>

                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 mb-3">
                    {blog.summary}
                  </p>
                </div>

                <div className="pt-3 border-t border-border/60 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 text-[11px] font-medium text-foreground truncate max-w-[180px]">
                    <User className="w-3 h-3 text-primary/70 flex-shrink-0" />
                    {blog.persona}
                  </span>
                  <span className="font-semibold text-primary group-hover:translate-x-0.5 transition-transform flex items-center gap-1 text-[11px]">
                    Read <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
