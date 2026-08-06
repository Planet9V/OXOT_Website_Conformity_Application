import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

/**
 * Standard OXOT page header (styleguide "Page header" pattern): orange kicker
 * eyebrow, serif title with a primary-colored icon, and a 3–5 sentence
 * description. Mirrors the conformity workbench's main-page headers.
 */
export function PageHeader({
  kicker,
  title,
  description,
  icon: Icon,
  actions,
}: {
  kicker: string;
  title: string;
  description: string;
  icon?: LucideIcon;
  actions?: ReactNode;
}) {
  return (
    <header className="mb-10 border-b border-border pb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <span className="oxot-kicker block mb-2">{kicker}</span>
        <h1 className="font-display text-4xl md:text-5xl font-normal tracking-tight text-foreground flex items-center gap-3">
          {Icon && <Icon className="w-8 h-8 text-primary shrink-0" aria-hidden="true" />}
          {title}
        </h1>
        <p className="mt-4 max-w-3xl text-base md:text-lg leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-3 shrink-0">{actions}</div>}
    </header>
  );
}
