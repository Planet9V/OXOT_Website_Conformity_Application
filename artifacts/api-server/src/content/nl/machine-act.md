---
title: De EU-Machineverordening
meta_title: EU-Machineverordening (EU) 2023/1230 & OT-beveiliging | OXOT
meta_description: Verordening (EU) 2023/1230 uitgelegd voor machinebouwers en -exploitanten — hoe zij de Machinerichtlijn vervangt, cyberbeveiliging onderdeel maakt van het veiligheidsdossier van de machine (bijlage III), omgaat met AI en zelflerende veiligheidscomponenten, de deadline van 20 januari 2027, conformiteitsbeoordeling door aangemelde instanties, en de koppeling met de AI-verordening, de CRA, IEC 62443 en NIS2.
excerpt: Machineveiligheid voor het tijdperk van connectiviteit, software en AI — waarin bescherming tegen corruptie een voorwaarde wordt voor de veiligheid van een machine.
content_type: page
published: true
---

Het grootste deel van de industriële geschiedenis leefden machineveiligheid en cyberbeveiliging in gescheiden werelden. Veiligheidsingenieurs redeneerden over afschermingen, vergrendelingen, lichtschermen en noodstops. Beveiliging, voor zover iemand daar eigenaar van was, was een IT-aangelegenheid die stopte bij de firewall van het kantoor. De **EU-Machineverordening** maakt een einde aan die scheiding. Zij herbouwt het Europese machineveiligheidsregime voor een tijdperk waarin machines genetwerkt, softwaregedreven en in toenemende mate door AI aangestuurd zijn — en doet iets wat de oude wet nooit deed: zij maakt **bescherming tegen corruptie een voorwaarde voor de veiligheid van een machine**.

Die ene ingreep herschrijft de compliance-vraag voor iedereen die machines bouwt, integreert, importeert of aanpast voor de Europese markt. De CE-markering die verklaart dat een machine veilig is, hangt nu mede af van een correcte invulling van cyberbeveiliging. Wie dat mist, heeft niet alleen een onveilige machine — onder de Verordening is die machine niet-conform.

