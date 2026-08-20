import { Link } from 'wouter';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Factory,
  ClipboardCheck,
  FileCheck2,
  Send,
  LayoutList,
  ShieldCheck,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { useSeo } from '@/hooks/use-seo';
import { pageSeo } from '@/lib/page-seo';
import { useLocale } from '@/providers/locale-provider';
import { revealVariants } from '@/lib/motion';
import { ProductShot } from '@/components/product-shot';

// Localised page copy (nl-NL professional register, "u"). Machine-assisted —
// flag Dutch strings for a native reviewer before go-live.
const copy = {
  en: {
    seoTitle: 'For operators & asset owners — supplier CRA management',
    seoDescription:
      'The CRA binds your suppliers; NIS2 Article 21(2)(d) makes supply-chain security your duty. Register your estate, record supplier evidence per device against the CRA’s own Article 13 duties, and chase gaps through a secure supplier door.',
    kicker: 'FOR OPERATORS & ASSET OWNERS',
    title: 'Your suppliers carry the CRA duties. Now hold them to it.',
    description:
      'From 11 September 2026 your suppliers carry reporting duties; from 11 December 2027 every product entering your estate must carry CRA conformity. Your risk is their homework — and until now there was no per-device system of record for it.',
    framingTitle: 'The statutory frame, stated honestly',
    framingBody:
      'The CRA binds the manufacturer of every product you buy — the CE marking (Art 13(12)), the EU declaration of conformity with the product (Art 13(20)), Annex II information and instructions (Art 13(18)), a stated support-period end date at the time of purchase (Art 13(19)), a single point of contact for vulnerability reporting (Art 13(17)). Your own statutory hook is NIS2 Article 21(2)(d): supply-chain security is YOUR duty. The register records what has actually arrived — and never converts a fact into a verdict about your supplier.',
    stepsTitle: 'How it works today',
    steps: [
      ['Register the estate', 'Every purchased device with digital elements becomes a product file with the operator hat on — bulk import included.'],
      ['Link each supplier', 'A supplier register pivots the estate: every device knows who sold it, and every supplier shows its posture.'],
      ['Record the facts', 'A per-device procurement checklist, each item citing the CRA duty that binds the supplier’s manufacturer — on file, reported missing, or honestly unanswered.'],
      ['Ask through the door', 'One click issues an expiring, revocable link. Your supplier answers on a plain page; the answer lands on the device’s file with provenance.'],
      ['Read the posture board', 'Per supplier: what is on file, what is missing, how many questions are open, and the soonest support-period end across their devices.'],
    ] as [string, string][],
    honestyNote:
      'What it will never do: declare a supplier compliant. That judgement is not this application’s to make — and any tool that makes it is guessing.',
    ownDutiesTitle: 'Your own duties, in the same record',
    ownDutiesBody:
      'The same deployment carries your NIS2 obligations as an essential or important entity, AI Act deployer duties, and GDPR — each in the act’s own vocabulary, each citing its article. One record, both directions: what you owe, and what your suppliers owe you.',
    ctaTitle: 'Bring your supplier list to the walkthrough',
    ctaBody:
      'A 45-minute session: your estate, your suppliers, and what the register would show on day one.',
    bookDemo: 'Book a demo',
  },
  nl: {
    seoTitle: 'Voor exploitanten & asset owners — CRA-leveranciersbeheer',
    seoDescription:
      'De CRA bindt uw leveranciers; NIS2 artikel 21(2)(d) maakt de beveiliging van de toeleveringsketen uw plicht. Registreer uw installatiebestand, leg leveranciersbewijs per apparaat vast tegen de eigen artikel 13-plichten van de CRA, en vraag het ontbrekende op via een beveiligde leveranciersdeur.',
    kicker: 'VOOR EXPLOITANTEN & ASSET OWNERS',
    title: 'Uw leveranciers dragen de CRA-plichten. Houd ze eraan.',
    description:
      'Vanaf 11 september 2026 dragen uw leveranciers meldingsplichten; vanaf 11 december 2027 moet elk product dat uw installatie binnenkomt CRA-conformiteit dragen. Uw risico is hun huiswerk — en tot nu toe bestond daar geen systeem van vastlegging per apparaat voor.',
    framingTitle: 'Het wettelijke kader, eerlijk gesteld',
    framingBody:
      'De CRA bindt de fabrikant van elk product dat u koopt — de CE-markering (art. 13(12)), de EU-conformiteitsverklaring bij het product (art. 13(20)), Bijlage II-informatie en -instructies (art. 13(18)), een vermelde einddatum van de ondersteuningsperiode op het moment van aankoop (art. 13(19)), één contactpunt voor kwetsbaarheidsmeldingen (art. 13(17)). Uw eigen wettelijke haak is NIS2 artikel 21(2)(d): beveiliging van de toeleveringsketen is UW plicht. Het register legt vast wat daadwerkelijk is aangekomen — en zet een feit nooit om in een oordeel over uw leverancier.',
    stepsTitle: 'Zo werkt het vandaag',
    steps: [
      ['Registreer het installatiebestand', 'Elk gekocht apparaat met digitale elementen wordt een productdossier met de exploitantenrol — bulkimport inbegrepen.'],
      ['Koppel elke leverancier', 'Een leveranciersregister kantelt het bestand: elk apparaat weet wie het verkocht, en elke leverancier toont zijn stand.'],
      ['Leg de feiten vast', 'Een inkoopchecklist per apparaat, waarbij elk punt de CRA-plicht citeert die de fabrikant van de leverancier bindt — op dossier, gemeld ontbrekend, of eerlijk onbeantwoord.'],
      ['Vraag via de deur', 'Eén klik geeft een verlopende, intrekbare link uit. Uw leverancier antwoordt op een eenvoudige pagina; het antwoord landt op het dossier van het apparaat, met herkomst.'],
      ['Lees het standenbord', 'Per leverancier: wat op dossier staat, wat ontbreekt, hoeveel vragen openstaan, en de vroegste einddatum van de ondersteuningsperiode over hun apparaten.'],
    ] as [string, string][],
    honestyNote:
      'Wat het nooit zal doen: een leverancier conform verklaren. Dat oordeel is niet aan deze applicatie — en elk systeem dat het wél velt, gokt.',
    ownDutiesTitle: 'Uw eigen plichten, in hetzelfde dossier',
    ownDutiesBody:
      'Dezelfde omgeving draagt uw NIS2-verplichtingen als essentiële of belangrijke entiteit, de AI-verordeningsplichten als gebruiksverantwoordelijke, en de AVG — elk in het eigen vocabulaire van de wet, elk met artikelverwijzing. Eén dossier, beide richtingen: wat u verschuldigd bent, en wat uw leveranciers u verschuldigd zijn.',
    ctaTitle: 'Neem uw leverancierslijst mee naar de rondleiding',
    ctaBody:
      'Een sessie van 45 minuten: uw installatiebestand, uw leveranciers, en wat het register op dag één zou tonen.',
    bookDemo: 'Demo aanvragen',
  },
} as const;

