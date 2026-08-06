---
title: OT Security Baseline
meta_title: OT Security Baseline | OXOT
meta_description: A minimum set of OT security controls that are realistic, repeatable and aligned to how your plants actually run — a defensible floor mapped to IEC 62443 security levels, NIS2 minimum measures and the CRA.
excerpt: Define minimum security controls that are realistic, repeatable and aligned with operational needs — a consistent floor every site can meet, prove and maintain.
content_type: page
published: true
---

A baseline is the floor everyone has to reach before you argue about the advanced stuff. OXOT designs OT security baselines that are realistic for how your plants actually run, repeatable across sites, and mapped explicitly to IEC 62443 security levels — so "secure enough" means the same thing at every location in your estate.

The point is consistency and evidence: a baseline you can roll out site by site, prove you have met, and hand to an auditor without a scramble.

```keyfacts
Purpose :: a minimum standard every site can actually meet
Basis :: IEC 62443 target security levels (SL-1 / SL-2 per zone)
Scope :: defined per zone and asset class
Format :: a control checklist with evidence requirements
Rollout :: applied site by site, with a structured exception process
Outcome :: consistent, auditable OT security across your entire estate
```

## Why most OT security baselines fail

A baseline sounds simple: define the minimum controls, apply them everywhere. In practice, two failure modes dominate.

The first is the generic template. An organisation adopts an IT security checklist or a standard's annex verbatim, without adapting it to the operational reality of each zone. The result is a set of controls that cannot be met — password rotation policies that break legacy PLCs, patch cadences that require production downtime, MFA requirements that no OT system supports. The "baseline" exists on paper and nowhere else.

The second is the unenforced baseline. Controls are defined, but there is no evidence requirement, no exception process and no mechanism to verify compliance site by site. The baseline describes an intention rather than a state.

```compare
A generic or unenforced baseline
- Controls copied from IT or from a standard's annex without adaptation
- Applies the same requirements everywhere, regardless of zone or asset type
- No evidence requirements — compliance is assumed, not verified
- No exception process — sites either meet it entirely or are "non-compliant"
- A point-in-time snapshot that ages without a maintenance mechanism
---
An OXOT OT security baseline
- Controls derived from your actual zones, asset classes and risk tolerance
- Per-zone applicability — safety controllers, engineering workstations and historians each have the right set
- Evidence templates built in — simple, repeatable ways to prove each control
- A structured exception process with owner, rationale and review date
- A living document maintained through the Cyber Digital Twin, updated as your estate changes
```

## What you get

```cards
Tailored control baseline :: :: A minimum control set written for your environment and risk appetite — not a generic template. Every control is achievable for at least one asset class in at least one zone.
Per-zone applicability map :: :: Which controls apply where, mapped to zones and asset classes defined in your architecture. Safety controllers, engineering workstations, historian servers and IT-facing gateways each have the appropriate set — not a one-size list that cannot be met.
Evidence templates :: :: Simple, repeatable ways to prove each control is in place: what to look for, where to find it, and what an acceptable answer looks like. Designed so your own engineers can run the checks without specialist support.
Rollout & exception process :: :: A structured path to apply the baseline site by site, and a disciplined way to handle exceptions — with an owner, a rationale, compensating controls and a review date. Exceptions are visible and time-bounded, not open-ended gaps.
Gap assessment :: :: Before the rollout begins, a structured gap assessment against the baseline shows exactly where each site starts and what it takes to close the gap — so effort is directed where it is needed most.
Maintenance model :: :: A cadence and a mechanism for keeping the baseline current: who reviews it, when, and what triggers an update. A baseline that cannot be maintained is a baseline that will age.
```

## How we deliver it

```timeline
1. Zone & asset inventory :: Start from the zone and conduit model — either from a prior assessment or built during this engagement. Every control in the baseline needs to know which zone and which asset class it applies to. This is the foundation.
2. Risk appetite & security level targets :: Agree the target security levels (SL-1 or SL-2) for each zone, informed by the operational consequence of a compromise in that zone. Safety-critical process control zones warrant a higher target than corporate-facing historian connections.
3. Control selection :: Select the controls that address the gap between your current state and your target security levels. Every control is evaluated for operational feasibility — if it cannot be met in a running plant without an extraordinary maintenance event, it does not go into the baseline.
4. Evidence design :: For each control, define what "met" looks like: the configuration check, the log review, the interview question. Simple enough for your own team to run. Documented in templates that produce consistent, comparable results across sites.
5. Exception process :: Define the exception workflow: how to register a known gap, who approves it, what compensating controls apply, and when it is reviewed. The exception process is what makes the baseline honest — it documents the reality of where you are, rather than asserting compliance you have not verified.
6. Pilot :: Apply the baseline at one site, run the evidence collection, and identify where the controls or the evidence templates need refinement. A baseline that has never been applied is untested by definition.
7. Rollout :: Extend to remaining sites, gap-by-gap, with the exception process capturing what cannot be closed immediately. Rollout is supported by OXOT; ownership transfers to your team as the process matures.
8. Assure :: After the initial rollout, establish the ongoing assurance cadence — periodic evidence refresh, exception review and baseline update when the estate or the threat landscape changes.
```

## Framework alignment

| Framework | What this baseline addresses |
|---|---|
| **IEC 62443-3-3** | System security requirements and security levels — the baseline control set is the practical expression of the SRs applicable to each zone's target security level |
| **IEC 62443-2-1** | Security management system requirements — the baseline, exception process and assurance cadence together form the operational CSMS your sites maintain |
| **NIS2 Art. 21(1)** | The requirement for "appropriate and proportionate technical and organisational measures" — the baseline makes "proportionate" concrete and defensible per zone |
| **NIS2 Art. 21(2)(a)** | Policies on risk analysis and information system security — the baseline is the policy expression, and the evidence templates are the verification mechanism |
| **NIS2 Art. 21(2)(f)** | Policies and procedures for assessing effectiveness — the baseline's evidence requirements and assurance cadence are the direct operational answer |
| **Cyber Resilience Act** | For manufacturers, the baseline provides the minimum security properties that OT products in scope must meet — giving product teams a concrete, site-tested reference to design against |

## How it connects

A baseline is the floor that every site in a **[security programme](/ot-security-programmes)** must reach. The programme provides the governance and the wave structure; the baseline defines what "done" means for each wave's remediation work. Without a baseline, "done" is subjective and unverifiable.

The baseline is derived from the zone model that **[Architecture & Segmentation](/architecture-segmentation)** produces: once zones are defined, the controls that apply in each zone can be specified — which is how a baseline becomes realistic rather than generic. If zones have not yet been defined, the baseline work can begin by establishing them.

The **[Cyber Digital Twin](/cyber-digital-twin)** maintains the baseline state: which sites have met which controls, where exceptions are open, and what changes in the estate affect which baseline requirements. Without a living model, the baseline ages and becomes a historical document rather than an operational tool.

**[OT Security Assessments](/ot-security-assessments)** provide the gap picture: the assessment identifies where each site stands against the baseline before rollout begins, so the remediation effort is scoped accurately. The baseline gives the assessment a target to measure against — which is why the two are natural companions.

**[Capability Transfer](/capability-transfer)** is what ensures the baseline outlives the engagement: the evidence collection procedures, exception review cadence and baseline maintenance process all go into the operating model your team inherits. A baseline owned by a consultant is a baseline at risk.

```cta
Set the floor, everywhere
Define an OT security baseline that is realistic to meet, simple to prove, and consistent across every site in your estate.
Talk to an OT security expert :: /contact
```
