/**
 * Applied-standards ledger editor (Art 32) — lives on the wizard's route step.
 *
 * Records which harmonised standards / common specifications / certification
 * schemes the manufacturer applies and whether coverage is full or partial.
 * That claim decides whether Module A self-assessment is legally available to
 * a Class I important product (Art 32(2)) and is what the Declaration of
 * Conformity cites verbatim in its standards section.
 */
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSaveConformityStandards } from "@workspace/api-client-react";
import type { AppliedStandard } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, BookMarked } from "lucide-react";
import {
  STANDARDS_CATALOG,
  type StandardSuggestion,
} from "@/components/conformity/standards-catalog";

type Row = {
  reference: string;
  title: string;
  coverage: "full" | "partial";
  notes: string;
};

const toRows = (standards: AppliedStandard[]): Row[] =>
  standards.map((s) => ({
    reference: s.reference,
    title: s.title ?? "",
    coverage: s.coverage,
    notes: s.notes ?? "",
  }));

const toPayload = (rows: Row[]): AppliedStandard[] =>
  rows.map((r) => ({
    reference: r.reference.trim(),
    ...(r.title.trim() ? { title: r.title.trim() } : {}),
    coverage: r.coverage,
    ...(r.notes.trim() ? { notes: r.notes.trim() } : {}),
  }));

function matchSuggestions(query: string): StandardSuggestion[] {
  const q = query.trim().toLowerCase();
  if (!q) return STANDARDS_CATALOG;
  // Once the field holds an exact catalogue reference there is nothing left to
  // suggest — hide the list instead of overlaying the controls below.
  if (STANDARDS_CATALOG.some((s) => s.reference.toLowerCase() === q)) return [];
  return STANDARDS_CATALOG.filter(
    (s) =>
      s.reference.toLowerCase().includes(q) || s.title.toLowerCase().includes(q),
  );
}

/**
 * Reference typeahead: a free-text input that suggests curated CRA-relevant
 * standards while focused. Picking a suggestion fills reference + title;
 * anything typed is still accepted verbatim (the API stays free-text).
 */
function ReferenceCombobox({
  idx,
  value,
  disabled,
  onChangeReference,
  onPick,
}: {
  idx: number;
  value: string;
  disabled?: boolean;
  onChangeReference: (reference: string) => void;
  onPick: (s: StandardSuggestion) => void;
}) {
  const [open, setOpen] = useState(false);
  const suggestions = matchSuggestions(value);

  return (
    <div className="relative">
      <Input
        data-testid={`standard-reference-${idx}`}
        className="rounded-md h-8 text-xs"
        placeholder="Reference, e.g. EN 18031-1:2024"
        value={value}
        disabled={disabled}
        role="combobox"
        aria-expanded={open && suggestions.length > 0}
        autoComplete="off"
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
        onChange={(e) => {
          onChangeReference(e.target.value);
          setOpen(true);
        }}
      />
      {open && suggestions.length > 0 && (
        <ul
          data-testid={`standard-suggestions-${idx}`}
          role="listbox"
          aria-label="Suggested standards"
          className="absolute z-50 top-full left-0 right-0 mt-1 max-h-56 overflow-y-auto border border-border bg-popover shadow-md"
        >
          {suggestions.map((s) => (
            <li key={s.reference} role="option" aria-selected={s.reference === value}>
              <button
                type="button"
                className="w-full text-left px-2.5 py-1.5 hover:bg-muted/60 focus:bg-muted/60 focus:outline-none"
                // onMouseDown so the pick lands before the input's blur closes the list.
                onMouseDown={(e) => {
                  e.preventDefault();
                  onPick(s);
                  setOpen(false);
                }}
              >
                <span className="block text-xs font-medium">{s.reference}</span>
                <span className="block text-[11px] text-muted-foreground leading-snug">
                  {s.title}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function StandardsEditor({
  assessmentId,
  standards,
  disabled,
}: {
  assessmentId: number;
  standards: AppliedStandard[];
  disabled?: boolean;
}) {
  const qc = useQueryClient();
  const [rows, setRows] = useState<Row[]>(() => toRows(standards));
  const save = useSaveConformityStandards({
    mutation: { onSuccess: () => qc.invalidateQueries() },
  });

  const patch = (idx: number, part: Partial<Row>) =>
    setRows((rs) => rs.map((r, i) => (i === idx ? { ...r, ...part } : r)));

  const hasEmptyReference = rows.some((r) => !r.reference.trim());
  const dirty =
    JSON.stringify(toPayload(rows)) !== JSON.stringify(toPayload(toRows(standards)));

  return (
    <div data-testid="standards-editor" className="border border-border bg-muted/20 p-4 space-y-3">
      <div className="flex items-start gap-2">
        <BookMarked className="w-4 h-4 mt-0.5 text-muted-foreground shrink-0" />
        <div className="space-y-0.5">
          <div className="text-sm font-medium leading-snug">Applied standards (Art 32)</div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Record each harmonised standard, common specification or certification scheme you
            apply, and whether it is applied in full. These are cited verbatim in the Declaration
            of Conformity — and full coverage is what unlocks self-assessment for Class I
            important products.
          </p>
        </div>
      </div>

      {rows.length === 0 && (
        <p className="text-xs text-muted-foreground italic">No standards on record yet.</p>
      )}

      {rows.map((row, idx) => (
        <div key={idx} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_130px_auto] gap-2 items-start">
          <ReferenceCombobox
            idx={idx}
            value={row.reference}
            disabled={disabled}
            onChangeReference={(reference) => patch(idx, { reference })}
            onPick={(s) => patch(idx, { reference: s.reference, title: s.title })}
          />
          <Input
            data-testid={`standard-title-${idx}`}
            className="rounded-md h-8 text-xs"
            placeholder="Title (optional)"
            value={row.title}
            disabled={disabled}
            onChange={(e) => patch(idx, { title: e.target.value })}
          />
          <Select
            value={row.coverage}
            disabled={disabled}
            onValueChange={(v) => patch(idx, { coverage: v as Row["coverage"] })}
          >
            <SelectTrigger
              data-testid={`standard-coverage-${idx}`}
              className="rounded-md h-8 text-xs"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full">Applied in full</SelectItem>
              <SelectItem value="partial">Partially applied</SelectItem>
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="rounded-md h-8 px-2"
            disabled={disabled}
            aria-label={`Remove standard ${row.reference || idx + 1}`}
            onClick={() => setRows((rs) => rs.filter((_, i) => i !== idx))}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
          <Input
            data-testid={`standard-notes-${idx}`}
            className="rounded-md h-8 text-xs sm:col-span-4"
            placeholder="Notes on coverage (optional)"
            value={row.notes}
            disabled={disabled}
            onChange={(e) => patch(idx, { notes: e.target.value })}
          />
        </div>
      ))}

      <div className="flex flex-wrap gap-2 pt-1">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-md"
          data-testid="standards-add"
          disabled={disabled}
          onClick={() =>
            setRows((rs) => [...rs, { reference: "", title: "", coverage: "full", notes: "" }])
          }
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          Add standard
        </Button>
        <Button
          type="button"
          size="sm"
          className="rounded-md"
          data-testid="standards-save"
          disabled={disabled || save.isPending || hasEmptyReference || !dirty}
          onClick={() =>
            save.mutate({ id: assessmentId, data: { standards: toPayload(rows) } })
          }
        >
          {save.isPending ? "Saving…" : "Save standards"}
        </Button>
        {hasEmptyReference && (
          <span className="text-xs text-muted-foreground self-center">
            Every standard needs a reference before saving.
          </span>
        )}
      </div>
    </div>
  );
}
