import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  Megaphone,
  Contact,
  Flame,
  Globe,
  Layers,
  Sparkles,
  Zap,
  Clock,
  Send,
  Plus,
  BarChart3,
  Bot,
  Building2,
  FileText,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import { PsirtCanvas, SupplierScanItem } from "@/components/conformity/psirt-canvas";
import { PsirtSupplierIntel } from "@/components/conformity/psirt-supplier-intel";
import { PsirtSbomKev } from "@/components/conformity/psirt-sbom-kev";
import { PsirtAdvisories } from "@/components/conformity/psirt-advisories";

// Recharts Severity Radar Data
const SEVERITY_RADAR_DATA = [
  { subject: "Critical 9.0+", count: 4, fullMark: 10 },
  { subject: "High 7.0+", count: 8, fullMark: 10 },
  { subject: "Medium 4.0+", count: 5, fullMark: 10 },
  { subject: "Low 0.1+", count: 2, fullMark: 10 },
  { subject: "CISA KEV", count: 3, fullMark: 10 },
];

export default function PsirtPage() {
  const [activeTab, setActiveTab] = useState("canvas");
  const [aiAlertDismissed, setAiAlertDismissed] = useState(false);

  // ENISA Statutory Reporting Modal Drawer State
  const [enisaModalOpen, setEnisaModalOpen] = useState(false);
  const [enisaFormKind, setEnisaFormKind] = useState<"early_warning" | "detailed_report" | "final_report">("early_warning");
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Form Fields
  const [incidentTitle, setIncidentTitle] = useState("CVE-2026-3891 HMS Anybus Driver Stack RCE");
  const [affectedMemberStates, setAffectedMemberStates] = useState("DE, FR, NL, BE, ES, IT");
  const [exploitNature, setExploitNature] = useState("Unauthenticated memory corruption in CompactCom NP40 TCP packet parser.");
  const [userMitigations, setUserMitigations] = useState("Restrict TCP port 8443 on external router interface.");

  const handleLaunchEnisaForm = (kind: "early_warning" | "detailed_report" | "final_report") => {
    setEnisaFormKind(kind);
    setEnisaModalOpen(true);
  };

  const handleSubmitEnisaForm = () => {
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setEnisaModalOpen(false);
      toast.success(
        `ENISA Single Reporting Platform (${enisaFormKind === "early_warning" ? "≤24h Early Warning" : "≤72h Report"}) filed successfully! Reference #ENISA-CRA-2026-8819`
      );
    }, 1200);
  };

  const handleIngestSupplierItem = (item: SupplierScanItem) => {
    toast.success(`Ingested ${item.cveId} into PSIRT Intake Queue & Flowchart Canvas`);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-4 sm:p-6 lg:p-8">
      {/* Executive Command Header - Aligned to OXOT Styleguide */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 lg:p-8 shadow-sm text-card-foreground">
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl sm:text-4xl font-serif font-normal tracking-tight text-foreground">
                PSIRT &amp; Vulnerability Handling Workbench
              </h1>
              <p className="text-sm text-muted-foreground max-w-3xl leading-relaxed font-sans">
                Complete statutory vulnerability surveillance engine connecting live intake, OpenRouter Perplexity supplier scans, CISA KEV CBOM correlation, ENISA 24h/72h reporting, and ISO 29147 advisory authoring.
              </p>
            </div>

            {/* Statutory Clocks & Quick Action */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-center">
                <span className="text-[10px] font-mono font-bold uppercase text-destructive block tracking-wider">
                  Article 14(1) 24h Clock
                </span>
                <span className="text-lg font-mono font-extrabold text-destructive">09h 14m 22s</span>
              </div>
              <Button
                type="button"
                onClick={() => handleLaunchEnisaForm("early_warning")}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs gap-1.5 shadow-sm h-full px-5 py-3 rounded-lg cta-lift"
              >
                <Flame className="h-4 w-4" /> File ENISA 24h Warning
              </Button>
            </div>
          </div>

          {/* Executive Severity & Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-6 border-t border-border">
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold uppercase text-muted-foreground tracking-wider block">
                Incident Severity Distribution
              </span>
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={SEVERITY_RADAR_DATA}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
                    <Radar name="Incidents" dataKey="count" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-3 flex flex-col justify-center">
              <div className="rounded-xl border border-border bg-background p-4 space-y-1.5">
                <span className="text-xs font-mono text-muted-foreground flex items-center justify-between">
                  <span>Active PSIRT Incidents:</span>
                  <span className="font-bold text-foreground">3 Active</span>
                </span>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[60%]" />
                </div>
              </div>

              <div className="rounded-xl border border-border bg-background p-4 space-y-1.5">
                <span className="text-xs font-mono text-muted-foreground flex items-center justify-between">
                  <span>Published ISO Advisories:</span>
                  <span className="font-bold text-emerald-500">2 Published</span>
                </span>
                <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[80%]" />
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex flex-col justify-between">
              <div>
                <span className="oxot-kicker flex items-center gap-1.5 mb-1">
                  <Zap className="h-3.5 w-3.5 text-primary" /> ENISA SINGLE REPORTING PLATFORM
                </span>
                <p className="text-xs text-muted-foreground leading-relaxed font-sans">
                  Direct statutory API interface connected to ENISA SRP and Member State CSIRT designated nodes.
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleLaunchEnisaForm("detailed_report")}
                className="mt-3 font-sans text-xs border-border text-foreground hover:bg-muted justify-between cta-lift"
              >
                <span>Inspect 72h Notification</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* AI Automated Alert & Intake Recommendation Banner */}
      {!aiAlertDismissed && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-orange-500/40 bg-gradient-to-r from-orange-500/15 via-amber-500/10 to-card p-4 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-orange-500/20 p-2 text-orange-400 border border-orange-500/30 shrink-0">
              <Bot className="h-5 w-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase text-orange-400 tracking-wider">
                  AI Automated Intake Recommendation
                </span>
                <Badge variant="outline" className="text-[10px] font-mono bg-red-500/20 text-red-400 border-red-500/40">
                  CVE-2026-3891 Match
                </Badge>
              </div>
              <p className="text-xs font-medium text-foreground mt-0.5 leading-relaxed">
                OpenRouter Perplexity intelligence detected active CISA KEV exploitation matching NovaGuard Smart Home Hub CBOM component <code className="font-mono text-orange-300">hms-anybus-np40-driver</code>. AI recommends initializing an Article 14 incident workflow immediately.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
            <Button
              type="button"
              size="sm"
              onClick={() => handleLaunchEnisaForm("early_warning")}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs gap-1 shadow-md shadow-orange-500/20"
            >
              <Sparkles className="h-3.5 w-3.5" /> Initialize PSIRT Incident
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setAiAlertDismissed(true)}
              className="text-xs font-mono text-muted-foreground hover:text-foreground"
            >
              Dismiss
            </Button>
          </div>
        </motion.div>
      )}

      {/* Navigation Workbench Cards (No Overlap) */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 bg-muted/80 p-2 rounded-2xl border border-border/80 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab("canvas")}
            className={cn(
              "flex items-center justify-center gap-2 p-2.5 px-3 rounded-xl font-mono text-xs font-bold transition-all text-center whitespace-nowrap border cursor-pointer",
              activeTab === "canvas"
                ? "bg-background text-foreground shadow-md border-orange-500/40 ring-1 ring-orange-500/30"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50 border-transparent"
            )}
          >
            <Zap className="h-4 w-4 shrink-0 text-orange-400" />
            <span className="truncate">Flowchart Canvas</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("incidents")}
            className={cn(
              "flex items-center justify-center gap-2 p-2.5 px-3 rounded-xl font-mono text-xs font-bold transition-all text-center whitespace-nowrap border cursor-pointer",
              activeTab === "incidents"
                ? "bg-background text-foreground shadow-md border-red-500/40 ring-1 ring-red-500/30"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50 border-transparent"
            )}
          >
            <Flame className="h-4 w-4 shrink-0 text-red-400" />
            <span className="truncate">ENISA Queue</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("supplier-intel")}
            className={cn(
              "flex items-center justify-center gap-2 p-2.5 px-3 rounded-xl font-mono text-xs font-bold transition-all text-center whitespace-nowrap border cursor-pointer",
              activeTab === "supplier-intel"
                ? "bg-background text-foreground shadow-md border-primary/40 ring-1 ring-primary/30"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50 border-transparent"
            )}
          >
            <Globe className="h-4 w-4 shrink-0 text-primary" />
            <span className="truncate">Supplier Scan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("sbom-kev")}
            className={cn(
              "flex items-center justify-center gap-2 p-2.5 px-3 rounded-xl font-mono text-xs font-bold transition-all text-center whitespace-nowrap border cursor-pointer",
              activeTab === "sbom-kev"
                ? "bg-background text-foreground shadow-md border-orange-500/40 ring-1 ring-orange-500/30"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50 border-transparent"
            )}
          >
            <Layers className="h-4 w-4 shrink-0 text-orange-400" />
            <span className="truncate">CBOM / KEV</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("advisories")}
            className={cn(
              "flex items-center justify-center gap-2 p-2.5 px-3 rounded-xl font-mono text-xs font-bold transition-all text-center whitespace-nowrap border cursor-pointer",
              activeTab === "advisories"
                ? "bg-background text-foreground shadow-md border-emerald-500/40 ring-1 ring-emerald-500/30"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50 border-transparent"
            )}
          >
            <Megaphone className="h-4 w-4 shrink-0 text-emerald-400" />
            <span className="truncate">ISO Advisories</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={cn(
              "flex items-center justify-center gap-2 p-2.5 px-3 rounded-xl font-mono text-xs font-bold transition-all text-center whitespace-nowrap border cursor-pointer",
              activeTab === "profile"
                ? "bg-background text-foreground shadow-md border-primary/40 ring-1 ring-primary/30"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50 border-transparent"
            )}
          >
            <Contact className="h-4 w-4 shrink-0 text-primary" />
            <span className="truncate">CVD Policy</span>
          </button>
        </div>

        {/* Tab 1: Interactive Flowchart Canvas */}
        <TabsContent value="canvas">
          <PsirtCanvas onLaunchForm={handleLaunchEnisaForm} />
        </TabsContent>

        {/* Tab 2: Incident Intake Queue & Article 14 Filing */}
        <TabsContent value="incidents">
          <Card className="rounded-3xl border border-border/80 bg-card/90 shadow-xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <h3 className="font-display font-bold text-lg text-foreground">ENISA Article 14 Incident Intake &amp; Statutory Queue</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Track live incidents against 24h Early Warning and 72h Notification statutory clocks.</p>
              </div>
              <Button onClick={() => handleLaunchEnisaForm("early_warning")} className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs gap-1">
                <Plus className="h-4 w-4" /> New Article 14 Incident
              </Button>
            </div>

            <div className="rounded-2xl border border-red-500/30 bg-red-500/5 p-5 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="destructive" className="font-mono text-xs font-bold animate-pulse">
                    CVE-2026-3891 (9.8 CVSS)
                  </Badge>
                  <h4 className="font-bold text-sm text-foreground">NovaGuard Smart Home Hub Anybus RCE</h4>
                </div>
                <Badge variant="outline" className="font-mono text-xs text-red-400 border-red-500/40">
                  Early Warning Due: 09h 14m
                </Badge>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed">
                Critical unauthenticated remote code execution flaw in HMS Anybus CompactCom NP40 network processor. Actively exploited in EU member states (DE, FR).
              </p>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <Button size="sm" onClick={() => handleLaunchEnisaForm("early_warning")} className="bg-orange-500 text-white font-bold text-xs gap-1">
                  <Flame className="h-3.5 w-3.5" /> Submit ENISA 24h Early Warning
                </Button>
                <Button size="sm" variant="outline" onClick={() => handleLaunchEnisaForm("detailed_report")} className="font-mono text-xs">
                  File 72h Notification
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* Tab 3: OpenRouter Supplier Vulnerability Intelligence */}
        <TabsContent value="supplier-intel">
          <PsirtSupplierIntel onIngestIncident={handleIngestSupplierItem} />
        </TabsContent>

        {/* Tab 4: SBOM / HBOM KEV Matrix */}
        <TabsContent value="sbom-kev">
          <PsirtSbomKev />
        </TabsContent>

        {/* Tab 5: Published ISO 29147 Advisories */}
        <TabsContent value="advisories">
          <PsirtAdvisories />
        </TabsContent>

        {/* Tab 6: CVD Policy & Audit History */}
        <TabsContent value="profile">
          <Card className="rounded-3xl border border-border/80 bg-card/90 shadow-xl p-6 space-y-6">
            <div className="border-b pb-4">
              <h3 className="font-display font-bold text-lg text-foreground">CVD Policy &amp; Security Contact Profile</h3>
              <p className="text-xs text-muted-foreground mt-0.5">RFC 9116 security.txt policy manager for public vulnerability disclosure.</p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Security Contact Email</Label>
                <Input defaultValue="security@oxot.io" className="text-xs font-mono" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Security Contact URL</Label>
                <Input defaultValue="https://oxot.io/security" className="text-xs font-mono" />
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ENISA Single Reporting Platform Statutory Filing Modal Drawer */}
      <Dialog open={enisaModalOpen} onOpenChange={setEnisaModalOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-card border-border p-6 shadow-2xl">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-xl font-display font-bold text-foreground flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-400 animate-pulse" />
              ENISA Single Reporting Platform — {enisaFormKind === "early_warning" ? "CRA Art. 14(1) 24-Hour Early Warning" : "CRA Art. 14(2) 72-Hour Notification"}
            </DialogTitle>
            <DialogDescription className="text-xs font-mono text-muted-foreground">
              Official statutory reporting package routed directly to ENISA and designated National CSIRT Single Point of Contact.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 text-xs font-sans">
            <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-3 text-orange-200">
              <span className="font-mono font-bold uppercase text-[11px] block text-orange-400 mb-0.5">
                Statutory Reporting SLA
              </span>
              Mandatory submission required within 24 hours of becoming aware of active exploitation. Failure to report carries fine risk up to €15,000,000 under CRA Article 57.
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Incident / Vulnerability Title</Label>
              <Input value={incidentTitle} onChange={(e) => setIncidentTitle(e.target.value)} className="text-xs font-mono" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Affected EU Member States (Free text or country codes)</Label>
              <Input value={affectedMemberStates} onChange={(e) => setAffectedMemberStates(e.target.value)} className="text-xs font-mono" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Nature of Exploit &amp; Technical Severity</Label>
              <Textarea rows={3} value={exploitNature} onChange={(e) => setExploitNature(e.target.value)} className="text-xs font-sans" />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Interim Mitigations Users Can Apply</Label>
              <Textarea rows={2} value={userMitigations} onChange={(e) => setUserMitigations(e.target.value)} className="text-xs font-sans" />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setEnisaModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitEnisaForm}
              disabled={formSubmitted}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold gap-1.5"
            >
              {formSubmitted ? "Transmitting to ENISA..." : "Transmit Statutory Package to ENISA"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
