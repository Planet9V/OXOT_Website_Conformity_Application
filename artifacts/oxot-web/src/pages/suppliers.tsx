import { Link } from 'wouter';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Cpu,
  Package,
  FileStack,
  ShieldCheck,
  Boxes,
  ShieldAlert,
  CalendarClock,
  Send,
  RefreshCw,
  Handshake,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { useSeo } from '@/hooks/use-seo';
import { pageSeo } from '@/lib/page-seo';
import { useLocale } from '@/providers/locale-provider';
import { revealVariants } from '@/lib/motion';
import { LiveCraBlogGuidesFeed } from '@/components/sections/live-cra-blog-guides-feed';

// Localised page copy (nl-NL professional register, "u"). Machine-assisted —
// flag Dutch strings for a native reviewer before go-live.
const copy = {
  en: {
    seoTitle: 'For component & IP suppliers — CRA supplier assurance package',
    seoDescription:
      'You supply the security IP or component, not the finished product — but your customers’ CRA due diligence runs on your evidence. Produce one versioned, customer-facing assurance package: delivery manifest, security case, IP-BOM/SBOM, CVD process, support-period policy, and a shared-responsibility matrix.',
    kicker: 'FOR COMPONENT & IP SUPPLIERS',
    title: 'You don’t ship the product. The CRA still reaches you.',
    description:
      'Every finished-product manufacturer that integrates your component must exercise due diligence over it and fold its support period into their own. That pushes a flood of security questionnaires and audits onto you. Answer it once, with a versioned package instead of a hundred bespoke replies.',
    deepDiveLink: 'Security IP & silicon supplier? Read the deep-dive',
    tourLink: 'Watch the 90-second supplier tour',
    liveKicker: 'See the built product',
    liveTitle: 'The supplier cockpit — take the 90-second tour.',
    liveBody:
      'The assurance package, the shared-responsibility matrix, the versioned manifest, and the customer link your buyers receive — shown in the real product. Then open the live customer views yourself.',
    tourCta: 'Watch the supplier tour',
    manifestLink: 'Delivery manifest view',
    packageLink: 'Assurance package view',
    framingTitle: 'The statutory frame, stated honestly',
    framingBody:
      'When you license IP that is integrated downstream, the company that sells the finished product normally remains the CRA manufacturer — not you. But the CRA explicitly treats separately-placed hardware and software components as products with digital elements, and it binds the final-product manufacturer to two duties that reach straight back to your evidence: due diligence over integrated third-party components (Art 13(5)), and setting their own support period — generally at least five years — with the support periods of core components in view (Art 13(8)). A capable supplier does not claim its component makes the finished product “CRA compliant.” It provides the technical evidence, integration guidance, lifecycle transparency, and vulnerability cooperation the customer needs to evaluate and manage the component in their own conformity programme.',
    stepsTitle: 'The supplier assurance journey, per component',
    steps: [
      ['Define the delivery boundary', 'Fix exactly what the customer receives — RTL, hard macro, firmware, tools, reference designs, documentation — and which releases and variants are supported. The boundary decides where your responsibility ends and theirs begins.'],
      ['Build the delivery manifest', 'A versioned manifest: IP release, technology node, supported options, configuration baseline, and change history. This is the customer-facing take-home that identifies precisely what they deployed.'],
      ['Assemble the security case', 'Security architecture, trust boundaries, security objectives, intended use, assumptions, and known limitations — the contribution your component makes, and the conditions under which it holds.'],
      ['Produce the IP-BOM / SBOM', 'Component provenance, dependency information, machine-readable SBOM inputs, and third-party licence information — the raw material of the customer’s third-party-component due diligence (Art 13(5)).'],
      ['Stand up vulnerability operations', 'A published security contact, a coordinated vulnerability-disclosure process, an impact-triage model, a confidential customer-notification path, and an errata / corrected-release process — so a future issue has a route, not a scramble.'],
      ['Declare the support-period policy', 'Supported-version policy, security-maintenance model, end-of-support process, and migration guidance — the input the customer needs to set their own ≥5-year support period (Art 13(8)).'],
      ['Publish the assurance package', 'The manifest, security case, evidence, CVD process, support policy, and shared-responsibility matrix — issued to each customer through an expiring, revocable link, with provenance on every artefact.'],
      ['Maintain across versions', 'Re-issue the manifest on each release, notify affected customers, and keep the package current — one consistent evidence set across every chip, module, or device programme.'],
    ] as [string, string][],
    honestyNote:
      'What it will never do: certify that your component makes a customer’s finished product compliant. Final conformity depends on the whole product — architecture, integration, firmware, provisioning, updates, and operating environment. The package makes your part of the case defensible; it does not make the customer’s declaration for them.',
    matrixTitle: 'The shared-responsibility matrix',
    matrixBody:
      'The single most valuable artefact in the package: an unambiguous split of who owns what. The supplier supplies capability and evidence; the customer owns the final product.',
    matrixSupplierTitle: 'The supplier provides',
    matrixSupplier: [
      'Security capabilities of the delivered component',
      'Integration information and secure-default guidance',
      'Assurance evidence and verification summaries',
      'Lifecycle and vulnerability-support process',
    ],
    matrixCustomerTitle: 'The customer retains',
    matrixCustomer: [
      'Final-product cybersecurity risk assessment and architecture',
      'System / SoC integration, firmware, secure boot and recovery',
      'Provisioning, key ownership, certificates, device lifecycle',
      'Product-level vulnerability handling, DoC, and CE marking',
    ],
    sprintTitle: 'A fast on-ramp: the 60-Day CRA sprint',
    sprintBody:
      'The versioned delivery manifest and the shared-responsibility matrix are named outputs of the consultant-led 60-Day CRA sprint — the quickest route to a first customer-ready package you can refine into a repeatable delivery model.',
    sprintCta: 'See the 60-day sprint',
    ctaTitle: 'Bring one component to the walkthrough',
    ctaBody:
      'A 45-minute session: one of your components, its delivery boundary, and the assurance package the platform would start assembling on day one.',
    bookDemo: 'Book a demo',
  },
  nl: {
    seoTitle: 'Voor component- & IP-leveranciers — CRA-leveranciersassurancepakket',
    seoDescription:
      'U levert de beveiligings-IP of het component, niet het eindproduct — maar de CRA-due diligence van uw klanten draait op uw bewijs. Lever één versiegebonden, klantgericht assurancepakket: leveringsmanifest, beveiligingsdossier, IP-BOM/SBOM, CVD-proces, ondersteuningsperiodebeleid en een matrix voor gedeelde verantwoordelijkheid.',
    kicker: 'VOOR COMPONENT- & IP-LEVERANCIERS',
    title: 'U levert het product niet. De CRA bereikt u toch.',
    description:
      'Elke fabrikant van eindproducten die uw component integreert, moet er due diligence over uitvoeren en de ondersteuningsperiode ervan in de eigen periode meenemen. Dat brengt een stroom beveiligingsvragenlijsten en audits naar u toe. Beantwoord die één keer, met een versiegebonden pakket in plaats van honderd aparte antwoorden.',
    deepDiveLink: 'Beveiligings-IP- of siliciumleverancier? Lees de verdieping',
    tourLink: 'Bekijk de rondleiding van 90 seconden',
    liveKicker: 'Bekijk het gebouwde product',
    liveTitle: 'De leveranciers-cockpit — doe de rondleiding van 90 seconden.',
    liveBody:
      'Het assurancepakket, de matrix voor gedeelde verantwoordelijkheid, het versiegebonden manifest en de klantlink die uw kopers ontvangen — getoond in het echte product. Open daarna zelf de live klantweergaven.',
    tourCta: 'Bekijk de leveranciersrondleiding',
    manifestLink: 'Leveringsmanifest-weergave',
    packageLink: 'Assurancepakket-weergave',
    framingTitle: 'Het wettelijke kader, eerlijk gesteld',
    framingBody:
      'Wanneer u IP licentieert die verderop wordt geïntegreerd, blijft normaal gesproken het bedrijf dat het eindproduct verkoopt de CRA-fabrikant — niet u. Maar de CRA behandelt afzonderlijk in de handel gebrachte hardware- en softwarecomponenten uitdrukkelijk als producten met digitale elementen, en bindt de fabrikant van het eindproduct aan twee plichten die rechtstreeks teruggrijpen op uw bewijs: due diligence over geïntegreerde componenten van derden (art. 13(5)), en het vaststellen van hun eigen ondersteuningsperiode — doorgaans ten minste vijf jaar — met de ondersteuningsperioden van kerncomponenten in beeld (art. 13(8)). Een capabele leverancier beweert niet dat zijn component het eindproduct “CRA-conform” maakt. Hij levert het technische bewijs, de integratiebegeleiding, de levenscyclustransparantie en de kwetsbaarheidssamenwerking die de klant nodig heeft om het component in het eigen conformiteitsprogramma te beoordelen en te beheren.',
    stepsTitle: 'Het leveranciersassurancetraject, per component',
    steps: [
      ['Bepaal de leveringsgrens', 'Leg precies vast wat de klant ontvangt — RTL, hard macro, firmware, tools, referentieontwerpen, documentatie — en welke releases en varianten worden ondersteund. De grens bepaalt waar uw verantwoordelijkheid eindigt en de hunne begint.'],
      ['Bouw het leveringsmanifest', 'Een versiegebonden manifest: IP-release, technologieknoop, ondersteunde opties, configuratiebasislijn en wijzigingsgeschiedenis. Dit is het klantgerichte take-home dat precies identificeert wat zij hebben ingezet.'],
      ['Stel het beveiligingsdossier samen', 'Beveiligingsarchitectuur, vertrouwensgrenzen, beveiligingsdoelen, beoogd gebruik, aannames en bekende beperkingen — de bijdrage die uw component levert, en de voorwaarden waaronder die standhoudt.'],
      ['Lever de IP-BOM / SBOM', 'Componentherkomst, afhankelijkheidsinformatie, machineleesbare SBOM-inputs en licentie-informatie van derden — het ruwe materiaal van de due diligence van de klant over componenten van derden (art. 13(5)).'],
      ['Zet kwetsbaarheidsoperaties op', 'Een gepubliceerd beveiligingscontact, een gecoördineerd kwetsbaarheidsopenbaarmakingsproces, een impact-triagemodel, een vertrouwelijk klantnotificatiepad en een errata- / gecorrigeerde-releaseproces — zodat een toekomstig probleem een route heeft, geen improvisatie.'],
      ['Verklaar het ondersteuningsperiodebeleid', 'Beleid voor ondersteunde versies, onderhoudsmodel voor beveiliging, einde-ondersteuningsproces en migratiebegeleiding — de input die de klant nodig heeft om de eigen ondersteuningsperiode van ≥5 jaar vast te stellen (art. 13(8)).'],
      ['Publiceer het assurancepakket', 'Het manifest, beveiligingsdossier, bewijs, CVD-proces, ondersteuningsbeleid en de matrix voor gedeelde verantwoordelijkheid — uitgegeven aan elke klant via een verlopende, intrekbare link, met herkomst op elk artefact.'],
      ['Onderhoud over versies heen', 'Geef het manifest opnieuw uit bij elke release, informeer getroffen klanten, en houd het pakket actueel — één consistente bewijsset over elk chip-, module- of apparaatprogramma.'],
    ] as [string, string][],
    honestyNote:
      'Wat het nooit zal doen: certificeren dat uw component het eindproduct van een klant conform maakt. Uiteindelijke conformiteit hangt af van het hele product — architectuur, integratie, firmware, provisioning, updates en gebruiksomgeving. Het pakket maakt uw deel van de zaak verdedigbaar; het velt de verklaring van de klant niet voor hen.',
    matrixTitle: 'De matrix voor gedeelde verantwoordelijkheid',
    matrixBody:
      'Het waardevolste artefact in het pakket: een ondubbelzinnige verdeling van wie wat bezit. De leverancier levert capaciteit en bewijs; de klant bezit het eindproduct.',
    matrixSupplierTitle: 'De leverancier levert',
    matrixSupplier: [
      'Beveiligingscapaciteiten van het geleverde component',
      'Integratie-informatie en begeleiding voor veilige standaardinstellingen',
      'Assurancebewijs en verificatiesamenvattingen',
      'Levenscyclus- en kwetsbaarheidsondersteuningsproces',
    ],
    matrixCustomerTitle: 'De klant behoudt',
    matrixCustomer: [
      'Risicobeoordeling en architectuur van de cyberbeveiliging van het eindproduct',
      'Systeem- / SoC-integratie, firmware, secure boot en herstel',
      'Provisioning, sleuteleigenaarschap, certificaten, apparaatlevenscyclus',
      'Kwetsbaarheidsafhandeling op productniveau, conformiteitsverklaring en CE-markering',
    ],
    sprintTitle: 'Een snelle oprit: de 60-daagse CRA-sprint',
    sprintBody:
      'Het versiegebonden leveringsmanifest en de matrix voor gedeelde verantwoordelijkheid zijn benoemde outputs van de begeleide 60-daagse CRA-sprint — de snelste route naar een eerste klantklaar pakket dat u kunt verfijnen tot een herhaalbaar leveringsmodel.',
    sprintCta: 'Bekijk de sprint van 60 dagen',
    ctaTitle: 'Neem één component mee naar de rondleiding',
    ctaBody:
      'Een sessie van 45 minuten: een van uw componenten, zijn leveringsgrens, en het assurancepakket dat het platform op dag één zou beginnen samen te stellen.',
    bookDemo: 'Demo aanvragen',
  },
} as const;

