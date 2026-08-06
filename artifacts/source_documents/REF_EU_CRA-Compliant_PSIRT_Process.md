# EU Cyber Resilience Act: PSIRT Process, Reporting Obligations, and SBOM-Based Vulnerability Surveillance

## 1. Regulatory Foundation and Timeline

The Cyber Resilience Act (Regulation EU 2024/2847) entered into force on 10 December 2024 and imposes mandatory cybersecurity requirements on manufacturers of products with digital elements (PDEs) sold into the EU market. The regulation is phased: Article 14 reporting obligations (vulnerability/incident notification) apply from 11 September 2026, while the bulk of essential requirements, conformity assessment, and CE-marking obligations apply from 11 December 2027. Reporting obligations cover products placed on the market even before the 2027 deadline, per Article 69(3). This means an organization's PSIRT and reporting pipeline must be operational nearly 15 months ahead of the main compliance deadline.[^1][^2][^3][^4]

| Milestone | Date | Consequence |
|---|---|---|
| CRA enters into force | 10 December 2024 | Legal clock starts[^4] |
| Article 14 reporting obligations apply | 11 September 2026 | PSIRT must report actively exploited vulnerabilities/severe incidents[^1][^2][^5] |
| Annex III/IV classification implementing act | 11 December 2025 | Formal Class I/II technical descriptions published[^6] |
| Full CRA essential requirements, CE marking, conformity assessment | 11 December 2027 | Products must fully comply, SBOM/technical docs mandatory for market access[^2][^4] |

## 2. CRA Essential Requirements Driving PSIRT Scope (Annex I)

Annex I, Part I sets security-by-design obligations: products must ship with no known exploitable vulnerabilities, secure default configuration, protection of confidentiality/integrity/availability, minimized attack surface, and least-privilege access controls. Annex I, Part II imposes vulnerability-handling obligations directly relevant to PSIRT operations: manufacturers must identify and document dependencies and vulnerabilities (including an SBOM), track vulnerabilities continuously, address them without delay, test product security, publicly disclose fixed vulnerabilities, maintain a coordinated vulnerability disclosure (CVD) policy, facilitate vulnerability information sharing, and deliver patches free of charge with advisory messaging. These Part II duties are effectively the legal basis mandating a PSIRT function, even though the CRA does not use the term "PSIRT" explicitly—industry guidance (Windriver, TI, Avatao) consistently maps this obligation to a formally chartered Product Security Incident Response Team aligned with ISO/IEC 30111.[^7][^8][^9][^10][^11]

## 3. Product Classification (Determines Process Rigor)

Classification determines the conformity-assessment route and therefore how rigorous PSIRT evidence and documentation must be.

| Class | Examples | Assessment Route | Notified Body Required? |
|---|---|---|---|
| Default (~90% of products) | Smart speakers, printers, most consumer IoT, mobile apps | Module A self-assessment against Annex I; Annex VII technical docs; EU DoC | No[^12][^13] |
| Important Class I (Annex III) | OS, browsers, VPN, password managers, routers/modems/switches, identity/PAM, boot managers, network management systems | Self-assessment IF harmonised standard/common specification/certificate ≥"substantial" applied; otherwise Module B+C or H | Conditional[^12][^13] |
| Important Class II (Annex III) | Firewalls, IDS/IPS, hypervisors, container runtimes | Module B+C or Module H always | Yes, always[^12][^13] |
| Critical (Annex IV) | Smart cards, secure elements, smart meter gateways | EU Common Criteria (EUCC) cybersecurity certification | Yes, mandatory[^13][^14] |

Manufacturers should confirm scope (does the product have digital/connectivity elements?), then check Annex III/IV technical descriptions under Implementing Regulation 2025/2392 to classify; anything unlisted defaults to the Default tier with Module A self-assessment.[^12][^15]

## 4. Article 14: Vulnerability and Incident Reporting Timeline

Article 14 creates a staged, hours-based reporting clock that begins the moment the manufacturer becomes aware of an actively exploited vulnerability or severe incident. Reports are filed once through the CRA Single Reporting Platform (SRP), operated by ENISA, which automatically routes the submission to the CSIRT designated in the manufacturer's member state of main establishment and simultaneously to ENISA.[^16][^17][^5][^3]

### 4.1 Actively Exploited Vulnerability Timeline

