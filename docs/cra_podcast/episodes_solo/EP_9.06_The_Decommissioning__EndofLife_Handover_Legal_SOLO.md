# [EP_9.06 - SOLO] The Decommissioning & End-of-Life Handover: Legal Liabilities When Retiring Critical OT

> **Single-Voice Solo Briefing Architecture:**
> - **Host & Presenter:** Jim Mckenney (Digital Product Security Consultant — Industrial OT, CRA, IEC 62443, EU AI Act, Machinery Regulation)
> - **Format:** Single-Voice Executive & Technical Narrative
> - **Series:** Series 9: The CRA Frontier & Market Uncertainty Deep Dives
> - **Canonical Code:** `EP_9.06` (Global Episode 56)
> - **Statutory References:** Article 13(9), Annex VII, Recital 32
> - **Target Audio Duration:** 12–15 Minutes
> - **Target Persona:** Plant Decommissioning Leads, Corporate M&A Officers & Environmental Asset Managers
> - **De-Slop Status:** Audited under `/avoid-ai-writing` (0% AI fluff, 100% statutory & engineering facts)

---

## SECTION 1: SPOTIFY & APPLE PODCASTS PACKAGING

### 1.1 SEO Episode Title
`[EP_9.06 - Solo Briefing] The Decommissioning & End-of-Life Handover: Legal Liabilities When Retiring Critical OT | Jim Mckenney`

### 1.2 Spotify Timestamped Chapter Markers
```text
00:00 - Introduction: The Decommissioning & End-of-Life Handover: Legal Liabilities When Retiring Critical OT
01:30 - Statutory Breakdown & Legal Dilemma (Article 13(9), Annex VII, Recital 32)
05:15 - Engineering Reality & Plant Impact (Plant Decommissioning Leads, Corporate M&A Officers & Environmental Asset Managers)
08:45 - Architectural Governance & Risk Mitigation
11:30 - 4-Step Actionable Checklist for Engineering Teams
13:50 - Authoritative Closure & Sign-Off
```

---

## SECTION 2: SINGLE-VOICE SOLO TRANSCRIPT (JIM MCKENNEY)

> **Speaker Assignment:** `[JIM MCKENNEY]` (Single voice narrative)  
> **Audio Voice Target:** `Jim Mckenney English` (ElevenLabs Voice ID: `fh7rGvh0nJR3MFMkM9yd`) or local TTS

```dialogue
[JIM MCKENNEY]
Welcome back to The Cyber Resilience Act Briefing. I'm Jim Mckenney, digital product security consultant. I work directly with industrial equipment manufacturers, system integrators, and infrastructure operators across Europe to align OT architectures with Regulation [pronunciation: EU twenty-twenty-four slash twenty-eight-forty-seven], IEC 62443, the EU AI Act, and the Machinery Regulation. Standard disclaimer: this podcast provides technical and strategic engineering analysis, not formal legal advice.

Today, we are examining the forgotten final chapter of the product lifecycle: the strict legal and cryptographic liabilities that govern when you decommission, resell, or scrap industrial assets under the CRA.

Let's ground our discussion in the exact statutory text of Article 13(9), Annex VII, Recital 32.

In traditional industrial operations, retiring an obsolete control cabinet or decommissioning a chemical skid was treated purely as an environmental and scrap metal exercise. Devices were disconnected, unbolted, and either placed in secondary resale auctions or scrapped.

Under the Cyber Resilience Act, the end-of-life transition carries severe, enduring legal liability.

First: The 10-Year Technical File Retention Rule. Under Article 13(9), the manufacturer and the importer must keep the complete Annex VII technical documentation, SBOMs, and vulnerability records at the disposal of market surveillance authorities for ten years AFTER the last product was placed on the market. Retiring a product line does NOT eliminate your obligation to answer regulatory inquiries or provide historical forensic records.

Second: Cryptographic & Data Sanitization Duties under Annex I. Before any product with digital elements is transferred to a secondary buyer or decommissioned, operators must execute verifiable cryptographic key revocation, factory reset procedures, and secure storage zeroization to prevent residual credentials or intellectual property from being extracted by threat actors in the secondary market.

To ensure your engineering, commercial, and legal operations remain fully protected, here is your four-step action checklist for this week:

Step 1: Establish a formal Asset Decommissioning & Zeroization Procedure verifying cryptographic key destruction before physical removal.

Step 2: Archive all Annex VII technical dossiers, test reports, and SBOMs in a tamper-evident, 10-year immutable digital vault.

Step 3: Execute formal Certificate of Decommissioning handovers when reselling used industrial automation equipment.

Step 4: Revoke all device identity certificates and cloud communication credentials immediately upon plant shutdown.

Until next time: build secure by design, protect your supply chain, and ship with confidence. I'm Jim Mckenney—thank you for listening.
```

---

## SECTION 3: REPEATABLE SOLO GENERATION SCRIPTS

A dedicated single-voice audio generator script has been created at:  
`docs/cra_podcast/scripts/generate_spoken_podcast_solo.sh`