> [!IMPORTANT]
> Verordening (EU) 2023/1230 is op 19 juli 2023 in werking getreden en **is van toepassing vanaf 20 januari 2027**, waarbij Machinerichtlijn 2006/42/EG wordt ingetrokken. Vanaf die datum moeten machines die op de EU-markt worden gebracht voldoen aan de nieuwe essentiële gezondheids- en veiligheidseisen — inclusief de eisen met betrekking tot cyberbeveiliging. ([EUR-Lex](https://eur-lex.europa.eu/eli/reg/2023/1230/oj/eng))

```keyfacts
Instrument :: Verordening (EU) 2023/1230 — rechtstreeks toepasselijk, geen omzetting
Vervangt :: Machinerichtlijn 2006/42/EG
In werking sinds :: 19 juli 2023
Van toepassing vanaf :: 20 januari 2027 (harde deadline)
Cyberclausules :: Bijlage III §1.1.9 (bescherming tegen corruptie) + §1.2.1 (betrouwbaarheid besturing)
Nieuwe hoogrisicocategorie :: op ML gebaseerde zelflerende veiligheidscomponenten (Bijlage I deel A)
Ingrijpende wijziging :: wettelijk gedefinieerd — artikel 3, lid 16
Koppeling AI-verordening :: AI-veiligheidscomponent in machine → automatisch hoogrisico
Belangrijke opkomende norm :: prEN 50742 — bescherming tegen corruptie
```

## De korte versie

- De **Machineverordening (EU) 2023/1230** vervangt de langlopende **Machinerichtlijn 2006/42/EG**. ([EUR-Lex](https://eur-lex.europa.eu/eli/reg/2023/1230/oj/eng))
- Zij is van toepassing vanaf **20 januari 2027** — een harde deadline, geen zachte doelstelling. ([EU-OSHA](https://osha.europa.eu/en/legislation/directive/regulation-20231230eu-machinery))
- Als **verordening** in plaats van een richtlijn is zij **rechtstreeks en identiek** van toepassing in alle 27 lidstaten, wat een einde maakt aan de nationale verschillen die omzetting van een richtlijn toeliet.
- Zij introduceert **essentiële gezondheids- en veiligheidseisen met betrekking tot cyberbeveiliging** in **bijlage III** — machines moeten bestand zijn tegen **toevallige of opzettelijke corruptie** die een gevaar kan opleveren, en moeten **bewijs van manipulatie** bewaren. ([Nemko](https://www.nemko.com/blog/eu-machinery-regulation-2023/1230))
- Zij behandelt **software, connectiviteit en AI**, met inbegrip van machines met **zelflerend gedrag** en **op AI gebaseerde veiligheidscomponenten**.
- Zij koppelt aan de **[AI-verordening](/nl/ai-act)**: een AI-systeem dat als veiligheidscomponent van een machine wordt gebruikt en dat zelf een conformiteitsbeoordeling door een derde partij nodig heeft, is **automatisch hoogrisico**. ([Bijlage I EU AI-verordening](https://artificialintelligenceact.eu/annex/1/))

## Waarom de oude richtlijn tekortschoot in het connectiviteitstijdperk

De Machinerichtlijn is een product van 2006 — een wereld van vóór het industriële IoT gemeengoed werd, van vóór een pers of palletiseerder routinematig met een netwerk communiceerde, van vóór machine-learningmodellen in een veiligheidslus plaatsnamen. Op zichzelf was het een goede wet. Zij bracht orde in mechanische, elektrische, thermische en ergonomische gevaren, en gaf Europa twee decennia lang een gemeenschappelijke veiligheidsgrammatica.

Waar zij nooit in voorzag, is een machine die mechanisch foutloos is maar gevaarlijk wordt doordat iemand de besturingslogica corrumpeert. Een afscherming is waardeloos als een vervalst netwerkcommando haar intrekt. Een noodstopfunctie is waardeloos als de firmware ervan stilzwijgend kan worden overschreven. Een perfect gedimensioneerd veiligheidsrelais is waardeloos als de veiligheids-PLC die het aanstuurt ongeauthenticeerde instructies accepteert vanuit een portaal voor onderhoud op afstand. De Richtlijn had daar niets over te zeggen, omdat die aanvalsoppervlakken in 2006 nauwelijks bestonden op de fabrieksvloer.

De Verordening is de correctie. Zij behoudt de beproefde architectuur van de EU-productveiligheidswetgeving — essentiële gezondheids- en veiligheidseisen, risicobeoordeling, conformiteitsbeoordeling, CE-markering, een conformiteitsverklaring — en breidt die architectuur uit naar de **digitale** manieren waarop een moderne machine onveilig wordt. Twee structurele keuzes maken de intentie duidelijk.

**Het is een verordening, geen richtlijn.** Een richtlijn is een doel dat elke lidstaat omzet in nationale wetgeving, waardoor "de Machinerichtlijn" in feite 27 licht verschillende wetten betekende. Een verordening is de wet, in elk land, op dezelfde dag. Eén Europees regelboek, geen vertraging door omzetting, veel minder ruimte voor een machine die in de ene markt legaal is en in de andere niet.

**Zij plaatst beveiliging binnen het veiligheidsdossier, niet ernaast.** De Verordening creëert geen apart "cyberbijlage" die u er later bij kunt plakken. Zij weeft corruptiebestendigheid, veilige connectiviteit en bewijs van manipulatie door dezelfde essentiële eisen die gelden voor afscherming en betrouwbaarheid van de besturing. Beveiliging is nu iets waar uw veiligheidsingenieurs eigenaar van zijn, aangetoond in hetzelfde technisch dossier.

### Richtlijn 2006/42/EG versus Verordening (EU) 2023/1230

| Dimensie | Machine**richtlijn** 2006/42/EG | Machine**verordening** (EU) 2023/1230 |
|---|---|---|
| Rechtsinstrument | Richtlijn — omgezet in 27 nationale wetten | Verordening — rechtstreeks toepasselijk, uniform EU-breed |
| Van toepassing vanaf | 29 december 2009 | **20 januari 2027** ([EU-OSHA](https://osha.europa.eu/en/legislation/directive/regulation-20231230eu-machinery)) |
| Cyberbeveiliging | Feitelijk geen bepalingen | Expliciete essentiële eisen inzake **bescherming tegen corruptie** en veilige verbindingen (bijlage III) |
| Software & AI | Niet als zodanig behandeld | Softwareveiligheidscomponenten en **AI/zelflerend** gedrag binnen de reikwijdte |
| Hoogrisicolijst | Bijlage IV; zelfcertificering breed beschikbaar | **Bijlage I** (delen A/B); deel A maakt beoordeling door een **aangemelde instantie** verplicht |
| Instructies | Papieren handleiding doorgaans verplicht | **Digitale instructies** toegestaan (met uitzonderingen voor veiligheidsinformatie) |
| Ingrijpende wijziging | Behandeld via nationale praktijk/richtsnoeren | **Wettelijk gedefinieerd** (art. 3, lid 16); de wijzigende partij wordt de fabrikant |

## Wat de Verordening bestrijkt

De Verordening is van toepassing op **machines** en een familie van **gerelateerde producten**: veiligheidscomponenten, verwisselbare uitrustingsstukken, hijs- en hefgereedschappen, kettingen, kabels en banden, verwijderbare mechanische overbrengingssystemen, en **niet-voltooide machines** — een samenstel dat nog geen toepassing op zichzelf kan uitvoeren en bestemd is om in andere machines te worden ingebouwd. ([EU-OSHA](https://osha.europa.eu/en/legislation/directive/regulation-20231230eu-machinery))

Twee punten zijn het belangrijkst voor het digitale tijdperk:

**Veiligheidscomponenten zijn producten op zichzelf.** Een veiligheidscomponent is een onderdeel waarvan het falen mensen in gevaar brengt, en de Verordening is expliciet dat dit nu **software** omvat die een veiligheidsfunctie vervult, en, specifiek genoemd, **op AI gebaseerde** veiligheidscomponenten. Als het uw product de taak is om een machine veilig te houden, draagt het de eisen — of het nu een lichtscherm, een veiligheidsregelaar, of een getraind model is dat beslist wanneer een collaboratieve robot moet stoppen.

**Zelflerend gedrag wordt voorzien, niet genegeerd.** De Verordening houdt rekening met machines waarvan het gedrag zich kan aanpassen of leren nadat zij de fabriek hebben verlaten, en staat niet toe dat die ontwikkeling buiten de veilige gebruiksgrenzen treedt die bij de conformiteitsbeoordeling zijn gevalideerd. Leren is toegestaan; afdrijven naar een gevaarlijke toestand niet.

Naast de technologie moderniseert de Verordening ook de papierwinkel. Zij staat **digitale instructies en documentatie** toe in plaats van een verplichte gedrukte handleiding in elk geval (met verstandige uitzonderingen zodat essentiële veiligheidsinformatie toegankelijk blijft), en zij legt de regels over **ingrijpende wijziging** vast in de wet zelf — meer daarover hieronder.

## Cyberbeveiliging wordt onderdeel van het veiligheidsdossier

Hier zit de kern van de verandering voor iedereen in OT. De essentiële gezondheids- en veiligheidseisen van de Verordening, vastgelegd in **bijlage III**, bevatten nu clausules die relevant zijn voor cyberbeveiliging. De duidelijkste is **bijlage III, §1.1.9, "Bescherming tegen corruptie."** In gewone woorden: een machine moet zo zijn ontworpen dat de veiligheid ervan **niet in gevaar komt door corruptie — hetzij toevallig, hetzij opzettelijk** — van de hardware- en softwarecomponenten die de veiligheid beïnvloeden. ([Nemko](https://www.nemko.com/blog/eu-machinery-regulation-2023/1230))

Lees dat zorgvuldig, want de formulering is precies en die precisie is de kern van de zaak.

- De zorg betreft **veiligheid**, niet vertrouwelijkheid. De Verordening vraagt u niet om bedrijfsgeheimen te beschermen; zij vraagt u ervoor te zorgen dat corruptie de machine niet in een gevaar kan veranderen.
- Zij bestrijkt zowel **toevallige als opzettelijke** corruptie — een misvormde update, een verkeerd geflashte controller, een bitflip op een bus, en een doelbewuste aanvaller vallen allemaal binnen de reikwijdte.
- Zij richt zich op de componenten **die de veiligheid beïnvloeden**. De bedrijfslogica-HMI van een machine is niet het doelwit; de veiligheidsfunctie en de systemen die haar kunnen beïnvloeden, wel.

Uit die clausule, en de eisen inzake betrouwbaarheid van de besturing in **bijlage III, §1.2.1**, volgt een concrete reeks technische verwachtingen.

### De essentiële eisen met betrekking tot cyberbeveiliging, in technische termen

| Eis (zoals verwoord in bijlage III) | Wat het op de machine betekent |
|---|---|
| Veiligheid niet in gevaar door **toevallige of opzettelijke corruptie** van veiligheidsbeïnvloedende hardware/software (§1.1.9) | Veiligheidsgerelateerde besturingslogica en firmware moeten bestand zijn tegen manipulatie; corruptie ervan mag geen veiligheidsfunctie kunnen omzeilen |
| **Bewijs van interventie** in veiligheidssoftware | Het besturingssysteem moet legitieme en illegitieme interventies **loggen**, zodat manipulatie detecteerbaar en traceerbaar is — bewijs van manipulatie, bewaard gedurende de levensduur van de machine ([Nemko](https://www.nemko.com/blog/eu-machinery-regulation-2023/1230)) |
| Veilige **verbinding** met externe apparaten (§1.2.1) | Draadloze, genetwerkte en toegang-op-afstand-functies mogen geen gevaarlijke situatie creëren; een slechte of vijandige verbinding mag geen veiligheidsfunctie kunnen bereiken |
| **Robuuste veiligheidsfuncties** onder externe invloed | Veiligheidsfuncties moeten betrouwbaar blijven bij redelijkerwijs te voorziene externe invloed via verbindingen, niet alleen onder laboratoriumomstandigheden |
| **Levenscyclusonderhoud** van bescherming | Beschermende maatregelen, updates en patches moeten houdbaar zijn gedurende de operationele levensduur van de machine, niet bevroren op het moment van levering |

Dit is een echte herkadering, geen relabeling. Cyberbeveiliging voor machines is niet langer een parallel werkspoor dat naast veiligheid loopt en aan een andere manager rapporteert. Zij zit **binnen** het veiligheidsargument. Als een machine gevaarlijk kan worden gemaakt door corruptie van de software, dan is zij — in de logica van de Verordening — niet veilig, en voldoet zij niet. De beveiligingsfout en de veiligheidsfout zijn dezelfde fout.

### Wat "bescherming tegen corruptie" daadwerkelijk vereist

De Verordening formuleert de *uitkomst* — de veiligheid moet corruptie overleven — en laat het *hoe* over aan techniek en normen. In de praktijk convergeert het voldoen aan bijlage III §1.1.9 en §1.2.1 op een echte machine naar een herkenbare set maatregelen, dezelfde die een beveiligingsingenieur voor besturingssystemen zou kiezen:

- **Ken uw software.** Identificeer de veiligheidsbeïnvloedende software en data — steeds vaker vastgelegd als een **software bill of materials (SBOM)** — want u kunt geen componenten beschermen die u niet heeft opgesomd. Dit is ook de naadlijn met de [CRA](/nl/cra), die de SBOM tot een expliciete verplichting maakt.
- **Authenticeer wat draait.** **Ondertekende firmware** en een **secure/verified boot**-keten, zodat een gewijzigde veiligheidsimage wordt geweigerd in plaats van uitgevoerd. Het voorbeeld van de Verordening is bot: als iemand gewijzigde veiligheidsfirmware installeert, moet de machine dat kunnen detecteren.
- **Authenticeer wie verbindt.** Veiligheidsrelevante instructies mogen alleen komen van geauthenticeerde, geautoriseerde bronnen. Een ongeauthenticeerd commando vanuit een portaal voor onderhoud op afstand mag nooit een veiligheidsfunctie kunnen bereiken.
- **Beperk de verbinding.** Genetwerkte, draadloze en toegang-op-afstand-functies moeten zo zijn ontworpen dat een slechte of vijandige verbinding geen gevaarlijke situatie kan creëren — segmentatie, minimale rechten, en een veilige terugvalstand als de verbinding zich misdraagt.
- **Maak manipulatie zichtbaar.** Log zowel **legitieme als illegitieme** interventies in veiligheidssoftware, met bewaring gedurende de operationele levensduur van de machine, zodat corruptie achteraf detecteerbaar en traceerbaar is.
- **Houd bescherming in stand over de levenscyclus.** Updates en patches voor de veiligheidsbeïnvloedende software moeten leverbaar blijven zolang de machine in bedrijf is — bescherming bevroren op de leverdatum is geen bescherming.

```compare
Het veiligheidsdossier overleeft corruptie wanneer…
- Veiligheidsbeïnvloedende software is **geïnventariseerd** (SBOM) en de integriteit is verifieerbaar
- Firmware is **ondertekend** en boot is **geverifieerd** — gewijzigde images worden geweigerd
- Toegang op afstand en via netwerk is **geauthenticeerd, geautoriseerd en gesegmenteerd**
- Interventies worden **gelogd en bewaard** — manipulatie laat bewijs achter
- Patches en updates blijven **leverbaar gedurende de levensduur** van de machine
---
De machine is niet-conform wanneer…
- Een **vervalst netwerkcommando** een afscherming kan intrekken of een vergrendeling omzeilen
- Veiligheids**firmware stilzwijgend kan worden overschreven** en uitgevoerd
- Een **portaal voor onderhoud op afstand** een veiligheidsfunctie ongeauthenticeerd bereikt
- Manipulatie van veiligheidssoftware **geen spoor achterlaat**
- Beveiliging **niet kan worden onderhouden** nadat de machine is geleverd
```

Niets hiervan is nieuw voor een beveiligingsingenieur — en dat is precies het punt. De Verordening vindt geen nieuwe discipline uit; zij importeert een bestaande, [IEC 62443](/nl/iec-62443), in het machineveiligheidsdossier en maakt haar tot een voorwaarde voor de CE-markering.

```svg
<svg viewBox="0 0 700 340" xmlns="http://www.w3.org/2000/svg" font-family="system-ui,Segoe UI,Roboto,sans-serif">
  <rect x="0" y="0" width="700" height="340" fill="none"/>
  <text x="350" y="28" fill="#e5e7eb" font-size="17" font-weight="700" text-anchor="middle">Cyberbeveiliging als onderdeel van het machineveiligheidsdossier</text>

  <!-- Outer safety case boundary -->
  <rect x="30" y="50" width="640" height="260" rx="12" fill="none" stroke="#3b82f6" stroke-width="2"/>
  <text x="46" y="72" fill="#3b82f6" font-size="13" font-weight="700">Veiligheidsdossier machine → CE-markering &amp; conformiteitsverklaring</text>

  <!-- Traditional safety block -->
  <rect x="55" y="92" width="285" height="88" rx="8" fill="none" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="197" y="114" fill="#e5e7eb" font-size="13" font-weight="700" text-anchor="middle">Functionele / mechanische veiligheid</text>
  <text x="197" y="136" fill="#94a3b8" font-size="11.5" text-anchor="middle">Afschermingen · vergrendelingen · noodstop</text>
  <text x="197" y="153" fill="#94a3b8" font-size="11.5" text-anchor="middle">Betrouwbaarheid besturing · risicobeoordeling</text>
  <text x="197" y="170" fill="#94a3b8" font-size="11.5" text-anchor="middle">EN ISO 12100 / 13849</text>

  <!-- Cyber block -->
  <rect x="360" y="92" width="285" height="88" rx="8" fill="none" stroke="#f97316" stroke-width="1.5"/>
  <text x="502" y="114" fill="#f97316" font-size="13" font-weight="700" text-anchor="middle">Bescherming tegen corruptie</text>
  <text x="502" y="136" fill="#94a3b8" font-size="11.5" text-anchor="middle">Antimanipulatie · veilige verbindingen</text>
  <text x="502" y="153" fill="#94a3b8" font-size="11.5" text-anchor="middle">Logging van manipulatiebewijs</text>
  <text x="502" y="170" fill="#94a3b8" font-size="11.5" text-anchor="middle">Bijlage III §1.1.9 / §1.2.1</text>

  <!-- Merge arrow -->
  <line x1="197" y1="180" x2="197" y2="210" stroke="#94a3b8" stroke-width="1.5"/>
  <line x1="502" y1="180" x2="502" y2="210" stroke="#94a3b8" stroke-width="1.5"/>
  <line x1="197" y1="210" x2="502" y2="210" stroke="#94a3b8" stroke-width="1.5"/>
  <line x1="350" y1="210" x2="350" y2="238" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#a)"/>
  <defs>
    <marker id="a" markerWidth="9" markerHeight="9" refX="5" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="#94a3b8"/>
    </marker>
  </defs>

  <rect x="205" y="240" width="290" height="52" rx="8" fill="none" stroke="#3b82f6" stroke-width="2"/>
  <text x="350" y="262" fill="#e5e7eb" font-size="13" font-weight="700" text-anchor="middle">Eén geïntegreerd veiligheidsargument</text>
  <text x="350" y="281" fill="#94a3b8" font-size="11.5" text-anchor="middle">Corrumpeerbare veiligheid = onveilig = niet-conform</text>
</svg>
```

> [!NOTE]
> Nieuwe normen sluiten aan bij de clausules. **EN 50742** (in ontwikkeling) behandelt bescherming tegen corruptie in machines en veiligheidscomponenten; **IEC 62443** levert de erkende technische methode voor de besturingssystemen binnen een machine; **ISO/CD 24882** richt zich op cyberbeveiliging voor landbouwmachines. Verwacht dat geharmoniseerde normen de praktische route worden om conformiteit te vermoeden. ([Nemko](https://www.nemko.com/blog/eu-machinery-regulation-2023/1230))

## Software, connectiviteit en AI — en de koppeling met de AI-verordening

De Verordening is doelbewust vooruitstrevend op het gebied van software en AI. Zij erkent machines waarvan het gedrag kan **evolueren** — systemen die zich aanpassen of leren tijdens gebruik — en eist dat die ontwikkeling de machine niet buiten de veilige gebruiksgrenzen kan brengen die bij de beoordeling zijn bewezen. Waar AI een veiligheidsfunctie vervult, moet de machine rekening houden met wat AI daadwerkelijk met zich meebrengt: gedrag dat lastig uitputtend te testen is, beslissingen die lastig te verklaren zijn, en een blijvende behoefte aan zinvol menselijk toezicht op geautomatiseerde actie.

Dit is precies waar de Machineverordening en de **[AI-verordening](/nl/ai-act)** op elkaar zijn afgestemd. De Machineverordening staat vermeld in **bijlage I van de AI-verordening** als harmonisatiewetgeving van de Unie. Op grond van **artikel 6, lid 1, van de AI-verordening** wordt een AI-systeem dat een **veiligheidscomponent** is van een product dat onder die bijlage I-wetgeving valt — en waarbij het product een conformiteitsbeoordeling door een derde partij moet ondergaan — **automatisch als hoogrisico geclassificeerd**. ([Bijlage I EU AI-verordening](https://artificialintelligenceact.eu/annex/1/))

Het gevolg is concreet. Zet u een AI-model in als veiligheidscomponent in machines die onder de route van de aangemelde instantie vallen, dan bent u tegelijkertijd de fabrikant van een hoogrisico-AI-systeem. Twee regimes, één product, tegelijkertijd:

- De **Machineverordening** regelt de veiligheid-en-beveiliging van de machine (risicobeoordeling, essentiële eisen van bijlage III, conformiteitsbeoordeling, technisch dossier, CE-markering).
- De **AI-verordening** voegt daar de hoogrisicoverplichtingen voor het model zelf aan toe: risicobeheer, datagovernance, logging, transparantie, menselijk toezicht, nauwkeurigheid en robuustheid, en een kwaliteitsmanagementsysteem.

> [!WARNING]
> Een AI-veiligheidscomponent is niet "een beetje extra papierwerk." Op grond van artikel 6, lid 1, kan zij uw product verplaatsen van een zelfverklaringsroute naar **conformiteitsbeoordeling door een derde partij bij een aangemelde instantie**, en zij activeert tegelijkertijd de hoogrisicolevenscyclus van de AI-verordening. Die overlap ontdekken tijdens de beoordeling, enkele maanden voor een lancering, is een van de duurste manieren om dit te leren. Breng het in kaart tijdens het ontwerp. Zie [AI-verordening](/nl/ai-act).

## Conformiteitsbeoordeling en hoogrisicomachines

Net als de Richtlijn vóór haar classificeert de Verordening machines naar risico en biedt zij evenredige routes naar CE-markering. De meeste machines kunnen nog steeds via **zelfbeoordeling** door de fabrikant (interne productiecontrole) op de markt komen. De hogerisicocategorieën staan vermeld in **bijlage I**, opgesplitst in twee delen, en hier komt de aangemelde instantie in beeld.

- **Bijlage I, deel A** — de categorieën die de Verordening als het hoogste risico behandelt. Voor deze categorieën is **conformiteitsbeoordeling door een aangemelde instantie verplicht**; de fabrikant kan niet zelf verklaren. Deel A omvat nu **veiligheidscomponenten met volledig of gedeeltelijk zelflerend gedrag met gebruik van machine-learningbenaderingen die veiligheidsfuncties waarborgen** — een categorie die onder de Richtlijn van 2006 niet bestond en niet kon bestaan. ([Baker McKenzie](https://www.bakermckenzie.com/en/insight/publications/resources/product-risk-radar-articles/machinery-regulation))
- **Bijlage I, deel B** — hoogrisicocategorieën die grotendeels vergelijkbaar zijn met de oude bijlage IV, waarbij een fabrikant alleen een zelfbeoordelingsroute mag gebruiken **indien** de relevante geharmoniseerde normen volledig zijn toegepast; anders is een aangemelde instantie vereist.

### Risicocategorie → conformiteitsroute

| Machinecategorie | Risiconiveau | Conformiteitsroute |
|---|---|---|
| Gewone machines (niet in bijlage I) | Standaard | **Zelfbeoordeling** door de fabrikant (interne productiecontrole) |
| Hoogrisico **bijlage I, deel B** | Hoog | Zelfbeoordeling **alleen indien** geharmoniseerde normen volledig zijn toegepast; anders **aangemelde instantie** |
| **Bijlage I, deel A** (incl. **op ML gebaseerde zelflerende veiligheidscomponenten**) | Hoogst | **Aangemelde instantie verplicht** — geen zelfverklaring ([Baker McKenzie](https://www.bakermckenzie.com/en/insight/publications/resources/product-risk-radar-articles/machinery-regulation)) |

De praktische conclusie: het toevoegen van connectiviteit of AI aan een machine is geen neutrale productkeuze. Het kan de risicoclassificatie van de machine veranderen, de conformiteitsroute, of een aangemelde instantie betrokken is, en daarmee de kosten en doorlooptijd naar de markt. Die beslissing hoort aan het begin van een project thuis, met uw veiligheids- en beveiligingsingenieurs samen aan tafel.

## Ingrijpende wijziging: wanneer de fabrieksvloer de fabrikant wordt

Eén bepaling verdient een eigen podium, omdat zij integrators en exploitanten raakt die denken dat de Verordening alleen een probleem van de bouwer is. De Verordening **definieert ingrijpende wijziging in de wet**, in **artikel 3, lid 16**: een wijziging van een machine, met fysieke of digitale middelen, aangebracht nadat zij op de markt is gebracht of in bedrijf is gesteld, die de oorspronkelijke fabrikant niet heeft voorzien of gepland, en die de veiligheid beïnvloedt door een nieuw gevaar te creëren of een bestaand risico zodanig te verhogen dat nieuwe beschermende maatregelen nodig zijn. ([EU-OSHA](https://osha.europa.eu/en/legislation/directive/regulation-20231230eu-machinery))

De angel zit in het gevolg. Wie een ingrijpende wijziging uitvoert, wordt **beschouwd als de fabrikant** van de gewijzigde machine en neemt de verplichtingen van de fabrikant op grond van artikel 10 over — een nieuwe risicobeoordeling, conformiteitsbeoordeling, technisch dossier, conformiteitsverklaring en CE-markering voor de gewijzigde machine. En omdat de definitie expliciet **digitale** middelen noemt, kan een wijziging van besturingssoftware, een nieuwe netwerkverbinding, of een achteraf toegevoegde AI-functie de ingrijpende wijziging zijn die de aansprakelijkheid van de fabrikant op u overdraagt.

> [!TIP]
> Voordat u een veiligheidsgerelateerd besturingssysteem aanpast — een veiligheids-PLC opnieuw flasht, toegang op afstand toevoegt, een lerend model inbouwt — beoordeel of de wijziging een ingrijpende wijziging is onder artikel 3, lid 16. Zo ja, dan heeft u zojuist de verplichtingen van een fabrikant geërfd. Die grens kennen **voordat** u de machine aanraakt, is veel goedkoper dan haar ontdekken na een incident. Een [Cyber Digital Twin](/nl/cyber-digital-twin) maakt die wijzigingsgrenzen zichtbaar.

## De stapel van meerdere kaders rond een slimme machine

De Machineverordening opereert niet alleen. Eén enkele connected, AI-ondersteunde productielijn kan vijf Europese regimes tegelijk binnen de reikwijdte trekken, elk gericht op een ander facet van hetzelfde asset. Ze behandelen als vijf losstaande audits is de manier waarop programma's uit de hand lopen qua budget; ze behandelen als één technisch probleem is de manier waarop ze in één keer worden gebouwd.

```svg
<svg viewBox="0 0 700 400" xmlns="http://www.w3.org/2000/svg" font-family="system-ui,Segoe UI,Roboto,sans-serif">
  <rect x="0" y="0" width="700" height="400" fill="none"/>
  <text x="350" y="28" fill="#e5e7eb" font-size="17" font-weight="700" text-anchor="middle">Eén connected/AI-machine → vijf regimes tegelijk</text>

  <!-- Center node -->
  <rect x="270" y="170" width="160" height="60" rx="10" fill="none" stroke="#f97316" stroke-width="2.5"/>
  <text x="350" y="196" fill="#e5e7eb" font-size="13.5" font-weight="700" text-anchor="middle">Connected / AI-</text>
  <text x="350" y="214" fill="#e5e7eb" font-size="13.5" font-weight="700" text-anchor="middle">machine</text>

  <!-- Spokes -->
  <!-- Machinery Reg (top) -->
  <line x1="350" y1="170" x2="350" y2="118" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#b)"/>
  <rect x="245" y="66" width="210" height="52" rx="8" fill="none" stroke="#3b82f6" stroke-width="1.8"/>
  <text x="350" y="88" fill="#3b82f6" font-size="12.5" font-weight="700" text-anchor="middle">Machineverordening 2023/1230</text>
  <text x="350" y="106" fill="#94a3b8" font-size="11" text-anchor="middle">veiligheid incl. bescherming tegen corruptie</text>

  <!-- AI Act (top-left) -->
  <line x1="290" y1="180" x2="150" y2="120" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#b)"/>
  <rect x="30" y="86" width="180" height="52" rx="8" fill="none" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="120" y="108" fill="#e5e7eb" font-size="12.5" font-weight="700" text-anchor="middle">AI-verordening</text>
  <text x="120" y="126" fill="#94a3b8" font-size="11" text-anchor="middle">AI-veiligheidscomponent → hoogrisico</text>

  <!-- CRA (top-right) -->
  <line x1="410" y1="180" x2="550" y2="120" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#b)"/>
  <rect x="490" y="86" width="180" height="52" rx="8" fill="none" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="580" y="108" fill="#e5e7eb" font-size="12.5" font-weight="700" text-anchor="middle">CRA</text>
  <text x="580" y="126" fill="#94a3b8" font-size="11" text-anchor="middle">product met digitale elementen</text>

  <!-- IEC 62443 (bottom-left) -->
  <line x1="290" y1="220" x2="150" y2="290" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#b)"/>
  <rect x="30" y="292" width="180" height="52" rx="8" fill="none" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="120" y="314" fill="#e5e7eb" font-size="12.5" font-weight="700" text-anchor="middle">IEC 62443 (4-1 / 4-2)</text>
  <text x="120" y="332" fill="#94a3b8" font-size="11" text-anchor="middle">de technische methode</text>

  <!-- NIS2 (bottom-right) -->
  <line x1="410" y1="220" x2="550" y2="290" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#b)"/>
  <rect x="490" y="292" width="180" height="52" rx="8" fill="none" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="580" y="314" fill="#e5e7eb" font-size="12.5" font-weight="700" text-anchor="middle">NIS2</text>
  <text x="580" y="332" fill="#94a3b8" font-size="11" text-anchor="middle">exploitant van de draaiende lijn</text>

  <text x="350" y="376" fill="#94a3b8" font-size="11.5" text-anchor="middle">Bouw het één keer als één technisch probleem — niet als vijf audits</text>

  <defs>
    <marker id="b" markerWidth="9" markerHeight="9" refX="5" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="#94a3b8"/>
    </marker>
  </defs>
</svg>
```

### Hoe de kaders hetzelfde asset verdelen

| Regime | Wat het op de machine regelt | Op wie het neerkomt |
|---|---|---|
| **[Machineverordening](#)** 2023/1230 | Machineveiligheid, incl. bescherming tegen corruptie (bijlage III) | Fabrikant / wijzigende partij bij ingrijpende wijziging |
| **[AI-verordening](/nl/ai-act)** | AI-veiligheidscomponent → hoogrisicolevenscyclusverplichtingen | Aanbieder van het AI-systeem |
| **[CRA](/nl/cra)** | De digitale componenten als producten met digitale elementen — security-by-design, omgang met kwetsbaarheden | Fabrikant van het digitale product |
| **[IEC 62443](/nl/iec-62443)** | De technische methode: veilige ontwikkeling (4-1), componentbeveiliging (4-2) | Bouwer / integrator van het besturingssysteem |
| **[NIS2](/nl/nis2)** | Het exploiteren van de machine als onderdeel van een essentiële/belangrijke dienst | De exploitant |

Een bouwer die dit behandelt als één samenhangend technisch probleem — één veilige ontwikkelingslevenscyclus, één risicomodel, één technisch dossier dat aan meerdere regimes voldoet — besteedt veel minder dan wie vier parallelle compliance-projecten uitvoert, en eindigt met een beter verdedigbaar product. Ons overzicht [Kaders](/nl/frameworks) brengt in kaart waar elke verplichting past.

### De CRA en de Machineverordening — één machine, twee mandaten

Het koppel dat bouwers het vaakst verwart is de [Cyber Resilience Act](/nl/cra) en de Machineverordening, omdat beide over cyberbeveiliging op dezelfde kast spreken — maar ze stellen verschillende vragen. De Machineverordening vraagt *"kan corruptie deze machine onveilig maken?"* — een **veiligheids**vraag, beantwoord in het veiligheidsdossier van de machine. De CRA vraagt *"is dit product met digitale elementen secure-by-design, en worden kwetsbaarheden over de levensduur beheerd?"* — een **productbeveiligings**vraag, beantwoord via de eigen essentiële eisen, SBOM- en kwetsbaarheidsmeldplichten van de CRA.

Het goede nieuws is dat ze zijn ontworpen om elkaar te versterken, niet te botsen. EU-richtsnoeren zijn expliciet dat **naleving van de cyberbeveiligingseisen van de CRA de naleving kan vergemakkelijken** van de corruptiebeschermingsclausules van de Machineverordening — dezelfde bewijzen van veilige ontwikkeling, SBOM en updatemechanisme voeden beide dossiers. ([ORC WG CRA-FAQ](https://cra.orcwg.org/faq/official/faq_2-4-1/)) Een bouwer die één veilige ontwikkelingslevenscyclus draait, produceert de artefacten die beide regimes willen; wie ze als twee projecten behandelt, betaalt twee keer voor hetzelfde bewijs.

### Geharmoniseerde normen en het vermoeden van conformiteit

Zoals bij elke wet binnen het Nieuwe Wetgevingskader is de praktische route om conformiteit aan te tonen een **geharmoniseerde norm**: pas er een toe waarvan de referentie in het Publicatieblad is gepubliceerd en u verkrijgt een **vermoeden van conformiteit** met de eis die zij dekt. Voor de nieuwe cyberbeveiligingsclausules is het belangrijkste instrument **prEN 50742**, in ontwikkeling om specifiek *bescherming tegen corruptie* in machines en veiligheidscomponenten te behandelen — de norm geschreven om bijlage III §1.1.9 te operationaliseren. ([IBF, prEN 50742](https://www.ibf-solutions.com/en/seminars-and-news/news/new-standard-pren-50742-protection-against-corruption)) Daarnaast blijven de gevestigde veiligheidsnormen (**EN ISO 12100** voor risicobeoordeling, **EN ISO 13849** voor veiligheidsgerelateerde besturingssystemen) de mechanische en functionele-veiligheidseisen dragen, en levert **[IEC 62443](/nl/iec-62443)** de erkende technische methode voor de besturingssystemen binnen de machine. Uw bewijs één keer opbouwen tegen deze stapel is wat een muur van juridische clausules verandert in een controleerbaar ontwerp.

```cta
Eén connected machine, vijf regimes — en u bent mogelijk al de fabrikant.
Machineverordening, AI-verordening, CRA, IEC 62443 en NIS2 kunnen allemaal op dezelfde lijn neerkomen. Wij bouwen het één keer, als één technisch probleem, niet vijf parallelle audits.
Breng de verplichtingen van mijn machine in kaart :: /nl/contact
```

## Een uitgewerkt voorbeeld: een genetwerkte robotlascel

Een bouwer levert een **robotlascel**: een zesassige robot, een veiligheids-PLC, een lichtscherm en vergrendelde deuren, een HMI, en een **VPN voor ondersteuning op afstand** die de bouwer gebruikt voor diagnostiek en programma-updates. Onder de Richtlijn van 2006 was dit een goed begrepen veiligheidsproduct. Onder de Verordening stelt dezelfde cel nieuwe vragen.

- **Waar zit het corruptierisico?** De logica van de veiligheids-PLC, de veiligheidsconfiguratie van de robot, en het pad voor ondersteuning op afstand. Als een vervalst commando via de VPN een snelheids-en-scheidingslimiet kan versoepelen, of als de veiligheids-PLC een ongetekende logica-download accepteert, kan de cel onveilig worden gemaakt door corruptie — recht binnen bijlage III §1.1.9.
- **Wat vereist conformiteit nu?** De risicobeoordeling moet corruptie als een gevaar behandelen; het pad op afstand moet geauthenticeerd, geautoriseerd en gesegmenteerd zijn; veiligheidsfirmware moet ondertekend en de integriteit verifieerbaar zijn; en interventies moeten worden gelogd met levenslange bewaring. Het technisch dossier moet dit alles *aantonen*, niet slechts beweren.
- **Komt er een aangemelde instantie bij?** Als de categorie van de cel, of een toegevoegde op ML gebaseerde zelflerende veiligheidscomponent, haar in **bijlage I deel A** plaatst, is zelfverklaring van tafel en is een aangemelde instantie verplicht — een doorlooptijdbeslissing die bij het ontwerp thuishoort, niet bij de lancering.
- **Wie is er eigenaar na inbedrijfstelling?** Als de exploitant later een nieuwe netwerkverbinding toevoegt of de veiligheids-PLC opnieuw flasht op een manier die de bouwer nooit voorzag, kan dat een **ingrijpende wijziging** zijn onder artikel 3, lid 16 — en wordt de exploitant de fabrikant van de gewijzigde cel.

Eén cel, en de veiligheidsingenieur, de beveiligingsingenieur en de inkoopverantwoordelijke werken opeens aan hetzelfde dossier. Die convergentie is de hele bedoeling van de Verordening — en de reden waarom één gedeeld model van de machine vier losstaande beoordelingen verslaat.

## Wat het betekent voor uw rol

**Als u machines bouwt of integreert**, is dit een directe verplichting met een muur op januari 2027. Uw veiligheidsengineering moet nu cyberbeveiliging omvatten, en uw technisch dossier moet dit aantonen. Waar connectiviteit of een AI-veiligheidscomponent het risiconiveau verandert, kan een aangemelde instantie in beeld komen — en de AI-verordening kan daar bovenop van toepassing zijn. De goedkope versie van dit project begint nu; de dure versie begint eind 2026.

**Als u machines ingrijpend wijzigt** — de dagelijkse realiteit van de fabrieksvloer — kan artikel 3, lid 16, u de fabrikant maken van de gewijzigde machine, digitale wijzigingen inbegrepen. Bepaal die grens voordat u een veiligheidsregelaar opnieuw flasht of toegang op afstand toevoegt.

**Als u machines exploiteert**, verhoogt de Verordening de beveiligingsondergrens van de apparatuur die u in de loop van de tijd koopt — maar alleen als uw inkoop daarom vraagt. Begin met het specificeren van machines die ontworpen zijn om corruptie te weerstaan, met bewijs van manipulatie en een toezegging tot patches gedurende de levenscyclus, in uw volgende aanbesteding in plaats van uw volgende verordening.

**Als u in de raad van bestuur zit**, is de blootstelling CE-markerings- en productaansprakelijkheidsrisico dat nu een cyberbeveiligingsgezicht draagt. Een machine die gevaarlijk is gemaakt door een softwarefout is een niet-conform product, met de gevolgen voor markttoegang en aansprakelijkheid die daaruit voortvloeien. Dit hoort op het risicoregister naast [NIS2](/nl/nis2), niet in een aparte kolom "IT".

## De weg naar 20 januari 2027

De data zijn eenvoudig; de verleiding om het gat als stilzittijd te behandelen is de valkuil.

```timeline
19 juli 2023 :: **Verordening treedt in werking.** De tekst ligt vast; het overgangsvenster opent. Er is nog niets vereist, maar de klok loopt.
2023–2026 :: **Overgang en voorbereiding.** Machines mogen nog op de markt worden gebracht onder Richtlijn 2006/42/EG; bouwers passen ontwerpen, dossiers en processen aan. Geharmoniseerde normen (incl. prEN 50742) rijpen.
20 januari 2027 :: **De Verordening is van toepassing.** Machines die op de EU-markt worden gebracht moeten voldoen aan de nieuwe essentiële eisen — inclusief die inzake cyberbeveiliging. De Richtlijn wordt ingetrokken.
Na 20 jan 2027 :: **Levenscyclusverplichtingen lopen.** Bescherming tegen corruptie, bewijs van manipulatie en updatelevering moeten in stand blijven gedurende de operationele levensduur van elke machine.
```

> [!WARNING]
> De periode tot 2027 is *overgangstijd, geen stilzittijd.* Cyberbeveiliging in het veiligheidsdossier vouwen, conformiteitsroutes opnieuw controleren, een aangemelde instantie inschakelen waar connectiviteit of AI het risiconiveau verandert, en manipulatiebestendige logging vanaf het begin ontwerpen zijn allemaal taken met een lange doorlooptijd. Een bouwer die eind 2026 begint, doet de dure versie van dit project.

## Een gereedheidsroutekaart voor bouwers richting januari 2027

1. **Inventariseer uw veiligheidsbeïnvloedende software en connectiviteit.** Maak voor elke productlijn een lijst van de componenten die de veiligheid beïnvloeden, elke externe verbinding, en alle AI in een veiligheidsfunctie. U kunt niet beveiligen wat u niet in kaart heeft gebracht. Een [Cyber Digital Twin](/nl/cyber-digital-twin) is een snelle manier om die kaart te bouwen.
2. **Integreer cyberbeveiliging in de risicobeoordeling.** Corruptie van veiligheidsbeïnvloedende software is nu een te beoordelen gevaar onder bijlage III, in hetzelfde document als mechanische gevaren — geen apart rapport.
3. **Controleer opnieuw uw conformiteitsroute.** Duwt connectiviteit of een AI-veiligheidscomponent een product naar bijlage I, deel A of deel B? Zo ja, betrek dan tijdig de doorlooptijd van een aangemelde instantie.
4. **Neem de technische methode over.** Stem het werk aan het besturingssysteem af op **[IEC 62443](/nl/iec-62443)** — 4-1 voor veilige ontwikkeling, 4-2 voor componentbeveiliging — zodat de clausules van bijlage III een concrete, controleerbare uitvoering krijgen.
5. **Bouw bewijs van manipulatie in.** Ontwerp de logging van legitieme en illegitieme interventies in het besturingssysteem, met bewaring gedurende de levensduur van de machine. Dit achteraf toevoegen is pijnlijk.
6. **Test de koppeling met de AI-verordening.** Voer voor elke AI-veiligheidscomponent de classificatie van artikel 6, lid 1, uit en zet de hoogrisicoverplichtingen parallel aan de beoordeling van de machine op.
7. **Werk het technisch dossier en de instructies bij.** Toon de cyberbeveiligingsmaatregelen aan in het dossier; gebruik de nieuwe toelating voor **digitale instructies** waar dat helpt, met behoud van toegankelijkheid van essentiële veiligheidsinformatie.
8. **Oefen ingrijpende wijziging.** Geef uw integratie- en serviceteams een duidelijke toets op grond van artikel 3, lid 16, zodat zij weten wanneer een wijziging hen tot fabrikant maakt.

## Veelgestelde vragen

**Vanaf wanneer is de Machineverordening van toepassing?**
Vanaf **20 januari 2027**, ter vervanging van Machinerichtlijn 2006/42/EG. Zij is in juli 2023 in werking getreden; de periode tot 2027 is overgangstijd om producten en processen aan te passen — geen stilzittijd, gezien de nieuwe cyberbeveiligings- en AI-dimensies. ([EU-OSHA](https://osha.europa.eu/en/legislation/directive/regulation-20231230eu-machinery))

**Is cyberbeveiliging nu echt onderdeel van machineveiligheid?**
Ja. Bijlage III, §1.1.9, vereist dat de veiligheid niet in gevaar komt door toevallige of opzettelijke corruptie van veiligheidsbeïnvloedende hardware en software, en dat interventie in veiligheidssoftware bewijs achterlaat. Een machine die gevaarlijk kan worden gemaakt door manipulatie van de software, voldoet niet aan de Verordening. ([Nemko](https://www.nemko.com/blog/eu-machinery-regulation-2023/1230))

**Wij voegen AI toe aan onze machines. Wat is er extra van toepassing?**
Als de AI een veiligheidscomponent is en de machine een conformiteitsbeoordeling door een derde partij nodig heeft, is zij **automatisch hoogrisico** onder de [AI-verordening](/nl/ai-act) (artikel 6, lid 1, via bijlage I). Beide regimes zijn dan van toepassing op hetzelfde product, dus plan ze samen. ([Bijlage I EU AI-verordening](https://artificialintelligenceact.eu/annex/1/))

**Leidt het wijzigen van een bestaande machine tot toepasselijkheid van de Verordening?**
Dat kan. Een **ingrijpende wijziging** onder artikel 3, lid 16 — fysiek of digitaal — maakt u de fabrikant van de gewijzigde machine, met de verplichtingen die daaruit voortvloeien. Beoordeel dit voordat u veiligheidsgerelateerde besturingssystemen aanpast. ([EU-OSHA](https://osha.europa.eu/en/legislation/directive/regulation-20231230eu-machinery))

**Wanneer is een aangemelde instantie verplicht?**
Voor categorieën van **bijlage I, deel A** — de hoogrisicomachines, nu met inbegrip van op machine-learning gebaseerde zelflerende veiligheidscomponenten — is een aangemelde instantie vereist en is zelfverklaring niet beschikbaar. Categorieën van deel B mogen alleen zelf beoordelen waar geharmoniseerde normen volledig zijn toegepast. ([Baker McKenzie](https://www.bakermckenzie.com/en/insight/publications/resources/product-risk-radar-articles/machinery-regulation))

**Hoe verschilt dit van de Cyber Resilience Act?**
Zij beantwoorden verschillende vragen over dezelfde machine. De Machineverordening vraagt of corruptie de machine *onveilig* kan maken (een veiligheidsvraag, in het veiligheidsdossier); de [CRA](/nl/cra) vraagt of het product met digitale elementen *secure-by-design* is met kwetsbaarheidsbeheer over de levensduur (een productbeveiligingsvraag). Ze zijn ontworpen om elkaar te versterken — CRA-naleving kan naleving van de Machineverordening vergemakkelijken — zodat één veilige ontwikkelingslevenscyclus beide dossiers voedt. ([ORC WG CRA-FAQ](https://cra.orcwg.org/faq/official/faq_2-4-1/))

**Welke norm dekt de nieuwe cyberbeveiligingsclausules?**
**prEN 50742** wordt specifiek ontwikkeld voor *bescherming tegen corruptie* in machines en veiligheidscomponenten, om bijlage III §1.1.9 te operationaliseren; het toepassen van een gepubliceerde geharmoniseerde norm geeft een vermoeden van conformiteit. EN ISO 12100 en EN ISO 13849 blijven de risicobeoordeling en de eisen aan veiligheidsgerelateerde besturingssystemen dragen, met IEC 62443 als de technische methode voor de besturingssystemen. ([IBF, prEN 50742](https://www.ibf-solutions.com/en/seminars-and-news/news/new-standard-pren-50742-protection-against-corruption))

**Hebben we een SBOM nodig voor onze machine?**
Het wordt snel de praktische basislijn. U moet de veiligheidsbeïnvloedende software identificeren en beschermen, en dat is precies wat een software bill of materials vastlegt — en de [CRA](/nl/cra) maakt de SBOM tot een expliciete verplichting voor producten met digitale elementen. Eén keer opbouwen bedient beide regimes.

## Hoe OXOT helpt

De cyberbeveiligingseisen van de Verordening zijn in de kern beveiligingseisen voor de besturingssystemen binnen een machine — het thuisterrein van OXOT. Wij helpen machinebouwers en integrators de essentiële eisen van bijlage III te vertalen naar een technisch programma dat is afgestemd op **[IEC 62443](/nl/iec-62443)**, zodat de clausules een controleerbaar ontwerp worden in plaats van een ambitie. Wij helpen exploitanten machinebeveiligingsverwachtingen te integreren in inkoop en in hun bredere OT-beveiligings- en **[NIS2](/nl/nis2)**-programma's. En waar AI-veiligheidscomponenten in het spel zijn, plaatst onze **[Cyber Digital Twin](/nl/cyber-digital-twin)** ze in uw risicobeeld, zodat de verplichtingen van de Machineverordening en de [AI-verordening](/nl/ai-act) — en de overlap met de [CRA](/nl/cra) — samen worden aangepakt, in één keer, in plaats van in vier afzonderlijke haastklussen. Bekijk hoe dit past in het bredere beeld van [Kaders](/nl/frameworks).

## Sources

- Regulation (EU) 2023/1230 (Machinery Regulation), official text — [EUR-Lex](https://eur-lex.europa.eu/eli/reg/2023/1230/oj/eng)
- Regulation 2023/1230/EU — machinery, legislation overview — [EU-OSHA](https://osha.europa.eu/en/legislation/directive/regulation-20231230eu-machinery)
- EU Machinery Regulation 2023/1230: cybersecurity obligations for manufacturers — [Nemko](https://www.nemko.com/blog/eu-machinery-regulation-2023/1230)
- Machinery Regulation — high-risk categories and conformity assessment analysis — [Baker McKenzie](https://www.bakermckenzie.com/en/insight/publications/resources/product-risk-radar-articles/machinery-regulation)
- AI Act Annex I — Union harmonisation legislation (incl. machinery) — [artificialintelligenceact.eu](https://artificialintelligenceact.eu/annex/1/)
- prEN 50742 — bescherming tegen corruptie in machines en veiligheidscomponenten — [IBF Solutions](https://www.ibf-solutions.com/en/seminars-and-news/news/new-standard-pren-50742-protection-against-corruption)
- Samenspel CRA ↔ Machineverordening — [ORC WG CRA-FAQ](https://cra.orcwg.org/faq/official/faq_2-4-1/)
- Machineverordening — naleving, AI & cyberbeveiliging (overzicht) — [Intertek](https://www.intertek.com/industrial-equipment/machinery-regulation/)

*Deze pagina bevat algemene informatie over EU-wetgeving en vormt geen juridisch advies. Bevestig hoe de Machineverordening van toepassing is op uw producten en rol aan de hand van de Verordening zelf en, waar nodig, gekwalificeerd juridisch advies.*
