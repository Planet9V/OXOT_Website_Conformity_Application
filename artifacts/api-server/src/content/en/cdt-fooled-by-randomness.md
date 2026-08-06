---
title: Fooled by Randomness — Why "We've Never Had an Incident" Is Not Evidence
meta_title: Fooled by Randomness in OT Security | OXOT
meta_description: Taleb showed markets confuse luck with skill. OT security makes the same error — here's how the Cyber Digital Twin measures risk a clean audit can't see.
excerpt: A clean audit and a quiet year are not proof your OT security works — they are one sample path through a much larger space of outcomes, and the Cyber Digital Twin exists to show you the rest of that space.
content_type: article
published: true
---

I did not read *Fooled by Randomness* looking for a cybersecurity book. I read it on a plane, years into a career spent inside substations, battery storage yards, rail control rooms, and water treatment plants across several continents, because someone had recommended it as a good book about markets. Somewhere over the Atlantic I stopped reading it as a book about markets at all. Nassim Taleb was describing, with total precision, something I had been watching my entire working life and had never had the language for. Not a metaphor. Not an analogy I was stretching to make a point. The same mathematics, the same psychology, the same structural blindness — just wearing a hard hat instead of a suit.

This piece is my attempt to lay that recognition out in full, because once you see it, you cannot stop seeing it in every audit report, every vendor pitch, and every board presentation that says a facility is secure because nothing bad has happened yet.

## What Taleb actually argued

Strip away the trading-floor color and Taleb's thesis is simple to state and uncomfortable to accept: **humans are constitutionally bad at recognizing randomness, and we systematically mistake outcomes for skill.** We see a pattern, we build a story to explain it, and we forget that the story was written after the fact by someone who already knew the ending.

His favorite illustration is a thought experiment, and it is worth running in full because everything downstream depends on it. Take ten thousand fund managers. Give each one a fifty-fifty chance of making money in any given year — pure coin-flip odds, no skill involved at all. Run it for five years. Simple binomial math says that around three hundred of them will have made money every single year, five years running, by chance alone. Those three hundred did nothing. They flipped a coin and it came up heads five times. But they do not experience it as chance, and neither does anyone watching them. They get profiled in magazines. Business schools study their "philosophy." Institutional money flocks to their fund because the track record looks like proof of a system.

The other 9,700 managers are gone. They lost, they closed their funds, they left the industry, and — this is Taleb's sharpest point — **they left no trace**. They are not a footnote in anyone's case study. They do not appear in the database the next analyst pulls up to study "what winning managers have in common." Taleb calls this the cemetery: the silent evidence of everyone who ran the identical strategy and was wiped out, structurally invisible to anyone evaluating the survivors.

He carries this into a wider set of ideas that all point the same direction:

- **Survivorship bias manufactures false expertise.** We study winners and copy their habits, never seeing the much larger population that tried the same habits and failed.
- **Skewness and asymmetry are the norm, not the exception.** Many real bets are not fair coin flips — they are small, steady gains punctuated by rare, catastrophic losses. Taleb's option sellers "eat like chickens and go to the bathroom like elephants": collecting small premiums for years, then losing it all in an afternoon when the tail event finally arrives.
- **The narrative fallacy rewrites the past.** After something happens, we build a tidy causal story to explain why it was bound to happen, and in doing so we erase how contingent and random it actually was.
- **Probability blindness runs both directions.** We overweight vivid, rare risks we can picture (a plane crash) and underweight slow-burning, statistically dominant risks we can't (a compounding, unpatched vulnerability sitting quietly for years).
- **Optionality beats narrow cleverness.** In a nonlinear world, being positioned so good tail events help you and bad tail events can't ruin you is worth more than being the smartest person in the room about the average case.

> [!NOTE]
> Taleb's deepest claim is not that skill doesn't exist. It's that in noisy, complex domains, skill is often parasitic on randomness — riding on top of it, indistinguishable from it in the short run, and only separable from it by looking at far more trials than any one person's career provides.

## The two sides of the table

