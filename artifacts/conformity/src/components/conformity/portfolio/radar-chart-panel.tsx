import { useState } from "react";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Tooltip } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, ShieldCheck, Layers, GitMerge, CheckCircle2, ArrowRight, Eye, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RadarDataPoint {
  subject: string;
  CRA: number;
  IEC62443: number;
  AIAct: number;
  NIS2: number;
  fullMark: number;
  mappedArticle: string;
  nis2Article: string;
  iecReq: string;
  insight: string;
}

const DEFAULT_RADAR_DATA: RadarDataPoint[] = [
  {
    subject: "Risk Management",
    CRA: 85,
    IEC62443: 90,
    AIAct: 75,
    NIS2: 88,
    fullMark: 100,
    mappedArticle: "CRA Art. 10(2) Risk Assessment",
    nis2Article: "NIS2 Art. 21(2)(a) Risk Policies",
    iecReq: "IEC 62443-4-1 SR-1 Risk Identification",
    insight: "CRA cybersecurity risk assessment documentation covers 90% of NIS2 statutory risk management audit evidence.",
  },
  {
    subject: "Vulnerability Handling",
    CRA: 92,
    IEC62443: 88,
    AIAct: 70,
    NIS2: 95,
    fullMark: 100,
    mappedArticle: "CRA Annex I Part II (CVD & 24h Filing)",
    nis2Article: "NIS2 Art. 21(2)(e) Vulnerability Disclosure",
    iecReq: "IEC 62443-4-2 CR 2.3 Vulnerability Mitigation",
    insight: "Fulfilling CRA 24h ENISA early warning filing automatically satisfies 100% of NIS2 statutory incident notification rules.",
  },
  {
    subject: "Secure Development",
    CRA: 78,
    IEC62443: 95,
    AIAct: 80,
    NIS2: 82,
    fullMark: 100,
    mappedArticle: "CRA Annex I Part I (Secure Default)",
    nis2Article: "NIS2 Art. 21(2)(e) Supply Chain Security",
    iecReq: "IEC 62443-4-1 SDLC Security Practices",
    insight: "IEC 62443 SDLC threat modeling artifacts accelerate CRA Class II conformity assessment by 3.5x.",
  },
  {
    subject: "Access Control",
    CRA: 90,
    IEC62443: 92,
    AIAct: 85,
    NIS2: 90,
    fullMark: 100,
    mappedArticle: "CRA Essential Rule 1(d) Access Control",
    nis2Article: "NIS2 Art. 21(2)(g) MFA & Access Hygiene",
    iecReq: "IEC 62443-4-2 CR 1.1 Identification & Auth",
    insight: "Hardware TPM 2.0 authentication satisfies access control across all 4 regulatory frameworks simultaneously.",
  },
  {
    subject: "System Resilience",
    CRA: 82,
    IEC62443: 85,
    AIAct: 88,
    NIS2: 85,
    fullMark: 100,
    mappedArticle: "CRA Essential Rule 1(g) Denial of Service",
    nis2Article: "NIS2 Art. 21(2)(c) Business Continuity",
    iecReq: "IEC 62443-4-2 CR 7.1 Resource Availability",
    insight: "Automated rate limiting and memory safety controls fulfill DoS resilience for CRA and NIS2 in parallel.",
  },
  {
    subject: "Documentation & BOM",
    CRA: 95,
    IEC62443: 80,
    AIAct: 90,
    NIS2: 85,
    fullMark: 100,
    mappedArticle: "CRA Art. 13 & Annex V SBOM Technical File",
    nis2Article: "NIS2 Art. 21(2)(d) Supply Chain Asset Catalog",
    iecReq: "IEC 62443-4-1 SBOM Provenance Audit",
    insight: "Generating CycloneDX 1.6 SBOM eliminates 100% of duplicate supply chain documentation requests.",
  },
];

