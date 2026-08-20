import { Link } from 'wouter';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Cpu,
  KeyRound,
  Lock,
  ScanLine,
  Fingerprint,
  ShieldCheck,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { useSeo } from '@/hooks/use-seo';
import { pageSeo } from '@/lib/page-seo';
import { useLocale } from '@/providers/locale-provider';
import { revealVariants } from '@/lib/motion';

// Localised page copy (nl-NL professional register, "u"). Machine-assisted —
// flag Dutch strings for a native reviewer before go-live. Deep-dive child of /suppliers.
const copy = {
  en: {
    seoTitle: 'For security IP & silicon suppliers — secure elements, root-of-trust, crypto IP under the CRA',
    seoDescription:
      'Secure elements, tamper-resistant microcontrollers, root-of-trust and cryptographic IP carry the CRA’s heaviest classifications. Where your block sits in Annex III/IV, and exactly where your responsibility hands off to the integrating manufacturer.',
    kicker: 'SECURITY IP & SILICON',
    backLink: 'Back to component & IP suppliers',
    title: 'Secure elements, root-of-trust, crypto IP — the sharp end of the CRA',
    description:
      'Your block is often the security foundation of the whole product, which puts it in the CRA’s most demanding classes. That raises the bar on your evidence — and makes the hand-off to the integrating manufacturer the line you must draw with precision.',
    classTitle: 'Where your block sits in the classification',
    classBody:
      'The CRA classes decide the conformity route, and security silicon lands high. A hardware device with a secure element is listed in Annex IV — the critical class, where a European cybersecurity certificate can carry the strongest presumption of conformity. A tamper-resistant microcontroller is an important product, Class II under Annex III. These are the integrating manufacturer’s classifications for the finished product, but they are set in motion by your component — so your evidence has to meet the standard the class implies, not a lighter one.',
    classCards: [
      ['Secure element', 'Annex IV — critical class. The finished hardware device with a secure element carries the CRA’s strongest assurance expectations.'],
      ['Tamper-resistant microcontroller', 'Annex III, Class II — important product. A more demanding route than the default self-assessment.'],
      ['Root-of-trust & crypto IP', 'Intended use, trust boundaries, and assumptions must be explicit — the security contribution only holds under documented conditions.'],
    ] as [string, string][],
    handoffTitle: 'The hand-off, drawn with precision',
    handoffBody:
      'Security IP fails safely only when both sides know who owns each control. Your delivered block provides the capability; the integrating manufacturer owns how it is provisioned, keyed, booted, and updated. The shared-responsibility matrix in your assurance package must state each of these explicitly — a hardware root of trust alone does not resolve the customer’s lifecycle, update, vulnerability, or compliance obligations.',
    handoffItems: [
      ['Provisioning & key ownership', 'You document the provisioning model and protected-storage guidance; the customer owns key generation, injection, certificates, and device lifecycle policy.'],
      ['Secure boot & debug lifecycle', 'You specify lifecycle states, secure-boot dependencies, and debug-control guidance; the customer owns the boot chain, debug lockdown, and recovery mechanism.'],
      ['Cryptographic use & secure defaults', 'You provide secure-default configurations and prohibited-configuration warnings; the customer owns correct integration and configuration in the finished product.'],
      ['Attestation & updates', 'You define the update dependencies and errata process for the block; the customer owns the product update mechanism and vulnerability handling.'],
    ] as [string, string][],
    qualifiedTitle: 'Say it in qualified, evidence-backed terms',
    qualifiedBody:
      'The claims that survive scrutiny are the qualified ones. Position the block as supporting secure product design when integrated and configured according to documented assumptions — with version-specific security documentation, a defined vulnerability-handling and customer-notification process, and inputs that support the customer’s third-party-component due diligence. Avoid the unqualified claim that certified silicon certifies the final product; it does not.',
    ctaTitle: 'Bring one security block to the walkthrough',
    ctaBody:
      'A 45-minute session: your secure element, root-of-trust or crypto IP, its classification implications, and the assurance package the platform would assemble around it.',
    bookDemo: 'Book a demo',
  },
  nl: {
    seoTitle: 'Voor beveiligings-IP- & siliciumleveranciers — secure elements, root-of-trust, crypto-IP onder de CRA',
    seoDescription:
      'Secure elements, sabotagebestendige microcontrollers, root-of-trust en cryptografische IP dragen de zwaarste classificaties van de CRA. Waar uw blok in Bijlage III/IV valt, en precies waar uw verantwoordelijkheid overgaat naar de integrerende fabrikant.',
    kicker: 'BEVEILIGINGS-IP & SILICIUM',
    backLink: 'Terug naar component- & IP-leveranciers',
    title: 'Secure elements, root-of-trust, crypto-IP — het scherpe eind van de CRA',
    description:
      'Uw blok is vaak de beveiligingsfundering van het hele product, wat het in de meest veeleisende klassen van de CRA plaatst. Dat verhoogt de lat voor uw bewijs — en maakt de overdracht naar de integrerende fabrikant de lijn die u met precisie moet trekken.',
    classTitle: 'Waar uw blok in de classificatie valt',
    classBody:
      'De CRA-klassen bepalen de conformiteitsroute, en beveiligingssilicium valt hoog. Een hardwareapparaat met een secure element staat in Bijlage IV — de kritieke klasse, waar een Europees cyberbeveiligingscertificaat het sterkste vermoeden van conformiteit kan dragen. Een sabotagebestendige microcontroller is een belangrijk product, klasse II onder Bijlage III. Dit zijn de classificaties van de integrerende fabrikant voor het eindproduct, maar ze worden in gang gezet door uw component — dus uw bewijs moet voldoen aan de standaard die de klasse impliceert, niet aan een lichtere.',
    classCards: [
      ['Secure element', 'Bijlage IV — kritieke klasse. Het eindhardwareapparaat met een secure element draagt de sterkste assurance-verwachtingen van de CRA.'],
      ['Sabotagebestendige microcontroller', 'Bijlage III, klasse II — belangrijk product. Een veeleisender route dan de standaard zelfbeoordeling.'],
      ['Root-of-trust & crypto-IP', 'Beoogd gebruik, vertrouwensgrenzen en aannames moeten expliciet zijn — de beveiligingsbijdrage houdt alleen stand onder gedocumenteerde voorwaarden.'],
    ] as [string, string][],
    handoffTitle: 'De overdracht, met precisie getrokken',
    handoffBody:
      'Beveiligings-IP faalt alleen veilig wanneer beide partijen weten wie elke maatregel bezit. Uw geleverde blok levert de capaciteit; de integrerende fabrikant bezit hoe het wordt geprovisioneerd, van sleutels voorzien, opgestart en bijgewerkt. De matrix voor gedeelde verantwoordelijkheid in uw assurancepakket moet elk hiervan expliciet stellen — een hardware root of trust alleen lost de levenscyclus-, update-, kwetsbaarheids- of nalevingsverplichtingen van de klant niet op.',
    handoffItems: [
      ['Provisioning & sleuteleigenaarschap', 'U documenteert het provisioningmodel en de begeleiding voor beschermde opslag; de klant bezit sleutelgeneratie, -injectie, certificaten en apparaatlevenscyclusbeleid.'],
      ['Secure boot & debug-levenscyclus', 'U specificeert levenscyclusstatussen, secure-boot-afhankelijkheden en debug-controlebegeleiding; de klant bezit de boot-keten, debug-vergrendeling en het herstelmechanisme.'],
      ['Cryptografisch gebruik & veilige standaarden', 'U levert veilige standaardconfiguraties en waarschuwingen voor verboden configuraties; de klant bezit de juiste integratie en configuratie in het eindproduct.'],
      ['Attestatie & updates', 'U definieert de update-afhankelijkheden en het errata-proces voor het blok; de klant bezit het productupdatemechanisme en de kwetsbaarheidsafhandeling.'],
    ] as [string, string][],
    qualifiedTitle: 'Zeg het in gekwalificeerde, bewijsgestaafde termen',
    qualifiedBody:
      'De claims die toetsing doorstaan, zijn de gekwalificeerde. Positioneer het blok als ondersteunend voor veilig productontwerp mits geïntegreerd en geconfigureerd volgens gedocumenteerde aannames — met versiespecifieke beveiligingsdocumentatie, een gedefinieerd kwetsbaarheidsafhandelings- en klantnotificatieproces, en inputs die de due diligence van de klant over componenten van derden ondersteunen. Vermijd de ongekwalificeerde claim dat gecertificeerd silicium het eindproduct certificeert; dat doet het niet.',
    ctaTitle: 'Neem één beveiligingsblok mee naar de rondleiding',
    ctaBody:
      'Een sessie van 45 minuten: uw secure element, root-of-trust of crypto-IP, de classificatie-implicaties, en het assurancepakket dat het platform eromheen zou samenstellen.',
    bookDemo: 'Demo aanvragen',
  },
} as const;