The organizing image of the book, the one I have not been able to put down since, is what Taleb calls the two sides of the table.

One side — the left — is where the world actually operates. It is a full probability space: every outcome that could happen, weighted by how likely it is, including the fat-tailed, rare, catastrophic events that dominate real long-run results even though they almost never show up in any single stretch of history you happen to observe. The left side does not care about your story. It contains all the parallel universes where your winning streak turned into a bankruptcy, sitting right alongside the one universe you actually live in.

The other side — the right — is where people believe they operate. It is orderly, sequential, and explicable. Things happen for reasons. Effort and success are causally linked. History is a reliable teacher, because the future is assumed to look like a slightly updated version of the past. It is comfortable, socially rewarded, and almost entirely a construction of the human need for a story that makes sense.

Taleb's argument is that the financial industry built its entire risk-management apparatus — Value-at-Risk models, backtests, Sharpe ratios, the whole professional edifice — on the right side of the table, using tools explicitly designed to confirm the narrative rather than probe the underlying distribution. And that periodically, without warning proportional to the calm that preceded it, the left side reasserts itself. LTCM in 1998. The global financial crisis in 2008. Each time, the destruction was described afterward as a failure of execution, a rogue trader, a black swan nobody could have seen. Taleb's point is sharper than that: it was a failure of epistemology. The map described a world that had never existed, and the people using it had convinced themselves, and everyone paying them, that it had.

Formally: let X be a random variable representing some outcome — a year's profit and loss, say. The real distribution P(X) may be heavy-tailed, skewed, dominated by rare events. The illusion that most people act on is a truncated, smoothed stand-in for P(X) — usually just its mean and standard deviation, with the tails quietly assumed away because they are inconvenient to model and psychologically unpleasant to sit with.

You cannot tell which side of the table you are actually on by looking at outcomes. Taleb's other favorite illustration makes this vivid: two people at a casino. Person A plays a game that pays a small amount most of the time and occasionally wipes them out. They win for months, feel like a genius, and brag about their system. Person B plays a game that loses a little bit almost every time but carries a rare, explosive payout. They lose for a long stretch, get quietly written off as untalented, and then one day hit the jackpot. To any outside observer studying only the visible record, Person A looks like the expert and Person B looks like the fool. The observable history tells you almost nothing about which one actually has the better long-run bet.

## Where I've watched this exact thing happen — in facilities, not funds

Here is where the recognition became impossible to shake. I have stood in enough control rooms, walked enough substations, sat through enough post-incident debriefs to tell you that the language changes but the underlying error does not move an inch.

Instead of "we had a positive year," it's "we passed the audit." Instead of "our Sharpe ratio is strong," it's "we're IEC 62443 compliant." Instead of "our strategy is validated by a decade of returns," it's "we haven't had a significant incident."

When a facility hasn't been breached, the instinct is to read that as evidence the controls are working. What it actually is: evidence that the specific combination of adversary capability, timing, target selection, and internal vulnerability state has not yet converged into a realized attack path. The facility is sitting on one sample path through a probability space that contains thousands of other paths, some of which end in loss of control, a tripped safety system, physical damage, or worse. The absence of visible compromise tells you almost nothing about which path you're actually on. It is Taleb's turkey, fed every day for a thousand days and growing more confident in the arrangement with every meal, right up to the day before Thanksgiving, when the model gets revised with maximum prejudice. The compliance score does not dip the week before the breach. The audit passes. The dashboard is green. And somewhere in the gap between what the architecture diagram says should be running and what is actually installed, patched, modified, or quietly connected for operational convenience during a maintenance window three years ago, an adversary has already found the path none of the controls were built to see.

I have come to recognize a small set of illusions that recur, facility after facility, sector after sector, continent after continent:

**The reference architecture illusion.** The diagram on the wall shows a properly segmented network — IT cleanly separated from OT, the DMZ where it belongs, every connection routed through a controlled chokepoint. The diagram is accurate. It's accurate for the system as it was designed. What's actually running is the accumulated residue of years of operational decisions: an emergency workaround from an outage eighteen months ago, a vendor access path opened for a maintenance window and never closed, legacy equipment older than the current architecture, firmware that hasn't been touched since commissioning. The audit checked the diagram.

