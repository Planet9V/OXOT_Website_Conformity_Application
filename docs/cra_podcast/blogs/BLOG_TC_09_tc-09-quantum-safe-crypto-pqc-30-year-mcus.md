---
id: "TC_09"
canonical_code: "TC_09"
title: "Is Post-Quantum Crypto Now Mandatory? What the CRA Actually Says About 30-Year MCUs"
subtitle: "A headline circulating in embedded circles says the Cyber Resilience Act now forces post-quantum cryptography into every microcontroller. The regulation names no algorithm anywhere. What it actually requires is a lifetime-aware risk assessment, and for a 30-year part that means crypto-agility, not a PQC mandate."
slug: "tc-09-quantum-safe-crypto-pqc-30-year-mcus"
series_id: 10
episode_number: 9
series: "CRA: Truth & Consequences (Investigative)"
target_persona: "Embedded and cryptography engineers, product security architects, and long-life-product OEMs."
persona_category: "Investigative"
statutes: ["Annex I Part I", "Article 13(3)", "Article 13(8)"]
statutory_domain: "Essential Requirements & Risk Assessment"
difficulty: "Embedded & Cryptography"
key_metric: "Product design life vs. cryptographic shelf life"
read_time: "8 min read"
duration: "13:40"
audio_url: "https://oxot.ai/audio/cra_podcast/TC_09.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["Cyber Resilience Act", "Regulation (EU) 2024/2847", "post-quantum cryptography CRA", "is PQC mandatory CRA", "state of the art encryption Annex I", "harvest now decrypt later", "crypto-agility embedded", "30-year MCU cryptography", "Article 13(3) risk assessment", "FIPS 203 ML-KEM", "BSI TR-02102", "long-life product cybersecurity"]
takeaways: ["The CRA names no algorithm and no post-quantum scheme; Annex I Part I requires encryption 'by state of the art mechanisms', a risk-assessed outcome rather than a PQC mandate", "Quantum enters through the risk assessment, not a clause: Article 13(3) makes it lifetime-aware and Article 13(8) ties it to the support period, so a 30-year product must model harvest-now-decrypt-later", "The real obligation the risk assessment forces is crypto-agility, a firmware update path and algorithm headroom so the cipher can change, not a specific post-quantum algorithm chosen today"]
---

# Is Post-Quantum Crypto Now Mandatory? What the CRA Actually Says About 30-Year MCUs

*By Jim McKenney — Digital Product Security Consultant & Industrial OT Architect*

A claim has been making the rounds in embedded and semiconductor circles: the Cyber Resilience Act makes post-quantum cryptography mandatory, so every microcontroller you ship from now on needs ML-KEM and ML-DSA baked into ROM or it fails CE marking. The claim travels well because it sounds urgent and technical, and because the people repeating it are often selling a crypto library. It is also wrong. The CRA names no algorithm, no key length, and no post-quantum scheme anywhere in its text. Not in the articles, not in the annexes.

That does not let a 30-year product off the hook. It means the real obligation is subtler, harder to design around, and more interesting than a one-line mandate. What follows is what the regulation actually says, why it deliberately refuses to name a cipher, and where quantum genuinely lands for a microcontroller you expect to be running in 2055.

## Read the clause the myth is built on

<!-- IMAGE-SLOT: tc-09-hero | 1200x630 | alt: "A stripped-down microcontroller die shot overlaid with a long timeline from 2028 to 2055, and a single statutory line reading 'state of the art mechanisms' underlined where a specific algorithm name is conspicuously absent" | caption: "The clause everyone points to. The CRA says protect confidentiality 'by state of the art mechanisms' and stops there. No algorithm, no key size, no post-quantum name." -->

The requirement people point to lives in [Annex I, Part I](/wiki/cra), the essential cybersecurity requirements. It tells a manufacturer to protect the confidentiality of stored and transmitted data "such as by encrypting relevant data at rest or in transit by state of the art mechanisms". That phrase, "state of the art mechanisms", is the entire hook. It is also the entire problem, because it is not a specification. It is a pointer to whatever the field currently considers adequate, assessed against the risk.

Read the sentences around it and the pattern is consistent. The product must ship without known exploitable vulnerabilities, with a secure-by-default configuration, protecting the integrity of data and commands, minimising its attack surface. Every one of those is written as an outcome. None of them names a technology. Annex I opens by requiring products to "ensure an appropriate level of cybersecurity based on the risks", pinning the requirements to a risk assessment rather than to a lookup table of approved primitives.

So when someone tells you the CRA mandates PQC, ask them to point at the clause. There isn't one. What there is instead is a standard of care that says: use what a competent engineer, looking at your product's risk, would consider current. Today, for most products, that is still well-implemented RSA and elliptic-curve cryptography. The law does not freeze that answer, and it does not pre-empt it either.

## Why the regulation refuses to name a cipher

This is not an oversight. A regulation that hard-coded "RSA-2048" or "AES-256" into binding text would be obsolete the moment cryptanalysis moved, and amending an EU regulation takes years. The drafters chose the one phrasing that ages gracefully: point at the state of the art and let the state of the art move underneath the words.

