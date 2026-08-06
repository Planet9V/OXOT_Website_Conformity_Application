import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldAlert,
  UserCheck,
  Clock,
  ArrowRight,
  FileText,
  AlertTriangle,
  Zap,
  Building2,
  Mail,
  Send,
  Sparkles,
  ChevronRight,
  Plus,
  Bot,
  Flame,
  Pencil,
  Trash2,
  MoveUp,
  MoveDown,
  Save,
  User,
  Settings2,
  CheckCircle2,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface StepNode {
  id: string;
  stepNumber: number;
  title: string;
  role: string;
  assignee: string;
  sla: string;
  status: "completed" | "in_progress" | "pending";
  actionLabel: string;
  actionType: "early_warning" | "detailed_report" | "vex" | "advisory" | "customer_notice" | "final_report";
  description: string;
}

const DEFAULT_FLOW_STEPS: StepNode[] = [
  {
    id: "step-1",
    stepNumber: 1,
    title: "Signal Intake & Verification",
    role: "Lead Security Analyst",
    assignee: "Marcus Vance",
    sla: "Immediate (< 2h)",
    status: "completed",
    actionLabel: "Verify Intake Vulnerability Report",
    actionType: "early_warning",
    description: "Receive vulnerability signal via CVD security.txt, CVE feed, or Perplexity supplier scan. Validate report authenticity.",
  },
  {
    id: "step-2",
    stepNumber: 2,
    title: "CBOM & KEV Vulnerability Correlation",
    role: "PSIRT Engineer",
    assignee: "Elena Rostova",
    sla: "< 6 Hours",
    status: "completed",
    actionLabel: "Correlate Product CBOM / KEV",
    actionType: "vex",
    description: "Cross-reference CVE against CycloneDX CBOM, HBOM, and CISA Known Exploited Vulnerabilities catalog.",
  },
  {
    id: "step-3",
    stepNumber: 3,
    title: "VEX Exploitability Analysis",
    role: "Firmware Lead",
    assignee: "Dr. Aris Thorne",
    sla: "< 12 Hours",
    status: "in_progress",
    actionLabel: "Generate VEX Statement",
    actionType: "vex",
    description: "Perform reachability analysis to determine if vulnerable function is reachable in production firmware execution path.",
  },
  {
    id: "step-4",
    stepNumber: 4,
    title: "ENISA SRP 24h Early Warning Filing",
    role: "Compliance Officer",
    assignee: "Sarah Jenkins",
    sla: "≤ 24 Hours (CRA Art. 14(1))",
    status: "in_progress",
    actionLabel: "File ENISA 24h Early Warning",
    actionType: "early_warning",
    description: "Submit mandatory statutory early warning to ENISA Single Reporting Platform detailing active exploit status and affected EU states.",
  },
  {
    id: "step-5",
    stepNumber: 5,
    title: "72h Detailed Impact Notification",
    role: "Security Architect",
    assignee: "Devon Miller",
    sla: "≤ 72 Hours (CRA Art. 14(2))",
    status: "pending",
    actionLabel: "File ENISA 72h Notification",
    actionType: "detailed_report",
    description: "File detailed technical impact analysis, CVSS v3.1 metrics, affected components, and interim user mitigations.",
  },
  {
    id: "step-6",
    stepNumber: 6,
    title: "Engineering Patch & Signed CVD Advisory",
    role: "Release Manager",
    assignee: "Alex Rivera",
    sla: "Before Public Disclosure",
    status: "pending",
    actionLabel: "Publish ISO 29147 Advisory",
    actionType: "advisory",
    description: "Develop cryptographic firmware update v2.1.4 and publish signed ISO 29147 security advisory with fix guidance.",
  },
  {
    id: "step-7",
    stepNumber: 7,
    title: "14-Day Final Investigation Report",
    role: "PSIRT Director / Legal",
    assignee: "Victoria Sterling",
    sla: "≤ 14 Days After Fix",
    status: "pending",
    actionLabel: "File Final Incident Report",
    actionType: "final_report",
    description: "Submit root cause analysis, threat actor attribution details, and long-term preventive architecture controls to ENISA.",
  },
];

