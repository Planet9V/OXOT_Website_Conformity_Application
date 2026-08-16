import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { FileSignature } from "lucide-react";

/**
 * The Signatures destination (task 7.5) — the provenance ledger (P6).
 *
 * Read-only by design: this surface answers "who stood behind what, when,
 * over exactly which bytes" — it never signs. The one signature with legal
 * weight (the EU declaration of conformity, CRA Art. 28 / Annex V) is made in
 * the assessment workbench, where the sign flow refuses an incomplete
 * declaration or an unrecorded authority to bind. That refusal logic must
 * stay next to the document it protects, not be duplicated here.
 */

interface Attestation {
  id: number;
  kind: string;
  subject: string;
  actor: string;
  statement: string;
  contentDigest: string;
  attestedAt: string;
}

const KIND_TONE: Record<string, string> = {
  declaration_signed: "bg-primary/10 text-primary border-primary/30",
  determination_recorded: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  artifact_generated: "bg-muted text-muted-foreground",
};

export default function SignaturesPage() {
  const { data, isLoading, isError } = useQuery<{
    total: number;
    cap: number;
    attestations: Attestation[];
  }>({
    queryKey: ["/api/conformity/attestations"],
    queryFn: async () => {
      const res = await fetch("/api/conformity/attestations");
      if (!res.ok) throw new Error(`Could not load the ledger (HTTP ${res.status})`);
      return res.json();
    },
  });

  const rows = data?.attestations ?? [];

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="border-b border-border pb-6">
        <span className="oxot-kicker block mb-1">WORK · PROVENANCE LEDGER</span>
        <h1 className="text-3xl sm:text-4xl font-serif font-normal tracking-tight text-foreground flex items-center gap-2.5">
          <FileSignature className="w-6 h-6 text-primary shrink-0" /> Signatures
        </h1>
        <p className="text-sm text-muted-foreground mt-1 max-w-3xl">
          Who stood behind what, when, and over exactly which bytes. Signing itself
          happens where the document lives: the EU declaration of conformity
          (CRA Art. 28) is signed from its assessment workbench, which refuses an
          incomplete declaration rather than warning about it.
        </p>
      </div>

      {isLoading ? (
        <Skeleton className="h-48 w-full rounded-2xl" />
      ) : isError ? (
        <Card className="rounded-2xl border-destructive/40">
          <CardContent className="p-6 text-sm text-destructive">
            The ledger could not be loaded. No attestation is assumed to exist.
          </CardContent>
        </Card>
      ) : rows.length === 0 ? (
        <Card className="rounded-2xl border border-dashed">
          <CardContent className="p-10 text-center text-sm text-muted-foreground">
            The ledger is empty. Attestations appear here when artifacts are generated,
            determinations are recorded, or the EU declaration of conformity is signed.
          </CardContent>
        </Card>
      ) : (
        <>
          <p className="text-xs font-mono text-muted-foreground">
            {data!.total} attestation{data!.total === 1 ? "" : "s"}
            {data!.total === data!.cap ? ` (showing the newest ${data!.cap})` : ""}
          </p>
          <ul className="space-y-2" data-testid="signatures-ledger">
            {rows.map((a) => (
              <li key={a.id} className="rounded-xl border border-border/70 bg-card px-4 py-3">
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <div className="min-w-0 flex items-baseline gap-2.5">
                    <Badge
                      variant="outline"
                      className={`font-mono text-[10px] shrink-0 ${KIND_TONE[a.kind] ?? "bg-muted text-muted-foreground"}`}
                    >
                      {a.kind.replaceAll("_", " ")}
                    </Badge>
                    <span className="font-mono text-xs text-muted-foreground truncate">{a.subject}</span>
                  </div>
                  <div className="flex items-baseline gap-3 shrink-0 font-mono text-[11px] text-muted-foreground">
                    <span>{a.actor}</span>
                    <time>{a.attestedAt.slice(0, 16).replace("T", " ")}</time>
                  </div>
                </div>
                {a.statement && (
                  <p className="mt-1 text-xs text-foreground/85 leading-relaxed">{a.statement}</p>
                )}
                <p className="mt-1 font-mono text-[10px] text-muted-foreground/70">
                  sha-256 {a.contentDigest.slice(0, 20)}…
                </p>
              </li>
            ))}
          </ul>
        </>
      )}

      <p className="text-xs text-muted-foreground">
        To verify a document against its attestations, open it in its{" "}
        <Link href="/products" className="text-primary hover:underline">
          product's workbench
        </Link>
        {" "}— verification re-renders the current content and checks it against what was
        attested, reporting an edited document and a tampered record separately.
      </p>
    </div>
  );
}
