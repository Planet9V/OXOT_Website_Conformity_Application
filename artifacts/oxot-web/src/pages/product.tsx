import { Link } from 'wouter';
import { motion } from 'framer-motion';
import {
  Boxes,
  Compass,
  ClipboardList,
  FileCheck2,
  ShieldAlert,
  FileBarChart,
  BookOpen,
  Factory,
  KeyRound,
  ArrowRight,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { useSeo } from '@/hooks/use-seo';
import { pageSeo } from '@/lib/page-seo';
import { JsonLd } from '@/components/json-ld';
import { useLocale } from '@/providers/locale-provider';
import { revealVariants } from '@/lib/motion';
import { ProductShot } from '@/components/product-shot';

// Localised page copy (nl-NL professional register, "u"). Machine-assisted —
// flag Dutch strings for a native reviewer before go-live. Structure mirrors the
// English source so every visible string has a Dutch equivalent.
const copy = {
  en: {
    seoTitle: 'The platform — OXOT Conformance Platform',
    seoDescription:
      'The shipped platform: role-aware product files, the eight-step CRA journey, incidents and statutory clocks, the verbatim statutory Library, supplier CRA management for operators, and reports — one record, every regulation.',
    headerKicker: 'THE PLATFORM',
    headerTitle: 'One record, every regulation',
    headerDescription:
      'The OXOT Conformance Platform runs product conformity as an operation: every product with digital elements as a living dossier, a guided journey per product, and the statutory clocks running where you can see them. One record — and it speaks each act\u2019s own language.',
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
      {
        name: 'The statutory Library',
        body: 'Verbatim, as-amended wikis for the CRA, NIS2, the AI Act, Machinery, RED, GDPR and the Data Act — plus the Dutch and German NIS2 transpositions — corrigenda applied and disclosed, character-verified in CI.',
      },
      {
        name: 'Supplier CRA management (operators)',
        body: 'A supplier register over your equipment estate: per-device procurement facts against the CRA\u2019s Article 13 duties, a secure door for supplier submissions, and a per-supplier posture board.',
      },
      {
        name: 'External doors: auditors & suppliers',
        body: 'Expiring, revocable token access for a notified-body auditor into a technical file — and for a supplier answering an evidence ask. No accounts, no exposure.',
      },
    ],
    proofKicker: 'The register underneath',
    proofTitle: 'Not a checklist about the law — the law, made executable.',
    stats: [
      ['9', 'EU regulations modelled'],
      ['156', 'obligations, each citing its article'],
      ['7', 'roles, each in the act’s own words'],
      ['11', 'verbatim statutory corpora, CI-verified'],
    ] as [string, string][],
    rolesTitle: 'Every hat in the value chain',
    roles: 'Manufacturer · Authorised representative · Importer · Distributor · Open-source steward · System integrator · Operator / asset owner — each declaration surfaces only the duties that role actually carries, in each act’s own vocabulary (a manufacturer is a “provider” under the AI Act; an operator a “controller or processor” under GDPR).',
    currencyTitle: 'The law stays current — provably',
    currencyBody: 'Every corpus is the as-amended text: corrigenda applied and disclosed where you read them, consolidated versions dated, and a CI lifecycle guard that watches EUR-Lex so a change in Brussels cannot silently rot your record. Character-exact, verified on every build.',
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
      'Het geleverde platform: rolbewuste productdossiers, het CRA-traject van acht stappen, incidenten en wettelijke klokken, de woordelijke wettenbibliotheek, CRA-leveranciersbeheer voor exploitanten, en rapporten — één dossier, elke verordening.',
    headerKicker: 'HET PLATFORM',
    headerTitle: 'Eén dossier, elke verordening',
    headerDescription:
      'Het OXOT Conformance Platform voert productconformiteit uit als een operatie: elk product met digitale elementen als een levend dossier, een begeleid traject per product, en de wettelijke klokken die lopen waar u ze kunt zien. Eén dossier — en het spreekt de eigen taal van elke wet.',
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
      {
        name: 'De wettenbibliotheek',
        body: 'Woordelijke, geactualiseerde wiki\u2019s voor de CRA, NIS2, de AI-verordening, de Machineverordening, RED, de AVG en de Dataverordening — plus de Nederlandse en Duitse NIS2-omzettingen — rectificaties toegepast en vermeld, tekengetrouw geverifieerd in CI.',
      },
      {
        name: 'CRA-leveranciersbeheer (exploitanten)',
        body: 'Een leveranciersregister over uw apparatuurbestand: inkoopfeiten per apparaat tegen de artikel 13-plichten van de CRA, een beveiligde deur voor leveranciersinzendingen, en een standenbord per leverancier.',
      },
      {
        name: 'Externe deuren: auditors & leveranciers',
        body: 'Verlopende, intrekbare token-toegang voor een aangemelde-instantie-auditor tot een technisch dossier — en voor een leverancier die een bewijsverzoek beantwoordt. Geen accounts, geen blootstelling.',
      },
    ],
    proofKicker: 'Het register eronder',
    proofTitle: 'Geen checklist óver de wet — de wet, uitvoerbaar gemaakt.',
    stats: [
      ['9', 'EU-verordeningen gemodelleerd'],
      ['156', 'verplichtingen, elk met artikelverwijzing'],
      ['7', 'rollen, elk in de eigen woorden van de wet'],
      ['11', 'woordelijke corpora, geverifieerd in CI'],
    ] as [string, string][],
    rolesTitle: 'Elke rol in de waardeketen',
    roles: 'Fabrikant · Gemachtigde vertegenwoordiger · Importeur · Distributeur · Open-source steward · Systeemintegrator · Exploitant / asset owner — elke verklaring toont alleen de plichten die die rol daadwerkelijk draagt, in de eigen taal van elke wet (een fabrikant is een “aanbieder” onder de AI-verordening; een exploitant een “verwerkingsverantwoordelijke of verwerker” onder de AVG).',
    currencyTitle: 'De wet blijft actueel — aantoonbaar',
    currencyBody: 'Elk corpus is de gewijzigde tekst: rectificaties toegepast en vermeld waar u leest, geconsolideerde versies gedateerd, en een CI-levenscyclusbewaker die EUR-Lex volgt zodat een wijziging in Brussel uw dossier niet stil kan laten verouderen. Tekengetrouw, geverifieerd bij elke build.',
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

const MODULE_ICONS = [Boxes, Compass, ClipboardList, FileCheck2, ShieldAlert, FileBarChart, BookOpen, Factory, KeyRound];

export default function ProductPage() {
  const { locale } = useLocale();
  const t = copy[locale];

  useSeo(
    pageSeo('/product', {
      title: t.seoTitle,
      description: t.seoDescription,
      ogImage: '/media/product/prod-dossier.jpg',
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

      {/* Show the record: one product as a living dossier. */}
      <div className="mb-14">
        <ProductShot
          src="/media/product/prod-dossier.jpg"
          alt={
            locale === 'nl'
              ? 'Een productdossier: rol, type, versie, fabrikant en beoogd gebruik op één plek.'
              : 'A product dossier: role, type, version, manufacturer and intended use in one record.'
          }
          caption={
            locale === 'nl'
              ? 'Eén product als levend dossier — rol, klasse en bewijs op één plek.'
              : 'One product as a living dossier — role, class and evidence in one place.'
          }
          priority
          className="mx-auto max-w-5xl"
        />
      </div>

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

      {/* The register underneath — the capability proof (Phase 29). */}
      <div className="mt-16">
        <p className="oxot-kicker text-center">{t.proofKicker}</p>
        <h2 className="mt-2 text-center font-display text-3xl font-normal tracking-tight text-foreground">
          {t.proofTitle}
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.stats.map(([n, label]) => (
            <div key={label} className="rounded-2xl border border-border bg-card p-6 text-center">
              <p className="font-display text-4xl font-normal tracking-tight text-primary">{n}</p>
              <p className="mt-1 text-sm text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-display text-lg font-normal tracking-tight text-foreground">{t.rolesTitle}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.roles}</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-display text-lg font-normal tracking-tight text-foreground">{t.currencyTitle}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.currencyBody}</p>
          </div>
        </div>
        <div className="mt-6">
          <ProductShot
            src="/media/product/prod-law.jpg"
            alt={
              locale === 'nl'
                ? 'De wettenbibliotheek: de woordelijke CRA-tekst met index, artikel en kruisverwijzingen.'
                : 'The statutory Library: the verbatim CRA text with its index, article and cross-references.'
            }
            caption={
              locale === 'nl'
                ? 'De wet zelf — woordelijk, geactualiseerd, en het zegt u nooit dat u conform bent.'
                : 'The law itself — verbatim, as amended, and it never tells you you are compliant.'
            }
            className="mx-auto max-w-5xl"
          />
        </div>
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
