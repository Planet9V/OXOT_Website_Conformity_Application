1 May 2026
j.mckenney
### IEC 62443 SL-3 and SL-4 Certification Landscape: Datacenter and Hyperscaler OT Equipment

**Standards scope:** IEC 62443-4-2 (component security), IEC 62443-3-3 (system security), IEC 62443-4-1 (secure development lifecycle)  

**Certification schemes:** ISASecure CSA / SSA / SDLA · IECEE OD-2061 · TÜV SÜD · TÜV NORD · TÜV Rheinland · Bureau Veritas · UL Solutions  

**Terminology:** Throughout this report, 
- "SL-A" denotes a security level actually achieved (certified), 
- "SL-C" denotes a capability security level claimed by a vendor without full third-party achieved certification, and 
- "SL-T" denotes a design target set by an asset owner or integrator for a zone or conduit.

---

## Bottom-Line Answer

No datacenter-native product — in any OT category including UPS, ATS, CRAC/CRAH, generator management, rack PDU, BMS, liquid cooling, physical access, or fire detection — holds a certified IEC 62443-4-2 Security Level 3 (SL-3) rating as of mid-2025. SL-4 has never been achieved by any commercial product under any recognized scheme, globally, in any industry. Exactly five products hold IEC 62443-4-2 SL-3 component certifications worldwide, all issued between December 2023 and June 2024: GE Power Conversion HPCi Controller (SYS_HPCi 8.1.0), Bitron Electronics µUP Smart Street Box RTU, Saia-Burgess PCD QronoX / Honeywell ControlEdge PCD (PCD3.M6893), Cylus CylusOne Rail Cybersecurity Platform, and Cervello Rail Cybersecurity Platform v24.03.0. All five are outside the datacenter product stack. Of these, only the Saia-Burgess PCD QronoX is facility/building-automation-adjacent, making it architecturally relevant as a BMS controller blueprint. The frontier for any datacenter-deployed OT product is SL-2, with UPS management cards (Schneider NMC3, Vertiv RDU120, Eaton NETWORK-M3), OT network switches (Cisco IE3x00 series, Belden HiOS families), and BMS controllers (Honeywell Advanced Plant Controller, Siemens Desigo CC) representing the leading certified products.

---

## The Five SL-3 Certified Products (Global, All Industries, All Sectors)

