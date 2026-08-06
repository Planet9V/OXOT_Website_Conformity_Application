import { useState, useRef, useEffect } from 'react';
import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, Scale, ArrowUpRight, Clock } from 'lucide-react';
import { useGetConformitySummary, useListRegulations } from '@workspace/api-client-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useSeo } from '@/hooks/use-seo';
import { regBgStyle, regTextStyle } from '@/lib/reg-colors';
import { cn } from '@/lib/utils';

// ─── TOC sections ──────────────────────────────────────────────────────────────
const TOC = [
  { id: 'how-pieces-fit',  label: 'How the pieces fit' },
  { id: 'the-frameworks',  label: 'The frameworks' },
  { id: 'who-answers',     label: 'Who answers to what' },
  { id: 'why-one',         label: 'Why it pays to treat them as one' },
  { id: 'how-oxot-helps',  label: 'How OXOT helps' },
  { id: 'all-frameworks',  label: 'Regulation cards' },
];

// ─── Role filter pills ─────────────────────────────────────────────────────────
type Role = {
  id: string;
  label: string;
  frameworks: string[]; // regulation keys that apply
};

const ROLES: Role[] = [
  { id: 'operator',  label: 'I operate an essential / important service',        frameworks: ['nis2', 'iec'] },
  { id: 'product',   label: 'I make products with digital elements',             frameworks: ['cra', 'ai-act', 'iec'] },
  { id: 'machinery', label: 'I build or integrate machinery',                    frameworks: ['machinery', 'cra', 'iec'] },
  { id: 'ai',        label: 'I deploy AI in a safety / high-risk role',          frameworks: ['ai-act', 'cra'] },
  { id: 'rail',      label: 'I operate or supply railways',                      frameworks: ['nis2', 'iec', 'cra'] },
];

// framework → human label mapping for the role summary
const FRAMEWORK_LABELS: Record<string, string> = {
  cra:      'Cyber Resilience Act',
  nis2:     'NIS2 Directive',
  'ai-act': 'EU AI Act',
  iec:      'IEC 62443',
  machinery:'Machinery Regulation',
  red:      'Radio Equipment Directive',
  gdpr:     'GDPR',
};

