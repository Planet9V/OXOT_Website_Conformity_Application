import { useId } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import { humanizeKey } from "@/lib/section-templates";

type Json = unknown;

function blankLike(value: Json): Json {
  if (Array.isArray(value)) return value.length ? [blankLike(value[0])] : [];
  if (value && typeof value === "object") {
    const out: Record<string, Json> = {};
    for (const [k, v] of Object.entries(value)) out[k] = blankLike(v);
    return out;
  }
  if (typeof value === "boolean") return false;
  if (typeof value === "number") return 0;
  return "";
}

function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: React.ReactNode }) {
  return (
    <Label htmlFor={htmlFor} className="text-xs font-medium text-muted-foreground">
      {children}
    </Label>
  );
}

function FieldEditor({
  label,
  value,
  onChange,
  depth,
}: {
  label: string;
  value: Json;
  onChange: (next: Json) => void;
  depth: number;
}) {
  // Associate the label with its control so screen readers announce the
  // field by name (labels and inputs here are generated per JSON key).
  const id = useId();

  if (typeof value === "boolean") {
    return (
      <div className="flex items-center justify-between gap-3 py-1">
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        <Switch id={id} checked={value} onCheckedChange={onChange} />
      </div>
    );
  }

  if (typeof value === "number") {
    return (
      <div className="space-y-1">
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        <Input
          id={id}
          type="number"
          value={value}
          onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
        />
      </div>
    );
  }

  if (typeof value === "string" || value === null || value === undefined) {
    const str = (value ?? "") as string;
    const multiline = str.length > 60 || str.includes("\n");
    return (
      <div className="space-y-1">
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        {multiline ? (
          <Textarea id={id} rows={3} value={str} onChange={(e) => onChange(e.target.value)} />
        ) : (
          <Input id={id} value={str} onChange={(e) => onChange(e.target.value)} />
        )}
      </div>
    );
  }

  if (Array.isArray(value)) {
    return <ArrayEditor label={label} value={value} onChange={onChange} depth={depth} />;
  }

  return (
    <div className="space-y-2">
      <FieldLabel>{label}</FieldLabel>
      <div className="space-y-3 rounded-md border border-dashed p-3">
        <ObjectFields value={value as Record<string, Json>} onChange={onChange} depth={depth + 1} />
      </div>
    </div>
  );
}

function ArrayEditor({
  label,
  value,
  onChange,
  depth,
}: {
  label: string;
  value: Json[];
  onChange: (next: Json[]) => void;
  depth: number;
}) {
  const first = value[0];
  const isObjectArray = first !== null && typeof first === "object";

  const update = (i: number, next: Json) => {
    const copy = value.slice();
    copy[i] = next;
    onChange(copy);
  };
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const add = () => onChange([...value, value.length ? blankLike(value[0]) : ""]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <FieldLabel>{label}</FieldLabel>
        <Button type="button" variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={add}>
          <Plus className="h-3 w-3" /> Add
        </Button>
      </div>

      {value.length === 0 && <p className="text-xs text-muted-foreground">No items yet.</p>}

      <div className="space-y-2">
        {value.map((item, i) => (
          <div key={i} className="rounded-md border bg-muted/20 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                {isObjectArray ? `Item ${i + 1}` : ""}
              </span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                onClick={() => remove(i)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
            {isObjectArray ? (
              <ObjectFields
                value={item as Record<string, Json>}
                onChange={(next) => update(i, next)}
                depth={depth + 1}
              />
            ) : (
              <Input
                aria-label={`${label} item ${i + 1}`}
                value={(item ?? "") as string}
                onChange={(e) => update(i, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ObjectFields({
  value,
  onChange,
  depth = 0,
}: {
  value: Record<string, Json>;
  onChange: (next: Record<string, Json>) => void;
  depth?: number;
}) {
  return (
    <div className="space-y-3">
      {Object.entries(value).map(([key, val]) => (
        <FieldEditor
          key={key}
          label={humanizeKey(key)}
          value={val}
          onChange={(next) => onChange({ ...value, [key]: next })}
          depth={depth}
        />
      ))}
    </div>
  );
}
