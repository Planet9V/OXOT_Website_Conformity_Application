---
title: NIS2 voor Operationele Technologie
meta_title: NIS2-richtlijn voor OT & Industrie | OXOT
meta_description: Wat NIS2 (Richtlijn (EU) 2022/2555) betekent voor industriële en OT-operators — reikwijdte, de tien maatregelen van Artikel 21, 24/72-uurs melding, bestuurdersaansprakelijkheid, sancties, aansluiting op IEC 62443, en een praktisch stappenplan.
excerpt: Een OT-gerichte praktijkgids voor NIS2 — wie onder de reikwijdte valt, de tien maatregelen van Artikel 21 vertaald naar de fabrieksvloer, het 24/72-uurs/één-maand meldritme, bestuurdersaansprakelijkheid, sancties, en een gefaseerd plan dat u daadwerkelijk kunt uitvoeren.
content_type: page
published: true
---

NIS2 is de tweede richtlijn van de Europese Unie inzake netwerk- en informatiebeveiliging, en het is de meest ingrijpende cybersecuritywetgeving waarmee de meeste industriële operators in Europa ooit te maken hebben gehad. De richtlijn vervangt de oorspronkelijke NIS-richtlijn uit 2016, verbreedt de kring van organisaties die eronder vallen aanzienlijk, legt meldtermijnen wettelijk vast en maakt — voor het eerst — de hoogste leiding persoonlijk verantwoordelijk voor een goede cybersecurity.

Voor de exploitant van een onderstation, een gemaal, een chemische fabriek of een productiehal is NIS2 geen IT-vraagstuk dat binnen de serverruimte blijft. De richtlijn raakt rechtstreeks aan de Operationele Technologie (OT) die de productie draaiende houdt en mensen veilig. Een geactiveerd veiligheidsinstrumentatiesysteem, een stilgelegde bottelarij, een gemanipuleerd setpoint op een chloordoseerpomp — dit zijn de gebeurtenissen waar de richtlijn om geeft, en die spelen zich af in de wereld van PLC's, RTU's, aandrijvingen en historians, niet e-mailservers. Deze pagina legt uit wat de wet daadwerkelijk vereist, waar deze het hardst doorwerkt in OT-omgevingen, en hoe een realistische reactie eruitziet.

## De korte versie

- NIS2 is **Richtlijn (EU) 2022/2555**, aangenomen op 14 december 2022 en van kracht sinds 16 januari 2023. Lidstaten moesten deze uiterlijk **17 oktober 2024** omzetten in nationale wetgeving. ([EUR-Lex, CELEX 32022L2555](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32022L2555))
- De richtlijn bestrijkt veel meer sectoren en organisaties dan de oude NIS-richtlijn, onderverdeeld in **essentiële** en **belangrijke** entiteiten in **18 sectoren** (11 in Bijlage I, 7 in Bijlage II).
- **Artikel 21** stelt een **minimale basis van tien risicobeheersmaatregelen** vast, gebaseerd op een **allgevarenbenadering** die ook fysieke en omgevingsdreigingen omvat — niet alleen cyberaanvallen.
- **Artikel 23** legt een strikt meldritme op voor incidenten: een **vroegtijdige waarschuwing binnen 24 uur**, een **melding binnen 72 uur**, en een **eindverslag binnen één maand**.
- **Artikel 20** verplicht bestuursorganen om de maatregelen **goed te keuren en toe te zien** op de uitvoering ervan, verplicht hen om **training te volgen**, en maakt het mogelijk dat zij **aansprakelijk worden gesteld** bij tekortkomingen.
- **Artikel 34** stelt boetes vast van **ten minste €10 miljoen of 2% van de wereldwijde jaaromzet** voor essentiële entiteiten, en **ten minste €7 miljoen of 1,4%** voor belangrijke entiteiten — welk bedrag ook hoger is.

Als u één ding meeneemt: NIS2 is een governance- en risicobeheerwet, geen boodschappenlijst van producten. De richtlijn beloont organisaties die kunnen *aantonen* dat zij hun risico begrijpen en het doelbewust beheren — en dat is precies waar OT-beveiliging zo vaak tekortschiet.

> [!IMPORTANT]
> NIS2 is een richtlijn, geen verordening. Zij is niet rechtstreeks van toepassing op uw organisatie — zij werkt door via de nationale omzettingswet van uw lidstaat. Controleer altijd de nationale wet, want verschillende landen zijn verder gegaan dan de ondergrens van de richtlijn. In Nederland is dat de **Cyberbeveiligingswet (Cbw)**.

## Waarom NIS2 bestaat

De NIS-richtlijn uit 2016 was de eerste poging van de EU om de cybersecuritybasis voor kritieke diensten te verhogen. Dat werkte ongelijkmatig. Lidstaten interpreteerden "aanbieders van essentiële diensten" verschillend, de handhaving was inconsistent, en hele categorieën die duidelijk van belang waren — afvalwater, voedselproductie, industriële productie, openbaar bestuur — vielen buiten de reikwijdte. Twee organisaties die dezelfde essentiële dienst leverden in twee landen konden voor totaal verschillende verplichtingen komen te staan, of voor helemaal geen.

Ondertussen veranderde het dreigingslandschap. Ransomwaregroepen ontdekten dat het stilleggen van productie winstgevender is dan het stelen van gegevens, omdat een fabriek die miljoenen per dag verliest snel betaalt. Statelijke actoren toonden herhaaldelijk aan dat industriële besturingssystemen levensvatbare doelwitten zijn — van de wiper-aanvallen op de Oekraïense elektriciteitsdistributie tot de verkenningsactiviteiten bij Europese nutsbedrijven zonder ooit daadwerkelijk toe te slaan. Compromittering van de toeleveringsketen liet zien dat vertrouwde software-updates en kanalen voor beheer op afstand net zo gevaarlijk zijn als elke frontale exploit.

NIS2 is de correctie. De richtlijn harmoniseert de regels, verbreedt de reikwijdte aanzienlijk, legt meldtermijnen wettelijk vast, en legt de verantwoordelijkheid daar waar besluiten daadwerkelijk worden genomen — bij de hoogste leiding. De overwegingen bij de richtlijn zijn er open over dat het vorige regime hiaten liet bestaan en dat de blootstelling van essentiële en belangrijke entiteiten sneller was gegroeid dan de wetgeving die daarop toezag.

## Wie valt onder de reikwijdte

