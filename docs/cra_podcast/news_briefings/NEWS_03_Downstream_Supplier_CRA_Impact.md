# [CRA News Briefing 03] Downstream Supply Chain Impact: What Component & Software Providers Must Deliver

> **Format:** 2-Minute Executive News Briefing  
> **Presenter:** Jim Mckenney (Digital Product Security Consultant)  
> **Series:** The CRA Briefing — Industry News Stream  
> **Focus:** Contractual Flow-Downs, SBOM Data, and Vulnerability SLAs for Component Suppliers

---

## TRANSCRIPT

[JIM MCKENNEY]
Welcome back to The CRA Briefing. I'm Jim Mckenney with an executive news update for software component providers, chipmakers, and RTOS developers under Regulation [pronunciation: EU twenty-twenty-four slash twenty-eight-forty-seven]. Standard disclaimer: this news briefing provides technical commentary, not formal legal advice.

If your company develops microcontrollers, software libraries, operating systems, or SDKs that are integrated into other companies' finished products, you might assume the CRA doesn't apply to you because you don't place finished products on the EU market under your own brand.

That assumption is creating a massive blind spot across the supply chain.

Under Article 10(6) and Annex I Part II, the equipment manufacturer who affixes the CE mark is legally responsible for the security of every third-party component inside their product. If your software library or RTOS contains an unpatched vulnerability, the OEM faces fines up to 15 million euros or 2.5 percent of global turnover.

As a result, major OEMs are pushing mandatory contractual security requirements down to all tier-two and tier-three suppliers. To remain an approved vendor, you will be required to provide:

First: Automated, machine-readable Software Bills of Materials in CycloneDX or SPDX format for every release.

Second: A 24-hour vulnerability disclosure Service Level Agreement to notify your OEM customers when zero-days are identified in your code.

Third: Guaranteed security patch delivery matching the OEM's declared product support lifetime—minimum five years.

Upstream component vendors who deliver transparent SBOMs and rapid security patches will dominate European supply chains. Those who don't will be replaced.


Until next time: build secure by design, ship with confidence. I'm Jim Mckenney—thanks for listening.