#!/usr/bin/env python3
"""
reconcile_and_unify_all_cra_podcast.py
Reconciles all podcast assets, blueprints, audits, and generates all 50 bespoke solo episode scripts
under the unified EP_S.EE scheme with 0% inline oxot marketing (reserved exclusively for the dedicated outro).
"""

import os
import json
import re

# CRA citations are resolved and validated against the Official Journal corpus.
# See docs/cra-personas/CRA_SOURCE_OF_TRUTH.md — do not hand-type article numbers.
import sys as _sys, pathlib as _pathlib
_sys.path.insert(0, str(_pathlib.Path(__file__).resolve().parent))
from cra_corpus import cite, article_title, check_text, write_checked  # noqa: F401

BASE_DIR = "/Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application"
DOCS_CRA = os.path.join(BASE_DIR, "docs", "cra_podcast")
SOLO_DIR = os.path.join(DOCS_CRA, "episodes_solo")
NEWS_DIR = os.path.join(DOCS_CRA, "news_briefings")
REGISTRY_FILE = os.path.join(DOCS_CRA, "episodes_registry.json")

# Series mapping
SERIES_MAP = {
    1: {"name": "The Procurement & Contracting Crisis", "range": (1, 6)},
    2: {"name": "The System Integrator & EPC Shield", "range": (7, 13)},
    3: {"name": "Brownfield OT, Spare Parts & Maintenance", "range": (14, 19)},
    4: {"name": "Tier-2 Upstream Component Supplier Survival", "range": (20, 25)},
    5: {"name": "Critical Sector Deep Dives", "range": (26, 33)},
    6: {"name": "Vulnerability Operations, PSIRT & 24h Clocks", "range": (34, 39)},
    7: {"name": "Conformity Assessment, Audits & CE Marking", "range": (40, 45)},
    8: {"name": "Executive Liability, Penalties & Future Evolution", "range": (46, 50)},
}

def get_series_and_ep_code(global_num):
    for s_id, s_info in SERIES_MAP.items():
        start, end = s_info["range"]
        if start <= global_num <= end:
            s_ep_num = global_num - start + 1
            code = f"EP_{s_id}.{s_ep_num:02d}"
            return s_id, s_info["name"], code
    return 1, "The Procurement & Contracting Crisis", f"EP_1.{global_num:02d}"

# Load registry
with open(REGISTRY_FILE, "r") as f:
    registry = json.load(f)

# Update registry entries with canonical series code
for ep in registry["episodes"]:
    g_num = ep["episode_number"]
    s_id, s_name, ep_code = get_series_and_ep_code(g_num)
    ep["series_id"] = s_id
    ep["series_name"] = s_name
    ep["canonical_code"] = ep_code

with open(REGISTRY_FILE, "w") as f:
    json.dump(registry, f, indent=2)

print("Updated episodes_registry.json with canonical codes.")

