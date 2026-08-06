## 16. CycloneDX Specification Overview (Current Version 1.7)

CycloneDX is an OWASP Foundation project and an internationally ratified standard: v1.6 was ratified as ECMA-424 1st Edition in June 2024, and v1.7 — released late October 2025 — is expected to become ECMA-424 2nd Edition. CycloneDX is a "full-stack" BOM standard built on a single unified document model consisting of eight primary root-level elements: metadata, components, services, dependencies, compositions, vulnerabilities, formulation, and annotations — with citations added as a ninth root-level element in v1.7. This single schema supports eleven distinct BOM "use-case views" over the same underlying data model:[^1][^2][^3][^4][^5]

| BOM Type | Full Name | Primary Purpose |
|---|---|---|
| SBOM | Software Bill of Materials | Inventory of software components, libraries, and dependencies[^6] |
| HBOM | Hardware Bill of Materials | Inventory of physical hardware devices and embedded firmware[^7][^8] |
| SaaSBOM | Software-as-a-Service Bill of Materials | Inventory of services/APIs/microservices composing a cloud-native application[^9] |
| ML-BOM / AI-BOM | Machine Learning Bill of Materials | Inventory of AI/ML models, datasets, and training/inference dependencies[^10][^11] |
| CBOM | Cryptography Bill of Materials | Inventory of cryptographic algorithms, keys, certificates, and protocols[^12][^13] |
| MBOM | Manufacturing Bill of Materials | "As-built" record of what was actually manufactured, vs. design intent[^14][^15] |
| OBOM | Operations Bill of Materials | Runtime/operational inventory of a deployed system[^1][^16] |
| VDR | Vulnerability Disclosure Report | Known vulnerabilities affecting a product, with remediation plans[^17][^18] |
| VEX | Vulnerability Exploitability eXchange | Exploitability status of vulnerabilities in specific product context[^19][^20] |
| BOV | Bill of Vulnerabilities | Standalone catalog of vulnerability data independent of a specific product[^1] |
| CDXA | CycloneDX Attestations | Signed, verifiable claims about how components/BOMs were produced[^21][^22] |

Critically, all these are **views of the same document schema**, not separate file formats — a single CycloneDX JSON file can mix `type: device` (hardware), `type: firmware`, `type: application`, `type: machine-learning-model`, and `type: cryptographic-asset` components in one unified inventory. This directly informs the Postgres design in Section 20: one normalized `components` table with a `component_type` discriminator column can serve every BOM type.[^8][^1]

## 17. Root-Level BOM Document Schema (Applies to Every BOM Type)

Every CycloneDX document, regardless of which BOM "view" it represents, shares the same envelope structure:[^23][^24]

| Attribute | Type | Description | Postgres Column Suggestion |
|---|---|---|---|
| bomFormat | string (const "CycloneDX") | Identifies the file as CycloneDX[^23][^24] | `bom_format VARCHAR(20)` |
| specVersion | string | Spec version the BOM conforms to (e.g. "1.7")[^23] | `spec_version VARCHAR(10)` |
| serialNumber | string (URN UUID, RFC 4122) | Unique BOM identifier, format `urn:uuid:...`[^23] | `serial_number UUID` |
| version | integer | Document version; increment on each edit[^23][^24] | `bom_version INTEGER DEFAULT 1` |
| metadata.timestamp | ISO 8601 datetime | Creation date/time of the BOM[^23][^24] | `created_at TIMESTAMPTZ` |
| metadata.tools | array of objects | Tool(s) used to generate the BOM (vendor, name, version)[^24] | separate `bom_tools` table (FK to bom) |
| metadata.authors | array of objects | Person(s) who authored the BOM, with optional email[^24] | separate `bom_authors` table (FK to bom) |
| metadata.component | object | The top-level component the BOM describes[^24] | `subject_component_id UUID` FK |
| metadata.supplier | object | Organization supplying the top-level component[^24] | `supplier_id UUID` FK to `organizations` |
| metadata.properties | array of name/value pairs | Free-form metadata, including SBOM-type tag[^24] | separate `bom_properties` table |
| components | array | The component inventory (see Section 18)[^25] | `components` table, FK `bom_id` |
| services | array | Service inventory (used heavily by SaaSBOM)[^9] | `services` table, FK `bom_id` |
| dependencies | array | Dependency graph edges[^24][^26] | `dependencies` table (ref, depends_on) |
| compositions | array | Completeness assertions (complete/incomplete/unknown)[^27] | `compositions` table |
| vulnerabilities | array | Vulnerability records (VDR/VEX/BOV use this)[^19][^17] | `vulnerabilities` table |
| formulation | array | Manufacturing/build/deploy process description (MBOM/OBOM)[^15][^28] | `formulations` table |
| annotations | array | Free-text or structured commentary tied to bom-refs[^5] | `annotations` table |
| citations (new in 1.7) | array | Provenance of BOM data — source, tool, responsible party[^3][^4] | `citations` table |

