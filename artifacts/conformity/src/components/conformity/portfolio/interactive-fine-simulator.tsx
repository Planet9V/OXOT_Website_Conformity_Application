import React, { useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Scale,
  ShieldCheck,
  AlertTriangle,
  TrendingDown,
  ArrowRight,
  ExternalLink,
  Info,
  DollarSign,
  Calculator,
  Sliders,
  Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

type BreachTier = "TIER_A" | "TIER_B" | "TIER_C";

export function InteractiveFineSimulator({
  defaultTurnover = 1200, // in Millions (€1.2B)
  defaultMitigation = 85, // 85% mitigation
}: {
  defaultTurnover?: number;
  defaultMitigation?: number;
}) {
  const [turnoverMillions, setTurnoverMillions] = useState<number>(defaultTurnover);
  const [mitigationScore, setMitigationScore] = useState<number>(defaultMitigation);
  const [breachTier, setBreachTier] = useState<BreachTier>("TIER_A");

  // Format monetary amounts
  const formatCurrency = (amountInMillions: number) => {
    if (amountInMillions >= 1000) {
      return `€${(amountInMillions / 1000).toFixed(2)}B`;
    }
    return `€${amountInMillions.toFixed(1)}M`;
  };

  const calculation = useMemo(() => {
    let statutoryFixed = 15; // €15M
    let statutoryPercent = 0.025; // 2.5%
    let articleCitation = "Article 61(1) — Annex I Essential Cybersecurity Breaches";

    if (breachTier === "TIER_B") {
      statutoryFixed = 10; // €10M
      statutoryPercent = 0.02; // 2.0%
      articleCitation = "Article 61(2) — Manufacturer, Importer & Distributor Obligations";
    } else if (breachTier === "TIER_C") {
      statutoryFixed = 5; // €5M
      statutoryPercent = 0.01; // 1.0%
      articleCitation = "Article 61(3) — Misleading Information to Authorities / Notified Bodies";
    }

    const turnoverPercentAmount = turnoverMillions * statutoryPercent;
    // Article 61: "whichever is higher"
    const statutoryMaxFine = Math.max(statutoryFixed, turnoverPercentAmount);

    // Mitigated fine based on compliance controls and safe harbor
    const mitigationMultiplier = Math.max(0.02, (100 - mitigationScore) / 100);
    const mitigatedFine = statutoryMaxFine * mitigationMultiplier;
    const capitalSaved = statutoryMaxFine - mitigatedFine;

    return {
      statutoryFixed,
      statutoryPercent: statutoryPercent * 100,
      articleCitation,
      statutoryMaxFine,
      mitigatedFine,
      capitalSaved,
      mitigationMultiplier: 100 - mitigationScore,
    };
  }, [turnoverMillions, mitigationScore, breachTier]);

  const chartData = [
    {
      name: "Statutory Maximum Exposure",
      amount: calculation.statutoryMaxFine,
      color: "#ef4444", // Red
    },
    {
      name: "Simulated Mitigated Penalty",
      amount: calculation.mitigatedFine,
      color: "#f59e0b", // Amber
    },
    {
      name: "Capital Risk Shielded",
      amount: calculation.capitalSaved,
      color: "#10b981", // Emerald Green
    },
  ];

  return (
    <Card className="rounded-2xl border border-border/80 shadow-md bg-card/90">
      <CardHeader className="pb-4 border-b border-border/70">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-red-500/10 text-red-400 border-red-500/30 font-mono text-xs">
                <Scale className="h-3.5 w-3.5 text-red-400 mr-1" /> Article 61 What-If Fine Simulation Engine
              </Badge>
              <Badge variant="secondary" className="font-mono text-xs">
                Recital 119 Mitigations
              </Badge>
            </div>
            <CardTitle className="text-xl font-bold font-display text-foreground">
              Dynamic Statutory Penalty &amp; Liability Shield Modeling
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Simulate enterprise fine exposures under Regulation (EU) 2024/2847 Article 61 against corporate turnover and compliance posture.
            </CardDescription>
          </div>

          <a href="/conformity/cra-wiki?tab=articles&num=61">
            <Button variant="outline" size="sm" className="gap-1.5 font-mono text-xs">
              Statute Details <ExternalLink className="h-3.5 w-3.5" />
            </Button>
          </a>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/20 space-y-1.5">
            <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
              <span>Statutory Maximum Exposure</span>
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <div className="font-display font-bold text-2xl text-red-400">
              {formatCurrency(calculation.statutoryMaxFine)}
            </div>
            <div className="font-mono text-[11px] text-muted-foreground">
              Higher of €{calculation.statutoryFixed}M or {calculation.statutoryPercent}% turnover
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-1.5">
            <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
              <span>Simulated Mitigated Exposure</span>
              <TrendingDown className="w-4 h-4 text-amber-400" />
            </div>
            <div className="font-display font-bold text-2xl text-amber-400">
              {formatCurrency(calculation.mitigatedFine)}
            </div>
            <div className="font-mono text-[11px] text-muted-foreground">
              After {mitigationScore}% verified safety controls
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-1.5">
            <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
              <span>Net Capital Shielded</span>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="font-display font-bold text-2xl text-emerald-400">
              {formatCurrency(calculation.capitalSaved)}
            </div>
            <div className="font-mono text-[11px] text-emerald-500 font-semibold">
              {( (calculation.capitalSaved / calculation.statutoryMaxFine) * 100 ).toFixed(1)}% statutory liability avoided
            </div>
          </div>
        </div>

        {/* Sliders and Controls Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
          <div className="space-y-5 p-5 rounded-xl bg-muted/30 border border-border/70">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-foreground flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-primary" />
                1. Global Annual Corporate Turnover
              </span>
              <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                {formatCurrency(turnoverMillions)}
              </span>
            </div>
            <Slider
              value={[turnoverMillions]}
              min={50}
              max={10000}
              step={50}
              onValueChange={(val) => setTurnoverMillions(val[0])}
              className="py-2"
            />
            <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
              <span>€50M (Mid-Cap)</span>
              <span>€1.2B (Enterprise OT)</span>
              <span>€10B (Global Conglomerate)</span>
            </div>

            <div className="pt-2 border-t border-border/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-foreground flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  2. Mitigating Security &amp; Safe Harbor Posture
                </span>
                <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {mitigationScore}% Mitigated
                </span>
              </div>
              <Slider
                value={[mitigationScore]}
                min={0}
                max={98}
                step={1}
                onValueChange={(val) => setMitigationScore(val[0])}
                className="py-2"
              />
              <div className="flex justify-between text-[10px] font-mono text-muted-foreground">
                <span>0% (Unmitigated)</span>
                <span>50% (Partial SBOMs)</span>
                <span>98% (Safe Harbor + IEC 62443)</span>
              </div>
            </div>

            <div className="pt-2 border-t border-border/50 space-y-2">
              <span className="font-mono text-xs font-bold text-foreground">
                3. Statutory Violation Classification:
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setBreachTier("TIER_A")}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    breachTier === "TIER_A"
                      ? "bg-red-500/15 border-red-500/50 text-foreground ring-1 ring-red-500/30"
                      : "bg-muted/40 border-border/60 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="font-mono font-bold text-xs">Tier A (Annex I)</div>
                  <div className="text-[10px] opacity-80">Max €15M / 2.5%</div>
                </button>
                <button
                  onClick={() => setBreachTier("TIER_B")}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    breachTier === "TIER_B"
                      ? "bg-amber-500/15 border-amber-500/50 text-foreground ring-1 ring-amber-500/30"
                      : "bg-muted/40 border-border/60 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="font-mono font-bold text-xs">Tier B (Art. 10-19)</div>
                  <div className="text-[10px] opacity-80">Max €10M / 2.0%</div>
                </button>
                <button
                  onClick={() => setBreachTier("TIER_C")}
                  className={`p-2.5 rounded-lg border text-left transition-all ${
                    breachTier === "TIER_C"
                      ? "bg-blue-500/15 border-blue-500/50 text-foreground ring-1 ring-blue-500/30"
                      : "bg-muted/40 border-border/60 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <div className="font-mono font-bold text-xs">Tier C (Notified)</div>
                  <div className="text-[10px] opacity-80">Max €5M / 1.0%</div>
                </button>
              </div>
            </div>
          </div>

          {/* Visual Comparison Chart */}
          <div className="p-5 rounded-xl bg-muted/30 border border-border/70 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs font-bold text-foreground">
                  Statutory Exposure vs. Mitigated Comparison (€ Millions)
                </span>
                <span className="text-[10px] font-mono text-muted-foreground">
                  {calculation.articleCitation.split("—")[0]}
                </span>
              </div>
              <div className="h-44 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 30, top: 10, bottom: 10 }}>
                    <XAxis type="number" tickFormatter={(v) => `€${v}M`} stroke="#888888" fontSize={11} />
                    <YAxis dataKey="name" type="category" width={140} stroke="#888888" fontSize={10} tickLine={false} />
                    <Tooltip
                      formatter={(val: any) => [`€${Number(val).toFixed(2)}M`, "Amount"]}
                      contentStyle={{ backgroundColor: "#18181b", borderColor: "#27272a", borderRadius: "8px", fontSize: "11px" }}
                    />
                    <Bar dataKey="amount" radius={[0, 6, 6, 0]}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-card/90 border border-border/80 text-[11px] font-sans space-y-1">
              <div className="flex items-center gap-1.5 font-mono text-primary font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                Affirmative Defense Guidance:
              </div>
              <p className="text-muted-foreground leading-snug">
                Under <strong>Recital 119</strong>, national market surveillance authorities must account for proactive mitigation, voluntary cooperation, and verifiable harmonised standard adherence (IEC 62443) when assessing administrative fines under Article 61.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