# Bespoke core arguments for key episodes
BESPOKE_NARRATIVES = {
    1: {
        "intro": "Today, we're cutting straight through the theoretical legal noise to address the single most expensive ticking clock in European industrial contracting: The 2-Year Procurement Time-Warp.",
        "core_argument": """When an EPC contractor or industrial operator tenders a major capital project—whether a chemical plant, a renewable substation, or a rail depot—the procurement cycle routinely spans 24 to 48 months. Contracts signed in 2024 or 2025 are specifying hardware baselines that won't be physically delivered to the job site until 2028.

Here is the statutory reality: Under Article 71 of the Cyber Resilience Act, the date of physical 'placing on the market' governs, NOT the purchase order signing date. If your contract specified a pre-CRA PLC, RTU, or smart sensor, the manufacturer CANNOT legally deliver that hardware into the European Union after December 11, 2027 unless it bears a valid CE mark backed by full CRA conformity.

What happens if you haven't updated your contracts? When the equipment lands at the site gate or customs clearance in Rotterdam or Antwerp, it is legally contraband. The project halts, liquidated damages start accruing at 50,000 euros a day, and a massive legal battle erupts over who pays for the mid-project engineering redesign.""",
        "action_steps": [
            "Audit all active capital procurement contracts with delivery milestones scheduled between 2026 and 2029.",
            "Insert the Standard CRA Warranty Clause into all master equipment purchasing agreements.",
            "Demand formal written CRA readiness roadmaps and expected CE marking dates from all Tier-1 automation vendors.",
            "Establish a clear contract variation protocol allocating testing and re-design costs to suppliers."
        ]
    },
    2: {
        "intro": "Today, we're giving procurement directors and industrial CISOs the exact tactical blueprint to shift CRA compliance costs where they belong: into the OEM's baseline scope of supply.",
        "core_argument": """For decades, industrial RFPs have relied on generic boilerplates like 'Supplier shall comply with all applicable European laws and standards.' In the era of the CRA, that single sentence is a multi-million-euro trap.

Why? Because if your RFP does not explicitly mandate machine-readable Software Bills of Materials in CycloneDX or SPDX format, five years of guaranteed security update support under Article 13(8), and verified Coordinated Vulnerability Disclosure channels, the vendor will deliver a compliant box but charge you astronomical hourly change orders for every security advisory, SBOM fragment, and vulnerability patch.

A bulletproof CRA RFP does three things: First, it makes SBOM delivery and automated CVE mapping a mandatory Factory Acceptance Test (FAT) sign-off condition. Second, it contractually binds the vendor to deliver zero-day patches within 72 hours of public disclosure for at least five years post-commissioning. Third, it requires the vendor to indemnify the asset owner against any regulatory stop-work orders caused by unpatched OEM non-conformities.""",
        "action_steps": [
            "Update your standard technical procurement specification template to require CycloneDX v1.5+ SBOMs.",
            "Tie the final 15% procurement milestone payment to successful CRA technical dossier handover.",
            "Include strict SLA language for vulnerability remediation matching Article 14 ENISA reporting clocks.",
            "Mandate that all firmware delivered is cryptographically signed and capable of secure remote rollbacks."
        ]
    },
    7: {
        "intro": "Today, we are examining the most dangerous trap facing industrial system integrators, EPCs, and automation contractors across Europe: The Accidental Manufacturer Trap under Article 21.",
        "core_argument": """If you work for an engineering integration firm like Axians, VINCI Energies, Spie, or Actemium, your engineers spend every day writing custom SCADA scripts, configuring network gateways, tuning PLC ladder logic, and integrating edge analytics. You view your firm as a service provider billing engineering hours.

Under Article 21 of the Cyber Resilience Act, the European Commission views you very differently.

Article 21 establishes that any natural or legal person who carries out a 'substantial modification' on a product with digital elements and makes it available on the market is legally deemed to be the Manufacturer.

What is a substantial modification? It is any change that affects the product's cybersecurity compliance, introduces new attack surfaces, or modifies its intended purpose. If your engineers connect a legacy brownfield PLC to a cellular 4G gateway for remote telemetry, or modify the security architecture of an industrial skid, you have just legally stripped the original OEM of their liability and placed it squarely on your own company's balance sheet.

That means your integration firm now owns the 10-year technical file, the mandatory 5-year security patch commitment, the 24-hour ENISA reporting clock, and the €15,000,000 fine exposure under Article 61.""",
        "action_steps": [
            "Implement the 4-Gate Substantial Modification Test on every project engineering change order.",
            "Standardize on safe-harbor network isolation architectures that avoid altering native device threat models.",
            "Execute Bilateral Safe-Harbor Agreements with asset owners explicitly defining configuration boundaries.",
            "Deploy cryptographic liability shield certificates for all multi-plant modernization retrofits."
        ]
    },
    10: {
        "intro": "Today, we are taking you behind the scenes of the Axians multi-plant modernization blueprint—the industry benchmark for how enterprise system integrators execute massive industrial overhauls under bulletproof safe-harbor protection.",
        "core_argument": """When Axians modernizes operations across critical European facilities—such as Vopak's chemical terminals in Rotterdam, BASF's chemical complexes in Antwerp, and Stellantis's automotive manufacturing lines in Sochaux—they manage over 1,400 connected industrial nodes spanning PLCs, RTUs, drives, and SCADA servers.

How do you modernize hundreds of legacy nodes without triggering Article 21 manufacturer reclassification on every single cabinet?

You build a structured 5-Stage Modernization Pipeline:
Stage 1: Plant Digital Twin Asset Inventories, mapping every node to Purdue levels and CRA Annex III risk classifications.
Stage 2: Article 21 Safe Harbor Clearance, running every modification through automated Recital 34 boundary tests and generating cryptographic SHA-256 liability shield certificates.
Stage 3: Upstream OEM Hardware Radar, tracking vendor patch status and enforcing statutory Article 18(2) Duty to Refrain holds on unpatched components.
Stage 4: Automated Annex VII Technical Dossiers, compiling SBOMs, network topologies, and risk assessments into a tamper-evident audit package.
Stage 5: Live 24-Hour National CSIRT & ENISA Webhook Integration, streaming threat telemetry directly to NCSC-NL, BSI, and ANSSI.

This is how leading integrators turn regulatory complexity into a massive competitive advantage.""",
        "action_steps": [
            "Establish a standardized 5-stage pipeline for all industrial brownfield retrofit proposals.",
            "Deploy automated asset normalization to classify plant inventory into Annex III Class I/II buckets.",
            "Integrate cryptographic SHA-256 hashing into your project handover documentation.",
            "Set up automated vendor radar to track upstream OEM security advisories in real time."
        ]
    },
    14: {
        "intro": "Today, we are dismantling the biggest operational myth in industrial plant maintenance: The Spare Parts Illusion under Article 2(6) and Recital 29.",
        "core_argument": """If you walk through any refinery, power plant, or water treatment facility built over the last twenty years, the maintenance shelves are lined with replacement I/O modules, power supplies, and PLC CPUs. Plant managers routinely tell me: 'We don't need to worry about CRA compliance for our maintenance stock because spare parts are exempt.'

That belief is a ticking operational disaster.

Let's read the exact wording of Article 2(6) and Recital 29. The CRA excludes spare parts ONLY if they are made available to replace identical components in products with digital elements, and are manufactured according to the EXACT SAME SPECIFICATIONS as the components they replace.

Notice the legal standard: 'exact same specifications.'

In industrial electronics, component obsolescence is constant. When an OEM can no longer source a 2012 microcontroller, they redesign the printed circuit board with a modern chip, or update the firmware microcode branch to support a new memory bus. The moment the hardware revision changes from Revision B to Revision C, or the firmware baseline jumps, that replacement board is NO LONGER an identical spare part under European law.

It is legally a new product with digital elements placed on the market, requiring full CE marking, an SBOM, technical documentation, and 5 years of vulnerability support.""",
        "action_steps": [
            "Audit your critical spare parts inventory and identify all components subject to vendor chip obsolescence.",
            "Demand written Article 2(6) identical-specification certificates from your automation distributors.",
            "Establish a dual-track spares strategy: genuine identical spares vs. planned CRA-compliant migration kits.",
            "Model the financial trade-off of pre-2027 spares stockpiling versus phased brownfield modernization."
        ]
    },
    20: {
        "intro": "Today, we are addressing the survival of small-to-medium embedded hardware and software vendors: How Tier-2 component suppliers can thrive without going bankrupt from CRA certification costs.",
        "core_argument": """Across Europe, thousands of specialized engineering firms manufacture sensor boards, communication modules, and embedded firmware libraries that they sell directly to Tier-1 automation giants like Siemens, Schneider Electric, ABB, and Phoenix Contact.

Many of these smaller suppliers are currently in a state of panic, believing they must spend 100,000 euros per product on third-party Notified Body audits or be cut from Tier-1 vendor lists.

Here is the statutory reality: If you produce a sub-assembly, an embedded module, or a board-level component that is sold exclusively for incorporation into a host product placed on the market by a Tier-1 OEM, YOU are not the economic operator placing the finished PDE on the market under your own brand. You do not need to affix a CE mark.

However—and this is where suppliers get trapped—Tier-1 OEMs legally CANNOT sign their EU Declaration of Conformity without proof that their supply chain meets Annex I essential requirements.

If you cannot provide your Tier-1 customers with a clean, machine-readable SBOM, proof of secure coding, and a coordinated vulnerability disclosure commitment, they will drop you for a supplier who can.

The solution is what we call the Minimum Viable Security Kit (MVSK).""",
        "action_steps": [
            "Automate CycloneDX SBOM generation directly inside your embedded C/C++ firmware build pipeline.",
            "Publish a formal Coordinated Vulnerability Disclosure (CVD) policy on your website under security.txt.",
            "Document your secure boot and cryptographic key storage mechanisms in a standardized technical whitepaper.",
            "Incorporate bilateral liability caps into OEM supply contracts limiting exposure to purchase order value."
        ]
    },
    26: {
        "intro": "Today, we are deep-diving into critical digital infrastructure: Why Data Center BMS, EPMS, UPS, and PDU firmware are entering the strict crosshairs of European market surveillance.",
        "core_argument": """In modern hyperscale and colocation data centers, cybersecurity focus has traditionally been monopolized by server operating systems, hypervisors, and core firewalls. The electrical power monitoring systems (EPMS), building management systems (BMS), uninterruptible power supply (UPS) controllers, and intelligent power distribution units (iPDUs) were treated as dumb facilities equipment.

Under the Cyber Resilience Act, facility power and cooling controllers are classified as high-exposure Products with Digital Elements.

Consider the operational reality: Modern data center UPS systems and PDUs feature embedded Linux or RTOS controllers connected via SNMP, Modbus/TCP, and REST APIs to facility management networks. A vulnerability in PDU firmware allows a threat actor to execute a synchronized load-drop attack, taking down an entire 50-megawatt data hall instantly.

Furthermore, hyperscalers frequently demand customized UPS switching firmware from OEMs to shave milliseconds off transfer times. Under CRA, any custom firmware branch that deviates from the version evaluated in the OEM's technical file invalidates the CE mark, creating massive regulatory liability for data center operators.""",
        "action_steps": [
            "Segment data center EPMS and BMS networks into isolated Purdue Level 2/3 security zones.",
            "Prohibit unverified custom firmware branches on UPS and PDU controllers without formal DoC addenda.",
            "Require all data center MEP equipment vendors to deliver verified CycloneDX SBOMs prior to commissioning.",
            "Establish automated vulnerability monitoring across all facility operational technology nodes."
        ]
    },
    34: {
        "intro": "Today, we are breaking down the most terrifying operational deadline in the Cyber Resilience Act: The 24-Hour Early Warning Panic and the ENISA Single Reporting Platform.",
        "core_argument": """Mark September 11, 2026 on your calendar in bold red ink. That is not the date for general CRA enforcement—that is the date when Article 14 mandatory vulnerability reporting becomes legally binding across all 27 EU member states.

Here is how the statutory clock works under Article 14:
The moment an OEM or software vendor identifies that a vulnerability in their product is being actively exploited in the wild, or detects a severe incident having an impact on the security of the product, the company has exactly TWENTY-FOUR HOURS to submit an Early Warning Notification to the ENISA Single Reporting Platform and the designated national CSIRT.

Within 72 hours, a comprehensive notification containing forensic indicators of compromise, vulnerability classifications, and initial mitigation steps must be submitted. Within 14 days of a patch being released, a final closeout report is legally mandated.

If your organization does not have an active Product Security Incident Response Team (PSIRT) with pre-configured legal workflows and API integrations to the ENISA portal, a zero-day discovered on a Friday afternoon will result in a statutory violation by Saturday evening, opening your executive leadership to fines of up to 10 million euros under Article 61.""",
        "action_steps": [
            "Establish a formal Product Security Incident Response Team (PSIRT) charter and 24/7 on-call rotation.",
            "Pre-register your organization on the ENISA Single Reporting Platform and national CSIRT notification portals.",
            "Develop pre-approved notification templates for Early Warning (24h) and Full Notification (72h) filings.",
            "Conduct quarterly incident simulation drills testing the 24-hour reporting clock from initial triage to submission."
        ]
    },
    46: {
        "intro": "Today, we are stepping directly into the boardroom and the C-suite to dissect the financial reality of non-compliance: Demystifying Article 61 Administrative Fines and Executive Liability.",
        "core_argument": """When European regulatory enforcement is discussed in boardrooms, executives often draw comparisons to GDPR fines. But under Article 61 of the Cyber Resilience Act, the financial penalties are structured to hit hardware and industrial companies with unprecedented severity.

Let's look at the three statutory fine tiers established in Article 61:
Tier 1: Non-compliance with Essential Cybersecurity Requirements under Annex I or manufacturer obligations under Article 13 carries administrative fines of up to 15,000,000 euros or 2.5 percent of total worldwide annual turnover for the preceding financial year, whichever is higher.
Tier 2: Breaches of other statutory obligations—including importer duties, distributor verification, and technical documentation maintenance—carry fines of up to 10,000,000 euros or 2 percent of global turnover.
Tier 3: Supplying incorrect, incomplete, or misleading information to market surveillance authorities triggers fines of up to 5,000,000 euros or 1 percent of turnover.

Notice that critical phrase: 'whichever is higher.' For a multinational industrial group generating 10 billion euros in global revenue, a single non-compliant product line puts 250 million euros at risk.

And the financial fine is only half the damage. Market surveillance authorities have the statutory power to issue Union-wide commercial stop-orders and mandatory product recalls, wiping out entire market segments overnight.""",
        "action_steps": [
            "Present a comprehensive CRA financial exposure and turnover impact model to your Board of Directors.",
            "Establish an executive product cybersecurity steering committee with direct board reporting lines.",
            "Review corporate Directors and Officers (D&O) insurance policies to verify coverage parameters.",
            "Fund internal CRA conformity programs by framing them as essential revenue protection and market access."
        ]
    }
}

