---
id: "EP_4.01"
canonical_code: "EP_4.01"
title: "The Tier-2 Dilemma: Staying a Component Vendor Without an OEM-Sized Compliance Bill"
subtitle: "Your OEM's six-figure audit demand is a contract term, not a CRA requirement. A component maker is a manufacturer only for its own component — and most default products self-assess. Where the law stops, the negotiation starts."
slug: "ep-4.01-the-tier-2-dilemma-how-embedded-board-makers-survi"
series_id: 4
episode_number: 1
series: "Tier-2 Upstream Component Supplier Survival"
target_persona: "Embedded Hardware Designers, PCB Assembly Houses, Microcontroller Module Vendors."
persona_category: "Hardware & Embedded OEMs"
statutes: ["Article 3", "Article 13", "Article 14", "Article 32", "Annex I"]
statutory_domain: "Tier-2 Embedded Systems"
difficulty: "Strategy & Compliance"
key_metric: "Self-assessment vs. €100k audit"
read_time: "7 min read"
duration: "14:15"
audio_url: "https://oxot.ai/audio/cra_podcast/EP_4.01.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["Cyber Resilience Act", "Regulation (EU) 2024/2847", "Article 32", "conformity assessment", "self-assessment", "internal control module A", "component supplier", "Tier-2 supplier", "notified body", "CE marking"]
takeaways: ["A component placed on the market makes you a manufacturer — but only for that component (Article 3)", "The default conformity route is self-assessment under internal control (Article 32), not a notified-body audit", "Answer the OEM's six-figure audit demand with a scoped evidence package instead of a certificate"]
---

# The Tier-2 Dilemma: Staying a Component Vendor Without an OEM-Sized Compliance Bill

*By Jim McKenney — Digital Product Security Consultant & Industrial OT Architect*

The email arrives from a Tier-1 automation OEM you have shipped sensor modules to for a decade. Buried in the revised supplier terms is a line that reads like a demolition notice: before the 2027 deadline, you must supply a full third-party CRA conformity certificate for every board you sell them. You call a notified body. The quote comes back somewhere between €20,000 and €100,000 per product family — for a €40 module. The math does not survive contact with your margin, and the implication lands hard: comply at OEM scale, or lose the account.

Before you price a lab audit you may not owe, separate the two things that email has quietly fused together: what the Cyber Resilience Act actually requires of you, and what your customer is asking you to buy on its behalf. They are not the same obligation, and the distance between them is where a component vendor's survival lives.

<!-- IMAGE-SLOT: hero | 1200x630 | alt: "A small embedded circuit board on a workbench dwarfed by a tall stack of compliance paperwork bearing a large industrial OEM's supplier-onboarding forms" | caption: "A €40 module and a €100,000 audit demand. The mismatch is the whole dilemma — and most of it is contractual, not statutory." -->

## You are a manufacturer — of your component, and nothing more

Start with the uncomfortable half, because pretending it away is how vendors walk into real trouble. A subassembly you place on the EU market on its own is not outside the Regulation. The CRA defines a "product with digital elements" to include hardware and software components placed on the market separately, and it defines a manufacturer as anyone who develops a product and markets it under their own name (Article 3). Sell a microcontroller module under your brand and you are its manufacturer for CRA purposes. There is no "we only make parts" exemption waiting for you.

What that status does *not* do is make you responsible for the OEM's finished machine. Your essential-requirement duties under Annex I attach to the thing you actually ship — your board, its firmware, its interfaces — and stop at its edges. The line the OEM builds around it, the backplane, the machine's overall attack surface: that is the OEM's product, assessed by the OEM. Scope is the entire game. You owe a secure component and the evidence that it is one. You do not owe conformity for a system you did not design and cannot see.

## What the law actually asks of a default component

The audit invoice leaves out one fact: for most components, the CRA does not require a third party to certify anything.

The Regulation sorts products into risk tiers. A short list of "important" and "critical" categories — the products whose core function is security itself, or whose compromise cascades into everything downstream — must go through a notified body or an approved certification scheme. Think of a component whose job *is* protection: a hardware security module, a secure element, a firewall or router function. Everything else — the vast default majority — takes a different route. Under Article 32, a manufacturer of a default product demonstrates conformity through the *internal control* procedure: you assess your own product against Annex I, compile the technical documentation, and issue the EU declaration of conformity under your own signature. No lab. No notified body. No six-figure fee. (The full route map lives in the [CRA wiki](/wiki/cra).)

