import { Cpu, Factory, ShieldCheck, ArrowRight, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * The value-chain positioning diagram — where each persona sits and which duty
 * it carries, with evidence flowing downstream. Theme-safe (design tokens via
 * Tailwind), responsive (a horizontal flow on md+, a vertical stack on mobile).
 * `highlight` rings the node for the page it is shown on. Labels are localizable.
 */
type NodeKey = 'supplier' | 'manufacturer' | 'operator';

const ICONS: Record<NodeKey, typeof Cpu> = {
  supplier: Cpu,
  manufacturer: Factory,
  operator: ShieldCheck,
};

export function SupplyChainDiagram({
  highlight,
  labels,
  flowLabel,
}: {
  highlight?: NodeKey;
  labels?: Record<NodeKey, { title: string; duty: string }>;
  flowLabel?: string;
}) {
  const L =
    labels ?? {
      supplier: { title: 'Component & IP supplier', duty: 'Publishes the assurance evidence' },
      manufacturer: { title: 'Manufacturer / integrator', duty: 'Carries the CRA · CE marks the product' },
      operator: { title: 'Operator / asset owner', duty: 'Holds the estate (NIS2 21(2)(d))' },
    };
  const flow = flowLabel ?? 'Evidence flows downstream — nobody hands off their own duty';
  const order: NodeKey[] = ['supplier', 'manufacturer', 'operator'];

  return (
    <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
      <div className="flex flex-col items-stretch gap-4 md:flex-row md:items-center md:justify-between">
        {order.map((key, i) => (
          <div key={key} className="flex flex-col items-stretch gap-4 md:flex-1 md:flex-row md:items-center">
            <Node nodeKey={key} title={L[key].title} duty={L[key].duty} highlighted={highlight === key} />
            {i < order.length - 1 && <Connector />}
          </div>
        ))}
      </div>
      <p className="mt-5 text-center text-xs text-muted-foreground">{flow}</p>
    </div>
  );
}

function Node({
  nodeKey,
  title,
  duty,
  highlighted,
}: {
  nodeKey: NodeKey;
  title: string;
  duty: string;
  highlighted?: boolean;
}) {
  const Icon = ICONS[nodeKey];
  return (
    <div
      className={cn(
        'flex w-full flex-col items-center rounded-xl border bg-background p-4 text-center md:flex-1',
        highlighted ? 'border-2 border-primary/50 bg-primary/[0.06]' : 'border-border',
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <p className="mt-2 text-sm font-medium text-foreground">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{duty}</p>
    </div>
  );
}

/** A downstream connector: a right arrow on md+, a down arrow when stacked. */
function Connector() {
  return (
    <div className="flex shrink-0 items-center justify-center text-primary/60" aria-hidden="true">
      <ArrowDown className="h-4 w-4 md:hidden" />
      <ArrowRight className="hidden h-4 w-4 md:block" />
    </div>
  );
}
