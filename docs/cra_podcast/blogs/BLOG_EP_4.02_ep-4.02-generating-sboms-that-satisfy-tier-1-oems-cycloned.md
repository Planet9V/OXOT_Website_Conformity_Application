---
id: "EP_4.02"
canonical_code: "EP_4.02"
title: "Generating an SBOM Tier-1 OEMs Will Accept: CycloneDX & SPDX for Embedded Firmware"
subtitle: "The statute asks for one machine-readable file listing your top-level dependencies. Your Tier-1 buyer asks for far more. Both come off the same build — here is the artifact, field by field."
slug: "ep-4.02-generating-sboms-that-satisfy-tier-1-oems-cycloned"
series_id: 4
episode_number: 2
series: "Tier-2 Upstream Component Supplier Survival"
target_persona: "Embedded Firmware Developers, Software Engineering Managers, DevSecOps."
persona_category: "Hardware & Embedded OEMs"
statutes: ["Annex I Part II", "Annex VII", "Article 13"]
statutory_domain: "Tier-2 Embedded Systems"
difficulty: "Advanced Engineering"
key_metric: "The statutory floor: machine-readable, top-level dependencies"
read_time: "9 min read"
duration: "14:15"
audio_url: "https://oxot.ai/audio/cra_podcast/EP_4.02.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["Cyber Resilience Act", "Regulation (EU) 2024/2847", "SBOM", "CycloneDX", "SPDX", "embedded firmware", "Annex I Part II", "CI/CD dependency scanning", "CE marking"]
takeaways: ["Open-source SBOM tooling that emits a valid file from a bare-metal C or RTOS build", "How to record third-party binary blobs you cannot see inside without lying about completeness", "Wiring SBOM generation into CI/CD so every signed build carries its own bill of materials"]
---

# Generating an SBOM Tier-1 OEMs Will Accept: CycloneDX & SPDX for Embedded Firmware

*By Jim McKenney — Digital Product Security Consultant & Industrial OT Architect*

There are two different documents people mean when they say "SBOM," and conflating them is why this task feels heavier than it is. One is the thing the Cyber Resilience Act actually requires. The other is the thing a Siemens or Schneider procurement portal will reject your bid without. They are not the same size, they are not the same format, but they both fall out of the same build if you set it up once.

Start with the smaller one, because it is the legally binding one. Annex I, Part II(1) of the CRA obliges a manufacturer to "identify and document vulnerabilities and components contained in products with digital elements, including by drawing up a software bill of materials in a commonly used and machine-readable format covering at the very least the top-level dependencies of the products." Read that clause literally. It does not say CycloneDX. It does not say SPDX. It does not name a version, a schema, or a signing scheme. It sets a floor: machine-readable, a commonly used format, and, at the very least, your top-level dependencies. A JSON file listing the handful of libraries you directly pull into your firmware image satisfies the statute.

<!-- IMAGE-SLOT: ep-4.02-hero | 1200x630 | alt: "A single firmware binary on the left resolving into a short, ordered stack of labelled component blocks on the right, with a clear boundary line separating the small statutory set from a larger buyer-requested set" | caption: "The CRA floor is the small set: machine-readable, top-level dependencies. The buyer's demand is the larger set. One build produces both." -->

## Where the "validated CycloneDX or no bid" pressure actually comes from

You have heard the harder version: *if your build doesn't output a validated CycloneDX file, the Tier-1 won't even look at you.* Treat that as a description of the market, not the law. CycloneDX (from OWASP) and SPDX (ISO/IEC 5962) are the two de-facto formats the industrial supply chain has standardized on, and a Tier-1's ingestion pipeline is built to parse one of them automatically. When their portal rejects a bid, it is enforcing a **procurement requirement**, not a statutory one. The distinction matters because it tells you where to argue and where not to. You cannot negotiate the Annex I floor away — it is a condition of CE marking. You *can* negotiate format, depth, and delivery cadence with a buyer, because those terms are commercial.

In practice you will not want to argue. Meeting the buyer's format over-satisfies the statute for free, and the manufacturer obligations in Article 13 land on you the moment your firmware is placed on the market regardless. So build for the harder target and the floor takes care of itself.

One more relief before the how-to: the SBOM is part of your **technical documentation** under Annex VII, and technical documentation is not a public document. It sits in your file, is handed to a Tier-1 under NDA, and is disclosed to a market-surveillance authority only "further to a reasoned request." Nothing in the CRA forces you to publish your dependency list on a website. The recurring fear that an SBOM leaks your architecture to the world misreads the obligation — and, as we will see, misreads what an SBOM even contains.

## The artifact, annotated

Here is a trimmed CycloneDX 1.6 file for a fictional valve-controller firmware. The comments are mine, for the walkthrough — a real file carries none, because JSON has no comments.