**The compliance-as-security illusion.** IEC 62443, NERC CIP, NIS2, NIST CSF — these frameworks encode genuine, hard-won knowledge about how to build a defensible system, and I have no quarrel with any of them. What I reject is the quiet substitution that happens in boardrooms everywhere: conflating compliance with a framework and actual security posture. Frameworks are built from known patterns, past incidents, and consensus principles. That means, by construction, they describe the right side of the table extremely well. They cannot account for the specific, unrepeatable combination of configuration, people, software dependency, geopolitical context, and organizational culture that constitutes the actual risk surface of one facility on one Tuesday.

**The vendor survivorship illusion.** This is Taleb's fund-manager cemetery wearing a trade-show badge. A vendor sells an endpoint product to five hundred enterprises. Perhaps four hundred and eighty go a year without a major incident — for reasons that mostly have nothing to do with the product: the threat actors were busy elsewhere that year, the attacker tried a vector the org happened to have segmented off for unrelated reasons, plain chance. Ten of those four hundred and eighty go on stage at the annual conference. *"We deployed this and haven't had a major incident in three years."* The twenty that were breached signed NDAs, quietly replaced the product, and are not in the room. They are the silent evidence. No one at the vendor lied. The survivor on stage told the truth. The buyer in the audience — the CISO of a utility, a water authority, a battery storage operator — applied entirely reasonable judgment and still arrived at the wrong conclusion, because the method for evaluating the product only ever shows you what happened, never what could have happened to the four hundred and eighty who weren't breached for reasons that had nothing to do with the tool.

**The "we've always done it this way" illusion.** Critical infrastructure has deep institutional memory, for good reason — you cannot disrupt a live process for every security theory that walks through the gate. But fifteen years of incident-free operation, in a world where the adversary environment, the software dependency chain, and the geopolitical backdrop have all shifted underneath you, tells you far less about the future than it feels like it should. You are on a sample path. The path having been smooth so far is not evidence the road ahead is smooth too.

> [!IMPORTANT]
> The absence of a breach is an outcome. It is not proof of a working system. Taleb's warning about mistaking outcomes for skill applies with equal force whether the outcome in question is a five-year winning streak or five years without an incident report.

## Noise vs. signal, made concrete

| | What it looks like | What it actually tells you |
|---|---|---|
| **A clean audit** | Green dashboard, controls "in place" | The reference architecture was checked, not the operational reality |
| **"No incidents in three years"** | A quiet track record | One sample path avoided the disaster zone; says little about the other paths |
| **A vendor's reference customers** | Success stories on stage | The visible survivors of a population whose failures are under NDA |
| **A penetration test with findings remediated** | A point-in-time snapshot | A single adversarial posture, tested once, against a system that keeps drifting |
| **94% security-awareness completion** | A training metric | Compliance with a policy, not evidence of behavior under real stress |
| **Board slide: 14 KPIs trending up** | A narrative of improvement | Confirmation of the story leadership already wanted to tell |

The right-hand column is the left side of the table. It is where the actual risk lives, and it is exactly the part that conventional security reporting is not built to show you.

## What building the Cyber Digital Twin taught me about taking this seriously

Recognizing the parallel is the easy part — it takes an afternoon and a plane ride. Building something that actually operationalizes it is the hard part, and it's what my team and I have spent years doing with the OXOT [Cyber Digital Twin](/en/cyber-digital-twin).

The starting discipline is refusing the comfort of the right side of the table. Where conventional practice asks *do we have the controls in place?*, we ask a different question: given the full probability space of how an adversary could move through this specific facility, with these specific people, at this specific moment — where are we actually exposed, and by how much?

