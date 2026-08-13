# Database Audit — 2026-08-13

Evaluation of Drizzle ORM schema design, PostgreSQL / pgvector query efficiency, index coverage, and relational integrity in `lib/db`.

## Executive Summary

`lib/db` defines a comprehensive PostgreSQL schema with 45+ tables supporting vector embeddings (`pgvector`), assessment checklists, PSIRT vulnerability correlation, and CMS content storage. The schema makes good use of foreign keys and primary keys, but lacks relational indices on foreign key join columns and vector index parameters.

---

## Findings

**[High] Missing Foreign Key Indices on Frequently Filtered Columns** — [`lib/db/src/schema.ts:L120-L450`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/lib/db/src/schema.ts#L120-L450)
- **Evidence**: `assessment_id`, `product_id`, `organization_id`, and `vulnerability_id` columns in assessment checklist item and PSIRT handling tables lack explicit `index()` declarations.
- **Impact**: Queries filtering by assessment or product result in full sequential table scans as assessment table size grows.
- **Fix**: Add Drizzle index declarations: `index("idx_checklist_assessment_id").on(table.assessmentId)`.

**[Medium] Missing HNSW Vector Index on Knowledge Embedding Table** — [`lib/db/src/schema.ts:L800-L850`](file:///Users/jimmcknney/Downloads/OXOT_Website_Conformity_Application/lib/db/src/schema.ts#L800-L850)
- **Evidence**: `vector(1536)` embedding columns lack HNSW/IVFFlat index definitions.
- **Impact**: Similarity searches (cosine distance queries) require full vector scans across all knowledge records.
- **Fix**: Add HNSW index: `index("idx_vector_hnsw").using("hnsw", table.embedding.op("vector_cosine_ops"))`.

---

## What's Already Solid
- Strong relational integrity with cascading deletes on child entity tables.
- Proper timestamp tracking (`createdAt`, `updatedAt`) across core tables.
- Clean TypeScript schema export types via Drizzle `InferSelectModel`.