## 18. SBOM Schema — Component Object (Core Table for All BOM Types)

The `component` object is the atomic unit shared across every BOM type, differentiated only by its `type` enum value and type-specific nested properties.[^13][^29]

| Attribute | Type | Description | Postgres Column |
|---|---|---|---|
| bom-ref | string | Unique internal identifier used for cross-referencing within the BOM[^25][^24] | `bom_ref VARCHAR(255) PRIMARY KEY` or unique index |
| type | enum | application, framework, library, container, operating-system, device, firmware, file, crypto-asset, machine-learning-model, data, platform[^13][^29] | `component_type VARCHAR(30)` |
| name | string (required) | Component name, 1–255 chars[^30] | `name VARCHAR(255) NOT NULL` |
| version | string | Component version, 1–255 chars[^30] | `version VARCHAR(255)` |
| group | string | Namespace/group (e.g. Maven groupId)[^31] | `group_name VARCHAR(255)` |
| author | string/object | Person(s)/organization(s) that authored the component[^24] | FK to `contributors` table |
| supplier | object | Organization that supplied the component[^24][^25] | FK to `organizations` |
| purl | string | Package-URL — universal package identifier[^25][^29] | `purl TEXT` |
| cpe | string | Common Platform Enumeration identifier[^25][^29] | `cpe TEXT` |
| swid | object | Software Identification Tag (ISO/IEC 19770-2:2015)[^25][^29] | FK to `swid_tags` |
| swhid | string | Software Heritage Identifier[^25] | `swhid TEXT` |
| hashes | array | Cryptographic hash digests (SHA-256, SHA-512, etc.) of the component[^25][^29] | `component_hashes` table (alg, content) |
| licenses | array | License(s), SPDX ID or named/expression[^24] | `component_licenses` table |
| copyright | string | Copyright statement | `copyright TEXT` |
| description | string | Free-text description | `description TEXT` |
| scope | enum | required / optional / excluded | `scope VARCHAR(20)` |
| externalReferences | array | Links to VCS, website, docs, issue tracker, etc. | `external_references` table |
| occurrences | array | Locations where the component is present (paths/environments)[^25] | `component_occurrences` table |
| pedigree | object | Ancestry/lineage: ancestors, descendants, variants, commits, patches, diff[^31] | `component_pedigree` table |
| evidence (new depth in 1.7) | object | Confidence score and technique used to identify the component[^22] | `component_evidence` table |
| properties | array | Free-form name/value extension pairs[^32] | `component_properties` table |

## 19. Detailed Schema by BOM Type

### 19.1 SBOM (Software Bill of Materials)

| Attribute | Description | Postgres Column |
|---|---|---|
| component.type = library/framework/application/os/container | Standard software component types[^29] | `component_type` |
| purl | Package identifier, format `pkg:type/namespace/name@version?qualifiers` | `purl TEXT` |
| dependencies.ref / dependsOn | Graph edges between bom-refs[^24][^26] | `dependencies(ref, depends_on)` |
| licenses | License info per component | `component_licenses` |
| externalReferences | VCS URL, distribution URL, website | `external_references` |