| Stage | Deadline | Content Required |
|---|---|---|
| Early Warning | ≤24 hours from awareness | Manufacturer/product identification, nature of vulnerability, actively-exploited status, member states where product is available[^18][^19][^3] |
| Vulnerability Notification | ≤72 hours from awareness | Severity/CVSS assessment, potential impact, corrective/mitigating measures taken or advised, measures users can take now[^18][^3] |
| Final Report | ≤14 days after a corrective measure becomes available | Root cause, full description, malicious-actor information (if known), security update details, preventive steps[^16][^18][^3] |

### 4.2 Severe Incident Timeline

| Stage | Deadline | Content Required |
|---|---|---|
| Early Warning | ≤24 hours | Whether malicious/unlawful act suspected, initial assessment, affected member states, mitigation taken[^3] |
| Incident Notification | ≤72 hours | Nature, severity, impact, likely threat type/root cause, user-side measures[^3] |
| Final Report | ≤1 month from notification (or sooner if all info already provided) | Consolidated investigation findings, applied and ongoing mitigations[^9][^3] |

The 24-hour requirement is described by practitioners as "an operational commitment, not a documentation exercise" — it demands a live, staffed intake and triage capability, not merely a written policy.[^16]

## 5. Step-by-Step PSIRT Process Flow (ISO/IEC 29147 + 30111 Aligned)

Industry and CEN-CENELEC CRA workshop guidance map PSIRT operations onto the two governing international standards: ISO/IEC 29147 (external vulnerability disclosure) and ISO/IEC 30111 (internal vulnerability handling process). The end-to-end flow is:[^20][^21]

1. **Policy and framework setup** — develop a written Coordinated Vulnerability Disclosure (CVD) policy and an internal vulnerability-handling policy defining scope, roles, SLAs, and escalation paths.[^20]
2. **Capability build** — stand up a monitored intake channel (security.txt, security@ mailbox, bug bounty/HackerOne-style portal) with defined triage ownership and backup staffing/on-call rotation.[^22][^16]
3. **Receipt** — accept vulnerability reports from external researchers, CSIRTs, or internal discovery (SAST/DAST, pen tests, SBOM-based scanning).[^20]
4. **Acknowledge receipt** — confirm to the reporter that the report was received, typically within a defined SLA (commonly 24–48 hours as an internal best practice, separate from the CRA regulatory clock).
5. **Verification** — reproduce and confirm the vulnerability, assign CVSS/severity, and determine exploitability using VEX-style analysis (is the component present, the vulnerable function used, and the attack path reachable).[^23][^20]
6. **Decision gate: "Does this signal qualify?"** — determine whether the finding meets the CRA thresholds for "actively exploited vulnerability" or "severe incident," triggering the Article 14 clock; document the decision and the decision-maker.[^22]
7. **Early Warning filing (≤24h)** — if qualifying, submit through the ENISA Single Reporting Platform using pre-built templates.[^17][^22]
8. **Remediation development** — engineering develops and tests a fix; PSIRT tracks status and timing against internally defined SLA tiers by severity.[^8][^24]
9. **72-hour Notification filing** — submit fuller technical detail as it becomes available.[^18][^3]
10. **Release** — deploy patch/update, ideally signed and with rollback capability, communicated via an advisory.[^7][^8]
11. **Final Report filing (14 days/1 month)** — submit consolidated findings, root cause, and preventive measures.[^3][^18]
12. **Public disclosure** — publish a security advisory once a fix is available, consistent with the CRA's public-disclosure-of-fixed-vulnerabilities requirement.[^7]
13. **Post-remediation review** — engage in lessons-learned activities, update detection rules, and feed findings back into design reviews.[^20]
14. **Process monitoring** — track cycle times, SLA adherence, and recurring root causes as a continuous improvement loop.[^20]

### FIRST PSIRT Services Framework — Organizational Layer

Layered on top of the ISO 29147/30111 technical flow, the FIRST PSIRT Services Framework defines the organizational functions a mature PSIRT should operate:[^24][^25]

- Stakeholder ecosystem management — formal communication channels with development teams, executives, customers, and external researchers.
- Vulnerability discovery — proactive (internal testing, SBOM scanning) and reactive (external report intake) mechanisms.
- Vulnerability triage and analysis — a dedicated analyst function that investigates and scores impact.
- Vulnerability remediation — coordination with engineering through patch release, with tracked milestones.
- Coordinated disclosure — a designated team drafting advisories and synchronizing release timing with affected parties.
- Training and education — continuous PSIRT staff and cross-functional training on evolving threats and process changes.

