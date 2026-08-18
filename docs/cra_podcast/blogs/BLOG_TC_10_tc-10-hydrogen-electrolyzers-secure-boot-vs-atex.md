---
id: "TC_10"
canonical_code: "TC_10"
title: "Secure Boot in an Explosive Atmosphere: When CRA Cybersecurity Collides With ATEX"
subtitle: "A public exploit lands against the controller running your electrolyzer stack, and the CRA says the fix cannot wait. The controller sits in a Zone 1 enclosure under an ATEX certificate that treats its firmware as an unalterable part of the approved state. Both duties bind at once, and the reconciliation is an engineering problem, not a legal one."
slug: "tc-10-hydrogen-electrolyzers-secure-boot-vs-atex"
series_id: 10
episode_number: 10
series: "CRA: Truth & Consequences (Investigative)"
target_persona: "Hydrogen & Process Engineers, Hazardous-Area (Ex) Specialists, OT Security Leads."
persona_category: "Investigative"
statutes: ["Annex I Part II", "Annex I Part I"]
statutory_domain: "Secure Update & Integrity"
difficulty: "Dual-Regime Engineering"
key_metric: "Isolate the safety function from the secure-boot domain"
read_time: "8 min read"
duration: "13:40"
audio_url: "https://oxot.ai/audio/cra_podcast/TC_10.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["Cyber Resilience Act", "Regulation (EU) 2024/2847", "secure boot", "ATEX 2014/34/EU", "hydrogen electrolyzer cybersecurity", "Zone 1 hazardous area", "Annex I Part I integrity", "Annex I Part II security updates", "functional safety IEC 61508", "dual-bank flash", "safety instrumented function"]
takeaways: ["Secure boot is one implementation of the CRA's Annex I Part I integrity and anti-tamper duties; the CRA never names it, but a signed boot chain is a clean way to prove only authorised firmware runs on a process controller", "Secure boot fails closed by design, and on an electrolyzer in a Zone 1 atmosphere a controller that refuses to run mid-process is itself a safety event, not just an availability one; the safety-instrumented function must be hardware-isolated from the secure-boot compute domain so a failed verification never removes the backstop", "ATEX and the CRA both bind and neither overrides the other; the reconciliation is Annex I Part II's separate-security-from-functional-updates clause plus dual-bank verify-then-switch flash deployed inside an Ex-compliant, permitted maintenance window"]
---

# Secure Boot in an Explosive Atmosphere: When CRA Cybersecurity Collides With ATEX

*By Jim McKenney — Digital Product Security Consultant & Industrial OT Architect*

A CVE lands with a CVSS of 9.8 against the controller that runs your alkaline electrolyzer stack. The flaw is in the network stack the controller exposes to your SCADA segment, the exploit is public, and the manufacturer already has a signed firmware image that closes it. Under the [Cyber Resilience Act](/wiki/cra), a fix like that cannot sit in a queue for a convenient quarter. The controller is also bolted inside a Zone 1 enclosure on a live hydrogen plant, running against an ATEX type-examination certificate that treats its firmware as part of the approved, unalterable configuration.

Reflash it tonight and the damage can land from either side. You may void the certificate that makes the installation lawful, and you may drive an uncontrolled reset on a machine that splits water into hydrogen and oxygen a metre from an atmosphere that is, by definition, expected to be explosive in normal operation. Leave it and you carry a publicly exploited hole on a safety-critical asset for as long as it takes to book a shutdown. The regulation telling you to patch and the directive telling you not to touch the box are both real, both in force, and neither one yields to the other.

<!-- IMAGE-SLOT: tc-10-hero | 1200x630 | alt: "An alkaline electrolyzer stack on a hydrogen plant with a controller enclosure marked Ex and a Zone 1 hazardous-area boundary line, an engineer holding a signed firmware advisory." | caption: "The fix exists and the exploit is public. The controller is inside the Ex boundary, and that is where the two duties meet." -->

## What secure boot actually enforces, and why the CRA points straight at it

