---
title: NIS2 for Operational Technology
meta_title: NIS2 Directive for OT & Industry | OXOT
meta_description: What NIS2 (Directive (EU) 2022/2555) means for industrial and OT operators — scope, the ten Article 21 measures, 24/72-hour reporting, management liability, penalties, IEC 62443 alignment, and a practical roadmap.
excerpt: An OT-first field guide to NIS2 — who is in scope, the ten Article 21 measures decoded for plants, the 24/72-hour/one-month reporting drumbeat, board liability, penalties, and a phased plan you can actually run.
content_type: page
published: true
---

NIS2 is the European Union's second Network and Information Security Directive, and it is the most consequential cybersecurity law most industrial operators in Europe have ever had to answer to. It replaces the original 2016 NIS Directive, widens the net of who is covered, hard-codes reporting deadlines, and — for the first time — makes senior management personally accountable for getting cybersecurity right.

For an operator of a substation, a pumping station, a chemical plant or a factory floor, NIS2 is not an IT problem that stays inside the server room. It reaches directly into the Operational Technology (OT) that keeps production running and people safe. A tripped safety instrumented system, a halted bottling line, a manipulated setpoint on a chlorine dosing pump — these are the events the directive cares about, and they live in the world of PLCs, RTUs, drives and historians, not email servers. This page explains what the law actually requires, where it bites hardest in OT environments, and what a realistic response looks like.

## The short version

- NIS2 is **Directive (EU) 2022/2555**, adopted on 14 December 2022 and in force since 16 January 2023. Member States had to transpose it into national law by **17 October 2024**. ([EUR-Lex, CELEX 32022L2555](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32022L2555))
- It covers far more sectors and organisations than the old NIS Directive, split into **essential** and **important** entities across **18 sectors** (11 in Annex I, 7 in Annex II).
- **Article 21** sets a **minimum baseline of ten risk-management measures**, built on an **all-hazards approach** that includes physical and environmental threats — not just cyberattacks.
- **Article 23** imposes a strict incident-reporting rhythm: an **early warning within 24 hours**, a **notification within 72 hours**, and a **final report within one month**.
- **Article 20** requires management bodies to **approve and oversee** the measures, obliges them to **undergo training**, and lets them be **held liable** for failures.
- **Article 34** sets fines of **at least €10 million or 2% of global annual turnover** for essential entities, and **at least €7 million or 1.4%** for important entities — whichever is higher.

If you take one thing away: NIS2 is a governance and risk-management law, not a shopping list of products. It rewards organisations that can *show* they understand their risk and manage it deliberately — which is exactly where OT security so often falls down.

> [!IMPORTANT]
> NIS2 is a directive, not a regulation. It does not apply to your organisation directly — it applies through your Member State's national transposition law. Always check the national statute, because several countries went further than the directive's floor. In the Netherlands, that law is the **Cyberbeveiligingswet (Cbw)**.

## Why NIS2 exists

The 2016 NIS Directive was the EU's first attempt to raise the cybersecurity baseline for critical services. It worked unevenly. Member States interpreted "operators of essential services" differently, enforcement was patchy, and whole categories that clearly mattered — wastewater, food production, manufacturing, public administration — sat outside its scope. Two organisations delivering the same essential service in two countries could face wildly different obligations, or none at all.

Meanwhile the threat landscape moved on. Ransomware crews learned that stopping production is more profitable than stealing data, because a plant losing millions a day pays quickly. State-aligned actors demonstrated, repeatedly, that industrial control systems are viable targets — from the wiper attacks on Ukrainian power distribution to the intrusion sets that reconnoitre European utilities without ever pulling the trigger. Supply-chain compromises showed that trusted software updates and remote-maintenance channels are as dangerous as any front-door exploit.

NIS2 is the correction. It harmonises the rules, expands the scope dramatically, hard-codes reporting timelines, and puts accountability where decisions actually get made — with senior management. The directive's recitals are candid that the previous regime left gaps and that the exposure of essential and important entities had grown faster than the law governing them.

## Who is in scope

