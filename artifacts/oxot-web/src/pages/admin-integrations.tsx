import { useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetIntegrationSettings,
  getGetIntegrationSettingsQueryKey,
  useSaveEmailSettings,
  useSaveLinkedinSettings,
  useSaveXSettings,
  useSendTestEmail,
  useTestLinkedinConnection,
  useTestXConnection,
  useSaveConformityAlertsSettings,
  useRunConformityAlertsCheck,
  useGetIntegrationsHealth,
  getGetIntegrationsHealthQueryKey,
  useGetIntegrationActivity,
  getGetIntegrationActivityQueryKey,
  GetIntegrationActivityIntegration,
  type IntegrationHealthEntry,
  type ConnectionTestResult,
  type ConformityAlertsRunResult,
} from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Field } from "@/components/admin/field";
import { useAdminGuard } from "@/hooks/use-admin-guard";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Mail,
  Linkedin,
  Twitter,
  Save,
  Send,
  Plug,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Bell,
} from "lucide-react";

type EmailForm = {
  enabled: boolean;
  fromName: string;
  fromEmail: string;
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean;
  smtpUser: string;
  smtpPassword: string;
  alertEmail: string;
};
type LinkedinForm = {
  enabled: boolean;
  autoPublish: boolean;
  profileUrl: string;
  authorUrn: string;
  accessToken: string;
  clientId: string;
  clientSecret: string;
};
type XForm = {
  enabled: boolean;
  autoPublish: boolean;
  username: string;
  apiKey: string;
  apiSecret: string;
  accessToken: string;
  accessSecret: string;
};
type ConformityAlertsForm = {
  enabled: boolean;
  recipient: string;
  leadTimeHours: number;
  digestEnabled: boolean;
  reminderIntervalHours: number;
  maxReminders: number;
};

const SECRET_PLACEHOLDER = "•••••••• (stored — leave blank to keep)";

// --- time helpers ----------------------------------------------------------

/** Human-relative timestamp, e.g. "2h ago" / "in 5d". Accepts epoch ms or ISO. */
function relativeTime(value: number | string | null | undefined): string | null {
  if (value == null) return null;
  const ts = typeof value === "number" ? value : Date.parse(value);
  if (Number.isNaN(ts)) return null;
  const diffMs = ts - Date.now();
  const future = diffMs > 0;
  const abs = Math.abs(diffMs);
  const sec = Math.round(abs / 1000);
  const min = Math.round(sec / 60);
  const hr = Math.round(min / 60);
  const day = Math.round(hr / 24);
  let unit: string;
  if (sec < 60) unit = `${sec}s`;
  else if (min < 60) unit = `${min}m`;
  else if (hr < 24) unit = `${hr}h`;
  else unit = `${day}d`;
  return future ? `in ${unit}` : `${unit} ago`;
}

/** Days until an epoch-ms timestamp (may be negative if past). */
function daysUntil(ts: number): number {
  return Math.floor((ts - Date.now()) / (1000 * 60 * 60 * 24));
}

// --- health status ---------------------------------------------------------

type HealthState = "disabled" | "unconfigured" | "connected" | "error" | "unknown";

function computeHealthState(h: IntegrationHealthEntry | undefined): HealthState {
  if (!h) return "unknown";
  if (!h.enabled) return "disabled";
  if (!h.configured) return "unconfigured";
  if (h.connected === true) return "connected";
  if (h.connected === false && h.lastError) return "error";
  return "unknown";
}

const HEALTH_META: Record<HealthState, { label: string; className: string }> = {
  disabled: { label: "Disabled", className: "bg-muted text-muted-foreground border-transparent" },
  unconfigured: {
    label: "Not configured",
    className: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/15 dark:text-amber-300 dark:border-amber-500/30",
  },
  connected: {
    label: "Connected",
    className: "bg-green-100 text-green-800 border-green-200 dark:bg-green-500/15 dark:text-green-300 dark:border-green-500/30",
  },
  error: {
    label: "Error",
    className: "bg-destructive/10 text-destructive border-destructive/30",
  },
  unknown: { label: "Unknown", className: "bg-muted text-muted-foreground border-transparent" },
};

