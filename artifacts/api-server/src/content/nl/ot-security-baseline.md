---
title: OT-securitybaseline
meta_title: OT-securitybaseline | OXOT
meta_description: Een minimale set OT-beveiligingsmaatregelen die realistisch, herhaalbaar en afgestemd zijn op hoe uw installaties echt draaien — een verdedigbare ondergrens, gekoppeld aan IEC 62443-securityniveaus, NIS2-minimummaatregelen en de CRA.
excerpt: Definieer minimale beveiligingsmaatregelen die realistisch, herhaalbaar en afgestemd op operationele behoeften zijn — een consistente ondergrens die elke locatie kan halen, aantonen en onderhouden.
content_type: page
published: true
---

Een baseline is de ondergrens die iedereen moet halen voordat u over het geavanceerde werk begint. OXOT ontwerpt OT-securitybaselines die realistisch zijn voor hoe uw installaties werkelijk draaien, herhaalbaar over locaties en expliciet gekoppeld aan IEC 62443-securityniveaus — zodat "veilig genoeg" overal dezelfde betekenis heeft.

Het gaat om consistentie en bewijs: een baseline die u locatie voor locatie kunt uitrollen, kunt aantonen te hebben gehaald en zonder haastwerk aan een auditor kunt overhandigen.

```keyfacts
Doel :: een minimumstandaard die elke locatie echt kan halen
Basis :: IEC 62443-doelsecurityniveaus (SL-1 / SL-2 per zone)
Scope :: gedefinieerd per zone en assetklasse
Vorm :: een maatregelenchecklist met bewijseisen
Uitrol :: locatie voor locatie, met een gestructureerd uitzonderingsproces
Resultaat :: consistente, auditbare OT-security over het gehele estate
```

## Waarom de meeste OT-securitybaselines mislukken

Een baseline klinkt eenvoudig: definieer de minimale maatregelen, pas ze overal toe. In de praktijk domineren twee faalpatronen.

De eerste is het generieke sjabloon. Een organisatie neemt een IT-beveiligingschecklist of een annex van een norm letterlijk over, zonder aanpassing aan de operationele realiteit van elke zone. Het resultaat is een set maatregelen die niet kan worden gehaald — rotatiebeleid voor wachtwoorden dat verouderde PLC's breekt, patchcadansen die productie-downtime vereisen, MFA-vereisten die geen enkel OT-systeem ondersteunt. De "baseline" bestaat op papier en nergens anders.

Het tweede patroon is de niet-gehandhaafde baseline. Maatregelen worden gedefinieerd, maar er zijn geen bewijseisen, geen uitzonderingsproces en geen mechanisme om naleving per locatie te verifiëren. De baseline beschrijft een intentie in plaats van een toestand.

```compare
Een generieke of niet-gehandhaafde baseline
- Maatregelen gekopieerd uit IT of een normennbijlage zonder aanpassing
- Past overal dezelfde vereisten toe, ongeacht zone of assettype
- Geen bewijseisen — naleving wordt aangenomen, niet geverifieerd
- Geen uitzonderingsproces — locaties halen de baseline volledig of zijn "non-compliant"
- Een momentopname die veroudert zonder onderhoudsmechanisme
---
Een OXOT OT-securitybaseline
- Maatregelen afgeleid van uw werkelijke zones, assetklassen en risicobereidheid
- Toepasbaarheid per zone — safety-controllers, engineering-werkstations en historians hebben elk de juiste set
- Bewijssjablonen ingebouwd — eenvoudige, herhaalbare manieren om elke maatregel aan te tonen
- Een gestructureerd uitzonderingsproces met eigenaar, motivering en herzieningsdatum
- Een levend document onderhouden via de Cyber Digital Twin, bijgewerkt naarmate uw estate verandert
```

## Wat u krijgt

```cards
Maatwerk-maatregelenbaseline :: :: Een minimale set maatregelen geschreven voor uw omgeving en risicobereidheid — geen generiek sjabloon. Elke maatregel is haalbaar voor ten minste één assetklasse in ten minste één zone.
Toepasbaarheidskaart per zone :: :: Welke maatregelen waar gelden, gekoppeld aan zones en assetklassen gedefinieerd in uw architectuur. Safety-controllers, engineering-werkstations, historianservers en IT-gerichte gateways hebben elk de juiste set — geen one-size-lijst die niet te halen is.
Bewijssjablonen :: :: Eenvoudige, herhaalbare manieren om aan te tonen dat elke maatregel op orde is: waar te zoeken, wat een acceptabel antwoord is. Ontworpen zodat uw eigen engineers de checks kunnen uitvoeren zonder specialistische ondersteuning.
Uitrol- & uitzonderingsproces :: :: Een gestructureerd pad om de baseline locatie voor locatie toe te passen, en een gedisciplineerde manier om uitzonderingen te behandelen — met een eigenaar, motivering, compenserende maatregelen en een herzieningsdatum. Uitzonderingen zijn zichtbaar en tijdgebonden, geen openeindegebreken.
Gapanalyse :: :: Vóór de uitrol toont een gestructureerde gapanalyse exact waar elke locatie begint en wat nodig is om het gat te dichten — zodat inspanning wordt gericht waar die het meest nodig is.
Onderhoudsmodel :: :: Een cadans en mechanisme voor het actueel houden van de baseline: wie beoordeelt het, wanneer en wat triggert een update. Een baseline die niet kan worden onderhouden is een baseline die zal verouderen.
```

## Hoe we het uitvoeren

