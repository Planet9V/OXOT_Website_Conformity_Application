import React, { useState, useMemo } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sparkles,
  Send,
  BookOpen,
  Copy,
  Check,
  Bot,
  User,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Scale,
  Cpu,
  RefreshCw,
  Lightbulb,
} from "lucide-react";
import { recitalsData, articlesData, annexesData } from "@/data/craCorpusData";

export type PersonaId =
  | "INTEGRATOR"
  | "MANUFACTURER"
  | "STEWARD"
  | "IMPORTER"
  | "PLANT_CISO"
  | "AUDITOR";

interface Message {
  id: string;
  sender: "user" | "copilot";
  text: string;
  timestamp: string;
  citations?: {
    type: "article" | "recital" | "annex";
    number: string | number;
    title: string;
    snippet: string;
  }[];
  statutoryAdvice?: string;
  riskLevel?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
}

const PERSONA_PRESETS: Record<
  PersonaId,
  {
    roleName: string;
    quickPrompts: string[];
    defaultContext: string;
  }
> = {
  INTEGRATOR: {
    roleName: "Industrial System Integrator (Axians / VINCI)",
    quickPrompts: [
      "Does modifying this SCADA HMI script trigger Article 21 substantial modification?",
      "How do we preserve our Recital 34 Safe Harbor Shield during a brownfield PLC upgrade?",
      "When does adding an industrial firewall trigger Annex VII composite assessment?",
      "What are our Article 20(2) duty to refrain requirements for unpatched vendor RTUs?",
    ],
    defaultContext:
      "You are advising an OT System Integrator configuring industrial automation plants. Emphasize Recital 34 Safe Harbor, Article 21 non-modification boundaries, and Annex VII composite documentation.",
  },
  MANUFACTURER: {
    roleName: "OEM Hardware & Software Manufacturer (Siemens / Cisco)",
    quickPrompts: [
      "Which IEC 62443-4-2 CRs provide presumption of conformity for Annex I Part I?",
      "What are the mandatory CE marking nameplate requirements under Article 22?",
      "How do we format a compliant CycloneDX 1.6 SBOM under Annex II Section 2?",
      "What is the exact 10-year technical dossier retention rule under Article 13(13)?",
    ],
    defaultContext:
      "You are advising an OEM product manufacturer. Emphasize Article 10 obligations, Annex I cybersecurity requirements, IEC 62443 presumption of conformity, and CE marking rules under Article 22.",
  },
  STEWARD: {
    roleName: "Open-Source Software Steward (Apache / Linux Fdn)",
    quickPrompts: [
      "How does Recital 18 protect our open-source project from commercial manufacturer liability?",
      "What is required in an Article 33 FOSS Security Attestation document?",
      "How do we publish machine-readable OASIS OpenVEX vulnerability notices?",
      "Does accepting donations or corporate sponsorships void our non-commercial exemption?",
    ],
    defaultContext:
      "You are advising an open-source software steward. Emphasize Recital 18 non-commercial exemptions, Article 24 security attestations, and lightweight Coordinated Vulnerability Disclosure (CVD).",
  },
  IMPORTER: {
    roleName: "EU Importer & Industrial Distributor (Arrow / Avnet)",
    quickPrompts: [
      "What pre-market verification is required under Article 17 before customs clearance?",
      "How do we legally structure the 10-year statutory compliance archive under Article 19?",
      "What happens if an overseas vendor refuses to share their technical documentation?",
      "What are our obligations if we discover an unpatched critical CVE in imported stock?",
    ],
    defaultContext:
      "You are advising an EU importer. Emphasize Article 17 due diligence, Article 19 10-year archiving requirements, and Article 18 distributor verification mandates.",
  },
  PLANT_CISO: {
    roleName: "Downstream Plant Owner & Industrial CISO (BASF / Vopak)",
    quickPrompts: [
      "What is the exact 24-hour early warning timeline to CSIRT under Article 14(1)?",
      "How does our CRA conformity status mitigate NIS2 Article 21 supply chain liability?",
      "How are Article 64 maximum fines calculated against our global turnover?",
      "What evidence satisfies the 11-year operational audit retention rule under NIS2?",
    ],
    defaultContext:
      "You are advising a critical infrastructure plant CISO. Emphasize Article 14 24h CSIRT notifications, Article 61 administrative fines (€15M or 2.5% turnover), and NIS2 supply chain synergy.",
  },
  AUDITOR: {
    roleName: "Notified Body Compliance Auditor (TÜV / DEKRA / BSI)",
    quickPrompts: [
      "What are the mandatory inspection checkpoints for Module H (Full Quality Assurance)?",
      "How do we verify cryptographic SHA-256 integrity of third-party SBOMs?",
      "What constitutes an unresolvable non-conformity under Annex VIII?",
      "How do we issue an EU-Type Examination Certificate under Module B+C?",
    ],
    defaultContext:
      "You are advising a Notified Body auditor. Emphasize Articles 41-51, Annex VIII Conformity Assessment Modules (Module A, B+C, H), and technical file verification protocols.",
  },
};