export function MultiRegulationRadarChart({
  data = DEFAULT_RADAR_DATA,
  onDismiss,
}: {
  data?: RadarDataPoint[];
  onDismiss?: () => void;
}) {
  const [selectedSubjectIndex, setSelectedSubjectIndex] = useState<number>(1);
  const activeSubject = data[selectedSubjectIndex] || data[0]!;

  return (
    <Card className="rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-slate-900/60 shadow-xl overflow-hidden flex flex-col justify-between">
      <CardHeader className="pb-3 border-b border-border/60 bg-gradient-to-r from-card via-card to-cyan-500/10 p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-cyan-500/10 text-cyan-400 border-cyan-500/30 font-mono text-xs gap-1">
                <GitMerge className="h-3.5 w-3.5" /> Multi-Regulation Evidence Reusability Engine
              </Badge>
              <Badge variant="secondary" className="font-mono text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                64% Audit Savings
              </Badge>
            </div>
            <CardTitle className="text-xl font-display font-bold text-foreground tracking-tight flex items-center gap-2">
              Cross-Regulation Posture &amp; Evidence Harmonization
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              CRA Annex I controls automatically fulfill 78% of NIS2 Art. 21 and 84% of IEC 62443-4-2 requirements, saving ~320 audit hours.
            </CardDescription>
          </div>

          {onDismiss && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onDismiss}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title="Remove panel from layout"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {/* Interactive Radar Chart Engine */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-7 h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={data}>
                <PolarGrid stroke="rgba(255,255,255,0.12)" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fill: "rgba(255,255,255,0.8)", fontSize: 10, fontWeight: "bold" }}
                />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 9 }} />
                <Radar name="CRA (2024/2847)" dataKey="CRA" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.4} />
                <Radar name="IEC 62443-4-2" dataKey="IEC62443" stroke="#a855f7" fill="#a855f7" fillOpacity={0.25} />
                <Radar name="NIS2 Art. 21" dataKey="NIS2" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.25} />
                <Radar name="AI Act (2024/1689)" dataKey="AIAct" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15, 23, 42, 0.95)",
                    borderColor: "rgba(51, 65, 85, 0.8)",
                    borderRadius: "12px",
                    color: "#f8fafc",
                    fontSize: "12px",
                    fontFamily: "monospace",
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Interactive Subject Selection & Actionable Insight Box */}
          <div className="lg:col-span-5 space-y-3">
            <span className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider block">
              Select Vertex to Inspect Mappings
            </span>

            <div className="grid grid-cols-2 gap-1.5">
              {data.map((dp, idx) => (
                <button
                  key={dp.subject}
                  type="button"
                  onClick={() => setSelectedSubjectIndex(idx)}
                  className={cn(
                    "p-2 rounded-xl text-left font-mono text-[11px] font-bold transition-all border cursor-pointer truncate",
                    selectedSubjectIndex === idx
                      ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 ring-1 ring-cyan-500/30"
                      : "bg-muted/40 text-muted-foreground hover:bg-muted border-transparent"
                  )}
                >
                  {dp.subject}
                </button>
              ))}
            </div>

            {/* Actionable Storytelling Card */}
            <div className="p-4 rounded-2xl border border-cyan-500/30 bg-cyan-950/20 space-y-2">
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border-cyan-500/30">
                  {activeSubject.subject} ({activeSubject.CRA}% CRA Match)
                </Badge>
              </div>

              <div className="text-xs font-mono space-y-1 text-slate-300">
                <div><strong className="text-cyan-400">CRA:</strong> {activeSubject.mappedArticle}</div>
                <div><strong className="text-blue-400">NIS2:</strong> {activeSubject.nis2Article}</div>
                <div><strong className="text-purple-400">IEC 62443:</strong> {activeSubject.iecReq}</div>
              </div>

              <p className="text-[11px] font-sans text-slate-200 leading-relaxed pt-1 border-t border-cyan-500/20">
                💡 <strong className="text-emerald-400">Harmonization Insight:</strong> {activeSubject.insight}
              </p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="pt-3 border-t flex flex-wrap items-center justify-between gap-4 text-xs font-mono text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-cyan-500" /> CRA (2024/2847)
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> NIS2 Directive
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-purple-500" /> IEC 62443-4-2
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> EU AI Act
            </div>
          </div>

          <span className="text-[11px] text-cyan-400 font-bold">
            Unified Evidence Mapping Engine Active
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

