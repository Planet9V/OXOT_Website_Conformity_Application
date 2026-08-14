import { Router } from "express";
import {
  ProcurementEvaluationRequestSchema,
  Article21AssessmentRequestSchema,
  CompositeSystemRequestSchema,
  CsafIngestRequestSchema,
} from "@workspace/api-zod";
import { evaluateProcurementVendor } from "../lib/procurementEngine";
import { assessArticle21SubstantialModification } from "../lib/article21Engine";
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

// 2. Article 21 Substantial Modification Assessment Endpoint
ecosystemRouter.post("/article21/assess", (req, res) => {
  const parseResult = Article21AssessmentRequestSchema.safeParse(req.body);
  if (!parseResult.success) {
    res.status(400).json({ error: "Invalid Article 21 request", issues: parseResult.error.issues });
    return;
  }
  const result = assessArticle21SubstantialModification(parseResult.data);
  res.json(result);
});

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
