---
id: "EP_2.06"
canonical_code: "EP_2.06"
title: "Drafting the Integrator Safe-Harbor Agreement: Contract Scaffolding for CRA Risk"
subtitle: "A contract can move the cost of a CRA fine between you and your client. It cannot move who the authority calls the manufacturer. Here is how to draft for the difference."
slug: "ep-2.06-drafting-the-integrator-safe-harbor-agreement-baa-"
series_id: 2
episode_number: 6
series: "The System Integrator & EPC Shield"
target_persona: "EPC General Counsel, Contract Negotiators, Commercial Operations."
persona_category: "EPC & Integrators"
statutes: ["Article 22", "Article 3(30)", "Article 64"]
statutory_domain: "Deemed Manufacturer & Art 22"
difficulty: "Advanced — Legal & Commercial"
key_metric: "Article 22 Exposure"
read_time: "9 min read"
duration: "14:15"
audio_url: "https://oxot.ai/audio/cra_podcast/EP_2.06.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["Cyber Resilience Act", "Regulation (EU) 2024/2847", "Article 22", "substantial modification", "deemed manufacturer", "safe harbor agreement", "integrator indemnity", "EPC contract CRA"]
takeaways: ["A bilateral compliance addendum that pins down the tested baseline", "A client assumption-of-risk clause for directed deviations — with the honest limit that it recovers cost, it does not grant immunity", "A change-order firewall that re-runs the Article 22 question on every variation"]
---

# Drafting the Integrator Safe-Harbor Agreement: Contract Scaffolding for CRA Risk
*By Jim McKenney — Digital Product Security Consultant & Industrial OT Architect*

The clause your engineering firm actually wants does not exist. It reads something like *"Client agrees the Integrator shall not be deemed a manufacturer under the Cyber Resilience Act,"* and it is worth exactly nothing. A market surveillance authority is not a party to your contract. It decides who the manufacturer is by looking at what happened to the product — not at what your services agreement says should have happened.

That is the whole problem with a "safe-harbor agreement," and it is worth saying plainly before you spend legal budget on one. A contract allocates risk *between the two parties who signed it*. It cannot rewrite a statutory duty that runs to third parties and to the state. So the useful question isn't "how do we contract our way out of being the manufacturer" — you can't. It's "when a client's demand pushes us into the manufacturer's chair anyway, how do we make sure the cost lands on the party that made the decision?"

That is a contract you *can* draft. Here is the scaffolding.

<!-- IMAGE-SLOT: ep-2.06-hero | 1200x630 | alt: "A contract signature page and an engineering redline on a negotiation table beside an industrial control cabinet" | caption: "The pen at the negotiation table decides who owns the CRA technical file — not the nameplate on the cabinet." -->

## What actually flips you into the manufacturer's chair

Under the CRA, a firm that is neither the original manufacturer nor an importer nor a distributor, but that **carries out a substantial modification of a product and makes it available on the market, is treated as the manufacturer** for that product (Article 22). This is the integrator's exposure in one sentence. You did not build the PLC, the drive, or the firmware — but if you materially changed one and shipped the result, the law hands you the builder's obligations.

"Substantial modification" is not a vibe; it has a definition (Article 3(30)). A change counts when it affects the product's compliance with the essential cybersecurity requirements in Annex I, *or* when it changes the intended purpose the product was assessed against. Routine security patches that keep a product within its assessed baseline are explicitly not substantial modifications — that carve-out is the one piece of good news in the machinery.

Two consequences follow, and both matter for how you draft:

- **The obligations you inherit are scoped.** Article 22 hands you the manufacturer's duties — the conformity assessment, the technical file, the reporting obligations under Articles 13 and 14 — *for the part affected by the modification*. If the change touches the whole product's security, it is the whole product. This scoping is a drafting lever: the tighter you can document the modification boundary, the smaller the surface you own.
- **The penalty tier jumps.** Operator duties sit in the lower band — up to €10M or 2% of worldwide turnover (Article 64(3)). But the manufacturer's essential-requirement and reporting duties sit in the higher band: up to **€15M or 2.5% of worldwide turnover, whichever is greater** (Article 64(2)). Becoming the deemed manufacturer does not just add work. It moves your maximum exposure up a tier.

## The limit you must state out loud

Here is the part most "safe-harbor" templates quietly skip.

> [!WARNING]
> **A contract binds the parties. It does not bind the regulator.**
> If your work meets the Article 22 test, the market surveillance authority pursues *you* as the manufacturer, regardless of any clause in which your client "accepts" that role. Your indemnity does not stop that enforcement action and does not cap the fine the authority levies. What it gives you is a **right to recover** the cost from your counterparty *afterwards* — a right that is only as good as the client's solvency and the enforceability of the clause in that jurisdiction. Some Member States will not enforce a private contract that shifts a public administrative penalty at all. Indemnity buys recovery, not immunity. Draft it, but never sell it internally as a shield.

