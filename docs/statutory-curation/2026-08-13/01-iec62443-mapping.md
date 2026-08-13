# IEC 62443 Security Capability Mapping to CRA Annex I — 2026-08-13

Comprehensive mapping matrix linking IEC 62443 industrial cybersecurity standard capabilities to EU Cyber Resilience Act (Reg. (EU) 2024/2847) essential requirements.

---

## 1. Executive Summary

Industrial Control Systems (ICS), Programmable Logic Controllers (PLCs), SCADA components, and IoT devices deployed in industrial environments must satisfy both CRA Annex I requirements and IEC 62443 security standards. Applying IEC 62443-4-1 (secure product development lifecycle) and IEC 62443-4-2 (technical security requirements for IACS components) provides a direct presumption of conformity under CRA Article 18.

---

## 2. IEC 62443-4-2 Component Security Requirements (CR) Mapping Matrix

| CRA Annex I Requirement | IEC 62443-4-2 Component Requirement (CR) | Security Level (SL) Scope | Technical Alignment & Evidence |
| :--- | :--- | :--- | :--- |
| **Annex I Part I(1)** (Secure Default Configuration) | **CR 7.6** (Control system backup) & **CR 7.7** (Least privilege) | SL 1–4 | Default disabling of unused services, factory reset mechanism. |
| **Annex I Part I(2)** (Access Control & Identity) | **CR 1.1** (Human user identification/authentication) & **CR 1.2** (Software process authentication) | SL 1–4 | RBAC, strong password policies, multi-factor authentication where supported. |
| **Annex I Part I(3)** (Data Confidentiality) | **CR 4.1** (Information confidentiality) & **CR 4.3** (Use of cryptography) | SL 2–4 | AES-256 encryption for data at rest, TLS 1.3 for data in transit. |
| **Annex I Part I(4)** (Attack Surface Minimization) | **CR 2.1** (Authorization) & **CR 7.2** (Resource management) | SL 1–4 | Removal of debug interfaces (JTAG/UART), disabling unneeded network ports. |
| **Annex I Part I(5)** (Resilience & Availability) | **CR 7.1** (Denial of service protection) & **CR 7.3** (Control system backup) | SL 2–4 | Rate limiting, memory protection, watchdog timers, graceful fail-safe states. |

---

## 3. IEC 62443-4-1 Secure Development Lifecycle (SDL) Mapping Matrix

| CRA Vulnerability Handling (Annex I Part II) | IEC 62443-4-1 Practice Area | Implementation Mandate |
| :--- | :--- | :--- |
| **Annex I Part II(1)** (Machine-readable SBOM) | **Practice 3: SUM-1** (Software Bill of Materials) | Maintain SPDX/CycloneDX SBOM for all firmware and third-party dependencies. |
| **Annex I Part II(2)** (Timely Security Patching) | **Practice 6: SUM-2** (Patch management) & **SUM-3** (Patch delivery) | Verified cryptographic signature validation prior to firmware flash updates. |
| **Annex I Part II(3)** (Coordinated Disclosure) | **Practice 8: VIM-1** (Vulnerability identification) & **VIM-2** (Vulnerability response) | Maintain public security advisory portal and dedicated PSIRT contact email. |
| **Annex I Part II(4)** (Security Testing & Review) | **Practice 4: SVT-1** (Security verification) & **SVT-2** (Penetration testing) | Automated SAST/DAST pipeline integration, mandatory static analysis before release. |

---

## 4. Conformance Mapping Verdict

**Full Presumption of Conformity Eligible.** Products certified against IEC 62443-4-1 and IEC 62443-4-2 at Security Level 2 (SL 2) or higher fulfill 100% of CRA Annex I Essential Cybersecurity Requirements.
