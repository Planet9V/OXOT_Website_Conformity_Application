#!/usr/bin/env python3
"""
Comprehensive CRA Primer Update Script
Updates Regulation (EU) 2024/2847 Primer content across:
1. artifacts/api-server/src/scripts/seedCustomerSite.ts
2. artifacts/api-server/src/content/snapshot/site-content.json
3. Live PostgreSQL database (pages and page_sections tables)
"""

import json
import os
import subprocess

# CRA citations are resolved and validated against the Official Journal corpus.
# See docs/cra-personas/CRA_SOURCE_OF_TRUTH.md — do not hand-type article numbers.
import sys as _sys, pathlib as _pathlib
_sys.path.insert(0, str(_pathlib.Path(__file__).resolve().parent))
from cra_corpus import cite, article_title, check_text, write_checked  # noqa: F401

EN_TITLE = "The EU Cyber Resilience Act — Comprehensive Regulatory & Engineering Primer"
EN_SEO_TITLE = "EU CRA Primer | Comprehensive Guide to Regulation (EU) 2024/2847"
EN_SEO_DESC = "Authoritative technical and statutory primer on the EU Cyber Resilience Act (Regulation (EU) 2024/2847): scope, 4-tier classification, Annex I essential requirements, Article 14 clocks, and conformity assessment."
EN_EXCERPT = "Regulation (EU) 2024/2847 establishes mandatory cybersecurity requirements as an ex-ante market-access condition for all products with digital elements placed on the EU market. This primer provides the complete statutory architecture, risk tiers, essential requirements, reporting timelines, and conformity assessment routes."

