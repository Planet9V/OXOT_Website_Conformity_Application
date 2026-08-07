import { Link } from 'wouter';
import { motion } from 'framer-motion';
import {
  Boxes,
  Compass,
  ClipboardList,
  FileCheck2,
  ShieldAlert,
  FileBarChart,
  ArrowRight,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { useSeo } from '@/hooks/use-seo';
import { pageSeo } from '@/lib/page-seo';
import { JsonLd } from '@/components/json-ld';
import { useLocale } from '@/providers/locale-provider';
import { revealVariants } from '@/lib/motion';

// Localised page copy (nl-NL professional register, "u"). Machine-assisted —
// flag Dutch strings for a native reviewer before go-live. Structure mirrors the
// English source so every visible string has a Dutch equivalent.
const copy = {
  en: {
    seoTitle: 'The platform — OXOT Conformance Platform',
    seoDescription:
      'Six modules and an eight-step compliance journey: from classification to a defensible Annex VII technical file, with statutory Article 14 clocks running live.',
    headerKicker: 'THE PLATFORM',
    headerTitle: 'One record, every regulation',
    headerDescription:
      'The OXOT Conformance Platform runs CRA conformity as an operation: every product with digital elements as a living dossier, a guided journey per product, and the statutory clocks running where you can see them. Six modules, one record.',
    modules: [
      {
        name: 'Product portfolio',
        body: 'Every product with digital elements as a living dossier — one record per product, its class, route and evidence in one place.',
      },
      {
        name: 'Classification & route',
        body: 'Default, Class I, Class II or Critical — placed correctly, with the conformity route (Module A / B+C / H) that follows from it.',
      },
      {
        name: 'Annex I requirements + evidence vault',
        body: 'The 13 product-security properties and 8 vulnerability-handling processes tracked per product, each backed by assessment-ready evidence.',
      },
      {
        name: 'Annex VII technical file + Annex V DoC',
        body: 'The technical file assembled from your own evidence, and the Declaration of Conformity generated when the record is complete.',
      },
      {
        name: 'PSIRT & Article 14 clocks',
        body: 'A triage board with named owners and SLA windows, the 24h/72h/14d statutory clocks running live, and ENISA single-reporting-platform filing.',
      },
      {
        name: 'Conformity assessment reports',
        body: 'Full, board-edition and custom reports — the state of every product against its obligations, ready for an auditor or a board.',
      },
    ],
    journeyKicker: 'The compliance journey',
    journeyTitle: 'Eight steps, per product',
    journey: [
      ['Scope', 'Confirm the product is in scope and capture what it is.'],
      ['Classify', 'Place the product in its CRA class and derive the route.'],
      ['Assess risk', 'Build the Annex I risk assessment that drives the design.'],
      ['Gather evidence', 'SBOM, secure-development docs and CVD into the vault.'],
      ['Track requirements', 'Every Annex I property and process, evidenced.'],
      ['Assemble the file', 'The Annex VII technical file, from your own record.'],
      ['Declare conformity', 'The Annex V Declaration of Conformity and CE marking.'],
      ['Operate', 'Article 14 clocks, PSIRT triage and continuing surveillance.'],
    ] as [string, string][],
    finalTitle: 'See it against your own products',
    finalBody:
      'A 45-minute walkthrough shows the workbench with your classification, your evidence and your Annex VII file.',
    bookDemo: 'Book a demo',
  },
  nl: {
    seoTitle: 'Het platform — OXOT Conformance Platform',
    seoDescription:
      'Zes modules en een conformiteitstraject van acht stappen: van classificatie tot een verdedigbaar technisch dossier volgens Bijlage VII, met wettelijke Artikel 14-klokken die live lopen.',
    headerKicker: 'HET PLATFORM',
    headerTitle: 'Eén dossier, elke verordening',
    headerDescription:
      'Het OXOT Conformance Platform voert CRA-conformiteit uit als een operatie: elk product met digitale elementen als een levend dossier, een begeleid traject per product, en de wettelijke klokken die lopen waar u ze kunt zien. Zes modules, één dossier.',
    modules: [
      {
        name: 'Productportfolio',
        body: 'Elk product met digitale elementen als een levend dossier — één record per product, met de klasse, route en het bewijs op één plek.',
      },
      {
        name: 'Classificatie & route',
        body: 'Standaard, Klasse I, Klasse II of Kritiek — correct geplaatst, met de conformiteitsroute (Module A / B+C / H) die daaruit volgt.',
      },
      {
        name: 'Bijlage I-vereisten + bewijskluis',
        body: 'De 13 productbeveiligingseigenschappen en 8 processen voor het afhandelen van kwetsbaarheden, per product bijgehouden, elk onderbouwd met beoordelingsklaar bewijs.',
      },
      {
        name: 'Bijlage VII technisch dossier + Bijlage V conformiteitsverklaring',
        body: 'Het technisch dossier samengesteld uit uw eigen bewijs, en de conformiteitsverklaring die wordt gegenereerd zodra het record compleet is.',
      },
      {
        name: 'PSIRT- & Artikel 14-klokken',
        body: 'Een triageboard met aangewezen verantwoordelijken en SLA-vensters, de wettelijke klokken van 24 u/72 u/14 d die live lopen, en indiening via het ENISA single reporting platform.',
      },
      {
        name: 'Conformiteitsbeoordelingsrapporten',
        body: 'Volledige rapporten, bestuursedities en maatwerkrapporten — de status van elk product ten opzichte van zijn verplichtingen, klaar voor een auditor of een bestuur.',
      },
    ],
    journeyKicker: 'Het conformiteitstraject',
    journeyTitle: 'Acht stappen, per product',
    journey: [
      ['Afbakenen', 'Bevestig dat het product binnen de reikwijdte valt en leg vast wat het is.'],
      ['Classificeren', 'Plaats het product in zijn CRA-klasse en leid de route af.'],
      ['Risico beoordelen', 'Stel de Bijlage I-risicobeoordeling op die het ontwerp stuurt.'],
      ['Bewijs verzamelen', 'SBOM, documentatie over veilige ontwikkeling en CVD in de kluis.'],
      ['Vereisten bijhouden', 'Elke Bijlage I-eigenschap en elk proces, met bewijs.'],
      ['Het dossier samenstellen', 'Het technisch dossier volgens Bijlage VII, uit uw eigen record.'],
      ['Conformiteit verklaren', 'De conformiteitsverklaring volgens Bijlage V en de CE-markering.'],
      ['Operationeel beheer', 'Artikel 14-klokken, PSIRT-triage en doorlopende bewaking.'],
    ] as [string, string][],
    finalTitle: 'Bekijk het tegen uw eigen producten',
    finalBody:
      'Een rondleiding van 45 minuten toont de workbench met uw classificatie, uw bewijs en uw Bijlage VII-dossier.',
    bookDemo: 'Demo aanvragen',
  },
} as const;

const MODULE_ICONS = [Boxes, Compass, ClipboardList, FileCheck2, ShieldAlert, FileBarChart];

export default function ProductPage() {
  const { locale } = useLocale();
  const t = copy[locale];

  useSeo(
    pageSeo('/product', {
      title: t.seoTitle,
      description: t.seoDescription,
    }),
  );

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 md:py-16 max-w-6xl">
      <JsonLd
        id="ld-software-application"
        data={{
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'OXOT Conformance Platform',
          applicationCategory: 'BusinessApplication',
          description:
            'CRA conformity workbench: product dossiers, the eight-step compliance journey, Annex VII technical files, PSIRT and Article 14 statutory clocks.',
          offers: { '@type': 'Offer', availability: 'https://schema.org/InStock' },
        }}
      />
      <PageHeader
        kicker={t.headerKicker}
        title={t.headerTitle}
        icon={Boxes}
        description={t.headerDescription}
      />

      {/* Modules */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {t.modules.map((m, i) => {
          const Icon = MODULE_ICONS[i];
          return (
            <motion.div
              key={m.name}
              className="rounded-2xl border border-border bg-card p-6 shadow-e1"
              {...revealVariants(i)}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="mt-4 font-display text-lg font-normal tracking-tight text-foreground">{m.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{m.body}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Eight-step journey */}
      <div className="mt-16">
        <p className="oxot-kicker text-center">{t.journeyKicker}</p>
        <h2 className="mt-2 text-center font-display text-3xl font-normal tracking-tight text-foreground">
          {t.journeyTitle}
        </h2>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.journey.map(([step, body], i) => (
            <motion.div
              key={step}
              className="rounded-xl border border-border bg-card p-5"
              {...revealVariants(i)}
            >
              <span className="font-mono text-xs text-primary-ink">{String(i + 1).padStart(2, '0')}</span>
              <h3 className="mt-1 font-display text-base font-normal tracking-tight text-foreground">{step}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{body}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-16 rounded-2xl border border-border bg-card p-8 text-center">
        <h2 className="font-display text-2xl font-normal tracking-tight text-foreground">
          {t.finalTitle}
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          {t.finalBody}
        </p>
        <Link
          href="/demo"
          className="cta-lift mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
        >
          {t.bookDemo} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