Secure boot is the mechanism most engineers reach for the moment a regulator asks them to guarantee that only authorised firmware ever executes. It is a chain of trust: a root key fused into the silicon verifies the bootloader's signature before running it, the bootloader verifies the next stage, and so on up to the application that governs the stack. Break the signature anywhere and the chain refuses to hand over control. Tampered, downgraded, or unsigned code never runs.

The CRA never writes the words "secure boot." It does not have to. Annex I Part I asks for exactly what a signed boot chain delivers: products must protect the integrity of stored programs and configuration against modification not authorised by the user, and protect against unauthorised access through appropriate control mechanisms. On a controller whose job is to hold cell voltages inside a safe band and watch for hydrogen-in-oxygen crossover, cryptographically proving that the running firmware is the manufacturer's authentic build is one of the cleaner ways to satisfy that requirement. Secure boot is not the only route to Part I integrity, but on a process controller it is a defensible one, and it is the route a competent manufacturer will have taken.

Up to here, secure boot only helps. The trouble starts with the one property that makes it useful in the first place.

## A fail-closed check is a process event in Zone 1

Secure boot's entire value is that it fails closed. Present it firmware it cannot verify and it stops, because the alternative is running code an attacker may have planted. In a data centre that behaviour is a server that will not boot: an availability problem you route around. On an electrolyzer sitting in a Zone 1 atmosphere, a controller that halts mid-process is a different category of event.

That controller is not just serving a dashboard. It is sequencing the purge that clears residual gas, holding the differential pressure between the hydrogen and oxygen sides, and watching the crossover sensors that warn when the two are drifting toward a flammable mix. A verification failure after a corrupted image or a botched key rotation does not merely take the HMI offline. It can drop the live monitoring and control that keeps the gas mix outside its explosive range, at the exact moment the plant most needs it. The security mechanism designed to protect the firmware becomes, if it trips at the wrong time, the initiating event for the hazard the whole site is built to prevent.

This is why the certificate exists and why it is written the way it is. The ATEX type-examination names a specific firmware state as part of the approved configuration. Provisioning or rotating secure-boot keys, replacing the bootloader, or flashing a new signed application each alters that approved state. You cannot treat the enclosure as a phone that pulls an over-the-air update overnight. The mechanics of doing this safely — staged validation on an identical bench unit, the emergency risk assessment, the change control that keeps the certificate intact — are the subject of a companion piece on [patching certified equipment in hazardous areas](/blog/ep-3.06-firmware-patching-in-hazardous-atex-environments-t); this post is about the collision that is specific to the boot chain itself.

> [!NOTE]
> **Sidebar: ATEX and the Machinery Regulation are separate law, not the CRA.**
> The constraint on altering certified explosion-protection equipment comes from the **ATEX Directive 2014/34/EU** and the **IEC/EN 60079** series, and functional-safety duties on a controller with a safety rating sit under **IEC 61508/61511** and, for the machine as a whole, the **Machinery Regulation (EU) 2023/1230**. None of these are the Cyber Resilience Act, none are in its statutory corpus, and they are summarised here from general engineering practice. Treat the specifics as items to confirm with your Notified Body, not as CRA-verified facts. The point that matters for this article is jurisdictional: no CRA duty overrides an ATEX certificate, and no ATEX certificate excuses ignoring a CRA security-update duty. Both bind, in parallel, and the reconciliation lives in engineering.

## The reconciliation is a clause and an architecture, not a waiver

Neither regime blinks, so stop looking for the one that wins. You will not find a CRA provision that suspends an ATEX certificate in an emergency, and you will not find an ATEX clause that forgives an unpatched, actively exploited flaw. What you will find, sitting in the middle of the vulnerability-handling duties, is the sentence that makes the conflict tractable.

Annex I Part II requires manufacturers to "address and remediate vulnerabilities without delay, including by providing security updates," and then adds the operative phrase for anyone running certified hardware: "where technically feasible, new security updates shall be provided separately from functionality updates." Read that as an engineering instruction, because it is one. A security-only patch that touches the network stack and nothing the certificate relies on is a small, boundable change you can characterise against the approved state. A release that folds the same fix into new features, a revised control loop, or a changed purge sequence turns a security decision into a re-qualification project and drags the certified safety basis into scope. Demand the isolated build. It is what lets you move on the fix at the speed the CRA expects without re-opening the ATEX approval you do not need to touch.

