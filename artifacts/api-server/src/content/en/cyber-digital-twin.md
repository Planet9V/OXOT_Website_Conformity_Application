---
title: The Cyber Digital Twin
meta_title: Cyber Digital Twin for OT Environments | OXOT
meta_description: The OXOT Cyber Digital Twin — a living data model of your OT environment that unifies documentation, network diagrams, asset inventories, configurations and tool output into one structured view of assets, risks and controls, so you can prioritise on real operational risk and prove it against NIS2, the CRA, the AI Act and IEC 62443.
excerpt: A living model of your OT estate — one structured view of assets, risks and controls that turns scattered documentation and tool output into decisions you can defend.
content_type: page
published: true
---

The OXOT Cyber Digital Twin is a living data model of your OT environment. It brings together information from documentation, network diagrams, asset inventories, configurations, security tools and operational input — and instead of looking at each source separately, it creates one structured view of assets, risks and controls.

That single view is the difference between reacting to whatever tool shouted loudest and prioritising security on **real operational risk**. It does not replace your existing OT security tools; it consumes their output, adds the context they lack, and helps leadership make better decisions with evidence behind them.

```keyfacts
What it is :: A living, structured model of your OT estate
Unifies :: docs, network diagrams, asset inventories, configs, tool output
Produces :: one view of assets, risks and controls
Prioritises on :: real operational risk, not raw technical severity
Powers :: assessments, attack-path & gap analysis, investment decisions
Sovereignty :: your data and your model stay yours
```

## From scattered sources to one model

Most OT estates hold the truth about their risk in a dozen disconnected places — a Visio diagram here, a spreadsheet there, a scanner console, a tribal memory. The twin unifies them.

```svg
<svg viewBox="0 0 700 340" xmlns="http://www.w3.org/2000/svg" font-family="system-ui, sans-serif">
  <rect width="700" height="340" fill="none"/>
  <text x="350" y="28" fill="#e5e7eb" font-size="17" font-weight="700" text-anchor="middle">Scattered sources → one living model → decisions</text>

  <!-- sources -->
  <g font-size="11" fill="#94a3b8">
    <rect x="30" y="70" width="150" height="30" rx="6" fill="#3b82f6" fill-opacity="0.10" stroke="#3b82f6" stroke-width="1"/>
    <text x="105" y="90" text-anchor="middle" fill="#e5e7eb">Documentation</text>
    <rect x="30" y="110" width="150" height="30" rx="6" fill="#3b82f6" fill-opacity="0.10" stroke="#3b82f6" stroke-width="1"/>
    <text x="105" y="130" text-anchor="middle" fill="#e5e7eb">Network diagrams</text>
    <rect x="30" y="150" width="150" height="30" rx="6" fill="#3b82f6" fill-opacity="0.10" stroke="#3b82f6" stroke-width="1"/>
    <text x="105" y="170" text-anchor="middle" fill="#e5e7eb">Asset inventories</text>
    <rect x="30" y="190" width="150" height="30" rx="6" fill="#3b82f6" fill-opacity="0.10" stroke="#3b82f6" stroke-width="1"/>
    <text x="105" y="210" text-anchor="middle" fill="#e5e7eb">Configurations</text>
    <rect x="30" y="230" width="150" height="30" rx="6" fill="#3b82f6" fill-opacity="0.10" stroke="#3b82f6" stroke-width="1"/>
    <text x="105" y="250" text-anchor="middle" fill="#e5e7eb">Security-tool output</text>
  </g>

  <!-- arrows to twin -->
  <line x1="180" y1="165" x2="270" y2="170" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#cdt-a)"/>

  <!-- twin -->
  <rect x="272" y="120" width="156" height="100" rx="12" fill="#f97316" fill-opacity="0.14" stroke="#f97316" stroke-width="2.5"/>
  <text x="350" y="160" text-anchor="middle" fill="#e5e7eb" font-size="15" font-weight="700">Cyber Digital</text>
  <text x="350" y="180" text-anchor="middle" fill="#e5e7eb" font-size="15" font-weight="700">Twin</text>
  <text x="350" y="202" text-anchor="middle" fill="#94a3b8" font-size="10.5">assets · risks · controls</text>

  <line x1="428" y1="170" x2="520" y2="170" stroke="#94a3b8" stroke-width="1.5" marker-end="url(#cdt-a)"/>

  <!-- decisions -->
  <g font-size="11" fill="#94a3b8">
    <rect x="522" y="95" width="150" height="30" rx="6" fill="#3b82f6" fill-opacity="0.12" stroke="#3b82f6" stroke-width="1"/>
    <text x="597" y="115" text-anchor="middle" fill="#e5e7eb">Prioritised risk</text>
    <rect x="522" y="135" width="150" height="30" rx="6" fill="#3b82f6" fill-opacity="0.12" stroke="#3b82f6" stroke-width="1"/>
    <text x="597" y="155" text-anchor="middle" fill="#e5e7eb">Attack paths</text>
    <rect x="522" y="175" width="150" height="30" rx="6" fill="#3b82f6" fill-opacity="0.12" stroke="#3b82f6" stroke-width="1"/>
    <text x="597" y="195" text-anchor="middle" fill="#e5e7eb">Control gaps</text>
    <rect x="522" y="215" width="150" height="30" rx="6" fill="#3b82f6" fill-opacity="0.12" stroke="#3b82f6" stroke-width="1"/>
    <text x="597" y="235" text-anchor="middle" fill="#e5e7eb">Investment cases</text>
  </g>

  <text x="350" y="300" text-anchor="middle" fill="#94a3b8" font-size="11" font-style="italic">It does not replace your tools — it uses their output and adds the context they lack.</text>

  <defs>
    <marker id="cdt-a" markerWidth="9" markerHeight="9" refX="7" refY="4.5" orient="auto">
      <path d="M0,0 L9,4.5 L0,9 Z" fill="#94a3b8"/>
    </marker>
  </defs>
</svg>
```