const STEP_ICONS = [Package, FileStack, ShieldCheck, Boxes, ShieldAlert, CalendarClock, Send, RefreshCw];

export default function SuppliersPage() {
  const { locale } = useLocale();
  const t = copy[locale];

  useSeo(
    pageSeo('/suppliers', {
      title: t.seoTitle,
      description: t.seoDescription,
    }),
  );

  return (
    <div className="w-full">
      <div className="container mx-auto px-4 md:px-8 pt-12 md:pt-16 pb-12 max-w-6xl">
        <PageHeader kicker={t.kicker} title={t.title} icon={Cpu} description={t.description} />

        <div className="-mt-4 mb-2 flex flex-wrap items-center gap-x-5 gap-y-1">
          <Link
            href="/suppliers/security-ip"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            {t.deepDiveLink} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          <Link
            href="/suppliers/tour"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            {t.tourLink} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* The statutory frame */}
        <div className="mt-6 rounded-2xl border border-border bg-card p-6 md:p-8">
          <h2 className="font-display text-xl font-normal tracking-tight text-foreground">
            {t.framingTitle}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t.framingBody}</p>
        </div>

        {/* The eight-step supplier journey */}
        <div className="mt-14">
          <h2 className="text-center font-display text-3xl font-normal tracking-tight text-foreground">
            {t.stepsTitle}
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {t.steps.map(([step, body], i) => {
              const Icon = STEP_ICONS[i];
              return (
                <motion.div
                  key={step}
                  className="rounded-xl border border-border bg-card p-5"
                  {...revealVariants(i)}
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <span className="mt-2 block font-mono text-xs text-primary-ink">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-1 font-display text-base font-normal tracking-tight text-foreground">
                    {step}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">{body}</p>
                </motion.div>
              );
            })}
          </div>
          <p className="mx-auto mt-6 max-w-2xl text-center text-sm text-muted-foreground italic">
            {t.honestyNote}
          </p>
        </div>

        {/* Shared-responsibility matrix */}
        <div className="mt-14 rounded-2xl border border-border bg-card p-6 md:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Handshake className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-xl font-normal tracking-tight text-foreground">
                {t.matrixTitle}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.matrixBody}</p>
            </div>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-background p-5">
              <p className="oxot-kicker">{t.matrixSupplierTitle}</p>
              <ul className="mt-3 space-y-2">
                {t.matrixSupplier.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-background p-5">
              <p className="oxot-kicker">{t.matrixCustomerTitle}</p>
              <ul className="mt-3 space-y-2">
                {t.matrixCustomer.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Package className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 60-Day sprint on-ramp */}
        <div className="mt-14 flex flex-col gap-4 rounded-2xl border border-border bg-primary/[0.04] p-6 md:flex-row md:items-center md:justify-between md:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <CalendarClock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="oxot-h3 text-foreground">{t.sprintTitle}</h3>
              <p className="mt-1 max-w-xl text-sm text-muted-foreground">{t.sprintBody}</p>
            </div>
          </div>
          <Link
            href="/cra-transit"
            className="cta-lift inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-primary px-5 py-2.5 text-sm font-medium text-primary-ink transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            {t.sprintCta} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* See the built product — the supplier tour + the live customer views */}
        <div className="mt-14 rounded-2xl border border-border bg-card p-6 md:p-8">
          <p className="oxot-kicker">{t.liveKicker}</p>
          <h2 className="oxot-h3 mt-1 text-foreground">{t.liveTitle}</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{t.liveBody}</p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link
              href="/suppliers/tour"
              className="cta-lift inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
            >
              {t.tourCta} <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="/conformity/delivery-manifest"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <FileStack className="h-4 w-4" /> {t.manifestLink}
            </a>
            <a
              href="/conformity/assurance-package"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <ShieldCheck className="h-4 w-4" /> {t.packageLink}
            </a>
          </div>
        </div>
      </div>

      {/* Live latest guidance from the CRA blog corpus (Series 4 supplier survival) */}
      <LiveCraBlogGuidesFeed />

      <div className="container mx-auto px-4 md:px-8 py-12 md:py-16 max-w-6xl">
        {/* CTA */}
        <div className="rounded-2xl border border-border bg-card p-8 text-center">
          <h2 className="font-display text-2xl font-normal tracking-tight text-foreground">
            {t.ctaTitle}
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">{t.ctaBody}</p>
          <Link
            href="/demo"
            className="cta-lift mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
          >
            {t.bookDemo} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
