import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarClock,
  Clock,
  CheckCircle2,
  Flame,
  ChevronRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface DeadlineItem {
  id: string;
  label: string;
  category: "psirt" | "statutory" | "pqc" | "audit";
  date: string;
  timestampMs: number;
  articleRef: string;
  description: string;
  status: "overdue" | "due_soon" | "upcoming";
  daysRemaining: number;
  urgencyScore: number;
}

const DEFAULT_DEADLINES: DeadlineItem[] = [
  {
    id: "dl-1",
    label: "PSIRT 24h Early Warning Disclosure (CVE-2026-3891)",
    category: "psirt",
    date: "14 Aug 2026",
    timestampMs: Date.now() + 9 * 24 * 60 * 60 * 1000,
    articleRef: "CRA ART. 14(1)",
    description: "Statutory mandatory notification to ENISA CSIRT Single Reporting Platform within 24 hours of actively exploited vulnerability detection.",
    status: "due_soon",
    daysRemaining: 9,
    urgencyScore: 95,
  },
  {
    id: "dl-2",
    label: "PSIRT 72h Detailed Vulnerability & Impact Analysis",
    category: "psirt",
    date: "17 Aug 2026",
    timestampMs: Date.now() + 12 * 24 * 60 * 60 * 1000,
    articleRef: "CRA ART. 14(2)",
    description: "Detailed incident analysis report including severity metrics, affected software components, and initial remediation guidance.",
    status: "due_soon",
    daysRemaining: 12,
    urgencyScore: 88,
  },
  {
    id: "dl-3",
    label: "CRA Article 14 Mandatory Reporting Effective Date",
    category: "statutory",
    date: "21 Sep 2026",
    timestampMs: Date.now() + 47 * 24 * 60 * 60 * 1000,
    articleRef: "CRA ART. 57",
    description: "Statutory 21-month transition window expires. All economic operators must report active exploits under risk of €15M administrative fine.",
    status: "upcoming",
    daysRemaining: 47,
    urgencyScore: 75,
  },
  {
    id: "dl-4",
    label: "Full CRA Statutory Enforcement & Mandatory CE Marking",
    category: "statutory",
    date: "11 Dec 2027",
    timestampMs: Date.now() + 493 * 24 * 60 * 60 * 1000,
    articleRef: "CRA ART. 10 & ANNEX IV",
    description: "Full statutory enforcement. All products placed on the EU market require Annex IV Declaration of Conformity and Annex VII Technical File.",
    status: "upcoming",
    daysRemaining: 493,
    urgencyScore: 60,
  },
  {
    id: "dl-5",
    label: "NIST Post-Quantum Cryptography (PQC) Deprecation",
    category: "pqc",
    date: "01 Jan 2028",
    timestampMs: Date.now() + 514 * 24 * 60 * 60 * 1000,
    articleRef: "CBOM PQC MIGRATION",
    description: "EU Cybersecurity certification deprecating RSA-2048 & ECC P-256 for high-risk industrial products; migration to ML-KEM & ML-DSA.",
    status: "upcoming",
    daysRemaining: 514,
    urgencyScore: 40,
  },
];

