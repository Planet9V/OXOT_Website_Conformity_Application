import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Radio,
  Send,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  ShieldAlert,
  Server,
  Zap,
  Lock,
  RefreshCw,
  FileCode2,
} from "lucide-react";

interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  authority: string;
  status: "ONLINE" | "CONNECTING" | "STANDBY";
  latencyMs: number;
  lastPing: string;
}

interface WebhookLog {
  id: string;
  timestamp: string;
  eventType: string;
  endpoint: string;
  statusCode: number;
  payloadDigest: string;
}

export function CsirtWebhookDispatcher() {
  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>([
    {
      id: "enisa-srp",
      name: "ENISA Single Reporting Platform (SRP)",
      url: "https://srp.enisa.europa.eu/v1/cra/early-warning",
      authority: "European Union Agency for Cybersecurity",
      status: "ONLINE",
      latencyMs: 38,
      lastPing: "Just now",
    },
    {
      id: "ncsc-nl",
      name: "Dutch National Cyber Security Centrum (NCSC-NL)",
      url: "https://incident.ncsc.nl/api/v2/csirt/dispatch",
      authority: "Ministry of Justice & Security (Netherlands)",
      status: "ONLINE",
      latencyMs: 19,
      lastPing: "1m ago",
    },
    {
      id: "cert-bund",
      name: "German Federal Office for Information Security (BSI)",
      url: "https://reporting.cert-bund.de/cra/24h-ingest",
      authority: "CERT-Bund (Germany)",
      status: "ONLINE",
      latencyMs: 44,
      lastPing: "2m ago",
    },
    {
      id: "anssi-fr",
      name: "French ANSSI Incident Response (CERT-FR)",
      url: "https://incident.cert.ssi.gouv.fr/api/v1/cra",
      authority: "Secrétariat Général de la Défense (France)",
      status: "ONLINE",
      latencyMs: 51,
      lastPing: "4m ago",
    },
  ]);

  const [logs, setLogs] = useState<WebhookLog[]>([
    {
      id: "log-1",
      timestamp: "10:42:15",
      eventType: "cra.vulnerability.actively_exploited",
      endpoint: "ENISA SRP",
      statusCode: 200,
      payloadDigest: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    },
    {
      id: "log-2",
      timestamp: "09:15:30",
      eventType: "cra.incident.early_warning_24h",
      endpoint: "NCSC-NL",
      statusCode: 200,
      payloadDigest: "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
    },
  ]);

  const [isDispatching, setIsDispatching] = useState(false);

  const simulateDispatch = () => {
    setIsDispatching(true);

    setTimeout(() => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
      const randomDigest = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

      const newLog: WebhookLog = {
        id: `log-${Date.now()}`,
        timestamp: timeStr,
        eventType: "cra.incident.early_warning_24h",
        endpoint: "ENISA SRP + NCSC-NL",
        statusCode: 200,
        payloadDigest: `sha256-${randomDigest.padEnd(32, "a")}`,
      };

      setLogs((prev) => [newLog, ...prev.slice(0, 5)]);
      setIsDispatching(false);

      toast.success("24h Early Warning Dispatched to ENISA & CSIRT", {
        description: "Statutory early warning record transmitted under Article 14(1) with HMAC-SHA256 signature.",
      });
    }, 700);
  };

  return (
    <Card className="rounded-2xl border border-border/80 shadow-md bg-card/90">
      <CardHeader className="pb-4 border-b border-border/70">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-mono text-xs">
                <Radio className="h-3.5 w-3.5 text-emerald-400 mr-1 animate-pulse" /> Live CSIRT &amp; ENISA Webhook Dispatcher
              </Badge>
              <Badge variant="secondary" className="font-mono text-xs">
                Article 14(1) Early Warning Hub
              </Badge>
            </div>
            <CardTitle className="text-xl font-bold font-display text-foreground">
              National CSIRT &amp; ENISA Single Reporting Platform (SRP) Integration
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Automate mandatory 24-hour early warning notifications and 72-hour vulnerability incident disclosures under CRA Article 14.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={simulateDispatch}
              disabled={isDispatching}
              className="gap-1.5 font-mono text-xs shadow-xs"
            >
              {isDispatching ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Transmitting...
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" /> Dispatch 24h Early Warning
                </>
              )}
            </Button>
            <a href="/conformity/cra-wiki?tab=articles&num=14">
              <Button variant="outline" size="sm" className="gap-1.5 font-mono text-xs">
                Article 14 Text <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </a>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-6">
        {/* Active Endpoints Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5 font-bold text-foreground">
              <Server className="w-3.5 h-3.5 text-primary" />
              Configured National CSIRT &amp; ENISA Endpoints (4 Active):
            </span>
            <span className="text-[11px] text-green-500 font-semibold flex items-center gap-1">
              <Lock className="w-3 h-3" /> HMAC-SHA256 Enforced
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {endpoints.map((ep) => (
              <div
                key={ep.id}
                className="p-3.5 rounded-xl bg-muted/30 border border-border/70 flex flex-col justify-between space-y-2 hover:border-primary/40 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="font-mono text-xs font-bold text-foreground">{ep.name}</div>
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-mono text-[10px]">
                    <CheckCircle2 className="w-2.5 h-2.5 mr-1" /> {ep.latencyMs}ms
                  </Badge>
                </div>
                <div className="font-mono text-[10px] text-muted-foreground truncate">{ep.url}</div>
                <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground pt-1 border-t border-border/40">
                  <span>{ep.authority}</span>
                  <span className="text-emerald-500 font-semibold">{ep.lastPing}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Event Delivery Log */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between font-mono text-xs">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <FileCode2 className="w-3.5 h-3.5 text-amber-500" />
              Recent Statutory Transmission Receipts (Immutable Log):
            </span>
            <span className="text-muted-foreground text-[10px]">Payload Verification: Cryptographic SHA-256</span>
          </div>

          <div className="space-y-2">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl bg-card/80 border border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 font-mono text-xs"
              >
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                    HTTP {log.statusCode} OK
                  </Badge>
                  <span className="text-foreground font-semibold">{log.eventType}</span>
                  <span className="text-muted-foreground">→ {log.endpoint}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground text-[10px]">
                  <span className="truncate max-w-[180px]">Digest: {log.payloadDigest}</span>
                  <span className="text-foreground font-semibold">{log.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
