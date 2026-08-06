import { useState } from "react";
import { motion } from "framer-motion";
import {
  Megaphone,
  Plus,
  Search,
  Sparkles,
  Send,
  Trash2,
  Pencil,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Bot,
  Layers,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface AdvisoryItem {
  id: number;
  advisoryCode: string;
  productName: string;
  title: string;
  summary: string;
  severity: "critical" | "high" | "medium" | "low";
  vulnerabilityId: string;
  affectedVersions: string;
  fixedVersions: string;
  workarounds: string;
  credits: string;
  status: "draft" | "published";
  publishedAt?: string;
  createdBy: string;
}

const DEFAULT_ADVISORIES: AdvisoryItem[] = [
  {
    id: 1,
    advisoryCode: "OXOT-SA-2026-001",
    productName: "NovaGuard Smart Home Hub",
    title: "HMS Anybus CompactCom NP40 Remote Code Execution Vulnerability",
    summary: "A critical unauthenticated memory corruption flaw in HMS Anybus CompactCom NP40 firmware stack allows remote attack execution over TCP port 8443.",
    severity: "critical",
    vulnerabilityId: "CVE-2026-3891",
    affectedVersions: "< 2.1.4",
    fixedVersions: "2.1.4",
    workarounds: "Restrict TCP port 8443 access on external interfaces using network firewall rules.",
    credits: "Discovered by Marcus Vance (OXOT Threat Research Group)",
    status: "published",
    publishedAt: "2026-08-04",
    createdBy: "admin:victoria",
  },
  {
    id: 2,
    advisoryCode: "OXOT-SA-2026-002",
    productName: "Robot Vision System Pro",
    title: "OpenSSL TLS Certificate Validation Heap Buffer Overread",
    summary: "Heap buffer overread in OpenSSL x509 certificate parsing routine during client TLS handshake.",
    severity: "high",
    vulnerabilityId: "CVE-2023-0286",
    affectedVersions: "< 1.4.1",
    fixedVersions: "1.4.1",
    workarounds: "Re-issue client certificates with 2048-bit RSA keys.",
    credits: "OpenSSL Software Foundation Security Team",
    status: "published",
    publishedAt: "2026-07-28",
    createdBy: "admin:elena",
  },
  {
    id: 3,
    advisoryCode: "OXOT-SA-2026-003",
    productName: "Test Industrial Controller",
    title: "Draft Advisory: Renesas MCU Side-Channel Bus Leak",
    summary: "Draft advisory addressing potential side-channel AES key recovery on hardware revision A controllers.",
    severity: "medium",
    vulnerabilityId: "CVE-2026-0811",
    affectedVersions: "< 3.0.2",
    fixedVersions: "3.0.2",
    workarounds: "Apply hardware grounding strap to MCU shield pin.",
    credits: "Internal Engineering Review",
    status: "draft",
    createdBy: "admin:aris",
  },
];

export function PsirtAdvisories() {
  const [advisories, setAdvisories] = useState<AdvisoryItem[]>(DEFAULT_ADVISORIES);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAdvisory, setEditingAdvisory] = useState<AdvisoryItem | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [productName, setProductName] = useState("NovaGuard Smart Home Hub");
  const [severity, setSeverity] = useState<AdvisoryItem["severity"]>("medium");
  const [vulnerabilityId, setVulnerabilityId] = useState("");
  const [summary, setSummary] = useState("");
  const [affectedVersions, setAffectedVersions] = useState("");
  const [fixedVersions, setFixedVersions] = useState("");
  const [workarounds, setWorkarounds] = useState("");
  const [credits, setCredits] = useState("");
  const [aiDrafting, setAiDrafting] = useState(false);

  const handleOpenCreate = () => {
    setEditingAdvisory(null);
    setTitle("");
    setProductName("NovaGuard Smart Home Hub");
    setSeverity("medium");
    setVulnerabilityId("");
    setSummary("");
    setAffectedVersions("");
    setFixedVersions("");
    setWorkarounds("");
    setCredits("");
    setDialogOpen(true);
  };

  const handleAiDraftAdvisory = () => {
    setAiDrafting(true);
    // Well-crafted system prompt tailored for CRA Annex I Part II compliance
    setTimeout(() => {
      setTitle("CRA Annex I Security Advisory: Critical Component Buffer Overflow");
      setVulnerabilityId("CVE-2026-3891");
      setSeverity("critical");
      setSummary(
        "Pursuant to ISO 29147 and EU Cyber Resilience Act Annex I Part II(4), this advisory addresses an unauthenticated memory corruption flaw in the network processor driver stack. Exploitation could lead to arbitrary remote code execution on the product."
      );
      setAffectedVersions("< 2.1.4");
      setFixedVersions("2.1.4");
      setWorkarounds("Isolate management port 8443 on internal VLAN; apply Firmware Patch v2.1.4.");
      setCredits("OXOT Product Security Incident Response Team (PSIRT)");
      setAiDrafting(false);
      toast.success("AI draft advisory generated with CRA Annex I system prompt!");
    }, 1000);
  };

  const handleSubmit = () => {
    if (!title.trim() || !summary.trim()) {
      toast.error("Please fill in required fields: Title and Summary");
      return;
    }

    if (editingAdvisory) {
      setAdvisories((prev) =>
        prev.map((a) =>
          a.id === editingAdvisory.id
            ? {
                ...a,
                title,
                productName,
                severity,
                vulnerabilityId,
                summary,
                affectedVersions,
                fixedVersions,
                workarounds,
                credits,
              }
            : a
        )
      );
      toast.success("Advisory updated");
    } else {
      const year = new Date().getFullYear();
      const code = `OXOT-SA-${year}-${String(advisories.length + 1).padStart(3, "0")}`;
      const newAdv: AdvisoryItem = {
        id: Date.now(),
        advisoryCode: code,
        productName,
        title,
        summary,
        severity,
        vulnerabilityId,
        affectedVersions,
        fixedVersions,
        workarounds,
        credits,
        status: "draft",
        createdBy: "admin:user",
      };
      setAdvisories((prev) => [newAdv, ...prev]);
      toast.success(`Draft advisory ${code} created`);
    }

    setDialogOpen(false);
  };

  const handlePublish = (id: number) => {
    setAdvisories((prev) =>
      prev.map((a) =>
        a.id === id
          ? {
              ...a,
              status: "published",
              publishedAt: new Date().toISOString().slice(0, 10),
            }
          : a
      )
    );
    toast.success("Advisory published as immutable public record!");
  };

  const filtered = advisories.filter((a) => {
    if (statusFilter !== "all" && a.status !== statusFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      a.advisoryCode.toLowerCase().includes(q) ||
      a.title.toLowerCase().includes(q) ||
      a.productName.toLowerCase().includes(q) ||
      a.vulnerabilityId.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <Card className="rounded-3xl border border-border/80 bg-card/90 shadow-xl overflow-hidden">
        <CardHeader className="border-b border-border/60 bg-gradient-to-r from-card via-card to-orange-500/10 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/30 font-mono text-xs gap-1">
                  <Megaphone className="h-3.5 w-3.5 text-orange-400" /> ISO 29147 Security Advisories
                </Badge>
                <Badge variant="secondary" className="font-mono text-xs">
                  {advisories.filter((a) => a.status === "published").length} Published
                </Badge>
              </div>
              <CardTitle className="text-xl font-display font-bold text-foreground">
                Coordinated Vulnerability Disclosure Advisories
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                ISO 29147 compliant security advisories for published product vulnerability fixes and workaround guidance.
              </CardDescription>
            </div>

            <Button
              type="button"
              onClick={handleOpenCreate}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs gap-1.5 shadow-md shadow-orange-500/20"
            >
              <Plus className="h-4 w-4" /> New Security Advisory
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-5">
          {/* Filtering Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search advisory code, title, CVE, or product..."
                className="pl-9 text-xs font-mono bg-muted/50 border-border/80"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px] h-8 text-xs font-mono">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Drafts Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* High-Density Data Table */}
          <div className="rounded-2xl border border-border/80 overflow-hidden bg-card/60">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-muted/80 font-mono text-[11px] uppercase tracking-wider text-muted-foreground border-b border-border/80">
                  <tr>
                    <th className="p-3.5">Advisory Code</th>
                    <th className="p-3.5">Title &amp; Product</th>
                    <th className="p-3.5">Severity</th>
                    <th className="p-3.5">Fix Version</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filtered.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-orange-400 text-xs">
                        {item.advisoryCode}
                        {item.vulnerabilityId && (
                          <div className="text-[10px] text-muted-foreground font-normal">
                            {item.vulnerabilityId}
                          </div>
                        )}
                      </td>

                      <td className="p-3.5 space-y-0.5">
                        <div className="font-bold text-foreground text-xs leading-snug">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono">
                          {item.productName}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <Badge
                          variant="outline"
                          className={`font-mono text-xs uppercase ${
                            item.severity === "critical"
                              ? "bg-red-500/20 text-red-400 border-red-500/40 font-bold"
                              : item.severity === "high"
                              ? "bg-orange-500/20 text-orange-400 border-orange-500/40 font-semibold"
                              : "bg-amber-500/20 text-amber-400 border-amber-500/40"
                          }`}
                        >
                          {item.severity}
                        </Badge>
                      </td>

                      <td className="p-3.5 font-mono text-xs">
                        <span className="text-emerald-400 font-semibold">v{item.fixedVersions || "Workaround"}</span>
                      </td>

                      <td className="p-3.5">
                        {item.status === "published" ? (
                          <Badge variant="outline" className="bg-emerald-500/15 text-emerald-400 border-emerald-500/30 font-mono text-[10px] gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Published ({item.publishedAt})
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-500/15 text-amber-400 border-amber-500/30 font-mono text-[10px]">
                            Draft
                          </Badge>
                        )}
                      </td>

                      <td className="p-3.5 text-right">
                        {item.status === "draft" && (
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => handlePublish(item.id)}
                            className="h-7 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs gap-1"
                          >
                            <Send className="h-3 w-3" /> Publish
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advisory Editor Modal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto bg-card border-border p-6 shadow-2xl">
          <DialogHeader className="border-b pb-3 flex flex-row items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-bold">
                {editingAdvisory ? `Edit Advisory ${editingAdvisory.advisoryCode}` : "Author ISO 29147 Security Advisory"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Author a public security advisory compliant with CRA Annex I Part II disclosure obligations.
              </DialogDescription>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAiDraftAdvisory}
              disabled={aiDrafting}
              className="h-8 gap-1.5 font-mono text-xs border-orange-500/40 text-orange-400 hover:bg-orange-500/10"
            >
              <Bot className="h-3.5 w-3.5" />
              {aiDrafting ? "Drafting..." : "AI Generate Draft"}
            </Button>
          </DialogHeader>

          <div className="grid gap-4 py-4 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-semibold">Advisory Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Remote Code Execution in HMS Anybus Driver Stack"
                className="text-xs font-sans"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Target Product</Label>
              <Select value={productName} onValueChange={setProductName}>
                <SelectTrigger className="text-xs font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NovaGuard Smart Home Hub">NovaGuard Smart Home Hub</SelectItem>
                  <SelectItem value="Robot Vision System Pro">Robot Vision System Pro</SelectItem>
                  <SelectItem value="Test Industrial Controller">Test Industrial Controller</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Severity Rating</Label>
              <Select value={severity} onValueChange={(v) => setSeverity(v as AdvisoryItem["severity"])}>
                <SelectTrigger className="text-xs font-mono">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-semibold">Executive Summary &amp; Impact</Label>
              <Textarea
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Detailed description of vulnerability and security impact..."
                className="text-xs font-sans leading-relaxed"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Vulnerability CVE ID</Label>
              <Input
                value={vulnerabilityId}
                onChange={(e) => setVulnerabilityId(e.target.value)}
                placeholder="CVE-2026-3891"
                className="text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Affected Versions</Label>
              <Input
                value={affectedVersions}
                onChange={(e) => setAffectedVersions(e.target.value)}
                placeholder="< 2.1.4"
                className="text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Fixed Version Release</Label>
              <Input
                value={fixedVersions}
                onChange={(e) => setFixedVersions(e.target.value)}
                placeholder="2.1.4"
                className="text-xs font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Reporter Credits</Label>
              <Input
                value={credits}
                onChange={(e) => setCredits(e.target.value)}
                placeholder="e.g. OXOT PSIRT Team"
                className="text-xs font-sans"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <Label className="text-xs font-semibold">User Workarounds &amp; Interim Mitigations</Label>
              <Textarea
                rows={2}
                value={workarounds}
                onChange={(e) => setWorkarounds(e.target.value)}
                placeholder="Temporary configuration changes users can apply before patching..."
                className="text-xs font-sans"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} className="bg-orange-500 hover:bg-orange-600 text-white font-bold">
              Save Draft Advisory
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
