import { Landmark, FileSignature, type LucideIcon } from "lucide-react";

/**
 * The honest placeholder for a destination whose surface is not built yet
 * (task_plan.md Phase 7). The shell ships before the surfaces, and where the
 * journey is not covered the application says so explicitly — it never
 * renders an empty table as though the record were clean, and it never fakes
 * a surface. Deleted as each destination's real surface lands.
 */
type Destination = {
  icon: LucideIcon;
  kicker: string;
  title: string;
  whatWillLiveHere: string[];
  status: string;
};

const DESTINATIONS: Record<"authorities" | "signatures", Destination> = {
  authorities: {
    icon: Landmark,
    kicker: "WORK · SCHEDULED — TASK 7.5",
    title: "Authorities",
    whatWillLiveHere: [
      "Market surveillance engagements under CRA Chapter V — requests received, response deadlines, and what was provided.",
      "The NIS2 competent-authority relationship for the organisation's entity registration.",
      "The engagement API already exists (msa engagements); this surface is what makes it visible.",
    ],
    status:
      "This destination is being assembled in task 7.5. Until it ships, authority engagements recorded through the API are not visible in the UI — this page exists so that gap is stated rather than hidden.",
  },
  signatures: {
    icon: FileSignature,
    kicker: "WORK · SCHEDULED — TASK 7.5",
    title: "Signatures",
    whatWillLiveHere: [
      "The attestation ledger: who signed what, when, and over which exact bytes.",
      "The signatory's queue — documents awaiting signature, shown with exactly what is being attested to and what is still open.",
      "Provenance records (the P6 primitive) once the evidence-request flow lands.",
    ],
    status:
      "This destination is being assembled in task 7.5. Attestations recorded through the API are not visible in the UI until then — this page exists so that gap is stated rather than hidden.",
  },
};

export default function DestinationPlaceholder({ id }: { id: keyof typeof DESTINATIONS }) {
  const d = DESTINATIONS[id];
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-16">
      <span className="oxot-kicker block mb-2">{d.kicker}</span>
      <h1 className="text-3xl font-serif font-normal tracking-tight text-foreground flex items-center gap-3">
        <d.icon className="w-7 h-7 text-primary shrink-0" /> {d.title}
      </h1>

      <div className="mt-8 space-y-3">
        <h2 className="text-xs font-mono font-bold uppercase tracking-wider text-muted-foreground">
          What will live here
        </h2>
        <ul className="space-y-2">
          {d.whatWillLiveHere.map((line) => (
            <li key={line} className="text-sm text-foreground/90 leading-relaxed pl-4 border-l-2 border-border">
              {line}
            </li>
          ))}
        </ul>
      </div>

      <p className="mt-8 text-sm text-muted-foreground leading-relaxed border border-border/60 bg-muted/20 rounded-xl p-4">
        {d.status}
      </p>
    </div>
  );
}