### 19.2 HBOM (Hardware Bill of Materials)

| Attribute | Description | Postgres Column |
|---|---|---|
| component.type = "device" | Physical hardware (chip, chipset, processor); available since v1.1[^8][^29] | `component_type = 'device'` |
| component.type = "firmware" | Embedded software on the device; added v1.2 (May 2020)[^8] | `component_type = 'firmware'` |
| manufacturer | Hardware manufacturer name | `manufacturer_id` FK |
| hardware version / stepping | Physical revision identifier, stored in `version` field | `version VARCHAR(255)` |
| dependencies (device→firmware link) | Relationship linking a device to its firmware image[^8] | `dependencies` table |
| cpe (recommended for hardware) | CPE preferred identifier for hardware vulnerability matching[^33] | `cpe TEXT` |

### 19.3 SaaSBOM (Software-as-a-Service Bill of Materials)

| Attribute | Description | Postgres Column |
|---|---|---|
| provider | Organization supplying the service, with contact/support URLs[^9] | `provider_id` FK to `organizations` |
| endpoints | URLs/APIs where the service can be invoked[^9] | `service_endpoints` table |
| data.classification | Data type handled (PII, PIFI, public)[^9] | `data_classification VARCHAR(50)` |
| data.flow | Direction: inbound/outbound/bi-directional[^9] | `data_flow VARCHAR(20)` |
| data.source / data.destination | URL or BOM-Link pointing to origin/destination[^9] | `data_source TEXT`, `data_destination TEXT` |
| data.governance | Roles managing data access/compliance[^9] | `data_governance` table |
| license.licensing | Commercial license terms (licensor/licensee)[^9] | `service_licensing` table |
| license.licenseTypes | Subscription/perpetual, etc.[^9] | `license_type VARCHAR(30)` |
| license.lastRenewal / expiration | Lifecycle dates[^9] | `last_renewal DATE`, `expiration DATE` |

### 19.4 CBOM (Cryptography Bill of Materials)

