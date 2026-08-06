import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import {
  createChatConversation,
  getChatConversation,
  captureLead,
} from '@workspace/api-client-react';
import { useLocale } from '@/providers/locale-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  MessageCircle,
  X,
  Send,
  ArrowLeft,
  Loader2,
  Bot,
  CheckCircle2,
  FileText,
} from 'lucide-react';

type ChatSource = { title: string; slug: string };
type ChatMessage = {
  role: 'user' | 'assistant';
  content: string;
  sources?: ChatSource[];
};
type StoredConversation = { id: number; locale: 'en' | 'nl' };

const SESSION_KEY = 'oxot-chat-session';
const CONV_KEY = 'oxot-chat-conversation';

const STRINGS = {
  en: {
    title: 'OXOT Assistant',
    subtitle: 'CRA · AI Act · OT compliance',
    greeting:
      "Hi! I'm the OXOT assistant. Ask me anything about EU compliance for operational technology — the Cyber Resilience Act, the AI Act, the Machinery Regulation, or IEC 62443.",
    placeholder: 'Type your message…',
    contactCta: 'Talk to our team',
    contactTitle: 'Leave your details',
    contactSubtitle: 'Share your details and the OXOT team will follow up.',
    name: 'Name',
    email: 'Email',
    company: 'Company',
    optional: 'optional',
    message: 'Message',
    submit: 'Send request',
    submitting: 'Sending…',
    thanks: 'Thanks! Our team will be in touch soon.',
    nameEmailRequired: 'Please enter your name and email.',
    open: 'Open chat',
    close: 'Close chat',
    back: 'Back',
    unavailable: 'The assistant is temporarily unavailable. Please try again.',
    sourcesLabel: 'Related pages',
  },
  nl: {
    title: 'OXOT Assistent',
    subtitle: 'CRA · AI Act · OT-compliance',
    greeting:
      'Hallo! Ik ben de OXOT-assistent. Stel gerust vragen over EU-compliance voor operationele technologie — de Cyber Resilience Act, de AI Act, de Machineverordening of IEC 62443.',
    placeholder: 'Typ uw bericht…',
    contactCta: 'Neem contact op',
    contactTitle: 'Laat uw gegevens achter',
    contactSubtitle: 'Deel uw gegevens en het OXOT-team neemt contact op.',
    name: 'Naam',
    email: 'E-mail',
    company: 'Bedrijf',
    optional: 'optioneel',
    message: 'Bericht',
    submit: 'Verzoek versturen',
    submitting: 'Versturen…',
    thanks: 'Bedankt! Ons team neemt binnenkort contact op.',
    nameEmailRequired: 'Vul uw naam en e-mail in.',
    open: 'Chat openen',
    close: 'Chat sluiten',
    back: 'Terug',
    unavailable: 'De assistent is tijdelijk niet beschikbaar. Probeer het opnieuw.',
    sourcesLabel: "Gerelateerde pagina's",
  },
} as const;

