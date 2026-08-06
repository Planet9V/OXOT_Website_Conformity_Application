---
title: The EU Machinery Regulation
meta_title: EU Machinery Regulation (EU) 2023/1230 & OT Security | OXOT
meta_description: Regulation (EU) 2023/1230 explained for machine builders and operators — how it replaces the Machinery Directive, makes cybersecurity part of the machine safety case (Annex III), handles AI and self-evolving safety components, the 20 January 2027 deadline, notified-body conformity assessment, and the interlock with the AI Act, CRA, IEC 62443 and NIS2.
excerpt: Machine safety for the connected, software and AI era — where protection against corruption becomes a condition of a machine being safe.
content_type: page
published: true
---

For most of industrial history, machine safety and cybersecurity lived in separate worlds. Safety engineers reasoned about guards, interlocks, light curtains and emergency stops. Security, if anyone owned it at all, was an IT concern that stopped at the office firewall. The **EU Machinery Regulation** ends that separation. It rebuilds Europe's machine-safety regime for an era in which machines are networked, software-defined and increasingly steered by AI — and it does something the old law never did: it makes **protection against corruption a condition of a machine being safe**.

That single move rewires the compliance question for everyone who builds, integrates, imports or reworks machinery for the European market. The CE marking that declares a machine safe now depends, in part, on getting cybersecurity right. Miss it, and the machine is not merely insecure — under the Regulation, it is not compliant.