const CLASS_ICONS = [Lock, ScanLine, Fingerprint];
const HANDOFF_ICONS = [KeyRound, ShieldCheck, Cpu, ScanLine];

export default function SuppliersSecurityIpPage() {
  const { locale } = useLocale();
  const t = copy[locale];

  useSeo(
    pageSeo('/suppliers/security-ip', {
      title: t.seoTitle,
      description: t.seoDescription,
      ogImage: '/media/suppliers/sup-01-assurance-package.jpg',
    }),
  );

  return (
    <div className="container mx-auto px-4 md:px-8 py-12 md:py-16 max-w-6xl">
      <div className="mb-4">
        <Link
          href="/suppliers"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> {t.backLink}
        </Link>
      </div>

      <PageHeader kicker={t.kicker} title={t.title} icon={Cpu} description={t.description} />

      {/* Classification */}
      <div className="mt-6 rounded-2xl border border-border bg-card p-6 md:p-8">
        <h2 className="font-display text-xl font-normal tracking-tight text-foreground">
          {t.classTitle}
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{t.classBody}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {t.classCards.map(([name, body], i) => {
            const Icon = CLASS_ICONS[i];
            return (
              <motion.div
                key={name}
                className="rounded-xl border border-border bg-background p-5"
                {...revealVariants(i)}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <h3 className="mt-3 font-display text-base font-normal tracking-tight text-foreground">
                  {name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{body}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Hand-off */}
      <div className="mt-14">
        <h2 className="text-center font-display text-3xl font-normal tracking-tight text-foreground">
          {t.handoffTitle}
        </h2>
        <p className="mx-auto mt-3 max-w-3xl text-center text-sm leading-relaxed text-muted-foreground">
          {t.handoffBody}
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {t.handoffItems.map(([name, body], i) => {
            const Icon = HANDOFF_ICONS[i];
            return (
              <motion.div
                key={name}
                className="rounded-xl border border-border bg-card p-5"
                {...revealVariants(i)}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <h3 className="mt-3 font-display text-base font-normal tracking-tight text-foreground">
                  {name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">{body}</p>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Qualified language */}
      <div className="mt-14 rounded-2xl border border-border bg-card p-6 md:p-8 flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <ShieldCheck className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="font-display text-xl font-normal tracking-tight text-foreground">
            {t.qualifiedTitle}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{t.qualifiedBody}</p>
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
