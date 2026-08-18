---
id: "TC_02"
canonical_code: "TC_02"
title: "The Defunct OEM Dilemma: Who Patches Brownfield OT When the Manufacturer Goes Bankrupt?"
subtitle: "The Cyber Resilience Act puts the patching duty on the manufacturer. When the manufacturer is struck off, that duty has no one left to bind — and the risk quietly moves onto the operator under a different law."
slug: "tc-02-defunct-oem-dilemma-brownfield-patches"
series_id: 10
episode_number: 2
series: "CRA: Truth & Consequences (Investigative)"
target_persona: "Asset owners, plant CISOs, and maintenance directors running long-life brownfield OT."
persona_category: "Investigative"
statutes: ["Article 13(8)", "Article 13(23)", "Article 22", "NIS2 Article 21"]
statutory_domain: "Brownfield & Legacy OT"
difficulty: "Legal & Risk"
key_metric: "Devices whose obligated manufacturer no longer exists"
read_time: "8 min read"
duration: "13:20"
audio_url: "https://oxot.ai/audio/cra_podcast/TC_02.mp3"
rss_feed: "https://oxot.ai/feeds/cra-podcast.xml"
date: "2026-08-14"
keywords: ["CRA defunct manufacturer", "bankrupt OEM patching", "Article 13(8) support period", "cessation of operations CRA", "NIS2 Article 21", "orphaned OT assets", "brownfield vulnerability management", "deemed manufacturer Article 22", "unsupported PLC", "who patches legacy OT"]
takeaways: ["The CRA support duty binds a legal entity; when the manufacturer dissolves, that duty becomes unenforceable, it does not transfer to you", "A departing manufacturer must warn you it is leaving (Article 13(23)); nothing in that clause makes anyone keep patching", "Your NIS2 Article 21 duty to manage the risk is continuous and solvency-blind: an orphaned device is your risk to contain"]
---

# The Defunct OEM Dilemma: Who Patches Brownfield OT When the Manufacturer Goes Bankrupt?
*By Jim McKenney — Digital Product Security Consultant & Industrial OT Architect*

A regional automation vendor files for insolvency on a Tuesday. By Friday its support portal returns a 404, its firmware-signing certificate is frozen with the rest of the estate, and the three engineers who actually understood the controller have taken jobs elsewhere. None of that stops the two hundred of its process controllers still bolted into live production lines across a dozen plants. They keep running. They keep listening on the network. And eight months later a researcher publishes a vulnerability in the exact protocol stack those controllers speak, with no fix coming, because there is no longer a company to write one.

The comforting story an asset owner tells the board is that the maker's collapse is the maker's problem. The Cyber Resilience Act put the duty to handle vulnerabilities on manufacturers; the manufacturer is gone; therefore the duty went with it. The first half of that is correct. The conclusion is where plants get hurt.

<!-- IMAGE-SLOT: tc-02-hero | 1200x630 | alt: "A darkened industrial control cabinet still powered and blinking, with a faded vendor logo peeling off the door and a wound-down company sign in the background" | caption: "The company is gone. The controllers it made are still in service, still on the network, still speaking a protocol nobody will patch again." -->

## The duty attached to a legal person, and that person no longer exists

Start with what the CRA actually obliges a manufacturer to do. Under Article 13(8) the maker of a product with digital elements has to handle that product's vulnerabilities for a defined *support period*: a window it must set to reflect how long the product is realistically expected to be in use, subject to a floor of five years. That is a real, enforceable duty. It is also, unavoidably, a duty *on the manufacturer*. The obligation and the obligated party are welded together.

A regulation can compel a company. It cannot compel a company that has been wound down and struck off the register. You cannot serve a firmware demand on an estate in liquidation, and you cannot sue a dissolved entity into writing a patch it has no staff to build and no certificate to sign. When the manufacturer dissolves, the Article 13(8) duty does not pass to the nearest available party. It simply becomes unenforceable against the only party that ever held it. The gap between a support period *lapsing* while the maker still trades and the maker itself *ceasing to exist* is the whole subject of this piece. The mechanics of engineering around an expired-but-living vendor are covered in the companion on [bridging the OEM support gap under NIS2](/blog/ep-3.03-bridging-the-5-year-oem-gap-keeping-20-year-indust).

The CRA did foresee the disappearance. Article 13(23) requires a manufacturer that is ceasing operations, and as a result cannot comply, to inform the market surveillance authorities and, as far as possible, the users of the affected products *before* the shutdown takes effect. Read that clause for what it is and what it is not. It is an early-warning duty. It obliges a dying company to tell you it is dying. It does not oblige anyone to keep patching, does not create a successor, and does not move the technical work onto a solvent third party. The last statutory act of a defunct OEM is to confirm, on the record, that the device in your plant is now on its own. In a disorderly insolvency, even that notice frequently never arrives.

## The risk didn't vanish; it moved

The boardroom story leaves out the second half. The manufacturer's duty ended, but the *risk* did not. It moved onto you, under a separate law that never once mentioned your vendor's solvency.

