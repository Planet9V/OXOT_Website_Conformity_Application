# Special Domain Regulations Overlay Report — 2026-08-13

Statutory overlay matrix mapping Machinery Regulation, DORA, GPSR, and Data Act provisions to the Cyber Resilience Act.

---

## 1. Executive Summary

Products with digital elements deployed in specialized sectors (financial entities, industrial machinery, consumer goods, smart IoT data streams) fall under sectoral EU regulations. This report defines boundary rules and overlap handling for CRA compliance.

---

## 2. Sectoral Statutory Overlap Matrix

### A. Machinery Regulation (Regulation (EU) 2023/1230)
- **Scope Overlap**: Industrial machinery with digital elements (control units, safety components, autonomous mobile robots).
- **Harmonized Provision**: Annex III Part 1.1.9 of Machinery Regulation mandates protection against corruption of safety control circuits. CRA Annex I Part I compliance satisfies the digital cybersecurity requirements of the Machinery Regulation.

### B. Digital Operational Resilience Act (DORA — Regulation (EU) 2022/2554)
- **Scope Overlap**: ICT systems, trading terminals, and financial software deployed in banking/investment institutions.
- **Harmonized Provision**: DORA Article 9 (ICT Systems Protection) and Article 10 (Vulnerability Management). Financial ICT vendors satisfying CRA Annex I and maintaining SBOMs meet DORA ICT third-party provider security standards.

### C. General Product Safety Regulation (GPSR — Regulation (EU) 2023/988)
- **Scope Overlap**: Connected consumer electronics (smart home devices, wearables, connected toys).
- **Harmonized Provision**: GPSR Article 6 requires consumer products to be safe under normal or reasonably foreseeable conditions. Cybersecurity vulnerabilities that pose physical safety risks (e.g. hacked smart door locks or medical monitors) violate GPSR. CRA compliance establishes presumption of cybersecurity safety under GPSR.

### D. Data Act (Regulation (EU) 2023/2854)
- **Scope Overlap**: Connected IoT products generating user data.
- **Harmonized Provision**: Data Act Article 3 & 4 mandate user access to generated data. CRA Annex I Part I(3) ensures encryption and authorization controls protecting user data in transit and at rest.

---

## 3. Statutory Boundary Summary Table

| Regulation | Primary Domain | Interoperability Rule |
| :--- | :--- | :--- |
| **Machinery Reg (EU 2023/1230)** | Industrial Safety & Machinery | CRA Annex I satisfies digital safety control circuit rules. |
| **DORA (EU 2022/2554)** | Financial ICT Systems | CRA SBOM & patch management satisfy DORA ICT vendor rules. |
| **GPSR (EU 2023/988)** | Consumer Product Safety | CRA compliance eliminates cybersecurity-induced physical safety risks. |
| **Data Act (EU 2023/2854)** | IoT Data Access & Sharing | CRA Part I(3) encryption protects shared data interfaces. |