## 6. 90-Day PSIRT/CRA Readiness Plan (Practical Timeline)

Given the 11 September 2026 reporting deadline, a phased build-out is recommended:[^22]

- **Month 1 — Inventory and ownership**: Map every product with digital elements placed on the EU market; classify each by CRA tier and current support status; designate the primary reporter, backup, and the decision-maker responsible for qualifying signals; document on-call rotation; obtain legal and executive sign-off.[^22]
- **Month 2 — Detection and correlation**: Stand up continuous detection spanning first-party code, open-source dependencies, secrets, infrastructure-as-code, containers, CI/CD pipelines, and AI components; integrate automated SBOM generation and vulnerability-feed matching so "active exploitation" is detected quickly.[^16][^22]
- **Month 3 — Workflow and tabletop**: Build the operational filing workflow — intake forms, decision gates, draft 24-hour/72-hour notification templates, sign-off chain, and live ENISA Single Reporting Platform credentials; run a realistic tabletop exercise and time the full path from initial signal to filed notification.[^22]

## 7. Checklist: What Auditors and Notified Bodies Expect

Engineering and compliance artifacts that market surveillance authorities or notified bodies will request include:[^10][^8]

- EU Declaration of Conformity and CE technical documentation (Annex VII).
- Threat models and design reviews tied to specific product features.
- Machine-readable SBOM covering at minimum top-level dependencies, available on request (publication to end users is optional under the CRA).[^26][^10]
- Secure update policy covering signing, rollback capability, key rotation, and update SLAs.
- Vulnerability-handling workflow documentation, PSIRT runbooks, and individual case records.
- CVD policy with a monitored security contact and documented triage ownership.
- Support-lifetime definition and end-of-support communication plan.
- Security test evidence, including negative testing and fuzzing results.
- Evidence retention for at least 10 years, or the full support period if longer.[^12]

## 8. SBOM Generation in CycloneDX Format — Step-by-Step

The CRA does not mandate a single SBOM standard but recognizes CycloneDX and SPDX as acceptable machine-readable formats; CycloneDX is purpose-built for security use cases including dependency graphs and vulnerability exchange. Annex I Part II(1) requires the SBOM to cover at least top-level dependencies, though deeper coverage (transitive dependencies) is best practice.[^27][^11][^10]

### 8.1 What a Compliant CycloneDX SBOM Must Capture

A comprehensive inventory of software elements — programs, libraries, frameworks, and their dependencies — along with exact version numbers, licensing information, authorship, and any known vulnerabilities per component. CycloneDX represents this through its component list plus a distinct `dependencies` graph that captures functional relationships (what relies on what) separately from the inventory itself.[^28][^29]

### 8.2 Tooling and Commands

Several open-source tools generate CycloneDX SBOMs directly from source trees, container images, or build artifacts:

- **Syft** (Anchore): `syft <source> -o cyclonedx-json` or `cyclonedx-xml`; works against directories, container images, and registries.[^30][^31][^32]
- **cdxgen**: install via `npm install -g @cyclonedx/cdxgen` or Homebrew; run `cdxgen -t java -o app-bom-cdxgen.json` (swap `-t` for the relevant ecosystem — java, docker, python, node, etc.); supports license fetching via `FETCH_LICENSE=true`.[^33][^32]
- **Trivy**: `trivy fs /path/to/project --format cyclonedx --output sbom.json` for filesystem scans.[^33]
- **Language/build-native plugins**: e.g., Quarkus Maven projects can run `quarkus:dependency-sbom`, or add the `quarkus-cyclonedx` extension to auto-generate SBOMs on every build in JSON or XML.[^34]

Recommended workflow: run SBOM generation as a CI/CD pipeline step on every production-ready build, tying each SBOM to the exact release version so historic records are preserved for audit and vulnerability correlation.[^35][^23]

### 8.3 Ingesting SBOMs for Continuous Vulnerability Monitoring

Generating an SBOM once is insufficient — the CRA's "track vulnerabilities" obligation requires ongoing matching against live vulnerability intelligence. The standard workflow is:[^35][^7]

