import { Link } from 'wouter';
import { motion } from 'framer-motion';
import { Scale, Check, Minus, ArrowRight, Cloud, ScanLine, ShieldCheck } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { useSeo } from '@/hooks/use-seo';
import { pageSeo } from '@/lib/page-seo';
import { useLocale } from '@/providers/locale-provider';
import { revealVariants } from '@/lib/motion';

// Localised page copy (nl-NL professional register, "u"). Machine-assisted —
// flag Dutch strings for a native reviewer before go-live. This page compares by
// CATEGORY, not by fabricated per-feature scorecards of named competitors: the
// wedges are structural (what a tool is built for), which is honest and fair. It
// never claims the platform concludes conformity — that boundary is the product.
const copy = {
  en: {
    seoTitle: 'OXOT vs. IT GRC and firmware scanners — an honest comparison',
    seoDescription:
      'IT GRC suites prove SOC 2 and ISO 27001; firmware scanners count CVEs. Neither is a system of record for the Cyber Resilience Act across the whole value chain. Here is what OXOT is built for, and where the other categories structurally stop.',
    kicker: 'HOW WE COMPARE',
    title: 'Built for the CRA, across the whole value chain',
    description:
      'Two categories of tool get bought for CRA work, and both leave a gap. IT GRC suites prove IT-security posture; firmware scanners find vulnerabilities. Neither is a system of record that holds a product’s statutory dossier — and neither speaks to the operator who has to manage a fleet of suppliers. We built for exactly that.',
    honestLead: 'Stated plainly, and without pretending the other tools are useless:',
    cats: [
      {
        icon: 'cloud',
        badge: 'IT & cloud GRC',
        name: 'SOC 2 / ISO 27001 suites',
        builtFor: 'Built for information-security management systems — policies, controls, and continuous evidence for SOC 2 and ISO 27001.',
        strength: 'Genuinely good at what they are for: IT-security posture and audit readiness.',
        gap: 'They model the organisation, not the product. There is no per-product technical file, no Annex VII, no essential-requirements assessment, and no notion of the operator managing suppliers device by device.',
      },
      {
        icon: 'scan',
        badge: 'Product security',
        name: 'Firmware & binary scanners',
        builtFor: 'Built to extract SBOMs from firmware and enumerate known vulnerabilities — deep, useful engineering telemetry.',
        strength: 'Genuinely good at what they are for: finding what is in a binary and which CVEs touch it.',
        gap: 'A list of CVEs is evidence, not a dossier. They do not compose the technical documentation, hold the declaration of conformity, track the Article 13/14 duties, or carry the other acts that bind the same product.',
      },
      {
        icon: 'shield',
        badge: 'This platform',
        name: 'OXOT Conformance Platform',
        builtFor: 'Built as the single system of record for a product’s conformity — the manufacturer’s dossier and the operator’s supplier register, on the same rails.',
        strength: 'One record, nine acts, every obligation citing its own article — and a hard refusal to conclude conformity for you.',
        gap: 'Not a scanner and not an IT-GRC suite: it ingests the evidence those tools produce and turns it into the statutory record neither of them keeps.',
      },
    ] as { icon: string; badge: string; name: string; builtFor: string; strength: string; gap: string }[],
    recommended: 'What we built',
    matrixTitle: 'Where each category stops',
    matrixNote: 'A dash is not a criticism — it means the capability is outside what that category is built to do.',
    colCapability: 'Capability',
    colGrc: 'IT GRC',
    colScan: 'Scanners',
    colOxot: 'OXOT',
    rows: [
      ['Per-product Annex VII technical file', false, false, true],
      ['Annex V EU Declaration of Conformity on the record', false, false, true],
      ['One record across CRA · NIS2 · AI Act · RED · Machinery · GDPR · Data Act', false, false, true],
      ['Verbatim statutory text, character-exact and CI-verified', false, false, true],
      ['Operator supplier register + secure supplier door', false, false, true],
      ['Article 13/14 duties tracked and timed from the file', 'partial', 'partial', true],
      ['SBOM / vulnerability evidence ingested and linked to a duty', 'partial', true, true],
      ['Single-tenant, local island-mode AI — evidence never leaves', false, 'partial', true],
      ['Refuses to conclude conformity (Article 32 honesty)', false, false, true],
    ] as [string, boolean | 'partial', boolean | 'partial', boolean | 'partial'][],
    legendYes: 'Native',
    legendPartial: 'Partial / adjacent',
    legendNo: 'Out of scope',
    ctaTitle: 'See it against your own products',
    ctaBody:
      'A 45-minute walkthrough with your real product and supplier list — no fabricated verdicts, just what the record would show on day one.',
    ctaDemo: 'Book a demo',
    ctaTour: 'Watch the 90-second tour',
  },
  nl: {
    seoTitle: 'OXOT versus IT-GRC en firmwarescanners — een eerlijke vergelijking',
    seoDescription:
      'IT-GRC-suites bewijzen SOC 2 en ISO 27001; firmwarescanners tellen CVE’s. Geen van beide is een registratiesysteem voor de Cyber Resilience Act over de hele waardeketen. Dit is waarvoor OXOT is gebouwd, en waar de andere categorieën structureel ophouden.',
    kicker: 'HOE WIJ ONS VERHOUDEN',
    title: 'Gebouwd voor de CRA, over de hele waardeketen',
    description:
      'Twee soorten tools worden gekocht voor CRA-werk, en beide laten een gat. IT-GRC-suites bewijzen de IT-beveiligingsstand; firmwarescanners vinden kwetsbaarheden. Geen van beide is een registratiesysteem dat het wettelijke dossier van een product vasthoudt — en geen van beide spreekt de exploitant aan die een vloot leveranciers moet beheren. Wij hebben precies daarvoor gebouwd.',
    honestLead: 'Eerlijk gesteld, en zonder te doen alsof de andere tools nutteloos zijn:',
    cats: [
      {
        icon: 'cloud',
        badge: 'IT- & cloud-GRC',
        name: 'SOC 2- / ISO 27001-suites',
        builtFor: 'Gebouwd voor managementsystemen voor informatiebeveiliging — beleid, controls en doorlopend bewijs voor SOC 2 en ISO 27001.',
        strength: 'Echt goed in waarvoor ze bedoeld zijn: IT-beveiligingsstand en auditgereedheid.',
        gap: 'Ze modelleren de organisatie, niet het product. Er is geen technisch dossier per product, geen Bijlage VII, geen beoordeling van essentiële eisen, en geen begrip van de exploitant die leveranciers per apparaat beheert.',
      },
      {
        icon: 'scan',
        badge: 'Productbeveiliging',
        name: 'Firmware- & binaire scanners',
        builtFor: 'Gebouwd om SBOM’s uit firmware te halen en bekende kwetsbaarheden op te sommen — diepe, nuttige engineeringtelemetrie.',
        strength: 'Echt goed in waarvoor ze bedoeld zijn: vinden wat in een binary zit en welke CVE’s die raken.',
        gap: 'Een lijst CVE’s is bewijs, geen dossier. Ze stellen de technische documentatie niet samen, houden de conformiteitsverklaring niet vast, volgen de artikel 13/14-plichten niet, en dragen de andere wetten die hetzelfde product binden niet.',
      },
      {
        icon: 'shield',
        badge: 'Dit platform',
        name: 'OXOT Conformance Platform',
        builtFor: 'Gebouwd als het centrale registratiesysteem voor de conformiteit van een product — het dossier van de fabrikant en het leveranciersregister van de exploitant, op dezelfde rails.',
        strength: 'Eén dossier, negen wetten, elke verplichting met eigen artikelverwijzing — en een harde weigering om de conformiteit voor u te concluderen.',
        gap: 'Geen scanner en geen IT-GRC-suite: het leest het bewijs in dat die tools produceren en maakt daarvan het wettelijke dossier dat geen van beide bijhoudt.',
      },
    ] as { icon: string; badge: string; name: string; builtFor: string; strength: string; gap: string }[],
    recommended: 'Wat wij bouwden',
    matrixTitle: 'Waar elke categorie ophoudt',
    matrixNote: 'Een streepje is geen kritiek — het betekent dat de functie buiten valt waarvoor die categorie is gebouwd.',
    colCapability: 'Functie',
    colGrc: 'IT-GRC',
    colScan: 'Scanners',
    colOxot: 'OXOT',
    rows: [
      ['Technisch dossier per product (Bijlage VII)', false, false, true],
      ['EU-conformiteitsverklaring (Bijlage V) op het dossier', false, false, true],
      ['Eén dossier over CRA · NIS2 · AI-verordening · RED · Machinerie · AVG · Data Act', false, false, true],
      ['Woordelijke wettekst, tekengetrouw en geverifieerd in CI', false, false, true],
      ['Leveranciersregister exploitant + beveiligde leveranciersdeur', false, false, true],
      ['Artikel 13/14-plichten gevolgd en getimed vanaf het dossier', 'partial', 'partial', true],
      ['SBOM-/kwetsbaarheidsbewijs ingelezen en aan een plicht gekoppeld', 'partial', true, true],
      ['Single-tenant, lokale island-mode-AI — bewijs verlaat u niet', false, 'partial', true],
      ['Weigert conformiteit te concluderen (artikel 32-eerlijkheid)', false, false, true],
    ] as [string, boolean | 'partial', boolean | 'partial', boolean | 'partial'][],
    legendYes: 'Ingebouwd',
    legendPartial: 'Gedeeltelijk / aangrenzend',
    legendNo: 'Buiten scope',
    ctaTitle: 'Bekijk het tegen uw eigen producten',
    ctaBody:
      'Een rondleiding van 45 minuten met uw echte product en leverancierslijst — geen verzonnen oordelen, alleen wat het dossier op dag één zou tonen.',
    ctaDemo: 'Demo aanvragen',
    ctaTour: 'Bekijk de rondleiding van 90 seconden',
  },
} as const;