## With the twin vs. without it

```compare
Without a twin
- Risk lives in a dozen disconnected documents and consoles
- You patch what the scanner scored highest, not what matters
- Every assessment starts from a blank page
- "Are we secure?" is answered by opinion
---
With the Cyber Digital Twin
- One structured, queryable model of the estate
- Prioritisation weighted by real operational and safety impact
- Assessments build on a model that is already current
- "Are we secure?" is answered with evidence you can defend
```

## What it powers

One model, many questions answered from the same source of truth.

```cards
Site risk assessments :: :: A defensible risk picture per site, built on a model rather than a blank page.
Asset & architecture understanding :: :: Know what you have, how it connects, and what protects a safety function.
Attack-path analysis :: :: Trace the routes an adversary could take to a safety-critical system — before they do.
Control-gap analysis :: :: See where target and installed security levels diverge, and what closes the gap.
OT security baseline :: :: Develop a realistic, repeatable minimum control set grounded in your reality.
Investment prioritisation :: :: Rank spend by risk reduced, with a case leadership can sign off.
```

## One model, every obligation

Because the twin is a single structured picture of your estate, the overlapping EU obligations can all be assessed, prioritised and evidenced against it — instead of running four or five disconnected compliance projects.

| Obligation | What the twin answers |
| --- | --- |
| [NIS2](/en/nis2) | Do we have the asset picture and risk evidence the ten measures assume? |
| [Cyber Resilience Act](/en/cra) | Which products carry digital risk, and what is their exposure? |
| [AI Act](/en/ai-act) | Where does AI sit relative to safety and control functions? |
| [Machinery Regulation](/en/machine-act) | Which safety-affecting software could corruption make unsafe? |
| [IEC 62443](/en/iec-62443) | What are our zones, conduits and SL-A-vs-SL-T gaps? |

```cta
Would you rather answer "are we secure?" with evidence than opinion?
We build a Cyber Digital Twin of your estate so every risk decision — and every regulatory obligation — draws on one model you own.
See what a twin would show you :: /en/contact
```

## Why this matters more than it looks

The deeper argument for modelling — why a structured, probabilistic view of your estate beats gut feel and averages — is one we make at length in [Fooled by Randomness: what a fund manager's mistake teaches OT security](/en/cdt-fooled-by-randomness). The short version: in a complex OT estate, the few paths that reach a safety-critical system are exactly the ones intuition misses. A model surfaces them before an attacker finds them.

It fits the wider picture on our [Frameworks](/en/frameworks) map, and underpins every one of our [Services](/en/services).
