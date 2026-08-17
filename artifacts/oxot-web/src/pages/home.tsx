import { Link } from 'wouter';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  ClipboardCheck,
  ShieldCheck,
  Clock,
  FileStack,
  BookOpen,
  Factory,
  Scale,
  ServerCog,
} from 'lucide-react';
import { useSeo } from '@/hooks/use-seo';
import { pageSeo } from '@/lib/page-seo';
import { JsonLd } from '@/components/json-ld';
import { LiveRegulatoryNewsFeed } from '@/components/sections/live-regulatory-news-feed';
import { LiveCraBlogGuidesFeed } from '@/components/sections/live-cra-blog-guides-feed';
import { useLocale } from '@/providers/locale-provider';
import { revealVariants } from '@/lib/motion';

// Localised page copy (nl-NL professional register, "u"). Machine-assisted —
// flag Dutch strings for a native reviewer before go-live. Structure mirrors the
// English source so every visible string has a Dutch equivalent.
const copy = {
  en: {
    seoTitle: 'OXOT Conformance Platform — the EU conformance system of record',
    seoDescription:
      'One working record per product with digital elements: the guided CRA journey to a defensible Annex VII file, statutory clocks running live, verbatim statutory texts for seven EU acts — and supplier CRA management for operators and asset owners.',
    kicker: 'The EU Conformance System of Record',
    heroTitle: 'Run product conformity as an operation, not a fire drill.',
    heroBody:
      'Every product with digital elements in one working record: the guided CRA journey from classification to a defensible Annex VII technical file, statutory clocks running live — and the same record carries NIS2, RED, the AI Act, GDPR and the Data Act, each cited in the act\u2019s own words.',
    bookDemo: 'Book a demo',
    takeCheck: 'Take the 2-minute check',
    clockStrong: '11 December 2027 — full application.',
    clockRest:
      ' From 11 September 2026, reporting obligations are already enforceable — a 24-hour clock, for products already on the market.',
    operatorKicker: 'New — for operators & asset owners',
    operatorTitle: 'Your suppliers carry the CRA duties. Now hold them to it.',
    operatorBody:
      'If you buy and operate connected equipment, the CRA binds your suppliers — and NIS2 Article 21(2)(d) makes supply-chain security your own duty. Register your estate, record what each supplier has actually provided against the CRA\u2019s own Article 13 duties, chase what\u2019s missing through a secure supplier door, and read the posture per supplier — without the tool ever pretending a verdict.',
    operatorLink: 'See supplier CRA management \u2192',
    honestyTitle: 'What this application will never tell you',
    honestyBody:
      // honesty-ok: quotes the claim precisely to REFUSE it — the sentence says the app will never make it.
      'It will never tell you that you are compliant. Article 32 keeps the conformity assessment with the manufacturer — or a notified body. What it shows is the state of your evidence against the statute\u2019s own words, and where the answer is \u201cnobody has answered yet\u201d, it says exactly that.',
    stallsKicker: 'Why teams stall',
    stallsTitle: 'The CRA is an operations problem before it is a paperwork problem',
    stalls: [
      {
        title: 'Evidence lives everywhere.',
        body: "Spreadsheets, tickets and engineers' laptops. Nothing is assessment-ready when the auditor asks.",
      },
      {
        title: 'Clocks start without warning.',
        body: 'Article 14 gives 24 hours for early warning and 72 for detailed notification — from awareness.',
      },
      {
        title: 'One portfolio, many classes.',
        body: 'Default, Class I and Class II each take a different route. Getting it wrong costs the CE mark.',
      },
    ],
    pillarsKicker: 'The platform',
    pillarsTitle: 'One record, every regulation',
    pillarsLink: 'Explore the platform \u2192',
    pillars: [
      {
        title: 'A guided compliance journey, per product',
        body: 'Eight steps from classification to a defensible Annex VII technical file and Annex V Declaration of Conformity — evidence assembled from what you already hold.',
      },
      {
        title: 'Statutory Article 14 clocks, running live',
        body: 'The 24-hour early warning and 72-hour notification tracked per product, with a PSIRT triage board and ENISA single-reporting-platform filing.',
      },
      {
        title: 'The statute itself, verbatim',
        body: 'Readable, citable wikis for the CRA, NIS2, the AI Act, Machinery, RED, GDPR and the Data Act — as amended, corrigenda applied and disclosed, character-verified in CI. The law, not a summary of it.',
      },
      {
        title: 'Supplier CRA management for operators',
        body: 'Register the equipment you operate, record what each supplier has provided against the CRA\u2019s Article 13 duties, and ask for what\u2019s missing through a secure supplier door.',
      },
    ],
    deployTitle: 'Single tenant, always',
    deployBody:
      'Run it in a secure datacenter, or on your own premises with a local AI model — your evidence never leaves your control.',
    deployLink: 'See the deployment options →',
    personasKicker: "Who it's for",
    personasTitle: 'Wherever you sit in the value chain',
    personas: [
      ['Owner / operators — NEW', 'Your suppliers carry the CRA; you carry NIS2 supply-chain security. Register your estate, file supplier evidence per device, chase gaps through the supplier door.'],
      ['Product manufacturers', 'The full Annex VII file, the CE marking, and the reporting duties from day one.'],
      ['OEMs', 'Portfolio math against 11 Dec 2027 — where Module H is the only route that fits.'],
      ['Integrators', 'Article 22: know which side of "substantial modification" your projects sit on.'],
      ['Distributors', 'Verify CE marking and the Declaration of Conformity on every line you offer.'],
      ['Authorised representatives', 'Article 18 mandates recorded with their scope — what the mandate grants, and what it does not.'],
      ['Open-source stewards', 'Article 24\u2019s lighter regime stated honestly — including the Article 64(10)(b) exemption from fines.'],
    ] as [string, string][],
    finalTitle: 'See your own portfolio in the workbench',
    finalBody:
      'A 45-minute walkthrough covers classification, the evidence you already hold, and what a defensible Annex VII technical file looks like for your products.',
  },
  nl: {
    seoTitle: 'OXOT Conformance Platform — het EU-conformiteitssysteem van vastlegging',
    seoDescription:
      'Eén werkend dossier per product met digitale elementen: het begeleide CRA-traject naar een verdedigbaar Bijlage VII-dossier, wettelijke klokken die live lopen, woordelijke wetteksten voor zeven EU-verordeningen — en CRA-leveranciersbeheer voor exploitanten en asset owners.',
    kicker: 'Het EU-conformiteitssysteem van vastlegging',
    heroTitle: 'Voer productconformiteit uit als een operatie, niet als een brandoefening.',
    heroBody:
      'Elk product met digitale elementen in één werkend dossier: het begeleide CRA-traject van classificatie tot een verdedigbaar technisch dossier volgens Bijlage VII, wettelijke klokken die live lopen — en hetzelfde dossier draagt NIS2, RED, de AI-verordening, de AVG en de Dataverordening, elk geciteerd in de eigen woorden van de wet.',
    bookDemo: 'Demo aanvragen',
    takeCheck: 'Doe de 2-minutencheck',
    clockStrong: '11 december 2027 — volledige toepassing.',
    clockRest:
      ' Vanaf 11 september 2026 zijn de meldingsverplichtingen al afdwingbaar — een klok van 24 uur, voor producten die al op de markt zijn.',
    operatorKicker: 'Nieuw — voor exploitanten & asset owners',
    operatorTitle: 'Uw leveranciers dragen de CRA-plichten. Houd ze eraan.',
    operatorBody:
      'Koopt en exploiteert u verbonden apparatuur, dan bindt de CRA uw leveranciers — en maakt NIS2 artikel 21(2)(d) de beveiliging van de toeleveringsketen uw eigen plicht. Registreer uw installatiebestand, leg vast wat elke leverancier daadwerkelijk heeft geleverd tegen de eigen artikel 13-plichten van de CRA, vraag het ontbrekende op via een beveiligde leveranciersdeur, en lees de stand per leverancier — zonder dat het systeem ooit een oordeel veinst.',
    operatorLink: 'Bekijk CRA-leveranciersbeheer \u2192',
    honestyTitle: 'Wat deze applicatie u nooit zal vertellen',
    honestyBody:
      'Zij zal u nooit vertellen dat u conform bent. Artikel 32 laat de conformiteitsbeoordeling bij de fabrikant — of een aangemelde instantie. Wat zij toont is de stand van uw bewijs tegen de eigen woorden van de wet, en waar het antwoord \u201cnog door niemand beantwoord\u201d is, staat dat er precies zo.',
    stallsKicker: 'Waarom teams vastlopen',
    stallsTitle: 'De CRA is een operationeel probleem voordat het een papierprobleem is',
    stalls: [
      {
        title: 'Bewijs staat overal verspreid.',
        body: 'Spreadsheets, tickets en de laptops van engineers. Niets is beoordelingsklaar wanneer de auditor erom vraagt.',
      },
      {
        title: 'Klokken beginnen zonder waarschuwing.',
        body: 'Artikel 14 geeft 24 uur voor een vroegtijdige waarschuwing en 72 uur voor een gedetailleerde melding — vanaf het moment van bekendheid.',
      },
      {
        title: 'Eén portfolio, meerdere klassen.',
        body: 'Standaard, Klasse I en Klasse II volgen elk een andere route. Een verkeerde keuze kost u de CE-markering.',
      },
    ],
    pillarsKicker: 'Het platform',
    pillarsTitle: 'Eén dossier, elke verordening',
    pillarsLink: 'Bekijk het platform \u2192',
    pillars: [
      {
        title: 'Een begeleid conformiteitstraject, per product',
        body: 'Acht stappen van classificatie tot een verdedigbaar technisch dossier volgens Bijlage VII en een conformiteitsverklaring volgens Bijlage V — bewijs samengesteld uit wat u al in huis hebt.',
      },
      {
        title: 'Wettelijke Artikel 14-klokken, live actief',
        body: 'De vroegtijdige waarschuwing van 24 uur en de melding van 72 uur, per product bijgehouden, met een PSIRT-triageboard en indiening via het ENISA single reporting platform.',
      },
      {
        title: 'De wet zelf, woordelijk',
        body: 'Leesbare, citeerbare wiki\u2019s voor de CRA, NIS2, de AI-verordening, de Machineverordening, RED, de AVG en de Dataverordening — zoals gewijzigd, rectificaties toegepast en vermeld, tekengetrouw geverifieerd in CI. De wet, geen samenvatting ervan.',
      },
      {
        title: 'CRA-leveranciersbeheer voor exploitanten',
        body: 'Registreer de apparatuur die u exploiteert, leg vast wat elke leverancier heeft geleverd tegen de artikel 13-plichten van de CRA, en vraag het ontbrekende op via een beveiligde leveranciersdeur.',
      },
    ],
    deployTitle: 'Altijd single tenant',
    deployBody:
      'Draai het in een beveiligd datacenter, of op uw eigen locatie met een lokaal AI-model — uw bewijs verlaat nooit uw beheer.',
    deployLink: 'Bekijk de implementatieopties →',
    personasKicker: 'Voor wie het is',
    personasTitle: 'Waar u zich ook in de waardeketen bevindt',
    personas: [
      ['Eigenaren / exploitanten — NIEUW', 'Uw leveranciers dragen de CRA; u draagt de NIS2-plicht voor de toeleveringsketen. Registreer uw installatiebestand, archiveer leveranciersbewijs per apparaat, en vraag het ontbrekende op via de leveranciersdeur.'],
      ['Productfabrikanten', 'Het volledige Bijlage VII-dossier, de CE-markering en de meldingsplichten vanaf dag één.'],
      ['OEM’s', 'Portfolioberekening richting 11 dec 2027 — waar Module H de enige passende route is.'],
      ['Integrators', 'Artikel 22: weet aan welke kant van een “substantiële wijziging” uw projecten vallen.'],
      ['Distributeurs', 'Verifieer de CE-markering en de conformiteitsverklaring op elke lijn die u aanbiedt.'],
      ['Gemachtigde vertegenwoordigers', 'Artikel 18-mandaten vastgelegd met hun reikwijdte — wat het mandaat verleent, en wat niet.'],
      ['Open-source stewards', 'Het lichtere regime van artikel 24 eerlijk weergegeven — inclusief de vrijstelling van boetes onder artikel 64(10)(b).'],
    ] as [string, string][],
    finalTitle: 'Bekijk uw eigen portfolio in de workbench',
    finalBody:
      'Een rondleiding van 45 minuten behandelt classificatie, het bewijs dat u al in huis hebt, en hoe een verdedigbaar technisch dossier volgens Bijlage VII eruitziet voor uw producten.',
  },
} as const;