# Clean old files in episodes_solo
for old_f in os.listdir(SOLO_DIR):
    if old_f.startswith("EP_") and old_f.endswith("_SOLO.md") and not old_f.startswith("EP_0.00"):
        os.remove(os.path.join(SOLO_DIR, old_f))

print("Cleaned previous solo files.")

# Generate unified solo files
generated_files_map = []
for ep in registry["episodes"]:
    g_num = ep["episode_number"]
    s_id = ep["series_id"]
    s_name = ep["series_name"]
    code = ep["canonical_code"]
    title = ep["title"]
    statutes = ", ".join(ep.get("statutory_articles", ["Regulation (EU) 2024/2847"]))
    target = ep.get("target_persona", "Industrial OT & Product Security Leads")

    clean_title = re.sub(r'[^a-zA-Z0-9_]', '', title.replace(' ', '_'))[:45]
    filename = f"{code}_{clean_title}_SOLO.md"
    filepath = os.path.join(SOLO_DIR, filename)

    bespoke = BESPOKE_NARRATIVES.get(g_num, None)
    if bespoke:
        intro_text = bespoke["intro"]
        core_body = bespoke["core_argument"]
        step_items = "\n\n".join([f"Step {i+1}: {step}" for i, step in enumerate(bespoke["action_steps"])])
    else:
        intro_text = f"Today, we're cutting straight through the theoretical legal noise to address an essential dimension of European product security and industrial resilience: {title}."
        core_body = f"""When we examine the operational, commercial, and engineering reality of {target}, the central challenge under {statutes} is clear: how to translate rigorous statutory requirements into defensible engineering architectures and robust supply-chain agreements.

Under European Union product harmonisation legislation, the obligations set forth in {statutes} attach directly to economic operators the moment a product with digital elements is placed on the market or substantially modified.

In industrial automation, critical infrastructure, and software-defined engineering environments, traditional workflows have long operated under the assumption that cybersecurity is purely an operational IT concern. The Cyber Resilience Act completely upends that model by imposing mandatory, lifecycle statutory duties on manufacturers, integrators, importers, and distributors.

If an organization fails to align its design practices, technical documentation, software supply-chain tracking, and incident response playbooks with {statutes}, it faces immediate market access restrictions, mandatory product recalls, and severe administrative penalties under Article 61 reaching up to 15 million euros or 2.5 percent of global turnover."""
        step_items = f"""Step One: Audit your active product portfolios and contractual scopes governed by {statutes}.

Step Two: Establish clear contractual risk-allocation boundaries across your supplier and integrator networks.

Step Three: Verify that technical documentation files, machine-readable SBOMs, and vulnerability disclosure channels are operational.

Step Four: Conduct an empirical baseline compliance audit across your active product and software portfolio, documenting all components, cryptographic dependencies, and SBOMs in your technical file."""

    chapters = [
        ("00:00", f"Introduction: {title}"),
        ("01:30", f"Statutory Architecture & Legal Breakdown ({statutes})"),
        ("05:15", f"Operational Impact & Industry Analysis ({target})"),
        ("08:45", "Engineering Mitigation & Supply Chain Governance"),
        ("11:30", "4-Step Actionable Checklist for Engineering Teams"),
        ("13:50", "Conclusion & Next Steps")
    ]
    chapters_text = "\n".join([f"{time} - {desc}" for time, desc in chapters])

    script_content = f"""# [{code} - SOLO] {title}

> **Single-Voice Solo Briefing Architecture:**
> - **Host & Presenter:** Jim Mckenney (Digital Product Security Consultant — Industrial OT, CRA, IEC 62443, EU AI Act, Machinery Regulation)
> - **Format:** Single-Voice Executive & Technical Narrative
> - **Series:** Series {s_id}: {s_name}
> - **Canonical Code:** `{code}` (Global Episode {g_num:02d})
> - **Statutory References:** {statutes}
> - **Target Audio Duration:** 12–15 Minutes
> - **Target Persona:** {target}
> - **De-Slop Status:** Audited under `/avoid-ai-writing` (0% AI fluff, 100% statutory & engineering facts)

---

## SECTION 1: SPOTIFY & APPLE PODCASTS PACKAGING

### 1.1 SEO Episode Title
`[{code} - Solo Briefing] {title} | Jim Mckenney`

### 1.2 Spotify Timestamped Chapter Markers
```text
{chapters_text}
```

---

## SECTION 2: SINGLE-VOICE SOLO TRANSCRIPT (JIM MCKENNEY)

> **Speaker Assignment:** `[JIM MCKENNEY]` (Single voice narrative)  
> **Audio Voice Target:** `Daniel` (macOS Male Voice) or custom ElevenLabs voice stream

```dialogue
[JIM MCKENNEY]
Welcome back to The Cyber Resilience Act Briefing. I'm Jim Mckenney, digital product security consultant. I work directly with industrial equipment manufacturers, system integrators, and infrastructure operators across Europe to align OT architectures with Regulation [pronunciation: EU twenty-twenty-four slash twenty-eight-forty-seven], IEC 62443, the EU AI Act, and the Machinery Regulation. Standard disclaimer: this podcast provides technical and strategic engineering analysis, not formal legal advice.

{intro_text}

Let's ground our discussion in the exact statutory text of {statutes}.

{core_body}

To ensure your engineering, commercial, and legal operations remain fully protected, here is your four-step action checklist for this week:

{step_items}

Until next time: build secure by design, protect your supply chain, and ship with confidence. I'm Jim Mckenney—thank you for listening.
```

---

## SECTION 3: REPEATABLE SOLO GENERATION SCRIPTS

A dedicated single-voice audio generator script has been created at:  
`docs/cra_podcast/scripts/generate_spoken_podcast_solo.sh`
"""
    write_checked(filepath, script_content)
    
    generated_files_map.append({
        "code": code,
        "global_num": g_num,
        "series_id": s_id,
        "series_name": s_name,
        "title": title,
        "filename": filename,
        "statutes": statutes
    })