These products represent the complete global population of IEC 62443-4-2 SL-3 certified components as of mid-2025. The [ISASecure press release of April 18, 2024](https://isasecure.org/news-events/isasecure-issues-worlds-first-security-level-3-certifications-for-isa/iec-62443-cybersecurity-standards) confirmed these as the world's first SL-3 certifications under IEC 62443-4-2. All five SL-3 designations below are SL-A (achieved) certifications, not SL-C capability claims. The GE HPCi and Saia-Burgess PCD QronoX were certified under ISASecure CSA 1.0.0 via the BYHON (Honeywell Consulting) certification body in Italy. The Cylus CylusOne was certified under the IECEE scheme by Bureau Veritas. The Cervello platform was certified under ISASecure CSA 1.0.0.

| Vendor | Product | Cert Date | Cert Body / Scheme | 62443 Part | Component Type | Datacenter Applicability Assessment |
|---|---|---|---|---|---|---|
| GE Power Conversion (GE Vernova) | HPCi Controller v8.1.0 (SYS_HPCi 8.1.0) | 2023-12-31 | BYHON / [ISASecure CSA 1.0.0](https://isasecure.org/end-users/iec-62443-4-2-certified-components) | 62443-4-2 | Embedded Device — marine/industrial drive power controller | None directly. Demonstrates that SL-3 is achievable for embedded power controllers in the same hardware class as UPS/generator controllers. Previous version (HPCi v7.1) held SL-1 only. |
| Bitron Electronics S.p.A. | µUP Smart Street Box RTU v1.1.x | 2024-02-26 | BYHON / [ISASecure CSA 1.0.0](https://isasecure.org/end-users/iec-62443-4-2-certified-components) · [certificate PDF](https://www.isasecure.org/hubfs/BTRN-MCRUP-CSA-E01.pdf) | 62443-4-2 | Embedded Device — smart grid remote terminal unit | None. Smart grid / street lighting infrastructure. Bitron also holds an [SDLA certification (ISASecure, December 2023)](https://isasecure.org/end-users/iec-62443-4-1-certified-development-organizations) for its secure development lifecycle. |
| Saia-Burgess Controls AG (Honeywell Building Technologies) | PCD QronoX / ControlEdge PCD (PCD3.M6893) v5.x.x | 2024-01-31 | BYHON / [ISASecure CSA 1.0.0](https://isasecure.org/end-users/iec-62443-4-2-certified-components) · [certificate HON 2403128 C001](https://www.isasecure.org/hubfs/SAIA-Burgess%20PCD%20Controller.pdf) | 62443-4-2 | Embedded Device — PLC / building automation controller | Facility-adjacent. Only conventional PLC/controller at SL-3 globally. Architecturally applicable to datacenter BMS as zone controller. Honeywell BT markets it as [QronoX PLC with IEC 62443-4-2 SL-3 certification](https://buildings.honeywell.com/us/en/products/by-category/control-panels/building-controls/plcs/qronox-plc). Not marketed as a datacenter product. |
| Cylus Ltd | CylusOne Rail Cybersecurity Platform | 2024-02-26 | Bureau Veritas / [IECEE scheme](https://certificates.iecee.org) · [Cylus announcement](https://www.cylus.com/post/cylus-achieves-worlds-first-iec-62443-4-2-certification-for-rail-tech-cybersecurity-solution-setting-a-new-industry-standard) | 62443-4-2 | Software Application — passive OT network monitoring/detection platform | None. Rail signaling systems and SCADA monitoring. Cylus published a [technical account of the SL-3 journey](https://www.cylus.com/post/the-cylusone-journey-to-iec-62443-4-2-sl3-certification) noting the 18-month evaluation process. |
| Cervello Ltd | Cervello Rail Cybersecurity Platform v24.03.0 | 2024-06-14 | BYHON / [ISASecure CSA 1.0.0](https://isasecure.org/end-users/iec-62443-4-2-certified-components) | 62443-4-2 | Software Application — rail OT monitoring platform | None. Railway OT environments — signaling, interlocking, SCADA. |

### Observations on the SL-3 Cohort

The first ISASecure SL-3 certificate ever issued went to GE Power Conversion on December 31, 2023 — approximately a decade after the ISASecure program began certifying embedded devices. [ISASecure issued the first product component certifications in 2011 (RTP Corporation Safety Manager at SL-2)](https://isasecure.org/end-users/iec-62443-4-2-certified-components), and SL-3 was not reached until 2023. The structural implication is that SL-3 is rare even in the most mature OT sectors (process control, energy, rail), and the datacenter sector — which began IEC 62443 product certification only around 2020 — is more than one SL tier behind.

The Saia-Burgess PCD QronoX is uniquely significant as the only conventional PLC or controller (not a monitoring software platform) at SL-3. [Honeywell BT's SDLA (IEC 62443-4-1 development process) certification](https://isasecure.org/end-users/iec-62443-4-1-certified-development-organizations) underpins the PCD QronoX achievement and also underpins the SL-2 certifications for the Honeywell Advanced Plant Controller (December 2023) and CPO-PC500/600 (March 2024) — indicating a repeatable pipeline from the same vendor for facility controller certifications. For consultants specifying future BMS or facility OT procurement, the QronoX certificate is the only available reference for what SL-3 looks like in a controller product, and the Honeywell BT / BYHON pipeline is the only demonstrated source for future facility controller SL-3 certs.

The two rail cybersecurity platforms (Cylus CylusOne and Cervello) confirm that IEC 62443-4-2 SL-3 certification of monitoring software is achievable, even if the resulting products are passive detection platforms rather than active controllers. Their architecture — network tap, passive analysis, no control-plane functions — may actually simplify SL-3 evaluation compared to a controller, since the attack surface excludes write access to the physical process. OT monitoring vendors considering IEC 62443-4-2 SL-3 certification for datacenter-context platforms (Claroty xDome, Nozomi Guardian, Dragos Platform) have a precedent path in the rail sector — but neither Claroty, Nozomi, nor Dragos holds any IEC 62443-4-2 product certification at any SL as of mid-2025.

---

## SL-4 Status: Zero Commercial Certifications Anywhere

No commercial product has achieved IEC 62443-4-2 SL-4 under any recognized certification scheme — ISASecure, IECEE, TÜV SÜD, TÜV Rheinland, TÜV NORD, Bureau Veritas, exida, or UL Solutions — as of mid-2025. The ISASecure program defines SL-4 in its [CSA certification framework](https://isasecure.org/certification/iec-62443-csa-certification) but no product appears in the registry at that level.

IEC 62443 defines SL-4 as protection against intentional attack by a nation-state-level adversary: sophisticated means; extensive, multi-disciplinary resources; high IACS-specific knowledge; and sustained high motivation. In assurance terms, SL-4 is approximately analogous to Common Criteria EAL 5–7 depth — formal security models, hardware root of trust, hardware security modules for key management, and adversarial penetration testing by nation-state-caliber evaluators. The barriers are structural, not temporary:

**Technical barriers:** All SL-3 requirements must be fully satisfied, then substantially exceeded. SL-4 implies cryptographically verified hardware root of trust, hardware security modules for all cryptographic key operations, physical tamper evidence and tamper resistance, formal verification of security-critical code paths, and demonstrated resistance to extended sophisticated attacks using IACS-specific exploit capabilities. No COTS OT product has been designed to this specification.

**Economic barriers:** Industry sources estimate SL-3 assessment and remediation at $500K–$2M per product line for a typical embedded controller. SL-4 evaluation depth would substantially exceed that, with no established commercial market willing to pay the corresponding unit price premium for general-purpose OT equipment.

**Evaluator capacity barriers:** No certification body has published a defined, commercially available SL-4 testing and evaluation protocol for general-purpose embedded devices. The methodology is not standardized at SL-4 in the same way it is for SL-1 through SL-3 under the ISASecure CSA scheme.

[INCIBE's published analysis from 2022](https://www.incibe.es/en/incibe-cert/blog/iec-62443-4-2-need-secure-components) noted that from 2011 through 2022, no product had been certified above SL-2 — a statement now partially superseded by the 2023–2024 SL-3 certifications, but which confirms the SL-4 threshold has never been breached commercially. [ISASecure's webinar documentation](https://isasecure.org/hubfs/ISASecureWebinar_DontOvershootYourTargetSecuityLevel_Interstates_8_23_23.pdf) references SL-4 targets as conceptually applicable to scenarios such as a safety zone containing explosive hydrocarbon processes, but treats these exclusively as design-target (SL-T) references set by zone/conduit assessment — not as achieved certifications. The practical guidance from ISASecure is to avoid overshooting your target security level: most process plants top out at SL-T 2 or SL-T 3, and specifying SL-T 4 zones requires explicit threat modeling justification that is rarely applicable outside defense and nuclear sectors.

---

## Datacenter-Relevant Certified Products at SL-2

SL-2 is the maximum security level achieved by any product in any category routinely deployed in datacenters. The following tables are organized by the three most procurement-relevant categories.

### UPS Management Cards and Power Infrastructure

These certifications reside in the network management / interface cards embedded in UPS and PDU equipment. The critical distinction for practitioners: the SL-2 certification applies to the network management card (the software-rich embedded device that handles Modbus/SNMP/REST communication and firmware), not to the power conversion electronics of the UPS unit itself. The UPS power stage (transformer, rectifier, inverter, battery management) remains uncertified at any IEC 62443-4-2 security level for every vendor.

| Vendor             | Product                                                                                                    | Cert Body              | Cert Date                                 | Standard Part / SL-A                         | Source                                                                                                                                                                                                                                                                                                               |
| ------------------ | ---------------------------------------------------------------------------------------------------------- | ---------------------- | ----------------------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Schneider Electric | EcoStruxure IT NMC3 (Network Management Card 3) — embedded in Galaxy, APC, and NetShelter UPS/PDU families | TÜV Rheinland          | October 2024 (upgraded from SL-1 in 2023) | IEC 62443-4-2 SL-2                           | [Industrial Cyber NMC3 announcement](https://industrialcyber.co/news/schneider-electric-ecostruxure-nmc3-achieves-iec-62443-4-2-security-level-2-certification/)                                                                                                                                                     |
| Schneider Electric | Galaxy VXL UPS (500–1250 kW) — SL-2 certification resides in the embedded NMC3 card, not the power unit    | TÜV Rheinland          | March 2025 (product launch)               | IEC 62443-4-2 SL-2 (via NMC3 card)           | [Schneider Galaxy VXL press release](https://www.se.com/hk/en/about-us/newsroom/news/press-releases/schneider-electric-announces-galaxy-vxl-ups-%E2%80%93-the-industry%E2%80%99s-most-compact-high-density-power-protection-system-for-ai-data-center-and-large-scale-electrical-workloads-67e216ac9f297ecae60b6cbf) |
| Schneider Electric | EcoStruxure Power Operation (SCADA/power management software)                                              | TÜV Rheinland / IECEE  | 2021                                      | IEC 62443-4-2 SL-2 (Software Application)    | [Schneider Electric blog on SL-2 power management](https://blog.se.com/infrastructure-and-grid/power-management-metering-monitoring-power-quality/2021/10/12/why-is-iec-62443-security-level-2-important-for-power-management-systems/)                                                                              |
| Vertiv             | Liebert IntelliSlot RDU120 (1Gb network card) — covers Liebert GXE, GXT5, Edge, and Edge Lithium UPS       | Not publicly specified | 2025                                      | IEC 62443-4-2 SL-2 · UL 2900-1 · CRA-aligned | [Vertiv RDU120 LinkedIn announcement](https://www.linkedin.com/posts/massimo-zampieri-29684b5_vertiv-intellislot-rdu120-iec-62443-4-2-activity-7353670996198862848-9Xh-)                                                                                                                                             |
| Eaton              | Gigabit Network Card / NETWORK-M3 — single and three-phase UPS connectivity                                | UL Solutions           | January 2020 (first dual cert)            | IEC 62443-4-2 SL-2 · UL 2900-1               | [Eaton dual certification press release](https://www.eaton.com/us/en-us/company/news-insights/news-releases/2022/eaton-adds-ul-and-iec-cybersecurity-certifications.html)                                                                                                                                            |
| Eaton              | Industrial Gateway Card / INDGW-M3 — Modbus/BACnet gateway for industrial and datacenter UPS               | UL Solutions           | 2020                                      | IEC 62443-4-2 SL-2 · UL 2900-1               | [Eaton INDGW-M3 product page](https://www.eaton.com/us/en-us/skuPage.INDGW-M3.html)                                                                                                                                                                                                                                  |

**Vendor gaps in this category:** Mitsubishi Electric holds an IEC 62443-4-1 (development process) certification for its Nagoya Works UPS development team via TÜV SÜD (May 2021) but has no documented product-level IEC 62443-4-2 certification at any SL. Vertiv's larger product line (Liebert DSE, EXL S1, HPL) has no separate component certifications; only the RDU120 network card is confirmed at SL-2. Most Schneider and Eaton rack PDU products (non-management-card configurations) have no standalone component certs — only the network management card SKUs are certified.

### OT Network Switches and Routers

The OT network layer is the most certification-mature datacenter OT category. Cisco, Moxa, and Belden have collectively produced the largest portfolio of SL-2 certified OT networking products. All certifications below are SL-A (achieved) certifications. Where ISASecure CSA 1.0.0 is the scheme, the certification body is either BYHON or Bureau Veritas depending on the vendor.

| Vendor | Product | Cert Body | Cert Date | Standard Part / SL-A | Source |
|---|---|---|---|---|---|
| Cisco Systems | Catalyst IE3100 Rugged / Stratix 5200 (FW 17.12.1) | ISASecure CSA / BYHON | June 2024 | IEC 62443-4-2 SL-2 (Network Device) | [ISASecure CSA Registry](https://isasecure.org/end-users/iec-62443-4-2-certified-components) · [ARC Web portfolio analysis](https://www.arcweb.com/blog/entire-cisco-industrial-ethernet-switch-portfolio-now-isaiec-62443-4-1-4-2-certified) |
| Cisco Systems | Catalyst IE3x00 / Stratix 5800 (FW 17.12.1) | ISASecure CSA / BYHON | May 2024 | IEC 62443-4-2 SL-2 (Network Device) | [ISASecure CSA Registry](https://isasecure.org/end-users/iec-62443-4-2-certified-components) |
| Cisco Systems | Catalyst IE9300 Rugged Series (FW 17.12.1) | ISASecure CSA / BYHON | June 2024 | IEC 62443-4-2 SL-2 (Network Device) | [ISASecure CSA Registry](https://isasecure.org/end-users/iec-62443-4-2-certified-components) |
| Moxa Inc. | EDR-G9010 Series Industrial Secure Router | Bureau Veritas (IECEE OD-2061) | September 2023 | IEC 62443-4-2 SL-2 (Network Device) | [Moxa first SL-2 router announcement](https://www.moxa.com/en/about-us/news-events/news/2023/moxa-achieves-world-s-first-iec-62443-4-2-certification-for-industrial-secure-routers) · [IECEE cert 1667679](https://certificates.iecee.org/#/deliverables/CERT/1667679/view) |
| Moxa Inc. | TN-4900 Series Industrial Secure Router | Bureau Veritas (IECEE OD-2061) | September 2023 | IEC 62443-4-2 SL-2 (Network Device) | [Moxa first SL-2 router announcement](https://www.moxa.com/en/about-us/news-events/news/2023/moxa-achieves-world-s-first-iec-62443-4-2-certification-for-industrial-secure-routers) · [IECEE cert 1682810](https://certificates.iecee.org/#/deliverables/CERT/1682810/view) |
| Moxa Inc. | UC-8200 Series Industrial Computer (MIL3 V1.x) | ISASecure CSA / Bureau Veritas | November 2022 | IEC 62443-4-2 SL-2 (Host Device) | [Moxa first SL-2 host device announcement](https://www.moxa.com/en/about-us/news-events/news/2023/moxa-launches-worlds-first-industrial-computer-with-iec-62443-4-2-host-device-certification) |
| Moxa Inc. | NPort 6000-G2 Series Serial Device Server | Bureau Veritas (IECEE) | March 2026 | IEC 62443-4-2 SL-2 (Embedded Device) | [Moxa NPort 6000-G2 announcement](https://www.moxa.com/en/about-us/news-events/news/2026/moxa-sets-new-security-benchmark-for-serial-sevice-servers-with-world-s-first-iec-62443-4-2) |
| Belden / Hirschmann | HiOS switches: BOBCAT BRS-Family, MSP40, GREYHOUND 103/105/106/1040/2000, RSP, RSPE, OCTOPUS II/III | ISASecure / IECEE | Multiple dates 2022–2025 | IEC 62443-4-2 SL-2 (Network Device) | [Belden IEC 62443-4-2 certified switches page](https://www.belden.com/products/iec-62443-4-2-certified-switches) · [Hirschmann certificate page](https://www.doc.hirschmann.com/certificates.html) |
| Belden / Hirschmann | BXP Switch | ISASecure / IECEE | October 2025 | IEC 62443-4-2 SL-2 (Network Device) | [Hirschmann certificate page](https://www.doc.hirschmann.com/certificates.html) |
| Belden / Hirschmann | EAGLE4007 Firewall V04.1.xx | ISASecure CSA 1.0.0 | September 2022 | IEC 62443-4-2 SL-1 (Network Device — firewall) | [ISASecure CSA Registry](https://isasecure.org/end-users/iec-62443-4-2-certified-components) |

**Vendor notes for OT networking:**

- [Cisco's entire industrial Ethernet switch portfolio achieved SL-2 certification in 2024](https://www.arcweb.com/blog/entire-cisco-industrial-ethernet-switch-portfolio-now-isaiec-62443-4-1-4-2-certified), backed by its [IEC 62443-4-1 SDLA certification (ISASecure, February 2023)](https://isasecure.org/end-users/iec-62443-4-1-certified-development-organizations). Cisco Cyber Vision (OT visibility platform) uses Cisco's SDL process certification but has no standalone IEC 62443-4-2 component SL rating.
- [Moxa achieved the world's first SL-2 certification for industrial secure routers](https://www.moxa.com/en/about-us/news-events/news/2023/moxa-achieves-world-s-first-iec-62443-4-2-certification-for-industrial-secure-routers) in September 2023, and the world's first SL-2 host device certification (UC-8200) in November 2022 — both significant datacenter-applicable milestones.
- [Belden/Hirschmann's development process is certified to IEC 62443-4-1 ML4](https://www.belden.com/products/iec-62443-4-2-certified-switches) — the highest process maturity level in the ISASecure SDLA scheme — underpinning its SL-2 product certifications across multiple switch families.
- Fortinet FortiGate Rugged: [Fortinet achieved IEC 62443-4-1 ML2 (development process) certification in 2024](https://www.fortinet.com/blog/operational-technology/fortinet-achieves-iec-62443-4-1-ml2-certification-for-secure-product-development) but holds no IEC 62443-4-2 product-level component certification at any SL. FortiGate Rugged is not ISASecure-listed. The IEC 62443-4-1 ML2 process cert and the IEC 62443-4-2 product cert are distinct and not equivalent — the former certifies the development process, not the shipped product's security characteristics.
- Siemens RUGGEDCOM switches: Siemens holds TÜV SÜD and TÜV NORD certifications for multiple product lines, but RUGGEDCOM-specific IEC 62443-4-2 component certifications at a stated SL level are not confirmed in public registries as of mid-2025.

### BMS Controllers (Facility / Building Automation)

| Vendor | Product | Cert Body | Cert Date | Standard Part / SL-A | Source |
|---|---|---|---|---|---|
| Honeywell Building Technologies | Advanced Plant Controller v4.10 (formerly Saia-Burgess CPO design basis) | ISASecure CSA / BYHON | December 2023 | IEC 62443-4-2 SL-2 (Host Device) | [ISASecure CSA Registry](https://isasecure.org/end-users/iec-62443-4-2-certified-components) |
| Honeywell Building Technologies (Saia-Burgess) | CPO-PC500/600 Plant Controller v4.1 | ISASecure CSA / BYHON | March 2024 | IEC 62443-4-2 SL-2 (Host Device) | [ISASecure CSA Registry](https://isasecure.org/end-users/iec-62443-4-2-certified-components) |
| Siemens (ETM Professional Control) | Desigo CC v6+ / Cerberus DMS BMS Platform | TÜV SÜD (cert IITS2 113879 0004; valid through August 2026) | September 2023 | IEC 62443-4-2 (full standard referenced; SL-2 per Siemens project specification requirement) | [Siemens Desigo CC TÜV certificate PDF](https://assets.new.siemens.com/siemens/assets/api/uuid:6dfd6eec-2a16-4978-b548-0ede1a7c44f8/secure-product-development-lifecycle-desigocc-en.pdf) · [Siemens project spec (SL-2 requirement language)](https://sid.siemens.com/r/A6V14948151/29540941067___en-US_29542012811) |

**Vendor notes for BMS:**

The Desigo CC TÜV SÜD certificate references the complete IEC 62443-4-2:2019 standard without explicitly stating an achieved security level number in the certificate text — a common pattern with TÜV SÜD assessments, which evaluate against the full standard rather than certifying a discrete SL-A number. The [Siemens project delivery specification](https://sid.siemens.com/r/A6V14948151/29540941067___en-US_29542012811) that requires "BMS certified to IEC 62443-4-2 SL2 or higher" for Siemens project deliveries is the most concrete example of an SL-2 floor being embedded in infrastructure project specifications across the market.

[Honeywell / Tridium's Niagara Framework and JACE 9000](https://www.tridium.com/content/dam/tridium/en/documents/niagara-forum-2025/business/tri-NF25_Business_Protecting_Your_Data_Cyber_Security_and_GDPR.pdf) — the dominant BAS integration platform in large commercial buildings and some datacenter facilities — holds an IEC 62443-4-1 SDLA certification and has publicly stated the intent to pursue IEC 62443-4-2 component certification, but no IEC 62443-4-2 product-level cert has been issued for Niagara or JACE 9000 as of mid-2025.

[Johnson Controls Metasys BAS platform](https://isasecure.org/end-users/iec-62443-4-2-certified-components) does not appear in the ISASecure certified product registry. Johnson Controls is an ISASecure board member, and its York chiller controllers (YK, YZ, YVAA, YMC2, YKCP) achieved ISASecure CSA SL-1 certification in late 2025 — but the Metasys BMS platform itself remains uncertified at any SL under IEC 62443-4-2.

---

## Datacenter OT Category Gap Analysis

The following table maps datacenter OT product categories to their maximum documented certification level as of mid-2025, explicitly identifying where SL-3 and SL-4 coverage does not exist. "Critical gap" denotes product categories where no vendor holds any IEC 62443-4-2 component certification at any SL level.

| Product Category | Typical DC Use | Max SL-A Certified (mid-2025) | SL-3 / SL-4 Gap | Key Gap Details |
|---|---|---|---|---|
| UPS management / network cards | Power monitoring and remote management | SL-2: Schneider NMC3 (Oct 2024), Vertiv RDU120 (2025), Eaton NETWORK-M3 (2020) | Yes — no SL-3 card certified | Management cards are at SL-2; the UPS power conversion stage holds no IEC 62443-4-2 component cert at any SL |
| Three-phase / HV UPS (power unit) | Primary power delivery (100 kW–multi-MW) | None — no UPS power unit at any SL | Critical gap | No UPS rectifier/inverter/battery management stage from any vendor (Schneider, Eaton, Vertiv, ABB, Emerson, Mitsubishi) holds any 62443-4-2 component cert |
| Automatic Transfer Switches (ATS) | N+1 / N+N power source switching | None | Critical gap | No ATS product from any vendor (Schneider, Eaton, ABB, Emerson) has a documented IEC 62443-4-2 cert at any SL |
| Generator management systems (genset controllers) | Standby power generation | None | Critical gap | No genset controller from Basler, Woodward, ComAp, or Cummins Power has a located IEC 62443-4-2 cert |
| Managed rack PDUs | Outlet-level power distribution | SL-2: Eaton NETWORK-M3 / INDGW-M3 only; none documented for Legrand/Raritan, Server Technology, or Schneider APC rack PDU (standalone) | Yes — most vendors uncertified | Legrand/Raritan, Server Technology, and most Schneider rack PDU SKUs list only UL, CE, FCC — no IEC 62443 |
| MV/LV switchgear | Primary power distribution | SL-1: ABB ACS880 VFD (VDE cert, July 2025); SDL only: Siemens Sivacon (62443-4-1), ABB MNS (62443-4-1) | Yes — no SL-2 switchgear product cert | No switchgear-specific IEC 62443-4-2 product cert at SL-2 or above from any vendor (ABB, Siemens, Schneider, Eaton) |
| BMS / building automation controllers | Facility-wide monitoring and control | SL-3: Saia-Burgess PCD QronoX (niche); SL-2: Honeywell Advanced Plant Controller, CPO-PC500/600, Siemens Desigo CC | Partially addressed — SL-3 available only in one niche product | QronoX is SL-3 but not a datacenter-marketed product; major BAS platforms (Niagara, Metasys) are below SL-2 or uncertified |
| Chiller / cooling plant controllers | Cooling infrastructure for large DC | SL-1: Johnson Controls York YK, YZ, YVAA, YMC2, YKCP (ISASecure CSA, late 2025) | Yes | Maximum SL-1 for all ISASecure-certified chiller controllers; no SL-2 chiller controller exists |
| CRAC / CRAH unit controllers | Row-level and room-level cooling | None | Critical gap | Stulz, Airedale, Munters — no IEC 62443-4-2 product cert found for any CRAC/CRAH vendor at any SL |
| Liquid cooling (CDU, rear-door, rack manifold) | High-density AI and GPU rack cooling | None | Critical gap | Motivair, CoolIT, Asetek — no cybersecurity standard certifications located; an entirely uncertified product category |
| DCIM platforms (software) | Monitoring, analytics, capacity management | SL-2: Schneider EcoStruxure IT (via NMC3 platform integration) | Yes — standalone DCIM uncertified | Vertiv Trellis, Nlyte, Sunbird, and most dedicated DCIM platforms have no IEC 62443-4-2 component cert |
| Industrial OT switches (OT network fabric) | OT zone segmentation and east-west traffic | SL-2: Cisco IE3x00, Moxa EDR-G9010/TN-4900, Belden HiOS families | Yes — no SL-3 switch exists anywhere | Strong SL-2 coverage from three competing vendors; no industrial Ethernet switch product globally holds SL-3 |
| Industrial secure routers (zone boundary) | Zone/conduit boundary enforcement per ISA-95/99 | SL-2: Moxa EDR-G9010, TN-4900 | Yes — no SL-3 router exists | First SL-2 industrial router certs issued September 2023; no SL-3 router in any registry |
| OT firewalls | Conduit security enforcement | SL-1: Hirschmann EAGLE4007; process cert only (Fortinet FortiGate Rugged, IEC 62443-4-1 ML2) | Yes — no SL-2 OT firewall on ISASecure registry | Fortinet's IEC 62443-4-1 ML2 development process cert does not substitute for a 62443-4-2 product SL cert |
| Physical access control systems (PACS) | Badge/biometric access, mantrap, physical security | None | Critical gap | No major PACS vendor (HID, Lenel, Genetec, Bosch, Suprema) holds an IEC 62443-4-2 cert at any SL |
| Fire and smoke detection | Life safety, suppression triggering | None (SIL-2 per IEC 61508 is a different standard) | Critical gap | IEC 61508 SIL-2 is a functional safety certification, not a cybersecurity certification; they are not equivalent or interchangeable |
| Leak / water intrusion detection | Water damage prevention for IT and power equipment | None | Critical gap | No datacenter leak detection product (Pertronic, TTK, Dorlen) holds any IEC 62443-4-2 certification |

---

## Hyperscaler Procurement Posture

### Public Mandates: None at SL-3

No hyperscaler — Amazon Web Services, Microsoft Azure, Google Cloud, or Meta — has published a procurement document or vendor requirement mandating IEC 62443 SL-3 for facility OT equipment as of mid-2025.

[Amazon Web Services participates at the board level of ISASecure](https://isasecure.org/end-users/iec-62443-4-2-certified-components) alongside ExxonMobil, Shell, and Honeywell — the only hyperscaler on the ISASecure board. This signifies active end-user interest in the standard but has not translated into published OT vendor SL requirements. AWS's Shared Responsibility Model delegates physical infrastructure security to AWS, and the actual vendor security requirements for power and cooling equipment are governed by internal procurement standards not publicly disclosed.

[Microsoft Azure references IEC 62443 in its compliance documentation](https://learn.microsoft.com/en-us/azure/compliance/) and recognizes it as a relevant OT security standard, but Azure's datacenter compliance certifications are ISO 27001, SOC 1/2/3, and PCI DSS — no IEC 62443 system-level certifications for facility OT are in Azure's public compliance portfolio.

[Google Cloud](https://cloud.google.com/security/compliance) and Meta have not published OT security certification mandates for facility vendors at any SL level in publicly searchable documentation.

### Open Compute Project S.A.F.E.: Not Applicable to Facility OT

[OCP's S.A.F.E. (Security Appraisal Framework and Evaluation) program](https://www.opencompute.org/projects/safe) addresses firmware supply chain and server hardware security — BIOS/BMC trust chains, with AMI (American Megatrends) as the first certified vendor in 2025. S.A.F.E. is designed for compute hardware, not facility OT. It does not address UPS, cooling, ATS, or generator management systems and does not reference IEC 62443. It is not a substitute for, or complement to, IEC 62443-4-2 component certification for datacenter OT.

### Inferred Hyperscaler Posture (Based on Available Evidence)

Based on [Uptime Institute survey data](https://neeve.ai/resources/datacenter-ot-security-research/), regulatory reporting, and vendor certification announcements, the operative hyperscaler and large colocation operator approach to facility OT cybersecurity in mid-2025 is best characterized as:

1. Framework-aligned: IEC 62443 used as a reference architecture and risk vocabulary — not a contractual SL requirement in vendor RFQs
2. SL-2 favored for connected OT components where certification is available (NMC3, Cisco IE switches), as evidenced by vendor marketing explicitly calling out SL-2 achievement
3. Architectural compensation: defense-in-depth via unidirectional gateways, OT/IT segmentation, jump hosts, and air-gapping of power conversion equipment — compensating for the absence of SL-3 certified endpoints in the datacenter stack
4. Rising demand signal: NIS2/DORA regulatory pressure (EU-based operations) and cyber insurance underwriting queries on OT security are creating multi-year pull toward SL-2+ product certifications in procurement specifications

[Uptime Institute's 2023 survey](https://neeve.ai/resources/datacenter-ot-security-research/) found approximately 50% of operators enable remote monitoring on key OT systems, but only about 12% permit remote control — indicating that connectivity without remote actuation is the current operator norm. [Only 12% of datacenter operators reported NIS2 compliance as of late 2024](https://neeve.ai/resources/datacenter-ot-security-research/), confirming that formal regulatory-driven SL requirements have not yet been operationalized across the sector.

### Regulatory Demand Pull: NIS2, CRA, DORA

The [EU NIS2 Directive (effective October 2024)](https://symmedia.de/navigating-nis2-compliance-using-iec-62443-standards-to-strengthen-cybersecurity/) classifies large-scale datacenters (annual turnover >€10M or >50 employees) as important entities, requiring supply chain security measures, network segmentation, cryptographic controls, and incident reporting within 24 hours. IEC 62443 is the recognized technical standard for the OT layer under NIS2 compliance frameworks. NIS2 does not prescribe specific SL-T values; it mandates risk-appropriate measures that IEC 62443 operationalizes through zone/conduit SL-T assignment.

The [EU Cyber Resilience Act (CRA, mandatory from 2027)](https://www.vertiv.com/en-us/about/news-and-insights/articles/press-releases/vertiv-achieves-iec-62443-4-2-security-level-2-certification/) will impose mandatory cybersecurity requirements on connected products placed in the EU market. IEC 62443-4-2 SL-2 certification is a viable conformity pathway for OT hardware vendors under CRA. Vertiv's RDU120 announcement explicitly cites CRA readiness as a commercial driver — evidence that the 2027 mandate is already reshaping product certification roadmaps.

DORA (Digital Operational Resilience Act, applying to financial sector ICT providers from January 2025) treats facility OT resilience under its ICT risk management requirements for providers serving financial institutions, including colocation and cloud providers. DORA does not prescribe IEC 62443 SL targets but creates additional regulatory pull for OT resilience documentation.

The [ENISA Threat Landscape 2024](https://www.enisa.europa.eu/publications/enisa-threat-landscape-2024) report identifies datacenter infrastructure as critical and increasingly targeted, and ENISA has aligned with ISASecure's management in the ERNCIP (European Reference Network for Critical Infrastructure Protection) initiative — signaling European regulatory convergence on IEC 62443 as the operative OT security standard for critical infrastructure including datacenters.

---

## Strategic Implications for OT Security Practitioners

### Do not specify SL-3 in datacenter RFPs for power or cooling equipment today

No vendor can meet an SL-3 component certification requirement for UPS units, ATS equipment, CRAC/CRAH controllers, generator management systems, rack PDUs, liquid cooling systems, or OT network switches as of mid-2025. Specifying SL-3 in these categories produces either no compliant bids, false SL-C claims being misrepresented as SL-A, or vendor responses citing framework alignment without certifiable evidence. The SL-3 supply-side does not exist for datacenter OT product categories. Specifying SL-3 for BMS controllers is marginally achievable only through the Saia-Burgess PCD QronoX, a niche product not marketed into typical datacenter BMS architectures.

When writing RFP security requirements, the precise language matters: require "IEC 62443-4-2 component security level achieved (SL-A)" and require vendors to provide the certificate number and certification body name, enabling verification against the [ISASecure registry](https://isasecure.org/end-users/iec-62443-4-2-certified-components) or [IECEE certificate database](https://certificates.iecee.org). Vendor claims of "IEC 62443 compliance," "meets IEC 62443 requirements," or "SL-C 2 capability" without a certificate number and CB reference are not equivalent to SL-A certification and should not be accepted as such in compliance documentation.

### Specify SL-2 as the mandatory minimum for network-connected OT components — it is achievable and verifiable

SL-2 is achievable today across UPS management cards (Schneider NMC3, Vertiv RDU120, Eaton NETWORK-M3), OT network switches (Cisco IE3x00 series, Belden/Hirschmann HiOS families), industrial routers (Moxa EDR-G9010, TN-4900), BMS controllers (Honeywell Advanced Plant Controller, Siemens Desigo CC), and industrial computers (Moxa UC-8200). Requiring the vendor-provided certificate number and certifying body as a supply chain deliverable — verifiable against public registries — is both contractually feasible and creates an audit trail. Additionally, the IEC 62443-4-1 SDLA certification of a vendor's development organization (Cisco, Belden, Moxa, Honeywell BT all hold this) is a useful secondary requirement signaling that the vendor's development process is systematically secure, even for products not yet individually certified to SL-2.

### For SL-3 equivalent protection at the system level, apply architectural compensating controls at the zone/conduit layer

The IEC 62443-3-3 system-security standard provides the mechanism: where certified SL-3 components are not available — the current reality for all datacenter OT product categories — the system-level SL-T of a zone or conduit can approach SL-3 through layered architectural controls. This is explicitly supported by the 62443 framework's zone/conduit methodology, which is distinct from component-level SL-A certification. Practical compensating control architecture includes:

- Unidirectional security gateways (data diodes) on OT-to-IT conduits for power and cooling telemetry, preventing any inbound commands to OT devices from the IT network or external systems
- Micro-segmented OT zones using the Purdue reference model or ISA-95 zone model, with separate network segments for each functional category (UPS, cooling, BMS, access control), enforced by SL-2 certified switches (Cisco IE3x00, Belden HiOS)
- Hardware-enforced jump hosts with multi-factor authentication and session recording for any remote access to OT, replacing direct VPN connections to OT devices
- Air-gapping of power conversion equipment (UPS power stages, ATS, generator controllers) with network management cards (NMC3, RDU120, NETWORK-M3) as the sole network-facing interface — so that the certified SL-2 card, not the uncertified power electronics, represents the network boundary

This architectural approach is the current de facto hyperscaler posture and is consistent with achieving system-level SL-T 3 under an IEC 62443-3-3 assessment, even where individual components are SL-2 certified.

### Watch Saia-Burgess PCD QronoX as the operational blueprint for SL-3 facility control

The [PCD QronoX / Honeywell ControlEdge PCD (ISASecure CSA 1.0.0 Level 3, certificate HON 2403128 C001)](https://www.isasecure.org/hubfs/SAIA-Burgess%20PCD%20Controller.pdf) is the only building-facility-adjacent controller globally with an ISASecure SL-3 component certification. For OT security consultants specifying future BMS procurement or advising on what a certified SL-3 facility controller looks like in practice, this certificate defines the evaluation requirements, security control profile, and documentation package. The same [Honeywell Building Technologies SDLA pipeline and BYHON certification body](https://isasecure.org/end-users/iec-62443-4-1-certified-development-organizations) that produced the QronoX SL-3 cert has already demonstrated repeatability through the Honeywell Advanced Plant Controller SL-2 cert (December 2023) and CPO-PC500/600 SL-2 cert (March 2024). The QronoX should be treated as the reference product and Honeywell BT / BYHON as the reference pipeline for any future datacenter BMS controller SL-3 certification engagement.

### Expect SL-2 to become procurement table stakes through NIS2/CRA pressure by 2026–2027

The current trajectory of product certification activity shows vendors responding to anticipated regulatory pressure ahead of enforcement deadlines: Schneider Electric upgraded the NMC3 from SL-1 to SL-2 in October 2024; Vertiv launched the RDU120 at SL-2 with explicit CRA positioning in 2025; Moxa achieved first-ever SL-2 router and host device certifications in 2022–2023. As NIS2 member state transposition enforcement matures in 2025–2026 and the CRA 2027 deadline approaches, the combination of regulatory compliance requirements, cyber insurance OT underwriting, and hyperscaler supply-chain security interest will drive SL-2 certification into RFQ requirements for EU-market and globally significant datacenter projects. SL-2 will become the commercial floor by 2027 in the same way that product safety certifications (CE, UL) are now universally expected. SL-3 mandates for datacenter facility OT remain a 3–5 year horizon, contingent on at least one major hyperscaler or national regulatory body embedding SL-3 as a contractual requirement — which has not yet occurred.

---

## Certification Registries and Verification Sources

All IEC 62443 product certification claims should be verified against the primary registries below before use in procurement specifications, audit responses, or regulatory compliance submissions. Certificates are time-limited and subject to renewal; do not rely on vendor-published documentation alone.

| Registry / Body | Scheme | Primary Scope | URL |
|---|---|---|---|
| ISASecure CSA Component Registry | ISASecure CSA (IEC 62443-4-2) | All ISASecure-certified components; all SLs; includes SL-3 products | [isasecure.org — IEC 62443-4-2 components](https://isasecure.org/end-users/iec-62443-4-2-certified-components) |
| ISASecure SSA System Registry | ISASecure SSA (IEC 62443-3-3) | All ISASecure-certified systems; all SLs (currently all SL-1) | [isasecure.org — IEC 62443-3-3 systems](https://isasecure.org/end-users/iec-62443-3-3-certified-systems) |
| ISASecure SDLA Development Process Registry | ISASecure SDLA (IEC 62443-4-1) | Certified development organizations | [isasecure.org — IEC 62443-4-1 organizations](https://isasecure.org/end-users/iec-62443-4-1-certified-development-organizations) |
| IECEE Industrial Cybersecurity Certificate Search | IECEE OD-2061 | IECEE-scheme certifications: Siemens SICAM 8, Moxa, Cylus CylusOne | [certificates.iecee.org](https://certificates.iecee.org) |
| TÜV SÜD Product Finder | TÜV SÜD proprietary / IECEE | Siemens SCALANCE, WinCC OA, Desigo CC; Phoenix Contact PLCnext history | [tuvsud.com product finder](https://www.tuvsud.com/en/services/product-testing-and-certification/product-finder) |
| TÜV Rheinland FS-Products Database | TÜV Rheinland (IECEE / ISASecure chartered CB) | Phoenix Contact, Rockwell ControlLogix, ABB (62443-4-1), Fortinet (62443-4-1 ML2) | [fs-products.tuvasi.com](https://fs-products.tuvasi.com) |
| TÜV NORD Product Certification | TÜV NORD CERT GmbH (IECEE OD-2061) | Siemens SICAM 8 CP-8010/CP-8012 v05.40 | [tuev-nord.de product certification](https://www.tuev-nord.de/en/company/certification/product-certification/) |
| Bureau Veritas CPS Technology | IECEE OD-2061 / ISASecure chartered CB | Moxa routers and host devices; Cylus CylusOne; Cervello platform | [bureauveritas.com certification](https://www.bureauveritas.com/certification) |
| BYHON (Honeywell Consulting) | ISASecure chartered CB | GE Power Conversion HPCi, Bitron µUP, Saia-Burgess PCD QronoX, most ISASecure CSA SL-3 certs | Operated through ISASecure program — certs appear in [ISASecure CSA Registry](https://isasecure.org/end-users/iec-62443-4-2-certified-components) |

---

*Research compiled July 2025. All certification statuses reflect public registry data as of that date. Certificates are time-limited; verify currency against issuing body registries before use in any procurement specification, audit response, or regulatory submission. No datacenter-native product category held IEC 62443-4-2 SL-3 certification at time of publication. SL-4 has not been achieved by any commercial product under any certification scheme, globally.*
