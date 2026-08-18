---
id: "TC_01"
canonical_code: "TC_01"
title: "The Edge-to-Cloud Grey Zone: When a Microservice Update Reopens a Controller's CE Mark"
subtitle: "A routine Tuesday deploy ships a new build to your controller's cloud backend. Nobody touched the hardware. Does the CE mark on the field cabinet still hold, or did the pipeline just reopen it?"
slug: "tc-01-edge-to-cloud-grey-zone-microservices-ce-marks"
series_id: 10
episode_number: 1
series: "CRA: Truth & Consequences (Investigative)"
target_persona: "OT Architects, Cloud/Edge Engineers, Compliance Leads"
persona_category: "Investigative"
statutes: ["Article 3(1)", "Article 3(30)", "Recital 39"]
statutory_domain: "Product Boundary & Substantial Modification"
difficulty: "Architectural Judgment"
key_metric: "Is the cloud tier inside the product? (Art 3(1))"
read_time: "8 min read"
duration: "13:30"
audio_url: "https://oxot.ai/audio/cra_podcast/TC_01.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["Cyber Resilience Act", "Regulation (EU) 2024/2847", "product with digital elements", "remote data processing", "Article 3(1)", "Article 3(2)", "substantial modification", "Article 3(30)", "edge computing", "microservices", "cloud backend", "CE marking", "OT architecture"]
takeaways: ["How to tell whether a controller's cloud or edge backend sits inside the CE boundary (Art 3(1)/(2)) or outside it", "Which microservice deploys are routine and which quietly meet the substantial-modification definition", "A two-question release gate that decides deploy vs. reopened conformity before the pipeline runs"]
---

# The Edge-to-Cloud Grey Zone: When a Microservice Update Reopens a Controller's CE Mark

*By Jim McKenney — Digital Product Security Consultant & Industrial OT Architect*

A DevOps pipeline pushes a new build of the telemetry-ingest service to your controller's cloud backend on a Tuesday afternoon. Nobody went near the hardware. The PLC in the field cabinet is byte-for-byte what it was that morning, its CE mark still on the enclosure. So this is a pure cloud operation, invisible to product conformity. Right?

Not necessarily. Under the Cyber Resilience Act, the backend that microservice runs on may not be "the cloud" at all in the legal sense. It may be part of the product whose CE mark sits on that cabinet. And if it is, the question of whether a container push reopened conformity stops being an IT-versus-OT turf argument and becomes a matter of which build you shipped.

<!-- IMAGE-SLOT: tc-01-hero | 1200x630 | alt: "A field control cabinet with a CE mark on a factory floor, connected by a data link to a cloud backend rack; a dashed boundary line loops around both the controller and the backend" | caption: "The CE boundary doesn't necessarily stop at the cabinet door. Under Art 3(1) it can loop around the backend the controller depends on." -->

## Where the product actually ends

Most engineers picture the regulated product as the physical thing: the box on the DIN rail, its firmware, maybe the config. The CRA draws the line somewhere else. Article 3(1) defines a "product with digital elements" as a software or hardware product **and its remote data processing solutions**. The regulated object is the controller plus the backend it leans on, treated as one thing for conformity.

That sounds like it swallows the entire cloud, and it doesn't. The narrowing is in the next definition. "Remote data processing" is data processing at a distance where the software is designed and developed by the manufacturer, or under the manufacturer's responsibility, **and the absence of which would prevent the product with digital elements from performing one of its functions**. Both conditions have to hold: ownership and necessity.

Run any backend through that pair and it lands cleanly on one side:

| The backend is INSIDE the product when... | It is OUTSIDE when... |
|---|---|
| The manufacturer built it, or it runs under the manufacturer's responsibility | A third party or the operator stood it up |
| The controller loses a function without it — a control loop, setpoint fetch, operator auth | The controller keeps doing its job if the backend disappears |
| Example: the OEM's cloud service the controller calls to authorize an operator command | Example: the plant's own historian or a Grafana dashboard reading a telemetry mirror |

A controller that phones home to the manufacturer's cloud to authenticate an operator or pull the setpoints its loop runs on, and that stalls a function when the backend is gone, is a controller whose backend is inside the CE boundary. A controller streaming a read-only copy of its counters to a historian the plant chose is not: that sink is nobody's "remote data processing solution," and it sits outside the mark. The microservice on the first backend is regulated software governed by the same conformity as the hardware. The one feeding the second is ordinary IT, and its release cadence is nobody's compliance problem.

Nothing in the test turns on where the workload physically runs. An edge node in a substation rack and a container in a hyperscaler region are treated the same way: what decides them is ownership and necessity, not distance. A manufacturer-supplied edge gateway that runs the control logic the field device depends on is as much part of the product as a cloud tenant that does the same job. "Edge" is a deployment topology, not an escape from the boundary.