```timeline
1. Zone- & assetinventaris :: Vertrek vanuit het zone- en conduitmodel — ofwel uit een eerder assessment of opgebouwd tijdens dit traject. Elke maatregel in de baseline moet weten op welke zone en assetklasse hij van toepassing is. Dit is het fundament.
2. Risicobereidheid & securityniveaudoelen :: Stem de doelsecurityniveaus (SL-1 of SL-2) per zone af, geïnformeerd door de operationele gevolgen van een compromis in die zone. Safety-kritieke procesbesturingszones rechtvaardigen een hoger doel dan bedrijfsgerichte historianverbindingen.
3. Maatregelselectie :: Selecteer de maatregelen die het gat adresseren tussen uw huidige staat en uw doelsecurityniveaus. Elke maatregel wordt beoordeeld op operationele haalbaarheid — als hij niet kan worden gehaald in een draaiende installatie zonder een buitengewone onderhoudsgebeurtenis, gaat hij niet in de baseline.
4. Bewijsontwerp :: Definieer voor elke maatregel wat "gehaald" eruit ziet: de configuratiecheck, de logreview, de interviewvraag. Eenvoudig genoeg voor uw eigen team om uit te voeren. Gedocumenteerd in sjablonen die consistente, vergelijkbare resultaten over locaties produceren.
5. Uitzonderingsproces :: Definieer de uitzonderingswerkstroom: hoe een bekend gat te registreren, wie het goedkeurt, welke compenserende maatregelen gelden en wanneer het wordt herzien. Het uitzonderingsproces is wat de baseline eerlijk maakt — het documenteert de realiteit van waar u staat, in plaats van naleving te beweren die u niet heeft geverifieerd.
6. Piloten :: Pas de baseline toe op één locatie, voer de bewijsverzameling uit en identificeer waar maatregelen of bewijssjablonen bijstelling behoeven. Een baseline die nooit is toegepast is per definitie ongetest.
7. Uitrollen :: Breid uit naar overige locaties, gat voor gat, waarbij het uitzonderingsproces vastlegt wat niet onmiddellijk kan worden gedicht. Uitrol wordt ondersteund door OXOT; eigenaarschap wordt overgedragen aan uw team naarmate het proces volwassen wordt.
8. Borgen :: Stel na de initiële uitrol de doorlopende borgingscadans in — periodieke bewijsverversing, uitzonderingsbeoordeling en baseline-update wanneer het estate of het dreigingslandschap verandert.
```

## Aansluiting op regelgeving

| Kader | Wat deze baseline adresseert |
|---|---|
| **IEC 62443-3-3** | Systeembeveiligingsvereisten en securityniveaus — de baselinemaatregelenset is de praktische uitdrukking van de SR's die van toepassing zijn op het doelsecurityniveau van elke zone |
| **IEC 62443-2-1** | Vereisten voor het beveiligingsbeheersysteem — de baseline, het uitzonderingsproces en de borgingscadans vormen samen het operationele CSMS dat uw locaties onderhouden |
| **NIS2 Art. 21(1)** | De eis van "passende en evenredige technische en organisatorische maatregelen" — de baseline maakt "evenredig" concreet en verdedigbaar per zone |
| **NIS2 Art. 21(2)(a)** | Beleid inzake risicoanalyse en informatiesysteembeveiliging — de baseline is de beleidsuitdrukking en de bewijssjablonen zijn het verificatiemechanisme |
| **NIS2 Art. 21(2)(f)** | Beleid en procedures voor het beoordelen van effectiviteit — de bewijsvereisten en borgingscadans van de baseline zijn het directe operationele antwoord |
| **Cyber Resilience Act** | Voor fabrikanten levert de baseline de minimale beveiligingseigenschappen die OT-producten in scope moeten voldoen — en geeft productteams een concreet, in de praktijk getest referentiepunt om tegen te ontwerpen |

## Hoe het aansluit

Een baseline is de ondergrens die elke locatie in een **[securityprogramma](/ot-security-programmes)** moet bereiken. Het programma levert de governance en de golfstructuur; de baseline definieert wat "klaar" betekent voor het remediatiewerk van elke golf. Zonder een baseline is "klaar" subjectief en niet-verifieerbaar.

De baseline is afgeleid van het zone-model dat **[Architectuur & segmentatie](/architecture-segmentation)** produceert: zodra zones zijn gedefinieerd, kunnen de maatregelen die in elke zone gelden worden gespecificeerd — wat een baseline realistisch maakt in plaats van generiek. Als zones nog niet zijn gedefinieerd, kan het baselinewerk beginnen door ze vast te stellen.

De **[Cyber Digital Twin](/cyber-digital-twin)** onderhoudt de baselinestatus: welke locaties welke maatregelen hebben gehaald, waar uitzonderingen open staan en welke wijzigingen in het estate welke basilinevereisten beïnvloeden. Zonder een levend model veroudert de baseline en wordt het een historisch document in plaats van een operationeel hulpmiddel.

**[OT-securityassessments](/ot-security-assessments)** leveren het gapbeeld: het assessment identificeert waar elke locatie staat ten opzichte van de baseline vóór uitrol begint, zodat de remediatie-inspanning nauwkeurig wordt gescoopt. De baseline geeft het assessment een doel om tegen te meten — wat de twee tot natuurlijke aanvullingen maakt.

**[Kennisoverdracht](/capability-transfer)** is wat ervoor zorgt dat de baseline de opdracht overleeft: de bewijsverzamelingsprocedures, uitzonderingsbeoordelingscadans en baselineonderhoudsprocessen gaan allemaal in het operating model dat uw team erft. Een baseline in eigendom van een consultant is een baseline die risico loopt.

```cta
Leg overal de ondergrens
Definieer een OT-securitybaseline die realistisch te halen, eenvoudig aan te tonen en consistent over elk locatie in uw estate is.
Praat met een OT-beveiligingsexpert :: /contact
```
