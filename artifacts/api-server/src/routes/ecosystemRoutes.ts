import { Router } from "express";
import {
  ProcurementEvaluationRequestSchema,
  CompositeSystemRequestSchema,
  CsafIngestRequestSchema,
} from "@workspace/api-zod";
import { evaluateProcurementVendor } from "../lib/procurementEngine";
import { assembleCompositeSystem } from "../lib/compositeEngine";
import { parseAndIngestCsafAdvisory } from "../lib/csafEngine";
import { generateB2BContractClauses } from "../lib/contractClauseEngine";

export const ecosystemRouter = Router();

// 1. Pre-Procurement Evaluation Endpoint (Art. 18 & 19)
ecosystemRouter.post("/procurement/evaluate", (req, res) => {
  const parseResult = ProcurementEvaluationRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid procurement evaluation request", issues: parseResult.error.issues });
    return;
  }
  const result = evaluateProcurementVendor(parseResult.data);
  res.json(result);
});

// 2. Article 21 / 22 substantial modification — MOVED.
// Now POST /api/conformity/deemed-manufacturer/assess (routes/deemedManufacturer.ts).
// The endpoint that lived here computed a determination, persisted nothing, and
// hashed a hardcoded timestamp so identical facts always produced an identical
// "certificate hash". It also asserted a "Recital 34 safe harbour" that does not
// exist — Recital 34 concerns a manufacturer's due diligence over third-party
// components and confers nothing on an integrator.

// 3. Composite Machine Assembly & Multi-DoC Validator (Art. 20)
ecosystemRouter.post("/composite/assemble", (req, res) => {
  const parseResult = CompositeSystemRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid composite system request", issues: parseResult.error.issues });
    return;
  }
  const result = assembleCompositeSystem(parseResult.data);
  res.json(result);
});

// 4. OASIS CSAF 2.0 & OpenVEX Ingestion Endpoint (Art. 14)
ecosystemRouter.post("/csaf/ingest", (req, res) => {
  const parseResult = CsafIngestRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid CSAF ingestion request", issues: parseResult.error.issues });
    return;
  }
  const result = parseAndIngestCsafAdvisory(parseResult.data);
  res.json(result);
});

// 5. B2B Recital 34 Contractual SLA Clauses
ecosystemRouter.get("/contracts/clauses", (_req, res) => {
  const clauses = generateB2BContractClauses();
  res.json(clauses);
});
