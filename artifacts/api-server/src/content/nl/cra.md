---
title: "De Cyber Resilience Act (CRA)"
meta_title: Cyber Resilience Act (CRA) voor OT & producten met digitale elementen | OXOT
meta_description: De EU Cyber Resilience Act (Verordening (EU) 2024/2847) uitgelegd voor OT — reikwijdte, productklassen, Annex I-eisen voor beveiliging en kwetsbaarheidsbeheer, SBOM, melding binnen 24 uur, ondersteuningsperiodes van ~5 jaar, het tijdpad 2024→2027, sancties en de IEC 62443-alignment-methodologie van OXOT.
excerpt: Security-by-design wordt een wettelijke voorwaarde voor markttoegang. Een praktische gids over de reikwijdte van de CRA, productklassen, Annex I, SBOM, melding binnen 24 uur, ondersteuningsperiodes, sancties en de eigen CRA↔IEC 62443-alignment-methodologie van OXOT voor OT-fabrikanten en -afnemers.
content_type: page
published: true
---

De Cyber Resilience Act is het antwoord van de Europese Unie op een eenvoudig maar ongemakkelijk feit: digitale producten worden al decennialang op de markt gebracht waarbij beveiliging als optioneel wordt behandeld, en de kosten daarvan komen terecht bij de mensen die ze gebruiken. De CRA verandert die afspraak. Voor het eerst wordt **beveiliging een wettelijke voorwaarde voor het op de EU-markt brengen van een product met digitale elementen** — van consumentengadgets tot de industriële controllers, gateways en software die operationele omgevingen laten draaien.

Als [NIS2](/nl/nis2) een wet is voor de *operatoren* die systemen draaien, is de CRA de wet voor de *makers* van de producten waaruit die systemen zijn opgebouwd. Industriële organisaties krijgen er doorgaans van twee kanten mee te maken: als afnemer die eindelijk beveiliging als recht kan eisen, en — als u producten bouwt, integreert of substantieel wijzigt — als fabrikant die nu verplichtingen draagt die worden ondersteund door aan de omzet gekoppelde boetes.

```keyfacts
Instrument :: Verordening (EU) 2024/2847 — rechtstreeks toepasselijk
In werking getreden :: 10 december 2024
Meldverplichtingen :: vanaf 11 september 2026
Hoofdverplichtingen :: vanaf 11 december 2027
Ondersteuningsperiode :: in de regel ≥ 5 jaar
Vroegwaarschuwing :: 24 uur naar ENISA + CSIRT
Conformiteit :: Bijlage I + CE-markering
Max. boete :: €15M of 2,5% van wereldwijde omzet
Sluit aan op :: [IEC 62443](/nl/iec-62443)
```

## De korte versie