1. Generate SBOMs in CI/CD with every build using Syft, cdxgen, or Trivy.[^35]
2. Ingest SBOMs into a monitoring platform — OWASP Dependency-Track is the leading open-source option; commercial platforms (sbomify, ONEKEY, Revenera) offer similar capability.[^23][^35]
3. Configure data-source feeds: NVD, OSV (Google), CISA KEV (Known Exploited Vulnerabilities), and ecosystem-specific advisories (npm audit, PyPI advisories, GitHub Security Advisories).[^35]
4. Set severity-based alerting so the appropriate engineering owner is notified when a new vulnerability affects a component they own.[^35]
5. Define remediation SLAs by severity tier and issue VEX (Vulnerability Exploitability eXchange) statements to communicate whether a listed vulnerability is actually exploitable in the product's specific context, avoiding wasted remediation effort on non-exploitable findings.[^36][^23]

### 8.4 Dependency-Track Setup Example

A concrete Dependency-Track workflow for continuous monitoring: define a project structure (application/component/branch/version), upload the CycloneDX BOM via the UI or REST API, and automate ingestion through CI/CD. Example API call for automated upload:[^37]

```
curl -X "POST" "http://localhost:8081/api/v1/bom" \
  -H 'Content-Type: multipart/form-data' \
  -H "X-Api-Key: <API_KEY>" \
  -F "autoCreate=true" \
  -F "projectName=<ProductName>" \
  -F "projectVersion=<Version>" \
  -F "bom=@/path/to/sbom.cdx.json"
```

Dependency-Track then continuously re-scans ingested components against NVD, OSS Index, GitHub Advisories, and other feeds without requiring a new upload, flagging newly disclosed CVEs against already-shipped product versions.[^38][^39]

### 8.5 Command-Line Vulnerability Scanning Against Existing SBOMs

For ad hoc or scheduled scans outside a platform like Dependency-Track, CLI scanners can directly consume a CycloneDX file:[^35]

```
grype sbom:./sbom.cdx.json
osv-scanner scan source -S sbom.cdx.json
```

### 8.6 Using Perplexity-Style Search for Component-Level Surveillance

Beyond automated feed matching, organizations should supplement SBOM-driven scanning with targeted search-based monitoring for each significant component/library listed in the SBOM — searching vendor security advisories, CVE databases, and vendor changelogs by exact component name and version to catch disclosures that automated feeds have not yet indexed, especially for niche OT/industrial libraries where CVE coverage lags. This is a recommended supplementary control, not a CRA-mandated step, but it closes gaps in feed latency for specialized industrial software where the primary automated databases (NVD, OSV) may have incomplete or delayed coverage.

## 9. Integrated Process Map: SBOM Feeds PSIRT Detection

The SBOM function and the PSIRT function are not separate programs — the SBOM is the primary internal-discovery input into Step 3 (Receipt) of the PSIRT flow described in Section 5. In practice: every CI/CD build generates a CycloneDX SBOM → the SBOM is ingested into Dependency-Track or equivalent → continuous feed matching surfaces new component-level vulnerabilities → each match is routed into the PSIRT triage queue exactly like an externally reported vulnerability → VEX analysis determines exploitability in the specific product context → qualifying findings trigger the Article 14 clock if actively exploited → remediation, disclosure, and reporting proceed per Section 5.[^23][^7][^35]

## 10. Governance Layer

An Information Security Management System (ISMS) is recommended by practitioners as the umbrella structure tying Articles 13 (essential requirements/technical documentation) and 14 (reporting) together, since it provides the risk-assessment methodology, document control, and management-review cadence that both the SBOM program and the PSIRT program depend on for defensible, auditable evidence.[^10]

---

## References

