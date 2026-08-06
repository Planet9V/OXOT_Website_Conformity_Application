import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Newspaper, ShieldAlert, ExternalLink, Calendar, BellRing } from "lucide-react";

export type NewsItem = {
  id: string;
  title: string;
  source: string; // ENISA | CISA KEV | EU Official Journal | CERT-EU
  date: string;
  summary: string;
  severity?: "critical" | "high" | "info";
  url: string;
};

const SAMPLE_NEWS_FEED: NewsItem[] = [
  {
    id: "news-1",
    title: "ENISA Releases Guidelines on CRA Article 14 Early Warning Reporting",
    source: "ENISA",
    date: "2026-08-04",
    summary: "Technical specifications for the 24-hour CSIRT notification endpoint and secure payload formats under Regulation (EU) 2024/2847.",
    severity: "high",
    url: "https://www.enisa.europa.eu",
  },
  {
    id: "news-2",
    title: "CISA Adds 4 Industrial Controller Vulnerabilities to Known Exploited Vulnerabilities (KEV)",
    source: "CISA KEV",
    date: "2026-08-03",
    summary: "Active exploitation detected in OT/ICS field devices; OEMs using legacy TCP/IP stacks must verify patches within 14 days.",
    severity: "critical",
    url: "https://www.cisa.gov/known-exploited-vulnerabilities-catalog",
  },
  {
    id: "news-3",
    title: "EU AI Act (2024/1689) Conformity Assessment Module Harmonization",
    source: "EU Official Journal",
    date: "2026-08-01",
    summary: "Updated mapping alignment for products incorporating embedded machine learning models under CRA Annex I(2)(a).",
    severity: "info",
    url: "https://eur-lex.europa.eu",
  },
];

export function RegulatoryNewsFeed() {
  return (
    <Card className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl shadow-2xl overflow-hidden">
      <CardHeader className="border-b border-slate-800/80 bg-slate-950/40 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold text-slate-100 flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-cyan-400" />
              Daily Regulatory & CVE Intelligence
            </CardTitle>
            <CardDescription className="text-slate-400 text-xs mt-0.5">
              Live ENISA advisories, CISA KEV notices, and EU CRA statutory guidance updates.
            </CardDescription>
          </div>
          <Badge className="bg-cyan-950 text-cyan-400 border border-cyan-500/40 font-mono text-[10px] px-3 py-1 rounded-full shadow-[0_0_12px_rgba(34,211,238,0.2)]">
            <BellRing className="w-3 h-3 mr-1 animate-pulse" /> LIVE FEED
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {SAMPLE_NEWS_FEED.map((news) => (
          <div
            key={news.id}
            className="group flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border border-slate-800/80 bg-slate-950/40 hover:border-slate-700 transition-all duration-300 hover:scale-[1.01]"
          >
            <div className="space-y-1.5 min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                    news.severity === "critical"
                      ? "bg-red-950/60 border-red-500/40 text-red-400"
                      : news.severity === "high"
                      ? "bg-amber-950/60 border-amber-500/40 text-amber-400"
                      : "bg-cyan-950/60 border-cyan-500/40 text-cyan-400"
                  }`}
                >
                  {news.source}
                </span>
                <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" /> {news.date}
                </span>
              </div>
              <h4 className="font-semibold text-slate-200 group-hover:text-cyan-300 transition-colors truncate">
                {news.title}
              </h4>
              <p className="text-xs text-slate-400 line-clamp-2">{news.summary}</p>
            </div>
            <a
              href={news.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 shrink-0 px-3 py-1.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 transition-all"
            >
              Read Notice <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