Answering that honestly means building a model of the facility that captures not what the reference architecture says should exist, but what actually exists: every piece of equipment with its real firmware, its real configuration, its real patch state, its real connectivity. It means tracing the software inside every device down through its transitive dependencies, because a vulnerability sitting five levels deep in a library nobody thinks about is exactly the kind of thing a patient adversary finds and a scheduled compliance scan never reaches. It means treating threat intelligence not as a generic TTP list but as the actual live campaigns actual adversaries are running against actual sectors right now.

And it means — this is the part the industry avoids most consistently, because it is the hardest to reduce to a checkbox — modeling the human beings inside the facility with the same rigor applied to the equipment. I have watched, in real incidents and in exercises designed to feel like real incidents, the SOC analyst who waves off the third alert because the first two were noise. The plant manager convinced the cyber team is overreacting because "these systems have run fine for twenty years." The incident commander whose own reporting structure blocks the escalation that would have mattered. The team whose collective judgment simply degrades under cognitive load at precisely the moment clarity is most needed. None of that is a character flaw. It is a predictable, measurable property of human organizations under stress, and Taleb spent his career arguing that human cognition distorts risk perception in specific, computable directions — biases and heuristics that served small groups well for most of human history and become active liabilities inside complex, nonlinear, high-consequence systems. Field experience confirms it at every scale, from the individual analyst up through the organization's culture to the constraints built into the regulatory environment itself.

The methodology we built treats human behavior not as an unpredictable variable to be handled with a training video and a signed policy, but as a **dynamical system with its own structure, thresholds, and failure modes** — modeled with the same seriousness applied to the technical layers around it.

## The Monte Carlo mind

Taleb's actual antidote to right-side thinking is not "think harder." It's a change of method: run the Monte Carlo. Generate thousands of alternative histories and study the distribution of outcomes that produces, rather than staring at the single history that happened to occur. You cannot understand your true exposure by studying what happened. You have to study what *could* happen — across the full space of possibility, including the regions you haven't visited yet and hope never to.

That is the literal design principle underneath the Cyber Digital Twin. The question we build systematic methodology to answer is not "what has gone wrong before?" It's "in how many ways could this facility be broken, through what sequence of steps, exploiting what specific combination of technical and human vulnerability — and which of those pathways are most probable, which are most catastrophic, and what would we actually have to change to reduce the exposure, not just to pass next quarter's audit?"

None of this is desk theory. It comes from walking the facility floor, talking to the operators who actually touch the equipment, understanding the organizational culture from the inside, mapping the software that's genuinely running on genuine devices, and thinking adversarially about what a patient, well-resourced attacker would do with the vulnerabilities that actually exist — not the hypothetical ones a compliance framework was designed around.

The output looks nothing like a compliance report. Not a score. Not a checklist. Not a maturity rating on a five-point scale. A **probability landscape**: these are the paths most likely to succeed, ranked by consequence, given this specific facility, these specific people, this specific threat environment right now. Here is where the risk actually concentrates. Here is what would genuinely reduce it. Here is what looks impressive on paper and would move the needle by almost nothing.

## How the twin is built, in plain terms

The Cyber Digital Twin is a seven-layer graph of the facility, and the two layers that matter most for this argument are the first two, because between them they are Taleb's two sides of the table rendered as data.

**L0 — the Equipment Catalog** is the Platonic reference: the vendor datasheet, the reference firmware, the designed configuration. It is the map, and it is a perfectly accurate map — of the world the vendor sold you, not the world you're standing in.

**L1 — Customer Equipment** is the territory: the actual serial-numbered assets, their actual firmware versions, their actual patch states, their actual network configuration, mapped down to geo-spatial location and cross-sector interdependency. Every attack that has ever succeeded inside a hardened OT facility has exploited the gap between L0 and L1 — the delta between what was designed and what actually exists. The twin measures that gap as a first-class mathematical object rather than an unstated assumption. Every audit that checks against the reference model and returns "compliant" has committed the fundamental Talebian error: it audited the map and never surveyed the territory.

