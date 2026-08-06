---
title: Architectuur & segmentatie
meta_title: OT-architectuur & netwerksegmentatie | OXOT
meta_description: Veilige OT-netwerkarchitectuur — zones, conduits en praktische segmentatie afgestemd op IEC 62443, ontworpen om de blast radius te beperken zonder de productie te verstoren.
excerpt: Definieer veilige OT-netwerkarchitecturen — zones, conduits en praktische segmentatiepatronen afgestemd op IEC 62443, ontworpen voor operaties die niet kunnen stoppen.
content_type: page
published: true
---

Platte OT-netwerken maken van één voet-aan-de-grond een plantbreed incident. OXOT ontwerpt OT-netwerkarchitecturen die die blast radius inperken — zones en conduits afgestemd op IEC 62443 — met respect voor de realiteit dat u een draaiende installatie niet zomaar opnieuw kunt bekabelen.

We beginnen bij uw werkelijke verkeer en datastromen, definiëren een doelarchitectuur waar u in fasen naartoe migreert, en toetsen elke stap aan de operatie zodat segmentatie de beveiliging verbetert zonder de productie te onderbreken.

```keyfacts
Norm :: IEC 62443-3-2 (zones en conduits) en 3-3 (systeembeveiligingsvereisten)
Ontwerpeenheid :: zones en conduits, geen platte VLAN's
Aanpak :: segmenteren zonder de productie te verstoren — gefaseerde migratie
Omvat :: DMZ-ontwerp, datastromen, externe toegangsconduits, firewall-baselines
Oplevering :: doelreferentiearchitectuur + een gefaseerd migratieplan
Validatie :: ontworpen en getoetst aan echt geobserveerd verkeer
```

## Het probleem van het platte netwerk

De meeste OT-netwerken zijn gebouwd voor betrouwbaarheid, niet voor inperking. Apparaten communiceren met wat ze nodig hebben, op netwerken die nooit zijn ontworpen met een beveiligingsperimeter in gedachten. Dat werkte toen OT geïsoleerd was. Het werd een probleem zodra externe toegang, IT/OT-integratie en verbonden toeleveringsketens hun intrede deden.

Het gevolg is een netwerk waar een gecompromitteerde leverancierlaptop, een slecht geauthenticeerde externe sessie of een lateraalbewegende malware een safety-controller kan bereiken zonder enige blokkade. Het aanvalsoppervlak is de volledige installatie.

```compare
Een plat OT-netwerk
- Één compromis bereikt alles — geen inperking
- Geen mogelijkheid om af te dwingen wat met wat mag communiceren, of wanneer
- Externe toegang en IT-connectiviteit delen hetzelfde broadcastdomein als PLC's
- "Beveiliging" betekent perimeter — eenmaal binnen is het open
- Elke incidentrespons begint met "we weten niet wat het heeft aangeraakt"
---
Een gesegmenteerde OT-architectuur
- Zones beperken een compromis — blast radius beperkt tot een gedefinieerde grens
- Conduits maken elke communicatie over zonegrenzen expliciet en beheersbaar
- Externe toegang gaat via een gecontroleerde DMZ, niet rechtstreeks naar het procesnetwerk
- Defence in depth — meerdere lagen betekenen dat één fout geen plantbrede fout is
- Incidentrespons begint vanuit een kaart, geen raadsel
```

## Wat u krijgt

```cards
Zone- en conduitmodel :: :: Uw omgeving uitgedrukt als IEC 62443-zones en -conduits — assets gegroepeerd op risico en functie, vertrouwensgrenzen expliciet gemaakt en elke communicatiestroom die grenzen overschrijdt geïdentificeerd.
Doelreferentiearchitectuur :: :: Een concreet to-be-ontwerp: DMZ-plaatsing, datadiodes waar gerechtvaardigd, gecontroleerde datastromen tussen zones, en de firewall- en filterlogica die de conduitregels handhaaft.
Segmentatiemigratieplan :: :: Een gefaseerd pad van uw huidige platte topologie naar de doelarchitectuur — zo gefaseerd dat de operatie nooit stilstaat. Elke fase is afgestemd op wat uw team in een onderhoudsvenster kan absorberen.
Firewall- & conduitregelbaselines :: :: De regelsets en wijzigingspatronen die uw team nodig heeft om de gesegmenteerde architectuur over tijd te onderhouden. Geen momentopname — een herhaalbare, auditbare baseline die zij bezitten.
DMZ- & externe toegangsontwerp :: :: Hoe externe connectiviteit — leverancierstoegang, IT/OT-integratie, historianreplicatie — de OT-omgeving binnenkomt via een gecontroleerde conduit in plaats van rechtstreeks naar het procesnetwerk.
Architectuurdocumentatie :: :: Een gedocumenteerde architectuur die uw team kan gebruiken voor onboarding, incidentrespons en regelgevingstoetsing — geen diagram dat in één consultantlaptop leeft.
```

