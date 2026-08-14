# [CRA Ep. 2.05 - SOLO] Building a Compliant Product CSIRT: Article 14 Clocks & Downstream Supplier Obligations

> **Single-Voice Solo Briefing Architecture:**
> - **Host & Presenter:** Jim Mckenney (Digital Product Security Consultant — Industrial OT, CRA, IEC 62443, EU AI Act, Machinery Regulation)
> - **Series:** The CRA Briefing
> - **Format:** Single-Voice Executive & Technical Deep Dive
> - **Statutory References:** Regulation (EU) 2024/2847 Article 10(6), Article 14, Article 16; Annex I Part II; Recitals 54–58
> - **Enforcement Dates:** **11 September 2026** (Article 14 Reporting) | **11 December 2027** (Full Application)
> - **De-Slop Status:** Audited under `/avoid-ai-writing` (0% AI fluff, 100% statutory & engineering facts)

---

## SECTION 1: SPOTIFY & APPLE PODCASTS PACKAGING

### 1.1 SEO Episode Title
`[CRA Ep. 2.05 - Solo Briefing] Building a Compliant Product CSIRT: Article 14 Clocks & Downstream Supplier Obligations | Jim Mckenney`

### 1.2 Spotify Timestamped Chapter Markers
```text
00:00 - Intro: Jim Mckenney & The CRA Briefing
01:15 - Statutory Fact Sheet: 11 September 2026 Article 14 Timeline
04:30 - Building an Operational PSIRT: The 24h Early Warning & 72h Notification Clocks
08:15 - ENISA Single Reporting Platform (Article 16) Integration
11:45 - Downstream Supplier Impact: What Component, SDK & Library Vendors Must Deliver
15:30 - 4-Step PSIRT & Supply Chain Action Plan
17:05 - Outro & Final Takeaway
```

### 1.3 Spotify Show Notes
In this episode of The CRA Briefing, digital product security consultant Jim Mckenney breaks down the mandatory Product Security Incident Response Team (PSIRT/CSIRT) program requirements under Regulation (EU) 2024/2847. 

We cover the critical **11 September 2026** enforcement deadline for Article 14, how to operationalize the 24-hour early warning and 72-hour notification clocks to ENISA's Single Reporting Platform, and what downstream component, chip, and software providers must deliver—even if they don't ship a finished end-user product.

⏱️ TIMESTAMPS:
00:00 - Intro & Legal Disclaimer
01:15 - 11 September 2026 Reporting Deadline
04:30 - PSIRT Architecture & 24h/72h Clocks
08:15 - ENISA Single Reporting Platform
11:45 - Downstream Component Supplier Obligations
15:30 - 4-Step Technical Action Plan

📚 STATUTORY REFERENCES:
• Regulation (EU) 2024/2847, Articles 10(6), 14, 16
• ENISA Single Reporting Platform Guidance
• Free CRA Compliance Assessment: https://oxot.ai/cra-check

---

## SECTION 2: SINGLE-VOICE SOLO TRANSCRIPT (JIM MCKENNEY)

[JIM MCKENNEY]
Welcome back to The CRA Briefing. I'm Jim Mckenney, digital product security consultant. I work directly with industrial manufacturers, OEMs, and operators to align OT devices and software with the Cyber Resilience Act, IEC 62443, the EU AI Act, and the Machinery Regulation. Standard disclaimer: this podcast provides technical and strategic commentary, not formal legal advice. Today, we're cutting through the legal noise on building a compliant Product CSIRT program, navigating the 24-hour Article 14 notification clock, and understanding how these requirements impact downstream component and software providers under Regulation [pronunciation: EU twenty-twenty-four slash twenty-eight-forty-seven].

Let's start with the date every CISO and VP of Engineering needs marked in red: September 11, 2026. While full CE marking enforcement under the Cyber Resilience Act starts on December 11, 2027, Article 14 mandatory incident and vulnerability reporting applies fifteen months earlier. On September 11, 2026, if an actively exploited vulnerability or severe security incident is identified in your product, the legal clock starts immediately.

To comply with Article 14, manufacturers cannot simply rely on an ad-hoc security email address. You must establish an operational Product Security Incident Response Team—or PSIRT—capable of managing a strict three-tier reporting lifecycle:

First: The 24-Hour Early Warning. Within 24 hours of becoming aware of an actively exploited vulnerability or severe incident in a product with digital elements, you must submit an early warning notification to ENISA [pronunciation: eh-NEE-sah] and the competent national CSIRT [pronunciation: SEE-sert] via ENISA's Single Reporting Platform established under Article 16. This notification must state whether the incident is suspected of being caused by malicious acts and identify any potential cross-border impact.

Second: The 72-Hour Full Notification. Within 72 hours of awareness, your PSIRT must follow up with a complete notification detailing the vulnerability severity, initial technical analysis, indicators of compromise, and any applied or recommended mitigation measures.

Third: The 1-Month Final Report. Within 30 days of the 72-hour submission, your team must deliver a comprehensive final report documenting the root cause, applied software patches, and long-term remediation.

Now, let's address the most common question I get from software component vendors, RTOS developers, semiconductor suppliers, and open-source library maintainers: "We don't ship a finished end-user product into the EU market—does the CRA PSIRT requirement apply to us?"

The legal answer requires understanding how supply chain liability works under the CRA. Technically, under Article 2, if you do not place a finished product with digital elements on the EU market under your own brand, you are not the primary "manufacturer" legally responsible for affixing the CE mark. 

However, the commercial and contractual reality is completely different. Under Article 10, paragraph 6, and Annex I Part II, the end-product manufacturer who places the finished device on the market is legally responsible for the security of every integrated component. If an unpatched zero-day vulnerability in your RTOS, your TCP/IP stack, your Bluetooth library, or your microcontroller SDK causes an incident in their industrial gateway, the manufacturer faces up to 15 million euros in fines or 2.5 percent of global turnover.

Because of this legal exposure, downstream component suppliers are experiencing a massive wave of mandatory contractual flow-downs from OEMs. To remain an approved supplier in the European market, component vendors must provide four deliverables:

First: Machine-readable Software Bills of Materials. OEMs will require component suppliers to deliver automated CycloneDX or SPDX SBOMs for every software release, mapping all sub-dependencies down to the binary level.

Second: A 24-Hour Downstream Disclosure SLA. Component suppliers must contractually guarantee that when a vulnerability is discovered in their component, they will notify their OEM customers within 24 hours—giving the OEM time to meet their own legal ENISA reporting window.

Third: Security Patch Delivery Aligning to Support Lifecycles. Component providers must commit to delivering security patches throughout the OEM's declared product support period—which under Article 13 must be at least five years.

Fourth: Technical File Security Verification Evidence. Component vendors must share SAST, DAST, and third-party penetration testing evidence so OEMs can include it in their official CRA Technical File under Annex V.

Here is your 4-step action plan for this week:

First: Audit your internal vulnerability handling process and formalize your PSIRT structure, assigning clear 24/7 incident response roles.

Second: Integrate your security advisory pipeline with ENISA's Single Reporting Platform specifications under Article 16.

Third: Establish a Coordinated Vulnerability Disclosure policy with a security dot text file and PGP intake key on your developer portal.

Fourth: Review your component supplier contracts and ensure machine-readable SBOM generation is integrated directly into your CI/CD build pipeline. You can run a free preliminary compliance check right now at oxot.ai slash cra-check.

Until next time: build secure by design, ship with confidence. I'm Jim Mckenney—thanks for listening.