- De CRA is **Verordening (EU) 2024/2847**, een rechtstreeks toepasselijke verordening — geen richtlijn — en werkt daardoor identiek in alle 27 lidstaten, zonder nationale omzettingsstap. ([EUR-Lex, officiële tekst](https://eur-lex.europa.eu/eli/reg/2024/2847/oj/eng))
- De verordening **is op 10 december 2024 in werking getreden** en is van toepassing op **producten met digitale elementen** (PDE's) — hardware en software waarvan het beoogde of redelijkerwijs te verwachten gebruik een directe of indirecte gegevensverbinding met een apparaat of netwerk omvat.
- **Fabrikanten** dragen de kernverplichtingen: security by design en by default, kwetsbaarheidsbeheer, een SBOM en een vastgestelde **ondersteuningsperiode** van in de regel ten minste vijf jaar.
- De verplichtingen inzake **melding van kwetsbaarheden en incidenten** gelden vanaf **11 september 2026**; de **hoofdverplichtingen** gelden vanaf **11 december 2027**. ([Europese Commissie](https://digital-strategy.ec.europa.eu/en/policies/cyber-resilience-act))
- Producten moeten voldoen aan de **essentiële eisen in Annex I** en de **CE-markering** dragen. De classificatie op basis van **Uitvoeringsverordening (EU) 2025/2392 van de Commissie** — gepubliceerd op 1 december 2025 — bepaalt welke conformiteitsroute van toepassing is.
- **Actief misbruikte kwetsbaarheden** en **ernstige incidenten** activeren een **vroegtijdige waarschuwing binnen 24 uur** aan ENISA en het nationale CSIRT, via één enkel meldplatform.
- Sancties lopen op tot **€15 miljoen of 2,5% van de wereldwijde jaaromzet**, afhankelijk van welk bedrag hoger is.

> [!IMPORTANT]
> De meldklok start eerder dan de hoofdverplichtingen, en wacht niet tot een product nieuw is. De detectie- en meldstructuur moet operationeel zijn vanaf **11 september 2026** — meer dan een jaar voordat u een CE-markering op het product zelf nodig heeft — en geldt voor **elk product binnen de reikwijdte dat al op de markt is**, inclusief een product dat al in 2019 is verkocht. Als een leverancier na die datum ontdekt dat een oude SCADA-implementatie een actief misbruikte kwetsbaarheid heeft, begint de klok van 24 uur alsnog te lopen.

## Waarom de CRA bestaat

Twee structurele problemen lagen aan de basis van deze wet. Ten eerste een **laag niveau van cyberbeveiliging** in veel digitale producten — zwakke standaardconfiguraties, ongepatchte kwetsbaarheden, geen duidelijke route om een gebrek te melden. Ten tweede een **onvoldoende begrip van en toegang tot informatie** bij gebruikers, die op het moment van aankoop geen onderscheid konden maken tussen een veilig en een onveilig product, en vaak geen beveiligingsupdates konden krijgen, zelfs als ze dat wilden. ([Samenvatting CRA, Europese Commissie](https://digital-strategy.ec.europa.eu/en/policies/cra-summary))

De oplossing legt de verantwoordelijkheid stroomopwaarts, bij de partij die het best in staat is om te handelen: de fabrikant. Daarbij wordt gebruikgemaakt van het beproefde instrumentarium van het EU-productrecht — essentiële eisen, conformiteitsbeoordeling, CE-markering, markttoezicht — en dat wordt gericht op cyberbeveiliging. "Secure by design" en "secure by default" zijn geen slogans meer, maar de prijs van markttoegang.

## Het tijdpad van de CRA

De verordening wordt over drie jaar gefaseerd ingevoerd. Onderstaande data zijn de data om op te plannen; de tijd daartussen is waarin het technische werk moet gebeuren.

```svg
<svg viewBox="0 0 700 240" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif">
  <line x1="40" y1="120" x2="660" y2="120" stroke="#94a3b8" stroke-width="2"/>
  <!-- milestone 1 -->
  <circle cx="90" cy="120" r="8" fill="#3b82f6"/>
  <line x1="90" y1="120" x2="90" y2="70" stroke="#94a3b8" stroke-width="1"/>
  <text x="90" y="58" fill="#e5e7eb" font-size="13" font-weight="bold" text-anchor="middle">10 dec 2024</text>
  <text x="90" y="150" fill="#e5e7eb" font-size="12" text-anchor="middle">Treedt in</text>
  <text x="90" y="166" fill="#e5e7eb" font-size="12" text-anchor="middle">werking</text>
  <!-- milestone 2 -->
  <circle cx="300" cy="120" r="8" fill="#f97316"/>
  <line x1="300" y1="120" x2="300" y2="70" stroke="#94a3b8" stroke-width="1"/>
  <text x="300" y="58" fill="#e5e7eb" font-size="13" font-weight="bold" text-anchor="middle">11 sep 2026</text>
  <text x="300" y="150" fill="#e5e7eb" font-size="12" text-anchor="middle">Meldverplichtingen</text>
  <text x="300" y="166" fill="#e5e7eb" font-size="12" text-anchor="middle">van toepassing</text>
  <text x="300" y="182" fill="#e5e7eb" font-size="12" text-anchor="middle">(art. 14)</text>
  <!-- milestone 3 -->
  <circle cx="510" cy="120" r="8" fill="#94a3b8"/>
  <line x1="510" y1="120" x2="510" y2="70" stroke="#94a3b8" stroke-width="1"/>
  <text x="510" y="58" fill="#e5e7eb" font-size="12" font-weight="bold" text-anchor="middle">~Q2 2027</text>
  <text x="510" y="150" fill="#e5e7eb" font-size="12" text-anchor="middle">Geharmoniseerde</text>
  <text x="510" y="166" fill="#e5e7eb" font-size="12" text-anchor="middle">normen geciteerd</text>
  <!-- milestone 4 -->
  <circle cx="640" cy="120" r="9" fill="#f97316" stroke="#e5e7eb" stroke-width="2"/>
  <line x1="640" y1="120" x2="640" y2="70" stroke="#94a3b8" stroke-width="1"/>
  <text x="640" y="58" fill="#e5e7eb" font-size="13" font-weight="bold" text-anchor="middle">11 dec 2027</text>
  <text x="640" y="150" fill="#e5e7eb" font-size="12" text-anchor="middle">Hoofdverplichtingen</text>
  <text x="640" y="166" fill="#e5e7eb" font-size="12" text-anchor="middle">van</text>
  <text x="640" y="182" fill="#e5e7eb" font-size="12" text-anchor="middle">toepassing</text>
  <text x="350" y="215" fill="#94a3b8" font-size="11" text-anchor="middle">Instroom over drie jaar — de aanlooptijd voor toetsing door een derde partij is al krap</text>
</svg>
```

| Datum | Wat van toepassing is |
|---|---|
| **10 december 2024** | De CRA treedt in werking. De klok begint te lopen; verplichtingen worden vanaf hier gefaseerd ingevoerd. |
| **11 juni 2026** | Hoofdstuk IV is van toepassing — conformiteitsbeoordelingsinstanties (CAB's) beginnen met notificatie en accreditatie als **aangemelde instanties**. Fabrikanten van belangrijke producten van Klasse I/II en kritieke producten moeten vanaf dit punt de betrokkenheid van een aangemelde instantie starten. |
| **11 september 2026** | De **verplichtingen voor melding van kwetsbaarheden en incidenten (artikel 14)** gelden voor **alle** producten binnen de reikwijdte, inclusief producten die jaren eerder op de markt zijn gebracht. Het centrale meldplatform van ENISA moet dan operationeel zijn. ([EC — melding](https://digital-strategy.ec.europa.eu/en/policies/cra-reporting)) |
| **30 augustus 2026** | Deadline normen: Type A horizontale beveiligingsnorm en Type B norm voor kwetsbaarheidsbeheer, te leveren door CENELEC/ETSI. |
| **30 oktober 2026** | Deadline normen: Type C verticale/productspecifieke normen, voor de categorieën uit Annex III/IV, te leveren. |
| **~Q2 2027** | Verwachte formele PBEU-vermelding van de eerste geharmoniseerde normen — waaronder **EN IEC 62443-4-1:2018/A11:2026** en **EN IEC 62443-4-2:2019/A11:2026** — waarmee het vermoeden van conformiteit wordt geactiveerd. |
| **11 december 2027** | De **hoofdverplichtingen** — essentiële eisen, conformiteitsbeoordeling, CE-markering — zijn volledig van toepassing. |

Het opzetten van processen voor veilige ontwikkeling en kwetsbaarheidsbeheer, het produceren van SBOM's en het regelen van beoordeling door een derde partij voor belangrijke en kritieke producten zijn meerjarige programma's, geen projecten voor het laatste kwartaal. Medio 2026 is **nog geen enkele geharmoniseerde CRA-norm formeel geciteerd in het Publicatieblad van de EU** — wat betekent dat geen enkele fabrikant nog een beroep kan doen op het vermoeden van conformiteit, en dat belangrijke producten van Klasse I voorlopig helemaal geen route voor zelfbeoordeling open hebben staan.

## Wat telt als een "product met digitale elementen"

De reikwijdte is bewust breed. Onder **artikel 3, lid 1**, is een **product met digitale elementen**:

> *"een software- of hardwareproduct en de bijbehorende oplossingen voor gegevensverwerking op afstand, met inbegrip van software- of hardwarecomponenten die afzonderlijk op de markt worden gebracht."*

Een product valt binnen de reikwijdte als het tijdens normaal gebruik direct of indirect wordt verbonden met een apparaat of netwerk; digitale elementen bevat (software of programmeerbare hardware); en niet al onder een EU-sectorale verordening valt die gelijkwaardige cyberbeveiligingseisen stelt. Gegevensverwerking op afstand die door of namens de fabrikant wordt uitgevoerd, valt op zichzelf al binnen de reikwijdte.

In een industriële omgeving omvat dat heel veel:

- **PLC's, RTU's en industriële controllers** — de logica die het proces aanstuurt.
- **Protocolgateways en netwerkapparatuur** — de vertalers en routers tussen OT en IT.
- **HMI's en software voor engineeringwerkstations** — de mensgerichte en configuratielagen.
- **Industriële IoT-sensoren en edge-apparaten** — de groeiende populatie verbonden eindpunten.
- **Firmware en applicatiesoftware** die op al het bovenstaande draaien, inclusief losse software die op zichzelf wordt verkocht.

Sommige categorieën zijn uitgezonderd omdat ze elders al gereguleerd zijn — producten voor nationale veiligheid en defensie, typegoedgekeurde voertuigen, en producten waarvoor een sectorspecifieke EU-verordening al een gelijke of hogere cyberbeveiligingslat legt. Als uw product op een grensvlak zit (bijvoorbeeld machines met een digitaal besturingssysteem), leest u de CRA mogelijk samen met de [Machineverordening](/nl/machine-act).

## Wie de verplichtingen draagt

De CRA volgt de waardeketen, en het gewicht is niet gelijk verdeeld.

| Rol | Kernverplichting onder de CRA |
|---|---|
| **Fabrikant** | Materiële verplichtingen: veilig ontwerp, naleving van Annex I, SBOM, kwetsbaarheidsbeheer, ondersteuningsperiode, melding, conformiteitsbeoordeling, CE-markering. |
| **Importeur** | Verifieert de conformiteitsbeoordeling, technische documentatie en CE-markering van de fabrikant; voegt eigen contactgegevens toe; bewaart 10 jaar traceerbaarheidsgegevens; treedt op bij non-conformiteit. |
| **Distributeur** | Handelt met de nodige zorgvuldigheid; verifieert dat CE-markering en conformiteitsverklaring het product vergezellen; mag geen producten aanbieden waarvan hij weet of zou moeten weten dat ze niet-conform zijn; bewaart 10 jaar traceerbaarheidsgegevens. |

> [!WARNING]
> **U kunt "fabrikant" worden zonder uzelf ooit zo te noemen.** Onder **artikel 21** nemen importeurs en distributeurs de volledige verplichtingen van een fabrikant op zich als zij een product onder hun eigen naam of merk op de markt brengen, of een **substantiële wijziging** aanbrengen aan een product dat al op de markt is. Een OEM die de fabricage uitbesteedt aan een entiteit buiten de EU en het product onder eigen merk in de EU verkoopt, draagt alle verplichtingen van artikel 13, ongeacht de contractvoorwaarden — contractuele doorschuiving van aansprakelijkheid naar de ODM houdt geen stand tegenover een markttoezichtautoriteit. Systeemintegratoren en operatoren die een apparaat herlabelen, de firmware opnieuw flashen of significant wijzigen, moeten precies weten waar die grens ligt — per product, vóór 2027.

Die trigger van "substantiële wijziging" is degene die OT-teams verrast. Een wijziging is "substantieel" als deze ofwel de naleving van Annex I beïnvloedt, ofwel het beoogde gebruik van het product verandert (**artikel 3, lid 30**). Routinematig onderhoud, gelijkwaardige reparaties en beveiligingspatches zijn **standaard geen** substantiële wijzigingen (**overweging 42**) — maar een volledige upgrade van een SCADA-platform, of het toevoegen van IIoT-connectiviteit aan een voorheen niet-genetwerkt apparaat, is dat doorgaans wel. Een machinebouwer die een controller van een derde integreert en de lijn onder eigen naam levert, of een integrator die na 2027 een renovatie uitvoert die deze grens overschrijdt, erft de volledige verplichtingenstapel van een fabrikant — inclusief de minimale ondersteuningsperiode van 5 jaar, gerekend vanaf de datum van de wijziging.

## Productklassen en conformiteitsbeoordeling

Niet alle producten worden gelijk behandeld. De CRA sorteert PDE's op criticaliteit, en de klasse bepaalt hoe rigoureus de conformiteit moet worden aangetoond. De classificatie ligt vast in **Uitvoeringsverordening (EU) 2025/2392 van de Commissie** (gepubliceerd op 1 december 2025), die technische beschrijvingen geeft voor de categorieën van Annex III (Belangrijk) en Annex IV (Kritiek). Classificatie is geen papierwerkexercitie — het is de beslissing die uw tijdpad, uw budget bepaalt, en of er een aangemelde instantie tussen u en de CE-markering staat. ([EC — conformiteitsbeoordeling](https://digital-strategy.ec.europa.eu/en/policies/cra-conformity-assessment))

| Klasse | Voorbeelden (Annex III / IV) | Conformiteitsroute |
|---|---|---|
| **Standaard** | De grote meerderheid van producten, niet vermeld in een van beide annexen — consumenten-IoT, slimme speakers, mobiele apps, videogames, de meeste niet-veiligheidskritische industriële apparaten. | **Zelfbeoordeling** (Module A, interne controle) tegen de essentiële eisen — altijd toegestaan. |
| **Belangrijk — Klasse I** | Besturingssystemen (desktop/server/mobiel), browsers, wachtwoordmanagers, VPN-software, SIEM, netwerkrouters/-switches, fysieke en virtuele netwerkinterfaces, niet-veiligheidskritische IACS-producten. | Zelfbeoordeling (Module A) **alleen indien** een geharmoniseerde norm volledig wordt toegepast; anders **Module B+C of H** via een aangemelde instantie. |
| **Belangrijk — Klasse II** | Firewalls, IDS/IPS, hypervisors, HSM's, tamperbestendige microprocessoren, veiligheidskritische IACS, industriële robots. | **Altijd Module B+C of Module H** via een aangemelde instantie — zelfbeoordeling is wettelijk niet mogelijk, punt uit. |
| **Kritiek** | Smartcards, HSM's, slimme-metergateways in kritieke infrastructuur, bepaalde beveiligingsproducten op chipniveau (Annex IV). | Verplichte **Europese cyberbeveiligingscertificering**; waar nog geen regeling bestaat, gelden de regels van Belangrijk Klasse II. |

> **De kijk van OXOT op deze tabel:** veel ICS-componenten — inclusief veiligheidskritische IACS-producten — vallen in Belangrijk Klasse II, waarmee zelfbeoordeling volledig wordt uitgesloten. Die ene classificatiebeslissing is degene die de meeste OT-fabrikanten onderschatten: het is het verschil tussen een interne engineering-goedkeuring en een wachtrij van maanden bij een aangemelde instantie.

### Klasse I in de praktijk — waar "wel of niet zelfbeoordelen" werkelijk van afhangt

Klasse I is de enige klasse waarin de fabrikant een echte keuze heeft, en die keuze wordt volledig bepaald door technische discipline, niet door intentie.

- **Traject A — Zelfbeoordeling (Module A, interne controle).** Alleen toegestaan **als en alleen als** de fabrikant volledig EU-geharmoniseerde normen of gemeenschappelijke specificaties toepast (de aankomende geharmoniseerde EN IEC 62443-profielen, zodra deze zijn geciteerd). Tot die vermelding er is, is dit traject gesloten voor OT-producten van Klasse I.
- **Traject B — Verplichte beoordeling door een derde partij (Module B+C of Module H).** Als een fabrikant een geharmoniseerde norm niet volledig toepast, verliest deze het recht op zelfbeoordeling en volgt dezelfde route via een derde partij als bij een Klasse II-product: een onafhankelijke aangemelde instantie die een EU-typeonderzoek uitvoert (Module B+C), of een volledige audit van kwaliteitsborging van de ontwikkelingscyclus van de fabrikant (Module H).

Welk traject ook van toepassing is, fabrikanten van Klasse I moeten dezelfde onderbouwing leveren om aan te tonen dat het product "secure-by-design" is en vrij van bekende exploiteerbare kwetsbaarheden bij release:

| Bewijsgebied | Wat het aantoont |
|---|---|
| Dreigingsmodellering & risicobeoordeling in de ontwerpfase | Beveiligingsrisico is beoordeeld voordat code werd geschreven; vertrouwensgrenzen en beoogde gebruiksscenario's zijn in kaart gebracht. |
| Geautomatiseerde codeanalyse (SAST/DAST) | Zowel broncode als draaiende applicatie worden getest op gebreken als onderdeel van de ontwikkelpijplijn. |
| Software Composition Analysis (SCA) & SBOM-generatie | Componenten van derden en open source worden doorlopend gescand; er wordt een machineleesbare SBOM gegenereerd en onderhouden voor de gehele ondersteuningsperiode. |
| Penetratietesten & kwetsbaarheidsbeheer | Actief testen om zwakheden vóór lancering weg te nemen, plus een mechanisme voor veilige, integriteitsbeschermde levering van updates wanneer nieuwe gebreken aan het licht komen. |
| Diepgaande hardware-/firmwareverificatie (fysieke Klasse I-apparaten) | Voor routers, netwerkinterfaces en vergelijkbare hardware volstaat standaard IT-scannen niet — toegangscontroles, state-of-the-art cryptografie voor data in rust/onderweg, integriteit van secure boot, en beperking van het aanvalsoppervlak (uitschakelen van ongebruikte fysieke poorten) moeten allemaal worden gevalideerd. |

### Klasse II in de praktijk — de aangemelde instantie beoordeelt twee dingen

Producten van Klasse II worden behandeld als een wezenlijk hoger cyberbeveiligingsrisico, en zelfbeoordeling is **wettelijk verboden** — er is geen versie van deze klasse waarin een interne goedkeuring volstaat. Om een CE-markering aan te brengen, moet de fabrikant een verplichte audit door een aangemelde instantie doorlopen, of gebruikmaken van een toepasselijke Europese cyberbeveiligingscertificeringsregeling op "substantieel" of "hoog" betrouwbaarheidsniveau.

De aangemelde instantie beoordeelt het product op twee categorieën:

**1. De beoordelingsprocedure ("hoe")**

- **Module B + C (EU-typeonderzoek):** de aangemelde instantie voert een grondig onderzoek uit van het technisch ontwerp, de ontwikkeling en de processen voor kwetsbaarheidsbeheer van het product, en test rechtstreeks een fysiek of digitaal exemplaar. Module C vereist vervolgens dat de fabrikant ervoor zorgt dat elke volgende productie-eenheid overeenkomt met dat goedgekeurde exemplaar.
- **Module H (volledige kwaliteitsborging):** in plaats van één eenheid te bemonsteren, audit de aangemelde instantie de volledige cyclus van veilige ontwikkeling en het kwaliteitsmanagementsysteem van de fabrikant. Als de audit bevestigt dat het proces inherent en consistent CRA-conforme output oplevert, kan de productie doorgaan.

**2. De essentiële cyberbeveiligingseisen ("wat")**

- Geen bekende exploiteerbare kwetsbaarheden bij release, onderbouwd met een gedocumenteerde risicobeoordeling.
- Security-by-design en by-default: minimaal aanvalsoppervlak, strikte toegangscontroles, veilige configuratie direct uit de doos.
- State-of-the-art cryptografie voor data in rust en onderweg — geen verouderde of zelfgemaakte algoritmes.
- Beveiliging op hardwareniveau voor apparaten zoals tamperbestendige microprocessoren: hardware-vertrouwensankers (roots of trust), integriteit van secure boot, fysieke tamperbestendigheid.
- Veilige, grotendeels automatische updates met een duidelijke opt-out voor professionele gebruikers.
- Een machineleesbare SBOM (SPDX of CycloneDX) die alle afhankelijkheden bijhoudt om snel patchen mogelijk te maken.
- Een toegezegde ondersteuningsperiode — in de regel niet korter dan 5 jaar.

Dit alles wordt samengebracht in een technisch documentatiedossier — risicobeoordelingen, architectuurontwerpen, SBOM, testrapporten — dat ten minste 10 jaar of de ondersteuningsperiode wordt bewaard, welke van beide langer is.

## Annex I, Deel I — de beveiligingseigenschappen van het product

Annex I is waar de CRA concreet wordt, en bestaat uit twee delen. **Deel I** regelt hoe het product zelf zich moet gedragen. De overkoepelende norm, in **punt (1)**, is dat producten zodanig moeten worden ontworpen, ontwikkeld en geproduceerd dat een *"passend niveau van cyberbeveiliging op basis van de risico's"* wordt gewaarborgd. Punt (2) somt vervolgens 13 specifieke eigenschappen op die deze norm invullen. ([Annexen CRA](https://www.cyberresilienceact.eu/annexes.html))

| Beveiligingseigenschap | Wat dit in de praktijk vereist |
|---|---|
| **Geen bekende exploiteerbare kwetsbaarheden** | Leveren zonder bekende, exploiteerbare gebreken — kwetsbaarheidsbeheer vóór release, niet erna. |
| **Secure by default** | Geleverd met een veilige configuratie direct uit de doos; geen universele standaardwachtwoorden; een manier om terug te zetten naar een veilige fabrieksstandaardstaat. |
| **Mogelijkheid tot beveiligingsupdates** | Automatische beveiligingsupdates standaard ingeschakeld, met een duidelijke opt-out, gebruikersmelding en de mogelijkheid om uit te stellen. |
| **Toegangscontrole & authenticatie** | Bescherming tegen ongeautoriseerde toegang met passende authenticatie, identiteitsbeheer en rolgebaseerde toegangscontrole; melding van mogelijke pogingen tot ongeautoriseerde toegang. |
| **Vertrouwelijkheid** | Data in rust en onderweg beschermd met state-of-the-art versleuteling — zowel opgeslagen data, verzonden data, command-and-control-verkeer als inloggegevens en sleutels. |
| **Integriteit** | Bescherming van opgeslagen/verzonden data, commando's en configuratie tegen aantasting; melding van integriteitsschendingen. |
| **Dataminimalisatie** | Alleen data verwerken die adequaat, relevant en beperkt is tot wat het product nodig heeft. |
| **Beschikbaarheid & veerkracht** | Bescherming van essentiële functies; weerstand bieden aan en herstellen van denial-of-service; waar haalbaar functioneren in afgeslankte modus behouden. |
| **Geminimaliseerd aanvalsoppervlak** | Onnodige diensten, poorten en protocollen standaard uitschakelen; de software-footprint verkleinen. |
| **Beperking van incidentimpact** | Terugvalwerking, geleidelijke degradatie, netwerksegmentatie, isolatie van gecompromitteerde onderdelen. |
| **Beveiligingslogging & monitoring** | Beveiligingsrelevante gebeurtenissen registreren en monitoren; logs beschikbaar stellen aan gebruikers; een opt-out toestaan (maar standaard ingeschakeld laten). |
| **Veilig wissen van data** | Een mogelijkheid voor de gebruiker om data en configuratie veilig en permanent te wissen, met name bij buitengebruikstelling. |
| **Beperking van blootstelling aan aanvallen** | De vangnetverplichting op engineeringgebied — veilige codering, beveiliging van supply-chaincomponenten, integriteit van de build, architecturale keuzes die het exploiteerbare oppervlak verkleinen. |

> [!NOTE]
> **Niet elke eis geldt voor elk product, maar stilzwijgen is geen optie.** Onder **artikel 13, leden 3–4**, moet de risicobeoordeling aangeven welke van deze 13 eisen van toepassing zijn en hoe ze zijn geïmplementeerd — en waar een eis werkelijk niet van toepassing is (een product dat nooit data verzendt, heeft geen verplichting tot vertrouwelijkheid van data onderweg), moet de fabrikant een **duidelijke, schriftelijke motivering** opnemen in de technische documentatie. Een ongedocumenteerde "niet van toepassing" is een compliancetekortkoming, geen kortere weg.

## Bijlage I, deel II — kwetsbaarheidsbeheer en de SBOM

**Deel II** regelt het proces dat een fabrikant gedurende de hele ondersteuningsperiode moet uitvoeren. Dit is de operationele discipline achter de beveiligingseigenschappen van het product, en dit geldt voor elke fabrikant, ongeacht de productklasse.

| Verplichting kwetsbaarheidsbeheer | Wat het betekent |
|---|---|
| **Componenten identificeren & documenteren** | Weet wat er in het product zit, inclusief een **software bill of materials (SBOM)** die ten minste de belangrijkste afhankelijkheden dekt, in een algemeen gebruikt machineleesbaar formaat. |
| **Onverwijld verhelpen** | Kwetsbaarheden snel aanpakken en verhelpen, onder meer via **gratis beveiligingsupdates** gedurende de ondersteuningsperiode; beveiligingsfixes waar mogelijk scheiden van functionele releases. |
| **Regelmatig testen** | Een doorlopend, gepland programma — periodieke penetratietests, geautomatiseerde CVE-scans tegen de actuele SBOM, en regressietests — geen eenmalige controle vóór de release. |
| **Openbare bekendmaking van fixes** | Zodra een fix beschikbaar is, de ernst, impact en het herstel ervan publiceren — vergelijkbaar met de CVE/CNA-advisorypraktijk. |
| **Gecoördineerde openbaarmaking** | Een CVD-beleid voeren en publiceren, met een aangewezen centraal contactpunt dat voor gebruikers gemakkelijk te vinden is. |
| **Melding stroomopwaarts** | Bij het identificeren van een kwetsbaarheid in een component van een derde partij of open source, dit melden aan de beheerder van dat component — en waar passend een ontwikkelde patch delen. |
| **Veilige distributie** | Updates distribueren met integriteitsbescherming en authenticatie, zodat het updatekanaal zelf geen aanvalsvector voor de toeleveringsketen kan worden. |
| **Informatie-uitwisseling** | Op verzoek informatie verstrekken aan bevoegde autoriteiten over het aantal kwetsbaarheden, de ernst en het beleid voor de afhandeling ervan. |

> [!NOTE]
> **Waarom de SBOM belangrijker is dan het lijkt.** Industriële producten worden opgebouwd uit lagen van componenten van derden en open source. De SBOM-verplichting dwingt fabrikanten om daadwerkelijk te weten wat er in hun producten zit en om de kwetsbaarheden die deze componenten met zich meebrengen te volgen. Een verouderde SBOM is op zichzelf al een compliancerisico — hij kan de 24-uursmeldingsklok van artikel 14 niet ondersteunen als u niet eens weet dat een kwetsbaar component in het product zit. Voor operators is een SBOM van een leverancier een directe input voor uw eigen risicobeeld — en iets redelijks om ruim vóór 2027 bij inkoop te eisen.

## Volledig overzicht van verplichtingen — de levenscyclus van de fabrikant

Van begin tot eind gelezen beschrijft de CRA een levenscyclus, geen eenmalige poort, en het is nuttig om het geheel te zien uitgezet tegen de artikelen die het creëren.

| Fase van de levenscyclus | Juridische basis | Wat moet bestaan |
|---|---|---|
| **Classificeren** | Artikelen 6–8, Bijlage III/IV, Uitv. Verord. 2025/2392 | Product ingedeeld als Standaard / Belangrijk I / Belangrijk II / Kritiek — bepaalt de conformiteitsroute. |
| **Ontwerp & bouw** | Artikel 13, lid 1–3 | Beveiliging wordt overwogen gedurende *"planning, ontwerp, ontwikkeling, productie, levering en onderhoud"*; de risicobeoordeling documenteert welke eisen van Bijlage I van toepassing zijn en hoe. |
| **Kwetsbaarheidsbeheer** | Artikel 13, lid 2–3, Bijlage I deel II | SBOM-pijplijn, CVD-beleid, centraal contactpunt, regelmatig testen — operationeel vóór 11 september 2026. |
| **Technische documentatie** | Artikel 31, Bijlage VII | Productbeschrijving, risicobeoordeling, bewijs van naleving van Bijlage I, SBOM, toegepaste normen, testrapporten, resultaten van de conformiteitsbeoordeling, DoC, onderbouwing van de ondersteuningsperiode. Bewaard gedurende 10 jaar of de ondersteuningsperiode, indien langer. |
| **Conformiteitsbeoordeling** | Artikel 32 | Module A (zelf), Module B+C (typeonderzoek door aangemelde instantie + productiecontrole), Module H (volledige KA), of Europese cyberbeveiligingscertificering voor kritieke producten. |
| **Verklaring & markering** | Artikelen 28, 30, Bijlage V | EU-conformiteitsverklaring met verwijzing naar Verordening (EU) 2024/2847; CE-markering pas aangebracht zodra de DoC bestaat. |
| **Gebruikersinformatie** | Artikel 13, lid 18, Bijlage II | Contactgegevens fabrikant, CVD-URL, beoogd gebruik, bekende risico's, verwijzing naar de DoC, einddatum ondersteuningsperiode, instructies voor veilig gebruik — in een taal die gebruikers begrijpen. |
| **Ondersteuningsperiode** | Artikel 13, lid 8 | In beginsel **ten minste 5 jaar** gratis beveiligingsupdates; korter alleen indien werkelijk gerechtvaardigd door de verwachte levensduur van het product. |
| **Melding** | Artikel 14 | 24 uur vroegtijdige waarschuwing → 72 uur gedetailleerde melding → 14 dagen/1 maand eindrapport aan ENISA + CSIRT, voor actief misbruikte kwetsbaarheden en ernstige incidenten — van kracht vanaf **11 september 2026**, voor alle producten binnen het toepassingsgebied, ongeacht de datum van marktplaatsing. |
| **Bewaring** | Artikel 13, lid 13 | Technisch dossier en DoC bewaard gedurende 10 jaar vanaf marktplaatsing, of de ondersteuningsperiode, indien langer. |

```svg
<svg viewBox="0 0 700 300" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif">
  <!-- top row blocks -->
  <rect x="20" y="40" width="150" height="60" rx="8" fill="none" stroke="#3b82f6" stroke-width="2"/>
  <text x="95" y="66" fill="#e5e7eb" font-size="13" font-weight="bold" text-anchor="middle">Veilig ontwerp</text>
  <text x="95" y="84" fill="#94a3b8" font-size="11" text-anchor="middle">Bijlage I deel I</text>

  <rect x="200" y="40" width="150" height="60" rx="8" fill="none" stroke="#3b82f6" stroke-width="2"/>
  <text x="275" y="66" fill="#e5e7eb" font-size="13" font-weight="bold" text-anchor="middle">SBOM &amp;</text>
  <text x="275" y="84" fill="#e5e7eb" font-size="13" font-weight="bold" text-anchor="middle">componenten</text>

  <rect x="380" y="40" width="150" height="60" rx="8" fill="none" stroke="#f97316" stroke-width="2"/>
  <text x="455" y="66" fill="#e5e7eb" font-size="13" font-weight="bold" text-anchor="middle">Conformiteit</text>
  <text x="455" y="84" fill="#94a3b8" font-size="11" text-anchor="middle">beoordeling + CE</text>

  <rect x="540" y="40" width="140" height="60" rx="8" fill="#f97316" fill-opacity="0.12" stroke="#f97316" stroke-width="2"/>
  <text x="610" y="76" fill="#e5e7eb" font-size="13" font-weight="bold" text-anchor="middle">Op de markt</text>

  <!-- arrows top row -->
  <line x1="170" y1="70" x2="200" y2="70" stroke="#94a3b8" stroke-width="2" marker-end="url(#arr)"/>
  <line x1="350" y1="70" x2="380" y2="70" stroke="#94a3b8" stroke-width="2" marker-end="url(#arr)"/>
  <line x1="530" y1="70" x2="540" y2="70" stroke="#94a3b8" stroke-width="2" marker-end="url(#arr)"/>

  <!-- down into lifecycle band -->
  <line x1="610" y1="100" x2="610" y2="160" stroke="#94a3b8" stroke-width="2" marker-end="url(#arr)"/>

  <!-- lifecycle band -->
  <rect x="60" y="170" width="440" height="70" rx="8" fill="none" stroke="#3b82f6" stroke-width="2"/>
  <text x="280" y="198" fill="#e5e7eb" font-size="13" font-weight="bold" text-anchor="middle">Kwetsbaarheidsbeheer &amp; beveiligingsupdates</text>
  <text x="280" y="220" fill="#94a3b8" font-size="11" text-anchor="middle">Ondersteuningsperiode — in beginsel ≥ 5 jaar (Bijlage I deel II)</text>

  <rect x="530" y="170" width="150" height="70" rx="8" fill="#f97316" fill-opacity="0.12" stroke="#f97316" stroke-width="2"/>
  <text x="605" y="198" fill="#e5e7eb" font-size="13" font-weight="bold" text-anchor="middle">Melding</text>
  <text x="605" y="218" fill="#94a3b8" font-size="11" text-anchor="middle">24u / 72u / eindrapport</text>

  <line x1="530" y1="205" x2="500" y2="205" stroke="#94a3b8" stroke-width="2" marker-end="url(#arr)"/>

  <!-- feedback loop -->
  <path d="M 60 205 Q 20 205 20 140 Q 20 70 20 70" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4 4" marker-end="url(#arr)"/>
  <text x="30" y="270" fill="#94a3b8" font-size="11" text-anchor="start">Bevindingen worden teruggekoppeld naar ontwerp en updates</text>

  <defs>
    <marker id="arr" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="#94a3b8"/>
    </marker>
  </defs>
</svg>
```

## De conformiteitsbeoordelingsroute per productklasse

De klasse waarin u terechtkomt, bepaalt wie het product afkeurt of goedkeurt en hoeveel tijd dat kost om te regelen. Dit is de beslissing die de planning meer stuurt dan het engineeringwerk zelf.

```svg
<svg viewBox="0 0 700 320" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif">
  <rect x="20" y="20" width="200" height="50" rx="8" fill="none" stroke="#94a3b8" stroke-width="2"/>
  <text x="120" y="50" fill="#e5e7eb" font-size="13" font-weight="bold" text-anchor="middle">Product classificeren</text>

  <line x1="120" y1="70" x2="120" y2="100" stroke="#94a3b8" stroke-width="2" marker-end="url(#arr2)"/>

  <!-- Default -->
  <rect x="20" y="100" width="150" height="60" rx="8" fill="none" stroke="#3b82f6" stroke-width="2"/>
  <text x="95" y="124" fill="#e5e7eb" font-size="12" font-weight="bold" text-anchor="middle">Standaard</text>
  <text x="95" y="142" fill="#94a3b8" font-size="10" text-anchor="middle">Module A</text>
  <text x="95" y="155" fill="#94a3b8" font-size="10" text-anchor="middle">zelfbeoordeling</text>

  <!-- Class I -->
  <rect x="190" y="100" width="150" height="60" rx="8" fill="none" stroke="#3b82f6" stroke-width="2"/>
  <text x="265" y="120" fill="#e5e7eb" font-size="12" font-weight="bold" text-anchor="middle">Belangrijk Klasse I</text>
  <text x="265" y="138" fill="#94a3b8" font-size="10" text-anchor="middle">Module A indien norm</text>
  <text x="265" y="151" fill="#94a3b8" font-size="10" text-anchor="middle">volledig toegepast — anders B+C/H</text>

  <!-- Class II -->
  <rect x="360" y="100" width="150" height="60" rx="8" fill="none" stroke="#f97316" stroke-width="2"/>
  <text x="435" y="120" fill="#e5e7eb" font-size="12" font-weight="bold" text-anchor="middle">Belangrijk Klasse II</text>
  <text x="435" y="138" fill="#94a3b8" font-size="10" text-anchor="middle">Altijd Module B+C</text>
  <text x="435" y="151" fill="#94a3b8" font-size="10" text-anchor="middle">of Module H</text>

  <!-- Critical -->
  <rect x="530" y="100" width="150" height="60" rx="8" fill="#f97316" fill-opacity="0.12" stroke="#f97316" stroke-width="2"/>
  <text x="605" y="120" fill="#e5e7eb" font-size="12" font-weight="bold" text-anchor="middle">Kritiek</text>
  <text x="605" y="138" fill="#94a3b8" font-size="10" text-anchor="middle">Europese cyber-</text>
  <text x="605" y="151" fill="#94a3b8" font-size="10" text-anchor="middle">certificeringsregeling</text>

  <line x1="120" y1="70" x2="95" y2="100" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#arr2)"/>
  <line x1="120" y1="70" x2="265" y2="100" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#arr2)"/>
  <line x1="120" y1="70" x2="435" y2="100" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#arr2)"/>
  <line x1="120" y1="70" x2="605" y2="100" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#arr2)"/>

  <line x1="95" y1="160" x2="95" y2="200" stroke="#94a3b8" stroke-width="2" marker-end="url(#arr2)"/>
  <line x1="265" y1="160" x2="265" y2="200" stroke="#94a3b8" stroke-width="2" marker-end="url(#arr2)"/>
  <line x1="435" y1="160" x2="435" y2="200" stroke="#94a3b8" stroke-width="2" marker-end="url(#arr2)"/>
  <line x1="605" y1="160" x2="605" y2="200" stroke="#94a3b8" stroke-width="2" marker-end="url(#arr2)"/>

  <rect x="20" y="200" width="660" height="55" rx="8" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="3 3"/>
  <text x="350" y="222" fill="#e5e7eb" font-size="12" font-weight="bold" text-anchor="middle">Technisch dossier (Bijlage VII) + EU-conformiteitsverklaring (Artikel 28)</text>
  <text x="350" y="240" fill="#94a3b8" font-size="10" text-anchor="middle">Dezelfde documentatiebasis ongeacht de route — alleen wie ervoor tekent, verschilt</text>

  <line x1="350" y1="255" x2="350" y2="275" stroke="#94a3b8" stroke-width="2" marker-end="url(#arr2)"/>
  <rect x="250" y="275" width="200" height="35" rx="8" fill="#f97316" fill-opacity="0.15" stroke="#f97316" stroke-width="2"/>
  <text x="350" y="297" fill="#e5e7eb" font-size="13" font-weight="bold" text-anchor="middle">CE-markering aangebracht</text>

  <defs>
    <marker id="arr2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="#94a3b8"/>
    </marker>
  </defs>
</svg>
```

## De ondersteuningsperiode — een nieuwe vorm voor leveranciersrelaties

Een van de meest praktisch ingrijpende eisen van de CRA is de **ondersteuningsperiode**: fabrikanten moeten beveiligingsupdates leveren gedurende een periode die passend is voor het product, en **in beginsel ten minste vijf jaar** (korter alleen wanneer het product naar verwachting korter in gebruik zal zijn). Technische documentatie en de EU-conformiteitsverklaring moeten ten minste tien jaar worden bewaard, of de ondersteuningsperiode indien langer.

Voor industriële apparatuur die doorgaans een decennium of langer draait, verandert dit de commerciële relatie ingrijpend — en creëert het een reëel inkooprisico voor greenfieldlocaties. Een PLC die in 2028 wordt geïnstalleerd op een locatie die naar verwachting tot 2048 in bedrijf blijft, heeft een operationele horizon van 20 jaar; de ondergrens van de CRA is slechts 5 jaar. Tenzij een leverancier zich contractueel verbindt tot een langere ondersteuningsperiode, draait de locatie het grootste deel van haar operationele levensduur met componenten die niet meer onder de CRA worden ondersteund. Beveiligingsondersteuning is niet langer een geste van goede wil die vervalt zodra een productlijn wordt uitgefaseerd, maar wordt een wettelijke verwachting over een vastgestelde levensduur. Voor kopers is de ondersteuningsperiode een onderhandelingsanker: u kunt een leverancier houden aan een vastgelegde termijn, en u kunt vragen wat er gebeurt bij het einde van de ondersteuning voordat u tekent.

## Melding — de 24-uursklok

De CRA introduceert een scherp, gefaseerd meldingsregime onder **artikel 14**. **Actief misbruikte kwetsbaarheden** en **ernstige incidenten** die de productbeveiliging aantasten, moeten via één enkel meldingsplatform worden gemeld aan de nationale **CSIRT** van de fabrikant en, gelijktijdig, aan **ENISA**. ([EC — melding](https://digital-strategy.ec.europa.eu/en/policies/cra-reporting))

| Fase | Termijn | Inhoud |
|---|---|---|
| **Vroegtijdige waarschuwing** | Binnen **24 uur** nadat men zich ervan bewust wordt | Eerste melding dat een actief misbruikte kwetsbaarheid of ernstig incident bestaat, en welke lidstaten het product heeft bereikt — zodat CSIRT's de waarschuwing aan elkaar kunnen doorgeven. |
| **Gedetailleerde melding** | Binnen **72 uur** | Productinformatie, aard van het misbruik en de kwetsbaarheid, genomen en voor gebruikers beschikbare corrigerende/mitigerende maatregelen, gevoeligheidsclassificatie van het rapport. |
| **Eindrapport** | **14 dagen** (kwetsbaarheid, nadat een fix beschikbaar is) / **1 maand** (ernstig incident) | Beschrijving, ernst, impact, informatie over de kwaadwillende actor indien bekend, en details van de geleverde beveiligingsupdate. ([CRA-meldingstermijnen](https://www.cyberresilienceact.eu/reporting.html)) |

> [!WARNING]
> **De 24-uursplicht werkt met terugwerkende kracht, ook al is het product dat niet.** De meldingsplicht van artikel 14 geldt vanaf 11 september 2026 voor *alle* producten binnen het toepassingsgebied, ongeacht wanneer ze op de markt zijn geplaatst. Een leverancier kan niet stellen "dit SCADA-systeem dateert van vóór de CRA" — als hij na die datum kennis krijgt van actief misbruik, start de klok op precies dezelfde manier als voor een product uit 2028. Bouw eerst de detectie- en meldingspijplijn; die moet al bestaan ruim voordat het conformiteitswerk voor het product is afgerond.

Nog twee operationele gevolgen. Ten eerste loopt de gebruikersmelding onder **artikel 14, lid 8** parallel aan de regelgevende melding, niet erna — getroffen gebruikers moeten worden geïnformeerd, bij voorkeur in een gestructureerd, machineleesbaar formaat, op hetzelfde moment dat ENISA en de CSIRT worden ingelicht. Ten tweede is de melding een eenmalige indiening: één rapport via het platform bereikt de CSIRT en ENISA, die dit vervolgens doorgeven aan andere getroffen CSIRT's. Micro- en kleine ondernemingen krijgen enige verlichting van sancties bij het missen van de 24-uurstermijn voor kwetsbaarheden, maar de verplichting zelf blijft onverkort gelden.

> [!TIP]
> Behandel CRA-melding en uw [NIS2](/nl/nis2)-incidentmelding als één detectie- en responscapaciteit, niet als twee aparte zaken. De onderliggende vaardigheid — een ernstige gebeurtenis herkennen, bepalen dat deze meldingsplichtig is, en binnen een dag een eerste melding versturen — is dezelfde. Bouw het eenmalig.

## Sancties — CRA en NIS2 vergeleken

Niet-naleving van de **essentiële eisen of de kernverplichtingen van de fabrikant** kan boetes opleveren tot **€15 miljoen of 2,5% van de totale wereldwijde jaaromzet**, afhankelijk van welk bedrag hoger is. Handhaving vindt plaats door nationale markttoezichtautoriteiten, en boetes gelden **per product** — een fabrikant met meerdere niet-conforme productlijnen kan met meerdere, cumulatieve sancties worden geconfronteerd.

| Niveau | Overtreding | CRA-plafond (hoogste van) |
|---|---|---|
| **Niveau 1** | Essentiële eisen van Bijlage I; verplichtingen van de fabrikant onder artikel 13; meldingsverplichtingen van artikel 14 | **€15.000.000** of **2,5%** van de wereldwijde jaaromzet |
| **Niveau 2** | Verplichtingen van marktdeelnemers (Artikelen 18–23); Conformiteitsverklaring (Artikel 28); CE-markering / technische documentatie (Artikelen 30–31); conformiteitsbeoordeling (Artikel 32) | **€10.000.000** of **2%** van de wereldwijde jaaromzet |
| **Niveau 3** | Het verstrekken van onjuiste, onvolledige of misleidende informatie aan een aangemelde instantie of markttoezichtautoriteit | **€5.000.000** of **1%** van de wereldwijde jaaromzet |

**Hoe dit zich verhoudt tot NIS2:** de twee regimes verschillen structureel, niet alleen in cijfers. NIS2 begrenst boetes voor essentiële entiteiten op **€10 miljoen**, maar de scherpste kant ervan is **persoonlijke aansprakelijkheid** — het houdt bestuursorganen rechtstreeks verantwoordelijk voor tekortkomingen in het cyberrisicobeheer, los van de bedrijfsboete. De CRA kent geen gelijkwaardige clausule voor persoonlijke aansprakelijkheid; het drukmiddel is uitsluitend de aan de omzet gekoppelde boete, toegepast per niet-conform product. Samen sluiten ze de cirkel vanuit beide richtingen: NIS2 maakt een bestuurder persoonlijk aanspreekbaar op de wijze waarop zijn organisatie risico's beheert; de CRA zorgt ervoor dat de producten die die organisatie koopt of bouwt een afdwingbare cyberbeveiligingsondergrens dragen.

Net als bij NIS2 en de [AI Act](/nl/ai-act) is de koppeling aan de omzet weloverwogen: productbeveiliging is nu een risico op bestuursniveau, geen begrotingspost die leeft en sterft binnen engineering. ([Pillsbury — CRA-vereisten](https://www.pillsburylaw.com/en/news-and-insights/eu-cyber-resilience-act-requirements-products-software.html))

```cta
Niet zeker of u fabrikant, integrator of importeur bent onder de CRA?
Uw rol of productklasse verkeerd inschatten is de duurste fout in CRA-gereedheid — en de klokken voor ondersteuning en melding lopen al. Wij brengen het in kaart voordat ze aflopen.
Bepaal mijn CRA-verplichtingen :: /nl/contact
```

## Product of systeem? De scopingvraag die alles bepaalt

Nog voordat één Bijlage I-maatregel wordt gekozen, bepaalt één bedrieglijk eenvoudige vraag het hele compliancetraject: **wat is precies uw "product"?** De CRA beantwoordt dit in **Artikel 3(1)** — een product met digitale elementen is *"een software- of hardwareproduct en de bijbehorende oplossingen voor gegevensverwerking op afstand, met inbegrip van software- of hardwarecomponenten die afzonderlijk in de handel worden gebracht."* ([EUR-Lex, officiële tekst](https://eur-lex.europa.eu/eli/reg/2024/2847/oj/eng))

Het gevolg is makkelijk te missen en duur om verkeerd te doen. De CRA is van toepassing op **elke individuele producteenheid die op de EU-markt wordt gebracht** — niet op een systeem, een installatie of een geconfigureerde oplossing. Dat is de fundamentele architectonische breuk met [IEC 62443](/nl/iec-62443), dat redeneert op het niveau van een *System Under Consideration* opgebouwd uit zones en conduits. Twee fabrikanten die dezelfde hardware leveren, kunnen daardoor volledig verschillende verplichtingen hebben, afhankelijk van hoe ze die in de handel brengen:

- Wordt een verpakte automatiseringsoplossing met vier interne zones als **één geïntegreerd product** in de handel gebracht, dan behandelt de CRA het als één product met één conformiteitsverklaring onder **Artikel 28**.
- Wordt elk zone-apparaat **afzonderlijk** in de handel gebracht, dan wordt elk een **onafhankelijk beoordeeld product** — met een eigen risicobeoordeling, een eigen technisch dossier en mogelijk een eigen conformiteitsroute.

> [!IMPORTANT]
> Deze product-versus-systeem-scoping is het meest voorkomende punt van verwarring voor OT- en ICS-fabrikanten, die van nature in *systemen* denken, niet in *producten*. Het verkeerd inschatten werkt door: het bepaalt de conformiteitsroute, of een aangemelde instantie verplicht is, en de volledige omvang van het technisch dossier. Dit moet als eerste worden vastgesteld — vóór ontwerp, vóór maatregelen, vóór enige 62443-afstemming.

## Hoe de CRA risico kalibreert — het "waar van toepassing"-mechanisme

De CRA gebruikt nooit Security Levels. Het kalibratiemechanisme is de **cybersecurityrisicobeoordeling** uit **Artikel 13(2) en (3)** — en dit begrijpen is het verschil tussen rigoureuze, verdedigbare compliance en óf over-engineering óf niet-naleving.

**Artikel 13(2)** verplicht fabrikanten om *"een beoordeling uit te voeren van de cybersecurityrisico's die verbonden zijn aan een product met digitale elementen"* en de uitkomst mee te nemen in alle levensfasen. **Artikel 13(3)** koppelt die beoordeling rechtstreeks aan de maatregelen: zij moet *"aangeven of, en zo ja op welke wijze, de beveiligingseisen in Bijlage I, deel I, punt (2), van toepassing zijn."* ([EUR-Lex](https://eur-lex.europa.eu/eli/reg/2024/2847/oj/eng))

De proportionaliteitspoort zit in twee begrippen. **Bijlage I, deel I, punt (1)** stelt de norm — producten moeten *"een passend niveau van cyberbeveiliging op basis van de risico's"* waarborgen. Het woord **"passend"** is de juridische haak voor proportionaliteit. **Bijlage I, deel I, punt (2)** somt vervolgens de specifieke technische eigenschappen op (toegangscontrole, vertrouwelijkheid, integriteit, beschikbaarheid, minimaal aanvalsoppervlak, en meer) die gelden *"op basis van de risicobeoordeling en **waar van toepassing**."*

Die zinsnede — **"waar van toepassing"**, versterkt door **Overweging 55** — is bepalend. Waar een specifieke essentiële eis niet relevant is voor het beoogde doel of risicoprofiel van een product, hoeft de fabrikant die niet te implementeren, **mits** een duidelijke schriftelijke rechtvaardiging is vastgelegd in de technische documentatie onder **Artikel 13(4)**.

```keyfacts
Scope-eenheid :: Het individuele product (Art. 3(1)) — niet het systeem
Risicomechanisme :: Cybersecurityrisicobeoordeling (Art. 13(2)–(3))
Proportionaliteitshaak :: "passend" + "waar van toepassing" (Bijlage I, deel I)
Niet-toepassing :: Toegestaan met schriftelijke rechtvaardiging (Art. 13(4), Overw. 55)
Equivalent aan :: IEC 62443 SL-T-differentiatie — als uitkomst uitgedrukt
```

De commerciële inzet is reëel. Een fabrikant die een rigoureuze, verdedigbare Artikel 13(2)–(3)-beoordeling kan schrijven en nauwkeurig aan Bijlage I koppelt, vermijdt het over-implementeren van maatregelen die het risicoprofiel niet vereist. Wie dat niet kan, staat voor het omgekeerde: óf de boetes van Artikel 64, óf de dode last van elk product engineeren op een maximale specificatie die het nooit nodig had.

## IEC 62443 Security Levels afbeelden op CRA-conformiteit

De meeste betrokken OT-fabrikanten bezitten al [IEC 62443](/nl/iec-62443)-certificeringen — en ontdekken dat **geen van die certificaten automatisch aan de CRA voldoet.** De twee kaders zijn rond verschillende conformiteitseenheden opgebouwd, dus de afbeelding moet bewust worden opgebouwd.

| Dimensie | IEC 62443 | Cyber Resilience Act |
|---|---|---|
| Conformiteitseenheid | System Under Consideration; zones & conduits | Het individuele product op de markt |
| Risicokalibratie | Security Levels SL-1 → SL-4 per zone | Risicobeoordeling (Art. 13(2)–(3)), "waar van toepassing" |
| Bewijs van naleving | SL-C-certificaat per component; SL-A per zone | Technisch dossier (Bijlage VII) + conformiteitsverklaring |
| Beoordeling door derden | Optioneel (62443-4-2 SL-C-certificering) | Verplicht voor Belangrijk Klasse I (zonder geharmoniseerde norm) en Klasse II |
| Target/Capability/Achieved | SL-T / SL-C / SL-A zijn onderscheiden | Samengevoegd tot één gedocumenteerde, risico-gerechtvaardigde uitkomst |

De brug is even conceptueel als technisch: **SL-T** (het doel dat een zone vereist) wordt de *input* voor de Artikel 13(2)-beoordeling; **SL-C** (de gecertificeerde capaciteit van een component) wordt *bewijs* voor de componenteisen van Bijlage I, deel II; en **SL-A** (wat een zone werkelijk bereikt) heeft geen directe CRA-tegenhanger, omdat de CRA stopt bij de productgrens. Een 62443-4-2 SL-C-certificaat is krachtig ondersteunend bewijs in een CRA-technisch dossier — maar geen vervanging voor de Bijlage I-traceerbaarheid die de CRA vereist.

## De kloof in geharmoniseerde normen — en de wachtrij bij aangemelde instanties

De conformiteitsroutes van de CRA leunen sterk op **geharmoniseerde normen**: haal er één aan in het Publicatieblad van de EU, en een fabrikant van een Belangrijk Klasse I-product kan met een vermoeden van conformiteit zelf beoordelen. Het probleem in 2026–2027 is timing. Medio 2026 is **nog geen enkele geharmoniseerde norm voor de CRA in het Publicatieblad aangehaald**, en de verwachte kandidaat — **EN IEC 62443-4-2 met een A11 CRA-afstemmingsbijlage** — wordt pas rond **Q2 2027** verwacht, enkele maanden vóór de hoofdverplichtingen op **11 december 2027**.

> [!WARNING]
> Totdat een geharmoniseerde norm is aangehaald, moet **elk Belangrijk Klasse I-product zonder norm — en elk Klasse II-product ongeacht — via een aangemelde instantie** worden beoordeeld. De capaciteit van aangemelde instanties voor de CRA is eindig en wordt nu opgebouwd. Wie wacht op de norm, riskeert een wachtrij die al is ontstaan, met een vaste en onwrikbare deadline.

Dit is de praktische reden waarom CRA-readiness niet tot 2027 kan wachten: de meldmachinerie is al verschuldigd in **september 2026**, en de conformiteitsroute voor hogere klassen loopt via derden waarvan de capaciteit ruim vóór de deadline schaars is.

## De schaal van de deadline — 100.000 fabrikanten, één datum

De CRA is geen nicheverplichting. De effectbeoordeling van de Europese Commissie identificeert in de orde van **100.000–110.000 marktdeelnemers** die producten met digitale elementen op de EU-markt brengen — die overgrote meerderheid moet conformiteit bereiken vóór **dezelfde datum van 11 december 2027**. Daarbovenop komt de meldplicht vanaf **11 september 2026** voor **elk reeds op de markt gebracht product**, inclusief langlevende industriële apparatuur van jaren geleden.

Voor OT is die samenloop bijzonder scherp: industriële producten zijn langlevend, opgebouwd uit diepe toeleveringsketens, en zitten vaak in veiligheidsgerelateerde functies waar de [Machineverordening](/nl/machine-act) en, voor AI-gestuurde componenten, de [AI Act](/nl/ai-act) tegelijk gelden. Fabrikanten die de CRA als weer een losse checklist behandelen, voldoen laat en duur. Wie hem opneemt in één risicogebaseerd productbeveiligingsprogramma — verankerd in het 62443-werk dat de meesten al hebben — voldoet in één keer.

## OXOT's methodologie voor de afstemming van CRA en IEC 62443

Dit is waar OXOT's eigen analyse verder gaat dan de algemene compliance-literatuur. Het zone-gedifferentieerde Security Level (SL)-raamwerk van IEC 62443 laat zich **niet** één-op-één afbeelden op de CRA — de twee regimes zijn opgebouwd rond verschillende eenheden. Maar het eigen risicogebaseerde proportionaliteitsmechanisme van de CRA levert een functioneel gelijkwaardig resultaat op, en OXOT heeft een herhaalbare methodologie ontwikkeld om tussen beide te vertalen.

### Waarom de twee raamwerken niet standaard op elkaar aansluiten

| | IEC 62443 | CRA |
|---|---|---|
| **Beoordelingseenheid** | System Under Consideration (SuC) — zones en conduits | Het individuele product dat op de EU-markt wordt geplaatst (Artikel 3, lid 1) |
| **Risicokalibratie** | Security Levels, SL-1 tot SL-4, toegekend per zone | Risicobeoordeling onder artikel 13, lid 2–3, toegepast "waar van toepassing" per eis van Bijlage I |
| **Nalevingsbewijs** | SL-C-certificaat per component; SL-A per zone na implementatie | Technisch dossier onder Bijlage VII + EU-conformiteitsverklaring |
| **Beoordeling door derden** | Optioneel (SL-C-certificering volgens IEC 62443-4-2) | Verplicht voor Belangrijk Klasse I zonder geharmoniseerde norm, en altijd voor Klasse II |
| **Status geharmoniseerde norm** | N.v.t. | EN IEC 62443-4-1/A11:2026 en -4-2/A11:2026 nog niet gepubliceerd in het PBEU (verwacht rond Q2 2027) |

Als uw "product" onder de CRA een volledig geïntegreerd systeem is met vier zones, behandelt de CRA dit als **één product** met **één conformiteitsverklaring**. Als elk zone-apparaat afzonderlijk op de markt wordt geplaatst, wordt elk zelfstandig beoordeeld. Bepalen welke van die twee u daadwerkelijk bent, is in de ervaring van OXOT het meest voorkomende punt van verwarring voor OT-fabrikanten — van wie de meesten in systemen denken, niet in producten — en het is de eerste vraag die onze methodologie beantwoordt.

### De proportionaliteitsbrug: SL-T als input voor de CRA-risicobeoordeling

De CRA gebruikt geen Security Levels. Het kalibratiemechanisme is de risicobeoordeling van artikel 13, lid 2–3, gestuurd door het woord **"passend"** in Bijlage I, deel I, punt (1) — *"een passend niveau van cyberbeveiliging op basis van de risico's"* — en geoperationaliseerd via de formulering **"waar van toepassing"** in punt (2).

De kernbevinding van OXOT: **een zone-/conduit-risicobeoordeling volgens IEC 62443-3-2, die zonespecifieke SL-T-waarden oplevert, is een volledig legitieme methodologie om te voldoen aan de risicobeoordelingseis van artikel 13, lid 2–3 van de CRA.** Een component met SL-C = 2 in een werkelijk laagrisicozone (SL-T = 2) is geen onder-implementatie — het is de correcte, verdedigbare CRA-basislijn voor die zone, mits de risicobeoordeling documenteert waarom. De hogere-SL Requirement Enhancements die een component in Zone 1 of Zone 4 nodig zou hebben, worden voor het component in Zone 3 terecht als "niet van toepassing" gemarkeerd — maar alleen met een schriftelijke, risicogebaseerde rechtvaardiging onder **artikel 13, lid 4**. Ongedocumenteerde niet-toepasselijkheid is geen kortere weg; het is een compliancetekortkoming die wacht om bij een audit te worden ontdekt.

> [!IMPORTANT]
> **De voorwaarde die de meeste zelfbeoordelingen doorbreekt:** IEC 62443 staat toe dat de behaalde beveiliging van een zone (SL-A) het doel (SL-T) haalt door middel van **compenserende maatregelen** — een firewall, een IDPS, een netwerkbeleid — zelfs als de capaciteit van een individueel component (SL-C) lager is. De productniveau-beoordeling van de CRA evalueert de **geïntegreerde** beveiligingshouding, niet geïsoleerde componentspecificaties. Als een component op SL-C = 2 zit in een zone met SL-T = 3, moet het technisch dossier expliciet documenteren *hoe* de compenserende maatregelen de SL-A van die zone naar 3 tillen — een claim van compenserende maatregelen zonder documentatie is een CRA-non-conformiteit, geen formaliteit.

### FR-naar-Bijlage-I-mapping — de traceerbaarheidsmatrix die een aangemelde instantie verwacht

De zeven Foundational Requirements (FR's) van IEC 62443-4-2 — elk opgebouwd uit gestapelde, cumulatieve Component Requirements (CR's) en Requirement Enhancements (RE's) over SL-1 tot SL-4 — worden rechtstreeks afgebeeld op specifieke subeisen van Bijlage I, deel I, punt (2) van de CRA. Deze mapping is de traceerbaarheidsmatrix die een aangemelde instantie zal verwachten in een technisch dossier van Klasse I of II, en vormt de ruggengraat van de Fase 1-beoordeling die OXOT oplevert.

| Eis van Bijlage I (2) van de CRA | Primaire IEC 62443 FR | Wat SL-2 doorgaans biedt | Wat SL-3 toevoegt |
|---|---|---|---|
| **(b)** Bescherming tegen ongeautoriseerde toegang | FR1 Identification & Authentication Control, FR2 Use Control | Unieke accounts, RBAC, PKI voor authenticatie tussen componenten | MFA voor alle gebruikers, ACL's per gebruiker, hardware-authenticators |
| **(c)** Vertrouwelijkheid van gegevens | FR4 Data Confidentiality | AES-128+ tijdens transport, veilig verwijderen | Encryptie in rust met hardwarematig sleutelbeheer |
| **(d)** Integriteit van gegevens en programma's | FR3 System Integrity | TLS, codeondertekening voor updates, gedefinieerde foutstatussen | Hardware root of trust, secure boot, measured launch |
| **(e)** Minimalisatie / beperkte gegevensstroom | FR5 Restricted Data Flow | Logische segmentatie, filtering op zonegrenzen | Fysieke segmentatie, deep packet inspection voor OT-protocollen (Modbus, OPC UA, DNP3) |
| **(f)** Beschikbaarheid van essentiële functies | FR7 Resource Availability | Basale DoS-bescherming, resourcelimieten | DoS-bestendigheid op applicatieniveau, gracieuze degradatie |
| **(h)** Beperking van aanvalsoppervlakken | FR5 (RDF), FR3 (SI) | Filtering op zonegrenzen | Minimale functionaliteit, deny-by-default |
| **(j)** Beveiligingslogging en -monitoring | FR6 Timely Response to Events | Toegankelijke auditlogs, real-time detectie | SIEM-export (Syslog/CEF/LEEF), afwijkingsdetectie, tamper-evident logs |

De escalatie van SL-2 naar SL-3 op FR1 — het toevoegen van multifactorauthenticatie en hardware-authenticators — is, in de ervaring van OXOT bij het uitvoeren van deze beoordelingen, de meest voorkomende tekortkoming voor OT-componenten die overgaan van een laagrisico- naar een hoogrisico-zoneclassificatie.

### De synergetische methode, in vijf stappen

De methodologie van OXOT behandelt IEC 62443 niet als vervanging van CRA-conformiteit, maar als de technische inhoud die de bewust op resultaat gerichte eisen van de CRA invult:

1. **Bepaal de reikwijdte van het "product."** Bepaal wat een enkel product vormt onder artikel 3, lid 1 — een volledig systeem met één conformiteitsverklaring, of afzonderlijk op de markt geplaatste zone-apparaten die elk een zelfstandige beoordeling vereisen.
2. **Voer de zone-/conduit-risicobeoordeling uit (IEC 62443-3-2).** Genereer SL-T-waarden per zone, met een gedocumenteerde karakterisering van de dreigingsactor volgens IEC 62443-1-1. Dit *is* de risicobeoordeling van artikel 13, lid 2 van de CRA — geen parallel traject.
3. **Breng FR/CR/RE-diepgang in kaart tegenover Bijlage I, per zone.** Leg voor elke subeis van Bijlage I, punt (2) vast welke FR/CR/RE-combinatie deze implementeert, op welke SL-diepgang, in elke zone.
4. **Documenteer niet-toepasselijkheid en compenserende maatregelen.** Elke niet-geïmplementeerde Requirement Enhancement krijgt een rechtvaardiging onder artikel 13, lid 4; elk gat waarbij SL-C < SL-T krijgt een aantoning van compenserende maatregelen dat de zone toch SL-A ≥ SL-T bereikt.
5. **Stel het technisch dossier volgens Bijlage VII samen.** Risicobeoordeling, nalevingsmatrix van Bijlage I (met FR/CR/RE-traceerbaarheid), SBOM, geraadpleegde normen (met verwijzing naar IEC 62443-4-1/4-2 als "andere relevante technische specificatie" onder Bijlage VII §5 tot formele harmonisatie), en het conformiteitsbeoordelingstraject — Module A, B+C of H, zoals de classificatie voorschrijft.

**Totdat EN IEC 62443-4-1/A11:2026 en -4-2/A11:2026 formeel zijn gepubliceerd in het PBEU**, ondersteunen IEC 62443-certificaten het technische betoog in het dossier, maar leveren zij op zichzelf geen vermoeden van conformiteit op. Fabrikanten die al volgens 62443 hebben gebouwd, hebben het grootste deel van het onderliggende technische werk al verricht — het gat dat OXOT dicht, is de gedocumenteerde, artikelsgewijs onderbouwde vertaling van SL-C-certificaten naar een nalevingsmatrix van Bijlage I die een aangemelde instantie of markttoezichtautoriteit daadwerkelijk zal accepteren.

## De CRA-synergiestroom

```svg
<svg viewBox="0 0 700 380" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif">
  <rect x="30" y="20" width="290" height="60" rx="8" fill="none" stroke="#3b82f6" stroke-width="2"/>
  <text x="175" y="46" fill="#e5e7eb" font-size="13" font-weight="bold" text-anchor="middle">IEC 62443-3-2</text>
  <text x="175" y="64" fill="#94a3b8" font-size="11" text-anchor="middle">Zone/conduit-risicobeoordeling → SL-T per zone</text>

  <rect x="380" y="20" width="290" height="60" rx="8" fill="none" stroke="#3b82f6" stroke-width="2"/>
  <text x="525" y="46" fill="#e5e7eb" font-size="13" font-weight="bold" text-anchor="middle">CRA artikel 13(2)–(3)</text>
  <text x="525" y="64" fill="#94a3b8" font-size="11" text-anchor="middle">Cyberbeveiligingsrisicobeoordeling — "waar van toepassing"</text>

  <line x1="320" y1="50" x2="380" y2="50" stroke="#f97316" stroke-width="2.5" marker-end="url(#arr3)"/>
  <text x="350" y="40" fill="#f97316" font-size="10" text-anchor="middle">voldoet aan</text>

  <line x1="175" y1="80" x2="175" y2="110" stroke="#94a3b8" stroke-width="2" marker-end="url(#arr3)"/>
  <line x1="525" y1="80" x2="525" y2="110" stroke="#94a3b8" stroke-width="2" marker-end="url(#arr3)"/>

  <rect x="30" y="110" width="290" height="60" rx="8" fill="none" stroke="#3b82f6" stroke-width="2"/>
  <text x="175" y="136" fill="#e5e7eb" font-size="13" font-weight="bold" text-anchor="middle">FR/CR/RE per zone</text>
  <text x="175" y="154" fill="#94a3b8" font-size="11" text-anchor="middle">SL-C behaald door elk component</text>

  <rect x="380" y="110" width="290" height="60" rx="8" fill="none" stroke="#3b82f6" stroke-width="2"/>
  <text x="525" y="136" fill="#e5e7eb" font-size="13" font-weight="bold" text-anchor="middle">Bijlage I, deel I, punt (2)</text>
  <text x="525" y="154" fill="#94a3b8" font-size="11" text-anchor="middle">13 essentiële eisen, in kaart gebracht per zone</text>

  <line x1="320" y1="140" x2="380" y2="140" stroke="#f97316" stroke-width="2.5" marker-end="url(#arr3)"/>
  <text x="350" y="130" fill="#f97316" font-size="10" text-anchor="middle">koppelt aan</text>

  <line x1="175" y1="170" x2="175" y2="200" stroke="#94a3b8" stroke-width="2" marker-end="url(#arr3)"/>
  <line x1="525" y1="170" x2="525" y2="200" stroke="#94a3b8" stroke-width="2" marker-end="url(#arr3)"/>

  <rect x="30" y="200" width="290" height="60" rx="8" fill="none" stroke="#94a3b8" stroke-width="2" stroke-dasharray="3 3"/>
  <text x="175" y="226" fill="#e5e7eb" font-size="13" font-weight="bold" text-anchor="middle">Hiaten: SL-C &lt; SL-T</text>
  <text x="175" y="244" fill="#94a3b8" font-size="11" text-anchor="middle">Compenserende maatregelen gedocumenteerd</text>

  <rect x="380" y="200" width="290" height="60" rx="8" fill="none" stroke="#94a3b8" stroke-width="2" stroke-dasharray="3 3"/>
  <text x="525" y="226" fill="#e5e7eb" font-size="13" font-weight="bold" text-anchor="middle">Niet-toepasselijke RE's</text>
  <text x="525" y="244" fill="#94a3b8" font-size="11" text-anchor="middle">Schriftelijke motivering artikel 13(4)</text>

  <line x1="320" y1="230" x2="380" y2="230" stroke="#f97316" stroke-width="2.5" marker-end="url(#arr3)"/>

  <line x1="175" y1="260" x2="350" y2="300" stroke="#94a3b8" stroke-width="2" marker-end="url(#arr3)"/>
  <line x1="525" y1="260" x2="350" y2="300" stroke="#94a3b8" stroke-width="2" marker-end="url(#arr3)"/>

  <rect x="200" y="300" width="300" height="60" rx="8" fill="#f97316" fill-opacity="0.15" stroke="#f97316" stroke-width="2"/>
  <text x="350" y="326" fill="#e5e7eb" font-size="13" font-weight="bold" text-anchor="middle">Technisch dossier bijlage VII</text>
  <text x="350" y="344" fill="#94a3b8" font-size="11" text-anchor="middle">Traceerbaarheidsmatrix die een aangemelde instantie zal verwachten</text>

  <defs>
    <marker id="arr3" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="#94a3b8"/>
    </marker>
  </defs>
</svg>
```

## De CRA en OT — twee kanten van dezelfde medaille

De CRA en NIS2 zijn complementaire helften van één strategie. **[NIS2](/nl/nis2)** verplicht operators om het risico van de systemen die zij gebruiken te beheren; de CRA verplicht fabrikanten om die systemen om te beginnen beveiligbaar te maken. De NIS2-plicht rond de toeleveringsketen van een operator (artikel 21) wordt veel makkelijker na te komen wanneer de producten in de keten CRA-conform zijn — geleverd met SBOM's, beveiligingsupdates en een ondersteuningstoezegging in plaats van een schouderophaal.

Voor operators die vanaf 2028 greenfield-faciliteiten in gebruik nemen, moeten inkoopspecificaties de CRA nu expliciet benoemen: CE-markeringsreferentie, DoC-referentienummer, einddatum van de ondersteuningsperiode, leveringsformaat van de SBOM (SPDX of CycloneDX), en de URL van het CVD-beleid van de leverancier. Voor renovaties en retrofits van bestaande installaties na 2027 is de kernvraag of de wijziging een **substantiële wijziging** vormt — een gelijkwaardige vervanging en beveiligingspatches leiden doorgaans niet tot volledige CRA-conformiteitsplicht; het toevoegen van nieuwe digitale functionaliteit, of een SCADA-upgrade op platformniveau, doorgaans wel.

**[IEC 62443](/nl/iec-62443)** blijft de natuurlijke technische brug voor OT-leveranciers, en **[TS 50701](/nl/ts-50701)** breidt diezelfde discipline uit naar de spoorsector. Waar de CRA juridisch bindend maar standaardagnostisch is, levert 62443 de concrete technische inhoud — een combinatie die ook goed aansluit op het bredere landschap van [raamwerken](/nl/frameworks).

## Het CRA Readiness-aanbod van OXOT

```carousel
CRA Readiness Assessment (bijlage A)
Een gestructureerde hiaatbeoordeling tegen de essentiële eisen van de CRA, per product afgebakend. Wij classificeren elk product volgens bijlage III/IV en Uitvoeringsverordening (EU) 2025/2392, bepalen welke conformiteitsroute daadwerkelijk vereist is, en stellen een geprioriteerde hiaatlijst op tegen bijlage I deel I en deel II — geen pass/fail, maar een concrete lijst van wat moet veranderen voordat een conformiteitsverklaring verdedigbaar is.
---
CRA Preparation Service
Waar de beoordeling hiaten vindt, is dit de uitvoerende arm: het bouwen van de kwetsbaarheidsafhandelingsmachine (SBOM-pijplijn, CVD-beleid, centraal contactpunt, testcadans), het samenstellen van het technisch dossier volgens bijlage VII, en het gereedmaken van het product voor de toepasselijke conformiteitsroute — zelfbeoordelingsbewijs voor Default en Klasse I met een geharmoniseerde norm, of een dossier dat klaar is voor een aangemelde instantie voor Klasse I zonder norm, Klasse II en kritieke producten.
---
Statutes 2-Pager-metgezel
Een beknopt, productspecifiek naslagwerk dat uw productcategorie direct koppelt aan de geldende CRA-statuten — classificatieniveau, toepasselijke eisen uit bijlage I, conformiteitsroute en de specifieke artikelen die een marktoezichtautoriteit zal aanhalen. Ontworpen om naast het technisch dossier te liggen als snel naslagwerk voor zowel engineering- als juridische teams.
---
CRA ↔ IEC 62443-harmonisatiemethode
Ons kernonderscheid: de traceerbaarheidsmatrix van FR/CR/RE naar bijlage I, toegepast zone voor zone. Voor fabrikanten die al volgens IEC 62443 zijn gebouwd, is dit de snelste route naar een CRA-verdedigbaar technisch dossier — het vertaalt bestaande SL-C-certificaten en zonerisicobeoordelingen naar de gedocumenteerde, artikel 13(4)-conforme motiveringen die een aangemelde instantie of marktoezichtautoriteit daadwerkelijk zal accepteren.
```

## De weg naar gereedheid voor fabrikanten

Conformiteit met de CRA bereiken is een reeks stappen, geen schakelaar. De vijf onderstaande fasen volgen hoe de meeste OT-productteams zullen bewegen van "bewust van de deadline" naar "CE-markering verdedigbaar."

```carousel
Fase 1 — Afbakenen en classificeren
Inventariseer elk product met digitale elementen dat u op de EU-markt plaatst. Bepaal voor elk product de klasse: default, belangrijk Klasse I/II, of kritiek. De klasse bepaalt uw conformiteitsroute en dus uw tijdlijn. Dit is ook het moment waarop u ontdekt bij welke producten u stilzwijgend "fabrikant" bent geworden door rebranding of substantiële wijziging.
---
Fase 2 — Hiaatbeoordeling tegen bijlage I
Toets elk product aan bijlage I deel I (beveiligingseigenschappen) en deel II (kwetsbaarheidsafhandeling). Teams die al zijn afgestemd op IEC 62443-4-1/4-2 zullen zien dat veel hiervan overeenkomt — maar de koppeling moet per eis worden gedocumenteerd, niet worden aangenomen. De uitkomst is een geprioriteerde hiaatlijst, geen pass/fail — de meeste producten hebben werk nodig op een handvol specifieke gebieden, geen volledige herbouw.
---
Fase 3 — Bouw de kwetsbaarheidsafhandelingsmachine
Zet de SBOM-pijplijn, het gecoördineerde openbaarmakingsbeleid, het meldingscontact, de testcadans en het veilige updatemechanisme op. Dit is het onderdeel dat vóór 11 september 2026 operationeel moet zijn voor melding, en loopt daarmee voor op het schema — vóór het eigenlijke productconformiteitswerk.
---
Fase 4 — Conformiteitsbeoordeling en CE
Doorloop de toepasselijke procedure: zelfbeoordeling voor default en (met geharmoniseerde normen) Klasse I, of een aangemelde instantie voor Klasse II en kritieke producten. Stel de technische documentatie samen, geef de EU-conformiteitsverklaring af en breng de CE-markering aan. De capaciteit van aangemelde instanties is beperkt en doorlooptijden van 4 tot 10 maanden zijn gebruikelijk — boek vroegtijdig.
---
Fase 5 — Beheer gedurende de ondersteuningsperiode
Houd updates, monitoring en openbaarmaking in stand gedurende de ondersteuningsperiode — als regel ten minste vijf jaar. Bewaar technische documentatie gedurende tien jaar. Voed bevindingen uit het veld terug naar het ontwerp. Conformiteit is een toestand die u onderhoudt, geen certificaat dat u opbergt en vergeet.
```

## Wat het betekent voor uw rol

**Als u industriële producten fabriceert, integreert of rebrandt**, is de CRA een directe compliance-verplichting met een harde deadline in 2027 en een meldingsmijlpaal in 2026. Classificeer de portfolio, bouw processen voor veilige ontwikkeling en kwetsbaarheidsafhandeling, produceer SBOM's, verbind u aan een ondersteuningsperiode, en — voor belangrijke en kritieke producten — regel tijdig een conformiteitsbeoordeling zolang er nog capaciteit is bij aangemelde instanties.

**Als u operator of inkoper bent**, is de CRA een hefboom. Vanaf 2027 moeten de producten die u koopt aan de essentiële eisen voldoen; daarvóór kunt u al CRA-conforme verwachtingen — een SBOM, gratis beveiligingsupdates, een vastgesteld ondersteuningsvenster, een contact voor openbaarmaking — vastleggen in inkoop- en aanbestedingscriteria. De wet geeft inkopers een vocabulaire die ze nooit eerder hadden, en dat zou vorm moeten geven aan zowel uw planning van greenfield-projecten als aan renovaties na 2027.

**Als u in het bestuur van een fabrikant zit**, voegt de CRA nog een aan de omzet gekoppeld sanctieregime toe en maakt productbeveiliging een governancekwestie met een vastgesteld tijdpad. De vraag aan het management is niet "zijn we compliant?" maar "welke producten volgen welke conformiteitsroute, en wat is het kritieke pad naar 2027?"

## Hoe OXOT helpt

OXOT werkt aan beide kanten van de CRA. Voor **operators** verwerken wij CRA-conforme eisen in inkoop en in de toeleveringsketendimensie van uw NIS2- en OT-beveiligingsprogramma's, en onze **[Cyber Digital Twin](/nl/cyber-digital-twin)** geeft u een gestructureerde plek om leverancier-SBOM's en componentrisico vast te leggen, zodat een nieuwe CVE in een gedeelde bibliotheek een opzoekactie is, geen brandoefening. Voor **fabrikanten en integrators** vertalen wij bijlage I naar een technisch programma afgestemd op [IEC 62443](/nl/iec-62443)-4-1/4-2 — waarbij wij onze eigen traceerbaarheidsmethode van FR/CR/RE naar bijlage I gebruiken om van de regelgeving een concreet, onderbouwd pad naar conformiteit te maken in plaats van een compliance-hectiek.

*De CRA Readiness Assessment, Preparation Service en Statutes 2-Pager van OXOT zijn beschikbaar als losse opdrachten of als gecombineerd programma — neem contact op om uw productportfolio af te bakenen.*

## Veelgestelde vragen

**Geldt de CRA ook voor software, naast hardware?**
Ja. Standalone software is een product met digitale elementen. Firmware en applicatiesoftware vallen beide binnen het toepassingsgebied, met inachtneming van de sectorale uitzonderingen (bepaalde medische, automotive en luchtvaartproducten die elders worden gereguleerd).

**Wij integreren controllers van derden in onze machines. Zijn wij fabrikant onder de CRA?**
Mogelijk. Als u het geïntegreerde product onder uw eigen naam op de markt brengt, of componenten substantieel wijzigt, kunt u de verplichtingen van een fabrikant op u nemen. Breng uw rol per product in kaart vóór 2027 — en let scherp op de grens van "substantiële wijziging"; routinematig onderhoud en gelijkwaardige reparaties leiden doorgaans niet tot deze status, maar het toevoegen van nieuwe digitale functionaliteit of een upgrade op platformniveau doorgaans wel.

**Is een SBOM echt verplicht?**
Bijlage I deel II vereist dat fabrikanten componenten identificeren en documenteren, inclusief het opstellen van een software bill of materials, als onderdeel van kwetsbaarheidsafhandeling. Behandel het als een kernresultaat, geen optionele extra — en behandel het als een levend document, aangezien een verouderde SBOM de 24-uursmeldingsklok niet kan ondersteunen.

**Wanneer precies moeten we beginnen met melden?**
De meldingsverplichtingen van artikel 14 gelden vanaf **11 september 2026** — eerder dan de hoofdverplichtingen, en voor producten die al op de markt zijn, niet alleen nieuwe. Een actief misbruikte kwetsbaarheid of ernstig incident triggert een vroegtijdige waarschuwing binnen 24 uur, een melding binnen 72 uur, en een eindrapport (14 dagen voor een kwetsbaarheid zodra deze is verholpen, één maand voor een ernstig incident).

**Hoe lang moeten we een product ondersteunen?**
Als regel ten minste vijf jaar, of de verwachte gebruiksduur van het product indien korter. Bewaar technische documentatie en de conformiteitsverklaring gedurende ten minste tien jaar, of de ondersteuningsperiode indien langer. Onderhandel voor industriële apparatuur met een lange levensduur expliciet over een langere toezegging — de CRA stelt een ondergrens, geen bovengrens.

**Voldoet ons bestaande IEC 62443 SL-C-certificaat aan de CRA?**
Niet automatisch, en nog niet formeel. Totdat EN IEC 62443-4-1/A11:2026 en -4-2/A11:2026 worden aangehaald in het Publicatieblad van de EU (verwacht rond Q2 2027), ondersteunt 62443-certificering uw technische argumentatie als "andere relevante technische specificatie", maar verleent het geen vermoeden van conformiteit. Het levert echter wel het grootste deel van het technische bewijs dat een aangemelde instantie zal willen zien — mits gekoppeld aan specifieke eisen uit bijlage I in plaats van in algemene termen aangehaald.

**Hoe verhoudt de CRA zich tot de AI Act, NIS2 en de Machineverordening?**
De **[AI Act](/nl/ai-act)** regelt AI-systemen, de CRA regelt producten met digitale elementen, **[NIS2](/nl/nis2)** regelt operators, en de **[Machineverordening](/nl/machine-act)** regelt machineveiligheid inclusief digitale besturing. Een verbonden industriële machine met een AI-veiligheidscomponent kan alle vier raken — precies waarom één samenhangend OT-beveiligingsprogramma beter is dan vier losstaande compliance-inspanningen.

## OXOT CRA Readiness-materialen

Praktische materialen uit het CRA Readiness-programma van OXOT:

- **[CRA Readiness — verkoopblad bijlage A (PDF)](/media/OXOT-CRA-Readiness-Annex-A.pdf)** — de reikwijdte van de beoordeling, de resultaten en hoe de readiness-opdracht aansluit op de CRA-verplichtingen.

Bekijk het CRA Readiness-overzicht:

```html
<video controls preload="metadata" poster="" style="width:100%;border:1px solid rgba(148,163,184,0.35);border-radius:12px;background:#0b1220">
  <source src="/media/OXOT-CRA-Readiness.mp4" type="video/mp4" />
  Uw browser ondersteunt de video-tag niet. <a href="/media/OXOT-CRA-Readiness.mp4">Download de video</a>.
</video>
```

## Bronnen

- Verordening (EU) 2024/2847 (Cyber Resilience Act), officiële tekst — [EUR-Lex](https://eur-lex.europa.eu/eli/reg/2024/2847/oj/eng)
- Beleidsoverzicht Cyber Resilience Act — [Europese Commissie](https://digital-strategy.ec.europa.eu/en/policies/cyber-resilience-act)
- Samenvatting van de CRA-wetstekst — [Europese Commissie](https://digital-strategy.ec.europa.eu/en/policies/cra-summary)
- CRA-conformiteitsbeoordeling — [Europese Commissie](https://digital-strategy.ec.europa.eu/en/policies/cra-conformity-assessment)
- CRA-meldingsverplichtingen — [Europese Commissie](https://digital-strategy.ec.europa.eu/en/policies/cra-reporting)
- Reikwijdte, klassen en deadlines van de CRA — [cyberresilienceact.eu](https://www.cyberresilienceact.eu/explained.html)
- CRA-bijlagen I–VIII, essentiële eisen en productlijsten — [cyberresilienceact.eu](https://www.cyberresilienceact.eu/annexes.html)
- CRA-meldingstermijnen (artikel 14) — [cyberresilienceact.eu](https://www.cyberresilienceact.eu/reporting.html)
- CRA-vereisten voor verbonden producten en software — [Pillsbury Law](https://www.pillsburylaw.com/en/news-and-insights/eu-cyber-resilience-act-requirements-products-software.html)
- CENELEC TC65X WG3, webinar "EN IEC 62443 to CRA" — [cencenelec.eu](https://www.cencenelec.eu/news-events/events/2025/2025-09-09-en-iec-62443-to-cra/)
- ENISA, "CRA Practical Insights" — [enisa.europa.eu](https://www.enisa.europa.eu/sites/default/files/2025-12/session%203-1%20-%20reusch%20law%20-%20cra%20practical%20insights.pdf)
- ORCWG, officiële CRA FAQ — [cra.orcwg.org](https://cra.orcwg.org/faq/official/faq_4-1-3/)
- CRA-sancties en boetes — [eu-cyber-laws.com](https://eu-cyber-laws.com/cra/penalties/)
- OXOT interne analyse: CRA Obligations Reference, CRA Class I/II Products, CRA and NIS2 Penalties, CRA × IEC 62443 Alignment Reference (OXOT B.V. intern strategisch referentiemateriaal, 2026)

*Deze pagina bevat algemene informatie over EU-recht en vormt geen juridisch advies. Bevestig hoe de CRA van toepassing is op uw producten en rol aan de hand van de Verordening en, waar nodig, gekwalificeerd juridisch advies. De CRA↔IEC 62443-afstemmingsanalyse weerspiegelt de eigen methodologie en interpretatie van OXOT per medio 2026; formele aanhaling van de geharmoniseerde norm kan specifieke koppelingen nog verfijnen.*