## Hoe we het uitvoeren

```timeline
1. Verkeers- & stroomanalyse :: Leg de werkelijke communicatiepatronen over uw OT-omgeving vast — via passieve observatie, bestaande documentatie en interviews met de engineers die het onderhouden. Het ontwerp moet overeenkomen met wat er werkelijk draait, niet met wat het oude diagram zegt.
2. Zonedefinitie :: Groepeer assets op risicotolerantie en functie. Safety-kritieke controllers, procesbesturingssystemen, engineering-werkstations, historianservers en IT-gerichte systemen horen elk in zones gedefinieerd op hun doelsecurityniveau en operationele rol.
3. Conduitontwerp :: Definieer voor elke behoefte aan communicatie over zones de conduit: wat mag stromen, in welke richting, op welke tijden en welke controles handhaven dat. Maak impliciete communicatie expliciet — en laat onnodige communicatie verdwijnen.
4. Doelarchitectuur :: Produceer de referentiearchitectuur: zone-indeling, DMZ-ontwerp, conduitregelsets, datadiodeplacement en externe toegangsinhoud. Gevalideerd aan de verkeerskaart om te bevestigen dat niets operationeel noodzakelijks wordt geblokkeerd.
5. Gefaseerd migratieplan :: Faseer de verplaatsing van huidig naar doel rond onderhoudsvensters, operationele beperkingen en beschikbare capaciteit. Geen fase mag een productiestoprequeren die niet al gepland was.
6. Verificatie :: Verifieer na elke migratiefase dat de segmentatie stanhoudt aan echt verkeer en bevestig dat er niets operationeels brak. Beveiliging en operationele continuïteit zijn beide succescriteria.
```

## Aansluiting op regelgeving

| Kader | Wat deze dienst adresseert |
|---|---|
| **IEC 62443-3-2** | Zone- en conduitontwerp is de kernmethodologie van 62443-3-2 — het definiëren van beveiligingszones, het toewijzen van doelsecurityniveaus en het specificeren van conduitvereisten |
| **IEC 62443-3-3** | Systeembeveiligingsvereisten SR 5.1–5.4 (netwerk- en communicatiebeveiliging) en de securityniveaus die conduitcontroles moeten bereiken |
| **NIS2 Art. 21(2)(b)** | Incidentbehandeling — effectieve incidentrespons vereist ingeperkte zones; een plat netwerk maakt zowel detectie als inperking moeilijker |
| **NIS2 Art. 21(2)(h)** | Netwerkbeveiliging — segmentatie en conduitbeheer zijn de praktische uitdrukking van NIS2's netwerkbeveiligingsvereisten voor OT-omgevingen |
| **NIS2 Art. 21(2)(d)** | Toeleveringsketenbeveiliging — gecontroleerde conduits voor leveranciers- en OEM-connectiviteit adresseren rechtstreeks het toegangsrisico van derden |
| **Cyber Resilience Act** | Voor verbonden OT-producten bepaalt de architectuur wat een gecompromitteerd product kan bereiken — segmentatie beperkt de gevolgen van een kwetsbaarheid op productniveau |

## Hoe het aansluit

Architectuurwerk volgt logisch op een **[assessment](/ot-security-assessments)** — het assessment identificeert waar segmentatie ontbreekt of onvoldoende is; het architectuurontwerp definieert wat het zou moeten zijn. De **[Cyber Digital Twin](/cyber-digital-twin)** bevat het architectuurmodel en houdt het actueel naarmate de omgeving verandert: elke conduit, elke zonegrens, elke wijziging wordt weerspiegeld in de twin, niet in een diagram dat veroudert.

**[Veilige externe toegang](/secure-remote-access)** is de natuurlijke aanvulling: de veilige externe toegangsbroker zit op een gecontroleerde conduit tussen een externe DMZ en het procesnetwerk. U ontwerpt de conduit hier en handhaaft de toegangscontroles daar. Samen sluiten ze de twee meest voorkomende aanvalspaden naar OT: laterale beweging vanuit een plat intern netwerk en ongecontroleerde externe connectiviteit.

De architectuur levert ook de structurele basis voor de **[OT-securitybaseline](/ot-security-baseline)**: zodra zones zijn gedefinieerd, kunt u bepalen welke maatregelen in welke zone gelden en op welk securityniveau — wat een baseline realistisch maakt in plaats van generiek.

```cta
Perk de blast radius in
Ontwerp een OT-architectuur die beperkt hoe ver een incident zich kan verspreiden — zonder de productie te stoppen.
Praat met een OT-beveiligingsexpert :: /contact
```