EN_MARKDOWN = """## Statutory Foundation & Regulatory Architecture

The **Cyber Resilience Act (Regulation (EU) 2024/2847)** is the European Union's foundational regulation establishing horizontal cybersecurity requirements for hardware and software products. Formally adopted by the European Parliament and Council on 23 October 2024, published in the Official Journal of the European Union on 20 November 2024 (OJ L 2024/2847), and entered into force on 10 December 2024, the CRA fundamentally alters European product law.

Prior to the CRA, European cybersecurity legislation primarily addressed critical infrastructure operators (NIS/NIS2 Directive) or specific consumer radio devices (Radio Equipment Directive delegated acts). The CRA introduces an **ex-ante market-access regime**: cybersecurity is no longer a post-incident liability issue or a voluntary best practice—it is a non-negotiable legal prerequisite for placing products on the EU Single Market and affixing the **CE mark**.

> [!IMPORTANT]
> **Statutory Citation:** Regulation (EU) 2024/2847 of the European Parliament and of the Council on horizontal cybersecurity requirements for products with digital elements and amending Regulations (EU) No 168/2013 and (EU) 2019/1020 and Directive (EU) 2020/1828. Consult the full legal text in the [CRA Legal Wiki](/wiki/cra).

---

## Scope of Application: Products with Digital Elements

The CRA applies across the entire supply chain to all **Products with Digital Elements (PDEs)** placed on the EU market, irrespective of whether the manufacturer is established within the Union or in a third country (Article 2(1)).

### 1. Statutory Definitions

- **Product with Digital Elements (Article 3(1)):** Any software or hardware product and its remote data processing solutions, including software or hardware components being placed on the market separately.
- **Data Connection (Article 3(9) & Recital 12):** Any logical or physical data connection through which data can be transferred, processed, or communicated, including wireless interfaces (Wi-Fi, Bluetooth, cellular, Zigbee), wired network interfaces (Ethernet, Industrial Ethernet, CAN bus, Modbus, RS-485), and direct physical bus connections (USB, PCIe, JTAG).
- **Remote Data Processing (Article 3(2)):** Any data processing at a distance for which the software is designed and developed by the manufacturer, or under the manufacturer's control, the absence of which would prevent the PDE from performing one of its primary functions (e.g., cloud control planes, companion telemetry backends, mobile companion applications).

### 2. Statutory Exclusions & Lex Specialis Carve-Outs

The CRA explicitly excludes products governed by established sectoral safety and cybersecurity legislation (Article 2(2)–(4)):

| Product Category | Governing EU Regulation | CRA Status |
| :--- | :--- | :--- |
| **Medical Devices & IVDs** | Regulation (EU) 2017/745 (MDR) & 2017/746 (IVDR) | Excluded (Lex Specialis) |
| **Civil Aviation Systems** | Regulation (EU) 2018/1139 | Excluded (Lex Specialis) |
| **Motor Vehicles & Components** | Regulation (EU) 2019/2144 | Excluded (Lex Specialis) |
| **Defense & National Security** | Products developed exclusively for national security or military defense | Excluded (Article 2(5)) |
| **Open-Source Software** | Free and open-source software developed or supplied outside the course of a commercial activity | Excluded (Recitals 18–21) |
| **Pure Cloud SaaS** | Cloud services independent of a physical or standalone software product | Governed by NIS2 / DORA |

> [!NOTE]
> Review all 76 official European Commission scope determinations in our [Official EU CRA FAQ Directory](/faq).

---

## The 4-Tier Risk Classification Architecture

The CRA classifies products into four distinct regulatory tiers based on their cybersecurity risk profile, their intended functionality, and the systemic impact of potential exploitation (Articles 6 & 7, Annexes III & IV).

| Classification Tier | Regulatory Basis | Typical Product Types | Conformity Assessment Route |
| :--- | :--- | :--- | :--- |
| **Standard PDEs** *(~90% of Market)* | Default (Article 6(1)) | Smart sensors, connected consumer devices, office peripherals, general software tools, industrial monitoring gauges | **Module A** *(Internal Production Control / Self-Assessment)* |
| **Important Class I** | Annex III | Identity management systems, standalone web browsers, password managers, antivirus software, network interfaces, SIEM tools, microcontrollers/microprocessors | **Module A** (if harmonised standards applied) **OR Module B+C / Module H** *(Notified Body)* |
| **Important Class II** | Annex IV | Hypervisors, firewalls, tamper-resistant chips, industrial automation PLCs, SCADA gateways, secure cryptoprocessors | **Mandatory Third-Party:** **Module B+C** *(EU-Type Examination)* **OR Module H** *(Full QA)* |
| **Critical Products** | Article 7 & Annex IV (Sec 2) | Hardware security modules (HSMs), smart meter gateways, advanced critical infrastructure controllers | **Mandatory European Cybersecurity Certificate** (under ENISA EUCC scheme at Level HIGH) |

```
┌────────────────────────────────────────────────────────────────────────┐
│                   CRA 4-TIER RISK CLASSIFICATION                       │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  CRITICAL PDEs (Art 7) ──────────────► Mandatory EUCC Certificate     │
│  (HSMs, Smart Meter Gateways)          (High Assurance Level)          │
│                                                                        │
│  IMPORTANT CLASS II (Annex IV) ──────► Mandatory Notified Body Audit  │
│  (PLCs, Firewalls, Hypervisors)        (Module B+C or Module H)        │
│                                                                        │
│  IMPORTANT CLASS I (Annex III) ──────► Harmonised Standards / Module A │
│  (ID Management, Password Mgrs, SIEM)  (Fallback to Notified Body)     │
│                                                                        │
│  STANDARD PDEs (Default, ~90%) ──────► Module A Self-Assessment        │
│  (Connected Sensors, Apps, General SW) (Internal Production Control)   │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Annex I Essential Cybersecurity Requirements

All PDEs placed on the EU market must satisfy the **Essential Requirements** set out in Annex I. These requirements are divided into two mandatory pillars:

### Pillar 1: Security by Design & Lifecycle Properties (Annex I, Part I)

1. **Security by Default (Requirement 1):** Products must be delivered with a secure baseline configuration. Factory-default passwords are prohibited; unique per-device credentials or mandatory first-boot credential changes are required. Unnecessary ports, protocols, and interfaces must be disabled by default.
2. **Data Protection & Cryptography (Requirements 2 & 3):** Confidentiality and integrity of data at rest, in transit, and in processing must be protected using state-of-the-art cryptographic mechanisms.
3. **Attack Surface Minimisation (Requirement 4):** Interfaces must be restricted to essential functions, applying the principle of least privilege across all hardware and software components.
4. **Exploitation Mitigation & Memory Safety (Requirement 5):** Products must incorporate modern mitigation techniques (e.g., address space layout randomization, buffer overflow protection, structured exception handling) to limit the impact of potential vulnerabilities.
5. **Security Logging & Monitoring (Requirement 6):** Products must record relevant security events (access attempts, privilege changes, configuration modifications) with tamper-resistant audit logs.

### Pillar 2: Vulnerability Handling & Supply Chain Transparency (Annex I, Part II)

1. **Software Bill of Materials (SBOM) (Requirement 1):** Manufacturers must identify and document all components, libraries, and dependencies included in the product—including top-level and transitive dependencies—in a machine-readable format (e.g., CycloneDX or SPDX).
2. **Coordinated Vulnerability Disclosure (CVD) (Requirement 2):** Manufacturers must establish and publish a transparent vulnerability disclosure policy, including a designated contact address (e.g., `security.txt`) for security researchers.
3. **Due Diligence in Component Integration (Article 13(6)):** Manufacturers must conduct rigorous due diligence when integrating third-party and open-source software, verifying that components do not contain known exploitable vulnerabilities.
4. **Timely, Free Security Updates (Requirements 3 & 4):** Security patches and updates must be made available promptly and free of charge throughout the entire determined support period (Article 13(8)), and must be delivered separately from feature enhancements.

---

## Economic Operator Obligations & Article 21 Liabilities

The CRA establishes clear, differentiated legal responsibilities across all economic operators in the supply chain (Chapter II, Articles 13–24):

### 1. Manufacturers (Article 13)

- **Lifecycle Risk Assessment:** Conduct and document a comprehensive cybersecurity risk assessment before placing the product on the market (Article 13(2)).
- **Technical File Preservation:** Maintain the complete Annex VII Technical Documentation for **10 years** after the product has been placed on the market, or for the duration of the support period, whichever is longer (Article 13(4)).
- **Support Period Determination:** Explicitly determine and state the support period (minimum of 5 years unless product lifecycle is shorter) during which security updates will be provided (Article 13(8)).
- **EU Declaration of Conformity & CE Mark:** Draw up the legal Declaration of Conformity (Annex V) and affix the CE marking visibly and legibly (Article 13(15)–(16)).

### 2. Importers (Article 17) & Distributors (Article 18)

- **Verification Mandate:** Must verify that the manufacturer has completed the appropriate conformity assessment, compiled the technical file, and affixed the CE mark.
- **Duty to Refrain (Article 18(2)):** If an importer or distributor knows or has reason to believe that a product does not comply with Annex I, they **must not** place or make the product available on the market until it is brought into conformity.

### 3. Substantial Modification & System Integrators (Article 21)

> [!WARNING]
> **The Article 21 Integrator Trap:** Any natural or legal person that carries out a **substantial modification** to a PDE—such as modifying software architecture, altering security parameters, or retrofitting legacy equipment—is legally deemed the **Manufacturer** under Article 21. They assume full liability for CRA conformity, Annex VII technical documentation, and CE re-certification.
>
> Learn more in our technical memorandum: [The 2-Year Lag: Why Turnkey Contracts Face Article 21 Traps](/blog/ep-01-the-2-year-lag-why-2024-contracts-are-walking-into-a-2027-regulatory-trap).

### 4. Open-Source Software Stewards (Article 24)

Entities that provide sustained support for the development of open-source software intended for commercial activities without themselves being commercial manufacturers are classified as **Open Source Software Stewards**. They are subject to a tailored, proportionate governance framework focusing on coordinated vulnerability disclosure and security cooperation rather than full manufacturing liability.

---

## Article 14 Mandatory Incident & Exploit Reporting Clocks

Article 14 establishes strict, legally binding timelines for notifying competent authorities when security incidents or active exploits occur. Notifications are submitted via the ENISA Single Reporting Platform to both the national Computer Security Incident Response Team (CSIRT) and ENISA.

```
┌────────────────────────────────────────────────────────────────────────┐
│               ARTICLE 14 STATUTORY REPORTING TIMELINES                 │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  [Hour 0] ── Awareness of Active Exploit or Severe Incident            │
│     │                                                                  │
│  [Hour 24] ──► EARLY WARNING NOTIFICATION (Art 14(1)(a) / 14(3)(a))     │
│     │          - Exploit indicator, suspected severity, initial scope  │
│     │                                                                  │
│  [Hour 72] ──► DETAILED INCIDENT NOTIFICATION (Art 14(1)(b) / 14(3)(b))│
│     │          - General description, risk assessment, mitigations     │
│     │                                                                  │
│  FINAL CLOSING REPORT:                                                 │
│     ├── Track A: Actively Exploited Vulnerability (Art 14(1)(c))       │
│     │   └── Within 14 DAYS after corrective patch/workaround available │
│     │                                                                  │
│     └── Track B: Severe Incident (Art 14(3)(c))                        │
│         └── Within 1 MONTH after the 72-hour notification              │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

| Reporting Stage | Statutory Deadline | Required Information Content |
| :--- | :--- | :--- |
| **Early Warning** | **Within 24 Hours** of awareness | Indicates whether the vulnerability is actively exploited by malicious actors, initial assessment of severity, and whether other Member States are affected. |
| **Detailed Notification** | **Within 72 Hours** of awareness | Description of the vulnerability or incident, root-cause indicators, affected product versions, applied mitigations, and corrective measures. |
| **Final Report (Vulnerabilities)** | **Within 14 Days** of fix availability | Full vulnerability analysis, technical details of the corrective security update, and guidance for end-users. |
| **Final Report (Incidents)** | **Within 1 Month** of notification | Comprehensive incident post-mortem, severity metrics, impact scope, and long-term remediation roadmap. |

---

## Technical Dossier (Annex VII) & CE Marking Protocol

To legally affix the CE mark and access the EU Single Market, manufacturers must compile a comprehensive **Technical Documentation File** before product release (Article 28 & Annex VII).

### Required Contents of the Annex VII Technical File

1. **System Description & Architecture:** General description of the PDE, block diagrams, operational context, network interface definitions, and hardware/software execution environments.
2. **Cybersecurity Risk Assessment:** Documented risk assessment according to Article 13(2), identifying potential threats, threat actors, attack surfaces, and corresponding technical mitigations.
3. **Annex I Conformity Mapping:** Point-by-point demonstration of compliance with every applicable requirement in Annex I Part I and Part II.
4. **Machine-Readable SBOM:** Complete, structured Software Bill of Materials (CycloneDX / SPDX) with component hashes, package URLs (purl), and dependency hierarchies.
5. **Vulnerability Handling Records:** Evidence of coordinated vulnerability disclosure processes, testing logs, static/dynamic code analysis reports, and penetration test certificates.
6. **EU Declaration of Conformity (Annex V):** Signed legal instrument declaring compliance with Regulation (EU) 2024/2847 and identifying applied harmonised European standards (CEN/CENELEC).

---

## Statutory Timelines & Non-Compliance Penalties

The CRA establishes a phased implementation schedule and substantial administrative fines for non-compliance (Articles 64 & 69).

### Phased Implementation Milestones

- **10 December 2024:** Regulation (EU) 2024/2847 enters into force.
- **11 June 2026 (18 Months):** Notification of conformity assessment bodies (Notified Bodies) begins.
- **11 September 2026 (21 Months):** **Article 14 Reporting Obligations become legally enforceable.** Manufacturers must operate 24h/72h incident reporting systems.
- **11 December 2027 (36 Months):** **Full Application.** All Annex I essential requirements, conformity assessment procedures, and CE marking rules become mandatory for market entry.

### Administrative Sanctions (Article 64)

| Violation Category | Statutory Basis | Maximum Administrative Penalty |
| :--- | :--- | :--- |
| **Non-compliance with Annex I Essential Requirements** | Article 64(1) | Up to **€15,000,000** or **2.5% of total worldwide annual turnover**, whichever is higher. |
| **Non-compliance with other CRA obligations (e.g., Technical File, SBOM)** | Article 64(2) | Up to **€10,000,000** or **2.0% of total worldwide annual turnover**, whichever is higher. |
| **Supplying incorrect, incomplete, or misleading information to authorities** | Article 64(3) | Up to **€5,000,000** or **1.0% of total worldwide annual turnover**, whichever is higher. |

---

## Operationalizing CRA Conformance with OXOT

The OXOT Conformance Platform transforms complex statutory mandates into an automated, auditable, and continuous operational workflow:

- **Unified Requirement Catalogue:** Cross-maps all 70+ CRA requirements against NIS2, IEC 62443, and the EU AI Act in our [Conformity Requirements Explorer](/conformity/requirements).
- **Automated SBOM & Vulnerability Tracking:** Continuous CycloneDX SBOM ingestion, vulnerability scanning, and upstream component monitoring in the [Conformity Dashboard](/conformity).
- **Article 14 Incident Automation:** Built-in statutory countdown clocks and automated dispatch templates for CSIRT/ENISA reporting.
- **Annex VII Technical Dossier Generation:** Automated assembly of audit-ready conformity packages with end-to-end evidence citation.

### Next Steps for Engineering & Compliance Teams

1. **Assess Your Exposure:** Run the interactive [2-Minute CRA Readiness Check](/cra-check) to benchmark your product against mandatory requirements.
2. **Explore the Legal Text:** Search articles, recitals, and annexes in the [CRA Statutory Wiki](/wiki/cra).
3. **Review Official Guidance:** Consult the [76 Official European Commission FAQs](/faq).
4. **Deepen Technical Knowledge:** Read authoritative engineering blueprints in the [CRA Technical Journal](/blog).
5. **Schedule an Architecture Review:** [Book a Demo](/demo) with our technical compliance specialists.
"""

