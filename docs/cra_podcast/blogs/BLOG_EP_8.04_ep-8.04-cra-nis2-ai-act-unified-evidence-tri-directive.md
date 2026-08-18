---
id: "EP_8.04"
canonical_code: "EP_8.04"
title: "One Industrial Machine, Three EU Laws: A Unified Evidence Map for CRA, NIS2 and the AI Act"
subtitle: "A palletising robot on an essential-plant line sits inside three regulations at once: the CRA governs its firmware, the AI Act governs its vision model, NIS2 governs the plant that runs it. The programmes are separate, but the evidence overlaps in exactly three places and nowhere else. This is the map of where the work is done once and where it is not."
slug: "ep-8.04-cra-nis2-ai-act-unified-evidence-tri-directive"
series_id: 8
episode_number: 4
series: "Executive Liability, Penalties & Future Evolution"
target_persona: "Group CISOs, Enterprise Architects, Regulatory Policy Leads."
persona_category: "Executives & Boards"
statutes: ["Article 12", "NIS2 Article 23", "AI Act Article 15"]
statutory_domain: "Cross-Regulatory Evidence & Regime Alignment"
difficulty: "Executive Briefing"
key_metric: "3 regimes, 1 evidence base"
read_time: "9 min read"
duration: "15:10"
audio_url: "https://oxot.ai/audio/cra_podcast/EP_8.04.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["Cyber Resilience Act", "Regulation (EU) 2024/2847", "NIS2 Directive", "Directive (EU) 2022/2555", "EU AI Act", "Regulation (EU) 2024/1689", "CRA Article 12", "high-risk AI system", "AI Act Article 15", "NIS2 Article 23", "unified evidence map", "cross-regulatory compliance", "industrial robot compliance", "one CE mark two regulations"]
takeaways: ["The three laws have different duty-holders on the same machine: the CRA binds the robot's manufacturer, the AI Act binds whoever places the high-risk model, NIS2 binds the plant operator that runs the cell", "CRA Article 12 is the one hard bridge: a product that meets the CRA essential requirements is deemed to comply with the cybersecurity requirements of AI Act Article 15, on one EU declaration of conformity, but only the cybersecurity slice, not accuracy and robustness", "Evidence genuinely reuses in three places only, the Article 12 deeming, a shared risk assessment the operator consumes as supply-chain input, and an incident cadence that is aligned but not a single filing; everywhere else the regimes have hard borders"]
---

# One Industrial Machine, Three EU Laws: A Unified Evidence Map for CRA, NIS2 and the AI Act

*By Jim McKenney — Digital Product Security Consultant & Industrial OT Architect*

There is a palletising robot at the end of a bottling line I walked last month. It picks finished cases off a conveyor, reads them with a downward-facing camera, and stacks them onto pallets four high. Ordinary machine, the kind that runs three shifts and gets noticed only when it stops. That single robot sits inside three separate pieces of EU law at the same moment, and each one grips a different part of it. The Cyber Resilience Act has hold of the firmware in its controller. The AI Act has hold of the computer-vision model that decides where the gripper closes. NIS2 has hold of the plant around it, because the bottler is an essential entity and the line is part of the operation the directive tells it to secure.

Most compliance programmes meet this machine as three intake forms from three teams, and treat the overlap as a coincidence to be managed by meetings. That is the expensive reading. The laws are genuinely distinct, with different duty-holders and different triggers, but the evidence they demand overlaps in a small number of exact places. Knowing where those places are, and just as importantly where the border is solid, is the difference between building one evidence base that feeds three regimes and staffing three programmes that re-document the same robot.

<!-- IMAGE-SLOT: ep-8.04-hero | 1200x630 | alt: "A palletising robot at the end of a production line, its three layers labelled: controller firmware governed by the CRA, computer-vision model governed by the AI Act, and the surrounding plant governed by NIS2" | caption: "One machine, three grips. The CRA holds the firmware, the AI Act holds the vision model, NIS2 holds the plant. Different duty-holders, one evidence base if you build it right." -->