If you operate essential or important services (energy, water, chemicals, transport, and the rest of the NIS2 scope), Article 21 of the NIS2 Directive requires you to take appropriate, proportionate, state-of-the-art measures to manage the risks to the network and information systems you use to run those services. That duty is continuous, all-hazards, and blind to who made any given device or whether that maker still exists. An orphaned controller carrying a live, unpatched vulnerability is precisely the kind of risk Article 21 tells you to control. When you cannot change the device, you change the boundary around it: segment it into a tightly drawn zone, virtual-patch the conduit, and monitor what reaches it. That engineering is the subject of the companion post above, not this one, so I will not re-teach it here.

<!-- IMAGE-SLOT: tc-02-duty-transfer | 1200x675 | alt: "A diagram showing the CRA manufacturer duty ending at a dissolved-company boundary, with an arrow labelled 'risk, not the duty' crossing to the operator under NIS2 Article 21" | caption: "The CRA duty stops at the dead entity. The risk crosses the line into NIS2 territory, where it becomes the operator's to manage." -->

What matters for planning is how regulators, auditors, and insurers read the same facts. "We could not patch because the vendor went bankrupt" lands as an explanation of *how* the exposure arose. It is not a defence to the obligation to manage it. The operating risk sits on your balance sheet whether or not anyone could have written the fix, and carriers have already declined claims on orphaned hardware on the ground that the exposure was known and left uncontrolled. Vendor bankruptcy is a foreseeable event. Treating it as an act of God is what turns a manageable engineering problem into an uninsured one.

That reframing changes what your first move should be the day the cessation notice, or the news, arrives. It is not technical. It is registrative. Inventory which of your assets carry that maker's firmware, pull down and archive the last signed updates and documentation while the vendor's infrastructure is still reachable, and stamp the date support effectively ended into your NIS2 risk file for each affected asset. The CRA principle that already-issued security updates should stay available for years assumes a maker still standing to host them; a dissolved vendor's portal often goes dark the same week the administrators are appointed, taking the signed binaries and the release notes with it. Capturing that material before it disappears is frequently the difference between a documented, defensible legacy device and one you can no longer even restore to a known-good state.

## The routes back to a real manufacturer — and why they rarely fire

The CRA does leave doors open for the manufacturer's duty to re-attach to a living entity. They matter, because they explain why the obvious fixes usually don't produce one.

If someone places the orphaned product on the market under their own name or trademark — a successor buying the IP out of the estate, a distributor rebadging remaining stock — that party steps into the manufacturer's shoes and inherits its full support and vulnerability-handling obligations. If instead a party substantially modifies one of these devices and then makes it available on the market, Article 22 makes them the manufacturer of the modified product, with the support-period and vulnerability-handling duties that follow, for the part they touched, or the whole device where the change affects the product's cybersecurity as a whole.

Both routes share one hinge, and it is the hinge that traps brownfield operators. The duty only re-attaches when someone **makes the product available on the market**. An operator who reflashes its own orphaned PLC, for its own plant, and never supplies it to anyone, does not become its manufacturer. There is no market transaction to deem. So the intuitive move — "we'll just take the firmware over ourselves and maintain it in-house" — gives you the entire maintenance burden and conjures no new obligated manufacturer and no security update from anyone the CRA can hold to account. The route back to a *real* manufacturer's duty runs through a third party willing to adopt the product commercially: a support house, or an integrator productising a retrofit board and selling it on. It does not run through your own maintenance crew quietly keeping the lights on.

<!-- IMAGE-SLOT: tc-02-reattach-test | 1200x700 | alt: "A simple decision fork: 'Is the modified or rebadged device made available on the market?' Yes routes to a new deemed manufacturer under Article 22; No routes to 'still orphaned, operator carries it under NIS2'" | caption: "The duty only re-attaches to a living entity when the product is placed on, or made available on, the market. In-house maintenance never trips that switch." -->

That distinction decides your options long before you meet it. A device from a shaky single-source vendor and a device from a diversified maker with a live aftermarket are not the same risk, even when the silicon is identical, because only one of them has a plausible path to a successor who inherits the duty. Procurement is where you can see that difference and price it. The [spare-parts illusion](/blog/ep-3.01-the-spare-parts-illusion-demystifying-article-2-6-) covers the adjacent trap of assuming the replacement market keeps a product supported; orphaning by bankruptcy is the same lesson from the maker's side rather than the part's.

None of this is a reason to freeze procurement or to demand solvency guarantees no vendor can give. It is a reason to stop treating the manufacturer's existence as a permanent fact of the asset. Read the declared support-period end date at the buying table, yes — and then ask the harder question underneath it: if this company were gone by year three, what in my architecture already contains the device it leaves behind?

Pull your asset register and mark every device whose maker could disappear tomorrow without changing a single line of your own duty to keep it safe. That list is your real brownfield exposure, and no bankruptcy filing will ever make it shorter.