NIS2 divides covered organisations into two tiers. Both must meet the same core security obligations under Article 21 and the same reporting duties under Article 23; the difference lies in how strictly they are supervised and how they are penalised. ([nis-2-directive.com, Article 3](https://www.nis-2-directive.com/NIS_2_Directive_Article_3.html))

### The two tiers at a glance

| Tier | Sectors | Supervision | Fine ceiling |
| --- | --- | --- | --- |
| **Essential entities** | Annex I high-criticality sectors, at scale | Proactive, *ex ante* — audits and inspections without needing evidence of a problem | At least **€10m or 2%** of global annual turnover, whichever is higher |
| **Important entities** | Annex II other-critical sectors | Reactive, *ex post* — action on evidence or indication of non-compliance | At least **€7m or 1.4%** of global annual turnover, whichever is higher |

### Annex I — the 11 highly critical sectors

The essential tier is drawn largely from Annex I: **energy** (electricity, oil, gas, district heating and cooling, hydrogen), **transport** (air, rail, water, road), **banking**, **financial market infrastructures**, **health**, **drinking water**, **wastewater**, **digital infrastructure**, **ICT service management** (B2B), **public administration**, and **space**. ([Glocert, essential vs important](https://www.glocertinternational.com/resources/guides/nis2-applicability-essential-vs-important-entities/))

### Annex II — the 7 other critical sectors

Annex II adds the important-tier sectors: **postal and courier services**, **waste management**, **manufacture, production and distribution of chemicals**, **food production and distribution**, **manufacturing** (medical devices, computers and electronics, machinery and equipment, motor vehicles, other transport equipment), **digital providers** (online marketplaces, search engines, social platforms), and **research organisations**.

### The size rule — and its exceptions

As a general rule, NIS2 applies to organisations that are **medium-sized or larger** in an in-scope sector — broadly, **50 or more employees, or annual turnover / balance sheet total above €10 million**. An entity that also crosses **250 employees or €50 million turnover** is a large enterprise and, in a high-criticality sector, is typically an essential entity. ([Legiscope, essential vs important](https://www.legiscope.com/blog/nis2-essential-important-entities.html))

There are important exceptions. Certain providers are in scope **regardless of size** — including **DNS service providers, top-level-domain name registries, trust service providers, and providers of public electronic communications networks or services**. Member States can also designate specific smaller entities as covered where they are, for example, the sole provider of a critical service in a region, or where disruption would have significant impact.

> [!WARNING]
> The practical consequence for industry is stark. A mid-sized manufacturer, a regional water utility, a food producer or a chemicals distributor that never considered itself "critical national infrastructure" is now very likely in scope — and many did not notice when the transposition deadline passed. Not knowing you are in scope is not a defence.

### Where transposition actually stands

Member States were supposed to have national law in force by 17 October 2024. Most missed it. On **7 May 2025 the European Commission issued reasoned opinions to 19 Member States** for failing to notify full transposition, a formal step before referral to the Court of Justice. ([European Commission, NIS transposition](https://digital-strategy.ec.europa.eu/en/policies/nis-transposition)) As of 2026 the majority have adopted transposing legislation while several — including **France, Ireland, Luxembourg, the Netherlands and Spain** — completed the process later than the deadline. ([ECSO transposition tracker](https://ecs-org.eu/activities/nis2-directive-transposition-tracker/))

In the **Netherlands**, the **Cyberbeveiligingswet (Cbw)** implements NIS2. The **Dutch Parliament (Tweede Kamer) approved the draft on 15 April 2026**, with formal adoption targeted for later in 2026 following Senate review. ([Bird & Bird, Dutch Cybersecurity Act](https://www.twobirds.com/en/insights/2026/netherlands/dutch-parliament-approves-cybersecurity-act-implementing-nis2)) The delay does not change the substance operators must prepare for — and it does not pause the obligation to be ready.

## Essential vs important entities — the split that sets your regime

NIS2 sorts in-scope organisations into two tiers, and the tier decides how hard the law lands on you: the supervision model, the penalty ceiling, and how proactively a regulator can knock on your door. The split is driven by sector *and* size — as a rule, large enterprises in the highest-criticality sectors are **essential**, while medium-sized organisations and those in "other critical" sectors are **important**. Both tiers carry the same core security and reporting duties; what differs is the enforcement posture.

```compare
Essential entities
- Highest-criticality sectors: energy, transport, banking, financial-market infrastructure, health, drinking & waste water, digital infrastructure, ICT service management, public administration, space
- **Proactive (ex ante) supervision** — regulators may audit, inspect and demand evidence without waiting for an incident
- Administrative fines up to **€10 million or 2% of global annual turnover**, whichever is higher
---
Important entities
- Other critical sectors: postal & courier, waste management, chemicals, food, manufacturing (incl. medical devices, machinery, vehicles), digital providers, research
- **Reactive (ex post) supervision** — scrutiny typically follows evidence of non-compliance or an incident
- Administrative fines up to **€7 million or 1.4% of global annual turnover**, whichever is higher
```

> [!IMPORTANT]
> The classification is not a self-assessment you can quietly round down. NIS2 introduces a **registration duty** — in-scope entities must register with their national authority (in the Netherlands, coordinated via the NCSC/RDI landscape under the Cbw), and the **"size-cap" rule** means a company can be pulled in below the usual size thresholds if it is the sole provider of a critical service or its disruption would have significant societal impact. Getting the classification wrong in either direction is itself a governance failure.

## Governance and scope, at a glance

The diagram below traces the chain NIS2 constructs: from an accountable management body, down through the ten measures, into the supervision and enforcement that keep them honest.

```svg
<svg viewBox="0 0 700 380" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, Helvetica, Arial, sans-serif">
  <rect x="0" y="0" width="700" height="380" fill="none"/>
  <!-- Management body -->
  <rect x="200" y="20" width="300" height="56" rx="8" fill="#3b82f6" fill-opacity="0.15" stroke="#3b82f6" stroke-width="1.5"/>
  <text x="350" y="44" text-anchor="middle" fill="#e5e7eb" font-size="15" font-weight="700">Management body (Art. 20)</text>
  <text x="350" y="63" text-anchor="middle" fill="#94a3b8" font-size="11">Approves &amp; oversees measures · trained · liable</text>
  <!-- arrow down -->
  <line x1="350" y1="76" x2="350" y2="104" stroke="#94a3b8" stroke-width="1.5"/>
  <polygon points="350,110 345,100 355,100" fill="#94a3b8"/>
  <!-- Measures -->
  <rect x="120" y="112" width="460" height="70" rx="8" fill="#94a3b8" fill-opacity="0.10" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="350" y="134" text-anchor="middle" fill="#e5e7eb" font-size="15" font-weight="700">Ten risk-management measures (Art. 21)</text>
  <text x="350" y="154" text-anchor="middle" fill="#94a3b8" font-size="11">All-hazards · proportionate · IT and OT in scope</text>
  <text x="350" y="171" text-anchor="middle" fill="#94a3b8" font-size="11">Risk analysis · incident handling · continuity · supply chain · MFA · more</text>
  <!-- two arrows down -->
  <line x1="230" y1="182" x2="230" y2="212" stroke="#94a3b8" stroke-width="1.5"/>
  <polygon points="230,218 225,208 235,208" fill="#94a3b8"/>
  <line x1="470" y1="182" x2="470" y2="212" stroke="#94a3b8" stroke-width="1.5"/>
  <polygon points="470,218 465,208 475,208" fill="#94a3b8"/>
  <!-- Reporting -->
  <rect x="60" y="220" width="340" height="64" rx="8" fill="#f97316" fill-opacity="0.13" stroke="#f97316" stroke-width="1.5"/>
  <text x="230" y="244" text-anchor="middle" fill="#e5e7eb" font-size="14" font-weight="700">Incident reporting (Art. 23)</text>
  <text x="230" y="264" text-anchor="middle" fill="#94a3b8" font-size="11">24h warning → 72h notification → 1-month report</text>
  <text x="230" y="279" text-anchor="middle" fill="#94a3b8" font-size="11">to national CSIRT / competent authority</text>
  <!-- Supervision -->
  <rect x="360" y="220" width="280" height="64" rx="8" fill="#3b82f6" fill-opacity="0.10" stroke="#3b82f6" stroke-width="1.5"/>
  <text x="500" y="244" text-anchor="middle" fill="#e5e7eb" font-size="14" font-weight="700">Supervision (Art. 32–33)</text>
  <text x="500" y="264" text-anchor="middle" fill="#94a3b8" font-size="11">Essential: ex ante · Important: ex post</text>
  <text x="500" y="279" text-anchor="middle" fill="#94a3b8" font-size="11">Audits · orders · monitoring officer</text>
  <!-- arrows to enforcement -->
  <line x1="230" y1="284" x2="330" y2="316" stroke="#94a3b8" stroke-width="1.5"/>
  <line x1="500" y1="284" x2="380" y2="316" stroke="#94a3b8" stroke-width="1.5"/>
  <!-- Enforcement -->
  <rect x="230" y="320" width="240" height="46" rx="8" fill="#f97316" fill-opacity="0.16" stroke="#f97316" stroke-width="1.5"/>
  <text x="350" y="343" text-anchor="middle" fill="#e5e7eb" font-size="14" font-weight="700">Enforcement &amp; fines (Art. 34)</text>
  <text x="350" y="359" text-anchor="middle" fill="#94a3b8" font-size="11">Up to €10m / 2% or €7m / 1.4%</text>
</svg>
```

## Article 21: the ten measures, decoded for OT

Article 21 is the heart of the directive. It requires covered entities to take "appropriate and proportionate technical, operational and organisational measures to manage the risks posed to the security of network and information systems." It uses an **all-hazards approach** — the measures must protect those systems and their physical environment from incidents, whether the cause is a hacker, a fire, a flood or a failed supplier. ([nis-2-directive.com, Article 21](https://www.nis-2-directive.com/NIS_2_Directive_Article_21.html))

The article lists ten measures as a minimum. Read through a pure-IT lens, each looks familiar. Read through an OT lens, each carries weight that is easy to underestimate. The table maps them; the sections that follow go deeper.

| # | Article 21(2) measure | What it means | OT implication |
| --- | --- | --- | --- |
| 1 | Risk analysis and information system security policies | A documented, current understanding of risk and the policies that govern it | Starts with an asset inventory most plants cannot produce on demand |
| 2 | Incident handling | Prevention, detection, analysis, containment, response, recovery | You often cannot reboot, patch or isolate without touching a live physical process |
| 3 | Business continuity, backup, disaster recovery, crisis management | Keep or restore operations after disruption | Tested recovery of PLC/RTU configs, engineering workstations and historians — not just servers |
| 4 | Supply chain security | Security of relationships with direct suppliers and service providers | Your OEMs, integrators and maintenance vendors hold remote access to your crown jewels |
| 5 | Security in acquisition, development and maintenance; vulnerability handling and disclosure | Build security into how you buy and maintain systems | Procurement clauses and patch windows for control systems, not bolt-on fixes |
| 6 | Policies to assess the effectiveness of measures | Prove the controls actually work | Testing and audit that respect operational constraints — no disruptive scans on live cells |
| 7 | Basic cyber hygiene and security training | Patching, config management, least privilege, awareness | Applied to engineers and operators, whose day jobs are not IT security |
| 8 | Cryptography and, where appropriate, encryption | Proportionate use of crypto | Usually protects remote access, data in transit and backups — rarely real-time control traffic |
| 9 | HR security, access control, asset management | Who can touch what, from where, with which rights | Shared accounts, contractor access and vendor logins are the classic weak points |
| 10 | MFA / continuous authentication; secured & emergency communications | Strong auth and hardened comms channels | MFA on remote and privileged OT access is now an expectation, not a nice-to-have |

### 1 — Risk analysis and security policies

Everything downstream rests on this. You need a current, documented view of your risk and the policies that govern how you manage it. In OT, that view is impossible without an accurate **asset inventory** — and this is precisely where most operators fall short. A plant that cannot list, on demand, which controllers it runs, how they connect, which are internet-reachable and which protect a safety function is doing risk analysis on guesswork. NIS2 turns that gap from an operational nuisance into a compliance exposure.

### 2 — Incident handling

Detection, analysis, containment, response and recovery — the full lifecycle. The IT playbook assumes you can isolate a host, kill a process or restore from image. On a process line, those moves may trip a safety function or scrap a batch. OT incident handling has to be written with the process engineer in the room, with pre-agreed decision rights for who can take equipment offline and under what safety conditions.

### 3 — Business continuity and crisis management

Backup, disaster recovery and the ability to keep or restore operations. For OT this means tested, restorable copies of **PLC and RTU logic, HMI and SCADA projects, engineering workstation images, drive parameters and historian data** — and a rehearsed plan for rebuilding a cell from bare metal. Backups you have never restored are a hypothesis, not a control.

### 4 — Supply chain security

NIS2 makes supply-chain risk explicit. Entities must consider the vulnerabilities of each direct supplier, the quality of their products and their secure-development practices, and factor in the EU-level **coordinated risk assessments of critical supply chains** under Article 22. ([nis2-info.eu, Article 21](https://www.nis2-info.eu/article-21-cybersecurity-risk-management-measures/)) In OT the supply chain *is* the attack surface: your integrators and OEMs frequently hold standing remote access into your most sensitive equipment. Vendor access governance is not a paperwork exercise here — it is one of the highest-leverage controls you own.

### 5 — Security in acquisition, development and maintenance

This reaches into procurement and the whole system lifecycle, including vulnerability handling and disclosure. Security requirements belong in the specification when you buy a new line or upgrade a control system — not in a remediation project three years later. It is also where NIS2 meets the [Cyber Resilience Act](/en/cra) and the [Machinery Regulation](/en/machine-act): the products you buy increasingly arrive with security obligations of their own, and your job is to demand and verify them.

### 6 — Assessing effectiveness

You must be able to show the measures work, through testing, audit and review. In OT the challenge is doing this without breaking anything — active scanning a live control network can be as disruptive as an attack. Passive monitoring, offline validation and staged testing become the tools of choice, and a [Cyber Digital Twin](/en/cyber-digital-twin) lets you reason about "does this control hold?" against a model rather than against production.

### 7 — Basic cyber hygiene and training

Patching, configuration management, least privilege, awareness. The catch: in OT the "users" are engineers, operators and maintenance staff, and patch cycles are governed by maintenance windows measured in months. Hygiene has to be designed around operational reality — compensating controls where patching is genuinely impossible, and training that speaks the language of the plant, not the SOC.

### 8 — Cryptography and encryption

Applied proportionately. In OT, encryption usually protects remote-access sessions, data in transit across untrusted links, and backups — not real-time control traffic, where latency and legacy protocols often make in-line encryption impractical. The word "proportionate" is doing real work here: NIS2 does not ask you to encrypt a 20-year-old fieldbus.

### 9 — HR security, access control and asset management

Who can touch what, from where, with which privileges. Shared operator accounts, generic vendor logins and contractors with standing access are endemic in OT and are exactly what this measure targets. Tighter access control and a maintained asset register are the two controls that most often move the needle on real risk.

### 10 — MFA and secured communications

Multi-factor or continuous authentication, plus secured voice, video and text and emergency communications where appropriate. Read plainly: **MFA on remote and privileged access to OT is now an expectation.** Given how much OT compromise begins with an unprotected remote-access path, this is one of the highest-value lines in the whole article.

> [!TIP]
> The word that recurs across Article 21 is **proportionate**. NIS2 does not demand identical controls of a nuclear operator and a snack-food distributor. It demands measures proportionate to the risk, the entity's exposure, the state of the art, and cost weighed against potential impact. That is a risk-based standard — and it means you must be able to *justify* your choices against your actual risk. A structured, evidence-based assessment is what turns "we decided not to patch that PLC" from a liability into a defensible, documented decision.

## Article 23: incident reporting in practice

Where the old regime was vague, NIS2 is specific. Article 23 requires covered entities to report **significant incidents** to their national CSIRT or competent authority on a defined timeline that starts the moment you **become aware**. ([nis-2-directive.com, Article 23](https://www.nis-2-directive.com/NIS_2_Directive_Article_23.html))

| Stage | Deadline | What it must contain |
| --- | --- | --- |
| **Early warning** | Within **24 hours** of becoming aware | Whether the incident is suspected to be unlawful/malicious and whether it could have cross-border impact |
| **Incident notification** | Within **72 hours** of becoming aware | Update to the early warning; initial assessment of severity and impact; indicators of compromise where available |
| **Intermediate report** | On request | Status update at the authority's request |
| **Final report** | Within **1 month** of the notification | Detailed description, root-cause analysis, mitigations applied, and any cross-border impact |
| **Progress report** | If still ongoing at the 1-month mark | Progress report now, final report within one month of resolving the incident |

An incident is **significant** if it has caused or is capable of causing **severe operational disruption of the service or financial loss**, or has affected or is capable of affecting **other persons through considerable material or non-material damage**. ([Legiscope, 24h/72h framework](https://www.legiscope.com/blog/nis2-incident-reporting.html)) For an OT operator, a disruption to a physical process — a tripped safety system, a halted production line, a contaminated water supply — clears that bar with room to spare.

```timeline
T + 24 hours :: **Early warning** — is it suspected malicious? Could it cross borders?
T + 72 hours :: **Incident notification** — severity, impact, indicators of compromise
On request :: **Intermediate report** — status update when the authority asks
T + 1 month :: **Final report** — root cause, mitigations, cross-border impact
While ongoing :: **Progress report** at one month, then a final report within a month of resolution
```

The reason this rhythm bites in OT is that the clock starts at *awareness*, not at *resolution* — and awareness in an OT environment often arrives through operations, not the SOC. A 24-hour early-warning obligation presumes a detection-and-escalation path that reaches a decision-maker inside a day, on nights and weekends, for events that may first show up as a process anomaly rather than a security alert. Building that path is as much an organisational design problem as a technical one.

There is a reciprocal obligation worth knowing: the CSIRT or competent authority must respond to the early warning **without undue delay and where possible within 24 hours**, including initial feedback and, on request, operational advice. The report is not shouting into a void.

```svg
<svg viewBox="0 0 700 240" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, Helvetica, Arial, sans-serif">
  <rect x="0" y="0" width="700" height="240" fill="none"/>
  <!-- baseline -->
  <line x1="40" y1="120" x2="660" y2="120" stroke="#94a3b8" stroke-width="2"/>
  <polygon points="668,120 656,114 656,126" fill="#94a3b8"/>
  <!-- T0 -->
  <circle cx="70" cy="120" r="7" fill="#f97316"/>
  <text x="70" y="150" text-anchor="middle" fill="#e5e7eb" font-size="12" font-weight="700">Become aware</text>
  <text x="70" y="167" text-anchor="middle" fill="#94a3b8" font-size="10">clock starts</text>
  <!-- 24h -->
  <circle cx="230" cy="120" r="7" fill="#3b82f6"/>
  <line x1="230" y1="120" x2="230" y2="60" stroke="#3b82f6" stroke-width="1.2" stroke-dasharray="3 3"/>
  <rect x="150" y="30" width="160" height="34" rx="6" fill="#3b82f6" fill-opacity="0.15" stroke="#3b82f6" stroke-width="1.2"/>
  <text x="230" y="48" text-anchor="middle" fill="#e5e7eb" font-size="12" font-weight="700">24h — Early warning</text>
  <text x="230" y="60" text-anchor="middle" fill="#94a3b8" font-size="9.5">malicious? cross-border?</text>
  <!-- 72h -->
  <circle cx="400" cy="120" r="7" fill="#3b82f6"/>
  <line x1="400" y1="120" x2="400" y2="60" stroke="#3b82f6" stroke-width="1.2" stroke-dasharray="3 3"/>
  <rect x="320" y="30" width="160" height="34" rx="6" fill="#3b82f6" fill-opacity="0.15" stroke="#3b82f6" stroke-width="1.2"/>
  <text x="400" y="48" text-anchor="middle" fill="#e5e7eb" font-size="12" font-weight="700">72h — Notification</text>
  <text x="400" y="60" text-anchor="middle" fill="#94a3b8" font-size="9.5">severity, impact, IoCs</text>
  <!-- 1 month -->
  <circle cx="600" cy="120" r="7" fill="#f97316"/>
  <line x1="600" y1="120" x2="600" y2="176" stroke="#f97316" stroke-width="1.2" stroke-dasharray="3 3"/>
  <rect x="510" y="176" width="180" height="40" rx="6" fill="#f97316" fill-opacity="0.15" stroke="#f97316" stroke-width="1.2"/>
  <text x="600" y="194" text-anchor="middle" fill="#e5e7eb" font-size="12" font-weight="700">1 month — Final report</text>
  <text x="600" y="208" text-anchor="middle" fill="#94a3b8" font-size="9.5">root cause · mitigations</text>
  <!-- on request marker -->
  <text x="500" y="150" text-anchor="middle" fill="#94a3b8" font-size="10" font-style="italic">intermediate report on request</text>
</svg>
```

The 24-hour clock is unforgiving, and it starts when you *become aware* — not when you finish investigating. That places a premium on two things: **detection**, because an organisation that cannot see an incident cannot report it; and a **rehearsed reporting process**, because a team that has never practised the report will not produce a coherent one under pressure at three in the morning. Build the templates, name the decision-makers, and run the drill before you need it.

## Governance: management is on the hook

Article 20 is the cultural pivot of NIS2. Management bodies of covered entities must **approve** the risk-management measures, **oversee** their implementation, and can be **held liable** for infringements. Members of management must also **follow training** to gain sufficient knowledge to identify risks and assess management practices, and are expected to offer similar training to staff. ([ISMS.online, Article 34](https://www.isms.online/nis-2/articles/34-administrative-fines-for-non-compliance/))

In plain terms: cybersecurity is no longer something a board can delegate downward and forget. Directors are accountable for it. In serious, repeated cases and for essential entities, several Member States provide for **temporary bans from management functions** for the individuals responsible. This is deliberate. The EU concluded that security investment follows accountability — and that the surest way to sustain investment in unglamorous OT security is to make the people who control the budget answerable for the outcome.

### What a board actually has to do

Approval and oversight are not a signature on a slide. To discharge the Article 20 duty credibly, a management body needs:

- A **decision-ready view of operational risk** — not a stack of technical reports, but a picture clear enough to approve measures knowingly.
- Evidence that measures are **implemented and effective**, refreshed on a cadence, so oversight is continuous rather than annual.
- A **named accountable executive** and a reporting line that surfaces material OT risk to the board without translation loss.
- **Documented training** for board members, and a record of the risk decisions the board has ratified — because when a regulator or a court asks "did the board know?", the answer lives in the minutes.

## Supervision and enforcement

The two tiers diverge here. **Essential entities** face proactive, *ex ante* supervision: authorities can conduct audits, inspections, security scans and targeted requests for information without first needing evidence of a problem. **Important entities** face *ex post* supervision: authorities act when there is evidence or indication of non-compliance. ([nis-2-directive.com, Article 34](https://www.nis-2-directive.com/NIS_2_Directive_Article_34.html))

Authorities' powers escalate. They can issue **warnings**, give **binding instructions**, order an entity to **remedy deficiencies** or to **cease conduct**, require notification of affected parties, and — for essential entities in serious cases — appoint a **monitoring officer** or seek **temporary suspension of certifications or management functions**. Fines under Article 34 sit **on top of** these measures, not instead of them. Entities retain due-process rights: a hearing, the chance to present mitigating evidence, and a route of appeal.

## Penalties

Article 34 sets the ceilings for administrative fines. ([nis-2-directive.com, Article 34](https://www.nis-2-directive.com/NIS_2_Directive_Article_34.html))

| Entity type | Fine ceiling | Structure |
| --- | --- | --- |
| **Essential entities** | Maximum of at least **€10,000,000 or 2%** of total worldwide annual turnover | Whichever is **higher** |
| **Important entities** | Maximum of at least **€7,000,000 or 1.4%** of total worldwide annual turnover | Whichever is **higher** |

These are ceilings, not tariffs. Actual fines must be **effective, proportionate and dissuasive**, judged against the nature, gravity and duration of the breach, the degree of culpability, and whether the entity cooperated. But the turnover-linked structure — familiar from the GDPR — signals intent. Non-compliance is meant to be a board-level financial risk, not a rounding error.

Work the maths for a mid-sized group turning over €800 million: 2% is €16 million, comfortably above the €10 million floor, so the higher figure governs. For a €4 billion enterprise, 2% is €80 million. The percentage bites precisely where the fixed cap would otherwise be trivial — which is the point.

But the fines are only half of the enforcement story, and arguably not the half that changes behaviour. NIS2 makes **management bodies personally accountable** for approving and overseeing cybersecurity risk-management measures, and it gives authorities powers that reach past the balance sheet to the individuals in charge.

```keyfacts
Essential entities :: up to €10M or 2% of global turnover (higher applies)
Important entities :: up to €7M or 1.4% of global turnover (higher applies)
Management duty :: approve & oversee measures; personal accountability (Art. 20)
Training duty :: management must follow — and offer staff — cyber-risk training
Authority powers :: audits, binding instructions, and temporary suspension of a manager
Basis :: turnover-linked, GDPR-style — a board-level risk, not a line item
```

The sharpest instrument is **Article 32(5)**: for essential entities, supervisory authorities may **temporarily suspend a certification or authorisation**, and **temporarily prohibit any person discharging managerial responsibilities at CEO or legal-representative level from exercising those functions**, until the entity remedies the failure. A regulator that can bar a CEO from running the company concentrates minds in a way a fine rarely does — and it is exactly why NIS2 compliance is now a board agenda item, not a task delegated into the security team and forgotten. The Dutch Cbw carries these accountability provisions through into national law.

```cta
€10 million or 2% of turnover — and personal liability for your board.
NIS2 penalties land on the organisation and its leadership alike. We translate the ten measures into a defensible, board-ready OT security programme.
Check my NIS2 exposure :: /en/contact
```

## Where the law meets the plant

NIS2 never uses the words "PLC" or "SCADA," but its all-hazards, risk-based demands land squarely on OT. Three tensions are worth naming honestly.

### The IT/OT priority inversion

In IT, the security triad reads confidentiality, integrity, availability — protect the data first. In OT it inverts: **safety, then availability, then integrity, then confidentiality.** A control that is routine in IT — force a patch, drop a connection, reboot a server — can be unacceptable next to a running process, where the first duty is that nobody gets hurt and the second is that the plant keeps running.

```svg
<svg viewBox="0 0 700 170" xmlns="http://www.w3.org/2000/svg" font-family="Segoe UI, Helvetica, Arial, sans-serif">
  <rect x="0" y="0" width="700" height="170" fill="none"/>
  <text x="30" y="30" fill="#94a3b8" font-size="13" font-weight="700">IT priority</text>
  <rect x="150" y="14" width="120" height="30" rx="6" fill="#3b82f6" fill-opacity="0.15" stroke="#3b82f6"/>
  <text x="210" y="34" text-anchor="middle" fill="#e5e7eb" font-size="12">Confidentiality</text>
  <rect x="290" y="14" width="120" height="30" rx="6" fill="#3b82f6" fill-opacity="0.12" stroke="#3b82f6"/>
  <text x="350" y="34" text-anchor="middle" fill="#e5e7eb" font-size="12">Integrity</text>
  <rect x="430" y="14" width="120" height="30" rx="6" fill="#3b82f6" fill-opacity="0.10" stroke="#3b82f6"/>
  <text x="490" y="34" text-anchor="middle" fill="#e5e7eb" font-size="12">Availability</text>
  <text x="620" y="34" fill="#94a3b8" font-size="11">highest → lowest</text>
  <line x1="30" y1="70" x2="670" y2="70" stroke="#94a3b8" stroke-width="0.75" stroke-dasharray="4 4"/>
  <text x="30" y="110" fill="#f97316" font-size="13" font-weight="700">OT priority</text>
  <rect x="110" y="94" width="100" height="30" rx="6" fill="#f97316" fill-opacity="0.20" stroke="#f97316"/>
  <text x="160" y="114" text-anchor="middle" fill="#e5e7eb" font-size="12">Safety</text>
  <rect x="222" y="94" width="110" height="30" rx="6" fill="#f97316" fill-opacity="0.16" stroke="#f97316"/>
  <text x="277" y="114" text-anchor="middle" fill="#e5e7eb" font-size="12">Availability</text>
  <rect x="344" y="94" width="100" height="30" rx="6" fill="#f97316" fill-opacity="0.12" stroke="#f97316"/>
  <text x="394" y="114" text-anchor="middle" fill="#e5e7eb" font-size="12">Integrity</text>
  <rect x="456" y="94" width="130" height="30" rx="6" fill="#f97316" fill-opacity="0.08" stroke="#f97316"/>
  <text x="521" y="114" text-anchor="middle" fill="#e5e7eb" font-size="12">Confidentiality</text>
  <text x="620" y="114" fill="#94a3b8" font-size="11">highest → lowest</text>
  <text x="350" y="152" text-anchor="middle" fill="#94a3b8" font-size="11" font-style="italic">NIS2's proportionality principle accommodates the inversion — if you can articulate it</text>
</svg>
```

NIS2's proportionality principle accommodates this inversion, but only if you can *articulate* the operational constraints and the compensating controls you use instead. "We can't patch during a campaign, so we do X, Y and Z" is a defensible position. Silence is not.

### You cannot manage what you cannot see

The first Article 21 measure is risk analysis, and risk analysis presumes an asset inventory. In practice, the single most common gap OXOT finds is that operators lack a current, structured view of their OT estate — which devices exist, how they connect, which are exposed, and which protect a safety function. Under NIS2, that gap is no longer just operational debt; it is a compliance exposure, because you cannot demonstrate proportionate measures over an estate you cannot describe.

### IEC 62443 is the engineering answer

NIS2 tells you *what* outcomes to achieve; it does not prescribe *how*. The [IEC 62443](/en/iec-62443) series — the international standard for industrial automation and control system security — provides the how: **zones and conduits, security levels, and a lifecycle** for building and operating secure control systems. For the rail and infrastructure world, [TS 50701](/en/ts-50701) extends the same thinking. Aligning your NIS2 response to IEC 62443 gives you a defensible, internationally recognised method for showing that your measures are appropriate and proportionate. The two are complementary: **NIS2 is the legal obligation; IEC 62443 is the engineering answer.**

### How the ten measures map to IEC 62443

| Article 21 measure | Where IEC 62443 answers it |
| --- | --- |
| Risk analysis & policies | 62443-3-2 risk assessment; 62443-2-1 security programme |
| Incident handling | 62443-2-1 and 62443-3-3 detection/response requirements (FR 6) |
| Business continuity & recovery | 62443-2-1 continuity; 62443-3-3 resource availability (FR 7) |
| Supply chain security | 62443-2-4 service-provider requirements; 62443-4-1 secure development |
| Acquisition, dev & maintenance | 62443-4-1 secure product lifecycle; 62443-4-2 component requirements |
| Effectiveness assessment | 62443-2-1 audit and metrics; conduct security verification |
| Cyber hygiene & training | 62443-2-1 policies; 62443-2-4 competence |
| Cryptography | 62443-3-3 data confidentiality (FR 4) and integrity (FR 3) |
| Access control & asset mgmt | 62443-3-3 identification/authentication (FR 1) and use control (FR 2) |
| MFA & secured comms | 62443-3-3 FR 1/FR 2; zone-and-conduit restricted data flow (FR 5) |

For related and adjacent obligations — the [CRA](/en/cra), the [AI Act](/en/ai-act), the [Machinery Regulation](/en/machine-act) — see our overview of [frameworks](/en/frameworks) and how they stack.

## Sector-by-sector notes

The obligations are common, but the pressure points differ. A few sector-specific realities OXOT sees repeatedly:

- **Energy and utilities.** Substation automation, DER aggregation and remote SCADA make availability the paramount concern. Legacy protocols and long asset lifecycles collide with the patch-and-hygiene expectations of Article 21. Vendor remote access is pervasive and under-governed.
- **Drinking water and wastewater.** Often lean on staff, wide geography, thousands of remote sites. A significant incident here can mean a public-health event, so the Article 23 "considerable damage" test is easily met. Asset visibility across dispersed telemetry is the hard part.
- **Chemicals and process industries.** Safety-instrumented systems and functional-safety regimes dominate. Cybersecurity has to be reconciled with process safety, not bolted alongside it — a natural fit for IEC 62443's risk-based zones.
- **Manufacturing (Annex II).** Flat networks, converged IT/OT, and machinery arriving with its own [CRA](/en/cra) and [Machinery Regulation](/en/machine-act) obligations. The scoping surprise is real: many manufacturers only recently learned they are important entities.
- **Food production and distribution.** Cold-chain integrity, high-throughput lines and thin margins make downtime expensive and safety-relevant. Recovery testing of line controls is frequently the neglected control.

## A practical roadmap

There is no shortcut, but there is a sensible order. Run it as a programme with phases, not a one-off project.

| Phase | Focus | Key outputs |
| --- | --- | --- |
| **0. Confirm status** | Are you essential or important under your national law? | Scoping determination; registration where required |
| **1. See the estate** | Build the asset & risk picture | Structured OT inventory; connectivity map; exposure and safety-criticality flags |
| **2. Assess vs Art. 21** | Map current state to the ten measures | Gap analysis prioritised by operational risk, not raw CVSS |
| **3. Reporting muscle** | Stand up and rehearse Art. 23 | Templates, decision rights, a tested 24/72h/1-month drill |
| **4. Remediate in waves** | Close gaps, IEC 62443-aligned | Prioritised, proportionate, operationally realistic control roll-out |
| **5. Prove & sustain** | Demonstrate and maintain effectiveness | Test/audit cadence; living evidence base; board reporting |

> [!NOTE]
> Several Member States impose **registration duties** with their own deadlines, separate from the substantive obligations. Confirming status (Phase 0) is not busywork — miss a registration window and you may be non-compliant before you have touched a single technical control.

## What it means for your role

**If you are a CISO or security lead,** NIS2 extends your mandate across the IT/OT boundary and demands evidence, not assertion. You will be asked to show your risk picture, your measures and their effectiveness — for environments you may not fully control and whose owners speak a different language. Your leverage is a shared, structured view of OT risk that engineering trusts and the board can read.

**If you are a plant or operations manager,** security decisions now have to be reconciled with production and safety reality, and you are a stakeholder in — not a spectator to — the risk assessment. The upside: a genuinely risk-based approach protects you from disproportionate, disruptive controls being imposed top-down by people who have never stood on your floor.

**If you sit on the board or in executive management,** NIS2 makes cybersecurity a named governance duty with personal exposure. You need enough visibility to approve measures knowingly and to oversee them — which means insisting on a clear, decision-ready view of operational risk, documented training, and a record of what you ratified and when.

**If you are in compliance or legal,** NIS2 introduces hard deadlines and turnover-linked penalties. You need the reporting process rehearsed and the evidence base maintained, because the difference between a defensible position and a fine is often documentation you either kept or did not.

## How OXOT helps

OXOT was built for exactly this: turning fragmented OT security findings into clear, defensible decisions. Our **OT Security Assessments** establish the asset and risk picture NIS2 assumes you already have. Our [Cyber Digital Twin](/en/cyber-digital-twin) unifies documentation, network data, asset inventories and tool output into one structured model, so you can prioritise Article 21 gaps by real operational risk and show your reasoning to an auditor, a board or a regulator. Our **OT Security Programmes** deliver remediation in proportionate, [IEC 62443](/en/iec-62443)-aligned waves, and our **Capability Transfer** work makes sure the knowledge stays with your team after we leave.

We are OT-first, risk-based, and built on the premise of European digital sovereignty — your data and your model stay yours. NIS2 rewards organisations that can demonstrate they understand and manage their risk deliberately. That is the whole point of how we work.

## Frequently asked questions

**Does NIS2 apply directly, or through national law?**
Through national law. NIS2 is a directive, transposed by each Member State. Always check your national statute — several countries set stricter or broader requirements than the directive's baseline. In the Netherlands the relevant law is the Cyberbeveiligingswet.

**We missed the 17 October 2024 deadline — what now?**
That deadline was for *Member States* to legislate, not a grace period for entities. The obligations apply once your national law is in force. Prioritise confirming status, standing up the reporting process, and building the risk picture, then remediate in prioritised waves. Where your Member State's law is late, use the time to be ready rather than to wait.

**How do I know if I'm essential or important?**
Check your sector against Annex I (essential-leaning, high-criticality) and Annex II (important), then apply the size rule — generally 50+ employees or €10m+ turnover — and watch for the size-independent exceptions (DNS, TLD registries, trust services, public electronic comms). Then confirm against your national transposition, which is the binding text.

**Is a firewall between IT and OT enough?**
No. Segmentation matters, but Article 21 spans governance, supply chain, access control, incident handling, continuity, cryptography and more. A single control cannot satisfy a risk-management obligation, and a regulator assessing proportionality will look at the whole programme.

**What counts as a "significant" incident I have to report?**
One that has caused or could cause severe operational disruption or financial loss, or considerable material or non-material damage to others. In OT, most events that disrupt a physical process — safety trips, line stoppages, contamination — will qualify. When in doubt, report; the 24-hour early warning is deliberately low-friction.

**How does NIS2 relate to the CRA and IEC 62443?**
NIS2 obliges *operators* to manage the risk of the systems they run. The [Cyber Resilience Act](/en/cra) obliges *manufacturers* to build security into products with digital elements. [IEC 62443](/en/iec-62443) gives operators and vendors the engineering method to do both. They reinforce one another rather than compete.

**Can board members really be held personally liable?**
Yes. Article 20 requires management to approve and oversee the measures and allows them to be held liable for failures. Several Member States provide, for essential entities, for temporary bans on holding management functions in serious, repeated cases. Documented oversight and training are your protection.

## Sources

- Directive (EU) 2022/2555 (NIS2), full text — [EUR-Lex, CELEX 32022L2555](https://eur-lex.europa.eu/legal-content/EN/TXT/HTML/?uri=CELEX:32022L2555)
- Article 3, essential and important entities — [nis-2-directive.com](https://www.nis-2-directive.com/NIS_2_Directive_Article_3.html)
- Article 21, cybersecurity risk-management measures — [nis-2-directive.com](https://www.nis-2-directive.com/NIS_2_Directive_Article_21.html) · [nis2-info.eu](https://www.nis2-info.eu/article-21-cybersecurity-risk-management-measures/)
- Article 23, reporting obligations & 24/72h/1-month timeline — [nis-2-directive.com](https://www.nis-2-directive.com/NIS_2_Directive_Article_23.html) · [Legiscope](https://www.legiscope.com/blog/nis2-incident-reporting.html)
- Article 34, administrative fines — [nis-2-directive.com](https://www.nis-2-directive.com/NIS_2_Directive_Article_34.html) · [ISMS.online](https://www.isms.online/nis-2/articles/34-administrative-fines-for-non-compliance/)
- Essential vs important entities, scope and size rule — [Glocert](https://www.glocertinternational.com/resources/guides/nis2-applicability-essential-vs-important-entities/) · [Legiscope](https://www.legiscope.com/blog/nis2-essential-important-entities.html)
- Transposition status and Commission enforcement — [European Commission](https://digital-strategy.ec.europa.eu/en/policies/nis-transposition) · [ECSO tracker](https://ecs-org.eu/activities/nis2-directive-transposition-tracker/)
- Netherlands Cyberbeveiligingswet (Cbw) implementing NIS2 — [Bird & Bird](https://www.twobirds.com/en/insights/2026/netherlands/dutch-parliament-approves-cybersecurity-act-implementing-nis2)

*This page is general information about EU law, not legal advice. Confirm how NIS2 applies to your organisation against your national transposition law and, where needed, qualified legal counsel.*
