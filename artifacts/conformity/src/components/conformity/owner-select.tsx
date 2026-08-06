import { useMemo } from "react";
import { useListConformityTeam } from "@workspace/api-client-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const UNASSIGNED = "__unassigned__";

/**
 * Owner assignment picker fed by the team directory (active named assessors).
 * Owners are stored as member USERNAMES; the picker shows display names.
 * A legacy free-text owner value (pre-directory data) still renders as its own
 * option so opening the dialog never silently discards it.
 */
export function OwnerSelect({
  id,
  value,
  onChange,
  testId = "owner-select",
  disabled,
}: {
  id?: string;
  value: string;
  onChange: (owner: string) => void;
  testId?: string;
  disabled?: boolean;
}) {
  const { data: team } = useListConformityTeam();

  const options = useMemo(() => {
    const opts = (team ?? []).map((m) => ({ value: m.username, label: m.displayName }));
    if (value && !opts.some((o) => o.value === value)) {
      opts.push({ value, label: value });
    }
    return opts;
  }, [team, value]);

  return (
    <Select
      value={value || UNASSIGNED}
      onValueChange={(v) => onChange(v === UNASSIGNED ? "" : v)}
      disabled={disabled}
    >
      <SelectTrigger id={id} className="rounded-md" data-testid={testId}>
        <SelectValue placeholder="Unassigned" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={UNASSIGNED}>Unassigned</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