export function InteractiveDeadlineHorizon({
  deadlines,
  now = Date.now(),
}: {
  deadlines?: any[];
  now?: number;
}) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>("dl-1");

  const itemsToRender: DeadlineItem[] = DEFAULT_DEADLINES;

  const filteredItems = itemsToRender.filter((item) => {
    if (selectedCategory === "all") return true;
    return item.category === selectedCategory;
  });

  const overdueCount = itemsToRender.filter((i) => i.status === "overdue").length;
  const dueSoonCount = itemsToRender.filter((i) => i.status === "due_soon").length;

  return (
    <Card className="rounded-2xl border border-border/80 bg-card/90 shadow-lg backdrop-blur-md overflow-hidden" data-tour="deadline-horizon">
      <CardHeader className="pb-4 border-b border-border/60 bg-gradient-to-r from-card via-card to-slate-900/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/30 font-mono text-xs gap-1.5">
                <CalendarClock className="h-3.5 w-3.5 text-orange-400" /> Statutory Incident &amp; Enforcement Horizon
              </Badge>
              <Badge variant="outline" className="text-xs font-mono bg-background">
                {overdueCount > 0 ? (
                  <span className="text-red-400 flex items-center gap-1 font-semibold">
                    <Flame className="h-3 w-3 animate-pulse" /> {overdueCount} Overdue
                  </span>
                ) : dueSoonCount > 0 ? (
                  <span className="text-amber-400 flex items-center gap-1 font-semibold">
                    <Clock className="h-3 w-3 animate-pulse text-amber-400" /> {dueSoonCount} Due within 14d
                  </span>
                ) : (
                  <span className="text-green-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> All Clocks Nominal
                  </span>
                )}
              </Badge>
            </div>
            <CardTitle className="text-xl font-display font-bold text-foreground tracking-tight">
              Article 14 &amp; EU CRA Deadline Timeline
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-0.5">
              Real-time statutory reporting clocks, CSIRT notifications, and enforcement milestones ranked by urgency.
            </CardDescription>
          </div>

          {/* Interactive Category Filter Tabs */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-xl border border-border/60 self-start md:self-auto font-mono text-xs">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                selectedCategory === "all"
                  ? "bg-background text-foreground shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All Clocks ({itemsToRender.length})
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory("psirt")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                selectedCategory === "psirt"
                  ? "bg-orange-500/20 text-orange-400 border border-orange-500/40 shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              PSIRT (24h/72h)
            </button>
            <button
              type="button"
              onClick={() => setSelectedCategory("statutory")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                selectedCategory === "statutory"
                  ? "bg-primary/20 text-primary border border-primary/40 shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              CRA Statutory
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 lg:p-6 space-y-4">
        {/* Interactive Animated Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item) => {
              const isExpanded = expandedId === item.id;

              return (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className={`rounded-2xl border p-4 transition-all duration-300 backdrop-blur-sm ${
                    item.status === "overdue"
                      ? "border-red-500/40 bg-red-500/5 shadow-md shadow-red-500/5"
                      : item.status === "due_soon"
                      ? "border-amber-500/40 bg-amber-500/5 shadow-md shadow-amber-500/5"
                      : "border-border/80 bg-card/80 hover:border-primary/40"
                  } ${isExpanded ? "ring-1 ring-orange-500/40" : ""}`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <Badge
                        variant="outline"
                        className={`font-mono text-[10px] uppercase tracking-wider ${
                          item.status === "overdue"
                            ? "bg-red-500/20 text-red-400 border-red-500/40"
                            : item.status === "due_soon"
                            ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                            : "bg-primary/10 text-primary border-primary/20"
                        }`}
                      >
                        {item.articleRef}
                      </Badge>
                      <span className="text-xs font-mono font-semibold text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3 text-primary" /> {item.date}
                      </span>
                    </div>

                    <h4 className="font-semibold text-sm text-foreground leading-snug">
                      {item.label}
                    </h4>

                    <div className="flex items-center justify-between text-xs font-mono pt-1">
                      <span className="text-muted-foreground">Remaining:</span>
                      <span
                        className={`font-bold ${
                          item.status === "overdue"
                            ? "text-red-400 animate-pulse"
                            : item.status === "due_soon"
                            ? "text-amber-400 font-semibold"
                            : "text-foreground"
                        }`}
                      >
                        {item.daysRemaining < 0
                          ? `${Math.abs(item.daysRemaining)}d OVERDUE`
                          : `${item.daysRemaining} days`}
                      </span>
                    </div>

                    {/* Progress Bar Indicator */}
                    <div className="h-1.5 w-full bg-muted/80 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          item.status === "overdue"
                            ? "bg-red-500"
                            : item.status === "due_soon"
                            ? "bg-amber-500"
                            : "bg-primary"
                        }`}
                        style={{
                          width: `${Math.max(10, Math.min(100, 100 - (item.daysRemaining / 500) * 100))}%`,
                        }}
                      />
                    </div>

                    {/* Expandable Details Drawer */}
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="pt-3 border-t border-border/60 text-xs space-y-2 text-muted-foreground leading-relaxed"
                      >
                        <p className="text-xs text-foreground font-normal">
                          {item.description}
                        </p>
                        <div className="flex items-center justify-between text-[11px] font-mono text-primary pt-1">
                          <span>ENISA CSIRT Hub</span>
                          <span className="flex items-center gap-1 hover:underline cursor-pointer">
                            Inspect Protocol <ChevronRight className="h-3 w-3" />
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-border/60 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-muted-foreground uppercase tracking-wider">
                      {item.category.toUpperCase()}
                    </span>
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="text-xs font-mono font-semibold text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1"
                    >
                      {isExpanded ? "Collapse Details ↑" : "Details & References ↓"}
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
}