Everything below is written to that reality. The goal of the paperwork is threefold: **stay out of Article 22 by default, force a decision when a client wants to push you out of the baseline, and create the evidence trail that makes recovery possible if the decision goes wrong.**

*(Clause language below is illustrative drafting scaffolding, not legal advice. Have your own counsel adapt it to governing law.)*

## Instrument 1 — The bilateral compliance addendum

Before you can allocate the risk of leaving the secure baseline, both parties have to agree what the baseline *is*. Most integration disputes are really disputes about an undefined envelope. Pin it down.

> **Reference Configuration.** The Products are assessed for conformity only in the configuration recorded in Annex [X] (the "Secure Baseline"). The Integrator warrants conformity of the Products *as delivered in the Secure Baseline*. Any Client-directed change that affects the Products' compliance with the essential cybersecurity requirements, or that alters their intended purpose, falls outside the Secure Baseline and outside this warranty.

This does two jobs. It caps what you warranted, and it hands you a bright line — the Annex — against which any later "substantial modification" argument gets measured. Attach the actual configuration: signed-firmware settings, network segmentation, default-credential policy, the tested firmware versions. A baseline you can point to is worth more than any indemnity you can't.

## Instrument 2 — The client assumption-of-risk clause

This is the clause that does the real allocation work — and the one to draft most carefully, because it is where the honest limit bites.

> **Directed Deviation.** Where the Integrator notifies the Client in writing that a requested configuration or change may constitute a substantial modification within the meaning of Article 3(30) of Regulation (EU) 2024/2847, and the Client nonetheless directs that change in writing, the Client (a) instructs the change on its own responsibility and (b) shall indemnify the Integrator against administrative fines, corrective-action costs, recall costs, and third-party claims arising *solely* from the directed deviation, to the fullest extent permitted by applicable law.

The load-bearing words are *notifies in writing* and *directs in writing*. The indemnity is only as strong as the paper trail that triggers it. An integrator who deviates on a phone call and a nod has no clause — they have the manufacturer's liability and nothing to recover it with. "To the fullest extent permitted by applicable law" is not boilerplate here; it is your acknowledgement that in some jurisdictions the fine portion may not be shiftable at all, and the recall and remediation costs may be all you can practically recover.

## Instrument 3 — The change-order firewall

CRA exposure does not arrive at contract signing. It arrives eighteen months later, on a Friday, in a variation order nobody routed past compliance. The firewall makes every change re-run the manufacturer question.

> **Variation Gate.** No variation order is effective until it records: (i) whether the change remains within the Secure Baseline; (ii) if outside, which party assumes the manufacturer's obligations under Article 22 for the affected part, and the re-assessment and technical-file work triggered; and (iii) the Client's written direction under the Directed Deviation clause where applicable. Work under a variation shall not commence until this record is complete.

This is the clause that keeps the other two alive. Without it, your beautiful baseline and your careful indemnity get bypassed by the exact mechanism that generates most integrator liability — the informal on-site change that never touched the contract.

## What the scaffolding actually buys — and what it doesn't

| The clause… | Does | Does **not** |
|---|---|---|
| Bilateral compliance addendum | Fix the tested envelope; cap the warranty | Stop a change from being "substantial" if it factually is |
| Assumption-of-risk / indemnity | Create a right to recover fines and costs from the client | Prevent the authority from pursuing you as manufacturer, or cap the fine it levies |
| Change-order firewall | Force the Article 22 decision, on paper, before work starts | Substitute for actually doing the re-assessment when the answer is "yes" |

Work it through. A client insists you disable signed-firmware verification on an HMI because their legacy maintenance laptop can't handle the check. That change affects an Annex I essential requirement — it is a substantial modification. You make the modified product available; Article 22 makes you the deemed manufacturer for the affected part, and your ceiling moves to the €15M / 2.5% band. The enforcement action still comes to you. But with a written deviation notice, a written client direction, and a completed variation record, you hold a documented right to recover the fine and remediation cost from the party that made the call — provided they're solvent and the governing law enforces it. Without that paper, you own all of it alone.

These are long-lived contracts. The CRA entered into force on 10 December 2024, but its obligations bite at general application on **11 December 2027** — and the EPC framework you sign this quarter will still be running projects on the far side of that date. The clauses you draft now are the ones that will be tested then.

<!-- IMAGE-SLOT: ep-2.06-liability-flow | 1200x675 | alt: "Diagram: statutory liability lands on the deemed-manufacturer node while a contractual indemnity arrow routes recovery back to the client" | caption: "Statutory liability is fixed by facts; the indemnity is a recovery path back to whoever directed the change." -->

If you draft only one of the three, draft the change-order firewall — it is the gate the other two depend on. Then pressure-test your standard EPC template against a single question: *when a client directs us outside the tested baseline, does our paper prove who decided?* If the answer is no, that is this week's redline. Walk the boundary of what "deemed manufacturer" means before you sign the next agreement: [/wiki/cra](/wiki/cra).
