import { Link } from 'wouter';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Rocket,
  ServerCog,
  Users,
  PackageCheck,
  Trash2,
  ShieldCheck,
  FileCheck2,
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
//
// HONESTY BOUNDARY (Module A / CRA Art 32): a self-assessed product is
// declared conformant by the MANUFACTURER on its sole responsibility. This
// page must say the consultants and the platform GUIDE the process and
// PRODUCE the technical file and artifacts — the customer signs the
// declaration. It never says OXOT certifies, approves, or concludes
// conformity.
const copy = {
  en: {
    seoTitle: 'CRA Transit — the 60-day assisted conformity sprint | OXOT',
    seoDescription:
      'A one-time, consultant-led CRA conformity engagement for a single self-assessed product. We provision a dedicated single-tenant instance, run the whole eight-phase process with you in 60 days, hand you every artifact — the Annex VII technical file, your Annex V declaration, SBOM, risk assessment, CVD policy — then take the platform down.',
    kicker: 'ASSISTED · ONE-TIME · 60 DAYS',
    title: 'CRA Transit: your conformity file, built with you in 60 days.',
    description:
      "For a single product that self-assesses under the CRA, you don't need a standing programme — you need the file, done right, once. Our expert consultants run the entire eight-phase process with you on a dedicated, single-tenant instance, produce every artifact the regulation asks for, hand them to you as durable files, and take the platform down. Fast, assisted, defensible.",
    forWhoTitle: "Who it's for",
    forWho: [
      ['A single self-assessed product', 'A product with digital elements that self-assesses under Module A (internal control) — not listed as important or critical, so a notified body is not required.'],
      ['A team that wants the assisted route', 'You want the work done with you by people who do this daily, on a fixed 60-day clock — not a long-term platform commitment.'],
      ['A defensible file, once', 'You need an audit-ready Annex VII technical file and a declaration you can stand behind, produced the right way — then you want to get back to building.'],
    ] as [string, string][],
    modelKicker: 'How the 60 days work',
    modelTitle: 'Provision · run · export · teardown',
    modelSteps: [
      ['Provision', 'We stand up a dedicated single-tenant instance for you — in the AWS European Sovereign Cloud (EU data residency) or on your own premises. Yours alone, for 60 days.'],
      ['Run', 'Our consultants work alongside your team through every phase, in the platform, using the pre-built statutory rules, corpus and file templates that compress months into weeks.'],
      ['Export', 'Every artifact is generated and exported to you as durable files you keep — the technical file, the declaration, the SBOM, the evidence, the policies.'],
      ['Teardown', 'At the end of the engagement the instance is decommissioned and destroyed. You hold the artifacts; nothing of yours remains behind.'],
    ] as [string, string][],
    processKicker: 'The process',
    processTitle: 'Eight phases, one product, done together',
    processNote:
      'The same eight-phase journey the platform runs — with our consultants beside you at each step. For CRA Transit the eighth phase is not ongoing operation but a clean handover: your files out, the platform down.',
    phases: [
      ['Scope', 'Confirm the product is in scope and capture exactly what it is.'],
      ['Classify', 'Place it in its CRA class and confirm the self-assessment (Module A) route.'],
      ['Assess risk', 'Build the Annex I cybersecurity risk assessment that drives the design.'],
      ['Gather evidence', 'SBOM, secure-development documentation and the vulnerability-handling process, into the record.'],
      ['Track requirements', 'Every Annex I essential requirement — the 13 product properties and the vulnerability-handling processes — evidenced.'],
      ['Assemble the file', 'The Annex VII technical documentation, assembled from your own evidence.'],
      ['Declare conformity', 'You draw up and sign the Annex V EU declaration of conformity, on your responsibility. We prepare it; the declaration is yours.'],
      ['Handover & teardown', 'Every artifact exported to you as durable files; the dedicated instance decommissioned.'],
    ] as [string, string][],
    artifactsKicker: 'What you leave with',
    artifactsTitle: 'A complete Annex VII package — as durable files',
    artifactsNote:
      'Grounded in the regulation itself: Annex VII lists the minimum content of the technical documentation, and Annex V the format of the declaration. You leave with all of it, exported and yours to keep for the ten-year (or support-period) retention duty.',
    artifacts: [
      'The Annex VII technical file — the general product description, the design and development record, and the vulnerability-handling processes',
      'Your signed Annex V EU declaration of conformity',
      'The Annex I cybersecurity risk assessment',
      'A machine-readable SBOM (software bill of materials)',
      'The coordinated vulnerability disclosure policy and reporting contact',
      'The support-period statement and end-of-support handling',
      'The test reports evidencing conformity with the essential requirements',
    ],
    honestyTitle: 'What we do — and what stays yours',
    honestyBody:
      'Under Module A the CRA reserves the declaration of conformity to you, the manufacturer, on your sole responsibility (Article 32). Our consultants and the platform get you to a defensible technical file and prepare the declaration in the correct form — we never sign it, certify you, or conclude conformity for you. The file is built the right way; the responsibility, correctly, remains yours.',
    residencyTitle: 'Your data, in your jurisdiction, then gone',
    residencyBody:
      'The 60-day instance is single-tenant and runs where you choose — the AWS European Sovereign Cloud, with EU data and metadata residency and EU-resident operations under a GDPR Article 28 arrangement, or entirely on your own premises. Your evidence is never pooled with anyone else’s, and when the engagement ends the instance is destroyed. You keep the exported artifacts; we keep nothing.',
    ctaTitle: 'Start a CRA Transit',
    ctaBody:
      'A short call scopes your product, confirms the self-assessment route, and sets the 60-day plan. You leave the engagement with the file — not a subscription.',
    bookCall: 'Book a scoping call',
  },
  nl: {
    seoTitle: 'CRA Transit — de begeleide conformiteitssprint van 60 dagen | OXOT',
    seoDescription:
      'Een eenmalige, door consultants geleide CRA-conformiteitsopdracht voor één zelf beoordeeld product. Wij richten een toegewijde single-tenant-instantie in, doorlopen het volledige achtfasenproces met u in 60 dagen, overhandigen u elk artefact — het technisch dossier volgens Bijlage VII, uw Bijlage V-verklaring, SBOM, risicobeoordeling, CVD-beleid — en halen daarna het platform weg.',
    kicker: 'BEGELEID · EENMALIG · 60 DAGEN',
    title: 'CRA Transit: uw conformiteitsdossier, in 60 dagen met u opgebouwd.',
    description:
      'Voor één product dat zichzelf onder de CRA beoordeelt, heeft u geen doorlopend programma nodig — u heeft het dossier nodig, in één keer goed gedaan. Onze deskundige consultants doorlopen het volledige achtfasenproces met u op een toegewijde single-tenant-instantie, produceren elk artefact dat de verordening vraagt, overhandigen die als duurzame bestanden, en halen het platform weg. Snel, begeleid, verdedigbaar.',
    forWhoTitle: 'Voor wie het is',
    forWho: [
      ['Eén zelf beoordeeld product', 'Een product met digitale elementen dat zichzelf beoordeelt onder Module A (interne controle) — niet vermeld als belangrijk of kritiek, dus geen aangemelde instantie vereist.'],
      ['Een team dat de begeleide route wil', 'U wilt het werk mét u gedaan door mensen die dit dagelijks doen, op een vaste klok van 60 dagen — geen langlopende platformverplichting.'],
      ['Een verdedigbaar dossier, in één keer', 'U heeft een beoordelingsklaar technisch dossier volgens Bijlage VII nodig en een verklaring waar u achter staat, op de juiste manier opgesteld — en dan wilt u weer verder bouwen.'],
    ] as [string, string][],
    modelKicker: 'Hoe de 60 dagen werken',
    modelTitle: 'Inrichten · uitvoeren · exporteren · afbreken',
    modelSteps: [
      ['Inrichten', 'Wij zetten een toegewijde single-tenant-instantie voor u op — in de AWS European Sovereign Cloud (EU-dataresidentie) of op uw eigen locatie. Alleen van u, 60 dagen lang.'],
      ['Uitvoeren', 'Onze consultants werken samen met uw team door elke fase, in het platform, met de vooraf gebouwde wettelijke regels, corpus en dossiersjablonen die maanden tot weken verkorten.'],
      ['Exporteren', 'Elk artefact wordt gegenereerd en aan u geëxporteerd als duurzame bestanden die u behoudt — het technisch dossier, de verklaring, de SBOM, het bewijs, het beleid.'],
      ['Afbreken', 'Aan het einde van de opdracht wordt de instantie ontmanteld en vernietigd. U houdt de artefacten; niets van u blijft achter.'],
    ] as [string, string][],
    processKicker: 'Het proces',
    processTitle: 'Acht fasen, één product, samen gedaan',
    processNote:
      'Hetzelfde achtfasentraject dat het platform doorloopt — met onze consultants naast u bij elke stap. Voor CRA Transit is de achtste fase geen doorlopend beheer maar een schone overdracht: uw bestanden eruit, het platform weg.',
    phases: [
      ['Afbakenen', 'Bevestig dat het product binnen de reikwijdte valt en leg precies vast wat het is.'],
      ['Classificeren', 'Plaats het in zijn CRA-klasse en bevestig de route van zelfbeoordeling (Module A).'],
      ['Risico beoordelen', 'Stel de cyberbeveiligingsrisicobeoordeling volgens Bijlage I op die het ontwerp stuurt.'],
      ['Bewijs verzamelen', 'SBOM, documentatie over veilige ontwikkeling en het proces voor kwetsbaarheidsafhandeling, in het dossier.'],
      ['Vereisten bijhouden', 'Elke essentiële eis van Bijlage I — de 13 producteigenschappen en de processen voor kwetsbaarheidsafhandeling — met bewijs.'],
      ['Het dossier samenstellen', 'De technische documentatie volgens Bijlage VII, samengesteld uit uw eigen bewijs.'],
      ['Conformiteit verklaren', 'U stelt de EU-conformiteitsverklaring volgens Bijlage V op en ondertekent die, op uw verantwoordelijkheid. Wij bereiden haar voor; de verklaring is van u.'],
      ['Overdracht & afbreken', 'Elk artefact als duurzaam bestand aan u geëxporteerd; de toegewijde instantie ontmanteld.'],
    ] as [string, string][],
    artifactsKicker: 'Waarmee u vertrekt',
    artifactsTitle: 'Een volledig Bijlage VII-pakket — als duurzame bestanden',
    artifactsNote:
      'Gebaseerd op de verordening zelf: Bijlage VII somt de minimuminhoud van de technische documentatie op en Bijlage V het formaat van de verklaring. U vertrekt met alles, geëxporteerd en van u om te bewaren voor de bewaarplicht van tien jaar (of de ondersteuningsperiode).',
    artifacts: [
      'Het technisch dossier volgens Bijlage VII — de algemene productbeschrijving, het ontwerp- en ontwikkelingsdossier en de processen voor kwetsbaarheidsafhandeling',
      'Uw ondertekende EU-conformiteitsverklaring volgens Bijlage V',
      'De cyberbeveiligingsrisicobeoordeling volgens Bijlage I',
      'Een machineleesbare SBOM (software bill of materials)',
      'Het beleid voor gecoördineerde kwetsbaarheidsmelding en het meldcontact',
      'De verklaring over de ondersteuningsperiode en de afhandeling na einde ondersteuning',
      'De testrapporten die conformiteit met de essentiële eisen aantonen',
    ],
    honestyTitle: 'Wat wij doen — en wat van u blijft',
    honestyBody:
      'Onder Module A behoudt de CRA de conformiteitsverklaring aan u, de fabrikant, op uw eigen verantwoordelijkheid (artikel 32). Onze consultants en het platform brengen u tot een verdedigbaar technisch dossier en bereiden de verklaring in de juiste vorm voor — wij ondertekenen haar niet, certificeren u niet en concluderen geen conformiteit voor u. Het dossier wordt op de juiste manier opgebouwd; de verantwoordelijkheid blijft, terecht, bij u.',
    residencyTitle: 'Uw gegevens, in uw jurisdictie, daarna weg',
    residencyBody:
      'De instantie van 60 dagen is single-tenant en draait waar u kiest — de AWS European Sovereign Cloud, met EU-data- en metadataresidentie en in de EU gevestigd beheer onder een verwerkersovereenkomst volgens AVG-artikel 28, of volledig op uw eigen locatie. Uw bewijs wordt nooit samengevoegd met dat van iemand anders, en wanneer de opdracht eindigt, wordt de instantie vernietigd. U behoudt de geëxporteerde artefacten; wij behouden niets.',
    ctaTitle: 'Start een CRA Transit',
    ctaBody:
      'Een kort gesprek bakent uw product af, bevestigt de route van zelfbeoordeling en stelt het plan van 60 dagen op. U verlaat de opdracht met het dossier — geen abonnement.',
    bookCall: 'Plan een afbakeningsgesprek',
  },
} as const;

