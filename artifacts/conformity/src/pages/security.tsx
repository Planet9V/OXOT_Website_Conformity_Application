/**
 * Public security page (no auth): the manufacturer's coordinated-vulnerability
 * -disclosure surface required by Annex I Part II CRA —
 *  - published per-product security contacts and CVD policies,
 *  - a vulnerability-report intake form (rate-limited + honeypot server-side),
 *  - published security advisories.
 */
import { useState } from "react";
import { Link } from "wouter";
import { toast } from "sonner";
import {
  useSubmitConformityVulnReport,
  useListPublicSecurityAdvisories,
  useGetPublicSecurityPolicy,
} from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { cn } from "@/lib/utils";
import { ShieldCheck, Megaphone, Mail, Link2 } from "lucide-react";
import { OxotWordmark } from "@/components/ui/oxot-wordmark";

function severityBadgeClass(sev: string): string {
  switch (sev) {
    case "critical":
      return "bg-red-500/15 text-red-600 dark:text-red-400";
    case "high":
      return "bg-orange-500/15 text-orange-600 dark:text-orange-400";
    case "medium":
      return "bg-amber-500/15 text-amber-600 dark:text-amber-400";
    default:
      return "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400";
  }
}

export default function SecurityPage() {
  const advisories = useListPublicSecurityAdvisories();
  const policies = useGetPublicSecurityPolicy();
  const [form, setForm] = useState({
    productName: "",
    title: "",
    description: "",
    affectedVersions: "",
    claimedSeverity: "",
    reporterName: "",
    reporterEmail: "",
    website: "", // honeypot — stays empty for humans
  });
  const [submitted, setSubmitted] = useState(false);

  const submit = useSubmitConformityVulnReport({
    mutation: {
      onSuccess: () => {
        setSubmitted(true);
        toast.success("Report received. Thank you for the responsible disclosure.");
      },
      onError: () => toast.error("Submission failed. Please try again later."),
    },
  });

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));
  const canSubmit =
    form.productName.trim() !== "" && form.title.trim() !== "" && form.description.trim() !== "";

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/welcome" className="shrink-0 flex items-center">
            <OxotWordmark variant="header" />
          </Link>
          <Link href="/welcome" className="text-sm text-muted-foreground hover:text-foreground">
            Workbench
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-12">
        <section className="border-b border-border pb-6">
          <span className="oxot-kicker block mb-1">CRA ANNEX I PART II · COORDINATED VULNERABILITY DISCLOSURE</span>
          <h1 className="text-3xl sm:text-4xl font-serif font-normal tracking-tight text-foreground flex items-center gap-2">
            <ShieldCheck className="h-7 w-7 text-primary" /> Coordinated Vulnerability Disclosure
          </h1>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl font-sans">
            We welcome reports from security researchers. Use the contacts below or the intake
            form; we acknowledge reports, keep you informed and credit you in the advisory unless
            you prefer otherwise.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Security contacts &amp; policies</h2>
          {(policies.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No published contact points yet.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {(policies.data ?? []).map((p) => (
                <Card key={p.productName} data-testid={`security-policy-${p.productName}`}>
                  <CardContent className="p-4 space-y-2">
                    <p className="font-medium">{p.productName}</p>
                    {p.contactEmail && (
                      <p className="text-sm flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                        <a className="underline underline-offset-2" href={`mailto:${p.contactEmail}`}>
                          {p.contactEmail}
                        </a>
                      </p>
                    )}
                    {p.contactUrl && (
                      <p className="text-sm flex items-center gap-1.5">
                        <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
                        <a
                          className="underline underline-offset-2"
                          href={p.contactUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {p.contactUrl}
                        </a>
                      </p>
                    )}
                    {p.policyText && (
                      <p className="text-xs text-muted-foreground whitespace-pre-wrap">
                        {p.policyText}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Report a vulnerability</h2>
          {submitted ? (
            <Card>
              <CardContent className="p-6 text-center space-y-2" data-testid="security-submitted">
                <ShieldCheck className="h-8 w-8 text-primary mx-auto" />
                <p className="font-medium">Thank you — your report has been received.</p>
                <p className="text-sm text-muted-foreground">
                  Our PSIRT will triage it and follow up if you left contact details.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="sec-product">Product *</Label>
                  <Input
                    id="sec-product"
                    value={form.productName}
                    onChange={(e) => set("productName")(e.target.value)}
                    placeholder="Product name and version"
                    data-testid="security-form-product"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Severity (your estimate)</Label>
                  <Select
                    value={form.claimedSeverity || "unspecified"}
                    onValueChange={(v) => set("claimedSeverity")(v === "unspecified" ? "" : v)}
                  >
                    <SelectTrigger data-testid="security-form-severity">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unspecified">Not sure</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="sec-title">Summary *</Label>
                  <Input
                    id="sec-title"
                    value={form.title}
                    onChange={(e) => set("title")(e.target.value)}
                    placeholder="One-line description of the issue"
                    data-testid="security-form-title"
                  />
                </div>
                <div className="space-y-1.5 sm:col-span-2">
                  <Label htmlFor="sec-desc">Details *</Label>
                  <Textarea
                    id="sec-desc"
                    rows={6}
                    value={form.description}
                    onChange={(e) => set("description")(e.target.value)}
                    placeholder="Steps to reproduce, impact, proof of concept…"
                    data-testid="security-form-description"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sec-versions">Affected versions</Label>
                  <Input
                    id="sec-versions"
                    value={form.affectedVersions}
                    onChange={(e) => set("affectedVersions")(e.target.value)}
                  />
                </div>
                {/* Honeypot: hidden from real users, bots fill it. */}
                <div className="hidden" aria-hidden="true">
                  <Label htmlFor="sec-website">Website</Label>
                  <Input
                    id="sec-website"
                    tabIndex={-1}
                    autoComplete="off"
                    value={form.website}
                    onChange={(e) => set("website")(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sec-name">Your name (optional)</Label>
                  <Input
                    id="sec-name"
                    value={form.reporterName}
                    onChange={(e) => set("reporterName")(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="sec-email">Your email (optional, for follow-up)</Label>
                  <Input
                    id="sec-email"
                    type="email"
                    value={form.reporterEmail}
                    onChange={(e) => set("reporterEmail")(e.target.value)}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Button
                    onClick={() =>
                      submit.mutate({
                        data: {
                          productName: form.productName,
                          title: form.title,
                          description: form.description,
                          affectedVersions: form.affectedVersions,
                          claimedSeverity: form.claimedSeverity as never,
                          reporterName: form.reporterName,
                          reporterEmail: form.reporterEmail,
                          website: form.website,
                        },
                      })
                    }
                    disabled={!canSubmit || submit.isPending}
                    data-testid="security-form-submit"
                  >
                    Submit report
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" /> Security advisories
          </h2>
          {(advisories.data ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground" data-testid="security-advisories-empty">
              No published advisories.
            </p>
          ) : (
            (advisories.data ?? []).map((a) => (
              <Card key={a.id} data-testid={`security-advisory-${a.id}`}>
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs text-muted-foreground">{a.advisoryCode}</span>
                    <span className="font-medium">{a.title}</span>
                    <Badge className={cn("border-transparent", severityBadgeClass(a.severity))}>
                      {a.severity}
                    </Badge>
                    {a.vulnerabilityId && (
                      <span className="font-mono text-xs text-muted-foreground">
                        {a.vulnerabilityId}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {a.productName}
                    {a.publishedAt && (
                      <> · published {new Date(a.publishedAt).toLocaleDateString()}</>
                    )}
                  </p>
                  {a.summary && <p className="text-sm whitespace-pre-wrap">{a.summary}</p>}
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    {a.affectedVersions && <p>Affected: {a.affectedVersions}</p>}
                    {a.fixedVersions && <p>Fixed in: {a.fixedVersions}</p>}
                    {a.workarounds && <p>Workarounds: {a.workarounds}</p>}
                    {a.credits && <p>Credits: {a.credits}</p>}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </section>
      </main>
    </div>
  );
}