```jsonc
{
  "bomFormat": "CycloneDX",
  "specVersion": "1.6",
  "serialNumber": "urn:uuid:b1e7...c904",   // unique identity for THIS bill
  "version": 1,
  "metadata": {
    "timestamp": "2027-05-14T09:22:00Z",
    "component": {
      "type": "firmware",                    // the subject of the SBOM: your image
      "name": "valve-controller-fw",
      "version": "4.2.1",
      "hashes": [
        { "alg": "SHA-256", "content": "9f2c...a71b" }  // pins the exact binary
      ]
    }
  },
  "components": [
    {
      "type": "library",
      "name": "FreeRTOS-Kernel",
      "version": "V11.1.0",
      "purl": "pkg:github/FreeRTOS/FreeRTOS-Kernel@V11.1.0",  // machine-matchable identity
      "licenses": [ { "license": { "id": "MIT" } } ],
      "hashes": [ { "alg": "SHA-256", "content": "3ac9...0f42" } ]
    },
    {
      "type": "library",
      "name": "wolfSSL",
      "version": "5.7.2",
      "purl": "pkg:generic/wolfssl@5.7.2",
      "licenses": [ { "license": { "id": "GPL-2.0-or-later" } } ]  // license flag matters commercially
    },
    {
      "type": "library",
      "name": "acme-radio-stack",           // a vendor binary blob: no source, no purl
      "version": "2.3",
      "supplier": { "name": "Acme Radio GmbH" },
      "hashes": [ { "alg": "SHA-256", "content": "d4e5...11a0" } ]  // all you can honestly assert
    }
  ],
  "compositions": [
    {
      "aggregate": "incomplete",             // HONEST: contents of the blob are unknown to us
      "assemblies": [ "acme-radio-stack" ]
    }
  ]
}
```

Walk the load-bearing fields. The `metadata.component` is the *subject* — the firmware image itself, hashed, so a buyer can prove the SBOM belongs to the exact binary they received. Each entry in `components` is a dependency; the `purl` (package URL) is the field that makes the file machine-readable in the way both the statute and the buyer care about — it is a canonical, tool-matchable identity a vulnerability scanner can look up. `licenses` is not decoration: a `GPL-2.0` line on a linked library is exactly the kind of thing a Tier-1's legal team scans the SBOM for, and finding it early is cheaper than finding it in a shipped product.

The interesting entry is `acme-radio-stack` — a precompiled `.a` from a vendor who will never give you source. This is the case that panics people, and CycloneDX has a clean answer for it. You record what you can honestly assert: name, version, supplier, and a SHA-256 hash of the blob. You do **not** invent a dependency tree you cannot see. Instead you use the `compositions` block to mark that assembly `incomplete` — a formal, machine-readable statement that says "this component is in the product, and its internals are unknown to us." That is not a weakness in your SBOM; it is the SBOM doing its job. An auditor or buyer would far rather see an honest `incomplete` flag than a confident, fabricated component list. If the vendor does supply their own SBOM, you nest it, referencing their bill rather than transcribing it, and the flag flips to complete.

## Producing it from a build with no package manager

The reason embedded SBOMs are hard is not the format. It is that bare-metal C and RTOS firmware usually have no package manager to interrogate. Dependencies are vendored source trees, git submodules, and vendor archives — nobody declares them in a manifest a tool can read. So you get the components from wherever your build already knows about them:

- **If you build under Yocto**, you already have an SBOM generator: the `create-spdx` class emits an SPDX document per image as a build artifact. Yocto speaks SPDX natively; if your buyer wants CycloneDX, convert downstream. **Buildroot** has comparable SBOM output. Let the build system that already resolves every recipe tell you what went in.
- **If you build under Zephyr or plain CMake**, `cdxgen` and Syft can walk the source tree and Kconfig/CMake metadata to enumerate components, and CycloneDX ships language and CMake integrations. For West-managed Zephyr trees, the manifest *is* your top-level dependency list — the floor is halfway written for you.
- **For the vendored blobs and hand-copied trees no tool can resolve**, maintain a small component manifest checked into the repo — name, version, supplier, license, hash — and have the build merge it into the generated SBOM. It is unglamorous and it is the honest way to cover the parts automated discovery misses.

Whichever route, the file lists *components and versions* — not your proprietary source, not your algorithms, not your control logic. That is worth repeating for anyone still nervous about IP: an SBOM is a parts list, not a schematic. It tells a buyer you link wolfSSL 5.7.2; it tells them nothing about how your valve-control loop works.

## Make the build own it

The failure mode is generating an SBOM by hand for the buyer's audit and never again. It is stale the day after, and a stale SBOM is worse than none because it asserts a state that is no longer true. Wire it into CI/CD so the bill is a build output, not a chore:

1. On every tagged build, run the generator as a pipeline stage and emit the SBOM as a named artifact alongside the binary.
2. Hash the firmware image and stamp that hash into the SBOM's `metadata.component`, so bill and binary are provably bound.
3. Run a dependency scan against the freshly generated SBOM — feed the `purl` list to a vulnerability source — and fail or flag the build when a component carries a known, unfixed issue. This is the same file doing double duty: buyer artifact and your own early-warning system.
4. Sign the SBOM (in-toto attestation, or your existing code-signing chain) and store both bill and binary in an immutable archive for the CRA's retention window.

<!-- IMAGE-SLOT: ep-4.02-cicd-flow | 1200x675 | alt: "A flat left-to-right pipeline: source and build stage, an SBOM-generation node branching to a hash-binding step and a vulnerability-scan gate, then a signing step, ending in an archive box, with one output arrow labelled toward a buyer node" | caption: "One pipeline stage, two consumers: the same generated, hashed, signed SBOM feeds your own vulnerability gate and the buyer's ingestion." -->

Do that once and the two documents from the opening collapse into one: the machine-readable, top-level-dependency file the statute demands and the validated, hash-bound, license-annotated CycloneDX the Tier-1 ingests are the same artifact, produced by the same stage, on every build.

Pick your next tagged firmware release and make it the first one that emits its own SBOM automatically — even a rough one covering only top-level dependencies clears the statutory floor and gives you something real to hand a buyer. To see an SBOM generated, hashed, and filed into a conformity technical file against a live product, [walk through the platform demo](/demo).