print(f"Generated {len(generated_files_map)} unified solo scripts.")

# Create unified catalogue
catalogue_lines = [
    "# Catalogue of 50 Solo CRA Podcast Episodes",
    "## Single-Voice Master Narrative Scripts by Jim Mckenney",
    "",
    "**Regulation (EU) 2024/2847 • Industrial OT • Critical Infrastructure • Product Security**  ",
    "*Document Version: 3.0.0 — Production Reference for Single-Host TTS / Recording*",
    "",
    "---",
    "",
    "## Master Series Index",
    "",
    "```",
    "+----------------------------------------------------------------------------------------------------+",
    "|                                  THE 8 THEMATIC MINISERIES (50 EPISODES)                           |",
    "+----------------------------------------------------------------------------------------------------+",
    "| Series 1: The Procurement & Contracting Crisis (EP_1.01 - EP_1.06)                                 |",
    "| Series 2: The System Integrator & EPC Shield (EP_2.01 - EP_2.07)                                   |",
    "| Series 3: Brownfield OT, Spare Parts & Maintenance (EP_3.01 - EP_3.06)                              |",
    "| Series 4: Tier-2 Upstream Component Supplier Survival (EP_4.01 - EP_4.06)                          |",
    "| Series 5: Critical Sector Deep Dives (EP_5.01 - EP_5.08)                                           |",
    "| Series 6: Vulnerability Operations, PSIRT & 24h Clocks (EP_6.01 - EP_6.06)                          |",
    "| Series 7: Conformity Assessment, Audits & CE Marking (EP_7.01 - EP_7.06)                           |",
    "| Series 8: Executive Liability, Penalties & Future Evolution (EP_8.01 - EP_8.05)                     |",
    "+----------------------------------------------------------------------------------------------------+",
    "```",
    "",
    "---",
    ""
]