<!-- IMAGE-SLOT: tc-01-boundary | 1200x675 | alt: "Two-panel diagram. Left: controller plus manufacturer-owned backend enclosed in one dashed CE boundary because the controller needs it for a function. Right: same controller with a one-way mirror to a third-party dashboard sitting clearly outside the boundary" | caption: "The Art 3(2) test: manufacturer-owned AND functionally necessary puts the backend inside the product. Miss either condition and it falls outside." -->

## When a deploy is a deploy, and when it's a modification

Accept that a backend can be inside the product, and the interesting question follows immediately: does changing it reopen conformity? Not every commit does. Article 3(30) sets the bar. A substantial modification is a post-market change that either affects the product's compliance with the essential cybersecurity requirements, or changes the intended purpose the product was assessed for. Either limb, on its own, is enough. The mechanics of running a change through that definition, the gates you walk it through, are worked out in detail for retrofits in [when maintenance becomes redesign](/blog/ep-3.02-when-maintenance-becomes-redesign-the-4-step-test-); the move that matters here is simply this: a change to the remote data processing solution is a change to the product, so the same test that governs a firmware flash governs a cloud microservice. The medium is different. The legal object is identical.

Recital 39 draws the line most cloud teams are actually looking for. A security update designed to lower cyber risk, with the intended purpose left untouched, is expressly **not** a substantial modification. Patch the ingest service against a CVE, keep every interface and function identical, and that ships as freely as the CRA wants it to. The Regulation is trying to make you patch, not punish you for it. The same recital cuts the other way, though: where the nature of the hazard changes, or the level of cyber risk rises because of the update, and the changed version is made available, the change can be substantial.

So most of your pipeline never comes near conformity. Dependency bumps, security patches, autoscaling tweaks, a faster serializer: none of it touches the mark. The deploys that do are the ones that quietly change *what the product does* or *the security properties its conformity rested on*:

- a new API the controller starts trusting for commands, which is a new interface and a changed attack surface
- a change to how operators authenticate to the backend that propagates down to the field device
- a backend feature that can now push a control action the controller didn't previously accept
- a data flow that simply wasn't in the technical file the conformity assessment signed off

None of those is a hardware event. Every one of them is a candidate substantial modification, and the only reliable place to catch it is the same review that approves the merge.

<!-- IMAGE-SLOT: tc-01-deploy-vs-mod | 1200x800 | alt: "A single pipeline splitting into two labeled outcomes: routine deploys (dependency bump, CVE patch, autoscaling) flow straight through, while a change that adds an interface, a control path, an auth change, or a new data flow diverts to a gate marked 'reopens conformity'" | caption: "Same pipeline, two exits. Security and performance changes ship; a change to purpose or assessed security properties diverts to the conformity gate." -->

## The worked case: one sprint, one crossed line

Take that ingest service. It started life one-way: sensor and counter data flowing outbound, nothing flowing back. A sprint later, product management wants remote setpoint adjustment, so the same service grows a downstream command channel to the controller. The pull request is small. CI is green. No technician sets foot on the floor.

But the controller now accepts a control instruction over a path that did not exist when its conformity was assessed. Its intended purpose has widened from "run and report" to "run, report, and take remote setpoints," and its attack surface now includes an inbound command route the original risk assessment never modeled. That trips both limbs of the definition at once, and either one alone would have been sufficient. This was not a deploy. It reopened the CE mark on a cabinet nobody touched.

The consequence lands on whoever performed that modification and made the changed product available. If that party is a cloud or integration team rather than the original OEM, they can find themselves holding the manufacturer's duties for a device they think of as someone else's hardware. That is the accidental-manufacturer trap, and it is worked through for integrators in [the accidental manufacturer](/blog/ep-2.01-the-accidental-manufacturer-how-system-integrators). The point for the pipeline is narrower: the moment a backend change touches purpose or assessed security properties, the release is no longer a merge decision.

## Catch it at the merge, not six months later

Before a change ships to a manufacturer-owned backend a controller depends on, two checks decide whether you are deploying software or rebuilding a regulated product.

First: **is this backend inside the product boundary?** Is it the manufacturer's remote data processing, the kind the controller loses a function without? If no, if it is a third-party sink or an operator's own tooling, ship it and move on; the CE mark is not in the room.

If yes, second: **does the change touch the intended purpose or the security properties the controller's conformity was assessed under?** A pure security update that lowers risk and changes nothing else is maintenance; ship it. A change that adds an interface, a control path, an auth change that reaches the device, or a data flow that was never in the technical file is not maintenance. It is a substantial modification, and the person who owns the release is whoever will sign the updated declaration of conformity.

Wire those two questions into the deployment gate, next to the tests that already block a bad build. The teams that get caught are not the ones who modified a controller; they are the ones who could not tell, six months later, which Tuesday afternoon did it. If your backend is inside the boundary, your commit history is part of the technical file whether you treat it that way or not. [See what that file looks like against a live product](/demo).