NL_TITLE = "De EU Cyber Resilience Act — Uitgebreide Regelgevende & Technische Primer"
NL_SEO_TITLE = "EU CRA Primer | Uitgebreide Gids voor Verordening (EU) 2024/2847"
NL_SEO_DESC = "Gezaghebbende technische en juridische primer over de EU Cyber Resilience Act (Verordening (EU) 2024/2847): toepassingsbereik, 4-traps classificatie, Annex I essentiële vereisten, Artikel 14 meldtermijnen en conformiteitsbeoordeling."
NL_EXCERPT = "Verordening (EU) 2024/2847 stelt verplichte cyberbeveiligingseisen als markttoegangsvoorwaarde voor alle producten met digitale elementen die op de EU-markt worden gebracht. Deze primer beschrijft de volledige juridische architectuur, risicoklassen, essentiële vereisten, meldtermijnen en conformiteitsroutes."

NL_MARKDOWN = """## Juridische Grondslag & Regelgevende Architectuur

De **Cyber Resilience Act (Verordening (EU) 2024/2847)** is de fundamentele Europese verordening die horizontale cyberbeveiligingseisen vastlegt voor hardware- en softwareproducten. Formeel aangenomen door het Europees Parlement en de Raad op 23 oktober 2024, gepubliceerd in het Publicatieblad van de Europese Unie op 20 november 2024 (PB L 2024/2847) en in werking getreden op 10 december 2024, transformeert de CRA het Europese productrecht fundamenteel.

Vóór de CRA richtte de Europese cyberbeveiligingswetgeving zich voornamelijk op beheerders van kritieke infrastructuur (NIS/NIS2-richtlijn) of specifieke consumentenradioapparatuur (gedelegeerde handelingen onder de Radioapparatuurrichtlijn). De CRA introduceert een **ex-ante markttoegangsregime**: cyberbeveiliging is niet langer een aansprakelijkheidskwestie achteraf of een vrijblijvende best practice—het is een bindende wettelijke voorwaarde voor het op de EU-markt brengen van producten en het aanbrengen van de **CE-markering**.

> [!IMPORTANT]
> **Officiële Rechtsbron:** Verordening (EU) 2024/2847 van het Europees Parlement en de Raad betreffende horizontale cyberbeveiligingseisen voor producten met digitale elementen. Raadpleeg de volledige wettekst in de [CRA Legal Wiki](/wiki/cra).

---

## Toepassingsbereik: Producten met Digitale Elementen

De CRA is van toepassing in de gehele toeleveringsketen op alle **Producten met Digitale Elementen (PDE's)** die op de EU-markt worden aangeboden, ongeacht of de fabrikant binnen de Unie of in een derde land is gevestigd (Artikel 2(1)).

### 1. Wettelijke Definities

- **Product met Digitale Elementen (Artikel 3(1)):** Elk software- of hardwareproduct en de bijbehorende oplossingen voor gegevensverwerking op afstand, met inbegrip van software- of hardwarecomponenten die afzonderlijk in de handel worden gebracht.
- **Gegevensverbinding (Artikel 3(9) & Overweging 12):** Elke logische of fysieke gegevensverbinding waarlangs gegevens kunnen worden overgedragen, verwerkt of gecommuniceerd, inclusief draadloze interfaces (Wi-Fi, Bluetooth, 5G/4G, Zigbee), bekabelde netwerkinterfaces (Ethernet, Industrial Ethernet, CAN-bus, Modbus, RS-485) en directe fysieke busverbindingen (USB, PCIe, JTAG).
- **Gegevensverwerking op Afstand (Artikel 3(2)):** Elke gegevensverwerking op afstand waarvoor de software door of onder controle van de fabrikant is ontworpen en ontwikkeld, en zonder welke het PDE een van zijn primaire functies niet kan uitvoeren (bijv. cloud control planes, telemetriebackends, gekoppelde mobiele apps).

### 2. Wettelijke Uitzonderingen & Lex Specialis

De CRA sluit producten uit die reeds onder specifieke sectorale veiligheids- en beveiligingswetgeving vallen (Artikel 2(2)–(4)):

| Productcategorie | Toepasselijke EU-Verordening | CRA Status |
| :--- | :--- | :--- |
| **Medische Hulpmiddelen & IVD's** | Verordening (EU) 2017/745 (MDR) & 2017/746 (IVDR) | Uitgesloten (Lex Specialis) |
| **Burgerluchtvaartsystemen** | Verordening (EU) 2018/1139 | Uitgesloten (Lex Specialis) |
| **Motorvoertuigen & Componenten** | Verordening (EU) 2019/2144 | Uitgesloten (Lex Specialis) |
| **Defensie & Nationale Veiligheid** | Producten uitsluitend ontwikkeld voor defensie of nationale veiligheid | Uitgesloten (Artikel 2(5)) |
| **Open-Source Software** | Vrije en opensourcesoftware ontwikkeld buiten commerciële activiteiten | Uitgesloten (Overwegingen 18–21) |
| **Zuivere Cloud SaaS** | Cloudservices onafhankelijk van fysieke of zelfstandige software | Gereguleerd door NIS2 / DORA |

> [!NOTE]
> Bekijk alle 76 officiële interpretaties van de Europese Commissie in onze [Officiële CRA FAQ Bibliotheek](/faq).

---

## De 4-Traps Risicoclassificatie Architectuur

De CRA deelt producten in vier regelgevende niveaus in op basis van hun cyberbeveiligingsrisico, hun beoogde functionaliteit en de maatschappelijke impact van een incident (Artikelen 6 & 7, Bijlagen III & IV).

| Classificatieniveau | Wettelijke Basis | Typische Producttypen | Conformiteitsbeoordeling Route |
| :--- | :--- | :--- | :--- |
| **Standaard PDE's** *(~90% van de Markt)* | Standaard (Artikel 6(1)) | Slimme sensoren, aangesloten consumentenapparaten, kantoorrandapparatuur, algemene software, industriële meetinstrumenten | **Module A** *(Interne Productiecontrole / Zelfbeoordeling)* |
| **Belangrijk Klasse I** | Bijlage III | Identiteitsbeheersystemen, zelfstandige webbrowsers, wachtwoordbeheerders, antivirussoftware, netwerkinterfaces, SIEM-tools, microcontrollers/microprocessors | **Module A** (indien geharmoniseerde normen toegepast) **OF Module B+C / Module H** *(Aangemelde Instantie)* |
| **Belangrijk Klasse II** | Bijlage IV | Hypervisors, firewalls, fraudebestendige chips, industriële automatisering PLC's, SCADA-gateways, veilige cryptoprocessoren | **Verplichte Derdepartij:** **Module B+C** *(EU-Typeonderzoek)* **OF Module H** *(Volledige Kwaliteitsborging)* |
| **Kritieke Producten** | Artikel 7 & Bijlage IV (Deel 2) | Hardware security modules (HSM's), smart meter gateways, geavanceerde controllers voor vitale infrastructuur | **Verplicht Europees Cyberbeveiligingscertificaat** (onder ENISA EUCC-stelsel op niveau HOOG) |

---

## Annex I Essentiële Cyberbeveiligingseisen

Alle PDE's op de EU-markt moeten voldoen aan de **Essentiële Vereisten** in Bijlage I. Deze zijn onderverdeeld in twee verplichte pijlers:

### Pijler 1: Security by Design & Levenscyclusvereisten (Bijlage I, Deel I)

1. **Standaard Beveiligd (Eis 1):** Producten moeten worden geleverd met een veilige standaardconfiguratie. Fabriekswachtwoorden zijn verboden; unieke inloggegevens per apparaat of verplichte wachtwoordwijziging bij eerste gebruik zijn verplicht. Onnodige poorten en interfaces moeten standaard zijn uitgeschakeld.
2. **Gegevensbescherming & Cryptografie (Eisen 2 & 3):** Vertrouwelijkheid en integriteit van gegevens in rust, tijdens transport en bij verwerking moeten worden beschermd met state-of-the-art cryptografie.
3. **Beperking van het Aanvalsoppervlak (Eis 4):** Interfaces moeten worden beperkt tot essentiële functies volgens het principe van minimale bevoegdheden.
4. **Exploitmigratie & Geheugenveiligheid (Eis 5):** Producten moeten moderne mitigatietechnieken bevatten om de impact van mogelijke kwetsbaarheden te minimaliseren.
5. **Beveiligingslogging & Monitoring (Eis 6):** Producten moeten relevante beveiligingsgebeurtenissen registreren in fraudebestendige auditlogs.

### Pijler 2: Kwetsbaarhedenbeheer & Transparantie in de Toeleveringsketen (Bijlage I, Deel II)

1. **Software Bill of Materials (SBOM) (Eis 1):** Fabrikanten moeten alle componenten en afhankelijkheden in een machineleesbaar formaat documenteren (bijv. CycloneDX of SPDX).
2. **Gecoördineerde Kwetsbaarheidsbekendmaking (CVD) (Eis 2):** Fabrikanten moeten een transparant kwetsbaarheidsbeleid publiceren met een vast contactpunt (`security.txt`).
3. **Gepaste Zorgvuldigheid bij Componenten (Artikel 13(6)):** Fabrikanten moeten zorgvuldigheid betrachten bij het integreren van software van derden en opensourcecomponenten.
4. **Gratis, Tijdige Beveiligingsupdates (Eisen 3 & 4):** Beveiligingsupdates moeten snel en kosteloos beschikbaar worden gesteld gedurende de gehele vastgestelde ondersteuningsperiode (Artikel 13(8)), gescheiden van functionele updates.

---

## Verplichtingen van Marktdeelnemers & Artikel 21 Aansprakelijkheid

De CRA verdeelt de wettelijke verantwoordelijkheden over alle marktdeelnemers in de keten (Hoofdstuk II, Artikelen 13–24):

### 1. Fabrikanten (Artikel 13)

- **Risicobeoordeling:** Uitvoeren en documenteren van een cyberbeveiligingsrisicobeoordeling vóór marktintroductie (Artikel 13(2)).
- **Technisch Dossier:** Bewaren van het volledige Bijlage VII Technisch Dossier gedurende **10 jaar** na het op de markt brengen of gedurende de ondersteuningsperiode (Artikel 13(4)).
- **Ondersteuningsperiode:** Vaststellen en vermelden van de ondersteuningsperiode (minimaal 5 jaar, tenzij de levensduur korter is) voor beveiligingsupdates (Artikel 13(8)).
- **EU-Conformiteitsverklaring & CE-Markering:** Opstellen van de verklaring (Bijlage V) en zichtbaar aanbrengen van de CE-markering (Artikel 13(15)–(16)).

### 2. Importeurs (Artikel 17) & Distributeurs (Artikel 18)

- **Verificatieplicht:** Controleren of de fabrikant het technisch dossier heeft samengesteld en de CE-markering heeft aangebracht.
- **Weigeringsplicht (Artikel 18(2)):** Bij vermoeden van niet-conformiteit mag het product **niet** op de markt worden aangeboden.

### 3. Ingrijpende Wijziging & Systeemintegratoren (Artikel 21)

> [!WARNING]
> **De Artikel 21 Integratorvalkuil:** Wie een **ingrijpende wijziging** aanbrengt in een PDE—zoals het aanpassen van softwarearchitectuur of beveiligingsparameters bij een industriële retrofit—wordt wettelijk aangemerkt als de **Fabrikant** onder Artikel 21. Zij dragen de volledige wettelijke aansprakelijkheid voor CRA-conformiteit en CE-hercertificering.
>
> Lees meer in ons technisch memorandum: [The 2-Year Lag: Why Turnkey Contracts Face Article 21 Traps](/blog/ep-01-the-2-year-lag-why-2024-contracts-are-walking-into-a-2027-regulatory-trap).

---

## Artikel 14 Verplichte Meldtermijnen voor Incidenten & Kwetsbaarheden

Artikel 14 legt strikte wettelijke termijnen op voor het melden van actief uitgebuite kwetsbaarheden en ernstige incidenten aan het nationale CSIRT en ENISA via het centrale meldpunt.

| Meldingsfase | Wettelijke Termijn | Vereiste Inhoud |
| :--- | :--- | :--- |
| **Vroegtijdige Waarschuwing** | **Binnen 24 Uur** na ontdekking | Indicatie of de kwetsbaarheid actief wordt misbruikt, initiële ernst en mogelijke grensoverschrijdende impact. |
| **Gedetailleerde Melding** | **Binnen 72 Uur** na ontdekking | Beschrijving van het incident/kwetsbaarheid, initiële risicobeoordeling, getroffen versies en genomen mitigerende maatregelen. |
| **Eindrapport (Kwetsbaarheden)** | **Binnen 14 Dagen** na beschikbaarheid fix | Volledige technische analyse van de kwetsbaarheid, documentatie van de beveiligingsupdate en handelingsperspectief voor eindgebruikers. |
| **Eindrapport (Incidenten)** | **Binnen 1 Maand** na 72-uursmelding | Volledige post-mortem analyse, ernststatistieken, impactomvang en preventieve langetermijnmaatregelen. |

---

## Handhavingstermijnen & Sancties bij Niet-Naleving

De CRA kent een gefaseerde invoering en substantiële bestuurlijke boetes (Artikelen 64 & 69).

### Belangrijke Mijlpalen

- **10 december 2024:** Inwerkingtreding van Verordening (EU) 2024/2847.
- **11 september 2026 (21 Maanden):** **Artikel 14 Meldplichten worden juridisch afdwingbaar.** Fabrikanten moeten operationele 24u/72u meldprocedures hanteren.
- **11 december 2027 (36 Maanden):** **Volledige Toepassing.** Alle Annex I essentiële eisen, conformiteitsbeoordelingsprocedures en CE-markeringsverplichtingen zijn verplicht.

### Bestuurlijke Boetes (Artikel 64)

| Overtreding | Wettelijke Basis | Maximale Bestuurlijke Boete |
| :--- | :--- | :--- |
| **Niet-naleving van Bijlage I Essentiële Eisen** | Artikel 64(1) | Tot **€15.000.000** of **2,5% van de wereldwijde jaaromzet**, waarbij de hoogste van toepassing is. |
| **Niet-naleving van overige CRA-plichten (bijv. Technisch Dossier, SBOM)** | Artikel 64(2) | Tot **€10.000.000** of **2,0% van de wereldwijde jaaromzet**, waarbij de hoogste van toepassing is. |
| **Verstrekken van onjuiste of misleidende informatie aan autoriteiten** | Artikel 64(3) | Tot **€5.000.000** of **1,0% van de wereldwijde jaaromzet**, waarbij de hoogste van toepassing is. |

---

## CRA-Conformiteit Operationeel Maken met OXOT

Het OXOT Conformance Platform vertaalt complexe wetgeving naar een geautomatiseerde, auditeerbare en continue compliance-operatie:

- **Geharmoniseerde Eisenverkenner:** Koppel alle CRA-eisen aan NIS2, IEC 62443 en de AI Act in de [Conformity Requirements Explorer](/conformity/requirements).
- **Geautomatiseerde SBOM & Kwetsbaarhedenanalyse:** Continue CycloneDX SBOM-ingestie en kwetsbaarhedenmonitoring in het [Conformity Dashboard](/conformity).
- **Artikel 14 Incidentautomatisering:** Geautomatiseerde aftelklokken en meldsjablonen voor CSIRT/ENISA.
- **Bijlage VII Technisch Dossier:** Automatische generatie van auditklare conformiteitspakketten met volledige bronverwijzing.

### Volgende Stappen voor Technische & Compliance Teams

1. **Evalueer Uw Gereedheid:** Voer de interactieve [2-Minuten CRA Gereedheidscheck](/cra-check) uit.
2. **Onderzoek de Wettekst:** Zoek artikelen en bijlagen in de [CRA Statutory Wiki](/wiki/cra).
3. **Raadpleeg Officiële Richtlijnen:** Bekijk de [76 Officiële CRA Veelgestelde Vragen](/faq).
4. **Verdiep Uw Kennis:** Lees diepgaande technische analyses in het [CRA Kenniscentrum](/blog).
5. **Plan een Architectuursessie:** [Vraag een Demo Aan](/demo) met onze compliance-specialisten.
"""