From there the graph builds outward: **L2** is the software bill of materials, traced through transitive dependencies five levels deep and enriched with exploit-probability scoring, because the vulnerability that matters is rarely the obvious one at the surface. **L3** is threat intelligence built from kill-chain modeling and live campaign attribution — the adversaries actually active against this sector and this asset class, not a generic list. **L4** is psychology: the gap between the Real threat (the actual attack surface, mostly unperceived) and the Imaginary fear (the CISO's threat model, the risk register, the compliance score — always partial, always a little self-serving). **L5** is the real-time information environment — geopolitical events, sentiment, the news cycle that can redirect an adversary's targeting with no warning. **L6** is prediction: breach likelihood, remediation lag, return on a given investment, expressed as a distribution with a stated confidence interval, not a single number pretending to be certain.

The engine that runs across this graph applies Monte Carlo trajectory sampling — extracting the current state, computing its rate of change, running a thousand simulated futures forward with randomized shocks and organizational resilience factored in, then aggregating the results into a posterior distribution with an explicit entropy measure and 95% confidence intervals. It generates MITRE ATT&CK-aligned attack sequences and runs them against the graph a thousand times, with randomized variation in adversary capability, timing, and human response. Each run is a parallel universe: a slightly different adversary, with slightly different tools, at a slightly different time, against your team on a slightly different day.

The output tells you something like: in 73% of simulated campaigns, the adversary reaches the Level 2 network. In 31%, they achieve persistence in the OT zone. In 8.4%, they reach a safety-critical system. In 2.1%, the combination of cyber compromise and human response failure produces a bifurcation — a state transition with no stable operating condition on the other side of it — and the 95% confidence interval on that 2.1% is [1.4%, 3.2%]. That is the left side of the table, in engineering-grade mathematics, and it is the difference between believing you are secure because a compliance score says so, and knowing the actual distribution of what happens when an adversary engages the facility you actually operate.

> [!TIP]
> A probability distribution with a confidence interval is a more honest deliverable than a single compliance score, even when the number in the distribution is worse. Taleb's whole argument is that the discomfort of an honest number is cheaper than the catastrophe of a comforting one.

## Left side vs. right side, in a table

| | **Right side of the table** (the comforting model) | **Left side of the table** (the probabilistic reality) |
|---|---|---|
| What it models | Controls present vs. absent | Full probability distribution of attack outcomes across every layer |
| What it measures | Compliance scores, point-in-time assessments | Continuous Monte Carlo distributions with stated confidence intervals |
| How it treats humans | Training completion rates, policy sign-offs | Behavior as a dynamical system with thresholds and phase transitions |
| How it finds threats | Known CVEs, known TTPs, vendor signature updates | Randomized multi-hop simulation, including paths no analyst would think to construct |
| How it treats the future | Assumes the future resembles the past | Generates many alternative futures and shows the spread |
| What it tells the board | "We are 87% compliant" | "In 8.4% of simulated campaigns the attacker reaches a safety-critical system; here is what reduces that to 3.1%, and here is the confidence interval" |
| How it handles the unimagined | Cannot, by definition — the checklist only contains what was already checked | Actively searches for the rare, high-consequence path precisely because it's rare |

## Why the human variable is not a soft add-on

The part of this work that draws the most skepticism, in my experience, is treating psychology as engineering. It shouldn't be the controversial part. Taleb's deepest point in the whole book is that randomness is not only "out there" in the market or the facility — it is *in us*, in how we perceive, rationalize, overfit patterns onto noise, and construct after-the-fact stories that make chance look like inevitability. If that is true of a fund manager staring at a P&L statement, it is at least as true of a SOC analyst staring at an alert queue at 3 a.m.

So the human layer of the twin is built to be computable rather than anecdotal. A psychometric profile for every actor in the system — defender and, where modeled, attacker — describes baseline tendencies under normal conditions and predicts how each person's decision-making deforms under stress: which biases activate, which shortcuts take over, which lines of communication break down first. An interaction model treats a response team the way you'd treat a physical system with kinetic and potential energy: cognitive load in motion, plus the friction or flow between every pair of people working the incident together. Under calm conditions that friction is manageable. Under crisis conditions it can spike the same way asset correlations spike to one during a market crash — everything that looked independent suddenly moves together, and not in a good direction.

There is an organizational-culture model that borrows the mathematics of a phase transition: below a critical level of stress, an organization's security culture "locks in" — people follow procedure, escalate what should be escalated, hold vigilance. Above that critical threshold — staff turnover, budget pressure, alert fatigue, a distracted leadership team — the coherence breaks down, individuals start acting inconsistently, and the organization can no longer sustain a coordinated response regardless of how much technology sits on the network. And this is the unsettling part: the organization looks identical on paper in both states. The compliance score doesn't move. The vendor stack is unchanged. But the human system has crossed a threshold, and the capacity to respond in concert has quietly evaporated. It is Taleb's turkey again, just measured with a different instrument: confidence peaks the day before the knife, because confidence was never actually tracking risk.

There is also a cascade model for how a compromise spreads — the mathematics of a contagion crossing the point where it becomes self-sustaining, needing no further input from the adversary to keep growing — and a model for the approach to a genuine crisis point, where two possible outcomes for the system (a stable state and an unstable boundary) converge and disappear, after which there is no stable state left to return to. The distance to that point shrinks nonlinearly as you approach it, which is exactly why these events feel sudden from the inside: the system was drifting toward the edge for months, and the visible warning signs only became legible in the final stretch of the approach.

None of this is offered as decoration. It is what it takes to stop treating "the human factor" as an unmodeled wildcard managed with a training video, and start treating it as what it actually is: a variable with structure, thresholds, and failure modes, sitting inside the same simulation as the firewalls and the firmware.

## What the old assumptions get wrong

Conventional OT/ICS security rests on five assumptions that are, in Taleb's framework, epistemologically identical to the assumptions that preceded the worst blowups in financial history:

1. **The past is representative of the future.** If controls have prevented breaches for three years, they are assumed to be working.
2. **Risk is additive and linear.** Add more controls, get proportionally more security.
3. **Compliance implies security.** If the audit says the standard is met, the facility is assumed protected.
4. **The threat landscape is knowable.** Monitor the right feeds, follow the right framework, and the defending team assumes it knows what it's up against.
5. **Human behavior is a constant.** The team is assumed to respond to the next real incident the way it responded to the last tabletop exercise.

Every one of those lives on the right side of the table. And the corrected version of each is not a nicer story — it's a harder one:

1. **The past is one sample path.** Three years without a breach is a single trajectory through the probability space. Run the Monte Carlo and most of the other trajectories contain breaches; some contain catastrophes. History tells you almost nothing about future risk.
2. **Risk is nonlinear and correlated.** A firewall that blocks one path can create a false sense of security that erodes vigilance on the adjacent paths. There are real phase transitions where adding complexity increases net risk rather than reducing it.
3. **Compliance is the map; the facility is the territory.** The distance between the two is large in most facilities, growing, and invisible to every compliance tool currently on the market.
4. **The threat landscape includes what you cannot yet imagine.** A simulation built to generate randomized sequences finds paths no human analyst would think to construct, because they live in regions of the state space that haven't shown up in any feed — precisely because they haven't happened yet.
5. **Human behavior is a dynamical system with phase transitions**, a function of stress, organizational temperature, cognitive load, and interpersonal dynamics that changes *during* the incident in ways that are mathematically predictable at the population level, even if unpredictable for any one individual.

## Asymmetric positioning: NOW / NEXT / NEVER

Taleb doesn't counsel paralysis in the face of all this uncertainty. He counsels asymmetric positioning — structuring your exposure so catastrophic downside is bounded and upside stays open, favoring strategies where the worst case is survivable over strategies that look good on average but carry a hidden chance of ruin.

That translates directly into how we prioritize investment once the simulation has run. We call it **NOW / NEXT / NEVER**, and it deliberately does not rank the same way a compliance checklist would.

**NOW** is the small number of attack paths that show up across a high share of simulations, reach a high-consequence target, and are fixable at reasonable cost. These are rarely what a compliance framework would flag first. They are what the probability distribution flags first, and the case for acting on them comes with a stated confidence interval, not a hunch.

**NEXT** is structural change: segmentation that reduces the network's largest eigenvalue and slows contagion, SBOM remediation aimed at the highest-centrality dependency nodes, organizational changes that strengthen the human bridges that tend to snap first under stress, engineering controls that add real barriers between the cyber domain and the physical process.

**NEVER** is everything that scores well on a checklist and moves the simulated risk by almost nothing — the vendor products whose reference customers are survivorship-biased anecdotes, the "best practices" that are best for the average facility on the right side of the table and irrelevant to your specific facility on the left, the awareness training that treats human cognition as a constant when the organizational-temperature model shows you are already close to the point where that assumption stops holding.

Because you cannot do infinite work, and pretending you can is itself a right-side-of-the-table delusion — just a more expensive one.

## What choosing this actually means

When you evaluate a Cyber Digital Twin approach against a conventional security program, you are not choosing between two products. You are choosing between two answers to the same question: *how do I know if I am secure?*

The conventional answer says: I am secure because I have the controls the framework asks for, and the audit confirms it. The answer built on Taleb's worldview says something less comfortable and more honest: here is the probability distribution of what happens when a real adversary engages this specific facility, here is where the risk concentrates, here is the confidence interval, and here is what would actually move the number.

Frameworks like [IEC 62443](/en/iec-62443) and [NIS2](/en/nis2) are not the enemy in this picture — they encode real, hard-earned knowledge, and no serious operator should ignore them. But they were built to describe the right side of the table well, and they were never going to be able to describe the left side, because the left side is specific to your equipment, your people, your patch history, and this week's geopolitics — not to the average facility the framework had to be written for. See our broader [Frameworks](/en/frameworks) overview for how these standards relate to one another and where each one's blind spots sit.

```cta
Would you rather see your own probability landscape than argue about averages?
The Cyber Digital Twin turns your OT estate into a model you can stress-test — so the few paths that reach a safety-critical system show up before an attacker finds them.
See your probability landscape :: /en/contact
```

## The bottom line

Nassim Taleb spent his career arguing that the financial world was systematically fooling itself — that the tools it used to measure risk were quietly built to hide risk instead, that the narratives constructed to explain success were artifacts of survivorship bias, and that the only honest position was the uncomfortable one: full probability space, epistemic humility, mathematical rigor, no shortcuts back to a comforting story.

Critical infrastructure security has made every mistake he identified, at higher stakes, because the failure mode here is not a blown-up fund. It's a tripped safety system, a contaminated water supply, a grid that doesn't come back on. The [Cyber Digital Twin](/en/cyber-digital-twin) is not a promise that your facility is safe — nothing honest can promise that. It is an attempt to tell you, with as much precision and as much stated uncertainty as the mathematics allow, how unsafe it actually is, where, along which paths, with what probability, and what would genuinely change that number — prioritized by data, bounded by confidence intervals, not by which vendor got the loudest stage time this year.

The threats to critical infrastructure are not going to become simpler or more predictable. The systems the world depends on are not going to become less networked, less automated, or less targeted. The only real question is whether the people responsible for defending them choose the comfort of the right side of the table, or do the harder, more honest work of the left.

The randomness is not the enemy. Pretending it doesn't exist is.

## Sources & further reading

This piece draws on Nassim Nicholas Taleb's *Fooled by Randomness* (2001) — its treatment of survivorship bias, the narrative fallacy, skewed payoff structures, and the "two sides of the table" — and on OXOT's internal Cyber Digital Twin architecture briefs describing the seven-layer graph, the Monte Carlo prediction pipeline, and the NOW/NEXT/NEVER prioritization framework. For the underlying technology, see [Cyber Digital Twin](/en/cyber-digital-twin); for the standards landscape this approach sits alongside, see [IEC 62443](/en/iec-62443), [NIS2](/en/nis2), and [Frameworks](/en/frameworks).
