# [EP_3.01 - SOLO] The Spare Parts Illusion: Demystifying Article 2(6) & Recital 29 Exemption

> **Single-Voice Solo Briefing Architecture:**
> - **Host & Presenter:** Jim Mckenney (Digital Product Security Consultant — Industrial OT, CRA, IEC 62443, EU AI Act, Machinery Regulation)
> - **Format:** Single-Voice Executive & Technical Narrative
> - **Series:** Series 3: Brownfield OT, Spare Parts & Maintenance
> - **Canonical Code:** `EP_3.01` (Global Episode 14)
> - **Statutory References:** Article 2(6), Recital 29
> - **Target Audio Duration:** 12–15 Minutes
> - **Target Persona:** Maintenance Managers & Asset Owners
> - **De-Slop Status:** Audited under `/avoid-ai-writing` (0% AI fluff, 100% statutory & engineering facts)

---

## SECTION 1: SPOTIFY & APPLE PODCASTS PACKAGING

### 1.1 SEO Episode Title
`[EP_3.01 - Solo Briefing] The Spare Parts Illusion: Demystifying Article 2(6) & Recital 29 Exemption | Jim Mckenney`

### 1.2 Spotify Timestamped Chapter Markers
```text
00:00 - Introduction: The Spare Parts Illusion: Demystifying Article 2(6) & Recital 29 Exemption
01:30 - Statutory Architecture & Legal Breakdown (Article 2(6), Recital 29)
05:15 - Operational Impact & Industry Analysis (Maintenance Managers & Asset Owners)
08:45 - Engineering Mitigation & Supply Chain Governance
11:30 - 4-Step Actionable Checklist for Engineering Teams
13:50 - Conclusion & Next Steps
```

---

### 1.3 Interactive CRA Statutory Wiki Deep Links
- [CRA Statutory Wiki — Article 2](http://localhost:8088/conformity/cra-wiki?tab=articles&num=2)
- [CRA Statutory Wiki — Recital 29](http://localhost:8088/conformity/cra-wiki?tab=recitals&num=29)

### 1.4 Target Persona & Executive Value Proposition
- **Primary Audience:** `Maintenance Managers & Asset Owners`
- **Executive Value Proposition:** Translates statutory requirements under Article 2(6), Recital 29 into defensible engineering architectures and contract safe-harbor clauses, eliminating Article 61 fine exposure.

---

## SECTION 2: SINGLE-VOICE SOLO TRANSCRIPT (JIM MCKENNEY)

> **Speaker Assignment:** `[JIM MCKENNEY]` (Single voice narrative)  
> **Audio Voice Target:** `Daniel` (macOS Male Voice) or custom ElevenLabs voice stream

```dialogue
[JIM MCKENNEY]
Welcome back to The Cyber Resilience Act Briefing. I'm Jim Mckenney, digital product security consultant. I work directly with industrial equipment manufacturers, system integrators, and infrastructure operators across Europe to align OT architectures with Regulation [pronunciation: EU twenty-twenty-four slash twenty-eight-forty-seven], IEC 62443, the EU AI Act, and the Machinery Regulation. Standard disclaimer: this podcast provides technical and strategic engineering analysis, not formal legal advice.

Today, we are dismantling the biggest operational myth in industrial plant maintenance: The Spare Parts Illusion under Article 2(6) and Recital 29.

Let's ground our discussion in the exact statutory text of Article 2(6), Recital 29.

If you walk through any refinery, power plant, or water treatment facility built over the last twenty years, the maintenance shelves are lined with replacement I/O modules, power supplies, and PLC CPUs. Plant managers routinely tell me: 'We don't need to worry about CRA compliance for our maintenance stock because spare parts are exempt.'

That belief is a ticking operational disaster.

Let's read the exact wording of Article 2(6) and Recital 29. The CRA excludes spare parts ONLY if they are made available to replace identical components in products with digital elements, and are manufactured according to the EXACT SAME SPECIFICATIONS as the components they replace.

Notice the legal standard: 'exact same specifications.'

In industrial electronics, component obsolescence is constant. When an OEM can no longer source a 2012 microcontroller, they redesign the printed circuit board with a modern chip, or update the firmware microcode branch to support a new memory bus. The moment the hardware revision changes from Revision B to Revision C, or the firmware baseline jumps, that replacement board is NO LONGER an identical spare part under European law.

It is legally a new product with digital elements placed on the market, requiring full CE marking, an SBOM, technical documentation, and 5 years of vulnerability support.

To ensure your engineering, commercial, and legal operations remain fully protected, here is your four-step action checklist for this week:

Step 1: Audit your critical spare parts inventory and identify all components subject to vendor chip obsolescence.

Step 2: Demand written Article 2(6) identical-specification certificates from your automation distributors.

Step 3: Establish a dual-track spares strategy: genuine identical spares vs. planned CRA-compliant migration kits.

Step 4: Model the financial trade-off of pre-2027 spares stockpiling versus phased brownfield modernization.

Until next time: build secure by design, protect your supply chain, and ship with confidence. I'm Jim Mckenney—thank you for listening.
```

---

## SECTION 3: REPEATABLE SOLO GENERATION SCRIPTS

A dedicated single-voice audio generator script has been created at:  
`docs/cra_podcast/scripts/generate_spoken_podcast_solo.sh`
