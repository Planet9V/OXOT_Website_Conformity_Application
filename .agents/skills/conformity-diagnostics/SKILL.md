---
name: conformity-diagnostics
description: Run on-demand diagnostic suites for Users, Portfolio, PSIRT, and Reports, verifying database wiring, entity relationships, and API health. Trigger on "run diagnostics", "system check", "diagnose oxot", "health audit", or when troubleshooting database/wiring issues.
---

# Conformity Diagnostics & System Health Skill

## Overview

This skill provides an on-demand, automated diagnostic engine to test, inspect, and verify the integrity of the OXOT Conformity Application across all core subsystems:
1. **Users & Team Management**: Session auth, cookie state, active member guards, and RBAC permissions.
2. **Portfolio & Product Cascades**: Product dossiers, CRA assessment progress calculations, letter grades, and deadline countdowns.
3. **PSIRT Engine**: Article 14 security advisories, CVE/CVSS 3.1 scoring, vulnerability intake, and statutory SLA clocks.
4. **Reports Engine**: Statutory dossier generation, section drafting/regeneration, SHA-256 signature sealing, and PDF export validation.

---

## When to Invoke

Activate this skill when:
- The user requests a **system check**, **diagnostics**, **health audit**, or **integrity verification**.
- Troubleshooting suspected database disconnects, broken wiring, or unhandled 401/500 API errors.
- Validating a release or container build before deployment.

---

## Execution Instructions

### 1. Run Automated Diagnostic Test Suite

To run all 20 diagnostic unit tests with formatted terminal output, execute:

```bash
cd artifacts/api-server && npx vitest run src/routes/__tests__/usersAndPermissions.test.ts src/routes/__tests__/portfolioEngine.test.ts src/routes/__tests__/psirtVulnerabilityEngine.test.ts src/routes/__tests__/statutoryReportsEngine.test.ts
```

### 2. Run Module-Specific Diagnostics

- **Users & Permissions**:
  ```bash
  cd artifacts/api-server && npx vitest run src/routes/__tests__/usersAndPermissions.test.ts
  ```
- **Portfolio & Product Cascades**:
  ```bash
  cd artifacts/api-server && npx vitest run src/routes/__tests__/portfolioEngine.test.ts
  ```
- **PSIRT Vulnerability Engine**:
  ```bash
  cd artifacts/api-server && npx vitest run src/routes/__tests__/psirtVulnerabilityEngine.test.ts
  ```
- **Statutory Reports Engine**:
  ```bash
  cd artifacts/api-server && npx vitest run src/routes/__tests__/statutoryReportsEngine.test.ts
  ```

---

## Diagnostic Output Verification

Ensure the execution output reports **100% passing tests** across all 4 modules:

- `usersAndPermissions.test.ts`: 5/5 passed
- `portfolioEngine.test.ts`: 5/5 passed
- `psirtVulnerabilityEngine.test.ts`: 4/4 passed
- `statutoryReportsEngine.test.ts`: 6/6 passed

Total: **20/20 Diagnostic Unit Tests Passed**.