def update_site_content_json():
    json_path = "/Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/api-server/src/content/snapshot/site-content.json"
    with open(json_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Check if cra-primer exists for en and nl
    en_page = None
    nl_page = None
    for page in data.get("pages", []):
        if page.get("slug") == "cra-primer":
            if page.get("locale") == "en":
                en_page = page
            elif page.get("locale") == "nl":
                nl_page = page

    if en_page:
        en_page["title"] = EN_TITLE
        en_page["seoTitle"] = EN_SEO_TITLE
        en_page["seoDescription"] = EN_SEO_DESC
        if en_page.get("sections") and len(en_page["sections"]) > 0:
            en_page["sections"][0]["data"] = {
                "title": EN_TITLE,
                "excerpt": EN_EXCERPT,
                "markdown": EN_MARKDOWN
            }
    
    if not nl_page:
        nl_page = {
            "slug": "cra-primer",
            "serviceKey": "cra-primer",
            "locale": "nl",
            "title": NL_TITLE,
            "seoTitle": NL_SEO_TITLE,
            "seoDescription": NL_SEO_DESC,
            "ogTitle": None,
            "ogDescription": None,
            "ogImage": None,
            "canonicalUrl": None,
            "metaKeywords": None,
            "noindex": True,
            "visibility": "public",
            "regulationKeys": ["cra"],
            "status": "published",
            "sections": [
                {
                    "type": "article",
                    "sortOrder": 0,
                    "data": {
                        "title": NL_TITLE,
                        "excerpt": NL_EXCERPT,
                        "markdown": NL_MARKDOWN
                    }
                }
            ]
        }
        data["pages"].append(nl_page)
    else:
        nl_page["title"] = NL_TITLE
        nl_page["seoTitle"] = NL_SEO_TITLE
        nl_page["seoDescription"] = NL_SEO_DESC
        if nl_page.get("sections") and len(nl_page["sections"]) > 0:
            nl_page["sections"][0]["data"] = {
                "title": NL_TITLE,
                "excerpt": NL_EXCERPT,
                "markdown": NL_MARKDOWN
            }

    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print("Updated site-content.json successfully!")

def update_seed_customer_site():
    seed_file = "/Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/artifacts/api-server/src/scripts/seedCustomerSite.ts"
    with open(seed_file, "r", encoding="utf-8") as f:
        content = f.read()

    # Replace the English PAGES entry for cra-primer
    old_en_marker_start = 'slug: "cra-primer",'
    old_en_marker_end = 'slug: "conformance-process",'
    
    if old_en_marker_start in content and old_en_marker_end in content:
        start_idx = content.find('{\n    slug: "cra-primer",')
        if start_idx == -1:
            start_idx = content.find('  {\n    slug: "cra-primer",')
        end_idx = content.find('  {\n    slug: "conformance-process",')
        if start_idx != -1 and end_idx != -1:
            escaped_markdown = EN_MARKDOWN.replace("`", "\\`")
            new_en_entry = f"""  {{
    slug: "cra-primer",
    title: {json.dumps(EN_TITLE)},
    seoTitle: {json.dumps(EN_SEO_TITLE)},
    seoDescription: {json.dumps(EN_SEO_DESC)},
    excerpt: {json.dumps(EN_EXCERPT)},
    visibility: "public",
    regulationKeys: ["cra"],
    markdown: `{escaped_markdown}`,
  }},\n"""
            content = content[:start_idx] + new_en_entry + content[end_idx:]
            write_checked(seed_file, content)
            print("Updated seedCustomerSite.ts successfully!")

def update_postgres():
    en_section_data = json.dumps({
        "title": EN_TITLE,
        "excerpt": EN_EXCERPT,
        "markdown": EN_MARKDOWN
    })
    nl_section_data = json.dumps({
        "title": NL_TITLE,
        "excerpt": NL_EXCERPT,
        "markdown": NL_MARKDOWN
    })

    # Prepare SQL statements escaping single quotes by doubling them
    def pg_esc(s):
        return s.replace("'", "''")

    sql_script = f"""
DO $$
DECLARE
    v_page_id_en INT;
    v_page_id_nl INT;
BEGIN
    -- Update or Insert EN page
    SELECT id INTO v_page_id_en FROM pages WHERE slug = 'cra-primer' AND locale = 'en';
    IF v_page_id_en IS NOT NULL THEN
        UPDATE pages SET 
            title = '{pg_esc(EN_TITLE)}',
            seo_title = '{pg_esc(EN_SEO_TITLE)}',
            seo_description = '{pg_esc(EN_SEO_DESC)}',
            updated_at = NOW()
        WHERE id = v_page_id_en;

        DELETE FROM page_sections WHERE page_id = v_page_id_en;
        INSERT INTO page_sections (page_id, type, sort_order, data, created_at, updated_at)
        VALUES (v_page_id_en, 'article', 0, '{pg_esc(en_section_data)}'::jsonb, NOW(), NOW());
    ELSE
        INSERT INTO pages (slug, service_key, locale, title, seo_title, seo_description, noindex, visibility, regulation_keys, status, created_at, updated_at)
        VALUES ('cra-primer', 'cra-primer', 'en', '{pg_esc(EN_TITLE)}', '{pg_esc(EN_SEO_TITLE)}', '{pg_esc(EN_SEO_DESC)}', false, 'public', ARRAY['cra'], 'published', NOW(), NOW())
        RETURNING id INTO v_page_id_en;

        INSERT INTO page_sections (page_id, type, sort_order, data, created_at, updated_at)
        VALUES (v_page_id_en, 'article', 0, '{pg_esc(en_section_data)}'::jsonb, NOW(), NOW());
    END IF;

    -- Update or Insert NL page
    SELECT id INTO v_page_id_nl FROM pages WHERE slug = 'cra-primer' AND locale = 'nl';
    IF v_page_id_nl IS NOT NULL THEN
        UPDATE pages SET 
            title = '{pg_esc(NL_TITLE)}',
            seo_title = '{pg_esc(NL_SEO_TITLE)}',
            seo_description = '{pg_esc(NL_SEO_DESC)}',
            updated_at = NOW()
        WHERE id = v_page_id_nl;

        DELETE FROM page_sections WHERE page_id = v_page_id_nl;
        INSERT INTO page_sections (page_id, type, sort_order, data, created_at, updated_at)
        VALUES (v_page_id_nl, 'article', 0, '{pg_esc(nl_section_data)}'::jsonb, NOW(), NOW());
    ELSE
        INSERT INTO pages (slug, service_key, locale, title, seo_title, seo_description, noindex, visibility, regulation_keys, status, created_at, updated_at)
        VALUES ('cra-primer', 'cra-primer', 'nl', '{pg_esc(NL_TITLE)}', '{pg_esc(NL_SEO_TITLE)}', '{pg_esc(NL_SEO_DESC)}', false, 'public', ARRAY['cra'], 'published', NOW(), NOW())
        RETURNING id INTO v_page_id_nl;

        INSERT INTO page_sections (page_id, type, sort_order, data, created_at, updated_at)
        VALUES (v_page_id_nl, 'article', 0, '{pg_esc(nl_section_data)}'::jsonb, NOW(), NOW());
    END IF;

END $$;
"""
    sql_path = "/tmp/update_cra_primer.sql"
    write_checked(sql_path, sql_script)

    subprocess.run(["docker", "cp", sql_path, "oxot_website_conformity_application-db-1:/tmp/update_cra_primer.sql"], check=True)
    subprocess.run(["docker", "exec", "oxot_website_conformity_application-db-1", "psql", "-U", "oxot", "-d", "oxot", "-f", "/tmp/update_cra_primer.sql"], check=True)
    print("Updated PostgreSQL database successfully!")

if __name__ == "__main__":
    update_site_content_json()
    update_seed_customer_site()
    update_postgres()
    print("All CRA Primer updates completed successfully!")
