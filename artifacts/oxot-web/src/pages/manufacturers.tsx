import { Link } from 'wouter';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  PackageCheck,
  Compass,
  ClipboardList,
  FileText,
  ScrollText,
  ShieldAlert,
  BadgeCheck,
  Boxes,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { useSeo } from '@/hooks/use-seo';
import { pageSeo } from '@/lib/page-seo';
import { useLocale } from '@/providers/locale-provider';
import { revealVariants } from '@/lib/motion';

// Localised page copy (nl-NL professional register, "u"). Machine-assisted —
// flag Dutch strings for a native reviewer before go-live.
const copy = {
  en: {
    seoTitle: 'For manufacturers — CRA technical documentation & EU Declaration of Conformity',
    seoDescription:
      'You place the product on the market, so you carry the Cyber Resilience Act. Assemble Annex I evidence, build the Annex VII technical file, self-assess under Module A, and issue the Annex V EU Declaration of Conformity — every duty citing its own article, none of it decided for you.',
    kicker: 'FOR MANUFACTURERS',
    title: 'You place the product on the market. You carry the CRA.',
    description:
      'From 11 September 2026 the reporting duties bite; from 11 December 2027 every product with digital elements you sell into the EU must carry CRA conformity. Under Module A you declare that conformity on your sole responsibility — the platform makes the declaration defensible, and never makes it for you.',
    framingTitle: 'The statutory frame, stated honestly',
    framingBody:
      'For most products the CRA route is self-assessment — internal control under Annex VIII, Module A. You draw up the Annex VII technical documentation, run the Annex I essential-requirements risk assessment, apply the CE marking (Art 30), and sign the Annex V EU declaration of conformity on your sole responsibility. Then Article 13/14 keeps binding you: a single point of contact for vulnerability reports, a support-period end date fixed at sale (Art 13(19)), and — once you know of an actively exploited vulnerability — the 24-hour early warning and 72-hour notification to your CSIRT and ENISA. The platform holds every one of those as a fact with provenance. It never concludes that you have met them: that judgement (Art 32) is the notified body’s or the market surveillance authority’s, not this application’s.',
    stepsTitle: 'The CRA journey, per product',
    steps: [
      ['Scope & classify', 'Is it a product with digital elements? Default, important (Class I/II) or critical (Annex III/IV) — the class sets the route, and the class is on the record with its reasoning.'],
      ['Assess Annex I', 'Run the essential-requirements risk assessment: secure-by-default, no known exploitable vulnerabilities, integrity, data minimisation — each requirement a row, each row citing its Annex I clause.'],
      ['Build the evidence vault', 'SBOM, secure-development records, test results, vulnerability-handling process — linked to the requirement they satisfy, hashed, and dated. Evidence, not assertions.'],
      ['Assemble Annex VII', 'The technical documentation composes from what is on file: product description, risk assessment, the list of applied standards, and the evidence index a notified body can actually follow.'],
      ['Assess conformity', 'Module A internal control for most products; the notified-body route surfaced where the class demands it. The chosen route, and why, is recorded — not assumed.'],
      ['Declare & CE-mark', 'The Annex V EU declaration of conformity draws from the file; the CE marking obligation (Art 30) and the retention duty (10 years / support period) are tracked, not left to memory.'],
      ['Run post-market', 'Article 13/14 clocks: the single point of contact, the support-period end date, and — on an actively exploited vulnerability — the 24-hour and 72-hour reporting duties, timed from the file.'],
      ['Keep it current', 'A substantial modification reopens conformity; an amendment to the law updates the requirement set. The record moves when the product or the statute moves — provably.'],
    ] as [string, string][],
    honestyNote:
      'What it will never do: declare your product compliant, or file a report on your behalf. Under Module A the declaration is yours to sign on your sole responsibility — the platform makes it defensible, it does not make it for you.',
    ownDutiesTitle: 'Every hat you also wear, in the same record',
    ownDutiesBody:
      'Import a component and you carry the importer’s verification duty; sell into the EU from outside it and you need an authorised representative; integrate someone else’s module and the system-integrator obligations attach. The same product file carries the AI Act where AI is embedded, RED and the Machinery Regulation where they overlap, and the Data Act — each duty in that act’s own vocabulary, each citing its article. One record, every hat.',
    ctaTitle: 'Bring one real product to the walkthrough',
    ctaBody:
      'A 45-minute session: your product, its class, and the Annex VII file the platform would start assembling on day one.',
    bookDemo: 'Book a demo',
    tourLink: 'Watch the 90-second tour',
  },
  nl: {
    seoTitle: 'Voor fabrikanten — CRA technische documentatie & EU-conformiteitsverklaring',
    seoDescription:
      'U brengt het product op de markt, dus u draagt de Cyber Resilience Act. Verzamel Bijlage I-bewijs, stel het technisch dossier van Bijlage VII op, beoordeel zelf onder Module A, en geef de EU-conformiteitsverklaring van Bijlage V uit — elke plicht met eigen artikelverwijzing, niets ervan voor u beslist.',
    kicker: 'VOOR FABRIKANTEN',
    title: 'U brengt het product op de markt. U draagt de CRA.',
    description:
      'Vanaf 11 september 2026 gelden de meldingsplichten; vanaf 11 december 2027 moet elk product met digitale elementen dat u in de EU verkoopt CRA-conformiteit dragen. Onder Module A verklaart u die conformiteit op eigen verantwoordelijkheid — het platform maakt de verklaring verdedigbaar, en velt haar nooit voor u.',
    framingTitle: 'Het wettelijke kader, eerlijk gesteld',
    framingBody:
      'Voor de meeste producten is de CRA-route zelfbeoordeling — interne controle onder Bijlage VIII, Module A. U stelt de technische documentatie van Bijlage VII op, voert de risicobeoordeling van de essentiële eisen van Bijlage I uit, brengt de CE-markering aan (art. 30), en ondertekent de EU-conformiteitsverklaring van Bijlage V op eigen verantwoordelijkheid. Vervolgens blijft artikel 13/14 u binden: één contactpunt voor kwetsbaarheidsmeldingen, een einddatum van de ondersteuningsperiode vastgezet bij verkoop (art. 13(19)), en — zodra u weet van een actief misbruikte kwetsbaarheid — de vroegtijdige waarschuwing binnen 24 uur en de melding binnen 72 uur aan uw CSIRT en ENISA. Het platform legt elk daarvan vast als feit met herkomst. Het concludeert nooit dat u eraan hebt voldaan: dat oordeel (art. 32) is aan de aangemelde instantie of de markttoezichtautoriteit, niet aan deze applicatie.',
    stepsTitle: 'Het CRA-traject, per product',
    steps: [
      ['Afbakenen & classificeren', 'Is het een product met digitale elementen? Standaard, belangrijk (klasse I/II) of kritiek (Bijlage III/IV) — de klasse bepaalt de route, en de klasse staat op dossier met haar onderbouwing.'],
      ['Bijlage I beoordelen', 'Voer de risicobeoordeling van de essentiële eisen uit: veilig-standaard, geen bekende misbruikbare kwetsbaarheden, integriteit, dataminimalisatie — elke eis een regel, elke regel met verwijzing naar haar Bijlage I-bepaling.'],
      ['Bouw de bewijskluis', 'SBOM, records van veilige ontwikkeling, testresultaten, proces voor kwetsbaarheidsafhandeling — gekoppeld aan de eis die zij vervullen, gehasht en gedateerd. Bewijs, geen beweringen.'],
      ['Bijlage VII samenstellen', 'De technische documentatie stelt zich samen uit wat op dossier staat: productbeschrijving, risicobeoordeling, de lijst toegepaste normen, en de bewijsindex die een aangemelde instantie daadwerkelijk kan volgen.'],
      ['Conformiteit beoordelen', 'Interne controle onder Module A voor de meeste producten; de route via de aangemelde instantie getoond waar de klasse dat eist. De gekozen route, en waarom, wordt vastgelegd — niet aangenomen.'],
      ['Verklaren & CE-markeren', 'De EU-conformiteitsverklaring van Bijlage V put uit het dossier; de CE-markeringsplicht (art. 30) en de bewaarplicht (10 jaar / ondersteuningsperiode) worden gevolgd, niet aan het geheugen overgelaten.'],
      ['Post-market uitvoeren', 'Artikel 13/14-klokken: het contactpunt, de einddatum van de ondersteuningsperiode, en — bij een actief misbruikte kwetsbaarheid — de meldingsplichten van 24 uur en 72 uur, getimed vanaf het dossier.'],
      ['Houd het actueel', 'Een substantiële wijziging heropent de conformiteit; een wetswijziging werkt de eisenset bij. Het dossier beweegt mee wanneer het product of de wet beweegt — aantoonbaar.'],
    ] as [string, string][],
    honestyNote:
      'Wat het nooit zal doen: uw product conform verklaren, of namens u een melding indienen. Onder Module A is de verklaring aan u om op eigen verantwoordelijkheid te ondertekenen — het platform maakt haar verdedigbaar, het velt haar niet voor u.',
    ownDutiesTitle: 'Elke rol die u óók draagt, in hetzelfde dossier',
    ownDutiesBody:
      'Importeert u een component, dan draagt u de verificatieplicht van de importeur; verkoopt u van buiten de EU naar binnen, dan hebt u een gemachtigde vertegenwoordiger nodig; integreert u de module van een ander, dan hechten de systeemintegratorplichten. Hetzelfde productdossier draagt de AI-verordening waar AI is ingebed, RED en de Machineverordening waar zij overlappen, en de Data Act — elke plicht in het eigen vocabulaire van die wet, elk met artikelverwijzing. Eén dossier, elke rol.',
    ctaTitle: 'Neem één echt product mee naar de rondleiding',
    ctaBody:
      'Een sessie van 45 minuten: uw product, zijn klasse, en het Bijlage VII-dossier dat het platform op dag één zou beginnen samen te stellen.',
    bookDemo: 'Demo aanvragen',
    tourLink: 'Bekijk de rondleiding van 90 seconden',
  },
} as const;

const STEP_ICONS = [Compass, ClipboardList, Boxes, FileText, BadgeCheck, ScrollText, ShieldAlert, PackageCheck];

export default function ManufacturersPage() {
  const { locale } = useLocale();
  const t = copy[locale];

  useSeo(
    pageSeo('/manufacturers', {
      title: t.seoTitle,
      description: t.seoDescription,
    }),
  );

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 md:py-16 max-w-6xl">
      <PageHeader kicker={t.kicker} title={t.title} icon={PackageCheck} description={t.description} />

      <div className="-mt-4 mb-2">
        <Link href="/tour" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
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

      {/* The eight-step CRA journey */}
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

      {/* Every hat */}
      <div className="mt-14 rounded-2xl border border-border bg-card p-6 md:p-8 flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <BadgeCheck className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-xl font-normal tracking-tight text-foreground">
            {t.ownDutiesTitle}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.ownDutiesBody}</p>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-14 rounded-2xl border border-border bg-card p-8 text-center">
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
  );
}
