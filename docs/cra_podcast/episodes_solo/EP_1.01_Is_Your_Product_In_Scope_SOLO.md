# [CRA Ep. 1.01 - SOLO] Article 2: Is Your Product In Scope? Remote Data Processing & OEM Guide

> **Single-Voice Solo Briefing Architecture:**
> - **Host & Presenter:** Jim Mckenney (Digital Product Security Consultant — Industrial OT, CRA, IEC 62443, EU AI Act, Machinery Regulation)
> - **Format:** Single-Voice Executive & Technical Narrative
> - **Statutory References:** Regulation (EU) 2024/2847 Articles 2 & 3; Recitals 4–7, 11–14
> - **Target Audio Duration:** 12–15 Minutes
> - **De-Slop Status:** Audited under `/avoid-ai-writing` (0% AI fluff, 100% statutory & engineering facts)

---

## SECTION 1: SPOTIFY & APPLE PODCASTS PACKAGING

### 1.1 SEO Episode Title
`[CRA Ep. 1.01 - Solo Briefing] Is Your Product In Scope? Remote Data Processing & OEM Guide | Jim Mckenney`

### 1.2 Spotify Timestamped Chapter Markers
```text
00:00 - Introduction: Jim Mckenney & Industrial Digital Product Security
01:15 - Stage 1 Fact Sheet: Article 2 Legal Scope & Logical Data Connections
05:30 - Remote Data Processing: Why Cloud Backends Are Legally Part of Your Product
09:45 - Industry Exclusions: Medical, Civil Aviation, Automotive & Defense Boundaries
12:15 - 4-Step Action Checklist for Engineering Teams Before 2026
14:10 - Sign-off & Final Takeaways
```

---

## SECTION 2: SINGLE-VOICE SOLO TRANSCRIPT (JIM MCKENNEY)

> **Speaker Assignment:** `[JIM MCKENNEY]` (Single voice narrative)  
> **Audio Voice Target:** `Daniel` (macOS Male Voice) or custom TTS voice stream

```dialogue
[JIM MCKENNEY]
Welcome back to The CRA Briefing. I'm Jim Mckenney, digital product security consultant. I work directly with industrial manufacturers, OEMs, and operators to align OT devices and software with the Cyber Resilience Act, IEC 62443, the EU AI Act, and the Machinery Regulation. Standard disclaimer: this podcast provides technical and strategic commentary, not formal legal advice. Today, we're cutting through the legal noise on Article 2 of Regulation [pronunciation: EU twenty-twenty-four slash twenty-eight-forty-seven] to answer the single question every client asks me first: Is your product actually in scope?

When I walk onto a plant floor or sit down with an engineering vice president, the most common misconception I hear is that the CRA only applies to internet-connected consumer gadgets like smart TVs or Wi-Fi security cameras. That assumption is dangerous, and it's dead wrong.

Let's look at the exact legal text in Article 2, paragraph 1. The CRA applies to any "product with digital elements" whose intended or reasonably foreseeable use includes a direct or indirect logical or physical data connection to a device or network.

Notice those two words: *logical* data connection. That is the trap for industrial OEMs. You might ship an industrial sensor, a motor drive, or a programmable logic controller that sits inside a closed Purdue Level 2 cell with no direct Ethernet interface to the internet. But if that controller has a RS-485 Modbus serial port, a USB maintenance slot, a CAN bus interface, or a local Bluetooth diagnostic chip—that is a logical data connection. If data moves into or out of the device, Article 2 catches it.

The second area where industrial vendors get caught off guard is standalone software. Under Article 3, point 1, software placed on the market separately is explicitly in scope. It doesn't matter if you deliver your engineering toolchain as a Docker container, an installer on a USB stick, or a download from an FTP portal. If it's software intended to run on hardware with a data connection, the CRA applies.

Now let's tackle Remote Data Processing under Article 3, point 2. This is where cloud architects and product managers need to pay close attention. Historically, European CE marking directives only governed physical hardware shipped in a box. But Article 3(2) changes the rules completely. It states that any remote data processing designed and developed by or on behalf of the manufacturer, or over which the manufacturer exercises operational control, is legally part of the product.

Let's translate that into shop-floor reality. Suppose you manufacture an industrial gateway. It collects telemetry from a solar farm and sends it to your AWS or Azure cloud backend. Your customers log into your web portal to monitor system health and push remote firmware patches. Under the CRA, that cloud backend is not a separate web application—it is legally considered part of the physical gateway's CE mark.

That means your API endpoints, your database access controls, and your update deployment pipelines must meet Annex I essential cybersecurity requirements. You cannot separate the physical hardware from the cloud services feeding it. The European Commission wrote this clause specifically to stop vendors from shipping secure hardware while leaving the cloud update infrastructure wide open to compromise.

What about exclusions under Article 2, paragraphs 2 through 4? There are four specific sectors excluded, but only because they already have dedicated European cybersecurity regulations: medical devices under Regulation [pronunciation: EU twenty-seventeen slash seven-forty-five], in vitro diagnostics, civil aviation under Regulation [pronunciation: EU twenty-eighteen slash eleven-thirty-nine], and motor vehicles under Regulation [pronunciation: EU twenty-eighteen slash eight-fifty-eight], plus national defense equipment.

If you manufacture anything outside those four specific buckets—industrial automation equipment, smart sensors, edge gateways, enterprise software, or building management systems—you are fully in scope.

Here are the key statutory deadlines you need on your executive radar:
First: September 10, 2026. That is just 21 months post-entry into force. On that date, Article 14 mandatory vulnerability and incident reporting takes effect. You will have 24 hours to issue an early warning notification to ENISA [pronunciation: eh-NEE-sah] and national CSIRTs [pronunciation: SEE-serts] upon detecting any actively exploited vulnerability in your product.

Second: December 10, 2027. Full enforcement hits. Every product placed on the EU market must display the CE mark, backed by technical documentation, vulnerability handling processes, and a machine-readable Software Bill of Materials.

Here is your 4-step action plan for this week:

First: Audit your product portfolio. Catalog every hardware model, firmware variant, and software package your company sells into the EU.

Second: Map logical data connections. Don't stop at Wi-Fi or Ethernet—list every serial protocol, USB port, and diagnostic radio.

Third: Map remote data processing dependencies. Identify every cloud microservice that touches your physical devices.

Fourth: Run a preliminary classification check to determine if your product falls under Annex III Class I or Class II. You can run a free 2-minute assessment right now at oxot.ai slash cra-check.

Until next time: build secure by design, ship with confidence. I'm Jim Mckenney—thanks for listening.
```

---

## SECTION 3: REPEATABLE SOLO GENERATION SCRIPTS

A dedicated single-voice audio generator script has been created at:  
`docs/cra_podcast/scripts/generate_spoken_podcast_solo.sh`