## Which law has hold of which layer

Start by separating the machine into the layers the statutes actually address, because the regulations do not divide it the way an engineer would.

The **controller and its firmware** are a product with digital elements. The CRA (Regulation (EU) 2024/2847) binds whoever manufactures that product and places it on the market. The robot vendor owns this duty, not the bottler. It runs on the vendor's essential cybersecurity requirements, its technical file, its CE mark.

The **vision model** may be a high-risk AI system. Under the AI Act (Regulation (EU) 2024/1689), a model that acts as a safety component of a machine already subject to third-party conformity assessment is classified as high-risk by Article 6. If the gripper's decisions bear on safety, the model crosses that line, and AI Act Article 15 then demands accuracy, robustness, and cybersecurity appropriate to the risk. This duty falls on the party that places the AI system, which in a bundled robot is usually the same vendor wearing a second hat.

The **plant** is neither a product nor a model. NIS2 (Directive (EU) 2022/2555) binds the bottler as an essential entity: its management body must approve and oversee cybersecurity risk-management measures, the operation must run those measures across its systems, and it must report significant incidents. The robot is one asset inside that estate. The operator's duty is explored for a utility control room in [EP 5.04](/blog/ep-5.04-water-wastewater-utilities-scada-remote-telemetry-); the same logic governs a bottling line.

So the layers sort cleanly, and the duty-holders do not collapse into one. That last point is the one most cross-regulatory decks get wrong. The bottler cannot discharge its NIS2 obligations by pointing at the vendor's CE mark, and the vendor cannot answer for how the plant is run. Same machine, three parties, three sets of books.

## The one bridge that is written into the statute

Here is where the evidence genuinely fuses, and the exact reach of that fusion is the thing to pin down. CRA Article 12 is the only place where meeting one law's requirements is, by the text, deemed to satisfy another's.

The provision says that a product with digital elements which is also a high-risk AI system under Article 6 of the AI Act "shall be deemed to comply with the cybersecurity requirements set out in Article 15" of the AI Act where it meets the CRA's essential requirements in Annex I, the manufacturer's processes meet those requirements, and the achievement of the required cybersecurity protection is demonstrated in the EU declaration of conformity issued under the CRA. One declaration. One CE mark can carry both.

<!-- IMAGE-SLOT: ep-8.04-article-12-bridge | 1200x720 | alt: "A diagram of the CRA Article 12 bridge: meeting CRA Annex I essential requirements flows into a single EU declaration of conformity that is deemed to satisfy the cybersecurity requirements of AI Act Article 15, with accuracy and robustness shown as a separate un-bridged obligation still owed under the AI Act" | caption: "Article 12 bridges the cybersecurity slice of AI Act Article 15 and nothing more. Accuracy and robustness stay on the AI Act's side of the line, un-bridged." -->

Read the first clause of Article 12 slowly, because it is the guardrail. The deeming applies "without prejudice to the requirements relating to accuracy and robustness set out in Article 15." Article 15 sets three requirements: accuracy, robustness, and cybersecurity. The CRA bridge carries the cybersecurity one across and leaves the other two exactly where they were. Do the cybersecurity engineering once and you answer it under both regimes. The accuracy and robustness of that vision model remain an AI Act obligation you satisfy on the AI Act's own terms. Anyone selling "one file closes the AI Act" has read half the sentence.

That is the whole bridge. It is real, it is bankable, and it is narrow. It does not touch NIS2 at all, because NIS2 governs an operator, not a product.

## Where the evidence reuses beyond the bridge

Beyond the statutory bridge, the evidence reuses again in ways that are artifact-sharing rather than legal deeming, and both instances repay deliberate engineering.

