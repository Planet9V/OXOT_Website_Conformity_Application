import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Shield, FileText, Lock, AlertCircle, CheckCircle, MessageSquare, Building, Scale, ArrowLeft } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function AuditorPortalPage() {
  const [, navigate] = useLocation();
  const [token, setToken] = useState<string>("");
  const [workspaceData, setWorkspaceData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // RFI Submission Form State
  const [rfiQuestion, setRfiQuestion] = useState("");
  const [rfiSeverity, setRfiSeverity] = useState("rfi");
  const [submittingRfi, setSubmittingRfi] = useState(false);
  const [rfiSuccess, setRfiSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Check URL search params for token
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    if (t) {
      setToken(t);
      fetchAuditorWorkspace(t);
    }
  }, []);

  const fetchAuditorWorkspace = async (accessToken: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/conformity/auditor/workspace?token=${encodeURIComponent(accessToken)}`);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to authenticate auditor token");
      }
      const data = await res.json();
      setWorkspaceData(data);
    } catch (err: any) {
      setError(err.message || "Invalid or expired auditor token");
    } finally {
      setLoading(false);
    }
  };

  const handleRfiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rfiQuestion.trim() || !token) return;
    setSubmittingRfi(true);
    setRfiSuccess(null);
    try {
      const res = await fetch("/api/conformity/auditor/rfis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Auditor-Token": token,
        },
        body: JSON.stringify({
          question: rfiQuestion,
          severity: rfiSeverity,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit RFI");
      }

      setRfiSuccess("Request for Information submitted successfully.");
      setRfiQuestion("");
      fetchAuditorWorkspace(token); // Refresh list
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmittingRfi(false);
    }
  };

  if (!token && !workspaceData) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-card border-border text-card-foreground shadow-sm">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mb-2">
              <Scale className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-serif font-normal">Notified Body Auditor Portal</CardTitle>
            <CardDescription className="text-muted-foreground font-sans">
              EU Cyber Resilience Act (CRA) Module B/H Audit Access
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="oxot-kicker block">Access Token</label>
              <Input
                type="text"
                placeholder="Enter your auditor access UUID token..."
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="bg-background border-input text-foreground font-mono text-xs"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold cta-lift shadow-sm"
              onClick={() => fetchAuditorWorkspace(token)}
              disabled={!token.trim() || loading}
            >
              {loading ? "Verifying Token..." : "Access Audit Workspace"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <span className="oxot-kicker block mb-1">
            NOTIFIED BODY #{workspaceData?.auditor?.number || "0035"} · {workspaceData?.auditor?.notifiedBody || "TÜV Rheinland LGA Products GmbH"}
          </span>
          <h1 className="text-3xl sm:text-4xl font-serif font-normal tracking-tight text-foreground">CRA Technical Documentation Review</h1>
          <p className="text-sm text-muted-foreground mt-1 font-sans">
            Product: <span className="text-foreground font-semibold">{workspaceData?.product?.name}</span> ({workspaceData?.product?.manufacturerName})
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="border-cyan-500/30 text-cyan-400 bg-cyan-950/20 px-3 py-1">
            Module {workspaceData?.assessment?.module?.toUpperCase()}
          </Badge>
          <Button variant="ghost" size="sm" onClick={() => setWorkspaceData(null)} className="text-slate-400 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-1" /> Exit Portal
          </Button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid md:grid-cols-3 gap-8">
        {/* Evidence & Technical File List */}
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-slate-900 border-slate-800 text-slate-100">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" /> Annex VII Technical Documentation Evidence
              </CardTitle>
              <CardDescription className="text-slate-400">
                Uploaded audit packages backed by server-side SHA-256 cryptographic hashes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {workspaceData?.evidence?.map((item: any) => (
                <div key={item.id} className="p-4 rounded-md bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-slate-100">{item.title}</h4>
                      <p className="text-xs text-slate-400">Requirement Ref: {item.requirementRefCode || "General Product Evidence"}</p>
                    </div>
                    <Badge className="bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-[10px]">
                      Verified SHA-256
                    </Badge>
                  </div>
                  {item.fileHash && (
                    <div className="font-mono text-[11px] text-slate-500 truncate bg-slate-900 p-1.5 rounded">
                      SHA-256: {item.fileHash}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Auditor RFI & Finding Submission */}
        <div className="space-y-6">
          <Card className="bg-slate-900 border-slate-800 text-slate-100">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-400" /> Submit RFI / Non-Conformity
              </CardTitle>
              <CardDescription className="text-slate-400">
                Issue a formal query or finding to the manufacturer.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRfiSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 uppercase">Finding Severity</label>
                  <select
                    value={rfiSeverity}
                    onChange={(e) => setRfiSeverity(e.target.value)}
                    className="w-full rounded-md bg-slate-950 border border-slate-800 text-slate-100 p-2 text-sm"
                  >
                    <option value="rfi">Request for Information (RFI)</option>
                    <option value="non_conformity">Major Non-Conformity</option>
                    <option value="observation">Audit Observation</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300 uppercase">Finding Query</label>
                  <Textarea
                    rows={4}
                    placeholder="Describe the clarification or finding..."
                    value={rfiQuestion}
                    onChange={(e) => setRfiQuestion(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-slate-100 text-sm"
                  />
                </div>

                {rfiSuccess && <p className="text-xs text-emerald-400">{rfiSuccess}</p>}

                <Button
                  type="submit"
                  className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold"
                  disabled={submittingRfi || !rfiQuestion.trim()}
                >
                  {submittingRfi ? "Submitting..." : "Submit Auditor Finding"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
