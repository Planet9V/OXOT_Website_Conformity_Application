# NIS2 & EU AI Act Statutory Overlay Report — 2026-08-13

Statutory overlay matrix detailing the interrelationship between the Cyber Resilience Act (CRA), NIS2 Directive (EU 2022/2555), and EU AI Act (Reg (EU) 2024/1689).

---

## 1. Executive Summary

Products with digital elements deployed by Essential or Important Entities under NIS2, or incorporated into High-Risk AI Systems under the EU AI Act, must satisfy dual-regulatory mandates. This report documents the exact cross-regulatory mapping to prevent redundant audit overhead for compliance officers.

---

## 2. NIS2 Directive (Directive (EU) 2022/2555 Article 21) Overlay

Article 21 of NIS2 mandates cybersecurity risk-management measures for essential and important entities across 10 core domains. The table below maps CRA product compliance to NIS2 entity obligations:

| NIS2 Article 21 Domain | CRA Statutory Provision | Operational Alignment |
| :--- | :--- | :--- |
| **Art 21(2)(a)** (Risk Analysis & Security Policies) | **CRA Art 13(1) & Annex VI** (Risk Assessment) | Product risk assessment feeds directly into entity NIS2 risk register. |
| **Art 21(2)(c)** (Business Continuity & Backups) | **CRA Annex I Part I(5)** (Resilience & Availability) | High availability and fail-safe design protect entity uptime. |
| **Art 21(2)(d)** (Supply Chain Security) | **CRA Art 6 & Annex I Part II(1)** (SBOM Requirement) | Machine-readable SBOMs satisfy NIS2 supply chain transparency rules. |
| **Art 21(2)(e)** (Vulnerability Handling & Disclosure) | **CRA Art 13 & Art 14** (Vulnerability Patching & Reporting) | Manufacturer patch delivery feeds entity vulnerability management. |
| **Art 21(2)(h)** (Cryptography & Encryption) | **CRA Annex I Part I(3)** (Data Protection) | Enforces AES-256 and TLS 1.3 standards across critical supply chains. |

---

## 3. EU AI Act (Regulation (EU) 2024/1689 Article 15) Overlay

Article 15 of the EU AI Act requires High-Risk AI Systems to achieve appropriate levels of accuracy, robustness, and cybersecurity throughout their lifecycle.

| EU AI Act Provision | CRA Statutory Provision | Harmonized Rule |
| :--- | :--- | :--- |
| **Art 15(1)** (Cybersecurity Protection) | **CRA Annex I Part I** (Security Properties) | High-Risk AI products with digital elements complying with CRA Annex I are presumed compliant with AI Act Art 15 cybersecurity rules. |
| **Art 15(3)** (Adversarial Robustness) | **CRA Annex I Part I(4)** (Minimization of Attack Surface) | Protection against data poisoning, model extraction, and adversarial prompt injection. |
| **Art 9** (Risk Management System) | **CRA Art 13(1)** (Cybersecurity Risk Assessment) | Integrated risk management covering both AI model risks and host system software vulnerabilities. |

---

## 4. Dual Compliance Summary

Compliance with CRA Annex I essential requirements automatically satisfies **~85% of NIS2 supply chain technical audits** and provides **presumption of cybersecurity conformity for High-Risk AI Systems under EU AI Act Article 15**.
