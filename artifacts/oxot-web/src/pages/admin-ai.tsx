import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetLlmSettings,
  getGetLlmSettingsQueryKey,
  useGetContentIndexStatus,
  getGetContentIndexStatusQueryKey,
  useReindexContent,
} from "@workspace/api-client-react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { useAdminGuard } from "@/hooks/use-admin-guard";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BrainCircuit,
  CheckCircle2,
  XCircle,
  Save,
  Database,
  RefreshCw,
  Key,
  Eye,
  EyeOff,
  ShieldCheck,
  Zap,
  DollarSign,
  Layers,
  Sparkles,
} from "lucide-react";

function formatRelative(iso: string | null): string {
  if (!iso) return "Never";
  const then = new Date(iso).getTime();
  const diffMs = Date.now() - then;
  const mins = Math.round(diffMs / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  return new Date(iso).toLocaleString();
}

function formatContextWindow(ctx: number | null): string {
  if (!ctx) return "N/A";
  if (ctx >= 1000000) return `${(ctx / 1000000).toFixed(ctx % 1000000 === 0 ? 0 : 2)}M context`;
  return `${Math.round(ctx / 1000)}k context`;
}

function KnowledgeIndexCard({ enabled }: { enabled: boolean }) {
  const queryClient = useQueryClient();
  const { data: status } = useGetContentIndexStatus({
    query: {
      queryKey: getGetContentIndexStatusQueryKey(),
      enabled,
      refetchInterval: (query) => (query.state.data?.running ? 2000 : false),
    },
  });

  const reindex = useReindexContent({
    mutation: {
      onSuccess: () => {
        toast({ title: "Rebuilding the assistant's knowledge…" });
        queryClient.invalidateQueries({ queryKey: getGetContentIndexStatusQueryKey() });
      },
      onError: () => toast({ title: "Could not start rebuild", variant: "destructive" }),
    },
  });

  const running = status?.running ?? false;

  return (
    <div className="rounded-xl border bg-card p-5 shadow-sm">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold">
        <Database className="h-4 w-4 text-primary" /> Assistant Knowledge Base
      </h2>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">
            The assistant answers from published page content. It refreshes automatically when you
            publish or delete a page — you can also rebuild it manually.
          </p>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-1 pt-1 text-sm">
            <span>
              <span className="text-muted-foreground">Last refreshed: </span>
              <span className="font-medium">{formatRelative(status?.lastIndexedAt ?? null)}</span>
            </span>
            <span>
              <span className="text-muted-foreground">Indexed passages: </span>
              <span className="font-medium">{status?.chunkCount ?? "—"}</span>
            </span>
            {running && (
              <Badge variant="secondary" className="gap-1">
                <RefreshCw className="h-3 w-3 animate-spin" /> Rebuilding…
              </Badge>
            )}
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => reindex.mutate()}
          disabled={reindex.isPending || running}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${running ? "animate-spin" : ""}`} />
          {running ? "Rebuilding…" : "Rebuild now"}
        </Button>
      </div>
    </div>
  );
}

const ROLES: { key: string; role: string; label: string; help: string }[] = [
  { key: "chatModel", role: "chat", label: "Assistant Chat & Reasoning", help: "DeepSeek R1 reasoning model for CRA gap analysis and audit guidance." },
  { key: "briefModel", role: "brief", label: "Wizard & Executive Briefs", help: "Executive summary, landing page copy, and CRA brief generation." },
  { key: "translationModel", role: "translation", label: "Translation Engine", help: "Multilingual EU regulation translation (EN, NL, DE, FR)." },
  { key: "longContextModel", role: "longContext", label: "Long Context Reasoning", help: "Reasoning over massive technical files (up to 1M tokens)." },
  { key: "embeddingModel", role: "embeddings", label: "Embeddings & RAG Index", help: "High-density vector embedding model powering semantic search." },
  { key: "searchModel", role: "search", label: "Web & Vulnerability Search", help: "Live web search, CISA KEV, and ENISA advisory grounding." },
];

export default function AdminAi() {
  const { authenticated } = useAdminGuard();
  const queryClient = useQueryClient();

  const { data, isLoading } = useGetLlmSettings({
    query: { queryKey: getGetLlmSettingsQueryKey(), enabled: authenticated },
  });

  const [config, setConfig] = useState<Record<string, string>>({});
  const [openrouterKeyInput, setOpenrouterKeyInput] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (data?.config) {
      const cfg = data.config as Record<string, string>;
      setConfig({ ...cfg });
      if (cfg.openrouterApiKey) {
        setOpenrouterKeyInput(cfg.openrouterApiKey);
      }
    }
  }, [data]);

  const saveSettings = async (overrides?: Record<string, string>) => {
    setIsSaving(true);
    try {
      const payload = {
        ...config,
        ...(overrides || {}),
        openrouterApiKey: openrouterKeyInput,
      };

      const res = await fetch("/api/admin/settings/llm", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP ${res.status}`);
      }

      const updated = await res.json();
      if (updated.config) {
        setConfig({ ...(updated.config as Record<string, string>) });
        if (updated.config.openrouterApiKey) {
          setOpenrouterKeyInput(updated.config.openrouterApiKey);
        }
      }

      toast({ title: "OpenRouter & Model settings saved to Postgres DB" });
      queryClient.invalidateQueries({ queryKey: getGetLlmSettingsQueryKey() });
    } catch (err: any) {
      toast({
        title: "Could not save settings",
        description: err.message || "Failed to communicate with API server",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const [testingModel, setTestingModel] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ [modelId: string]: { success: boolean; responseText?: string; error?: string } }>({});

  const handleTestModel = async (modelId: string) => {
    setTestingModel(modelId);
    try {
      const res = await fetch("/api/admin/settings/llm/test-model", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelId }),
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        setTestResult((prev) => ({
          ...prev,
          [modelId]: { success: true, responseText: resData.responseText },
        }));
        toast({
          title: `✅ ${modelId} Verified Online`,
          description: resData.responseText,
        });
      } else {
        setTestResult((prev) => ({
          ...prev,
          [modelId]: { success: false, error: resData.error || "Model test failed" },
        }));
        toast({
          title: `❌ ${modelId} Test Failed`,
          description: resData.error || "Could not complete model test ping.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      setTestResult((prev) => ({
        ...prev,
        [modelId]: { success: false, error: err.message },
      }));
      toast({
        title: "Test Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setTestingModel(null);
    }
  };

  const handleTestAllModels = async () => {
    const selectedModels = Array.from(new Set(Object.values(config).filter(Boolean))) as string[];
    const modelsToRun = selectedModels.length > 0 ? selectedModels : ["~deepseek/deepseek-v4-flash-latest"];
    toast({ title: "🧪 Running Live Model Test Suite…", description: `Testing ${modelsToRun.length} models via OpenRouter.` });
    for (const m of modelsToRun) {
      await handleTestModel(m);
    }
    toast({ title: "✅ Live Model Test Suite Complete!" });
  };

  if (!authenticated) return null;

  const catalog = (data?.catalog ?? []) as any[];
  const providers = (data?.providers ?? []) as any[];
  const isKeyConfigured = Boolean(openrouterKeyInput && openrouterKeyInput.length > 0);

  return (
    <AdminLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-display font-bold tracking-tight">AI &amp; Models</h1>
        <p className="mt-1 text-muted-foreground">
          Configure live OpenRouter API keys stored securely in PostgreSQL DB and assign model roles with real-time costs and context limits.
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <div className="space-y-6">
          <KnowledgeIndexCard enabled={authenticated} />

          {/* OpenRouter Key Card */}
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-3">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <Key className="h-4 w-4 text-primary" /> OpenRouter API Key (Postgres Database Storage)
              </h2>
              {isKeyConfigured ? (
                <Badge variant="default" className="gap-1 bg-green-600">
                  <ShieldCheck className="h-3 w-3" /> Stored in Postgres DB
                </Badge>
              ) : (
                <Badge variant="secondary">Not configured</Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Enter your OpenRouter key (<code className="text-primary font-mono">sk-or-v1-...</code>). This is stored directly in the PostgreSQL <code className="font-mono">app_settings</code> table and takes <strong>highest priority</strong> for all DeepSeek R1, Qwen Image, Qwen Embedding, and Qwen TTS calls.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="relative flex-1">
                <Input
                  type={showKey ? "text" : "password"}
                  placeholder="sk-or-v1-••••••••••••••••••••••••••••••••"
                  value={openrouterKeyInput}
                  onChange={(e) => {
                    setOpenrouterKeyInput(e.target.value);
                  }}
                  className="font-mono text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <Button
                onClick={() => saveSettings({ openrouterApiKey: openrouterKeyInput })}
                disabled={isSaving}
              >
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Saving to DB…" : "Save OpenRouter Key"}
              </Button>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-semibold">Provider Connections</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {providers.map((p) => (
                <div key={p.id} className="flex items-start gap-3 rounded-lg border p-3">
                  {p.configured || isKeyConfigured ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />
                  ) : (
                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{p.name}</span>
                      <Badge variant={p.configured || isKeyConfigured ? "default" : "secondary"}>
                        {p.configured || isKeyConfigured ? "Active & Configured" : "Not set"}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{p.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Model Assignments Section */}
          <div className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <BrainCircuit className="h-4 w-4 text-primary" /> Model Assignments &amp; Cost Registry
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleTestAllModels}
                  disabled={Boolean(testingModel)}
                  className="h-8 text-xs gap-1.5 font-medium border-amber-500/40 hover:bg-amber-500/10 text-amber-600 dark:text-amber-400"
                >
                  <Zap className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                  {testingModel ? "Testing Models…" : "Test All Assigned Models"}
                </Button>
                <Badge variant="outline" className="gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" /> {catalog.length} OpenRouter Models Available
                </Badge>
              </div>
            </div>
            <div className="space-y-6">
              {ROLES.map((r) => {
                const roleMatching = catalog.filter((m) => (m.roles ?? []).includes(r.role));
                const options = roleMatching.length > 0 ? roleMatching : catalog;
                const currentSelected = config[r.key];
                const selected = currentSelected || options[0]?.id || catalog[0]?.id || "~deepseek/deepseek-v4-flash-latest";
                const selectedEntry = catalog.find((m) => m.id === selected) || options[0] || catalog[0];

                return (
                  <div key={r.key} className="rounded-lg border p-4 bg-muted/20 space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <Label htmlFor={`model-select-${r.key}`} className="text-base font-semibold text-foreground">
                          {r.label}
                        </Label>
                        <p id={`model-help-${r.key}`} className="text-xs text-muted-foreground mt-0.5">
                          {r.help}
                        </p>
                      </div>
                      {selectedEntry && (
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="text-xs font-mono bg-background">
                            {selectedEntry.category || "OpenRouter"}
                          </Badge>
                          <Badge variant="secondary" className="text-xs font-mono gap-1">
                            <Layers className="h-3 w-3" />
                            {formatContextWindow(selectedEntry.contextWindow)}
                          </Badge>
                        </div>
                      )}
                    </div>

                    <div>
                      <Select
                        value={selected}
                        onValueChange={(v) => setConfig((prev) => ({ ...prev, [r.key]: v }))}
                      >
                        <SelectTrigger
                          id={`model-select-${r.key}`}
                          aria-describedby={`model-help-${r.key}`}
                          className="h-11 font-mono text-sm bg-background"
                        >
                          <SelectValue placeholder="Select an OpenRouter model">
                            {selectedEntry ? `${selectedEntry.name} (${selectedEntry.id})` : selected}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="max-h-[380px]">
                          {options.map((m) => (
                            <SelectItem key={m.id} value={m.id} textValue={m.name}>
                              <div className="flex flex-col gap-0.5 py-1 text-left">
                                <div className="flex items-center justify-between gap-4 font-semibold text-sm">
                                  <span>{m.name}</span>
                                  <span className="text-xs font-mono text-amber-500">[{m.category || "OpenRouter"}]</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
                                  <span>{m.id}</span>
                                  <span>•</span>
                                  <span className="text-emerald-500">In: {m.pricingPrompt || "Free"}</span>
                                  <span>•</span>
                                  <span className="text-blue-500">Out: {m.pricingCompletion || "Free"}</span>
                                  <span>•</span>
                                  <span>{formatContextWindow(m.contextWindow)}</span>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {selectedEntry && (
                        <div className="mt-2 text-xs rounded-md bg-background/80 p-2.5 border space-y-2 font-mono">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-muted-foreground flex-1">{selectedEntry.description}</span>
                            <div className="flex items-center gap-3 text-xs shrink-0">
                              <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                                <DollarSign className="h-3 w-3" /> Input: {selectedEntry.pricingPrompt}
                              </span>
                              <span className="text-blue-600 font-semibold flex items-center gap-0.5">
                                <Zap className="h-3 w-3" /> Output: {selectedEntry.pricingCompletion}
                              </span>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs gap-1 font-sans bg-background"
                                disabled={testingModel === selected}
                                onClick={() => handleTestModel(selected)}
                              >
                                {testingModel === selected ? (
                                  <>
                                    <RefreshCw className="h-3 w-3 animate-spin" /> Testing…
                                  </>
                                ) : (
                                  <>
                                    <Zap className="h-3 w-3 text-amber-500" /> Test Connection
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>

                          {testResult[selected] && (
                            <div
                              className={`p-2 rounded text-xs flex items-start gap-2 border ${
                                testResult[selected].success
                                  ? "bg-green-500/10 text-green-700 dark:text-green-300 border-green-500/30"
                                  : "bg-red-500/10 text-red-700 dark:text-red-300 border-red-500/30"
                              }`}
                            >
                              {testResult[selected].success ? (
                                <CheckCircle2 className="h-4 w-4 shrink-0 text-green-600 mt-0.5" />
                              ) : (
                                <XCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                              )}
                              <div className="space-y-0.5 flex-1">
                                <div className="font-semibold font-sans">
                                  {testResult[selected].success ? "Model Online & Operational" : "Model Test Failed"}
                                </div>
                                <div>
                                  {testResult[selected].success
                                    ? `"${testResult[selected].responseText}"`
                                    : testResult[selected].error}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                size="lg"
                onClick={() => saveSettings()}
                disabled={isSaving}
                className="gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Saving assignments…" : "Save Model Assignments"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