export function PersonaCopilotDrawer({
  isOpen,
  onClose,
  activePersona = "INTEGRATOR",
}: {
  isOpen: boolean;
  onClose: () => void;
  activePersona?: PersonaId;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputQuery, setInputQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const personaConfig = PERSONA_PRESETS[activePersona] || PERSONA_PRESETS.INTEGRATOR;

  // Flatten all articles for quick search
  const allArticles = useMemo(() => {
    const list: any[] = [];
    for (const chap of articlesData.chapters) {
      for (const art of chap.articles) {
        list.push(art);
      }
    }
    return list;
  }, []);

  const handleSend = (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsSearching(true);

    // Simulate RAG Statutory Engine matching
    setTimeout(() => {
      const q = textToSend.toLowerCase();
      const matchedCitations: Message["citations"] = [];

      // Check articles
      for (const art of allArticles) {
        if (
          q.includes(`article ${art.articleNumber}`) ||
          q.includes(`art. ${art.articleNumber}`) ||
          art.title.toLowerCase().includes(q) ||
          (q.includes("substantial") && art.articleNumber === 21) ||
          (q.includes("scada") && art.articleNumber === 21) ||
          (q.includes("csirt") && art.articleNumber === 14) ||
          (q.includes("24-hour") && art.articleNumber === 14) ||
          (q.includes("fine") && art.articleNumber === 61) ||
          (q.includes("ce mark") && art.articleNumber === 22) ||
          (q.includes("importer") && art.articleNumber === 17) ||
          (q.includes("steward") && art.articleNumber === 33) ||
          (q.includes("harmonised") && art.articleNumber === 34)
        ) {
          matchedCitations.push({
            type: "article",
            number: art.articleNumber,
            title: `Article ${art.articleNumber}: ${art.title}`,
            snippet: art.paragraphs[0]?.text?.slice(0, 160) + "..." || art.title,
          });
          if (matchedCitations.length >= 2) break;
        }
      }

      // Check recitals
      if (q.includes("safe harbor") || q.includes("integrator") || q.includes("brownfield") || q.includes("34")) {
        const r34 = recitalsData.recitals.find((r) => r.number === 34);
        if (r34) {
          matchedCitations.push({
            type: "recital",
            number: 34,
            title: "Recital 34: System Integrator Safe Harbor",
            snippet: r34.text.slice(0, 160) + "...",
          });
        }
      } else if (q.includes("open-source") || q.includes("foss") || q.includes("non-commercial") || q.includes("18")) {
        const r18 = recitalsData.recitals.find((r) => r.number === 18);
        if (r18) {
          matchedCitations.push({
            type: "recital",
            number: 18,
            title: "Recital 18: Non-Commercial Open Source Exemption",
            snippet: r18.text.slice(0, 160) + "...",
          });
        }
      }

      // Check annexes
      if (q.includes("annex i") || q.includes("essential") || q.includes("iec 62443")) {
        matchedCitations.push({
          type: "annex",
          number: "I",
          title: "Annex I: Essential Cybersecurity Requirements",
          snippet: "Part I: Security by design & vulnerability handling obligations for industrial hardware & software.",
        });
      }

      // Build structured response
      let responseAdvice = "";
      let riskLevel: Message["riskLevel"] = "LOW";

      if (q.includes("modify") || q.includes("scada") || q.includes("article 21")) {
        riskLevel = "HIGH";
        responseAdvice =
          "Under Regulation (EU) 2024/2847 Article 21, routine configuration or parameter changes within the OEM's documented intended operational envelope do NOT constitute a substantial modification. However, rewriting protocol handlers or disabling encrypted transport shifts full OEM legal manufacturer liabilities onto the modifying integrator. Maintain a signed Safe Harbor Certificate (Recital 34) in your project dossier to preserve protection.";
      } else if (q.includes("safe harbor") || q.includes("brownfield")) {
        riskLevel = "LOW";
        responseAdvice =
          "Recital 34 provides a full statutory safe harbor for industrial system integrators who assemble, install, or maintain brownfield OT components without altering their core cybersecurity architecture. Ensure you issue a pre-installation conformity boundary record.";
      } else if (q.includes("csirt") || q.includes("24-hour") || q.includes("14")) {
        riskLevel = "CRITICAL";
        responseAdvice =
          "Article 14(1) mandates an early warning notification to your designated national CSIRT (e.g. NCSC-NL, CERT-FR, CERT-Bund) within 24 hours of becoming aware of any actively exploited vulnerability or severe incident. A full notification must follow within 72 hours. Failure risks administrative penalties under Article 64.";
      } else if (q.includes("fine") || q.includes("61") || q.includes("penalty")) {
        riskLevel = "CRITICAL";
        responseAdvice =
          "Article 61 establishes maximum penalties of up to €15,000,000 or 2.5% of total worldwide annual turnover for breaches of Annex I essential requirements. Documentation failures incur up to €10,000,000 or 2.0%. Proactive alignment with Harmonised Standards (IEC 62443 / ETSI EN 303 645) acts as an affirmative mitigating factor.";
      } else if (q.includes("steward") || q.includes("open-source") || q.includes("foss") || q.includes("33")) {
        riskLevel = "LOW";
        responseAdvice =
          "Article 24 creates a specialized, lightweight framework for open-source software stewards who sustain non-commercial projects. Under Recital 18, purely non-commercial development is completely exempt from CE marking, requiring only documented vulnerability reporting policies and OpenVEX attestations.";
      } else {
        responseAdvice = `Based on Regulation (EU) 2024/2847 and the ${personaConfig.roleName} operational profile, compliance requires maintaining verifiable technical evidence, mapping security controls against harmonised standards, and preserving an immutable 10-year audit trail.`;
      }

      const copilotMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: "copilot",
        text: responseAdvice,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        citations: matchedCitations.length > 0 ? matchedCitations : undefined,
        riskLevel,
      };

      setMessages((prev) => [...prev, copilotMsg]);
      setIsSearching(false);
    }, 600);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl p-0 flex flex-col bg-background/95 backdrop-blur-xl border-l border-border/80 shadow-2xl z-50"
      >
        {/* Header */}
        <div className="p-5 border-b border-border/80 bg-card/60 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center text-primary shadow-xs">
                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              </div>
              <div>
                <SheetTitle className="font-display font-medium text-base text-foreground flex items-center gap-2">
                  OXOT CRA AI Copilot
                  <Badge variant="outline" className="font-mono text-[10px] bg-primary/10 text-primary border-primary/20">
                    Statutory RAG Active
                  </Badge>
                </SheetTitle>
                <SheetDescription className="font-sans text-xs text-muted-foreground">
                  Contextual advisory tuned for <strong className="text-foreground">{personaConfig.roleName}</strong>
                </SheetDescription>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Question Chips */}
        <div className="px-5 py-3 border-b border-border/60 bg-muted/20">
          <div className="flex items-center gap-1.5 mb-2 font-mono text-[11px] text-muted-foreground">
            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
            <span>Recommended Regulatory Inquiries:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {personaConfig.quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="text-left text-[11px] font-sans px-2.5 py-1 rounded-lg bg-card/80 border border-border/80 hover:border-primary/50 hover:bg-primary/5 text-foreground transition-all truncate max-w-full"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Conversation Stream */}
        <ScrollArea className="flex-1 p-5 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3 opacity-80 my-auto">
              <div className="w-12 h-12 rounded-2xl bg-muted/60 border border-border flex items-center justify-center text-muted-foreground">
                <Bot className="w-6 h-6" />
              </div>
              <div className="font-display font-medium text-base text-foreground">
                Ask anything regarding Regulation (EU) 2024/2847
              </div>
              <p className="font-sans text-xs text-muted-foreground max-w-sm leading-relaxed">
                Query statutory article interpretations, Safe Harbor clearance boundaries, CSIRT early warning mandates, or harmonised standard presumption rules.
              </p>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === "user" ? "items-end" : "items-start"}`}
                >
                  <div className="flex items-center gap-1.5 text-[10px] font-mono text-muted-foreground mb-1">
                    {msg.sender === "user" ? (
                      <>
                        <span>You</span>
                        <User className="w-3 h-3" />
                      </>
                    ) : (
                      <>
                        <Bot className="w-3 h-3 text-primary" />
                        <span className="text-primary font-bold">CRA Regulatory Copilot</span>
                      </>
                    )}
                    <span>• {msg.timestamp}</span>
                  </div>

                  <div
                    className={`p-4 rounded-2xl max-w-[92%] font-sans text-xs leading-relaxed space-y-3 ${
                      msg.sender === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-none shadow-xs"
                        : "bg-card border border-border/80 text-foreground rounded-tl-none shadow-sm"
                    }`}
                  >
                    <div>{msg.text}</div>

                    {/* Risk Level Badge */}
                    {msg.riskLevel && (
                      <div className="flex items-center gap-2 pt-1 border-t border-border/40">
                        <span className="font-mono text-[10px] text-muted-foreground">Regulatory Impact:</span>
                        <Badge
                          variant="outline"
                          className={`font-mono text-[10px] uppercase font-bold ${
                            msg.riskLevel === "CRITICAL"
                              ? "bg-red-500/10 text-red-400 border-red-500/30"
                              : msg.riskLevel === "HIGH"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                              : "bg-green-500/10 text-green-400 border-green-500/30"
                          }`}
                        >
                          {msg.riskLevel}
                        </Badge>
                      </div>
                    )}

                    {/* Statutory Citations */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="space-y-1.5 pt-2 border-t border-border/40">
                        <div className="font-mono text-[10px] text-muted-foreground flex items-center gap-1">
                          <Scale className="w-3 h-3 text-primary" />
                          <span>Statutory Authorities &amp; CRA References:</span>
                        </div>
                        <div className="space-y-1.5">
                          {msg.citations.map((cite, i) => (
                            <div
                              key={i}
                              className="p-2 rounded-lg bg-muted/40 border border-border/60 text-[11px] space-y-1"
                            >
                              <div className="flex items-center justify-between font-mono font-bold text-foreground">
                                <span>{cite.title}</span>
                                <a
                                  href={`/conformity/cra-wiki?tab=${cite.type === "article" ? "articles" : cite.type === "recital" ? "recitals" : "annexes"}&num=${cite.number}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-primary hover:underline flex items-center gap-0.5 text-[10px]"
                                >
                                  View Wiki <ExternalLink className="w-2.5 h-2.5" />
                                </a>
                              </div>
                              <p className="text-muted-foreground text-[10px] leading-tight">
                                {cite.snippet}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions on AI response */}
                    {msg.sender === "copilot" && (
                      <div className="flex items-center justify-end gap-2 pt-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(msg.text, msg.id)}
                          className="h-6 text-[10px] font-mono gap-1 px-2 text-muted-foreground hover:text-foreground"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-green-500" /> Copied
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" /> Copy Advice
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isSearching && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-card border border-border/60 text-xs font-mono text-muted-foreground animate-pulse max-w-xs">
                  <RefreshCw className="w-3.5 h-3.5 text-primary animate-spin" />
                  <span>Searching CRA Statutory Corpus...</span>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Input Bar */}
        <div className="p-4 border-t border-border/80 bg-card/60">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <Input
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder={`Ask a statutory compliance question for ${activePersona}...`}
              className="font-sans text-xs bg-background/80 border-border/80 focus-visible:ring-primary/40"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!inputQuery.trim() || isSearching}
              className="gap-1.5 font-mono text-xs shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
            </Button>
          </form>
          <div className="flex items-center justify-between mt-2 text-[10px] font-mono text-muted-foreground">
            <span>Powered by Regulation (EU) 2024/2847 Statutory Corpus</span>
            <span>Article 1–71 • Recitals 1–128</span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