| Attribute | Description | Postgres Column |
|---|---|---|
| component.type = "crypto-asset" | Crypto-asset component category, added v1.6[^12][^13] | `component_type = 'crypto-asset'` |
| cryptoProperties.assetType | algorithm / certificate / protocol / related-material / key[^12] | `crypto_asset_type VARCHAR(30)` |
| algorithmProperties.primitive | block-cipher, hash, stream-cipher, signature, etc.[^12] | `primitive VARCHAR(50)` |
| algorithmProperties.mode | CBC, GCM, ECB, etc.[^12] | `mode VARCHAR(20)` |
| algorithmProperties.padding | Padding scheme used[^12] | `padding VARCHAR(30)` |
| algorithmProperties.keyLength / parameterSetIdentifier | Key length (e.g. 2048-bit RSA) or curve name[^12] | `key_length INTEGER`, `curve_name VARCHAR(50)` |
| algorithmFamily (new in 1.7) | Standardized cryptographic algorithm family list[^3][^4] | `algorithm_family VARCHAR(50)` |
| ellipticCurve (new in 1.7, deprecates `curve`) | Standardized elliptic curve list for PQC readiness[^3][^4] | `elliptic_curve VARCHAR(50)` |
| certificateProperties.subjectName / issuerName | X.509 certificate identity fields[^12] | `subject_name TEXT`, `issuer_name TEXT` |
| certificateProperties.notValidBefore / notValidAfter | Validity period[^12] | `not_valid_before TIMESTAMPTZ`, `not_valid_after TIMESTAMPTZ` |
| certificateProperties.certificateState | Array of pre-defined or custom certificate states[^34] | `certificate_states` table |
| relatedCryptoMaterialProperties.type | private-key, public-key, key-pair, password, shared-secret, token[^12] | `material_type VARCHAR(30)` |
| relatedCryptoMaterialProperties.size / format | Key size and encoding (PEM, DER, PKCS#8)[^12] | `key_size INTEGER`, `format VARCHAR(20)` |
| relatedCryptoMaterialProperties.securedFor | HSM-stored or encrypted flag[^12] | `secured_storage BOOLEAN` |
| oid | Object Identifier for precise algorithm/parameter ID[^12] | `oid VARCHAR(100)` |
| dependencyType (provides/uses/implements) | Extended dependency relationship types for crypto usage[^13][^21] | `dependency_type VARCHAR(20)` |

### 19.5 ML-BOM / AI-BOM (Machine Learning Bill of Materials)

| Attribute | Description | Postgres Column |
|---|---|---|
| component.type = "machine-learning-model" | Model as a first-class component[^10] | `component_type = 'machine-learning-model'` |
| modelCard.modelParameters | Architecture, hyperparameters, task type[^10] | `model_parameters` JSONB |
| modelCard.approach | Learning approach (supervised, RL, etc.)[^10] | `approach VARCHAR(50)` |
| modelCard.architecture | Layers, attention mechanisms, config[^10] | `architecture` JSONB |
| modelCard.inputs / outputs | Model input/output specification[^10] | `inputs` JSONB, `outputs` JSONB |
| modelCard.quantitativeAnalysis.performanceMetrics | Evaluation metrics and graphics[^10] | `performance_metrics` JSONB |
| modelCard.considerations | Ethical considerations, limitations, use cases, users[^10] | `considerations` JSONB |
| datasets | Training/testing datasets as CycloneDX data components[^10] | `datasets` table (linked components) |
| datasets.provenance (expanded 1.7) | Training dataset lineage/provenance detail[^22] | `dataset_provenance` table |
| trainingEvaluation (new 1.7) | Framework versions used in training/inference[^22] | `training_environment` JSONB |
| purl (model identifier) | e.g. `pkg:huggingface/distilbert-base-uncased@043235d...`[^10] | `purl TEXT` |
| hardwareSoftwareFrameworks | Hardware, GPUs, OS, libraries used in training/eval[^10] | `training_infra` table |
| environmentalImpact | Energy/water cost of training[^10] | `environmental_impact` JSONB |

### 19.6 MBOM (Manufacturing Bill of Materials)

| Attribute | Description | Postgres Column |
|---|---|---|
| formulation.formula | Set of workflows describing how a component was manufactured[^15][^28] | `formulas` table, FK `bom_id` |
| formula.workflows | Phases: test, build, deliver, deploy[^15][^28] | `workflows` table, FK `formula_id` |
| workflow.tasks / steps | Ordered dependent tasks within a workflow[^15][^28] | `tasks` table, `steps` table |
| workflow.components/services (observed) | Components/services used or produced during the process[^15] | `workflow_components` join table |
| as-built vs. as-designed component list | MBOM asserts what was actually produced, vs. BOM design intent[^14] | `as_built BOOLEAN` flag on component record |

### 19.7 OBOM (Operations Bill of Materials)

| Attribute | Description | Postgres Column |
|---|---|---|
| component.occurrences | Locations/environments where a component is present at runtime[^25] | `component_occurrences` table |
| formulation (deployment phase) | Deployment/configuration workflow captured in formula/workflow objects[^15][^28] | `formulas`/`workflows` (phase = 'deploy') |
| properties (operational config) | Free-form operational configuration metadata[^32] | `component_properties` (key/value) |
| compositions.aggregate | Completeness of the operational inventory[^27] | `compositions.aggregate VARCHAR(20)` |

### 19.8 VDR (Vulnerability Disclosure Report)

| Attribute | Description | Postgres Column |
|---|---|---|
| vulnerabilities.id | CVE/BDSA/GHSA identifier[^24][^17] | `vuln_id VARCHAR(50)` |
| vulnerabilities.source | Source database (NVD, OSV, BDSA)[^24] | `source_name VARCHAR(50)` |
| ratings.method / vector | Scoring system (CVSSv31, CVSSv4) and full vector string[^24] | `cvss_method VARCHAR(20)`, `cvss_vector TEXT` |
| ratings.score / severity | Numeric score and severity tier[^24][^17] | `score NUMERIC(3,1)`, `severity VARCHAR(20)` |
| cwes | Common Weakness Enumeration reference(s)[^24] | `cwes` table (many-to-many) |
| description / detail | Vulnerability narrative[^24][^17] | `detail TEXT` |
| recommendation | Actionable remediation guidance[^17] | `recommendation TEXT` |
| workaround | Temporary mitigation guidance[^17] | `workaround TEXT` |
| proofOfConcept | Exploitation demonstration reference[^17] | `proof_of_concept TEXT` |
| compositions (VDR completeness) | Full/partial/unknown scope assertion[^17] | `compositions.aggregate` |
| signature (trust) | Signed VDR per NIST SP 800-161 best practice[^17] | `signature` table (alg, value, timestamp) |

### 19.9 VEX (Vulnerability Exploitability eXchange)

| Attribute | Description | Postgres Column |
|---|---|---|
| analysis.state | e.g. exploitable, not_affected, resolved, in_triage[^24][^19] | `vuln_state VARCHAR(20)` |
| analysis.justification | e.g. component_not_present, protected_by_mitigating_control[^19][^24] | `justification VARCHAR(50)` |
| analysis.response | will_not_fix, update, workaround_available, rollback[^19][^24] | `response VARCHAR(30)` |
| ratings (combined CVSS + OWASP Risk Rating) | Severity plus likelihood/impact context[^19] | `risk_rating` table |
| affects.ref / versions | bom-ref and version range affected[^19] | `vuln_affects` table |
| affected-range semantics (tightened 1.7) | Prevents asserting "not_affected" on a range that contains the actual fix[^22] | `version_range_start`, `version_range_end` |
| justification vocabulary alignment (1.7) | Aligned with CSAF VEX 2.0 vocabulary[^22] | `justification` enum constrained list |

### 19.10 CDXA (CycloneDX Attestations)

| Attribute | Description | Postgres Column |
|---|---|---|
| predicate (in-toto/SLSA aligned, tightened 1.7) | Structured claim about how an artifact was produced[^22][^21] | `predicate` JSONB |
| evidence (new object, 1.7) | Confidence score and identification technique for a component claim[^22] | `component_evidence` table |
| nested attestations | Build, source, and VEX attestations combined in one structure[^22] | `attestations` table with `parent_attestation_id` self-FK |
| signature | Cryptographic signature validating the attestation | `signature` table |

### 19.11 Citations (New Root Element, v1.7)

| Attribute | Description | Postgres Column |
|---|---|---|
| citations.source | Where BOM data originated (build system, tool, repository, manual input)[^4][^3] | `citation_source VARCHAR(100)` |
| citations.attributedTo | Person/org/process responsible for the data[^4] | `attributed_to_id` FK |
| citations.process | The process step that generated the enrichment[^4] | `process VARCHAR(100)` |

## 20. Cross-Reference Design for PostgreSQL Storage

Because every BOM type shares the same root schema (Section 17) and the same component object (Section 18), a normalized relational design uses one shared core with type-specific extension tables rather than eleven separate schemas:[^5][^1]

- **Core tables** (shared by all BOM types): `boms` (root envelope, Section 17), `components` (Section 18, with `component_type` discriminator), `dependencies`, `compositions`, `services`, `annotations`, `citations`.
- **Type-specific extension tables** (1:1 or 1:many with `components.bom_ref`, joined on the discriminator): `hardware_details` (HBOM), `service_saas_details` (SaaSBOM), `crypto_asset_details` (CBOM), `ml_model_details` + `datasets` (ML-BOM), `formulas`/`workflows`/`tasks`/`steps` (MBOM/OBOM), `vulnerabilities`/`vuln_ratings`/`vuln_analysis` (VDR/VEX), `attestations` (CDXA).
- Each extension table carries a foreign key back to `components.bom_ref` (or `boms.serial_number` for BOM-level constructs like formulation and vulnerabilities), preserving the CycloneDX `bom-ref` cross-referencing mechanism natively as relational foreign keys.[^25][^24]
- `bom_ref` should be indexed as the primary cross-reference key across all tables, mirroring how CycloneDX itself uses `bom-ref` to link components, dependencies, vulnerabilities, and formulation entries within a single document.[^24][^25]
- Store multi-version BOM history using the `serial_number` + `bom_version` composite key, consistent with CycloneDX's own versioning rule that the same serial number persists across revisions while `version` increments.[^23]

This design lets a single `components` row represent a software library, a hardware device, a firmware image, a cryptographic asset, or an ML model, with joins to the relevant extension table resolving the type-specific attributes — directly reflecting how CycloneDX itself unifies these BOM "views" into one schema.[^8][^1][^5]

---

## References

1. [CycloneDX - OWASP Developer Guide](https://devguide.owasp.org/en/05-implementation/02-dependencies/03-cyclonedx/) - CycloneDX is a Bill of Materials (BOM) standard that provides supply chain capabilities for cyber ri...

2. [CycloneDX Bill of Materials Specification (ECMA-424)](https://owasp.org/www-project-cyclonedx/) - CycloneDX is a full-stack Bill of Materials (BOM) standard that provides advanced supply chain capab...

3. [CycloneDX v1.7 Delivers Advanced Cryptography, ...](https://cyclonedx.org/news/cyclonedx-v1.7-released/) - New enhancements include: A standardized list of cryptographic algorithm families, enabling consiste...

4. [What's New in CycloneDX 1.7 | FOSSA Blog](https://fossa.com/blog/whats-new-cyclone-dx-1-7/) - Learn about the new features and improvements in CycloneDX 1.7, including new patent-related fields ...

5. [CycloneDX](https://docs.sbom.observer/learn/topics/cyclonedx) - CycloneDX serves as a comprehensive bill of materials specification tailored for today's software su...

6. [Authoritative Guide to SBOM](https://cyclonedx.org/guides/OWASP_CycloneDX-Authoritative-Guide-to-SBOM-en.pdf) - CycloneDX is a modern standard for the software supply chain. CycloneDX relies exclusively on JSON S...

7. [Hardware Bill of Materials (HBOM)](https://cyclonedx.org/capabilities/hbom/) - Introduction to HBOM. CycloneDX extends its capabilities to represent information about physical har...

8. [HBOM Guide: Hardware Bill of Materials for CRA Compliance](https://craevidence.com/cra-compliance/sbom/hbom) - CycloneDX handles both hardware and software components in a single document. You do not need a sepa...

9. [Inventory Management Use Case: Services](https://cyclonedx.org/use-cases/services/) - CycloneDX allows services to be described alongside traditional components in an SBOM, capturing the...

10. [Authoritative Guide to AI/ML-BOM](https://cyclonedx.org/guides/OWASP_CycloneDX-Authoritative-Guide-to-AI-ML-BOM-en.pdf) - The content in this guide results from the work of the CycloneDX AI/ML Working Group with continuous...

11. [AI-BOM: Understanding AI Bill of Materials Essentials](https://orca.security/resources/blog/ai-bom/) - A CycloneDX AI BOM is an ML-BOM emitted in the same document model as an SBOM, so one inventory can ...

12. [Cryptographic Bill of Materials (CBOM) Deep-Dive](https://postquantum.com/post-quantum/cryptographic-bill-of-materials-cbom/) - CycloneDX CBOM defines a category for related cryptographic material, which covers things like priva...

13. [IBM/CBOM: Cryptography Bill of Materials](https://github.com/IBM/CBOM) - CBOM is an extension of the CycloneDX SBOM standard. It integrates crypto assets as an additional 'c...

14. [CycloneDX - Manufacturing Bill of Materials (MBOM)](https://cyclonedx.captnemo.in/capabilities/mbom/) - CycloneDX can represent any type of software component, service, and the firmware and hardware devic...

15. [Authoritative Guide to MBOM](https://cyclonedx.org/guides/OWASP_CycloneDX-Authoritative-Guide-to-MBOM-en.pdf) - The Manufacturing Bill of Materials supports diverse manufacturing scenarios across different domain...

16. [CycloneDX/bom-examples](https://github.com/CycloneDX/bom-examples) - This repository contains example CycloneDX Bill of Materials (BOM) created from various open source ...

17. [Security Use Case: Vulnerability Disclosure Report](https://cyclonedx.org/use-cases/vulnerability-disclosure/) - Disclosure Reports (VDR) provide a structured and standardized way to communicate known and previous...

18. [Vulnerability Disclosure Report (VDR)](https://docs.sbom.observer/learn/topics/vdr) - A comprehensive exploration into the importance, structure, and integration of Vulnerability Disclos...

19. [Security Use Case: Vulnerability Exploitability](https://cyclonedx.org/use-cases/vulnerability-exploitability/) - CycloneDX extends far beyond VEX, It captures key attributes like risk ratings, reproducibility, and...

20. [Vulnerability Exploitability eXchange (VEX)](https://cyclonedx.org/capabilities/vex/) - Unlike general vulnerability disclosures, VEX focuses on whether a vulnerability in a component can ...

21. [What's New in CycloneDX 1.6? | FOSSA Blog](https://fossa.com/blog/whats-new-cyclonedx-1-6/) - The schema for CycloneDX has grown quite large (at 5673 lines in the 1.6 JSON schema), but, likewise...

22. [CycloneDX 1.7 Features Reviewed](https://safeguard.sh/resources/blog/cyclonedx-1-7-new-features-review) - CycloneDX 1.7 shipped in March 2026, and it is a quieter release than 1.6 in a good way. Where 1.6 i...

23. [CycloneDX v1.7 JSON Reference](https://cyclonedx.org/docs/latest) - Specifies the format of the BOM. This helps to identify the file as CycloneDX. Every BOM generated S...

24. [CycloneDX data fields](https://abb.app.blackduck.com/doc/Reporting/CyclonedxDataFields.html) - The CycloneDX SBOM provides enhanced vulnerability information in CycloneDX SBOM reports. This impro...

25. [Inventory Management Use Case: Software Components](https://cyclonedx.org/use-cases/software-components/) - CycloneDX empowers organizations to assert the identity of software components through standardized ...

26. [Dependency Relationship Compositions](https://cyclonedx.org/use-cases/compositions-dependencies/) - In CycloneDX, compositions for dependency relationships provide insight into the connections between...

27. [Component Assembly Compositions](https://cyclonedx.org/use-cases/compositions-component-assembly/) - Component assembly compositions in CycloneDX focus on the completeness of an individual component an...

28. [Specification Overview](https://cyclonedx.org/specification/overview/) - CycloneDX achieves this through the support of multiple formulas, workflows, tasks, and steps, which...

29. [CycloneDX Use Cases](https://cyclonedx.captnemo.in/use-cases/) - Identifying known vulnerabilities in components can be achieved through the use of three fields: cpe...

30. [Support CycloneDX 1.6 reports - Merge requests](https://gitlab.com/gitlab-org/gitlab/-/merge_requests/163562) - CycloneDX 1.6 JSON schema. Validates component name has a min length of 1 and max of 255. Inlines th...

31. [Security Use Case: Pedigree](https://cyclonedx.org/use-cases/pedigree/) - Pedigree captures the unique identity and evolution of a component, documenting its origin, modifica...

32. [Extended Use Case: Extensibility through CycloneDX Properties](https://cyclonedx.org/use-cases/cyclonedx-properties/) - This allows organizations to document unique attributes not covered by the predefined CycloneDX sche...

33. [Security Use Case: Identify Known Vulnerabilities](https://cyclonedx.org/use-cases/identify-known-vulnerabilities/) - CycloneDX supports multiple identity standards, including Common Platform Enumeration (CPE) and Pack...

34. [Authoritative Guide to CBOM](https://cyclonedx.org/guides/OWASP_CycloneDX-Authoritative-Guide-to-CBOM-en.pdf) - The BOM schema exposes a certificateState property which is an array of state objects. Each state ob...