The clause buys you a clean change. Architecture is what makes the change survivable if it goes wrong, and there are two decisions that carry it:

- **Keep the safety function out of the secure-boot domain.** The trip that de-energises the stack, opens the vent path, and drives the plant to a safe state should be a hardware-implemented safety-instrumented function on its own logic, not a task running on the same processor that executes the secure-boot chain. Wire it so a failed verification, a halt, or a reboot of the application controller cannot take the trip with it. When the compute domain fails closed, the backstop stays closed for the right reason. This is the single design choice that turns a boot-verification failure from a process hazard back into a mere availability problem.
- **Deploy through dual-bank flash, verify then switch.** Write the new signed image to the inactive bank while the running bank keeps the process live, verify the signature and the device's behaviour against specification off the critical path, and cut over only at a planned, gas-free, permitted maintenance window. A bad image never bricks the controller that is holding the pressure differential, because that controller never stops running the known-good bank until the new one has proven itself.

<!-- IMAGE-SLOT: tc-10-isolation | 1200x700 | alt: "Block diagram showing an application controller running a secure-boot chain and dual-bank flash on one side, and a physically separate hardware safety-instrumented-function trip loop on the other, with the trip loop independent of the compute domain." | caption: "The safety trip is its own hardware. A failed secure-boot verification halts the compute domain without removing the backstop that drives the plant to a safe state." -->

Put together, the clause and the architecture answer the opening dilemma without a waiver. The isolated security patch moves fast because it does not disturb the certified safety basis. The safety-instrumented function stays sound because it never depended on the controller that just refused to boot. And the flash strategy means the deployment itself, when it finally runs inside the maintenance window, cannot strand the process on a half-written image.

## The revalidation question you already know from another industry

Process engineers in regulated pharma solved a version of this before the CRA existed. Under GxP, a change to a validated system is not blocked outright; it is scoped, assessed for whether it touches the validated state, and revalidated only to the extent it does. The [pharmaceutical process-manufacturing post](/blog/ep-5.07-pharmaceutical-process-manufacturing-gxp-21-cfr-pa) walks through that scoping discipline in full. The transferable move is the same one Annex I Part II is nudging you toward: decide, in writing and before you touch the asset, whether the security update reaches any function the certificate depends on. If it does not, you have a narrow change and a light revalidation path. If it does, you have a re-qualification, and pretending otherwise is how a certificate quietly stops meaning anything.

Before you flash a signed image into a certified enclosure, walk the asset through this:

1. **Confirm the update is security-only.** Get the manufacturer to state, in writing, that the image fixes the vulnerability and changes no function the ATEX certificate relies on. If it bundles features, send it back and ask for the isolated build the separate-updates clause is meant to give you.
2. **Classify what it touches.** Network stack only, or the safety-relevant control path, the secure-boot keys, or the bootloader? The answer decides whether this is a change record or a re-qualification, and it belongs in the technical file either way.
3. **Verify the safety function is independent.** Confirm the trip loop is hardware-isolated and will drive the plant safe even if the application controller halts on a verification failure. If it will not, you have a design gap to close before any patch, exploited flaw or not.
4. **Stage on the inactive bank.** Write, verify, and prove the new image off the critical path. The live bank keeps running until the new one is trusted.
5. **Cut over in a permitted window.** Reflash gas-free, under your hazardous-area change process, with the Notified Body sign-off the certificate requires, and record the new firmware state against the asset.

The uncomfortable part is that no one hands you a rule that makes this decision for you. The CRA will not tell you to break the certificate and the certificate will not tell you to leave the hole open. What both are really asking is whether you built the electrolyzer so that a firmware verification and a safe state are decided by different pieces of hardware. If you did, the emergency is a scheduling problem. If you did not, it is the incident report you have not written yet.