function HealthBadge({ state }: { state: HealthState }) {
  const meta = HEALTH_META[state];
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${meta.className}`}
    >
      {meta.label}
    </span>
  );
}

function HealthSummary({ health }: { health: IntegrationHealthEntry | undefined }) {
  if (!health) return null;
  const success = relativeTime(health.lastSuccessAt);
  const failure = relativeTime(health.lastFailureAt);
  const tokenDays = health.tokenExpiresAt != null ? daysUntil(health.tokenExpiresAt) : null;
  const tokenExpired = tokenDays != null && tokenDays < 0;
  const tokenSoon = tokenDays != null && tokenDays >= 0 && tokenDays <= 7;

  return (
    <div className="space-y-1.5 text-xs">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
          {health.recentSuccessCount} ok
          <span className="text-muted-foreground/60">(30d)</span>
        </span>
        <span className="inline-flex items-center gap-1">
          <XCircle className="h-3.5 w-3.5 text-destructive" />
          {health.recentFailureCount} failed
        </span>
        {success && <span>Last ok {success}</span>}
        {failure && <span>Last fail {failure}</span>}
      </div>
      {health.tokenExpiresAt != null && (
        <div
          className={
            tokenExpired || tokenSoon
              ? "font-medium text-destructive"
              : "text-muted-foreground"
          }
        >
          {tokenExpired
            ? "Token expired — reconnect required"
            : `Token expires ${relativeTime(health.tokenExpiresAt)}`}
        </div>
      )}
      {health.lastError && (
        <p className="rounded bg-destructive/5 px-2 py-1 text-destructive break-words">
          {health.lastError}
        </p>
      )}
    </div>
  );
}

// --- test result inline banner ---------------------------------------------

function TestResultBanner({ result }: { result: ConnectionTestResult | null }) {
  if (!result) return null;
  return (
    <div
      className={`mt-3 flex items-start gap-2 rounded-md border p-2.5 text-xs ${
        result.ok
          ? "border-green-200 bg-green-50 text-green-800 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300"
          : "border-destructive/30 bg-destructive/5 text-destructive"
      }`}
    >
      {result.ok ? (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
      ) : (
        <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
      )}
      <div className="min-w-0">
        <span className="font-medium">{result.ok ? "Connection OK" : "Connection failed"}</span>
        {result.error && <span className="ml-1 break-words">— {result.error}</span>}
      </div>
    </div>
  );
}

// --- layout primitives ------------------------------------------------------

function IntegrationCard({
  icon: Icon,
  title,
  description,
  enabled,
  onToggle,
  health,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: (v: boolean) => void;
  health: IntegrationHealthEntry | undefined;
  children: React.ReactNode;
}) {
  const state = computeHealthState(health);
  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-lg bg-primary/10 p-2">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold">{title}</h2>
              <HealthBadge state={state} />
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={enabled ? "default" : "secondary"}>{enabled ? "On" : "Off"}</Badge>
          <Switch checked={enabled} onCheckedChange={onToggle} aria-label={`Enable ${title}`} />
        </div>
      </div>

      <div className="mb-4 rounded-lg border bg-muted/20 p-3">
        <HealthSummary health={health} />
      </div>

      {children}
    </div>
  );
}

// --- activity feed ----------------------------------------------------------

type ActivityFilter = "all" | GetIntegrationActivityIntegration;

const INTEGRATION_LABEL: Record<string, string> = {
  email: "Email",
  linkedin: "LinkedIn",
  x: "X",
};

function fmtDate(value: string): string {
  return new Date(value).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function ActivityFeed({ authenticated }: { authenticated: boolean }) {
  const [filter, setFilter] = useState<ActivityFilter>("all");
  const params = useMemo(
    () => ({ limit: 50, ...(filter !== "all" ? { integration: filter } : {}) }),
    [filter],
  );
  const { data: items = [], isLoading, isFetching, refetch } = useGetIntegrationActivity(params, {
    query: { queryKey: getGetIntegrationActivityQueryKey(params), enabled: authenticated },
  });

  const filters: { key: ActivityFilter; label: string }[] = [
    { key: "all", label: "All" },
    { key: GetIntegrationActivityIntegration.email, label: "Email" },
    { key: GetIntegrationActivityIntegration.linkedin, label: "LinkedIn" },
    { key: GetIntegrationActivityIntegration.x, label: "X" },
  ];

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Activity</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Recent connection tests, sends, and shares across all integrations.
          </p>
        </div>
        <div className="flex items-center gap-1">
          <div className="flex rounded-md border p-0.5">
            {filters.map((f) => (
              <button
                key={f.key}
                type="button"
                onClick={() => setFilter(f.key)}
                className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                  filter === f.key
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <Button size="icon" variant="ghost" aria-label="Refresh activity" onClick={() => refetch()} title="Refresh">
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : items.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
          No activity recorded yet.
        </div>
      ) : (
        <div className="divide-y" aria-live="polite" aria-busy={isFetching}>
          {items.map((item) => (
            <div key={item.id} className="flex items-start gap-3 py-2.5 text-sm">
              {item.success ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
              ) : (
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              )}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="text-[10px]">
                    {INTEGRATION_LABEL[item.integration] ?? item.integration}
                  </Badge>
                  <span className="font-medium capitalize">{item.kind}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {relativeTime(item.createdAt)} · {fmtDate(item.createdAt)}
                  </span>
                </div>
                {item.detail && (
                  <p
                    className={`mt-0.5 break-words text-xs ${
                      item.success ? "text-muted-foreground" : "text-destructive"
                    }`}
                  >
                    {item.detail}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- page -------------------------------------------------------------------

export default function AdminIntegrations() {
  const { authenticated } = useAdminGuard();
  const queryClient = useQueryClient();

  const invalidateSettings = () =>
    queryClient.invalidateQueries({ queryKey: getGetIntegrationSettingsQueryKey() });
  const invalidateHealth = () =>
    queryClient.invalidateQueries({ queryKey: getGetIntegrationsHealthQueryKey() });
  // Prefix match (no params) invalidates the activity feed for every filter.
  const invalidateActivity = () =>
    queryClient.invalidateQueries({ queryKey: getGetIntegrationActivityQueryKey() });

  const { data, isLoading } = useGetIntegrationSettings({
    query: { queryKey: getGetIntegrationSettingsQueryKey(), enabled: authenticated },
  });
  const { data: health } = useGetIntegrationsHealth({
    query: { queryKey: getGetIntegrationsHealthQueryKey(), enabled: authenticated },
  });

  const [email, setEmail] = useState<EmailForm>({
    enabled: false,
    fromName: "",
    fromEmail: "",
    smtpHost: "",
    smtpPort: 587,
    smtpSecure: false,
    smtpUser: "",
    smtpPassword: "",
    alertEmail: "",
  });
  const [linkedin, setLinkedin] = useState<LinkedinForm>({
    enabled: false,
    autoPublish: false,
    profileUrl: "",
    authorUrn: "",
    accessToken: "",
    clientId: "",
    clientSecret: "",
  });
  const [x, setX] = useState<XForm>({
    enabled: false,
    autoPublish: false,
    username: "",
    apiKey: "",
    apiSecret: "",
    accessToken: "",
    accessSecret: "",
  });
  const [alerts, setAlerts] = useState<ConformityAlertsForm>({
    enabled: false,
    recipient: "",
    leadTimeHours: 6,
    digestEnabled: false,
    reminderIntervalHours: 24,
    maxReminders: 5,
  });
  const [alertsRun, setAlertsRun] = useState<ConformityAlertsRunResult | null>(null);
  const [testTo, setTestTo] = useState("");
  const [linkedinTest, setLinkedinTest] = useState<ConnectionTestResult | null>(null);
  const [xTest, setXTest] = useState<ConnectionTestResult | null>(null);

  useEffect(() => {
    if (!data) return;
    setEmail({
      enabled: data.email.enabled,
      fromName: data.email.fromName,
      fromEmail: data.email.fromEmail,
      smtpHost: data.email.smtpHost,
      smtpPort: data.email.smtpPort,
      smtpSecure: data.email.smtpSecure,
      smtpUser: data.email.smtpUser,
      smtpPassword: "",
      alertEmail: data.email.alertEmail,
    });
    setLinkedin({
      enabled: data.linkedin.enabled,
      autoPublish: data.linkedin.autoPublish,
      profileUrl: data.linkedin.profileUrl,
      authorUrn: data.linkedin.authorUrn,
      accessToken: "",
      clientId: data.linkedin.clientId,
      clientSecret: "",
    });
    setX({
      enabled: data.x.enabled,
      autoPublish: data.x.autoPublish,
      username: data.x.username,
      apiKey: "",
      apiSecret: "",
      accessToken: "",
      accessSecret: "",
    });
    setAlerts({
      enabled: data.conformityAlerts.enabled,
      recipient: data.conformityAlerts.recipient,
      leadTimeHours: data.conformityAlerts.leadTimeHours,
      digestEnabled: data.conformityAlerts.digestEnabled,
      reminderIntervalHours: data.conformityAlerts.reminderIntervalHours,
      maxReminders: data.conformityAlerts.maxReminders,
    });
  }, [data]);

  // Surface the outcome of the LinkedIn OAuth redirect (?linkedin=...).
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const flag = params.get("linkedin");
    if (!flag) return;
    const messages: Record<string, { title: string; variant?: "destructive" }> = {
      connected: { title: "LinkedIn connected" },
      denied: { title: "LinkedIn authorization was denied", variant: "destructive" },
      bad_state: { title: "LinkedIn connection failed (invalid state)", variant: "destructive" },
      no_code: { title: "LinkedIn connection failed (no code)", variant: "destructive" },
      missing_client: {
        title: "Set your LinkedIn Client ID and Secret first",
        variant: "destructive",
      },
      error: { title: "LinkedIn connection failed", variant: "destructive" },
    };
    const msg = messages[flag] ?? { title: "LinkedIn connection updated" };
    toast({ title: msg.title, variant: msg.variant });
    window.history.replaceState({}, "", window.location.pathname);
    invalidateSettings();
    invalidateHealth();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const afterSave = () => {
    invalidateSettings();
    invalidateHealth();
    invalidateActivity();
  };

  const saveEmail = useSaveEmailSettings({
    mutation: {
      onSuccess: () => {
        toast({ title: "Email settings saved" });
        afterSave();
      },
      onError: () => toast({ title: "Could not save email settings", variant: "destructive" }),
    },
  });
  const saveLinkedin = useSaveLinkedinSettings({
    mutation: {
      onSuccess: () => {
        toast({ title: "LinkedIn settings saved" });
        afterSave();
      },
      onError: () => toast({ title: "Could not save LinkedIn settings", variant: "destructive" }),
    },
  });
  const saveX = useSaveXSettings({
    mutation: {
      onSuccess: () => {
        toast({ title: "X settings saved" });
        afterSave();
      },
      onError: () => toast({ title: "Could not save X settings", variant: "destructive" }),
    },
  });
  const sendTest = useSendTestEmail({
    mutation: {
      onSuccess: (res) => {
        if (res.delivered) toast({ title: `Test email sent to ${testTo}` });
        else
          toast({
            title: "Test email not sent",
            description: res.error ?? "Check your SMTP settings.",
            variant: "destructive",
          });
        invalidateHealth();
        invalidateActivity();
      },
      onError: () => toast({ title: "Could not send test email", variant: "destructive" }),
    },
  });
  const testLinkedin = useTestLinkedinConnection({
    mutation: {
      onSuccess: (res) => {
        setLinkedinTest(res);
        invalidateHealth();
        invalidateActivity();
      },
      onError: () => {
        setLinkedinTest({ ok: false, error: "Request failed", checkedAt: new Date().toISOString() });
      },
    },
  });
  const testX = useTestXConnection({
    mutation: {
      onSuccess: (res) => {
        setXTest(res);
        invalidateHealth();
        invalidateActivity();
      },
      onError: () => {
        setXTest({ ok: false, error: "Request failed", checkedAt: new Date().toISOString() });
      },
    },
  });
  const saveAlerts = useSaveConformityAlertsSettings({
    mutation: {
      onSuccess: (res) => {
        // The server clamps out-of-range numbers; reflect the values that were
        // actually saved in the form and tell the admin when they changed.
        const saved = res.conformityAlerts;
        const adjusted: string[] = [];
        if (saved.leadTimeHours !== alerts.leadTimeHours)
          adjusted.push(`lead time → ${saved.leadTimeHours}h`);
        if (saved.reminderIntervalHours !== alerts.reminderIntervalHours)
          adjusted.push(`reminder interval → ${saved.reminderIntervalHours}h`);
        if (saved.maxReminders !== alerts.maxReminders)
          adjusted.push(`max reminders → ${saved.maxReminders}`);
        setAlerts((s) => ({
          ...s,
          leadTimeHours: saved.leadTimeHours,
          reminderIntervalHours: saved.reminderIntervalHours,
          maxReminders: saved.maxReminders,
        }));
        toast({
          title: "Deadline alert settings saved",
          ...(adjusted.length > 0
            ? {
                description: `Out-of-range values were adjusted to the allowed range: ${adjusted.join(", ")}.`,
              }
            : {}),
        });
        afterSave();
      },
      onError: () =>
        toast({ title: "Could not save deadline alert settings", variant: "destructive" }),
    },
  });
  const runAlerts = useRunConformityAlertsCheck({
    mutation: {
      onSuccess: (res) => {
        setAlertsRun(res);
        invalidateActivity();
        if (!res.enabled) {
          toast({
            title: "Deadline alerts are disabled",
            description: "Turn them on and save before running a check.",
          });
        } else if (!res.emailConfigured) {
          toast({
            title: "Email is not configured",
            description: "Enable and configure SMTP above, then try again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: `Checked ${res.incidentsChecked} open incident(s)`,
            description: `${res.alertsSent} alert(s) sent, ${res.alertsFailed} failed${res.digestSent ? ", digest sent" : ""}.`,
          });
        }
      },
      onError: () => toast({ title: "Could not run the deadline check", variant: "destructive" }),
    },
  });

  if (!authenticated) return null;

  const emailSecretSet = data?.email.smtpPasswordSet ?? false;

  return (
    <AdminLayout>
      <div className="mb-6 flex items-start gap-3">
        <div className="mt-1 rounded-lg bg-primary/10 p-2">
          <Plug className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">Integrations</h1>
          <p className="mt-1 text-muted-foreground">
            Configure, test, and monitor email delivery and your LinkedIn &amp; X connections.
            Secrets are stored securely and never shown again after saving.
          </p>
        </div>
      </div>

      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <div className="space-y-6">
          {/* ---------------- Email ---------------- */}
          <IntegrationCard
            icon={Mail}
            title="Email (SMTP)"
            description="Newsletter confirmations and campaigns. For Gmail use smtp.gmail.com, port 465 (SSL) with an App Password."
            enabled={email.enabled}
            onToggle={(v) => setEmail((s) => ({ ...s, enabled: v }))}
            health={health?.email}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="From name" hint="Shown as the sender name.">
                <Input
                  value={email.fromName}
                  onChange={(e) => setEmail((s) => ({ ...s, fromName: e.target.value }))}
                  placeholder="OXOT"
                />
              </Field>
              <Field label="From email" hint="Must be an address you're allowed to send from.">
                <Input
                  value={email.fromEmail}
                  onChange={(e) => setEmail((s) => ({ ...s, fromEmail: e.target.value }))}
                  placeholder="news@oxot.eu"
                />
              </Field>
              <Field label="SMTP host">
                <Input
                  value={email.smtpHost}
                  onChange={(e) => setEmail((s) => ({ ...s, smtpHost: e.target.value }))}
                  placeholder="smtp.gmail.com"
                />
              </Field>
              <Field label="SMTP port" hint="465 for SSL, 587 for STARTTLS.">
                <Input
                  type="number"
                  value={email.smtpPort}
                  onChange={(e) => setEmail((s) => ({ ...s, smtpPort: Number(e.target.value) || 0 }))}
                  placeholder="465"
                />
              </Field>
              <Field label="SMTP username">
                <Input
                  value={email.smtpUser}
                  onChange={(e) => setEmail((s) => ({ ...s, smtpUser: e.target.value }))}
                  placeholder="you@gmail.com"
                  autoComplete="off"
                />
              </Field>
              <Field
                label="SMTP password"
                hint={emailSecretSet ? "A password is already stored." : undefined}
              >
                <Input
                  type="password"
                  value={email.smtpPassword}
                  onChange={(e) => setEmail((s) => ({ ...s, smtpPassword: e.target.value }))}
                  placeholder={emailSecretSet ? SECRET_PLACEHOLDER : "App password"}
                  autoComplete="new-password"
                />
              </Field>
              <Field
                label="Alert email"
                hint="Where failed social shares & expiring-token warnings are sent. Defaults to From email."
              >
                <Input
                  value={email.alertEmail}
                  onChange={(e) => setEmail((s) => ({ ...s, alertEmail: e.target.value }))}
                  placeholder="alerts@oxot.eu"
                />
              </Field>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Switch
                checked={email.smtpSecure}
                onCheckedChange={(v) => setEmail((s) => ({ ...s, smtpSecure: v }))}
                id="smtp-secure"
              />
              <Label htmlFor="smtp-secure" className="text-sm font-normal">
                Use SSL/TLS (secure connection — turn on for port 465)
              </Label>
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
              <div className="flex items-end gap-2">
                <Field label="Send a test email to">
                  <Input
                    value={testTo}
                    onChange={(e) => setTestTo(e.target.value)}
                    placeholder="you@example.com"
                    className="w-56"
                  />
                </Field>
                <Button
                  variant="outline"
                  disabled={sendTest.isPending || !testTo}
                  onClick={() => sendTest.mutate({ data: { to: testTo } })}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {sendTest.isPending ? "Sending…" : "Send test email"}
                </Button>
              </div>
              <Button disabled={saveEmail.isPending} onClick={() => saveEmail.mutate({ data: email })}>
                <Save className="mr-2 h-4 w-4" />
                {saveEmail.isPending ? "Saving…" : "Save email settings"}
              </Button>
            </div>
          </IntegrationCard>

          {/* ---------------- LinkedIn ---------------- */}
          <IntegrationCard
            icon={Linkedin}
            title="LinkedIn"
            description="Show your latest posts on the site and (optionally) auto-share new content."
            enabled={linkedin.enabled}
            onToggle={(v) => setLinkedin((s) => ({ ...s, enabled: v }))}
            health={health?.linkedin}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Profile / page URL" hint="Public URL used for the feed link.">
                <Input
                  value={linkedin.profileUrl}
                  onChange={(e) => setLinkedin((s) => ({ ...s, profileUrl: e.target.value }))}
                  placeholder="https://www.linkedin.com/company/oxot"
                />
              </Field>
              <Field label="Author URN" hint="e.g. urn:li:organization:123 or urn:li:person:abc">
                <Input
                  value={linkedin.authorUrn}
                  onChange={(e) => setLinkedin((s) => ({ ...s, authorUrn: e.target.value }))}
                  placeholder="urn:li:organization:..."
                />
              </Field>
              <Field
                label="Access token"
                hint={
                  data?.linkedin.accessTokenSet
                    ? "A token is already stored."
                    : "From your LinkedIn developer app."
                }
              >
                <Input
                  type="password"
                  value={linkedin.accessToken}
                  onChange={(e) => setLinkedin((s) => ({ ...s, accessToken: e.target.value }))}
                  placeholder={data?.linkedin.accessTokenSet ? SECRET_PLACEHOLDER : "Access token"}
                  autoComplete="new-password"
                />
              </Field>
              <Field
                label="OAuth Client ID"
                hint="From your LinkedIn OAuth app (for Connect / Reconnect)."
              >
                <Input
                  value={linkedin.clientId}
                  onChange={(e) => setLinkedin((s) => ({ ...s, clientId: e.target.value }))}
                  placeholder="LinkedIn app client ID"
                />
              </Field>
              <Field
                label="OAuth Client Secret"
                hint={
                  data?.linkedin.clientSecretSet
                    ? "A secret is already stored."
                    : "From your LinkedIn OAuth app."
                }
              >
                <Input
                  type="password"
                  value={linkedin.clientSecret}
                  onChange={(e) => setLinkedin((s) => ({ ...s, clientSecret: e.target.value }))}
                  placeholder={data?.linkedin.clientSecretSet ? SECRET_PLACEHOLDER : "Client secret"}
                  autoComplete="new-password"
                />
              </Field>
            </div>

            <div className="mt-4 flex items-center gap-2">
              <Switch
                checked={linkedin.autoPublish}
                onCheckedChange={(v) => setLinkedin((s) => ({ ...s, autoPublish: v }))}
                id="li-auto"
              />
              <Label htmlFor="li-auto" className="text-sm font-normal">
                Auto-share new published content to LinkedIn
              </Label>
            </div>

            <TestResultBanner result={linkedinTest} />

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  disabled={testLinkedin.isPending}
                  onClick={() => {
                    setLinkedinTest(null);
                    testLinkedin.mutate();
                  }}
                >
                  <Plug className="mr-2 h-4 w-4" />
                  {testLinkedin.isPending ? "Testing…" : "Test connection"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    window.location.href = "/api/admin/social/linkedin/oauth/start";
                  }}
                >
                  <Linkedin className="mr-2 h-4 w-4" />
                  {data?.linkedin.accessTokenSet ? "Reconnect LinkedIn" : "Connect LinkedIn"}
                </Button>
              </div>
              <Button
                disabled={saveLinkedin.isPending}
                onClick={() => saveLinkedin.mutate({ data: linkedin })}
              >
                <Save className="mr-2 h-4 w-4" />
                {saveLinkedin.isPending ? "Saving…" : "Save LinkedIn settings"}
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Save your Client ID and Secret first, then click Connect to authorize via LinkedIn.
              Whitelist the redirect URI shown in your app settings.
            </p>
          </IntegrationCard>

          {/* ---------------- X ---------------- */}
          <IntegrationCard
            icon={Twitter}
            title="X (Twitter)"
            description="Show your latest posts on the site and (optionally) auto-share new content."
            enabled={x.enabled}
            onToggle={(v) => setX((s) => ({ ...s, enabled: v }))}
            health={health?.x}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Username" hint="Without the @.">
                <Input
                  value={x.username}
                  onChange={(e) => setX((s) => ({ ...s, username: e.target.value }))}
                  placeholder="oxot"
                />
              </Field>
              <Field label="API key" hint={data?.x.apiKeySet ? "Stored." : "From your X developer app."}>
                <Input
                  type="password"
                  value={x.apiKey}
                  onChange={(e) => setX((s) => ({ ...s, apiKey: e.target.value }))}
                  placeholder={data?.x.apiKeySet ? SECRET_PLACEHOLDER : "API key"}
                  autoComplete="new-password"
                />
              </Field>
              <Field label="API secret" hint={data?.x.apiSecretSet ? "Stored." : undefined}>
                <Input
                  type="password"
                  value={x.apiSecret}
                  onChange={(e) => setX((s) => ({ ...s, apiSecret: e.target.value }))}
                  placeholder={data?.x.apiSecretSet ? SECRET_PLACEHOLDER : "API secret"}
                  autoComplete="new-password"
                />
              </Field>
              <Field label="Access token" hint={data?.x.accessTokenSet ? "Stored." : undefined}>
                <Input
                  type="password"
                  value={x.accessToken}
                  onChange={(e) => setX((s) => ({ ...s, accessToken: e.target.value }))}
                  placeholder={data?.x.accessTokenSet ? SECRET_PLACEHOLDER : "Access token"}
                  autoComplete="new-password"
                />
              </Field>
              <Field label="Access secret" hint={data?.x.accessSecretSet ? "Stored." : undefined}>
                <Input
                  type="password"
                  value={x.accessSecret}
                  onChange={(e) => setX((s) => ({ ...s, accessSecret: e.target.value }))}
                  placeholder={data?.x.accessSecretSet ? SECRET_PLACEHOLDER : "Access secret"}
                  autoComplete="new-password"
                />
              </Field>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Switch
                checked={x.autoPublish}
                onCheckedChange={(v) => setX((s) => ({ ...s, autoPublish: v }))}
                id="x-auto"
              />
              <Label htmlFor="x-auto" className="text-sm font-normal">
                Auto-share new published content to X
              </Label>
            </div>

            <TestResultBanner result={xTest} />

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
              <Button
                variant="outline"
                disabled={testX.isPending}
                onClick={() => {
                  setXTest(null);
                  testX.mutate();
                }}
              >
                <Plug className="mr-2 h-4 w-4" />
                {testX.isPending ? "Testing…" : "Test connection"}
              </Button>
              <Button disabled={saveX.isPending} onClick={() => saveX.mutate({ data: x })}>
                <Save className="mr-2 h-4 w-4" />
                {saveX.isPending ? "Saving…" : "Save X settings"}
              </Button>
            </div>
          </IntegrationCard>

          {/* ---------------- CRA deadline alerts ---------------- */}
          <IntegrationCard
            icon={Bell}
            title="CRA deadline alerts"
            description="Email alerts when incident reporting deadlines (24h early warning, 72h notification, 14-day final report) are approaching or breached. Delivered via the SMTP settings above."
            enabled={alerts.enabled}
            onToggle={(v) => setAlerts((s) => ({ ...s, enabled: v }))}
            health={undefined}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Recipient"
                hint={
                  data?.conformityAlerts.effectiveRecipient
                    ? `Currently delivering to ${data.conformityAlerts.effectiveRecipient}.`
                    : "Blank = use the email integration's Alert email / From email."
                }
              >
                <Input
                  value={alerts.recipient}
                  onChange={(e) => setAlerts((s) => ({ ...s, recipient: e.target.value }))}
                  placeholder="compliance@oxot.eu"
                />
              </Field>
              <Field
                label="Lead time (hours)"
                hint="How far before a deadline the 'approaching' alert fires (1–168)."
              >
                <Input
                  type="number"
                  min={1}
                  max={168}
                  value={alerts.leadTimeHours}
                  onChange={(e) =>
                    setAlerts((s) => ({ ...s, leadTimeHours: Number(e.target.value) || 0 }))
                  }
                />
              </Field>
              <Field
                label="Reminder interval (hours)"
                hint="How often a breached deadline that stays unaddressed re-alerts (1–168)."
              >
                <Input
                  type="number"
                  min={1}
                  max={168}
                  value={alerts.reminderIntervalHours}
                  onChange={(e) =>
                    setAlerts((s) => ({ ...s, reminderIntervalHours: Number(e.target.value) || 0 }))
                  }
                />
              </Field>
              <Field
                label="Max reminders"
                hint="Cap on 'still overdue' reminders per deadline (0 = breach email only)."
              >
                <Input
                  type="number"
                  min={0}
                  max={30}
                  value={alerts.maxReminders}
                  onChange={(e) =>
                    setAlerts((s) => ({ ...s, maxReminders: Number(e.target.value) || 0 }))
                  }
                />
              </Field>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <Switch
                checked={alerts.digestEnabled}
                onCheckedChange={(v) => setAlerts((s) => ({ ...s, digestEnabled: v }))}
                id="cra-digest"
              />
              <Label htmlFor="cra-digest" className="text-sm font-normal">
                Also send a daily digest of overdue and due-soon incidents (max one per day)
              </Label>
            </div>

            {alertsRun && (
              <div className="mt-4 rounded-md border bg-muted/40 p-3 text-sm" role="status">
                Last check {relativeTime(alertsRun.ranAt)}:{" "}
                {!alertsRun.enabled
                  ? "alerts are disabled — nothing sent."
                  : !alertsRun.emailConfigured
                    ? "email is not configured — nothing sent."
                    : `${alertsRun.incidentsChecked} open incident(s) checked · ${alertsRun.alertsSent} alert(s) sent · ${alertsRun.alertsFailed} failed${alertsRun.digestSent ? " · digest sent" : ""}.`}
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
              <Button
                variant="outline"
                disabled={runAlerts.isPending}
                onClick={() => runAlerts.mutate()}
              >
                <RefreshCw className={`mr-2 h-4 w-4 ${runAlerts.isPending ? "animate-spin" : ""}`} />
                {runAlerts.isPending ? "Checking…" : "Run check now"}
              </Button>
              <Button
                disabled={saveAlerts.isPending}
                onClick={() =>
                  saveAlerts.mutate({
                    data: {
                      ...alerts,
                      leadTimeHours: Math.min(168, Math.max(1, Math.round(alerts.leadTimeHours) || 6)),
                      reminderIntervalHours: Math.min(
                        168,
                        Math.max(1, Math.round(alerts.reminderIntervalHours) || 24),
                      ),
                      maxReminders: Math.min(30, Math.max(0, Math.round(alerts.maxReminders) || 0)),
                    },
                  })
                }
              >
                <Save className="mr-2 h-4 w-4" />
                {saveAlerts.isPending ? "Saving…" : "Save alert settings"}
              </Button>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Each incident/deadline pair alerts once per event (approaching, breached, and each
              capped reminder), so re-running never sends duplicates. The dev
              server checks automatically every ~10 minutes; in production, schedule the check to run
              periodically (see replit.md).
            </p>
          </IntegrationCard>

          {/* ---------------- Activity feed ---------------- */}
          <ActivityFeed authenticated={authenticated} />
        </div>
      )}
    </AdminLayout>
  );
}