// ─── Regulation card ───────────────────────────────────────────────────────────
function RegCard({ reg, highlighted }: { reg: any; highlighted: boolean }) {
  return (
    <Link href={`/frameworks/${reg.key}`} className="group block h-full">
      <div
        className={cn(
          'h-full p-6 md:p-8 rounded-2xl border shadow-sm transition-all flex flex-col gap-5',
          highlighted
            ? 'bg-primary/10 border-primary/40 shadow-primary/10'
            : 'bg-card border-border/50 hover:shadow-md hover:border-primary/20',
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <span
            className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold text-white"
            style={regBgStyle(reg.key)}
          >
            {reg.shortName}
          </span>
          <span className="text-xs text-muted-foreground font-medium pt-0.5">{reg.jurisdiction}</span>
        </div>

        <div>
          <h3 className="text-lg font-display font-semibold text-foreground mb-2 group-hover:text-primary transition-colors leading-snug">
            {reg.name}
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">{reg.summary}</p>
        </div>

        <div className="mt-auto flex items-center justify-between pt-4 border-t border-border/40">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Scale className="w-3.5 h-3.5" />
            <span>{reg.requirementCount} requirements</span>
          </div>
          {reg.inForceDate && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <span>{reg.inForceDate.slice(0, 4)}</span>
            </div>
          )}
          <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </div>
    </Link>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function FrameworksPage() {
  useSeo({
    title: 'European Frameworks for OT Security — OXOT',
    description:
      'Navigate AI Act, CRA, NIS2, Machinery Regulation and IEC 62443 for OT. A structured reference covering every major EU cybersecurity obligation relevant to operational technology.',
  });

  const { data: summary } = useGetConformitySummary();
  const { data: regulations, isLoading } = useListRegulations();

  const [activeSection, setActiveSection] = useState('how-pieces-fit');
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  // Scroll spy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        }
      },
      { rootMargin: '-20% 0px -70% 0px', threshold: 0 },
    );
    TOC.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const highlightedKeys = selectedRole
    ? ROLES.find((r) => r.id === selectedRole)?.frameworks ?? []
    : [];

  const selectedRoleData = selectedRole ? ROLES.find((r) => r.id === selectedRole) : null;

  return (
    <div className="w-full">
      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-28 pb-12 md:pt-36 md:pb-16 border-b border-border/40">
        {/* subtle grid bg */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000_60%,transparent_100%)] pointer-events-none -z-10 opacity-20 dark:opacity-10" />
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[600px] h-[600px] bg-primary/8 rounded-full blur-3xl pointer-events-none -z-10" />

        <div className="container mx-auto px-4 md:px-8 max-w-4xl">
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-semibold tracking-[0.15em] uppercase text-primary mb-4"
          >
            OT Frameworks &amp; Regulations
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground leading-[1.1] mb-5"
          >
            European Frameworks<br className="hidden md:block" /> for OT Security
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.14 }}
            className="text-lg text-muted-foreground mb-6 max-w-2xl leading-relaxed"
          >
            Navigate AI Act, CRA, NIS2, Machinery Regulation and IEC 62443 for OT.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-5 text-sm text-muted-foreground"
          >
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              5 min read
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              Updated July 2026
            </span>
            {summary && (
              <span className="hidden sm:flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5" />
                {summary.regulationCount} regulations mapped
              </span>
            )}
          </motion.div>
        </div>
      </section>

      {/* ── Two-column: sticky TOC + article ─────────────────────────── */}
      <section className="container mx-auto px-4 md:px-8 py-12 md:py-16">
        <div className="flex gap-12 lg:gap-16 relative max-w-5xl">

          {/* Left: sticky TOC sidebar */}
          <aside className="hidden lg:block w-48 flex-shrink-0">
            <div className="sticky top-24">
              <p className="flex items-center gap-1.5 text-xs font-semibold tracking-[0.12em] uppercase text-muted-foreground mb-4">
                <span className="inline-block w-3 h-px bg-primary" />
                On this page
              </p>
              <nav className="flex flex-col gap-0.5">
                {TOC.map(({ id, label }) => (
                  <a
                    key={id}
                    href={`#${id}`}
                    className={cn(
                      'text-sm py-1 pl-3 border-l-2 transition-colors leading-snug',
                      activeSection === id
                        ? 'border-primary text-foreground font-medium'
                        : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border',
                    )}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                  >
                    {label}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          {/* Right: article body */}
          <div className="flex-1 min-w-0">

            {/* ── Section 1: How the pieces fit ── */}
            <div id="how-pieces-fit" className="scroll-mt-24 mb-14">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-5">
                How the pieces fit
              </h2>
              <div className="prose prose-sm sm:prose dark:prose-invert max-w-none">
                <p>
                  Industrial cybersecurity in Europe is no longer governed by good intentions and
                  voluntary guidance. In the space of a few years, the EU has built an interlocking
                  framework of laws and standards that reach directly into Operational Technology —
                  from the operators who run critical services, to the manufacturers who build the
                  products those services depend on, to the AI now embedded in machines.
                </p>
                <p>
                  Understanding how these pieces fit together is the difference between a coherent
                  security programme and a scramble of disconnected compliance projects.
                </p>
                <p>
                  OXOT works across all of them. This page is the map — start with your role, then
                  open any framework for the detailed, individually-cited guide.
                </p>
              </div>
            </div>

            {/* ── Role filter ── */}
            <div className="mb-14 p-6 rounded-2xl border border-border/60 bg-card">
              <p className="text-xs font-semibold tracking-[0.12em] uppercase text-primary mb-4">
                Which frameworks apply to me?
              </p>
              <div className="flex flex-wrap gap-2 mb-4">
                {ROLES.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(selectedRole === role.id ? null : role.id)}
                    className={cn(
                      'text-sm px-4 py-2 rounded-full border transition-all font-medium',
                      selectedRole === role.id
                        ? 'bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20'
                        : 'border-border text-muted-foreground hover:border-primary/40 hover:text-foreground bg-background',
                    )}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
              {selectedRoleData ? (
                <div className="text-sm text-foreground bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
                  <span className="font-medium">Key frameworks for you: </span>
                  {selectedRoleData.frameworks.map((key, i) => (
                    <span key={key}>
                      <Link href={`/frameworks/${key}`} className="text-primary hover:underline">
                        {FRAMEWORK_LABELS[key] ?? key}
                      </Link>
                      {i < selectedRoleData.frameworks.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                  <span className="text-muted-foreground">
                    {' '}— scroll down to see the highlighted cards.
                  </span>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Select your role to highlight the relevant frameworks below.</p>
              )}
            </div>

            {/* ── Section 2: The frameworks ── */}
            <div id="the-frameworks" className="scroll-mt-24 mb-14">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-5">
                The frameworks
              </h2>
              <div className="prose prose-sm sm:prose dark:prose-invert max-w-none">
                <p>
                  Five major EU instruments now govern OT security, each targeting a different slice
                  of the ecosystem:
                </p>
                <ul>
                  <li>
                    <strong>Cyber Resilience Act (CRA)</strong> — mandatory cybersecurity requirements
                    for any product with digital elements placed on the EU market, effective December
                    2027. This is the broadest horizontal obligation: if it has a chip and connects to
                    a network, the CRA applies.
                  </li>
                  <li>
                    <strong>NIS2 Directive</strong> — extends the original NIS to a far wider set of
                    essential and important entities, including OT operators in energy, transport, water
                    and manufacturing above certain thresholds.
                  </li>
                  <li>
                    <strong>EU AI Act</strong> — a risk-based framework for AI systems. Safety
                    functions in OT — predictive maintenance that stops a line, AI that controls
                    physical actuators — often fall into the high-risk or safety-critical categories.
                  </li>
                  <li>
                    <strong>Machinery Regulation 2023/1230</strong> — replaces the old Machinery
                    Directive and explicitly requires cybersecurity as a safety property for
                    safety-related control systems.
                  </li>
                  <li>
                    <strong>IEC 62443</strong> — the reference standard for industrial automation
                    security. Not an EU regulation, but the framework the others point to for
                    technical substance.
                  </li>
                </ul>
              </div>
            </div>

            {/* ── Section 3: Who answers to what ── */}
            <div id="who-answers" className="scroll-mt-24 mb-14">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-5">
                Who answers to what
              </h2>
              <div className="prose prose-sm sm:prose dark:prose-invert max-w-none">
                <p>
                  The EU frameworks divide obligations between two distinct groups — and most
                  industrial organisations straddle both:
                </p>
                <p>
                  <strong>Operators of essential services</strong> fall primarily under NIS2. They must
                  maintain risk management measures, report incidents within 24 hours, and ensure their
                  supply chains (including the OT products they buy) meet adequate security standards.
                  IEC 62443-2-1 is the typical implementation reference.
                </p>
                <p>
                  <strong>Manufacturers and integrators</strong> of products with digital elements face
                  the CRA, the Machinery Regulation, and potentially the AI Act. They must CE-mark
                  their products against cybersecurity requirements, maintain a software bill of
                  materials, handle vulnerabilities for the product's supported lifetime, and generate
                  a conformity dossier a notified body can audit.
                </p>
              </div>
            </div>

            {/* ── Section 4: Why one ── */}
            <div id="why-one" className="scroll-mt-24 mb-14">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-5">
                Why it pays to treat them as one
              </h2>
              <div className="prose prose-sm sm:prose dark:prose-invert max-w-none">
                <p>
                  Each regulation was drafted by a different DG, with a different set of policy
                  objectives — yet they share a large common core. Secure-by-design, vulnerability
                  management, access control, logging and incident response appear across all five.
                  Treating each compliance project independently means writing the same evidence four
                  times over.
                </p>
                <p>
                  OXOT's control library maps the shared obligations once, then traces each one to its
                  specific citations in every applicable regulation. A single piece of evidence —
                  a network segmentation design, a penetration test, a patching process — can satisfy
                  requirements in CRA Annex I, NIS2 Article 21, IEC 62443-3-3 SR 5.1, and the
                  Machinery Regulation's essential health and safety requirements simultaneously.
                </p>
              </div>
            </div>

            {/* ── Section 5: How OXOT helps ── */}
            <div id="how-oxot-helps" className="scroll-mt-24 mb-14">
              <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-5">
                How OXOT helps
              </h2>
              <div className="prose prose-sm sm:prose dark:prose-invert max-w-none">
                <p>
                  OXOT brings three capabilities to the compliance challenge:
                </p>
                <ol>
                  <li>
                    <strong>Unified control library.</strong> Every obligation across CRA, NIS2, AI
                    Act, Machinery and IEC 62443 is modelled in a single, deduplicated requirement
                    set — so teams work against one list, not five.
                  </li>
                  <li>
                    <strong>Cyber Digital Twin.</strong> A living model of your OT environment that
                    maps assets, zones, conduits and trust boundaries to the specific controls that
                    apply to each. As your environment changes, the compliance picture updates
                    automatically.
                  </li>
                  <li>
                    <strong>Audit-ready evidence.</strong> Link engineering artefacts — tickets,
                    tests, SBOMs, design documents — to controls. OXOT generates structured technical
                    files and declarations of conformity that a notified body can actually follow.
                  </li>
                </ol>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/services"
                  className="inline-flex items-center gap-2 h-10 px-6 rounded-full bg-primary text-primary-foreground font-medium text-sm shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                >
                  Explore services <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link
                  href="/cyber-digital-twin"
                  className="inline-flex items-center gap-2 h-10 px-6 rounded-full border border-border text-foreground font-medium text-sm hover:border-primary/40 hover:text-primary transition-all"
                >
                  Cyber Digital Twin
                </Link>
              </div>
            </div>

          </div>{/* end article body */}
        </div>{/* end flex row */}
      </section>

      {/* ── Regulation cards ─────────────────────────────────────────────── */}
      <section id="all-frameworks" className="scroll-mt-20 py-16 md:py-20 border-t border-border/40 bg-background">
        <div className="container mx-auto px-4 md:px-8">
          <div className="mb-10 flex flex-col sm:flex-row sm:items-end gap-4 justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight mb-2">
                Mapped regulations &amp; standards
              </h2>
              <p className="text-muted-foreground max-w-xl text-sm">
                Select a framework to explore its obligations, key dates, product classifications and
                conformity routes.
              </p>
            </div>
            <Link
              href="/frameworks/matrix"
              className="flex-shrink-0 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
            >
              Cross-regulation matrix <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {(regulations ?? []).map((reg, i) => (
                <motion.div
                  key={reg.key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                >
                  <RegCard
                    reg={reg}
                    highlighted={highlightedKeys.includes(reg.key)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Key dates band ────────────────────────────────────────────────── */}
      {summary && summary.keyDates.length > 0 && (
        <section className="py-14 border-t border-border/40">
          <div className="container mx-auto px-4 md:px-8">
            <div className="mb-7">
              <h2 className="text-xl font-display font-bold tracking-tight mb-1">
                Upcoming key dates
              </h2>
              <p className="text-muted-foreground text-sm">Implementation deadlines across all mapped regulations.</p>
            </div>
            <div className="flex flex-col gap-3 max-w-2xl">
              {summary.keyDates
                .filter((kd) => kd.date >= new Date().toISOString().slice(0, 10))
                .slice(0, 6)
                .map((kd, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className="flex items-start gap-4 p-4 rounded-xl bg-card border border-border/40"
                  >
                    <div
                      className="flex-shrink-0 w-2 h-2 rounded-full mt-1.5"
                      style={regBgStyle(kd.regulationKey ?? '')}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{kd.label}</p>
                      {kd.regulationKey && (
                        <p className="text-xs text-muted-foreground mt-0.5" style={regTextStyle(kd.regulationKey)}>
                          {kd.regulationKey.replace('_', ' ').toUpperCase()}
                        </p>
                      )}
                    </div>
                    <time className="flex-shrink-0 text-xs font-mono text-muted-foreground tabular-nums">
                      {kd.date}
                    </time>
                  </motion.div>
                ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