<!-- IMAGE-SLOT: conformity-routes | 1200x800 | alt: "A flat infographic showing two lanes branching from a product: a wide default lane labelled internal self-assessment carrying most components, and a narrow lane labelled notified body carrying only a few important and critical categories" | caption: "Two conformity routes. Most components take the wide self-assessment lane; only the enumerated important and critical categories are pushed into the narrow notified-body lane." -->

This is the load-bearing fact of the whole dilemma. Unless your module falls into one of those enumerated categories — and a plain sensor board or a general-purpose compute module usually does not — the statute's own answer to "who audits you?" is: you do. Self-assessment is not a loophole; it is the ordinary, intended path for the great majority of products with digital elements. The obligation it carries is genuine — you have to actually meet the requirements and be able to prove it — but the cost structure is a fraction of a notified-body engagement, and it sits entirely inside your control.

So when the invoice says €100,000, the first question is not "how do we afford this?" It is "does the law even ask for it?" For a default component, it does not.

## Then where does the six-figure demand come from?

Not from thin air, and not from bad faith. It comes from the OEM's own obligations landing on your desk in the crudest possible form.

When that Tier-1 integrates your board into its machine, the CRA makes *it* exercise due diligence over the components it incorporates and hold their security up to its own product's requirements (Article 13). If a vulnerability surfaces in your module inside their machine, they are the ones who must handle it — and the Regulation expects them to report it back to you, the component maker, so it gets fixed at the source. The OEM carries the finished-product duties, including the incident-reporting clock. A weak component is *its* exposure, not only yours.

A demand for a third-party certificate is simply the least imaginative way for a procurement team to buy down that exposure. A notified-body stamp lets them file your component under "someone else checked it" and move on. It is a *contractual* risk transfer dressed as a *statutory* requirement — and the two get conflated precisely because the person who sent the email does not distinguish them either. Market pressure is real, and it can cost you the account. But it is negotiable in a way that black-letter law is not, and you cannot negotiate what you have mistaken for a legal mandate.

## Give them evidence, not a certificate

Once the demand is named correctly — the OEM needs *assurance*, not specifically a notified-body audit — the path opens. What discharges the OEM's due diligence is credible evidence that your component is secure and maintained. A certificate is one way to supply that. A well-built artifact package is another, and for a default product it is the proportionate one.

That package is small, and most of it is material Annex I already obliges you to produce: your EU declaration of conformity and the technical documentation behind it; a component-scoped software bill of materials (generating one from embedded firmware is its own discipline, and the subject of EP_4.02 — not this post); a coordinated vulnerability-disclosure contact with a written commitment to report and patch flaws in your module across a stated support period; and a short statement of the security properties and the configuration your board assumes. None of it requires a lab. All of it is what a competent OEM actually needs to close its own file.

The contract is where you hold the line. Warrant conformity for your component to its Annex I requirements — that is a promise you can keep, and should make. Supply the evidence package on a defined cadence. And decline, in writing, to fund third-party certification the Regulation does not require for a default product, offering the evidence route in its place. A procurement team that understands its own obligation will take the evidence, because it satisfies the duty. One that insists on the certificate regardless is making a commercial demand — so price it as one, a line item they pay for, not a cost you silently absorb.

## The principle worth keeping

The Cyber Resilience Act does not ask a component maker to carry an OEM's compliance. It asks you to make a secure component, to prove it by a route scaled to that component's risk, and to keep proving it across the product's life. For most of what Tier-2 vendors sell, that route is self-assessment, and its bill is paid in engineering discipline rather than notified-body fees.

The suppliers who survive the next few years will not be the ones who paid whatever the biggest customer's contract demanded. They will be the ones who knew exactly where their statutory duty ended and their customer's negotiation began — and who could show, on a single page, that the line was drawn in the right place. Conformity is scoped to what you make. Anyone billing you for more than that is quoting the market, not the law, and the difference is worth defending.