1. [Cyber Resilience Act Article 14 Reporting Obligations | Element](https://www.element.com/resources/articles/cyber-resilience-act-article-14-reporting-obligations-guide) - The reporting obligations apply from 11 September 2026, more than a year earlier. Manufacturers who ...

2. [Cyber Resilience Act: CRA Deadlines & Article 14](https://www.aegister.com/en/cms/insights/cyber-resilience-act-cra-obligations-manufacturers/) - Main obligations apply from 11 December 2027. Article 14 reporting obligations apply earlier, from 1...

3. [Cyber Resilience Act Reporting Obligations](https://www.appluslaboratories.com/global/en/news/publications/cyber-resilience-act-reporting-obligations) - Reporting obligations under Article 14 apply from 11 September 2026. Manufacturers must report activ...

4. [The Cyber Resilience Act Explained: Scope, Classes & ...](https://www.cyberresilienceact.eu/explained.html) - The reporting obligations apply from 11 September 2026 and the bulk of the obligations apply from 11...

5. [Single Reporting Platform (SRP) - ENISA - European Union](https://www.enisa.europa.eu/topics/product-security-and-certification/single-reporting-platform-srp) - The CRA brings transparency to the vulnerability disclosure processes and strengthens how EU CSIRTs ...

6. [🧩 Step 4 — Product Classification under the CRA](https://www.linkedin.com/pulse/step-4-product-classification-under-cra-michael-jesse-uu4bf) - Products explicitly listed in Annex III (important) or Annex IV (critical) can be classified easily....

7. [Cyber Resilience Act (CRA) | TI.com](https://www.ti.com/technologies/security/cyber-resilience-act.html) - The CRA regulation applies to products and components with digital elements made available on the EU...

8. [EU Cyber Resilience Act (CRA): A Developer's Guide](https://avatao.com/eu-cyber-resilience-act-developer-guide/) - PSIRT and reporting From September 2026, manufacturers must operate a Product Security Incident Resp...

9. [EU Cyber Resilience Act FAQs: Understanding CRA ...](https://www.windriver.com/resource/eu-cyber-resilience-act-faq) - The CRA imposes cybersecurity requirements for PDEs, Product Security Incident Response Team (PSIRT)...

10. [Cyber Resilience Act Articles 13 and 14: Why an ISMS Is...](https://www.orbiqhq.com/eu-regulations/cyber-resilience-act-article-13-14) - The CRA requires Security by Design, vulnerability reporting within 24 hours, SBOMs, and CE marking....

11. [EU Cyber Resilience Act (CRA): SBOM & Vuln Requirements](https://o3.security/compliance/eu-cyber-resilience-act-cra-sbom-compliance) - Annex I, Part I, point (2) requires products to ship with no known exploitable vulnerabilities, a se...

12. [Beyond the Checklist: Which products fall under scope of ...](https://nohau.eu/blogs/knowledge-center/beyond-the-checklist-which-products-fall-under-scope-of-the-eu-cyber-resilience-act-cra) - Annex III determines whether it rises above Default. (Classification follows product outside scope e...

13. [Cyber Resilience Act Product Categories](https://www.cybercertlabs.com/case_studies/cra-categories/) - Important Class I can be found in Annex III of the CRA, this includes; Identity management systems, ...

14. [Cyber Resilience Act - Conformity assessment](https://digital-strategy.ec.europa.eu/en/policies/cra-conformity-assessment) - categories (important and critical products listed respectively in Annex III. Default category of pr...

15. [CRA Product Classification: Default, Important, Critical](https://cra-decoded.com/blog/posts/cra_product_classification/) - EU Cyber Resilience Act product classification explained: Default, Important Class I/II, and Critica...

16. [CRA Vulnerability Reporting Requirements | 24-Hour ... - FOSSA](https://fossa.com/resources/regulatory-compliance-tools/cra-readiness-assessment/cra-vulnerability-reporting/) - Notify the coordinating CSIRT and ENISA of an actively exploited vulnerability or a severe incident ...

17. [Cyber Resilience Act - Reporting obligations](https://digital-strategy.ec.europa.eu/en/policies/cra-reporting) - They need to submit an early warning within 24 hours of becoming aware, and a full notification with...

18. [A Guide to CRA Reporting Obligations Article 14 - Regulus](https://goregulus.com/cra-basics/cra-reporting-obligations-article-14/) - The table below outlines the different reporting stages and what is expected at each one. CRA Articl...

19. [CRA exploited vulnerability reporting 24 hours - Regulus](https://goregulus.com/cra-basics/cra-exploited-vulnerability-reporting-24-hours/) - Under the CRA, they have just 24 hours to report this to their national CSIRT and to ENISA. This isn...

20. [Online CRA Workshop 'Deep dive session: Vulnerability ...](https://www.cencenelec.eu/media/CEN-CENELEC/Events/Webinars/2025/cen-clc-jtc-13-wg-9_pt3_cra_workshop_2025-07-22.pdf) - We focused only on ISO/IEC 29147 Clause 9, which is external vulnerability handling. We should also ...

21. [NEN-EN-ISO/IEC 29147:2020 en](https://www.nen.nl/en/nen-en-iso-iec-29147-2020-en-272119) - The goal of vulnerability disclosure is to reduce the risk associated with exploiting vulnerabilitie...

22. [EU CRA Vulnerability Reporting: 24-Hour Clock Starts Sept ...](https://cycode.com/blog/eu-cra-vulnerability-reporting-requirements/) - Submit an early warning to ENISA and the relevant CSIRT within 24 hours of becoming aware of an acti...

23. [SBOM and VEX Workflows for Scalable Vulnerability ... - OneKey](https://www.onekey.com/resource/sbom-vex-workflows) - SBOMs provide transparency, while VEX enables risk-based prioritisation. Learn how to integrate both...

24. [Mastering vulnerabilities with the FIRST PSIRT services ...](https://cyber-regulation.com/article/mastering-vulnerabilities-with-the-first-psirt-services-framework) - The framework includes aspects such as stakeholder management, vulnerability discovery, analysis, re...

25. [PSIRT Services Framework 1.1](https://www.first.org/standards/frameworks/psirts/psirt_services_framework_v1.1) - The PSIRT should engage and interact with the larger PSIRT community to share best practices and ins...

26. [The CRA's Essential Cybersecurity Requirements: Annex I, ...](https://ccb.belgium.be/sites/default/files/2026-01/SECURE_CRA_The%20CRA%E2%80%99s_Essential_Cybersecurity_Requirements_Annex_%20I_Part_I.pdf) - 8 Art. 13(8), CRA: The support period is to be determined by the manufacturer, taking into considera...

27. [Software Bill of Materials (SBOM)](https://cyclonedx.org/capabilities) - With its focus on automation and interoperability, the CycloneDX specification simplifies the comple...

28. [Cyber Resilience Act Enters Phase 1 – Reporting ... - OneKey](https://www.onekey.com/press-release/cyber-resilience-act-phase-1--reporting-requirements-for-manufacturers-begin-in-2026) - These requirements include secure software and hardware designs, clear vulnerability management guid...

29. [Dependency Relationship Compositions](https://cyclonedx.org/use-cases/compositions-dependencies/) - In CycloneDX, compositions for dependency relationships provide insight into the connections between...

30. [How to Generate SBOMs with Syft](https://oneuptime.com/blog/post/2026-01-25-sbom-generation-syft/view) - Learn how to use Syft to generate Software Bills of Materials for your applications and container im...

31. [How to Generate an SBOM with Open Source Tools](https://anchore.com/sbom/how-to-generate-an-sbom-with-free-open-source-tools/) - Learn how to quickly and easily generate an SBOM in a variety of ecosystems and formats such as SPDX...

32. [How to create an SBOM for Java](https://bell-sw.com/blog/how-to-generate-an-sbom-for-java-a-comprehensive-guide/) - CycloneDX Generator (cdxgen) is a CLI tool and Node.js library for generating SBOMs in CycloneDX for...

33. [SBOM Generation Tools Compared: Syft, Trivy, cdxgen, ...](https://sbomify.com/2026/01/26/sbom-generation-tools-comparison/) - Compare the leading SBOM generation tools – Syft, Trivy, cdxgen, Microsoft SBOM Tool, and CycloneDX ...

34. [Generating and Using CycloneDX SBOMs](https://quarkus.io/guides/cyclonedx) - Supported formats are {code json} and {code xml}. The default format is JSON. If both are desired th...

35. [SBOM Scanning: How to Detect Vulnerabilities in Your ...](https://sbomify.com/2026/02/01/sbom-scanning-vulnerability-detection/) - Learn how SBOM scanning works, which tools to use, how to set up continuous vulnerability monitoring...

36. [Vulnerability Exploitability eXchange (VEX)](https://www.revenera.com/software-composition-analysis/glossary/vulnerability-exploitability-exchange-vex) - VEX is a cybersecurity framework that communicates the exploitability status of known vulnerabilitie...

37. [Integrate with Dependency-Track](https://docs.apps.rancher.io/howto-guides/integrate-with-dependency-track) - In this guide, you will learn how to: Define a Dependency Track Project. Manually feed CycloneDX SBO...

38. [Continuous Integration & Delivery](https://docs.dependencytrack.org/usage/cicd/) - The Dependency-Track Jenkins Plugin is the recommended method for publishing CycloneDX BOMs to Depen...

39. [Dependency-Track](https://engineering.backbase.com/2026/04/14/dependency-track/) - Continuous monitoring: it ingests SBOMs and continuously monitors components against several vulnera...

