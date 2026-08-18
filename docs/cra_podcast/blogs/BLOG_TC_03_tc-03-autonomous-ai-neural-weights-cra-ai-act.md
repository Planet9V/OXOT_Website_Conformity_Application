---
id: "TC_03"
canonical_code: "TC_03"
title: "Neural Weights on the Plant Floor: How the CRA and the AI Act Actually Divide an Autonomous Controller"
subtitle: "A controller that runs a learned model sits inside two EU regulations at once. The Cyber Resilience Act asks whether the thing is secure and treats the weight file as an asset to protect. The AI Act asks whether the model is right and no security control ever answers that. Article 12 bridges exactly one of those questions. This is where the line actually falls."
slug: "tc-03-autonomous-ai-neural-weights-cra-ai-act"
series_id: 10
episode_number: 3
series: "CRA: Truth & Consequences (Investigative)"
target_persona: "ML/controls engineers, AI governance leads, product architects."
persona_category: "Investigative"
statutes: ["Article 12", "AI Act Article 15", "Annex I"]
statutory_domain: "CRA / AI Act Boundary & Article 12 Bridge"
difficulty: "Advanced"
key_metric: "1 of 3 Art 15 duties bridged"
read_time: "8 min read"
duration: "13:20"
audio_url: "https://oxot.ai/audio/cra_podcast/TC_03.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["Cyber Resilience Act", "Regulation (EU) 2024/2847", "EU AI Act", "Regulation (EU) 2024/1689", "CRA Article 12", "high-risk AI system", "AI Act Article 6", "AI Act Article 15", "neural network controller", "model weights compliance", "autonomous industrial control", "on-device learning", "model drift conformity", "product with digital elements", "SBOM machine learning"]
takeaways: ["The CRA governs the controller as a product: the inference runtime, the weight file on disk, and the update channel that ships new weights are all security assets it requires you to protect. It is silent on whether the model is any good.", "The AI Act governs whether the model is correct: accuracy, robustness, data governance, and human oversight. No amount of CRA cybersecurity conformance discharges a single one of those duties.", "CRA Article 12 deems a conformant product to meet the cybersecurity requirement of AI Act Article 15, and its own text carves this out as being without prejudice to accuracy and robustness. The bridge carries one of Article 15's three requirements and leaves the other two untouched.", "A model that retrains itself in production has no frozen artifact for either regime to attach conformity to. Serious deployments freeze and sign the production weights and retrain candidates in a gated environment, then re-validate before promotion."]
---

# Neural Weights on the Plant Floor: How the CRA and the AI Act Actually Divide an Autonomous Controller

*By Jim McKenney — Digital Product Security Consultant & Industrial OT Architect*

An executive on a plant-modernization call put it to me cleanly last quarter. The network running the new controller, he said, is a matrix of floating-point weights, not source code, so it falls outside the Cyber Resilience Act; the AI Act can have it. The reasoning is tidy and it is wrong, but not in the way most compliance decks say it is wrong. The weights are not the CRA's code as opposed to the AI Act's territory. They are inside both regulations at the same moment, and the two laws reach into the same controller for entirely different reasons. One wants the thing secure. The other wants the model right. Teams that confuse which law is asking which question spend a quarter engineering for the wrong obligation.

Picture the actual box. A controller on a line somewhere is running a learned model: a vision head that decides where a gripper closes, an anomaly detector wired to a trip, a model-predictive loop that has replaced a hand-tuned one. The decision logic is no longer something you can read as a ladder diagram. It is a weight file, a runtime that executes it, and an update channel that can replace it. Ordinary hardware, extraordinary decision surface. That is the object both regulators are looking at.

<!-- IMAGE-SLOT: tc-03-hero | 1200x630 | alt: "An industrial edge controller on a plant floor executing a neural inference model, with the weight file, runtime, and update channel called out as the components two EU regulations reach into" | caption: "One controller, one learned model, two regulators asking different questions. The CRA asks whether it is secure; the AI Act asks whether it is right." -->

## What the CRA actually has hold of

The CRA does not care whether the decision logic is a PID loop, a state machine, or forty million weights. It regulates a product with digital elements, and the controller is one. Its essential requirements in Annex I attach to the whole product, the model runtime included.

Read the two halves of Annex I against this box and the grip is obvious. Part I sets the product's properties: an appropriate level of cybersecurity for the risk, shipped without known exploitable vulnerabilities, secure by default, protected from unauthorised access, with the integrity and confidentiality of the data it stores and processes preserved. Part II sets the manufacturer's processes: vulnerability handling across a declared support period, a software bill of materials, coordinated disclosure, security updates.

Now map the weight file onto that. On disk it is an asset whose integrity and authenticity the product must guarantee. If an attacker can swap it for a poisoned one, or push a forged model down the update channel, that is unauthorised access and an integrity failure, which is to say an Annex I failure. Where the model came from, whether it is signed, whether it appears in your bill of materials as a component with a version and a hash, all of that is CRA territory. The runtime that loads it, the channel that updates it, the store that holds it: product surface, every piece. The statutory detail sits in [the CRA reference](/wiki/cra) if you want the clause text. The point for a controls engineer is blunt. The CRA governs your weights as a thing that can be tampered with. It has no opinion whatsoever on whether they are good weights.

## The AI Act asks a question the CRA cannot see

If that model acts as a safety component of a machine that already needs third-party conformity assessment, it is likely a high-risk AI system under Article 6 of the AI Act. Whether it crosses that line depends on the safety role it plays, so treat the classification as conditional and decide it deliberately. Once it is high-risk, a different body of duty switches on, and none of it is about tampering.

