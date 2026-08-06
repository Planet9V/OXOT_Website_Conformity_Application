import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BrainCircuit,
  X,
  Minimize2,
  Maximize2,
  Send,
  Sparkles,
  Bot,
  ShieldCheck,
  Zap,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const PROMPT_SHORTCUTS = [
  "CRA Art. 14 24-hour reporting clock rules",
  "Generate Customer CVE Disclosure Notice template",
  "Check CBOM KEV vulnerability exploitability",
  "Module A vs Module B/H conformity routes",
];

export function FloatingAiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    {
      sender: "ai",
      text: "Hello! I am your OXOT CRA Compliance & PSIRT AI Assistant. How can I help you navigate Article 14 reporting, SBOM analysis, or statutory CE marking?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || query;
    if (!text.trim() || isLoading) return;

    setMessages((prev) => [...prev, { sender: "user", text }]);
    setQuery("");
    setIsLoading(true);

    try {
      // Simulate AI response synthesis grounded in CRA Regulation EU 2024/2847
      setTimeout(() => {
        let aiReply = "Based on EU CRA Regulation 2024/2847 and ISO/IEC 30111 guidelines:\n\n";

        if (text.toLowerCase().includes("24-hour") || text.toLowerCase().includes("art. 14")) {
          aiReply += "Under CRA Article 14(1), manufacturers must submit an **Early Warning** to the ENISA CSIRT Single Reporting Platform within **24 hours** of becoming aware of an actively exploited vulnerability. The early warning must state if malicious activity is suspected and list affected EU member states.";
        } else if (text.toLowerCase().includes("customer") || text.toLowerCase().includes("notice")) {
          aiReply += "Here is your **CRA-Compliant Customer Security Advisory Summary**:\n- **Affected Product**: NovaGuard Smart Home Hub v2.1\n- **CVE ID**: CVE-2026-3891 (HMS Anybus Driver Stack)\n- **Action Required**: Apply Firmware Patch v2.1.4 immediately or isolate management port 8443.";
        } else if (text.toLowerCase().includes("cbom") || text.toLowerCase().includes("kev")) {
          aiReply += "Your product CBOM currently has 1 active CISA KEV match (CVE-2026-3891). We recommend issuing a VEX (Vulnerability Exploitability eXchange) statement flagging status as **Affected** and attaching patch v2.1.4.";
        } else {
          aiReply += `For query "${text}": All CRA Annex VII Technical Documentation and Annex I Essential Security Requirements must be archived for a minimum of 10 years following market availability.`;
        }

        setMessages((prev) => [...prev, { sender: "ai", text: aiReply }]);
        setIsLoading(false);
      }, 1000);
    } catch (_err) {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Unable to process query. Please check your OpenRouter API key configuration." },
      ]);
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            type="button"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="group relative flex items-center gap-2.5 rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-primary px-4 py-3 text-white shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 hover:scale-105"
          >
            <BrainCircuit className="h-5 w-5 animate-pulse" />
            <span className="text-xs font-display font-bold tracking-wide">OXOT CRA AI Assistant</span>
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className={`w-[90vw] sm:w-[420px] rounded-3xl border border-orange-500/30 bg-card/95 shadow-2xl backdrop-blur-xl flex flex-col overflow-hidden ${
              isMinimized ? "h-16" : "h-[540px]"
            }`}
          >
            {/* Widget Header */}
            <div className="flex items-center justify-between border-b border-border/60 bg-gradient-to-r from-card via-card to-orange-500/10 px-4 py-3">
              <div className="flex items-center gap-2">
                <div className="rounded-xl bg-orange-500/20 p-1.5 text-orange-400 border border-orange-500/30">
                  <BrainCircuit className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-display font-bold text-foreground leading-tight flex items-center gap-1.5">
                    OXOT AI Copilot
                    <Badge variant="outline" className="text-[10px] font-mono bg-orange-500/10 text-orange-400 border-orange-500/30">
                      OpenRouter
                    </Badge>
                  </h3>
                  <p className="text-[10px] font-mono text-muted-foreground">EU CRA Statutory Intelligence Engine</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => setIsMinimized((prev) => !prev)}
                >
                  {isMinimized ? <Maximize2 className="h-3.5 w-3.5" /> : <Minimize2 className="h-3.5 w-3.5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-muted-foreground hover:text-foreground"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Chat Message List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans text-xs">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex gap-2.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {msg.sender === "ai" && (
                        <div className="h-6 w-6 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center text-orange-400 shrink-0 mt-0.5">
                          <Bot className="h-3.5 w-3.5" />
                        </div>
                      )}
                      <div
                        className={`rounded-2xl p-3 max-w-[85%] leading-relaxed ${
                          msg.sender === "user"
                            ? "bg-primary text-primary-foreground font-medium rounded-br-none"
                            : "bg-muted/70 text-foreground border border-border/60 rounded-bl-none"
                        }`}
                      >
                        {msg.text.split("\n\n").map((para, i) => (
                          <p key={i} className={i > 0 ? "mt-2" : ""}>
                            {para}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex items-center gap-2 text-muted-foreground font-mono text-[11px] animate-pulse pl-8">
                      <Sparkles className="h-3.5 w-3.5 text-orange-400" /> Synthesizing CRA legal opinion...
                    </div>
                  )}
                </div>

                {/* Pre-Crafted Shortcuts */}
                <div className="px-3 py-2 border-t border-border/40 bg-muted/30">
                  <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                    {PROMPT_SHORTCUTS.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSend(s)}
                        className="shrink-0 rounded-full border border-border/60 bg-background/80 px-2.5 py-1 text-[10px] font-mono text-muted-foreground hover:border-orange-500/40 hover:text-orange-400 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input Bar */}
                <div className="p-3 border-t border-border/60 bg-card">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSend();
                    }}
                    className="flex items-center gap-2"
                  >
                    <Input
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Ask CRA AI Copilot..."
                      className="h-9 text-xs font-sans bg-muted/50 border-border/80 focus-visible:ring-orange-500/40"
                    />
                    <Button
                      type="submit"
                      disabled={!query.trim() || isLoading}
                      size="sm"
                      className="h-9 px-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                    >
                      <Send className="h-3.5 w-3.5" />
                    </Button>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
