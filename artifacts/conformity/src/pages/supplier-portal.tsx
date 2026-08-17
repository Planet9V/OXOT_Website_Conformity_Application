import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Factory, CheckCircle2, ShieldAlert } from "lucide-react";

/**
 * The supplier door (21.4) — a public, token-scoped page where a supplier
 * answers one specific ask ("send us the DoC for this product"). Mirrors the
 * auditor portal: the token is the whole identity, it expires, and it can be
 * withdrawn. Submissions can attach a FILE (22.1 — same size cap and
 * file-type allow-list as the internal flow; SECURITY REVIEW of this public
 * write surface is a tracked open item), a LINK, and/or a NOTE.
 */

type Workspace = {
  organisationAsking: string;
  supplierName: string;
  productName: string;
  docType: string;
  message: string;
  status: string;
  expiresAt: string;
};

const DOC_TYPE_LABEL: Record<string, string> = {
  declaration_of_conformity: "EU declaration of conformity",
  user_information: "Annex II information & instructions",
  support_period_statement: "Support-period statement",
  security_advisory_channel: "Security advisory / PSIRT channel",
  sbom: "SBOM",
  other: "Document",
};

export default function SupplierPortalPage() {
  const token =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("token") ?? ""
      : "";
  const [state, setState] = useState<"loading" | "invalid" | "ready" | "done">("loading");
  const [ws, setWs] = useState<Workspace | null>(null);
  const [url, setUrl] = useState("");
  const [note, setNote] = useState("");
  const [email, setEmail] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setState("invalid");
      return;
    }
    fetch(`/api/conformity/supplier-portal/workspace?token=${encodeURIComponent(token)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error();
        const body = (await res.json()) as Workspace;
        setWs(body);
        setState(body.status === "fulfilled" ? "done" : "ready");
      })
      .catch(() => setState("invalid"));
  }, [token]);

  const submit = async () => {
    setSubmitting(true);
    setError("");
    try {
      // Attach the file first, when one was picked: mint a one-time upload
      // URL scoped to this token, PUT the bytes, then submit its objectPath.
      let objectPath = "";
      let fileName = "";
      if (file) {
        const minted = await fetch("/api/conformity/supplier-portal/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            name: file.name,
            size: file.size,
            contentType: file.type || "application/octet-stream",
          }),
        });
        const mintedBody = await minted.json().catch(() => ({}));
        if (!minted.ok) throw new Error(mintedBody.error || "Upload refused");
        const put = await fetch(mintedBody.uploadURL, {
          method: "PUT",
          headers: { "Content-Type": file.type || "application/octet-stream" },
          body: file,
        });
        if (!put.ok) throw new Error("Upload failed — try again with a fresh page.");
        objectPath = mintedBody.objectPath;
        fileName = file.name;
      }
      const res = await fetch("/api/conformity/supplier-portal/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          url: url.trim(),
          note: note.trim(),
          objectPath,
          fileName,
          submitterEmail: email.trim(),
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error || "Submission failed");
      setState("done");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-start justify-center px-4 py-16">
      <Card className="rounded-2xl border border-border shadow-sm max-w-xl w-full">
        <CardHeader className="border-b pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Factory className="h-5 w-5 text-primary" /> Supplier evidence request
          </CardTitle>
          <CardDescription className="text-xs">
            A customer of yours uses this system to keep a per-product record of the
            documents the EU Cyber Resilience Act obliges manufacturers to provide.
            This page answers one specific request. Nothing here assesses you — it
            files what you send.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-4 space-y-4 text-sm">
          {state === "loading" && <p className="text-muted-foreground">Loading…</p>}

          {state === "invalid" && (
            <p className="flex items-start gap-2 text-muted-foreground">
              <ShieldAlert className="w-4 h-4 mt-0.5 shrink-0 text-amber-500" />
              This link is not valid or has expired. Ask your contact for a fresh one.
            </p>
          )}

          {state === "done" && (
            <p className="flex items-start gap-2 text-foreground" data-testid="door-done">
              <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0 text-emerald-500" />
              Received — thank you. Your submission is on the product's file. You can
              close this page.
            </p>
          )}

          {state === "ready" && ws && (
            <>
              <div className="space-y-1">
                <p>
                  <span className="text-muted-foreground">Requested of:</span>{" "}
                  <span className="font-medium text-foreground">{ws.supplierName}</span>
                </p>
                <p>
                  <span className="text-muted-foreground">For the product:</span>{" "}
                  <span className="font-medium text-foreground">{ws.productName}</span>
                </p>
                <p className="flex items-center gap-2">
                  <span className="text-muted-foreground">Requested document:</span>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {DOC_TYPE_LABEL[ws.docType] ?? ws.docType}
                  </Badge>
                </p>
                {ws.message && (
                  <p className="text-muted-foreground border-l-2 border-border pl-3 mt-2">
                    “{ws.message}”
                  </p>
                )}
                <p className="text-[11px] font-mono text-muted-foreground pt-1">
                  This link is valid until {ws.expiresAt.slice(0, 10)}.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <input
                  ref={fileInput}
                  type="file"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => fileInput.current?.click()}
                  data-testid="door-file"
                >
                  {file ? `Attached: ${file.name}` : "Attach the document (PDF, Office, image or data file)"}
                </Button>
                <Input
                  placeholder="…or a link to the document (https://…)"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  data-testid="door-url"
                />
                <Textarea
                  placeholder="Or answer in text (e.g. the support-period end date), and anything your customer should know."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="text-sm"
                  rows={3}
                />
                <Input
                  placeholder="Your email (optional — so the record names its sender)"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <p className="text-[11px] text-muted-foreground">
                  Files up to 50 MB: PDF, Office documents, images, or data files
                  (JSON, CSV, XML, TXT). A link or a text answer works too.
                </p>
                {error && <p className="text-xs text-destructive">{error}</p>}
                <Button
                  className="w-full"
                  disabled={submitting || (!file && !url.trim() && !note.trim())}
                  onClick={submit}
                  data-testid="door-submit"
                >
                  {submitting ? "Submitting…" : "Submit to the product file"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
