# Findings & Market Intelligence: OXOT Application

## Competitor Positioning Research Findings

### 1. Market Bifurcation
- **Binary & Firmware Scanners** (Cybellum, Finite State, OneKey):
  - *Strengths*: Deep binary disassembly, SBOM extraction, CVE detection.
  - *Weaknesses*: No EU Declarations of Conformity, no Annex VII Technical Files, no Notified Body audit workflows, no IEC 62443 / OT safety domain mapping.
- **IT Cloud GRC Platforms** (Vanta, Drata, Hyperproof, AuditBoard):
  - *Strengths*: Automated SOC 2 / ISO 27001 policy collection.
  - *Weaknesses*: Zero embedded hardware/software awareness, cannot ingest xBOMs, no CRA Article 14 24h/72h ENISA notification SLAs.

### 2. OXOT Core Value Proposition & Positioning
- **Target Category**: *All-in-One EU Industrial AI & Cyber Compliance Orchestrator*.
- **Primary Audience**: Industrial Automation OEMs (PLC/HMI/IIoT Edge), Robotics Manufacturers, and Safety-Component Suppliers.
- **Core Message**: "Build Once, Satisfy CRA + AI Act + Machinery Regulation + IEC 62443."

### 3. Key Statutory & Architectural Insights
- **OJEU Citation Gap**: Module A self-assessment for Important Class I products is currently blocked due to missing OJEU harmonised standards. Manufacturers must prepare Module B+C or H Notified Body audit packages.
- **Cryptographic Immature Proofs**: Evidence attachments must be SHA-256 fingerprinted (`createHash("sha256")`) to fulfill 10-year retention rules under CRA Article 13(14).