> [!IMPORTANT]
> Regulation (EU) 2023/1230 entered into force on 19 July 2023 and **applies from 20 January 2027**, repealing Machinery Directive 2006/42/EC. From that date, machinery placed on the EU market must meet the new essential health and safety requirements — including the cybersecurity-related ones. ([EUR-Lex](https://eur-lex.europa.eu/eli/reg/2023/1230/oj/eng))

```keyfacts
Instrument :: Regulation (EU) 2023/1230 — directly applicable, no transposition
Replaces :: Machinery Directive 2006/42/EC
In force since :: 19 July 2023
Applies from :: 20 January 2027 (hard deadline)
Cyber clauses :: Annex III §1.1.9 (protection against corruption) + §1.2.1 (control-system reliability)
New high-risk category :: ML-based self-evolving safety components (Annex I Part A)
Substantial modification :: defined in law — Article 3(16)
AI Act link :: AI safety component in machinery → automatically high-risk
Key emerging standard :: prEN 50742 — protection against corruption
```

## The short version

- The **Machinery Regulation (EU) 2023/1230** replaces the long-standing **Machinery Directive 2006/42/EC**. ([EUR-Lex](https://eur-lex.europa.eu/eli/reg/2023/1230/oj/eng))
- It applies from **20 January 2027** — a hard deadline, not a soft target. ([EU-OSHA](https://osha.europa.eu/en/legislation/directive/regulation-20231230eu-machinery))
- As a **Regulation** rather than a Directive, it applies **directly and identically** across all 27 Member States, ending the national divergence that Directive transposition allowed.
- It introduces **cybersecurity-related essential health and safety requirements** in **Annex III** — machinery must resist **accidental or intentional corruption** that could create a hazard, and must keep **tamper evidence**. ([Nemko](https://www.nemko.com/blog/eu-machinery-regulation-2023/1230))
- It addresses **software, connectivity and AI**, including machinery with **self-evolving behaviour** and **AI-based safety components**.
- It links to the **[AI Act](/en/ai-act)**: an AI system used as a safety component of machinery that itself needs third-party conformity assessment is **automatically high-risk**. ([EU AI Act Annex I](https://artificialintelligenceact.eu/annex/1/))

## Why the old Directive failed the connected era

The Machinery Directive is a product of 2006 — a world before the industrial IoT was routine, before a press or a palletiser routinely spoke to a network, before machine-learning models sat inside a safety loop. On its own terms it was a good law. It disciplined mechanical, electrical, thermal and ergonomic hazards, and it gave Europe a common safety grammar for two decades.

What it never contemplated is a machine that is mechanically flawless yet dangerous because someone corrupted its logic. A guard is worthless if a forged network command retracts it. An emergency-stop function is worthless if its firmware can be silently overwritten. A perfectly rated safety relay is worthless if the safety PLC driving it accepts unauthenticated instructions from a remote-maintenance portal. The Directive had nothing to say about any of that, because in 2006 those attack surfaces barely existed on the plant floor.

The Regulation is the correction. It keeps the proven architecture of EU product-safety law — essential health and safety requirements, risk assessment, conformity assessment, CE marking, a Declaration of Conformity — and extends that architecture to the **digital** ways a modern machine becomes unsafe. Two structural choices signal the intent.

**It is a Regulation, not a Directive.** A Directive is a target each Member State transposes into national law, which is why "the Machinery Directive" quietly meant 27 slightly different laws. A Regulation is the law, in every country, on the same day. One European rulebook, no transposition lag, far less room for a machine that is legal in one market and not another.

**It puts security inside the safety case, not beside it.** The Regulation does not create a separate "cyber annex" you can bolt on late. It threads corruption-resistance, safe connectivity and tamper evidence through the same essential requirements that govern guarding and control reliability. Security is now something your safety engineers own, evidenced in the same technical file.

### Directive 2006/42/EC vs Regulation (EU) 2023/1230

| Dimension | Machinery **Directive** 2006/42/EC | Machinery **Regulation** (EU) 2023/1230 |
|---|---|---|
| Legal instrument | Directive — transposed into 27 national laws | Regulation — directly applicable, uniform EU-wide |
| Applies from | 29 December 2009 | **20 January 2027** ([EU-OSHA](https://osha.europa.eu/en/legislation/directive/regulation-20231230eu-machinery)) |
| Cybersecurity | Effectively silent | Explicit EHSRs on **protection against corruption** and safe connections (Annex III) |
| Software & AI | Not addressed as such | Software safety components and **AI / self-evolving** behaviour in scope |
| High-risk list | Annex IV; self-certification broadly available | **Annex I** (Parts A/B); Part A makes **notified-body** assessment mandatory |
| Instructions | Paper manual generally required | **Digital instructions** permitted (with safety-info carve-outs) |
| Substantial modification | Handled through national/guidance practice | **Defined in law** (Art. 3(16)); modifier becomes the manufacturer |

## What the Regulation covers

The Regulation applies to **machinery** and a family of **related products**: safety components, interchangeable equipment, lifting accessories, chains, ropes and webbing, removable mechanical transmission devices, and **partly completed machinery** — an assembly that cannot yet perform an application on its own and is meant to be built into other machinery. ([EU-OSHA](https://osha.europa.eu/en/legislation/directive/regulation-20231230eu-machinery))

Two points matter most for the digital era:

**Safety components are products in their own right.** A safety component is a part whose failure endangers people, and the Regulation is explicit that this now includes **software** performing a safety function and, named specifically, **AI-based** safety components. If your product's job is to keep a machine safe, it carries the requirements — whether it is a light curtain, a safety controller, or a trained model that decides when a collaborative robot must stop.

**Self-evolving behaviour is anticipated, not ignored.** The Regulation contemplates machinery whose behaviour can adapt or learn after it leaves the factory, and it refuses to let that evolution wander outside the safe operating envelope validated at conformity assessment. Learning is allowed; drifting into a hazardous state is not.

Alongside the technology, the Regulation modernises the paperwork. It permits **digital instructions and documentation** rather than a mandatory printed manual in every case (with sensible carve-outs so that essential safety information remains accessible), and it writes the rules on **substantial modification** into the law itself — more on that below.

## Cybersecurity becomes part of the safety case

Here is the heart of the change for anyone in OT. The Regulation's essential health and safety requirements, set out in **Annex III**, now carry cybersecurity-relevant clauses. The clearest is **Annex III §1.1.9, "Protection against corruption."** In plain terms: a machine must be designed so that its safety is **not compromised by corruption — whether accidental or intentional** — of the hardware and software components that affect safety. ([Nemko](https://www.nemko.com/blog/eu-machinery-regulation-2023/1230))

Read that carefully, because the wording is precise and the precision is the point.

- The concern is **safety**, not confidentiality. The Regulation does not ask you to protect trade secrets; it asks you to ensure that corruption cannot turn the machine into a hazard.
- It covers **accidental and intentional** corruption alike — a malformed update, a mis-flashed controller, a bit-flip on a bus, and a deliberate attacker are all in scope.
- It reaches the components **that affect safety**. A machine's business-logic HMI is not the target; the safety function and the systems that can influence it are.

From that clause, and the control-reliability requirements in **Annex III §1.2.1**, a concrete set of engineering expectations follows.

### The cybersecurity-related essential requirements, in engineering terms

| Requirement (as expressed in Annex III) | What it means on the machine |
|---|---|
| Safety not compromised by **accidental or intentional corruption** of safety-affecting hardware/software (§1.1.9) | Safety-related control logic and firmware must resist tampering; corrupting them must not be able to defeat a safety function |
| **Evidence of intervention** in safety software | The control system must **log** legitimate and illegitimate interventions so tampering is detectable and traceable — tamper evidence, retained over the machine's life ([Nemko](https://www.nemko.com/blog/eu-machinery-regulation-2023/1230)) |
| Safe **connection** to external devices (§1.2.1) | Wireless, networked and remote-access features must not create a hazardous situation; a bad or hostile connection must not reach a safety function |
| **Robust safety functions** under external influence | Safety functions must remain reliable when subjected to reasonably foreseeable external influence delivered through connections, not only under clean-lab conditions |
| **Lifecycle** maintenance of protection | Protective measures, updates and patches must be sustainable across the machine's operational life, not frozen at the moment of shipment |

This is a genuine reframing, not a relabelling. Cybersecurity for machinery is no longer a parallel workstream that runs alongside safety and reports to a different manager. It is **inside** the safety argument. If a machine can be made dangerous by corrupting its software, then — in the Regulation's logic — it is not safe, and it does not conform. The security failure and the safety failure are the same failure.

### What "protection against corruption" actually demands

The Regulation states the *outcome* — safety must survive corruption — and leaves the *how* to engineering and standards. In practice, satisfying Annex III §1.1.9 and §1.2.1 on a real machine converges on a recognisable set of controls, the same measures a control-system security engineer would reach for:

- **Know your software.** Identify the safety-affecting software and data — increasingly captured as a **software bill of materials (SBOM)** — because you cannot protect components you have not enumerated. This is also the seam with the [CRA](/en/cra), which makes the SBOM an explicit obligation.
- **Authenticate what runs.** **Signed firmware** and a **secure/verified boot** chain so a modified safety image is rejected rather than executed. The Regulation's example is blunt: if someone installs modified safety firmware, the machine must be able to detect it.
- **Authenticate who connects.** Safety-relevant instructions must come only from authenticated, authorised sources. An unauthenticated command from a remote-maintenance portal must never be able to reach a safety function.
- **Constrain the connection.** Networked, wireless and remote-access features must be designed so a bad or hostile connection cannot create a hazardous situation — segmentation, least privilege, and a safe-state fallback if the link misbehaves.
- **Make tampering visible.** Log both **legitimate and illegitimate** interventions in safety software, with retention across the machine's operational life, so corruption is detectable and traceable after the fact.
- **Sustain protection over the lifecycle.** Updates and patches for the safety-affecting software must remain deliverable for as long as the machine is in service — protection frozen at ship date is not protection.

```compare
The safety case survives corruption when…
- Safety-affecting software is **inventoried** (SBOM) and its integrity is verifiable
- Firmware is **signed** and boot is **verified** — modified images are rejected
- Remote and networked access is **authenticated, authorised and segmented**
- Interventions are **logged and retained** — tampering leaves evidence
- Patches and updates stay **deliverable across the machine's life**
---
The machine is non-conforming when…
- A **forged network command** can retract a guard or defeat an interlock
- Safety **firmware can be silently overwritten** and executed
- A **remote-maintenance portal** reaches a safety function unauthenticated
- Tampering with safety software **leaves no trace**
- Security **cannot be maintained** after the machine ships
```

None of this is novel to a security engineer — which is exactly the point. The Regulation does not invent a new discipline; it imports an existing one, [IEC 62443](/en/iec-62443), into the machine-safety file and makes it a condition of the CE mark.

```svg
<svg viewBox="0 0 700 340" xmlns="http://www.w3.org/2000/svg" font-family="system-ui,Segoe UI,Roboto,sans-serif">
  <rect x="0" y="0" width="700" height="340" fill="none"/>
  <text x="350" y="28" fill="#e5e7eb" font-size="17" font-weight="700" text-anchor="middle">Cybersecurity as part of the machine safety case</text>

  <!-- Outer safety case boundary -->
  <rect x="30" y="50" width="640" height="260" rx="12" fill="none" stroke="#3b82f6" stroke-width="2"/>
  <text x="46" y="72" fill="#3b82f6" font-size="13" font-weight="700">Machine safety case → CE marking &amp; Declaration of Conformity</text>

  <!-- Traditional safety block -->
  <rect x="55" y="92" width="285" height="88" rx="8" fill="none" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="197" y="114" fill="#e5e7eb" font-size="13" font-weight="700" text-anchor="middle">Functional / mechanical safety</text>
  <text x="197" y="136" fill="#94a3b8" font-size="11.5" text-anchor="middle">Guards · interlocks · E-stop</text>
  <text x="197" y="153" fill="#94a3b8" font-size="11.5" text-anchor="middle">Control reliability · risk assessment</text>
  <text x="197" y="170" fill="#94a3b8" font-size="11.5" text-anchor="middle">EN ISO 12100 / 13849</text>

  <!-- Cyber block -->
  <rect x="360" y="92" width="285" height="88" rx="8" fill="none" stroke="#f97316" stroke-width="1.5"/>
  <text x="502" y="114" fill="#f97316" font-size="13" font-weight="700" text-anchor="middle">Protection against corruption</text>
  <text x="502" y="136" fill="#94a3b8" font-size="11.5" text-anchor="middle">Anti-tamper · safe connections</text>
  <text x="502" y="153" fill="#94a3b8" font-size="11.5" text-anchor="middle">Tamper-evidence logging</text>
  <text x="502" y="170" fill="#94a3b8" font-size="11.5" text-anchor="middle">Annex III §1.1.9 / §1.2.1</text>

  <!-- Merge arrow -->
  <line x1="197" y1="180" x2="197" y2="210" stroke="#94a3b8" stroke-width="1.5"/>
  <line x1="502" y1="180" x2="502" y2="210" stroke="#94a3b8" stroke-width="1.5"/>
  <line x1="197" y1="210" x2="502" y2="210" stroke="#94a3b8" stroke-width="1.5"/>
  <line x1="350" y1="210" x2="350" y2="238" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#a)"/>
  <defs>
    <marker id="a" markerWidth="9" markerHeight="9" refX="5" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="#94a3b8"/>
    </marker>
  </defs>

  <rect x="205" y="240" width="290" height="52" rx="8" fill="none" stroke="#3b82f6" stroke-width="2"/>
  <text x="350" y="262" fill="#e5e7eb" font-size="13" font-weight="700" text-anchor="middle">One integrated safety argument</text>
  <text x="350" y="281" fill="#94a3b8" font-size="11.5" text-anchor="middle">Corruptible safety = not safe = not compliant</text>
</svg>
```

> [!NOTE]
> Emerging standards are lining up behind the clauses. **EN 50742** (under development) addresses corruption protection in machinery and safety components; **IEC 62443** supplies the recognised engineering method for the control systems inside a machine; **ISO/CD 24882** targets cybersecurity for agricultural machinery. Expect harmonised standards to become the practical route to presuming conformity. ([Nemko](https://www.nemko.com/blog/eu-machinery-regulation-2023/1230))

## Software, connectivity and AI — and the AI Act interlock

The Regulation is deliberately forward-leaning on software and AI. It recognises machinery whose behaviour can **evolve** — systems that adapt or learn in service — and requires that such evolution cannot carry the machine beyond the safe envelope proven at assessment. Where AI performs a safety function, the machine must reckon with what AI actually brings: behaviour that is hard to test exhaustively, decisions that are hard to explain, and a standing need for meaningful human oversight of automated action.

This is exactly where the Machinery Regulation and the **[AI Act](/en/ai-act)** are engineered to interlock. The Machinery Regulation appears in **Annex I of the AI Act** as Union harmonisation legislation. Under **AI Act Article 6(1)**, an AI system that is a **safety component** of a product covered by that Annex I legislation — and where the product must undergo third-party conformity assessment — is **automatically classified as high-risk**. ([EU AI Act Annex I](https://artificialintelligenceact.eu/annex/1/))

The consequence is concrete. Deploy an AI model as a safety component in machinery that falls into the notified-body route, and you are simultaneously the manufacturer of a high-risk AI system. Two regimes, one product, at the same time:

- The **Machinery Regulation** governs the machine's safety-and-security (risk assessment, Annex III essential requirements, conformity assessment, technical file, CE marking).
- The **AI Act** layers on the high-risk obligations for the model itself: risk management, data governance, logging, transparency, human oversight, accuracy and robustness, and a quality management system.

> [!WARNING]
> An AI safety component is not "a bit of extra paperwork." Under Article 6(1), it can move your product from a self-declared route into **third-party conformity assessment with a notified body**, and it triggers the AI Act's high-risk lifecycle at the same time. Discovering that overlap during assessment, months before a launch, is one of the most expensive ways to learn it. Map it at design time. See [AI Act](/en/ai-act).

## Conformity assessment and high-risk machinery

Like the Directive before it, the Regulation classifies machinery by risk and offers proportionate routes to CE marking. Most machinery can still reach the market by the manufacturer's **self-assessment** (internal production control). The higher-risk categories are listed in **Annex I**, split into two parts, and this is where the notified body enters.

- **Annex I, Part A** — the categories the Regulation treats as the highest risk. For these, **third-party conformity assessment by a notified body is mandatory**; the manufacturer cannot self-declare. Part A now includes **safety components with fully or partially self-evolving behaviour using machine-learning approaches ensuring safety functions** — a category that did not, and could not, exist under the 2006 Directive. ([Baker McKenzie](https://www.bakermckenzie.com/en/insight/publications/resources/product-risk-radar-articles/machinery-regulation))
- **Annex I, Part B** — high-risk categories broadly comparable to the old Annex IV, where a manufacturer may use a self-assessment route **only** if it has applied the relevant harmonised standards in full; otherwise a notified body is required.

### Risk category → conformity route

| Machinery category | Risk tier | Conformity route |
|---|---|---|
| Ordinary machinery (not in Annex I) | Standard | Manufacturer **self-assessment** (internal production control) |
| **Annex I, Part B** high-risk | High | Self-assessment **only if** harmonised standards applied in full; otherwise **notified body** |
| **Annex I, Part A** (incl. **ML-based self-evolving safety components**) | Highest | **Notified body mandatory** — no self-declaration ([Baker McKenzie](https://www.bakermckenzie.com/en/insight/publications/resources/product-risk-radar-articles/machinery-regulation)) |

The practical takeaway: adding connectivity or AI to a machine is not a neutral feature decision. It can change the machine's risk classification, the conformity route, whether a notified body is in the loop, and therefore the cost and lead time to market. That call belongs at the start of a project, with your safety and security engineers in the room together.

## Substantial modification: when the plant floor becomes the manufacturer

One provision deserves its own spotlight, because it catches integrators and operators who think the Regulation is only a builder's problem. The Regulation **defines substantial modification in law**, at **Article 3(16)**: a modification of a machine, by physical or digital means, made after it was placed on the market or put into service, that the original manufacturer did not foresee or plan, and that affects safety by creating a new hazard or increasing an existing risk such that new protective measures are needed. ([EU-OSHA](https://osha.europa.eu/en/legislation/directive/regulation-20231230eu-machinery))

The sting is in the effect. A person who carries out a substantial modification is **considered the manufacturer** of the modified machinery and takes on the manufacturer's obligations under Article 10 — a fresh risk assessment, conformity assessment, technical file, Declaration of Conformity and CE marking for the modified machine. And because the definition explicitly names **digital** means, a change to control software, a new network connection, or a retrofitted AI function can be the substantial modification that transfers manufacturer liability onto you.

> [!TIP]
> Before you rework a safety-related control system — re-flash a safety PLC, add remote access, drop in a learning model — assess whether the change is a substantial modification under Article 3(16). If it is, you have just inherited a manufacturer's obligations. Knowing that line **before** you touch the machine is far cheaper than discovering it after an incident. A [Cyber Digital Twin](/en/cyber-digital-twin) makes those change boundaries visible.

## The multi-framework stack around a smart machine

The Machinery Regulation does not operate alone. A single connected, AI-enabled production line can pull five European regimes into scope at once, each governing a different facet of the same asset. Treating them as five disconnected audits is how programmes go over budget; treating them as one engineering problem is how they get built once.

```svg
<svg viewBox="0 0 700 400" xmlns="http://www.w3.org/2000/svg" font-family="system-ui,Segoe UI,Roboto,sans-serif">
  <rect x="0" y="0" width="700" height="400" fill="none"/>
  <text x="350" y="28" fill="#e5e7eb" font-size="17" font-weight="700" text-anchor="middle">One connected/AI machine → five regimes at once</text>

  <!-- Center node -->
  <rect x="270" y="170" width="160" height="60" rx="10" fill="none" stroke="#f97316" stroke-width="2.5"/>
  <text x="350" y="196" fill="#e5e7eb" font-size="13.5" font-weight="700" text-anchor="middle">Connected / AI</text>
  <text x="350" y="214" fill="#e5e7eb" font-size="13.5" font-weight="700" text-anchor="middle">machine</text>

  <!-- Spokes -->
  <!-- Machinery Reg (top) -->
  <line x1="350" y1="170" x2="350" y2="118" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#b)"/>
  <rect x="245" y="66" width="210" height="52" rx="8" fill="none" stroke="#3b82f6" stroke-width="1.8"/>
  <text x="350" y="88" fill="#3b82f6" font-size="12.5" font-weight="700" text-anchor="middle">Machinery Regulation 2023/1230</text>
  <text x="350" y="106" fill="#94a3b8" font-size="11" text-anchor="middle">safety incl. protection against corruption</text>

  <!-- AI Act (top-left) -->
  <line x1="290" y1="180" x2="150" y2="120" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#b)"/>
  <rect x="30" y="86" width="180" height="52" rx="8" fill="none" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="120" y="108" fill="#e5e7eb" font-size="12.5" font-weight="700" text-anchor="middle">AI Act</text>
  <text x="120" y="126" fill="#94a3b8" font-size="11" text-anchor="middle">AI safety component → high-risk</text>

  <!-- CRA (top-right) -->
  <line x1="410" y1="180" x2="550" y2="120" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#b)"/>
  <rect x="490" y="86" width="180" height="52" rx="8" fill="none" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="580" y="108" fill="#e5e7eb" font-size="12.5" font-weight="700" text-anchor="middle">CRA</text>
  <text x="580" y="126" fill="#94a3b8" font-size="11" text-anchor="middle">product w/ digital elements</text>

  <!-- IEC 62443 (bottom-left) -->
  <line x1="290" y1="220" x2="150" y2="290" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#b)"/>
  <rect x="30" y="292" width="180" height="52" rx="8" fill="none" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="120" y="314" fill="#e5e7eb" font-size="12.5" font-weight="700" text-anchor="middle">IEC 62443 (4-1 / 4-2)</text>
  <text x="120" y="332" fill="#94a3b8" font-size="11" text-anchor="middle">the engineering method</text>

  <!-- NIS2 (bottom-right) -->
  <line x1="410" y1="220" x2="550" y2="290" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#b)"/>
  <rect x="490" y="292" width="180" height="52" rx="8" fill="none" stroke="#94a3b8" stroke-width="1.5"/>
  <text x="580" y="314" fill="#e5e7eb" font-size="12.5" font-weight="700" text-anchor="middle">NIS2</text>
  <text x="580" y="332" fill="#94a3b8" font-size="11" text-anchor="middle">operator of the running line</text>

  <text x="350" y="376" fill="#94a3b8" font-size="11.5" text-anchor="middle">Build it once as one engineering problem — not five audits</text>

  <defs>
    <marker id="b" markerWidth="9" markerHeight="9" refX="5" refY="3" orient="auto">
      <path d="M0,0 L6,3 L0,6 Z" fill="#94a3b8"/>
    </marker>
  </defs>
</svg>
```

### How the frameworks divide the same asset

| Regime | What it governs on the machine | Who it lands on |
|---|---|---|
| **[Machinery Regulation](#)** 2023/1230 | Machine safety, incl. protection against corruption (Annex III) | Manufacturer / substantial modifier |
| **[AI Act](/en/ai-act)** | AI safety component → high-risk lifecycle obligations | Provider of the AI system |
| **[CRA](/en/cra)** | The digital components as products with digital elements — security-by-design, vulnerability handling | Manufacturer of the digital product |
| **[IEC 62443](/en/iec-62443)** | The engineering method: secure development (4-1), component security (4-2) | Builder / integrator of the control system |
| **[NIS2](/en/nis2)** | Running the machinery as part of an essential/important service | The operator |

A builder who treats these as one coherent engineering problem — a single secure-development lifecycle, one risk model, one technical file that satisfies several regimes — spends far less than one running four parallel compliance projects, and ends with a more defensible product. Our [Frameworks](/en/frameworks) view maps where each obligation sits.

### The CRA and the Machinery Regulation — one machine, two mandates

The pairing that most often confuses builders is the [Cyber Resilience Act](/en/cra) and the Machinery Regulation, because both talk about cybersecurity on the same box — yet they ask different questions. The Machinery Regulation asks *"can corruption make this machine unsafe?"* — a **safety** question, answered in the machine's safety case. The CRA asks *"is this product with digital elements secure by design, and will vulnerabilities be handled over its life?"* — a **product-security** question, answered through the CRA's own essential requirements, SBOM and vulnerability-disclosure duties.

The good news is that they are designed to reinforce, not collide. EU guidance is explicit that **compliance with the CRA's cybersecurity requirements can facilitate compliance** with the Machinery Regulation's corruption-protection clauses — the same secure-development evidence, SBOM and update mechanism feed both files. ([ORC WG CRA FAQ](https://cra.orcwg.org/faq/official/faq_2-4-1/)) A builder who runs one secure-development lifecycle produces the artefacts both regimes want; a builder who treats them as two projects pays twice for the same evidence.

### Harmonised standards and the presumption of conformity

As with every New-Legislative-Framework law, the practical route to demonstrating conformity is a **harmonised standard**: apply one whose reference is published in the Official Journal and you gain a **presumption of conformity** with the requirement it covers. For the new cybersecurity clauses the headline instrument is **prEN 50742**, under development specifically to address *protection against corruption* in machinery and safety components — the standard written to operationalise Annex III §1.1.9. ([IBF, prEN 50742](https://www.ibf-solutions.com/en/seminars-and-news/news/new-standard-pren-50742-protection-against-corruption)) Alongside it, the established safety standards (**EN ISO 12100** for risk assessment, **EN ISO 13849** for safety-related control systems) continue to carry the mechanical and functional-safety requirements, and **[IEC 62443](/en/iec-62443)** supplies the recognised engineering method for the control systems inside the machine. Building your evidence against this stack once is what turns a wall of legal clauses into an auditable design.

```cta
One connected machine, five regimes — and you may already be the manufacturer.
Machinery, AI Act, CRA, IEC 62443 and NIS2 can all land on the same line. We build it once, as one engineering problem, not five parallel audits.
Map my machine's obligations :: /en/contact
```

## A worked example: a networked robot welding cell

A builder ships a **robot welding cell**: a six-axis robot, a safety PLC, a light curtain and interlocked doors, an HMI, and a **remote-support VPN** the builder uses for diagnostics and program updates. Under the 2006 Directive this was a well-understood safety product. Under the Regulation, the same cell asks new questions.

- **Where is the corruption risk?** The safety PLC logic, the robot's safety configuration, and the remote-support path. If a forged command over the VPN can relax a speed-and-separation limit, or if the safety PLC accepts an unsigned logic download, the cell can be made unsafe by corruption — squarely within Annex III §1.1.9.
- **What does conformity now require?** The risk assessment must treat corruption as a hazard; the remote path must be authenticated, authorised and segmented; safety firmware must be signed and its integrity verifiable; and interventions must be logged with lifetime retention. The technical file has to *evidence* all of this, not merely assert it.
- **Does a notified body enter?** If the cell's category, or an added ML-based self-evolving safety component, lands it in **Annex I Part A**, self-declaration is off the table and a notified body is mandatory — a lead-time decision that belongs at design time, not at launch.
- **Who owns it after commissioning?** If the operator later adds a new network connection or re-flashes the safety PLC in a way the builder never foresaw, that can be a **substantial modification** under Article 3(16) — and the operator becomes the manufacturer of the modified cell.

One cell, and the safety engineer, the security engineer and the procurement lead are suddenly working the same file. That convergence is the whole point of the Regulation — and the reason a single, shared model of the machine beats four disconnected reviews.

## What it means for your role

**If you build or integrate machinery**, this is a direct obligation with a January 2027 wall. Your safety engineering now has to include cybersecurity, and your technical file has to evidence it. Where connectivity or an AI safety component changes the risk tier, a notified body may enter the loop — and the AI Act may apply on top. The cheap version of this project starts now; the expensive version starts in late 2026.

**If you substantially modify machines** — the daily reality of the plant floor — Article 3(16) can make you the manufacturer of the modified machine, digital changes included. Locate that line before you re-flash a safety controller or add remote access.

**If you operate machinery**, the Regulation raises the security floor of the equipment you buy over time — but only if your procurement asks for it. Start specifying machinery designed to resist corruption, with tamper evidence and a lifecycle patch commitment, in your next tender rather than your next Regulation.

**If you sit on the board**, the exposure is CE-marking and product-liability exposure now wearing a cybersecurity face. A machine made dangerous by a software flaw is a non-conforming product, with the market-access and liability consequences that follow. This belongs on the risk register alongside [NIS2](/en/nis2), not in a separate "IT" column.

## The road to 20 January 2027

The dates are simple; the temptation to treat the gap as idle time is the trap.

```timeline
19 July 2023 :: **Regulation enters into force.** The text is fixed; the transition window opens. Nothing is required yet, but the clock is running.
2023–2026 :: **Transition and preparation.** Machinery may still be placed on the market under Directive 2006/42/EC; builders adapt designs, files and processes. Harmonised standards (incl. prEN 50742) mature.
20 January 2027 :: **The Regulation applies.** Machinery placed on the EU market must meet the new essential requirements — including the cybersecurity-related ones. The Directive is repealed.
After 20 Jan 2027 :: **Lifecycle obligations run.** Protection against corruption, tamper evidence and update delivery must be sustained across each machine's operational life.
```

> [!WARNING]
> The interval to 2027 is *transition time, not idle time.* Folding cybersecurity into the safety case, re-checking conformity routes, engaging a notified body where connectivity or AI changes the risk tier, and designing tamper-evident logging in from the start are all long-lead tasks. A builder who starts in late 2026 will be doing the expensive version of this project.

## A builder's readiness roadmap to January 2027

1. **Inventory your safety-affecting software and connectivity.** For each product line, list the components that affect safety, every external connection, and any AI in a safety function. You cannot secure what you have not mapped. A [Cyber Digital Twin](/en/cyber-digital-twin) is a fast way to build that map.
2. **Fold cybersecurity into the risk assessment.** Corruption of safety-affecting software is now a hazard to be assessed under Annex III, in the same document as mechanical hazards — not a separate report.
3. **Re-check your conformity route.** Does connectivity or an AI safety component push a product into Annex I Part A or Part B? If so, engage a notified body's lead time early.
4. **Adopt the engineering method.** Align the control-system work to **[IEC 62443](/en/iec-62443)** — 4-1 for secure development, 4-2 for component security — so the Annex III clauses have a concrete, auditable implementation.
5. **Build tamper evidence in.** Design the logging of legitimate and illegitimate interventions into the control system, with retention across the machine's life. Retrofitting it later is painful.
6. **Test the AI Act interlock.** For any AI safety component, run the Article 6(1) classification and stand up the high-risk obligations in parallel with the machine's assessment.
7. **Update the technical file and instructions.** Evidence the cybersecurity measures in the file; use the new **digital instructions** allowance where it helps, keeping essential safety information accessible.
8. **Rehearse substantial modification.** Give your integration and service teams a clear Article 3(16) test so they know when a change makes them the manufacturer.

## Frequently asked questions

**When does the Machinery Regulation apply?**
From **20 January 2027**, replacing Machinery Directive 2006/42/EC. It entered into force in July 2023; the interval to 2027 is transition time to adapt products and processes — not idle time, given the new cybersecurity and AI dimensions. ([EU-OSHA](https://osha.europa.eu/en/legislation/directive/regulation-20231230eu-machinery))

**Is cybersecurity really part of machine safety now?**
Yes. Annex III §1.1.9 requires that safety is not compromised by accidental or intentional corruption of safety-affecting hardware and software, and that intervention in safety software leaves evidence. A machine that can be made dangerous by tampering with its software does not meet the Regulation. ([Nemko](https://www.nemko.com/blog/eu-machinery-regulation-2023/1230))

**We add AI to our machines. What extra applies?**
If the AI is a safety component and the machine needs third-party conformity assessment, it is **automatically high-risk** under the [AI Act](/en/ai-act) (Article 6(1) via Annex I). Both regimes then apply to the same product, so plan for them together. ([EU AI Act Annex I](https://artificialintelligenceact.eu/annex/1/))

**Does modifying an existing machine trigger the Regulation?**
It can. A **substantial modification** under Article 3(16) — physical or digital — makes you the manufacturer of the modified machine, with the obligations that follow. Assess before you rework safety-related control systems. ([EU-OSHA](https://osha.europa.eu/en/legislation/directive/regulation-20231230eu-machinery))

**When is a notified body mandatory?**
For **Annex I Part A** categories — the highest-risk machinery, now including machine-learning-based self-evolving safety components — a notified body is required and self-declaration is not available. Part B categories may self-assess only where harmonised standards are applied in full. ([Baker McKenzie](https://www.bakermckenzie.com/en/insight/publications/resources/product-risk-radar-articles/machinery-regulation))

**How is this different from the Cyber Resilience Act?**
They answer different questions about the same machine. The Machinery Regulation asks whether corruption can make the machine *unsafe* (a safety question, in the safety case); the [CRA](/en/cra) asks whether the product with digital elements is *secure by design* with vulnerability handling over its life (a product-security question). They are designed to reinforce each other — CRA compliance can facilitate Machinery-Regulation compliance — so one secure-development lifecycle feeds both files. ([ORC WG CRA FAQ](https://cra.orcwg.org/faq/official/faq_2-4-1/))

**What standard covers the new cybersecurity clauses?**
**prEN 50742** is being developed specifically for *protection against corruption* in machinery and safety components, to operationalise Annex III §1.1.9; applying a published harmonised standard gives a presumption of conformity. EN ISO 12100 and EN ISO 13849 continue to carry risk assessment and safety-related control-system requirements, with IEC 62443 as the engineering method for the control systems. ([IBF, prEN 50742](https://www.ibf-solutions.com/en/seminars-and-news/news/new-standard-pren-50742-protection-against-corruption))

**Do we need an SBOM for our machine?**
It is fast becoming the practical baseline. You must identify and protect the safety-affecting software, which is exactly what a software bill of materials records — and the [CRA](/en/cra) makes the SBOM an explicit obligation for products with digital elements. Building it once serves both regimes.

## How OXOT helps

The Regulation's cybersecurity requirements are, at their core, control-system security requirements for the systems inside a machine — OXOT's home ground. We help machine builders and integrators translate the Annex III essential requirements into an engineering programme aligned to **[IEC 62443](/en/iec-62443)**, so the clauses become an auditable design rather than an aspiration. We help operators fold machinery-security expectations into procurement and into their broader OT security and **[NIS2](/en/nis2)** programmes. And where AI safety components are in play, our **[Cyber Digital Twin](/en/cyber-digital-twin)** locates them in your risk picture so the Machinery Regulation and [AI Act](/en/ai-act) obligations — and the [CRA](/en/cra) overlap — are handled together, once, rather than in four separate scrambles. See how it fits the wider [Frameworks](/en/frameworks) picture.

## Sources

- Regulation (EU) 2023/1230 (Machinery Regulation), official text — [EUR-Lex](https://eur-lex.europa.eu/eli/reg/2023/1230/oj/eng)
- Regulation 2023/1230/EU — machinery, legislation overview — [EU-OSHA](https://osha.europa.eu/en/legislation/directive/regulation-20231230eu-machinery)
- EU Machinery Regulation 2023/1230: cybersecurity obligations for manufacturers — [Nemko](https://www.nemko.com/blog/eu-machinery-regulation-2023/1230)
- Machinery Regulation — high-risk categories and conformity assessment analysis — [Baker McKenzie](https://www.bakermckenzie.com/en/insight/publications/resources/product-risk-radar-articles/machinery-regulation)
- AI Act Annex I — Union harmonisation legislation (incl. machinery) — [artificialintelligenceact.eu](https://artificialintelligenceact.eu/annex/1/)
- prEN 50742 — protection against corruption in machinery and safety components — [IBF Solutions](https://www.ibf-solutions.com/en/seminars-and-news/news/new-standard-pren-50742-protection-against-corruption)
- CRA ↔ Machinery Regulation interplay — [ORC WG CRA FAQ](https://cra.orcwg.org/faq/official/faq_2-4-1/)
- Machinery Regulation compliance, AI & cybersecurity overview — [Intertek](https://www.intertek.com/industrial-equipment/machinery-regulation/)

*This page is general information about EU law, not legal advice. Confirm how the Machinery Regulation applies to your products and role against the Regulation itself and, where needed, qualified counsel.*
