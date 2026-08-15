# CRA Podcast Generation — Findings & Research Ledger

> **Research & Discovery Store:** Authoritative statutory cross-references, persona insights, competitor analysis, and script building blocks.

---

## 1. Primary Statutory References (OJ L 2024/2847)

* **Regulation (EU) 2024/2847:** Cyber Resilience Act (CRA), published 20 November 2024.
* **Key Dates:**
  * **10 September 2026:** Article 14 mandatory vulnerability & incident reporting obligations take effect (21 months post-entry into force).
  * **10 December 2027:** Full enforcement of all CRA obligations, CE marking requirements, and market surveillance penalties (36 months post-entry into force).
* **Penalty Caps (Article 64):**
  * Essential Requirements breach: up to **€15,000,000 or 2.5% of total worldwide annual turnover**.
  * Other obligations breach: up to **€10,000,000 or 2.0% of total worldwide annual turnover**.
  * Misleading information: up to **€5,000,000 or 1.0% of total worldwide annual turnover**.

---

## 2. Persona Psychographic & Technical Profiles

```
                       +----------------------------------+
                       |    PERSONA NEED MATRIX (JTBD)    |
                       +----------------------------------+
                                        |
         +----------------------+-------+-------+----------------------+
         |                      |               |                      |
         v                      v               v                      v
+------------------+   +------------------+ +------------------+ +------------------+
|      OEMs        |   |   SaaS / SW      | |  Integrators     | |   Distributors   |
+------------------+   +------------------+ +------------------+ +------------------+
| Annex III Class  |   | Article 14       | | Article 18       | | Article 19 & 20 |
| Testing & Modules|   | 24h/72h Clocks   | | Legacy OT Risk | | Verification    |
+------------------+   +------------------+ +------------------+ +------------------+
```

1. **Hardware & Component OEMs:**
   * Need exact rules on micro-controllers, gateway firmware, industrial PCs, and sensors.
   * Focus: Annex III Class I vs. Class II criteria and module selection (Self-assessment vs. Notified Body).
2. **Software & SaaS Vendors:**
   * Need clarity on Remote Data Processing (RDP) dependencies and open-source commercial stewardship.
   * Focus: Machine-readable SBOMs (CycloneDX/SPDX) and ENISA single reporting platform alerts.
3. **System Integrators & OT Operators:**
   * Need clarity on retrofits, Purdue Model network segmentation, and "substantial modification" triggers.
   * Focus: Maintenance of legacy OT assets without invalidating original manufacturer CE marks.
4. **Distributors & Importers:**
   * Need verification checklists before accepting stock from non-EU manufacturers.
   * Focus: EU Declaration of Conformity verification, technical documentation retention (10 years).

---

## 3. Competitor Analysis & Market Gap

* **Current Market Podcasts:** Most existing cybersecurity podcasts cover general headlines, threat intelligence, or enterprise cloud security (SOC2/ISO27001).
* **Market Gap:** **Zero podcasts** currently offer structured, article-by-article statutory breakdown combined with persona-specific engineering and commercial guidance for the EU Cyber Resilience Act.
* **Our Edge:** Combining pure legal statutory accuracy (citing exact Articles and Recitals) with practical OT/embedded engineering implementation guidance.

---

## 4. Voice & Dialogue Synthesizer Configuration

* **Engine:** Azure OpenAI Realtime API (`gpt-realtime-mini`) / NotebookLM dialogue synthesizer.
* **Host A (Legal Lead):** Voice `'onyx'` — Deep, calm, authoritative tone. Cites OJ L 2024/2847 Articles and Recitals.
* **Host B (Engineering Lead):** Voice `'nova'` — Dynamic, technical, practical tone. Focuses on firmware, SBOMs, build pipelines, and testing gates.