export interface CustomerAccount {
  id: string;
  orgName: string;
  contactName: string;
  email: string;
  deployedProduct: string;
  notified: boolean;
  notifiedAt?: string;
}

const DEFAULT_CUSTOMERS: CustomerAccount[] = [
  {
    id: "cust-1",
    orgName: "Siemens Energy Europe GmbH",
    contactName: "Hans Weber (CISO)",
    email: "h.weber@siemens-energy.de",
    deployedProduct: "NovaGuard Smart Home Hub v2.1",
    notified: true,
    notifiedAt: "2026-08-04 14:20",
  },
  {
    id: "cust-2",
    orgName: "Airbus Defence & Space SA",
    contactName: "Claire Dubois (Cyber Lead)",
    email: "c.dubois@airbus.com",
    deployedProduct: "Robot Vision System Pro v1.4",
    notified: false,
  },
  {
    id: "cust-3",
    orgName: "BASF Industrial Automation BV",
    contactName: "Jan Van Der Meer",
    email: "j.vandermeer@basf.com",
    deployedProduct: "Test Industrial Controller v3.0",
    notified: false,
  },
];

const STORAGE_KEY = "oxot_psirt_workflow_steps_v3";

export function PsirtCanvas({
  onLaunchForm,
}: {
  onLaunchForm?: (formType: "early_warning" | "detailed_report" | "final_report") => void;
}) {
  const [steps, setSteps] = useState<StepNode[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn("Failed to load saved PSIRT workflow steps:", e);
    }
    return DEFAULT_FLOW_STEPS;
  });

  const [selectedStep, setSelectedStep] = useState<StepNode | null>(() => steps[0] || DEFAULT_FLOW_STEPS[0]!);
  const [customers, setCustomers] = useState<CustomerAccount[]>(DEFAULT_CUSTOMERS);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [aiGenerating, setAiGenerating] = useState(false);
  const [generatedNotice, setGeneratedNotice] = useState<string | null>(null);

  // Visual Workflow Designer & Editor State
  const [designerOpen, setDesignerOpen] = useState(false);
  const [editingSteps, setEditingSteps] = useState<StepNode[]>(steps);
  const [activeEditIndex, setActiveEditIndex] = useState(0);

  const [teamMembers, setTeamMembers] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/team")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setTeamMembers(data);
        }
      })
      .catch((e) => console.warn("Failed to fetch team members:", e));
  }, []);

  const persistSteps = (newSteps: StepNode[]) => {
    setSteps(newSteps);
    setEditingSteps(newSteps);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSteps));
    } catch (e) {
      console.warn("Failed to persist PSIRT steps to localStorage:", e);
    }
  };

  const handleResetToBaseline = () => {
    persistSteps(DEFAULT_FLOW_STEPS);
    setSelectedStep(DEFAULT_FLOW_STEPS[0]!);
    toast.success("Reset workflow to statutory CRA Article 14 baseline template.");
  };

  const handleNotifyCustomer = (cust: CustomerAccount) => {
    setCustomers((prev) =>
      prev.map((c) =>
        c.id === cust.id
          ? { ...c, notified: true, notifiedAt: new Date().toISOString().replace("T", " ").slice(0, 16) }
          : c
      )
    );
    toast.success(`Statutory security advisory dispatched to ${cust.orgName} (${cust.email})`);
  };

  const handleGenerateAiNotice = (cust: CustomerAccount) => {
    setAiGenerating(true);
    setTimeout(() => {
      setGeneratedNotice(
        `OFFICIAL CRA SECURITY NOTICE & ADVISORY\nTarget Organization: ${cust.orgName}\nContact: ${cust.contactName} (${cust.email})\nProduct: ${cust.deployedProduct}\nVulnerability: CVE-2026-3891 (Critical 9.8 CVSS)\n\nStatutory Guidance: Pursuant to EU Cyber Resilience Act Article 14(2), we notify you of an active vulnerability in the HMS Anybus driver stack. Please apply Firmware Patch v2.1.4 immediately or restrict inbound TCP port 8443.`
      );
      setAiGenerating(false);
      setCustomerModalOpen(true);
    }, 1000);
  };

  // Designer Node Manipulation Handlers
  const handleAddStepNode = () => {
    const newId = `step-${editingSteps.length + 1}`;
    const newStep: StepNode = {
      id: newId,
      stepNumber: editingSteps.length + 1,
      title: "New Process Block",
      role: "Security Analyst",
      assignee: "Unassigned",
      sla: "< 24 Hours",
      status: "pending",
      actionLabel: "Execute Step Action",
      actionType: "early_warning",
      description: "Define custom operating procedure and responsibilities for this workflow step.",
    };
    const updated = [...editingSteps, newStep];
    setEditingSteps(updated);
    setActiveEditIndex(editingSteps.length);
    toast.success("Added new step block to designer");
  };

  const handleMoveStep = (index: number, direction: "up" | "down") => {
    if ((direction === "up" && index === 0) || (direction === "down" && index === editingSteps.length - 1)) return;
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    const updated = [...editingSteps];
    const temp = updated[index]!;
    updated[index] = updated[targetIdx]!;
    updated[targetIdx] = temp;
    const reindexed = updated.map((s, idx) => ({ ...s, stepNumber: idx + 1 }));
    setEditingSteps(reindexed);
    setActiveEditIndex(targetIdx);
  };

  const handleDeleteStep = (index: number) => {
    if (editingSteps.length <= 1) {
      toast.error("Workflow must have at least one step block");
      return;
    }
    const updated = editingSteps.filter((_, idx) => idx !== index);
    const reindexed = updated.map((s, idx) => ({ ...s, stepNumber: idx + 1 }));
    setEditingSteps(reindexed);
    setActiveEditIndex(Math.max(0, index - 1));
    toast.success("Removed step block from workflow");
  };

  const handleSaveAndDeployWorkflow = () => {
    persistSteps(editingSteps);
    if (editingSteps.length > 0) {
      setSelectedStep(editingSteps[0]!);
    }
    setDesignerOpen(false);
    toast.success(`Saved & deployed custom ${editingSteps.length}-step PSIRT workflow!`);
  };

  // Completion calculation for executive dashboard
  const completedCount = steps.filter((s) => s.status === "completed").length;
  const inProgressCount = steps.filter((s) => s.status === "in_progress").length;
  const completionPct = Math.round((completedCount / (steps.length || 1)) * 100);

  return (
    <div className="space-y-8">
      {/* Visual Interactive Incident Workflow Flowchart Canvas */}
      <Card className="rounded-3xl border border-border/80 bg-gradient-to-br from-card via-card to-slate-900/60 shadow-xl overflow-hidden">
        <CardHeader className="border-b border-border/60 bg-gradient-to-r from-card via-card to-orange-500/10 p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Badge variant="outline" className="bg-orange-500/10 text-orange-400 border-orange-500/30 font-mono text-xs gap-1">
                  <Zap className="h-3.5 w-3.5 text-orange-400" /> ISO 30111 / CRA Art. 14 Incident Canvas
                </Badge>
                <Badge variant="secondary" className="font-mono text-xs">
                  Active Execution Graph ({steps.length} Steps)
                </Badge>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono text-xs">
                  Saved &amp; Persistent
                </Badge>
              </div>
              <CardTitle className="text-2xl font-display font-bold text-foreground tracking-tight">
                Executive Incident Response Flowchart Matrix
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Screen-ready presentation graph connecting incident intake, assigned team leads, statutory SLA clocks, and filing triggers.
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Button
                type="button"
                onClick={() => {
                  setEditingSteps([...steps]);
                  setActiveEditIndex(0);
                  setDesignerOpen(true);
                }}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-extrabold text-xs gap-1.5 shadow-md"
              >
                <Pencil className="h-3.5 w-3.5" /> Open Visual Workflow Designer &amp; Editor
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleResetToBaseline}
                className="font-mono text-xs text-muted-foreground border-border/60 hover:bg-muted"
                title="Reset steps to statutory default baseline"
              >
                Reset Baseline
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => onLaunchForm?.("early_warning")}
                className="font-bold text-xs gap-1.5 border-orange-500/40 text-orange-400 hover:bg-orange-500/10"
              >
                <Flame className="h-4 w-4" /> Open ENISA 24h Filing Form
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Executive Presentation Process Grid (Screen-Fit connected stage flow) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
            {steps.map((step) => {
              const isSelected = selectedStep?.id === step.id;

              return (
                <motion.div
                  key={step.id}
                  whileHover={{ scale: 1.02, y: -2 }}
                  onClick={() => setSelectedStep(step)}
                  className={`relative rounded-2xl border p-4 shadow-md transition-all cursor-pointer backdrop-blur-md flex flex-col justify-between ${
                    step.status === "completed"
                      ? "border-emerald-500/40 bg-emerald-500/5 hover:border-emerald-500/70"
                      : step.status === "in_progress"
                      ? "border-orange-500/60 bg-orange-500/10 ring-2 ring-orange-500/30 hover:border-orange-500"
                      : "border-border/80 bg-card/80 hover:border-primary/50"
                  } ${isSelected ? "ring-2 ring-primary shadow-xl bg-primary/10" : ""}`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500/20 text-orange-400 font-mono font-bold text-xs border border-orange-500/30">
                        {step.stepNumber}
                      </span>
                      <Badge
                        variant="outline"
                        className={`font-mono text-[10px] uppercase tracking-wider ${
                          step.status === "completed"
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/40"
                            : step.status === "in_progress"
                            ? "bg-orange-500/20 text-orange-400 border-orange-500/40 animate-pulse"
                            : "bg-muted text-muted-foreground border-border/40"
                        }`}
                      >
                        {step.status.replace("_", " ")}
                      </Badge>
                    </div>

                    <h4 className="font-bold text-sm text-foreground leading-snug mb-1.5">
                      {step.title}
                    </h4>

                    <div className="space-y-1 text-xs font-mono text-muted-foreground mb-3">
                      <div className="flex items-center gap-1.5 text-foreground">
                        <UserCheck className="h-3.5 w-3.5 text-orange-400 shrink-0" />
                        <span className="truncate font-semibold">{step.assignee}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground text-[11px]">
                        <Clock className="h-3 w-3 text-primary shrink-0" /> {step.sla}
                      </div>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (step.actionType === "early_warning" || step.actionType === "detailed_report" || step.actionType === "final_report") {
                        onLaunchForm?.(step.actionType);
                      } else {
                        toast.info(`Triggered action: ${step.actionLabel}`);
                      }
                    }}
                    className="w-full h-7 text-[11px] font-sans font-semibold text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 hover:text-orange-300 gap-1 mt-2"
                  >
                    {step.actionLabel} <ChevronRight className="h-3 w-3" />
                  </Button>
                </motion.div>
              );
            })}
          </div>

          {/* Executive Command & SLA Tracker Split Console */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2">
            {/* Left 2-Cols: Active Focus Step Detail Card */}
            {selectedStep ? (
              <div className="lg:col-span-2 rounded-2xl border border-primary/30 bg-primary/5 p-5 space-y-3 flex flex-col justify-between shadow-lg">
                <div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="default" className="bg-primary text-primary-foreground font-mono text-xs">
                        Step #{selectedStep.stepNumber} Active Focus
                      </Badge>
                      <h3 className="font-display font-bold text-base text-foreground">
                        {selectedStep.title}
                      </h3>
                    </div>
                    <Badge variant="outline" className="font-mono text-xs text-orange-400 border-orange-500/30">
                      Owner: {selectedStep.assignee}
                    </Badge>
                  </div>

                  <p className="text-xs leading-relaxed text-foreground font-medium mb-3">
                    {selectedStep.description}
                  </p>

                  {/* Team Member Contact & Responsibility Matrix */}
                  <div className="bg-background/60 p-3 rounded-xl border border-border/50 text-xs mb-3 space-y-1.5 font-mono">
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground border-b border-border/30 pb-1">
                      <span className="font-bold text-foreground flex items-center gap-1">
                        <UserCheck className="h-3.5 w-3.5 text-primary" /> {selectedStep.assignee}
                      </span>
                      <span className="text-primary font-semibold">{selectedStep.position || selectedStep.role}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-muted-foreground pt-0.5">
                      <div>
                        <span className="text-[10px] uppercase block">Department</span>
                        <span className="text-foreground font-medium">{selectedStep.department || "Cybersecurity & Incident Response"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase block">Contact Email</span>
                        <span className="text-primary font-medium">{selectedStep.email || `${selectedStep.assignee.toLowerCase().replace(" ", ".")}@oxot.eu`}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase block">Telephone</span>
                        <span className="text-foreground font-medium">{selectedStep.telephone || "+31 (0)20 555 0199"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase block">Statutory Mandate</span>
                        <span className="text-foreground font-medium truncate block" title={selectedStep.role}>{selectedStep.role}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono bg-background/50 p-3 rounded-xl border border-border/40">
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Statutory SLA</span>
                      <span className="font-bold text-orange-400">{selectedStep.sla}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Current Status</span>
                      <span className="font-bold text-foreground capitalize">{selectedStep.status.replace("_", " ")}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[10px]">Filing Trigger</span>
                      <span className="font-bold text-primary capitalize">{selectedStep.actionType.replace("_", " ")}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      if (selectedStep.actionType === "early_warning" || selectedStep.actionType === "detailed_report" || selectedStep.actionType === "final_report") {
                        onLaunchForm?.(selectedStep.actionType);
                      } else {
                        toast.info(`Executing step action: ${selectedStep.actionLabel}`);
                      }
                    }}
                    className="h-8 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs gap-1.5 shadow"
                  >
                    <Sparkles className="h-3.5 w-3.5" /> Execute {selectedStep.actionLabel}
                  </Button>
                </div>
              </div>
            ) : null}

            {/* Right Col: Statutory Incident SLA Progress */}
            <div className="rounded-2xl border border-border/70 bg-card/80 p-5 space-y-3.5 shadow-lg flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono font-bold text-foreground uppercase tracking-wider">
                    Workflow Incident Progress
                  </span>
                  <span className="text-sm font-mono font-extrabold text-orange-400">
                    {completionPct}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="h-2.5 w-full bg-muted/60 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-emerald-500 transition-all duration-500 rounded-full"
                    style={{ width: `${completionPct}%` }}
                  />
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                    <span className="text-emerald-400 font-semibold">Completed Steps</span>
                    <span className="font-bold text-emerald-400">{completedCount}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-orange-500/10 border border-orange-500/30">
                    <span className="text-orange-400 font-semibold">In-Progress Steps</span>
                    <span className="font-bold text-orange-400">{inProgressCount}</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border/40">
                    <span className="text-muted-foreground font-semibold">Total Graph Nodes</span>
                    <span className="font-bold text-foreground">{steps.length}</span>
                  </div>
                </div>
              </div>

              <div className="text-[11px] text-muted-foreground font-mono bg-muted/30 p-2.5 rounded-xl border border-border/30">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 inline mr-1" />
                Persistent in Local Storage — edits automatically synced across browser reloads.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Affected Customer Accounts & AI Notification Dispatch Directory */}
      <Card className="rounded-3xl border border-border/80 bg-card/90 shadow-xl overflow-hidden">
        <CardHeader className="border-b border-border/60 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-mono text-xs gap-1">
                  <Building2 className="h-3.5 w-3.5" /> Deployment Customer Directory
                </Badge>
                <Badge variant="secondary" className="font-mono text-xs">
                  Article 14(4) Customer Advisory
                </Badge>
              </div>
              <CardTitle className="text-xl font-display font-bold text-foreground">
                Affected Enterprise Deployment Customers
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground mt-0.5">
                Linked deployment customer accounts requiring mandatory security advisory notification upon vulnerability confirmation.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="divide-y divide-border/60">
            {customers.map((cust) => (
              <div key={cust.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-foreground">{cust.orgName}</span>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {cust.deployedProduct}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-2 font-mono">
                    <span>Contact: {cust.contactName}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-primary">
                      <Mail className="h-3 w-3" /> {cust.email}
                    </span>
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto">
                  {cust.notified ? (
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono text-xs">
                      Notified ({cust.notifiedAt})
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/30 font-mono text-xs">
                      Notification Pending
                    </Badge>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleGenerateAiNotice(cust)}
                    disabled={aiGenerating}
                    className="h-8 gap-1 text-xs font-mono border-orange-500/30 text-orange-400 hover:bg-orange-500/10"
                  >
                    <Bot className="h-3.5 w-3.5" /> AI Generate Advisory
                  </Button>

                  {!cust.notified && (
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleNotifyCustomer(cust)}
                      className="h-8 gap-1 text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <Send className="h-3.5 w-3.5" /> Dispatch Notice
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Customer Security Notice Modal */}
      <Dialog open={customerModalOpen} onOpenChange={setCustomerModalOpen}>
        <DialogContent className="max-w-2xl bg-card border-border p-6 shadow-2xl">
          <DialogHeader className="border-b pb-3">
            <DialogTitle className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-orange-400" /> AI-Generated Statutory Customer Advisory
            </DialogTitle>
            <DialogDescription className="text-xs">
              Formally drafted security advisory ready for encrypted dispatch to deployment customer.
            </DialogDescription>
          </DialogHeader>

          {generatedNotice && (
            <div className="py-4">
              <textarea
                readOnly
                rows={10}
                value={generatedNotice}
                className="w-full rounded-xl border border-border bg-muted/60 p-4 font-mono text-xs leading-relaxed text-foreground"
              />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setCustomerModalOpen(false)}>
              Close Preview
            </Button>
            <Button
              onClick={() => {
                toast.success("AI Customer Advisory signed and queued for dispatch!");
                setCustomerModalOpen(false);
              }}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold"
            >
              Confirm &amp; Send to Customer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* FULL VISUAL PSIRT WORKFLOW DESIGNER & CANVAS EDITOR DIALOG */}
      <Dialog open={designerOpen} onOpenChange={setDesignerOpen}>
        <DialogContent className="max-w-5xl bg-card border-border p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
          <DialogHeader className="border-b pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <Pencil className="h-5 w-5 text-primary" /> Visual PSIRT Workflow Designer &amp; Editor
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-1">
                  Design, edit, reorder, and configure custom process blocks, team assignments, statutory SLA clocks, and filing triggers. Deploys live to presentation canvas.
                </DialogDescription>
              </div>
              <Button
                type="button"
                onClick={handleAddStepNode}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs gap-1.5 shadow-md self-start sm:self-auto"
              >
                <Plus className="h-4 w-4" /> Add Process Block
              </Button>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 py-4">
            {/* Left Column: Process Steps List */}
            <div className="lg:col-span-5 space-y-3 border-r pr-4 max-h-[500px] overflow-y-auto">
              <span className="text-xs font-mono font-bold text-muted-foreground uppercase tracking-wider block">
                Workflow Sequence Blocks ({editingSteps.length} Blocks)
              </span>

              {editingSteps.map((s, index) => {
                const isActive = activeEditIndex === index;
                return (
                  <div
                    key={s.id}
                    onClick={() => setActiveEditIndex(index)}
                    className={cn(
                      "p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3",
                      isActive
                        ? "bg-primary/10 border-primary shadow-sm"
                        : "bg-muted/40 border-border/70 hover:border-primary/50"
                    )}
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-[10px] font-mono bg-background">
                          #{index + 1}
                        </Badge>
                        <span className="font-bold text-xs text-foreground truncate">{s.title}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground font-mono truncate">
                        {s.assignee} • <span className="text-orange-400 font-semibold">{s.sla}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={index === 0}
                        onClick={() => handleMoveStep(index, "up")}
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      >
                        <MoveUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={index === editingSteps.length - 1}
                        onClick={() => handleMoveStep(index, "down")}
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      >
                        <MoveDown className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteStep(index)}
                        className="h-7 w-7 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Node Details & Inspector Form */}
            <div className="lg:col-span-7 space-y-4">
              {editingSteps[activeEditIndex] && (
                <div className="space-y-4 rounded-2xl border border-border p-4 bg-muted/20">
                  <div className="flex items-center justify-between border-b pb-3">
                    <Badge variant="secondary" className="font-mono text-xs">
                      Editing Block #{activeEditIndex + 1}: {editingSteps[activeEditIndex]!.title}
                    </Badge>
                    <Badge variant="outline" className="font-mono text-[10px] bg-background">
                      Node ID: {editingSteps[activeEditIndex]!.id}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs font-mono font-bold">Process Block Title</Label>
                      <Input
                        value={editingSteps[activeEditIndex]!.title}
                        onChange={(e) => {
                          const updated = [...editingSteps];
                          updated[activeEditIndex]!.title = e.target.value;
                          setEditingSteps(updated);
                        }}
                        className="font-sans text-xs font-semibold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-mono font-bold">Assigned Team Member (From Team Directory)</Label>
                      <Select
                        value={editingSteps[activeEditIndex]!.assignee}
                        onValueChange={(val) => {
                          const selectedMember = teamMembers.find((m) => m.displayName === val || m.username === val);
                          const updated = [...editingSteps];
                          updated[activeEditIndex]!.assignee = selectedMember ? selectedMember.displayName : val;
                          if (selectedMember) {
                            updated[activeEditIndex]!.position = selectedMember.position;
                            updated[activeEditIndex]!.email = selectedMember.email;
                            updated[activeEditIndex]!.telephone = selectedMember.telephone;
                            updated[activeEditIndex]!.department = selectedMember.department;
                            if (selectedMember.roleResponsibility) {
                              updated[activeEditIndex]!.role = selectedMember.roleResponsibility;
                            }
                          }
                          setEditingSteps(updated);
                        }}
                      >
                        <SelectTrigger className="h-8 text-xs font-semibold bg-background">
                          <SelectValue placeholder="Select Team Member" />
                        </SelectTrigger>
                        <SelectContent>
                          {teamMembers.map((m) => (
                            <SelectItem key={m.id || m.username} value={m.displayName} className="text-xs font-mono">
                              {m.displayName} ({m.position || "Assessor"}) — {m.email || `${m.username}@oxot.eu`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-mono font-bold">Role / Responsibility</Label>
                      <Input
                        value={editingSteps[activeEditIndex]!.role}
                        onChange={(e) => {
                          const updated = [...editingSteps];
                          updated[activeEditIndex]!.role = e.target.value;
                          setEditingSteps(updated);
                        }}
                        className="font-sans text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-mono font-bold">Statutory SLA Clock</Label>
                      <Input
                        value={editingSteps[activeEditIndex]!.sla}
                        onChange={(e) => {
                          const updated = [...editingSteps];
                          updated[activeEditIndex]!.sla = e.target.value;
                          setEditingSteps(updated);
                        }}
                        className="font-mono text-xs text-orange-400 font-bold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label className="text-xs font-mono font-bold">Action Trigger Type</Label>
                      <Select
                        value={editingSteps[activeEditIndex]!.actionType}
                        onValueChange={(val: any) => {
                          const updated = [...editingSteps];
                          updated[activeEditIndex]!.actionType = val;
                          setEditingSteps(updated);
                        }}
                      >
                        <SelectTrigger className="text-xs font-mono">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="early_warning">ENISA 24h Early Warning</SelectItem>
                          <SelectItem value="detailed_report">ENISA 72h Notification</SelectItem>
                          <SelectItem value="vex">VEX Reachability Analysis</SelectItem>
                          <SelectItem value="advisory">Signed ISO 29147 Advisory</SelectItem>
                          <SelectItem value="customer_notice">Customer Advisory Dispatch</SelectItem>
                          <SelectItem value="final_report">14-Day Final Incident Report</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs font-mono font-bold">Button Action Label</Label>
                      <Input
                        value={editingSteps[activeEditIndex]!.actionLabel}
                        onChange={(e) => {
                          const updated = [...editingSteps];
                          updated[activeEditIndex]!.actionLabel = e.target.value;
                          setEditingSteps(updated);
                        }}
                        className="font-sans text-xs"
                      />
                    </div>

                    <div className="space-y-1.5 sm:col-span-2">
                      <Label className="text-xs font-mono font-bold">Standard Operating Procedure / Description</Label>
                      <Textarea
                        rows={4}
                        value={editingSteps[activeEditIndex]!.description}
                        onChange={(e) => {
                          const updated = [...editingSteps];
                          updated[activeEditIndex]!.description = e.target.value;
                          setEditingSteps(updated);
                        }}
                        className="font-sans text-xs leading-relaxed"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="border-t pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs text-muted-foreground font-mono">
              Clicking &quot;Save &amp; Deploy&quot; updates the presentation flowchart graph in real-time.
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setDesignerOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleSaveAndDeployWorkflow}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-extrabold gap-1.5 shadow-lg shadow-orange-500/20"
              >
                <Save className="h-4 w-4" /> Save &amp; Deploy Workflow to Canvas
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