const MODEL_ICONS = [ServerCog, Users, PackageCheck, Trash2];

export default function CraTransitPage() {
  const { locale } = useLocale();
  const t = copy[locale];

  useSeo(
    pageSeo('/cra-transit', {
      title: t.seoTitle,
      description: t.seoDescription,
    }),
  );

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 md:py-16 max-w-6xl">
      <JsonLd
        id="ld-service-cra-transit"
        data={{
          '@context': 'https://schema.org',
          '@type': 'Service',
          name: 'CRA Transit',
          serviceType: 'EU Cyber Resilience Act conformity assistance (one-time, consultant-led)',
          description:
            'A 60-day, consultant-led engagement that runs the full CRA self-assessment process for a single product on a dedicated single-tenant instance and delivers the complete Annex VII technical file and Annex V declaration as exported artifacts.',
          areaServed: 'EU',
          provider: { '@type': 'Organization', name: 'OXOT' },
        }}
      />

      <PageHeader kicker={t.kicker} title={t.title} icon={Rocket} description={t.description} />

      {/* Who it's for */}
      <div className="grid gap-4 md:grid-cols-3">
        {t.forWho.map(([h, b], i) => (
          <motion.div
            key={h}
            className="rounded-2xl border border-border bg-card p-6 shadow-e1"
            {...revealVariants(i)}
          >
            <h3 className="font-display text-base font-normal tracking-tight text-foreground">{h}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{b}</p>
          </motion.div>
        ))}
      </div>

      {/* The 60-day model */}
      <div className="mt-16">
        <p className="oxot-kicker text-center">{t.modelKicker}</p>
        <h2 className="mt-2 text-center font-display text-3xl font-normal tracking-tight text-foreground">
          {t.modelTitle}
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {t.modelSteps.map(([h, b], i) => {
            const Icon = MODEL_ICONS[i];
            return (
              <motion.div
                key={h}
                className="rounded-xl border border-border bg-card p-5"
                {...revealVariants(i)}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <h3 className="mt-3 font-display text-base font-normal tracking-tight text-foreground">{h}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{b}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* The eight-phase process diagram */}
      <div className="mt-16">
        <p className="oxot-kicker text-center">{t.processKicker}</p>
        <h2 className="mt-2 text-center font-display text-3xl font-normal tracking-tight text-foreground">
          {t.processTitle}
        </h2>
        <p className="mx-auto mt-3 max-w-3xl text-center text-sm text-muted-foreground">
          {t.processNote}
        </p>
        <ol className="mt-10 space-y-3">
          {t.phases.map(([h, b], i) => {
            const last = i === t.phases.length - 1;
            return (
              <motion.li
                key={h}
                className={`flex items-start gap-4 rounded-xl border p-5 ${
                  last ? 'border-primary/40 bg-primary/[0.04]' : 'border-border bg-card'
                }`}
                {...revealVariants(i)}
              >
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-mono text-sm font-semibold ${
                    last
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-primary/10 text-primary-ink'
                  }`}
                >
                  {i + 1}
                </span>
                <div className="min-w-0">
                  <h3 className="font-display text-base font-normal tracking-tight text-foreground">{h}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{b}</p>
                </div>
              </motion.li>
            );
          })}
        </ol>
      </div>

      {/* Artifacts produced */}
      <div className="mt-16 rounded-2xl border border-border bg-card p-6 md:p-8">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
            <FileCheck2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="oxot-kicker">{t.artifactsKicker}</p>
            <h2 className="mt-1 font-display text-2xl font-normal tracking-tight text-foreground">
              {t.artifactsTitle}
            </h2>
          </div>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t.artifactsNote}</p>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {t.artifacts.map((a) => (
            <li key={a} className="flex items-start gap-2 text-sm text-foreground/90">
              <FileCheck2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>{a}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* The honesty boundary + data residency */}
      <div className="mt-8 grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <h2 className="mt-3 font-display text-lg font-normal tracking-tight text-foreground">
            {t.honestyTitle}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.honestyBody}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <ServerCog className="h-5 w-5 text-primary" />
          </div>
          <h2 className="mt-3 font-display text-lg font-normal tracking-tight text-foreground">
            {t.residencyTitle}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.residencyBody}</p>
        </div>
      </div>

      {/* CTA */}
      <div className="mt-16 rounded-2xl border border-border bg-card p-8 text-center">
        <h2 className="font-display text-2xl font-normal tracking-tight text-foreground">
          {t.ctaTitle}
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">{t.ctaBody}</p>
        <Link
          href="/demo"
          className="cta-lift mt-5 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/90"
        >
          {t.bookCall} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