const CAT_ICONS: Record<string, typeof Cloud> = { cloud: Cloud, scan: ScanLine, shield: ShieldCheck };

function Cell({ v }: { v: boolean | 'partial' }) {
  if (v === true) return <Check className="mx-auto h-4 w-4 text-primary" aria-label="Native" />;
  if (v === 'partial') return <Minus className="mx-auto h-4 w-4 text-amber-500" aria-label="Partial" />;
  return <Minus className="mx-auto h-4 w-4 text-muted-foreground/40" aria-label="Out of scope" />;
}

export default function CompetitorsPage() {
  const { locale } = useLocale();
  const t = copy[locale];

  useSeo(
    pageSeo('/compare', {
      title: t.seoTitle,
      description: t.seoDescription,
    }),
  );

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 md:py-16 max-w-6xl">
      <PageHeader kicker={t.kicker} title={t.title} icon={Scale} description={t.description} />

      {/* Three-category honest split */}
      <p className="text-sm text-muted-foreground">{t.honestLead}</p>
      <div className="mt-4 grid gap-5 md:grid-cols-3">
        {t.cats.map((c, i) => {
          const Icon = CAT_ICONS[c.icon];
          const isOxot = c.icon === 'shield';
          return (
            <motion.div
              key={c.name}
              className={`relative flex flex-col rounded-2xl border p-6 ${
                isOxot ? 'border-primary/50 bg-primary/[0.04] shadow-e1' : 'border-border bg-card'
              }`}
              {...revealVariants(i)}
            >
              {isOxot && (
                <span className="absolute right-4 top-4 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
                  {t.recommended}
                </span>
              )}
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <p className="oxot-kicker mt-4">{c.badge}</p>
              <h3 className="mt-1 font-display text-lg font-normal tracking-tight text-foreground">{c.name}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.builtFor}</p>
              <p className="mt-3 flex items-start gap-2 text-sm text-foreground">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> <span>{c.strength}</span>
              </p>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.gap}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Capability matrix */}
      <div className="mt-16">
        <h2 className="text-center font-display text-3xl font-normal tracking-tight text-foreground">
          {t.matrixTitle}
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-muted-foreground">{t.matrixNote}</p>
        <div className="mt-8 overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-border bg-card">
                <th className="p-4 font-medium text-foreground">{t.colCapability}</th>
                <th className="p-4 text-center font-medium text-muted-foreground">{t.colGrc}</th>
                <th className="p-4 text-center font-medium text-muted-foreground">{t.colScan}</th>
                <th className="p-4 text-center font-semibold text-primary">{t.colOxot}</th>
              </tr>
            </thead>
            <tbody>
              {t.rows.map(([label, grc, scan, oxot], i) => (
                <tr key={label as string} className={i % 2 ? 'bg-card/40' : ''}>
                  <td className="p-4 text-foreground">{label}</td>
                  <td className="p-4"><Cell v={grc} /></td>
                  <td className="p-4"><Cell v={scan} /></td>
                  <td className="p-4"><Cell v={oxot} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-5 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> {t.legendYes}</span>
          <span className="inline-flex items-center gap-1.5"><Minus className="h-3.5 w-3.5 text-amber-500" /> {t.legendPartial}</span>
          <span className="inline-flex items-center gap-1.5"><Minus className="h-3.5 w-3.5 text-muted-foreground/40" /> {t.legendNo}</span>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-16 rounded-2xl border border-border bg-card p-8 text-center">
        <h2 className="font-display text-2xl font-normal tracking-tight text-foreground">{t.ctaTitle}</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">{t.ctaBody}</p>
        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/demo"
            className="cta-lift inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
          >
            {t.ctaDemo} <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/tour"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-card"
          >
            {t.ctaTour}
          </Link>
        </div>
      </div>
    </div>
  );
}
