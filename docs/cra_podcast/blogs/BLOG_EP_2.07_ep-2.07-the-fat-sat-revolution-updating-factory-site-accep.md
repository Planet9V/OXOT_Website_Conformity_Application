---
id: "EP_2.07"
canonical_code: "EP_2.07"
title: "The FAT/SAT Revolution: Adding Cybersecurity to Factory & Site Acceptance Testing"
subtitle: "A loop test that passes every functional check can still ship with default passwords and an open debug port. Here is how to turn FAT and SAT into a CRA conformity gate."
slug: "ep-2.07-the-fat-sat-revolution-updating-factory-site-accep"
series_id: 2
episode_number: 7
series: "The System Integrator & EPC Shield"
target_persona: "Quality Assurance Engineers, Commissioning Managers, Plant Inspectors."
persona_category: "QA & Commissioning"
statutes: ["Annex I Part I", "Annex I Part II", "Article 13", "Article 14", "Annex VII"]
statutory_domain: "Essential Requirements & Acceptance Testing"
difficulty: "Practitioner"
key_metric: "Annex I test-evidence gaps at handover"
read_time: "8 min read"
duration: "14:15"
audio_url: "https://oxot.ai/audio/cra_podcast/EP_2.07.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["Cyber Resilience Act", "Regulation (EU) 2024/2847", "Factory Acceptance Testing", "Site Acceptance Testing", "Annex I essential requirements", "secure by default", "SBOM", "commissioning security"]
takeaways: ["A CRA FAT/SAT security checklist mapped line-by-line to Annex I", "Automated vulnerability-scanning gates that block sign-off", "The digital handover dossier that becomes part of the technical file"]
---

# The FAT/SAT Revolution: Adding Cybersecurity to Factory & Site Acceptance Testing
*By Jim McKenney — Digital Product Security Consultant & Industrial OT Architect*

A control skid can pass every point on a Factory Acceptance Test and still be a liability the day it ships. The loops trip on the right setpoints, the interlocks fail safe, the alarms annunciate, the HMI faceplates match the P&ID. Sign the acceptance certificate, load it on the truck. And every PLC on that skid is still running the vendor's default `admin/admin`, the JTAG and console ports are wide open, telnet answers on port 23, and there is no record anywhere of what firmware or third-party libraries are actually inside it.

None of that shows up in a functional test, because a functional test asks *does it do what the spec says?* It never asks *what else can it do, and who else can make it do that?* For thirty years that gap was somebody else's problem — IT's, the operator's, next year's. Under the Cyber Resilience Act it becomes your acceptance test's problem, and the acceptance test is exactly where it should have lived all along.

<!-- IMAGE-SLOT: ep-2.07-hero | 1200x630 | alt: "A control-panel skid on a factory acceptance test bench, with an inspector's laptop running a security scan beside the functional test rig." | caption: "FAT is the last point where the whole system sits on one bench, powered and reachable. That is the cheapest place to catch a security defect — and the last." -->

## The acceptance test just became a conformity gate

The CRA does not name FAT or SAT. It does something more useful: it makes them the natural place to produce evidence you now have to produce anyway.

Annex I Part II requires the manufacturer to *apply effective and regular tests and reviews of the security of the product*. Annex VII — the contents of the technical file — requires *reports of the tests carried out to verify conformity* of the product and its vulnerability-handling processes with the essential requirements. Someone has to run those tests, and someone has to hold the reports for the length of the support period. On an integrated system, the moment the whole assembly is powered, networked and reachable on one bench is FAT. The moment it is powered in its real environment is SAT. Those are the two points where security verification is cheapest to run and most meaningful — and if you skip them, you are committing to discover the same defects later, in production, at ten times the cost.

For system integrators and EPCs this is the through-line of the whole series. When you assemble products into a system and place that system on the market, the Annex I duties ride with it. The acceptance test is where you either generate the conformity evidence or inherit the gap. General application — including CE marking — lands on **11 December 2027**, and the manufacturer reporting duties in Article 14 switch on earlier, from **11 September 2026**. A skid commissioned in 2028 against a 2026 functional-only FAT procedure is a skid with no security evidence in its file.

One nuance worth getting right: the Annex I Part I security *properties* are risk-based. Article 13 requires a cybersecurity risk assessment, and that assessment decides which of the property requirements apply and how. Your FAT/SAT security scope is not a fixed checklist you copy between projects — it is the output of the risk assessment for *this* system. What follows is the menu; the risk assessment tells you which items are on the plate.

## The security pass, mapped to Annex I

Add a security pass to the acceptance procedure that runs alongside the functional loop checks, not after them. Every check maps to a specific Annex I item, so the result drops straight into the technical file instead of needing translation later.