The specificity has to come from somewhere, and the CRA routes it to two mechanisms outside the essential-requirement text. The first is harmonised standards. Once cited in the Official Journal, a standard translates "state of the art mechanisms" into named algorithms and key sizes you can test against, and it buys a presumption of conformity for the requirement it covers. That shelf is close to empty today, which is a problem of its own that I worked through in [the presumption piece](/blog/ep-7.05-presumption-of-conformity-harmonised-standards). The second is your own cybersecurity risk assessment, which the CRA makes a hard obligation, not a formality.

Until a harmonised standard names the primitives, the risk assessment is where "state of the art" gets decided for your specific product. That is where quantum stops being a slogan and becomes a real engineering input.

## Where quantum actually lands: the risk assessment, across 30 years

The CRA requires the risk assessment to be documented and, critically, updated "during a support period", and to analyse risk while "taking into account the length of time the product is expected to be in use" (Article 13(3)). For a consumer gadget with a five-year life, a quantum computer capable of breaking RSA sits comfortably outside the window, and a defensible risk assessment can say exactly that today. For a grid protection relay, a rail interlocking controller, or a process MCU with a design life measured in decades, the same analysis produces a different answer.

The threat is not "a quantum computer exists in 2026". It is harvest-now-decrypt-later. An adversary who can record your encrypted traffic today and store it breaks that traffic whenever a cryptographically relevant quantum computer arrives. If your device will still be transmitting sensitive data in 2050, and the confidentiality of that data has to hold for its full life, then the risk assessment has to reckon with an attacker who is patient. Article 13(8) makes this concrete: the manufacturer sets the support period against how long the product is expected to be in use, and the risk assessment has to hold across it. You cannot credibly write "quantum is a 2040s problem, out of scope" on a device you are promising to keep secure into the 2050s.

<!-- IMAGE-SLOT: tc-09-lifetime-window | 1200x700 | png | alt: "A horizontal timeline bar for one MCU from 2028 placed-on-market to 2055 end of design life, with a shaded 'harvest now' zone starting today, a marked 'estimated cryptographically-relevant quantum computer' band in the 2030s-2040s, and the whole confidentiality-required span highlighted as the risk-assessment horizon" | caption: "For a five-year part the quantum band falls off the end of the bar. For a 30-year part it lands squarely inside the window the confidentiality has to survive, which is what the risk assessment has to model." -->

So the CRA does not tell you to install PQC. It forces you to answer a question, in writing, that for a long-life product has only one credible answer: what happens to this device's cryptography when the primitive it relies on falls, and can you do anything about it after it has shipped?

## The obligation the risk assessment forces is crypto-agility

That last clause is the real requirement hiding behind the PQC headline. What a 30-year product needs is not a specific post-quantum algorithm chosen in 2026 — the standards are young, and welding one into mask ROM today carries its own risk. It is the ability to change algorithm after deployment. Crypto-agility: primitives and key sizes that are not fused to silicon, a signed-firmware update path that can carry a new algorithm, and enough headroom in flash, RAM, and compute to run a larger post-quantum key exchange when you switch.

A microcontroller that hard-codes ECC into a boot ROM with no update path and no room to grow is the actual defect. Not because a clause forbids it, but because it makes the risk assessment unanswerable: there is no defensible way to claim you can maintain state-of-the-art confidentiality for thirty years on a part you can never change. A device with a firmware update path and algorithm headroom can make that claim, because when the state of the art moves, so can the product. That is the same architecture-over-patches logic that governs any long-life asset whose threats outlive its original design, which I traced for brownfield OT in [the support-gap piece](/blog/ep-3.03-bridging-the-5-year-oem-gap-keeping-20-year-indust). You can lay a device's cryptographic dependencies against its declared support horizon in the [conformity workspace](/demo).

> [!NOTE]
> **The standards that matter here are not CRA law.** NIST's post-quantum standards (FIPS 203 ML-KEM, FIPS 204 ML-DSA, FIPS 205 SLH-DSA), Germany's BSI TR-02102 cryptographic guidance, and the ETSI quantum-safe work are the reference material a serious risk assessment should consult to decide what "state of the art" means for a long-life product. None of them is cited in the CRA, and none is binding through it. Treat them as the engineering evidence behind your risk-assessment conclusions, not as a statutory checklist the regulation imposes.

## The real answer to a bad headline

Is post-quantum crypto mandatory under the CRA? No, and anyone who quotes you a clause number for it is reading something that isn't there. But that is the wrong question, and the headline knows it. The CRA declines to mandate an algorithm because it mandates something more durable: a documented, lifetime-aware judgment about whether your product will still be secure for as long as you promise to support it. For a device that dies in five years, PQC is genuinely out of scope, and you can write that down and defend it. For a microcontroller you expect to outlive the cryptography it ships with, the risk assessment forces the conclusion a good engineer would reach with no regulation at all: build it so the crypto can change, because eventually it will have to.

The mandate was never PQC. It is being able to answer the question truthfully in thirty years. Design the part that can.