The first is the **risk assessment**. The manufacturer's product risk assessment under the CRA, and the risk management the AI Act requires for a high-risk system, draw on the same threat analysis of the same machine. Duplicating them produces two documents that must then be kept consistent forever, which is more work than sharing one analysis with two conformity conclusions drawn from it. The reuse then reaches a third party: NIS2 tells the bottler to account for supply-chain security and the quality of its suppliers' cybersecurity practices, including their vulnerability handling. The manufacturer's CRA output, its SBOM, its declared support period, its vulnerability-disclosure process, is precisely the evidence the operator needs to discharge that supply-chain measure. The manufacturer produces it once as a compliance artifact; the operator consumes it as a due-diligence input.

The second is the **incident pipeline**, and this one demands care because the cadence aligns while the obligation does not. When that robot is hit by an actively exploited vulnerability, separate reporting clocks can start on separate parties. The manufacturer owes a 24-hour early warning, a 72-hour update, and a final report to the CSIRT coordinator and ENISA through the CRA's single reporting platform; that clock and its operational drill are the subject of [EP 6.01](/blog/ep-6.01-the-24-hour-early-warning-panic-operationalizing-t). If the same event significantly disrupts the plant, the bottler independently owes its own report under NIS2 Article 23, on the same 24-hour and 72-hour rhythm with a final report inside one month, to its national CSIRT.

<!-- IMAGE-SLOT: ep-8.04-incident-fork | 1200x675 | alt: "One security event on the robot forking into two separate reporting obligations: the manufacturer reports to the CSIRT coordinator and ENISA under the CRA on a 24h/72h/final cadence, and the plant operator reports to its national CSIRT under NIS2 Article 23 on a matching cadence, from a single shared evidence set" | caption: "One event, two reports, one evidence set. The cadences line up so the same forensic facts feed both filings; the filings themselves stay separate and separately owed." -->

The cadences rhyme, so a single well-built evidence set, what happened, when, which units, what is being done, can feed both reports without re-investigation. But the destinations differ, the duty-holders differ, and the triggers differ: the CRA fires on a product vulnerability or a severe product incident, NIS2 fires on a significant impact to the service. You align the pipeline. You do not file once.

## Where the map has hard borders

The reuse stops cleanly at three edges, and naming them keeps a unified programme honest.

The **duty-holder border** does not move. No amount of shared evidence lets the operator inherit the manufacturer's declaration or the manufacturer answer for the plant's governance. The **scope border** inside Article 15 holds: cybersecurity crosses the bridge, accuracy and robustness do not. And the **reporting border** stays fixed: the filings stay separate, the recipients differ, the triggers differ, however synchronised the underlying forensics.

| Machine layer | Governing law | Duty-holder | Evidence artifact |
|---|---|---|---|
| Controller firmware | CRA (2024/2847) | Robot manufacturer | Essential-requirements risk assessment, technical file, EU declaration of conformity, CE mark |
| Vision model (high-risk AI) | AI Act (2024/1689) | Party placing the AI system | AI risk management, accuracy & robustness evidence; cybersecurity **deemed via CRA Art 12** on the same declaration |
| Shared: product security posture | CRA ↔ AI Act bridge | Manufacturer | One EU declaration of conformity carrying both cybersecurity conclusions |
| The plant that runs the cell | NIS2 (2022/2555) | Bottler (essential entity) | Management-body approval and oversight record; supply-chain evidence consumed from the manufacturer; Article 23 incident reports |

The table is the map. Read down the duty-holder column and the illusion of a single programme dissolves; read down the evidence column and the genuine reuse reappears, in the two rows that share an artifact and nowhere else. You can model your own machine against this map in the [conformity workspace](/demo), and the CRA half of it is grounded in [the statute](/wiki/cra).

The reason this matters at your altitude is that the org chart wants to answer three laws with three programmes, and the machine refuses to be divided that way. The robot does not know which directorate owns it. It generates one stream of facts, a risk model, a bill of materials, a support commitment, an incident record, and three regimes reach into that stream for different reasons. Build the stream once, as a single evidence base with clear owners per layer, and Article 12 collapses two of the conformity questions into one signature while the risk assessment and the incident record serve everyone who has a claim on them. Build three programmes instead, and you will pay to document that one robot three times, then pay again to keep the three descriptions of it from contradicting each other the first time a regulator reads them side by side.