| Acceptance check | What you verify | Annex I basis |
|---|---|---|
| No default credentials | Every account — PLC, HMI, switch, gateway, drive — is off its factory default; forced change on first use | Part I (2)(b) secure-by-default; (2)(d) protection from unauthorised access |
| Interfaces closed | JTAG, serial console, unused Ethernet/USB, telnet, debug and diagnostic services disabled or removed | Part I (2)(j) limit attack surfaces, including external interfaces |
| Secure-by-default config | Shipped configuration is the hardened one, with a documented path to reset to original state | Part I (2)(b) |
| No known exploitable vulns | Firmware and component versions carry no known, exploitable CVEs at handover | Part I (2)(a) available without known exploitable vulnerabilities |
| Data protection | Credentials and sensitive config encrypted at rest and in transit; integrity of commands and configuration protected, corruption reported | Part I (2)(e), (2)(f) |
| Update path works | A signed, secure mechanism to deliver security updates is present and demonstrably functional | Part I (2)(c); Part II (7) |
| Security logging on | Access to and modification of data, services and functions is recorded and can be monitored | Part I (2)(l) |
| SBOM present and matches | A machine-readable bill of materials exists and the running firmware hashes match what it claims | Part II (1) identify and document components |

Run it as pass/fail, witnessed and signed the same way the functional punch list is. A red item is a punch-list item — not a note for the operator to deal with after energisation. The discipline is the point: an open debug port found at FAT is a five-minute fix, the same port found by an incident responder is a notification under Article 14.

## Automate the parts a human inspector will miss

A person with a clipboard can confirm a password changed. A person with a clipboard cannot enumerate every listening port on a forty-node system, diff firmware hashes against a manifest, or check a hundred library versions against a vulnerability feed. That work has to be automated, and the automation has to be a gate, not a report nobody reads.

Three scans earn their place in the acceptance procedure:

- **Port and service enumeration** against the whole assembled network. The pass condition is an explicit allow-list — these ports, on these nodes, and nothing else. Anything unexpected fails the gate. This is your direct evidence for *limit attack surfaces*.
- **Authenticated configuration and credential audit** — no defaults, no shared accounts where the design calls for individual ones, hardening baseline applied. Directly evidences secure-by-default and access control.
- **SBOM generation and vulnerability match.** Emit the bill of materials in a commonly used, machine-readable format — CycloneDX and SPDX both qualify — and check every component against a current vulnerability source. A known, exploitable, unpatched vulnerability is a failed gate, because *available without known exploitable vulnerabilities* is not a target, it is the wording.

Wire these into the FAT so a fail blocks sign-off the way a failed loop check does today. The output is not just a go/no-go; it is a timestamped artefact for the file. And re-run the port and SBOM scans at SAT, because site integration — the customer's network, the remote-access jump host, the "temporary" laptop nobody removed — reopens attack surface that was closed at the factory.

## The digital handover dossier

FAT and SAT have always produced a handover package: test records, as-built drawings, calibration certificates, O&M manuals. The CRA adds a security half to it, and that half is not paperwork you write once and forget — it is the record you will be asked for during a market-surveillance check or an incident.

<!-- IMAGE-SLOT: ep-2.07-dossier | 1200x675 | alt: "A layered stack representing the security half of a commissioning handover dossier: test reports, SBOM, credential-rotation record, update procedure, disclosure contact." | caption: "The digital handover dossier is the security twin of the O&M binder — and unlike the binder, most of it is machine-readable." -->

Build it to slot straight into the Annex VII technical file:

- **The signed security acceptance report** — every check above, pass/fail, witnessed, dated. This is the Annex VII test-report evidence.
- **The as-shipped SBOM**, machine-readable, hashed to the firmware actually running.
- **The credential and key rotation record.** Every default changed, every commissioning credential rotated *at* handover and the old ones invalidated. The single most common real-world breach path on new plant is the integrator's setup password that outlived the integrator.
- **The update procedure** — how a security update reaches this system, who signs it, how the operator applies it during the support period.
- **The vulnerability-disclosure contact** — where a researcher or operator reports a flaw in this system, per the coordinated-disclosure duty in Annex I Part II.

Hand it over as structured, machine-readable files, not scanned PDFs. The operator inherits something they can actually monitor against, and you keep a defensible copy for the support period. When a component CVE lands in 2029, the plant that has the SBOM knows in an afternoon whether it is affected. The plant that got a paper binder starts a forensic project.

---

Pick one skid you are commissioning this quarter and add the eight-row security pass to its acceptance procedure — before it ships, while the whole system is still on one bench and every fix is a five-minute fix. That single test protocol, reused across projects, is the difference between selling conformity evidence and selling a future notification. Watch the port-enumeration and SBOM-matching gates run against a real assembly in the [platform tour](/tour).
