import React, { useState } from "react";
import { Link } from "wouter";
import { OxotWordmark } from "@/components/ui/oxot-wordmark";
import { Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export function SiteFooter() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [lang, setLang] = useState<"en" | "nl">("en");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setSubscribed(true);
    toast.success("Thank you for subscribing to OXOT OT Security Insights!");
  };

  return (
    <footer className="mt-20 border-t border-border bg-card/40 font-sans">
      <div className="max-w-6xl mx-auto px-6 py-14 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_auto] gap-10">
          {/* Column 1: Brand */}
          <div className="space-y-4">
            <OxotWordmark variant="footer" showTagline={true} />
            <p className="text-sm leading-relaxed text-muted-foreground max-w-md font-sans">
              OXOT is an operational-technology (OT) cybersecurity consultancy. We help industrial operators, manufacturers and integrators secure their systems — from assessments and architecture to the Cyber Digital Twin and long-term security programmes.
            </p>
            <div className="text-sm">
              <a href="mailto:info@oxot.nl" className="text-foreground/80 hover:text-primary transition-colors font-medium">
                info@oxot.nl
              </a>
            </div>

            {/* Newsletter Block */}
            <div className="pt-4 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground block">
                NEWSLETTER
              </span>
              {subscribed ? (
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20 max-w-sm">
                  <CheckCircle2 className="h-4 w-4" /> Subscribed to OXOT Technical Digest.
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="flex items-center gap-2 max-w-sm">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="flex-1 bg-background border border-input rounded-lg px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  <button
                    type="submit"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs px-4 py-2 rounded-lg shadow-sm transition-all cta-lift"
                  >
                    Subscribe
                  </button>
                </form>
              )}
              <p className="text-[11px] text-muted-foreground max-w-sm">
                Practical OT cybersecurity insight from OXOT — engineering, industrial security and regulations in plain language. Unsubscribe anytime.
              </p>
            </div>
          </div>

          {/* Column 2: Navigation */}
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground block">
              NAVIGATION
            </span>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/product-portfolio" className="text-foreground/70 hover:text-primary transition-colors">
                  Portfolio
                </Link>
              </li>
              <li>
                <Link href="/products" className="text-foreground/70 hover:text-primary transition-colors">
                  Products
                </Link>
              </li>
              <li>
                <Link href="/psirt" className="text-foreground/70 hover:text-primary transition-colors">
                  PSIRT
                </Link>
              </li>
              <li>
                <Link href="/reports" className="text-foreground/70 hover:text-primary transition-colors">
                  Reports
                </Link>
              </li>
              <li>
                <Link href="/team" className="text-foreground/70 hover:text-primary transition-colors">
                  Team
                </Link>
              </li>
              <li>
                <Link href="/regulations" className="text-foreground/70 hover:text-primary transition-colors">
                  Reference
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Connect & Frameworks */}
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground block">
              FRAMEWORKS & STANDARDS
            </span>
            <ul className="space-y-2 text-sm text-foreground/70">
              <li>EU Cyber Resilience Act (CRA)</li>
              <li>IEC 62443-3-2 Operational Risk</li>
              <li>NIS2 Directive Compliance</li>
              <li>EU AI Act (AIA) Safety</li>
              <li>ISO/IEC 27001 ISMS</li>
            </ul>
          </div>

          {/* Column 4: Language Switcher */}
          <div className="space-y-3">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground block">
              LANGUAGE
            </span>
            <div
              role="group"
              aria-label="Language / Taal"
              className="inline-flex gap-0.5 rounded-md border border-border/70 bg-background/60 p-0.5"
            >
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`rounded-[5px] px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.08em] transition-colors ${
                  lang === "en" ? "bg-primary/15 text-primary font-bold" : "text-foreground/55 hover:text-foreground"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLang("nl")}
                className={`rounded-[5px] px-2 py-0.5 text-xs font-semibold uppercase tracking-[0.08em] transition-colors ${
                  lang === "nl" ? "bg-primary/15 text-primary font-bold" : "text-foreground/55 hover:text-foreground"
                }`}
              >
                NL
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bar 1 — Positioning + Legal */}
      <div className="border-t border-border/80 max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground font-sans">
        <p className="max-w-2xl text-center sm:text-left">
          OXOT turns overlapping EU regulations into a single, living evidence system — so your teams ship compliant products without drowning in paperwork.
        </p>
        <div className="flex items-center gap-3">
          <a href="#" className="hover:text-primary transition-colors">Privacy</a>
          <span aria-hidden="true">•</span>
          <a href="#" className="hover:text-primary transition-colors">Terms</a>
          <span aria-hidden="true">•</span>
          <a href="#" className="hover:text-primary transition-colors">Cookie settings</a>
        </div>
      </div>

      {/* Bar 2 — Copyright */}
      <div className="border-t border-border/60 max-w-6xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground font-sans">
        <p>© {new Date().getFullYear()} OXOT. All rights reserved.</p>
        <p className="font-serif">
          O<span className="text-primary font-sans font-semibold">X</span>OT — Operational e<span className="text-primary font-sans font-semibold">X</span>cellence in Operational Technology
        </p>
      </div>
    </footer>
  );
}
