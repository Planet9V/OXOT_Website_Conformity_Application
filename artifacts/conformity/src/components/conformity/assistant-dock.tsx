import { useEffect, useRef, useState } from "react";
import { getAskConformityAssistantUrl } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { Bot, Send, X, Square, Sparkles, AlertTriangle } from "lucide-react";

type Role = "user" | "assistant";
type Msg = { role: Role; content: string };

const SUGGESTIONS = [
  "What should I fix first?",
  "Summarise my readiness",
  "Which requirements are blocking me?",
  "What evidence am I still missing?",
];

/**
 * Workspace-aware "Conformity Copilot" docked in the assessment cockpit. Streams
 * a grounded reply from the assessment-scoped assistant endpoint via
 * fetch + ReadableStream (SSE), not the generated hook — the server sees this
 * assessment's live state (scope, gaps, evidence, artifacts, grade, incidents).
 */
export function AssistantDock({
  assessmentId,
  productName,
}: {
  assessmentId: number;
  productName: string;
}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, open]);

  // Abort any in-flight stream when the dock unmounts (e.g. navigating away).
  useEffect(() => () => abortRef.current?.abort(), []);

  function appendToLast(delta: string) {
    setMessages((prev) => {
      const copy = [...prev];
      const last = copy[copy.length - 1];
      if (last && last.role === "assistant") {
        copy[copy.length - 1] = { ...last, content: last.content + delta };
      }
      return copy;
    });
  }

  function finishWithError(msg: string) {
    setError(msg);
    // Drop a trailing empty assistant placeholder so the error stands alone.
    setMessages((prev) => {
      const copy = [...prev];
      const last = copy[copy.length - 1];
      if (last && last.role === "assistant" && last.content === "") copy.pop();
      return copy;
    });
  }

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;
    setError(null);
    const history = messages.map((m) => ({ role: m.role, content: m.content }));
    setMessages((prev) => [
      ...prev,
      { role: "user", content: trimmed },
      { role: "assistant", content: "" },
    ]);
    setInput("");
    setBusy(true);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(getAskConformityAssistantUrl(assessmentId), {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
        body: JSON.stringify({ message: trimmed, history }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        let msg = "The assistant is unavailable right now. Please try again.";
        try {
          const j = (await res.json()) as { error?: string };
          if (j?.error) msg = j.error;
        } catch {
          /* non-JSON error body */
        }
        finishWithError(msg);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let streamedError: string | null = null;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split("\n\n");
        buffer = parts.pop() ?? "";
        for (const part of parts) {
          const line = part.trim();
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (!payload) continue;
          try {
            const evt = JSON.parse(payload) as {
              content?: string;
              error?: string;
              done?: boolean;
            };
            if (typeof evt.content === "string") appendToLast(evt.content);
            else if (evt.error) streamedError = evt.error;
          } catch {
            /* ignore malformed SSE frame */
          }
        }
      }
      if (streamedError) finishWithError(streamedError);
    } catch (e) {
      if (!(e instanceof DOMException && e.name === "AbortError")) {
        finishWithError("Connection lost. Please try again.");
      }
    } finally {
      setBusy(false);
      abortRef.current = null;
    }
  }

  function stop() {
    abortRef.current?.abort();
  }

  function close() {
    if (busy) abortRef.current?.abort();
    setOpen(false);
  }

  if (!open) {
    return (
      <Button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 h-12 rounded-full shadow-lg gap-2 pl-4 pr-5"
        data-testid="assistant-open"
        aria-label="Open the Conformity Copilot"
      >
        <Bot className="w-5 h-5" />
        <span className="font-medium">Copilot</span>
      </Button>
    );
  }

  return (
    <div
      role="dialog"
      aria-label="Conformity Copilot"
      className="fixed inset-x-3 bottom-3 z-50 flex flex-col rounded-xl border border-border bg-card shadow-2xl sm:inset-x-auto sm:right-6 sm:bottom-6 sm:w-[400px] max-h-[min(78vh,640px)] h-[78vh] sm:h-[640px]"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="grid place-items-center w-8 h-8 rounded-md bg-primary/10 text-primary shrink-0">
            <Bot className="w-4 h-4" />
          </span>
          <div className="min-w-0">
            <div className="font-display font-semibold leading-none">Conformity Copilot</div>
            <div className="text-[11px] text-muted-foreground truncate mt-0.5">
              Scoped to {productName}
            </div>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="w-8 h-8" onClick={close} aria-label="Close copilot">
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="space-y-4">
            <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-2 font-medium text-foreground mb-1">
                <Sparkles className="w-4 h-4 text-primary" /> Ask about this assessment
              </div>
              I can see this product&apos;s scope, requirement gaps, evidence, documents, readiness grade
              and open incidents. Ask what to prioritise or where you stand.
            </div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => send(s)}
                  className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap break-words",
                m.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground",
              )}
            >
              {m.content ||
                (busy && i === messages.length - 1 ? (
                  <span className="inline-flex gap-1 items-center text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse [animation-delay:150ms]" />
                    <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse [animation-delay:300ms]" />
                  </span>
                ) : null)}
            </div>
          </div>
        ))}

        {error && (
          <div className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Composer */}
      <div className="border-t border-border p-3">
        <div className="flex items-end gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="Ask the copilot…"
            rows={1}
            aria-label="Message the Conformity Copilot"
            className="min-h-[40px] max-h-32 resize-none rounded-md"
          />
          {busy ? (
            <Button size="icon" variant="outline" className="shrink-0" onClick={stop} aria-label="Stop">
              <Square className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              size="icon"
              className="shrink-0"
              onClick={() => send(input)}
              disabled={!input.trim()}
              aria-label="Send message"
              data-testid="assistant-send"
            >
              <Send className="w-4 h-4" />
            </Button>
          )}
        </div>
        <p className="mt-2 text-[10px] text-muted-foreground">
          Decision-support grounded in your workspace — not legal advice.
        </p>
      </div>
    </div>
  );
}
