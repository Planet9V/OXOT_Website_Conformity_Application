import { Cloud, HardDrive, Container, MonitorSmartphone, Lock } from 'lucide-react';

/**
 * The deployment diagram (Phase 26) — a hub-and-spoke: one single-tenant,
 * local-AI core, reached four ways. Theme-safe (design tokens via Tailwind
 * fill-/stroke- utilities and currentColor); scales with its container.
 */
const MODES = [
  { icon: Cloud, label: 'AWS European Sovereign Cloud', sub: 'EU data residency' },
  { icon: HardDrive, label: 'Hardware appliance', sub: 'delivered, pre-installed' },
  { icon: Container, label: 'Docker', sub: 'on your infrastructure' },
  { icon: MonitorSmartphone, label: 'Virtual machine', sub: 'in your hypervisor' },
];

export function DeploymentDiagram({ labels }: { labels?: { core: string; coreSub: string } }) {
  const core = labels?.core ?? 'Your single-tenant instance';
  const coreSub = labels?.coreSub ?? 'Local AI · your data never leaves';
  return (
    <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
      <div className="grid items-center gap-6 md:grid-cols-[1fr_auto_1fr]">
        {/* Left two modes */}
        <div className="grid gap-4">
          {MODES.slice(0, 2).map((m) => (
            <ModeNode key={m.label} {...m} align="right" />
          ))}
        </div>

        {/* Core */}
        <div className="mx-auto flex w-full max-w-[16rem] flex-col items-center rounded-2xl border-2 border-primary/40 bg-primary/[0.06] p-5 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <p className="mt-3 font-display text-base font-normal tracking-tight text-foreground">{core}</p>
          <p className="mt-1 text-xs text-muted-foreground">{coreSub}</p>
        </div>

        {/* Right two modes */}
        <div className="grid gap-4">
          {MODES.slice(2, 4).map((m) => (
            <ModeNode key={m.label} {...m} align="left" />
          ))}
        </div>
      </div>
    </div>
  );
}

function ModeNode({
  icon: Icon,
  label,
  sub,
  align,
}: {
  icon: typeof Cloud;
  label: string;
  sub: string;
  align: 'left' | 'right';
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-xl border border-border bg-background p-4 ${
        align === 'right' ? 'md:flex-row-reverse md:text-right' : ''
      }`}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
      </div>
    </div>
  );
}