NIS2 verdeelt de betrokken organisaties in twee categorieën. Beide moeten voldoen aan dezelfde kernbeveiligingsverplichtingen onder Artikel 21 en dezelfde meldplichten onder Artikel 23; het verschil zit in de striktheid van het toezicht en de wijze van sanctionering. ([nis-2-directive.com, Artikel 3](https://www.nis-2-directive.com/NIS_2_Directive_Article_3.html))

### De twee categorieën in één oogopslag

| Categorie | Sectoren | Toezicht | Bovengrens boete |
| --- | --- | --- | --- |
| **Essentiële entiteiten** | Hoogkritieke sectoren uit Bijlage I, op schaal | Proactief, *ex ante* — audits en inspecties zonder dat bewijs van een probleem nodig is | Ten minste **€10 miljoen of 2%** van de wereldwijde jaaromzet, welk bedrag ook hoger is |
| **Belangrijke entiteiten** | Overige kritieke sectoren uit Bijlage II | Reactief, *ex post* — actie op basis van bewijs of aanwijzing van niet-naleving | Ten minste **€7 miljoen of 1,4%** van de wereldwijde jaaromzet, welk bedrag ook hoger is |

### Bijlage I — de 11 zeer kritieke sectoren

De essentiële categorie komt grotendeels uit Bijlage I: **energie** (elektriciteit, olie, gas, stadsverwarming en -koeling, waterstof), **transport** (lucht, spoor, water, weg), **bankwezen**, **infrastructuren voor de financiële markt**, **gezondheidszorg**, **drinkwater**, **afvalwater**, **digitale infrastructuur**, **beheer van ICT-diensten** (business-to-business), **openbaar bestuur**, en **ruimtevaart**. ([Glocert, essentieel versus belangrijk](https://www.glocertinternational.com/resources/guides/nis2-applicability-essential-vs-important-entities/))

### Bijlage II — de 7 overige kritieke sectoren

Bijlage II voegt de sectoren voor de belangrijke categorie toe: **post- en koeriersdiensten**, **afvalbeheer**, **vervaardiging, productie en distributie van chemische stoffen**, **productie en distributie van levensmiddelen**, **industriële productie** (medische hulpmiddelen, computers en elektronica, machines en apparatuur, motorvoertuigen, overige transportmiddelen), **aanbieders van digitale diensten** (onlinemarktplaatsen, zoekmachines, sociale platforms), en **onderzoeksorganisaties**.

### De omvangsregel — en de uitzonderingen erop

Als algemene regel is NIS2 van toepassing op organisaties die **middelgroot of groter** zijn binnen een sector die onder de reikwijdte valt — in grote lijnen, **50 of meer werknemers, of een jaaromzet/balanstotaal boven €10 miljoen**. Een entiteit die bovendien **250 werknemers of €50 miljoen omzet** overschrijdt, is een grote onderneming en is in een hoogkritieke sector doorgaans een essentiële entiteit. ([Legiscope, essentieel versus belangrijk](https://www.legiscope.com/blog/nis2-essential-important-entities.html))

Er zijn belangrijke uitzonderingen. Bepaalde aanbieders vallen **ongeacht hun omvang** onder de reikwijdte — waaronder **aanbieders van DNS-diensten, registers voor topleveldomeinnamen, vertrouwensdiensten, en aanbieders van openbare elektronische-communicatienetwerken of -diensten**. Lidstaten kunnen ook specifieke kleinere entiteiten aanwijzen als zij bijvoorbeeld de enige aanbieder van een kritieke dienst in een regio zijn, of wanneer verstoring aanzienlijke gevolgen zou hebben.

> [!WARNING]
> Het praktische gevolg voor de industrie is scherp. Een middelgrote fabrikant, een regionaal waterbedrijf, een voedselproducent of een chemicaliëndistributeur die zichzelf nooit als "vitale infrastructuur" beschouwde, valt nu zeer waarschijnlijk onder de reikwijdte — en velen merkten dit niet toen de omzettingstermijn verstreek. Niet weten dat u onder de reikwijdte valt, is geen verweer.

### Waar de omzetting daadwerkelijk staat

Lidstaten moesten uiterlijk 17 oktober 2024 nationale wetgeving van kracht hebben. De meeste haalden dat niet. Op **7 mei 2025 heeft de Europese Commissie met redenen omklede adviezen uitgebracht aan 19 lidstaten** wegens het niet melden van volledige omzetting — een formele stap voorafgaand aan verwijzing naar het Hof van Justitie. ([Europese Commissie, NIS-omzetting](https://digital-strategy.ec.europa.eu/en/policies/nis-transposition)) Vanaf 2026 heeft de meerderheid omzettingswetgeving aangenomen, terwijl verschillende landen — waaronder **Frankrijk, Ierland, Luxemburg, Nederland en Spanje** — het proces later afrondden dan de termijn. ([ECSO-omzettingstracker](https://ecs-org.eu/activities/nis2-directive-transposition-tracker/))

In **Nederland** implementeert de **Cyberbeveiligingswet (Cbw)** NIS2. De **Tweede Kamer keurde het wetsvoorstel goed op 15 april 2026**, waarbij formele vaststelling later in 2026 wordt beoogd na behandeling in de Eerste Kamer. ([Bird & Bird, Nederlandse Cyberbeveiligingswet](https://www.twobirds.com/en/insights/2026/netherlands/dutch-parliament-approves-cybersecurity-act-implementing-nis2)) De vertraging verandert niets aan de inhoud waarop operators zich moeten voorbereiden — en zij schort de verplichting om gereed te zijn niet op.

## Essentiële versus belangrijke entiteiten — de splitsing die uw regime bepaalt

De tweedeling die u zojuist in de tabel zag, bepaalt méér dan alleen het boeteplafond: zij bepaalt hoe de wet u benadert. Beide categorieën dragen dezelfde kern van beveiligingsmaatregelen (Artikel 21) en dezelfde meldplichten (Artikel 23). Wat verschilt, is de **handhavingshouding** — en dat verschil is in de praktijk vaak ingrijpender dan het cijfer op de boete. Uw categorie volgt uit sector *én* omvang: grote ondernemingen in de meest kritieke sectoren zijn in de regel **essentieel**; middelgrote organisaties en die in "andere kritieke" sectoren zijn **belangrijk**.

```compare
Essentiële entiteiten
- Meest kritieke sectoren (Bijlage I): energie, transport, bankwezen, financiëlemarktinfrastructuur, gezondheidszorg, drink- & afvalwater, digitale infrastructuur, ICT-servicebeheer, openbaar bestuur, ruimtevaart
- **Proactief (ex ante) toezicht** — toezichthouders mogen auditen, inspecteren en bewijs opvragen zónder een incident of aanwijzing af te wachten
- Bestuurlijke boetes tot **€10 miljoen of 2% van de wereldwijde jaaromzet**, het hoogste bedrag geldt
---
Belangrijke entiteiten
- Andere kritieke sectoren (Bijlage II): post & koeriers, afvalbeheer, chemie, voeding, maakindustrie (medische hulpmiddelen, machines, voertuigen), digitale aanbieders, onderzoek
- **Reactief (ex post) toezicht** — controle volgt doorgaans pas op aanwijzingen van niet-naleving of een incident
- Bestuurlijke boetes tot **€7 miljoen of 1,4% van de wereldwijde jaaromzet**, het hoogste bedrag geldt
```

> [!IMPORTANT]
> De classificatie is geen zelfbeoordeling die u stilletjes naar beneden afrondt. NIS2 kent een **registratieplicht** — betrokken entiteiten moeten zich melden bij hun nationale autoriteit (in Nederland gecoördineerd binnen het NCSC/RDI-landschap onder de Cbw) — en de **"size-cap"-uitzondering** betekent dat een organisatie ónder de gebruikelijke omvangsdrempels tóch in scope kan vallen als zij de enige aanbieder van een kritieke dienst is of als verstoring een aanzienlijke maatschappelijke impact zou hebben. De categorie verkeerd inschatten — in welke richting dan ook — is zelf een governancefalen.

## Governance en reikwijdte, in één oogopslag

Onderstaand diagram volgt de keten die NIS2 opbouwt: van een verantwoordelijk bestuursorgaan, via de tien maatregelen, naar het toezicht en de handhaving die dit alles bewaken.

```svg
<svg viewBox="0 0 700 380" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, Helvetica, Arial, sans-serif">
  <rect x="0" y="0" width="700" height="380" fill="none"/>
  <!-- Management body -->
  <rect x="200" y="20" width="300" height="56" rx="8" fill="#3b82f6" fill-opacity="0.15" stroke="#3b82f6" stroke-width="1.5"/>
  <text x="350" y="44" text-anchor="middle" fill="#e5e7eb" font-size="15" font-weight="700">Bestuursorgaan (Art. 20)</text>
  <text x="350" y="63" text-anchor="middle" fill="#94a3b8" font-size="11">Keurt goed &amp; ziet toe · getraind · aansprakelijk</text>
  <!-- arrow down -->
  <line x1="350" y1="76" x2="350" y2="104" stroke="#94a3b8" stroke-width="1.5"/>
  <polygon points="350,110 345,100 355,100" fill="#94a3b8"/>
  <!-- Measures -->
  <rect x="120" y="112" width="460" height="70" rx="8" fill="#94a3b8" fill-opacity="0.10" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="350" y="134" text-anchor="middle" fill="#e5e7eb" font-size="15" font-weight="700">Tien risicobeheersmaatregelen (Art. 21)</text>
  <text x="350" y="154" text-anchor="middle" fill="#94a3b8" font-size="11">Allgevaren · proportioneel · IT en OT binnen bereik</text>
  <text x="350" y="171" text-anchor="middle" fill="#94a3b8" font-size="11">Risicoanalyse · incidentbehandeling · continuïteit · keten · MFA · meer</text>
  <!-- two arrows down -->
  <line x1="230" y1="182" x2="230" y2="212" stroke="#94a3b8" stroke-width="1.5"/>
  <polygon points="230,218 225,208 235,208" fill="#94a3b8"/>
  <line x1="470" y1="182" x2="470" y2="212" stroke="#94a3b8" stroke-width="1.5"/>
  <polygon points="470,218 465,208 475,208" fill="#94a3b8"/>
  <!-- Reporting -->
  <rect x="60" y="220" width="340" height="64" rx="8" fill="#f97316" fill-opacity="0.13" stroke="#f97316" stroke-width="1.5"/>
  <text x="230" y="244" text-anchor="middle" fill="#e5e7eb" font-size="14" font-weight="700">Incidentmelding (Art. 23)</text>
  <text x="230" y="264" text-anchor="middle" fill="#94a3b8" font-size="11">24u waarschuwing → 72u melding → 1 mnd verslag</text>
  <text x="230" y="279" text-anchor="middle" fill="#94a3b8" font-size="11">aan nationaal CSIRT / bevoegde autoriteit</text>
  <!-- Supervision -->
  <rect x="360" y="220" width="280" height="64" rx="8" fill="#3b82f6" fill-opacity="0.10" stroke="#3b82f6" stroke-width="1.5"/>
  <text x="500" y="244" text-anchor="middle" fill="#e5e7eb" font-size="14" font-weight="700">Toezicht (Art. 32–33)</text>
  <text x="500" y="264" text-anchor="middle" fill="#94a3b8" font-size="11">Essentieel: ex ante · Belangrijk: ex post</text>
  <text x="500" y="279" text-anchor="middle" fill="#94a3b8" font-size="11">Audits · bevelen · toezichthouder</text>
  <!-- arrows to enforcement -->
  <line x1="230" y1="284" x2="330" y2="316" stroke="#94a3b8" stroke-width="1.5"/>
  <line x1="500" y1="284" x2="380" y2="316" stroke="#94a3b8" stroke-width="1.5"/>
  <!-- Enforcement -->
  <rect x="230" y="320" width="240" height="46" rx="8" fill="#f97316" fill-opacity="0.16" stroke="#f97316" stroke-width="1.5"/>
  <text x="350" y="343" text-anchor="middle" fill="#e5e7eb" font-size="14" font-weight="700">Handhaving &amp; boetes (Art. 34)</text>
  <text x="350" y="359" text-anchor="middle" fill="#94a3b8" font-size="11">Tot €10m / 2% of €7m / 1,4%</text>
</svg>
```

## Artikel 21: de tien maatregelen, vertaald naar OT

Artikel 21 vormt de kern van de richtlijn. Het vereist dat betrokken entiteiten "passende en evenredige technische, operationele en organisatorische maatregelen" nemen "om de risico's voor de beveiliging van netwerk- en informatiesystemen te beheersen." Het hanteert een **allgevarenbenadering** — de maatregelen moeten deze systemen en hun fysieke omgeving beschermen tegen incidenten, ongeacht of de oorzaak een hacker, een brand, een overstroming of een falende leverancier is. ([nis-2-directive.com, Artikel 21](https://www.nis-2-directive.com/NIS_2_Directive_Article_21.html))

Het artikel noemt tien maatregelen als minimum. Bekeken door een zuivere IT-bril lijkt elk maatregel bekend. Bekeken door een OT-bril draagt elk een gewicht dat gemakkelijk wordt onderschat. De tabel brengt ze in kaart; de secties daarna gaan dieper in.

| # | Maatregel Artikel 21(2) | Wat het betekent | Implicatie voor OT |
| --- | --- | --- | --- |
| 1 | Risicoanalyse en beveiligingsbeleid voor informatiesystemen | Een gedocumenteerd, actueel inzicht in risico's en het beleid dat dit stuurt | Begint met een asset-inventaris die de meeste fabrieken niet op verzoek kunnen produceren |
| 2 | Incidentbehandeling | Preventie, detectie, analyse, inperking, respons, herstel | U kunt vaak niet herstarten, patchen of isoleren zonder een live fysiek proces te raken |
| 3 | Bedrijfscontinuïteit, back-up, disaster recovery, crisisbeheer | Bedrijfsvoering behouden of herstellen na verstoring | Getest herstel van PLC/RTU-configuraties, engineeringwerkstations en historians — niet alleen servers |
| 4 | Beveiliging van de toeleveringsketen | Beveiliging van relaties met directe leveranciers en dienstverleners | Uw OEM's, integrators en onderhoudsleveranciers hebben toegang op afstand tot uw kroonjuwelen |
| 5 | Beveiliging bij verwerving, ontwikkeling en onderhoud; omgang met en openbaarmaking van kwetsbaarheden | Beveiliging inbouwen in hoe u systemen aanschaft en onderhoudt | Inkoopclausules en patchvensters voor besturingssystemen, geen achteraf toegevoegde oplossingen |
| 6 | Beleid om de effectiviteit van maatregelen te beoordelen | Aantonen dat de beheersmaatregelen daadwerkelijk werken | Testen en auditen met respect voor operationele beperkingen — geen verstorende scans op live cellen |
| 7 | Basale cyberhygiëne en beveiligingstraining | Patchen, configuratiebeheer, minimale rechten, bewustwording | Toegepast op engineers en operators, wier dagelijkse werk geen IT-beveiliging is |
| 8 | Cryptografie en, waar passend, versleuteling | Evenredig gebruik van cryptografie | Beschermt meestal toegang op afstand, gegevens in transit en back-ups — zelden realtime besturingsverkeer |
| 9 | HR-beveiliging, toegangsbeheer, assetbeheer | Wie wat mag aanraken, vanaf waar, met welke rechten | Gedeelde accounts, leverancierstoegang en contractanttoegang zijn de klassieke zwakke plekken |
| 10 | MFA / continue authenticatie; beveiligde & noodcommunicatie | Sterke authenticatie en gehardende communicatiekanalen | MFA op toegang op afstand en bevoorrechte OT-toegang is nu een verwachting, geen leuke extra |

### 1 — Risicoanalyse en beveiligingsbeleid

Alles wat volgt, rust hierop. U hebt een actueel, gedocumenteerd beeld nodig van uw risico en het beleid dat bepaalt hoe u dat beheert. In OT is dat beeld onmogelijk zonder een nauwkeurige **asset-inventaris** — en precies hier schieten de meeste operators tekort. Een fabriek die niet op verzoek kan opsommen welke controllers zij gebruikt, hoe deze verbonden zijn, welke bereikbaar zijn via internet en welke een veiligheidsfunctie beschermen, doet risicoanalyse op basis van giswerk. NIS2 verandert dat gat van een operationeel ongemak in een compliance-risico.

### 2 — Incidentbehandeling

Detectie, analyse, inperking, respons en herstel — de volledige levenscyclus. Het IT-draaiboek gaat ervan uit dat u een host kunt isoleren, een proces kunt beëindigen of kunt herstellen vanuit een image. Op een procesinstallatie kunnen die handelingen een veiligheidsfunctie activeren of een batch verloren laten gaan. OT-incidentbehandeling moet worden opgesteld met de procesengineer aan tafel, met vooraf overeengekomen beslissingsbevoegdheden over wie apparatuur offline mag halen en onder welke veiligheidscondities.

### 3 — Bedrijfscontinuïteit en crisisbeheer

Back-up, disaster recovery en het vermogen om de bedrijfsvoering te behouden of te herstellen. Voor OT betekent dit geteste, herstelbare kopieën van **PLC- en RTU-logica, HMI- en SCADA-projecten, images van engineeringwerkstations, aandrijfparameters en historiandata** — en een geoefend plan om een cel vanaf kale hardware weer op te bouwen. Back-ups die u nooit hebt hersteld, zijn een hypothese, geen beheersmaatregel.

### 4 — Beveiliging van de toeleveringsketen

NIS2 maakt het risico van de toeleveringsketen expliciet. Entiteiten moeten de kwetsbaarheden van elke directe leverancier, de kwaliteit van hun producten en hun praktijken voor veilige ontwikkeling in overweging nemen, en rekening houden met de **gecoördineerde risicobeoordelingen van kritieke toeleveringsketens** op EU-niveau onder Artikel 22. ([nis2-info.eu, Artikel 21](https://www.nis2-info.eu/article-21-cybersecurity-risk-management-measures/)) In OT *is* de toeleveringsketen het aanvalsoppervlak: uw integrators en OEM's hebben vaak permanente toegang op afstand tot uw meest gevoelige apparatuur. Governance van leverancierstoegang is hier geen papieren exercitie — het is een van de beheersmaatregelen met de hoogste hefboomwerking die u in eigen hand hebt.

### 5 — Beveiliging bij verwerving, ontwikkeling en onderhoud

Dit reikt tot in de inkoop en de gehele levenscyclus van systemen, inclusief de omgang met en openbaarmaking van kwetsbaarheden. Beveiligingseisen horen thuis in de specificatie wanneer u een nieuwe lijn koopt of een besturingssysteem upgradet — niet in een saneringsproject drie jaar later. Het is ook waar NIS2 de [Cyber Resilience Act](/nl/cra) en de [Machineverordening](/nl/machine-act) raakt: de producten die u koopt, komen steeds vaker met eigen beveiligingsverplichtingen, en het is uw taak deze te eisen en te verifiëren.

### 6 — Effectiviteit beoordelen

U moet kunnen aantonen dat de maatregelen werken, door middel van testen, audit en evaluatie. In OT is de uitdaging dit te doen zonder iets te breken — actief scannen van een live besturingsnetwerk kan net zo verstorend zijn als een aanval. Passieve monitoring, offline validatie en gefaseerd testen worden de gereedschappen bij uitstek, en een [Cyber Digital Twin](/nl/cyber-digital-twin) stelt u in staat om de vraag "houdt deze beheersmaatregel stand?" te beantwoorden tegen een model in plaats van tegen de productie.

### 7 — Basale cyberhygiëne en training

Patchen, configuratiebeheer, minimale rechten, bewustwording. De valkuil: in OT zijn de "gebruikers" engineers, operators en onderhoudspersoneel, en patchcycli worden bepaald door onderhoudsvensters die in maanden worden gemeten. Hygiëne moet worden ontworpen rondom de operationele realiteit — compensatiemaatregelen waar patchen daadwerkelijk onmogelijk is, en training die de taal van de fabriek spreekt, niet die van het SOC.

### 8 — Cryptografie en versleuteling

Evenredig toegepast. In OT beschermt versleuteling meestal sessies voor toegang op afstand, gegevens in transit over onvertrouwde verbindingen, en back-ups — niet realtime besturingsverkeer, waar latentie en verouderde protocollen inline-versleuteling vaak onpraktisch maken. Het woord "evenredig" doet hier echt werk: NIS2 vraagt u niet om een 20 jaar oude veldbus te versleutelen.

### 9 — HR-beveiliging, toegangsbeheer en assetbeheer

Wie wat mag aanraken, vanaf waar, met welke bevoegdheden. Gedeelde operatoraccounts, generieke leveranciersinloggegevens en contractanten met permanente toegang komen veelvuldig voor in OT en zijn precies waar deze maatregel op aangrijpt. Strakker toegangsbeheer en een bijgehouden assetregister zijn de twee beheersmaatregelen die het vaakst het werkelijke risico verminderen.

### 10 — MFA en beveiligde communicatie

Meervoudige of continue authenticatie, plus beveiligde spraak-, video- en tekstcommunicatie en noodcommunicatie waar passend. Ronduit gezegd: **MFA op toegang op afstand en bevoorrechte toegang tot OT is nu een verwachting.** Gezien hoe vaak OT-compromittering begint met een onbeveiligd toegangspad op afstand, is dit een van de meest waardevolle regels in het hele artikel.

> [!TIP]
> Het woord dat steeds terugkeert in Artikel 21 is **evenredig**. NIS2 vereist niet dezelfde maatregelen van een kerncentrale-exploitant als van een snackfood-distributeur. Het vereist maatregelen die evenredig zijn aan het risico, de blootstelling van de entiteit, de stand van de techniek, en de kosten afgewogen tegen de potentiële impact. Dat is een risicogebaseerde norm — en het betekent dat u uw keuzes moet kunnen *rechtvaardigen* tegen uw werkelijke risico. Een gestructureerde, op bewijs gebaseerde beoordeling is wat "we hebben besloten die PLC niet te patchen" verandert van een aansprakelijkheid in een verdedigbaar, gedocumenteerd besluit.

## Artikel 23: incidentmelding in de praktijk

Waar het oude regime vaag was, is NIS2 specifiek. Artikel 23 vereist dat betrokken entiteiten **significante incidenten** melden aan hun nationale CSIRT of bevoegde autoriteit binnen een vaste termijn die begint op het moment dat u **zich bewust wordt**. ([nis-2-directive.com, Artikel 23](https://www.nis-2-directive.com/NIS_2_Directive_Article_23.html))

| Fase | Termijn | Wat het moet bevatten |
| --- | --- | --- |
| **Vroegtijdige waarschuwing** | Binnen **24 uur** nadat u zich bewust werd | Of het incident vermoedelijk onrechtmatig/kwaadwillig is en of het grensoverschrijdende gevolgen kan hebben |
| **Incidentmelding** | Binnen **72 uur** nadat u zich bewust werd | Update van de vroegtijdige waarschuwing; eerste beoordeling van ernst en impact; indicatoren van compromittering indien beschikbaar |
| **Tussentijds verslag** | Op verzoek | Statusupdate op verzoek van de autoriteit |
| **Eindverslag** | Binnen **1 maand** na de melding | Gedetailleerde beschrijving, oorzaakanalyse, toegepaste mitigaties, en eventuele grensoverschrijdende impact |
| **Voortgangsverslag** | Indien het incident nog loopt na de termijn van 1 maand | Nu een voortgangsverslag, eindverslag binnen één maand na afhandeling van het incident |

Een incident is **significant** als het ernstige operationele verstoring van de dienst of financiële schade heeft veroorzaakt of kan veroorzaken, of andere personen heeft getroffen of kan treffen door aanzienlijke materiële of immateriële schade. ([Legiscope, 24u/72u-kader](https://www.legiscope.com/blog/nis2-incident-reporting.html)) Voor een OT-operator haalt een verstoring van een fysiek proces — een geactiveerd veiligheidssysteem, een stilgelegde productielijn, een verontreinigde watervoorziening — deze drempel met gemak.

Er is een wederkerige verplichting die het waard is te weten: het CSIRT of de bevoegde autoriteit moet reageren op de vroegtijdige waarschuwing **zonder onnodige vertraging en waar mogelijk binnen 24 uur**, inclusief eerste feedback en, op verzoek, operationeel advies. De melding is geen roepen in de leegte.

```timeline
T + 24 uur :: **Vroegtijdige waarschuwing** — meld of het incident vermoedelijk kwaadwillig is en of het grensoverschrijdende gevolgen kan hebben. Nog geen volledige analyse vereist.
T + 72 uur :: **Incidentmelding** — werk de waarschuwing bij met een eerste beoordeling van ernst en impact, plus indicatoren van compromittering (IoC's) voor zover beschikbaar.
Op verzoek :: **Tussentijds verslag** — een statusupdate wanneer de bevoegde autoriteit of het CSIRT daarom vraagt terwijl het incident nog loopt.
T + 1 maand :: **Eindverslag** — een gedetailleerde beschrijving, oorzaakanalyse, toegepaste mitigaties en de grensoverschrijdende impact.
Na afhandeling :: **Voortgangsverslag** — loopt het incident na één maand nog, dan volstaat een voortgangsverslag; het eindverslag volgt binnen één maand na afhandeling.
```

Het is essentieel om te begrijpen dat de klok start bij **bewustwording**, niet bij **oplossing**. U hoeft het incident op T+24u niet begrepen of ingeperkt te hebben — u moet het gemeld hebben. Dat verplaatst de last naar twee capaciteiten die OT-organisaties vaak missen: **detectie** die snel genoeg is om "bewustwording" binnen uren in plaats van weken te laten plaatsvinden, en een **geoefend meldproces** met vooraf ingevulde sjablonen en benoemde beslissers, zodat om drie uur 's nachts niemand hoeft uit te vogelen wie de autoriteit belt.

```svg
<svg viewBox="0 0 700 240" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, Helvetica, Arial, sans-serif">
  <rect x="0" y="0" width="700" height="240" fill="none"/>
  <!-- baseline -->
  <line x1="40" y1="120" x2="660" y2="120" stroke="#94a3b8" stroke-width="2"/>
  <polygon points="668,120 656,114 656,126" fill="#94a3b8"/>
  <!-- T0 -->
  <circle cx="70" cy="120" r="7" fill="#f97316"/>
  <text x="70" y="150" text-anchor="middle" fill="#e5e7eb" font-size="12" font-weight="700">Bewust worden</text>
  <text x="70" y="167" text-anchor="middle" fill="#94a3b8" font-size="10">klok start</text>
  <!-- 24h -->
  <circle cx="230" cy="120" r="7" fill="#3b82f6"/>
  <line x1="230" y1="120" x2="230" y2="60" stroke="#3b82f6" stroke-width="1.2" stroke-dasharray="3 3"/>
  <rect x="150" y="30" width="160" height="34" rx="6" fill="#3b82f6" fill-opacity="0.15" stroke="#3b82f6" stroke-width="1.2"/>
  <text x="230" y="48" text-anchor="middle" fill="#e5e7eb" font-size="12" font-weight="700">24u — Vroeg. waarschuwing</text>
  <text x="230" y="60" text-anchor="middle" fill="#94a3b8" font-size="9.5">kwaadwillig? grensoverschr.?</text>
  <!-- 72h -->
  <circle cx="400" cy="120" r="7" fill="#3b82f6"/>
  <line x1="400" y1="120" x2="400" y2="60" stroke="#3b82f6" stroke-width="1.2" stroke-dasharray="3 3"/>
  <rect x="320" y="30" width="160" height="34" rx="6" fill="#3b82f6" fill-opacity="0.15" stroke="#3b82f6" stroke-width="1.2"/>
  <text x="400" y="48" text-anchor="middle" fill="#e5e7eb" font-size="12" font-weight="700">72u — Melding</text>
  <text x="400" y="60" text-anchor="middle" fill="#94a3b8" font-size="9.5">ernst, impact, IoC's</text>
  <!-- 1 month -->
  <circle cx="600" cy="120" r="7" fill="#f97316"/>
  <line x1="600" y1="120" x2="600" y2="176" stroke="#f97316" stroke-width="1.2" stroke-dasharray="3 3"/>
  <rect x="510" y="176" width="180" height="40" rx="6" fill="#f97316" fill-opacity="0.15" stroke="#f97316" stroke-width="1.2"/>
  <text x="600" y="194" text-anchor="middle" fill="#e5e7eb" font-size="12" font-weight="700">1 maand — Eindverslag</text>
  <text x="600" y="208" text-anchor="middle" fill="#94a3b8" font-size="9.5">oorzaak · mitigaties</text>
  <!-- on request marker -->
  <text x="500" y="150" text-anchor="middle" fill="#94a3b8" font-size="10" font-style="italic">tussentijds verslag op verzoek</text>
</svg>
```

De 24-uursklok is onverbiddelijk, en begint te lopen zodra u *zich bewust wordt* — niet zodra u klaar bent met onderzoeken. Dat legt de nadruk op twee zaken: **detectie**, omdat een organisatie die een incident niet kan zien het niet kan melden; en een **geoefend meldproces**, omdat een team dat de melding nog nooit heeft geoefend er onder druk om drie uur 's nachts geen samenhangende melding uit zal krijgen. Bouw de sjablonen, benoem de besluitvormers, en oefen de drill voordat u hem nodig hebt.

## Governance: het bestuur staat op het spel

Artikel 20 is de culturele draaischijf van NIS2. Bestuursorganen van betrokken entiteiten moeten de risicobeheersmaatregelen **goedkeuren**, toezien op de **uitvoering** ervan, en kunnen **aansprakelijk worden gesteld** voor overtredingen. Leden van de leiding moeten ook **training volgen** om voldoende kennis te verwerven om risico's te herkennen en beheerpraktijken te beoordelen, en worden geacht vergelijkbare training aan te bieden aan het personeel. ([ISMS.online, Artikel 34](https://www.isms.online/nis-2/articles/34-administrative-fines-for-non-compliance/))

In gewone taal: cybersecurity is niet langer iets dat een bestuur naar beneden kan delegeren en vergeten. Bestuurders zijn er verantwoordelijk voor. In ernstige, herhaalde gevallen en voor essentiële entiteiten voorzien verschillende lidstaten in **tijdelijke verboden op het uitoefenen van bestuursfuncties** voor de verantwoordelijke personen. Dit is bewust zo. De EU heeft geconcludeerd dat beveiligingsinvesteringen verantwoordelijkheid volgen — en dat de zekerste manier om investeringen in het minder glamoureuze OT-beveiligingsdomein op peil te houden, is door de mensen die het budget beheren, verantwoordelijk te maken voor het resultaat.

### Wat een bestuur daadwerkelijk moet doen

Goedkeuring en toezicht zijn geen handtekening onder een dia. Om de verplichting van Artikel 20 geloofwaardig na te komen, heeft een bestuursorgaan nodig:

- Een **beslissingsklaar beeld van operationeel risico** — geen stapel technische rapporten, maar een beeld dat helder genoeg is om maatregelen weloverwogen goed te keuren.
- Bewijs dat maatregelen **geïmplementeerd en effectief** zijn, met regelmaat vernieuwd, zodat het toezicht continu is in plaats van jaarlijks.
- Een **benoemde eindverantwoordelijke bestuurder** en een rapportagelijn die materieel OT-risico zonder vertaalverlies onder de aandacht van het bestuur brengt.
- **Gedocumenteerde training** voor bestuursleden, en een vastlegging van de risicobesluiten die het bestuur heeft bekrachtigd — want wanneer een toezichthouder of rechter vraagt "wist het bestuur ervan?", ligt het antwoord in de notulen.

## Toezicht en handhaving

De twee categorieën lopen hier uiteen. **Essentiële entiteiten** krijgen te maken met proactief, *ex ante* toezicht: autoriteiten kunnen audits, inspecties, beveiligingsscans en gerichte informatieverzoeken uitvoeren zonder dat daarvoor eerst bewijs van een probleem nodig is. **Belangrijke entiteiten** krijgen te maken met *ex post* toezicht: autoriteiten treden op wanneer er bewijs of een aanwijzing van niet-naleving is. ([nis-2-directive.com, Artikel 34](https://www.nis-2-directive.com/NIS_2_Directive_Article_34.html))

De bevoegdheden van autoriteiten nemen toe in zwaarte. Zij kunnen **waarschuwingen** geven, **bindende instructies** uitvaardigen, een entiteit bevelen **tekortkomingen te verhelpen** of **gedrag te staken**, melding aan getroffen partijen vereisen, en — voor essentiële entiteiten in ernstige gevallen — een **toezichthouder** aanstellen of **tijdelijke opschorting van certificeringen of bestuursfuncties** vorderen. Boetes onder Artikel 34 komen **bovenop** deze maatregelen, niet in plaats daarvan. Entiteiten behouden hun procedurele rechten: een hoorzitting, de mogelijkheid om verzachtend bewijs te overleggen, en een beroepsmogelijkheid.

## Sancties

Artikel 34 stelt de bovengrenzen voor bestuurlijke boetes vast. ([nis-2-directive.com, Artikel 34](https://www.nis-2-directive.com/NIS_2_Directive_Article_34.html))

| Type entiteit | Bovengrens boete | Structuur |
| --- | --- | --- |
| **Essentiële entiteiten** | Maximaal ten minste **€10.000.000 of 2%** van de totale wereldwijde jaaromzet | Welk bedrag ook **hoger** is |
| **Belangrijke entiteiten** | Maximaal ten minste **€7.000.000 of 1,4%** van de totale wereldwijde jaaromzet | Welk bedrag ook **hoger** is |

Dit zijn bovengrenzen, geen tarieven. Werkelijke boetes moeten **doeltreffend, evenredig en afschrikwekkend** zijn, beoordeeld tegen de aard, ernst en duur van de overtreding, de mate van verwijtbaarheid, en of de entiteit heeft meegewerkt. Maar de aan de omzet gekoppelde structuur — bekend van de AVG — geeft een duidelijk signaal af. Niet-naleving is bedoeld als een financieel risico op bestuursniveau, geen afrondingsverschil.

Reken het na voor een middelgrote groep met een omzet van €800 miljoen: 2% is €16 miljoen, ruim boven de vloer van €10 miljoen, dus geldt het hogere bedrag. Voor een onderneming met €4 miljard omzet is 2% gelijk aan €80 miljoen. Het percentage grijpt precies daar in waar de vaste bovengrens anders triviaal zou zijn — en dat is precies de bedoeling.

```keyfacts
Bovengrens essentieel :: €10 mln of 2% wereldwijde omzet (hoogste geldt)
Bovengrens belangrijk :: €7 mln of 1,4% wereldwijde omzet (hoogste geldt)
Toetssteen boete :: doeltreffend, evenredig én afschrikwekkend
Boven op boetes :: bindende instructies, staken van gedrag, toezichthouder
Uiterste maatregel :: tijdelijke schorsing van bestuurder/certificering (Art. 32(5))
Persoonlijk risico :: bestuurders aansprakelijk voor toezichttekort (Art. 20)
```

De boete is niet de zwaarste hefboom in het arsenaal. Voor **essentiële entiteiten** kan een toezichthouder onder **Artikel 32(5)**, wanneer andere handhavingsmaatregelen zijn uitgeput, om een rechterlijke of administratieve maatregel vragen die de **certificering of vergunning voor een deel of het geheel van de diensten opschort**, en — scherper nog — een **natuurlijke persoon met bestuurs- of vertegenwoordigingsbevoegdheid (een CEO of wettelijk vertegenwoordiger) tijdelijk verbieden bestuursfuncties uit te oefenen**. Dat is een sanctie tegen de persoon, niet alleen de rechtspersoon. In samenhang met de aansprakelijkheid van Artikel 20 is de boodschap ondubbelzinnig: aanhoudende, verwijtbare niet-naleving kan de baan van een bestuurder kosten, niet slechts een regel op de winst-en-verliesrekening. In Nederland wordt deze handhavingsarchitectuur belegd via de Cyberbeveiligingswet en de aangewezen sectorale toezichthouders.

```cta
€10 miljoen of 2% van de omzet — plus persoonlijke aansprakelijkheid voor uw bestuur.
NIS2-boetes raken de organisatie én haar leiding. Wij vertalen de tien maatregelen naar een verdedigbaar, bestuursklaar OT-beveiligingsprogramma.
Toets mijn NIS2-blootstelling :: /nl/contact
```

## Waar de wet de fabrieksvloer raakt

NIS2 gebruikt nergens de woorden "PLC" of "SCADA," maar de allgevaren-, risicogebaseerde eisen komen recht op OT neer. Drie spanningsvelden verdienen het om eerlijk te worden benoemd.

### De IT/OT-prioriteitsomkering

In IT luidt de beveiligingstriade vertrouwelijkheid, integriteit, beschikbaarheid — bescherm eerst de gegevens. In OT keert dit om: **veiligheid, dan beschikbaarheid, dan integriteit, dan vertrouwelijkheid.** Een handeling die in IT routine is — een patch afdwingen, een verbinding verbreken, een server herstarten — kan onaanvaardbaar zijn naast een lopend proces, waar de eerste plicht is dat niemand gewond raakt en de tweede dat de fabriek blijft draaien.

```svg
<svg viewBox="0 0 700 170" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, Helvetica, Arial, sans-serif">
  <rect x="0" y="0" width="700" height="170" fill="none"/>
  <text x="30" y="30" fill="#94a3b8" font-size="13" font-weight="700">IT-prioriteit</text>
  <rect x="150" y="14" width="120" height="30" rx="6" fill="#3b82f6" fill-opacity="0.15" stroke="#3b82f6"/>
  <text x="210" y="34" text-anchor="middle" fill="#e5e7eb" font-size="12">Vertrouwelijkheid</text>
  <rect x="290" y="14" width="120" height="30" rx="6" fill="#3b82f6" fill-opacity="0.12" stroke="#3b82f6"/>
  <text x="350" y="34" text-anchor="middle" fill="#e5e7eb" font-size="12">Integriteit</text>
  <rect x="430" y="14" width="120" height="30" rx="6" fill="#3b82f6" fill-opacity="0.10" stroke="#3b82f6"/>
  <text x="490" y="34" text-anchor="middle" fill="#e5e7eb" font-size="12">Beschikbaarheid</text>
  <text x="620" y="34" fill="#94a3b8" font-size="11">hoogste → laagste</text>
  <line x1="30" y1="70" x2="670" y2="70" stroke="#94a3b8" stroke-width="0.75" stroke-dasharray="4 4"/>
  <text x="30" y="110" fill="#f97316" font-size="13" font-weight="700">OT-prioriteit</text>
  <rect x="110" y="94" width="100" height="30" rx="6" fill="#f97316" fill-opacity="0.20" stroke="#f97316"/>
  <text x="160" y="114" text-anchor="middle" fill="#e5e7eb" font-size="12">Veiligheid</text>
  <rect x="222" y="94" width="110" height="30" rx="6" fill="#f97316" fill-opacity="0.16" stroke="#f97316"/>
  <text x="277" y="114" text-anchor="middle" fill="#e5e7eb" font-size="12">Beschikbaarheid</text>
  <rect x="344" y="94" width="100" height="30" rx="6" fill="#f97316" fill-opacity="0.12" stroke="#f97316"/>
  <text x="394" y="114" text-anchor="middle" fill="#e5e7eb" font-size="12">Integriteit</text>
  <rect x="456" y="94" width="130" height="30" rx="6" fill="#f97316" fill-opacity="0.08" stroke="#f97316"/>
  <text x="521" y="114" text-anchor="middle" fill="#e5e7eb" font-size="12">Vertrouwelijkheid</text>
  <text x="620" y="114" fill="#94a3b8" font-size="11">hoogste → laagste</text>
  <text x="350" y="152" text-anchor="middle" fill="#94a3b8" font-size="11" font-style="italic">NIS2's evenredigheidsbeginsel biedt ruimte voor deze omkering — mits u ze kunt onderbouwen</text>
</svg>
```

Het evenredigheidsbeginsel van NIS2 biedt ruimte voor deze omkering, maar alleen als u de operationele beperkingen en de compensatiemaatregelen die u in plaats daarvan gebruikt, kunt *onderbouwen*. "We kunnen niet patchen tijdens een campagne, dus doen we X, Y en Z" is een verdedigbaar standpunt. Stilte is dat niet.

### U kunt niet beheren wat u niet ziet

De eerste maatregel van Artikel 21 is risicoanalyse, en risicoanalyse veronderstelt een asset-inventaris. In de praktijk is het meest voorkomende hiaat dat OXOT aantreft dat operators geen actueel, gestructureerd beeld hebben van hun OT-omgeving — welke apparaten er zijn, hoe deze verbonden zijn, welke blootgesteld zijn, en welke een veiligheidsfunctie beschermen. Onder NIS2 is dat hiaat niet langer alleen operationele achterstand; het is een compliance-risico, omdat u geen evenredige maatregelen kunt aantonen over een omgeving die u niet kunt beschrijven.

### IEC 62443 is het technische antwoord

NIS2 vertelt u *welke* uitkomsten u moet bereiken; het schrijft niet voor *hoe*. De reeks [IEC 62443](/nl/iec-62443) — de internationale norm voor de beveiliging van industriële automatiserings- en besturingssystemen — biedt het hoe: **zones en conduits, beveiligingsniveaus, en een levenscyclus** voor het bouwen en beheren van veilige besturingssystemen. Voor de spoor- en infrastructuurwereld breidt [TS 50701](/nl/ts-50701) dezelfde denkwijze uit. Het afstemmen van uw NIS2-aanpak op IEC 62443 geeft u een verdedigbare, internationaal erkende methode om aan te tonen dat uw maatregelen passend en evenredig zijn. De twee vullen elkaar aan: **NIS2 is de wettelijke verplichting; IEC 62443 is het technische antwoord.**

### Hoe de tien maatregelen zich verhouden tot IEC 62443

| Maatregel Artikel 21 | Waar IEC 62443 een antwoord biedt |
| --- | --- |
| Risicoanalyse & beleid | 62443-3-2 risicobeoordeling; 62443-2-1 beveiligingsprogramma |
| Incidentbehandeling | 62443-2-1 en 62443-3-3 detectie-/responsvereisten (FR 6) |
| Bedrijfscontinuïteit & herstel | 62443-2-1 continuïteit; 62443-3-3 beschikbaarheid van middelen (FR 7) |
| Beveiliging toeleveringsketen | 62443-2-4 vereisten voor dienstverleners; 62443-4-1 veilige ontwikkeling |
| Verwerving, ontwikkeling & onderhoud | 62443-4-1 veilige productlevenscyclus; 62443-4-2 componentvereisten |
| Effectiviteitsbeoordeling | 62443-2-1 audit en metrieken; beveiligingsverificatie uitvoeren |
| Cyberhygiëne & training | 62443-2-1 beleid; 62443-2-4 competentie |
| Cryptografie | 62443-3-3 vertrouwelijkheid van gegevens (FR 4) en integriteit (FR 3) |
| Toegangsbeheer & assetbeheer | 62443-3-3 identificatie/authenticatie (FR 1) en gebruikscontrole (FR 2) |
| MFA & beveiligde communicatie | 62443-3-3 FR 1/FR 2; zone-en-conduit beperkte datastromen (FR 5) |

Voor gerelateerde en aanpalende verplichtingen — de [CRA](/nl/cra), de [AI-verordening](/nl/ai-act), de [Machineverordening](/nl/machine-act) — zie ons overzicht van [kaders](/nl/frameworks) en hoe deze op elkaar aansluiten.

## Sectorspecifieke aandachtspunten

De verplichtingen zijn gemeenschappelijk, maar de drukpunten verschillen. Enkele sectorspecifieke realiteiten die OXOT herhaaldelijk tegenkomt:

- **Energie en nutsbedrijven.** Onderstationsautomatisering, DER-aggregatie en SCADA op afstand maken beschikbaarheid de allesoverheersende zorg. Verouderde protocollen en lange levensduur van assets botsen met de patch- en hygiëneverwachtingen van Artikel 21. Leverancierstoegang op afstand is alomtegenwoordig en onvoldoende beheerst.
- **Drinkwater en afvalwater.** Vaak weinig personeel, wijde geografische spreiding, duizenden locaties op afstand. Een significant incident kan hier een gebeurtenis voor de volksgezondheid betekenen, dus de "aanzienlijke schade"-toets van Artikel 23 wordt gemakkelijk gehaald. Zichtbaarheid van assets over verspreide telemetrie is het lastigste onderdeel.
- **Chemie en procesindustrie.** Veiligheidsinstrumentatiesystemen en functionele-veiligheidsregimes domineren. Cybersecurity moet worden verzoend met procesveiligheid, niet ernaast worden geplakt — een natuurlijke fit voor de risicogebaseerde zones van IEC 62443.
- **Industriële productie (Bijlage II).** Platte netwerken, samengevoegde IT/OT, en machines die met hun eigen [CRA](/nl/cra)- en [Machineverordening](/nl/machine-act)-verplichtingen binnenkomen. De verrassing over de reikwijdte is reëel: veel fabrikanten ontdekten pas recent dat zij belangrijke entiteiten zijn.
- **Productie en distributie van levensmiddelen.** Integriteit van de koudeketen, hoogvolumelijnen en dunne marges maken uitvaltijd duur en veiligheidsrelevant. Herstel-testen van lijnbesturingen is vaak de verwaarloosde beheersmaatregel.

## Een praktisch stappenplan

Er is geen snelle route, maar er is een verstandige volgorde. Voer dit uit als een programma met fasen, niet als een eenmalig project.

| Fase | Focus | Belangrijkste opleveringen |
| --- | --- | --- |
| **0. Status bevestigen** | Bent u essentieel of belangrijk onder uw nationale wetgeving? | Reikwijdtebepaling; registratie waar vereist |
| **1. De omgeving in kaart brengen** | Het asset- en risicobeeld opbouwen | Gestructureerde OT-inventaris; connectiviteitskaart; markeringen voor blootstelling en veiligheidskritikaliteit |
| **2. Beoordelen t.o.v. Art. 21** | Huidige situatie afzetten tegen de tien maatregelen | Gapanalyse geprioriteerd naar operationeel risico, niet naar ruwe CVSS |
| **3. Meldvermogen opbouwen** | Art. 23 inrichten en oefenen | Sjablonen, beslissingsbevoegdheden, een geteste 24u/72u/1-maand-drill |
| **4. Saneren in golven** | Gaten dichten, afgestemd op IEC 62443 | Geprioriteerde, evenredige, operationeel realistische uitrol van beheersmaatregelen |
| **5. Aantonen & borgen** | Effectiviteit aantonen en onderhouden | Test-/auditritme; levend bewijsdossier; rapportage aan het bestuur |

> [!NOTE]
> Verschillende lidstaten leggen **registratieverplichtingen** op met hun eigen termijnen, los van de inhoudelijke verplichtingen. Het bevestigen van de status (Fase 0) is geen bureaucratische formaliteit — mis een registratievenster en u kunt non-compliant zijn nog voordat u ook maar één technische beheersmaatregel hebt aangeraakt.

## Wat het betekent voor uw rol

**Als u CISO of beveiligingsverantwoordelijke bent,** verlengt NIS2 uw mandaat over de IT/OT-grens heen en vraagt bewijs, geen bewering. U zult worden gevraagd uw risicobeeld, uw maatregelen en de effectiviteit ervan te tonen — voor omgevingen die u mogelijk niet volledig beheerst en waarvan de eigenaren een andere taal spreken. Uw hefboom is een gedeeld, gestructureerd beeld van OT-risico dat engineering vertrouwt en het bestuur kan lezen.

**Als u een fabrieks- of operationsmanager bent,** moeten beveiligingsbeslissingen nu worden verzoend met de productie- en veiligheidsrealiteit, en bent u een belanghebbende bij — niet een toeschouwer van — de risicobeoordeling. Het voordeel: een echt risicogebaseerde aanpak beschermt u tegen onevenredige, verstorende maatregelen die van bovenaf worden opgelegd door mensen die nooit op uw fabrieksvloer hebben gestaan.

**Als u in het bestuur of de directie zit,** maakt NIS2 cybersecurity tot een benoemde governanceplicht met persoonlijke blootstelling. U hebt voldoende zicht nodig om maatregelen weloverwogen goed te keuren en erop toe te zien — wat betekent dat u moet aandringen op een helder, beslissingsklaar beeld van operationeel risico, gedocumenteerde training, en een vastlegging van wat u hebt bekrachtigd en wanneer.

**Als u werkzaam bent in compliance of juridische zaken,** introduceert NIS2 harde termijnen en aan de omzet gekoppelde sancties. U hebt het meldproces geoefend nodig en het bewijsdossier onderhouden, want het verschil tussen een verdedigbare positie en een boete is vaak documentatie die u wel of niet hebt bijgehouden.

## Hoe OXOT helpt

OXOT is precies hiervoor gebouwd: gefragmenteerde OT-beveiligingsbevindingen omzetten in heldere, verdedigbare besluiten. Onze **OT-beveiligingsassessments** leggen het asset- en risicobeeld vast dat NIS2 veronderstelt dat u al hebt. Onze [Cyber Digital Twin](/nl/cyber-digital-twin) verenigt documentatie, netwerkgegevens, asset-inventarissen en tooloutput in één gestructureerd model, zodat u Artikel 21-hiaten kunt prioriteren op basis van werkelijk operationeel risico en uw redenering kunt tonen aan een auditor, een bestuur of een toezichthouder. Onze **OT-beveiligingsprogramma's** leveren sanering in evenredige, [IEC 62443](/nl/iec-62443)-afgestemde golven, en onze **kennisoverdracht** zorgt ervoor dat de kennis bij uw team blijft nadat wij zijn vertrokken.

Wij zijn OT-eerst, risicogebaseerd, en gebouwd op het uitgangspunt van Europese digitale soevereiniteit — uw data en uw model blijven van u. NIS2 beloont organisaties die kunnen aantonen dat zij hun risico doelbewust begrijpen en beheren. Dat is precies waar onze werkwijze om draait.

## Veelgestelde vragen

**Is NIS2 rechtstreeks van toepassing, of via nationale wetgeving?**
Via nationale wetgeving. NIS2 is een richtlijn, omgezet door elke lidstaat. Controleer altijd uw nationale wet — verschillende landen stellen strengere of bredere eisen dan de basis van de richtlijn. In Nederland is de relevante wet de Cyberbeveiligingswet.

**We hebben de termijn van 17 oktober 2024 gemist — wat nu?**
Die termijn gold voor *lidstaten* om wetgeving vast te stellen, niet als respijtperiode voor entiteiten. De verplichtingen gelden zodra uw nationale wet van kracht is. Geef prioriteit aan het bevestigen van uw status, het inrichten van het meldproces, en het opbouwen van het risicobeeld, en saneer vervolgens in geprioriteerde golven. Waar de wet van uw lidstaat vertraging heeft, gebruik de tijd om gereed te zijn in plaats van te wachten.

**Hoe weet ik of ik essentieel of belangrijk ben?**
Controleer uw sector tegen Bijlage I (essentieel-georiënteerd, hoogkritiek) en Bijlage II (belangrijk), pas dan de omvangsregel toe — over het algemeen 50+ werknemers of €10 miljoen+ omzet — en let op de omvangsonafhankelijke uitzonderingen (DNS, TLD-registers, vertrouwensdiensten, openbare elektronische communicatie). Bevestig dit vervolgens tegen uw nationale omzetting, die de bindende tekst is.

**Is een firewall tussen IT en OT voldoende?**
Nee. Segmentatie is belangrijk, maar Artikel 21 omvat governance, toeleveringsketen, toegangsbeheer, incidentbehandeling, continuïteit, cryptografie en meer. Eén enkele beheersmaatregel kan niet voldoen aan een risicobeheerverplichting, en een toezichthouder die de evenredigheid beoordeelt, kijkt naar het gehele programma.

**Wat telt als een "significant" incident dat ik moet melden?**
Een incident dat ernstige operationele verstoring of financiële schade heeft veroorzaakt of kan veroorzaken, of aanzienlijke materiële of immateriële schade aan anderen. In OT zullen de meeste gebeurtenissen die een fysiek proces verstoren — veiligheidstrips, stilgelegde lijnen, verontreiniging — hieraan voldoen. Meld bij twijfel; de 24-uurs vroegtijdige waarschuwing is bewust laagdrempelig gehouden.

**Hoe verhoudt NIS2 zich tot de CRA en IEC 62443?**
NIS2 verplicht *operators* om het risico van de systemen die zij gebruiken te beheren. De [Cyber Resilience Act](/nl/cra) verplicht *fabrikanten* om beveiliging in te bouwen in producten met digitale elementen. [IEC 62443](/nl/iec-62443) geeft operators en leveranciers de technische methode om beide te doen. Zij versterken elkaar in plaats van te concurreren.

**Kunnen bestuursleden echt persoonlijk aansprakelijk worden gesteld?**
Ja. Artikel 20 vereist dat de leiding de maatregelen goedkeurt en erop toeziet, en maakt het mogelijk dat zij aansprakelijk wordt gesteld voor tekortkomingen. Verschillende lidstaten voorzien, voor essentiële entiteiten, in tijdelijke verboden op het uitoefenen van bestuursfuncties in ernstige, herhaalde gevallen. Gedocumenteerd toezicht en training zijn uw bescherming.

## Bronnen

- Richtlijn (EU) 2022/2555 (NIS2), volledige tekst — [EUR-Lex, CELEX 32022L2555](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32022L2555)
- Artikel 3, essentiële en belangrijke entiteiten — [nis-2-directive.com](https://www.nis-2-directive.com/NIS_2_Directive_Article_3.html)
- Artikel 21, cybersecurity-risicobeheersmaatregelen — [nis-2-directive.com](https://www.nis-2-directive.com/NIS_2_Directive_Article_21.html) · [nis2-info.eu](https://www.nis2-info.eu/article-21-cybersecurity-risk-management-measures/)
- Artikel 23, meldverplichtingen & 24u/72u/1-maand-tijdlijn — [nis-2-directive.com](https://www.nis-2-directive.com/NIS_2_Directive_Article_23.html) · [Legiscope](https://www.legiscope.com/blog/nis2-incident-reporting.html)
- Artikel 34, bestuurlijke boetes — [nis-2-directive.com](https://www.nis-2-directive.com/NIS_2_Directive_Article_34.html) · [ISMS.online](https://www.isms.online/nis-2/articles/34-administrative-fines-for-non-compliance/)
- Essentiële versus belangrijke entiteiten, reikwijdte en omvangsregel — [Glocert](https://www.glocertinternational.com/resources/guides/nis2-applicability-essential-vs-important-entities/) · [Legiscope](https://www.legiscope.com/blog/nis2-essential-important-entities.html)
- Omzettingsstatus en handhaving door de Commissie — [Europese Commissie](https://digital-strategy.ec.europa.eu/en/policies/nis-transposition) · [ECSO-tracker](https://ecs-org.eu/activities/nis2-directive-transposition-tracker/)
- Nederlandse Cyberbeveiligingswet (Cbw) ter implementatie van NIS2 — [Bird & Bird](https://www.twobirds.com/en/insights/2026/netherlands/dutch-parliament-approves-cybersecurity-act-implementing-nis2)

*Deze pagina bevat algemene informatie over EU-wetgeving en vormt geen juridisch advies. Bevestig hoe NIS2 op uw organisatie van toepassing is aan de hand van uw nationale omzettingswet en, waar nodig, gekwalificeerd juridisch advies.*