const STEP_ICONS = [LayoutList, Factory, ClipboardCheck, Send, FileCheck2];

export default function OperatorsPage() {
  const { locale } = useLocale();
  const t = copy[locale];

  useSeo(
    pageSeo('/operators', {
      title: t.seoTitle,
      description: t.seoDescription,
      ogImage: '/media/product/prod-operator-procurement.jpg',
    }),
  );

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 md:py-16 max-w-6xl">
      <PageHeader kicker={t.kicker} title={t.title} icon={Factory} description={t.description} />

      {/* The statutory frame */}
      <div className="rounded-2xl border border-border bg-card p-6 md:p-8">
        <h2 className="font-display text-xl font-normal tracking-tight text-foreground">
          {t.framingTitle}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t.framingBody}</p>
      </div>

      {/* The real operator surface: the per-device procurement file. */}
      <div className="mt-8">
        <ProductShot
          src="/media/product/prod-operator-procurement.jpg"
          alt={
            locale === 'nl'
              ? 'Het inkoopdossier per apparaat: elk CRA-artikel 13-punt op-dossier, niet-geleverd of onbeantwoord.'
              : 'The per-device procurement file: each CRA Article 13 item on file, not provided, or unanswered.'
          }
          caption={
            locale === 'nl'
              ? 'Het inkoopdossier — wat elke leverancier daadwerkelijk heeft geleverd, elk punt met zijn CRA-plicht.'
              : 'The procurement file — what each supplier has actually provided, every item citing its CRA duty.'
          }
          className="mx-auto max-w-5xl"
        />
      </div>

      {/* The five steps */}
      <div className="mt-14">
        <h2 className="text-center font-display text-3xl font-normal tracking-tight text-foreground">
          {t.stepsTitle}
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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

      {/* Own duties */}
      <div className="mt-14 rounded-2xl border border-border bg-card p-6 md:p-8 flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <ShieldCheck className="h-5 w-5 text-primary" />
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