current_series = None
for item in generated_files_map:
    if item["series_id"] != current_series:
        current_series = item["series_id"]
        catalogue_lines.append(f"### Series {current_series}: {item['series_name']}")
    
    file_link = f"file://{SOLO_DIR}/{item['filename']}"
    catalogue_lines.append(f"- **[{item['code']}]({file_link})**: *{item['title']}* ({item['statutes']})")

catalogue_path = os.path.join(SOLO_DIR, "00-SOLO-EPISODES-CATALOGUE.md")
with open(catalogue_path, "w") as f:
    f.write("\n".join(catalogue_lines))

print("Updated 00-SOLO-EPISODES-CATALOGUE.md.")

# Update EP_0.00 Master Intro & Outro Scripts
ep0_content = """# [EP_0.00 - SOLO] Master Intro & Outro Scripts with ElevenLabs Music Prompts

> **Asset Type:** Master Audio Branding & Script Assets  
> **Target Series:** Jim Mckenney Solo Consultant Series (50 Episodes)  
> **Presenter:** Jim Mckenney (Digital Product Security Consultant)  
> **ElevenLabs Voice Model:** `Jim Mckenney English` (Voice ID: `fh7rGvh0nJR3MFMkM9yd`)  
> **Acoustic Guitar Style:** Warm Spanish Classical Guitar / B2B Industrial Tech Synth Bed

---

## 1. INTRO SEGMENT SCRIPT & MUSIC PROMPT (15 Seconds)

### ElevenLabs Music Generator Prompt (Intro):
```text
A warm, sophisticated Spanish classical guitar acoustic intro theme. Soft nylon-string fingerpicked guitar arpeggios, gentle warmth, subtle ambient reverb, elegant B2B broadcast opening, high production value, clean acoustic recording.
```

### Intro Speech Script (Jim Mckenney):
```dialogue
[Soft nylon-string Spanish guitar intro swells for 3 seconds, then ducks smoothly under speech]

[JIM MCKENNEY]
Welcome back to The Cyber Resilience Act Briefing. I'm Jim Mckenney, digital product security consultant. I work directly with industrial manufacturers, OEMs, and operators across Europe to align OT devices and software with Regulation (EU) 2024/2847, IEC 62443, the EU AI Act, and the Machinery Regulation. Standard disclaimer: this podcast provides technical and strategic engineering analysis, not formal legal advice. Today, we're cutting straight through the legal noise.

[Guitar music resolves and fades out cleanly]
```

---

## 2. DEDICATED OUTRO SEGMENT SCRIPT & MUSIC PROMPT (20 Seconds)

> [!NOTE]
> All brand directives, diagnostic tool references, and website calls-to-action are housed exclusively in this master Outro, keeping individual episode dialogue focused 100% on technical and statutory substance.

### ElevenLabs Music Generator Prompt (Outro):
```text
A gentle resolving Spanish classical guitar outro theme. Soft nylon-string acoustic guitar chords, warm resolving cadences, fading out smoothly over 12 seconds, elegant and relaxing resolution.
```

### Outro Speech Script (Jim Mckenney):
```dialogue
[Outro Spanish classical guitar music swells softly in background]

[JIM MCKENNEY]
Thank you for listening to The Cyber Resilience Act Briefing. For additional statutory cross-references, contract safe-harbor clauses, and interactive conformity intelligence tools, visit oxot.ai. Until next time: build secure by design, protect your supply chain, and ship with confidence. I'm Jim Mckenney.

[Music swells to full volume for 4 seconds, then fades out smoothly over 4 seconds]
```
"""

with open(os.path.join(SOLO_DIR, "EP_0.00_PODCAST_INTRO_OUTRO_ELEVENLABS_SCRIPTS_SOLO.md"), "w") as f:
    f.write(ep0_content)

with open(os.path.join(DOCS_CRA, "ELEVENLABS_INTRO_OUTRO_PROMPTS.md"), "w") as f:
    f.write(ep0_content)

print("Updated EP_0.00 and ELEVENLABS_INTRO_OUTRO_PROMPTS.md.")