function readStoredConversation(): StoredConversation | null {
  try {
    const raw = localStorage.getItem(CONV_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredConversation;
    if (typeof parsed?.id === 'number' && (parsed.locale === 'en' || parsed.locale === 'nl')) {
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function ChatWidget() {
  const { locale } = useLocale();
  const t = STRINGS[locale];

  const [open, setOpen] = useState(false);
  const [view, setView] = useState<'chat' | 'contact'>('chat');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);

  // Contact form
  const [lead, setLead] = useState({ name: '', email: '', company: '', message: '' });
  const [leadError, setLeadError] = useState('');
  const [leadSubmitting, setLeadSubmitting] = useState(false);
  const [leadDone, setLeadDone] = useState(false);

  const sessionIdRef = useRef<string>('');
  const convRef = useRef<StoredConversation | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Init session id + stored conversation once.
  useEffect(() => {
    let session = localStorage.getItem(SESSION_KEY);
    if (!session) {
      session =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `s_${Date.now()}_${Math.random().toString(36).slice(2)}`;
      localStorage.setItem(SESSION_KEY, session);
    }
    sessionIdRef.current = session;
    convRef.current = readStoredConversation();
  }, []);

  // Reset the visible thread when the visitor switches language.
  useEffect(() => {
    setMessages([]);
    setView('chat');
  }, [locale]);

  // Restore history when the panel opens for the current locale.
  useEffect(() => {
    if (!open) return;
    const stored = convRef.current;
    if (stored && stored.locale === locale && messages.length === 0) {
      getChatConversation(stored.id, {
        headers: { 'X-Session-Id': sessionIdRef.current },
      })
        .then((detail) => {
          setMessages(
            detail.messages.map((m) => ({
              role: m.role === 'assistant' ? 'assistant' : 'user',
              content: m.content,
            })),
          );
        })
        .catch(() => {
          /* start fresh */
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, locale]);

  // Keep the transcript scrolled to the latest message.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, view, open]);

  // Move focus into the panel when it opens; restore to launcher when it closes.
  useEffect(() => {
    if (!open) {
      launcherRef.current?.focus();
      return;
    }
    // Small delay lets the panel finish rendering before focusing.
    const id = setTimeout(() => {
      textareaRef.current?.focus();
    }, 50);
    return () => clearTimeout(id);
  }, [open]);

  // Focus trap: keep Tab / Shift+Tab inside the panel, Escape closes it.
  const handlePanelKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      setOpen(false);
      return;
    }
    if (e.key !== 'Tab') return;
    const panel = panelRef.current;
    if (!panel) return;
    const focusable = Array.from(
      panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((el) => !el.closest('[inert]'));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }, []);

  async function ensureConversation(): Promise<number | null> {
    const current = convRef.current;
    if (current && current.locale === locale) return current.id;
    try {
      const conv = await createChatConversation(locale, { sessionId: sessionIdRef.current });
      const stored: StoredConversation = { id: conv.id, locale };
      convRef.current = stored;
      localStorage.setItem(CONV_KEY, JSON.stringify(stored));
      return conv.id;
    } catch {
      return null;
    }
  }

  async function handleSend() {
    const text = input.trim();
    if (!text || streaming) return;
    setInput('');

    const cid = await ensureConversation();
    if (cid === null) {
      setMessages((prev) => [...prev, { role: 'user', content: text }, { role: 'assistant', content: t.unavailable }]);
      return;
    }

    setMessages((prev) => [...prev, { role: 'user', content: text }, { role: 'assistant', content: '' }]);
    setStreaming(true);

    try {
      const res = await fetch(`/api/chat/conversations/${cid}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Id': sessionIdRef.current,
        },
        body: JSON.stringify({ content: text }),
      });
      if (!res.ok || !res.body) throw new Error('request failed');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let sawError = false;

      // Parse one SSE event block: collect all `data:` lines (SSE frames may
      // span multiple lines) and JSON-parse the joined payload.
      const processBlock = (block: string) => {
        const payload = block
          .split(/\r?\n/)
          .filter((line) => line.startsWith('data:'))
          .map((line) => line.slice(5).trim())
          .join('');
        if (!payload) return;
        let evt: {
          content?: string;
          error?: string;
          done?: boolean;
          sources?: ChatSource[];
        };
        try {
          evt = JSON.parse(payload);
        } catch {
          return;
        }
        if (evt.content) {
          setMessages((prev) => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last && last.role === 'assistant') {
              next[next.length - 1] = { ...last, content: last.content + evt.content };
            }
            return next;
          });
        } else if (evt.error) {
          sawError = true;
          setMessages((prev) => {
            const next = [...prev];
            next[next.length - 1] = { role: 'assistant', content: t.unavailable };
            return next;
          });
        } else if (evt.done && evt.sources && evt.sources.length > 0) {
          // Attach the source pages to the completed assistant turn as chips.
          const srcs = evt.sources;
          setMessages((prev) => {
            const next = [...prev];
            const last = next[next.length - 1];
            if (last && last.role === 'assistant' && last.content.trim() !== '') {
              next[next.length - 1] = { ...last, sources: srcs };
            }
            return next;
          });
        }
      };

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const blocks = buffer.split(/\r?\n\r?\n/);
        buffer = blocks.pop() ?? '';
        for (const block of blocks) processBlock(block);
      }
      // Flush any remaining multibyte bytes and process the trailing block.
      buffer += decoder.decode();
      if (buffer.trim()) processBlock(buffer);

      if (!sawError) {
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last && last.role === 'assistant' && last.content.trim() === '') {
            next[next.length - 1] = { role: 'assistant', content: t.unavailable };
          }
          return next;
        });
      }
    } catch {
      setMessages((prev) => {
        const next = [...prev];
        const last = next[next.length - 1];
        if (last && last.role === 'assistant' && last.content.trim() === '') {
          next[next.length - 1] = { role: 'assistant', content: t.unavailable };
        }
        return next;
      });
    } finally {
      setStreaming(false);
    }
  }

  async function handleLeadSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLeadError('');
    if (!lead.name.trim() || !lead.email.trim()) {
      setLeadError(t.nameEmailRequired);
      return;
    }
    setLeadSubmitting(true);
    try {
      const cid = await ensureConversation();
      if (cid === null) {
        setLeadError(t.unavailable);
        return;
      }
      await captureLead(
        cid,
        {
          name: lead.name.trim(),
          email: lead.email.trim(),
          company: lead.company.trim() || undefined,
          message: lead.message.trim() || undefined,
        },
        { headers: { 'X-Session-Id': sessionIdRef.current } },
      );
      setLeadDone(true);
    } catch {
      setLeadError(t.unavailable);
    } finally {
      setLeadSubmitting(false);
    }
  }

  return (
    <>
      {/* Launcher */}
      {!open && (
        <button
          ref={launcherRef}
          type="button"
          aria-label={t.open}
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-105 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {/* Panel */}
      {open && (
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={t.title}
          onKeyDown={handlePanelKeyDown}
          className="fixed inset-x-3 bottom-3 z-50 flex flex-col overflow-hidden rounded-2xl border bg-card shadow-2xl sm:inset-x-auto sm:right-5 sm:bottom-5 sm:h-[560px] sm:w-[380px] max-h-[calc(100dvh-1.5rem)]"
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b bg-primary px-4 py-3 text-primary-foreground">
            {view === 'contact' && (
              <button
                type="button"
                aria-label={t.back}
                onClick={() => setView('chat')}
                className="-ml-1 rounded-md p-1 hover:bg-white/10"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            )}
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15">
              <Bot className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-sm font-semibold leading-tight">{t.title}</p>
              <p className="truncate text-xs text-primary-foreground/80">{t.subtitle}</p>
            </div>
            <button
              type="button"
              aria-label={t.close}
              onClick={() => setOpen(false)}
              className="rounded-md p-1 hover:bg-white/10"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {view === 'chat' ? (
            <>
              {/* Messages — role="log" implicitly has aria-live="polite" aria-relevant="additions" */}
              <div
                ref={scrollRef}
                role="log"
                aria-label="Chat transcript"
                aria-live="polite"
                aria-atomic="false"
                className="flex-1 space-y-3 overflow-y-auto bg-muted/20 px-4 py-4"
              >
                <div className="flex justify-start">
                  <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-card px-3 py-2 text-sm shadow-sm ring-1 ring-border">
                    {t.greeting}
                  </div>
                </div>
                {messages.map((m, i) => (
                  <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex flex-col items-start'}>
                    <div
                      className={
                        m.role === 'user'
                          ? 'max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tr-sm bg-primary px-3 py-2 text-sm text-primary-foreground'
                          : 'max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-tl-sm bg-card px-3 py-2 text-sm shadow-sm ring-1 ring-border'
                      }
                    >
                      {m.content || (streaming && i === messages.length - 1 ? (
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      ) : (
                        ''
                      ))}
                    </div>
                    {m.role === 'assistant' && m.sources && m.sources.length > 0 && (
                      <div className="mt-2 max-w-[85%]">
                        <p className="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                          {t.sourcesLabel}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {m.sources.map((s) => (
                            <Link
                              key={s.slug}
                              href={`/${s.slug}`}
                              onClick={() => setOpen(false)}
                              className="inline-flex max-w-full items-center gap-1 rounded-full border border-primary/30 bg-primary/5 px-2.5 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                              <FileText className="h-3 w-3 shrink-0" aria-hidden="true" />
                              <span className="truncate">{s.title}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Composer */}
              <div className="border-t bg-card px-3 py-2">
                <button
                  type="button"
                  onClick={() => {
                    setLeadDone(false);
                    setLeadError('');
                    setView('contact');
                  }}
                  className="mb-2 text-xs font-medium text-primary hover:underline"
                >
                  {t.contactCta}
                </button>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-end gap-2"
                >
                  <Textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                    placeholder={t.placeholder}
                    aria-label={t.placeholder}
                    rows={1}
                    className="max-h-28 min-h-[40px] resize-none"
                  />
                  <Button
                    type="submit"
                    size="icon"
                    disabled={streaming || !input.trim()}
                    aria-label={locale === 'nl' ? 'Versturen' : 'Send message'}
                    className="shrink-0"
                  >
                    {streaming ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Send className="h-4 w-4" aria-hidden="true" />}
                  </Button>
                </form>
              </div>
            </>
          ) : (
            /* Contact form */
            <div className="flex-1 overflow-y-auto bg-muted/20 px-4 py-4">
              {leadDone ? (
                <div role="status" aria-live="polite" className="flex h-full flex-col items-center justify-center text-center">
                  <CheckCircle2 className="mb-3 h-12 w-12 text-primary" aria-hidden="true" />
                  <p className="font-medium">{t.thanks}</p>
                  <Button variant="outline" className="mt-4" onClick={() => setView('chat')}>
                    {t.back}
                  </Button>
                </div>
              ) : (
                <>
                  <h3 className="font-display text-base font-semibold">{t.contactTitle}</h3>
                  <p className="mb-4 mt-1 text-sm text-muted-foreground">{t.contactSubtitle}</p>
                  <form onSubmit={handleLeadSubmit} className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="lead-name">{t.name}</Label>
                      <Input
                        id="lead-name"
                        value={lead.name}
                        onChange={(e) => setLead((p) => ({ ...p, name: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="lead-email">{t.email}</Label>
                      <Input
                        id="lead-email"
                        type="email"
                        value={lead.email}
                        onChange={(e) => setLead((p) => ({ ...p, email: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="lead-company">
                        {t.company} <span className="text-muted-foreground">({t.optional})</span>
                      </Label>
                      <Input
                        id="lead-company"
                        value={lead.company}
                        onChange={(e) => setLead((p) => ({ ...p, company: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="lead-message">
                        {t.message} <span className="text-muted-foreground">({t.optional})</span>
                      </Label>
                      <Textarea
                        id="lead-message"
                        rows={3}
                        value={lead.message}
                        onChange={(e) => setLead((p) => ({ ...p, message: e.target.value }))}
                      />
                    </div>
                    {leadError && (
                      <p role="alert" className="text-sm text-destructive">
                        {leadError}
                      </p>
                    )}
                    <Button type="submit" className="w-full" disabled={leadSubmitting}>
                      {leadSubmitting ? t.submitting : t.submit}
                    </Button>
                  </form>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </>
  );
}