AI Act Article 15 requires accuracy, robustness, and cybersecurity appropriate to the risk. Around it sit duties on the training data's governance and representativeness, on record-keeping that lets you reconstruct behaviour, on human oversight of the model's decisions. Every one of those asks the same underlying thing: is the model correct? Does it generalise past the distribution it was trained on? Is the data behind it documented and fit for the job? Can a person intervene when it is wrong? A controller can be flawlessly secured, signed end to end, free of known vulnerabilities, and fully CRA-conformant while running a model that was trained on the wrong plant's data and drifts on the first cold morning. The CRA is silent through all of it. The AI Act is the only regime in the room that can fail that model.

<!-- IMAGE-SLOT: tc-03-concern-split | 1200x720 | alt: "Diagram splitting one neural controller into two regulatory questions: the CRA asking 'is it secure?' over the weight file, runtime, and update channel, and the AI Act asking 'is it right?' over accuracy, robustness, data governance, and oversight, with CRA Article 12 bridging only the cybersecurity sliver" | caption: "The split by concern. Article 12 connects only the cybersecurity sliver of the AI Act's Article 15; accuracy and robustness stay on the AI Act's side of the line." -->

## Article 12, and exactly how far it reaches

The two regimes touch in one written place. CRA Article 12 says that a product with digital elements which is also a high-risk AI system shall be deemed to comply with the cybersecurity requirements of Article 15 of the AI Act where it meets the essential requirements in Annex I Parts I and II and demonstrates that protection in the EU declaration of conformity issued under the CRA. Do the security engineering once, evidence it on one declaration, and you have answered the cybersecurity requirement under both laws. The full three-regime version of this, with NIS2 added for the operator that runs the cell, is mapped in [the tri-directive evidence post](/blog/ep-8.04-cra-nis2-ai-act-unified-evidence-tri-directive); this post stays on the two regimes that grip the controller itself.

The reach is fixed by the article's own first line. The deeming applies "without prejudice to the requirements relating to accuracy and robustness set out in Article 15." Article 15 names three requirements. The bridge carries the cybersecurity one across and leaves accuracy and robustness precisely where it found them, on the AI Act's side, satisfied on the AI Act's own terms. Anyone telling you a CRA declaration closes out the AI Act for your model has read one of three requirements and stopped.

| AI Act Article 15 requirement | Discharged by | Carried by CRA Article 12? |
|---|---|---|
| Cybersecurity | CRA Annex I engineering, on the EU declaration of conformity | Yes, deemed compliant |
| Accuracy | AI Act processes: data governance, validation | No |
| Robustness | AI Act processes: envelope testing, oversight | No |

Read the right-hand column. One yes, two no. That is the whole bridge, and it earns the effort, because the cybersecurity engineering on a controller is real work you now do once. It just does not reach the part of the AI Act that decides whether the model should be trusted with the decision.

## The weight file has a second life the CRA cannot read

At the weight file, the two questions stop dividing cleanly. The same weight file that the CRA treats as a signed blob is, to the AI Act, the crystallised output of a training run. Those are not two descriptions of one duty. They are two duties that happen to point at the same bytes.

Your CRA bill of materials will tell you the model is component `vision-head`, version 3.2, hash `a91f…`. It certifies that the artifact on the device is the artifact you signed. It says nothing about what version 3.2 learned, whether the data that produced it represented the plant it now runs on, or whether its failure modes were characterised before it shipped. That is the AI Act's data-governance and record-keeping ground, and no CRA control closes the gap, because integrity of an artifact and fitness of an artifact are different properties. You can model both views of the file against the real conformity questions in the [conformity workspace](/demo). What you cannot do is let a hash on an SBOM stand in for evidence that the training data was any good.

## The drift question the executive was really asking

Underneath the "it's just math" line was a harder question about on-device learning. If the model updates itself in the field, which regime moves? Both, and again for different reasons.

From the CRA's side, shipping a new weight file is a change to the product. Whether that change rises to a substantial modification that reopens conformity is a fact question about security-relevant change, and the "just math" framing has no power to wave it away. From the AI Act's side, a model whose behaviour has moved past the envelope it was validated against is no longer the model that was assessed for accuracy and robustness; the assessment described a system that no longer exists.

<!-- IMAGE-SLOT: tc-03-frozen-vs-adaptive | 1200x675 | alt: "Comparison of two deployment patterns: a live model that retrains itself in production with no frozen artifact for either regulation to attach to, versus frozen and signed production weights with retraining and re-validation done in a gated sandbox before promotion" | caption: "Conformity attaches to an artifact. A model that retrains in production leaves nothing to attach it to; a frozen, signed artifact retrained in a gated environment does." -->

The uncomfortable engineering consequence is not that adaptation is forbidden. It is that a model which retrains itself in production has, by construction, no frozen artifact for either regulation to point conformity at. Conformity attaches to a thing you can name, sign, and describe. A weight file that mutates on every shift is not that thing. This is why serious deployments freeze and cryptographically sign the production weights, run the learning in a gated environment, and re-validate a retrained candidate before promoting it into the field. Not because a clause commands a freeze, but because a moving artifact has nothing for the paperwork, or the safety case, to hold onto.

The tidy version fails because it collapses two separate questions into one. Is the controller secure is the CRA's question, and inside it the weight file is an asset to defend. Is the model right is the AI Act's question, and no lock, signature, or patch cadence has ever answered it. Article 12 lets you settle the first question once and spend it twice. The second question it never touches, and the second question is the one that decides whether the thing on your plant floor should be making the call at all.