const PILLAR_ICONS = [FileStack, Clock, BookOpen, Factory];

export default function CraHomePage() {
  const { locale } = useLocale();
  const t = copy[locale];

  useSeo(
    pageSeo('/', {
      title: t.seoTitle,
      description: t.seoDescription,
    }),
  );

  return (
    <div className="w-full">
      <JsonLd
        id="ld-organization"
        data={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'OXOT Conformance Platform',
          description:
            'Single-tenant platform to run EU Cyber Resilience Act (CRA) conformity as an operation.',
          url: typeof window !== 'undefined' ? window.location.origin : undefined,
        }}
      />
      {/* Hero — deliberately NOT animated (Phase 20a): entrance animations
          start at opacity 0 and wait for hydration, and on this page the
          bundle parse left the headline and BOTH conversion CTAs invisible
          for the first seconds of a first visit. The primary CTA must never
          depend on JavaScript to be seen. */}
      <section className="border-b border-border bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container mx-auto px-4 md:px-8 py-20 md:py-28 max-w-4xl text-center">
          <p className="oxot-kicker">{t.kicker}</p>
          <h1 className="oxot-h1 mt-4 text-foreground">
            {t.heroTitle}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {t.heroBody}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/demo"
              className="cta-lift inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
            >
              {t.bookDemo} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/cra-check"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <ClipboardCheck className="h-4 w-4" /> {t.takeCheck}
            </Link>
          </div>
        </div>
      </section>

      {/* Statutory clock — dated, factual, no penalty framing */}
      <section className="border-b border-border bg-card">
        <div className="container mx-auto px-4 md:px-8 py-8 max-w-4xl">
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <Clock className="h-6 w-6 shrink-0 text-primary" />
            <p className="text-sm leading-relaxed text-foreground">
              <span className="font-semibold">{t.clockStrong}</span>{t.clockRest}
            </p>
          </div>
        </div>
      </section>

      {/* The operator shape (Phase 21) — the segment nobody else serves. */}
      <section className="border-b border-border bg-primary/[0.04]">
        <div className="container mx-auto px-4 md:px-8 py-12 md:py-16 max-w-4xl">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
              <Factory className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="oxot-kicker">{t.operatorKicker}</p>
              <h2 className="oxot-h2 mt-1 text-foreground">{t.operatorTitle}</h2>
              <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
                {t.operatorBody}
              </p>
              <Link
                href="/operators"
                className="mt-4 inline-block text-sm font-medium text-primary-ink hover:underline"
              >
                {t.operatorLink}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Live regulatory news — API-driven, degrades gracefully */}
      <LiveRegulatoryNewsFeed />

      {/* In-depth CRA Engineering & Compliance Guides — dynamically served */}
      <LiveCraBlogGuidesFeed />

      {/* Why teams stall */}
      <section className="border-t border-border">
        <div className="container mx-auto px-4 md:px-8 py-16 md:py-20 max-w-6xl">
          <p className="oxot-kicker text-center">{t.stallsKicker}</p>
          <h2 className="oxot-h2 mt-2 text-center text-foreground">
            {t.stallsTitle}
          </h2>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {t.stalls.map((s, i) => (
              <motion.div
                key={s.title}
                className="rounded-2xl border border-border bg-card p-6 shadow-e1"
                {...revealVariants(i)}
              >
                <h3 className="oxot-h3 text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform pillars */}
      <section className="border-t border-border bg-card/40">
        <div className="container mx-auto px-4 md:px-8 py-16 md:py-20 max-w-6xl">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="oxot-kicker">{t.pillarsKicker}</p>
              <h2 className="oxot-h2 mt-2 text-foreground">
                {t.pillarsTitle}
              </h2>
            </div>
            <Link href="/product" className="text-sm font-medium text-primary-ink hover:underline">
              {t.pillarsLink}
            </Link>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {t.pillars.map((p, i) => {
              const Icon = PILLAR_ICONS[i];
              return (
                <motion.div
                  key={p.title}
                  className="rounded-2xl border border-border bg-card p-6 shadow-e1"
                  {...revealVariants(i)}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="oxot-h3 mt-4 text-foreground">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* The honesty doctrine — the differentiator nobody else will say. */}
      <section className="border-t border-border bg-card">
        <div className="container mx-auto px-4 md:px-8 py-12 max-w-3xl text-center">
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
            <Scale className="h-5 w-5 text-primary" />
          </div>
          <h2 className="oxot-h3 mt-3 text-foreground">{t.honestyTitle}</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {t.honestyBody}
          </p>
        </div>
      </section>

      {/* Deployment */}
      <section className="border-t border-border">
        <div className="container mx-auto px-4 md:px-8 py-16 md:py-20 max-w-4xl text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
            <ServerCog className="h-6 w-6 text-primary" />
          </div>
          <h2 className="oxot-h2 mt-4 text-foreground">
            {t.deployTitle}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">
            {t.deployBody}
          </p>
          <Link href="/deployment" className="mt-5 inline-block text-sm font-medium text-primary-ink hover:underline">
            {t.deployLink}
          </Link>
        </div>
      </section>

      {/* Personas */}
      <section className="border-t border-border bg-card/40">
        <div className="container mx-auto px-4 md:px-8 py-16 md:py-20 max-w-6xl">
          <p className="oxot-kicker text-center">{t.personasKicker}</p>
          <h2 className="oxot-h2 mt-2 text-center text-foreground">
            {t.personasTitle}
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {t.personas.map(([who, what], i) => (
              <motion.div
                key={who}
                className="flex items-start gap-3 rounded-xl border border-border bg-card p-5"
                {...revealVariants(i)}
              >
                <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="font-medium text-foreground">{who}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{what}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-border">
        <div className="container mx-auto px-4 md:px-8 py-16 md:py-24 max-w-3xl text-center">
          <h2 className="oxot-h2 text-foreground">
            {t.finalTitle}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-base text-muted-foreground">
            {t.finalBody}
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/demo"
              className="cta-lift inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
            >
              {t.bookDemo} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
