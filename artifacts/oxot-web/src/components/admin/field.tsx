import { cloneElement, isValidElement, useId } from "react";
import { Label } from "@/components/ui/label";

/**
 * Shared admin form field wrapper: associates the label (and optional hint)
 * with the wrapped control so screen readers announce the field by name and
 * Playwright's getByLabel resolves it.
 *
 * - Pass a single element child (Input/Textarea/...) and it is cloned with
 *   the generated `id` and `aria-describedby`.
 * - For composite controls (e.g. Radix Select), pass a render function and
 *   apply the id to the focusable trigger yourself: {(id) => <Select>...<SelectTrigger id={id}>...}
 */
export function Field({
  label,
  hint,
  className = "space-y-1.5",
  labelClassName,
  children,
}: {
  label: React.ReactNode;
  hint?: string;
  className?: string;
  labelClassName?: string;
  children: React.ReactNode | ((id: string) => React.ReactNode);
}) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const control =
    typeof children === "function"
      ? children(id)
      : isValidElement(children)
        ? cloneElement(children as React.ReactElement<{ id?: string; "aria-describedby"?: string }>, {
            id,
            "aria-describedby": hintId,
          })
        : children;
  return (
    <div className={className}>
      <Label htmlFor={id} className={labelClassName}>
        {label}
      </Label>
      {control}
      {hint && (
        <p id={hintId} className="text-xs text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}
